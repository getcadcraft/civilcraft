/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-input.js — the shared input engine: menu styles, keys and mouse over an app's command registry (0.5 track IP:
 * IP.2 moved BimCraft's input-profiles.js here; IP.4 the style family for every app; IP.5 sharing; WL.18's carry).
 * Plan: docs/0.5-PART4.md § Track IP. Map: docs/apps/app-input.md. DOM-free and import-free (Node tests import it as it
 * is); the page side is app-input-ui.js, which app-shell.inc loads only for builds whose manifest says
 * "input": "<registry module>" — released builds never load either file.
 *
 * A registry module (each app's input-<slug>.js) exports:
 *   COMMANDS     [{ id, group, label (text key), icon, sel, defKeys: ['Ctrl+Z', …], fixed?, keyOnly?, optional? }]
 *                `fixed` = keys nobody may take (Delete, Esc); `keyOnly` = no menu place needed; `optional` = only in some
 *                areas; `sel` = the app's own button the command clicks (one code path for every style)
 *   GROUPS       group ids, in the order the Customize list shows them (names: text keys input.grp.<id>)
 *   STYLES       { id: built-in profile }, STYLE_ORDER [ids]; the first is the app's own (nothing changes in it)
 *   FAMILY       { styleId: 'own' | 'menus' | 'ribbon' | 'classic' } (IP.4: "use this style in every app")
 *   optional: STORE (localStorage key, default '<slug>.input'), CARRY (WL.18, below), MACROS (true: keys may type text
 *   at the app's command line), hooks(ctx) (page side; see app-input-ui.js)
 *
 * A profile is data only:
 *   { format: 'cadcraft-input', version: 1, id, name, base?,
 *     layout: 'toolbar' | 'menubar' | 'ribbon',  commandLine: bool,
 *     menus:  [{ label, items: [id | '-'] }]                       menubar (a ribbon's File menu too)
 *     bar:    [id | '-']                                            menubar: the quick row under the menus
 *     tabs:   [{ label, panels: [{ label, items: [id] }] }]       ribbon
 *     quick:  [id]                                                  ribbon: the quick-access row
 *     labels: { id: text key }                                      built-ins only (the app translates them)
 *     keys:   { id: ['W', 'Ctrl+Shift+V', 'W A'] }                  a space = a sequence ("WA": W then A)
 *     typed:  { id: ['WALL', 'WA'] }                                command-line words
 *     macros: { 'Ctrl+Alt+L': 'LINE' }                              registries with MACROS: a key types text (WL.18)
 *     mouse:  { wheel: 1 | -1, zoomSpeed, pan2d: [button…], orbit3d: { left, middle, right } | null } }
 * A person's own profile is the same shape with `base` = the built-in it started from; `resolve()` fills what it leaves out.
 * Exported files (.ccinput.json) and add-ons of kind "input" are untrusted: `validateProfile()` keeps only known commands,
 * sane keys, sizes and words.
 */

export const FORMAT = 'cadcraft-input';
export const VERSION = 1;
export const EXT = '.ccinput.json';
export const LAYOUTS = ['toolbar', 'menubar', 'ribbon'];
export const BUTTONS = ['left', 'middle', 'right'];
export const ACTIONS_3D = ['orbit', 'pan', 'zoom', 'none'];
export const MOUSE_DEFAULT = Object.freeze({ wheel: 1, zoomSpeed: 1, pan2d: ['middle', 'right'], orbit3d: { left: 'orbit', middle: 'zoom', right: 'pan' } });
export const LIMITS = Object.freeze({ name: 40, label: 40, menus: 16, items: 80, tabs: 12, panels: 12, keysPerCommand: 3, words: 4, word: 16, macros: 300, macro: 200, custom: 20, bytes: 200000 });
/** IP.4: the style families every app can answer ("use this style in every app"). 'own' = each app's own toolbar. */
export const FAMILIES = ['own', 'menus', 'ribbon', 'classic'];
/** IP.4: where the family for every app is kept (one origin: every app in the browser, the hub and every app in Studio). */
export const FAMILY_KEY = 'cc-input-family';

const MODS = ['Ctrl', 'Alt', 'Shift'];
const NAMED = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Delete', 'Backspace', 'Escape', 'Enter',
  'Tab', 'Space', 'Insert', 'Home', 'End', 'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const ALIAS = { esc: 'Escape', del: 'Delete', ins: 'Insert', return: 'Enter', pgup: 'PageUp', pgdn: 'PageDown', up: 'ArrowUp',
  down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', ' ': 'Space', spacebar: 'Space', cmd: 'Ctrl', control: 'Ctrl',
  meta: 'Ctrl', mod: 'Ctrl', option: 'Alt' };
const PUNCT = ['-', '=', '[', ']', ';', "'", ',', '.', '/', '\\', '`'];
const own = (o, k) => o && typeof o === 'object' && Object.prototype.hasOwnProperty.call(o, k);
const clean = (v, n) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n) : '');

