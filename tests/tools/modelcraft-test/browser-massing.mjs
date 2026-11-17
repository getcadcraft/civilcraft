#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-massing.mjs: 0.10 BK.44 "Massing to BimCraft" in ModelCraft's real page, headless Chromium at /lab/modelcraft, then
 * BimCraft's page receiving it (session bk-r3-stages-10). Two groups are made with the kernel's own push / pull in the page:
 *   Bar      10 x 20 m pulled 9 m:  3 floors of 3 m, 200 m2 footprint, 600 m2 gross
 *   Stepped  20 x 10 m pulled 6 m, half its top pulled 3 m more: floors 200 + 200 + 100 = 500 m2 gross, shape simplified
 * The dialog lists them; Save as IFC downloads the file; Send to BimCraft opens BimCraft in a new tab with both as options.
 *   nice -n 10 timeout 600 node tools/modelcraft-test/browser-massing.mjs [--out <dir>]      (root)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/massing')));
fs.mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function signedInContext(opts) {
  // a minted staff session (as tools/problems-test/*): sign-in by password races other sessions' test runs on the shared test admin
  const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
  const c = await browser.newContext(opts);
  await c.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  return c;
}

const modUrl = (page, re) => page.evaluate((src) => { const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports; return Object.entries(map).find(([k]) => new RegExp(src).test(k))?.[1] || null; }, re.source);
const problems = [];
try {
  const ctx = await signedInContext({ viewport: { width: 1600, height: 1000 }, locale: 'en-US', ignoreHTTPSErrors: true, serviceWorkers: 'block', acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU stall|GL_|status of 429/i.test(m.text())) problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.addInitScript(() => { window.showOpenFilePicker = undefined; window.showSaveFilePicker = undefined; });
  await page.goto(BASE + '/lab/modelcraft?space=model', { waitUntil: 'load' });
  await page.waitForFunction(() => window.modelcraft?.model, null, { timeout: 60000 });
  const modelUrl = await modUrl(page, /\/modelcraft\/dev\/model\.js/), vecUrl = await modUrl(page, /\/modelcraft\/dev\/vec\.js/);
  const made = await page.evaluate(async ([mu, vu]) => {
    const M = await import(mu), V = await import(vu), model = window.modelcraft.model;
    model.units = 'm';   // the dialog shows and reads the model's unit (this browser's default is feet and inches)
    const up = (d) => [...d.faces].filter(([, f]) => V.dot(M.faceNormal(d, f), [0, 0, 1]) > 1 - 1e-9).map(([id]) => id);
    const group = (name, make) => model.change(name, (m) => { const before = new Set(m.root.faces.keys()); make(m.root, before); const mine = [...m.root.faces.keys()].filter((id) => !before.has(id)); return m.makeGroup(m.root, M.connected(m.root, [{ t: 'f', id: mine[0] }]), 'group', name); });
    group('Bar', (d, b) => { M.addPolygon(d, M.rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 10, 20)); M.pushPull(d, [...d.faces.keys()].find((id) => !b.has(id)), 9); });
    group('Stepped', (d, b) => {
      M.addPolygon(d, M.rectPts([30, 0, 0], [1, 0, 0], [0, 1, 0], 20, 10)); M.pushPull(d, [...d.faces.keys()].find((id) => !b.has(id)), 6);
      M.addEdge(d, [40, 0, 6], [40, 10, 6]);
      const half = up(d).find((id) => !b.has(id) && Math.abs(M.faceArea(d, d.faces.get(id)) - 100) < 1e-6 && d.faces.get(id).loops[0].every((v) => d.verts.get(v)[0] <= 40 + 1e-9));
      M.pushPull(d, half, 3);
    });
    return model.root.insts.size;
  }, [modelUrl, vecUrl]);
  ok(made === 2, 'two groups made by push / pull in the page (Bar, Stepped)');

  console.log('== Export > Massing to BimCraft…');
  const item = await page.evaluate(() => { const b = document.querySelector('[data-export-menu] [data-act="massing"]'); return b ? b.textContent.trim() : null; });
  ok(item === 'Massing to BimCraft…', 'the Export menu has "Massing to BimCraft…": ' + item);
  await page.click('[data-export-menu] > summary');
  await page.click('[data-export-menu] [data-act="massing"]');
  await page.waitForSelector('[data-ms-dialog][open]');
  const read = () => page.evaluate(() => [...document.querySelectorAll('[data-ms-row]')].map((r) => ({ name: r.children[0].textContent, floors: r.querySelector('[data-ms-floors]')?.textContent, foot: r.querySelector('[data-ms-foot]')?.textContent, gross: r.querySelector('[data-ms-gross]')?.textContent, note: r.querySelector('[data-ms-note]')?.textContent })));
  let R = await read();
  const num = (s) => Number(String(s).replace(/[^0-9.]/g, ''));
  ok(R.length === 2 && R[0].name === 'Bar' && R[0].floors === '3' && num(R[0].foot) === 200 && num(R[0].gross) === 600 && /As modelled/.test(R[0].note), 'Bar: 3 floors, 200 and 600 m2, as modelled: ' + JSON.stringify(R[0]));
  ok(R[1].name === 'Stepped' && R[1].floors === '3' && num(R[1].gross) === 500 && /Simplified/.test(R[1].note) && /floors are not all the size of its base/.test(R[1].note), 'Stepped: 3 floors, 500 m2 gross, simplified with the reason: ' + JSON.stringify(R[1]));
  ok(await page.evaluate(() => /nothing is selected/i.test(document.querySelector('[data-ms-dialog]').textContent)), 'with nothing selected it says every group goes');
  // 4.5 m floors: Bar 9 / 4.5 = 2 floors, 400 m2 gross
  await page.fill('[data-ms-height]', '4.5'); await page.dispatchEvent('[data-ms-height]', 'change');
  R = await read();
  ok(R[0].floors === '2' && num(R[0].gross) === 400, 'floor height 4.5 m: Bar has 2 floors and 400 m2 gross', JSON.stringify(R[0]));
  await page.fill('[data-ms-height]', '0.2'); await page.dispatchEvent('[data-ms-height]', 'change');
  ok(/between 1 m and 20 m/.test(await page.textContent('[data-ms-err]')) && (await read()).length === 0, 'a floor height of 0.2 m is refused in words');
  await page.fill('[data-ms-height]', '3'); await page.dispatchEvent('[data-ms-height]', 'change');
  await page.fill('[data-ms-set]', 'Scheme A'); await page.dispatchEvent('[data-ms-set]', 'change');
  await page.screenshot({ path: path.join(OUT, 'massing-dialog.png') });
  const hasSend = await page.evaluate(() => !!document.querySelector('[data-ms-send]'));
  ok(hasSend && /Send to BimCraft/.test(await page.textContent('[data-ms-send]')), 'BimCraft is open in this area: the dialog offers "Send to BimCraft"');

  console.log('== Send to BimCraft');
  const [bim] = await Promise.all([ctx.waitForEvent('page', { timeout: 30000 }), page.click('[data-ms-send]')]);
  const bimProblems = [];
  bim.on('pageerror', (e) => bimProblems.push('pageerror: ' + e.message));
  ok(/\/lab\/bimcraft/.test(bim.url()) , 'a new tab opens BimCraft: ' + bim.url().replace(/handoff=[^&]+/, 'handoff=…'));
  await bim.waitForFunction(() => window.bimcraftMassOptions && window.bimcraftMassOptions.sets().length > 0, null, { timeout: 120000 });
  const S = await bim.evaluate(() => window.bimcraftMassOptions.sets().map((s) => ({ set: s.set, options: s.options.map((o) => ({ option: o.option, floors: o.floors, foot: o.footprint_m2, gross: o.gross_m2, vol: o.volume_m3, simplified: o.simplified, current: o.current, spaces: o.spaces })) })));
  const by = Object.fromEntries((S[0]?.options || []).map((o) => [o.option, o]));
  ok(S.length === 1 && S[0].set === 'Scheme A' && S[0].options.length === 2, 'BimCraft opened the file with one option set "Scheme A" of two options', JSON.stringify(S));
  ok(by.Bar && by.Bar.floors === 3 && Math.abs(by.Bar.foot - 200) < 0.01 && Math.abs(by.Bar.gross - 600) < 0.01 && Math.abs(by.Bar.vol - 1800) < 0.01 && !by.Bar.simplified, 'Bar there: 3 floors, 200 m2, 600 m2 gross, 1800 m3', JSON.stringify(by.Bar));
  ok(by.Stepped && Math.abs(by.Stepped.gross - 500) < 0.01 && Math.abs(by.Stepped.vol - 1500) < 0.01 && by.Stepped.simplified, 'Stepped there: 500 m2 gross, 1500 m3, shape simplified', JSON.stringify(by.Stepped));
  await bim.evaluate(() => { const d = document.querySelector('[data-eg58-details]'); d.open = true; d.scrollIntoView(); });
  await bim.waitForSelector('[data-massopt-row]');
  const listed = await bim.$$eval('[data-massopt-row] [data-massopt-option]', (n) => n.map((x) => x.textContent));
  ok(listed.join() === 'Bar,Stepped' && await bim.evaluate(() => document.querySelectorAll('[data-massopt-make]').length === 2), 'the Program panel lists both, each with Make current (none is current yet)', listed.join());
  await bim.screenshot({ path: path.join(OUT, 'massing-in-bimcraft.png') });
  ok(bimProblems.length === 0, 'no page errors in BimCraft', bimProblems.slice(0, 3).join(' | '));
  await bim.close();
  ok(/2 massing options sent to BimCraft/.test(await page.evaluate(() => window.modelcraft.ui.msg.textContent)), 'ModelCraft says two options were sent');

  console.log('== Save as IFC (one selected group)');
  await page.evaluate(() => { const m = window.modelcraft; const id = [...m.model.root.insts.keys()][0]; m.host.sel = [{ t: 'i', id }]; });
  await page.click('[data-export-menu] > summary');
  await page.click('[data-export-menu] [data-act="massing"]');
  await page.waitForSelector('[data-ms-dialog][open]');
  const nrows = (await read()).length;
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('[data-ms-save]')]);
  const file = path.join(OUT, dl.suggestedFilename()); await dl.saveAs(file);
  const text = fs.readFileSync(file, 'utf8');
  const n = (re) => (text.match(re) || []).length;
  ok(/-massing\.ifc$/.test(dl.suggestedFilename()) && n(/=IFCBUILDINGELEMENTPROXY\(/g) === nrows && n(/'CadCraft_SiteMass'/g) === nrows && n(/'OptionSet'/g) === nrows && /FILE_SCHEMA\(\('IFC4'\)\)/.test(text), 'Save as IFC downloads ' + dl.suggestedFilename() + ' with ' + nrows + ' mass' + (nrows === 1 ? '' : 'es') + ' (the selection, when the page lets the test select)');
  ok(n(/=IFCSPACE\(/g) === (nrows === 1 ? 3 : 6), 'and a floor space per floor');
  ok(problems.length === 0, 'no console errors in ModelCraft', problems.slice(0, 3).join(' | '));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e));
} finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
