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

import { Project, cleanDesign, SPEED_UNITS, recoverText } from './project.js';
import { parsePoints, lassoPoints } from './points.js';
import { lassoMode, nextMode, thin } from './lasso-core.js';
import { civilTools, civilRollback } from './civil-agent.js';
import { readLandXml, writeLandXml } from './landxml.js';
import { decodePartsAsync, partsOf, parseJsonParts } from './textin.js';   // 0.10 PERF.20
const TEXT_PARTS_FROM = 32 * 1048576;
import { planScene, toDxfEntities, LAYERS } from './scene.js';
import { writeDxf } from './dxf.js';
import { PAPERS, paperBy, scalesFor, fitScale, planSheet, toPdf, sheetWindow } from './plot.js';
import { PlanView, mix, LABEL_FONT } from './view.js';
import { ProfileView } from './profile-view.js';
import { snapProfile, slopeOut, setSlope } from './profile-snap.js';   // CV.3 (#1534): snap, slope column and lock in the profile
import { unitOf, formatStation, parseStation, fixed, pct, volumeText, areaText, dms, bearing, isNum, readLength, grouped, newProjectUnits, TABLE_ID as UNIT_TABLE_ID } from './units.js';
import { limitSelect, onUnitsChange } from './unit-prefs.js';   // 0.7 UNITS: Settings › General › Units
import { buildProfile } from './profile.js';
import { polyArea, pointInPoly } from './tin.js';
import { METHODS as GRID_METHODS } from './gridding.js';   // 0.9 D9.6
import { normAng } from './alignment.js';
import { curveWhy, verticalWhy } from './solve-why.js';   // 0.5 WL.23
import { snapTargets, nearestSnap, translate, rotate, bearingBetween, setTangent, copyOf } from './snap.js';   // 0.9 WB.10 + WB.15
import { railProps } from './rail-ui.js';   // 0.7.1 71.26: railway alignments and tracks
import { railSceneItems, cleanRail, railDefaults } from './rail.js';
import { turnoutSceneItems } from './rail-turnouts.js';   // CV.1 2026-11-12
import { clearanceSceneItems } from './rail-clearance.js';   // CV.1 2026-11-12
import { civilProblems, civilMarkers } from './problems-civilcraft.js';   // 0.7.1 → 0.8: the shell's Problems (docs/0.8-PROBLEMS-SPEC.md)
import { el, fillDl, num } from './ui-util.js';
import { mountIds } from './ids-ui.js';   // 0.7.1 71.25: Check against IDS… in Export › IFC (cc-ids in ./ids/)
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
import { assemblyProps } from './assembly-ui.js';   // 0.7 D7.35
import { targetProps } from './targets-ui.js';   // 0.6 WL.25
import { cleanType } from './structs.js';   // 0.6 WL.27
import { createStructs } from './structs-ui.js';   // 0.6 WL.27
import { createSwept } from './swept-ui.js';   // 0.6 WL.28
import { createLandscape } from './landscape/landscape-ui.js';   // 0.7 LD (session landscape): the Landscape workspace
import { landscapeTools } from './landscape/ls-agent.js';   // 0.7 LD.8: its assistant tools
import { sidesBlock, slopeInput } from './sides-ui.js';   // 0.7.1 71.22: slopes per side, retaining walls
import { cleanSides, wallSceneItems } from './sides.js';
import { createPowerlines } from './powerline/powerline-ui.js';   // 0.7 PL: the Power lines workspace (docs/0.7-PART8.md)
import { riverProblems } from './problems-river.js';   // 0.8 SU.957: river warnings as Problems
import { createPlatform } from './platform-ui.js';   // 0.8 SU.914: cut and fill map, free sections, ramps
import { createTemplates } from './templates-ui.js';   // 0.9 SU.1110 + WB.6: corridor templates, several corridors, terrain templates (session civil-templates-09)
import { createGround } from './ground-ui.js';   // 0.8 SU.911/935: ground from contours / a point cloud (session civil-08)
import { waterProblems } from './problems-water.js';   // 0.8 LC.16: the water mains' warnings as shared Problems
import { waterTools } from './water-agent.js';
import { createGeo } from './geo-ui.js';   // 0.8 round 2 (civil-geo_PART_2): soils and slopes, junctions, survey adjustment, pits, links, rail
import { geoTools } from './geo-agent.js';   // 0.8 round 2 (civil-geo_PART_2): its assistant tools
import { PadDetector } from './wheel-pad.js';   // 0.7 D7.56 (CadCraft's copy, byte-identical): a trackpad's two-finger swipe pans
import { mountCivilAccess } from './access-mount.js';   // 0.8 round 3 (access_PART_3): EG.52, the plan without sight
import { mountShell } from './shell-mount.js';   // 0.8 round 3 (civil_PART_3): calc sheets, reasons, totals, lessons, Suggest, activity, Ask box
import { createMassOptions } from './massing-options-ui.js';   // 0.8 EG.58 (civil_PART_3): BimCraft's massing options on a parcel
import { createSolar } from './solar-ui.js';   // 0.8 EG.15 (civil_PART_3): ground PV arrays on terrain
import { landscapeProblems } from './landscape/problems-landscape.js';   // 0.8 LA.4 + LA.2 (landscape-arch_PART_4): junctions, overlaps, links
import { groundProblems } from './problems-ground.js';   // 0.8 SU.911/914 rest (civil_PART_3): the ground and platform steps in Problems
import { massOptTools } from './massopt-agent.js';   // 0.8 EG.58 (civil_PART_3): its assistant tools
import { solarTools } from './solar-agent.js';   // 0.8 EG.15 (civil_PART_3): its assistant tools
import { egTools } from './eg-agent.js';   // 0.8 round 2: its assistant tools (rain, earthwork, route, ponds, site, progress)   // 0.8 LC.16: its assistant tools
import { createEg } from './eg-ui.js';   // 0.8 round 2 (civil_PART_2): Make it rain, earthwork balancer, best route, address to site, detention ponds, progress
import { waterNetwork, waterFromNetwork } from './water-objects.js';   // 0.8 LC.16 rest + CV.2 (civil_PART_3): LandXML water networks, hydrants, fittings
import { cleanWater } from './water.js';
import { createIssues } from './issues-ui.js';   // 0.10 CV.1: issues and BCF
import { createUtilnet } from './utilnet-ui.js';   // 0.10 SU.1810: utility networks
import { createParking } from './parking-ui.js';   // 0.10 SU.1815: parking lots
import { createFence } from './fence-ui.js';   // 0.10 SU.1814b: fences
import { siteGenTools } from './site-gen-agent.js';   // 0.10 SU.1815 + SU.1814b: their assistant tools
import { createWater } from './water-ui.js';   // 0.8 LC.16 W1/W2: water mains (pressure networks)
import { createRivers } from './river-ui.js';   // 0.8 SU.957: rivers, 1D steady flow (session sx-river)
import { powerlineTools } from './powerline/pl-agent.js';   // 0.7 PL.8: its assistant tools
import { createDrainage } from './drainage-ui.js';   // 0.4 V19/V20
import { createParcels } from './parcels-ui.js';   // 0.4 V21
import { createMassing } from './massing-ui.js';   // 0.7 LC.1: building masses (session massing)
import { createTraverse } from './traverse-ui.js';   // 0.4 V22
import { createStaking } from './staking-ui.js';   // 0.4 V23
import { getHost } from "./host.js";   // W2.19: files through the host adapter (browser or desktop)
import { Autosave } from "./app-autosave.js";   // 0.4 1.2
import { panButton, wheelFactor } from './input-mouse.js';   // 0.5 IP.3: the menu style's wheel and pan buttons (input-civilcraft.js)
import { earthworkFile, QTY_EXT } from './qtyout.js';   // 0.6 TK.5+: cut and fill for TakeoffCraft
import { createSewer } from './sewer-ui.js';   // 0.6 LC.16 S1: sanitary design flows
import { mountUndoHook } from './undo-hook.js';   // 0.8 EG.77: tells Studio each finished step
import { measure } from './measure.js';   // 0.7 PL.10: the Measure tool
import { mountFiles } from './files-ui.js';
import { mountProps } from './props-ui.js';

const root = document.querySelector('[data-civilcraft]');
// root plus any toolbar torn off into its own window (app-toolbar-tear.js), so pressed and greyed-out states reach it (0.9 fix 2026-11-02)
const tearAll = (s) => (window.ccToolbarTear?.all ? window.ccToolbarTear.all(root, s) : [...root.querySelectorAll(s)]);
if (root) init(root);
// Touch screens (0.4 S.8): the first touch marks the app, so CSS gives bigger targets and the draft bar shows
if (root) root.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') root.classList.add('is-touch'); }, { capture: true, passive: true });

