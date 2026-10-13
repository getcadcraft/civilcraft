#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-parcels.mjs — CivilCraft 0.4 V21: parcels (parcels.js), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-parcels.mjs [--build dev|x.y] [--verbose]
 *
 * By hand: bearings in every quadrant and as azimuths; a 100 × 200 rectangle from deed calls closes (area 20,000 sq ft,
 * 0.459 ac); the same calls 0.05 ft short misclose by 0.05 ft west, 1 in 12,001; a tangent 90° curve to the right of
 * radius 100 ends at (100, 200); a non-tangent curve by its chord bearing; a curve by its central angle; a 100 ft square
 * with a semicircle on its top side = 10,000 + π·50²/2 = 13,926.99 sq ft; the legal description's courses, curve and area;
 * plan labels reading from the left, outside the parcel; untrusted parcels; the project file.
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
const PC = await mod('parcels.js');
const PJ = await mod('project.js');
const SC = await mod('scene.js');
const PL = await mod('plot.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const deg = (r) => ((((r * 180) / Math.PI) % 360) + 360) % 360;

section('bearings');
{
  near(deg(PC.parseBearing('N 45°30\'15" E')), 90 - (45 + 30 / 60 + 15 / 3600), 1e-9, 'N 45°30\'15" E');
  near(deg(PC.parseBearing('N45-30-15E')), 44.495833333, 1e-6, 'N45-30-15E');
  near(deg(PC.parseBearing('S 30 00 00 W')), 240, 1e-9, 'S 30 W = azimuth 210');
  near(deg(PC.parseBearing('S 30.5 E')), 300.5, 1e-9, 'S 30.5 E = azimuth 149.5');
  near(deg(PC.parseBearing('N 10 W')), 100, 1e-9, 'N 10 W = azimuth 350');
  near(deg(PC.parseBearing('N 0 E')), 90, 1e-9, 'due north');
  near(deg(PC.parseBearing('AZ 270')), 180, 1e-9, 'AZ 270 = due west');
  near(deg(PC.parseBearing('az 123°45\'00"')), 360 - 33.75, 1e-9, 'AZ 123°45\'');
  ok(['N 95 E', 'N 45 61 E', 'N 45.5 30 E', 'X 45 E', '', 'AZ 400', 'N E'].every((s) => PC.parseBearing(s) === null), 'refused: over 90°, 61 minutes, decimal degrees with minutes, no quadrant, empty, azimuth over 360');
}

section('deed calls and closure');
{
  const r = PC.parseCalls('N 0 E 200\nthence N 90°00\'00" E, 100.00 feet;\nS 0 E 200\n# a comment\nS 90 W 100');
  ok(!r.errors.length && r.calls.length === 4, 'four calls read (thence, commas, feet, a comment line)');
  const run = PC.runCalls({ x: 1000, y: 5000 }, r.calls);
  near(run.misclosure.dist, 0, 1e-9, 'the rectangle closes');
  ok(run.precision === Infinity, 'precision: exact');
  const pts = run.pts.slice(0, -1);
  near(PC.parcelArea(pts), 20000, 1e-6, 'area 20,000 sq ft'); near(PC.perimeter(pts), 600, 1e-9, 'perimeter 600 ft');
  const short = PC.runCalls({ x: 0, y: 0 }, PC.parseCalls('N 0 E 200\nN 90 E 100\nS 0 E 200\nS 90 W 99.95').calls);
  near(short.misclosure.dist, 0.05, 1e-9, 'short by 0.05 ft: misclosure 0.05');
  near(deg(short.misclosure.dir), 0, 1e-6, 'the calls end 0.05 ft east of the start (the last course fell short)');
  near(short.precision, 599.95 / 0.05, 1e-6, 'precision 1 in 11,999');
  const cv = PC.runCalls({ x: 0, y: 0 }, PC.parseCalls('N 0 E 100\nC R 100 L ' + (Math.PI * 50) + ' right').calls);
  near(cv.pts[2].x, 100, 1e-9, 'a tangent curve to the right, R 100, 90°: ends at x 100'); near(cv.pts[2].y, 200, 1e-9, 'and y 200');
  near(cv.pts[1].b, -Math.tan(Math.PI / 8), 1e-12, 'its bulge: −tan(Δ/4)');
  near(cv.length, 100 + Math.PI * 50, 1e-9, 'length along the calls includes the arc');
  const cb = PC.runCalls({ x: 0, y: 0 }, PC.parseCalls('N 90 E 50\nC R 100 D 60-00-00 left CB N 0 E').calls);
  near(cb.pts[2].x, 50, 1e-9, 'a non-tangent curve by its chord bearing (N): x stays 50'); near(cb.pts[2].y, 100, 1e-9, 'chord 2·100·sin 30° = 100');
  const d = PC.parseCalls('C R 300 D 10°00\'00" right');
  near(d.calls[0].delta, Math.PI / 18, 1e-12, 'a curve by its central angle (10°)');
  const bad = PC.parseCalls('N 45 E\nN 95 E 10\nC R 100 L 10\nC L 10 left\nN 45 E 0\nhello');
  ok(bad.errors.length === 6 && bad.errors.map((e) => e.line).join() === '1,2,3,4,5,6', 'six bad lines, each said with its line number');
  ok(/turns/.test(bad.errors[2].msg) && /radius/.test(bad.errors[3].msg), 'the reasons: no turn, no radius');
}

const sq = { id: 'r1', name: 'Lot 1', pts: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100, b: 1 }, { x: 0, y: 100 }] };
section('areas with curves');
{
  near(PC.parcelArea(sq.pts), 10000 + (Math.PI * 2500) / 2, 1e-6, 'a 100 ft square with a semicircle on top: 13,926.99 sq ft');
  near(PC.perimeter(sq.pts), 300 + Math.PI * 50, 1e-9, 'perimeter 300 + 157.08');
  // the same outline the other way round: the corners reversed, each bulge moved to the other end of its course, sign flipped
  const n = sq.pts.length, rev = sq.pts.map((_, i) => { const p = sq.pts[n - 1 - i], from = sq.pts[(2 * n - 2 - i) % n]; return { x: p.x, y: p.y, ...(from.b ? { b: -from.b } : {}) }; });
  near(PC.parcelArea(rev), PC.parcelArea(sq.pts), 1e-9, 'the same area the other way round');
  const c = PC.courses(sq.pts)[2];
  ok(c.kind === 'curve' && Math.abs(c.R - 50) < 1e-12 && Math.abs(c.delta - Math.PI) < 1e-12 && c.turn === 1, 'its third course: a curve to the left, R 50, Δ 180°');
  near(c.c.x, 50, 1e-9, 'centre x 50'); near(c.c.y, 100, 1e-9, 'centre y 100');
}

