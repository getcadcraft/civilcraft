/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — DOM-free library: its literals are file data and errors for developers; every word a person reads comes from the app (t()), e.g. bomCsv's labels. */
/**
 * vault-fs.js — the folder a vault lives in, behind one small interface (0.8 SU.1058, session `sx-vault`). DOM-free and
 * import-free: the Node, browser and Studio adapters are built from what the caller hands in, so this file loads anywhere.
 * Canonical here (lib/vault); CadCraft's copy (cadcraft/dev/vault/) is written by `node tools/vault/sync.mjs`.
 *
 * A VaultFs (every path is "/"-separated and relative to the project folder; see cleanRel):
 *   kind        'node' | 'memory' | 'browser' | 'desktop'
 *   exclusive   true when create() is a real exclusive create (the OS refuses a second one); false = best effort (write, then
 *               read back to see whose write stayed) — the Documents panel says so
 *   read(rel)            → Uint8Array, or null when there is no such file (a zero-byte "tombstone" also reads as null: see remove)
 *   write(rel, bytes)    replace the whole file (atomic where the platform can: temp file + rename); makes the folders
 *   create(rel, bytes)   → true when this call made the file, false when it was already there (exclusive create)
 *   append(rel, bytes)   add to the end (makes the file); optional — the vault falls back to read + write under its mutex
 *   remove(rel)          → true when something was removed (no file → false). Adapters that cannot delete write a tombstone.
 *   list(dir)            → [{ name, dir }] in one folder (no recursion); [] when the folder is missing
 *   stat(rel)            → { size, mtime } | null      (optional)
 *
 *   memoryFs()                            a folder in memory (tests, the panel's demo)
 *   nodeFs(root, { fsp, path })           Node: fsp = (await import('node:fs/promises')), path = (await import('node:path'))
 *   browserFs(dirHandle)                  a FileSystemDirectoryHandle picked with mode 'readwrite' (Chromium)
 *   desktopFs(bridge, rootPath)           Studio / the desktop apps: window.cadcraftDesktop (readFile, writeFile, listDir, stat;
 *                                         uses createFileExclusive / removeFile when the shell has them — not yet: exclusive false)
 *   fromHostFolder(folder, bridge?)       a HostFolder from host.js pickFolder(): its browser handle, else its desktop path
 */

export const VAULT_DIR = '.ccvault';

/** A safe relative path: "/"-separated, no empty / "." / ".." parts, not absolute. Throws { code: 'outside' } otherwise. */
export function cleanRel(rel) {
  const s = String(rel ?? '').replace(/\\/g, '/');
  if (!s || s.startsWith('/') || /^[A-Za-z]:/.test(s)) throw Object.assign(new Error('vault: not a relative path: ' + s), { code: 'outside' });
  const parts = s.split('/');
  if (parts.some((p) => p === '' || p === '.' || p === '..')) throw Object.assign(new Error('vault: not a clean path: ' + s), { code: 'outside' });
  if (parts.some((p) => /[\u0000-\u001f]/.test(p))) throw Object.assign(new Error('vault: control characters in a path'), { code: 'outside' });
  return parts.join('/');
}
const dirOf = (rel) => { const i = rel.lastIndexOf('/'); return i < 0 ? '' : rel.slice(0, i); };
const baseOf = (rel) => rel.slice(rel.lastIndexOf('/') + 1);
const toU8 = (b) => (b instanceof Uint8Array ? b : typeof b === 'string' ? new TextEncoder().encode(b) : new Uint8Array(b));

// ---------------------------------------------------------------------------- memory

