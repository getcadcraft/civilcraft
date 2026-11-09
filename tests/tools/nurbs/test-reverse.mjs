#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-reverse.mjs — cc-nurbs 0.9 SU.1082 (session reverse-nurbs-09): scan mesh to trimmed NURBS faces, measured fit error, solid stitching.
 *   node tools/nurbs/test-reverse.mjs [--verbose]
 */
import * as N from '../../lib/nurbs/index.js';
import { roundedCan, roundedCanVolume, varFilletBlock } from './scan-fixtures.mjs';
const VERBOSE = process.argv.includes('--verbose');
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m + (x ? ' - ' + x : '')); } else { fail++; console.log('  FAIL ' + m + (x ? ' - ' + x : '')); } };
const info = (s) => console.log('  ' + s);
const code = (f) => { try { f(); return null; } catch (e) { return e && e.code ? e.code : String(e); } };

let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const noise = (a) => (rnd() - 0.5) * 2 * a;

// mesh builder: shared-vertex grids
function Mesh() { const P = [], I = []; return { P, I, v(x, y, z) { P.push(x, y, z); return P.length / 3 - 1; }, t(a, b, c) { I.push(a, b, c); }, out: () => ({ positions: Float64Array.from(P), indices: Uint32Array.from(I) }) }; }
function box(sx, sy, sz, div, nz) {
  const m = Mesh(), key = new Map();
  const V = (x, y, z) => { const k = [x, y, z].map((q) => q.toFixed(6)).join(','); if (!key.has(k)) key.set(k, m.v(x + (nz && !(x === 0 || x === sx || y === 0 || y === sy || z === 0 || z === sz) ? 0 : 0), y, z)); return key.get(k); };
  const face = (o, a, b, flip) => {
    for (let i = 0; i < div; i++) for (let j = 0; j < div; j++) {
      const p = (s, t) => V(o[0] + a[0] * s / div + b[0] * t / div, o[1] + a[1] * s / div + b[1] * t / div, o[2] + a[2] * s / div + b[2] * t / div);
      const q00 = p(i, j), q10 = p(i + 1, j), q11 = p(i + 1, j + 1), q01 = p(i, j + 1);
      if (flip) { m.t(q00, q11, q10); m.t(q00, q01, q11); } else { m.t(q00, q10, q11); m.t(q00, q11, q01); }
    }
  };
  face([0, 0, 0], [sx, 0, 0], [0, sy, 0], true); face([0, 0, sz], [sx, 0, 0], [0, sy, 0], false);
  face([0, 0, 0], [sx, 0, 0], [0, 0, sz], false); face([0, sy, 0], [sx, 0, 0], [0, 0, sz], true);
  face([0, 0, 0], [0, sy, 0], [0, 0, sz], true); face([sx, 0, 0], [0, sy, 0], [0, 0, sz], false);
  return m;
}
function can(R, H, seg, rings, nz) {
  const m = Mesh();
  const ring = (z) => Array.from({ length: seg }, (_, i) => { const a = 2 * Math.PI * i / seg; return m.v(R * Math.cos(a) + noise(nz), R * Math.sin(a) + noise(nz), z); });
  const rs = Array.from({ length: rings + 1 }, (_, k) => ring(H * k / rings));
  for (let k = 0; k < rings; k++) for (let i = 0; i < seg; i++) { const a = rs[k][i], b = rs[k][(i + 1) % seg], c = rs[k + 1][(i + 1) % seg], d = rs[k + 1][i]; m.t(a, b, c); m.t(a, c, d); }
  const bc = m.v(0, 0, 0), tc = m.v(0, 0, H);
  for (let i = 0; i < seg; i++) { m.t(bc, rs[0][(i + 1) % seg], rs[0][i]); m.t(tc, rs[rings][i], rs[rings][(i + 1) % seg]); }
  return m;
}
function sheet(W, Hh, n, f, nz) {
  const m = Mesh(), id = [];
  for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) { const x = W * i / n, y = Hh * j / n; id.push(m.v(x, y, f(x, y) + noise(nz))); }
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const a = id[i * (n + 1) + j], b = id[(i + 1) * (n + 1) + j], c = id[(i + 1) * (n + 1) + j + 1], d = id[i * (n + 1) + j + 1]; m.t(a, b, c); m.t(a, c, d); }
  return m;
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;