section('the legal description');
{
  const txt = PC.legalDescription(sq, { units: 'ft' });
  ok(txt.startsWith('Lot 1\n\nBeginning at a point at northing 0.000, easting 0.000, the point of beginning;'), 'name, then the point of beginning with its coordinates');
  ok(txt.includes('thence N 90°00\'00" E, a distance of 100.00 feet;'), 'a line call: bearing and distance');
  ok(txt.includes('thence along a curve to the left, having a radius of 50.00 feet, an arc length of 157.08 feet, a central angle of 180°00\'00", and a chord bearing and distance of S 90°00\'00" W, 100.00 feet;'), 'the curve: radius, arc length, central angle, chord bearing and distance');
  ok(/thence S 0°00'00" E, a distance of 100\.00 feet to the point of beginning\.\n/.test(txt), 'the last call closes to the point of beginning');
  ok(txt.endsWith('Containing 13,927 square feet (0.320 acres), more or less.'), 'containing 13,927 sq ft (0.320 ac)');
  const m = PC.legalDescription({ name: 'Lot 2', pts: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }] }, { units: 'm', pob: 'the north-east corner of Lot 1' });
  ok(m.includes('Beginning at the north-east corner of Lot 1;') && m.includes('a distance of 100.00 meters') && m.endsWith('Containing 10,000 square meters (1.0000 hectares), more or less.'), 'metric: meters, square meters and hectares; a point of beginning in words');
}

