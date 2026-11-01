/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — DOM-free library: its literals are file data and errors for developers; every word a person reads comes from the app (t()), e.g. bomCsv's labels. */
/**
 * vault.js — cc-vault, a project document manager on any folder (0.8 SU.1058 with LC.8's asks, session `sx-vault`;
 * plan docs/0.8-PART2.md § SU.1058). DOM-free; works on a VaultFs (vault-fs.js), so Node tests, Studio and the browser run
 * the same code. No server: a shared or synced folder is enough (cloud mode with server-side locks is a later step).
 * Canonical here (lib/vault); CadCraft's copy is written by `node tools/vault/sync.mjs`.
 *
 * On disk, inside the project folder:
 *   .ccvault/vault.json         { format 'cc-vault-1', name, created, seq, logSize, settings, files: { <id>: FileRec } }
 *                               a snapshot: rebuilt from the log whenever the log is ahead of it (or it is missing/broken)
 *   .ccvault/log.jsonl          append-only, one event per line: { v: 1, seq, at (ISO), by, machine, type, id?, … } — the truth
 *   .ccvault/locks/<id>.json    a check-out: { user, machine, at, note } made with an exclusive create; gone on check-in
 *   .ccvault/locks/_mutex.json  held for the few milliseconds a change takes (exclusive create; broken after 30 s, logged)
 *   .ccvault/revs/<id>/<sha256> the bytes of every revision, named by their SHA-256 (the same bytes are kept once)
 *
 * FileRec = { id, path, kind, number?, state: 'wip'|'review'|'released'|'obsolete', rev ('A.1' … 'A', see vault-rev.js),
 *             next? (the letter a new revision is heading to, while it has no check-in yet), sha, size, created, updated,
 *             approver?, uses: [Link] (vault-links.js), revs: [{ rev, sha, size, at, by, note, approver?, released? }],
 *             lock: { user, machine, at, note } | null   (a mirror of the lock file; the lock file decides) }
 *
 * States and rules:
 *   wip ──submit──▶ review ──approve (an approver's name)──▶ released ──obsolete──▶ obsolete
 *    ▲               │reject                                   │check out with newRevision
 *    └───────────────┘◀──────────────────────────────────────────┘   (A → B.1 on the first check-in; undo goes back to A)
 *   Only a wip file is checked out; only the lock holder (same user and machine) checks in, undoes or restores; released and
 *   in-review files are read-only; submit needs a check-in since the last release and no lock; a lock can be broken by an
 *   admin (anyone when settings.admins is empty) with a reason, which goes in the log.
 *
 *   await initVault(fs, { name, settings }, ctx) → { ok, vault } | { ok: false, code: 'exists' }
 *   await openVault(fs, ctx) → Vault | null (no vault in that folder)
 *   ctx = { user, machine, now = Date.now, randomBytes(n), sleep(ms), mutexWaitMs = 8000, mutexStaleMs = 30000, indexer }
 *
 *   Vault: state() · files() (with the live lock and `stale`) · file(id) · byPath(path) · scan() (untracked / missing / modified)
 *          add(path, { kind, note, uses, number }) · checkOut(id, { note, newRevision }) · checkIn(id, { note, uses, keep })
 *          undoCheckOut(id, { revert }) · submit(id, { note }) · reject(id, { reason }) · approve(id, { approver, note })
 *          obsolete(id, { reason }) · rename(id, newPath) · breakLock(id, { reason }) · restore(id, rev) · setSettings(patch)
 *          revBytes(id, rev) · history(id) · events() · verify() → [problems]
 *   Every change returns { ok: true, … } or { ok: false, code, … } (codes: no_user, not_found, exists, missing_file, outside,
 *   locked, not_locked, not_holder, released, in_review, obsolete, state, checked_out, nothing_to_submit, no_approver,
 *   not_approver, approver_is_author, no_reason, not_admin, no_rev, busy).
 *
 *   replay(text) → { state, problems }   the log alone → the vault's files (what vault.json must equal)
 */
