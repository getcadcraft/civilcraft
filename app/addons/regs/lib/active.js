/* SPDX-License-Identifier: Apache-2.0 */
/**
 * active.js — which regulation packs the app checks against (0.8 REG.1, the `regs` add-on; owner decisions 7 and 8, docs/0.8-ZA-STANDARDS.md).
 * No DOM: bin/test-bimcraft.mjs --regs runs it in Node. Three sources of packs, one place that merges them:
 *   bundled   the files beside the add-on (packs/index.json); a fallback and the lab's test packs
 *   library   the packs of the regions the person installed from the CadCraft Library (lib/library.js; the same on this computer for every app)
 *             — a Library pack wins over a bundled pack with the same id
 *   own       the person's uploaded packs ("Your pack"; never "reviewed"; never a bundled or Library id)
 * Three layers of choice:
 *   regions   the countries installed (Settings › Global › Building regulations). Until the person picks any (null), every bundled pack's
 *             country is shown, as before regions existed
 *   listed    the packs ticked in Settings › <App> › Building regulations: shown in the Regulations panel, and ticked for a drawing that
 *             has no ticks of its own
 *   drawing   the drawing's own ticks (packs, rules switched off, how disagreeing packs combine) — saved in the drawing (BimCraft: the
 *             IFC, CadCraft_Regulations on IfcProject); null = the drawing has none yet, the listed packs and the app's mode apply
 *
 *   loadPacks({ fetchJson, base }) → Promise<void>      the bundled packs (a pack that fails to read or validate is left out: loadProblems())
 *   setLibraryPacks([{ pack, uuid, version, region }]) · setRegions(codes | null) · regions()
 *   listPacks({ all }) → [{ id, name, edition, review, jurisdiction, source, price, maker, base, own, from: 'bundled'|'library'|'own',
 *                          version, uuid }]   the packs of the shown regions (all: every pack known) — bundled/library first, own last
 *   setOwnPacks(raw[]) · addOwnPack(raw) → { ok, pack, errors } · removeOwnPack(id) · ownPacks()
 *   setActivePacks(ids | null) / listedIds()             the listed packs (null = the default pack). activeIds() = what is checked now
 *   setMode(mode) · mode()                               MODES each | strict | chain (the drawing's, else the app's)
 *   setDrawing({ packs, rulesOff, mode } | null) · drawing()   the drawing's own ticks; rulesOff = ['<pack id>:<rule id>', …]
 *   profiles() → [profile]                               what is checked (rules switched off left out; strict: one combined profile)
 *   packProfile(id) → profile | null                     any known pack resolved (its rules and those it builds on)
 *   activeProfile() · setActivePack(id) · activeId()     one-pack shapes (older callers and tests)
 *   setAppliesFilter(kinds | null)                      (0.8 step 4, regs_PART_3) an app that checks only some kinds of rule ('drawing', 'zone' …)
 *                                                        lists only the packs that have a rule of those kinds (own packs always); null = all
 *   onRegsChange(fn) → stop()
 * The new stair always starts from the tightest limits of what is checked, so it meets every ticked pack.
 */
import { cleanPack, resolve, stairLimitsFrom, strictest } from './regs.js';

/** The app's way of applying the checked packs' limits to what it draws (BimCraft: the stair tool's limits). Set once by the app's main.js, so this
 *  file has no app imports and is the same in every app (tools/regs/sync.mjs). Called with the limits, or null for none. */
let applyLimits = () => {};
export const setLimitsApplier = (fn) => { applyLimits = typeof fn === 'function' ? fn : () => {}; };

export const MODES = ['each', 'strict', 'chain'];
export const OWN_LIMIT = 20;

/** The kinds of rule (a rule's `applies`) this app can check; null = every pack is relevant. Set by the app's main.js (setAppliesFilter). */
let appliesFilter = null;

const state = {
  bundled: new Map(), library: new Map(), libMeta: new Map(), own: new Map(), order: [], dflt: null,
  regions: null, on: null, mode: 'each', drawing: null, profiles: [], problems: [], listeners: new Set(),
};

const defaultFetch = (url) => fetch(url).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
const all = () => new Map([...state.bundled, ...state.library, ...state.own]);

