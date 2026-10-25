/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cad.mjs — CadCraft without a screen (docs/AGENTS-SPEC.md §2): the app's own Doc and command-line Engine, with a headless
 * host answering what the screen would.
 *
 *   const s = await CadSession.open(bytes, 'Plan.dwg');        // or CadSession.blank()
 *   const r = await s.run(['L', '0,0', '@10,0', '']);           // → {printed, added, changed, removed, waiting, undo, error}
 *   s.describe(); s.objects({layer: 'WALL', limit: 50}); s.check(rules);
 *   const { bytes, notes } = await s.save('dwg', { version: '2018' });
 *   const pdf = await s.plot({ layout: 'A101', paper: 'iso-a3', scale: '1:50' });
 *
 * Input lines are what a person types at CadCraft's command line ("" = Enter). Besides strings an input may be
 * {pick: [x, y]} (a click there), {window: [x1, y1, x2, y2], crossing} (a selection window), {entity: id, at: [x, y]}
 * (that object, where an object is asked for) or {escape: true}. A command still waiting after the last input is ended
 * with Esc, and the result says what it was waiting for. All of one call is ONE undo step, labelled `undoPrefix + what`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { load, vendorDir } from './apps.mjs';

const APP = 'cadcraft';

let M = null;
/** The app's modules, loaded once. */
export async function cadModules() {
  if (M) return M;
  const [docm, cmd, geom, dxf, dxf2000, imp, read, save, plot, sheets, units, agents] = await Promise.all([
    load(APP, 'doc.js'), load(APP, 'commands.js'), load(APP, 'geom.js'), load(APP, 'dxf.js'), load(APP, 'dxf2000.js'),
    load(APP, 'dwg-import.js'), load(APP, 'dwg/read.js'), load(APP, 'dwg-save.js'), load(APP, 'plot.js'), load(APP, 'sheets.js'), load(APP, 'units.js'),
    load(APP, 'agents.js'),
  ]);
  // plotted PDFs embed this font when a text needs more than Windows-1252 (plot.js; Node has no fetch for files)
  const fontDir = vendorDir('liberation-sans');
  if (fontDir && plot.setPdfFont) plot.setPdfFont(async () => new Uint8Array(fs.readFileSync(path.join(fontDir, 'LiberationSans-Regular.ttf'))));
  M = { Doc: docm.Doc, Engine: cmd.Engine, cmd, G: geom, readDxf: dxf.readDxf, writeDxf: dxf.writeDxf, writeDxf2000: dxf2000.writeDxf2000,
    importDwg: imp.importDwg, readDwg: read.readDwg, saveDwg: save.saveDwg, DWG_VERSIONS: save.DWG_VERSIONS, dwgVersionKey: save.dwgVersionKey, P: plot, S: sheets, U: units, A: agents };
  return M;
}

/** A script's lines: one per prompt answer; a blank line is Enter, but the newline that ends the file is not a line. */
export function scriptLines(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

export const extOf = (name) => (String(name).match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();
const tick = () => new Promise((r) => setImmediate(r));
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v * 1e9) / 1e9 : v);

/** A drawing file → doc.load() input + a format label (agents.js readDrawingBytes: the same reading the live window uses). */
export async function readDrawing(bytes, name) {
  const m = await cadModules();
  return m.A.readDrawingBytes(bytes, name);
}

export const parseScale = (doc, sc) => M.A.parseScale(doc, sc);

export class CadSession {
  constructor(doc, { undoPrefix = '' } = {}) {
    this.doc = doc;
    this.undoPrefix = undoPrefix;
    this.out = [];
    this.cmds = [];
    this.files = [];   // {name, bytes} answering the commands' file questions, in order (run's openFiles)
    const m = M, G = m.G, self = this;
    const need = (what) => () => { host.print(what + ' needs the app on screen.'); throw new m.cmd.Cancel(); };
    const host = this.host = {
      cursor: { x: 0, y: 0 }, selection: new Set(), shift: false, lastPrompt: '',
      print: (s) => { for (const l of String(s ?? '').split('\n')) self.out.push(l); },
      prompt: (s) => { host.lastPrompt = String(s || ''); },
      setSelection: (s) => { host.selection = new Set(s); },
      preview: () => {}, zoomExtents: () => {}, zoomWindow: () => {}, setToggle: () => {}, linkViews: () => {}, setPanes: () => {}, setLasso: () => {},
      onCommand: (name) => { if (name) self.cmds.push(name); },
      pickAt: (p) => {
        const tol = self.pickTolerance();
        let best = null, bd = tol;
        for (const e of doc.all()) {
          if (!doc.editable(e)) continue;
          const d = G.distToEntity(e, p, doc.blocks);
          if (d < bd) { bd = d; best = e.id; }
        }
        return best;
      },
      pickWindow: (w, crossing) => doc.all().filter((e) => doc.editable(e) && G.inWindow(e, w, crossing, doc.blocks)).map((e) => e.id),
      // no choose / chooseBlock: commands then ask on the command line, so the input answers them (0.7 MCP-ANSWERS)
      // a file a command asks for: the next of command_run's openFiles (0.7 MCP-HEADLESS), else it needs the app on screen
      pickDrawing: async () => { const f = self.nextFile(); if (!f) return need('Picking a drawing file')(); const { drawing } = await readDrawing(f.bytes, f.name); return { drawing, fileName: f.name }; },
      pickText: async () => { const f = self.nextFile(); return f ? { name: f.name, text: new TextDecoder().decode(f.bytes) } : need('Picking a file')(); },
      findDialog: need('The Find dialog'),
      openLibrary: need('The library'), quickSelect: need('Quick select'), plot: need('The plot dialog (use drawing_plot)'),
    };
    this.eng = new m.Engine(doc, host);
  }

