/* SPDX-License-Identifier: Apache-2.0 */
/**
 * templates.js — corridor templates (0.9 SU.1110 + WB.6, session `civil-templates-09`). No DOM, no storage: the UI
 * (templates-ui.js) keeps the library in localStorage and files; the corridor (corridor.js) and the terrain templates
 * (project.js) call evalTemplate.
 *
 * A TEMPLATE is a small cross-section drawn for the RIGHT side of a centreline, in template coordinates (o, z): o = the
 * offset outward from the template's 0,0 point, z = the height above it. The left side uses the same template outward
 * to the left, so it is never mirrored by hand.
 *
 *   { id, name, kind 'pavement' | 'end' | 'terrain', note, check (true = an example, for checking by an engineer),
 *     source 'example' | 'mine' | 'file' | 'project',
 *     params:     [{ key, value, kind 'len' | 'slope' | 'ratio' }]                            the template's own numbers
 *     points:     [{ code, from, kind, dx, dz, slope, cut, fill, top, target, name, material }]  in order; each from an earlier one
 *     components: [{ name, material, kind, pts: [code…] }]                                    closed shapes through point codes
 *   }
 *
 * POINTS. `from` is '0' (the template's 0,0 point) or the code of an earlier point. Numbers (dx, dz, slope, cut, fill) are
 * a number or the key of one of the params, so a template is parametric: a corridor's use of it may give other values
 * (use.params), and a point may be moved by a TARGET (`target` 'width' = its offset comes from a line, 'elev' = its
 * height). Kinds:
 *   slope     o = from.o + dx, z = from.z + dx × slope          (slope = rise per run outward: −0.02 falls 2 % away)
 *   delta     o = from.o + dx, z = from.z + dz
 *   vertical  o = from.o,      z = from.z + dz
 *   daylight  a side slope from `from` outward to the ground: up at 1 : cut in cut, down at 1 : fill in fill (H : V)
 *   ground    o = from.o + dx, z = the ground there (straight up or down to it)
 *   wall      a retaining wall dx thick at `from`: in cut the wall's road face is exposed and its top meets the ground; in
 *             fill the road runs over it and its outer face drops to the ground. It brings its own component (name,
 *             material) and two points: code_I (the wall's top at the road side or the road over it) and code (on the ground)
 * `top` = the point is on the finished surface; the surface runs through the top points in order. The LAST top point is
 * where the next template on the same side starts (its "attach" point). A daylight, ground or wall point as the last top
 * point makes the template an END CONDITION: nothing attaches after it and it meets the ground.
 *
 * COMPONENTS are closed shapes (≥ 3 point codes, '0' allowed) with a name, a material and a kind (COMP_KINDS); their area in
 * each section times the length gives each material's volume (average end areas, measured along the centreline).
 *
 * TERRAIN TEMPLATES (WB.6): the same templates draped on a terrain from their 0,0 point: widths and slopes do not matter,
 * only each component's height range above or below the 0,0 point (top = its highest point, bottom = its lowest). Clipped by a
 * plan shape: terrainQuantities(surface, clip, tpl, params) → layers with plan area, sloped area and volume.
 *
 *   TPL_FORMAT, TPL_VERSION, TPL_EXT, TPL_KINDS, POINT_KINDS, COMP_KINDS, PARAM_KINDS, MAX_* limits
 *   cleanTemplate(o, units) → template | null          (untrusted: a file, the library, the project)
 *   templateProblems(tpl) → [{ code, at, vars }]       what is wrong with a template being drawn (the creation tool lists them)
 *   paramValue(tpl, key, overrides) · evalTemplate(tpl, { params, origin, ground, cast, hit }) → { pts, top, attach, end, comps, problems }
 *   endKind(tpl) → 'daylight' | 'ground' | 'wall' | null      (the kind of its last top point when that ends it)
 *   exampleTemplates(units) → templates marked check: true (placeholders to check, never a standard's numbers)
 *   templatesFile(list) / readTemplatesFile(obj, units) → { templates, notes }   the .cctemplates.json file
 *   polyArea2(poly) · terrainLayers(tpl, params) · terrainQuantities(surface, clip, tpl, params, { cell })
 *   cleanRegions(list, ids) · cleanUse(u, ids) · regionAt(regions, sta) → index
 */

