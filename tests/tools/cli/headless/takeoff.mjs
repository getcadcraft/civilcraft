/* SPDX-License-Identifier: Apache-2.0 */
/**
 * takeoff.mjs — TakeoffCraft's quantities and estimate without a screen (docs/AGENTS-SPEC.md §2): the app's own model.js
 * (readProject validates the file as the app does), quantities(), estimate() and export.js.
 *
 *   const s = await TakeoffSession.open(text, 'Job.takeoff.json');
 *   s.summary(); s.quantities({by: 'item' | 'sheet'}); s.estimate(); await s.export('csv' | 'xlsx'); s.save() → bytes
 *   0.7 AS.6 (session assistants-gaps), a takeoff on a DWG / DXF (takeoff-cad's cadset.js and the shared readers):
 *   const s = await TakeoffSession.openDrawing(bytes, 'plan.dwg')   a new takeoff on that drawing's sheets, scaled as the app scales them
 *   await s.attach(bytes, name)                                     a drawing a saved takeoff was made on (matched by its SHA-256)
 *   s.cad(sheet) → {set, i, key}                                    a sheet by key, name or number
 *
 * Marks on sheets with no scale are listed as unscaled and never counted as zero (the app's rule).
 */
import { load } from './apps.mjs';

const APP = 'takeoffcraft';

async function mods() {
  const [model, exp, units, agents] = await Promise.all([load(APP, 'model.js'), load(APP, 'export.js'), load(APP, 'units.js'), load(APP, 'agents.js')]);
  return { model, exp, units, agents };
}
let CADM = null;
async function cadMods() {
  if (CADM) return CADM;
  const [cadset, pdfset, dwg, dxf, dec] = await Promise.all([load(APP, 'cadset.js'), load(APP, 'pdfset.js'), load(APP, 'dwg/read.js'), load(APP, 'dxf-model.js'), load(APP, 'dxf-decode.js')]);
  CADM = { cadset, pdfset, readers: { dwg: async (b) => dwg.readDwg(b), dxf: async (b) => dxf.readDxfModel(dec.decodeDxfBytes(b).text) } };
  return CADM;
}

export class TakeoffSession {
  static async open(text, name = 'takeoff.takeoff.json') {
    const m = await mods();
    let json;
    try { json = JSON.parse(typeof text === 'string' ? text : new TextDecoder().decode(text)); } catch { throw new Error('"' + name + '" is not JSON.'); }
    const r = m.model.readProject(json);
    if (!r.ok) throw new Error(r.error);
    const s = new TakeoffSession(new m.model.Takeoff(r.state), name, m);
    s.warnings = r.warnings || [];
    return s;
  }

  /** A new takeoff on a drawing: its sheets (Model, then each layout) with the scales the drawing gives them (one undo step, as the app). */
  static async openDrawing(bytes, name) {
    const m = await mods();
    const base = String(name).replace(/^.*[\\/]/, '');
    const t = new m.model.Takeoff();
    t.state.name = base.replace(/\.(dwg|dxf)$/i, '');
    const s = new TakeoffSession(t, base.replace(/\.(dwg|dxf)$/i, '') + '.takeoff.json', m);
    s.warnings = [];
    await s.attach(bytes, base);
    t.undoStack = []; t.redoStack = []; t.markSaved();   // the drawing's own scales are where the takeoff starts, not an edit
    s.fresh = true;
    return s;
  }

  constructor(model, name, mods_) { this.model = model; this.name = name; this.m = mods_; this.sets = []; }
  get state() { return this.model.state; }

