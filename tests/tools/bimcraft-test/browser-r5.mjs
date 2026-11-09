#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-r5.mjs — BimCraft round 5 (session bim-mount_PART_5) in the lab, headless, with real clicks. ONE app, SwiftShader, one pass.
 *   nice node tools/bimcraft-test/browser-r5.mjs [--shots <dir>]
 * Mints a session with tools/cadcraft-test/admin.php. Fails on any console error. Checks the mounts the round-4 sessions posted, in the page:
 *   SU.882  Quantities > Infrastructure (IFC 4.3) lists the classes and "Send to TakeoffCraft" downloads <name>.quantities.json
 *   IND.8   Export PCF adds the open IFC's own pipe segments and fittings;  IND.4  Import PCF says what it did not draw
 *   LC.2    Several models > the team's models (the shell's ccTeamwork.tw.model() stubbed, the file served by a route)
 *   EG.37   Scan menu > Propose walls and doors, tick, Accept = one undo step
 *   EG.77   a finished step is told to the window (event cc-undo-report); Studio's probe and run undo it through the app's own undo
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' - ' + d : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

// fixtures, made from the shared libraries (lib/ifc/ifc43.js write43; the pipes file is the one bin/test-ifc43.mjs reads)
fs.mkdirSync(path.join(REPO, 'tmp/bimcraft-r5'), { recursive: true });
const { write43 } = await import(pathToFileURL(path.join(REPO, 'lib/ifc/ifc43.js')).href);
const INFRA = path.join(REPO, 'tmp/bimcraft-r5/road.ifc');
fs.writeFileSync(INFRA, write43({ name: 'Road test', alignments: [{ name: 'Centre', points: [[0, 0], [100, 0]] }], facilities: [
  { kind: 'road', name: 'Main street', parts: [{ name: 'Carriageway', usage: 'LONGITUDINAL', predefined: 'ROADSEGMENT', elements: [
    { cls: 'IfcPavement', name: 'Surface', predefined: 'FLEXIBLE', profile: { w: 100, d: 7 }, height: 0.3, station: { distance: 0 }, material: 'Asphalt' },
    { cls: 'IfcKerb', name: 'Kerb A', profile: { w: 20, d: 0.15 }, height: 0.2, station: { distance: 20, lateral: 3.5 } }] }] }] }).bytes);
const PIPES_SRC = fs.readFileSync(path.join(REPO, 'bin/test-ifc43.mjs'), 'utf8').match(/const ifcPipes = `([\s\S]*?)`;/)[1];
const PIPES = path.join(REPO, 'tmp/bimcraft-r5/pipes.ifc');
// the same pipes plus a building and one storey, so the model has a level for the pipe tool
fs.writeFileSync(PIPES, PIPES_SRC.replace('ENDSEC;\nEND-ISO', "#40=IFCBUILDING('0000000000000000000010',$,'B',$,$,#6,$,$,.ELEMENT.,$,$,$);\n#41=IFCBUILDINGSTOREY('0000000000000000000011',$,'Level 1',$,$,#6,$,$,.ELEMENT.,0.);\n#42=IFCRELAGGREGATES('0000000000000000000012',$,$,$,#5,(#40));\n#43=IFCRELAGGREGATES('0000000000000000000013',$,$,$,#40,(#41));\nENDSEC;\nEND-ISO"));
const PCF = ['PIPELINE-REFERENCE A', 'PIPE', '    END-POINT 0 0 0 100', '    END-POINT 1000 0 0 100', 'FLANGE', '    END-POINT 1000 0 0 100', '    END-POINT 1020 0 0 100',
  '    SKEY FLWN', 'OLET', '    END-POINT 500 0 0 100', '    CENTRE-POINT 500 0 0', '    BRANCH1-POINT 500 200 0 50', 'SUPPORT', '    CO-ORDS 250 0 0', '    NAME REST1', ''].join('\n');
const HOUSE = path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc');

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimr5'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const statusOf = async () => (await page.textContent('[data-status]')).trim();
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return !s || (!s.busy && !s.reloading && !s.queue.length); }, null, { timeout: 90000 });
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py); };
const openFile = async (file, re) => {
  await page.setInputFiles('[data-file]', file);
  const asked = await page.waitForSelector('dialog.bc-dialog[open] button[value="discard"]', { timeout: 1500 }).catch(() => null);
  if (asked) await asked.click();
  await waitStatus(re, 120000);
};
const fresh = async () => {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
};

