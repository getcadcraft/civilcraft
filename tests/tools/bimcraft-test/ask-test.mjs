/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --ask` (0.8 AC.8 ★, session bim_PART_2): "talk to the building" — the three questions answered by tools,
 * through host.js's dispatcher on the showcase house (fixtures/showcase/bimcraft-house.ifc: 5 IfcSpaces with floor areas, 13 walls).
 * The test gives the house's walls fire ratings written the ways files write them, then asks the questions the way an assistant would.
 */
import path from 'node:path';
import fs from 'node:fs';

export async function askMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  const P = await import(path.join(APP, 'ifc-props.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const V = await import(path.join(APP, 'ifc-vis.js'));
  const K = await import(path.join(APP, 'ask-tools.js'));
  const { createDispatcher } = await import(path.join(APP, 'host.js'));
  let bad = 0, good = 0;
  const ok = (cond, label) => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };

  console.log('== parseFireRating');
  const pf = (s) => K.parseFireRating(s)?.minutes ?? null;
  ok(pf('2HR') === 120 && pf('2 hr') === 120 && pf('2 hours') === 120 && pf('1-hour') === 60 && pf('1.5 h') === 90, 'hour forms: 2HR, 2 hr, 2 hours, 1-hour, 1.5 h');
  ok(pf('120 min') === 120 && pf('90 minutes') === 90, 'minute forms');
  ok(pf('REI 120') === 120 && pf('EI60') === 60 && pf('R 90') === 90, 'European classes are minutes: REI 120, EI60, R 90');
  ok(pf('2') === 120 && pf('120') === 120 && K.parseFireRating('2').assumed === true, 'a bare 2 is hours, a bare 120 is minutes, both marked assumed');
  ok(pf('') === null && pf(null) === null && pf('none') === null && pf('Class A') === null, 'empty, none and prose are not ratings');

  const bytes = new Uint8Array(fs.readFileSync(path.join(ROOT, 'fixtures/showcase/bimcraft-house.ifc')));
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  const model = await quiet((b) => engine.load(b))(bytes);
  const ed = new IfcEditor(WebIFC, engine);
  let ix = P.propertyIndex(WebIFC, ed.api, ed.mid, model);
  const walls = ix.keys.filter((k) => ix.value('cls', k - ix.keyBase) === 'IfcWall');
  ok(walls.length >= 6, walls.length + ' walls in the house');
  const guid = (k) => ix.value('guid', k - ix.keyBase);
  const w = new ModelWriter(ed.W, ed.api, ed.mid);
  const set = (k, v) => { const id = w.byGuid(guid(k)); w.run(() => w.upsertPset(id, 'Pset_WallCommon', [['FireRating', 'IFCLABEL', v]])); };
  const writes = ['2HR', '120', 'REI 120', '1 hr', '60 min', 'EI 30'];
  walls.slice(0, writes.length).forEach((k, i) => set(k, writes[i]));
  const bytes2 = ed.save();
  const e2 = await quiet(IfcModel.create)(WebIFC, null);
  const m2 = await quiet((b) => e2.load(b))(bytes2);
  const ed2 = new IfcEditor(WebIFC, e2);
  ix = P.propertyIndex(WebIFC, ed2.api, ed2.mid, m2);

  const six = P.propertyIndex(WebIFC, ed2.api, ed2.mid, m2, { spaces: true });
  const picked = [];
  const bmap = V.boundsMapOf(m2.batches, new Set(ix.keys));
  const app = {
    index: () => ix, spacesIndex: () => six, model: () => m2, name: () => 'bimcraft-house.ifc',
    bounds: (keys) => { const o = new Map(); for (const k of keys) if (bmap.has(k)) o.set(k, bmap.get(k)); return o; },
    highlight: (keys) => { picked.push(keys.length); },
  };
  const d = createDispatcher({ server: { name: 'bimcraft', title: 'BimCraft', version: 'test' }, allowed: () => ['read'] });
  for (const def of K.askTools(app)) d.tool(def);
  const call = async (name, a) => { const r = await d.call(name, a); return { r, v: r.structuredContent, text: r.content?.[0]?.text || '' }; };

  console.log('== "show me every 2-hour wall"');
  ok(d.list().map((t) => t.name).sort().join() === 'elements_above_find,rooms_find,walls_find', 'all three tools are listed with read only');
  let x = await call('walls_find', { hours: 2 });
  ok(!x.r.isError && x.v.total === 3, 'exactly 2 hours = three walls (2HR, 120, REI 120): ' + x.v?.total);
  ok(picked.at(-1) === 3, 'and they were selected in 3D (highlight called with 3)');
  ok(x.v.assumedBareNumbers === 1, 'one match rests on a bare number (120 read as minutes) and says so');
  x = await call('walls_find', { hours: 1, match: 'at_least', show: false });
  ok(x.v.total === 5 && x.v.selected === false && picked.length === 1, 'at least 1 hour = five walls; show:false selects nothing');
  ok(x.v.unrated === walls.length - 6, 'walls with no rating are counted, not matched (' + x.v.unrated + ')');
  x = await call('walls_find', {});
  ok(x.r.isError && /hours/.test(x.text), 'no hours or minutes: an error that says what to give');

  console.log('== "rooms under 70 sq ft"');
  x = await call('rooms_find', { under: 70, unit: 'sqft', show: false });
  console.log('   rooms', x.v.rooms, 'total', x.v.total, 'noArea', x.v.noArea, JSON.stringify(K.roomAreas(six, m2).map((r) => [r.number, r.area, r.areaFrom])));
  const rows = K.roomAreas(six, m2);
  const expect = rows.filter((r) => typeof r.area === 'number' && r.area < 70 * 0.09290304).length;
  ok(x.v.total === expect, 'rooms under 70 sq ft agree with the schedule (' + expect + ')');
  ok(x.v.total === 0 && x.v.rooms === 5, 'none of the five rooms is under 70 sq ft (the smallest is 16.25 m² = 175 sq ft)');
  x = await call('rooms_find', { under: 200, unit: 'sqft', show: false });
  ok(x.v.total === 2 && x.v.rooms_found.map((r) => r.number).join() === '105,103' && Math.abs(x.v.rooms_found[0].area_sqft - 174.95) < 0.1, 'under 200 sq ft (18.58 m²): rooms 105 and 103, smallest first, 105 = 174.95 sq ft');
  const big = await call('rooms_find', { over: 20, unit: 'm2' });
  ok(big.v.total === rows.filter((r) => r.area > 20).length && big.v.rooms_found.every((r) => r.area_m2 > 20), 'rooms over 20 m² agree');
  ok(big.v.rooms_found.every((r) => r.areaFrom === 'file' || r.areaFrom === 'shape'), 'each area says whether it came from the file or the shape');
  x = await call('rooms_find', {});
  ok(x.r.isError, 'no limit: an error');

  console.log('== "what\'s above this ceiling"');
  const floor = ix.keys.find((k) => ix.value('cls', k - ix.keyBase) === 'IfcSlab');
  const low = [...bmap].filter(([k]) => ix.value('cls', k - ix.keyBase) === 'IfcSlab').sort((a, b) => a[1].max[1] - b[1].max[1])[0];
  x = await call('elements_above_find', { id: low[0], within_m: 4, show: false });
  ok(!x.r.isError && x.v.total > 0 && x.v.elements[0].gap_m <= x.v.elements.at(-1).gap_m, 'above the lowest slab: ' + x.v.total + ' elements, nearest first');
  ok(Object.keys(x.v.byClass).length > 0, 'grouped by class: ' + JSON.stringify(x.v.byClass));
  x = await call('elements_above_find', { id: low[0], within_m: 4, class: 'IfcWall', show: false });
  ok(x.v.elements.every((e) => e.class === 'IfcWall'), 'class filter');
  x = await call('elements_above_find', { id: 999999 });
  ok(x.r.isError && /no such element/.test(x.text) && /elements_find/.test(x.text), 'an unknown element: an error that names the next call');

  console.log(good + ' ok, ' + bad + ' failed');
  return bad ? 1 : 0;
}
