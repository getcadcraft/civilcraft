// SPDX-License-Identifier: Apache-2.0
// Super 0.1 round 4, package `window` (docs/0.9-sessions/bk-r4-window-10.md), the real lab page in headless Chromium, in the standard layout, the ribbon layout
// (?workspace=docked) and the tool rows layout (?workspace=duncan):
//   BK.3  a new project is in the building plan with the wall tool running; a saved (v4) arrangement is kept
//   BK.77 only Build on the bar; a workspace joins when the project has a file for it, or through More tools
//   BK.30 the core tools (30, the same for every discipline) and the discipline's set; the discipline is the project's (setDiscipline for the Quick Kit pick)
//   BK.32 the tool rows layout in Super: two rows, each group's ▾, pin / take out / move / reset, kept per workspace
//   BK.38 the pages along the bottom
//   node tools/super-test/window-front.mjs [--shots <dir>]
import { start, launch } from './serve.mjs';
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1600, height: 950 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
const shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
const errors = [];
async function open(query = '', { before = null, width = 1600 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 950 } });
  if (before) await ctx.addInitScript(before);
  const page = await ctx.newPage();
  page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(query + ' ' + String(e.message)); });
  await page.goto(url + query); await page.waitForSelector('[data-sc-ready]', { timeout: 40000 }); await page.evaluate(() => window.superWindow.ready);
  await page.waitForFunction(() => { const c = document.querySelector('[data-boot]'); return !c || c.hidden; }, null, { timeout: 40000 }).catch(() => {});
  await page.waitForFunction(() => document.querySelector('[data-panel="bim"]')?.dataset.mount === 'ready', null, { timeout: 40000 }).catch(() => {});
  return { ctx, page };
}
const S = page => page.evaluate(() => { const w = window.superWindow; return { v: w.state.v, active: w.state.active, shown: w.state.shown }; });
const msg = page => page.evaluate(() => document.querySelector('.sc-msg')?.textContent || '');
const wsTabs = page => page.evaluate(() => [...document.querySelectorAll('.sc-wstab')].filter(b => b.getClientRects().length).map(b => b.textContent));
const frontView = page => page.evaluate(() => document.querySelector('.sc-body.is-active-view')?.dataset.panel || null);

