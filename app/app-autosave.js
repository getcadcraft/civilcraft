/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — every word a person reads goes through window.ccShellT (shell language files); the literals here are errors for developers. */
/**
 * app-autosave.js — autosave and crash recovery for every app (0.4 item 1.1, session shell; item 1.2 wires it into each
 * app). No dependencies; DOM-optional (the recovery dialog is the only DOM part).
 *
 * Canonical copy: public_html/assets/js/app-autosave.js (owner: session shell). Every app build carries a byte-identical
 * copy as dev/app-autosave.js (`node tools/shell/sync.mjs` copies, `--check` compares), so a build stays self-contained:
 * cache-busted by its import map, saved for offline, frozen with a release, shipped in the app's own repo.
 *
 *   import { Autosave } from "./app-autosave.js";      (double quotes: worker linkers read single-quoted paths as imports)
 *
 *   const autosave = new Autosave({ app: 'markupcraft' });          // one per page; start() is called for you
 *   const doc = autosave.doc({ name: 'Plans.pdf', snapshot: async () => ({ data, meta }) });
 *   doc.changed();      // after every edit: a copy is written ~2 s after the edits stop, at least every 30 s while they go on
 *   doc.clean();        // saved to a file (or the edits undone back to the file): the recovery copy goes
 *   doc.close();        // closed or discarded on purpose: the copy goes, the doc is forgotten
 *   doc.rename('Plans (2).pdf');
 *   await autosave.offer({ onRecover: async (rec) => { … open rec.data, rec.meta … } });   // at start: "Recover your work?"
 *
 * snapshot() returns {data, meta?} (or null = nothing to keep yet). `data` is anything IndexedDB can store: a Blob, an
 * ArrayBuffer/typed array, a string or plain JSON-like objects — the app's own format, whatever it reopens fastest. `meta`
 * is small plain data the app wants back (file name, format, view…). Each app decides what a document is (MarkupCraft:
 * each open PDF; TakeoffCraft: the takeoff; CadCraft: the drawing).
 *
 * What counts as "lost work": copies left by a page that is no longer running — the tab crashed, the browser or computer
 * stopped, or the user left with unsaved changes. Each page load is a new session (so a reload offers its own work back);
 * a session holds a Web Lock (`cc-autosave:<app>:<session>`) while it runs, else (no Web Locks) writes a heartbeat. Copies
 * of sessions still running (another tab) are never offered. Copies older than 30 days, or beyond the newest 20 per app,
 * are removed when a page starts.
 *
 * Storage: IndexedDB "cadcraft-autosave" (stores: index = small records, data = payloads, sessions = heartbeats), one
 * database per site origin shared by all apps (records carry `app`). Nothing leaves the browser.
 * Errors (storage full, private windows without IndexedDB) never break the app: onError({code, error}) and one shell
 * message; the app keeps working without autosave.
 */

export const FORMAT = 1;
export const DB_NAME = 'cadcraft-autosave';
export const DB_VERSION = 1;
export const DEFAULTS = Object.freeze({
  delay: 2000,          // ms after the last change
  maxWait: 30000,       // ms at most between the first unsaved change and its copy
  keepDays: 30,
  keepPerApp: 20,
  beat: 15000,          // heartbeat (only without Web Locks)
  stale: 45000,         // a heartbeat older than this = the session stopped
});
const LOCK_PREFIX = 'cc-autosave:';

