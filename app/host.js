/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — every word a person reads goes through window.ccShellT (shell language files); the literals here are errors for developers. */
/**
 * host.js — the host adapter: how an app reaches files, whatever runs it (0.4 item W.2, session shell; docs/0.4-PART2.md
 * § Track W). Apps call this, never a browser picker or a desktop shell directly, so one build serves the browser and
 * the desktop app. No dependencies; DOM-optional.
 *
 * Canonical copy: public_html/assets/js/host.js (owner: session shell). Every app build carries a byte-identical copy as
 * dev/host.js (`node tools/shell/sync.mjs` copies, `--check` compares).
 *
 *   import { getHost } from "./host.js";        (double quotes: worker linkers read single-quoted paths as imports)
 *   const host = getHost({ app: 'cadcraft' });
 *
 *   const [f] = await host.openFile({ types: [{ description: 'Drawings', extensions: ['.dwg', '.dxf'] }] });
 *   if (f) { const bytes = await f.bytes(); … keep f as the document's target … }
 *   const files = await host.fromDrop(event.dataTransfer);       // dropped files, same shape (handles when the browser has them)
 *   const r = await host.save({ target: f, data, name: 'Plan.dwg', types });  // desktop: written in place; browser: download
 *   const r2 = await host.saveAs({ data, name: 'Plan.dxf', types });          // desktop: native dialog; browser: download
 *   host.download(data, 'Plan.pdf');                                          // an export: always a copy
 *   const list = await host.recent.list();          // this app's recent files, newest first (all apps: list({ all: true }))
 *   const g = await host.recent.open(entry);        // reopen (browser: needs a click — it may ask for permission)
 *   for (const f of await host.launchFiles()) …     // files the app was opened with (desktop: double-click / "Open with")
 *   host.onOpenFiles((files) => …);                 // files opened later (desktop: double-click while running)
 *   const dir = await host.pickFolder({ write: true, id: 'cadcraft-sheetset' });   // a folder (W2.12) or null
 *   const set = host.folderOf(f);                   // the folder holding a file (desktop only; browser: null)
 *
 * A HostFolder: {name, path (desktop) | null, writable, read(rel) → Uint8Array, write(rel, data), list({depth = 6}) →
 * sorted rel paths of the files (hidden entries skipped)}. rel = "/"-separated (back slashes accepted), relative to the
 * folder; empty, absolute or ".." paths throw code 'outside'. Browser: showDirectoryPicker (Chromium; elsewhere null);
 * desktop: the bridge's openFolderDialog / listDir / readFile / writeFile.
 *
 * A HostFile: {id, name, size, lastModified, type, path (desktop: full path, else null), handle (browser: a
 * FileSystemFileHandle when the browser gives one, else null), file() → Promise<File|Blob>, bytes() → Promise<Uint8Array>,
 * text() → Promise<string>, writable (true when save() can write it in place)}.
 * save()/saveAs() → {ok, how: 'written' | 'downloaded', target (HostFile to keep for the next save), name, path} or
 * {ok: false, cancelled: true} (the user closed the dialog) / {ok: false, error}. `data` = Blob | ArrayBuffer | typed
 * array | string.
 *
 * host.kind 'browser' | 'desktop'. host.caps {saveInPlace, saveDialog, recentReopen, launchFiles} — for wording ("Save"
 * vs "Download") and for hiding what cannot work.
 *
 * Browser (today's behaviour): open = the browser's file picker (File System Access picker where there is one, so the
 * recent list can reopen the file; else <input type=file>); save and save as = a download; recents keep the name, and the
 * handle where the browser gives one. `configure({ browserFileSystem: true })` would make Chromium save in place / show a
 * save dialog instead — off: not decided (owner).
 *
 * Desktop: the desktop shell (session desktop, Tauri 2) puts a bridge on the page before the app loads —
 *   window.cadcraftDesktop = {
 *     version: 1,
 *     openDialog({ multiple, filters: [{ name, extensions: ['dwg', 'dxf'] }], title }) → Promise<string[] | null>   (paths)
 *     saveDialog({ defaultPath, filters, title }) → Promise<string | null>                                       (a path)
 *     readFile(path) → Promise<Uint8Array>
 *     writeFile(path, Uint8Array) → Promise<void>          (atomic: temp file + rename, done by the shell)
 *     stat(path) → Promise<{ size, mtime } | null>         (optional)
 *     openFolderDialog({ title }) → Promise<string | null>  (a folder path; its contents become readable/writable)
 *     listDir(path) → Promise<[{ name, dir }]>
 *     launchFiles() → Promise<string[]>                    (paths the app was started with; each returned once)
 *     onOpenFiles(callback(paths[]))                       (double-click / "Open with" while running)
 *   }
 * and host.js uses it. Paths are the OS's own. Nothing else in the apps talks to the shell.
 *
 * Recent files: IndexedDB "cadcraft-host" (store recent: {id, app, name, size, lastModified, path, handle, openedAt,
 * savedAt}), 20 per app; the same file opened again moves to the top (same path, same handle, else same name + size).
 *
 * Assistants and scripts (W2.14 / X.5, session agents; docs/AGENTS-SPEC.md §6): host.control — the app registers tools
 * (host.control.tool), Settings › Assistants turns them on (host.control.configure), and Studio's requests reach them through
 * the desktop bridge or Studio's window channel. createControlRelay() is Studio's side. See the section near the end.
 *
 * Studio Live (0.5 LV.5, session live-core; docs/LIVE-PROTOCOL.md): host.live — the app hands over its adapter and gets a
 * LiveClient (live-client.js, loaded on first use); the transport is picked here. See the section near the end.
 *
 * Who is signed in (0.5 SI.9, session live-studio): host.account() → { name, avatar } or null, and an 'account' event when
 * it becomes known or changes. The site's app pages embed it (#cc-account: the display name and /avatar/<id>, never the
 * email); Studio and the desktop apps read the shell's account (the name; in Studio also the picture the hub keeps, as a
 * blob: URL). Apps use the name as the author of what people make (markups, issues, live sessions) instead of asking.
 *
 * The start screen's list (0.4 item 1.4): put <div data-recent-files></div> (optionally data-max="8") on the app's start
 * screen. getHost() fills it with the files it can reopen (handles in Chromium, paths on the desktop), newest first; a
 * click reopens the file and hands it to the app through onOpenFiles(), like a file opened at launch — so the app needs
 * only its onOpenFiles handler. Empty list → the element stays hidden. Words: shell strings shell.recent.*.
 */

export const API_VERSION = 1;
export const RECENT_DB = 'cadcraft-host';
export const RECENT_PER_APP = 20;

const g = globalThis;
const isBlob = (x) => typeof Blob !== 'undefined' && x instanceof Blob;

export function newId() {
  const c = g.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/** Blob | ArrayBuffer | typed array | string → Uint8Array. */
export async function toBytes(data) {
  if (data === null || data === undefined) return new Uint8Array(0);
  if (data instanceof Uint8Array) return data;
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (isBlob(data)) return new Uint8Array(await data.arrayBuffer());
  if (typeof data === 'string') return new TextEncoder().encode(data);
  throw new TypeError('host: data must be a Blob, an ArrayBuffer, a typed array or a string.');
}

/** → Blob (for downloads and FSA writes). */
export function toBlob(data, type = 'application/octet-stream') {
  if (isBlob(data)) return data;
  if (typeof data === 'string') return new Blob([data], { type: type === 'application/octet-stream' ? 'text/plain' : type });
  if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) return new Blob([data], { type });
  throw new TypeError('host: data must be a Blob, an ArrayBuffer, a typed array or a string.');
}

/** "C:\\Jobs\\Plan.dwg" / "/home/a/Plan.dwg" → "Plan.dwg". */
export function baseName(p) { return String(p || '').split(/[\\/]/).filter(Boolean).pop() || ''; }

/** Normalise our types [{description, extensions: ['.dwg'], mime?}] for each picker. */
export function normTypes(types) {
  return (Array.isArray(types) ? types : []).map((t) => ({
    description: String(t.description || ''),
    extensions: (t.extensions || []).map((e) => '.' + String(e).replace(/^\./, '').toLowerCase()).filter((e) => /^\.[a-z0-9]{1,12}$/.test(e)),
    mime: typeof t.mime === 'string' && /^[a-z]+\/[a-z0-9.+-]+$/i.test(t.mime) ? t.mime : null,
  })).filter((t) => t.extensions.length);
}
export const inputAccept = (types) => normTypes(types).flatMap((t) => t.extensions).join(',');
export const fsaTypes = (types) => normTypes(types).map((t) => ({ description: t.description, accept: { [t.mime || 'application/octet-stream']: t.extensions } }));
export const desktopFilters = (types) => normTypes(types).map((t) => ({ name: t.description, extensions: t.extensions.map((e) => e.slice(1)) }));

/** "C:\\Jobs\\Plan.dwg" → "C:\\Jobs"; "/home/a/Plan.dwg" → "/home/a"; "/Plan.dwg" → "/". */
export function dirName(p) {
  const s = String(p || '');
  const i = Math.max(s.lastIndexOf('/'), s.lastIndexOf('\\'));
  if (i < 0) return '';
  return i === 0 ? s.slice(0, 1) : s.slice(0, i);
}

/** A folder-relative path ("plans/Level 1.dwg", back slashes allowed) → its parts; throws code 'outside' when it is
 *  empty, absolute or climbs out with "..". */
export function relParts(rel) {
  const raw = String(rel ?? '').replace(/\\/g, '/');
  const parts = raw.split('/').filter((x) => x !== '' && x !== '.');
  if (!parts.length || raw.startsWith('/') || /^[A-Za-z]:/.test(raw) || parts.includes('..')) {
    throw Object.assign(new Error('host: ' + JSON.stringify(String(rel)) + ' is not a path inside the folder.'), { code: 'outside' });
  }
  return parts;
}

/** HostFolder over a desktop path: {name, path, writable, read(rel), write(rel, data), list({depth})}. */
function desktopFolder(d, dir) {
  const sep = dir.includes('\\') && !dir.includes('/') ? '\\' : '/';
  const join = (rel) => (dir.endsWith(sep) ? dir : dir + sep) + relParts(rel).join(sep);
  return {
    name: baseName(dir) || dir, path: dir, writable: true,
    read: async (rel) => d.readFile(join(rel)),
    write: async (rel, data) => { await d.writeFile(join(rel), await toBytes(data)); },
    async list({ depth = 6 } = {}) {
      if (typeof d.listDir !== 'function') return [];
      const out = [];
      const rec = async (abs, pre, level) => {
        for (const e of (await d.listDir(abs)) || []) {
          if (!e || !e.name || e.name.startsWith('.')) continue;
          if (e.dir) { if (level < depth) await rec(abs + sep + e.name, pre + e.name + '/', level + 1); } else out.push(pre + e.name);
        }
      };
      await rec(dir.endsWith(sep) && dir.length > 1 ? dir.slice(0, -1) : dir, '', 0);
      return out.sort();
    },
  };
}

