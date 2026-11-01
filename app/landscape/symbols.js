/* SPDX-License-Identifier: Apache-2.0 */
/**
 * symbols.js — plant graphics by scale and detail level, and a record's own symbol and 3D model (0.8 LA.7, session `landscape-arch_PART_4`).
 * No DOM, no imports. Canonical in lib/landscape/; byte-identical copies by `node tools/landscape/sync.mjs`.
 *
 *   LEVELS = ['simple', 'outline', 'detailed'] · DEFAULT_THRESHOLDS = { simple: 500, outline: 200 } (scale denominators)
 *   levelForScale(denominator, thresholds) → level      coarser than 1:500 → simple, coarser than 1:200 → outline, else detailed
 *   simpleSymbol(R, level) → entities | null             'simple' = the spread circle, 'outline' = circle + a centre cross; 'detailed' = null
 *                                                        (the caller draws the record's own or plants.js symbol)
 *   Own symbols (untrusted input; stored in the project as { kind: 'symbol', name, entities } with entities in a unit circle):
 *     symbolFromSvg(text, { maxBytes, maxEntities }) → { entities, notes } | throws Error('bad-svg' | 'too-big' | 'empty')
 *       reads <line> <polyline> <polygon> <rect> <circle> <ellipse> and <path> (M L H V Z, C/S/Q/T flattened, A as a straight segment), no
 *       scripts, styles, links or images are looked at; transforms are not applied (a note says so when one is seen)
 *     symbolFromCad(entities, { maxEntities }) → { entities, notes }   a DXF/DWG block's LINE, CIRCLE, ARC, LWPOLYLINE/POLYLINE (the cc-dwg model)
 *     placeSymbol(sym, R) → entities scaled to radius R (the plants.js symbol entity shape: circle, arc, line, poly)
 *   Own 3D model (OBJ/STL through the host's reader; GLB through glb.js, 0.8 LA.7 landscape-finish_PART_4):
 *     normalizeModel(positions, indices, { maxTris }) → { positions, normals, indices } in the unit box (x, y −0.5…0.5, z 0…1) | throws 'too-big'
 */

export const LEVELS = ['simple', 'outline', 'detailed'];
export const DEFAULT_THRESHOLDS = { simple: 500, outline: 200 };
export const SYMBOL_LIMITS = { bytes: 512 * 1024, entities: 2000, points: 20000, tris: 50000 };
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const r4 = (v) => Math.round(v * 1e4) / 1e4;

export function levelForScale(denom, th = DEFAULT_THRESHOLDS) {
  const s = fin(th?.simple) && th.simple > 0 ? th.simple : DEFAULT_THRESHOLDS.simple, o = fin(th?.outline) && th.outline > 0 ? Math.min(th.outline, s) : DEFAULT_THRESHOLDS.outline;
  return denom >= s ? 'simple' : denom >= o ? 'outline' : 'detailed';
}

export function simpleSymbol(R, level) {
  if (level === 'simple') return [{ type: 'circle', x: 0, y: 0, r: R }];
  if (level === 'outline') { const c = R * 0.12; return [{ type: 'circle', x: 0, y: 0, r: R }, { type: 'line', x1: -c, y1: 0, x2: c, y2: 0 }, { type: 'line', x1: 0, y1: -c, x2: 0, y2: c }]; }
  return null;
}

/** Entities (circle / arc / line / poly with [x, y] points) → centred on their box, scaled so the farthest point is at radius 1. */
function normalize(ents) {
  const ext = [];   // [x, y, r]: a point, or a circle's centre and radius
  for (const e of ents) {
    if (e.type === 'circle' || e.type === 'arc') ext.push([e.x, e.y, e.r]);
    else if (e.type === 'line') ext.push([e.x1, e.y1, 0], [e.x2, e.y2, 0]);
    else for (const p of e.pts) ext.push([p[0], p[1], 0]);
  }
  if (!ext.length) throw new Error('empty');
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y, r] of ext) { x0 = Math.min(x0, x - r); x1 = Math.max(x1, x + r); y0 = Math.min(y0, y - r); y1 = Math.max(y1, y + r); }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  let R = 0;
  for (const [x, y, r] of ext) R = Math.max(R, Math.hypot(x - cx, y - cy) + r);
  if (!(R > 0)) throw new Error('empty');
  const X = (x) => r4((x - cx) / R), Y = (y) => r4((y - cy) / R);
  return ents.map((e) => (e.type === 'circle' ? { type: 'circle', x: X(e.x), y: Y(e.y), r: r4(e.r / R) } : e.type === 'arc' ? { type: 'arc', x: X(e.x), y: Y(e.y), r: r4(e.r / R), a0: r4(e.a0), a1: r4(e.a1) }
    : e.type === 'line' ? { type: 'line', x1: X(e.x1), y1: Y(e.y1), x2: X(e.x2), y2: Y(e.y2) } : { type: 'poly', pts: e.pts.map((p) => [X(p[0]), Y(p[1])]), closed: !!e.closed }));
}