export function newId() {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  const b = new Uint8Array(16);
  if (c && c.getRandomValues) c.getRandomValues(b); else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/** Bytes a payload takes, roughly (Blob/buffers exactly; strings as UTF-16; objects by their JSON when small enough). */
export function sizeOf(data) {
  if (data === null || data === undefined) return 0;
  if (typeof Blob !== 'undefined' && data instanceof Blob) return data.size;
  if (data instanceof ArrayBuffer) return data.byteLength;
  if (ArrayBuffer.isView(data)) return data.byteLength;
  if (typeof data === 'string') return data.length * 2;
  try { return JSON.stringify(data).length * 2; } catch { return 0; }
}

export const recKey = (app, session, doc) => app + ':' + session + ':' + doc;

// ------------------------------------------------------------------ storage adapters
// An adapter: putIndex(rec), putData(key, data), getData(key), del(key), index(app) → [rec], putBeat(app, session, t),
// beats(app) → [{session, beat}], delBeat(app, session). All return promises.

/** In memory (tests, or a page where IndexedDB is unavailable — then nothing survives a crash, said once). */
export function memoryStore() {
  const idx = new Map(), dat = new Map(), beats = new Map();
  return {
    kind: 'memory',
    async putIndex(rec) { idx.set(rec.key, { ...rec }); },
    async putData(key, data) { dat.set(key, data); },
    async getData(key) { return dat.has(key) ? dat.get(key) : undefined; },
    async del(key) { idx.delete(key); dat.delete(key); },
    async index(app) { return [...idx.values()].filter((r) => r.app === app).map((r) => ({ ...r })); },
    async putBeat(app, session, t) { beats.set(app + ':' + session, { app, session, beat: t }); },
    async beats(app) { return [...beats.values()].filter((b) => b.app === app); },
    async delBeat(app, session) { beats.delete(app + ':' + session); },
  };
}

/** IndexedDB (the browser). `factory` = indexedDB (injectable). */
export function idbStore(factory = globalThis.indexedDB, name = DB_NAME) {
  if (!factory) throw Object.assign(new Error('IndexedDB is not available here.'), { code: 'unavailable' });
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((resolve, reject) => {
    const req = factory.open(name, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('index')) db.createObjectStore('index', { keyPath: 'key' }).createIndex('app', 'app');
      if (!db.objectStoreNames.contains('data')) db.createObjectStore('data');
      if (!db.objectStoreNames.contains('sessions')) db.createObjectStore('sessions', { keyPath: 'key' }).createIndex('app', 'app');
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => { db.close(); dbp = null; };
      resolve(db);
    };
    req.onerror = () => { dbp = null; reject(req.error); };
    req.onblocked = () => { dbp = null; reject(Object.assign(new Error('The autosave database is blocked by another tab.'), { code: 'blocked' })); };
  }));
  const tx = async (stores, mode, fn) => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(stores, mode);
      let out;
      t.oncomplete = () => resolve(out);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error || Object.assign(new Error('Autosave was cancelled.'), { code: 'abort' }));
      out = fn(t);
    });
  };
  const all = (req) => new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
  return {
    kind: 'idb',
    putIndex: (rec) => tx(['index'], 'readwrite', (t) => { t.objectStore('index').put(rec); }),
    putData: (key, data) => tx(['data'], 'readwrite', (t) => { t.objectStore('data').put(data, key); }),
    async getData(key) {
      let r;
      await tx(['data'], 'readonly', (t) => { const q = t.objectStore('data').get(key); q.onsuccess = () => { r = q.result; }; });
      return r;
    },
    del: (key) => tx(['index', 'data'], 'readwrite', (t) => { t.objectStore('index').delete(key); t.objectStore('data').delete(key); }),
    async index(app) {
      const db = await open();
      return all(db.transaction('index').objectStore('index').index('app').getAll(app));
    },
    putBeat: (app, session, t0) => tx(['sessions'], 'readwrite', (t) => { t.objectStore('sessions').put({ key: app + ':' + session, app, session, beat: t0 }); }),
    async beats(app) {
      const db = await open();
      return all(db.transaction('sessions').objectStore('sessions').index('app').getAll(app));
    },
    delBeat: (app, session) => tx(['sessions'], 'readwrite', (t) => { t.objectStore('sessions').delete(app + ':' + session); }),
    close() { if (dbp) dbp.then((db) => db.close(), () => {}); dbp = null; },
  };
}

// ------------------------------------------------------------------ liveness

/** Sessions of `app` running now: Web Locks when there are any (held by running pages), else fresh heartbeats. */
async function liveSessions(self) {
  if (self.alive) return new Set(await self.alive());
  const locks = self.locks;
  if (locks && typeof locks.query === 'function') {
    const q = await locks.query();
    const out = new Set();
    const pre = LOCK_PREFIX + self.app + ':';
    for (const l of [...(q.held || []), ...(q.pending || [])]) if (l.name && l.name.startsWith(pre)) out.add(l.name.slice(pre.length));
    out.add(self.session);
    return out;
  }
  const t = self.now();
  const out = new Set([self.session]);
  for (const b of await self.store.beats(self.app)) if (t - b.beat < self.opts.stale) out.add(b.session);
  return out;
}

// ------------------------------------------------------------------ strings (shell language files)

const T = (k, v) => (typeof window !== 'undefined' && window.ccShellT ? window.ccShellT(k, v) : k);

