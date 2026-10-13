#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-drive.mjs — CivilCraft 0.4 V10: driving along an alignment, and the sun's position (drive.js), DOM-free.
 *
 *   node bin/test-civilcraft-drive.mjs [--build dev|x.y] [--verbose]
 *
 * Drive: on an eastbound alignment with a 2 % design profile from 100.00, at 0+50 the eye is 3.5 ft above 101.00 and looks
 * 100 ft on at 103.00 + 3.5; in the 3D view's local coordinates (origin, ×2 exaggeration); straight on past the end; the
 * existing ground where there is no profile. Sun, against published facts: the June 2026 solstice declination (+23.44°),
 * noon altitudes 90° − |latitude − declination| north and south of the equator (sun due south / due north), the equation
 * of time's extremes (+16.4 min early November, −14.2 min mid February), an equinox sunrise due east, midnight below the
 * horizon, and the vector toward the sun.
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
// The build's language file: DOM-free modules speak through t() (docs/LANG.md); a build without one keeps its English.
if (fs.existsSync(path.join(APP, 'lang/en.json'))) (await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const DR = await mod('drive.js');
const AL = await mod('alignment.js');
const PF = await mod('profile.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);

section('driving');
{
  const al = AL.buildAlignment({ pis: [{ x: 1000, y: 5000 }, { x: 1300, y: 5000 }] });
  const pr = PF.buildProfile([{ sta: 0, z: 100, L: 0 }, { sta: 300, z: 106, L: 0 }]);
  const elev = DR.elevationAlong(al, pr, () => 50);
  near(elev(50), 101, 1e-9, 'the design profile: 101.00 at 0+50');
  const f = DR.driveFrame(al, elev, 50, { eye: 3.5, ahead: 100, origin: { x: 1000, y: 5000, z: 90 }, exag: 2 });
  ok(JSON.stringify(f.eye.map((v) => +v.toFixed(9))) === JSON.stringify([50, 0, (101 + 3.5 - 90) * 2]), 'eye at (50, 0, (104.5 − 90) × 2) in local coordinates');
  ok(JSON.stringify(f.target.map((v) => +v.toFixed(9))) === JSON.stringify([150, 0, (103 + 3.5 - 90) * 2]), 'looking 100 ft on at 103.00 + 3.5');
  const end = DR.driveFrame(al, elev, 290, { ahead: 100 });
  near(end.target[0], 1290 + 100, 1e-9, 'near the end it looks straight on past it'); near(end.target[2], end.eye[2], 1e-9, 'and level');
  ok(DR.driveFrame(al, elev, 999).sta === 300 && DR.driveFrame(al, elev, -5).sta === 0, 'stations kept on the alignment');
  const noProf = DR.elevationAlong(al, PF.buildProfile([]), (x) => x / 100);
  near(noProf(100), 11, 1e-9, 'no profile: the existing ground on the centerline');
  const hole = DR.elevationAlong(al, null, (x) => (x > 1150 ? null : 7));
  ok(hole(100) === 7 && hole(200) === 7, 'off the ground: the last elevation known');
  near(DR.DRIVE_SPEEDS.ft[1].perSec, 25 * 5280 / 3600, 1e-12, '25 mph = 36.67 ft/s'); near(DR.DRIVE_SPEEDS.m[1].perSec, 40 / 3.6, 1e-12, '40 km/h = 11.11 m/s');
}

section('the sun');
{
  const at = (iso, lat, lon) => DR.sunPosition(new Date(iso), lat, lon);
  near(at('2026-06-21T08:24:00Z', 0, 0).declination, 23.44, 0.02, 'June solstice 2026: declination +23.44°');
  near(at('2026-12-21T20:50:00Z', 0, 0).declination, -23.44, 0.02, 'December solstice: −23.44°');
  // noon: scan the day for the highest sun
  const noon = (date, lat, lon) => { let best = null; for (let m = 0; m < 1440; m++) { const s = DR.sunPosition(new Date(Date.parse(date + 'T00:00:00Z') + m * 60000), lat, lon); if (!best || s.altitude > best.altitude) best = s; } return best; };
  const boulder = noon('2026-06-21', 40, -105);
  near(boulder.altitude, 90 - 40 + boulder.declination, 0.05, 'latitude 40° N at the June solstice: noon altitude 90 − 40 + 23.44 = 73.44°');
  near(boulder.azimuth, 180, 0.5, 'due south');
  const sydney = noon('2026-06-21', -33.87, 151.21);
  near(sydney.altitude, 90 - 33.87 - 23.44, 0.06, '33.87° S at the June solstice: 32.69°');
  ok(sydney.azimuth > 359.5 || sydney.azimuth < 0.5, 'due north (' + sydney.azimuth.toFixed(2) + '°)');
  near(at('2026-11-03T12:00:00Z', 0, 0).eot, 16.4, 0.15, 'equation of time early November: +16.4 min');
  near(at('2026-02-11T12:00:00Z', 0, 0).eot, -14.2, 0.15, 'mid February: −14.2 min');
  // equinox sunrise at 40° N: first minute with the sun above the horizon
  let rise = null;
  for (let m = 0; m < 1440 && !rise; m++) { const s = DR.sunPosition(new Date(Date.parse('2026-03-20T00:00:00Z') + m * 60000), 40, 0); if (s.altitude > -0.833) rise = s; }
  near(rise.azimuth, 90, 1.5, 'equinox sunrise: due east (' + rise.azimuth.toFixed(2) + '°)');
  ok(at('2026-06-21T00:00:00Z', 40, 0).altitude < -20, 'midnight: well below the horizon');
  const v = DR.sunVector({ azimuth: 90, altitude: 30 });
  near(v[0], Math.cos(Math.PI / 6), 1e-12, 'toward the sun at 90°, 30°: east'); near(v[1], 0, 1e-12, 'no north'); near(v[2], 0.5, 1e-12, 'up sin 30°');
  const s2 = DR.sunVector({ azimuth: 180, altitude: 0 });
  near(s2[1], -1, 1e-12, 'azimuth 180°: south');
}

section('the sun against PyEphem (a second, independent theory)');
{
  const PY = path.join(REPO, 'tools/civilcraft-test/venv/bin/python');
  if (!fs.existsSync(PY)) console.log('  note tools/civilcraft-test/venv missing: PyEphem check skipped');
  else {
    const { execFileSync } = await import('node:child_process');
    const cases = [];
    const places = [[40.0, -105.27], [-33.87, 151.21], [51.48, 0], [19.43, -99.13], [64.84, -147.72], [0, 0]];
    for (const [lat, lon] of places) for (const day of ['2026-01-15', '2026-04-10', '2026-07-04', '2026-10-12']) for (const h of [2, 7, 11, 15, 19, 23]) cases.push([`${day}T${String(h).padStart(2, '0')}:17:00Z`, lat, lon]);
    const ref = JSON.parse(execFileSync(PY, [path.join(REPO, 'tools/civilcraft-test/sun_check.py')], { input: JSON.stringify(cases), encoding: 'utf8' }));
    let worstAz = 0, worstAlt = 0, up = 0;
    cases.forEach(([iso, lat, lon], i) => {
      const s = DR.sunPosition(new Date(iso), lat, lon), [az, alt] = ref[i];
      if (alt < 2) return;   // near or below the horizon refraction models differ; azimuth is meaningless at the zenith
      up++;
      worstAlt = Math.max(worstAlt, Math.abs(s.altitude - alt));
      if (alt < 88) worstAz = Math.max(worstAz, Math.abs(((s.azimuth - az + 540) % 360) - 180));
    });
    ok(up > 40, `${up} cases with the sun up (6 places, 4 days, 6 times)`);
    ok(worstAlt < 0.03, `altitude within 0.03° of PyEphem (worst ${worstAlt.toFixed(4)}°)`);
    ok(worstAz < 0.05, `azimuth within 0.05° (worst ${worstAz.toFixed(4)}°)`);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
