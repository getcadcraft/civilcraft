/* SPDX-License-Identifier: Apache-2.0 */
/**
 * symbol-sets.js — the registry of plan symbol sets (0.8 round 3, GH.3-F/G, session `gh3sym_PART_3`). Canonical in lib/symbols/; copied
 * byte for byte into a host's dev/ by `node tools/symbols/sync.mjs <host>`; never edit a copy. No DOM, no imports: bin/test-symbols.mjs
 * runs it in Node. BimCraft is the first host (rule 39); electrical and plumbing are the first two sets; any host or add-on can register more.
 *
 * A SET is data (rule 44, content first):
 *   { id, version, name, license: 'Apache-2.0' | 'CC0-1.0', source: 'what it was drawn from', scale: 'paper',
 *     categories: [{ id, name }], symbols: [{ key, category, name, abbr?, kind: 'symbol' | 'line' | 'valve', wall?: true (sits on a wall: back to the wall), ents: [...] }] }
 * Geometry (`ents`) is in PAPER millimetres for a 1:50 plan (the same drawings the Electrical add-on uses): the host multiplies by its
 * plan scale, so a symbol scales with the drawing. Origin = the placement point; +y = the way the symbol faces (into the room when it
 * sits on a wall). Entities: line {x1 y1 x2 y2} · circle {cx cy r} · arc {cx cy r a0 a1 (radians, anticlockwise)} ·
 * poly {pts [{x y}], closed} · hatch {solid, loops [[x, y, …]]} · text {x y h s}.
 * `name` / `category.name` are the English words; a host with a language catalogue gives `nameKey` (looked up first).
 *
 *   createSymbolSets() → registry
 *     .register(set) → { ok, set, problems }   a set is read as untrusted data (bounds, ids, geometry); bad symbols are dropped and reported
 *     .unregister(id) · .has(id) · .get(id) · .list()
 *     .find(setId, key) → symbol | null
 *     .search(query, { set, category, keys, t }) → [{ set, symbol, category, label }]   words and abbreviations, accent- and case-blind
 *   readSet(obj) → { set, problems }            the validation on its own
 *   setProblems(setId, problems) · placedProblems(placed, registry) → the shared Problems shape (docs/0.8-PROBLEMS-SPEC.md § 1–2)
 *   symbolBounds(sym) · symbolSvg(sym, { size, pad }) → an <svg> string for the picture (no scripts, no external references)
 *   symbolPlan(sym, at, angle, scale) → { lines, arcs, thin, poly, text }   the symbol in the plan (plan mm): turned so its +y points along `angle`
 *                                      (radians), scaled by `scale` plan mm per paper mm, moved to `at`; the same maths as BimCraft's electrical symbols
 *   createFavourites(storage, key) → { has(set, key), toggle(set, key), list(), clear() }   kept per browser; storage failures are swallowed
 */

