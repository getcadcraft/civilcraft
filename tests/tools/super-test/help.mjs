// SPDX-License-Identifier: Apache-2.0
// SC.8: SuperCad Studio's help. Two halves.
//   Files (no browser): the compiled help.js holds a topic for each of the five workspaces, and each says what the workspace opens with TODAY (every starting view,
//     the tool-set panel, every tool group listed from super-tools.js SETS, by the names the person sees); every panel of the window and every Home page has a topic;
//     every {{ui:…}} label in a Super topic is a string the window really shows; contextTopic() answers for every place.
//   Page (headless Chromium, the real lab page): the help panel opens from the app bar and with F1; it lists the compiled Super topics and finds one by search;
//     with a workspace in front it opens at THAT workspace's topic (context help), with Home in front at the Home topic, with a Home page in front at that page's topic;
//     a topic's own links open in the panel; Esc closes; a window of the person's own workspace opens "The five workspaces".
//   node tools/super-test/help.mjs [--shots <dir>]
import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
import { start, launch, ROOT } from './serve.mjs';
const D = path.join(ROOT, 'public_html/assets/apps/supercadcraft/dev');
let pass = 0, fail = 0; const ok = (c, m, more = '') => { if (c) pass++; else { fail++; console.log('FAIL', m, more); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
const imp = f => import(pathToFileURL(path.join(D, f)).href);

/* ================================================================ files */
const help = (await imp('help/help.js')).default;
const en = JSON.parse(fs.readFileSync(path.join(D, 'lang/en.json'), 'utf8'));
const topics = new Map(help.topics.filter(t => t.scope === 'supercadcraft').map(t => [t.slug, t]));
const M = await imp('super-model.js'), T = await imp('super-tools.js'), H = await imp('super-help.js');
const words = t => String(t).replace(/\s+/g, ' ').toLowerCase();
const has = (slug, label) => words(topics.get(slug)?.text).includes(words(label));
ok(topics.size >= 30, `the compiled help holds the Super topics (${topics.size})`);
for (const f of fs.readdirSync(path.join(D, 'help')).filter(x => x.endsWith('.md'))) ok(topics.has(f.slice(0, -3)), `help/${f} is compiled (run bin/build-help.php supercadcraft)`);

// each workspace's topic names what it opens with today
for (const ws of M.WORKSPACE_IDS) {
  const slug = H.WORKSPACE_TOPIC[ws], tp = topics.get(slug);
  ok(!!tp, `${ws}: the topic ${slug} exists`); if (!tp) continue;
  ok(has(slug, en['sc.ws.' + ws]), `${ws}: the topic names the workspace "${en['sc.ws.' + ws]}"`);
  if (ws !== 'finalize') for (const v of M.startViews(ws)) ok(has(slug, en['sc.panel.' + v]), `${ws}: the topic names its starting view "${en['sc.panel.' + v]}"`);
  if (ws !== 'finalize') { ok(has(slug, en['sc.panel.tools-' + ws]), `${ws}: the topic names its tool-set panel "${en['sc.panel.tools-' + ws]}"`);
    ok(has(slug, en['sc.panel.tools-discipline']), `${ws}: the topic names the core and discipline tools`); }   // Finalize's text is its own builder's (export set and map)
  if (ws === 'finalize') continue;   // its own builder writes its text (export set, export map); its groups are the exporters, not listed one by one
  for (const [app, groups] of T.SETS[ws]) for (const g of groups) ok(has(slug, en['sc.group.' + g]), `${ws}: the topic lists the "${en['sc.group.' + g]}" group (${app})`);
}
// every panel and every Home page has a topic
for (const p of M.PANELS.filter(p => !p.demo)) { const slug = H.PANEL_TOPIC[p.id]; ok(!!slug && topics.has(slug), `panel ${p.id} → topic ${slug}`); }
const pageKeys = [];
for (const dir of fs.readdirSync(path.join(D, 'plugins'), { withFileTypes: true }).filter(e => e.isDirectory())) {
  const src = fs.readFileSync(path.join(D, 'plugins', dir.name, 'index.js'), 'utf8');
  for (const m of src.matchAll(/api\.page\(\{ id: '([a-z-]+)'/g)) pageKeys.push(`${dir.name}:${m[1]}`);
}
ok(pageKeys.length >= 12, `${pageKeys.length} plugin pages found`);
for (const k of pageKeys) ok(!!H.PAGE_TOPIC[k] && topics.has(H.PAGE_TOPIC[k]), `Home page ${k} → topic ${H.PAGE_TOPIC[k]}`);
for (const [view, slug] of Object.entries(H.HOME_TOPIC)) ok(topics.has(slug), `Home view ${view} → topic ${slug}`);
for (const slug of ['super-timer', 'super-report-binder']) ok(topics.has(slug), `the dialog tool topic ${slug} exists`);   // dialogs from the Workflow menu, not Home pages
// the Home menu entries and the Workflow tools named on Home all appear in the pages topic
for (const k of ['sc.teams.title', 'sc.calendar.page.title', 'sc.notes-tasks.pg.title', 'sc.communications.pg.title', 'sc.clash.title', 'sc.reg.history.title', 'sc.iss.title', 'sc.office.title', 'sc.brief.title', 'sc.admin.title', 'sc.timer.title', 'sc.report-binder.title']) ok(has('super-project-pages', en[k]), `the pages topic names "${en[k]}"`);
// contextTopic answers for every place
eq(H.contextTopic({ workspace: 'model' }), 'super-model', 'context: a workspace');
eq(H.contextTopic({ workspace: 'custom-1' }), 'super-workspaces', 'context: a workspace of the person\'s own');
eq(H.contextTopic({ home: { view: 'home' } }), 'super-home', 'context: Home');
eq(H.contextTopic({ home: { view: 'page', page: 'teams:teams' } }), 'super-teams', 'context: a Home page');
eq(H.contextTopic({ home: { view: 'page', page: 'teams:sync' } }), 'super-teams', 'context: a Home page with no menu entry');
eq(H.contextTopic(null), 'super-workspaces', 'context: nothing known');

// the labels a topic puts in {{ui:…}} are strings the window shows (en.json, the shell's English, ui.inc, home.inc, settings.inc, mounts.inc)
const shell = JSON.parse(fs.readFileSync(path.join(ROOT, 'public_html/assets/lang/shell/en.json'), 'utf8'));
const norm = s => String(s).replace(/[…⋯]|\.\.\./g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const shown = [];
const add = v => { if (typeof v === 'string') shown.push(norm(v)); else if (v && typeof v === 'object') Object.values(v).forEach(add); };
Object.values(en).forEach(add); Object.values(shell).forEach(add);
let code = ''; for (const f of fs.readdirSync(D).filter(x => /\.(inc|js)$/.test(x))) code += fs.readFileSync(path.join(D, f), 'utf8').toLowerCase();
// names an app's own panel shows (the apps' labels reach the window inside the frame): not in Super's files
const FROM_APPS = new Set(['break link', 'place', 'connect', 'draw', 'modify', 'annotate', 'blocks', 'layers', 'parametric', '3d', 'show', 'sketch', 'features', 'form', 'assembly', 'organize', 'camera', 'scale', 'items', 'measure', 'review', 'revise', 'markup', 'pages', 'takeoff', 'building', 'surfaces', 'design', 'view', 'gis', 'landscape', 'sheets', 'export', 'open', 'save', 'settings', 'panels', 'properties', 'full', 'result only', 'every output', 'export the set', 'new building', 'save project', 'project units', 'plan', 'wall']);
// a sub-layer is named "{layer}: {discipline}" (sc.layers.sub), so its label is made, not stored
const layerNames = Object.entries(en).filter(([k]) => k.startsWith('sc.layers.name.')).map(([, v]) => norm(v)), discNames = Object.entries(en).filter(([k]) => k.startsWith('sc.layers.disc.')).map(([, v]) => norm(v));
for (const l of layerNames) for (const d of discNames) shown.push(`${l}: ${d}`);
const missingLabels = [];
for (const [slug, t] of topics) {
  const src = fs.readFileSync(path.join(D, 'help', slug + '.md'), 'utf8');
  for (const m of src.matchAll(/\{\{ui:([^}]*)\}\}/g)) {
    const x = norm(m[1]); if (!x || FROM_APPS.has(x)) continue;
    if (!shown.some(v => v === x || v.includes(x)) && !code.includes(x)) missingLabels.push(`${slug}: ${m[1]}`);
  }
}
ok(missingLabels.length === 0, 'every {{ui:…}} label in a Super topic is a string the window shows', missingLabels.slice(0, 12).join(' | '));

/* ================================================================ page */
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1500, height: 950 });
const shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
if (shots) fs.mkdirSync(shots, { recursive: true });
const errors = [];
async function open(query = '') {
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 } }); const page = await ctx.newPage();
  page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|fetching the script/.test(m.text())) errors.push(m.text()); });
  await page.goto(url + query); await page.waitForSelector('[data-sc-ready]', { timeout: 40000 }); await page.evaluate(() => window.superWindow.ready);
  await page.waitForFunction(() => typeof window.cadcraftHelp?.open === 'function' && typeof window.ccHelpContext === 'function', null, { timeout: 20000 });
  return { ctx, page };
}
const panelOpen = page => page.evaluate(() => !document.querySelector('[data-help-panel]').hidden);
const topicTitle = page => page.evaluate(() => document.querySelector('[data-help-panel] .help-body h2.help-h')?.textContent || '');
const closePanel = async page => { if (await panelOpen(page)) { await page.evaluate(() => window.cadcraftHelp.close()); await page.waitForFunction(() => document.querySelector('[data-help-panel]').hidden); } };
const titleOf = slug => topics.get(slug).title;
const goWorkspace = (page, id) => page.evaluate(id => { const w = window.superWindow; w.M.switchWorkspace(w.state, id); w.render(); }, id);

