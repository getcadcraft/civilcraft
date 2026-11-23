#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-dimang-imtaar.mjs — DIMANGULAR as one member reported it by email (2026-11-21), in the lab, headless:
 *   1. the angle's text sits centred on the dimension arc (the arc broken round it), not outside the arc;
 *   2. no extension line drawn back along a measured edge when the arc meets it, and an arrowhead at each end of the arc;
 *   3. picking two sides of a polyline (a POLYGON hexagon, an open PLINE) works like picking two LINEs.
 *
 *   node tools/cadcraft-test/browser-dimang-imtaar.mjs [--shots <dir>]      (run as root; test admin cctest+cadcraft@projectz.xyz)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + extra : '')); } };
const near = (a, b, t = 1e-6) => Math.abs(a - b) <= t;

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(200); };
const screen = (x, y) => page.evaluate(([x, y]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); const s = window.cadcraft.view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; }, [x, y]);
const clickAt = async (x, y) => { const p = await screen(x, y); await page.mouse.move(p.x, p.y, { steps: 3 }); await page.mouse.click(p.x, p.y); await page.waitForTimeout(150); };
const history = () => page.evaluate(() => document.querySelector('[data-history]')?.textContent || [...document.querySelectorAll('.cc-history li')].map((li) => li.textContent).join('\n'));
const zoom = (a, b) => page.evaluate(([a, b]) => window.cadcraft.host.zoomWindow(a, b), [a, b]);
const dims = () => page.evaluate(() => [...window.cadcraft.doc.model.values()].filter((e) => e.type === 'dim' && e.kind === 'angular'));
/** The parts an angular dimension draws, from the lab's own dims.js. */
const partsOf = (d) => page.evaluate(async (d) => { const D = await import('/assets/apps/cadcraft/dev/dims.js'); return { text: D.dimText(d), parts: D.dimGeometry(d).map((p) => ({ ...p })) }; }, d);

/** What item 1 and 2 ask of one angular dimension. */
async function checkLook(d, label, want) {
  const { text, parts } = await partsOf(d);
  ok(text === want, `${label}: reads ${want}`, text);
  const R = Math.hypot(d.loc.x - d.c.x, d.loc.y - d.c.y);
  const tx = parts.find((p) => p.type === 'text');
  const tr = tx && Math.hypot(tx.x - d.c.x, tx.y - d.c.y);
  ok(tx && near(tr, R, 1e-6) && tx.va === 'middle', `${label}: the text is centred on the arc (text at ${tr?.toFixed(3)}, arc radius ${R.toFixed(3)})`, JSON.stringify(tx));
  const arcs = parts.filter((p) => p.type === 'arc');
  ok(arcs.length === 2 && arcs.every((a) => /^dim[12]$/.test(a.role)), `${label}: the arc is broken round the text (two pieces)`, JSON.stringify(arcs.map((a) => a.role)));
  ok(!parts.some((p) => /^ext/.test(p.role || '')), `${label}: no extension line along the measured edges`, JSON.stringify(parts.filter((p) => /^ext/.test(p.role || ''))));
  const arrows = parts.filter((p) => /^arrow/.test(p.role || '') && p.type === 'hatch');
  ok(arrows.length === 2 && arrows.every((a) => near(Math.hypot(a.tip.x - d.c.x, a.tip.y - d.c.y), R, 1e-6)), `${label}: an arrowhead at each end of the arc`, String(arrows.length));
}