import { VAULT_DIR, cleanRel, toU8 } from './vault-fs.js';
import { firstWip, nextWip, released, isWip, parseRev, letterAt, indexOf } from './vault-rev.js';
import { indexLinks } from './vault-links.js';

export const FORMAT = 'cc-vault-1';
export const STATES = ['wip', 'review', 'released', 'obsolete'];
export const PATHS = {
  json: VAULT_DIR + '/vault.json', log: VAULT_DIR + '/log.jsonl', locks: VAULT_DIR + '/locks',
  mutex: VAULT_DIR + '/locks/_mutex.json', revs: VAULT_DIR + '/revs',
};
export const DEFAULT_SETTINGS = { revSkip: '', approvers: [], admins: [], approverNotAuthor: false, staleLockDays: 14 };
const enc = (o) => new TextEncoder().encode(JSON.stringify(o));
const dec = (b) => new TextDecoder().decode(b);
const lockPath = (id) => PATHS.locks + '/' + id + '.json';
const blobPath = (id, sha) => PATHS.revs + '/' + id + '/' + sha;
const same = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
const fail = (code, extra = {}) => ({ ok: false, code, ...extra });
const ID_RE = /^f[a-z2-7]{12}$/;
const SHA_RE = /^[0-9a-f]{64}$/;

export async function sha256Hex(bytes) {
  const s = globalThis.crypto && globalThis.crypto.subtle;
  if (!s) throw new Error('vault: SHA-256 is not available here (crypto.subtle)');
  return [...new Uint8Array(await s.digest('SHA-256', toU8(bytes)))].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** The kind of a file from its name (what the panel shows and the link indexer reads). */
export function kindOf(path) {
  const n = String(path).toLowerCase();
  if (n.endsWith('.partcraft-asm.json')) return 'assembly';
  if (n.endsWith('.partcraft.json')) return 'part';
  const ext = n.slice(n.lastIndexOf('.') + 1);
  return { dwg: 'dwg', dxf: 'dxf', pdf: 'pdf', ifc: 'ifc', ifczip: 'ifc', step: 'step', stp: 'step', stl: 'mesh', obj: 'mesh', '3mf': 'mesh',
    png: 'image', jpg: 'image', jpeg: 'image', csv: 'table', xlsx: 'table', txt: 'text', md: 'text', docx: 'document' }[ext] || 'other';
}

/** A settings object with every key, each value checked (vault.json is untrusted). */
export function cleanSettings(raw = {}) {
  const s = { ...DEFAULT_SETTINGS };
  const names = (v) => (Array.isArray(v) ? v.map((x) => String(x ?? '').trim().slice(0, 80)).filter(Boolean).slice(0, 200) : []);
  if (typeof raw.revSkip === 'string') s.revSkip = raw.revSkip.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 20);
  try { letterAt(1, s.revSkip); } catch { s.revSkip = ''; }
  s.approvers = names(raw.approvers);
  s.admins = names(raw.admins);
  s.approverNotAuthor = raw.approverNotAuthor === true;
  if (Number.isFinite(raw.staleLockDays) && raw.staleLockDays > 0 && raw.staleLockDays <= 3650) s.staleLockDays = raw.staleLockDays;
  return s;
}

// ---------------------------------------------------------------------------- the reducer (live changes and replay share it)

function emptyState() { return { format: FORMAT, name: '', created: null, seq: 0, settings: { ...DEFAULT_SETTINGS }, files: {} }; }

