/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-vector-ui.js — GIS vector files in CivilCraft: the page side (docs/GIS-SPEC.md §2, builder A). The only vector GIS
 * module that touches the DOM, through host.el (text nodes only — file contents are untrusted). gis-ui.js installs it:
 * install(host). Everything it computes comes from the DOM-free modules the Node test drives (gis-read.js,
 * gis-layers.js, gis-export.js and the format readers/writers).
 *
 * Registers through host.reg:
 *   openers   shapefile sets (.shp + .shx + .dbf + .prj + .cpg), .zip, .geojson (and .json whose head is GeoJSON), .gpkg
 *   commands  'gis-import' (a file picker for every GIS file; the files go through host.open → the openers, so elevation
 *             grids, LiDAR and pictures reach builders B and C) · 'gis-export' (the GIS › Export dialog)
 *   scene     each visible layer as plan layer GIS-<id> in its colour, under the design linework · extents · hasWork
 *   pick / props / overlay   a click with Select picks a feature; Properties shows its attributes (read-only) and layer
 *   onProject the GIS layers section of the left panel ([data-gis-layers]) follows the open project
 *   crsChange after the project's system changes, offers to move the layers to the new system
 *   pointsLatLon(points, fileName) → { points, crs, note } | null   point files with latitude/longitude columns
 *   landxmlCrs(cs, fileName)    a LandXML <CoordinateSystem> offered as the project's system
 *   exportExtra  [(container) => void]: other parts fill the GIS › Export dialog's extra spot ([data-gis-export-extra];
 *             builder B's GeoTIFF section goes in its [data-gis-geotiff] child)
 * reg.pickCrs (builder C) is used when it exists; until then the import dialog lists suggested systems itself.
 * window.civilcraft.gis.vector = { importFiles, exportDialog, last } for tests.
 */

import { readGisFiles, planImport, importInto, srcName, middleLonLat, resolveSrc, latLonPoints, crsFromLandXml } from './gis-read.js';
import { gisOf, layerOf, featuresOf, gisExtents, gisScene, pickFeature, layerBounds, setLayer, removeLayer, moveLayers, useChoices, useForSurface, LAYER_TOKENS, tokenLabel } from './gis-layers.js';
import { exportKinds, exportProject } from './gis-export.js';
import { crsProblem, suggest, crsFromEntry } from './crs.js';
import { bounds, vertexCount, KIND } from './gis-geom.js';
import { t } from './i18n.js';   // 0.4 V6 strings

const VECTOR = /\.(shp|shx|dbf|cpg|geojson|gpkg|zip|kml|kmz)$/i;   // kml|kmz: 0.4 V6
const ANY_GIS = '.shp,.shx,.dbf,.prj,.cpg,.zip,.geojson,.json,.gpkg,.kml,.kmz,.tif,.tiff,.asc,.las,.laz,.png,.jpg,.jpeg,.pgw,.jgw,.tfw,.wld';
// geometry kind → language keys (looked up when used: the language file loads after this module)
const KIND_KEY = { pt: 'vec.kind.pt', ln: 'vec.kind.ln', pg: 'vec.kind.pg' };
const KIND_Z_KEY = { pt: 'vec.kind.pt.z', ln: 'vec.kind.ln.z', pg: 'vec.kind.pg.z' };
const KIND_WITHZ_KEY = { pt: 'vec.kind.pt.withz', ln: 'vec.kind.ln.withz', pg: 'vec.kind.pg.withz' };
const COUNT_KEY = { pt: 'vec.count.pt', ln: 'vec.count.ln', pg: 'vec.count.pg' };
const kindWord = (k, map = KIND_KEY) => (Object.hasOwn(map, k) ? t(map[k]) : String(k));

