/* SPDX-License-Identifier: Apache-2.0 */
/**
 * markup.mjs — MarkupCraft's reading of a marked-up PDF without a screen (docs/AGENTS-SPEC.md §2): the app's own
 * pdf-read.js with pdf.js (its legacy build for Node: the package `pdfjs-dist`, the version the app vendors) and pdf-lib
 * (the app's vendored copy). Read only.
 *
 *   const s = await MarkupSession.open(bytes, 'Set.pdf');
 *   s.sheets(); s.markups({sheet, status, type, author})
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { load, nodeModule, vendorDir } from './apps.mjs';

const APP = 'markupcraft';
let ENV = null;

async function env() {
  if (ENV) return ENV;
  const pdfjsDir = nodeModule('pdfjs-dist', 'markupcraft-test');
  if (!pdfjsDir) throw new Error('Reading PDFs needs the pdfjs-dist package (npm install pdfjs-dist@6.3.289 beside the CadCraft tools).');
  const libDir = vendorDir('pdf-lib');
  // pdf.js 6 calls Promise.withResolvers (Node 22+); Node 20 gets the same few lines here (0.7 AS.1)
  if (typeof Promise.withResolvers !== 'function') {
    Promise.withResolvers = function () { let resolve, reject; const promise = new this((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
  }
  const pdfLibPath = libDir ?path.join(libDir, 'pdf-lib.esm.js') : nodeModule('pdf-lib', 'markupcraft-test') && path.join(nodeModule('pdf-lib', 'markupcraft-test'), 'dist', 'pdf-lib.esm.js');
  const pdfjs = await import(pathToFileURL(path.join(pdfjsDir, 'legacy/build/pdf.mjs')).href);
  const pdfLib = pdfLibPath ? await import(pathToFileURL(pdfLibPath).href) : null;
  ENV = { pdfjs, pdfLib, docOptions: { standardFontDataUrl: path.join(pdfjsDir, 'standard_fonts') + path.sep, verbosity: 0 } };
  return ENV;
}

/** pdf.js and pdf-lib print warnings on console for odd files: keep them off stdout (MCP speaks there). */
async function quiet(fn) {
  const w = console.warn, l = console.log, i = console.info;
  console.warn = () => {}; console.log = () => {}; console.info = () => {};
  try { return await fn(); } finally { console.warn = w; console.log = l; console.info = i; }
}

export class MarkupSession {
  static async open(bytes, name = 'set.pdf') {
    const [e, reader, agents] = await Promise.all([env(), load(APP, 'pdf-read.js'), load(APP, 'agents.js')]);
    const rec = await quiet(() => reader.openPdf(e, bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), { fileId: 'f1', name: String(name).replace(/^.*[\\/]/, '') }));
    const s = new MarkupSession(rec, name);
    s.agents = agents;
    try { await reader.closePdf?.(rec.doc); } catch { /* fine */ }
    return s;
  }

  constructor(rec, name) { this.rec = rec; this.name = name; }

  sheetOf(key) { const p = this.rec.pages.find((x) => x.key === key); return p ? p.title || p.name || 'Page ' + (p.index + 1) : key; }

  sheets() {
    const count = new Map();
    for (const m of this.rec.markups) count.set(m.sheet, (count.get(m.sheet) || 0) + 1);
    return this.rec.pages.map((p) => ({ index: p.index, sheet: p.title, number: p.sheetNo || null, name: p.name || null, from: p.from || null,
      sizeIn: [Math.round(p.width / 72 * 100) / 100, Math.round(p.height / 72 * 100) / 100], rotate: p.rotate, markups: count.get(p.key) || 0, calibrated: !!this.rec.calibrations?.[p.key] }));
  }

  /** The same rows as the live window (agents.js in the app build). */
  markups({ sheet = null, status = null, type = null, author = null, offset = 0, limit = 200 } = {}) {
    const title = (k) => this.sheetOf(k);
    const hits = this.agents.filterMarkups(this.rec.markups, { sheet, status, type, author }, title);
    return { file: this.name, total: hits.length, offset, markups: hits.slice(offset, offset + limit).map((m) => this.agents.markupRow(m, title)) };
  }
}
