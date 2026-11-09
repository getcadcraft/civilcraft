/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — every word a person reads comes from `t` (the shell's ccShellT) or from the add-on; the fallbacks are English. */
/**
 * app-addons-account.js — add-ons that follow the account (0.8 round 3, AL.4 / AL.5 / AL.6 / AL.7 / AL.9 / AL.11 / AL.13 client side;
 * docs/0.8-ADDON-LIBRARY-SPEC.md §3, §5.4, §6, §7). DOM-free core (the Settings panel at the bottom is the only part that touches a page),
 * every outside thing injected so Node tests run it whole: tools/addons-test/account-client.mjs.
 *
 *   const acc = new AddonsAccount({ app, edition, base, token, fetch, storage, packages, engines, now, firstParty })
 *   await acc.sync()                 → { ok, offline, items }      GET /api/v1/account/addons?edition=&app= ; the last answer is cached
 *   await acc.ensure('fire-sprinklers')  → { ok, installed: [...] } fetches the add-on and every engine/add-on it needs, on FIRST NEED,
 *                                      checks SHA-256 + Ed25519 signature on each, then installs all of them or none (all-or-nothing)
 *   acc.policy()                     → what this edition may download (Apple: content only; §6)
 *   await acc.checkUpdates()         → { auto: [...], confirm: [...] }  same major + same permissions = auto; else asks
 *   await acc.applyUpdates(ids)      → whole set swapped together; the previous set is kept for rollBack()
 *   await acc.rollBack(ids)          → the previous versions return
 *   await acc.gc()                   → engines nothing needs and removed add-ons older than 30 days are freed
 *   recordUsed(doc, id, version) / usedBy(doc) / missingFor(doc, have) → AL.6 "This file uses …" (the data is never lost: pass-through)
 *   migrateBundled(ids, { prefs })   → AL.8: what a person had switched on becomes their account list entries (source 'migration')
 *
 * Wire shapes it expects from the resolved list (AccountAddons::resolve; `package` arrives with addon-library_PART_3's AL.4 step):
 *   item = { id, kind, class, name, needs: [{id, range}], source, pin, size_bytes, available, how, why, firstParty?,
 *            package: { url, version, sha256, size, signature? } }
 *   `kind` is 'addon' | 'engine' | 'content' kinds; `class` is 'code' or 'content' (§6). Until the server fills `package`, ensure() answers
 *   { ok:false, reason:'no-package' } and nothing is fetched.
 */

export const SYNC_EVERY_MS = 3 * 60 * 60 * 1000;      // "every few hours while open"
const TRY_EVERY_MS = 5 * 60 * 1000;                // one try in five minutes, whatever the answer (a 401 never stamps syncedAt)
export const GRACE_MS = 30 * 24 * 60 * 60 * 1000;     // a removed add-on's cache is freed after 30 days (§3.1)
export const MAX_DEPTH = 5;                           // §3.5: at most five levels deep
/** 2026-11-09: offline = navigator.onLine false, or this page came from the saved offline copy (sw.js adds a `cc-offline-copy` Server-Timing entry; onLine can stay true with the network gone). */
function pageOffline() {
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
    const nav = typeof performance !== 'undefined' && performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
    return !!(nav && Array.isArray(nav.serverTiming) && nav.serverTiming.some((t) => t.name === 'cc-offline-copy'));
  } catch { return false; }
}
const KEY = 'cc-addons-account:';

// ------------------------------------------------------------------------------------------------ versions and ranges

export function parseVersion(v) {
  const m = /^(\d+)\.(\d+)(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?$/.exec(String(v == null ? '' : v).trim());
  return m ? { major: +m[1], minor: +m[2], patch: +(m[3] || 0), pre: m[4] || '' } : null;
}
export function compareVersions(a, b) {
  const x = parseVersion(a), y = parseVersion(b);
  if (!x || !y) return 0;
  for (const k of ['major', 'minor', 'patch']) if (x[k] !== y[k]) return x[k] < y[k] ? -1 : 1;
  if (x.pre === y.pre) return 0;
  if (!x.pre) return 1;           // a release is newer than its pre-release
  if (!y.pre) return -1;
  return x.pre < y.pre ? -1 : 1;
}
/** Caret by default ("1.2" = ^1.2.0); also "~1.2", ">=1.2", exact "=1.2.3" / "1.2.3", "*". */
export function satisfies(version, range) {
  const v = parseVersion(version);
  if (!v) return false;
  const r = String(range == null || range === '' ? '*' : range).trim();
  if (r === '*') return true;
  let m = /^>=\s*(.+)$/.exec(r);
  if (m) return compareVersions(version, m[1]) >= 0;
  m = /^=\s*(.+)$/.exec(r);
  if (m) return compareVersions(version, m[1]) === 0;
  m = /^~\s*(.+)$/.exec(r);
  if (m) { const b = parseVersion(m[1]); return !!b && compareVersions(version, m[1]) >= 0 && v.major === b.major && v.minor === b.minor; }
  m = /^\^?\s*(\d.*)$/.exec(r);
  if (!m) return false;
  const b = parseVersion(m[1]);
  if (!b) return false;
  if (compareVersions(version, m[1]) < 0) return false;
  if (b.major > 0) return v.major === b.major;
  if (b.minor > 0) return v.major === 0 && v.minor === b.minor;
  return v.major === 0 && v.minor === 0 && v.patch === b.patch;
}
/** The newest of `versions` that satisfies EVERY range (one version per id, §3.5). → version string or null. */
export function pickVersion(versions, ranges) {
  const ok = (versions || []).filter((v) => parseVersion(v) && (ranges || []).every((r) => satisfies(v, r)));
  ok.sort(compareVersions);
  return ok.length ? ok[ok.length - 1] : null;
}

// ------------------------------------------------------------------------------------------------ edition policy (§6)

/**
 * What an edition may DOWNLOAD. Native code is never downloaded anywhere (rule 44), so there is no flag for it.
 * Apple's App Store build downloads content only: first-party code is already in the binary and is only switched on / lazy-loaded.
 */
export function editionPolicy(edition) {
  const e = String(edition || 'web');
  if (e === 'apple_store') return { downloadCode: false, downloadContent: true, bundledFirstPartyCode: true, outsideAuthorCode: false, jsWasmOnly: true };
  if (e === 'android_store') return { downloadCode: true, downloadContent: true, bundledFirstPartyCode: false, outsideAuthorCode: true, jsWasmOnly: true };
  return { downloadCode: true, downloadContent: true, bundledFirstPartyCode: false, outsideAuthorCode: true, jsWasmOnly: false };
}
/** Could this item run here, and how? → { ok, how: 'download' | 'bundled' | 'content' | 'refused', why } */
export function deliveryFor(item, edition, bundledIds = []) {
  const p = editionPolicy(edition);
  const content = item.class === 'content';
  if (content) return p.downloadContent ? { ok: true, how: 'content' } : { ok: false, how: 'refused', why: 'content' };
  if (p.downloadCode) return { ok: true, how: 'download' };
  if (bundledIds.includes(item.id) && item.firstParty !== false) return { ok: true, how: 'bundled' };
  return { ok: false, how: 'refused', why: item.firstParty === false ? 'outside-author-not-on-apple' : 'not-in-this-build' };
}

// ------------------------------------------------------------------------------------------------ the client

const memStore = () => { const m = new Map(); return { kind: 'memory', list: async () => [...m.values()], get: async (id) => m.get(id) || null, put: async (p) => { m.set(p.id, p); }, del: async (id) => { m.delete(id); } }; };
/** A store that survives a reload (IndexedDB, one object store, key = record.id). Without IndexedDB (Node tests) it is the memory store. */
export function idbStore(name, factory = globalThis.indexedDB) {
  if (!factory) return memStore();
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((resolve, reject) => {
    const req = factory.open(name, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore('r', { keyPath: 'id' }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => { dbp = null; reject(req.error); };
  }));
  const run = async (mode, fn) => { const db = await open(); return new Promise((resolve, reject) => { const t = db.transaction('r', mode); let out; t.oncomplete = () => resolve(out); t.onerror = () => reject(t.error); const r = fn(t.objectStore('r')); if (r && 'onsuccess' in r) r.onsuccess = () => { out = r.result; }; }); };
  return { kind: 'idb', list: () => run('readonly', (s) => s.getAll()), get: async (id) => (await run('readonly', (s) => s.get(id))) || null, put: (p) => run('readwrite', (s) => { s.put(p); }), del: (id) => run('readwrite', (s) => { s.delete(id); }) };
}
const memStorage = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); } }; };