/** One key with its modifiers, written the one way ("Ctrl+Shift+V", "F9", "W"), or null when it is not a key. */
export function normCombo(s) {
  if (typeof s !== 'string') return null;
  const raw = s.trim();
  if (!raw || raw.length > 40) return null;
  const parts = raw === '+' ? ['+'] : raw.split('+').map((p) => p.trim());
  if (parts.some((p) => !p)) return null;
  const mods = new Set();
  let key = null;
  for (const p of parts) {
    const low = p.toLowerCase(), a = own(ALIAS, low) ? ALIAS[low] : undefined;
    const mod = MODS.find((m) => m.toLowerCase() === (a || low).toLowerCase());
    if (mod) { mods.add(mod); continue; }
    if (key) return null;   // two keys in one combination
    if (a) key = a;
    else if (/^[a-z0-9]$/i.test(p)) key = p.toUpperCase();
    else if (PUNCT.includes(p)) key = p;
    else key = NAMED.find((n) => n.toLowerCase() === low) || null;
    if (!key) return null;
  }
  if (!key) return null;
  return [...MODS.filter((m) => mods.has(m)), key].join('+');
}

/** A sequence ("W A", "WA", "Ctrl+K Ctrl+S") written the one way ("W A"), or null. Two to four letters written
 *  together are a sequence of letters; anything else is split on spaces. */
export function normSeq(s) {
  if (typeof s !== 'string') return null;
  const t = s.trim();
  if (!t) return null;
  const parts = /^[a-z]{2,4}$/i.test(t) ? t.toUpperCase().split('') : t.split(/\s+/);
  if (parts.length > 4) return null;
  const out = [];
  for (const p of parts) { const c = normCombo(p); if (!c) return null; out.push(c); }
  return out.join(' ');
}

/** How a sequence is shown: letters run together ("WA"), anything else spaced. */
export function showSeq(seq) {
  const p = String(seq || '').split(' ');
  return p.every((x) => /^[A-Z0-9]$/.test(x)) ? p.join('') : p.join(' ');
}

/** The combination a keydown is ("Ctrl+Z", "W", "F9"), or null for a lone modifier. Cmd on a Mac counts as Ctrl. */
export function eventCombo(e) {
  if (!e || typeof e.key !== 'string') return null;
  if (['Control', 'Shift', 'Alt', 'Meta', 'AltGraph', 'CapsLock', 'Dead', 'Unidentified'].includes(e.key)) return null;
  let key = null;
  const code = e.code || '';
  if (/^Key[A-Z]$/.test(code)) key = code.slice(3);
  else if (/^Digit[0-9]$/.test(code)) key = code.slice(5);
  else if (/^Numpad[0-9]$/.test(code)) key = code.slice(6);
  else if (e.key === ' ') key = 'Space';
  else if (e.key.length === 1) key = /^[a-z0-9]$/i.test(e.key) ? e.key.toUpperCase() : (PUNCT.includes(e.key) ? e.key : null);
  else key = NAMED.includes(e.key) ? e.key : (e.key === 'Esc' ? 'Escape' : e.key === 'Del' ? 'Delete' : null);
  if (!key) return null;
  const m = [];
  if (e.ctrlKey || e.metaKey) m.push('Ctrl');
  if (e.altKey) m.push('Alt');
  if (e.shiftKey && !(e.key.length === 1 && !/^[a-z0-9 ]$/i.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey)) m.push('Shift');
  return [...m, key].join('+');
}

