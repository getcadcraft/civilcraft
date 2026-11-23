/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-state.js — one state language (0.10 UI.25). The shell keeps ONE state; the apps publish into it through the host adapter and nothing else writes it;
 * menus, buttons, ribbon tabs and panels read it through declarations that are DATA (a layout file, the command registry), never per-app DOM code.
 *
 *   ccState.get()                     { selection: { ids, count, kind, kinds }, mode, view, layer, tool, dirty, document, problems: { count }, … }
 *   ccState.publish(patch, source)    merge a patch (nested objects merge); only the host adapter / the engine call it. Listeners run once per change, in a microtask.
 *   ccState.subscribe(fn)             fn(state, changedPaths) → unsubscribe()
 *   ccState.test(expr [, state])      evaluate a declaration → boolean. null / '' = true. A declaration that does not parse is false and logged once.
 *   ccState.registerHost(host)        host = { select(ids), reveal(ids), highlight(ids) }: the reverse channel (UI.25 (3)); the app that mounted last is the host.
 *   ccState.select(ids, how)          a Browser row, a Problems line, a schedule row or a search hit asks the host to select (and zoom to) those objects with the
 *                                     same undoable selection the pointer makes → true when a host took it.
 *   ccState.adapt(adapter)            (0.11) the app's one line: its workspace adapter publishes kinds, mode, view and layer from state(); Problems counts follow the store.
 *   ccState.ref(x) / refs(list)       { kind, id } from a ref object or a 'kind:id' string: what a host reads in select / reveal / highlight.
 * Conventions (0.11): mode = 'model' | 'paper' | '3d' | an app's own word (a sketch, a workspace); view = the views.current() id; layer = the current layer's name.
 *
 * The declaration language is small on purpose and never evaluated as code: path (dotted), a number, a word or a quoted string, == != > >= < <=, ! && || and ( ).
 *   selection.count > 0      selection.kind == wall      problems.count > 0 && mode == model      !dirty
 * A word that is not a known path is a string (so `kind == wall` reads as "wall"). `kinds` = the list of kinds in the selection: `selection.kinds has wall`.
 */
const state = { selection: { ids: [], count: 0, kind: '', kinds: [] }, mode: '', view: '', layer: '', tool: '', dirty: false, document: false, problems: { count: 0 } };
const subs = new Set();
let queued = null, host = null;
const warned = new Set();

const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
function merge(into, patch, path, changed) {
  for (const k of Object.keys(patch)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    const v = patch[k], p = path ? path + '.' + k : k;
    if (isObj(v) && isObj(into[k])) merge(into[k], v, p, changed);
    else if (JSON.stringify(into[k]) !== JSON.stringify(v)) { into[k] = Array.isArray(v) ? v.slice() : isObj(v) ? { ...v } : v; changed.add(p); }
  }
}
function publish(patch, source = '') {
  if (!isObj(patch)) return;
  const changed = new Set();
  merge(state, patch, '', changed);
  if (patch.selection && !('count' in patch.selection) && Array.isArray(patch.selection.ids)) { state.selection.count = patch.selection.ids.length; changed.add('selection.count'); }
  if (!changed.size) return;
  queued = queued || new Set(); for (const c of changed) queued.add(c);
  queueMicrotask(() => { const c = queued; queued = null; if (!c) return; for (const f of [...subs]) { try { f(state, [...c]); } catch (e) { console.error(e); } } });
}
const get = () => state;
function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }

