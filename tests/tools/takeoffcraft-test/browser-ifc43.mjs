#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-ifc43.mjs — 0.8 SU.882 (ifc_PART_4): an IFC 4.3 file opened in TakeoffCraft (/lab/takeoffcraft, headless Chromium, run as root) becomes typed
 * quantities. Writes a road with lib/ifc/ifc43.js write43, opens it through the file input, checks the items (pavement volume 210 m³, kerb length, counts),
 * the same file again changes nothing, an IFC4 building file says it holds no infrastructure, no console errors.
 *   node tools/takeoffcraft-test/browser-ifc43.mjs
 */
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'tmp/shots/takeoffcraft-ifc43');
fs.mkdirSync(OUT, { recursive: true });
const { write43 } = await import(pathToFileURL(path.join(ROOT, 'lib/ifc/ifc43.js')).href);
const road = write43({ name: 'Road test', facilities: [{ kind: 'road', name: 'Main', parts: [{ name: 'Carriageway', elements: [
  { cls: 'IfcPavement', name: 'Surface', predefined: 'FLEXIBLE', profile: { w: 100, d: 7 }, height: 0.3, at: [0, 0, 0] },
  { cls: 'IfcKerb', name: 'Kerb', profile: { w: 20, d: 0.15 }, height: 0.2, at: [0, 10, 0] }] }] }] });
const F43 = path.join(OUT, 'road.ifc'); fs.writeFileSync(F43, road.bytes);
const F4 = path.join(OUT, 'building.ifc');
fs.writeFileSync(F4, "ISO-10303-21;\nHEADER;FILE_DESCRIPTION(('x'),'2;1');FILE_NAME('a','',(''),(''),'','','');FILE_SCHEMA(('IFC4'));ENDSEC;\nDATA;\n#1=IFCWALL('0000000000000000000001',$,'W',$,$,$,$,$,$);\nENDSEC;\nEND-ISO-10303-21;\n");

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const { chromium } = await import('playwright-core');
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const exe = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))
  .map((d) => path.join(cache, d, 'chrome-linux64/chrome')).find((p) => fs.existsSync(p));
const admin = (...a) => execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/takeoffcraft-test/admin.php'), ...a], { encoding: 'utf8' });
const S = JSON.parse(admin('session', 'main'));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await ctx.addCookies([{ name: S.name, value: S.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto('https://getcadcraft.com/lab/takeoffcraft?space=paper');
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 20000 });
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForTimeout(500); }
  const items = () => page.evaluate(() => window.takeoffcraft.model.state.items.map((i) => ({ n: i.name, u: i.unit, q: i.qty, o: i.origin && i.origin.app })));
  const status = () => page.textContent('[data-status]');
  await page.setInputFiles('[data-file-pdf]', F43);
  await page.waitForFunction(() => window.takeoffcraft.model.state.items.length > 0, null, { timeout: 20000 });
  const a = await items();
  console.log('  items: ' + JSON.stringify(a));
  ok(a.length === 8, 'two classes → two counts + length, area and volume each = 8 typed quantities');
  ok(a.some((i) => /Pavement/.test(i.n) && /volume/.test(i.n) && i.u === 'm³' && Math.abs(i.q - 210) < 1e-6), 'pavement volume 210 m³');
  ok(a.some((i) => /Kerb/.test(i.n) && /length/.test(i.n) && i.u === 'm' && Math.abs(i.q - 20) < 1e-6), 'kerb length 20 m');
  ok(a.every((i) => i.o === 'IFC'), 'each item remembers it came from an IFC file');
  ok(/road\.ifc/.test(await status()) && /8 added/.test(await status()), 'the status line says 8 added: ' + (await status()));
  await page.setInputFiles('[data-file-pdf]', F43);
  await page.waitForFunction(() => /0 added/.test(document.querySelector('[data-status]').textContent), null, { timeout: 20000 });
  ok((await items()).length === 8, 'the same file again adds nothing');
  await page.setInputFiles('[data-file-pdf]', F4);
  await page.waitForFunction(() => /holds no IFC 4\.3/.test(document.querySelector('[data-status]').textContent), null, { timeout: 20000 });
  ok(true, 'an IFC4 building file says it holds no IFC 4.3 infrastructure');
  await page.screenshot({ path: path.join(OUT, 'ifc43.png') });
} finally { await browser.close(); }
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.join(' | ') : ''));
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
