/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --gh3ui` (0.8 round 3, session gh3ui_PART_3): GH.3-A one display unit, GH.3-C orthogonal Measure.
 * DOM-free: walks the lengths the building tools and schedules show under each of the six units, the coordinate and
 * Location helpers, the refusal limits, and the measure end point.
 */
import path from 'node:path';

export async function gh3uiMode({ APP, ROOT }) {
  const U = await import(path.join(APP, 'model-units.js'));
  const SCH = await import(path.join(APP, 'model-schedule.js'));
  const M = await import(path.join(APP, 'measure.js'));
  const C = await import(path.join(APP, 'coords.js'));
  const RS = await import(path.join(APP, 'res-sheets.js'));
  let bad = 0, good = 0;
  const ok = (c, m) => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + m); };
  const UNITS = U.UNITS;
  // a length token of the wrong family: another unit's mark beside a number
  const leak = (text, unit) => {
    const marks = { ftin: /\d\s?(mm|cm|m|in|ft)\b/, in: /\d\s?(mm|cm|m|ft)\b|\d['"]/, ftdec: /\d\s?(mm|cm|m|in)\b|\d['"]/, mm: /\d\s?(cm|m|in|ft)\b|\d['"]/, cm: /\d\s?(mm|m|in|ft)\b|\d['"]/, m: /\d\s?(mm|cm|in|ft)\b|\d['"]/ };
    return marks[unit].test(text);
  };

  console.log('== display unit helpers');
  ok(UNITS.length === 6, 'six display units');
  for (const u of UNITS) {
    const s = [U.lenMark(3810, u), U.lenMark(0, u), U.fmtCoord(1234567.8, u), U.fmtFine(0.5, u), U.localizeLengths('at least 10 mm thick, up to 12 m', u)].join(' | ');
    ok(!leak(s.replace(/\bft-in\b/, ''), u) || u === 'ftin' || u === 'in', u + ': ' + s);
  }
  ok(U.unitMark('ftin') === '' && U.unitMark('ftdec') === 'ft' && U.unitMark('cm') === 'cm', 'unitMark');
  ok(U.lenMark(3810, 'ftin') === "12'-6\"" && U.lenMark(3810, 'mm') === '3810 mm' && U.lenMark(3810, 'm') === '3.81 m', 'lenMark');
  ok(U.fmtCoord(500123456, 'm') === '500123.456 m' && U.fmtCoord(304.8, 'ftin') === '1.000 ft' && U.fmtCoord(1000, 'mm') === '1000.0 mm', 'fmtCoord: millimetre precision, feet-inches as decimal feet');
  ok(U.fmtFine(0.5, 'ftin') === '0.0197 in' && U.fmtFine(0.5, 'mm') === '0.5 mm', 'fmtFine (a scale per pixel) is never 0');
  ok(U.localizeLengths('A floor must be at least 10 mm thick.', 'mm') === 'A floor must be at least 10 mm thick.', 'limits stay as written in mm');
  ok(U.localizeLengths('at least 10 mm thick', 'm') === 'at least 0.01 m thick' && /\"/.test(U.localizeLengths('at least 10 mm thick', 'ftin')), 'limits follow the unit');
  ok(U.localizeLengths("from 1000 mm (3'-4\") to 100 m", 'm') === "from 1000 mm (3'-4\") to 100 m" && U.localizeLengths('3 m² and 2 m/s', 'mm') === '3 m² and 2 m/s', 'a message with feet-inches, areas and speeds is left alone');

  console.log('== schedules name their unit');
  const snap = { levels: [{ id: 1, name: 'L1' }], walls: [{ id: 1, typeKey: 'x', t: 150, len: 4000, height: 2700, typeName: 'Wall' }],
    openings: [{ kind: 'door', mark: 'D1', typeKey: 'none', width: 900, height: 2100, sill: 0, storey: 1, wall: 1 }], derived: { spaces: [] } };
  const T = (k) => k;
  for (const u of UNITS) {
    const s = SCH.schedules(snap, new Map(), { fmtLen: (mm) => U.fmtLen(mm, u), fmtArea: (a) => U.fmtArea(a, u), t: T, unit: U.unitMark(u) });
    const head = s.doors.head.join(','), cell = s.doors.rows[0].join(',');
    const mark = U.unitMark(u);
    ok(mark ? head.includes('(' + mark + ')') : !head.includes('('), u + ': door schedule header ' + (mark ? 'carries (' + mark + ')' : 'has no unit (cells carry marks)') + ' · ' + cell);
    ok(s.walls.head.join(',').includes(mark ? '(' + mark + ')' : 'model.prop.length'), u + ': wall schedule header');
  }

  console.log('== map coordinates follow the unit, the map\'s own text is kept');
  const g = { mapUnitM: 0.3048 };
  for (const u of UNITS) {
    const r = C.mapText(g, 500000.123, 4000000.5, u);
    ok(r.own.unit === 'ft' && r.unit === U.unitMark(u === 'ftin' ? 'ftdec' : u) && !/[a-z]/i.test(r.e), u + ': E ' + r.e + ' N ' + r.n + ' ' + r.unit);
  }
  ok(C.mapText(g, 1, 2).unit === 'ft', 'without a unit, the map\'s own text as before');

  console.log('== scale families follow the unit (cm and m are metric)');
  for (const u of UNITS) ok(RS.scalesFor(u)[0].label.includes(':') === U.isMetric(u), u + ': scales ' + RS.scalesFor(u)[0].label);

  // ---- GH.3-A round 2 (gh3a2_PART_3): areas, volumes, sentences, paper, the CRS's own unit, the neutral lib ----
  console.log('== areas and volumes in the matching unit (six units)');
  const A = { ftin: 'ft²', in: 'in²', ftdec: 'ft²', mm: 'mm²', cm: 'cm²', m: 'm²' }, V = { ftin: 'ft³', in: 'in³', ftdec: 'ft³', mm: 'mm³', cm: 'cm³', m: 'm³' };
  for (const u of UNITS) {
    const a = U.fmtM2(24, u), v = U.fmtM3(60, u);
    ok(a.endsWith(' ' + A[u]) && v.endsWith(' ' + V[u]), u + ': 24 m² → ' + a + ' · 60 m³ → ' + v);
    ok(U.areaMark(u) === A[u] && U.volMark(u) === V[u], u + ': areaMark / volMark');
  }
  ok(U.fmtM2(24, 'm') === '24.00 m²' && U.fmtM2(24, 'cm') === '240,000.0 cm²' && U.fmtM2(24, 'mm') === '24,000,000 mm²' && U.fmtM2(24, 'in') === '37,200.1 in²', 'fmtM2 values (grouped above 9999)');
  ok(U.fmtM2(24, 'ftin') === '258.3 ft²' && U.fmtM2(24, 'm', false) === '24.00', 'ft² to 0.1; no-unit form for a column');
  ok(U.fmtM3(60, 'ftdec') === '2118.9 ft³' && U.fmtM3(60, 'mm') === '60,000,000,000 mm³', 'fmtM3 values');
  ok(Math.abs(U.fmtAreaMm2(645.16, 'in').split(' ')[0] - 1) < 1e-9 && U.fmtVolMm3(1e9, 'mm').endsWith('mm³'), 'in² and mm³ factors');

  console.log('== a calculation sentence follows the pick; rates and densities do not');
  const S1 = 'Floor 24.0 m², volume 62.4 m³. Walked 14 m at most. Opening 300 mm. Heat 5 W/m², 2400 kg/m³, 1.4 m/s, 40 kN/m, 120 mm²/m, 3 min, 2 months, 12 kWh/m².';
  for (const u of UNITS) {
    const r = U.localizeQuantities(S1, u);
    ok(r.includes(U.fmtM2(24, u)) && r.includes(U.fmtM3(62.4, u)) && r.includes(U.lenMark(14000, u)) && r.includes(U.lenMark(300, u)), u + ': ' + r.slice(0, 90));
    ok(/5 W\/m²/.test(r) && /2400 kg\/m³/.test(r) && /1\.4 m\/s/.test(r) && /40 kN\/m/.test(r) && /120 mm²\/m/.test(r) && /3 min/.test(r) && /2 months/.test(r) && /12 kWh\/m²/.test(r), u + ': rates, densities, minutes left alone');
  }
  ok(U.localizeQuantities("3'-4\" and 5 m", 'mm') === "3'-4\" and 5 m", 'a sentence that already has feet-inches is left as written');
  ok(U.localizeQuantities('24 m² and 5 mm² of steel', 'ftin') === '258.3 ft² and 5 mm² of steel', 'mm² (a bar area) is the calculation\'s own');

  console.log('== paper: names stay, dimensions follow the pick');
  ok(U.fmtPaper(420, 297, 'mm') === '420 × 297 mm' && U.fmtPaper(420, 297, 'cm') === '42 × 29.7 cm' && U.fmtPaper(420, 297, 'm') === '0.42 × 0.297 m', 'A3 in mm, cm, m');
  ok(U.fmtPaper(279.4, 215.9, 'ftin') === '11 × 8.5 in' && U.fmtPaper(279.4, 215.9, 'in') === '11 × 8.5 in' && U.fmtPaper(279.4, 215.9, 'ftdec') === '0.917 × 0.708 ft', 'Letter in inches and feet');
  const names = { letter: 'Letter', a4: 'A4', tabloid: 'Tabloid', archd: 'Arch D', a3: 'A3', a1: 'A1' };
  for (const u of UNITS) {
    const l = Object.keys(names).map((k) => U.paperLabel(names[k], k, u));
    ok(l.every((x, i) => x.startsWith(Object.values(names)[i] + ' · ')) && l.every((x) => !leak(x.replace(/^[^·]*·/, ''), u) || u === 'ftin' || u === 'in'), u + ': ' + l[0] + ' | ' + l[4]);
  }
  ok(U.paperLabel('Custom', 'nope', 'mm') === 'Custom', 'an unknown paper is just its name');
  ok(Object.keys(RS.PAPERS).every((k) => U.PAPER_MM[k] && Math.abs(U.PAPER_MM[k][1] - RS.PAPERS[k][0]) < 1 && Math.abs(U.PAPER_MM[k][0] - RS.PAPERS[k][1]) < 1), 'the labelled sizes are the sizes the sheets use (res-sheets PAPERS)');

  console.log('== the CRS\'s own unit beside the pick');
  ok(U.crsUnitNote('m', 'm') === null && U.crsUnitNote('ftin', 'ft') === null && U.crsUnitNote('ftdec', 'ft') === null, 'same family: no note');
  ok(U.crsUnitNote('ftin', 'ftUS') === 'us-ft' && U.crsUnitNote('m', 'ftUS') === 'us-ft' && U.crsUnitNote('mm', 'ft') === 'ft' && U.crsUnitNote('ftdec', 'm') === 'm', 'differs: the CRS unit id');
  const usft = { mapUnitM: 1200 / 3937 };
  for (const u of UNITS) {
    const r = C.mapText(usft, 500000, 4000000, u);
    ok(r.note === 'us-ft' && r.own.unit === 'US ft', u + ': US survey feet map → note ' + r.note + ', ' + r.e + ' ' + r.unit);
  }
  ok(C.mapText({ mapUnitM: 1 }, 1, 2, 'm').note === null && C.mapText({ mapUnitM: 0.3048 }, 1, 2, 'ftin').note === null, 'metres in metres: no note; feet in feet-inches: no note');

  console.log('== the neutral lib (rule 39)');
  const fs = await import('node:fs');
  const lib = path.join(ROOT, 'lib/units/display-units.js');
  ok(fs.readFileSync(lib).equals(fs.readFileSync(path.join(APP, 'display-units.js'))), 'dev/display-units.js is a byte-identical copy of lib/units/display-units.js');
  const src = fs.readFileSync(lib, 'utf8');
  ok(!/^\s*import /m.test(src) && !/\b(document|window)\b/.test(src.replace(/\/\*[\s\S]*?\*\//g, '')), 'the lib has no imports and no DOM');
  ok(U.fmtLen === (await import(path.join(APP, 'display-units.js'))).fmtLen && U.getDisplayUnits && U.parseLen, 'model-units.js re-exports the lib and keeps its own parsing / pick');
  ok(!/function fmtLen|function localizeLengths|export const lenMark/.test(fs.readFileSync(path.join(APP, 'model-units.js'), 'utf8')), 'model-units.js no longer holds the formatters');

  console.log('== Measure held orthogonal (GH.3-C)');
  const a = [0, 0, 0];
  let o = M.orthoPoint(a, [3, 0.5, 1]);
  ok(o.axis === 0 && o.point.join() === '3,0,0', 'nearest axis in 3D: X');
  o = M.orthoPoint(a, [0.2, 4, 1]);
  ok(o.axis === 1 && o.point.join() === '0,4,0', 'nearest axis in 3D: Y (up)');
  o = M.orthoPoint(a, [0.2, 4, -5], true);
  ok(o.axis === 2 && o.point.join() === '0,0,-5', 'in a plan (looking down) only the two horizontal axes');
  o = M.orthoPoint([1, 1, 1], [1, 1, 1]);
  ok(M.distance([1, 1, 1], o.point) === 0, 'a zero move stays put');
  const d = M.ifcDelta(a, M.orthoPoint(a, [7, 1, 2]).point);
  ok(d[1] === 0 && d[2] === 0 && d[0] === 7, 'the IFC delta of an orthogonal segment has one non-zero component');

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
