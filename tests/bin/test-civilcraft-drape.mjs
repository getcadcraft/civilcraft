#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-drape.mjs — CivilCraft 0.4 V3 and V4 in the 3D scene (site3d.js), DOM-free, in Node:
 *   V3  map layers draped on the surfaces — `color: 'map'`, `drape` box → uvs (the painting of the map layers into the
 *       picture is the browser's: tools/civilcraft-test/browser-04.mjs § V3)
 *   V4  GIS layers in 3D — lines at their own z, flat lines draped on the ground exactly, points as crosses, hidden
 *       layers left out, the Show switch, the segment cap, GLB
 *   V5  picking alignments, pads, feature lines and breaklines in 3D: owners per segment, a click on each (top view,
 *       through a real Camera), the ground in front of a line hides it, a structure under the cursor beats a line
 *
 *   node bin/test-civilcraft-drape.mjs [--build dev|x.y] [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const S3 = await mod('site3d.js');
const EX = await mod('site3d-export.js');
const PJ = await mod('project.js');
const PTS = await mod('points.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
console.log('\n== map layers draped on the surfaces');
const p = new PJ.Project();
p.setPoints(PTS.parsePoints(fs.readFileSync(path.join(REPO, 'tools/civilcraft-test/site-topo.csv'), 'utf8')).points, 'site');
p.change('pad', (s) => { const b = p.eg().surface.bounds, cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2; s.pads.push({ id: 'p1', name: 'Pad', pts: [{ x: cx - 30, y: cy - 20 }, { x: cx + 30, y: cy - 20 }, { x: cx + 30, y: cy + 20 }, { x: cx - 30, y: cy + 20 }], z: p.eg().surface.elevationAt(cx, cy) + 1, cut: 2, fill: 2 }); });
const input = S3.siteInput(p);
const box = input.eg.bounds;
const map = S3.buildSite3D(input, { exag: 3, color: 'map', drape: box });
const eg = map.meshes.find((m) => m.key === 'eg'), fg = map.meshes.find((m) => m.key === 'fg');
ok(eg?.uvs && fg?.uvs && eg.uvs.length === (eg.positions.length / 3) * 2, 'both surfaces carry uvs, two per vertex');
let worst = 0, lo = Infinity, hi = -Infinity;
for (let i = 0, j = 0; i < eg.positions.length; i += 3, j += 2) {
  const X = eg.positions[i] + map.origin.x, Y = eg.positions[i + 1] + map.origin.y;
  worst = Math.max(worst, Math.abs(eg.uvs[j] - (X - box.minX) / (box.maxX - box.minX)), Math.abs(eg.uvs[j + 1] - (Y - box.minY) / (box.maxY - box.minY)));
  lo = Math.min(lo, eg.uvs[j], eg.uvs[j + 1]); hi = Math.max(hi, eg.uvs[j], eg.uvs[j + 1]);
}
ok(worst < 1e-6, `u = east across the box, v = north (worst ${worst.toExponential(1)})`);
ok(Math.abs(lo) < 1e-6 && Math.abs(hi - 1) < 1e-6, 'the box is the surface’s extent: uvs run from 0 to 1');
ok([...eg.colors].every((c) => c === 1), 'draped surfaces are white, so the picture shows in its own colours');
const bands = S3.buildSite3D(input, { exag: 3, color: 'bands' });
ok(!bands.meshes.some((m) => m.uvs) && [...bands.meshes.find((m) => m.key === 'eg').colors].some((c) => c !== 1), 'without a drape: no uvs, band colours as before');
ok(!S3.buildSite3D(input, { exag: 3, color: 'map' }).meshes.some((m) => m.uvs), "'map' without a drape box: no uvs");
ok(map.meshes.find((m) => m.key === 'eg').indices.length === S3.buildSite3D(input, { exag: 3, color: 'single' }).meshes.find((m) => m.key === 'eg').indices.length, 'the same triangles as one colour (no band pieces)');
const glb = EX.exportGLB(map, { name: 'site' });
const GL = await mod('gis-layers.js');
ok(glb instanceof Uint8Array && glb.length > 1000 && new TextDecoder().decode(glb.subarray(0, 4)) === 'glTF', 'GLB export still works from a draped scene (the map is not exported)');
console.log('\n== GIS layers in 3D');
{
  const I18N = await mod('i18n.js');
  I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const sf = p.eg().surface, b = sf.bounds, cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2;
  const F = (g) => ({ g, p: {} });
  const ids = GL.addLayers(p, [
    { name: 'Flat road', geom: 'ln', hasZ: false, fields: [], features: [F({ t: 'ln', c: [[[b.minX + 10, cy], [b.maxX - 10, cy]]] })] },
    { name: 'Wall top', geom: 'ln', hasZ: true, fields: [], features: [F({ t: 'ln', c: [[[cx - 50, cy + 20, 300], [cx + 50, cy + 20, 310]]] })] },
    { name: 'Parcels', geom: 'pg', hasZ: false, fields: [], features: [F({ t: 'pg', c: [[[[cx - 30, cy - 30], [cx + 30, cy - 30], [cx + 30, cy + 30], [cx - 30, cy - 30]]]] })] },
    { name: 'Spots', geom: 'pt', hasZ: false, fields: [], features: [F({ t: 'pt', c: [cx, cy] }), F({ t: 'pt', c: [cx + 5, cy, 999] }), F({ t: 'pt', c: [b.maxX + 5000, cy] })] },
    { name: 'Hidden', geom: 'ln', hasZ: false, fields: [], features: [F({ t: 'ln', c: [[[cx, cy], [cx + 10, cy]]] })] },
  ]);
  GL.setLayer(p, ids[4], { visible: false });
  const sc = S3.buildSite3D(S3.siteInput(p), { exag: 2 });
  const ln = (name) => sc.lines.find((l) => l.name === name);
  ok(ln('Flat road') && ln('Wall top') && ln('Parcels') && ln('Spots') && !ln('Hidden'), 'every visible GIS layer is a line set in its colour; the hidden one is not');
  ok(ln('Flat road').key === 'gis-' + ids[0] && /^#[0-9a-f]{6}$/i.test(ln('Flat road').color), 'key gis-<id>, a colour from the layer token');
  // the flat road lies on the ground: every vertex's z = the surface's at that place; more vertices than the 2 given
  const P3 = ln('Flat road').positions, O = sc.origin;
  let worst = 0;
  for (let i = 0; i < P3.length; i += 3) { const X = P3[i] + O.x, Y = P3[i + 1] + O.y, z = P3[i + 2] / 2 + O.z, zs = sf.elevationAt(X, Y, 1e-6); if (zs !== null) worst = Math.max(worst, Math.abs(z - zs)); }
  ok(P3.length / 6 > 20 && worst < 1e-3, `the flat road is draped: ${P3.length / 6} pieces on the ground (worst ${worst.toExponential(1)} ft, Float32)`);
  const W = ln('Wall top').positions;
  ok(W.length === 6 && Math.abs(W[2] / 2 + O.z - 300) < 1e-3 && Math.abs(W[5] / 2 + O.z - 310) < 1e-3, 'the wall top keeps its own z (300 → 310), one piece');
  ok(ln('Parcels').positions.length / 6 >= 4, 'a polygon outline is draped too');
  const S = ln('Spots').positions;
  ok(S.length === 4 * 6 && Math.abs(S[2] / 2 + O.z - sf.elevationAt(cx, cy)) < 1e-3 && Math.abs(S[14] / 2 + O.z - 999) < 1e-3, 'points: a cross on the ground, a cross at its own z (999)');
  ok(sc.notes.some((n) => /1 GIS shape without elevations lies off the surface/.test(n)), 'the point off the surface is counted, said');
  ok(!S3.buildSite3D(S3.siteInput(p), { exag: 2, show: { gis: false } }).lines.some((l) => l.key.startsWith('gis-')), 'Show › GIS layers off: none drawn');
  const big = [];
  for (let i = 0; i < 160000; i++) big.push(F({ t: 'ln', c: [[[cx, cy, 1], [cx + 1, cy, 1], [cx + 2, cy, 1]]] }));
  GL.addLayers(p, [{ name: 'Huge', geom: 'ln', hasZ: true, fields: [], features: big }]);
  const sc2 = S3.buildSite3D(S3.siteInput(p), { exag: 2 });
  const total = sc2.lines.filter((l) => l.key.startsWith('gis-')).reduce((t, l) => t + l.positions.length / 6, 0);
  ok(total === S3.MAX_GIS_SEGMENTS && sc2.notes.some((n) => /more than 300,000 line pieces/.test(n)), 'capped at 300,000 pieces, said');
  const g2 = EX.exportGLB(sc, { name: 'site' });
  ok(g2.length > glb.length, 'the GIS lines go into the GLB too');
}

console.log('\n== picking lines in 3D');
{
  const CAM = await mod('camera.js');
  const q = new PJ.Project();
  q.setPoints(PTS.parsePoints(fs.readFileSync(path.join(REPO, 'tools/civilcraft-test/site-topo.csv'), 'utf8')).points, 'site');
  const b = q.eg().surface.bounds, cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2, w = b.maxX - b.minX, h = b.maxY - b.minY;
  const zc = q.eg().surface.elevationAt(cx, cy);
  q.change('things', (s) => {
    s.alignments.push({ id: 'a1', name: 'Main', start: 0, pis: [{ x: b.minX + 0.1 * w, y: cy + 0.3 * h, r: 0 }, { x: b.maxX - 0.1 * w, y: cy + 0.3 * h, r: 0 }], pvis: [], corridor: null, sampling: null });
    s.pads.push({ id: 'p1', name: 'Pad A', pts: [{ x: cx - 30, y: cy - 20 }, { x: cx + 30, y: cy - 20 }, { x: cx + 30, y: cy + 20 }, { x: cx - 30, y: cy + 20 }], z: zc, cut: 2, fill: 2 });
    s.features.push({ id: 'f1', name: 'Curb', pts: [{ x: b.minX + 0.1 * w, y: cy - 0.3 * h, z: zc }, { x: b.maxX - 0.1 * w, y: cy - 0.3 * h, z: zc }], closed: false, use: 'off', daylight: false, cut: 2, fill: 3 });
    s.surface.breaklines.push({ name: 'Breakline 1', pts: [{ x: cx - 0.3 * w, y: cy - 0.42 * h, z: zc }, { x: cx + 0.3 * w, y: cy - 0.42 * h, z: zc }] });
  });
  const sc = S3.buildSite3D(S3.siteInput(q), { exag: 1 });
  const al = sc.lines.find((l) => l.key === 'alignments'), fl = sc.lines.find((l) => l.key === 'features'), bl = sc.lines.find((l) => l.key === 'breaklines'), pd = sc.lines.find((l) => l.key === 'pads');
  ok(al?.owners?.[0]?.kind === 'alignment' && al.segOwner.length === al.positions.length / 6, 'alignment segments carry their owner');
  ok(fl?.owners?.[0]?.id === 'f1' && !bl.owners.some((o) => o.kind === 'feature'), 'feature lines are their own set (not doubled as breaklines)');
  ok(bl.owners.some((o) => o.id === 'drawn:0'), 'a drawn breakline is owned as drawn:0');
  const cam = new CAM.Camera(); cam.setSize(1000, 800); cam.standard('top', sc.bbox);
  const at = (x, y, z) => { const p = cam.project([x - sc.origin.x, y - sc.origin.y, (z - sc.origin.z) * sc.exag]); return p; };
  const pickAt = (x, y, z) => { const s2 = at(x, y, z); return S3.pickSite(sc, cam, s2[0] + 2, s2[1] + 1); };
  const zA = (x, y) => q.eg().surface.elevationAt(x, y);
  let hit = pickAt(cx, cy + 0.3 * h, zA(cx, cy + 0.3 * h));
  ok(hit?.kind === 'alignment' && hit.id === 'a1', 'a click 2 px off the alignment picks it: ' + JSON.stringify(hit && [hit.kind, hit.id]));
  hit = pickAt(cx + 30, cy, zc);
  ok(hit?.kind === 'pad' && hit.id === 'p1', 'a click on the pad edge picks the pad');
  hit = pickAt(cx, cy - 0.3 * h, zc);
  ok(hit?.kind === 'feature' && hit.id === 'f1', 'a click on the feature line picks it');
  hit = pickAt(cx, cy - 0.42 * h, zc);
  ok(hit?.kind === 'breakline' && hit.id === 'drawn:0' && hit.name === 'Breakline 1', 'a click on a drawn breakline names it');
  hit = pickAt(cx + 0.33 * w, cy + 0.1 * h, zA(cx + 0.33 * w, cy + 0.1 * h));
  ok(hit?.kind === 'surface', 'a click on bare ground: the surface');
  // the ground in front of a line hides it: a synthetic wall between the camera and a line
  const wall = { units: 'ft', origin: { x: 0, y: 0, z: 0 }, exag: 1, bbox: { min: [-50, -50, 0], max: [50, 50, 50] }, notes: [], points: null,
    meshes: [{ key: 'eg', name: 'Wall', positions: new Float32Array([-50, 0, 0, 50, 0, 0, 50, 0, 50, -50, 0, 50]), normals: new Float32Array(12), colors: new Float32Array(12), indices: new Uint32Array([0, 1, 2, 0, 2, 3]) }],
    lines: [{ key: 'alignments', name: 'A', color: '#000000', positions: new Float32Array([-20, 10, 20, 20, 10, 20]), owners: [{ kind: 'alignment', id: 'behind', name: 'Behind' }], segOwner: new Uint32Array([0]) },
      { key: 'pads', name: 'P', color: '#000000', positions: new Float32Array([-20, -10, 30, 20, -10, 30]), owners: [{ kind: 'pad', id: 'front', name: 'Front' }], segOwner: new Uint32Array([0]) }] };
  const c2 = new CAM.Camera(); c2.setSize(800, 600); c2.standard('front', wall.bbox);
  const sB = c2.project([0, 10, 20]), sF = c2.project([0, -10, 30]);
  ok(S3.pickSite(wall, c2, sB[0], sB[1])?.kind === 'surface', 'a line behind the ground is not picked through it');
  ok(S3.pickSite(wall, c2, sF[0], sF[1])?.id === 'front', 'a line in front of the ground is');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
