#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-units09.mjs — BimCraft GH.3-A "one display unit everywhere" (0.9, session units-gh3a-09) in /lab, headless, real clicks.
 *   node tools/bimcraft-test/browser-units09.mjs [--shots <dir>]
 * Mints a session with tools/shell-test/admin.php session (as browser-gh3ui.mjs). Fails on any console error.
 * The toolbar's unit pick is switched through all six units (feet-inches, inches, decimal feet, mm, cm, m) and each time:
 *   house (fixtures/showcase/bimcraft-house.ifc): the pointer coordinates readout, a Measure result, the section bar's unit and
 *     bounds, the View range dialog's scale list (metric 1:n or imperial 1/4" = 1'-0")
 *   frame (DetailCraft's sample written to IFC, as tools/frame/browser.mjs): the Analysis tab after Run — the deflection column's
 *     unit and numbers, a load's From/To in the load list, the reactions' points, the From label of the load form.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const APP = path.join(REPO, 'public_html/assets/apps/bimcraft/dev');
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const U = await import(pathToFileURL(path.join(APP, 'model-units.js')).href);
const UNITS = ['ftin', 'in', 'ftdec', 'mm', 'cm', 'm'];
// the unit beside a length in the pick (feet-inches carries ' and ")
const MARK = { ftin: /\d['"]/, in: /\d\s?in\b/, ftdec: /\d\s?ft\b/, mm: /\d\s?mm\b/, cm: /\d\s?cm\b/, m: /\d\s?m\b(?![²³/])/ };
const OTHER = { ftin: /\d\s?(mm|cm)\b|\d\s?m\b(?![²³/])/, in: /\d\s?(mm|cm|ft)\b|\d\s?m\b(?![²³/])|\d['"]/, ftdec: /\d\s?(mm|cm|in)\b|\d\s?m\b(?![²³/])|\d['"]/, mm: /\d\s?(cm|in|ft)\b|\d\s?m\b(?![²³/])|\d['"]/, cm: /\d\s?(mm|in|ft)\b|\d\s?m\b(?![²³/])|\d['"]/, m: /\d\s?(mm|cm|in|ft)\b|\d['"]/ };

// DetailCraft's sample frame as an IFC, by DetailCraft's own writer (as tools/frame/browser.mjs)
const DC = path.join(REPO, 'public_html/assets/apps/detailcraft/dev');
const dl = (f) => import(pathToFileURL(path.join(DC, f)).href);
(await dl('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(DC, 'lang/en.json'), 'utf8')) });
const tmp = fs.mkdtempSync(path.join(REPO, 'tmp/units09-'));
const frameIfc = path.join(tmp, 'Frame sample.ifc');
{
  const { sampleModel } = await dl('sample.js'), { writeIfc } = await dl('ifc.js'), { build } = await dl('build.js'), { markParts, markFootings } = await dl('marks.js'), { bendingSchedule } = await dl('rebar.js');
  const st = sampleModel().state || sampleModel(), built = build(st), marks = markParts(built, { perPhase: false });
  marks.footingMark = markFootings(st.footings, { perPhase: false });
  fs.writeFileSync(frameIfc, writeIfc(st, built, marks, bendingSchedule(st.footings), { now: new Date('2026-10-16T00:00:00Z') }));
}

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
let ctx = null, page = null;
async function fresh() {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const [cn, ...cv] = String(minted.cookie).split('=');
  await ctx.addCookies([{ name: cn, value: cv.join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
}
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return !s || (!s.busy && !s.reloading && !s.queue.length); }, null, { timeout: 90000 });
// the toolbar's pick, as a person changes it (the select fires change)
const setUnit = async (u) => {
  await page.evaluate((u) => { const s = document.querySelector('[data-model-units]'); s.value = u; s.dispatchEvent(new Event('change', { bubbles: true })); }, u);
  await settled(); await page.waitForTimeout(150);
};

try {
  console.log('== house: coordinates, Measure, section bar, scale list');
  await fresh();
  await page.setInputFiles('[data-file]', { name: 'bimcraft-house.ifc', mimeType: 'application/x-step', buffer: fs.readFileSync(path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc')) });
  await waitStatus(/^Opened bimcraft-house/, 30000);
  ok(await page.evaluate(() => [...document.querySelector('[data-model-units]').options].map((o) => o.value).sort().join()) === [...UNITS].sort().join(), 'the toolbar offers the six units');
  // a measurement made once (two surface points), its text re-said in each unit
  await page.evaluate(() => window.bimcraftMeasure.on());
  const pts = await page.evaluate(() => {
    const v = document.querySelector('[data-canvas]').viewer, r = document.querySelector('[data-canvas]').getBoundingClientRect(), out = [];
    for (let fy = 0.35; fy < 0.8; fy += 0.07) for (let fx = 0.25; fx < 0.8; fx += 0.07) { const x = r.left + r.width * fx, y = r.top + r.height * fy, h = v.measureAt(x, y); if (h && h.snap === 'face') out.push({ x, y, p: h.point }); }
    return out;
  });
  let best = null;
  for (const a of pts) for (const b of pts) { const d = Math.hypot(b.p[0] - a.p[0], b.p[1] - a.p[1], b.p[2] - a.p[2]); if (d > 1 && (!best || d > best.d)) best = { a, b, d }; }
  if (best) { await page.mouse.move(best.a.x, best.a.y); await page.mouse.click(best.a.x, best.a.y); await page.mouse.move(best.b.x, best.b.y, { steps: 3 }); await page.mouse.click(best.b.x, best.b.y); }
  ok(!!best && (await page.evaluate(() => window.bimcraftMeasure.state()?.items.length)) === 1, 'Measure: one distance between two surface points');
  await page.evaluate(() => window.bimcraftSection.set({ axis: 'top' }));
  await page.waitForSelector('[data-sectionbar]:not([hidden])').catch(() => {});
  const SEC = { ftin: 'ft–in', in: 'in', ftdec: 'ft', mm: 'mm', cm: 'cm', m: 'm' };
  for (const u of UNITS) {
    await setUnit(u);
    const m = await page.evaluate(() => window.bimcraftMeasure.state()?.items[0]?.text || '');
    ok(MARK[u].test(m) && !OTHER[u].test(m), u + ': Measure says ' + m.slice(0, 90));
    const sec = await page.evaluate(() => ({ unit: document.querySelector('[data-sec-unit]')?.textContent || '', bar: document.querySelector('[data-sectionbar]')?.innerText || '' }));
    ok(sec.unit === SEC[u] && !OTHER[u].test(sec.bar), u + ': section bar unit "' + sec.unit + '"', sec.bar.replace(/\s+/g, ' ').slice(0, 100));
    // the coordinates readout under the pointer (model X, Y, Z in the pick; feet-inches as 12'-6")
    const r = await page.evaluate(() => { const b = document.querySelector('[data-canvas]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
    await page.mouse.move(r[0] + 3, r[1] + 3); await page.mouse.move(r[0], r[1], { steps: 2 }); await page.waitForTimeout(120);
    const co = await page.evaluate(() => document.querySelector('[data-coords]')?.textContent || '');
    ok(MARK[u].test(co) && !OTHER[u].test(co), u + ': coordinates readout ' + co.replace(/\s+/g, ' ').slice(0, 90));
  }
  await page.evaluate(() => { window.bimcraftSection.set(null); window.bimcraftMeasure.off(); });
  await shot(page, 'units09-house');
  // the sheet scale family: the View range dialog's Scale list (needs the building plan)
  await page.click('[data-model-toggle]').catch(() => {});
  await page.waitForSelector('[data-plan-wrap]:not([hidden])', { timeout: 30000 }).catch(() => {});
  await settled();
  const guid = await page.evaluate(() => window.bimcraftPlan?.state?.data?.levels?.[0]?.guid || '');
  for (const u of UNITS) {
    await setUnit(u);
    let opts = [];
    if (guid) {
      await page.click(`[data-pb-range="${guid}"]`).catch(() => {});
      await page.waitForSelector('[data-pv-dialog][open]', { timeout: 10000 }).catch(() => {});
      opts = await page.$$eval('[data-pv-scale] option', (o) => o.map((x) => x.textContent.trim())).catch(() => []);
      await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    }
    const metric = ['mm', 'cm', 'm'].includes(u);
    const fam = opts.slice(1);
    ok(fam.length > 3 && (metric ? fam.every((s) => /^1:\d+$/.test(s)) : fam.some((s) => /= 1'-0"/.test(s))), u + ': scale list is the ' + (metric ? 'metric (1:n)' : 'imperial') + ' family: ' + fam.slice(0, 4).join(', '));
  }

  console.log('== frame: the Analysis tab follows the pick');
  await fresh();
  await page.setInputFiles('[data-file]', frameIfc);
  await waitStatus(/^Opened /, 60000);
  await page.click('[data-rtab="analysis"]');
  await page.waitForSelector('[data-fa-run]');
  await page.click('[data-fa-run]');
  await page.waitForSelector('[data-fa-table]');
  // a load from 1 m to 2 m typed in metres
  await setUnit('m');
  await page.click('[data-fa-table] tbody tr:first-child button');
  await page.waitForFunction(() => !document.querySelector('[data-fa-load-add]')?.disabled, null, { timeout: 10000 });
  const fromLabel = await page.evaluate(() => document.querySelector('[data-fa-load="a"]')?.closest('label')?.textContent || '');
  ok(/From \(m, blank = start\)/.test(fromLabel), 'm: the load form asks "From (m, …)": ' + fromLabel.trim());
  await page.fill('[data-fa-load="value"]', '10');
  await page.fill('[data-fa-load="a"]', '1');
  await page.fill('[data-fa-load="b"]', '2');
  await page.click('[data-fa-load-add]');
  await waitStatus(/Load added/, 10000);
  await page.click('[data-fa-run]');
  await page.waitForSelector('[data-fa-table]');
  const DEF = { ftin: 'in', in: 'in', ftdec: 'in', mm: 'mm', cm: 'cm', m: 'm' };
  const DIG = { ftin: 3, in: 3, ftdec: 3, mm: 2, cm: 3, m: 5 };
  let mmDefl = null;
  for (const u of ['mm', ...UNITS.filter((x) => x !== 'mm')]) {
    await setUnit(u);
    await page.waitForSelector('[data-fa-table]');
    const s = await page.evaluate(() => {
      const tb = document.querySelector('[data-fa-table]'), heads = [...tb.querySelectorAll('thead th')].map((h) => h.textContent);
      const k = heads.findIndex((h) => /^Deflection/.test(h));
      return { head: heads[k] || '', cells: [...tb.querySelectorAll('tbody tr')].map((r) => r.children[k]?.textContent || ''),
        loads: [...document.querySelectorAll('table')].map((x) => x.innerText).join('\n').split('\n').filter((l) => /kN\/m/.test(l)).join(' | '),
        at: [...document.querySelectorAll('[data-fa-reactions] tbody tr')].map((r) => r.children[0].textContent),
        from: document.querySelector('[data-fa-load="a"]')?.closest('label')?.textContent || '' };
    });
    if (u === 'mm') mmDefl = s.cells.map(Number);
    const conv = s.cells.map(Number), f = { mm: 1, cm: 10, m: 1000, in: 25.4, ftin: 25.4, ftdec: 25.4 }[u];
    const same = mmDefl && conv.every((v, i) => Math.abs(v * f - mmDefl[i]) <= Math.max(0.02, f * 10 ** -DIG[u]));
    ok(s.head === 'Deflection (' + DEF[u] + ')' && s.cells.every((c) => new RegExp('^-?\\d+\\.\\d{' + DIG[u] + '}$').test(c)) && same, u + ': deflection column "' + s.head + '", ' + s.cells.slice(0, 3).join(', ') + ' (same as the mm column)');
    const L = U.lengthHooks(u);
    const want = 'from ' + L.text(1000) + ' to ' + L.text(2000);
    ok(s.loads.includes(want), u + ': the load list says "' + want + '"', s.loads.slice(0, 120));
    const ptMark = { ftin: ') ft', in: ') in', ftdec: ') ft', mm: ') mm', cm: ') cm', m: ') m' }[u];
    ok(s.at.length > 0 && s.at.every((a) => a.endsWith(ptMark)), u + ': reactions at ' + s.at.slice(0, 2).join(' · '));
    ok(s.from.includes('From (' + L.mark() + ','), u + ': load form label ' + s.from.trim());
  }
  await shot(page, 'units09-frame');

  console.log('== the shell\'s Problems panel words lengths in the pick');
  // a problem worded from a key (as Model checks, What breaks first and add-ons send them): "the narrowest door … is 800 mm; the rule asks for 850 mm"
  await page.evaluate(() => { const s = window.ccProblems.source({ id: 'test.units09', kind: 'engine', label: 'units09' }); s.set([{ id: 'u09-door', code: 'u09.door', severity: 'warning', msg: { key: 'breakit.p.route', vars: { subject: 'Door D1', width: 800, need: 850, door: 'D1' } }, about: [] }]); window.ccProblems.open({ focus: false }); });
  for (const u of UNITS) {
    await setUnit(u);
    await page.waitForTimeout(250);
    const row = await page.evaluate(() => [...document.querySelectorAll('[data-problems-list] [data-problem]')].map((r) => r.innerText).find((x) => /Door D1/.test(x)) || '');
    const want = 'is ' + U.lenMark(800, u);
    ok(row.includes(want) && !OTHER[u].test(row), u + ': Problems row says "' + want + '"', row.replace(/\s+/g, ' ').slice(0, 120));
  }
} finally {
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