try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.setItem('cadcraft.tour', 'skipped'); localStorage.removeItem('cadcraft.settings'); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);

  // the drawing in the report: two lines at 60°, a hexagon (POLYGON), plus an open polyline with a right angle
  const H = { cx: 300, cy: 50, r: 50 };
  await page.evaluate(({ H }) => {
    const { doc } = window.cadcraft;
    doc.change('seed', () => {
      doc.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 100, y2: 0 });
      doc.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 50, y2: 50 * Math.sqrt(3) });
      doc.add({ type: 'poly', layer: '0', closed: false, pts: [{ x: 450, y: 0, b: 0 }, { x: 550, y: 0, b: 0 }, { x: 550, y: 100, b: 0 }] });
    });
  }, { H });
  await typeCmd('POLYGON'); await typeCmd('6'); await typeCmd(`${H.cx},${H.cy}`); await typeCmd('I'); await typeCmd(`#${H.cx + H.r},${H.cy}`);
  const hex = await page.evaluate(() => [...window.cadcraft.doc.model.values()].find((e) => e.type === 'poly' && e.closed));
  ok(hex && hex.pts.length === 6, 'POLYGON 6 makes a closed hexagon polyline', JSON.stringify(hex?.pts));
  await typeCmd('DIMSCALE'); await typeCmd('3');
  await zoom({ x: -30, y: -40 }, { x: 600, y: 140 });

  console.log('\n== two lines (the 60° in the report)');
  await typeCmd('DIMANGULAR');
  await clickAt(70, 0); await clickAt(35, 35 * Math.sqrt(3));
  await clickAt(70 * Math.cos(Math.PI / 6), 70 * Math.sin(Math.PI / 6));
  let ds = await dims();
  ok(ds.length === 1, 'DIMANGULAR between two lines makes one angular dimension', String(ds.length));
  if (ds[0]) await checkLook(ds[0], 'lines', '60°');

  console.log('\n== two sides of a polyline (the 120° in the report)');
  const before = (await history()).length;
  const P = hex.pts, mid = (i) => [(P[i].x + P[(i + 1) % 6].x) / 2, (P[i].y + P[(i + 1) % 6].y) / 2];
  // the sides either side of the top-left corner, as in the picture
  const k = P.reduce((b, p, i) => (p.y > P[b].y + 1e-9 || (near(p.y, P[b].y, 1e-9) && p.x < P[b].x) ? i : b), 0);
  const v = P[k], s1 = (k + 5) % 6, s2 = k;
  await typeCmd('DIMANGULAR');
  await clickAt(...mid(s1)); await clickAt(...mid(s2));
  await clickAt(v.x + (H.cx - v.x) * 0.45, v.y + (H.cy - v.y) * 0.45);
  const said = (await history()).slice(before);
  ds = await dims();
  ok(ds.length === 2, 'picking one side of the hexagon, then the next side, makes the dimension (no vertex / 3-point detour)', said.slice(-300));
  ok(!said.includes('Pick an arc, circle or line.') && !said.includes('Pick a second, different line.'), 'no "Pick an arc, circle or line" refusal for the polyline', said.slice(-300));
  if (ds[1]) {
    ok(near(ds[1].c.x, v.x, 1e-6) && near(ds[1].c.y, v.y, 1e-6), 'the vertex is the hexagon corner between the two sides', JSON.stringify(ds[1].c));
    await checkLook(ds[1], 'hexagon', '120°');
  }

  console.log('\n== an open polyline, and the same side twice');
  await typeCmd('DIMANGULAR');
  await clickAt(500, 0);
  await clickAt(510, 0);   // the same side again: refused, asks again
  const again = await page.evaluate(() => window.cadcraft.engine.running);
  ok(again === 'DIMANGULAR' && (await dims()).length === 2, 'the same polyline side twice is refused and the command asks for another', String(again));
  await clickAt(550, 50); await clickAt(530, 20);
  ds = await dims();
  ok(ds.length === 3 && ds[2] && (await partsOf(ds[2])).text === '90°', 'two sides of an open polyline: 90°', ds[2] && (await partsOf(ds[2])).text);

  console.log('\n== Angular text: the option for where the text sits (owner 2026-11-21)');
  {
    const d0 = (await dims())[0];
    const look = async (atxt) => {
      const d = atxt === undefined ? d0 : { ...d0, st: { ...(d0.st || {}), atxt } };
      const { parts } = await partsOf(d);
      const R = Math.hypot(d.loc.x - d.c.x, d.loc.y - d.c.y), tx = parts.find((p) => p.type === 'text');
      return { r: Math.hypot(tx.x - d.c.x, tx.y - d.c.y), R, arcs: parts.filter((p) => p.type === 'arc').length };
    };
    let L = await look(undefined);
    ok(near(L.r, L.R) && L.arcs === 2, 'a dimension with no setting (older drawings): on the arc', JSON.stringify(L));
    L = await look(1);
    ok(L.r > L.R + 1e-6 && L.arcs === 1, 'Outside the arc: the text beyond the arc, the arc whole (the earlier placement)', JSON.stringify(L));
    L = await look(2);
    ok(L.r < L.R - 1e-6 && L.arcs === 1, 'Inside the arc: the text inside the arc, the arc whole', JSON.stringify(L));
    // the Properties panel: select the 60° dimension, change Angular text
    await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), d0.id);
    await page.waitForTimeout(400);
    const ctl = await page.evaluate(() => {
      const lab = [...document.querySelectorAll('[data-props] label, [data-props] th, [data-props] td, [data-props] span')].find((x) => x.textContent.trim() === 'Angular text');
      const row = lab?.closest('tr, .cc-prop, div'); const sel = (lab?.htmlFor && document.getElementById(lab.htmlFor)) || row?.querySelector('select');
      if (!sel) return null; sel.dataset.atxtTest = '1';
      return { opts: [...sel.options].map((o) => o.textContent), value: sel.value };
    });
    ok(ctl && ctl.opts.join('|') === 'On the arc|Outside the arc|Inside the arc' && /^(k:)?0$/.test(ctl.value), 'Properties shows Angular text for an angle dimension: On the arc / Outside the arc / Inside the arc', JSON.stringify(ctl));
    if (ctl) {
      await page.evaluate(() => { const sel = document.querySelector('select[data-atxt-test]'); const o = [...sel.options].find((x) => x.textContent === 'Outside the arc'); sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); }); await page.waitForTimeout(300);
      const now = await page.evaluate((id) => window.cadcraft.doc.get(id), d0.id);
      ok((now.st?.atxt | 0) === 1, 'choosing Outside the arc there stores it on the dimension', JSON.stringify(now.st));
      if ((now.st?.atxt | 0) === 1) { const { parts } = await partsOf(now); const tx = parts.find((p) => p.type === 'text'); ok(Math.hypot(tx.x - now.c.x, tx.y - now.c.y) > Math.hypot(now.loc.x - now.c.x, now.loc.y - now.c.y), 'and the drawing shows the text outside the arc'); }
      await zoom({ x: -15, y: -15 }, { x: 110, y: 95 }); await page.waitForTimeout(300); await shot('dimang-04-outside-option');
      await page.evaluate(() => window.cadcraft.host.setSelection(new Set()));
    }
  }

  ok(problems.length === 0, 'no console errors', problems.join(' | '));

  await zoom({ x: -15, y: -15 }, { x: 110, y: 95 }); await page.waitForTimeout(300); await shot('dimang-01-lines-60');
  await zoom({ x: 230, y: -10 }, { x: 370, y: 110 }); await page.waitForTimeout(300); await shot('dimang-02-hexagon-120');
  await zoom({ x: 440, y: -15 }, { x: 570, y: 110 }); await page.waitForTimeout(300); await shot('dimang-03-open-polyline-90');
  await zoom({ x: -30, y: -40 }, { x: 600, y: 140 }); await page.waitForTimeout(300); await shot('dimang-00-all');
} catch (err) {
  fail++; console.log('  FAIL ' + (err?.stack || err));
  await shot('dimang-error');
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