/* ================================================================ the standard layout */
{
  const { ctx, page } = await open('');
  eq(await S(page), { v: 5, active: 'build', shown: ['build'] }, 'BK.3/77 a first start: Build, the only workspace on the bar');
  eq(await wsTabs(page), ['Build'], 'the bar shows one workspace tab');
  eq(await frontView(page), 'bim', 'the building is the view in front');
  eq(await page.evaluate(() => [...document.querySelectorAll('.sc-zone.sc-center [data-panel-tab]')].map(b => b.dataset.panelTab)), ['bim', 'cad'], 'main area: Building, then 2D drawing (no steel, site, parts, takeoff or markup up front)');
  ok(await page.evaluate(() => { const b = document.querySelector('[data-act="more-tools"]'); return !!b && b.textContent.trim() === 'More tools' && b.getClientRects().length > 0 && b.querySelector('.scd-more-label').getClientRects().length > 0; }), 'More tools is on the bar, by name');

  // ---- BK.30: the core and discipline tools
  const tools = () => page.evaluate(() => { const box = document.querySelector('[data-scd-tools]'); const keys = sec => [...box.querySelectorAll(`[data-scd-sec="${sec}"] [data-scd-tool]`)].map(b => b.dataset.scdTool);
    return { disc: box.dataset.scdDiscipline, pick: box.querySelector('[data-scd-pick]').value, options: [...box.querySelectorAll('[data-scd-pick] option')].map(o => o.textContent), core: keys('core'), own: keys('own'),
      counts: [...box.querySelectorAll('[data-scd-count]')].map(c => c.textContent), status: box.querySelector('[data-scd-status]').dataset.scdStatus, note: box.querySelector('[data-scd-status]').textContent,
      groups: [...box.querySelectorAll('[data-scd-sec="core"] [data-scd-group]')].map(g => g.getAttribute('aria-label')), visible: box.getClientRects().length > 0 }; });
  const a = await tools();
  ok(a.visible, 'the Core and discipline tools panel is on screen, on the left');
  eq(a.options, ['Architecture', 'Interior design', 'Structure', 'Building services', 'Fire', 'Landscape', 'Quantities and cost'], 'seven disciplines to choose from');
  eq([a.disc, a.pick, a.status], ['architecture', 'architecture', 'detailed'], 'a new project is architecture');
  eq([a.core.length, a.own.length, a.counts], [30, 15, ['30', '15']], 'thirty core tools and fifteen of architecture, and the panel says so');
  eq(a.groups, ['Select', 'Draw', 'Modify', 'Measure', 'Guides', 'Walls', 'Openings', 'Dimensions', 'Text', 'Tags', 'Grids', 'Levels'], 'the core groups, in the row\'s order');
  ok(await page.evaluate(() => new Promise(res => { document.querySelector('[data-supercadcraft]').addEventListener('super:discipline', e => res(e.detail.discipline === 'structure'), { once: true });
    const s = document.querySelector('[data-scd-pick]'); s.value = 'structure'; s.dispatchEvent(new Event('change', { bubbles: true })); setTimeout(() => res(false), 3000); })), 'choosing Structure tells the page (super:discipline)');
  const b = await tools();
  eq(b.core, a.core, 'switching discipline: the core tools are the same, in the same order');
  ok(b.own.length === 15 && b.own.join() !== a.own.join() && b.own.includes('detailcraft:place.beam'), 'only the discipline\'s set changed (structure: 15, with Beam)');
  ok(b.status === 'starting' && /starting set/.test(b.note) && /practitioner/.test(b.note), 'a set no practitioner has reviewed says so: ' + b.note);
  ok(/Structure/.test(await msg(page)), 'the status line names the discipline: ' + await msg(page));
  eq(await page.evaluate(() => [...document.querySelectorAll('.sc-zone.sc-center [data-panel-tab]')].map(x => x.dataset.panelTab)), ['bim', 'cad', 'detail'], 'BK.77 the person asked for structure: Steel and rebar joins Build');
  eq(await page.evaluate(() => window.superWindow.discipline()), { discipline: 'structure', kit: '', set: true }, 'the project says structure');
  ok(await page.evaluate(() => { const w = window.superWindow, f = w.P.extGet(w.project, 'disciplines', 'rows/proj_discipline.json'); return !!f && JSON.parse(new TextDecoder().decode(f)).rows.project.discipline === 'structure'; }), 'it is a row of the project file (table proj_discipline)');
  // the Quick Kit pick (package office) calls this
  eq(await page.evaluate(() => { const w = window.superWindow; const r = w.setDiscipline('interior', { kit: 'interior' }); return [r.ok, r.discipline, r.saved, w.discipline()]; }), [true, 'interior', true, { discipline: 'interior', kit: 'interior', set: true }], 'setDiscipline(id, { kit }) sets it and keeps the kit');
  eq(await page.evaluate(() => window.superWindow.setDiscipline('plumbing').ok), false, 'an unknown discipline is refused');
  eq((await tools()).disc, 'interior', 'the panel follows');
  // a core tool with another view in front: the tool brings its view forward
  await page.click('[data-panel-tab="cad"]'); await page.waitForFunction(() => document.querySelector('.sc-body.is-active-view')?.dataset.panel === 'cad', null, { timeout: 20000 });
  ok(await page.evaluate(() => [...document.querySelectorAll('[data-scd-tool]')].every(x => x.getAttribute('aria-disabled') !== 'true')), 'with the 2D drawing in front no core tool is greyed out');
  await page.click('[data-scd-tool="bimcraft:view.dims"]');
  await page.waitForFunction(() => document.querySelector('.sc-body.is-active-view')?.dataset.panel === 'bim', null, { timeout: 5000 }).catch(() => {});
  eq(await frontView(page), 'bim', 'a core tool brings the building back to the front');
  // BK.3: a plan tool with no building yet: the app's own New building dialog comes first, left to the person
  ok(await page.waitForSelector('dialog.bc-new[open]', { timeout: 6000 }).then(() => true).catch(() => false), 'a plan tool with no building yet opens the building\'s own New building dialog');
  ok(/Start the building first/.test(await msg(page)), 'and the status line says what to do: ' + await msg(page));
  await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('dialog.bc-new'), null, { timeout: 4000 }).catch(() => {});
  ok(await page.evaluate(() => !document.querySelector('dialog.bc-new') && document.querySelector('[data-model-toggle]')?.getAttribute('aria-pressed') !== 'true'), 'Cancel leaves everything as it was (nothing is made behind the person\'s back)');
  await page.waitForTimeout(900);

  // ---- BK.77: the project uses an app
  await page.evaluate(() => { const w = window.superWindow; w.P.addMember(w.project, { app: 'civilcraft', name: 'site.ccsite', bytes: new Uint8Array([1, 2, 3]), role: 'opened', source: 'test' }); });
  await page.waitForFunction(() => window.superWindow.state.shown.includes('layout'), null, { timeout: 3000 }).catch(() => {});
  eq(await S(page), { v: 5, active: 'build', shown: ['layout', 'build'] }, 'a site file in the project: Layout and landscape joins the bar, nothing is switched');
  ok(/Layout and landscape is on the bar now/.test(await msg(page)), 'and the status line says why: ' + await msg(page));
  await page.evaluate(() => { const w = window.superWindow; w.P.addMember(w.project, { app: 'takeoffcraft', name: 'house.takeoff', bytes: new Uint8Array([1]), role: 'opened', source: 'test' }); });
  eq((await S(page)).shown, ['layout', 'build', 'report'], 'a takeoff: Report and price joins');
  eq(await wsTabs(page), ['Layout and landscape', 'Build', 'Report and price'], 'the tabs follow');

  // ---- More tools
  await page.click('[data-act="more-tools"]');
  const menu = await page.evaluate(() => { const m = document.querySelector('[data-scd-menu]'); return m && { role: m.getAttribute('role'), ws: [...m.querySelectorAll('[data-scd-ws]')].map(x => x.dataset.scdWs), views: [...m.querySelectorAll('[data-scd-view]')].map(x => x.dataset.scdView),
    all: !!m.querySelector('[data-scd-all]'), expanded: document.querySelector('[data-act="more-tools"]').getAttribute('aria-expanded'), hint: m.querySelector('[data-scd-ws="model"] small').textContent, focus: document.activeElement.getAttribute('role') }; });
  ok(menu && menu.role === 'menu' && menu.expanded === 'true' && menu.focus === 'menuitem', 'More tools opens a menu, the focus on its first item');
  eq(menu.ws, ['model', 'finalize'], 'it offers the workspaces that are not on the bar');
  eq(menu.views, ['civil', 'model', 'part', 'markup', 'takeoff'], 'and the views that are not in this workspace (site, 3D model, parts, markup, takeoff)');
  eq(menu.hint, '3D modelling and parts', 'each with what it is for');
  await page.keyboard.press('Escape');
  ok(await page.$('[data-scd-menu]') === null && await page.evaluate(() => document.activeElement.dataset.act === 'more-tools'), 'Esc closes it, the focus back on the button');
  await page.click('[data-act="more-tools"]'); await page.click('[data-scd-ws="model"]');
  eq(await S(page), { v: 5, active: 'model', shown: ['layout', 'build', 'model', 'report'] }, 'choosing Model puts it on the bar and opens it');
  await page.click('.sc-wstab[data-ws="build"]');
  await page.click('[data-act="more-tools"]'); await page.click('[data-scd-view="part"]');
  ok(await page.evaluate(() => window.superWindow.M.visible(window.superWindow.state).includes('part')), 'choosing a view (Parts) opens it in this workspace');
  await page.click('[data-panel-tab="bim"]');
  await page.click('[data-act="more-tools"]'); await page.click('[data-scd-all]');
  eq(await wsTabs(page), ['Layout and landscape', 'Build', 'Model', 'Report and price', 'Finalize and export'], 'Show every workspace: all five');
  await page.click('[data-act="more-tools"]');
  ok(await page.evaluate(() => !document.querySelector('[data-scd-ws]') && !document.querySelector('[data-scd-all]')), 'nothing left to offer under Workspaces');
  await page.mouse.click(900, 600); ok(await page.$('[data-scd-menu]') === null, 'a click elsewhere closes the menu');
  // every tool stays reachable: Find lists a tool of a workspace that is not up front
  ok(await page.evaluate(() => window.superWindow.T.search(window.superWindow.catalog.tools, 'beam').some(x => x.app === 'detailcraft')), 'rule S3: a tool that is not up front is still found by Find');

  // ---- BK.3: a new project
  await page.evaluate(() => { const w = window.superWindow, s = JSON.parse(JSON.stringify(w.state)); s.active = 'report'; w.state = s; });
  await page.evaluate(() => window.superWindow.newProject('Corner shop'));
  await page.waitForFunction(() => document.querySelector('[data-mtool="wall"]')?.getAttribute('aria-pressed') === 'true', null, { timeout: 30000 }).catch(() => {});
  const np = await page.evaluate(() => ({ active: window.superWindow.state.active, front: document.querySelector('.sc-body.is-active-view')?.dataset.panel, draw: document.querySelector('[data-model-toggle]')?.getAttribute('aria-pressed'),
    wall: document.querySelector('[data-mtool="wall"]')?.getAttribute('aria-pressed'), wallShown: document.querySelector('[data-mtool="wall"]')?.getClientRects().length > 0, plan: !!window.bimcraftPlan?.state?.on, tool: window.bimcraftPlan?.state?.tool,
    dialog: !!document.querySelector('dialog.bc-new[open]'), shown: window.superWindow.state.shown.length }));
  eq([np.active, np.front], ['build', 'bim'], 'a new project: Build, the building in front (it was in Report and price)');
  eq([np.draw, np.plan, np.dialog], ['true', true, false], 'the plan is up and drawing, no dialog left open');
  eq([np.wall, np.wallShown, np.tool], ['true', true, 'wall'], 'the wall tool is running');
  eq(np.shown, 5, 'the person\'s bar is kept');
  ok(/Corner shop/.test(await page.evaluate(() => document.querySelector('[data-panel="bim"]').textContent)), 'the building carries the project\'s name');
  if (shots) await page.screenshot({ path: shots + '/window-standard.png' });

  // ---- BK.38: the pages along the bottom
  const strip = () => page.evaluate(() => { const n = document.querySelector('[data-scpage-strip]'); return { tabs: [...n.querySelectorAll('[data-scpage]')].map(x => [x.dataset.scpage, x.textContent.trim(), x.getAttribute('aria-selected')]), role: n.querySelector('.scpage-tabs').getAttribute('role'),
    overflow: getComputedStyle(n.querySelector('.scpage-tabs')).overflowX, below: n.getBoundingClientRect().top > document.querySelector('.sc-work').getBoundingClientRect().bottom - 2, aboveStatus: !document.querySelector('.sc-root > .sc-status') || n.getBoundingClientRect().bottom <= document.querySelector('.sc-root > .sc-status').getBoundingClientRect().top + 2 }; });
  let st = await strip();
  eq(st.tabs, [['model', 'Model', 'true'], ['sheets', 'Sheets', 'false'], ['schedules', 'Schedules', 'false'], ['takeoff', 'Takeoff', 'false'], ['markup', 'Markup', 'false']], 'Model, Sheets, Schedules, Takeoff, Markup; Model is open');
  ok(st.role === 'tablist' && st.overflow === 'auto' && st.below && st.aboveStatus, 'a tab strip along the bottom, under the views, that scrolls sideways when it does not fit');
  await page.click('[data-scpage="takeoff"]');
  await page.waitForFunction(() => document.querySelector('[data-panel="takeoff"]')?.dataset.mount === 'ready', null, { timeout: 40000 }).catch(() => {});
  eq([await frontView(page), (await strip()).tabs.filter(x => x[2] === 'true').map(x => x[0])], ['takeoff', ['takeoff']], 'Takeoff: the quantities engine in the main area, its page marked');
  ok(await page.evaluate(() => !!document.querySelector('.sc-zone.sc-center [data-panel="takeoff"]')), 'it is the mounted app\'s own panel');
  await page.click('[data-scpage="markup"]');
  await page.waitForFunction(() => document.querySelector('[data-panel="markup"]')?.dataset.mount === 'ready', null, { timeout: 40000 }).catch(() => {});
  eq([await frontView(page), (await strip()).tabs.filter(x => x[2] === 'true').map(x => x[0])], ['markup', ['markup']], 'Markup: the sheets and markup engine');
  await page.click('[data-scpage="schedules"]'); await page.waitForTimeout(400);
  eq([await frontView(page), (await strip()).tabs.filter(x => x[2] === 'true').map(x => x[0])], ['bim', ['schedules']], 'Schedules: the building, its page marked');
  const sch = await page.evaluate(() => ({ sec: !!document.querySelector('[data-msched-sec]'), hidden: document.querySelector('[data-msched-sec]')?.hidden, focus: !!document.activeElement?.closest?.('[data-msched-sec]') }));
  ok(sch.sec && (sch.hidden ? /Schedules fill in/.test(await msg(page)) : sch.focus), 'Schedules goes to the building\'s own schedules (or says they fill in once something is drawn): ' + JSON.stringify(sch) + ' ' + await msg(page));
  await page.click('[data-scpage="model"]'); await page.waitForTimeout(300);
  eq([await frontView(page), (await strip()).tabs.filter(x => x[2] === 'true').map(x => x[0])], ['bim', ['model']], 'Model: back to the plan');
  await page.waitForTimeout(200); await page.focus('[data-scpage="model"]'); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(150);   // the shell's strip keys attach on the next frame and move the focus on a timer
  eq(await page.evaluate(() => document.activeElement.dataset.scpage), 'markup', 'arrow keys move along the strip and wrap (the shell\'s tab strip keys)');
  await page.click('[data-scpage="sheets"]'); await page.waitForTimeout(800);
  eq((await strip()).tabs.filter(x => x[2] === 'true').map(x => x[0]), ['sheets'], 'Sheets: its page marked');
  ok(/Sheets/.test(await msg(page)), 'the building\'s own Sheets command ran: ' + await msg(page));
  await page.keyboard.press('Escape');
  eq(await page.evaluate(() => window.superWindow.openPage('nope')), false, 'openPage refuses a page that does not exist');
  await page.setViewportSize({ width: 900, height: 950 }); await page.waitForTimeout(300);
  ok(await page.evaluate(() => { const n = document.querySelector('.scpage-tabs'); return !n || !n.getClientRects().length || n.scrollWidth <= n.clientWidth || getComputedStyle(n).overflowX === 'auto'; }), 'in a narrow window the strip fits or scrolls');
  await ctx.close();
}

