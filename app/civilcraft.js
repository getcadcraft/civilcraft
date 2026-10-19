/* SPDX-License-Identifier: Apache-2.0 */
/**
 * civilcraft.js — the CivilCraft page: wires ui.inc to the project (project.js), the plan view
 * (view.js) and the profile view (profile-view.js).
 *
 * Plan: wheel zooms at the cursor; drag (left on empty space, middle or right anywhere) pans.
 * Tools: Select (V/Esc) picks alignments, pads, structures, pipes and points and drags PIs, pad corners and
 * structures; Alignment (A), Pad (G) and Pipes (P: structures from upstream down) draw by clicks, Enter or double-click finishes, Backspace drops the last point; Breakline
 * (B) clicks survey points; Boundary (O) clicks corners. Profile (R) shows the profile view: with
 * Add PVIs (I) on a click adds a PVI; PVIs drag; Delete removes the selected one.
 * Keys: Ctrl+Z/Y undo/redo, Ctrl+S save, Ctrl+O open, Ctrl+P plot, F fit, arrows pan, +/− zoom.
 * 3D (D, View group): site-view3d.js is imported on first use (three.js with it) and draws over the plan; a click on a
 * pipe, structure or survey point there selects it here (pick3D).
 * Corner indicator (viewcube.js, ModelCraft's copy): the plan shows the view cube at Top; a click on any other side (or a
 * drag) opens 3D looking from there. Settings › CivilCraft: corner cube|axes|none, exag 1|2|3|5|10 (the 3D bar's list follows).
 * Survey points: click selects one, Shift+click adds or removes one, Shift+drag a box adds the points in it, Ctrl+A
 * selects every point, Esc none. Edit (toolbar group + its More menu): Ctrl+C copy, Ctrl+X cut, Ctrl+V paste (the
 * points follow the pointer; click where they go, Enter puts them at their own coordinates), Ctrl+Shift+V paste in
 * place, Ctrl+D duplicate (place a copy), Delete. Copy also puts the points on the system clipboard as point rows
 * (Settings › CivilCraft: P,N,E,Z,D or P,E,N,Z,D) and Paste reads point rows from it when they are newer than
 * CivilCraft's own copy (clip.js choosePaste). Pasted points never take a number in use (clip.js renumber). The
 * copy is kept in memory and in localStorage "civilcraft.clipboard" (another tab can paste it); point edits are undo
 * steps (project.editPoints) and the surface rebuilds from the new points.
 * Settings › CivilCraft (settings.inc; localStorage "civilcraft.settings"): point row order, numbers for pasted
 * points, what point labels show.
 *
 * GIS (docs/GIS-SPEC.md): coordinate system, GIS files, terrain data, map layers. gis-ui.js and the modules it installs
 * load on first use — a GIS command, a GIS file opened or dropped, or a project that has a coordinate system or GIS layers —
 * and plug in through `gisReg` (scene layers, map underlay, status readouts, commands, file openers, extents). This file
 * knows nothing about any GIS format.
 *
 * Files open on this computer and save as downloads; nothing is uploaded. File contents reach the
 * page only as text nodes (el() in ui-util.js). `window.civilcraft` exposes the state for tests.
 */

import { Project } from './project.js';
import { parsePoints, lassoPoints } from './points.js';
import { lassoMode, nextMode, thin } from './lasso-core.js';
import { civilTools } from './civil-agent.js';
import { readLandXml, writeLandXml } from './landxml.js';
import { planScene, toDxfEntities, LAYERS } from './scene.js';
import { writeDxf } from './dxf.js';
import { PAPERS, paperBy, scalesFor, fitScale, planSheet, toPdf, sheetWindow } from './plot.js';
import { PlanView, mix, LABEL_FONT } from './view.js';
import { ProfileView } from './profile-view.js';
import { unitOf, formatStation, parseStation, fixed, pct, volumeText, areaText, dms, bearing, isNum, readLength, grouped } from './units.js';
import { buildProfile } from './profile.js';
import { polyArea, pointInPoly } from './tin.js';
import { normAng } from './alignment.js';
import { curveWhy, verticalWhy } from './solve-why.js';   // 0.5 WL.23
import { el, fillDl, num } from './ui-util.js';
import { mountViewCube, mountAxisIcon } from './viewcube.js';
import { defaultNetwork, defaultPipeDia, defaultStructDia, autoInverts, DIA_UNIT } from './pipes.js';
import { defaultAssembly } from './corridor.js';
import { makeClip, readClip, choosePaste, renumber, renumberText, moveBy, centre } from './clip.js';
import { t, has } from './i18n.js';
import { editPoint, movePoint } from './point-edit.js';   // 0.4 V2
import { createSections } from './sections-ui.js';   // 0.4 V13
import { createFeatures } from './features-ui.js';   // 0.4 V14
import { featureProfile, bulgeThrough, flatten as flattenFl, cleanFeature } from './featureline.js';   // 0.5 WL.20, 0.6 WL.24
import { createSheetsDialog } from './pp-ui.js';   // 0.4 V15
import { createCodes } from './codes-ui.js';   // 0.4 V16
import { superProps } from './super-ui.js';   // 0.4 V18
import { targetProps } from './targets-ui.js';   // 0.6 WL.25
import { cleanType } from './structs.js';   // 0.6 WL.27
import { createStructs } from './structs-ui.js';   // 0.6 WL.27
import { createSwept } from './swept-ui.js';   // 0.6 WL.28
import { createDrainage } from './drainage-ui.js';   // 0.4 V19/V20
import { createParcels } from './parcels-ui.js';   // 0.4 V21
import { createTraverse } from './traverse-ui.js';   // 0.4 V22
import { createStaking } from './staking-ui.js';   // 0.4 V23
import { getHost } from "./host.js";   // W2.19: files through the host adapter (browser or desktop)
import { Autosave } from "./app-autosave.js";   // 0.4 1.2
import { panButton, wheelFactor } from './input-mouse.js';   // 0.5 IP.3: the menu style's wheel and pan buttons (input-civilcraft.js)
import { earthworkFile, QTY_EXT } from './qtyout.js';   // 0.6 TK.5+: cut and fill for TakeoffCraft
import { createSewer } from './sewer-ui.js';   // 0.6 LC.16 S1: sanitary design flows

const root = document.querySelector('[data-civilcraft]');
if (root) init(root);
// Touch screens (0.4 S.8): the first touch marks the app, so CSS gives bigger targets and the draft bar shows
if (root) root.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') root.classList.add('is-touch'); }, { capture: true, passive: true });

