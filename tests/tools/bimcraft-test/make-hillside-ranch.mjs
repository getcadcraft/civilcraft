#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-hillside-ranch.mjs: fixtures/showcase/bimcraft-hillside-ranch.ifc, made ONCE through BimCraft's own ops (as
 * make-small-house.mjs does), so it is a real BimCraft building: every wall, door, room, the roof, the foundation and the
 * terrain can be edited after it is opened.
 *
 *   node tools/bimcraft-test/make-hillside-ranch.mjs [out.ifc] [--force] [--no-framing]
 *
 * "Hillside ranch": one story, 60'-0" x 30'-0" over the outside faces = 1,800 sq ft. Stucco on 2x6 wood studs (its own wall
 * type), 2x4 partitions, a 5/12 hip roof with 24" eaves, a crawlspace foundation whose stem walls and footings step down a
 * lot that falls about 14 % from the street (north) to the back (south). 4 bedrooms, 2 baths, laundry, kitchen / dining.
 * Plan axes: x east, y north, mm; feet below are over the outside faces (0..60, 0..30).
 */
import { register } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev');
const V = (lib, file) => pathToFileURL(path.join(ROOT, 'public_html/assets/vendor', lib, 'current', file)).href;
register('data:text/javascript,' + encodeURIComponent(`export async function resolve(spec, ctx, next) {
  const map = { 'manifold-3d': ${JSON.stringify(V('manifold-3d', 'manifold.js'))}, proj4: ${JSON.stringify(V('proj4', 'proj4.esm.min.js'))}, delaunator: ${JSON.stringify(V('delaunator', 'index.js'))}, 'robust-predicates': ${JSON.stringify(V('robust-predicates', 'index.js'))} };
  if (map[spec]) return { url: map[spec], shortCircuit: true };
  return next(spec, ctx);
}`), import.meta.url);

const args = process.argv.slice(2);
const OUT = path.resolve(args.find((a) => !a.startsWith('--')) || path.join(ROOT, 'fixtures/showcase/bimcraft-hillside-ranch.ifc'));
if (fs.existsSync(OUT) && !args.includes('--force')) { console.log('kept ' + OUT + ' (exists; --force makes it again)'); process.exit(0); }

