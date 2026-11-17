#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-siteconstraints.mjs: BK.104 building lines and servitudes in the real page, /lab, headless (session bk-stages-10):
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-siteconstraints.mjs [--shots <dir>]      run as root (a test admin session)
 * A 20 000 x 30 000 mm site, setbacks 5000 / 1500 / 3000 / 1500, so the building line runs from (1500, 5000) to (18500, 27000).
 * A wall is drawn across the front line with the Wall tool: it IS drawn, and a warning naming it appears in Problems; moved back, the warning clears.
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
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimsitecons'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const throttled = new Set();
page.on('response', (r) => { if (r.status() === 429) throttled.add(r.url()); });
await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
await page.reload({ waitUntil: 'networkidle' });
const quiet = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const settled = async () => { await quiet(); await page.waitForTimeout(350); await quiet(); };
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, o) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, o); };
const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;
const rebuilt = () => page.waitForFunction(() => !/Working/.test(document.body.innerText.slice(0, 200000)), null, { timeout: 90000 }).catch(() => {});
const undo = async () => { await page.click('[data-act="undo"]'); await page.waitForTimeout(400); await rebuilt(); await settled(); };
const tool = async (menu, name) => { if (menu && !(await page.evaluate((m) => document.querySelector(`[${m}]`)?.open, menu))) await page.click(`[${menu}] > summary`); await page.click(`[data-mtool="${name}"]`); await settled(); };
const items = () => page.evaluate(() => window.bimcraftSiteConstraints.items().map((d) => ({ guid: d.guid, key: window.bimcraftRes.api.kb() + d.id, kind: d.kind, shape: d.shape, derived: d.derived, closed: d.closed, width: d.width, name: d.name, reference: d.reference, servitude: d.servitude, pts: d.pts, plan: d.plan })));
const siteProblems = () => page.evaluate(() => window.ccProblems.store.list({ source: 'bimcraft.site' }).map((p) => ({ id: p.id, code: p.code, severity: p.severity, text: p.text, about: p.about.map((a) => a.id) })));
const waitProblems = (n) => page.waitForFunction((n) => window.ccProblems.store.list({ source: 'bimcraft.site' }).length === n, n, { timeout: 15000 }).catch(() => {});
const walls = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.map((w) => ({ guid: w.guid, a: w.a, b: w.b, t: w.t })));
/** Frame the whole site clear of the bars over the plan, and check its corners can be clicked (the canvas is what is under them). */
const frame = async () => {
  const seen = await page.evaluate(() => {
    const pv = window.bimcraftPlan.view; pv.fit({ x0: -2500, y0: -2500, x1: 22500, y1: 32500 });
    const r = pv.canvas.getBoundingClientRect();
    return [[0, 0], [20000, 0], [20000, 30000], [0, 30000], [16000, 0], [10000, 3000]].every((p) => { const s = pv.toScreen(p); return document.elementFromPoint(r.left + s.x, r.top + s.y) === pv.canvas; });
  });
  if (!seen) throw new Error('the plan view could not be framed on the site clear of the bars');
};
try {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Site constraints'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);
  await page.waitForFunction(() => window.ccProblems && window.bimcraftSiteConstraints);

  console.log('== the tools are on the Build menu beside Site');
  await page.click('[data-res-tools] > summary');
  const btn = await page.evaluate(() => ['site', 'bline', 'servitude'].map((n) => { const b = document.querySelector(`[data-res-tools] [data-mtool="${n}"]`); return { n, shown: !!b && b.offsetParent !== null, label: b?.textContent.trim(), tip: b?.getAttribute('title') || b?.getAttribute('data-bs-original-title') || b?.getAttribute('aria-label') || '' }; }));
  ok(btn.every((b) => b.shown) && btn[1].label === 'Building line' && btn[2].label === 'Servitude', 'Site, Building line and Servitude are shown', btn);
  ok(/warning/.test(btn[1].tip) && /nothing is refused/.test(btn[1].tip) && /easement/.test(btn[2].tip), 'their tooltips say a wall over one gets a warning and nothing is refused', btn.map((b) => b.tip));

  console.log('== the site outline, then the building line from setbacks');
  await page.click('[data-mtool="site"]'); await settled();
  // zoom out so a 20 x 30 m site fits: draw a first small triangle is not needed, the plan view pans by fit on a given box
  await frame();
  await planClick(0, 0); await planClick(20000, 0); await planClick(20000, 30000); await planClick(0, 30000);
  await page.keyboard.press('Enter'); await settled();
  ok(await page.evaluate(() => window.bimcraftSite.state.site?.points.length === 4), 'the site outline is drawn (4 corners)');
  await tool('data-res-tools', 'bline'); await frame();
  ok(await page.evaluate(() => !document.querySelector('[data-mopts="bline"]').hidden && document.querySelector('[data-mopts="servitude"]').hidden), 'the Building line row shows (Name, Reference, Setbacks)');
  ok(await page.evaluate(() => { const sc = window.bimcraftPlan.view.scene; return sc.symbols.some((s) => s.key === -1 && (s.texts || []).map((x) => x.text).join() === '1,2,3,4'); }), 'the boundaries are numbered 1 to 4 on the plan while the tool is on');
  await page.click('[data-sc-setbacks]');
  await page.waitForSelector('[data-sc-dialog][open]');
  const rows = await page.evaluate(() => [...document.querySelectorAll('[data-sc-dialog] [data-sc-sb]')].map((i) => i.closest('label').querySelector('span').textContent));
  ok(rows.length === 4 && /Boundary 1 \(20000/.test(rows[0]) && /Boundary 2 \(30000/.test(rows[1]), 'the dialog lists one distance per boundary with its length', rows);
  await shot('1-setbacks-dialog');
  // setbacks that leave nothing: said in the dialog, which stays open
  for (const [i, v] of [[0, '0'], [1, '10000'], [2, '0'], [3, '10000']]) await page.fill(`[data-sc-sb="${i}"]`, v);
  await page.click('[data-sc-sbok]');
  ok(await page.evaluate(() => !!document.querySelector('[data-sc-dialog][open]') && /nothing to build in/.test(document.querySelector('[data-sc-dialog] [role="alert"]').textContent)), 'side setbacks that meet: the dialog says so and stays open');
  for (const [i, v] of [[0, '5000'], [1, '1500'], [2, '3000'], [3, '1500']]) await page.fill(`[data-sc-sb="${i}"]`, v);
  await page.click('[data-sc-sbok]'); await settled();
  let I = await items();
  const bl = I.find((d) => d.derived);
  const has = (poly, x, y) => poly.some((p) => near(p[0], x, 1) && near(p[1], y, 1));
  ok(I.length === 1 && bl && bl.closed && has(bl.pts, 1500, 5000) && has(bl.pts, 18500, 27000), 'the building line from the setbacks: (1500, 5000) to (18500, 27000)', bl?.pts);
  const scene = await page.evaluate((key) => { const sc = window.bimcraftPlan.view.scene; const d = (sc.drafting || []).find((x) => x.key === key); return { d: d ? { dash: d.pen?.dash, color: d.pen?.color, closed: d.closed, n: d.lines[0].length } : null, labels: sc.symbols.flatMap((s) => (s.texts || []).map((x) => x.text)) }; }, bl.key);
  ok(scene.d && scene.d.dash === 'dash' && scene.d.closed && scene.d.n === 4 && scene.labels.includes('Building line from setbacks'), 'it is drawn dashed on the plan with its label', scene);
  await shot('2-building-line');

  console.log('== a wall drawn across the building line: drawn, and warned about');
  ok((await siteProblems()).length === 0, 'no wall yet: no site warnings');
  await page.click('[data-mtool="wall"]'); await settled(); await frame();
  await planClick(10000, 3000); await planClick(10000, 9000); await page.keyboard.press('Escape'); await settled();
  let W = await walls();
  const w1 = W.find((w) => near(w.a[0], 10000, 1) && near(w.b[0], 10000, 1));
  ok(W.length === 1 && w1 && near(Math.min(w1.a[1], w1.b[1]), 3000, 1) && near(Math.max(w1.a[1], w1.b[1]), 9000, 1), 'the wall across the line is in the model (the action was not refused)', W);
  ok(!(await page.evaluate(() => /refus|cannot|not allowed/i.test(document.querySelector('[data-status]')?.textContent || ''))), 'and the status line carries no refusal');
  await waitProblems(1);
  let P = await siteProblems();
  ok(P.length === 1 && P[0].code === 'site.buildingline.cross' && P[0].severity === 'warning' && P[0].about[0] === w1.guid && P[0].about.includes(bl.guid), 'Problems has one warning about that wall and that line', P);
  ok(/Level 1/.test(P[0]?.text) && /Building line from setbacks/.test(P[0]?.text), 'its words name the wall and the line: ' + P[0]?.text);
  const badge = await page.evaluate(() => { const b = document.querySelector('[data-problems-open]'); return b ? { hidden: b.hidden, n: b.querySelector('[data-problems-count]')?.textContent.trim() } : null; });
  ok(badge && !badge.hidden && badge.n === '1', 'the app bar\'s Problems button shows and counts 1', badge);
  if (await page.isHidden('[data-problems-panel]')) await page.click('[data-problems-open]');
  await page.waitForTimeout(400);
  const row = await page.evaluate((id) => document.querySelector('[data-problem="' + id + '"]')?.textContent || '', P[0].id);
  ok(/over the building line/.test(row), 'the Problems panel lists it: ' + row.slice(0, 140));
  await shot('3-warning');
  await page.evaluate(() => window.ccProblems.close());

  console.log('== the wall moved back: the warning clears; undo brings it back');
  await page.click('[data-mtool="select"]'); await settled();
  await planClick(10000, 7000); await settled();
  const picked = await page.evaluate(() => window.bimcraftRes.api.selectedKeys().length);
  ok(picked === 1, 'the wall is picked by a click on the plan');
  // Properties › Move is layout dependent; the wall is moved through the plan's own edit path (one undo step, as a grip drag commits)
  await page.evaluate(async (g) => { const M = await import('/assets/apps/bimcraft/dev/model-ops.js'); window.bimcraftRes.api.commit(M.changeWall(g, { a: [10000, 6000], b: [10000, 12000] }), { label: 'Wall', verb: 'Moved' }); }, w1.guid);
  await settled();
  W = await walls();
  const w2 = W.find((w) => w.guid === w1.guid);
  ok(w2 && near(Math.min(w2.a[1], w2.b[1]), 6000, 1), 'the wall now starts at y = 6000 (inside the line at y = 5000)', w2);
  await waitProblems(0);
  ok((await siteProblems()).length === 0, 'the warning is gone');
  await undo();
  await waitProblems(1);
  ok((await siteProblems()).length === 1, 'Undo: the wall is back across the line and so is the warning');

  console.log('== a servitude strip drawn on the plan');
  await tool('data-res-tools', 'servitude'); await frame();
  ok(await page.evaluate(() => !document.querySelector('[data-mopts="servitude"]').hidden && document.querySelector('[data-sc-kind]').options.length === 10 && document.querySelector('[data-sc-width]').value === '3000'), 'the Servitude row: ten kinds, width 3000 (mm) to start', await page.evaluate(() => document.querySelector('[data-sc-width]').value));
  await page.selectOption('[data-sc-kind]', 'sewer');
  await page.fill('[data-sc-sname]', 'Municipal sewer'); await page.fill('[data-sc-sref]', 'SG 1234/1998');
  await planClick(16000, 0); await planClick(16000, 30000); await page.keyboard.press('Enter'); await settled();
  I = await items();
  const sv = I.find((d) => d.kind === 'servitude');
  ok(sv && sv.shape === 'strip' && near(sv.width, 3000) && sv.servitude === 'sewer' && sv.name === 'Municipal sewer' && sv.reference === 'SG 1234/1998', 'a sewer servitude 3000 wide with its name and reference', sv);
  const sscene = await page.evaluate((key) => { const sc = window.bimcraftPlan.view.scene; const d = (sc.drafting || []).find((x) => x.key === key); return { dash: d?.pen?.dash, n: d?.lines[0].length, labels: sc.symbols.flatMap((s) => (s.texts || []).map((x) => x.text)) }; }, sv.key);
  ok(sscene.dash === 'dot' && sscene.n === 4 && sscene.labels.some((x) => /Municipal sewer 3000 wide \(SG 1234\/1998\)/.test(x)), 'drawn dotted as its outline, labelled with name, width and reference', sscene);
  // a wall from x = 11000 to 15500 at y = 15000 ends 1000 inside the strip (edge at 14500)
  await page.click('[data-mtool="wall"]'); await settled(); await frame();
  await planClick(11000, 15000); await planClick(15500, 15000); await page.keyboard.press('Escape'); await settled();
  await waitProblems(2);
  P = await siteProblems();
  const ps = P.find((p) => p.code === 'site.servitude.over');
  ok(P.length === 2 && ps && /Municipal sewer \(SG 1234\/1998\)/.test(ps.text) && ps.about.includes(sv.guid), 'the wall on the servitude is drawn and warned about: ' + ps?.text, P);
  await shot('4-servitude');

  console.log('== on paper: the plan PDF and a sheet');
  {
    const dlBytes = async (sel) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click(sel)]); return { name: dl.suggestedFilename(), txt: fs.readFileSync(await dl.path()).toString('latin1') }; };
    const dashed = (txt) => (txt.match(/\[[\d. ]+\] 0 d/g) || []).length;
    await page.click('[data-mtool="select"]'); await settled();
    const pr = await dlBytes('[data-model-print]');
    ok(pr.txt.startsWith('%PDF') && pr.txt.includes('(Building line from setbacks) Tj') && pr.txt.includes('(Municipal sewer 3000 wide \\(SG 1234/1998\\)) Tj'), 'the plan PDF carries both labels: "Building line from setbacks" and "Municipal sewer 3000 wide (SG 1234/1998)"', pr.name);
    // the same plan with the two constraints taken out of the scene prints fewer dashed strokes: the lines themselves are on the page
    const bare = await page.evaluate(async () => { const M = await import('/assets/apps/bimcraft/dev/model-pdf.js'); const sc = window.bimcraftPlan.view.scene; const keys = new Set(window.bimcraftSiteConstraints.items().map((d) => window.bimcraftRes.api.kb() + d.id)); const count = (b) => (new TextDecoder('latin1').decode(b).match(/\[[\d. ]+\] 0 d/g) || []).length; const withAll = M.planPdf(sc, { paper: 'a4', units: 'mm' }).bytes, without = M.planPdf({ ...sc, drafting: (sc.drafting || []).filter((d) => !keys.has(d.key)), labels: [] }, { paper: 'a4', units: 'mm' }).bytes; return { withAll: count(withAll), without: count(without) }; });
    ok(dashed(pr.txt) >= 2 && bare.withAll === bare.without + 2, 'and both lines, each in its own dash pattern (two more dashed strokes than the same plan without them)', { inPdf: dashed(pr.txt), ...bare });
    // the building's first sheet (A-101) holds this level's plan
    const sid = await page.evaluate(() => (window.bimcraftViews.state.sheets || []).find((x) => x.views.some((v) => v.kind === 'plan'))?.id);
    await page.evaluate((id) => document.querySelector(`[data-pb-sheet="${id}"]`).click(), sid);   // the project browser is folded away in the plan-only layout: its own button is clicked where it is
    await page.waitForSelector('[data-sh-dialog][open]');
    await page.waitForFunction(() => /Building line from setbacks/.test(document.querySelector('[data-sh-stage]')?.textContent || ''), null, { timeout: 20000 }).catch(() => {});
    const stage = await page.evaluate(() => { const st = document.querySelector('[data-sh-stage]'); return { text: st.textContent, dashes: st.querySelectorAll('[stroke-dasharray]').length }; });
    ok(/Building line from setbacks/.test(stage.text) && /Municipal sewer 3000 wide \(SG 1234\/1998\)/.test(stage.text) && stage.dashes >= 2, 'the sheet (' + sid + ') shows the building line and the servitude with their labels', { dashes: stage.dashes });
    const sp = await dlBytes('[data-sh-pdf]');
    ok(sp.txt.startsWith('%PDF') && sp.txt.includes('(Building line from setbacks)') && sp.txt.includes('Municipal sewer 3000 wide \\(SG 1234/1998\\)') && dashed(sp.txt) >= 2, 'the sheet\'s PDF carries the lines and both labels', sp.name);
    await shot('5-sheet');
    await page.click('[data-sh-dialog] button[value="cancel"]');
    await settled();
  }

  console.log('== picked: Properties edit it; Delete removes it');
  await page.click('[data-mtool="select"]'); await settled(); await frame();
  await planClick(14500, 25000); await settled();   // on the strip's west edge, away from walls
  const prop = await page.evaluate(() => ({ name: document.querySelector('[data-mp-scname]')?.value, ref: document.querySelector('[data-mp-scref]')?.value, kind: document.querySelector('[data-mp-sckind]')?.value, width: document.querySelector('[data-mp-scwidth]')?.value, over: document.querySelector('[data-mp-scover]')?.textContent }));
  ok(prop.name === 'Municipal sewer' && prop.ref === 'SG 1234/1998' && prop.kind === 'sewer' && prop.width === '3000' && /1 wall/.test(prop.over || ''), 'Properties show its name, reference, kind, width and "1 wall" over it', prop);
  await page.fill('[data-mp-scwidth]', '1000'); await page.keyboard.press('Enter'); await settled();
  await waitProblems(1);
  I = await items();
  ok(near(I.find((d) => d.guid === sv.guid).width, 1000) && (await siteProblems()).length === 1, 'made 1000 wide (x from 15500): the wall ending at 15500 only touches, its warning clears');
  await page.waitForFunction(() => !!document.querySelector('[data-mp-scname]'), null, { timeout: 8000 }).catch(() => {});
  ok(await page.evaluate(() => !!document.querySelector('[data-mp-scname]')), 'it stays picked after the change');
  await page.keyboard.press('Delete'); await settled();
  ok(!(await items()).some((d) => d.guid === sv.guid), 'Delete removes the servitude');
  await undo();
  ok((await items()).some((d) => d.guid === sv.guid), 'Undo brings it back');

  console.log('== saved and opened again');
  const bytes = await page.evaluate(() => Array.from(window.bimcraftPlan.state && window.bimcraftRes.api.ed().save()));
  const txt = Buffer.from(bytes).toString('utf8');
  ok(/'BuildingLine'/.test(txt) && /'Servitude'/.test(txt) && /CadCraft_SiteConstraint/.test(txt), 'the saved IFC carries both as annotations');
  await page.reload({ waitUntil: 'networkidle' });
  await page.setInputFiles('#bc-file', { name: 'site-constraints.ifc', mimeType: 'application/x-step', buffer: Buffer.from(bytes) });
  await page.waitForFunction(() => /^Opened site-constraints/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 120000 });
  await page.waitForFunction(() => window.ccProblems && window.bimcraftSiteConstraints);
  await waitProblems(1);
  ok((await siteProblems()).length === 1, 'opened again with only the 3D view showing: the warning is already there');
  await page.evaluate(() => window.bimcraftSiteConstraints.showPlan());
  await page.waitForFunction(() => window.bimcraftPlan?.state?.data, null, { timeout: 60000 });
  await settled();
  I = await items();
  ok(I.length === 2 && I.some((d) => d.derived && has(d.pts, 1500, 5000)) && I.some((d) => d.kind === 'servitude' && d.name === 'Municipal sewer' && near(d.width, 1000)), 'opened again: the building line from setbacks and the servitude are there', I.map((d) => [d.kind, d.name, d.width]));
  await waitProblems(1);
  P = await siteProblems();
  ok(P.length === 1 && P[0].code === 'site.buildingline.cross', 'and the wall across the building line is warned about again', P);

  const real = problems.filter((p) => !(/429/.test(p) && [...throttled].some((u) => /hardware/.test(u))));
  ok(real.length === 0, 'no console errors', real.slice(0, 5));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'stopped.png') }).catch(() => {});
} finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
