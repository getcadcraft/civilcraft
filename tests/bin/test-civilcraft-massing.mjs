#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-massing.mjs — CivilCraft 0.7 LC.1: building masses, zoning, sun hours, IFC out (massing*.js), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-massing.mjs [--build dev|x.y] [--verbose]
 *
 * By hand: every expected number below is worked out in its section (a sloping plane, a 30 × 40 footprint, closed forms).
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
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const MS = await mod('massing.js');
const PJ = await mod('project.js');
const TIN = await mod('tin.js');
const SC = await mod('scene.js');
const S3 = await mod('site3d.js');
const ZN = await mod('zoning.js');
const SH = await mod('sunhours.js');
const SR = await mod('sunhours-run.js');
const IM = await mod('ifc-massing.js');
const UIS = [await mod('massing-ui.js'), await mod('sunhours-ui.js')];   // loaded, so a syntax slip in the screens shows here and not first in a browser
const IFCLIB = await import(pathToFileURL(path.join(REPO, 'lib/ifc/api.js')).href);
const GEO = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/bimcraft/dev/ifc-geo.js')).href);
const DRV = await mod('drive.js');
const PC = await mod('parcels.js');
const FL = await mod('featureline.js');
const { Camera } = await mod('camera.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);

// ground: the plane z = 100 + 0.1 x over 0 ≤ x ≤ 60, 0 ≤ y ≤ 60 (a 10% fall to the west; every 10 ft a column of points)
const pts = [];
for (let i = 0, n = 1; i <= 6; i++) for (let j = 0; j <= 6; j++) pts.push({ n: String(n++), x: i * 10, y: j * 10, z: 100 + 0.1 * i * 10, d: 'G' });
const surf = TIN.buildSurface({ points: pts }).surface;
const elev = (x, y) => { const z = surf.elevationAt(x, y, 1e-6); return Number.isFinite(z) ? z : null; };
const foot = [{ x: 10, y: 10 }, { x: 40, y: 10 }, { x: 40, y: 50 }, { x: 10, y: 50 }];   // 30 × 40, x from 10 to 40: ground 101 … 104

section('a mass: area, GFA, height');
{
  const m = MS.cleanMass({ pts: foot, floors: 3, floorHeight: 12 }, 'ft');
  near(MS.massArea(m), 1200, 1e-9, 'footprint 30 × 40 = 1,200');
  near(MS.massGfa(m), 3600, 1e-9, 'three floors: 3,600 sq ft'); near(MS.massHeight(m), 36, 1e-12, '3 × 12 = 36 ft');
  const cw = MS.cleanMass({ pts: [...foot].reverse(), floors: 3 }, 'ft');
  near(MS.massArea(cw), 1200, 1e-9, 'clockwise outlines have the same area');
  ok(MS.setHeight(m, 50) === 4 && MS.setHeight(m, 5) === 1 && MS.setHeight(m, 0) === 1 && MS.setHeight(m, 1e9) === MS.MAX_FLOORS, 'push/pull: 50 ft → 4 floors, never under one floor, capped at ' + MS.MAX_FLOORS);
  near(MS.levels(m, 100)[2].z, 124, 1e-12, 'level 3 starts at ground floor + 2 × 12'); near(MS.levels(m, 100)[2].top, 136, 1e-12, 'and tops out at 136');
}

section('the ground under a mass, the three bases');
{
  const base = (b) => MS.cleanMass({ pts: foot, floors: 3, floorHeight: 12, base: b }, 'ft');
  const g = MS.groundUnder(base('stepped'), elev);
  near(g.min, 101, 0.02, 'lowest ground 101 (x = 10)'); near(g.max, 104, 0.02, 'highest 104 (x = 40)'); near(g.mean, 102.5, 0.01, 'average 102.5');
  ok(g.missing === 0, 'every spot is on the surface');
  // fill = ∫ (z0 − g) dA where g < z0, over 30 × 40; the ground falls 0.1 ft per ft across 30 ft = 3 ft
  const pod = MS.baseLevel(base('podium'), g), cut = MS.baseLevel(base('cut'), g), mid = MS.baseLevel(base('stepped'), g);
  near(pod, g.max, 1e-12, 'podium: the high side'); near(cut, g.min, 1e-12, 'cut: the low side'); near(mid, g.mean, 1e-12, 'stepped: the average');
  const vp = MS.baseVolumes(base('podium'), g, pod);   // ∫ (104 − g) = 40 × (3 × 30 − 0.1 × 30²/2) = 40 × 45
  near(vp.fill, 1800, 2, 'podium fill 1,800 cu ft'); near(vp.cut, 0, 2, 'podium cut 0');
  const vc = MS.baseVolumes(base('cut'), g, cut);
  near(vc.cut, 1800, 2, 'cut 1,800 cu ft'); near(vc.fill, 0, 2, 'cut fill 0');
  const vs = MS.baseVolumes(base('stepped'), g, mid);   // each side: ∫₀^15 0.1 u du × 40 = 11.25 × 40 = 450
  near(vs.fill, 450, 2, 'stepped fill 450'); near(vs.cut, 450, 2, 'stepped cut 450: the two balance');
  const off = MS.groundUnder(MS.cleanMass({ pts: [{ x: 50, y: 10 }, { x: 80, y: 10 }, { x: 80, y: 50 }, { x: 50, y: 50 }] }, 'ft'), elev);
  ok(off && off.missing > 0 && off.n > 0, 'a mass half off the surface: the spots off it are counted as missing (' + (off && off.missing) + ')');
  ok(MS.groundUnder(MS.cleanMass({ pts: [{ x: 500, y: 500 }, { x: 510, y: 500 }, { x: 510, y: 510 }] }, 'ft'), elev) === null, 'a mass wholly off the surface: no ground');
}

section('triangles and the mesh');
{
  const L = [{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 30 }, { x: 0, y: 30 }];   // an L: 40×10 + 10×20 = 600
  const tri = MS.triangulate(L);
  let a = 0; for (let i = 0; i < tri.length; i += 3) a += Math.abs(MS.signedArea([L[tri[i]], L[tri[i + 1]], L[tri[i + 2]]]));
  ok(tri.length === 12, 'an L-shape: four triangles'); near(a, 600, 1e-9, 'their areas add up to the L (600)');
  const m = MS.cleanMass({ pts: L, floors: 2, floorHeight: 10 }, 'ft');
  const mesh = MS.massMesh(m, 100, 95);
  // volume by the divergence theorem over the closed walls + roof + (missing floor): walls and roof only, so check the walls' area and the roof's
  let wall = 0, roof = 0;
  for (let i = 0; i < mesh.indices.length; i += 3) {
    const p = [0, 1, 2].map((k) => { const v = mesh.indices[i + k]; return [mesh.positions[3 * v], mesh.positions[3 * v + 1], mesh.positions[3 * v + 2]]; });
    const u = p[1].map((v, k) => v - p[0][k]), w = p[2].map((v, k) => v - p[0][k]);
    const c = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]], area = Math.hypot(...c) / 2;
    if (Math.abs(c[2]) > 1e-9) roof += area; else wall += area;
  }
  near(roof, 600, 1e-6, 'the roof is 600 sq ft'); near(wall, (40 + 10 + 30 + 20 + 10 + 30) * (120 - 95), 1e-6, 'walls: perimeter 140 × (roof 120 − base 95) = 3,500');
  ok(Array.from(mesh.normals).every(Number.isFinite), 'normals are finite');
}

