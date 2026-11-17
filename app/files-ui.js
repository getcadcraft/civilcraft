/* SPDX-License-Identifier: Apache-2.0 */
/**
 * files-ui.js: civilcraft.js's 19 bindings for this topic, moved out of init() unchanged (0.10 PERF.71, code-mains-10; no behaviour change).
 * mountFiles(ctx) is called once by init(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables init() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { t } from './i18n.js';
import { decodePartsAsync, partsOf, parseJsonParts } from './textin.js';
import { Project } from './project.js';
import { readLandXml, writeLandXml } from './landxml.js';
import { cleanRail, railDefaults } from './rail.js';
import { cleanWater } from './water.js';
import { waterFromNetwork, waterNetwork } from './water-objects.js';
import { defaultNetwork, defaultStructDia, defaultPipeDia } from './pipes.js';
import { cleanType } from './structs.js';
import { cleanFeature } from './featureline.js';
import { num, el } from './ui-util.js';
import { parsePoints } from './points.js';
import { fixed } from './units.js';
import { fitScale, paperBy, PAPERS, scalesFor, sheetWindow, planSheet, toPdf } from './plot.js';
import { writeDxf } from './dxf.js';
import { LAYERS, toDxfEntities } from './scene.js';

export function mountFiles(ctx) {
  const { ui, view, gisLoad, buildScene, refresh, rebind, say, nativeUi, ifcUi, refocus, busy, confirmDiscard } = ctx;

  async function openFile(f) {
    if (f.size > 200 * 1024 * 1024) { say(t('cv.file.toobig')); return; }
    if (/\.ccbundle$|ccbundle\.zip$/i.test(f.name)) {   // 0.8 BIM-BUNDLE-OPEN: a project bundle opens as its IFC model (shared reader and plan, ./bundle/plan.js)
      const r = await (await import('./bundle/plan.js')).expandBundles([f], 'civilcraft', { prefer: ['model'], limit: 1 });
      const n = r.notes[0];
      if (!n || n.code === 'failed') { say(t('bundle.failed', { file: f.name, why: n ? n.why : '' })); return; }
      if (n.code === 'empty' || !r.files.length) { say(t('bundle.nomodel', { file: f.name })); return; }
      say(t('bundle.model', { file: f.name }));
      (await ifcUi())?.importFile(r.files[0]); return;
    }
    if (/\.ifc$/i.test(f.name)) { (await ifcUi())?.importFile(f); return; }   // 0.7.1 71.24: through cc-ifc (ifc-civil-read.js)
    busy(t('cad.ui.reading', { file: f.name }));
    // 0.10 PERF.20: a big text file (over 32 MB) is read in parts of 4 MB: LandXML and project files never as one string
    try { openText(f.size > ctx.TEXT_PARTS_FROM ? await decodePartsAsync(f) : await f.text(), f.name); } catch (err) { say(t('cad.ui.read.failed', { file: f.name, why: err.message })); } finally { busy(null); }
  }

  async function openText(text, name, ownUnit = null) {
    const ext = (name.match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();
    const head = (typeof text === 'string' ? text : partsOf(text)[0] || '').slice(0, 400).trimStart();
    if (ext === 'json' || head.startsWith('{')) return openProject(text, name);
    if (ext === 'xml' || ext === 'landxml' || head.startsWith('<')) return openLandXml(text, name);
    return importPoints(typeof text === 'string' ? text : (text.string ? text.string() : partsOf(text).join('')), name, ownUnit);   // a points file is read as one string; over the string limit it says so
  }

  async function openProject(text, name) {
    const from = ctx.openingFrom;   // read now: it is cleared once the opening call returns, before the discard question
    let r;
    try { r = Project.fromJSON(typeof text === 'string' ? JSON.parse(text) : parseJsonParts(text)); } catch (err) { say(t('cv.open.failed', { file: name, why: err.message })); return; }
    if (!(await confirmDiscard())) return;
    ctx.project = r.project; ctx.project.saved = ctx.project.version; ctx.projectTarget = from; rebind();
    ctx.sel = null; ctx.selPvi = -1; ctx.lastReport = r.notes.length ? r.notes : null;
    refresh(); fitAll();
    say(t('cv.opened', { file: name }));
  }

  async function openLandXml(text, name) {
    let d;
    try { d = readLandXml(text); } catch (err) { say(t('cv.open.failed', { file: name, why: err.message })); return; }
    if (!d.points.length && !d.surfaces.length && !d.alignments.length && !d.networks?.length && !d.features?.length) { say(t('cv.lx.empty', { file: name }) + (d.notes.length ? ' ' + d.notes.join(' ') : '')); return; }
    if (!(await confirmDiscard())) return;
    const p = new Project(), notes = [...d.notes];
    p.state.units = d.units || 'ft';
    p.state.name = (d.name || name.replace(/\.[^.]+$/, '')).slice(0, 120);
    if (d.points.length) p.setPoints(d.points, name);
    const s0 = d.surfaces[0];
    if (s0) {
      p.state.surface.name = s0.name.slice(0, 120);
      p.state.surface.breaklines = s0.breaklines.map((b) => ({ name: b.name.slice(0, 120), pts: b.pts }));
      p.state.surface.boundary = s0.boundary;
      if (s0.faces.length) p.state.surface.tin = { pts: s0.pts, faces: s0.faces };
      if (d.surfaces.length > 1) notes.push(t('cv.lx.surfaces.more', { name: s0.name, n: d.surfaces.length - 1 }));
    }
    for (const a of d.alignments) {
      const prof = a.profiles[0];
      p.state.alignments.push({ id: p.nextId('a'), name: a.name.slice(0, 120), start: a.start, pis: a.pis, pvis: prof ? prof.pvis : [],
        ...(a.cant ? { rail: cleanRail({ ...railDefaults(p.state.units), on: true, pivot: a.cant.pivot, ...(a.cant.gauge ? { gauge: a.cant.gauge } : {}) }, p.state.units), ...(a.cant.speed ? { design: { speed: a.cant.speed, unit: a.cant.speedUnit } } : {}) } : {}) });   // CV.1 2026-11-12: a <Cant> makes it a railway
      if (a.profiles.length > 1) notes.push(t('cv.lx.profiles.more', { name: a.name }));
    }
    const n0 = d.networks?.find((x) => x.type !== 'water'), nw0 = d.networks?.find((x) => x.type === 'water');   // 0.8 LC.16 rest: a water network opens as water mains
    if (nw0) { const w = cleanWater(waterFromNetwork(nw0, p.state.units), p.state.units); if (w.nodes.length) { p.state.water = w; notes.push(t('cv.lx.water', { n: w.pipes.length })); } }
    if (n0) {
      p.state.network = { ...defaultNetwork(p.state.units), name: n0.name.slice(0, 60), type: n0.type, structures: n0.structures.map((x) => ({ ...x, id: p.nextId('s'), _old: x.id, name: x.name.slice(0, 60), dia: x.dia || defaultStructDia(p.state.units) })), pipes: [] };
      const map = new Map(p.state.network.structures.map((x) => [x._old, x.id]));
      for (const x of p.state.network.structures) delete x._old;
      // 0.6 WL.27: structures read with a shape (RectStruct, or a wall thickness) get a type each distinct size
      const types = new Map();
      for (const x of p.state.network.structures) {
        const si = x.shapeIn;
        delete x.shapeIn;
        if (!si) continue;
        const key = JSON.stringify([si.shape, si.dia, si.w, si.l, si.wall]);
        if (!types.has(key)) { const k = cleanType({ ...si, sump: x.sumpDepth || 0 }, p.state.units); if (k) { k.id = p.nextId('u'); k.name = si.name ? si.name.slice(0, 80) : k.name; types.set(key, k); } }
        const k = types.get(key);
        if (k) Object.assign(x, { type: k.id, dia: k.shape === 'round' ? k.dia : k.w });
      }
      if (types.size) p.state.network.types = [...types.values()];
      p.state.network.pipes = n0.pipes.map((q) => ({ ...q, id: p.nextId('q'), name: q.name.slice(0, 60), from: map.get(q.from), to: map.get(q.to), dia: q.dia || defaultPipeDia(p.state.units) }));
      notes.push(t('cv.lx.net.rules'));
      if (d.networks.filter((x) => x.type !== 'water').length > 1) notes.push(t('cv.lx.nets.more', { n: d.networks.filter((x) => x.type !== 'water').length - 1 }));
    }
    // 0.6 WL.24: feature lines (with their arcs); a line from another program is drawn only until its use is chosen
    let flOff = 0;
    for (const f of d.features || []) {
      const c = cleanFeature({ ...f, use: f.use || 'off' }, p.state.units);
      if (!c) continue;
      if (!f.use) flOff++;
      c.id = p.nextId('f');
      (p.state.features ||= []).push(c);
    }
    if (flOff) notes.push(t('cv.lx.fl.off', { n: flOff }));
    p.undoStack = []; p.version++; p.saved = p.version;
    ctx.project = p; rebind(); ctx.sel = null; ctx.selPvi = -1; ctx.lastReport = notes.length ? notes : null;
    refresh(); fitAll();
    say(t('cv.lx.opened', { file: name, points: t('cv.pts.n', { n: d.points.length, count: num(d.points.length) }), surfaces: t('cv.surfaces.n', { n: d.surfaces.length }), alignments: t('cv.als.n', { n: d.alignments.length }) }));
    // GIS: the file's <CoordinateSystem> is offered as the project's system (gis-vector-ui.js)
    if (d.coordinateSystem) gisLoad().then(() => ctx.gisReg.landxmlCrs?.(d.coordinateSystem, name)).catch(() => {});
  }

  function importPoints(text, name, ownUnit = null) {   // ownUnit: the unit of a list the app itself supplies (the sample site)
    const dlg = ui.imp, $d = (s) => dlg.querySelector(s);
    let res = null;
    const parse = () => {
      res = parsePoints(text, { format: $d('[data-imp-format]').value, prefer: ctx.settings.order });
      $d('[data-imp-file]').textContent = name;
      const delimKey = { ',': 'cv.imp.delim.comma', '\t': 'cv.imp.delim.tab', ';': 'cv.imp.delim.semi', ws: 'cv.imp.delim.space' }[res.delimiter];
      const delim = delimKey ? t(delimKey) : '—';
      $d('[data-imp-summary]').textContent = res.points.length
        ? t(res.formatFrom === 'header' ? 'cv.imp.read.header' : res.formatFrom === 'chosen' ? 'cv.imp.read.chosen' : 'cv.imp.read.guessed', { n: res.points.length, count: num(res.points.length), format: res.format, order: ctx.settings.order, delim }) + (res.badCount ? ' ' + t('cv.imp.bad', { n: res.badCount, count: num(res.badCount) }) : '')
        : t('cv.imp.none');
      // GIS: latitude/longitude columns are degrees — converted through a coordinate system on Import, never loaded as feet
      if (res.latlon && res.points.length) $d('[data-imp-summary]').textContent += ' ' + (ctx.project.state.crs ? t('cv.imp.latlon.crs', { crs: ctx.project.state.crs.name }) : t('cv.imp.latlon.pick'));
      const rows = res.points.slice(0, 6);
      $d('[data-imp-preview]').replaceChildren(rows.length ? el('table', { className: 'cv-table' },
        el('thead', {}, el('tr', {}, ...[t('sk.c.point'), t('pt.props.northing'), t('pt.props.easting'), t('pt.props.elev'), t('pt.props.desc')].map((h) => el('th', { scope: 'col' }, h)))),
        el('tbody', {}, ...rows.map((p) => el('tr', {}, el('td', {}, p.n), el('td', { className: 'num' }, fixed(p.y, 3)), el('td', { className: 'num' }, fixed(p.x, 3)), el('td', { className: 'num' }, p.z === null ? '—' : fixed(p.z, 3)), el('td', {}, p.d))))) : '');
      $d('[data-imp-bad]').replaceChildren(res.bad.length ? el('div', { className: 'cv-report' }, el('p', {}, t('cv.imp.bad.head')), el('ul', {}, ...res.bad.slice(0, 25).map((b) => el('li', {}, t('cv.imp.bad.line', { line: b.line, why: b.why, text: b.text.slice(0, 60) })))), res.badCount > 25 ? el('p', {}, t('cv.imp.bad.more', { count: num(res.badCount - 25) })) : '') : '');
      $d('[data-imp-ok]').disabled = !res.points.length;
    };
    $d('[data-imp-format]').value = 'auto';
    parse();
    $d('[data-imp-format]').onchange = parse;
    $d('[data-imp-ok]').onclick = async () => {
      dlg.close('ok');
      // GIS: latitude/longitude → project coordinates through the project's system, or one picked now (gis-vector-ui.js)
      let pts = res.points, llNote = '', llCrs = null;
      if (res.latlon) {
        try { await gisLoad(); } catch { return; }
        const r = ctx.gisReg.pointsLatLon ? await ctx.gisReg.pointsLatLon(res.points, name) : null;
        if (!r) { say(t('cv.imp.latlon.need', { file: name })); return; }
        pts = r.points; llNote = ' ' + r.note; llCrs = r.crs;
      }
      // 0.10 BK.8 (units on import): a point list that states its unit in its first lines is converted and that is said; one that states
      // none is asked about before the points go in (the shell's one dialog, remembered per file). It was read in project units, unasked.
      let unitNote = '';
      if (!res.latlon && globalThis.ccImportUnits) {
        const IU = globalThis.ccImportUnits, pu = ctx.project.state.units === 'm' ? 'm' : 'ft';
        const a = await IU.resolve({ file: name, format: t('cv.imp.unitformat'), stated: IU.statedInText(text) || ownUnit, choices: ['ft', 'usft', 'm'], suggest: pu, say });
        if (!a) return;
        const k = IU.MM_PER[a.unit] / IU.MM_PER[pu];
        if (Math.abs(k - 1) > 1e-12) pts = pts.map((p) => ({ ...p, x: p.x * k, y: p.y * k, z: p.z === null || p.z === undefined ? p.z : p.z * k }));
        unitNote = ' ' + a.text;
      }
      const replacing = ctx.project.points.length;
      ctx.project.state.surface.tin = null;
      if (!ctx.project.points.length && !ctx.project.state.alignments.length && ctx.project.state.name === t('project.untitled')) ctx.project.state.name = name.replace(/\.[^.]+$/, '').slice(0, 120);
      ctx.lastReport = null;
      if (llCrs) { const before = ctx.project.state.crs; ctx.project.state.crs = llCrs; for (const f of ctx.gisReg.crsChange) f(before, llCrs); }   // GIS
      ctx.project.setPoints(pts, name);
      ctx.sel = null; ctx.selPvi = -1; ctx.picked.clear();
      refresh(); fitAll();
      const sf = ctx.eg().surface;
      const counts = { n: pts.length, count: num(pts.length), file: name, tris: sf ? num(sf.nT) : '' };
      say(t(sf ? (replacing ? 'cv.imp.replaced.sf' : 'cv.imp.imported.sf') : (replacing ? 'cv.imp.replaced' : 'cv.imp.imported'), counts) + ' ' + t('cv.imp.mark') + llNote + unitNote);
    };
    for (const b of dlg.querySelectorAll('[data-close]')) b.onclick = () => dlg.close('cancel');
    dlg.onclose = () => refocus();
    dlg.showModal();
    $d('[data-imp-ok]').focus();
  }

  /** An export: always a copy (browser: a download; desktop: the save dialog). */
  function download(bytes, name, type) {
    ctx.fileHost.download(bytes instanceof Blob ? bytes : new Blob([bytes], { type }), name, type);
  }
  function fileStem() { return (ctx.project.state.name || 'site').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').trim().slice(0, 80) || 'site'; }   // hoisted: autosave names its copy at start

  /** Save the project: in place when it was opened from a project file on the desktop, else a new file (browser: a
   *  download, as before). → true when saved. */
  async function saveProject() {
    // 0.7.1 71.27 (owner): the pair — <name>.civilcraft.json + <name>.ifc (IFC 4.3) side by side (ifc-native-ui.js)
    const n = await nativeUi();
    if (!n) return false;
    const ok = await n.save();
    if (ok) ctx.asDoc?.clean();
    return ok;
  }

  function exportLandXml() {
    const s = ctx.project.state, r = ctx.eg();
    if (!ctx.project.points.length && !r.surface && !s.alignments.length && !(s.features || []).length) { say(t('cv.export.none')); return; }
    const surfaces = [];
    if (r.surface) surfaces.push({ name: s.surface.name || t('surface.eg'), desc: t('surface.eg'), surface: r.surface, breaklines: ctx.project.egBreaklines(), boundary: s.surface.boundary });
    const g = ctx.graded();
    if (g.surface) surfaces.push({ name: t('cv.lx.proposed'), desc: t('cv.lx.proposed.desc', { n: s.pads.length }), surface: g.surface });
    const xml = writeLandXml({
      name: s.name, units: s.units, points: ctx.project.points, surfaces, crs: s.crs,   // GIS: <CoordinateSystem> when the project has one
      alignments: s.alignments.map((a) => ({ name: a.name, alignment: ctx.project.alignment(a), eg: r.surface ? { name: s.surface.name || t('surface.eg'), pts: ctx.project.egProfile(a) } : null, profile: a.pvis.length >= 2 ? { name: t('cv.lx.design', { name: a.name }), profile: ctx.project.designProfile(a) } : null, cant: a.rail?.on ? { plan: ctx.project.railPlan(a), rail: a.rail, speed: ctx.project.railAsm(a).rail.speed } : null })),   // cant: CV.1 2026-11-12
      features: s.features || [],   // 0.6 WL.24
      networks: [...(s.water?.pipes?.length ? [waterNetwork(cleanWater(s.water, s.units), s.units, { zAt: (x, y) => { const z = (ctx.graded().surface || ctx.eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; } })] : []), ...(s.network ? [{ ...s.network, structures: s.network.structures.map((x) => { const i = ctx.project.networkCheck().structs.get(x.id); return { ...x, rimShown: i?.rim ?? null, sump: i?.sump ?? null }; }) }] : [])],
    });
    download(xml, fileStem() + '.xml', 'application/xml');
    const skipped = s.alignments.filter((a) => !ctx.project.alignment(a).ok).length;
    const als = t('cv.als.n', { n: s.alignments.length - skipped });
    const list = [t('cv.pts.n', { n: ctx.project.points.length, count: num(ctx.project.points.length) }), t('cv.surfaces.n', { n: surfaces.length }), skipped ? t('cv.lx.als.skipped', { alignments: als, n: skipped }) : als];
    if (s.network) list.push(t('cv.lx.network'));
    if ((s.features || []).length) list.push(t('cv.lx.features', { n: s.features.length }));   // 0.6 WL.24
    say(t('cv.lx.exported', { list: list.join(', ') }));
  }

  function extentsAll() {
    const b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    const g = (x, y) => { b.minX = Math.min(b.minX, x); b.maxX = Math.max(b.maxX, x); b.minY = Math.min(b.minY, y); b.maxY = Math.max(b.maxY, y); };
    const sf = ctx.eg().surface;
    if (sf) { const s = sf.bounds; g(s.minX, s.minY); g(s.maxX, s.maxY); }
    for (const p of ctx.project.points) g(p.x, p.y);
    for (const a of ctx.project.state.alignments) for (const p of a.pis) g(p.x, p.y);
    for (const d of ctx.project.state.pads) for (const p of d.pts) g(p.x, p.y);
    for (const d of [...(ctx.project.state.parcels || []), ...(ctx.project.state.masses || []), ...(ctx.project.state.network?.catchments || []), ...(ctx.project.state.features || [])]) for (const p of d.pts) g(p.x, p.y);   // 0.4 V14/V19/V21
    for (const f of ctx.gisReg.extents) { const e = f(); if (e && Number.isFinite(e.minX)) { g(e.minX, e.minY); g(e.maxX, e.maxY); } }
    return Number.isFinite(b.minX) ? b : null;
  }
  function fitAll() {
    const b = extentsAll();
    if (b) { view.origin = { x: Math.floor(b.minX), y: Math.floor(b.minY) }; view.invalidateScene(); }
    view.fit(b);
  }

  function exportDxf() {
    const ext = extentsAll();
    if (!ext) { say(t('cv.export.none')); return; }
    const scale = fitScale(ctx.units(), ext, paperBy(ctx.units() === 'm' ? 'a3' : 'tabloid'));
    const sc = buildScene(scale.mmPerUnit);
    const { text, report } = writeDxf({ units: ctx.units(), layers: LAYERS.map((l) => ({ name: l.name, color: l.aci })), entities: toDxfEntities(sc, scale.mmPerUnit) });
    download(text, fileStem() + '.dxf', 'application/dxf');
    say(t('cv.dxf.done', { n: sc.items.length, count: num(sc.items.length), scale: scale.label }) + (report.notes.length ? ' ' + report.notes.join(' ') : '') + ' ' + t('cv.bands.no'));
  }

  /**
   * Same drawing as the DXF, written as a DWG by dwg-write.js (our own cc-dwg library, loaded on first use), in the
   * format picked in the dialog: 2000 (the default), 2004, 2007, 2010, 2013 or 2018 — remembered in this browser.
   */
  const DWG_YEAR = { AC1015: '2000', AC1018: '2004', AC1021: '2007', AC1024: '2010', AC1027: '2013', AC1032: '2018' };
  function dwgDialog() {
    if (!extentsAll()) { say(t('cv.export.none')); return; }
    const sel = ui.dwg.querySelector('[data-dwg-format]');
    let saved = null;
    try { saved = localStorage.getItem('civilcraft.dwgFormat'); } catch { /* storage blocked */ }
    if (saved && (DWG_YEAR[saved] || saved === 'DXF')) sel.value = saved;   // 0.7.1 71.24: DXF is a choice of the one DWG / DXF button
    ui.dwg.querySelector('[data-dwg-map-row]').hidden = !visibleMaps() || sel.value === 'DXF';   // 0.4 V8
    ui.dwg.showModal();
    sel.focus();
  }
  async function exportDwg(version = 'AC1015') {
    const ext = extentsAll();
    if (!ext) { say(t('cv.export.none')); return; }
    const scale = fitScale(ctx.units(), ext, paperBy(ctx.units() === 'm' ? 'a3' : 'tabloid'));
    const sc = buildScene(scale.mmPerUnit);
    let writeDwg;
    try { ({ writeDwg } = await import('./dwg-write.js')); } catch { say(t('cv.dwg.noload')); return; }
    // 0.4 V8: with map layers, a .zip: the drawing + the picture (PNG + world file) its IMAGE points at
    let pic = null;
    if (visibleMaps() && ui.dwg.querySelector('[data-dwg-map]').checked) { busy(t('map.out.busy')); pic = await mapPicture(ext, 4096, 'image/png').finally(() => busy(null)); }
    const picName = fileStem() + '-map.png';
    const { bytes, report } = writeDwg({ units: ctx.units(), layers: LAYERS.map((l) => ({ name: l.name, color: l.aci })), entities: toDxfEntities(sc, scale.mmPerUnit), version,
      images: pic ? [{ fileName: picName, pxW: pic.pxW, pxH: pic.pxH, box: pic.box, layer: 'G-MAP-IMAG' }] : [] });
    if (pic) {
      const { zip } = await import('./zipfile.js');
      const px = (pic.box.maxX - pic.box.minX) / pic.pxW, py = (pic.box.maxY - pic.box.minY) / pic.pxH;
      const world = [px, 0, 0, -py, pic.box.minX + px / 2, pic.box.maxY - py / 2].join('\n') + '\n';   // a world file: pixel centres
      download(await zip([{ name: fileStem() + '.dwg', data: bytes }, { name: picName, data: pic.bytes }, { name: fileStem() + '-map.pgw', data: world }]), fileStem() + '-dwg.zip', 'application/zip');
    } else download(bytes, fileStem() + '.dwg', 'application/acad');
    const c = report.counts;
    const parts = [[c.lwpolyline, 'cv.dwg.n.poly'], [c.polyline3d, 'cv.dwg.n.poly3d'], [c.arc, 'cv.dwg.n.arc'], [c.text, 'cv.dwg.n.label'], [c.point, 'cv.pts.n']]
      .filter(([n]) => n).map(([n, key]) => t(key, { n, count: num(n) }));
    say(t('cv.dwg.done', { year: DWG_YEAR[version], list: parts.join(', '), n: report.layers.length, scale: scale.label }) + (report.notes.length ? ' ' + report.notes.join(' ') : '') + ' ' + t('cv.bands.no') + (pic ? ' ' + t('map.out.dwg.done', { png: picName }) + (pic.complete ? '' : ' ' + t('map.out.partial')) : ''));
  }

  // ------------------------------------------------------------------ map layers in the PDF and the DWG (0.4 V8)
  const visibleMaps = () => (ctx.project.state.gis?.maps || []).some((m) => m.visible);
  /** The visible map layers over `box` as a picture of at most maxPx (null when none draws); waits for pictures still
   *  loading (up to 8 s). type 'image/jpeg' (PDF) or 'image/png' (DWG). */
  async function mapPicture(box, maxPx, type) {
    if (!visibleMaps()) return null;
    try { await gisLoad(); } catch { return null; }
    const r = await ctx.gisReg.drape?.renderSettled(box, maxPx, { canvas: document.createElement('canvas') });
    if (!r) return null;
    const blob = await new Promise((ok) => r.canvas.toBlob(ok, type, 0.88));
    if (!blob) return null;
    return { bytes: new Uint8Array(await blob.arrayBuffer()), pxW: r.canvas.width, pxH: r.canvas.height, box, complete: r.complete !== false, attribution: r.attribution };
  }

  // ------------------------------------------------------------------ plot
  /**
   * The plan as a PDF sheet: what the Plot dialog's button does, with the choices given (paper key, scale label, the area in ground units, ink, the map under it).
   * Also the export set's entry (exportSet, below), which has no dialog: an unknown paper is the units' own, an unknown scale the largest that fits.
   */
  async function plotNow({ paper, scale, area = extentsAll(), mono = false, map = false, titleBlock: tb = null } = {}) {   // tb: the project's title block for the sheet's own title strip (SC.7)
    if (!area) { say(t('cv.plot.none')); return null; }
    const pk = PAPERS.some((p) => p.key === paper) ? paper : ctx.units() === 'm' ? 'a3' : 'tabloid';
    const s = scalesFor(ctx.units()).find((x) => x.label === scale) || fitScale(ctx.units(), area, paperBy(pk));
    const sc = buildScene(s.mmPerUnit);
    const d = ctx.project.state.display;
    const notes = [];
    if (d.contours && ctx.shown().s) notes.push(t(ctx.shown().tag === 'fg' ? 'cv.plot.contours.fg' : 'cv.plot.contours.eg', { i: d.interval, u: ctx.u().short }));
    // 0.4 V8: the map layers under the linework, as a picture of the sheet's drawing window (150 dpi, ≤ 4096 px)
    const images = [], extra = [];
    if (visibleMaps() && map) {
      const win = sheetWindow(area, { paper: pk, scale: s }), mmW = (win.maxX - win.minX) * s.mmPerUnit, mmH = (win.maxY - win.minY) * s.mmPerUnit;
      busy(t('map.out.busy'));
      const pic = await mapPicture(win, Math.min(4096, Math.round((Math.max(mmW, mmH) / 25.4) * 150)), 'image/jpeg').finally(() => busy(null));
      if (pic) { images.push({ jpeg: pic.bytes, pxW: pic.pxW, pxH: pic.pxH, box: win }); if (pic.attribution) notes.push(pic.attribution); if (!pic.complete) extra.push(t('map.out.partial')); }
    }
    if (tb) for (const [k, v] of [['client', tb.client], ['drawn_by', tb.drawnBy], ['revision', tb.revision]]) if (v) notes.push(`${tb.labels?.[k] || ''}: ${v}`);
    const title = tb ? (tb.use ? tb.project || ctx.project.state.name : ctx.project.state.name || tb.project) : ctx.project.state.name;   // with `use` the project's name; else it only fills an empty one
    const sheet = planSheet(sc, { extents: area, paper: pk, scale: s, title, units: ctx.units(), notes, images });
    const { bytes, report } = await toPdf(sheet, { mono });
    download(bytes, fileStem() + '.pdf', 'application/pdf');
    say(t('cv.plot.done', { file: fileStem() + '.pdf', scale: s.label }) + (report.missing ? ' ' + t('pp.ui.missing', { n: report.missing }) : '') + (images.length ? ' ' + t('map.out.pdf.done') : '') + (extra.length ? ' ' + extra.join(' ') : ''));
    return { paper: pk, scale: s.label };
  }

  function plotDialog() {
    const ext = extentsAll();
    if (!ext) { say(t('cv.plot.none')); return; }
    const dlg = ui.plot, $d = (s) => dlg.querySelector(s);
    const paperSel = $d('[data-plot-paper]'), scaleSel = $d('[data-plot-scale]'), areaSel = $d('[data-plot-area]');
    paperSel.replaceChildren(...PAPERS.map((p) => el('option', { value: p.key }, p.name)));
    if (!paperSel.dataset.set) { paperSel.value = ctx.units() === 'm' ? 'a3' : 'tabloid'; paperSel.dataset.set = '1'; }
    const area = () => (areaSel.value === 'view' ? view.viewBounds() : ext);
    const fill = () => {
      const fit = fitScale(ctx.units(), area(), paperBy(paperSel.value));
      scaleSel.replaceChildren(...scalesFor(ctx.units()).map((s) => el('option', { value: s.label }, s.label === fit.label ? t('cv.plot.fits', { scale: s.label }) : s.label)));
      scaleSel.value = fit.label;
      info();
    };
    const info = () => {
      const s = scalesFor(ctx.units()).find((x) => x.label === scaleSel.value), b = area();
      const P = paperBy(paperSel.value);
      const wmm = (b.maxX - b.minX) * s.mmPerUnit, hmm = (b.maxY - b.minY) * s.mmPerUnit;
      $d('[data-plot-info]').textContent = t('cv.plot.info', { w: fixed(wmm, 0), h: fixed(hmm, 0), scale: s.label, pw: fixed(Math.max(P.w, P.h), 0), ph: fixed(Math.min(P.w, P.h), 0) });
    };
    paperSel.onchange = fill; areaSel.onchange = fill; scaleSel.onchange = info;
    $d('[data-plot-map-row]').hidden = !visibleMaps();   // 0.4 V8
    fill();
    $d('[data-plot-go]').onclick = async () => {
      await plotNow({ paper: paperSel.value, scale: scaleSel.value, area: area(), mono: $d('[data-plot-ink]').value === 'mono', map: $d('[data-plot-map]').checked });
      dlg.close('ok');
    };
    for (const b of dlg.querySelectorAll('[data-close]')) b.onclick = () => dlg.close('cancel');
    dlg.onclose = () => refocus();
    dlg.showModal();
    $d('[data-plot-go]').focus();
  }

  return { openFile, openText, openProject, download, fileStem, saveProject, exportLandXml, extentsAll, fitAll, exportDxf, DWG_YEAR, dwgDialog, exportDwg, visibleMaps, plotNow, plotDialog };
}
