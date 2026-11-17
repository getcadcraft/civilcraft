// SPDX-License-Identifier: Apache-2.0
// Super 0.1, round 3 (super_PART_3): the page parts of SC.3 (PartCraft's Save in the project, units), SC.6 (setup file, reset), SC.7 (the export
// set), the OS pop-out of a float, and the phone layout. The cores are bin/test-super-core.mjs; the window is browser.mjs.
//   node tools/super-test/features.mjs
import path from 'node:path'; import fs from 'node:fs';
import { ROOT, start, launch } from './serve.mjs';
const { url: URL0, close } = await start({ langs: [''] });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e.message)));
page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource|bad HTTP response code/.test(m.text())) errors.push(m.text()); });
const boot = async (q = '') => { await page.goto(URL0 + q); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); };
const only = (id, ws = 'model') => page.evaluate(([i, w]) => { const s = JSON.parse(JSON.stringify(window.superWindow.state)); s.active = w; if (!s.shown.includes(w)) s.shown.push(w);   /* the bar starts with Build only (booklet round 4): a workspace must be on the bar to be in front */ s.workspaces[w].docks = { left: [], center: [{ tabs: [i], active: i }], right: [], bottom: [] }; window.superWindow.state = s; }, [id, ws]);
const ready = id => page.waitForFunction(i => document.querySelector(`[data-panel="${i}"]`)?.dataset.mount === 'ready', id, { timeout: 60000 });

/* ---- SC.3: PartCraft's Save is collected into the project ---- */
await boot(); await only('part'); await ready('part'); await page.waitForTimeout(1500);
{
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 90000 }), page.click('[data-act="save"]')]);
  const p = await dl.path(); const bytes = fs.readFileSync(p);
  const info = await page.evaluate(() => window.superWindow.project.members.map(m => [m.app, m.name, m.role]));
  ok(info.some(m => m[0] === 'partcraft' && m[2] === 'saved' && /\.json$/.test(m[1])), 'PartCraft\'s own Save is collected into the .ccproject: ' + JSON.stringify(info));
  ok(dl.suggestedFilename().endsWith('.ccproject') && bytes.length > 200, 'and the project file is written');
}

/* ---- SC.3: the unit travels, and a model in millimetres is not sent 1000 times too big ---- */
await boot();
{
  await page.evaluate(() => { const s = document.querySelector('[data-settings-open]'); s && s.click(); });
  await page.waitForSelector('dialog[data-app-settings][open]');
  await page.click('.shell-sec-nav button:text-is("Project units")');
  await page.selectOption('[data-sc-units]', 'ft');
  ok(await page.evaluate(() => window.superWindow.project.units.length) === 'ft' && await page.evaluate(() => localStorage.getItem('cc-super-units')) === 'ft', 'Settings › Project units sets the project\'s unit and keeps it');
  const ev = await page.evaluate(() => { const w = window.superWindow, got = []; const off = w.P.onChange(w.project, e => got.push(e)); w.P.setUnits(w.project, { length: 'mm' }, 'test'); off(); return got; });
  ok(ev.length === 1 && ev[0].id === 'units' && ev[0].source === 'test', 'the window listens to project events');
  await page.evaluate(() => document.querySelector('dialog[data-app-settings]').close());
}

/* ---- the Project units list shows the project's unit after a restart (it showed "m") ---- */
await page.evaluate(() => localStorage.setItem('cc-super-units', 'in'));
await boot();
{
  const u = await page.evaluate(() => [window.superWindow.project.units.length, document.querySelector('[data-sc-units]')?.value]);
  ok(u[0] === u[1], 'after a restart the Project units list shows the project\'s unit: ' + JSON.stringify(u));
  await page.evaluate(() => localStorage.removeItem('cc-super-units'));
}