/** HostFolder over a browser FileSystemDirectoryHandle (write needs a 'readwrite' pick). */
export function folderFromHandle(dir, writable = true) {
  const walk = async (rel, create = false) => {
    const parts = relParts(rel);
    let d = dir;
    for (const p of parts.slice(0, -1)) d = await d.getDirectoryHandle(p, { create });
    return { d, name: parts[parts.length - 1] };
  };
  return {
    name: dir.name, path: null, writable: !!writable, handle: dir,
    async read(rel) { const { d, name } = await walk(rel); return new Uint8Array(await (await (await d.getFileHandle(name)).getFile()).arrayBuffer()); },
    async write(rel, data) {
      if (!writable) throw Object.assign(new Error('host: this folder was opened read only.'), { code: 'read_only' });
      const { d, name } = await walk(rel, true);
      const w = await (await d.getFileHandle(name, { create: true })).createWritable();
      await w.write(toBlob(data));
      await w.close();
    },
    async list({ depth = 6 } = {}) {
      const out = [];
      const rec = async (d, pre, level) => {
        for await (const [n, h] of d.entries()) {
          if (n.startsWith('.')) continue;
          if (h.kind === 'directory') { if (level < depth) await rec(h, pre + n + '/', level + 1); } else out.push(pre + n);
        }
      };
      await rec(dir, '', 0);
      return out.sort();
    },
  };
}

// ------------------------------------------------------------------ HostFile

function hostFile({ name, size = null, lastModified = null, type = '', path = null, handle = null, file = null, read = null, writable = false }) {
  let cached = file;
  const getFile = async () => {
    if (cached) return cached;
    if (handle && typeof handle.getFile === 'function') return (cached = await handle.getFile());
    if (read) { const b = await read(); cached = typeof File !== 'undefined' ? new File([b], name, { type }) : new Blob([b], { type }); return cached; }
    throw new Error('host: nothing to read for ' + name);
  };
  return {
    id: newId(), name: String(name || ''), size, lastModified, type, path, handle, writable,
    file: getFile,
    async bytes() { return path && read && !cached ? new Uint8Array(await read()) : new Uint8Array(await (await getFile()).arrayBuffer()); },
    async text() { return new TextDecoder().decode(await this.bytes()); },
  };
}

function fromFile(f, handle = null) {
  return hostFile({ name: f.name, size: f.size, lastModified: f.lastModified || null, type: f.type || '', handle, file: f });
}

// ------------------------------------------------------------------ recent files

/** A recent-files store over IndexedDB (or memory when there is none, e.g. Node tests). */
export function recentStore(factory = g.indexedDB) {
  const mem = new Map();
  if (!factory) {
    return {
      kind: 'memory',
      async all() { return [...mem.values()].map((e) => ({ ...e })); },
      async put(e) { mem.set(e.id, { ...e }); },
      async del(id) { mem.delete(id); },
    };
  }
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((resolve, reject) => {
    const req = factory.open(RECENT_DB, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore('recent', { keyPath: 'id' }).createIndex('app', 'app'); };
    req.onsuccess = () => { const db = req.result; db.onversionchange = () => { db.close(); dbp = null; }; resolve(db); };
    req.onerror = () => { dbp = null; reject(req.error); };
  }));
  const run = async (mode, fn) => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction('recent', mode);
      let out;
      t.oncomplete = () => resolve(out);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
      const r = fn(t.objectStore('recent'));
      if (r && 'onsuccess' in r) r.onsuccess = () => { out = r.result; };
    });
  };
  return {
    kind: 'idb',
    all: () => run('readonly', (s) => s.getAll()),
    put: (e) => run('readwrite', (s) => { s.put(e); }),
    del: (id) => run('readwrite', (s) => { s.delete(id); }),
  };
}

async function sameEntry(a, b) {
  if (a.app !== b.app) return false;
  if (a.path && b.path) return a.path === b.path;
  if (a.handle && b.handle && typeof a.handle.isSameEntry === 'function') { try { return await a.handle.isSameEntry(b.handle); } catch { return false; } }
  return !a.path && !b.path && a.name === b.name && a.size === b.size;
}

function makeRecent(self) {
  const store = self.recentStore;
  const api = {
    /** Remember a file (opened or saved). Same file again → its entry moves up. Never throws. */
    async add(f, how = 'open') {
      try {
        if (!f || !f.name) return null;
        const t = self.now();
        const entry = { id: newId(), app: self.app, name: f.name, size: f.size ?? null, lastModified: f.lastModified ?? null,
          path: f.path || null, handle: f.handle || null, openedAt: how === 'open' ? t : null, savedAt: how === 'save' ? t : null };
        const all = await store.all();
        for (const e of all) {
          if (await sameEntry(e, entry)) {
            entry.id = e.id;
            entry.openedAt = how === 'open' ? t : e.openedAt;
            entry.savedAt = how === 'save' ? t : e.savedAt;
            if (!entry.handle && e.handle) entry.handle = e.handle;
            break;
          }
        }
        await store.put(entry);
        const mine = (await store.all()).filter((e) => e.app === self.app).sort(byWhen);
        for (const e of mine.slice(RECENT_PER_APP)) await store.del(e.id);
        self.emit('recent');
        return publicEntry(entry, self);
      } catch { return null; }
    },
    /** Newest first. {all: true} = every app's (the hub). Each entry says whether it can be reopened here. */
    async list({ all = false } = {}) {
      try {
        const rows = (await store.all()).filter((e) => all || e.app === self.app).sort(byWhen);
        return rows.map((e) => publicEntry(e, self));
      } catch { return []; }
    },
    async remove(entry) { try { await store.del(typeof entry === 'string' ? entry : entry.id); self.emit('recent'); } catch { /* gone */ } },
    async clear() { for (const e of await api.list()) await api.remove(e); },
    /**
     * Reopen → HostFile, or {error: 'permission' | 'gone' | 'unsupported', message}. Browser: call from a click — the
     * browser may ask the user to allow it again.
     */
    async open(entry) {
      if (entry.path && self.desktop) {
        const st = self.desktop.stat ? await self.desktop.stat(entry.path).catch(() => null) : {};
        if (st === null) return { error: 'gone' };
        const f = self.pathFile(entry.path, st);
        await api.add(f, 'open');
        return f;
      }
      if (entry.handle && typeof entry.handle.getFile === 'function') {
        try {
          if (typeof entry.handle.queryPermission === 'function') {
            let p = await entry.handle.queryPermission({ mode: 'read' });
            if (p === 'prompt' && typeof entry.handle.requestPermission === 'function') p = await entry.handle.requestPermission({ mode: 'read' });
            if (p !== 'granted') return { error: 'permission' };
          }
          const file = await entry.handle.getFile();
          const f = hostFile({ name: file.name, size: file.size, lastModified: file.lastModified, type: file.type, handle: entry.handle, file });
          await api.add(f, 'open');
          return f;
        } catch (e) {
          return { error: e && e.name === 'NotFoundError' ? 'gone' : 'permission', message: e && e.message };
        }
      }
      return { error: 'unsupported' };
    },
  };
  return api;
}
const when = (e) => Math.max(e.openedAt || 0, e.savedAt || 0);
const byWhen = (a, b) => when(b) - when(a);
function publicEntry(e, self) {
  return { id: e.id, app: e.app, name: e.name, size: e.size, lastModified: e.lastModified, path: e.path, handle: e.handle,
    openedAt: e.openedAt, savedAt: e.savedAt, reopen: !!((e.path && self.desktop) || (e.handle && typeof e.handle.getFile === 'function')) };
}

// ------------------------------------------------------------------ the host

class Host {
  constructor(o = {}) {
    if (!o.app || !/^[a-z0-9-]{1,40}$/.test(o.app)) throw new Error('host needs the app slug.');
    this.app = o.app;
    this.now = o.now || (() => Date.now());
    this.win = o.window !== undefined ? o.window : (typeof window !== 'undefined' ? window : null);
    this.doc = o.document !== undefined ? o.document : (typeof document !== 'undefined' ? document : null);
    const bridge = o.desktop !== undefined ? o.desktop : (this.win && this.win.cadcraftDesktop) || null;
    this.desktop = bridge && Number(bridge.version) >= 1 ? bridge : null;
    this.kind = this.desktop ? 'desktop' : 'browser';
    this.browserFS = !!o.browserFileSystem;
    this.recentStore = o.recentStore || recentStore(o.indexedDB !== undefined ? o.indexedDB : g.indexedDB);
    this.listeners = new Map();
    this.recent = makeRecent(this);
    this.launchQueue = [];
    this.openHandlers = [];
    this.wireLaunch();
    this.control = makeControl(this);   // assistants and scripts (W2.14; below)
    this.live = makeLive(this);         // Studio Live (0.5 LV.5; below)
    this.wireAccount();                 // who is signed in (0.5 SI.9)
  }

  /** { name, avatar } of the signed-in person, or null (signed out, or not known yet: listen for 'account'). */
  account() { return this.acct || null; }