// ---- round 2 builders: sphere, frustum, rounded box (12 fillets + 8 spherical corners), tube with a hole
function ball(R, seg, rings, nz) {
  const m = Mesh(), top = m.v(0, 0, R), bot = m.v(0, 0, -R), rs = [];
  for (let k = 1; k < rings; k++) { const ph = Math.PI * k / rings; rs.push(Array.from({ length: seg }, (_, i) => { const a = 2 * Math.PI * i / seg, rr = R + noise(nz); return m.v(rr * Math.sin(ph) * Math.cos(a), rr * Math.sin(ph) * Math.sin(a), rr * Math.cos(ph)); })); }
  for (let i = 0; i < seg; i++) { m.t(top, rs[0][i], rs[0][(i + 1) % seg]); m.t(bot, rs[rings - 2][(i + 1) % seg], rs[rings - 2][i]); }
  for (let k = 0; k + 1 < rings - 1; k++) for (let i = 0; i < seg; i++) { const a = rs[k][i], b = rs[k][(i + 1) % seg], c = rs[k + 1][(i + 1) % seg], d = rs[k + 1][i]; m.t(a, d, c); m.t(a, c, b); }
  return m;
}
function frustum(r0, ang, H, seg, rings, nz) {
  const m = Mesh(), tn = Math.tan(ang * Math.PI / 180);
  const ring = (z) => Array.from({ length: seg }, (_, i) => { const a = 2 * Math.PI * i / seg, r = r0 + z * tn; return m.v(r * Math.cos(a) + noise(nz), r * Math.sin(a) + noise(nz), z); });
  const rs = Array.from({ length: rings + 1 }, (_, k) => ring(H * k / rings));
  for (let k = 0; k < rings; k++) for (let i = 0; i < seg; i++) { const a = rs[k][i], b = rs[k][(i + 1) % seg], c = rs[k + 1][(i + 1) % seg], d = rs[k + 1][i]; m.t(a, b, c); m.t(a, c, d); }
  const bc = m.v(0, 0, 0), tc = m.v(0, 0, H);
  for (let i = 0; i < seg; i++) { m.t(bc, rs[0][(i + 1) % seg], rs[0][i]); m.t(tc, rs[rings][i], rs[rings][(i + 1) % seg]); }
  return m;
}
/** Box A x B x C (inner, mm) offset by r: flat faces, 12 quarter-cylinder fillets, 8 sphere octants; steps = facets per 90 degrees. */
function roundedBox(A, B, C, r, steps, nz) {
  const m = Mesh(), key = new Map(), a = [A / 2, B / 2, C / 2], H = a.map((x) => x + r);
  const axis = (h) => { const q = []; for (let k = steps; k >= 1; k--) q.push(-h - r * Math.tan(Math.PI / 4 * k / steps) + r - r + 0); return q; };
  const coords = (ai) => { const l = []; for (let k = steps; k >= 1; k--) l.push(-a[ai] - r * Math.tan(Math.PI / 4 * k / steps)); for (let k = 0; k <= 4; k++) l.push(-a[ai] + 2 * a[ai] * k / 4); for (let k = 1; k <= steps; k++) l.push(a[ai] + r * Math.tan(Math.PI / 4 * k / steps)); return l; };
  void axis; void H;
  const X = [coords(0), coords(1), coords(2)];
  const push = (p) => { const c = p.map((v, i) => Math.max(-a[i], Math.min(a[i], v))), d = p.map((v, i) => v - c[i]), l = Math.hypot(...d) || 1; return c.map((v, i) => v + r * d[i] / l); };
  const V3 = (i, j, k) => { const kk = i + ',' + j + ',' + k; if (!key.has(kk)) { const q = push([X[0][i], X[1][j], X[2][k]]); key.set(kk, m.v(q[0] + noise(nz), q[1] + noise(nz), q[2] + noise(nz))); } return key.get(kk); };
  const n0 = X[0].length - 1, n1 = X[1].length - 1, n2 = X[2].length - 1;
  const quad = (p00, p10, p11, p01, flip) => { if (flip) { m.t(p00, p11, p10); m.t(p00, p01, p11); } else { m.t(p00, p10, p11); m.t(p00, p11, p01); } };
  for (let i = 0; i < n0; i++) for (let j = 0; j < n1; j++) { quad(V3(i, j, 0), V3(i + 1, j, 0), V3(i + 1, j + 1, 0), V3(i, j + 1, 0), true); quad(V3(i, j, n2), V3(i + 1, j, n2), V3(i + 1, j + 1, n2), V3(i, j + 1, n2), false); }
  for (let i = 0; i < n0; i++) for (let k = 0; k < n2; k++) { quad(V3(i, 0, k), V3(i + 1, 0, k), V3(i + 1, 0, k + 1), V3(i, 0, k + 1), false); quad(V3(i, n1, k), V3(i + 1, n1, k), V3(i + 1, n1, k + 1), V3(i, n1, k + 1), true); }
  for (let j = 0; j < n1; j++) for (let k = 0; k < n2; k++) { quad(V3(0, j, k), V3(0, j + 1, k), V3(0, j + 1, k + 1), V3(0, j, k + 1), true); quad(V3(n0, j, k), V3(n0, j + 1, k), V3(n0, j + 1, k + 1), V3(n0, j, k + 1), false); }
  return m;
}
const roundedVolume = (A, B, C, r) => A * B * C + 2 * r * (A * B + B * C + C * A) + Math.PI * r * r * (A + B + C) + 4 / 3 * Math.PI * r ** 3;