/** Is this combination a plain typing key (a letter or digit with no Ctrl/Alt)? */
export function isTyping(combo) { return /^(Shift\+)?[A-Z0-9]$/.test(combo || ''); }

// ---- profiles ----

function copy(o) { return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); }

/** A profile with everything a person's own profile leaves out taken from its base built-in. */
export function resolve(p, builtins) {
  if (!p) return null;
  const base = p.base && own(builtins, p.base) ? builtins[p.base] : null;
  if (!base) return { ...p, mouse: cleanMouse(p.mouse) };
  const out = { ...copy(base), ...copy(p), id: p.id, name: p.name, base: p.base, builtin: false };
  out.labels = { ...(base.labels || {}) };   // labels are the built-in's: people don't rename commands
  out.mouse = cleanMouse({ ...(base.mouse || {}), ...(p.mouse || {}) });
  return out;
}

/** The mouse settings, every field present and in range. */
export function cleanMouse(m) {
  const o = m && typeof m === 'object' ? m : {};
  const pan2d = Array.isArray(o.pan2d) ? [...new Set(o.pan2d.filter((b) => BUTTONS.includes(b)))] : MOUSE_DEFAULT.pan2d.slice();
  // orbit3d null = every 3D view keeps its own buttons (the app's own style)
  let orbit3d = null;
  if (o.orbit3d && typeof o.orbit3d === 'object') {
    orbit3d = {};
    for (const b of BUTTONS) orbit3d[b] = ACTIONS_3D.includes(o.orbit3d[b]) ? o.orbit3d[b] : MOUSE_DEFAULT.orbit3d[b];
  }
  const zs = Number(o.zoomSpeed);
  return { wheel: o.wheel === -1 ? -1 : 1, zoomSpeed: Number.isFinite(zs) ? Math.min(4, Math.max(0.25, zs)) : 1, pan2d, orbit3d };
}

/** The mouse, read by an app's views: wheel exponent factor, does a button pan 2D views, what a button does in 3D. */
export const wheelFactorOf = (m) => cleanMouse(m).wheel * cleanMouse(m).zoomSpeed;
export const panButtonOf = (m, b) => cleanMouse(m).pan2d.includes(BUTTONS[b]);
export const action3dOf = (m, b) => { const o = cleanMouse(m).orbit3d; return o ? (o[BUTTONS[b]] || 'none') : null; };

/** Every key binding of a profile: Map sequence → command id (the first command wins a clash; see conflicts()). */
export function bindings(p) {
  const m = new Map();
  for (const [id, list] of Object.entries((p && p.keys) || {})) for (const s of list || []) { const q = normSeq(s); if (q && !m.has(q)) m.set(q, id); }
  return m;
}
/** A profile's text keys (WL.18): Map sequence → the text it types at the command line. */
export function macroMap(p) {
  const m = new Map();
  for (const [k, text] of Object.entries((p && p.macros) || {})) { const q = normSeq(k); if (q && typeof text === 'string' && text && !m.has(q)) m.set(q, text); }
  return m;
}

/** Keys that can't all work: the same sequence on two commands (or a command and a text key), a key that is also how a
 *  longer sequence starts (pressing it would run its command before the second key could come), a fixed key taken. */
export function conflicts(p, registry = []) {
  const fixed = new Map();
  for (const c of registry) if (c.fixed) for (const k of c.defKeys || []) fixed.set(normSeq(k), c.id);
  const by = new Map(), out = [];
  const put = (q, id) => { if (!q) return; if (!by.has(q)) by.set(q, new Set()); by.get(q).add(id); };
  for (const [id, list] of Object.entries((p && p.keys) || {})) for (const s of list || []) put(normSeq(s), id);
  for (const [k, text] of Object.entries((p && p.macros) || {})) put(normSeq(k), 'text:' + text);
  for (const [seq, ids] of by) {
    if (ids.size > 1) out.push({ kind: 'same', seq, ids: [...ids] });
    if (fixed.has(seq) && !ids.has(fixed.get(seq))) out.push({ kind: 'fixed', seq, ids: [...ids, fixed.get(seq)] });
  }
  const seqs = [...by.keys()];
  for (const a of seqs) for (const b of seqs) if (a !== b && b.startsWith(a + ' ')) out.push({ kind: 'prefix', seq: a, longer: b, ids: [...by.get(a), ...by.get(b)] });
  return out;
}

