#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-stackdir.mjs — 0.8 STACK-DIR: stack-ups in two and three directions (stackup.js analyzeVector) against hand cases:
 *   - a 2-D loop across X and Y (four links): worst case Σ|u·d| t and RSS √Σ(u·d t)² along X, along Y and along the gap itself;
 *   - the collinear case equals the 1-D analyze() to the last digit (same engine);
 *   - a link at 45° enters X and Y by cos 45°; a swing of ±0.5° about Z adds ℓ·Δθ along Y (and nothing along X to first order,
 *     the true second-order shortening is shown beside it);
 *   - every corner of the TRUE nonlinear geometry (2^n assemblies, angles at their extremes) against the first-order worst case;
 *   - a seeded Monte Carlo of the true geometry (normal, σ = tolerance/3): σ against the RSS/3 per direction;
 *   - three directions (X, Y, Z), an angled output direction, picks → 3-D links;
 *   - the file: version 6 only for a vector stack, 5 for a plain one, bad input dropped, round trip.
 *   node tools/partcraft-test/test-stackdir.mjs [--verbose]    (or runStackDirTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runStackDirTests({ ok, section }) {
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const [SU, A, P] = await Promise.all(['stackup.js', 'assembly.js', 'part.js'].map((f) => import(DEV + f)));
  const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
  const L = (nominal, t, dir, sign = 1, extra = {}) => ({ id: 'l' + Math.random().toString(36).slice(2, 6), label: '', inst: null, sign, nominal, up: t, lo: -t, sens: 1, source: 'typed', dir, ...extra });
  const out = (r, id) => r.outputs.find((o) => o.id === id);

  section('STACK-DIR: a loop across X and Y');
  {
    const s = { links: [L(100, 0.2, [1, 0, 0]), L(60, 0.1, [0, 1, 0]), L(50, 0.15, [1, 0, 0], -1), L(20, 0.05, [0, 1, 0], -1)], outputs: SU.directionsFor('xy') };
    const r = SU.analyzeVector(s);
    const X = out(r, 'o1'), Y = out(r, 'o2');
    ok(near(r.gap[0], 50) && near(r.gap[1], 40) && near(r.gap[2], 0) && near(r.gapLength, Math.hypot(50, 40)), 'the gap vector is (50, 40, 0), length 64.031');
    ok(near(X.nominal, 50) && near(X.wc.tol, 0.35) && near(X.rss.tol, 0.25), 'along X: nominal 50, worst case ±(0.20 + 0.15) = ±0.35, RSS ±√(0.04 + 0.0225) = ±0.25');
    ok(near(Y.nominal, 40) && near(Y.wc.tol, 0.15) && near(Y.rss.tol, Math.sqrt(0.0125)), 'along Y: nominal 40, worst case ±0.15, RSS ±0.1118');
    const ux = 50 / Math.hypot(50, 40), uy = 40 / Math.hypot(50, 40);
    const G = out(r, 'gap');
    ok(near(G.dir[0], ux, 1e-12) && near(G.nominal, Math.hypot(50, 40)), 'a "gap" output is added along the nominal gap vector');
    ok(near(G.wc.tol, 0.35 * ux + 0.15 * uy, 1e-12) && near(G.rss.tol, Math.sqrt((0.2 * ux) ** 2 + (0.1 * uy) ** 2 + (0.15 * ux) ** 2 + (0.05 * uy) ** 2), 1e-12), `along the gap: worst case ${G.wc.tol.toFixed(5)} (0.35·0.7809 + 0.15·0.6247), RSS ${G.rss.tol.toFixed(5)}`);
    ok(X.rows[0].link.id === s.links[0].id && X.rows.filter((q) => q.wc === 0).length === 2, 'rows rank per direction: the X link first, the Y links carry nothing along X');
    s.outputs[0].spec = { min: 49.7, max: 50.3 }; s.outputs[1].spec = { min: 39.8, max: 40.2 };
    const r2 = SU.analyzeVector(s);
    ok(out(r2, 'o1').spec.wcOk === false && out(r2, 'o1').spec.rssOk === true && out(r2, 'o2').spec.wcOk === true, 'limits per direction: X fails worst case (±0.35 > ±0.30) but RSS (±0.25) passes; Y passes both');
  }

  section('STACK-DIR: the collinear case is the 1-D engine');
  {
    const one = { dir: [1, 0, 0], links: [{ id: 'l1', label: '', inst: null, sign: 1, nominal: 50, up: 0.1, lo: -0.1, sens: 1, source: 'typed' }, { id: 'l2', label: '', inst: null, sign: -1, nominal: 20, up: 0.05, lo: -0.05, sens: 1, source: 'typed' }, { id: 'l3', label: '', inst: null, sign: -1, nominal: 15, up: 0.2, lo: 0, sens: 1, source: 'typed' }], spec: { min: 14, max: 16 } };
    const a = SU.analyze(one);
    const vec = { ...one, links: one.links.map((l) => ({ ...l, dir: [1, 0, 0] })), outputs: [{ id: 'o1', name: 'X', dir: [1, 0, 0], spec: one.spec }] };
    const b = SU.analyzeVector(vec).outputs[0];
    ok(a.nominal === b.nominal && a.mean === b.mean && a.wc.tol === b.wc.tol && a.rss.tol === b.rss.tol && a.spec.ppm === b.spec.ppm, 'nominal, mean, worst case, RSS and ppm are identical to analyze(), to the last digit');
    const rot = { ...vec, links: one.links.map((l) => ({ ...l, dir: [0, 0, 1] })), outputs: [{ id: 'o1', name: 'Z', dir: [0, 0, 1], spec: one.spec }] };
    ok(SU.analyzeVector(rot).outputs[0].rss.tol === a.rss.tol, 'the same chain run along Z gives the same answer along Z');
  }

  section('STACK-DIR: an angled link, and a swing');
  {
    const s = { links: [L(100, 0.1, [Math.SQRT1_2, Math.SQRT1_2, 0])], outputs: SU.directionsFor('xy') };
    const r = SU.analyzeVector(s);
    ok(near(out(r, 'o1').wc.tol, 0.1 * Math.SQRT1_2) && near(out(r, 'o2').wc.tol, 0.1 * Math.SQRT1_2) && near(out(r, 'gap').wc.tol, 0.1), 'a 100 ±0.1 link at 45°: ±0.0707 along X and Y, the full ±0.1 along itself');
    const sw = { links: [L(100, 0, [1, 0, 0], 1, { ang: { axis: [0, 0, 1], up: 0.5, lo: -0.5 } })], outputs: SU.directionsFor('xy') };
    const w = SU.analyzeVector(sw), ld = 100 * 0.5 * Math.PI / 180;
    ok(near(out(w, 'o2').wc.tol, ld) && near(out(w, 'o2').rss.tol, ld) && out(w, 'o1').wc.tol === 0, `a 100 mm link swinging ±0.5° about Z: ±${ld.toFixed(4)} along Y, nothing along X (first order)`);
    const trueY = 100 * Math.sin(0.5 * Math.PI / 180), trueXshort = 100 * (1 - Math.cos(0.5 * Math.PI / 180));
    ok(Math.abs(trueY / ld - 1) < 2e-5 && trueXshort < 0.004, `the true geometry: Y = 100 sin 0.5° = ${trueY.toFixed(5)} (first order within 0.002 %, the θ²/6 of the sine); X shortens by ${trueXshort.toFixed(5)} (second order, not counted)`);
    const off = { links: [L(100, 0, [1, 0, 0], 1, { ang: { axis: [0, 0, 1], up: 0.7, lo: -0.3 } })], outputs: SU.directionsFor('y') };
    const o = SU.analyzeVector(off).outputs[0];
    ok(near(o.mean, 100 * 0.2 * Math.PI / 180) && near(o.wc.tol, 100 * 0.5 * Math.PI / 180), 'unequal swing +0.7°/−0.3°: mean shift ℓ·0.2° along Y, half range ℓ·0.5°');
    const neg = { links: [L(100, 0, [1, 0, 0], 1, { ang: { axis: [0, 0, 1], up: 0.5, lo: -0.5 } })], outputs: [{ id: 'o1', name: '-Y', dir: [0, -1, 0] }] };
    ok(near(SU.analyzeVector(neg).outputs[0].wc.tol, ld), 'the direction of the output does not change the size of the effect');
  }

  section('STACK-DIR: against the true nonlinear geometry (corners and Monte Carlo)');
  {
    // a bracket loop: 120 along X (±0.15, swing ±0.3°), 80 along Y (±0.1), 60 at 30° (±0.1, swing ±0.2°), 40 along −X (±0.05)
    const links = [
      L(120, 0.15, [1, 0, 0], 1, { ang: { axis: [0, 0, 1], up: 0.3, lo: -0.3 } }), L(80, 0.1, [0, 1, 0]),
      L(60, 0.1, [Math.cos(Math.PI / 6), Math.sin(Math.PI / 6), 0], 1, { ang: { axis: [0, 0, 1], up: 0.2, lo: -0.2 } }), L(40, 0.05, [1, 0, 0], -1)];
    const s = { links, outputs: SU.directionsFor('xy') };
    const r = SU.analyzeVector(s);
    const R = Math.PI / 180;
    const rot = (u, a) => [u[0] * Math.cos(a) - u[1] * Math.sin(a), u[0] * Math.sin(a) + u[1] * Math.cos(a)];
    const end = (len, ang) => { let x = 0, y = 0; links.forEach((l, i) => { const g = l.sign < 0 ? -1 : 1, u = rot(l.dir, (ang[i] || 0) * R), n = len[i]; x += g * n * u[0]; y += g * n * u[1]; }); return [x, y]; };
    // corners: each length at ±t, each swing at ±max
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, n = 0;
    const slots = [];
    links.forEach((l, i) => { slots.push({ i, kind: 'len', t: l.up }); if (l.ang) slots.push({ i, kind: 'ang', t: l.ang.up }); });
    for (let m = 0; m < 1 << slots.length; m++) {
      const len = links.map((l) => l.nominal), ang = links.map(() => 0);
      slots.forEach((sl, k) => { const sg = m >> k & 1 ? 1 : -1; if (sl.kind === 'len') len[sl.i] += sg * sl.t; else ang[sl.i] = sg * sl.t; });
      const [x, y] = end(len, ang); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); n++;
    }
    const wcX = (maxX - minX) / 2, wcY = (maxY - minY) / 2, X = out(r, 'o1'), Y = out(r, 'o2');
    ok(n === 64 && Math.abs(wcX / X.wc.tol - 1) < 0.01 && Math.abs(wcY / Y.wc.tol - 1) < 0.01, `2^6 = 64 corners of the true geometry: worst case X ±${wcX.toFixed(4)} vs first order ±${X.wc.tol.toFixed(4)}, Y ±${wcY.toFixed(4)} vs ±${Y.wc.tol.toFixed(4)} (within 1 %)`);
    // seeded Monte Carlo
    let seed = 20261028;
    const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const gauss = () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
    const N = 200000; let sx = 0, sy = 0, sxx = 0, syy = 0;
    for (let k = 0; k < N; k++) {
      const len = links.map((l) => l.nominal + gauss() * l.up / 3), ang = links.map((l) => (l.ang ? gauss() * l.ang.up / 3 : 0));
      const [x, y] = end(len, ang); sx += x; sy += y; sxx += x * x; syy += y * y;
    }
    const mx = sx / N, my = sy / N, stdX = Math.sqrt(sxx / N - mx * mx), stdY = Math.sqrt(syy / N - my * my);
    ok(Math.abs(stdX / (X.rss.tol / 3) - 1) < 0.015 && Math.abs(stdY / (Y.rss.tol / 3) - 1) < 0.015, `Monte Carlo (200 000, seeded): σx ${stdX.toFixed(5)} vs RSS/3 ${(X.rss.tol / 3).toFixed(5)}, σy ${stdY.toFixed(5)} vs ${(Y.rss.tol / 3).toFixed(5)} (within 1.5 %)`);
    ok(Math.abs(mx - X.mean) < 0.002 && Math.abs(my - Y.mean) < 0.002, 'and the Monte Carlo mean agrees with the nominal (second-order shortening ≤ 0.002 mm)');
  }

  section('STACK-DIR: three directions, an angle, picks');
  {
    const s = { links: [L(30, 0.1, [1, 0, 0]), L(40, 0.2, [0, 1, 0]), L(50, 0.3, [0, 0, 1])], outputs: SU.directionsFor('xyz') };
    const r = SU.analyzeVector(s);
    ok(near(r.outputs[0].wc.tol, 0.1) && near(r.outputs[1].wc.tol, 0.2) && near(r.outputs[2].wc.tol, 0.3) && near(r.gapLength, Math.hypot(30, 40, 50)), 'X, Y and Z each carry only their own link');
    const gl = Math.hypot(30, 40, 50), g = out(r, 'gap');
    ok(near(g.wc.tol, (0.1 * 30 + 0.2 * 40 + 0.3 * 50) / gl, 1e-12) && near(g.rss.tol, Math.sqrt((0.1 * 30) ** 2 + (0.2 * 40) ** 2 + (0.3 * 50) ** 2) / gl, 1e-12), 'along the 3-D gap: Σ t·ℓ/|G| and √Σ(t·ℓ)²/|G|');
    const ang = SU.directionsFor([30], { 30: 'Slot axis' });
    ok(ang[0].name === 'Slot axis' && near(ang[0].dir[0], Math.cos(Math.PI / 6)) && near(ang[0].dir[1], 0.5), 'an angle in the XY plane is a direction (30° = (0.866, 0.5, 0)), named by the caller');
    const a30 = SU.analyzeVector({ links: [L(80, 0.1, [1, 0, 0])], outputs: ang }).outputs[0];
    ok(near(a30.wc.tol, 0.1 * Math.cos(Math.PI / 6)), 'a link along X seen along 30°: ±0.1·cos 30°');
    const pk = SU.fromPicks3([{ inst: 'i1', at: [0, 0, 0] }, { inst: 'i1', at: [30, 40, 0] }, { inst: 'i2', at: [30, 40, 25] }]);
    ok(pk.length === 2 && near(pk[0].nominal, 50) && near(pk[0].dir[0], 0.6) && near(pk[0].dir[1], 0.8) && pk[0].source === 'measured' && pk[1].source === 'interface' && near(pk[1].dir[2], 1), 'picks → 3-D links: (0,0,0)→(30,40,0) is 50 along (0.6, 0.8, 0); across parts an interface');
    ok(SU.isVector(s) && !SU.isVector({ dir: [1, 0, 0], links: [L(1, 0, undefined)].map(({ dir, ...q }) => q) }), 'isVector: outputs or a link direction make a vector stack, a plain stack is not one');
  }

  section('STACK-DIR: the file');
  {
    const s = { id: 's1', name: 'Plate', dir: [1, 0, 0], spec: null, links: [L(50, 0.1, [0.6, 0.8, 0], 1, { id: 'l1', ang: { axis: [0, 0, 1], up: 0.5, lo: -0.5 } })], outputs: SU.directionsFor('xy', { x: 'Across', y: 'Up' }) };
    const back = SU.readStackups([JSON.parse(JSON.stringify(s))]);
    ok(back.length === 1 && back[0].outputs.length === 2 && back[0].outputs[0].name === 'Across' && back[0].links[0].ang.up === 0.5 && near(back[0].links[0].dir[1], 0.8), 'a vector stack reads back: outputs, link direction and swing');
    const bad = SU.readStackups([{ id: 's1', name: 'x', dir: [0, 0, 0], links: [] }, { id: 's2', name: 'y', outputs: [{ dir: [0, 0, 0] }], links: [] },
      { id: 's3', name: 'z', outputs: [{ id: 'o1', name: 'a', dir: [1, 0, 0], spec: { min: 5, max: 1 } }, { id: 'o2', name: 'b', dir: [0, 1, 0] }], links: [{ id: 'l1', nominal: 5, up: 0.1, lo: -0.1, dir: [0, 0, 0], ang: { axis: [0, 0, 1], up: -1, lo: 1 } }] }]);
    ok(bad.length === 1 && bad[0].outputs.length === 1 && bad[0].outputs[0].id === 'o2' && bad[0].links.length === 1 && !bad[0].links[0].dir && !bad[0].links[0].ang, 'untrusted: a zero direction drops a stack, an inverted spec drops its output, a zero link direction and an inverted swing are dropped');
    ok(SU.readStackups([{ id: 's1', name: 'many', dir: [1, 0, 0], outputs: Array.from({ length: 20 }, (_, i) => ({ id: 'o' + (i + 1), name: 'd', dir: [1, 0, 0] })), links: [] }])[0].outputs.length === SU.LIMITS.outputs, 'at most ' + SU.LIMITS.outputs + ' output directions');
    const asm = A.newAssembly('Plate');
    const i1 = A.insertPart(asm, P.newPart('Plate')); const id1 = i1.id || i1;
    asm.stackups = [{ id: 's1', name: 'Gap', dir: [1, 0, 0], spec: null, links: [{ id: 'l1', label: '', inst: id1, sign: 1, nominal: 10, up: 0.1, lo: -0.1, sens: 1, source: 'typed' }] }];
    ok(A.fileVersion(asm) === 5 && A.readAssembly(A.toJSON(asm)).version === 5, 'a plain one-direction stack-up is still a version 5 file');
    asm.stackups = [{ ...s, links: [{ ...s.links[0], inst: id1 }] }];
    const v6 = A.readAssembly(A.toJSON(asm));
    ok(A.VERSION === 6 && A.fileVersion(asm) === 6 && v6.version === 6 && v6.stackups[0].outputs.length === 2 && v6.stackups[0].links[0].inst === id1 && JSON.stringify(v6.stackups) === JSON.stringify(SU.readStackups(asm.stackups, [id1])), 'a stack-up with directions is a version 6 file and reads back the same');
    let refused = '';
    try { A.readAssembly(JSON.stringify({ ...JSON.parse(A.toJSON(asm)), version: 7 })); } catch (e) { refused = e.message; }
    ok(/newer/.test(refused), 'version 7 is refused as newer; 0.7, which reads up to 5, refuses version 6 the same way');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  await runStackDirTests({ ok, section: (m) => { if (VERBOSE) console.log(m); } });
  console.log(`stack-up directions: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