function init(root) {
  const $ = (s) => root.querySelector(s);
  const ui = {
    base: $('[data-base]'), over: $('[data-over]'), plan: $('[data-plan]'), hint: $('[data-hint]'), drop: $('[data-drop]'), busy: $('[data-busy]'), busyText: $('[data-busy-text]'),
    toolhint: $('[data-toolhint]'), file: $('[data-file]'), name: $('[data-name]'), units: $('[data-units]'),
    pointsEmpty: $('[data-points-empty]'), pointsInfo: $('[data-points-info]'), groups: $('[data-groups]'),
    surfaceH: $('[data-surface-h]'), surfaceInfo: $('[data-surface-info]'), surfaceReport: $('[data-surface-report]'), maxEdge: $('[data-maxedge]'), gridMethod: $('[data-grid-method]'), gridQ: $('[data-grid-q]'), gridAcc: $('[data-grid-acc]'), smooth: $('[data-contour-smooth]'), gridStep: $('[data-grid-step]'), gridPower: $('[data-grid-power]'), surfaceActions: $('[data-surface-actions]'),
    showSurface: $('[data-show-surface]'), interval: $('[data-interval]'), major: $('[data-major]'), bandCount: $('[data-bandcount]'), checks: $('[data-checks]'), legend: $('[data-legend]'),
    props: $('[data-props]'), propsH: $('[data-props-h]'),
    coords: $('[data-coords]'), elev: $('[data-elev]'), staoff: $('[data-staoff]'), status: $('[data-status]'),
    profPanel: $('[data-profile-panel]'), prof: $('[data-prof]'), profAl: $('[data-prof-al]'), pviAdd: $('[data-pvi-add]'), profSnapBtn: $('[data-prof-snap]'), profFl: $('[data-prof-fl]'), profWithin: $('[data-prof-fl-within]'), profRead: $('[data-prof-read]'), profClose: $('[data-prof-close]'),
    imp: $('[data-import]'), plot: $('[data-plot]'), dwg: $('[data-dwg]'),
    gisLayers: $('[data-gis-layers]'),   // GIS: the GIS layers section (gis-vector-ui.js fills it)
  };
  let hintClosed = false;   // the start card closed with its X
  const unitLabels = [...root.querySelectorAll('[data-unit]')];   // kept: a panel moved to the panels window leaves root

  let project = new Project();
  project.state.units = newProjectUnits();   // 0.7 UNITS: the starred length unit, else feet
  let measClosed = false;   // 0.7 PL.10: the Measure tool closed its shape (the next click starts a new one)
  let tool = 'select', draft = [], sel = null, selPvi = -1, cursor = null, snapPt = null, hoverPt = null, profCursor = null;
  let snapHit = null, pickJob = null;   // 0.9 WB.10: the vertex or point the pointer snaps to · a Pick button waiting for a plan click { label, cb }
  let drag = null, pvDrag = null, lastReport = null;
  let picked = new Set();         // selected survey points, by point number
  let pickLast = '';              // SC.5: the pick last announced to the page (announcePick, below)
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
  const msUi = createMassing({ el, project: () => project, units: () => units(), numInput: (...x) => numInput(...x), row: (...x) => row(...x), say: (m) => say(m),   // 0.7 LC.1 M1
    select: (x) => { picked.clear(); sel = x; selPvi = -1; refresh(); }, tool: (x) => { if (tool !== x) setTool(x); }, refresh: () => refresh(), redraw: () => view.invalidate(), bimUrl: () => root.dataset.bimUrl || '', bimApp: () => root.dataset.bimApp || '', download: (name, blob) => download(blob, name),
    ground: (which) => { const s = which === 'fg' ? graded().surface : null; const sf = s || eg().surface; return sf ? (x, y) => { const z = sf.elevationAt(x, y, 1e-6); return Number.isFinite(z) ? z : null; } : null; } });
  const tvUi = createTraverse({ root, el, project: () => project, units: () => units(), say: (m) => say(m), refocus: () => refocus(),   // 0.4 V22
    download: (name, blob) => download(blob, name), fileStem: () => fileStem(), addParcel: (...x) => pcUi.addParcel(...x),
    afterPoints: (ns) => { picked = new Set(ns); sel = null; selPvi = -1; refresh(); } });
  const skUi = createStaking({ root, el, project: () => project, units: () => units(), say: (m) => say(m), refocus: () => refocus(),   // 0.4 V23
    download: (name, blob) => download(blob, name), fileStem: () => fileStem() });
  const stUi = createStructs({ root, el, project: () => project, units: () => units(), say: (m) => say(m), refocus: () => refocus(),   // 0.6 WL.27
    download: (...x) => download(...x), select: (x) => { sel = x; selPvi = -1; picked.clear(); refresh(); } });
  const swUi = createSwept({ root, el, project: () => project, units: () => units(), say: (m) => say(m), refocus: () => refocus(),   // 0.6 WL.28
    select: (x) => { sel = x; selPvi = -1; picked.clear(); refresh(); }, command: (c) => command(c), redraw: () => view.invalidate() });
  const lsUi = createLandscape({ root, el, project: () => project, units: () => units(), say: (m) => say(m), refocus: () => refocus(),   // 0.7 LD: Landscape (landscape/)
    select: (x) => { sel = x; selPvi = -1; picked.clear(); refresh(); }, command: (c) => command(c), setTool: (x) => setTool(x), tool: () => tool,
    redraw: () => { view.invalidateScene(); view.invalidate(); }, refresh: () => refresh(), download: (...x) => download(...x), fileStem: () => fileStem(),
    numInput: (...x) => numInput(...x), row: (...x) => row(...x), cursor: () => cursor, surface: () => graded().surface || eg().surface, buildScene: (mm) => buildScene(mm), extents: () => extentsAll(),
    groundAt: (x, y) => { const z = (graded().surface || eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; },
    existing: () => eg().surface, tol: () => 8 / view.zoom });   // 0.8 LA.4 (landscape-arch_PART_4): existing-ground level labels and cut/fill per modifier
  const plUi = createPowerlines({ root, el, project: () => project, units: () => units(), say: (m) => say(m), refocus: () => refocus(),   // 0.7 PL: Power lines (powerline/)
    select: (x) => { sel = x; selPvi = -1; picked.clear(); refresh(); }, selection: () => sel, command: (c) => command(c), setTool: (x) => setTool(x), tool: () => tool,
    redraw: () => { view.invalidateScene(); view.invalidate(); }, refresh: () => refresh(), download: (...x) => download(...x), fileStem: () => fileStem(),
    numInput: (...x) => numInput(...x), row: (...x) => row(...x), cursor: () => cursor, surface: () => graded().surface || eg().surface, buildScene: (mm) => buildScene(mm), extents: () => extentsAll(),
    network: () => project.state.network, landscape: () => lsUi, groundAt: (x, y) => { const z = (graded().surface || eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; } });
  const rvUi = createRivers({ root, el, project: () => project, units: () => units(), numInput: (...x) => numInput(...x), row: (...x) => row(...x), say: (m) => say(m), select: (x) => { picked.clear(); sel = x; selPvi = -1; refresh(); }, selection: () => sel,   // 0.8 SU.957
    setTool: (x) => setTool(x), refresh: () => refresh(), redraw: () => view.invalidate(), scene: () => view.invalidateScene(), download: (name, blob) => download(blob, name), fileStem: () => fileStem(), surface: () => eg().surface });
  const pfUi = createPlatform({ root, el, project: () => project, units: () => units(), say: (m) => say(m), setTool: (x) => setTool(x), download: (name, blob) => download(blob, name), fileStem: () => fileStem(), legend: ui.legend, refresh: () => refresh(), redraw: () => view.invalidate() });   // 0.8 SU.914
  const wmUi = createWater({ root, el, project: () => project, units: () => units(), numInput: (...x) => numInput(...x), row: (...x) => row(...x), say: (m) => say(m), select: (x) => { picked.clear(); sel = x; selPvi = -1; refresh(); }, selection: () => sel,   // 0.8 LC.16
    setTool: (x) => setTool(x), redraw: () => { view.invalidate(); wmUi.refreshWindow(); }, download: (name, blob) => download(blob, name), fileStem: () => fileStem(), tol: () => 8 / view.zoom, groundAt: (x, y) => { const z = (graded().surface || eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; } });
  // 0.10 CV.1 / SU.1810: what the Issues and Utility networks windows ask of the page
  const geomOfSel = () => {
    const x = sel; if (!x) return null;
    if (x.kind === 'alignment') { const a = findAl(x.id), al = a && project.alignment(a); return al?.ok ? { kind: 'alignment', id: a.id, name: a.name, al, pts: al.polyline(Math.max(al.length / 400, units() === 'm' ? 1 : 3), Math.PI / 180).map((q) => ({ x: q.x, y: q.y })) } : null; }
    if (x.kind === 'feature') { const f = (project.state.features || []).find((q) => q.id === x.id); return f ? { kind: 'feature', id: f.id, name: f.name, pts: f.pts.map((q) => ({ x: q.x, y: q.y })), closed: f.closed === true } : null; }
    if (x.kind === 'parcel') { const f = (project.state.parcels || []).find((q) => q.id === x.id); return f?.pts?.length >= 3 ? { kind: 'parcel', id: f.id, name: f.name, pts: f.pts.map((q) => ({ x: q.x, y: q.y })), closed: true } : null; }   // 0.10 SU.1815: closed outlines for the parking lot and fence tools
    if (x.kind === 'pad') { const f = (project.state.pads || []).find((q) => q.id === x.id); return f?.pts?.length >= 3 ? { kind: 'pad', id: f.id, name: f.name, pts: f.pts.map((q) => ({ x: q.x, y: q.y })), closed: true } : null; }
    if (x.kind === 'pipe') { const n = project.state.network, q = n?.pipes.find((p) => p.id === x.id), a = q && n.structures.find((v) => v.id === q.from), b = q && n.structures.find((v) => v.id === q.to); return a && b ? { kind: 'pipe', id: q.id, name: q.name, pts: [{ x: a.x, y: a.y }, { x: b.x, y: b.y }] } : null; }
    if (x.kind === 'structure') { const v = project.state.network?.structures.find((q) => q.id === x.id); return v ? { kind: 'structure', id: v.id, name: v.name, pts: [{ x: v.x, y: v.y }] } : null; }
    return null;
  };
  const groundHere = (x, y) => { const z = (graded().surface || eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; };
  const groundExisting = (x, y) => { const z = eg().surface?.elevationAt(x, y); return Number.isFinite(z) ? z : null; };   // 0.10 SU.1815: a lot is graded against the EXISTING ground, never its own result
  const issUi = createIssues({ root, el, project: () => project, units: () => units(), say: (m) => say(m), refocus: () => refocus(), download: (name, blob) => download(blob, name), fileStem: () => fileStem(), view,
    selected: () => geomOfSel(), groundAt: groundHere, refresh: () => { view.invalidateScene(); view.invalidate(); },
    problems: () => { const P = window.ccProblems; return P ? P.store.list({ accepted: 'hide', t }).map((p) => ({ id: p.id, text: p.text || (p.msg ? t(p.msg.key, p.msg.vars) : ''), where: p.where })) : []; } });
  const utUi = createUtilnet({ root, el, project: () => project, units: () => units(), say: (m) => say(m), refocus: () => refocus(), download: (name, blob) => download(blob, name), fileStem: () => fileStem(),
    selected: () => geomOfSel(), groundAt: groundHere, refresh: () => { view.invalidateScene(); view.invalidate(); } });
  const pkUi = createParking({ root, el, project: () => project, units: () => units(), say: (m) => say(m), refocus: () => refocus(), download: (name, blob) => download(blob, name), fileStem: () => fileStem(),   // 0.10 SU.1815
    selected: () => geomOfSel(), groundAt: groundExisting, seed: () => lsUi.seedSpecies(), refresh: () => { view.invalidateScene(); view.invalidate(); } });
  const fcUi = createFence({ root, el, project: () => project, units: () => units(), say: (m) => say(m), refocus: () => refocus(), download: (name, blob) => download(blob, name), fileStem: () => fileStem(),   // 0.10 SU.1814b
    selected: () => geomOfSel(), groundAt: groundHere, refresh: () => { view.invalidateScene(); view.invalidate(); } });
  let gnSrc = null;   // the ground and platform steps' Problems source
  let egSrc = null;   // the Problems source for the round-2 tools (set where the sources are made)
  let lsSrcRef = null;   // 0.8 LA.4 (landscape-arch_PART_4): the Landscape junctions source (re-checked after a link regenerates)
  const egUi = createEg({ root, el, project: () => project, units: () => units(), say: (m) => say(m), download: (name, blob) => download(blob, name), fileStem: () => fileStem(),   // 0.8 round 2
    ground: () => eg().surface, graded: () => graded(), setTool: (x) => setTool(x), refresh: () => refresh(), redraw: () => { view.invalidate(); }, problemsChanged: () => egSrc?.invalidate() });
  const geoUi = createGeo({ root, el, project: () => project, units: () => units(), say: (m) => say(m), download: (name, blob) => download(blob, name), fileStem: () => fileStem(), ground: () => eg().surface, redraw: () => view.invalidate(), problemsChanged: () => egSrc?.invalidate() });   // 0.8 round 2 (civil-geo_PART_2)
  const moUi = createMassOptions({ root, el, project: () => project, units: () => units(), say: (m) => say(m), download: (name, blob) => download(blob, name), fileStem: () => fileStem(), select: (x) => { sel = x; selPvi = -1; picked.clear(); refresh(); view.invalidate(); }, refresh: () => { refresh(); view.invalidateScene(); }, redraw: () => view.invalidate() });   // 0.8 EG.58
  const solarUi = createSolar({ root, el, project: () => project, units: () => units(), say: (m) => say(m), download: (name, blob) => download(blob, name), fileStem: () => fileStem(), redraw: () => view.invalidate(), refresh: () => { refresh(); view.invalidateScene(); egSrc?.invalidate(); } });   // 0.8 EG.15
  const gdUi = createGround({ root, el, project: () => project, say: (m) => say(m) });   // 0.8 SU.911
  const tpUi = createTemplates({ root, el, project: () => project, units: () => units(), numInput: (...x) => numInput(...x), say: (m) => say(m), refresh: () => refresh(),   // 0.9 SU.1110 + WB.6
    download: (...x) => download(...x), fileStem: () => fileStem(), showProject: () => { sel = null; selPvi = -1; picked.clear(); refresh(); } });
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
  // ---- SC.5 (sc-r5-select): the pick is announced to the page (SuperCad Studio hears `cc-pick` and keeps one selection across its panels) and a pick from another
  // panel comes back through window.ccPickers.civilcraft. Both are inert outside Super. Ids are `<kind>:<id>` as the project's object registry names them
  // (`alignment:a1`, `pad:p2`, `parcel:…`, `feature:…`, `swept:…`); survey points are `point:<number>`.
  const PICK_LISTS = { alignment: (st) => st.alignments, pad: (st) => st.pads, parcel: (st) => st.parcels, feature: (st) => st.features, swept: (st) => st.swept,
    structure: (st) => st.network && st.network.structures, pipe: (st) => st.network && st.network.pipes };
  function pickIds() {
    if (sel && sel.kind === 'gis') return ['gis:' + sel.layer + ':' + sel.i];
    if (sel && sel.id != null) return [sel.kind + ':' + sel.id];
    return [...picked].slice(0, 2000).map((n) => 'point:' + n);
  }
  function announcePick() {
    const ids = pickIds(), key = ids.join(',');
    if (key === pickLast) return;
    pickLast = key;
    try { window.dispatchEvent(new CustomEvent('cc-pick', { detail: { app: 'civilcraft', ids } })); } catch { /* no window */ }
  }
  /** Show a pick from another panel: the first object named `<kind>:<id>` that this project has, else the survey points named. → the ids shown, or false */
  function pickApply(refs) {
    const st = project.state, pts = [];
    let hit = null;
    for (const r of (refs || []).slice(0, 5000)) {
      const m = /^([a-z][a-z-]{0,20}):(.{1,120})$/.exec(String(r && r.id != null ? r.id : ''));
      if (!m) continue;
      if (m[1] === 'point') { if (project.points.some((q) => String(q.n) === m[2])) pts.push(m[2]); continue; }
      const list = Object.hasOwn(PICK_LISTS, m[1]) ? PICK_LISTS[m[1]](st) : null, o = Array.isArray(list) ? list.find((x) => x && String(x.id) === m[2]) : null;
      if (o && !hit) hit = { kind: m[1], id: o.id };
    }
    if (!hit && !pts.length) return false;
    if (hit) { picked.clear(); sel = hit; } else { picked = new Set(pts); sel = null; }
    selPvi = -1;
    pickLast = pickIds().join(',');   // shown from elsewhere: not a new pick of this panel
    refresh();
    return pickIds();
  }
  (window.ccPickers = window.ccPickers || {}).civilcraft = { apply: pickApply, get: () => ({ ids: pickIds() }), clear: () => { if (sel || picked.size) { picked.clear(); sel = null; selPvi = -1; pickLast = ''; refresh(); } return true; } };
  const { openFile, openText, openProject, download, fileStem, saveProject, exportLandXml, extentsAll, fitAll, exportDxf, DWG_YEAR, dwgDialog, exportDwg, visibleMaps, plotNow, plotDialog } = mountFiles({
    ui, view, gisLoad, buildScene, refresh, rebind, say, nativeUi, ifcUi, refocus, busy, confirmDiscard,
    get openingFrom() { return openingFrom; },
    get project() { return project; }, set project(v) { project = v; },
    get projectTarget() { return projectTarget; }, set projectTarget(v) { projectTarget = v; },
    get sel() { return sel; }, set sel(v) { sel = v; },
    get selPvi() { return selPvi; }, set selPvi(v) { selPvi = v; },
    get lastReport() { return lastReport; }, set lastReport(v) { lastReport = v; },
    get gisReg() { return gisReg; },
    get settings() { return settings; },
    get picked() { return picked; },
    get eg() { return eg; },
    get fileHost() { return fileHost; },
    get asDoc() { return asDoc; },
    get graded() { return graded; },
    get units() { return units; },
    get shown() { return shown; },
    get u() { return u; },
    get TEXT_PARTS_FROM() { return TEXT_PARTS_FROM; },
  });
  window.civilcraft = {
    get project() { return project; }, view, pview, structs: stUi, swept: swUi, setTool, command, openText, select: (s) => { sel = s; selPvi = -1; refresh(); },
    get tool() { return tool; }, get sel() { return sel; }, get selPvi() { return selPvi; }, get picked() { return [...picked]; },
    pick: (nums) => { picked = new Set(nums.map(String)); sel = null; selPvi = -1; refresh(); }, clip: () => clip || storedClip(), get settings() { return settings; }, toScreen: (x, y) => { const r = ui.over.getBoundingClientRect(), s = view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; },
    profToScreen: (sta, z) => { const r = ui.prof.getBoundingClientRect(), s = pview.toScreen(sta, z); return { x: r.left + s.x, y: r.top + s.y }; },
    get view3d() { return view3d; }, show3D: (on) => show3D(on), get planCube() { return planCube; },
    get gis() { return gisHost; }, gisLoad: () => gisLoad(),
    get sections() { return secUi; },   // 0.4 V13
    get landscape() { return lsUi; },   // 0.7 LD
    get powerlines() { return plUi; },   // 0.7 PL
    get templates() { return tpUi; },   // 0.9 SU.1110 + WB.6 (tests)
    get rivers() { return rvUi; }, get platform() { return pfUi; }, get water() { return wmUi; },   // 0.8 SU.957 / SU.914 / LC.16 (tests)
    get sheets() { return ppUi; },   // 0.4 V15
    say: (m) => say(m),   // Studio Live (0.5 LV.22, live.js): its messages
    get exportSet() { return exportSet; },   // Finalize and export in SuperCad Studio (SC.7): the exporters with options, no dialogs
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
  const GIS_CMDS = new Set(['crs', 'gis-import', 'gis-export', 'basemap', 'cad-open', 'scan-start', 'gis-analysis', 'gis-table']);   // gis-analysis: 0.9 SU.1080 (gis-analysis-ui.js); cad-open: 0.4 V1 (gis-cad-ui.js); scan-start: Super 0.1 (scan-start-ui.js)
  const GIS_EXT = /\.(shp|shx|dbf|prj|cpg|zip|geojson|gpkg|kml|kmz|tif|tiff|asc|las|laz|jgw|pgw|tfw|wld|pngw|jpgw|png|jpe?g|dwg|dxf|pdf)$/i;   // pdf: Super 0.1, a scanned sheet (scan-start-ui.js)   // 0.4 V1: dwg|dxf → gis-cad-ui.js   // GIS: pictures + world files (map layers)
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
    if (files.some((f) => /\.ccbundle$|ccbundle\.zip$/i.test(f.name))) return false;   // 0.8 BIM-BUNDLE-OPEN: a project bundle is a .zip, but not GIS data: openFile reads it
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
      if (v.assistants && typeof v.assistants === 'object') out.assistants = { enabled: v.assistants.enabled === true, groups: (Array.isArray(v.assistants.groups) ? v.assistants.groups : []).filter((g) => ['read', 'edit', 'save', 'export'].includes(g)) };   // 0.7 AS.3: + save, export
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
    for (const [n, g] of [['cvAssistRead', 'read'], ['cvAssistEdit', 'edit'], ['cvAssistSave', 'save'], ['cvAssistExport', 'export']]) if (box(n)) { box(n).checked = as.groups.includes(g); box(n).disabled = !as.enabled; }
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
      else if (/^cvAssist(Read|Edit|Save|Export)?$/.test(t.name)) {   // 0.4 X.12; 0.7 AS.3: save, export
        const as = settings.assistants, on = (n) => settingsDlg.querySelector('input[name="' + n + '"]')?.checked;
        if (t.name === 'cvAssist') { as.enabled = t.checked; if (t.checked && !as.groups.length) as.groups = ['read']; }
        else as.groups = [on('cvAssistRead') && 'read', on('cvAssistEdit') && 'edit', on('cvAssistSave') && 'save', on('cvAssistExport') && 'export'].filter(Boolean);
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
    const padsOut = s.pads.map((p) => { const g = gr.items?.find((x) => x.id === p.id); return { name: p.name, pts: p.pts, z: Number(p.z), daylight: g?.daylight || [], rays: (g?.rays || []).filter((r) => r.kind !== 'wall'), walls: g?.walls || [] }; });   // walls: 0.7.1 71.22
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
    scene.items.push(...utUi.sceneItems(mm), ...issUi.sceneItems(mm), ...pkUi.sceneItems(mm), ...fcUi.sceneItems(mm));   // 0.10 SU.1810 utility networks, CV.1 issue pins
    scene.items.push(...wmUi.sceneItems(mm));   // 0.8 LC.16 rest + CV.2: water mains on C-WATR-MAIN, hydrants, valves and fittings
    scene.items.push(...rvUi.sceneItems());   // 0.8 SU.957: river centreline, cut lines with stations, the flood extent (C-WATR-*)
    scene.items.push(...pfUi.sceneItems(1 / mm));   // 0.8 SU.914: spot levels of the cut and fill map
    scene.items.push(...swUi.sceneItems(1 / mm));   // 0.6 WL.28 swept paths
    scene.items.push(...lsUi.sceneItems(1 / mm));   // 0.7 LD: plants, beds, hedges (L-* layers)
    scene.items.push(...plUi.sceneItems(1 / mm));   // 0.7 PL: lines, supports, routes, equipment (C-POWR-* layers)
    scene.items.push(...pcUi.sceneItems(mm));   // 0.4 V21 parcels, their courses and areas
    scene.items.push(...msUi.sceneItems(mm));   // 0.7 LC.1 masses: outline, name, floors and GFA (A-MASS)
    scene.items.push(...tpUi.sceneItems());   // 0.9 WB.6: terrain templates' shapes (C-TOPO-TMPL)
    if (d.points) scene.items.push(...codesUi.sceneItems());   // 0.4 V16 lines from line codes (groups that are not breaklines)
    for (const it of gr.items || []) {   // 0.4 V14: a daylighted feature line's slopes, as a pad's
      if (it.kind !== 'feature' || !it.daylight?.length) continue;
      scene.items.push({ layer: 'C-GRAD-DAYL', kind: 'poly', pts: it.daylight, closed: true, z: true });
      for (const r of it.rays || []) if (r.d > 1e-6) scene.items.push({ layer: 'C-GRAD-SLOP', kind: 'poly', pts: [{ x: r.x0, y: r.y0 }, { x: r.x, y: r.y }] });
    }
    // 0.7.1 71.22: retaining walls (pads here; Landscape platforms in grade-ui.js): outer face, ticks, heights
    if (d.pads !== false) for (const p of padsOut) scene.items.push(...wallSceneItems(p.walls, { layer: 'C-GRAD-WALL', unitPerMm: 1 / mm, fixed: (v) => fixed(v, 2) }));
    // 0.7.1 71.26: each track's rails (and track centres) from its corridor sections (flat stand-in ground too)
    if (d.pads !== false) scene.items.push(...railSceneItems(eg().surface ? (gr.items || []).filter((x) => x.kind === 'corridor') : project.standInCorridors()));
    // CV.1 2026-11-12: turnouts and crossovers on their alignments (C-RAIL-TURN) and each railway's clearance envelope (C-RAIL-CLRN)
    if (d.alignments !== false) {
      for (const x of project.allTurnouts()) scene.items.push(...turnoutSceneItems(x.placed, { unitPerMm: 1 / mm }));
      for (const a of project.state.alignments) if (a.rail?.on && a.rail.clearance?.on) scene.items.push(...clearanceSceneItems(project.railClearance(a), { unitPerMm: 1 / mm }));
    }
    for (const f of gisReg.scene) f(scene, mm);
    return scene;
  }

  let bandCache = null;
  function bands() {
    { const cf = pfUi.bands(); if (cf) return cf; }   // 0.8 SU.914: the cut and fill map instead of the elevation bands
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
    shellM?.changed();
    renderProfile();
    secUi.render();   // 0.4 V13
    updateTools();
    announcePick();   // SC.5: every change of the selection ends in a refresh
    if (kind !== 'display') bandCache = null;
    view3d?.refresh();
    window.dispatchEvent(new CustomEvent('cc-addon-model-changed'));   // the add-ons' model host (below)
  }
  project.on(refresh);
  // The add-on host (add-on API 1.4, addons.js): the open project, for the Building regulations add-on's checks. `project` is replaced when a project is
  // opened, so the host reads the variable each time.
  window.ccAddonModel = { current: () => ({ name: project.state.name || '' }), read: (fn) => fn(project) };
  // Autosave (0.4 1.2; app-autosave.js): the project is the document; its copy is the project file's JSON, written ~2 s
  // after changes stop while it has unsaved work. A new or opened project replaces it (the old copy goes: the person kept
  // or discarded that work on purpose).
  const autosave = new Autosave({ app: 'civilcraft' });
  let asDoc = null;
  function bindAutosave() {
    asDoc?.close();
    const p = project;
    // 0.10 PERF.24: the first copy is the whole project, then only what each edit changed (lib/history)
    const j = p.autosaveJournal(() => ({ name: fileStem() + '.civilcraft.json', points: p.points.length }));
    asDoc = autosave.doc({ name: fileStem() + '.civilcraft.json', journal: { epoch: j.epoch, base: () => (unsaved() ? j.base() : null), delta: () => (unsaved() ? j.delta() : null) } });
    p.on(() => { if (p !== project) return; asDoc.rename(fileStem() + '.civilcraft.json'); if (unsaved()) asDoc.changed(); else asDoc.clean(); });
  }
  bindAutosave();
  const undoHook = mountUndoHook({ getProject: () => project });   // 0.8 EG.77 undo across apps (follows the project when a file opens: rebind)
  // 0.8 AL.6 "This file uses …": before a save the shell records which add-ons the file's data came from ({ id: version } under `usesAddons`); after an
  // open it offers the ones this computer lacks, in a bar above the plan. Regulation ticks come from `regs`; each Address-to-site source from its add-on.
  const SITE_ADDON = { 'county-parcels': 'site-county-parcels', 'fema-nfhl': 'site-fema-flood', 'geocode-osm': 'site-geocode-osm', 'osm-buildings': 'site-osm-buildings', 'ssurgo-sda': 'site-ssurgo-soil', 'usgs-epqs': 'site-usgs-elevation' };
  Project.stamp = (p) => {
    const f = window.ccAddonsFile;
    if (!f) return null;
    const ids = [];
    if (p.shell && p.shell.regs) ids.push('regs');
    for (const s of p.state.site?.sources || []) if (s.via === 'fetch' && SITE_ADDON[s.id]) ids.push(SITE_ADDON[s.id]);
    const tmp = { addons: { ...(p.usesAddons || {}) } };
    try { f.stamp(tmp, ids); } catch (e) { console.warn('add-on record not stamped', e); }
    return Object.keys(tmp.addons).length ? tmp.addons : null;
  };
  function offerAddons() {
    const st = root.querySelector('[data-stage]');
    if (!st) return;
    let el = st.querySelector('[data-addons-banner]');
    if (!el) { el = document.createElement('div'); el.dataset.addonsBanner = ''; el.className = 'cv-note'; el.hidden = true; el.setAttribute('role', 'status'); st.insertBefore(el, st.firstChild); }
    el.hidden = true; el.textContent = '';
    try { window.ccAddonsFile?.offer({ addons: project.usesAddons || {} }, el); el.hidden = !el.childNodes.length; } catch (e) { console.warn('add-on offer failed', e); }
  }
  var shellM = null;   // eslint-disable-line no-var
  function rebind() {
    bindAutosave();
    undoHook.attach(); offerAddons();
    project.on(refresh); window.dispatchEvent(new CustomEvent('cc-addon-model-changed')); shellM?.opened(); picked.clear(); pasteJob = null; if (tool === 'paste') tool = 'select';
    for (const f of gisReg.onProject) f(project);
    if (project.state.crs || project.state.gis?.layers?.length) gisLoad().catch(() => {});
  }

  let idsUi = null;   // 0.7.1 71.25: the IDS check of the IFC export (ids-ui.js), mounted after the Problems below
  /** An IDS problem names the exported element by GlobalId (0.7.1 71.25): back to the project object the writer made it from. */
  const aboutRef = (p) => {
    const r = p.about[0];
    if (r?.kind !== 'element') return r;
    const [k, id] = String(idsUi?.refOf(r.id)?.tag || '').split('|');
    if (k === 'road') { const c = (project.state.corridors || []).find((x) => String(x.id) === id); return c ? { kind: 'alignment', id: c.alignment } : null; }
    const kind = { al: 'alignment', pad: 'pad', pipe: 'pipe', struct: 'structure', mass: 'mass' }[k];
    return kind ? { kind, id } : null;
  };
  // ---- Problems (0.7.1 → 0.8; docs/0.8-PROBLEMS-SPEC.md): curves and vertical curves that have no solution (solve-why.js) and roads
  // built on flat stand-in ground (project.standInCorridors, 71.19) in the shell's ⚠ panel (manifest "problems"), re-checked a moment after
  // each change; their fixes are the Properties panel's (one undo step); accepted problems are saved in the project file.
  if (document.getElementById('cc-problems')) {
    const go = () => {
      const P = window.ccProblems;
      if (!P) return;
      const src = P.source({
        id: 'civilcraft.design', kind: 'check', label: t('problems.src.design'),
        run: () => civilProblems({ alignments: project.state.alignments, standIn: eg().surface ? [] : project.standInCorridors(), graded: eg().surface ? (project.graded().items || []) : [], rail: project.railWarnings(), native: nativeWarnings(), templates: project.templateWarnings() }, { t, unit: u().short }),   // templates: 0.9 SU.1110 + WB.6   // native: 71.27 (the IFC pair)   // graded: 71.22 walls and slopes; rail: 71.26
        fix: (p, f) => {
          if (f.action === 'ifcSave' || f.action === 'ifcTake') { nativeUi().then((n) => n?.fix(f.action)); return true; }   // 0.7.1 71.27
          const a = findAl(p.about[0]?.id);
          if (!a) return false;
          if (f.action === 'setR' && Array.isArray(f.args)) {
            const pairs = f.args.filter((x) => Array.isArray(x) && Number.isInteger(x[0]) && a.pis[x[0]] && Number(x[1]) >= 0);
            if (!pairs.length) return false;
            const label = pairs.length > 1 ? t('why.undo.both', { a: pairs[0][0] + 1, b: pairs[1][0] + 1 }) : t('why.undo.r', { pi: pairs[0][0] + 1, r: String(pairs[0][1]) });
            project.change(label, () => { const al = findAl(a.id); for (const [i, r] of pairs) al.pis[i].r = Number(r); });
            say(label); return true;
          }
          if (f.action === 'setL' && f.args && a.pvis?.[f.args.index] && Number(f.args.L) > 0) {
            const v0 = a.pvis[f.args.index], label = t('why.undo.l', { pvi: f.args.index + 1, l: String(f.args.L) });
            project.change(label, () => { const v = findAl(a.id).pvis.find((q) => q.sta === v0.sta); if (v) { v.L = Number(f.args.L); delete v.K; } });
            say(label); return true;
          }
          return false;
        },
      });
      const rsrc = P.source({ id: 'civilcraft.river', kind: 'check', label: t('sx.su957.prob.src'), run: () => riverProblems(project.state.rivers || [], { t, resultsOf: (rid) => rvUi.results(rid)?.result || null, unit: units() === 'm' ? 'm' : 'ft' }), fix: () => false });   // 0.8 SU.957
      const wsrc = P.source({ id: 'civilcraft.water', kind: 'check', label: t('wm.title'), run: () => waterProblems(project.state.water, units() === 'm' ? 'm' : 'ft', { t, result: wmUi.results() }), fix: () => false });   // 0.8 LC.16
      gnSrc = P.source({ id: 'civilcraft.ground', kind: 'check', label: t('ground.prob.src'), run: () => groundProblems(project, { t, units: units() === 'm' ? 'm' : 'ft', spots: pfUi.map()?.spots || [] }), fix: () => false });   // 0.8 SU.911/914 rest
      const lsSrc = P.source({ id: 'civilcraft.landscape', kind: 'check', label: t('ls.prob.src'), run: () => { const m = lsUi.stack.modifiers(); return landscapeProblems(project, { t, units: units() === 'm' ? 'm' : 'ft', linkNotes: lsUi.linkNotes(), regions: m.filter((x) => x.region).map((x) => ({ id: String(x.id), kind: x.selKind, name: x.name, pts: x.region })) }); }, fix: () => false });   // 0.8 LA.4
      lsSrcRef = lsSrc;
      egSrc = P.source({ id: 'civilcraft.eg', kind: 'check', label: t('eg.prob.src'), run: () => [...egUi.problems(), ...geoUi.problems(), ...solarUi.problems()], fix: () => false });   // 0.8 round 2: ponds, overtopping from Make it rain
      const loadAcc = () => P.store.loadAccepted(project.state.problems?.accepted || []);
      const watch = (p) => p.on(() => { if (p !== project) return; loadAcc(); src.invalidate(); rsrc.invalidate(); lsSrc.invalidate(); wsrc.invalidate(); egSrc.invalidate(); gnSrc.invalidate(); });
      watch(project);
      gisReg.onProject.push((p) => { watch(p); loadAcc(); src.invalidate(); rsrc.invalidate(); wsrc.invalidate(); egSrc.invalidate(); gnSrc.invalidate(); lsSrc.invalidate(); });   // New / Open / a GIS file opened as a project (rebind)
      P.adapter({
        t,
        file: () => fileStem(),
        select: (p) => { const r = aboutRef(p); if (!r) return; if (r.kind === 'river') { if (rvUi.find(r.id)) { picked.clear(); sel = { kind: 'river', id: r.id }; selPvi = -1; refresh(); } return; } if (r.kind === 'alignment' && !findAl(r.id)) return; if (r.kind === 'wnode' || r.kind === 'wpipe') { if (wmUi.isMine(r) && (wmUi.model().nodes.some((n) => n.id === r.id) || wmUi.model().pipes.some((q) => q.id === r.id))) { picked.clear(); sel = { kind: r.kind, id: r.id }; selPvi = -1; refresh(); } return; } if (['alignment', 'pad', 'ls-grade', 'ls-hard', 'ls-pa', 'ls-lvl', 'pipe', 'structure', 'mass'].includes(r.kind)) { picked.clear(); sel = { kind: r.kind, id: r.id }; selPvi = -1; refresh(); } },
        focus: (p) => {
          const r0 = aboutRef(p), a = r0?.kind === 'alignment' ? findAl(r0.id) : findAl(p.about[0]?.id);
          if (is3D()) return;
          const area = r0?.kind === 'pad' ? project.state.pads.find((d) => String(d.id) === r0.id) : r0?.kind === 'ls-grade' ? (project.state.landscape?.grading || []).find((g) => String(g.id) === r0.id) : null;
          const pts = p.where?.at ? [{ x: p.where.at[0], y: p.where.at[1] }] : a ? a.pis : area?.pts || [];
          if (!pts.length) return;
          const pad = pts.length === 1 ? (units() === 'm' ? 60 : 200) : 0;
          const b = { minX: Math.min(...pts.map((q) => q.x)) - pad, minY: Math.min(...pts.map((q) => q.y)) - pad, maxX: Math.max(...pts.map((q) => q.x)) + pad, maxY: Math.max(...pts.map((q) => q.y)) + pad };
          view.fit(b);
        },
        saveAccepted: (list) => { project.change(t('problems.undo.accept'), (s) => { if (list.length) s.problems = { accepted: list }; else delete s.problems; }); },
      });
      P.markers(civilMarkers({ view, stage: ui.plan, project: () => project, is3D }));   // problems-08's mount line (docs/0.8-sessions/problems-08-mounts.md)
      loadAcc();
      src.recheck();
      rsrc.recheck();
    };
    if (window.ccProblems) go(); else document.addEventListener('cc-problems-ready', go, { once: true });
  }
  // ---- Check against IDS (0.7.1 71.25; ids-ui.js, cc-ids in ./ids/): the IFC Export › IFC would write — the same model, writer and schema
  // (ifc-civil-model.js, ifc-civil.js; the schema last picked there) — checked against the client's IDS, remembered in the project file
  // (state.ids, one undo step), its failures in the shell's Problems, re-checked a moment after every change
  idsUi = mountIds({
    root, el, t, say, refocus: () => refocus(),
    ifc: async () => {
      const [{ civilIfcModel, modelEmpty }, { writeCivilIfc, fileOrigin, SCHEMAS }, { IfcFile }] = await Promise.all([import('./ifc-civil-model.js'), import('./ifc-civil.js'), import('./ifc/model.js')]);
      const p = project, m = civilIfcModel(p, { species: lsUi.index() });
      if (modelEmpty(m)) throw new Error(t('cv.export.none'));
      let schema = 'IFC4X3_ADD2';
      try { const v = localStorage.getItem('civilcraft.ifcSchema'); if (SCHEMAS.includes(v)) schema = v; } catch { /* storage blocked */ }
      const origin = fileOrigin(m);
      if (p.state.crs) { try { const { frame } = await import('./crs.js'); [m.lon, m.lat] = frame(p.state.crs).toLonLat(origin.x, origin.y); } catch { m.lat = m.lon = null; } }
      const r = writeCivilIfc(m, { schema, origin, seed: p.state.name || 'site' });
      return { file: IfcFile.open(new TextEncoder().encode(r.text)), tags: r.tags || {} };
    },
    readRecord: () => (project.state.ids ? { ...project.state.ids, text: project.idsText() } : null),
    // the text once in project.idsTexts; the undo step holds only { name, hash } (lead 2026-10-26: no IDS text in the snapshots)
    writeRecord: (rec) => project.change(t(rec ? 'ids.undo.set' : 'ids.undo.clear'), (s) => { if (rec) s.ids = { name: rec.name, hash: project.idsTexts.put(rec.text) }; else delete s.ids; }),
  });
  { const watchIds = (p) => p.on(() => { if (p === project) idsUi.changed(); }); watchIds(project); gisReg.onProject.push((p) => { watchIds(p); idsUi.changed(); }); }
  window.civilcraftIds = idsUi;   // for tests (tools/ids/browser-civilcraft.mjs)

  /** Why an Edit command cannot act right now ('' = it can). Shown in the button's tooltip; the button is grayed out. */
  function editBlock(c) {
    const pts = project.points.length, sp = picked.size;
    const needPts = t('cv.edit.need.pts');
    switch (c) {
      case 'undo': return project.undoStack.length ? '' : t('cv.undo.none');
      case 'redo': return project.redoStack.length ? '' : t('cv.redo.none');
      case 'copy': case 'cut': case 'duplicate': return sp ? '' : pts ? needPts : t('cv.edit.no.pts.open');
      case 'paste': case 'paste-in-place': return clip || storedClip() || navigator.clipboard?.readText ? '' : t('cv.edit.no.paste');
      case 'delete': return selAl() || selPad() || selStruct() || selPipe() || selPvi >= 0 || sp || ['catchment', 'feature', 'parcel', 'swept', 'mass'].includes(sel?.kind) || lsUi.isMine(sel) || plUi.isMine(sel) || rvUi.isMine(sel) || wmUi.isMine(sel) ? '' : t('cv.delete.none');   // 0.8 SU.957: + a river; 0.8 LC.16: + a water node or pipe
      case 'select-all': return pts ? '' : t('cv.pts.none');
      case 'select-none': return sp || sel || selPvi >= 0 ? '' : t('cv.sel.none');
      default: return '';
    }
  }
  function updateTools() {
    const hasData = project.points.length || project.state.surface.tin || project.state.alignments.length || project.state.gis?.layers?.length;   // GIS: layers count as data
    const ls = project.state.landscape;   // 0.7.1 71.19: plants, hardscape or grading alone are work too (3D, save, fit)
    const hasWork = hasData || project.state.pads.length || (project.state.features || []).length || (project.state.masses || []).length
      || !!project.state.water?.nodes.length   // 0.8 LC.16
      || !!(ls && (ls.plants.length || ls.beds.length || ls.hedges.length || ls.hardscape?.length || ls.grading?.length || ls.freeform?.length));
    for (const b of tearAll('[data-cmd]')) {
      const c = b.dataset.cmd;
      // nothing to save, export, fit or clear yet: greyed out (the Edit buttons below say why in their title)
      if (c === 'new') b.disabled = !hasWork && !project.dirty;
      else if (['save', 'landxml', 'dxf', 'dwg', 'pdf', 'gis-export', 'fit', 'view3d'].includes(c)) b.disabled = !hasWork;
      else if (c === 'breakline' || c === 'boundary') b.disabled = !project.points.length;
      else if (c === 'profile') b.disabled = !project.state.alignments.length;
      if (['select', 'alignment', 'pad', 'breakline', 'boundary', 'pipe'].includes(c)) b.setAttribute('aria-pressed', String(tool === c));
      if (c === 'feature' || c === 'mass' || c === 'measure') b.setAttribute(b.getAttribute('role') === 'menuitemcheckbox' ? 'aria-checked' : 'aria-pressed', String(tool === c));   // 0.4 V14
      if (c === 'free-section' || c === 'ramp') b.setAttribute(b.getAttribute('role') === 'menuitemcheckbox' ? 'aria-checked' : 'aria-pressed', String(tool === c));   // 0.8 SU.914
      if (c === 'river') b.setAttribute(b.getAttribute('role') === 'menuitemcheckbox' ? 'aria-checked' : 'aria-pressed', String(tool === 'river' || tool === 'river-xs'));   // 0.8 SU.957
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
    lsUi.updateTools();   // 0.7 LD: Plant, Bed, Hedge pressed; Landscape checked
    plUi.updateTools(); plUi.refreshAfterChange();   wmUi.refreshWindow(); issUi.refreshWindow(); utUi.refreshWindow(); pkUi.refreshWindow(); fcUi.refreshWindow();   // 0.8 LC.16: the Water mains window follows the project   // 0.7 PL: tools pressed; the Power lines section and the line profile follow the project
    ui.over.classList.toggle('is-select', tool === 'select');
    ui.hint.hidden = hintClosed || !!hasData || tool !== 'select';
  }

  // the start card's X, as CadCraft's and ModelCraft's: closed stays closed until the page loads again
  ui.hint.querySelector('[data-hint-close]')?.addEventListener('click', () => { hintClosed = true; ui.hint.hidden = true; ui.over.focus({ preventScroll: true }); });

  function renderLeft() {
    const s = project.state, U = u();
    if (ui.name.ownerDocument.activeElement !== ui.name) ui.name.value = s.name;   // the panel may be in the panels window
    limitSelect(ui.units, 'length', { map: (v) => UNIT_TABLE_ID[v], keep: [s.units] });   // 0.7 UNITS: units turned on + the project's
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
    ui.surfaceH.textContent = s.surface.tin ? (s.surface.tin.from === 'grid' ? t('cv.surface.grid') : s.surface.tin.from === 'ifc' ? t('cv.surface.ifc') : t('cv.surface.landxml')) : t('cv.surface');   // 'ifc': 0.7.1 71.24   // GIS: grid TINs (gis-terrain-ui.js)
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
    // 0.9 D9.6: the contouring method (a grid built from the points) — not for a surface that came as a TIN
    if (!ui.gridMethod.options.length) ui.gridMethod.append(...['tin', ...GRID_METHODS.map((m) => m.key)].map((k) => el('option', { value: k }, t('cv.grid.m.' + k))));
    ui.gridMethod.value = s.surface.method || 'tin';
    ui.gridMethod.disabled = ui.gridStep.disabled = ui.gridPower.disabled = !!s.surface.tin;
    if (ui.gridStep.ownerDocument.activeElement !== ui.gridStep) ui.gridStep.value = s.surface.gridStep || 0;
    if (ui.gridPower.ownerDocument.activeElement !== ui.gridPower) ui.gridPower.value = s.surface.gridPower || (s.surface.method === 'polyreg' ? 1 : 2);
    ui.gridStep.disabled ||= !s.surface.method || s.surface.method === 'tin';
    ui.gridPower.disabled ||= !['idw', 'polyreg'].includes(s.surface.method);
    if (ui.gridQ && ui.gridAcc) {   // 0.9.1 ABOS: smoothness q (paper default 0.5) and accuracy in % of the height range (paper default 1)
      if (ui.gridQ.ownerDocument.activeElement !== ui.gridQ) ui.gridQ.value = s.surface.gridQ || 0.5;
      if (ui.gridAcc.ownerDocument.activeElement !== ui.gridAcc) ui.gridAcc.value = s.surface.gridAcc ?? 1;
      ui.gridQ.disabled = ui.gridAcc.disabled = !!s.surface.tin || s.surface.method !== 'abos';
    }
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
    if (ui.smooth) ui.smooth.value = d.smooth || 'none';   // 0.9.1 contour smoothing
    ui.bandCount.value = String(d.bandCount);
    for (const c of ui.checks.querySelectorAll('[data-show]')) c.checked = !!d[c.dataset.show];
    if (!d.bands) ui.legend.hidden = true;
  }

  // ------------------------------------------------------------------ properties panel
  // Auto-focus panel (Settings › Global): the Properties panel's groups (each h3 and what follows it) fold; redrawn content is folded again
  let afProps = null;
  function renderProps() { renderPropsBody(); if (!afProps && window.ccAutoFocus) afProps = window.ccAutoFocus.register({ id: 'civil-props', panel: ui.props, mode: 'flat', heading: 'h3.cv-h3' }); afProps?.refresh(); }
  window.addEventListener('load', () => renderProps());   // the engine (app-settings.js) may load after this module: once the page has loaded the Properties panel folds
  function renderPropsBody() {
    const p = ui.props;
    // never rebuild under the user's typing; a checkbox is not typing
    const focused = p.ownerDocument.activeElement;
    if (p.contains(focused) && focused.matches('input:not([type=checkbox])')) { pendingProps = true; return; }
    pendingProps = false;
    const a = selAl(), pd = selPad(), st = selStruct(), pp = selPipe();
    if (sel?.kind === 'gis') { for (const f of gisReg.props) if (f(sel, ui.props, ui.propsH)) return; sel = null; }   // GIS: a picked feature
    if (lsUi.isMine(sel)) { if (lsUi.props(sel, ui.props, ui.propsH)) return; sel = null; }   // 0.7 LD: a plant, bed or hedge
    if (plUi.isMine(sel)) { if (plUi.props(sel, ui.props, ui.propsH)) return; sel = null; }   // 0.7 PL: a line, support, route, equipment, obstacle
    if (rvUi.isMine(sel)) { if (rvUi.props(sel, ui.props, ui.propsH)) return; sel = null; }   // 0.8 SU.957: a river
    if (wmUi.isMine(sel)) { if (wmUi.props(sel, ui.props, ui.propsH)) return; sel = null; }   // 0.8 LC.16: a water node or pipe
    if (sel?.kind === 'feature') { const f = flUi.find(sel.id); if (f) { ui.propsH.textContent = t('fl.props.head'); ui.props.replaceChildren(...flUi.props(f), transformBlock('feature', f.id), el('div', { className: 'cv-actions' }, swUi.button('feature', f.id))); const lb = lsUi.linkBlock(sel); if (lb) ui.props.append(lb); return; } sel = null; }   // 0.8 LA.2 outputs: a feature line made from a line says what it follows   // 0.4 V14; 0.6 WL.28
    if (sel?.kind === 'swept') { const w = swUi.find(sel.id); if (w) { ui.propsH.textContent = t('sw.head'); ui.props.replaceChildren(...swUi.props(w)); return; } sel = null; }   // 0.6 WL.28
    if (sel?.kind === 'parcel') { const pc = pcUi.find(sel.id); if (pc) { ui.propsH.textContent = t('pc.props.head'); ui.props.replaceChildren(...pcUi.props(pc), cornersBlock('parcel', pc.id), transformBlock('parcel', pc.id), el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete')))); return; } sel = null; }   // 0.4 V21
    if (sel?.kind === 'mass') { const ms = msUi.find(sel.id); if (ms) { ui.propsH.textContent = t('ms.props.head'); ui.props.replaceChildren(...msUi.props(ms), el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete')))); return; } sel = null; }   // 0.7 LC.1
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

  // 0.8 PANEL-COMPACT: the shared property grid (window.ccPropGrid) where the shell has it; a build or edition without it keeps the forms.
  // Rows are text rows read the way numInput reads its box: lengths and sums through readLength (calc), stations as stations, the handler's
  // `false` marks the box invalid. `handlers[rowId] = { fn(text) → false|undefined, calc, station }`; a row without a handler is read-only data.
  const gridRow = (id, category, label, value, extra = {}) => ({ id, category, label, type: 'text', value: value == null ? '' : String(value), ...extra });
  const roRow = (id, category, label, value) => ({ id, category, label, type: 'readonly', value: value == null ? '' : String(value) });
  function propGrid(key, label, rows, handlers, attrs = {}) {
    const host = el('div', { className: 'cv-grid', ...attrs });
    ccPropGrid.create(host, { label, key, rows, onChange: (id, text) => {
      const h = handlers[id]; if (!h) return;
      const node = host.querySelector('[data-pg-row="' + id + '"]');
      let v = String(text);
      if (h.calc && !h.station && v.trim() !== '' && !isNum(v)) {
        const r = readLength(v, units());
        if (!r.ok) { node?.setAttribute('aria-invalid', 'true'); say(r.error); return; }
        v = String(Number(r.value.toFixed(9)));
        if (node) node.value = v;
      }
      if (h.fn(v) === false) node?.setAttribute('aria-invalid', 'true'); else node?.removeAttribute('aria-invalid');
    } });
    return host;
  }

  const { projectProps, alignmentProps, cornersBlock, transformBlock, padProps, structureProps, pipeProps, pointProps, pickedProps } = mountProps({
    ui, secUi, flUi, drUi, seUi, pcUi, msUi, tvUi, skUi, stUi, swUi, rvUi, wmUi, tpUi, codesUi, ppUi, fileStem, download, units, u, eg, graded, findAl, findPad, net, findStruct, findPipe, diaU, refresh, renderProps, numInput, row, gridRow, roRow, propGrid, numberSpan, showProfile, renderProfile, pviPickBtn, slopeCell, command, armPick, say,
    get project() { return project; },
    get sel() { return sel; }, set sel(v) { sel = v; },
    get selPvi() { return selPvi; }, set selPvi(v) { selPvi = v; },
    get pickBtn() { return pickBtn; },
    get picked() { return picked; }, set picked(v) { picked = v; },
    get pickNote() { return pickNote; },
    get pickedPoints() { return pickedPoints; },
  });















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
    pview.set({ key: a.id + '|' + project.version, align: a.id, snap: profSnap && profSnap.kind !== 'free' ? profSnap : null, eg: project.egProfile(a), profile: prof, pvis, start: al.start, end: al.end, units: units(), sel: selPvi, hover: pvHover, cursor: profCursor,
      features, featSel: sel?.kind === 'feature' ? sel.id : null, cant: project.railPlan(a) });   // cant: 0.7.1 71.26
  }
  ui.profFl.addEventListener('click', () => { project.setDisplay('profFeatures', !project.state.display.profFeatures); renderProfile(); });
  ui.profWithin.addEventListener('change', () => {
    const v = Number(String(ui.profWithin.value).replace(',', '.'));
    if (ui.profWithin.value.trim() !== '' && (!Number.isFinite(v) || v < 0)) { say(t('pv.fl.within.bad')); ui.profWithin.value = project.state.display.profWithin || ''; return; }
    project.setDisplay('profWithin', ui.profWithin.value.trim() === '' ? 0 : v);
    renderProfile();
  });
  let pvHover = -1, pvPick = null, profSnap = null, profSnapOn = true, profPan = null;   // CV.3: pvPick = { id, i, field: 'sta' | 'z' } while a table pick button waits for a click in the profile
  const parseSlope = (x) => { const v = Number(String(x).replace('%', '').replace(',', '.').trim()); return String(x).trim() === '' || !Number.isFinite(v) ? null : v / 100; };
  /** The pick button beside a PVI's station or elevation: the next click in the profile (snapped) fills that value. */
  function pviPickBtn(i, field) {
    const on = pvPick && pvPick.i === i && pvPick.field === field;
    return el('button', { type: 'button', className: 'cv-x cv-pvipick' + (on ? ' is-on' : ''), 'data-pvi-pick': field + ':' + i, 'aria-pressed': String(!!on),
      'aria-label': t(field === 'sta' ? 'cv.pvi.pick.sta.of' : 'cv.pvi.pick.z.of', { n: i + 1 }), title: t('cv.pvi.pick.title'), onclick: () => startPviPick(i, field) }, el('i', { className: 'bi bi-crosshair', 'aria-hidden': 'true' }));
  }
  function startPviPick(i, field) {
    const a = profileAlignment(); if (!a) return;
    if (pvPick && pvPick.i === i && pvPick.field === field) { endPviPick(); renderProps(); return; }
    if (ui.profPanel.hidden) showProfile(true, a.id);
    pvPick = { id: a.id, i, field };
    ui.prof.classList.add('is-picking'); ui.prof.focus({ preventScroll: true });
    say(t('cv.pvi.pick.hint', { n: i + 1, what: t(field === 'sta' ? 'cv.pvi.pick.what.sta' : 'cv.pvi.pick.what.z') }));
    renderProps();
  }
  function endPviPick() { pvPick = null; profSnap = null; ui.prof.classList.remove('is-picking'); renderProfile(); }
  /** What a point in the profile means for PVI `skip` (or a new one): the snapped point, or the raw one when snapping is off or Alt is held. */
  function profPoint(sx, sy, a, skip, alt) {
    const d = pview.toData(sx, sy);
    const snap = profSnapOn && !alt ? snapProfile(sx, sy, { toScreen: (q, z) => pview.toScreen(q, z), toData: (x, y) => pview.toData(x, y), eg: project.egProfile(a), pvis: a.pvis, skip, px: 10, labels: { pvi: t('cv.snap.pvi'), ground: t('cv.snap.ground'), station: t('cv.snap.station'), groundline: t('cv.snap.groundline') } }) : null;
    return snap || { sta: d.sta, z: d.z, kind: 'free', label: '' };
  }
  /** The slope cell: the grade (%) of the tangent from this PVI to the next, typed to move the next PVI's elevation (the last row has none). */
  function slopeCell(a, i) {
    const last = i === a.pvis.length - 1, g = slopeOut(a.pvis, i);
    if (last || g === null) return el('td', { className: 'cv-dash' }, '—');
    return el('td', {}, numInput(String(Number((g * 100).toFixed(3))), (x) => {
      const q = parseSlope(x); if (q === null) return false;
      const trial = a.pvis.map((v) => ({ ...v })), r = setSlope(trial, i, q);
      if (!r.ok) { say(t('cv.pvi.slope.locked', { a: i + 1, b: i + 2 })); return false; }
      project.change(t('cv.undo.pvi.slope'), () => { const p = findAl(a.id).pvis; p[r.moved].z = trial[r.moved].z; });
      say(t('cv.pvi.slope.set', { a: i + 1, b: i + 2, g: pct(q), n: r.moved + 1 }));
      return true;
    }, { label: t('cv.pvi.slope.of', { a: i + 1, b: i + 2 }), calc: false }));
  }
  ui.profAl.addEventListener('change', () => { ui.profAl.dataset.want = ui.profAl.value; sel = { kind: 'alignment', id: ui.profAl.value }; selPvi = -1; refresh(); });
  ui.profClose.addEventListener('click', () => showProfile(false));
  ui.pviAdd.addEventListener('click', () => setPviAdd(ui.pviAdd.getAttribute('aria-pressed') !== 'true'));
  function setPviAdd(on) { ui.pviAdd.setAttribute('aria-pressed', String(on)); if (on) say(t('cv.pvi.add.hint')); }

  ui.prof.addEventListener('pointerdown', (e) => {
    const a = profileAlignment(); if (!a || !pview.data) return;
    ui.prof.focus({ preventScroll: true });
    const r = ui.prof.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
    if (e.button === 1 || e.button === 2) { profPan = { x: e.clientX, y: e.clientY }; ui.prof.setPointerCapture(e.pointerId); e.preventDefault(); return; }   // CV.3: middle or right button drags the view
    if (pvPick) {   // CV.3 (#1534): a pick button in the PVI table is waiting for this click
      const pk = pvPick, pa = findAl(pk.id), al0 = project.alignment(pa), q = profPoint(sx, sy, pa, pk.i, e.altKey);
      if (pa && pa.pvis[pk.i]) {
        const prev = pa.pvis[pk.i - 1], next = pa.pvis[pk.i + 1];
        const sta = Math.max(prev ? prev.sta + 0.01 : al0.start, Math.min(next ? next.sta - 0.01 : al0.end, Number(q.sta.toFixed(2)))), z = Number(q.z.toFixed(2));
        project.change(t(pk.field === 'sta' ? 'cv.undo.pvi.sta' : 'cv.undo.pvi.z'), () => { const v = findAl(pk.id).pvis[pk.i]; if (pk.field === 'sta') v.sta = sta; else v.z = z; });
        say(t(pk.field === 'sta' ? 'cv.pvi.picked.sta' : 'cv.pvi.picked.z', { n: pk.i + 1, v: pk.field === 'sta' ? formatStation(sta, units()) : fixed(z, 2) }));
      }
      endPviPick(); renderProps();
      return;
    }
    const hit = pview.hitPvi(sx, sy);
    const fl = hit < 0 ? pview.hitFeature(sx, sy) : null;   // 0.5 WL.20: a feature line's crossing mark selects it
    if (fl) { flUi.find(fl) && (sel = { kind: 'feature', id: fl }, selPvi = -1, picked.clear(), refresh()); return; }
    if (hit >= 0) {
      selPvi = hit; sel = { kind: 'alignment', id: a.id };
      if (a.pvis[hit].locked) { say(t('cv.pvi.locked.drag', { n: hit + 1 })); renderProps(); renderProfile(); return; }   // CV.3: a locked PVI is not dragged
      pvDrag = { id: a.id, i: hit, pvis: a.pvis.map((v) => ({ ...v })), prof: project.designProfile(a), moved: false, x0: sx, y0: sy };
      ui.prof.setPointerCapture(e.pointerId);
      renderProps(); renderProfile();
      return;
    }
    if (ui.pviAdd.getAttribute('aria-pressed') === 'true') {
      const al = project.alignment(a); const d = profPoint(sx, sy, a, -1, e.altKey);   // CV.3: snaps (Alt = free)
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
    if (profPan) { pview.panBy(e.clientX - profPan.x, e.clientY - profPan.y); profPan = { x: e.clientX, y: e.clientY }; return; }
    const d = pview.toData(sx, sy), al = project.alignment(a);
    if (pvDrag) {
      if (Math.hypot(sx - pvDrag.x0, sy - pvDrag.y0) > 2) pvDrag.moved = true;
      if (!pvDrag.moved) return;
      const v = pvDrag.pvis[pvDrag.i], prev = pvDrag.pvis[pvDrag.i - 1], next = pvDrag.pvis[pvDrag.i + 1];
      const q = profPoint(sx, sy, { ...a, pvis: pvDrag.pvis }, pvDrag.i, e.altKey);   // CV.3: the dragged PVI snaps to the others, to ground points and ground
      profSnap = q;
      v.sta = Math.max(prev ? prev.sta + 0.01 : al.start, Math.min(next ? next.sta - 0.01 : al.end, Number(q.sta.toFixed(2))));
      v.z = Number(q.z.toFixed(2));
      pvDrag.prof = buildProfileLive(pvDrag.pvis);
      renderProfile();
      ui.profRead.textContent = t('cv.prof.read.pvi', { sta: formatStation(v.sta, units()), z: fixed(v.z, 2) });
      return;
    }
    const h = pview.hitPvi(sx, sy);
    const wantSnap = pvPick || ui.pviAdd.getAttribute('aria-pressed') === 'true';
    const ns = wantSnap && h < 0 ? profPoint(sx, sy, a, pvPick ? pvPick.i : -1, e.altKey) : null;
    const snapChanged = (ns && ns.kind !== 'free' ? ns.sta + '|' + ns.z : '') !== (profSnap && profSnap.kind !== 'free' ? profSnap.sta + '|' + profSnap.z : '');
    profSnap = ns;
    if (h !== pvHover || snapChanged) { pvHover = h; renderProfile(); }
    const sta = Math.max(al.start, Math.min(al.end, d.sta));
    const egz = interpEg(project.egProfile(a), sta), prof = project.designProfile(a), fg = prof.ok ? prof.elevationAt(sta) : null;
    const read = [t('cv.read.sta', { sta: formatStation(sta, units()) })];
    if (egz !== null) read.push(t('cv.read.ground', { z: fixed(egz, 2) }));
    if (fg !== null) read.push(t('cv.read.design', { z: fixed(fg, 2) }), t('cv.read.grade', { g: pct(prof.gradeAt(sta)) }), t(fg - egz >= 0 ? 'cv.read.fill' : 'cv.read.cut', { d: fixed(Math.abs(fg - egz), 2) }));
    ui.profRead.textContent = read.join(' · ');
    profCursor = { id: a.id, sta };
    view.invalidate();
  });
  ui.prof.addEventListener('pointerleave', () => { profCursor = null; if (profSnap) { profSnap = null; renderProfile(); } view.invalidate(); });
  ui.prof.addEventListener('contextmenu', (e) => e.preventDefault());
  // CV.3 (#1534): the wheel zooms the profile about the pointer (Shift = stations only, Alt = elevations only); double click fits; + − F keys
  const profPad = new PadDetector();
  ui.prof.addEventListener('wheel', (e) => {
    if (!pview.data) return;
    e.preventDefault();
    if (!e.shiftKey && !e.altKey && profPad.isSwipe(e)) { pview.panBy(-e.deltaX, -e.deltaY); renderProfile(); return; }   // D7.56: two fingers pan; a pinch and a mouse wheel zoom (Shift / Alt keep their one-axis zoom)
    const r = ui.prof.getBoundingClientRect();
    pview.zoomAt(e.clientX - r.left, e.clientY - r.top, Math.pow(1.0015, -e.deltaY * (e.deltaMode === 1 ? 16 : 1)), e.shiftKey ? 'x' : e.altKey ? 'y' : 'xy');
    renderProfile();
  }, { passive: false });
  ui.prof.addEventListener('dblclick', () => { pview.fit(); renderProfile(); });
  ui.prof.addEventListener('pointerup', () => {
    if (profPan) { profPan = null; return; }
    if (!pvDrag) return;
    profSnap = null;
    const d = pvDrag; pvDrag = null;
    if (d.moved) { project.change(t('cv.undo.pvi.move'), () => { findAl(d.id).pvis = d.pvis; }); selPvi = d.i; }
    renderProfile(); renderProps();
  });
  ui.prof.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selPvi >= 0) { e.preventDefault(); command('delete'); }
    if (e.key === 'Escape' && pvPick) { e.preventDefault(); e.stopPropagation(); endPviPick(); renderProps(); }   // the pick ends; the selection stays
    const c = pview.plot, cx = (c.x0 + c.x1) / 2, cy = (c.y0 + c.y1) / 2;
    if (e.key === '+' || e.key === '=') { e.preventDefault(); pview.zoomAt(cx, cy, 1.25); renderProfile(); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); pview.zoomAt(cx, cy, 0.8); renderProfile(); }
    else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); pview.fit(); renderProfile(); }
  });
  ui.profSnapBtn?.addEventListener('click', () => { profSnapOn = !profSnapOn; ui.profSnapBtn.setAttribute('aria-pressed', String(profSnapOn)); if (!profSnapOn) { profSnap = null; renderProfile(); } });
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
    mass: 'ms.hint',   // 0.7 LC.1
    paste: 'cv.hint.paste',
    measure: 'meas.hint',   // 0.7 PL.10
  };
  Object.assign(TOOL_HINT, lsUi.hints);   // 0.7 LD: Plant, Bed, Hedge
  Object.assign(TOOL_HINT, plUi.hints);   // 0.7 PL
  Object.assign(TOOL_HINT, wmUi.hints);   // 0.8 LC.16
  Object.assign(TOOL_HINT, rvUi.hints);   // 0.8 SU.957
  Object.assign(TOOL_HINT, pfUi.hints);   // 0.8 SU.914
  Object.assign(TOOL_HINT, egUi.hints);   // 0.8 EG.71
  function setTool(tl) {
    if (tl !== tool) { draft = []; flMid = null; measClosed = false; if (tl !== 'feature') flArc = false; }
    if (tl !== tool) wmUi.cancel();   // 0.8 LC.16: a pipe half drawn is dropped
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
      case 'new': if (await confirmDiscard()) { project = new Project(); project.state.units = newProjectUnits(); projectTarget = null; rebind(); sel = null; selPvi = -1; lastReport = null; refresh(); view.fit(null); say(t('cv.new.done')); } break;
      case 'open': if (fileHost.kind === 'desktop') await openHostFiles(await fileHost.openFile({ types: OPEN_TYPES, multiple: true })); else ui.file.click(); break;
      case 'save': await saveProject(); break;
      case 'landxml': exportLandXml(); break;
      case 'dxf': exportDxf(); break;
      case 'dwg': dwgDialog(); break;
      case 'pdf': plotDialog(); break;
      case 'ifc': (await ifcUi())?.exportDialog(); break;   // 0.7.1 71.24
      case 'select': setTool('select'); break;
      case 'measure': setTool(tool === 'measure' ? 'select' : 'measure'); break;   // 0.7 PL.10
      case 'alignment': case 'pad': case 'breakline': case 'boundary': case 'pipe': case 'feature': case 'mass': if (is3D()) await show3D(false); setTool(tool === c ? 'select' : c); break;
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
        if (lsUi.command(c)) { refresh(); break; }   // 0.7 LD: landscape, ls-*
        if (plUi.command(c)) { refresh(); break; }   // 0.7 PL: powerlines, pl-*
        if (wmUi.command(c) || issUi.command(c) || utUi.command(c) || pkUi.command(c) || fcUi.command(c)) break;   // 0.8 LC.16: water
        if (geoUi.command(c)) break;   // 0.8 round 2 (civil-geo_PART_2): geo-soil, geo-road, geo-survey, geo-mine, geo-link, geo-rail
        if (moUi.command(c)) break;   // 0.8 EG.58 (civil_PART_3): mass-options
        if (solarUi.command(c)) break;   // 0.8 EG.15 (civil_PART_3): solar
        if (egUi.command(c)) break;   // 0.8 round 2: eg-rain, eg-earthwork, eg-route, eg-site, eg-pond, eg-progress
        if (rvUi.command(c)) { refresh(); break; }   // 0.8 SU.957: river, river-xs, river-results
        if (pfUi.command(c)) { refresh(); break; }   // 0.8 SU.914: free-section, ramp
        if (gdUi.command(c)) break;   // 0.8 SU.911: ground-contours
        if (tpUi.command(c)) break;   // 0.9 SU.1110 + WB.6: corridor-templates, terrain-templates
        if (msUi.command(c)) break;   // 0.7 LC.1: mass
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
    if (sel?.kind === 'mass' && msUi.remove(sel.id)) { sel = null; refresh(); return; }   // 0.7 LC.1
    if (sel?.kind === 'swept' && swUi.remove(sel.id)) { sel = null; refresh(); return; }   // 0.6 WL.28
    if (lsUi.remove(sel)) { sel = null; refresh(); return; }   // 0.7 LD
    if (plUi.remove(sel)) { sel = null; refresh(); return; }   // 0.7 PL
    if (rvUi.remove(sel)) { sel = null; refresh(); return; }   // 0.8 SU.957
    if (wmUi.remove(sel)) { sel = null; refresh(); return; }   // 0.8 LC.16
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

  /** The Measure tool's words for these points (status line and the Enter summary). */
  function measureText(pts, closed) {
    const m = measure(pts, { closed, zAt: (x, y) => { const z = (graded().surface || eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; } });
    const U = u().short, parts = [t('meas.read', { n: m.n, total: fixed(m.total, 2), u: U })];
    if (m.last && !closed) parts.push(t('meas.read.last', { l: fixed(m.last.L, 2), u: U, bearing: bearing(m.last.bearing) }) + (m.last.grade_pct != null ? ', ' + t('meas.read.grade', { g: fixed(m.last.grade_pct, 1) }) : ''));
    if (m.total3d != null && m.segs.length) parts.push(t('meas.read.ground', { l: fixed(m.total3d, 2), u: U }));
    if (m.area != null) parts.push(t('meas.read.area', { a: areaText(m.area, units(), 2), p: fixed(m.total, 2), u: U }));
    return parts.join('; ');
  }

  function finishDraft() {
    const pts = draft.slice();
    draft = [];
    const s = project.state;
    if (tool === 'measure') { if (pts.length >= 2) say(t('meas.done', { text: measureText(pts, measClosed) })); measClosed = false; view.invalidate(); return; }   // 0.7 PL.10: nothing is drawn
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
    } else if (tool === 'mass') {   // 0.7 LC.1
      if (msUi.finish(pts)) setTool('select');
      else draft = pts;
    } else if (lsUi.ownsTool(tool)) {   // 0.7 LD: a planting bed or a hedge
      if (lsUi.finish(tool, pts)) setTool('select');
      else draft = pts;
    } else if (egUi.ownsTool(tool)) {   // 0.8 EG.71: the start and end of a best route
      if (egUi.finish(tool, pts)) setTool('select');
      else draft = pts;
    } else if (pfUi.ownsTool(tool)) {   // 0.8 SU.914: a free section line, a ramp
      if (pfUi.finish(tool, pts)) setTool('select');
      else draft = pts;
    } else if (rvUi.ownsTool(tool)) {   // 0.8 SU.957: a river centreline, a section cut line
      if (rvUi.finish(tool, pts)) setTool('select');
      else draft = pts;
    } else if (plUi.ownsTool(tool)) {   // 0.7 PL: an overhead line, an underground route, an obstacle
      if (plUi.finish(tool, pts)) setTool('select');
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
    if (tool === 'select' && !pickJob) {   // 0.9 WB.15: a waiting Pick button takes the click, even on a grip
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
    drag = { kind: tool === 'select' && e.shiftKey && e.button === 0 ? 'maybe-box' : 'maybe', s, last: s, moved: false, w, shift: e.shiftKey, alt: e.altKey, path: [s] };
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
    // 0.9 WB.10: drawing tools, a grip being dragged and a waiting Pick button snap to survey points and to the vertices of what is drawn (Alt = free)
    snapHit = !e.altKey && (pickJob || (drag?.kind === 'grip' && drag.moved) || ['alignment', 'pad', 'parcel', 'mass', 'feature', 'measure', 'boundary', 'catchment'].includes(tool)) ? snapHere(s, drag?.kind === 'grip' ? drag.g.list[drag.g.i] : null) : null;
    if (snapHit) cursor = { x: snapHit.x, y: snapHit.y };
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
  const padDetector = new PadDetector();
  ui.over.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (padDetector.isSwipe(e)) { view.panBy(-e.deltaX, -e.deltaY); return; }   // D7.56: two fingers pan (the plan follows them); a pinch and a mouse wheel zoom
    const s = local(e);
    view.zoomAt(s.x, s.y, Math.pow(1.0015, -e.deltaY * (e.deltaMode === 1 ? 16 : 1) * (e.ctrlKey ? 1 : wheelFactor())));   // IP.3: the style's wheel (a pinch stays as it is)
  }, { passive: false });
  // 0.8 Track ID: hand the view to the input-device layer (assets/js/app-devices-ui.js) — the plan as the wheel and a pan drag move
  // it (zoomAt, panBy), fit = Fit (F). The 3D stage opens over the plan canvas and the layer takes the first view under the pointer,
  // so while 3D is open the plan hands over a hidden stand-in (still in the page, so the layer keeps the plan for later)
  const planAway = el('span', { hidden: true, 'data-plan-away': '' });
  ui.plan.append(planAway);
  (window.ccViews ||= []).push({ get el() { return is3D() ? planAway : ui.over; }, kind: '2d',
    pan: (dx, dy) => view.panBy(dx, dy), zoom: (f, x = view.w / 2, y = view.h / 2) => view.zoomAt(x, y, f), fit: () => fitAll() });

  /** 0.9 WB.10: the closest vertex of anything drawn, or survey point, within 10 pixels of screen point s. */
  function snapHere(s, skip = null) {
    const v = nearestSnap(snapTargets(project.state, { skip }), (x, y) => view.toScreen(x, y), s, 10);
    const p = nearestPoint(s, 10, false);
    if (p && (!v || Math.hypot(view.toScreen(p.x, p.y).x - s.x, view.toScreen(p.x, p.y).y - s.y) < Math.hypot(view.toScreen(v.x, v.y).x - s.x, view.toScreen(v.x, v.y).y - s.y))) return { x: p.x, y: p.y, z: p.z, kind: 'point', label: String(p.n) };
    return v;
  }
  /** 0.9 WB.15: a Pick button (next to an easting / northing) waits for one plan click; Esc cancels. */
  function armPick(label, cb) {
    if (is3D()) { say(t('cv.pick.plan')); return; }
    pickJob = { label, cb };
    ui.over.classList.add('is-picking');
    say(t('cv.pick.armed', { what: label }));
    view.invalidate();
  }
  function endPick() { pickJob = null; snapHit = null; ui.over.classList.remove('is-picking'); view.invalidate(); }
  /** A small button that arms a pick: `onPick({x, y, z?})` gets the snapped place. */
  const pickBtn = (what, onPick, extra = {}) => el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-pick', 'data-cv-pick': '', title: t('cv.pick.title', { what }), 'aria-label': t('cv.pick.title', { what }), onclick: () => armPick(what, onPick), ...extra }, el('i', { className: 'bi bi-crosshair', 'aria-hidden': 'true' }));

  function click(w, s, d = {}) {
    if (pickJob) {   // 0.9 WB.15
      const j = pickJob, h = d.alt ? null : snapHere(s);
      endPick();
      j.cb(h ? { x: h.x, y: h.y, z: h.z } : { x: w.x, y: w.y });
      return;
    }
    if (!d.alt && ['alignment', 'pad', 'parcel', 'mass', 'feature', 'measure', 'boundary', 'catchment'].includes(tool)) { const h = snapHere(s); if (h) w = { x: h.x, y: h.y }; }   // 0.9 WB.10
    if (lsUi.ownsTool(tool) && lsUi.click(tool, w, s)) { view.invalidateScene(); view.invalidate(); return; }   // 0.7 LD: Plant places at once
    if (wmUi.ownsTool(tool) && wmUi.click(tool, w)) { view.invalidateScene(); view.invalidate(); return; }   // 0.8 LC.16: a node places at once; a link takes two clicks
    if (plUi.ownsTool(tool) && plUi.click(tool, w, s)) { view.invalidateScene(); view.invalidate(); return; }   // 0.7 PL: equipment and an added support place at once
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
    if (tool === 'measure') {   // 0.7 PL.10: survey points snap; the first point again closes the shape (area)
      if (measClosed) { draft = []; measClosed = false; }
      if (draft.length >= 3) { const q = view.toScreen(draft[0].x, draft[0].y); if (Math.hypot(q.x - s.x, q.y - s.y) < 8) { measClosed = true; say(measureText(draft, true)); view.invalidate(); return; } }
      const p = nearestPoint(s, 10, false);
      draft.push(p ? { x: p.x, y: p.y, z: p.z } : { x: w.x, y: w.y });
      say(measureText(draft, false));
      view.invalidate();
      return;
    }
    if (tool === 'breakline') {
      const p = nearestPoint(s, 14, true);
      if (!p) { say(t('cv.bl.click.need')); return; }
      if (draft.length && draft[draft.length - 1].n === p.n) return;
      draft.push({ x: p.x, y: p.y, z: p.z, n: p.n });
      say(t('cv.bl.click', { n: p.n, z: fixed(p.z, 2) }));
    } else if (tool === 'mass') {   // 0.7 LC.1: a click near a parcel corner or a survey point takes its place; the first corner again closes
      if (draft.length >= 3) { const q = view.toScreen(draft[0].x, draft[0].y); if (Math.hypot(q.x - s.x, q.y - s.y) < 8) { finishDraft(); return; } }
      let hit = null;
      for (const pc of project.state.parcels || []) for (const c of pc.pts) { const q = view.toScreen(c.x, c.y); if (Math.hypot(q.x - s.x, q.y - s.y) < 10) hit = c; }
      const p = hit ? null : nearestPoint(s, 10, false);
      draft.push(hit ? { x: hit.x, y: hit.y } : p ? { x: p.x, y: p.y } : { x: w.x, y: w.y });
      say(t('ms.click', { k: draft.length }));
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
    const pg = plUi.grip(sel);   // 0.7 PL: supports, route vertices, equipment, obstacles
    if (pg) return pg.only >= 0 ? (test([pg.list[pg.only]], '', null) ? { list: pg.list, i: pg.only, label: pg.label, get: pg.get } : null) : test(pg.list, pg.label, pg.get);
    const lg = lsUi.grip(sel);   // 0.7 LD: a plant, bed / hedge corners, grading corners, spots, edited contours
    if (lg) return lg.only >= 0 ? (test([lg.list[lg.only]], '', null) ? { list: lg.list, i: lg.only, label: lg.label, get: lg.get } : null) : test(lg.list, lg.label, lg.get);
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
    if (lsUi.active()) { const h = lsUi.pick(w, tol); if (h) return h; }   // 0.7 LD: in the Landscape workspace the plants come first
    if (plUi.active()) { const h = plUi.pick(w, tol); if (h) return h; }   // 0.7 PL: in the Power lines workspace supports and spans come first
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
    { const wm = wmUi.pick(w, tol); if (wm) return wm; }   // 0.8 LC.16: a water node or pipe
    { const rv = rvUi.pick(w, tol); if (rv) return rv; }   // 0.8 SU.957: a river's centreline or cut lines
    const area = msUi.pick(w) || drUi.pick(w) || pcUi.pick(w) || swUi.pick(w) || lsUi.pick(w, tol) || plUi.pick(w, tol);   // 0.7 LD: plants, hedges, beds last in the Civil workspace   // 0.4 V19/V21: inside a catchment, else a parcel (anything nearer wins); 0.6 WL.28 a swept path
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
    msUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, sel);   // 0.7 LC.1: the selected mass
    for (const f of gisReg.overlay) f(ctx, v, sel);   // GIS: the picked feature
    secUi.overlay(ctx, (x, y) => v.toScreen(x, y), C.action);   // 0.4 V13: the section on show
    if (project.state.display.gradeOverlay) flUi.gradeLayer(ctx, (x, y) => v.toScreen(x, y), C, sel, LABEL_FONT);   // 0.5 WL.21: screen only
    swUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, sel);   // 0.6 WL.28: the selected swept path, its vehicle where the slider is
    lsUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, sel);   // 0.7 LD: the selected plant, bed or hedge; the plant under the pointer
    plUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, sel);   // 0.7 PL: the selection, its grips, and what fails (red)
    pfUi.overlay(ctx, (x, y) => v.toScreen(x, y), C);   // 0.8 SU.914 rest: the saved free-section lines
    solarUi.overlay(ctx, (x, y) => v.toScreen(x, y), C);   // 0.8 EG.15: ground PV tables
    geoUi.overlay(ctx, (x, y) => v.toScreen(x, y), C);   // 0.8 EG.10/CV.1 (civil-geo_PART_3): junctions, striping, signs, crossings, turnouts
    wmUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, sel);   // 0.8 LC.16: water nodes, pipes, pressures
    rvUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, sel);   // 0.8 SU.957: rivers, cut lines, the flood extent when shown
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
      const pts = cursor && tool !== 'breakline' && !(tool === 'measure' && measClosed) ? [...draft, cursor] : snapPt ? [...draft, snapPt] : draft;
      ctx.strokeStyle = tool === 'parcel' || tool === 'mass' ? C.ink2 : tool === 'catchment' ? C.cyan || C.blue : tool === 'pad' || tool === 'pipe' ? C.blue : tool === 'alignment' ? C.red : tool === 'boundary' ? C.ink2 : tool === 'feature' ? C.green || C.orange : tool === 'measure' ? C.action : C.orange;
      ctx.lineWidth = 2; ctx.setLineDash(tool === 'boundary' ? [7, 5] : tool === 'measure' ? [4, 3] : []);
      if (tool === 'feature' && draft.length) {   // 0.6 WL.24: arcs drawn as arcs, the one being drawn through its curve point
        const dp = draft.map((p) => ({ ...p, z: 0 }));
        if (flMid && cursor) { const b = bulgeThrough(dp[dp.length - 1], flMid, cursor); if (b) dp[dp.length - 1].b = b; }
        if (cursor) dp.push({ x: cursor.x, y: cursor.y, z: 0 });
        path(flattenFl({ pts: dp, closed: false }), false); ctx.stroke();
        if (flMid) { const q = S(flMid); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q.x, q.y, 5, 0, Math.PI * 2); ctx.stroke(); }
      } else if (pts.length >= 2) { path(pts, (tool === 'pad' || tool === 'boundary' || tool === 'catchment' || tool === 'parcel' || tool === 'mass' || (tool === 'measure' && measClosed) || lsUi.closedTool(tool)) && pts.length >= 3); ctx.stroke(); }
      ctx.setLineDash([]);
      draft.forEach((p) => grip(p, true));
      if (snapPt) { const q = S(snapPt); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.strokeRect(q.x - 6, q.y - 6, 12, 12); }
      if (tool === 'measure' && draft.length && (cursor || measClosed)) {   // 0.7 PL.10: the side being drawn and the running total, by the pointer
        const live = measClosed ? draft : [...draft, cursor], m = measure(live, { closed: measClosed }), at = S(measClosed ? draft[draft.length - 1] : cursor);
        const seg = measClosed ? null : m.segs[m.segs.length - 1];
        ctx.font = '600 12px ' + 'Helvetica, Arial, sans-serif'; ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';   // i18n-ignore: a CSS font stack
        ctx.fillText(seg ? t('meas.live', { l: fixed(seg.L, 2), total: fixed(m.total, 2), u: u().short }) : t('meas.live.area', { a: areaText(m.area, units(), 2) }), at.x + 12, at.y - 8);
      }
      if (tool === 'alignment' && cursor && draft.length) {
        const last = draft[draft.length - 1], L = Math.hypot(cursor.x - last.x, cursor.y - last.y), q = S(cursor);
        ctx.font = '600 12px ' + 'Helvetica, Arial, sans-serif'; ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';   // i18n-ignore: a CSS font stack
        ctx.fillText(fixed(L, 2) + ' ' + u().short + '  ' + bearing(Math.atan2(cursor.y - last.y, cursor.x - last.x)), q.x + 12, q.y - 8);
      }
    }
    if (snapHit) {   // 0.9 WB.10: where the pointer will land
      const q = S(snapHit);
      ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.strokeRect(q.x - 6, q.y - 6, 12, 12);
      ctx.font = '600 12px Helvetica, Arial, sans-serif'; ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'top';   // i18n-ignore: a CSS font stack
      ctx.fillText(t('cv.snap.' + snapHit.kind, { n: snapHit.label || '' }) + '  ' + fixed(snapHit.x, 2) + ', ' + fixed(snapHit.y, 2), q.x + 10, q.y + 8);
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
    if (root.querySelector('dialog[open]:not([data-gisa]):not([data-gist])')) return;   // the GIS analysis panel is not modal (0.9 SU.1080): keys still work beside it
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
      if (pickJob) { endPick(); say(t('cv.pick.cancelled')); return; }   // 0.9 WB.15
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
    const keyCmd = { m: 'measure', v: 'select', a: 'alignment', g: 'pad', p: 'pipe', b: 'breakline', o: 'boundary', r: 'profile', f: 'fit', d: 'view3d', x: 'sections', l: 'feature', e: 'grades' }[k.toLowerCase()];
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
    if (typing(e.target) || root.querySelector('dialog[open]:not([data-gisa]):not([data-gist])') || settingsDlg?.open || document.querySelector('[data-help-panel]')?.contains(e.target)) return;
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
  onUnitsChange(() => refresh());   // 0.7 UNITS: a change in Settings › General › Units (lists, starred area / volume units)
  ui.gridMethod.addEventListener('change', () => project.change(t('cv.undo.gridmethod'), (st) => { if (ui.gridMethod.value === 'tin') { delete st.surface.method; delete st.surface.gridStep; delete st.surface.gridPower; delete st.surface.gridQ; delete st.surface.gridAcc; } else st.surface.method = ui.gridMethod.value; }));
  ui.gridStep.addEventListener('change', () => { const v = Number(ui.gridStep.value); if (!(v >= 0)) { ui.gridStep.setAttribute('aria-invalid', 'true'); return; } ui.gridStep.removeAttribute('aria-invalid'); project.change(t('cv.undo.gridstep'), (st) => { if (v > 0) st.surface.gridStep = v; else delete st.surface.gridStep; }); });
  ui.gridPower.addEventListener('change', () => { const v = Number(ui.gridPower.value); if (!(v >= 1 && v <= 10)) { ui.gridPower.setAttribute('aria-invalid', 'true'); return; } ui.gridPower.removeAttribute('aria-invalid'); project.change(t('cv.undo.gridpower'), (st) => { st.surface.gridPower = v; }); });
  ui.maxEdge.addEventListener('change', () => { const v = Number(ui.maxEdge.value); if (!(v >= 0)) { ui.maxEdge.setAttribute('aria-invalid', 'true'); return; } ui.maxEdge.removeAttribute('aria-invalid'); project.change(t('cv.undo.maxedge'), (s) => { s.surface.maxEdge = v; }); });
  ui.showSurface.addEventListener('change', () => project.setDisplay('surface', ui.showSurface.value));
  ui.interval.addEventListener('change', () => project.setDisplay('interval', Number(ui.interval.value)));
  ui.major.addEventListener('change', () => project.setDisplay('major', Number(ui.major.value)));
  // 0.9.1: contour smoothing (contour-smooth.js). 'none' removes the key, so a drawing that never used it saves as before
  ui.smooth?.addEventListener('change', () => { const v = ui.smooth.value; if ((project.state.display.smooth || 'none') === v) return; if (v === 'light' || v === 'strong') project.state.display.smooth = v; else delete project.state.display.smooth; project.touch('display'); });
  ui.gridQ?.addEventListener('change', () => { const v = Number(ui.gridQ.value); if (!(v > 0 && v <= 100)) { ui.gridQ.setAttribute('aria-invalid', 'true'); return; } ui.gridQ.removeAttribute('aria-invalid'); project.change(t('cv.undo.gridq'), (st) => { st.surface.gridQ = v; }); });
  ui.gridAcc?.addEventListener('change', () => { const v = Number(ui.gridAcc.value); if (ui.gridAcc.value.trim() === '' || !(v >= 0 && v <= 100)) { ui.gridAcc.setAttribute('aria-invalid', 'true'); return; } ui.gridAcc.removeAttribute('aria-invalid'); project.change(t('cv.undo.gridacc'), (st) => { st.surface.gridAcc = v; }); });
  ui.bandCount.addEventListener('change', () => project.setDisplay('bandCount', Number(ui.bandCount.value)));
  ui.checks.addEventListener('change', (e) => { const c = e.target.closest('[data-show]'); if (c) project.setDisplay(c.dataset.show, c.checked); });

  // ------------------------------------------------------------------ files
  // Through the host adapter (host.js, W2.19): on the desktop Open is the native dialog, a double-clicked file opens at
  // launch or while running, and Save writes the project file it was opened from (else asks where); in the browser Open
  // is the same input as before and Save a download.
  const fileHost = getHost({ app: 'civilcraft' });
  const OPEN_TYPES = [{ description: 'CivilCraft, LandXML, points, GIS, DWG, DXF, IFC', extensions: ['.ifc', '.ccbundle', '.json', '.xml', '.landxml', '.csv', '.txt', '.pnezd', '.geojson', '.kml', '.kmz', '.shp', '.dbf', '.prj', '.gpkg', '.las', '.laz', '.tif', '.tiff', '.asc', '.dwg', '.dxf'] }];   // i18n-ignore: OS file types
  const PROJECT_TYPES = [{ description: 'CivilCraft project', extensions: ['.json'] }];   // i18n-ignore: an OS file type
  let projectTarget = null;   // the HostFile a project was opened from (desktop: Save writes it in place)
  let openingFrom = null;     // the HostFile being opened right now (openProject keeps it as projectTarget)
  async function openHostFiles(hfs) {
    if (!hfs || !hfs.length) return;
    const fs = [];
    for (const hf of hfs) { const b = await hf.file(); fs.push(typeof File !== 'undefined' && b instanceof File ? b : new File([b], hf.name, { lastModified: hf.lastModified || Date.now() })); }
    if (await gisOpen(fs)) return;
    if (await openPairFiles(fs, hfs)) return;   // 0.7.1 71.27
    openingFrom = hfs[0];
    try { await openFile(fs[0]); } finally { openingFrom = null; }
  }
  autosave.offer({ onRecover: async (rec) => {
    const text = rec.data && rec.data.kind === 'chunks' ? recoverText(rec) : rec.data;   // 0.10: a base and its changes, or the old whole text
    if (typeof text !== 'string') throw new Error(t('recover.failed'));
    await openProject(text, rec.meta?.name || 'project.civilcraft.json');
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
    // 0.7 AS.3 (session assistants): the app's own Save and exports, so a tool presses the same buttons (host.js sends the
    // file to a path the assistant names in Studio, else it downloads as the button would); refresh after a points edit
    saveProject: () => saveProject(), exportDwg: (version) => exportDwg(version), changed: () => { refresh(); view.invalidateScene(); view.invalidate(); },
    files: fileHost.control.files, download: (bytes, name, mime) => download(bytes, name, mime),
  })) fileHost.control.tool(def);
  { const reg = () => window.ccProblems?.registerTools?.(fileHost.control); if (window.ccProblems) reg(); else document.addEventListener('cc-problems-ready', reg, { once: true }); }   // problems-08's mount line: the Problems tools for assistants
  for (const def of landscapeTools({ project: () => project, seed: () => lsUi.seedSpecies(), changed: () => { refresh(); view.invalidateScene(); view.invalidate(); } })) fileHost.control.tool(def);   // 0.7 LD.8
  for (const def of siteGenTools({ project: () => project, seed: () => lsUi.seedSpecies(), zAt: (x, y) => groundExisting(x, y), changed: () => { refresh(); view.invalidateScene(); view.invalidate(); } })) fileHost.control.tool(def);   // 0.10 SU.1815 + SU.1814b
  for (const def of waterTools({ project: () => project, groundAt: (x, y) => { const z = (graded().surface || eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; }, changed: () => { refresh(); view.invalidateScene(); view.invalidate(); } })) fileHost.control.tool(def);   // 0.8 LC.16
  for (const def of egTools({ project: () => project, changed: () => { refresh(); view.invalidateScene(); view.invalidate(); } })) fileHost.control.tool(def);   // 0.8 round 2: civil_PART_2
  for (const def of massOptTools({ project: () => project, changed: () => { refresh(); view.invalidateScene(); view.invalidate(); } })) fileHost.control.tool(def);   // 0.8 EG.58: civil_PART_3
  for (const def of solarTools({ project: () => project, changed: () => { refresh(); view.invalidateScene(); view.invalidate(); } })) fileHost.control.tool(def);   // 0.8 EG.15: civil_PART_3
  for (const def of geoTools({ project: () => project, changed: () => { refresh(); view.invalidateScene(); view.invalidate(); } })) fileHost.control.tool(def);   // 0.8 round 2: civil-geo_PART_2
  for (const def of powerlineTools({ project: () => project, lib: () => plUi.lib(), groundAt: (x, y) => { const z = (graded().surface || eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; }, changed: () => { refresh(); view.invalidateScene(); view.invalidate(); } })) fileHost.control.tool(def);   // 0.7 PL.8
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
    rollback: civilRollback({ project: () => project }),   // AI-CONNECT-SPEC § 2.3: previews of the edit tools
    info: () => ({ site: project.state.name, points: project.points.length, unsaved: unsaved() }),
    busy: () => (draft.length ? 'drawing on the plan' : tool === 'paste' ? 'pasting points' : null),   // i18n-ignore: read by the assistant
  });
  window.civilcraftControl = fileHost.control;   // for tests and the console
  shellM = mountShell({ project: () => project, host: fileHost, selection: () => sel, select: (x) => { sel = x; selPvi = -1; picked.clear(); refresh(); view.invalidate(); }, undoDepth: () => project.undoStack.length,
    undoTo: (n) => { while (project.undoStack.length > n && project.undo()); } });   // the shell's modules attach here (shell-mount.js)
  mountCivilAccess({ project: () => project, view, stage: ui.over, status: ui.status, selection: () => sel,
    select: (x) => { sel = x; selPvi = -1; picked.clear(); refresh(); view.invalidate(); },
    groundAt: (x, y) => { const z = (graded().surface || eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; },
    setCursor: (p) => { cursor = p; updateStatus(); view.invalidate(); } });   // EG.52: spoken results, the keyboard cursor, station walk
  renderAssist();
  ui.file.addEventListener('change', async () => { const fs = [...ui.file.files]; ui.file.value = ''; if (fs.length && !(await gisOpen(fs))) openAny(fs); });   // openAny: 0.7.1 71.27 (the pair)
  let dragDepth = 0;
  ui.plan.addEventListener('dragenter', (e) => { if ([...(e.dataTransfer?.types || [])].includes('Files')) { e.preventDefault(); dragDepth++; ui.drop.hidden = false; } });
  ui.plan.addEventListener('dragover', (e) => { if ([...(e.dataTransfer?.types || [])].includes('Files')) e.preventDefault(); });
  ui.plan.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; ui.drop.hidden = true; } });
  ui.plan.addEventListener('drop', (e) => { e.preventDefault(); dragDepth = 0; ui.drop.hidden = true; const fs = [...e.dataTransfer.files]; if (fs.length) gisOpen(fs).then((done) => { if (!done) openAny(fs); }); });   // openAny: 0.7.1 71.27 (the pair)
  // 2026-11-09: the start card can be closed, and its "Sample" button is the only way in to the sample site: the same action is in the command palette (Ctrl+K) while the card is closed
  { const regSample = () => window.ccPalette?.register?.([{ id: 'civil-sample', label: t('ui.hint.sample'), group: 'file', keywords: 'sample example demo site survey points', run: () => $('[data-sample]')?.click() }]); if (window.ccPalette) regSample(); else window.addEventListener('load', regSample); }
  $('[data-sample]').addEventListener('click', async () => {
    try {
      const r = await fetch(new URL('./sample-site.csv', import.meta.url));
      if (!r.ok) throw new Error('HTTP ' + r.status);
      openText(await r.text(), 'sample-site.csv', 'ft');   // 0.10 BK.8: our own sample is in feet and says so (it is not asked about)
    } catch (err) { say(t('cv.sample.noload', { why: err.message })); }
  });







  /** 0.7.1 71.27: the open pair's warnings for the Problems panel (none until the pair module is loaded). */
  function nativeWarnings() {
    return (project.nativeWarnings || []).map((w) => ({ ...w, text: t(w.msg.key, w.msg.vars), fixes: w.fixes.map((a) => ({ id: a, action: a, msg: { key: 'ifc.native.fix.' + (a === 'ifcSave' ? 'save' : 'take'), vars: {} }, text: t('ifc.native.fix.' + (a === 'ifcSave' ? 'save' : 'take')) })) }));
  }
  /** 0.7.1 71.27: the native pair (ifc-native-ui.js, loaded on first use). */
  let nativeReady = null;
  function nativeUi() {
    return (nativeReady ||= import('./ifc-native-ui.js').then((m) => m.createNative({
      host: fileHost, root, say, busy, refocus, fileStem, project: () => project, species: () => lsUi.index(), confirmDiscard: () => confirmDiscard(),
      target: () => projectTarget, setTarget: (f) => { projectTarget = f; },
      openProjectText: async (text, name, from) => { const was = project; openingFrom = from; try { await openProject(text, name); } finally { openingFrom = null; } return project !== was; },
      importIfc: async (f) => (await ifcUi())?.importFile(f),
    })).catch((err) => { nativeReady = null; say(t('ifc.noload', { why: err.message })); return null; }));
  }
  /** 0.7.1 71.27: files opened or dropped: a CivilCraft IFC and / or a project file with its pair go to the pair; true = handled. */
  async function openPairFiles(fs, hfs = []) {
    if (!fs.some((f) => /\.(ifc|json)$/i.test(f.name))) return false;
    const n = await nativeUi();
    return n ? n.openFiles(fs, hfs) : false;
  }
  async function openAny(fs, hfs = []) { if (!(await openPairFiles(fs, hfs))) await openFile(fs[0]); }




  /** 0.7.1 71.24: Export › IFC and opening .ifc files (ifc-civil-ui.js and cc-ifc, loaded on first use). */
  let ifcReady = null;
  function ifcUi() {
    return (ifcReady ||= import('./ifc-civil-ui.js').then((m) => m.installIfc({
      root, say, busy, download, fileStem, refocus, fitAll: () => fitAll(), refresh: () => { refresh(); view.invalidateScene(); view.invalidate(); },
      project: () => project, setProject(p) { project = p; projectTarget = null; rebind(); sel = null; selPvi = -1; lastReport = null; },
      species: () => lsUi.index(), confirmDiscard: () => confirmDiscard(), openPicker: () => command('open'),
    })).catch((err) => { ifcReady = null; say(t('ifc.noload', { why: err.message })); return null; }));
  }
  ui.dwg.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) { ui.dwg.close(); return; }
    if (e.target.closest('[data-dwg-go]')) {
      const v = ui.dwg.querySelector('[data-dwg-format]').value;
      try { localStorage.setItem('civilcraft.dwgFormat', v); } catch { /* storage blocked */ }
      ui.dwg.close();
      if (v === 'DXF') exportDxf(); else exportDwg(v);
    }
  });
  ui.dwg.querySelector('[data-dwg-format]').addEventListener('change', (e) => { ui.dwg.querySelector('[data-dwg-map-row]').hidden = !visibleMaps() || e.target.value === 'DXF'; });
  ui.dwg.addEventListener('close', () => refocus());


  /**
   * The export set's entry (SuperCad Studio's Finalize and export, SC.7): the exporters behind the toolbar's buttons, run with options instead of their dialogs.
   * The files leave through the same download as the buttons' (the host collects them). sheets() → the one plan sheet; can(kind) → null | 'empty' | 'unknown';
   * run(kind, o) → [{ sheets }] for the PDF (what is on its page), else nothing. o = { paper: 'iso-a3' | 'a3' …, scale: '1:500' | 'fit', mono, dwgVersion: '2000' …, ifcSchema }
   */
  const exportSet = {
    kinds: ['pdf', 'dwg', 'dxf', 'landxml', 'ifc'],
    sheets: () => (extentsAll() ? [{ id: 'plan', number: '', title: project.state.name || fileStem(), scale: '', revision: '', paper: '' }] : []),
    can: (kind) => (!exportSet.kinds.includes(kind) ? 'unknown' : extentsAll() ? null : 'empty'),
    async run(kind, o = {}) {
      if (kind === 'pdf') { const r = await plotNow({ paper: String(o.paper || '').replace(/^iso-/, ''), scale: o.scale, mono: !!o.mono, map: true, titleBlock: o.titleBlock || null }); return r ? [{ sheets: [{ id: 'plan', number: '', title: project.state.name || fileStem(), scale: r.scale, revision: '', block: !!o.titleBlock }] }] : []; }
      if (kind === 'dwg') { const code = Object.keys(DWG_YEAR).find((k) => DWG_YEAR[k] === String(o.dwgVersion)); await exportDwg(code || 'AC1015'); }
      else if (kind === 'dxf') await exportDxf();
      else if (kind === 'landxml') await exportLandXml();
      else if (kind === 'ifc') await (await ifcUi())?.exportNow(o.ifcSchema || null);
      return [];
    },
  };

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
        view3d = m.mountSite3D(host3d, { project: () => project, say, cutfill: (box, size) => pfUi.canvasFor(box, size), onPick: pick3D, exag: settings.exag, corner: settings.corner, onExag: (x) => { settings.exag = x; persistSettings(); },
          drape: async () => { await gisLoad(); return gisReg.drape || null; },   // 0.4 V3: map layers draped on the surface
          selection: () => (sel && ['alignment', 'pad', 'feature', 'pipe', 'structure', 'mass', 'ls-hard', 'ls-grade'].includes(sel.kind) ? { kind: sel.kind, id: sel.id } : null),   // 0.4 V5; ls-hard 0.7.1
          onPushPull: pushPullMass,   // 0.7 LC.1 M2: drag a mass's roof in 3D, or PageUp / PageDown
          spots: () => pfUi.map()?.spots || [],   // 0.8 SU.914 rest: spot levels (cut and fill depth) as labels on the surface
          species: () => lsUi.index() });   // 0.7.1 71.19: the plant list, so plants stand in 3D at their size
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

  /** 0.7 LC.1 M2: the roof moved in 3D. While dragging the mass is changed in place (no undo step), the drop makes the one step. */
  const ppFloors = new Map();
  function pushPullMass(id, floors, final) {
    const m = msUi.find(id);
    if (!m) return;
    if (!ppFloors.has(id)) ppFloors.set(id, m.floors);
    if (!final) { m.floors = floors; return; }
    const was = ppFloors.get(id); ppFloors.delete(id);
    m.floors = was;
    if (floors !== was) project.change(t('ms.undo.height'), (st) => { const q = st.masses.find((x) => x.id === id); if (q) q.floors = floors; });
    refresh();
    say(t('ms.pushed', { name: m.name, floors }));
  }

  /** A click in 3D: survey points join the point selection, pipes and structures open in Properties. */
  function pick3D(hit) {
    if (hit.kind === 'point') { picked = new Set([String(hit.id)]); sel = null; selPvi = -1; refresh(); return true; }
    if (hit.kind === 'mass') { picked.clear(); sel = { kind: 'mass', id: hit.id }; selPvi = -1; refresh(); return true; }   // 0.7 LC.1
    if (hit.kind === 'pipe' || hit.kind === 'structure') { picked.clear(); sel = { kind: hit.kind, id: hit.id }; selPvi = -1; refresh(); return true; }
    // 0.4 V5: alignments, pads and feature lines picked in 3D select as on the plan; a breakline is named in the tip only
    if (hit.kind === 'alignment' || hit.kind === 'pad' || hit.kind === 'feature') { picked.clear(); sel = { kind: hit.kind, id: hit.id }; selPvi = -1; refresh(); return true; }
    if (hit.kind === 'breakline') { say(t('v3d.pick.breakline', { name: hit.name })); return false; }
    // 0.7.1 71.19: a plant (or a bed's or hedge's plant) and hardscape picked in 3D select as on the plan (Properties)
    if (/^ls-(plant|bed|hedge|hard|grade)$/.test(hit.kind) && lsUi.isMine({ kind: hit.kind, id: hit.id })) { picked.clear(); sel = { kind: hit.kind, id: hit.id }; selPvi = -1; refresh(); return true; }
    return false;
  }

  view.onFirstSize = () => fitAll();
  applyCorner();
  refresh();
  // 0.7 WS.12 (session ws-civilcraft): the workspace layouts (Settings › Global › Layout) on the shell's engine, only where the page
  // carries the engine's config (manifest "workspaces"); a failed start shows the classic layout at once
  if (document.getElementById('cc-workspace')) import('./workspace-civilcraft.js').then((m) => m.mountCivilWorkspace({ root }))
    .catch((err) => { console.error(err); document.documentElement.removeAttribute('data-cc-ws-boot'); });
}