export const TPL_FORMAT = 'cadcraft-corridor-templates';
export const TPL_VERSION = 1;
export const TPL_EXT = '.cctemplates.json';   // i18n-ignore: a file name ending
export const TPL_KINDS = ['pavement', 'end', 'terrain'];
export const POINT_KINDS = ['slope', 'delta', 'vertical', 'daylight', 'ground', 'wall'];
export const COMP_KINDS = ['surface', 'binder', 'base', 'subbase', 'concrete', 'wall', 'fill', 'topsoil', 'other'];
export const PARAM_KINDS = ['len', 'slope', 'ratio'];
export const TARGET_KINDS = ['', 'width', 'elev'];
export const MAX_POINTS = 40, MAX_COMPS = 16, MAX_PARAMS = 16, MAX_TEMPLATES = 200, MAX_REGIONS = 50, MAX_USES = 8;
export const ORIGIN = '0';
const END_KINDS = new Set(['daylight', 'ground', 'wall']);
const CODE_RE = /^[A-Z][A-Z0-9_]{0,15}$/;
const KEY_RE = /^[a-z][a-z0-9_]{0,23}$/;
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const str = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

/** A number field: a finite number within limits, or a param key that exists. */
function numOrKey(v, keys, lo, hi) {
  if (fin(v)) return v >= lo && v <= hi ? v : undefined;
  if (typeof v === 'string' && KEY_RE.test(v.replace(/^-/, '')) && keys.has(v.replace(/^-/, ''))) return v;   // '-key' = the param negated
  return undefined;
}

/** An untrusted template → a clean one (or null when nothing usable is left). Keeps what can be kept, in order. */
export function cleanTemplate(o, units = 'ft') {
  if (!o || typeof o !== 'object') return null;
  const big = units === 'm' ? 300 : 1000;
  const params = [];
  for (const p of Array.isArray(o.params) ? o.params.slice(0, 64) : []) {
    if (!p || typeof p !== 'object' || !KEY_RE.test(String(p.key)) || !fin(p.value) || Math.abs(p.value) > big) continue;
    if (params.some((x) => x.key === p.key)) continue;
    params.push({ key: p.key, value: p.value, kind: PARAM_KINDS.includes(p.kind) ? p.kind : 'len' });
    if (params.length >= MAX_PARAMS) break;
  }
  const keys = new Set(params.map((p) => p.key));
  const codes = new Set([ORIGIN]), points = [];
  for (const q of Array.isArray(o.points) ? o.points.slice(0, 200) : []) {
    if (!q || typeof q !== 'object' || !CODE_RE.test(String(q.code)) || codes.has(q.code) || !POINT_KINDS.includes(q.kind)) continue;
    const from = codes.has(String(q.from)) ? String(q.from) : null;
    if (from === null) continue;
    const pt = { code: q.code, from, kind: q.kind };
    const set = (k, lo, hi, need) => { const v = numOrKey(q[k], keys, lo, hi); if (v !== undefined) pt[k] = v; else if (need !== undefined) pt[k] = need; };
    if (q.kind === 'slope') { set('dx', -big, big, 0); set('slope', -10, 10, 0); }
    else if (q.kind === 'delta') { set('dx', -big, big, 0); set('dz', -big, big, 0); }
    else if (q.kind === 'vertical') set('dz', -big, big, 0);
    else if (q.kind === 'daylight') { set('cut', 0.05, 1000, 2); set('fill', 0.05, 1000, 3); }
    else if (q.kind === 'ground') set('dx', -big, big, 0);
    else if (q.kind === 'wall') { set('dx', 0, big / 10, units === 'm' ? 0.3 : 1); pt.name = str(q.name, 60); pt.material = str(q.material, 60); }
    pt.top = q.top === true || q.kind === 'wall';
    const tg = TARGET_KINDS.includes(q.target) ? q.target : '';
    if (tg && (q.kind === 'slope' || q.kind === 'delta' || (tg === 'elev' && q.kind === 'vertical'))) pt.target = tg;
    codes.add(q.code);
    points.push(pt);
    if (points.length >= MAX_POINTS) break;
  }
  const comps = [];
  for (const c of Array.isArray(o.components) ? o.components.slice(0, 64) : []) {
    if (!c || typeof c !== 'object' || !Array.isArray(c.pts)) continue;
    const pts = c.pts.slice(0, 64).map(String).filter((k) => codes.has(k) || (k.endsWith('_I') && points.some((p) => p.kind === 'wall' && p.code + '_I' === k)));
    if (pts.length < 3) continue;
    comps.push({ name: str(c.name, 60), material: str(c.material, 60), kind: COMP_KINDS.includes(c.kind) ? c.kind : 'other', pts });
    if (comps.length >= MAX_COMPS) break;
  }
  const name = str(o.name, 80);
  if (!points.length) return null;   // a template with no point places nothing
  const out = { name: name || 'Template', kind: TPL_KINDS.includes(o.kind) ? o.kind : 'pavement', note: str(o.note, 500), check: o.check === true, params, points, components: comps };   // i18n-ignore: a fallback name stored in a file (the UI names it)
  if (typeof o.id === 'string' && /^[a-z]+[0-9a-z-]{0,40}$/.test(o.id)) out.id = o.id;
  if (['example', 'mine', 'file', 'project'].includes(o.source)) out.source = o.source;
  return out;
}

