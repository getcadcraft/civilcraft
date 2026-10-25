#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-gdt.mjs — PartCraft's GD&T / surface-finish annotations (assets/apps/partcraft/dev/gdt.js):
 * the Y14.5 rules, reading untrusted notes, descriptions, the symbol geometry, and one sheet of
 * every symbol written through drawing.js's PDF writer and read back by poppler.
 *   node tools/partcraft-test/test-gdt.mjs [--verbose]     (or runGdtTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runGdtTests({ ok, section, near }) {
  const G = await import(DEV + 'gdt.js');
  const { toPdf } = await import(DEV + 'drawing.js');
  const fcf = (props) => G.newAnnotation('fcf', { id: 'g1', ...props });

  section('GD&T: Y14.5 rules');
  ok(G.validate(fcf({ char: 'position', dia: true, tol: 0.1, mod: 'M', datums: [{ letter: 'A', mod: '' }, { letter: 'B', mod: 'M' }] })) === null, 'position ⌀0.1 Ⓜ | A | B Ⓜ is valid');
  ok(/datum/.test(G.validate(fcf({ char: 'flatness', dia: false, datums: [{ letter: 'A', mod: '' }] })) || ''), 'flatness with a datum is refused (form takes none)');
  ok(G.validate(fcf({ char: 'flatness', dia: false, datums: [] })) === null, 'flatness without datums is valid');
  ok(/needs at least one datum/.test(G.validate(fcf({ char: 'perpendicularity', datums: [] })) || ''), 'perpendicularity without a datum is refused');
  ok(G.validate(fcf({ char: 'perpendicularity', datums: [{ letter: 'A', mod: '' }] })) === null, 'perpendicularity to A is valid');
  ok(/needs at least one datum/.test(G.validate(fcf({ char: 'circularRunout', datums: [] })) || ''), 'runout without a datum is refused');
  ok(G.validate(fcf({ char: 'profileSurface', datums: [] })) === null && G.validate(fcf({ char: 'profileSurface', datums: [{ letter: 'A', mod: '' }] })) === null, 'profile: datums optional (both ways valid)');
  ok(/diameter/.test(G.validate(fcf({ char: 'flatness', dia: true, datums: [] })) || ''), 'diameter symbol on flatness refused');
  ok(G.validate(fcf({ char: 'straightness', dia: true, datums: [] })) === null, 'diameter symbol on straightness allowed');
  ok(/diameter/.test(G.validate(fcf({ char: 'circularRunout', dia: true, datums: [{ letter: 'A', mod: '' }] })) || ''), 'diameter on runout refused');
  ok(/modifier/.test(G.validate(fcf({ char: 'flatness', dia: false, mod: 'M', datums: [] })) || ''), 'Ⓜ on flatness refused');
  ok(/modifier/.test(G.validate(fcf({ char: 'circularRunout', mod: 'L', datums: [{ letter: 'A', mod: '' }] })) || ''), 'Ⓛ on runout refused');
  ok(G.validate(fcf({ char: 'parallelism', mod: 'L', datums: [{ letter: 'A', mod: '' }] })) === null, 'Ⓛ on parallelism allowed');
  ok(/modifiers/.test(G.validate(fcf({ char: 'profileLine', datums: [{ letter: 'A', mod: 'M' }] })) || ''), 'datum modifier on a profile refused');
  ok(/twice/.test(G.validate(fcf({ char: 'position', datums: [{ letter: 'A', mod: '' }, { letter: 'A', mod: '' }] })) || ''), 'the same datum twice refused');
  ok(/three/.test(G.validate(fcf({ char: 'position', datums: ['A', 'B', 'C', 'D'].map((l) => ({ letter: l, mod: '' })) })) || ''), 'four datum references refused');
  ok(/not I, O or Q/.test(G.validate(fcf({ char: 'position', datums: [{ letter: 'I', mod: '' }] })) || ''), 'datum letter I refused');
  ok(!G.DATUM_LETTERS.some((l) => 'IOQ'.includes(l)) && G.DATUM_LETTERS.length === 23, 'datum letters: A–Z without I, O, Q');
  ok(/tolerance/.test(G.validate(fcf({ tol: 0 })) || '') && /tolerance/.test(G.validate(fcf({ tol: NaN })) || ''), 'zero / NaN tolerance refused');
  ok(G.CHARACTERISTICS.concentricity.legacy && /removed in Y14.5-2018/.test(G.CHARACTERISTICS.symmetry.label), 'concentricity and symmetry marked as removed in 2018');
  ok(G.validate(G.newAnnotation('datum', { letter: 'Q' })) !== null && G.validate(G.newAnnotation('datum', { letter: 'B' })) === null, 'datum symbol letters checked both ways');
  ok(G.validate(G.newAnnotation('finish', { ra: 0.8 })) === null && G.validate(G.newAnnotation('finish', { ra: -1 })) !== null && G.validate(G.newAnnotation('finish', { process: 'x' })) !== null, 'finish: Ra > 0 and a known process');
  for (const key of Object.keys(G.CHARACTERISTICS)) ok(G.validate(G.newAnnotation('fcf', { char: key })) === null, `newAnnotation default for ${key} is valid`);

  section('GD&T: reading untrusted notes, describing');
  const good = [
    fcf({ id: 'g1', char: 'position', dia: true, tol: 0.25, mod: 'M', datums: [{ letter: 'A', mod: '' }, { letter: 'B', mod: 'M' }] }),
    G.newAnnotation('datum', { id: 'g2', letter: 'A', view: 'top', at: [10, -5], off: [0, 12] }),
    G.newAnnotation('finish', { id: 'g3', ra: 1.6, process: 'removal', note: 'ground\u0007' }),
  ];
  const read = G.readNotes(JSON.parse(JSON.stringify(good)));
  ok(read.length === 3 && read[0].tol === 0.25 && read[1].view === 'top' && read[1].at[0] === 10, 'good notes read back');
  ok(read[2].note === 'ground', 'control characters stripped from text');
  ok(G.readNotes(undefined).length === 0, 'no notes = empty list');
  const tamper = (fn) => { const j = JSON.parse(JSON.stringify(good)); fn(j); try { G.readNotes(j); return false; } catch (e) { return /^Drawing note|^The drawing/.test(e.message); } };
  ok(tamper((j) => { j[1].id = 'g1'; }), 'repeated id refused');
  ok(tamper((j) => { j[0].id = 'x1'; }), 'bad id refused');
  ok(tamper((j) => { j[0].tol = 'big'; }), 'string tolerance refused');
  ok(tamper((j) => { j[0].char = 'wobble'; }), 'unknown characteristic refused');
  ok(tamper((j) => { j[0].at = [0, Infinity]; }), 'infinite attachment refused');
  ok(tamper((j) => { j[0].off = [1e9, 0]; }), 'absurd offset refused');
  ok(tamper((j) => { j[1].view = 'side'; }), 'unknown view refused');
  ok(tamper((j) => { j[1].kind = 'weld'; }), 'unknown kind refused');
  ok(tamper((j) => { j[0].datums = [{ letter: 'A', mod: 'X' }]; }), 'bad datum modifier refused');
  ok(tamper((j) => { j[2].note = 'x'.repeat(80); }) === false, 'an over-long note is cut to 40 characters (not refused)');
  ok((() => { try { G.readNotes(new Array(501).fill(good[1])); return false; } catch { return true; } })(), 'more than 500 notes refused');
  ok(G.describe(good[0]) === 'Position dia 0.25 (M) | A | B (M)', 'describe: ' + G.describe(good[0]));
  ok(G.describe(good[1]) === 'Datum A' && /^Surface finish Ra 1.6 \(machined\)/.test(G.describe(read[2])), 'describe datum and finish');

  section('GD&T: symbol geometry');
  const allNums = (g) => [...g.strokes.flatMap((s) => s.segs.flat()), ...g.fills.flatMap((f) => f.pts.flat()), ...g.texts.flatMap((t) => [t.x, t.y, t.size]), ...g.box];
  const segsOf = (g) => g.strokes.flatMap((s) => s.segs);
  const inBox = (b, x, y, e = 1e-9) => x >= b[0] - e && x <= b[2] + e && y >= b[1] - e && y <= b[3] + e;
  const anchor = [100, 100];
  for (const key of Object.keys(G.CHARACTERISTICS)) {
    const a = G.newAnnotation('fcf', { char: key });
    const g = G.annotationGeometry(a, anchor);
    const cb = g.parts[0].box;
    const inner = segsOf(g).filter((s) => [0, 2].every((i) => inBox([cb[0] + 1e-6, cb[1] + 1e-6, cb[2] - 1e-6, cb[3] - 1e-6], s[i], s[i + 1])));
    const frameW = g.strokes[0].width;
    ok(inner.length >= 1 && frameW >= 0.25 && frameW <= 0.35, `${key}: symbol strokes inside its compartment (${inner.length})`);
    const stray = segsOf(g).filter((s) => { const mx = (s[0] + s[2]) / 2, my = (s[1] + s[3]) / 2; return mx > cb[0] + 1e-6 && mx < cb[2] - 1e-6 && my > cb[1] && my < cb[3] && !inner.includes(s); });
    ok(stray.length === 0, `${key}: nothing leaves the symbol compartment`);
    ok(allNums(g).every(Number.isFinite), `${key}: no NaN`);
    ok(near(cb[3] - cb[1], 2 * G.DRAW.h, 1e-9) && near(cb[2] - cb[0], 2 * G.DRAW.h, 1e-9), `${key}: square compartment 2h`);
  }
  {
    const short = G.annotationGeometry(fcf({ tol: 0.1, datums: [{ letter: 'A', mod: '' }] }), anchor);
    const long = G.annotationGeometry(fcf({ tol: 0.12345, datums: [{ letter: 'A', mod: '' }] }), anchor);
    const w = (g) => g.parts[1].box[2] - g.parts[1].box[0];
    ok(w(long) > w(short) + 3, `tolerance compartment widens with the text (${w(short).toFixed(2)} → ${w(long).toFixed(2)} mm)`);
    const withMod = G.annotationGeometry(fcf({ tol: 0.1, mod: 'M', datums: [{ letter: 'A', mod: '' }] }), anchor);
    ok(w(withMod) > w(short), 'Ⓜ widens the tolerance compartment');
    ok(short.texts.every((t) => [...t.text].every((c) => c.codePointAt(0) <= 0xff)), 'frame texts are Latin-1 only');
    const three = G.annotationGeometry(fcf({ datums: [{ letter: 'A', mod: '' }, { letter: 'B', mod: 'M' }, { letter: 'C', mod: '' }] }), anchor);
    ok(three.parts.length === 5 && three.parts.filter((p) => p.kind === 'datum').map((p) => p.letter).join('') === 'ABC', 'five compartments: symbol, tolerance, A, B, C');
    ok(three.texts.map((t) => t.text).join(' ') === '0.1 A B C', 'frame texts: tolerance and letters');
  }
  {
    // position: circle about the compartment centre + a cross through it
    const g = G.annotationGeometry(fcf({ char: 'position' }), anchor);
    const cb = g.parts[0].box, c = [(cb[0] + cb[2]) / 2, (cb[1] + cb[3]) / 2];
    const inner = segsOf(g).filter((s) => inBox(cb, s[0], s[1]) && inBox(cb, s[2], s[3]));
    const rad = inner.flatMap((s) => [Math.hypot(s[0] - c[0], s[1] - c[1])]);
    const r = 0.6 * 0.75 * G.DRAW.h;
    ok(rad.filter((d) => near(d, r, 1e-9)).length >= 30, 'position: a circle (≥30 points at radius r from the centre)');
    const horiz = inner.filter((s) => near(s[1], c[1], 1e-9) && near(s[3], c[1], 1e-9) && Math.abs(s[2] - s[0]) > 2 * r);
    const vert = inner.filter((s) => near(s[0], c[0], 1e-9) && near(s[2], c[0], 1e-9) && Math.abs(s[3] - s[1]) > 2 * r);
    ok(horiz.length === 1 && vert.length === 1, 'position: horizontal and vertical lines cross the circle, longer than it');
  }
  {
    // leader ends at the anchor (arrowhead tip on it)
    const g = G.annotationGeometry(fcf({ off: [15, 12] }), anchor);
    const lead = g.strokes[1].segs;
    ok(lead.length === 1 && near(lead[0][2], anchor[0]) && near(lead[0][3], anchor[1]), 'fcf leader ends at the anchor');
    ok(g.fills.some((f) => f.pts.some((p) => near(p[0], anchor[0]) && near(p[1], anchor[1]))), 'fcf arrowhead tip at the anchor');
    ok(inBox(g.box, anchor[0], anchor[1]) && inBox(g.box, g.frameBox[2], g.frameBox[3]), 'box covers frame and leader');
  }
  {
    const g = G.annotationGeometry(G.newAnnotation('datum', { letter: 'B', off: [0, 15] }), anchor);
    const T = g.triangle;
    const mid = [(T[0][0] + T[1][0]) / 2, (T[0][1] + T[1][1]) / 2];
    const sides = [0, 1, 2].map((i) => Math.hypot(T[(i + 1) % 3][0] - T[i][0], T[(i + 1) % 3][1] - T[i][1]));
    ok(near(mid[0], anchor[0]) && near(mid[1], anchor[1]), 'datum: filled triangle with its base through the anchor');
    ok(sides.every((s) => near(s, sides[0], 1e-9)), 'datum: the triangle is equilateral');
    ok(near(T[0][1], anchor[1]) && near(T[1][1], anchor[1]) && T[2][1] > anchor[1], 'datum: base on the feature, apex toward the frame');
    const lead = g.strokes[1].segs;
    ok(lead.length === 1 && near(lead[0][2], T[2][0]) && near(lead[0][3], T[2][1]) && near(lead[0][1], g.frameBox[1]), 'datum: leader from the frame to the apex');
    ok(g.texts[0].text === 'B' && near(g.frameBox[2] - g.frameBox[0], 2 * G.DRAW.h), 'datum: letter in a 2h square frame');
    const sl = G.annotationGeometry(G.newAnnotation('datum', { letter: 'C', off: [16, 10] }), anchor);
    const S2 = sl.triangle, ld = sl.strokes[1].segs[0];
    ok(near(S2[0][1], anchor[1]) && near(S2[1][1], anchor[1]) && S2[2][1] > anchor[1] && near(ld[2], S2[2][0]) && near(ld[3], S2[2][1]), 'datum on a slanted leader: base still on the (horizontal) feature, leader to the apex');
    const sd = G.annotationGeometry(G.newAnnotation('datum', { letter: 'D', off: [-20, 3] }), anchor).triangle;
    ok(near(sd[0][0], anchor[0]) && near(sd[1][0], anchor[0]) && sd[2][0] < anchor[0], 'datum to the side: base vertical, apex toward the frame');
  }
  {
    const tip = (g) => [anchor[0], anchor[1]];
    const rem = G.annotationGeometry(G.newAnnotation('finish', { ra: 3.2, process: 'removal', off: [0, 0] }), anchor);
    const legs = segsOf(rem);
    const bar = legs.find((s) => near(s[1], s[3]) && near(s[1], anchor[1] + 1.4 * G.DRAW.h));
    const touch = (p) => legs.filter((s) => (near(s[0], p[0]) && near(s[1], p[1])) || (near(s[2], p[0]) && near(s[3], p[1]))).length;
    ok(!!bar && touch([bar[0], bar[1]]) >= 2 && touch([bar[2], bar[3]]) >= 1, 'finish (removal): the bar closes the V into a triangle');
    ok(legs.filter((s) => (near(s[0], anchor[0]) && near(s[1], anchor[1]))).length === 2, 'finish: both legs start at the tip on the anchor');
    const lg = legs.find((s) => near(s[0], anchor[0]) && near(s[1], anchor[1]) && s[3] - s[1] > 2 * G.DRAW.h);
    ok(!!lg && near(Math.atan2(lg[3] - lg[1], lg[2] - lg[0]) * 180 / Math.PI, 60, 1e-9), 'finish: long leg at 60°, 3h tall');
    ok(rem.texts[0].text === 'Ra 3.2' && rem.strokes[1].segs.length === 0, 'finish: Ra text, no leader when off = 0');
    const nr = G.annotationGeometry(G.newAnnotation('finish', { process: 'noRemoval', off: [0, 0] }), anchor);
    const c = nr.circle;
    const onC = segsOf(nr).filter((s) => near(Math.hypot(s[0] - c.c[0], s[1] - c.c[1]), c.r, 1e-9)).length;
    ok(onC >= 30 && !segsOf(nr).some((s) => near(s[1], s[3]) && near(s[1], anchor[1] + 1.4 * G.DRAW.h)), 'finish (no removal): a circle in the V, no bar');
    // the circle touches both legs (inscribed)
    const d = (c.c[1] - anchor[1]) * Math.sin(Math.PI / 6);
    ok(near(d, c.r, 1e-9), 'finish: the circle is tangent to both legs');
    const any = G.annotationGeometry(G.newAnnotation('finish', { process: 'any', off: [10, 8], note: 'lapped' }), anchor);
    ok(any.strokes[1].segs.length === 1 && near(any.strokes[1].segs[0][2], anchor[0]) && any.texts.some((t) => t.text === 'lapped'), 'finish: leader to the anchor when moved off, note shown');
    for (const g of [rem, nr, any]) ok(allNums(g).every(Number.isFinite), 'finish: no NaN');
    void tip;
  }

  section('GD&T: every symbol on a PDF sheet');
  const strokes = [], fills = [], texts = [];
  const addG = (g) => { strokes.push(...g.strokes); fills.push(...g.fills); texts.push(...g.texts); };
  const keys = Object.keys(G.CHARACTERISTICS);
  keys.forEach((key, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const c = G.CHARACTERISTICS[key];
    const a = G.newAnnotation('fcf', { char: key, dia: c.dia, mod: c.mod ? (i % 4 ? 'M' : 'L') : '', tol: 0.05 * (i + 1), datums: c.datums === 'none' ? [] : [{ letter: 'A', mod: '' }, { letter: 'B', mod: c.mod ? 'M' : '' }] });
    const at = [30 + col * 200, 270 - row * 22];
    addG(G.annotationGeometry({ ...a, off: [8, 6] }, at));
    texts.push({ x: at[0] + 120, y: at[1] + 4, size: 2.5, text: c.label, anchor: 'start' });
  });
  addG(G.annotationGeometry(G.newAnnotation('datum', { letter: 'A', off: [0, 14] }), [40, 40]));
  addG(G.annotationGeometry(G.newAnnotation('datum', { letter: 'C', off: [16, 10] }), [80, 40]));
  addG(G.annotationGeometry(G.newAnnotation('finish', { ra: 1.6, process: 'any', off: [0, 0] }), [140, 40]));
  addG(G.annotationGeometry(G.newAnnotation('finish', { ra: 0.8, process: 'removal', off: [0, 0], note: 'ground' }), [190, 40]));
  addG(G.annotationGeometry(G.newAnnotation('finish', { ra: 12.5, process: 'noRemoval', off: [12, 10] }), [250, 40]));
  strokes.push({ width: 0.5, segs: [[20, 40, 300, 40]] });
  const sheet = { w: 420, h: 297, name: 'GD&T symbols', strokes, fills, texts };
  const { bytes, missing } = await toPdf(sheet);
  ok(missing === 0, 'every text encodes in WinAnsi');
  const TMP = path.join(REPO, 'tmp/partcraft-test');
  fs.mkdirSync(TMP, { recursive: true });
  const pdf = path.join(TMP, 'gdt-symbols.pdf');
  fs.writeFileSync(pdf, bytes);
  const has = (t) => spawnSync('which', [t]).status === 0;
  if (has('pdfinfo') && has('pdftotext')) {
    const info = spawnSync('pdfinfo', [pdf], { encoding: 'utf8' }).stdout;
    ok(/Page size:\s+1190\.55 x 841\.89/.test(info), 'pdfinfo: one A3 page');
    const txt = spawnSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8' }).stdout;
    ok(['Position', 'Total runout', 'Ra 1.6', 'Ra 12.5', 'ground', '0.5'].every((s) => txt.includes(s)), 'pdftotext finds labels, Ra values and tolerances');
    ok(!/[⌀ⓂⓁ]/.test(txt), 'no symbol characters in the text layer (symbols are geometry)');
    if (has('pdftoppm')) { spawnSync('pdftoppm', ['-r', '150', '-png', '-singlefile', pdf, path.join(TMP, 'gdt-symbols')]); ok(fs.existsSync(path.join(TMP, 'gdt-symbols.png')), 'pdftoppm rasterised the sheet (tmp/partcraft-test/gdt-symbols.png)'); }
  } else console.log('  skip poppler checks (pdfinfo/pdftotext missing)');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
  await runGdtTests({ ok, section, near });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