/** Where a command sits in a profile ("Build", "Architecture\0Build", '@bar', '@quick'), or '' when only keys reach it. */
export function placeOf(p, id) {
  if (!p) return '';
  if (p.layout === 'menubar' || p.layout === 'ribbon') {
    for (const m of p.menus || []) if ((m.items || []).includes(id)) return m.label;
  }
  if (p.layout === 'menubar' && (p.bar || []).includes(id)) return '@bar';
  if (p.layout === 'ribbon' && (p.quick || []).includes(id)) return '@quick';
  if (p.layout === 'ribbon') for (const tab of p.tabs || []) for (const pn of tab.panels || []) if ((pn.items || []).includes(id)) return tab.label + '\u0000' + pn.label;
  return '';
}

/** Commands of the registry a profile gives no place (menu, ribbon or bar) — the toolbar layout places everything. */
export function unplaced(p, registry) {
  if (!p || p.layout === 'toolbar') return [];
  return registry.filter((c) => !c.keyOnly && !c.optional && !placeOf(p, c.id)).map((c) => c.id);
}

/** Move a command to a menu (menubar: menu index) or a ribbon panel ("tab/panel" indexes, or "m<i>" for a ribbon's
 *  File menu); null = no place (keys only). Returns a new profile. */
export function moveCommand(p, id, where) {
  const q = copy(p);
  for (const m of q.menus || []) m.items = (m.items || []).filter((x) => x !== id);
  if (q.bar) q.bar = q.bar.filter((x) => x !== id);
  for (const tab of q.tabs || []) for (const pn of tab.panels || []) pn.items = (pn.items || []).filter((x) => x !== id);
  if (where === null || where === undefined || where === '') return tidy(q);
  if (q.layout === 'menubar' || (q.layout === 'ribbon' && String(where).startsWith('m'))) {
    const i = Number(String(where).replace(/^m/, ''));
    if (q.menus && q.menus[i]) q.menus[i].items.push(id);
  } else if (q.layout === 'ribbon') {
    const [ti, pi] = String(where).split('/').map(Number);
    if (q.tabs && q.tabs[ti] && q.tabs[ti].panels[pi]) q.tabs[ti].panels[pi].items.push(id);
  }
  return tidy(q);
}
/** No separator first, last or twice in a row. */
function tidy(q) {
  for (const m of q.menus || []) m.items = m.items.filter((x, i, a) => x !== '-' || (i > 0 && i < a.length - 1 && a[i - 1] !== '-'));
  return q;
}

/** Set a command's keys (each normalised; bad ones dropped). Returns a new profile. */
export function setKeys(p, id, list) {
  const q = copy(p);
  q.keys = q.keys || {};
  const seqs = [...new Set((list || []).map(normSeq).filter(Boolean))].slice(0, LIMITS.keysPerCommand);
  if (seqs.length) q.keys[id] = seqs; else delete q.keys[id];
  return q;
}

/** Set (text non-empty) or remove (text '') a text key (WL.18). Returns a new profile, or null when the key is no key. */
export function setMacro(p, key, text) {
  const k = normSeq(key);
  if (!k) return null;
  const q = copy(p);
  q.macros = { ...(q.macros || {}) };
  for (const x of Object.keys(q.macros)) if (normSeq(x) === k) delete q.macros[x];
  const t = clean(text, LIMITS.macro);
  if (t) q.macros[k] = t;
  if (!Object.keys(q.macros).length) delete q.macros;
  return q;
}

/** The registry's options for checking files: { macros } (the registry module's MACROS export). */
const regOpts = (opts) => (opts && typeof opts === 'object' ? opts : {});

/**
 * A profile from a file, an add-on or another tab, checked as untrusted: unknown commands and fields are dropped (and
 * listed), keys normalised, words upper case letters/digits, names cut to length; built-in labels never come from a file.
 * opts.macros: keep text keys (else they are dropped and listed). → { ok, profile, problems: [text] }
 */