// ---- the declaration language
const OPS = ['==', '!=', '>=', '<=', '>', '<', '&&', '||', '!', '(', ')'];
function tokens(src) {
  const out = []; let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    const op = OPS.find((o) => src.startsWith(o, i));
    if (op) { out.push({ t: 'op', v: op }); i += op.length; continue; }
    if (c === '"' || c === "'") { const j = src.indexOf(c, i + 1); if (j < 0) return null; out.push({ t: 'str', v: src.slice(i + 1, j) }); i = j + 1; continue; }
    const m = /^[A-Za-z0-9_.:+-]+/.exec(src.slice(i)); if (!m) return null;
    out.push({ t: 'word', v: m[0] }); i += m[0].length;
  }
  return out;
}
function lookup(path, st) {
  let v = st; for (const k of path.split('.')) { if (!isObj(v) && !Array.isArray(v)) return undefined; if (!Object.prototype.hasOwnProperty.call(v, k)) return undefined; v = v[k]; }
  return v;
}
function parse(src) {
  const tk = tokens(src); if (!tk || !tk.length) return null;
  let i = 0;
  const peek = () => tk[i], eat = (v) => (tk[i] && tk[i].t === 'op' && tk[i].v === v ? (i++, true) : false);
  const value = () => {
    const t = tk[i++]; if (!t) throw new Error('end');
    if (t.t === 'str') return () => t.v;
    if (t.t === 'word') { if (/^-?\d+(\.\d+)?$/.test(t.v)) { const n = Number(t.v); return () => n; } if (t.v === 'true') return () => true; if (t.v === 'false') return () => false; return (st) => { const v = lookup(t.v, st); return v === undefined ? t.v : v; }; }
    throw new Error('value');
  };
  const cmp = () => {
    if (eat('!')) { const f = cmp(); return (st) => !f(st); }
    if (eat('(')) { const f = or(); if (!eat(')')) throw new Error(')'); return f; }
    const start = tk[i], a = value(); const t = peek();
    if (t && t.t === 'word' && t.v === 'has') { i++; const b = value(); return (st) => { const x = a(st); return Array.isArray(x) && x.includes(b(st)); }; }
    if (t && t.t === 'op' && ['==', '!=', '>', '>=', '<', '<='].includes(t.v)) {
      i++; const b = value();
      return (st) => { const x = a(st), y = b(st); switch (t.v) { case '==': return x == y; case '!=': return x != y; case '>': return x > y; case '>=': return x >= y; case '<': return x < y; default: return x <= y; } };   // eslint-disable-line eqeqeq
    }
    const bare = start.t === 'word' && !/^-?\d+(\.\d+)?$/.test(start.v) && start.v !== 'true' && start.v !== 'false';   // a path alone: an unknown path is false, never a truthy word
    return (st) => { if (bare && lookup(start.v, st) === undefined) return false; const x = a(st); return Array.isArray(x) ? x.length > 0 : !!x && x !== 'false'; };
  };
  const and = () => { let f = cmp(); while (eat('&&')) { const g = f, h = cmp(); f = (st) => g(st) && h(st); } return f; };
  const or = () => { let f = and(); while (eat('||')) { const g = f, h = and(); f = (st) => g(st) || h(st); } return f; };
  const f = or(); if (i !== tk.length) throw new Error('rest');
  return f;
}
const cache = new Map();
function test(expr, st = state) {
  if (expr === undefined || expr === null || expr === '') return true;
  let f = cache.get(expr);
  if (f === undefined) { try { f = parse(String(expr)); } catch (e) { f = null; } if (f === null && !warned.has(expr)) { warned.add(expr); console.warn('ccState: cannot read the declaration "' + expr + '"'); } cache.set(expr, f); }
  return f ? !!f(st) : false;
}

// ---- the reverse channel
function registerHost(h) { host = h || null; return () => { if (host === h) host = null; }; }
/** → true when a host took it. A host member that returns false explicitly did not (the caller then does its own thing, e.g. the Problems panel's adapter). */
function select(ids, how = 'select') {
  const list = (Array.isArray(ids) ? ids : [ids]).filter((x) => x !== undefined && x !== null && x !== '');
  if (!host || !list.length) return false;
  const fn = how === 'reveal' ? host.reveal || host.select : how === 'highlight' ? host.highlight || host.select : host.select;
  if (typeof fn !== 'function') return false;
  let r; try { r = fn.call(host, list); } catch (e) { console.error(e); return false; }
  return r !== false;
}

// ---- 0.11 UI.25 (ui-finish-11 state): the apps' side in as few lines as possible
/** One object reference: { kind, id }. A ref object passes ({ kind, id } or a Problems `about` entry); 'kind:id' splits at the FIRST colon; anything else is
 *  { kind: '', id }. Hosts use it to read what a Browser row, a Problems line or a test hands them. */
