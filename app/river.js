/* SPDX-License-Identifier: Apache-2.0 */
/**
 * river.js — the river model for 1D steady-flow water surface profiles (0.8 SU.957). No DOM, no strings: problems come back
 * as codes the UI words (`river.issue.<code>`). Tested by bin/test-civilcraft-river.mjs.
 *
 * Conventions (those of the usual 1D river programs, so a student's hand notes carry over):
 *   - The CENTRELINE is drawn in the direction of flow (upstream → downstream).
 *   - RIVER STATION rs = distance along the centreline measured from its DOWNSTREAM end, so rs grows upstream.
 *   - A cross-section's points are { o, z }: o = offset along the section's cut line, increasing LEFT TO RIGHT LOOKING
 *     DOWNSTREAM, 0 where it crosses the centreline. Offsets never go back (equal offsets = a vertical wall).
 *   - BANKS [oL, oR] split the section into left overbank (LOB, o < oL), main channel and right overbank (ROB, o > oR).
 *   - line / lineAt0: the plan cut line (left to right looking downstream) and the distance along it where o = 0.
 *   - REACH LENGTHS { lob, ch, rob } are from this section to the NEXT ONE DOWNSTREAM (0 at the most downstream section).
 *   - MANNING n zones [{ o, n }]: each n holds from its o to the next zone's o (the first from the section's left end).
 *   - INEFF [{ o0, o1, trigger }]: ineffective flow areas (0.8 SU.957 step 2): the part of the section between o0 and o1 holds water
 *     but does not carry flow — its area, wetted perimeter, top width and conveyance are left out — while the water surface is
 *     below `trigger` (null = always). LEVEES { left: { o, z } | null, right: { o, z } | null }: ground beyond a levee (left of
 *     left.o, right of right.o) is cut off from the river while the water surface is below the crest z — the same as an
 *     ineffective area from the section's end to the levee with the crest as its trigger — and the flood extent leaves it dry.
 *   - cc / ce: contraction / expansion coefficients for the reach from this section to the next one downstream
 *     (defaults 0.1 / 0.3: gradual transitions).
 *   - alpha: null = computed from the conveyance split (the normal case); a number fixes the velocity-head coefficient
 *     (only for checks against hand methods that assume one, e.g. Chow's α = 1.10).
 *   - PROFILES [{ name, q, changes: [{ rs, q }], down, up }]: q enters at the upstream end; a change at rs holds from that
 *     section downstream. Boundaries: { type: 'normal', slope } | { type: 'ws', wse } | { type: 'critical' }. `down` is used
 *     by subcritical runs, `up` by supercritical ones; mixed uses both.
 *   - settings { spacing, left, right, bank, n, nOver }: how the sections were cut from the ground (kept for Cut again).
 *   - units 'm' (SI: Manning constant 1, g 9.80665 m/s²) or 'ft' (US: 1.486, g 32.174 ft/s²), q in m³/s or ft³/s.
 *
 *   RIVER_DEFAULTS(units) → { spacing, left, right, bank, n, nOver, cc, ce }
 *   UNIT_CONST[units] → { k, g }
 *   cleanRiver(obj) → model | null           (untrusted: the project file) every number checked, lists capped
 *   newRiver({ name, units, centreline }) → model
 *   riverStation(centreline, p) → { rs, off }   rs of the nearest centreline point to p, off > 0 = right looking downstream
 *   sectionFromLine(surface, centreline, line, opts) → section | null   a cut line across the centreline → a section (line
 *       turned to run left to right looking downstream; o = 0 at the crossing; banks guessed ±opts.bank around the lowest
 *       point; n from opts.n / opts.nOver)
 *   sectionsAlong(surface, centreline, { spacing, left, right, bank, n, nOver }) → [section]   square cut lines every
 *       `spacing` (and both ends)
 *   setReachLengths(model) → model           lengths from the plan: channel = rs difference; overbanks = the plan distance
 *       between the middles of the two sections' overbank parts of their cut lines (rs difference when there are no lines)
 *   ordered(model) → sections sorted downstream first (rs ascending)
 *   flowAt(profile, rs) → q
 *   nZonesFor(section) → [{ o0, o1, n }]      the zones clipped to the section
 *   ineffectiveOf(section) → [{ o0, o1, trigger }]   the section's ineffective areas plus its levees' cut-off ground
 *   check(model) → [{ code, id?, rs?, profile? }]   problems before solving (an empty list = ready)
 */

import { cutSection, crossing, locateOn, lineLength, squareAcross, pointAt, lowest, flatten } from './terrain-section.js';

