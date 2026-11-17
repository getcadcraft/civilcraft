// SPDX-License-Identifier: Apache-2.0
// Super: the window's own look and manners (owner 2026-11-12, a .dwg open in SuperCad): its panels read at the size of the app inside, the Home / Build / More tools
// line is one slim row, a name is asked in a modal (never prompt()), overlays cast a shadow (Settings turns it off), and a tool panel put in the middle is called out.
//   node tools/super-test/window-polish.mjs [--shots <dir>]
import fs from 'node:fs'; import path from 'node:path';
import { start, launch } from './serve.mjs';
const shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : '';
const { url, close } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch({ width: 1975, height: 1084 });
const page = await browser.newPage(); const errors = [], native = []; page.on('pageerror', e => errors.push(String(e.message))); page.on('dialog', d => { native.push(d.type()); d.dismiss(); });
await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(1500);
const no = await page.waitForSelector('.nh-offer [data-k="no"]', { timeout: 2500 }).catch(() => null); if (no) await no.click().catch(() => {});
const drawn = s => page.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent); if (!e) return null; let z = 1; for (let n = e; n; n = n.parentElement) z *= Number(getComputedStyle(n).zoom) || 1; const r = e.getBoundingClientRect(); return { px: parseFloat(getComputedStyle(e).fontSize) * z, top: r.top, h: r.height }; }, s);

/* ---- size: SuperCad's own surfaces read at about 14 px, like the app inside ---- */
for (const s of ['.sc-wstab', '.scd-morebtn', '.sc-tab', '.sc-right .sc-body:not(.sc-app)', '.scpage-tab']) { const d = await drawn(s); ok(d && d.px > 13 && d.px < 14.6, `${s} is drawn at about 14 px on a desktop: ${d && d.px.toFixed(1)}`); }
const st = await drawn('.sc-status'); ok(st && st.px >= 12 && st.px < 14, 'the status line a little smaller: ' + (st && st.px.toFixed(1)));
const appZoom = await page.evaluate(() => { const e = [...document.querySelectorAll('.sc-center .sc-body.sc-app')].find(x => x.offsetParent); let z = 1; for (let n = e; n; n = n.parentElement) z *= Number(getComputedStyle(n).zoom) || 1; return z; });
ok(appZoom === 1, 'a mounted app is never scaled: ' + appZoom);

/* ---- the bar: one slim row, More tools in line with Build ---- */
const bar = await drawn('.sc-root > .sc-bar'), ws = await drawn('.sc-wstab'), more = await drawn('.scd-morebtn');
ok(bar.h < 50, 'the Home / Build / More tools line is under 50 px tall: ' + Math.round(bar.h));
ok(Math.abs(ws.top - more.top) < 1 && Math.abs(ws.h - more.h) < 1 && Math.abs(ws.px - more.px) < .1, 'More tools sits at the same height and size as Build: ' + JSON.stringify([ws, more].map(x => [Math.round(x.top), Math.round(x.h), x.px.toFixed(1)])));