/** The value of a number field: a number, or a param (the use's override first, then the template's own value). */
export function paramValue(tpl, v, overrides = {}) {
  if (fin(v)) return v;
  if (typeof v !== 'string') return NaN;
  const neg = v.startsWith('-'), k = neg ? v.slice(1) : v, sg = neg ? -1 : 1;
  if (overrides && fin(overrides[k])) return sg * overrides[k];
  const p = tpl.params?.find((x) => x.key === k);
  return p ? sg * p.value : NaN;
}

/** The end kind of a template: its last top point's kind when that is a daylight, ground or wall point. */
export function endKind(tpl) {
  const tops = (tpl?.points || []).filter((p) => p.top);
  const last = tops[tops.length - 1];
  return last && END_KINDS.has(last.kind) ? last.kind : null;
}

/** What is wrong with a template (for the creation tool; a clean template can still have these). [{ code, at, vars }] */
export function templateProblems(tpl) {
  const out = [];
  if (!tpl) return [{ code: 'empty' }];
  const pts = tpl.points || [];
  if (!pts.length) out.push({ code: 'nopoints' });
  if (tpl.kind !== 'terrain' && !pts.some((p) => p.top)) out.push({ code: 'notop' });
  const tops = pts.filter((p) => p.top);
  tops.forEach((p, i) => { if (END_KINDS.has(p.kind) && i < tops.length - 1) out.push({ code: 'endnotlast', at: p.code }); });
  if (tpl.kind === 'end' && !endKind(tpl)) out.push({ code: 'endnoground' });
  if (tpl.kind === 'pavement' && endKind(tpl)) out.push({ code: 'pavementends' });
  if (tpl.kind === 'terrain' && !(tpl.components || []).length) out.push({ code: 'terrainnocomp' });
  for (const p of pts) for (const k of ['dx', 'dz', 'slope', 'cut', 'fill']) {
    if (typeof p[k] === 'string' && !tpl.params?.some((x) => x.key === p[k].replace(/^-/, ''))) out.push({ code: 'noparam', at: p.code, vars: { key: p[k] } });
  }
  const r = evalTemplate(tpl, {});
  for (const c of r.comps) if (c.area < 1e-9) out.push({ code: 'flatcomp', at: c.name || String(c.k + 1) });
  return out;
}

