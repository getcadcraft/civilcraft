#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-offcuts.mjs — 0.7 SU.755 in PartCraft: the offcut stock in the Nest dialog (nest-ui.js on nest/nest-stock.js).
 * A job on new plates leaves numbered remnants; committing it puts them in the stock; the next job (same material and
 * thickness) lays its parts on a remnant first; a different material does not; the stock is saved with the part and the
 * assembly file and survives a tampered file; a roll keeps the old path.
 *   node tools/partcraft-test/test-offcuts.mjs [--verbose]    (or runOffcutTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

export async function runOffcutTests({ ok, section }) {
  await import(path.join(HERE, 'fixtures.mjs'));
  const NU = await import(DEV + 'nest-ui.js');
  const ST = await import(DEV + 'nest/nest-stock.js');
  const P = await import(DEV + 'part.js');
  const A = await import(DEV + 'assembly.js');
  const rect = (w, h) => [[{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }]];
  const settings = { kind: 'plate', w: 400, h: 300, margin: 5, spacing: 4, step: 90, material: 'Steel', thickness: 3 };

  section('offcut stock in the nest dialog (0.7 SU.755)');
  let stock = ST.newStock();
  const first = NU.runNest([{ name: 'Bracket', loops: rect(150, 100), qty: 2, grain: '' }], settings, { stock, timeLimit: 3000 });
  ok(first.stocked && first.result.plates === 1 && first.result.remnants.length >= 1 && first.result.uses.length === 0, `no stock yet: ${first.result.plates} new plate, ${first.result.remnants.length} leftover piece(s) to keep`);
  const done = ST.applyJob(stock, first.result, { name: 'job 1', date: '2026-10-23', material: 'Steel', thickness: 3 });
  stock = done.stock;
  ok(done.added.length === first.result.remnants.length && stock.items.every((it) => /^R-\d{4}$/.test(it.id) && it.status === 'available' && it.material === 'Steel'), `committed: ${done.added.map((i) => i.id).join(', ')} available, Steel 3 mm`);
  const small = [{ name: 'Tab', loops: rect(40, 30), qty: 1, grain: '' }];
  const second = NU.runNest(small, settings, { stock, timeLimit: 3000 });
  ok(second.result.uses.length === 1 && second.result.plates === 0, `the next job lays its part on remnant ${second.result.uses[0]?.id} and needs no new plate`);
  ok(ST.checkRemnants(second.result, { spacing: 4 }).length === 0, 'the exact re-check: no remnant touches a part');
  const other = NU.runNest(small, { ...settings, material: 'Aluminium' }, { stock, timeLimit: 3000 });
  ok(other.result.uses.length === 0 && other.result.plates === 1, 'another material does not use the steel remnants');
  const off = NU.runNest(small, { ...settings, useStock: false, saveRemnants: false }, { stock, timeLimit: 3000 });
  ok(!off.stocked && !off.result.sheetShapes, 'with both boxes off the nest is the plain one');
  const roll = NU.runNest(small, { ...settings, kind: 'roll' }, { stock, timeLimit: 3000 });
  ok(!roll.stocked, 'a roll keeps the plain nest (no remnants)');
  const used = ST.applyJob(stock, second.result, { name: 'job 2', date: '2026-10-23', material: 'Steel', thickness: 3 });
  ok(used.stock.items.find((i) => i.id === second.result.uses[0].id).status === 'used' && used.stock.items.length > stock.items.length, 'committing marks the remnant used and keeps what was left of it');
  ok(/Number,Status/.test(ST.stockCsv(used.stock)) && ST.stockCsv(used.stock).split('\n').length > 3, 'the stock list as CSV');

  section('the stock is saved with the file (0.7 SU.755)');
  const part = P.newPart('Stocked');
  part.stock = used.stock;
  const back = P.readPart(P.toJSON(part));
  ok(back.stock && back.stock.items.length === used.stock.items.length && back.stock.items[0].loops.length >= 1, `a part file keeps ${back.stock?.items.length} stock rows`);
  ok(!P.readPart(P.toJSON(P.newPart('Plain'))).stock, 'a part without stock writes none');
  const j = JSON.parse(P.toJSON(part)); j.stock.items[0].w = 'x'; j.stock.items.push({ id: 'junk' });
  const bad = P.readPart(JSON.stringify(j));
  ok(bad.stock.items.every((i) => Number.isFinite(i.w)), 'a tampered stock row is dropped or cleaned, the part still opens');
  const asm = A.newAssembly ? A.newAssembly('Asm') : null;
  if (asm) { asm.stock = used.stock; const ab = A.readAssembly(A.toJSON(asm)); ok(ab.stock && ab.stock.items.length === used.stock.items.length, 'an assembly file keeps the stock'); }
  section('laser program: flat parts to the panel (0.7 SU.772)');
  {
    const LU = await import(DEV + 'laser-ui.js');
    const LM = await import(DEV + 'laser/laser-model.js');
    const LP = await import(DEV + 'laser/laser-plan.js');
    const LG = await import(DEV + 'laser/laser-gcode.js');
    const seg = (a, b) => ({ type: 'line', a, b });
    const flat = { segs: [seg([0, 0], [80, 0]), seg([80, 0], [80, 50]), seg([80, 50], [0, 50]), seg([0, 50], [0, 0]), { type: 'circle', c: [40, 25], r: 6 }], bends: [{ a: [40, 0], b: [40, 50], angle: 90, r: 2, up: true, name: 'Flange' }] };
    const inp = LU.flatInput([flat, flat]);
    const cut = inp.shapes.find((x) => x.layer === 'CUT'), bends = inp.shapes.filter((x) => x.layer === 'BEND');
    const xs = cut.loops.flat().map((p) => p.x);
    ok(cut.loops.length === 4 && bends.length === 2 && bends.every((b) => b.closed === false), `two flat patterns: CUT has outline + hole each (${cut.loops.length} loops), BEND has ${bends.length} open lines`);
    ok(Math.min(...xs) === 0 && Math.max(...xs) === 170, 'laid side by side 10 mm apart (0 … 170 mm)');
    const job = LM.cleanJob({ layers: [{ name: 'CUT', mode: 'cut', power: 80, speed: 600, passes: 1 }, { name: 'BEND', mode: 'score', power: 20, speed: 900, passes: 1 }] });
    const plan = LP.plan(LM.jobFor(job, ['CUT', 'BEND']), inp);
    const g = LG.gcode(LM.jobFor(job, ['CUT', 'BEND']), plan);
    ok(plan.ops.length === 2 && plan.stats.burn > 400 && /M4|M3/.test(g) && /G1/.test(g), `a plan and GRBL G-code from them (${plan.stats.burn.toFixed(0)} mm of burn, ${g.split('\n').length} lines)`);
    const part = P.newPart('Lasered'); part.laser = job;
    const back = P.readPart(P.toJSON(part));
    ok(back.laser && back.laser.layers.map((l) => l.name + ':' + l.mode).join() === 'CUT:cut,BEND:score', 'the settings are saved in the part file and read back');
    ok(!P.readPart(P.toJSON(P.newPart('Plain'))).laser, 'a part without laser settings writes none');
  }
  section('the dialog words (0.7 SU.755)');
  const en = JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8'));
  const src = fs.readFileSync(DEV + 'nest-ui.js', 'utf8');
  const keys = [...src.matchAll(/t\('(nest\.stock\.[a-z_-]*[a-z_])'/g)].map((m) => m[1]).concat(['pclaser.title', 'pclaser.none', 'ui.tb.export.laser', 'ui.tb.export.laser.title', 'input.cmd.export.laser', 'nest.stock.col-number', 'nest.stock.col-status', 'nest.stock.col-size', 'nest.stock.col-area', 'nest.stock.col-job', 'nest.stock.col-used']);
  ok(keys.every((k) => en[k]), `every nest.stock.* word the dialog uses is in lang/en.json (${new Set(keys).size})`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  const V = process.argv.includes('--verbose');
  const ok = (c, m) => { if (c) { pass++; if (V) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  await runOffcutTests({ ok, section: (t) => console.log('\n== ' + t) });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
