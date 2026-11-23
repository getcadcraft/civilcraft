/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — no words a person reads: the Ask box (app-ai-ask.js) says them through the shell language files. */
/**
 * app-ai-ownkey.js — the Ask box's seam for a model the person brings (their key, their provider, or a model on their own computer;
 * 0.8 AC.11 / AC.7). Owner 2026-11-20: "AI belongs to Studios and passes down to apps."
 *
 *   – In CadCraft Studio and SuperCad Studio the engine is the Studio's. Studio's own window script puts it on the page (id 'studio',
 *     host: true; studio/hub/ask-engine.js): nothing to add, no add-on. The key stays in Studio's hub.
 *   – In ONE app without Studio (a browser tab) the "Your own AI key" add-on brings the same engine (id 'own-ai-key', standalone: true;
 *     addons/own-ai-key/). A person adds it on purpose; it is never part of an app build.
 * The Studio's engine wins when both are on the page. The apps and this shell hold no engine: this file knows the two ids, reads what
 * was registered, and can ask the account's add-on client to add the add-on. It imports nothing, holds no provider address, no request
 * shape and no model call, and it never reads or moves a key.
 *
 * The seam (Studio's window script or the add-on's main.js writes it, this file reads it):
 *   globalThis.ccAskEngines = [{ id, name, host?, standalone?, settingsKey, engine({ studio, store }) → an ask-style engine | null, setup?() }]
 *   'cc-ask-engines' on the window whenever the list, or what an entry would answer, changes
 *
 *   ownProvider(g)            → Studio's entry, else the add-on's, else null
 *   ownEngine({ g, studio })  → the engine for the person's own model, or null (nothing registered, or nothing set up yet)
 *   ownState({ g, store })    → { inStudio, host, added, standalone, ready, hadSettings }
 *                               host = Studio handed its engine down · added = the add-on is on the page · standalone = the add-on runs
 *                               without Studio and has its own set-up · ready = an engine exists now · hadSettings = Studio's settings are stored
 *   ownSetup(g)               → true when the registered entry opened its own set-up (the add-on's dialog)
 *   watchOwn(fn, g)           → off()   fn runs when an entry arrives, leaves or changes, and when Studio's settings change in another window
 *   addOwnKey({ g })          → { ok } | { ok:false, reason: 'no-client' | 'sign-in' | 'offline' | 'no-package' | 'refused', message }
 *   listingUrl(g)             → the add-on's page in the Library
 */
export const STUDIO_ID = 'studio';
export const ADDON_ID = 'own-ai-key';
/** Where Studio's hub keeps the person's settings (provider, model, limits; never the key). */
export const SETTINGS_KEY = 'cadcraft.studio.byok.settings';
const SITE = 'https://getcadcraft.com';

const list = (g) => (Array.isArray(g.ccAskEngines) ? g.ccAskEngines : []);
const entry = (g, id) => list(g).find((p) => p && p.id === id && typeof p.engine === 'function') || null;
export const ownProvider = (g = globalThis) => entry(g, STUDIO_ID) || entry(g, ADDON_ID);

const isStudio = (s) => !!s && typeof s.post === 'function' && typeof s.on === 'function';

export function ownEngine({ g = globalThis, studio = g.cadcraftStudio } = {}) {
  const p = ownProvider(g);
  if (!p) return null;
  // the add-on's 0.10 package only ever worked through Studio's hub: without Studio it has nothing to answer with
  if (!p.host && !p.standalone && !isStudio(studio)) return null;
  try { const e = p.engine(isStudio(studio) ? { studio } : {}); return e && typeof e.ask === 'function' ? e : null; } catch { return null; }
}

export function ownState({ g = globalThis, store = g.localStorage } = {}) {
  let had = false;
  try { had = store.getItem(SETTINGS_KEY) !== null; } catch { had = false; }
  const addon = entry(g, ADDON_ID);
  return { inStudio: isStudio(g.cadcraftStudio), host: !!entry(g, STUDIO_ID), added: !!addon, standalone: !!(addon && addon.standalone), ready: !!ownEngine({ g }), hadSettings: had };
}

/** Open the set-up of the entry in use, when it has one of its own (the add-on outside Studio). Studio's set-up is in Studio's hub. */
export function ownSetup(g = globalThis) {
  const p = ownProvider(g);
  if (!p || typeof p.setup !== 'function') return false;
  try { p.setup(); return true; } catch { return false; }
}

export function watchOwn(fn, g = globalThis) {
  if (typeof g.addEventListener !== 'function') return () => {};
  const onList = () => fn('engines');
  const onStore = (ev) => { if (ev && ev.key === SETTINGS_KEY) fn('settings'); };
  g.addEventListener('cc-ask-engines', onList);
  g.addEventListener('storage', onStore);
  return () => { g.removeEventListener('cc-ask-engines', onList); g.removeEventListener('storage', onStore); };
}

/** The add-on's Library page: a relative address on the website, the website's own address anywhere else (Studio, a packed edition). */
export function listingUrl(g = globalThis) {
  let onSite = false;
  try { onSite = /^https?:$/.test(g.location.protocol) && /(^|\.)getcadcraft\.com$/.test(g.location.hostname); } catch { onSite = false; }
  return (onSite ? '' : SITE) + '/library/addons/' + ADDON_ID;
}

/**
 * "Add it": put the add-on on the account's list and fetch it (signature checked, all or nothing) through the page's account add-on client
 * (window.ccAddonsAccount, app-addons-account.js). A page without that client cannot add from here: the caller then shows the Library page.
 * A fetched add-on starts the next time the app is opened (the loader reads its store at start). Never needed inside Studio.
 */
export async function addOwnKey({ g = globalThis } = {}) {
  const acc = g.ccAddonsAccount;
  if (!acc || typeof acc.add !== 'function' || typeof acc.ensure !== 'function') return { ok: false, reason: 'no-client' };
  try {
    if (typeof acc.signedIn === 'function' && !acc.signedIn()) {
      const c = typeof acc.connect === 'function' ? await acc.connect() : { ok: false };
      if (!c || !c.ok) return { ok: false, reason: 'sign-in' };
    }
    let r = await acc.add(ADDON_ID);
    if (r && r.ok) r = await acc.ensure(ADDON_ID);
    if (r && r.ok) return { ok: true };
    if (r && r.offline) return { ok: false, reason: 'offline' };
    const why = (r && (r.reason || r.code)) || '';
    return { ok: false, reason: why === 'no-package' ? 'no-package' : 'refused', message: String((r && r.message) || why || '').slice(0, 160) };
  } catch { return { ok: false, reason: 'refused', message: '' }; }
}
