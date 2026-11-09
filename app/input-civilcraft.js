/* SPDX-License-Identifier: Apache-2.0 */
/**
 * input-civilcraft.js — CivilCraft's command registry for the shell's input engine (0.5 track IP.3; engine
 * assets/js/app-input.js + app-input-ui.js, map docs/apps/app-input.md; manifest "input": "input-civilcraft.js").
 * DOM-free data, plus hooks() which runs only on the page.
 *
 * COMMANDS: every toolbar command (ui.inc $__tools, the Surface group's More menu, the Edit menu), the grade overlay (E,
 * the Display panel's checkbox) and adding PVIs in the profile view (I).
 *   id       stable id (people's own styles and .ccinput.json files name it — never rename one)
 *   sel      the app's own button the shell clicks (one code path for every style). The Edit group's Copy and Paste repeat in
 *            its More menu, so toolbar buttons are found inside their group ([aria-label="…"] is the group's fixed key)
 *   defKeys  CivilCraft's own keys (civilcraft.js's keydown handler): the CivilCraft style
 * Labels are text keys `input.cmd.<id>` in lang/en.json.
 *
 * STYLES: CivilCraft (today's toolbar), Drafting classic (a small ribbon and a command line of typed words), Civil ribbon
 * (tabs the way civil design programs group their tools: Home, Surfaces, Modify, Geolocation, View, Output). Named for a
 * way of working, never for a product.
 */

import { setMouse } from './input-mouse.js';

const C = (id, group, icon, sel, more = {}) => ({ id, group, icon, sel, label: 'input.cmd.' + id, defKeys: [], ...more });
const T = (grp, cmd) => `.cv-tools [aria-label="${grp}"] [data-cmd="${cmd}"]`;   // a toolbar button inside its group
const E = (cmd) => `[data-edit-menu] [data-cmd="${cmd}"]`;
/**
 * 0.7.1: the Landscape and Power lines workspaces' tools (landscape/landscape-ui.js + its grade / hardscape / irrigation menus,
 * powerline/powerline-ui.js): their toolbar groups are in the page from the start, hidden until the workspace is on, and each
 * tool turns its workspace on (hooks().why lets them run, as the workspace layouts do). [ribbon panel, [[id, data-cmd, icon]]];
 * command `landscape.<id>` / `powerlines.<id>`, group = the workspace.
 */
const LANDSCAPE = [
  ['ls-plants', [['plant', 'ls-plant', 'bi-tree'], ['bed', 'ls-bed', 'bi-flower1'], ['hedge', 'ls-hedge', 'bi-border-style']]],
  ['ls-grade', [['platform', 'ls-platform', 'bi-layers'], ['berm', 'ls-berm', 'bi-triangle'], ['swale', 'ls-swale', 'bi-water'], ['area', 'ls-area', 'bi-bounding-box-circles'],
    ['spot', 'ls-spot', 'bi-geo'], ['contour', 'ls-contour', 'bi-bezier2'], ['slope', 'ls-slope', 'bi-percent'], ['flow', 'ls-flow', 'bi-arrow-down-right']]],
  ['ls-hardscape', [['paving', 'ls-paving', 'bi-grid-3x3'], ['path', 'ls-path', 'bi-signpost'], ['wall', 'ls-wall', 'bi-bricks'], ['kerb', 'ls-kerb', 'bi-border-bottom'],
    ['ramp', 'ls-ramp', 'bi-arrow-up-right'], ['steps', 'ls-steps', 'bi-bar-chart-steps']]],
  ['ls-irrigation', [['head', 'ls-head', 'bi-droplet'], ['lateral', 'ls-lateral', 'bi-share'], ['main', 'ls-main', 'bi-diagram-2'], ['valve', 'ls-valve', 'bi-toggle-on'],
    ['drip', 'ls-drip', 'bi-moisture'], ['poc', 'ls-poc', 'bi-plug'], ['coverage', 'ls-coverage', 'bi-bullseye'], ['check', 'ls-check', 'bi-clipboard-check']]],
  ['ls-output', [['schedule', 'ls-schedule', 'bi-table'], ['freeform', 'ls-freeform-open', 'bi-bezier'], ['sheets', 'ls-sheets', 'bi-file-earmark-pdf'], ['ifc', 'ls-ifc', 'bi-box-arrow-up'],
    ['size', 'ls-size', 'bi-arrows-angle-expand'], ['labels', 'ls-labels', 'bi-tag']]],
];
const POWERLINES = [
  ['pl-draw', [['line', 'pl-line', 'bi-lightning-charge'], ['support', 'pl-support', 'bi-plus-circle'], ['route', 'pl-route', 'bi-bezier2'], ['equip', 'pl-equip', 'bi-box'],
    ['obstacle', 'pl-obstacle', 'bi-exclamation-diamond'], ['profile', 'pl-profile', 'bi-graph-down']]],
  ['pl-output', [['rules', 'pl-rules', 'bi-sliders'], ['stringing', 'pl-stringing', 'bi-table'], ['quantities', 'pl-quantities', 'bi-list-ol'], ['sheets', 'pl-sheets', 'bi-file-earmark-pdf'],
    ['gis', 'pl-gis', 'bi-globe-americas'], ['don-out', 'pl-don-out', 'bi-box-arrow-up'], ['don-in', 'pl-don-in', 'bi-box-arrow-in-down']]],
];
const WS_TOOLS = [['landscape', 'Landscape', LANDSCAPE], ['powerlines', 'Power lines', POWERLINES]];   // i18n-ignore: the groups' aria-labels (keys)