/** Apply one event to the state (in place). Throws on an event that cannot apply (replay reports it). */
export function applyEvent(st, ev) {
  const f = ev.id ? st.files[ev.id] : null;
  const need = () => { if (!f) throw new Error('event ' + ev.seq + ': no file ' + ev.id); return f; };
  switch (ev.type) {
    case 'init': st.name = String(ev.name || ''); st.created = ev.at; st.settings = cleanSettings(ev.settings || {}); break;
    case 'settings': st.settings = cleanSettings({ ...st.settings, ...(ev.settings || {}) }); break;
    case 'add':
      if (f) throw new Error('event ' + ev.seq + ': ' + ev.id + ' added twice');
      st.files[ev.id] = { id: ev.id, path: ev.path, kind: ev.kind, ...(ev.number ? { number: ev.number } : {}), state: 'wip', rev: ev.rev,
        sha: ev.sha, size: ev.size, created: ev.at, updated: ev.at, uses: ev.uses || [],
        revs: [{ rev: ev.rev, sha: ev.sha, size: ev.size, at: ev.at, by: ev.by, note: ev.note || '' }], lock: null };
      break;
    case 'checkout': need().lock = { user: ev.by, machine: ev.machine, at: ev.at, note: ev.note || '' }; if (ev.next) { f.next = ev.next; f.state = 'wip'; } break;
    case 'checkin':
      need();
      if (!ev.same) {
        f.rev = ev.rev; f.sha = ev.sha; f.size = ev.size;
        f.revs.push({ rev: ev.rev, sha: ev.sha, size: ev.size, at: ev.at, by: ev.by, note: ev.note || '' });
        delete f.next;
      }
      if (ev.uses) f.uses = ev.uses;
      if (ev.number !== undefined) { if (ev.number) f.number = ev.number; else delete f.number; }
      if (!ev.keep) f.lock = null;
      break;
    case 'undo-checkout': case 'lock-broken':
      need().lock = null;
      if (f.next) { delete f.next; f.state = 'released'; }
      break;
    case 'submit': need().state = 'review'; break;
    case 'reject': need().state = 'wip'; break;
    case 'approve': {
      need();
      const rel = released(f.rev);
      f.rev = rel; f.state = 'released'; f.approver = ev.approver;
      f.revs.push({ rev: rel, sha: f.sha, size: f.size, at: ev.at, by: ev.by, note: ev.note || '', approver: ev.approver, released: true });
      break;
    }
    case 'obsolete': need().state = 'obsolete'; break;
    case 'rename': need().path = ev.to; break;
    case 'restore': need(); break;
    case 'mutex-broken': break;
    default: throw new Error('event ' + ev.seq + ': unknown type ' + ev.type);
  }
  if (f && st.files[ev.id]) st.files[ev.id].updated = ev.at;
  st.seq = ev.seq;
  return st;
}

/** The log's text → the state it describes, and what was wrong with it (a torn last line is skipped and reported). */
export function replay(text) {
  const st = emptyState(), problems = [];
  const lines = String(text || '').split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  lines.forEach((line, i) => {
    let ev;
    try { ev = JSON.parse(line); } catch { problems.push({ code: i === lines.length - 1 ? 'torn_tail' : 'bad_line', line: i + 1 }); return; }
    if (!ev || ev.v !== 1 || !Number.isInteger(ev.seq)) { problems.push({ code: 'bad_event', line: i + 1 }); return; }
    if (ev.seq !== st.seq + 1) problems.push({ code: 'seq_gap', line: i + 1, expected: st.seq + 1, got: ev.seq });
    try { applyEvent(st, ev); } catch (e) { problems.push({ code: 'bad_event', line: i + 1, detail: e.message }); }
  });
  return { state: st, problems };
}

/** vault.json as read from disk → a checked state, or null when it is not a vault file. */
function readSnapshot(bytes) {
  if (!bytes) return null;
  let j;
  try { j = JSON.parse(dec(bytes)); } catch { return null; }
  if (!j || j.format !== FORMAT || !j.files || typeof j.files !== 'object' || !Number.isInteger(j.seq)) return null;
  for (const [id, f] of Object.entries(j.files)) {
    if (!ID_RE.test(id) || !f || f.id !== id || typeof f.path !== 'string' || !STATES.includes(f.state) || !parseRev(f.rev) || !SHA_RE.test(f.sha) || !Array.isArray(f.revs)) return null;
  }
  j.settings = cleanSettings(j.settings || {});
  return j;
}

// ---------------------------------------------------------------------------- open / init