  wireAccount() {
    this.acct = null;
    try {
      const n = this.doc && this.doc.getElementById && this.doc.getElementById('cc-account');
      const j = n ? JSON.parse(n.textContent || 'null') : null;
      const name = j && typeof j.name === 'string' ? j.name.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 80) : '';
      if (name) this.acct = { name, avatar: typeof j.avatar === 'string' && /^\/avatar\/\d+(\?v=\d+)?$/.test(j.avatar) ? j.avatar : null };
    } catch { this.acct = null; }
    if (this.acct) { const a = this.acct; Promise.resolve().then(() => this.emit('account', a)); return; }
    const acc = this.desktop && this.desktop.account;
    if (!acc || typeof acc.status !== 'function') return;
    const read = () => acc.status().then((s) => {
      const u = s && s.state === 'signed_in' && s.user ? s.user : null;
      const name = u ? (String(u.name || '').trim() || String(u.email || '').split('@')[0]).replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, 80) : '';
      const next = name ? { name, avatar: this.studioPicture() } : null;
      if (JSON.stringify(next) !== JSON.stringify(this.acct)) { this.acct = next; this.emit('account', next); }
    }).catch(() => {});
    read();
    // A new sign-in, a new name or picture on the website: read again when the window comes forward.
    if (this.win && this.win.addEventListener) this.win.addEventListener('focus', read);
  }

  /** Studio: the picture the hub keeps (studio/hub/avatar.js, the hub's checked bytes) as a blob: URL; else null. */
  studioPicture() {
    try {
      if (!this.desktop || !this.desktop.windows || !this.win || !this.win.localStorage) return null;
      const j = JSON.parse(this.win.localStorage.getItem('cadcraft.studio.avatar') || 'null');
      if (!j || typeof j.big !== 'string' || !j.at) return null;
      if (this.pic && this.pic.at === j.at) return this.pic.url;
      const bytes = Uint8Array.from(atob(j.big), (c) => c.charCodeAt(0));
      if (this.pic) URL.revokeObjectURL(this.pic.url);
      this.pic = { at: j.at, url: URL.createObjectURL(new Blob([bytes], { type: 'image/webp' })) };
      return this.pic.url;
    } catch { return null; }
  }

  get caps() {
    const fsa = !!(this.win && typeof this.win.showOpenFilePicker === 'function');
    const fsaSave = !!(this.win && typeof this.win.showSaveFilePicker === 'function');
    return {
      saveInPlace: this.kind === 'desktop' || (this.browserFS && fsaSave),
      saveDialog: this.kind === 'desktop' || (this.browserFS && fsaSave),
      recentReopen: this.kind === 'desktop' || fsa,
      launchFiles: this.kind === 'desktop' || !!(this.win && 'launchQueue' in this.win),
    };
  }

  configure(o = {}) { if ('browserFileSystem' in o) this.browserFS = !!o.browserFileSystem; return this; }

  on(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); return () => this.listeners.get(type).delete(fn); }
  emit(type, detail) { for (const fn of this.listeners.get(type) || []) { try { fn(detail); } catch { /* a listener */ } } }

  /** A HostFile for a desktop path (read on demand through the bridge). */
  pathFile(p, st = {}) {
    const d = this.desktop;
    return hostFile({ name: baseName(p), size: st && st.size != null ? st.size : null, lastModified: st && st.mtime != null ? st.mtime : null,
      path: p, read: () => d.readFile(p), writable: true });
  }

  // ---------------------------------------------------------------- open

  /** Ask for files. → HostFile[] ([] when cancelled). */
  async openFile({ types = [], multiple = false, title } = {}) {
    let out = [];
    if (this.desktop) {
      const paths = await this.desktop.openDialog({ multiple: !!multiple, filters: desktopFilters(types), title });
      out = (paths || []).map((p) => this.pathFile(p));
      await Promise.all(out.map(async (f) => {
        if (this.desktop.stat) { const st = await this.desktop.stat(f.path).catch(() => null); if (st) { f.size = st.size; f.lastModified = st.mtime ?? null; } }
      }));
    } else if (this.win && typeof this.win.showOpenFilePicker === 'function') {
      try {
        const handles = await this.win.showOpenFilePicker({ multiple: !!multiple, types: fsaTypes(types), excludeAcceptAllOption: false, id: (this.app + '-open').slice(0, 32) });
        for (const h of handles) { const file = await h.getFile(); out.push(hostFile({ name: file.name, size: file.size, lastModified: file.lastModified, type: file.type, handle: h, file, writable: this.browserFS })); }
      } catch (e) {
        if (e && e.name === 'AbortError') return [];
        if (!(e && (e.name === 'SecurityError' || e.name === 'NotAllowedError' || e.name === 'TypeError'))) throw e;
        out = await this.inputPick(types, multiple);   // e.g. a cross-origin frame: fall back to the plain input
      }
    } else {
      out = await this.inputPick(types, multiple);
    }
    for (const f of out) await this.recent.add(f, 'open');
    return out;
  }

  /** The plain <input type=file> (no handles). Resolves [] on cancel where the browser tells us (cancel event). */
  inputPick(types, multiple) {
    const d = this.doc;
    if (!d) return Promise.resolve([]);
    return new Promise((resolve) => {
      const input = d.createElement('input');
      input.type = 'file';
      input.multiple = !!multiple;
      const acc = inputAccept(types);
      if (acc) input.accept = acc;
      input.style.display = 'none';
      let done = false;
      const finish = (list) => { if (done) return; done = true; input.remove(); resolve(list); };
      input.addEventListener('change', () => finish([...(input.files || [])].map((f) => fromFile(f))));
      input.addEventListener('cancel', () => finish([]));
      d.body.appendChild(input);
      input.click();
    });
  }

  /** Files from a drop (DataTransfer) or an <input>'s FileList. Keeps the handle where the browser gives one. */
  async fromDrop(dt) {
    const out = [];
    if (!dt) return out;
    const items = dt.items ? [...dt.items].filter((i) => i.kind === 'file') : [];
    if (items.length) {
      // Ask for every handle first: a DataTransfer is only readable during the drop event's task.
      const pending = items.map((i) => ({ file: i.getAsFile(), handle: typeof i.getAsFileSystemHandle === 'function' ? i.getAsFileSystemHandle().catch(() => null) : null }));
      for (const p of pending) {
        if (!p.file) continue;
        const h = p.handle ? await p.handle : null;
        out.push(hostFile({ name: p.file.name, size: p.file.size, lastModified: p.file.lastModified, type: p.file.type, handle: h && h.kind === 'file' ? h : null, file: p.file, writable: this.browserFS && !!h }));
      }
    } else {
      for (const f of dt.files || dt) out.push(fromFile(f));
    }
    for (const f of out) await this.recent.add(f, 'open');
    return out;
  }

  // ---------------------------------------------------------------- save

  /** Save the document: in place when its target can be written (desktop path; browser handle with browserFileSystem),
   *  else like saveAs (browser: a download, no dialog). */
  async save({ target = null, data, name, types = [], type } = {}) {
    const fileName = name || (target && target.name) || 'Untitled';
    if (target && target.path && this.desktop) {
      try {
        await this.desktop.writeFile(target.path, await toBytes(data));
        const f = this.pathFile(target.path);
        await this.recent.add(f, 'save');
        return { ok: true, how: 'written', target: f, name: baseName(target.path), path: target.path };
      } catch (error) { return { ok: false, error }; }
    }
    if (target && target.handle && this.browserFS && typeof target.handle.createWritable === 'function') {
      const w = await this.writeHandle(target.handle, data, type);
      if (w.ok) { const f = hostFile({ name: target.handle.name, handle: target.handle, writable: true }); await this.recent.add(f, 'save'); return { ok: true, how: 'written', target: f, name: target.handle.name, path: null }; }
      if (!w.cancelled) return w;
    }
    return this.saveAs({ data, name: fileName, types, type, quiet: true });
  }

  /** Save under a new name/place. Desktop: the native dialog; browser: a download (or, with browserFileSystem, the
   *  browser's save dialog). quiet = from save(): a browser download needs no dialog. */
  async saveAs({ data, name = 'Untitled', types = [], type, title } = {}) {
    if (this.desktop) {
      const p = await this.desktop.saveDialog({ defaultPath: name, filters: desktopFilters(types), title });
      if (!p) return { ok: false, cancelled: true };
      try {
        await this.desktop.writeFile(p, await toBytes(data));
        const f = this.pathFile(p);
        await this.recent.add(f, 'save');
        return { ok: true, how: 'written', target: f, name: baseName(p), path: p };
      } catch (error) { return { ok: false, error }; }
    }
    if (this.browserFS && this.win && typeof this.win.showSaveFilePicker === 'function') {
      let h;
      try { h = await this.win.showSaveFilePicker({ suggestedName: name, types: fsaTypes(types), id: (this.app + '-save').slice(0, 32) }); }
      catch (e) { if (e && e.name === 'AbortError') return { ok: false, cancelled: true }; h = null; }
      if (h) {
        const w = await this.writeHandle(h, data, type);
        if (!w.ok) return w;
        const f = hostFile({ name: h.name, handle: h, writable: true });
        await this.recent.add(f, 'save');
        return { ok: true, how: 'written', target: f, name: h.name, path: null };
      }
    }
    this.download(data, name, type);
    await this.recent.add({ name, size: null, path: null, handle: null }, 'save');
    return { ok: true, how: 'downloaded', target: null, name, path: null };
  }

  async writeHandle(h, data, type) {
    try {
      if (typeof h.queryPermission === 'function') {
        let p = await h.queryPermission({ mode: 'readwrite' });
        if (p === 'prompt' && typeof h.requestPermission === 'function') p = await h.requestPermission({ mode: 'readwrite' });
        if (p !== 'granted') return { ok: false, cancelled: true };
      }
      const w = await h.createWritable();
      await w.write(toBlob(data, type));
      await w.close();
      return { ok: true };
    } catch (error) {
      return error && error.name === 'AbortError' ? { ok: false, cancelled: true } : { ok: false, error };
    }
  }

  /** A copy for the user (exports, "Download"): always a download in the browser; the save dialog on the desktop. */
  download(data, name, type) {
    if (this.desktop) { this.saveAs({ data, name, type }); return; }
    const d = this.doc;
    if (!d || typeof URL === 'undefined' || !URL.createObjectURL) return;
    const url = URL.createObjectURL(toBlob(data, type));
    const a = d.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    a.style.display = 'none';
    d.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  // ---------------------------------------------------------------- folders (W2.12: sheet sets)

  /** Ask for a folder. → HostFolder or null (cancelled; or a browser without a folder picker — the app then offers its
   *  own read-only <input webkitdirectory>). Desktop: the native folder dialog; browser: showDirectoryPicker. */
  async pickFolder({ write = false, id, title } = {}) {
    if (this.desktop) {
      if (typeof this.desktop.openFolderDialog !== 'function') return null;
      const p = await this.desktop.openFolderDialog({ title });
      return p ? desktopFolder(this.desktop, p) : null;
    }
    if (this.win && typeof this.win.showDirectoryPicker === 'function') {
      try {
        const dir = await this.win.showDirectoryPicker({ id: String(id || this.app + '-folder').replace(/[^A-Za-z0-9_-]/g, '-').slice(0, 32), mode: write ? 'readwrite' : 'read' });
        return folderFromHandle(dir, !!write);
      } catch (e) {
        if (e && e.name === 'AbortError') return null;
        if (e && (e.name === 'SecurityError' || e.name === 'NotAllowedError')) return null;
        throw e;
      }
    }
    return null;
  }

  /** The folder that holds a file the app was given. Desktop: the file's own folder (the shell must allow it — a
   *  folder picked, or a file it granted with its folder, e.g. a .ccsheets set); browser: null (a page cannot reach a
   *  file's folder — ask with pickFolder). */
  folderOf(file) {
    if (!this.desktop || !file || !file.path) return null;
    const dir = dirName(file.path);
    return dir ? desktopFolder(this.desktop, dir) : null;
  }

  // ---------------------------------------------------------------- launch

  wireLaunch() {
    if (this.desktop && typeof this.desktop.onOpenFiles === 'function') {
      this.desktop.onOpenFiles((paths) => this.deliver((paths || []).map((p) => this.pathFile(p))));
    } else if (this.win && this.win.launchQueue && typeof this.win.launchQueue.setConsumer === 'function') {
      // An installed web app opened with files (File Handling API).
      this.win.launchQueue.setConsumer(async (params) => {
        const files = [];
        for (const h of (params && params.files) || []) {
          try { const file = await h.getFile(); files.push(hostFile({ name: file.name, size: file.size, lastModified: file.lastModified, type: file.type, handle: h, file })); } catch { /* skip */ }
        }
        if (files.length) this.deliver(files);
      });
    }
  }

  deliver(files) {
    if (!files.length) return;
    files.forEach((f) => this.recent.add(f, 'open'));
    if (this.openHandlers.length) this.openHandlers.forEach((fn) => { try { fn(files); } catch { /* app */ } });
    else this.launchQueue.push(...files);
  }

  /** Files the app was started with (each returned once). */
  async launchFiles() {
    let out = this.launchQueue.splice(0);
    if (this.desktop && typeof this.desktop.launchFiles === 'function') {
      const paths = (await this.desktop.launchFiles().catch(() => [])) || [];
      const more = paths.map((p) => this.pathFile(p));
      for (const f of more) await this.recent.add(f, 'open');
      out = out.concat(more);
    }
    return out;
  }

  /** Files opened while the app runs (desktop double-click; an installed web app). Also delivers any queued ones. */
  onOpenFiles(fn) {
    this.openHandlers.push(fn);
    const q = this.launchQueue.splice(0);
    if (q.length) { try { fn(q); } catch { /* app */ } }
    return () => { this.openHandlers = this.openHandlers.filter((x) => x !== fn); };
  }
}

