/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — every word a person reads goes through window.ccShellT (shell language files); the literals here are errors for developers. */
/**
 * addons.js — the add-on loader every app uses (0.4 item A.2, session shell; docs/0.4-PART2.md § Track A; the full
 * add-on spec is docs/ADDONS-SPEC.md, session addons). No dependencies; DOM-optional.
 *
 * Canonical copy: public_html/assets/js/addons.js (owner: session shell). Every app build carries a byte-identical copy as
 * dev/addons.js (`node tools/shell/sync.mjs` copies, `--check` compares). It finds add-ons relative to its own URL, so the
 * copy in a build (or a browser edition folder) finds that build's add-ons.
 *
 *   import { AddonLoader } from "./addons.js";      (double quotes: worker linkers read single-quoted paths as imports)
 *   const loader = new AddonLoader({
 *     app: 'cadcraft', apiVersion: '1.0',
 *     makeApi: (base, addon) => ({ ...base, def, toolbar, panel, … }),   // the app's own API (A.3; A.6 for the shared parts)
 *   });
 *   await loader.start();          // find, check, import, activate(api) — never throws; the app keeps working
 *   loader.list();                 // every add-on found: {id, name, version, source, state, reason, manifest}
 *
 * WHERE ADD-ONS COME FROM (in this order; the first copy of an id wins):
 *   bundled    <build>/addons/index.json  {"addons": ["electrical", …]} — folders shipped inside the app build. The
 *              self-hosted browser edition uses the same file: drop a folder into addons/ and add its name there.
 *   installed  IndexedDB "cadcraft-addons" (store packages) — installed from the directory (A.7) through installPackage().
 * An add-on folder: addon.json + its entry module + optional lang/<locale>.json and help/help.js (compiled help).
 *
 * addon.json (checked here; anything wrong = "refused" with the reason, listed in Settings › Add-ons):
 *   id           "electrical" or "com.example.tool" — lower case letters, digits, "." and "-", 2–64, starts with a letter
 *   name         shown in Settings (≤ 60)
 *   version      semver "1.2.3"
 *   apps         ["cadcraft"] — must include this app
 *   api          "1" or "1.0" — the add-on API it needs: the same major as the app's, and a minor no newer
 *   license      SPDX id ("Apache-2.0")
 *   entry        "./main.js" — inside the folder (no "..", no URL)
 *   permissions  ["commands", "objects", …] — shown in Settings (JS add-ons have the page's access; reviewed + signed)
 *   description, author, homepage, lang ("./lang/"), help ("./help/help.js") — optional
 * The entry exports activate(api) (sync or async; may return a deactivate function) and optionally deactivate(api).
 *
 * TRUST (decision 14 / A.8): bundled add-ons are part of the build. Installed ones must pass AddonLoader.verify(pkg)
 * (the signature check A.8 supplies; until then nothing verifies) unless developer mode is on (localStorage
 * "cc-addons-dev" = "1"), in which case they load with a warning in Settings.
 *
 * FAILURE: an entry that does not import, an activate() that throws, rejects or takes over 10 s → the add-on is switched
 * off (remembered, with the reason), a shell message says so once, and the app carries on. The user can switch it on again.
 *
 * ON / OFF: per app, localStorage "cc-addons:<app>" {off: {id: reason}}. Switching on activates at once; switching off
 * calls its deactivate (and the cleanups it registered) — what it cannot undo goes on reload, and Settings says so.
 *
 * The base API every add-on gets (apps add their own on top through makeApi):
 *   api.version            the app's add-on API version ("1.0")
 *   api.app                {slug, name}
 *   api.addon              {id, name, version}
 *   api.t(key, vars)       the add-on's own strings (lang/<locale>.json, then its language, then en), as i18n.js t()
 *   api.url(path)          a URL for one of its own files (works for installed add-ons too)
 *   api.storage            {get(key), set(key, value), remove(key)} — JSON in localStorage "cc-addon:<app>:<id>:"
 *   api.onDeactivate(fn)   cleanup to run when it is switched off
 *   api.log(...)           console.info with the add-on's id
 *   api.help(topics)       add compiled help topics to the help panel (done for you when addon.json has "help")
 */

export const LOADER_VERSION = 1;
export const ACTIVATE_TIMEOUT = 10000;
export const ID_RE = /^[a-z][a-z0-9.-]{1,63}$/;
export const SEMVER_RE = /^(\d{1,4})\.(\d{1,4})\.(\d{1,6})(?:-[0-9A-Za-z.-]{1,40})?$/;
export const PERM_RE = /^[a-z][a-z0-9-]{0,31}$/;
const SPDX_RE = /^[A-Za-z0-9.+-]{2,40}(?: (?:AND|OR|WITH) [A-Za-z0-9.+-]{2,40})*$/;