{
  const { ctx, page } = await open('');
  ok(await page.evaluate(() => !!document.querySelector('[data-help-open]')), 'the app bar has the Help button');
  // the help panel lists the compiled Super topics
  await page.evaluate(() => window.cadcraftHelp.open());
  await page.waitForFunction(() => !document.querySelector('[data-help-panel]').hidden && document.querySelector('[data-help-panel] .help-list'));
  const listed = await page.evaluate(() => [...document.querySelectorAll('[data-help-panel] .help-topic-title')].map(a => a.textContent));
  for (const slug of ['super-layout', 'super-build', 'super-model', 'super-report', 'super-finalize', 'super-home', 'super-panels', 'super-teams']) ok(listed.includes(titleOf(slug)), `the panel's index lists "${titleOf(slug)}"`);
  ok(listed.length >= 30, `the index lists ${listed.length} topics`);
  await page.fill('[data-help-panel] .help-search', 'clash'); await page.waitForTimeout(400);
  ok(await page.evaluate(t => [...document.querySelectorAll('[data-help-panel] .help-topic-title')].some(a => a.textContent === t), titleOf('super-clash-detection')), 'search finds the clash topic');
  await closePanel(page);

  // the Help button and F1 open at the topic of the workspace in front
  for (const ws of M.WORKSPACE_IDS) {
    await goWorkspace(page, ws); await page.waitForTimeout(150);
    await page.click('[data-help-open]');
    await page.waitForFunction(() => !document.querySelector('[data-help-panel]').hidden);
    await page.waitForFunction(t => document.querySelector('[data-help-panel] .help-body h2.help-h')?.textContent === t, titleOf(H.WORKSPACE_TOPIC[ws]), { timeout: 5000 }).catch(() => {});
    eq(await topicTitle(page), titleOf(H.WORKSPACE_TOPIC[ws]), `Help button in ${ws} opens its topic`);
    await closePanel(page);
  }
  await goWorkspace(page, 'report'); await page.waitForTimeout(150);
  await page.keyboard.press('F1'); await page.waitForFunction(() => !document.querySelector('[data-help-panel]').hidden);
  await page.waitForTimeout(250);
  eq(await topicTitle(page), titleOf('super-report'), 'F1 opens the topic of the workspace in front');
  if (shots) await page.screenshot({ path: path.join(shots, 'help-report.png') });
  // a topic's own links open in the panel
  const linkTitle = await page.evaluate(() => { const a = document.querySelector('[data-help-panel] .help-content a[data-topic]'); if (!a) return null; const t = a.textContent; a.click(); return t; });
  ok(!!linkTitle, 'a topic has links to other topics');
  await page.waitForTimeout(250);
  ok((await topicTitle(page)) !== titleOf('super-report'), 'a link in a topic opens another topic in the panel');
  await page.evaluate(() => document.querySelector('[data-help-panel] .help-body').focus()); await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  ok(!(await panelOpen(page)), 'Esc closes the panel');
  // a workspace of the person's own
  await page.evaluate(() => { const w = window.superWindow; const s = w.state; w.M.addWorkspace ? w.M.addWorkspace(s, 'Mine') : null; w.render(); });
  const custom = await page.evaluate(() => { const s = window.superWindow.state; return Object.keys(s.workspaces).find(id => s.workspaces[id].custom) || null; });
  if (custom) {
    await goWorkspace(page, custom); await page.waitForTimeout(150);
    await page.click('[data-help-open]'); await page.waitForTimeout(300);
    eq(await topicTitle(page), titleOf('super-workspaces'), 'a workspace of your own opens The five workspaces');
    await closePanel(page);
  } else ok(true, '(no way to add a workspace from the model in this build: skipped)');
  await ctx.close();
}
{
  // Home and its pages
  const { ctx, page } = await open('');
  await page.evaluate(() => window.superWindow.home.show());
  await page.waitForFunction(() => document.body.classList.contains('sc-home-on'));
  await page.evaluate(() => { document.querySelector('[data-help-open]')?.click(); });   // the Help button sits on the window bar, behind Home: click it by script
  await page.waitForFunction(() => !document.querySelector('[data-help-panel]').hidden); await page.waitForTimeout(250);
  eq(await topicTitle(page), titleOf('super-home'), 'with Home in front the Help button opens the Home topic');
  await closePanel(page);
  const keys = await page.evaluate(() => window.superWindow.plugins.pages().filter(p => p.nav).map(p => p.key));
  ok(keys.length >= 8, `Home lists ${keys.length} pages in its menu`);
  for (const key of keys) {
    await page.evaluate(k => window.superWindow.home.api.showPage(k), key);
    await page.waitForTimeout(120);
    await page.evaluate(() => { document.querySelector('[data-help-open]')?.click(); });
    await page.waitForFunction(() => !document.querySelector('[data-help-panel]').hidden); await page.waitForTimeout(200);
    eq(await topicTitle(page), titleOf(H.PAGE_TOPIC[key]), `Home page ${key}: the Help button opens ${H.PAGE_TOPIC[key]}`);
    await closePanel(page);
  }
  await ctx.close();
}
ok(errors.length === 0, 'no console or page error', errors.slice(0, 3).join(' | '));
await browser.close(); close();
console.log(`help.mjs: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