export const COMMANDS = [
  C('file.new', 'file', 'bi-file-earmark-plus', T('File', 'new')),
  C('file.open', 'file', 'bi-folder2-open', T('File', 'open'), { defKeys: ['Ctrl+O'] }),
  C('file.save', 'file', 'bi-save', T('File', 'save'), { defKeys: ['Ctrl+S'] }),
  C('export.landxml', 'export', 'bi-filetype-xml', T('Export', 'landxml')),
  C('export.dxf', 'export', 'bi-vector-pen', '[data-dwg] [data-cmd="dxf"]'),   // 0.7.1 71.24: the toolbar's one DWG / DXF button; this command (and its keys) stays
  C('export.dwg', 'export', 'bi-file-earmark-ruled', T('Export', 'dwg')),
  C('export.pdf', 'export', 'bi-printer', T('Export', 'pdf'), { defKeys: ['Ctrl+P'] }),
  C('export.ifc', 'export', 'bi-boxes', T('Export', 'ifc')),   // 0.7.1 71.24: the project as IFC (ifc-civil-ui.js)
  C('surface.breakline', 'surface', 'bi-bezier2', T('Surface', 'breakline'), { defKeys: ['B'] }),
  C('surface.boundary', 'surface', 'bi-bounding-box', T('Surface', 'boundary'), { defKeys: ['O'] }),
  C('surface.cad-open', 'surface', 'bi-file-earmark-ruled', T('Surface', 'cad-open')),
  C('surface.scan-start', 'surface', 'bi-file-earmark-image', T('Surface', 'scan-start'), { label: 'scanin.cmd' }),   // Super 0.1: Start from a scan (scan-start-ui.js)
  C('surface.feature', 'surface', 'bi-bezier', T('Surface', 'feature'), { defKeys: ['L'] }),
  C('surface.sections', 'surface', 'bi-layout-three-columns', T('Surface', 'sections'), { defKeys: ['X'] }),
  C('surface.mass', 'surface', 'bi-buildings', T('Surface', 'mass'), { label: 'ms.tb' }),   // 0.7 LC.1 (session massing): the Mass tool
  C('surface.river', 'surface', 'bi-water', T('Surface', 'river'), { label: 'sx.su957.tb' }),   // 0.8 SU.957: the River tool (river-ui.js)
  C('surface.ground-contours', 'surface', 'bi-layers', T('Surface', 'ground-contours'), { label: 'sx.su911.tb' }),   // 0.8 SU.911: terrain from contour lines (ground-ui.js)
  C('surface.corridor-templates', 'surface', 'bi-sign-merge-right', T('Surface', 'corridor-templates'), { label: 'tpl.tb' }),   // 0.9 SU.1110: corridor templates (templates-ui.js)
  C('surface.terrain-templates', 'surface', 'bi-layers-half', T('Surface', 'terrain-templates'), { label: 'tpl.tb.tt' }),   // 0.9 WB.6: terrain templates
  C('surface.water', 'surface', 'bi-droplet', T('Surface', 'water'), { label: 'wm.tb' }),   // 0.8 LC.16: water mains (water-ui.js)
  C('surface.eg-rain', 'surface', 'bi-cloud-rain', T('Surface', 'eg-rain'), { label: 'eg.tb.rain' }),   // 0.8 EG.69 Make it rain (eg-ui.js)
  C('surface.eg-earthwork', 'surface', 'bi-truck', T('Surface', 'eg-earthwork'), { label: 'eg.tb.earthwork' }),   // 0.8 EG.70 earthwork balancer
  C('surface.eg-route', 'surface', 'bi-signpost-split', T('Surface', 'eg-route'), { label: 'eg.tb.route' }),   // 0.8 EG.71 best route
  C('surface.section-lines', 'surface', 'bi-list-ul', T('Surface', 'section-lines'), { label: 'sx.su914.line.tb' }),   // 0.8 SU.914 rest: the saved free-section lines
  C('surface.mass-options', 'surface', 'bi-building-gear', T('Surface', 'mass-options'), { label: 'mo.tb' }),   // 0.8 EG.58: BimCraft's massing options on a parcel
  C('surface.solar', 'surface', 'bi-sun', T('Surface', 'solar'), { label: 'solar.tb' }),   // 0.8 EG.15 ground solar arrays on terrain
  C('surface.eg-pond', 'surface', 'bi-water', T('Surface', 'eg-pond'), { label: 'eg.tb.pond' }),   // 0.8 EG.12 detention ponds
  C('surface.eg-site', 'surface', 'bi-geo-alt', T('Surface', 'eg-site'), { label: 'eg.tb.site' }),   // 0.8 EG.63 address to site
  C('surface.eg-progress', 'surface', 'bi-graph-up', T('Surface', 'eg-progress'), { label: 'eg.tb.progress' }),   // 0.8 EG.39 progress from surveys
  C('surface.geo-soil', 'surface', 'bi-layers-half', T('Surface', 'geo-soil'), { label: 'geo.tb.soil' }),   // 0.8 civil-geo: soils and slopes
  C('surface.geo-road', 'surface', 'bi-sign-intersection', T('Surface', 'geo-road'), { label: 'geo.tb.road' }),   // 0.8 civil-geo: junctions and striping
  C('surface.geo-survey', 'surface', 'bi-rulers', T('Surface', 'geo-survey'), { label: 'geo.tb.survey' }),   // 0.8 civil-geo: survey
  C('surface.geo-mine', 'surface', 'bi-minecart-loaded', T('Surface', 'geo-mine'), { label: 'geo.tb.mine' }),   // 0.8 civil-geo: mine
  C('surface.geo-link', 'surface', 'bi-link-45deg', T('Surface', 'geo-link'), { label: 'geo.tb.link' }),   // 0.8 civil-geo: link
  C('surface.geo-rail', 'surface', 'bi-train-front', T('Surface', 'geo-rail'), { label: 'geo.tb.rail' }),   // 0.8 civil-geo: rail
  C('surface.free-section', 'surface', 'bi-slash-lg', T('Surface', 'free-section'), { label: 'sx.su914.tb.section' }),   // 0.8 SU.914: a section line drawn anywhere (platform-ui.js)
  C('surface.ramp', 'surface', 'bi-graph-up-arrow', T('Surface', 'ramp'), { label: 'sx.su914.tb.ramp' }),   // 0.8 SU.914: a ramp or sloped pad
  C('surface.landscape', 'surface', 'bi-tree', T('Surface', 'landscape'), { label: 'ls.tb.workspace' }),   // 0.7 LD (session landscape)
  C('surface.powerlines', 'surface', 'bi-lightning-charge', T('Surface', 'powerlines'), { label: 'pl.tb.workspace' }),   // 0.7 PL (D8.1): the Power lines workspace
  C('surface.measure', 'surface', 'bi-rulers', T('Surface', 'measure'), { label: 'ui.tb.measure', defKeys: ['M'] }),   // 0.7 PL.10: Measure, in Surface's More menu
  C('surface.grades', 'surface', 'bi-percent', '[data-show="gradeOverlay"]', { defKeys: ['E'] }),
  C('design.alignment', 'design', 'bi-signpost-split', T('Design', 'alignment'), { defKeys: ['A'] }),
  C('design.pad', 'design', 'bi-square', T('Design', 'pad'), { defKeys: ['G'] }),
  C('design.pipe', 'design', 'bi-diagram-3', T('Design', 'pipe'), { defKeys: ['P'] }),
  C('design.profile', 'design', 'bi-graph-up', T('Design', 'profile'), { defKeys: ['R'] }),
  C('design.pvi-add', 'design', 'bi-plus-circle', '[data-pvi-add]', { defKeys: ['I'] }),
  C('edit.undo', 'edit', 'bi-arrow-counterclockwise', T('Edit', 'undo'), { defKeys: ['Ctrl+Z'] }),
  C('edit.redo', 'edit', 'bi-arrow-clockwise', T('Edit', 'redo'), { defKeys: ['Ctrl+Y'] }),
  C('edit.copy', 'edit', 'bi-copy', T('Edit', 'copy'), { defKeys: ['Ctrl+C'] }),
  C('edit.paste', 'edit', 'bi-clipboard-plus', T('Edit', 'paste'), { defKeys: ['Ctrl+V'] }),
  C('edit.cut', 'edit', 'bi-scissors', E('cut'), { defKeys: ['Ctrl+X'] }),
  C('edit.paste-in-place', 'edit', 'bi-clipboard-check', E('paste-in-place'), { defKeys: ['Ctrl+Shift+V'] }),
  C('edit.duplicate', 'edit', 'bi-files', E('duplicate'), { defKeys: ['Ctrl+D'] }),
  C('edit.delete', 'edit', 'bi-trash', E('delete'), { defKeys: ['Delete'], fixed: true }),
  C('edit.select-all', 'edit', 'bi-check2-all', E('select-all'), { defKeys: ['Ctrl+A'] }),
  C('edit.select-none', 'edit', 'bi-x-square', E('select-none'), { defKeys: ['Escape'], fixed: true }),
  C('gis.crs', 'gis', 'bi-globe-americas', T('GIS', 'crs')),
  C('gis.import', 'gis', 'bi-box-arrow-in-down', T('GIS', 'gis-import')),
  C('gis.export', 'gis', 'bi-box-arrow-up', T('GIS', 'gis-export')),
  C('gis.basemap', 'gis', 'bi-map', T('GIS', 'basemap')),
  C('gis.analysis', 'gis', 'bi-funnel', T('GIS', 'gis-analysis'), { label: 'gisa.tb' }),   // 0.9 SU.1080: GIS analysis (gis-analysis-ui.js)
  C('gis.table', 'gis', 'bi-table', T('GIS', 'gis-table'), { label: 'gist.tb' }),   // 0.9 SU.1080 round 2: attribute table (gis-table-ui.js)
  C('view.select', 'view', 'bi-cursor', T('View', 'select'), { defKeys: ['V'] }),
  C('view.fit', 'view', 'bi-arrows-fullscreen', T('View', 'fit'), { defKeys: ['F'] }),
  C('view.view3d', 'view', 'bi-badge-3d', T('View', 'view3d'), { defKeys: ['D'] }),
  C('view.problems', 'view', 'bi-exclamation-triangle', '[data-problems-open]', { defKeys: ['Ctrl+Shift+M'], keyOnly: true, optional: true }),   // 0.7.1: the shell's Problems panel (rebindable; docs/0.8-PROBLEMS-SPEC.md)
  // 0.7.1: the Landscape and Power lines workspaces' tools (WS_TOOLS); no keys of their own
  ...WS_TOOLS.flatMap(([ws, grp, panels]) => panels.flatMap(([, items]) => items.map(([id, cmd, icon]) => C(ws + '.' + id, ws, icon, T(grp, cmd))))),
  C('app.settings', 'app', 'bi-gear', '[data-settings-open]', { defKeys: ['Ctrl+,'], keyOnly: true }),
  C('app.palette', 'app', 'bi-search', '[data-palette-open]', { defKeys: ['Ctrl+K'], keyOnly: true }),
  C('app.help', 'app', 'bi-question-circle', '[data-help-open]', { defKeys: ['F1'], keyOnly: true }),
];
export const GROUPS = ['file', 'export', 'surface', 'design', 'edit', 'gis', 'view', 'app', 'landscape', 'powerlines'];

