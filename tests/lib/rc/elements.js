/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — codes, roles and clause names; the words a person reads come from the app's language file (rc.*) */
/**
 * elements.js — reinforced concrete beams, columns, slabs and walls and the bars in them (cc-rc, 0.9 RC.1, session rc-09). No DOM, no
 * words: errors and checks are codes + numbers; the app words them. Millimetres, z up. Results are for checking by an engineer.
 *
 *   cleanSettings(s)                    → settings (design code, materials, exposure, stock length, lap rules)
 *   cleanElement(e, bars)               → { ok, element } | { ok: false, code, vars }   untrusted input, field by field
 *   elementBars(el, ctx)                → { groups, laps, anchors, body, info }          every bar of the element, placed
 *   checkElement(el, res, ctx)          → [check]                                         cover, spacing, steel, laps, anchorage
 *   ctx = { bars (Map name → bar, rebar.js BARS), settings, elements (all), footings (all) }
 *   group = { role, bar, shape, dims, length, rc, polys: [[pts]], count }   one bar type of the element, each poly one bar's vertices
 *   lap   = { role, bar, at (mm along the run), req, provided, auto, clause, terms, kind 'tension' | 'compression' }
 *   check = { id, code, status 'ok' | 'fail' | 'note', severity 'error' | 'warning' | 'note', clause, req?, found?, unit?, vars }
 *
 * Beam { a, b: top-of-beam centre line ends; w, h; cover (clear, to the stirrups); top, bot { bar, n }; skin { bar, n per face };
 *        stir { bar, hook 135 | 90, s (middle), ends { len, s }, first }; ends { top, bot: 'hook' | 'straight' };
 *        sup [start, end] support length (0 = not known; a column of this model at an end is found by itself); lap { top, bot } (0 = auto) }
 *   Bars run between the supports' far faces less cover (or the beam ends less cover), hooked or straight; longer than the stock
 *   length → lapped at equal steps (every bar lapped at the same section: ACI Class B unless set, EN α6 for 100 %).
 *   Stirrups are closed ties with two 135° hooks (or 90°), first at `first` from each support face, at ends.s over ends.len, s between.
 * Column { x, y, z0, z1, w (local x), d (local y), rot, cover, long { bar, nw, nd } (bars on a w face and a d face, corners counted
 *        on both), ties { bar, hook, s, ends { len, s }, first }; top: 'splice' (bars go on a lap length above z1 for the column
 *        above) | 'hook' (90° hooks into the floor) | 'straight'; lap (0 = auto) }
 * Slab { x, y (middle), L (local x), B, rot, z (top), t, cover { bot, top }; bot { u, v } and top { on, u, v } mats ({ bar, s });
 *        edges { on, bar, s } U-bars round the free edges; open [{ x, y (middle, from the slab's middle), w, h }]; trim { bar }; lap }
 * Wall { a, b ([x, y], the wall's centre line), z0, z1, t, cover, faces 1 | 2, u (horizontal) and v (vertical)
 *        { bar, s }; open [{ at (from a), sill (from z0), w, h }]; ends { on, bar } U-bars at both ends; top 'splice' | 'straight';
 *        trim { bar }; lap }
 * Openings: bars crossing one (within cover) stop at cover from its edge; trimmers each side carry half the area cut, in the same
 * layer, an anchorage length past each corner — DetailCraft's starting rule, not a code clause (said in the check list as a note).
 */
import { develop, hookDevelop, lap as lapLen, roundUp, fctm, ACI, EC2 } from './anchorage.js';
import { bend, hookTail, outDims, cutLength, closedTie } from './bars.js';

export const KINDS = ['beam', 'column', 'slab', 'wall'];
export const SETTINGS_DEFAULTS = Object.freeze({ code: 'aci', fc: 28, fy: 420, lambda: 1, coating: 'none', exposure: 'interior', stock: 12000, lapClass: 'B', colLap: 'compression', gammaC: 1.5, gammaS: 1.15, alphaCt: 1.0 });

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const r1 = (v) => Math.round(v * 10) / 10;
const num = (v, lo, hi) => { const n = Number(v); return Number.isFinite(n) && n >= lo && n <= hi ? n : null; };
const text = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, '').trim().slice(0, max);

// ---------------------------------------------------------------- settings and elements (untrusted input)

export function cleanSettings(s = {}) {
  const o = { ...SETTINGS_DEFAULTS };
  if (!s || typeof s !== 'object') return o;
  if (s.code === 'aci' || s.code === 'ec2') o.code = s.code;
  for (const [k, lo, hi] of [['fc', 10, 120], ['fy', 200, 700], ['lambda', 0.75, 1], ['stock', 3000, 24000], ['gammaC', 1, 2], ['gammaS', 1, 1.5], ['alphaCt', 0.8, 1]]) { const v = num(s[k], lo, hi); if (v !== null) o[k] = v; }
  if (['none', 'epoxy', 'galvanized'].includes(s.coating)) o.coating = s.coating;
  if (['interior', 'exposed', 'earth'].includes(s.exposure)) o.exposure = s.exposure;
  if (s.lapClass === 'A' || s.lapClass === 'B') o.lapClass = s.lapClass;
  if (s.colLap === 'compression' || s.colLap === 'tension') o.colLap = s.colLap;
  return o;
}

export const DEFAULTS = Object.freeze({
  beam: { w: 300, h: 600, cover: 40, top: { bar: '#6', n: 2 }, bot: { bar: '#7', n: 3 }, skin: { bar: '#4', n: 0 }, stir: { bar: '#3', hook: 135, s: 250, ends: { len: 1200, s: 125 }, first: 50 }, ends: { top: 'hook', bot: 'straight' }, sup: [0, 0], lap: { top: 0, bot: 0 } },
  column: { w: 400, d: 400, rot: 0, cover: 40, long: { bar: '#8', nw: 3, nd: 3 }, ties: { bar: '#3', hook: 135, s: 300, ends: { len: 600, s: 150 }, first: 50 }, top: 'splice', lap: 0 },
  slab: { rot: 0, t: 200, cover: { bot: 20, top: 20 }, bot: { u: { bar: '#4', s: 200 }, v: { bar: '#4', s: 200 } }, top: { on: true, u: { bar: '#4', s: 300 }, v: { bar: '#4', s: 300 } }, edges: { on: false, bar: '#4', s: 300 }, open: [], trim: { bar: '#5' }, lap: 0 },
  wall: { t: 250, cover: 25, faces: 2, u: { bar: '#4', s: 300 }, v: { bar: '#5', s: 300 }, open: [], ends: { on: true, bar: '#4' }, top: 'straight', trim: { bar: '#5' }, lap: 0 },
});

const vec = (v, n) => (Array.isArray(v) && v.length === n && v.every((x) => Number.isFinite(Number(x)) && Math.abs(Number(x)) <= 1e7) ? v.map(Number) : null);
const bad = (code, vars = {}) => ({ ok: false, code, vars });

