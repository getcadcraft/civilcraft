#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-why.mjs — CivilCraft 0.5 WL.23: the solver says why (solve-why.js), DOM-free. Every number is worked
 * by hand below, then checked against alignment.js / profile.js themselves: a radius offered must build without errors.
 *
 *   node bin/test-civilcraft-why.mjs [--build dev|x.y] [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const VERBOSE = process.argv.includes('--verbose');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; return m ? { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true } : next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const W = await mod('solve-why.js');
const { buildAlignment } = await mod('alignment.js');
const { buildProfile } = await mod('profile.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol = 1e-9) => Number.isFinite(a) && Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const section = (s) => console.log('\n== ' + s);
const withR = (pis, rs) => pis.map((p, i) => ({ ...p, r: rs[i] ?? 0 }));

section('two reverse curves too big for the tangent between them');
// left 90° at PI 2, right 90° at PI 3, 100 ft apart; R 80 each → T = 80·tan 45° = 80 each: 160 needed, 100 there
const Z = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 200, y: 100 }];
const bad = withR(Z, [0, 80, 80, 0]);
ok(buildAlignment({ pis: bad }).errors.length === 1, 'alignment.js refuses it (one overlap)');
const w = W.curveWhy(bad);
const o = w.find((x) => x.kind === 'overlap');
ok(w.length === 1 && o && o.a === 1 && o.b === 2 && near(o.dist, 100) && near(o.need, 160) && near(o.Ta, 80) && near(o.Tb, 80), 'why: PIs 2 and 3 need 80 + 80 = 160 ft of tangent, they are 100 ft apart');
ok(near(o.fixA, 20) && near(o.fixB, 20), 'the largest radius that fits at either PI with the other kept: (100 − 80) / tan 45° = 20.00');
ok(near(o.both.ra, 50) && near(o.both.rb, 50), 'or both scaled by 100 / 160: 80 × 0.625 = 50.00 each');
ok(buildAlignment({ pis: withR(Z, [0, o.fixA, 80, 0]) }).ok && buildAlignment({ pis: withR(Z, [0, o.both.ra, o.both.rb, 0]) }).ok, 'each offer builds with no error');
ok(near(W.maxRadius(bad, 1), 20, 1e-9) && near(W.maxRadius(withR(Z, [0, 0, 0, 0]), 1), 100, 1e-9), 'maxRadius: 20 with the neighbour at R 80; 100 when the neighbour has no curve');
// a curve too big for its own tangent to the start
const end = withR([{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 500 }], [0, 200, 0]);
const we = W.curveWhy(end);
ok(we.length === 1 && we[0].a === 0 && we[0].b === 1 && we[0].fixA === null && near(we[0].fixB, 50), 'one curve too big for the first tangent (50 ft): no curve can go at the start PI; the largest at PI 2 is 50.00');
// the neighbour alone is too long: no radius at this PI can fit with it kept
const hog = withR(Z, [0, 200, 30, 0]);
const wh = W.curveWhy(hog).filter((x) => x.kind === 'overlap');
ok(wh.some((x) => x.a === 1 && x.b === 2 && x.fixB === null && near(x.fixA, 70)), 'PI 2\'s curve (T 200) is longer than the 100 ft tangent by itself: PI 3 has no fix; PI 2 fits at 70.00');

section('a PI that turns straight back');
const back = withR([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 40, y: 0 }], [0, 30, 0]);
ok(W.curveWhy(back).some((x) => x.kind === 'back' && x.pi === 1) && W.maxRadius(back, 1) === 0, 'said: PI 2 turns straight back (no radius fits)');

section('a design minimum radius: the smallest radius that fits');
const wide = withR([{ x: 0, y: 0 }, { x: 500, y: 0 }, { x: 1000, y: 500 }], [0, 100, 0]);
const m1 = W.curveWhy(wide, { minR: 150 });
ok(m1.length === 1 && m1[0].kind === 'min' && m1[0].pi === 1 && m1[0].fix === 150, 'R 100 under a 150 minimum: the smallest that meets it and fits = 150.00');
ok(buildAlignment({ pis: withR(wide, [0, m1[0].fix, 0]) }).ok, 'and it builds');
const tight = withR([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }], [0, 50, 0]);
const m2 = W.curveWhy(tight, { minR: 150 });
ok(m2.length === 1 && m2[0].fix === null && near(m2[0].maxR, 100), 'a 90° turn on 100 ft tangents: at most R 100 fits, so no radius meets 150 (fix null, maxR 100: move a PI)');
ok(W.curveWhy(wide, { minR: 50 }).length === 0 && W.curveWhy(withR(Z, [0, 10, 10, 0])).length === 0, 'nothing wrong: nothing said');

section('vertical curves');
// PVIs 100 ft apart, grades +2 % then −3 %: A = −5; L 300 cannot fit, room = 2 × 100 = 200 → K = 200 / 5 = 40
const pv = [{ sta: 0, z: 100 }, { sta: 100, z: 102, L: 300 }, { sta: 200, z: 99 }];
ok(!buildProfile(pv).ok, 'profile.js refuses it');
const vw = W.verticalWhy(pv);
ok(vw.length === 1 && vw[0].pvi === 1 && vw[0].index === 1 && near(vw[0].fix, 200) && near(vw[0].K, 40), 'why: L 300 needs 150 each side, 100 is there; the longest that fits is 200.00 (K 40.0)');
ok(buildProfile(pv.map((v, i) => (i === 1 ? { ...v, L: vw[0].fix } : v))).ok, 'and it builds');
const two = [{ sta: 0, z: 100 }, { sta: 100, z: 104, L: 120 }, { sta: 180, z: 103, L: 100 }, { sta: 400, z: 110 }];
const v2 = W.verticalWhy(two);
ok(v2.length === 1 && v2[0].pvi === 2 && v2[0].side === 'before' && near(v2[0].fix, 40), 'the second curve runs back into the first (which ends at 160): 2 × (180 − 160) = 40.00');
ok(W.verticalWhy([{ sta: 0, z: 1 }, { sta: 100, z: 2, L: 50 }, { sta: 200, z: 1 }]).length === 0, 'a curve that fits: nothing said');
const kOnly = W.verticalWhy([{ sta: 0, z: 100 }, { sta: 100, z: 102, K: 60 }, { sta: 200, z: 99 }]);
ok(kOnly.length === 1 && near(kOnly[0].L, 300) && near(kOnly[0].fix, 200), 'a curve given by K (60 × 5 = 300) is checked the same way');

console.log(fail ? `\n${fail} FAILED, ${pass} passed` : `\nall ${pass} solver checks passed`);
process.exit(fail ? 1 : 0);