function init(root) {
  const $ = (s) => root.querySelector(s);
  const ui = {
    base: $('[data-base]'), over: $('[data-over]'), plan: $('[data-plan]'), hint: $('[data-hint]'), drop: $('[data-drop]'), busy: $('[data-busy]'), busyText: $('[data-busy-text]'),
    toolhint: $('[data-toolhint]'), file: $('[data-file]'), name: $('[data-name]'), units: $('[data-units]'),
    pointsEmpty: $('[data-points-empty]'), pointsInfo: $('[data-points-info]'), groups: $('[data-groups]'),
    surfaceH: $('[data-surface-h]'), surfaceInfo: $('[data-surface-info]'), surfaceReport: $('[data-surface-report]'), maxEdge: $('[data-maxedge]'), surfaceActions: $('[data-surface-actions]'),
    showSurface: $('[data-show-surface]'), interval: $('[data-interval]'), major: $('[data-major]'), bandCount: $('[data-bandcount]'), checks: $('[data-checks]'), legend: $('[data-legend]'),
    props: $('[data-props]'), propsH: $('[data-props-h]'),
    coords: $('[data-coords]'), elev: $('[data-elev]'), staoff: $('[data-staoff]'), status: $('[data-status]'),
    profPanel: $('[data-profile-panel]'), prof: $('[data-prof]'), profAl: $('[data-prof-al]'), pviAdd: $('[data-pvi-add]'), profFl: $('[data-prof-fl]'), profWithin: $('[data-prof-fl-within]'), profRead: $('[data-prof-read]'), profClose: $('[data-prof-close]'),
    imp: $('[data-import]'), plot: $('[data-plot]'), dwg: $('[data-dwg]'),
    gisLayers: $('[data-gis-layers]'),   // GIS: the GIS layers section (gis-vector-ui.js fills it)
  };
  const unitLabels = [...root.querySelectorAll('[data-unit]')];   // kept: a panel moved to the panels window leaves root

  let project = new Project();
  let tool = 'select', draft = [], sel = null, selPvi = -1, cursor = null, snapPt = null, hoverPt = null, profCursor = null;
  let drag = null, pvDrag = null, lastReport = null;
  let picked = new Set();         // selected survey points, by point number
  let pasteJob = null;            // { pts, anchor, label, from, note } while the Paste tool carries points
  let clip = null;                // this tab's copy (readClip shape)
  const DEFAULT_R = { ft: 100, m: 30 };

  const view = new PlanView(ui.base, ui.over, { scene: (mm) => buildScene(mm), bands: () => bands(), underlay: (ctx, v) => { for (const f of gisReg.underlay) f(ctx, v); } });
  view.drawOverlay = drawOverlay;
  const pview = new ProfileView(ui.prof);
  // 0.4 V13: sample lines and the section view (sections-ui.js); `row` and friends are defined further down, so wrapped
  const secUi = createSections({ root, el, project: () => project, units: () => units(), say: (m) => say(m), download: (...x) => download(...x), fileStem: () => fileStem(),
    numInput: (...x) => numInput(...x), row: (...x) => row(...x), layout: () => { updateTools(); view.resize(); }, redraw: () => view.invalidate(),
    focusAlignment: (id) => { sel = { kind: 'alignment', id }; selPvi = -1; refresh(); }, otherPanel: (on) => { if (!on && !ui.profPanel.hidden) { ui.profPanel.hidden = true; } } });
  // 0.4 V14: feature lines (features-ui.js)
  const flUi = createFeatures({ el, project: () => project, units: () => units(), say: (m) => say(m), numInput: (...x) => numInput(...x), row: (...x) => row(...x),
    select: (x) => { sel = x; selPvi = -1; picked.clear(); refresh(); }, command: (c) => command(c), eg: () => eg().surface });
  const drUi = createDrainage({ el, project: () => project, units: () => units(), numInput: (...x) => numInput(...x), row: (...x) => row(...x), say: (m) => say(m),   // 0.4 V19/V20
    select: (x) => { picked.clear(); sel = x; selPvi = -1; refresh(); }, refresh: () => refresh(), tool: (x) => { if (tool !== x) setTool(x); } });
  const seUi = createSewer({ el, project: () => project, units: () => units(), numInput: (...x) => numInput(...x), row: (...x) => row(...x), say: (m) => say(m),   // 0.6 LC.16 S1
    select: (x) => { picked.clear(); sel = x; selPvi = -1; refresh(); }, refresh: () => refresh() });
  const pcUi = createParcels({ root, el, project: () => project, units: () => units(), numInput: (...x) => numInput(...x), row: (...x) => row(...x), say: (m) => say(m),   // 0.4 V21
    select: (x) => { picked.clear(); sel = x; selPvi = -1; refresh(); }, tool: (x) => { if (tool !== x) setTool(x); }, refocus: () => refocus(),
    download: (name, blob) => download(blob, name), fileStem: () => fileStem() });
  const tvUi = createTraverse({ root, el, project: () => project, units: () => units(), say: (m) => say(m), refocus: () => refocus(),   // 0.4 V22
    download: (name, blob) => download(blob, name), fileStem: () => fileStem(), addParcel: (...x) => pcUi.addParcel(...x),
    afterPoints: (ns) => { picked = new Set(ns); sel = null; selPvi = -1; refresh(); } });
  const skUi = createStaking({ root, el, project: () => project, units: () => units(), say: (m) => say(m), refocus: () => refocus(),   // 0.4 V23
    download: (name, blob) => download(blob, name), fileStem: () => fileStem() });
  const stUi = createStructs({ root, el, project: () => project, units: () => units(), say: (m) => say(m), refocus: () => refocus(),   // 0.6 WL.27
    download: (...x) => download(...x), select: (x) => { sel = x; selPvi = -1; picked.clear(); refresh(); } });
  const swUi = createSwept({ root, el, project: () => project, units: () => units(), say: (m) => say(m), refocus: () => refocus(),   // 0.6 WL.28
    select: (x) => { sel = x; selPvi = -1; picked.clear(); refresh(); }, command: (c) => command(c), redraw: () => view.invalidate() });
  let draftClosed = false;   // 0.4 V14: the Feature line tool closed its line on the first vertex
  // 0.6 WL.24: arcs in the Feature line tool — C (or the touch bar's Arc) turns arc mode on/off; in it, after a vertex the
  // next click is a point on the curve (flMid), the click after that ends the arc (the earlier vertex gets its bulge)
  let flArc = false, flMid = null;
  function toggleFlArc() {
    if (tool !== 'feature') return;
    flArc = !flArc; flMid = null;
    say(t(flArc ? 'fl.arc.on' : 'fl.arc.off'));
    root.querySelector('[data-draft-act="arc"]')?.setAttribute('aria-pressed', String(flArc));
    view.invalidate();
  }
  // 0.4 V15: plan and profile sheets (pp-ui.js)
  const codesUi = createCodes({ root, el, project: () => project, say: (m) => say(m), refocus: () => refocus() });   // 0.4 V16
  root.querySelector('[data-codes-open]')?.addEventListener('click', () => codesUi.open());
  const ppUi = createSheetsDialog({ root, el, project: () => project, units: () => units(), buildScene: (mm) => buildScene(mm), download: (...x) => download(...x), fileStem: () => fileStem(), say: (m) => say(m), refocus: () => refocus() });
  window.civilcraft = {
    get project() { return project; }, view, pview, structs: stUi, swept: swUi, setTool, command, openText, select: (s) => { sel = s; selPvi = -1; refresh(); },
    get tool() { return tool; }, get sel() { return sel; }, get selPvi() { return selPvi; }, get picked() { return [...picked]; },
    pick: (nums) => { picked = new Set(nums.map(String)); sel = null; selPvi = -1; refresh(); }, clip: () => clip || storedClip(), get settings() { return settings; }, toScreen: (x, y) => { const r = ui.over.getBoundingClientRect(), s = view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; },
    profToScreen: (sta, z) => { const r = ui.prof.getBoundingClientRect(), s = pview.toScreen(sta, z); return { x: r.left + s.x, y: r.top + s.y }; },
    get view3d() { return view3d; }, show3D: (on) => show3D(on), get planCube() { return planCube; },
    get gis() { return gisHost; }, gisLoad: () => gisLoad(),
    get sections() { return secUi; },   // 0.4 V13
    get sheets() { return ppUi; },   // 0.4 V15
    say: (m) => say(m),   // Studio Live (0.5 LV.22, live.js): its messages
  };
  // the menu styles (0.5 IP.3, input-civilcraft.js + the shell's app-input-ui.js): their messages go to the status line;
  // letters stay CivilCraft's while a line is being drawn (draft points: Backspace, Enter)
  window.ccInputHooks = { status: (m) => say(m || ''), busy: () => draft.length > 0 || tool === 'paste' };

  // ------------------------------------------------------------------ GIS registry (docs/GIS-SPEC.md §0)
  // scene: (scene, mmPerUnit) => void adds layers/items · underlay: (ctx, view) => void paints maps in CSS px ·
  // status: (cursor | null) => void · commands: Map cmd → async () · openers: [{ accepts(files, heads) → bool, open(files) }]
  // extents: [() => bounds | null] · onProject: [(project) => void] after New/Open · hasWork: [() => bool] (unsaved prompts)
  // crsChange: [(before, after) => void] after the project's coordinate system changes (the GIS parts call these)
  // pickCrs: null | async ({ reason, near }) => crs | null — the coordinate system picker, for the other parts to ask with
  const gisReg = { scene: [], underlay: [], status: [], commands: new Map(), openers: [], extents: [], onProject: [], hasWork: [], crsChange: [], pickCrs: null,
    // GIS (builder A): pick: [(w, tolerance) => {kind:'gis', …} | null] (after CivilCraft's own objects and points) ·
    // props: [(sel, box, head) => bool] (Properties for a GIS selection) · overlay: [(ctx, view, sel) => void] ·
    // exportExtra: [(container, host) => void] (sections in GIS › Export) · pointsLatLon / landxmlCrs (gis-vector-ui.js)
    pick: [], props: [], overlay: [], exportExtra: [], pointsLatLon: null, landxmlCrs: null };
  const GIS_CMDS = new Set(['crs', 'gis-import', 'gis-export', 'basemap', 'cad-open']);   // cad-open: 0.4 V1 (gis-cad-ui.js)
  const GIS_EXT = /\.(shp|shx|dbf|prj|cpg|zip|geojson|gpkg|kml|kmz|tif|tiff|asc|las|laz|jgw|pgw|tfw|wld|pngw|jpgw|png|jpe?g|dwg|dxf)$/i;   // 0.4 V1: dwg|dxf → gis-cad-ui.js   // GIS: pictures + world files (map layers)
  let gisReady = null;
  function gisLoad() {
    return (gisReady ||= import('./gis-ui.js').then((m) => m.install(gisHost)).catch((err) => { gisReady = null; say(t('cv.gis.noload', { why: err.message })); throw err; }));
  }
  const gisHost = {
    reg: gisReg, root, ui, view, el, say, busy, ask, download, refresh: () => refresh(), refocus: () => refocus(),
    get project() { return project; }, get settings() { return settings; }, get cursor() { return cursor; },
    fileStem: () => fileStem(), fitAll: () => fitAll(), extentsAll: () => extentsAll(), confirmDiscard: () => confirmDiscard(),
    /** Replace the open project (a GIS or terrain file opened as a new project). Asks nothing: call confirmDiscard first. */
    setProject(p) { project = p; rebind(); sel = null; selPvi = -1; lastReport = null; refresh(); fitAll(); },
    /** Notes to show in the project summary, like a file's import report. */
    report(notes) { lastReport = notes?.length ? notes : null; renderProps(); },
    // GIS: open files as Open/drop does (the openers); the selection ({kind:'gis', layer, i} for a GIS feature)
    open: (files) => gisOpen(files), select: (s) => { sel = s; selPvi = -1; picked.clear(); refresh(); }, get sel() { return sel; },
  };
  /** A GIS file (or a set: .shp + .dbf + .prj …) opened or dropped. true when a GIS opener took it. */
  async function gisOpen(files) {
    const heads = await Promise.all(files.map((f) => (/\.(geojson|json)$/i.test(f.name) ? f.slice(0, 4096).text().catch(() => '') : Promise.resolve(''))));
    const geojson = heads.some((h) => /"type"\s*:\s*"(FeatureCollection|Feature)"/.test(h));
    if (!files.some((f) => GIS_EXT.test(f.name)) && !geojson) return false;
    try { await gisLoad(); } catch { return true; }
    // GIS: accepts() may return a Promise (builder B reads a TIFF's band count to tell an elevation grid from a picture)
    let o = null;
    for (const x of gisReg.openers) { let yes = false; try { yes = await x.accepts(files, heads); } catch { yes = false; } if (yes) { o = x; break; } }
    if (!o) { say(t('cv.open.cannot', { files: files.map((f) => f.name).join(', ') })); return true; }
    await o.open(files);
    return true;
  }

  // ------------------------------------------------------------------ settings (Settings › CivilCraft; per viewer)
  // GIS: latlon dms|dd (the status bar's latitude/longitude), internet false|true (map layers from the internet; off by default)
  const SET_DEFAULTS = { order: 'PNEZD', renumber: 'clash', start: null, labels: 'nzd', corner: 'cube', exag: 2, latlon: 'dms', internet: false };
  const readSettings = () => {
    const out = { ...SET_DEFAULTS, assistants: { enabled: false, groups: ['read'] } };
    try {
      const v = JSON.parse(localStorage.getItem('civilcraft.settings') || '{}');
      if (v.order === 'PNEZD' || v.order === 'PENZD') out.order = v.order;
      if (v.renumber === 'clash' || v.renumber === 'always') out.renumber = v.renumber;
      if (Number.isInteger(v.start) && v.start > 0 && v.start < 1e9) out.start = v.start;
      if (['n', 'nz', 'nzd'].includes(v.labels)) out.labels = v.labels;
      if (['cube', 'axes', 'none'].includes(v.corner)) out.corner = v.corner;
      if ([1, 2, 3, 5, 10].includes(v.exag)) out.exag = v.exag;
      if (v.latlon === 'dms' || v.latlon === 'dd') out.latlon = v.latlon;   // GIS
      if (v.internet === true) out.internet = true;   // GIS: only an explicit true turns map servers on
      // 0.4 X.12: assistants (AGENTS-SPEC §7): off unless the person turned them on; groups read and edit
      if (v.assistants && typeof v.assistants === 'object') out.assistants = { enabled: v.assistants.enabled === true, groups: (Array.isArray(v.assistants.groups) ? v.assistants.groups : []).filter((g) => g === 'read' || g === 'edit') };
    } catch { /* private window or junk: defaults */ }
    return out;
  };
  const settings = readSettings();
  /** Settings saved by another tab of CivilCraft count here too. */
  function reloadSettings() {
    const was = settings.labels;
    Object.assign(settings, readSettings());
    if (settings.labels !== was) view.invalidateScene();
    applyCorner(); view3d?.setExag(settings.exag);
    if (typeof applyAssist === 'function') applyAssist();
  }
  const persistSettings = () => { try { localStorage.setItem('civilcraft.settings', JSON.stringify(settings)); } catch { /* storage blocked: this visit only */ } };
  const settingsDlg = document.querySelector('[data-app-settings]');
  function syncSettings() {
    if (!settingsDlg) return;
    for (const r of settingsDlg.querySelectorAll('input[name="cvOrder"]')) r.checked = r.value === settings.order;
    for (const r of settingsDlg.querySelectorAll('input[name="cvRenumber"]')) r.checked = r.value === settings.renumber;
    for (const r of settingsDlg.querySelectorAll('input[name="cvLabels"]')) r.checked = r.value === settings.labels;
    for (const r of settingsDlg.querySelectorAll('input[name="cvCorner"]')) r.checked = r.value === settings.corner;
    for (const r of settingsDlg.querySelectorAll('input[name="cvExag"]')) r.checked = Number(r.value) === settings.exag;
    for (const r of settingsDlg.querySelectorAll('input[name="cvLatlon"]')) r.checked = r.value === settings.latlon;   // GIS
    for (const r of settingsDlg.querySelectorAll('input[name="cvInternet"]')) r.checked = r.value === (settings.internet ? 'on' : 'off');   // GIS
    const st = settingsDlg.querySelector('input[name="cvStart"]');
    if (st) { st.value = settings.start ? String(settings.start) : ''; st.removeAttribute('aria-invalid'); }
    const as = settings.assistants, box = (n) => settingsDlg.querySelector('input[name="' + n + '"]');
    if (box('cvAssist')) box('cvAssist').checked = as.enabled;
    for (const [n, g] of [['cvAssistRead', 'read'], ['cvAssistEdit', 'edit']]) if (box(n)) { box(n).checked = as.groups.includes(g); box(n).disabled = !as.enabled; }
  }
  if (settingsDlg) {
    settingsDlg.addEventListener('change', (e) => {
      const t = e.target;
      if (t.name === 'cvOrder') settings.order = t.value === 'PENZD' ? 'PENZD' : 'PNEZD';
      else if (t.name === 'cvRenumber') settings.renumber = t.value === 'always' ? 'always' : 'clash';
      else if (t.name === 'cvLabels') { settings.labels = ['n', 'nz', 'nzd'].includes(t.value) ? t.value : 'nzd'; view.invalidateScene(); }
      else if (t.name === 'cvCorner') { settings.corner = ['cube', 'axes', 'none'].includes(t.value) ? t.value : 'cube'; applyCorner(); }
      else if (t.name === 'cvExag') { const x = Number(t.value); settings.exag = [1, 2, 3, 5, 10].includes(x) ? x : 2; view3d?.setExag(settings.exag); }
      else if (t.name === 'cvLatlon') settings.latlon = t.value === 'dd' ? 'dd' : 'dms';   // GIS (gis-crs-ui.js listens too)
      else if (t.name === 'cvInternet') settings.internet = t.value === 'on';   // GIS (gis-map-ui.js listens too)
      else if (t.name === 'cvAssist' || t.name === 'cvAssistRead' || t.name === 'cvAssistEdit') {   // 0.4 X.12
        const as = settings.assistants, on = (n) => settingsDlg.querySelector('input[name="' + n + '"]')?.checked;
        if (t.name === 'cvAssist') { as.enabled = t.checked; if (t.checked && !as.groups.length) as.groups = ['read']; }
        else as.groups = [on('cvAssistRead') && 'read', on('cvAssistEdit') && 'edit'].filter(Boolean);
        syncSettings();
        applyAssist();
      }
      else if (t.name === 'cvStart') {
        const v = t.value.trim(), n = Number(v);
        if (v === '') settings.start = null;
        else if (Number.isInteger(n) && n > 0 && n < 1e9) settings.start = n;
        else { t.setAttribute('aria-invalid', 'true'); return; }
        t.removeAttribute('aria-invalid');
      } else return;
      persistSettings();
    });
    settingsDlg.addEventListener('cc-settings-reset', () => { Object.assign(settings, SET_DEFAULTS, { assistants: { enabled: false, groups: ['read'] } }); persistSettings(); syncSettings(); view.invalidateScene(); applyCorner(); view3d?.setExag(settings.exag); applyAssist(); });
    // the shared dialog has no open event: sync our fields whenever it opens (another tab may have changed them)
    new MutationObserver(() => { if (settingsDlg.open) { reloadSettings(); syncSettings(); } }).observe(settingsDlg, { attributes: true, attributeFilter: ['open'] });
    syncSettings();
  }
  window.addEventListener('storage', (e) => { if (e.key === 'civilcraft.settings') reloadSettings(); });

  // ------------------------------------------------------------------ derived for display
  const units = () => project.state.units;
  const u = () => unitOf(units());
  const eg = () => project.eg();
  const graded = () => project.graded();
  const shown = () => (project.state.display.surface === 'fg' && graded().surface ? { s: graded().surface, tag: 'fg' } : { s: eg().surface, tag: 'eg' });
  const findAl = (id) => project.state.alignments.find((a) => a.id === id);
  const findPad = (id) => project.state.pads.find((p) => p.id === id);
  const selAl = () => (sel?.kind === 'alignment' ? findAl(sel.id) : null);
  const selPad = () => (sel?.kind === 'pad' ? findPad(sel.id) : null);
  const net = () => project.state.network;
  const findStruct = (id) => net()?.structures.find((x) => x.id === id);
  const findPipe = (id) => net()?.pipes.find((x) => x.id === id);
  const selStruct = () => (sel?.kind === 'structure' ? findStruct(sel.id) : null);
  const selPipe = () => (sel?.kind === 'pipe' ? findPipe(sel.id) : null);
  const diaU = () => DIA_UNIT[units() === 'm' ? 'm' : 'ft'];

  function buildScene(mm) {
    const s = project.state, d = s.display, sh = shown();
    const gr = graded();
    const padsOut = s.pads.map((p) => { const g = gr.items?.find((x) => x.id === p.id); return { name: p.name, pts: p.pts, z: Number(p.z), daylight: g?.daylight || [], rays: g?.rays || [] }; });
    const breaklines = sh.tag === 'eg' ? project.egBreaklines() : [];
    const bnd = s.surface.boundary;
    const scene = planScene({
      units: s.units, points: project.points, surface: sh.s,
      contours: { interval: Number(d.interval), major: Number(d.major), list: sh.s ? project.contours(sh.s, sh.tag) : [] },
      breaklines: bnd ? [...breaklines, { name: 'boundary', pts: [...bnd, bnd[0]] }] : breaklines,
      alignments: s.alignments.map((a) => ({ name: a.name, alignment: project.alignment(a), pis: a.pis })),
      pads: padsOut,
      corridors: (gr.items || []).filter((x) => x.kind === 'corridor').map((x) => ({ lines: x.lines, sections: x.sections })),
      network: s.network ? { net: s.network, check: project.networkCheck() } : null,
    }, { mmPerUnit: mm, show: { ...d, pointLabelText: settings.labels } });
    if (d.alignments !== false) scene.items.push(...secUi.sceneItems(s.alignments));   // 0.4 V13 sample lines
    scene.items.push(...flUi.sceneItems());   // 0.4 V14 feature lines
    scene.items.push(...swUi.sceneItems(1 / mm));   // 0.6 WL.28 swept paths
    scene.items.push(...pcUi.sceneItems(mm));   // 0.4 V21 parcels, their courses and areas
    if (d.points) scene.items.push(...codesUi.sceneItems());   // 0.4 V16 lines from line codes (groups that are not breaklines)
    for (const it of gr.items || []) {   // 0.4 V14: a daylighted feature line's slopes, as a pad's
      if (it.kind !== 'feature' || !it.daylight?.length) continue;
      scene.items.push({ layer: 'C-GRAD-DAYL', kind: 'poly', pts: it.daylight, closed: true, z: true });
      for (const r of it.rays || []) if (r.d > 1e-6) scene.items.push({ layer: 'C-GRAD-SLOP', kind: 'poly', pts: [{ x: r.x0, y: r.y0 }, { x: r.x, y: r.y }] });
    }
    for (const f of gisReg.scene) f(scene, mm);
    return scene;
  }

  let bandCache = null;
  function bands() {
    const d = project.state.display, sh = shown();
    if (!d.bands || !sh.s) { ui.legend.hidden = true; return null; }
    const key = project.version + '|' + sh.tag + '|' + d.bandCount + '|' + view.dark;
    if (bandCache?.key === key) return bandCache.list;
    const st = sh.s.stats(), n = Number(d.bandCount) || 8;
    const levels = []; for (let i = 1; i < n; i++) levels.push(st.minZ + ((st.maxZ - st.minZ) * i) / n);
    const colors = []; for (let i = 0; i < n; i++) colors.push(bandColor(i / Math.max(1, n - 1), view.dark));
    const list = sh.s.bands(levels).map((b) => ({ color: colors[b.band + 1], loop: b.loop }));
    bandCache = { key, list };
    // legend
    ui.legend.replaceChildren(...colors.map((c, i) => el('div', {}, el('span', { className: 'cv-swatch', style: 'background:' + c }),
      fixed(i ? levels[i - 1] : st.minZ, 2) + ' – ' + fixed(i < n - 1 ? levels[i] : st.maxZ, 2))).reverse());
    ui.legend.hidden = false;
    return list;
  }

  // ------------------------------------------------------------------ refresh
  function refresh(kind) {
    if (picked.size && kind !== 'display') { const have = new Set(project.points.map((p) => p.n)); for (const n of picked) if (!have.has(n)) picked.delete(n); }
    view.invalidateScene();
    renderLeft();
    renderProps();
    renderProfile();
    secUi.render();   // 0.4 V13
    updateTools();
    if (kind !== 'display') bandCache = null;
    view3d?.refresh();
  }
  project.on(refresh);
  // Autosave (0.4 1.2; app-autosave.js): the project is the document; its copy is the project file's JSON, written ~2 s
  // after changes stop while it has unsaved work. A new or opened project replaces it (the old copy goes: the person kept
  // or discarded that work on purpose).
  const autosave = new Autosave({ app: 'civilcraft' });
  let asDoc = null;
  function bindAutosave() {
    asDoc?.close();
    const p = project;
    asDoc = autosave.doc({ name: fileStem() + '.civilcraft.json', snapshot: async () => (unsaved() ? { data: JSON.stringify(p.toJSON()), meta: { name: fileStem() + '.civilcraft.json', points: p.points.length } } : null) });
    p.on(() => { if (p !== project) return; asDoc.rename(fileStem() + '.civilcraft.json'); if (unsaved()) asDoc.changed(); else asDoc.clean(); });
  }
  bindAutosave();
  function rebind() {
    bindAutosave();
    project.on(refresh); picked.clear(); pasteJob = null; if (tool === 'paste') tool = 'select';
    for (const f of gisReg.onProject) f(project);
    if (project.state.crs || project.state.gis?.layers?.length) gisLoad().catch(() => {});
  }

  /** Why an Edit command cannot act right now ('' = it can). Shown in the button's tooltip; the button is grayed out. */
  function editBlock(c) {
    const pts = project.points.length, sp = picked.size;
    const needPts = t('cv.edit.need.pts');
    switch (c) {
      case 'undo': return project.undoStack.length ? '' : t('cv.undo.none');
      case 'redo': return project.redoStack.length ? '' : t('cv.redo.none');
      case 'copy': case 'cut': case 'duplicate': return sp ? '' : pts ? needPts : t('cv.edit.no.pts.open');
      case 'paste': case 'paste-in-place': return clip || storedClip() || navigator.clipboard?.readText ? '' : t('cv.edit.no.paste');
      case 'delete': return selAl() || selPad() || selStruct() || selPipe() || selPvi >= 0 || sp || ['catchment', 'feature', 'parcel', 'swept'].includes(sel?.kind) ? '' : t('cv.delete.none');
      case 'select-all': return pts ? '' : t('cv.pts.none');
      case 'select-none': return sp || sel || selPvi >= 0 ? '' : t('cv.sel.none');
      default: return '';
    }
  }
  function updateTools() {
    const hasData = project.points.length || project.state.surface.tin || project.state.alignments.length || project.state.gis?.layers?.length;   // GIS: layers count as data
    const hasWork = hasData || project.state.pads.length || (project.state.features || []).length;
    for (const b of root.querySelectorAll('[data-cmd]')) {
      const c = b.dataset.cmd;
      // nothing to save, export, fit or clear yet: greyed out (the Edit buttons below say why in their title)
      if (c === 'new') b.disabled = !hasWork && !project.dirty;
      else if (['save', 'landxml', 'dxf', 'dwg', 'pdf', 'gis-export', 'fit', 'view3d'].includes(c)) b.disabled = !hasWork;
      else if (c === 'breakline' || c === 'boundary') b.disabled = !project.points.length;
      else if (c === 'profile') b.disabled = !project.state.alignments.length;
      if (['select', 'alignment', 'pad', 'breakline', 'boundary', 'pipe'].includes(c)) b.setAttribute('aria-pressed', String(tool === c));
      if (c === 'feature') b.setAttribute(b.getAttribute('role') === 'menuitemcheckbox' ? 'aria-checked' : 'aria-pressed', String(tool === c));   // 0.4 V14
      if (c === 'profile') b.setAttribute('aria-pressed', String(!ui.profPanel.hidden));
      if (c === 'sections') b.setAttribute(b.getAttribute('role') === 'menuitemcheckbox' ? 'aria-checked' : 'aria-pressed', String(!!secUi?.isOpen()));
      if (c === 'view3d') b.setAttribute('aria-pressed', String(is3D()));
      if (['undo', 'redo', 'copy', 'cut', 'paste', 'paste-in-place', 'duplicate', 'delete', 'select-all', 'select-none'].includes(c)) {
        if (!b.dataset.title) b.dataset.title = b.title || b.textContent.replace(/\s+/g, ' ').trim();
        const why = editBlock(c);
        b.disabled = !!why;
        b.title = why ? t('cv.edit.title.why', { title: b.dataset.title, why }) : b.dataset.title;
      }
    }
    ui.over.classList.toggle('is-select', tool === 'select');
    ui.hint.hidden = !!hasData || tool !== 'select';
  }

  function renderLeft() {
    const s = project.state, U = u();
    if (ui.name.ownerDocument.activeElement !== ui.name) ui.name.value = s.name;   // the panel may be in the panels window
    ui.units.value = s.units;
    for (const e of unitLabels) e.textContent = U.short;
    // points
    const pts = project.points;
    ui.pointsEmpty.hidden = pts.length > 0;
    fillDl(ui.pointsInfo, pts.length ? [[t('cv.pts.file'), project.pointsFile || '—'], [t('codes.col.n'), num(pts.length)], [t('cv.pts.withz'), num(pts.filter((p) => p.z !== null).length)]] : []);
    const tb = ui.groups.tBodies[0];
    const groups = project.groups();
    ui.groups.hidden = !groups.length;
    tb.replaceChildren(...groups.map((g) => {
      const sel = el('select', { className: 'cv-select', 'aria-label': t('cv.group.use', { group: g.key }) },
        el('option', { value: 'points' }, t('codes.use.points')), el('option', { value: 'breakline' }, t('codes.use.breakline')), el('option', { value: 'off' }, t('codes.use.off')));
      sel.value = g.use;
      sel.addEventListener('change', () => project.change(t('cv.undo.group', { group: g.key, use: sel.value }), (st) => { st.surface.groups[g.key] = sel.value; }));
      return el('tr', {}, el('td', {}, g.key), el('td', { className: 'num' }, num(g.count)), el('td', {}, sel));
    }));
    // surface
    const r = eg(), sf = r.surface;
    ui.surfaceH.textContent = s.surface.tin ? (s.surface.tin.from === 'grid' ? t('cv.surface.grid') : t('cv.surface.landxml')) : t('cv.surface');   // GIS: grid TINs (gis-terrain-ui.js)
    if (sf) {
      const st = sf.stats();
      fillDl(ui.surfaceInfo, [
        [t('codes.col.n'), num(st.points)], [t('cv.sf.triangles'), num(st.triangles)],
        [t('cv.sf.elevations'), t('cv.range', { a: fixed(st.minZ, 2), b: fixed(st.maxZ, 2) })], [t('cv.sf.mean'), fixed(st.meanZ, 2)],
        [t('cv.sf.area2d'), areaText(st.area2d, s.units)], [t('cv.sf.area3d'), areaText(st.area3d, s.units)],
        [t('cv.sf.breaklines'), num(project.egBreaklines().length)], [t('cv.sf.boundary'), s.surface.boundary ? t('cv.sf.boundary.yes', { n: s.surface.boundary.length }) : t('gis.label.no')],
      ]);
    } else fillDl(ui.surfaceInfo, [[t('cv.surface'), pts.length ? t('cv.sf.notbuilt') : t('cv.sf.noneyet')]]);
    const notes = [...(r.report?.errors || []), ...(r.report?.notes || [])];
    if (lastReport) notes.push(...lastReport);
    ui.surfaceReport.replaceChildren(notes.length ? el('div', { className: 'cv-report' + (r.report?.errors?.length ? ' is-error' : '') }, el('ul', {}, ...notes.map((n) => el('li', {}, n)))) : '');
    if (ui.maxEdge.ownerDocument.activeElement !== ui.maxEdge) ui.maxEdge.value = s.surface.maxEdge || 0;
    ui.maxEdge.disabled = !!s.surface.tin;
    const acts = [];
    if (s.surface.boundary) acts.push(el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => project.change(t('cv.undo.boundary.remove'), (st) => { st.surface.boundary = null; }) }, t('cv.sf.boundary.remove')));
    if (s.surface.breaklines.length) acts.push(el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => project.change(t('cv.undo.breaklines.remove'), (st) => { st.surface.breaklines = []; }) }, t('cv.sf.breaklines.remove', { n: s.surface.breaklines.length })));
    if (s.surface.tin) acts.push(el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => { project.setTin(t('tin.rebuild.undo'), null); say(t('tin.rebuild.done')); }, disabled: !pts.length }, t('tin.rebuild.undo')));   // 0.4 V9: undoable
    ui.surfaceActions.replaceChildren(...acts);
    // display
    const d = s.display;
    ui.showSurface.value = graded().surface ? d.surface : 'eg';
    ui.showSurface.querySelector('option[value="fg"]').disabled = !graded().surface;
    const ivs = s.units === 'm' ? [0.1, 0.25, 0.5, 1, 2, 5, 10] : [0.25, 0.5, 1, 2, 5, 10, 20];
    if (!ivs.includes(Number(d.interval))) ivs.push(Number(d.interval));
    ui.interval.replaceChildren(...ivs.sort((a, b) => a - b).map((v) => el('option', { value: String(v) }, v + ' ' + U.short)));
    ui.interval.value = String(d.interval);
    ui.major.value = String(d.major);
    ui.bandCount.value = String(d.bandCount);
    for (const c of ui.checks.querySelectorAll('[data-show]')) c.checked = !!d[c.dataset.show];
    if (!d.bands) ui.legend.hidden = true;
  }

  // ------------------------------------------------------------------ properties panel
  function renderProps() {
    const p = ui.props;
    // never rebuild under the user's typing; a checkbox is not typing
    const focused = p.ownerDocument.activeElement;
    if (p.contains(focused) && focused.matches('input:not([type=checkbox])')) { pendingProps = true; return; }
    pendingProps = false;
    const a = selAl(), pd = selPad(), st = selStruct(), pp = selPipe();
    if (sel?.kind === 'gis') { for (const f of gisReg.props) if (f(sel, ui.props, ui.propsH)) return; sel = null; }   // GIS: a picked feature
    if (sel?.kind === 'feature') { const f = flUi.find(sel.id); if (f) { ui.propsH.textContent = t('fl.props.head'); ui.props.replaceChildren(...flUi.props(f), el('div', { className: 'cv-actions' }, swUi.button('feature', f.id))); return; } sel = null; }   // 0.4 V14; 0.6 WL.28
    if (sel?.kind === 'swept') { const w = swUi.find(sel.id); if (w) { ui.propsH.textContent = t('sw.head'); ui.props.replaceChildren(...swUi.props(w)); return; } sel = null; }   // 0.6 WL.28
    if (sel?.kind === 'parcel') { const pc = pcUi.find(sel.id); if (pc) { ui.propsH.textContent = t('pc.props.head'); ui.props.replaceChildren(...pcUi.props(pc), el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete')))); return; } sel = null; }   // 0.4 V21
    if (sel?.kind === 'catchment') { if (drUi.find(sel.id)) { ui.propsH.textContent = t('dr.c.head'); ui.props.replaceChildren(...drUi.props(drUi.find(sel.id)), el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete')))); return; } sel = null; }   // 0.4 V19
    if (sel && !a && !pd && !st && !pp) sel = null;
    if (a) return alignmentProps(a);
    if (pd) return padProps(pd);
    if (st) return structureProps(st);
    if (pp) return pipeProps(pp);
    if (picked.size === 1) { const p = project.points.find((q) => picked.has(q.n)); if (p) return pointProps(p); }
    if (picked.size > 1) return pickedProps();
    projectProps();
  }
  let pendingProps = false;
  ui.props.addEventListener('focusout', () => setTimeout(() => { if (pendingProps && !ui.props.contains(ui.props.ownerDocument.activeElement)) renderProps(); }, 0));

  // 0.6 DF.3: every number box is a text box (a number box can't hold "4+7/16"); what is not a plain number is read as a
  // length or a sum of lengths in the project's units (units.js readLength) and the box shows the result. `calc: false`
  // for boxes that are not lengths (grades in %, arc radius words, point numbers and descriptions), `station: true` for
  // stations ("10+00" is a station, never a sum)
  function numInput(value, onCommit, { label, id, text = false, width, calc = true, station = false } = {}) {
    void text;   // (kept for the callers: every box is text now)
    const inp = el('input', { type: 'text', className: 'cv-input', value: value ?? '', 'aria-label': label, id, inputMode: 'decimal', style: width ? 'width:' + width : undefined });
    // Enter commits at once (a synthetic change); the browser's own change when the box then loses focus must not commit
    // the same text again — "Raise 2" would raise twice (0.5: found by the WL.20 browser test)
    let entered = null;
    inp.addEventListener('change', (e) => {
      if (e.isTrusted && entered !== null && inp.value === entered) { entered = null; return; }
      entered = e.isTrusted ? null : inp.value;
      let v = inp.value;
      if (calc && !station && v.trim() !== '' && !isNum(v)) {
        const r = readLength(v, units());
        if (!r.ok) { inp.setAttribute('aria-invalid', 'true'); say(r.error); return; }
        v = String(Number(r.value.toFixed(9)));
        inp.value = v;
        if (entered !== null) entered = v;
      }
      if (onCommit(v) === false) inp.setAttribute('aria-invalid', 'true'); else inp.removeAttribute('aria-invalid');
    });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); inp.dispatchEvent(new Event('change')); } });
    return inp;
  }
  const row = (k, v, id) => [el(id ? 'label' : 'span', { className: 'k', for: id }, k), typeof v === 'string' ? el('span', { className: 'v' }, v) : v];

  function projectProps() {
    ui.propsH.textContent = t('cv.props.project');
    const s = project.state, out = [];
    out.push(el('p', { className: 'cv-note' }, t('cv.props.project.note')));
    if (s.alignments.length) {
      out.push(el('h3', { className: 'cv-h3' }, t('cv.props.alignments')));
      out.push(el('ul', { className: 'cv-plainlist' }, ...s.alignments.map((a) => { const al = project.alignment(a); return el('li', {}, el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => { sel = { kind: 'alignment', id: a.id }; selPvi = -1; refresh(); } }, a.name), ' · ', al.ok ? fixed(al.length, 2) + ' ' + u().short : t('cv.al.needsfix')); })));
    }
    if (s.pads.length) {
      out.push(el('h3', { className: 'cv-h3' }, t('cv.props.pads')));
      out.push(el('ul', { className: 'cv-plainlist' }, ...s.pads.map((d) => el('li', {}, el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => { sel = { kind: 'pad', id: d.id }; refresh(); } }, d.name), ' · ', t('cv.pad.el', { z: fixed(Number(d.z), 2) })))));
    }
    if (s.pads.length || s.alignments.some((a) => a.corridor?.on)) out.push(volumeBlock());
    out.push(...pcUi.block());   // 0.4 V21
    out.push(...tvUi.block());   // 0.4 V22
    if (s.network) out.push(...networkBlock());
    if (!s.alignments.length && !s.pads.length && !s.network) out.push(el('p', { className: 'cv-note' }, t('cv.props.empty')));
    ui.props.replaceChildren(...out);
  }

  function volumeBlock() {
    const v = project.volumes(), g = graded(), s = project.state;
    const wrap = el('div', {}, el('h3', { className: 'cv-h3' }, t('cv.ew.head')));
    const probs = (g.report?.items || []).flatMap((p) => p.problems.map((x) => t('cv.ew.problem', { name: p.name || t('cv.pad'), problem: x })));
    if (probs.length) wrap.append(el('div', { className: 'cv-report is-error' }, el('ul', {}, ...probs.map((x) => el('li', {}, x)))));
    if (!v) { wrap.append(el('p', { className: 'cv-note' }, t('cv.ew.none'))); return wrap; }
    const net = v.fill - v.cut;
    wrap.append(el('dl', { className: 'cv-vol' },
      el('dt', {}, t('cv.ew.cut')), el('dd', { 'data-vol-cut': '' }, volumeText(v.cut, s.units)),
      el('dt', {}, t('cv.ew.fill')), el('dd', { 'data-vol-fill': '' }, volumeText(v.fill, s.units)),
      el('dt', {}, t('cv.ew.net')), el('dd', {}, Math.abs(net) < 1e-9 ? volumeText(Math.abs(net), s.units) : t(net > 0 ? 'cv.ew.net.fill' : 'cv.ew.net.cut', { v: volumeText(Math.abs(net), s.units) }))));
    if (v.items?.length > 1) wrap.append(el('ul', { className: 'cv-plainlist cv-note' }, ...v.items.map((it) => el('li', {}, t('cv.ew.item', { name: it.name, cut: volumeText(it.cut, s.units), fill: volumeText(it.fill, s.units) })))));
    wrap.append(el('p', { className: 'cv-note' }, t('cv.ew.grid', { n: v.cells, cells: num(v.cells), cell: fixed(v.cell, 3).replace(/\.?0+$/, ''), u: u().short })));
    wrap.append(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'cv-linkbtn', dataset: { qtySend: '' }, title: t('cv.qty.send.title'), onclick: sendEarthwork }, el('i', { className: 'bi bi-box-arrow-up-right', 'aria-hidden': 'true' }), ' ', t('cv.qty.send'))));
    return wrap;
  }
  /** TK.5+: cut and fill as a quantities file TakeoffCraft opens (File › Open takeoff, or a drop) as typed quantities. */
  function sendEarthwork() {
    const r = earthworkFile({ name: project.state.name, units: project.state.units, volumes: project.volumes() });
    if (!r.ok) { say(r.why); return; }
    const name = fileStem() + QTY_EXT;
    download(JSON.stringify(r.json, null, 1), name, 'application/json');
    say(t('cv.qty.saved', { name, cut: grouped(r.cut, 2), fill: grouped(r.fill, 2), unit: r.unit }));
  }

  function alignmentProps(a) {
    ui.propsH.textContent = t('sec.alignment');
    const al = project.alignment(a), U = u(), out = [];
    const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-al-name', value: a.name, maxLength: 120 });
    nm.addEventListener('change', () => project.change(t('cv.undo.al.rename'), () => { findAl(a.id).name = nm.value.trim().slice(0, 120) || t('sec.alignment'); }));
    const st = numInput(formatStation(Number(a.start) || 0, units()), (v) => { const x = parseStation(v, units()); if (x === null) return false; project.change(t('cv.al.start'), () => { findAl(a.id).start = x; }); }, { text: true, station: true, id: 'cv-al-start' });
    // 0.5 WL.23: a design minimum radius (empty = none): curves under it are said, with the smallest radius that fits
    const minR = numInput(a.minR > 0 ? String(a.minR) : '', (v) => { const x = v.trim() === '' ? 0 : Number(v); if (!(x >= 0)) return false; project.change(t('why.undo.minr'), () => { findAl(a.id).minR = x; }); }, { text: true, id: 'cv-al-minr', width: '7rem' });
    minR.placeholder = t('why.minr.none');
    out.push(el('div', { className: 'cv-props' }, ...row(t('fl.props.name'), nm, 'cv-al-name'), ...row(t('cv.al.start'), st, 'cv-al-start'),
      ...row(t('why.minr'), el('div', { className: 'cv-row' }, minR, el('span', { className: 'cv-unit' }, U.short)), 'cv-al-minr'),
      ...(al.ok ? [...row(t('fl.props.length'), fixed(al.length, 2) + ' ' + U.short), ...row(t('cv.al.end'), formatStation(al.end, units()))] : [])));
    const why = curveWhy(a.pis, { minR: a.minR || 0 });
    if (why.length) out.push(whyBlock(a, why));
    else if (al.errors.length) out.push(el('div', { className: 'cv-report is-error' }, el('ul', {}, ...al.errors.map((e) => el('li', {}, e)))));
    // PIs
    out.push(el('h3', { className: 'cv-h3' }, t('cv.al.pis')));
    const tbody = el('tbody');
    a.pis.forEach((p, i) => {
      const end = i === 0 || i === a.pis.length - 1;
      const setXY = (k) => (v) => { const x = Number(v); if (!Number.isFinite(x) || v === '') return false; project.change(t('cv.undo.pi.move.n', { n: i + 1 }), () => { findAl(a.id).pis[i][k] = x; }); };
      tbody.append(el('tr', {},
        el('td', {}, String(i + 1)),
        el('td', {}, numInput(fixed(p.x, 2), setXY('x'), { label: t('cv.al.pi.e', { n: i + 1 }) })),
        el('td', {}, numInput(fixed(p.y, 2), setXY('y'), { label: t('cv.al.pi.n', { n: i + 1 }) })),
        el('td', {}, end ? '—' : numInput(p.r || 0, (v) => { const r = Number(v); if (!(r >= 0)) return false; project.change(t('cv.al.pi.r', { n: i + 1 }), () => { findAl(a.id).pis[i].r = r; }); }, { label: t('cv.al.pi.r', { n: i + 1 }), min: 0 })),
        el('td', {}, a.pis.length > 2 ? el('button', { type: 'button', className: 'cv-x', 'aria-label': t('cv.al.pi.remove', { n: i + 1 }), title: t('cv.al.pi.remove.title'), onclick: () => project.change(t('cv.undo.pi.remove'), () => { findAl(a.id).pis.splice(i, 1); }) }, el('i', { className: 'bi bi-x', 'aria-hidden': 'true' })) : '')));
    });
    out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table' },
      el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, '#'), el('th', { scope: 'col' }, t('pt.props.easting')), el('th', { scope: 'col' }, t('pt.props.northing')), el('th', { scope: 'col' }, t('se.c.r')), el('th', {}, el('span', { className: 'visually-hidden' }, t('sec.props.remove'))))), tbody)));
    // curves
    const arcs = al.ok ? al.elements.filter((e) => e.type === 'arc') : [];
    if (arcs.length) {
      out.push(el('h3', { className: 'cv-h3' }, t('cv.al.curves')));
      out.push(el('ol', { className: 'cv-curves' }, ...arcs.map((c) => el('li', {},
        el('span', { className: 'cv-curve-sta' }, t('cv.al.curve.sta', { pc: formatStation(c.sta, units()), pt: formatStation(c.sta + c.len, units()) })),
        el('span', {}, t(c.ccw ? 'cv.al.curve.left' : 'cv.al.curve.right', { r: fixed(c.r, 2), delta: dms(c.delta * 180 / Math.PI) })),
        el('span', {}, t('cv.al.curve.parts', { len: fixed(c.len, 2), tan: fixed(c.T, 2), ext: fixed(c.E, 2), chord: fixed(c.chord, 2) }))))));
      out.push(el('p', { className: 'cv-note' }, t('cv.al.curves.note')));
    }
    if (al.ok) out.push(el('p', { className: 'cv-note' }, t('cv.al.tangent', { b: bearing(al.elements[0].dir ?? al.elements[0].dirIn) })));
    // profile
    out.push(el('h3', { className: 'cv-h3' }, t('cv.prof.head')));
    if (al.ok) out.push(...profileProps(a, al));
    if (al.ok) out.push(...corridorProps(a));
    if (al.ok) out.push(...secUi.props(a));   // 0.4 V13 sample lines
    out.push(el('div', { className: 'cv-actions' },
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => showProfile(true, a.id) }, el('i', { className: 'bi bi-graph-up', 'aria-hidden': 'true' }), ' ', t('cv.prof.view')),
      al.ok ? skUi.button(a) : null,   // 0.4 V23
      al.ok ? swUi.button('alignment', a.id) : null,   // 0.6 WL.28
      al.ok ? el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pp-open': '', onclick: () => ppUi.open(a.id) }, el('i', { className: 'bi bi-file-earmark-pdf', 'aria-hidden': 'true' }), ' ', t('pp.ui.open')) : null,   // 0.4 V15
      el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    ui.props.replaceChildren(...out);
  }

  /**
   * 0.5 WL.23: why the curves have no solution, in numbers, each with the radius that would fit as a button (one undo
   * step). Overlaps offer either PI's largest fitting radius or both scaled together; a radius under the design minimum
   * offers the smallest that meets it, or says why none fits.
   */
  function whyBlock(a, why) {
    const U = u().short, n = (v) => fixed(v, 2).replace(/,/g, '');
    const setR = (pairs, label) => () => { project.change(label, () => { const al = findAl(a.id); for (const [i, r] of pairs) al.pis[i].r = r; }); say(label); };
    const shown = new Set();   // one button per fix: two overlaps round one PI often offer the same radius
    const btn = (text, attr, fn) => { if (shown.has(attr)) return null; shown.add(attr); return el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-why-fix': attr, onclick: fn }, text); };
    const items = why.map((w) => {
      if (w.kind === 'overlap') {
        const fixes = [];
        if (w.fixA !== null) fixes.push(btn(t('why.fix.r', { pi: w.a + 1, r: n(w.fixA), u: U }), w.a + ':' + w.fixA, setR([[w.a, w.fixA]], t('why.undo.r', { pi: w.a + 1, r: n(w.fixA) }))));
        if (w.fixB !== null) fixes.push(btn(t('why.fix.r', { pi: w.b + 1, r: n(w.fixB), u: U }), w.b + ':' + w.fixB, setR([[w.b, w.fixB]], t('why.undo.r', { pi: w.b + 1, r: n(w.fixB) }))));
        if (w.both.ra > 0 && w.both.rb > 0) fixes.push(btn(t('why.fix.both', { a: w.a + 1, b: w.b + 1, ra: n(w.both.ra), rb: n(w.both.rb), u: U }), 'both', setR([[w.a, w.both.ra], [w.b, w.both.rb]], t('why.undo.both', { a: w.a + 1, b: w.b + 1 }))));
        const none = [w.fixA === null && w.a > 0 ? t('why.none.at', { pi: w.a + 1, other: w.b + 1 }) : '', w.fixB === null && w.b < a.pis.length - 1 ? t('why.none.at', { pi: w.b + 1, other: w.a + 1 }) : ''].filter(Boolean);
        const one = !(w.Ta > 0 && w.Tb > 0), [pi, other] = w.Ta > 0 ? [w.a, w.b] : [w.b, w.a];
        const said = one ? t('why.overlap.one', { pi: pi + 1, other: other + 1, need: n(w.need), dist: n(w.dist), u: U }) : t('why.overlap', { a: w.a + 1, b: w.b + 1, need: n(w.need), ta: n(w.Ta), tb: n(w.Tb), dist: n(w.dist), u: U });
        const kept = fixes.filter(Boolean);
        return el('li', { 'data-why': 'overlap' }, el('p', {}, said),
          ...none.map((x) => el('p', { className: 'cv-note' }, x)), kept.length ? el('div', { className: 'cv-actions' }, ...kept) : null);
      }
      if (w.kind === 'back') return el('li', { 'data-why': 'back' }, el('p', {}, t('why.back', { pi: w.pi + 1 })),
        el('div', { className: 'cv-actions' }, btn(t('why.fix.nocurve', { pi: w.pi + 1 }), w.pi + ':0', setR([[w.pi, 0]], t('why.undo.r', { pi: w.pi + 1, r: '0' })))));
      return el('li', { 'data-why': 'min' }, el('p', {}, t('why.min', { pi: w.pi + 1, r: n(w.r), min: n(w.minR), u: U })),
        w.fix !== null ? el('div', { className: 'cv-actions' }, btn(t('why.fix.min', { pi: w.pi + 1, r: n(w.fix), u: U }), w.pi + ':' + w.fix, setR([[w.pi, w.fix]], t('why.undo.r', { pi: w.pi + 1, r: n(w.fix) }))))
          : el('p', { className: 'cv-note' }, t('why.min.none', { pi: w.pi + 1, max: n(w.maxR), min: n(w.minR), u: U })));
    });
    const errs = why.some((w) => w.kind !== 'min');
    return el('div', { className: 'cv-report cv-why' + (errs ? ' is-error' : ''), 'data-why-block': '' },
      el('p', { className: 'cv-why-h' }, t(errs ? 'why.head.error' : 'why.head.min')), el('ul', {}, ...items));
  }

  function profileProps(a, al) {
    const out = [], prof = project.designProfile(a);
    if (!a.pvis.length) {
      out.push(el('p', { className: 'cv-note' }, t('cv.prof.none')));
      out.push(el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-start-profile': '', onclick: () => startProfile(a) }, t('cv.prof.start')));
      return out;
    }
    // 0.5 WL.23: vertical curves that do not fit say why, with the longest length that does (one undo step)
    const vwhy = verticalWhy(a.pvis);
    if (vwhy.length) {
      const n = (v) => fixed(v, 2).replace(/,/g, '');
      out.push(el('div', { className: 'cv-report cv-why is-error', 'data-vwhy-block': '' }, el('p', { className: 'cv-why-h' }, t('why.head.error')), el('ul', {}, ...vwhy.map((w) => el('li', { 'data-why': 'vc' },
        el('p', {}, t(w.side === 'before' ? 'why.vc.before' : 'why.vc.past', { pvi: w.pvi + 1, l: n(w.L), room: n(w.room / 2), u: u().short })),
        w.fix ? el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-why-fix': 'L' + w.index + ':' + w.fix,
          onclick: () => { const lbl = t('why.undo.l', { pvi: w.pvi + 1, l: n(w.fix) }); project.change(lbl, () => { const v = findAl(a.id).pvis[w.index]; v.L = w.fix; delete v.K; }); say(lbl); } }, t('why.fix.l', { pvi: w.pvi + 1, l: n(w.fix), k: fixed(w.K, 1), u: u().short }))) : null)))));
    } else if (prof.errors.length) out.push(el('div', { className: 'cv-report is-error' }, el('ul', {}, ...prof.errors.map((e) => el('li', {}, e)))));
    const tbody = el('tbody');
    a.pvis.forEach((v, i) => {
      const interior = i > 0 && i < a.pvis.length - 1;
      tbody.append(el('tr', { className: selPvi === i ? 'is-sel' : '' },
        el('td', {}, el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => { selPvi = i; renderProfile(); renderProps(); } }, String(i + 1))),
        el('td', {}, numInput(formatStation(v.sta, units()), (x) => { const s = parseStation(x, units()); if (s === null) return false; project.change(t('cv.undo.pvi.sta'), () => { const p = findAl(a.id).pvis; p[i].sta = s; p.sort((m, n) => m.sta - n.sta); }); }, { text: true, station: true, label: t('cv.pvi.sta.of', { n: i + 1 }) })),
        el('td', {}, numInput(fixed(v.z, 2), (x) => { const z = Number(x); if (!Number.isFinite(z) || x === '') return false; project.change(t('cv.undo.pvi.z'), () => { findAl(a.id).pvis[i].z = z; }); }, { label: t('cv.pvi.z.of', { n: i + 1 }) })),
        el('td', {}, interior ? numInput(v.L || 0, (x) => { const L = Number(x); if (!(L >= 0)) return false; project.change(t('cv.undo.pvi.l'), () => { findAl(a.id).pvis[i].L = L; }); }, { label: t('cv.pvi.l.of', { n: i + 1 }), min: 0 }) : '—'),
        el('td', {}, el('button', { type: 'button', className: 'cv-x', 'aria-label': t('cv.pvi.remove.of', { n: i + 1 }), onclick: () => { project.change(t('cv.undo.pvi.remove'), () => { findAl(a.id).pvis.splice(i, 1); }); selPvi = -1; } }, el('i', { className: 'bi bi-x', 'aria-hidden': 'true' })))));
    });
    out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-pvi-table': '' },
      el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, t('cv.pvi.col')), el('th', { scope: 'col' }, t('sec.station.label')), el('th', { scope: 'col' }, t('pt.props.elev')), el('th', { scope: 'col' }, t('cv.pvi.col.l')), el('th', {}, el('span', { className: 'visually-hidden' }, t('sec.props.remove'))))), tbody)));
    if (prof.ok) {
      const lines = prof.grades.map((g, i) => t('cv.prof.grade', { n: i + 1, g: pct(g.g) }));
      for (const c of prof.curves) {
        lines.push(t(c.kind === 'crest' ? 'cv.prof.crest' : 'cv.prof.sag', { sta: formatStation(c.pvi, units()), l: fixed(c.L, 2), k: fixed(c.K, 1), bvc: formatStation(c.bvc, units()), zbvc: fixed(c.zBvc, 2), evc: formatStation(c.evc, units()), zevc: fixed(c.zEvc, 2) }));
        const hp = c.high || c.low;
        if (hp) lines.push(t(c.high ? 'cv.prof.high' : 'cv.prof.low', { sta: formatStation(hp.sta, units()), z: fixed(hp.z, 2) }));
      }
      out.push(el('ul', { className: 'cv-note cv-plainlist', 'data-profile-facts': '' }, ...lines.map((l) => el('li', {}, l))));
    }
    if (a.pvis.length && (a.pvis[0].sta > al.start + 1e-6 || a.pvis[a.pvis.length - 1].sta < al.end - 1e-6)) out.push(el('p', { className: 'cv-note' }, t('cv.prof.partial', { from: formatStation(al.start, units()), to: formatStation(al.end, units()) })));
    return out;
  }

  function corridorProps(a) {
    const out = [el('h3', { className: 'cv-h3' }, t('cv.co.head'))], U = u();
    const c = { ...defaultAssembly(units()), ...(a.corridor || {}) };
    const on = el('input', { type: 'checkbox', id: 'cv-co-on', checked: !!a.corridor?.on });
    on.addEventListener('change', () => project.change(on.checked ? t('cv.undo.co.on') : t('cv.undo.co.off'), () => { const x = findAl(a.id); x.corridor = { ...defaultAssembly(units()), ...(x.corridor || {}), on: on.checked }; }));
    out.push(el('label', { className: 'cv-check', for: 'cv-co-on' }, on, ' ', t('cv.co.on')));
    if (!a.corridor?.on) { out.push(el('p', { className: 'cv-note' }, t('cv.co.off.note'))); return out; }
    const field = (k, label, undo, scale, unit, id) => [el('label', { for: id }, label), el('div', { className: 'cv-row' }, numInput(fixed(c[k] * scale, 2), (v) => { const x = Number(v); if (!(x >= 0) || v === '' || ((k === 'cut' || k === 'fill' || k === 'step') && !(x > 0))) return false; project.change(undo, () => { findAl(a.id).corridor[k] = x / scale; }); }, { id, min: 0 }), el('span', { className: 'cv-unit' }, unit))];
    out.push(el('div', { className: 'cv-props' },
      ...field('lane', t('cv.co.lane'), t('cv.undo.co.lane'), 1, U.short, 'cv-co-lane'), ...field('laneSlope', t('cv.co.ls'), t('cv.undo.co.ls'), 100, '%', 'cv-co-ls'),
      ...field('shoulder', t('cv.co.sh'), t('cv.undo.co.sh'), 1, U.short, 'cv-co-sh'), ...field('shoulderSlope', t('cv.co.ss'), t('cv.undo.co.ss'), 100, '%', 'cv-co-ss'),
      ...field('cut', t('fl.props.cut'), t('cv.undo.co.cut'), 1, ': 1', 'cv-co-cut'), ...field('fill', t('fl.props.fill'), t('cv.undo.co.fill'), 1, ': 1', 'cv-co-fill'),
      ...field('step', t('cv.co.step'), t('cv.undo.co.step'), 1, U.short, 'cv-co-step')));
    out.push(el('p', { className: 'cv-note' }, t('co.note')));   // 0.4 V18: superelevation is available now
    const it = graded().items?.find((x) => x.id === a.id && x.kind === 'corridor');
    const seProblems = new Set(it?.super?.problems || []);   // 0.4 V18: said in the Superelevation block instead
    const others = (it?.problems || []).filter((p) => !seProblems.has(p));
    if (others.length) out.push(el('div', { className: 'cv-report is-error' }, el('ul', {}, ...others.map((p) => el('li', {}, p)))));
    else if (it?.sections) {
      const vi = project.volumes()?.items?.find((x) => x.id === a.id);
      out.push(el('p', { className: 'cv-note', 'data-corridor-facts': '' }, vi ? t('cv.co.facts.vol', { n: it.sections.length, from: formatStation(it.from, units()), to: formatStation(it.to, units()), cut: volumeText(vi.cut, units()), fill: volumeText(vi.fill, units()) }) : t('cv.co.facts', { n: it.sections.length, from: formatStation(it.from, units()), to: formatStation(it.to, units()) })));
    }
    out.push(...targetProps({ el, project: () => project, say: (m) => say(m) }, a, it));   // 0.6 WL.25
    out.push(...superProps({ el, project: () => project, units: () => units(), numInput: (...x) => numInput(...x), row: (...x) => row(...x), say: (m) => say(m) }, a, it));   // 0.4 V18
    return out;
  }

  function startProfile(a) {
    const al = project.alignment(a);
    const egp = project.egProfile(a).filter((p) => p.z !== null);
    if (!al.ok || egp.length < 2) { say(t('cv.prof.noground')); return; }
    const z0 = egp[0], z1 = egp[egp.length - 1];
    project.change(t('cv.undo.prof.start'), () => { findAl(a.id).pvis = [{ sta: z0.sta, z: Number(z0.z.toFixed(2)), L: 0 }, { sta: z1.sta, z: Number(z1.z.toFixed(2)), L: 0 }]; });
    showProfile(true, a.id);
    say(t('cv.prof.started'));
  }

  function padProps(d) {
    ui.propsH.textContent = t('cv.pad');
    const out = [], U = u();
    const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-pad-name', value: d.name, maxLength: 120 });
    nm.addEventListener('change', () => project.change(t('cv.undo.pad.rename'), () => { findPad(d.id).name = nm.value.trim().slice(0, 120) || t('cv.pad'); }));
    const z = numInput(fixed(Number(d.z), 2), (v) => { const x = Number(v); if (!Number.isFinite(x) || v === '') return false; project.change(t('cv.undo.pad.z'), () => { findPad(d.id).z = x; }); }, { id: 'cv-pad-z' });
    const cut = numInput(d.cut, (v) => { const x = Number(v); if (!(x > 0)) return false; project.change(t('fl.props.cut'), () => { findPad(d.id).cut = x; }); }, { id: 'cv-pad-cut', min: 0.1 });
    const fill = numInput(d.fill, (v) => { const x = Number(v); if (!(x > 0)) return false; project.change(t('fl.props.fill'), () => { findPad(d.id).fill = x; }); }, { id: 'cv-pad-fill', min: 0.1 });
    out.push(el('div', { className: 'cv-props' },
      ...row(t('fl.props.name'), nm, 'cv-pad-name'),
      ...row(t('pt.props.elev'), el('div', { className: 'cv-row' }, z, el('span', { className: 'cv-unit' }, U.short)), 'cv-pad-z'),
      ...row(t('fl.props.cut'), el('div', { className: 'cv-row' }, cut, el('span', { className: 'cv-unit' }, ': 1 (H:V)')), 'cv-pad-cut'),
      ...row(t('fl.props.fill'), el('div', { className: 'cv-row' }, fill, el('span', { className: 'cv-unit' }, ': 1 (H:V)')), 'cv-pad-fill'),
      ...row(t('cv.pad.area'), areaText(Math.abs(polyArea(d.pts)), units())),
      ...row(t('dr.c.corners'), String(d.pts.length))));
    const gp = graded().items?.find((x) => x.id === d.id);
    if (gp && !gp.problems.length) {
      const cutN = gp.rays.filter((r) => r.kind === 'cut').length, fillN = gp.rays.filter((r) => r.kind === 'fill').length;
      out.push(el('p', { className: 'cv-note' }, t('cv.pad.daylight', { n: gp.rays.length, cut: cutN, fill: fillN, d: fixed(Math.max(...gp.rays.map((r) => r.d)), 2), u: U.short })));
    }
    out.push(volumeBlock());
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    ui.props.replaceChildren(...out);
  }

  // ---- pipe network
  function networkBlock() {
    const n = net(), chk = project.networkCheck(), U = u(), out = [];
    out.push(el('h3', { className: 'cv-h3' }, t('cv.net.head')));
    const type = el('select', { className: 'cv-select', id: 'cv-net-type' }, el('option', { value: 'storm' }, t('cv.net.storm')), el('option', { value: 'sanitary' }, t('cv.net.sanitary')));
    type.value = n.type;
    type.addEventListener('change', () => project.change(t('cv.undo.net.type'), (st) => { st.network.type = type.value; }));
    const rule = (k, label, id, scale, unit) => numInput(fixed(n.rules[k] * scale, scale === 100 ? 2 : 2), (v) => { const x = Number(v); if (!(x >= 0) || v === '') return false; project.change(label, (st) => { st.network.rules[k] = x / scale; }); }, { id, min: 0 });
    out.push(el('div', { className: 'cv-props' },
      ...row(t('cv.net.type'), type, 'cv-net-type'),
      ...row(t('cv.net.minslope'), el('div', { className: 'cv-row' }, rule('minSlope', t('cv.net.minslope'), 'cv-net-slope', 100), el('span', { className: 'cv-unit' }, '%')), 'cv-net-slope'),
      ...row(t('cv.net.mincover'), el('div', { className: 'cv-row' }, rule('minCover', t('cv.net.mincover'), 'cv-net-cover', 1), el('span', { className: 'cv-unit' }, U.short)), 'cv-net-cover'),
      ...row(t('cv.net.mindrop'), el('div', { className: 'cv-row' }, rule('minDrop', t('cv.net.mindrop'), 'cv-net-drop', 1), el('span', { className: 'cv-unit' }, U.short)), 'cv-net-drop')));
    out.push(el('p', { className: 'cv-note' }, t('cv.net.note')));
    out.push(el('p', { className: 'cv-note' }, t('cv.net.count', { structures: t('cv.net.structures', { n: n.structures.length }), pipes: t('cv.net.pipes', { n: n.pipes.length }) })));
    const probs = chk?.problems || [];
    out.push(probs.length ? el('div', { className: 'cv-report is-error', 'data-net-problems': '' }, el('ul', {}, ...probs.slice(0, 40).map((p) => el('li', {}, p.id ? el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => { sel = { kind: p.kind === 'pipe' ? 'pipe' : 'structure', id: p.id }; refresh(); } }, p.msg) : p.msg)))) : el('p', { className: 'cv-note', 'data-net-ok': '' }, t('cv.net.ok')));
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-auto-inverts': '', onclick: () => setInverts(null) }, t('cv.net.auto'))));
    out.push(...(n.type === 'sanitary' ? seUi.block() : drUi.block()));   // 0.4 V19/V20 storm; 0.6 LC.16 S1 sanitary design flows
    out.push(...stUi.block());   // 0.6 WL.27: structure types
    return out;
  }
  function setInverts(only) {
    const r = autoInverts(net(), project.pipeSurface(), units(), { only });
    project.change(t('cv.undo.net.inverts'), (st) => { st.network.pipes = r.pipes; });
    say(r.problems.length ? r.problems.join(' ') : t('cv.net.inverts.done'));
  }

  function structureProps(x) {
    ui.propsH.textContent = t('cv.st');
    const chk = project.networkCheck(), info = chk?.structs.get(x.id), U = u(), out = [];
    const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-st-name', value: x.name, maxLength: 60 });
    nm.addEventListener('change', () => project.change(t('cv.undo.st.rename'), () => { findStruct(x.id).name = nm.value.trim().slice(0, 60) || t('cv.st'); }));
    const rim = numInput(Number.isFinite(x.rim) ? fixed(x.rim, 2) : '', (v) => { if (v === '') { project.change(t('cv.undo.st.rim.surface'), () => { findStruct(x.id).rim = null; }); return; } const z = Number(v); if (!Number.isFinite(z)) return false; project.change(t('cv.undo.st.rim'), () => { findStruct(x.id).rim = z; }); }, { id: 'cv-st-rim' });
    rim.placeholder = info?.rim !== null && info?.rim !== undefined ? t('cv.st.rim.ph', { z: fixed(info.rim, 2) }) : t('cv.st.rim.off');
    const sump = numInput(x.sumpDepth || 0, (v) => { const z = Number(v); if (!(z >= 0)) return false; project.change(t('cv.st.sump'), () => { findStruct(x.id).sumpDepth = z; }); }, { id: 'cv-st-sump', min: 0 });
    const dia = numInput(x.dia, (v) => { const z = Number(v); if (!(z > 0)) return false; project.change(t('cv.undo.st.size'), () => { findStruct(x.id).dia = z; }); }, { id: 'cv-st-dia', min: 1 });
    if (x.type) { dia.disabled = true; dia.title = t('st.dia.typed'); }   // 0.6 WL.27: a type sets the size
    out.push(el('div', { className: 'cv-props' },
      ...row(t('fl.props.name'), nm, 'cv-st-name'),
      ...row(t('cv.st.rim'), el('div', { className: 'cv-row' }, rim, el('span', { className: 'cv-unit' }, U.short)), 'cv-st-rim'),
      ...row(t('cv.st.sump'), el('div', { className: 'cv-row' }, sump, el('span', { className: 'cv-unit' }, U.short)), 'cv-st-sump'),
      ...row(t('cv.diameter'), el('div', { className: 'cv-row' }, dia, el('span', { className: 'cv-unit' }, diaU().name)), 'cv-st-dia'),
      ...row(t('cv.st.rim.used'), info?.rim !== null && info?.rim !== undefined ? (info.rimFrom === 'surface' ? t('cv.st.rim.from', { z: fixed(info.rim, 2) }) : fixed(info.rim, 2)) : '—'),
      ...row(t('cv.st.sump.z'), info?.sump !== null && info?.sump !== undefined ? fixed(info.sump, 2) : '—'),
      ...row(t('pt.props.easting'), fixed(x.x, 2)), ...row(t('pt.props.northing'), fixed(x.y, 2))));
    out.push(el('p', { className: 'cv-note' }, t('cv.st.rim.note')));
    out.push(...stUi.structureRow(x));   // 0.6 WL.27
    const lines = [];
    for (const p of net().pipes) { if (p.to === x.id) lines.push(t('cv.st.in', { pipe: p.name, z: Number.isFinite(p.invDn) ? fixed(p.invDn, 2) : '—' })); if (p.from === x.id) lines.push(t('cv.st.out', { pipe: p.name, z: Number.isFinite(p.invUp) ? fixed(p.invUp, 2) : '—' })); }
    if (lines.length) out.push(el('ul', { className: 'cv-plainlist' }, ...lines.map((l) => el('li', {}, l))));
    const probs = (chk?.problems || []).filter((p) => p.id === x.id);
    if (probs.length) out.push(el('div', { className: 'cv-report is-error' }, el('ul', {}, ...probs.map((p) => el('li', {}, p.msg)))));
    out.push(...(net().type === 'sanitary' ? seUi.structureRows(x) : drUi.structureRows(x)));   // 0.4 V19/V20; 0.6 LC.16 S1
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    ui.props.replaceChildren(...out);
  }

  function pipeProps(p) {
    ui.propsH.textContent = t('dr.r.pipe');
    const chk = project.networkCheck(), info = chk?.pipes.get(p.id), U = u(), out = [];
    const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-pp-name', value: p.name, maxLength: 60 });
    nm.addEventListener('change', () => project.change(t('cv.undo.pp.rename'), () => { findPipe(p.id).name = nm.value.trim().slice(0, 60) || t('dr.r.pipe'); }));
    const dia = numInput(p.dia, (v) => { const z = Number(v); if (!(z > 0)) return false; project.change(t('cv.undo.pp.size'), () => { findPipe(p.id).dia = z; }); }, { id: 'cv-pp-dia', min: 1 });
    const inv = (k, label, id) => numInput(Number.isFinite(p[k]) ? fixed(p[k], 2) : '', (v) => { const z = Number(v); if (!Number.isFinite(z) || v === '') return false; project.change(label, () => { findPipe(p.id)[k] = z; }); }, { id });
    const a = findStruct(p.from), b = findStruct(p.to);
    out.push(el('div', { className: 'cv-props' },
      ...row(t('fl.props.name'), nm, 'cv-pp-name'),
      ...row(t('cv.pp.fromto'), (a?.name || '?') + ' → ' + (b?.name || '?')),
      ...row(t('cv.diameter'), el('div', { className: 'cv-row' }, dia, el('span', { className: 'cv-unit' }, diaU().name)), 'cv-pp-dia'),
      ...row(t('cv.pp.up'), el('div', { className: 'cv-row' }, inv('invUp', t('cv.pp.up'), 'cv-pp-up'), el('span', { className: 'cv-unit' }, U.short)), 'cv-pp-up'),
      ...row(t('cv.pp.dn'), el('div', { className: 'cv-row' }, inv('invDn', t('cv.pp.dn'), 'cv-pp-dn'), el('span', { className: 'cv-unit' }, U.short)), 'cv-pp-dn'),
      ...row(t('fl.props.length'), info ? fixed(info.len, 2) + ' ' + U.short : '—'),
      ...row(t('cv.pp.slope'), info?.slope !== null && info?.slope !== undefined ? pct(info.slope) : '—'),
      ...row(t('cv.net.mincover'), info?.cover !== null && info?.cover !== undefined ? fixed(info.cover, 2) + ' ' + U.short : '—')));
    const probs = (chk?.problems || []).filter((x) => x.id === p.id);
    out.push(probs.length ? el('div', { className: 'cv-report is-error' }, el('ul', {}, ...probs.map((x) => el('li', {}, x.msg)))) : el('p', { className: 'cv-note' }, t('cv.pp.ok')));
    out.push(...(net().type === 'sanitary' ? seUi.pipeRows(p) : drUi.pipeRows(p)));   // 0.4 V19/V20; 0.6 LC.16 S1
    out.push(el('div', { className: 'cv-actions' },
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => setInverts(new Set([p.id])) }, t('cv.pp.auto')),
      el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    ui.props.replaceChildren(...out);
  }

  /** 0.4 V2: one point, every field editable (point-edit.js); each change is one undo step. */
  function pointProps(p) {
    ui.propsH.textContent = t('cv.pt.head', { n: p.n });
    const commit = (field) => (v) => {
      const r = editPoint(project, p.n, { [field]: v });
      if (!r.ok) { if (r.message) say(r.message); return r.message ? false : undefined; }
      if (r.point.n !== p.n) picked = new Set([r.point.n]);
      say(r.message);
      return true;
    };
    const f = (field, value, opts) => numInput(value, commit(field), { ...opts, id: 'cv-pt-' + field, label: t('pt.props.' + opts.key), text: true, calc: ['x', 'y', 'z'].includes(field) });   // 0.6 DF.3: the number and description are words
    const grid = el('div', { className: 'cv-props', 'data-point-edit': '' },
      ...row(t('pt.props.number'), f('n', p.n, { key: 'number', width: '8rem' }), 'cv-pt-n'),
      ...row(t('pt.props.easting'), f('x', fixed(p.x, 3).replace(/,/g, ''), { key: 'easting' }), 'cv-pt-x'),
      ...row(t('pt.props.northing'), f('y', fixed(p.y, 3).replace(/,/g, ''), { key: 'northing' }), 'cv-pt-y'),
      ...row(t('pt.props.elev'), f('z', p.z === null ? '' : fixed(p.z, 3).replace(/,/g, ''), { key: 'elev' }), 'cv-pt-z'),
      ...row(t('pt.props.desc'), f('d', p.d || '', { key: 'desc' }), 'cv-pt-d'),
      ...row(t('pt.props.group'), project.keyOf()(p)), ...(codesUi.keyFor(p)?.label ? row(t('pt.props.key'), codesUi.keyFor(p).label) : []),
      // 0.5 WL.19: a point made from a block reference remembers it
      ...(p.blk ? row(t('pt.props.block'), el('span', { 'data-pt-block': '' }, t('pt.props.block.v', { block: p.blk.name, layer: p.blk.layer, handle: p.blk.handle }))) : []));
    for (const inp of grid.querySelectorAll('#cv-pt-z')) inp.placeholder = t('pt.props.elev.none');
    ui.props.replaceChildren(grid, el('p', { className: 'cv-note' }, t('pt.props.note')), pickNote());
  }
  function pickedProps() {
    const pts = pickedPoints(), zs = pts.filter((p) => p.z !== null).map((p) => p.z);
    ui.propsH.textContent = t('cv.pts.n', { n: pts.length, count: num(pts.length) });
    const dl = el('dl', { className: 'cv-dl', 'data-picked-info': '' });
    const keyOf = project.keyOf(), groups = [...new Set(pts.map(keyOf))];   // 0.4 V16: through the description keys
    fillDl(dl, [[t('cv.pk.selected'), num(pts.length)], [t('cv.pk.numbers'), numberSpan(pts)], [t('cv.sf.elevations'), zs.length ? t('cv.range', { a: fixed(Math.min(...zs), 2), b: fixed(Math.max(...zs), 2) }) : t('pt.props.elev.none')],
      [t('cv.pk.groups'), groups.slice(0, 6).join(', ') + (groups.length > 6 ? ' …' : '')]]);
    ui.props.replaceChildren(dl, pickNote());
  }
  const pickNote = () => el('p', { className: 'cv-note' }, t('cv.pk.note'));
  function numberSpan(pts) {
    const w = pts.map((p) => p.n).filter((n) => /^\d+$/.test(n)).map(Number).sort((a, b) => a - b);
    const other = pts.length - w.length;
    const span = w.length ? (w.length === 1 ? String(w[0]) : t('cv.range', { a: w[0], b: w[w.length - 1] })) : '', named = other ? t('cv.pk.named', { n: other }) : '';
    return span && named ? t('cv.pk.and', { a: span, b: named }) : span || named;
  }

  // ------------------------------------------------------------------ profile view
  function showProfile(on, alId) {
    if (on) secUi?.show(false);   // 0.4 V13: one bottom panel at a time
    ui.profPanel.hidden = !on;
    if (alId) ui.profAl.dataset.want = alId;
    updateTools();
    renderProfile();
    view.resize();
  }
  function profileAlignment() {
    const s = project.state;
    const want = sel?.kind === 'alignment' ? sel.id : ui.profAl.dataset.want || ui.profAl.value;
    return s.alignments.find((a) => a.id === want) || s.alignments[0] || null;
  }
  function renderProfile() {
    if (ui.profPanel.hidden) return;
    const s = project.state, a = profileAlignment();
    ui.profAl.replaceChildren(...s.alignments.map((x) => el('option', { value: x.id }, x.name)));
    ui.profAl.disabled = s.alignments.length < 2;
    if (!a) { pview.set(null); return; }
    ui.profAl.value = a.id;
    const al = project.alignment(a);
    if (!al.ok) { pview.set(null); return; }
    const pvis = pvDrag ? pvDrag.pvis : a.pvis;
    const prof = pvDrag ? pvDrag.prof : project.designProfile(a);
    // 0.5 WL.20: feature lines crossing it (and, within the set distance, running alongside), worked out again after every
    // edit — the labels follow the lines
    const ds = project.state.display;
    const features = ds.profFeatures ? project.memo('flprof:' + a.id, project.version + '|' + ds.profWithin, () => featureProfile(al, project.state.features || [], { within: ds.profWithin })) : [];
    ui.profFl.setAttribute('aria-pressed', String(!!ds.profFeatures));
    if (document.activeElement !== ui.profWithin) ui.profWithin.value = ds.profWithin ? String(ds.profWithin) : '';
    ui.profWithin.disabled = !ds.profFeatures;
    pview.set({ key: a.id + '|' + project.version, eg: project.egProfile(a), profile: prof, pvis, start: al.start, end: al.end, units: units(), sel: selPvi, hover: pvHover, cursor: profCursor,
      features, featSel: sel?.kind === 'feature' ? sel.id : null });
  }
  ui.profFl.addEventListener('click', () => { project.setDisplay('profFeatures', !project.state.display.profFeatures); renderProfile(); });
  ui.profWithin.addEventListener('change', () => {
    const v = Number(String(ui.profWithin.value).replace(',', '.'));
    if (ui.profWithin.value.trim() !== '' && (!Number.isFinite(v) || v < 0)) { say(t('pv.fl.within.bad')); ui.profWithin.value = project.state.display.profWithin || ''; return; }
    project.setDisplay('profWithin', ui.profWithin.value.trim() === '' ? 0 : v);
    renderProfile();
  });
  let pvHover = -1;
  ui.profAl.addEventListener('change', () => { ui.profAl.dataset.want = ui.profAl.value; sel = { kind: 'alignment', id: ui.profAl.value }; selPvi = -1; refresh(); });
  ui.profClose.addEventListener('click', () => showProfile(false));
  ui.pviAdd.addEventListener('click', () => setPviAdd(ui.pviAdd.getAttribute('aria-pressed') !== 'true'));
  function setPviAdd(on) { ui.pviAdd.setAttribute('aria-pressed', String(on)); if (on) say(t('cv.pvi.add.hint')); }

  ui.prof.addEventListener('pointerdown', (e) => {
    const a = profileAlignment(); if (!a || !pview.data) return;
    ui.prof.focus({ preventScroll: true });
    const r = ui.prof.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
    const hit = pview.hitPvi(sx, sy);
    const fl = hit < 0 ? pview.hitFeature(sx, sy) : null;   // 0.5 WL.20: a feature line's crossing mark selects it
    if (fl) { flUi.find(fl) && (sel = { kind: 'feature', id: fl }, selPvi = -1, picked.clear(), refresh()); return; }
    if (hit >= 0) {
      selPvi = hit; sel = { kind: 'alignment', id: a.id };
      pvDrag = { id: a.id, i: hit, pvis: a.pvis.map((v) => ({ ...v })), prof: project.designProfile(a), moved: false, x0: sx, y0: sy };
      ui.prof.setPointerCapture(e.pointerId);
      renderProps(); renderProfile();
      return;
    }
    if (ui.pviAdd.getAttribute('aria-pressed') === 'true') {
      const al = project.alignment(a); const d = pview.toData(sx, sy);
      const sta = Math.max(al.start, Math.min(al.end, Number(d.sta.toFixed(2)))), z = Number(d.z.toFixed(2));
      if (a.pvis.some((v) => Math.abs(v.sta - sta) < 0.01)) { say(t('cv.pvi.exists', { sta: formatStation(sta, units()) })); return; }
      project.change(t('cv.undo.pvi.add'), () => { const p = findAl(a.id).pvis; p.push({ sta, z, L: 0 }); p.sort((m, n) => m.sta - n.sta); });
      selPvi = findAl(a.id).pvis.findIndex((v) => v.sta === sta);
      renderProps(); renderProfile();
      say(t('cv.pvi.added', { sta: formatStation(sta, units()), z: fixed(z, 2) }));
    } else { selPvi = -1; renderProps(); renderProfile(); }
  });
  ui.prof.addEventListener('pointermove', (e) => {
    const a = profileAlignment(); if (!a || !pview.data) return;
    const r = ui.prof.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
    const d = pview.toData(sx, sy), al = project.alignment(a);
    if (pvDrag) {
      if (Math.hypot(sx - pvDrag.x0, sy - pvDrag.y0) > 2) pvDrag.moved = true;
      if (!pvDrag.moved) return;
      const v = pvDrag.pvis[pvDrag.i], prev = pvDrag.pvis[pvDrag.i - 1], next = pvDrag.pvis[pvDrag.i + 1];
      v.sta = Math.max(prev ? prev.sta + 0.01 : al.start, Math.min(next ? next.sta - 0.01 : al.end, Number(d.sta.toFixed(2))));
      v.z = Number(d.z.toFixed(2));
      pvDrag.prof = buildProfileLive(pvDrag.pvis);
      renderProfile();
      ui.profRead.textContent = t('cv.prof.read.pvi', { sta: formatStation(v.sta, units()), z: fixed(v.z, 2) });
      return;
    }
    const h = pview.hitPvi(sx, sy);
    if (h !== pvHover) { pvHover = h; renderProfile(); }
    const sta = Math.max(al.start, Math.min(al.end, d.sta));
    const egz = interpEg(project.egProfile(a), sta), prof = project.designProfile(a), fg = prof.ok ? prof.elevationAt(sta) : null;
    const read = [t('cv.read.sta', { sta: formatStation(sta, units()) })];
    if (egz !== null) read.push(t('cv.read.ground', { z: fixed(egz, 2) }));
    if (fg !== null) read.push(t('cv.read.design', { z: fixed(fg, 2) }), t('cv.read.grade', { g: pct(prof.gradeAt(sta)) }), t(fg - egz >= 0 ? 'cv.read.fill' : 'cv.read.cut', { d: fixed(Math.abs(fg - egz), 2) }));
    ui.profRead.textContent = read.join(' · ');
    profCursor = { id: a.id, sta };
    view.invalidate();
  });
  ui.prof.addEventListener('pointerleave', () => { profCursor = null; view.invalidate(); });
  ui.prof.addEventListener('pointerup', () => {
    if (!pvDrag) return;
    const d = pvDrag; pvDrag = null;
    if (d.moved) { project.change(t('cv.undo.pvi.move'), () => { findAl(d.id).pvis = d.pvis; }); selPvi = d.i; }
    renderProfile(); renderProps();
  });
  ui.prof.addEventListener('keydown', (e) => { if ((e.key === 'Delete' || e.key === 'Backspace') && selPvi >= 0) { e.preventDefault(); command('delete'); } });
  const buildProfileLive = (p) => buildProfile(p);
  function interpEg(eg, sta) {
    for (let i = 1; i < eg.length; i++) if (sta <= eg[i].sta) { const a = eg[i - 1], b = eg[i]; if (a.z === null || b.z === null) return null; return a.z + (b.z - a.z) * (sta - a.sta) / Math.max(b.sta - a.sta, 1e-12); }
    return null;
  }

  // ------------------------------------------------------------------ tools and commands
  const TOOL_HINT = {   // language keys, looked up when the tool is chosen
    feature: 'fl.tool.hint',   // 0.4 V14
    alignment: 'cv.hint.alignment',
    pad: 'cv.hint.pad',
    breakline: 'cv.hint.breakline',
    boundary: 'cv.hint.boundary',
    pipe: 'cv.hint.pipe',
    catchment: 'dr.hint',   // 0.4 V19
    parcel: 'pc.hint',   // 0.4 V21
    paste: 'cv.hint.paste',
  };
  function setTool(tl) {
    if (tl !== tool) { draft = []; flMid = null; if (tl !== 'feature') flArc = false; }
    if (tl !== 'paste') pasteJob = null;
    tool = tl;
    ui.toolhint.hidden = !TOOL_HINT[tl];
    ui.toolhint.textContent = TOOL_HINT[tl] ? t(TOOL_HINT[tl]) : '';
    if ((tl === 'breakline' || tl === 'boundary' || tl === 'pad') && !eg().surface) say(t('cv.surface.need'));
    updateTools();
    view.invalidate();
  }

  async function command(c) {
    switch (c) {
      case 'new': if (await confirmDiscard()) { project = new Project(); projectTarget = null; rebind(); sel = null; selPvi = -1; lastReport = null; refresh(); view.fit(null); say(t('cv.new.done')); } break;
      case 'open': if (fileHost.kind === 'desktop') await openHostFiles(await fileHost.openFile({ types: OPEN_TYPES, multiple: true })); else ui.file.click(); break;
      case 'save': await saveProject(); break;
      case 'landxml': exportLandXml(); break;
      case 'dxf': exportDxf(); break;
      case 'dwg': dwgDialog(); break;
      case 'pdf': plotDialog(); break;
      case 'select': setTool('select'); break;
      case 'alignment': case 'pad': case 'breakline': case 'boundary': case 'pipe': case 'feature': if (is3D()) await show3D(false); setTool(tool === c ? 'select' : c); break;
      case 'profile': showProfile(ui.profPanel.hidden); break;
      case 'sections': secUi.toggle(); break;   // 0.4 V13
      case 'grades': {   // 0.5 WL.21: the grade and elevation overlay (screen only), from E or Display
        const on = !project.state.display.gradeOverlay;
        project.setDisplay('gradeOverlay', on);
        say(t(on ? ((project.state.features || []).length ? 'fl.grades.on' : 'fl.grades.none') : 'fl.grades.off'));
        break;
      }
      case 'undo': { const l = project.undo(); say(l ? t('cv.undo.done', { what: l }) : t('cv.undo.none')); break; }
      case 'redo': { const l = project.redo(); say(l ? t('cv.redo.done', { what: l }) : t('cv.redo.none')); break; }
      case 'delete': deleteSelected(); break;
      case 'copy': copyPoints(false); break;
      case 'cut': copyPoints(true); break;
      case 'paste': await pasteFromButton(false); break;
      case 'paste-in-place': await pasteFromButton(true); break;
      case 'duplicate': duplicatePoints(); break;
      case 'select-all': selectAll(); break;
      case 'select-none': selectNone(); break;
      case 'fit': if (is3D()) view3d.view.fit(); else fitAll(); break;
      case 'view3d': await show3D(!is3D()); break;
      default:
        if (GIS_CMDS.has(c) || gisReg.commands.has(c)) { try { await gisLoad(); } catch { break; } await gisReg.commands.get(c)?.(); }
        break;
    }
  }
  root.querySelectorAll('[data-cmd]').forEach((b) => b.addEventListener('click', () => { closeMenus(); command(b.dataset.cmd); }));
  function closeMenus() { for (const d of root.querySelectorAll('details.cv-menu[open]')) d.open = false; }
  document.addEventListener('click', (e) => { for (const d of root.querySelectorAll('details.cv-menu[open]')) if (!d.contains(e.target)) d.open = false; });
  for (const d of root.querySelectorAll('details.cv-menu')) d.addEventListener('toggle', () => { if (d.open) updateTools(); });

  function deleteSelected() {
    const a = selAl();
    if (a && selPvi >= 0 && selPvi < a.pvis.length) { const i = selPvi; project.change(t('cv.undo.pvi.delete'), () => { findAl(a.id).pvis.splice(i, 1); }); selPvi = -1; say(t('cv.pvi.deleted')); return; }
    if (a) { project.change(t('cv.undo.al.delete'), (s) => { s.alignments = s.alignments.filter((x) => x.id !== a.id); }); sel = null; refresh(); say(t('fl.deleted', { name: a.name })); return; }
    const d = selPad();
    if (d) { project.change(t('cv.undo.pad.delete'), (s) => { s.pads = s.pads.filter((x) => x.id !== d.id); }); sel = null; refresh(); say(t('fl.deleted', { name: d.name })); return; }
    const st = selStruct();
    if (st) { project.change(t('cv.undo.st.delete'), (s) => { s.network.structures = s.network.structures.filter((x) => x.id !== st.id); s.network.pipes = s.network.pipes.filter((p) => p.from !== st.id && p.to !== st.id); }); sel = null; refresh(); say(t('cv.st.deleted', { name: st.name })); return; }
    if (sel?.kind === 'feature' && flUi.remove(sel.id)) { sel = null; refresh(); return; }   // 0.4 V14
    if (sel?.kind === 'catchment' && drUi.remove(sel.id)) { sel = null; refresh(); return; }   // 0.4 V19
    if (sel?.kind === 'parcel' && pcUi.remove(sel.id)) { sel = null; refresh(); return; }   // 0.4 V21
    if (sel?.kind === 'swept' && swUi.remove(sel.id)) { sel = null; refresh(); return; }   // 0.6 WL.28
    const pp = selPipe();
    if (pp) { project.change(t('cv.undo.pp.delete'), (s) => { s.network.pipes = s.network.pipes.filter((p) => p.id !== pp.id); }); sel = null; refresh(); say(t('fl.deleted', { name: pp.name })); return; }
    if (picked.size) { const n = picked.size; removePoints(t('cv.undo.pts.delete', { n, count: num(n) })); say(t('cv.pts.deleted', { n, count: num(n), surface: rebuilt() })); return; }
    say(t('cv.delete.none'));
  }

  // ------------------------------------------------------------------ survey points: select, copy, paste
  const rebuilt = () => (project.state.surface.tin ? t('cv.surface.tin.kept') : t('cv.surface.rebuilt'));   // a sentence, without a leading space
  const pickedPoints = () => project.points.filter((p) => picked.has(p.n));
  function selectAll() {
    if (!project.points.length) { say(t('cv.pts.none')); return; }
    if (tool !== 'select') setTool('select');
    picked = new Set(project.points.map((p) => p.n)); sel = null; selPvi = -1;
    refresh(); say(t('cv.pts.selected', { n: picked.size, count: num(picked.size) }));
  }
  function selectNone() {
    if (tool === 'paste') setTool('select');
    picked.clear(); sel = null; selPvi = -1; refresh();
  }
  function removePoints(label) {
    const gone = new Set(picked);
    project.editPoints(label, (pts) => pts.filter((p) => !gone.has(p.n)));
    picked.clear();
  }

  // The copy: in memory, and in localStorage so another tab of CivilCraft can paste it (read back as untrusted).
  const TAB = Math.random().toString(36).slice(2, 10);
  function storedClip() {
    try { return readClip(JSON.parse(localStorage.getItem('civilcraft.clipboard') || 'null')); } catch { return null; }
  }
  /** The newest of this tab's copy and the one another tab stored. */
  function ownClip() {
    const st = storedClip();
    if (!clip) return st;
    return st && st.at > clip.at ? st : clip;
  }
  /** Copy (or cut) the selected points; returns the text for the system clipboard, or null. */
  function copyPoints(cut, { quiet = false } = {}) {
    const pts = pickedPoints();
    if (!pts.length) { say(project.points.length ? t(cut ? 'cv.cut.need' : 'cv.copy.need') : t(cut ? 'cv.cut.none' : 'cv.copy.none')); return null; }
    const c = makeClip(pts, { units: units(), order: settings.order, source: TAB });
    clip = readClip(c);
    let shared = true;
    try { localStorage.setItem('civilcraft.clipboard', JSON.stringify(c)); } catch { shared = false; }
    if (!quiet) navigator.clipboard?.writeText?.(c.csv).catch(() => {});
    if (cut) removePoints(t('cv.undo.pts.cut', { n: pts.length, count: num(pts.length) }));
    const msg = [t(cut ? 'cv.pts.cut.done' : 'cv.pts.copied', { n: pts.length, count: num(pts.length), order: settings.order.split('').join(',') })];
    if (cut) msg.push(rebuilt());
    msg.push(t('cv.pts.paste.how'));
    if (!shared) msg.push(t('cv.pts.noshare'));
    say(msg.join(' '));
    updateTools();
    return c.csv;
  }
  async function pasteFromButton(inPlace) {
    // a toolbar click has no paste event: ask the system clipboard (the browser may ask permission), else use our copy
    let text = null;
    if (navigator.clipboard?.readText) {
      try { text = await Promise.race([navigator.clipboard.readText(), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 4000))]); } catch { text = null; }
    }
    paste(inPlace, text);
  }
  /** Paste what choosePaste picks: CivilCraft's copy, or point rows copied elsewhere since. */
  function paste(inPlace, systemText) {
    const pick = choosePaste(ownClip(), systemText, settings.order);
    if (pick.kind === 'none') { say(pick.why); return; }
    const from = pick.kind === 'text' ? t('cv.paste.from.text') : t('cv.paste.from.clip');
    const note = pick.kind === 'clip' && pick.units !== units() ? ' ' + t(pick.units === 'm' ? 'cv.paste.units.m' : 'cv.paste.units.ft') : '';
    if (inPlace) { commitPaste(pick.points, 0, 0, 'Paste in place', from, note); return; }   // i18n-ignore: internal label (named through t() in commitPaste)
    startPlacing(pick.points, 'Paste', from, note);   // i18n-ignore: internal label
  }
  function duplicatePoints() {
    const pts = pickedPoints();
    if (!pts.length) { say(project.points.length ? t('cv.dup.need') : t('cv.dup.none')); return; }
    startPlacing(pts, 'Duplicate', t('cv.paste.from.dup'), '');   // i18n-ignore: internal label
  }
  function startPlacing(pts, label, from, note) {
    setTool('paste');
    pasteJob = { pts, anchor: centre(pts), label, from, note };
    say(t('cv.paste.follow', { n: pts.length, count: num(pts.length), from }) + note);
    view.invalidate();
  }
  function commitPaste(pts, dx, dy, label, from, note) {
    const moved = dx || dy ? moveBy(pts, dx, dy) : pts.map((p) => ({ ...p }));
    const r = renumber(moved, project.points, { mode: settings.renumber, start: settings.start });
    const kind = label === 'Duplicate' ? 'dup' : label === 'Paste in place' ? 'place' : 'paste';   // i18n-ignore: internal labels
    const counts = { n: pts.length, count: num(pts.length) };
    project.editPoints(t({ dup: 'cv.undo.duplicate', place: 'cv.undo.paste.place', paste: 'cv.undo.paste' }[kind], counts), (all) => all.concat(r.points));
    setTool('select');
    picked = new Set(r.points.map((p) => p.n)); sel = null; selPvi = -1;
    refresh();
    say(t({ dup: 'cv.dup.done', place: 'cv.paste.done.place', paste: 'cv.paste.done' }[kind], { ...counts, renumber: renumberText(r.changed, r.kept) }) + ' ' + rebuilt() + note);
  }

  function finishDraft() {
    const pts = draft.slice();
    draft = [];
    const s = project.state;
    if (tool === 'alignment') {
      if (pts.length < 2) { say(t('cv.al.need2')); return; }
      const R = DEFAULT_R[s.units];
      const pis = pts.map((p, i) => ({ x: p.x, y: p.y, r: i === 0 || i === pts.length - 1 ? 0 : fitRadius(pts, i, R) }));
      const id = project.nextId('a'), n = s.alignments.length + 1;
      project.change(t('cv.undo.al.draw'), (st) => st.alignments.push({ id, name: t('cv.al.name', { n }), start: 0, pis, pvis: [] }));
      sel = { kind: 'alignment', id }; selPvi = -1;
      setTool('select'); refresh();
      const al = project.alignment(findAl(id));
      say(t('cv.al.drawn', { n, len: fixed(al.length, 2), u: u().short, r: R }));
    } else if (tool === 'pad') {
      if (pts.length < 3) { say(t('cv.pad.need3')); return; }
      const c = pts.reduce((m, p) => ({ x: m.x + p.x / pts.length, y: m.y + p.y / pts.length }), { x: 0, y: 0 });
      const z0 = eg().surface?.elevationAt(c.x, c.y);
      const id = project.nextId('p'), n = s.pads.length + 1;
      project.change(t('cv.undo.pad.draw'), (st) => st.pads.push({ id, name: t('cv.pad.name', { n }), pts, z: Number(((z0 ?? 0)).toFixed(1)), cut: 2, fill: 3 }));
      sel = { kind: 'pad', id };
      setTool('select'); refresh();
      say(t('cv.pad.drawn', { n, z: fixed(z0 ?? 0, 1) }));
    } else if (tool === 'pipe') {
      if (pts.length < 2) { say(t('cv.pp.need2')); return; }
      const newPipes = new Set();
      project.change(t('cv.undo.pp.draw'), (st) => {
        if (!st.network) st.network = defaultNetwork(st.units);
        const N = st.network;
        const ids = pts.map((p) => {
          if (p.sid && N.structures.some((x) => x.id === p.sid)) return p.sid;
          const id = project.nextId('s');
          N.structures.push({ id, name: t('cv.st.name', { n: N.structures.length + 1 }), x: p.x, y: p.y, rim: null, sumpDepth: 0, dia: defaultStructDia(st.units) });
          return id;
        });
        for (let i = 0; i + 1 < ids.length; i++) {
          if (ids[i] === ids[i + 1]) continue;
          const id = project.nextId('q');
          N.pipes.push({ id, name: t('cv.pp.name', { n: N.pipes.length + 1 }), from: ids[i], to: ids[i + 1], dia: defaultPipeDia(st.units), invUp: null, invDn: null });
          newPipes.add(id);
        }
        const r = autoInverts(N, project.pipeSurface(), st.units, { only: newPipes });
        N.pipes = r.pipes;
      });
      setTool('select'); sel = null; refresh();
      const chk = project.networkCheck();
      const drawn = { pipes: t('cv.net.pipes', { n: newPipes.size }), dia: diaU().perUnit === 12 ? defaultPipeDia('ft') + '"' : defaultPipeDia('m') + ' mm' };
      say(chk.problems.length ? t('cv.pp.drawn.bad', { ...drawn, problems: t('cv.problems.n', { n: chk.problems.length }) }) : t('cv.pp.drawn.ok', drawn));
    } else if (tool === 'parcel') {   // 0.4 V21
      if (pcUi.finish(pts)) setTool('select');
      else draft = pts;
    } else if (tool === 'catchment') {   // 0.4 V19
      if (drUi.finish(pts)) setTool('select');
      else draft = pts;
    } else if (tool === 'feature') {   // 0.4 V14
      const closed = draftClosed;
      draftClosed = false;
      flMid = null;   // 0.6 WL.24: a curve point with no end is dropped
      if (flUi.finish(pts, closed)) setTool('select');
      else draft = pts;   // too few vertices: keep drawing
    } else if (tool === 'breakline') {
      if (pts.length < 2) { say(t('cv.bl.need2')); return; }
      const n = s.surface.breaklines.length + 1;
      project.change(t('cv.undo.bl.draw'), (st) => st.surface.breaklines.push({ name: t('cv.bl.name', { n }), pts: pts.map((p) => ({ x: p.x, y: p.y, z: p.z })) }));
      say(t('cv.bl.added', { n }));
    } else if (tool === 'boundary') {
      if (pts.length < 3) { say(t('cv.bnd.need3')); return; }
      project.change(t('cv.undo.bnd.draw'), (st) => { st.surface.boundary = pts.map((p) => ({ x: p.x, y: p.y })); });
      say(t('cv.bnd.set'));
    }
  }
  /** The default radius, or the largest whole radius whose curve fits half of each tangent. */
  function fitRadius(pts, i, R) {
    const a = pts[i - 1], b = pts[i], c = pts[i + 1];
    const d = Math.abs(normAng(Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x)));
    if (d < 1e-6 || d > Math.PI - 1e-3) return 0;
    const half = Math.min(Math.hypot(b.x - a.x, b.y - a.y), Math.hypot(c.x - b.x, c.y - b.y)) / 2;
    return Math.min(R, Math.floor(half / Math.tan(d / 2)));
  }

  // ------------------------------------------------------------------ plan pointer handling
  // Touch (0.4 S.8): two fingers pinch and pan; a finger gets 10 px of slack before a tap becomes a pan and 14 px round
  // grips; a long press (LONG_MS, no move) is Enter while drawing (finishes the line) and Shift+click in Select (adds
  // the survey point to the selection, or takes it out).
  const pointers = new Map();
  let pinch = null, spaceDown = false, longTimer = 0;
  const LONG_MS = 500;
  const slack = (e) => (e.pointerType === 'touch' ? 10 : 4);
  const gripR = () => (root.classList.contains('is-touch') ? 14 : 7);
  const local = (e) => { const r = ui.over.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const draftBar = $('[data-draftbar]');
  /** The draft bar shows while a line is being drawn on a touch screen. */
  function syncDraftBar() {
    const b = root.querySelector('[data-draftbar]');
    if (b) b.hidden = !(root.classList.contains('is-touch') && draft.length);
    const a = b?.querySelector('[data-draft-act="arc"]');
    if (a) { a.hidden = tool !== 'feature'; a.setAttribute('aria-pressed', String(flArc)); }   // 0.6 WL.24
  }
  draftBar?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-draft-act]');
    if (!b) return;
    const act = b.dataset.draftAct;
    if (act === 'finish' && draft.length) finishDraft();
    else if (act === 'arc') toggleFlArc();   // 0.6 WL.24
    else if (act === 'back' && flMid) flMid = null;
    else if (act === 'back' && draft.length) { draft.pop(); if (draft.length) delete draft[draft.length - 1].b; say(t('touch.back.done', { n: draft.length })); }
    else if (act === 'cancel') { draft = []; say(t('cv.cancelled')); }
    view.invalidate();
    syncDraftBar();
  });

  ui.over.addEventListener('contextmenu', (e) => e.preventDefault());
  ui.over.addEventListener('pointerdown', (e) => {
    ui.over.focus({ preventScroll: true });
    const s = local(e);
    pointers.set(e.pointerId, s);
    ui.over.setPointerCapture(e.pointerId);
    if (pointers.size === 2) {
      const [p, q] = [...pointers.values()];
      pinch = { d: Math.hypot(p.x - q.x, p.y - q.y), m: { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 } };
      drag = null; clearTimeout(longTimer); return;
    }
    const w = view.toWorld(s.x, s.y);
    clearTimeout(longTimer);
    if (e.pointerType === 'touch') {
      longTimer = setTimeout(() => {
        if (!drag || drag.moved || pinch || (drag.kind !== 'maybe' && drag.kind !== 'maybe-box')) return;
        const at = drag.s;
        drag = null;   // the lift that follows is not a tap
        navigator.vibrate?.(15);
        if (draft.length) { finishDraft(); syncDraftBar(); view.invalidate(); return; }   // = Enter
        if (tool === 'select') {   // = Shift+click
          const pt = nearestPoint(at, 14, false);
          if (pt) { if (picked.has(pt.n)) picked.delete(pt.n); else picked.add(pt.n); sel = null; selPvi = -1; refresh(); say(t('cv.pts.selected', { n: picked.size, count: num(picked.size) })); }
        }
      }, LONG_MS);
    }
    if ((e.button !== 0 && panButton(e.button)) || spaceDown) { drag = { kind: 'pan', s, last: s, moved: true }; ui.over.classList.add('is-panning'); return; }   // IP.3: the style's pan buttons (middle and right unless changed)
    if (e.button !== 0) return;   // a middle or right button the style took off panning does nothing
    if (tool === 'select') {
      const g = gripAt(s);
      if (g) { drag = { kind: 'grip', g, s, last: s, moved: false, orig: JSON.stringify(g.list[g.i]) }; return; }
      // 0.4 V2: the one selected survey point is a grip too — drag it to move it (one undo step on release)
      if (picked.size === 1 && !e.shiftKey && e.button === 0) {
        const pt = project.points.find((q) => picked.has(q.n));
        const q = pt && view.toScreen(pt.x, pt.y);
        if (q && Math.abs(q.x - s.x) <= gripR() && Math.abs(q.y - s.y) <= gripR()) { drag = { kind: 'point', pt, s, last: s, moved: false, at: { x: pt.x, y: pt.y } }; return; }
      }
    }
    // Shift+drag in Select draws a box that adds the survey points inside it (a Shift+click still clicks); 0.4 W2.7: a drag
    // that bends away from a straight line becomes a lasso (lasso-core.js), Space while dragging: window → crossing → fence
    drag = { kind: tool === 'select' && e.shiftKey && e.button === 0 ? 'maybe-box' : 'maybe', s, last: s, moved: false, w, shift: e.shiftKey, path: [s] };
  });
  ui.over.addEventListener('pointermove', (e) => {
    const s = local(e);
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, s);
    if (pinch && pointers.size === 2) {
      const [p, q] = [...pointers.values()];
      const d = Math.hypot(p.x - q.x, p.y - q.y), m = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
      view.panBy(m.x - pinch.m.x, m.y - pinch.m.y);
      if (pinch.d > 0 && d > 0) view.zoomAt(m.x, m.y, d / pinch.d);
      pinch = { d, m }; return;
    }
    cursor = view.toWorld(s.x, s.y);
    if (drag) {
      if (!drag.moved && Math.hypot(s.x - drag.s.x, s.y - drag.s.y) > slack(e)) { clearTimeout(longTimer); drag.moved = true; if (drag.kind === 'maybe') { drag.kind = 'pan'; ui.over.classList.add('is-panning'); } else if (drag.kind === 'maybe-box') drag.kind = 'box'; }
      if (drag.kind === 'pan' && drag.moved) { view.panBy(s.x - drag.last.x, s.y - drag.last.y); drag.last = s; }
      else if (drag.kind === 'box' || drag.kind === 'lasso') { drag.last = s; drag.path.push(s); lassoTrack(drag); }
      else if (drag.kind === 'grip' && drag.moved) { const g = drag.g; g.list[g.i].x = cursor.x; g.list[g.i].y = cursor.y; view.invalidateScene(); project.cache.clear(); }
      else if (drag.kind === 'point' && drag.moved) { drag.at = { x: cursor.x, y: cursor.y }; say(t('pt.drag', { n: drag.pt.n, e: fixed(cursor.x, 3), nn: fixed(cursor.y, 3) })); }
    }
    snapPt = tool === 'breakline' ? nearestPoint(s, 14, true) : null;
    hoverPt = tool === 'select' && !drag ? nearestPoint(s, 6, false) : null;
    updateStatus();
    view.invalidate();
  });
  const endPointer = (e) => {
    clearTimeout(longTimer);
    pointers.delete(e.pointerId);
    if (pinch) { if (pointers.size < 2) pinch = null; drag = null; return; }
    const d = drag; drag = null;
    ui.over.classList.remove('is-panning');
    if (!d || e.type === 'pointercancel') return;
    if (d.kind === 'grip') {
      if (d.moved) {
        const g = d.g, now = { ...g.list[g.i] };
        Object.assign(g.list[g.i], JSON.parse(d.orig));   // put back, then make the move one undo step
        project.change(g.label, () => { const l = g.get(); if (l && l[g.i]) Object.assign(l[g.i], { x: now.x, y: now.y }); });
      }
      return;
    }
    if (d.kind === 'point') {
      if (d.moved && !d.cancelled) { const r = movePoint(project, d.pt.n, d.at.x, d.at.y); if (r.message) say(r.message); }
      return;
    }
    if (d.kind === 'box') { boxSelect(d.s, d.last); return; }
    if (d.kind === 'lasso') { lassoPick(d.path, d.mode || 'window'); return; }
    if ((d.kind !== 'maybe' && d.kind !== 'maybe-box') || d.moved) return;
    click(d.w, d.s, d);
    syncDraftBar();
  };
  ui.over.addEventListener('pointerup', endPointer);
  ui.over.addEventListener('pointercancel', endPointer);
  ui.over.addEventListener('pointerleave', () => { cursor = null; updateStatus(); view.invalidate(); });
  ui.over.addEventListener('dblclick', (e) => { if (tool !== 'select' && draft.length) { e.preventDefault(); draft.pop(); finishDraft(); } });
  ui.over.addEventListener('wheel', (e) => {
    e.preventDefault();
    const s = local(e);
    view.zoomAt(s.x, s.y, Math.pow(1.0015, -e.deltaY * (e.deltaMode === 1 ? 16 : 1) * (e.ctrlKey ? 1 : wheelFactor())));   // IP.3: the style's wheel (a pinch stays as it is)
  }, { passive: false });

  function click(w, s, d = {}) {
    if (tool === 'paste' && pasteJob) {
      const j = pasteJob;
      commitPaste(j.pts, w.x - j.anchor.x, w.y - j.anchor.y, j.label, j.from, j.note);
      return;
    }
    if (tool === 'select') {
      if (d.shift) {
        // Shift+click adds a survey point to the selection, or takes it out
        const pt = nearestPoint(s, 8, false);
        if (pt) { if (picked.has(pt.n)) picked.delete(pt.n); else picked.add(pt.n); sel = null; selPvi = -1; refresh(); say(t('cv.pts.selected', { n: picked.size, count: num(picked.size) })); }
        return;
      }
      const hit = pickAt(s);
      picked.clear();
      if (hit?.kind === 'point') { picked.add(hit.p.n); sel = null; } else sel = hit;
      selPvi = -1;
      if (hit?.kind === 'alignment' && !ui.profPanel.hidden) ui.profAl.dataset.want = hit.id;
      refresh();
      return;
    }
    if (tool === 'feature') {   // 0.4 V14: a survey point's place and elevation, else the ground's (finish); the first vertex closes
      const p = nearestPoint(s, 10, true), at = p ? { x: p.x, y: p.y } : { x: w.x, y: w.y };
      if (flArc && draft.length && !flMid) { flMid = at; say(t('fl.arc.mid')); view.invalidate(); return; }   // 0.6 WL.24: a point on the curve
      const bendTo = (end) => { if (flMid) { const b = bulgeThrough(draft[draft.length - 1], flMid, end); if (b) draft[draft.length - 1].b = b; else delete draft[draft.length - 1].b; flMid = null; } };
      if (draft.length >= 3 || (flMid && draft.length >= 2)) { const q = view.toScreen(draft[0].x, draft[0].y); if (Math.hypot(q.x - s.x, q.y - s.y) < 8) { bendTo(draft[0]); draftClosed = true; finishDraft(); return; } }
      bendTo(at);
      draft.push(p ? { x: p.x, y: p.y, z: p.z, n: p.n } : { x: w.x, y: w.y });
      say(p ? t('fl.click.point', { n: p.n, z: fixed(p.z, 2) }) : t('fl.click.ground', { n: draft.length }));
      view.invalidate();
      return;
    }
    if (tool === 'breakline') {
      const p = nearestPoint(s, 14, true);
      if (!p) { say(t('cv.bl.click.need')); return; }
      if (draft.length && draft[draft.length - 1].n === p.n) return;
      draft.push({ x: p.x, y: p.y, z: p.z, n: p.n });
      say(t('cv.bl.click', { n: p.n, z: fixed(p.z, 2) }));
    } else if (tool === 'parcel') {   // 0.4 V21: a click near a survey point takes its place; the first corner again closes
      if (draft.length >= 3) { const q = view.toScreen(draft[0].x, draft[0].y); if (Math.hypot(q.x - s.x, q.y - s.y) < 8) { finishDraft(); return; } }
      const p = nearestPoint(s, 10, false);
      draft.push(p ? { x: p.x, y: p.y } : { x: w.x, y: w.y });
      say(p ? t('pc.click.point', { n: p.n, k: draft.length }) : t('pc.click', { k: draft.length }));
    } else if (tool === 'pipe') {
      const st = structAt(s);
      if (draft.length && st && draft[draft.length - 1].sid === st.id) return;
      draft.push(st ? { x: st.x, y: st.y, sid: st.id } : { x: w.x, y: w.y });
      say(st ? t('cv.pp.joined', { name: st.name }) : t('cv.pp.placed'));
    } else {
      if (draft.length && Math.hypot(view.toScreen(draft[draft.length - 1].x, draft[draft.length - 1].y).x - s.x, view.toScreen(draft[draft.length - 1].x, draft[draft.length - 1].y).y - s.y) < 3) return;
      draft.push({ x: w.x, y: w.y });
    }
    view.invalidate();
  }

  /** Add the survey points inside the screen rectangle a–b to the selection. */
  function boxSelect(a, b) {
    const p = view.toWorld(Math.min(a.x, b.x), Math.max(a.y, b.y)), q = view.toWorld(Math.max(a.x, b.x), Math.min(a.y, b.y));
    const x0 = Math.min(p.x, q.x), x1 = Math.max(p.x, q.x), y0 = Math.min(p.y, q.y), y1 = Math.max(p.y, q.y);
    let added = 0;
    for (const pt of project.points) if (pt.x >= x0 && pt.x <= x1 && pt.y >= y0 && pt.y <= y1 && !picked.has(pt.n)) { picked.add(pt.n); added++; }
    sel = null; selPvi = -1;
    refresh();
    view.invalidate();
    say(added ? t('cv.pts.box', { added: t('cv.pts.n', { n: added, count: num(added) }), total: t('cv.pts.n', { n: picked.size, count: num(picked.size) }) }) : t('cv.pts.box.none'));
  }

  // 0.4 W2.7: a Shift+drag stays a box while it runs close to the line from its start; once it bends more than 12 px off
  // that line it is a lasso. Its mode follows the first sideways move (right = window, left = crossing) until Space picks one.
  function lassoTrack(d) {
    if (d.kind === 'box') {
      const a = d.s, b = d.last, L = Math.hypot(b.x - a.x, b.y - a.y);
      const off = (q) => (L < 1 ? Math.hypot(q.x - a.x, q.y - a.y) : Math.abs((b.x - a.x) * (a.y - q.y) - (a.x - q.x) * (b.y - a.y)) / L);
      if (!d.path.some((q) => off(q) > 12)) return;
      d.kind = 'lasso';
    }
    if (!d.spaced) d.mode = lassoMode(d.s, d.path.find((q) => lassoMode(d.s, q)) || d.last) || d.mode || 'window';
    if (d.said !== d.mode) { d.said = d.mode; say(t('cv.lasso.' + d.mode)); }
  }
  function lassoPick(path, mode) {
    const z = view.zoom;
    const pts = thin(path, 2).map((q) => view.toWorld(q.x, q.y));
    const got = lassoPoints(project.points, pts, mode, 4 / z);
    let added = 0;
    for (const pt of got) if (!picked.has(pt.n)) { picked.add(pt.n); added++; }
    sel = null; selPvi = -1;
    refresh();
    view.invalidate();
    say(added ? t('cv.pts.box', { added: t('cv.pts.n', { n: added, count: num(added) }), total: t('cv.pts.n', { n: picked.size, count: num(picked.size) }) }) : t('cv.pts.lasso.none'));
  }

  function nearestPoint(s, px, needZ) {
    let best = null, bd = px;
    const vb = view.viewBounds();
    for (const p of project.points) {
      if (needZ && p.z === null) continue;
      if (p.x < vb.minX || p.x > vb.maxX || p.y < vb.minY || p.y > vb.maxY) continue;
      const q = view.toScreen(p.x, p.y), d = Math.hypot(q.x - s.x, q.y - s.y);
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }

  /** Grips of the selected alignment (PIs) or pad (corners) under screen point s. */
  function gripAt(s) {
    const a = selAl(), d = selPad();
    const R = gripR();
    const test = (list, label, get) => { for (let i = 0; i < list.length; i++) { const q = view.toScreen(list[i].x, list[i].y); if (Math.abs(q.x - s.x) <= R && Math.abs(q.y - s.y) <= R) return { list, i, label, get }; } return null; };
    if (a) return test(a.pis, t('cv.undo.pi.move'), () => findAl(a.id)?.pis);
    const fg = flUi.grip(sel);   // 0.4 V14: a feature line's vertices
    if (fg) return test(fg.list, fg.label, fg.get);
    if (d) return test(d.pts, t('cv.undo.pad.corner'), () => findPad(d.id)?.pts);
    const st = selStruct();
    if (st && test([st], '', null)) { const list = net().structures; return { list, i: list.indexOf(st), label: t('cv.undo.st.move'), get: () => net()?.structures }; }
    return null;
  }

  function structAt(s, px = 10) {
    let best = null, bd = px;
    for (const x of net()?.structures || []) { const q = view.toScreen(x.x, x.y); const d = Math.hypot(q.x - s.x, q.y - s.y); if (d < bd) { bd = d; best = x; } }
    return best;
  }
  function pickAt(s) {
    const w = view.toWorld(s.x, s.y), tol = 7 / view.zoom;
    const st = structAt(s);
    if (st) return { kind: 'structure', id: st.id };
    let best = null, bd = tol;
    for (const p of net()?.pipes || []) {
      const a = findStruct(p.from), b = findStruct(p.to);
      if (!a || !b) continue;
      const d = polyDist([a, b], w);
      if (d < bd) { bd = d; best = { kind: 'pipe', id: p.id }; }
    }
    for (const a of project.state.alignments) {
      const al = project.alignment(a);
      const line = al.ok ? al.polyline(Infinity, Math.PI / 90) : a.pis;
      const d = polyDist(line, w);
      if (d < bd) { bd = d; best = { kind: 'alignment', id: a.id }; }
    }
    const fh = flUi.pick(w, bd);   // 0.4 V14: a feature line nearer than anything so far
    if (fh) { best = fh; bd = 0; }
    for (const p of project.state.pads) {
      const d = pointInPoly(w.x, w.y, p.pts) ? 0 : polyDist([...p.pts, p.pts[0]], w);
      if ((d < bd || (d === 0 && !best)) && best?.kind !== 'feature') { bd = d; best = { kind: 'pad', id: p.id }; }
    }
    if (best) return best;
    const pt = nearestPoint(s, 6, false);
    if (pt) return { kind: 'point', p: pt };
    for (const f of gisReg.pick) { const h = f(w, tol); if (h) return h; }   // GIS: a feature of a GIS layer
    const area = drUi.pick(w) || pcUi.pick(w) || swUi.pick(w);   // 0.4 V19/V21: inside a catchment, else a parcel (anything nearer wins); 0.6 WL.28 a swept path
    if (area) return area;
    return null;
  }
  function polyDist(pts, p) {
    let d = Infinity;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
      const t = L ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L)) : 0;
      d = Math.min(d, Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t));
    }
    return d;
  }

  // ------------------------------------------------------------------ overlay
  function drawOverlay(ctx, v) {
    syncDraftBar();   // every change to the draft redraws the overlay, so the bar follows it here
    const C = v.colors;
    const S = (p) => v.toScreen(p.x, p.y);
    const path = (pts, close) => { ctx.beginPath(); pts.forEach((p, i) => { const q = S(p); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }); if (close) ctx.closePath(); };
    const grip = (p, hot) => { const q = S(p); ctx.fillStyle = hot ? C.action : C.bg; ctx.strokeStyle = C.action; ctx.lineWidth = 1.5; ctx.fillRect(q.x - 4.5, q.y - 4.5, 9, 9); ctx.strokeRect(q.x - 4.5, q.y - 4.5, 9, 9); };
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    drUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, sel);   // 0.4 V19/V20: catchments, flooded structures
    pcUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, sel);   // 0.4 V21: the selected parcel
    for (const f of gisReg.overlay) f(ctx, v, sel);   // GIS: the picked feature
    secUi.overlay(ctx, (x, y) => v.toScreen(x, y), C.action);   // 0.4 V13: the section on show
    if (project.state.display.gradeOverlay) flUi.gradeLayer(ctx, (x, y) => v.toScreen(x, y), C, sel, LABEL_FONT);   // 0.5 WL.21: screen only
    swUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, sel);   // 0.6 WL.28: the selected swept path, its vehicle where the slider is
    flUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, sel, LABEL_FONT);   // 0.4 V14: the selected feature line, its elevations and grades
    const a = selAl();
    if (a) {
      const al = project.alignment(a);
      ctx.strokeStyle = mix(C.action, C.bg, 0.25); ctx.lineWidth = 5; ctx.globalAlpha = 0.45;
      path(al.ok ? al.polyline(Infinity, Math.PI / 180) : a.pis); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.action; ctx.lineWidth = 1; ctx.setLineDash([5, 4]); path(a.pis); ctx.stroke(); ctx.setLineDash([]);
      a.pis.forEach((p) => grip(p, false));
    }
    const d = selPad();
    if (d) {
      ctx.strokeStyle = C.action; ctx.lineWidth = 3; ctx.globalAlpha = 0.5; path(d.pts, true); ctx.stroke(); ctx.globalAlpha = 1;
      d.pts.forEach((p) => grip(p, false));
    }
    const st = selStruct(), pp = selPipe();
    if (st) { const q = S(st); ctx.strokeStyle = C.action; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(q.x, q.y, 11, 0, Math.PI * 2); ctx.stroke(); grip(st, false); }
    if (pp) { const a = findStruct(pp.from), b = findStruct(pp.to); if (a && b) { ctx.strokeStyle = C.action; ctx.lineWidth = 6; ctx.globalAlpha = 0.45; path([a, b]); ctx.stroke(); ctx.globalAlpha = 1; } }
    if (picked.size) {
      const vb = v.viewBounds();
      ctx.strokeStyle = C.action; ctx.lineWidth = 2; ctx.beginPath();
      for (const p of project.points) {
        if (!picked.has(p.n) || p.x < vb.minX || p.x > vb.maxX || p.y < vb.minY || p.y > vb.maxY) continue;
        const q = S(p); ctx.moveTo(q.x + 5, q.y); ctx.arc(q.x, q.y, 5, 0, Math.PI * 2);
      }
      ctx.stroke();
    }
    if (drag?.kind === 'point' && drag.moved && !drag.cancelled) {
      const a = S(drag.pt), b = S(drag.at);
      ctx.strokeStyle = C.action; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]);
      ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.moveTo(b.x - 9, b.y); ctx.lineTo(b.x + 9, b.y); ctx.moveTo(b.x, b.y - 9); ctx.lineTo(b.x, b.y + 9); ctx.stroke();
    }
    if (hoverPt) {
      const q = S(hoverPt);
      ctx.strokeStyle = C.action; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(q.x, q.y, 7, 0, Math.PI * 2); ctx.stroke();
    }
    if (drag?.kind === 'lasso' && drag.path.length > 1) {   // window = solid, crossing = dashed green, fence = dashed orange path
      const m = drag.mode || 'window', col = m === 'crossing' ? C.green : m === 'fence' ? C.orange : C.action;
      ctx.save();
      ctx.beginPath(); ctx.moveTo(drag.path[0].x, drag.path[0].y); for (const q of drag.path.slice(1)) ctx.lineTo(q.x, q.y);
      if (m !== 'fence') { ctx.closePath(); ctx.fillStyle = col; ctx.globalAlpha = 0.1; ctx.fill(); ctx.globalAlpha = 1; }
      ctx.strokeStyle = col; ctx.lineWidth = m === 'fence' ? 1.5 : 1; ctx.setLineDash(m === 'window' ? [] : [5, 4]);
      ctx.stroke();
      ctx.restore();
    }
    if (drag?.kind === 'box') {
      const a = drag.s, b = drag.last;
      ctx.strokeStyle = C.action; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
      ctx.fillStyle = mix(C.action, C.bg, 0.88);
      ctx.globalAlpha = 0.5; ctx.fillRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y)); ctx.globalAlpha = 1;
      ctx.strokeRect(Math.min(a.x, b.x) + 0.5, Math.min(a.y, b.y) + 0.5, Math.abs(b.x - a.x), Math.abs(b.y - a.y));
      ctx.setLineDash([]);
    }
    if (tool === 'paste' && pasteJob && cursor) {
      // the carried points, as crosses, with the move from their own place shown by a thin line
      const j = pasteJob, dx = cursor.x - j.anchor.x, dy = cursor.y - j.anchor.y;
      const vb = v.viewBounds(), many = j.pts.length > 20000;
      ctx.strokeStyle = C.action; ctx.lineWidth = 1.5; ctx.beginPath();
      j.pts.forEach((p, i) => {
        if (many && i % Math.ceil(j.pts.length / 20000)) return;
        const x = p.x + dx, y = p.y + dy;
        if (x < vb.minX || x > vb.maxX || y < vb.minY || y > vb.maxY) return;
        const q = S({ x, y }); ctx.moveTo(q.x - 4, q.y); ctx.lineTo(q.x + 4, q.y); ctx.moveTo(q.x, q.y - 4); ctx.lineTo(q.x, q.y + 4);
      });
      ctx.stroke();
      const a = S(j.anchor), b = S(cursor);
      ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]);
    }
    if (profCursor) {
      const pa = findAl(profCursor.id), al = pa && project.alignment(pa);
      if (al?.ok) { const p = al.pointAt(profCursor.sta), q = S(p); ctx.fillStyle = C.action; ctx.beginPath(); ctx.arc(q.x, q.y, 5, 0, Math.PI * 2); ctx.fill(); }
    }
    if (tool !== 'select' && (draft.length || snapPt)) {
      const pts = cursor && tool !== 'breakline' ? [...draft, cursor] : snapPt ? [...draft, snapPt] : draft;
      ctx.strokeStyle = tool === 'parcel' ? C.ink2 : tool === 'catchment' ? C.cyan || C.blue : tool === 'pad' || tool === 'pipe' ? C.blue : tool === 'alignment' ? C.red : tool === 'boundary' ? C.ink2 : tool === 'feature' ? C.green || C.orange : C.orange;
      ctx.lineWidth = 2; ctx.setLineDash(tool === 'boundary' ? [7, 5] : []);
      if (tool === 'feature' && draft.length) {   // 0.6 WL.24: arcs drawn as arcs, the one being drawn through its curve point
        const dp = draft.map((p) => ({ ...p, z: 0 }));
        if (flMid && cursor) { const b = bulgeThrough(dp[dp.length - 1], flMid, cursor); if (b) dp[dp.length - 1].b = b; }
        if (cursor) dp.push({ x: cursor.x, y: cursor.y, z: 0 });
        path(flattenFl({ pts: dp, closed: false }), false); ctx.stroke();
        if (flMid) { const q = S(flMid); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q.x, q.y, 5, 0, Math.PI * 2); ctx.stroke(); }
      } else if (pts.length >= 2) { path(pts, (tool === 'pad' || tool === 'boundary' || tool === 'catchment' || tool === 'parcel') && pts.length >= 3); ctx.stroke(); }
      ctx.setLineDash([]);
      draft.forEach((p) => grip(p, true));
      if (snapPt) { const q = S(snapPt); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.strokeRect(q.x - 6, q.y - 6, 12, 12); }
      if (tool === 'alignment' && cursor && draft.length) {
        const last = draft[draft.length - 1], L = Math.hypot(cursor.x - last.x, cursor.y - last.y), q = S(cursor);
        ctx.font = '600 12px ' + 'Helvetica, Arial, sans-serif'; ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';   // i18n-ignore: a CSS font stack
        ctx.fillText(fixed(L, 2) + ' ' + u().short + '  ' + bearing(Math.atan2(cursor.y - last.y, cursor.x - last.x)), q.x + 12, q.y - 8);
      }
    }
  }

  // ------------------------------------------------------------------ status bar
  function updateStatus() {
    if (!cursor) { ui.coords.textContent = t('cv.status.en.none'); ui.elev.textContent = ''; ui.staoff.textContent = ''; for (const f of gisReg.status) f(null); return; }
    ui.coords.textContent = t('cv.status.en', { e: fixed(cursor.x, 2), n: fixed(cursor.y, 2) });
    for (const f of gisReg.status) f(cursor);
    const z = eg().surface?.elevationAt(cursor.x, cursor.y);
    const g = graded().surface, zf = g ? g.elevationAt(cursor.x, cursor.y) : null;
    ui.elev.textContent = (z !== null && z !== undefined ? t('cv.read.ground', { z: fixed(z, 2) }) : t('cv.status.off')) + (zf !== null && zf !== undefined && Math.abs(zf - z) > 1e-6 ? ' · ' + t('cv.status.graded', { z: fixed(zf, 2) }) : '');
    let a = selAl();
    if (!a) {
      let bd = Infinity;
      for (const x of project.state.alignments) { const al = project.alignment(x); if (!al.ok) continue; const so = al.stationOffset(cursor.x, cursor.y); if (so && so.dist < bd) { bd = so.dist; a = x; } }
    }
    const al = a && project.alignment(a);
    const so = al?.ok ? al.stationOffset(cursor.x, cursor.y) : null;
    ui.staoff.textContent = so ? t(so.outside ? 'cv.status.staoff.out' : 'cv.status.staoff', { name: a.name, sta: formatStation(so.sta, units()), off: fixed(Math.abs(so.off), 2), side: t(so.off >= 0 ? 'cv.side.r' : 'cv.side.l') }) : '';
  }
  let sayTimer = 0;
  function say(msg) { ui.status.textContent = msg; clearTimeout(sayTimer); sayTimer = setTimeout(() => { if (ui.status.textContent === msg) ui.status.textContent = ''; }, 12000); }

  // ------------------------------------------------------------------ keyboard
  const typing = (t) => t && (t.matches?.('select, textarea, input:not([type=checkbox]):not([type=radio]):not([type=button])') || t.isContentEditable);
  window.addEventListener('keydown', (e) => {
    if ((drag?.kind === 'box' || drag?.kind === 'lasso') && (e.key === ' ' || e.key === 'Escape')) {   // 0.4 W2.7
      e.preventDefault();
      if (e.key === 'Escape') { drag = null; view.invalidate(); say(t('cv.cancelled')); return; }
      if (drag.kind === 'box') { drag.kind = 'lasso'; drag.mode = 'window'; } else drag.mode = nextMode(drag.mode || 'window');
      drag.spaced = true; drag.said = drag.mode; say(t('cv.lasso.' + drag.mode)); view.invalidate();
      return;
    }
    if (e.key === ' ' && !typing(e.target)) spaceDown = true;
    if (root.querySelector('dialog[open]')) return;
    const k = e.key, ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && !e.altKey && !typing(e.target) && k.toLowerCase() === 'v') { armClip('paste', e.shiftKey); return; }   // the paste event does the rest
    if (ctrl && !e.shiftKey && !e.altKey) {
      const m = { z: 'undo', y: 'redo', s: 'save', o: 'open', p: 'pdf' }[k.toLowerCase()];
      if (m && !(typing(e.target) && (k === 'z' || k === 'y'))) { e.preventDefault(); command(m); return; }
      if (typing(e.target)) return;
      const lk = k.toLowerCase();
      if (lk === 'a') { e.preventDefault(); selectAll(); }
      else if (lk === 'd') { e.preventDefault(); duplicatePoints(); }
      else if ((lk === 'c' || lk === 'x') && !hasTextSelection()) armClip(lk === 'c' ? 'copy' : 'cut');   // the copy/cut event does the rest
      return;
    }
    if (typing(e.target) || e.altKey) return;
    if (k === 'Escape') {
      if (drag?.kind === 'point') { drag.cancelled = true; view.invalidate(); say(t('pt.drag.cancel')); return; }   // 0.4 V2
      if (root.querySelector('details.cv-menu[open]')) { closeMenus(); return; }
      if (tool === 'paste') { setTool('select'); say(t('cv.paste.cancelled')); return; }
      if (draft.length) { draft = []; flMid = null; view.invalidate(); say(t('cv.cancelled')); } else { setTool('select'); if (sel || picked.size || selPvi >= 0) { sel = null; selPvi = -1; picked.clear(); refresh(); } }
      return;
    }
    if (k === 'Enter' && tool === 'paste' && pasteJob) { e.preventDefault(); const j = pasteJob; commitPaste(j.pts, 0, 0, j.label === 'Paste' ? 'Paste in place' : j.label, j.from, j.note); return; }   // i18n-ignore: internal labels
    if (k === 'Enter' && draft.length) { e.preventDefault(); finishDraft(); return; }
    if (k === 'Backspace' && flMid) { e.preventDefault(); flMid = null; view.invalidate(); return; }   // 0.6 WL.24: the curve point first
    if (k === 'Backspace' && draft.length) { e.preventDefault(); draft.pop(); if (draft.length) delete draft[draft.length - 1].b; view.invalidate(); return; }
    if (k.toLowerCase() === 'c' && tool === 'feature' && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); toggleFlArc(); return; }   // 0.6 WL.24
    if (k === 'Delete' || (k === 'Backspace' && e.target === ui.prof)) { e.preventDefault(); command('delete'); return; }
    const keyCmd = { v: 'select', a: 'alignment', g: 'pad', p: 'pipe', b: 'breakline', o: 'boundary', r: 'profile', f: 'fit', d: 'view3d', x: 'sections', l: 'feature', e: 'grades' }[k.toLowerCase()];
    if (keyCmd && !e.shiftKey) { e.preventDefault(); command(keyCmd); return; }
    if (k.toLowerCase() === 'i') { if (ui.profPanel.hidden) showProfile(true); setPviAdd(ui.pviAdd.getAttribute('aria-pressed') !== 'true'); return; }
    if (e.target === ui.over) {
      const step = 60;
      const pan = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[k];
      if (pan) { e.preventDefault(); view.panBy(...pan); return; }
      if (k === '+' || k === '=') { e.preventDefault(); view.zoomAt(view.w / 2, view.h / 2, 1.25); return; }
      if (k === '-' || k === '_') { e.preventDefault(); view.zoomAt(view.w / 2, view.h / 2, 0.8); return; }
    }
  });
  window.addEventListener('keyup', (e) => { if (e.key === ' ') spaceDown = false; });

  // Ctrl+C / Ctrl+X / Ctrl+V reach us as the browser's copy, cut and paste events, which can put text on (and read
  // text from) the system clipboard without asking. The key arms the operation (Ctrl+Shift+V = in place); if no event
  // follows, it runs as the toolbar button does (the async clipboard API, else CivilCraft's own copy).
  let pendingClip = null;
  const hasTextSelection = () => { const t = window.getSelection?.(); return !!t && !t.isCollapsed && t.toString().trim() !== ''; };
  function armClip(op, inPlace = false) {
    clearTimeout(pendingClip?.timer);
    const job = { op, inPlace };
    job.timer = setTimeout(() => { if (pendingClip !== job) return; pendingClip = null; if (op === 'paste') pasteFromButton(inPlace); else copyPoints(op === 'cut'); }, 150);
    pendingClip = job;
  }
  function clipEvent(e, op) {
    const p = pendingClip;
    if (p) { clearTimeout(p.timer); pendingClip = null; }
    if (typing(e.target) || root.querySelector('dialog[open]') || settingsDlg?.open || document.querySelector('[data-help-panel]')?.contains(e.target)) return;
    if (op === 'paste') {
      e.preventDefault();
      paste(p?.op === 'paste' ? p.inPlace : false, e.clipboardData ? e.clipboardData.getData('text/plain') : null);
      return;
    }
    if (hasTextSelection()) return;                // text selected on the page: the browser copies it
    if (!p && !picked.size) return;                // the browser's own Copy menu with no points selected
    const csv = copyPoints(op === 'cut', { quiet: true });
    if (csv && e.clipboardData) { e.clipboardData.setData('text/plain', csv); e.preventDefault(); }
    else if (csv) navigator.clipboard?.writeText?.(csv).catch(() => {});
  }
  document.addEventListener('copy', (e) => clipEvent(e, 'copy'));
  document.addEventListener('cut', (e) => clipEvent(e, 'cut'));
  document.addEventListener('paste', (e) => clipEvent(e, 'paste'));

  // ------------------------------------------------------------------ left panel inputs
  ui.name.addEventListener('change', () => project.change(t('cv.undo.project.rename'), (s) => { s.name = ui.name.value.trim().slice(0, 120) || t('project.untitled'); }));
  ui.units.addEventListener('change', () => { project.change(t('cv.undo.units'), (s) => { s.units = ui.units.value === 'm' ? 'm' : 'ft'; }); say(t('cv.units.now', { units: u().name.toLowerCase() })); });
  ui.maxEdge.addEventListener('change', () => { const v = Number(ui.maxEdge.value); if (!(v >= 0)) { ui.maxEdge.setAttribute('aria-invalid', 'true'); return; } ui.maxEdge.removeAttribute('aria-invalid'); project.change(t('cv.undo.maxedge'), (s) => { s.surface.maxEdge = v; }); });
  ui.showSurface.addEventListener('change', () => project.setDisplay('surface', ui.showSurface.value));
  ui.interval.addEventListener('change', () => project.setDisplay('interval', Number(ui.interval.value)));
  ui.major.addEventListener('change', () => project.setDisplay('major', Number(ui.major.value)));
  ui.bandCount.addEventListener('change', () => project.setDisplay('bandCount', Number(ui.bandCount.value)));
  ui.checks.addEventListener('change', (e) => { const c = e.target.closest('[data-show]'); if (c) project.setDisplay(c.dataset.show, c.checked); });

  // ------------------------------------------------------------------ files
  // Through the host adapter (host.js, W2.19): on the desktop Open is the native dialog, a double-clicked file opens at
  // launch or while running, and Save writes the project file it was opened from (else asks where); in the browser Open
  // is the same input as before and Save a download.
  const fileHost = getHost({ app: 'civilcraft' });
  const OPEN_TYPES = [{ description: 'CivilCraft, LandXML, points, GIS, DWG, DXF', extensions: ['.json', '.xml', '.landxml', '.csv', '.txt', '.pnezd', '.geojson', '.kml', '.kmz', '.shp', '.dbf', '.prj', '.gpkg', '.las', '.laz', '.tif', '.tiff', '.asc', '.dwg', '.dxf'] }];   // i18n-ignore: OS file types
  const PROJECT_TYPES = [{ description: 'CivilCraft project', extensions: ['.json'] }];   // i18n-ignore: an OS file type
  let projectTarget = null;   // the HostFile a project was opened from (desktop: Save writes it in place)
  let openingFrom = null;     // the HostFile being opened right now (openProject keeps it as projectTarget)
  async function openHostFiles(hfs) {
    if (!hfs || !hfs.length) return;
    const fs = [];
    for (const hf of hfs) { const b = await hf.file(); fs.push(typeof File !== 'undefined' && b instanceof File ? b : new File([b], hf.name, { lastModified: hf.lastModified || Date.now() })); }
    if (await gisOpen(fs)) return;
    openingFrom = hfs[0];
    try { await openFile(fs[0]); } finally { openingFrom = null; }
  }
  autosave.offer({ onRecover: async (rec) => {
    if (typeof rec.data !== 'string') throw new Error(t('recover.failed'));
    await openProject(rec.data, rec.meta?.name || 'project.civilcraft.json');
    project.saved = -1;   // recovered work is unsaved until it is saved to a file
    asDoc?.changed();
    refresh();
    say(t('recover.done', { file: rec.meta?.name || 'project.civilcraft.json', n: rec.meta?.points || 0 }));
  } });
  fileHost.onOpenFiles((files) => openHostFiles(files));
  fileHost.launchFiles().then((files) => openHostFiles(files));
  // Studio Live from a link (#live=<code> on a host's LAN page, ?live=<ROOM>#<secret> from an invite): join; the project comes from the host
  if (/[#&]live=|[?&]live=/.test(location.hash + location.search)) import('./live.js').then((m) => m.joinFromPage(window.civilcraft, fileHost), (err) => say(err.message));

  // ---- Assistants and scripts (0.4 X.12; civil-agent.js, AGENTS-SPEC §5.2/§6.3/§7): the open site through host.control —
  // describe it, list points, surface elevations, stations and offsets (read), select points (edit: the selection only).
  // Settings › CivilCraft › Assistants turns them on; a banner at the top of the right panel says while one is connected.
  for (const def of civilTools({
    project: () => project,
    select: (nums, mode) => {
      if (mode === 'replace') picked = new Set(nums); else for (const n of nums) { if (mode === 'add') picked.add(n); else picked.delete(n); }
      sel = null; selPvi = -1; refresh(); view.invalidate();
      say(t('cv.pts.selected', { n: picked.size, count: num(picked.size) }));
      return picked.size;
    },
  })) fileHost.control.tool(def);
  function applyAssist() {
    fileHost.control.configure({ enabled: settings.assistants.enabled, groups: settings.assistants.groups });
    renderAssist();
  }
  function renderAssist() {
    const c = fileHost.control, on = c.sessions(), ban = root.querySelector('[data-assist-banner]');
    if (ban) {
      ban.hidden = !c.enabled || !on.length;
      const who = on.length ? on[on.length - 1].client?.name || t('set.assist.activity.someone') : '';
      ban.querySelector('p').textContent = on.length ? t(c.groups.includes('edit') ? 'assist.banner.edit' : 'assist.banner.read', { client: who }) : '';
    }
    const list = settingsDlg?.querySelector('[data-cv-assist-log] ol');
    if (list && settingsDlg.open) {
      const rows = c.log.slice(-50).reverse();
      list.replaceChildren(...(rows.length ? rows.map((e) => el('li', {}, t('set.assist.activity.row', { time: new Date(e.time).toLocaleTimeString(), client: e.client || t('set.assist.activity.someone'), tool: e.tool, outcome: e.outcome })))
        : [el('li', { className: 'cv-muted' }, t('set.assist.activity.none'))]));
    }
  }
  root.querySelector('[data-assist-disconnect]')?.addEventListener('click', () => { fileHost.control.disconnect(); renderAssist(); say(t('assist.disconnected')); });
  fileHost.control.on('change', () => renderAssist());
  fileHost.control.configure({
    title: 'CivilCraft', enabled: settings.assistants.enabled, groups: settings.assistants.groups,   // i18n-ignore: the product name
    info: () => ({ site: project.state.name, points: project.points.length, unsaved: unsaved() }),
    busy: () => (draft.length ? 'drawing on the plan' : tool === 'paste' ? 'pasting points' : null),   // i18n-ignore: read by the assistant
  });
  window.civilcraftControl = fileHost.control;   // for tests and the console
  renderAssist();
  ui.file.addEventListener('change', async () => { const fs = [...ui.file.files]; ui.file.value = ''; if (fs.length && !(await gisOpen(fs))) openFile(fs[0]); });
  let dragDepth = 0;
  ui.plan.addEventListener('dragenter', (e) => { if ([...(e.dataTransfer?.types || [])].includes('Files')) { e.preventDefault(); dragDepth++; ui.drop.hidden = false; } });
  ui.plan.addEventListener('dragover', (e) => { if ([...(e.dataTransfer?.types || [])].includes('Files')) e.preventDefault(); });
  ui.plan.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; ui.drop.hidden = true; } });
  ui.plan.addEventListener('drop', (e) => { e.preventDefault(); dragDepth = 0; ui.drop.hidden = true; const fs = [...e.dataTransfer.files]; if (fs.length) gisOpen(fs).then((done) => { if (!done) openFile(fs[0]); }); });
  $('[data-sample]').addEventListener('click', async () => {
    try {
      const r = await fetch(new URL('./sample-site.csv', import.meta.url));
      if (!r.ok) throw new Error('HTTP ' + r.status);
      openText(await r.text(), 'sample-site.csv');
    } catch (err) { say(t('cv.sample.noload', { why: err.message })); }
  });

  async function openFile(f) {
    if (f.size > 200 * 1024 * 1024) { say(t('cv.file.toobig')); return; }
    busy(t('cad.ui.reading', { file: f.name }));
    try { openText(await f.text(), f.name); } catch (err) { say(t('cad.ui.read.failed', { file: f.name, why: err.message })); } finally { busy(null); }
  }

  async function openText(text, name) {
    const ext = (name.match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();
    const head = text.slice(0, 400).trimStart();
    if (ext === 'json' || head.startsWith('{')) return openProject(text, name);
    if (ext === 'xml' || ext === 'landxml' || head.startsWith('<')) return openLandXml(text, name);
    return importPoints(text, name);
  }

  async function openProject(text, name) {
    const from = openingFrom;   // read now: it is cleared once the opening call returns, before the discard question
    let r;
    try { r = Project.fromJSON(JSON.parse(text)); } catch (err) { say(t('cv.open.failed', { file: name, why: err.message })); return; }
    if (!(await confirmDiscard())) return;
    project = r.project; project.saved = project.version; projectTarget = from; rebind();
    sel = null; selPvi = -1; lastReport = r.notes.length ? r.notes : null;
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
      p.state.alignments.push({ id: p.nextId('a'), name: a.name.slice(0, 120), start: a.start, pis: a.pis, pvis: prof ? prof.pvis : [] });
      if (a.profiles.length > 1) notes.push(t('cv.lx.profiles.more', { name: a.name }));
    }
    const n0 = d.networks?.[0];
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
      if (d.networks.length > 1) notes.push(t('cv.lx.nets.more', { n: d.networks.length - 1 }));
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
    project = p; rebind(); sel = null; selPvi = -1; lastReport = notes.length ? notes : null;
    refresh(); fitAll();
    say(t('cv.lx.opened', { file: name, points: t('cv.pts.n', { n: d.points.length, count: num(d.points.length) }), surfaces: t('cv.surfaces.n', { n: d.surfaces.length }), alignments: t('cv.als.n', { n: d.alignments.length }) }));
    // GIS: the file's <CoordinateSystem> is offered as the project's system (gis-vector-ui.js)
    if (d.coordinateSystem) gisLoad().then(() => gisReg.landxmlCrs?.(d.coordinateSystem, name)).catch(() => {});
  }

  function importPoints(text, name) {
    const dlg = ui.imp, $d = (s) => dlg.querySelector(s);
    let res = null;
    const parse = () => {
      res = parsePoints(text, { format: $d('[data-imp-format]').value, prefer: settings.order });
      $d('[data-imp-file]').textContent = name;
      const delimKey = { ',': 'cv.imp.delim.comma', '\t': 'cv.imp.delim.tab', ';': 'cv.imp.delim.semi', ws: 'cv.imp.delim.space' }[res.delimiter];
      const delim = delimKey ? t(delimKey) : '—';
      $d('[data-imp-summary]').textContent = res.points.length
        ? t(res.formatFrom === 'header' ? 'cv.imp.read.header' : res.formatFrom === 'chosen' ? 'cv.imp.read.chosen' : 'cv.imp.read.guessed', { n: res.points.length, count: num(res.points.length), format: res.format, order: settings.order, delim }) + (res.badCount ? ' ' + t('cv.imp.bad', { n: res.badCount, count: num(res.badCount) }) : '')
        : t('cv.imp.none');
      // GIS: latitude/longitude columns are degrees — converted through a coordinate system on Import, never loaded as feet
      if (res.latlon && res.points.length) $d('[data-imp-summary]').textContent += ' ' + (project.state.crs ? t('cv.imp.latlon.crs', { crs: project.state.crs.name }) : t('cv.imp.latlon.pick'));
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
        const r = gisReg.pointsLatLon ? await gisReg.pointsLatLon(res.points, name) : null;
        if (!r) { say(t('cv.imp.latlon.need', { file: name })); return; }
        pts = r.points; llNote = ' ' + r.note; llCrs = r.crs;
      }
      const replacing = project.points.length;
      project.state.surface.tin = null;
      if (!project.points.length && !project.state.alignments.length && project.state.name === t('project.untitled')) project.state.name = name.replace(/\.[^.]+$/, '').slice(0, 120);
      lastReport = null;
      if (llCrs) { const before = project.state.crs; project.state.crs = llCrs; for (const f of gisReg.crsChange) f(before, llCrs); }   // GIS
      project.setPoints(pts, name);
      sel = null; selPvi = -1; picked.clear();
      refresh(); fitAll();
      const sf = eg().surface;
      const counts = { n: pts.length, count: num(pts.length), file: name, tris: sf ? num(sf.nT) : '' };
      say(t(sf ? (replacing ? 'cv.imp.replaced.sf' : 'cv.imp.imported.sf') : (replacing ? 'cv.imp.replaced' : 'cv.imp.imported'), counts) + ' ' + t('cv.imp.mark') + llNote);
    };
    for (const b of dlg.querySelectorAll('[data-close]')) b.onclick = () => dlg.close('cancel');
    dlg.onclose = () => refocus();
    dlg.showModal();
    $d('[data-imp-ok]').focus();
  }

  /** An export: always a copy (browser: a download; desktop: the save dialog). */
  function download(bytes, name, type) {
    fileHost.download(bytes instanceof Blob ? bytes : new Blob([bytes], { type }), name, type);
  }
  function fileStem() { return (project.state.name || 'site').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').trim().slice(0, 80) || 'site'; }   // hoisted: autosave names its copy at start

  /** Save the project: in place when it was opened from a project file on the desktop, else a new file (browser: a
   *  download, as before). → true when saved. */
  async function saveProject() {
    const name = projectTarget?.name || fileStem() + '.civilcraft.json';
    const data = new Blob([JSON.stringify(project.toJSON())], { type: 'application/json' });
    const r = await fileHost.save({ target: projectTarget, data, name, types: PROJECT_TYPES });
    if (!r.ok) { say(r.cancelled ? t('save.cancelled') : t('save.failed', { error: r.error?.message || String(r.error) })); return false; }
    if (r.how === 'written') projectTarget = r.target || projectTarget;
    project.saved = project.version;
    asDoc?.clean();
    say(r.how === 'written' ? t('save.written', { name: r.name || name }) : t('cv.saved.dl', { name: r.name || name }));
    return true;
  }

  function exportLandXml() {
    const s = project.state, r = eg();
    if (!project.points.length && !r.surface && !s.alignments.length && !(s.features || []).length) { say(t('cv.export.none')); return; }
    const surfaces = [];
    if (r.surface) surfaces.push({ name: s.surface.name || t('surface.eg'), desc: t('surface.eg'), surface: r.surface, breaklines: project.egBreaklines(), boundary: s.surface.boundary });
    const g = graded();
    if (g.surface) surfaces.push({ name: t('cv.lx.proposed'), desc: t('cv.lx.proposed.desc', { n: s.pads.length }), surface: g.surface });
    const xml = writeLandXml({
      name: s.name, units: s.units, points: project.points, surfaces, crs: s.crs,   // GIS: <CoordinateSystem> when the project has one
      alignments: s.alignments.map((a) => ({ name: a.name, alignment: project.alignment(a), eg: r.surface ? { name: s.surface.name || t('surface.eg'), pts: project.egProfile(a) } : null, profile: a.pvis.length >= 2 ? { name: t('cv.lx.design', { name: a.name }), profile: project.designProfile(a) } : null })),
      features: s.features || [],   // 0.6 WL.24
      networks: s.network ? [{ ...s.network, structures: s.network.structures.map((x) => { const i = project.networkCheck().structs.get(x.id); return { ...x, rimShown: i?.rim ?? null, sump: i?.sump ?? null }; }) }] : [],
    });
    download(xml, fileStem() + '.xml', 'application/xml');
    const skipped = s.alignments.filter((a) => !project.alignment(a).ok).length;
    const als = t('cv.als.n', { n: s.alignments.length - skipped });
    const list = [t('cv.pts.n', { n: project.points.length, count: num(project.points.length) }), t('cv.surfaces.n', { n: surfaces.length }), skipped ? t('cv.lx.als.skipped', { alignments: als, n: skipped }) : als];
    if (s.network) list.push(t('cv.lx.network'));
    if ((s.features || []).length) list.push(t('cv.lx.features', { n: s.features.length }));   // 0.6 WL.24
    say(t('cv.lx.exported', { list: list.join(', ') }));
  }

  function extentsAll() {
    const b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    const g = (x, y) => { b.minX = Math.min(b.minX, x); b.maxX = Math.max(b.maxX, x); b.minY = Math.min(b.minY, y); b.maxY = Math.max(b.maxY, y); };
    const sf = eg().surface;
    if (sf) { const s = sf.bounds; g(s.minX, s.minY); g(s.maxX, s.maxY); }
    for (const p of project.points) g(p.x, p.y);
    for (const a of project.state.alignments) for (const p of a.pis) g(p.x, p.y);
    for (const d of project.state.pads) for (const p of d.pts) g(p.x, p.y);
    for (const d of [...(project.state.parcels || []), ...(project.state.network?.catchments || []), ...(project.state.features || [])]) for (const p of d.pts) g(p.x, p.y);   // 0.4 V14/V19/V21
    for (const f of gisReg.extents) { const e = f(); if (e && Number.isFinite(e.minX)) { g(e.minX, e.minY); g(e.maxX, e.maxY); } }
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
    const scale = fitScale(units(), ext, paperBy(units() === 'm' ? 'a3' : 'tabloid'));
    const sc = buildScene(scale.mmPerUnit);
    const { text, report } = writeDxf({ units: units(), layers: LAYERS.map((l) => ({ name: l.name, color: l.aci })), entities: toDxfEntities(sc, scale.mmPerUnit) });
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
    if (saved && DWG_YEAR[saved]) sel.value = saved;
    ui.dwg.querySelector('[data-dwg-map-row]').hidden = !visibleMaps();   // 0.4 V8
    ui.dwg.showModal();
    sel.focus();
  }
  async function exportDwg(version = 'AC1015') {
    const ext = extentsAll();
    if (!ext) { say(t('cv.export.none')); return; }
    const scale = fitScale(units(), ext, paperBy(units() === 'm' ? 'a3' : 'tabloid'));
    const sc = buildScene(scale.mmPerUnit);
    let writeDwg;
    try { ({ writeDwg } = await import('./dwg-write.js')); } catch { say(t('cv.dwg.noload')); return; }
    // 0.4 V8: with map layers, a .zip: the drawing + the picture (PNG + world file) its IMAGE points at
    let pic = null;
    if (visibleMaps() && ui.dwg.querySelector('[data-dwg-map]').checked) { busy(t('map.out.busy')); pic = await mapPicture(ext, 4096, 'image/png').finally(() => busy(null)); }
    const picName = fileStem() + '-map.png';
    const { bytes, report } = writeDwg({ units: units(), layers: LAYERS.map((l) => ({ name: l.name, color: l.aci })), entities: toDxfEntities(sc, scale.mmPerUnit), version,
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
  ui.dwg.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) { ui.dwg.close(); return; }
    if (e.target.closest('[data-dwg-go]')) {
      const v = ui.dwg.querySelector('[data-dwg-format]').value;
      try { localStorage.setItem('civilcraft.dwgFormat', v); } catch { /* storage blocked */ }
      ui.dwg.close();
      exportDwg(v);
    }
  });
  ui.dwg.addEventListener('close', () => refocus());

  // ------------------------------------------------------------------ map layers in the PDF and the DWG (0.4 V8)
  const visibleMaps = () => (project.state.gis?.maps || []).some((m) => m.visible);
  /** The visible map layers over `box` as a picture of at most maxPx (null when none draws); waits for pictures still
   *  loading (up to 8 s). type 'image/jpeg' (PDF) or 'image/png' (DWG). */
  async function mapPicture(box, maxPx, type) {
    if (!visibleMaps()) return null;
    try { await gisLoad(); } catch { return null; }
    const r = await gisReg.drape?.renderSettled(box, maxPx, { canvas: document.createElement('canvas') });
    if (!r) return null;
    const blob = await new Promise((ok) => r.canvas.toBlob(ok, type, 0.88));
    if (!blob) return null;
    return { bytes: new Uint8Array(await blob.arrayBuffer()), pxW: r.canvas.width, pxH: r.canvas.height, box, complete: r.complete !== false, attribution: r.attribution };
  }

  // ------------------------------------------------------------------ plot
  function plotDialog() {
    const ext = extentsAll();
    if (!ext) { say(t('cv.plot.none')); return; }
    const dlg = ui.plot, $d = (s) => dlg.querySelector(s);
    const paperSel = $d('[data-plot-paper]'), scaleSel = $d('[data-plot-scale]'), areaSel = $d('[data-plot-area]');
    paperSel.replaceChildren(...PAPERS.map((p) => el('option', { value: p.key }, p.name)));
    if (!paperSel.dataset.set) { paperSel.value = units() === 'm' ? 'a3' : 'tabloid'; paperSel.dataset.set = '1'; }
    const area = () => (areaSel.value === 'view' ? view.viewBounds() : ext);
    const fill = () => {
      const fit = fitScale(units(), area(), paperBy(paperSel.value));
      scaleSel.replaceChildren(...scalesFor(units()).map((s) => el('option', { value: s.label }, s.label === fit.label ? t('cv.plot.fits', { scale: s.label }) : s.label)));
      scaleSel.value = fit.label;
      info();
    };
    const info = () => {
      const s = scalesFor(units()).find((x) => x.label === scaleSel.value), b = area();
      const P = paperBy(paperSel.value);
      const wmm = (b.maxX - b.minX) * s.mmPerUnit, hmm = (b.maxY - b.minY) * s.mmPerUnit;
      $d('[data-plot-info]').textContent = t('cv.plot.info', { w: fixed(wmm, 0), h: fixed(hmm, 0), scale: s.label, pw: fixed(Math.max(P.w, P.h), 0), ph: fixed(Math.min(P.w, P.h), 0) });
    };
    paperSel.onchange = fill; areaSel.onchange = fill; scaleSel.onchange = info;
    $d('[data-plot-map-row]').hidden = !visibleMaps();   // 0.4 V8
    fill();
    $d('[data-plot-go]').onclick = async () => {
      const s = scalesFor(units()).find((x) => x.label === scaleSel.value);
      const sc = buildScene(s.mmPerUnit);
      const d = project.state.display;
      const notes = [];
      if (d.contours && shown().s) notes.push(t(shown().tag === 'fg' ? 'cv.plot.contours.fg' : 'cv.plot.contours.eg', { i: d.interval, u: u().short }));
      // 0.4 V8: the map layers under the linework, as a picture of the sheet's drawing window (150 dpi, ≤ 4096 px)
      const images = [], extra = [];
      if (visibleMaps() && $d('[data-plot-map]').checked) {
        const win = sheetWindow(area(), { paper: paperSel.value, scale: s }), mmW = (win.maxX - win.minX) * s.mmPerUnit, mmH = (win.maxY - win.minY) * s.mmPerUnit;
        busy(t('map.out.busy'));
        const pic = await mapPicture(win, Math.min(4096, Math.round((Math.max(mmW, mmH) / 25.4) * 150)), 'image/jpeg').finally(() => busy(null));
        if (pic) { images.push({ jpeg: pic.bytes, pxW: pic.pxW, pxH: pic.pxH, box: win }); if (pic.attribution) notes.push(pic.attribution); if (!pic.complete) extra.push(t('map.out.partial')); }
      }
      const sheet = planSheet(sc, { extents: area(), paper: paperSel.value, scale: s, title: project.state.name, units: units(), notes, images });
      const { bytes, report } = await toPdf(sheet, { mono: $d('[data-plot-ink]').value === 'mono' });
      download(bytes, fileStem() + '.pdf', 'application/pdf');
      dlg.close('ok');
      say(t('cv.plot.done', { file: fileStem() + '.pdf', scale: s.label }) + (report.missing ? ' ' + t('pp.ui.missing', { n: report.missing }) : '') + (images.length ? ' ' + t('map.out.pdf.done') : '') + (extra.length ? ' ' + extra.join(' ') : ''));
    };
    for (const b of dlg.querySelectorAll('[data-close]')) b.onclick = () => dlg.close('cancel');
    dlg.onclose = () => refocus();
    dlg.showModal();
    $d('[data-plot-go]').focus();
  }

  // ------------------------------------------------------------------ dialogs, busy, discard
  function refocus() { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); ui.over.focus({ preventScroll: true }); }
  function busy(text) { ui.busy.hidden = !text; if (text) ui.busyText.textContent = text; }
  function ask({ title, text, buttons }) {
    return new Promise((done) => {
      const dlg = el('dialog', { className: 'cv-dialog cv-ask', 'aria-labelledby': 'cv-ask-h' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: 'cv-ask-h' }, title)),
        el('p', { className: 'cv-ask-text' }, text),
        el('div', { className: 'cv-dlg-foot' }, ...buttons.map(([key, label, cls]) => el('button', { type: 'button', className: cls + ' btn-sm-cc', dataset: { key } }, label))));
      let result = 'cancel';
      dlg.addEventListener('click', (e) => { const b = e.target.closest('button[data-key]'); if (b) { result = b.dataset.key; dlg.close(); } });
      dlg.addEventListener('close', () => { dlg.remove(); refocus(); done(result); });
      root.append(dlg);
      dlg.showModal();
      dlg.querySelector('button[data-key="cancel"]')?.focus();
    });
  }
  async function confirmDiscard() {
    if (!project.dirty || (!project.points.length && !project.state.alignments.length && !project.state.pads.length && !(project.state.features || []).length && !gisReg.hasWork.some((f) => f()))) return true;
    const c = await ask({ title: t('cv.ask.unsaved.title'), text: t('cv.ask.unsaved'), buttons: [['cancel', t('cad.ui.cancel'), 'btn-line'], ['discard', t('cv.ask.dont'), 'btn-line'], ['save', t('cv.ask.save'), 'btn-plot']] });
    if (c === 'save') return saveProject();
    return c === 'discard';
  }
  // Leaving by a link on the page asks in the page; the browser's own "Leave site?" is left for what no page can
  // catch (closing the tab, reloading, typing an address). After "save first", wait for the download to start.
  const unsaved = () => project.dirty && !!(project.points.length || project.state.alignments.length || project.state.pads.length || (project.state.features || []).length || gisReg.hasWork.some((f) => f()));
  let leaving = false;
  window.addEventListener('beforeunload', (e) => { if (unsaved() && !leaving) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('click', async (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a || !unsaved() || e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
    const url = new URL(a.href, location.href);
    if (!/^https?:$/.test(url.protocol) || (url.hash && url.href.split('#')[0] === location.href.split('#')[0])) return;
    e.preventDefault();
    if (!(await confirmDiscard())) return;
    leaving = true;
    setTimeout(() => location.assign(url.href), unsaved() ? 0 : 800);
  });

  function bandColor(t, dark) {
    // a sequential ramp from low (blue-green) to high (ochre-brown), lightness kept readable under the linework
    const h = 190 - 160 * t, s = 45, l = dark ? 30 + 10 * t : 82 - 22 * t;
    return hslHex(h, s, l);
  }
  function hslHex(h, s, l) {
    s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
    return '#' + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  // ------------------------------------------------------------------ 3D site view (site-view3d.js + three.js, loaded the first time it opens)
  // var: refresh() and updateTools() may run before this point during start-up
  var view3d = null, view3dLoad = null;   // eslint-disable-line no-var
  function is3D() { const h = root.querySelector('[data-view3d]'); return !!h && !h.hidden; }
  async function show3D(on) {
    const host3d = root.querySelector('[data-view3d]');
    if (!host3d) return;
    if (!on) { view3d?.hide(); host3d.hidden = true; applyCorner(); updateTools(); ui.over.focus({ preventScroll: true }); return; }
    if (!view3d) {
      say(t('cv.v3d.loading'));
      view3dLoad ||= import('./site-view3d.js');
      try {
        const m = await view3dLoad;
        view3d = m.mountSite3D(host3d, { project: () => project, say, onPick: pick3D, exag: settings.exag, corner: settings.corner, onExag: (x) => { settings.exag = x; persistSettings(); },
          drape: async () => { await gisLoad(); return gisReg.drape || null; },   // 0.4 V3: map layers draped on the surface
          selection: () => (sel && ['alignment', 'pad', 'feature', 'pipe', 'structure'].includes(sel.kind) ? { kind: sel.kind, id: sel.id } : null) });   // 0.4 V5
      } catch (err) { view3dLoad = null; say(t('cv.v3d.fail', { why: err?.message || err })); return; }
      say(t('v3d.hint'));   // 0.4 V5
    }
    host3d.hidden = false;
    applyCorner();
    view3d.show();
    updateTools();
  }
  // corner indicator (Settings › CivilCraft): the plan shows the view cube at Top (north = grid north, +Y) — any other
  // side, edge or corner (or a drag) opens the 3D view looking from there; or the X/Y axis icon; or nothing
  var planCube = null, planAxes = null, cubeOpening = null;   // eslint-disable-line no-var
  const PLAN_VIEW = { dir: [0, 0, -1], up: [0, 1, 0], persp: false };
  async function open3DAlong(v) {
    if (!is3D()) { cubeOpening ||= show3D(true).finally(() => { cubeOpening = null; }); await cubeOpening; }
    if (view3d && v) view3d.lookAlong(v);
  }
  function mountPlanCorner() {
    const host = root.querySelector('[data-plan]');
    if (!host || planCube) return;
    planCube = mountViewCube(host, {
      getView: () => PLAN_VIEW, north: 0, home: () => fitAll(),
      setView: (v) => { if (v.dir[2] < -0.9999 && v.up[1] > 0.9999) return; open3DAlong(v); },
      onDrag: async (dx, dy) => { await open3DAlong(is3D() ? null : PLAN_VIEW); if (view3d) { view3d.cam.orbit(dx, dy); view3d.view.invalidate(); } },
      i18n: { t, has },
    });
    planAxes = mountAxisIcon(host, { getView: () => PLAN_VIEW, corner: 'bottom-left', i18n: { t, has } });
    planCube.update(); planAxes.update();
  }
  function applyCorner() {
    mountPlanCorner();
    const plan = !is3D();
    planCube?.setVisible(plan && settings.corner === 'cube');
    planAxes?.setVisible(plan && settings.corner === 'axes');
    view3d?.setCorner(settings.corner);
  }

  /** A click in 3D: survey points join the point selection, pipes and structures open in Properties. */
  function pick3D(hit) {
    if (hit.kind === 'point') { picked = new Set([String(hit.id)]); sel = null; selPvi = -1; refresh(); return true; }
    if (hit.kind === 'pipe' || hit.kind === 'structure') { picked.clear(); sel = { kind: hit.kind, id: hit.id }; selPvi = -1; refresh(); return true; }
    // 0.4 V5: alignments, pads and feature lines picked in 3D select as on the plan; a breakline is named in the tip only
    if (hit.kind === 'alignment' || hit.kind === 'pad' || hit.kind === 'feature') { picked.clear(); sel = { kind: hit.kind, id: hit.id }; selPvi = -1; refresh(); return true; }
    if (hit.kind === 'breakline') { say(t('v3d.pick.breakline', { name: hit.name })); return false; }
    return false;
  }

  view.onFirstSize = () => fitAll();
  applyCorner();
  refresh();
}
