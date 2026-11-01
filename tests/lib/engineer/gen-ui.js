/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gen-ui.js — the panel for the Generated feature (generated.js; 0.8 CE.3, engine-neutral since CE.12). A UI module (text through el());
 * the host hands in its state as `host` (docs/apps/engineer.md § The host-adapter contract) and calls:
 *   create()            props for a new Generated feature: the first shipped generator (generators/index.json), or null while it loads
 *   panel(f, grid, out) its right-panel rows: the generator, the inputs form made from the script's header, the operation, Run /
 *                       Stop, whether the body is up to date, the data sheet, and the script itself
 *   run(f)              run it now (the page also runs it when an input changes)
 * The script runs in a CraftScript worker of its own (not the Script workspace's, so the two never share variables); a run that
 * is no longer wanted (the inputs changed meanwhile) is thrown away and run again.
 */
import * as G from './generated.js';
import { t, host as hostOf, SH, MESH, F } from './host.js';
import { EXPORT_NOTICE, EXPORT_NOTICE_TITLE, wantsNotice } from './notice.js';
import { reportFromSheet } from './report-sheet.js';

export const GEN_TYPES = new Set(['generated']);
export const GEN_ICONS = { generated: 'cpu' };
export const GEN_MENU = ['generated'];
const RERUN_MS = 350;

export function installGenUI(host) {
  const { el } = host;
  const set = (f, label, fn) => host.setFeature(f.id, label, fn);
  const OWN_KEY = () => hostOf().storageKey, MAX_OWN = 20;
  const S = { engine: null, printed: [], busy: new Set(), again: new Set(), errors: new Map(), timers: new Map(), list: [], texts: new Map(), loading: null, own: readOwn() };
  /** Generators the person opened from files (ADDONS-SPEC § 17): kept in this browser, read as untrusted data every time. */
  function readOwn() {
    try {
      const raw = JSON.parse(localStorage.getItem(OWN_KEY()) || '[]');
      return Array.isArray(raw) ? raw.filter((g) => g && /^own-[0-9a-f]{16}$/.test(g.id) && typeof g.text === 'string' && g.text.length <= G.MAX_SCRIPT && typeof g.title === 'string').slice(0, 20).map((g) => ({ id: g.id, title: g.title.slice(0, 80), text: g.text })) : [];
    } catch { return []; }
  }
  const saveOwn = () => { try { localStorage.setItem(OWN_KEY(), JSON.stringify(S.own)); } catch { /* storage off: they last until the page closes */ } };
  /** Add generators from a .craft / .lua / .py file's text or a bundle { format: 'cadcraft-generators', version: 1, generators: [{ title?, text, lang? }] }. → the ids added. */
  function addGenerators(text, name = '') {
    let items;
    const trimmed = String(text).trim();
    if (trimmed.startsWith('{')) {
      let j; try { j = JSON.parse(trimmed); } catch { throw new Error(t('gb.ui.add.bad')); }
      if (!j || j.format !== 'cadcraft-generators' || j.version !== 1 || !Array.isArray(j.generators)) throw new Error(t('gb.ui.add.bad'));
      items = j.generators.slice(0, 20).map((g) => ({ text: typeof g.text === 'string' ? g.text : '', lang: g.lang }));
    } else items = [{ text: String(text), lang: /\.lua$/i.test(name) ? 'lua' : /\.py$/i.test(name) ? 'python' : 'craft' }];
    const added = [];
    for (const it of items) {
      if (!it.text || it.text.length > G.MAX_SCRIPT) throw new Error(t('gb.ui.add.big'));
      const head = G.parseHeader(it.text);
      if (!head.title && !head.inputs.length) throw new Error(t('gb.ui.add.no_header'));
      const id = 'own-' + F.fingerprint(new TextEncoder().encode(it.text));
      if (!S.own.some((g) => g.id === id)) { if (S.own.length >= MAX_OWN) S.own.shift(); S.own.push({ id, title: head.title || name || id, text: it.text, lang: it.lang === 'lua' || it.lang === 'python' ? it.lang : 'craft' }); }
      added.push(id);
    }
    saveOwn();
    return added;
  }
  function removeGenerator(id) { S.own = S.own.filter((g) => g.id !== id); saveOwn(); }


  // ---- the shipped generators (generators/index.json + one file each), loaded once
  const base = () => hostOf().urls.generators;
  function load() {
    if (!S.loading) S.loading = (async () => {
      try {
        const idx = await (await fetch(new URL('index.json', base()))).json();
        S.list = (idx.generators || []).filter((g) => /^[a-z0-9-]+$/.test(g.id) && /^[a-z0-9-]+\.craft$/.test(g.file)).slice(0, 100);
        for (const g of S.list) { const r = await fetch(new URL(g.file, base())); if (r.ok) S.texts.set(g.id, await r.text()); }
      } catch { /* offline or not served: the panel offers the script box only */ }
      return S.list;
    })();
    return S.loading;
  }
  load();

  const genProps = (id) => {
    const own = S.own.find((g) => g.id === id);
    const text = own ? own.text : S.texts.get(id);
    return text === undefined ? null : { script: { lang: own && own.lang ? own.lang : 'craft', text }, gen: { id, hash: F.fingerprint(new TextEncoder().encode(text)) } };
  };
  /** Every generator the person can start from: the ones that ship, then their own. [{ id, title, own }] */
  const catalog = () => [...S.list.map((g) => ({ id: g.id, title: g.title, own: false, exportNotice: wantsNotice(g) })), ...S.own.map((g) => ({ id: g.id, title: g.title, own: true, exportNotice: false }))];
  /** A new Generated feature's properties from a generator id (null while the shipped ones load). */
  const propsFor = (id) => genProps(id);

  function create() {
    const first = S.list[0] && genProps(S.list[0].id);
    if (!first) { host.status(t('gb.ui.loading')); return null; }
    return first;
  }

  // ---- running
  function engine() {
    if (!S.engine) S.engine = SH.createEngine({ makeWorker: () => host.computeWorker(hostOf().workerModules, { name: 'Engineer generators' }), onPrint: (x) => S.printed.push(x) });   // i18n-ignore: the worker's name, shown only in developer tools
    return S.engine;
  }
  async function run(f) {
    if (S.busy.has(f.id)) { S.again.add(f.id); return; }
    clearTimeout(S.timers.get(f.id));
    S.busy.add(f.id); S.errors.delete(f.id); S.printed = [];
    host.status(t('gb.ui.running', { name: f.name }));
    host.renderProps();
    let r;
    try { r = await G.runGenerator(engine(), f, { printed: S.printed, libBase: hostOf().urls.craftlib.href }); } catch (e) { r = { ok: false, error: { message: String(e && e.message || e), line: 0, col: 0 }, log: '' }; }
    S.busy.delete(f.id);
    const cur = hostOf().features.byId(host.part, f.id);
    if (!cur) return;                                                     // deleted meanwhile
    if (S.again.delete(f.id) || (r.ok && G.genKey(cur) !== r.key)) { run(cur); return; }   // the inputs moved on: this answer is for the old ones
    if (!r.ok) {
      if (!/^Stopped/.test(r.error.message)) S.errors.set(f.id, r.error);
      host.status(t('gb.ui.failed', { name: f.name, error: r.error.message }));
      host.renderProps();
      return;
    }
    set(cur, t('gb.ui.undo.run'), (g) => G.applyRun(g, r));
    host.built().then(() => {
      const res = host.regen?.results.get(f.id);
      host.status(res?.status === 'error' ? t('gb.ui.feature_error', { name: f.name, error: res.message }) : t('gb.ui.done', { name: f.name, n: cur.mesh ? cur.mesh.nt : 0 }));
    });
  }
  function stop(f) { if (S.engine) { S.engine.stop(); } S.again.delete(f.id); S.busy.delete(f.id); host.status(t('gb.ui.stopped', { name: f.name })); host.renderProps(); }
  /** After an input changed: run once the typing stops. */
  const rerun = (f) => { clearTimeout(S.timers.get(f.id)); S.timers.set(f.id, setTimeout(() => { const cur = hostOf().features.byId(host.part, f.id); if (cur) run(cur); }, RERUN_MS)); };

  // ---- data out (CE.7): the data sheet, the field and the surface for ParaView and FEA / CFD tools, the mesh with the generator's data
  const MAX_VTI_TRIS = 400000;
  function exportTo(f, kind) {
    const head = G.parseHeader(f.script.text), vals = G.inputValues(head, f.inputs), base = (host.part.name || 'part') + ' ' + f.name;
    if (kind === 'report-md' || kind === 'report-html') {                                  // IND.5: the clause-traced calculation report (lib/report)
      const r = reportFromSheet({ title: base, generator: { id: f.gen ? f.gen.id : '', title: head.title, hash: f.gen ? f.gen.hash : '' }, inputs: vals, rows: f.sheet || [], date: new Date().toISOString().slice(0, 10) });
      if (!r.ok) { host.status(t('gb.ui.export.failed', { error: r.errors.join('; ') })); return; }
      if (kind === 'report-md') host.download(r.markdown, base + ' calculation report.md', 'text/markdown');            // i18n-ignore: a file name
      else host.download(r.html, base + ' calculation report.html', 'text/html');                                          // i18n-ignore: a file name
      host.status(t('gb.ui.export.saved', { name: f.name }));
      return;
    }
    const m = MESH.decodeMesh(f.mesh);
    const sheet = F.dataSheet({
      name: host.part.name || f.name, generator: { id: f.gen ? f.gen.id : '', title: head.title, hash: f.gen ? f.gen.hash : '' }, inputs: vals, rows: f.sheet || [], problems: f.problems || [],
      mesh: { triangles: f.mesh.nt, vertices: f.mesh.nv, hash: F.fingerprint(m.positions, m.indices) }, report: f.report || null,
      notice: EXPORT_NOTICE_TITLE + ' ' + EXPORT_NOTICE,   // the footer of every data sheet (O3)
    });
    const words = Object.fromEntries(['title', 'generator', 'inputs', 'values', 'name', 'value', 'unit', 'source', 'checks', 'none', 'body', 'triangles', 'closed', 'solver', 'hash'].map((k) => [k, t('gb.pdf.' + k)]));
    if (kind === 'json') host.download(F.dataSheetJson(sheet), base + ' data sheet.json', 'application/json');                       // i18n-ignore: a file name
    else if (kind === 'pdf') host.download(F.dataSheetPdf(sheet, words), base + ' data sheet.pdf', 'application/pdf');               // i18n-ignore: a file name
    else if (kind === 'vtu') host.download(F.toVTU(m, { name: f.name }), base + '.vtu', 'application/xml');                           // i18n-ignore: a file name
    else if (kind === '3mf') {
      const meta = { generator: f.gen ? f.gen.id : head.title, generator_hash: f.gen ? f.gen.hash : '', inputs: JSON.stringify(vals), mesh_hash: sheet.mesh.hash };
      const lo = (f.sheet || []).find((r) => r.name === 'wall_thinnest'), hi = (f.sheet || []).find((r) => r.name === 'wall_thickest');
      if (lo && hi) meta.regions = JSON.stringify([{ name: 'lightest lattice', wall_mm: lo.value }, { name: 'heaviest lattice', wall_mm: hi.value }]);   // i18n-ignore: file metadata, read by other programs
      host.download(F.threeMF({ positions: m.positions, indices: m.indices }, meta, { name: host.part.name || f.name }), base + '.3mf', 'model/3mf');   // i18n-ignore: a file name
    } else if (kind === 'vti' || kind === 'vdb') {                                     // the field: VTK image data, or an OpenVDB level set (lib/field/vdb.js)
      if (f.mesh.nt > MAX_VTI_TRIS) { host.status(t('gb.ui.export.vti_big', { n: MAX_VTI_TRIS })); return; }
      host.status(t('gb.ui.export.vti_working'));
      setTimeout(() => {                                                              // after the status is painted: building the field from the surface takes a while
        try {
          const h = typeof vals.h === 'number' && vals.h > 0 ? vals.h : 0.5;
          const grid = F.fromMesh({ positions: m.positions, indices: m.indices }, { h });
          if (kind === 'vti') host.download(F.toVTI(grid), base + '.vti', 'application/xml');                                        // i18n-ignore: a file name
          else host.download(F.toVDB(grid, { name: f.name }), base + '.vdb', 'application/octet-stream');                         // i18n-ignore: a file name
          host.status(t('gb.ui.export.saved', { name: f.name }));
        } catch (e) { host.status(e && e.code === 'toobig' ? t('gb.ui.export.vdb_big') : t('gb.ui.export.failed', { error: String(e && e.message || e) })); }
      }, 30);
      return;
    }
    host.status(t('gb.ui.export.saved', { name: f.name }));
  }

  // ---- the panel
  /** The export-control notice, word for word (notice.js; docs/0.8-PART3.md § O3). */
  const noticeBox = () => el('p', { className: 'pc-note', dataset: { engNotice: '' } }, el('strong', {}, EXPORT_NOTICE_TITLE), ' ' + EXPORT_NOTICE);
  const fmtVal = (v) => (typeof v === 'number' ? (Number.isInteger(v) ? String(v) : String(+v.toPrecision(6))) : String(v));
  function inputRow(f, head, inp) {
    const vals = G.inputValues(head, f.inputs), v = vals[inp.name];
    const change = (nv) => { set(f, t('gb.ui.undo.input', { name: inp.label }), (g) => { g.inputs = { ...g.inputs, [inp.name]: nv }; }); rerun(f); };
    const label = inp.label + (inp.unit ? ' (' + inp.unit + ')' : '');
    if (inp.kind === 'number') return host.field(label, host.numInput(v, change, { min: inp.min ?? undefined, max: inp.max ?? undefined }));
    if (inp.kind === 'choice') return host.field(label, host.selectInput(inp.choices.map((c) => [c, c]), v, change));
    if (inp.kind === 'bool') return [host.check(inp.label, v, change)];
    return host.field(label, host.textInput(v, change, { max: 200 }));
  }

  function panel(f, grid, out) {
    const head = G.parseHeader(f.script.text), busy = S.busy.has(f.id);
    const title = head.title || (f.gen && catalog().find((g) => g.id === f.gen.id)?.title) || t('gb.ui.own_script');
    // which generator
    if (catalog().length) {
      const opts = [['', t('gb.ui.own_script')], ...catalog().map((g) => [g.id, g.title])];
      grid.push(...host.field(t('gb.ui.generator'), host.selectInput(opts, f.gen && catalog().some((g) => g.id === f.gen.id) ? f.gen.id : '', (id) => {
        if (!id) { set(f, t('gb.ui.undo.generator'), (g) => { g.gen = null; }); return; }
        const p = genProps(id); if (!p) return;
        set(f, t('gb.ui.undo.generator'), (g) => { g.script = p.script; g.gen = p.gen; g.inputs = {}; });
        rerun(f);
      })));
    } else grid.push(el('span', { className: 'k' }, t('gb.ui.generator')), el('span', { className: 'v' }, title));
    for (const inp of head.inputs) grid.push(...inputRow(f, head, inp));
    if (!head.inputs.length) grid.push(el('p', { className: 'pc-note span' }, t('gb.ui.no_inputs')));
    grid.push(...host.field(t('gb.ui.op'), host.selectInput([['add', t('gb.ui.op.add')], ['cut', t('gb.ui.op.cut')], ['intersect', t('gb.ui.op.intersect')]], f.op, (v) => set(f, t('gb.ui.undo.op'), (g) => { g.op = v; }))));
    out.push(el('div', { className: 'pc-props' }, ...grid));
    grid.length = 0;
    // state + Run / Stop
    const err = S.errors.get(f.id);
    const state = busy ? t('gb.ui.state.running') : err ? t('gb.ui.state.failed') : !f.mesh ? t('gb.ui.state.never') : G.isStale(f) ? t('gb.ui.state.stale') : t('gb.ui.state.fresh');
    out.push(el('p', { className: 'pc-note', dataset: { genState: busy ? 'running' : err ? 'failed' : !f.mesh ? 'never' : G.isStale(f) ? 'stale' : 'fresh' } }, state));
    if (err) out.push(el('p', { className: 'pc-msg is-error', dataset: { genError: '' } }, (err.line ? t('gb.ui.error_line', { line: err.line }) + ' ' : '') + err.message));
    out.push(el('div', { className: 'pc-actions' }, busy ? host.btn(t('gb.ui.stop'), () => stop(f), 'pc-btn', { dataset: { genStop: '' } }) : host.btn(t('gb.ui.run'), () => run(f), 'pc-btn is-primary', { dataset: { genRun: '' } })));
    if (f.mesh && f.report && !f.report.closed) out.push(el('p', { className: 'pc-msg is-warn' }, t('gb.ui.not_closed')));
    if (f.log) out.push(el('details', {}, el('summary', {}, t('gb.ui.printed')), el('pre', { className: 'pc-pre' }, f.log)));
    // what the manufacturing checks found (also in the shell's Problems panel)
    if (f.problems && f.problems.length) {
      out.push(el('p', { className: 'pc-props-sub' }, t('gb.ui.problems')));
      out.push(el('ul', { className: 'pc-list', dataset: { genProblems: '' } }, ...f.problems.map((p) => el('li', { dataset: { severity: p.severity } }, t('mfg.p.' + p.code, p.vars)))));
    }
    // the data sheet
    if (f.sheet && f.sheet.length) {
      out.push(el('p', { className: 'pc-props-sub' }, t('gb.ui.sheet')));
      out.push(el('table', { className: 'pc-table', dataset: { genSheet: '' } },
        el('thead', {}, el('tr', {}, ...['name', 'value', 'unit', 'source'].map((k) => el('th', { scope: 'col' }, t('gb.ui.col.' + k))))),
        el('tbody', {}, ...f.sheet.map((r) => el('tr', {}, el('td', {}, r.name.replace(/_/g, ' ')), el('td', {}, fmtVal(r.value)), el('td', {}, r.unit || ''), el('td', {}, r.ref || r.note || ''))))));
      out.push(noticeBox());                                   // the footer of every data sheet (O3)
    }
    // data out
    if (f.mesh) out.push(el('details', {}, el('summary', {}, t('gb.ui.export')), el('div', { className: 'pc-actions', dataset: { genExport: '' } },
      ...[['json', 'gb.ui.export.json'], ['pdf', 'gb.ui.export.pdf'], ['report-md', 'gb.ui.export.report_md'], ['report-html', 'gb.ui.export.report_html'], ['vti', 'gb.ui.export.vti'], ['vdb', 'gb.ui.export.vdb'], ['vtu', 'gb.ui.export.vtu'], ['3mf', 'gb.ui.export.3mf']].map(([k, key]) => host.btn(t(key), () => exportTo(f, k), 'pc-btn', { dataset: { genExportKind: k } })))));
    // the script itself
    const ta = el('textarea', { className: 'pc-input', rows: 10, spellcheck: false, value: f.script.text, dataset: { genScript: '' }, style: 'width:100%;font-family:var(--bs-font-monospace,monospace);font-size:.8em' });
    ta.addEventListener('change', () => { set(f, t('gb.ui.undo.script'), (g) => { g.script = { lang: g.script.lang, text: ta.value.slice(0, G.MAX_SCRIPT) }; g.gen = null; }); rerun(f); });
    out.push(el('details', {}, el('summary', {}, t('gb.ui.script')), ta, el('p', { className: 'pc-note' }, t('gb.ui.script_note'))));
  }

  return { create, panel, notice: noticeBox, run, ready: () => load(), catalog, propsFor, addGenerators, removeGenerator, isBusy: (id) => S.busy.has(id), stop };
}