export const LIMITS = { sets: 40, symbols: 400, ents: 300, points: 400, text: 120, coord: 1000 };
const ID_RE = /^[a-z][a-z0-9._-]{0,47}$/;
const KEY_RE = /^[a-z][a-z0-9._-]{0,47}$/;
const KINDS = ['symbol', 'line', 'valve'];
const CTRL = /[\u0000-\u001f\u007f‪-‮⁦-⁩]/g;
const clean = (s, n = LIMITS.text) => String(s ?? '').replace(CTRL, '').trim().slice(0, n);
const fin = (v) => typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= LIMITS.coord;
const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function readEnt(e) {
  if (!e || typeof e !== 'object') return null;
  const ok = (...k) => k.every((x) => fin(e[x]));
  switch (e.type) {
    case 'line': return ok('x1', 'y1', 'x2', 'y2') ? { type: 'line', x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2 } : null;
    case 'circle': return ok('cx', 'cy', 'r') && e.r > 0 ? { type: 'circle', cx: e.cx, cy: e.cy, r: e.r } : null;
    case 'arc': return ok('cx', 'cy', 'r', 'a0', 'a1') && e.r > 0 ? { type: 'arc', cx: e.cx, cy: e.cy, r: e.r, a0: e.a0, a1: e.a1 } : null;
    case 'poly': {
      if (!Array.isArray(e.pts) || e.pts.length < 2 || e.pts.length > LIMITS.points) return null;
      const pts = e.pts.map((p) => (p && fin(p.x) && fin(p.y) ? { x: p.x, y: p.y } : null));
      return pts.every(Boolean) ? { type: 'poly', closed: e.closed === true, pts } : null;
    }
    case 'hatch': {
      if (!Array.isArray(e.loops) || e.loops.length > 20) return null;
      const loops = e.loops.map((l) => (Array.isArray(l) && l.length >= 6 && l.length <= LIMITS.points * 2 && l.length % 2 === 0 && l.every(fin) ? l.slice() : null));
      return loops.every(Boolean) ? { type: 'hatch', solid: e.solid !== false, loops } : null;
    }
    case 'text': return ok('x', 'y', 'h') && e.h > 0 && typeof e.s === 'string' ? { type: 'text', x: e.x, y: e.y, h: e.h, s: clean(e.s, 12), rot: fin(e.rot) ? e.rot : 0 } : null;
    default: return null;
  }
}

/** An untrusted set → a clean one, with a problem for everything that was dropped. */
export function readSet(obj) {
  const problems = [];
  const bad = (code, text, extra = {}) => problems.push({ code, severity: 'warning', text, ...extra });
  if (!obj || typeof obj !== 'object' || !ID_RE.test(String(obj.id || ''))) {
    bad('symbols.set.id', 'A symbol set needs an id of lower case letters, digits, dots and dashes.');
    return { set: null, problems };
  }
  const id = obj.id;
  const set = { id, version: Number.isFinite(obj.version) ? obj.version : 1, name: clean(obj.name) || id, nameKey: clean(obj.nameKey, 80) || null, license: clean(obj.license, 40),
    source: clean(obj.source, 400), scale: 'paper', categories: [], symbols: [] };
  const seenCat = new Set();
  for (const c of Array.isArray(obj.categories) ? obj.categories.slice(0, 40) : []) {
    if (!c || !KEY_RE.test(String(c.id || '')) || seenCat.has(c.id)) { bad('symbols.cat.bad', `Set ${id}: a category was dropped (missing or repeated id).`, { set: id }); continue; }
    seenCat.add(c.id);
    set.categories.push({ id: c.id, name: clean(c.name) || c.id, nameKey: clean(c.nameKey, 80) || null });
  }
  const seen = new Set();
  const list = Array.isArray(obj.symbols) ? obj.symbols : [];
  if (list.length > LIMITS.symbols) bad('symbols.set.big', `Set ${id}: only the first ${LIMITS.symbols} symbols are read.`, { set: id });
  for (const s of list.slice(0, LIMITS.symbols)) {
    const key = String(s?.key || '');
    if (!KEY_RE.test(key) || seen.has(key)) { bad('symbols.sym.key', `Set ${id}: a symbol was dropped (missing or repeated key "${clean(key, 30)}").`, { set: id, key }); continue; }
    const ents = (Array.isArray(s.ents) ? s.ents.slice(0, LIMITS.ents) : []).map(readEnt).filter(Boolean);
    if (!ents.length) { bad('symbols.sym.empty', `Set ${id}: symbol ${key} has no usable drawing and was dropped.`, { set: id, key }); continue; }
    const category = seenCat.has(s.category) ? s.category : null;
    if (!category) bad('symbols.sym.cat', `Set ${id}: symbol ${key} names a category the set does not have; it is listed under Other.`, { set: id, key });
    if (!category && !seenCat.has('other')) { seenCat.add('other'); set.categories.push({ id: 'other', name: 'Other', nameKey: null }); }
    seen.add(key);
    set.symbols.push({ key, category: category || 'other', name: clean(s.name) || key, nameKey: clean(s.nameKey, 80) || null, abbr: clean(s.abbr, 12),
      kind: KINDS.includes(s.kind) ? s.kind : 'symbol', ...(s.wall === true ? { wall: true } : {}), ents, ...(Number.isFinite(s.load) ? { load: s.load } : {}) });
  }
  if (!set.symbols.length) { bad('symbols.set.empty', `Set ${id} has no usable symbols.`, { set: id }); return { set: null, problems }; }
  return { set, problems };
}

