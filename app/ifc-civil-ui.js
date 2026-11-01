/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-civil-ui.js — 0.7.1 71.24: Export › IFC (the dialog in ui.inc, [data-ifc]) and opening an .ifc file ([data-ifc-in]). Loaded on
 * first use by civilcraft.js; the work is DOM-free in ifc-civil-model.js (what is written), ifc-civil.js (the writer, three schemas)
 * and ifc-civil-read.js (the reader, through cc-ifc).
 *
 *   installIfc(ctx) → { exportDialog(), importFile(file) }
 *   ctx = { root, project(), setProject(p), say, busy, download(bytes, name, type), fileStem(), refresh(), fitAll(), refocus(),
 *           species() (the Landscape plant list), confirmDiscard() }
 *
 * The export dialog: a schema choice (IFC 4.3 ADD2 first and the default; the last one picked is remembered in this browser),
 * what the file will hold (counted from the project) and what the chosen schema leaves out (SCHEMA_INFO losses), a note when the
 * project has no coordinate system. The import dialog: what the file holds, which surface becomes the existing ground (none by
 * default when the project already has one), whether the rest shows in 3D as reference.
 */

import { civilIfcModel, modelEmpty } from './ifc-civil-model.js';
import { writeCivilIfc, fileOrigin, SCHEMAS, SCHEMA_INFO } from './ifc-civil.js';
import { readCivilIfc, applyIfcImport } from './ifc-civil-read.js';
import { Project } from './project.js';
import { t } from './i18n.js';

const KEY = 'civilcraft.ifcSchema';