  /** Open a drawing for this takeoff: a file it already names (by SHA-256) or a new one, with the drawing's scales for unscaled sheets. */
  async attach(bytes, name) {
    const C = await cadMods();
    const hash = await C.pdfset.sha256Hex(bytes);
    const set = await C.cadset.openCad(bytes, name, { readers: C.readers, hash });
    const known = this.state.files.find((f) => f.hash === hash);
    if (known && known.pages !== set.pages.length) throw new Error(name + ' has ' + set.pages.length + ' sheets; the takeoff\'s copy had ' + known.pages + '.');
    if (!known && this.state.files.some((f) => f.name === set.name)) this.warnings.push('The takeoff names another file called ' + set.name + ' (a different version: its marks stay on the old one).');
    this.model.addFile({ hash: set.hash, name: set.name, size: set.size, pages: set.pages.length });
    const map = this.m.agents.drawingScales(set, this.model);
    if (Object.keys(map).length) this.model.setScales(map, 'Scales from ' + set.name);
    this.sets = this.sets.filter((x) => x.hash !== hash).concat([set]);
    return { file: set.name, hash, known: !!known, sheets: this.m.agents.cadSheetRows(set, this.model), warnings: set.cad.warnings };
  }

  /** A drawing's sheet: by key ("<sha256>:<i>"), by name (Model, a layout; "file › name" when several drawings), or by number (1 = the first drawing's Model). */
  cad(q) {
    if (!this.sets.length) throw new Error('No drawing is open in this takeoff: open a .dwg / .dxf with takeoff_open (path or drawings).');
    const all = this.sets.flatMap((set) => set.cad.sheets.map((sh) => ({ set, i: sh.index, key: set.hash + ':' + sh.index, name: sh.name })));
    if (q === undefined || q === null || q === '') { const x = all.find((s) => this.sets[0] === s.set && s.i === 0); return x; }
    if (Number.isInteger(q)) { if (q >= 1 && q <= all.length) return all[q - 1]; throw new Error('Sheets are numbered 1 to ' + all.length + '.'); }
    const lc = String(q).toLowerCase();
    const x = all.find((s) => s.key === q) || all.find((s) => s.name.toLowerCase() === lc) || all.find((s) => (s.set.name + ' › ' + s.name).toLowerCase() === lc);
    if (!x) throw new Error('No sheet "' + q + '". Sheets: ' + all.map((s) => s.name).join(', ') + '.');
    return x;
  }

  sheetLabel = (key) => {
    const [hash, page] = String(key).split(':');
    const files = this.state.files || [];
    const f = files.find((x) => x.hash === hash);
    const set = this.sets.find((x) => x.hash === hash);
    if (set && set.cad.sheets[+page]) return (files.length > 1 ? set.name + ' › ' : '') + set.cad.sheets[+page].name;
    const n = (+page || 0) + 1;
    return f ? (files.length > 1 || (f.pages || 1) > 1 ? f.name + ', page ' + n : f.name) : 'Sheet ' + String(hash).slice(0, 8) + ', page ' + n;
  };

  /** The same answers as the live window (agents.js in the app build). */
  summary() { return { file: this.name, ...this.m.agents.takeoffSummary(this.state, this.sheetLabel), ...(this.sets.length ? { drawings: this.sets.map((set) => ({ file: set.name, format: set.cad.format, sheets: this.m.agents.cadSheetRows(set, this.model) })) } : {}), warnings: this.warnings || [] }; }
  items() { return this.m.agents.itemsList(this.state); }
  quantities({ by = 'item' } = {}) { return this.m.agents.takeoffQuantities(this.state, this.sheetLabel, { by }); }
  estimate() { return this.m.agents.takeoffEstimate(this.state); }

  /** → bytes of a CSV (BOM, as the app) or an XLSX. */
  async export(kind) {
    if (kind === 'csv') return new TextEncoder().encode('﻿' + this.m.exp.estimateCsv(this.state));
    if (kind === 'xlsx') return this.m.exp.estimateXlsx(this.state, this.sheetLabel);
    throw new Error('Exports: csv, xlsx.');
  }

  /** The takeoff file (.takeoff.json), as the app's Save writes it. */
  save() { const b = new TextEncoder().encode(JSON.stringify(this.model.toJSON(), null, 1)); this.model.markSaved(); return b; }
}