export async function loadPacks({ fetchJson = defaultFetch, base = new URL('../packs/', import.meta.url).href } = {}) {
  state.problems = [];
  let list;
  try { list = await fetchJson(base + 'index.json'); } catch (e) { state.problems.push('index: ' + (e && e.message)); apply(); return; }
  const ids = Array.isArray(list && list.packs) ? list.packs.filter((x) => typeof x === 'string' && /^[a-z0-9][a-z0-9-]{1,47}$/.test(x)).slice(0, 50) : [];
  const packs = new Map();
  await Promise.all(ids.map(async (id) => {
    try {
      const r = cleanPack(await fetchJson(base + id + '.json'));
      if (!r.ok) state.problems.push(id + ': ' + r.errors.join('; '));
      /* i18n-ignore-start: a technical note for the console and tests */
      else if (r.pack.id !== id) state.problems.push(id + ': the pack says it is ' + r.pack.id);
      /* i18n-ignore-end */
      else packs.set(id, r.pack);
    } catch (e) { state.problems.push(id + ': ' + (e && e.message)); }
  }));
  state.bundled = packs;
  state.order = ids.filter((id) => packs.has(id));
  state.dflt = packs.has(list.default) ? list.default : (state.order[0] || null);
  for (const id of [...state.own.keys()]) if (packs.has(id) || state.library.has(id)) state.own.delete(id);   // a bundled or Library pack wins
  apply();   // re-apply the choice made before the files arrived
}

export const loadProblems = () => state.problems.slice();

/** The packs installed from the Library: [{ pack (raw, cleaned here), uuid, version, region }]. */
export function setLibraryPacks(list) {
  state.library = new Map(); state.libMeta = new Map();
  for (const x of Array.isArray(list) ? list : []) {
    const r = cleanPack(x && x.pack);
    if (!r.ok) continue;
    state.library.set(r.pack.id, r.pack);
    state.libMeta.set(r.pack.id, { uuid: typeof x.uuid === 'string' ? x.uuid : '', version: Number(x.version) || null });
  }
  for (const id of [...state.own.keys()]) if (state.library.has(id)) state.own.delete(id);
  apply();
}
export function setRegions(codes) { state.regions = Array.isArray(codes) ? [...new Set(codes.filter((c) => /^[A-Z]{2}$/.test(String(c))))] : null; apply(); }
export const regions = () => (state.regions ? state.regions.slice() : null);

export function setAppliesFilter(kinds) { appliesFilter = Array.isArray(kinds) && kinds.length ? new Set(kinds) : null; return apply(); }
const relevant = (id) => { if (!appliesFilter) return true; const pr = resolve(all(), id); return !!pr && pr.list().some((r) => appliesFilter.has(r.applies)); };
const shownCountry = (c) => state.regions === null || state.regions.includes(c);
const info = (p, from) => ({ id: p.id, name: p.name, edition: p.edition, review: p.review, authority: p.authority || null, in_force: p.in_force || null, jurisdiction: p.jurisdiction, source: p.source, price: p.price,
  maker: p.maker, base: p.base, own: from === 'own', from, version: state.libMeta.get(p.id)?.version ?? null, uuid: state.libMeta.get(p.id)?.uuid ?? '' });

export function listPacks({ all: every = false } = {}) {
  const out = [], seen = new Set();
  const push = (p, from) => { if (seen.has(p.id)) return; seen.add(p.id); if (from === 'own' || ((every || shownCountry(p.jurisdiction.country)) && relevant(p.id))) out.push(info(p, from)); };
  for (const id of state.order) push(state.library.get(id) || state.bundled.get(id), state.library.has(id) ? 'library' : 'bundled');
  for (const p of state.library.values()) push(p, 'library');
  for (const p of state.own.values()) push(p, 'own');
  return out;
}

/* i18n-ignore-start: the reasons a pack is refused are for whoever writes the pack, in English like the format itself (as regs.js) */
/** An own pack: cleaned like any pack; never "reviewed" (only the Library can say that), never the id of a bundled or Library pack. */
function cleanOwn(raw) {
  const r = cleanPack(raw);
  if (!r.ok) return r;
  if (state.bundled.has(r.pack.id) || state.library.has(r.pack.id)) return { ok: false, pack: null, errors: ['a built-in pack already has the id ' + r.pack.id] };
  if (r.pack.review.state === 'reviewed') r.pack.review = { ...r.pack.review, state: 'draft' };
  return r;
}

export function addOwnPack(raw) {
  const r = cleanOwn(raw);
  if (!r.ok) return r;
  if (!state.own.has(r.pack.id) && state.own.size >= OWN_LIMIT) return { ok: false, pack: null, errors: ['at most ' + OWN_LIMIT + ' packs of your own'] };
  state.own.set(r.pack.id, r.pack);
  apply();
  return r;
}
/* i18n-ignore-end */

export function setOwnPacks(list) {
  state.own = new Map();
  for (const raw of Array.isArray(list) ? list.slice(0, OWN_LIMIT) : []) { const r = cleanOwn(raw); if (r.ok) state.own.set(r.pack.id, r.pack); }
  apply();
}
export function removeOwnPack(id) {
  if (!state.own.delete(id)) return false;
  if (state.on) state.on = state.on.filter((x) => x !== id);
  if (state.drawing) state.drawing = { ...state.drawing, packs: state.drawing.packs.filter((x) => x !== id) };
  apply();
  return true;
}
export const ownPacks = () => [...state.own.values()];