// ------------------------------------------------------------------ the tool dispatcher (a copy of tools/mcp/core.mjs)

// >>> mcp-core (docs/AGENTS-SPEC.md §1, §6; canonical: tools/mcp/core.mjs — host.js carries this block byte for byte: node tools/mcp/sync-core.mjs)
/**
 * The tool dispatcher every surface shares: the headless MCP server (stdio), the CLI, and the app windows (host.control).
 * DOM-free, no imports. JSON-RPC 2.0; MCP methods + the JSON control channel's (§6.1).
 *
 *   const d = createDispatcher({ server: {name, title, version}, instructions, allowed: () => ['read'], info: () => ({…}),
 *                                log: (entry) => …, now: () => Date.now(), listChanged: true });
 *   (listChanged false: a transport that cannot push notifications, e.g. Streamable HTTP without a GET stream)
 *   d.tool({ name, group, title, description, inputSchema, run: async (args, ctx) => result });   → unregister()
 *   await d.handle(message, session)   → a JSON-RPC response, or null for a notification
 *   await d.call(name, args, session)  → an MCP CallToolResult (permissions, schema, log)
 *   d.list()                           → the tool definitions the permissions allow
 *   d.onNotify(fn)                     → fn(notification) for notifications/tools/list_changed (call d.changed())
 *
 * A tool's run() returns plain JSON (sent as structuredContent and as text) or toolResult(content, structured) for images.
 * Throwing → a tool result with isError and the error's message; arguments are checked against inputSchema first.
 */
export const MCP_PROTOCOLS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
export const TOOL_GROUPS = ['read', 'edit', 'save', 'export'];
const RAW = '__ccToolResult';

/** A tool result with its own content list (images) and optional structured data. */
export function toolResult(content, structured) { return { [RAW]: true, content, structured }; }

/** Annotations an MCP client shows, from the tool's group. */
export function groupHints(group) {
  return {
    read: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    edit: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    save: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
    export: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }[group];
}

const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v);
const fits = (t, v) => { const k = typeOf(v); return t === k || (t === 'number' && k === 'integer'); };

/**
 * Check a value against the JSON Schema subset tools use (type, enum, const, minimum, maximum, minLength, maxLength,
 * pattern, items, minItems, maxItems, properties, required, additionalProperties: false, anyOf / oneOf) and fill in
 * defaults of object properties. → list of problems ([] = fine).
 */
export function checkSchema(schema, value, where = 'arguments', out = []) {
  if (!schema || typeof schema !== 'object') return out;
  if (schema.anyOf || schema.oneOf) {
    const alts = schema.anyOf || schema.oneOf;
    if (!alts.some((s) => checkSchema(s, value, where).length === 0)) out.push(where + ' does not match any of the allowed shapes.');
    return out;
  }
  if (schema.type) {
    const ts = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!ts.some((t) => fits(t, value))) { out.push(where + ' must be ' + ts.join(' or ') + '.'); return out; }
  }
  if (schema.const !== undefined && value !== schema.const) out.push(where + ' must be ' + JSON.stringify(schema.const) + '.');
  if (schema.enum && !schema.enum.includes(value)) out.push(where + ' must be one of ' + schema.enum.map((x) => JSON.stringify(x)).join(', ') + '.');
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) out.push(where + ' must be at least ' + schema.minimum + '.');
    if (schema.maximum !== undefined && value > schema.maximum) out.push(where + ' must be at most ' + schema.maximum + '.');
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) out.push(where + ' must have at least ' + schema.minLength + ' characters.');
    if (schema.maxLength !== undefined && value.length > schema.maxLength) out.push(where + ' must have at most ' + schema.maxLength + ' characters.');
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) out.push(where + ' is not in the expected form.');
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) out.push(where + ' must have at least ' + schema.minItems + ' items.');
    if (schema.maxItems !== undefined && value.length > schema.maxItems) out.push(where + ' must have at most ' + schema.maxItems + ' items.');
    if (schema.items) value.forEach((x, i) => checkSchema(schema.items, x, where + '[' + i + ']', out));
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const props = schema.properties || {};
    for (const r of schema.required || []) if (value[r] === undefined) out.push(where + '.' + r + ' is required.');
    for (const [k, v] of Object.entries(value)) {
      if (props[k]) checkSchema(props[k], v, where + '.' + k, out);
      else if (schema.additionalProperties === false) out.push(where + '.' + k + ' is not a known argument.');
      else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') checkSchema(schema.additionalProperties, v, where + '.' + k, out);
    }
    for (const [k, p] of Object.entries(props)) if (value[k] === undefined && p && p.default !== undefined) value[k] = JSON.parse(JSON.stringify(p.default));
  }
  return out;
}

/** Arguments for the log: strings over 200 characters cut, at most 20 keys, nested once. */
export function logArgs(args, depth = 0) {
  if (typeof args === 'string') return args.length > 200 ? args.slice(0, 200) + '…' : args;
  if (Array.isArray(args)) return depth > 1 ? '[' + args.length + ' items]' : args.slice(0, 20).map((x) => logArgs(x, depth + 1));
  if (args && typeof args === 'object') {
    if (depth > 1) return '{…}';
    const o = {};
    for (const [k, v] of Object.entries(args).slice(0, 20)) o[k] = logArgs(v, depth + 1);
    return o;
  }
  return args;
}

class RpcError extends Error { constructor(code, message, data) { super(message); this.code = code; this.data = data; } }

export function createDispatcher(opts = {}) {
  const server = { name: 'cadcraft', title: 'CadCraft', version: '0.0.0', ...(opts.server || {}) };
  const now = opts.now || (() => Date.now());
  const tools = new Map();
  const notifiers = new Set();
  const methods = new Map();
  const allowed = () => { const a = opts.allowed ? opts.allowed() : ['read']; return new Set(Array.isArray(a) || a instanceof Set ? a : []); };

  const def = (t) => {
    if (!t || !/^[a-z][a-z0-9_]{0,63}$/.test(t.name)) throw new Error('A tool name is lower case letters, digits and _: ' + (t && t.name));
    if (!TOOL_GROUPS.includes(t.group)) throw new Error('Tool ' + t.name + ': group must be one of ' + TOOL_GROUPS.join(', '));
    if (typeof t.run !== 'function') throw new Error('Tool ' + t.name + ' has no run().');
    return { name: t.name, title: t.title || t.name, description: t.description || '', group: t.group, inputSchema: t.inputSchema || { type: 'object', properties: {}, additionalProperties: false }, run: t.run, outputSchema: t.outputSchema };
  };
  const definition = (t) => ({ name: t.name, title: t.title, description: t.description + ' (Permission: ' + t.group + '.)', inputSchema: t.inputSchema, annotations: { title: t.title, ...groupHints(t.group) }, ...(t.outputSchema ? { outputSchema: t.outputSchema } : {}) });

  const d = {
    server,
    tool(t) { const x = def(t); tools.set(x.name, x); d.changed(); return () => { if (tools.get(x.name) === x) { tools.delete(x.name); d.changed(); } }; },
    has: (name) => tools.has(name),
    get: (name) => tools.get(name) || null,
    all: () => [...tools.values()],
    list() { const a = allowed(); return [...tools.values()].filter((t) => a.has(t.group)).map(definition); },
    onNotify(fn) { notifiers.add(fn); return () => notifiers.delete(fn); },
    changed() { for (const fn of notifiers) { try { fn({ jsonrpc: '2.0', method: 'notifications/tools/list_changed' }); } catch { /* a transport */ } } },
    method(name, fn) { methods.set(name, fn); return () => methods.delete(name); },

    log(entry) { try { opts.log && opts.log(entry); } catch { /* the log never breaks a call */ } },

    /** Run a tool: permission, schema, the tool, the log. Always resolves to a CallToolResult. */
    async call(name, args, session = {}) {
      const t0 = now();
      const t = tools.get(name);
      const client = (session.client && session.client.name) || session.clientName || null;
      const entry = { time: new Date(t0).toISOString(), client, tool: String(name), group: t ? t.group : null, args: logArgs(args || {}), outcome: 'ok', undo: null, ms: 0 };
      const finish = (res, outcome, message) => { entry.outcome = outcome; entry.ms = now() - t0; if (message) entry.message = String(message).slice(0, 300); d.log(entry); return res; };
      const fail = (msg, outcome = 'error') => finish({ content: [{ type: 'text', text: msg }], isError: true }, outcome, msg);
      if (!t) throw new RpcError(-32602, 'Unknown tool: ' + name);
      if (!allowed().has(t.group)) return fail(t.name + ' needs the ' + t.group + ' permission, which is not allowed. ' + (opts.howToAllow ? opts.howToAllow(t.group) : ''), 'refused');
      const a = args === undefined || args === null ? {} : args;
      if (typeof a !== 'object' || Array.isArray(a)) return fail('arguments must be an object.', 'refused');
      const copy = JSON.parse(JSON.stringify(a));
      const problems = checkSchema(t.inputSchema, copy);
      if (problems.length) return fail('Invalid arguments: ' + problems.slice(0, 8).join(' '), 'refused');
      try {
        const ctx = { group: t.group, client, session, tool: t.name, log: entry };
        const r = await t.run(copy, ctx);
        if (r && r[RAW]) {
          const res = { content: r.content || [] };
          if (r.structured !== undefined) res.structuredContent = r.structured;
          if (r.structured && r.structured.undo) entry.undo = r.structured.undo;
          return finish(res, 'ok');
        }
        const structured = r === undefined || r === null ? { ok: true } : typeof r === 'object' && !Array.isArray(r) ? r : { result: r };
        if (structured.undo) entry.undo = structured.undo;
        const res = { content: [{ type: 'text', text: JSON.stringify(structured, null, 1) }], structuredContent: structured };
        if (structured.error && structured.isError) { res.isError = true; return finish(res, 'error', structured.error); }
        return finish(res, 'ok');
      } catch (err) {
        return fail(err && err.message ? err.message : String(err), err && err.refused ? 'refused' : 'error');
      }
    },

    /** One JSON-RPC message → a response (or null for a notification). Never throws. */
    async handle(msg, session = {}) {
      const isNote = msg && typeof msg === 'object' && msg.id === undefined;
      const reply = (result) => (isNote ? null : { jsonrpc: '2.0', id: msg.id, result });
      const error = (code, message, data) => (isNote ? null : { jsonrpc: '2.0', id: msg && msg.id !== undefined ? msg.id : null, error: { code, message, ...(data !== undefined ? { data } : {}) } });
      if (!msg || typeof msg !== 'object' || Array.isArray(msg) || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') {
        if (msg && typeof msg === 'object' && !Array.isArray(msg) && msg.jsonrpc === '2.0' && msg.method === undefined && (msg.result !== undefined || msg.error !== undefined)) return null;   // a response to us: nothing asked
        return { jsonrpc: '2.0', id: msg && (typeof msg.id === 'string' || typeof msg.id === 'number') ? msg.id : null, error: { code: -32600, message: 'Invalid request' } };
      }
      const p = msg.params && typeof msg.params === 'object' ? msg.params : {};
      try {
        switch (msg.method) {
          case 'initialize': {
            const v = MCP_PROTOCOLS.includes(p.protocolVersion) ? p.protocolVersion : MCP_PROTOCOLS[0];
            session.protocolVersion = v;
            session.client = p.clientInfo && typeof p.clientInfo === 'object' ? { name: String(p.clientInfo.name || '').slice(0, 100), version: String(p.clientInfo.version || '').slice(0, 40) } : { name: 'unknown', version: '' };
            session.initializedAt = now();
            if (opts.onEvent) opts.onEvent('connect', session);
            return reply({ protocolVersion: v, capabilities: { tools: { listChanged: opts.listChanged !== false }, logging: {} }, serverInfo: { name: server.name, title: server.title, version: server.version }, ...(opts.instructions ? { instructions: typeof opts.instructions === 'function' ? opts.instructions() : opts.instructions } : {}) });
          }
          case 'notifications/initialized': session.ready = true; return null;
          case 'notifications/cancelled': case 'notifications/progress': case 'notifications/roots/list_changed': return null;
          case 'ping': return reply({});
          case 'logging/setLevel': session.logLevel = String(p.level || 'info'); return reply({});
          case 'tools/list': return reply({ tools: d.list() });
          case 'tools/call': {
            if (typeof p.name !== 'string') throw new RpcError(-32602, 'tools/call needs a tool name.');
            return reply(await d.call(p.name, p.arguments, session));
          }
          // the JSON control channel (§6.1)
          case 'control.hello':
            session.client = p.client && typeof p.client === 'object' ? { name: String(p.client.name || '').slice(0, 100), version: String(p.client.version || '').slice(0, 40) } : { name: 'script', version: '' };
            if (opts.onEvent) opts.onEvent('connect', session);
            return reply({ app: server.name, title: server.title, version: server.version, protocol: 1, tools: d.list().length });
          case 'tools.list': return reply({ tools: d.list() });
          case 'tools.call': {
            if (typeof p.name !== 'string') throw new RpcError(-32602, 'tools.call needs a tool name.');
            return reply(await d.call(p.name, p.arguments, session));
          }
          case 'app.info': return reply(opts.info ? await opts.info() : { app: server.name, version: server.version });
          default: {
            const fn = methods.get(msg.method);
            if (fn) return reply(await fn(p, session));
            if (isNote) return null;
            throw new RpcError(-32601, 'Method not found: ' + msg.method);
          }
        }
      } catch (err) {
        if (err instanceof RpcError) return error(err.code, err.message, err.data);
        return error(-32603, 'Internal error: ' + (err && err.message ? err.message : String(err)));
      }
    },
  };
  return d;
}
// <<< mcp-core

