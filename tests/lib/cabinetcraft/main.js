/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — the CabinetCraft add-on (0.8 DC.117, sessions `cabinetcraft_addon` and `cabinetcraft_hosts`; canonical in lib/cabinetcraft/, copied byte for byte into PartCraft, BimCraft, CadCraft and
 * ModelCraft by tools/cabinetcraft/sync.mjs): the cabinet-designer workflow on top of the
 * cabinet model, lib/cutlist and lib/nest that CadCraft's Cabinets add-on (SU.1035) already carries. Add-on API 1.0 (the PartCraft API of
 * docs/ADDONS-SPEC.md § 5.7). It adds a panel tab "CabinetCraft", four exporters (cut list, drilling list lives in the tab, job file,
 * drawings), three commands, and a source of Problems when the page has the Problems panel.
 *
 * It touches no solid of the model: with API 1.1 it can place the job's cabinets as display bodies in the viewport (one undo step, removable as a group). A job is its own file (`.cabinetcraft.json`) kept in this browser (api.storage) and saved by the person.
 * Logic is in lib/ (pure modules, Node tests in test/); this file only wires them to the app.
 */
import { setT } from './lib/core.js';
import { cleanProject, newProject, sampleProject } from './lib/project.js';
import * as E from './lib/edit.js';
import { addRun } from './lib/edit.js';
import { analyze } from './lib/analyze.js';
import { nestAsync } from './lib/nestasync.js';
import { blobWorker } from './lib/blobworker.js';
import { viewportBodies, GROUP } from './lib/bodies3d.js';
import { sheetSet, sheetSetHtml, bestView } from './lib/drawings.js';
import * as X from './lib/export.js';
import { arcFromThree } from './lib/angled.js';
import { roomPts, outlineOf } from './lib/room.js';
import { dryRunGcode, checkHoles } from './lib/dryrun.js';
import { firstRunChecklist, makerReview } from './lib/review.js';
import { mountPanel } from './lib/ui.js';
import { applyModelRoom } from './lib/fromroom.js';
import { detect } from './host.js';   // the ONE file that differs per app: what that app can do with the cabinets (hosts/<slug>.js)

const NEST = { tries: 6, timeLimit: 4000 };   // per material; on a Web Worker (lib/nest-worker.js) so the page stays alive, else on the page's thread one material at a time

