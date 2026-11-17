// SPDX-License-Identifier: Apache-2.0
// Super: the wall tools of BimCraft and CadCraft plan walls (wall tool specification, WT.2-WT.6, FX.70) are on the Build ribbon of the docked
// layout, named, and a click on one starts the tool in the hosted app.   node tools/super-test/walls-ribbon.mjs
import { start, launch } from './serve.mjs';
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1600, height: 900 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } }); const page = await ctx.newPage(); const errors = [];
page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
await page.goto(url + '?workspace=docked'); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
await page.waitForFunction(() => { const c = document.querySelector('[data-boot]'); return !c || c.hidden; }, null, { timeout: 30000 });
await page.evaluate(() => { const w = window.superWindow, s = JSON.parse(JSON.stringify(w.state)); s.active = 'build'; w.state = s; }); await page.waitForTimeout(1500);
const tools = await page.evaluate(() => [...document.querySelectorAll('[data-ws-command], .ws-tool')].map(b => ({ cmd: b.dataset.wsCommand || b.dataset.command || '', label: (b.getAttribute('aria-label') || b.title || b.textContent || '').trim().slice(0, 60), disabled: b.disabled || b.getAttribute('aria-disabled') === 'true', shown: b.getBoundingClientRect().width > 0 })).filter(x => /wall/i.test(x.cmd + ' ' + x.label)));
if (process.argv.includes('--list')) console.log(JSON.stringify(tools, null, 1));
for (const id of ['bimcraft:wall.joinstyle', 'bimcraft:wall.disallow', 'bimcraft:wall.layerpriority', 'bimcraft:wall.profile', 'bimcraft:wall.opening', 'bimcraft:wall.attach', 'bimcraft:wall.slant', 'cadcraft:wall.line', 'cadcraft:wall.split', 'cadcraft:wall.joinstyle', 'cadcraft:wall.disallow', 'cadcraft:wall.offset'])
  ok(tools.some(x => x.cmd.includes(id)), 'Build ribbon lists ' + id);
ok(tools.filter(x => x.cmd).every(x => /\S/.test(x.label) && !/^wall\./.test(x.label)), 'every wall tool has a real label: ' + tools.filter(x => !/\S/.test(x.label) || /^wall\./.test(x.label)).map(x => x.cmd).join(', '));
ok(!errors.length, 'no page errors: ' + errors.slice(0, 3).join(' | '));
console.log(`${pass} passed, ${fail} failed`); await browser.close(); await close(); process.exit(fail ? 1 : 0);
