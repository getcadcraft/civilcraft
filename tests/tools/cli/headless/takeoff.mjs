/* SPDX-License-Identifier: Apache-2.0 */
/**
 * takeoff.mjs — TakeoffCraft's quantities and estimate without a screen (docs/AGENTS-SPEC.md §2): the app's own model.js
 * (readProject validates the file as the app does), quantities(), estimate() and export.js.
 *
 *   const s = await TakeoffSession.open(text, 'Job.takeoff.json');
 *   s.summary(); s.quantities({by: 'item' | 'sheet'}); s.estimate(); await s.export('csv' | 'xlsx')
 *
 * Marks on sheets with no scale are listed as unscaled and never counted as zero (the app's rule).
 */
import { load } from './apps.mjs';

const APP = 'takeoffcraft';

export class TakeoffSession {
  static async open(text, name = 'takeoff.takeoff.json') {
    const [model, exp, units, agents] = await Promise.all([load(APP, 'model.js'), load(APP, 'export.js'), load(APP, 'units.js'), load(APP, 'agents.js')]);
    let json;
    try { json = JSON.parse(typeof text === 'string' ? text : new TextDecoder().decode(text)); } catch { throw new Error('"' + name + '" is not JSON.'); }
    const r = model.readProject(json);
    if (!r.ok) throw new Error(r.error);
    const s = new TakeoffSession(r.state, name, { model, exp, units, agents });
    s.warnings = r.warnings || [];
    return s;
  }

  constructor(state, name, mods) { this.state = state; this.name = name; this.m = mods; }

  sheetLabel = (key) => {
    const [hash, page] = String(key).split(':');
    const files = this.state.files || [];
    const f = files.find((x) => x.hash === hash);
    const n = (+page || 0) + 1;
    return f ? (files.length > 1 || (f.pages || 1) > 1 ? f.name + ', page ' + n : f.name) : 'Sheet ' + String(hash).slice(0, 8) + ', page ' + n;
  };

  /** The same answers as the live window (agents.js in the app build). */
  summary() { return { file: this.name, ...this.m.agents.takeoffSummary(this.state, this.sheetLabel), warnings: this.warnings || [] }; }
  items() { return this.m.agents.itemsList(this.state); }
  quantities({ by = 'item' } = {}) { return this.m.agents.takeoffQuantities(this.state, this.sheetLabel, { by }); }
  estimate() { return this.m.agents.takeoffEstimate(this.state); }

  /** → bytes of a CSV (BOM, as the app) or an XLSX. */
  async export(kind) {
    if (kind === 'csv') return new TextEncoder().encode('﻿' + this.m.exp.estimateCsv(this.state));
    if (kind === 'xlsx') return this.m.exp.estimateXlsx(this.state, this.sheetLabel);
    throw new Error('Exports: csv, xlsx.');
  }
}
