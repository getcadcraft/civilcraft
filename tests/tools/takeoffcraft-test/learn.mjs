#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * learn.mjs — 0.8 SU.811 (session sx-learn): what TakeoffCraft learns from your takeoffs, without a browser.
 *
 *   node tools/takeoffcraft-test/learn.mjs [--build dev] [--verbose]
 *
 * learn.js (the data: symbols, condition sets, assemblies ranked by use, repeat patterns, the file section) and
 * learn-apply.js (the edits, one undo step each) against hand-worked answers; the project file round trip, a damaged and a
 * hostile `learn`, a newer `learn` version, and the frozen current release opening a file that has the new section;
 * a learned symbol found again by match.js on a generated sheet (the stamps it was learned from and new ones, decoys left
 * out); and the owner's condition: no network and no trained model in any learn*.js file, no "AI" in the copy.
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const BUILD = args.includes('--build') ? args[args.indexOf('--build') + 1] : 'dev';
const VERBOSE = args.includes('--verbose');
const APPS = path.join(ROOT, 'public_html/assets/apps/takeoffcraft');
const APP = path.join(APPS, BUILD);
const load = (f, dir = APP) => import(pathToFileURL(path.join(dir, f)).href);

const I18N = await load('i18n.js');
const EN = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
I18N.init({ strings: EN });
const M = await load('model.js');
const Lr = await load('learn.js');
const La = await load('learn-apply.js');
const C = await load('clipboard.js');
const Mt = await load('match.js');

