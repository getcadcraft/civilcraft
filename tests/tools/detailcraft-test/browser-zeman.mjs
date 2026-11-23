#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-zeman.mjs — the Zeman export add-on in the real page (roadmap DC.133): off by default and NC files unchanged; switched on, NC files asks
 * which file set; a column with a base plate and stiffeners is exported, the zip is opened and its XML and NC files checked; no console errors.
 * One page load (the lab's sign-in is shared and throttled: this uses a ready session, no password login).
 *
 *   node tools/detailcraft-test/browser-zeman.mjs [--shots <dir>] [--keep <dir>]      (run as root)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const SHOTS = arg('--shots'), KEEP = arg('--keep');
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const OUT = KEEP || fs.mkdtempSync(path.join(os.tmpdir(), 'zeman-browser-'));
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const Z = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/detailcraft/dev/addons/zeman/lib/zeman.js')).href);

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const lab = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' })).cookie.split('=');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addInitScript(() => { try { localStorage.setItem('cc-autofocus', 'off'); } catch { /* storage blocked */ } });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const dc = (fn, a) => page.evaluate(fn, a);
const status = () => dc(() => document.querySelector('[data-status]').textContent);
const ncBtn = page.locator('.dc-tool-row > [data-act="nc"]');
const grab = async (click, name) => { const [d] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), click()]); const to = path.join(OUT, name); await d.saveAs(to); return { name: d.suggestedFilename(), file: to }; };

