/* SPDX-License-Identifier: Apache-2.0 */
/**
 * util.mjs — shared plumbing for the cc-dwg harness (tools/dwg-test): paths, hashing, a job pool,
 * timed child processes (wall ms + peak RSS via /usr/bin/time -v) and a pool of Xvfb displays for the
 * ODA File Converter (≤ 6 at once). No DWG knowledge lives here.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');   // tools/dwg-test
export const REPO = path.resolve(HERE, '../..');
export const TESTFILES = '/var/www/CADCRAFT/testfiles';
export const CORPUS = path.join(TESTFILES, 'dwg-corpus');
export const TRUTH = path.join(CORPUS, '_truth');
export const READERS = path.join(REPO, 'tools/civilcraft-test/venv/dwg-readers');
export const PYTHON = fs.existsSync(path.join(REPO, 'tools/civilcraft-test/venv/bin/python'))
  ? path.join(REPO, 'tools/civilcraft-test/venv/bin/python') : 'python3';
export const DUMP_PY = path.join(HERE, 'lib/dump.py');
export const ODA = path.join(READERS, 'oda/AppRun');
export const TMP = path.join(REPO, 'tmp/dwg-compare');

/** Corpus versions: ODA's output-version names ↔ the DWG version tags. */
export const ODA_VERSIONS = { ACAD2000: 'AC1015', ACAD2004: 'AC1018', ACAD2007: 'AC1021', ACAD2010: 'AC1024', ACAD2013: 'AC1027', ACAD2018: 'AC1032' };
export const TAGS = Object.values(ODA_VERSIONS);
export const TAG_TO_ODA = Object.fromEntries(Object.entries(ODA_VERSIONS).map(([k, v]) => [v, k]));
export const RELEASE = { AC1012: 'R13', AC1014: 'R14', AC1015: 'R2000', AC1018: 'R2004', AC1021: 'R2007', AC1024: 'R2010', AC1027: 'R2013', AC1032: 'R2018' };

export const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
export const sha256File = (f) => sha256(fs.readFileSync(f));
export const readJson = (f, dflt = null) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return dflt; } };
export const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(v, null, 1)); };
export const mkdirp = (d) => { fs.mkdirSync(d, { recursive: true }); return d; };
export const tmpDir = (tag) => fs.mkdtempSync(path.join(mkdirp(path.join(TMP, 'work')), tag + '-'));

export function arg(name, dflt = null) {
  const i = process.argv.indexOf(name);
  if (i < 0) return dflt;
  const v = process.argv[i + 1];
  return v && !v.startsWith('--') ? v : true;
}
export const flag = (name) => process.argv.includes(name);
export const list = (v) => (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : null);

/**
 * Extra drawings only this machine has (client files that must never be in the repo): absolute paths, one per line, in
 * testfiles/PRIVATE-DWG.txt (outside the repo; # comments). Checks that use them say so and skip them when the list is
 * absent, as in a clone.
 */
export function privateDrawings() {
  const f = path.join(TESTFILES, 'PRIVATE-DWG.txt');
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('#') && fs.existsSync(s));
}

/** Readable unique file stem from a source path ("Kitchen Equipment.dwg" → "kitchen-equipment"). */
export function slug(s, max = 64) {
  let t = s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (t.length > max) t = t.slice(0, max).replace(/-+$/, '');
  return t || 'drawing';
}

/** Run jobs with at most `limit` running at once; returns results in input order. */
export async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => { while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); } };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker));
  return out;
}

/** A counting semaphore (e.g. ≤ 6 ODA instances across every pool). */
export function semaphore(n) {
  let free = n; const q = [];
  return {
    async take() { if (free > 0) { free--; return; } await new Promise((r) => q.push(r)); },
    give() { const r = q.shift(); if (r) r(); else free++; },
    async with(fn) { await this.take(); try { return await fn(); } finally { this.give(); } },
  };
}

/**
 * Run a command under /usr/bin/time -v. → { status, signal, stdout, stderr, ms, peakMB, timedOut }
 * peakMB = maximum resident set size of the command (GNU time, children included).
 */