/**
 * Work a template out from an origin.
 *   origin {o, z}: where its 0,0 point sits (the corridor: the attach point of the template before it on this side)
 *   ground(o) → z | null: the ground at offset o (none = a preview: ground points sit 1 unit below, daylight a short stub)
 *   cast(from {o,z}, cut, fill) → {o, z, kind} : a side slope to the ground (the corridor's castSlope)
 *   hit(code, what) → { o } | { z } | null    : a target's line for that point (width → its offset, elev → its height)
 * → { pts: Map(code → {o, z, code, kind}), top: [{o, z, code, kind}], attach, end (bool), comps: [{ k, name, material,
 *     kind, poly: [{o,z}], area }], problems: [code…], hits: n }
 */
export function evalTemplate(tpl, { params = {}, origin = { o: 0, z: 0 }, ground = null, cast = null, hit = null } = {}) {
  const pts = new Map([[ORIGIN, { o: origin.o, z: origin.z, code: ORIGIN, kind: 'origin' }]]);
  const top = [], problems = [], comps = [];
  let hits = 0;
  const V = (v) => paramValue(tpl, v, params);
  const wallComps = [];
  for (const q of tpl.points || []) {
    const b = pts.get(q.from);
    if (!b || !Number.isFinite(b.z)) { problems.push('from'); continue; }
    let o = b.o, z = b.z, kind = q.kind;
    const h = q.target && hit ? hit(q.code, q.target) : null;
    if (h) hits++;
    if (q.kind === 'slope' || q.kind === 'delta') {
      const dx = V(q.dx);
      o = h && q.target === 'width' && Number.isFinite(h.o) ? h.o : b.o + dx;
      z = q.kind === 'slope' ? b.z + (o - b.o) * V(q.slope) : b.z + V(q.dz);
      if (h && q.target === 'elev' && Number.isFinite(h.z)) z = h.z;
    } else if (q.kind === 'vertical') {
      z = h && q.target === 'elev' && Number.isFinite(h.z) ? h.z : b.z + V(q.dz);
    } else if (q.kind === 'daylight') {
      const cut = V(q.cut), fill = V(q.fill);
      if (cast) { const r = cast(b, cut, fill); o = r.o; z = r.z; kind = r.kind === 'off' ? 'off' : 'daylight'; }
      else { o = b.o + fill; z = b.z - 1; kind = 'preview'; }
    } else if (q.kind === 'ground') {
      o = b.o + V(q.dx);
      const g = ground ? ground(o) : null;
      if (g === null || g === undefined) { z = ground ? b.z : b.z - 1; kind = ground ? 'off' : 'preview'; } else z = g;
    } else if (q.kind === 'wall') {
      const T = Math.max(0, V(q.dx));
      const gi = ground ? ground(b.o) : b.z - 3, go = ground ? ground(b.o + T) : b.z - 3;
      if (gi === null || go === null || gi === undefined || go === undefined) {
        const off = { o: b.o + T, z: b.z, code: q.code, kind: 'off' };
        pts.set(q.code + '_I', { o: b.o + T, z: b.z, code: q.code + '_I', kind: 'wall' }); pts.set(q.code, off);
        if (q.top) top.push(pts.get(q.code + '_I'), off);
        continue;
      }
      const cut = go > b.z;
      const inner = cut ? { o: b.o, z: gi } : { o: b.o + T, z: b.z };
      const outer = { o: b.o + T, z: go };
      pts.set(q.code + '_I', { ...inner, code: q.code + '_I', kind: 'wall' });
      pts.set(q.code, { ...outer, code: q.code, kind: ground ? 'wall' : 'preview' });
      top.push(pts.get(q.code + '_I'), pts.get(q.code));
      const poly = cut ? [{ o: b.o, z: b.z }, { o: b.o, z: gi }, { o: b.o + T, z: go }, { o: b.o + T, z: b.z }]
        : [{ o: b.o, z: b.z }, { o: b.o + T, z: b.z }, { o: b.o + T, z: go }, { o: b.o, z: gi }];
      wallComps.push({ name: q.name || '', material: q.material || '', kind: 'wall', poly, wall: q.code, h: Math.abs(go - b.z) });
      continue;
    }
    if (!Number.isFinite(o) || !Number.isFinite(z)) { problems.push('number'); continue; }
    const p = { o, z, code: q.code, kind };
    pts.set(q.code, p);
    if (q.top) top.push(p);
  }
  (tpl.components || []).forEach((c, k) => {
    const poly = c.pts.map((code) => pts.get(code)).filter(Boolean);
    if (poly.length !== c.pts.length || poly.length < 3) return;
    comps.push({ k, name: c.name, material: c.material, kind: c.kind, poly: poly.map((p) => ({ o: p.o, z: p.z })), area: Math.abs(polyArea2(poly)) });
  });
  wallComps.forEach((w, i) => comps.push({ k: (tpl.components || []).length + i, ...w, area: Math.abs(polyArea2(w.poly)) }));
  const last = top[top.length - 1];
  const end = endKind(tpl) !== null;
  return { pts, top, attach: last || pts.get(ORIGIN), end, comps, problems, hits };
}