section('untrusted masses, the project file, the plan');
{
  const c = MS.cleanMass({ id: 'm7', name: 'A\u0007B', floors: 9999, floorHeight: -3, base: 'x', ground: 'fg', parcel: 'r2', pts: [{ x: 0, y: 0 }, { x: 'x', y: 1 }, { x: 10, y: 0 }, { x: 10, y: 10 }] }, 'm');
  ok(c && c.name === 'A B' && c.pts.length === 3 && c.floors === MS.MAX_FLOORS && c.floorHeight === 3.6 && c.base === 'stepped' && c.ground === 'fg' && c.parcel === 'r2', 'bad corner dropped, floors capped, floor height back to the metric default, base back to stepped');
  ok(MS.cleanMass({ pts: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }) === null && MS.cleanMass({ pts: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }] }) === null && MS.cleanMass(null) === null, 'two corners, or three in a line: no mass');
  const p = new PJ.Project();
  const m = { ...MS.cleanMass({ pts: foot, floors: 4, floorHeight: 11, base: 'podium', use: 'Housing' }, 'ft'), id: 'm1', name: 'Block A' };
  p.change('Mass', (s) => s.masses.push(m));
  const q = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
  ok(JSON.stringify(q.state.masses) === JSON.stringify([m]), 'the project file keeps masses');
  ok(q.nextId('m') !== 'm1', 'new ids do not reuse a saved mass’s');
  ok(!('masses' in new PJ.Project().toJSON()), 'a project with no masses writes no key (older builds see the same file)');
  p.undo();
  ok(p.state.masses.length === 0, 'drawing a mass is one undo step');
  const items = MS.planItems(m, { units: 'ft', unitPerMm: 1 });
  ok(items[0].layer === 'A-MASS' && items[0].closed && items[1].text === 'Block A' && /4 floors/.test(items[2].text) && /4,800/.test(items[2].text), 'plan: closed outline on A-MASS, the name, "4 floors 4,800 sq ft": ' + items[2].text);
  ok(SC.LAYERS.some((l) => l.name === 'A-MASS') && SC.LAYERS.some((l) => l.name === 'A-MASS-TEXT'), 'the layers are in the layer list');
}

