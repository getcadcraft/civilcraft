// SPDX-License-Identifier: Apache-2.0
// Super's Home: New starts a project and goes to the drawing space; "Open any file" with nothing chosen (picker cancelled) stays on Home, and only a real open leaves it.
//   node tools/super-test/home-actions.mjs
import { start, launch, OUT } from './serve.mjs';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1440, height: 900 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); const errors = [];
page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(800);
const homeShown = () => page.evaluate(() => { const h = document.querySelector('.sc-home'); return !!h && !h.hidden && h.getBoundingClientRect().width > 300; });
await page.evaluate(() => window.superWindow.home.show('home')); await page.waitForTimeout(300);
ok(await homeShown(), 'Home is showing');
// Open any file, nothing chosen: back on Home, nothing closed
let fc = page.waitForEvent('filechooser'); await page.click('[data-home-act="open-any"]'); await (await fc).setFiles([]); await page.waitForTimeout(500);
ok(await homeShown(), 'Open file with no selection stays on Home');
// the Open menu's project file, nothing chosen: same
if (await page.$('[data-home-act="open"]')) { await page.click('[data-home-act="open"]'); if (await page.$('[data-home-act="open-file"]:visible')) { fc = page.waitForEvent('filechooser'); await page.click('[data-home-act="open-file"]'); await (await fc).setFiles([]); await page.waitForTimeout(400); ok(await homeShown(), 'Open a project file with no selection stays on Home'); } }
// New: a PAGE (no alert) to set the project up; nothing is made until "Start the project"
let alerts = 0; page.on('dialog', d => { alerts++; d.dismiss(); });
await page.evaluate(() => window.superWindow.home.show('home')); await page.waitForTimeout(500);
await page.click('[data-home-act="new"]'); await page.waitForSelector('[data-np-name]', { timeout: 8000 });
ok(alerts === 0 && await homeShown() && await page.$('dialog[open]') === null, 'New opens a page on Home, not an alert or a dialog');
for (const sel of ['[data-np-desc]', '[data-np-intent]', '[data-np-client]', '[data-np-team]', '[data-np-start]', '[data-np-due]', '[data-np-units]', '[data-np-versions]']) ok(await page.$(sel) !== null, 'the page has ' + sel);
await page.screenshot({ path: `${OUT}/home-actions-1-new.png` });
await page.fill('[data-np-name]', ''); await page.click('[data-act="np-create"]'); ok((await page.textContent('[data-np-err]')).length > 0 && await homeShown(), 'a project needs a name: it says so and stays');
await page.fill('[data-np-name]', 'Riverside Library'); await page.fill('[data-np-start]', '2026-12-10'); await page.fill('[data-np-due]', '2026-12-01'); await page.click('[data-act="np-create"]');
ok((await page.textContent('[data-np-err]')).length > 0 && await homeShown(), 'a due date before the start date is refused');
await page.click('[data-act="np-cancel"]'); await page.waitForTimeout(200); ok(await homeShown() && await page.$('[data-np-name]:visible') === null, 'Cancel goes back to Home');
await page.click('[data-home-act="new"]'); await page.waitForSelector('[data-np-name]');
await page.fill('[data-np-name]', 'Riverside Library'); await page.fill('[data-np-desc]', 'Reading room and stacks'); await page.selectOption('[data-np-intent]', 'documentation'); await page.fill('[data-np-client]', 'City of Riverside');
await page.fill('[data-np-start]', '2026-12-01'); await page.fill('[data-np-due]', '2026-12-20'); await page.selectOption('[data-np-units]', 'ft');
await page.click('[data-act="np-create"]'); await page.waitForTimeout(600);
const proj = await page.evaluate(() => { const p = window.superWindow.project; return { name: p.name, info: p.info, unit: p.units.length }; });
ok(proj.name === 'Riverside Library' && proj.info.intent === 'documentation' && proj.info.client === 'City of Riverside' && proj.info.start === '2026-12-01' && proj.info.due === '2026-12-20' && proj.info.description === 'Reading room and stacks' && proj.unit === 'ft', 'Start the project makes it with what was entered: ' + JSON.stringify(proj));
ok(!(await homeShown()) && alerts === 0, 'and goes to the drawing space, still with no alert');
await page.evaluate(() => window.superWindow.home.show('home')); await page.waitForTimeout(500);
// a real file leaves Home
const tmp = path.join(os.tmpdir(), 'home-actions-test.txt'); fs.writeFileSync(tmp, 'hello');
fc = page.waitForEvent('filechooser'); await page.click('[data-home-act="open-any"]'); await (await fc).setFiles([tmp]); await page.waitForTimeout(800); fs.unlinkSync(tmp);
ok(!(await homeShown()), 'a file that opens takes you to the drawing space');
ok(errors.length === 0, 'no page errors: ' + errors.slice(0, 2).join(' | '));
await browser.close(); close();
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