  static async blank(opts) { const m = await cadModules(); const d = new m.Doc(); d.load({ meta: { name: 'Drawing1' } }); return new CadSession(d, opts); }

  static async open(bytes, name, opts = {}) {
    const m = await cadModules();
    const { drawing, format } = await readDrawing(bytes, name);
    const d = new m.Doc();
    d.load({ ...drawing, meta: { ...drawing.meta, name: String(name).replace(/^.*[\\/]/, '').replace(/\.[^.]+$/, ''), source: String(name).replace(/^.*[\\/]/, ''), format, size: bytes.length } });
    const s = new CadSession(d, opts);
    s.report = drawing.report || null;
    s.format = format;
    return s;
  }

  pickTolerance() {
    const b = this.extents();
    const size = b ? Math.max(b.maxX - b.minX, b.maxY - b.minY) : 100;
    return Math.max(size * 0.005, 1e-6);
  }

  extents() { try { return M.P.extentsOf(this.doc); } catch { return null; } }

  /** Let the Engine run until it waits for input or finishes. → false on timeout. */
  settle(timeout = 60000) { return M.A.settle(this.eng, timeout); }

  snapshot() {
    const snap = new Map();
    for (const [id, e] of this.doc.model) snap.set(id, e);
    for (const l of this.doc.layouts || []) for (const [id, e] of l.entities) snap.set(id, e);
    return snap;
  }

  /**
   * Run command-line input (agents.js runInput: the same code the live window runs). `select` = ids selected first.
   * → {printed, added, changed, removed, waiting, undo, error, commands}.
   */
  nextFile() { const f = this.files.shift() || null; if (f) this.filesUsed.push(f.path || f.name); return f; }

  async run(input, { select = null, label = null, timeout = 60000, keepOpen = false, resume = false, files = [] } = {}) {
    this.out = [];
    this.files = files.slice(); this.filesUsed = [];
    const capture = (fn) => { const p = this.host.print; this.host.print = (s) => { fn(s); p(s); }; return () => { this.host.print = p; }; };
    const r = await M.A.runInput(this.eng, this.doc, this.host, input, { select, label, prefix: this.undoPrefix, timeout, capture, keepOpen, resume: resume && !!this.held });
    this.held = r.waiting && r.waiting.open ? r.waiting.command : null;   // 0.7 MCP-ANSWERS: a command left open for the next call
    return r;
  }

  /** LISP text (a .lsp file's contents) loaded and run as one step (agents.js runLisp, as the live window). */
  async runLisp(text, { label = 'SCRIPT', name = 'script.lsp' } = {}) {
    this.out = []; this.cmds = [];
    const capture = (fn) => { const p = this.host.print; this.host.print = (s) => { fn(s); p(s); }; return () => { this.host.print = p; }; };
    return M.A.runLisp(this.eng, this.doc, this.host, text, { label, name, prefix: this.undoPrefix, capture });
  }

  /** Undo up to `steps` steps (only the assistant's unless any). */
  undo(steps = 1, { any = false } = {}) { return M.A.undoSteps(this.doc, steps, { any, prefix: this.undoPrefix }); }

  // ---------------------------------------------------------------- reading

  units() { return M.U.unitsOf(this.doc.meta); }
  describe() { return M.A.describeDrawing(this.doc, { report: this.report, format: this.format }); }
  plain(e, o) { return M.A.plainObject(this.doc, e, o); }
  objects(filters = {}) { return M.A.listObjects(this.doc, filters); }
  object(id) { return M.A.objectInFull(this.doc, id); }
  /** Layer and drafting rules (AGENTS-SPEC §5.3). */
  check(rules = {}) { return M.A.checkDrawing(this.doc, rules); }

  // ---------------------------------------------------------------- writing

  /** → {bytes, notes, format, ext}. format dwg | dxf (R12) | dxf2000. */
  save(format = 'dwg', { version = '2000' } = {}) {
    const d = this.doc;
    if (format === 'dwg') {
      const v = M.dwgVersionKey(version);
      if (!v) throw new Error('DWG versions: ' + M.DWG_VERSIONS.map((x) => x.key).reverse().join(', ') + '.');
      const { bytes, report } = M.saveDwg(d, { version: v });
      return { bytes, notes: report?.notes || [], format: 'DWG ' + v, ext: 'dwg' };
    }
    if (format === 'dxf2000') { const { text, report } = M.writeDxf2000(d); return { bytes: new TextEncoder().encode(text), notes: report?.notes || [], format: 'DXF 2000', ext: 'dxf' }; }
    if (format === 'dxf') { const { text, report } = M.writeDxf(d); return { bytes: new TextEncoder().encode(text), notes: report?.notes || [], format: 'DXF R12', ext: 'dxf' }; }
    throw new Error('Formats: dwg, dxf (R12), dxf2000.');
  }

  /** A PDF (or with svg: true an SVG) of a sheet (layout) or of the model. */
  plot(o = {}) { return o.svg ? M.A.plotSvg(this.doc, o) : M.A.plotPdf(this.doc, o); }

  /** The 3D model as OpenUSD bytes (agents.js drawingUsd, as the live window). */
  usd(o = {}) { return M.A.drawingUsd(this.doc, o); }

  /** A block with its attribute values, one undo step (agents.js insertBlock, as the live window). */
  async insert(o) {
    this.out = [];
    const capture = (fn) => { const p = this.host.print; this.host.print = (s) => { fn(s); p(s); }; return () => { this.host.print = p; }; };
    return M.A.insertBlock(this.eng, this.doc, this.host, o, { prefix: this.undoPrefix, capture });
  }
}