export function createSymbolSets() {
  const sets = new Map();
  const reg = {
    register(obj) {
      const r = readSet(obj);
      if (!r.set) return { ok: false, set: null, problems: r.problems };
      if (!sets.has(r.set.id) && sets.size >= LIMITS.sets) return { ok: false, set: null, problems: [{ code: 'symbols.set.many', severity: 'warning', text: 'Too many symbol sets.' }] };
      sets.set(r.set.id, r.set);
      return { ok: true, set: r.set, problems: r.problems };
    },
    unregister: (id) => sets.delete(id),
    has: (id) => sets.has(id),
    get: (id) => sets.get(id) || null,
    list: () => [...sets.values()],
    find: (id, key) => sets.get(id)?.symbols.find((s) => s.key === key) || null,
    /** Words (every word must match) in the name, abbreviation, key or category, in the page's language when `t` is given. */
    search(query, { set = null, category = null, keys = null, t = null } = {}) {
      const words = fold(query).split(/\s+/).filter(Boolean);
      const out = [];
      for (const st of sets.values()) {
        if (set && st.id !== set) continue;
        for (const sym of st.symbols) {
          if (category && sym.category !== category) continue;
          if (keys && !keys.has(st.id + '/' + sym.key)) continue;
          const label = reg.label(sym, t), cat = st.categories.find((c) => c.id === sym.category);
          const hay = fold([label, sym.name, sym.abbr, sym.key.replace(/[._-]/g, ' '), reg.catLabel(cat, t)].join(' '));
          if (words.every((w) => hay.includes(w))) out.push({ set: st.id, symbol: sym, category: sym.category, label });
        }
      }
      return out;
    },
    label: (sym, t) => (t && sym.nameKey ? t(sym.nameKey) : sym.name),
    catLabel: (cat, t) => (!cat ? '' : t && cat.nameKey ? t(cat.nameKey) : cat.name),
  };
  return reg;
}

/** The set's problems in the shared shape (rule 29), source kind 'import' (they come from data a person or an add-on supplied). */
export function setProblems(setId, problems) {
  return (problems || []).map((p, i) => ({ code: p.code, severity: p.severity || 'warning', msg: { key: 'sym.problem.' + p.code, vars: {} }, text: p.text,
    about: [{ kind: 'symbolset', id: setId }], source: { kind: 'import', name: 'symbols.sets' }, id: 'symbols.sets:' + p.code + ':' + setId + (p.key ? '.' + p.key : '#' + i) }));
}
/** Placed symbols whose set or symbol is not here (a file from a build with another set, or a set switched off): drawn as a box, listed. */
export function placedProblems(placed, registry) {
  const out = [];
  for (const p of placed || []) {
    if (registry.find(p.set, p.key)) continue;
    out.push({ code: 'symbols.placed.missing', severity: 'warning', msg: { key: 'sym.problem.symbols.placed.missing', vars: { set: p.set, key: p.key } },
      text: `The symbol "${clean(p.key, 40)}" of the set "${clean(p.set, 40)}" is not available here; the plan shows a box in its place.`,
      about: [{ kind: 'element', id: p.guid, label: clean(p.tag || p.key, 40) }], source: { kind: 'check', name: 'symbols.placed' }, id: 'symbols.placed:' + p.guid });
  }
  return out;
}