export function validateProfile(obj, registry, builtins, opts) {
  const o = regOpts(opts);
  const problems = [];
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { ok: false, problems: ['not-a-profile'] };
  if (obj.format !== FORMAT) return { ok: false, problems: ['format'] };
  if (obj.version !== VERSION) return { ok: false, problems: ['version'] };
  const known = new Set(registry.map((c) => c.id));
  const fixedIds = new Set(registry.filter((c) => c.fixed).map((c) => c.id));
  const str = (v, n) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, n) : '');
  const base = typeof obj.base === 'string' && own(builtins, obj.base) ? obj.base : null;
  if (obj.base && !base) problems.push('base');
  const layout = LAYOUTS.includes(obj.layout) ? obj.layout : (base ? builtins[base].layout : 'toolbar');
  const out = { format: FORMAT, version: VERSION, id: '', name: str(obj.name, LIMITS.name), base: base || undefined, layout, commandLine: obj.commandLine === true };
  const ids = (list, max) => {
    if (!Array.isArray(list)) return [];
    const r = [];
    for (const x of list.slice(0, max)) {
      if (x === '-') { r.push(x); continue; }
      if (typeof x === 'string' && known.has(x)) { if (!r.includes(x)) r.push(x); } else problems.push('unknown:' + str(String(x), 40));
    }
    return r;
  };
  // menu, tab and panel labels: a built-in's text key when it is one, else the person's own text (shown as text)
  const label = (v) => str(v, LIMITS.label) || '?';
  if (Array.isArray(obj.menus)) out.menus = obj.menus.slice(0, LIMITS.menus).map((m) => ({ label: label(m && m.label), items: ids(m && m.items, LIMITS.items) }));
  if (Array.isArray(obj.bar)) out.bar = ids(obj.bar, LIMITS.items);
  if (Array.isArray(obj.quick)) out.quick = ids(obj.quick, 12).filter((x) => x !== '-');
  if (Array.isArray(obj.tabs)) {
    out.tabs = obj.tabs.slice(0, LIMITS.tabs).map((tb) => ({
      label: label(tb && tb.label),
      panels: (Array.isArray(tb && tb.panels) ? tb.panels : []).slice(0, LIMITS.panels).map((pn) => ({ label: label(pn && pn.label), items: ids(pn && pn.items, LIMITS.items).filter((x) => x !== '-') })),
    }));
  }
  if (obj.keys && typeof obj.keys === 'object') {
    out.keys = {};
    for (const [id, list] of Object.entries(obj.keys)) {
      if (!known.has(id)) { problems.push('unknown:' + str(id, 40)); continue; }
      if (fixedIds.has(id)) continue;   // Delete and Esc stay what they are
      const seqs = (Array.isArray(list) ? list : []).slice(0, LIMITS.keysPerCommand).map(normSeq);
      if (seqs.some((s) => !s)) problems.push('key:' + id);
      const good = seqs.filter(Boolean);
      if (good.length) out.keys[id] = [...new Set(good)];
    }
  }
  if (obj.typed && typeof obj.typed === 'object') {
    out.typed = {};
    for (const [id, list] of Object.entries(obj.typed)) {
      if (!known.has(id)) { problems.push('unknown:' + str(id, 40)); continue; }
      const words = (Array.isArray(list) ? list : []).slice(0, LIMITS.words).map((w) => str(w, LIMITS.word).toUpperCase()).filter((w) => /^[A-Z0-9][A-Z0-9_-]*$/.test(w));
      if (words.length) out.typed[id] = [...new Set(words)];
    }
  }
  if (obj.macros && typeof obj.macros === 'object' && !Array.isArray(obj.macros)) {
    if (!o.macros) problems.push('macros');
    else {
      out.macros = {};
      for (const [k, text] of Object.entries(obj.macros).slice(0, LIMITS.macros)) {
        const q = normSeq(k), tx = clean(text, LIMITS.macro);
        if (!q || !tx) { problems.push('key:' + str(k, 40)); continue; }
        if (!own(out.macros, q)) out.macros[q] = tx;
      }
    }
  }
  if (obj.mouse !== undefined) out.mouse = cleanMouse(obj.mouse);
  for (const c of conflicts(out, registry)) problems.push('conflict:' + c.seq);
  return { ok: true, profile: out, problems: [...new Set(problems)] };
}