/* ---- SC.6: the setup file ---- */
await boot();
{
  await page.evaluate(() => { window.superWindow.prefs.reload = () => { window.__reloaded = (window.__reloaded || 0) + 1; }; });
  await page.evaluate(() => { localStorage.setItem('cc-input-family', 'cad'); localStorage.setItem('bimcraft.input', '{"format":"cadcraft-input","version":1}'); localStorage.setItem('cc-token', 'SECRET'); });
  const doc = await page.evaluate(() => window.superWindow.prefs.exportFile ? window.superWindow.prefs.capture() : null);
  ok(doc && doc.sections.window && doc.sections.shell.keys['cc-input-family'] === 'cad' && doc.sections['app:bimcraft'].keys['bimcraft.input'] && !JSON.stringify(doc).includes('SECRET'), 'capture holds the window, the layout and each app\'s keys, and nothing else');
  await page.evaluate(() => { const s = document.querySelector('[data-settings-open]'); s && s.click(); });
  await page.waitForSelector('dialog[data-app-settings][open]'); await page.click('.shell-sec-nav button:text-is("Your setup")');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-sc-prefs-export]')]);
  const text = fs.readFileSync(await dl.path(), 'utf8');
  ok(dl.suggestedFilename().endsWith('.ccprefs.json') && JSON.parse(text).format === 'supercadcraft-prefs', 'Settings saves the setup as a .ccprefs.json');
  // change things, then import the file back
  await page.evaluate(() => { localStorage.setItem('cc-input-family', 'other'); });
  const r = await page.evaluate(async t => window.superWindow.prefs.importText(t, { confirmFn: () => true }), text.replace('"cad"', '"cad"'));
  ok(await page.evaluate(() => window.__reloaded) === 1, 'the apps are told to start again when their settings changed');
  ok(r.ok && r.changed.includes('shell') && await page.evaluate(() => localStorage.getItem('cc-input-family')) === 'cad', 'importing the file puts the setup back: ' + JSON.stringify(r));
  const bad = await page.evaluate(async () => window.superWindow.prefs.importText('{"format":"x"}', { confirmFn: () => true }));
  ok(!bad.ok && (await page.textContent('[data-sc-prefs-msg]')).includes('not a SuperCad Studio setup'), 'a file that is not ours is refused, in words');
  const hostile = JSON.stringify({ format: 'supercadcraft-prefs', version: 1, sections: { shell: { at: '2026-10-28T10:00:00Z', keys: { 'cc-input-family': 'ok', 'cc-token': 'x', evil: 'y' } } } });
  await page.evaluate(() => localStorage.removeItem('cc-input-family'));
  await page.evaluate(async t => window.superWindow.prefs.importText(t, { confirmFn: () => true }), hostile);
  ok(await page.evaluate(() => [localStorage.getItem('cc-token'), localStorage.getItem('evil')]).then(a => a[0] === 'SECRET' && a[1] === null), 'unknown keys in a file are never written');
  // reset one workspace
  await page.evaluate(() => { const w = window.superWindow, s = JSON.parse(JSON.stringify(w.state)); s.active = 'build'; s.workspaces.build.docks.center = []; w.state = s; });
  page.once('dialog', d => d.accept());   // SC.6 round 5: a reset asks first
  await page.click('[data-sc-prefs-reset-ws]');
  ok(await page.evaluate(() => window.superWindow.state.workspaces.build.docks.center.length) > 0, 'Reset this workspace puts the starting panels back');
  await page.evaluate(() => document.querySelector('dialog[data-app-settings]').close());
  // the window's own arrangement is stamped when it changes (so the account can tell which copy is newer)
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('cc-super-prefs-at') || '{}').window) > '2026', 'a change to the arrangement is time-stamped');
}