try {
  await ctx.addCookies([{ name: lab[0], value: lab.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(`${BASE}/lab/detailcraft`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.detailcraft && window.ccAddons && window.ccAddons.list().some((a) => a.id === 'zeman'), null, { timeout: 20000 });
  const col = await dc(() => {
    const m = window.detailcraft.model;
    m.change('column', (tx) => { tx.addMember({ type: 'column', profile: 'W10x49', material: 'A992', position: 'middle', rotation: 0, start: [0, 0, 0], end: [0, 0, 4000], phase: 1 }); });
    const id = m.state.members[0].id;
    m.change('base', (tx) => tx.addConnection({ type: 'baseplate', column: id }));
    m.change('stiffeners', (tx) => tx.updateConnection(m.state.connections[0].id, { stiffeners: 4, stiffT: 12, stiffH: 150 }));
    return id;
  });
  const listed = await dc(() => { const a = window.ccAddons.list().find((x) => x.id === 'zeman'); return { state: a.state, name: a.name, n: window.ccAddons.exporters().length }; });
  ok(listed.name === 'Zeman export' && listed.state !== 'active' && listed.n === 0, 'the add-on is in the build and off: ' + listed.state + ', no exporter');
  ok(await page.locator('[data-addons-set]').getByText('Zeman export').count() >= 1, 'Settings lists it with the other add-ons');

  // off: NC files as before, no question
  const plain = await grab(() => ncBtn.click(), 'plain.zip');
  ok(/ NC\.zip$/.test(plain.name) && await page.locator('dialog.dc-ask[open]').count() === 0, 'off: NC files saves the DSTV zip at once, no question (' + plain.name + ')');

  // on
  await dc(() => window.ccAddons.loader.setEnabled('zeman', true));
  await page.waitForFunction(() => window.ccAddons.exporters().length === 1);
  ok(true, 'switched on: one exporter, "' + await dc(() => window.ccAddons.exporters()[0].label) + '"');
  await dc((id) => window.detailcraft.setSelection([{ kind: 'member', id }]), col);
  await ncBtn.click();
  const dlg = page.locator('dialog.dc-ask[open]');
  await dlg.waitFor();
  const labels = await dlg.locator('button[data-key]').allTextContents();
  ok(labels.length === 3 && labels[0] === 'Cancel' && labels[1] === 'Zeman (XML + NC)' && labels[2] === 'DSTV NC files', 'NC files now asks: ' + labels.join(' | '));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'zeman-ask.png') });
  const z = await grab(() => dlg.locator('button', { hasText: 'Zeman' }).click(), 'zeman.zip');
  const mark = await dc((id) => window.detailcraft.marks.asmMark.get(id), col);
  ok(z.name === mark + '.zip', 'the selected column\'s assembly is saved as ' + z.name);
  const said = await status();
  ok(said.includes('Zeman files written for ' + mark) && /check the first one/.test(said), 'the status says what was written and to check it: ' + said.slice(0, 110) + '…');
  ok(execFileSync('unzip', ['-t', z.file], { encoding: 'utf8' }).includes('No errors detected'), 'unzip reads the zip');
  const dir = path.join(OUT, 'unzipped');
  fs.rmSync(dir, { recursive: true, force: true });
  execFileSync('unzip', ['-q', '-o', z.file, '-d', dir]);
  const files = fs.readdirSync(path.join(dir, mark)).sort();
  ok(fs.readdirSync(dir).join() === mark && files.includes(mark + '.Xml') && files.filter((f) => f.endsWith('.nc')).length === files.length - 1, 'one folder ' + mark + '/ with ' + files.join(', '));
  const bytes = fs.readFileSync(path.join(dir, mark, mark + '.Xml'));
  const xml = bytes.toString('utf8');
  ok(bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf && /^<\?xml version="1\.0" encoding="utf-8"\?>\r\n<!--File written \d{4}-\d\d-\d\d \d\d:\d\d:\d\d by Zeman Export Tool-->\r\n<WIA VERSION="1\.0">\r\n/.test(xml.slice(1)) && xml.endsWith('</WIA>'), 'the XML on disk: byte order mark, the declaration, the "File written … by Zeman Export Tool" comment (FX.397), <WIA VERSION="1.0">, CRLF, no line end at the end');
  const wia = Z.readWia(xml);
  ok(wia.name === mark && wia.parts.length === 6 && wia.parts[0].leading && wia.parts.filter((p) => !p.leading).length === 5 && wia.mainProfile === 'W10x49', 'HEAD ' + wia.name + ' / ' + wia.mainProfile + ' / ' + wia.mainMaterial + '; the column leading, the base plate and 4 stiffeners attached');
  ok(wia.parts.every((p) => files.includes(p.file)) && Buffer.from(Z.wiaXml(wia), 'utf8').equals(bytes), 'every NC file it names is in the folder; read and written back the XML is the same bytes');
  const ncs = files.filter((f) => f.endsWith('.nc')).map((f) => fs.readFileSync(path.join(dir, mark, f), 'latin1'));
  ok(ncs.every((t, i) => t.startsWith('ST\r\n** ' + files.filter((f) => f.endsWith('.nc'))[i] + '\r\n') && t.endsWith('EN\r\n')), 'the NC files are DSTV text, each naming itself');
  console.log('       Length ' + wia.length + ', Width ' + wia.width + ', Height ' + wia.height + '; parts: ' + wia.parts.map((p) => p.name + ' → ' + p.file + ' @ ' + p.base.join(' ')).join('; '));

  // the DSTV choice still gives the plain zip; Cancel gives nothing
  await ncBtn.click();
  await dlg.waitFor();
  const again = await grab(() => dlg.locator('button[data-key="nc1"]').click(), 'plain2.zip');
  ok(/ NC\.zip$/.test(again.name) && fs.readFileSync(again.file).length === fs.readFileSync(plain.file).length, 'choosing DSTV NC files gives the same zip as before');
  await ncBtn.click();
  await dlg.waitFor();
  await dlg.locator('button[data-key="cancel"]').click();
  ok(await dlg.count() === 0, 'Cancel closes the question');

  // off again: its choice goes
  await dc(() => window.ccAddons.loader.setEnabled('zeman', false));
  ok(await dc(() => window.ccAddons.exporters().length) === 0, 'switched off: the choice is gone');
} catch (e) {
  fail++; console.log('  FAIL the run stopped: ' + (e && e.message || e));
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed` + (KEEP ? ' (files in ' + OUT + ')' : ''));
if (!KEEP) fs.rmSync(OUT, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
