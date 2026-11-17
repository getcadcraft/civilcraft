/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lib/massing test: node lib/massing/test/test.mjs. Every expected number is worked by hand beside its check.
 */
import { massFromSolid, sectionAt, solidVolume, isClosed, optionMasses } from '../solid.js';
import { writeMassingIfc } from '../mass-ifc.js';
import { prism, prismY, box } from './shapes.mjs';

let pass = 0, fail = 0;
const ok = (c, name, got) => { if (c) pass++; else { fail++; console.log('FAIL ' + name + (got !== undefined ? ' -> ' + JSON.stringify(got) : '')); } };
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e * Math.max(1, Math.abs(b));
const guid = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ('0' + (h >>> 0).toString(36)).padStart(22, '0').slice(-22); };

// 1. a box 10 x 20 x 9 m at 3 m floors: 9 / 3 = 3 floors; footprint 10 * 20 = 200; gross 3 * 200 = 600; volume 200 * 9 = 1800
{
  const T = box(0, 0, 0, 10, 20, 9), m = massFromSolid({ tris: T, floorHeight: 3, name: 'Box' });
  ok(isClosed(T), 'box: closed');
  ok(near(solidVolume(T), 1800), 'box: signed volume +1800 (outward normals)', solidVolume(T));
  ok(m.floors === 3 && near(m.floorHeight, 3) && near(m.height, 9) && m.z0 === 0, 'box: 3 floors of 3 m', m);
  ok(near(m.footprint, 200) && near(m.gross, 600) && near(m.volume, 1800), 'box: 200 m2, 600 m2 gross, 1800 m3', [m.footprint, m.gross, m.volume]);
  ok(m.floorAreas.length === 3 && m.floorAreas.every((a) => near(a, 200)), 'box: every floor 200 m2', m.floorAreas);
  ok(m.pts.length === 4, 'box: the outline has its 4 corners only (points on a straight run removed)', m.pts);
  const xs = m.pts.map((p) => p.x).sort((a, b) => a - b), ys = m.pts.map((p) => p.y).sort((a, b) => a - b);
  ok(near(xs[0], 0) && near(xs[3], 10) && near(ys[0], 0) && near(ys[3], 20), 'box: outline corners at 0..10, 0..20', m.pts);
  let s = 0; for (let i = 0; i < 4; i++) { const a = m.pts[i], b = m.pts[(i + 1) % 4]; s += a.x * b.y - b.x * a.y; }
  ok(s > 0, 'box: outline anticlockwise');
  ok(m.closed && m.prism && !m.simplified && !m.notes.length, 'box: a prism, nothing simplified', m.notes);
  // 10 m high at 3 m floors: 10 / 3 = 3.33 -> 3 floors of 3.3333 m; 11 m -> 3.67 -> 4 floors of 2.75 m; 1 m -> at least 1 floor
  const m10 = massFromSolid({ tris: box(0, 0, 0, 10, 20, 10), floorHeight: 3 });
  ok(m10.floors === 3 && near(m10.floorHeight, 10 / 3) && near(m10.gross, 600), '10 m at 3 m floors: 3 floors of 3.333 m', m10.floors);
  const m11 = massFromSolid({ tris: box(0, 0, 0, 10, 20, 11), floorHeight: 3 });
  ok(m11.floors === 4 && near(m11.floorHeight, 2.75) && near(m11.gross, 800), '11 m at 3 m floors: 4 floors of 2.75 m, 800 m2', m11.floors);
  ok(massFromSolid({ tris: box(0, 0, 0, 10, 20, 1), floorHeight: 3 }).floors === 1, 'a 1 m slab: one floor');
  // raised 5 m off the ground: z0 = 5, same areas
  const up = massFromSolid({ tris: box(0, 0, 5, 10, 20, 14), floorHeight: 3 });
  ok(up.z0 === 5 && up.floors === 3 && near(up.gross, 600), 'a raised box keeps its base level', up.z0);
  ok(massFromSolid({ tris: [], floorHeight: 3 }) === null && massFromSolid({ tris: T, floorHeight: 0 }) === null, 'no triangles or no floor height: null');
}