console.log('== box (6 planes)');
{
  const r = N.reverse.fit(box(100, 60, 40, 6).out(), { tol: 0.05 });
  const k = r.patches.map((p) => p.kind).join(',');
  ok(r.patches.length === 6 && r.patches.every((p) => p.kind === 'plane'), 'six planes', k);
  ok(r.report.max < 1e-6, 'exact box: max deviation ~0', 'max ' + r.report.max);
  ok(r.report.covered > 0.999, 'whole surface covered', String(r.report.covered));
  ok(r.patches.every((p) => p.trim === null), 'rectangular faces stay untrimmed');
  let d = N.doc.newDoc(); const add = N.reverse.intoDoc(N.doc, d, r); d = add.doc;
  ok(add.ids.length === 6, 'six items in the doc');
  const sol = code(() => { d = N.solid.addSolid(d, add.ids, { tol: 0.05 }).doc; });
  ok(sol === null, 'sews to a closed solid', String(sol));
  if (!sol) { const m = N.solid.mesh(d, N.solid.solids(d)[0].id, { tol: 0.05 }); ok(near(m.report.volume, 240000, 1), 'volume 240000 mm3', String(m.report.volume)); }
}

console.log('== box with 0.03 mm scan noise');
{
  seed = 11; const b = box(100, 60, 40, 8);
  for (let i = 0; i < b.P.length; i++) b.P[i] += noise(0.03);
  const r = N.reverse.fit(b.out(), { tol: 0.15 });
  ok(r.patches.length === 6, 'still six planes', r.patches.map((p) => p.kind).join(','));
  ok(r.report.max < 0.1, 'max deviation within the noise', 'max ' + r.report.max.toFixed(4) + ' rms ' + r.report.rms.toFixed(4));
  ok(r.report.within === 1, 'all vertices within tol');
  info('box+noise: rms ' + r.report.rms.toFixed(4) + ' max ' + r.report.max.toFixed(4) + ' mm, ' + r.report.ms + ' ms');
}

console.log('== can (cylinder + two caps)');
{
  seed = 3; const r = N.reverse.fit(can(15, 40, 96, 8, 0.02).out(), { tol: 0.1 });
  const kinds = r.patches.map((p) => p.kind).sort().join(',');
  ok(kinds === 'cylinder,plane,plane', 'one cylinder, two planes', kinds);
  const c = r.patches.find((p) => p.kind === 'cylinder');
  ok(c && near(c.model.r, 15, 0.05), 'radius 15 found', c && String(c.model.r));
  ok(c && c.model.full, 'full turn');
  ok(c && Math.abs(Math.abs(c.model.a[2]) - 1) < 1e-3, 'axis along z');
  ok(r.report.max < 0.1, 'max deviation under 0.1 mm', 'max ' + r.report.max.toFixed(4) + ' rms ' + r.report.rms.toFixed(4));
  info('can: rms ' + r.report.rms.toFixed(4) + ' max ' + r.report.max.toFixed(4) + ' mm, covered ' + (100 * r.report.covered).toFixed(1) + '%');
  let d = N.doc.newDoc(); const add = N.reverse.intoDoc(N.doc, d, r); d = add.doc;
  let sd = null;
  const e2 = code(() => { sd = N.tools.run(N.reverse.intoDoc(N.doc, N.doc.newDoc(), r).doc, 'scan.solid', { gap: 0.5 }); });
  ok(e2 === null, 'scan.solid closes the noisy can (stitch distance 0.5 mm)', String(e2));
  if (sd) {
    const want = Math.PI * 225 * 40;
    ok(Math.abs(sd.report.volume - want) / want < 0.01, 'stitched volume ' + sd.report.volume.toFixed(0) + ' vs ' + want.toFixed(0), 'weld used ' + sd.report.weld);
    info('can stitched with weld ' + sd.report.weld + ' mm, volume ' + sd.report.volume.toFixed(1) + ' vs ' + want.toFixed(1));
  }
  ok(code(() => N.tools.run(N.reverse.intoDoc(N.doc, N.doc.newDoc(), N.reverse.fit(sheet(80, 60, 20, () => 0, 0).out(), { tol: 0.05 })).doc, 'scan.solid', { gap: 0.5 })) === 'nurbs.err.solid_open', 'one open sheet is never stitched into a solid');
}