// ------------------------------------------------------------------ assistants and scripts: the control channel (W2.14, X.5)
//
// Owner of this section: session agents (docs/AGENTS-SPEC.md §6). host.control is this window's side: the app registers its
// tools and Settings › Assistants turns them on; requests come from Studio — the desktop bridge (cadcraftDesktop.control)
// or Studio's window channel (window.cadcraftStudio, message types control.*) — and the dispatcher below answers them.
// createControlRelay() is Studio's side (the hub page): MCP requests from Studio's local server → the app windows.
//
//   host.control.tool({ name, group, title, description, inputSchema, run: async (args, ctx) => result })   → unregister
//   host.control.configure({ enabled, groups: ['read', …], title, version, info: () => ({…}), undo: (label, fn) => …,
//                            busy: () => null | 'what the person is doing' })
//   host.control.step(label, fn)      one undo step labelled `label` (the app's undo hook), for edit tools
//   host.control.on('connect' | 'disconnect' | 'call' | 'change', fn) · host.control.on('<method>', fn) (a raw method)
//   host.control.sessions()           assistants connected now: [{id, client, startedAt, lastAt}]
//   host.control.disconnect(id?)      end one session (or all); its next request is refused (-32002)
//   host.control.log                  the activity log (last 500 calls; AGENTS-SPEC §4)
//   host.control.acting               the session whose edit / save / export call is running now, else null (Studio Live
//                                     sends its edits on that assistant's own session client, LV.18)
//   await host.control.handle(message, sessionId)   → the JSON-RPC answer (what the transports call)
//
// The desktop bridge (optional members of bridge v1): cadcraftDesktop.control = { onMessage((message, reply, sessionId) => …),
// status(state) }. The channel: control.request {rid, sid, client, message} → control.response {rid, answer} to the sender;
// control.who → control.status {app, title, enabled, groups, tools, focusedAt, connected}; control.disconnect {sid}.

const CONTROL_EVENTS = ['connect', 'disconnect', 'call', 'change'];
const CONTROL_LOG_MAX = 500;
const CONNECTED_MS = 10 * 60 * 1000;   // a session counts as connected this long after it started …
const ACTIVE_MS = 60 * 1000;           // … or after its last call

function makeControl(host) {
  const st = { enabled: false, groups: ['read'], title: host.app, version: 'dev', info: null, undo: null, busy: null, channel: null, acting: [] };
  const log = [];
  const ev = new Map();
  const emit = (type, detail) => { for (const fn of ev.get(type) || []) { try { fn(detail); } catch { /* a listener */ } } };
  const sessions = new Map();
  const pub = (s) => ({ id: s.id, client: s.client ? { ...s.client } : null, startedAt: s.startedAt, lastAt: s.lastAt });
  let focusedAt = 0;

  const d = createDispatcher({
    server: { name: host.app, title: host.app, version: 'dev' },
    listChanged: false,
    allowed: () => (st.enabled ? st.groups : []),
    howToAllow: () => 'The person can allow it in ' + st.title + ': Settings › Assistants.',
    log: (e) => { log.push(e); if (log.length > CONTROL_LOG_MAX) log.shift(); emit('call', e); emit('change', 'call'); },
    info: async () => ({ app: host.app, title: st.title, version: st.version, enabled: st.enabled, groups: st.enabled ? [...st.groups] : [], ...(st.info ? await st.info() : {}) }),
  });

  const connected = () => {
    const t = host.now();
    return [...sessions.values()].filter((s) => !s.ended && (t - s.startedAt < CONNECTED_MS || t - s.lastAt < ACTIVE_MS)).map(pub);
  };

  function status(to) {
    const s = { app: host.app, title: st.title, enabled: st.enabled, groups: st.enabled ? [...st.groups] : [], tools: st.enabled ? d.list().length : 0, focusedAt, connected: connected().length };
    try { if (host.desktop && host.desktop.control && typeof host.desktop.control.status === 'function') host.desktop.control.status(s); } catch { /* an older shell */ }
    try { if (st.channel) st.channel.post('control.status', s, to); } catch { /* closed */ }
  }

  async function handle(message, sid = 'local', client = null) {
    const id = message && typeof message === 'object' && !Array.isArray(message) ? message.id : undefined;
    const refuse = (code, text) => (id === undefined ? null : { jsonrpc: '2.0', id, error: { code, message: text } });
    if (!st.enabled) return refuse(-32001, st.title + ' does not take assistants: they are turned off in its Settings › Assistants.');
    const key = String(sid).slice(0, 120);
    let s = sessions.get(key);
    if (s && s.ended) return refuse(-32002, 'The person disconnected this assistant from ' + st.title + '. Connect again to continue.');
    const t = host.now();
    if (!s) {
      for (const [k, x] of sessions) if (x.ended || t - x.lastAt > CONNECTED_MS * 6) sessions.delete(k);
      s = { id: key, client: client && typeof client === 'object' ? { name: String(client.name || '').slice(0, 100), version: String(client.version || '').slice(0, 40) } : null, startedAt: t, lastAt: t, ended: false };
      sessions.set(key, s);
      emit('connect', pub(s)); emit('change', 'connect'); status();
    }
    s.lastAt = t;
    if (message && (message.method === 'tools/call' || message.method === 'tools.call') && st.busy) {
      const tool = d.get(message.params && message.params.name);
      const doing = tool && tool.group !== 'read' ? st.busy() : null;
      if (doing) {
        d.log({ time: new Date(t).toISOString(), client: s.client && s.client.name, tool: tool.name, group: tool.group, args: logArgs((message.params && message.params.arguments) || {}), outcome: 'refused', undo: null, ms: 0, message: 'busy' });
        return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: st.title + ' is in the middle of ' + doing + ' (the person is working). Try again when it is done.' }], isError: true } };
      }
    }
    // An edit (save, export) call running: whose it is, while it runs (LV.18). Calls may overlap: the newest one counts.
    const call = message && (message.method === 'tools/call' || message.method === 'tools.call') ? d.get(message.params && message.params.name) : null;
    const acting = call && call.group !== 'read' ? { id: s.id } : null;
    if (acting) st.acting.push(acting);
    let answer;
    try { answer = await d.handle(message, s); }
    finally { if (acting) st.acting = st.acting.filter((x) => x !== acting); }
    if (s.client === null && message && message.method === 'initialize' && message.params && message.params.clientInfo) emit('change', 'connect');
    return answer;
  }

  function disconnect(sid) {
    const hit = [];
    for (const s of sessions.values()) if (!s.ended && (sid === undefined || s.id === sid)) { s.ended = true; hit.push(s.id); }
    for (const id of hit) {
      emit('disconnect', { id });
      try { if (st.channel) st.channel.post('control.disconnect', { sid: id.replace(/^studio:/, '') }); } catch { /* closed */ }
    }
    if (hit.length) { emit('change', 'disconnect'); status(); }
    return hit;
  }

  // ---- transports
  let deskWired = false;
  function wireDesktop() {
    const dc = host.desktop && host.desktop.control;
    if (deskWired || !dc || typeof dc.onMessage !== 'function') return;
    deskWired = true;
    dc.onMessage((message, reply, sid) => {
      handle(message, 'desktop:' + (sid || 'shell')).then((a) => { if (typeof reply === 'function') reply(a); }, () => {});
    });
  }
  let chOff = null, tries = 0;
  function wireChannel(ch) {
    if (chOff) return;
    const studio = ch || (host.win && host.win.cadcraftStudio) || null;
    if (!studio) { if (host.win && !ch && tries++ < 40 && typeof setTimeout === 'function') setTimeout(() => wireChannel(), 250); return; }
    st.channel = studio;
    const offs = [
      studio.on('control.request', (data, env) => {
        if (!data || typeof data !== 'object' || typeof data.rid !== 'string' || data.rid.length > 64) return;
        handle(data.message, 'studio:' + String(data.sid || env.from).slice(0, 100), data.client || null)
          .then((answer) => { try { studio.post('control.response', { rid: data.rid, answer }, env.from); } catch { /* closed */ } }, () => {});
      }),
      studio.on('control.who', (data, env) => status(env.from)),
    ];
    chOff = () => offs.forEach((f) => { try { f(); } catch { /* closed */ } });
    status();
  }
  if (host.win && typeof host.win.addEventListener === 'function') host.win.addEventListener('focus', () => { focusedAt = host.now(); if (st.enabled) status(); });

  const api = {
    tool(def) { const off = d.tool(def); status(); return () => { off(); status(); }; },
    has: (name) => d.has(name),
    on(name, fn) {
      if (CONTROL_EVENTS.includes(name)) { if (!ev.has(name)) ev.set(name, new Set()); ev.get(name).add(fn); return () => ev.get(name).delete(fn); }
      return d.method(name, fn);
    },
    configure(o = {}) {
      if ('enabled' in o) { const was = st.enabled; st.enabled = !!o.enabled; if (was && !st.enabled) disconnect(); }
      if (Array.isArray(o.groups)) st.groups = o.groups.filter((x) => TOOL_GROUPS.includes(x));
      if (o.title) { st.title = String(o.title); d.server.title = st.title; }
      if (o.version) { st.version = String(o.version); d.server.version = st.version; }
      if ('info' in o) st.info = typeof o.info === 'function' ? o.info : null;
      if ('undo' in o) st.undo = typeof o.undo === 'function' ? o.undo : null;
      if ('busy' in o) st.busy = typeof o.busy === 'function' ? o.busy : null;
      if (o.channel) wireChannel(o.channel);
      if (st.enabled) { wireDesktop(); wireChannel(); }
      if (st.enabled && host.doc && typeof host.doc.hasFocus === 'function' && host.doc.hasFocus()) focusedAt = host.now();
      status();
      emit('change', 'configure');
      return api;
    },
    get enabled() { return st.enabled; },
    get groups() { return [...st.groups]; },
    get title() { return st.title; },
    get acting() { return st.acting.length ? st.acting[st.acting.length - 1].id : null; },
    get log() { return log.slice(); },
    clearLog() { log.length = 0; emit('change', 'log'); },
    sessions: connected,
    disconnect,
    handle,
    list: () => d.list(),
    call: (name, args, session = {}) => d.call(name, args, session),
    step(label, fn) { return st.undo ? st.undo(label, fn) : fn(); },
    status,
  };
  return api;
}

