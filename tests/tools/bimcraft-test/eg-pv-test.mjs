/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --pv` (0.8 round 2, EG.15, session `energy_PART_2`): solar PV — the sun and the light on a tilted plane, the module table, roof faces
 * and the modules fitted in them, ground rows and their no-shade spacing, shadows from the model's triangles, the yield chain, string sizing, the one-line,
 * the Problems they raise, and the same on a real IFC model (arrays placed as IfcSolarDevice / IfcBuildingElementProxy, one undo step), with the assistant tools.
 * Every figure is worked by hand beside its test.
 */
import path from 'node:path';
import fs from 'node:fs';

export async function pvMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const imp = (f) => import(path.join(APP, f));
  const PV = await imp('pv.js'), SUN = await imp('pv-sun.js'), SH = await imp('pv-shade.js'), YD = await imp('pv-yield.js'), ST = await imp('pv-string.js'), OL = await imp('pv-oneline.js'), PR = await imp('pv-problems.js');
  const D2R = Math.PI / 180;
  const site = { lat: 40, lon: -105, north: [0, 1], tz: -7 };
  const M = PV.STARTER_MODULE, INV = PV.STARTER_INVERTER;

  console.log('== the sun and the light on a plane (worked by hand)');
  {
    const s = SUN.sunAt(site, 3, 20, 12);
    ok(s && near(s.alt, 90 - 40, 0.7) && near(s.az, 180, 1.5), 'equinox solar noon at 40° N: the sun stands 50° high in the south', JSON.stringify(s && [s.alt, s.az]));
    const n = PV.planeNormal(40, 180, site);
    ok(near(s.dir[0] * n[0] + s.dir[1] * n[1] + s.dir[2] * n[2], 1, 1e-3), 'a south plane tilted 40° has incidence 0 at that moment (cos θ = 1)');
    // an exact sun along the normal: beam = DNI, sky = DHI (1 + cos β)/2, ground = GHI ρ (1 − cos β)/2
    const p = SUN.poa({ sun: { dir: n }, dni: 800, dhi: 100, ghi: 700 }, n, { albedo: 0.2, b0: 0.05 });
    const c40 = Math.cos(40 * D2R);
    ok(near(p.beam, 800, 1e-9) && near(p.sky, 100 * (1 + c40) / 2, 1e-9) && near(p.ground, 700 * 0.2 * (1 - c40) / 2, 1e-9) && near(p.total, 800 + 100 * (1 + c40) / 2 + 700 * 0.2 * (1 - c40) / 2, 1e-9), 'plane-of-array light at normal incidence: beam 800 + sky 88.3 + ground 16.4 W/m²', JSON.stringify(p));
    const q = SUN.poa({ sun: { dir: [0, Math.sin(60 * D2R) * -1, Math.cos(60 * D2R)] }, dni: 800, dhi: 0, ghi: 0 }, [0, 0, 1], {});
    ok(near(q.cosI, 0.5, 1e-9) && near(q.beam, 400, 1e-9) && near(q.iam, 1 - 0.05 * (2 - 1), 1e-9) && near(q.beamIam, 400 * 0.95, 1e-9), 'beam at 60° incidence: DNI × 0.5 = 400, then the incidence modifier 1 − 0.05 (1/cos θ − 1) = 0.95');
    const behind = SUN.poa({ sun: { dir: [0, 1, 0.3] }, dni: 800, dhi: 50, ghi: 80 }, PV.planeNormal(30, 180, site), {});
    ok(behind.beam === 0 && behind.sky > 0, 'a sun behind the plane gives no beam, only the sky');
    ok(near(SUN.dailyExtraterrestrial(0, 80), 24 / Math.PI * 1.367 * (1 + 0.033 * Math.cos(2 * Math.PI * 80 / 365)), 0.01), 'extraterrestrial radiation on the equator at the equinox: 24/π × Gsc × the orbit factor (≈ 10.4 kWh/m²)');
    ok(near(SUN.monthlyDiffuseFraction(0.5, 70), 1.391 - 3.56 * 0.5 + 4.189 * 0.25 - 2.137 * 0.125, 1e-12) && near(SUN.monthlyDiffuseFraction(0.5, 90), 1.311 - 3.022 * 0.5 + 3.427 * 0.25 - 1.821 * 0.125, 1e-12), 'the diffuse fraction follows Erbs (both sunset-angle branches)');
    const sky = { mode: 'monthly', ghi: [2, 2.9, 4, 5, 5.9, 6.5, 6.3, 5.6, 4.5, 3.2, 2.1, 1.7] };
    const day = SUN.dayIrradiance(site, 6, sky, { tz: -7 });
    ok(near(day.ghiKwh, 6.5, 1e-6), 'a typed June day of 6.5 kWh/m² is spread over the hours and adds back to exactly 6.5', String(day.ghiKwh));
    const horiz = day.hours.reduce((sum, x) => sum + (x.sun ? (x.dni * x.sun.cosZ + x.dhi) : 0), 0) / 1000;
    ok(near(horiz, 6.5, 0.01), 'beam on the horizontal + diffuse = the global total (DNI cos Z + DHI)', String(horiz));
    ok(day.hours.filter((x) => x.sun).length >= 14 && day.hours[12].ghi > day.hours[8].ghi && day.hours[3].ghi === 0, 'June at 40° N: 14+ hours of sun, the most at noon, none at 03:30');
    const bad1 = SUN.dayIrradiance(site, 6, { mode: 'monthly', ghi: [0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0] });
    ok(bad1.problems[0]?.code === 'sky.range' && bad1.ghiKwh === 0, 'a monthly total above 12 kWh/m² a day is refused with a reason');
    const clear = SUN.dayIrradiance(site, 6, { mode: 'clear' }, { tz: -7 });
    ok(clear.ghiKwh > 7.5 && clear.ghiKwh < 10.5 && clear.hours.some((x) => x.dni > 700), 'the clear-sky June day gives 7.5–10.5 kWh/m² and 700+ W/m² of beam', String(clear.ghiKwh));
    const south = SUN.dayIrradiance({ ...site, lat: -40 }, 12, { mode: 'clear' }, { tz: -7 });
    ok(south.ghiKwh > clear.ghiKwh * 0.8 && south.hours.filter((x) => x.sun).length >= 14, 'December in the southern hemisphere is the long summer day (mirror image)');
  }

  console.log('== the module table');
  {
    ok(PV.cleanModule(M).ok && M.starter === true && /starter/i.test(M.name), 'the generic module is valid and labelled a starter');
    ok(near(M.vmp * M.imp, 400, 1), 'its Vmp × Imp is 400 W (within 1)');
    ok(!PV.cleanModule({ ...M, vmp: 50 }).ok && PV.cleanModule({ ...M, vmp: 50 }).errors.includes('vmp'), 'a Vmp above Voc is refused');
    ok(PV.cleanModule({ ...M, betaVoc: 0.5 }).errors.includes('betaVoc') && PV.cleanModule({ ...M, wp: -1 }).errors.includes('wp'), 'a silly coefficient or a negative power is refused');
    const csv = PV.modulesCsv([M]);
    const back = PV.parseModulesCsv(csv);
    ok(back.errors.length === 0 && back.modules.length === 1 && near(back.modules[0].betaVoc, M.betaVoc, 1e-9) && back.modules[0].wp === 400, 'the table round-trips through CSV (coefficients in % per kelvin)');
    const lines = csv.split('\n'); lines.push('x,=cmd|\' /c calc\'!A1,300,40,33,9.5,9,-0.3,-0.3,-0.35,0.05,45,1700,1100,30', 'y,Bad,0,1,1,1,1,0,0,0,0,0,1,1,1', lines[1]);
    const mixed = PV.parseModulesCsv(lines.join('\n'));
    ok(mixed.modules.length === 2 && mixed.errors.length === 2 && mixed.errors.map((e) => e.keys[0]).sort().join() === 'duplicate,wp' && !/^[=+@]/.test(PV.modulesCsv(mixed.modules).split('\n')[2].split(',')[1]), 'bad and repeated rows are listed, and a formula-looking name is quoted on the way out');
    ok(PV.parseModulesCsv('a,b\n1,2').errors[0].keys[0] === 'columns', 'a table without the needed columns is refused');
    ok(PV.arrayKwp(Array(10).fill({}), M) === 4, '10 modules × 400 Wp = 4.0 kWp');
  }

  console.log('== roof faces and modules (worked by hand)');
  let faceSouth;
  {
    // a plain 8 m × 6 m (along the slope) plane tilted 30°, rising to the north, so it faces south
    const c = Math.cos(30 * D2R), s = Math.sin(30 * D2R);
    const P = (x, t) => [x, t * c, t * s];
    const rect = (x0, x1, t0, t1) => [...P(x0, t0), ...P(x1, t0), ...P(x1, t1), ...P(x0, t0), ...P(x1, t1), ...P(x0, t1)];
    const tris = rect(0, 8000, 0, 6000);
    const faces = PV.roofFaces([...tris, ...[0, 0, -300, 8000, 6000, -300, 8000, 0, -300]], site);
    ok(faces.length === 1 && near(faces[0].tilt, 30, 0.01) && near(faces[0].azimuth, 180, 0.01) && near(faces[0].areaM2, 48, 0.01), 'a 30° plane rising northward is one face: tilt 30°, azimuth 180° (south), 48 m² (a downward triangle is not a face)', JSON.stringify(faces.map((f) => [f.tilt, f.azimuth, f.areaM2])));
    faceSouth = faces[0];
    const fit = PV.fitFace(faceSouth, M, { orient: 'portrait', setback: 300, gap: 20 });
    // across 8000 − 2 × 300 = 7400: six modules of 1134 + 5 gaps = 6904 (seven = 8058 + 120 is too wide); up the slope 6000 − 600 = 5400: three of 1722 + 2 gaps = 5206 (four = 6888 + 60 is too long)
    ok(fit.count === 18 && near(fit.kwp, 7.2, 1e-9), 'portrait modules fit 6 across × 3 up = 18 = 7.2 kWp with a 300 mm setback', String(fit.count));
    const land = PV.fitFace(faceSouth, M, { orient: 'landscape', setback: 300, gap: 20 });
    // across: 1722 → floor((7400 + 20) / 1742) = 4; up: 1134 → floor((5400 + 20) / 1154) = 4  → 16
    ok(land.count === 16, 'landscape: 4 across × 4 up = 16', String(land.count));
    // every module lies inside the face with the setback: in (u, v) the corners are ≥ 300 from the edges
    const p0 = faceSouth.centroid, un = fit.u, vn = fit.v;
    const inside = fit.modules.every((m) => m.corners.every((q) => { const d = [q[0] - p0[0], q[1] - p0[1], q[2] - p0[2]], s1 = d[0] * un[0] + d[1] * un[1] + d[2] * un[2], t1 = d[0] * vn[0] + d[1] * vn[1] + d[2] * vn[2]; return s1 >= -4000 + 300 - 1 && s1 <= 4000 - 300 + 1 && t1 >= -3000 + 300 - 1 && t1 <= 3000 - 300 + 1; }));
    ok(inside, 'no module corner is within 300 mm of an edge of the face');
    ok(PV.fitFace(faceSouth, M, { setback: 300, gap: 20, max: 5 }).count === 5 && PV.fitFace(faceSouth, M, { setback: 3500 }).count === 0, 'a cap on the count is kept; a setback of 3.5 m leaves no room');
    // an L-shaped face: the module test follows the outline, not the bounding box
    const L = [...rect(0, 8000, 0, 3000), ...rect(0, 3000, 3000, 6000)];
    const lf = PV.roofFaces(L, site)[0], lfit = PV.fitFace(lf, M, { setback: 300, gap: 20 });
    ok(lfit.count > 0 && lfit.count < PV.fitFace(faceSouth, M, { setback: 300, gap: 20 }).count && lfit.modules.every((m) => { const q = m.c; const t1 = ((q[1]) / c); const x = q[0]; return t1 < 3000 + 1 || x < 3000; }), 'an L-shaped face: modules stay in the L, none in the missing corner');
    // flat roof and two parallel planes
    const flat = PV.roofFaces([0, 0, 3000, 5000, 0, 3000, 5000, 4000, 3000, 0, 0, 3000, 5000, 4000, 3000, 0, 4000, 3000], site);
    ok(flat.length === 1 && flat[0].flat === true && flat[0].azimuth === null && PV.fitFace(flat[0], M, { setback: 300 }).count > 0, 'a flat roof is a face with no azimuth, and takes modules');
    const two = PV.roofFaces([...rect(0, 4000, 0, 3000), ...rect(0, 4000, 0, 3000).map((v, i) => (i % 3 === 2 ? v + 1000 : v))], site);
    ok(two.length === 2, 'two parallel planes 1 m apart are two faces');
    // a north-rotated model: true north is +X in the model — the same roof now faces east of south
    const rot = { ...site, north: [1, 0] };
    const rf = PV.roofFaces(rect(0, 8000, 0, 6000), rot)[0];
    ok(near(rf.azimuth, 270, 0.01) || near(rf.azimuth, 90, 0.01), 'with true north along +X a roof that faces −Y faces east or west (' + rf.azimuth + '°)');
    ok(near(PV.tiltAzimuthOf(PV.planeNormal(25, 135, rot), rot).azimuth, 135, 1e-9) && near(PV.tiltAzimuthOf(PV.planeNormal(25, 135, rot), rot).tilt, 25, 1e-9), 'planeNormal and tiltAzimuthOf are inverses, in a rotated model too');
  }

  console.log('== ground rows and the winter-solstice spacing');
  {
    // two modules up the slope: 2 × 1722 + 20 = 3464 mm; tilt 30° → h = 1732 mm; at 40° N the winter-noon sun is 90 − 40 − 23.44 = 26.56° high
    const slant = 2 * 1722 + 20, h = slant * Math.sin(30 * D2R), alpha = 90 - 40 - 23.44;
    const want = slant * Math.cos(30 * D2R) + h / Math.tan(alpha * D2R);
    const r = PV.winterPitch({ slantMm: slant, tilt: 30, azimuth: 180, site });
    ok(near(r.elevation, alpha, 0.2) && near(r.pitchMm, want, 0.015 * want), 'row pitch = Ls cos β + h / tan α = ' + Math.round(want) + ' mm (the rule)', JSON.stringify(r));
    const r3 = PV.winterPitch({ slantMm: slant, tilt: 30, azimuth: 180, site, hours: 3 });
    const a3 = 90 - 40 - 23.44;
    ok(r3.elevation < r.elevation && r3.pitchMm > r.pitchMm && near(r3.shadowMm, 1732.05 / Math.tan(r3.elevation * D2R) * Math.cos((r3.sunAzimuth - 180) * D2R), 0.5) && a3 > 0, 'three hours off noon the sun is lower (' + Math.round(r3.elevation) + '°) and its shadow longer, ×cos of the angle to the row\'s normal: a larger pitch, ' + Math.round(r3.pitchMm) + ' mm');
    ok(PV.winterPitch({ slantMm: slant, tilt: 30, azimuth: 180, site: { ...site, lat: 80 } }).error === 'pv.err.polar', 'inside the polar night: a reason, not a number');
    const g = PV.groundLayout({ site, module: M, orient: 'portrait', perRow: 5, stack: 2, rows: 3, tilt: 30, azimuth: 180, origin: [0, 0, 0] });
    ok(g.count === 30 && near(g.kwp, 12, 1e-9) && near(g.pitchMm, want, 0.015 * want), 'three tables of 5 × 2 modules = 30 = 12 kWp at that pitch');
    const y1 = g.tables[0].corners[0][1], y2 = g.tables[1].corners[0][1];
    ok(near(y2 - y1, g.pitchMm, 0.01) && g.tables[0].corners[0][2] === 500 && near(g.tables[0].corners[3][2] - 500, h, 0.01), 'the next row is one pitch toward the north (behind); the lower edge is 500 mm up; the top edge 1732 mm higher');
    ok(near(g.gcr, slant / g.pitchMm, 0.01), 'ground coverage ratio = slant ÷ pitch');
    const manual = PV.groundLayout({ site, module: M, perRow: 3, stack: 1, rows: 2, tilt: 20, azimuth: 180, origin: [0, 0, 0], pitchMm: 4000 });
    ok(manual.pitchMm === 4000 && manual.rule.manual === true, 'a typed pitch is kept');
    const fenced = PV.groundLayout({ site, module: M, perRow: 3, stack: 1, rows: 4, tilt: 20, azimuth: 180, origin: [0, 0, 0], contains: (x, y) => y < 4000 });
    ok(fenced.tables.length === 2, 'a boundary keeps only the tables that lie inside it');
  }

  console.log('== shadows from the model');
  {
    const sky = { mode: 'clear' };
    const months = YD.skyYear(site, sky, { tz: -7 }), grid = YD.sunGridOf(months);
    const n = [0, 0, 1];
    const mod = (x, y) => ({ c: [x, y, 0], corners: [[x - 500, y - 800, 0], [x + 500, y - 800, 0], [x + 500, y + 800, 0], [x - 500, y + 800, 0]], row: 0, col: 0 });
    const wall = (h) => [-50000, -3000, 0, 50000, -3000, 0, 50000, -3000, h, -50000, -3000, 0, 50000, -3000, h, -50000, -3000, h];
    const withWall = SH.obstructions([{ owner: null, tris: wall(5000) }]), none = SH.obstructions([]);
    const a = SH.shadeGrid([mod(0, 0)], n, grid, withWall), b = SH.shadeGrid([mod(0, 0)], n, grid, none);
    const dec = a.frac[11][11], jun = a.frac[5][11];
    ok(dec === 1, 'a 5 m wall 3 m south: the winter noon sun (26°) is blocked — 100 % of the beam is shaded', String(dec));
    ok(jun === 0, 'the same wall at summer noon (73° high, 3 m × tan 73° = 9.9 m): no shade', String(jun));
    ok(b.frac.every((row) => row.every((f) => f === null || f === 0)), 'with nothing in the way, no hour is shaded');
    ok(a.frac[11][3] === null && a.frac[11][22] === null, 'where the sun is down there is no value (null), not "no shade"');
    ok(SH.blocked(withWall, [0, 0, 20], [0, -0.95, 0.3], null) === true && SH.blocked(withWall, [0, 0, 20], [0, 0.95, 0.3], null) === false, 'a ray south hits the wall, a ray north does not');
    const beam = months.map((d) => d.hours.map((x) => (x.sun ? x.dni * Math.max(0, x.sun.dir[2]) : 0)));
    ok(SH.beamLoss(a.frac, beam) > 0.05 && SH.beamLoss(b.frac, beam) === 0, 'the year\'s beam lost to the wall is weighted by the beam each hour would carry (> 5 %); none without it');
    // a wall behind the array (north) never shades it at 40° N except in the summer mornings and evenings
    const north = SH.obstructions([{ owner: null, tris: wall(5000).map((v, i) => (i % 3 === 1 ? 3000 : v)) }]);
    ok(SH.shadeGrid([mod(0, 0)], n, grid, north).frac[11][11] === 0, 'a wall to the north does not shade the noon sun');
    // inter-row shading: rows at the rule's pitch are clear at winter 11:30; at 60 % of it the back row is shaded
    const rule = PV.groundLayout({ site, module: M, perRow: 3, stack: 2, rows: 2, tilt: 30, azimuth: 180, origin: [0, 0, 0] });
    const tight = PV.groundLayout({ site, module: M, perRow: 3, stack: 2, rows: 2, tilt: 30, azimuth: 180, origin: [0, 0, 0], pitchMm: rule.pitchMm * 0.6 });
    const rows = (lay) => { const obs = SH.obstructions(lay.tables.map((t) => ({ owner: 'T:' + t.row, tris: SH.tableTris(t.corners) }))); return [0, 1].map((r) => SH.shadeGrid(lay.modules.filter((m) => m.table === r), lay.n, grid, obs, { owner: 'T:' + r }).frac[11][11]); };
    const [f0, f1] = rows(rule), [t0, t1] = rows(tight);
    ok(f0 === 0 && f1 === 0, 'rows at the winter-solstice pitch: neither row shades the other at 11:30', JSON.stringify([f0, f1]));
    ok(t0 === 0 && t1 > 0.2, 'rows at 60 % of that pitch: the front row is clear, the back row loses 20 %+ of its beam (' + Math.round(t1 * 100) + ' %)', JSON.stringify([t0, t1]));
  }

  console.log('== yield (worked by hand)');
  {
    ok(near(YD.cellTemperature(20, 800, 45), 45, 1e-9), 'NOCT: at 800 W/m² and 20 °C the cell is at the NOCT, 45 °C');
    ok(near(YD.cellTemperature(20, 1000, 45), 51.25, 1e-9) && near(YD.moduleDc(1000, 51.25, M), 363.25, 1e-9), 'at 1000 W/m² and 20 °C the cell is 51.25 °C and a 400 Wp module gives 400 × (1 − 0.0035 × 26.25) = 363.25 W');
    const sky = { mode: 'monthly', ghi: [2, 2.9, 4, 5, 5.9, 6.5, 6.3, 5.6, 4.5, 3.2, 2.1, 1.7] };
    const arr = (id, tilt, az, count = 10) => ({ id, name: id, module: M, modules: count, tilt, azimuth: az, normal: PV.planeNormal(tilt, az, site) });
    const T = [0, 2, 6, 10, 15, 20, 24, 23, 18, 12, 5, 1];
    const r = YD.yieldOf({ arrays: [arr('A', 30, 180)], site, sky, tAmb: T, tz: -7 });
    const a = r.arrays[0];
    ok(a.kwp === 4 && near(a.monthly.reduce((s, m) => s + m.acKwh, 0), a.annual.acKwh, 5), '10 × 400 Wp = 4.000 kWp; the months add up to the year');
    ok(a.annual.specificKwhKwp > 1150 && a.annual.specificKwhKwp < 1650 && a.annual.pr > 0.7 && a.annual.pr < 0.9, 'a south 30° array at 40° N on a 1,500 kWh/m²-year site: ' + a.annual.specificKwhKwp + ' kWh/kWp, PR ' + a.annual.pr + ' (inside 1150–1650 and 0.70–0.90)');
    const horiz = YD.yieldOf({ arrays: [arr('H', 0, 0)], site, sky, tAmb: T, tz: -7 }).arrays[0];
    ok(near(horiz.annual.poaFreeKwhM2, sky.ghi.reduce((s, h, i) => s + h * SUN.DAYS_IN_MONTH[i], 0), 3), 'on a flat plane the year\'s in-plane light is the typed global total (' + horiz.annual.poaFreeKwhM2 + ' kWh/m²)');
    ok(a.monthly[11].acKwh / horiz.monthly[11].acKwh > 1.3 && a.monthly[5].acKwh < horiz.monthly[5].acKwh * 1.05, 'tilting toward the sun helps most in December (> 30 % more) and little in June');
    const west = YD.yieldOf({ arrays: [arr('W', 30, 270)], site, sky, tAmb: T, tz: -7 }).arrays[0];
    ok(west.annual.acKwh < a.annual.acKwh * 0.92 && west.annual.acKwh > a.annual.acKwh * 0.7, 'the same array facing west gives 8–30 % less');
    const clear = YD.yieldOf({ arrays: [arr('C', 30, 180)], site, sky: { mode: 'clear' }, tAmb: T, tz: -7 });
    ok(clear.arrays[0].annual.acKwh > a.annual.acKwh && clear.notes.some((n) => n.key === 'pv.note.clear'), 'the clear-sky ceiling is above the typed-climate estimate, and says it is a ceiling');
    const sh = {}; sh.A = Array.from({ length: 12 }, () => new Array(24).fill(0.5));
    const half = YD.yieldOf({ arrays: [arr('A', 30, 180)], site, sky, tAmb: T, shade: sh, tz: -7 });
    ok(half.arrays[0].annual.acKwh < a.annual.acKwh && half.arrays[0].annual.shadeLossPct > 10 && half.arrays[0].annual.shadeLossPct < 45 && half.arrays[0].annual.beamLossPct === 50, 'half the beam shaded: the beam loss is 50 %, the light loss about 20–40 %, the energy falls with it', JSON.stringify(half.arrays[0].annual));
    const clip = YD.yieldOf({ arrays: [arr('A', 30, 180)], site, sky, tAmb: T, inverter: { pacKw: 2 }, tz: -7 });
    ok(clip.total.clippedKwh > 0 && clip.total.acKwh < a.annual.acKwh && clip.total.clippedPct > 0, 'a 2 kW inverter on a 4 kWp array clips ' + clip.total.clippedPct + ' % of the energy');
    ok(near(r.inputs.chain, 0.98 * 0.98 * 0.98 * 0.99 * 0.97, 1e-3), 'the loss chain shown is 0.98 × 0.98 × 0.98 × 0.99 × 0.97 (soiling, mismatch, wiring, availability, inverter) = ' + r.inputs.chain);
    ok(r.notes.some((n) => n.key === 'pv.note.starter'), 'starter values are called out in the notes');
    const prob = PR.yieldProblems(r);
    ok(prob.every((p) => p.source.name === 'bimcraft.pv') && prob.some((p) => p.code === 'note.starter' || p.code === 'note.diffuse'), 'the notes become Problems of the bimcraft.pv source');
  }

  console.log('== strings (worked by hand)');
  {
    const voc = 49.5 * (1 + -0.0028 * (-10 - 25));
    ok(near(ST.vocAt(M, -10), voc, 1e-9) && near(voc, 54.351, 1e-9), 'Voc at −10 °C = 49.5 × (1 − 0.0028 × (−35)) = 54.351 V');
    const w = ST.stringWindow(M, INV, { tMin: -10, tHot: 70, vSys: 1000 });
    ok(w.nMax === Math.floor(600 / 54.351) && w.nMax === 11, '600 V ÷ 54.351 V → at most 11 modules (the inverter\'s ceiling is lower than the 1000 V system limit)');
    ok(ST.stringWindow(M, INV, { tMin: -10, vSys: 1000, vocFactor: 1.25 }).nMax === 8, 'with a 1.25 safety factor on Voc: floor(600 / 67.94) = 8');
    ok(near(w.vmpHot, 41 * (1 - 0.003 * 45), 0.01) && w.nMin === Math.ceil(120 / (41 * (1 - 0.003 * 45))), 'hot Vmp = 41 × (1 − 0.003 × 45) = 35.47 V → at least 4 modules to reach the 120 V MPPT floor');
    const d20 = ST.designStrings({ modules: 20, module: M, inverter: INV });
    ok(d20.n === 10 && d20.count === 2 && d20.leftover === 0 && d20.mpptsUsed === 2, '20 modules: 2 strings of 10 (the longest that divides evenly), one on each MPPT input (13 A takes one 9.76 A string)');
    ok(d20.problems.some((p) => p.code === 'string.dcac.high') && near(d20.dcac, 1.6, 1e-9), '8 kWp on a 5 kW inverter is 1.6: over the typed 1.5 limit');
    const d12 = ST.designStrings({ modules: 12, module: M, inverter: INV });
    ok(d12.n === 6 && d12.count === 2, '12 modules cannot be 11 or 12 in series evenly: 2 strings of 6');
    const d13 = ST.designStrings({ modules: 13, module: M, inverter: INV });
    ok(d13.leftover > 0 && d13.problems.some((p) => p.code === 'string.uneven'), '13 modules leave some over: a note that says so', JSON.stringify([d13.n, d13.count, d13.leftover]));
    const big = ST.designStrings({ modules: 40, module: M, inverter: INV });
    ok(big.problems.some((p) => p.code === 'string.inputs' && p.severity === 'error') && !big.ok, '4 strings need more inputs than two MPPTs with one string each: an error');
    const hv = ST.designStrings({ modules: 10, module: M, inverter: { ...INV, vdcMax: 40 } });
    ok(hv.ok === false && hv.problems[0].code === 'string.voc', 'an inverter whose ceiling is below one module\'s cold voltage: string.voc error');
    const nostart = ST.designStrings({ modules: 3, module: M, inverter: INV });
    ok(nostart.problems.some((p) => p.code === 'string.mppt.low'), '3 modules in series do not reach the inverter\'s starting window: string.mppt.low');
    const text = PR.stringProblems(d20).map((p) => p.text).join(' | ');
    ok(/1\.6/.test(text) && PR.stringProblems(d20).every((p) => p.source.name === 'bimcraft.pv' && p.msg.key.startsWith('pv.')), 'the Problems carry the numbers in their words and the bimcraft.pv source');
  }

  console.log('== the one-line (worked by hand)');
  {
    ok(OL.nextOcpd(16.09) === 20 && OL.nextOcpd(20) === 20 && OL.nextOcpd(1e6) === null, 'the next standard fuse above 16.09 A is 20 A; none above 1e6 A');
    ok(OL.pickWire(16.09).size === '14 AWG' && OL.pickWire(26.04).size === '12 AWG' && OL.pickWire(16.09, OL.CODE_DEFAULTS.wire, 0.5).size === '10 AWG', 'wire from the typed table: 16.09 A on 14 AWG (25 A); 26.04 A needs 12 AWG; with a 0.5 derate 16.09 A needs 10 AWG (40 × 0.5 = 20 A)');
    const plan = { name: 'House PV', module: M, inverter: INV, inverters: 1, arrays: [{ id: 'A', name: 'South <roof> & "back"', modules: 20, strings: { n: 10, count: 2 }, inverter: 0 }, { id: 'B', name: 'East', modules: 15, strings: { n: 5, count: 3 }, inverter: 0 }] };
    const d = OL.buildOneline(plan);
    const kinds = d.nodes.map((n) => n.kind);
    ok(['pv-array', 'combiner', 'disconnect', 'inverter', 'panel', 'utility'].every((k) => kinds.includes(k)), 'array → (combiner) → DC disconnect → inverter → AC disconnect → panel → utility are all there');
    ok(d.nodes.filter((n) => n.kind === 'combiner').length === 1, 'three strings or more get a combiner; two do not (fuseFromStrings = 3)');
    const e1 = d.edges.find((e) => e.from === d.nodes[0].id);
    ok(near(e1.required, 2 * 10.3 * 1.5625, 0.06) && e1.ocpd === 35 && e1.wire === '10 AWG', 'two strings, no combiner: Isc 20.6 A × 1.5625 = 32.2 A → 35 A fuse, 10 AWG (40 A)', JSON.stringify(e1));
    const ac = d.edges.find((e) => e.circuit === 'ac' && e.label === '240 V 1-phase');
    ok(near(ac.current, 5000 / 240, 0.06) && near(ac.required, 5000 / 240 * 1.25, 0.06) && ac.ocpd === 30 && ac.wire === '12 AWG', '5 kW at 240 V = 20.83 A; × 1.25 = 26.04 A → 30 A breaker, 12 AWG', JSON.stringify(ac));
    const svg = OL.onelineSvg(d);
    ok(svg.startsWith('<svg') && svg.endsWith('</svg>') && svg.includes('South &lt;roof&gt; &amp; &quot;back&quot;') && !svg.includes('<roof>'), 'the SVG is one element and the array\'s name is escaped');
    const out = OL.pvOnelineForElectrical(plan);
    ok(out.format === 'cadcraft-pv-oneline' && out.version === 1 && out.nodes.every((n) => typeof n.col === 'number' && typeof n.row === 'number' && n.symbol) && out.edges.every((e) => out.nodes.some((n) => n.id === e.from) && out.nodes.some((n) => n.id === e.to)), 'the hand-off for the Electrical add-on: plain nodes with symbol and grid place, edges between known nodes');
    ok(JSON.stringify(out) === JSON.stringify(JSON.parse(JSON.stringify(out))), 'and it is plain JSON');
    const over = OL.buildOneline({ ...plan, code: { wire: [{ size: '14 AWG', amps: 5 }], ocpd: [10] } });
    ok(over.edges.some((e) => e.over) && PR.onelineProblems(over).some((p) => p.code === 'oneline.over' && p.severity === 'error'), 'a current beyond the typed tables: marked over and raised as an error');
    ok(PR.onelineProblems(d).some((p) => p.code === 'note.code'), 'the "not a compliance statement" note always comes with a one-line');
  }

  await onModel({ APP, ROOT, WebIFC, IfcModel, quiet, ok, near, imp, PV, SUN, YD, ST, OL, PR, site, M, INV });
  console.log('\n' + good + ' passed, ' + bad + ' failed');
  return bad ? 1 : 0;
}

// ------------------------------------------------------------------------------------------------ on a model
async function onModel(c) {
  const { APP, ROOT, WebIFC, IfcModel, quiet, ok, near, imp, PV, site, M } = c;
  const { ModelWriter } = await imp('model-write.js'), { IfcEditor } = await imp('ifc-edit.js'), OPS = await imp('model-ops.js'), NM = await imp('new-model.js'), CALC = await imp('pv-calc.js');
  for (const schema of ['IFC4', 'IFC2X3']) {
    console.log('== on a ' + schema + ' model');
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    const bytes0 = schema === 'IFC2X3' ? fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures/ios-steel-ifc2x3.ifc'))
      : new TextEncoder().encode(NM.newBuilding({ name: 'PV', levels: NM.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'p.ifc', now: new Date('2026-10-28T12:00:00Z') }));
    await quiet((x) => eng.load(x))(bytes0);
    const ed = new IfcEditor(WebIFC, eng), w = () => new ModelWriter(WebIFC, ed.api, ed.mid);
    const levels = OPS.snapshotModel(ed).levels, lvl = levels[0].guid, top = (levels[1] || levels[0]).guid;
    const go = (op, label) => ed.modelChange(op, { label });
    let faces = null;
    if (schema === 'IFC4') {
      const P = [[0, 0], [12000, 0], [12000, 8000], [0, 8000]];
      go(OPS.drawWalls({ storey: lvl, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: top }), 'walls');
      go(OPS.placeRoof({ storey: lvl, seed: [6000, 4000], pitch: Math.atan(10 / 12) * 180 / Math.PI, overhang: 300, edges: '' }), 'roof');
      const f = CALC.modelFaces(w(), site);
      faces = f.faces;
      const south = faces.find((x) => near(x.azimuth, 180, 1) && x.tilt > 30), north = faces.find((x) => x.azimuth !== null && (x.azimuth < 1 || x.azimuth > 359));
      ok(f.ok && south && near(south.tilt, Math.atan(10 / 12) * 180 / Math.PI, 0.3) && north && near(north.tilt, south.tilt, 0.3), 'the 12 × 8 m house\'s hip roof: a south face and a north face at 10/12 (' + (south && south.tilt) + '°), found from the saved triangles', JSON.stringify(faces.map((x) => [x.id, x.tilt, x.azimuth, x.areaM2])));
      ok(faces.filter((x) => !x.flat && x.tilt > 30).length >= 4, 'and the east and west hips: at least four pitched faces');
      const plan = CALC.planRoofArray(w(), { site, face: south.id, orient: 'portrait', setback: 300, gap: 20 });
      ok(plan.ok && plan.array.modules.length > 6 && near(plan.array.tilt, south.tilt, 0.01) && near(plan.array.azimuth, 180, 1), 'planRoofArray fits modules on the south face: ' + (plan.array && plan.array.modules.length) + ' modules, kWp ' + (plan.array && plan.array.kwp));
      const n0 = ed.changes.length;
      go(CALC.placeArray({ array: plan.array, storey: top }), 'Add PV array');
      ok(ed.changes.length === n0 + 1, 'placing an array is ONE undo step');
      const back = CALC.readArrays(w());
      const text = new TextDecoder().decode(ed.save());
      ok(back.length === 1 && back[0].modules.length === plan.array.modules.length && near(back[0].kwp, plan.array.kwp, 1e-9) && back[0].module.id === 'starter-400' && /IFCSOLARDEVICE\(/.test(text) && /\.SOLARPANEL\./.test(text) && /CadCraft_PvArray/.test(text), 'the array is saved as an IfcSolarDevice (SOLARPANEL) with CadCraft_PvArray and read back with every module');
      // the model without the PV device still gives the same faces (the device is not a roof, not an obstruction)
      const faces2 = CALC.modelFaces(w(), site).faces;
      ok(faces2.length === faces.length, 'the placed modules are not taken for roof faces');
      const eng2 = await quiet(IfcModel.create)(WebIFC, null);
      await quiet((x) => eng2.load(x))(ed.save());
      const ed2 = new IfcEditor(WebIFC, eng2);
      ok(CALC.readArrays(new ModelWriter(WebIFC, ed2.api, ed2.mid)).length === 1, 'saved and reopened: the array is still there');
      // yield on the model: shading from the house's own triangles
      const y = CALC.calcYield(w(), { site, sky: { mode: 'monthly', ghi: [2, 2.9, 4, 5, 5.9, 6.5, 6.3, 5.6, 4.5, 3.2, 2.1, 1.7] }, tAmb: [0, 2, 6, 10, 15, 20, 24, 23, 18, 12, 5, 1] });
      ok(y.ok && y.res.total.acKwh > 3000 && y.res.total.specificKwhKwp > 900 && y.res.total.specificKwhKwp < 1700 && y.res.arrays[0].annual.shadeLossPct < 8, 'calcYield on the model: ' + (y.res && y.res.total.acKwh) + ' kWh, ' + (y.res && y.res.total.specificKwhKwp) + ' kWh/kWp, shade loss ' + (y.res && y.res.arrays[0].annual.shadeLossPct) + ' %');
      // a chimney-like block just south of the array shades it
      const tall = CALC.calcYield(w(), { site, shading: true, sky: { mode: 'clear' }, tris: [...(CALC.modelTriangles(w())), { id: 0, cls: 'X', roof: false, tris: [-20000, -2500, 0, 30000, -2500, 0, 30000, -2500, 12000, -20000, -2500, 0, 30000, -2500, 12000, -20000, -2500, 12000] }] });
      const free = CALC.calcYield(w(), { site, shading: false, sky: { mode: 'clear' } });
      ok(tall.res.arrays[0].annual.shadeLossPct > free.res.arrays[0].annual.shadeLossPct + 5 && tall.problems.some((p) => p.code === 'array.shade'), 'a 12 m wall 2.5 m south of the house: the shade loss rises by 5+ points and a Problem says so (' + tall.res.arrays[0].annual.shadeLossPct + ' %)');
      const st = CALC.calcStrings(w(), { inverter: c.INV });
      ok(st.ok && st.design.n * st.design.count + st.design.leftover === back[0].modules.length, 'calcStrings reads the module count from the model\'s arrays');
      const ol = CALC.calcOneline(w(), { inverter: c.INV });
      ok(ol.ok && ol.svg.startsWith('<svg') && ol.diagram.nodes.some((n) => n.kind === 'pv-array'), 'calcOneline makes the diagram from the model\'s arrays');
      ed.undo();
      ok(CALC.readArrays(w()).length === 0, 'ONE Undo takes the array and all its modules away');
      ed.redo();
      ok(CALC.readArrays(w()).length === 1 && CALC.readArrays(w())[0].guid === back[0].guid, 'Redo makes the same array again, with the same GlobalId');
      go(CALC.removeArrays([back[0].guid]), 'Remove');
      ok(CALC.readArrays(w()).length === 0 && !/IFCSOLARDEVICE\(/.test(new TextDecoder().decode(ed.save())), 'removeArrays deletes the device and its geometry');
      ok(CALC.calcYield(w(), { site }).key === 'pv.err.noarray', 'a yield with no array in the model says so');
      ok(CALC.calcYield(w(), {}).key === 'pv.err.nosite', 'a model with no site latitude and longitude asks for them');

      // ---------------------------------------------------------------------------- the assistant tools
      const AG = await imp('pv-agents.js'), CT = await import(path.join(ROOT, 'tools/mcp/contract.mjs'));
      const env = { ed: () => ed, apply: async (label, op) => ed.modelChange(op, { label: 'Assistant: ' + label }) };
      const tools = AG.pvTools(env), T = Object.fromEntries(tools.map((x) => [x.name, x]));
      const checks = tools.map((x) => [x.name, CT.checkTool(x, { app: 'bimcraft' })]);
      ok(checks.every(([, r]) => !r.errors.length), 'the contract checker finds no error in the ' + tools.length + ' tools', checks.filter(([, r]) => r.errors.length).map(([n, r]) => n + ': ' + r.errors.join('; ')).join(' | '));
      ok(checks.every(([, r]) => !r.warnings.length), 'and no warning', checks.filter(([, r]) => r.warnings.length).map(([n, r]) => n + ': ' + r.warnings.join('; ')).join(' | '));
      ok(tools.filter((x) => x.group === 'edit').every((x) => x.rollbackPreview) && tools.filter((x) => x.group === 'read').every((x) => x.untrusted), 'every edit has a preview and every read is marked as content');
      let err = null; try { T.pv_arrays_check.run({}); } catch (e) { err = e; }
      ok(err?.code === 'invalid_argument' && err.next.length, 'pv_arrays_check on a model with no site: invalid_argument and how to give one');
      const SITE = { lat: 40, lon: -105 };
      const ck = T.pv_arrays_check.run({ site: SITE });
      ok(ck.faces.length >= 4 && ck.arrays.length === 0 && ck.faces[0].areaM2 >= ck.faces.at(-1).areaM2, 'pv_arrays_check: the roof faces (biggest first) and no arrays yet');
      const faceId = ck.faces.find((f) => f.azimuthDeg !== null && Math.abs(f.azimuthDeg - 180) < 1).id;
      err = null; try { await T.pv_array_add.run({ level: top, mount: 'roof', site: SITE }); } catch (e) { err = e; }
      ok(err?.code === 'invalid_argument', 'pv_array_add on a roof with no face: invalid_argument');
      err = null; try { await T.pv_array_add.run({ level: top, mount: 'roof', site: SITE, face: 'F99' }); } catch (e) { err = e; }
      ok(err?.code === 'not_found' && err.next.length, 'pv_array_add with a face that is not there: not_found, with what to try');
      err = null; try { await T.pv_array_add.run({ level: 'nope', mount: 'ground', site: SITE }); } catch (e) { err = e; }
      ok(err?.code === 'not_found', 'pv_array_add on a level that is not there: not_found');
      err = null; try { await T.pv_array_add.run({ level: top, mount: 'ground', site: SITE, module: { wp: 400, voc: 40, vmp: 45, isc: 10, imp: 9, lengthMm: 1700, widthMm: 1100 } }); } catch (e) { err = e; }
      ok(err?.code === 'invalid_argument' && /Vmp/.test(err.message), 'a module whose Vmp is above its Voc is refused with the reason');
      const m0 = ed.changes.length;
      const add = await T.pv_array_add.run({ level: top, mount: 'roof', site: SITE, face: faceId, orientation: 'portrait' });
      ok(add.modules > 6 && add.guid && ed.changes.length === m0 + 1 && add.kwp === Math.round(add.modules * 0.4 * 100) / 100, 'pv_array_add on the south face: ' + add.modules + ' modules, ' + add.kwp + ' kWp, one undo step');
      const gr = await T.pv_array_add.run({ level: lvl, mount: 'ground', site: SITE, origin: [20000, 0, 0], rows: 2, modulesPerRow: 6, modulesHigh: 2, tiltDeg: 25, azimuthDeg: 180 });
      ok(gr.modules === 24 && JSON.stringify(T.pv_arrays_check.run({ site: SITE }).arrays.map((a) => a.mount)) === '["roof","ground"]', 'pv_array_add on the ground: 2 rows of 6 × 2 = 24 modules; both arrays are listed');
      const sky = { mode: 'monthly', ghiKwhPerDay: [2, 2.9, 4, 5, 5.9, 6.5, 6.3, 5.6, 4.5, 3.2, 2.1, 1.7] };
      const ye = T.pv_yield_estimate.run({ site: SITE, sky, airTempC: [0, 2, 6, 10, 15, 20, 24, 23, 18, 12, 5, 1] });
      ok(ye.arrays.length === 2 && ye.total.acKwhPerYear > 8000 && ye.total.specificKwhPerKwp > 1000 && ye.total.specificKwhPerKwp < 1700 && ye.total.acKwhByMonth.length === 12 && ye.notes.length >= 3, 'pv_yield_estimate: both arrays, ' + ye.total.acKwhPerYear + ' kWh a year (' + ye.total.specificKwhPerKwp + ' kWh/kWp), with the notes');
      ok(JSON.stringify(ye).length < 64000, 'and the answer is well under 64 KB');
      const ground = ye.arrays.find((x) => x.name !== ye.arrays[0].name) || ye.arrays[1];
      ok(ground.annual.shadeLossPct < 6, 'the ground rows at the winter-solstice pitch lose under 6 % to each other (' + ground.annual.shadeLossPct + ' %)');
      err = null; try { T.pv_yield_estimate.run({ site: SITE, sky: { mode: 'monthly' } }); } catch (e) { err = e; }
      ok(err?.code === 'invalid_argument' && err.next.length, 'pv_yield_estimate with a monthly sky and no numbers: invalid_argument and what to give');
      err = null; try { T.pv_yield_estimate.run({ site: SITE, airTempC: [1, 2, 3] }); } catch (e) { err = e; }
      ok(err?.code === 'invalid_argument', 'three temperatures: refused');
      const sct = T.pv_strings_check.run({ coldestC: -10 });
      ok(sct.modulesPerString >= 4 && sct.strings >= 1 && sct.window.maxModules === 11 && sct.checks.length >= 4 && sct.notes.includes('pv.note.starter'), 'pv_strings_check on the model\'s modules: ' + sct.modulesPerString + ' × ' + sct.strings + ' strings, window 4–11, the starter note');
      const olt = T.pv_oneline_make.run({ svg: true, acVoltage: 240 });
      ok(olt.nodes.some((n) => n.kind === 'inverter') && olt.svg.startsWith('<svg') && olt.edges.every((e) => e.wire) && olt.edges.filter((e) => e.ocpd).length === olt.edges.length - 1, 'pv_oneline_make: nodes, a wire on every edge and a fuse on all but the service line, and the drawing');
      const dl = await T.pv_array_delete.run({ arrays: [add.guid] });
      ok(dl.deleted === 1 && CALC.readArrays(w()).length === 1, 'pv_array_delete removes the roof array');
      err = null; try { await T.pv_array_delete.run({ arrays: ['nope'] }); } catch (e) { err = e; }
      ok(err?.code === 'not_found', 'deleting an array that is not there: not_found');

      // ---------------------------------------------------------------------------- the pane on a stand-in DOM
      {
        class Node { constructor(tag, doc) { this.tag = tag; this.ownerDocument = doc; this.children = []; this.attrs = {}; this.listeners = {}; this.className = ''; this._text = ''; this.value = ''; }
          setAttribute(k, v) { this.attrs[k] = v; } getAttribute(k) { return this.attrs[k]; } addEventListener(ev, fn) { (this.listeners[ev] ||= []).push(fn); }
          append(...k) { for (const c of k) this.children.push(typeof c === 'string' ? { text: c } : c); } replaceChildren(...k) { this.children = []; this.append(...k); }
          set textContent(v) { this.children = [{ text: String(v) }]; } get textContent() { return this.children.map((c) => (c.text !== undefined ? c.text : c.textContent)).join(''); } }
        const doc = { createElement: (tag) => new Node(tag, doc) };
        const pane = new Node('div', doc);
        const find = (n, pred, out = []) => { if (n.attrs && pred(n)) out.push(n); for (const c of n.children || []) if (c.attrs) find(c, pred, out); return out; };
        const click = async (n) => { for (const fn of n.listeners.click || []) await fn({}); await new Promise((r) => setTimeout(r, 0)); };
        const UI = await imp('pv-ui.js');
        const posted = [], saved = [];
        const ui = UI.mountPv(pane, { w: () => w(), apply: async (label, op) => ed.modelChange(op, { label }), storey: () => top, save: (n, t) => saved.push([n, t]), problems: { source: () => ({ set: (l) => posted.push(l) }) } });
        ok(find(pane, (n) => n.attrs['data-pv-tab']).length === 4, 'the pane has four tabs: arrays, yield, strings, one-line');
        ok(find(pane, (n) => n.attrs['data-pv-field'] === 'site.lat').length === 1, 'a model with no site shows latitude and longitude boxes');
        await click(find(pane, (n) => n.attrs['data-pv-check'] === 'arrays')[0]);
        ok(/pv\.err\.nosite|latitude|site/i.test(pane.textContent), 'Check without a site says what is missing');
        ui.state.site.lat = '40'; ui.state.site.lon = '-105';
        await click(find(pane, (n) => n.attrs['data-pv-check'] === 'arrays')[0]);
        ok(ui.state.faces.length >= 4 && find(pane, (n) => n.attrs['data-pv-table'] === 'arrays').length === 1, 'with a site: the roof faces are listed and the existing array\'s table is drawn');
        ui.state.arrays.face = ui.state.faces.find((f) => f.azimuth !== null && Math.abs(f.azimuth - 180) < 1).id;
        const nBefore = CALC.readArrays(w()).length, ch0 = ed.changes.length;
        await click(find(pane, (n) => n.attrs['data-pv-place'] === 'roof')[0]);
        ok(CALC.readArrays(w()).length === nBefore + 1 && ed.changes.length === ch0 + 1, 'Place in the model: one undo step, one more array');
        ui.state.yield.sky = 'monthly';
        ui.show('yield');
        {
          // dec-eg_PART_3: climate from a data source — only on a button, cached, with the clear-sky fallback
          const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'], gg = [2, 2.9, 4, 5, 5.9, 6.5, 6.3, 5.6, 4.5, 3.2, 2.1, 1.7];
          const answer = { properties: { parameter: { ALLSKY_SFC_SW_DWN: Object.fromEntries(MON.map((m, k) => [m, gg[k]])), T2M: Object.fromEntries(MON.map((m, k) => [m, 10 + k])) } } };
          const realFetch = globalThis.fetch; let urls = [];
          globalThis.fetch = async (u) => { urls.push(u); return { ok: true, json: async () => answer }; };
          ui.show('yield');
          ok(urls.length === 0, 'opening the Yield tab sends nothing');
          await click(find(pane, (n) => n.attrs['data-pv-climate'] === 'nasa')[0]);
          ok(urls.length === 1 && /power\.larc\.nasa\.gov/.test(urls[0]) && ui.state.yield.sky === 'monthly' && ui.state.yield.ghi.startsWith('2, 2.9') && /NASA POWER/.test(pane.textContent), 'Fetch from NASA POWER: one request when the button is pressed; the monthly boxes are filled; the source is said');
          globalThis.fetch = async () => { throw new Error('offline'); };
          ui.state.site.lat = '10'; ui.state.site.lon = '10';
          await click(find(pane, (n) => n.attrs['data-pv-climate'] === 'nasa')[0]);
          ok(ui.state.yield.sky === 'clear' && /clear-sky ceiling/.test(pane.textContent), 'Offline with nothing cached: the clear-sky ceiling is used and the pane says so');
          globalThis.fetch = realFetch;
          // EG.15 (bim-analysis_PART_4): PVGIS does not let a page read its answer (CORS, measured with browser-pvclimate.mjs), so there is no fetch button for it: a link and a paste box
          ui.show('yield');
          ok(find(pane, (n) => n.attrs['data-pv-climate'] === 'pvgis').length === 0, 'no PVGIS fetch button: the browser would refuse the answer');
          const link = find(pane, (n) => n.attrs['data-pv-climate-link'] === 'pvgis')[0];
          ok(link && /^https:\/\/re\.jrc\.ec\.europa\.eu\/api\/v5_2\/MRcalc\?lat=10\.000&lon=10\.000/.test(link.attrs.href) && link.attrs.rel === 'noopener noreferrer', 'a link opens the PVGIS monthly answer for this site in a tab');
          const pv = { outputs: { monthly: Array.from({ length: 12 }, (_, m) => ({ year: 2020, month: m + 1, 'H(h)_m': (2 + m % 6) * 30, T2m: 5 + m })) } };
          ui.state.climatePaste = JSON.stringify(pv);
          await click(find(pane, (n) => n.attrs['data-pv-climate-file'] !== undefined)[0]);
          ok(ui.state.yield.sky === 'monthly' && /PVGIS/.test(pane.textContent) && ui.state.yield.ghi.split(',').length === 12, 'a PVGIS answer pasted as it came fills the twelve months');
          ui.state.site.lat = '40'; ui.state.site.lon = '-105'; ui.state.site.lon = '-105';
          ui.state.climatePaste = JSON.stringify({ format: 'cadcraft-data-pack', version: 1, kind: 'climate', id: 'mine', name: 'My station', source: { name: 'My own weather file' }, data: { ghi: gg, tAmb: gg.map((x) => x * 4) } });
          await click(find(pane, (n) => n.attrs['data-pv-climate-file'] !== undefined)[0]);
          ok(ui.state.yield.sky === 'monthly' && /My own weather file/.test(pane.textContent), 'Load a climate file: a data pack fills the monthly boxes and names its source');
          ui.state.yield.sky = 'monthly';
        }
        await click(find(pane, (n) => n.attrs['data-pv-check'] === 'yield')[0]);
        ok(find(pane, (n) => n.attrs['data-pv-table'] === 'yield').length === 1 && /kWh per kWp/.test(pane.textContent) && posted.length >= 2, 'Yield: the monthly table, the year\'s line and the Problems posted to the shell');
        ok(find(pane, (n) => n.attrs['data-pv-problems'] !== undefined).length === 1 && /starter|ceiling|diffuse/i.test(pane.textContent), 'the notes are listed');
        ui.show('strings');
        await click(find(pane, (n) => n.attrs['data-pv-check'] === 'strings')[0]);
        ok(find(pane, (n) => n.attrs['data-pv-strings'] !== undefined).length === 1 && find(pane, (n) => n.attrs['data-pv-table'] === 'strings').length === 1, 'Strings: the result line and the checks table');
        ui.show('oneline');
        await click(find(pane, (n) => n.attrs['data-pv-check'] === 'oneline')[0]);
        const holder = find(pane, (n) => n.attrs['data-pv-svg'] !== undefined)[0];
        ok(holder && String(holder.innerHTML).startsWith('<svg'), 'One-line: the drawing is in the pane');
        await click(find(pane, (n) => n.attrs['data-pv-save'] === 'json')[0]);
        const out = JSON.parse(saved.at(-1)[1]);
        ok(saved.at(-1)[0] === 'pv-oneline.json' && out.format === 'cadcraft-pv-oneline', 'Save data writes the hand-off for the Electrical add-on');
        ui.show('arrays');
        ui.state.csv = 'id,wp\n1,2';
        await click(find(pane, (n) => n.attrs['data-pv-modules'] === 'apply')[0]);
        ok(/pv\.err\.module|not valid|columns/i.test(pane.textContent) && ui.state.modules.length === 1, 'a module table without the needed columns is refused and the old table kept');
      }
    } else {
      const g = CALC.planGroundArray(w(), { site, perRow: 4, stack: 2, rows: 2, tilt: 25, azimuth: 180, origin: [2000, 2000, 0] });
      ok(g.ok && g.array.modules.length === 16, 'a ground array of 2 rows × 4 × 2 modules: 16');
      go(CALC.placeArray({ array: g.array, storey: lvl }), 'Add PV array');
      const text = new TextDecoder().decode(ed.save());
      ok(CALC.readArrays(w()).length === 1 && CALC.readArrays(w())[0].tables.length === 2 && /IFCBUILDINGELEMENTPROXY\(/.test(text) && !/IFCSOLARDEVICE\(/.test(text), 'IFC2X3 has no IfcSolarDevice: the array is an IfcBuildingElementProxy that carries the same CadCraft_PvArray');
      const y = CALC.calcYield(w(), { site, sky: { mode: 'clear' } });
      ok(y.ok && y.res.arrays[0].annual.acKwh > 0, 'the yield reads it back');
      ed.undo();
      ok(CALC.readArrays(w()).length === 0, 'one Undo');
    }
  }
}
