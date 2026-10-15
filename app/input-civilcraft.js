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

export const COMMANDS = [
  C('file.new', 'file', 'bi-file-earmark-plus', T('File', 'new')),
  C('file.open', 'file', 'bi-folder2-open', T('File', 'open'), { defKeys: ['Ctrl+O'] }),
  C('file.save', 'file', 'bi-save', T('File', 'save'), { defKeys: ['Ctrl+S'] }),
  C('export.landxml', 'export', 'bi-filetype-xml', T('Export', 'landxml')),
  C('export.dxf', 'export', 'bi-vector-pen', T('Export', 'dxf')),
  C('export.dwg', 'export', 'bi-file-earmark-ruled', T('Export', 'dwg')),
  C('export.pdf', 'export', 'bi-printer', T('Export', 'pdf'), { defKeys: ['Ctrl+P'] }),
  C('surface.breakline', 'surface', 'bi-bezier2', T('Surface', 'breakline'), { defKeys: ['B'] }),
  C('surface.boundary', 'surface', 'bi-bounding-box', T('Surface', 'boundary'), { defKeys: ['O'] }),
  C('surface.cad-open', 'surface', 'bi-file-earmark-ruled', T('Surface', 'cad-open')),
  C('surface.feature', 'surface', 'bi-bezier', T('Surface', 'feature'), { defKeys: ['L'] }),
  C('surface.sections', 'surface', 'bi-layout-three-columns', T('Surface', 'sections'), { defKeys: ['X'] }),
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
  C('view.select', 'view', 'bi-cursor', T('View', 'select'), { defKeys: ['V'] }),
  C('view.fit', 'view', 'bi-arrows-fullscreen', T('View', 'fit'), { defKeys: ['F'] }),
  C('view.view3d', 'view', 'bi-badge-3d', T('View', 'view3d'), { defKeys: ['D'] }),
  C('app.settings', 'app', 'bi-gear', '[data-settings-open]', { defKeys: ['Ctrl+,'], keyOnly: true }),
  C('app.palette', 'app', 'bi-search', '[data-palette-open]', { defKeys: ['Ctrl+K'], keyOnly: true }),
  C('app.help', 'app', 'bi-question-circle', '[data-help-open]', { defKeys: ['F1'], keyOnly: true }),
];
export const GROUPS = ['file', 'export', 'surface', 'design', 'edit', 'gis', 'view', 'app'];

// CivilCraft's own keys = the registry's (what the app does with no profile at all)
const DEFAULT_KEYS = Object.fromEntries(COMMANDS.filter((c) => c.defKeys.length && !c.fixed).map((c) => [c.id, c.defKeys.slice()]));
const CTRL_KEYS = Object.fromEntries(Object.entries(DEFAULT_KEYS).filter(([, k]) => k.every((x) => /^(Ctrl|F\d)/.test(x))));