// ---- Settings › Assistants and the app bar's "assistant connected" indicator (X.6; AGENTS-SPEC §7)
//
// getHost() mounts both by itself: the settings into any [data-assistants-settings] element (an app puts one in its
// settings.inc), the indicator into the app bar. The switches are kept per app in localStorage cadcraft.assistants.<app>
// ({enabled, groups}); off by default, read the only group on when first turned on. No tool can change them.

export const ASSIST_KEY = 'cadcraft.assistants.';
const AT = (k, v) => (typeof window !== 'undefined' && window.ccShellT ? window.ccShellT('shell.assistants.' + k, v) : k);

export function assistantPrefs(host) {
  try {
    const raw = host.win && host.win.localStorage ? host.win.localStorage.getItem(ASSIST_KEY + host.app) : null;
    const v = raw ? JSON.parse(raw) : null;
    if (v && typeof v === 'object') return { enabled: !!v.enabled, groups: Array.isArray(v.groups) ? v.groups.filter((x) => TOOL_GROUPS.includes(x)) : ['read'] };
  } catch { /* private mode */ }
  return { enabled: false, groups: ['read'] };
}
function saveAssistantPrefs(host, p) {
  try { if (host.win && host.win.localStorage) host.win.localStorage.setItem(ASSIST_KEY + host.app, JSON.stringify({ enabled: !!p.enabled, groups: p.groups })); } catch { /* private mode */ }
}

function domMaker(d) {
  return (tag, attrs = {}, ...kids) => {
    const n = d.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined && v !== false) n.setAttribute(k, v === true ? '' : v);
    for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c);
    return n;
  };
}
const clientName = (s) => (s && s.client && s.client.name) || AT('someone');
const groupList = (groups) => groups.map((g) => AT('short.' + g)).join(', ');

/** Settings › Assistants into `root`. Returns a re-render function. */
export function mountAssistants(host, root) {
  const d = root.ownerDocument, el = domMaker(d), c = host.control;
  const title = () => c.title;
  root.classList.add('shell-assist');
  const on = el('input', { type: 'checkbox', 'data-assist-on': true });
  const groups = Object.fromEntries(TOOL_GROUPS.map((g) => [g, el('input', { type: 'checkbox', 'data-assist-group': g })]));
  const status = el('p', { class: 'shell-hint-text shell-assist-status', 'data-assist-status': true, role: 'status' });
  const disc = el('button', { type: 'button', class: 'shell-assist-btn', 'data-assist-disconnect': true });
  const list = el('ol', { class: 'shell-assist-log', 'data-assist-log': true });
  const save = el('button', { type: 'button', class: 'shell-assist-btn', 'data-assist-save': true });
  const clear = el('button', { type: 'button', class: 'shell-assist-btn', 'data-assist-clear': true });
  const sum = el('summary', {});
  const legend = el('legend', {});
  const groupBox = el('div', { class: 'shell-assist-groups', role: 'group' }, TOOL_GROUPS.map((g) => el('label', { class: 'shell-check' }, groups[g], ' ', el('span', { 'data-assist-group-label': g }))));
  const set = el('fieldset', { class: 'shell-set' },
    legend,
    el('label', { class: 'shell-check' }, on, ' ', el('span', { 'data-assist-on-label': true })),
    el('p', { class: 'shell-hint-text', 'data-assist-hint': true }),
    groupBox,
    el('div', { class: 'shell-assist-row' }, status, disc),
    el('details', { class: 'shell-assist-activity', 'data-assist-activity': true }, sum, list, el('div', { class: 'shell-btns' }, save, clear)));
  root.replaceChildren(set);

  const persist = () => {
    const p = { enabled: on.checked, groups: TOOL_GROUPS.filter((g) => groups[g].checked) };
    if (p.enabled && !p.groups.length) { p.groups = ['read']; groups.read.checked = true; }
    saveAssistantPrefs(host, p);
    c.configure(p);
  };
  on.addEventListener('change', () => {
    if (on.checked && !TOOL_GROUPS.some((g) => groups[g].checked)) groups.read.checked = true;
    persist();
  });
  for (const g of TOOL_GROUPS) groups[g].addEventListener('change', persist);
  disc.addEventListener('click', () => c.disconnect());
  clear.addEventListener('click', () => c.clearLog());
  save.addEventListener('click', () => {
    const lines = c.log.map((e) => JSON.stringify(e)).join('\n') + '\n';
    host.download(lines, host.app + '-assistant-activity.jsonl', 'application/x-ndjson');
  });
  const dlg = root.closest && root.closest('dialog');
  if (dlg) dlg.addEventListener('cc-settings-reset', () => { on.checked = false; for (const g of TOOL_GROUPS) groups[g].checked = g === 'read'; persist(); });

  const locale = (typeof window !== 'undefined' && window.ccShellT && window.ccShellT.locale && window.ccShellT.locale()) || undefined;
  const render = () => {
    legend.textContent = AT('title');   // every label here, each time: the shell's words may arrive after this module
    groupBox.setAttribute('aria-label', AT('groups'));
    for (const g of TOOL_GROUPS) set.querySelector('[data-assist-group-label="' + g + '"]').textContent = AT('group.' + g);
    on.checked = c.enabled;
    for (const g of TOOL_GROUPS) { groups[g].checked = c.groups.includes(g); groups[g].disabled = !c.enabled; }
    set.querySelector('[data-assist-on-label]').textContent = AT('on', { app: title() });
    set.querySelector('[data-assist-hint]').textContent = AT('hint', { app: title() });
    const ss = c.sessions();
    status.textContent = !c.enabled ? AT('off') : !ss.length ? AT('none') : ss.length === 1 ? AT('connected', { name: clientName(ss[0]) }) : AT('connected.many', { n: ss.length });
    disc.textContent = AT('disconnect');
    disc.hidden = !ss.length;
    const log = c.log.slice().reverse().slice(0, 100);
    sum.textContent = AT('activity', { n: c.log.length });
    list.replaceChildren(...(log.length ? log.map((e) => el('li', { class: 'shell-assist-entry', 'data-outcome': e.outcome },
      el('time', { datetime: e.time }, (() => { try { return new Date(e.time).toLocaleTimeString(locale); } catch { return e.time; } })()), ' ',
      el('span', { class: 'shell-assist-tool' }, e.tool), ' ',
      el('span', { class: 'shell-assist-outcome' }, AT('outcome.' + e.outcome)),
      e.undo ? el('span', { class: 'shell-assist-undo' }, ' — ' + AT('undo', { label: e.undo })) : null,
      e.message && e.outcome !== 'ok' ? el('span', { class: 'shell-assist-msg' }, ' — ' + e.message) : null)) : [el('li', { class: 'shell-assist-empty' }, AT('activity.empty'))]));
    save.textContent = AT('activity.save'); clear.textContent = AT('activity.clear');
    save.disabled = clear.disabled = !c.log.length;
  };
  c.on('change', render);
  render();
  if (typeof window !== 'undefined' && !window.ccShellT && d.readyState !== 'complete') window.addEventListener('load', render, { once: true });
  return render;
}

/** The app bar's indicator: shown while an assistant is connected; its menu says who and what it may do, with Disconnect. */
export function mountAssistantIndicator(host, bar) {
  const d = bar.ownerDocument, el = domMaker(d), c = host.control;
  const label = el('span', { class: 'app-bar-btn-label' });
  const btn = el('button', { type: 'button', class: 'app-bar-btn app-bar-assist', 'data-assist-indicator': true, 'aria-haspopup': 'true', 'aria-expanded': 'false', hidden: true },
    el('i', { class: 'bi bi-plug', 'aria-hidden': 'true' }), label);
  const live = el('span', { class: 'visually-hidden', role: 'status', 'aria-live': 'polite', 'data-assist-live': true });
  const before = bar.querySelector('.app-bar-help, [data-help-open]');
  if (before) bar.insertBefore(btn, before); else bar.append(btn);
  bar.append(live);
  let menu = null;
  const close = () => { if (menu) { menu.remove(); menu = null; btn.setAttribute('aria-expanded', 'false'); } };
  btn.addEventListener('click', () => {
    if (menu) { close(); return; }
    const ss = c.sessions();
    const disc = el('button', { type: 'button', 'data-assist-menu-disconnect': true }, AT('disconnect'));
    const settings = el('button', { type: 'button', 'data-assist-menu-settings': true }, AT('menu.settings'));
    menu = el('div', { class: 'offline-menu shell-assist-menu', role: 'dialog', 'aria-label': AT('banner.title', { app: c.title }) },
      ...ss.map((s) => el('p', {}, AT('banner.who', { name: clientName(s), app: c.title }))),
      el('p', {}, AT('banner.can', { groups: groupList(c.groups) })),
      el('p', {}, AT('banner.undo')), disc, settings);
    disc.addEventListener('click', () => { c.disconnect(); close(); });
    settings.addEventListener('click', () => { close(); const s = d.querySelector('[data-settings-open]'); if (s) s.click(); });
    d.body.append(menu);
    const r = btn.getBoundingClientRect();
    menu.style.top = Math.round(r.bottom + 6) + 'px';
    menu.style.left = Math.max(8, Math.round(Math.min(r.left, (d.documentElement.clientWidth || 800) - menu.offsetWidth - 8))) + 'px';
    btn.setAttribute('aria-expanded', 'true');
    setTimeout(() => d.addEventListener('click', function off(e) { if (menu && !menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) { close(); d.removeEventListener('click', off); } }), 0);
  });
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu) close(); });
  let was = 0;
  const render = () => {
    const ss = c.enabled ? c.sessions() : [];
    btn.hidden = !ss.length;
    if (!ss.length) close();
    const name = ss.length === 1 ? clientName(ss[0]) : AT('n.assistants', { n: ss.length });
    label.textContent = ss.length ? AT('banner', { name }) : '';
    btn.title = ss.length ? AT('banner.title', { app: c.title }) + ' — ' + AT('banner.can', { groups: groupList(c.groups) }) : '';
    if (ss.length && !was) live.textContent = AT('banner.who', { name, app: c.title });
    was = ss.length;
  };
  c.on('change', render);
  if (typeof setInterval === 'function') setInterval(render, 30000);   // "connected" ends 10 minutes after the last contact
  render();
  return render;
}