// ------------------------------------------------------------------ Autosave

export class Autosave {
  /**
   * @param {object} o
   * @param {string} o.app             app slug (records are per app)
   * @param {object} [o.store]         storage adapter (default IndexedDB, else memory)
   * @param {string} [o.session]       this page's session id (default: new)
   * @param {Function} [o.now]         clock (tests)
   * @param {object} [o.timers]        {setTimeout, clearTimeout, setInterval, clearInterval} (tests)
   * @param {object} [o.locks]         navigator.locks (null = heartbeats)
   * @param {Function} [o.alive]       async () => session ids running now (tests; overrides locks/heartbeats)
   * @param {Function} [o.onError]     ({code, error, doc}) on a failed write
   * @param {Function} [o.onSaved]     ({doc, size, savedAt}) after each copy
   * @param {boolean} [o.start]        false = call start() yourself
   */
  constructor(o = {}) {
    if (!o.app || !/^[a-z0-9-]{1,40}$/.test(o.app)) throw new Error('Autosave needs the app slug.');
    this.app = o.app;
    this.opts = { ...DEFAULTS, ...(o.options || {}) };
    for (const k of Object.keys(DEFAULTS)) if (typeof o[k] === 'number') this.opts[k] = o[k];
    this.session = o.session || newId();
    this.now = o.now || (() => Date.now());
    const g = globalThis;
    this.timers = o.timers || { setTimeout: g.setTimeout.bind(g), clearTimeout: g.clearTimeout.bind(g), setInterval: g.setInterval.bind(g), clearInterval: g.clearInterval.bind(g) };
    this.locks = o.locks !== undefined ? o.locks : (typeof navigator !== 'undefined' && navigator.locks) || null;
    this.alive = o.alive || null;
    this.onError = o.onError || null;
    this.onSaved = o.onSaved || null;
    this.docs = new Map();
    this.warned = new Set();
    if (o.store) this.store = o.store;
    else {
      try { this.store = idbStore(); } catch { this.store = memoryStore(); this.warn('unavailable'); }
    }
    this.started = false;
    if (o.start !== false) this.start();
  }

  /** Hold this session's lock (or start the heartbeat) and flush on hide. Idempotent. */
  start() {
    if (this.started) return;
    this.started = true;
    if (this.locks && typeof this.locks.request === 'function') {
      this.lockHeld = new Promise((resolve) => {
        this.locks.request(LOCK_PREFIX + this.app + ':' + this.session, { mode: 'exclusive' }, () => {
          resolve(true);
          return new Promise((release) => { this.releaseLock = release; });   // held until stop() or the page goes
        }).catch(() => resolve(false));
      });
    } else if (!this.alive) {
      const beat = () => this.store.putBeat(this.app, this.session, this.now()).catch(() => {});
      beat();
      this.beatTimer = this.timers.setInterval(beat, this.opts.beat);
    }
    if (typeof document !== 'undefined' && document.addEventListener) {
      this.onHide = () => { if (document.visibilityState === 'hidden') this.flush(); };
      this.onPageHide = () => { this.flush(); };
      document.addEventListener('visibilitychange', this.onHide);
      globalThis.addEventListener && globalThis.addEventListener('pagehide', this.onPageHide);
    }
  }

  /** Stop: release the lock / heartbeat (the copies stay, and become recoverable). Tests and teardown. */
  async stop() {
    for (const d of this.docs.values()) d.cancel();
    if (this.beatTimer) this.timers.clearInterval(this.beatTimer);
    if (this.releaseLock) this.releaseLock();
    if (!this.locks && !this.alive) await this.store.delBeat(this.app, this.session).catch(() => {});
    if (this.onHide) document.removeEventListener('visibilitychange', this.onHide);
    if (this.onPageHide && globalThis.removeEventListener) globalThis.removeEventListener('pagehide', this.onPageHide);
    this.started = false;
  }

  /** A document to keep a recovery copy of. */
  doc({ id, name = '', snapshot, meta } = {}) {
    if (typeof snapshot !== 'function') throw new Error('Autosave.doc needs snapshot().');
    const d = new AutosaveDoc(this, id || newId(), name, snapshot, meta);
    this.docs.set(d.id, d);
    return d;
  }

  /** Write every changed document now (page hidden, before a risky step). */
  async flush() {
    await Promise.all([...this.docs.values()].map((d) => (d.dirty ? d.save() : d.saving)));
  }