export function memoryFs() {
  const files = new Map();   // rel → { bytes, mtime }
  let clock = 0;
  return {
    kind: 'memory', exclusive: true, files,
    async read(rel) { const f = files.get(cleanRel(rel)); return f ? f.bytes.slice() : null; },
    async write(rel, b) { files.set(cleanRel(rel), { bytes: toU8(b).slice(), mtime: ++clock }); },
    async create(rel, b) { rel = cleanRel(rel); if (files.has(rel)) return false; files.set(rel, { bytes: toU8(b).slice(), mtime: ++clock }); return true; },
    async append(rel, b) { rel = cleanRel(rel); const old = files.get(rel)?.bytes || new Uint8Array(0); const add = toU8(b); const n = new Uint8Array(old.length + add.length); n.set(old); n.set(add, old.length); files.set(rel, { bytes: n, mtime: ++clock }); },
    async remove(rel) { return files.delete(cleanRel(rel)); },
    async list(dir) {
      const pre = dir ? cleanRel(dir) + '/' : '';
      const out = new Map();
      for (const k of files.keys()) {
        if (!k.startsWith(pre)) continue;
        const rest = k.slice(pre.length), i = rest.indexOf('/');
        if (i < 0) out.set(rest, false); else out.set(rest.slice(0, i), true);
      }
      return [...out].map(([name, d]) => ({ name, dir: d })).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    },
    async stat(rel) { const f = files.get(cleanRel(rel)); return f ? { size: f.bytes.length, mtime: f.mtime } : null; },
  };
}

// ---------------------------------------------------------------------------- Node

export function nodeFs(root, { fsp, path }) {
  const abs = (rel) => path.join(root, ...cleanRel(rel).split('/'));
  const missing = (e) => e && (e.code === 'ENOENT' || e.code === 'ENOTDIR');
  let n = 0;
  return {
    kind: 'node', exclusive: true, root,
    async read(rel) { try { return new Uint8Array(await fsp.readFile(abs(rel))); } catch (e) { if (missing(e)) return null; throw e; } },
    async write(rel, b) {
      const p = abs(rel);
      await fsp.mkdir(path.dirname(p), { recursive: true });
      const tmp = p + '.tmp-' + process.pid + '-' + (++n) + '-' + Math.random().toString(36).slice(2, 8);
      await fsp.writeFile(tmp, toU8(b));
      await fsp.rename(tmp, p);
    },
    async create(rel, b) {
      const p = abs(rel);
      await fsp.mkdir(path.dirname(p), { recursive: true });
      let fh;
      try { fh = await fsp.open(p, 'wx'); } catch (e) { if (e.code === 'EEXIST') return false; throw e; }
      try { await fh.writeFile(toU8(b)); } finally { await fh.close(); }
      return true;
    },
    async append(rel, b) { const p = abs(rel); await fsp.mkdir(path.dirname(p), { recursive: true }); await fsp.appendFile(p, toU8(b)); },
    async remove(rel) { try { await fsp.unlink(abs(rel)); return true; } catch (e) { if (missing(e)) return false; throw e; } },
    async list(dir) {
      try {
        const ents = await fsp.readdir(dir ? abs(dir) : root, { withFileTypes: true });
        return ents.filter((e) => !e.name.includes('.tmp-')).map((e) => ({ name: e.name, dir: e.isDirectory() })).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
      } catch (e) { if (missing(e)) return []; throw e; }
    },
    async stat(rel) { try { const s = await fsp.stat(abs(rel)); return { size: s.size, mtime: s.mtimeMs }; } catch (e) { if (missing(e)) return null; throw e; } },
  };
}

// ---------------------------------------------------------------------------- best-effort exclusive create

/**
 * create() where the platform has no exclusive create: look, write our bytes with a nonce, wait, read back — the write that
 * stayed wins. Two writers inside the same few milliseconds on a synced folder can still both think they won; that is why
 * `exclusive` is false and the panel says locks are best effort there.
 */
async function lookWriteVerify(fsx, rel, b, wait) {
  if (await fsx.read(rel)) return false;
  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const body = toU8(b);
  // the nonce rides in a trailing JSON comment-free line the vault ignores (lock / mutex files are JSON objects: we add a key)
  let txt = new TextDecoder().decode(body);
  try { const o = JSON.parse(txt); o._n = nonce; txt = JSON.stringify(o); } catch { /* not JSON: compare bytes only */ }
  const mine = new TextEncoder().encode(txt);
  await fsx.write(rel, mine);
  await wait();
  const back = await fsx.read(rel);
  if (!back || back.length !== mine.length) return false;
  for (let i = 0; i < mine.length; i++) if (back[i] !== mine[i]) return false;
  return true;
}
const pause = (ms) => () => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------- browser (File System Access API)

