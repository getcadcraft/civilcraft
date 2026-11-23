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
import { rebuildOffPage, rebuilding, rebuildDone } from './open-async.js';   // 0.11 (the cap lifted): a big surface is rebuilt off the page after an edit
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
import { snapTargets, nearestSnap, snapSegments, segmentSnap, translate, rotate, bearingBetween, setTangent, copyOf } from './snap.js';   // 0.9 WB.10 + WB.15
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
import { createSheetsDialog } from './pp-ui.js';
import { createPipeProfile } from './pipe-profile-ui.js';   // 0.11 SU.1937   // 0.4 V15
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
import { mountKeys } from './keys-ui.js';
import { mountOverlay } from './overlay-ui.js';
import { mountPick } from './pick-ui.js';
import { mountPointer } from './pointer-ui.js';
import { mountDraft } from './draft-ui.js';
import { mountEdit } from './edit-ui.js';
import { mountCommand } from './command-ui.js';
import { mountProfile } from './profile-ui.js';

const root = document.querySelector('[data-civilcraft]');
// root plus any toolbar torn off into its own window (app-toolbar-tear.js), so pressed and greyed-out states reach it (0.9 fix 2026-11-02)
const tearAll = (s) => (window.ccToolbarTear?.all ? window.ccToolbarTear.all(root, s) : [...root.querySelectorAll(s)]);
if (root) init(root);
// Touch screens (0.4 S.8): the first touch marks the app, so CSS gives bigger targets and the draft bar shows
if (root) root.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') root.classList.add('is-touch'); }, { capture: true, passive: true });