// FX: a box too narrow for its number (Easting 615005.25 shows "615005") shows the whole value in the tooltip while the pointer
// or the keyboard is on it. One listener for the page; it only looks at a box when the pointer enters or focus lands on it.
// 0.9.1: the tooltip itself is app-tooltips.js (ccTooltips.showText), the one engine; this only decides when a value is cut off.
{
  let tipFor = null;
  const hide = () => { if (tipFor) window.ccTooltips?.hide(); tipFor = null; };
  const show = (inp) => {
    if (!window.ccTooltips || !inp.isConnected || inp === tipFor) return;
    hide();
    if (!inp.value || inp.scrollWidth <= inp.clientWidth + 1) return;   // it fits: nothing to add
    tipFor = inp;
    window.ccTooltips.showText(inp, inp.value, 0);
  };
  const boxOf = (t) => (t instanceof Element ? t.closest('input.cv-input') : null);
  document.addEventListener('pointerover', (e) => { if (e.pointerType === 'touch') return; const b = boxOf(e.target); if (b) show(b); });
  document.addEventListener('pointerout', (e) => { if (tipFor && !(e.relatedTarget instanceof Node && tipFor.contains(e.relatedTarget)) && boxOf(e.target) === tipFor && document.activeElement !== tipFor) hide(); });
  document.addEventListener('focusin', (e) => { const b = boxOf(e.target); if (b) show(b); });
  document.addEventListener('focusout', (e) => { if (boxOf(e.target) === tipFor) hide(); });
  document.addEventListener('input', (e) => { if (boxOf(e.target) === tipFor) hide(); });
}
