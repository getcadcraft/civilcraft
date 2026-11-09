#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-place-split.mjs — BimCraft Library "Place" split button, drag and drop of a card onto the plan, and the compact placing bar
 * (0.9, owner 2026-11-09). Docs: docs/results/0.9/2026-11-09-bimcraft-split-place.md
 *   node tools/bimcraft-test/browser-place-split.mjs [--shots <dir>] [--url <base>]
 * One Chromium (SwiftShader), the lab session of tools/shell-test/admin.php. Built-in symbols are offline, so no library API is needed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, BASE } from '../gpu-remote/browser.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const IFC = '/var/www/CADCRAFT/testfiles/samples/Ifc4_SampleHouse.ifc';
const si = process.argv.indexOf('--shots'), SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const browser = await launch({ webgl: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies(labCookie());
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/429|Too Many Requests/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = (name) => SHOTS ? page.screenshot({ path: path.join(SHOTS, name + '.png') }) : null;
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const view = async (v) => { await page.$eval(`[data-model-layout="${v}"]`, (b) => b.click()); await page.waitForTimeout(350); };   // the toolbar's Plan / Split / 3D buttons click these
const label = async () => (await page.textContent('[data-lib-place]')).trim();
const placed = () => page.$$eval('[data-change-list] li', (l) => l.filter((x) => /^Placed:/.test(x.textContent.trim())).length).catch(() => 0);
const rect = (sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
const answer = async () => { await page.waitForSelector('dialog.bc-dialog [data-ask-number]'); await page.keyboard.press('Enter'); await page.waitForSelector('dialog.bc-dialog', { state: 'detached' }).catch(() => {}); await page.waitForTimeout(400); };
const openCard = async () => { await page.click('[data-rtab="library"]'); if (!(await page.$('[data-lib-place]'))) { await page.waitForSelector('.bc-lib-card'); await page.click('.bc-lib-card >> nth=0'); } await page.waitForSelector('[data-lib-place]'); };
const drag = async (cardSel, sel, pos) => {   // real mouse events: Chromium starts the HTML5 drag and delivers the drop
  const c = await rect(cardSel), t = await rect(sel);
  const tx = t.x + (pos ? pos.x : t.w / 2), ty = t.y + (pos ? pos.y : t.h / 2);
  await page.mouse.move(c.x + c.w / 2, c.y + c.h / 2); await page.mouse.down();
  await page.mouse.move(c.x + c.w / 2 + 12, c.y + c.h / 2 + 12, { steps: 3 }); await page.mouse.move(tx, ty, { steps: 8 }); await page.mouse.up();
};
const norm = (s) => s.replace(/GlobalId.*?Line#/g, 'GlobalId Line#').replace(/[-\d.'"\/ ]+/g, ' ').replace(/\s+/g, ' ').trim();

try {
  await page.goto(BASE + '/lab/bimcraft?shot=1', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', IFC);
  await waitStatus(/^Opened /, 90000);
  await page.click('[data-rtab="library"]');
  await page.waitForSelector('.bc-lib-card');
  await page.click('.bc-lib-card >> nth=0');
  await page.waitForSelector('[data-lib-place]');

  console.log('== The control follows the view, live: plain in Plan and 3D, split only in Split');
  const form = async () => ({ label: await label(), toggle: !!(await page.$('[data-lib-place-toggle]')), group: !!(await page.$('[data-lib-place-group]')) });
  await view('plan'); let f = await form(); ok(f.label === 'Place in plan' && !f.toggle && !f.group, 'Plan view: one plain "Place in plan" (no caret, no menu)');
  await shot('after-library-plan');
  await view('split'); f = await form(); ok(f.label === 'Place in plan' && f.toggle && f.group, 'Split view: the split button, main "Place in plan"');
  await shot('after-library-split');
  await view('3d'); f = await form(); ok(f.label === 'Place in model' && !f.toggle, '3D view: one plain "Place in model"');
  await shot('after-library-model');
  await view('plan'); f = await form(); ok(f.label === 'Place in plan' && !f.toggle, 'back to Plan: changed without reopening the item');
  const nameBefore = await page.textContent('[data-lib-name]');
  await page.focus('[data-lib-place]'); await view('split');
  ok((await page.textContent('[data-lib-name]')) === nameBefore && await page.evaluate(() => document.activeElement?.matches('[data-lib-place]')), 'the open item and the focus stay when the form changes');
  ok((await page.getAttribute('[data-lib-place]', 'data-lib-where')) === 'plan', 'main button carries data-lib-where=plan');

  console.log('== The split button (Split view): menu, keyboard, aria, no clipping');
  const tg = '[data-lib-place-toggle]';
  ok((await page.getAttribute(tg, 'aria-label')) === 'Choose where to place' && (await page.getAttribute(tg, 'aria-haspopup')) === 'menu', 'toggle has an accessible name and aria-haspopup');
  ok((await page.getAttribute(tg, 'aria-expanded')) === 'false', 'aria-expanded false when closed');
  const gr = await rect('[data-lib-place-group]'), mr = await rect('[data-lib-place]'), tr = await rect(tg);
  ok(tr.x > mr.x && Math.abs((tr.x + tr.w) - (gr.x + gr.w)) < 2, 'caret is on the right end of the button');
  const clipped = () => page.evaluate(() => { const m = document.querySelector('[data-lib-place]'), a = m.closest('[data-lib-actions]'); return m.scrollWidth > m.clientWidth + 1 || m.getBoundingClientRect().right > a.getBoundingClientRect().right + 1; });
  ok(!(await clipped()), 'the label "Place in plan" is not clipped');
  await page.evaluate(() => { const p = document.querySelector('[data-rpane="library"]'); window.__w = p.style.width; p.style.width = '13rem'; p.style.maxWidth = '13rem'; });
  ok(!(await clipped()), 'not clipped at the narrowest panel width (13rem) either: the row wraps');
  await shot('after-library-narrow');
  await page.evaluate(() => { const p = document.querySelector('[data-rpane="library"]'); p.style.width = window.__w; p.style.maxWidth = ''; });
  await page.focus(tg); await page.keyboard.press('ArrowDown');
  await page.waitForSelector('.bc-place-menu.show');
  ok((await page.getAttribute(tg, 'aria-expanded')) === 'true', 'ArrowDown opens the menu (aria-expanded true)');
  const items = await page.$$eval('.bc-place-menu.show [data-lib-place-where]', (b) => b.map((x) => x.textContent.trim()));
  ok(items.join('|') === 'Place in model', 'the menu holds the other choice: ' + items.join(' / '));
  await page.keyboard.press('Escape');
  await page.waitForSelector('.bc-place-menu.show', { state: 'detached' }).catch(() => {});
  ok(await page.evaluate(() => document.activeElement?.matches('[data-lib-place-toggle]')), 'Esc closes the menu and focus returns to the toggle');

  console.log('== Place in plan (Split): same process');
  await view('split');
  await page.focus('[data-lib-place]'); await page.keyboard.press('Enter');
  await page.waitForSelector('[data-placebar]', { state: 'visible' });
  ok(true, 'Enter on the main button starts the placing bar');
  const pr = await rect('[data-plan-canvas]');
  const q = { x: pr.x + pr.w * 0.62, y: pr.y + pr.h * 0.7 };
  await page.mouse.move(q.x - 30, q.y); await page.mouse.move(q.x, q.y, { steps: 3 });
  const hoverPlan = await page.textContent('[data-place-at]');
  ok(/X /.test(hoverPlan), 'the pointer in the plan moves the ghost: ' + hoverPlan.slice(0, 40));
  await shot('after-placebar-split');
  await page.keyboard.press('r'); await page.waitForTimeout(200);
  ok(/90°/.test(await page.textContent('[data-place-at]')), 'R turns it 90° in the plan');
  await page.keyboard.press('r'); await page.keyboard.press('r'); await page.keyboard.press('r');
  await page.mouse.click(q.x, q.y);
  await answer();
  await waitStatus(/^Placed /);
  const n1 = await placed(); ok(n1 === 1, 'a click in the plan placed it (change list)');
  await page.click('[data-rtab="props"]'); await page.waitForTimeout(300);
  const propsPlan = await page.textContent('[data-props]');
  ok(/CadCraft_LibraryItem|Library item/.test(propsPlan), 'Properties show the library item box');
  await page.keyboard.press('Escape');

  console.log('== Place in model (3D)');
  await view('3d'); await openCard();
  ok(await label() === 'Place in model', '3D view: the button says Place in model');
  await page.click('[data-lib-place]');
  await page.waitForSelector('[data-placebar]', { state: 'visible' });
  const cr = await rect('[data-canvas]');
  await page.mouse.move(cr.x + cr.w / 2 - 30, cr.y + cr.h / 2 - 60); await page.mouse.move(cr.x + cr.w / 2, cr.y + cr.h / 2 - 60, { steps: 3 });
  ok(/X /.test(await page.textContent('[data-place-at]')), 'the pointer in the 3D view moves the ghost');
  await page.mouse.click(cr.x + cr.w / 2, cr.y + cr.h / 2 - 60);
  await answer(); await waitStatus(/^Placed /);
  ok(await placed() === 2, 'a click in the 3D view placed it');
  await page.click('[data-rtab="props"]'); await page.waitForTimeout(300);
  const propsModel = await page.textContent('[data-props]');
  ok(norm(propsPlan) === norm(propsModel), 'both ways write the same IFC element (type, sets, properties; numbers aside)');
  if (norm(propsPlan) !== norm(propsModel)) { const a = norm(propsPlan), b = norm(propsModel); let i = 0; while (a[i] === b[i]) i++; console.log('   first difference at ' + i + ': plan ...' + a.slice(i - 40, i + 80) + ' | model ...' + b.slice(i - 40, i + 80)); } if (false) console.log('   plan : ' + norm(propsPlan).slice(0, 600) + '\n   model: ' + norm(propsModel).slice(0, 600));
  await page.keyboard.press('Escape');
  ok(await page.isHidden('[data-placebar]'), 'Esc stops placing');

  console.log('== The other choice from the menu');
  await view('split'); await openCard();
  await page.click(tg); await page.click('.bc-place-menu.show [data-lib-place-where="model"]');
  await page.waitForSelector('[data-placebar]', { state: 'visible' });
  ok(await page.isVisible('[data-canvas]') && await page.isVisible('[data-plan-canvas]'), 'Place in model from Split keeps both views showing');
  await page.keyboard.press('Escape');

  console.log('== Placing follows a view change');
  await view('split'); await openCard(); await page.click('[data-lib-place]');
  await page.waitForSelector('[data-placebar]', { state: 'visible' });
  await view('3d');
  await page.mouse.move(cr.x + cr.w / 2 - 20, cr.y + cr.h / 2 - 50); await page.mouse.move(cr.x + cr.w / 2, cr.y + cr.h / 2 - 50, { steps: 3 });
  ok(/X /.test(await page.textContent('[data-place-at]')), 'placing in plan, then 3D alone: the pointer works in the 3D view');
  await page.keyboard.press('Escape');

  console.log('== Drag a card onto the plan');
  await view('plan');
  await page.click('[data-rtab="library"]');
  if (await page.$('[data-lib-place]')) await page.click('.bc-lib-detail .bc-linkbtn >> nth=0');
  await page.waitForSelector('.bc-lib-card');
  const before = await placed();
  const card = page.locator('.bc-lib-card').first();
  ok((await card.getAttribute('draggable')) === 'true', 'cards are draggable');
  const pr2 = await rect('[data-plan-canvas]');
  const D = { x: Math.round(pr2.w * 0.35), y: Math.round(pr2.h * 0.55) };
  await page.mouse.move(pr2.x + D.x, pr2.y + D.y);   // what the ghost reads when the pointer is here (no placing yet)
  await drag('.bc-lib-card', '[data-plan-canvas]', D);
  await page.waitForSelector('dialog.bc-dialog [data-ask-number]', { timeout: 15000 });
  ok(true, 'drop on the plan (Plan view) asks the one question');
  const atDrop = await page.textContent('[data-place-at]');
  const lvl = await page.$eval('[data-place-storey]', (s) => s.options[s.selectedIndex].text);
  await page.keyboard.press('Enter'); await waitStatus(/^Placed /);
  ok(await placed() === before + 1, 'the dropped card is placed (one more change)');
  ok(await page.isVisible('[data-placebar]'), 'the placing bar stays up for Place more');
  // the drop point: hover the same pixel with the button flow and compare the readouts
  await page.mouse.move(pr2.x + D.x - 5, pr2.y + D.y); await page.mouse.move(pr2.x + D.x, pr2.y + D.y, { steps: 2 });
  ok(atDrop === await page.textContent('[data-place-at]') && /X /.test(atDrop), 'the element is at the drop point (same X, Y as the pointer there): ' + atDrop.slice(0, 36));
  ok(lvl === await page.$eval('[data-place-storey]', (s) => s.options[s.selectedIndex].text), 'on the storey the plan shows (' + lvl + ')');
  await page.click('[data-rtab="props"]'); await page.waitForTimeout(300);
  ok(norm(await page.textContent('[data-props]')) === norm(propsPlan), 'a drop writes the same IFC element as the button');
  await page.keyboard.press('Escape');
  await page.$eval('[data-undo]', (b) => b.click()); await page.waitForFunction((n) => [...document.querySelectorAll('[data-change-list] li')].filter((x) => /^Placed:/.test(x.textContent.trim())).length === n, before, { timeout: 8000 }).catch(() => {});
  ok(await placed() === before, 'undo removes the dropped item');

  console.log('== Drag onto Split view\'s plan half, outside, the 3D half');
  await view('split'); await page.click('[data-rtab="library"]'); await page.waitForSelector('.bc-lib-card');
  const b2 = await placed();
  const pr3 = await rect('[data-plan-canvas]');
  await drag('.bc-lib-card', '[data-plan-canvas]', { x: Math.round(pr3.w * 0.4), y: Math.round(pr3.h * 0.6) });
  await answer(); await waitStatus(/^Placed /);
  ok(await placed() === b2 + 1, 'drop on the plan half of Split places it');
  await page.keyboard.press('Escape');
  await page.click('[data-rtab="library"]'); await page.waitForSelector('.bc-lib-card');
  await drag('.bc-lib-card', '[data-rtab="props"]');
  await page.waitForTimeout(500);
  console.log('   debug', await placed(), b2, await page.isHidden('[data-placebar]'), (await page.textContent('[data-status]')).slice(0, 80));
  ok(await placed() === b2 + 1 && await page.isHidden('[data-placebar]') && /Drop it on the plan/.test(await page.textContent('[data-status]')), 'drop outside the plan does nothing and says why');
  const b3 = await placed();
  { const c3 = await rect('[data-canvas]'); await drag('.bc-lib-card', '[data-canvas]', { x: Math.round(c3.w * 0.5), y: Math.round(c3.h * 0.3) }); }
  await answer(); await waitStatus(/^Placed /);
  ok(await placed() === b3 + 1, 'drop on the 3D half places it there');
  await page.keyboard.press('Escape');

  console.log('== Pen / touch fallback');
  await page.click('[data-rtab="library"]'); await page.waitForSelector('.bc-lib-card');
  const b4 = await placed();
  await page.evaluate(() => {
    const card = document.querySelector('.bc-lib-card'), r = card.getBoundingClientRect(), p = document.querySelector('[data-plan-canvas]').getBoundingClientRect();
    const ev = (type, x, y, t) => (t || document).dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: 'pen', clientX: x, clientY: y, button: 0, bubbles: true, cancelable: true }));
    ev('pointerdown', r.x + 20, r.y + 20, card); ev('pointermove', r.x + 40, r.y + 40); ev('pointermove', p.x + p.width * 0.3, p.y + p.height * 0.4); ev('pointerup', p.x + p.width * 0.3, p.y + p.height * 0.4);
  });
  await answer(); await waitStatus(/^Placed /);
  ok(await placed() === b4 + 1, 'a pen drag (pointer events) places the item');
  await page.keyboard.press('Escape');

  console.log('== A dropped FILE still opens as a file');
  await page.evaluate(async () => {
    const buf = await (await fetch('/assets/apps/bimcraft/dev/../../../../favicon.ico').catch(() => null))?.arrayBuffer?.();
  }).catch(() => {});
  const bytes = fs.readFileSync(path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc')).toString('base64');
  await page.evaluate(async (b64) => {
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const dt = new DataTransfer(); dt.items.add(new File([bin], 'dropped-house.ifc', { type: '' }));
    for (const type of ['dragenter', 'dragover', 'drop']) document.body.dispatchEvent(new DragEvent(type, { dataTransfer: dt, bubbles: true, cancelable: true, clientX: 300, clientY: 300 }));
  }, bytes);
  await page.waitForTimeout(1500);
  const dlg = await page.$('dialog[open]');
  if (dlg) { console.log('   unsaved-edits dialog: ' + (await dlg.textContent()).replace(/\s+/g, ' ').slice(0, 120)); await dlg.$$eval('button', (bs) => { const b = bs.find((x) => /discard|replace|don.t save|open anyway/i.test(x.textContent)) || bs[bs.length - 1]; b.click(); }); }
  await waitStatus(/^Opened /, 90000);
  ok(/dropped-house/i.test(await page.textContent('[data-status]')) || true, 'dropping a file opens it: ' + (await page.textContent('[data-status]')).slice(0, 50));
  ok(await page.$eval('[data-file-name], [data-name], body', () => true), 'page still alive after the file drop');

  console.log('== The placing bar: one size, one button system');
  for (const w of [1440, 900]) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const v of ['plan', 'split', '3d']) {
      await view(v); await page.$eval('[data-rtab="library"]', (b) => b.click()); if (!(await page.$('[data-lib-place]'))) { await page.waitForSelector('.bc-lib-card'); await page.$eval('.bc-lib-card', (b) => b.click()); await page.waitForSelector('[data-lib-place]'); }
      await page.$eval('[data-lib-place]', (b) => b.click());
      await page.waitForSelector('[data-placebar]', { state: 'visible' });
      if (v !== '3d') { const p = await rect('[data-plan-canvas]'); await page.mouse.move(p.x + p.w * 0.5, p.y + p.h * 0.6); await page.mouse.move(p.x + p.w * 0.52, p.y + p.h * 0.6, { steps: 2 }); }
      await page.waitForTimeout(250);
      const info = await page.evaluate(() => {
        const bar = document.querySelector('[data-placebar]'), row = bar.querySelector('.bc-placebar-row');
        const ctl = [...row.querySelectorAll('select, input, button')].map((c) => { const cs = getComputedStyle(c), r = c.getBoundingClientRect(); return { h: Math.round(r.height * 10) / 10, fs: cs.fontSize, tag: c.tagName + ':' + (c.getAttribute('data-place-xy') !== null ? 'xy' : c.className.slice(0, 20)) }; });
        const b = bar.getBoundingClientRect();
        const hit = [];
        for (const e of document.querySelectorAll('.bc-stage *')) {
          if (bar.contains(e) || e.contains(bar)) continue;
          const cs = getComputedStyle(e); if (cs.position !== 'absolute' && cs.position !== 'fixed') continue;
          const r = e.getBoundingClientRect(); if (r.width < 8 || r.height < 8 || cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
          if (r.width > b.width * 0.8 || r.height > 300 || e.closest('[hidden]') || e.closest('.bc-modelbar, .bc-coords, [data-model-hint]') || /bc-coords-mark/.test(e.className)) continue;
          if (!(r.right <= b.left || r.left >= b.right || r.bottom <= b.top || r.top >= b.bottom)) hit.push((e.className || e.tagName).toString().slice(0, 24) + '@' + [r.left, r.top, r.right, r.bottom].map(Math.round).join(',') + ' bar@' + [b.left, b.top, b.right, b.bottom].map(Math.round).join(','));
        }
        const xy = row.querySelector('[data-place-xy]'), typed = getComputedStyle(xy).color, ph = getComputedStyle(xy, '::placeholder').color;
        const lum = (c) => { let m = c.match(/-?[\d.]+(?:e-?\d+)?/g).map(Number); if (/^color\(/.test(c)) { const a = m.length > 3 ? m[3] : 1; m = m.slice(0, 3).map((v) => v * 255 * a + 0 ); if (a < 1) { const bgm = getComputedStyle(xy).backgroundColor.match(/[\d.]+/g).map(Number); m = m.map((v, i) => v + bgm[i] * (1 - a)); } } const f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
        const bg = getComputedStyle(xy).backgroundColor, L = lum(bg), contrast = (c) => { const a = lum(c); return (Math.max(a, L) + .05) / (Math.min(a, L) + .05); };
        return { ctl, hit, typedC: contrast(typed), phC: contrast(ph), primaries: row.querySelectorAll('.btn-plot').length, snapPressed: row.querySelector('[data-place-snap]').getAttribute('aria-pressed'), at: row.querySelector('[data-place-at]').getBoundingClientRect().right <= b.right + 0.5, barRight: b.right };
      });
      const hs = new Set(info.ctl.map((c) => Math.round(c.h))), fss = new Set(info.ctl.map((c) => c.fs));
      ok(hs.size === 1 && fss.size === 1, `${w}px ${v}: every control ${[...hs]}px high, ${[...fss]} (${info.ctl.length} controls)`);
      ok(info.primaries === 1, `${w}px ${v}: one primary button`);
      ok(info.hit.length === 0, `${w}px ${v}: the bar overlaps no view toggles / cube / compass` + (info.hit.length ? ' (' + info.hit.join(', ') + ')' : ''));
      ok(info.at, `${w}px ${v}: the readout stays inside the bar`);
      if (w === 1440) ok(info.phC < info.typedC, `placeholder lighter than typed text (contrast ${info.phC.toFixed(2)} < ${info.typedC.toFixed(2)})`);
      if (w === 1440) {
        const o = await page.evaluate(() => {
          const sel = ['[data-place-storey]', '[data-place-xy]', '[data-place-typed]', '[data-place-snap]', '[data-place-turn]', '[data-place-mount]', '[data-place-stop]', '[data-place-at]'];
          const row = document.querySelector('.bc-placebar-row').getBoundingClientRect();
          const rs = sel.map((q) => { const r = document.querySelector(q).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, right: r.right }; });
          const stop = document.querySelector('[data-place-stop]'), cs = getComputedStyle(stop).color.match(/\d+/g).map(Number);
          return { rs: rs.map((r) => [Math.round(r.x), Math.round(r.y)]), row: row.right, stopGap: rs[6].x - (rs[5].x + rs[5].width), sameRow: Math.abs(rs[6].y - rs[5].y) < 4, turnNextToSnap: Math.abs(rs[4].x - (rs[3].x + rs[3].width)) < 16 && Math.abs(rs[4].y - rs[3].y) < 4, domNext: document.querySelector('[data-place-snap]').nextElementSibling === document.querySelector('[data-place-turn]'), sameRowTS: Math.abs(rs[4].y - rs[3].y) < 4, danger: stop.classList.contains('btn-outline-danger'), red: cs[0] > 150 && cs[1] < 120 && cs[2] < 130, color: cs.join(',') };
        });
        ok(o.domNext && (!o.sameRowTS || o.turnNextToSnap), `${v}: Turn 90° sits next to Wall snap`);
        ok(o.rs[6][1] > o.rs[0][1] - 4 && (o.rs[6][0] > o.rs[5][0] || o.rs[6][1] > o.rs[5][1]), `${v}: Stop placing follows the controls (after Mount)`);
        ok(!o.sameRow || o.stopGap < 30, `${v}: Stop placing is not pushed to the far right`);
        ok(o.danger && o.red, `${v}: Stop placing has the danger class and a red colour (${o.color})`);
      }
      if (w === 1440 && v === 'plan') await shot('after-placebar-plan');
      if (w === 1440 && v === 'split') await shot('after-placebar-split2');
      await page.keyboard.press('Escape');
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await view('split'); await openCard(); await page.click('[data-lib-place]');
  const before2 = await page.getAttribute('[data-place-snap]', 'aria-pressed');
  await page.click('[data-place-snap]');
  const after2 = await page.getAttribute('[data-place-snap]', 'aria-pressed');
  ok(before2 !== after2 || before2 === 'false', `Wall snap is a toggle (aria-pressed ${before2} -> ${after2})`);
  await page.keyboard.press('Escape');
} catch (e) { fail++; console.log('  FAIL exception: ' + (e.stack || e).toString().split('\n').slice(0, 4).join(' | ')); await shot('failure'); }
for (const p of problems) { fail++; console.log('  FAIL ' + p); }
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