/* ================================================================ a saved (v4) arrangement is kept */
{
  const v4 = { v: 4, active: 'layout', shown: ['layout', 'build', 'model', 'report', 'finalize'], seq: 2, floats: [{ id: 'w1', tabs: ['surfaces'], active: 'surfaces', x: 320, y: 210, w: 480, h: 360 }],
    workspaces: Object.fromEntries([['layout', ['civil', 'cad', 'bim', 'model']], ['build', ['cad', 'bim', 'detail']], ['model', ['model', 'part']], ['report', ['markup', 'takeoff']], ['finalize', ['markup', 'cad']]].map(([id, c]) =>
      [id, { sizes: { left: id === 'build' ? 333 : 280, right: 300, bottom: 230 }, docks: { left: [{ tabs: ['tools-' + id], active: 'tools-' + id }], center: [{ tabs: c, active: c[0] }], right: [{ tabs: ['props'], active: 'props' }], bottom: [] } }])) };
  v4.workspaces['mine-1'] = { custom: true, name: 'Site visits', sizes: { left: 280, right: 300, bottom: 230 }, docks: { left: [], center: [{ tabs: ['bim'], active: 'bim' }], right: [], bottom: [] } };
  v4.shown.push('mine-1');
  const { ctx, page } = await open('', { before: `try { if (!localStorage.getItem('cc-super-window')) localStorage.setItem('cc-super-window', ${JSON.stringify(JSON.stringify(v4))}); } catch (e) {}` });
  const k = await page.evaluate(() => { const s = window.superWindow.state; return { v: s.v, active: s.active, shown: s.shown, mine: s.workspaces['mine-1']?.name, float: s.floats.map(f => [f.tabs, f.x, f.y, f.w, f.h]), left: s.workspaces.build.sizes.left,
    build: s.workspaces.build.docks.center[0].tabs, tools: s.workspaces.build.docks.left[0].tabs, floatOn: !!document.querySelector('.sc-float [data-panel="surfaces"]'), tabs: [...document.querySelectorAll('.sc-wstab')].map(b => b.textContent) }; });
  eq([k.v, k.mine, k.float, k.left, k.build], [5, 'Site visits', [[['surfaces'], 320, 210, 480, 360]], 333, ['cad', 'bim', 'detail']], 'a v4 arrangement is read as v5 with the person\'s own workspace, torn-off window, sizes and views kept');
  ok(k.floatOn, 'the torn-off window is on screen');
  eq(k.shown, ['layout', 'build', 'model', 'report', 'finalize', 'mine-1'], 'a bar the person had added to is left as it was');
  eq(k.tools, ['tools-discipline', 'tools-build'], 'the core and discipline tools joined the left');
  await ctx.close();
}