/** A bar spec { bar, s } or { bar, n }. */
function barSpec(x, bars, keys, def) {
  const o = { bar: String(x?.bar ?? def.bar) };
  if (!bars.has(o.bar)) return null;
  for (const [k, lo, hi] of keys) { const v = num(x?.[k] ?? def[k], lo, hi); if (v === null) return null; o[k] = k === 'n' || k === 'nw' || k === 'nd' ? Math.round(v) : v; }
  return o;
}
function zones(x, def) {
  const o = { bar: String(x?.bar ?? def.bar), hook: Number(x?.hook ?? def.hook) === 90 ? 90 : 135 };
  const s = num(x?.s ?? def.s, 40, 1000), es = num(x?.ends?.s ?? def.ends.s, 40, 1000), el = num(x?.ends?.len ?? def.ends.len, 0, 1e5), f = num(x?.first ?? def.first, 10, 500);
  if ([s, es, el, f].some((v) => v === null)) return null;
  return { ...o, s, ends: { len: el, s: es }, first: f };
}

export function cleanElement(e, bars) {
  if (!e || typeof e !== 'object' || !KINDS.includes(e.kind)) return bad('kind');
  const D = DEFAULTS[e.kind];
  const out = { kind: e.kind, name: text(e.name, 40) };
  if (e.bars === 'imported') out.bars = 'imported';   // an IFC host: its bars came in as loose bars, none are generated
  if (e.kind === 'beam') {
    const a = vec(e.a, 3), b = vec(e.b, 3);
    if (!a || !b) return bad('position');
    if (len(sub(b, a)) < 300) return bad('short', { min: 300 });
    if (Math.abs(norm(sub(b, a))[2]) > 0.95) return bad('vertical-beam');
    const w = num(e.w ?? D.w, 100, 3000), h = num(e.h ?? D.h, 100, 5000), c = num(e.cover ?? D.cover, 10, 150);
    if (w === null || h === null) return bad('size'); if (c === null) return bad('cover');
    const top = barSpec(e.top, bars, [['n', 2, 30]], D.top), bot = barSpec(e.bot, bars, [['n', 2, 30]], D.bot), skin = barSpec(e.skin, bars, [['n', 0, 12]], D.skin);
    const stir = zones(e.stir, D.stir);
    if (!top || !bot || !skin) return bad('bars'); if (!stir || !bars.has(stir.bar)) return bad('stirrups');
    const ends = { top: e.ends?.top === 'straight' ? 'straight' : e.ends?.top === 'hook' ? 'hook' : D.ends.top, bot: e.ends?.bot === 'hook' ? 'hook' : e.ends?.bot === 'straight' ? 'straight' : D.ends.bot };
    const sup = [0, 1].map((i) => num(e.sup?.[i] ?? 0, 0, 5000) ?? 0);
    const lp = { top: num(e.lap?.top ?? 0, 0, 20000) ?? 0, bot: num(e.lap?.bot ?? 0, 0, 20000) ?? 0 };
    Object.assign(out, { a, b, w, h, cover: c, top, bot, skin, stir, ends, sup, lap: lp });
  } else if (e.kind === 'column') {
    const x = num(e.x, -1e7, 1e7), y = num(e.y, -1e7, 1e7), z0 = num(e.z0, -1e6, 1e6), z1 = num(e.z1, -1e6, 1e6);
    if ([x, y, z0, z1].some((v) => v === null)) return bad('position');
    if (z1 - z0 < 300) return bad('short', { min: 300 });
    const w = num(e.w ?? D.w, 150, 3000), d = num(e.d ?? D.d, 150, 3000), c = num(e.cover ?? D.cover, 10, 150), rot = num(e.rot ?? 0, -360, 360);
    if (w === null || d === null) return bad('size'); if (c === null) return bad('cover'); if (rot === null) return bad('position');
    const long = barSpec(e.long, bars, [['nw', 2, 20], ['nd', 2, 20]], D.long), ties = zones(e.ties, D.ties);
    if (!long) return bad('bars'); if (!ties || !bars.has(ties.bar)) return bad('stirrups');
    const top = ['splice', 'hook', 'straight'].includes(e.top) ? e.top : D.top;
    Object.assign(out, { x, y, z0, z1, w, d, rot, cover: c, long, ties, top, lap: num(e.lap ?? 0, 0, 20000) ?? 0 });
  } else if (e.kind === 'slab') {
    const x = num(e.x, -1e7, 1e7), y = num(e.y, -1e7, 1e7), z = num(e.z, -1e6, 1e6), L = num(e.L, 300, 1e5), B = num(e.B, 300, 1e5), t = num(e.t ?? D.t, 80, 3000), rot = num(e.rot ?? 0, -360, 360);
    if ([x, y, z, rot].some((v) => v === null)) return bad('position'); if (L === null || B === null || t === null) return bad('size');
    const cb = num(e.cover?.bot ?? D.cover.bot, 10, 150), ct = num(e.cover?.top ?? D.cover.top, 10, 150);
    if (cb === null || ct === null) return bad('cover');
    const S = [['s', 50, 1000]];
    const bot = { u: barSpec(e.bot?.u, bars, S, D.bot.u), v: barSpec(e.bot?.v, bars, S, D.bot.v) };
    const top = { on: e.top?.on === undefined ? D.top.on : !!e.top.on, u: barSpec(e.top?.u, bars, S, D.top.u), v: barSpec(e.top?.v, bars, S, D.top.v) };
    const edges = { on: !!e.edges?.on, ...(barSpec(e.edges, bars, S, D.edges) || {}) };
    const trim = { bar: bars.has(String(e.trim?.bar)) ? String(e.trim.bar) : D.trim.bar };
    if (!bot.u || !bot.v || !top.u || !top.v || !edges.bar) return bad('bars');
    const open = [];
    for (const o of (Array.isArray(e.open) ? e.open : []).slice(0, 50)) {
      const ox = num(o?.x, -1e5, 1e5), oy = num(o?.y, -1e5, 1e5), ow = num(o?.w, 50, 1e5), oh = num(o?.h, 50, 1e5);
      if ([ox, oy, ow, oh].some((v) => v === null)) return bad('opening');
      if (Math.abs(ox) + ow / 2 > L / 2 - cb || Math.abs(oy) + oh / 2 > B / 2 - cb) return bad('opening-fit');
      open.push({ x: ox, y: oy, w: ow, h: oh });
    }
    Object.assign(out, { x, y, z, L, B, t, rot, cover: { bot: cb, top: ct }, bot, top, edges, open, trim, lap: num(e.lap ?? 0, 0, 20000) ?? 0 });
  } else {
    const a = vec(e.a, 2), b = vec(e.b, 2), z0 = num(e.z0, -1e6, 1e6), z1 = num(e.z1, -1e6, 1e6);
    if (!a || !b || z0 === null || z1 === null) return bad('position');
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 300 || z1 - z0 < 300) return bad('short', { min: 300 });
    const t = num(e.t ?? D.t, 100, 3000), c = num(e.cover ?? D.cover, 10, 150);
    if (t === null) return bad('size'); if (c === null) return bad('cover');
    const S = [['s', 50, 1000]];
    const u = barSpec(e.u, bars, S, D.u), v = barSpec(e.v, bars, S, D.v);
    if (!u || !v) return bad('bars');
    const Lw = Math.hypot(b[0] - a[0], b[1] - a[1]), H = z1 - z0;
    const open = [];
    for (const o of (Array.isArray(e.open) ? e.open : []).slice(0, 50)) {
      const at = num(o?.at, 0, 1e5), sill = num(o?.sill, 0, 1e5), ow = num(o?.w, 50, 1e5), oh = num(o?.h, 50, 1e5);
      if ([at, sill, ow, oh].some((x) => x === null)) return bad('opening');
      if (at < c || at + ow > Lw - c || sill + oh > H - c) return bad('opening-fit');
      open.push({ at, sill, w: ow, h: oh });
    }
    const ends = { on: e.ends?.on === undefined ? D.ends.on : !!e.ends.on, bar: bars.has(String(e.ends?.bar)) ? String(e.ends.bar) : D.ends.bar };
    Object.assign(out, { a, b, z0, z1, t, cover: c, faces: Number(e.faces) === 1 ? 1 : 2, u, v, open, ends, top: e.top === 'splice' ? 'splice' : 'straight', trim: { bar: bars.has(String(e.trim?.bar)) ? String(e.trim.bar) : D.trim.bar }, lap: num(e.lap ?? 0, 0, 20000) ?? 0 });
  }
  return { ok: true, element: out };
}

