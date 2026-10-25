#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-stackup.mjs — 0.6 LC.18: tolerance stack-ups (stackup.js) against examples worked by hand the textbook way, and two
 * independent checks of the formulas:
 *   - a gap in a housing (one +, three −; symmetric tolerances): nominal, worst case, RSS and every share worked out beside it;
 *   - unequal tolerances (+0.2/−0, +0/−0.1): the mean shift, and the worst case equal to the extreme assemblies taken directly;
 *   - four equal links ±0.15: worst case ±0.60, RSS ±0.30;
 *   - every corner of a random chain enumerated (2^n assemblies, with signs and sensitivities): the worst case is their range;
 *   - a seeded Monte Carlo (each link normal, σ = tolerance / 3, 200 000 assemblies): its σ is the RSS / 3 within 1 %, its
 *     share outside the limits matches the RSS estimate;
 *   - the normal tail at known points (z = 0, 1, 1.96, 3, 4.5);
 *   - a chain picked through an assembly (fromPicks), ISO 2768-1 general tolerances, GD&T frames, untrusted files, the
 *     assembly file (version 5) and CSV.
 *   node tools/partcraft-test/test-stackup.mjs [--verbose]    (or runStackupTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runStackupTests({ ok, section }) {
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const SU = await import(DEV + 'stackup.js');
  const near = (a, b, tol = 1e-12) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
  const L = (nominal, up, lo, sign = 1, extra = {}) => ({ id: 'l' + Math.random().toString(36).slice(2, 6), label: '', inst: null, sign, nominal, up, lo, sens: 1, source: 'typed', ...extra });

  section('LC.18 stack-ups: worked examples');
  {
    // a housing 50.00 ±0.10 inside, three parts 20.00 ±0.05, 15.00 ±0.05, 14.50 ±0.04: gap = 50 − 49.5
    const s = { dir: [1, 0, 0], links: [L(50, 0.1, -0.1, 1), L(20, 0.05, -0.05, -1), L(15, 0.05, -0.05, -1), L(14.5, 0.04, -0.04, -1)], spec: { min: 0.3, max: 0.7 } };
    const r = SU.analyze(s);
    ok(near(r.nominal, 0.5) && near(r.mean, 0.5), 'the housing gap: nominal 0.50');
    ok(near(r.wc.tol, 0.24) && near(r.wc.min, 0.26) && near(r.wc.max, 0.74), 'worst case ±0.24: 0.26 to 0.74 (0.10 + 0.05 + 0.05 + 0.04)');
    const rss = Math.sqrt(0.01 + 0.0025 + 0.0025 + 0.0016);
    ok(near(r.rss.tol, rss) && near(r.rss.tol, 0.12884098, 1e-8), `RSS ±√0.0166 = ±${rss.toFixed(6)}`);
    ok(r.rows[0].link === s.links[0] && near(r.rows[0].rssShare, 0.01 / 0.0166) && near(r.rows[0].wcShare, 0.1 / 0.24), 'the housing ranks first: 60.2 % of the RSS, 41.7 % of the worst case');
    ok(r.rows[3].link === s.links[3] && near(r.rows.reduce((a, x) => a + x.rssShare, 0), 1) && near(r.rows.reduce((a, x) => a + x.wcShare, 0), 1), 'the 14.50 part ranks last; shares add up to 100 %');
    ok(!r.spec.wcOk && r.spec.rssOk, 'limits 0.30–0.70: worst case can fall outside, RSS ±0.129 stays inside');
    const z = 0.2 / (rss / 3);
    ok(near(r.spec.ppm, 2 * SU.normalTail(z) * 1e6, 1e-9) && r.spec.ppm > 1 && r.spec.ppm < 10, `RSS expects ${r.spec.ppm.toFixed(2)} per million outside (z = ${z.toFixed(3)} each side)`);
  }
  {
    // unequal tolerances: 25 +0.2/−0 adds, 10 +0/−0.1 takes away
    const a = L(25, 0.2, 0, 1), b = L(10, 0, -0.1, -1);
    const r = SU.analyze({ links: [a, b] });
    ok(near(r.nominal, 15) && near(r.mean, 15.15), 'unequal tolerances: nominal 15, mean 15.15 (25.1 − 9.95)');
    ok(near(r.wc.min, 25.0 - 10.0) && near(r.wc.max, 25.2 - 9.9), 'worst case 15.00 to 15.30 = the extreme assemblies taken directly');
    ok(near(r.rss.tol, Math.sqrt(0.01 + 0.0025)) && near(r.rss.min, 15.15 - Math.sqrt(0.0125)), 'RSS ±0.1118 about the shifted mean');
  }
  {
    const r = SU.analyze({ links: [0, 1, 2, 3].map(() => L(30, 0.15, -0.15)) });
    ok(near(r.nominal, 120) && near(r.wc.tol, 0.6) && near(r.rss.tol, 0.3), 'four equal links 30 ±0.15: 120, worst case ±0.60, RSS ±0.30');
  }

  section('LC.18 stack-ups: the formulas checked independently');
  {
    // every corner of a random chain (signs, sensitivities, unequal deviations)
    let seed = 12345;
    const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    let allOk = true;
    for (let trial = 0; trial < 20; trial++) {
      const n = 2 + Math.floor(rnd() * 7);
      const links = Array.from({ length: n }, () => { const up = +(rnd() * 0.3 - 0.05).toFixed(3); const lo = +(up - rnd() * 0.3).toFixed(3); return L(+(rnd() * 100).toFixed(2), up, lo, rnd() < 0.5 ? -1 : 1, { sens: +(0.5 + rnd()).toFixed(2) }); });
      let lo = Infinity, hi = -Infinity;
      for (let m = 0; m < 1 << n; m++) {
        let g = 0;
        links.forEach((l, i) => { g += l.sign * l.sens * (l.nominal + ((m >> i) & 1 ? l.up : l.lo)); });
        lo = Math.min(lo, g); hi = Math.max(hi, g);
      }
      const r = SU.analyze({ links });
      if (!(Math.abs(r.wc.min - lo) < 1e-9 && Math.abs(r.wc.max - hi) < 1e-9)) allOk = false;
    }
    ok(allOk, 'twenty random chains: the worst case is exactly the range of every corner assembly (2^n enumerated)');
  }
  {
    // a seeded Monte Carlo: each link normal about its mean with σ = t/3
    const s = { links: [L(50, 0.1, -0.1, 1), L(20, 0.05, -0.05, -1), L(15, 0.05, -0.05, -1), L(14.5, 0.04, -0.04, -1)], spec: { min: 0.42, max: 0.62 } };
    const r = SU.analyze(s);
    let seed = 7;
    const u = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const gauss = () => Math.sqrt(-2 * Math.log(u())) * Math.cos(2 * Math.PI * u());
    const N = 200000;
    let sum = 0, sum2 = 0, out = 0;
    for (let k = 0; k < N; k++) {
      let g = 0;
      for (const l of s.links) g += l.sign * (l.nominal + (l.up + l.lo) / 2 + gauss() * (l.up - l.lo) / 6);
      sum += g; sum2 += g * g; if (g < 0.42 || g > 0.62) out++;
    }
    const mean = sum / N, sd = Math.sqrt(sum2 / N - mean * mean);
    ok(Math.abs(mean - r.mean) < 0.001 && Math.abs(sd - r.rss.sigma) / r.rss.sigma < 0.01, `Monte Carlo (200 000): mean ${mean.toFixed(4)}, σ ${sd.toFixed(5)} = RSS/3 ${r.rss.sigma.toFixed(5)} within 1 %`);
    const est = r.spec.ppm / 1e6, got = out / N;
    ok(Math.abs(got - est) < 4 * Math.sqrt(est / N) + 1e-4, `… outside 0.42–0.62: ${(got * 100).toFixed(3)} % against the RSS estimate ${(est * 100).toFixed(3)} %`);
  }
  {
    const T = SU.normalTail;
    ok(near(T(0), 0.5, 1e-7) && near(T(1), 0.158655254, 1e-6) && near(T(1.96), 0.0249978951, 1e-5) && near(T(3), 0.0013498980, 1e-5) && near(T(4.5), 3.3976731e-6, 1e-4) && near(T(-1), 0.841344746, 1e-6), 'the normal tail at z = 0, 1, 1.96, 3, 4.5, −1 (tables)');
  }

  section('LC.18 stack-ups: a chain picked through an assembly, tolerances from the parts');
  {
    // housing inner faces at x 0 and 50; parts p1 [0, 20], p2 [20, 35], p3 [35, 49.5]: from p3's right face round to the housing's
    const P = (inst, x) => ({ inst, at: [x, 3, -7], label: inst });
    const picks = [P('p3', 49.5), P('p3', 35), P('p2', 35), P('p2', 20), P('p1', 20), P('p1', 0), P('h', 0), P('h', 50)];
    const links = SU.fromPicks(picks, [2, 0, 0]);
    ok(links.length === 7 && links.filter((l) => l.source === 'interface').length === 3 && links.filter((l) => l.inst).map((l) => l.inst).join() === 'p3,p2,p1,h', 'eight faces: four part dimensions, three interfaces between them');
    ok(links.filter((l) => l.inst).map((l) => l.sign * l.nominal).join() === '-14.5,-15,-20,50' && links.filter((l) => !l.inst).every((l) => l.nominal === 0), '… the parts take away 14.5, 15, 20, the housing adds 50; the interfaces are 0');
    ok(near(SU.analyze({ links }).nominal, 0.5), '… the gap closes the loop: 0.5');
    const tilted = SU.fromPicks([{ inst: 'a', at: [0, 0, 0] }, { inst: 'a', at: [30, 40, 9] }], [3, 4, 0]);
    ok(near(tilted[0].nominal, 50), 'a chain along (3, 4, 0): the distance measured along it (90 + 160) / 5 = 50');
  }
  {
    const G = SU.generalTol;
    ok(JSON.stringify(G('ISO 2768-m', 50)) === JSON.stringify({ up: 0.3, lo: -0.3, rule: 'ISO 2768-m' }) && G('ISO 2768-mK', 6).up === 0.1 && G('2768 m', 6.01).up === 0.2 && G('ISO 2768-f', 2500) === null && G('ISO 2768-v', 2) === null && G('ISO 2768-c', 0.4) === null, 'ISO 2768-1 Table 1: m at 50 = ±0.3; 6 and 6.01 either side of a range; f above 2000 and v below 3 not given; under 0.5 none');
    ok(G('ISO 2768-c', 1000).up === 2 && G('iso 2768-f', 3).up === 0.05 && G('ISO 2768-v', 4000).up === 8, '… c at 1000 = ±2, f at 3 = ±0.05, v at 4000 = ±8');
    ok(G('±0.1', 10).up === 0.1 && G('+/- .05', 1).lo === -0.05 && JSON.stringify(G('+0.2/-0.1', 5)) === JSON.stringify({ up: 0.2, lo: -0.1, rule: '+0.2/-0.1' }) && G('Unless noted', 5) === null && G('', 5) === null, 'plain text: ±0.1, +/- .05, +0.2/-0.1; nothing usable → none');
  }
  {
    const GD = await import(DEV + 'gdt.js');
    const pos = SU.fromGdt(GD.newAnnotation('fcf', { char: 'position', tol: 0.2, mod: 'M' }));
    ok(pos && pos.up === 0.1 && pos.lo === -0.1 && pos.kind === 'location' && pos.words.length === 2, 'position ⌀0.2 at MMC: ±0.1, with the note that the bonus is not counted');
    const prof = SU.fromGdt(GD.newAnnotation('fcf', { char: 'profileSurface', tol: 0.5 }));
    const flat = SU.fromGdt(GD.newAnnotation('fcf', { char: 'flatness', tol: 0.05 }));
    ok(prof.up === 0.25 && prof.kind === 'profile' && flat.kind === 'form' && /Rule #1/.test(flat.words[0]), 'profile 0.5: ±0.25; flatness: a form tolerance, with the Rule #1 note');
    ok(SU.fromGdt(GD.newAnnotation('datum', { letter: 'A' })) === null && SU.fromGdt(GD.newAnnotation('finish', {})) === null, 'a datum symbol or a finish gives no tolerance');
    ok(Object.keys(GD.CHARACTERISTICS).every((c) => SU.GDT_CHAR[c]), 'every characteristic gdt.js knows has a rule');
  }

  section('LC.18 stack-ups: files, CSV, the assembly');
  {
    const good = { id: 's1', name: 'Gap', dir: [0, 2, 0], spec: { min: 0.3, max: 0.7 }, links: [L(50, 0.1, -0.1, 1, { id: 'l1', inst: 'i1' }), L(20, 0.05, -0.05, -1, { id: 'l2', inst: 'gone' })] };
    const bad = [
      { ...good, dir: [0, 0, 0] }, { ...good, dir: 'x' }, { ...good, spec: { min: 2, max: 1 } },
      { ...good, id: 's9', links: [{ ...good.links[0], up: -1, lo: 0 }, { ...good.links[0], nominal: -3 }, { ...good.links[0], nominal: 'big' }, { ...good.links[0], sens: 1e9 }, null, 7] },
    ];
    const r = SU.readStackups([good, ...bad, 'x'], ['i1']);
    ok(r.length === 2 && JSON.stringify(r[0].dir) === '[0,1,0]' && r[0].links[0].inst === 'i1' && r[0].links[1].inst === null, 'a file: the good stack-up read (direction made unit, a missing part\'s link keeps its numbers)');
    ok(r[1].links.length === 0, '… tampered links dropped (upper below lower, negative or text nominals, a wild sensitivity); a zero direction, a text direction and min > max refused');
    ok(SU.readStackups(Array.from({ length: 80 }, () => good), []).length === SU.LIMITS.stacks && SU.readStackups('x').length === 0, '… at most 50 stack-ups; not a list → none');
    const text = SU.csv({ ...good, links: [L(50, 0.1, -0.1, 1, { label: '=HYPERLINK("x")' }), L(20, 0.05, -0.05, -1, { label: 'a, "b"' })] }, SU.analyze({ links: [L(50, 0.1, -0.1, 1, { label: '=HYPERLINK("x")' }), L(20, 0.05, -0.05, -1, { label: 'a, "b"' })] }));
    ok(text.startsWith('﻿Rank,Link,') && text.includes(`"'=HYPERLINK(""x"")"`) && text.includes('"a, ""b"""') && /\r\nWorst case,30,30,0\.15,29\.85,30\.15\r\n/.test(text), 'CSV: a formula-looking label escaped, quotes doubled, the worst case row');
  }
  {
    const A = await import(DEV + 'assembly.js');
    const P = await import(DEV + 'part.js');
    const asm = A.newAssembly('Box');
    const i1 = A.insertPart(asm, P.newPart('Housing')), i2 = A.insertPart(asm, P.newPart('Spacer'));
    const id1 = (i1.id || i1), id2 = (i2.id || i2);
    ok(A.fileVersion(asm) === 2, 'an assembly with no stack-up is written as before');
    asm.stackups = [{ id: 's1', name: 'Gap', dir: [1, 0, 0], spec: null, links: [L(50, 0.1, -0.1, 1, { id: 'l1', inst: id1 }), L(20, 0.05, -0.05, -1, { id: 'l2', inst: id2 })] }];
    const back = A.readAssembly(A.toJSON(asm));
    ok(back.version === 5 && JSON.stringify(back.stackups) === JSON.stringify(SU.readStackups(asm.stackups, [id1, id2])) && back.stackups[0].links[1].inst === id2, 'with a stack-up: version 5, read back the same');
    A.removeInstance(back, id2);
    ok(back.stackups[0].links.length === 2 && back.stackups[0].links[1].inst === null && near(SU.analyze(back.stackups[0]).nominal, 30), 'removing a part keeps its link\'s numbers (the part shows as none)');
    let refused = '';
    try { A.readAssembly(JSON.stringify({ ...JSON.parse(A.toJSON(asm)), version: 6 })); } catch (e) { refused = e.message; }
    ok(/newer/.test(refused), 'a version 6 file is refused as newer (and 0.5, whose newest is 4, refuses version 5 the same way)');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  await runStackupTests({ ok, section: (m) => console.log(m) });
  console.log(`stack-ups: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