export async function install(host) {
  const { reg, el } = host;
  const num = (n) => Number(n).toLocaleString('en-US');
  const P = () => host.project;
  const api = { last: null };
  /** A sentence with one fill shown as <strong>: the language file's text split round {name}. */
  const strongIn = (key, name, value) => t(key).split('{' + name + '}').flatMap((part, i) => (i ? [el('strong', {}, value), part] : [part])).filter((x) => x !== '');
  let uid = 0;

  // ---------------------------------------------------------------- plan drawing, extents, unsaved work
  reg.scene.push((scene, mm) => {
    const g = gisScene(P(), mm);
    if (!g.layers.length) return;
    scene.layers = [...g.layers, ...scene.layers];   // under the design linework
    scene.items.push(...g.items);
  });
  reg.extents.push(() => gisExtents(P()));
  reg.hasWork.push(() => gisOf(P()).layers.length > 0);

  // ---------------------------------------------------------------- picking, properties, highlight
  (reg.pick ||= []).push((w, tol) => pickFeature(P(), w.x, w.y, tol));
  (reg.props ||= []).push((sel, box, head) => {
    if (sel?.kind !== 'gis') return false;
    const l = layerOf(P(), sel.layer), f = featuresOf(P(), sel.layer)[sel.i];
    if (!l || !f) return false;
    featureProps(l, f, sel.i, box, head);
    return true;
  });
  (reg.overlay ||= []).push((ctx, v, sel) => {
    if (sel?.kind !== 'gis') return;
    const l = layerOf(P(), sel.layer), f = featuresOf(P(), sel.layer)[sel.i];
    if (!l?.visible || !f?.g) return;
    const C = v.colors, S = (p) => v.toScreen(p[0], p[1]);
    ctx.save();
    ctx.strokeStyle = C.action; ctx.lineWidth = 5; ctx.globalAlpha = 0.45; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (f.g.t === 'pt') { const q = S(f.g.c); ctx.globalAlpha = 1; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q.x, q.y, 8, 0, Math.PI * 2); ctx.stroke(); }
    else {
      ctx.beginPath();
      for (const r of f.g.t === 'ln' ? f.g.c : f.g.c.flat()) r.forEach((p, i) => { const q = S(p); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); });
      ctx.stroke();
    }
    ctx.restore();
  });

  function featureProps(l, f, i, box, head) {
    head.textContent = t('vec.feat.head');
    const out = [];
    const g = f.g, zs = [];
    const addZ = (p) => { if (p.length > 2) zs.push(p[2]); };
    if (g) { if (g.t === 'pt') addZ(g.c); else for (const r of g.t === 'ln' ? g.c : g.c.flat()) r.forEach(addZ); }
    const verts = g ? num(vertexCount(g)) : '', holes = g?.t === 'pg' && g.c.some((poly) => poly.length > 1);
    const shape = !g ? t('vec.shape.none') : g.t === 'pt' ? t('vec.shape.pt') : g.t === 'ln' ? (g.c.length > 1 ? t('vec.shape.lns', { n: g.c.length, verts }) : t('vec.shape.ln', { verts }))
      : g.c.length > 1 ? t(holes ? 'vec.shape.pgs.holes' : 'vec.shape.pgs', { n: g.c.length, verts }) : t(holes ? 'vec.shape.pg.holes' : 'vec.shape.pg', { verts });
    const dl = el('dl', { className: 'cv-dl', 'data-gis-feature': '' });
    const rows = [[t('vec.f.layer'), l.name], [t('vec.f.feature'), t('vec.f.of', { i: num(i + 1), total: num(featuresOf(P(), l.id).length) })], [t('vec.f.shape'), shape]];
    if (g?.t === 'pt') rows.push([t('vec.f.easting'), g.c[0].toFixed(3)], [t('vec.f.northing'), g.c[1].toFixed(3)]);
    if (zs.length) rows.push([t('vec.f.elevation'), zs.length === 1 ? zs[0].toFixed(3) : t('vec.f.range', { min: Math.min(...zs).toFixed(2), max: Math.max(...zs).toFixed(2) })]);
    rows.push([t('vec.f.from'), l.source?.format ? t('vec.f.from.format', { file: l.source?.file || '—', format: l.source.format }) : (l.source?.file || '—')], [t('vec.f.system'), l.source?.crs || t('vec.f.system.none')]);
    for (const [k, v] of rows) dl.append(el('dt', {}, k), el('dd', {}, v));
    out.push(dl);
    out.push(el('h3', { className: 'cv-h3' }, t('vec.f.attrs')));
    if (!l.fields.length) out.push(el('p', { className: 'cv-note' }, t('vec.f.noattrs')));
    else {
      const val = (fd) => { const v = f.p[fd.name]; return v === null || v === undefined || v === '' ? '—' : fd.type === 'bool' ? (v ? t('gis.label.yes') : t('gis.label.no')) : typeof v === 'number' ? String(v) : String(v); };
      out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table cv-gis-attrs', 'data-gis-attrs': '' },
        el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, t('vec.f.field')), el('th', { scope: 'col' }, t('vec.f.value')))),
        el('tbody', {}, ...l.fields.map((fd) => el('tr', {}, el('th', { scope: 'row' }, fd.name), el('td', { className: fd.type === 'number' ? 'num' : '' }, val(fd))))))));
    }
    out.push(el('p', { className: 'cv-note' }, t('vec.f.note')));
    out.push(el('div', { className: 'cv-actions' },
      g ? el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => zoomTo(bounds(g)) }, el('i', { className: 'bi bi-zoom-in', 'aria-hidden': 'true' }), ' ' + t('vec.zoomto')) : null,
      useChoices(l, featuresOf(P(), l.id)).length ? el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => useDialog(l.id, i) }, t('vec.use.open')) : null));
    box.replaceChildren(...out);
  }

  function zoomTo(b) {
    if (!b || !Number.isFinite(b.minX)) return;
    const pad = Math.max(b.maxX - b.minX, b.maxY - b.minY, 10) * 0.15;
    host.view.fit({ minX: b.minX - pad, minY: b.minY - pad, maxX: b.maxX + pad, maxY: b.maxY + pad });
  }

  // ---------------------------------------------------------------- the left panel: GIS layers
  const panel = host.ui.gisLayers || host.root.querySelector('[data-gis-layers]');
  let unsub = null;
  function watch() { unsub?.(); unsub = P().on(() => renderPanel()); renderPanel(); }
  reg.onProject.push(watch);
  function renderPanel() {
    if (!panel) return;
    const layers = gisOf(P()).layers;
    panel.hidden = !layers.length;
    const list = panel.querySelector('[data-gis-list]') || panel;
    if (!layers.length) { list.replaceChildren(); return; }
    const focused = panel.ownerDocument.activeElement;
    if (panel.contains(focused) && focused.matches('input[type=text]')) return;   // never under the user's typing
    list.replaceChildren(...layers.slice().reverse().map((l) => {
      const fs = featuresOf(P(), l.id), n = fs.length;
      const vis = el('input', { type: 'checkbox', checked: l.visible, 'aria-label': t('vec.layer.show', { layer: l.name }), title: t('vec.layer.show.title') });
      vis.addEventListener('change', () => setLayer(P(), l.id, { visible: vis.checked }));
      const col = el('select', { className: 'cv-select cv-gis-color', 'aria-label': t('vec.layer.color', { layer: l.name }), title: t('vec.layer.color.title') }, ...LAYER_TOKENS.map((tok) => el('option', { value: tok }, tokenLabel(tok))));
      col.value = l.color;
      col.style.setProperty('--gis-color', `var(--layer-${l.color})`);
      col.addEventListener('change', () => setLayer(P(), l.id, { color: col.value }));
      const menu = el('details', { className: 'cv-menu cv-gis-menu' },
        el('summary', { className: 'cv-x', title: t('vec.layer.more.title'), 'aria-label': t('vec.layer.more', { layer: l.name }) }, el('i', { className: 'bi bi-three-dots', 'aria-hidden': 'true' })),
        el('div', { className: 'cv-menu-list', role: 'menu' },
          el('button', { type: 'button', role: 'menuitem', onclick: () => { menu.open = false; zoomTo(layerBounds(fs)); } }, t('vec.zoomto')),
          el('button', { type: 'button', role: 'menuitem', disabled: !useChoices(l, fs).length, onclick: () => { menu.open = false; useDialog(l.id); } }, t('vec.use.open')),
          el('button', { type: 'button', role: 'menuitem', onclick: () => { menu.open = false; renameLayer(l); } }, t('vec.layer.rename')),
          labelPick(l),   // 0.4 V7
          el('hr'),
          el('button', { type: 'button', role: 'menuitem', onclick: () => { menu.open = false; removeLayer(P(), l.id); host.select(null); host.say(t('vec.layer.removed', { layer: l.name })); } }, t('vec.layer.remove'))));
      return el('li', { className: 'cv-gis-row', dataset: { gisLayer: l.id } },
        vis,
        // i18n-ignore: CSS, not text
        el('span', { className: 'cv-swatch', style: `background: var(--layer-${l.color})`, 'aria-hidden': 'true' }),
        el('span', { className: 'cv-gis-name', title: l.name + ' — ' + (l.source?.file || '') }, l.name),
        el('span', { className: 'cv-gis-count', title: kindWord(l.geom, l.hasZ ? KIND_Z_KEY : KIND_KEY) }, Object.hasOwn(COUNT_KEY, l.geom) ? t(COUNT_KEY[l.geom], { n, count: num(n) }) : num(n)),
        col, menu);
    }));
  }
  /** 0.4 V7: "Label with" a field (or none), in the layer's menu; the plan (and PDF, DXF, DWG) label each feature. */
  function labelPick(l) {
    if (!l.fields.length) return null;
    const id = 'cv-gis-lab-' + (++uid);
    const sel = el('select', { className: 'cv-select', id, 'data-gis-label': l.id }, el('option', { value: '' }, t('gis.label.none')), ...l.fields.map((f) => el('option', { value: f.name }, f.name)));
    sel.value = l.label?.field || '';
    sel.addEventListener('change', () => { setLayer(P(), l.id, { label: sel.value || null }); host.say(sel.value ? t('gis.label.on', { layer: l.name, field: sel.value }) : t('gis.label.off', { layer: l.name })); });
    return el('div', { className: 'cv-menu-field', role: 'none' }, el('label', { for: id }, t('gis.label.with')), sel);
  }
  async function renameLayer(l) {
    const inp = el('input', { type: 'text', className: 'cv-input', value: l.name, maxLength: 120, id: 'cv-gis-rn-' + (++uid) });
    const { dlg, foot } = dialog(t('vec.rename.title'), [el('div', { className: 'cv-props' }, el('label', { for: inp.id }, t('vec.rename.name')), inp)]);
    const ok = el('button', { type: 'button', className: 'btn-plot btn-sm-cc' }, t('vec.rename.go'));
    ok.onclick = () => { setLayer(P(), l.id, { name: inp.value }); dlg.close(); };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); ok.click(); } });
    foot.append(cancelBtn(dlg), ok);
    open(dlg, inp);
  }

  // ---------------------------------------------------------------- dialogs
  function dialog(title, body, cls = '') {
    const id = 'cv-gisv-h-' + (++uid);
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('vec.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const foot = el('div', { className: 'cv-dlg-foot' });
    const dlg = el('dialog', { className: 'cv-dialog cv-gisv ' + cls, 'aria-labelledby': id },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id }, title), close),
        el('div', { className: 'cv-dlg-body' }, body), foot));
    close.onclick = () => dlg.close();
    dlg.addEventListener('close', () => { dlg.remove(); host.refocus(); });
    return { dlg, foot };
  }
  const cancelBtn = (dlg, label = t('vec.cancel')) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, label);
  function open(dlg, focus) { host.root.append(dlg); dlg.showModal(); focus?.focus(); }

  /** A long job with a Cancel button over the plan. tick() yields to the page and throws when cancelled. */
  function progress(text) {
    let cancelled = false;
    const lbl = el('span', {}, text);
    const b = el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => { cancelled = true; } }, t('vec.cancel'));
    const box = el('div', { className: 'cv-busy cv-gis-busy', role: 'status' }, el('div', {}, lbl, ' ', b));
    host.ui.plan.append(box);
    return {
      set: (s) => { lbl.textContent = s; },
      tick: async (n) => { lbl.textContent = t('vec.progress.read', { text, count: num(n) }); await new Promise((r) => setTimeout(r, 0)); if (cancelled) throw new Error('Cancelled.'); },   // i18n-ignore: 'Cancelled.' is a signal importFiles checks, never shown
      get cancelled() { return cancelled; },
      done: () => box.remove(),
    };
  }

  /** Ask for a coordinate system: builder C's picker when it is there, else a short list of suggested systems. */
  async function askCrs({ reason, near, purpose = 'project' }) {
    if (reg.pickCrs) return reg.pickCrs({ reason, near, purpose });
    return new Promise((done) => {
      const units = P().state.units;
      let list = [];
      try { list = near ? suggest(near, { unit: purpose === 'project' ? units : null, limit: 30 }) : []; } catch { list = []; }
      const sel = el('select', { className: 'cv-select', id: 'cv-gisv-pick-' + (++uid) }, el('option', { value: '', className: 'select-placeholder' }, t('vec.choose')), ...list.map((e) => el('option', { value: String(e.code) }, 'EPSG:' + e.code + ' — ' + e.name)));
      const { dlg, foot } = dialog(t('vec.ask.title'), [
        el('p', { className: 'cv-note' }, reason),
        list.length ? el('div', { className: 'cv-props' }, el('label', { for: sel.id }, t('vec.ask.system')), sel) : el('p', { className: 'cv-note' }, t('vec.ask.none')),
        el('p', { className: 'cv-note' }, t('vec.ask.note'))]);
      let result = null;
      const ok = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', disabled: true }, t('vec.ask.go'));
      sel.onchange = () => { ok.disabled = !sel.value; };
      ok.onclick = () => { const e = list.find((x) => String(x.code) === sel.value); result = e ? crsFromEntry(e) : null; dlg.close(); };
      dlg.addEventListener('close', () => done(result));
      foot.append(cancelBtn(dlg), ok);
      open(dlg, list.length ? sel : null);
    });
  }

  // ---------------------------------------------------------------- import
  const opener = {
    accepts(files, heads = []) {
      if (files.length === 1 && /\.prj$/i.test(files[0].name)) return false;   // a .prj alone: the coordinate system dialog
      return files.some((f, i) => VECTOR.test(f.name) || (/\.json$/i.test(f.name) && /"type"\s*:\s*"(FeatureCollection|Feature)"/.test(heads[i] || '')));
    },
    open: (files) => importFiles(files),
  };
  reg.openers.push(opener);

  reg.commands.set('gis-import', async () => {
    const inp = el('input', { type: 'file', multiple: true, accept: ANY_GIS, className: 'visually-hidden' });
    inp.addEventListener('change', async () => { const fs = [...inp.files]; inp.remove(); if (fs.length) await host.open(fs); });
    inp.addEventListener('cancel', () => inp.remove());
    host.root.append(inp);
    inp.click();
  });

  async function importFiles(files) {
    const mine = files.filter((f) => VECTOR.test(f.name) || /\.(prj|json)$/i.test(f.name));
    const prog = progress(mine.length === 1 ? t('vec.reading', { file: mine[0].name }) : t('vec.reading.many', { n: mine.length }));
    let r;
    try {
      const data = [];
      for (const f of mine) {
        if (f.size > 200 * 1024 * 1024) { data.push({ name: f.name, data: new Uint8Array(0), size: f.size }); continue; }
        data.push({ name: f.name, data: new Uint8Array(await f.arrayBuffer()) });
        await prog.tick(0);
      }
      r = await readGisFiles(data, { tick: prog.tick });
    } catch (e) { prog.done(); host.say(e.message === 'Cancelled.' ? t('vec.import.cancelled') : t('vec.import.failed', { why: e.message })); return null; }   // i18n-ignore: 'Cancelled.' is progress()'s signal
    prog.done();
    const other = files.filter((f) => !mine.includes(f)).map((f) => f.name);
    if (other.length) r.notes.push(t('vec.import.other', { files: other.join(', ') }));
    if (!r.sources.length) { host.say(r.notes.join(' ') || t('vec.import.nothing', { files: files.map((f) => f.name).join(', ') })); return null; }
    return importDialog(r, files.map((f) => f.name));
  }

  function importDialog(r, names) {
    const p = P(), s = p.state;
    const plan = planImport(s, r.sources);
    const pick = new Set(r.sources.flatMap((src, si) => src.layers.map((l, li) => si + ':' + li)));
    const overrides = new Map();
    let target = plan.case === 'project' ? s.crs : plan.case === 'offer' ? plan.offer : null, setCrs = plan.case === 'offer';
    const body = [];
    body.push(el('p', { className: 'cv-note', 'data-gisv-files': '' }, t(names.length === 1 ? 'vec.files.one' : 'vec.files.many', { files: names.join(', ') })));
    const rows = [];
    r.sources.forEach((src, si) => src.layers.forEach((l, li) => {
      const k = si + ':' + li, box = el('input', { type: 'checkbox', checked: true, 'aria-label': t('vec.import.layer', { layer: l.name }) });
      box.onchange = () => { if (box.checked) pick.add(k); else pick.delete(k); upd(); };
      const empty = l.features.filter((f) => !f.g).length;
      rows.push(el('tr', {}, el('td', {}, box), el('td', {}, l.name), el('td', {}, kindWord(l.geom, l.hasZ ? KIND_WITHZ_KEY : KIND_KEY)), el('td', { className: 'num' }, empty ? t('vec.features.empty', { count: num(l.features.length), empty: num(empty) }) : num(l.features.length)), el('td', { className: 'num' }, String(l.fields.length)), el('td', {}, src.format + ' · ' + srcName(src.src))));
    }));
    body.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table cv-gisv-layers', 'data-gisv-layers': '' },
      el('thead', {}, el('tr', {}, el('th', {}, el('span', { className: 'visually-hidden' }, t('vec.import.go'))), el('th', { scope: 'col' }, t('vec.f.layer')), el('th', { scope: 'col' }, t('vec.col.kind')), el('th', { scope: 'col', className: 'num' }, t('vec.col.features')), el('th', { scope: 'col', className: 'num' }, t('vec.col.fields')), el('th', { scope: 'col' }, t('vec.col.format')))),
      el('tbody', {}, ...rows))));
    const notes = [...r.notes, ...r.sources.flatMap((x) => [...(x.notes || []), ...(x.src.notes || []), ...(x.src.kind === 'bad' ? [t('vec.import.badcrs', { file: x.file, why: x.src.why })] : [])])];
    if (notes.length) body.push(el('div', { className: 'cv-report' }, el('ul', {}, ...notes.slice(0, 30).map((n) => el('li', {}, n)))));
    // the coordinate system
    const crsBox = el('div', { className: 'cv-gisv-crs', 'data-gisv-crs': '' });
    body.push(el('h3', { className: 'cv-h3' }, t('vec.import.crs')), crsBox);
    const what = el('p', { className: 'cv-note cv-gisv-what', 'data-gisv-what': '' });
    body.push(el('h3', { className: 'cv-h3' }, t('vec.import.what')), what);
    const { dlg, foot } = dialog(t('layers.undo.import'), body, 'cv-gisv-import');
    const go = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-gisv-go': '' }, t('vec.import.go'));
    foot.append(cancelBtn(dlg), go);
    const radio = (name, value, label, checked, on) => { const i = el('input', { type: 'radio', name, value, checked }); i.onchange = on; return el('label', { className: 'cv-check' }, i, ' ', label); };
    const unknown = r.sources.map((x, i) => (x.src.kind === 'none' ? i : -1)).filter((i) => i >= 0);
    function renderCrs() {
      const out = [];
      if (plan.case === 'project') out.push(el('p', { className: 'cv-note' }, t(s.crs.local ? 'vec.import.project.local' : 'vec.import.project', { crs: s.crs.name })));
      else if (plan.case === 'offer' || (plan.case === 'pick' && target)) {
        const nm = 'cv-gisv-off-' + uid;
        if (plan.case === 'offer') {
          out.push(radio(nm, 'use', el('span', {}, ...strongIn('vec.offer.use', 'crs', plan.offer.name)), setCrs && target === plan.offer, () => { target = plan.offer; setCrs = true; upd(); }));
          out.push(radio(nm, 'pick', t('vec.offer.pick'), target !== plan.offer, async () => { const c = await chooseProject(plan.near); if (c) { target = c; setCrs = true; } renderCrs(); upd(); }));
        } else out.push(el('p', { className: 'cv-note' }, ...strongIn('vec.offer.will', 'crs', target.name), ' ', el('button', { type: 'button', className: 'cv-linkbtn', onclick: async () => { const c = await chooseProject(plan.near); if (c) target = c; renderCrs(); upd(); } }, t('vec.offer.another'))));
        if (plan.case === 'offer' && target !== plan.offer) out.push(el('p', { className: 'cv-note' }, ...strongIn('vec.offer.chosen', 'crs', target.name)));
      } else if (plan.case === 'pick') {
        out.push(el('p', { className: 'cv-note' }, plan.why));
        out.push(el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-gisv-pick': '', onclick: async () => { const c = await chooseProject(plan.near); if (c) { target = c; setCrs = true; } renderCrs(); upd(); } }, t('vec.pick.project')));
      } else out.push(el('p', { className: 'cv-note' }, t('vec.import.nocrs')));
      for (const si of unknown) {
        if (plan.case === 'none' && !target) break;
        const src = r.sources[si], nm = 'cv-gisv-unk-' + si + '-' + uid, ov = overrides.get(si);
        out.push(el('fieldset', { className: 'cv-gisv-unknown' }, el('legend', { className: 'cv-note' }, t('vec.unknown.legend', { file: src.file })),
          radio(nm, 'same', t('vec.unknown.same'), !ov || ov.kind === 'same', () => { overrides.set(si, { kind: 'same' }); upd(); }),
          radio(nm, 'pick', ov && ov.kind !== 'same' ? t('vec.unknown.in', { crs: srcName(ov) }) : t('vec.unknown.pick'), !!ov && ov.kind !== 'same', async () => { const c = await askCrs({ reason: t('vec.unknown.which', { file: src.file }), near: plan.near, purpose: 'source' }); if (c) overrides.set(si, c.unit === 'deg' ? { kind: 'crs', crs: c, name: c.name, geographic: true } : { kind: 'crs', crs: c, name: c.name, geographic: false }); renderCrs(); upd(); })));
        if (!overrides.has(si)) overrides.set(si, { kind: 'same' });
      }
      crsBox.replaceChildren(...out);
    }
    async function chooseProject(near) {
      const c = await askCrs({ reason: plan.why || t('vec.pick.reason'), near, purpose: 'project' });
      if (!c) return null;
      const why = crsProblem(c, s.units);
      if (why) { host.say(why); return null; }
      return c;
    }
    function upd() {
      const chosen = r.sources.flatMap((src, si) => src.layers.filter((l, li) => pick.has(si + ':' + li)).map((l) => ({ l, src, si })));
      const feats = chosen.reduce((a, x) => a + x.l.features.length, 0);
      const needs = !target && chosen.some(({ src, si }) => (overrides.get(si) || src.src).kind === 'crs' || src.src.kind === 'wgs84');
      go.disabled = !chosen.length || needs;
      const bits = [];
      if (!chosen.length) bits.push(t('vec.what.none'));
      else {
        bits.push(t('vec.what.layers', { n: chosen.length, count: num(chosen.length), features: num(feats) }));
        if (needs) bits.push(t('vec.what.needs'));
        else if (target) {
          const conv = chosen.filter(({ src, si }) => { const x = overrides.get(si) || src.src; return x.kind === 'wgs84' || (x.kind === 'crs' && x.crs.proj4 !== target.proj4) || (x.kind === 'crs' && target.local); }).map(({ src, si }) => srcName(overrides.get(si) || src.src));
          if (conv.length) bits.push(t(target.local ? 'vec.what.convert.local' : 'vec.what.convert', { from: [...new Set(conv)].join(', '), to: target.name }));
          if (setCrs && !s.crs) bits.push(t('vec.what.becomes', { crs: target.name }));
        }
        bits.push(t('vec.what.undo'));
      }
      what.textContent = bits.join(' ');
    }
    go.onclick = () => {
      const setting = setCrs && !s.crs;
      const res = importInto(P(), r.sources, { crs: target, setCrs: setting, overrides, pick });
      dlg.close();
      api.last = { ids: res.ids, notes: res.notes, count: res.count };
      if (!res.ids.length) { host.say(t('vec.imported.none') + ' ' + res.notes.join(' ')); return; }
      if (setting) for (const f of reg.crsChange) f(null, P().state.crs);
      const first = !P().points.length && !P().state.alignments.length && P().state.gis.layers.length === res.ids.length;
      host.report(res.notes);
      host.refresh();
      if (first) host.fitAll();
      host.say(t('vec.imported', { n: res.ids.length, count: num(res.ids.length), features: num(res.count) }));
    };
    renderCrs(); upd();
    open(dlg, go.disabled ? crsBox.querySelector('button, input') || go : go);
    return dlg;
  }

  // ---------------------------------------------------------------- use for the surface
  function useDialog(id, featureIndex = null) {
    const l = layerOf(P(), id);
    if (!l) return;
    const fs = featuresOf(P(), id), choices = useChoices(l, fs);
    if (!choices.length) { host.say(t('vec.use.nothing', { layer: l.name })); return; }
    const nm = 'cv-gisv-use-' + (++uid);
    let pickI = 0;
    const field = el('select', { className: 'cv-select', id: nm + '-f' });
    const fieldRow = el('div', { className: 'cv-props' }, el('label', { for: field.id }, t('vec.use.field')), field);
    const opts = choices.map((c, i) => { const r = el('input', { type: 'radio', name: nm, value: String(i), checked: i === 0 }); r.onchange = () => { pickI = i; sync(); }; return el('label', { className: 'cv-check' }, r, ' ', c.label); });
    const selNote = featureIndex !== null && l.geom === 'pg' ? el('p', { className: 'cv-note' }, t('vec.use.selected', { n: featureIndex + 1 })) : el('p', { className: 'cv-note' }, l.geom === 'pg' ? t('vec.use.largest') : '');
    const { dlg, foot } = dialog(t('vec.use.title', { layer: l.name }), [el('fieldset', { className: 'cv-gisv-use' }, el('legend', { className: 'visually-hidden' }, t('vec.use.as')), ...opts), fieldRow, selNote,
      el('p', { className: 'cv-note' }, t('vec.use.note'))]);
    const ok = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-gisv-use-go': '' }, t('vec.use.go'));
    function sync() {
      const c = choices[pickI];
      fieldRow.hidden = c.from !== 'field';
      if (c.from === 'field') { field.replaceChildren(...c.fields.map((f) => el('option', { value: f }, f))); const guess = c.fields.find((f) => /^(elev|elevation|z|contour|height|cont|elev_ft|elev_m)$/i.test(f)); if (guess) field.value = guess; }
      selNote.hidden = c.use !== 'boundary';
    }
    ok.onclick = () => {
      const c = choices[pickI];
      const r = useForSurface(P(), id, { use: c.use, from: c.from, field: c.from === 'field' ? field.value : null, feature: c.use === 'boundary' ? featureIndex : null });
      dlg.close();
      host.say(r.message);
      api.lastUse = r;
    };
    foot.append(cancelBtn(dlg), ok);
    sync();
    open(dlg, ok);
  }

  // ---------------------------------------------------------------- the project's system changed
  // (before, after, { converted }) — builder C passes converted = the project's coordinates were converted into the new
  // system: the GIS layers then follow at once (their own undo step, said); otherwise nothing moved, so ask
  reg.crsChange.push(async (before, after, opts = {}) => {
    const layers = gisOf(P()).layers;
    if (!layers.length || !before || !after) return;
    if (before.proj4 === after.proj4 && JSON.stringify(before.local) === JSON.stringify(after.local)) return;
    const move = () => moveLayers(P(), before, after);
    if (opts.converted) { move(); host.say(t('vec.move.converted', { crs: after.name })); return; }
    const named = (c) => (c.local ? t('vec.crs.ground', { crs: c.name }) : c.name);
    const c = await host.ask({ title: t('vec.move.title'), text: t('vec.move.text', { before: named(before), after: named(after) }), buttons: [['cancel', t('vec.move.leave'), 'btn-line'], ['move', t('vec.move.go'), 'btn-plot']] });
    if (c !== 'move') return;
    move();
    host.say(t('vec.move.done', { crs: after.name }));
  });

  // ---------------------------------------------------------------- latitude/longitude point files, LandXML systems
  reg.pointsLatLon = async (points, name) => {
    const s = P().state;
    let crs = s.crs, set = null;
    if (!crs) {
      const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
      const near = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
      crs = await askCrs({ reason: t('vec.latlon.reason', { file: name }), near, purpose: 'project' });
      if (!crs) return null;
      const why = crsProblem(crs, s.units);
      if (why) { host.say(why); return null; }
      set = crs;
    }
    const r = latLonPoints(points, crs);
    const cname = crs.local ? t('vec.crs.ground', { crs: crs.name }) : crs.name;
    return { points: r.points, crs: set, note: t(set ? 'vec.latlon.note.set' : 'vec.latlon.note', { crs: cname }) + (r.bad ? ' ' + t('vec.latlon.bad', { n: r.bad }) : '') };
  };
  reg.landxmlCrs = async (cs, name) => {
    const r = crsFromLandXml(cs);
    const s = P().state;
    if (!r.crs) { host.say(t('vec.lx.unknown', { file: name, why: r.why })); return; }
    const why = crsProblem(r.crs, s.units);
    if (why) { host.say(t('vec.lx.cannot', { file: name, crs: r.crs.name, why })); return; }
    if (s.crs && s.crs.proj4 === r.crs.proj4) return;
    const c = await host.ask({ title: t('vec.lx.title'), text: t('vec.lx.says', { file: name, crs: r.crs.name + (r.crs.code ? ' (EPSG:' + r.crs.code + ')' : '') }) + (cs.desc ? ' ' + t('vec.lx.also', { desc: cs.desc.slice(0, 200) }) : '') + ' ' + t('vec.lx.use'), buttons: [['cancel', t('vec.lx.notnow'), 'btn-line'], ['use', t('vec.use.go'), 'btn-plot']] });
    if (c !== 'use') return;
    const before = s.crs;
    P().change(t('vec.lx.undo', { file: name }), (st) => { st.crs = r.crs; });
    for (const f of reg.crsChange) f(before, r.crs);
    host.say(t('vec.lx.now', { crs: r.crs.name }));
  };

  // ---------------------------------------------------------------- export
  (reg.exportExtra ||= []);
  function exportDialog() {
    const p = P(), s = p.state, crs = s.crs;
    const kinds = exportKinds(p);
    const nm = 'cv-gisv-x-' + (++uid);
    const ticks = kinds.map((k) => {
      const b = el('input', { type: 'checkbox', value: k.key, checked: k.count > 0 && !k.key.startsWith('contours-fg'), disabled: !k.count });
      return el('label', { className: 'cv-check' + (k.count ? '' : ' is-off') }, b, ' ', k.label, el('span', { className: 'cv-note' }, ' ' + (k.count ? num(k.count) : t('vec.x.none'))));
    });
    const fmts = [['shp', t('vec.x.fmt.shp')], ['gpkg', t('vec.x.fmt.gpkg')], ['geojson', t('vec.x.fmt.geojson')], ['kml', t('kml.fmt.kml')], ['kmz', t('kml.fmt.kmz')]];   // kml, kmz: 0.4 V6
    let fmt = 'shp';
    try { const v = localStorage.getItem('civilcraft.gisExportFormat'); if (fmts.some((f) => f[0] === v)) fmt = v; } catch { /* storage blocked */ }
    if (fmt === 'geojson' && !crs) fmt = 'shp';
    const fmtEls = fmts.map(([v, label]) => { const r = el('input', { type: 'radio', name: nm, value: v, checked: v === fmt, disabled: v === 'geojson' && !crs }); r.onchange = () => { fmt = v; upd(); }; return el('label', { className: 'cv-check' + (r.disabled ? ' is-off' : '') }, r, ' ', label); });
    const crsLabel = crs ? crs.name + (crs.code ? ' (EPSG:' + crs.code + ')' : '') : '';
    const coordNote = el('p', { className: 'cv-note', 'data-gisv-coords': '' }, crs
      ? (crs.local ? t(crs.local.rotation ? 'vec.x.coords.local.rot' : 'vec.x.coords.local', { crs: crsLabel, scale: crs.local.scale, rotation: crs.local.rotation }) : t('vec.x.coords', { crs: crsLabel }))
      : t('vec.x.coords.none'));
    const unitNote = el('p', { className: 'cv-note' }, t(s.units === 'm' ? 'vec.x.units.m' : 'vec.x.units.ft'));
    const extra = el('div', { className: 'cv-gisv-extra', 'data-gis-export-extra': '' }, el('div', { 'data-gis-geotiff': '' }));
    const msg = el('p', { className: 'cv-note', role: 'status', 'data-gisv-xmsg': '' });
    const { dlg, foot } = dialog(t('vec.x.title'), [
      el('fieldset', { className: 'cv-gisv-kinds', 'data-gisv-kinds': '' }, el('legend', { className: 'cv-h3' }, t('vec.x.what')), ...ticks),
      el('fieldset', { className: 'cv-gisv-fmts', 'data-gisv-fmts': '' }, el('legend', { className: 'cv-h3' }, t('vec.x.as')), ...fmtEls),
      coordNote, unitNote, msg, extra], 'cv-gisv-export');
    const go = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-gisv-xgo': '' }, t('vec.x.download'));
    foot.append(cancelBtn(dlg, t('vec.close')), go);
    const keys = () => ticks.map((t) => t.querySelector('input')).filter((i) => i.checked && !i.disabled).map((i) => i.value);
    function upd() { go.disabled = !keys().length; go.textContent = t({ kml: 'kml.go.kml', kmz: 'kml.go.kmz', shp: 'vec.x.go.shp', gpkg: 'vec.x.go.gpkg', geojson: 'vec.x.go.geojson' }[fmt]); }
    for (const t of ticks) t.querySelector('input').addEventListener('change', upd);
    go.onclick = async () => {
      go.disabled = true; msg.textContent = t('vec.x.writing');
      try {
        try { localStorage.setItem('civilcraft.gisExportFormat', fmt); } catch { /* storage blocked */ }
        const r = await exportProject(P(), keys(), fmt, { stem: host.fileStem() });
        host.download(r.bytes, r.name, r.type);
        const text = t('vec.x.done', { file: r.name, list: r.groups.map((g) => g.label.toLowerCase() + ' (' + num(g.features.length) + ')').join(', ') }) + (r.notes.length ? ' ' + r.notes.join(' ') : '');
        msg.textContent = text; host.say(text);
        api.lastExport = { name: r.name, kinds: r.groups.map((g) => g.key), notes: r.notes };
      } catch (e) { msg.textContent = t('vec.x.failed', { why: e.message }); }
      upd();
    };
    upd();
    open(dlg, go);
    for (const f of reg.exportExtra) { try { f(extra, host); } catch (e) { console.warn(e); } }
    return dlg;
  }
  reg.commands.set('gis-export', async () => { exportDialog(); });

  api.importFiles = importFiles;
  api.exportDialog = exportDialog;
  api.useDialog = useDialog;
  host.vector = api;
  watch();
}

export { KIND, middleLonLat, resolveSrc };