export class AddonsAccount {
  /**
   * @param {object} o
   * @param {string} o.app          app slug
   * @param {string} o.edition      web | desktop | ms_store | android_store | apple_store | custom (AddonLibrary::EDITIONS)
   * @param {string} [o.base]       site origin ('' = same origin)
   * @param {string} [o.token]      device token (Studio, portable, SuperCad); the browser apps use the session cookie
   * @param {Function} [o.fetch]    fetch
   * @param {object} [o.storage]    localStorage-like: the cached list, the local (signed-out) list, the update state
   * @param {object} [o.packages]   {list,get,put,del} add-on package store (the loader's packageStore(): same IndexedDB the loader reads)
   * @param {object} [o.engines]    {list,get,put,del} engine store, keys 'engine.id@1.2.0' (shared by every add-on and app, one copy)
   * @param {object} [o.trust]      { readPackageJson, verifyPackage, sha256Hex, bytesOf } (addons-trust.js; injected so Node tests need no import path)
   * @param {string[]} [o.bundledIds] code add-ons shipped in this build (Apple)
   * @param {Function|object} [o.fields]  field packs (FL.0, D-FL2): window.ccFields or a function returning it; after every good sync the account list's `field.*` items are applied (installed here, the gone ones removed)
   * @param {Function} [o.now]
   */
  constructor(o = {}) {
    if (!o.app) throw new Error('AddonsAccount needs the app slug.');
    this.app = o.app; this.edition = o.edition || 'web'; this.base = (o.base || '').replace(/\/$/, ''); this.token = o.token || '';
    this.fetch = o.fetch || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
    this.storage = o.storage || (() => { try { return globalThis.localStorage || memStorage(); } catch { return memStorage(); } })();   // the list is remembered across reloads (offline start)
    this.packages = o.packages || memStore(); this.packagesGiven = !!o.packages;
    this.engines = o.engines || idbStore('cadcraft-addon-engines');   // downloaded engine packages: one copy per id@version, kept across reloads
    this.history = o.history || idbStore('cadcraft-addon-history');   // the version before an update, for Roll back (whole packages: too big for localStorage)
    this.trust = o.trust || null;
    this.bundledIds = o.bundledIds || [];
    this.fields = o.fields === undefined ? (() => (typeof window !== 'undefined' ? window.ccFields : null)) : o.fields;
    this.now = o.now || (() => Date.now());
    this.session = o.session || null;   // sessionStorage-like: the browser apps' token from /library/connect lives for the tab only
    if (!this.token && this.session) { try { this.token = this.session.getItem(KEY + this.app + ':token') || ''; } catch { /* blocked */ } }
    this.items = this.#load('list', []);
    this.listeners = new Set();
    this.#licenses();
  }

  /** Hand the list (and its signed entitlements) to the add-on host's api.license (app-addon-license.js, AL.15). Never throws. */
  #licenses() { try { if (typeof globalThis.ccAddonLicenseSet === 'function') globalThis.ccAddonLicenseSet(this.items); } catch { /* host */ } }

  #load(k, d) { try { const v = this.storage.getItem(KEY + this.edition + ':' + k); return v ? JSON.parse(v) : d; } catch { return d; } }
  #save(k, v) { try { this.storage.setItem(KEY + this.edition + ':' + k, JSON.stringify(v)); } catch { /* storage blocked: the list is just not remembered */ } }
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  #changed() { for (const fn of this.listeners) { try { fn(this.items); } catch { /* listener */ } } }
  policy() { return editionPolicy(this.edition); }
  #headers(extra) { return { Accept: 'application/json', ...(this.token ? { Authorization: 'Bearer ' + this.token } : {}), ...(extra || {}) }; }

  // ------------------------------------------------------------------------------------------ sync (AL.4)

