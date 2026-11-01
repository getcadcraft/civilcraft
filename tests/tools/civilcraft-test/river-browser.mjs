#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * river-browser.mjs — CivilCraft 0.8 SU.957 (session sx-river) in headless Chromium at https://getcadcraft.com/lab/civilcraft:
 * the River tool in Surface › More, drawing a centerline over the sample site, the river's Properties (flow, boundary,
 * sections table, undo), the Water surface profiles dialog (plot, table, CSV), the flood extent on the plan, saving and
 * opening the project again, both themes. Run as root; signs in with a minted session (tag sxr).
 *
 *   node tools/civilcraft-test/river-browser.mjs [--shots <dir>]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const SHOTS = arg('--shots');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 400) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'sxr'], { encoding: 'utf8' }));
admin('up');
const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
try {
  for (const space of ['paper', 'model']) {
    console.log('\n== ' + space);
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
    await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') problems.push(space + ' console: ' + m.text()); });
    page.on('pageerror', (e) => problems.push(space + ' pageerror: ' + e.message));
    await page.goto(BASE + '/lab/civilcraft?space=' + space, { waitUntil: 'networkidle' });
    while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
    await page.waitForFunction(() => window.civilcraft?.project);
    ok(await page.$('[data-cmd="river"]') !== null, 'Surface › More has River');
    await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
    await page.waitForFunction(() => window.civilcraft.project.points.length > 100 && window.civilcraft.project.eg().surface);
    // draw a centerline across the middle of the site, west to east
    const b = await page.evaluate(() => window.civilcraft.project.eg().surface.bounds);
    const cy = (b.minY + b.maxY) / 2, w = b.maxX - b.minX;
    await page.evaluate(() => window.civilcraft.command('river'));
    ok(await page.evaluate(() => document.querySelector('[data-cmd="river"]')?.getAttribute('aria-checked')) === 'true', 'the River tool is on (menu item checked)');
    for (const fx of [0.12, 0.5, 0.88]) {
      const s = await page.evaluate(([x, y]) => window.civilcraft.toScreen(x, y), [b.minX + w * fx, cy + (fx === 0.5 ? (b.maxY - b.minY) * 0.05 : 0)]);
      await page.mouse.click(s.x, s.y);
    }
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => (window.civilcraft.project.state.rivers || []).length === 1);
    const rv = await page.evaluate(() => { const r = window.civilcraft.project.state.rivers[0]; return { n: r.sections.length, units: r.units, pf: r.profiles.length, down: r.profiles[0].down, id: r.id }; });
    ok(rv.n >= 3, `a river with ${rv.n} sections cut from the ground`, rv);
    ok(rv.pf === 1 && rv.down?.type === 'normal' && rv.down.slope > 0, 'one flow profile with a normal-depth boundary to start', rv);
    await page.waitForSelector('[data-river-run]');
    ok(await page.$eval('[data-river-review]', (n) => /review/.test(n.textContent)), 'Properties says the results need an engineer’s review');
    ok(await page.$$eval('[data-river-sections] tbody tr', (n) => n.length) === rv.n, 'the sections table has a row per section');
    // change the flow, undo, redo through Ctrl+Z
    await page.fill('#cv-rv-q-0', '25'); await page.press('#cv-rv-q-0', 'Enter');
    ok(await page.evaluate(() => window.civilcraft.project.state.rivers[0].profiles[0].q) === 25, 'typing a flow changes the profile');
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press('Control+z');
    ok(await page.evaluate(() => window.civilcraft.project.state.rivers[0].profiles[0].q) !== 25, 'Ctrl+Z undoes it');
    await page.keyboard.press('Control+y').catch(() => {});
    await page.evaluate(() => window.civilcraft.select({ kind: 'river', id: window.civilcraft.project.state.rivers[0].id }));
    await page.waitForSelector('#cv-rv-q-0');
    await page.fill('#cv-rv-q-0', '25'); await page.press('#cv-rv-q-0', 'Enter');
    // results
    await page.waitForSelector('[data-river-run]');
    await page.click('[data-river-run]');
    await page.waitForSelector('[data-river-dialog][open] [data-river-plot] svg');
    const res = await page.evaluate(() => ({
      rows: document.querySelectorAll('[data-river-table] tbody tr').length,
      series: [...document.querySelectorAll('[data-river-plot] [data-series]')].map((n) => n.dataset.series).join(),
      review: document.querySelector('[data-river-dialog] [data-river-review]')?.textContent || '',
      wse: [...document.querySelectorAll('[data-river-table] tbody tr')].map((tr) => Number(tr.children[3].textContent)),
      bottom: [...document.querySelectorAll('[data-river-table] tbody tr')].map((tr) => Number(tr.children[2].textContent)),
    }));
    ok(res.rows === rv.n, 'the table has a row per section', res);
    ok(/ws/.test(res.series) && /egl/.test(res.series) && /bed/.test(res.series), 'the plot draws the water surface, energy line and channel bottom', res.series);
    ok(/review/.test(res.review), 'the dialog says it needs an engineer’s review');
    ok(res.wse.every((z, i) => z > res.bottom[i]), 'every water surface is above its channel bottom', res);
    const dl = page.waitForEvent('download');
    await page.click('[data-river-csv]');
    const file = await dl;
    const csv = fs.readFileSync(await file.path(), 'utf8');
    ok(file.suggestedFilename().endsWith('.csv') && csv.split('\r\n').filter(Boolean).length === rv.n + 1, 'CSV: a header and a line per section', file.suggestedFilename());
    const dl2 = page.waitForEvent('download');
    await page.click('[data-river-report]');
    const rep = fs.readFileSync(await (await dl2).path(), 'utf8');
    ok(/engineer's review/.test(rep) && /standard step/.test(rep), 'the report names the method and the review');
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `river-results-${space}.png`) });
    await page.keyboard.press('Escape');
    // flood extent
    await page.check('#cv-rv-extent');
    await page.waitForTimeout(300);
    const say = await page.evaluate(() => document.querySelector('[data-status]')?.textContent || '');
    ok(/Flood extent/.test(say), 'showing the flood extent says the wet area', say);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `river-extent-${space}.png`) });
    // plan output: centreline, cut lines with stations, the flood extent (layers C-WATR-*)
    const sc = await page.evaluate(() => window.civilcraft.rivers.sceneItems().map((i) => [i.layer, i.kind, i.text || '']));
    ok(sc.some((i) => i[0] === 'C-WATR-CNTR') && sc.filter((i) => i[0] === 'C-WATR-SCTN' && i[1] === 'poly').length === rv.n && sc.some((i) => i[0] === 'C-WATR-SCTN' && /^RS \d/.test(i[2])) && sc.some((i) => i[0] === 'C-WATR-FLOD'), 'the scene (plan, PDF, DWG) carries the centreline, every cut line with its station and the flood extent', sc.length);
    // the section editor: drag the left bank, add a levee and an ineffective area, apply, undo
    await page.evaluate(() => document.querySelector('[data-river-xsedit]').scrollIntoView());
    await page.click('[data-river-xsedit]');
    await page.waitForSelector('[data-rve-dialog][open] [data-rve-plot]');
    const b0 = await page.evaluate(() => window.civilcraft.project.state.rivers[0].sections.slice().sort((a, b) => b.rs - a.rs)[0].banks.slice());
    const hb = await page.locator('[data-rve-dialog] .rve-bank').first().boundingBox();
    await page.mouse.move(hb.x + hb.width / 2, hb.y + 40); await page.mouse.down(); await page.mouse.move(hb.x + hb.width / 2 - 25, hb.y + 40, { steps: 5 }); await page.mouse.up();
    const typed = Number(await page.inputValue('[data-rve-bl]'));
    ok(typed < b0[0] - 1e-6, 'dragging the left bank handle changes the typed value', [b0, typed]);
    await page.check('[data-rve-rc]');
    await page.click('[data-rve-add]');
    ok(await page.$$eval('[data-rve-ineff]', (n) => n.length) === 1 && await page.$$eval('[data-rve-ineff-shade]', (n) => n.length) === 1, 'Add an ineffective area: a row and a shaded band on the plot');
    if (SHOTS) await page.locator('[data-rve-dialog]').screenshot({ path: path.join(SHOTS, `river-editor-${space}.png`) });
    await page.fill('[data-rve-it]', '9999'); await page.press('[data-rve-it]', 'Enter');
    await page.click('[data-rve-apply]');
    await page.waitForFunction(() => window.civilcraft.project.state.rivers[0].sections.some((s) => s.levees?.right));
    const sec = await page.evaluate(() => { const s = window.civilcraft.project.state.rivers[0].sections.slice().sort((a, b) => b.rs - a.rs)[0]; return { banks: s.banks, lev: s.levees, ineff: s.ineff, n: s.n.length }; });
    ok(sec.banks[0] < b0[0] - 1e-6 && sec.lev?.right && sec.ineff.length === 1 && sec.ineff[0].trigger === 9999 && sec.n === 3, 'Apply: banks, a right levee and an ineffective area (trigger 9999) saved on the section', sec);
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press('Control+z');
    ok(await page.evaluate(() => !window.civilcraft.project.state.rivers[0].sections.some((s) => s.levees)), 'one Ctrl+Z takes the whole edit back');
    await page.waitForSelector('[data-river-run]');
    // save and open again
    const saved = await page.evaluate(() => JSON.stringify(window.civilcraft.project.toJSON ? window.civilcraft.project.toJSON() : null));
    ok(saved && saved.includes('"rivers"'), 'the project file carries the river');
    if (saved) {
      const back = await page.evaluate((txt) => { const P = window.civilcraft.project.constructor; const p = P.fromJSON(JSON.parse(txt)).project; return (p.state.rivers || []).map((r) => r.sections.length); }, saved);
      ok(back.length === 1 && back[0] === rv.n, 'opened again, the river comes back', back);
    }
    await ctx.close();
  }
  ok(problems.length === 0, 'no console errors', problems);
} finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
