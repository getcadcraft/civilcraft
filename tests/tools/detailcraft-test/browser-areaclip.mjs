#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-areaclip.mjs — 0.8 D8.15 in the real app: a copied area (MarkupCraft's Copy area clip in localStorage
 * "cadcraft.areaclip") pasted with Ctrl+V as a reference picture at true size, drawn under the steel, selected, dragged in
 * Plan, deleted and undone, kept in the file; DetailCraft's own newer copy wins Ctrl+V; a picture pasted through the
 * browser's paste event uses the clip's size only when its pixels match; paper size and overlay opacity; no console errors.
 *
 *   node tools/detailcraft-test/browser-areaclip.mjs [--shots <dir>]      (root: a signed-in lab session)
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
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const lab = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' })).cookie.split('=');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const dc = (fn, arg) => page.evaluate(fn, arg);
const status = () => page.locator('[data-status]').first().textContent().catch(() => dc(() => document.querySelector('.dc-status, [role=status]')?.textContent || ''));
const pics = () => dc(() => JSON.parse(JSON.stringify(window.detailcraft.model.state.pictures || [])));

// a clip as MarkupCraft's Copy area writes it: a w × h PNG drawn on a canvas, `at` = now
const putClip = (o) => dc((o) => {
  const c = document.createElement('canvas'); c.width = o.w; c.height = o.h;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, o.w, o.h); g.strokeStyle = '#d0312d'; g.lineWidth = 4; g.strokeRect(10, 10, o.w - 20, o.h - 20);
  g.beginPath(); g.moveTo(0, 0); g.lineTo(o.w, o.h); g.stroke();
  localStorage.setItem('cadcraft.areaclip', JSON.stringify({ format: 'cadcraft-area-clip', v: 1, app: 'markupcraft', source: 'S-201.pdf', sheet: 'S-201', label: o.label, at: new Date(Date.now() + 50).toISOString(),
    src: c.toDataURL('image/png'), ptPerPx: 0.5, real: o.real ? { mmPerPx: o.real, unit: 'mm' } : null, overlay: o.overlay ? { opacity: o.overlay, tint: '' } : null, shape: 'rect' }));
}, o);
// a paste event as the browser's Edit menu sends one, carrying a w × h PNG
const pasteEvent = (w, h) => dc(async ([w, h]) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
  const dt = new DataTransfer(); dt.items.add(new File([blob], 'image.png', { type: 'image/png' }));
  document.body.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  await new Promise((r) => setTimeout(r, 300));
}, [w, h]);