/* ---- a name is asked in our modal ---- */
await page.click('.sc-add');
ok(await page.waitForSelector('[data-sc-ask][open]', { timeout: 3000 }).then(() => true, () => false) && native.length === 0, 'Add a workspace opens a modal, not a browser prompt');
const field = await page.evaluate(() => { const i = document.querySelector('.sc-ask-input'), c = getComputedStyle(i); return { v: i.value, bg: c.backgroundColor, focus: document.activeElement === i, label: document.querySelector('.sc-ask-label').textContent }; });
ok(field.v === 'My workspace' && field.focus && field.bg === 'rgb(255, 255, 255)' && field.label === 'Name of the workspace', 'the field is labelled, white, focused and holds the suggestion: ' + JSON.stringify(field));
if (shots) { fs.mkdirSync(shots, { recursive: true }); await page.screenshot({ path: path.join(shots, 'polish-ask.png') }); }
await page.fill('.sc-ask-input', 'Site visits'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
ok(await page.evaluate(() => [...document.querySelectorAll('.sc-wstab')].some(e => e.textContent.trim() === 'Site visits') && !document.querySelector('[data-sc-ask]')), 'Enter adds the workspace and closes the modal');
const n1 = await page.evaluate(() => document.querySelectorAll('.sc-wstab').length);
await page.click('.sc-add'); await page.waitForSelector('[data-sc-ask][open]'); await page.keyboard.press('Escape'); await page.waitForTimeout(200);
await page.click('.sc-add'); await page.waitForSelector('[data-sc-ask][open]'); await page.fill('.sc-ask-input', '   '); await page.keyboard.press('Enter'); await page.waitForTimeout(200);
ok(await page.evaluate(() => document.querySelectorAll('.sc-wstab').length) === n1, 'Escape or an empty name adds nothing');
await page.click('.sc-wstab:has-text("Build")'); await page.waitForTimeout(300);

/* ---- the count beside a tool group's name sits at the right edge, not against the name ---- */
await page.evaluate(() => { const z = document.querySelector('.sc-left'); if (z.classList.contains('is-folded')) z.querySelector('.sc-fold').click(); }); await page.waitForTimeout(300);
for (const tab of ['', 'Build tools']) {
  if (tab) { await page.evaluate(n => { const t = [...document.querySelectorAll('.sc-left .sc-tab')].find(x => x.textContent.includes(n)); if (t) t.click(); }, tab); await page.waitForTimeout(400); }
  const cs = await page.evaluate(() => [...document.querySelectorAll('.sc-left .sc-count')].filter(e => e.offsetParent).map(e => { const p = e.parentElement, pr = p.getBoundingClientRect(), r = e.getBoundingClientRect(); const name = [...p.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); const range = document.createRange(); range.selectNodeContents(name); const nr = range.getBoundingClientRect(); return { gap: Math.round(r.left - nr.right), toEdge: Math.round(pr.right - r.right), w: Math.round(pr.width) }; }));
  ok(cs.length > 0 && cs.every(c => c.gap >= 8 && c.toEdge < 40), `${tab || 'Core and discipline tools'}: every count is clear of the name and at the right edge: ` + JSON.stringify(cs.slice(0, 3)));
}
/* ---- shadows: on by default, off from Settings ---- */
const shadow = s => page.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent); return e ? getComputedStyle(e).boxShadow : null; }, s);
await page.click('.scd-morebtn'); await page.waitForTimeout(300);
ok((await shadow('.sc-menu.scd-menu')) !== 'none', 'the More tools menu casts a shadow');
if (shots) await page.screenshot({ path: path.join(shots, 'polish-more.png') });
await page.keyboard.press('Escape'); await page.evaluate(() => { const m = [...document.querySelectorAll('.sc-menu.scd-menu')].find(x => x.offsetParent); if (m) document.querySelector('.scd-morebtn').click(); });
await page.click('.sc-center .sc-tabs [data-menu-for]'); await page.waitForTimeout(300);
ok((await shadow('ul.shell-panel-menu')) !== 'none', 'a tab\'s "..." menu casts a shadow');
await page.keyboard.press('Escape'); await page.mouse.click(900, 700); await page.waitForTimeout(200);
await page.evaluate(() => { window.superWindow.formats.show(); });
ok((await shadow('dialog.sc-fmt')) !== 'none', 'a dialog casts a shadow'); await page.click('[data-fmt-close]');
const box = await page.evaluate(() => { const b = document.querySelector('[data-app-settings] [data-sc-shadows]'); return b ? { checked: b.checked, legend: b.closest('fieldset').querySelector('legend').textContent } : null; });
ok(box && box.checked && box.legend === 'Shadows', 'Settings has a Shadows switch, on: ' + JSON.stringify(box));
await page.evaluate(() => { const b = document.querySelector('[data-sc-shadows]'); b.checked = false; b.dispatchEvent(new Event('change', { bubbles: true })); });
await page.click('.scd-morebtn'); await page.waitForTimeout(300);
ok((await shadow('.sc-menu.scd-menu')) === 'none' && await page.evaluate(() => localStorage.getItem('cc-super-shadows') === 'off'), 'switched off, the menu has none and the choice is remembered');
await page.evaluate(() => { document.querySelector('.scd-morebtn').click(); const b = document.querySelector('[data-sc-shadows]'); b.checked = true; b.dispatchEvent(new Event('change', { bubbles: true })); });

/* ---- a tool panel put in the middle: allowed, and called out ---- */
ok(await page.$('[data-sc-cover]') === null, 'no notice while the layout is as it came');
await page.keyboard.press('Escape'); await page.mouse.click(1200, 800); await page.waitForTimeout(200);
await page.evaluate(() => { const z = document.querySelector('.sc-left'); if (z.classList.contains('is-folded')) z.querySelector('.sc-fold').click(); }); await page.waitForTimeout(300);
const moved = await page.evaluate(() => document.querySelector('.sc-left [data-menu-for]').dataset.menuFor);
await page.click(`.sc-left [data-menu-for="${moved}"]`); await page.waitForTimeout(300);
await page.click('ul.shell-panel-menu >> text=/middle/i');
await page.waitForTimeout(400);
const note = await page.evaluate(() => { const n = document.querySelector('[data-sc-cover]'); return n ? { text: n.querySelector('p').textContent, role: n.getAttribute('role'), panel: n.dataset.panel, shadow: getComputedStyle(n).boxShadow !== 'none', buttons: [...n.querySelectorAll('button')].map(b => b.textContent) } : null; });
ok(note && note.role === 'alert' && note.panel === moved && /in the middle/.test(note.text) && note.buttons.join('|') === 'Put it back|Leave it there' && native.length === 0, 'moving a tool panel to the middle shows our notice (no browser alert): ' + JSON.stringify(note) + ' moved=' + moved);
ok(await page.evaluate(id => !!document.querySelector(`.sc-center [data-panel="${id}"], .sc-center [data-menu-for="${id}"]`), moved), 'and the panel IS in the middle: it is allowed');
if (shots) await page.screenshot({ path: path.join(shots, 'polish-cover.png') });
await page.click('[data-cover-back]'); await page.waitForTimeout(400);
ok(await page.evaluate(id => !document.querySelector('[data-sc-cover]') && !!document.querySelector(`.sc-left [data-menu-for="${id}"]`) && !document.querySelector(`.sc-center [data-menu-for="${id}"]`), moved), 'Put it back returns it to the left and closes the notice');
ok(errors.length === 0, 'no page error: ' + errors.join('; '));
await browser.close(); await close();
console.log(`${fail ? 'FAILED' : 'ok'}: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