console.log('== partial cylinder (half pipe)');
{
  const m = Mesh(); const seg = 48, rings = 6, R = 20, H = 30, ids = [];
  for (let k = 0; k <= rings; k++) for (let i = 0; i <= seg; i++) { const a = Math.PI * i / seg; ids.push(m.v(R * Math.cos(a), R * Math.sin(a), H * k / rings)); }
  for (let k = 0; k < rings; k++) for (let i = 0; i < seg; i++) { const a = ids[k * (seg + 1) + i], b = ids[k * (seg + 1) + i + 1], c = ids[(k + 1) * (seg + 1) + i + 1], d = ids[(k + 1) * (seg + 1) + i]; m.t(a, b, c); m.t(a, c, d); }
  const r = N.reverse.fit(m.out(), { tol: 0.1 });
  const c = r.patches[0];
  ok(r.patches.length === 1 && c.kind === 'cylinder', 'one cylinder', r.patches.map((p) => p.kind).join(','));
  ok(c && !c.model.full && near(c.model.spanDeg, 180, 1), 'partial, 180 degrees', c && String(c.model.spanDeg));
  const sag = 20 * (1 - Math.cos(Math.PI / 96));   // a facet's middle lies this far inside the true cylinder
  ok(r.report.max < sag * 1.02 && r.report.max > sag * 0.5, 'exact cylinder: the measured max is the facets\' own sag ' + sag.toFixed(4), String(r.report.max));
}

console.log('== free-form sheet');
{
  seed = 5; const f = (x, y) => 4 * Math.sin(x / 12) * Math.cos(y / 15) + 0.02 * x;
  const r = N.reverse.fit(sheet(80, 60, 50, f, 0.01).out(), { tol: 0.1 });
  ok(r.patches.length === 1 && r.patches[0].kind === 'freeform', 'one free-form patch', r.patches.map((p) => p.kind).join(','));
  const p = r.patches[0];
  ok(p && p.stats.max < 0.1, 'max deviation under tol', p && 'max ' + p.stats.max.toFixed(4) + ' rms ' + p.stats.rms.toFixed(4));
  ok(p && p.stats.within > 0.99, 'share within tol', p && String(p.stats.within));
  info('sheet: ' + p.model.nu + ' x ' + p.model.nv + ' control points, rms ' + p.stats.rms.toFixed(4) + ' max ' + p.stats.max.toFixed(4) + ' mm (noise 0.01), ' + r.report.ms + ' ms');
  ok(p.stats.p95 <= p.stats.max, 'p95 not above max');
}

console.log('== flat plate with a square hole (trim)');
{
  const m = Mesh(), n = 20, id = [];
  for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) id.push(m.v(i * 5, j * 5, 0));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if (i >= 8 && i < 12 && j >= 8 && j < 12) continue;   // hole 20 x 20 mm
    const a = id[i * (n + 1) + j], b = id[(i + 1) * (n + 1) + j], c = id[(i + 1) * (n + 1) + j + 1], d = id[i * (n + 1) + j + 1]; m.t(a, b, c); m.t(a, c, d);
  }
  const r = N.reverse.fit(m.out(), { tol: 0.05 });
  const p = r.patches[0];
  ok(r.patches.length === 1 && p.kind === 'plane', 'one plane', r.patches.map((q) => q.kind).join(','));
  ok(p && p.trim && p.trim.holes.length === 1, 'the hole is a trim loop', p && JSON.stringify(p.trim && p.trim.holes.length));
  const area = p && N.trim.area(p.surface, p.trim, { tol: 0.05 });
  ok(near(area, 100 * 100 - 20 * 20, 1), 'face area 9600 mm2', String(area));
}

console.log('== a fold is refused, not forced');
{
  const m = Mesh(); // a tube (full cylinder lying) fed with cylinders off: its normals turn all the way round
  const mesh = can(15, 40, 64, 4, 0).out();
  // strip the caps: first 64*4*2 triangles are the side
  const side = { positions: mesh.positions, indices: mesh.indices.slice(0, 64 * 4 * 2 * 3) };
  const r = N.reverse.fit(side, { cylinders: false, tol: 0.1 });
  ok(r.patches.every((p) => p.stats.max <= 0.15), 'every face that is made is within the tolerance (no forced fit)', r.patches.map((p) => p.kind + ' ' + p.stats.max.toFixed(3)).join('; '));
  ok(r.patches.every((p) => p.kind !== 'freeform' || p.stats.max <= 0.1), 'a closed tube is not one free-form patch');
  ok(r.report.covered + r.report.ignored <= 1.0001, 'coverage adds up', r.report.covered.toFixed(3) + ' + ' + r.report.ignored.toFixed(3));
}