function defaults(ctx = {}) {
  const rb = ctx.randomBytes || ((n) => globalThis.crypto.getRandomValues(new Uint8Array(n)));
  return {
    user: String(ctx.user ?? '').trim().slice(0, 80), machine: String(ctx.machine ?? '').trim().slice(0, 80) || 'this computer',
    now: ctx.now || (() => Date.now()), randomBytes: rb, sleep: ctx.sleep || ((ms) => new Promise((r) => setTimeout(r, ms))),
    mutexWaitMs: ctx.mutexWaitMs ?? 8000, mutexStaleMs: ctx.mutexStaleMs ?? 30000, indexer: ctx.indexer || indexLinks,
  };
}

export async function initVault(fsx, { name = '', settings = {} } = {}, ctx = {}) {
  const v = new Vault(fsx, ctx);
  if (!v.ctx.user) return fail('no_user');
  if ((await fsx.read(PATHS.json)) || (await fsx.read(PATHS.log))) return fail('exists');
  const r = await v.mutate(async (st, emit) => {
    if (st.seq) return fail('exists');
    emit({ type: 'init', name: String(name).trim().slice(0, 120), settings: cleanSettings(settings) });
    return { ok: true };
  });
  return r.ok ? { ok: true, vault: v } : r;
}

export async function openVault(fsx, ctx = {}) {
  if (!(await fsx.read(PATHS.json)) && !(await fsx.read(PATHS.log))) return null;
  return new Vault(fsx, ctx);
}

// ---------------------------------------------------------------------------- Vault

export class Vault {
  constructor(fsx, ctx = {}) { this.fs = fsx; this.ctx = defaults(ctx); }

  newId() { const a = 'abcdefghijklmnopqrstuvwxyz234567'; return 'f' + [...this.ctx.randomBytes(12)].map((b) => a[b & 31]).join(''); }
  iso() { return new Date(this.ctx.now()).toISOString(); }

  /** The state as it is on disk now: vault.json, or the log replayed when the log is ahead of it. */
  async state() { return (await this.load()).st; }
  async load() {
    const snap = readSnapshot(await this.fs.read(PATHS.json));
    let logSize = null;
    if (this.fs.stat) logSize = (await this.fs.stat(PATHS.log))?.size ?? 0;
    if (snap && logSize !== null && snap.logSize === logSize) return { st: snap, logSize, rebuilt: false };
    const logBytes = (await this.fs.read(PATHS.log)) || new Uint8Array(0);
    if (snap && snap.logSize === logBytes.length) return { st: snap, logSize: logBytes.length, rebuilt: false };
    const { state, problems } = replay(dec(logBytes));
    // the lock files decide who holds what; the replayed mirror follows them
    for (const f of Object.values(state.files)) f.lock = (await this.readLock(f.id)) ? f.lock : null;
    return { st: state, logSize: logBytes.length, rebuilt: true, problems };
  }

  async readLock(id) {
    const b = await this.fs.read(lockPath(id));
    if (!b) return null;
    try { const l = JSON.parse(dec(b)); return l && typeof l.user === 'string' ? { user: l.user, machine: String(l.machine || ''), at: l.at, note: String(l.note || '') } : null; } catch { return null; }
  }
  lockInfo(lock, st) {
    if (!lock) return null;
    const age = this.ctx.now() - Date.parse(lock.at);
    return { ...lock, mine: same(lock.user, this.ctx.user) && same(lock.machine, this.ctx.machine), stale: Number.isFinite(age) && age > st.settings.staleLockDays * 86400000 };
  }

  // ---- the mutex: one change at a time, across every person and machine using the folder