/** The signed area of a polygon in (o, z) (or (x, y) when given those). */
export function polyArea2(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    const px = p.o ?? p.x, pz = p.z ?? p.y, qx = q.o ?? q.x, qz = q.z ?? q.y;
    a += px * qz - qx * pz;
  }
  return a / 2;
}

// ---------------------------------------------------------------------------------------------------- examples
/**
 * Example templates: curb and gutter, sidewalk, two lanes with courses, daylight, ditch, retaining wall, and two terrain
 * templates (topsoil below, pavement on). Every one is check: true — placeholders to edit and have an engineer check,
 * never a standard's or an agency's numbers. Names and notes are text keys the UI translates (tpl.ex.<id>.name / .note).
 */
export function exampleTemplates(units = 'ft') {
  const m = units === 'm';
  const L = (ft, mm) => (m ? mm : ft);   // a length in the project's units
  const P = (key, value, kind = 'len') => ({ key, value, kind });
  const ex = (id, kind, params, points, components) => cleanTemplate({ id: 'ex-' + id, name: 'tpl.ex.' + id + '.name', note: 'tpl.ex.' + id + '.note', kind, check: true, source: 'example', params, points, components }, units);
  return [
    ex('lanes', 'pavement', [P('w', L(12, 3.6)), P('s', -0.02, 'slope'), P('t1', L(0.33, 0.1)), P('t2', L(0.67, 0.2))], [
      { code: 'EOP', from: '0', kind: 'slope', dx: 'w', slope: 's', top: true, target: 'width' },
      { code: 'SUR_C', from: '0', kind: 'vertical', dz: '-t1' },
      { code: 'SUR_E', from: 'EOP', kind: 'vertical', dz: '-t1' },
      { code: 'BAS_C', from: 'SUR_C', kind: 'vertical', dz: '-t2' },
      { code: 'BAS_E', from: 'SUR_E', kind: 'vertical', dz: '-t2' },
    ], [
      { name: 'tpl.ex.lanes.surface', material: 'tpl.mat.asphalt', kind: 'surface', pts: ['0', 'EOP', 'SUR_E', 'SUR_C'] },
      { name: 'tpl.ex.lanes.base', material: 'tpl.mat.aggregate', kind: 'base', pts: ['SUR_C', 'SUR_E', 'BAS_E', 'BAS_C'] },
    ]),
    ex('curb', 'pavement', [P('gw', L(2, 0.6)), P('gs', -0.08, 'slope'), P('ch', L(0.5, 0.15)), P('cw', L(0.5, 0.15)), P('d', L(0.67, 0.2))], [
      { code: 'FL', from: '0', kind: 'slope', dx: 'gw', slope: 'gs', top: true },
      { code: 'TC', from: 'FL', kind: 'delta', dx: L(0.01, 0.003), dz: 'ch', top: true },
      { code: 'BC', from: 'TC', kind: 'slope', dx: 'cw', slope: 0, top: true },
      { code: 'GB', from: '0', kind: 'vertical', dz: '-d' },
      { code: 'BCB', from: 'BC', kind: 'vertical', dz: m ? -0.35 : -1.17 },
    ], [{ name: 'tpl.ex.curb.body', material: 'tpl.mat.concrete', kind: 'concrete', pts: ['0', 'FL', 'TC', 'BC', 'BCB', 'GB'] }]),
    ex('walk', 'pavement', [P('w', L(5, 1.5)), P('s', 0.02, 'slope'), P('t', L(0.33, 0.1))], [
      { code: 'BW', from: '0', kind: 'slope', dx: 'w', slope: 's', top: true, target: 'width' },
      { code: 'BWB', from: 'BW', kind: 'vertical', dz: '-t' },
      { code: 'FWB', from: '0', kind: 'vertical', dz: '-t' },
    ], [{ name: 'tpl.ex.walk.slab', material: 'tpl.mat.concrete', kind: 'concrete', pts: ['0', 'BW', 'BWB', 'FWB'] }]),
    ex('daylight', 'end', [P('cut', 2, 'ratio'), P('fill', 3, 'ratio')], [
      { code: 'DL', from: '0', kind: 'daylight', cut: 'cut', fill: 'fill', top: true },
    ], []),
    ex('ditch', 'end', [P('fw', L(8, 2.4)), P('fs', -0.25, 'slope'), P('b', L(4, 1.2)), P('back', 3, 'ratio')], [
      { code: 'DF', from: '0', kind: 'slope', dx: 'fw', slope: 'fs', top: true },
      { code: 'DB', from: 'DF', kind: 'slope', dx: 'b', slope: 0, top: true },
      { code: 'DL', from: 'DB', kind: 'daylight', cut: 'back', fill: 'back', top: true },
    ], []),
    ex('wall', 'end', [P('t', L(1, 0.3))], [
      { code: 'W', from: '0', kind: 'wall', dx: 't', name: 'tpl.ex.wall.body', material: 'tpl.mat.concrete' },
    ], []),
    ex('topsoil', 'terrain', [P('t', L(0.5, 0.15))], [
      { code: 'A', from: '0', kind: 'delta', dx: 1, dz: 0 },
      { code: 'B', from: 'A', kind: 'vertical', dz: '-t' },
      { code: 'C', from: '0', kind: 'vertical', dz: '-t' },
    ], [{ name: 'tpl.ex.topsoil.layer', material: 'tpl.mat.topsoil', kind: 'topsoil', pts: ['0', 'A', 'B', 'C'] }]),
    ex('parking', 'terrain', [P('base', L(1, 0.3)), P('pave', L(5 / 12, 0.125))], [
      { code: 'A', from: '0', kind: 'delta', dx: 1, dz: 0 },
      { code: 'B1', from: '0', kind: 'vertical', dz: 'base' },
      { code: 'B2', from: 'A', kind: 'vertical', dz: 'base' },
      { code: 'S1', from: 'B1', kind: 'vertical', dz: 'pave' },
      { code: 'S2', from: 'B2', kind: 'vertical', dz: 'pave' },
    ], [
      { name: 'tpl.ex.parking.base', material: 'tpl.mat.aggregate', kind: 'base', pts: ['0', 'A', 'B2', 'B1'] },
      { name: 'tpl.ex.parking.surface', material: 'tpl.mat.asphalt', kind: 'surface', pts: ['B1', 'B2', 'S2', 'S1'] },
    ]),
  ].filter(Boolean);
}
// ---------------------------------------------------------------------------------------------------- files
/** The template library as a file: { format, version, templates }. */
export function templatesFile(list) {
  return { format: TPL_FORMAT, version: TPL_VERSION, templates: (list || []).map(({ source, ...t }) => t) };
}
/** Read a template file (untrusted). → { templates, notes: [{ code, vars }] } */
export function readTemplatesFile(obj, units = 'ft') {
  if (!obj || obj.format !== TPL_FORMAT) return { templates: [], notes: [{ code: 'notfile' }] };
  if (obj.version !== TPL_VERSION) return { templates: [], notes: [{ code: 'newer', vars: { v: String(obj.version).slice(0, 10) } }] };
  const list = Array.isArray(obj.templates) ? obj.templates.slice(0, MAX_TEMPLATES) : [];
  const templates = list.map((x) => cleanTemplate(x, units)).filter(Boolean).map((x) => ({ ...x, source: 'file' }));
  const notes = templates.length < (Array.isArray(obj.templates) ? obj.templates.length : 0) ? [{ code: 'dropped', vars: { n: obj.templates.length - templates.length } }] : [];
  return { templates, notes };
}