console.log('== sphere (radius 25, 0.02 mm noise)');
{
  seed = 21; const r = N.reverse.fit(ball(25, 72, 36, 0.02).out(), { tol: 0.1 });
  const sp = r.patches.find((p) => p.kind === 'sphere');
  ok(r.patches.length === 1 && sp, 'one sphere', r.patches.map((p) => p.kind).join(','));
  ok(sp && near(sp.model.r, 25, 0.02), 'radius 25 found', sp && sp.model.r.toFixed(4));
  ok(sp && Math.hypot(...sp.model.c) < 0.02, 'centre at the origin', sp && sp.model.c.map((x) => x.toFixed(4)).join(','));
  ok(r.report.max < 0.1 && r.report.within === 1, 'every point within tol', 'rms ' + r.report.rms.toFixed(4) + ' max ' + r.report.max.toFixed(4));
  ok(r.report.map && r.report.map.length >= 4 * 100, 'deviation map samples', String(r.report.map && r.report.map.length / 4));
  info('sphere: radius ' + sp.model.r.toFixed(4) + ' (truth 25), centre error ' + Math.hypot(...sp.model.c).toFixed(4) + ', rms ' + r.report.rms.toFixed(4) + ' max ' + r.report.max.toFixed(4) + ' mm, ' + r.report.ms + ' ms');
}

console.log('== cone (frustum, half-angle 20 degrees, caps)');
{
  seed = 22; const r = N.reverse.fit(frustum(10, 20, 40, 96, 6, 0.02).out(), { tol: 0.1 });
  const kinds = r.patches.map((p) => p.kind).sort().join(',');
  ok(kinds === 'cone,plane,plane', 'one cone, two planes', kinds);
  const c = r.patches.find((p) => p.kind === 'cone');
  ok(c && near(c.model.halfAngle, 20, 0.3), 'half-angle 20 found', c && c.model.halfAngle.toFixed(3));
  ok(c && Math.abs(c.model.a[2]) > 0.9999 && Math.hypot(c.model.apex[0], c.model.apex[1]) < 0.1 && near(c.model.apex[2], -10 / Math.tan(20 * Math.PI / 180), 0.5), 'axis along z, apex where the truth says', c && c.model.apex.map((x) => x.toFixed(3)).join(','));
  ok(r.report.max < 0.1, 'max deviation under tol', 'rms ' + r.report.rms.toFixed(4) + ' max ' + r.report.max.toFixed(4));
  const tn = Math.tan(20 * Math.PI / 180), r1 = 10 + 40 * tn, want = Math.PI * 40 / 3 * (100 + 10 * r1 + r1 * r1);
  let sd = null; const e = code(() => { sd = N.tools.run(N.reverse.intoDoc(N.doc, N.doc.newDoc(), r).doc, 'scan.solid', { gap: 0.5 }); });
  ok(e === null, 'the frustum stitches to a solid', String(e));
  if (sd) ok(Math.abs(sd.report.volume - want) / want < 0.01, 'stitched volume ' + sd.report.volume.toFixed(0) + ' vs ' + want.toFixed(0));
  info('cone: half-angle ' + c.model.halfAngle.toFixed(3) + ' (truth 20), apex z ' + c.model.apex[2].toFixed(2) + ' (truth ' + (-10 / tn).toFixed(2) + '), rms ' + r.report.rms.toFixed(4) + ' max ' + r.report.max.toFixed(4) + ' mm' + (sd ? ', volume ' + sd.report.volume.toFixed(0) + ' vs ' + want.toFixed(0) : ''));
}

console.log('== box 100 x 60 x 40 with 3 mm fillets on all 12 edges');
{
  seed = 31; const A = 94, B = 54, C = 34, R = 3, mesh = roundedBox(A, B, C, R, 6, 0.01).out();
  const r = N.reverse.fit(mesh, { tol: 0.1 });
  const cnt = (k) => r.patches.filter((p) => p.kind === k).length;
  ok(cnt('plane') === 6 && cnt('cylinder') === 12 && cnt('sphere') === 8, '6 planes, 12 cylinders, 8 spheres', r.patches.map((p) => p.kind).join(','));
  ok(r.report.fillets.length === 20, 'all 20 round faces reported as fillets between faces', String(r.report.fillets.length));
  const radii = r.report.fillets.map((f) => f.radius);
  const rerr = Math.max(...radii.map((x) => Math.abs(x - R)));
  ok(rerr < 0.03, 'fillet radius within 0.03 mm of 3', 'worst ' + rerr.toFixed(4));
  ok(r.report.fillets.every((f) => f.between.length >= 2), 'each fillet names the faces it runs between');
  ok(r.report.max < 0.1 && r.report.within === 1, 'every point within tol', 'rms ' + r.report.rms.toFixed(4) + ' max ' + r.report.max.toFixed(4));
  let sd = null; const e = code(() => { sd = N.tools.run(N.reverse.intoDoc(N.doc, N.doc.newDoc(), r).doc, 'scan.solid', { gap: 0.5 }); });
  ok(e === null, 'the filleted box stitches to a closed solid', String(e));
  const want = roundedVolume(A, B, C, R);
  if (sd) { ok(sd.report.closed === true && Math.abs(sd.report.volume - want) / want < 0.005, 'volume ' + sd.report.volume.toFixed(0) + ' vs ' + want.toFixed(0), 'weld ' + sd.report.weld); info('filleted box: ' + r.patches.length + ' faces, radius error worst ' + rerr.toFixed(4) + ' mm, rms ' + r.report.rms.toFixed(4) + ' max ' + r.report.max.toFixed(4) + ' mm, stitched volume ' + sd.report.volume.toFixed(1) + ' vs ' + want.toFixed(1) + ' (weld ' + sd.report.weld + ' mm), ' + r.report.ms + ' ms'); }
}

