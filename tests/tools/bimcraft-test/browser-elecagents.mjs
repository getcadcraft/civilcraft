#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-elecagents.mjs — GH.10 (0.9, session bim-hosts-09) in the real page, /lab, headless: Settings › Assistants on, a New model with four walls drawn
 * by the assistant's own walls_add, then the two requests of getcadcraft/bimcraft#16 through the page's dispatcher (window.bimcraftControl.handle):
 * a double socket every 2 m along the room's walls at 300 mm on circuit 3, and a ceiling light with its switch. The page's own Electrical state
 * (window.bimcraftRes) and its Undo button are read back.
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-elecagents.mjs        run as root (a test admin session)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimelec'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const throttled = new Set();
page.on('response', (r) => { if (r.status() === 429) throttled.add(r.url()); });
const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;
let id = 0;
const rpc = (method, params) => page.evaluate(([m, p, i]) => window.bimcraftControl.handle({ jsonrpc: '2.0', id: i, method: m, params: p }, 'elec'), [method, params, ++id]);
const call = async (name, args) => (await rpc('tools/call', { name, arguments: args })).result;
const quiet = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const settled = async () => { await quiet(); await page.waitForTimeout(350); await quiet(); };
const rebuilt = () => page.waitForFunction(() => !/Working/.test(document.body.innerText.slice(0, 200000)), null, { timeout: 90000 }).catch(() => {});
try {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.setItem('bimcraft.settings', JSON.stringify({ assistants: { enabled: true, groups: ['read', 'edit'] } })); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Elec agents'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);

  console.log('== the tools are offered');
  const tl = (await rpc('tools/list', {})).result.tools.map((t) => t.name);
  ok(['devices_add', 'device_change', 'lights_set', 'devices_delete', 'devices_list'].every((n) => tl.includes(n)), 'tools/list has the five device tools', tl.filter((n) => /device|light/.test(n)));
  const desc = await call('model_describe', {});
  const level = desc.structuredContent.levels[0];
  let r = await call('walls_add', { level: level.guid, points: [[0, 0], [5000, 0], [5000, 4000], [0, 4000]], closed: true, type: 'int-2x4', height: 2700 });
  ok(!r.isError, 'walls_add draws the room', r.content?.[0]?.text);
  await settled();
  const wl = (await call('walls_list', { level: level.guid })).structuredContent.walls;
  ok(wl.length === 4, 'four walls');

  console.log('== request 1: a double socket every 2 m along the walls of the living room at 300 mm on circuit 3');
  const centre = [2500, 2000], devices = [];
  for (const w of wl) {
    const dx = w.b[0] - w.a[0], dy = w.b[1] - w.a[1], len = Math.hypot(dx, dy), u = [dx / len, dy / len];
    let n = [-u[1], u[0]]; if ((centre[0] - (w.a[0] + w.b[0]) / 2) * n[0] + (centre[1] - (w.a[1] + w.b[1]) / 2) * n[1] < 0) n = [-n[0], -n[1]];
    for (let s = 1000; s < len; s += 2000) devices.push({ kind: 'socket.double', at: [w.a[0] + u[0] * s + n[0] * 250, w.a[1] + u[1] * s + n[1] * 250], wall: w.guid, height_mm: 300, circuit: '3' });
  }
  r = await call('devices_add', { level: level.guid, devices });
  ok(!r.isError && r.structuredContent.devices.length === 8, 'devices_add through the dispatcher: eight double sockets', r.content?.[0]?.text);
  await settled();
  let st = await page.evaluate(() => window.bimcraftRes.state.devs.map((d) => ({ kind: d.kind, circuit: d.circuit, height: d.height, wall: !!d.wall })));
  ok(st.length === 8 && st.every((d) => d.kind === 'socket.double' && d.circuit === '3' && near(d.height, 300) && d.wall), 'the page\'s Electrical state has them: circuit 3, 300 mm, on walls', st.slice(0, 2));
  r = await call('devices_list', { level: level.guid });
  ok(r.structuredContent.total === 8, 'devices_list agrees');
  await page.click('[data-act="undo"]'); await page.waitForTimeout(400); await rebuilt(); await settled();
  st = await page.evaluate(() => window.bimcraftRes.state.devs.length);
  ok(st === 0, 'the Undo button takes all eight away in one click');
  await page.click('[data-act="redo"]'); await page.waitForTimeout(400); await rebuilt(); await settled();
  ok(await page.evaluate(() => window.bimcraftRes.state.devs.length) === 8, 'Redo brings them back');

  console.log('== request 2: a ceiling light with its switch');
  const s = wl.find((w) => near(w.a[1], 0, 1) && near(w.b[1], 0, 1));
  r = await call('devices_add', { level: level.guid, devices: [{ kind: 'luminaire', at: [2500, 2000], circuit: '1' }, { kind: 'switch', at: [800, 250], wall: s.guid, circuit: '1' }] });
  ok(!r.isError && r.structuredContent.devices.length === 2, 'a ceiling luminaire and a switch on the south wall', r.content?.[0]?.text);
  await settled();
  const [lum, sw] = r.structuredContent.devices;
  r = await call('lights_set', { switch: sw.guid, lights: [lum.guid] });
  ok(!r.isError && r.structuredContent.linked === 1, 'lights_set links the light to the switch', r.content?.[0]?.text);
  await settled();
  const lk = await page.evaluate(() => window.bimcraftRes.state.devs.filter((d) => d.controls.length).map((d) => d.kind + ':' + d.controls.length));
  ok(lk.length === 1 && lk[0] === 'switch:1', 'the page sees the switch controlling one light', lk);
  r = await call('devices_add', { level: level.guid, devices: [{ kind: 'socket.deluxe', at: [0, 0] }] });
  ok(r.isError && /(Valid kinds|must be one of).*socket/.test(r.content[0].text), 'an unknown kind is an error result that lists the valid keys (schema refusal or tool)', r.content?.[0]?.text?.slice(0, 160));
  const log = await page.evaluate(() => window.bimcraftControl.log.map((e) => e.tool + ':' + e.outcome));
  ok(log.includes('devices_add:ok') && log.includes('lights_set:ok'), 'the activity log has the calls', log);
  const real = problems.filter((m) => !(/429/.test(m) && [...throttled].every((u) => /\/api\/v1\/hardware/.test(u))));
  ok(real.length === 0, 'no console errors', real.slice(0, 4));
} catch (e) { fail++; console.log('  FAIL ' + e.message); console.log(problems.slice(0, 4)); }
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