/** The text of an export file (.ccinput.json). */
export function exportProfile(p) {
  const keep = ['name', 'base', 'layout', 'commandLine', 'menus', 'bar', 'quick', 'tabs', 'keys', 'typed', 'macros', 'mouse'];
  const o = { format: FORMAT, version: VERSION };
  for (const k of keep) if (p[k] !== undefined) o[k] = copy(p[k]);
  return JSON.stringify(o, null, 2) + '\n';
}

/** A file's text → validateProfile, with the size limit and JSON errors as problems. */
export function importProfile(text, registry, builtins, opts) {
  if (typeof text !== 'string' || text.length > LIMITS.bytes) return { ok: false, problems: ['size'] };
  let obj;
  try { obj = JSON.parse(text); } catch (e) { return { ok: false, problems: ['json'] }; }
  return validateProfile(obj, registry, builtins, opts);
}

/** A safe file name for an export: "<name>.ccinput.json". */
export function exportName(name) {
  const n = String(name || '').replace(/[^\w .()-]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 60) || 'style';
  return n + EXT;
}

// ---- keys at run time ----

/**
 * Turns key presses into commands for one profile. `defaults` = the registry's own keys (what the app does without a
 * profile). press(combo) →
 *   { run: id }        a key of this profile that the app would not do by itself: run the command, swallow the key
 *   { text: '…' }      a text key (WL.18): type it at the app's command line, swallow the key
 *   { native: id }     this profile keeps the app's own key for the command: let the app handle it (context and all)
 *   { wait: 'W' }      the start of a longer sequence: swallow and wait for the next key
 *   { blocked: id }    the app's own key for a command this profile moved elsewhere: swallow, say where it went
 *   null               nothing to do with this profile: let it through
 */
export class KeyMatcher {
  constructor(profile, registry) {
    this.map = bindings(profile);
    this.text = macroMap(profile);
    this.def = new Map();
    for (const c of registry) for (const k of c.defKeys || []) { const q = normSeq(k); if (q && !this.def.has(q)) this.def.set(q, c.id); }
    this.mine = new Map();   // command → its keys in this profile
    for (const [seq, id] of this.map) { if (!this.mine.has(id)) this.mine.set(id, []); this.mine.get(id).push(seq); }
    this.buf = [];
  }
  reset() { this.buf = []; }
  /** Keys this profile gives a command (sequences). */
  keysOf(id) { return this.mine.get(id) || []; }
  press(combo) {
    if (!combo) return null;
    const all = [...this.map.keys(), ...this.text.keys()];
    const tryBuf = (buf) => {
      const seq = buf.join(' ');
      const id = this.map.get(seq), tx = this.text.get(seq);
      const longer = all.some((k) => k.startsWith(seq + ' '));
      if (tx && !longer) return { text: tx };
      if (id && !longer) return this.def.get(seq) === id ? { native: id } : { run: id };
      if (longer) return { wait: seq };
      return null;
    };
    let r = tryBuf([...this.buf, combo]);
    if (!r && this.buf.length) { this.buf = []; r = tryBuf([combo]); }
    if (r && r.wait) { this.buf.push(combo); return r; }
    this.buf = [];
    if (r) return r;
    const d = this.def.get(combo);
    if (d && !this.map.has(combo)) return { blocked: d };
    return null;
  }
}

/** A typed command-line word → command id, or null. Exact words first, then a unique start ("WIN" → WINDOW). */
export function matchTyped(p, word) {
  const w = String(word || '').trim().toUpperCase();
  if (!w) return null;
  const entries = Object.entries((p && p.typed) || {});
  for (const [id, words] of entries) if (words.includes(w)) return id;
  const hits = entries.filter(([, words]) => words.some((x) => x.startsWith(w)));
  return hits.length === 1 ? hits[0][0] : null;
}

// ---- what a person keeps per app (localStorage '<slug>.input', or the registry's STORE) ----

/**
 * The stored state, read back as untrusted (another tab or an older build may have written it):
 *   { style, custom: [profiles, ids my-<n>], tab, family: the family this app last followed, familyAt, mine: { family:
 *     style id } (the person's own pick per family, IP.4), carried: [old stores already carried in, WL.18] }
 * reg = the registry module (COMMANDS, STYLES, STYLE_ORDER, MACROS).
 */