console.log('== the same filleted box under other random seeds');
{
  seed = 31; const mesh = roundedBox(94, 54, 34, 3, 6, 0.01).out(); let worst = 0, good = true;
  for (const sd of [2, 3, 4, 5]) { const r = N.reverse.fit(mesh, { tol: 0.1, seed: sd }); good = good && r.patches.length === 26 && r.report.fillets.length === 20; worst = Math.max(worst, ...r.report.fillets.map((f) => Math.abs(f.radius - 3))); }
  ok(good, 'seeds 2-5: 26 faces and 20 fillets each time');
  ok(worst < 0.05, 'fillet radius within 0.05 mm of 3 under every seed', 'worst ' + worst.toFixed(4));
  info('filleted box, 4 more seeds: worst radius error ' + worst.toFixed(4) + ' mm');
}

console.log('== the filleted box turned (z up to y up, float32 coordinates) still stitches');
{
  seed = 31; const m0 = roundedBox(94, 54, 34, 3, 6, 0.01).out(), P = Float32Array.from(m0.positions), Q = new Float64Array(P.length);
  for (let i = 0; i < P.length; i += 3) { Q[i] = P[i]; Q[i + 1] = P[i + 2]; Q[i + 2] = -P[i + 1]; }
  const r = N.reverse.fit({ positions: Q, indices: m0.indices }, { tol: 0.1 });
  let sd = null; const e = code(() => { sd = N.tools.run(N.reverse.intoDoc(N.doc, N.doc.newDoc(), r).doc, 'scan.solid', { gap: 0.5 }); });
  ok(r.patches.length === 26 && r.report.fillets.length === 20, '26 faces, 20 fillets', r.patches.length + ' / ' + r.report.fillets.length);
  ok(e === null, 'closes to a solid', String(e));
  const want = roundedVolume(94, 54, 34, 3);
  if (sd) ok(Math.abs(sd.report.volume - want) / want < 0.005, 'volume ' + sd.report.volume.toFixed(0) + ' vs ' + want.toFixed(0), 'weld ' + sd.report.weld);
}

console.log('== can that is not a fillet: no tangent neighbours');
{
  seed = 3; const r = N.reverse.fit(can(15, 40, 96, 8, 0.02).out(), { tol: 0.1 });
  ok(r.report.fillets.length === 0, 'the can side meets its caps at 90 degrees: not a fillet', String(r.report.fillets.length));
}

console.log('== full-turn cylinder with a hole: the seam trim');
{
  const m = Mesh(); const seg = 96, rings = 8, R = 15, H = 40, id = [];
  for (let k = 0; k <= rings; k++) for (let i = 0; i < seg; i++) { const a = 2 * Math.PI * i / seg; id.push(m.v(R * Math.cos(a), R * Math.sin(a), H * k / rings)); }
  for (let k = 0; k < rings; k++) for (let i = 0; i < seg; i++) {
    if (i >= 10 && i < 14 && k >= 3 && k < 5) continue;   // a hole 4 segments wide and 2 rings high
    const a = id[k * seg + i], b = id[k * seg + (i + 1) % seg], c = id[(k + 1) * seg + (i + 1) % seg], d = id[(k + 1) * seg + i]; m.t(a, b, c); m.t(a, c, d);
  }
  const r = N.reverse.fit(m.out(), { tol: 0.1 });
  const c = r.patches[0];
  ok(r.patches.length === 1 && c.kind === 'cylinder' && c.model.full, 'one full-turn cylinder', r.patches.map((p) => p.kind).join(','));
  ok(c && c.trim && c.trim.holes.length === 1, 'the hole is cut', c && JSON.stringify(c.trim && c.trim.holes.length));
  const want = 2 * Math.PI * 15 * 40 - (4 * 2 * Math.PI / 96) * 15 * (2 * 40 / 8);
  const area = c && c.trim && N.trim.area(c.surface, c.trim, { tol: 0.02 });
  ok(near(area, want, 2), 'face area ' + (area && area.toFixed(1)) + ' vs ' + want.toFixed(1), String(area));
  ok(r.report.max < 0.05, 'max deviation', String(r.report.max));
}

