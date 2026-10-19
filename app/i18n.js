/* SPDX-License-Identifier: Apache-2.0 */
/**
 * i18n.js — language files for the CadCraft apps (docs/LANG.md). One module, DOM-optional, no dependencies.
 *
 * Canonical copy: public_html/assets/js/i18n.js (owner: 0.4 session `lang`). Every app build carries a byte-identical
 * copy as dev/i18n.js (`node tools/lang/sync.mjs` copies, `--check` compares) so a build stays self-contained:
 * cache-busted by its import map, saved for offline, frozen with a release, shipped in the app's own repo.
 *
 * The page is rendered with the strings already chosen (PHP `Lang`, the same rules), and the catalog it used is
 * embedded once per page as <script type="application/json" id="cc-lang">{locale, chain, strings}</script>. t() reads
 * that on first use, so it is synchronous: no fetch, works offline, matches the server.
 *
 *   import { t } from "./i18n.js";   (double quotes here: worker linkers read single-quoted paths in comments as imports)
 *   t('sheets.count', { n: 3 })        → "3 sheets"
 *   t('save.done', { file: name })     → "Saved Plans.pdf."
 *
 * Strings are plain text (never HTML): put them in the page with textContent / el(). A string is either text with
 * {name} fills, or a plural object {"=0": …, "one": …, "other": …} chosen by the number in the fill `n`
 * (exact "=n" first, then the locale's CLDR category, then "other"). "{{" and "}}" are literal braces.
 * A key no file has comes back as the key itself and is remembered in missing() (tests fail on it).
 */

const KEY_RE = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
const FILL_RE = /\{\{|\}\}|\{([A-Za-z_][A-Za-z0-9_]*)\}/g;
export const CATEGORIES = ['zero', 'one', 'two', 'few', 'many', 'other'];
export const DEFAULT_LOCALE = 'en';
/** Languages written right to left (by base language subtag). */
export const RTL = new Set(['ar', 'arc', 'ckb', 'dv', 'fa', 'ha', 'he', 'khw', 'ks', 'ku', 'ps', 'sd', 'ug', 'ur', 'yi']);
export const isRtl = (loc = locale()) => RTL.has(String(loc).split('-')[0]);

let state = null;            // {locale, chain, strings}
const missingKeys = new Set();
const pluralCache = new Map();

/** Use this catalog (tests, the dev shell, or a page without the embedded tag). */
export function init({ locale = DEFAULT_LOCALE, chain = null, strings = {} } = {}) {
  state = { locale, chain: chain || [locale], strings: strings || {} };
  missingKeys.clear();
  if (typeof document !== 'undefined' && document.documentElement) {
    if (document.documentElement.lang !== locale) document.documentElement.lang = locale;
    const dir = RTL.has(locale.split('-')[0]) ? 'rtl' : 'ltr';
    if (document.documentElement.dir !== dir) document.documentElement.dir = dir;
  }
  return state;
}

/** Read the catalog the server embedded (#cc-lang). No tag (or not a browser) → English with no strings. */
function boot() {
  if (state) return state;
  let data = null;
  try {
    const tag = typeof document !== 'undefined' ? document.getElementById('cc-lang') : null;
    if (tag) data = JSON.parse(tag.textContent || 'null');
  } catch { data = null; }
  if (!data || typeof data !== 'object' || typeof data.strings !== 'object') data = { locale: DEFAULT_LOCALE, strings: {} };
  return init(data);
}

/** The locale the page runs in ("en", "es-MX", "en-XA" for the pseudo-locale). */
export function locale() { return boot().locale; }

/** Is there a string for this key (in any file of the chain)? */
export function has(key) { return Object.prototype.hasOwnProperty.call(boot().strings, key); }

/** The catalog in use, {locale, chain, strings}, plain data to post to a Worker: a worker has no page and no #cc-lang tag,
 * so it calls init(catalog()) with what the page sends it (docs/LANG.md § Workers). */
export function catalog() { const s = boot(); return { locale: s.locale, chain: [...s.chain], strings: s.strings }; }

/** Keys asked for that no file has (since init). */
export function missing() { return [...missingKeys]; }

/** The CLDR plural category of n in this locale (Intl.PluralRules; "other" when unavailable). */
export function pluralCategory(n, loc = locale()) {
  let pr = pluralCache.get(loc);
  if (!pr) {
    try { pr = new Intl.PluralRules(loc); } catch { pr = { select: () => 'other' }; }
    pluralCache.set(loc, pr);
  }
  const x = Number(n);
  return Number.isFinite(x) ? pr.select(x) : 'other';
}

/** Pick a plural form: "=n" exactly, else the category, else "other". */
export function choosePlural(forms, n, loc = locale()) {
  if (n !== undefined && n !== null && Object.prototype.hasOwnProperty.call(forms, '=' + n)) return forms['=' + n];
  const cat = n === undefined || n === null ? 'other' : pluralCategory(n, loc);
  return typeof forms[cat] === 'string' ? forms[cat] : forms.other;
}

/** Put the fills into a string ("{name}" → vars.name; unknown fills stay as written). */
export function fill(text, vars = {}) {
  return String(text).replace(FILL_RE, (m, name) => {
    if (m === '{{') return '{';
    if (m === '}}') return '}';
    return Object.prototype.hasOwnProperty.call(vars, name) && vars[name] !== undefined && vars[name] !== null ? String(vars[name]) : m;
  });
}

/** The string for key in the page's language, with fills. */
export function t(key, vars = {}) {
  const s = boot();
  const v = s.strings[key];
  if (v === undefined) { missingKeys.add(key); return key; }
  const text = typeof v === 'string' ? v : choosePlural(v, vars.n, s.locale);
  return fill(text ?? key, vars);
}

/** The fill names a string uses (every plural form together), for checks. */
export function fillsOf(value) {
  const out = new Set();
  const scan = (s) => { for (const m of String(s).matchAll(FILL_RE)) if (m[1]) out.add(m[1]); };
  if (typeof value === 'string') scan(value);
  else if (value && typeof value === 'object') Object.values(value).forEach(scan);
  return [...out].sort();
}

export const isKey = (k) => typeof k === 'string' && k.length <= 120 && KEY_RE.test(k);

/** Choose the user's language and remember it (cookie cc_lang, read by the server on the next page). null = automatic. */
export function setLocale(loc) {
  if (typeof document === 'undefined') return;
  const v = loc ? encodeURIComponent(loc) : '';
  document.cookie = 'cc_lang=' + v + '; path=/; SameSite=Lax; max-age=' + (loc ? 31536000 : 0);
}

// globalThis.ccI18n: how shared libraries (lib/dwg, lib/skp, libitem.js — docs/LANG.md § Shared libraries) reach the
// page's language without importing this file; catalog() lets one hand it to its worker.
const api = { t, has, locale, missing, init, setLocale, fill, choosePlural, pluralCategory, catalog, isRtl };
if (typeof globalThis !== 'undefined' && !globalThis.ccI18n) globalThis.ccI18n = api;
export default api;