section('masses in the 3D site view (M2) and the street view');
{
  const p = new PJ.Project();
  p.setPoints(pts, 'plane');
  p.change('Mass', (s) => s.masses.push({ ...MS.cleanMass({ pts: foot, floors: 3, floorHeight: 12, base: 'podium', name: 'Block A' }, 'ft'), id: 'm1' }));
  const input = S3.siteInput(p);
  ok(input.masses.length === 1 && Math.abs(input.masses[0].z0 - 104) < 0.02 && Math.abs(input.masses[0].zBottom - 101) < 0.02, 'siteInput: the mass sits on the existing ground; podium: ground floor at the high side (' + input.masses[0].z0.toFixed(2) + '), base down to the low side (' + input.masses[0].zBottom.toFixed(2) + ')');
  const sc = S3.buildSite3D(input, {});
  const mm = sc.meshes.find((x) => x.key === 'masses');
  ok(mm && mm.owners.length === 1 && mm.owners[0].kind === 'mass' && sc.counts.masses === 1, 'a masses mesh with the mass as its owner');
  const fl = sc.lines.find((x) => x.key === 'mass-floors');
  ok(fl && fl.positions.length / 6 === 4 * 4 && fl.owners[0].id === 'm1', 'a line round every floor: 4 levels (ground, three tops) × 4 sides = 16 segments');
  near(sc.roofs[0].z, 104 + 36, 0.02, 'the roof: ground floor 104 + 3 × 12 = 140'); ok(sc.roofs[0].floors === 3 && sc.roofs[0].floorHeight === 12, 'with the floor count and floor height the push/pull drag needs');
  ok(sc.labels.some((l) => l.text === 'Block A'), 'the mass is named over its roof');
  ok(!S3.buildSite3D(input, { show: { masses: false } }).meshes.some((x) => x.key === 'masses'), 'Show › Building masses off: not drawn');
  // exaggerated twice: the roof is twice as high in the view, and the normals stay unit length
  const sc2 = S3.buildSite3D(input, { exag: 2 }), mm2 = sc2.meshes.find((x) => x.key === 'masses');
  ok(Math.max(...Array.from(mm2.positions).filter((_, i) => i % 3 === 2)) > Math.max(...Array.from(mm.positions).filter((_, i) => i % 3 === 2)) * 1.5, 'vertical exaggeration lifts the roof');
  let unit = true; for (let i = 0; i < mm2.normals.length; i += 3) if (Math.abs(Math.hypot(mm2.normals[i], mm2.normals[i + 1], mm2.normals[i + 2]) - 1) > 1e-5) unit = false;
  ok(unit, 'normals are unit length at exaggeration 2');
  // picking: a ray onto the roof finds the mass in front of the ground
  const cam = new Camera(); cam.setSize(1000, 700); cam.standard('iso', sc.bbox);
  const toLocal = (x, y, z) => [x - sc.origin.x, y - sc.origin.y, (z - sc.origin.z) * sc.exag];
  const sp = cam.project(toLocal(25, 30, 140));
  const hit = S3.pickSite(sc, cam, sp[0], sp[1]);
  ok(hit?.kind === 'mass' && hit.id === 'm1' && Math.abs(hit.at.z - 140) < 0.05, 'clicking the roof picks the mass at roof height (' + hit?.kind + ' ' + hit?.id + ' z ' + hit?.at?.z?.toFixed(2) + ')');
  // street view: the scene the drive view looks into holds the mass
  const hitMesh = (o, d) => { const P = mm.positions, I = mm.indices; let best = null; for (let t = 0; t < I.length; t += 3) { const v = [0, 1, 2].map((k) => [P[3 * I[t + k]], P[3 * I[t + k] + 1], P[3 * I[t + k] + 2]]); const h = rayTriLocal(o, d, ...v); if (h !== null && (best === null || h < best)) best = h; } return best; };
  // the drive view puts the eye 3.5 ft over the road; here a street at x = 5 and a look toward the mass
  const eye = toLocal(5, 0, 101 + 3.5), aim = toLocal(25, 30, 101 + 3.5), dv = aim.map((v, i) => v - eye[i]), L = Math.hypot(...dv);
  const t1 = hitMesh(eye, dv.map((v) => v / L));
  ok(t1 !== null && t1 > 0 && t1 < L + 1, 'from the street at eye height a ray toward the mass hits its wall (' + (t1 && t1.toFixed(1)) + ' ft away)');
}
function rayTriLocal(o, d, a, b, c) {   // Möller–Trumbore
  const e1 = b.map((v, i) => v - a[i]), e2 = c.map((v, i) => v - a[i]);
  const pv = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]];
  const det = e1[0] * pv[0] + e1[1] * pv[1] + e1[2] * pv[2];
  if (Math.abs(det) < 1e-12) return null;
  const tv = o.map((v, i) => v - a[i]), u = (tv[0] * pv[0] + tv[1] * pv[1] + tv[2] * pv[2]) / det;
  if (u < 0 || u > 1) return null;
  const q = [tv[1] * e1[2] - tv[2] * e1[1], tv[2] * e1[0] - tv[0] * e1[2], tv[0] * e1[1] - tv[1] * e1[0]], v = (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]) / det;
  if (v < 0 || u + v > 1) return null;
  const t = (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) / det;
  return t > 0 ? t : null;
}

section('zoning: setbacks per lot line (M3)');
{
  const lot = { id: 'r1', name: 'Lot', pts: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 200 }, { x: 0, y: 200 }] };   // 100 × 200, the south line is the street
  const zone = ZN.cleanZone({ parcel: 'r1', front: 25, side: 10, rear: 20, frontCourse: 0 }, 'ft');
  const dist = ZN.courseSetbacks(lot, zone);
  ok(dist.join() === '25,10,20,10', 'front 25 on the street line, rear 20 on the line opposite it, 10 on the sides: ' + dist.join());
  const env = ZN.envelope(lot, zone);
  near(env.area, 80 * 155, 1e-6, 'the rectangle lot: (100 − 2×10) × (200 − 25 − 20) = 12,400 sq ft'); near(env.lotArea, 20000, 1e-9, 'lot 20,000');
  const xs = env.poly.map((q) => q.x), ys = env.poly.map((q) => q.y);
  ok(Math.min(...xs) === 10 && Math.max(...xs) === 90 && Math.min(...ys) === 25 && Math.max(...ys) === 180, 'corners at x 10 … 90, y 25 … 180');
  ok(!ZN.envelope(lot, ZN.cleanZone({ parcel: 'r1', front: 0, side: 0, rear: 0 }, 'ft')).problem && ZN.envelope(lot, ZN.cleanZone({ parcel: 'r1' }, 'ft')).area === 20000, 'no limits typed: the whole lot');
  const typed = ZN.envelope(lot, ZN.cleanZone({ parcel: 'r1', front: 25, side: 10, rear: 20, setbacks: { 1: 30 } }, 'ft'));
  near(typed.area, 60 * 155, 1e-6, 'a distance typed for one line (the east side 30) wins over the side setback: 60 × 155');
  // uniform: featureline.js offsetFeature, and the per-line mitre agrees with it
  const uni = ZN.envelope(lot, ZN.cleanZone({ parcel: 'r1', front: 10, side: 10, rear: 10 }, 'ft'));
  const viaFl = FL.offsetFeature({ pts: [{ x: 0, y: 0, z: 0 }, { x: 100, y: 0, z: 0 }, { x: 100, y: 200, z: 0 }, { x: 0, y: 200, z: 0 }], closed: true }, -10).f;
  ok(uni.uniform && uni.poly.length === 4 && uni.poly.every((q, k) => Math.abs(q.x - viaFl.pts[k].x) < 1e-9 && Math.abs(q.y - viaFl.pts[k].y) < 1e-9), 'one distance all round is offsetFeature\'s own offset');
  const mi = ZN.mitreInset(ZN.lotRing(lot), [10, 10, 10, 10]);
  ok(mi.poly.every((q, k) => Math.abs(q.x - viaFl.pts[k].x) < 1e-9 && Math.abs(q.y - viaFl.pts[k].y) < 1e-9), '… and the per-line mitre gives the same polygon');
  const thin = ZN.envelope({ pts: [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 100 }, { x: 0, y: 100 }] }, ZN.cleanZone({ parcel: 'r1', front: 5, side: 12, rear: 5 }, 'ft'));
  ok(thin.poly === null && thin.problem && thin.area === 0, 'sides of 12 ft on a 20 ft lot fold over: no envelope, and a reason (' + thin.problem + ')');
  const cw = ZN.envelope({ pts: [...lot.pts].reverse() }, ZN.cleanZone({ parcel: 'r1', front: 25, side: 10, rear: 20, frontCourse: 0 }, 'ft'));
  ok(cw.poly && cw.area > 0, 'a clockwise lot gives an envelope too (' + cw.area + ')');
}