// ---------------------------------------------------------------- placing bars

/** Bar centres evenly over a width w, spacing no more than s (at least 2). */
export function layout(w, s) { const n = Math.max(2, Math.ceil(w / s - 1e-9) + 1); return { n, spacing: w / (n - 1) }; }
/** n positions evenly from a to b (n ≥ 2). */
const spread = (a, b, n) => (n <= 1 ? [(a + b) / 2] : Array.from({ length: n }, (_, i) => a + (b - a) * i / (n - 1)));

/** Station list for stirrups / ties between x0 and x1: end zones at es over zl, the middle at s or less. */
export function stations(x0, x1, zl, es, s) {
  if (x1 < x0) return [];
  const span = x1 - x0;
  if (span <= 2 * zl) { const n = Math.max(2, Math.ceil(span / es - 1e-9) + 1); return spread(x0, x1, n); }
  const nEnd = Math.max(1, Math.floor(zl / es + 1e-9));
  const a = [], b = [];
  for (let i = 0; i <= nEnd; i++) { a.push(x0 + i * es); b.push(x1 - i * es); }
  const m0 = a[a.length - 1], m1 = b[b.length - 1];
  const gap = m1 - m0, nm = Math.ceil(gap / s - 1e-9);
  const mid = [];
  for (let i = 1; i < nm; i++) mid.push(m0 + gap * i / nm);
  return [...a, ...mid, ...b.reverse()];
}

/** Splits a run [x0, x1] (plus hook legs h0, h1 at its ends, out to out) into pieces no longer than stock, lapped by lapL. */
export function pieces(x0, x1, stock, lapL, h0 = 0, h1 = 0) {
  const run = x1 - x0, total = run + h0 + h1;
  if (total <= stock + 1e-6 || lapL >= stock - 1) return [{ s: x0, e: x1, first: true, last: true }];
  let k = 2;
  while (k < 200 && (total + (k - 1) * lapL) / k > stock + 1e-6) k++;
  const step = (run + (k - 1) * lapL) / k;   // each piece's straight length (the end pieces then add their hook legs)
  const out = [];
  for (let i = 0; i < k; i++) { const s = x0 + i * (step - lapL); out.push({ s, e: i === k - 1 ? x1 : s + step, first: i === 0, last: i === k - 1 }); }
  return out;
}

function collector(bars, settings) {
  const groups = new Map(), list = [];
  return {
    list,
    add(role, barName, shape, pts, rc, meta = {}) {
      const b = bars.get(barName);
      const dims = outDims(shape, pts, b, rc);
      const length = cutLength(shape, pts, b, rc);
      const key = [role, barName, shape, ...Object.values(dims).map((v) => Math.round(v)), Math.round(length)].join('|');
      let g = groups.get(key);
      if (!g) { g = { role, bar: barName, shape, dims, length, rc, polys: [], count: 0, ...meta }; groups.set(key, g); list.push(g); }
      g.polys.push(pts); g.count++;
      return g;
    },
  };
}

/** The design-code options of a bar in a situation (anchorage.js `o`). */
export function codeOpts(settings, extra = {}) {
  return { code: settings.code, fc: settings.fc, fy: settings.fy, lambda: settings.lambda, coating: settings.coating, gammaC: settings.gammaC, gammaS: settings.gammaS, alphaCt: settings.alphaCt, lapClass: settings.lapClass, ...extra };
}

/** Beam frame: ex along the beam, ey across (horizontal), ez up-ish. */
export function beamFrame(el) {
  const ex = norm(sub(el.b, el.a));
  const ey = norm(cross([0, 0, 1], ex)), ez = cross(ex, ey);
  return { o: el.a, ex, ey, ez, L: len(sub(el.b, el.a)) };
}
export function columnFrame(el) {
  const r = el.rot * Math.PI / 180;
  return { o: [el.x, el.y, el.z0], ex: [Math.cos(r), Math.sin(r), 0], ey: [-Math.sin(r), Math.cos(r), 0], ez: [0, 0, 1], H: el.z1 - el.z0 };
}
/** Panel frame of a slab or a wall: O the corner on face 0, eu / ev in the plane, en through the thickness, U × V × t. */
export function panelFrame(el) {
  if (el.kind === 'slab') {
    const r = el.rot * Math.PI / 180, eu = [Math.cos(r), Math.sin(r), 0], ev = [-Math.sin(r), Math.cos(r), 0];
    const O = add(add([el.x, el.y, el.z - el.t], mul(eu, -el.L / 2)), mul(ev, -el.B / 2));
    return { O, eu, ev, en: [0, 0, 1], U: el.L, V: el.B, t: el.t, openings: el.open.map((o) => [el.L / 2 + o.x - o.w / 2, el.B / 2 + o.y - o.h / 2, el.L / 2 + o.x + o.w / 2, el.B / 2 + o.y + o.h / 2]) };
  }
  const a = [el.a[0], el.a[1], 0], b = [el.b[0], el.b[1], 0];
  const eu = norm(sub(b, a)), ev = [0, 0, 1], en = cross(eu, ev);
  const O = add([el.a[0], el.a[1], el.z0], mul(en, -el.t / 2));
  return { O, eu, ev, en, U: len(sub(b, a)), V: el.z1 - el.z0, t: el.t, openings: el.open.map((o) => [o.at, o.sill, o.at + o.w, o.sill + o.h]) };
}

/** A column of the model whose footprint holds point p (and whose height range holds p.z): the support at a beam's end. */
function columnAt(p, elements) {
  for (const c of elements) {
    if (c.kind !== 'column') continue;
    if (p[2] < c.z0 - 1 || p[2] > c.z1 + 1) continue;
    const F = columnFrame(c), d = sub(p, F.o);
    if (Math.abs(dot(d, F.ex)) <= c.w / 2 + 1 && Math.abs(dot(d, F.ey)) <= c.d / 2 + 1) return c;
  }
  return null;
}
/** The faces of a column along a direction, measured from point p: [near, far] (t0 < t1). */
function columnSpan(c, p, ex) {
  const F = columnFrame(c);
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j]) => add(add([c.x, c.y, p[2]], mul(F.ex, i * c.w / 2)), mul(F.ey, j * c.d / 2)));
  const ts = corners.map((q) => dot(sub(q, p), ex));
  return [Math.min(...ts), Math.max(...ts)];
}