/** The listed packs (Settings › <App>): null = the default pack. */
export function setActivePacks(ids) {
  state.on = Array.isArray(ids) ? [...new Set(ids.filter((x) => typeof x === 'string'))] : null;
  return apply();
}
const known = () => all();
const shownIds = () => new Set(listPacks().map((p) => p.id));
/** The listed ids that exist and are shown (before any pack loads, the stored choice as it is). */
export function listedIds() {
  const packs = known();
  if (state.on === null) return state.dflt && shownIds().has(state.dflt) ? [state.dflt] : [];
  if (!packs.size) return state.on.slice();
  const shown = shownIds();
  const ids = state.on.filter((id) => packs.has(id) && shown.has(id));
  // A stored choice whose packs are all gone (renamed, removed) falls back to the default rather than silently checking nothing;
  // unticking everything on purpose (an empty list) checks nothing.
  return ids.length || !state.on.length ? ids : (state.dflt && shown.has(state.dflt) ? [state.dflt] : []);
}
/** What is checked now: the drawing's own ticks when it has them, else the listed packs. */
export function activeIds() {
  if (!state.drawing) return listedIds();
  const packs = known();
  return packs.size ? state.drawing.packs.filter((id) => packs.has(id)) : state.drawing.packs.slice();
}
export function setMode(m) { state.mode = MODES.includes(m) ? m : 'each'; return apply(); }
export const mode = () => (state.drawing && MODES.includes(state.drawing.mode) ? state.drawing.mode : state.mode);
export const appMode = () => state.mode;

/** The drawing's own ticks, or null (the drawing has none: the listed packs and the app's mode apply). */
export function setDrawing(d) {
  if (!d || typeof d !== 'object') state.drawing = null;
  else state.drawing = {
    packs: [...new Set((Array.isArray(d.packs) ? d.packs : []).filter((x) => typeof x === 'string' && /^[a-z0-9][a-z0-9-]{1,47}$/.test(x)))].slice(0, 50),
    rulesOff: [...new Set((Array.isArray(d.rulesOff) ? d.rulesOff : []).filter((x) => typeof x === 'string' && /^[a-z0-9-]{2,48}:[a-z0-9.]{3,60}$/.test(x)))].slice(0, 500),
    mode: MODES.includes(d.mode) ? d.mode : null,
  };
  return apply();
}
export const drawing = () => (state.drawing ? { packs: state.drawing.packs.slice(), rulesOff: state.drawing.rulesOff.slice(), mode: state.drawing.mode } : null);

export const profiles = () => state.profiles.slice();
/** The Library version of an installed pack (null for a bundled or own pack: those have no item version). */
export const packVersion = (id) => state.libMeta.get(id)?.version ?? null;
/** Any known pack with the rules it ends up with (its own and those of the packs it builds on), ticked or not. */
export const packProfile = (id) => resolve(all(), id);
export const activeProfile = () => state.profiles[0] || null;
/** One pack (the first slice's single choice; tests and older callers). */
export const setActivePack = (id) => setActivePacks(typeof id === 'string' ? [id] : null)[0] || null;
export const activeId = () => activeIds()[0] || null;

/** A profile without the rules the drawing switched off for that pack. */
function withoutOff(p) {
  const off = state.drawing ? state.drawing.rulesOff.filter((k) => k.startsWith(p.id + ':')).map((k) => k.slice(p.id.length + 1)) : [];
  if (!off.length) return p;
  const rules = new Map([...p.rules].filter(([rid]) => !off.includes(rid)));
  return { ...p, rules, rule(rid) { return rules.get(rid) || null; }, list() { return [...rules.values()]; } };
}

function apply() {
  const packs = all();
  let list = activeIds().map((id) => resolve(packs, id)).filter(Boolean).map(withoutOff);
  const m = mode();
  if (m === 'chain') list = list.filter((p) => !list.some((q) => q !== p && q.chain.slice(0, -1).some((c) => c.id === p.id)));
  if (m === 'strict' && list.length > 1) list = [strictest(list)];
  state.profiles = list;
  applyLimits(list.length ? stairLimitsFrom(list.length > 1 ? strictest(list) : list[0]) : null);
  for (const fn of [...state.listeners]) { try { fn(list); } catch (e) { /* a listener's failure never stops the others */ } }
  return list;
}

export function onRegsChange(fn) { state.listeners.add(fn); return () => state.listeners.delete(fn); }