/**
 * Studio's side (the hub page): take MCP / control-channel messages from Studio's local server and route them to the app
 * windows over the window channel. `channel` = hub/channel.js's openChannel({app: 'studio'}). The server owns the HTTP
 * rules (127.0.0.1, token, Host/Origin, session ids: AGENTS-SPEC §6.2) and calls relay.handle(message, session) with
 * session = {id} kept per Mcp-Session-Id; onDisconnect(sid) tells it the person disconnected that session in a window.
 */
export function createControlRelay({ channel, now = () => Date.now(), timeout = 120000, server = {}, onDisconnect = null } = {}) {
  if (!channel || typeof channel.on !== 'function' || typeof channel.post !== 'function') throw new Error('createControlRelay needs Studio\'s window channel.');
  const windows = new Map();
  const pending = new Map();
  const offs = [
    channel.on('control.status', (data, env) => {
      if (!data || typeof data !== 'object') return;
      windows.set(env.from, { window: env.from, app: String(data.app || env.app || '').slice(0, 40), title: String(data.title || '').slice(0, 200), enabled: !!data.enabled,
        groups: Array.isArray(data.groups) ? data.groups.filter((x) => TOOL_GROUPS.includes(x)) : [], tools: data.tools | 0, focusedAt: +data.focusedAt || 0, seenAt: now() });
    }),
    channel.on('bye', (data, env) => { windows.delete(env.from); }),
    channel.on('hello', (data, env) => { try { channel.post('control.who', null, env.from); } catch { /* closed */ } }),
    channel.on('control.response', (data, env) => {
      const p = data && pending.get(data.rid);
      if (!p || p.to !== env.from) return;
      clearTimeout(p.timer); pending.delete(data.rid); p.resolve(data.answer);
    }),
    channel.on('control.disconnect', (data) => { if (data && typeof data.sid === 'string' && onDisconnect) { try { onDisconnect(data.sid); } catch { /* the server */ } } }),
  ];
  const rid = () => newId().replace(/-/g, '').slice(0, 24);
  const ask = (win, message, session) => new Promise((resolve) => {
    const r = rid();
    const timer = setTimeout(() => { pending.delete(r); resolve(message.id === undefined ? null : { jsonrpc: '2.0', id: message.id, error: { code: -32003, message: 'The app window did not answer in time.' } }); }, timeout);
    pending.set(r, { resolve, timer, to: win });
    channel.post('control.request', { rid: r, sid: session.id, client: session.client || null, message }, win);
  });
  const live = () => [...windows.values()].filter((w) => w.enabled);
  const pick = (id) => (id ? windows.get(id) || null : live().sort((a, b) => b.focusedAt - a.focusedAt || b.seenAt - a.seenAt)[0] || null);
  const winProp = { type: 'string', maxLength: 90, description: 'The app window to use (from windows_list); default the one used last.' };

  const d = createDispatcher({
    server: { name: 'cadcraft-studio', title: 'CadCraft Studio', version: '0.4', ...server },
    listChanged: false,
    allowed: () => ['read'],
    now,
    instructions: 'Tools of the CadCraft app windows the person has opened in Studio and allowed in Settings › Assistants. windows_list shows them; each tool acts on the window used last unless you pass window.',
  });
  d.tool({ name: 'windows_list', group: 'read', title: 'List app windows', description: 'The app windows open in Studio, which of them take assistants, and what each allows.',
    run: async () => ({ windows: [...windows.values()].map((w) => ({ window: w.window, app: w.app, title: w.title, assistants: w.enabled, allowed: w.groups, tools: w.tools })) }) });

  async function handle(msg, session = {}) {
    if (!session.id) session.id = 'relay';
    if (!msg || typeof msg !== 'object' || Array.isArray(msg) || msg.jsonrpc !== '2.0') return d.handle(msg, session);
    const m = msg.method;
    if (m === 'tools/list' || m === 'tools.list') {
      const base = d.list();
      const w = pick(null);
      if (!w) return { jsonrpc: '2.0', id: msg.id, result: { tools: base } };
      const a = await ask(w.window, { jsonrpc: '2.0', id: 1, method: 'tools/list' }, session);
      const theirs = a && a.result && Array.isArray(a.result.tools) ? a.result.tools : [];
      return { jsonrpc: '2.0', id: msg.id, result: { tools: base.concat(theirs.filter((t) => t.name !== 'windows_list').map((t) => ({ ...t, inputSchema: { ...t.inputSchema, properties: { ...(t.inputSchema && t.inputSchema.properties || {}), window: winProp } } }))) } };
    }
    if (m === 'tools/call' || m === 'tools.call') {
      const p = msg.params && typeof msg.params === 'object' ? msg.params : {};
      if (p.name === 'windows_list') return d.handle(msg, session);
      const args = p.arguments && typeof p.arguments === 'object' && !Array.isArray(p.arguments) ? { ...p.arguments } : {};
      const wid = typeof args.window === 'string' ? args.window : null;
      delete args.window;
      const w = pick(wid);
      if (!w || !w.enabled) {
        const text = wid ? 'There is no app window ' + wid + ' taking assistants (windows_list shows them).' : 'No app window takes assistants yet: the person opens an app and turns on Settings › Assistants.';
        return msg.id === undefined ? null : { jsonrpc: '2.0', id: msg.id, result: { content: [{ type: 'text', text }], isError: true } };
      }
      return ask(w.window, { ...msg, params: { ...p, arguments: args } }, session);
    }
    if (m === 'initialize' || m === 'ping' || m === 'logging/setLevel' || m === 'control.hello' || (typeof m === 'string' && m.startsWith('notifications/'))) return d.handle(msg, session);
    const w = pick(null);
    if (!w) return d.handle(msg, session);
    return ask(w.window, msg, session);
  }

  channel.post('control.who', null);
  return {
    handle,
    windows: () => [...windows.values()].map((w) => ({ ...w })),
    refresh: () => channel.post('control.who', null),
    close() { offs.forEach((f) => { try { f(); } catch { /* the channel closed first */ } }); for (const p of pending.values()) clearTimeout(p.timer); pending.clear(); },
  };
}

// ------------------------------------------------------------------ the start screen's recent list (1.4)

const T = (k, v) => (typeof window !== 'undefined' && window.ccShellT ? window.ccShellT(k, v) : k);

function whenText(t, now, locale) {
  const diff = Math.round((t - now) / 1000), abs = Math.abs(diff);
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    if (abs < 45) return rtf.format(0, 'second');
    if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    if (abs < 7 * 86400) return rtf.format(Math.round(diff / 86400), 'day');
    return new Date(t).toLocaleDateString(locale, { dateStyle: 'medium' });
  } catch { return new Date(t).toLocaleString(); }
}

/** Fill a [data-recent-files] element with this app's reopenable recent files. Returns a re-render function. */
export function mountRecent(host, root) {
  const d = root.ownerDocument;
  const locale = (typeof window !== 'undefined' && window.ccShellT && window.ccShellT.locale && window.ccShellT.locale()) || undefined;
  const max = Math.max(1, Math.min(20, parseInt(root.getAttribute('data-max') || '8', 10) || 8));
  const el = (tag, attrs = {}, ...kids) => {
    const n = d.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined && v !== false) n.setAttribute(k, v === true ? '' : v);
    for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c);
    return n;
  };
  root.classList.add('shell-recent');
  let busy = false;
  const render = async () => {
    const rows = (await host.recent.list()).filter((e) => e.reopen).slice(0, max);
    root.hidden = !rows.length;
    if (!rows.length) { root.replaceChildren(); return; }
    const ul = el('ul', { class: 'shell-recent-list' });
    for (const e of rows) {
      const msg = el('p', { class: 'shell-recent-msg', role: 'status' });
      const where = e.path ? e.path.slice(0, Math.max(0, e.path.length - e.name.length)).replace(/[\/]$/, '') : '';
      const open = el('button', { type: 'button', class: 'shell-recent-open', 'data-recent-open': e.id, title: e.path || e.name },
        el('i', { class: 'bi bi-file-earmark', 'aria-hidden': 'true' }), ' ',
        el('span', { class: 'shell-recent-name' }, e.name),
        el('span', { class: 'shell-recent-when' }, T(e.savedAt && e.savedAt >= (e.openedAt || 0) ? 'shell.recent.saved' : 'shell.recent.opened', { when: whenText(Math.max(e.openedAt || 0, e.savedAt || 0), host.now(), locale) })),
        where ? el('span', { class: 'shell-recent-where' }, where) : null);
      const rm = el('button', { type: 'button', class: 'shell-x shell-recent-rm', 'data-recent-remove': e.id, 'aria-label': T('shell.recent.remove', { name: e.name }), title: T('shell.recent.remove', { name: e.name }) },
        el('i', { class: 'bi bi-x', 'aria-hidden': 'true' }));
      open.addEventListener('click', async () => {
        if (busy) return;
        busy = true;
        msg.textContent = T('shell.recent.opening');
        try {
          const f = await host.recent.open(e);   // inside the click: the browser may ask to allow it again
          if (f && !f.error) { msg.textContent = ''; host.deliver([f]); }
          else if (f && f.error === 'gone') { msg.textContent = T('shell.recent.gone'); await host.recent.remove(e); }
          else msg.textContent = T('shell.recent.denied');
        } catch { msg.textContent = T('shell.recent.denied'); }
        busy = false;
      });
      rm.addEventListener('click', () => host.recent.remove(e));
      ul.append(el('li', { class: 'shell-recent-row', 'data-recent': e.id }, open, rm, msg));
    }
    const clear = el('button', { type: 'button', class: 'shell-recent-clear', 'data-recent-clear': true }, T('shell.recent.clear'));
    clear.addEventListener('click', () => host.recent.clear());
    root.replaceChildren(el('h2', { class: 'shell-recent-h' }, T('shell.recent.title')), ul, clear);
  };
  host.on('recent', () => { render(); });
  render();
  return render;
}

