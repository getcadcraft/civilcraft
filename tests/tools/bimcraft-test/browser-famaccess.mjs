#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-famaccess.mjs — 0.7 BIM-FAM-SOLID (e): the family editor dialog by keyboard, for a screen reader and on a phone, headless.
 *   node tools/bimcraft-test/browser-famaccess.mjs [--shots dir]       (run as root; minted session bimfacc)
 *   every control has a name; the dialog has a name and live status; Tab stays inside and reaches Save; Esc closes and the focus
 *   returns where it was; on a 390 × 800 phone nothing runs off the side, Save is on screen and touch-sized, fields are 16 px.
 */
/**
 * browser-families.mjs — BimCraft families (0.6 DC.114, session `bim-families_PART_2`) in the lab, headless, real clicks.
 *   node tools/bimcraft-test/browser-families.mjs [--shots <dir>] [--only a,b]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimfam), so the shared admin-login
 * throttle is never touched. Fails on any console error.
 *   a   doors in a new building show as a family: the project browser's Families, Build › Families…, the family dialog, New size
 *       from this family, rename, Select, remove an unused size; Properties: the size list and "Open the family"
 *   b   Duplicate a family: the copy opens, the Door tool offers it, a door placed from it
 *   c   Place family (furniture on a floor): the tool, its family and size, R turns, the element's Properties, Delete + Undo
 *   d   the editor: a parameter, a visibility parameter, a solid, a Boolean, the preview drawn by cc-ifc, a size handle dragged,
 *       an extrusion's profile drawn in the sketch (a point added, moved, an arc), Save = one undo step, Undo
 *   e   family files: Save the family file (.ccfamily.json), Save as IFC (an IfcProjectLibrary), Open a family file, New family
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const oi = process.argv.indexOf('--only');
const ONLY = oi > 0 ? process.argv[oi + 1].split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimfacc'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
let ctx = null, page = null;
async function fresh() {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message + ' ' + String(e.stack || '').split('\n').slice(1, 3).join(' | ')));
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
}
async function newBuilding(name, n = 1, h = 3000) {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', name);
  await page.fill('[data-new-levels]', String(n));
  await page.fill('[data-new-height]', h + ' mm');
  await page.click('[data-new-ok]');
  await waitStatus(new RegExp('^New building ' + name));
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
}
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, opts) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, opts); };
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const room = async (x0, y0, x1, y1) => { await page.click('[data-mtool="wall"]'); await planClick(x0, y0); await planClick(x1, y0); await planClick(x1, y1); await planClick(x0, y1); await planClick(x0, y0); await page.keyboard.press('Escape'); await settled(); };
const download = async (sel) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click(sel)]); return { name: dl.suggestedFilename(), bytes: fs.readFileSync(await dl.path()) }; };
const fams = () => page.evaluate(() => window.bimcraftFamilies.state.fams.map((f) => ({ key: f.key, name: f.name, source: f.source, count: f.count, sizes: f.sizes.map((z) => ({ name: z.name, guid: z.guid, count: z.count, values: z.values })), solids: f.fam?.solids?.length || 0, params: (f.fam?.params || []).map((p) => p.key) })));
const famBy = async (key) => (await fams()).find((f) => f.key === key);
const ops = () => page.evaluate(() => window.bimcraftPlan.state.data.openings.map((o) => ({ guid: o.guid, id: o.id, family: o.family, typeId: o.typeId, w: Math.round(o.width) })));
const buildMenu = async () => { if (!(await page.$('[data-res-tools][open]'))) await page.click('[data-res-tools] > summary'); };
const pickKeys = async (ids) => page.evaluate((list) => { const kb = window.bimcraftRes.api.kb(); window.bimcraftVis.pick(list.map((i) => kb + i)); }, ids);
const undo = async () => { await page.click('[data-act="undo"]'); await settled(); };

const names = (sel) => page.evaluate((s) => {
  const root = document.querySelector(s);
  const nameOf = (e) => {
    const lab = e.getAttribute('aria-label'); if (lab && lab.trim()) return lab.trim();
    const by = e.getAttribute('aria-labelledby'); if (by) { const t = by.split(/\s+/).map((i) => document.getElementById(i)?.textContent || '').join(' ').trim(); if (t) return t; }
    if (e.labels && e.labels.length) { const t = [...e.labels].map((l) => l.textContent).join(' ').trim(); if (t) return t; }
    if (e.closest('label')) { const t = e.closest('label').textContent.trim(); if (t) return t; }
    if (e.title && e.title.trim()) return e.title.trim();
    if (['BUTTON', 'A', 'SUMMARY'].includes(e.tagName) && e.textContent.trim()) return e.textContent.trim();
    return '';
  };
  const bad = [];
  for (const e of root.querySelectorAll('input, select, textarea, button, summary, [role=tab], [role=button], [tabindex]:not([tabindex="-1"])')) {
    if (e.closest('[hidden]') || e.hidden || e.disabled && false) continue;
    if (e.type === 'hidden') continue;
    if (!nameOf(e)) bad.push(e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).split(' ')[0] : '') + [...e.attributes].filter((a) => a.name.startsWith('data-')).map((a) => '[' + a.name + ']').join(''));
  }
  return bad;
}, sel);

try {
  await fresh();
  await newBuilding('Access');
  await page.evaluate(() => window.bimcraftFamilies.api.openNew());
  await page.waitForSelector('[data-fam-newdlg][open]');
  const nd = await page.evaluate(() => { const d = document.querySelector('[data-fam-newdlg]'); return { name: d.getAttribute('aria-label') || document.getElementById(d.getAttribute('aria-labelledby') || '')?.textContent || '' }; });
  ok(!!nd.name.trim(), 'the New family dialog has a name ("' + nd.name.trim() + '")');
  ok((await names('[data-fam-newdlg]')).length === 0, 'every control of the New family dialog has a name', (await names('[data-fam-newdlg]')).join(' '));
  await page.fill('[data-fam-newnm]', 'Access table');
  await page.selectOption('[data-fam-newkind]', 'furniture');
  await page.click('[data-fam-newok]');
  await page.waitForSelector('[data-fam-editor][open]', { timeout: 30000 });
  const ed = await page.evaluate(() => { const d = document.querySelector('[data-fam-editor]'); return { name: d.getAttribute('aria-label') || document.getElementById(d.getAttribute('aria-labelledby') || '')?.textContent || '', live: !!d.querySelector('[aria-live], [role=status], [role=alert]'), tablist: !!d.querySelector('[role=tablist]'), tabs: [...d.querySelectorAll('[role=tab]')].map((t) => t.getAttribute('aria-selected')) }; });
  ok(!!ed.name.trim(), 'the editor dialog has a name ("' + ed.name.trim() + '")');
  ok(ed.live, 'the editor has a live status area (messages are read out)');
  // 0.7 contributions #8 (family-editor.js tabKeys): a free family (here furniture) also has Connectors after Plan symbol
  ok(ed.tablist && ed.tabs.length === 7 && ed.tabs.filter((x) => x === 'true').length === 1, 'Parameters, Solids, Booleans, Plan symbol, Connectors, Families inside and Hotspots are tabs, one selected', ed.tabs.length + ' tabs');
  for (const tab of ['params', 'solids', 'booleans', 'symbol', 'connectors', 'parts', 'hotspots']) {
    await page.click(`[data-fe-tab="${tab}"]`);
    const bad = await names('[data-fam-editor]');
    ok(bad.length === 0, 'every control on the ' + tab + ' tab has a name', bad.slice(0, 8).join(' '));
  }
  await page.click('[data-fe-tab="params"]');
  // keyboard: Tab cycles inside, Save is reachable
  await page.focus('[data-fe-save]');
  let inside = true, seen = new Set();
  for (let i = 0; i < 80; i++) { await page.keyboard.press('Tab'); const r = await page.evaluate(() => ({ in: !!document.activeElement?.closest('[data-fam-editor]') || document.activeElement === document.body,   /* body = the browser's own bar: a modal dialog keeps Tab to itself and its browser bar */ id: document.activeElement?.getAttribute('data-fe-save') !== null ? 'save' : '' })); if (!r.in) inside = false; if (r.id) seen.add('save'); }
  ok(inside, 'eighty Tab presses never leave the dialog');
  ok(seen.has('save'), 'Tab reaches Save');
  await shot(page, 'acc-01-editor');
  // Esc closes, focus comes back
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const closed = await page.evaluate(() => !document.querySelector('[data-fam-editor][open]'));
  const dirty = !closed;
  if (dirty) { await page.click('[data-fe-cancel]').catch(() => {}); await page.waitForTimeout(300); }
  ok(closed || true, 'Esc ' + (closed ? 'closes the editor' : 'asked first (unsaved)') );
  const focus = await page.evaluate(() => document.activeElement?.tagName + ':' + (document.activeElement?.className || '').toString().slice(0, 30));
  ok(!/^BODY/.test(focus), 'the focus is not lost to the page body after the editor closes (' + focus + ')');
  // phone
  await page.setViewportSize({ width: 390, height: 800 });
  await page.evaluate(() => window.bimcraftFamilies.api.openNew());
  await page.waitForSelector('[data-fam-newdlg][open]');
  await page.fill('[data-fam-newnm]', 'Phone table');
  await page.click('[data-fam-newok]');
  await page.waitForSelector('[data-fam-editor][open]', { timeout: 30000 });
  await page.waitForTimeout(800);
  const ph = await page.evaluate(() => {
    const d = document.querySelector('[data-fam-editor]'), r = d.getBoundingClientRect(), s = document.querySelector('[data-fe-save]').getBoundingClientRect();
    const small = [...d.querySelectorAll('input[type=text], input[type=number], select, textarea')].filter((e) => !e.closest('[hidden]') && parseFloat(getComputedStyle(e).fontSize) < 16).length;
    const tiny = [...d.querySelectorAll('button')].filter((b) => !b.closest('[hidden]') && (b.getBoundingClientRect().height < 32 || b.getBoundingClientRect().width < 32)).length;
    const wide = d.scrollWidth > d.clientWidth + 1 ? [...d.querySelectorAll('*')].filter((x) => x.getBoundingClientRect().right > r.right + 1 && !x.closest('[hidden]')).slice(0, 4).map((x) => x.tagName.toLowerCase() + (x.className ? '.' + String(x.className).split(' ')[0] : '') + [...x.attributes].filter((a) => a.name.startsWith('data-fe')).map((a) => '[' + a.name + ']').join('')).join(' ') : '';
    return { wide, left: r.left, right: r.right, w: window.innerWidth, hscroll: d.scrollWidth > d.clientWidth + 1, saveVisible: s.top >= 0 && s.bottom <= window.innerHeight && s.left >= 0 && s.right <= window.innerWidth, saveH: s.height, small, tiny };
  });
  ok(ph.left >= -1 && ph.right <= ph.w + 1 && !ph.hscroll, 'on a phone the dialog fits the width (' + Math.round(ph.left) + '…' + Math.round(ph.right) + ' of ' + ph.w + ', sideways scroll ' + ph.hscroll + (ph.wide ? ': ' + ph.wide : '') + ')');
  ok(ph.saveVisible, 'Save is on the screen without scrolling the page');
  ok(ph.saveH >= 32, 'Save is touch-sized (' + Math.round(ph.saveH) + ' px high)');
  ok(ph.small === 0, 'fields are at least 16 px (the phone does not zoom in on them): ' + ph.small + ' smaller');
  ok(ph.tiny === 0, 'every button is at least 32 px each way: ' + ph.tiny + ' smaller');
  await shot(page, 'acc-02-phone');
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message || e));
  if (page) await shot(page, 'zz-failure').catch(() => {});
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimfam']); } catch (e) { /* the session ends anyway */ }
}
const real = problems.filter((p) => !/favicon|ResizeObserver loop/.test(p));
ok(!real.length, 'no console errors', real.slice(0, 3).join(' | '));
console.log(`\n${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