section('zoning: a concave lot');
{
  // an L: 100 × 40 along the south and 40 × 60 up the west side; area 4,000 + 2,400 = 6,400; the reflex corner is (40, 40)
  const L = { id: 'r2', name: 'L', pts: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 40 }, { x: 40, y: 40 }, { x: 40, y: 100 }, { x: 0, y: 100 }] };
  near(PC.parcelArea(L.pts), 6400, 1e-9, 'the L is 6,400 sq ft');
  const u5 = ZN.envelope(L, ZN.cleanZone({ parcel: 'r2', front: 5, side: 5, rear: 5 }, 'ft'));
  // taken in 5 ft all round: (5,5) (95,5) (95,35) (35,35) (35,95) (5,95) = 90 × 30 + 30 × 60
  near(u5.area, 4500, 1e-6, 'taken in 5 ft all round: 90 × 30 + 30 × 60 = 4,500'); ok(u5.poly.some((q) => Math.abs(q.x - 35) < 1e-9 && Math.abs(q.y - 35) < 1e-9), 'the reflex corner moves to (35, 35)');
  const mix = ZN.envelope(L, ZN.cleanZone({ parcel: 'r2', front: 10, side: 5, rear: 5, frontCourse: 0 }, 'ft'));
  near(mix.area, 90 * 25 + 30 * 60, 1e-6, 'the street line (south) at 10 ft, the rest 5: 90 × 25 + 30 × 60 = 4,050');
  ok(ZN.courseSetbacks(L, ZN.cleanZone({ parcel: 'r2', front: 10, side: 5, rear: 5, frontCourse: 0 }, 'ft'))[0] === 10, 'the front line is the one typed');
  // the same lot clockwise gives the same area
  const cw = ZN.envelope({ pts: [...L.pts].reverse() }, ZN.cleanZone({ parcel: 'r2', front: 5, side: 5, rear: 5 }, 'ft'));
  near(cw.area, 4500, 1e-6, 'clockwise: the same 4,500');
  // masses against it: a 30 × 20 box at (10, 10) is inside; one pushed over the inner corner is not
  const box = (x, y, w, h) => MS.cleanMass({ pts: [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }], floors: 2, floorHeight: 12 }, 'ft');
  near(ZN.insideArea(u5.poly, box(10, 10, 30, 20).pts), 600, 1e-6, 'a 30 × 20 mass at (10, 10) is wholly inside');
  // inside: the strip x 30…50 × y 30…35 (20 × 5 = 100) in the bottom arm and x 30…35 × y 35…50 (5 × 15 = 75) in the west arm
  near(ZN.insideArea(u5.poly, box(30, 30, 20, 20).pts), 175, 1e-6, 'a 20 × 20 mass at (30, 30) over the inner corner: 100 + 75 = 175 sq ft inside');
  const c = ZN.checkMasses(L, ZN.cleanZone({ parcel: 'r2', front: 5, side: 5, rear: 5 }, 'ft'), [box(30, 30, 20, 20)]);
  near(c.items.find((i) => i.key === 'setback').value, 400 - 175, 1e-6, 'checkMasses: 225 sq ft of that mass is outside the envelope'); ok(!c.ok, 'and the lot does not comply');
  // a round lot: radius 50, taken in 5: about π × 45² (a polygon of chords within 0.01 of the circle)
  const round = { pts: [{ x: 0, y: 0, b: 1 }, { x: 100, y: 0, b: 1 }] };
  const re = ZN.envelope(round, ZN.cleanZone({ parcel: 'r3', front: 5, side: 5, rear: 5 }, 'ft'));
  near(re.area, Math.PI * 45 * 45, Math.PI * 45 * 45 * 0.01, 'a round lot (two arcs) taken in 5 ft: about π × 45² = ' + (Math.PI * 45 * 45).toFixed(0));
}