/* ---- SC.7: the export set ---- */
await boot(); await page.evaluate(() => { localStorage.removeItem('cc-super-window'); });
await boot('?workspace=standard');
{
  await page.evaluate(() => { const w = window.superWindow; w.M.switchWorkspace(w.state, 'report'); w.render(); });
  await page.setInputFiles('[data-sc-open-input]', path.join(ROOT, 'fixtures/pdf/kitchen-plan-sheet.pdf'));
  await page.waitForFunction(() => document.querySelector('[data-panel="markup"]')?.dataset.mount === 'ready' && document.querySelector('[data-panel="markup"] canvas'), null, { timeout: 60000 });
  await page.waitForFunction(() => window.markupcraft && window.markupcraft.sheets.length > 0, null, { timeout: 60000 });   // the PDF is open (the canvas is there before the file has loaded)
  await page.click('[data-act="export"]');
  await page.waitForSelector('dialog[data-sc-export][open]');
  const rows = await page.$$eval('[data-sc-export] .sc-export-row[data-format]', e => e.map(x => [x.dataset.format, x.querySelector('input').disabled, x.textContent.trim()]));
  ok(['pdf', 'dwg', 'dxf', 'ifc', 'bcf', 'xlsx', 'step', 'landxml', 'dstv'].every(f => rows.some(r => r[0] === f)), 'the dialog lists PDF, DWG, DXF, IFC, BCF, XLSX, STEP, LandXML and DSTV (SC.7 round 5: what can be written first, the rest apart): ' + rows.map(r => r[0]));
  ok(rows.filter(r => r[1]).every(r => /open|cannot|no view|export|nothing to write/i.test(r[2])), 'a format nothing can write now is greyed with the reason: ' + JSON.stringify(rows.filter(r => r[1]).map(r => r[2].slice(0, 60))));
  ok(rows.length === 12 && rows.every(r => r[2].length > 5), 'every row says where it comes from or why not');
  const plan = await page.evaluate(() => window.superWindow.exporter.plan(['xlsx', 'bcf', 'pdf']).map(p => [p.format, p.jobs.map(j => j.key)]));
  ok(plan.find(p => p[0] === 'pdf')[1].includes('markupcraft:@pdf') || plan.find(p => p[0] === 'xlsx')[1].length > 0, 'the planner finds the views that are open: ' + JSON.stringify(plan));
  // run the formats that are on: whatever the apps write comes back in one zip, with a contents list that says what was left out
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 90000 }).catch(() => null), page.click('[data-act="export-run"]')]);
  await page.waitForFunction(() => document.querySelector('[data-sc-export] .sc-export-out li'), null, { timeout: 90000 });
  const lines = await page.$$eval('[data-sc-export] .sc-export-out li', e => e.map(x => x.textContent));
  ok(lines.length > 0, 'every job reports a file or a reason: ' + JSON.stringify(lines).slice(0, 300));
  if (dl) { const P = await import('../../public_html/assets/apps/supercadcraft/dev/super-project.js'); const z = await P.unzip(new Uint8Array(fs.readFileSync(await dl.path()))); ok(z.has('contents.txt') && dl.suggestedFilename().endsWith('export set.zip'), 'one zip with a contents list: ' + [...z.keys()].join()); }
  else ok(lines.every(l => / \(.*\): /.test(l)), 'nothing was written and the list says why');
  await page.evaluate(() => document.querySelector('[data-act="export-close"]').click());
}

/* ---- the OS pop-out of a float ---- */
await boot(); await page.evaluate(() => { const w = window.superWindow; w.state = w.M.defaultState({ demo: true }); });
{
  await page.evaluate(() => { const w = window.superWindow; w.M.tearOff(w.state, 'plan'); w.render(); });
  const [pop] = await Promise.all([ctx.waitForEvent('page', { timeout: 15000 }).catch(() => null), page.click('.sc-float [data-act="popout"]')]);
  ok(!!pop, 'a float opens in a window of its own');
  if (pop) {
    ok(await pop.evaluate(() => !!document.querySelector('.sc-body[data-panel="plan"] svg')), 'the panel itself is in that window (its state goes along)');
    ok(await page.evaluate(() => !!document.querySelector('[data-popped="plan"]')), 'a note stays where it was, with a way back');
    await pop.close(); await page.waitForFunction(() => !document.querySelector('[data-popped="plan"]'), null, { timeout: 10000 });
    ok(await page.evaluate(() => !!document.querySelector('.sc-float .sc-body[data-panel="plan"] svg')), 'closing the window brings the panel back');
  }
}

/* ---- phones ---- */
{
  const small = await browser.newContext({ viewport: { width: 390, height: 780 }, hasTouch: true, isMobile: true });
  const p2 = await small.newPage(); const errs = []; p2.on('pageerror', e => errs.push(e.message));
  await p2.goto(URL0); await p2.waitForSelector('[data-sc-ready]');
  const lay = await p2.evaluate(() => { const w = document.querySelector('.sc-work'), r = document.documentElement; return { dir: getComputedStyle(w).flexDirection, display: getComputedStyle(w).display, overflowX: r.scrollWidth <= r.clientWidth + 1, barScroll: getComputedStyle(document.querySelector('.sc-bar')).overflowX }; });
  ok((lay.display === 'flex' && lay.dir === 'column') || lay.display === 'grid', 'on a phone the panels stack (one column, or the small-screen grid with the side panels folded above the view): ' + JSON.stringify(lay));
  ok(lay.overflowX, 'and the page does not scroll sideways');
  ok(lay.barScroll === 'auto', 'the bar scrolls instead of overflowing');
  const btnH = await p2.evaluate(() => Math.min(...[...document.querySelectorAll('.sc-wstab')].map(b => b.getBoundingClientRect().height)));
  ok(btnH >= 40, 'touch targets are large: ' + btnH);
  ok(errs.length === 0, 'no errors on a phone: ' + errs.join(' | '));
  await small.close();
}

ok(errors.length === 0, 'no script errors: ' + errors.slice(0, 3).join(' | '));
console.log(`${pass} passed, ${fail} failed`);
await browser.close(); close();
process.exit(fail ? 1 : 0);
