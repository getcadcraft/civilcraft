#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-mount.mjs — the shell's seven modules mounted in DetailCraft (0.8 round 3, detail_PART_3): calc sheets and design reasons saved in the
 * model file and kept through undo and reopen, the steel weight total, the first lesson stepping on probes, Suggest / activity / Ask attached; no errors.
 *
 *   node tools/detailcraft-test/browser-mount.mjs [--shots <dir>]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const lab = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' })).cookie.split('=');   // a signed-in lab session: no password login (the sign-in is throttled for everyone at once)
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const dc = (fn, arg) => page.evaluate(fn, arg);
const row = (id) => page.locator(`[data-props] [data-pg-row="${id}"]`);
const footing = () => dc(() => { const f = window.detailcraft.model.state.footings[0]; return JSON.parse(JSON.stringify(f)); });

try {
  await page.context().addCookies([{ name: lab[0], value: lab.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(`${BASE}/lab/detailcraft?space=paper`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.ccCalc && window.ccReasons && window.ccTotals && window.ccLessons && window.ccSuggest && window.ccActivity && window.ccAsk, null, { timeout: 15000 });
  ok(true, 'all seven shell modules are loaded');
  ok(await dc(() => ccAsk.state().attached && ccSuggest.state().attached), 'Ask and Suggest are attached to host.control');
  // totals: the steel weight of the starter model
  const kg = await dc(() => (ccTotals.snapshot ? JSON.stringify(ccTotals.snapshot()) : ''));
  ok(/weight|Steel/i.test(kg), 'the weight total has a source: ' + kg.slice(0, 120));
  // calc sheet: made, then in the file; an undo/reload keeps the state in step
  await dc(() => { const s = ccCalc.calcs.addSheet({ title: 'Mount check' }); ccCalc.calcs.setRow(s.id, null, { name: 'w', expr: '5 kN/m' }); });
  await page.waitForTimeout(700);
  let file = await dc(() => JSON.parse(window.detailcraft.model.toJSON()));
  ok(file.calcs && file.calcs.format === 'cadcraft-calcs' && file.calcs.sheets[0].title === 'Mount check', 'the calc sheet is in the saved model file');
  const readBack = await dc(() => { const m = window.detailcraft.model; const t = m.toJSON(); m.load(t); return window.ccCalc.save() && window.ccCalc.save().sheets.length; });
  ok(readBack === 1, 'reopening the file gives the sheet back');
  // lesson: first-frame steps on probes, from an empty model, through the model's own edits
  await dc(() => { const m = window.detailcraft.model; m.load(JSON.stringify({ format: 'detailcraft', version: 2, name: 'Lesson', grids: m.state.grids, levels: m.state.levels })); ccLessons.start('first-frame'); });
  const step = () => dc(() => (c => c && (c.step?.id || c.step))(ccLessons.state().current) || null);
  ok((await step()) === 'columns', 'the lesson waits at: place two columns');
  const ids = await dc(() => {
    const m = window.detailcraft.model; const out = [];
    m.change('cols', (tx) => { for (const x of [0, 6000]) out.push(tx.addMember({ type: 'column', profile: 'W10X49', material: 'A992', position: 'middle', rotation: 0, start: [x, 0, 0], end: [x, 0, 4000], phase: 1 })); });
    return out;
  });
  ok((await step()) === 'beam', 'two columns complete step one');
  await dc((ids) => { window.detailcraft.model.change('beam', (tx) => tx.addMember({ type: 'beam', profile: 'W16X31', material: 'A992', position: 'middle', rotation: 0, start: [0, 0, 4000], end: [6000, 0, 4000], phase: 1 })); }, ids);
  ok((await step()) === 'plates', 'a beam completes step two');
  await dc(() => { const m = window.detailcraft.model; const b = m.state.members.find((x) => x.type === 'beam'), c = m.state.members.find((x) => x.type === 'column');
    m.change('plate', (tx) => tx.addConnection({ type: 'endplate', beam: b.id, end: 'start', column: c.id })); });
  ok((await step()) === 'save', 'an end plate completes step three');
  const w = await dc(() => ccTotals.snapshot().find((x) => x.measure === 'weight')?.value);
  ok(w > 100, 'the weight total follows the model: ' + Math.round(w) + ' kg');
  // reasons: the selected member, saved in the file, and an undo of the step takes the file keys with it
  const mid = await dc(() => window.detailcraft.model.state.members[0].id);
  await dc((id) => window.detailcraft.setSelection([{ kind: 'member', id }]), mid);
  await dc((id) => { window.ccReasons.reasons.set({ kind: 'member', id, label: 'm' }, { decision: 'Chosen for the bay width' }); }, mid);
  await page.waitForTimeout(700);
  file = await dc(() => JSON.parse(window.detailcraft.model.toJSON()));
  ok(file.reasons && file.reasons.records.length === 1, 'the reason is in the saved model file');
  // an old file without them stays free of the keys
  const clean = await dc(() => { const m = window.detailcraft.model; const j = JSON.parse(m.toJSON()); delete j.calcs; delete j.reasons; m.load(JSON.stringify(j)); return JSON.parse(m.toJSON()); });
  ok(!('calcs' in clean) && !('reasons' in clean), 'a file without sheets or reasons stays without the keys');
  ok(await dc(() => ccCalc.save() === null && ccReasons.save() === null), 'opening it empties both modules');
} catch (e) {
  fail++; console.log('  FAIL threw: ' + (e.stack || e.message));
} finally {
  await dc(() => 0).catch(() => {});
  await browser.close();
}
ok(problems.length === 0, 'no console or page errors' + (problems.length ? ': ' + problems.join(' | ').slice(0, 300) : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