section('zoning: height cap, sky-exposure plane, FAR, coverage');
{
  const lot = { id: 'r1', name: 'Lot', pts: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 200 }, { x: 0, y: 200 }] };
  const z = ZN.cleanZone({ parcel: 'r1', front: 25, side: 10, rear: 20, heightCap: 40, sky: { h0: 20, rise: 2, from: 'front' }, far: 0.9, coverage: 0.45 }, 'ft');
  const box = (x, y, w, h, fl = 3) => MS.cleanMass({ pts: [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }], floors: fl, floorHeight: 12 }, 'ft');
  // the plane over the front line: 20 + 2 × 10 = 40 at 10 ft in, 20 + 2 × 5 = 30 at 5 ft in
  const a10 = ZN.allowedHeight(lot, z, box(20, 10, 30, 30).pts), a30 = ZN.allowedHeight(lot, z, box(20, 30, 30, 30).pts), a5 = ZN.allowedHeight(lot, z, box(20, 5, 30, 30).pts);
  near(a10.height, 40, 1e-9, 'a corner 10 ft in: plane 40, cap 40'); ok(a10.by === 'cap' || a10.by === 'sky', 'the lower one is named');
  near(a5.height, 30, 1e-9, 'a corner 5 ft in: plane 30'); ok(a5.by === 'sky', 'by the sky plane');
  near(a30.height, 40, 1e-9, 'a corner 30 ft in: plane 80, the 40 ft cap rules'); ok(a30.by === 'cap', 'by the cap');
  const r1 = ZN.checkMasses(lot, z, [box(20, 30, 30, 30, 3)]);   // 36 ft tall, 30 ft in
  ok(r1.items.find((i) => i.key === 'height').ok, '36 ft tall, 30 ft in from the street: under the cap');
  const r2 = ZN.checkMasses(lot, ZN.cleanZone({ parcel: 'r1', heightCap: 40, sky: { h0: 20, rise: 2, from: 'front' } }, 'ft'), [box(20, 5, 30, 30, 3)]);
  const h2 = r2.items.find((i) => i.key === 'height');
  ok(!h2.ok && Math.abs(h2.limit - 30) < 1e-9 && h2.value === 36, '36 ft tall with a corner 5 ft from the street: over the plane (limit 30)');
  const all = ZN.allowedHeight(lot, ZN.cleanZone({ parcel: 'r1', sky: { h0: 20, rise: 2, from: 'all' } }, 'ft'), box(95, 100, 5, 10).pts);
  near(all.height, 20, 1e-9, 'from every line: a corner on the east lot line is limited to h0 = 20');
  // FAR / coverage: 1,200 sq ft footprint × 3 floors on 20,000 sq ft; 1,200 / 20,000 = 0.06, 3,600 / 20,000 = 0.18
  const ok1 = ZN.checkMasses(lot, z, [box(20, 30, 30, 40, 3)]);
  near(ok1.coverage, 0.06, 1e-12, 'coverage 0.06'); near(ok1.far, 0.18, 1e-12, 'FAR 0.18');
  ok(ok1.items.find((i) => i.key === 'far').ok && ok1.items.find((i) => i.key === 'coverage').ok && ok1.ok, 'under 0.9 and 0.45: complies');
  const big = ZN.checkMasses(lot, z, [box(15, 30, 70, 120, 4)]);   // 8,400 footprint: coverage 0.42, FAR 1.68
  near(big.coverage, 0.42, 1e-12, 'coverage 0.42'); near(big.far, 1.68, 1e-12, 'FAR 1.68');
  ok(!big.items.find((i) => i.key === 'far').ok && big.items.find((i) => i.key === 'coverage').ok, 'FAR 1.68 breaks the 0.9 limit; coverage 0.42 is within 0.45');
  const sum = ZN.checkMasses(lot, z, [box(15, 30, 30, 40, 3), box(55, 30, 30, 40, 3)]);
  near(sum.coverage, 2400 / 20000, 1e-12, 'two masses on the lot add up: coverage 0.12');
  const c0 = ZN.cleanZone({ parcel: 'r9', front: -4, side: 'x', rear: 1e9, heightCap: 5, sky: { h0: 3, rise: 0 }, coverage: 2, setbacks: { 0: 4, a: 1, 3: -2 } }, 'ft');
  ok(c0 && c0.front === 0 && c0.side === 0 && c0.rear === 0 && c0.sky === null && c0.coverage === 0 && JSON.stringify(c0.setbacks) === '{"0":4}', 'untrusted zoning: negatives, text, huge numbers, a plane with no rise, coverage over 1 all dropped');
  ok(ZN.cleanZone({ parcel: 'x' }) === null && ZN.cleanZone(null) === null, 'a zone needs a parcel id');
  const p = new PJ.Project();
  p.change('Zone', (st) => st.zoning.push(z));
  const q = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
  ok(JSON.stringify(q.state.zoning) === JSON.stringify([z]), 'the project file keeps the zoning limits');
  ok(!('zoning' in new PJ.Project().toJSON()), 'no zoning, no key');
}

section('sun hours (M4): time zones');
{
  ok(SH.utcOffsetFor('2026-01-15', 'America/New_York') === -5 && SH.utcOffsetFor('2026-07-15', 'America/New_York') === -4, 'a named zone is looked up for the date: New York −5 in January, −4 in July (daylight saving)');
  ok(SH.utcOffsetFor('2026-01-15', 'Europe/Madrid') === 1 && SH.utcOffsetFor('2026-07-15', 'Europe/Madrid') === 2 && SH.utcOffsetFor('2026-07-15', 'Asia/Kolkata') === 5.5, 'Madrid +1 / +2, Kolkata +5.5');
  ok(SH.utcOffsetFor('2026-07-15', -6) === -6 && SH.utcOffsetFor('2026-07-15', '-6') === -6 && SH.utcOffsetFor('2026-07-15', 15) === null && SH.utcOffsetFor('2026-07-15', 'Nowhere/Land') === null && SH.utcOffsetFor('2026-07-15', '') === null, 'a typed offset is used as typed; 15, an unknown name and nothing are refused');
}

section('sun hours (M4): closed forms');
{
  // a wall 36 ft high on flat ground, the sun due south at 47°: its shadow runs 36 / tan 47° north of it
  const wall = { id: 'm1', name: 'W', pts: [{ x: -500, y: 0 }, { x: 500, y: 0 }, { x: 500, y: 0.5 }, { x: -500, y: 0.5 }], z0: 0, zBottom: 0, floors: 3, floorHeight: 12 };
  const world = SH.makeWorld([wall], null, { x: 0, y: 0 });
  const dir = DRV.sunVector({ azimuth: 180, altitude: 47 });
  let lo = 0, hi = 100;   // distance north of the wall's north face; lit beyond the shadow
  for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (SH.isLit(world, 0, 0.5 + mid, 0, dir)) hi = mid; else lo = mid; }
  near(hi, 36 / Math.tan((47 * Math.PI) / 180), 1e-6, 'shadow length 36 / tan 47° = ' + (36 / Math.tan((47 * Math.PI) / 180)).toFixed(4) + ' ft (found by bisection on the rays)');
  ok(SH.isLit(world, 0, -20, 0, dir), 'south of the wall the ground is in the sun');
  // the wall's top (36 ft) seen from 10 ft north reaches 36 − 10 tan 47° = 25.3 ft up the ray, so a point 26 ft up is lit and 24 ft is not
  ok(SH.isLit(world, 0, 0.5 + 10, 26, dir) && !SH.isLit(world, 0, 0.5 + 10, 24, dir) && !SH.isLit(world, 0, 0.5 + 10, 5, dir), 'a point 10 ft north of the wall: lit at 26 ft up, in the shadow at 24 and at 5');
  // a concave footprint (an L, 100 ft tall): the notch is open air; the arms are not
  const Lm = { id: 'm2', name: 'L', pts: [{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 40 }, { x: 0, y: 40 }], z0: 0, zBottom: 0, floors: 1, floorHeight: 100 };
  const wl = SH.makeWorld([Lm], null, { x: 0, y: 0 });
  const nw = [-0.5, 0.5, Math.SQRT1_2];   // the sun to the north-west at 45°
  ok(SH.isLit(wl, 45, 10, 0, nw) === true, 'concave: a line from (45, 10) to the north-west runs through the notch, past both arms\' inner corners: lit (a convex hull would shade it)');
  ok(SH.isLit(wl, 35, -5, 0, nw) === false, 'concave: from (35, −5) the same direction crosses the south arm: in shade');
  // the ground shades itself: a plateau 10 ft high from y = −∞ to −20, flat 0 beyond; the sun due south at 20°
  const T = { x0: -200, y0: -200, cell: 1, nx: 401, ny: 401, z: new Float32Array(401 * 401) };
  for (let j = 0; j < 401; j++) for (let i = 0; i < 401; i++) T.z[j * 401 + i] = j + T.y0 <= -20 ? 10 : 0;
  const wt = SH.makeWorld([], T, { x: 0, y: 0 }), d20 = DRV.sunVector({ azimuth: 180, altitude: 20 });
  ok(!SH.isLit(wt, 0, 0, 0.01, d20) && SH.isLit(wt, 0, 10, 0.01, d20), 'terrain: the plateau shades y = 0 (its edge at 20 ft rises 7.3 ft in the ray, plateau is 10) and not y = 10 (rises 10.9)');
}

