#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-mep07.mjs — 0.7 LC.9 (session `mep-07`) in the real /lab/bimcraft page. Run as root (it mints the add-on test admin's
 * session with sudo -u www-data; the admin-login throttle is never touched).
 *
 *   node tools/bimcraft-test/browser-mep07.mjs [--only api|equip|connect|structure|spools] [--shots <dir>]
 *
 *   api   the add-on API 1.1 through the tagger fixture add-on (tools/addons-test/bimcraft/tagger, developer mode): model.write
 *         makes a box on the open model's first level as ONE change, the 3D view shows it after the rebuild, Undo takes it back,
 *         Redo brings it again; mep.runs / mep.ports answer; a throw rejects and changes nothing.
 *   equip a new building: Build › Equipment places a pump (its footprint and open ports on the plan, the pump in 3D); Pipe started
 *         on its outlet takes NPS 2 chilled water and is fixed to it; the pump moved in Properties: the pipe's start follows and
 *         stays connected; Check connections lists the open inlet and the pipe's open end; a diffuser with its neck.
 *   structure  the showcase (fixtures/showcase/bimcraft-mep-plant-room.ifc): the Clash check offers the MEP sets; "Pipes and ducts ×
 *         structure" runs clash.js on them (the coil's return through the south wall); Openings needed lists it with CSV and BCF
 *         downloads; Check clearances answers.
 *   spools the showcase: a spooled steel run's Properties (Cut into spools, longest spool, line, field welds), the Field weld tool
 *         adds one (the spools change, one undo step), Spool sheets (PDF) and Spool list (CSV) download; Duct cut list (CSV).
 * No console errors. Shots in tmp/shots/mep07.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : path.join(ROOT, 'tmp/shots/mep07');
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const want = (k) => !ONLY || ONLY === k;
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const php = (script, cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', script, cmd], { cwd: ROOT }).toString().trim().split('\n').pop());
const pkgOf = (dir) => {
  const files = {};
  const walk = (d) => { for (const n of fs.readdirSync(path.join(dir, d))) { const p = d ? d + '/' + n : n; if (fs.statSync(path.join(dir, p)).isDirectory()) walk(p); else files[p] = fs.readFileSync(path.join(dir, p), 'utf8'); } };
  walk('');
  return { manifest: JSON.parse(files['addon.json']), files };
};
const { fixtureIfc } = await import(pathToFileURL(path.join(ROOT, 'tools/bimcraft-test/ifc-fixture.mjs')).href);
const { cookie } = php('tools/addons-test/admin.php', 'session');
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((x) => path.join(cacheDir, build, x)).find((x) => fs.existsSync(x));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
  const [cn, cv] = cookie.split('=');
  await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(e.message));
  const ready = () => page.waitForFunction(() => window.ccAddons && window.ccAddons.loader && window.ccAddons.loader.started, null, { timeout: 60000 });
  const waitStatus = (re) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout: 60000 });

  const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
  const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
  const planClick = async (x, y, opts) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, opts); };
  async function newBuilding(name) {
    await page.goto('https://getcadcraft.com/lab/bimcraft?space=paper', { waitUntil: 'load' });
    await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
    await page.reload({ waitUntil: 'load' });
    await page.click('[data-empty] [data-new]');
    await page.waitForSelector('dialog.bc-new');
    await page.fill('[data-new-name]', name);
    await page.fill('[data-new-levels]', '2');
    await page.fill('[data-new-height]', '3000 mm');
    await page.click('[data-new-ok]');
    await waitStatus(new RegExp('^New building ' + name));
    await page.waitForSelector('[data-plan-wrap]:not([hidden])');
    await settled();
  }

  if (want('equip')) {
    console.log('\nEquipment, connected runs, Check connections');
    await newBuilding('MEP 07');
    await page.click('[data-res-tools] summary');
    await page.click('[data-mtool="equip"]');
    ok(await page.isVisible('[data-mopts="equip"]') && await page.$eval('[data-eq-kind]', (x) => x.options.length) === 9, 'Build › Equipment: the bar lists the nine kinds');
    await page.selectOption('[data-eq-kind]', 'pump');
    await page.selectOption('[data-eq-f="size"]', '2');
    await page.selectOption('[data-eq-f="system"]', 'chw');
    await page.fill('[data-eq-tag]', 'P-1'); await page.press('[data-eq-tag]', 'Enter');
    await planClick(0, 0);
    await settled();
    const eqs = () => page.evaluate(() => window.bimcraftMepEq.state.eqs.map((e) => ({ guid: e.guid, id: e.id, kind: e.kind, x: e.x, y: e.y, tag: e.tag, ports: e.ports.map((p) => ({ name: p.name, at: p.at })) })));
    let E = await eqs();
    ok(E.length === 1 && E[0].kind === 'pump' && E[0].tag === 'P-1', 'a click places the pump (tagged P-1)', JSON.stringify(E));
    const key = await page.evaluate((id) => window.bimcraftMep.api.kb() + id, E[0].id);
    await page.waitForFunction((k) => window.bimcraftMep.api.host.viewer()?.allKeys?.().has(k), key, { timeout: 60000 }).catch(() => {});
    ok(await page.evaluate((k) => window.bimcraftMep.api.host.viewer().allKeys().has(k), key), 'the pump is in the 3D view');
    ok(await page.evaluate((k) => window.bimcraftPlan.view.scene.symbols.filter((s) => s.key === k && s.color === '--layer-orange').length === 2, key), 'the plan: its footprint and its two ports, both open (warning colour)');
    await page.screenshot({ path: path.join(SHOTS, 'equip-01-pump.png') });
    // a pipe from its outlet
    const out = E[0].ports.find((p) => p.name === 'out').at;
    await page.click('[data-res-tools] summary');
    await page.click('[data-mtool="pipe"]');
    await planClick(out[0], out[1]);
    const took = await page.evaluate(() => { const P = window.bimcraftMep.state.pipe; return { size: P.size, system: P.system, mat: P.mat, ends: window.bimcraftMep.state.ends }; });
    ok(took.size === '2' && took.system === 'chw' && took.mat === 'steel' && took.ends[0]?.port === 'out', 'started on the outlet: the pipe takes NPS 2 chilled water (steel) and fixes its start to the port', JSON.stringify(took));
    await planClick(3000, out[1]);
    await planClick(3000, 2000);
    await page.keyboard.press('Enter');
    await settled();
    const runs = () => page.evaluate(() => window.bimcraftMep.state.runs.map((r) => ({ guid: r.guid, points: r.points, ends: r.ends, size: r.size, system: r.system })));
    let R = await runs();
    ok(R.length === 1 && R[0].ends[0]?.eq === E[0].guid && Math.abs(R[0].points[0][2] - out[2]) < 0.5, 'the run is drawn at the port\'s height, fixed to the pump', JSON.stringify(R));
    ok(await page.evaluate(() => !window.bimcraftMepEq.state.free.has(window.bimcraftMepEq.state.eqs[0].id + '#out') && window.bimcraftMepEq.state.free.has(window.bimcraftMepEq.state.eqs[0].id + '#in')), 'its outlet is connected now; the inlet is still open');
    // move the pump in Properties
    await page.evaluate((k) => window.bimcraftMep.api.host.select([k]), key);
    await page.waitForSelector('[data-mp-eqy]', { timeout: 10000 }).catch(() => {});
    ok(await page.isVisible('[data-mp-eqy]') && await page.isVisible('[data-mp-eq-size]'), 'picked: Properties shows its sizes, tag, place and ports');
    await page.fill('[data-mp-eqy]', '800'); await page.press('[data-mp-eqy]', 'Enter');
    await settled();
    R = await runs(); E = await eqs();
    ok(Math.abs(E[0].y - 800) < 0.5 && Math.abs(R[0].points[0][1] - 800) < 0.5 && Math.abs(R[0].points[1][1] - out[1]) < 0.5, 'moved 800 north: the pipe\'s start went with it', JSON.stringify(R[0].points.slice(0, 2)));
    ok(await page.evaluate(() => !window.bimcraftMepEq.state.free.has(window.bimcraftMepEq.state.eqs[0].id + '#out')), '…and is still connected');
    // a diffuser
    await page.click('[data-res-tools] summary');
    await page.click('[data-mtool="equip"]');
    await page.selectOption('[data-eq-kind]', 'diffuser');
    await page.fill('[data-eq-f="neck"]', '250'); await page.press('[data-eq-f="neck"]', 'Enter');
    await planClick(6000, 4000);
    await settled();
    ok((await eqs()).some((e) => e.kind === 'diffuser'), 'a diffuser placed (at the ceiling height the bar gives it)');
    // Check connections
    await page.click('[data-res-tools] summary');
    await page.click('[data-mep-check]');
    await page.waitForSelector('[data-mep-issues]:not([hidden])', { timeout: 10000 }).catch(() => {});
    const issues = await page.evaluate(() => [...document.querySelectorAll('[data-mep-issue]')].map((b) => b.dataset.mepIssue));
    ok(issues.filter((c) => c === 'open-port').length === 2 && issues.includes('open-end'), 'Check connections: the pump\'s inlet and the diffuser\'s neck open, the pipe\'s far end open', JSON.stringify(issues));
    await page.click('[data-mep-issue="open-port"]');
    ok(await page.evaluate(() => window.bimcraftMep.api.host.viewer().selection.size === 1), 'a line selects what it names');
    await page.screenshot({ path: path.join(SHOTS, 'equip-02-check.png') });
    // undo the move
    const n = await page.evaluate(() => window.bimcraftLive.editor.changes.length);
    await page.locator('[data-undo]').first().click(); await settled();
    await page.locator('[data-undo]').first().click(); await settled();
    R = await runs();
    ok(await page.evaluate((x) => window.bimcraftLive.editor.changes.length === x - 2, n) && Math.abs(R[0].points[0][1] - out[1]) < 0.5, 'two undos (the diffuser, the move): the pipe is back on the pump where it was');
  }

  const openShowcase = async () => {
    await page.goto('https://getcadcraft.com/lab/bimcraft?space=paper', { waitUntil: 'load' });
    await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
    await page.reload({ waitUntil: 'load' });
    await page.setInputFiles('[data-file]', path.join(ROOT, 'fixtures/showcase/bimcraft-mep-plant-room.ifc'));
    await waitStatus(/^Opened /);
  };
  const download = async (click) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }).catch(() => null), click()]); return dl ? { name: dl.suggestedFilename(), bytes: fs.readFileSync(await dl.path()) } : null; };

  if (want('structure')) {
    console.log('\nMEP against the structure (showcase)');
    await openShowcase();
    await page.evaluate(() => { const d = document.querySelector('[data-clash-details]'); d.open = true; d.dispatchEvent(new Event('toggle')); });
    await page.waitForSelector('[data-mep-struct]', { timeout: 10000 }).catch(() => {});
    const opts = await page.$$eval('[data-clash-a] option', (o) => o.map((x) => x.value));
    ok(['mep:mep', 'mep:walls', 'mep:slabs', 'mep:structure'].every((v) => opts.includes(v)), 'the Clash check offers Pipes and ducts, Walls, Slabs and Structure', JSON.stringify(opts.filter((v) => v.startsWith('mep:'))));
    await page.click('[data-mep-clash]');
    await page.waitForFunction(() => Array.isArray(window.bimcraftClash.results()), null, { timeout: 120000 }).catch(() => {});
    const hard = await page.evaluate(() => (window.bimcraftClash.results() || []).length);
    ok(hard >= 1 && await page.$eval('[data-clash-a]', (x) => x.value) === 'mep:mep' && await page.$eval('[data-clash-b]', (x) => x.value) === 'mep:structure', 'Pipes and ducts × structure picks both sets and runs clash.js: ' + hard + ' clash(es)');
    await page.fill('[data-mep-gap]', '25');
    await page.click('[data-mep-openings]');
    await page.waitForSelector('[data-mep-open-row]', { timeout: 30000 }).catch(() => {});
    const rows = await page.$$eval('[data-mep-open-row]', (r) => r.map((x) => x.textContent));
    ok(rows.length >= 1 && rows.some((t) => /Ø\d+/.test(t)), 'Openings needed: ' + rows.length + ' listed (the coil return through the south wall)', JSON.stringify(rows));
    await page.screenshot({ path: path.join(SHOTS, 'structure-01-openings.png') });
    const csv = await download(() => page.click('[data-mep-open-csv]'));
    ok(csv && /-openings\.csv$/.test(csv.name) && csv.bytes.toString('utf8').split('\r\n').length >= 3, 'Openings as CSV downloads', csv?.name);
    const bcf = await download(() => page.click('[data-mep-open-bcf]'));
    ok(bcf && /\.bcf$/.test(bcf.name) && bcf.bytes[0] === 0x50 && bcf.bytes[1] === 0x4b, 'Openings as BCF issues downloads a BCF zip', bcf?.name);
    await page.click('[data-mep-soft]');
    await page.waitForSelector('[data-mep-st-msg]', { timeout: 30000 }).catch(() => {});
    ok(/closer to the structure/.test(await page.textContent('[data-mep-st-msg]').catch(() => '')), 'Check clearances answers with a count');
  }

  if (want('spools')) {
    console.log('\nSpools (showcase)');
    await openShowcase();
    await page.click('[data-model-toggle]');
    await settled();
    const runs = () => page.evaluate(() => window.bimcraftMep.state.runs.map((r) => ({ guid: r.guid, line: r.line, spoolMax: r.spoolMax, welds: r.fieldWelds, parts: r.parts, points: r.points })));
    const R0 = (await runs()).find((r) => r.line === '1');
    await page.evaluate((id) => window.bimcraftMep.api.host.select([window.bimcraftMep.api.kb() + id]), R0.parts[0]);
    await page.waitForSelector('[data-mp-mepspool]', { timeout: 10000 }).catch(() => {});
    ok(await page.isChecked('[data-mp-mepspool]').catch(() => false) && await page.isVisible('[data-mp-mepspoolmax]') && await page.$eval('[data-mp-mepline]', (x) => x.value) === '1', 'a spooled steel run: Cut into spools on, longest spool, line 1, its field weld in Properties');
    const count0 = await page.evaluate(() => window.bimcraftMep.api.host.viewer && 0);
    const pdf = await download(() => page.click('[data-mp-mepspoolpdf]'));
    ok(pdf && /-spools\.pdf$/.test(pdf.name) && pdf.bytes.slice(0, 8).toString() === '%PDF-1.4', 'Spool sheets (PDF) downloads', pdf?.name);
    const csv = await download(() => page.click('[data-mp-mepspoolcsv]'));
    ok(csv && /CHW-1-S01/.test(csv.bytes.toString('utf8')), 'Spool list (CSV) names CHW-1-S01 …');
    // a second field weld with the tool, on the run's long leg
    const n0 = await page.evaluate(() => window.bimcraftLive.editor.changes.length);
    await page.click('[data-res-tools] summary');
    await page.click('[data-mtool="weld"]');
    const a = R0.points[0], b = R0.points[1];
    await planClick(a[0] + (b[0] - a[0]) * 0.75, a[1] + (b[1] - a[1]) * 0.75);
    await settled();
    const R1 = (await runs()).find((r) => r.guid === R0.guid);
    ok(R1.welds.length === R0.welds.length + 1 && await page.evaluate((x) => window.bimcraftLive.editor.changes.length === x + 1, n0), 'the Field weld tool adds a weld to the run (one undo step)', JSON.stringify(R1.welds));
    await page.screenshot({ path: path.join(SHOTS, 'spools-01-weld.png') });
    await page.locator('[data-undo]').first().click(); await settled();
    ok((await runs()).find((r) => r.guid === R0.guid).welds.length === R0.welds.length, 'undo takes the weld back');
    await page.click('[data-res-tools] summary');
    const dc = await download(() => page.click('[data-mep-ductcut]'));
    ok(dc && /duct-cut-list\.csv$/.test(dc.name) && dc.bytes.toString('utf8').split('\r\n').length >= 3, 'Duct cut list downloads a CSV', dc?.name);
    void count0;
  }

  if (want('api')) {
    console.log('\nAdd-on API 1.1 (tagger fixture)');
    await page.goto('https://getcadcraft.com/lab/bimcraft', { waitUntil: 'load' });
    await ready();
    const pkg = pkgOf(path.join(ROOT, 'tools/addons-test/bimcraft/tagger'));
    await page.evaluate(async (p) => { localStorage.setItem('cc-addons-dev', '1'); const r = await window.ccAddons.installPackage(p); if (!r.ok) throw new Error(r.reason); }, pkg);
    await page.reload({ waitUntil: 'load' });
    await ready();
    await page.waitForFunction(() => window.ccAddons.list().find((a) => a.id === 'zz-test.tagger')?.state === 'active', null, { timeout: 20000 });
    ok(await page.evaluate(() => window.ccAddons.loader.apiVersion === '1.1' && typeof window.__testTagger.model.write === 'function' && typeof window.__testTagger.mep.ports === 'function'), 'API 1.1: a 1.0 add-on loads and gets model.write and mep');
    await page.setInputFiles('[data-file]', { name: 'bimcraft-fixture.ifc', mimeType: 'application/octet-stream', buffer: Buffer.from(fixtureIfc()) });
    await waitStatus(/^Opened /);
    const n0 = await page.evaluate(() => window.bimcraftLive.editor.changes.length);
    const res = await page.evaluate(async () => window.__testTagger.model.write('a box', (w) => {
      const st = w.api.GetLineIDsWithType(w.mid, w.api.GetTypeCodeFromName('IFCBUILDINGSTOREY')).get(0);
      const lp = w.api.GetLine(w.mid, st, false).ObjectPlacement.value;
      const id = w.make('IFCBUILDINGELEMENTPROXY', w.guid(), w.ownerHistory(), w.L('Add-on box'), null, null, w.H(w.placeAt(lp, 0, 0, 0, 0)), null, null, 'NOTDEFINED');
      w.setShape(id, [w.rep('body', 'Body', 'SweptSolid', [w.box(0, 0, 0, 800, 600, 900)])]);
      w.contain(id, st);
      return { n: 1 };
    }));
    ok(res.created.length === 1 && res.value.n === 1, 'model.write resolves with the created element', JSON.stringify(res));
    // the Draw module's handle (mep-ui.js test hook): its key base and the viewer
    const key = await page.evaluate((id) => window.bimcraftMep.api.kb() + id, res.created[0]);
    await page.waitForFunction((k) => window.bimcraftMep.api.host.viewer()?.allKeys?.().has(k), key, { timeout: 60000 }).catch(() => {});
    ok(await page.evaluate((k) => window.bimcraftMep.api.host.viewer().allKeys().has(k), key), 'the 3D view shows the new element after the rebuild');
    const last = await page.evaluate((n) => { const c = window.bimcraftLive.editor.changes; return { n: c.length - n, label: c.at(-1)?.label }; }, n0);
    ok(last.n === 1 && /: a box$/.test(last.label), 'ONE change, labelled "<add-on name>: a box"', JSON.stringify(last));
    await page.screenshot({ path: path.join(SHOTS, 'api-01-write.png') });
    await page.locator('[data-undo]').first().click();
    await page.waitForFunction((n) => window.bimcraftLive.editor.changes.length === n, n0, { timeout: 30000 }).catch(() => {});
    // the model reloads after Undo: wait until it is open again
    await page.waitForFunction(() => { try { const e = window.bimcraftLive.editor; return !!e && e.api.file(e.mid).ids().length > 0; } catch (x) { return false; } }, null, { timeout: 60000 }).catch(() => {});
    ok(await page.evaluate((g) => { const e = window.bimcraftLive.editor, f = e.api.file(e.mid); for (const id of f.ids()) if (e.api.GetLine(e.mid, id, false)?.GlobalId?.value === g) return false; return true; }, res.guids[0]), 'Undo takes it back');
    let threw = await page.evaluate(async () => { try { await window.__testTagger.model.write('broken', () => { throw new Error('nope'); }); return ''; } catch (e) { return e.message; } });
    ok(threw === 'nope' && await page.evaluate((n) => window.bimcraftLive.editor.changes.length === n, n0), 'a throw in fn rejects; nothing recorded');
    const mep = await page.evaluate(() => ({ runs: window.__testTagger.mep.runs(), ports: window.__testTagger.mep.ports() }));
    ok(Array.isArray(mep.runs) && Array.isArray(mep.ports), 'mep.runs / mep.ports answer (the fixture has no runs: ' + mep.runs.length + ', ports: ' + mep.ports.length + ')');
    await page.evaluate(async () => { await window.ccAddons.uninstall('zz-test.tagger'); localStorage.removeItem('cc-addons-dev'); localStorage.removeItem('cc-addons:' + window.ccAddons.loader.app); });
  }

  const unexpected = problems.filter((p) => !/unsigned/.test(p));
  ok(!unexpected.length, 'no console errors', unexpected.slice(0, 3).join(' | '));
} finally {
  await browser.close();
  php('tools/addons-test/admin.php', 'down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