// ---------------------------------------------------------------------------------------------------- corridor regions
/** One use of a template on one side: { tpl (id), params: { key: number }, targets: { CODE: from } } (from as corridor.js cleanTargets). */
export function cleanUse(u, ids) {
  if (!u || typeof u !== 'object' || typeof u.tpl !== 'string' || !ids.has(u.tpl)) return null;
  const params = {};
  if (u.params && typeof u.params === 'object') for (const [k, v] of Object.entries(u.params).slice(0, MAX_PARAMS)) if (KEY_RE.test(k) && fin(v) && Math.abs(v) < 1e5) params[k] = v;
  const targets = {};
  if (u.targets && typeof u.targets === 'object') for (const [k, f] of Object.entries(u.targets).slice(0, 8)) {
    if (!CODE_RE.test(k) || !f || typeof f !== 'object') continue;
    const id = String(f.id ?? '');
    if (f.kind === 'feature' && /^f\d{1,9}$/.test(id)) targets[k] = { kind: 'feature', id };
    else if (f.kind === 'corridor' && /^a\d{1,9}$/.test(id) && typeof f.line === 'string' && /^[A-Z][A-Z0-9_]{0,24}$/.test(f.line)) targets[k] = { kind: 'corridor', id, line: f.line };
  }
  return { tpl: u.tpl, ...(Object.keys(params).length ? { params } : {}), ...(Object.keys(targets).length ? { targets } : {}) };
}
/** The regions of a corridor: [{ from (station), L: { uses: [use], end: use | null }, R: {…} }], sorted by station, one per station. */
export function cleanRegions(list, ids) {
  if (!Array.isArray(list)) return null;
  const out = [];
  for (const r of list.slice(0, 200)) {
    if (!r || typeof r !== 'object' || !fin(r.from)) continue;
    const side = (s) => ({ uses: (Array.isArray(s?.uses) ? s.uses.slice(0, MAX_USES) : []).map((u) => cleanUse(u, ids)).filter(Boolean), end: cleanUse(s?.end, ids) });
    if (out.some((x) => Math.abs(x.from - r.from) < 1e-6)) continue;
    const L = side(r.L), R = side(r.R);
    if (!L.uses.length && !L.end && !R.uses.length && !R.end) continue;   // nothing left to build (its templates are gone)
    out.push({ from: r.from, L, R });
    if (out.length >= MAX_REGIONS) break;
  }
  out.sort((a, b) => a.from - b.from);
  return out.length ? out : null;
}
/** The region a station falls in: the last one starting at or before it (−1 before the first). */
export function regionAt(regions, sta) {
  let k = -1;
  for (let i = 0; i < (regions || []).length; i++) if (regions[i].from <= sta + 1e-9) k = i;
  return k;
}

