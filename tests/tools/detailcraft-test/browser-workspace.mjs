/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-workspace.mjs — DetailCraft's own parts of the workspace layouts (0.7 WS.13, session ws-detailcraft; adapter
 * workspace-detailcraft.js). The shell's conformance test (bin/test-app-workspaces.mjs --apps detailcraft) checks the twelve contract
 * points; this checks what only DetailCraft has: the browser palette (members, connections, drawings), the view tabs (3D, a plan per
 * level, an elevation per grid line), the ribbon's view commands opening tabs, Properties in the palette with the right panel aside,
 * the info box's view and name controls, and every control back home in classic.
 *
 *   node tools/detailcraft-test/browser-workspace.mjs [--shots dir]   (root; one app at a time behind tmp/ws-browser.lock)
 */
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const SH = arg('--shots'); if (SH) fs.mkdirSync(SH, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? '  — ' + d : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimres'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 } });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errors.push(m.text()); });
const use = async (w) => { await page.evaluate((v) => window.ccShellWorkspace.set(v), w); await page.waitForTimeout(700); };
const sample = async () => {
  await page.evaluate(() => window.detailcraft.act('sample'));
  await page.waitForFunction(() => window.detailcraft.model.state.members.length > 0, null, { timeout: 30000 });
  await page.waitForTimeout(500);
};

await page.goto('https://getcadcraft.com/lab/detailcraft', { waitUntil: 'networkidle' });
await page.evaluate(() => { localStorage.removeItem('cc-workspace'); });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForFunction(() => !!window.detailcraft && !!window.detailcraftWorkspace, null, { timeout: 30000 });
await sample();
const homes = await page.evaluate(() => ({ seg: document.querySelector('.dc-seg').parentElement.className, name: document.querySelector('[data-model-name]').closest('aside')?.className, props: document.querySelector('[data-props]').closest('aside')?.className }));

console.log('== docked');
await use('docked');
const s = await page.evaluate(() => {
  const st = window.detailcraft.model.state, b = document.querySelector('[data-ws-dc-browser]');
  return { members: st.members.length + st.footings.length + st.stairs.length, conns: st.connections.length, inPalette: !!b?.closest('.ws-palettes'),
    items: b?.querySelectorAll('[data-br-ref^="member:"], [data-br-ref^="footing:"], [data-br-ref^="stair:"]').length, connItems: b?.querySelectorAll('[data-br-ref^="conn:"]').length,
    props: !!document.querySelector('.ws-palettes [data-props]'), rightHidden: getComputedStyle(document.querySelector('.dc-right')).display === 'none',
    rightCol: getComputedStyle(document.querySelector('.dc')).gridTemplateColumns.split(' ').at(-1) };
});
ok(s.inPalette && s.items === s.members && s.connItems === s.conns && s.members > 0, 'the browser palette lists every member, footing, stair and connection', JSON.stringify(s));
ok(s.props && s.rightHidden && s.rightCol === '0px', 'Properties are the upper palette; the right panel steps aside', JSON.stringify(s));
// a click in the browser selects, Properties follow
const ref = await page.evaluate(() => { const b = document.querySelector('[data-br-ref^="member:"]'); b.click(); return b.dataset.brRef; });
await page.waitForTimeout(300);
const picked = await page.evaluate(() => ({ sel: window.detailcraft.selected.map((r) => r.kind + ':' + r.id), cur: document.querySelector('[data-ws-dc-browser] [aria-current="true"]')?.dataset.brRef, props: document.querySelector('.ws-palettes [data-props]').textContent.length }));
ok(picked.sel.length === 1 && picked.sel[0] === ref && picked.cur === ref && picked.props > 20, 'a click in the browser selects that member, marks it and shows its Properties', JSON.stringify(picked));
await page.evaluate(() => document.querySelector('[data-br-ref^="conn:"]').dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true })));
await page.waitForTimeout(300);
ok(await page.evaluate(() => window.detailcraft.selected.length === 2), 'Shift+click in the browser adds to the selection');
// drawings: listed when opened, a click opens the drawings dialog on that sheet
await page.evaluate(() => { document.querySelector('[data-br="drawings"]').open = true; });
await page.waitForTimeout(800);
const dw = await page.evaluate(() => ({ n: document.querySelectorAll('[data-br-sheet]').length, want: window.detailcraft.drawings().sheets.length }));
ok(dw.n > 1 && dw.n === dw.want, 'the browser lists the drawing set when its list is opened', JSON.stringify(dw));
await page.evaluate(() => document.querySelectorAll('[data-br-sheet]')[1].click());
await page.waitForTimeout(800);
ok(await page.evaluate(() => document.querySelector('[data-dwg]').open && document.querySelector('[data-dwg-sheet]').value === '1'), 'a drawing in the browser opens the drawings dialog on its sheet');
if (SH) await page.screenshot({ path: path.join(SH, 'detailcraft-docked-drawing.png') });
await page.evaluate(() => document.querySelector('[data-dwg-close]').click());
await page.waitForTimeout(300);
// views: the ribbon's View › Plan opens the plan as a tab; a tab shows its view
await page.click('[data-ws-tab]:has-text("View")');
await page.click('.ws-ribbon [data-ws-command="view.plan"]');
await page.waitForTimeout(700);
const v = await page.evaluate(() => ({ mode: window.detailcraft.viewMode, tabs: [...document.querySelectorAll('[data-ws-drawing]')].map((b) => b.dataset.wsDrawing), active: document.querySelector('[data-ws-drawing][aria-selected="true"]')?.dataset.wsDrawing }));
ok(v.mode === 'plan' && v.tabs.length === 2 && /^plan:/.test(v.active), 'View › Plan opens the plan in its own tab', JSON.stringify(v));
await page.click('[data-ws-drawing="3d"]'); await page.waitForTimeout(500);
ok(await page.evaluate(() => window.detailcraft.viewMode === '3d'), 'the 3D tab shows the 3D view again');
await page.click('[data-ws-close="3d"]'); await page.click('[data-ws-close^="plan:"]'); await page.waitForTimeout(500);
const em = await page.evaluate(() => !!document.querySelector('[data-ws-dc-open3d]')?.offsetParent);
ok(em, 'with every view closed, the drawing area offers to open the 3D view');
await page.click('[data-ws-dc-open3d]'); await page.waitForTimeout(400);
ok(await page.evaluate(() => document.querySelector('[data-ws-drawing][aria-selected="true"]')?.dataset.wsDrawing === '3d'), 'and opens it as a tab');