const imp = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await imp('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const WebIFC = await imp('ifc/api.js');
const { IfcModel } = await imp('ifc-model.js');
const N = await imp('new-model.js'), OPS = await imp('model-ops.js'), SP = await imp('spaces-ops.js'), TR = await imp('res-terrain.js');
const FD = await imp('res-foundation.js'), FR = await imp('res-framing.js'), SH = await imp('res-sheets.js'), PAINT = await imp('paint-bim.js');
const MF = await imp('model-floors.js');
const MEP = await imp('mep-model.js'), FAM = await imp('family-ops.js');
const { ModelWriter } = await imp('model-write.js');
const EQ = await imp('mep/equipment.js');
const { IfcEditor } = await imp('ifc-edit.js');
const quiet = (fn) => async (...a) => { const l = console.log, w = console.warn, e = console.error; console.log = console.warn = console.error = () => {}; try { return await fn(...a); } finally { console.log = l; console.warn = w; console.error = e; } };

const IN = 25.4, FT = 304.8;
const W = 60 * FT, D = 30 * FT, HEIGHT = 9 * FT;
export const RANCH = { name: 'Hillside ranch', w: W, d: D, height: HEIGHT, pitch: Math.atan(5 / 12) * 180 / Math.PI, overhang: 24 * IN, fall: 0.14 };

// ---------------------------------------------------------------------------------------------------------- the file
const text = N.newBuilding({ name: RANCH.name, siteName: 'Sloped lot', levels: N.stackLevels(1, HEIGHT, () => 'Main floor'), fileName: path.basename(OUT), now: new Date('2026-11-20T12:00:00Z') });
const eng = await quiet(IfcModel.create)(WebIFC, null);
await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
const ed = new IfcEditor(WebIFC, eng);
const snap = () => OPS.snapshotModel(ed);
const L1 = snap().levels[0];
const step = (label, op) => { try { return ed.modelChange(op); } catch (e) { throw new Error(label + ': ' + (e.key || e.message)); } };

// ---------------------------------------------------------------------------------------------------------- the place
// Sanger, California (Fresno County; about 36.708 N, 119.556 W, 113 m above sea level). The back of the house (plan -y, the
// downhill side) faces due WEST, so true north is plan -x and the street side (plan +y) faces east. Comments below that say
// north, south, east, west mean the PLAN's directions.
export const PLACE = { name: 'Sanger, California', lat: 36.708, lon: -119.556, elevationM: 113, trueNorth: [-1, 0] };
{
  const U = await imp('ifc-util.js');
  const angle = (deg) => { const sg = deg < 0 ? -1 : 1; let a = Math.abs(deg); const d = Math.floor(a); a = (a - d) * 60; const m = Math.floor(a); a = (a - m) * 60; const sec = Math.floor(a); return [sg * d, sg * m, sg * sec, sg * Math.round((a - sec) * 1e6)]; };
  step('place', (e) => { const w = new ModelWriter(e.W, e.api, e.mid); return w.run(() => {
    const site = U.ids(w.api, w.mid, 'IFCSITE')[0], st = w.touch(site);
    st.RefLatitude = angle(PLACE.lat); st.RefLongitude = angle(PLACE.lon); st.RefElevation = w.u(PLACE.elevationM * 1000); st.LongName = w.L(PLACE.name);
    w.write(st);
    const c = w.touch(w.contexts().model); c.TrueNorth = w.H(w.dir(PLACE.trueNorth[0], PLACE.trueNorth[1])); w.write(c);
    return { id: site, ids: [site] }; }); });
}

// ---------------------------------------------------------------------------------------------------------- wall type
const STUCCO = 'wall-stucco-2x6';
step('wall type', OPS.saveWallAssembly({ version: 1, key: STUCCO, name: 'Stucco on 2x6 wood studs', exterior: true, layers: [
  { mat: 'render', t: 0.875 * IN, function: 'finish' },            // three-coat stucco, 7/8"
  { mat: 'membrane', t: 0, function: 'membrane' },                 // two layers of building paper + lath
  { mat: 'osb', t: 0.5 * IN, function: 'substrate' },
  { mat: 'studs', t: 5.5 * IN, function: 'structure', core: true },   // 2x6 at 16" o.c., batt insulation between
  { mat: 'gypsum', t: 0.5 * IN, function: 'finish' },
] }));
const T = (0.875 + 0.5 + 5.5 + 0.5) * IN, e = T / 2;
const INT = 'int-2x4';

// ---------------------------------------------------------------------------------------------------------- walls
/** Feet over the outside faces → mm on the wall centre lines (an outside wall's centre line is half its thickness in). */
const X = (ft) => (ft <= 0 ? e : ft >= 60 ? W - e : ft * FT), Y = (ft) => (ft <= 0 ? e : ft >= 30 ? D - e : ft * FT);
const P = (x, y) => [X(x), Y(y)];
const ring = (pts) => pts.map((p, i) => ({ a: p, b: pts[(i + 1) % pts.length] }));
step('outside walls', OPS.drawWalls({ storey: L1.guid, segs: ring([P(0, 0), P(60, 0), P(60, 30), P(0, 30)]), typeKey: STUCCO, extSide: 'right' }));
const HALL0 = 13.5, HALL1 = 17;
const partitions = [
  [[16, 17], [16, 30]],            // kitchen | entry
  [[22, 17], [22, 30]],            // entry | laundry
  [[22, 0], [22, HALL0]],          // living | bedroom 3
  [[22, HALL1], [46, HALL1]],      // hall, north side
  [[22, HALL0], [46, HALL0]],      // hall, south side
  [[46, 0], [46, 30]],             // the primary suite
  [[28, 17], [28, 30]],            // laundry | bath 2
  [[33.5, 17], [33.5, 30]],        // bath 2 | bedroom 2
  [[44, 21], [44, 30]], [[44, 21], [46, 21]],   // bedroom 2's closet
  [[33, 0], [33, HALL0]], [[35, 0], [35, HALL0]], [[33, 6.75], [35, 6.75]],   // the closets between bedrooms 3 and 4
  [[46, 17], [60, 17]],            // primary bedroom | bath and closet
  [[54, 17], [54, 30]],            // primary bath | walk-in closet
];
step('partitions', OPS.drawWalls({ storey: L1.guid, segs: partitions.map(([a, b]) => ({ a: P(...a), b: P(...b) })), typeKey: INT }));
// open plan: the kitchen is open to the living room, the hall to the living room (room separators, no wall)
step('separators', SP.drawBounds({ storey: L1.guid, kind: 'room', lines: [{ a: P(0, 17), b: P(16, 17) }, { a: P(22, HALL0), b: P(22, HALL1) }] }));

// ---------------------------------------------------------------------------------------------------------- doors, windows
const wallAt = (p) => snap().walls.find((w) => { const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]), t = ((p[0] - w.a[0]) * (w.b[0] - w.a[0]) + (p[1] - w.a[1]) * (w.b[1] - w.a[1])) / (L * L); const q = [w.a[0] + (w.b[0] - w.a[0]) * t, w.a[1] + (w.b[1] - w.a[1]) * t]; return t > 0 && t < 1 && Math.hypot(q[0] - p[0], q[1] - p[1]) < 1; });
const openings = [
  // doors: [x ft, y ft, type, { width, … }]
  [19, 30, 'door-entry-sidelites'],                          // front door (street side, at grade)
  [25, 30, 'door-single'],                                   // laundry / mud room door
  [25, 17, 'door-single', { width: 32 * IN }],               // laundry
  [30.75, 17, 'door-single', { width: 30 * IN }],            // bath 2
  [36.5, 17, 'door-single', { width: 32 * IN }],             // bedroom 2
  [44, 25.5, 'door-bifold', { width: 60 * IN }],             // bedroom 2 closet
  [25, HALL0, 'door-single', { width: 32 * IN }],            // bedroom 3
  [43, HALL0, 'door-single', { width: 32 * IN }],            // bedroom 4
  [33, 3.4, 'door-bifold', { width: 48 * IN }],              // bedroom 3 closet
  [35, 10.1, 'door-bifold', { width: 48 * IN }],             // bedroom 4 closet
  [46, 15.25, 'door-single', { width: 32 * IN }],            // primary bedroom
  [50, 17, 'door-single', { width: 30 * IN }],               // primary bath
  [57, 17, 'door-single', { width: 30 * IN }],               // walk-in closet
  // windows
  [6, 0, 'win-picture'], [15, 0, 'win-picture'],             // living room, to the view down the slope
  [27.5, 0, 'win-double-hung'], [40.5, 0, 'win-double-hung'],   // bedrooms 3 and 4
  [53, 0, 'win-slider'],                                     // primary bedroom
  [0, 8.5, 'win-double-hung'], [0, 24, 'win-double-hung'],   // living room, dining
  [8, 30, 'win-slider', { height: 36 * IN, sill: 44 * IN }],  // over the kitchen sink
  [30.75, 30, 'win-awning'],                                 // bath 2
  [39, 30, 'win-double-hung'],                               // bedroom 2
  [50, 30, 'win-awning'],                                    // primary bath
  [60, 8.5, 'win-double-hung'],                              // primary bedroom
];
for (const [x, y, typeKey, more = {}] of openings) {
  const p = P(x, y), w = wallAt(p);
  if (!w) throw new Error('no wall at ' + x + ', ' + y + ' ft');
  step(typeKey + ' at ' + x + ', ' + y, OPS.placeOpening({ wall: w.guid, typeKey, offset: Math.hypot(p[0] - w.a[0], p[1] - w.a[1]), face: 'right', ...more }));
}

