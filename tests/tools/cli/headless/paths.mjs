/* SPDX-License-Identifier: Apache-2.0 */
/**
 * paths.mjs — files only inside the folders the person names (docs/AGENTS-SPEC.md §3).
 *
 *   const roots = new Roots(['~/Drawings']);
 *   roots.read('~/Drawings/Plan.dwg')            → the real path, or throws PathError
 *   roots.write('~/Drawings/out/Plan.pdf', {overwrite, mine})  → the real path for a new or replaced file
 *
 * Every path is resolved with realpath (symlinks followed, `..` gone) and must stay inside a root's real path; a new file's
 * folder must already exist (and be inside). Relative paths are taken from the first root. No roots = no file access.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export class PathError extends Error {
  constructor(message, code = 'outside') { super(message); this.name = 'PathError'; this.code = code; }
}

const expand = (p) => (p === '~' ? os.homedir() : p.startsWith('~/') || p.startsWith('~\\') ? path.join(os.homedir(), p.slice(2)) : p);
const inside = (child, parent) => child === parent || child.startsWith(parent.endsWith(path.sep) ? parent : parent + path.sep);

export class Roots {
  constructor(list = []) {
    this.list = [];
    this.raw = [];
    for (const r of list) {
      const abs = path.resolve(expand(String(r)));
      let real;
      try { real = fs.realpathSync(abs); } catch { throw new PathError('The folder ' + abs + ' does not exist.', 'missing'); }
      if (!fs.statSync(real).isDirectory()) throw new PathError(abs + ' is not a folder.', 'missing');
      if (!this.list.includes(real)) this.list.push(real);
      if (!this.raw.includes(abs)) this.raw.push(abs);   // the folder as named (it may be reached through a link)
    }
  }

  get any() { return this.list.length > 0; }

  /** The absolute form of what the caller gave (relative → the first root), before any check. */
  abs(p) {
    if (typeof p !== 'string' || !p.trim()) throw new PathError('A file path is needed.', 'invalid');
    if (/\0/.test(p)) throw new PathError('That path is not allowed.', 'invalid');
    if (/^\\\\[.?]\\/.test(p)) throw new PathError('Device paths are not allowed.', 'invalid');
    if (!this.any) throw new PathError('No folders are open to the assistant. Start it with --root <folder>.', 'noroots');
    const e = expand(p);
    return path.isAbsolute(e) ? path.resolve(e) : path.resolve(this.list[0], e);
  }

  rootOf(real) { return this.list.find((r) => inside(real, r)) || null; }

  /** Refuse a path that is outside every root as written, before the file system is asked anything about it. */
  lexical(a) {
    if (![...this.list, ...this.raw].some((r) => inside(a, r))) throw new PathError(a + ' is outside the folders the assistant may use (' + this.list.join(', ') + ').');
    return a;
  }

  check(real, shown) {
    if (!this.rootOf(real)) throw new PathError(shown + ' is outside the folders the assistant may use (' + this.list.join(', ') + ').');
    return real;
  }

  /** An existing file to read. */
  read(p) {
    const a = this.lexical(this.abs(p));
    let real;
    try { real = fs.realpathSync(a); } catch { throw new PathError('There is no file ' + a + '.', 'missing'); }
    this.check(real, a);
    let st;
    try { st = fs.statSync(real); } catch { throw new PathError('There is no file ' + a + '.', 'missing'); }
    if (!st.isFile()) throw new PathError(a + ' is not a file.', 'invalid');
    return real;
  }

  /** A folder to list. */
  folder(p) {
    if (!this.any) throw new PathError('No folders are open to the assistant. Start it with --root <folder>.', 'noroots');
    const a = p ? this.lexical(this.abs(p)) : this.list[0];
    let real;
    try { real = fs.realpathSync(a); } catch { throw new PathError('There is no folder ' + a + '.', 'missing'); }
    this.check(real, a);
    if (!fs.statSync(real).isDirectory()) throw new PathError(a + ' is not a folder.', 'invalid');
    return real;
  }

  /**
   * A file to write. `mine` = paths this session opened or wrote (they may be replaced); anything else that exists needs
   * `overwrite`. The file itself may not be a symlink (it could point outside).
   */
  write(p, { overwrite = false, mine = new Set() } = {}) {
    const a = this.lexical(this.abs(p));
    const dir = path.dirname(a);
    let realDir;
    try { realDir = fs.realpathSync(dir); } catch { throw new PathError('The folder ' + dir + ' does not exist.', 'missing'); }
    const real = path.join(realDir, path.basename(a));
    this.check(real, a);
    let st = null;
    try { st = fs.lstatSync(real); } catch { /* new file */ }
    if (st) {
      if (st.isSymbolicLink()) throw new PathError(a + ' is a link; write to the file it points to instead.', 'invalid');
      if (!st.isFile()) throw new PathError(a + ' is not a file.', 'invalid');
      if (!overwrite && !mine.has(real)) throw new PathError(a + ' already exists. Pass overwrite: true to replace it.', 'exists');
    }
    return real;
  }
}

/** Write atomically: a temp file beside it, then rename. */
export function writeFileAtomic(real, data) {
  const tmp = path.join(path.dirname(real), '.' + path.basename(real) + '.' + process.pid + '.' + Date.now().toString(36) + '.tmp');
  fs.writeFileSync(tmp, data);
  try { fs.renameSync(tmp, real); } catch (e) { try { fs.unlinkSync(tmp); } catch { /* gone */ } throw e; }
}

/** Files in a folder (inside the roots), newest first; ≤ max. */
export function listFiles(roots, folder, { extensions = null, recursive = false, max = 2000 } = {}) {
  const base = roots.folder(folder);
  const exts = extensions && extensions.length ? new Set(extensions.map((e) => '.' + String(e).replace(/^\./, '').toLowerCase())) : null;
  const out = [];
  let truncated = false;
  const walk = (dir, depth) => {
    let ents;
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const d of ents) {
      if (out.length >= max) { truncated = true; return; }
      if (d.name.startsWith('.')) continue;
      const p = path.join(dir, d.name);
      if (d.isDirectory()) { if (recursive && depth < 12) walk(p, depth + 1); continue; }
      if (!d.isFile()) continue;   // links are not followed here
      if (exts && !exts.has(path.extname(d.name).toLowerCase())) continue;
      try { const st = fs.statSync(p); out.push({ path: p, size: st.size, modified: st.mtime.toISOString() }); } catch { /* gone */ }
    }
  };
  walk(base, 0);
  out.sort((a, b) => (a.modified < b.modified ? 1 : -1));
  return { folder: base, files: out, truncated };
}
