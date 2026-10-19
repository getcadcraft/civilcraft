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
import { load } from './apps.mjs';

const APP = 'cadcraft';
const DWG_TAGS = { AC1012: 'R13', AC1014: 'R14', AC1015: '2000', AC1018: '2004', AC1021: '2007', AC1024: '2010', AC1027: '2013', AC1032: '2018', AC1009: 'R12', AC1006: 'R10' };

let M = null;
/** The app's modules, loaded once. */
export async function cadModules() {
  if (M) return M;
  const [docm, cmd, geom, dxf, dxf2000, imp, read, save, plot, sheets, units, agents] = await Promise.all([
    load(APP, 'doc.js'), load(APP, 'commands.js'), load(APP, 'geom.js'), load(APP, 'dxf.js'), load(APP, 'dxf2000.js'),
    load(APP, 'dwg-import.js'), load(APP, 'dwg/read.js'), load(APP, 'dwg-save.js'), load(APP, 'plot.js'), load(APP, 'sheets.js'), load(APP, 'units.js'),
    load(APP, 'agents.js'),
  ]);
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

/** A drawing file → doc.load() input + a format label. */
export async function readDrawing(bytes, name) {
  const m = await cadModules();
  const ext = extOf(name);
  if (ext === 'dxf') {
    let text = new TextDecoder('utf-8').decode(bytes);
    if (text.includes('�')) text = new TextDecoder('windows-1252').decode(bytes);
    if (/^AutoCAD Binary DXF/.test(text)) throw new Error('Binary DXF is not read; save it as ASCII DXF.');
    const drawing = m.readDxf(text);
    const v = drawing.meta?.version;
    return { drawing, format: 'DXF' + (DWG_TAGS[v] ? ' ' + DWG_TAGS[v] : '') + (v ? ' (' + v + ')' : '') };
  }
  if (ext === 'dwg') {
    const tag = new TextDecoder().decode(bytes.subarray(0, 6));
    let model = null;
    try { model = m.readDwg(bytes); } catch (err) { model = null; }
    if (!model || !model.blocks?.length) throw new Error('This drawing could not be read. It may be damaged, or saved in a version the reader does not handle yet (' + (tag || 'unknown') + ').');
    return { drawing: m.importDwg(model, { versionTag: tag }), format: 'DWG' + (DWG_TAGS[tag] ? ' ' + DWG_TAGS[tag] : '') + ' (' + tag + ')' };
  }
  throw new Error('CadCraft opens DWG and DXF drawings; "' + name + '" is neither.');
}

export const parseScale = (doc, sc) => M.A.parseScale(doc, sc);

export class CadSession {
  constructor(doc, { undoPrefix = '' } = {}) {
    this.doc = doc;
    this.undoPrefix = undoPrefix;
    this.out = [];
    this.cmds = [];
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
      choose: need('This choice'), chooseBlock: need('Choosing a block'), pickDrawing: need('Picking a drawing file'), findDialog: need('The Find dialog'),
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
  async run(input, { select = null, label = null, timeout = 60000 } = {}) {
    this.out = [];
    const capture = (fn) => { const p = this.host.print; this.host.print = (s) => { fn(s); p(s); }; return () => { this.host.print = p; }; };
    return M.A.runInput(this.eng, this.doc, this.host, input, { select, label, prefix: this.undoPrefix, timeout, capture });
  }

  /** LISP text (a .lsp file's contents) loaded and run as one step. */
  async runLisp(text, { label = 'SCRIPT', name = 'script.lsp' } = {}) {
    const ctx = M.cmd.lookup('_LISPLOAD') && (await load(APP, 'lisp/install.js')).installLisp.ctx;
    if (!ctx) throw new Error('This CadCraft build has no LISP.');
    this.out = []; this.cmds = [];
    const before = this.snapshot();
    const mark = this.doc.mark();
    const job = { kind: 'load', files: [{ name, text: String(text), kind: 'lsp' }] };
    const p = ctx.runHidden(this.eng, '_LISPLOAD', label, job);
    await this.settle();
    let waiting = null;
    if (this.eng.busy) { waiting = { command: this.eng.running, kind: this.eng.expects, prompt: this.host.lastPrompt }; this.eng.escape(); await this.settle(); }
    await Promise.race([p, new Promise((r) => setTimeout(r, 100))]);
    this.doc.squash(mark, this.undoPrefix + label);
    const after = this.snapshot();
    const added = [...after.keys()].filter((id) => !before.has(id));
    const changed = [...after.keys()].filter((id) => before.has(id) && before.get(id) !== after.get(id));
    const removed = [...before.keys()].filter((id) => !after.has(id));
    const failed = this.out.find((l) => /could not be loaded|error/i.test(l) && /\.lsp/.test(l));
    return { printed: this.out.slice(0, 2000), commands: [...this.cmds], added, changed, removed, waiting,
      undo: this.doc.undoStack.length > mark ? this.doc.undoStack[this.doc.undoStack.length - 1].label : null, error: failed || null };
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

  /** A PDF of a sheet (layout) or of the model. */
  plot(o = {}) { return M.A.plotPdf(this.doc, o); }
}