const attr = (tag, name) => { const m = new RegExp('\\s' + name + '\\s*=\\s*("([^"]*)"|\'([^\']*)\')', 'i').exec(tag); return m ? (m[2] ?? m[3]) : null; };
const nums = (s) => (String(s || '').match(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) || []).map(Number);
function pathEntities(d, push, limitPts) {
  const tok = String(d || '').match(/[MmLlHhVvZzCcSsQqTtAa]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [];
  let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0, cur = null, total = 0;
  const flush = (closed = false) => { if (cur && cur.length >= 2) push({ type: 'poly', pts: cur, closed }); cur = null; };
  const add = (px, py) => { if (!cur) cur = [[x, y]]; cur.push([px, py]); x = px; y = py; if (++total > limitPts) throw new Error('too-big'); };
  const n = () => { const v = Number(tok[i++]); if (!Number.isFinite(v)) throw new Error('bad-svg'); return v; };
  const bez = (pts) => { for (let k = 1; k <= 8; k++) { const t = k / 8, u = 1 - t; let px, py; if (pts.length === 4) { px = u * u * u * pts[0][0] + 3 * u * u * t * pts[1][0] + 3 * u * t * t * pts[2][0] + t * t * t * pts[3][0]; py = u * u * u * pts[0][1] + 3 * u * u * t * pts[1][1] + 3 * u * t * t * pts[2][1] + t * t * t * pts[3][1]; } else { px = u * u * pts[0][0] + 2 * u * t * pts[1][0] + t * t * pts[2][0]; py = u * u * pts[0][1] + 2 * u * t * pts[1][1] + t * t * pts[2][1]; } add(px, py); } };
  while (i < tok.length) {
    if (/[A-Za-z]/.test(tok[i])) cmd = tok[i++];
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), ox = rel ? x : 0, oy = rel ? y : 0;
    if (C === 'Z') { if (cur) { cur.push([sx, sy]); x = sx; y = sy; } flush(true); continue; }
    if (C === 'M') { flush(); x = n() + ox; y = n() + oy; sx = x; sy = y; cur = [[x, y]]; cmd = rel ? 'l' : 'L'; continue; }
    if (C === 'L') { add(n() + ox, n() + oy); continue; }
    if (C === 'H') { add(n() + ox, y); continue; }
    if (C === 'V') { add(x, n() + oy); continue; }
    if (C === 'C') { const a = [n() + ox, n() + oy], b = [n() + ox, n() + oy], e = [n() + ox, n() + oy]; bez([[x, y], a, b, e]); continue; }
    if (C === 'S' || C === 'Q') { const a = [n() + ox, n() + oy], e = [n() + ox, n() + oy]; bez([[x, y], a, e]); continue; }
    if (C === 'T') { add(n() + ox, n() + oy); continue; }
    if (C === 'A') { n(); n(); n(); n(); n(); add(n() + ox, n() + oy); continue; }
    throw new Error('bad-svg');
  }
  flush();
}

export function symbolFromSvg(text, { maxBytes = SYMBOL_LIMITS.bytes, maxEntities = SYMBOL_LIMITS.entities } = {}) {
  const s = String(text ?? '');
  if (s.length > maxBytes) throw new Error('too-big');
  if (!/<svg[\s>]/i.test(s)) throw new Error('bad-svg');
  const body = s.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|foreignObject)[\s\S]*?<\/\1\s*>/gi, '');
  const out = [], notes = [];
  const push = (e) => { if (out.length >= maxEntities) throw new Error('too-big'); out.push(e); };
  if (/\stransform\s*=/i.test(body)) notes.push('transform');
  for (const m of body.matchAll(/<(line|polyline|polygon|rect|circle|ellipse|path)\b([^>]*)>/gi)) {
    const kind = m[1].toLowerCase(), tag = m[2];
    if (kind === 'line') push({ type: 'line', x1: +attr(tag, 'x1') || 0, y1: -(+attr(tag, 'y1') || 0), x2: +attr(tag, 'x2') || 0, y2: -(+attr(tag, 'y2') || 0) });
    else if (kind === 'polyline' || kind === 'polygon') { const v = nums(attr(tag, 'points')); const pts = []; for (let k = 0; k + 1 < v.length; k += 2) pts.push([v[k], -v[k + 1]]); if (pts.length >= 2) push({ type: 'poly', pts, closed: kind === 'polygon' }); }
    else if (kind === 'rect') { const x = +attr(tag, 'x') || 0, y = +attr(tag, 'y') || 0, w = +attr(tag, 'width') || 0, h = +attr(tag, 'height') || 0; if (w > 0 && h > 0) push({ type: 'poly', pts: [[x, -y], [x + w, -y], [x + w, -y - h], [x, -y - h]], closed: true }); }
    else if (kind === 'circle') { const r = +attr(tag, 'r') || 0; if (r > 0) push({ type: 'circle', x: +attr(tag, 'cx') || 0, y: -(+attr(tag, 'cy') || 0), r }); }
    else if (kind === 'ellipse') { const rx = +attr(tag, 'rx') || 0, ry = +attr(tag, 'ry') || 0, cx = +attr(tag, 'cx') || 0, cy = -(+attr(tag, 'cy') || 0); if (rx > 0 && ry > 0) push({ type: 'poly', pts: Array.from({ length: 24 }, (_, k) => [cx + rx * Math.cos((k * Math.PI) / 12), cy + ry * Math.sin((k * Math.PI) / 12)]), closed: true }); }
    else pathEntities(attr(tag, 'd'), (e) => push({ ...e, pts: e.pts.map((q) => [q[0], -q[1]]) }), SYMBOL_LIMITS.points);   // SVG's y runs down
  }
  return { entities: normalize(out), notes };
}