/* ================================================================ the ribbon layout (?workspace=docked) */
{
  const { ctx, page } = await open('?workspace=docked');
  await page.waitForSelector('body.ws-on .ws-ribbon .ws-tool', { timeout: 20000 });
  const tabs = () => page.evaluate(() => [...document.querySelectorAll('[data-ws-tab]')].map(b => b.textContent));
  eq(await tabs(), ['Core and Architecture', 'Build'], 'docked: the ribbon has the core and discipline tab and one workspace tab (Build)');
  await page.click('[data-ws-tab^="disc-"]'); await page.waitForTimeout(200);
  const rb = await page.evaluate(() => ({ groups: [...document.querySelectorAll('.ws-ribbon .ws-group')].map(g => g.getAttribute('aria-label')), n: document.querySelectorAll('.ws-ribbon [data-ws-command]').length, wall: !!document.querySelector('.ws-ribbon [data-ws-command="bimcraft:model.wall"]') }));
  eq(rb.groups.slice(0, 12), ['Select', 'Draw', 'Modify', 'Measure', 'Guides', 'Walls', 'Openings', 'Dimensions', 'Text', 'Tags', 'Grids', 'Levels'], 'its groups start with the core, in the same order as the panel');
  eq([rb.n, rb.wall], [45, true], '45 tools in it (30 + 15), Wall among them');
  ok(await page.evaluate(() => !document.querySelector('.sc-zone [data-scd-tools]')), 'the docks do not show the tools a second time while the ribbon has them');
  await page.evaluate(() => window.superWindow.setDiscipline('fire')); await page.waitForTimeout(400);
  eq(await tabs(), ['Core and Fire', 'Build', 'Report and price'], 'the tab follows the discipline (fire has one tool of the sheets, so Report and price joins)');
  await page.click('[data-ws-tab^="disc-"]'); await page.waitForTimeout(200);
  eq(await page.evaluate(() => [...document.querySelectorAll('.ws-ribbon .ws-group')].map(g => g.getAttribute('aria-label')).slice(12)), ['Compartments', 'Escape routes', 'Devices', 'Check'], 'and its last groups are the discipline\'s');
  await page.evaluate(() => { const w = window.superWindow; w.P.addMember(w.project, { app: 'partcraft', name: 'bracket.ccpart', bytes: new Uint8Array([1]), role: 'opened', source: 'test' }); });
  await page.waitForTimeout(500);
  eq(await tabs(), ['Core and Fire', 'Build', 'Model', 'Report and price'], 'a part in the project: Model joins the ribbon\'s tabs');
  ok(await page.evaluate(() => !!document.querySelector('[data-scpage-strip]')?.getClientRects().length && !!document.querySelector('[data-act="more-tools"]')?.getClientRects().length), 'the page strip and More tools are there in this layout too');
  await page.click('[data-scpage="takeoff"]');
  await page.waitForFunction(() => document.querySelector('.sc-body.is-active-view')?.dataset.panel === 'takeoff', null, { timeout: 20000 }).catch(() => {});
  eq(await frontView(page), 'takeoff', 'a page opens in this layout');
  await page.evaluate(() => window.superWindow.newProject('Docked house'));
  await page.waitForFunction(() => document.querySelector('[data-mtool="wall"]')?.getAttribute('aria-pressed') === 'true', null, { timeout: 30000 }).catch(() => {});
  eq(await page.evaluate(() => [window.superWindow.state.active, document.querySelector('.sc-body.is-active-view')?.dataset.panel, window.bimcraftPlan?.state?.tool]), ['build', 'bim', 'wall'], 'a new project: the plan with the wall tool running');
  if (shots) await page.screenshot({ path: shots + '/window-docked.png' });
  await ctx.close();
}