export const UNIT_CONST = { m: { k: 1, g: 9.80665 }, ft: { k: 1.486, g: 32.174 } };
export const MAX_SECTIONS = 500, MAX_POINTS = 1000, MAX_PROFILES = 20, MAX_CHANGES = 100;
export const BOUNDARY_TYPES = ['normal', 'ws', 'critical'];

export function RIVER_DEFAULTS(units = 'm') {
  return units === 'ft'
    ? { spacing: 200, left: 300, right: 300, bank: 30, n: 0.035, nOver: 0.08, cc: 0.1, ce: 0.3 }
    : { spacing: 50, left: 100, right: 100, bank: 10, n: 0.035, nOver: 0.08, cc: 0.1, ce: 0.3 };
}

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const big = (v) => num(v) !== null && Math.abs(v) < 1e9;
const xy = (p) => (p && big(p.x) && big(p.y) ? { x: p.x, y: p.y } : null);
const line = (a, max = 1000) => (Array.isArray(a) ? a.slice(0, max).map(xy).filter(Boolean) : []);

function cleanBoundary(b) {
  if (!b || !BOUNDARY_TYPES.includes(b.type)) return null;
  if (b.type === 'normal') return num(b.slope) > 0 && b.slope < 1 ? { type: 'normal', slope: b.slope } : null;
  if (b.type === 'ws') return big(b.wse) ? { type: 'ws', wse: b.wse } : null;
  return { type: 'critical' };
}

function cleanSection(s, i, units) {
  if (!s || typeof s !== 'object' || !big(s.rs)) return null;
  const d = RIVER_DEFAULTS(units);
  const pts = (Array.isArray(s.pts) ? s.pts : []).slice(0, MAX_POINTS).filter((p) => p && big(p.o) && big(p.z)).map((p) => ({ o: p.o, z: p.z }));
  for (let k = 1; k < pts.length; k++) if (pts[k].o < pts[k - 1].o) return null;   // offsets never go back
  if (pts.length < 2) return null;
  const lo = pts[0].o, hi = pts[pts.length - 1].o;
  let banks = Array.isArray(s.banks) && big(s.banks[0]) && big(s.banks[1]) ? [s.banks[0], s.banks[1]] : [lo, hi];
  banks = [Math.max(lo, Math.min(hi, banks[0])), Math.max(lo, Math.min(hi, banks[1]))];
  if (banks[1] <= banks[0]) banks = [lo, hi];
  const n = (Array.isArray(s.n) ? s.n : []).slice(0, 50).filter((z) => z && big(z.o) && num(z.n) > 0 && z.n < 1).map((z) => ({ o: z.o, n: z.n })).sort((a, b) => a.o - b.o);
  const reach = s.reach && typeof s.reach === 'object' ? s.reach : {};
  const len = (v) => (num(v) !== null && v >= 0 && v < 1e7 ? v : null);
  return {
    id: typeof s.id === 'string' && s.id ? s.id.slice(0, 40) : 'xs' + (i + 1),
    rs: s.rs,
    name: typeof s.name === 'string' ? s.name.slice(0, 80) : '',
    line: line(s.line, 50),
    lineAt0: big(s.lineAt0) ? s.lineAt0 : null,
    pts,
    banks,
    n: n.length ? n : [{ o: lo, n: d.nOver }, { o: banks[0], n: d.n }, { o: banks[1], n: d.nOver }],
    reach: { lob: len(reach.lob), ch: len(reach.ch), rob: len(reach.rob) },
    cc: num(s.cc) !== null && s.cc >= 0 && s.cc <= 1 ? s.cc : d.cc,
    ce: num(s.ce) !== null && s.ce >= 0 && s.ce <= 1 ? s.ce : d.ce,
    alpha: num(s.alpha) !== null && s.alpha >= 1 && s.alpha <= 5 ? s.alpha : null,
    gaps: s.gaps === true,
    ineff: cleanIneff(s.ineff, lo, hi),
    levees: cleanLevees(s.levees, lo, hi),
  };
}

function cleanIneff(a, lo, hi) {
  return (Array.isArray(a) ? a : []).slice(0, 20).filter((r) => r && big(r.o0) && big(r.o1)).map((r) => ({ o0: Math.max(lo, Math.min(r.o0, r.o1)), o1: Math.min(hi, Math.max(r.o0, r.o1)), trigger: big(r.trigger) ? r.trigger : null })).filter((r) => r.o1 > r.o0);
}
function cleanLevees(l, lo, hi) {
  const one = (v) => (v && big(v.o) && big(v.z) && v.o >= lo && v.o <= hi ? { o: v.o, z: v.z } : null);
  const left = one(l?.left), right = one(l?.right);
  return left || right ? { left, right } : null;
}

