#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-print3d.mjs — 0.5 SG.4 (#531) on the page (the mesh kernel): Export › Check for 3D printing on the flange
 * (ready, size, volume = the part's), a bed set in Settings › PartCraft that is too small (warning) and cleared again,
 * Download 3MF from the dialog (read back by trimesh in tools/modelcraft-test/venv when it is there: watertight, the
 * part's volume), and the same dialog in an assembly of two copies. Screenshot of the dialog. No console errors.
 *   node tools/partcraft-test/browser-print3d.mjs [--state <file>] [--out <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { startHarness, cliArgs } from './browser-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PY = path.join(HERE, '../modelcraft-test/venv/bin/python');
const { state, out } = cliArgs();
const h = await startHarness({ state, out, exact: false });
const { page, ok, pc, built, F } = h;
const TMP = path.join(out, 'print3d');
fs.mkdirSync(TMP, { recursive: true });
const openCheck = async () => {
  await page.click('[data-export-menu] > summary');
  await page.click('[data-export-menu] [data-cmd="export-print"]');
  await page.waitForSelector('dialog.pc-dialog [data-print-ok]', { timeout: 120000 });
  return page.evaluate(() => { const d = document.querySelector('dialog.pc-dialog'); return { ok: d.querySelector('[data-print-ok]').dataset.printOk, text: d.textContent, warnings: [...d.querySelectorAll('[data-print-warnings] li')].map((l) => l.textContent) }; });
};
const close = () => page.click('dialog.pc-dialog button[data-key="cancel"]');
const readBack = (f) => { try { return JSON.parse(execFileSync(PY, [path.join(HERE, '../modelcraft-test/print_check.py'), f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })); } catch (err) { return { error: String(err.stderr || err.message).slice(-300) }; } };

try {
  console.log('\n== Check for 3D printing (0.5 SG.4)');
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
  await built();
  const vol = await pc(() => window.partcraft.regen?.stats?.volume ?? null);
  let d = await openCheck();
  ok(d.ok === '1' && /Ready to print/.test(d.text) && /What prints: the part/.test(d.text) && /mm \(X × Y × Z on the bed\)/.test(d.text), 'the flange is ready to print, with its size on the bed');
  ok(/Bed size: not set/.test(d.text), 'no bed set yet: the dialog says where to set it');
  await page.screenshot({ path: path.join(TMP, '01-flange-ready.png') });
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('dialog.pc-dialog button[data-key="3mf"]')]);
  const f = path.join(TMP, dl.suggestedFilename()); await dl.saveAs(f);
  ok(path.basename(f) === 'Flange.3mf', 'Download 3MF gives Flange.3mf');
  if (fs.existsSync(PY)) {
    const b = readBack(f);
    ok(!b.error && b.watertight && b.unit === 'millimeter' && (vol == null || Math.abs(b.volume - vol) <= 1e-6 * vol + 1e-6), 'trimesh reads it back watertight' + (vol != null ? ', the part\'s volume' : '') + ' — ' + JSON.stringify(b.error || b.volume));
  }
  // a bed too small for it, then cleared
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('partcraft.settings') || '{}'); s.bed = [20, 20, 20]; localStorage.setItem('partcraft.settings', JSON.stringify(s)); });
  await page.evaluate(() => window.dispatchEvent(new StorageEvent('storage', { key: 'partcraft.settings', newValue: localStorage.getItem('partcraft.settings') })));
  d = await openCheck();
  ok(d.warnings.some((w) => /larger than your printer's bed \(20 × 20 × 20 mm\)/.test(w)), 'a 20 mm bed: larger than your printer\'s bed');
  await close();
  // the Settings fields set it too
  await page.click('[data-app-settings-open], .app-bar [data-settings]').catch(() => {});
  const viaUi = await page.evaluate(() => {
    const dlg = document.querySelector('[data-app-settings]');
    if (!dlg) return null;
    const x = dlg.querySelector('input[name="pcBedX"]'), y = dlg.querySelector('input[name="pcBedY"]'), z = dlg.querySelector('input[name="pcBedZ"]');
    if (!x || !y || !z) return null;
    for (const [i, v] of [[x, '500'], [y, '500'], [z, '500']]) { i.value = v; i.dispatchEvent(new Event('change', { bubbles: true })); }
    return JSON.parse(localStorage.getItem('partcraft.settings') || '{}').bed;
  });
  ok(JSON.stringify(viaUi) === '[500,500,500]', 'Settings › PartCraft › 3D printer stores the bed: ' + JSON.stringify(viaUi));
  await page.keyboard.press('Escape').catch(() => {});
  d = await openCheck();
  ok(!d.warnings.some((w) => /bed/.test(w)) && !/Bed size: not set/.test(d.text), 'it fits a 500 mm bed');
  await close();
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('partcraft.settings') || '{}'); delete s.bed; localStorage.setItem('partcraft.settings', JSON.stringify(s)); });
  // an assembly of two copies
  await h.tool('asm-new');
  await pc(() => window.partcraft.asmBuilt());
  await h.tool('asm-insert-copy');
  await pc(() => window.partcraft.asmBuilt());
  d = await openCheck();
  ok(/What prints: the whole assembly/.test(d.text) && /Volume:/.test(d.text), 'in an assembly: the whole assembly is checked — ' + (d.ok === '1' ? 'ready' : 'not ready') + (d.warnings.length ? ' (' + d.warnings.join(' | ') + ')' : ''));
  await page.screenshot({ path: path.join(TMP, '02-assembly.png') });
  await close();
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join('; ') : ''));
} catch (e) { await h.failed(e); }
await h.finish();
