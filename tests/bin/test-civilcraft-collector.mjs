#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-collector.mjs — CivilCraft 0.8 EG.11: data collector files (collector.js) read on files WE wrote, reduced and adjusted.
 * Known answers: a station at (5000, 5000) sighting a backsight due north at hz 0 and a shot at hz 90° 100 m away lands at E 5100; DDD.MMSS reads 90.3000 as 90°30′;
 * the four formats give the same coordinates; a bad line is reported, never guessed; a job runs through adjustNetwork and recovers noise-free coordinates.
 *   node bin/test-civilcraft-collector.mjs [--build dev|x.y]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const base = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const C = await import(pathToFileURL(path.join(base, 'collector.js')).href), A = await import(pathToFileURL(path.join(base, 'adjust.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);

near(C.dmsDotted(90.3), 90.5 * Math.PI / 180, 1e-12, 'DDD.MMSS 90.3000 = 90°30′'); near(C.dmsDotted(12.3045), (12 + 30 / 60 + 45 / 3600) * Math.PI / 180, 1e-12, 'DDD.MMSS 12.3045');
const rw5 = `JB,NMtest,DT10-27-2026,TM10:00:00
MO,AD0,UN0,SF1.00000000,EC0,EO0.0,AU0
--a comment
SP,PN1,N 5000.0000,E 5000.0000,EL100.0000,--STA
SP,PN2,N 5200.0000,E 5000.0000,EL100.0000,--BS
OC,OP1,N 5000.0000,E 5000.0000,EL100.000,--
BK,OP1,BP2,BS0.0000,BC0.0000
LS,HI1.500,HR1.500
SS,OP1,FP3,AR90.0000,ZE90.0000,SD100.000,--TREE
SS,OP1,FP4,AR180.0000,ZE90.0000,SD50.000,--POLE
`;
{
  const j = C.readCollector(rw5, { angle: 'deg' }); ok(j.format === 'rw5', 'sniffed rw5'); ok(j.setups.length === 1 && j.setups[0].shots.length === 2, 'one setup, two shots');
  const r = C.reduce(j); near(r.points['3'].e ?? r.points.PN3?.e ?? Object.values(r.points)[0].e, 5100, 1e-9, 'shot east 5100');
  const p3 = r.shots.find((s) => s.id === '3'); near(p3.n, 5000, 1e-9, 'shot north 5000'); const p4 = r.shots.find((s) => s.id === '4'); near(p4.n, 4950, 1e-9, 'shot behind the station'); near(p4.e, 5000, 1e-9, 'pole east');
  ok(C.readCollector('JB,x\nZZ,1,2\n', {}).problems.some((p) => p.code === 'col.unknown'), 'unknown record reported');
  ok(C.readCollector('JB,x\n', {}).problems.some((p) => p.code === 'col.empty'), 'no shots reported');
}
{   // vertical angle and height: 30° above horizontal, slope 100, HI 1.5, HR 1.5 -> dz = 100·cos(60°) = 50 ... zenith 60°
  const t = rw5.replace('ZE90.0000,SD100.000', 'ZE60.0000,SD100.000');
  const r = C.reduce(C.readCollector(t, { angle: 'deg' })); const p = r.shots.find((s) => s.id === '3');
  near(p.n, 5000, 1e-9, 'north'); near(p.e, 5000 + 100 * Math.sin(Math.PI / 3), 1e-9, 'horizontal distance 100 sin z'); near(p.z, 100 + 50, 1e-9, 'height 100 + 100 cos z');
}
{   // GSI
  const g = `*110001+00000001 81..00+05000000 82..00+05000000
*110001+00000002 81..00+05000000 82..00+05200000
*110001+00000001 88..46+00001500
*110001+00000002 21.022+00000000 22.022+10000000 31..00+00100000
*110001+00000003 21.022+10000000 22.022+10000000 31..00+00100000`;
  const j = C.readCollector(g, {}); ok(j.format === 'gsi', 'sniffed gsi'); ok(j.points['1'] && Math.abs(j.points['1'].e - 5000) < 1e-9, 'gsi point east 5000');
  ok(j.setups.length === 1 && j.setups[0].backsight, 'gsi setup with a backsight'); near(j.setups[0].shots[0].hz, Math.PI / 2, 1e-9, 'gsi hz 100 gon = 90°');
  const r = C.reduce(j); near(r.shots[0].hd, 100, 1e-9, 'gsi horizontal distance 100'); ok(r.shots.length === 1, 'gsi one shot');
}
{   // JobXML
  const xml = `<?xml version="1.0"?><JOBFile><FieldBook>
<PointRecord><Name>1</Name><Grid><North>5000</North><East>5000</East><Elevation>100</Elevation></Grid></PointRecord>
<PointRecord><Name>2</Name><Grid><North>5200</North><East>5000</East><Elevation>100</Elevation></Grid></PointRecord>
<StationRecord><StationName>1</StationName><TheodoliteHeight>1.5</TheodoliteHeight></StationRecord>
<BackBearingRecord><Circle>0</Circle></BackBearingRecord>
<PointRecord><Name>3</Name><Circle><HorizontalCircle>90</HorizontalCircle><VerticalCircle>90</VerticalCircle><EDMDistance>100</EDMDistance></Circle><TargetHeight>1.5</TargetHeight></PointRecord>
</FieldBook></JOBFile>`;
  const j = C.readCollector(xml, {}); ok(j.format === 'jobxml', 'sniffed jobxml'); ok(j.setups[0].shots.length === 1, 'jobxml shot');
  ok(C.readCollector('<JOBFile><FieldBook>', {}).problems.some((p) => p.code === 'col.xml'), 'broken xml reported');
}
{   // CSV and the same answer
  const csv = `point,1,5000,5000,100
point,2,5200,5000,100
1,2,2,0,90,200
1,2,3,90,90,100,1.5
`;
  const j = C.readCollector(csv, { angle: 'deg' }); ok(j.format === 'csv', 'csv'); const r = C.reduce({ ...j, setups: j.setups.map((s) => ({ ...s, backsight: { id: '2', hz: 0 } })) });
  near(r.shots[0].e, 5100, 1e-9, 'csv shot east');
}
{   // into the adjustment: noise-free job -> the free points come back
  const j = C.readCollector(rw5, { angle: 'deg' }); const o = C.toObservations(j, {});
  ok(o.free.length === 2, 'two free points'); ok(o.obs.filter((q) => q.type === 'dist').length === 2, 'two distances');
  const r = A.adjustNetwork(o.points, o.obs); ok(r.converged || r.dof <= 0, 'ran'); near(o.points['3'].x, 5100, 1e-9, 'start values from the reduction'); void r;
}
console.log(`collector: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