export function installIfc(ctx) {
  const dlg = ctx.root.querySelector('[data-ifc]'), inDlg = ctx.root.querySelector('[data-ifc-in]');
  const $ = (d, s) => d.querySelector(s);
  let model = null;

  function summary(m) {
    const net = m.network;
    return t('ifc.summary', { al: m.alignments.length, roads: m.corridors.length, surf: m.surfaces.length, pads: m.pads.length, walls: m.pads.reduce((n, p) => n + p.walls.length, 0),
      pipes: net?.pipes.length || 0, structs: net?.structures.length || 0, parcels: m.parcels.length, ls: m.landscape.length, masses: m.masses.length });
  }
  function showSchema() {
    const sc = $(dlg, '[data-ifc-schema]').value, list = $(dlg, '[data-ifc-losses]');
    list.replaceChildren(...SCHEMA_INFO[sc].losses.map((k) => Object.assign(document.createElement('li'), { textContent: t(k) })));
    try { localStorage.setItem(KEY, sc); } catch { /* storage blocked */ }
  }

  function exportDialog() {
    const p = ctx.project();
    model = civilIfcModel(p, { species: ctx.species?.() || null });
    const empty = modelEmpty(model);
    $(dlg, '[data-ifc-summary]').textContent = empty ? t('cv.export.none') : summary(model);
    const notes = [];
    if (!p.state.crs && !empty) notes.push(t('ifc.nocrs'));
    if (model.notes.includes('standin')) notes.push(t('ifc.standin'));
    $(dlg, '[data-ifc-notes]').replaceChildren(...notes.map((n) => Object.assign(document.createElement('p'), { className: 'cv-note', textContent: n })));
    const sel = $(dlg, '[data-ifc-schema]');
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch { /* storage blocked */ }
    sel.value = SCHEMAS.includes(saved) ? saved : 'IFC4X3_ADD2';
    showSchema();
    $(dlg, '[data-ifc-go]').disabled = empty;
    dlg.showModal();
    sel.focus();
  }

  async function write() {
    const p = ctx.project(), schema = $(dlg, '[data-ifc-schema]').value;
    dlg.close();
    if (!model || modelEmpty(model)) { ctx.say(t('cv.export.none')); return; }
    ctx.busy(t('ifc.busy'));
    try {
      // latitude and longitude of the file's origin (IfcSite RefLatitude / RefLongitude) when the project has a coordinate system
      const origin = fileOrigin(model);
      if (p.state.crs) { try { const { frame } = await import('./crs.js'); [model.lon, model.lat] = frame(p.state.crs).toLonLat(origin.x, origin.y); } catch { model.lat = model.lon = null; } }   // frame: a local (ground) system too
      const r = writeCivilIfc(model, { schema, origin, seed: p.state.name || 'site' });
      const name = ctx.fileStem() + '-ifc' + SCHEMA_INFO[schema].file + '.ifc';   // i18n-ignore: a file name ending
      ctx.download(new TextEncoder().encode(r.text), name, 'application/x-step');
      ctx.say(t('ifc.done', { file: name, schema: $(dlg, `[data-ifc-schema] option[value="${schema}"]`).textContent, n: r.counts.elements }));
    } catch (err) { ctx.say(t('ifc.failed', { why: err.message })); } finally { ctx.busy(null); }
  }

  let pending = null;
  async function importFile(file) {
    ctx.busy(t('cad.ui.reading', { file: file.name }));
    let r;
    try {
      const p = ctx.project(), fresh = !p.points.length && !p.state.alignments.length && !p.state.surface.tin && !p.state.pads.length;
      r = readCivilIfc(new Uint8Array(await file.arrayBuffer()), { units: fresh ? null : p.state.units });
      r.fresh = fresh;
    } catch (err) { ctx.say(t('ifc.in.failed', { file: file.name, why: err.message })); return; } finally { ctx.busy(null); }
    if (!r.alignments.length && !r.surfaces.length && !r.refs.length) { ctx.say(t('ifc.in.none', { file: file.name }) + (r.notes.length ? ' ' + r.notes.join(' ') : '')); return; }
    pending = { r, file: file.name };
    $(inDlg, '[data-ifc-in-file]').textContent = file.name;
    $(inDlg, '[data-ifc-in-found]').textContent = t('ifc.in.found', { al: r.alignments.length, surf: r.surfaces.length, refs: r.refs.length, schema: r.schema });
    const sel = $(inDlg, '[data-ifc-in-eg]'), hasEg = !!ctx.project().eg().surface && !r.fresh;
    sel.replaceChildren(Object.assign(document.createElement('option'), { value: '-1', textContent: t('ifc.in.eg.none') }),
      ...r.surfaces.map((s, i) => Object.assign(document.createElement('option'), { value: String(i), textContent: t('ifc.in.eg.opt', { name: s.name, n: s.faces.length }) })));
    const egi = r.surfaces.findIndex((s) => s.kind === 'eg');
    sel.value = hasEg || !r.surfaces.length ? '-1' : String(egi >= 0 ? egi : 0);
    $(inDlg, '[data-ifc-in-refs]').checked = true;
    $(inDlg, '[data-ifc-in-notes]').replaceChildren(...r.notes.slice(0, 12).map((n) => Object.assign(document.createElement('li'), { textContent: n })));
    inDlg.showModal();
    $(inDlg, '[data-ifc-in-ok]').focus();
  }

  async function apply() {
    const { r, file } = pending || {};
    inDlg.close();
    if (!r) return;
    if (r.fresh) {
      if (!(await ctx.confirmDiscard())) return;
      const np = new Project();
      np.state.units = r.units;
      np.state.name = file.replace(/\.[^.]+$/, '').slice(0, 120);
      ctx.setProject(np);
    }
    const p = ctx.project();
    const res = applyIfcImport(p, r, { eg: Number($(inDlg, '[data-ifc-in-eg]').value), refs: $(inDlg, '[data-ifc-in-refs]').checked, file });
    if (r.fresh) { p.undoStack = []; p.saved = p.version; }
    ctx.refresh(); ctx.fitAll();
    ctx.say(t('ifc.in.done', { file, al: res.alignments.length, eg: res.eg ? t('ifc.in.done.eg') : '', refs: res.refs }) + (r.georef?.crs ? ' ' + t('ifc.in.crs', { crs: r.georef.crs }) : ''));
    pending = null;
  }

  dlg.addEventListener('change', (e) => { if (e.target.closest('[data-ifc-schema]')) showSchema(); });
  dlg.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) dlg.close();
    else if (e.target.closest('[data-ifc-go]')) write();
    else if (e.target.closest('[data-ifc-open]')) { dlg.close(); ctx.openPicker?.(); }
  });
  dlg.addEventListener('close', () => ctx.refocus());
  inDlg.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) { pending = null; inDlg.close(); } else if (e.target.closest('[data-ifc-in-ok]')) apply();
  });
  inDlg.addEventListener('close', () => ctx.refocus());
  return { exportDialog, importFile };
}