export function activate(api) {
  setT(api.t);
  const t = (k, v) => api.t(k, v);
  // The host adapter is chosen by what the api offers (detect looks at api.model.write, api.doc, api.model.addBodies …), never by the app's name; null = only the shared parts.
  let host = null;
  try { host = detect(api, { t }); } catch (e) { api.log('host adapter failed', e); /* i18n-ignore */ }
  const tellStatus = (m) => { try { if (typeof api.status === 'function') api.status(m); else if (typeof api.print === 'function') api.print(m); } catch { /* no status line */ } };
  let styleEl = null;
  if (host && host.styles && typeof document !== 'undefined' && document.head) { styleEl = document.createElement('style'); styleEl.setAttribute('data-cc-cabinetcraft-style', ''); styleEl.textContent = host.styles; document.head.append(styleEl); }
  let stored = null;
  try { stored = api.storage.get('job'); } catch { stored = null; }
  let project = stored ? cleanProject(stored) : addRun(newProject('mm'), 'S');
  const S = { project, view: 'layout', run: project.runs[0]?.id || null, edit: null, drawing: 'plan', isoView: null, nest: null, nestKey: '', files: [], post: 'grbl', tool: 6, template: 'a4-24', msg: '', install: false, pick: [], pickArcs: [], pickMid: null, pickAny: false, pickArc: false, dry: null, holes: null, rapid: (() => { try { return api.storage.get('rapid') || ''; } catch { return ''; } })(), nesting: false, progress: null, shell3d: true, ratesNote: '' };
  let pane = null, cache = null;
  const src = (() => { try { return api.problems && typeof api.problems.source === 'function' ? api.problems.source({ id: 'cabinets', kind: 'check', label: t('name') }) : null; } catch { return null; } })();
  const problemsOn = (() => { try { return !!(api.problems && api.problems.available && api.problems.available()); } catch { return false; } })();

  const say = (k, v) => t(k, v);
  const keyOf = () => JSON.stringify({ ...S.project, rates: 0 });
  const save = () => { try { api.storage.set('job', S.project); } catch { /* storage may be unavailable: the job is still in the page */ } };
  function analysis() {
    const key = keyOf() + '|' + S.install + '|' + (S.nest ? 1 : 0);
    if (cache && cache.key === key + '|' + JSON.stringify(S.project.rates)) return cache.value;
    if (S.nest && S.nestKey !== keyOf()) S.nest = null;       // an edit that changes the parts makes the nest stale
    const value = analyze(S.project, { say, word: t, t, nest: S.nest, install: S.install });
    // what this app cannot do, said where Problems are said (the host adapter knows): no G-code outside PartCraft, and the cabinets in the model, building or drawing are made when asked
    if (host && host.id !== 'part') {
      const note = (code, text) => ({ id: 'cabinetcraft:' + code + ':host', code, severity: 'note', text, about: [{ kind: 'job', id: 'job' }] });
      if (host.gcode === false) value.problems.push(note('host.nogcode', t('prob.host.nogcode')));
      value.problems.push(note('host.snapshot', t('prob.host.snapshot')));
    }
    cache = { key: key + '|' + JSON.stringify(S.project.rates), value };
    try { src?.set(value.problems); } catch (e) { api.log('problems', e); }
    return value;
  }
  const render = () => { if (!pane) return; pane.replaceChildren(); try { mountPanel(pane, app); } catch (e) { api.log('panel failed', e); /* i18n-ignore */ pane.textContent = String(e && e.message || e); } };
  const download = (name, data, mime) => {
    const d = pane?.ownerDocument || (typeof document !== 'undefined' ? document : null);
    if (!d) return;
    const a = d.createElement('a');
    a.download = name; a.href = URL.createObjectURL(new Blob([data], { type: mime || 'text/plain' }));
    d.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  };
  const base = () => (S.project.name || 'job').replace(/[^A-Za-z0-9._ -]+/g, '_').slice(0, 40) || 'job';
  const say2 = (m) => { S.msg = m; tellStatus(m); render(); };
  const fmt = (v) => String(Math.round(v * 100) / 100);

  // the nest runs on a Web Worker when this page can start one from the add-on's own folder (its modules linked as blob: modules, as PartCraft's own workers are,
  // because the page is cross-origin isolated); else on the page's thread
  const makeWorker = (typeof Worker !== 'undefined' && /^https?:/.test(import.meta.url)) ? () => blobWorker(new URL('./lib/nest-worker.js', import.meta.url).href) : null;

  const app = {
    t, get: () => S, problemsOn,
    sample: (unit) => sampleProject(unit, { name: t('sample.name'), north: t('wall.N'), east: t('wall.E') }),
    analysis,
    change(next, { reset = false } = {}) {
      S.project = cleanProject(next);
      if (reset || ![...S.project.runs, ...S.project.islands].find((r) => r.id === S.run)) S.run = S.project.runs[0]?.id || S.project.islands[0]?.id || null;
      if (reset) { S.nest = null; S.files = []; S.edit = null; S.msg = ''; }
      save(); render();
    },
    load(text) { try { app.change(JSON.parse(text), { reset: true }); say2(t('msg.opened')); } catch { say2(t('msg.badfile')); } },
    setView(v) { S.view = v; S.msg = ''; render(); },
    select(id) { S.run = id; S.edit = null; render(); },
    edit(k) { S.edit = k; render(); },
    drawing(id) { S.drawing = id; render(); },
    rotate(d) { const cur = S.isoView ?? bestView(analysis().build); S.isoView = (cur + d + 4) % 4; render(); },
    install(on) { S.install = !!on; render(); },
    post(v) { S.post = v; },
    tool(v) { if (v > 0) S.tool = v; },
    template(v) { S.template = v; },
    sheets() { const a = analysis(); return sheetSet(a.build, { title: S.project.name, view: S.isoView }); },
    pickFile(accept) {
      const d = pane.ownerDocument;
      return new Promise((resolve) => {
        const i = d.createElement('input'); i.type = 'file'; i.accept = accept; i.hidden = true;
        i.addEventListener('change', async () => { const f = i.files && i.files[0]; i.remove(); resolve(f ? await f.text() : null); });
        i.addEventListener('cancel', () => { i.remove(); resolve(null); });
        d.body.append(i); i.click();
      });
    },
    download,
    async run(fn) {
      S.msg = t('msg.working'); render();
      await new Promise((r) => setTimeout(r, 30));
      try { await fn(); } catch (e) { api.log('run failed', e); /* i18n-ignore */ S.msg = String(e && e.message || e); render(); }
    },
    say2: (m) => say2(m),
    pickPoint(x, y) {
      const g = S.project.unit === 'in' ? 2 : 50;
      let px = Math.round(x / g) * g, py = Math.round(y / g) * g;
      const last = S.pick[S.pick.length - 1];
      if (S.pickArc && last) {   // an arc is three points: where it starts (the last corner), a point on it, where it ends
        if (!S.pickMid) { S.pickMid = [px, py]; render(); return; }
        const a = arcFromThree(last, S.pickMid, [px, py]);
        S.pickMid = null;
        if (!a || Math.abs(a.sweep) < 0.5 || Math.abs(a.sweep) > 170) { say2(t('room.arc.bad')); return; }
        S.pickArcs = [...S.pickArcs, { i: S.pick.length - 1, sweep: a.sweep }];
        S.pick = [...S.pick, [px, py]]; render(); return;
      }
      if (last && !S.pickAny) { if (Math.abs(px - last[0]) >= Math.abs(py - last[1])) py = last[1]; else px = last[0]; if (px === last[0] && py === last[1]) return; }
      else if (last && px === last[0] && py === last[1]) return;
      S.pick = [...S.pick, [px, py]]; render();
    },
    pickAny(on) { S.pickAny = !!on; render(); },
    pickArc(on) { S.pickArc = !!on; S.pickMid = null; render(); },
    pickUndo() { S.pick = S.pick.slice(0, -1); S.pickArcs = S.pickArcs.filter((a) => a.i < S.pick.length - 1); S.pickMid = null; render(); },
    pickClear() { S.pick = []; S.pickArcs = []; S.pickMid = null; render(); },
    pickClose() {
      const pts = S.pick.map((q) => q.slice());
      if (pts.length < 3) return;
      const f = pts[0], l = pts[pts.length - 1];
      if (!S.pickAny && f[0] !== l[0] && f[1] !== l[1]) pts.push([f[0], l[1]]);   // the closing edge must run along x or y: add the corner
      // arcs were measured with the room on the left of the way you clicked; the outline's sign is physical (+ away from the room), so flip it if you clicked clockwise
      const cw = pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + (p[0] * q[1] - q[0] * p[1]); }, 0) < 0;
      const arcs = S.pickArcs.map((a) => ({ i: a.i, sweep: cw ? -a.sweep : a.sweep }));
      const next = E.setOutline(S.project, pts, arcs);
      if (next === S.project) { say2(t('room.free.bad')); return; }
      S.pick = []; S.pickArcs = []; S.pickMid = null;
      app.change(next); say2(t('room.pick.done', { n: next.room.pts ? next.room.pts.length : 4 }));
    },
    setSegments(text) { const next = E.setSegments(S.project, text); if (next === S.project) { say2(t('room.seg.bad')); return; } app.change(next); say2(t('room.seg.done', { n: next.room.pts ? next.room.pts.length : 4 })); },
    // ---- dry run: the programs and the hole list, read by a very small simulator (lib/dryrun.js). Nothing is run on a machine.
    dryRun() {
      const a = analysis();
      const rapid = Number(S.rapid) > 0 ? Number(S.rapid) : null;
      const unit = a.build.project.unit === 'in' ? 'in' : 'mm';
      const toMm = unit === 'in' ? 25.4 : 1;
      S.dry = (S.files || []).map((f) => {
        const mat = S.nest && S.nest.mats[f.group];
        const pu = /\bG20\b/.test(f.text) ? 'in' : 'mm', k = (pu === 'in' ? 1 / 25.4 : 1) * toMm;   // the program's units; the sheet and thickness are the job's
        const r = dryRunGcode(f.text, { sheet: mat ? { w: mat.sheet.w * k, h: mat.sheet.h * k } : null, thickness: (f.thickness || 0) * k, unit: pu, rapid: rapid && pu === 'in' ? rapid / 25.4 : rapid });
        return { name: f.name, ...r };
      });
      S.holes = checkHoles(a.build);
      render();
      return { dry: S.dry, holes: S.holes };
    },
    setRapid(v) { S.rapid = v; try { api.storage.set('rapid', v); } catch { /* storage may be unavailable */ } },
    // ---- the host adapter (hosts/<slug>.js): sections of actions in the Drawings and Export views, a room read from the model, G-code only where a CAM export exists
    get host() { return host; },
    hasGcode: () => !host || host.gcode !== false,
    showViewport: () => !host || host.id === 'part',
    hostCtx: () => { const a = analysis(); return { api, t, project: S.project, analysis: a, build: a.build, list: a.list, est: a.est, nest: S.nest, say2, fmt, base, download, site: S.project.site || null }; },
    hostSections(where) { try { return host && typeof host.sections === 'function' ? host.sections(app.hostCtx()).filter((x) => (x.where || 'drawings') === where) : []; } catch (e) { api.log('host sections', e); return []; } },
    async hostRun(actionId) {
      let action = null;
      try { for (const sec of host.sections(app.hostCtx())) for (const a of sec.actions || []) if (a.id === actionId) action = a; } catch { action = null; }
      if (!action) return null;
      S.msg = t('msg.working'); render();
      await new Promise((r) => setTimeout(r, 20));
      try { const r = await action.run(app.hostCtx()); say2(typeof r === 'string' ? r : S.msg === t('msg.working') ? '' : S.msg); return r; } catch (e) { api.log('host action failed', actionId, e); /* i18n-ignore */ say2(String((e && e.message) || e)); return null; }
    },
    hostRoomInfo: () => (host && host.room ? { label: host.room.label, note: host.room.note } : null),
    async hostRooms() { try { S.hostRooms = await host.room.list(); } catch (e) { S.hostRooms = []; S.hostRoomsErr = String((e && e.message) || e); } render(); return S.hostRooms; },
    async useHostRoom(id) {
      try {
        const m = await host.room.read(id);
        if (!m) { say2(t('hostroom.none')); return false; }
        const r = applyModelRoom(S.project, { ...m, host: host.id });
        if (r.error) { say2(t('hostroom.bad')); return false; }
        app.change(r.project, { reset: false });
        say2(t('hostroom.done', { name: m.name || id, walls: (r.project.room.pts ? r.project.room.pts.length : 4), placed: r.placed.length, skipped: r.skipped.length }));
        return true;
      } catch (e) { api.log('host room failed', e); /* i18n-ignore */ say2(String((e && e.message) || e)); return false; }
    },
    has3d: () => !!(api.model && typeof api.model.addBodies === 'function' && (!host || host.id === 'part')),
    count3d: () => { try { return api.model?.bodies().find((g) => g.group === GROUP)?.count || 0; } catch { return 0; } },
    shell3d(v) { S.shell3d = !!v; },
    place3d() {
      if (!app.has3d()) { say2(t('v3d.unavailable')); return 0; }
      const a = analysis();
      const bodies = viewportBodies(a.build, { word: t, room: S.shell3d !== false });
      const n = api.model.addBodies(GROUP, bodies, { name: S.project.name || t('name'), label: t('v3d.label') });
      say2(t('v3d.done', { n }));
      return n;
    },
    remove3d() {
      const was = api.model.removeBodies(GROUP, { label: t('v3d.label.remove') });
      say2(was ? t('v3d.removed') : t('v3d.none'));
      return was;
    },
    importRates(text) {
      const r = E.mergeRates(S.project, text);
      S.ratesNote = t('cost.import.result', { n: r.applied.length, ignored: r.ignored.length }) + (r.ignored.length ? ' ' + r.ignored.slice(0, 6).map((x) => x.key + ' (' + t('cost.import.' + x.reason) + ')').join(', ') : '');
      app.change(r.project);
    },
    async nest() {
      if (S.nesting) return S.nest;
      S.nesting = true; S.progress = { fraction: 0, text: t('exp.nest.start') }; S.msg = ''; render();
      const a = analysis();
      const key = keyOf();
      let shown = 0;
      try {
        const result = await nestAsync(a.build, {
          say, ...NEST, makeWorker,
          onProgress: (p) => {
            const now = Date.now();
            S.progress = { fraction: Math.min(0.99, ((p.group - 1) + p.done / Math.max(1, p.total)) / Math.max(1, p.groups)), text: t('exp.nest.progress', { n: p.group, of: p.groups, material: p.material, done: p.done, total: p.total }) };
            if (now - shown > 120) { shown = now; render(); }
          },
        });
        S.nest = result; S.nestKey = key; S.files = [];
        cache = null;
        S.nesting = false; S.progress = null;
        say2(t('msg.nested', { n: S.nest.sheets, u: S.nest.unplaced.length }));
      } catch (e) {
        api.log('nest failed', e); /* i18n-ignore */
        S.nesting = false; S.progress = null; say2(String((e && e.message) || e));
      }
      return S.nest;
    },
    async gcode() {
      if (!S.nest || !app.hasGcode()) return;
      const a = analysis();
      const mod = await import('../../cam-sheets.js');
      const files = X.gcodeFiles(S.nest, mod.sheetsGcode, { unit: a.build.project.unit, name: base(), post: S.post, tool: { d: S.tool } });
      S.files = files.filter((f) => !f.notesOnly);
      const notes = files.filter((f) => f.notesOnly).flatMap((f) => f.notes).map((n) => n.code);
      say2(t('msg.gcode', { n: S.files.length }) + (notes.length ? ' ' + t('msg.gcode.notes', { codes: [...new Set(notes)].join(', ') }) : ''));
    },
    save(kind) {
      const a = analysis();
      const b = a.build, n = base();
      const head = (cols, pre) => Object.fromEntries(cols.map((c) => [c, t(pre + c)]));
      if (kind === 'cutlist') download(n + '-cutlist.csv', X.cutlistCsv(b, { head: head(['id', 'name', 'group', 'material', 'thickness', 'length', 'width', 'qty', 'grain', 'l1', 'l2', 'w1', 'w2', 'cutLength', 'cutWidth', 'note'], 'csv.cut.') }), 'text/csv');
      else if (kind === 'drill') download(n + '-drilling.csv', X.drillCsv(b, { head: head(['part', 'name', 'face', 'kind', 'x', 'y', 'diameter', 'depth', 'side', 'qty', 'note'], 'csv.drill.'), word: t }), 'text/csv');
      else if (kind === 'drillxml') download(n + '-holes.xml', X.drillXml(b, { word: t, note: t('drillxml.note') }), 'application/xml');
      else if (kind === 'runcheck') download(n + '-first-run-checklist.html', firstRunChecklist(b, { t, files: S.files, dry: S.dry, holes: S.holes, date: new Date().toISOString().slice(0, 10) }), 'text/html');
      else if (kind === 'review') download(n + '-maker-review.html', makerReview(b, { t, fmt }), 'text/html');
      else if (kind === 'hardware') download(n + '-hardware.csv', X.hardwareCsv(b, { head: head(['item', 'spec', 'qty'], 'csv.hw.'), word: t }), 'text/csv');
      else if (kind === 'estimate') download(n + '-estimate.csv', X.estimateCsv(a.est, { head: { ...head(['what', 'detail', 'qty', 'unit', 'rate', 'amount', 'placeholder'], 'csv.est.'), yes: t('yes'), no: t('no') }, word: t, note: a.est.placeholders ? t('cost.csvnote', { n: a.est.placeholders, of: a.est.rows.length }) : '', label: t(a.est.lint.final ? 'cost.quote.final' : 'cost.quote.draft') }), 'text/csv');
      else if (kind === 'dxf' && S.nest) download(n + '-sheets.dxf', X.nestedDxf(S.nest, b.project.unit), 'application/dxf');
      else if (kind === 'labels') {
        const words = { nest: t('label.nest'), cut: t('label.cut'), grain: t('label.grain'), none: '' };
        const r = X.labelsHtml(b, S.nest, { template: S.template, title: t('label.title', { name: S.project.name || n }), fmt, words });
        download(n + '-labels.html', r.html, 'text/html');
      }
    },
  };

  const exp = (id, label, extension, mime, fn) => api.files.exporter({ id, label, extension, mime, write: async () => fn() });
  exp('cutlist', t('export.cutlist'), 'csv', 'text/csv', () => X.cutlistCsv(analysis().build, {}));
  exp('estimate', t('export.estimate'), 'csv', 'text/csv', () => { const a = analysis(); return X.estimateCsv(a.est, { word: t, note: a.est.placeholders ? t('cost.csvnote', { n: a.est.placeholders, of: a.est.rows.length }) : '' }); });
  exp('job', t('export.job'), 'json', 'application/json', () => X.jobJson(S.project));
  exp('drawings', t('export.drawings'), 'html', 'text/html', () => sheetSetHtml(app.sheets(), { title: S.project.name, unit: S.project.unit }));

  // commands: PartCraft's and BimCraft's `api.commands.add(name, fn, { label })`; CadCraft's different shape and the apps with no command registry are the adapter's (host.command)
  const addCmd = (name, fn, label) => { try { if (host && typeof host.command === 'function') host.command(name, fn, label); else if (api.commands && typeof api.commands.add === 'function') api.commands.add(name, fn, { label }); } catch (e) { api.log('command ' + name + ' not added', e); /* i18n-ignore */ } };
  addCmd('sample', () => { app.change(app.sample(S.project.unit), { reset: true }); tellStatus(t('msg.sample')); }, t('cmd.sample'));
  addCmd('nest', () => { app.nest(); }, t('cmd.nest'));
  if (!host || host.id === 'part') {
    addCmd('cab3d', () => { if (app.has3d()) app.place3d(); else tellStatus(t('v3d.unavailable')); }, t('cmd.cab3d'));
    addCmd('cab3d-clear', () => { if (app.has3d()) app.remove3d(); }, t('cmd.cab3d.clear'));
  }
  addCmd('check', () => { const p = analysis().problems; tellStatus(t('checks.count', { n: p.length, e: p.filter((x) => x.severity === 'error').length })); }, t('cmd.check'));
  if (host && typeof host.start === 'function') { try { host.start(app, { render: () => render(), analysis }); } catch (e) { api.log('host start failed', e); /* i18n-ignore */ } }

  try { api.part.onChange(() => { if (pane && S.view === 'drawings') render(); }); } catch { /* no part events: the 3D count refreshes on the next click */ }
  api.ui.panelTab({ id: 'cabinetcraft', title: t('tab'), render: (el) => { pane = el; render(); } });
  api.onDeactivate(() => { pane = null; try { src?.dispose?.(); } catch { /* source already gone */ } try { styleEl?.remove(); } catch { /* no page */ } try { host?.stop?.(); } catch { /* adapter */ } });
  analysis();
  api.log('CabinetCraft ready');   // i18n-ignore (developer log)
}