/* ================================================================ the tool rows layout in Super (?workspace=duncan), BK.32 */
{
  const { ctx, page } = await open('?workspace=duncan');
  await page.waitForSelector('body.ws-on .tr-toolrows [data-ws-command]', { timeout: 20000 });
  ok(await page.evaluate(() => window.ccWorkspaceEngine.layouts().some(l => l.key === 'duncan' && l.ok)), 'Settings › Layout offers the layout in SuperCad Studio');
  eq(await page.evaluate(() => document.querySelector('[data-supercadcraft]').dataset.wsLayout), 'duncan', 'it is on');
  const rows = () => page.evaluate(() => [1, 2].map(r => [...document.querySelectorAll(`[data-tr-row="${r}"] [data-tr-group]`)].map(g => [g.dataset.trGroup, [...g.querySelectorAll(':scope > [data-ws-command]')].map(b => b.dataset.wsCommand.replace('bimcraft:', '')).join(' '), g.querySelectorAll('.tr-more-list [data-ws-command]').length])));
  const r0 = await rows();
  eq(r0[0].map(g => g[0]), ['core-select', 'core-draw', 'core-modify', 'core-measure', 'core-guides'], 'row one: drawing and editing');
  eq(r0[1].map(g => g[0]), ['core-walls', 'core-openings', 'core-dimensions', 'core-text', 'core-tags', 'core-grids', 'core-levels', 'own-building', 'own-rooms', 'own-envelope', 'own-documents'], 'row two: building and documenting, the discipline\'s groups last');
  eq(r0.flat().reduce((n, g) => n + g[1].split(' ').length, 0), 45, 'forty-five tools in the two rows');
  const walls0 = r0[1][0];
  eq(walls0[1], 'model.wall wall.rect wall.split wall.offset', 'Walls: four in the row');
  ok(walls0[2] >= 12, 'its ▾ holds the complete set (' + walls0[2] + ' more wall tools)');
  ok(await page.evaluate(() => [...document.querySelectorAll('.tr-toolrows [data-ws-command]')].every(b => b.getAttribute('draggable') === 'true')), 'every tool of the rows can be dragged');
  ok(await page.evaluate(() => !!document.querySelector('.tr-toolrows > .shell-grip-btn, .tr-toolrows [data-ws-tear], .tr-toolrows button[aria-haspopup]')), 'the rows have their tear-off menu');
  eq(await wsTabs(page), ['Build'], 'the workspace tabs stay on the bar in this layout (no ribbon stands in for them)');
  ok(await page.evaluate(() => !!document.querySelector('.ws-cmdline, [data-ws-cmd], .cc-cmdline, [data-cmdline]') || /Command/.test(document.querySelector('.ws-status, [data-ws-blk="statusbar"]')?.textContent || '')), 'the command line is docked in the status strip');

  // pin from the list, with the menu
  const menuOn = async (sel, act) => { await page.evaluate(s => { const b = document.querySelector(s); b.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 400, clientY: 300 })); }, sel); await page.waitForSelector('[data-tra-menu]'); if (act) await page.click(`[data-tra-menu] [data-tra-act="${act}"]`); await page.waitForTimeout(250); };
  await menuOn('[data-tr-group="core-walls"] .tr-more-list [data-ws-command="bimcraft:wall.polygon"]', null);
  eq(await page.evaluate(() => [...document.querySelectorAll('[data-tra-menu] [data-tra-act]')].map(b => b.dataset.traAct)), ['pin', 'reset', 'resetall'], 'a tool of the list: Pin to the row, Reset this group, Reset the tool rows');
  await page.click('[data-tra-menu] [data-tra-act="pin"]'); await page.waitForTimeout(300);
  eq((await rows())[1][0][1], 'model.wall wall.rect wall.split wall.offset wall.polygon', 'pinned: Wall polygon joins the row');
  ok(/pinned/.test(await msg(page)), 'and the status line says so: ' + await msg(page));
  await menuOn('[data-tr-group="core-walls"] > [data-ws-command="bimcraft:wall.polygon"]', null);
  eq(await page.evaluate(() => [...document.querySelectorAll('[data-tra-menu] [data-tra-act]')].map(b => [b.dataset.traAct, b.disabled])), [['left', false], ['right', true], ['unpin', false], ['reset', false], ['resetall', false]], 'a tool of the row: move left / right, take out, reset');
  await page.click('[data-tra-menu] [data-tra-act="left"]'); await page.waitForTimeout(300);
  eq((await rows())[1][0][1], 'model.wall wall.rect wall.split wall.polygon wall.offset', 'moved one place left');
  await menuOn('[data-tr-group="core-walls"] > [data-ws-command="bimcraft:wall.rect"]', 'unpin');
  const r1 = await rows();
  eq(r1[1][0][1], 'model.wall wall.split wall.polygon wall.offset', 'taken out of the row');
  ok(await page.evaluate(() => !!document.querySelector('[data-tr-group="core-walls"] .tr-more-list [data-ws-command="bimcraft:wall.rect"]')), 'it is in the group\'s list: nothing is removed');
  eq(r1[1][0][2], walls0[2], 'the list is as long as before (one in, one out)');
  // drag: a row tool onto another place of its group; a row tool off the rows
  const dnd = (from, to, pos) => page.evaluate(([f, t2, p]) => { const a = document.querySelector(f), b = t2 ? document.querySelector(t2) : document.querySelector('.sc-work'); const dt = new DataTransfer(); const r = b.getBoundingClientRect();
    const ev = (type, target, x, y) => target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: dt, clientX: x, clientY: y }));
    ev('dragstart', a, 0, 0); ev('dragover', b, r.left + (p === 'after' ? r.width - 2 : 2), r.top + 5); ev('drop', b, r.left + (p === 'after' ? r.width - 2 : 2), r.top + 5); ev('dragend', a, 0, 0); }, [from, to, pos]);
  await dnd('[data-tr-group="core-walls"] > [data-ws-command="bimcraft:wall.offset"]', '[data-tr-group="core-walls"] > [data-ws-command="bimcraft:model.wall"]', 'before'); await page.waitForTimeout(300);
  eq((await rows())[1][0][1], 'wall.offset model.wall wall.split wall.polygon', 'dragged within its group: Offset wall first');
  await dnd('[data-tr-group="core-walls"] > [data-ws-command="bimcraft:wall.split"]', null, 'before'); await page.waitForTimeout(300);
  eq((await rows())[1][0][1], 'wall.offset model.wall wall.polygon', 'dragged off the rows: out of the row');
  await dnd('[data-tr-group="core-walls"] .tr-more-list [data-ws-command="bimcraft:wall.trace"]', '[data-tr-group="core-walls"] > [data-ws-command="bimcraft:wall.polygon"]', 'after'); await page.waitForTimeout(300);
  eq((await rows())[1][0][1], 'wall.offset model.wall wall.polygon wall.trace', 'dragged from the list onto the row: pinned at the end');
  await dnd('[data-tr-group="core-walls"] > [data-ws-command="bimcraft:model.wall"]', '[data-tr-group="core-draw"] > [data-ws-command="bimcraft:draft.line"]', 'before'); await page.waitForTimeout(300);
  eq((await rows())[1][0][1], 'wall.offset model.wall wall.polygon wall.trace', 'a tool does not change group');
  // kept per workspace, in the saved window
  const saved = () => page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cc-super-window')); return Object.fromEntries(Object.entries(s.workspaces).filter(([, w]) => w.rows).map(([id, w]) => [id, w.rows.pin['core-walls'] || null])); });
  eq(await saved(), { build: ['bimcraft:wall.offset', 'bimcraft:model.wall', 'bimcraft:wall.polygon', 'bimcraft:wall.trace'] }, 'the arrangement is saved with the window, under the Build workspace');
  await page.click('[data-act="more-tools"]'); await page.click('[data-scd-ws="report"]'); await page.waitForTimeout(500);
  eq((await rows())[1][0][1], 'model.wall wall.rect wall.split wall.offset', 'another workspace (Report and price) has its own rows: the starting ones');
  await menuOn('[data-tr-group="core-walls"] .tr-more-list [data-ws-command="bimcraft:wall.pick"]', 'pin');
  await page.click('.sc-wstab[data-ws="build"]'); await page.waitForTimeout(500);
  eq((await rows())[1][0][1], 'wall.offset model.wall wall.polygon wall.trace', 'back in Build: its own arrangement');
  eq(Object.keys(await saved()).sort(), ['build', 'report'], 'each workspace keeps its own');
  // a tool of the rows runs (it brings its view forward) and one-click reset
  await page.evaluate(() => window.superWindow.newProject('Rows house'));
  await page.waitForFunction(() => window.bimcraftPlan?.state?.tool === 'wall', null, { timeout: 30000 }).catch(() => {});
  await page.click('[data-tr-group="core-openings"] > [data-ws-command="bimcraft:model.door"]'); await page.waitForTimeout(400);
  eq(await page.evaluate(() => window.bimcraftPlan?.state?.tool), 'door', 'a click on a tool of the rows runs the app\'s own command (Door)');
  await menuOn('[data-tr-group="core-walls"] > [data-ws-command="bimcraft:model.wall"]', 'resetall');
  eq((await rows())[1][0][1], 'model.wall wall.rect wall.split wall.offset', 'Reset the tool rows of this workspace: one click, the starting rows');
  eq(Object.keys(await saved()), ['report'], 'Build keeps nothing; Report and price still has its own');
  // the discipline swaps only its groups
  await page.evaluate(() => window.superWindow.setDiscipline('landscape')); await page.waitForTimeout(500);
  const r2 = await rows();
  eq([r2[0].map(g => g[0]), r2[1].slice(0, 7).map(g => g[0]), r2[1].slice(7).map(g => g[0])], [r0[0].map(g => g[0]), r0[1].slice(0, 7).map(g => g[0]), ['own-planting', 'own-hard', 'own-ground', 'own-sheets']], 'landscape: the core groups stay where they were, only the last groups change');
  eq(r2[0].map(g => g[1]), r0[0].map(g => g[1]), 'the core tools of row one are untouched');
  if (shots) await page.screenshot({ path: shots + '/window-duncan.png' });
  await ctx.close();
}

ok(!errors.length, 'no page errors: ' + errors.slice(0, 4).join(' | '));
console.log(`window-front: ${pass} passed, ${fail} failed`);
await browser.close(); await close(); process.exit(fail ? 1 : 0);