function ref(x) {
  if (isObj(x)) return { kind: String(x.kind ?? x.type ?? ''), id: String(x.id ?? x.key ?? '') };
  const s = String(x ?? ''), i = s.indexOf(':');
  return i > 0 ? { kind: s.slice(0, i), id: s.slice(i + 1) } : { kind: '', id: s };
}
const refs = (ids) => (Array.isArray(ids) ? ids : [ids]).filter((x) => x !== undefined && x !== null && x !== '').map(ref);
const uniq = (a) => [...new Set(a.filter((x) => x !== undefined && x !== null && x !== '').map(String))];

let problemsHooked = false;
function hookProblems() {
  if (problemsHooked || typeof window === 'undefined') return;
  problemsHooked = true;
  const go = () => {
    const store = window.ccProblems?.store; if (!store?.on) return;
    const put = () => { try { const c = store.counts(); publish({ problems: { count: (c.error || 0) + (c.warning || 0) + (c.note || 0), error: c.error || 0, warning: c.warning || 0, note: c.note || 0, accepted: c.accepted || 0, worst: c.worst || '' } }, 'problems'); } catch (e) { /* the panel says why */ } };
    store.on(put); put();
  };
  if (window.ccProblems) go(); else document.addEventListener('cc-problems-ready', go, { once: true });
}

/**
 * ccState.adapt(adapter [, opt]) → the same adapter, made to publish. Call it on the workspace adapter before mountWorkspaces(adapter); the adapter keeps its
 * own shape. What it adds:
 *   - state() is wrapped: every time the engine reads it, `kinds` is filled when the adapter gives none (opt.kinds(selection) first, else each selected
 *     object's `kind` / `type`, else the part before ':' of a 'kind:id' string), and mode, view and layer are published when the state carries them
 *     (`view` falls back to adapter.views.current()). The engine itself writes selection, tool, dirty and document as before.
 *   - problems: the shell's Problems store (window.ccProblems) publishes its open counts { count, error, warning, note, accepted, worst } whenever it changes.
 *   - select / reveal / highlight: the adapter's own members are what the engine registers as the host (ccState.registerHost); nothing to add here.
 * Nothing changes for a page whose adapter is not adapted, so a released build is untouched until its app opts in.
 */
function adapt(A, opt = {}) {
  if (!A || A.__ccStateAdapted) return A;
  const own = A.state;
  if (typeof own === 'function') {
    A.state = function () {
      const s = own.apply(this, arguments) || {};
      try {
        const sel = Array.isArray(s.selection) ? s.selection : [];
        if (!Array.isArray(s.kinds)) {
          const k = opt.kinds ? opt.kinds(sel, s) : sel.map((x) => (isObj(x) ? x.kind ?? x.type : typeof x === 'string' && x.indexOf(':') > 0 ? x.slice(0, x.indexOf(':')) : ''));
          s.kinds = uniq(Array.isArray(k) ? k : []);
        } else s.kinds = uniq(s.kinds);
        const patch = {};
        for (const key of ['mode', 'view', 'layer']) if (s[key] !== undefined && s[key] !== null) patch[key] = String(s[key]);
        if (patch.view === undefined && A.views?.current) { const v = A.views.current(); if (v !== undefined && v !== null) patch.view = String(v); }
        if (Object.keys(patch).length) publish(patch, 'adapter');
      } catch (e) { console.error(e); }
      return s;
    };
  }
  Object.defineProperty(A, '__ccStateAdapted', { value: true });
  hookProblems();
  return A;
}

export const ccState = { get, publish, subscribe, test, registerHost, select, ref, refs, adapt, _reset() { for (const k of Object.keys(state)) delete state[k]; Object.assign(state, { selection: { ids: [], count: 0, kind: '', kinds: [] }, mode: '', view: '', layer: '', tool: '', dirty: false, document: false, problems: { count: 0 } }); cache.clear(); } };
if (typeof window !== 'undefined') window.ccState = window.ccState || ccState;
export default ccState;