section('sun hours (M4): a site, a day');
{
  const lat = 40, lon = -105, zone = -7;   // standard time in January
  const m = { id: 'm1', name: 'Block', pts: [{ x: 1000, y: 2000 }, { x: 1030, y: 2000 }, { x: 1030, y: 2020 }, { x: 1000, y: 2020 }], z0: 0, zBottom: 0, floors: 3, floorHeight: 12 };
  const winter = SH.sunHours({ masses: [m], lat, lon, days: [{ date: '2026-12-21', utcOffset: zone }], stepMin: 15, cell: 4, margin: 90 });
  // day length at 40° N on the solstice: 2 acos(−tan φ tan δ) / 15 = 9.16 h (+ refraction and the sampled steps)
  near(winter.daylight, 9.16, 0.4, 'December 21 at 40°N: ' + winter.daylight.toFixed(2) + ' h of sun above the horizon (closed form 9.16)');
  const sums = SH.facadeSummary(winter);
  const byName = (deg) => winter.facades.find((f) => Math.abs((((90 - (f.normal * 180) / Math.PI) % 360) + 360) % 360 - deg) < 1);
  const south = byName(180), north = byName(0), east = byName(90), west = byName(270);
  near(south.mean, winter.daylight, 0.35, 'the south wall faces the sun all day (an unshaded wall in winter): ' + south.mean.toFixed(2) + ' h');
  near(north.mean, 0, 1e-9, 'the north wall gets no sun in December at 40°N');
  ok(east.mean > 3.5 && east.mean < 5.5 && west.mean > 3.5 && west.mean < 5.5 && Math.abs(east.mean - west.mean) < 0.6, 'east and west walls: about half a day each (' + east.mean.toFixed(2) + ', ' + west.mean.toFixed(2) + ')');
  ok(sums.length === 1 && sums[0].min === 0 && sums[0].max > 8, 'facadeSummary: worst wall 0, best wall > 8 h');
  const g = winter.ground, at = (x, y) => { const i = Math.floor((x - g.x0) / g.cell), j = Math.floor((y - g.y0) / g.cell); return g.hours[j * g.nx + i]; };
  ok(at(1015, 2010) === -1, 'a cell under the mass is masked');
  ok(at(1015, 2060) < winter.daylight - 1, 'north of the block, 40 ft off: in its shadow for hours (' + at(1015, 2060).toFixed(2) + ' h)');
  near(at(1015, 1950), winter.daylight, 0.01, 'south of it, in the open: the whole day');
  near(g.max, winter.daylight, 0.01, 'no cell has more than the day');
  // a season: the mean of two days is the mean of their results
  const d2 = SH.sunHours({ masses: [m], lat, lon, days: [{ date: '2026-03-20', utcOffset: zone }], stepMin: 15, cell: 4, margin: 90 });
  const both = SH.sunHours({ masses: [m], lat, lon, days: [{ date: '2026-12-21', utcOffset: zone }, { date: '2026-03-20', utcOffset: zone }], stepMin: 15, cell: 4, margin: 90 });
  let worst = 0; for (let k = 0; k < both.ground.hours.length; k++) worst = Math.max(worst, Math.abs(both.ground.hours[k] - (winter.ground.hours[k] + d2.ground.hours[k]) / 2));
  ok(worst < 1e-5, 'a two-day season is the mean of the two single days (largest cell difference ' + worst.toExponential(1) + ' h)');
  near(both.daylight, (winter.daylight + d2.daylight) / 2, 1e-9, 'and so is its day length');
  // the equator at an equinox: twelve hours (and a little for refraction)
  const eq = SH.sunHours({ masses: [{ ...m, floors: 1 }], lat: 0, lon: -78, days: [{ date: '2026-03-20', utcOffset: -5 }], stepMin: 15, cell: 8, margin: 60 });
  near(eq.daylight, 12.1, 0.3, 'the equator at the March equinox: ' + eq.daylight.toFixed(2) + ' h (12 and a little)');
  // sloping ground: a south-facing rise in front of the block shades it
  const T = SH.terrainRaster((x, y) => (y < 1990 ? (1990 - y) * 0.6 : 0), { minX: 900, minY: 1800, maxX: 1150, maxY: 2200 }, 4);
  const hill = SH.sunHours({ masses: [m], terrain: T, lat, lon, days: [{ date: '2026-12-21', utcOffset: zone }], stepMin: 15, cell: 4, margin: 60 });
  const southH = hill.facades.find((f) => Math.abs((((90 - (f.normal * 180) / Math.PI) % 360) + 360) % 360 - 180) < 1);
  ok(southH.mean < south.mean - 1, 'a hill rising 60% to the south of the block takes hours off its south wall: ' + southH.mean.toFixed(2) + ' vs ' + south.mean.toFixed(2) + ' h');
  const csv = SH.facadeCsv(winter), gcsv = SH.groundCsv(winter);
  ok(csv.split('\n')[0] === 'mass,wall,facing_deg,floor,sun_hours_per_day' && csv.trim().split('\n').length === 1 + 4 * 3, 'facade CSV: header + 4 walls × 3 floors');
  ok(gcsv.split('\n')[0] === 'x,y,sun_hours_per_day' && gcsv.trim().split('\n').length > 100, 'ground CSV: header and a row per cell outside the mass');
  ok(SH.facadeCsv({ facades: [{ name: '=cmd()', edge: 0, normal: 0, floors: [1] }] }).includes("'=cmd()"), 'CSV cells that start with = are escaped');
  void sums;
}

