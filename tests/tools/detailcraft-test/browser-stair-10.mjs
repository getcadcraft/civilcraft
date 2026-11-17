#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-stair-10.mjs (0.10 SU.1814c): the steel stair generator in DetailCraft in headless Chromium at https://getcadcraft.com/lab/detailcraft. Run as root: like browser-04.mjs it
 * uses `sudo -u www-data php tools/detailcraft-test/admin.php up|down` (the test admin, disabled again at the end). Real clicks and keys:
 *   S -> the Stair tool; tick "Use the steel stair generator" -> its fields (rule set, run, tread type, rails ...); the OSHA rule set; click A/2 at Level 1 -> a steel stair
 *   up to Level 2 (status line, flights, rails); click it -> Properties "Stair ST..": the results, the rule set's sources (an unverified one marked), the cut list table and its CSV
 *   (read back: head, a row per section, a total); the Drawings window lists the stair sheet ST-.. and the flights' assembly sheets; undo takes the stair out in one step.
 * Fails on any console error or native dialog. Screenshots in tmp/shots/detail-10.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(REPO, 'tmp/shots/detail-10'));
const ONLY = new Set((arg('--only', '') || '').split(',').filter(Boolean));
const run = (id) => !ONLY.size || ONLY.has(id);
fs.mkdirSync(OUT, { recursive: true });
const DL = fs.mkdtempSync(path.join(os.tmpdir(), 'dc-stair10-dl-'));

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/detailcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
// host.js opens files with the File System Access picker when there is one; headless runs drive the plain
// <input type=file> instead (Playwright's file chooser), as tools/partcraft-test/browser.mjs does
await ctx.addInitScript(() => { window.showOpenFilePicker = undefined; });
// 0.7 WS.13: CC_WORKSPACE=docked|toolbox runs the suite with that workspace layout on (Settings › Global › Layout)
// (without it: classic, whatever a stored --state remembers)
await ctx.addInitScript((w) => { try { if (w) localStorage.setItem('cc-workspace', w); else localStorage.removeItem('cc-workspace'); } catch (e) { /* no storage: classic */ } }, process.env.CC_WORKSPACE || '');
let page = await ctx.newPage();
// CC_WORKSPACE: after a load, wait until the layout is mounted (it starts once the app has drawn), as a person would see it
const wsSettled = (p) => { if (!process.env.CC_WORKSPACE) return; for (const m of ['goto', 'reload']) { const f = p[m].bind(p); p[m] = async (...a) => { const r = await f(...a); await p.waitForFunction(() => !document.querySelector('[data-detailcraft]') || document.querySelector('main')?.classList.contains('ws-on') || window.matchMedia('(max-width: 760px)').matches, null, { timeout: 30000 }).catch(() => {}); return r; }; }
  // the classic controls a layout hides (its view bar, its toolbar): the layout's own buttons click them (the registry), so do the same;
  // a control in a palette tab not shown (the left panel's own sections sit in the Model tab of the ribbon layout): that tab first
  const prep = async (sel) => {
    const h = typeof sel === 'string' ? await p.$(sel).catch(() => null) : null; if (!h) return false;
    return h.evaluate((e) => {
      const slot = e.closest('.ws-palette-scroll[hidden]');
      const name = slot && [...slot.attributes].map((a) => /^data-ws-(.+)-scroll$/.exec(a.name)?.[1]).find(Boolean);
      if (name) document.querySelector('[data-ws-lower="' + name + '"]')?.click();
      return !!e.closest('.ws-hide');
    }).catch(() => false);
  };
  const click = p.click.bind(p), choose = p.selectOption.bind(p), fill = p.fill.bind(p), check = p.check.bind(p);
  p.click = async (sel, o) => (await prep(sel) ? p.$eval(sel, (e) => e.click()) : click(sel, o));
  p.selectOption = async (sel, v, o) => (await prep(sel) ? p.$eval(sel, (e, x) => { e.value = x; e.dispatchEvent(new Event('change', { bubbles: true })); }, v) : choose(sel, v, o));
  p.fill = async (sel, v, o) => { await prep(sel); return fill(sel, v, o); };
  p.check = async (sel, o) => { await prep(sel); return check(sel, o); };
  // a hidden toolbar button focused and pressed with Enter (the classic keyboard path): the button is clicked, the Enter that follows dropped
  let clicked = false;
  const focus = p.focus.bind(p), press = p.keyboard.press.bind(p.keyboard);
  p.focus = async (sel, o) => { if (await prep(sel)) { clicked = true; return p.$eval(sel, (e) => e.click()); } return focus(sel, o); };
  p.keyboard.press = async (k, o) => { const skip = clicked && k === 'Enter'; clicked = false; return skip ? undefined : press(k, o); };
};
wsSettled(page);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
page.on('dialog', (d) => { problems.push('native dialog: ' + d.message()); d.dismiss(); });