export function symbolFromCad(ents, { maxEntities = SYMBOL_LIMITS.entities } = {}) {
  const out = [], notes = [];
  let skipped = 0;
  for (const e of ents || []) {
    if (out.length >= maxEntities) throw new Error('too-big');
    if (e.type === 'LINE' && e.start && e.end) out.push({ type: 'line', x1: e.start.x, y1: e.start.y, x2: e.end.x, y2: e.end.y });
    else if (e.type === 'CIRCLE' && e.center && e.radius > 0) out.push({ type: 'circle', x: e.center.x, y: e.center.y, r: e.radius });
    else if (e.type === 'ARC' && e.center && e.radius > 0) out.push({ type: 'arc', x: e.center.x, y: e.center.y, r: e.radius, a0: (e.startAngle * 180) / Math.PI, a1: (e.endAngle * 180) / Math.PI });   // the cc-dwg model's angles are radians; symbols keep degrees (plants.js)
    else if ((e.type === 'LWPOLYLINE' || e.type === 'POLYLINE_2D' || e.type === 'POLYLINE_3D') && Array.isArray(e.vertices) && e.vertices.length >= 2) {
      if (e.vertices.length > SYMBOL_LIMITS.points) throw new Error('too-big');
      out.push({ type: 'poly', pts: e.vertices.map((v) => [v.x, v.y]), closed: !!e.closed });
    } else skipped++;
  }
  if (skipped) notes.push('skipped:' + skipped);
  if (out.some((e) => [e.x, e.y, e.r, e.x1, e.y1, e.x2, e.y2].some((v) => v !== undefined && !fin(v)) || (e.pts && e.pts.some((p) => !fin(p[0]) || !fin(p[1]))))) throw new Error('empty');
  return { entities: normalize(out), notes };
}

export function placeSymbol(sym, R) {
  return (sym?.entities || []).map((e) => (e.type === 'circle' ? { type: 'circle', x: e.x * R, y: e.y * R, r: e.r * R } : e.type === 'arc' ? { type: 'arc', x: e.x * R, y: e.y * R, r: e.r * R, a0: e.a0, a1: e.a1 }
    : e.type === 'line' ? { type: 'line', x1: e.x1 * R, y1: e.y1 * R, x2: e.x2 * R, y2: e.y2 * R } : { type: 'poly', pts: e.pts.map((p) => [p[0] * R, p[1] * R]), closed: e.closed }));
}

export function normalizeModel(positions, indices, { maxTris = SYMBOL_LIMITS.tris } = {}) {
  const P = Array.from(positions || []), I = Array.from(indices || []);
  if (I.length / 3 > maxTris) throw new Error('too-big');
  if (P.length < 9 || I.length < 3 || P.some((v) => !fin(v)) || I.some((v) => !Number.isInteger(v) || v < 0 || v >= P.length / 3)) throw new Error('empty');
  let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
  for (let i = 0; i < P.length; i += 3) { x0 = Math.min(x0, P[i]); x1 = Math.max(x1, P[i]); y0 = Math.min(y0, P[i + 1]); y1 = Math.max(y1, P[i + 1]); z0 = Math.min(z0, P[i + 2]); z1 = Math.max(z1, P[i + 2]); }
  const w = Math.max(x1 - x0, y1 - y0) || 1, h = z1 - z0 || 1, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const pos = new Float32Array(I.length * 3), nor = new Float32Array(I.length * 3), idx = new Uint32Array(I.length);
  for (let t = 0; t < I.length; t += 3) {   // flat-shaded: three own corners per triangle
    const c = [0, 1, 2].map((k) => { const v = I[t + k] * 3; return [(P[v] - cx) / w, (P[v + 1] - cy) / w, (P[v + 2] - z0) / h]; });
    const ux = c[1][0] - c[0][0], uy = c[1][1] - c[0][1], uz = c[1][2] - c[0][2], vx = c[2][0] - c[0][0], vy = c[2][1] - c[0][1], vz = c[2][2] - c[0][2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const L = Math.hypot(nx, ny, nz) || 1; nx /= L; ny /= L; nz /= L;
    for (let k = 0; k < 3; k++) { pos.set(c[k], (t + k) * 3); nor.set([nx, ny, nz], (t + k) * 3); idx[t + k] = t + k; }
  }
  return { positions: pos, normals: nor, indices: idx };
}
