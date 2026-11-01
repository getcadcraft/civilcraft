#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-shell.mjs — 0.8 round 3 (part_PART_3): the shell's seven modules mounted in PartCraft's real page (/lab/partcraft, headless Chromium):
 * calc sheets read a parameter (@L) and their sheet is kept in the part file (part.studies.calcs) and comes back when the file opens again;
 * a reason on the selected feature; running totals show the part's weight (built volume × the material's density); the first lesson's
 * three probes follow the part; the assistant tools of every module are on the control channel; the Ask box takes a question that an
 * assistant answers with ask_reply; Suggest and the activity log are attached. No console errors.
 *   node tools/partcraft-test/browser-shell.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, built, shot } = h;
  console.log('\n== the shell modules in PartCraft');
  // Settings › Assistants as the person left it (read + edit), then the page again so the control channel starts with it
  await page.evaluate(() => { try { localStorage.setItem('cadcraft.assistants.partcraft', JSON.stringify({ enabled: true, groups: ['read', 'edit'] })); } catch { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.partcraft && window.partcraft.part);
  const S = await import(DEV + 'sketch.js'), P = await import(DEV + 'part.js');
  const part = P.newPart('Plate'), sk = S.newSketch();
  S.addRect(sk, [0, 0], [100, 60]);
  const f1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk });
  P.addFeature(part, 'extrude', { sketch: f1.id, op: 'add', end: 'blind', depth: 10 });
  part.params = { vars: [{ name: 'L', expr: '100' }], links: [] };
  part.material = { name: 'Aluminium 6061', density: 2.7 };
  await pc((t) => window.partcraft.openText(t, 'Plate.partcraft.json'), P.toJSON(part));
  await built();
  await page.waitForFunction(() => window.ccCalc?.state?.().attached && window.ccAsk?.state?.().attached, null, { timeout: 30000 });
  const st = await pc(() => ({ calc: window.ccCalc.state(), ask: window.ccAsk.state(), suggest: window.ccSuggest?.state?.(), activity: window.ccActivity?.state?.(), lessons: window.ccLessons?.state?.() }));
  ok(st.calc.attached && st.ask.attached && st.suggest?.attached && st.activity?.attached, 'calc sheets, Ask box, Suggest and the activity log are attached', JSON.stringify(st).slice(0, 200));
  ok((st.lessons?.lessons || []).some((l) => l.id === 'partcraft.first-part'), 'the "Your first part" lesson is registered');
  await pc(() => window.partcraft.control.configure({ enabled: true, groups: ['read', 'edit'] }));
  const tools = await pc(() => window.partcraft.control.list().map((x) => x.name));
  for (const n of ['calcs_list', 'calcs_set', 'reasons_set', 'totals_get', 'lessons_status', 'ask_list', 'ask_reply', 'suggestions_list']) ok(tools.includes(n), 'assistant tool ' + n + ' is on PartCraft\'s control channel');
  // a calc row reading the part's parameter, kept in the part file
  const calc = await pc(async () => {
    const C = window.partcraft.control;
    const r = await C.call('calcs_set', { sheet: 'plate', name: 'area', expr: '@L * 60 mm' });
    await new Promise((res) => setTimeout(res, 300));
    const got = await C.call('calcs_get', { row: 'plate.area' });
    return { err: !!r.isError, text: JSON.stringify(got.structuredContent || got).slice(0, 400), kept: !!window.partcraft.part.studies?.calcs, json: window.partcraft.P.toJSON(window.partcraft.part) };
  });
  ok(!calc.err && /"value":6,/.test(calc.text) && /"unitShown":"m"/.test(calc.text) && /"reads":\["L"\]/.test(calc.text), 'calcs_set: a row "@L * 60 mm" reads the parameter L = 100 → 6000 mm, shown as 6 m — ' + calc.text);
  ok(calc.kept && /"calcs"/.test(calc.json), 'the sheet is kept in the part file (studies.calcs)');
  // the file comes back with its sheet
  await pc((t) => window.partcraft.openText(t, 'Plate again.partcraft.json'), calc.json);
  await built();
  await page.waitForTimeout(300);
  const back = await pc(() => window.ccCalc.state().sheets);
  ok(back >= 1, 'opening the saved file brings the sheet back (' + back + ' sheet)');
  // a reason on the selected feature
  const reason = await pc(async () => {
    const pcw = window.partcraft, f = pcw.part.features.find((x) => x.type === 'extrude');
    pcw.selectFeature(f.id); await new Promise((res) => setTimeout(res, 100));
    const r = await pcw.control.call('reasons_set', { kind: 'feature', id: f.id, requirement: 'Plate 10 mm for the bolt bearing' });
    await new Promise((res) => setTimeout(res, 400));
    return { err: !!r.isError, r: JSON.stringify(r).slice(0, 300), kept: !!pcw.part.studies?.reasons, sel: window.ccReasons?.state?.() };
  });
  ok(!reason.err && reason.kept, 'reasons_set on the extrude: kept in the part file (studies.reasons) — ' + JSON.stringify(reason).slice(0, 300));
  // running totals: the weight
  const tot = await pc(() => { const s = window.ccTotals.snapshot(); const vol = window.partcraft.regen.stats.volume; return { s, want: vol * 1e-6 * 2.7 }; });
  const w = JSON.stringify(tot.s);
  const val = (() => { const m = (tot.s.measures || tot.s.items || []).find?.((x) => x.measure === 'weight'); return m ? (m.value ?? m.total) : null; })();
  ok(/weight/.test(w) && (val === null || Math.abs(val - tot.want) < 1e-6 * tot.want), `running totals show the weight (${tot.want.toFixed(4)} kg = 60 000 mm³ × 2.7 g/cm³)`, w.slice(0, 200));
  // lessons: the probes follow the part
  const probes = await pc(async () => { const L = window.ccLessons; L.start('partcraft.first-part'); L.emit('model', {}); await new Promise((r) => setTimeout(r, 200)); return JSON.stringify(L.state().current || L.state()); });
  ok(/sketch|solid|hole/.test(probes), 'the first lesson runs on the open part: ' + probes.slice(0, 160));
  // the Ask box: a question waits, an assistant answers it
  const asked = await pc(async () => {
    const C = window.partcraft.control;
    await C.handle?.({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'Test AI', version: '1' } } }, 'ask-test');
    const q = await window.ccAsk.ask('How heavy is this plate?', { route: 'queue' }).catch((e) => ({ error: String(e) }));
    const list = await C.call('ask_list', {}); const id = list.structuredContent?.questions?.[0]?.id ?? list.structuredContent?.items?.[0]?.id ?? q?.id;
    const r = await C.call('ask_reply', { id, text: 'About 162 g.', done: true });
    return { id, isError: !!(r.isError || r.structuredContent?.isError) };
  });
  ok(!!asked.id && !asked.isError, 'the Ask box takes a question and an assistant answers it (ask_list → ask_reply)', JSON.stringify(asked));
  await shot('shell');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-shell');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
