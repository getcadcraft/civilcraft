/* SPDX-License-Identifier: Apache-2.0 */
/**
 * export.js — the files a job hands to the shop (0.8 DC.117, session `cabinetcraft_addon`). DOM-free: every function returns text.
 *
 *   cutlistCsv(build, { head, merge }) → CSV of the whole job's cut list (lib/cutlist toCsv), sheet parts and linear stock together
 *   drillCsv(build, { head, word }) · hardwareCsv(build, { head, word }) → CSV
 *   drillXml(build, { word, note }) → XML hole list per panel, documented and GENERIC (format 'cabinetcraft-holes' 1): not any machine's own format
 *   estimateCsv(est, { head, word, placeholderNote }) → CSV of the estimate rows, with the placeholder column and a closing note line
 *   labelsHtml(build, job, { template, title, fmt, words }) → printable label sheets (cutting order when a nest is given)
 *   jobJson(project) → the job file text (`.cabinetcraft.json`)
 *   gcodeFiles(job, sheetsGcode, { unit, post, tool, … }) → [{ name, text, ext, material, thickness, sheet, notes }]
 *       one program per sheet of every material, through PartCraft's existing nested-sheets path (cam-sheets.js `sheetsGcode`, which the
 *       caller passes in: this file imports nothing from the app). Each material is its own DXF because the cut depth is its thickness.
 */
import { toCsv, csvCell } from './cutlist/cutlist.js';
import { labelSheets, labelsHtml as labelsPage } from './cutlist/labels.js';
import { cutListOf, labelsOf, nestDxf } from './sheets.js';
import { hardwareCsv as hardwareCsvRaw } from './hardware.js';

export function cutlistCsv(build, { head, merge = true, sheet = null } = {}) {
  const list = cutListOf(build.parts, { merge, sheet });
  return toCsv(list, head ? { head } : {});
}

export function drillCsv(build, { head = {}, word = (k) => k } = {}) {
  const items = build.cells.filter((c) => c.kind === 'cab' && !c.bad).map((c) => c);
  const cols = ['part', 'name', 'face', 'kind', 'x', 'y', 'diameter', 'depth', 'side', 'qty', 'note'];
  const lines = [cols.map((c) => csvCell(head[c] ?? c)).join(',')];
  for (const c of items) for (const pl of c.drill) for (const h of pl.holes) lines.push([pl.id, word(pl.name), h.face || pl.face, h.kind, h.x, h.y, h.d, h.depth, h.side || 'both', pl.qty, [pl.note || '', h.edge ? 'edge ' + h.edge : ''].filter(Boolean).join(' ')].map(csvCell).join(','));
  return lines.join('\r\n') + '\r\n';
}

const xe = (v) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

/**
 * The drilling of the whole job as one XML file, a panel at a time. GENERIC: the shape is ours, documented in the help topic and the comment at the top of the
 * file, so a shop's own software (or a post-processor someone writes) can read it; it is not the input of any boring machine and says so in the file.
 * Frame of a panel: x along its LENGTH from the end the cut list starts at, y across its WIDTH from the first long edge, both in the file's unit; `face` says which
 * face the hole is on ('inside', 'back', …); `side` says which of a pair of panels takes it ('both' | 'left' | 'right').
 */