console.log('== toolbox');
await use('toolbox');
const t = await page.evaluate(() => ({ seg: !!document.querySelector('.tbx-ig-body > .dc-seg'), name: !!document.querySelector('.tbx-ig-body [data-model-name]'), tabs: [...document.querySelectorAll('[data-ws-view]')].map((b) => b.dataset.wsView),
  st: window.detailcraft.model.state }));
ok(t.seg && t.name, 'the info box holds the view picker and the model\'s name', JSON.stringify({ seg: t.seg, name: t.name }));
ok(t.tabs.length === 1 + t.st.levels.length + t.st.grids.y.length, 'a view tab for 3D, every level and every lettered grid line', t.tabs.join(' '));
await page.click('.tbx-ig-body [data-view="plan"]'); await page.waitForTimeout(500);
ok(await page.evaluate(() => window.detailcraft.viewMode === 'plan' && !document.querySelector('.tbx-ig-body [data-vlevel]').hidden && document.querySelector('[data-ws-view^="plan:"][aria-selected="true"]')),
  'Plan in the info box shows the plan, its level picker and marks the plan tab');
await page.click('[data-ws-view^="elev:"]'); await page.waitForTimeout(600);
ok(await page.evaluate(() => window.detailcraft.viewMode === 'elevation' && document.querySelector('[data-ws-view^="elev:"]').getAttribute('aria-selected') === 'true'), 'an elevation tab shows that elevation and is marked');
await page.fill('[data-model-name]', 'Workspace check'); await page.press('[data-model-name]', 'Tab'); await page.waitForTimeout(300);
ok(await page.evaluate(() => window.detailcraft.model.state.name === 'Workspace check'), 'the model\'s name is edited from the info box');
if (SH) await page.screenshot({ path: path.join(SH, 'detailcraft-toolbox-elevation.png') });

console.log('== classic');
await use('standard');
const back = await page.evaluate(() => ({ seg: document.querySelector('.dc-seg').parentElement.className, name: document.querySelector('[data-model-name]').closest('aside')?.className, props: document.querySelector('[data-props]').closest('aside')?.className,
  right: getComputedStyle(document.querySelector('.dc-right')).display, viewbar: getComputedStyle(document.querySelector('.dc-viewbar')).display }));
ok(back.seg === homes.seg && back.name === homes.name && back.props === homes.props && back.right !== 'none' && back.viewbar !== 'none', 'classic: the view bar, the model\'s name and Properties are home', JSON.stringify(back));
ok(!errors.length, 'no console errors', errors.slice(0, 3).join(' | '));
await browser.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