/** Placed symbols that were fixed to a wall face whose wall is gone: they stay where they were; listed so the person can move or delete them. */
export function lostWallProblems(placed) {
  const out = [];
  for (const p of placed || []) {
    if (!p.lostWall) continue;
    out.push({ code: 'symbols.placed.nowall', severity: 'warning', msg: { key: 'sym.problem.symbols.placed.nowall', vars: { tag: clean(p.tag || p.key, 40) } },
      text: `The symbol "${clean(p.tag || p.key, 40)}" lost its wall: it stays where it was and no longer follows a wall.`,
      about: [{ kind: 'element', id: p.guid, label: clean(p.tag || p.key, 40) }], source: { kind: 'check', name: 'symbols.placed' }, id: 'symbols.nowall:' + p.guid });
  }
  return out;
}

export function symbolBounds(sym) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const g = (x, y, r = 0) => { if (x - r < x0) x0 = x - r; if (y - r < y0) y0 = y - r; if (x + r > x1) x1 = x + r; if (y + r > y1) y1 = y + r; };
  for (const e of sym.ents) {
    if (e.type === 'line') { g(e.x1, e.y1); g(e.x2, e.y2); } else if (e.type === 'circle' || e.type === 'arc') g(e.cx, e.cy, e.r);
    else if (e.type === 'poly') e.pts.forEach((p) => g(p.x, p.y));
    else if (e.type === 'hatch') e.loops.forEach((l) => { for (let i = 0; i + 1 < l.length; i += 2) g(l[i], l[i + 1]); });
    else if (e.type === 'text') g(e.x, e.y, e.h * (e.s.length || 1) * 0.3);
  }
  return Number.isFinite(x0) ? { x0, y0, x1, y1 } : { x0: -1, y0: -1, x1: 1, y1: 1 };
}
/** A symbol in the plan: rotated (angle in radians; the symbol's +y points along it), scaled, moved to `at`. Lines and arcs are the outline; `thin` the hatch edges; `poly` a pick box. */
export function symbolPlan(sym, at, angle, scale) {
  if (!sym) return null;
  const fx = Math.cos(angle), fy = Math.sin(angle), rx = fy, ry = -fx;
  const P = (x, y) => [at[0] + (x * rx + y * fx) * scale, at[1] + (x * ry + y * fy) * scale];
  const rot = Math.atan2(ry, rx);
  const lines = [], arcs = [], thin = [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const grow = (q, r = 0) => { x0 = Math.min(x0, q[0] - r); y0 = Math.min(y0, q[1] - r); x1 = Math.max(x1, q[0] + r); y1 = Math.max(y1, q[1] + r); };
  const seg = (list, a, b) => { list.push([a[0], a[1], b[0], b[1]]); grow(a); grow(b); };
  for (const e of sym.ents) {
    if (e.type === 'line') seg(lines, P(e.x1, e.y1), P(e.x2, e.y2));
    else if (e.type === 'circle') { const c = P(e.cx, e.cy); arcs.push({ c, r: e.r * scale, a0: 0, a1: Math.PI * 2 }); grow(c, e.r * scale); }
    else if (e.type === 'arc') { const c = P(e.cx, e.cy); const mirror = rx * fy - ry * fx < 0; const a0 = mirror ? rot - e.a1 : rot + e.a0, a1 = mirror ? rot - e.a0 : rot + e.a1; arcs.push({ c, r: e.r * scale, a0, a1 }); grow(c, e.r * scale); }
    else if (e.type === 'poly') { const pts = e.pts.map((q) => P(q.x, q.y)); for (let i = 0; i + 1 < pts.length; i++) seg(lines, pts[i], pts[i + 1]); if (e.closed && pts.length > 2) seg(lines, pts[pts.length - 1], pts[0]); }
    else if (e.type === 'hatch') for (const l of e.loops) { const pts = []; for (let i = 0; i + 1 < l.length; i += 2) pts.push(P(l[i], l[i + 1])); for (let i = 0; i < pts.length; i++) seg(thin, pts[i], pts[(i + 1) % pts.length]); }
  }
  if (!Number.isFinite(x0)) return null;
  const pad = scale * 0.8;
  return { lines, arcs, thin, poly: [[x0 - pad, y0 - pad], [x1 + pad, y0 - pad], [x1 + pad, y1 + pad], [x0 - pad, y1 + pad]], text: sym.ents.find((e) => e.type === 'text')?.s || null };
}

const f = (n) => Math.round(n * 100) / 100;
/** The picture: the plan drawing, +y up (the SVG flips it), fitted to a square of `size` px. Only numbers go into the markup; text is escaped. */
export function symbolSvg(sym, { size = 56, pad = 2 } = {}) {
  const b = symbolBounds(sym), w = Math.max(b.x1 - b.x0, 0.5), h = Math.max(b.y1 - b.y0, 0.5);
  const k = (size - pad * 2) / Math.max(w, h), ox = (size - w * k) / 2 - b.x0 * k, oy = (size + h * k) / 2 + b.y0 * k;
  const X = (x) => f(ox + x * k), Y = (y) => f(oy - y * k);
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sw = f(Math.max(0.9, Math.min(1.6, 0.1 * k)));
  const parts = [];
  for (const e of sym.ents) {
    if (e.type === 'line') parts.push(`<line x1="${X(e.x1)}" y1="${Y(e.y1)}" x2="${X(e.x2)}" y2="${Y(e.y2)}"/>`);
    else if (e.type === 'circle') parts.push(`<circle cx="${X(e.cx)}" cy="${Y(e.cy)}" r="${f(e.r * k)}"/>`);
    else if (e.type === 'arc') {
      let a1 = e.a1; while (a1 < e.a0) a1 += Math.PI * 2;
      const sweep = a1 - e.a0, big = sweep > Math.PI ? 1 : 0;
      parts.push(`<path d="M${X(e.cx + e.r * Math.cos(e.a0))} ${Y(e.cy + e.r * Math.sin(e.a0))}A${f(e.r * k)} ${f(e.r * k)} 0 ${big} 0 ${X(e.cx + e.r * Math.cos(a1))} ${Y(e.cy + e.r * Math.sin(a1))}"/>`);
    } else if (e.type === 'poly') parts.push(`<${e.closed ? 'polygon' : 'polyline'} points="${e.pts.map((p) => X(p.x) + ',' + Y(p.y)).join(' ')}"/>`);
    else if (e.type === 'hatch') for (const l of e.loops) { const pts = []; for (let i = 0; i + 1 < l.length; i += 2) pts.push(X(l[i]) + ',' + Y(l[i + 1])); parts.push(`<polygon points="${pts.join(' ')}" fill="currentColor"/>`); }
    else if (e.type === 'text') parts.push(`<text x="${X(e.x)}" y="${Y(e.y)}" font-size="${f(e.h * k)}" text-anchor="middle" dominant-baseline="central" fill="currentColor" stroke="none" font-family="sans-serif">${esc(e.s)}</text>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${parts.join('')}</svg>`;
}

/** Favourites, kept per browser. `storage` is anything with getItem / setItem (localStorage); a private window or a full disk just means they are not kept. */
export function createFavourites(storage, key = 'cadcraft.symbols.favourites') {
  let set = new Set();
  try { const v = JSON.parse(storage?.getItem(key) || '[]'); if (Array.isArray(v)) set = new Set(v.filter((x) => typeof x === 'string' && x.length < 120).slice(0, 500)); } catch (e) { /* none */ }
  const save = () => { try { storage?.setItem(key, JSON.stringify([...set])); } catch (e) { /* not kept */ } };
  const id = (s, k) => s + '/' + k;
  return {
    has: (s, k) => set.has(id(s, k)),
    toggle(s, k) { const i = id(s, k); if (set.has(i)) set.delete(i); else set.add(i); save(); return set.has(i); },
    list: () => new Set(set),
    clear() { set = new Set(); save(); },
  };
}
