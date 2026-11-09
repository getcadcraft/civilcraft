/* SPDX-License-Identifier: Apache-2.0 */
/**
 * store.js — storage backends for tiled clouds (spec § 4). One interface, async everywhere:
 *
 *   await store.get(key) → Uint8Array | null
 *   await store.put(key, bytes)                 (the bytes are copied; the caller may reuse its buffer)
 *   await store.delete(key)                     (no error when the key is missing)
 *   await store.list(prefix) → [key…]           sorted, every key that starts with prefix
 *   await store.size() → bytes                  total of all values
 *   store.openWrite?.(key) → { write(bytes), writeAt(position, bytes), close() }   optional streaming writer (Memory, Dir, Opfs);
 *                                   writeAt rewrites bytes already written (the LAZ chunk table position, PC.14); call it last
 *
 * Keys are '/'-separated names such as 'cct/<id>/n/r012.bin'; '..', empty parts and leading '/' are refused (code 'bad_key').
 *
 *   MemoryStore   tests and small clouds
 *   DirStore      Node and Studio: a folder on disk (node:fs is imported on first use, so this file also loads in a browser)
 *   OpfsStore     the browser's origin-private file system (navigator.storage.getDirectory), or ANY directory handle the person picked
 *                 (showDirectoryPicker): new OpfsStore(name, { handle }) — kind 'folder'; the same code, a different root (PC.10 "keep my clouds in a folder")
 *   IdbStore      IndexedDB fallback when OPFS is missing
 *   openStore(kind, opts)   'memory' | 'opfs' (falls back to IndexedDB) | 'folder' (opts.handle) | 'dir' (opts.path) | 'idb'
 *
 * OPFS and IndexedDB can only run in a browser: they are written to the same interface and are checked by the browser
 * test (tools/pointcloud-engine/browser.mjs, "Store backends": Memory = Dir = OPFS byte-identical). Not run in Node.
 */
import { fail } from './util.js';

export function cleanKey(key) {
  if (typeof key !== 'string' || !key || key.startsWith('/') || key.includes('\\') || key.includes('\0')) fail('bad_key', { key });
  for (const p of key.split('/')) if (!p || p === '.' || p === '..') fail('bad_key', { key });
  return key;
}

export class MemoryStore {
  constructor() { this.kind = 'memory'; this.m = new Map(); }
  async get(key) { const v = this.m.get(cleanKey(key)); return v ? v : null; }
  async put(key, bytes) { this.m.set(cleanKey(key), new Uint8Array(bytes)); }
  async delete(key) { this.m.delete(cleanKey(key)); }
  async list(prefix = '') { return [...this.m.keys()].filter((k) => k.startsWith(prefix)).sort(); }
  async size() { let n = 0; for (const v of this.m.values()) n += v.length; return n; }
  openWrite(key) {
    const parts = []; let closed = false;
    const patches = [];
    return { write: async (b) => { if (closed) fail('closed'); parts.push(new Uint8Array(b)); }, writeAt: async (pos, b) => { if (closed) fail('closed'); patches.push([pos, new Uint8Array(b)]); }, close: async () => { closed = true; const n = parts.reduce((s, p) => s + p.length, 0), out = new Uint8Array(n); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } for (const [pos, b] of patches) out.set(b, pos); this.m.set(cleanKey(key), out); } };
  }
}

export class DirStore {
  constructor(root) {
    if (!root) fail('no_path');
    this.kind = 'dir'; this.root = root; this._fs = null; this._path = null;
  }
  async mods() {
    if (!this._fs) { this._fs = await import('node:fs/promises'); this._path = await import('node:path'); }
    return [this._fs, this._path];
  }
  async file(key) { const [, p] = await this.mods(); return p.join(this.root, ...cleanKey(key).split('/')); }
  async get(key) {
    const [fs] = await this.mods();
    try { const b = await fs.readFile(await this.file(key)); return new Uint8Array(b.buffer, b.byteOffset, b.byteLength); } catch (e) { if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) return null; throw e; }
  }
  async put(key, bytes) {
    const [fs, p] = await this.mods(), f = await this.file(key);
    await fs.mkdir(p.dirname(f), { recursive: true });
    const tmp = f + '.part'; await fs.writeFile(tmp, bytes); await fs.rename(tmp, f);
  }
  async delete(key) { const [fs] = await this.mods(); await fs.rm(await this.file(key), { force: true }); }
  async walk(dir, rel, out) {
    const [fs] = await this.mods();
    let ents; try { ents = await fs.readdir(dir, { withFileTypes: true }); } catch (e) { if (e.code === 'ENOENT') return; throw e; }
    for (const d of ents) {
      if (d.isDirectory()) await this.walk(dir + '/' + d.name, rel + d.name + '/', out);
      else if (!d.name.endsWith('.part')) out.push(rel + d.name);
    }
  }
  async list(prefix = '') {
    const out = []; await this.walk(this.root, '', out);
    return out.filter((k) => k.startsWith(prefix)).sort();
  }
  async size() { const [fs] = await this.mods(); let n = 0; for (const k of await this.list('')) n += (await fs.stat(await this.file(k))).size; return n; }
  openWrite(key) {
    let h = null, f = null;
    const open = async () => { if (h) return; const [fs, p] = await this.mods(); f = await this.file(key); await fs.mkdir(p.dirname(f), { recursive: true }); h = await fs.open(f + '.part', 'w'); };
    return { write: async (b) => { await open(); await h.write(b); }, writeAt: async (pos, b) => { await open(); await h.write(b, 0, b.length, pos); }, close: async () => { await open(); await h.close(); const [fs] = await this.mods(); await fs.rename(f + '.part', f); } };
  }
}

