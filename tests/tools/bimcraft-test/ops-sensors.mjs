/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ops-sensors.mjs — LC.12 item 3 (session bim-ops): sensor values from a CSV, limits kept in the IFC (assets-bim-sensors.js).
 * Part of ops-test.mjs (`node bin/test-bimcraft.mjs --ops --only sensors`).
 */
import path from 'node:path';
import { IFC2X3_SMALL } from './ops-test.mjs';

export default async function sensorsPart({ APP, ROOT, WebIFC, ok, near, saved, open }) {
  console.log('== LC.12 sensor values from a CSV');
  const S = await import(path.join(APP, 'assets-bim-sensors.js'));
  const A = await import(path.join(APP, 'assets-bim.js'));
  const { fixtureIfc } = await import(path.join(ROOT, 'tools/bimcraft-test/ifc-fixture.mjs'));
  const refused = (f) => { try { f(); return ''; } catch (e) { return e.key || e.message; } };

  // ---- times and numbers
  const utc = (...a) => Date.UTC(...a);
  ok(S.timeOf('2026-10-23T14:05:00Z') === utc(2026, 9, 23, 14, 5) && S.timeOf('2026-10-23 14:05+02:00') === utc(2026, 9, 23, 12, 5) && S.timeOf('2026-10-23T14:05:30.250-0500') === utc(2026, 9, 23, 19, 5, 30, 250),
    'times with a zone: Z, +02:00 and -0500 (with seconds and a fraction)');
  ok(S.timeOf('2026-10-23 14:05') === new Date(2026, 9, 23, 14, 5).getTime() && S.timeOf('2026-10-23') === new Date(2026, 9, 23).getTime(), 'a time with no zone is the browser\'s own local time, as people write them');
  ok(S.timeOf('1761228300') === 1761228300000 && S.timeOf('1761228300123') === 1761228300123, 'Unix seconds and milliseconds');
  ok([S.timeOf('2026-02-30'), S.timeOf('2026-10-23 25:00'), S.timeOf('23/10/2026'), S.timeOf('yesterday'), S.timeOf('')].every(Number.isNaN), 'refused: 30 February, hour 25, a day-first date (ambiguous), words, empty');
  ok(S.numOf('21.5') === 21.5 && S.numOf('-3e2') === -300 && S.numOf('21,5', true) === 21.5 && S.numOf('1.234,5', true) === 1234.5 && Number.isNaN(S.numOf('21,5')) && Number.isNaN(S.numOf('=1+1')) && Number.isNaN(S.numOf('12 kW')), 'numbers: a point, an exponent; a decimal comma only with ; or tab separators; formulas and units refused');

  // ---- the CSV
  let p = S.parseSensorCsv('﻿time,AHU-1,"Pump, P-2",F-101\r\n2026-10-23T10:00Z,18.5,,3\r\n2026-10-23T11:00Z,19,2.5,x\r\nnot a time,1,2,3\r\n2026-10-23T12:00Z,"21.25",3,4\r\n');
  ok(p.sep === ',' && p.rows === 3 && p.cols.map((c) => c.head).join('|') === 'AHU-1|Pump, P-2|F-101' && p.bad.time === 1 && p.bad.value === 1, 'CSV: comma, a quoted header with a comma, 3 good rows; 1 bad time and 1 bad value counted, left out', JSON.stringify({ rows: p.rows, bad: p.bad }));
  ok([...p.cols[0].values].join() === '18.5,19,21.25' && Number.isNaN(p.cols[1].values[0]) && p.cols[1].values[1] === 2.5 && Number.isNaN(p.cols[2].values[1]), 'values in place: blanks and bad cells are gaps, not zeros');
  p = S.parseSensorCsv('Zeit;T-1;T-2\n2026-10-23 10:00;21,5;1.020,0\n');
  ok(p.sep === ';' && p.cols[0].values[0] === 21.5 && p.cols[1].values[0] === 1020, 'semicolons and decimal commas (a European export)');
  ok(refused(() => S.parseSensorCsv('time,a\n')) === 'assets.sensor.err.empty' && refused(() => S.parseSensorCsv('time\n2026-10-23,1')) === 'assets.sensor.err.columns'
    && refused(() => S.parseSensorCsv('t,' + Array.from({ length: 501 }, (_, i) => 'c' + i).join(',') + '\n2026-01-01,1')) === 'assets.sensor.err.too-big', 'refused: no rows, no sensor columns, over 500 sensors');

  // ---- matching to assets
  const assets = [{ guid: 'G1', tag: 'AHU-1', name: 'Air handler' }, { guid: 'G2', tag: 'P-2', name: 'Pump' }, { guid: 'G3', tag: '', name: 'Fan' }, { guid: 'G4', tag: '', name: 'Fan' }, { guid: 'g5Xy', tag: 'T', name: 'Tank' }];
  const m = S.matchSensors(['ahu-1 ', 'Pump', 'Fan', 'G5XY', 'Chiller'], assets);
  ok(m.byHead.get('ahu-1 ')?.guid === 'G1' && m.byHead.get('Pump')?.guid === 'G2' && m.byHead.get('G5XY')?.guid === 'g5Xy' && m.unmatched.join() === 'Fan,Chiller', 'matched by tag (any case, trimmed), by name, by GlobalId; "Fan" fits two assets → not guessed; "Chiller" fits none');

  // ---- the store
  const st = new S.SensorStore({ max: 4 });
  st.set('G1', [3, 1, 2, 4, 5], [30, 10, 20, NaN, 50]);
  ok(st.series('G1').times.join() === '1,2,3,5' && st.latest('G1').v === 50, 'a CSV series: sorted by time, blanks out');
  st.push('G1', 6, 60); st.push('G1', 4, 40);
  ok(st.series('G1').times.join() === '3,4,5,6' && st.latest('G1').v === 60 && !st.push('G1', NaN, 1), 'a feed: readings appended (a late one slots in by time), the newest 4 kept; not-a-number refused');
  ok(st.version === 3 && st.guids().join() === 'G1', 'the version counts every change (the tab redraws on it)');

  // ---- flags, colours, the chart
  ok(S.flagOf(25, { low: 18, high: 24 }) === 'high' && S.flagOf(17.9, { low: 18 }) === 'low' && S.flagOf(20, { low: 18, high: 24 }) === '' && S.flagOf(24, { high: 24 }) === '' && S.flagOf(NaN, { high: 1 }) === '', 'flags: above high, below low, inside (a limit itself is inside), none without a reading');
  ok(S.colorOf(25, { low: 18, high: 24 }) === S.COLORS.high && S.colorOf(10, { low: 18, high: 24 }) === S.COLORS.low && S.colorOf(20, { low: 18, high: 24 }) === S.COLORS.ok, 'colours with limits: blue below, green inside, red above');
  ok(S.colorOf(0, { min: 0, max: 10 }) === S.COLORS.ramp[0] && S.colorOf(10, { min: 0, max: 10 }) === S.COLORS.ramp[4] && S.colorOf(5, { min: 0, max: 10 }) === S.COLORS.ramp[2], 'colours without limits: one blue ramp from the lowest to the highest reading');
  const N = 10000, ts = Array.from({ length: N }, (_, i) => i * 60000), vs = Array.from({ length: N }, (_, i) => Math.sin(i / 300) + (i === 5123 ? 50 : 0));
  const c = S.chartPath(ts, vs, 200, 60, { limits: { high: 2 } });
  ok(c.points <= 400 && c.max === Math.max(...vs) && c.min === Math.min(...vs) && c.n === N && c.lines.length === 1 && c.lines[0].kind === 'high', '10 000 readings drawn with at most 2 points per pixel column (200 wide → ≤ 400); a limit line', String(c.points));
  ok(c.d.split(' ').some((tok, i, arr) => /^[ML]/.test(tok) && Number(arr[i + 1]) <= 0.1), 'the one-reading spike (+50) is still drawn (it reaches the top)');

  // ---- limits kept in the IFC
  let ed = await open(fixtureIfc());
  const desk = A.readAssets(WebIFC, ed.api, ed.mid).find((a) => a.tag === 'F-101');
  ok(desk.limits.low === null && desk.limits.high === null && desk.limits.unit === '', 'no limits to start with');
  ed.modelChange(S.sensorOp(desk.guid, { low: 18, high: 24.5, unit: '°C' }));
  let t = new TextDecoder().decode(ed.save());
  ok(/IFCPROPERTYSET\('[^']+',#\d+,'CadCraft_Sensor',\$,\(#\d+,#\d+,#\d+\)\)/.test(t) && /'Low',\$,IFCREAL\(18\.\)/.test(t) && /'High',\$,IFCREAL\(24\.5\)/.test(t) && /'Unit',\$,IFCLABEL\('\\X2\\00B0\\X0\\C'\)/.test(t), 'IFC4: CadCraft_Sensor Low / High (IfcReal), Unit (IfcLabel, the degree sign encoded)');
  let d = A.readAssets(WebIFC, ed.api, ed.mid).find((a) => a.guid === desk.guid);
  ok(d.limits.low === 18 && d.limits.high === 24.5 && d.limits.unit === '°C', 'read back: 18 to 24.5 °C');
  ed.modelChange(S.sensorOp(desk.guid, { high: 26 }));
  t = new TextDecoder().decode(ed.save());
  d = A.readAssets(WebIFC, ed.api, ed.mid).find((a) => a.guid === desk.guid);
  ok(d.limits.low === null && d.limits.high === 26 && (t.match(/'CadCraft_Sensor'/g) || []).length === 1 && !/'Low'/.test(t), 'changed to "high 26" only: one set, no Low left behind');
  ed.undo();
  ok(A.readAssets(WebIFC, ed.api, ed.mid).find((a) => a.guid === desk.guid).limits.low === 18, 'undo: 18 to 24.5 again');
  ed.modelChange(S.sensorOp(desk.guid, {}));
  ok(!new TextDecoder().decode(ed.save()).includes('CadCraft_Sensor'), 'every value cleared: the set is gone');
  ok(refused(() => S.sensorOp(desk.guid, { low: 30, high: 20 })) === 'assets.sensor.err.order' && refused(() => S.sensorOp(desk.guid, { low: 'warm' })) === 'assets.sensor.err.limit', 'refused: high below low, a limit in words');
  // a wall with limits only becomes an asset (a sensor on it)
  const wall = A.readAssets(WebIFC, ed.api, ed.mid).length;
  const wid = (() => { for (const id of ed.api.GetLineIDsWithType(ed.mid, WebIFC.IFCWALL) ?? []) { const l = ed.api.GetLine(ed.mid, id, false); if (l.Tag?.value === 'W-101') return l.GlobalId.value; } return null; })();
  ed.modelChange(S.sensorOp(wid, { high: 60, unit: '%RH' }));
  ok(A.readAssets(WebIFC, ed.api, ed.mid).length === wall + 1, 'limits on a wall (a humidity sensor in it): the wall joins the assets');
  saved['sensors-ifc4'] = ed.save();
  ed = await open(IFC2X3_SMALL);
  const b = A.readAssets(WebIFC, ed.api, ed.mid)[0];
  ed.modelChange(S.sensorOp(b.guid, { low: 55, high: 80, unit: 'degC' }));
  ok(A.readAssets(WebIFC, ed.api, ed.mid)[0].limits.high === 80, 'IFC2X3: the same set, read back');
  saved['sensors-ifc2x3'] = ed.save();
  void near;
}