  async lockMutex() {
    const me = { user: this.ctx.user, machine: this.ctx.machine, at: this.iso(), nonce: [...this.ctx.randomBytes(8)].map((b) => b.toString(16).padStart(2, '0')).join('') };
    const t0 = this.ctx.now();
    let broke = null;
    for (let i = 0; ; i++) {
      if (await this.fs.create(PATHS.mutex, enc(me))) { this.held = me.nonce; return { broke }; }
      const b = await this.fs.read(PATHS.mutex);
      let cur = null;
      try { cur = b ? JSON.parse(dec(b)) : null; } catch { cur = { at: 0 }; }
      if (cur && this.ctx.now() - Date.parse(cur.at || 0) > this.ctx.mutexStaleMs) {
        // stale (a crash mid-change): break it, but only if it is still the same one
        const again = await this.fs.read(PATHS.mutex);
        if (again && b && dec(again) === dec(b)) { await this.fs.remove(PATHS.mutex); broke = { user: cur.user || '', machine: cur.machine || '', at: cur.at || '' }; continue; }
      }
      if (this.ctx.now() - t0 > this.ctx.mutexWaitMs) throw Object.assign(new Error('vault: the folder is busy'), { code: 'busy' });
      await this.ctx.sleep(5 + (this.ctx.randomBytes(1)[0] % 25) + Math.min(i, 10) * 3);
    }
  }
  async unlockMutex() {
    const b = await this.fs.read(PATHS.mutex);
    try { if (b && JSON.parse(dec(b)).nonce === this.held) await this.fs.remove(PATHS.mutex); } catch { /* not ours */ }
    this.held = null;
  }

  /** Run one change: fn(state, emit) under the mutex; the events it emitted go to the log, then vault.json. */
  async mutate(fn) {
    if (!this.ctx.user) return fail('no_user');
    let m;
    try { m = await this.lockMutex(); } catch (e) { if (e.code === 'busy') return fail('busy'); throw e; }
    try {
      const { st, logSize } = await this.load();
      const evs = [];
      const emit = (ev) => {
        const full = { v: 1, seq: st.seq + 1, at: this.iso(), by: this.ctx.user, machine: this.ctx.machine, ...ev };
        applyEvent(st, full);
        evs.push(full);
        return full;
      };
      if (m.broke) emit({ type: 'mutex-broken', held: m.broke });
      const r = await fn(st, emit);
      if (!evs.length) return r;
      const text = new TextEncoder().encode(evs.map((e) => JSON.stringify(e)).join('\n') + '\n');
      if (this.fs.append) await this.fs.append(PATHS.log, text);
      else { const old = (await this.fs.read(PATHS.log)) || new Uint8Array(0); const n = new Uint8Array(old.length + text.length); n.set(old); n.set(text, old.length); await this.fs.write(PATHS.log, n); }
      st.logSize = logSize + text.length;
      await this.fs.write(PATHS.json, new TextEncoder().encode(JSON.stringify(st, null, 1) + '\n'));
      return r;
    } finally { await this.unlockMutex(); }
  }

  // ---- reads

  async files() {
    const st = await this.state();
    const out = [];
    for (const f of Object.values(st.files)) out.push({ ...f, lock: this.lockInfo(await this.readLock(f.id), st) });
    return out.sort((a, b) => (a.path.toLowerCase() < b.path.toLowerCase() ? -1 : 1));
  }
  async file(id) { return (await this.files()).find((f) => f.id === id) || null; }
  async byPath(path) { return (await this.files()).find((f) => same(f.path, path)) || null; }

  /** The folder against the vault: files nobody added, added files that are gone, and files changed since their revision. */
  async scan({ depth = 8, hash = true } = {}) {
    const st = await this.state();
    const seen = [];
    const walk = async (dir, level) => {
      for (const e of await this.fs.list(dir)) {
        if (e.name.startsWith('.') || e.name.startsWith('~$')) continue;
        const rel = dir ? dir + '/' + e.name : e.name;
        if (e.dir) { if (level < depth) await walk(rel, level + 1); } else seen.push(rel);
      }
    };
    await walk('', 0);
    const tracked = Object.values(st.files);
    const untracked = seen.filter((p) => !tracked.some((f) => same(f.path, p)));
    const missing = [], modified = [];
    for (const f of tracked) {
      if (!seen.some((p) => same(p, f.path))) { missing.push(f.id); continue; }
      if (hash) { const b = await this.fs.read(f.path); if (b && (await sha256Hex(b)) !== f.sha) modified.push(f.id); }
    }
    return { untracked, missing, modified };
  }