export function browserFs(dirHandle, { settleMs = 40 } = {}) {
  const walk = async (rel, create) => {
    const parts = cleanRel(rel).split('/');
    let d = dirHandle;
    for (const p of parts.slice(0, -1)) d = await d.getDirectoryHandle(p, { create });
    return { d, name: parts[parts.length - 1] };
  };
  const gone = (e) => e && (e.name === 'NotFoundError' || e.name === 'TypeMismatchError');
  const fsx = {
    kind: 'browser', exclusive: false,
    async read(rel) {
      try { const { d, name } = await walk(rel, false); const f = await (await d.getFileHandle(name)).getFile(); return new Uint8Array(await f.arrayBuffer()); } catch (e) { if (gone(e)) return null; throw e; }
    },
    async write(rel, b) { const { d, name } = await walk(rel, true); const w = await (await d.getFileHandle(name, { create: true })).createWritable(); await w.write(toU8(b)); await w.close(); },
    async create(rel, b) { return lookWriteVerify(fsx, rel, b, pause(settleMs)); },
    async remove(rel) { try { const { d, name } = await walk(rel, false); await d.removeEntry(name); return true; } catch (e) { if (gone(e)) return false; throw e; } },
    async list(dir) {
      let d = dirHandle;
      try { if (dir) for (const p of cleanRel(dir).split('/')) d = await d.getDirectoryHandle(p); } catch (e) { if (gone(e)) return []; throw e; }
      const out = [];
      for await (const [name, h] of d.entries()) if (!name.endsWith('.crswap')) out.push({ name, dir: h.kind === 'directory' });
      return out.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    },
    async stat(rel) { try { const { d, name } = await walk(rel, false); const f = await (await d.getFileHandle(name)).getFile(); return { size: f.size, mtime: f.lastModified }; } catch (e) { if (gone(e)) return null; throw e; } },
  };
  return fsx;
}

// ---------------------------------------------------------------------------- desktop (Studio's bridge)

export function desktopFs(bridge, rootPath, { settleMs = 40 } = {}) {
  const sep = rootPath.includes('\\') && !rootPath.includes('/') ? '\\' : '/';
  const base = rootPath.endsWith(sep) ? rootPath.slice(0, -1) : rootPath;
  const abs = (rel) => (rel ? base + sep + cleanRel(rel).split('/').join(sep) : base);
  const realRemove = typeof bridge.removeFile === 'function';
  const realCreate = typeof bridge.createFileExclusive === 'function';
  let removeUnsupported = false;
  const fsx = {
    kind: 'desktop', exclusive: realCreate,
    async read(rel) {
      let b;
      try { b = await bridge.readFile(abs(rel)); } catch { return null; }
      b = b ? toU8(b) : null;
      return b && b.length ? b : null;   // zero bytes = a tombstone (see remove)
    },
    async write(rel, b) { await bridge.writeFile(abs(rel), toU8(b)); },
    async create(rel, b) {
      if (fsx.exclusive) {
        try { return !!(await bridge.createFileExclusive(abs(rel), toU8(b))); } catch (e) {
          if (!/unsupported/.test(String(e && e.message || e))) throw e;
          fsx.exclusive = false;   // tablets: no exclusive create there; best effort from now on (the panel says so)
        }
      }
      return lookWriteVerify(fsx, rel, b, pause(settleMs));
    },
    async remove(rel) {
      if (realRemove && !removeUnsupported) {
        try { return !!(await bridge.removeFile(abs(rel))); } catch (e) { if (!/unsupported/.test(String(e && e.message || e))) return false; removeUnsupported = true; }
      }
      if (!(await fsx.read(rel))) return false;
      await bridge.writeFile(abs(rel), new Uint8Array(0));   // a tombstone: reads as missing
      return true;
    },
    async list(dir) {
      if (typeof bridge.listDir !== 'function') return [];
      try { return ((await bridge.listDir(abs(dir ? cleanRel(dir) : ''))) || []).map((e) => ({ name: e.name, dir: !!e.dir })).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)); } catch { return []; }
    },
    async stat(rel) { if (typeof bridge.stat !== 'function') return null; try { return (await bridge.stat(abs(rel))) || null; } catch { return null; } },
  };
  return fsx;
}

/** A HostFolder from host.js (pickFolder) → a VaultFs: the browser handle when it has one, else the desktop path. */
export function fromHostFolder(folder, bridge = null) {
  if (!folder) return null;
  if (folder.handle) return browserFs(folder.handle);
  if (folder.path && bridge) return desktopFs(bridge, folder.path);
  return null;
}

export { dirOf, baseOf, toU8 };