// CivilCraft's own keys = the registry's (what the app does with no profile at all)
const DEFAULT_KEYS = Object.fromEntries(COMMANDS.filter((c) => c.defKeys.length && !c.fixed).map((c) => [c.id, c.defKeys.slice()]));
const CTRL_KEYS = Object.fromEntries(Object.entries(DEFAULT_KEYS).filter(([, k]) => k.every((x) => /^(Ctrl|F\d)/.test(x))));

const m = (label, items) => ({ label: 'input.m.' + label, items });
// a panel is [label, items, extra?]: extra = the 0.7 RIBBON-COMPACT fields (mixed, more) of app-input.js
const tab = (label, panels) => ({ label: 'input.m.' + label, panels: panels.map(([l, items, extra]) => ({ label: 'input.m.' + l, items, ...extra })) });
const FILE_MENU = ['file.new', 'file.open', 'file.save', '-', 'export.pdf', '-', 'app.settings', 'app.palette', 'app.help'];
// 0.7.1: a tab per workspace (Landscape, Power lines), a group per toolbar menu: the first tool large, the rest small
const WS_TABS = WS_TOOLS.map(([ws, , panels]) => ({ label: 'input.m.' + ws, panels: panels.map(([l, items]) => ({ label: 'input.m.' + l, items: items.map(([id]) => ws + '.' + id), mixed: true })) }));

