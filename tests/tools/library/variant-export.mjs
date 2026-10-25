#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * variant-export.mjs — one variant of a LibraryCraft item as a DWG, STEP or IFC file (0.7 W3.19, the configurator page).
 * Run by LibraryVariants::file() (core/classes/LibraryVariants.php) through proc_open, the way the converter is.
 *
 *   node tools/library/variant-export.mjs <item.json> <variant-id | -> <dwg|step|ifc> <out-file> [--uuid u] [--version n] [--sha s] [--license id] [--holder h] [--url u]
 *
 * The item is checked with libitem.js validateItem, read as that variant (itemAsVariant: its body, footprint, ports) and written:
 *   dwg   the plan symbol in millimetres on the item's own layers (CadCraft's libplace.js itemEntities + saveDwg); a variant with a
 *         footprint is that rectangle. The 3D body is not in the DWG.
 *   step  the body as a faceted STEP AP242 (flat triangles; a box is its 8 corners, 6 faces): PartCraft's stepFaceted
 *   ifc   IFC4: one IfcBuildingElementProxy with the body, CadCraft_LibraryItem / CadCraft_Variant / CadCraft_Ports property sets
 *         and quantities: PartCraft's itemIfc
 * Prints exactly one JSON object on stdout: {ok, name (a good file name), notes[]} or {ok:false, error}. Exit 0 = ok.
 * Reads only its input; writes only <out-file>. The dates in the files are fixed (2026-01-01), not today's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const APPS = path.join(REPO, 'public_html/assets/apps');
const imp = (p) => import(pathToFileURL(p).href);

const realLog = console.log.bind(console);
console.log = console.info = console.warn = console.debug = () => {};
const say = (obj) => { realLog(JSON.stringify(obj)); };
const fail = (error, code = 1) => { say({ ok: false, error: String(error) }); process.exit(code); };

const args = process.argv.slice(2);
const pos = [], opt = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) { const k = args[i].slice(2); if (!['uuid', 'version', 'sha', 'license', 'holder', 'url'].includes(k)) fail('Unknown option ' + args[i], 2); opt[k] = args[++i] ?? ''; }
  else pos.push(args[i]);
}
if (pos.length !== 4 || !['dwg', 'step', 'ifc'].includes(pos[2])) fail('Usage: variant-export.mjs <item.json> <variant-id|-> <dwg|step|ifc> <out-file>', 2);
const [input, variantId, format, out] = pos;

let item;
try {
  const st = fs.statSync(input);
  if (st.size > 8 * 1024 * 1024) fail('The item is larger than 8 MB.');
  item = JSON.parse(fs.readFileSync(input, 'utf8'));
} catch (e) { fail('Cannot read the item: ' + e.message); }

try {
  const L = await imp(path.join(APPS, 'bimcraft/dev/libitem.js'));
  const v = L.validateItem(item, { partial: !item.uuid });
  if (!v.ok) fail('The item is not valid: ' + v.errors.slice(0, 3).join('; '));
  const row = variantId === '-' ? null : L.variantOf(item, variantId);
  if (variantId !== '-' && (!row || row.id !== variantId)) fail('This item has no variant "' + variantId.slice(0, 60) + '".');
  const vi = row ? L.itemAsVariant(item, row.id) : item;
  const variant = row ? { id: row.id, name: row.name, values: row.values } : null;
  const label = variant ? `${item.name} - ${variant.name}` : String(item.name);
  const stem = label.replace(/[^A-Za-z0-9 _.,()-]+/g, '_').replace(/\s+/g, ' ').trim().slice(0, 100) || 'item';
  const notes = [];
  const date = new Date(Date.UTC(2026, 0, 1));   // the files carry no clock: the same item and variant give the same bytes

  if (format === 'dwg') {
    // CadCraft's own reader of the item's plan and its DWG saver (DOM-free, run in Node by bin/test-cadcraft.mjs)
    const CC = path.join(APPS, 'cadcraft/dev');
    const I18N = await imp(path.join(CC, 'i18n.js'));
    I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(CC, 'lang/en.json'), 'utf8')) });
    const { Doc } = await imp(path.join(CC, 'doc.js'));
    const { itemEntities } = await imp(path.join(CC, 'libplace.js'));
    const { saveDwg } = await imp(path.join(CC, 'dwg-save.js'));
    const doc = new Doc();
    doc.meta.units = 'mm'; doc.meta.name = stem;
    for (const l of vi.plan?.layers || []) { if (l.name !== '0') doc.addLayer({ name: l.name, color: Number.isInteger(l.color) && l.color > 0 && l.color < 256 ? l.color : 7 }); }
    const ents = itemEntities(vi);
    if (!ents.length) fail('This item has no plan to draw.');
    doc.change('item', () => { for (const e of ents) doc.add(e); });
    fs.writeFileSync(out, saveDwg(doc, { version: '2000', created: date }).bytes);
    notes.push('The DWG is the plan symbol in millimetres; the 3D body is in the STEP and IFC files.');
  } else {
    if (!vi.body) fail('This variant has no 3D body, so there is nothing to write as ' + format.toUpperCase() + '.');
    const X = await imp(path.join(APPS, 'partcraft/dev/ifc-export.js'));
    if (format === 'step') {
      const { stepFaceted } = await imp(path.join(APPS, 'partcraft/dev/export.js'));
      const s = stepFaceted(X.bodyMeshYUp(vi.body), label, { date });
      fs.writeFileSync(out, s.text);
      notes.push('The STEP is faceted (flat triangles), not exact surfaces.');
    } else {
      const r = X.itemIfc(vi, { now: date, fileName: stem + '.ifc', variant, library: { uuid: opt.uuid || item.uuid, version: opt.version ? Number(opt.version) : item.version, sha256: opt.sha, license: opt.license, holder: opt.holder, url: opt.url } });
      fs.writeFileSync(out, r.text);
    }
  }
  say({ ok: true, name: `${stem}.${format}`, notes });
} catch (e) { fail(e && e.message ? e.message : e); }