export class OpfsStore {
  constructor(name = 'cadcraft-clouds', { handle = null } = {}) { this.kind = handle ? 'folder' : 'opfs'; this.name = name; this._root = handle; this.picked = !!handle; }
  async root() {
    if (!this._root) {
      const nav = typeof navigator !== 'undefined' ? navigator : null;
      if (!nav || !nav.storage || !nav.storage.getDirectory) fail('no_opfs');
      this._root = await (await nav.storage.getDirectory()).getDirectoryHandle(this.name, { create: true });
    }
    return this._root;
  }
  async dirOf(key, create) {
    const parts = cleanKey(key).split('/'), name = parts.pop();
    let d = await this.root();
    for (const p of parts) { try { d = await d.getDirectoryHandle(p, { create }); } catch (e) { if (!create && e && e.name === 'NotFoundError') return [null, name]; throw e; } }
    return [d, name];
  }
  async get(key) {
    const [d, name] = await this.dirOf(key, false);
    if (!d) return null;
    try { const f = await (await d.getFileHandle(name)).getFile(); return new Uint8Array(await f.arrayBuffer()); } catch (e) { if (e && e.name === 'NotFoundError') return null; throw e; }
  }
  async put(key, bytes) {
    const [d, name] = await this.dirOf(key, true);
    const w = await (await d.getFileHandle(name, { create: true })).createWritable();
    await w.write(bytes); await w.close();
  }
  async delete(key) {
    const [d, name] = await this.dirOf(key, false);
    if (!d) return;
    try { await d.removeEntry(name); } catch (e) { if (!e || e.name !== 'NotFoundError') throw e; }
  }
  async walk(dir, rel, out) {
    for await (const [name, h] of dir.entries()) {
      if (h.kind === 'directory') await this.walk(h, rel + name + '/', out); else out.push(rel + name);
    }
  }
  async list(prefix = '') { const out = []; await this.walk(await this.root(), '', out); return out.filter((k) => k.startsWith(prefix)).sort(); }
  async size() {
    let n = 0; const root = await this.root();
    for (const k of await this.list('')) { const [d, name] = await this.dirOf(k, false); n += (await (await d.getFileHandle(name)).getFile()).size; }
    void root; return n;
  }
  openWrite(key) {
    let w = null;
    const open = async () => { if (w) return; const [d, name] = await this.dirOf(key, true); w = await (await d.getFileHandle(name, { create: true })).createWritable(); };
    return { write: async (b) => { await open(); await w.write(b); }, writeAt: async (pos, b) => { await open(); await w.write({ type: 'write', position: pos, data: b }); }, close: async () => { await open(); await w.close(); } };
  }
}

export class IdbStore {
  constructor(name = 'cadcraft-clouds') { this.kind = 'idb'; this.name = name; this._db = null; }
  db() {
    if (this._db) return this._db;
    this._db = new Promise((res, rej) => {
      if (typeof indexedDB === 'undefined') return rej(Object.assign(new Error('pointcloud: no_idb'), { code: 'no_idb' }));   // i18n-ignore: developer error
      const r = indexedDB.open(this.name, 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    return this._db;
  }
  async tx(mode, f) {
    const db = await this.db();
    return new Promise((res, rej) => { const t = db.transaction('kv', mode), s = t.objectStore('kv'); let out; const r = f(s); if (r) r.onsuccess = () => { out = r.result; }; t.oncomplete = () => res(out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); });
  }
  async get(key) { const v = await this.tx('readonly', (s) => s.get(cleanKey(key))); return v ? new Uint8Array(v) : null; }
  async put(key, bytes) { const c = new Uint8Array(bytes); await this.tx('readwrite', (s) => s.put(c.buffer.slice(c.byteOffset, c.byteOffset + c.byteLength), cleanKey(key))); }
  async delete(key) { await this.tx('readwrite', (s) => s.delete(cleanKey(key))); }
  async list(prefix = '') {
    const r = await this.tx('readonly', (s) => s.getAllKeys(prefix ? IDBKeyRange.bound(prefix, prefix + '￿') : undefined));
    return (r || []).sort();
  }
  async size() { let n = 0; for (const k of await this.list('')) n += (await this.get(k)).length; return n; }
}

export function openStore(kind, opts = {}) {
  switch (kind) {
    case 'memory': return new MemoryStore();
    case 'dir': return new DirStore(opts.path);
    case 'opfs': {
      const has = typeof navigator !== 'undefined' && navigator.storage && navigator.storage.getDirectory;
      return has ? new OpfsStore(opts.name) : new IdbStore(opts.name);
    }
    case 'folder': return opts.handle ? new OpfsStore(opts.name, { handle: opts.handle }) : fail('bad_store', { kind });
    case 'idb': return new IdbStore(opts.name);
    default: return fail('bad_store', { kind });
  }
}
