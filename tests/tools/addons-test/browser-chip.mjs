#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-chip.mjs — the Chip design add-on (0.9 Track HD, session chip-runners-09) in CadCraft's real page (/lab/cadcraft, headless Chromium):
 *  1. web edition: bundled and off; switched on; the right panel's "Chip design" section with its tabs (Project, Files, the source/netlist
 *     modules when present, Flow, Waves, Layout); CHIP opens it; files added; the Flow tab says it is the browser edition, Run is off,
 *     the sim stage shows its iverilog command; "Save run package" downloads a zip, which this test runs with the person's tools the way
 *     a person would by hand (node engine/cc-chip-run.mjs chip-job.json — REAL Icarus Verilog here), then "Open a result" reads
 *     out/result.zip back: summary, waves in the Waves tab (canvas), the run's hashes recorded; a DEF opens in Layout (chip-formats' reader).
 *  2. Studio path: a stand-in window.cadcraftDesktop.engines (the same calls as desktop-shell bridge.js; addonStart runs the package in Node
 *     exactly as engines.rs would: unzip into a fresh folder, node <script> <job>) — Run in the Flow tab runs REAL Icarus + Yosys, and a
 *     syntax error lands in the shared Problems store as an addon.chip.sim error at its line.
 *   node tools/addons-test/browser-chip.mjs [--shots dir]
 * Not tested here: the real Studio shell (engines.rs consent dialog, Windows/macOS) — that needs a Studio build on workstation11a.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipStored } from '../../lib/chip/run/zip.js';
import { runPackage } from '../../lib/chip/run/test/local-runner.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/chip'));
fs.mkdirSync(SHOTS, { recursive: true });
const FX = (n) => fs.readFileSync(path.join(ROOT, 'lib/chip/run/test/fixtures', n), 'utf8');
const DEMO_DEF = path.join(ROOT, 'lib/chip/fmt/test/fixtures/demo.def');

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString());

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const SESSION = admin('session');
const [cname, cvalue] = SESSION.cookie.split('=');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-chip-browser-'));

async function open({ studio = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
  await ctx.addCookies([{ name: cname, value: cvalue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  if (studio) {
    // the stand-in Studio bridge: same calls and answers as desktop-shell bridge.js engines.addon*; the package runs in Node like engines.rs runs it
    await page.exposeFunction('__ccChipRun', (b64) => { const r = runPackage(new Uint8Array(Buffer.from(b64, 'base64'))); return r.bytes ? Buffer.from(r.bytes).toString('base64') : ''; });
    await page.addInitScript(() => {
      const jobs = new Map(); let n = 0;
      const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
      window.__ccChipCalls = [];
      window.cadcraftDesktop = Object.freeze({ engines: Object.freeze({
        find: async () => ({ found: false }), start: async () => { throw new Error('unknown_engine: x'); },
        addonFind: async (decl) => { window.__ccChipCalls.push(['addonFind', decl.addon, decl.programs.join(), decl.script, decl.args.join()]); return { found: true, program: 'node', allowed: true }; },
        addonPick: async () => ({ found: true }),
        addonStart: async (decl, bytes, settings) => { window.__ccChipCalls.push(['addonStart', decl.addon, bytes.length, JSON.stringify(settings)]); const id = ++n; jobs.set(id, window.__ccChipRun(b64(bytes))); return id; },
        status: async (id) => { const r = await jobs.get(id); return r ? { state: 'done', progress: 1, error: '', log: [] } : { state: 'failed', progress: 0, error: 'script_failed', log: [] }; },
        result: async (id) => { const r = await jobs.get(id); return Uint8Array.from(atob(r), (c) => c.charCodeAt(0)); },
        cancel: async () => {},
      }) });
    });
  }
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:cadcraft:chip:')) localStorage.removeItem(k); const k = 'cc-addons:cadcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on.chip; localStorage.setItem(k, JSON.stringify(s)); indexedDB.deleteDatabase('cadcraft-chip'); });
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host && !!window.ccAddons);
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'chip' && a.state !== 'loading'), null, { timeout: 15000 }).catch(() => {});
  return { ctx, page, problems };
}
const typeCmd = async (page, s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(200); };
const tab = (page, id) => page.click(`[data-chip-tab="${id}"]`);
const write = (page, files) => page.evaluate(async (f) => { for (const [n, t] of Object.entries(f)) await window.ccChip.ctx.files.write(n, t); }, files);