const m = (label, items) => ({ label: 'input.m.' + label, items });
const tab = (label, panels) => ({ label: 'input.m.' + label, panels: panels.map(([l, items]) => ({ label: 'input.m.' + l, items })) });
const FILE_MENU = ['file.new', 'file.open', 'file.save', '-', 'export.pdf', '-', 'app.settings', 'app.palette', 'app.help'];

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
        ['draw', ['design.alignment', 'design.pad', 'design.pipe', 'surface.feature', 'surface.breakline', 'surface.boundary']],
        ['modify', ['view.select', 'edit.copy', 'edit.paste', 'edit.duplicate', 'edit.delete']],
        ['view', ['view.fit', 'view.view3d', 'design.profile', 'design.pvi-add', 'surface.sections', 'surface.grades']],
        ['clipboard', ['edit.cut', 'edit.paste-in-place', 'edit.select-all', 'edit.select-none']],
      ]),
      tab('insert', [['import', ['surface.cad-open', 'gis.import']], ['geolocation', ['gis.crs', 'gis.basemap']]]),
      tab('output', [['plot', ['export.pdf']], ['export', ['export.landxml', 'export.dxf', 'export.dwg', 'gis.export']]]),
    ],
    labels: { 'export.pdf': 'input.lbl.drafting.plot', 'surface.cad-open': 'input.lbl.drafting.xattach' },
    keys: { ...CTRL_KEYS },
    typed: {
      'design.alignment': ['ALIGNMENT', 'AL'], 'design.pad': ['PAD', 'GRADING'], 'design.pipe': ['PIPE', 'PIPENETWORK'], 'surface.feature': ['FEATURELINE', 'FL'],
      'surface.breakline': ['BREAKLINE', 'BL'], 'surface.boundary': ['BOUNDARY', 'BO'], 'view.select': ['SELECT'], 'view.fit': ['ZOOM', 'Z', 'ZE', 'FIT'],
      'view.view3d': ['3D', '3DORBIT', 'ORBIT'], 'design.profile': ['PROFILE', 'PROFILEVIEW', 'PV'], 'design.pvi-add': ['PVI'], 'surface.sections': ['SECTIONS', 'SAMPLELINES', 'SECTIONVIEW'],
      'surface.grades': ['GRADES', 'SLOPES'], 'edit.undo': ['U', 'UNDO'], 'edit.redo': ['REDO'], 'edit.copy': ['COPYCLIP'], 'edit.cut': ['CUTCLIP'], 'edit.paste': ['PASTECLIP'],
      'edit.paste-in-place': ['PASTEORIG'], 'edit.duplicate': ['DUPLICATE', 'DUP'], 'edit.delete': ['ERASE', 'E', 'DELETE'], 'edit.select-all': ['SELECTALL', 'AI_SELALL'],
      'edit.select-none': ['DESELECT'], 'file.new': ['NEW'], 'file.open': ['OPEN'], 'file.save': ['SAVE', 'QSAVE'], 'export.pdf': ['PLOT', 'PRINT', 'PDF'],
      'export.landxml': ['LANDXML', 'LANDXMLOUT'], 'export.dxf': ['DXFOUT', 'DXF'], 'export.dwg': ['DWGOUT', 'DWG', 'SAVEAS'], 'surface.cad-open': ['XATTACH', 'LINEWORK'],
      'gis.import': ['MAPIMPORT', 'IMPORT'], 'gis.export': ['MAPEXPORT', 'EXPORT'], 'gis.crs': ['MAPCSASSIGN', 'CRS', 'COORDINATES'], 'gis.basemap': ['MAP', 'BASEMAP', 'GEOMAP'],
      'app.settings': ['OPTIONS', 'SETTINGS'], 'app.help': ['HELP'],
    },
    mouse: { wheel: 1, zoomSpeed: 1, pan2d: ['middle'], orbit3d: { left: 'none', middle: 'pan', right: 'none' } },
  },
  ribbon: {
    format: 'cadcraft-input', version: 1, id: 'ribbon', name: 'input.style.ribbon', builtin: true, layout: 'ribbon',
    menus: [m('file', FILE_MENU)],
    quick: ['file.open', 'file.save', 'edit.undo', 'edit.redo'],
    tabs: [
      tab('home', [['ground', ['file.open', 'surface.cad-open', 'gis.import']], ['create', ['design.alignment', 'design.pad', 'design.pipe', 'surface.feature']], ['views', ['design.profile', 'design.pvi-add', 'surface.sections']]]),
      tab('surfaces', [['editsurface', ['surface.breakline', 'surface.boundary']], ['analyze', ['surface.grades']]]),
      tab('modify', [['clipboard', ['edit.cut', 'edit.copy', 'edit.paste', 'edit.paste-in-place', 'edit.duplicate', 'edit.delete']], ['selection', ['view.select', 'edit.select-all', 'edit.select-none']]]),
      tab('geolocation', [['coordinates', ['gis.crs']], ['map', ['gis.basemap']], ['data', ['gis.export']]]),
      tab('view', [['navigate', ['view.fit', 'view.view3d']]]),
      tab('output', [['export', ['export.landxml', 'export.dxf', 'export.dwg']], ['plot', ['export.pdf']]]),
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
  };
}