const g = globalThis;
const T = (k, v) => (typeof window !== 'undefined' && window.ccShellT ? window.ccShellT(k, v) : k);

/** "1" / "1.2" / "1.2.3" → [major, minor] or null. */
export function apiParts(v) {
  const m = /^(\d{1,3})(?:\.(\d{1,3}))?(?:\.\d{1,3})?$/.exec(String(v ?? ''));
  return m ? [Number(m[1]), Number(m[2] || 0)] : null;
}

/** Check a manifest for this app and API. → {ok, manifest (normalised), reason, detail}. */
export function checkManifest(raw, { app, apiVersion }) {
  const bad = (reason, detail) => ({ ok: false, reason, detail: detail || '', manifest: raw && typeof raw === 'object' ? raw : null });
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return bad('manifest', 'addon.json is not an object');
  const m = {};
  if (typeof raw.id !== 'string' || !ID_RE.test(raw.id) || /\.\.|--|[.-]$/.test(raw.id)) return bad('manifest', 'id');
  m.id = raw.id;
  if (typeof raw.name !== 'string' || !raw.name.trim() || raw.name.length > 60 || /[\u0000-\u001f<>]/.test(raw.name)) return bad('manifest', 'name');
  m.name = raw.name.trim();
  if (typeof raw.version !== 'string' || !SEMVER_RE.test(raw.version)) return bad('manifest', 'version');
  m.version = raw.version;
  if (!Array.isArray(raw.apps) || !raw.apps.length || !raw.apps.every((a) => typeof a === 'string' && /^[a-z0-9-]{1,40}$/.test(a))) return bad('manifest', 'apps');
  m.apps = [...raw.apps];
  const need = apiParts(raw.api), have = apiParts(apiVersion);
  if (!need) return bad('manifest', 'api');
  m.api = String(raw.api);
  if (typeof raw.license !== 'string' || !SPDX_RE.test(raw.license)) return bad('manifest', 'license');
  m.license = raw.license;
  if (typeof raw.entry !== 'string' || !/^(\.\/)?[A-Za-z0-9_][A-Za-z0-9_./-]*\.m?js$/.test(raw.entry) || raw.entry.includes('..') || raw.entry.includes('//')) return bad('manifest', 'entry');
  m.entry = raw.entry.replace(/^\.\//, '');
  const perms = raw.permissions === undefined ? [] : raw.permissions;
  if (!Array.isArray(perms) || perms.length > 20 || !perms.every((p) => typeof p === 'string' && PERM_RE.test(p))) return bad('manifest', 'permissions');
  m.permissions = [...new Set(perms)];
  for (const k of ['description', 'author', 'homepage']) {
    if (raw[k] === undefined) continue;
    if (typeof raw[k] !== 'string' || raw[k].length > (k === 'description' ? 400 : 200) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(raw[k])) return bad('manifest', k);
    if (k === 'homepage' && !/^https:\/\/[^\s"'<>]+$/.test(raw[k])) return bad('manifest', k);
    m[k] = raw[k];
  }
  for (const k of ['lang', 'help']) {
    if (raw[k] === undefined) continue;
    if (typeof raw[k] !== 'string' || raw[k].includes('..') || /^[a-z]+:|^\//i.test(raw[k])) return bad('manifest', k);
    m[k] = raw[k].replace(/^\.\//, '');
  }
  // Fit for this app, last: a well-formed add-on for another app or API is "not for this app", not "broken".
  if (!m.apps.includes(app)) return { ok: false, reason: 'app', detail: m.apps.join(', '), manifest: m };
  if (!have || need[0] !== have[0]) return { ok: false, reason: need[0] > (have ? have[0] : 0) ? 'api-newer' : 'api-older', detail: m.api, manifest: m };
  if (need[1] > have[1]) return { ok: false, reason: 'api-newer', detail: m.api, manifest: m };
  return { ok: true, manifest: m, reason: '', detail: '' };
}

// ------------------------------------------------------------------ installed packages (IndexedDB)

/** {list(), get(id), put(pkg), del(id)} over IndexedDB "cadcraft-addons" (memory without IndexedDB). */
export function packageStore(factory = g.indexedDB) {
  if (!factory) {
    const mem = new Map();
    return { kind: 'memory', list: async () => [...mem.values()], get: async (id) => mem.get(id) || null, put: async (p) => { mem.set(p.id, p); }, del: async (id) => { mem.delete(id); } };
  }
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((resolve, reject) => {
    const req = factory.open('cadcraft-addons', 1);
    req.onupgradeneeded = () => { req.result.createObjectStore('packages', { keyPath: 'id' }); };
    req.onsuccess = () => { const db = req.result; db.onversionchange = () => { db.close(); dbp = null; }; resolve(db); };
    req.onerror = () => { dbp = null; reject(req.error); };
  }));
  const run = async (mode, fn) => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction('packages', mode);
      let out;
      t.oncomplete = () => resolve(out);
      t.onerror = () => reject(t.error);
      const r = fn(t.objectStore('packages'));
      if (r && 'onsuccess' in r) r.onsuccess = () => { out = r.result; };
    });
  };
  return {
    kind: 'idb',
    list: () => run('readonly', (s) => s.getAll()),
    get: async (id) => (await run('readonly', (s) => s.get(id))) || null,
    put: (p) => run('readwrite', (s) => { s.put(p); }),
    del: (id) => run('readwrite', (s) => { s.delete(id); }),
  };
}

// ------------------------------------------------------------------ module linking for installed packages

const IMPORT_RE = /(\bimport\s*\(\s*|\bimport\s+(?:[\w*{}\s,]+\s+from\s+)?|\bexport\s+(?:[\w*{}\s,]+\s+)?from\s+)(['"])(\.{1,2}\/[^'"\n]+)\2/g;

/** Resolve "./a/../b.js" against a folder path inside a package ("lib/x.js" + "../y.js" → "y.js"). null = leaves it. */
export function joinPath(fromFile, rel) {
  const parts = fromFile.split('/').slice(0, -1);
  for (const seg of rel.split('/')) {
    if (seg === '.' || seg === '') continue;
    if (seg === '..') { if (!parts.length) return null; parts.pop(); } else parts.push(seg);
  }
  return parts.join('/');
}

/**
 * Turn a package's files into URLs: every JS module's relative imports point at the other modules' blob: URLs. Modules
 * must form a tree or DAG (a circle cannot be linked through blob: URLs) → {urls: {path: url}, revoke()} or throws.
 * @param {Object<string, Blob|string|ArrayBuffer|Uint8Array>} files  path inside the package → contents
 */
export async function linkPackage(files, { createURL = (b) => URL.createObjectURL(b), revokeURL = (u) => URL.revokeObjectURL(u) } = {}) {
  const isJs = (p) => /\.m?js$/.test(p);
  const text = {};
  for (const [p, v] of Object.entries(files)) if (isJs(p)) text[p] = typeof v === 'string' ? v : await new Blob([v]).text();
  const deps = {};
  for (const [p, src] of Object.entries(text)) {
    deps[p] = [];
    for (const m of src.matchAll(IMPORT_RE)) {
      const target = joinPath(p, m[3]);
      if (target === null || !(target in files)) throw Object.assign(new Error(p + ' imports ' + m[3] + ', which is not in the add-on'), { code: 'link' });
      deps[p].push(target);
    }
  }
  const urls = {}, state = {};
  const made = [];
  const visit = (p, stack) => {
    if (state[p] === 2) return;
    if (state[p] === 1) throw Object.assign(new Error('modules import each other in a circle: ' + [...stack, p].join(' → ')), { code: 'link' });
    state[p] = 1;
    for (const d of deps[p] || []) if (isJs(d)) visit(d, [...stack, p]);
    let src = text[p];
    src = src.replace(IMPORT_RE, (all, head, q, rel) => head + q + urls[joinPath(p, rel)] + q);
    urls[p] = createURL(new Blob([src], { type: 'text/javascript' }));
    made.push(urls[p]);
    state[p] = 2;
  };
  for (const [p, v] of Object.entries(files)) {
    if (isJs(p)) continue;
    const type = /\.json$/.test(p) ? 'application/json' : /\.svg$/.test(p) ? 'image/svg+xml' : /\.wasm$/.test(p) ? 'application/wasm' : /\.css$/.test(p) ? 'text/css' : '';
    urls[p] = createURL(v instanceof Blob ? v : new Blob([v], { type }));
    made.push(urls[p]);
  }
  for (const p of Object.keys(text)) visit(p, []);
  return { urls, revoke: () => made.forEach((u) => { try { revokeURL(u); } catch { /* gone */ } }) };
}

// ------------------------------------------------------------------ the add-on's own strings

function fillText(text, vars) {
  return String(text).replace(/\{\{|\}\}|\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (m, k) => (m === '{{' ? '{' : m === '}}' ? '}' : vars && vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m));
}
function makeT(strings, locale) {
  let pr = null;
  return (key, vars = {}) => {
    const v = strings[key];
    if (v === undefined) return key;
    if (typeof v === 'string') return fillText(v, vars);
    const n = vars.n;
    if (n !== undefined && n !== null && typeof v['=' + n] === 'string') return fillText(v['=' + n], vars);
    let c = 'other';
    try { pr = pr || new Intl.PluralRules(locale); c = n === undefined || n === null ? 'other' : pr.select(Number(n)); } catch { c = 'other'; }
    return fillText(typeof v[c] === 'string' ? v[c] : v.other, vars);
  };
}

// ------------------------------------------------------------------ the loader

export class AddonLoader {
  /**
   * @param {object} o
   * @param {string} o.app                app slug
   * @param {string} o.apiVersion         the app's add-on API version ("1.0")
   * @param {Function} [o.makeApi]        (base, addon) → the API object given to activate()
   * @param {string} [o.appName]
   * @param {string|URL} [o.base]         where addons/ is (default: next to this file)
   * @param {object} [o.packages]         packageStore() (tests)
   * @param {object} [o.storage]          localStorage-like (tests)
   * @param {Function} [o.importer]       (url) → module (tests: default dynamic import)
   * @param {Function} [o.fetchJson]      (url) → object|null (tests)
   * @param {string} [o.locale]           page locale (default from the shell catalog)
   */
  constructor(o = {}) {
    if (!o.app || !/^[a-z0-9-]{1,40}$/.test(o.app)) throw new Error('AddonLoader needs the app slug.');
    if (!apiParts(o.apiVersion)) throw new Error('AddonLoader needs the app’s add-on API version.');
    this.app = o.app;
    this.appName = o.appName || this.app;
    this.apiVersion = String(o.apiVersion);
    this.makeApi = o.makeApi || ((base) => base);
    this.base = String(o.base || new URL('./addons/', import.meta.url));
    if (!this.base.endsWith('/')) this.base += '/';
    this.packages = o.packages || packageStore();
    this.storage = o.storage !== undefined ? o.storage : (() => { try { return g.localStorage || null; } catch { return null; } })();
    this.importer = o.importer || ((u) => import(/* @vite-ignore */ u));
    this.fetchJson = o.fetchJson || (async (u) => { try { const r = await fetch(u, { cache: 'no-cache' }); return r.ok ? await r.json() : null; } catch { return null; } });
    this.locale = o.locale || (typeof window !== 'undefined' && window.ccShellT && window.ccShellT.locale && window.ccShellT.locale()) || 'en';
    this.timeout = typeof o.timeout === 'number' ? o.timeout : ACTIVATE_TIMEOUT;
    this.entries = new Map();   // id → entry
    this.listeners = new Set();
    this.said = new Set();
  }

  static verify = async () => false;   // A.8 replaces this with the signature check

  get devMode() { try { return !!this.storage && this.storage.getItem('cc-addons-dev') === '1'; } catch { return false; } }
  prefs() {
    try { const v = JSON.parse((this.storage && this.storage.getItem('cc-addons:' + this.app)) || '{}'); return v && typeof v === 'object' && v.off && typeof v.off === 'object' ? v : { off: {} }; }
    catch { return { off: {} }; }
  }
  setOff(id, reason) {
    const p = this.prefs();
    if (reason) p.off[id] = reason; else delete p.off[id];
    try { this.storage && this.storage.setItem('cc-addons:' + this.app, JSON.stringify(p)); } catch { /* storage blocked */ }
  }

  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  changed() { for (const fn of this.listeners) { try { fn(this.list()); } catch { /* listener */ } } }

  /** Every add-on found, in load order. */
  list() {
    return [...this.entries.values()].map((e) => ({ id: e.id, name: e.manifest ? e.manifest.name : e.id, version: e.manifest ? e.manifest.version : '',
      source: e.source, state: e.state, reason: e.reason, detail: e.detail, manifest: e.manifest, reloadNeeded: !!e.reloadNeeded }));
  }

  /** Find, check and activate everything. Never throws. */
  async start() {
    if (this.started) return this.list();
    this.started = true;
    await this.discover();
    for (const e of this.entries.values()) if (e.state === 'ready') await this.activate(e);
    this.changed();
    this.mountSettings();
    return this.list();
  }

  async discover() {
    const add = (e) => { if (!this.entries.has(e.id)) this.entries.set(e.id, e); };
    // Bundled / edition folder.
    const index = await this.fetchJson(this.base + 'index.json');
    const names = index && Array.isArray(index.addons) ? index.addons.filter((n) => typeof n === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(n)) : [];
    for (const dir of names) {
      const root = this.base + dir + '/';
      const raw = await this.fetchJson(root + 'addon.json');
      add(this.entryFor(raw, { source: 'bundled', root, key: dir }));
    }
    // Installed.
    let pkgs = [];
    try { pkgs = await this.packages.list(); } catch { pkgs = []; }
    for (const pkg of pkgs) {
      const e = this.entryFor(pkg && pkg.manifest, { source: 'installed', pkg, key: pkg && pkg.id });
      if (e.state === 'ready') {
        let trusted = false;
        try { trusted = await AddonLoader.verify(pkg); } catch { trusted = false; }
        if (!trusted && !this.devMode) { e.state = 'refused'; e.reason = 'unsigned'; }
        else if (!trusted) e.unsigned = true;
      }
      add(e);
    }
  }

  entryFor(raw, { source, root = null, pkg = null, key }) {
    const r = checkManifest(raw, { app: this.app, apiVersion: this.apiVersion });
    const id = r.manifest && typeof r.manifest.id === 'string' && ID_RE.test(r.manifest.id) ? r.manifest.id : source + ':' + key;
    const e = { id, source, root, pkg, manifest: r.manifest, state: r.ok ? 'ready' : 'refused', reason: r.reason, detail: r.detail, cleanups: [], mod: null };
    if (r.ok) {
      const off = this.prefs().off[id];
      if (off) { e.state = 'off'; e.reason = off === 'user' ? '' : off; }
    }
    return e;
  }

  /** URL of a file of an add-on (folder URL, or its blob: URL once linked). */
  urlOf(e, p) {
    const clean = String(p || '').replace(/^\.\//, '');
    if (clean.includes('..')) return null;
    if (e.source === 'installed') return e.linked ? e.linked.urls[clean] || null : null;
    return new URL(clean, e.root).href;
  }

  async loadStrings(e) {
    if (!e.manifest.lang) return {};
    const want = [...new Set([this.locale, this.locale.split('-')[0], 'en'])];
    const out = {};
    for (const l of want.reverse()) {
      const u = this.urlOf(e, e.manifest.lang.replace(/\/?$/, '/') + l + '.json');
      const j = u ? await this.fetchJson(u) : null;
      if (j && typeof j === 'object') for (const [k, v] of Object.entries(j)) if (k[0] !== '@' && (typeof v === 'string' || (v && typeof v === 'object' && typeof v.other === 'string'))) out[k] = v;
    }
    return out;
  }

  baseApi(e, strings) {
    const prefix = 'cc-addon:' + this.app + ':' + e.id + ':';
    const st = this.storage;
    return {
      version: this.apiVersion,
      app: { slug: this.app, name: this.appName },
      addon: { id: e.id, name: e.manifest.name, version: e.manifest.version },
      t: makeT(strings, this.locale),
      url: (p) => this.urlOf(e, p),
      storage: {
        get(k) { try { const v = st && st.getItem(prefix + k); return v === null || v === undefined ? null : JSON.parse(v); } catch { return null; } },
        set(k, v) { try { st && st.setItem(prefix + k, JSON.stringify(v)); return true; } catch { return false; } },
        remove(k) { try { st && st.removeItem(prefix + k); } catch { /* blocked */ } },
      },
      onDeactivate: (fn) => { if (typeof fn === 'function') e.cleanups.push(fn); },
      log: (...a) => { try { console.info('[' + e.id + ']', ...a); } catch { /* no console */ } },
      help: (topics) => { try { if (typeof window !== 'undefined' && window.cadcraftHelp && window.cadcraftHelp.addTopics) window.cadcraftHelp.addTopics(e.id, topics); } catch { /* help panel */ } },
    };
  }

  /** Import and activate one add-on; on any failure switch it off with the reason. */
  async activate(e) {
    if (e.state === 'active') return true;
    const fail = (reason, error) => {
      e.state = 'failed';
      e.reason = reason;
      e.detail = (error && (error.message || String(error))) || '';
      this.setOff(e.id, 'failed');
      this.runCleanups(e);
      if (!this.said.has(e.id)) {
        this.said.add(e.id);
        const say = typeof window !== 'undefined' && window.ccShellScreen && window.ccShellScreen.say;
        if (say) say(T('shell.addons.failed.say', { name: e.manifest.name }));
      }
      try { console.warn('add-on ' + e.id + ' was switched off:', error); } catch { /* no console */ }
      this.changed();
      return false;
    };
    try {
      if (e.source === 'installed' && !e.linked) e.linked = await linkPackage(e.pkg.files || {});
      const entryUrl = this.urlOf(e, e.manifest.entry);
      if (!entryUrl) return fail('entry', new Error(e.manifest.entry));
      e.mod = await this.importer(entryUrl);
      if (!e.mod || typeof e.mod.activate !== 'function') return fail('entry', new Error('no activate()'));
      const strings = await this.loadStrings(e);
      const base = this.baseApi(e, strings);
      const api = this.makeApi(base, { id: e.id, manifest: e.manifest, source: e.source }) || base;
      e.api = api;
      let timer;
      const r = await Promise.race([
        Promise.resolve().then(() => e.mod.activate(api)),
        new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('activate() took longer than ' + Math.round(this.timeout / 1000) + ' s')), this.timeout); }),
      ]).finally(() => clearTimeout(timer));
      if (typeof r === 'function') e.cleanups.push(r);
      if (e.manifest.help) {
        try { const h = await this.importer(this.urlOf(e, e.manifest.help)); if (h && h.default) api.help ? api.help(h.default) : base.help(h.default); } catch { /* help is optional */ }
      }
      e.state = 'active';
      e.reason = e.unsigned ? 'unsigned-dev' : '';
      e.detail = '';
      this.changed();
      return true;
    } catch (error) {
      return fail(e.mod ? 'activate' : 'import', error);
    }
  }

  runCleanups(e) {
    const list = e.cleanups.splice(0).reverse();
    let ok = true;
    for (const fn of list) { try { fn(); } catch { ok = false; } }
    return ok;
  }

  /** Switch an add-on on or off (Settings › Add-ons). */
  async setEnabled(id, on) {
    const e = this.entries.get(id);
    if (!e || e.state === 'refused') return false;
    if (on) {
      this.setOff(id, null);
      e.state = 'ready';
      e.reason = '';
      e.mod = null;
      return this.activate(e);
    }
    this.setOff(id, 'user');
    if (e.state === 'active') {
      let full = true;
      try { if (e.mod && typeof e.mod.deactivate === 'function') await e.mod.deactivate(e.api); } catch { full = false; }
      const had = e.cleanups.length > 0 || (e.mod && typeof e.mod.deactivate === 'function');
      full = this.runCleanups(e) && full && had;
      e.reloadNeeded = !full;
    }
    e.state = 'off';
    e.reason = '';
    this.changed();
    return true;
  }

  // ---------------------------------------------------------------- installed packages (A.7 calls these)

  /** Install (or update) a package {manifest, files: {path: Blob|string}, signature?, source?}. → {ok, reason}. */
  async installPackage(pkg) {
    const r = checkManifest(pkg && pkg.manifest, { app: this.app, apiVersion: this.apiVersion });
    if (!r.ok) return { ok: false, reason: r.reason, detail: r.detail };
    if (!pkg.files || typeof pkg.files !== 'object' || !(r.manifest.entry in pkg.files)) return { ok: false, reason: 'entry' };
    for (const p of Object.keys(pkg.files)) if (p.includes('..') || p.startsWith('/') || /^[a-z]+:/i.test(p)) return { ok: false, reason: 'files', detail: p };
    try { await linkPackage(pkg.files, { createURL: () => 'blob:check', revokeURL: () => {} }); } catch (e) { return { ok: false, reason: 'link', detail: e.message }; }
    await this.packages.put({ id: r.manifest.id, manifest: pkg.manifest, files: pkg.files, signature: pkg.signature || null, source: pkg.source || null, installedAt: Date.now() });
    return { ok: true, id: r.manifest.id, reloadNeeded: true };
  }
  async uninstall(id) {
    const e = this.entries.get(id);
    if (e && e.state === 'active') await this.setEnabled(id, false);
    await this.packages.del(id);
    if (e && e.source === 'installed') { if (e.linked) e.linked.revoke(); this.entries.delete(id); }
    this.changed();
  }

  // ---------------------------------------------------------------- Settings › Add-ons

  /** Fill app-settings.inc's [data-addons-set] (General tab) with one row per add-on. Called by start(). */
  mountSettings(root = typeof document !== 'undefined' ? document.querySelector('[data-addons-set]') : null) {
    if (!root || this.mounted) return;
    this.mounted = true;
    const list = root.querySelector('[data-addons-list]');
    const render = () => {
      const rows = this.list();
      root.hidden = !rows.length && !this.devMode;
      list.replaceChildren(...rows.map((a) => this.row(a)));
      const dev = root.querySelector('[data-addons-dev]');
      if (dev) dev.hidden = !this.devMode;
    };
    this.on(render);
    render();
  }

  row(a) {
    const d = document;
    const el = (tag, attrs = {}, ...kids) => {
      const n = d.createElement(tag);
      for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined && v !== false) n.setAttribute(k, v === true ? '' : v);
      for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c);
      return n;
    };
    const m = a.manifest || {};
    const on = a.state === 'active' || a.state === 'ready';
    const status = a.state === 'refused' ? T('shell.addons.refused.' + (a.reason || 'manifest'), { app: this.appName, api: a.detail, apps: a.detail })
      : a.state === 'failed' ? T('shell.addons.failed', { reason: a.detail || a.reason })
        : a.state === 'off' && a.reason === 'failed' ? T('shell.addons.failed.before')
          : a.reloadNeeded ? T('shell.addons.reload')
            : a.reason === 'unsigned-dev' ? T('shell.addons.unsigned_dev') : '';
    const id = 'shell-addon-' + a.id.replace(/[^a-z0-9-]/g, '-');
    const box = el('input', { type: 'checkbox', id, 'data-addon-toggle': a.id, disabled: a.state === 'refused' });
    box.checked = on;
    box.addEventListener('change', async () => { box.disabled = true; await this.setEnabled(a.id, box.checked); });
    const perms = (m.permissions || []).map((p) => { const k = 'shell.addons.perm.' + p; const v = T(k); return v === k ? p : v; });
    return el('li', { class: 'shell-addon', 'data-addon': a.id, 'data-state': a.state },
      el('label', { class: 'shell-check', for: id }, box, ' ', el('strong', {}, a.name), ' ', el('span', { class: 'shell-addon-ver' }, a.version)),
      el('ul', { class: 'meta-items shell-addon-meta' },
        m.license ? el('li', {}, T('shell.addons.license', { license: m.license })) : null,
        el('li', {}, T('shell.addons.source.' + a.source)),
        perms.length ? el('li', {}, T('shell.addons.perms', { list: perms.join(', ') })) : null),
      m.description ? el('p', { class: 'shell-hint-text' }, m.description) : null,
      status ? el('p', { class: 'shell-addon-status', role: 'status' }, status) : null);
  }
}