page.on('response', (r) => { if (r.status() === 429) console.log('  note 429 from ' + r.url().slice(0, 90)); });
const dc = (fn, a) => page.evaluate(fn, a);
const settle = () => page.waitForTimeout(150);
/** A toolbar action; one in a closed "More" menu opens it first, as a person would. */
async function act(a) {
  const b = page.locator('.dc-tools [data-act="' + a + '"]').first();
  // CC_WORKSPACE: a layout that hides the toolbar (the ribbon layout) runs the same command through the menu-style registry, the path
  // its ribbon takes (bin/test-app-workspaces.mjs checks the ribbon's buttons themselves)
  if (process.env.CC_WORKSPACE && !(await page.locator('.dc-tools').isVisible())) {
    await page.evaluate((x) => { const btn = document.querySelector('.dc-tools [data-act="' + x + '"]'); const c = window.ccInput.commands.find((k) => document.querySelector(k.sel) === btn); if (c) window.ccInput.run(c.id); else window.detailcraft.act(x); }, a);
    return;
  }
  if (!(await b.isVisible())) await page.locator('.dc-tools details:has([data-act="' + a + '"]) > summary').click();
  await b.click();
}
async function download(action) {
  const [d] = await Promise.all([page.waitForEvent('download'), action()]);
  const f = path.join(DL, d.suggestedFilename());
  await d.saveAs(f);
  return f;
}
async function canvasBox() { return page.locator('[data-canvas]').boundingBox(); }
/** Screen point (page px) of a model point. */
async function at(p) { const s = await dc((pt) => window.detailcraft.nodeScreen(pt), p); const b = await canvasBox(); return { x: b.x + s.x, y: b.y + s.y }; }
async function clickModel(p) { const s = await at(p); await page.mouse.move(s.x, s.y); await settle(); await page.mouse.click(s.x, s.y); await settle(); }
/** A real drag from a to b (page px) in steps, with optional modifier held. */
async function drag(a, b, { shift = false, shot = null } = {}) {
  if (shift) await page.keyboard.down('Shift');
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(a.x + (b.x - a.x) * i / 8, a.y + (b.y - a.y) * i / 8);
  await settle();
  if (shot) await page.screenshot({ path: path.join(OUT, shot) });
  await page.mouse.up();
  if (shift) await page.keyboard.up('Shift');
  await settle();
}
async function freshSample(view = '3d') {
  await page.evaluate(() => window.detailcraft?.model.markSaved()).catch(() => {});   // leaving with unsaved work asks (beforeunload)
  await page.goto(BASE + '/lab/detailcraft?space=paper', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.detailcraft && window.detailcraft.view, null, { timeout: 20000 });
  await dc(() => { localStorage.removeItem('detailcraft.clipboard'); localStorage.removeItem('detailcraft.settings'); });
  await act('sample');
  await page.waitForFunction(() => window.detailcraft.built.parts.length === 25);
  if (view !== '3d') await page.click('[data-view="' + view + '"]');
  await settle();
}
const sel = () => dc(() => window.detailcraft.selected.map((r) => r.kind + ':' + r.id));
const kinds = () => dc(() => { const d = window.detailcraft; const out = {}; for (const r of d.selected) { const k = r.kind === 'member' ? d.model.member(r.id).type : r.kind; out[k] = (out[k] || 0) + 1; } return out; });

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/detailcraft?space=paper', { waitUntil: 'domcontentloaded' });
  ok(page.url().includes('/lab/detailcraft'), 'lab page opens for staff', page.url());

  await freshSample('3d');
  await page.locator('[data-canvas]').focus().catch(() => {});
  await page.keyboard.press('s');
  await settle();
  ok(await page.textContent('[data-props-h]') === 'Place stair', 'S: the Stair tool');
  ok(await page.locator('[data-stair-gen]').count() === 1 && await page.locator('label:has-text("Rule set")').count() === 0, 'the generator switch is there, its fields are not yet');
  await page.locator('[data-stair-gen] input[type="checkbox"]').check();
  await settle();
  ok(await page.locator('label:has-text("Rule set")').count() === 1 && await page.locator('label:has-text("Tread type")').count() === 1 && await page.locator('label:has-text("Handrails")').count() === 1, 'ticked: rule set, tread type and handrails fields appear');
  const ruleSel = page.locator('label:has-text("Rule set") + select');
  const names = await ruleSel.locator('option').allTextContents();
  ok(names.length === 4 && names.some((n) => /OSHA/.test(n)) && names.some((n) => /Approved Document K/.test(n)), 'four rule sets: ' + names.map((n) => n.slice(0, 22)).join(' | '));
  await ruleSel.selectOption({ label: names.find((n) => /OSHA/.test(n)) });
  await settle();
  const railTop = await page.locator('label:has-text("Rail height above the nosings") + input').inputValue();
  ok(railTop === '940', 'choosing OSHA sets the rail height to its 37 in (940 mm): ' + railTop);
  const p = await at([6000, 0, 0]);
  await page.mouse.click(p.x, p.y);
  await settle();
  const st = await dc(() => { const d = window.detailcraft, s = d.model.state.stairs[0]; return { n: d.model.state.stairs.length, gen: s?.gen, rule: s?.rule, rise: s?.rise, parts: d.built.parts.filter((q) => q.stair).length, status: document.querySelector('[data-status]').textContent, problems: d.built.problems.filter((q) => q.ref === s?.id).map((q) => q.text) }; });
  ok(st.n === 1 && st.gen === 1 && st.rule === 'us-osha-1910' && st.rise === 4000, 'clicked A/2: one generator stair, OSHA, up to Level 2 (rise 4000): ' + JSON.stringify({ n: st.n, gen: st.gen, rule: st.rule, rise: st.rise }));
  ok(st.parts > 100, 'it is built into parts: ' + st.parts);
  ok(/Steel stair: \d+ risers of [\d.]+ mm, going [\d.]+ mm, 1 flight\(s\), 0 landing\(s\)/.test(st.status), 'status line: ' + st.status.slice(0, 90));
  ok(st.problems.length === 0, 'no problems for the OSHA stair: ' + JSON.stringify(st.problems));
  await page.keyboard.press('Escape');
  await dc(() => { const d = window.detailcraft; d.setSelection([{ kind: 'stair', id: d.model.state.stairs[0].id }]); });
  await settle();
  ok(/^Stair ST\d$/.test(await page.textContent('[data-props-h]')), 'selected: Properties "' + await page.textContent('[data-props-h]') + '"');
  ok(await page.locator('label:has-text("Rule set") + select').inputValue() === 'us-osha-1910', 'the properties show the stair\'s own rule set');
  const dls = await page.locator('dl.dc-props.dc-block').first().innerText();
  ok(/Risers/.test(dls) && /Flights and landings/.test(dls) && /Steel in the stair/.test(dls) && /kg in \d+ parts/.test(dls), 'results: risers, flights, steel weight (' + dls.replace(/\s+/g, ' ').slice(0, 120) + ')');
  await page.locator('[data-stair-rule] > summary').click();
  const cites = await page.locator('[data-stair-rule]').innerText();
  ok(/1910\.25\(c\)/.test(cites) && /read in the regulation's own text/.test(cites), 'the rule\'s sources are shown with how they were checked');
  await page.locator('[data-stair-cutlist] > summary').click();
  const rows = await page.locator('[data-stair-cutlist] tbody tr').count();
  ok(rows >= 6, 'the cut list table has a row per section and length: ' + rows);
  const csv = await download(() => page.locator('[data-stair-csv]').click());
  const text = fs.readFileSync(csv, 'utf8');
  ok(text.startsWith('Item,Assembly,Part,Section,Length mm,Qty,Each kg,Total kg,Note') && text.trim().split('\n').length === rows + 2 && /Total,[\d.]+/.test(text), 'the CSV: head, ' + rows + ' rows and a total');
  const kg = Number((/Total,([\d.]+)/.exec(text) || [])[1]);
  const steel = await dc(() => window.detailcraft.built.parts.filter((q) => q.stair).reduce((a, q) => a + q.weight, 0));
  ok(Math.abs(kg - steel) < steel * 0.002 + 1, 'the CSV total (' + kg + ' kg) is the weight of the stair\'s parts in the model (' + Math.round(steel * 100) / 100 + ' kg)');
  await page.click('[data-act="fit"]');
  await page.screenshot({ path: path.join(OUT, 'stair-gen-selected.png') });

  await act('drawings');
  await page.waitForSelector('[data-dwg][open]');
  await settle();
  const opts = await page.$$eval('[data-dwg-sheet] option', (o) => o.map((x) => x.textContent));
  ok(opts.some((t) => /^ST-ST\d — Stair ST\d: stringer and tread detail/.test(t)) && opts.filter((t) => /^A-ST\d/.test(t)).length >= 2, 'Drawings lists the stair sheet and the assembly sheets: ' + opts.filter((t) => /ST/.test(t)).join(' | '));
  await page.selectOption('[data-dwg-sheet]', { label: opts.find((t) => /^ST-ST/.test(t)) });
  await settle();
  const inked = await dc(() => { const c = document.querySelector('[data-dwg-canvas]'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let k = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 100) k++; return k; });
  ok(inked > 2000, 'the stair sheet is drawn on the canvas');
  await page.screenshot({ path: path.join(OUT, 'stair-gen-sheet.png') });
  await page.selectOption('[data-dwg-sheet]', { label: opts.find((t) => /^A-ST1/.test(t)) });
  await settle();
  await page.screenshot({ path: path.join(OUT, 'stair-gen-flight-assembly.png') });
  await page.keyboard.press('Escape');
  await settle();

  await page.keyboard.press('Control+z');
  await settle();
  ok(await dc(() => window.detailcraft.model.state.stairs.length) === 0, 'one undo takes the stair out');
  // the plain stair is untouched: the tool without the tick places the old kind
  await page.locator('[data-canvas]').focus().catch(() => {});
  await page.keyboard.press('s');
  await settle();
  ok(await page.locator('[data-stair-gen] input[type="checkbox"]').isChecked() === true, 'the tick is remembered while the page is open');
  await page.locator('[data-stair-gen] input[type="checkbox"]').uncheck();
  await settle();
  const p2 = await at([6000, 0, 0]);
  await page.mouse.click(p2.x, p2.y);
  await settle();
  const old = await dc(() => { const s = window.detailcraft.model.state.stairs[0]; return { gen: s?.gen, n: window.detailcraft.built.parts.filter((q) => q.stair).length }; });
  ok(!old.gen && old.n === 2 + 22, 'unticked: the plain stair (2 stringers + 22 treads), as before');
} catch (err) {
  fail++;
  console.log('  FAIL ' + (err.stack || err.message));
  await page.screenshot({ path: path.join(OUT, 'error.png') }).catch(() => {});
} finally {
  ok(problems.length === 0, 'no console errors, no native dialogs', problems.slice(0, 5).join(' | '));
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down'], { encoding: 'utf8' });
  fs.rmSync(DL, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed (screenshots in ' + OUT + ')');
process.exit(fail ? 1 : 0);