export function elementBars(el, ctx) {
  const bars = ctx.bars, S = ctx.settings;
  const C = collector(bars, S);
  const laps = [], anchors = [], info = {};
  if (el.bars === 'imported') return { groups: [], laps, anchors, body: bodyOf(el), info: { imported: true } };
  const hookLegOut = (b) => (b.set === 'bs' ? b.P : b.bendD / 2 + b.db + 12 * b.db);   // ACI 318-19 Table 25.3.1 / BS 8666:2020 P, out to out
  if (el.kind === 'beam') {
    const F = beamFrame(el), { ex, ey, ez, L } = F;
    const st = bars.get(el.stir.bar), c = el.cover;
    const P = (x, y, z) => add(add(add(el.a, mul(ex, x)), mul(ey, y)), mul(ez, z));
    // supports: a column of the model at an end, else the length typed
    const supInfo = [0, 1].map((i) => {
      const p = i ? el.b : el.a, col = columnAt(p, ctx.elements || []);
      if (col) {
        const [t0, t1] = columnSpan(col, el.a, ex);   // along the beam from its start
        return i ? { col: col.id, near: t0, far: t1, len: t1 - t0 } : { col: col.id, near: t1, far: t0, len: t1 - t0 };
      }
      return el.sup[i] > 0 ? { near: i ? L - el.sup[i] : el.sup[i], far: i ? L : 0, len: el.sup[i] } : { near: i ? L : 0, far: i ? L : 0, len: 0 };
    });
    info.supports = supInfo;
    const x0 = supInfo[0].far + c + st.db, x1 = supInfo[1].far - c - st.db;   // bar ends (outside of a hook leg), inside the stirrups' cover line
    const layer = (role, spec, zc, hookDir) => {
      const b = bars.get(spec.bar);
      const yMax = el.w / 2 - c - st.db - b.db / 2;
      const ys = spread(-yMax, yMax, spec.n);
      const topBar = role === 'top' && el.h - (c + st.db + b.db / 2) > 300;   // ACI ψt / EN poor bond: more than 300 mm of concrete below
      const clear = spec.n > 1 ? (2 * yMax) / (spec.n - 1) - b.db : Infinity;
      const o = codeOpts(S, { top: topBar, cover: c + st.db, clear, confined: true });
      const lapReq = lapLen(b, { ...o, lapPct: 100 });
      const lapUse = el.lap[role] > 0 ? el.lap[role] : roundUp(lapReq.value);
      const hk = el.ends[role] === 'hook';
      const room = el.h - 2 * c - 2 * st.db - b.db;
      const legV = hk ? Math.min(hookLegOut(b), room) - b.db / 2 : 0;   // vertex to end
      const rcB = bend(b, 'main').rc;
      const parts = pieces(x0, x1, S.stock, lapUse, hk ? legV + b.db / 2 : 0, hk ? legV + b.db / 2 : 0);
      parts.forEach((pc, k) => {
        const shape = hk && (pc.first || pc.last) ? (pc.first && pc.last ? 'U' : 'L') : 'S';
        for (const y of ys) {
          const yy = y + (k % 2 ? -Math.sign(y || 1) * b.db : 0);   // a lapped piece sits beside the one it laps (toward the middle)
          const pts = [];
          if (hk && pc.first) pts.push(P(pc.s + b.db / 2, yy, zc + hookDir * legV), P(pc.s + b.db / 2, yy, zc));
          else pts.push(P(pc.s, yy, zc));
          if (hk && pc.last) pts.push(P(pc.e - b.db / 2, yy, zc), P(pc.e - b.db / 2, yy, zc + hookDir * legV));
          else pts.push(P(pc.e, yy, zc));
          if (shape === 'L' && pc.first) pts.reverse();   // the main leg first, the hook at its far end (as rebar.js draws L)
          C.add(role, spec.bar, shape, pts, rcB, { piece: k });
        }
        if (!pc.last) laps.push({ role, bar: spec.bar, at: r1(pc.e - lapUse / 2), req: lapReq.value, provided: lapUse, auto: !(el.lap[role] > 0), clause: lapReq.clause, terms: lapReq.terms, kind: 'tension', noLap: lapReq.noLap });
      });
      // anchorage into each support
      for (const i of [0, 1]) {
        const s = supInfo[i];
        const req = hk ? hookDevelop(b, o) : develop(b, o);
        const avail = s.len > 0 ? s.len - c - st.db : null;
        anchors.push({ role, end: i, bar: spec.bar, req: req.value, provided: avail, hooked: hk, clause: req.clause, terms: req.terms, col: s.col || null, legShort: hk && hookLegOut(b) > room + 1e-6 });
      }
      info[role] = { ys, z: zc, clear, bar: spec.bar };
    };
    const bb = bars.get(el.bot.bar), tb = bars.get(el.top.bar);
    layer('bot', el.bot, -el.h + c + st.db + bb.db / 2, 1);
    layer('top', el.top, -c - st.db - tb.db / 2, -1);
    if (el.skin.n > 0) {
      const sb = bars.get(el.skin.bar), y = el.w / 2 - c - st.db - sb.db / 2;
      const zs = spread(-el.h + c + st.db + bb.db, -c - st.db - tb.db, el.skin.n + 2).slice(1, -1);
      for (const z of zs) for (const yy of [-y, y]) C.add('skin', el.skin.bar, 'S', [P(x0, yy, z), P(x1, yy, z)], bend(sb, 'main').rc);
      info.skin = { zs };
    }
    // stirrups
    const rcS = bend(st, 'tie').rc, tail = hookTail(st, el.stir.hook, S.code, 'tie');
    const wc = el.w - 2 * c - st.db, hc = el.h - 2 * c - st.db;
    const xs = stations(supInfo[0].near + el.stir.first, supInfo[1].near - el.stir.first, el.stir.ends.len, el.stir.ends.s, el.stir.s);
    for (const x of xs) {
      const pts = closedTie(P(x, 0, -el.h / 2), ex, ey, ez, wc, hc, tail.value + rcS * Math.tan((el.stir.hook === 90 ? 45 : 67.5) * Math.PI / 180), st.db);
      C.add('stir', el.stir.bar, 'T', pts, rcS);
    }
    info.stations = xs; info.tail = tail; info.d = el.h - c - st.db - bb.db / 2;
  } else if (el.kind === 'column') {
    const F = columnFrame(el), { ex, ey, ez, H } = F;
    const tb = bars.get(el.ties.bar), lb = bars.get(el.long.bar), c = el.cover;
    const P = (x, y, z) => add(add(add(F.o, mul(ex, x)), mul(ey, y)), mul(ez, z));
    const xm = el.w / 2 - c - tb.db - lb.db / 2, ym = el.d / 2 - c - tb.db - lb.db / 2;
    const pos = [];
    for (const x of spread(-xm, xm, el.long.nw)) { pos.push([x, -ym]); pos.push([x, ym]); }
    for (const y of spread(-ym, ym, el.long.nd).slice(1, -1)) { pos.push([-xm, y]); pos.push([xm, y]); }
    const clearW = el.long.nw > 1 ? 2 * xm / (el.long.nw - 1) - lb.db : Infinity, clearD = el.long.nd > 1 ? 2 * ym / (el.long.nd - 1) - lb.db : Infinity;
    const o = codeOpts(S, { cover: c + tb.db, clear: Math.min(clearW, clearD), confined: true, compression: S.colLap === 'compression' });
    const lapReq = lapLen(lb, { ...o, lapPct: 100 });
    const lapUse = el.lap > 0 ? el.lap : roundUp(lapReq.value);
    const rcB = bend(lb, 'main').rc;
    const zTop = el.top === 'splice' ? H + lapUse : H - c - (el.top === 'hook' ? 0 : 0);
    const legV = el.top === 'hook' ? hookLegOut(lb) - lb.db / 2 : 0;
    const parts = pieces(0, zTop, S.stock, lapUse, 0, legV);
    parts.forEach((pc, k) => {
      for (const [x, y] of pos) {
        const inward = norm([-(x || 1e-9), -(y || 1e-9), 0]);
        const dx = k % 2 ? inward[0] * lb.db : 0, dy = k % 2 ? inward[1] * lb.db : 0;
        const pts = [P(x + dx, y + dy, pc.s)];
        const hk = el.top === 'hook' && pc.last;
        if (hk) {
          const ztop = pc.e - lb.db / 2;
          const dir = Math.abs(x) >= Math.abs(y) ? [-Math.sign(x), 0] : [0, -Math.sign(y)];
          pts.push(P(x + dx, y + dy, ztop), P(x + dx + dir[0] * legV, y + dy + dir[1] * legV, ztop));
        } else pts.push(P(x + dx, y + dy, pc.e));
        C.add('long', el.long.bar, hk ? 'L' : 'S', pts, rcB, { piece: k });
      }
      if (!pc.last) laps.push({ role: 'long', bar: el.long.bar, at: r1(pc.e - lapUse / 2), req: lapReq.value, provided: lapUse, auto: !(el.lap > 0), clause: lapReq.clause, terms: lapReq.terms, kind: o.compression ? 'compression' : 'tension', noLap: lapReq.noLap });
    });
    if (el.top === 'splice') laps.push({ role: 'long', bar: el.long.bar, at: r1(H + lapUse / 2), above: true, req: lapReq.value, provided: lapUse, auto: !(el.lap > 0), clause: lapReq.clause, terms: lapReq.terms, kind: o.compression ? 'compression' : 'tension', noLap: lapReq.noLap });
    const rcS = bend(tb, 'tie').rc, tail = hookTail(tb, el.ties.hook, S.code, 'tie');
    const zs = stations(el.ties.first, H - el.ties.first, el.ties.ends.len, el.ties.ends.s, el.ties.s);
    for (const z of zs) C.add('tie', el.ties.bar, 'T', closedTie(P(0, 0, z), ez, ex, ey, el.w - 2 * c - tb.db, el.d - 2 * c - tb.db, tail.value + rcS * Math.tan((el.ties.hook === 90 ? 45 : 67.5) * Math.PI / 180), tb.db), rcS);
    info.stations = zs; info.positions = pos; info.clear = Math.min(clearW, clearD); info.lap = { req: lapReq, use: lapUse }; info.tail = tail;
  } else {
    panelBars(el, ctx, C, laps, info);
  }
  return { groups: C.list, laps, anchors, body: bodyOf(el), info };
}

