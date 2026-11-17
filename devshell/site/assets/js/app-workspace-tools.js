/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-workspace-tools.js — what a layout says a block HOLDS (0.10 UI.6, layout format v2). DOM-free and import-free, so the engine, the
 * checker and the tests read it the same way. The format (app-workspace-format.js) carries the data:
 *
 *   ribbon.tools     { tabs:   [{ id, name?, groups: [{ id, name?, tools: [id] }] }] }
 *   toolbox.tools    { groups: [{ id, name?, tools: [id] }] }      (also toolrows.tools and toolpalette.tools)
 *   menubar.menus    [{ id, name?, items: [command id] }]
 *
 * and this file turns the APP's own lists (the adapter's ribbon() and toolbox()) into the lists the layout asked for. A tool is the
 * adapter's own id, or `+cmd:<registry id>` for any command of the app's input registry. Nothing is invented: an id the app does not
 * have draws nothing (resolveLayout has already said so in a note), a group or tab of the app that the layout does not name is not
 * shown, and a layout with no `tools` leaves the app's lists exactly as they are.
 *
 *   isCmd(id), cmdOf(id)                       "+cmd:layer.new" → true, "layer.new"
 *   shapeRibbon(data, spec)                    the adapter's ribbon() → the ribbon the layout holds (a contextual tab the layout does not name stays)
 *   shapeToolbox(groups, spec)                 the adapter's toolbox() → the groups the layout holds
 *   shapeMenus(menus, commands)                menubar.menus → [{ id, label, groups: [{ key, label, ids: [command] }] }] (the vector menu bar's own shape)
 *   stacksToPalettes(o)                        palettes.stacks → { upper, lower } for the engine's two-part panel
 *   toolIds(ribbon, toolbox)                   every id an adapter offers (the engine's caps.tools)
 *   withCommands(A, reg)                       the adapter, taught to show, run and grey a `+cmd:` tool through the input registry
 *   editTools(spec, kind, change)              the pure edits the right-click menu makes: remove, add, move, new group, rename, reset
 */
export const isCmd = (id) => typeof id === 'string' && id.startsWith('+cmd:');
export const cmdOf = (id) => id.slice(5);

const SMALL_STACK = 3;   // the ribbon draws small tools in stacks of three

/** One group of the layout against the app's group of the same id (or none): large tools first (those the app drew large), then small ones in stacks. */
function ribbonGroup(lg, base) {
  const bigIds = new Set(base ? base.large : []);
  const large = lg.tools.filter((id) => bigIds.has(id));
  const small = lg.tools.filter((id) => !bigIds.has(id));
  const stacks = [];
  for (let i = 0; i < small.length; i += SMALL_STACK) stacks.push(small.slice(i, i + SMALL_STACK));
  return { id: lg.id, label: lg.name || base?.label || lg.id, large, stacks };
}

export function shapeRibbon(data, spec) {
  if (!spec || !Array.isArray(spec.tabs) || !spec.tabs.length) return data;
  const groupsById = new Map(), tabsById = new Map(data.map((t) => [t.tab, t]));
  for (const t of data) for (const g of t.groups) if (!groupsById.has(g.id)) groupsById.set(g.id, g);
  const out = spec.tabs.map((lt) => {
    const base = tabsById.get(lt.id);
    return { ...(base?.context ? { context: base.context } : {}), ...(lt.show ? { show: lt.show } : {}), tab: lt.id, label: lt.name || base?.label || lt.id,
      groups: lt.groups.map((lg) => ribbonGroup(lg, groupsById.get(lg.id))) };
  });
  const named = new Set(spec.tabs.map((t) => t.id));
  for (const t of data) if (t.context && !named.has(t.tab)) out.push(t);   // a tab that lights up with the selection keeps doing so
  return out;
}

export function shapeToolbox(groups, spec) {
  if (!spec || !Array.isArray(spec.groups) || !spec.groups.length) return groups;
  const byId = new Map(groups.map((g) => [g.id, g]));
  return spec.groups.map((lg) => {
    const base = byId.get(lg.id);
    const more = base?.more ? base.more.filter((id) => !lg.tools.includes(id)) : undefined;
    return { ...(base || {}), id: lg.id, label: lg.name || base?.label || lg.id, tools: lg.tools.slice(), ...(more && more.length ? { more } : { more: undefined }) };
  }).map((g) => { if (g.more === undefined) delete g.more; return g; });
}

/** `commands` = the registry's commands [{ id, group, label, … }]; an id it lacks is left out. */
export function shapeMenus(menus, commands) {
  const byId = new Map((commands || []).map((c) => [c.id, c]));
  return (menus || []).map((m) => ({ id: m.id, label: m.name || '', groups: [{ key: m.id, label: m.name || m.id, ids: m.items.map((i) => byId.get(isCmd(i) ? cmdOf(i) : i)).filter(Boolean) }] }));
}

/** The engine's panel has one upper palette and a tabbed lower one; two stacks fill them (the first stack's first palette on top, everything else as tabs below). */
export function stacksToPalettes(o) {
  const s = o.stacks;
  if (!Array.isArray(s) || !s.length) return { upper: o.upper, lower: o.lower };
  if (s.length === 1) return { upper: undefined, lower: s[0].slice() };
  return { upper: s[0][0], lower: [...s[0].slice(1), ...s[1]] };
}

export function toolIds(ribbon, toolbox) {
  const ids = new Set();
  for (const t of ribbon || []) for (const g of t.groups) for (const id of [...g.large, ...g.stacks.flat()]) ids.add(id);
  for (const g of toolbox || []) for (const id of [...g.tools, ...(g.more || [])]) ids.add(id);
  return [...ids].sort();
}

/** The adapter, taught `+cmd:<id>` tools. Reads pass through to the adapter live (prototype); only tool, can, run and pressed are wrapped. */
export function withCommands(A, reg) {
  const wrap = { };
  if (A.tool) wrap.tool = { value: (id, block) => (isCmd(id) ? reg.tool(cmdOf(id)) : A.tool(id, block)) };
  else wrap.tool = { value: (id) => (isCmd(id) ? reg.tool(cmdOf(id)) : { label: id }) };
  wrap.can = { value: (id, block, st) => (isCmd(id) ? reg.can(cmdOf(id)) : A.can ? A.can(id, block, st) : { enabled: true, reason: '' }) };
  wrap.run = { value: (id, block, b) => (isCmd(id) ? reg.run(cmdOf(id)) : A.run ? A.run(id, block, b) : null) };
  wrap.pressed = { value: (id, block) => (isCmd(id) ? false : A.pressed ? A.pressed(id, block) : false) };
  return Object.create(A, wrap);
}

// ------------------------------------------------------------------ the edits a person makes (right-click a tool, Arrange)
const PART = /[^a-z0-9]+/g;
const slug = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(PART, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'group';

/** A spec of the shape the block takes ({ tabs } for the ribbon, { groups } for the rest) made from what the app shows now, so an edit starts from what a person sees. */
export function specFromData(kind, data) {
  if (kind === 'ribbon') return { tabs: data.filter((t) => !t.context).map((t) => ({ id: t.tab, ...(t.label ? { name: t.label } : {}),
    groups: t.groups.map((g) => ({ id: g.id, ...(g.label ? { name: g.label } : {}), tools: [...g.large, ...g.stacks.flat()] })) })) };
  return { groups: data.map((g) => ({ id: g.id, ...(g.label ? { name: g.label } : {}), tools: g.tools.slice() })) };
}

const groupsOf = (spec) => (spec.tabs ? spec.tabs.flatMap((t) => t.groups) : spec.groups);
const clone = (x) => JSON.parse(JSON.stringify(x));

/**
 * One edit on a copy of `spec`. `at` = { group, tool?, tab? } (ids). change:
 *   { op: 'remove' }            take `at.tool` out of `at.group`
 *   { op: 'add', tool }         put a tool at the end of `at.group` (or after `at.tool`)
 *   { op: 'move', by: -1 | 1 }  move `at.tool` along its group
 *   { op: 'to', group }         move `at.tool` into another group
 *   { op: 'group', name }       a new, empty group (in `at.tab` for a ribbon) with a fresh id
 *   { op: 'rename', name }      rename `at.group`
 *   { op: 'drop-group' }        remove `at.group`
 * → { spec, changed }
 */
export function editTools(spec, at, change) {
  const s = clone(spec), all = groupsOf(s);
  const g = all.find((x) => x.id === at.group);
  const none = { spec, changed: false };
  switch (change.op) {
    case 'remove': { if (!g) return none; const i = g.tools.indexOf(at.tool); if (i < 0) return none; g.tools.splice(i, 1); return { spec: s, changed: true }; }
    case 'add': {
      if (!g || !change.tool || all.some((x) => x.tools.includes(change.tool) && x === g)) return none;
      const i = at.tool ? g.tools.indexOf(at.tool) : -1;
      if (i >= 0) g.tools.splice(i + 1, 0, change.tool); else g.tools.push(change.tool);
      return { spec: s, changed: true };
    }
    case 'move': { if (!g) return none; const i = g.tools.indexOf(at.tool), j = i + (change.by < 0 ? -1 : 1); if (i < 0 || j < 0 || j >= g.tools.length) return none; [g.tools[i], g.tools[j]] = [g.tools[j], g.tools[i]]; return { spec: s, changed: true }; }
    case 'to': { const to = all.find((x) => x.id === change.group); if (!g || !to || to === g) return none; const i = g.tools.indexOf(at.tool); if (i < 0) return none; g.tools.splice(i, 1); to.tools.push(at.tool); return { spec: s, changed: true }; }
    case 'group': {
      const ids = new Set(all.map((x) => x.id)); let id = slug(change.name), n = 2; while (ids.has(id)) id = slug(change.name).slice(0, 20) + '-' + n++;
      const ng = { id, ...(change.name ? { name: String(change.name).slice(0, 32) } : {}), tools: [] };
      const host = s.tabs ? (s.tabs.find((t) => t.id === at.tab) || s.tabs[s.tabs.length - 1]) : null;
      if (host) host.groups.push(ng); else if (s.groups) s.groups.push(ng); else return none;
      return { spec: s, changed: true, id };
    }
    case 'rename': { if (!g) return none; const name = String(change.name || '').trim().slice(0, 32); if (name) g.name = name; else delete g.name; return { spec: s, changed: true }; }
    case 'drop-group': {
      if (!g) return none;
      if (s.tabs) { for (const t of s.tabs) t.groups = t.groups.filter((x) => x !== g); } else s.groups = s.groups.filter((x) => x !== g);
      return { spec: s, changed: true };
    }
    default: return none;
  }
}