export function readState(text, reg) {
  const st = { style: reg.STYLE_ORDER[0], custom: [], tab: 0, family: '', familyAt: 0, mine: {}, carried: [] };
  let v = null;
  try { v = typeof text === 'string' ? JSON.parse(text) : text; } catch (e) { v = null; }
  if (!v || typeof v !== 'object' || Array.isArray(v)) return st;
  const opts = { macros: !!reg.MACROS };
  if (Array.isArray(v.custom)) {
    for (const c of v.custom.slice(0, LIMITS.custom)) {
      const r = validateProfile(c, reg.COMMANDS, reg.STYLES, opts);
      if (r.ok && c && typeof c.id === 'string' && /^my-\d{1,6}$/.test(c.id) && !st.custom.some((x) => x.id === c.id)) st.custom.push({ ...r.profile, id: c.id });
    }
  }
  const valid = (id) => typeof id === 'string' && (own(reg.STYLES, id) || st.custom.some((c) => c.id === id));
  if (valid(v.style)) st.style = v.style;
  if (Number.isInteger(v.tab) && v.tab >= 0 && v.tab < 20) st.tab = v.tab;
  if (FAMILIES.includes(v.family)) st.family = v.family;
  if (Number.isFinite(v.familyAt) && v.familyAt > 0) st.familyAt = v.familyAt;
  if (v.mine && typeof v.mine === 'object') for (const f of FAMILIES) if (own(v.mine, f) && valid(v.mine[f])) st.mine[f] = v.mine[f];
  if (Array.isArray(v.carried)) st.carried = v.carried.filter((x) => typeof x === 'string' && /^[\w.:-]{1,60}$/.test(x)).slice(0, 10);
  if (v.collapsed === true) st.collapsed = true;   // 0.6 DF.27: a ribbon style shows its tab names only
  return st;
}
export function writeState(st) {
  return JSON.stringify({ style: st.style, custom: st.custom, tab: st.tab, family: st.family || undefined, familyAt: st.familyAt || undefined,
    mine: Object.keys(st.mine || {}).length ? st.mine : undefined, carried: (st.carried || []).length ? st.carried : undefined,
    collapsed: st.collapsed ? true : undefined });
}
/** Add a person's own profile (id my-<n>; at most LIMITS.custom, the oldest goes). Returns { state, profile }. */
export function addCustom(st, p) {
  let n = 1;
  while (st.custom.some((c) => c.id === 'my-' + n)) n++;
  const q = { ...p, id: 'my-' + n, builtin: false };
  const custom = [...st.custom, q];
  while (custom.length > LIMITS.custom) custom.shift();
  return { state: { ...st, custom }, profile: q };
}
/** A style by id: a built-in or one of the person's own. */
export function rawStyle(st, reg, id) { return (own(reg.STYLES, id) ? reg.STYLES[id] : st.custom.find((c) => c.id === id)) || null; }

// ---- IP.4: one family for every app ----

/** The family a style belongs to: a built-in's from the registry's FAMILY, a person's own from its base. '' = none. */
export function familyOf(reg, st, id) {
  const p = rawStyle(st, reg, id);
  if (!p) return '';
  const b = own(reg.STYLES, id) ? id : p.base;
  const f = b && reg.FAMILY && own(reg.FAMILY, b) ? reg.FAMILY[b] : '';
  return FAMILIES.includes(f) ? f : '';
}
/** This app's member of a family: the person's own pick for it here, else the built-in the registry puts in it, else the
 *  app's own style (an app with no member of that family stays as it is). */
export function styleForFamily(reg, st, family) {
  if (own(st.mine, family) && rawStyle(st, reg, st.mine[family]) && familyOf(reg, st, st.mine[family]) === family) return st.mine[family];
  const hit = reg.STYLE_ORDER.find((id) => reg.FAMILY && reg.FAMILY[id] === family);
  return hit || reg.STYLE_ORDER[0];
}
/** The family for every app as stored (FAMILY_KEY): { family, at } or null. */
export function readFamily(text) {
  let v = null;
  try { v = typeof text === 'string' ? JSON.parse(text) : text; } catch (e) { v = null; }
  if (!v || typeof v !== 'object' || !FAMILIES.includes(v.family) || !Number.isFinite(v.at) || v.at <= 0) return null;
  return { family: v.family, at: v.at };
}
export const writeFamily = (family, at) => JSON.stringify({ family, at });
/**
 * Follow the family for every app when it was chosen after this app's own last choice (a later pick in this app wins
 * until a new choice for every app). Returns the new state (unchanged when nothing applies).
 */
