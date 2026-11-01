#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-turnout.mjs — CivilCraft 0.8 CV.1: turnouts, crossovers, clearance envelopes (turnout.js), DOM-free.
 * Known answers: No. 8 frog = 7.153°, No. 10 = 5.725° (2·atan(1/2N)); the lead curve ends at the gauge off the main track at the frog angle; the sampled centreline is
 * smooth (tangent turns by exactly θ − β over the arc); crossover straight from c = 2g + t·sinθ; speed from R·(E+D)/11.8; curve allowances b²/8R and (L² − b²)/8R;
 * a 150 mm cant tilts a 4.3 m high rectangle by asin(150/1500); two envelopes 3.4 m wide on a 300 m curve need 3.4 + inside + outside between centres.
 *   node bin/test-civilcraft-turnout.mjs [--build dev|x.y]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const T = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev', 'turnout.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);
const deg = (r) => (r * 180) / Math.PI;

near(deg(T.frogAngle(8)), 7.1527, 0.0005, 'No. 8 frog angle'); near(deg(T.frogAngle(10)), 5.7248, 0.001, 'No. 10 frog angle'); near(T.frogNumber(T.frogAngle(12)), 12, 1e-12, 'frog number round trip');
for (const n of [6, 8, 10, 12]) {
  const t = T.turnout({ n, gauge: 1.435, switchLength: 6.1, switchAngle: 0.0143 });
  ok(t.ok, 'turnout builds No. ' + n); near(t.tfp.y, 1.435, 1e-9, `No. ${n}: offset at the frog point = gauge`);
  const c = t.centre, last = c[c.length - 1], prev = c[c.length - 2]; near(Math.atan2(last.y - prev.y, last.x - prev.x), t.theta, 0.02, `No. ${n}: leaves at the frog angle`);
  near(t.lead, t.tfp.x, 1e-9, `No. ${n}: lead = x of the frog point`); ok(t.R > 50, `No. ${n}: radius ${t.R.toFixed(1)}`);
  // radius grows with the frog number
  if (n > 6) ok(t.R > T.turnout({ n: n - 2, gauge: 1.435, switchLength: 6.1, switchAngle: 0.0143 }).R, 'radius grows with N');
}
{
  const t = T.turnout({ n: 8, gauge: 1.435, switchLength: 6.1, switchAngle: 0.0143, side: 'R' }); ok(t.centre.every((p) => p.y <= 1e-12), 'right-hand turnout goes to the right'); near(t.tfp.y, -1.435, 1e-9, 'right hand offset');
  ok(!T.turnout({ n: 8, gauge: 0.05, switchLength: 6.1, switchAngle: 0.0143 }).ok, 'impossible geometry refused');
  const x = T.crossover({ n: 10, gauge: 1.435, switchLength: 6.1, switchAngle: 0.0143, spacing: 4.5 });
  near(x.straight, (4.5 - 2 * 1.435) / Math.sin(x.turnout.theta), 1e-9, 'crossover straight'); ok(x.ok, 'crossover ok'); ok(!T.crossover({ n: 10, gauge: 1.435, switchLength: 6.1, switchAngle: 0.0143, spacing: 2.5 }).ok, 'tracks too close for a crossover');
  near(T.divergingSpeed(200, { cant: 0, deficiency: 100 }), Math.sqrt(200 * 100 / 11.8), 0.01, 'diverging speed (R 200, D 100)');
}
{
  const a = T.curveAllowance({ radius: 300, length: 20, bogie: 14 }); near(a.inside, 196 / 2400, 1e-12, 'inside'); near(a.outside, 204 / 2400, 1e-12, 'outside');
  const rect = [{ o: -1.7, z: 0.1 }, { o: 1.7, z: 0.1 }, { o: 1.7, z: 4.3 }, { o: -1.7, z: 4.3 }];
  const same = T.envelopeAt({ outline: rect }); same.forEach((p, i) => { near(p.o, rect[i].o, 1e-12, 'straight, no cant: o'); near(p.z, rect[i].z, 1e-12, 'z'); });
  const tilt = T.envelopeAt({ outline: rect, cant: 150, base: 1500, curve: 'R' }); const phi = Math.asin(0.1);
  near(tilt[2].o - (1.7 + (4.3 - 0) * 0), tilt[2].o - 1.7, 0, 'sanity'); ok(tilt[2].o > rect[2].o + 0.3, 'the top leans toward the inside (right)'); ok(tilt[3].o > rect[3].o, 'left top leans right too');
  near(Math.hypot(tilt[2].o - tilt[1].o, tilt[2].z - tilt[1].z), Math.hypot(1.7 - 1.7, 4.3 - 0.1), 1e-9, 'rotation keeps lengths'); near(Math.atan2(tilt[2].o - tilt[1].o, tilt[2].z - tilt[1].z), phi, 1e-9, 'tilt angle');
  // two tracks on a curve
  const env = T.envelopeAt({ outline: rect.map((p) => ({ o: p.o, z: p.z })), radius: 300, length: 20, bogie: 14, curve: 'R' }), width = 3.4;
  const need = T.minSpacing(env, env); near(need, width + a.inside + a.outside, 1e-6, 'minimum spacing on the curve = width + inside + outside');
  near(T.minSpacing(rect, rect), width, 1e-6, 'on the straight = width');
  ok(T.clashes(env, [{ pts: [{ o: 1.5, z: 1 }, { o: 3, z: 1 }, { o: 3, z: 2 }, { o: 1.5, z: 2 }] }, { pts: [{ o: 4, z: 1 }, { o: 5, z: 1 }, { o: 5, z: 2 }, { o: 4, z: 2 }] }]).join() === '0', 'a platform edge at 1.5 m clashes, one at 4 m does not');
}
console.log(`turnout: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