// ---------------------------------------------------------------------------------------------------------- rooms
const rooms = [
  ['Living room', [8, 8]], ['Kitchen / dining', [8, 24]], ['Hall', [34, 15.25]], ['Laundry', [25, 24]], ['Bath 2', [30.75, 24]],
  ['Bedroom 2', [39, 24]], ['Closet 2', [45, 26]], ['Bedroom 3', [27.5, 7]], ['Closet 3', [34, 3.4]], ['Closet 4', [34, 10.1]], ['Bedroom 4', [40.5, 7]],
  ['Primary bedroom', [53, 8.5]], ['Primary bath', [50, 24]], ['Walk-in closet', [57, 24]],
];
const areas = {};
for (const [name, at] of rooms) {
  const seed = [at[0] * FT, at[1] * FT];
  step('floor ' + name, OPS.placeFloor({ storey: L1.guid, seed, mode: 'room' }));
  step('ceiling ' + name, OPS.placeCeiling({ storey: L1.guid, seed, mode: 'room' }));
  const inPoly = (x, y, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { if ((p[i][1] > y) !== (p[j][1] > y) && x < ((p[j][0] - p[i][0]) * (y - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; } return c; };
  const loop = OPS.loopsOf(ed, L1.id).rooms.filter((r) => inPoly(seed[0], seed[1], r.poly)).sort((p, q) => Math.abs(p.area) - Math.abs(q.area))[0];
  const sp = loop && snap().derived.spaces.find((q) => q.seed && inPoly(q.seed[0], q.seed[1], loop.poly));
  if (!sp) throw new Error('no room at ' + at.join(', ') + ' ft (' + name + ')');
  areas[name] = Math.abs(loop.area);
  step('name ' + name, OPS.changeDerived(sp.guid, { name }));
}

// ---------------------------------------------------------------------------------------------------------- roof
step('roof', OPS.placeRoof({ storey: L1.guid, seed: [8 * FT, 8 * FT], pitch: RANCH.pitch, overhang: RANCH.overhang, edges: '' }));

// ---------------------------------------------------------------------------------------------------------- the slope
/** The ground (mm from the main floor) at a plan point: 16" under the floor along the street side of the house, rising gently
 *  to the street, falling 14 % under the house and a little steeper below it; a slight fall to the east; soft rolls. */
export function ground(x, y) {
  const zN = -16 * IN;
  let z = y >= D ? zN + 0.035 * (y - D) : y >= 0 ? zN - RANCH.fall * (D - y) : zN - RANCH.fall * D - 0.17 * (-y);
  z -= 0.012 * (x - W / 2);
  z += 45 * Math.sin(x / 5200 + 0.6) * Math.cos(y / 6100 - 0.3);
  return Math.round(z);
}
const pts = [];
for (let x = -9000; x <= W + 9000; x += 1500) for (let y = -10500; y <= D + 9000; y += 1500) pts.push({ x, y, z: ground(x, y) });
await TR.loadTin();
step('terrain', TR.placeTerrain({ points: pts, source: 'points', interval: FT, unit: 'mm' }));
step('foundation', FD.placeFoundation({ level: L1.guid, seed: [8 * FT, 8 * FT], kind: 'crawl', bottom: 24 * IN }));
step('driveway', TR.placeHardscape({ level: L1.guid, kind: 'driveway', points: [[2 * FT, D + 900], [14 * FT, D + 900], [14 * FT, D + 8800], [2 * FT, D + 8800]] }));
step('walk', TR.placeHardscape({ level: L1.guid, kind: 'walk', points: [[14 * FT, D + 2100], [17.25 * FT, D + 2100], [17.25 * FT, D + 1750], [20.75 * FT, D + 1750], [20.75 * FT, D + 3200], [14 * FT, D + 3200]] }));
// concrete landings and one step down to the ground at the two doors on the street side (the floor is 16" above the ground there)
const box = (x0, x1, y0, y1) => [[x0 * FT, D + y0], [x1 * FT, D + y0], [x1 * FT, D + y1], [x0 * FT, D + y1]];
for (const [x0, x1, deep] of [[15.5, 22.5, 1400], [23, 27, 1100]]) {
  step('landing', MF.placeDrawnFloor({ storey: L1.guid, kind: 'concrete', use: 'landing', points: box(x0, x1, 0, deep), offset: -25, thickness: 450 }));
  step('step', MF.placeDrawnFloor({ storey: L1.guid, kind: 'concrete', use: 'landing', points: box(x0, x1, deep, deep + 300), offset: -215, thickness: 300 }));
}

// ---------------------------------------------------------------------------------------------------------- plumbing
/**
 * Fixtures, and the drain, waste and vent piping to the public sewer. The sewer main runs east-west (parallel with the long side
 * of the house) 30'-0" south of the project origin, on the downhill side, its centre 4'-0" below the ground there. Under the
 * house two 3" collectors fall at 1/4" per foot along y = 26'-6" and 27'-3" to a 4" building drain at x = 31', which runs south under the
 * floor, drops inside the crawlspace, leaves through the south stem wall 12" below the ground and falls to the main.
 * Then the water heater, hot and cold water, gas and the flue (below). A drafting layout: drain sizes are checked by BimCraft's
 * drain sizing (IPC tables; California uses the CPC), nothing else is engineered or checked against a code.
 */
let plumbing = null;
const pipeClashes = [];
if (!args.includes('--no-plumbing')) {
  const SLOPE = 0.25 / 12, half = 2.25 * IN, PVC = { kind: 'pipe', mat: 'pvc', cls: '40' };
  const nIn = D - T, back = (ft) => ft * FT;   // the north wall's inside face; a partition's centre line
  // [family, x, y, rot, values]: x, y = the middle of the fixture's front edge; its back (+y of the family) is turned to the wall
  const fixtures = [
    ['fam-kitchensink', 8 * FT, nIn - 600, 0],                                   // kitchen, under the window
    ['fam-laundrytub', back(22) + half + 550, 21 * FT, 90],                      // laundry, west wall
    ['fam-bathtub', 30.75 * FT, nIn - 750, 0, { Width: 1500 }],                  // bath 2, north wall
    ['fam-wc', back(33.5) - half - 680, 24.5 * FT, -90],                         // bath 2, east wall
    ['fam-lavatory', back(33.5) - half - 450, 20.5 * FT, -90],
    ['fam-shower', back(46) + half + 500, nIn - 900, 0],                         // primary bath, north-west corner
    ['fam-wc', 52.25 * FT, nIn - 680, 0],                                        // primary bath, north wall
    ['fam-lavatory', back(46) + half + 450, 19.5 * FT, 90], ['fam-lavatory', back(46) + half + 450, 22.5 * FT, 90],
  ];
  step('fixtures', FAM.placeFamilies(fixtures.map(([family, x, y, rot, values = {}]) => ({ storey: L1.guid, family, x, y, rot, values }))));
  const ports = MEP.readFixturePorts(new ModelWriter(ed.W, ed.api, ed.mid)).filter((q) => q.system === 'san' && q.flow === 'out');
  if (ports.length !== fixtures.length) throw new Error('plumbing: ' + ports.length + ' drain connectors for ' + fixtures.length + ' fixtures');
  const run = (label, system, size, points, slope, role = 'branch') => step(label, MEP.placeRun({ storey: L1.guid, ...PVC, system, size, points, slope, role }));

  // the public sewer: 8", falling east at 1 %, its centre 4'-0" below the ground where the house connects
  const XD = 31 * FT, YS = -30 * FT, MAIN_SLOPE = 0.01;
  const zMainAt = (x) => ground(XD, YS) - 4 * FT - MAIN_SLOPE * (x - XD);
  const MX0 = -20 * FT, MX1 = 80 * FT;
  run('sewer main', 'san', '8', [[MX0, YS, zMainAt(MX0)], [MX1, YS, zMainAt(MX0)]], MAIN_SLOPE, 'main');
  // the building sewer: from 18" inside the south wall, 12" under the ground at the wall, straight to the main
  const YDROP = 1.5 * FT, zOut = ground(XD, 0) - 12 * IN, sewerSlope = (zOut - zMainAt(XD)) / (YDROP - YS);
  // the building drain under the floor: 4", 1/4" per foot, from north of the collectors to the drop
  const Y0 = 28 * FT, Z0 = -29 * IN, zDrain = (y) => Z0 - SLOPE * (Y0 - y);
  run('building sewer', 'san', '4', [[XD, YDROP, zDrain(YDROP)], [XD, YDROP, zOut], [XD, YS, zOut]], sewerSlope, 'main');
  run('building drain', 'san', '4', [[XD, Y0, Z0], [XD, YDROP, Z0]], SLOPE, 'main');
  // two collectors, each falling to the building drain: the west one along y = 26'-6", the east one along y = 27'-3"
  // (staggered, so the two do not meet head on at one point of the drain)
  const XW = 6.5 * FT, XE = 54 * FT, ycOf = (x) => (x < XD ? 26.5 : 27.25) * FT;
  const zColl = (x) => zDrain(ycOf(x)) + SLOPE * Math.abs(x - XD);
  run('west collector', 'san', '3', [[XW, ycOf(XW), zColl(XW)], [XD, ycOf(XW), zColl(XW)]], SLOPE);
  run('east collector', 'san', '3', [[XE, ycOf(XE), zColl(XE)], [XD, ycOf(XE), zColl(XE)]], SLOPE);
  // each fixture: down from its connector, then under the floor to the collector at 1/4" per foot; a fixture whose drain
  // would lie on another's (two lavatories on one wall) first steps 14" sideways
  const SIZE = { wc: '3', sink: '2', laundry: '2', bath: '2', shower: '2', lav: '1-1/2' }, usedX = [];
  for (const q of ports) {
    const [x, y, z] = q.p, yc = ycOf(x);
    let bx = x; while (usedX.some((u) => Math.abs(u - bx) < 200)) bx += 14 * IN;
    usedX.push(bx);
    const len = Math.abs(bx - x) + Math.abs(y - yc), zb = zColl(bx) + SLOPE * len;
    const pts = len < 60 ? [[x, yc, z], [x, yc, zColl(x)]] : [[x, y, z], [x, y, zb], ...(bx !== x ? [[bx, y, zb]] : []), [bx, yc, zb]];
    run('drain of ' + q.fixture, 'san', SIZE[q.fixture] || '2', pts, len < 60 ? 0 : SLOPE);
  }
  // vent stacks through the roof, in the partitions over the collectors (kitchen, laundry / bath 2, primary bath)
  for (const x of [16 * FT, 28 * FT, 54 * FT]) run('vent', 'vent', '2', [[x, ycOf(x), zColl(x)], [x, ycOf(x), 12.5 * FT]], 0);

  // ---- the water heater, hot and cold water, gas ----
  // A Navien NPE-240A2 condensing gas tankless heater (drawn as BimCraft's generic water heater: its own shape and connection
  // places are not Navien's), wall-hung on the laundry's east partition. Cold water comes in from the street side 12" under
  // the ground; a 3/4" cold trunk and a 3/4" hot trunk run under the floor joists along the wet rooms, 1/2" branches rise to
  // each fixture (hot ends as a stub beside the cold connector: the starter fixtures have one water connector). Gas comes in
  // beside the laundry door. Copper type L water, steel gas; sizes are usual practice, not a pipe sizing.
  const HX = back(28) - half - 250, HY = 22.6 * FT, HZ = 1100;
  step('water heater', EQ.placeEquipment({ storey: L1.guid, kind: 'heater', name: 'Navien NPE-240A2 tankless water heater', tag: 'WH-1', x: HX, y: HY, z: HZ, rot: -90, values: { diameter: 440, height: 700, size: '3/4', fuel: 'gas' } }));
  const wq = () => new ModelWriter(ed.W, ed.api, ed.mid);
  const heater = EQ.readEquipment(wq()).find((q) => q.kind === 'heater'), hp = Object.fromEntries(EQ.portsAt(heater).map((q) => [q.name, q.at]));
  step('water heater data', (e) => { const w = new ModelWriter(e.W, e.api, e.mid); return w.run(() => {
    w.upsertPset(heater.id, 'Pset_ManufacturerTypeInformation', [['Manufacturer', 'IFCLABEL', 'Navien'], ['ModelLabel', 'IFCLABEL', 'NPE-240A2'], ['ModelReference', 'IFCLABEL', 'NPE-A2 series']]);
    w.upsertPset(heater.id, 'CadCraft_WaterHeater', [['Type', 'IFCLABEL', 'Gas condensing tankless, power direct vent'], ['MaxInputBtuPerHour', 'IFCREAL', 199900], ['UniformEnergyFactor', 'IFCREAL', 0.95], ['MaxFlowGpm', 'IFCREAL', 11.2],
      ['Source', 'IFCTEXT', 'Navien NPE-2 specification sheet figures as found 2026-11-20; check the current sheet. The shape and the connection places are generic, not the product\'s.']]);
    return { id: heater.id, ids: [heater.id] }; }); });
  const CU = { kind: 'pipe', mat: 'copper', cls: 'L' }, ZC = -360, ZH = -460, YCW = 8000, YHW = 7850, UP = 2050;
  const water = (label, system, size, points) => step(label, MEP.placeRun({ storey: L1.guid, ...CU, system, size, points, slope: 0 }));
  // the fixtures' cold connectors; each riser stands 6" along the wall from the connector (cold one side, hot the other)
  const cw = MEP.readFixturePorts(wq()).filter((q) => q.system === 'cw' && q.flow === 'in' && q.fixture);
  const HOT = new Set(['sink', 'laundry', 'bath', 'shower', 'lav']);
  const branches = [];   // { system, x, y (the riser), port: [x, y, z] | null (hot: a stub at the connector's height), z }
  const xs = { cw: [hp['cold-in'][0], HX - 600], hw: [hp['hot-out'][0]] };
  // fixtures on an east or west wall first (their risers' x is the wall's); then the north wall's, each riser stepped along
  // the wall until it is 10" clear of every other tee on its trunk
  const along = (q) => (Math.abs(q.dir[1]) > 0.5 ? [1, 0] : [0, 1]);
  const drainX = ports.map((q) => q.p[0]);   // a branch under the floor keeps off the line of a fixture's drain
  for (const q of [...cw.filter((q) => along(q)[1]), ...cw.filter((q) => along(q)[0])]) {
    const t = along(q), [x, y, z] = q.p, room = -Math.sign(q.dir[0]);
    const place = (sys, sign) => {
      if (t[1]) { const bx = x + room * (sys === 'cw' ? 120 : 240); if (!xs[sys].includes(bx)) xs[sys].push(bx); return [bx, y + sign * 150]; }   // off the wall, into the room
      let d = 150; while (xs[sys].some((u) => Math.abs(u - (x + sign * d)) < 250) || drainX.some((u) => Math.abs(u - (x + sign * d)) < 130)) d += 50;
      xs[sys].push(x + sign * d); return [x + sign * d, y];
    };
    const c2 = place('cw', 1);
    branches.push({ system: 'cw', x: c2[0], y: c2[1], port: [x, y, z], z });
    if (HOT.has(q.fixture)) { const h2 = place('hw', -1); branches.push({ system: 'hw', x: h2[0], y: h2[1], port: null, z }); }
  }
  for (const sys of ['cw', 'hw']) {
    const zT = sys === 'cw' ? ZC : ZH, yT = sys === 'cw' ? YCW : YHW, list = branches.filter((b) => b.system === sys);
    // risers on one line share one branch: the farthest takes the branch from the trunk, the others rise from it
    const lines = new Map();
    for (const b of list) { const k = Math.round(b.x / 20) + (b.y > yT ? 'n' : 's'); if (!lines.has(k)) lines.set(k, []); lines.get(k).push(b); }
    for (const g of lines.values()) {
      g.sort((a, b) => Math.abs(b.y - yT) - Math.abs(a.y - yT));
      const x = g[0].x;
      g.forEach((b, i) => {
        const top = b.port ? [[x, b.y, b.z], b.port] : [[x, b.y, b.z]];
        water((sys === 'cw' ? 'cold' : 'hot') + ' to fixture', sys, '1/2', i === 0 ? [[x, yT, zT], [x, b.y, zT], ...top] : [[x, b.y, zT], ...top]);
      });
    }
  }
  water('cold trunk', 'cw', '3/4', [[Math.min(...xs.cw) - 200, YCW, ZC], [Math.max(...xs.cw) + 200, YCW, ZC]]);
  water('hot trunk', 'hw', '3/4', [[Math.min(...xs.hw) - 200, YHW, ZH], [Math.max(...xs.hw) + 200, YHW, ZH]]);
  // the service from the street side, through the stem wall 12" under the ground, up to the cold trunk
  const SX = HX - 600, zSvc = ground(SX, D) - 12 * IN;
  water('water service', 'cw', '1', [[SX, D + 3000, zSvc], [SX, D - 450, zSvc], [SX, D - 450, ZC], [SX, YCW, ZC]]);
  // to and from the heater: up beside it, over, down into its connections (the generic heater's are on top)
  const c = hp['cold-in'], h = hp['hot-out'], away = (q) => (q[1] >= HY ? 250 : -250);
  water('cold to the heater', 'cw', '3/4', [[c[0], YCW, ZC], [c[0], c[1] + away(c), ZC], [c[0], c[1] + away(c), UP], [c[0], c[1], UP], c]);
  water('hot from the heater', 'hw', '3/4', [h, [h[0], h[1], UP], [h[0], h[1] + away(h), UP], [h[0], h[1] + away(h), ZH], [h[0], YHW, ZH]]);
  // gas: a riser outside beside the laundry door, under the floor, up in front of the heater
  const gp = hp.gas, GX = gp[0] - 250, ZG = -560;
  step('gas', MEP.placeRun({ storey: L1.guid, kind: 'pipe', system: 'gas', mat: 'steel', cls: '40', size: '3/4', slope: 0,
    points: [[back(27.4), D + 250, 500], [back(27.4), D + 250, ZG], [back(27.4), 27.9 * FT, ZG], [GX, 27.9 * FT, ZG], [GX, gp[1], ZG], [GX, gp[1], gp[2]], gp] }));
  // the heater's exhaust through the roof (the product is direct vent: its intake pipe is not drawn)
  const fl = hp.flue;
  step('flue', MEP.placeRun({ storey: L1.guid, kind: 'duct', system: 'exhaust', shape: 'round', w: 100, h: 100, flow: 0, points: [fl, [fl[0], fl[1], 14.5 * FT]] }));
  // pipes of different services closer than touching (a pipe that starts or ends on the other is a connection, not a clash)
  {
    const R = MEP.readRuns(wq()).map((r) => ({ r, v: MEP.runVertices(r), rad: (MEP.sectionOf(r)?.od || MEP.sectionOf(r)?.w || 50) / 2 }));
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const segDist = (p1, q1, p2, q2) => {   // the closest distance between two segments
      const d1 = sub(q1, p1), d2 = sub(q2, p2), r = sub(p1, p2), a = dot(d1, d1), e = dot(d2, d2), f = dot(d2, r);
      let s2, t2;
      if (a < 1e-9 && e < 1e-9) return Math.hypot(...r);
      if (a < 1e-9) { s2 = 0; t2 = Math.max(0, Math.min(1, f / e)); }
      else { const c2 = dot(d1, r); if (e < 1e-9) { t2 = 0; s2 = Math.max(0, Math.min(1, -c2 / a)); } else { const b = dot(d1, d2), den = a * e - b * b; s2 = den > 1e-9 ? Math.max(0, Math.min(1, (b * f - c2 * e) / den)) : 0; t2 = (b * s2 + f) / e; if (t2 < 0) { t2 = 0; s2 = Math.max(0, Math.min(1, -c2 / a)); } else if (t2 > 1) { t2 = 1; s2 = Math.max(0, Math.min(1, (b - c2) / a)); } } }
      return Math.hypot(...sub([p1[0] + d1[0] * s2, p1[1] + d1[1] * s2, p1[2] + d1[2] * s2], [p2[0] + d2[0] * t2, p2[1] + d2[1] * t2, p2[2] + d2[2] * t2]));
    };
    const toRun = (p, B) => { let m = Infinity; for (let j = 1; j < B.v.length; j++) m = Math.min(m, segDist(p, p, B.v[j - 1], B.v[j])); return m; };
    for (let i = 0; i < R.length; i++) for (let k = i + 1; k < R.length; k++) {
      const A = R[i], B = R[k];
      if (A.r.system === B.r.system) continue;
      if ([A.v[0], A.v[A.v.length - 1]].some((p) => toRun(p, B) < 5) || [B.v[0], B.v[B.v.length - 1]].some((p) => toRun(p, A) < 5)) continue;
      let m = Infinity;
      for (let x = 1; x < A.v.length; x++) for (let y = 1; y < B.v.length; y++) m = Math.min(m, segDist(A.v[x - 1], A.v[x], B.v[x === 0 ? 0 : y - 1], B.v[y]));
      if (m < A.rad + B.rad) pipeClashes.push(A.r.system + ' ' + A.r.size + ' x ' + B.r.system + ' ' + B.r.size + ' at ' + Math.round(m) + ' mm, runs from ' + A.v[0].map(Math.round) + ' and ' + B.v[0].map(Math.round));
    }
  }
  step('drain sizes', MEP.sizeDrains());
  const w = new ModelWriter(ed.W, ed.api, ed.mid), plan = [...MEP.drainPlan(w).values()], runs = MEP.readRuns(w);
  plumbing = { pipeClashes, heaterPorts: hp, fixtures: ports.map((q) => q.fixture), runs: runs.length, sizes: runs.map((r) => r.system + ' ' + r.size + (r.role === 'main' ? ' main' : '')),
    dfuAtSewerMain: Math.max(...plan.map((q) => q.units)), unconnected: plan.filter((q) => q.units === 0).length, tooBig: plan.filter((q) => q.toobig).length, stillToGrow: plan.filter((q) => q.grow).length,
    mainCentreAtConnection: Math.round(zMainAt(XD)), groundThere: ground(XD, YS), sewerSlopePct: Math.round(sewerSlope * 1000) / 10, exitBelowGround: Math.round(ground(XD, 0) - zOut) };
}

// ---------------------------------------------------------------------------------------------------------- sections
step('section A', SH.placeSectionLine({ level: L1.guid, a: [11 * FT, -3000], b: [11 * FT, D + 3000], name: 'A' }));   // down the slope, through the living room and kitchen
step('section B', SH.placeSectionLine({ level: L1.guid, a: [-3000, 8 * FT], b: [W + 3000, 8 * FT], name: 'B' }));     // along the house

// ---------------------------------------------------------------------------------------------------------- wood framing
let framing = null;
if (!args.includes('--no-framing')) {
  const s = snap();
  const hosts = [...s.walls.map((w) => w.guid), ...s.derived.roofs.map((r) => r.guid)];
  const r = step('framing', FR.frameHosts({ hosts }));
  framing = { hosts: hosts.length, assemblies: r?.ids?.length ?? null };
}

// ---------------------------------------------------------------------------------------------------------- finishes
{
  const s = snap();
  const ext = s.walls.filter((w) => w.typeKey === STUCCO);
  step('stucco', PAINT.paintOp({ ids: ext.map((w) => w.id), mat: 'stucco-sand' }));
  const roofIds = s.derived.roofs.flatMap((r) => (r.parts && r.parts.length ? r.parts : [r.id]));
  step('roof tiles', PAINT.paintOp({ ids: roofIds, mat: 'tile-roof' }));
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, ed.save());
const s = snap();
const sqft = (mm2) => Math.round(mm2 / (FT * FT) * 10) / 10;
console.log(JSON.stringify({ out: OUT, bytes: fs.statSync(OUT).size, grossSqFt: sqft(W * D), walls: s.walls.length, doors: s.openings.filter((o) => o.kind === 'door').length, windows: s.openings.filter((o) => o.kind === 'window').length,
  rooms: s.derived.spaces.map((q) => [q.number, q.name, sqft(areas[q.name] || 0)]), floors: s.derived.floors.length, ceilings: s.derived.ceilings.length, roofs: s.derived.roofs.length, framing, plumbing,
  groundAtStreetSide: ground(W / 2, D), groundAtBack: ground(W / 2, 0) }, null, 1));
process.exit(0);