/** The ineffective ranges of a section as the solver reads them: its own plus each levee's cut-off ground. [{ o0, o1, trigger }] */
export function ineffectiveOf(sec) {
  const lo = sec.pts[0].o, hi = sec.pts[sec.pts.length - 1].o, out = (sec.ineff || []).map((r) => ({ ...r }));
  if (sec.levees?.left) out.push({ o0: lo, o1: sec.levees.left.o, trigger: sec.levees.left.z });
  if (sec.levees?.right) out.push({ o0: sec.levees.right.o, o1: hi, trigger: sec.levees.right.z });
  return out.filter((r) => r.o1 > r.o0);
}

export function cleanRiver(o) {
  if (!o || typeof o !== 'object') return null;
  const units = o.units === 'ft' ? 'ft' : 'm';
  const seen = new Set();
  const sections = (Array.isArray(o.sections) ? o.sections : []).slice(0, MAX_SECTIONS).map((s, i) => cleanSection(s, i, units)).filter((s) => {
    if (!s) return false;
    if (seen.has(s.id)) s.id += '-' + seen.size;
    seen.add(s.id);
    return true;
  });
  const profiles = (Array.isArray(o.profiles) ? o.profiles : []).slice(0, MAX_PROFILES).filter((p) => p && num(p.q) > 0 && p.q < 1e8).map((p, i) => ({
    name: typeof p.name === 'string' && p.name ? p.name.slice(0, 40) : 'PF ' + (i + 1),
    q: p.q,
    changes: (Array.isArray(p.changes) ? p.changes : []).slice(0, MAX_CHANGES).filter((c) => c && big(c.rs) && num(c.q) > 0 && c.q < 1e8).map((c) => ({ rs: c.rs, q: c.q })),
    down: cleanBoundary(p.down),
    up: cleanBoundary(p.up),
  }));
  const structures = cleanStructures(o.structures, units);
  return {
    format: 'cc-river',
    v: 1,
    id: typeof o.id === 'string' && o.id ? o.id.slice(0, 40) : 'r1',
    name: typeof o.name === 'string' ? o.name.slice(0, 80) : '',
    units,
    centreline: line(o.centreline, 5000),
    sections,
    profiles,
    regime: ['sub', 'super', 'mixed'].includes(o.regime) ? o.regime : 'sub',
    settings: cleanSettings(o.settings, units),
    ...(typeof o.joinsTo === 'string' && o.joinsTo && o.joinsTo !== o.id ? { joinsTo: o.joinsTo.slice(0, 40) } : {}),   // 0.8 SU.957 (civil_PART_4): this river flows into that one (river-structures.js solveNetwork)
    ...(structures.length ? { structures } : {}),   // 0.8 SU.957 rest: culverts and bridges (river-structures.js)
  };
}