console.log('== deviation map');
{
  seed = 5; const f = (x, y) => 4 * Math.sin(x / 12) * Math.cos(y / 15);
  const r = N.reverse.fit(sheet(80, 60, 30, f, 0.02).out(), { tol: 0.1 });
  const mp = r.report.map;
  ok(mp && mp.length % 4 === 0 && mp.length > 0, 'map = x, y, z, distance per point', String(mp && mp.length));
  let mx = 0; for (let i = 3; i < mp.length; i += 4) mx = Math.max(mx, mp[i]);
  ok(mx <= r.report.max + 1e-6 && mx > 0, 'largest mapped distance is within the reported maximum', mx.toFixed(4) + ' <= ' + r.report.max.toFixed(4));
}

console.log('== bad input');
{
  ok(code(() => N.reverse.fit({ positions: [], indices: [] })) === 'nurbs.err.scan_empty', 'empty mesh refused');
  ok(code(() => N.reverse.fit({ positions: [0, 0, 0, 1, 0, 0, 2, 0, 0], indices: [0, 1, 2] })) === 'nurbs.err.scan_empty', 'degenerate line triangles refused');
  ok(code(() => N.reverse.fit({ positions: [0, 0, NaN, 1, 0, 0, 0, 1, 0], indices: [0, 1, 2] })) === 'nurbs.err.scan_empty', 'NaN refused');
  ok(code(() => N.reverse.fit(box(10, 10, 10, 2).out(), { maxTriangles: 5 })) === 'nurbs.err.scan_big', 'too many triangles refused');
  const a = N.reverse.fit(box(100, 60, 40, 4).out(), { seed: 2 }), b = N.reverse.fit(box(100, 60, 40, 4).out(), { seed: 2 });
  ok(JSON.stringify(a.patches.map((p) => p.stats)) === JSON.stringify(b.patches.map((p) => p.stats)), 'same seed, same result');
}

console.log('== commands');
{
  const mesh = box(100, 60, 40, 4).out();
  const r = N.tools.run(N.doc.newDoc(), 'scan.fit', { tol: 0.05 }, { scan: mesh });
  ok(r.ids.length === 6 && r.report.scan.patches === 6 && r.report.scan.pieces.length === 0, 'scan.fit adds six faces', JSON.stringify(r.report.scan).slice(0, 100));
  ok(code(() => N.tools.run(N.doc.newDoc(), 'scan.fit', {}, {})) === 'nurbs.err.scan_none', 'scan.fit without a mesh says so');
  const s = N.tools.run(r.doc, 'scan.solid', {}, {});
  ok(s.report.closed === true && near(s.report.volume, 240000, 1), 'scan.solid closes the box', String(s.report.volume));
}