export function applyFamily(st, reg, shared) {
  if (!shared || shared.at <= (st.familyAt || 0)) return st;
  return { ...st, style: styleForFamily(reg, st, shared.family), tab: 0, family: shared.family, familyAt: shared.at };
}
/**
 * 0.6 DF.8 "Reset the layout": the style this app starts with — the built-in member of the family chosen for every app
 * (IP.4), else the app's own style. The person's own styles stay in the list (only the choice moves); it counts as this
 * app's own choice from `now` on. Returns the new state.
 */
export function resetStyle(st, reg, shared, now) {
  const fam = shared && FAMILIES.includes(shared.family) ? shared.family : '';
  const id = (fam && reg.STYLE_ORDER.find((x) => reg.FAMILY && reg.FAMILY[x] === fam)) || reg.STYLE_ORDER[0];
  return { ...st, style: id, tab: 0, familyAt: Math.max(st.familyAt || 0, now || 0) };
}
/** A person picks a style in this app: remembered as their member of its family; this app's own choice from now on. */
export function pickStyle(st, reg, id, now) {
  if (!rawStyle(st, reg, id)) return st;
  const f = familyOf(reg, st, id);
  return { ...st, style: id, tab: 0, mine: f ? { ...st.mine, [f]: id } : st.mine, familyAt: Math.max(st.familyAt || 0, now || 0) };
}

// ---- WL.18: an app's older key store carried into its own profile once ----

/**
 * CadCraft's WL.18 keys (localStorage cadcraft.shortcuts: { format: 'cadcraft-shortcuts', version: 1, keys: { key: text } })
 * → text keys for a profile, untrusted: bad keys and empty texts dropped. → { macros, dropped } (macros {} = nothing).
 */
export function carryShortcuts(data) {
  const macros = {};
  let dropped = 0;
  const src = data && typeof data === 'object' && data.format === 'cadcraft-shortcuts' && data.keys && typeof data.keys === 'object' && !Array.isArray(data.keys) ? data.keys : {};
  for (const [k, text] of Object.entries(src).slice(0, LIMITS.macros)) {
    // shortcuts.js writes arrows as Left/Right/Up/Down and allows "Ctrl-L": this engine's one form
    const q = normSeq(String(k).replace(/(^|\+)(Left|Right|Up|Down)$/, '$1Arrow$2').replace(/-(?=.)/g, '+'));
    const tx = clean(text, LIMITS.macro);
    if (!q || !tx || q.includes(' ')) { dropped++; continue; }
    macros[q] = tx;
  }
  return { macros, dropped };
}
/**
 * Carry once (reg.CARRY = { from: 'cadcraft.shortcuts', kind: 'shortcuts', name: text }): when the old store has keys and
 * has not been carried before, a person's own profile over the app's own style (STYLE_ORDER[0]) holds them, and is picked
 * when the app's own style was in use. The old store is left as it was (an older build still reads it).
 * → { state, carried: profile | null }
 */
export function carryInto(st, reg, oldText, name) {
  const c = reg.CARRY;
  if (!c || typeof c.from !== 'string' || st.carried.includes(c.from)) return { state: st, carried: null };
  let data = null;
  try { data = typeof oldText === 'string' ? JSON.parse(oldText) : null; } catch (e) { data = null; }
  const { macros } = carryShortcuts(data);
  const done = { ...st, carried: [...st.carried, c.from] };
  if (!Object.keys(macros).length) return { state: done, carried: null };
  const base = reg.STYLE_ORDER[0];
  // i18n-ignore (the fallback name: the page always passes its own words)
  const p = { format: FORMAT, version: VERSION, name: clean(name, LIMITS.name) || 'My keys', base, layout: reg.STYLES[base].layout, macros };
  const r = addCustom(done, p);
  const state = r.state.style === base ? { ...r.state, style: r.profile.id } : r.state;
  return { state, carried: r.profile };
}