const posn = (v, max = 1e5) => (num(v) > 0 && v < max ? v : null);
/** Culverts and bridges (untrusted): every number checked, a bad one dropped. See river-structures.js for what each field means. */
export function cleanStructures(a, units = 'm') {
  const out = [], seen = new Set(), ft = units === 'ft';
  const cd = { ke: 0.5, cdC: 0.6, cw: ft ? 3.1 : 1.7 };
  for (const s of (Array.isArray(a) ? a : []).slice(0, 50)) {
    if (!s || typeof s !== 'object' || !big(s.rs)) continue;
    let id = typeof s.id === 'string' && s.id ? s.id.slice(0, 40) : 'st' + (out.length + 1);
    if (seen.has(id)) id += '-' + seen.size;
    seen.add(id);
    const base = { id, rs: s.rs, name: typeof s.name === 'string' ? s.name.slice(0, 80) : '' };
    if (s.kind === 'culvert') {
      const rise = posn(s.rise, 100), length = posn(s.length, 1e4);
      if (!rise || !length || !big(s.invUp) || !big(s.invDown)) continue;
      const shape = s.shape === 'circle' ? 'circle' : 'box';
      const span = shape === 'box' ? posn(s.span, 1000) : rise;
      if (!span) continue;
      out.push({ ...base, kind: 'culvert', shape, rise, span, barrels: Math.max(1, Math.min(20, s.barrels | 0 || 1)), length, invUp: s.invUp, invDown: s.invDown,
        n: num(s.n) > 0 && s.n < 0.2 ? s.n : 0.013, ke: num(s.ke) >= 0 && s.ke <= 2 ? s.ke : cd.ke, cd: num(s.cd) > 0 && s.cd <= 1 ? s.cd : cd.cdC, cw: posn(s.cw, 10) || cd.cw,
        roadCrest: big(s.roadCrest) ? s.roadCrest : null, roadLength: posn(s.roadLength, 1e5) || (ft ? 100 : 30), roadCw: posn(s.roadCw, 10) || cd.cw });
    } else if (s.kind === 'bridge') {
      if (!big(s.abutL) || !big(s.abutR) || !(s.abutR > s.abutL) || !big(s.lowChord) || !big(s.deckTop) || !(s.deckTop >= s.lowChord)) continue;
      out.push({ ...base, kind: 'bridge', abutL: s.abutL, abutR: s.abutR, lowChord: s.lowChord, deckTop: s.deckTop, deckWidth: posn(s.deckWidth, 1e4) || (ft ? 30 : 9),
        piers: (Array.isArray(s.piers) ? s.piers : []).slice(0, 30).filter((p) => p && big(p.o) && posn(p.w, 1000)).map((p) => ({ o: p.o, w: p.w })),
        cd: num(s.cd) > 0 && s.cd <= 1 ? s.cd : 0.8, cw: posn(s.cw, 10) || cd.cw, cc: num(s.cc) >= 0 && s.cc <= 1 ? s.cc : 0.3, ce: num(s.ce) >= 0 && s.ce <= 1 ? s.ce : 0.5,
        weirLength: posn(s.weirLength, 1e5) });
    }
  }
  return out;
}

/** How the sections were cut (the River tool's and Cut sections again's numbers). */
function cleanSettings(v, units) {
  const d = RIVER_DEFAULTS(units), out = {};
  for (const k of ['spacing', 'left', 'right', 'bank']) out[k] = v && num(v[k]) > 0 && v[k] < 1e5 ? v[k] : d[k];
  for (const k of ['n', 'nOver']) out[k] = v && num(v[k]) > 0 && v[k] < 1 ? v[k] : d[k];
  return out;
}

export function newRiver({ id = 'r1', name = '', units = 'm', centreline = [] } = {}) {
  return cleanRiver({ id, name, units, centreline, sections: [], profiles: [] });
}

export function riverStation(centreline, p) {
  const L = lineLength(centreline), at = locateOn(centreline, p);
  return at ? { rs: L - at.d, off: at.off } : null;
}

export function sectionFromLine(surface, centreline, cut, opts = {}) {
  if (!Array.isArray(cut) || cut.length < 2) return null;
  const units = opts.units === 'ft' ? 'ft' : 'm', d = { ...RIVER_DEFAULTS(units), ...opts };
  const L = lineLength(centreline);
  let ln = cut.map((p) => ({ x: p.x, y: p.y }));
  let hit = crossing(ln, centreline);
  if (!hit) return null;
  // left to right looking downstream: the first point must be to the LEFT of the centreline
  const first = locateOn(centreline, ln[0]);
  if (first && first.off > 0) { ln = ln.reverse(); hit = crossing(ln, centreline); }
  const sec = cutSection(surface, ln, { origin: hit.da });
  if (!sec.runs.length) return null;
  const pts = flatten(sec.runs.length > 1 ? [sec.runs.reduce((a, b) => (b.length > a.length ? b : a))] : sec.runs);
  const lo = pts[0].o, hi = pts[pts.length - 1].o, low = lowest([pts]);
  const banks = [Math.max(lo, low.o - d.bank), Math.min(hi, low.o + d.bank)];
  return {
    id: opts.id || 'xs',
    rs: Number((L - hit.db).toFixed(6)),
    name: '',
    line: ln,
    lineAt0: hit.da,
    pts: pts.map((p) => ({ o: Number(p.o.toFixed(6)), z: p.z })),
    banks,
    n: [{ o: lo, n: d.nOver }, { o: banks[0], n: d.n }, { o: banks[1], n: d.nOver }],
    reach: { lob: null, ch: null, rob: null },
    cc: d.cc,
    ce: d.ce,
    alpha: null,
    gaps: sec.runs.length > 1,
  };
}

