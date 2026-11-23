#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-plan-cad.mjs — SU.1994 in the lab build, as a person uses it: the small house (fixtures/bimcraft/small-house.ifc), the plan's
 * "Save as DWG or DXF" (plan toolbar) and the Sheets dialog's "DWG or DXF", each file read back with BimCraft's own readers.
 *   node tools/bimcraft-test/browser-plan-cad.mjs [--shots <dir>]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openLab, REPO } from './bk-page.mjs';

const APP = path.join(REPO, 'public_html/assets/apps/bimcraft/dev');
const { readDwg } = await import(path.join(APP, 'dwg/read.js'));
const { readDxf } = await import(path.join(REPO, 'public_html/assets/apps/cadcraft/dev/dxf.js'));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'bc-plan-cad-'));
const L = await openLab({ tag: 'bimplancad', units: 'mm', viewport: { width: 1600, height: 1100 } });
const { page, ok } = L;
const save = async (sel, fmt) => {
  await page.click(sel);
  await page.waitForSelector('dialog[data-cad-dlg][open]');
  await page.selectOption('[data-cad-format]', fmt);
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 180000 }), page.click('[data-cad-save]')]);
  const p = path.join(TMP, dl.suggestedFilename().replace(/[^\w. -]/g, '_'));
  await dl.saveAs(p);
  return { name: dl.suggestedFilename(), path: p, bytes: fs.readFileSync(p) };
};
const msOf = (m) => m.blocks.find((b) => /^\*model_space$/i.test(b.name))?.entities || [];
try {
  await page.setInputFiles('[data-file]', path.join(REPO, 'fixtures/bimcraft/small-house.ifc'));
  await L.waitStatus(/^Opened /, 120000);
  if (!(await page.evaluate(() => !!window.bimcraftPlan?.state?.on))) await page.click('[data-model-toggle]');
  await page.waitForFunction(() => window.bimcraftPlan?.state?.on && window.bimcraftPlan.state.data?.walls?.length > 0, null, { timeout: 120000 });
  await L.settled();
  const facts = await page.evaluate(() => { const S = window.bimcraftPlan.state; return { walls: S.data.walls.filter((w) => w.storey === S.level).length, doors: S.data.openings.filter((o) => o.kind === 'door').length, rooms: (S.data.derived.spaces || []).length }; });
  console.log('== the plan as DWG');
  ok(await page.isVisible('[data-model-cad]'), 'the plan toolbar has Save as DWG or DXF');
  await page.click('[data-model-cad]');
  await page.waitForSelector('dialog[data-cad-dlg][open]');
  const note = await page.textContent('[data-cad-note]');
  ok(/true size in millimeters/.test(note) && /sized for 1:\d+/.test(note), 'the dialog says what goes in: ' + note.slice(0, 120));
  ok((await page.$$eval('[data-cad-format] option', (o) => o.length)) === 7, 'seven file types: six DWG versions and DXF');
  await L.shot('plancad-01-dialog');
  await page.click('[data-cad-cancel]');
  ok(!(await page.$('dialog[data-cad-dlg]')), 'Cancel closes it and saves nothing');
  const dwg = await save('[data-model-cad]', 'dwg');
  ok(/\.dwg$/.test(dwg.name) && dwg.bytes.subarray(0, 6).toString('latin1') === 'AC1032', 'saved ' + dwg.name + ' (AutoCAD 2018)');
  const m = readDwg(dwg.bytes), ents = msOf(m), layers = (m.tables.layers || []).map((l) => l.name);
  ok(['A-WALL', 'A-DOOR', 'A-GLAZ'].every((l) => layers.includes(l)), 'its layers: ' + layers.join(' '));
  ok(ents.filter((e) => e.layer === 'A-WALL').length > 0 && ents.some((e) => e.type === 'ARC' && e.layer === 'A-DOOR'), 'wall outlines and door swings as arcs');
  ok(!facts.rooms || ents.some((e) => e.type === 'TEXT' && e.layer === 'A-AREA-IDEN'), 'room names as text (' + facts.rooms + ' rooms)');
  ok(/Saved the plan as DWG \(AutoCAD 2018\)/.test(await page.textContent('[data-status]')), 'the status says so: ' + await page.textContent('[data-status]'));
  const dxf = await save('[data-model-cad]', 'dxf');
  const r = readDxf(dxf.bytes.toString('latin1'));
  ok(/\.dxf$/.test(dxf.name) && r.entities.length === ents.length, dxf.name + ': CadCraft reads the same ' + ents.length + ' objects', r.entities.length);
  ok((await page.$eval('[data-cad-format]', (s) => s.value).catch(() => null)) === null, 'the dialog is gone after saving');

  console.log('== the drawing set as DWG');
  await page.click('[data-res-sheetsopen]');
  await page.waitForSelector('[data-res-shlist] button', { timeout: 120000 });
  ok(await page.isVisible('[data-res-shcad]'), 'the Sheets dialog has DWG or DXF next to the PDF');
  const set = await save('[data-res-shcad]', 'dwg2004');
  const s = readDwg(set.bytes), se = msOf(s);
  const titles = se.filter((e) => e.layer === 'A-VIEW-TITL').map((e) => e.value);
  ok(set.bytes.subarray(0, 6).toString('latin1') === 'AC1018' && titles.length >= 5, set.name + ' (AutoCAD 2004): ' + titles.length + ' views: ' + titles.join(', '));
  ok(se.some((e) => e.layer === 'A-ELEV') && se.some((e) => /^DIMENSION/.test(e.type)), 'elevations with their lines, and real dimensions');
  ok(/Saved \d+ views as DWG \(AutoCAD 2004\)/.test(await page.textContent('[data-status]')), 'the status: ' + await page.textContent('[data-status]'));
  await L.shot('plancad-02-set');
} catch (e) { ok(false, 'ran to the end', e.stack || e); }
const code = L.done();   // + no console errors; prints the totals
await L.close();
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(code);