// ---------------------------------------------------------------------------------------------------- terrain templates
/** A terrain template's layers: each component's height range above (+) or below (−) the 0,0 point, top down. */
export function terrainLayers(tpl, params = {}) {
  const r = evalTemplate(tpl, { params });
  return r.comps.map((c) => {
    const zs = c.poly.map((p) => p.z);
    const top = Math.max(...zs), bottom = Math.min(...zs);
    return { k: c.k, name: c.name, material: c.material, kind: c.kind, top, bottom, t: top - bottom };
  }).filter((L) => L.t > 1e-9).sort((a, b) => b.top - a.top);
}

/** Point in polygon (x, y). */
function inside(x, y, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const p = poly[i], q = poly[j];
    if ((p.y > y) !== (q.y > y) && x < ((q.x - p.x) * (y - p.y)) / (q.y - p.y) + p.x) c = !c;
  }
  return c;
}
/**
 * A terrain template draped on a surface inside a plan shape (clip = [{x,y}], or null = the whole surface's extent). Sampled
 * on a grid of `cell` (default: about 20 000 cells over the shape): plan area = cells on the surface × cell², sloped area adds
 * each cell's slope (from the surface on either side), volume = plan area × the layer's thickness (thickness is measured
 * straight up and down, so a draped layer's volume is its plan area × thickness exactly; only the area is sampled).
 * → { ok, cells, cell, planArea, slopedArea, shapeArea, layers: [{ …terrainLayers row, volume, planArea, slopedArea }] }
 */