try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await fresh();

  console.log('== SU.882 IFC 4.3 quantities');
  await openFile(INFRA, /^Opened /);
  await page.click('[data-model-toggle]').catch(() => {});
  await page.evaluate(() => { document.querySelector('[data-qto-details]').open = true; });
  await page.evaluate(() => window.bimcraftQto.set({ view: 'infra' }));
  await page.waitForSelector('[data-qto-infra]');
  const rows = await page.$$eval('[data-qto-table] tbody tr', (r) => r.map((x) => x.textContent));
  ok(rows.length >= 2 && rows.some((x) => /Pavement/.test(x)) && rows.some((x) => /Kerb/.test(x)), 'the table lists the road classes', rows.join(' | '));
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.click('[data-qto-toTakeoff]')]);
  const q = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  ok(/\.quantities\.json$/.test(dl.suggestedFilename()) && q.app === 'BimCraft' && JSON.stringify(q).includes('Pavement'), 'Send to TakeoffCraft downloads ' + dl.suggestedFilename());
  await shot(page, 'r5-01-infra');

  console.log('== IND.8 / IND.4 PCF');
  await fresh();
  await openFile(PIPES, /^Opened /);
  await page.click('[data-model-toggle]').catch(() => {});
  await page.waitForSelector('[data-plan-wrap]:not([hidden])').catch(() => {});
  await settled();
  await page.evaluate(() => { document.querySelector('[data-mtool="pipe"]').closest('details').open = true; });
  await page.click('[data-mtool="pipe"]');
  await page.waitForSelector('[data-mep-pcfout]', { state: 'visible' });
  const [pcfDl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.click('[data-mep-pcfout]')]);
  const pcfText = fs.readFileSync(await pcfDl.path(), 'utf8');
  ok(/PIPELINE-REFERENCE/.test(pcfText) && /^PIPE$/m.test(pcfText) && /^ELBOW$/m.test(pcfText), 'Export PCF carries the IFC\'s own pipe segment and bend', pcfDl.suggestedFilename());
  ok(/Exported \d+ components/.test(await statusOf()) || /component/.test(await statusOf()), 'the status counts them: ' + await statusOf());

  console.log('== LC.2 the team\'s models');
  await fresh();
  const UUID = '11111111-2222-4333-8444-555555555555', MINE = '99999999-2222-4333-8444-555555555555';
  await ctx.route('**/api/v1/sync/open?drawing=' + UUID + '*', (r) => r.fulfill({ status: 200, contentType: 'application/octet-stream', body: fs.readFileSync(INFRA) }));
  await openFile(HOUSE, /^Opened /);
  ok(await page.$eval('[data-model-team]', (b) => b.hidden), 'a file that is not in a team project has no team button');
  await page.evaluate(([u, m]) => {
    window.ccTeamwork = { tw: { drawing: m, model: async () => ({ ok: true, hidden: 1, canEdit: true, models: [
      { drawing: { uuid: u, name: 'road.ifc', app: 'bimcraft', version: 3 }, discipline: 'civil', offset: { x: 2000, y: 0, z: 0, rot: 0 }, visible: true },
      { drawing: { uuid: '22222222-2222-4333-8444-555555555555', name: 'notes.dwg', app: 'cadcraft', version: 1 }, discipline: 'arch', offset: { x: 0, y: 0, z: 0, rot: 0 }, visible: true }] }) } };
    window.dispatchEvent(new Event('cc-teamwork-ready'));
  }, [UUID, MINE]);
  ok(await page.$eval('[data-model-team]', (b) => !b.hidden), 'with the shell\'s team module and a cloud file the button shows');
  // 0.9 mounts-09: the panel sections fold (shell accordion); a person opens the section that holds the button first, as this does
  await page.evaluate(() => { const b = document.querySelector('[data-model-team]'); for (let n = b.parentElement; n && !b.offsetParent; n = n.parentElement) { const h = n.querySelector(':scope > [data-af="closed"]'); if (h) { h.click(); } } });
  await page.click('[data-model-team]');
  await waitStatus(/team|model/i, 60000);
  await page.waitForFunction(() => document.querySelectorAll('[data-model-remove]').length >= 1, null, { timeout: 60000 });
  const mnames = await page.$$eval('.bc-model-name', (s) => s.map((x) => x.textContent));
  ok(mnames.length === 2 && mnames.includes('road.ifc'), 'the team\'s IFC opens beside the open model; the .dwg is skipped', mnames.join(', ') + ' / ' + await statusOf());
  await shot(page, 'r5-02-team');

  console.log('== EG.37 Propose walls + EG.77 undo reporter');
  await fresh();
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'R5 scan'); await page.fill('[data-new-levels]', '2'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await waitStatus(/^New building R5 scan/);
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
  await page.evaluate(() => { window.__ev = []; window.addEventListener('cc-undo-report', (e) => window.__ev.push(e.detail)); });
  ok(await page.evaluate(() => !!window.ccUndoReporter && typeof window.ccUndoReporter.onMessage === 'function'), 'the window offers the undo reporter to Studio');
  await page.click('[data-mtool="wall"]');
  const [wy] = await page.evaluate(() => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(); for (const y of [4000, 6000, 8000, 2000, -2000, -4000, 10000]) { const a = pv.toScreen([0, y]), b = pv.toScreen([5000, y]); if (document.elementFromPoint(r.left + a.x, r.top + a.y) === pv.canvas && document.elementFromPoint(r.left + b.x, r.top + b.y) === pv.canvas) return [y]; } return [4000]; });
  await planClick(0, wy); await planClick(5000, wy); await page.keyboard.press('Escape');
  await settled();
  const ev1 = await page.evaluate(() => window.__ev.filter((e) => e.type === 'edit.done' && e.data.kind === 'do').map((e) => e.data));
  ok(ev1.length === 1 && ev1[0].depth === 1 && ev1[0].label, 'one drawn wall = one finished step told to Studio', JSON.stringify(ev1));
  const p1 = await page.evaluate(() => window.ccUndoReporter.onMessage('undo.probe', {}));
  ok(p1 && p1.depth === 1 && p1.step === ev1[0]?.step, 'Studio\'s probe names that step', JSON.stringify(p1));
  const wallsN = () => page.evaluate(() => window.bimcraftPlan.view.scene.walls?.length ?? window.bimcraftPlan.state.walls?.length ?? 0);
  const w1 = await wallsN();
  // a 6 x 4 m scanned room (metres), like browser-draw06's, standing clear of the wall above
  const lines = []; let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const put = (x, y, z) => lines.push((x + 2).toFixed(4) + ' ' + (y + 1).toFixed(4) + ' ' + (z + 0.35).toFixed(4));
  for (let k = 0; k < 24000; k++) { const z = rnd() * 2.7, tt = rnd(), side = k % 4; if (side === 0) put(tt * 6, 0, z); else if (side === 1) put(6, tt * 4, z); else if (side === 2) put(tt * 6, 4, z); else put(0, tt * 4, z); }
  for (let k = 0; k < 12000; k++) put(rnd() * 6, rnd() * 4, 0);
  await page.setInputFiles('[data-cloud-input]', { name: 'room-scan.xyz', mimeType: 'text/plain', buffer: Buffer.from(lines.join('\n')) });
  await page.waitForFunction(() => window.bimcraftCloud?.state?.()?.kept > 0, null, { timeout: 60000 });
  await page.evaluate(() => window.bimcraftScan.api.changed());
  await page.waitForTimeout(400);
  await page.click('[data-scan-tools] summary');
  await page.click('[data-scan-propose]');
  await page.waitForSelector('[data-scan-item]', { timeout: 20000 });
  const items = await page.$$eval('[data-scan-list] label', (l) => l.map((x) => x.textContent.trim()));
  ok(items.length >= 4, 'Propose walls lists the walls it found, a tick for each', items.join(' | '));
  await shot(page, 'r5-03-propose');
  await page.click('[data-scan-accept]');
  await settled();
  const w2 = await wallsN();
  ok(w2 >= w1 + 4, 'Accept draws the ticked walls (' + w1 + ' -> ' + w2 + ')');
  const ev2 = await page.evaluate(() => window.__ev.filter((e) => e.type === 'edit.done' && e.data.kind === 'do').map((e) => e.data));
  ok(ev2.length === 2 && ev2[1].depth === 2, 'the whole set is one more step told to Studio', JSON.stringify(ev2.map((e) => e.depth)));
  const p2 = await page.evaluate(() => window.ccUndoReporter.onMessage('undo.probe', {}));
  const run = await page.evaluate((s) => window.ccUndoReporter.onMessage('undo.run', { step: s }), p2.step);
  await settled();
  ok(run && run.ok === true && await wallsN() === w1, 'Studio\'s run undoes the scan walls through the app\'s own undo (' + JSON.stringify(run) + ')');
  const stale = await page.evaluate(() => window.ccUndoReporter.onMessage('undo.run', { step: 'nope' }));
  ok(stale && stale.ok === false, 'a run for a step that is not the top one is refused');
  const evU = await page.evaluate(() => window.__ev.filter((e) => e.data.kind === 'undo').length);
  ok(evU === 1, 'the undo is told to Studio once');
  await page.keyboard.press('Control+z');
  await settled();
  const evU2 = await page.evaluate(() => window.__ev.filter((e) => e.data.kind === 'undo').length);
  ok(evU2 === 2, 'Ctrl+Z in the app is the app\'s own and is told to the journal');
  console.log('== IND.4 Import PCF');
  await page.evaluate(() => document.querySelector('[data-mtool="pipe"]').closest('details').open = true);
  await page.click('[data-mtool="pipe"]');
  await page.setInputFiles('input[type=file][accept=".pcf,.txt"]', { name: 'extras.pcf', mimeType: 'text/plain', buffer: Buffer.from(PCF) });
  await waitStatus(/Drew|imported|Imported|PCF/i, 30000);
  const st = await statusOf();
  const pcfProblems = await page.evaluate(() => JSON.stringify(window.ccProblems.store.list().filter((p) => p.source === 'bimcraft.pcf' || /pcf/i.test(p.code || '')).map((p) => p.text)));
  ok(/extras\.pcf/.test(st) && /(support|olet|flange)/i.test(pcfProblems), 'Import PCF says what it drew and, in Problems, what it did not draw: ' + st + ' | ' + pcfProblems.slice(0, 200));
  console.log('== LD.1 live plants');
  const HEAD = 'key,botanical,type,form,foliage,height_m,spread_m,plant_height_m,plant_spread_m,growth,light,water,soil,zone_min,zone_max,spacing_m,container,region,symbol,model,notes,source';
  let plantsMode = 'rows';
  await ctx.route('**/api/v1/library/plants.csv', (r) => plantsMode === 'down' ? r.abort() : r.fulfill({ status: 200, contentType: 'text/csv', body: HEAD + '\nzz-r5-test,Zzyzx testii,tree,round,deciduous,9,6,,,medium,sun,low,,5,9,,,,,,,r5' }));
  const plantCards = async () => {
    await fresh();
    await page.locator('dialog[open] button:has-text("Discard all")').click({ timeout: 1500 }).catch(() => {});
    await page.click('[data-empty] [data-new]'); await page.waitForSelector('dialog.bc-new');
    await page.fill('[data-new-name]', 'Plants'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm'); await page.click('[data-new-ok]');
    await waitStatus(/^New building Plants/);
    await page.click('[data-rtab="library"]'); await page.click('.bc-lib-src:has-text("Plants")');
    await page.waitForFunction(() => document.querySelectorAll('.bc-lib-card').length >= 300, null, { timeout: 20000 }).catch(() => {});
    await page.fill('.bc-lib-search', 'zzyzx'); await page.waitForTimeout(600);
    const hit = (await page.$$('.bc-lib-card')).length;
    await page.fill('.bc-lib-search', ''); await page.waitForTimeout(600);
    return { hit, all: (await page.$$('.bc-lib-card')).length };
  };
  const live = await plantCards();
  ok(live.hit === 1 && live.all >= 300, 'a plant only the Library has shows beside the bundled ones', JSON.stringify(live));
  plantsMode = 'down';
  const off = await plantCards();
  ok(off.hit === 0 && off.all >= 300, 'with the Library unreachable the bundled list stands', JSON.stringify(off));
} catch (e) {
  fail++; console.log('  FAIL ' + String(e.message || e).split('\n').slice(0, 8).join(' // '));
} finally {
  const real = problems.filter((p) => !/favicon|api\/v1\/hardware|status of 429|net::ERR_FAILED/.test(p));
  ok(real.length === 0, 'no console errors' + (real.length ? ': ' + real.slice(0, 4).join(' | ') : ''));
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'down', 'bimr5'], { stdio: 'ignore' }); } catch (e) { /* none */ }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