// 2. an L prism: 20 x 20 with a 10 x 10 corner cut out = 400 - 100 = 300 m2; 6 m high at 3 m = 2 floors; gross 600; volume 1800
{
  const L = [[0, 0], [20, 0], [20, 10], [10, 10], [10, 20], [0, 20]], T = prism(L, 0, 6), m = massFromSolid({ tris: T, floorHeight: 3, name: 'L' });
  ok(isClosed(T) && near(solidVolume(T), 1800), 'L: closed, 1800 m3', solidVolume(T));
  ok(m.floors === 2 && near(m.footprint, 300) && near(m.gross, 600) && near(m.volume, 1800), 'L: 2 floors, 300 m2, 600 gross, 1800 m3', [m.floors, m.footprint, m.gross, m.volume]);
  ok(m.pts.length === 6 && m.prism && !m.simplified, 'L: six corners, a prism', m.pts.length);
  // section through the middle: one loop of 300
  const s = sectionAt(T, 3);
  ok(s.loops.length === 1 && near(s.area, 300) && s.open === 0, 'L: the section at 3 m is one loop of 300 m2', s.area);
}

// 3. stepped: a profile (x, z) 20 wide to 6 m, then 10 wide to 9 m, 10 deep along y.
//    floors at 0, 3 (20 x 10 = 200 each) and 6 (10 x 10 = 100): gross 500; volume (20*6 + 10*3) * 10 = 1500; footprint 200
{
  const T = prismY([[0, 0], [20, 0], [20, 6], [10, 6], [10, 9], [0, 9]], 0, 10), m = massFromSolid({ tris: T, floorHeight: 3, name: 'Stepped' });
  ok(isClosed(T) && near(solidVolume(T), 1500), 'stepped: closed, 1500 m3', solidVolume(T));
  ok(m.floors === 3 && near(m.footprint, 200), 'stepped: 3 floors on a 200 m2 footprint', [m.floors, m.footprint]);
  ok(near(m.floorAreas[0], 200) && near(m.floorAreas[1], 200) && near(m.floorAreas[2], 100), 'stepped: floors 200, 200, 100 m2', m.floorAreas);
  ok(near(m.gross, 500) && near(m.volume, 1500), 'stepped: 500 m2 gross (not 3 x 200), 1500 m3', [m.gross, m.volume]);
  ok(m.closed && !m.prism && m.simplified && m.notes.includes('floors-differ'), 'stepped: not a prism, said so', m.notes);
}

// 4. a box with its top face missing: open; sections still close (the sides are whole): areas measured, flagged open
{
  const T = box(0, 0, 0, 10, 20, 9).filter((t) => !t.every((p) => p[2] === 9));
  const m = massFromSolid({ tris: T, floorHeight: 3 });
  ok(!isClosed(T) && !m.closed && m.simplified && m.notes.includes('open'), 'an open box is flagged open and simplified', m.notes);
  ok(near(m.footprint, 200) && near(m.gross, 600), 'an open box whose sections close is still measured: 200 / 600', [m.footprint, m.gross]);
  // a side missing as well: the sections do not close -> not measured, the outline is the hull of the plan (10 x 20 = 200)
  const T2 = T.filter((t) => !t.every((p) => p[0] === 0));
  const m2 = massFromSolid({ tris: T2, floorHeight: 3 });
  ok(m2.notes.includes('unmeasured') && m2.notes.includes('hull') && m2.floorAreas.every((a) => a === null) && m2.gross === 0, 'three-sided: floors not measured (null, never a guess)', m2);
  ok(near(m2.footprint, 200), 'three-sided: the outline is the hull of the plan, 200 m2', m2.footprint);
}

// 5. two towers in one solid list (two closed boxes apart): two loops at the base, the larger is the outline
{
  const T = [...box(0, 0, 0, 10, 10, 6), ...box(20, 0, 0, 40, 10, 6)], m = massFromSolid({ tris: T, floorHeight: 3 });
  ok(m.notes.includes('loops') && near(m.footprint, 200) && near(m.floorAreas[0], 300) && near(m.gross, 600) && m.simplified, 'two towers: outline = the larger (200), floors measure both (300 each)', [m.footprint, m.floorAreas, m.notes]);
}

// 5b. a solid wound the other way (normals inward): signed volume -1800, read the same
{
  const T = box(0, 0, 0, 10, 20, 9).map((t) => [t[0], t[2], t[1]]), m = massFromSolid({ tris: T, floorHeight: 3 });
  ok(near(solidVolume(T), -1800) && m.prism && near(m.footprint, 200) && near(m.gross, 600) && near(m.volume, 1800) && m.pts.length === 4, 'inward normals: turned round, the same mass', m.notes);
}