  /**
   * Copies this app can offer back: written by sessions no longer running, newest first (without their data). Also prunes
   * copies older than keepDays and beyond keepPerApp, and heartbeats of stopped sessions.
   */
  async orphans() {
    const all = await this.store.index(this.app);
    const live = await liveSessions(this);
    const t = this.now();
    const maxAge = this.opts.keepDays * 86400000;
    const dead = all.filter((r) => !live.has(r.session)).sort((a, b) => b.savedAt - a.savedAt);
    const keep = [], drop = [];
    for (const r of dead) (t - r.savedAt > maxAge || keep.length >= this.opts.keepPerApp ? drop : keep).push(r);
    for (const r of drop) await this.store.del(r.key).catch(() => {});
    if (!this.locks && !this.alive) {
      for (const b of await this.store.beats(this.app).catch(() => [])) if (!live.has(b.session)) await this.store.delBeat(this.app, b.session).catch(() => {});
    }
    return keep.map(publicRec);
  }

  /** One copy with its data (null when it is gone — another tab recovered or discarded it). */
  async load(rec) {
    const key = typeof rec === 'string' ? rec : rec.key;
    const idx = (await this.store.index(this.app)).find((r) => r.key === key);
    if (!idx) return null;
    const data = await this.store.getData(key);
    if (data === undefined) return null;
    return { ...publicRec(idx), data };
  }

  /** Remove a copy (recovered, or discarded by the user). */
  async discard(rec) { await this.store.del(typeof rec === 'string' ? rec : rec.key); }

  /** Say once per kind of problem (shell message line), and tell the app. */
  warn(code, error, doc) {
    if (this.onError) { try { this.onError({ code, error, doc }); } catch { /* the app's handler */ } }
    if (this.warned.has(code)) return;
    this.warned.add(code);
    const say = typeof window !== 'undefined' && window.ccShellScreen && window.ccShellScreen.say;
    if (say) say(T(code === 'quota' ? 'shell.autosave.err.quota' : code === 'unavailable' ? 'shell.autosave.err.unavailable' : 'shell.autosave.err.write'));
  }

  /**
   * "Recover your work?" — the shell dialog listing orphans(); onRecover(rec with data) reopens one (throw to refuse:
   * the row says it could not, and the copy stays). Recovered and discarded copies are removed. Resolves when the dialog
   * closes: {recovered, discarded, kept}. No orphans → resolves at once without a dialog.
   * @param {{onRecover: Function, list?: object[], appName?: string}} o
   */
  async offer(o = {}) {
    const list = o.list || await this.orphans();
    const result = { recovered: 0, discarded: 0, kept: list.length };
    if (!list.length || typeof document === 'undefined') return result;
    const appName = o.appName || (document.querySelector('[data-app-settings]') || { getAttribute: () => null }).getAttribute('data-app-name') || this.app;
    return new Promise((resolve) => {
      const dlg = recoverDialog(this, list, appName, o.onRecover, result, () => { result.kept = rowsLeft(); resolve(result); });
      const rowsLeft = () => dlg.querySelectorAll('[data-autosave-row]').length;
      document.body.appendChild(dlg);
      dlg.showModal();
      const first = dlg.querySelector('[data-autosave-recover]');
      if (first) first.focus();
    });
  }
}

function publicRec(r) {
  return { key: r.key, app: r.app, session: r.session, doc: r.doc, name: r.name, savedAt: r.savedAt, size: r.size, meta: r.meta === undefined ? null : r.meta, format: r.format };
}

export class AutosaveDoc {
  constructor(owner, id, name, snapshot, meta) {
    this.owner = owner;
    this.id = String(id);
    this.name = String(name || '');
    this.snapshot = snapshot;
    this.meta = meta;
    this.key = recKey(owner.app, owner.session, this.id);
    this.dirty = false;
    this.rev = 0;
    this.firstDirty = null;
    this.timer = null;
    this.saving = null;
    this.savedAt = null;
    this.gen = 0;          // bumps on clean/close: a write that started before must not bring the copy back
    this.closed = false;
  }

  /** Call after every edit. */
  changed() {
    if (this.closed) return;
    this.dirty = true;
    this.rev++;
    const t = this.owner.now();
    if (this.firstDirty === null) this.firstDirty = t;
    const wait = Math.max(0, Math.min(this.owner.opts.delay, this.firstDirty + this.owner.opts.maxWait - t));
    this.schedule(wait);
  }

