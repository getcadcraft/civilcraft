/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-workspace-format.js — the workspace layout format `cadcraft-workspace` v1 (`<name>.ccworkspace.json`; 0.7 WS.6 + WS.17,
 * owner 2026-10-24: "a design doc that allows contributors build their own layout theme"). DOM-free and import-free: the engine
 * (app-workspace.js), Settings' Import, the conformance test (bin/test-app-workspaces.mjs) and the public guide
 * (getcadcraft/addons docs/LAYOUTS.md) all read layouts through this one file. The two built-in layouts
 * (assets/workspaces/docked.ccworkspace.json, toolbox.ccworkspace.json) take exactly this path too.
 *
 * A layout is data only: which of the engine's building blocks it uses, where each goes, in what order, whether it collapses or
 * tears off, and a few look choices from a fixed list. No code, no CSS, no new tools: every tool a block shows is the app's own.
 *
 *   { "format": "cadcraft-workspace", "version": 1, "id": "docked", "name": "…", "description": "…", "author": "…", "license": "…",
 *     "look":   { "density": "regular|compact", "outline": "faint|box|none", "tabs": "filled|underline" },
 *     "blocks": [ { "block": "<kind>", "place": "<place>", "order": 0…99, …that block's options } ] }
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
export const VERSION = 1;
export const EXT = '.ccworkspace.json';
export const INDEX_FORMAT = 'cadcraft-workspace-addons';
export const LIMITS = Object.freeze({ bytes: 65536, blocks: 16, name: 60, description: 300, author: 80, list: 12, slots: 8, order: 99, files: 8 });
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
export const PLACES = ['top', 'bottom', 'left-panel', 'right-panel', 'stage-top', 'stage-bottom', 'stage-left', 'stage-right', 'view-top', 'view-bottom', 'float', 'none'];

const bool = (v) => v === true;
const list = (v, ok, max) => (Array.isArray(v) ? [...new Set(v.filter((x) => typeof x === 'string' && ok(x)))].slice(0, max) : []);
const isAction = (x) => ACTIONS.includes(x);
const isSlot = (x) => SLOT_RE.test(x);

/**
 * The building blocks. `places`: where it may go (the first is its default); `opts`: its own keys, each read by a function that
 * returns the bounded value (undefined = left out). `needs`: what the app's adapter must offer (resolveLayout).
 */
export const BLOCKS = Object.freeze({
  titlebar: { places: ['top'], needs: [], opts: {   // the app's logo and name, quick commands, the document's name, full screen, Help, Settings; hides the app bar
    quick: (v) => list(v, isAction, LIMITS.list), inventory: bool } },
  ribbon: { places: ['top', 'stage-top'], needs: ['ribbon'], opts: {   // the app's ribbon (tabs → groups → large and small tools), a File menu
    file: (v) => list(v, isAction, LIMITS.list), collapse: bool, collapsed: bool, tearOff: bool } },   // collapsed: starts folded to its tabs (needs collapse)
  options: { places: ['top', 'bottom', 'stage-top', 'stage-bottom'], needs: [], opts: {   // what the running tool asks for, or what to do next
    commands: (v) => list(v, isAction, LIMITS.list) } },
  toolbar: { places: ['none', 'stage-top', 'stage-bottom'], needs: ['toolbar'], opts: {} },   // the app's own toolbar (every toolbar style, Arrange, lock)
  infobox: { places: ['stage-top', 'stage-bottom'], needs: [], opts: {   // labelled groups: the app's slots; "tool" = the running tool's options or the selection
    slots: (v) => list(v, isSlot, LIMITS.slots) } },
  toolbox: { places: ['stage-left', 'stage-right'], needs: ['toolbox'], opts: {   // a column of the app's tools in groups
    collapse: bool, tearOff: bool, mine: bool } },   // mine: a "My tools" group of empty slots a person fills (WS.21)
  petpalette: { places: ['float'], needs: [], opts: {} },   // the app's edit commands by the pointer when something is picked (WS.22)
  palettes: { places: ['left-panel', 'right-panel'], needs: [], opts: {   // two palettes stacked inside an app panel; "panel" = that panel's own content
    upper: (v) => (typeof v === 'string' && isSlot(v) ? v : undefined), lower: (v) => list(v, isSlot, 4) } },
  viewtabs: { places: ['view-top', 'view-bottom'], needs: ['views'], opts: {   // open = a tab per opened view (closable); all = a tab for every view
    mode: (v) => (v === 'open' || v === 'all' ? v : undefined) } },
  viewbar: { places: ['view-bottom', 'view-top'], needs: [], opts: {   // the current view's name and the app's view slots
    slots: (v) => list(v, isSlot, LIMITS.slots) } },
  quickbar: { places: ['stage-bottom', 'stage-top', 'bottom'], needs: [], opts: {   // a strip of the app's slots
    slots: (v) => list(v, isSlot, LIMITS.slots) } },
  statusbar: { places: ['bottom'], needs: [], opts: {} },   // the app's status line, the selection count, the layout's name
});
export const LOOK = Object.freeze({ density: ['regular', 'compact'], outline: ['faint', 'box', 'none'], tabs: ['filled', 'underline'] });
const TOP_KEYS = ['format', 'version', 'id', 'name', 'nameKey', 'description', 'hintKey', 'author', 'license', 'look', 'blocks'];

const clean = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '');
const KEY_RE = /^shell\.ws\.[a-z0-9.-]{1,60}$/;

export function validateLayout(obj) {
  const dropped = [];
  const fail = (error) => ({ ok: false, error, dropped });
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return fail('not-json-object');
  if (obj.format !== FORMAT) return fail('not-a-layout');
  if (typeof obj.version !== 'number' || obj.version < 1) return fail('bad-version');
  if (obj.version > VERSION) return fail('newer-version');
  for (const k of Object.keys(obj)) if (!TOP_KEYS.includes(k)) dropped.push('key ' + k);
  const id = typeof obj.id === 'string' ? obj.id : '';
  if (!ID_RE.test(id) || RESERVED.includes(id)) return fail('bad-id');
  const name = clean(obj.name, LIMITS.name);
  if (!name) return fail('no-name');
  const out = { format: FORMAT, version: VERSION, id, name, look: { density: 'regular', outline: 'box', tabs: 'filled' }, blocks: [] };
  if (typeof obj.nameKey === 'string' && KEY_RE.test(obj.nameKey)) out.nameKey = obj.nameKey; else if (obj.nameKey !== undefined) dropped.push('nameKey');
  if (typeof obj.hintKey === 'string' && KEY_RE.test(obj.hintKey)) out.hintKey = obj.hintKey; else if (obj.hintKey !== undefined) dropped.push('hintKey');
  const description = clean(obj.description, LIMITS.description); if (description) out.description = description;
  const author = clean(obj.author, LIMITS.author); if (author) out.author = author;
  if (typeof obj.license === 'string' && /^[A-Za-z0-9.+-]{1,40}$/.test(obj.license)) out.license = obj.license; else if (obj.license !== undefined) dropped.push('license');
  if (obj.look && typeof obj.look === 'object' && !Array.isArray(obj.look)) {
    for (const [k, v] of Object.entries(obj.look)) {
      if (LOOK[k] && LOOK[k].includes(v)) out.look[k] = v; else dropped.push('look.' + k);
    }
  } else if (obj.look !== undefined) dropped.push('look');
  const seen = new Set();
  for (const b of (Array.isArray(obj.blocks) ? obj.blocks : []).slice(0, LIMITS.blocks * 2)) {
    if (!b || typeof b !== 'object' || Array.isArray(b)) { dropped.push('block (not an object)'); continue; }
    const spec = BLOCKS[b.block];
    if (!spec) { dropped.push('block ' + clean(String(b.block), 24)); continue; }
    if (seen.has(b.block)) { dropped.push('block ' + b.block + ' (twice)'); continue; }
    const place = b.place === undefined ? spec.places[0] : b.place;
    if (!spec.places.includes(place)) { dropped.push('block ' + b.block + ' (cannot go ' + clean(String(place), 24) + ')'); continue; }
    if (seen.size >= LIMITS.blocks) { dropped.push('block ' + b.block + ' (too many)'); continue; }
    seen.add(b.block);
    const order = Number.isInteger(b.order) && b.order >= 0 && b.order <= LIMITS.order ? b.order : 0;
    if (b.order !== undefined && order !== b.order) dropped.push(b.block + '.order');
    const blk = { block: b.block, place, order };
    for (const [k, v] of Object.entries(b)) {
      if (k === 'block' || k === 'place' || k === 'order') continue;
      const read = spec.opts[k];
      const val = read ? read(v) : undefined;
      if (val === undefined || (Array.isArray(val) && Array.isArray(v) && val.length !== v.length)) dropped.push(b.block + '.' + clean(k, 24));
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
 * The blocks THIS app can fill. caps = { ribbon, toolbox, toolbar, views: booleans; slots: [names]; palettes: [names];
 * actions: [ids] }. A block whose need the app lacks is dropped; a slot, palette or action the app lacks is dropped from its block.
 * Every drop is a note (the conformance test prints them; Settings says how many). ok = at least one block placed somewhere.
 */
export function resolveLayout(layout, caps = {}) {
  const notes = [], blocks = [];
  const slots = new Set(caps.slots || []), palettes = new Set([...(caps.palettes || []), 'panel']), actions = new Set(caps.actions || []);
  for (const b of layout.blocks) {
    const spec = BLOCKS[b.block];
    const miss = spec.needs.find((n) => !caps[n]);
    if (miss) { notes.push(b.block + ': this app has no ' + miss); continue; }
    const r = { ...b };
    for (const k of ['quick', 'file', 'commands']) if (r[k]) { const keep = r[k].filter((x) => actions.has(x)); if (keep.length < r[k].length) notes.push(b.block + '.' + k + ': ' + r[k].filter((x) => !actions.has(x)).join(', ')); r[k] = keep; }
    if (r.slots) { const keep = r.slots.filter((x) => x === 'tool' || slots.has(x)); if (keep.length < r.slots.length) notes.push(b.block + '.slots: ' + r.slots.filter((x) => !keep.includes(x)).join(', ')); r.slots = keep; }
    if (b.block === 'palettes') {
      if (r.upper && !palettes.has(r.upper)) { notes.push('palettes.upper: ' + r.upper); delete r.upper; }
      if (r.lower) { const keep = r.lower.filter((x) => palettes.has(x)); if (keep.length < r.lower.length) notes.push('palettes.lower: ' + r.lower.filter((x) => !keep.includes(x)).join(', ')); r.lower = keep; }
      if (!r.upper && !(r.lower || []).length) { notes.push('palettes: nothing left to show'); continue; }
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