// 6. options -> IFC text
{
  const solids = [{ name: 'Bar', tris: box(0, 0, 0, 10, 20, 9) }, { name: 'Stepped', tris: prismY([[0, 0], [20, 0], [20, 6], [10, 6], [10, 9], [0, 9]], 0, 10) }, { name: 'Low', tris: box(0, 0, 0, 30, 20, 3) }];
  const r = optionMasses(solids, { floorHeight: 3, set: 'Scheme A', source: 'ModelCraft' });
  ok(r.masses.length === 3 && r.shared.floors === 3 && r.shared.floorHeight === 3 && r.shared.z0 === 0, 'three options, one building of 3 storeys', r.shared);
  ok(r.masses.every((m) => m.option.set === 'Scheme A' && !m.option.current), 'no option is current until the person says');
  const f = writeMassingIfc({ name: 'Scheme A', units: 'm', masses: r.masses, shared: r.shared }, { guid, app: 'ModelCraft', about: 'ModelCraft massing options', now: new Date('2026-11-11T00:00:00Z') });
  const n = (re) => (f.text.match(re) || []).length;
  ok(f.unit === 'm' && f.counts.masses === 3 && f.counts.storeys === 3 && f.counts.spaces === 3 + 3 + 1, 'counts: 3 masses, 3 storeys, 7 floor spaces', f.counts);
  ok(n(/=IFCBUILDING\(/g) === 1 && n(/=IFCBUILDINGSTOREY\(/g) === 3 && n(/=IFCBUILDINGELEMENTPROXY\(/g) === 3 && n(/=IFCSPACE\(/g) === 7, 'one building, three storeys, three proxies, seven spaces in the text');
  ok(/IFCPROPERTYSINGLEVALUE\('GrossFloorArea',\$,IFCAREAMEASURE\(500\.\),\$\)/.test(f.text), 'the stepped option carries 500 m2 gross (its sections), not 600');
  ok(/'FloorAreas',\$,IFCTEXT\('200;200;100'\)/.test(f.text) && /'Volume',\$,IFCVOLUMEMEASURE\(1500\.\)/.test(f.text), 'FloorAreas 200;200;100 and Volume 1500');
  ok(n(/'Simplified',\$,IFCBOOLEAN\(\.T\.\)/g) === 1 && n(/'OptionSet',\$,IFCLABEL\('Scheme A'\)/g) === 3 && n(/'Source',\$,IFCLABEL\('ModelCraft'\)/g) === 3, 'Simplified on the stepped one only; set and source on all');
  ok(/FILE_NAME\('Scheme A-masses\.ifc'.*'ModelCraft','ModelCraft massing options'/.test(f.text), 'the header names the sender');
  ok(n(/IFCQUANTITYAREA\('GrossFloorArea',\$,\$,100\.,\$\)/g) === 1 && n(/IFCQUANTITYAREA\('GrossFloorArea',\$,\$,200\.,\$\)/g) === 5 && n(/IFCQUANTITYAREA\('GrossFloorArea',\$,\$,600\.,\$\)/g) === 1, 'floor spaces: 200 x5, 100 x1, 600 x1');
  const ids = [...f.text.matchAll(/^#(\d+)=/gm)].map((x) => +x[1]);
  ok(ids.every((v, i) => v === i + 1), 'line ids run 1..n');
  const refs = [...f.text.matchAll(/#(\d+)(?!\d|=)/g)].map((x) => +x[1]);
  ok(refs.every((v) => v >= 1 && v <= ids.length), 'every reference points at a line in the file');
  let threw = false; try { writeMassingIfc({ masses: r.masses }, {}); } catch (e) { threw = true; }
  ok(threw, 'no GlobalId maker: refused');
  // a mass with none of the extras writes no extra line (CivilCraft's files are unchanged)
  const plain = writeMassingIfc({ name: 'S', units: 'm', masses: [{ id: 'a', name: 'A', use: '', pts: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }], floors: 2, floorHeight: 3, z0: 0 }] }, { guid });
  ok(!/IFCSPACE|OptionSet|FloorAreas|Volume'|Simplified/.test(plain.text) && plain.counts.spaces === 0, 'a plain mass: no spaces, no option fields');
}

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