/** The concrete body: a box (o = a corner, ex, ey, ez, size) and, for slabs and walls, the openings in panel coordinates. */
export function bodyOf(el) {
  if (el.kind === 'beam') { const F = beamFrame(el); return { o: add(add(el.a, mul(F.ey, -el.w / 2)), mul(F.ez, -el.h)), ex: F.ex, ey: F.ey, ez: F.ez, size: [F.L, el.w, el.h] }; }
  if (el.kind === 'column') { const F = columnFrame(el); return { o: add(add(F.o, mul(F.ex, -el.w / 2)), mul(F.ey, -el.d / 2)), ex: F.ex, ey: F.ey, ez: F.ez, size: [el.w, el.d, F.H] }; }
  const F = panelFrame(el);
  return { o: F.O, ex: F.eu, ey: F.ev, ez: F.en, size: [F.U, F.V, F.t], openings: F.openings };
}

function panelBars(el, ctx, C, laps, info) {
  const bars = ctx.bars, S = ctx.settings;
  const F = panelFrame(el), { O, eu, ev, en, U, V, t } = F;
  const P = (u, v, n) => add(add(add(O, mul(eu, u)), mul(ev, v)), mul(en, n));
  const wall = el.kind === 'wall';
  const ce = wall ? el.cover : Math.max(el.cover.bot, el.cover.top);   // cover at the panel's edges
  const layers = [];
  if (wall) {
    if (el.faces === 2) { layers.push({ face: 0, cover: el.cover, u: el.u, v: el.v }); layers.push({ face: 1, cover: el.cover, u: el.u, v: el.v }); }
    else layers.push({ face: 0.5, cover: el.cover, u: el.u, v: el.v });
  } else {
    layers.push({ face: 0, cover: el.cover.bot, u: el.bot.u, v: el.bot.v });
    if (el.top.on) layers.push({ face: 1, cover: el.cover.top, u: el.top.u, v: el.top.v });
  }
  const opens = F.openings;
  info.layers = [];
  for (const ly of layers) {
    const bu = bars.get(ly.u.bar), bv = bars.get(ly.v.bar);
    const nOf = (outer, db) => {
      if (ly.face === 0.5) return t / 2 + (outer ? -bv.db / 2 : bu.db / 2);
      const d = outer ? ly.cover + db / 2 : ly.cover + bu.db + db / 2;
      return ly.face === 0 ? d : t - d;
    };
    const top = !wall && ly.face === 1 && t - (ly.cover + bu.db) > 300;
    const L = { face: ly.face, dirs: {} };
    for (const dir of ['u', 'v']) {
      const spec = ly[dir], b = bars.get(spec.bar), outer = dir === 'u';
      const along = dir === 'u' ? U : V, across = dir === 'u' ? V : U;
      const n = nOf(outer, b.db);
      const lay = layout(across - 2 * ce - b.db, spec.s);
      const clear = lay.spacing - b.db;
      const o = codeOpts(S, { top, cover: ly.cover, clear, confined: false, compression: false });
      const lapReq = lapLen(b, { ...o, lapPct: 100 });
      const lapUse = el.lap > 0 ? el.lap : roundUp(lapReq.value);
      const ld = develop(b, o);
      const rcB = bend(b, 'main').rc;
      const extTop = wall && dir === 'v' && el.top === 'splice' ? lapUse : 0;
      let cutN = new Map();   // opening index → bars cut
      const segsFor = (q) => {   // the bar at cross position q: its runs along the bar, cut by openings
        let runs = [[ce, along - ce + extTop]];
        opens.forEach((op, i) => {
          const [a0, b0, a1, b1] = dir === 'u' ? op : [op[1], op[0], op[3], op[2]];   // along-start, across-start, along-end, across-end
          const m = ly.cover + b.db / 2;
          if (q <= b0 - m || q >= b1 + m) return;
          cutN.set(i, (cutN.get(i) || 0) + 1);
          const next = [];
          for (const [s, e] of runs) {
            if (e <= a0 - ly.cover || s >= a1 + ly.cover) { next.push([s, e]); continue; }
            if (a0 - ly.cover - s > 100) next.push([s, a0 - ly.cover]);
            if (e - (a1 + ly.cover) > 100) next.push([a1 + ly.cover, e]);
          }
          runs = next;
        });
        return runs;
      };
      for (let i = 0; i < lay.n; i++) {
        const q = ce + b.db / 2 + i * lay.spacing;
        for (const [s, e] of segsFor(q)) {
          const ps = pieces(s, e, S.stock, lapUse);
          ps.forEach((pc, k) => {
            const qq = q + (k % 2 ? b.db : 0);
            const pts = dir === 'u' ? [P(pc.s, qq, n), P(pc.e, qq, n)] : [P(qq, pc.s, n), P(qq, pc.e, n)];
            C.add(roleOf(ly, dir, wall), spec.bar, 'S', pts, rcB, { piece: k });
            if (!pc.last && i === 0) laps.push({ role: roleOf(ly, dir, wall), bar: spec.bar, at: r1(pc.e - lapUse / 2), req: lapReq.value, provided: lapUse, auto: !(el.lap > 0), clause: lapReq.clause, terms: lapReq.terms, kind: 'tension', noLap: lapReq.noLap });
          });
        }
      }
      if (extTop) laps.push({ role: roleOf(ly, dir, wall), bar: spec.bar, at: r1(V + lapUse / 2), above: true, req: lapReq.value, provided: lapUse, auto: !(el.lap > 0), clause: lapReq.clause, terms: lapReq.terms, kind: 'tension', noLap: lapReq.noLap });
      // trimmers: half the cut area each side of the opening, an anchorage length past it
      const tb = bars.get(el.trim.bar);
      const ldT = develop(tb, codeOpts(S, { top, cover: ly.cover, clear: Math.max(25, tb.db), confined: false }));
      const trims = [];
      cutN.forEach((k, i) => {
        const op = opens[i];
        const [a0, b0, a1, b1] = dir === 'u' ? op : [op[1], op[0], op[3], op[2]];
        const nt = Math.max(1, Math.ceil(k * b.area / 2 / tb.area - 1e-9));
        const step = tb.db + Math.max(25.4, tb.db);
        const s = Math.max(ce, a0 - roundUp(ldT.value)), e = Math.min(along - ce, a1 + roundUp(ldT.value));
        for (const side of [-1, 1]) for (let j = 0; j < nt; j++) {
          const q = side < 0 ? b0 - ly.cover - tb.db / 2 - j * step : b1 + ly.cover + tb.db / 2 + j * step;
          if (q < ce || q > across - ce) continue;
          const pts = dir === 'u' ? [P(s, q, n), P(e, q, n)] : [P(q, s, n), P(q, e, n)];   // in the same layer as the bars it replaces
          C.add('trim-' + dir, el.trim.bar, 'S', pts, bend(tb, 'main').rc);
        }
        trims.push({ opening: i, cut: k, each: nt, bar: el.trim.bar, ld: ldT.value, clause: ldT.clause, areaCut: k * b.area, areaEach: nt * tb.area });
      });
      L.dirs[dir] = { bar: spec.bar, s: spec.s, n: lay.n, spacing: lay.spacing, clear, nPos: n, ld: ld.value, lap: { req: lapReq, use: lapUse }, trims };
    }
    info.layers.push(L);
  }
  // U-bars round a slab's free edges, at a wall's two ends
  const edgeOn = wall ? el.ends.on : el.edges.on;
  if (edgeOn) {
    const eb = bars.get(wall ? el.ends.bar : el.edges.bar), es = wall ? el.v.s : el.edges.s;
    const cover = wall ? el.cover : Math.min(el.cover.bot, el.cover.top);
    const lapE = lapLen(eb, { ...codeOpts(S, { cover, clear: es - eb.db, confined: false }), lapPct: 100 });
    const leg = roundUp(lapE.value);
    const mid = t - 2 * cover;   // out to out through the thickness
    const rcE = bend(eb, 'main').rc;
    const edges = wall ? [['u0'], ['u1']] : [['u0'], ['u1'], ['v0'], ['v1']];
    for (const [k] of edges) {
      const alongU = k[0] === 'v';   // the edge runs along u (edges v0, v1)
      const span = alongU ? U : V;
      const lay = layout(span - 2 * ce - eb.db, es);
      for (let i = 0; i < lay.n; i++) {
        const q = ce + eb.db / 2 + i * lay.spacing;
        const e0 = k[1] === '0' ? ce + eb.db / 2 : (alongU ? V : U) - ce - eb.db / 2, inward = k[1] === '0' ? 1 : -1;
        const n0 = cover + eb.db / 2, n1 = t - cover - eb.db / 2;
        const at = (r, n) => (alongU ? P(q, r, n) : P(r, q, n));
        const pts = [at(e0 + inward * (leg - eb.db / 2), n0), at(e0, n0), at(e0, n1), at(e0 + inward * (leg - eb.db / 2), n1)];
        C.add('edge', wall ? el.ends.bar : el.edges.bar, 'U', pts, rcE);
      }
    }
    info.edge = { bar: wall ? el.ends.bar : el.edges.bar, leg, mid, lap: lapE };
  }
  info.frame = F;
}
const roleOf = (ly, dir, wall) => (wall ? (ly.face === 1 ? 'f2-' : 'f1-') + (dir === 'u' ? 'h' : 'v') : (ly.face === 1 ? 'top-' : 'bot-') + dir);

