/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-workspace-format.js — the workspace layout format `cadcraft-workspace` v1 and v2 (`<name>.ccworkspace.json`; 0.7 WS.6 + WS.17; v2 = 0.10 UI.6, below,
 * owner 2026-10-24: "a design doc that allows contributors build their own layout theme"). DOM-free and import-free: the engine
 * (app-workspace.js), Settings' Import, the conformance test (bin/test-app-workspaces.mjs) and the public guide
 * (getcadcraft/addons docs/LAYOUTS.md) all read layouts through this one file. The two built-in layouts
 * (assets/workspaces/docked.ccworkspace.json, toolbox.ccworkspace.json) take exactly this path too.
 *
 * A layout is data only: which of the engine's building blocks it uses, where each goes, in what order, whether it collapses or
 * tears off, and a few look choices from a fixed list. No code, no CSS, no new tools: every tool a block shows is the app's own.
 *
 *   { "format": "cadcraft-workspace", "version": 1|2, "id": "docked", "name": "…", "description": "…", "author": "…", "license": "…",
 *     "look":   { "density": "regular|compact", "outline": "faint|box|none", "tabs": "filled|underline" },
 *     "blocks": [ { "block": "<kind>", "place": "<place>", "order": 0…99, …that block's options } ] }
 *
 * Version 2 (0.10 UI.6; a version 1 file reads exactly as before, and a version 1 file that uses a version 2 key has that key left out with a note):
 *   look.tone "theme|dark|light" · look.names "below|above" (where a group's name sits) · look.overflow "more|compact|drop" (a bar never wraps)
 *   look.zones { "<place>": { "names": "below|above" } } (a zone's own choice)
 *   ribbon.tools   { "tabs":   [ { "id", "name"?, "groups": [ { "id", "name"?, "tools": [id, "+cmd:<registry id>"] } ] } ] }
 *   toolbox.tools / toolrows.tools / toolpalette.tools   { "groups": [ { "id", "name"?, "tools": […] } ] }
 *   menubar.menus  [ { "id", "name"?, "items": [registry command ids] } ]
 *   <block>.when   { "<tool id>": { "enabled"?: expr, "visible"?: expr } } (ribbon, toolbox, toolrows, menubar) and ribbon.tools.tabs[].show: expr — declarations read against the one state (app-state.js)
 *   palettes.stacks [ [slot, …], [slot, …] ]   (two stacks; replaces upper / lower) · palettes.place2 "left-panel|right-panel" (the second stack in the other panel; 0.11 UI.5)
 *   a group in a `tools` section: "visible": 1…48 (how many of its tools show; the rest under its ▾) · "size": "large|small" (a ribbon group's tools all large or all small; 0.11 UI.6)
 *   "place": "window" (ribbon, toolbox, toolrows, statusbar; 0.11 UI.6 / UI.3): the block opens in a window of its own (one click: a browser opens windows only inside one), at home until then
 * A tool, group, tab or menu is named by the app's own id; app-workspace-tools.js shapes the app's lists by these (an id the app lacks is left out with a note at resolve time).
 *
 * Read as untrusted: unknown keys are dropped and counted, every value is bounded, a block in a place it cannot go is dropped with a
 * note; a file that is not a layout (wrong format, newer version, no id or name, no block left) is refused with a reason and the app
 * stays on its classic layout.
 *
 *   validateLayout(obj)            → { ok, layout?, dropped: [notes], error? }
 *   importLayout(text)             → the same, from the file's text (size checked first)
 *   exportLayout(layout)           → the file's text (pretty JSON)
 *   resolveLayout(layout, caps)    → { blocks, notes, ok }: the blocks THIS app can fill (caps from its adapter)
 *   layoutRef(value)               → { kind: 'standard' | 'builtin' | 'addon' | 'file', id } for a cc-workspace value
 */
export const FORMAT = 'cadcraft-workspace';
export const VERSION = 2;
export const EXT = '.ccworkspace.json';
export const INDEX_FORMAT = 'cadcraft-workspace-addons';
export const LIMITS = Object.freeze({ bytes: 65536, blocks: 16, name: 60, description: 300, author: 80, list: 12, slots: 8, order: 99, files: 8,
  tabs: 12, groups: 16, tools: 48, toolsTotal: 400, menus: 12, stacks: 2, label: 32, when: 64 });   // v2: tabs, groups per tab, tools per group, tools in one block, menus, palette stacks, a tab / group / menu name
export const ID_RE = /^[a-z][a-z0-9-]{1,39}$/;
export const SLOT_RE = /^[a-z][a-z0-9-]{0,23}$/;
export const RESERVED = ['standard', 'classic', 'none'];

/** The well-known actions a title bar, a File menu or an options bar may name (each app's adapter maps them to its own commands). */
export const ACTIONS = ['open', 'save', 'undo', 'redo', 'select', 'clear', 'fit'];

/**
 * Where a block can go. Around the app's <main>: top, bottom. Inside the app's panels (they keep docking, floating and their own
 * windows): left-panel, right-panel. In the drawing area: stage-top / stage-bottom (the full width), stage-left / stage-right (columns),
 * view-top / view-bottom (over the drawing, between the columns). float = over the drawing by the pointer, only while it is wanted (the
 * pet palette). none = left out (for the app's own toolbar: hidden).
 */
export const PLACES = ['top', 'bottom', 'left-panel', 'right-panel', 'stage-top', 'stage-bottom', 'stage-left', 'stage-right', 'view-top', 'view-bottom', 'view-tl', 'view-tr', 'view-bl', 'view-br', 'float', 'window', 'none'];
/** 0.11 UI.6: "window" is a version 2 place (a version 1 file naming it has the block left out, as before); resolveLayout mounts the block at its first place with `window: true`. */
export const V2_PLACES = Object.freeze(['window']);
export const CORNERS = Object.freeze(['view-tl', 'view-tr', 'view-bl', 'view-br']);   // UI.10: the four corners of the drawing, each a small stack of overlays

const bool = (v) => v === true;
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
/** v2: a tool is the app's own id or "+cmd:<registry command id>"; a tab / group / menu id is lower-case with hyphens. */
export const TOOL_RE = /^(\+cmd:)?[A-Za-z0-9][A-Za-z0-9._:/-]{0,63}$/;
export const PART_RE = /^[a-z0-9][a-z0-9-]{0,31}$/;
const strip = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max).replace(/[\ud800-\udbff]$/, '') : '');
/** v2 groups: [{ id, name?, tools: [..] }] from untrusted JSON; ids unique, every list bounded; `left` counts the tools still allowed in the block. */
function readGroups(v, left) {
  if (!Array.isArray(v)) return [];
  const out = [], ids = new Set();
  for (const g of v.slice(0, LIMITS.groups)) {
    if (!isObj(g) || typeof g.id !== 'string' || !PART_RE.test(g.id) || ids.has(g.id)) continue;
    ids.add(g.id);
    const tools = list(g.tools, (x) => TOOL_RE.test(x), LIMITS.tools).slice(0, Math.max(0, left.n));
    left.n -= tools.length;
    const name = strip(g.name, LIMITS.label), o = { id: g.id };
    if (name) o.name = name;
    o.tools = tools;
    if (Number.isInteger(g.visible) && g.visible >= 1 && g.visible <= LIMITS.tools) o.visible = g.visible;   // 0.11 UI.6: the first n tools show, the rest sit under the group's ▾
    if (g.size === 'large' || g.size === 'small') o.size = g.size;   // 0.11 UI.6: a ribbon group drawn all large or all small
    out.push(o);
  }
  return out;
}
/** v2 declarations (UI.25): a when-expression is the small language of app-state.js (a path, a number, a word, == != > >= < <=, ! && || ( ) and `has`); read as text only, never run here. */
export const EXPR_RE = /^[A-Za-z0-9_.:+\- <>=!&|()'"]{1,120}$/;
const expr = (v) => { if (typeof v !== 'string') return ''; const t = v.replace(/^ +| +$/g, ''); return EXPR_RE.test(t) ? t : ''; };
/** `when` = { "<tool id>": { enabled?: expr, visible?: expr } } */
function readWhen(v) {
  if (!isObj(v)) return undefined;
  const out = {}; let n = 0;
  for (const k of Object.keys(v)) {
    if (n >= LIMITS.when) break;
    if (!TOOL_RE.test(k) || /^\d+$/.test(k) || !isObj(v[k])) continue;   // a purely numeric id would read as a list on the server
    const o = {}, en = expr(v[k].enabled), vi = expr(v[k].visible);
    if (en) o.enabled = en;
    if (vi) o.visible = vi;
    if (Object.keys(o).length) { out[k] = o; n++; }
  }
  return n ? out : undefined;
}
/** ribbon.tools = { tabs: [{ id, name?, groups }] } */
function readRibbonTools(v) {
  if (!isObj(v) || !Array.isArray(v.tabs)) return undefined;
  const left = { n: LIMITS.toolsTotal }, tabs = [], ids = new Set();
  for (const t of v.tabs.slice(0, LIMITS.tabs)) {
    if (!isObj(t) || typeof t.id !== 'string' || !PART_RE.test(t.id) || ids.has(t.id)) continue;
    ids.add(t.id);
    const o = { id: t.id }, name = strip(t.name, LIMITS.label); if (name) o.name = name;
    const show = expr(t.show); if (show) o.show = show;   // v2 (UI.25): a tab that appears and goes by the shared state
    o.groups = readGroups(t.groups, left); tabs.push(o);
  }
  return tabs.length ? { tabs } : undefined;
}
/** toolbox.tools / toolrows.tools / toolpalette.tools = { groups: [{ id, name?, tools }] } */
function readGroupTools(v) {
  if (!isObj(v) || !Array.isArray(v.groups)) return undefined;
  const groups = readGroups(v.groups, { n: LIMITS.toolsTotal });
  return groups.length ? { groups } : undefined;
}
/** menubar.menus = [{ id, name?, items: [ids] }] */
function readMenus(v) {
  if (!Array.isArray(v)) return undefined;
  const out = [], ids = new Set(); let left = LIMITS.toolsTotal;
  for (const m of v.slice(0, LIMITS.menus)) {
    if (!isObj(m) || typeof m.id !== 'string' || !PART_RE.test(m.id) || ids.has(m.id)) continue;
    ids.add(m.id);
    const items = list(m.items, (x) => TOOL_RE.test(x), LIMITS.tools).slice(0, Math.max(0, left)); left -= items.length;
    const o = { id: m.id }, name = strip(m.name, LIMITS.label); if (name) o.name = name;
    o.items = items; out.push(o);
  }
  return out.length ? out : undefined;
}
/** palettes.stacks = [[slot, …], …] (two at most, four palettes in each) */
function readStacks(v) {
  if (!Array.isArray(v)) return undefined;
  const out = [];
  for (const s of v.slice(0, LIMITS.stacks)) { const l = list(s, isSlot, 4); if (l.length) out.push(l); }
  return out.length ? out : undefined;
}
const list = (v, ok, max) => (Array.isArray(v) ? [...new Set(v.filter((x) => typeof x === 'string' && ok(x)))].slice(0, max) : []);
const isAction = (x) => ACTIONS.includes(x);
/** 0.10 interface blocks (app-block-*.js, ui-blocks-10): `flag` = true or left out; a command id is any registry id. */
const flag = (v) => (v === true ? true : undefined);
export const CMD_RE = /^[A-Za-z][A-Za-z0-9._:-]{0,47}$/;
const cmds = (max) => (v) => (Array.isArray(v) ? [...new Set(v.filter((x) => typeof x === 'string' && CMD_RE.test(x)))].slice(0, max) : undefined);
export const CMD_MODES = Object.freeze(['docked', 'float', 'window', 'hidden']);
const isSlot = (x) => SLOT_RE.test(x);
/** Own keys only (2026-11-10): a file naming "toString", "constructor" or "__proto__" must be refused or dropped, never reach Object.prototype. */
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/**
 * The building blocks. `places`: where it may go (the first is its default); `opts`: its own keys, each read by a function that
 * returns the bounded value (undefined = left out). `needs`: what the app's adapter must offer (resolveLayout).
 */
export const BLOCKS = Object.freeze({
  titlebar: { places: ['top'], needs: [], opts: {   // the app's logo and name, quick commands, the document's name, full screen, Help, Settings; hides the app bar
    quick: cmds(LIMITS.list), inventory: bool,   // quick: the well-known actions or any registry command id (0.10 UI.8)
    menus: flag, switcher: flag, find: flag, pins: flag } },   // 0.10 UI.8 / UI.24: the absolute top (app-block-titlebar.js): the Craft menu, the layout switcher, Find, up to six pinned options
  ribbon: { places: ['top', 'stage-top', 'window'], needs: ['ribbon'], opts: {   // the app's ribbon (tabs → groups → large and small tools), a File menu
    file: (v) => list(v, isAction, LIMITS.list), collapse: bool, collapsed: bool, tearOff: bool, tools: readRibbonTools, when: readWhen, more: flag, slots: flag, contextual: flag } },   // more, slots, contextual: UI.11 (app-block-ribbonx.js)   // tools (v2): the tabs, groups and tools; collapsed: starts folded to its tabs (needs collapse)
  options: { places: ['top', 'bottom', 'stage-top', 'stage-bottom'], needs: [], opts: {   // what the running tool asks for, or what to do next
    commands: (v) => list(v, isAction, LIMITS.list) } },
  toolbar: { places: ['none', 'stage-top', 'stage-bottom'], needs: ['toolbar'], opts: {} },   // the app's own toolbar (every toolbar style, Arrange, lock)
  infobox: { places: ['stage-top', 'stage-bottom'], needs: [], opts: {   // labelled groups: the app's slots; "tool" = the running tool's options or the selection
    slots: (v) => list(v, isSlot, LIMITS.slots) } },
  toolbox: { places: ['stage-left', 'stage-right', 'window'], needs: ['toolbox'], opts: {   // a column of the app's tools in groups
    collapse: bool, tearOff: bool, mine: bool, tools: readGroupTools, when: readWhen } },   // mine: a "My tools" group of empty slots a person fills (WS.21)
  petpalette: { places: ['float'], needs: [], opts: {} },   // the app's edit commands by the pointer when something is picked (WS.22)
  palettes: { places: ['left-panel', 'right-panel'], needs: [], opts: {   // two palettes stacked inside an app panel; "panel" = that panel's own content
    upper: (v) => (typeof v === 'string' && isSlot(v) ? v : undefined), lower: (v) => list(v, isSlot, 4),
    rail: bool, stacks: readStacks, place2: (v) => (v === 'left-panel' || v === 'right-panel' ? v : undefined) } },   // rail: a column of icons on the panel's left that shows one palette at a time (Duncan)
  viewtabs: { places: ['view-top', 'view-bottom'], needs: ['views'], opts: {   // open = a tab per opened view (closable); all = a tab for every view
    mode: (v) => (v === 'open' || v === 'all' ? v : undefined) } },
  viewbar: { places: ['view-bottom', 'view-top'], needs: [], opts: {   // the current view's name and the app's view slots
    slots: (v) => list(v, isSlot, LIMITS.slots) } },
  quickbar: { places: ['stage-bottom', 'stage-top', 'bottom'], needs: [], opts: {   // a strip of the app's slots
    slots: (v) => list(v, isSlot, LIMITS.slots) } },
  toolrows: { places: ['top', 'stage-top', 'window'], needs: ['toolbox'], opts: {   // the toolbox's groups laid out as two rows over the drawing (Duncan, 0.9 DU.1); each group shows its first tools and keeps the whole set under ▾
    split: (v) => (Number.isInteger(v) && v >= 1 && v <= 12 ? v : undefined), visible: (v) => (Number.isInteger(v) && v >= 2 && v <= 12 ? v : undefined), tearOff: bool,
    icons: (v) => (v === 'set' || v === 'app' ? v : undefined), tools: readGroupTools, when: readWhen } },   // icons: "set" = one icon family for the tools it knows, "app" (default) = the app's own   // split: groups in row one (default: half)
  menubar: { places: ['top'], needs: [], opts: {   // the classic menu bar (Vector, 0.9 VEC.1): every command of the app's input registry under one menu, by its group; shell: Help + Settings at the right (default on)
    shell: (v) => (typeof v === 'boolean' ? v : undefined),
    set: (v) => (v === 'vector' || v === 'sketch' || v === 'rhino' || v === 'drafting' ? v : undefined), menus: readMenus, when: readWhen } },   // set: which menus (vector = File Edit View Modify Model AEC Tools Text Window Cloud Help; sketch = File Edit View Camera Draw Tools Window Extensions Help)
  toolpalette: { places: ['stage-left', 'stage-right'], needs: ['toolbox'], opts: {   // Basic (a fixed-order icon grid) over Tool Sets (a row of set icons, the chosen set's tools as rows); the toolbox's groups, all of them
    columns: (v) => (Number.isInteger(v) && v >= 1 && v <= 6 ? v : undefined), sets: (v) => (typeof v === 'boolean' ? v : undefined), basic: (v) => (v === 'sketch' || v === 'rhino' ? v : undefined), icons: (v) => (v === 'set' || v === 'app' ? v : undefined), attributes: bool, tools: readGroupTools } },   // attributes: an Attributes palette between Basic and Tool Sets (the selection's fill / pen / layer controls)
  viewports: { places: ['none'], needs: ['viewports'], opts: {   // the drawing area shows several views of the model at once (Rhino, 0.9 RH.1): four = Top, Front, Right and a Perspective, one active; only apps that offer it (the 3D model apps)
    layout: (v) => (v === 'four' || v === 'single' ? v : undefined) } },
  viewlabel: { places: ['view-tl', 'view-tr', 'view-bl', 'view-br'], needs: [], opts: { corner: (v) => (CORNERS.includes(v) ? v : undefined) } },   // 0.10 UI.10: [-][Top][2D Wireframe]: the view's name, display mode and scale
  viewcube: { places: ['view-tr', 'view-tl', 'view-bl', 'view-br'], needs: ['view3d'], opts: { corner: (v) => (CORNERS.includes(v) ? v : undefined) } },   // the 3D view's orientation, a compass and the named views
  navbar: { places: ['view-br', 'view-tl', 'view-tr', 'view-bl'], needs: [], opts: { corner: (v) => (CORNERS.includes(v) ? v : undefined) } },   // pan, zoom, zoom window, orbit
  axes: { places: ['view-bl', 'view-tl', 'view-tr', 'view-br'], needs: [], opts: { corner: (v) => (CORNERS.includes(v) ? v : undefined) } },   // the axes (UCS) icon
  commandline: { places: ['stage-bottom', 'bottom', 'float'], needs: [], opts: {   // 0.10 UI.9: the one command line, docked, floating over the drawing, in a window of its own, or hidden
    history: flag, log: flag, width: (v) => (Number.isInteger(v) && v >= 20 && v <= 60 ? v : undefined), mode: (v) => (CMD_MODES.includes(v) ? v : undefined) } },
  statustoggles: { places: ['bottom'], needs: [], opts: { toggles: cmds(16) } },   // 0.10 UI.11: mode toggles (grid, snap, ortho …) as lit icon buttons, the scale, a gear that chooses which show
  modeltabs: { places: ['view-bottom', 'view-top'], needs: ['views'], opts: {} },   // 0.10 UI.11: Model / Layout tabs with a "+" where the app can add a view
  statusbar: { places: ['bottom', 'window'], needs: [], opts: {   // the app's status line, the selection count, the layout's name; command: a command line docked in it
    command: bool, tearOff: bool } },
});
export const LOOK = Object.freeze({ density: ['regular', 'compact', 'comfortable'], outline: ['faint', 'box', 'none'], tabs: ['filled', 'underline'],
  skin: ['pro'],
  tone: ['theme', 'dark', 'light'], names: ['below', 'above'], overflow: ['more', 'compact', 'drop'] });   // tone, names, overflow: version 2 (UI.6, UI.16)
/** The version 2 keys: a version 1 file that uses one has it left out with a note (so a v1 file means what it always meant). */
export const V2_LOOK = Object.freeze(['tone', 'names', 'overflow', 'zones']);
export const V2_OPTS = Object.freeze({ ribbon: ['tools', 'when'], toolbox: ['tools', 'when'], toolrows: ['tools', 'when'], toolpalette: ['tools'], menubar: ['menus', 'when'], palettes: ['stacks', 'place2'] });   // skin (optional, left out = the classic paint): "pro" = the Pro skin, one chrome for every app (0.10 PRO.1); a file without it is unchanged
const TOP_KEYS = ['format', 'version', 'id', 'name', 'nameKey', 'description', 'hintKey', 'author', 'license', 'look', 'blocks'];

const clean = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max).replace(/[\ud800-\udbff]$/, '') : '');   // never half a character at the cut
const KEY_RE = /^shell\.ws\.[a-z0-9.-]{1,60}$/;

/** A stable text for a value (keys sorted): two JSON values that mean the same compare equal whatever their key order. */
function canon(v) {
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  if (isObj(v)) return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  return JSON.stringify(v);
}
/** look.zones = { "<place>": { names: below | above } } */
function readZones(v) {
  if (!isObj(v)) return undefined;
  const out = {};
  for (const k of Object.keys(v)) {
    if (!PLACES.includes(k) || k === 'none' || k === 'window' || !isObj(v[k])) continue;
    const names = v[k].names;
    if (LOOK.names.includes(names)) out[k] = { names };
  }
  return Object.keys(out).length ? out : undefined;
}

export function validateLayout(obj) {
  const dropped = [];
  const fail = (error) => ({ ok: false, error, dropped });
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return fail('not-json-object');
  if (obj.format !== FORMAT) return fail('not-a-layout');
  if (typeof obj.version !== 'number' || obj.version < 1) return fail('bad-version');
  if (obj.version > VERSION) return fail('newer-version');
  const ver = obj.version >= 2 ? 2 : 1;   // 1.5 reads as 1
  for (const k of Object.keys(obj)) if (!TOP_KEYS.includes(k)) dropped.push('key ' + k);
  const id = typeof obj.id === 'string' ? obj.id : '';
  if (!ID_RE.test(id) || RESERVED.includes(id)) return fail('bad-id');
  const name = clean(obj.name, LIMITS.name);
  if (!name) return fail('no-name');
  const out = { format: FORMAT, version: ver, id, name, look: { density: 'regular', outline: 'box', tabs: 'filled' }, blocks: [] };
  if (typeof obj.nameKey === 'string' && KEY_RE.test(obj.nameKey)) out.nameKey = obj.nameKey; else if (obj.nameKey !== undefined) dropped.push('nameKey');
  if (typeof obj.hintKey === 'string' && KEY_RE.test(obj.hintKey)) out.hintKey = obj.hintKey; else if (obj.hintKey !== undefined) dropped.push('hintKey');
  const description = clean(obj.description, LIMITS.description); if (description) out.description = description;
  const author = clean(obj.author, LIMITS.author); if (author) out.author = author;
  if (typeof obj.license === 'string' && /^[A-Za-z0-9.+-]{1,40}$/.test(obj.license)) out.license = obj.license; else if (obj.license !== undefined) dropped.push('license');
  if (obj.look && typeof obj.look === 'object' && !Array.isArray(obj.look)) {
    for (const [k, v] of Object.entries(obj.look)) {
      if (V2_LOOK.includes(k) && ver < 2) { dropped.push('v2 look.' + k); continue; }
      if (k === 'zones') {
        const z = readZones(v);
        if (z) out.look.zones = z;
        if (!z || canon(z) !== canon(v)) dropped.push('look.zones');
        continue;
      }
      if (own(LOOK, k) && LOOK[k].includes(v)) out.look[k] = v; else dropped.push('look.' + k);
    }
  } else if (obj.look !== undefined) dropped.push('look');
  const seen = new Set();
  for (const b of (Array.isArray(obj.blocks) ? obj.blocks : []).slice(0, LIMITS.blocks * 2)) {
    if (!b || typeof b !== 'object' || Array.isArray(b)) { dropped.push('block (not an object)'); continue; }
    const spec = typeof b.block === 'string' && own(BLOCKS, b.block) ? BLOCKS[b.block] : null;
    if (!spec) { dropped.push('block ' + clean(String(b.block), 24)); continue; }
    if (seen.has(b.block)) { dropped.push('block ' + b.block + ' (twice)'); continue; }
    const place = b.place === undefined ? spec.places[0] : b.place;
    if (!spec.places.includes(place) || (ver < 2 && V2_PLACES.includes(place))) { dropped.push('block ' + b.block + ' (cannot go ' + clean(String(place), 24) + ')'); continue; }
    if (seen.size >= LIMITS.blocks) { dropped.push('block ' + b.block + ' (too many)'); continue; }
    seen.add(b.block);
    const order = Number.isInteger(b.order) && b.order >= 0 && b.order <= LIMITS.order ? b.order : 0;
    if (b.order !== undefined && order !== b.order) dropped.push(b.block + '.order');
    const blk = { block: b.block, place, order };
    for (const [k, v] of Object.entries(b)) {
      if (k === 'block' || k === 'place' || k === 'order') continue;
      if (ver < 2 && own(V2_OPTS, b.block) && V2_OPTS[b.block].includes(k)) { dropped.push('v2 ' + b.block + '.' + clean(k, 24)); continue; }
      const read = own(spec.opts, k) ? spec.opts[k] : null;
      const val = read ? read(v) : undefined;
      if (val === undefined || (Array.isArray(val) && Array.isArray(v) && val.length !== v.length) || (V2_OPTS[b.block]?.includes(k) && canon(val) !== canon(v))) dropped.push(b.block + '.' + clean(k, 24));
      if (val !== undefined) blk[k] = val;
    }
    out.blocks.push(blk);
  }
  if (!Array.isArray(obj.blocks)) return fail('no-blocks');
  if (!out.blocks.some((b) => b.place !== 'none')) return fail('no-blocks');
  return { ok: true, layout: out, dropped };
}

export function importLayout(text) {
  if (typeof text !== 'string') return { ok: false, error: 'not-json-object', dropped: [] };
  const bytes = typeof TextEncoder === 'function' ? new TextEncoder().encode(text).length : text.length;
  if (bytes > LIMITS.bytes) return { ok: false, error: 'too-big', dropped: [] };
  let obj;
  try { obj = JSON.parse(text); } catch (e) { return { ok: false, error: 'not-json', dropped: [] }; }
  return validateLayout(obj);
}

export function exportLayout(layout) {
  const r = validateLayout(layout);
  if (!r.ok) throw new Error('not a layout: ' + r.error);
  return JSON.stringify(r.layout, null, 2) + '\n';
}

/**
 * The blocks THIS app can fill. caps = { ribbon, toolbox, toolbar, views, viewports: booleans; slots: [names]; palettes: [names];
 * actions: [ids] }. A block whose need the app lacks is dropped; a slot, palette or action the app lacks is dropped from its block.
 * Every drop is a note (the conformance test prints them; Settings says how many). ok = at least one block placed somewhere.
 */
export function resolveLayout(layout, caps = {}) {
  const notes = [], blocks = [];
  const slots = new Set(caps.slots || []), palettes = new Set([...(caps.palettes || []), 'panel']), actions = new Set(caps.actions || []);
  // v2: a tool id the app lacks is left out with a note; a caps table without `tools` / `commands` (the checker's older harvest) checks nothing
  const toolSet = Array.isArray(caps.tools) ? new Set(caps.tools) : null, cmdSet = Array.isArray(caps.commands) ? new Set(caps.commands) : null;
  const known = (id) => (id.startsWith('+cmd:') ? !cmdSet || cmdSet.has(id.slice(5)) : !toolSet || toolSet.has(id));
  for (const b of layout.blocks) {
    const spec = BLOCKS[b.block];
    const miss = spec.needs.find((n) => !caps[n]);
    if (miss) { notes.push(b.block + ': this app has no ' + miss); continue; }
    const r = { ...b };
    if (r.place === 'window') { r.place = spec.places[0]; r.window = true; r.tearOff = true; }   // v2: mounted at home, then offered to its own window
    for (const k of ['quick', 'file', 'commands']) if (r[k]) { const okId = (x) => actions.has(x) || (k === 'quick' && !!cmdSet && cmdSet.has(x)); const keep = r[k].filter(okId); if (keep.length < r[k].length) notes.push(b.block + '.' + k + ': ' + r[k].filter((x) => !okId(x)).join(', ')); r[k] = keep; }
    if (Array.isArray(r.slots)) { const keep = r.slots.filter((x) => x === 'tool' || slots.has(x)); if (keep.length < r.slots.length) notes.push(b.block + '.slots: ' + r.slots.filter((x) => !keep.includes(x)).join(', ')); r.slots = keep; }
    if (r.tools) {
      const gone = [], keep = (groups) => groups.map((g) => ({ ...g, tools: g.tools.filter((id) => known(id) || (gone.push(id), false)) }));
      r.tools = r.tools.tabs ? { tabs: r.tools.tabs.map((t) => ({ ...t, groups: keep(t.groups) })) } : { groups: keep(r.tools.groups) };
      if (gone.length) notes.push(b.block + '.tools: ' + gone.join(', '));
    }
    if (Array.isArray(r.menus)) {
      const gone = [];
      r.menus = r.menus.map((m) => ({ ...m, items: m.items.filter((id) => !cmdSet || cmdSet.has(id.replace(/^\+cmd:/, '')) || (gone.push(id), false)) }));
      if (gone.length) notes.push(b.block + '.menus: ' + gone.join(', '));
    }
    if (b.block === 'palettes') {
      if (r.stacks) {
        const gone = [], st = r.stacks.map((x) => x.filter((n) => palettes.has(n) || (gone.push(n), false))).filter((x) => x.length);
        if (gone.length) notes.push('palettes.stacks: ' + gone.join(', '));
        if (st.length) r.stacks = st; else delete r.stacks;
      }
      if (r.place2) {   // the second stack in the other panel: only with two stacks, never the host panel's own content
        const two = r.stacks && r.stacks.length === 2 && r.place2 !== r.place;
        if (two && r.stacks[1].includes('panel')) { notes.push('palettes.stacks: panel'); const s2 = r.stacks[1].filter((n) => n !== 'panel'); r.stacks = s2.length ? [r.stacks[0], s2] : [r.stacks[0]]; }
        if (!(r.stacks && r.stacks.length === 2 && r.place2 !== r.place)) { notes.push('palettes.place2: ' + r.place2); delete r.place2; }
      }
      if (r.upper && !palettes.has(r.upper)) { notes.push('palettes.upper: ' + r.upper); delete r.upper; }
      if (r.lower) { const keep = r.lower.filter((x) => palettes.has(x)); if (keep.length < r.lower.length) notes.push('palettes.lower: ' + r.lower.filter((x) => !keep.includes(x)).join(', ')); r.lower = keep; }
      if (!r.upper && !(r.lower || []).length && !r.stacks) { notes.push('palettes: nothing left to show'); continue; }
    }
    if ((b.block === 'infobox' || b.block === 'quickbar') && !(r.slots || []).length) { notes.push(b.block + ': no slot this app has'); continue; }
    blocks.push(r);
  }
  blocks.sort((a, b) => PLACES.indexOf(a.place) - PLACES.indexOf(b.place) || a.order - b.order);
  return { ok: blocks.some((b) => b.place !== 'none'), blocks, notes };
}

export function layoutRef(value) {
  const v = typeof value === 'string' ? value : '';
  if (!v || v === 'standard') return { kind: 'standard', id: 'standard' };
  const m = /^(addon|file):([a-z][a-z0-9-]{1,39})$/.exec(v);
  if (m) return { kind: m[1], id: m[2] };
  if (ID_RE.test(v)) return { kind: 'builtin', id: v };
  return { kind: 'standard', id: 'standard' };
}
