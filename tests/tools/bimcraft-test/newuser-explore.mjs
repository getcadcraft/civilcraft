import fs from 'node:fs'; import path from 'node:path';
const { chromium } = await import('playwright-core');
import { execFileSync } from 'node:child_process';
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const OUT = '/tmp/claude-0/-var-www-CADCRAFT/e29cb550-bb08-4fbe-bc1e-6a28375005bd/scratchpad/day';
const area = process.argv[2] || 'use';
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
if (area === 'lab') {
  const m = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', '/var/www/CADCRAFT/getcadcraft.com/tools/cadcraft-test/admin.php', 'session', 'bimday'], { encoding: 'utf8' }));
  await ctx.addCookies([{ name: m.name, value: m.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
}
const page = await ctx.newPage();
await page.addInitScript(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) {} });
const probs = [];
page.on('console', (m) => { if (['error','warning'].includes(m.type())) probs.push(m.type() + ': ' + m.text().slice(0,200)); });
page.on('pageerror', (e) => probs.push('pageerror: ' + e.message));
page.on('requestfailed', (r) => probs.push('reqfail: ' + r.url()));
const shot = (n) => page.screenshot({ path: OUT + '/' + n + '.png' });
await page.goto('https://getcadcraft.com/' + area + '/bimcraft', { waitUntil: 'networkidle' });
await page.click('[data-empty] [data-new]');
await page.waitForSelector('dialog.bc-new');
await shot('02-new-dialog');
console.log(await page.evaluate(() => [...document.querySelectorAll('dialog.bc-new label, dialog.bc-new input, dialog.bc-new select')].map((e) => e.tagName + ':' + (e.name || e.getAttribute('data-new-name') || e.textContent.trim().slice(0, 40))).join(' | ')));
await page.fill('[data-new-name]', 'Small house');
await page.fill('[data-new-levels]', '2');
await page.click('[data-new-ok]');
await page.waitForSelector('[data-plan-wrap]:not([hidden])', { timeout: 60000 });
await page.waitForTimeout(1500);
await shot('03-new-building');
const st = () => page.evaluate(() => document.querySelector('[data-status]')?.textContent || '');
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 60000 });
const typed = async (v) => { await page.evaluate((x) => window.bimcraftPlan.typed(x), v); await settled(); };
const click = async (p) => { await page.evaluate((x) => window.bimcraftPlan.click(x), p); await settled(); };
await page.click('[data-mtool="wall"]');
console.log('status after Wall tool:', await st());
await shot('04-wall-tool');
await click([0, 0]);
console.log('after first click:', await st());
for (const pt of ['10000,0', '10000,7000', '0,7000', '0,0']) { await typed(pt); }
console.log('after rectangle:', await st());
await page.keyboard.press('Escape');
await shot('05-rectangle');
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), q = pv.toScreen([x, y]); return [r.left + q.x, r.top + q.y]; }, [x, y]);
const pc = async (x, y) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py); await settled(); };
console.log('walls', await page.evaluate(() => window.bimcraftPlan.state.data.walls.length), 'spaces', await page.evaluate(() => window.bimcraftPlan.state.data.derived.spaces.length), 'view fitted?', await page.evaluate(() => !window.bimcraftPlan.view.outsideView?.()));
// a partition
await click([5000, 0]); await typed('5000,7000'); await page.keyboard.press('Escape');
await page.click('[data-mtool="door"]');
await pc(2500, 0); console.log('door:', await st());
await page.click('[data-mtool="window"]');
await pc(7500, 0); console.log('window:', await st());
await pc(0, 3500); console.log('window2:', await st());
await shot('06-openings');
await page.click('[data-mtool="floor"]');
await pc(2500, 3500); console.log('floor:', await st());
await page.click('[data-mtool="ceiling"]');
await pc(2500, 3500); console.log('ceiling:', await st());
await page.click('[data-mtool="roof"]');
await pc(2500, 3500); console.log('roof:', await st());
await shot('07-roof');
console.log('counts', await page.evaluate(() => { const d = window.bimcraftPlan.state.data; return JSON.stringify({ walls: d.walls.length, openings: d.openings.length, spaces: d.derived.spaces.length, floors: d.derived.floors.length, ceilings: d.derived.ceilings.length, roofs: d.derived.roofs.length }); }));
await page.click('[data-mtool="select"]');
await page.click('[data-model-print]');
await page.waitForTimeout(800);
await shot('08-print');
console.log('print:', await st(), '| dialogs:', await page.evaluate(() => [...document.querySelectorAll('dialog[open]')].map((d) => d.className + ':' + d.textContent.slice(0, 100)).join(' ## ')));
await page.keyboard.press('Escape');
// the left panel: levels + schedules
await page.evaluate(() => { const el = document.querySelector('[data-model-levels-sec], [data-levels-sec]'); el?.scrollIntoView(); });
await shot('09-left-panel');
console.log('left panel text:', await page.evaluate(() => document.querySelector('.bc-left, aside')?.innerText.slice(0, 1200)));
// menus: what is offered
for (const m of ['Build', 'Modify', 'Annotate']) {
  await page.locator('[data-model-wrap] summary, [data-plan-wrap] summary').filter({ hasText: new RegExp('^\\s*' + m + '\\s*$') }).first().click();
  console.log('MENU', m, ':', await page.evaluate(() => [...document.querySelectorAll('details[open] button, details[open] [role=menuitem], details[open] a')].map((b) => b.textContent.trim().replace(/\s+/g, ' ')).filter(Boolean).join(' | ')));
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.querySelectorAll('details[open]').forEach((d) => d.removeAttribute('open')));
}
await page.click('[data-model-layout="split"]');
await page.waitForTimeout(1500);
await shot('10-split-3d');
console.log('layout buttons:', await page.evaluate(() => [...document.querySelectorAll('[data-model-layout]')].map((b) => b.textContent.trim()).join(',')));
console.log(probs.join('\n'));
await browser.close();
