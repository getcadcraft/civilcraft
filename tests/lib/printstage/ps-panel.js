/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ps-panel.js — the print stage card (roadmap PS.1): add things from the Library, lay them out on the bed, press Send to 3D printer.
 * No exporting and no second program: the app's own view is the stage and its own tools move things. Imports only lib/printstage; the
 * page's DOM helper, words and model come from the app (`host`), so the copy in each app is byte-identical (tools/printstage/sync.mjs).
 *
 *   printStagePanel(host) → { panel({ small }) → [nodes] (small: only the Send row, so the bed can be seen), refresh(), addItem(uuid, version) → Promise, link }
 *   host = {
 *     el(tag, props, …children), t(key, fills)
 *     cls: { block, note, head, btn, primary, link, select, input, error, list, row, field, check, send }
 *     objects() → [{ id, name, min: [x, y, z], max: [x, y, z] }]    mm, what is on the stage now
 *     plate() → [[x, y, z] ×3 …]                                    mm, every triangle that prints
 *     place(name, tris, { scale, at: [x, y] }) → id                 one undo step; tris mm, standing on 0, centred on the origin
 *     moveTo(id, x, y) · drop(id) · rescale(id, factor) · remove(id) · select(id)   one undo step each
 *     batch(label, fn)                                              several of those as one undo step
 *     showBed(bed | null)                                           draws the bed in the view and frames it
 *     manifold() → Promise<module>                                  manifold-3d, set up
 *     fetchFn, serial (optional), load(key) → any, save(key, value)
 *     worker (optional): { url, manifoldUrl }                       CadCraft basic slices on a worker thread (ps-worker.js)
 *     download(name, text, type), print(text), fileName(), confirm(paragraphs[], { title, yes }?) → Promise<boolean>, rerender()
 *   }
 * Safety, by construction: nothing connects or sends until a button is clicked; sending shows what will happen and asks; a plate off
 * the bed is refused by the panel and again by the slicer; numbers are held in range by cleanJob.
 * Words: keys ps.* (tools/printstage/lang.mjs).
 * Another way of printing is an add-on of its own (resin: slicer-resin): it adds { id, label, build(ctx) → [nodes] } to window.ccPrintBlocks. Chosen in the card's
 * "Printing with" row, its block replaces the settings, printer and send rows; the library and the bed stay. ctx: { host, el, t, C, small, say, plateSolid, checkPlate, arrange,
 * fitScale, useBed(bed), bed() } (the add-on brings its own words).
 */
import { PRINTERS, MATERIALS, QUALITIES, cleanJob, defaultStart, defaultEnd } from './ps-profiles.js';
import { arrange, fitScale, checkPlate } from './ps-arrange.js';
import { BASIC, slicers, availability, runEngine, studioRun, readGcode } from './ps-engines.js';
import { parseLayers, drawLayer } from './ps-preview.js';
import { KINDS, cleanPrinterLink, sendNetwork, testLink, MarlinLink } from './ps-send.js';
import { searchItems, loadItem, itemTris } from './ps-library.js';
import { plateSolid } from './ps-slice.js';