section('sun hours (M4): a season dealt out to workers');
{
  const m = { id: 'm1', name: 'Block', pts: [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 20 }, { x: 0, y: 20 }], z0: 0, zBottom: 0, floors: 2, floorHeight: 12 };
  const days = ['2026-12-21', '2026-03-20', '2026-06-21'].map((date) => ({ date, utcOffset: -7 }));
  const input = { masses: [m], lat: 40, lon: -105, days, stepMin: 30, cell: 6, margin: 40 };
  // a stand-in worker that answers like sunhours-worker.js, in this thread
  const fake = () => { const w = { postMessage(msg) { setTimeout(() => w.onmessage({ data: { id: msg.id, result: SH.sunHours(msg.input) } }), 0); }, terminate() {} }; return w; };
  const whole = SH.sunHours(input), split = await SR.runSunHours(input, { workers: 2, makeWorker: fake });
  let worst = 0; for (let k = 0; k < whole.ground.hours.length; k++) worst = Math.max(worst, Math.abs(whole.ground.hours[k] - split.ground.hours[k]));
  let wf = 0; whole.facades.forEach((f, i) => f.floors.forEach((h, k) => { wf = Math.max(wf, Math.abs(h - split.facades[i].floors[k])); }));
  ok(split.days === 3 && worst < 1e-5 && wf < 1e-5 && Math.abs(split.daylight - whole.daylight) < 1e-9, 'three days over two workers = the same three days in one: ground ' + worst.toExponential(1) + ' h, walls ' + wf.toExponential(1) + ' h');
  const one = await SR.runSunHours({ ...input, days: [days[0]] }, { workers: 3, makeWorker: fake });
  ok(one.days === 1, 'one day runs in the page (no worker needed)');
  let err = null; try { await SR.runSunHours(input, { workers: 2, makeWorker: () => ({ postMessage() { throw new Error('boom'); }, terminate() {} }) }); } catch (e) { err = e; }
  ok(err && /boom/.test(err.message), 'a worker that fails rejects with its reason');
}

section('the screens load');
ok(UIS.every((m) => Object.keys(m).length > 0) && typeof UIS[0].createMassing === 'function' && typeof UIS[1].createSunHours === 'function', 'massing-ui.js and sunhours-ui.js load and export their factories');