// ---- 0.9 engineer-09: rim fillets (tori) and variable-radius fillets; synthetic scans with a known truth (a real scan is the owner's hand check)
console.log('== rim fillets and variable-radius fillets');
{
  const R = 20, H = 40, rf = 4, mesh = roundedCan(R, H, rf, 96, 8, 0.01), r = N.reverse.fit(mesh, { tol: 0.1 });
  const tor = r.patches.find((p) => p.kind === 'torus');
  ok(!!tor, 'rounded-rim can: the rim fillet is found as a torus', r.patches.map((p) => p.kind).join(','));
  if (tor) {
    ok(near(tor.model.r, rf, 0.02) && near(tor.model.R, R - rf, 0.02), 'torus tube radius ' + tor.model.r.toFixed(4) + ' (truth 4), ring radius ' + tor.model.R.toFixed(4) + ' (truth 16)');
    ok(Math.abs(tor.model.a[2]) > 0.99999, 'torus axis is the can axis', tor.model.a.map((x) => x.toFixed(6)).join(','));
    ok(tor.stats.max <= 0.1 && tor.stats.within === 1, 'torus measured error within the tolerance', 'rms ' + tor.stats.rms.toFixed(4) + ' max ' + tor.stats.max.toFixed(4));
    const f = r.report.fillets.find((x) => x.kind === 'torus');
    ok(!!f && f.between.length === 2 && r.patches.filter((p) => f.between.includes(p.name)).map((p) => p.kind).sort().join() === 'cylinder,plane', 'the torus is reported as a rim fillet between the side cylinder and the top plane', f && f.between.join(', '));
    ok(!!f && near(f.major, R - rf, 0.02), 'the fillet row carries the ring radius too');
  }
  ok(r.report.covered > 0.999 && r.unfitted.length === 0, 'every triangle is on a fitted face', r.report.covered.toFixed(5));
  let sd = null; const e = code(() => { sd = N.tools.run(N.reverse.intoDoc(N.doc, N.doc.newDoc(), r).doc, 'scan.solid', { gap: 0.5 }); });
  ok(e === null, 'scan.solid closes the rounded-rim can (torus included)', String(e));
  const want = roundedCanVolume(R, H, rf);
  if (sd) ok(Math.abs(sd.report.volume - want) / want < 0.005, 'stitched volume ' + sd.report.volume.toFixed(0) + ' vs ' + want.toFixed(0) + ' closed form', 'weld ' + sd.report.weld);
  info('rounded-rim can: torus R ' + (tor && tor.model.R.toFixed(4)) + ' r ' + (tor && tor.model.r.toFixed(4)) + ', rms ' + r.report.rms.toFixed(4) + ' max ' + r.report.max.toFixed(4) + ' mm' + (sd ? ', volume ' + sd.report.volume.toFixed(1) + ' vs ' + want.toFixed(1) + ' (weld ' + sd.report.weld + ')' : '') + ', ' + r.report.ms + ' ms');
  // a plain can (sharp edges) gets no torus and no fillet
  const plain = N.reverse.fit(can(15, 40, 96, 6, 0.02).out(), { tol: 0.1 });
  ok(!plain.patches.some((p) => p.kind === 'torus' || p.kind === 'varfillet') && plain.report.fillets.length === 0, 'a sharp-edged can gets no torus and no fillet', plain.patches.map((p) => p.kind).join(','));
}
for (const [label, law] of [['linear', (x) => 2 + 4 * x / 60], ['quadratic', (x) => 2 + 4 * (x / 60) ** 2]]) {
  const W = 60, D = 40, Hh = 30, mesh = varFilletBlock(W, D, Hh, law, 10, 0.01), r = N.reverse.fit(mesh, { tol: 0.1 });
  const vf = r.patches.find((p) => p.kind === 'varfillet');
  ok(!!vf, label + ' variable fillet: found as one variable-radius fillet', r.patches.map((p) => p.kind).join(','));
  if (!vf) continue;
  let lawErr = 0; for (const q of vf.model.law) lawErr = Math.max(lawErr, Math.abs(q.r - law(Math.max(0, Math.min(W, q.at[0])))));
  ok(lawErr <= 0.05, label + ' radius law within 0.05 mm of the truth at both ends, quarter points and middle', 'worst ' + lawErr.toFixed(4) + ' mm; ' + vf.model.law.map((q) => q.r.toFixed(3)).join(' / '));
  ok(vf.stats.max <= 0.1 && vf.stats.within === 1, label + ' variable fillet measured error within the tolerance', 'rms ' + vf.stats.rms.toFixed(4) + ' max ' + vf.stats.max.toFixed(4));
  const f = r.report.fillets.find((x) => x.kind === 'varfillet');
  ok(!!f && f.between.length === 2 && near(f.from, law(0), 0.05) && near(f.to, law(W), 0.05), label + ': reported as a fillet between the front and top faces, radius ' + (f && f.from.toFixed(3)) + ' to ' + (f && f.to.toFixed(3)));
  ok(!r.patches.some((p) => p.kind === 'freeform' || p.kind === 'torus'), label + ': no free-form patch and no torus left over');
  let sd = null; const e = code(() => { sd = N.tools.run(N.reverse.intoDoc(N.doc, N.doc.newDoc(), r).doc, 'scan.solid', { gap: 0.5 }); });
  let cut = 0; for (let i = 0; i < 6000; i++) { const x = W * (i + 0.5) / 6000; cut += (1 - Math.PI / 4) * law(x) ** 2 * W / 6000; }
  const want = W * D * Hh - cut;
  ok(e === null && sd && Math.abs(sd.report.volume - want) / want < 0.003, label + ': scan.solid closes it, volume ' + (sd ? sd.report.volume.toFixed(0) : '-') + ' vs ' + want.toFixed(0) + ' closed form', String(e) + (sd ? ' weld ' + sd.report.weld : ''));
  info(label + ' variable fillet: law ' + vf.model.law.map((q) => 'x ' + q.at[0].toFixed(1) + ' r ' + q.r.toFixed(3) + ' (' + law(Math.max(0, Math.min(W, q.at[0]))).toFixed(3) + ')').join(', ') + '; rms ' + vf.stats.rms.toFixed(4) + ' max ' + vf.stats.max.toFixed(4) + (sd ? '; volume ' + sd.report.volume.toFixed(1) + ' vs ' + want.toFixed(1) : '') + '; ' + r.report.ms + ' ms');
}

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