  async revBytes(id, rev) {
    const st = await this.state();
    const f = st.files[id];
    const r = f && (rev ? [...f.revs].reverse().find((x) => x.rev === rev) : f.revs[f.revs.length - 1]);
    if (!r) return null;
    if (r.size === 0) return new Uint8Array(0);
    return this.fs.read(blobPath(id, r.sha));
  }

  async events() {
    const b = await this.fs.read(PATHS.log);
    return b ? dec(b).split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) : [];
  }
  async history(id) { return (await this.events()).filter((e) => e.id === id).reverse(); }

  /** Everything that should hold, checked: vault.json = the log replayed, every revision's bytes there with their hash, locks. */
  async verify() {
    const problems = [];
    const logBytes = (await this.fs.read(PATHS.log)) || new Uint8Array(0);
    const { state, problems: lp } = replay(dec(logBytes));
    problems.push(...lp.map((p) => ({ ...p, where: 'log' })));
    const snap = readSnapshot(await this.fs.read(PATHS.json));
    if (!snap) problems.push({ code: 'no_snapshot' });
    else {
      if (snap.logSize !== logBytes.length) problems.push({ code: 'snapshot_behind', seq: snap.seq, logSeq: state.seq });
      const strip = (fs) => JSON.stringify(Object.values(fs).map(({ lock, ...r }) => r).sort((a, b) => (a.id < b.id ? -1 : 1)));
      if (strip(snap.files) !== strip(state.files)) problems.push({ code: 'snapshot_differs' });
    }
    for (const f of Object.values(state.files)) {
      for (const r of f.revs) {
        if (r.size === 0) continue;
        const b = await this.fs.read(blobPath(f.id, r.sha));
        if (!b) problems.push({ code: 'rev_missing', id: f.id, rev: r.rev });
        else if ((await sha256Hex(b)) !== r.sha) problems.push({ code: 'rev_damaged', id: f.id, rev: r.rev });
      }
      const lock = await this.readLock(f.id);
      if (!!lock !== !!f.lock) problems.push({ code: 'lock_mirror', id: f.id, file: !!lock, log: !!f.lock });
    }
    for (const e of await this.fs.list(PATHS.locks)) {
      const id = e.name.replace(/\.json$/, '');
      if (!e.dir && id !== '_mutex' && ID_RE.test(id) && !state.files[id] && (await this.readLock(id))) problems.push({ code: 'orphan_lock', id });
    }
    return problems;
  }

  // ---- changes

  async storeBlob(id, bytes) {
    const sha = await sha256Hex(bytes);
    if (bytes.length) await this.fs.create(blobPath(id, sha), bytes);   // false = the same bytes are there already
    return sha;
  }
  holder(lock) { return lock && same(lock.user, this.ctx.user) && same(lock.machine, this.ctx.machine); }
  async index(path, bytes, given) { if (given) return given; try { return (await this.ctx.indexer(path, bytes)) || {}; } catch { return {}; } }

  add(path, { kind, note = '', uses, number } = {}) {
    return this.mutate(async (st, emit) => {
      try { path = cleanRel(path); } catch { return fail('outside'); }
      if (path.split('/')[0].toLowerCase() === VAULT_DIR) return fail('outside');
      if (Object.values(st.files).some((f) => same(f.path, path))) return fail('exists');
      const bytes = await this.fs.read(path);
      if (!bytes) return fail('missing_file');
      let id; do id = this.newId(); while (st.files[id]);
      const sha = await this.storeBlob(id, bytes);
      const ix = await this.index(path, bytes, uses ? { uses, number } : null);
      const ev = emit({ type: 'add', id, path, kind: kind || kindOf(path), rev: firstWip(st.settings.revSkip), sha, size: bytes.length,
        uses: ix.uses || [], ...(number || ix.number ? { number: String(number || ix.number).slice(0, 60) } : {}), note: String(note).slice(0, 500) });
      return { ok: true, id, rev: ev.rev };
    });
  }

  checkOut(id, { note = '', newRevision = false } = {}) {
    return this.mutate(async (st, emit) => {
      const f = st.files[id];
      if (!f) return fail('not_found');
      const held = await this.readLock(id);
      if (held) return fail('locked', { lock: this.lockInfo(held, st) });
      if (f.state === 'review') return fail('in_review');
      if (f.state === 'obsolete') return fail('obsolete');
      if (f.state === 'released' && !newRevision) return fail('released');
      const lock = { user: this.ctx.user, machine: this.ctx.machine, at: this.iso(), note: String(note).slice(0, 500) };
      if (!(await this.fs.create(lockPath(id), enc(lock)))) return fail('locked', { lock: this.lockInfo(await this.readLock(id), st) });
      const next = f.state === 'released' ? nextWip(f.rev, st.settings.revSkip).split('.')[0] : undefined;
      emit({ type: 'checkout', id, note: lock.note, ...(next ? { next } : {}) });
      return { ok: true, lock, ...(next ? { next } : {}) };
    });
  }

  checkIn(id, { note = '', uses, number, keep = false } = {}) {
    return this.mutate(async (st, emit) => {
      const f = st.files[id];
      if (!f) return fail('not_found');
      const lock = await this.readLock(id);
      if (!lock) return fail('not_locked');
      if (!this.holder(lock)) return fail('not_holder', { lock: this.lockInfo(lock, st) });
      const bytes = await this.fs.read(f.path);
      if (!bytes) return fail('missing_file');
      const sha = await sha256Hex(bytes);
      const unchanged = sha === f.sha && !f.next;
      const ix = await this.index(f.path, bytes, uses ? { uses, number } : null);
      let rev = f.rev;
      if (!unchanged) { await this.storeBlob(id, bytes); rev = f.next ? f.next + '.1' : nextWip(f.rev, st.settings.revSkip); }
      if (!keep) await this.fs.remove(lockPath(id));
      emit({ type: 'checkin', id, note: String(note).slice(0, 500), ...(unchanged ? { same: true } : { rev, sha, size: bytes.length }),
        uses: ix.uses || f.uses, ...(ix.number !== undefined || number !== undefined ? { number: String(number ?? ix.number ?? '').slice(0, 60) } : {}), ...(keep ? { keep: true } : {}) });
      return { ok: true, rev, same: unchanged };
    });
  }

  undoCheckOut(id, { revert = false } = {}) {
    return this.mutate(async (st, emit) => {
      const f = st.files[id];
      if (!f) return fail('not_found');
      const lock = await this.readLock(id);
      if (!lock) return fail('not_locked');
      if (!this.holder(lock)) return fail('not_holder', { lock: this.lockInfo(lock, st) });
      if (revert) { const b = f.size === 0 ? new Uint8Array(0) : await this.fs.read(blobPath(id, f.sha)); if (!b) return fail('no_rev'); await this.fs.write(f.path, b); }
      await this.fs.remove(lockPath(id));
      emit({ type: 'undo-checkout', id, ...(revert ? { revert: true } : {}) });
      return { ok: true, state: f.state, rev: f.rev };
    });
  }

  submit(id, { note = '' } = {}) {
    return this.mutate(async (st, emit) => {
      const f = st.files[id];
      if (!f) return fail('not_found');
      if (f.state !== 'wip') return fail('state', { state: f.state });
      if (await this.readLock(id)) return fail('checked_out');
      if (!isWip(f.rev)) return fail('nothing_to_submit');
      emit({ type: 'submit', id, note: String(note).slice(0, 500) });
      return { ok: true };
    });
  }

  reject(id, { reason = '' } = {}) {
    return this.mutate(async (st, emit) => {
      const f = st.files[id];
      if (!f) return fail('not_found');
      if (f.state !== 'review') return fail('state', { state: f.state });
      emit({ type: 'reject', id, reason: String(reason).slice(0, 500) });
      return { ok: true };
    });
  }

  approve(id, { approver = '', note = '' } = {}) {
    return this.mutate(async (st, emit) => {
      const f = st.files[id];
      if (!f) return fail('not_found');
      if (f.state !== 'review') return fail('state', { state: f.state });
      const who = String(approver).trim().slice(0, 80);
      if (!who) return fail('no_approver');
      if (st.settings.approvers.length && !st.settings.approvers.some((a) => same(a, who))) return fail('not_approver');
      if (st.settings.approverNotAuthor && same(f.revs[f.revs.length - 1].by, who)) return fail('approver_is_author');
      const ev = emit({ type: 'approve', id, approver: who, note: String(note).slice(0, 500) });
      return { ok: true, rev: st.files[id].rev, at: ev.at };
    });
  }

  obsolete(id, { reason = '' } = {}) {
    return this.mutate(async (st, emit) => {
      const f = st.files[id];
      if (!f) return fail('not_found');
      if (f.state !== 'released') return fail('state', { state: f.state });
      if (await this.readLock(id)) return fail('checked_out');
      emit({ type: 'obsolete', id, reason: String(reason).slice(0, 500) });
      return { ok: true };
    });
  }

  rename(id, newPath) {
    return this.mutate(async (st, emit) => {
      const f = st.files[id];
      if (!f) return fail('not_found');
      try { newPath = cleanRel(newPath); } catch { return fail('outside'); }
      if (newPath.split('/')[0].toLowerCase() === VAULT_DIR) return fail('outside');
      const lock = await this.readLock(id);
      if (lock && !this.holder(lock)) return fail('locked', { lock: this.lockInfo(lock, st) });
      if (f.state === 'released' || f.state === 'review') return fail(f.state === 'released' ? 'released' : 'in_review');
      if (Object.values(st.files).some((x) => x.id !== id && same(x.path, newPath))) return fail('exists');
      const bytes = await this.fs.read(f.path);
      if (!bytes) return fail('missing_file');
      if (!same(newPath, f.path)) {
        if (!(await this.fs.create(newPath, bytes))) return fail('exists');
        await this.fs.remove(f.path);
      } else await this.fs.write(newPath, bytes);
      emit({ type: 'rename', id, from: f.path, to: newPath });
      return { ok: true, path: newPath };
    });
  }

  breakLock(id, { reason = '' } = {}) {
    return this.mutate(async (st, emit) => {
      const f = st.files[id];
      if (!f) return fail('not_found');
      const why = String(reason).trim().slice(0, 500);
      if (!why) return fail('no_reason');
      if (st.settings.admins.length && !st.settings.admins.some((a) => same(a, this.ctx.user))) return fail('not_admin');
      const lock = await this.readLock(id);
      if (!lock) return fail('not_locked');
      await this.fs.remove(lockPath(id));
      emit({ type: 'lock-broken', id, reason: why, lock });
      return { ok: true, lock };
    });
  }

  restore(id, rev) {
    return this.mutate(async (st, emit) => {
      const f = st.files[id];
      if (!f) return fail('not_found');
      const lock = await this.readLock(id);
      if (!lock) return fail('not_locked');
      if (!this.holder(lock)) return fail('not_holder', { lock: this.lockInfo(lock, st) });
      const r = [...f.revs].reverse().find((x) => x.rev === rev);
      if (!r) return fail('no_rev');
      const b = r.size === 0 ? new Uint8Array(0) : await this.fs.read(blobPath(id, r.sha));
      if (!b) return fail('no_rev');
      await this.fs.write(f.path, b);
      emit({ type: 'restore', id, rev });
      return { ok: true };
    });
  }

  setSettings(patch = {}) {
    return this.mutate(async (st, emit) => {
      if (st.settings.admins.length && !st.settings.admins.some((a) => same(a, this.ctx.user))) return fail('not_admin');
      const next = cleanSettings({ ...st.settings, ...patch });
      emit({ type: 'settings', settings: next });
      return { ok: true, settings: next };
    });
  }
}

export { indexOf };