// ------------------------------------------------------------------ Studio Live: host.live (0.5 LV.5)
// Owner of this section: session live-core (docs/LIVE-PROTOCOL.md; the client is live-client.js, copied beside this file).
// The app never sees the network (spec § 3): it passes its adapter (spec § 4) and gets a connected LiveClient back.
//   host.live.available()   → { studio, page }: Studio's bridge is here / this page was served by a host on the LAN (LV.12)
//   await host.live.join({ adapter, name, device?, code | link | url, hash?, proof? })   → LiveClient (a joiner)
//   await host.live.start({ adapter, name, role? })   → the host's own window (or the replica) on Studio's in-process channel
//   host.live.pageCode()     → the short code a browser joiner's link carried (`…/apps/<slug>/#live=K7-Q4M2X`, the QR on
//                              the host's screen), taken out of the address bar; null when there is none
//   host.live.client         → the LiveClient now running here, or null
//   host.live.on(fn)         → called with the client when one starts, and with null when it ends
//   await host.live.assistant({ person, name?, device? })   → LV.18: a second LiveClient in this window for an assistant
//                              connected here, joining as its own session client (role `assistant`; the host approves it,
//                              the host's own at once) with a one-time key `person` (this window's client) asks for; the
//                              same way in as the person's. null when the session gives no key (a viewer, too many).
// Transports, in order: Studio's bridge (window.cadcraftDesktop.live.transport(kind, opts) → a live-client transport;
// Studio's app pages come from Studio's own origin, which Chromium-based webviews don't let open sockets to LAN addresses),
// an explicit `url`, else this page's own host (`ws://<host>/live`) when the page came from a live host.
// Codes and links need live-crypto.js (session live-relay) and the @noble import-map entries in the build's manifest.
// Studio's bridge may also bring `signIn(aud)` (the joiner's signed-in name, LV.19; `opts.signIn` wins) and `startFrom(state)`
// (this window becomes the host when the host hands the session over, LV.17); after a handoff the client reaches the new host
// through the bridge's 'join' transport, else a WebSocket.
function makeLive(host) {
  const st = { client: null, fns: new Set(), lib: null, crypto: null };
  const lib = async () => st.lib || (st.lib = await import('./live-client.js'));
  const bridge = () => (host.desktop && host.desktop.live && typeof host.desktop.live.transport === 'function' ? host.desktop.live : null);
  const pageHost = () => {
    const w = host.win;
    return w && w.location && w.location.protocol === 'http:' && w.document && w.document.querySelector && w.document.querySelector('meta[name="cc-live"]') ? w.location.host : null;
  };
  const set = (c) => {
    st.client = c;
    for (const fn of st.fns) { try { fn(c); } catch { /* a listener */ } }
    if (c) c.on('status', ({ status }) => { if (c.final && st.client === c) set(null); });
  };
  const assistant = async ({ person, name = '', device = '' } = {}) => {
    // After a host handoff the way in has changed (the new host's addresses): the assistant then works through its person's
    // connection, as before LV.18.
    if (!person || person.final || person.person || person.relocated || !['host', 'editor'].includes(person.role)) return null;
    const key = await person.requestAssistant();
    if (!key) return null;
    const L = await lib();
    const b = bridge();
    const app = person.adapter && person.adapter.app, schema = person.adapter && person.adapter.schema;
    const local = person.o.role === 'host';   // the host's window: in-process, as the host's own
    let transport = null;
    if (b) transport = b.transport(local ? 'local' : 'join', { url: person.joinUrl, app, schema });
    else if (person.joinUrl) transport = L.webSocketTransport(person.joinUrl);
    if (!transport) return null;
    const secure = !local && person.secure && !(b && b.encrypts);
    const loadCrypto = async () => st.crypto || (st.crypto = await import('./live-crypto.js'));
    const crypto = secure ? await loadCrypto() : null;
    const a = new L.LiveClient({ transport, person, assistantKey: key, name: String(name || '').slice(0, 80), device, secure, crypto, loadCrypto,
      relocate: (url) => (b ? b.transport('join', { url, app, schema }) : L.webSocketTransport(url)) });
    person.linkAssistant(a);
    // The person leaves or the session ends: the assistant's client goes too.
    person.on('status', () => { if (person.final && !a.final) a.leave(); });
    a.connect();
    return a;
  };
  const run = async (opts, kind) => {
    if (st.client && !st.client.final) throw new Error('A live session is already running in this window.');
    const L = await lib();
    const b = bridge();
    let transport = null;
    const app = opts.adapter && opts.adapter.app, schema = opts.adapter && opts.adapter.schema;
    if (b) transport = b.transport(kind, { code: opts.code, link: opts.link, url: opts.url, app, schema });
    else if (opts.url) transport = L.webSocketTransport(opts.url);
    else if (kind === 'join' && pageHost()) transport = L.webSocketTransport('ws://' + pageHost() + '/live');
    if (!transport) throw new Error('No way to reach a live session from here.');
    const secure = kind === 'join' && !!(opts.code || opts.link) && !(b && b.encrypts);
    const loadCrypto = async () => st.crypto || (st.crypto = await import('./live-crypto.js'));
    const crypto = secure ? await loadCrypto() : null;
    const signIn = typeof opts.signIn === 'function' ? opts.signIn
      : kind === 'join' && b && typeof b.signIn === 'function' ? (aud) => b.signIn(aud) : undefined;
    const takeOver = b && typeof b.startFrom === 'function' ? async (state) => {
      const s = await b.startFrom(state);
      return s && s.running ? { addrs: s.addrs || [], port: s.port, transport: b.transport('local', { app, schema }) } : null;
    } : undefined;
    const c = new L.LiveClient({
      transport, adapter: opts.adapter, name: opts.name || '', device: opts.device || '', hash: opts.hash, proof: opts.proof,
      code: opts.code, link: opts.link, secure, crypto, role: kind === 'join' ? undefined : (opts.role || 'host'),
      signIn, loadCrypto, takeOver, relocate: (url) => (b ? b.transport('join', { url, app, schema }) : L.webSocketTransport(url)),
      roomUrl: typeof opts.roomUrl === 'function' ? opts.roomUrl : undefined, newRoom: typeof opts.newRoom === 'function' ? opts.newRoom : undefined,
    });
    // A browser page on the old host's LAN address whose session moved somewhere it can't reach: say where it went (LV.17).
    if (!b && kind === 'join') c.on('status', ({ status, reason, moved }) => { if (status === 'lost' && reason === 'moved') movedNotice(host, c, moved); });
    // Where an assistant's own client (LV.18) reaches the same session: the URL this one used.
    c.joinUrl = opts.url || (kind === 'join' && pageHost() ? 'ws://' + pageHost() + '/live' : '');
    set(c);
    c.connect();
    return c;
  };
  const pageCode = () => {
    const w = host.win;
    if (!w || !w.location || !pageHost()) return null;
    const m = /(?:^#|&)live=([0-9A-Za-z-]{7,9})(?:&|$)/.exec(w.location.hash || '');
    if (!m) return null;
    // The code stays out of the address bar (and so out of history, bookmarks and screenshots).
    try { w.history.replaceState(null, '', w.location.pathname + w.location.search); } catch { /* no history */ }
    return m[1].toUpperCase();
  };
  return {
    available: () => ({ studio: !!bridge(), page: !!pageHost() }),
    pageCode,
    join: (opts) => run(opts, 'join'),
    start: (opts) => run(opts, 'local'),
    assistant,
    get client() { return st.client; },
    on(fn) { st.fns.add(fn); return () => st.fns.delete(fn); },
  };
}

/** The session moved and this page can't follow (LIVE-PROTOCOL § 4.7): a small notice with the new host's page, if any. */
function movedNotice(host, c, moved) {
  const d = host.doc;
  if (!d || !d.body || d.querySelector('[data-live-moved]')) return;
  const W = (k, v, en) => { const x = T(k, v); return x === k ? en : x; };   // English when the shell's words aren't loaded
  let who = '';
  for (const p of c.peers.values()) if (moved && p.c === moved.host) who = p.name || '';
  who = who || W('shell.live.moved.someone', {}, 'another person');
  const addr = moved && Array.isArray(moved.addrs) ? moved.addrs.map(String).find((a) => /^[0-9.]+$/.test(a)) : null;
  const slug = host.app || (c.adapter && c.adapter.app) || '';
  const link = addr && moved.port && /^[a-z]+$/.test(slug) ? `http://${addr}:${Number(moved.port)}/apps/${slug}/` : '';
  const box = d.createElement('div');
  box.setAttribute('role', 'alert'); box.setAttribute('data-live-moved', '');
  box.style.cssText = 'position:fixed;left:50%;top:4rem;transform:translateX(-50%);z-index:2147483000;max-width:32rem;padding:1rem 1.25rem;background:var(--sheet,#fff);color:var(--ink,#111);border:2px solid var(--ink,#111);font:inherit';
  const h = d.createElement('strong'); h.textContent = W('shell.live.moved.title', {}, 'The live session moved');
  const p1 = d.createElement('p'); p1.textContent = W('shell.live.moved.text', { host: who }, `The host handed the session over to ${who}'s Studio, which this page can't reach. Your copy stays here, unsaved: save it to keep it.`);
  box.append(h, p1);
  if (link) {
    // The sentence with {link} as a real link: text before, the link, text after (never HTML from a string).
    const full = W('shell.live.moved.link', { link: '\u0000', host: who }, `To join again, open \u0000 and ask ${who} for a new code.`);
    const [before, after = ''] = full.split('\u0000');
    const p2 = d.createElement('p'); const a = d.createElement('a');
    a.href = link; a.textContent = link; a.rel = 'noopener';
    p2.append(before, a, after);
    box.append(p2);
  }
  const x = d.createElement('button'); x.type = 'button'; x.textContent = W('shell.live.moved.close', {}, 'Close');
  x.addEventListener('click', () => box.remove());
  box.append(x);
  d.body.append(box);
}

const hosts = new Map();
/** One host per app per page. Options only matter on the first call (tests: createHost). */
export function getHost(o = {}) {
  if (!hosts.has(o.app)) {
    const h = new Host(o);
    hosts.set(o.app, h);
    if (h.doc && h.doc.querySelectorAll && o.recentList !== false) {
      const mount = () => h.doc.querySelectorAll('[data-recent-files]').forEach((r) => { if (!r.__ccRecent) { r.__ccRecent = true; mountRecent(h, r); } });
      if (h.doc.readyState === 'loading') h.doc.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
    }
    if (h.doc && h.doc.querySelectorAll && o.assistants !== false) {
      const p = assistantPrefs(h);   // Settings › Assistants as the person left it (off by default)
      h.control.configure(p);
      const mountA = () => {
        h.doc.querySelectorAll('[data-assistants-settings]').forEach((r) => { if (!r.__ccAssist) { r.__ccAssist = true; mountAssistants(h, r); } });
        const bar = h.doc.querySelector('.app-bar');
        if (bar && !bar.__ccAssist) { bar.__ccAssist = true; mountAssistantIndicator(h, bar); }
      };
      if (h.doc.readyState === 'loading') h.doc.addEventListener('DOMContentLoaded', mountA, { once: true }); else mountA();
    }
  }
  return hosts.get(o.app);
}
export function createHost(o = {}) { return new Host(o); }
export { Host };
export default getHost;