section('plan labels');
{
  const items = PC.parcelLabels(sq, { units: 'ft', unitPerMm: 1 });
  const geo = items.filter((i) => i.layer === 'V-PROP'), txt = items.filter((i) => i.layer === 'V-PROP-TEXT');
  ok(geo.length === 4 && geo.filter((i) => i.kind === 'arc').length === 1 && txt.length === 6, 'four courses (one arc), four course labels and the name and area');
  const bottom = txt.find((i) => /^N 90°00'00" E {2}100\.00'$/.test(i.text));
  ok(bottom && bottom.y < 0 && Math.abs(bottom.rot) < 1e-12, 'the bottom course: "N 90°00\'00" E  100.00\'", below the line (outside), reading left to right');
  const left = txt.find((i) => /^S 0°00'00" E/.test(i.text));
  ok(left && left.x < 0 && Math.abs(left.rot - Math.PI / 2) < 1e-12, 'the left side: outside (west), turned to read from below');
  ok(txt.some((i) => /^R=50\.00' {2}L=157\.08' {2}Delta=180°00'00"$/.test(i.text) && i.y > 150), 'the curve: R, L and Delta beyond its top');
  ok(txt.some((i) => i.text === 'Lot 1') && txt.some((i) => i.text === '13,927 sq ft  0.320 ac'), 'name and area at the middle');
  const arc = geo.find((i) => i.kind === 'arc');
  near(arc.r, 50, 1e-12, 'the arc item: radius 50'); ok(Math.abs(arc.a0) < 1e-9 && Math.abs(arc.a1 - Math.PI) < 1e-9, 'from 0 to 180° counter-clockwise');
}

section('in the PDF plot');
{
  const scale = PL.scalesFor('ft').find((x) => x.label === `1" = 40'`);
  const scene = SC.planScene({ units: 'ft', alignments: [] }, { mmPerUnit: scale.mmPerUnit });
  scene.items.push(...PC.parcelLabels(sq, { units: 'ft', unitPerMm: 1 / scale.mmPerUnit }));
  ok(SC.LAYERS.some((l) => l.name === 'V-PROP') && SC.LAYERS.some((l) => l.name === 'V-PROP-TEXT'), 'layers V-PROP and V-PROP-TEXT');
  const { bytes, report } = await PL.toPdf(PL.planSheet(scene, { extents: { minX: -20, minY: -20, maxX: 120, maxY: 170 }, paper: 'tabloid', scale, title: 'Parcels', units: 'ft' }));
  ok(report.missing === 0, 'every character prints (no "?")');
  const { execFileSync } = await import('node:child_process');
  let has = false; try { execFileSync('pdftotext', ['-v'], { stdio: 'ignore' }); has = true; } catch {}
  if (has) {
    const os = await import('node:os'); const f = path.join(os.tmpdir(), 'cc-parcels-' + process.pid + '.pdf'); fs.writeFileSync(f, bytes);
    const txt = execFileSync('pdftotext', ['-raw', f, '-'], { encoding: 'utf8' }); fs.unlinkSync(f);
    ok(/N 90°00'00" E\s+100\.00'/.test(txt) && /Delta=180°00'00"/.test(txt) && /13,927 sq ft/.test(txt) && /Lot 1/.test(txt), 'pdftotext reads the courses, the curve, the area and the name');
  } else console.log('  note poppler not installed: PDF text check skipped');
}

section('untrusted parcels, the project file');
{
  const c = PC.cleanParcel({ id: 'r5', name: 'A\u0007B', pts: [{ x: 0, y: 0, b: 7 }, { x: 'x', y: 1 }, { x: 1, y: 0, b: 0.5 }, { x: 1, y: 1 }] });
  ok(c && c.name === 'A B' && c.pts.length === 3 && !('b' in c.pts[0]) && c.pts[1].b === 0.5, 'bad corner dropped, a bulge over 1 dropped, name cleaned');
  ok(PC.cleanParcel({ pts: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }) === null && PC.cleanParcel(null) === null, 'two straight corners: no parcel');
  ok(PC.cleanParcel({ pts: [{ x: 0, y: 0, b: 1 }, { x: 1, y: 0, b: 1 }] }) !== null, 'two corners with curves (a circle) are a parcel');
  const p = new PJ.Project();
  p.change('Parcel', (s) => s.parcels.push({ ...sq }));
  const q = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
  ok(JSON.stringify(q.state.parcels) === JSON.stringify([sq]), 'the project file keeps parcels and their curves');
  ok(q.nextId('r') !== 'r1', 'new ids do not reuse a saved parcel’s');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