// ---------------------------------------------------------------- checks

const mk = (id, code, clause, demand, capacity, op, unit, vars = {}, sev = 'warning') => {
  const okv = op === '<=' ? demand <= capacity + 1e-6 : demand >= capacity - 1e-6;
  return { id, code, clause, status: okv ? 'ok' : 'fail', severity: sev, req: { op, value: r1(capacity), unit }, found: { value: r1(demand), unit }, vars };
};
const note = (id, code, clause, vars = {}) => ({ id, code, clause, status: 'note', severity: 'note', vars });

/** ACI 318-19 Table 20.5.1.3.1 specified cover (cast-in-place, nonprestressed), mm. */
export function aciCover(kind, exposure, db) {
  if (exposure === 'earth') return 75;
  if (exposure === 'exposed') return db >= 19 ? 50 : 40;
  if (kind === 'slab' || kind === 'wall') return db > 36 ? 40 : 20;
  return 40;
}

export function checkElement(el, res, ctx) {
  const S = ctx.settings, bars = ctx.bars, aci = S.code !== 'ec2', out = [];
  const B = (n) => bars.get(n);
  if (el.bars === 'imported') return [note('imported', 'imported', '')];
  const cl = (a, e) => (aci ? ACI + ' ' + a : EC2 + ' ' + e);
  // laps and anchorage, every code
  res.laps.forEach((l, i) => {
    const id = 'lap:' + l.role + ':' + i;
    if (l.noLap && aci) out.push({ id: id + ':size', code: 'lap-size', clause: ACI + ' 25.5.1.1', status: 'fail', severity: 'error', vars: { bar: l.bar, role: l.role } });
    out.push(mk(id, 'lap', l.clause, l.provided, l.req, '>=', 'mm', { role: l.role, bar: l.bar, at: l.at, kind: l.kind, auto: l.auto ? 1 : 0 }));
  });
  res.anchors.forEach((a) => {
    const id = 'anchor:' + a.role + ':' + a.end;
    if (a.provided === null) out.push(note(id, 'anchor-unknown', a.clause, { role: a.role, end: a.end, need: r1(a.req) }));
    else out.push(mk(id, a.hooked ? 'anchor-hook' : 'anchor', a.clause, a.provided, a.req, '>=', 'mm', { role: a.role, end: a.end, bar: a.bar }));
    if (a.legShort) out.push({ id: id + ':leg', code: 'hook-room', clause: ACI + ' Table 25.3.1', status: 'fail', severity: 'warning', vars: { role: a.role, bar: a.bar } });
  });
  if (el.kind === 'beam') {
    const st = B(el.stir.bar), info = res.info, d = info.d;
    const dbMain = Math.max(B(el.bot.bar).db, B(el.top.bar).db);
    if (aci) out.push(mk('cover', 'cover', ACI + ' Table 20.5.1.3.1', el.cover, aciCover('beam', S.exposure, dbMain), '>=', 'mm', { exposure: S.exposure }));
    else { out.push(mk('cover', 'cover-bond', EC2 + ' 4.4.1.2 Table 4.2', el.cover, st.db, '>=', 'mm', {})); out.push(mk('cover-main', 'cover-bond', EC2 + ' 4.4.1.2 Table 4.2', el.cover + st.db, dbMain, '>=', 'mm', {})); }
    for (const role of ['bot', 'top']) {
      const b = B(el[role].bar), min = aci ? Math.max(25, b.db) : Math.max(20, b.db);
      out.push(mk('clear:' + role, 'clear', cl('25.2.1', '8.2 (2)'), info[role].clear, min, '>=', 'mm', { role, bar: el[role].bar }));
    }
    const smax = aci ? Math.min(d / 2, 600) : 0.75 * d;
    out.push(mk('stir-s', 'stir-s', cl('9.7.6.2.2', '9.2.2 (6) (9.6N)'), el.stir.s, smax, '<=', 'mm', { zone: 'middle' }));
    out.push(mk('stir-s-end', 'stir-s', cl('9.7.6.2.2', '9.2.2 (6) (9.6N)'), el.stir.ends.s, smax, '<=', 'mm', { zone: 'ends' }));
    const As = el.bot.n * B(el.bot.bar).area;
    const asMin = aci ? Math.max(0.25 * Math.sqrt(S.fc) / S.fy, 1.4 / S.fy) * el.w * d : Math.max(0.26 * fctm(S.fc) / S.fy, 0.0013) * el.w * d;
    out.push(mk('as-min', 'as-min', cl('9.6.1.2', '9.2.1.1 (1) (9.1N)'), As, asMin, '>=', 'mm²', { role: 'bot' }));
    if (!aci) { const tot = As + el.top.n * B(el.top.bar).area; out.push(mk('as-max', 'as-max', EC2 + ' 9.2.1.1 (3)', tot, 0.04 * el.w * el.h, '<=', 'mm²', {})); }
    if (aci && el.h > 900 && el.skin.n === 0) out.push({ id: 'skin', code: 'skin', clause: ACI + ' 9.7.2.3', status: 'fail', severity: 'warning', vars: { h: el.h } });
    out.push(note('ties-hooks', aci ? 'tail' : 'tail', info.tail.clause, { tail: r1(info.tail.value), hook: el.stir.hook }));
  } else if (el.kind === 'column') {
    const lb = B(el.long.bar), tb = B(el.ties.bar), info = res.info, n = info.positions.length, Ag = el.w * el.d, Ast = n * lb.area;
    if (aci) out.push(mk('cover', 'cover', ACI + ' Table 20.5.1.3.1', el.cover, aciCover('column', S.exposure, lb.db), '>=', 'mm', { exposure: S.exposure }));
    else out.push(mk('cover-main', 'cover-bond', EC2 + ' 4.4.1.2 Table 4.2', el.cover + tb.db, lb.db, '>=', 'mm', {}));
    if (aci) {
      out.push(mk('rho-min', 'rho-min', ACI + ' 10.6.1.1', Ast / Ag * 100, 1, '>=', 'pct', {}));
      out.push(mk('rho-max', 'rho-max', ACI + ' 10.6.1.1', Ast / Ag * 100, 8, '<=', 'pct', {}));
      out.push(mk('nbars', 'nbars', ACI + ' 10.7.3.1', n, 4, '>=', 'bars', {}));
      out.push(mk('clear', 'clear', ACI + ' 25.2.3', info.clear, Math.max(40, 1.5 * lb.db), '>=', 'mm', { role: 'long', bar: el.long.bar }));
      const smax = Math.min(16 * lb.db, 48 * tb.db, Math.min(el.w, el.d));
      out.push(mk('tie-s', 'tie-s', ACI + ' 25.7.2.1', el.ties.s, smax, '<=', 'mm', { zone: 'middle' }));
      out.push(mk('tie-s-end', 'tie-s', ACI + ' 25.7.2.1', el.ties.ends.s, smax, '<=', 'mm', { zone: 'ends' }));
      out.push(mk('tie-size', 'tie-size', ACI + ' 25.7.2.2', tb.db, lb.db <= 32.3 + 1e-6 ? 9.5 : 12.7, '>=', 'mm', { bar: el.ties.bar }));
      // 25.7.2.3: with one perimeter tie only the corner bars are held; a face's middle bar is fine within 150 mm clear of a corner bar
      const span = (nf, half) => (nf > 3 ? Infinity : nf === 3 ? half - lb.db : 0);
      const worst = Math.max(span(el.long.nw, el.w / 2 - el.cover - tb.db - lb.db / 2), span(el.long.nd, el.d / 2 - el.cover - tb.db - lb.db / 2));
      if (worst > 150) out.push({ id: 'crossties', code: 'crossties', clause: ACI + ' 25.7.2.3', status: 'fail', severity: 'warning', req: { op: '<=', value: 150, unit: 'mm' }, found: { value: Number.isFinite(worst) ? r1(worst) : null, unit: 'mm' }, vars: {} });
    } else {
      out.push(mk('rho-min', 'as-min', EC2 + ' 9.5.2 (2)', Ast, 0.002 * Ag, '>=', 'mm²', { ned: 1 }));
      out.push(mk('rho-max', 'as-max', EC2 + ' 9.5.2 (3)', Ast, 0.04 * Ag, '<=', 'mm²', {}));
      out.push(mk('bar-min', 'bar-min', EC2 + ' 9.5.2 (1)', lb.db, 8, '>=', 'mm', {}));
      out.push(mk('nbars', 'nbars', EC2 + ' 9.5.2 (4)', n, 4, '>=', 'bars', {}));
      out.push(mk('clear', 'clear', EC2 + ' 8.2 (2)', info.clear, Math.max(20, lb.db), '>=', 'mm', { role: 'long', bar: el.long.bar }));
      const smax = Math.min(20 * lb.db, Math.min(el.w, el.d), 400);
      out.push(mk('tie-s', 'tie-s', EC2 + ' 9.5.3 (3)', el.ties.s, smax, '<=', 'mm', { zone: 'middle' }));
      out.push(mk('tie-s-end', 'tie-s', EC2 + ' 9.5.3 (4)', el.ties.ends.s, 0.6 * smax, '<=', 'mm', { zone: 'ends' }));
      out.push(mk('tie-zone', 'tie-zone', EC2 + ' 9.5.3 (4)', el.ties.ends.len, Math.max(el.w, el.d), '>=', 'mm', {}));
      out.push(mk('tie-size', 'tie-size', EC2 + ' 9.5.3 (1)', tb.db, Math.max(6, lb.db / 4), '>=', 'mm', { bar: el.ties.bar }));
    }
    // the bars from below: a footing's starters or the column under this one
    const below = startersBelow(el, ctx);
    if (below) {
      const sb = B(below.bar);
      const req = lapLen(sb, { ...codeOpts(S, { cover: el.cover + tb.db, clear: info.clear, confined: true, compression: S.colLap === 'compression' }), lapPct: 100 });
      out.push(mk('lap-base', 'lap-base', req.clause, below.provided, req.value, '>=', 'mm', { from: below.from, id: below.id, bar: below.bar }));
    } else out.push(note('lap-base', 'lap-base-none', '', {}));
  } else {
    const wall = el.kind === 'wall', info = res.info, t = el.t;
    for (const L of info.layers) {
      for (const dir of ['u', 'v']) {
        const D = L.dirs[dir], b = B(D.bar), tag = (wall ? (L.face === 1 ? 'f2' : 'f1') : L.face === 1 ? 'top' : 'bot') + '-' + dir;
        const cover = wall ? el.cover : L.face === 1 ? el.cover.top : el.cover.bot;
        if (dir === 'u') {
          if (aci) out.push(mk('cover:' + tag, 'cover', ACI + ' Table 20.5.1.3.1', cover, aciCover(el.kind, S.exposure, b.db), '>=', 'mm', { exposure: S.exposure, layer: tag }));
          else out.push(mk('cover:' + tag, 'cover-bond', EC2 + ' 4.4.1.2 Table 4.2', cover, b.db, '>=', 'mm', { layer: tag }));
        }
        out.push(mk('clear:' + tag, 'clear', cl('25.2.1', '8.2 (2)'), D.clear, aci ? Math.max(25, b.db) : Math.max(20, b.db), '>=', 'mm', { role: tag, bar: D.bar }));
        let smax, clause;
        if (!wall) { if (aci) { smax = Math.min(3 * t, 450); clause = ACI + ' 7.7.2.3'; } else { smax = dir === 'u' ? Math.min(3 * t, 400) : Math.min(3.5 * t, 450); clause = EC2 + ' 9.3.1.1 (3)'; } }
        else if (aci) { smax = Math.min(3 * t, 450); clause = ACI + (dir === 'v' ? ' 11.7.2.1' : ' 11.7.3.1'); }
        else { smax = dir === 'v' ? Math.min(3 * t, 400) : 400; clause = EC2 + (dir === 'v' ? ' 9.6.2 (3)' : ' 9.6.3 (2)'); }
        out.push(mk('s:' + tag, 'spacing', clause, D.spacing, smax, '<=', 'mm', { role: tag }));
        for (const tr of D.trims) out.push(note('trim:' + tag + ':' + tr.opening, 'trim', tr.clause, { role: tag, cut: tr.cut, each: tr.each, bar: tr.bar, ld: r1(tr.ld), n: tr.opening + 1 }));
      }
    }
    // minimum steel per direction (both layers together), per metre
    for (const dir of ['u', 'v']) {
      const As = info.layers.reduce((s, L) => s + B(L.dirs[dir].bar).area * 1000 / L.dirs[dir].spacing, 0);
      if (!wall) {
        if (aci) { const rho = S.fy < 420 ? 0.0020 : Math.max(0.0018 * 420 / S.fy, 0.0014); out.push(mk('rho:' + dir, 'rho-min', ACI + ' 24.4.3.2', As / (1000 * t) * 100, rho * 100, '>=', 'pct', { dir })); }
        else { const L0 = info.layers[0].dirs[dir], dd = t - el.cover.bot - B(L0.bar).db / 2; out.push(mk('rho:' + dir, 'as-min', EC2 + ' 9.3.1.1 (1), 9.2.1.1 (9.1N)', B(L0.bar).area * 1000 / L0.spacing, Math.max(0.26 * fctm(S.fc) / S.fy, 0.0013) * 1000 * dd, '>=', 'mm²', { dir })); }
      } else if (aci) {
        const small = B(info.layers[0].dirs[dir].bar).db <= 16 + 1e-6 && S.fy >= 420;
        const rho = dir === 'v' ? (small ? 0.0012 : 0.0015) : (small ? 0.0020 : 0.0025);
        out.push(mk('rho:' + dir, 'rho-min', ACI + ' 11.6.1', As / (1000 * t) * 100, rho * 100, '>=', 'pct', { dir }));
      } else if (dir === 'v') out.push(mk('rho:v', 'rho-min', EC2 + ' 9.6.2 (1)', As / (1000 * t) * 100, 0.2, '>=', 'pct', { dir }));
      else { const Av = info.layers.reduce((s, L) => s + B(L.dirs.v.bar).area * 1000 / L.dirs.v.spacing, 0); out.push(mk('rho:u', 'rho-min', EC2 + ' 9.6.3 (1)', As, Math.max(0.25 * Av, 0.001 * 1000 * t), '>=', 'mm²', { dir })); }
    }
    if (wall && aci && t > 250 && el.faces === 1) out.push({ id: 'layers', code: 'layers', clause: ACI + ' 11.7.2.3', status: 'fail', severity: 'warning', vars: { t } });
    if (info.edge) out.push(note('edge', 'edge', info.edge.lap.clause, { bar: info.edge.bar, leg: r1(info.edge.leg) }));
  }
  return out;
}