export function sectionsAlong(surface, centreline, opts = {}) {
  const units = opts.units === 'ft' ? 'ft' : 'm', d = { ...RIVER_DEFAULTS(units), ...opts };
  const L = lineLength(centreline);
  if (!(L > 0) || !(d.spacing > 0)) return [];
  const ds = [];
  for (let k = 0; k * d.spacing < L - 1e-9 && ds.length < MAX_SECTIONS - 1; k++) ds.push(k * d.spacing);
  ds.push(L);
  const out = [];
  for (const at of ds) {
    const s = sectionFromLine(surface, centreline, squareAcross(centreline, at, d.left, d.right), { ...d, id: 'xs' + (out.length + 1) });
    if (s) { s.rs = Number((L - at).toFixed(6)); out.push(s); }
  }
  return out;
}

export function ordered(model) {
  return model.sections.slice().sort((a, b) => a.rs - b.rs);
}

function overbankMid(sec, side) {
  if (!sec.line?.length || sec.line.length < 2 || sec.lineAt0 === null) return null;
  const lo = sec.pts[0].o, hi = sec.pts[sec.pts.length - 1].o;
  const o = side === 'lob' ? (lo + sec.banks[0]) / 2 : (sec.banks[1] + hi) / 2;
  const p = pointAt(sec.line, o + sec.lineAt0);   // offset o lies at distance o + lineAt0 along the cut line
  return { x: p.x, y: p.y };
}

export function setReachLengths(model) {
  const s = ordered(model);
  for (let i = 0; i < s.length; i++) {
    const me = s[i], dn = s[i - 1];
    if (!dn) { me.reach = { lob: 0, ch: 0, rob: 0 }; continue; }
    const ch = me.rs - dn.rs;
    const side = (k) => {
      const a = overbankMid(me, k), b = overbankMid(dn, k);
      return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : ch;
    };
    me.reach = { lob: side('lob'), ch, rob: side('rob') };
  }
  return model;
}

export function flowAt(profile, rs) {
  let q = profile.q, best = Infinity;
  // the nearest change at or upstream of rs holds
  for (const c of profile.changes || []) if (c.rs >= rs - 1e-9 && c.rs < best) { best = c.rs; q = c.q; }
  return q;
}

export function nZonesFor(sec) {
  const lo = sec.pts[0].o, hi = sec.pts[sec.pts.length - 1].o;
  const z = (sec.n || []).slice().sort((a, b) => a.o - b.o);
  const out = [];
  for (let i = 0; i < z.length; i++) {
    const o0 = i === 0 ? lo : Math.max(lo, z[i].o), o1 = i + 1 < z.length ? Math.min(hi, z[i + 1].o) : hi;
    if (o1 > o0) out.push({ o0, o1, n: z[i].n });
  }
  return out.length ? out : [{ o0: lo, o1: hi, n: RIVER_DEFAULTS().n }];
}

export function check(model) {
  const out = [];
  if (!model) return [{ code: 'nomodel' }];
  if (model.sections.length < 2) out.push({ code: 'fewsections' });
  if (!model.profiles.length) out.push({ code: 'noprofile' });
  const rs = new Set();
  for (const s of model.sections) {
    if (rs.has(s.rs)) out.push({ code: 'samers', id: s.id, rs: s.rs });
    rs.add(s.rs);
    if (!(s.banks[1] > s.banks[0])) out.push({ code: 'banks', id: s.id, rs: s.rs });
    const zb = Math.min(...s.pts.map((p) => p.z));
    if (!(s.pts.some((p) => p.o > s.banks[0] && p.o < s.banks[1]) || s.pts.some((p) => p.o >= s.banks[0] && p.o <= s.banks[1] && p.z === zb))) out.push({ code: 'emptychannel', id: s.id, rs: s.rs });
    if (s.gaps) out.push({ code: 'gaps', id: s.id, rs: s.rs });
    if ((s.levees?.left && s.levees.left.o > s.banks[0]) || (s.levees?.right && s.levees.right.o < s.banks[1])) out.push({ code: 'levee', id: s.id, rs: s.rs });
    if ((s.ineff || []).some((r) => r.o0 < s.banks[1] && r.o1 > s.banks[0])) out.push({ code: 'ineffchannel', id: s.id, rs: s.rs });
  }
  const s = ordered(model);
  for (let i = 1; i < s.length; i++) {
    const r = s[i].reach;
    if (!(r.ch > 0) || r.lob === null || r.rob === null) out.push({ code: 'reach', id: s[i].id, rs: s[i].rs });
  }
  for (const p of model.profiles) {
    if (model.regime !== 'super' && !p.down) out.push({ code: 'nodown', profile: p.name });
    if (model.regime !== 'sub' && !p.up) out.push({ code: 'noup', profile: p.name });
  }
  return out;
}