export function drillXml(build, { word = (k) => k, note = 'Generic hole list per panel. Not the file format of any boring machine.' } = {}) {
  const byId = new Map(build.parts.map((p) => [p.id, p]));
  const unit = build.project.unit === 'in' ? 'in' : 'mm';
  const out = ['<?xml version="1.0" encoding="UTF-8"?>', '<!-- ' + xe(note) + ' x: along the panel length from the end the cut list starts at; y: across the width from the first long edge; unit: ' + unit + '. -->',
    '<cabinetcraft-holes format="cabinetcraft-holes" version="1" generic="true" unit="' + unit + '" job="' + xe(build.project.name) + '">'];
  let panels = 0, holes = 0;
  for (const c of build.cells) {
    if (c.kind !== 'cab' || c.bad) continue;
    for (const pl of c.drill) {
      const part = byId.get(pl.id) || {};
      panels++;
      out.push('  <panel id="' + xe(pl.id) + '" cabinet="' + xe(c.no) + '" name="' + xe(word(pl.name)) + '" qty="' + xe(pl.qty) + '" length="' + xe(part.length ?? '') + '" width="' + xe(part.width ?? '') + '" thickness="' + xe(part.thickness ?? '') + '" material="' + xe(part.material ?? '') + '" face="' + xe(pl.face) + '">');
      for (const h of pl.holes) { holes++; out.push('    <hole kind="' + xe(h.kind) + '" x="' + xe(Math.round(h.x * 1000) / 1000) + '" y="' + xe(Math.round(h.y * 1000) / 1000) + '" diameter="' + xe(h.d) + '" depth="' + xe(h.depth) + '" side="' + xe(h.side || 'both') + '"' + (h.face && h.face !== pl.face ? ' face="' + xe(h.face) + '"' : '') + (h.edge ? ' edge="' + xe(h.edge) + '"' : '') + '/>'); }
      out.push('  </panel>');
    }
  }
  out.push('</cabinetcraft-holes>');
  void panels; void holes;
  return out.join('\n') + '\n';
}

export function hardwareCsv(build, { head = {}, word = (k) => k } = {}) {
  return hardwareCsvRaw(build.hardware, { head, word });
}

export function estimateCsv(est, { head = {}, word = (k) => k, note = '', label = '' } = {}) {
  const cols = ['what', 'detail', 'qty', 'unit', 'rate', 'amount', 'placeholder'];
  const lines = [cols.map((c) => csvCell(head[c] ?? c)).join(',')];
  for (const r of est.rows) lines.push([word(r.what), r.detail, r.qty, word(r.unit), r.rate, r.amount, r.placeholder ? (head.yes ?? 'yes') : (head.no ?? 'no')].map(csvCell).join(','));
  lines.push([word('est.subtotal'), '', '', '', '', est.subtotal, ''].map(csvCell).join(','));
  lines.push([word('est.markup'), '', '', '', est.markupRate, est.markup, est.markupPlaceholder ? (head.yes ?? 'yes') : (head.no ?? 'no')].map(csvCell).join(','));
  if (est.tax) lines.push([word('est.tax'), '', '', '', est.taxRate, est.tax, ''].map(csvCell).join(','));
  lines.push([word('est.total') + ' (' + est.currency + ')', '', '', '', '', est.total, ''].map(csvCell).join(','));
  if (note) lines.push(csvCell(note));
  if (label) lines.push(csvCell(label));
  return lines.join('\r\n') + '\r\n';
}

export function labelsHtml(build, job, { template = 'a4-24', title = 'Labels', fmt = String, words } = {}) {
  const items = labelsOf(build.parts, job, { fmt, ...(words ? { words } : {}) });
  const sheets = labelSheets(items, template, words ? { words } : {});
  return { html: labelsPage(sheets.pages, { title, template }), count: sheets.count, pages: sheets.pages.length, warnings: sheets.warnings };
}

export function jobJson(project) {
  return JSON.stringify(project, null, 2) + '\n';
}

export function gcodeFiles(job, sheetsGcode, { unit = 'mm', name = 'Job', ...opts } = {}) {
  const out = [];
  const scale = unit === 'in' ? 25.4 : 1;
  job.mats.forEach((m, i) => {
    if (!m.result.placed.length) return;
    const sub = { ...job, mats: [{ ...m, sheetBase: 0 }], seq: job.seq };
    const dxf = nestDxf(sub, { units: unit });
    const thickness = m.thickness * scale;
    const slug = (name + ' ' + m.material).replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 60);
    const files = sheetsGcode(dxf, { ...opts, scale, thickness, name: slug });
    for (const f of files.files || files) out.push({ ...f, material: m.material, thickness: m.thickness, group: i, notes: [...(f.notes || [])] });
    if (files.notes && files.notes.length) out.push({ notesOnly: true, material: m.material, notes: files.notes });
  });
  return out;
}

/** The nested sheets of every material as one DXF (what Manufacture › Nested sheets opens one material at a time). */
export const nestedDxf = (job, unit = 'mm') => nestDxf(job, { units: unit });