section('IFC out (M6): written, opened by cc-ifc, placed by BimCraft\'s reader');
{
  const FTUS = 1200 / 3937;
  const crs = { code: 2277, name: 'NAD83 / Texas Central (ftUS)', unit: 'ftUS' };
  // state-plane magnitudes: the precision a file in metres loses when the unit is read wrong
  const A = { id: 'm1', name: 'Block A', use: 'Housing', pts: [{ x: 2080100, y: 6150200 }, { x: 2080130, y: 6150200 }, { x: 2080130, y: 6150240 }, { x: 2080100, y: 6150240 }], floors: 3, floorHeight: 12, z0: 254.5, base: 'stepped', ground: 'eg', parcel: 'Lot 7' };
  const B = { id: 'm2', name: 'Block B', use: '', pts: [{ x: 2080160, y: 6150200 }, { x: 2080200, y: 6150200 }, { x: 2080200, y: 6150210 }, { x: 2080170, y: 6150210 }, { x: 2080170, y: 6150240 }, { x: 2080160, y: 6150240 }], floors: 2, floorHeight: 10, z0: 258, base: 'podium', ground: 'fg', parcel: '' };
  const r = IM.writeMassingIfc({ name: 'Lot 7 study', units: 'ft', crs, lat: 30.2, lon: -97.7, masses: [A, B] }, { now: new Date('2026-10-23T00:00:00Z') });
  ok(r.counts.masses === 2 && r.counts.storeys === 5 && r.unit === 'ftUS', 'two masses, five storeys, written in US survey feet');
  ok(IM.writeMassingIfc({ name: 'Lot 7 study', units: 'ft', crs, lat: 30.2, lon: -97.7, masses: [A, B] }, { now: new Date('2026-10-23T00:00:00Z') }).text === r.text, 'the same project writes the same file (stable ids)');
  const api = new IFCLIB.IfcAPI(); await api.Init();
  const mid = api.OpenModel(new TextEncoder().encode(r.text));
  const cnt = (t) => api.GetLineIDsWithType(mid, t).size();
  ok(cnt(IFCLIB.IFCPROJECT) === 1 && cnt(IFCLIB.IFCSITE) === 1 && cnt(IFCLIB.IFCBUILDING) === 2 && cnt(IFCLIB.IFCBUILDINGSTOREY) === 5 && cnt(IFCLIB.IFCBUILDINGELEMENTPROXY) === 2, 'cc-ifc opens it: Project > Site > 2 Buildings > 5 Storeys, one proxy per mass');
  const g = GEO.readGeoref(api, mid);
  ok(g && g.kind === 'map' && g.crs.code === 2277 && Math.abs(g.mapUnitM - FTUS) < 1e-12 && Math.abs(g.fileUnitM - FTUS) < 1e-12, 'BimCraft reads EPSG:2277, map unit and file unit 0.3048006096 m (' + (g && g.mapUnitM) + ')');
  // a corner of Block A: in the file it is (x − ox, y − oy, z − oz) feet; on the map it must come back to the project's coordinates to < 1 mm
  const o = IM.defaultOrigin([A, B]);
  const corner = A.pts[2], map = GEO.fileToMap(g, [corner.x - o.x, corner.y - o.y, A.z0 + 36 - o.z]);
  near(map[0], corner.x * FTUS, 0.001, 'a corner of Block A is on the map at its project easting to < 1 mm (' + ((map[0] - corner.x * FTUS) * 1000).toFixed(4) + ' mm off)');
  near(map[1], corner.y * FTUS, 0.001, '… and northing'); near(map[2], (A.z0 + 36) * FTUS, 0.001, '… and the roof height');
  // volumes and sizes of the proxy meshes, in metres: footprint × height × (ftUS)³
  const vol = new Map(), ext = new Map();
  api.StreamAllMeshes(mid, (mesh) => {
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity]; let v = 0;
    for (let i = 0; i < mesh.geometries.size(); i++) {
      const pg = mesh.geometries.get(i), M = pg.flatTransformation;   // vertices are in file units; the transformation takes them to metres, Y up
      const gg = api.GetGeometry(mid, pg.geometryExpressID), vt = api.GetVertexArray(gg.GetVertexData(), gg.GetVertexDataSize()), ix = api.GetIndexArray(gg.GetIndexData(), gg.GetIndexDataSize());
      const at = (k) => [0, 1, 2].map((r) => M[r] * vt[k] + M[4 + r] * vt[k + 1] + M[8 + r] * vt[k + 2] + M[12 + r]);
      for (let k = 0; k < vt.length; k += 6) { const q = at(k); for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], q[a]); hi[a] = Math.max(hi[a], q[a]); } }
      for (let t = 0; t < ix.length; t += 3) { const a = at(ix[t] * 6), b = at(ix[t + 1] * 6), c = at(ix[t + 2] * 6); v += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6; }
    }
    vol.set(mesh.expressID, Math.abs(v)); ext.set(mesh.expressID, hi.map((h, a) => h - lo[a]).sort((x, y) => x - y));
  });
  const proxies = [...api.GetLineIDsWithType(mid, IFCLIB.IFCBUILDINGELEMENTPROXY)].map((id) => ({ id, name: api.GetLine(mid, id).Name.value }));
  const pa = proxies.find((p) => p.name === 'Block A'), pb = proxies.find((p) => p.name === 'Block B');
  near(vol.get(pa.id), 30 * 40 * 36 * FTUS ** 3, 0.01, 'Block A\'s mesh: 30 × 40 × 36 ft = ' + (30 * 40 * 36 * FTUS ** 3).toFixed(2) + ' m³ (got ' + vol.get(pa.id).toFixed(2) + ')');
  near(vol.get(pb.id), (40 * 10 + 10 * 30) * 20 * FTUS ** 3, 0.01, 'Block B (an L, concave): (40 × 10 + 10 × 30) × 20 ft = ' + ((700) * 20 * FTUS ** 3).toFixed(2) + ' m³');
  ok(ext.get(pa.id).every((v, k) => Math.abs(v - [30, 40, 36].sort((x, y) => x - y)[k] * FTUS) < 1e-3), 'Block A\'s extents are 30 × 36 × 40 ft in metres');
  // the pset
  const psets = [...api.GetLineIDsWithType(mid, IFCLIB.IFCPROPERTYSET)].map((id) => api.GetLine(mid, id, true)).filter((p) => p.Name.value === 'CadCraft_SiteMass');
  const get = (ps, key) => { const q = ps.HasProperties.map((x) => x).find((x) => x.Name.value === key); return q ? q.NominalValue.value : undefined; };
  const psA = psets.find((p) => get(p, 'MassId') === 'm1');
  ok(psets.length === 2 && get(psA, 'Use') === 'Housing' && get(psA, 'Floors') === 3 && Math.abs(get(psA, 'FloorHeight') - 12) < 1e-9 && get(psA, 'Parcel') === 'Lot 7' && get(psA, 'BaseOnSlope') === 'stepped', 'pset CadCraft_SiteMass: use, floors, floor height (in the file\'s unit), parcel, base');
  near(get(psA, 'GrossFloorArea'), 3600 * FTUS ** 2, 1e-6, 'GrossFloorArea is in square metres: 3,600 sq ft = ' + (3600 * FTUS ** 2).toFixed(3));
  const site = api.GetLine(mid, [...api.GetLineIDsWithType(mid, IFCLIB.IFCSITE)][0], true);
  near(GEO.compound(site.RefLatitude.map((x) => x)), 30.2, 1e-6, 'IfcSite RefLatitude'); near(GEO.compound(site.RefLongitude.map((x) => x)), -97.7, 1e-6, 'RefLongitude');
  api.CloseModel?.(mid);
  // a metre project with no coordinate system: no map conversion, a site latitude and longitude only
  const m1 = { ...A, pts: A.pts.map((p) => ({ x: p.x - 2080000, y: p.y - 6150000 })), z0: 100 };
  const r2 = IM.writeMassingIfc({ name: 'M', units: 'm', crs: null, lat: 19.4, lon: -99.1, masses: [m1] });
  ok(!/IFCPROJECTEDCRS|IFCMAPCONVERSION/.test(r2.text) && r2.unit === 'm', 'no coordinate system: no IfcProjectedCRS or IfcMapConversion, and a metre project is written in metres');
  const mid2 = api.OpenModel(new TextEncoder().encode(r2.text)), g2 = GEO.readGeoref(api, mid2);
  ok(g2 && g2.kind === 'site' && Math.abs(g2.lat - 19.4) < 1e-6 && g2.fileUnitM === 1, 'BimCraft reads the site latitude / longitude only, file unit 1 m');
  ok(IM.guid('x').length === 22 && IM.writeMassingIfc({ masses: [] }).counts.masses === 0, 'a guid is 22 characters; no masses is an empty site, not an error');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