try {
  await page.context().addCookies([{ name: lab[0], value: lab.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(`${BASE}/lab/detailcraft?space=paper`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.detailcraft, null, { timeout: 15000 });
  await dc(() => { localStorage.removeItem('cadcraft.areaclip'); localStorage.removeItem('detailcraft.clipboard'); });
  await dc(() => { const m = window.detailcraft.model; m.change('x', (tx) => {
    tx.addMember({ type: 'column', profile: 'W10x49', material: 'A992', position: 'middle', rotation: 0, start: [0, 0, 0], end: [0, 0, 4000], phase: 1 });
    tx.addMember({ type: 'beam', profile: 'W16x26', material: 'A992', position: 'top', rotation: 0, start: [0, 0, 4000], end: [6000, 0, 4000], phase: 1 }); }); });
  const beam = await dc(() => window.detailcraft.model.state.members[1].id);
  // DetailCraft's copy first, then the area: the area is newer
  await dc((id) => { window.detailcraft.setSelection([{ kind: 'member', id }]); window.detailcraft.act('copy'); window.detailcraft.setSelection([]); }, beam);
  await page.waitForTimeout(30);
  await putClip({ w: 400, h: 200, real: 12.5, label: 'Second floor framing' });
  await dc(() => { window.detailcraft.setView('plan'); window.detailcraft.setTool('select'); });   // the Select tool turns on dragging (a fresh page has it off until a tool is chosen)
  await page.locator('canvas').first().click({ position: { x: 5, y: 5 } }).catch(() => {});
  await dc(() => window.detailcraft.setSelection([]));
  await page.keyboard.press('Control+V');
  await page.waitForFunction(() => (window.detailcraft.model.state.pictures || []).length === 1, null, { timeout: 3000 }).catch(() => {});
  let p = await pics();
  ok(p.length === 1, 'Ctrl+V with the area copied last: one picture');
  ok(p[0] && p[0].mmPerPx === 12.5 && p[0].size === 'real' && p[0].opacity === 1, 'true size: 12.5 mm per pixel (5000 × 2500 mm)');
  const lvName = await dc(() => document.querySelector('[data-vlevel], select[name="vlevel"]')?.value || '');
  ok(p[0] && [0, 4000].includes(p[0].z), 'lies on the plan\'s level (z ' + (p[0] && p[0].z) + (lvName ? ', ' + lvName : '') + ')');
  ok(await dc(() => window.detailcraft.selected.length === 1 && window.detailcraft.selected[0].kind === 'picture'), 'the pasted picture is selected');
  const said = await dc(() => document.body.innerText.includes('true size'));
  ok(said, 'the status bar says true size');
  ok(await dc(() => window.detailcraft.tool === 'select'), 'the parts paste did not start (the area won)');
  ok(await dc(() => window.detailcraft.model.undoStack.length > 0 && !window.detailcraft.model.undoStack.some((u) => u.before.includes('data:image'))), 'the PNG is not in the undo snapshots');
  // drawn under everything: a textured plane with no depth writes, picked after the steel
  await page.waitForTimeout(300);
  const drawn = await dc(() => { const m = window.detailcraft.view.pickables.find((x) => x.userData.ref?.kind === 'picture'); return m ? { order: m.renderOrder, depth: m.material.depthWrite, img: !!m.material.map?.image, op: m.material.opacity } : null; });
  ok(drawn && drawn.order < 0 && drawn.depth === false && drawn.img, 'drawn as a textured plane under the steel (renderOrder < 0, no depth writes, image loaded)');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'detailcraft-areaclip-plan.png') });
  // the Properties panel
  ok(await page.locator('text=Reference picture').first().isVisible(), 'Properties: Reference picture');
  // drag it in Plan
  const before = p[0];
  // a point on the picture clear of the steel (a quarter in from its lower-left corner)
  const at = await dc((q) => { const v = window.detailcraft.view, r = v.canvas.getBoundingClientRect(), w = q.px[0] * q.mmPerPx, h = q.px[1] * q.mmPerPx;
    const s = v.toScreen([q.x - w / 4, q.y - h / 4, q.z]); return { x: r.left + s.x, y: r.top + s.y }; }, before);
  await page.mouse.move(at.x, at.y); await page.mouse.down();
  await page.mouse.move(at.x + 40, at.y + 10, { steps: 6 }); await page.mouse.move(at.x + 80, at.y + 20, { steps: 6 });
  await page.mouse.up();
  p = await pics();
  ok(p[0] && (p[0].x !== before.x || p[0].y !== before.y) && p[0].z === before.z, 'dragged across the level (' + (p[0] && [Math.round(p[0].x - before.x), Math.round(p[0].y - before.y)].join(', ')) + ' mm)');
  await dc(() => window.detailcraft.act('undo'));
  p = await pics();
  ok(p[0] && p[0].x === before.x && p[0].y === before.y, 'one undo puts it back');
  // opacity in Properties (one undo step)
  await dc((id) => window.detailcraft.setSelection([{ kind: 'picture', id }]), p[0].id);
  const op = page.locator('label:has-text("Opacity (%)")').first();
  const opId = await op.getAttribute('for');
  await page.fill('#' + opId, '30'); await page.press('#' + opId, 'Tab');
  p = await pics();
  ok(p[0] && Math.abs(p[0].opacity - 0.3) < 1e-9, 'Opacity 30% from Properties');
  // saved in the file and read back
  const kept = await dc(() => { const m = window.detailcraft.model, j = JSON.parse(m.toJSON()); m.load(m.toJSON()); return { file: j.pictures?.[0]?.src?.slice(0, 22), n: m.state.pictures.length, src: !!m.pictureSrcs.get(m.state.pictures[0].hash) }; });
  ok(kept.file === 'data:image/png;base64,' && kept.n === 1 && kept.src, 'kept in the model file with its PNG and opened again');
  // delete with the Delete key, undo
  const pid = (await pics())[0].id;
  await dc((id) => window.detailcraft.setSelection([{ kind: 'picture', id }]), pid);
  await page.locator('canvas').first().focus().catch(() => {});
  await dc(() => document.activeElement?.blur?.());
  await page.keyboard.press('Delete');
  ok((await pics()).length === 0, 'Delete removes it');
  await page.keyboard.press('Control+Z');
  ok((await pics()).length === 1, 'Ctrl+Z brings it back');
  // DetailCraft's own copy newer than the area: Ctrl+V pastes parts
  await dc((id) => { window.detailcraft.setSelection([{ kind: 'member', id }]); window.detailcraft.act('copy'); window.detailcraft.setSelection([]); }, beam);
  await page.keyboard.press('Control+V');
  await page.waitForTimeout(400);
  ok((await pics()).length === 1 && (await dc(() => window.detailcraft.tool)) === 'paste', 'with DetailCraft\'s copy newer, Ctrl+V pastes the parts (tool paste), no new picture');
  await page.keyboard.press('Escape');
  // the browser's own paste with a picture: the clip's size only when the pixels match
  await pasteEvent(400, 200);
  ok((await pics()).length === 2, 'a 400 × 200 picture from the system clipboard is the clip: pasted at its size');
  await pasteEvent(123, 45);
  ok((await pics()).length === 2 && (await dc(() => document.body.innerText.includes('which know their size'))), 'a picture of another size is not pasted, and the status bar says why');
  // paper size, overlay opacity
  await putClip({ w: 300, h: 150, real: 0, overlay: 0.4, label: 'Notes' });
  await dc(() => window.detailcraft.act('paste'));
  p = await pics();
  const last = p[p.length - 1];
  ok(p.length === 3 && last.size === 'paper' && Math.abs(last.mmPerPx - 0.5 * 25.4 / 72) < 1e-9 && last.opacity === 0.4, 'Edit › Paste: no scale → paper size, overlay starts at 40%');
  ok(await dc(() => document.body.innerText.includes('paper size')), 'the status bar says paper size');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'detailcraft-areaclip-3d.png') });
  await dc(() => { localStorage.removeItem('cadcraft.areaclip'); localStorage.removeItem('detailcraft.clipboard'); });
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
