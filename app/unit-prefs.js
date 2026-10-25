/* SPDX-License-Identifier: Apache-2.0 */
/**
 * unit-prefs.js — which units the dropdowns offer and which one is the default (0.7 UNITS; canonical in lib/units/,
 * copied byte for byte into each app's dev/ by `node tools/units/sync.mjs`). Settings › General › Units writes these
 * (unit-settings.js); every app reads them. No DOM except fillSelect (which is handed its <select>).
 *
 * One choice for every app in this browser (like the theme): localStorage "cc-units" =
 *   { v: 1, on: { <kind>: [ids] }, star: { <kind>: id } }   a kind missing from `on` = the table's own `on` units;
 *                                                            a kind missing from `star` = no star (each app's own default)
 * The settings never change a file: a drawing or project keeps its own unit, and the unit it uses is always offered
 * (choices(…, { keep })) even when it is turned off here.
 *
 *   isOn(id) · unitsOn(kind) · starOf(kind)         what Settings says (starOf: null when nothing is starred)
 *   setOn(id, on) · setStar(kind, id | null) · resetUnits(kind?)   (a starred unit is always on; turning it off un-stars it)
 *   choices(kind, { offer, keep })  → the ids a dropdown lists: table order, turned on, in `offer` (when given), plus `keep`
 *   defaultUnit(kind, { offer, fallback })  → the star when the app offers it, else `fallback`
 *   onUnitsChange(fn)  → stop()   fn() after any change, in this page (event "cc-units-change") or another tab ("storage")
 *   fillSelect(select, kind, { offer: [[value, id]…], keep: [values], label })   rebuild a <select>'s options, keeping its value
 *   limitSelect(select, kind, { map, keep })   the same for a <select> the page printed (its own words and groups kept)
 */
import { UNITS, unit, unitsOf, unitName } from './unit-table.js';

export const PREFS_KEY = 'cc-units';
export const CHANGE_EVENT = 'cc-units-change';

const store = () => { try { return globalThis.localStorage || null; } catch { return null; } };
let memo = null;   // { raw, prefs }: parsed once per stored text
function read() {
  const ls = store();
  let raw = null;
  try { raw = ls ? ls.getItem(PREFS_KEY) : null; } catch { raw = null; }
  if (memo && memo.raw === raw) return memo.prefs;
  const prefs = { on: {}, star: {} };
  try {
    const v = raw ? JSON.parse(raw) : null;
    if (v && typeof v === 'object') {
      for (const [kind, ids] of Object.entries(v.on || {})) if (Array.isArray(ids)) prefs.on[kind] = ids.filter((id) => unit(id)?.kind === kind);
      for (const [kind, id] of Object.entries(v.star || {})) if (unit(id)?.kind === kind) prefs.star[kind] = id;
    }
  } catch { /* a broken entry reads as none */ }
  memo = { raw, prefs };
  return prefs;
}
function write(prefs) {
  const ls = store();
  const clean = { v: 1, on: prefs.on, star: prefs.star };
  try { if (ls) { if (!Object.keys(prefs.on).length && !Object.keys(prefs.star).length) ls.removeItem(PREFS_KEY); else ls.setItem(PREFS_KEY, JSON.stringify(clean)); } } catch { /* this page only */ }
  memo = null;
  try { globalThis.dispatchEvent?.(new CustomEvent(CHANGE_EVENT)); } catch { /* no events (Node) */ }
}
const copy = (p) => ({ on: Object.fromEntries(Object.entries(p.on).map(([k, v]) => [k, [...v]])), star: { ...p.star } });

/** The ids turned on in a kind (table order). */
export function unitsOn(kind) {
  const p = read(), list = p.on[kind];
  const on = new Set(list || unitsOf(kind).filter((u) => u.on).map((u) => u.id));
  if (p.star[kind]) on.add(p.star[kind]);
  return unitsOf(kind).filter((u) => on.has(u.id)).map((u) => u.id);
}
export const isOn = (id) => { const u = unit(id); return !!u && unitsOn(u.kind).includes(id); };
/** The starred unit of a kind, or null (then each app keeps its own default). */
export const starOf = (kind) => read().star[kind] || null;

export function setOn(id, on) {
  const u = unit(id);
  if (!u) return;
  const p = copy(read());
  const now = new Set(unitsOn(u.kind));
  if (on) now.add(id); else now.delete(id);
  p.on[u.kind] = unitsOf(u.kind).filter((x) => now.has(x.id)).map((x) => x.id);
  if (!on && p.star[u.kind] === id) delete p.star[u.kind];
  write(p);
}
export function setStar(kind, id) {
  const p = copy(read());
  if (id && unit(id)?.kind === kind) {
    p.star[kind] = id;
    if (!unitsOn(kind).includes(id)) p.on[kind] = [...unitsOn(kind), id];
  } else delete p.star[kind];
  write(p);
}
/** Back to the table's own lists and no stars (one kind, or all). */
export function resetUnits(kind) {
  const p = copy(read());
  if (kind) { delete p.on[kind]; delete p.star[kind]; } else { p.on = {}; p.star = {}; }
  write(p);
}