  schedule(ms) {
    if (this.timer) this.owner.timers.clearTimeout(this.timer);
    this.timer = this.owner.timers.setTimeout(() => { this.timer = null; this.save(); }, ms);
  }

  cancel() { if (this.timer) { this.owner.timers.clearTimeout(this.timer); this.timer = null; } }

  /** Write the copy now (if changed). Resolves when written. */
  save() {
    if (this.closed || !this.dirty) return this.saving || Promise.resolve(false);
    if (this.saving) { this.again = true; return this.saving; }
    this.cancel();
    const rev = this.rev, gen = this.gen, o = this.owner;
    this.saving = (async () => {
      let ok = false;
      try {
        const snap = await this.snapshot();
        if (!snap || snap.data === undefined) { if (rev === this.rev) { this.dirty = false; this.firstDirty = null; } return false; }
        if (gen !== this.gen || this.closed) return false;
        const savedAt = o.now();
        const size = typeof snap.size === 'number' ? snap.size : sizeOf(snap.data);
        await o.store.putData(this.key, snap.data);
        await o.store.putIndex({ key: this.key, format: FORMAT, app: o.app, session: o.session, doc: this.id, name: this.name,
          savedAt, size, meta: snap.meta === undefined ? (this.meta === undefined ? null : this.meta) : snap.meta });
        if (gen !== this.gen || this.closed) { await o.store.del(this.key).catch(() => {}); return false; }   // cleaned meanwhile
        this.savedAt = savedAt;
        if (rev === this.rev) { this.dirty = false; this.firstDirty = null; }
        ok = true;
        if (o.onSaved) { try { o.onSaved({ doc: this, size, savedAt }); } catch { /* the app's handler */ } }
      } catch (error) {
        const quota = error && (error.name === 'QuotaExceededError' || error.code === 22 || /quota/i.test(String(error.message)));
        o.warn(quota ? 'quota' : 'write', error, this);
      } finally {
        this.saving = null;
      }
      if (this.dirty && !this.closed && (!ok || this.again || rev !== this.rev)) {   // a failed write retries after maxWait
        this.again = false;
        const wait = Math.max(0, Math.min(o.opts.delay, (this.firstDirty ?? o.now()) + o.opts.maxWait - o.now()));
        this.schedule(ok ? wait : o.opts.maxWait);
      }
      return ok;
    })();
    return this.saving;
  }

  /** The document matches a file again (saved, or reverted): drop the copy. The doc stays tracked. */
  clean() {
    this.cancel();
    this.dirty = false;
    this.firstDirty = null;
    this.gen++;
    this.savedAt = null;
    return this.owner.store.del(this.key).catch(() => {});
  }

  /** Closed or discarded on purpose: drop the copy and forget the doc. */
  close() {
    const p = this.clean();
    this.closed = true;
    this.owner.docs.delete(this.id);
    return p;
  }

  rename(name) {
    this.name = String(name || '');
    if (this.savedAt !== null) this.owner.store.index(this.owner.app).then((all) => {
      const r = all.find((x) => x.key === this.key);
      if (r && !this.closed) return this.owner.store.putIndex({ ...r, name: this.name });
    }).catch(() => {});
  }
}

// ------------------------------------------------------------------ the dialog

/** "5 minutes ago" / "yesterday at 9:41 AM"-style text in the page's language. */
export function whenText(t, now = Date.now(), locale) {
  const diff = Math.round((t - now) / 1000);
  const abs = Math.abs(diff);
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    if (abs < 45) return rtf.format(0, 'second');
    if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    return new Date(t).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return new Date(t).toLocaleString();
  }
}

export function sizeText(n, locale) {
  const u = n < 1024 ? ['byte', n] : n < 1048576 ? ['kilobyte', n / 1024] : n < 1073741824 ? ['megabyte', n / 1048576] : ['gigabyte', n / 1073741824];
  try { return new Intl.NumberFormat(locale, { style: 'unit', unit: u[0], unitDisplay: 'short', maximumFractionDigits: u[1] < 10 && u[0] !== 'byte' ? 1 : 0 }).format(u[1]); }
  catch { return Math.round(u[1]) + ' ' + u[0]; }
}