export function terrainQuantities(surface, clip, tpl, params = {}, { cell } = {}) {
  const layers = terrainLayers(tpl, params);
  if (!surface) return { ok: false, why: 'noground', layers: [] };
  const b = surface.bounds;
  const poly = clip && clip.length >= 3 ? clip : [{ x: b.minX, y: b.minY }, { x: b.maxX, y: b.minY }, { x: b.maxX, y: b.maxY }, { x: b.minX, y: b.maxY }];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of poly) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  const shapeArea = Math.abs(polyArea2(poly));
  if (!(shapeArea > 0)) return { ok: false, why: 'noshape', layers: [] };
  const c = cell > 0 ? cell : Math.sqrt(shapeArea / 20000);
  let n = 0, sloped = 0;
  const h = c / 2;
  for (let y = y0 + h; y < y1; y += c) for (let x = x0 + h; x < x1; x += c) {
    if (!inside(x, y, poly)) continue;
    const z = surface.elevationAt(x, y);
    if (z === null || z === undefined || !Number.isFinite(z)) continue;
    n++;
    const zx1 = surface.elevationAt(x + h, y), zx0 = surface.elevationAt(x - h, y), zy1 = surface.elevationAt(x, y + h), zy0 = surface.elevationAt(x, y - h);
    const gx = Number.isFinite(zx1) && Number.isFinite(zx0) ? (zx1 - zx0) / c : 0, gy = Number.isFinite(zy1) && Number.isFinite(zy0) ? (zy1 - zy0) / c : 0;
    sloped += Math.sqrt(1 + gx * gx + gy * gy);
  }
  const planArea = n * c * c, slopedArea = sloped * c * c;
  return { ok: n > 0, why: n > 0 ? '' : 'offground', cells: n, cell: c, planArea, slopedArea, shapeArea,
    layers: layers.map((L) => ({ ...L, planArea, slopedArea, volume: planArea * L.t, where: L.bottom >= -1e-9 ? 'on' : L.top <= 1e-9 ? 'below' : 'both' })) };
}