/** What laps a column's bars at its base: the starters of a footing of the model under it, or the column below spliced up. */
export function startersBelow(el, ctx) {
  for (const f of ctx.footings || []) {
    if (!f.starters?.on || Math.abs(f.top - el.z0) > 1) continue;
    const r = (f.rotation || 0) * Math.PI / 180, dx = el.x - f.x, dy = el.y - f.y;
    const lx = Math.cos(r) * dx + Math.sin(r) * dy, ly = -Math.sin(r) * dx + Math.cos(r) * dy;
    if (Math.abs(lx) <= f.L / 2 && Math.abs(ly) <= f.B / 2) return { from: 'footing', id: f.id, bar: f.starters.bar, provided: f.starters.projection };
  }
  for (const c of ctx.elements || []) {
    if (c.kind !== 'column' || c === el || c.top !== 'splice' || Math.abs(c.z1 - el.z0) > 1 || Math.hypot(c.x - el.x, c.y - el.y) > Math.min(el.w, el.d) / 2) continue;
    const lapUse = c.lap > 0 ? c.lap : roundUp(lapLen(ctx.bars.get(c.long.bar), { ...codeOpts(ctx.settings, { cover: c.cover, clear: 50, confined: true, compression: ctx.settings.colLap === 'compression' }), lapPct: 100 }).value);
    return { from: 'column', id: c.id, bar: c.long.bar, provided: lapUse };
  }
  return null;
}