// ------------------------------------------------------------------ the API every app shares (A.6)
// The shell's boot (assets/js/app-addons.js) uses it for every app; an app with its own loader (manifest "addons": "own",
// e.g. CadCraft's A.3) builds its API as { ...sharedApi(base, addon, registry), def, … }. registry = {importers: Map,
// exporters: Map, changed()}.

const shellMain = () => document.querySelector('body.app-shell > main');

/** The app's toolbar, the way app-settings.js finds it: <main>'s direct-child role=toolbar, else BimCraft's [data-toolbar]. */
export function findToolbar() {
  const m = shellMain();
  if (!m) return null;
  const direct = [...m.children].find((c) => c.getAttribute('role') === 'toolbar');
  return direct || m.querySelector('[data-toolbar][role="toolbar"]') || null;
}

/** The side panel on one side (by shape: an <aside> whose class ends in -left / -right), wherever it is now (panels window). */
export function findPanel(side = 'right') {
  const re = new RegExp('-' + side + '(\\s|$)');
  const m = shellMain();
  const here = m ? [...m.children].find((c) => c.tagName === 'ASIDE' && re.test(c.className)) : null;
  if (here) return here;
  const panels = window.ccShellPanels && window.ccShellPanels.panels ? window.ccShellPanels.panels() : [];
  const p = panels.find((x) => x.id === side && x.inWindow);
  if (p && window.ccShellPanels.window) {
    for (const n of window.ccShellPanels.windows ? window.ccShellPanels.windows() : [1]) {
      const w = window.ccShellPanels.window(n);
      const a = w && [...w.document.querySelectorAll('main.shell-pw-main > aside')].find((c) => re.test(c.className));
      if (a) return a;
    }
  }
  return null;
}