try {
  console.log('1. the browser edition');
  const { ctx, page, problems } = await open();
  let me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'chip'));
  ok(me && me.state === 'off' && me.source === 'bundled', 'Chip design is bundled and starts off', JSON.stringify(me && { state: me.state, source: me.source, reason: me.reason }));
  await page.evaluate(() => window.ccAddons.loader.setEnabled('chip', true));
  await page.waitForFunction(() => !!window.ccChip, null, { timeout: 15000 }).catch(() => {});
  me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'chip'));
  ok(me?.state === 'active', 'switched on: active', JSON.stringify(me && [me.state, me.detail, me.reason]));
  const sec = await page.$('[data-addon-section*="chip"] [data-chip-root]');
  ok(!!sec, 'the right panel has the "Chip design" section');
  const tabs = await page.$$eval('[data-chip-tab]', (b) => b.map((x) => x.getAttribute('data-chip-tab')));
  ok(['project', 'files', 'flow', 'waves', 'floorplan'].every((x) => tabs.includes(x)), 'tabs: ' + tabs.join(', '));
  const mods = await page.evaluate(() => window.ccChip.modules);
  ok(mods.includes('./lib/run/panels.js'), 'the panel host mounted the modules that export panels(ctx): ' + mods.join(' '));
  await typeCmd(page, 'CHIP');
  const hist = await page.$$eval('.cc-history li', (ls) => ls.map((l) => l.textContent).join(' | '));
  ok(/Chip design panel is open/.test(hist), 'the command CHIP opens it');
  await write(page, { 'counter.v': FX('counter.v'), 'counter_tb.v': FX('counter_tb.v') });
  await page.waitForTimeout(300);
  await tab(page, 'files');
  await page.waitForTimeout(200);
  const fl = await page.$$eval('[data-chip-panel="files"] .chip-name', (b) => b.map((x) => x.textContent));
  ok(fl.includes('counter.v') && fl.includes('counter_tb.v'), 'Files lists the project files');
  await tab(page, 'flow');
  await page.waitForSelector('[data-chip-stage="sim"] pre.chip-cmd', { timeout: 10000 }).catch(() => {});
  const where = await page.getAttribute('[data-chip-where]', 'data-chip-where');
  const runOff = await page.$eval('[data-chip-run="sim"]', (b) => b.disabled).catch(() => null);
  const cmd = await page.$eval('[data-chip-stage="sim"] pre.chip-cmd', (p) => p.textContent).catch(() => '');
  ok(where === 'web' && runOff === true, 'the Flow tab says browser edition; Run is off (no programs from a web page)');
  ok(/\$ iverilog -g2012 -Wall -o out\/sim\.vvp -s counter_tb -s cc_dump/.test(cmd) && /\$ vvp -n out\/sim\.vvp/.test(cmd), 'the sim stage shows its command lines, testbench picked: ' + cmd.split('\n')[0].slice(0, 80));
  await page.screenshot({ path: path.join(SHOTS, 'chip-01-flow-web.png') });
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.click('[data-chip-package="sim"]')]);
  const pkgFile = path.join(tmp, dl.suggestedFilename());
  await dl.saveAs(pkgFile);
  const pkg = unzipStored(new Uint8Array(fs.readFileSync(pkgFile)));
  ok(pkg['engine/cc-chip-run.mjs'] && pkg['chip-job.json'] && pkg['counter.v'] && pkg['cc_dump.v'] && pkg['README.txt'], 'Save run package: the inputs, chip-job.json, the run script and a README — ' + Object.keys(pkg).join(' '));
  const ran = runPackage(new Uint8Array(fs.readFileSync(pkgFile)));
  ok(ran.bytes && ran.code === 0, 'run by hand with the person\'s tools (REAL Icarus Verilog): node engine/cc-chip-run.mjs chip-job.json');
  const resFile = path.join(tmp, 'result.zip');
  fs.writeFileSync(resFile, ran.bytes);
  const [chooser] = await Promise.all([page.waitForEvent('filechooser', { timeout: 10000 }), page.click('[data-chip-open="sim"]')]);
  await chooser.setFiles(resFile);
  await page.waitForSelector('[data-chip-summary="sim"]', { timeout: 15000 }).catch(() => {});
  const summary = await page.$eval('[data-chip-summary="sim"]', (e) => e.textContent).catch(() => '');
  ok(/waves are in the Waves tab/.test(summary), 'Open a result: the summary — ' + summary.slice(0, 120));
  await page.waitForTimeout(400);
  const vcdSel = await page.$$eval('[data-chip-vcd] option', (o) => o.map((x) => x.value));
  const waves = await page.$eval('[data-chip-panel="waves"] canvas', (c) => ({ w: c.width, h: c.height, label: c.getAttribute('aria-label') })).catch(() => null);
  ok(vcdSel.includes('out/sim/wave.vcd') && waves && waves.h > 100 && /of 8 signals/.test(waves.label || ''), 'the waves are saved as out/sim/wave.vcd and drawn in the Waves tab: ' + (waves && waves.label));
  await page.screenshot({ path: path.join(SHOTS, 'chip-02-waves.png') });
  const last = await page.$eval('[data-chip-last="sim"]', (e) => e.textContent).catch(() => '');
  ok(/Last run/.test(last) && /same as then/.test(last), 'the run is recorded with its input hashes: ' + last);
  if (fs.existsSync(DEMO_DEF)) {
    await write(page, { 'demo.def': fs.readFileSync(DEMO_DEF, 'utf8') });
    await page.waitForTimeout(300);
    await tab(page, 'floorplan');
    await page.selectOption('[data-chip-def]', 'demo.def');
    await page.waitForSelector('[data-chip-panel="floorplan"] svg', { timeout: 10000 }).catch(() => {});
    const cells = await page.$$eval('[data-chip-panel="floorplan"] .chip-cell', (x) => x.length).catch(() => 0);
    const wires = await page.$$eval('[data-chip-panel="floorplan"] .chip-wire', (x) => x.length).catch(() => 0);
    ok(cells === 3 && wires > 0, `Floorplan: a DEF through chip-formats' reader — ${cells} placed cells, ${wires} wire pieces`);
    await page.click('[data-chip-panel="floorplan"] [data-chip-show="placement"]');
    const cellsOff = await page.$$eval('[data-chip-panel="floorplan"] .chip-cell', (x) => x.length).catch(() => -1);
    ok(cellsOff === 0, 'the Placement switch hides the cells');
    await page.screenshot({ path: path.join(SHOTS, 'chip-03-layout.png') });
  }
  await page.click('[data-chip-wide]');
  const inDialog = await page.$eval('dialog.chip-dialog [data-chip-root]', () => true).catch(() => false);
  ok(inDialog, 'Larger window: the panel in a dialog');
  await page.screenshot({ path: path.join(SHOTS, 'chip-04-wide.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  ok(!!(await page.$('[data-addon-section*="chip"] [data-chip-root]')), 'closing it puts the panel back');
  ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
  await ctx.close();

  console.log('2. the Studio path (a stand-in bridge with the same calls; the tools are REAL)');
  const S = await open({ studio: true });
  await S.page.evaluate(() => window.ccAddons.loader.setEnabled('chip', true));
  await S.page.waitForFunction(() => !!window.ccChip, null, { timeout: 15000 }).catch(() => {});
  await write(S.page, { 'counter.v': FX('counter.v'), 'counter_tb.v': FX('counter_tb.v'), 'cc_cells.lib': FX('cc_cells.lib') });
  await S.page.evaluate(async () => { const p = window.ccChip.ctx.project.get(); p.top = 'counter'; p.testbench = 'counter_tb'; p.stages.find((s) => s.id === 'synth').options = { liberty: 'cc_cells.lib' }; await window.ccChip.ctx.project.save(p); });
  await S.page.waitForTimeout(300);
  await tab(S.page, 'flow');
  await S.page.waitForSelector('[data-chip-run="synth"]:not([disabled])', { timeout: 10000 }).catch(() => {});
  ok((await S.page.getAttribute('[data-chip-where]', 'data-chip-where')) === 'studio', 'in Studio the Flow tab says it runs your own tools');
  await S.page.click('[data-chip-run="synth"]');
  await S.page.waitForSelector('[data-chip-summary="synth"]', { timeout: 60000 }).catch(() => {});
  const syn = await S.page.$eval('[data-chip-summary="synth"]', (e) => e.textContent).catch(() => '');
  ok(/18 cells in counter/.test(syn) && /Cell area: 53/.test(syn), 'Run (synthesis): REAL Yosys through the bridge — ' + syn.slice(0, 120));
  const calls = await S.page.evaluate(() => window.__ccChipCalls);
  ok(calls.some((c) => c[0] === 'addonFind' && c[1] === 'chip' && c[2] === 'node' && c[3] === 'engine/cc-chip-run.mjs' && c[4] === '{script},{job}') && calls.some((c) => c[0] === 'addonStart' && c[3] === '{}'), 'the page asked the bridge only for node + the shipped script, with placeholders, no settings');
  const ver = await S.page.evaluate(() => window.ccChip.ctx.project.get().runs.at(-1));
  ok(/Yosys \d/.test(ver.version) && Object.keys(ver.inputs).includes('cc_cells.lib') && !Object.keys(ver.inputs).includes('counter_tb.v'), 'the run record: Yosys version, the liberty hashed, the testbench not synthesized');
  await S.page.screenshot({ path: path.join(SHOTS, 'chip-05-synth-studio.png') });
  await write(S.page, { 'counter.v': FX('counter.v').replace("count <= 4'd0;", "count <= 4'd0") });
  await S.page.waitForTimeout(400);
  await S.page.waitForSelector('[data-chip-run="sim"]:not([disabled])', { timeout: 10000 }).catch(() => {});
  await S.page.click('[data-chip-run="sim"]');
  await S.page.waitForSelector('[data-chip-summary="sim"]', { timeout: 60000 }).catch(() => {});
  const probs = await S.page.evaluate(() => (window.ccProblems ? window.ccProblems.store.list({}) : null));
  const simErr = (probs || []).find((p) => String(p.source?.id || p.sourceId || p.id).includes('chip') && p.severity === 'error' && /counter\.v/.test(JSON.stringify(p.about || p)));
  ok(probs === null ? false : !!simErr, 'a REAL syntax error is in the shared Problems store (addon.chip.sim): ' + (simErr ? simErr.text : JSON.stringify((probs || []).slice(0, 2))));
  ok(!S.problems.length, 'no console errors', S.problems.slice(0, 5).join(' | '));
  await S.ctx.close();

  console.log('3. the sample design, end to end (HD.10)');
  const E = await open();
  const P = E.page;
  await P.evaluate(() => window.ccAddons.loader.setEnabled('chip', true));
  await P.waitForFunction(() => !!window.ccChip, null, { timeout: 15000 }).catch(() => {});
  ok(!!(await P.$('[data-chip-honesty]')) && /not a signed-off tape-out system/.test(await P.$eval('[data-chip-honesty]', (e) => e.textContent)) && /OpenROAD \(BSD-3-Clause\): not run by us yet/.test(await P.$eval('[data-chip-honesty]', (e) => e.textContent)), 'the honesty card on the Project tab (no PDK, no foundry claims, tools not run by us yet)');
  P.on('dialog', (d) => d.accept());
  await P.click('[data-chip-sample]');
  await P.waitForFunction(() => window.ccChip.ctx.files.list().includes('out/layout/pebble.gds') && window.ccChip.ctx.project.get().name === 'Pebble (sample)', null, { timeout: 20000 }).catch(() => {});
  const nfiles = await P.evaluate(() => window.ccChip.ctx.files.list().length);
  ok(nfiles >= 28, 'Open the sample design: one click, ' + nfiles + ' files and the project (Pebble)');
  ok(await P.evaluate(() => window.ccChip.ctx.knownCells().includes('DFF') && window.ccChip.ctx.cellLibrary().NAND2?.pins?.Y === 'out' && !!window.ccChip.ctx.schematic?.buildNets), 'ctx: knownCells()/cellLibrary() from cc_cells.lib (HD.3 reader), the shared schematic engine');
  await tab(P, 'chip-source');
  await P.waitForSelector('[data-chip-panel="chip-source"] select option[value="pebble_core.v"]', { timeout: 15000 }).catch(() => {});
  await P.selectOption('[data-chip-panel="chip-source"] select', 'pebble_core.v').catch(() => {});
  await P.waitForTimeout(800);
  const srcErr = await P.$$eval('[data-chip-panel="chip-source"] .chip-gut span.error', (x) => x.length).catch(() => -1);
  const hdlRows = await P.evaluate(() => (window.ccProblems ? window.ccProblems.store.list({}) : []).filter((p) => /chip\.hdl/.test(p.id) && p.severity !== 'note').map((p) => p.text));
  ok(srcErr === 0 && hdlRows.length === 0, 'Source: pebble_core.v has no errors, the project no hdl errors or warnings (' + srcErr + ' markers; in Problems: ' + hdlRows.slice(0, 3).join(' | ') + ')');
  await P.screenshot({ path: path.join(SHOTS, 'chip-10-sample-source.png') });
  await tab(P, 'chip-hierarchy');
  await P.waitForTimeout(400);
  const tree = await P.$$eval('[data-chip-panel="chip-hierarchy"] .chip-tree li', (l) => l.map((x) => x.textContent.trim())).catch(() => []);
  ok(/pebble_soc/.test(tree[0] || '') && tree.some((x) => /pebble_core/.test(x)) && tree.some((x) => /pebble_alu/.test(x)), 'Hierarchy: pebble_soc › pebble_core › pebble_alu … (' + tree.slice(0, 4).join(' | ') + ')');
  await tab(P, 'chip-netlist');
  await P.waitForTimeout(400);
  const netOpts = await P.$$eval('[data-chip-panel="chip-netlist"] select option', (o) => o.map((x) => x.value)).catch(() => []);
  const synthOpt = netOpts.find((v) => /netlist\.v/.test(v) && /pebble_soc/.test(v)) || netOpts.find((v) => /pebble_alu/.test(v));
  if (synthOpt) await P.selectOption('[data-chip-panel="chip-netlist"] select', synthOpt);
  await P.waitForSelector('[data-chip-panel="chip-netlist"] svg [data-cell]', { timeout: 30000 }).catch(() => {});
  const boxes = await P.$$eval('[data-chip-panel="chip-netlist"] svg [data-cell]', (g) => g.length).catch(() => 0);
  ok(boxes > 100, 'Netlist: the synthesized Pebble (' + synthOpt + ') drawn as a schematic, ' + boxes + ' boxes, with the shared engine');
  await P.screenshot({ path: path.join(SHOTS, 'chip-11-sample-netlist.png') });
  await tab(P, 'chip-layout');
  await P.waitForTimeout(300);
  await P.selectOption('[data-chip-panel="chip-layout"] select >> nth=0', 'out/layout/pebble.gds').catch((e) => console.log('    ' + e.message.split('\n')[0]));
  await P.waitForTimeout(1200);
  const px = await P.evaluate(() => { const c = document.querySelector('[data-chip-panel="chip-layout"] canvas'); if (!c) return 0; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; });
  const layers = await P.$$eval('[data-chip-panel="chip-layout"] ul li', (l) => l.length).catch(() => 0);
  ok(px > 1000 && layers >= 2, 'Layout: out/layout/pebble.gds drawn (' + px + ' pixels, ' + layers + ' list rows)');
  await P.screenshot({ path: path.join(SHOTS, 'chip-12-sample-layout.png') });
  await tab(P, 'chip-library');
  await P.selectOption('[data-chip-panel="chip-library"] select >> nth=0', 'cc_cells.lib').catch(() => {});
  await P.waitForTimeout(300);
  await P.selectOption('[data-chip-panel="chip-library"] select >> nth=0', 'cc_cells.lef').catch(() => {});
  await P.waitForTimeout(400);
  const libText = await P.$eval('[data-chip-panel="chip-library"]', (e) => e.innerText).catch(() => '');
  ok(/NAND2/.test(libText) && /DFF/.test(libText), 'Cell library: cc_cells (Liberty + LEF) listed');
  await tab(P, 'chip-constraints');
  await P.selectOption('[data-chip-panel="chip-constraints"] select >> nth=0', 'pebble.sdc').catch(() => {});
  await P.waitForTimeout(400);
  const conText = await P.$eval('[data-chip-panel="chip-constraints"]', (e) => e.innerText).catch(() => '');
  ok(/clk/.test(conText) && /20/.test(conText), 'Constraints: pebble.sdc in plain words (the 20 ns clock)');
  await tab(P, 'waves');
  await P.selectOption('[data-chip-vcd]', 'out/sim/wave.vcd');
  await P.waitForTimeout(500);
  const wl = await P.$eval('[data-chip-panel="waves"] canvas', (c) => c.getAttribute('aria-label')).catch(() => '');
  ok(/of \d+ signals/.test(wl) && Number(/of (\d+) signals/.exec(wl)?.[1]) > 30, 'Waves: the sample VCD (' + wl + ')');
  await P.screenshot({ path: path.join(SHOTS, 'chip-13-sample-waves.png') });
  // Problems: an error typed into the source shows up as a row, and goes when it is undone
  await tab(P, 'chip-source');
  await P.selectOption('[data-chip-panel="chip-source"] select', 'pebble_alu.v').catch(() => {});
  await P.waitForTimeout(300);
  const ta = '[data-chip-panel="chip-source"] textarea';
  const before = await P.$eval(ta, (t) => t.value);
  await P.$eval(ta, (t) => { t.value = t.value.replace('assign zero = (y == 8\'d0);', 'assign zero = (y == 8\'d0)'); t.dispatchEvent(new Event('input', { bubbles: true })); });
  await P.waitForTimeout(1200);
  const prow = await P.evaluate(() => (window.ccProblems ? window.ccProblems.store.list({}) : []).filter((p) => p.severity === 'error' && /pebble_alu\.v/.test(JSON.stringify(p))).map((p) => p.text));
  ok(prow.length >= 1, 'Problems: a missing ";" in pebble_alu.v is an error row (' + prow[0] + ')');
  await P.$eval(ta, (t, v) => { t.value = v; t.dispatchEvent(new Event('input', { bubbles: true })); }, before);
  await P.waitForTimeout(1200);
  const prow2 = await P.evaluate(() => (window.ccProblems ? window.ccProblems.store.list({}) : []).filter((p) => p.severity === 'error' && /pebble_alu\.v/.test(JSON.stringify(p))).length);
  ok(prow2 === 0, 'undone: the row goes');
  await tab(P, 'flow');
  await P.waitForSelector('[data-chip-last="synth"]', { timeout: 15000 }).catch(() => {});
  const lastSyn = await P.$eval('[data-chip-last="synth"]', (e) => e.textContent).catch(() => '');
  ok(/Yosys 0\.9/.test(lastSyn) && /same as then/.test(lastSyn), 'Flow: the sample\'s recorded Yosys run, inputs the same as then — ' + lastSyn);
  ok(!E.problems.length, 'no console errors', E.problems.slice(0, 5).join(' | '));
  await E.ctx.close();
} catch (err) {
  fail++;
  console.log('  FAIL ' + (err.stack || err.message));
} finally {
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  try { admin('down'); } catch { /* fine */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