function init(root) {
  // PERF.71 round two (perf-finish-11 code): the closure's mutable state in one object (tools/perf/main-state.mjs); was one `let` each
  const ST = { hintClosed: undefined, project: undefined, measClosed: undefined, tool: undefined, draft: undefined, sel: undefined, selPvi: undefined, cursor: undefined, snapPt: undefined, hoverPt: undefined, profCursor: undefined, hotVertex: undefined, snapHit: undefined, pickJob: undefined, drag: undefined, pvDrag: undefined, lastReport: undefined, picked: undefined, pickLast: undefined, pasteJob: undefined, clip: undefined, gnSrc: undefined, egSrc: undefined, lsSrcRef: undefined, draftClosed: undefined, flArc: undefined, flMid: undefined, gisReady: undefined, bandCache: undefined, asDoc: undefined, idsUi: undefined, afProps: undefined, propsPtr: undefined, pendingProps: undefined, pvHover: undefined, pvPick: undefined, profSnap: undefined, profSnapOn: undefined, profPan: undefined, pinch: undefined, spaceDown: undefined, longTimer: undefined, sayTimer: undefined, pendingClip: undefined, projectTarget: undefined, openingFrom: undefined, dragDepth: undefined, nativeReady: undefined, ifcReady: undefined, leaving: undefined };
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
  ST.hintClosed = false;   // the start card closed with its X
  const unitLabels = [...root.querySelectorAll('[data-unit]')];   // kept: a panel moved to the panels window leaves root

  ST.project = new Project();
  ST.project.state.units = newProjectUnits();   // 0.7 UNITS: the starred length unit, else feet
  ST.measClosed = false;   // 0.7 PL.10: the Measure tool closed its shape (the next click starts a new one)
  ST.tool = 'select';
  ST.draft = [];
  ST.sel = null;
  ST.selPvi = -1;
  ST.cursor = null;
  ST.snapPt = null;
  ST.hoverPt = null;
  ST.profCursor = null;
  const SNAP_TOOLS = ['alignment', 'pad', 'parcel', 'mass', 'feature', 'measure', 'boundary', 'catchment', 'ramp', 'free-section', 'util-run'];   // 0.10.1 #1970: the ramp and free-section tools snap too
  ST.hotVertex = null;   // 0.10.1 #1970: the vertex whose row is under the pointer or has the focus in Properties { x, y, n }
  ST.snapHit = null;
  ST.pickJob = null;   // 0.9 WB.10: the vertex or point the pointer snaps to · a Pick button waiting for a plan click { label, cb }
  ST.drag = null;
  ST.pvDrag = null;
  ST.lastReport = null;
  ST.picked = new Set();         // selected survey points, by point number
  ST.pickLast = '';              // SC.5: the pick last announced to the page (announcePick, below)
  ST.pasteJob = null;            // { pts, anchor, label, from, note } while the Paste tool carries points
  ST.clip = null;                // this tab's copy (readClip shape)
  const DEFAULT_R = { ft: 100, m: 30 };

  const view = new PlanView(ui.base, ui.over, { scene: buildScene, bands, underlay: (ctx, v) => { for (const f of gisReg.underlay) f(ctx, v); } });
  const { drawOverlay } = mountOverlay({
    ST, units, syncDraftBar,
    get drUi() { return drUi; },
    get pcUi() { return pcUi; },
    get msUi() { return msUi; },
    get gisReg() { return gisReg; },
    get secUi() { return secUi; },
    get flUi() { return flUi; },
    get swUi() { return swUi; },
    get lsUi() { return lsUi; },
    get plUi() { return plUi; },
    get pfUi() { return pfUi; },
    get solarUi() { return solarUi; },
    get geoUi() { return geoUi; },
    get wmUi() { return wmUi; },
    get rvUi() { return rvUi; },
    get selAl() { return selAl; },
    get selPad() { return selPad; },
    get selStruct() { return selStruct; },
    get selPipe() { return selPipe; },
    get findStruct() { return findStruct; },
    get findAl() { return findAl; },
    get u() { return u; },
    get hotPoint() { return hotPoint; },
  });
  view.drawOverlay = drawOverlay;
  const pview = new ProfileView(ui.prof);
  const { openFile, openText, openProject, download, fileStem, saveProject, saveOlder, exportLandXml, extentsAll, fitAll, exportDxf, DWG_YEAR, dwgDialog, exportDwg, visibleMaps, plotNow, plotDialog } = mountFiles({
    ui, view, gisLoad, buildScene, refresh, rebind, say, nativeUi, ifcUi, refocus, busy, confirmDiscard,
    get openingFrom() { return ST.openingFrom; },
    get project() { return ST.project; }, set project(v) { ST.project = v; },
    get projectTarget() { return ST.projectTarget; }, set projectTarget(v) { ST.projectTarget = v; },
    get sel() { return ST.sel; }, set sel(v) { ST.sel = v; },
    get selPvi() { return ST.selPvi; }, set selPvi(v) { ST.selPvi = v; },
    get lastReport() { return ST.lastReport; }, set lastReport(v) { ST.lastReport = v; },
    get gisReg() { return gisReg; },
    get settings() { return settings; },
    get picked() { return ST.picked; },
    get eg() { return eg; },
    get fileHost() { return fileHost; },
    get asDoc() { return ST.asDoc; },
    get graded() { return graded; },
    get units() { return units; },
    get shown() { return shown; },
    get u() { return u; },
    get TEXT_PARTS_FROM() { return TEXT_PARTS_FROM; },
  });
  // 0.4 V13: sample lines and the section view (sections-ui.js); `row` and friends are defined further down, so wrapped
  const secUi = createSections({ root, el, project: () => ST.project, units, say, download, fileStem,
    numInput, row, layout: () => { updateTools(); view.resize(); }, redraw: () => view.invalidate(),
    focusAlignment: (id) => { ST.sel = { kind: 'alignment', id }; ST.selPvi = -1; refresh(); }, otherPanel: (on) => { if (!on && !ui.profPanel.hidden) { ui.profPanel.hidden = true; } } });
  const { finishDraft } = mountDraft({
    ST, DEFAULT_R, view, refresh, setTool, measureText, fitRadius, say,
    get findAl() { return findAl; },
    get u() { return u; },
    get eg() { return eg; },
    get diaU() { return diaU; },
    get pcUi() { return pcUi; },
    get msUi() { return msUi; },
    get lsUi() { return lsUi; },
    get egUi() { return egUi; },
    get utUi() { return utUi; },
    get pfUi() { return pfUi; },
    get rvUi() { return rvUi; },
    get plUi() { return plUi; },
    get drUi() { return drUi; },
    get flUi() { return flUi; },
  });
  const { deleteSelected, pickedPoints, selectAll, selectNone, storedClip, copyPoints, pasteFromButton, paste, duplicatePoints, commitPaste } = mountEdit({
    ST, view, units, refresh, updateTools, setTool, say,
    get selAl() { return selAl; },
    get findAl() { return findAl; },
    get selPad() { return selPad; },
    get selStruct() { return selStruct; },
    get flUi() { return flUi; },
    get drUi() { return drUi; },
    get pcUi() { return pcUi; },
    get msUi() { return msUi; },
    get swUi() { return swUi; },
    get lsUi() { return lsUi; },
    get plUi() { return plUi; },
    get rvUi() { return rvUi; },
    get wmUi() { return wmUi; },
    get selPipe() { return selPipe; },
    get settings() { return settings; },
  });
  const { snapHere, armPick, setHot, hotPoint, endPick, pickBtn, click, boxSelect, lassoTrack, lassoPick, nearestPoint, gripAt } = mountPick({
    ST, ui, SNAP_TOOLS, view, refresh, commitPaste, measureText, finishDraft, say, is3D,
    get lsUi() { return lsUi; },
    get wmUi() { return wmUi; },
    get plUi() { return plUi; },
    get selAl() { return selAl; },
    get selPad() { return selPad; },
    get gripR() { return gripR; },
    get findAl() { return findAl; },
    get flUi() { return flUi; },
    get findPad() { return findPad; },
    get selStruct() { return selStruct; },
    get net() { return net; },
    get findStruct() { return findStruct; },
    get gisReg() { return gisReg; },
    get rvUi() { return rvUi; },
    get msUi() { return msUi; },
    get drUi() { return drUi; },
    get pcUi() { return pcUi; },
    get swUi() { return swUi; },
  });
  const { showProfile, renderProfile, pviPickBtn, slopeCell, setPviAdd } = mountProfile({
    ST, ui, view, pview, secUi, units, refresh, updateTools, renderProps, numInput, say,
    get utUi() { return utUi; },
    get findAl() { return findAl; },
    get flUi() { return flUi; },
    get command() { return command; },
  });
  const { command } = mountCommand({
    ST, ui, view, secUi, deleteSelected, copyPoints, pasteFromButton, duplicatePoints, selectAll, selectNone, gisLoad, refresh, rebind, showProfile, setTool, say, openHostFiles, ifcUi, confirmDiscard, is3D, show3D,
    get fileHost() { return fileHost; },
    get OPEN_TYPES() { return OPEN_TYPES; },
    get saveProject() { return saveProject; },
    get saveOlder() { return saveOlder; },
    get exportLandXml() { return exportLandXml; },
    get exportDxf() { return exportDxf; },
    get dwgDialog() { return dwgDialog; },
    get plotDialog() { return plotDialog; },
    get view3d() { return view3d; },
    get fitAll() { return fitAll; },
    get lsUi() { return lsUi; },
    get plUi() { return plUi; },
    get wmUi() { return wmUi; },
    get issUi() { return issUi; },
    get utUi() { return utUi; },
    get pkUi() { return pkUi; },
    get fcUi() { return fcUi; },
    get geoUi() { return geoUi; },
    get moUi() { return moUi; },
    get solarUi() { return solarUi; },
    get egUi() { return egUi; },
    get rvUi() { return rvUi; },
    get pfUi() { return pfUi; },
    get gdUi() { return gdUi; },
    get tpUi() { return tpUi; },
    get msUi() { return msUi; },
    get GIS_CMDS() { return GIS_CMDS; },
    get gisReg() { return gisReg; },
  });
  // 0.4 V14: feature lines (features-ui.js)
  const flUi = createFeatures({ el, project: () => ST.project, units, say, numInput, row,
    select: (x) => { ST.sel = x; ST.selPvi = -1; ST.picked.clear(); refresh(); }, command, eg: () => eg().surface,
    hot: setHot, pickBtn, armPick, graded: () => graded().surface });   // 0.10.1 #1970
  const drUi = createDrainage({ el, root, download, fileStem, project: () => ST.project, units, numInput, row, say,   // 0.4 V19/V20
    select: (x) => { ST.picked.clear(); ST.sel = x; ST.selPvi = -1; refresh(); }, refresh: () => refresh(), tool: (x) => { if (ST.tool !== x) setTool(x); } });
  const seUi = createSewer({ el, project: () => ST.project, units, numInput, row, say,   // 0.6 LC.16 S1
    select: (x) => { ST.picked.clear(); ST.sel = x; ST.selPvi = -1; refresh(); }, refresh: () => refresh() });
  const pcUi = createParcels({ root, el, project: () => ST.project, units, numInput, row, say,   // 0.4 V21
    select: (x) => { ST.picked.clear(); ST.sel = x; ST.selPvi = -1; refresh(); }, tool: (x) => { if (ST.tool !== x) setTool(x); }, refocus,
    download: (name, blob) => download(blob, name), fileStem });
  const msUi = createMassing({ el, project: () => ST.project, units, numInput, row, say,   // 0.7 LC.1 M1
    select: (x) => { ST.picked.clear(); ST.sel = x; ST.selPvi = -1; refresh(); }, tool: (x) => { if (ST.tool !== x) setTool(x); }, refresh: () => refresh(), redraw: () => view.invalidate(), bimUrl: () => root.dataset.bimUrl || '', bimApp: () => root.dataset.bimApp || '', download: (name, blob) => download(blob, name),
    ground: (which) => { const s = which === 'fg' ? graded().surface : null; const sf = s || eg().surface; return sf ? (x, y) => { const z = sf.elevationAt(x, y, 1e-6); return Number.isFinite(z) ? z : null; } : null; } });
  const tvUi = createTraverse({ root, el, project: () => ST.project, units, say, refocus,   // 0.4 V22
    download: (name, blob) => download(blob, name), fileStem, addParcel: (...x) => pcUi.addParcel(...x),
    afterPoints: (ns) => { ST.picked = new Set(ns); ST.sel = null; ST.selPvi = -1; refresh(); } });
  const skUi = createStaking({ root, el, project: () => ST.project, units, say, refocus,   // 0.4 V23
    download: (name, blob) => download(blob, name), fileStem });
  const stUi = createStructs({ root, el, project: () => ST.project, units, say, refocus,   // 0.6 WL.27
    download, select: (x) => { ST.sel = x; ST.selPvi = -1; ST.picked.clear(); refresh(); } });
  const swUi = createSwept({ root, el, project: () => ST.project, units, say, refocus,   // 0.6 WL.28
    select: (x) => { ST.sel = x; ST.selPvi = -1; ST.picked.clear(); refresh(); }, command, redraw: () => view.invalidate() });
  const lsUi = createLandscape({ root, el, project: () => ST.project, units, say, refocus,   // 0.7 LD: Landscape (landscape/)
    select: (x) => { ST.sel = x; ST.selPvi = -1; ST.picked.clear(); refresh(); }, command, setTool, tool: () => ST.tool,
    redraw: () => { view.invalidateScene(); view.invalidate(); }, refresh: () => refresh(), download, fileStem,
    numInput, row, cursor: () => ST.cursor, surface: () => graded().surface || eg().surface, buildScene, extents: extentsAll,
    groundAt: (x, y) => { const z = (graded().surface || eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; },
    existing: () => eg().surface, tol: () => 8 / view.zoom });   // 0.8 LA.4 (landscape-arch_PART_4): existing-ground level labels and cut/fill per modifier
  const plUi = createPowerlines({ root, el, project: () => ST.project, units, say, refocus,   // 0.7 PL: Power lines (powerline/)
    select: (x) => { ST.sel = x; ST.selPvi = -1; ST.picked.clear(); refresh(); }, selection: () => ST.sel, command, setTool, tool: () => ST.tool,
    redraw: () => { view.invalidateScene(); view.invalidate(); }, refresh: () => refresh(), download, fileStem,
    numInput, row, cursor: () => ST.cursor, surface: () => graded().surface || eg().surface, buildScene, extents: extentsAll,
    network: () => ST.project.state.network, landscape: () => lsUi, groundAt: (x, y) => { const z = (graded().surface || eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; } });
  const rvUi = createRivers({ root, el, project: () => ST.project, units, numInput, row, say, select: (x) => { ST.picked.clear(); ST.sel = x; ST.selPvi = -1; refresh(); }, selection: () => ST.sel,   // 0.8 SU.957
    setTool, refresh: () => refresh(), redraw: () => view.invalidate(), scene: () => view.invalidateScene(), download: (name, blob) => download(blob, name), fileStem, surface: () => eg().surface });
  const pfUi = createPlatform({ root, el, project: () => ST.project, units, say, setTool, download: (name, blob) => download(blob, name), fileStem, legend: ui.legend, refresh: () => refresh(), redraw: () => view.invalidate() });   // 0.8 SU.914
  const wmUi = createWater({ root, el, project: () => ST.project, units, numInput, row, say, select: (x) => { ST.picked.clear(); ST.sel = x; ST.selPvi = -1; refresh(); }, selection: () => ST.sel,   // 0.8 LC.16
    setTool, redraw: () => { view.invalidate(); wmUi.refreshWindow(); }, download: (name, blob) => download(blob, name), fileStem, tol: () => 8 / view.zoom, groundAt: (x, y) => { const z = (graded().surface || eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; } });
  // 0.10 CV.1 / SU.1810: what the Issues and Utility networks windows ask of the page
  function geomOfSel() {
    const x = ST.sel; if (!x) return null;
    if (x.kind === 'alignment') { const a = findAl(x.id), al = a && ST.project.alignment(a); return al?.ok ? { kind: 'alignment', id: a.id, name: a.name, al, pts: al.polyline(Math.max(al.length / 400, units() === 'm' ? 1 : 3), Math.PI / 180).map((q) => ({ x: q.x, y: q.y })) } : null; }
    if (x.kind === 'feature') { const f = (ST.project.state.features || []).find((q) => q.id === x.id); return f ? { kind: 'feature', id: f.id, name: f.name, pts: f.pts.map((q) => ({ x: q.x, y: q.y })), closed: f.closed === true } : null; }
    if (x.kind === 'parcel') { const f = (ST.project.state.parcels || []).find((q) => q.id === x.id); return f?.pts?.length >= 3 ? { kind: 'parcel', id: f.id, name: f.name, pts: f.pts.map((q) => ({ x: q.x, y: q.y })), closed: true } : null; }   // 0.10 SU.1815: closed outlines for the parking lot and fence tools
    if (x.kind === 'pad') { const f = (ST.project.state.pads || []).find((q) => q.id === x.id); return f?.pts?.length >= 3 ? { kind: 'pad', id: f.id, name: f.name, pts: f.pts.map((q) => ({ x: q.x, y: q.y })), closed: true } : null; }
    if (x.kind === 'pipe') { const n = ST.project.state.network, q = n?.pipes.find((p) => p.id === x.id), a = q && n.structures.find((v) => v.id === q.from), b = q && n.structures.find((v) => v.id === q.to); return a && b ? { kind: 'pipe', id: q.id, name: q.name, pts: [{ x: a.x, y: a.y }, { x: b.x, y: b.y }] } : null; }
    if (x.kind === 'structure') { const v = ST.project.state.network?.structures.find((q) => q.id === x.id); return v ? { kind: 'structure', id: v.id, name: v.name, pts: [{ x: v.x, y: v.y }] } : null; }
    return null;
  }
  const groundHere = (x, y) => { const z = (graded().surface || eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; };
  function groundExisting(x, y) { const z = eg().surface?.elevationAt(x, y); return Number.isFinite(z) ? z : null; }   // 0.10 SU.1815: a lot is graded against the EXISTING ground, never its own result
  const issUi = createIssues({ root, el, project: () => ST.project, units, say, refocus, download: (name, blob) => download(blob, name), fileStem, view,
    selected: geomOfSel, groundAt: groundHere, refresh: () => { view.invalidateScene(); view.invalidate(); },
    problems: () => { const P = window.ccProblems; return P ? P.store.list({ accepted: 'hide', t }).map((p) => ({ id: p.id, text: p.text || (p.msg ? t(p.msg.key, p.msg.vars) : ''), where: p.where })) : []; } });
  const utUi = createUtilnet({ root, el, project: () => ST.project, units, say, refocus, download: (name, blob) => download(blob, name), fileStem,
    selected: geomOfSel, groundAt: groundHere, setTool, tool: () => ST.tool, refresh: () => { view.invalidateScene(); view.invalidate(); } });
  const pkUi = createParking({ root, el, project: () => ST.project, units, say, refocus, download: (name, blob) => download(blob, name), fileStem,   // 0.10 SU.1815
    selected: geomOfSel, groundAt: groundExisting, seed: () => lsUi.seedSpecies(), refresh: () => { view.invalidateScene(); view.invalidate(); } });
  const fcUi = createFence({ root, el, project: () => ST.project, units, say, refocus, download: (name, blob) => download(blob, name), fileStem,   // 0.10 SU.1814b
    selected: geomOfSel, groundAt: groundHere, refresh: () => { view.invalidateScene(); view.invalidate(); } });
  ST.gnSrc = null;   // the ground and platform steps' Problems source
  ST.egSrc = null;   // the Problems source for the round-2 tools (set where the sources are made)
  ST.lsSrcRef = null;   // 0.8 LA.4 (landscape-arch_PART_4): the Landscape junctions source (re-checked after a link regenerates)
  const egUi = createEg({ root, el, project: () => ST.project, units, say, download: (name, blob) => download(blob, name), fileStem,   // 0.8 round 2
    ground: () => eg().surface, graded, setTool, refresh: () => refresh(), redraw: () => { view.invalidate(); }, problemsChanged: () => ST.egSrc?.invalidate() });
  const geoUi = createGeo({ root, el, project: () => ST.project, units, say, download: (name, blob) => download(blob, name), fileStem, ground: () => eg().surface, redraw: () => view.invalidate(), problemsChanged: () => ST.egSrc?.invalidate() });   // 0.8 round 2 (civil-geo_PART_2)
  const moUi = createMassOptions({ root, el, project: () => ST.project, units, say, download: (name, blob) => download(blob, name), fileStem, select: (x) => { ST.sel = x; ST.selPvi = -1; ST.picked.clear(); refresh(); view.invalidate(); }, refresh: () => { refresh(); view.invalidateScene(); }, redraw: () => view.invalidate() });   // 0.8 EG.58
  const solarUi = createSolar({ root, el, project: () => ST.project, units, say, download: (name, blob) => download(blob, name), fileStem, redraw: () => view.invalidate(), refresh: () => { refresh(); view.invalidateScene(); ST.egSrc?.invalidate(); } });   // 0.8 EG.15
  const gdUi = createGround({ root, el, project: () => ST.project, say });   // 0.8 SU.911
  const tpUi = createTemplates({ root, el, project: () => ST.project, units, numInput, say, refresh: () => refresh(),   // 0.9 SU.1110 + WB.6
    download, fileStem, showProject: () => { ST.sel = null; ST.selPvi = -1; ST.picked.clear(); refresh(); } });
  ST.draftClosed = false;   // 0.4 V14: the Feature line tool closed its line on the first vertex
  // 0.6 WL.24: arcs in the Feature line tool — C (or the touch bar's Arc) turns arc mode on/off; in it, after a vertex the
  // next click is a point on the curve (flMid), the click after that ends the arc (the earlier vertex gets its bulge)
  ST.flArc = false;
  ST.flMid = null;
  function toggleFlArc() {
    if (ST.tool !== 'feature') return;
    ST.flArc = !ST.flArc; ST.flMid = null;
    say(t(ST.flArc ? 'fl.arc.on' : 'fl.arc.off'));
    root.querySelector('[data-draft-act="arc"]')?.setAttribute('aria-pressed', String(ST.flArc));
    view.invalidate();
  }
  // 0.4 V15: plan and profile sheets (pp-ui.js)
  const codesUi = createCodes({ root, el, project: () => ST.project, say, refocus });   // 0.4 V16
  root.querySelector('[data-codes-open]')?.addEventListener('click', () => codesUi.open());
  const pprUi = createPipeProfile({ root, el, project: () => ST.project, units, grade: () => (ST.project.state.network?.type === 'storm' ? drUi.results()?.grade || null : null), download, fileStem, say, refocus });   // 0.11 SU.1937
  const ppUi = createSheetsDialog({ root, el, project: () => ST.project, units, buildScene, download, fileStem, say, refocus });
  // ---- SC.5 (sc-r5-select): the pick is announced to the page (SuperCad Studio hears `cc-pick` and keeps one selection across its panels) and a pick from another
  // panel comes back through window.ccPickers.civilcraft. Both are inert outside Super. Ids are `<kind>:<id>` as the project's object registry names them
  // (`alignment:a1`, `pad:p2`, `parcel:…`, `feature:…`, `swept:…`); survey points are `point:<number>`.
  const PICK_LISTS = { alignment: (st) => st.alignments, pad: (st) => st.pads, parcel: (st) => st.parcels, feature: (st) => st.features, swept: (st) => st.swept,
    structure: (st) => st.network && st.network.structures, pipe: (st) => st.network && st.network.pipes };
  function pickIds() {
    if (ST.sel && ST.sel.kind === 'gis') return ['gis:' + ST.sel.layer + ':' + ST.sel.i];
    if (ST.sel && ST.sel.id != null) return [ST.sel.kind + ':' + ST.sel.id];
    return [...ST.picked].slice(0, 2000).map((n) => 'point:' + n);
  }
  function announcePick() {
    const ids = pickIds(), key = ids.join(',');
    if (key === ST.pickLast) return;
    ST.pickLast = key;
    try { window.dispatchEvent(new CustomEvent('cc-pick', { detail: { app: 'civilcraft', ids } })); } catch { /* no window */ }
  }
  /** Show a pick from another panel: the first object named `<kind>:<id>` that this project has, else the survey points named. → the ids shown, or false */
  function pickApply(refs) {
    const st = ST.project.state, pts = [];
    let hit = null;
    for (const r of (refs || []).slice(0, 5000)) {
      const m = /^([a-z][a-z-]{0,20}):(.{1,120})$/.exec(String(r && r.id != null ? r.id : ''));
      if (!m) continue;
      if (m[1] === 'point') { if (ST.project.pointTable.indexOfName(m[2]) >= 0 || ST.project.points.some((q) => typeof q.n !== 'string' && String(q.n) === m[2])) pts.push(m[2]); continue; }   // 0.11: by the names, not one object a point
      const list = Object.hasOwn(PICK_LISTS, m[1]) ? PICK_LISTS[m[1]](st) : null, o = Array.isArray(list) ? list.find((x) => x && String(x.id) === m[2]) : null;
      if (o && !hit) hit = { kind: m[1], id: o.id };
    }
    if (!hit && !pts.length) return false;
    if (hit) { ST.picked.clear(); ST.sel = hit; } else { ST.picked = new Set(pts); ST.sel = null; }
    ST.selPvi = -1;
    ST.pickLast = pickIds().join(',');   // shown from elsewhere: not a new pick of this panel
    refresh();
    return pickIds();
  }
  (window.ccPickers = window.ccPickers || {}).civilcraft = { apply: pickApply, get: () => ({ ids: pickIds() }), clear: () => { if (ST.sel || ST.picked.size) { ST.picked.clear(); ST.sel = null; ST.selPvi = -1; ST.pickLast = ''; refresh(); } return true; } };
  window.civilcraft = {
    get project() { return ST.project; }, view, pview, structs: stUi, swept: swUi, setTool, command, openText, select: (s) => { ST.sel = s; ST.selPvi = -1; refresh(); },
    get tool() { return ST.tool; }, get sel() { return ST.sel; }, get selPvi() { return ST.selPvi; }, get picked() { return [...ST.picked]; },
    pick: (nums) => { ST.picked = new Set(nums.map(String)); ST.sel = null; ST.selPvi = -1; refresh(); }, clip: () => ST.clip || storedClip(), get settings() { return settings; }, toScreen: (x, y) => { const r = ui.over.getBoundingClientRect(), s = view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; },
    profToScreen: (sta, z) => { const r = ui.prof.getBoundingClientRect(), s = pview.toScreen(sta, z); return { x: r.left + s.x, y: r.top + s.y }; },
    get view3d() { return view3d; }, show3D, get planCube() { return planCube; },
    get gis() { return gisHost; }, gisLoad,
    get sections() { return secUi; },   // 0.4 V13
    get hot() { const p = hotPoint(); return p ? { x: p.x, y: p.y } : null; }, get snap() { return ST.snapHit; }, get features() { return flUi; },   // 0.10.1 #1970 (tests)
    get landscape() { return lsUi; },   // 0.7 LD
    get powerlines() { return plUi; },   // 0.7 PL
    get templates() { return tpUi; },   // 0.9 SU.1110 + WB.6 (tests)
    get rivers() { return rvUi; }, get platform() { return pfUi; }, get water() { return wmUi; },   // 0.8 SU.957 / SU.914 / LC.16 (tests)
    get sheets() { return ppUi; },   // 0.4 V15
    get pipeProfile() { return pprUi; },   // 0.11 SU.1937
    say,   // Studio Live (0.5 LV.22, live.js): its messages
    get exportSet() { return exportSet; },   // Finalize and export in SuperCad Studio (SC.7): the exporters with options, no dialogs
  };
  // the menu styles (0.5 IP.3, input-civilcraft.js + the shell's app-input-ui.js): their messages go to the status line;
  // letters stay CivilCraft's while a line is being drawn (draft points: Backspace, Enter)
  window.ccInputHooks = { status: (m) => say(m || ''), busy: () => ST.draft.length > 0 || ST.tool === 'paste' };

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
  ST.gisReady = null;
  function gisLoad() {
    return (ST.gisReady ||= import('./gis-ui.js').then((m) => m.install(gisHost)).catch((err) => { ST.gisReady = null; say(t('cv.gis.noload', { why: err.message })); throw err; }));
  }
  const gisHost = {
    reg: gisReg, root, ui, view, el, say, busy, ask, download, refresh: () => refresh(), refocus,
    get project() { return ST.project; }, get settings() { return settings; }, get cursor() { return ST.cursor; },
    fileStem, fitAll, extentsAll, confirmDiscard,
    /** Replace the open project (a GIS or terrain file opened as a new project). Asks nothing: call confirmDiscard first. */
    setProject(p) { ST.project = p; rebind(); ST.sel = null; ST.selPvi = -1; ST.lastReport = null; refresh(); fitAll(); },
    /** Notes to show in the project summary, like a file's import report. */
    report(notes) { ST.lastReport = notes?.length ? notes : null; renderProps(); },
    // GIS: open files as Open/drop does (the openers); the selection ({kind:'gis', layer, i} for a GIS feature)
    open: gisOpen, select: (s) => { ST.sel = s; ST.selPvi = -1; ST.picked.clear(); refresh(); }, get sel() { return ST.sel; },
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
  function units() { return ST.project.state.units; }
  const u = () => unitOf(units());
  const eg = () => ST.project.eg();
  function graded() { return ST.project.graded(); }
  const shown = () => (ST.project.state.display.surface === 'fg' && graded().surface ? { s: graded().surface, tag: 'fg' } : { s: eg().surface, tag: 'eg' });
  const findAl = (id) => ST.project.state.alignments.find((a) => a.id === id);
  const findPad = (id) => ST.project.state.pads.find((p) => p.id === id);
  const selAl = () => (ST.sel?.kind === 'alignment' ? findAl(ST.sel.id) : null);
  const selPad = () => (ST.sel?.kind === 'pad' ? findPad(ST.sel.id) : null);
  const net = () => ST.project.state.network;
  const findStruct = (id) => net()?.structures.find((x) => x.id === id);
  const findPipe = (id) => net()?.pipes.find((x) => x.id === id);
  const selStruct = () => (ST.sel?.kind === 'structure' ? findStruct(ST.sel.id) : null);
  const selPipe = () => (ST.sel?.kind === 'pipe' ? findPipe(ST.sel.id) : null);
  const diaU = () => DIA_UNIT[units() === 'm' ? 'm' : 'ft'];

  function buildScene(mm) {
    const s = ST.project.state, d = s.display, sh = shown();
    const gr = graded();
    const padsOut = s.pads.map((p) => { const g = gr.items?.find((x) => x.id === p.id); return { name: p.name, pts: p.pts, z: Number(p.z), daylight: g?.daylight || [], rays: (g?.rays || []).filter((r) => r.kind !== 'wall'), walls: g?.walls || [] }; });   // walls: 0.7.1 71.22
    const breaklines = sh.tag === 'eg' ? ST.project.egBreaklines() : [];
    const bnd = s.surface.boundary;
    const scene = planScene({
      units: s.units, points: ST.project.points, pointTable: ST.project.pointTable, surface: sh.s,   // pointTable: 0.11, the points as one item past 2,000,000
      contours: { interval: Number(d.interval), major: Number(d.major), list: sh.s ? ST.project.contours(sh.s, sh.tag) : [] },
      breaklines: bnd ? [...breaklines, { name: 'boundary', pts: [...bnd, bnd[0]] }] : breaklines,
      alignments: s.alignments.map((a) => ({ name: a.name, alignment: ST.project.alignment(a), pis: a.pis })),
      pads: padsOut,
      corridors: (gr.items || []).filter((x) => x.kind === 'corridor').map((x) => ({ lines: x.lines, sections: x.sections })),
      network: s.network ? { net: s.network, check: ST.project.networkCheck() } : null,
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
    if (d.pads !== false) scene.items.push(...railSceneItems(eg().surface ? (gr.items || []).filter((x) => x.kind === 'corridor') : ST.project.standInCorridors()));
    // CV.1 2026-11-12: turnouts and crossovers on their alignments (C-RAIL-TURN) and each railway's clearance envelope (C-RAIL-CLRN)
    if (d.alignments !== false) {
      for (const x of ST.project.allTurnouts()) scene.items.push(...turnoutSceneItems(x.placed, { unitPerMm: 1 / mm }));
      for (const a of ST.project.state.alignments) if (a.rail?.on && a.rail.clearance?.on) scene.items.push(...clearanceSceneItems(ST.project.railClearance(a), { unitPerMm: 1 / mm }));
    }
    for (const f of gisReg.scene) f(scene, mm);
    return scene;
  }

  ST.bandCache = null;
  function bands() {
    { const cf = pfUi.bands(); if (cf) return cf; }   // 0.8 SU.914: the cut and fill map instead of the elevation bands
    const d = ST.project.state.display, sh = shown();
    if (!d.bands || !sh.s) { ui.legend.hidden = true; return null; }
    const key = ST.project.version + '|' + sh.tag + '|' + d.bandCount + '|' + view.dark;
    if (ST.bandCache?.key === key) return ST.bandCache.list;
    const st = sh.s.stats(), n = Number(d.bandCount) || 8;
    const levels = []; for (let i = 1; i < n; i++) levels.push(st.minZ + ((st.maxZ - st.minZ) * i) / n);
    const colors = []; for (let i = 0; i < n; i++) colors.push(bandColor(i / Math.max(1, n - 1), view.dark));
    const list = sh.s.bands(levels).map((b) => ({ color: colors[b.band + 1], loop: b.loop }));
    ST.bandCache = { key, list };
    // legend
    ui.legend.replaceChildren(...colors.map((c, i) => el('div', {}, el('span', { className: 'cv-swatch', style: 'background:' + c }),
      fixed(i ? levels[i - 1] : st.minZ, 2) + ' – ' + fixed(i < n - 1 ? levels[i] : st.maxZ, 2))).reverse());
    ui.legend.hidden = false;
    return list;
  }

  // ------------------------------------------------------------------ refresh
  function refresh(kind) {
    if (ST.picked.size && kind !== 'display' && kind !== 'surface') {   // 0.11: a few picked points are looked up by name; many, through one set of the names (no point objects)
      const T = ST.project.pointTable;
      if (ST.picked.size <= 64) { for (const n of ST.picked) if (T.indexOfName(n) < 0 && !T.irregularName(n)) ST.picked.delete(n); }
      else { const have = T.nameSet(); for (const n of ST.picked) if (!have.has(n)) ST.picked.delete(n); }
    }
    view.invalidateScene();
    renderLeft();
    renderProps();
    shellM?.changed();
    renderProfile();
    secUi.render();   // 0.4 V13
    updateTools();
    announcePick();   // SC.5: every change of the selection ends in a refresh
    if (kind !== 'display') ST.bandCache = null;
    view3d?.refresh();
    window.dispatchEvent(new CustomEvent('cc-addon-model-changed'));   // the add-ons' model host (below)
  }
  ST.project.on(refresh);
  // 0.11 (the cap lifted): from 2,000,000 points an edit's new surface is built in the open Worker; the old one stays on screen until then
  Project.idle = (p) => rebuildDone(p);   // the autosave writes after a running rebuild
  rebuildOffPage.onHandover = (p) => { if (p === ST.project) view.invalidateScene(); };   // the plan's copy of the old surface's lines goes before the new arrive
  Project.bigEg = (p, deps, stale) => {
    const was = rebuilding(p), r = rebuildOffPage(p, deps, stale);
    if (r && !was && p === ST.project) say(t('cv.surface.rebuilding', { n: num(p.pointTable.length) }));
    return r;
  };
  // The add-on host (add-on API 1.4, addons.js): the open project, for the Building regulations add-on's checks. `project` is replaced when a project is
  // opened, so the host reads the variable each time.
  window.ccAddonModel = { current: () => ({ name: ST.project.state.name || '' }), read: (fn) => fn(ST.project) };
  // Autosave (0.4 1.2; app-autosave.js): the project is the document; its copy is the project file's JSON, written ~2 s
  // after changes stop while it has unsaved work. A new or opened project replaces it (the old copy goes: the person kept
  // or discarded that work on purpose).
  const autosave = new Autosave({ app: 'civilcraft' });
  ST.asDoc = null;
  function bindAutosave() {
    ST.asDoc?.close();
    const p = ST.project;
    // 0.10 PERF.24: the first copy is the whole project, then only what each edit changed (lib/history)
    const j = p.autosaveJournal(() => ({ name: fileStem() + '.civilcraft.json', points: p.points.length }));
    ST.asDoc = autosave.doc({ name: fileStem() + '.civilcraft.json', journal: { epoch: j.epoch, base: () => (unsaved() ? j.base() : null), delta: () => (unsaved() ? j.delta() : null) } });
    p.on(() => { if (p !== ST.project) return; ST.asDoc.rename(fileStem() + '.civilcraft.json'); if (unsaved()) ST.asDoc.changed(); else ST.asDoc.clean(); });
  }
  bindAutosave();
  const undoHook = mountUndoHook({ getProject: () => ST.project });   // 0.8 EG.77 undo across apps (follows the project when a file opens: rebind)
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
    try { window.ccAddonsFile?.offer({ addons: ST.project.usesAddons || {} }, el); el.hidden = !el.childNodes.length; } catch (e) { console.warn('add-on offer failed', e); }
  }
  var shellM = null;   // eslint-disable-line no-var
  function rebind() {
    bindAutosave();
    undoHook.attach(); offerAddons();
    ST.project.on(refresh); window.dispatchEvent(new CustomEvent('cc-addon-model-changed')); shellM?.opened(); ST.picked.clear(); ST.pasteJob = null; if (ST.tool === 'paste') ST.tool = 'select';
    for (const f of gisReg.onProject) f(ST.project);
    if (ST.project.state.crs || ST.project.state.gis?.layers?.length) gisLoad().catch(() => {});
  }

  ST.idsUi = null;   // 0.7.1 71.25: the IDS check of the IFC export (ids-ui.js), mounted after the Problems below
  /** An IDS problem names the exported element by GlobalId (0.7.1 71.25): back to the project object the writer made it from. */
  const aboutRef = (p) => {
    const r = p.about[0];
    if (r?.kind !== 'element') return r;
    const [k, id] = String(ST.idsUi?.refOf(r.id)?.tag || '').split('|');
    if (k === 'road') { const c = (ST.project.state.corridors || []).find((x) => String(x.id) === id); return c ? { kind: 'alignment', id: c.alignment } : null; }
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
        run: () => civilProblems({ alignments: ST.project.state.alignments, standIn: eg().surface ? [] : ST.project.standInCorridors(), graded: eg().surface ? (ST.project.graded().items || []) : [], rail: ST.project.railWarnings(), native: nativeWarnings(), templates: ST.project.templateWarnings() }, { t, unit: u().short }),   // templates: 0.9 SU.1110 + WB.6   // native: 71.27 (the IFC pair)   // graded: 71.22 walls and slopes; rail: 71.26
        fix: (p, f) => {
          if (f.action === 'ifcSave' || f.action === 'ifcTake') { nativeUi().then((n) => n?.fix(f.action)); return true; }   // 0.7.1 71.27
          const a = findAl(p.about[0]?.id);
          if (!a) return false;
          if (f.action === 'setR' && Array.isArray(f.args)) {
            const pairs = f.args.filter((x) => Array.isArray(x) && Number.isInteger(x[0]) && a.pis[x[0]] && Number(x[1]) >= 0);
            if (!pairs.length) return false;
            const label = pairs.length > 1 ? t('why.undo.both', { a: pairs[0][0] + 1, b: pairs[1][0] + 1 }) : t('why.undo.r', { pi: pairs[0][0] + 1, r: String(pairs[0][1]) });
            ST.project.change(label, () => { const al = findAl(a.id); for (const [i, r] of pairs) al.pis[i].r = Number(r); }, { keys: ST.project.keysOf('alignments', a.id) });
            say(label); return true;
          }
          if (f.action === 'setL' && f.args && a.pvis?.[f.args.index] && Number(f.args.L) > 0) {
            const v0 = a.pvis[f.args.index], label = t('why.undo.l', { pvi: f.args.index + 1, l: String(f.args.L) });
            ST.project.change(label, () => { const v = findAl(a.id).pvis.find((q) => q.sta === v0.sta); if (v) { v.L = Number(f.args.L); delete v.K; } }, { keys: ST.project.keysOf('alignments', a.id) });
            say(label); return true;
          }
          return false;
        },
      });
      const rsrc = P.source({ id: 'civilcraft.river', kind: 'check', label: t('sx.su957.prob.src'), run: () => riverProblems(ST.project.state.rivers || [], { t, resultsOf: (rid) => rvUi.results(rid)?.result || null, unit: units() === 'm' ? 'm' : 'ft' }), fix: () => false });   // 0.8 SU.957
      const wsrc = P.source({ id: 'civilcraft.water', kind: 'check', label: t('wm.title'), run: () => waterProblems(ST.project.state.water, units() === 'm' ? 'm' : 'ft', { t, result: wmUi.results() }), fix: () => false });   // 0.8 LC.16
      ST.gnSrc = P.source({ id: 'civilcraft.ground', kind: 'check', label: t('ground.prob.src'), run: () => groundProblems(ST.project, { t, units: units() === 'm' ? 'm' : 'ft', spots: pfUi.map()?.spots || [] }), fix: () => false });   // 0.8 SU.911/914 rest
      const lsSrc = P.source({ id: 'civilcraft.landscape', kind: 'check', label: t('ls.prob.src'), run: () => { const m = lsUi.stack.modifiers(); return landscapeProblems(ST.project, { t, units: units() === 'm' ? 'm' : 'ft', linkNotes: lsUi.linkNotes(), regions: m.filter((x) => x.region).map((x) => ({ id: String(x.id), kind: x.selKind, name: x.name, pts: x.region })) }); }, fix: () => false });   // 0.8 LA.4
      ST.lsSrcRef = lsSrc;
      ST.egSrc = P.source({ id: 'civilcraft.eg', kind: 'check', label: t('eg.prob.src'), run: () => [...egUi.problems(), ...geoUi.problems(), ...solarUi.problems()], fix: () => false });   // 0.8 round 2: ponds, overtopping from Make it rain
      const loadAcc = () => P.store.loadAccepted(ST.project.state.problems?.accepted || []);
      const watch = (p) => p.on(() => { if (p !== ST.project) return; loadAcc(); src.invalidate(); rsrc.invalidate(); lsSrc.invalidate(); wsrc.invalidate(); ST.egSrc.invalidate(); ST.gnSrc.invalidate(); });
      watch(ST.project);
      gisReg.onProject.push((p) => { watch(p); loadAcc(); src.invalidate(); rsrc.invalidate(); wsrc.invalidate(); ST.egSrc.invalidate(); ST.gnSrc.invalidate(); lsSrc.invalidate(); });   // New / Open / a GIS file opened as a project (rebind)
      P.adapter({
        t,
        file: fileStem,
        select: (p) => { const r = aboutRef(p); if (!r) return; if (r.kind === 'river') { if (rvUi.find(r.id)) { ST.picked.clear(); ST.sel = { kind: 'river', id: r.id }; ST.selPvi = -1; refresh(); } return; } if (r.kind === 'alignment' && !findAl(r.id)) return; if (r.kind === 'wnode' || r.kind === 'wpipe') { if (wmUi.isMine(r) && (wmUi.model().nodes.some((n) => n.id === r.id) || wmUi.model().pipes.some((q) => q.id === r.id))) { ST.picked.clear(); ST.sel = { kind: r.kind, id: r.id }; ST.selPvi = -1; refresh(); } return; } if (['alignment', 'pad', 'ls-grade', 'ls-hard', 'ls-pa', 'ls-lvl', 'pipe', 'structure', 'mass'].includes(r.kind)) { ST.picked.clear(); ST.sel = { kind: r.kind, id: r.id }; ST.selPvi = -1; refresh(); } },
        focus: (p) => {
          const r0 = aboutRef(p), a = r0?.kind === 'alignment' ? findAl(r0.id) : findAl(p.about[0]?.id);
          if (is3D()) return;
          const area = r0?.kind === 'pad' ? ST.project.state.pads.find((d) => String(d.id) === r0.id) : r0?.kind === 'ls-grade' ? (ST.project.state.landscape?.grading || []).find((g) => String(g.id) === r0.id) : null;
          const pts = p.where?.at ? [{ x: p.where.at[0], y: p.where.at[1] }] : a ? a.pis : area?.pts || [];
          if (!pts.length) return;
          const pad = pts.length === 1 ? (units() === 'm' ? 60 : 200) : 0;
          const b = { minX: Math.min(...pts.map((q) => q.x)) - pad, minY: Math.min(...pts.map((q) => q.y)) - pad, maxX: Math.max(...pts.map((q) => q.x)) + pad, maxY: Math.max(...pts.map((q) => q.y)) + pad };
          view.fit(b);
        },
        saveAccepted: (list) => { ST.project.change(t('problems.undo.accept'), (s) => { if (list.length) s.problems = { accepted: list }; else delete s.problems; }); },
      });
      P.markers(civilMarkers({ view, stage: ui.plan, project: () => ST.project, is3D }));   // problems-08's mount line (docs/0.8-sessions/problems-08-mounts.md)
      loadAcc();
      src.recheck();
      rsrc.recheck();
    };
    if (window.ccProblems) go(); else document.addEventListener('cc-problems-ready', go, { once: true });
  }
  // ---- Check against IDS (0.7.1 71.25; ids-ui.js, cc-ids in ./ids/): the IFC Export › IFC would write — the same model, writer and schema
  // (ifc-civil-model.js, ifc-civil.js; the schema last picked there) — checked against the client's IDS, remembered in the project file
  // (state.ids, one undo step), its failures in the shell's Problems, re-checked a moment after every change
  ST.idsUi = mountIds({
    root, el, t, say, refocus,
    ifc: async () => {
      const [{ civilIfcModel, modelEmpty }, { writeCivilIfc, fileOrigin, SCHEMAS }, { IfcFile }] = await Promise.all([import('./ifc-civil-model.js'), import('./ifc-civil.js'), import('./ifc/model.js')]);
      const p = ST.project, m = civilIfcModel(p, { species: lsUi.index() });
      if (modelEmpty(m)) throw new Error(t('cv.export.none'));
      let schema = 'IFC4X3_ADD2';
      try { const v = localStorage.getItem('civilcraft.ifcSchema'); if (SCHEMAS.includes(v)) schema = v; } catch { /* storage blocked */ }
      const origin = fileOrigin(m);
      if (p.state.crs) { try { const { frame } = await import('./crs.js'); [m.lon, m.lat] = frame(p.state.crs).toLonLat(origin.x, origin.y); } catch { m.lat = m.lon = null; } }
      const r = writeCivilIfc(m, { schema, origin, seed: p.state.name || 'site' });
      return { file: IfcFile.open(new TextEncoder().encode(r.text)), tags: r.tags || {} };
    },
    readRecord: () => (ST.project.state.ids ? { ...ST.project.state.ids, text: ST.project.idsText() } : null),
    // the text once in project.idsTexts; the undo step holds only { name, hash } (lead 2026-10-26: no IDS text in the snapshots)
    writeRecord: (rec) => ST.project.change(t(rec ? 'ids.undo.set' : 'ids.undo.clear'), (s) => { if (rec) s.ids = { name: rec.name, hash: ST.project.idsTexts.put(rec.text) }; else delete s.ids; }),
  });
  { const watchIds = (p) => p.on(() => { if (p === ST.project) ST.idsUi.changed(); }); watchIds(ST.project); gisReg.onProject.push((p) => { watchIds(p); ST.idsUi.changed(); }); }
  window.civilcraftIds = ST.idsUi;   // for tests (tools/ids/browser-civilcraft.mjs)

  /** Why an Edit command cannot act right now ('' = it can). Shown in the button's tooltip; the button is grayed out. */
  function editBlock(c) {
    const pts = ST.project.points.length, sp = ST.picked.size;
    const needPts = t('cv.edit.need.pts');
    switch (c) {
      case 'undo': return ST.project.undoStack.length ? '' : t('cv.undo.none');
      case 'redo': return ST.project.redoStack.length ? '' : t('cv.redo.none');
      case 'copy': case 'cut': case 'duplicate': return sp ? '' : pts ? needPts : t('cv.edit.no.pts.open');
      case 'paste': case 'paste-in-place': return ST.clip || storedClip() || navigator.clipboard?.readText ? '' : t('cv.edit.no.paste');
      case 'delete': return selAl() || selPad() || selStruct() || selPipe() || ST.selPvi >= 0 || sp || ['catchment', 'feature', 'parcel', 'swept', 'mass'].includes(ST.sel?.kind) || lsUi.isMine(ST.sel) || plUi.isMine(ST.sel) || rvUi.isMine(ST.sel) || wmUi.isMine(ST.sel) ? '' : t('cv.delete.none');   // 0.8 SU.957: + a river; 0.8 LC.16: + a water node or pipe
      case 'select-all': return pts ? '' : t('cv.pts.none');
      case 'select-none': return sp || ST.sel || ST.selPvi >= 0 ? '' : t('cv.sel.none');
      default: return '';
    }
  }
  function updateTools() {
    const hasData = ST.project.points.length || ST.project.state.surface.tin || ST.project.state.alignments.length || ST.project.state.gis?.layers?.length;   // GIS: layers count as data
    const ls = ST.project.state.landscape;   // 0.7.1 71.19: plants, hardscape or grading alone are work too (3D, save, fit)
    const hasWork = hasData || ST.project.state.pads.length || (ST.project.state.features || []).length || (ST.project.state.masses || []).length
      || !!ST.project.state.water?.nodes.length   // 0.8 LC.16
      || !!(ls && (ls.plants.length || ls.beds.length || ls.hedges.length || ls.hardscape?.length || ls.grading?.length || ls.freeform?.length));
    for (const b of tearAll('[data-cmd]')) {
      const c = b.dataset.cmd;
      // nothing to save, export, fit or clear yet: greyed out (the Edit buttons below say why in their title)
      if (c === 'new') b.disabled = !hasWork && !ST.project.dirty;
      else if (['save', 'save-older', 'landxml', 'dxf', 'dwg', 'pdf', 'gis-export', 'fit', 'view3d'].includes(c)) b.disabled = !hasWork;
      else if (c === 'breakline' || c === 'boundary') b.disabled = !ST.project.points.length;
      else if (c === 'profile') b.disabled = !ST.project.state.alignments.length;
      if (['select', 'alignment', 'pad', 'breakline', 'boundary', 'pipe'].includes(c)) b.setAttribute('aria-pressed', String(ST.tool === c));
      if (c === 'feature' || c === 'mass' || c === 'measure') b.setAttribute(b.getAttribute('role') === 'menuitemcheckbox' ? 'aria-checked' : 'aria-pressed', String(ST.tool === c));   // 0.4 V14
      if (c === 'util-run') b.setAttribute(b.getAttribute('role') === 'menuitemcheckbox' ? 'aria-checked' : 'aria-pressed', String(ST.tool === c));   // 0.11 SU.1810
      if (c === 'free-section' || c === 'ramp') b.setAttribute(b.getAttribute('role') === 'menuitemcheckbox' ? 'aria-checked' : 'aria-pressed', String(ST.tool === c));   // 0.8 SU.914
      if (c === 'river') b.setAttribute(b.getAttribute('role') === 'menuitemcheckbox' ? 'aria-checked' : 'aria-pressed', String(ST.tool === 'river' || ST.tool === 'river-xs'));   // 0.8 SU.957
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
    ui.over.classList.toggle('is-select', ST.tool === 'select');
    ui.hint.hidden = ST.hintClosed || !!hasData || ST.tool !== 'select';
  }

  // the start card's X, as CadCraft's and ModelCraft's: closed stays closed until the page loads again
  ui.hint.querySelector('[data-hint-close]')?.addEventListener('click', () => { ST.hintClosed = true; ui.hint.hidden = true; ui.over.focus({ preventScroll: true }); });

  function renderLeft() {
    const s = ST.project.state, U = u();
    if (ui.name.ownerDocument.activeElement !== ui.name) ui.name.value = s.name;   // the panel may be in the panels window
    limitSelect(ui.units, 'length', { map: (v) => UNIT_TABLE_ID[v], keep: [s.units] });   // 0.7 UNITS: units turned on + the project's
    ui.units.value = s.units;
    for (const e of unitLabels) e.textContent = U.short;
    // points
    const pts = ST.project.points;
    ui.pointsEmpty.hidden = pts.length > 0;
    fillDl(ui.pointsInfo, pts.length ? [[t('cv.pts.file'), ST.project.pointsFile || '—'], [t('codes.col.n'), num(pts.length)], [t('cv.pts.withz'), num(ST.project.pointTable.countWithZ())]] : []);   // 0.11: counted in the table
    const tb = ui.groups.tBodies[0];
    const groups = ST.project.groups();
    ui.groups.hidden = !groups.length;
    tb.replaceChildren(...groups.map((g) => {
      const sel = el('select', { className: 'cv-select', 'aria-label': t('cv.group.use', { group: g.key }) },
        el('option', { value: 'points' }, t('codes.use.points')), el('option', { value: 'breakline' }, t('codes.use.breakline')), el('option', { value: 'off' }, t('codes.use.off')));
      sel.value = g.use;
      sel.addEventListener('change', () => ST.project.change(t('cv.undo.group', { group: g.key, use: sel.value }), (st) => { st.surface.groups[g.key] = sel.value; }));
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
        [t('cv.sf.breaklines'), num(ST.project.egBreaklines().length)], [t('cv.sf.boundary'), s.surface.boundary ? t('cv.sf.boundary.yes', { n: s.surface.boundary.length }) : t('gis.label.no')],
      ]);
    } else fillDl(ui.surfaceInfo, [[t('cv.surface'), pts.length ? t('cv.sf.notbuilt') : t('cv.sf.noneyet')]]);
    const notes = [...(r.report?.errors || []), ...(r.report?.notes || [])];
    if (ST.lastReport) notes.push(...ST.lastReport);
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
    if (s.surface.boundary) acts.push(el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => ST.project.change(t('cv.undo.boundary.remove'), (st) => { st.surface.boundary = null; }) }, t('cv.sf.boundary.remove')));
    if (s.surface.breaklines.length) acts.push(el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => ST.project.change(t('cv.undo.breaklines.remove'), (st) => { st.surface.breaklines = []; }) }, t('cv.sf.breaklines.remove', { n: s.surface.breaklines.length })));
    if (s.surface.tin) acts.push(el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => { ST.project.setTin(t('tin.rebuild.undo'), null); say(t('tin.rebuild.done')); }, disabled: !pts.length }, t('tin.rebuild.undo')));   // 0.4 V9: undoable
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
  ST.afProps = null;
  ST.propsPtr = null;   // 0.10.1 #1970: where the pointer is over Properties, so a redrawn row under it keeps its vertex ringed
  function renderProps() { renderPropsBody(); if (ST.hotVertex || ST.propsPtr) requestAnimationFrame(() => { const tr = ST.propsPtr && document.elementFromPoint(ST.propsPtr.x, ST.propsPtr.y)?.closest('tr'); if (tr && ui.props.contains(tr)) { setHot(null); tr.dispatchEvent(new MouseEvent('mouseenter')); } else if (!ui.props.querySelector('tr:focus-within')) setHot(null); });   /* 0.10.1 #1970: rows were rebuilt; keep the ring only while a row is still in use */ if (!ST.afProps && window.ccAutoFocus) ST.afProps = window.ccAutoFocus.register({ id: 'civil-props', panel: ui.props, mode: 'flat', heading: 'h3.cv-h3' }); ST.afProps?.refresh(); }
  ui.props.addEventListener('mousemove', (e) => { ST.propsPtr = { x: e.clientX, y: e.clientY }; });
  ui.props.addEventListener('mouseleave', () => { ST.propsPtr = null; });
  window.addEventListener('load', () => renderProps());   // the engine (app-settings.js) may load after this module: once the page has loaded the Properties panel folds
  function renderPropsBody() {
    const p = ui.props;
    // never rebuild under the user's typing; a checkbox is not typing
    const focused = p.ownerDocument.activeElement;
    if (p.contains(focused) && focused.matches('input:not([type=checkbox])')) { ST.pendingProps = true; return; }
    ST.pendingProps = false;
    const a = selAl(), pd = selPad(), st = selStruct(), pp = selPipe();
    if (ST.sel?.kind === 'gis') { for (const f of gisReg.props) if (f(ST.sel, ui.props, ui.propsH)) return; ST.sel = null; }   // GIS: a picked feature
    if (lsUi.isMine(ST.sel)) { if (lsUi.props(ST.sel, ui.props, ui.propsH)) return; ST.sel = null; }   // 0.7 LD: a plant, bed or hedge
    if (plUi.isMine(ST.sel)) { if (plUi.props(ST.sel, ui.props, ui.propsH)) return; ST.sel = null; }   // 0.7 PL: a line, support, route, equipment, obstacle
    if (rvUi.isMine(ST.sel)) { if (rvUi.props(ST.sel, ui.props, ui.propsH)) return; ST.sel = null; }   // 0.8 SU.957: a river
    if (wmUi.isMine(ST.sel)) { if (wmUi.props(ST.sel, ui.props, ui.propsH)) return; ST.sel = null; }   // 0.8 LC.16: a water node or pipe
    if (ST.sel?.kind === 'feature') { const f = flUi.find(ST.sel.id); if (f) { ui.propsH.textContent = t('fl.props.head'); { const nodes = [...flUi.props(f), cornersBlock('feature', f.id), transformBlock('feature', f.id)], at = nodes.findIndex((n) => n && n.tagName === 'H3'); nodes.splice(at < 0 ? nodes.length : at, 0, el('div', { className: 'cv-actions', 'data-fl-actions': '' }, swUi.button('feature', f.id))); ui.props.replaceChildren(...nodes); }   /* FX.350 (civil-11): before the first fold heading, so the button is not folded away with the last block */ const lb = lsUi.linkBlock(ST.sel); if (lb) ui.props.append(lb); return; } ST.sel = null; }   // 0.8 LA.2 outputs: a feature line made from a line says what it follows   // 0.4 V14; 0.6 WL.28
    if (ST.sel?.kind === 'swept') { const w = swUi.find(ST.sel.id); if (w) { ui.propsH.textContent = t('sw.head'); ui.props.replaceChildren(...swUi.props(w)); return; } ST.sel = null; }   // 0.6 WL.28
    if (ST.sel?.kind === 'parcel') { const pc = pcUi.find(ST.sel.id); if (pc) { ui.propsH.textContent = t('pc.props.head'); ui.props.replaceChildren(...pcUi.props(pc), cornersBlock('parcel', pc.id), transformBlock('parcel', pc.id), el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete')))); return; } ST.sel = null; }   // 0.4 V21
    if (ST.sel?.kind === 'mass') { const ms = msUi.find(ST.sel.id); if (ms) { ui.propsH.textContent = t('ms.props.head'); ui.props.replaceChildren(...msUi.props(ms), el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete')))); return; } ST.sel = null; }   // 0.7 LC.1
    if (ST.sel?.kind === 'catchment') { if (drUi.find(ST.sel.id)) { ui.propsH.textContent = t('dr.c.head'); ui.props.replaceChildren(...drUi.props(drUi.find(ST.sel.id)), el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete')))); return; } ST.sel = null; }   // 0.4 V19
    if (ST.sel && !a && !pd && !st && !pp) ST.sel = null;
    if (a) return alignmentProps(a);
    if (pd) return padProps(pd);
    if (st) return structureProps(st);
    if (pp) return pipeProps(pp);
    if (ST.picked.size === 1) { const i = ST.project.pointTable.indexOfName([...ST.picked][0]); const p = i >= 0 ? ST.project.pointTable.get(i) : ST.project.points.find((q) => ST.picked.has(q.n)); if (p) return pointProps(p); }   // 0.11: by name
    if (ST.picked.size > 1) return pickedProps();
    projectProps();
  }
  ST.pendingProps = false;
  ui.props.addEventListener('focusout', () => setTimeout(() => { if (ST.pendingProps && !ui.props.contains(ui.props.ownerDocument.activeElement)) renderProps(); }, 0));

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
  function row(k, v, id) { return [el(id ? 'label' : 'span', { className: 'k', for: id }, k), typeof v === 'string' ? el('span', { className: 'v' }, v) : v]; }

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
    ui, secUi, flUi, drUi, seUi, pcUi, msUi, tvUi, skUi, stUi, swUi, rvUi, wmUi, tpUi, codesUi, ppUi, pprUi, fileStem, download, units, u, eg, graded, findAl, findPad, net, findStruct, findPipe, diaU, refresh, renderProps, numInput, row, gridRow, roRow, propGrid, numberSpan, showProfile, renderProfile, pviPickBtn, slopeCell, command, armPick, say, hot: setHot,
    get project() { return ST.project; },
    get sel() { return ST.sel; }, set sel(v) { ST.sel = v; },
    get selPvi() { return ST.selPvi; }, set selPvi(v) { ST.selPvi = v; },
    get pickBtn() { return pickBtn; },
    get picked() { return ST.picked; }, set picked(v) { ST.picked = v; },
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
  Object.assign(TOOL_HINT, utUi.hints);   // 0.11 SU.1810: Utility run
  function setTool(tl) {
    if (tl !== ST.tool) { ST.draft = []; ST.flMid = null; ST.measClosed = false; if (tl !== 'feature') { ST.flArc = false; flUi.drawAs(null); } }
    if (tl !== ST.tool) wmUi.cancel();   // 0.8 LC.16: a pipe half drawn is dropped
    if (tl !== 'paste') ST.pasteJob = null;
    ST.tool = tl;
    ui.toolhint.hidden = !TOOL_HINT[tl];
    ui.toolhint.textContent = TOOL_HINT[tl] ? t(TOOL_HINT[tl]) : '';
    if ((tl === 'breakline' || tl === 'boundary' || tl === 'pad') && !eg().surface) say(t('cv.surface.need'));
    updateTools();
    view.invalidate();
  }

  root.querySelectorAll('[data-cmd]').forEach((b) => b.addEventListener('click', () => { closeMenus(); command(b.dataset.cmd); }));
  function closeMenus() { for (const d of root.querySelectorAll('details.cv-menu[open]')) d.open = false; }
  document.addEventListener('click', (e) => { for (const d of root.querySelectorAll('details.cv-menu[open]')) if (!d.contains(e.target)) d.open = false; });
  for (const d of root.querySelectorAll('details.cv-menu')) d.addEventListener('toggle', () => { if (d.open) updateTools(); });

  /** The Measure tool's words for these points (status line and the Enter summary). */
  function measureText(pts, closed) {
    const m = measure(pts, { closed, zAt: (x, y) => { const z = (graded().surface || eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; } });
    const U = u().short, parts = [t('meas.read', { n: m.n, total: fixed(m.total, 2), u: U })];
    if (m.last && !closed) parts.push(t('meas.read.last', { l: fixed(m.last.L, 2), u: U, bearing: bearing(m.last.bearing) }) + (m.last.grade_pct != null ? ', ' + t('meas.read.grade', { g: fixed(m.last.grade_pct, 1) }) : ''));
    if (m.total3d != null && m.segs.length) parts.push(t('meas.read.ground', { l: fixed(m.total3d, 2), u: U }));
    if (m.area != null) parts.push(t('meas.read.area', { a: areaText(m.area, units(), 2), p: fixed(m.total, 2), u: U }));
    return parts.join('; ');
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
  ST.pinch = null;
  ST.spaceDown = false;
  ST.longTimer = 0;
  const LONG_MS = 500;
  const slack = (e) => (e.pointerType === 'touch' ? 10 : 4);
  const gripR = () => (root.classList.contains('is-touch') ? 14 : 7);
  const local = (e) => { const r = ui.over.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const draftBar = $('[data-draftbar]');
  /** The draft bar shows while a line is being drawn on a touch screen. */
  function syncDraftBar() {
    const b = root.querySelector('[data-draftbar]');
    if (b) b.hidden = !(root.classList.contains('is-touch') && ST.draft.length);
    const a = b?.querySelector('[data-draft-act="arc"]');
    if (a) { a.hidden = ST.tool !== 'feature'; a.setAttribute('aria-pressed', String(ST.flArc)); }   // 0.6 WL.24
  }
  draftBar?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-draft-act]');
    if (!b) return;
    const act = b.dataset.draftAct;
    if (act === 'finish' && ST.draft.length) finishDraft();
    else if (act === 'arc') toggleFlArc();   // 0.6 WL.24
    else if (act === 'back' && ST.flMid) ST.flMid = null;
    else if (act === 'back' && ST.draft.length) { ST.draft.pop(); if (ST.draft.length) delete ST.draft[ST.draft.length - 1].b; say(t('touch.back.done', { n: ST.draft.length })); }
    else if (act === 'cancel') { ST.draft = []; say(t('cv.cancelled')); }
    view.invalidate();
    syncDraftBar();
  });

  ui.over.addEventListener('contextmenu', (e) => e.preventDefault());
  mountPointer({
    ST, ui, SNAP_TOOLS, view, nearestPoint, gripAt, snapHere, lassoTrack, boxSelect, lassoPick, click, refresh, finishDraft, pointers, LONG_MS, slack, gripR, local, syncDraftBar, updateStatus, say,
  });
  // 0.8 Track ID: hand the view to the input-device layer (assets/js/app-devices-ui.js) — the plan as the wheel and a pan drag move
  // it (zoomAt, panBy), fit = Fit (F). The 3D stage opens over the plan canvas and the layer takes the first view under the pointer,
  // so while 3D is open the plan hands over a hidden stand-in (still in the page, so the layer keeps the plan for later)
  const planAway = el('span', { hidden: true, 'data-plan-away': '' });
  ui.plan.append(planAway);
  (window.ccViews ||= []).push({ get el() { return is3D() ? planAway : ui.over; }, kind: '2d',
    pan: (dx, dy) => view.panBy(dx, dy), zoom: (f, x = view.w / 2, y = view.h / 2) => view.zoomAt(x, y, f), fit: fitAll });

  // ------------------------------------------------------------------ status bar
  function updateStatus() {
    if (!ST.cursor) { ui.coords.textContent = t('cv.status.en.none'); ui.elev.textContent = ''; ui.staoff.textContent = ''; for (const f of gisReg.status) f(null); return; }
    ui.coords.textContent = t('cv.status.en', { e: fixed(ST.cursor.x, 2), n: fixed(ST.cursor.y, 2) });
    for (const f of gisReg.status) f(ST.cursor);
    const z = eg().surface?.elevationAt(ST.cursor.x, ST.cursor.y);
    const g = graded().surface, zf = g ? g.elevationAt(ST.cursor.x, ST.cursor.y) : null;
    ui.elev.textContent = (z !== null && z !== undefined ? t('cv.read.ground', { z: fixed(z, 2) }) : t('cv.status.off')) + (zf !== null && zf !== undefined && Math.abs(zf - z) > 1e-6 ? ' · ' + t('cv.status.graded', { z: fixed(zf, 2) }) : '');
    let a = selAl();
    if (!a) {
      let bd = Infinity;
      for (const x of ST.project.state.alignments) { const al = ST.project.alignment(x); if (!al.ok) continue; const so = al.stationOffset(ST.cursor.x, ST.cursor.y); if (so && so.dist < bd) { bd = so.dist; a = x; } }
    }
    const al = a && ST.project.alignment(a);
    const so = al?.ok ? al.stationOffset(ST.cursor.x, ST.cursor.y) : null;
    ui.staoff.textContent = so ? t(so.outside ? 'cv.status.staoff.out' : 'cv.status.staoff', { name: a.name, sta: formatStation(so.sta, units()), off: fixed(Math.abs(so.off), 2), side: t(so.off >= 0 ? 'cv.side.r' : 'cv.side.l') }) : '';
  }
  ST.sayTimer = 0;
  function say(msg) { ui.status.textContent = msg; clearTimeout(ST.sayTimer); ST.sayTimer = setTimeout(() => { if (ui.status.textContent === msg) ui.status.textContent = ''; }, 12000); }

  mountKeys({
    ST, ui, view, toggleFlArc, settingsDlg, refresh, showProfile, setPviAdd, setTool, command, closeMenus, selectAll, copyPoints, pasteFromButton, paste, duplicatePoints, commitPaste, finishDraft, endPick, say, root,
  });

  // ------------------------------------------------------------------ left panel inputs
  ui.name.addEventListener('change', () => ST.project.change(t('cv.undo.project.rename'), (s) => { s.name = ui.name.value.trim().slice(0, 120) || t('project.untitled'); }));
  ui.units.addEventListener('change', () => { ST.project.change(t('cv.undo.units'), (s) => { s.units = ui.units.value === 'm' ? 'm' : 'ft'; }); say(t('cv.units.now', { units: u().name.toLowerCase() })); });
  onUnitsChange(() => refresh());   // 0.7 UNITS: a change in Settings › General › Units (lists, starred area / volume units)
  ui.gridMethod.addEventListener('change', () => ST.project.change(t('cv.undo.gridmethod'), (st) => { if (ui.gridMethod.value === 'tin') { delete st.surface.method; delete st.surface.gridStep; delete st.surface.gridPower; delete st.surface.gridQ; delete st.surface.gridAcc; } else st.surface.method = ui.gridMethod.value; }));
  ui.gridStep.addEventListener('change', () => { const v = Number(ui.gridStep.value); if (!(v >= 0)) { ui.gridStep.setAttribute('aria-invalid', 'true'); return; } ui.gridStep.removeAttribute('aria-invalid'); ST.project.change(t('cv.undo.gridstep'), (st) => { if (v > 0) st.surface.gridStep = v; else delete st.surface.gridStep; }); });
  ui.gridPower.addEventListener('change', () => { const v = Number(ui.gridPower.value); if (!(v >= 1 && v <= 10)) { ui.gridPower.setAttribute('aria-invalid', 'true'); return; } ui.gridPower.removeAttribute('aria-invalid'); ST.project.change(t('cv.undo.gridpower'), (st) => { st.surface.gridPower = v; }); });
  ui.maxEdge.addEventListener('change', () => { const v = Number(ui.maxEdge.value); if (!(v >= 0)) { ui.maxEdge.setAttribute('aria-invalid', 'true'); return; } ui.maxEdge.removeAttribute('aria-invalid'); ST.project.change(t('cv.undo.maxedge'), (s) => { s.surface.maxEdge = v; }); });
  ui.showSurface.addEventListener('change', () => ST.project.setDisplay('surface', ui.showSurface.value));
  ui.interval.addEventListener('change', () => ST.project.setDisplay('interval', Number(ui.interval.value)));
  ui.major.addEventListener('change', () => ST.project.setDisplay('major', Number(ui.major.value)));
  // 0.9.1: contour smoothing (contour-smooth.js). 'none' removes the key, so a drawing that never used it saves as before
  ui.smooth?.addEventListener('change', () => { const v = ui.smooth.value; if ((ST.project.state.display.smooth || 'none') === v) return; if (v === 'light' || v === 'strong') ST.project.state.display.smooth = v; else delete ST.project.state.display.smooth; ST.project.touch('display'); });
  ui.gridQ?.addEventListener('change', () => { const v = Number(ui.gridQ.value); if (!(v > 0 && v <= 100)) { ui.gridQ.setAttribute('aria-invalid', 'true'); return; } ui.gridQ.removeAttribute('aria-invalid'); ST.project.change(t('cv.undo.gridq'), (st) => { st.surface.gridQ = v; }); });
  ui.gridAcc?.addEventListener('change', () => { const v = Number(ui.gridAcc.value); if (ui.gridAcc.value.trim() === '' || !(v >= 0 && v <= 100)) { ui.gridAcc.setAttribute('aria-invalid', 'true'); return; } ui.gridAcc.removeAttribute('aria-invalid'); ST.project.change(t('cv.undo.gridacc'), (st) => { st.surface.gridAcc = v; }); });
  ui.bandCount.addEventListener('change', () => ST.project.setDisplay('bandCount', Number(ui.bandCount.value)));
  ui.checks.addEventListener('change', (e) => { const c = e.target.closest('[data-show]'); if (c) ST.project.setDisplay(c.dataset.show, c.checked); });

  // ------------------------------------------------------------------ files
  // Through the host adapter (host.js, W2.19): on the desktop Open is the native dialog, a double-clicked file opens at
  // launch or while running, and Save writes the project file it was opened from (else asks where); in the browser Open
  // is the same input as before and Save a download.
  const fileHost = getHost({ app: 'civilcraft' });
  const OPEN_TYPES = [{ description: 'CivilCraft, LandXML, points, GIS, DWG, DXF, IFC', extensions: ['.ifc', '.ccbundle', '.json', '.xml', '.landxml', '.csv', '.txt', '.pnezd', '.geojson', '.kml', '.kmz', '.shp', '.dbf', '.prj', '.gpkg', '.las', '.laz', '.tif', '.tiff', '.asc', '.dwg', '.dxf'] }];   // i18n-ignore: OS file types
  const PROJECT_TYPES = [{ description: 'CivilCraft project', extensions: ['.json'] }];   // i18n-ignore: an OS file type
  ST.projectTarget = null;   // the HostFile a project was opened from (desktop: Save writes it in place)
  ST.openingFrom = null;     // the HostFile being opened right now (openProject keeps it as projectTarget)
  async function openHostFiles(hfs) {
    if (!hfs || !hfs.length) return;
    const fs = [];
    for (const hf of hfs) { const b = await hf.file(); fs.push(typeof File !== 'undefined' && b instanceof File ? b : new File([b], hf.name, { lastModified: hf.lastModified || Date.now() })); }
    if (await gisOpen(fs)) return;
    if (await openPairFiles(fs, hfs)) return;   // 0.7.1 71.27
    ST.openingFrom = hfs[0];
    try { await openFile(fs[0]); } finally { ST.openingFrom = null; }
  }
  autosave.offer({ onRecover: async (rec) => {
    const text = rec.data && rec.data.kind === 'chunks' ? recoverText(rec) : rec.data;   // 0.10: a base and its changes, or the old whole text
    if (typeof text !== 'string') throw new Error(t('recover.failed'));
    await openProject(text, rec.meta?.name || 'project.civilcraft.json');
    ST.project.saved = -1;   // recovered work is unsaved until it is saved to a file
    ST.asDoc?.changed();
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
    project: () => ST.project,
    select: (nums, mode) => {
      if (mode === 'replace') ST.picked = new Set(nums); else for (const n of nums) { if (mode === 'add') ST.picked.add(n); else ST.picked.delete(n); }
      ST.sel = null; ST.selPvi = -1; refresh(); view.invalidate();
      say(t('cv.pts.selected', { n: ST.picked.size, count: num(ST.picked.size) }));
      return ST.picked.size;
    },
    // 0.7 AS.3 (session assistants): the app's own Save and exports, so a tool presses the same buttons (host.js sends the
    // file to a path the assistant names in Studio, else it downloads as the button would); refresh after a points edit
    saveProject, exportDwg, changed: () => { refresh(); view.invalidateScene(); view.invalidate(); },
    files: fileHost.control.files, download,
  })) fileHost.control.tool(def);
  { const reg = () => window.ccProblems?.registerTools?.(fileHost.control); if (window.ccProblems) reg(); else document.addEventListener('cc-problems-ready', reg, { once: true }); }   // problems-08's mount line: the Problems tools for assistants
  for (const def of landscapeTools({ project: () => ST.project, seed: () => lsUi.seedSpecies(), changed: () => { refresh(); view.invalidateScene(); view.invalidate(); } })) fileHost.control.tool(def);   // 0.7 LD.8
  for (const def of siteGenTools({ project: () => ST.project, seed: () => lsUi.seedSpecies(), zAt: groundExisting, changed: () => { refresh(); view.invalidateScene(); view.invalidate(); } })) fileHost.control.tool(def);   // 0.10 SU.1815 + SU.1814b
  for (const def of waterTools({ project: () => ST.project, groundAt: (x, y) => { const z = (graded().surface || eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; }, changed: () => { refresh(); view.invalidateScene(); view.invalidate(); } })) fileHost.control.tool(def);   // 0.8 LC.16
  for (const def of egTools({ project: () => ST.project, changed: () => { refresh(); view.invalidateScene(); view.invalidate(); } })) fileHost.control.tool(def);   // 0.8 round 2: civil_PART_2
  for (const def of massOptTools({ project: () => ST.project, changed: () => { refresh(); view.invalidateScene(); view.invalidate(); } })) fileHost.control.tool(def);   // 0.8 EG.58: civil_PART_3
  for (const def of solarTools({ project: () => ST.project, changed: () => { refresh(); view.invalidateScene(); view.invalidate(); } })) fileHost.control.tool(def);   // 0.8 EG.15: civil_PART_3
  for (const def of geoTools({ project: () => ST.project, changed: () => { refresh(); view.invalidateScene(); view.invalidate(); } })) fileHost.control.tool(def);   // 0.8 round 2: civil-geo_PART_2
  for (const def of powerlineTools({ project: () => ST.project, lib: () => plUi.lib(), groundAt: (x, y) => { const z = (graded().surface || eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; }, changed: () => { refresh(); view.invalidateScene(); view.invalidate(); } })) fileHost.control.tool(def);   // 0.7 PL.8
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
    rollback: civilRollback({ project: () => ST.project }),   // AI-CONNECT-SPEC § 2.3: previews of the edit tools
    info: () => ({ site: ST.project.state.name, points: ST.project.points.length, unsaved: unsaved() }),
    busy: () => (ST.draft.length ? 'drawing on the plan' : ST.tool === 'paste' ? 'pasting points' : null),   // i18n-ignore: read by the assistant
  });
  window.civilcraftControl = fileHost.control;   // for tests and the console
  shellM = mountShell({ project: () => ST.project, host: fileHost, selection: () => ST.sel, select: (x) => { ST.sel = x; ST.selPvi = -1; ST.picked.clear(); refresh(); view.invalidate(); }, undoDepth: () => ST.project.undoStack.length,
    undoTo: (n) => { while (ST.project.undoStack.length > n && ST.project.undo()); } });   // the shell's modules attach here (shell-mount.js)
  mountCivilAccess({ project: () => ST.project, view, stage: ui.over, status: ui.status, selection: () => ST.sel,
    select: (x) => { ST.sel = x; ST.selPvi = -1; ST.picked.clear(); refresh(); view.invalidate(); },
    groundAt: (x, y) => { const z = (graded().surface || eg().surface)?.elevationAt(x, y); return Number.isFinite(z) ? z : null; },
    setCursor: (p) => { ST.cursor = p; updateStatus(); view.invalidate(); } });   // EG.52: spoken results, the keyboard cursor, station walk
  renderAssist();
  ui.file.addEventListener('change', async () => { const fs = [...ui.file.files]; ui.file.value = ''; if (fs.length && !(await gisOpen(fs))) openAny(fs); });   // openAny: 0.7.1 71.27 (the pair)
  ST.dragDepth = 0;
  ui.plan.addEventListener('dragenter', (e) => { if ([...(e.dataTransfer?.types || [])].includes('Files')) { e.preventDefault(); ST.dragDepth++; ui.drop.hidden = false; } });
  ui.plan.addEventListener('dragover', (e) => { if ([...(e.dataTransfer?.types || [])].includes('Files')) e.preventDefault(); });
  ui.plan.addEventListener('dragleave', () => { if (--ST.dragDepth <= 0) { ST.dragDepth = 0; ui.drop.hidden = true; } });
  ui.plan.addEventListener('drop', (e) => { e.preventDefault(); ST.dragDepth = 0; ui.drop.hidden = true; const fs = [...e.dataTransfer.files]; if (fs.length) gisOpen(fs).then((done) => { if (!done) openAny(fs); }); });   // openAny: 0.7.1 71.27 (the pair)
  // 2026-11-09: the start card can be closed, and its "Sample" button is the only way in to the sample site: the same action is in the command palette (Ctrl+K) while the card is closed
  // i18n-ignore: CSS, selector, class name or search keywords: no words a person reads (words-11)
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
    return (ST.project.nativeWarnings || []).map((w) => ({ ...w, text: t(w.msg.key, w.msg.vars), fixes: w.fixes.map((a) => ({ id: a, action: a, msg: { key: 'ifc.native.fix.' + (a === 'ifcSave' ? 'save' : 'take'), vars: {} }, text: t('ifc.native.fix.' + (a === 'ifcSave' ? 'save' : 'take')) })) }));
  }
  /** 0.7.1 71.27: the native pair (ifc-native-ui.js, loaded on first use). */
  ST.nativeReady = null;
  function nativeUi() {
    return (ST.nativeReady ||= import('./ifc-native-ui.js').then((m) => m.createNative({
      host: fileHost, root, say, busy, refocus, fileStem, project: () => ST.project, species: () => lsUi.index(), confirmDiscard,
      target: () => ST.projectTarget, setTarget: (f) => { ST.projectTarget = f; },
      openProjectText: async (text, name, from) => { const was = ST.project; ST.openingFrom = from; try { await openProject(text, name); } finally { ST.openingFrom = null; } return ST.project !== was; },
      importIfc: async (f) => (await ifcUi())?.importFile(f),
    })).catch((err) => { ST.nativeReady = null; say(t('ifc.noload', { why: err.message })); return null; }));
  }
  /** 0.7.1 71.27: files opened or dropped: a CivilCraft IFC and / or a project file with its pair go to the pair; true = handled. */
  async function openPairFiles(fs, hfs = []) {
    if (!fs.some((f) => /\.(ifc|json)$/i.test(f.name))) return false;
    const n = await nativeUi();
    return n ? n.openFiles(fs, hfs) : false;
  }
  async function openAny(fs, hfs = []) { if (!(await openPairFiles(fs, hfs))) await openFile(fs[0]); }

  /** 0.7.1 71.24: Export › IFC and opening .ifc files (ifc-civil-ui.js and cc-ifc, loaded on first use). */
  ST.ifcReady = null;
  function ifcUi() {
    return (ST.ifcReady ||= import('./ifc-civil-ui.js').then((m) => m.installIfc({
      root, say, busy, download, fileStem, refocus, fitAll, refresh: () => { refresh(); view.invalidateScene(); view.invalidate(); },
      project: () => ST.project, setProject(p) { ST.project = p; ST.projectTarget = null; rebind(); ST.sel = null; ST.selPvi = -1; ST.lastReport = null; },
      species: () => lsUi.index(), confirmDiscard, openPicker: () => command('open'),
    })).catch((err) => { ST.ifcReady = null; say(t('ifc.noload', { why: err.message })); return null; }));
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
    sheets: () => (extentsAll() ? [{ id: 'plan', number: '', title: ST.project.state.name || fileStem(), scale: '', revision: '', paper: '' }] : []),
    can: (kind) => (!exportSet.kinds.includes(kind) ? 'unknown' : extentsAll() ? null : 'empty'),
    async run(kind, o = {}) {
      if (kind === 'pdf') { const r = await plotNow({ paper: String(o.paper || '').replace(/^iso-/, ''), scale: o.scale, mono: !!o.mono, map: true, titleBlock: o.titleBlock || null }); return r ? [{ sheets: [{ id: 'plan', number: '', title: ST.project.state.name || fileStem(), scale: r.scale, revision: '', block: !!o.titleBlock }] }] : []; }
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
    if (!ST.project.dirty || (!ST.project.points.length && !ST.project.state.alignments.length && !ST.project.state.pads.length && !(ST.project.state.features || []).length && !gisReg.hasWork.some((f) => f()))) return true;
    const c = await ask({ title: t('cv.ask.unsaved.title'), text: t('cv.ask.unsaved'), buttons: [['cancel', t('cad.ui.cancel'), 'btn-line'], ['discard', t('cv.ask.dont'), 'btn-line'], ['save', t('cv.ask.save'), 'btn-plot']] });
    if (c === 'save') return saveProject();
    return c === 'discard';
  }
  // Leaving by a link on the page asks in the page; the browser's own "Leave site?" is left for what no page can
  // catch (closing the tab, reloading, typing an address). After "save first", wait for the download to start.
  const unsaved = () => ST.project.dirty && !!(ST.project.points.length || ST.project.state.alignments.length || ST.project.state.pads.length || (ST.project.state.features || []).length || gisReg.hasWork.some((f) => f()));
  ST.leaving = false;
  window.addEventListener('beforeunload', (e) => { if (unsaved() && !ST.leaving) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('click', async (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a || !unsaved() || e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
    const url = new URL(a.href, location.href);
    if (!/^https?:$/.test(url.protocol) || (url.hash && url.href.split('#')[0] === location.href.split('#')[0])) return;
    e.preventDefault();
    if (!(await confirmDiscard())) return;
    ST.leaving = true;
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
        view3d = m.mountSite3D(host3d, { project: () => ST.project, say, cutfill: (box, size) => pfUi.canvasFor(box, size), onPick: pick3D, exag: settings.exag, corner: settings.corner, onExag: (x) => { settings.exag = x; persistSettings(); },
          drape: async () => { await gisLoad(); return gisReg.drape || null; },   // 0.4 V3: map layers draped on the surface
          selection: () => (ST.sel && ['alignment', 'pad', 'feature', 'pipe', 'structure', 'mass', 'ls-hard', 'ls-grade'].includes(ST.sel.kind) ? { kind: ST.sel.kind, id: ST.sel.id } : null),   // 0.4 V5; ls-hard 0.7.1
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
      getView: () => PLAN_VIEW, north: 0, home: fitAll,
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
    if (floors !== was) ST.project.change(t('ms.undo.height'), (st) => { const q = st.masses.find((x) => x.id === id); if (q) q.floors = floors; }, { keys: ST.project.keysOf('masses', id) });
    refresh();
    say(t('ms.pushed', { name: m.name, floors }));
  }

  /** A click in 3D: survey points join the point selection, pipes and structures open in Properties. */
  function pick3D(hit) {
    if (hit.kind === 'point') { ST.picked = new Set([String(hit.id)]); ST.sel = null; ST.selPvi = -1; refresh(); return true; }
    if (hit.kind === 'mass') { ST.picked.clear(); ST.sel = { kind: 'mass', id: hit.id }; ST.selPvi = -1; refresh(); return true; }   // 0.7 LC.1
    if (hit.kind === 'pipe' || hit.kind === 'structure') { ST.picked.clear(); ST.sel = { kind: hit.kind, id: hit.id }; ST.selPvi = -1; refresh(); return true; }
    // 0.4 V5: alignments, pads and feature lines picked in 3D select as on the plan; a breakline is named in the tip only
    if (hit.kind === 'alignment' || hit.kind === 'pad' || hit.kind === 'feature') { ST.picked.clear(); ST.sel = { kind: hit.kind, id: hit.id }; ST.selPvi = -1; refresh(); return true; }
    if (hit.kind === 'breakline') { say(t('v3d.pick.breakline', { name: hit.name })); return false; }
    // 0.7.1 71.19: a plant (or a bed's or hedge's plant) and hardscape picked in 3D select as on the plan (Properties)
    if (/^ls-(plant|bed|hedge|hard|grade)$/.test(hit.kind) && lsUi.isMine({ kind: hit.kind, id: hit.id })) { ST.picked.clear(); ST.sel = { kind: hit.kind, id: hit.id }; ST.selPvi = -1; refresh(); return true; }
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
