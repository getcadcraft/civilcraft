// SPDX-License-Identifier: Apache-2.0
// Super: each panel tab has the apps' "…" menu (not a pop-out icon): Move to another side, Show on its own, Float, New window, Hide; a floating panel offers "Put it back".   node tools/super-test/tab-menu.mjs
import { start, launch, OUT } from './serve.mjs';
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1440, height: 900 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); const errors = [];
page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(800);
const where = id => page.evaluate(i => { const w = window.superWindow.state; const ws = w.workspaces[w.active]; for (const z of Object.keys(ws.docks)) for (const f of ws.docks[z]) if (f.tabs.includes(i)) return z; for (const f of w.floats || []) if (f.tabs.includes(i)) return 'float'; return null; }, id);
const MENU = '.shell-panel-menu', items = () => page.$$eval(MENU + ' [role="menuitem"]', n => n.map(x => x.textContent.trim()));
const openMenu = async id => { await page.click(`[data-act="tab-menu"][data-menu-for="${id}"]`); await page.waitForSelector(MENU); };
const choose = async text => { await page.click(`${MENU} [role="menuitem"]:has-text("${text}")`); await page.waitForTimeout(250); };

ok((await page.$$('[aria-label^="Tear off"]')).length === 0, 'the old pop-out icons are gone');
const tabs = await page.$$eval('[data-act="tab-menu"]', n => n.map(x => x.dataset.menuFor)); ok(tabs.length >= 3, 'every panel tab has a "…" button: ' + tabs.join(', '));
ok(await page.$eval('[data-act="tab-menu"] i', i => i.classList.contains('bi-three-dots')), 'it is the three-dots icon, as in the apps');
const ID = tabs.includes('props') ? 'props' : tabs[0]; const zone0 = await where(ID);
await page.screenshot({ path: `${OUT}/tab-menu-1-tabs.png`, clip: { x: 0, y: 60, width: 1440, height: 130 } });
await openMenu(ID); const it0 = await items();
ok(it0.some(x => /Float in this window/.test(x)) && it0.some(x => /Open in a new window/.test(x)) && it0.some(x => /Hide this panel/.test(x)), 'the menu offers Float, New window and Hide: ' + it0.join(' | '));
ok(it0.filter(x => /^Move to/.test(x)).length === 3 && !it0.includes({ left: 'Move to the left', center: 'Move to the middle', right: 'Move to the right', bottom: 'Move to the bottom' }[zone0]), `it offers the three other sides, not the one it is on (${zone0}): ` + it0.filter(x => /^Move to/.test(x)).join(', '));
ok(await page.$eval(MENU, m => { const r = m.getBoundingClientRect(); return r.width > 80 && r.height > 80 && r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; }), 'the menu is on screen');
await page.screenshot({ path: `${OUT}/tab-menu-2-open.png` });
await page.keyboard.press('Escape'); await page.waitForTimeout(150); ok((await page.$$(MENU)).length === 0, 'Escape closes it');
await openMenu(ID); await page.click('.sc-status', { position: { x: 3, y: 3 } }); await page.waitForTimeout(150); ok((await page.$$(MENU)).length === 0, 'a click elsewhere closes it');

// move to another side
const target = zone0 === 'bottom' ? ['Move to the right', 'right'] : ['Move to the bottom', 'bottom'];
await openMenu(ID); await choose(target[0]); ok(await where(ID) === target[1], `Move: the panel is now ${target[1]} (was ${zone0})`);
// float it, then put it back
await openMenu(ID); await choose('Float in this window'); ok(await where(ID) === 'float', 'Float: it is a floating window');
await openMenu(ID); const itf = await items(); ok(itf.includes('Put it back in the window') && !itf.some(x => /^Move to|Float in/.test(x)), 'a floating panel offers "Put it back" instead of the moves: ' + itf.join(' | '));
await choose('Put it back in the window'); ok(await where(ID) !== 'float' && await where(ID) !== null, 'Put it back: it is docked again (' + await where(ID) + ')');
// hide
await openMenu(ID); await choose('Hide this panel'); ok(await where(ID) === null, 'Hide: the panel is gone from the window');
ok(errors.length === 0, 'no page errors: ' + errors.slice(0, 2).join(' | '));
await browser.close(); close();
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