export function runTimed(cmd, args, { env, cwd, timeout = 600000, encoding = 'latin1', input } = {}) {
  return new Promise((resolve) => {
    const tf = path.join(os.tmpdir(), `dwgt-time-${process.pid}-${crypto.randomBytes(4).toString('hex')}`);
    const t0 = process.hrtime.bigint();
    const ch = spawn('/usr/bin/time', ['-v', '-o', tf, cmd, ...args], { env: env ? { ...process.env, ...env } : process.env, cwd, stdio: ['pipe', 'pipe', 'pipe'], detached: true });
    const so = [], se = []; let soN = 0, seN = 0; const CAP = 64 << 20;
    ch.stdout.on('data', (d) => { if (soN < CAP) { so.push(d); soN += d.length; } });
    ch.stderr.on('data', (d) => { if (seN < CAP) { se.push(d); seN += d.length; } });
    if (input) ch.stdin.end(input); else ch.stdin.end();
    let timedOut = false;
    const killer = setTimeout(() => { timedOut = true; try { process.kill(-ch.pid, 'SIGKILL'); } catch { /* gone */ } }, timeout);
    ch.on('close', (status, signal) => {
      clearTimeout(killer);
      const ms = Number(process.hrtime.bigint() - t0) / 1e6;
      let peakMB = null, exit = status;
      try {
        const t = fs.readFileSync(tf, 'utf8');
        const m = /Maximum resident set size \(kbytes\): (\d+)/.exec(t); if (m) peakMB = Number(m[1]) / 1024;
        const x = /Exit status: (\d+)/.exec(t); if (x) exit = Number(x[1]);
        if (/Command terminated by signal (\d+)/.test(t)) exit = 128 + Number(/signal (\d+)/.exec(t)[1]);
        fs.unlinkSync(tf);
      } catch { /* killed before time wrote */ }
      resolve({ status: exit, signal, stdout: Buffer.concat(so).toString(encoding), stderr: Buffer.concat(se).toString(encoding), ms, peakMB, timedOut });
    });
  });
}

/** Xvfb displays for the ODA File Converter, started on demand and stopped at exit. */
const xvfb = { procs: [], free: [], waiting: [], started: false };
export const ODA_SLOTS = 6;
export async function withDisplay(fn) {
  if (!xvfb.started) {
    xvfb.started = true;
    const base = 140 + (process.pid % 50) * 8;
    for (let i = 0; i < ODA_SLOTS; i++) {
      const d = ':' + (base + i);
      const p = spawn('Xvfb', [d, '-screen', '0', '1024x768x24', '-nolisten', 'tcp'], { stdio: 'ignore', detached: false });
      p.unref();   // never keeps Node alive; killed on exit
      xvfb.procs.push(p); xvfb.free.push(d);
    }
    const stop = () => { for (const p of xvfb.procs) try { p.kill('SIGKILL'); } catch { /* gone */ } };
    process.on('exit', stop);
    for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => { stop(); process.exit(130); });
    await new Promise((r) => setTimeout(r, 700));
  }
  let d = xvfb.free.pop();
  if (!d) d = await new Promise((r) => xvfb.waiting.push(r));
  try { return await fn(d); } finally { const w = xvfb.waiting.shift(); if (w) w(d); else xvfb.free.push(d); }
}

/**
 * One ODA File Converter run on ONE file (it converts folders; symlinked inputs hang it, so the file
 * is copied into a fresh input folder). → { out (path|null), err (lines from .err), ms, peakMB, timedOut }
 */
export async function odaConvert(file, outVersion, outType, outDir, { stem, timeout = 300000 } = {}) {
  const work = tmpDir('oda');
  const inDir = mkdirp(path.join(work, 'in')), oDir = mkdirp(path.join(work, 'out'));
  const name = (stem || path.basename(file, path.extname(file))) + '.dwg';
  fs.copyFileSync(file, path.join(inDir, name));
  const r = await withDisplay((display) => runTimed(ODA, [inDir, oDir, outVersion, outType, '0', '1', '*.dwg'], { env: { DISPLAY: display }, timeout }));
  const ext = outType === 'DXF' ? '.dxf' : outType === 'DXB' ? '.dxb' : '.dwg';
  const produced = path.join(oDir, path.basename(name, '.dwg') + ext);
  const errF = produced + '.err';
  const err = fs.existsSync(errF) ? fs.readFileSync(errF, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean) : [];
  let out = null;
  if (fs.existsSync(produced)) {
    mkdirp(outDir);
    out = path.join(outDir, path.basename(produced));
    fs.renameSync(produced, out);
    if (err.length) fs.writeFileSync(out + '.err', err.join('\n') + '\n'); else fs.rmSync(out + '.err', { force: true });
  }
  fs.rmSync(work, { recursive: true, force: true });
  if (r.timedOut) err.push(`ODA File Converter timed out after ${Math.round(timeout / 1000)} s`);
  return { out, err, ms: r.ms, peakMB: r.peakMB, timedOut: r.timedOut, status: r.status };
}

/** ezdxf dump of a DXF into the harness's common entity form (lib/dump.py). */
export async function dumpDxf(dxf, outJson, { encoding } = {}) {
  const args = [DUMP_PY, dxf, outJson];
  if (encoding) args.push('--encoding', encoding);
  const r = await runTimed(PYTHON, args, { timeout: 900000, encoding: 'utf8' });
  if (r.status !== 0 || !fs.existsSync(outJson)) return { ok: false, error: (r.stderr || r.stdout || 'dump failed').trim().split('\n').slice(-3).join(' | '), ms: r.ms, peakMB: r.peakMB };
  return { ok: true, ms: r.ms, peakMB: r.peakMB };
}

export const fmtMB = (b) => (b / 1048576).toFixed(1) + ' MB';
export const log = (...a) => { if (!flag('--quiet')) console.log(...a); };