export const STYLES = {
  civilcraft: {
    format: 'cadcraft-input', version: 1, id: 'civilcraft', name: 'input.style.civilcraft', builtin: true, layout: 'toolbar',
    keys: DEFAULT_KEYS,
    mouse: { wheel: 1, zoomSpeed: 1, pan2d: ['middle', 'right'], orbit3d: null },   // null: the 3D site view keeps its own buttons
  },
  drafting: {
    format: 'cadcraft-input', version: 1, id: 'drafting', name: 'input.style.drafting', builtin: true, layout: 'ribbon', commandLine: true,
    menus: [m('file', FILE_MENU)],
    quick: ['file.new', 'file.open', 'file.save', 'export.pdf', 'edit.undo', 'edit.redo'],
    tabs: [
      tab('home', [
        ['draw', ['design.alignment', 'design.pad', 'design.pipe', 'surface.feature', 'surface.breakline', 'surface.boundary', 'surface.mass', 'surface.ground-contours', 'surface.river', 'surface.ramp', 'surface.landscape', 'surface.powerlines'], { more: ['surface.water', 'surface.eg-rain', 'surface.eg-earthwork', 'surface.eg-route', 'surface.section-lines', 'surface.mass-options', 'surface.solar', 'surface.eg-pond', 'surface.eg-site', 'surface.eg-progress', 'surface.geo-soil', 'surface.geo-road', 'surface.geo-survey', 'surface.geo-mine', 'surface.geo-link', 'surface.geo-rail', 'surface.corridor-templates', 'surface.terrain-templates'] }],
        ['modify', ['view.select', 'edit.copy', 'edit.paste', 'edit.duplicate', 'edit.delete']],
        ['view', ['view.fit', 'view.view3d', 'design.profile', 'design.pvi-add', 'surface.sections', 'surface.free-section', 'surface.grades', 'surface.measure']],
        ['clipboard', ['edit.cut', 'edit.paste-in-place', 'edit.select-all', 'edit.select-none']],
      ]),
      tab('insert', [['import', ['surface.cad-open', 'surface.scan-start', 'gis.import']], ['geolocation', ['gis.crs', 'gis.basemap']], ['analysis', ['gis.analysis', 'gis.table']]]),
      tab('output', [['plot', ['export.pdf']], ['export', ['export.landxml', 'export.dxf', 'export.dwg', 'export.ifc', 'gis.export']]]),
      ...WS_TABS,   // 0.7.1
    ],
    labels: { 'export.pdf': 'input.lbl.drafting.plot', 'surface.cad-open': 'input.lbl.drafting.xattach' },
    keys: { ...CTRL_KEYS },
    typed: {
      'design.alignment': ['ALIGNMENT', 'AL'], 'design.pad': ['PAD', 'GRADING'], 'design.pipe': ['PIPE', 'PIPENETWORK'], 'surface.feature': ['FEATURELINE', 'FL'],
      'surface.breakline': ['BREAKLINE', 'BL'], 'surface.boundary': ['BOUNDARY', 'BO'], 'view.select': ['SELECT'], 'view.fit': ['ZOOM', 'Z', 'ZE', 'FIT'],
      'view.view3d': ['3D', '3DORBIT', 'ORBIT'], 'design.profile': ['PROFILE', 'PROFILEVIEW', 'PV'], 'design.pvi-add': ['PVI'], 'surface.sections': ['SECTIONS', 'SAMPLELINES', 'SECTIONVIEW'],
      'surface.grades': ['GRADES', 'SLOPES'], 'surface.mass': ['MASS'], 'surface.river': ['RIVER'], 'surface.ground-contours': ['CONTOURSURF', 'TERRAINCONTOURS'], 'surface.corridor-templates': ['TEMPLATES', 'CORRIDORTEMPLATES'], 'surface.terrain-templates': ['TERRAINTEMPLATES'], 'surface.free-section': ['FREESECTION'], 'surface.ramp': ['RAMP'], 'surface.landscape': ['LANDSCAPE'], 'surface.powerlines': ['POWERLINES'], 'edit.undo': ['U', 'UNDO'], 'edit.redo': ['REDO'], 'edit.copy': ['COPYCLIP'], 'edit.cut': ['CUTCLIP'], 'edit.paste': ['PASTECLIP'],
      'edit.paste-in-place': ['PASTEORIG'], 'edit.duplicate': ['DUPLICATE', 'DUP'], 'edit.delete': ['ERASE', 'E', 'DELETE'], 'edit.select-all': ['SELECTALL', 'AI_SELALL'],
      'edit.select-none': ['DESELECT'], 'file.new': ['NEW'], 'file.open': ['OPEN'], 'file.save': ['SAVE', 'QSAVE'], 'export.pdf': ['PLOT', 'PRINT', 'PDF'],
      'export.landxml': ['LANDXML', 'LANDXMLOUT'], 'export.dxf': ['DXFOUT', 'DXF'], 'export.dwg': ['DWGOUT', 'DWG', 'SAVEAS'], 'export.ifc': ['IFCOUT', 'IFC', 'IFCEXPORT'], 'surface.cad-open': ['XATTACH', 'LINEWORK'],
      'gis.import': ['MAPIMPORT', 'IMPORT'], 'gis.export': ['MAPEXPORT', 'EXPORT'], 'gis.crs': ['MAPCSASSIGN', 'CRS', 'COORDINATES'], 'gis.basemap': ['MAP', 'BASEMAP', 'GEOMAP'], 'gis.analysis': ['GISANALYSIS', 'ANALYZE', 'BUFFER'], 'gis.table': ['ATTRIBUTES', 'ATTTABLE', 'TABLE'],
      'app.settings': ['OPTIONS', 'SETTINGS'], 'app.help': ['HELP'],
    },
    mouse: { wheel: 1, zoomSpeed: 1, pan2d: ['middle'], orbit3d: { left: 'none', middle: 'pan', right: 'none' } },
  },
  ribbon: {
    format: 'cadcraft-input', version: 1, id: 'ribbon', name: 'input.style.ribbon', builtin: true, layout: 'ribbon',
    menus: [m('file', FILE_MENU)],
    quick: ['file.open', 'file.save', 'edit.undo', 'edit.redo'],
    tabs: [
      // 0.8 RIBBON-COMPACT (shell-08): the group's most-used tool large, the next three small, the rest behind the group name's arrow
      tab('home', [
        ['ground', [{ split: ['surface.cad-open', 'surface.scan-start', 'gis.import', 'file.open'], size: 'lg' }]],
        ['create', [{ id: 'design.alignment', size: 'lg' }, { id: 'design.pad', size: 'sm' }, { id: 'design.pipe', size: 'sm' }, { id: 'surface.feature', size: 'sm' }], { more: ['surface.mass', 'surface.ground-contours', 'surface.river', 'surface.ramp', 'surface.free-section', 'surface.water', 'surface.eg-rain', 'surface.eg-earthwork', 'surface.eg-route', 'surface.section-lines', 'surface.mass-options', 'surface.solar', 'surface.eg-pond', 'surface.eg-site', 'surface.eg-progress', 'surface.geo-soil', 'surface.geo-road', 'surface.geo-survey', 'surface.geo-mine', 'surface.geo-link', 'surface.geo-rail', 'surface.corridor-templates', 'surface.terrain-templates', 'surface.landscape', 'surface.powerlines'] }],
        ['views', [{ id: 'design.profile', size: 'lg' }, { id: 'design.pvi-add', size: 'sm' }, { id: 'surface.sections', size: 'sm' }]],
      ]),
      tab('surfaces', [['editsurface', ['surface.breakline', 'surface.boundary']], ['analyze', ['surface.grades', 'surface.measure']]]),
      tab('modify', [['clipboard', [{ id: 'edit.paste', size: 'lg' }, { id: 'edit.cut', size: 'sm' }, { id: 'edit.copy', size: 'sm' }, { id: 'edit.delete', size: 'sm' }], { more: ['edit.paste-in-place', 'edit.duplicate'] }], ['selection', ['view.select', 'edit.select-all', 'edit.select-none']]]),
      tab('geolocation', [['coordinates', ['gis.crs']], ['map', ['gis.basemap']], ['data', ['gis.export']], ['analysis', ['gis.analysis', 'gis.table']]]),
      tab('view', [['navigate', ['view.fit', 'view.view3d']]]),
      tab('output', [['export', ['export.landxml', 'export.dxf', 'export.dwg', 'export.ifc']], ['plot', ['export.pdf']]]),
      ...WS_TABS,   // 0.7.1 (the workspace layouts show these as context tabs instead: workspace-civilcraft.js)
    ],
    labels: { 'surface.cad-open': 'input.lbl.ribbon.cad', 'view.view3d': 'input.lbl.ribbon.3d' },
    keys: { ...DEFAULT_KEYS },
    // civil design programs: the middle button pans the plan; in 3D the middle button pans and Shift with it orbits
    mouse: { wheel: 1, zoomSpeed: 1, pan2d: ['middle'], orbit3d: { left: 'none', middle: 'pan', right: 'none' } },
  },
};
export const STYLE_ORDER = ['civilcraft', 'drafting', 'ribbon'];

/** IP.4: each style's family ("use this style in every app"). CivilCraft has no menu-bar style. */
export const FAMILY = { civilcraft: 'own', drafting: 'classic', ribbon: 'ribbon' };
export const STORE = 'civilcraft.input';

/** The page side the shell asks for (app-input-ui.js). civilcraft.js sets window.ccInputHooks = { status, busy }. */
export function hooks() {
  return {
    toolbar: () => document.querySelector('body > main > .cv-tools'),
    mouse: (mm) => setMouse(mm),
    // 0.7.1: a Landscape or Power lines tool whose group is hidden only because its workspace is off still runs (it turns the
    // workspace on, as its toolbar button would)
    why(cmd, b, generic) {
      const h = b?.closest('[hidden]');
      if (h && h.matches('[data-ls-group], [data-pl-group]') && !b.disabled && b.getAttribute('aria-disabled') !== 'true') return '';
      return generic(cmd, b);
    },
  };
}