export function printStagePanel(host) {
  const { el, t } = host;
  const C = host.cls;
  let job = cleanJob(host.load('job'));
  let printer = cleanPrinterLink(host.load('printer'));
  let chosen = host.load('engine') || BASIC.id, engineState = {};
  let preview = null;   // { pv, sig, layer } of the last slice
  let tech = host.load('tech') || 'fdm';
  let results = null, query = '', busy = null, message = null, progress = null, abort = null, linkNote = null;
  const log = [];
  const link = new MarlinLink({ serial: host.serial || null, onLine: (l) => { log.push(l); if (log.length > 12) log.shift(); }, onState: () => host.rerender() });

  const KEYS = ['printer', 'material', 'quality', 'infill', 'supports', 'skirt', 'bridges', 'seam', 'start', 'end', 'bed'];
  const setJob = (patch) => {
    // changing the printer moves the start and end G-code to the new printer's own, unless the person had edited them
    const move = patch.printer && patch.printer !== job.printer ? { start: job.start === defaultStart(job.printer) ? undefined : job.start, end: job.end === defaultEnd(job.printer) ? undefined : job.end } : {};
    job = cleanJob({ ...Object.fromEntries(KEYS.map((k) => [k, job[k]])), ...move, ...patch }); host.save('job', Object.fromEntries(KEYS.map((k) => [k, job[k]])));
    if (preview) host.rerender();   // a preview of other settings says it is out of date
  };
  const setPrinter = (patch) => { printer = cleanPrinterLink({ ...printer, ...patch }); host.save('printer', printer); linkNote = null; };
  const say = (text, error = false) => { message = { text, error }; host.print?.(text); host.rerender(); };
  const words = (key, fills) => t('ps.' + key, fills);
  const duration = (s) => { const all = Math.max(1, Math.round(s / 60)), h = Math.floor(all / 60), m = all % 60; return h ? words('time.hm', { h, m }) : words('time.m', { m }); };

  // ---- the stage
  const sizeOf = (o) => [o.max[0] - o.min[0], o.max[1] - o.min[1], o.max[2] - o.min[2]];
  async function addItem(uuid, version) {
    busy = 'add'; message = null; host.rerender();
    try {
      const item = await loadItem(uuid, version, { fetchFn: host.fetchFn });
      const m = itemTris(item);
      if (!m) { say(words('add.nobody'), true); return null; }
      const factor = Math.min(1, fitScale(m.size, job.bed, { margin: 0.9 }));
      const taken = host.objects().map(sizeOf);
      const size = m.size.map((v) => v * factor);
      const lay = arrange([...taken, size], job.bed);
      const spot = lay.at[taken.length] || [(job.bed[0] - size[0]) / 2, (job.bed[1] - size[1]) / 2];
      const id = host.place(String(item.name || 'Item').slice(0, 120), m.tris, { scale: factor, at: [spot[0] + size[0] / 2, spot[1] + size[1] / 2] });
      host.showBed(job.bed);
      host.select(id);
      say(factor < 1 ? words('add.scaled', { name: item.name, n: Math.round(1 / factor * 10) / 10 }) : words('add.done', { name: item.name }));
      return id;
    } catch (e) { console.error(e); say(words('add.failed'), true); return null; } finally { busy = null; host.rerender(); }
  }
  function doArrange() {
    const objs = host.objects();
    if (!objs.length) return;
    const lay = arrange(objs.map(sizeOf), job.bed);
    host.batch(words('undo.arrange'), () => objs.forEach((o, i) => { const a = lay.at[i]; if (a) host.moveTo(o.id, a[0] + (o.max[0] - o.min[0]) / 2, a[1] + (o.max[1] - o.min[1]) / 2); host.drop(o.id); }));
    say(lay.left ? words('arrange.left', { n: lay.left }) : words('arrange.done', { n: lay.placed }), !!lay.left);
  }
  function fitAll() {
    const objs = host.objects();
    host.batch(words('undo.fit'), () => { for (const o of objs) { const f = fitScale(sizeOf(o), job.bed); if (f < 1) host.rescale(o.id, f); } });
    doArrange();
  }

  // ---- sending
  const plateProblem = () => {
    const objs = host.objects();
    if (!objs.length && !host.plate().length) return words('send.empty');
    const c = checkPlate(objs, job.bed);
    if (c.off.length) return words('send.off', { names: c.off.map((i) => objs[i].name).slice(0, 3).join(', ') });
    return null;
  };
  const warningText = (w) => (w.kind === 'skipped' ? words(w.n === 1 ? 'warn.skipped_one' : 'warn.skipped', { n: w.n, share: w.share }) : w.kind === 'thin' ? words('warn.thin', { n: w.share }) : w.kind === 'sheets' ? words(w.n === 1 ? 'warn.sheets_one' : 'warn.sheets', { n: w.n }) : w.kind === 'overhang' ? words('warn.overhang') : w.kind === 'floating' ? words('warn.floating') : '');
  const failText = (why) => words('fail.' + why);
  const fileName = () => (String(host.fileName() || 'plate').replace(/\.[a-z0-9]+$/i, '') || 'plate') + '.gcode';

  // a slicer add-on that was switched off falls back to basic; its choice comes back with it
  const currentDef = () => { const all = slicers(); return all.find((e) => e.id === chosen) || BASIC; };
  const engineName = () => currentDef().name;
  async function checkEngine(id = currentDef().id) {
    engineState[id] = await availability(id, host);
    if (id === currentDef().id) host.rerender();
    return engineState[id];
  }
  // what the last preview was made from: the plate's triangles and the job; a change makes the preview stale rather than quietly wrong
  const plateSig = () => { const t = host.plate(); let a = 0; for (const tri of t) for (const p of tri) a += p[0] * 1.3 + p[1] * 1.7 + p[2] * 2.3; return t.length + ':' + Math.round(a * 100) + ':' + JSON.stringify(job); };
  async function showPreview() { const r = await makeGcode(); if (r) say(words('preview.ready', { n: r.stats.layers })); }
  function previewBlock() {
    if (!preview) return null;
    const stale = preview.sig !== plateSig();
    if (stale) return el('div', { className: C.block, dataset: { psPreview: 'stale' } }, el('h3', { className: C.head }, words('h.preview')), el('p', { className: C.note }, words('preview.stale')));
    const n = preview.pv.layers.length, W = 300, H = Math.max(120, Math.round(W * preview.bed[1] / preview.bed[0]));
    const canvas = el('canvas', { width: W, height: H, className: 'ps-preview', role: 'img', dataset: { psPreviewCanvas: '' }, 'aria-label': words('preview.canvas') });
    const label = el('p', { className: C.note, dataset: { psPreviewLabel: '' } });
    const paint = () => {
      const i = preview.layer, ctx = canvas.getContext('2d'); if (!ctx) return;
      const ink = getComputedStyle(canvas).color || '#223';
      drawLayer(ctx, preview.pv, i, { bed: preview.bed, width: W, height: H, ink });
      label.textContent = words('preview.layer', { n: i + 1, total: n, z: Math.round(preview.pv.layers[i].z * 100) / 100 });
    };
    const range = el('input', { type: 'range', min: '1', max: String(n), step: '1', value: String(preview.layer + 1), className: C.input, 'aria-label': words('preview.slider'), dataset: { psPreviewRange: '' } });
    range.addEventListener('input', () => { preview.layer = Number(range.value) - 1; paint(); });
    queueMicrotask(paint);
    return el('div', { className: C.block, dataset: { psPreview: 'ok' } }, el('h3', { className: C.head }, words('h.preview')), canvas, range, label,
      preview.bridges ? el('p', { className: C.note }, words('preview.bridges', { n: preview.bridges })) : null);
  }
  async function makeGcode() {
    const usable = await checkEngine();
    if (!usable.ok) { say(words('engine.need.' + usable.why, { name: engineName() }), true); return null; }
    const problem = plateProblem();
    if (problem) { say(problem, true); return null; }
    abort = new AbortController();
    busy = 'slice'; progress = { layer: 0, layers: 1 }; message = null; host.rerender();
    try {
      const r = await runEngine(currentDef().id, host, host.plate(), job, { signal: abort.signal, onProgress: (p) => { progress = p; host.rerender(); } });
      if (!r.ok) { say(r.detail ? words('slice.engine', { name: engineName(), why: r.detail }) : words('slice.' + (r.error || 'failed')), true); return null; }
      try { const pv = parseLayers(r.lines); preview = pv.layers.length ? { pv, sig: plateSig(), layer: Math.min(preview?.layer ?? 0, pv.layers.length - 1), bed: job.bed.slice(0, 2), bridges: pv.bridges } : null; } catch { preview = null; }
      return r;
    } catch (e) {
      if (e?.name !== 'AbortError') { console.error(e); say(words('slice.engine', { name: engineName(), why: String(e?.message || e).slice(0, 200) }), true); }
      return null;
    } finally { busy = null; progress = null; abort = null; host.rerender(); }
  }

  // a printer add-on (window.ccPrintLinks) replaces the connection and the slicer: it knows what its printer needs
  const links = () => (Array.isArray(globalThis.ccPrintLinks) ? globalThis.ccPrintLinks : []);
  let linkId = host.load('link') || '';
  const linkDef = () => links().find((l) => l.id === linkId) || null;
  async function sendLink(def) {
    if (!host.studio) { say(words('link.needs_studio'), true); return; }
    const problem = plateProblem();
    if (problem) { say(problem, true); return; }
    abort = new AbortController(); busy = 'slice'; progress = { layer: 0, layers: 1 }; message = null; host.rerender();
    try {
      const tris = host.plate(), opts = { signal: abort.signal, onProgress: (p) => { progress = p; host.rerender(); } };
      const r = await def.send({ tris, job, name: fileName().replace(/\.gcode$/, ''), studio: host.studio, readGcode, confirm: host.confirm, run: (extra) => studioRun('orcaslicer', host, tris, job, extra, opts) });
      if (r.cancelled) say(words('send.cancelled')); else say(r.message, !r.ok);
    } catch (e) {
      if (e?.name !== 'AbortError') { console.error(e); say(words('slice.failed'), true); }
    } finally { busy = null; progress = null; abort = null; host.rerender(); }
  }
  async function send() {
    const via = linkDef();
    if (via) return sendLink(via);
    if (printer.kind === 'usb' && !link.state.connected) { say(words('fail.notconnected'), true); return; }
    if (printer.kind !== 'usb' && !printer.url) { say(failText('address'), true); return; }
    const r = await makeGcode();
    if (!r) return;
    const warn = r.warnings.map(warningText).filter(Boolean);
    const made = words('engine.using', { name: engineName() });
    const summary = words('send.summary', { time: duration(r.stats.seconds), grams: r.stats.grams, layers: r.stats.layers, temp: job.nozzle_temp, bed: job.bed_temp });
    const yes = await host.confirm([words('send.check'), made + ' ' + summary, ...warn, printer.kind === 'usb' ? words('send.usb_note') : ''].filter(Boolean));
    if (!yes) { say(words('send.cancelled')); return; }
    busy = 'send'; progress = printer.kind === 'usb' ? { sent: 0, total: r.lines.length } : null; host.rerender();
    try {
      if (printer.kind === 'usb') {
        const s = await link.send(r.lines, { onProgress: (p) => { progress = p; host.rerender(); } });
        if (s.ok) say(words('send.usb_done'));
        else say(s.why === 'stopped' ? words('send.stopped') : failText(s.why === 'error' ? 'printer' : s.why) + (s.error ? ' ' + s.error : ''), s.why !== 'stopped');
      } else {
        const s = await sendNetwork(printer, fileName(), r.lines.join('\n') + '\n', { fetchFn: host.fetchFn, start: true });
        if (s.ok) say(words('send.started', { time: duration(r.stats.seconds) }));
        else say(failText(s.why), true);
      }
    } finally { busy = null; progress = null; host.rerender(); }
  }
  async function saveGcode() {
    const r = await makeGcode();
    if (!r) return;
    host.download(fileName(), r.lines.join('\n') + '\n', 'text/plain');
    say(words('save.done', { time: duration(r.stats.seconds), grams: r.stats.grams }));
  }

  // ---- another way of printing (resin): an add-on's block takes over the settings, printer and send rows
  const blocks = () => (Array.isArray(globalThis.ccPrintBlocks) ? globalThis.ccPrintBlocks.filter((b) => b && typeof b.build === 'function' && /^[a-z][a-z0-9-]{1,30}$/.test(b.id) && typeof b.label === 'string') : []);
  const blockDef = () => blocks().find((b) => b.id === tech) || null;
  const MORE_TECH = [{ addon: 'slicer-resin', id: 'resin' }];
  const blockCtx = (small) => ({ host, el, t, C, small, say, plateSolid, checkPlate, arrange, fitScale, bed: () => job.bed, useBed: (bed) => { setJob({ bed }); host.showBed(job.bed); host.rerender(); } });
  function techRow() {
    const all = blocks(), loader = globalThis.ccAddons?.loader;
    const add = !all.length && loader?.setEnabled ? MORE_TECH : [];
    if (!all.length && !add.length) return null;
    return el('div', { className: C.block, dataset: { psTech: '' } },
      all.length ? el('label', { className: C.field }, words('tech.label'), ' ', el('select', { className: C.select, dataset: { psTechSelect: '' }, onchange: (e) => { tech = e.target.value; host.save('tech', tech); if (!blockDef()) { setJob({ bed: null }); host.showBed(job.bed); } host.rerender(); } },
        el('option', { value: 'fdm', selected: !blockDef() }, words('tech.fdm')), ...all.map((b) => el('option', { value: b.id, selected: b.id === tech }, b.label)))) : null,
      add.length ? el('div', { className: C.row }, ...add.map((m) => el('button', { type: 'button', className: C.link, dataset: { psAddTech: m.addon }, onclick: async () => { tech = m.id; host.save('tech', tech); await loader.setEnabled(m.addon, true); host.rerender(); } }, words('tech.add')))) : null);
  }

  // ---- the card
  const field = (label, control) => el('label', { className: C.field }, label, ' ', control);
  const options = (table, key, cur) => Object.keys(table).map((k) => el('option', { value: k, selected: k === cur }, words(key + '.' + k)));

  function libraryBlock() {
    const input = el('input', { type: 'search', className: C.input, value: query, placeholder: words('lib.placeholder'), 'aria-label': words('lib.placeholder'), dataset: { psSearch: '' } });
    const run = async () => {
      query = input.value.trim(); busy = 'search'; host.rerender();
      try { results = await searchItems(query, { fetchFn: host.fetchFn }); message = null; }
      catch { results = null; message = { text: words('lib.failed'), error: true }; }
      busy = null; host.rerender();
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    return el('div', { className: C.block },
      el('h3', { className: C.head }, words('h.add')),
      el('div', { className: C.row }, input, el('button', { type: 'button', className: C.btn, disabled: !!busy, dataset: { psSearchGo: '' }, onclick: run }, words('lib.search'))),
      results ? (results.length ? el('ul', { className: C.list, dataset: { psResults: '' } }, ...results.map((it) => el('li', {},
        el('span', {}, String(it.name || '')),
        el('button', { type: 'button', className: C.link, disabled: !!busy, dataset: { psAdd: String(it.uuid) }, onclick: () => addItem(it.uuid, it.version) }, words('lib.add')))))
        : el('p', { className: C.note }, words('lib.none'))) : null);
  }
  function stageBlock() {
    const objs = host.objects(), plate = checkPlate(objs, job.bed);
    return el('div', { className: C.block },
      el('h3', { className: C.head }, words('h.stage')),
      blockDef() ? null : el('label', { className: C.field }, words('field.bed'), ' ', el('select', { className: C.select, dataset: { psBed: '' }, onchange: (e) => { setJob({ printer: e.target.value, bed: null }); host.showBed(job.bed); host.rerender(); } }, ...options(PRINTERS, 'printer', job.printer))),
      objs.length ? el('ul', { className: C.list, dataset: { psObjects: '' } }, ...objs.map((o, i) => {
        const s = sizeOf(o), off = plate.off.includes(i);
        return el('li', { dataset: { psObject: String(o.id), off: off ? '1' : '0' } },
          el('button', { type: 'button', className: C.link, onclick: () => host.select(o.id) }, o.name),
          el('span', { className: off ? C.error : C.note }, off ? words('obj.off') : words('obj.size', { x: Math.round(s[0]), y: Math.round(s[1]), z: Math.round(s[2]) })),
          el('button', { type: 'button', className: C.link, 'aria-label': words('obj.remove', { name: o.name }), onclick: () => { host.remove(o.id); host.rerender(); } }, words('obj.x')));
      })) : el('p', { className: C.note, dataset: { psEmpty: '' } }, words('stage.empty')),
      objs.length ? el('p', { className: C.note }, words('stage.move')) : null,
      plate.overlaps.length ? el('p', { className: C.note, dataset: { psOverlap: '' } }, words('stage.overlap')) : null,
      objs.length ? el('div', { className: C.row },
        el('button', { type: 'button', className: C.btn, dataset: { psArrange: '' }, onclick: doArrange }, words('stage.arrange')),
        el('button', { type: 'button', className: C.btn, dataset: { psFit: '' }, onclick: fitAll }, words('stage.fit'))) : null);
  }
  function engineRow() {
    const def = currentDef(), id = def.id, st = engineState[id], more = host.moreSlicers?.() || [];
    if (!st) checkEngine();
    return [
      field(words('field.engine'), el('select', { className: C.select, dataset: { psEngine: '' }, onchange: (e) => { chosen = e.target.value; host.save('engine', chosen); checkEngine(); host.rerender(); } }, ...slicers().map((e) => el('option', { value: e.id, selected: e.id === id }, e.label || words('engine.' + e.id))))),
      st && !st.ok ? el('p', { className: C.note, dataset: { psEngineNeed: st.why } }, words('engine.need.' + st.why, { name: def.name })) : null,
      st && !st.ok && def.url ? el('div', { className: C.row },
        el('a', { className: C.link, href: def.url, target: '_blank', rel: 'noopener', dataset: { psEngineGet: '' } }, words('engine.get', { name: def.name })),
        host.studio ? el('button', { type: 'button', className: C.link, dataset: { psEngineFind: '' }, onclick: async () => { try { await host.studio.pick(id); } catch { /* the person closed the dialog */ } checkEngine(id); } }, words('engine.find')) : null) : null,
      more.length ? el('div', { className: C.row, dataset: { psMore: '' } }, el('span', { className: C.note }, words('engine.more')),
        ...more.map((m) => el('button', { type: 'button', className: C.link, dataset: { psAddSlicer: m.addon }, onclick: async () => { chosen = m.engine; host.save('engine', chosen); engineState = {}; await m.add(); host.rerender(); } }, words('engine.add', { name: m.name })))) : null,
    ].filter(Boolean);
  }
  function settingsBlock() {
    return el('div', { className: C.block },
      el('h3', { className: C.head }, words('h.settings')),
      ...(linkDef() ? [el('p', { className: C.note, dataset: { psLinkSlicer: '' } }, words('link.slicer'))] : engineRow()),
      field(words('field.material'), el('select', { className: C.select, dataset: { psMaterial: '' }, onchange: (e) => setJob({ material: e.target.value }) }, ...options(MATERIALS, 'material', job.material))),
      field(words('field.quality'), el('select', { className: C.select, dataset: { psQuality: '' }, onchange: (e) => setJob({ quality: e.target.value }) }, ...options(QUALITIES, 'quality', job.quality))),
      field(words('field.infill'), el('input', { type: 'number', className: C.input, min: '0', max: '100', step: '5', value: String(job.infill), dataset: { psInfill: '' }, onchange: (e) => { setJob({ infill: e.target.value }); e.target.value = String(job.infill); } })),
      el('label', { className: C.check }, el('input', { type: 'checkbox', checked: job.bridges, dataset: { psBridges: '' }, onchange: (e) => setJob({ bridges: e.target.checked }) }), ' ', words('field.bridges')),
      field(words('field.seam'), el('select', { className: C.select, dataset: { psSeam: '' }, onchange: (e) => setJob({ seam: e.target.value }) }, ...['aligned', 'nearest'].map((k) => el('option', { value: k, selected: job.seam === k }, words('seam.' + k))))),
      el('label', { className: C.check }, el('input', { type: 'checkbox', checked: job.supports, dataset: { psSupports: '' }, onchange: (e) => setJob({ supports: e.target.checked }) }), ' ', words('field.supports')),
      linkDef() ? null : el('details', {}, el('summary', {}, words('field.gcode')),
        field(words('field.start'), el('textarea', { className: C.input, rows: 5, spellcheck: false, dataset: { psStart: '' }, onchange: (e) => setJob({ start: e.target.value }) }, job.start)),
        field(words('field.end'), el('textarea', { className: C.input, rows: 4, spellcheck: false, dataset: { psEnd: '' }, onchange: (e) => setJob({ end: e.target.value }) }, job.end))));
  }
  function printerBlock() {
    const usb = printer.kind === 'usb', via = linkDef();
    return el('div', { className: C.block },
      el('h3', { className: C.head }, words('h.printer')),
      field(words('field.connection'), el('select', { className: C.select, dataset: { psKind: '' }, onchange: (e) => {
        const l = links().find((x) => x.id === e.target.value);
        linkId = l ? l.id : ''; host.save('link', linkId);
        if (l) { setJob({ printer: l.printer, bed: null }); host.showBed(job.bed); } else setPrinter({ kind: e.target.value });
        host.rerender();
      } }, ...KINDS.map((k) => el('option', { value: k, selected: !via && k === printer.kind }, words('kind.' + k))), ...links().map((l) => el('option', { value: l.id, selected: via === l }, l.label)))),
      (host.moreLinks?.() || []).length ? el('div', { className: C.row, dataset: { psMoreLinks: '' } }, ...host.moreLinks().map((m) => el('button', { type: 'button', className: C.link, dataset: { psAddLink: m.addon }, onclick: async () => { await m.add(); host.rerender(); } }, words('link.add', { name: m.name })))) : null,
      via ? el('div', {},
        el('ol', { className: C.steps, dataset: { psSteps: '' } }, ...via.steps.map((st) => el('li', {}, st.text, st.url ? [' ', el('a', { className: C.link, href: st.url, target: '_blank', rel: 'noopener' }, st.link)] : null))),
        el('p', { className: C.note }, via.note),
        host.studio ? null : el('p', { className: C.note, dataset: { psLinkNeedsStudio: '' } }, words('link.needs_studio'))) :
      usb ? (MarlinLink.supported(host.serial)
        ? el('div', { className: C.row },
          link.state.connected ? el('span', { className: C.note, dataset: { psConnected: '' } }, words('usb.connected')) : null,
          el('button', { type: 'button', className: C.btn, dataset: { psConnect: '' }, onclick: async () => { if (link.state.connected) await link.disconnect(); else { const r = await link.connect(); if (!r.ok && r.why !== 'cancelled') say(failText(r.why), true); } host.rerender(); } }, words(link.state.connected ? 'usb.disconnect' : 'usb.connect')))
        : el('p', { className: C.note, dataset: { psNoSerial: '' } }, words('usb.none')))
        : el('div', {},
          field(words('field.address'), el('input', { type: 'text', className: C.input, value: printer.url, placeholder: 'http://192.168.1.50', spellcheck: false, dataset: { psUrl: '' }, onchange: (e) => setPrinter({ url: e.target.value }) })),
          field(words('field.key'), el('input', { type: 'password', autocomplete: 'off', className: C.input, value: printer.key, dataset: { psKey: '' }, onchange: (e) => setPrinter({ key: e.target.value }) })),
          el('p', { className: C.note }, words('net.note')),
          el('div', { className: C.row },
            el('button', { type: 'button', className: C.btn, dataset: { psTest: '' }, onclick: async () => { const r = await testLink(printer, { fetchFn: host.fetchFn }); linkNote = r.ok ? { text: words('net.ok') } : { text: failText(r.why), error: true }; host.rerender(); } }, words('net.test')),
            linkNote ? el('span', { className: linkNote.error ? C.error : C.note, dataset: { psLinkNote: '' } }, linkNote.text) : null)));
  }
  function sendBlock() {
    const running = link.state.running;
    const pct = progress && progress.total ? Math.round(progress.sent / progress.total * 100) : progress && progress.layers ? Math.round(progress.layer / progress.layers * 100) : null;
    return el('div', { className: C.block + ' ' + C.send },
      el('div', { className: C.row },
        el('button', { type: 'button', className: C.primary, disabled: !!busy, dataset: { psSend: '' }, onclick: send }, el('i', { className: 'bi bi-printer', 'aria-hidden': 'true' }), ' ', words('send.button')),
        busy === 'slice' ? el('button', { type: 'button', className: C.btn, dataset: { psCancel: '' }, onclick: () => abort?.abort() }, words('send.cancel')) : null,
        running ? el('button', { type: 'button', className: C.btn, dataset: { psStop: '' }, onclick: () => link.stop() }, words('send.stop')) : null),
      busy === 'slice' || busy === 'send' ? el('p', { className: C.note, dataset: { psProgress: '' } }, words(busy === 'slice' ? 'progress.slice' : 'progress.send', { n: pct ?? 0 })) : null,
      message ? el('p', { className: message.error ? C.error : C.note, role: message.error ? 'alert' : 'status', dataset: { psMessage: '' } }, message.text) : null,
      linkDef() ? null : el('div', { className: C.row },
        el('button', { type: 'button', className: C.link, disabled: !!busy, dataset: { psPreviewGo: '' }, onclick: showPreview }, words('preview.button')),
        el('button', { type: 'button', className: C.link, disabled: !!busy, dataset: { psSave: '' }, onclick: saveGcode }, words('save.button'))));   // our generic start G-code is not for a printer add-on's machine
  }
  return {
    link, addItem,
    panel: ({ small = false } = {}) => {
      const def = blockDef();
      if (def) return small ? def.build(blockCtx(true)).filter(Boolean) : [techRow(), libraryBlock(), stageBlock(), ...def.build(blockCtx(false))].filter(Boolean);
      return small ? [sendBlock()] : [techRow(), libraryBlock(), stageBlock(), settingsBlock(), printerBlock(), previewBlock(), sendBlock()].filter(Boolean);
    },
    refresh: () => host.rerender(),
    job: () => job,
    engine: () => currentDef().id,
    dispose: () => { abort?.abort(); link.disconnect(); },
  };
}