function recoverDialog(self, list, appName, onRecover, result, done) {
  const d = document;
  const locale = (typeof window !== 'undefined' && window.ccShellT && window.ccShellT.locale && window.ccShellT.locale()) || undefined;
  const el = (tag, attrs = {}, ...kids) => {
    const n = d.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined && v !== false) n.setAttribute(k, v === true ? '' : v);
    for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c);
    return n;
  };
  const icon = (n) => el('i', { class: 'bi ' + n, 'aria-hidden': 'true' });
  const dlg = el('dialog', { class: 'shell-settings shell-recover', 'data-autosave-dialog': true, 'aria-labelledby': 'shell-recover-h' });
  const ul = el('ul', { class: 'shell-recover-list' });
  const close = () => { if (dlg.open) dlg.close(); };
  const rowsLeft = () => ul.querySelectorAll('[data-autosave-row]').length;
  const maybeDone = () => { if (!rowsLeft()) close(); };
  for (const rec of list) {
    const msg = el('p', { class: 'shell-recover-msg', role: 'status' });
    const rb = el('button', { type: 'button', class: 'btn-plot btn-sm-cc', 'data-autosave-recover': rec.key }, icon('bi-arrow-counterclockwise'), ' ' + T('shell.autosave.recover'));
    const db = el('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-autosave-discard': rec.key }, T('shell.autosave.discard'));
    const li = el('li', { class: 'shell-recover-row', 'data-autosave-row': rec.key },
      el('div', { class: 'shell-recover-what' },
        el('strong', {}, rec.name || T('shell.autosave.untitled')),
        el('span', { class: 'shell-recover-meta' }, T('shell.autosave.meta', { when: whenText(rec.savedAt, self.now(), locale), size: sizeText(rec.size || 0, locale) }))),
      el('div', { class: 'shell-btns' }, rb, db), msg);
    rb.addEventListener('click', async () => {
      rb.disabled = db.disabled = true;
      msg.textContent = T('shell.autosave.opening');
      try {
        const full = await self.load(rec);
        if (!full) { msg.textContent = T('shell.autosave.gone'); li.removeAttribute('data-autosave-row'); setTimeout(() => { li.remove(); maybeDone(); }, 1200); return; }
        if (typeof onRecover === 'function') await onRecover(full);
        await self.discard(rec);
        result.recovered++;
        li.remove();
        maybeDone();
      } catch (e) {
        msg.textContent = T('shell.autosave.failed', { reason: (e && e.message) || String(e) });
        rb.disabled = db.disabled = false;
      }
    });
    db.addEventListener('click', async () => {
      await self.discard(rec).catch(() => {});
      result.discarded++;
      li.remove();
      maybeDone();
    });
    ul.append(li);
  }
  const discardAll = el('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-autosave-discard-all': true }, T('shell.autosave.discard_all'));
  discardAll.addEventListener('click', async () => {
    for (const li of [...ul.querySelectorAll('[data-autosave-row]')]) {
      await self.discard(li.getAttribute('data-autosave-row')).catch(() => {});
      result.discarded++;
      li.remove();
    }
    close();
  });
  const later = el('button', { type: 'button', class: 'btn-plot btn-sm-cc', 'data-autosave-later': true }, T('shell.autosave.later'));
  later.addEventListener('click', close);
  const x = el('button', { type: 'button', class: 'shell-x', 'aria-label': T('shell.settings.close') }, icon('bi-x-lg'));
  x.addEventListener('click', close);
  dlg.append(el('div', { class: 'shell-dlg' },
    el('div', { class: 'shell-dlg-head' }, el('h2', { id: 'shell-recover-h' }, T('shell.autosave.title')), x),
    el('div', { class: 'shell-dlg-body' },
      el('p', { class: 'shell-hint-text' }, T('shell.autosave.lede', { app: appName, n: list.length })),
      ul,
      el('p', { class: 'shell-hint-text' }, T('shell.autosave.later.hint', { days: self.opts.keepDays }))),
    el('div', { class: 'shell-dlg-foot' }, discardAll, later)));
  // The apps listen for keys on the window (command lines, shortcuts): stop them at the dialog's edge.
  for (const t of ['keydown', 'keyup', 'wheel']) dlg.addEventListener(t, (e) => { if (!(t === 'keydown' && e.key === 'Escape')) e.stopPropagation(); });
  dlg.addEventListener('close', () => { dlg.remove(); done(); });
  return dlg;
}

export default Autosave;