const SAFE_ID = /^[a-z0-9][a-z0-9-]{0,40}$/;
const iconClass = (icon) => (typeof icon === 'string' && /^bi-[a-z0-9-]{1,40}$/.test(icon) ? icon : 'bi-puzzle');

/** The shared API on top of the loader's base API. `track(fn)` registers a cleanup for when the add-on goes off. */
export function sharedApi(base, addon, registry) {
  const track = (fn) => base.onDeactivate(fn);
  const key = (id) => addon.id + ':' + id;
  const ui = {
    toolbarGroup({ id, label, tools = [] } = {}) {
      if (!SAFE_ID.test(String(id))) throw new Error('toolbarGroup: id');
      const tb = findToolbar();
      if (!tb) return null;
      const g0 = tb.querySelector(':scope > [role="group"]');
      const row0 = g0 && g0.querySelector('[class$="-tool-row"]');
      const btn0 = tb.querySelector('button:not([hidden])');
      const makeBtn = (t) => {
        if (!SAFE_ID.test(String(t.id))) throw new Error('toolbarGroup: tool id');
        const b = document.createElement('button');
        b.type = 'button';
        b.className = btn0 ? btn0.className.split(/\s+/).filter((c) => !/active|pressed|on$/.test(c)).join(' ') : '';
        b.setAttribute('data-addon-tool', key(t.id));
        b.title = String(t.title || t.label || '');
        b.setAttribute('aria-label', String(t.label || t.id));
        const i = document.createElement('i');
        i.className = 'bi ' + iconClass(t.icon);
        i.setAttribute('aria-hidden', 'true');
        b.append(i);
        const span0 = btn0 && [...btn0.children].find((c) => c.tagName === 'SPAN');
        const span = document.createElement('span');
        if (span0) span.className = span0.className;
        span.textContent = String(t.label || t.id);
        b.append(span);
        b.addEventListener('click', (e) => { e.stopPropagation(); try { t.run && t.run(); } catch (err) { base.log('tool failed', err); } });
        return b;
      };
      let el;
      if (g0 && row0) {
        el = document.createElement('div');
        el.className = g0.className;
        el.setAttribute('role', 'group');
        el.setAttribute('aria-label', String(label || addon.manifest.name));
        el.setAttribute('data-tb-key', 'addon:' + key(id));
        el.setAttribute('data-addon-group', key(id));
        const lab0 = g0.querySelector('[class$="-tool-label"]');
        if (lab0) { const l = document.createElement(lab0.tagName); l.className = lab0.className; l.setAttribute('aria-hidden', 'true'); l.textContent = String(label || addon.manifest.name); el.append(l); }
        const row = document.createElement('div');
        row.className = row0.className;
        tools.forEach((t) => row.append(makeBtn(t)));
        el.append(row);
        tb.append(el);
      } else {
        // A toolbar without groups (BimCraft): a separator and the buttons in a run of their own.
        el = document.createElement('span');
        el.className = 'shell-addon-run';
        el.setAttribute('data-addon-group', key(id));
        tools.forEach((t) => el.append(makeBtn(t)));
        tb.append(el);
      }
      track(() => el.remove());
      return el;
    },
    panelSection({ id, title, side = 'right', render } = {}) {
      if (!SAFE_ID.test(String(id))) throw new Error('panelSection: id');
      const p = findPanel(side === 'left' ? 'left' : 'right');
      if (!p) return null;
      const d = p.ownerDocument;
      const sec = d.createElement('section');
      sec.className = 'shell-addon-section';
      sec.setAttribute('data-addon-section', key(id));
      const h = d.createElement('h2');
      h.className = 'shell-addon-section-h';
      h.textContent = String(title || addon.manifest.name);
      const body = d.createElement('div');
      body.className = 'shell-addon-section-body';
      sec.append(h, body);
      p.append(sec);
      if (typeof render === 'function') { try { render(body); } catch (err) { sec.remove(); throw err; } }
      track(() => sec.remove());
      return body;
    },
    settingsSection({ id, title, render, reset } = {}) {
      if (!SAFE_ID.test(String(id))) throw new Error('settingsSection: id');
      const dlg = document.querySelector('[data-app-settings]');
      if (!dlg) return null;
      const pane = dlg.querySelector('[data-settings-pane="app"]') || dlg.querySelector('[data-settings-pane="general"]');
      const fs = document.createElement('fieldset');
      fs.className = 'shell-set shell-addon-set';
      fs.setAttribute('data-addon-settings', key(id));
      const lg = document.createElement('legend');
      lg.textContent = String(title || addon.manifest.name);
      fs.append(lg);
      pane.append(fs);
      if (typeof render === 'function') { try { render(fs); } catch (err) { fs.remove(); throw err; } }
      const onReset = () => { try { reset && reset(); } catch (err) { base.log('reset failed', err); } };
      dlg.addEventListener('cc-settings-reset', onReset);
      track(() => { fs.remove(); dlg.removeEventListener('cc-settings-reset', onReset); });
      return fs;
    },
  };
  const exts = (list) => (Array.isArray(list) ? list : [list]).map((e) => '.' + String(e).replace(/^\./, '').toLowerCase()).filter((e) => /^\.[a-z0-9]{1,12}$/.test(e));
  const files = {
    importer({ id, label, extensions, read } = {}) {
      if (!SAFE_ID.test(String(id)) || typeof read !== 'function') throw new Error('importer: id and read()');
      const entry = { id: key(id), addon: addon.id, label: String(label || id), extensions: exts(extensions), read };
      if (!entry.extensions.length) throw new Error('importer: extensions');
      registry.importers.set(entry.id, entry);
      registry.changed();
      track(() => { registry.importers.delete(entry.id); registry.changed(); });
      return entry;
    },
    exporter({ id, label, extension, mime, write } = {}) {
      if (!SAFE_ID.test(String(id)) || typeof write !== 'function') throw new Error('exporter: id and write()');
      const entry = { id: key(id), addon: addon.id, label: String(label || id), extension: exts(extension)[0] || '', mime: typeof mime === 'string' ? mime : 'application/octet-stream', write };
      if (!entry.extension) throw new Error('exporter: extension');
      registry.exporters.set(entry.id, entry);
      registry.changed();
      track(() => { registry.exporters.delete(entry.id); registry.changed(); });
      return entry;
    },
  };
  return { ...base, ui, files };
}


export default AddonLoader;