let pass = 0, fail = 0;
const ok = (cond, name, extra = '') => { if (cond) { pass++; if (VERBOSE) console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const eq = (a, b, name) => ok(JSON.stringify(a) === JSON.stringify(b), name, 'got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b));
const section = (s) => console.log('\n' + s);
const H = (c) => c.repeat(64);
const VIEW = [0, 0, 1224, 792];

// a symbol raster: an asymmetric "outlet" (circle-ish box with a bar and a dot) w × h, ink 0…1
function symbol(w = 24, h = 20, variant = 0) {
  const d = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const edge = x === 1 || y === 1 || x === w - 2 || y === h - 2;
    const bar = variant === 0 ? y === Math.floor(h / 2) && x > 3 && x < w - 8 : x === Math.floor(w / 2) && y > 3 && y < h - 4;   // variant 1: the bar stands up
    const dot = variant === 0 && x >= w - 7 && x <= w - 5 && y >= 3 && y <= 5;
    d[y * w + x] = edge || bar || dot ? 1 : 0;
  }
  return { data: d, w, h };
}

// ---------------------------------------------------------------------------
section('base64 and templates');
{
  let good = true;
  for (let n = 0; n < 40; n++) {
    const b = Uint8Array.from({ length: n }, (_, i) => (i * 97 + n * 13) & 255);
    const back = Lr.fromBase64(Lr.toBase64(b));
    if (!back || back.length !== n || back.some((v, i) => v !== b[i])) good = false;
  }
  ok(good, 'base64 round trip, every length 0…39');
  eq(Lr.toBase64(new TextEncoder().encode('Man')), 'TWFu', 'base64 of "Man" is TWFu (RFC 4648)');
  eq(Lr.toBase64(new TextEncoder().encode('Ma')), 'TWE=', 'base64 padding (one =)');
  ok(Lr.fromBase64('TW=u') === null && Lr.fromBase64('abc') === null && Lr.fromBase64(5) === null, 'bad base64 refused');
  const s = symbol(), p = Lr.packTemplate(s), u = Lr.unpackTemplate(p);
  ok(u.w === 24 && u.h === 20 && u.data.every((v, i) => Math.abs(v - s.data[i]) <= 1 / 510), 'template pack/unpack keeps every pixel (to 1/255)');
  ok(Lr.unpackTemplate({ ...p, w: 25 }) === null && Lr.unpackTemplate({ ...p, w: 3 }) === null && Lr.unpackTemplate({ ...p, w: 161, h: 20 }) === null, 'a template whose size does not match its data, too small or too big is refused');
  ok(Math.abs(Lr.templateNcc(s, s) - 1) < 1e-9, 'NCC of a template with itself = 1');
  const inv = { ...s, data: s.data.map((v) => 1 - v) };
  ok(Lr.templateNcc(s, inv) < -0.99, 'NCC with its negative = −1');
  ok(Lr.templateNcc(s, { data: new Float32Array(480), w: 24, h: 20 }) === 0, 'NCC with a blank template = 0');
  ok(Lr.templateNcc(s, symbol(24, 20, 1)) < Lr.SAME_SYMBOL, 'the same box with its bar standing and no dot is NOT the same symbol (NCC ' + Lr.templateNcc(s, symbol(24, 20, 1)).toFixed(3) + ' < 0.9)');
}

// ---------------------------------------------------------------------------
section('Symbol templates from accepted counts');
{
  const l = Lr.emptyLearn();
  const run = (n, extra = {}) => ({ item: { name: 'Duplex outlet', color: '#d62728', unit: 'EA' }, tpl: symbol(), px: 1.7, ft: 1 / 18, th: 0.8, n, ...extra });
  const a = Lr.learnSymbol(l, run(22));
  ok(a && !a.merged && l.symbols.length === 1, 'an accepted count adds a symbol');
  const s0 = l.symbols[0];
  ok(s0.found === 22 && s0.runs === 1 && s0.th === 0.8 && s0.item.color === '#D62728' && s0.px === 1.7 && s0.ft === 1 / 18, 'it keeps marks accepted, the match level, colour, pixel size and the sheet scale');
  const b = Lr.learnSymbol(l, run(5, { item: { name: 'duplex OUTLET ', color: '#000000', unit: 'EA' }, th: 0.72 }));
  ok(b.merged && b.id === a.id && l.symbols.length === 1 && s0.found === 27 && s0.runs === 2 && s0.th === 0.72, 'the same item (any case) with the same symbol adds to it (22 + 5 = 27, 2 counts, the new match level)');
  const c = Lr.learnSymbol(l, run(3, { tpl: symbol(24, 20, 1) }));
  ok(!c.merged && l.symbols.length === 2, 'the same item with another symbol is a second symbol');
  const d = Lr.learnSymbol(l, run(3, { tpl: symbol(30, 20) }));
  ok(!d.merged && l.symbols.length === 3, 'a symbol 6 px wider is another symbol');
  ok(Lr.learnSymbol(l, run(0)) === null && Lr.learnSymbol(l, run(4, { item: { name: '  ' } })) === null && Lr.learnSymbol(l, run(4, { tpl: symbol(3, 3) })) === null, 'nothing accepted, no name or a tiny box: nothing learned');
  l.off = true;
  ok(Lr.learnSymbol(l, run(9)) === null && l.symbols.length === 3, 'learning switched off: nothing new is learned');
  ok(!Lr.symbolUsed(l, a.id, 4), 'switched off: a learned symbol is not counted either');
  delete l.off;
  ok(Lr.symbolUsed(l, a.id, 4, 0.9) && s0.found === 31 && s0.runs === 3 && s0.th === 0.9, 'finding a learned symbol again and accepting 4 counts them (31, 3 counts)');
  eq(Lr.searchScales({ px: 2, ft: 1 / 48 }, 1 / 48), [2], 'same scale: one pixel size');
  eq(Lr.searchScales({ px: 2, ft: 1 / 48 }, 1 / 96), [1, 2], 'a sheet at half the scale: the symbol drawn to scale (half the pixels) and the paper-size tag (same)');
  eq(Lr.searchScales({ px: 2, ft: null }, 1 / 96), [2], 'learned on an unscaled sheet: its own pixel size only');
  const big = Lr.emptyLearn();
  for (let i = 0; i < Lr.LEARN_LIMITS.symbols; i++) Lr.learnSymbol(big, run(10 + i, { item: { name: 'S' + i }, at: '2026-10-27T00:00:00Z' }));
  Lr.learnSymbol(big, run(500, { item: { name: 'new' } }));
  ok(big.symbols.length === 100 && !big.symbols.some((s) => s.item.name === 'S0') && big.symbols.some((s) => s.item.name === 'new'), 'over 100 symbols the least-found one goes');
}

// ---------------------------------------------------------------------------
section('A learned symbol found again by Auto count\'s matcher (match.js)');
{
  // a generated sheet: 6 stamps of the outlet (2 rotated 90°), 4 decoys (the same box, bar standing, no dot)
  const W = 400, Hh = 300, img = { data: new Float32Array(W * Hh), w: W, h: Hh };
  const stamp = (tpl, x0, y0) => { for (let y = 0; y < tpl.h; y++) for (let x = 0; x < tpl.w; x++) img.data[(y0 + y) * W + x0 + x] = Math.max(img.data[(y0 + y) * W + x0 + x], tpl.data[y * tpl.w + x]); };
  const sym = symbol(), r90 = Mt.rot90(sym), decoy = symbol(24, 20, 1);
  const real = [[20, 20], [100, 30], [200, 40], [300, 200], [40, 220], [150, 150]];
  real.slice(0, 4).forEach(([x, y]) => stamp(sym, x, y));
  real.slice(4).forEach(([x, y]) => stamp(r90, x, y));
  const decoys = [[60, 100], [250, 120], [320, 30], [200, 240]];
  decoys.forEach(([x, y]) => stamp(decoy, x, y));
  // the person boxed the first stamp and accepted: the template the page keeps (trimmed like runAutoCount trims it)
  const tpl = Mt.trim(Mt.crop(img, 16, 16, 32, 28));
  const l = Lr.emptyLearn();
  Lr.learnSymbol(l, { item: { name: 'Duplex outlet' }, tpl, px: 1, ft: null, th: 0.84, n: 6 });
  // a later job: the template comes back out of the file and match.js searches with it
  const file = JSON.parse(JSON.stringify(l));
  const back = Lr.unpackTemplate(file.symbols[0].tpl);
  const cands = Mt.suppress(Mt.findSymbol(img, back, { floor: 0.5 }), file.symbols[0].th);
  const centers = cands.map((c) => [c.x + c.w / 2, c.y + c.h / 2]);
  const hit = (x, y, w, h) => centers.some(([cx, cy]) => cx > x && cx < x + w && cy > y && cy < y + h);
  const found = real.filter(([x, y], i) => hit(x, y, i < 4 ? 24 : 20, i < 4 ? 20 : 24)).length;
  const falses = decoys.filter(([x, y]) => hit(x, y, 24, 20)).length;
  ok(found === 6, 'all 6 stamps found with the learned template at the learned match level 84% (incl. 2 rotated 90°)', found + ' of 6');
  ok(falses === 0 && cands.length === 6, 'none of the 4 look-alike decoys (same box, other inside) is taken; 6 boxes in all', 'decoys ' + falses + ', boxes ' + cands.length);
}

// ---------------------------------------------------------------------------
section('Condition sets ("Same as last job")');
const mk = () => {
  const t = new M.Takeoff();
  t.addFile({ hash: H('a'), name: 'A.pdf', size: 1, pages: 2 });
  return t;
};
{
  const t = mk();
  const wall = t.addItem({ name: 'Wall type A', type: 'linear', heightFt: 9, mat: 12500, waste: 500 });
  t.addComponent(wall, { name: 'Studs', unit: 'EA', formula: 'ceil(L / 1.333) + 1' });
  const outl = t.addItem({ name: 'Duplex outlet', type: 'count', color: '#2CA02C' });
  t.setCond(wall, 'count', true);
  const l = Lr.emptyLearn();
  const id = Lr.saveSet(l, 'Office fit-out', t.state.items);
  ok(id && l.sets.length === 1 && l.sets[0].items.length === 2, 'saving this takeoff\'s 2 conditions as a set');
  const si = l.sets[0].items[0];
  ok(!('id' in si) && si.heightFt === 9 && si.mat === 12500 && si.waste === 500 && si.components[0].formula === 'ceil(L / 1.333) + 1' && si.conds?.[0]?.kind === 'count', 'a set keeps units, rates, waste, height, second conditions and the assembly (no ids)');
  ok(Lr.saveSet(l, 'office FIT-OUT', [t.state.items[1]]) === id && l.sets.length === 1 && l.sets[0].items.length === 1, 'saving under the same name replaces the set in place');
  ok(Lr.saveSet(l, '', t.state.items) === null && Lr.saveSet(l, 'x', []) === null, 'no name or nothing to keep: nothing saved');
  Lr.saveSet(l, 'Office fit-out', t.state.items);
  // a new job with one of them already
  const n = mk();
  n.addItem({ name: 'duplex outlet', type: 'count' });
  const plan = Lr.setPlan(l.sets[0], n.state.items);
  ok(plan.add.length === 1 && plan.add[0].name === 'Wall type A' && plan.have[0] === 'Duplex outlet', 'the plan adds only what the new job lacks (same name and type, any case)');
  const steps = n.undoStack.length;
  const r = La.applySet(n, l.sets[0]);
  ok(r.ids.length === 1 && n.undoStack.length === steps + 1, 'adding the set = one undo step');
  const added = n.item(r.ids[0]);
  ok(added.name === 'Wall type A' && added.components.length === 1 && added.components[0].id !== 'c1' && added.heightFt === 9, 'the condition comes back with its assembly and fresh ids');
  n.undo();
  ok(!n.state.items.some((i) => i.name === 'Wall type A'), 'one undo takes it back');
  ok(La.applySet(n, { name: 'x', items: [Lr.setItem(n.state.items[0])] }).ids.length === 0 && n.undoStack.length === steps, 'a set that is all here adds nothing and no undo step');
  void outl;
}

// ---------------------------------------------------------------------------
section('Assemblies ranked by how often they were used');
{
  const job = (hashes, items) => {
    const t = new M.Takeoff();
    hashes.forEach((h, i) => t.addFile({ hash: H(h), name: 'P' + i + '.pdf', size: 1, pages: 1 }));
    const sheet = H(hashes[0]) + ':0';
    for (const [name, type, parts, marks] of items) {
      const id = t.addItem({ name, type, ...(type === 'fixed' ? { qty: marks } : {}) });
      for (let k = 0; k < parts; k++) t.addComponent(id, { name: 'Part ' + k, formula: 'N' });
      for (let k = 0; k < (type === 'fixed' ? 0 : marks); k++) t.addMark({ item: id, sheet, pts: type === 'count' ? [{ x: k, y: 0 }] : [{ x: 0, y: k }, { x: 10, y: k }] });
    }
    return t;
  };
  ok(Lr.jobKey({ files: [{ hash: H('a') }, { hash: H('b') }] }) === Lr.jobKey({ files: [{ hash: H('b') }, { hash: H('a') }] }), 'a job is its plan files, in any order');
  ok(Lr.jobKey({ files: [{ hash: H('a') }] }) !== Lr.jobKey({ files: [{ hash: H('a') }, { hash: H('b') }] }) && /^j[0-9a-f]{16}$/.test(Lr.jobKey({ files: [{ hash: H('a') }] })), 'other plans = another job; the key is j + 16 hex');
  eq(Lr.jobKey({ files: [] }), '', 'no plans: not a job yet');
  const j1 = job(['a'], [['Wall A', 'linear', 2, 1], ['Outlet', 'count', 1, 3], ['No parts', 'count', 0, 2], ['Unused', 'area', 1, 0], ['Allowance', 'fixed', 1, 5]]);
  let asm = Lr.withJob([], j1.state, '2026-10-01T00:00:00Z');
  eq(asm.map((a) => a.name + ':' + a.uses).sort(), ['Allowance:1', 'Outlet:1', 'Wall A:1'], 'job 1: items with an assembly AND a quantity count once (no parts / no marks do not)');
  asm = Lr.withJob(asm, j1.state, '2026-10-02T00:00:00Z');
  ok(asm.every((a) => a.uses === 1), 'saving the same job again does not count again');
  const j2 = job(['b'], [['Outlet', 'count', 3, 1]]);
  asm = Lr.withJob(asm, j2.state, '2026-10-05T00:00:00Z');
  const o = asm.find((a) => a.name === 'Outlet');
  ok(o.uses === 2 && o.item.components.length === 3 && o.last === '2026-10-05T00:00:00Z', 'a second job counts again, and the latest version of the assembly is kept (3 parts)');
  const j3 = job(['c'], [['outlet', 'count', 1, 1], ['Wall A', 'linear', 2, 1]]);
  asm = Lr.withJob(asm, j3.state, '2026-10-06T00:00:00Z');
  const l = { ...Lr.emptyLearn(), asm };
  eq(Lr.rankAssemblies(l).map((a) => a.name + ':' + a.uses), ['Outlet:3', 'Wall A:2', 'Allowance:1'], 'ranked: most used first (Outlet 3 jobs, Wall A 2, Allowance 1); the first name it saw is kept');
  eq(Lr.rankAssemblies(l, { type: 'linear' }).map((a) => a.name), ['Wall A'], 'filtered by type');
  eq(Lr.rankAssemblies(l, { q: 'wal' }).map((a) => a.name), ['Wall A'], 'filtered by words in the name');
  const fresh = job(['d'], [['Outlet', 'count', 1, 0]]);
  eq(Lr.rankAssemblies(l, { state: fresh.state }).map((a) => a.name), ['Wall A', 'Allowance'], 'with a takeoff: the ones it has are left out');
  const tie = { ...Lr.emptyLearn(), asm: [{ name: 'B', type: 'count', uses: 2, jobs: [], last: '2026-10-01T00:00:00Z', item: Lr.setItem(fresh.state.items[0]) }, { name: 'A', type: 'count', uses: 2, jobs: [], last: '2026-10-09T00:00:00Z', item: Lr.setItem(fresh.state.items[0]) }] };
  eq(Lr.rankAssemblies(tie).map((a) => a.name), ['A', 'B'], 'same number of jobs: the most recent first');
  const steps = fresh.undoStack.length;
  const wa = Lr.rankAssemblies(l, { state: fresh.state })[0];
  const id = La.applyAssembly(fresh, wa);
  ok(id && fresh.undoStack.length === steps + 1 && fresh.item(id).components.length === 2 && fresh.item(id).name === 'Wall A', 'adding a suggestion = one undo step, the item with its 2 parts');
  ok(La.applyAssembly(fresh, wa) === null, 'adding it again does nothing (it is here)');
  const off = { ...l, off: true };
  ok(Lr.writeLearn(off, job(['z'], [['New one', 'count', 1, 1]]).state).asm.length === asm.length, 'learning off: a save adds no new assembly use');
}

// ---------------------------------------------------------------------------
section('Repeat on every page');
{
  const t = new M.Takeoff();
  t.addFile({ hash: H('a'), name: 'A.pdf', size: 1, pages: 4 });
  t.addFile({ hash: H('b'), name: 'B.pdf', size: 1, pages: 1 });
  const k = (h, i) => H(h) + ':' + i;
  const sc = { method: 'preset', ftPerUnit: 1 / 18, preset: 'a-1/4', label: '1/4" = 1\'-0"', cal: null };
  t.setScale(k('a', 0), sc); t.setScale(k('a', 1), sc); t.setScale(k('a', 2), { ...sc, ftPerUnit: 1 / 36, label: '1/8" = 1\'-0"' });
  const tb = t.addItem({ name: 'Title block stamp', type: 'count' });
  const run = t.addItem({ name: 'Border run', type: 'linear' });
  const m1 = t.addMark({ item: tb, sheet: k('a', 0), pts: [{ x: 1100, y: 60 }] });
  const m2 = t.addMark({ item: run, sheet: k('a', 0), pts: [{ x: 10, y: 10 }, { x: 1214, y: 10 }], deducts: [] });
  const wire = C.copyMarks(t.state, [m1, m2], { view: VIEW, userUnit: 1 });
  const clip = C.readClip(JSON.parse(JSON.stringify(wire))).clip;
  const tg = (h, i, view = VIEW) => ({ key: k(h, i), view, userUnit: 1, ftPerUnit: t.scaleOf(k(h, i))?.ftPerUnit || null, label: t.scaleOf(k(h, i))?.label || '' });
  const targets = [tg('a', 0), tg('a', 1), tg('a', 2), tg('a', 3), tg('b', 0, [0, 0, 612, 792])];
  const plan = La.repeatPlan(clip, targets, t.state);
  eq(plan.sheets, [k('a', 1)], 'with a length in the pattern: only the page of the same size AND scale takes it');
  const why = Object.fromEntries(plan.skipped.map((s) => [s.key, s.why]));
  ok(why[k('a', 0)] === I18N.t('sx.su811.rep.already'), 'the page it came from: already there');
  ok(/scale/i.test(why[k('a', 2)]) && /scale/i.test(why[k('a', 3)]) && /17|8\.5|11/.test(why[k('b', 0)]), 'other scale, no scale and another page size are left out, each with its reason', JSON.stringify(why));
  const steps = t.undoStack.length;
  const out = La.repeatOnSheets(t, clip, plan.sheets, { wire, learn: { name: 'Title block' } });
  ok(out.marks === 2 && out.sheets === 1 && t.undoStack.length === steps + 1, 'repeated: 2 marks on 1 page, one undo step');
  const placed = t.marksOn(k('a', 1));
  ok(placed.length === 2 && placed.find((m) => m.kind === 'count').pts[0].x === 1100 && placed.find((m) => m.kind === 'linear').pts[1].x === 1214, 'at the same place, on the existing items');
  ok(t.state.learn?.repeats.length === 1 && t.state.learn.repeats[0].name === 'Title block' && t.state.learn.repeats[0].uses === 1, 'the pattern is learned in the same step');
  ok(La.repeatPlan(clip, [tg('a', 1)], t.state).sheets.length === 0, 'repeating again: that page has it already');
  t.undo();
  ok(t.marksOn(k('a', 1)).length === 0 && !t.state.learn, 'one undo takes the marks AND the learned pattern back');
  t.redo();
  ok(t.marksOn(k('a', 1)).length === 2 && t.state.learn.repeats.length === 1, 'redo brings both');
  // counts only: any scale, also no scale
  const wire2 = C.copyMarks(t.state, [m1], { view: VIEW, userUnit: 1 });
  const clip2 = C.readClip(JSON.parse(JSON.stringify(wire2))).clip;
  eq(La.repeatPlan(clip2, targets, t.state).sheets, [k('a', 2), k('a', 3)], 'counts only: every page of the same size, whatever its scale (also unscaled)');
  // a learned pattern used on a page opened later
  const rep = t.state.learn.repeats[0];
  const pc = La.patternClip(rep);
  ok(pc.ok && pc.clip.marks.length === 2, 'a learned pattern is validated by the clipboard\'s own checks before use');
  t.setScale(k('a', 3), sc);
  const p3 = La.repeatPlan(pc.clip, [tg('a', 3)], t.state);
  La.repeatOnSheets(t, pc.clip, p3.sheets, { learn: { id: rep.id } });
  ok(t.marksOn(k('a', 3)).length === 2 && t.state.learn.repeats[0].uses === 2, 'repeated on a page that got its scale later; the pattern counts 2 uses');
  // an item that is not in the takeoff is added once with its assembly
  const n = new M.Takeoff();
  n.addFile({ hash: H('c'), name: 'C.pdf', size: 1, pages: 2 });
  const o2 = La.repeatOnSheets(n, clip2, [H('c') + ':0', H('c') + ':1']);
  ok(o2.items.length === 1 && n.state.items.length === 1 && n.state.marks.length === 2, 'in a takeoff without the item: it is added once, a mark on each page');
  ok(La.repeatOnSheets(n, clip2, []) === false, 'no pages: nothing done');
  const bad = La.patternClip({ clip: { format: 'takeoffcraft-clip', version: 1, items: [], marks: [{ item: 'x', kind: 'count', pts: [[0, 0]] }] } });
  ok(!bad.ok, 'a damaged pattern is refused by readClip');
}

// ---------------------------------------------------------------------------
section('Seeing, deleting, Clear all, bringing in another takeoff\'s');
{
  const l = Lr.emptyLearn();
  Lr.learnSymbol(l, { item: { name: 'Outlet' }, tpl: symbol(), px: 1, n: 3 });
  Lr.saveSet(l, 'Set A', [M.normalItem({ id: 'i1', name: 'Wall', type: 'linear' })]);
  l.asm.push({ name: 'Wall', type: 'linear', uses: 2, jobs: [], last: '', item: Lr.setItem(M.normalItem({ id: 'i1', name: 'Wall', type: 'linear', components: [{ id: 'c1', name: 'Studs', formula: 'L' }] })) });
  Lr.saveRepeat(l, 'Stamp', { format: 'takeoffcraft-clip', version: 1, items: [], marks: [{ item: 'i1', kind: 'count', pts: [[0, 0]] }] });
  const rows = Lr.learnedRows(l);
  eq(rows.map((r) => r.kind + ':' + r.name), ['symbols:Outlet', 'sets:Set A', 'asm:Wall', 'repeats:Stamp'], 'every learned thing is listed');
  eq(Lr.learnedCount(l), 4, 'counted: 4');
  ok(Lr.forget(l, 'asm', 'linear:wall') && l.asm.length === 0, 'an assembly is deleted by its type and name');
  ok(!Lr.forget(l, 'symbols', 'nope') && !Lr.forget(l, 'bogus', 'x'), 'an unknown id or kind deletes nothing');
  const other = Lr.emptyLearn();
  Lr.learnSymbol(other, { item: { name: 'Switch' }, tpl: symbol(30, 20), px: 1, n: 2 });
  other.symbols.push(JSON.parse(JSON.stringify(l.symbols[0])));                     // the same one
  Lr.saveSet(other, 'Set A', [M.normalItem({ id: 'i1', name: 'Other', type: 'count' })]);
  Lr.saveSet(other, 'Set B', [M.normalItem({ id: 'i1', name: 'Other', type: 'count' })]);
  other.asm.push({ name: 'Roof', type: 'area', uses: 4, jobs: ['j0000000000000001'], last: '2026-10-01T00:00:00Z', item: Lr.setItem(M.normalItem({ id: 'i', name: 'Roof', type: 'area', components: [{ id: 'c1', name: 'Shingles', formula: 'A/100' }] })) });
  const m = Lr.mergeLearn(l, other);
  eq(m, { symbols: 1, sets: 1, asm: 1, repeats: 0 }, 'bringing in: the new symbol, the set with a free name and the assembly (not the duplicate symbol, not "Set A" again)');
  ok(l.sets.find((s) => s.name === 'Set A').items[0].name === 'Wall', 'a set of the same name is kept as it was here');
  Lr.mergeLearn(l, { ...Lr.emptyLearn(), asm: [{ ...other.asm[0], uses: 1, jobs: ['j0000000000000002'], last: '2026-09-01T00:00:00Z' }] });
  const roof = l.asm.find((a) => a.name === 'Roof');
  ok(roof.uses === 4 && roof.jobs.length === 2, 'assemblies merged: the larger count, jobs joined');
  const n = Lr.forgetAll(l);
  ok(n === 6 && Lr.learnedCount(l) === 0, 'Clear all deletes everything learned (6)');
  // the edits through the model: one undo step each
  const t = mk();
  La.changeLearn(t, 'x', (x) => { Lr.saveSet(x, 'S', [M.normalItem({ id: 'i1', name: 'W', type: 'linear' })]); });
  ok(t.state.learn.sets.length === 1 && t.dirty, 'a learn change is an undo step and marks the takeoff unsaved');
  La.changeLearn(t, 'clear', (x) => (Lr.forgetAll(x) ? undefined : false));
  ok(t.state.learn.sets.length === 0, 'Clear all through the model');
  t.undo();
  ok(t.state.learn.sets.length === 1, 'undo brings it back');
  const before = t.undoStack.length;
  ok(La.changeLearn(t, 'nothing', (x) => (Lr.forget(x, 'sets', 'nope') ? undefined : false)) === false && t.undoStack.length === before, 'deleting nothing records no undo step');
}

// ---------------------------------------------------------------------------
section('The project file: the optional `learn` section');
{
  const t = mk();
  const sheet = H('a') + ':0';
  const it = t.addItem({ name: 'Outlet', type: 'count' });
  t.addComponent(it, { name: 'Box', formula: 'N' });
  t.addMark({ item: it, sheet, pts: [{ x: 5, y: 5 }] });
  const plain = JSON.parse(JSON.stringify(t.toJSON('2026-10-27T00:00:00Z')));
  ok(!('learn' in plain), 'a takeoff that never learned anything writes no `learn` key (the file is as before)');
  t.state.learn = Lr.emptyLearn();
  Lr.learnSymbol(t.state.learn, { item: { name: 'Outlet', color: '#1F77B4' }, tpl: symbol(), px: 1.5, ft: 1 / 48, th: 0.8, n: 4, at: '2026-10-27T01:00:00Z' });
  Lr.saveSet(t.state.learn, 'Base', t.state.items, '2026-10-27T01:00:00Z');
  const json = JSON.parse(JSON.stringify(t.toJSON('2026-10-27T00:00:00Z')));
  ok(json.format === 'takeoffcraft-project' && json.version === 1 && json.learn?.v === 1, 'the file stays takeoffcraft-project version 1, with learn.v 1');
  ok(json.learn.asm.length === 1 && json.learn.asm[0].uses === 1 && json.learn.asm[0].jobs[0] === Lr.jobKey(t.state), 'saving counts this job\'s assembly (Outlet, 1 job)');
  ok(!t.state.learn.asm.length, '…without changing the takeoff itself (the count is made for the file)');
  const r = M.readProject(json);
  ok(r.ok && r.warnings.length === 0, 'it reads back with no warning');
  eq(r.state.learn.symbols, json.learn.symbols, 'symbols read back identical');
  eq(r.state.learn.sets, json.learn.sets, 'sets read back identical');
  eq(r.state.learn.asm, json.learn.asm, 'assemblies read back identical');
  const t2 = new M.Takeoff();
  t2.load(json);
  const again = JSON.parse(JSON.stringify(t2.toJSON('2026-10-27T00:00:00Z')));
  ok(again.learn.asm[0].uses === 1, 'open and save again: the same job still counts once');
  // older builds: the current frozen release (0.7) reads the new file and ignores the section
  const REL = fs.realpathSync(path.join(APPS, 'current'));
  const I18N_OLD = await load('i18n.js', REL);
  I18N_OLD.init({ strings: JSON.parse(fs.readFileSync(path.join(REL, 'lang/en.json'), 'utf8')) });
  const Mold = await load('model.js', REL);
  const ro = Mold.readProject(json);
  ok(ro.ok && ro.state.items.length === 1 && ro.state.marks.length === 1 && !('learn' in ro.state), 'the frozen release ' + path.basename(REL) + ' opens a file with `learn`: items and marks intact, the section ignored');
  // a file without the section opens here with nothing learned
  const r0 = M.readProject(plain);
  ok(r0.ok && !r0.state.learn, 'a file without `learn` opens with nothing learned');
  // a newer learn version: the rest opens, a warning says what was left out
  const rn = M.readProject({ ...json, learn: { ...json.learn, v: 2 } });
  ok(rn.ok && !rn.state.learn && rn.warnings.includes(I18N.t('sx.su811.file.newer')) && rn.state.items.length === 1, 'learn.v 2 (newer): left out with a warning, the takeoff opens');
  const rb = M.readProject({ ...json, learn: 'hello' });
  ok(rb.ok && !rb.state.learn && rb.warnings.includes(I18N.t('sx.su811.file.bad')), 'a learn that is not an object: left out with a warning');
  // damaged and hostile parts
  const bad = JSON.parse(JSON.stringify(json));
  bad.learn.symbols.push({ ...bad.learn.symbols[0], id: 's-x', tpl: { w: 24, h: 20, ink: 'AAAA' } });                        // data does not match its size
  bad.learn.symbols.push({ ...bad.learn.symbols[0], id: bad.learn.symbols[0].id });                                       // repeated id
  bad.learn.symbols.push({ ...bad.learn.symbols[0], id: '<script>' });                                                    // bad id
  bad.learn.symbols[0].item.name = 'Out\u0000let\u001b[31m';
  bad.learn.symbols[0].th = 7; bad.learn.symbols[0].found = -3;
  bad.learn.sets.push({ id: 'k-empty', name: 'Empty', items: [] });
  bad.learn.sets[0].items.push({ name: 'Hack', type: 'linear', __proto__: { polluted: true }, components: [{ name: 'x', formula: 'constructor' }] });
  bad.learn.asm.push({ name: 'No parts', type: 'count', item: { name: 'No parts', type: 'count', components: [] } });
  bad.learn.asm.push({ ...bad.learn.asm[0], jobs: ['nope', 'j0123456789abcdef'], uses: 1e12 });
  bad.learn.repeats = [{ id: 'r1', name: 'Big', clip: { items: [], marks: Array.from({ length: 2001 }, () => ({})) } }, { id: 'r2', name: 'Ok', clip: { items: [], marks: [{}] }, uses: 2 }];
  const rd = M.readProject(bad);
  const L = rd.state.learn;
  ok(rd.ok && L.symbols.length === 1, 'symbols with damaged rasters, repeated or bad ids are dropped (1 kept)');
  ok(L.symbols[0].item.name === 'Out let [31m' && L.symbols[0].th === 0.75 && L.symbols[0].found === 0, 'control characters stripped; an impossible match level or count reset');
  ok(L.sets.length === 1 && L.sets[0].items.length === 2 && !('polluted' in L.sets[0].items[1]) && L.sets[0].items[1].components[0].formula === 'constructor', 'a set with no items is dropped; set items are normalised like any item (formulas stay text: the formula parser refuses them when used)');
  ok(L.asm.length === 1 && L.asm[0].uses === 1, 'an assembly with no parts or a repeated name is dropped');
  ok(L.repeats.length === 1 && L.repeats[0].name === 'Ok', 'a pattern over 2000 marks is dropped');
  ok(rd.warnings.some((w) => w === I18N.t('sx.su811.file.dropped', { n: 7 })), 'one warning says how many learned things were left out (7)', JSON.stringify(rd.warnings));
}

// ---------------------------------------------------------------------------
section('The owner\'s condition: nothing sent anywhere, no trained model, honest copy');
{
  const files = ['learn.js', 'learn-apply.js', 'learn-ui.js'];
  const NET = /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|RTCPeerConnection|importScripts|navigator\.(?:share|serviceWorker)|https?:\/\//;
  const ML = /tensorflow|\btf\.|onnx|ml5|brain\.js|transformers|openai|anthropic|\bllm\b|neural|embedding|hailey/i;
  for (const f of files) {
    const src = fs.readFileSync(path.join(APP, f), 'utf8').replace(/^\s*(?:\/\/|\*|\/\*).*$/gm, '');   // code, not comments
    ok(!NET.test(src), f + ': no network call', (src.match(NET) || [])[0]);
    ok(!ML.test(src), f + ': no trained model or AI service', (src.match(ML) || [])[0]);
  }
  const imports = files.flatMap((f) => [...fs.readFileSync(path.join(APP, f), 'utf8').matchAll(/^import .* from "([^"]+)";/gm)].map((m) => m[1]));
  ok(imports.every((s) => s.startsWith('./')), 'learn*.js import only the app\'s own files: ' + [...new Set(imports)].join(' '));
  const copy = Object.entries(EN).filter(([k]) => k.startsWith('sx.su811.')).map(([, v]) => (typeof v === 'string' ? v : Object.values(v).join(' '))).join(' ');
  ok(copy.length > 2000 && !/\bAI\b|artificial intelligence|machine learning|\bsmart\b|intelligent/i.test(copy), 'the copy never calls it AI (' + Object.keys(EN).filter((k) => k.startsWith('sx.su811.')).length + ' strings)');
  ok(/nothing is sent anywhere/i.test(EN['sx.su811.lead']) && /not a trained model/i.test(EN['sx.su811.lead']), 'the dialog says what it does: learns from what you accept, kept in the file, nothing sent, not a trained model');
  const used = new Set(files.flatMap((f) => [...fs.readFileSync(path.join(APP, f), 'utf8').matchAll(/['"](sx\.su811\.[a-z0-9._]+)['"]/g)].map((m) => m[1])));
  const missing = [...used].filter((k) => !(k in EN));
  ok(!missing.length, 'every sx.su811 key the code uses is in en.json (' + used.size + ')', missing.join(' '));
  ok(!I18N.missing().length, 'no string asked for that the language file lacks', I18N.missing().join(' '));
}

console.log(`\nlearn (SU.811): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