  /** Ask the server for the resolved list; offline (or signed out) the last answer / the device's own list stands. Never throws. */
  async sync() {
    const lastAt = this.#load('syncedAt', 0);
    this.#save('triedAt', this.now());   // a signed-out or closed answer must not make due() true again at once (app-fields re-renders after every sync)
    if (!this.fetch) return { ok: false, offline: true, items: this.items };
    // /api/v1 takes a Bearer token only (no session cookie): with no token there is nothing to ask, and asking would put a 401 in every page's console
    if (!this.token && !this.base && typeof document !== 'undefined') return { ok: false, signedOut: true, items: this.items, local: this.localList() };
    try {
      const r = await this.fetch(this.base + '/api/v1/account/addons?edition=' + encodeURIComponent(this.edition) + '&app=' + encodeURIComponent(this.app),
        { headers: this.#headers(), credentials: this.token ? 'omit' : 'same-origin', cache: 'no-cache' });
      if (!r.ok) await r.text().catch(() => '');   // read the body: an unread one keeps the request open (a page never reaches network idle)
      if (r.status === 401 || r.status === 403) return { ok: false, signedOut: true, items: this.items, local: this.localList() };
      if (r.status === 404) return { ok: false, closed: true, items: this.items };   // the library is not open yet (ADDON_LIBRARY_PUBLIC)
      if (!r.ok) throw new Error('status ' + r.status);
      const j = await r.json();
      const items = j && j.data && Array.isArray(j.data.items) ? j.data.items : null;
      if (!items) throw new Error('shape');
      this.items = items; this.#save('list', items); this.#save('syncedAt', this.now());
      this.#licenses();
      this.#changed();
      const fields = await this.applyFields();
      return { ok: true, items, lastAt, fields };
    } catch {
      return { ok: false, offline: true, items: this.items, lastAt };   // offline: only what the cached set already holds can be switched on
    }
  }
  /**
   * D-FL2: a field pack added once in the Library follows the account into every app. The pack ids on the list (`field.*`, kind 'field') go to ccFields.apply,
   * which installs the missing ones here and removes the ones it installed from the account that are gone. Never throws; null when this app has no Field packs panel.
   */
  async applyFields() {
    try {
      const F = typeof this.fields === 'function' ? this.fields() : this.fields;
      if (!F || typeof F.apply !== 'function') return null;
      const ids = this.items.filter((i) => i && i.kind === 'field' && /^field\.[a-z][a-z0-9-]{1,40}$/.test(String(i.id))).map((i) => i.id);
      return await F.apply(ids);
    } catch { return null; }
  }
  /** Sync when it is due (start, then every few hours while open). */
  due() { return this.now() - this.#load('syncedAt', 0) >= SYNC_EVERY_MS && this.now() - this.#load('triedAt', 0) >= TRY_EVERY_MS; }

  /** The token a browser app gets from /library/connect (this tab only). `null` forgets it. */
  setToken(t) {
    this.token = t || '';
    if (this.session) { try { if (t) this.session.setItem(KEY + this.app + ':token', t); else this.session.removeItem(KEY + this.app + ':token'); } catch { /* blocked */ } }
    this.#changed();
  }
  signedIn() { return !!this.token; }
  /**
   * Already signed in to the site in this browser? Ask the site (same origin, no popup) for the tab's key. Only for the browser apps; Studio and the
   * portable build use deviceSignIn. Nothing is asked when a key is held. → { ok, synced } | { ok:false, reason }. Never throws.
   */
  async autoConnect() {
    if (this.token) return { ok: true, already: true };
    if (this.edition === 'desktop' || this.base) return { ok: false, reason: 'not-here' };
    if (pageOffline()) return { ok: false, reason: 'offline' };   // a saved offline copy asks nothing of the site
    try {
      const r = await this.fetch('/api/library/connect-auto', { method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded', 'X-CC-Connect': '1' }, body: 'app=' + encodeURIComponent(this.app) });
      const j = await r.json();
      const d = j && j.data;
      if (!d || !d.signedIn || !/^ccu_[A-Za-z0-9]{20,}$/.test(String(d.token))) return { ok: false, reason: 'signed-out' };
      this.setToken(d.token);
      const s = await this.sync();
      return { ok: !!s.ok, synced: s };
    } catch { return { ok: false, reason: 'offline' }; }
  }
  /** A page that made the account early (app-fields.js) gets what the add-on host owns: the package store, the trust check and the tab's token. Fills only what is missing. */
  attach({ packages, trust, session } = {}) {
    if (packages && !this.packagesGiven) { this.packages = packages; this.packagesGiven = true; }
    if (trust && !this.trust) this.trust = trust;
    if (session && !this.session) { this.session = session; if (!this.token) { try { this.token = session.getItem(KEY + this.app + ':token') || ''; } catch { /* blocked */ } } }
    return this;
  }
  /**
   * Sign this tab in to the account's list: opens /library/connect?app= (the page that mints the token and posts it back, same origin only), waits for the
   * message, keeps the token for the tab and syncs. `win` = the window to listen on and open from (a test hands a stand-in).
   */
  connect(win = typeof window !== 'undefined' ? window : null) {
    if (!win || typeof win.open !== 'function') return Promise.resolve({ ok: false, reason: 'no-window' });
    return new Promise((resolve) => {
      let done = false, timer = null;
      const finish = (r) => { if (done) return; done = true; win.removeEventListener('message', onMsg); if (timer) clearTimeout(timer); resolve(r); };
      const onMsg = async (ev) => {
        const d = ev && ev.data;
        if (!d || d.type !== 'cadcraft-library-token' || d.app !== this.app || typeof d.token !== 'string' || !/^ccu_[A-Za-z0-9]{20,}$/.test(d.token)) return;
        if (ev.origin && win.location && ev.origin !== win.location.origin) return;
        this.setToken(d.token);
        const s = await this.sync();
        finish({ ok: !!s.ok, synced: s });
      };
      win.addEventListener('message', onMsg);
      const w = win.open(this.base + '/library/connect?app=' + encodeURIComponent(this.app), 'cc-account-connect', 'popup,width=520,height=640');
      if (!w) { finish({ ok: false, reason: 'blocked' }); return; }
      timer = setTimeout(() => finish({ ok: false, reason: 'timeout' }), 5 * 60 * 1000);
    });
  }

  /**
   * Sign in WITHOUT a popup (0.8 AL.7): Studio, the portable build and SuperCad Studio cannot open /library/connect in a window and wait for a message,
   * so they use the site's device flow (RFC 8628, POST /api/v1/device/code + /token, the same one the sync uses). `show({url, code})` tells the
   * person where to approve (Studio opens the system browser, a phone shows the code); `wait(ms)` is the pause between polls (a test hands a fast one).
   * The token is kept for the tab like the popup's, then the list is synced. → { ok, synced } or { ok:false, reason }.
   */
  async deviceSignIn({ show = () => {}, wait = (ms) => new Promise((r) => setTimeout(r, ms)), clientName = 'CadCraft Studio' } = {}) {
    if (!this.fetch) return { ok: false, reason: 'offline' };
    const post = async (path, body) => {
      const r = await this.fetch(this.base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      let j = null; try { j = await r.json(); } catch { j = null; }
      return { status: r.status, j };
    };
    let start;
    try { start = await post('/api/v1/device/code', { client_name: clientName }); } catch { return { ok: false, reason: 'offline' }; }
    const d = start.j && start.j.data;
    if (!d || !d.device_code) return { ok: false, reason: start.status === 429 ? 'busy' : 'start' };
    show({ url: d.verification_uri_complete || d.verification_uri, code: d.user_code });
    let every = Math.max(1, Number(d.interval) || 5) * 1000;
    const until = this.now() + Math.min(Number(d.expires_in) || 600, 900) * 1000;
    for (;;) {
      await wait(every);
      if (this.now() > until) return { ok: false, reason: 'timeout' };
      let r;
      try { r = await post('/api/v1/device/token', { device_code: d.device_code }); } catch { continue; }
      if (r.status === 200 && r.j && r.j.data && /^ccu_[A-Za-z0-9]{20,}$/.test(String(r.j.data.access_token))) {
        this.setToken(r.j.data.access_token);
        const s = await this.sync();
        return { ok: !!s.ok, synced: s };
      }
      const code = r.j && r.j.code;
      if (code === 'authorization_pending') continue;
      if (code === 'slow_down') { every += 5000; continue; }
      return { ok: false, reason: code === 'access_denied' ? 'denied' : code === 'expired_token' ? 'timeout' : 'failed' };
    }
  }

  // the device's own list while signed out (§3.2); merged into the account at sign-in
  localList() { return this.#load('local', []); }
  addLocal(id, opts = {}) { const l = this.localList().filter((e) => e.id !== id); l.push({ id, channel: opts.channel || 'stable', source: opts.source || 'app', added_at: this.now() }); this.#save('local', l); this.#changed(); return l; }
  removeLocal(id) { const l = this.localList().filter((e) => e.id !== id); this.#save('local', l); this.#changed(); return l; }
  async mergeLocal() {
    const list = this.localList();
    if (!list.length || !this.fetch) return { ok: true, merged: 0 };
    try {
      const r = await this.fetch(this.base + '/api/v1/account/addons/merge', { method: 'POST', headers: this.#headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ list }) });
      if (!r.ok) return { ok: false, status: r.status };
      this.#save('local', []);
      return { ok: true, merged: list.length };
    } catch { return { ok: false, offline: true }; }
  }

  /** Add/Remove through the API (the Browse list's buttons). Signed out: the device's own list. */
  async add(id) {
    if (!this.fetch) return { ok: false, offline: true };
    try {
      const r = await this.fetch(this.base + '/api/v1/account/addons', { method: 'POST', headers: this.#headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ action: 'add', id }) });
      if (r.status === 401 || r.status === 403) { this.addLocal(id); return { ok: true, local: true }; }
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return { ok: false, message: j.message || '', code: (j.data && j.data.code) || j.code || '' };
      await this.sync();
      return { ok: true, added: (j.data && j.data.added) || [] };
    } catch { return { ok: false, offline: true }; }
  }
  async remove(id) {
    if (!this.fetch) return { ok: false, offline: true };
    try {
      const r = await this.fetch(this.base + '/api/v1/account/addons', { method: 'POST', headers: this.#headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ action: 'remove', id }) });
      if (r.status === 401 || r.status === 403) { this.removeLocal(id); return { ok: true, local: true }; }
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return { ok: false, message: j.message || '', dependents: (j.data && j.data.dependents) || [] };   // "Piping is used by …"
      this.#markRemoved(id);
      await this.sync();
      return { ok: true, orphans: (j.data && j.data.orphans) || [] };
    } catch { return { ok: false, offline: true }; }
  }
  /**
   * AL.6: a file was opened. → { missing:[{id,version,name,listed}], text } — what it uses that is not usable here. `listed` = on the account list but not
   * fetched/switched on yet; the other is not on the list at all. The file's data is never touched (pass-through). `have` = ids the app has switched on.
   */
  noteFile(doc, have = []) {
    const loaded = new Set(have || []);
    const listed = new Map(this.items.map((i) => [i.id, i]));
    const missing = missingFor(doc, loaded).map((u) => ({ ...u, name: (listed.get(u.id) && listed.get(u.id).name) || u.id, listed: listed.has(u.id) }));
    const names = {}; for (const m of missing) names[m.id] = m.name;
    return { missing, text: offerText(missing, names) };
  }
  /** AL.6: "Add it" — everything the file names goes on the list (the whole set comes with it), then is fetched and checked. */
  async addForFile(missing) {
    const out = { ok: true, added: [], failed: [] };
    for (const m of missing || []) {
      let r = m.listed ? { ok: true } : await this.add(m.id);
      if (r.ok) r = await this.ensure(m.id);
      if (r.ok) out.added.push(m.id); else { out.ok = false; out.failed.push({ id: m.id, reason: r.reason || r.message || r.code || 'failed' }); }
    }
    return out;
  }

  async #act(body) {
    if (!this.fetch) return { ok: false, offline: true };
    try {
      const r = await this.fetch(this.base + '/api/v1/account/addons', { method: 'POST', headers: this.#headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(body) });
      if (r.status === 401 || r.status === 403) return { ok: false, signedOut: true };
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return { ok: false, message: j.message || '', code: (j.data && j.data.code) || j.code || '' };
      await this.sync();
      return { ok: true };
    } catch { return { ok: false, offline: true }; }
  }
  /** AL.11: pin an add-on to one version (null = follow the newest again). Needs the account: a pin lives on the list. */
  pin(id, version = null) { return this.#act({ action: 'pin', id, ...(version ? { version: String(version) } : {}) }); }
  /** AL.11: stable (default) or lab for one add-on. */
  setChannel(id, channel) { return this.#act({ action: 'channel', id, channel: channel === 'lab' ? 'lab' : 'stable' }); }
  /**
   * AL.11: what to do after a sync. The automatic ones (same major, same permissions, stable, not pinned elsewhere) are applied together, all-or-nothing;
   * the ones that need a yes are only returned. → { applied: [ids], ask: [updates], failed? }
   */
  async autoUpdate() {
    const u = await this.checkUpdates();
    if (!u.auto.length) return { applied: [], ask: u.confirm };
    const r = await this.applyUpdates(u.auto.map((x) => x.id));
    return r.ok ? { applied: u.auto.map((x) => x.id), ask: u.confirm } : { applied: [], ask: u.confirm, failed: { id: r.id, reason: r.reason } };
  }
  #markRemoved(id) { const rm = this.#load('removed', {}); rm[id] = this.now(); this.#save('removed', rm); }

  // ------------------------------------------------------------------------------------------ the needs closure (AL.5)

  /** The item and everything it needs, engines first, one version per id. → { ok, order: [item…], conflict } */
  closure(id, items = this.items) {
    const byId = new Map(items.map((i) => [i.id, i]));
    const order = [], seen = new Set(), stack = [];
    const ranges = new Map();   // id → every range asked for (so a conflict can be explained)
    const visit = (cur, depth, via) => {
      if (depth > MAX_DEPTH) return { ok: false, reason: 'depth', id: cur };
      if (stack.includes(cur)) return { ok: false, reason: 'cycle', id: cur };
      const it = byId.get(cur);
      if (!it) return { ok: false, reason: 'unknown', id: cur, via };
      if (seen.has(cur)) return { ok: true };
      stack.push(cur);
      for (const n of it.needs || []) {
        if (!n || !n.id) continue;
        (ranges.get(n.id) || ranges.set(n.id, []).get(n.id)).push({ by: cur, range: n.range || '*' });
        const r = visit(n.id, depth + 1, cur);
        if (!r.ok) { stack.pop(); return r; }
      }
      stack.pop(); seen.add(cur); order.push(it);
      return { ok: true };
    };
    const r = visit(id, 1, null);
    if (!r.ok) return { ok: false, ...r };
    for (const it of order) {                         // one version per id: the version the list resolved must satisfy every range asked
      const asked = ranges.get(it.id) || [];
      const v = it.package && it.package.version;
      const bad = v && asked.find((a) => !satisfies(v, a.range));
      if (bad) return { ok: false, reason: 'conflict', id: it.id, version: v, by: bad.by, range: bad.range };
    }
    order.sort((x, y) => (y.kind === 'engine') - (x.kind === 'engine'));   // engines first (they need nothing but engines; sort is stable)
    return { ok: true, order };
  }
  /** A conflict in words, with the ways out (§3.5). */
  explain(c, t = defaultT) {
    if (!c || c.ok) return '';
    if (c.reason === 'conflict') return t('addons.account.conflict', '{id} {version} is not what {by} asked for ({range}). Ask your team owner, or keep the earlier version of {by}.', c);
    if (c.reason === 'cycle') return t('addons.account.cycle', '{id} needs itself, so it was not added.', c);
    if (c.reason === 'depth') return t('addons.account.depth', '{id} sits more than five levels deep, so it was not added.', c);
    return t('addons.account.unknown', '{id} is not in your list yet.', c);
  }

  // ------------------------------------------------------------------------------------------ fetch on first need, verify, all-or-nothing

  /** Is the item (at the resolved version) in the cache? */
  async cached(item) {
    const v = item.package && item.package.version;
    if (!v) return null;
    const rec = item.kind === 'engine' ? await this.engines.get(item.id + '@' + v) : await this.packages.get(item.id);
    return rec && rec.manifest && rec.manifest.version === v ? rec : null;
  }

  async #fetchOne(item) {
    const pk = item.package;
    if (!pk || !pk.url) return { ok: false, reason: 'no-package', id: item.id };
    const d = deliveryFor(item, this.edition, this.bundledIds);
    if (!d.ok) return { ok: false, reason: d.why || 'refused', id: item.id };
    if (d.how === 'bundled') return { ok: true, id: item.id, bundled: true };
    if (!this.fetch || !this.trust) return { ok: false, reason: 'offline', id: item.id };
    let res;
    try { res = await this.fetch(new URL(pk.url, this.base || 'http://x').pathname === pk.url && this.base ? this.base + pk.url : pk.url, { headers: this.#headers(), credentials: 'same-origin', cache: 'force-cache' }); } catch { return { ok: false, reason: 'offline', id: item.id }; }
    if (!res.ok) return { ok: false, reason: 'fetch-' + res.status, id: item.id };
    const raw = new Uint8Array(await res.arrayBuffer());
    if (pk.sha256) {
      const h = await this.trust.sha256Hex(raw);
      if (h !== String(pk.sha256).toLowerCase()) return { ok: false, reason: 'hash', id: item.id };   // the list said one thing, the bytes are another
    } else if (item.class !== 'content') return { ok: false, reason: 'no-hash', id: item.id };
    let obj; try { obj = JSON.parse(new TextDecoder().decode(raw)); } catch { return { ok: false, reason: 'unreadable', id: item.id }; }
    const read = this.trust.readPackageJson(obj);
    if (!read.ok) return { ok: false, reason: 'unreadable', id: item.id };
    const pkg = read.pkg;
    if (pkg.manifest.id !== item.id || pkg.manifest.version !== pk.version) return { ok: false, reason: 'mismatch', id: item.id };
    const v = await this.trust.verifyPackage(pkg);
    if (!v.ok) return { ok: false, reason: 'signature:' + v.reason, id: item.id };               // code AND engines: signed by getcadcraft.com or not at all
    return { ok: true, id: item.id, item, pkg, size: raw.length };
  }

  /**
   * Fetch and install the item and its closure on first need. All packages are fetched and verified BEFORE any is written: one bad hash
   * leaves the cache exactly as it was (§3.5 all-or-nothing). Already-cached versions are not fetched again.
   */
  async ensure(id) {
    const c = this.closure(id);
    if (!c.ok) return { ok: false, reason: c.reason, closure: c };
    return this.#installSet(c.order);
  }
  /**
   * The same for several items at once (an update of the whole set): the union of their closures, every package fetched and verified BEFORE any is written,
   * then written together; a write that fails puts every store back as it was. → { ok, installed, already } or { ok:false, reason, id }.
   */
  async ensureMany(ids) {
    const order = [], seen = new Set();
    for (const id of ids) {
      const c = this.closure(id);
      if (!c.ok) return { ok: false, reason: c.reason, id, closure: c, installed: [] };
      for (const it of c.order) if (!seen.has(it.id)) { seen.add(it.id); order.push(it); }
    }
    return this.#installSet(order);
  }
  async #installSet(order) {
    const want = [];
    for (const it of order) if (!(await this.cached(it))) want.push(it);
    const got = [];
    for (const it of want) {
      const r = await this.#fetchOne(it);
      if (!r.ok) return { ok: false, reason: r.reason, id: r.id, installed: [] };
      got.push(r);
    }
    const installed = [], undo = [];
    const prev = [];
    try {
      for (const r of got) {
        if (r.bundled) continue;
        const store = r.item.kind === 'engine' ? this.engines : this.packages;
        const key = r.item.kind === 'engine' ? r.item.id + '@' + r.pkg.manifest.version : r.item.id;
        const old = await store.get(key);
        if (old && r.item.kind !== 'engine') prev.push({ ...old, id: 'prev:' + r.item.id });     // roll back returns to it
        undo.push({ store, key, old });
        await store.put({ id: key, manifest: r.pkg.manifest, files: r.pkg.files, signature: r.pkg.signature || null, source: r.item.package.url, installedAt: this.now(), needs: r.item.needs || [] });
        installed.push(r.item.id + '@' + r.pkg.manifest.version);
      }
    } catch {
      for (const u of undo.reverse()) { try { if (u.old) await u.store.put(u.old); else await u.store.del(u.key); } catch { /* best effort */ } }
      return { ok: false, reason: 'write', installed: [] };
    }
    try { for (const p of prev) await this.history.put(p); } catch { /* no history: Roll back just has nothing */ }
    return { ok: true, installed, already: order.length - want.length };
  }
  /** "Download everything now" for going offline (§3.1). */
  async downloadAll() {
    const out = { ok: true, installed: [], failed: [] };
    for (const it of this.items) {
      if (!it.available) continue;
      const r = await this.ensure(it.id);
      if (r.ok) out.installed.push(...r.installed); else { out.ok = false; out.failed.push({ id: it.id, reason: r.reason }); }
    }
    return out;
  }
  /** Which items can be switched on right now with what the cache holds (offline, §3.5 "clients cache the last resolved set"). */
  async usableOffline() {
    const ok = [];
    for (const it of this.items) { const c = this.closure(it.id); if (c.ok && (await Promise.all(c.order.map((x) => this.cached(x)))).every(Boolean)) ok.push(it.id); }
    return ok;
  }

  // ------------------------------------------------------------------------------------------ updates, permission change, roll back (AL.11)

  /** Compare the resolved set with the cache. Same major + same permissions + stable channel = automatic; anything else asks (§9.4). */
  async checkUpdates() {
    const auto = [], confirm = [];
    for (const it of this.items) {
      const pk = it.package; if (!pk || !pk.version) continue;
      const have = await (it.kind === 'engine' ? this.#newestEngine(it.id) : this.packages.get(it.id));
      if (!have || !have.manifest) continue;
      if (compareVersions(pk.version, have.manifest.version) <= 0) continue;
      if (it.pin && it.pin !== 'none' && it.pin !== have.manifest.version) { confirm.push({ id: it.id, from: have.manifest.version, to: pk.version, why: 'pin' }); continue; }
      const major = parseVersion(pk.version).major !== parseVersion(have.manifest.version).major;
      const perms = (a, b) => JSON.stringify([...(a || [])].sort()) !== JSON.stringify([...(b || [])].sort());
      const permsChanged = pk.permissions ? perms(pk.permissions, have.manifest.permissions) : false;
      if (major) confirm.push({ id: it.id, from: have.manifest.version, to: pk.version, why: 'major' });
      else if (permsChanged) confirm.push({ id: it.id, from: have.manifest.version, to: pk.version, why: 'permissions', added: (pk.permissions || []).filter((p) => !(have.manifest.permissions || []).includes(p)) });
      else if ((it.channel || 'stable') !== 'stable' && pk.channel === 'lab') confirm.push({ id: it.id, from: have.manifest.version, to: pk.version, why: 'channel' });
      else auto.push({ id: it.id, from: have.manifest.version, to: pk.version });
    }
    return { auto, confirm };
  }
  /**
   * AL.5: the loader's `engineResolver`. An add-on that imports `engine:<name>/…` and needs `engine.<name>` gets the newest cached engine package whose version
   * satisfies the range, or null (the loader then uses the copy the app carries). A build that may not download code (Apple) never hands one out.
   * → loader.engineResolver = acc.engineResolver
   */
  get engineResolver() {
    return async (name, range) => {
      if (!this.policy().downloadCode) return null;
      const id = 'engine.' + name;
      const all = (await this.engines.list()).filter((e) => e.id.startsWith(id + '@') && satisfies(e.manifest.version, range || '*')).sort((a, b) => compareVersions(a.manifest.version, b.manifest.version));
      const best = all.length ? all[all.length - 1] : null;
      return best ? { version: best.manifest.version, files: best.files } : null;
    };
  }
  async #newestEngine(id) {
    const all = (await this.engines.list()).filter((e) => e.id.startsWith(id + '@')).sort((a, b) => compareVersions(a.manifest.version, b.manifest.version));
    return all.length ? all[all.length - 1] : null;
  }
  /** Move a whole set together (all-or-nothing, AL.13): every package of every closure fetched and verified first, then written together. */
  async applyUpdates(ids) {
    const r = await this.ensureMany(ids);
    return r.ok ? { ok: true, done: r.installed } : { ok: false, reason: r.reason, id: r.id, done: [] };
  }
  async rollBack(ids) {
    const back = [];
    for (const id of ids) { const p = await this.history.get('prev:' + id); if (!p) continue; await this.packages.put({ ...p, id }); await this.history.del('prev:' + id); back.push(id + '@' + p.manifest.version); }
    return { ok: back.length === ids.length, back };
  }

  // ------------------------------------------------------------------------------------------ garbage collection (AL.5)

  /** Free engine versions no cached add-on needs (and none on the list), and add-ons removed over 30 days ago. */
  async gc() {
    const freed = [];
    const now = this.now(), rm = this.#load('removed', {});
    const listed = new Set(this.items.map((i) => i.id));
    for (const p of await this.packages.list()) {
      if (p && p.keep) { delete rm[p.id]; continue; }   // 0.9 OF.1/OF.4: kept on purpose (keep:'offline' from Offline on this device, keep:'file' from Add from a file)
      if (listed.has(p.id)) { delete rm[p.id]; continue; }
      const at = rm[p.id];
      if (at && now - at >= GRACE_MS) { await this.packages.del(p.id); delete rm[p.id]; freed.push(p.id); }
      else if (!at) rm[p.id] = now;                       // dropped from the list somewhere else: the 30 days start when we notice
    }
    const keepers = (await this.packages.list()).concat(this.items.filter((i) => i.kind === 'engine').map((i) => ({ manifest: { needs: [] }, needs: i.needs })));
    const needed = [];
    for (const k of await this.packages.list()) for (const n of (k.needs || k.manifest.needs || [])) needed.push(n);
    for (const it of this.items) for (const n of it.needs || []) needed.push(n);
    for (const e of await this.engines.list()) {
      if (e && e.keep) continue;   // kept on purpose (see above)
      const eid = e.id.slice(0, e.id.lastIndexOf('@'));
      const still = needed.some((n) => n.id === eid && satisfies(e.manifest.version, n.range));
      const newest = (await this.#newestEngine(eid));
      if (!still || (newest && newest.id !== e.id && !needed.some((n) => n.id === eid && satisfies(e.manifest.version, n.range) && !satisfies(newest.manifest.version, n.range)))) {
        await this.engines.del(e.id); freed.push(e.id);
      }
    }
    void keepers;
    this.#save('removed', rm);
    return { freed };
  }
}

function defaultT(key, fallback, vars) { return String(fallback).replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? vars[k] : '{' + k + '}')); }

// ------------------------------------------------------------------------------------------------ AL.6: files say what they need

/** Put the add-on a drawing holds data for into its record: doc.addons = { id: version }. */
export function recordUsed(doc, id, version) {
  if (!doc || typeof doc !== 'object') return doc;
  if (!doc.addons || typeof doc.addons !== 'object' || Array.isArray(doc.addons)) doc.addons = {};
  doc.addons[id] = String(version || '');
  return doc;
}
export function usedBy(doc) {
  const a = doc && doc.addons;
  if (!a || typeof a !== 'object' || Array.isArray(a)) return [];
  return Object.keys(a).filter((id) => /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(id)).map((id) => ({ id, version: String(a[id] || '') }));
}
/** What the file uses that is not added/available here. `have` = ids switched on (or cached) on this device. Data is kept either way. */
export function missingFor(doc, have) {
  const set = new Set(have || []);
  return usedBy(doc).filter((u) => !set.has(u.id));
}
/** The offer's words: "This file uses Acoustics 1.2. Add it?" */
export function offerText(missing, names = {}, t = defaultT) {
  if (!missing.length) return '';
  const list = missing.map((m) => (names[m.id] || m.id) + (m.version ? ' ' + m.version : '')).join(', ');
  return t('addons.account.fileUses', 'This file uses {list}. Add {them}? Until then its data is kept and nothing is lost.', { list, them: missing.length === 1 ? 'it' : 'them' });
}

/**
 * Stamp a file with the add-ons it needs (call before saving). `doc.addons = { id: version }`. Ids come from `ids` (what the app knows is in use) and from the
 * add-on data the file carries: every `xd` object (AO.6, { <add-on id>: {kind, v, data} }) found in the document, bounded. Version = the one on the account
 * list (package.version / version), else ''. Nothing found = the field is left out, so files that use no add-on stay as they were.
 */
export function stampFile(doc, items = [], ids = []) {
  if (!doc || typeof doc !== 'object') return doc;
  const found = new Set(ids || []);
  let budget = 20000;
  const walk = (o, depth) => {
    if (!o || typeof o !== 'object' || depth > 8 || budget-- < 0) return;
    if (Array.isArray(o)) { for (const x of o) walk(x, depth + 1); return; }
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (k === 'xd' && v && typeof v === 'object' && !Array.isArray(v)) { for (const id of Object.keys(v)) found.add(id); }
      else if (k !== 'addons') walk(v, depth + 1);
    }
  };
  walk(doc, 0);
  const byId = new Map((items || []).map((i) => [i.id, i]));
  for (const id of found) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(id)) continue;
    const it = byId.get(id);
    recordUsed(doc, id, (it && ((it.package && it.package.version) || it.version)) || (doc.addons && doc.addons[id]) || '');
  }
  return doc;
}

// ------------------------------------------------------------------------------------------------ AL.8: nobody loses anything

/**
 * First start of the unbundled version: every add-on this person had switched on (the loader's per-app prefs) joins their list.
 * `bundled` = the ids the old build carried; `prefs` = loader.prefs() ({off:{id:reason}, on:{id:true}}); `defaultsOn` = those the old
 * build started switched on. → ids to add with source 'migration'. Already-listed ids are skipped.
 */
export function migrateBundled(bundled, prefs, defaultsOn, listed = []) {
  const off = (prefs && prefs.off) || {}, on = (prefs && prefs.on) || {}, have = new Set(listed);
  return (bundled || []).filter((id) => !have.has(id) && !off[id] && (on[id] || (defaultsOn || []).includes(id)));
}

// ------------------------------------------------------------------------------------------------ 0.9 OF.4: add a package from a file

export const FILE_MAX_BYTES = 20 * 1024 * 1024;
export const PACKAGE_NAME_RE = /\.ccaddon\.json$/i;
/**
 * Install a signed package FILE (the `.ccaddon.json` a listing's "Download as a file" gives, dropped onto the window or picked with "Add from a file").
 * Works with no connection: the signature is checked with this build's own trust code (addons/trust.js, the key getcadcraft.com signs with), then the
 * loader takes it (its manifest must name this app and API) or, for an engine, the engine store. A paid add-on installs only when this device holds a live
 * licence for it (api.license: the signed 30-day entitlement, OF.5). The record is marked keep:'file' so a sync never frees it.
 * @param {object} o  { acc: AddonsAccount, loader: AddonLoader, trust, name, bytes: Uint8Array, gate?: (id) => Promise<null|string>, paidIds?: Set }
 * → { ok, id, name, version, kind, reload } | { ok:false, reason, detail? }
 *   reason: size | name | unreadable | unsigned | signature:<why> | other-app | paid | write | <loader reason>
 */
export async function installFromFile({ acc, loader, trust, name = '', bytes, gate = (typeof globalThis.ccAddonLicenseGate === 'function' ? globalThis.ccAddonLicenseGate : null), paidIds = null } = {}) {
  trust = trust || (acc && acc.trust);
  if (!trust || !bytes) return { ok: false, reason: 'unreadable' };
  if (bytes.length > FILE_MAX_BYTES) return { ok: false, reason: 'size' };
  if (name && !PACKAGE_NAME_RE.test(name) && !/\.json$/i.test(name)) return { ok: false, reason: 'name' };
  let obj; try { obj = JSON.parse(new TextDecoder().decode(bytes)); } catch { return { ok: false, reason: 'unreadable' }; }
  const rd = trust.readPackageJson(obj);
  if (!rd.ok) return { ok: false, reason: 'unreadable', detail: rd.reason };
  const pkg = rd.pkg, m = pkg.manifest || {};
  if (!pkg.signature) return { ok: false, reason: 'unsigned' };
  const v = await trust.verifyPackage(pkg);
  if (!v || v.ok === false) return { ok: false, reason: 'signature:' + ((v && v.reason) || 'bad') };
  const id = String(m.id || ''), version = String(m.version || '');
  const listed = acc && Array.isArray(acc.items) ? acc.items.find((i) => i && i.id === id) : null;
  const paid = (listed && listed.paid) || (paidIds && paidIds.has(id));
  if (paid) {
    const why = gate ? await gate(id) : 'paid:no-entitlement';
    if (why) return { ok: false, reason: 'paid', detail: why };
  }
  const source = 'file:' + String(name || id + '-' + version + '.ccaddon.json').slice(0, 120);
  if (/^engine\./.test(id) || m.kind === 'engine') {
    if (!acc || !acc.engines) return { ok: false, reason: 'write' };
    try { await acc.engines.put({ id: id + '@' + version, manifest: m, files: pkg.files, signature: pkg.signature, source, installedAt: Date.now(), needs: [], keep: 'file' }); }
    catch { return { ok: false, reason: 'write' }; }
    return { ok: true, id, name: m.name || id, version, kind: 'engine', reload: true };
  }
  if (!loader || typeof loader.installPackage !== 'function') return { ok: false, reason: 'write' };
  let r;
  try { r = await loader.installPackage({ manifest: m, files: pkg.files, signature: pkg.signature, source }); } catch { return { ok: false, reason: 'write' }; }
  if (!r || !r.ok) return { ok: false, reason: r && r.reason === 'app' ? 'other-app' : (r && r.reason) || 'refused', detail: r && r.detail };
  try { const rec = await loader.packages.get(id); if (rec) await loader.packages.put({ ...rec, keep: 'file' }); } catch { /* kept without the mark */ }
  return { ok: true, id, name: m.name || id, version, kind: 'addon', reload: true };
}
/** The words for an installFromFile answer (the shell's t with English fallbacks). */
export function fileResultText(r, t = defaultT) {
  if (r.ok) return t('addons.file.added', '{name} {version} was checked and added. Reload the app to use it.', { name: r.name, version: r.version });
  const why = {
    size: t('addons.file.r.size', 'the file is too big to be an add-on package'),
    name: t('addons.file.r.name', 'it is not an add-on package (.ccaddon.json)'),
    unreadable: t('addons.file.r.unreadable', 'the file is not a readable add-on package'),
    unsigned: t('addons.file.r.unsigned', 'it is not signed by getcadcraft.com'),
    'other-app': t('addons.file.r.otherapp', 'it is made for another app'),
    paid: t('addons.file.r.paid', 'it is a paid add-on and this device holds no licence for it; sign in and add it to your account first'),
    write: t('addons.file.r.write', 'this device could not store it'),
  };
  const reason = String(r.reason || '');
  const w = why[reason] || (reason.startsWith('signature:') ? t('addons.file.r.signature', 'its signature did not check, so it may have been changed') : reason);
  return t('addons.file.refused', 'Not added: {why}.', { why: w });
}

// ------------------------------------------------------------------------------------------------ Settings › Add-ons › Your add-ons / Browse

/**
 * Render "Your add-ons" (Settings › Add-ons, AL.13): the account list with Remove (it names what still needs an item, and the engines that go with it),
 * Updates (the whole set checked together; automatic ones and the ones that ask, with the reason; "Update all" is all-or-nothing; Roll back), Browse
 * (the Library on the site, where Add shows the whole set first), "Download everything for offline" and (0.9 OF.4, when `fromFile` is given) "Add from a file". Signed out of the account in this tab it offers
 * Sign in (/library/connect). Plain DOM, textContent only. `acc` is an AddonsAccount.
 */
export function renderYourAddons(el, acc, { t = defaultT, browseUrl = '/library', win = typeof window !== 'undefined' ? window : null, fromFile = null } = {}) {
  const doc = el.ownerDocument;
  const mk = (tag, text, cls) => { const n = doc.createElement(tag); if (text != null) n.textContent = text; if (cls) n.className = cls; return n; };
  const btn = (text, cls, fn) => { const b = mk('button', text, cls); b.type = 'button'; b.addEventListener('click', fn); return b; };
  const why = { major: t('addons.account.why.major', 'a new major version'), permissions: t('addons.account.why.permissions', 'it asks for more permissions'), pin: t('addons.account.why.pin', 'you pinned another version'), channel: t('addons.account.why.channel', 'it is a lab version') };
  const reasonText = { 'no-package': t('addons.account.r.nopackage', 'the library has no download for it yet'), hash: t('addons.account.r.hash', 'a file did not match its checksum'), offline: t('addons.account.r.offline', 'you are offline'), write: t('addons.account.r.write', 'this device could not store it') };
  const nameOf = (id) => { const it = acc.items.find((x) => x.id === id); return (it && it.name) || id; };
  let updates = null, note = null, msg = '';
  const say = (m) => { msg = m; if (note) note.textContent = m; };
  const checkUpdates = async () => { updates = await acc.checkUpdates(); draw(); };
  const draw = () => {
    el.textContent = '';
    el.appendChild(mk(el.tagName === 'FIELDSET' ? 'legend' : 'strong', t('addons.account.title', 'Your add-ons')));
    if (!acc.signedIn || !acc.signedIn()) {
      const row = mk('p', t('addons.account.signedout', 'Sign in to use the add-ons you added in the Library on this device.'), 'small');
      row.appendChild(doc.createTextNode(' '));
      row.appendChild(btn(t('addons.account.signin', 'Sign in'), 'btn btn-sm btn-outline-primary', async () => { const r = acc.edition === 'desktop' ? await acc.deviceSignIn({ show: (x) => say(t('addons.account.deviceCode', 'Open {url} and approve the code {code}.', { url: x.url, code: x.code })) }) : await acc.connect(win); say(r.ok ? t('addons.account.signedin', 'Signed in.') : t('addons.account.signinfail', 'Could not sign in ({why}).', { why: r.reason || 'try again' })); }));
      el.appendChild(row);
    }
    if (!acc.items.length) el.appendChild(mk('p', t('addons.account.none', 'Nothing added yet. Add-ons you add follow your account to every edition.'), 'text-muted small'));
    const ul = mk('ul', null, 'list-unstyled mb-2');
    for (const it of acc.items) {
      const li = mk('li', null, 'd-flex align-items-center gap-2');
      li.appendChild(mk('span', it.name || it.id));
      if (it.package && it.package.version) li.appendChild(mk('span', 'v' + it.package.version, 'text-muted small'));
      if (it.source && /^needed-by:/.test(it.source)) li.appendChild(mk('span', t('addons.account.because', 'added because {id} needs it', { id: it.source.slice(10) }), 'text-muted small'));
      if (!it.available) li.appendChild(mk('span', it.why || t('addons.account.notHere', 'Not available in this edition'), 'badge text-bg-secondary'));
      const b = btn(t('addons.account.remove', 'Remove'), 'btn btn-sm btn-outline-secondary ms-auto', async () => {
        const r = await acc.remove(it.id);
        if (!r.ok && r.dependents && r.dependents.length) { say(t('addons.account.usedBy', '{id} is used by {list}.', { id: it.name || it.id, list: r.dependents.join(', ') })); return; }
        if (r.ok && r.orphans && r.orphans.length) say(t('addons.account.orphans', 'Removed. Also taken off the list because nothing else needs them: {list}.', { list: r.orphans.map(nameOf).join(', ') }));
        draw();
      });
      if (acc.signedIn && acc.signedIn() && it.kind !== 'engine') {
        const cur = it.pin && it.pin !== 'none' ? it.pin : '';
        const pv = it.package && it.package.version;
        if (cur) li.appendChild(mk('span', t('addons.account.pinned', 'pinned to {v}', { v: cur }), 'badge text-bg-info'));
        if (cur || pv) li.appendChild(btn(cur ? t('addons.account.unpin', 'Follow newest') : t('addons.account.pin', 'Keep {v}', { v: pv }), 'btn btn-sm btn-link p-0', async () => {
          const r = await acc.pin(it.id, cur ? null : pv);
          say(r.ok ? '' : (r.message || t('addons.account.pinfail', 'Could not change the pin.')));
        }));
        const lab = (it.channel || 'stable') === 'lab';
        li.appendChild(btn(lab ? t('addons.account.chStable', 'Stable versions only') : t('addons.account.chLab', 'Try lab versions'), 'btn btn-sm btn-link p-0', async () => {
          const r = await acc.setChannel(it.id, lab ? 'stable' : 'lab');
          say(r.ok ? '' : (r.message || t('addons.account.chfail', 'Could not change the channel.')));
        }));
      }
      li.appendChild(b);
      ul.appendChild(li);
    }
    el.appendChild(ul);
    // updates: the whole set together
    const up = mk('div', null, 'mb-2');
    up.appendChild(mk('strong', t('addons.account.updates', 'Updates'), 'd-block'));
    if (!updates) up.appendChild(btn(t('addons.account.check', 'Check for updates'), 'btn btn-sm btn-outline-secondary', checkUpdates));
    else if (!updates.auto.length && !updates.confirm.length) { up.appendChild(mk('p', t('addons.account.uptodate', 'Everything is up to date.'), 'small mb-1')); up.appendChild(btn(t('addons.account.check', 'Check for updates'), 'btn btn-sm btn-outline-secondary', checkUpdates)); }
    else {
      const ul2 = mk('ul', null, 'list-unstyled small mb-1');
      for (const u of updates.auto) ul2.appendChild(mk('li', t('addons.account.upauto', '{name}: {from} to {to}', { name: nameOf(u.id), from: u.from, to: u.to })));
      for (const u of updates.confirm) ul2.appendChild(mk('li', t('addons.account.upask', '{name}: {from} to {to}. Needs your yes because {why}.', { name: nameOf(u.id), from: u.from, to: u.to, why: why[u.why] || u.why }) + (u.added && u.added.length ? ' (' + u.added.join(', ') + ')' : '')));
      up.appendChild(ul2);
      const all = [...updates.auto, ...updates.confirm].map((u) => u.id);
      up.appendChild(btn(t('addons.account.upall', 'Update all together ({n})', { n: all.length }), 'btn btn-sm btn-primary', async () => {
        say(t('addons.account.updating', 'Updating…'));
        const r = await acc.applyUpdates(all);
        if (r.ok) { updates = null; draw(); say(t('addons.account.updated', 'Updated {n} together.', { n: r.done.length })); }
        else say(t('addons.account.upfail', 'Nothing was changed: {name} failed ({why}).', { name: nameOf(r.id), why: reasonText[r.reason] || r.reason }));
      }));
      up.appendChild(doc.createTextNode(' '));
      up.appendChild(btn(t('addons.account.rollback', 'Roll back'), 'btn btn-sm btn-outline-secondary', async () => { const r = await acc.rollBack(all); say(r.back.length ? t('addons.account.rolledback', 'Back to {list}.', { list: r.back.join(', ') }) : t('addons.account.nothingback', 'Nothing to roll back.')); }));
    }
    el.appendChild(up);
    note = mk('p', msg, 'small');
    note.setAttribute('role', 'status');
    el.appendChild(note);
    const a = mk('a', t('addons.account.browse', 'Browse the Library'), 'btn btn-sm btn-primary');
    a.href = browseUrl; a.target = '_blank'; a.rel = 'noopener';
    el.appendChild(a);
    el.appendChild(doc.createTextNode(' '));
    if (typeof fromFile === 'function') {   // 0.9 OF.4: a signed package file, with no connection needed
      const input = doc.createElement('input');
      input.type = 'file'; input.accept = '.json,.ccaddon.json,application/json'; input.hidden = true; input.setAttribute('data-addons-file-input', '');
      input.addEventListener('change', async () => {
        const f = input.files && input.files[0];
        input.value = '';
        if (!f) return;
        say(t('addons.file.checking', 'Checking {name}…', { name: f.name }));
        const r = await fromFile(f);
        say(fileResultText(r, t));
      });
      el.appendChild(doc.createTextNode(' '));
      el.appendChild(btn(t('addons.file.add', 'Add from a file'), 'btn btn-sm btn-outline-secondary', () => input.click()));
      el.appendChild(input);
      el.appendChild(mk('p', t('addons.file.hint', 'Add from a file takes a package you downloaded from a listing (Download as a file). You can also drop it onto this window. Its signature is checked first.'), 'text-muted small mb-0'));
    }
    el.appendChild(doc.createTextNode(' '));
    el.appendChild(btn(t('addons.account.offline', 'Download everything for offline'), 'btn btn-sm btn-outline-secondary', async () => {
      say(t('addons.account.downloading', 'Downloading…'));
      const r = await acc.downloadAll();
      say(r.ok ? t('addons.account.ready', 'Ready for offline.') : t('addons.account.notready', 'Not everything could be downloaded: {list}.', { list: r.failed.map((f) => nameOf(f.id) + ' (' + (reasonText[f.reason] || f.reason) + ')').join(', ') }));
    }));
  };
  draw();
  return acc.on(draw);
}

// ------------------------------------------------------------------------------------------------ AL.6: the offer when a file is opened

/**
 * Show "This file uses X. Add it?" in `el` (a banner the app provides; hidden when nothing is missing). Plain DOM. `have` = ids switched on in the app.
 * Dismiss keeps the file as it is (its add-on data is passed through untouched on save). → { missing } for the caller/tests.
 */
export function renderFileOffer(el, acc, doc, { have = [], t = defaultT } = {}) {
  const d = el.ownerDocument;
  el.textContent = '';
  const n = acc.noteFile(doc, have);
  if (!n.missing.length) { el.hidden = true; return n; }
  const p = d.createElement('span'); p.textContent = n.text; el.appendChild(p);
  const mk = (label, cls, fn) => { const b = d.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = label; b.addEventListener('click', fn); el.appendChild(d.createTextNode(' ')); el.appendChild(b); return b; };
  const status = d.createElement('span'); status.setAttribute('role', 'status'); status.className = 'ms-2 small';
  mk(t('addons.account.fileAdd', 'Add'), 'btn btn-sm btn-primary', async () => {
    status.textContent = t('addons.account.fileAdding', 'Adding…');
    const r = await acc.addForFile(n.missing);
    if (r.ok) { el.hidden = true; return; }
    status.textContent = r.failed.map((f) => (f.reason === 'no-package' ? t('addons.account.r.nopackage', 'the library has no download for it yet') : f.reason)).join('; ');
  });
  mk(t('addons.account.fileLater', 'Not now'), 'btn btn-sm btn-outline-secondary', () => { el.hidden = true; });
  el.appendChild(status);
  el.hidden = false;
  return n;
}