/** The ids a dropdown lists: table order, on, offered by the app (when `offer` is given), plus `keep` (a file's own unit). */
export function choices(kind, { offer = null, keep = [] } = {}) {
  const on = new Set(unitsOn(kind)), off = offer ? new Set(offer) : null, k = new Set((keep || []).filter(Boolean));
  const out = unitsOf(kind).filter((u) => (on.has(u.id) && (!off || off.has(u.id))) || k.has(u.id)).map((u) => u.id);
  // nothing turned on that the app has: it still needs something to show
  if (!out.length && offer && offer.length) out.push(offer[0]);
  return out;
}
/** The default for something new: the star when the app offers it, else `fallback`. */
export function defaultUnit(kind, { offer = null, fallback = null } = {}) {
  const s = starOf(kind);
  return s && (!offer || offer.includes(s)) ? s : fallback;
}

/** fn() whenever the choices change (this page or another tab). → a function that stops it. */
export function onUnitsChange(fn) {
  const g = globalThis;
  if (!g.addEventListener) return () => {};
  const here = () => fn();
  const there = (e) => { if (e.key === PREFS_KEY || e.key === null) { memo = null; fn(); } };
  g.addEventListener(CHANGE_EVENT, here);
  g.addEventListener('storage', there);
  return () => { g.removeEventListener(CHANGE_EVENT, here); g.removeEventListener('storage', there); };
}

/**
 * Rebuild a <select>'s options from the choices, in the table's order: `offer` = [[value the app uses, table id]…];
 * `keep` = app values always shown (the file's unit; the one selected now is kept anyway); `label(id, value)` = the
 * option's text (default: the unit's name, then its mark in brackets when they differ). → the values listed.
 */
export function fillSelect(select, kind, { offer, keep = [], label } = {}) {
  if (!select) return [];
  const pairs = offer || unitsOf(kind).map((u) => [u.id, u.id]);
  const byId = new Map(pairs.map(([v, id]) => [id, v])), toId = new Map(pairs.map(([v, id]) => [String(v), id]));
  const cur = select.value;
  const keepIds = [...keep, cur].map((v) => toId.get(String(v))).filter(Boolean);
  const ids = choices(kind, { offer: pairs.map((p) => p[1]), keep: keepIds });
  const doc = select.ownerDocument;
  const opts = ids.map((id) => {
    const o = doc.createElement('option');
    o.value = String(byId.get(id));
    o.textContent = label ? label(id, byId.get(id)) : optionText(id);
    return o;
  });
  select.replaceChildren(...opts);
  if (opts.some((o) => o.value === cur)) select.value = cur;
  return opts.map((o) => o.value);
}
/**
 * Limit a <select> the page printed (options, optgroups and the app's own words kept) to the choices: options whose
 * unit is turned off are taken out, empty groups too; `map(value)` = the option's table id (an option it gives no id
 * stays); `keep` = values always shown (the file's unit). The first call remembers the full list, so later calls (after a
 * change in Settings) can put options back. The selected value stays. → the values listed.
 */
export function limitSelect(select, kind, { map = (v) => v, keep = [] } = {}) {
  if (!select) return [];
  if (!select._ccAll) select._ccAll = [...select.children];
  const cur = select.value, ids = new Set(unitsOn(kind)), k = new Set([...keep, cur].map(String));
  const allowed = (o) => { const id = map(o.value); return !id || !unit(id) || ids.has(id) || k.has(o.value); };
  const all = select._ccAll.flatMap((n) => (n.tagName === 'OPTGROUP' ? [...(n._ccAll || (n._ccAll = [...n.children]))] : [n]));
  // nothing the app has is on: show everything rather than an empty list
  const none = !all.some(allowed);
  const want = all.filter((o) => none || allowed(o));
  const have = [...select.options];
  if (want.length !== have.length || want.some((o, i) => o !== have[i])) {   // rebuilt only when the list changes
    const kids = [];
    for (const n of select._ccAll) {
      if (n.tagName === 'OPTGROUP') { const opts = n._ccAll.filter((o) => none || allowed(o)); n.replaceChildren(...opts); if (opts.length) kids.push(n); }
      else if (none || allowed(n)) kids.push(n);
    }
    select.replaceChildren(...kids);
  }
  if ([...select.options].some((o) => o.value === cur)) select.value = cur;
  return [...select.options].map((o) => o.value);
}

/** "Feet (ft)" — the name and, when it says something more, the mark. */
export function optionText(id) {
  const u = unit(id), name = unitName(id);
  return u && name !== u.mark && !name.includes(u.mark) ? name + ' (' + u.mark + ')' : name;
}

export { UNITS };
