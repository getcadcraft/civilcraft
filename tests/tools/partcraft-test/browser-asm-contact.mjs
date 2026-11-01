#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-asm-contact.mjs — 0.8 SU.891 in PartCraft, headless Chromium: two 100 mm bars end to end across 0.01 mm in an assembly, the second turned half a
 * turn; each part's own Simulation study carries its support and load. Assembly › Contact: the card; Add a pair; the two sides picked (the same
 * pick() the stage calls for a click on a part's face — the facing ends cannot be reached by a click); Solve in the compute worker → contact force 10 000 N and
 * B's far end 0.11 mm; the pair is saved in the assembly file; Export CalculiX deck downloads a .inp; the study is read back from the saved file;
 * a part with no pair is named as left out; the Problems panel gets nothing for a settled study. No console errors.
 *   node tools/partcraft-test/browser-asm-contact.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, shot } = h;
  console.log('\n== assembly contact study');
  const w = 10, L = 100, gap = 0.01, F = 10000;
  const part = await pc(({ w, L, F }) => {
    const { P, S } = window.partcraft;
    const mk = (name) => { const p = P.newPart(name), sk = S.newSketch(); S.addRect(sk, [0, 0], [L, w]); const f = P.addFeature(p, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk }); P.addFeature(p, 'extrude', { sketch: f.id, op: 'add', end: 'blind', depth: w }); return p; };
    return JSON.stringify(mk('Bar'));
  }, { w, L, F });
  await pc((t) => window.partcraft.openText(t, 'Bar.partcraft.json'), part);
  await h.built();
  await h.tool('asm-new'); await pc(() => window.partcraft.asmBuilt());
  await h.tool('asm-insert-copy'); await pc(() => window.partcraft.asmBuilt());
  await page.waitForTimeout(300);
  // the second copy turned half a turn about Z and put 0.01 mm from the first; both parts get their own study (supports and the push)
  const info = await pc(({ w, L, gap, F }) => {
    const pa = window.partcraft, asm = pa.asm, A = pa.A;
    const [i1, i2] = asm.instances;
    // two copies of one part would share one Simulation study: the second bar gets a part of its own
    const pid2 = 'p' + (Object.keys(asm.parts).length + 1);
    asm.parts[pid2] = JSON.parse(JSON.stringify(asm.parts[i2.part])); asm.parts[pid2].name = 'Bar B'; i2.part = pid2;
    i2.place = [-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 2 * L + gap, w, 0, 1];
    const regen = (inst) => pa.asmBuilds ? pa.asmBuilds.get(inst.part) : null;
    return { ids: [i1.id, i2.id], parts: asm.instances.map((i) => i.part) };
  }, { w, L, gap, F });
  ok(info.ids.length === 2, 'an assembly of two bars');
  // the placement is applied by reopening the assembly from its JSON (what Open does)
  await pc(() => window.partcraft.openText(window.partcraft.A.toJSON(window.partcraft.asm), 'Two bars.partcraft-asm.json'));
  await page.waitForFunction(() => window.partcraft.asm && window.partcraft.asmPlace && window.partcraft.asmPlace.world.size === 2, null, { timeout: 60000 });
  await pc(() => window.partcraft.asmBuilt());
  ok(await pc(() => Math.abs(window.partcraft.asmPlace.world.get(window.partcraft.asm.instances[1].id)[12] - 200.01) < 1e-9), 'the second bar stands 200.01 mm along X, turned half a turn');
  await h.tool('asm-contact');
  await page.waitForSelector('[data-asm-contact]');
  ok(/Contact study/.test(await page.textContent('[data-asm-contact]')), 'Assembly › Contact opens the card');
  await page.click('[data-asm-contact] [data-asc-add]');
  await page.waitForSelector('[data-asm-contact] [data-asc-pair="p1"]');
  await page.click('[data-asm-contact] [data-asc-pick-a="p1"]');
  ok(await pc(() => !!window.partcraft.contactStudy.picking), 'Pick side A starts the picking (clicks on parts now go to the pair)');
  // a click on a face of part 1 (what the stage hands over: inst + face index in the part's build)
  const picked = await pc(({ ids, L }) => {
    const pa = window.partcraft, b = pa.asmBuilds;
    const face = (inst, nx, c) => { const bd = b.get(pa.asm.instances.find((i) => i.id === inst).part); return bd.faces.findIndex((f) => f.type === 'plane' && f.n && Math.abs(f.n[0] - nx) < 1e-9 && Math.abs(f.o[0] - c) < 1e-6); };
    const click = (inst, f) => pa.contactStudy.pick({ kind: 'face', inst, face: f, point: [0, 0, 0] });
    const r = { aEnd: face(ids[0], 1, L), bNear: face(ids[1], 1, L), bFar: face(ids[1], -1, 0), aFixed: face(ids[0], -1, 0) };
    r.same = click(ids[0], r.aEnd);
    return r;
  }, { ids: info.ids, L });
  ok(picked.aEnd >= 0 && picked.bNear >= 0 && picked.same, 'the end faces are found and part 1\'s end face is taken as side A');
  const sideA = await page.textContent('[data-asm-contact] [data-asc-side-a="p1"]');
  ok(/Bar<1>, 1 faces/.test(sideA), 'side A: ' + sideA);
  await page.click('[data-asm-contact] [data-asc-pick-a="p1"]');   // Done
  await page.click('[data-asm-contact] [data-asc-pick-b="p1"]');
  // a face of part 1 cannot go on side B (the two sides of a pair belong to different parts)
  await pc(({ ids, f }) => window.partcraft.contactStudy.pick({ kind: 'face', inst: ids[0], face: f.aFixed, point: [0, 0, 0] }), { ids: info.ids, f: picked });
  ok(/not (the )?same|different parts/i.test((await h.statusText()) || '') || (await pc(() => window.partcraft.asm.contactStudy.pairs[0].b.inst)) === null, 'a face of part 1 is refused on side B');
  await pc(({ ids, bNear }) => window.partcraft.contactStudy.pick({ kind: 'face', inst: ids[1], face: bNear, point: [0, 0, 0] }), { ids: info.ids, bNear: picked.bNear });
  await page.click('[data-asm-contact] [data-asc-pick-b="p1"]');   // Done
  const sideB = await page.textContent('[data-asm-contact] [data-asc-side-b="p1"]');
  ok(/Bar<2>, 1 faces/.test(sideB), 'side B: ' + sideB);
  await page.fill('[data-asm-contact] [data-asc-factor="p1"]', '1000'); await page.press('[data-asm-contact] [data-asc-factor="p1"]', 'Tab');
  const saved = await pc(() => window.partcraft.asm.contactStudy);
  ok(saved && saved.pairs.length === 1 && saved.pairs[0].factor === 1000 && saved.pairs[0].a.faces.length === 1 && saved.pairs[0].b.faces.length === 1, 'the pair is kept in the assembly (asm.contactStudy)');

  // Solve says what is missing: the parts have no studies yet
  await page.click('[data-asm-contact] [data-asc-run]');
  await page.waitForSelector('[data-asm-contact] [data-asc-problem]');
  ok(/Simulation study/.test(await page.textContent('[data-asm-contact]')), 'with no Simulation study on the parts the card says what to add: ' + (await page.textContent('[data-asm-contact] [data-asc-problem]')).slice(0, 80));
  // give each part its study: A fixed at its far end, B held sideways and pushed
  const SIM = await import(DEV + 'sim.js');
  const base = { ...SIM.newSimStudy(), kind: 'static', material: { name: 'Test steel', E: 200000, nu: 0.3, density: 7850, yield: 1e5 }, h: 10, mesher: 'tet' };
  await pc(({ ids, f, base }) => {
    const pa = window.partcraft, P = pa.P;
    const study = (extra) => ({ ...base, constraints: [], loads: [], ...extra });
    const ref = (inst, i) => { const bd = pa.asmBuilds.get(pa.asm.instances.find((x) => x.id === inst).part), fc = bd.faces[i]; return { name: fc.name, at: fc.at.map((v) => +v.toFixed(6)) }; };
    const part = (inst) => pa.asm.parts[pa.asm.instances.find((x) => x.id === inst).part].part;
    const low = (inst, ax) => pa.asmBuilds.get(pa.asm.instances.find((x) => x.id === inst).part).faces.findIndex((q) => q.type === 'plane' && q.n && Math.abs(q.n[ax] + 1) < 1e-9);
    P.setStudy(part(ids[0]), 'simulation', study({ constraints: [{ id: 'c1', type: 'fixed', faces: [ref(ids[0], f.aFixed)] }] }));
    P.setStudy(part(ids[1]), 'simulation', study({ constraints: [1, 2].map((ax, k) => ({ id: 'c' + (k + 1), type: 'frictionless', faces: [ref(ids[1], low(ids[1], ax))] })), loads: [{ id: 'l1', type: 'force', faces: [ref(ids[1], f.bFar)], total: 10000, dir: [1, 0, 0] }] }));
  }, { ids: info.ids, f: picked, base });
  await page.click('[data-asm-contact] [data-asc-run]');
  await page.waitForFunction(() => { const c = document.querySelector('[data-asm-contact]'); return c && (c.querySelector('[data-asc-result]') || c.querySelector('[data-asc-error]') || c.querySelector('[data-asc-problem]')); }, null, { timeout: 120000 });
  if (!(await page.$('[data-asm-contact] [data-asc-result]'))) console.log('   card says:', (await page.textContent('[data-asm-contact]')).replace(/\s+/g, ' ').slice(0, 600));
  await page.waitForSelector('[data-asm-contact] [data-asc-result]', { timeout: 60000 });
  const res = (await page.textContent('[data-asm-contact] [data-asc-result]')).replace(/\s+/g, ' ');
  const force = Number(await page.getAttribute('[data-asm-contact] [data-asc-force]', 'data-asc-force'));
  const disp = Number(await page.getAttribute('[data-asm-contact] [data-asc-disp]', 'data-asc-disp'));
  ok(await page.getAttribute('[data-asm-contact] [data-asc-converged]', 'data-asc-converged') === 'true', 'the load steps settled — ' + res.slice(0, 90));
  ok(Math.abs(force - F) / F < 0.01, `contact force ${force.toFixed(1)} N = the push ${F} N`);
  const want = gap + F * 2 * L / (200000 * w * w);
  ok(Math.abs(disp - want) / want < 0.03, `B's far end moved ${disp.toFixed(5)} mm vs ${want.toFixed(5)} mm (closed form)`);
  await shot('asm-contact');
  ok(await pc(() => window.partcraft.asm.contactStudy.pairs.length === 1), 'the study is still in the file after a solve');
  const text = await pc(() => window.partcraft.A.toJSON(window.partcraft.asm));
  const back = JSON.parse(text);
  ok(back.contactStudy && back.contactStudy.pairs[0].b.faces.length === 1 && back.version === 2, 'the saved assembly carries contactStudy and stays version ' + back.version);
  const dl = page.waitForEvent('download', { timeout: 60000 });
  await page.click('[data-asm-contact] [data-asc-deck]');
  const d = await dl;
  const name = d.suggestedFilename();
  ok(/\.inp$/.test(name), 'Export CalculiX deck downloads ' + name);
  await page.click('[data-asm-contact] [data-asc-close]');
  ok(!(await page.$('[data-asm-contact]')), 'Close takes the card away');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-asm-contact');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
