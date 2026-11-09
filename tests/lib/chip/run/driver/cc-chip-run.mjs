#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cc-chip-run.mjs — the Chip design add-on's run script (0.9 HD.4–HD.9). Studio runs it with Node through engines.rs's add-on run
 * (`engine.run`, docs/ADDONS-SPEC.md § 16): Studio unpacks the run package into a fresh folder, asks the person once, and starts
 *     node <folder>/engine/cc-chip-run.mjs <folder>/cc-engine-job.json
 * This script then starts the person's OWN tools (Icarus Verilog, Verilator, Yosys, OpenROAD, KLayout, Netgen) one after another as
 * separate programs — never a shell — reading the steps from <folder>/chip-job.json, and hands everything they wrote back as one stored
 * zip (`CCRESULT out/result.zip`). Nothing is bundled: a tool that is not on this computer fails its step with "not found".
 * The same package can be run by hand:  unzip run.zip -d run && node run/engine/cc-chip-run.mjs run/chip-job.json
 *
 * chip-job.json: { format: 'cadcraft-chip-job', version: 1, toolsDir: '' | '/opt/eda/bin', pdkDir: '' | '/opt/pdk',
 *                  steps: [{ tool, args: [..], label?, optional?, stdout?: 'out/x.txt' }], collect: ['out/', 'netlist.v', …], stepSeconds? }
 *   tool: one of PROGRAMS (looked for in toolsDir, toolsDir/bin, then PATH), or obj_dir/V<name> (a program an earlier Verilator step
 *   built in this folder). Arguments: plain strings; `{tools}/…` and `{pdk}/…` become paths under those folders; any other absolute path
 *   or `..` is refused. A failed step that is not optional stops the run; the result still comes back with the logs.
 * Honest limit: the tools are full programs (a Yosys or KLayout script can do what the program can); this script is not a sandbox.
 * Self-contained on purpose (no imports beyond Node's own), so it runs from any folder with any Node 18+.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

export const PROGRAMS = ['iverilog', 'vvp', 'verilator', 'yosys', 'yosys-abc', 'openroad', 'sta', 'klayout', 'netgen', 'netgen-lvs'];
const BUILT = /^obj_dir\/V[A-Za-z_][A-Za-z0-9_]{0,60}$/;
const SAFE_REL = /^[A-Za-z0-9_][A-Za-z0-9_.+-]*(\/[A-Za-z0-9_][A-Za-z0-9_.+-]*)*\/?$/;
const MAX_COLLECT = 400 * 1024 * 1024;

// ---------------------------------------------------------------- stored zip (the same format as lib/chip/run/zip.js)
let TABLE = null;
function crc32(b) {
  if (!TABLE) { TABLE = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; TABLE[n] = c >>> 0; } }
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function zipStored(files) {
  const parts = [], central = [];
  let off = 0;
  for (const [name, data] of files) {
    const nb = Buffer.from(name, 'utf8'), crc = crc32(data);
    const h = Buffer.alloc(30 + nb.length);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x0800, 6); h.writeUInt32LE(crc, 14); h.writeUInt32LE(data.length, 18); h.writeUInt32LE(data.length, 22); h.writeUInt16LE(nb.length, 26); nb.copy(h, 30);
    const c = Buffer.alloc(46 + nb.length);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8); c.writeUInt32LE(crc, 16); c.writeUInt32LE(data.length, 20); c.writeUInt32LE(data.length, 24); c.writeUInt16LE(nb.length, 28); c.writeUInt32LE(off, 42); nb.copy(c, 46);
    parts.push(h, data); central.push(c); off += h.length + data.length;
  }
  const cs = central.reduce((s, c) => s + c.length, 0), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(central.length, 8); end.writeUInt16LE(central.length, 10); end.writeUInt32LE(cs, 12); end.writeUInt32LE(off, 16);
  return Buffer.concat([...parts, ...central, end]);
}

// ---------------------------------------------------------------- checks
export function checkArg(a, job) {
  if (typeof a !== 'string' || a.length > 4000 || /[\u0000]/.test(a)) throw new Error('bad argument');
  let s = a;
  if (s.startsWith('{tools}/')) { if (!job.toolsDir) throw new Error('no tools folder for ' + a); s = path.join(job.toolsDir, s.slice(8)); }
  else if (s.startsWith('{pdk}/')) { if (!job.pdkDir) throw new Error('no PDK folder for ' + a); s = path.join(job.pdkDir, s.slice(6)); }
  else {
    // a path-like word must stay inside the job folder: no absolute paths, no `..` steps (inside -I/… -D… values too)
    const bare = s.replace(/^(-[A-Za-z]+=?|\+[\w]+=)/, '');
    if (/^([A-Za-z]:[\\/]|[\\/])/.test(bare) || bare.split(/[\\/]/).includes('..')) throw new Error('argument leaves the job folder: ' + a);
  }
  return s;
}

function findProgram(tool, job, dir) {
  if (BUILT.test(tool)) { const p = path.join(dir, tool + (process.platform === 'win32' ? '.exe' : '')); return fs.existsSync(p) ? p : null; }
  if (!PROGRAMS.includes(tool)) throw new Error('not a program this script may start: ' + tool);
  const names = process.platform === 'win32' ? [tool + '.exe', tool + '.bat', tool + '.cmd', tool] : [tool];
  const dirs = [];
  if (job.toolsDir) dirs.push(job.toolsDir, path.join(job.toolsDir, 'bin'));
  for (const d of String(process.env.PATH || '').split(path.delimiter)) if (d) dirs.push(d);
  for (const d of dirs) for (const n of names) { const p = path.join(d, n); try { if (fs.statSync(p).isFile()) return p; } catch { /* next */ } }
  return null;
}

function runOne(program, args, dir, env, seconds, stdoutFile) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    let out = '', killed = false;
    const ch = spawn(program, args, { cwd: dir, env, shell: false, windowsHide: true, detached: process.platform !== 'win32' });
    const sink = stdoutFile ? fs.createWriteStream(path.join(dir, stdoutFile)) : null;
    const take = (d) => { out += d; if (out.length > 4e6) out = out.slice(-2e6); };
    ch.stdout.on('data', (d) => { take(d); if (sink) sink.write(d); });
    ch.stderr.on('data', take);
    const timer = setTimeout(() => { killed = true; try { process.platform === 'win32' ? ch.kill() : process.kill(-ch.pid, 'SIGKILL'); } catch { ch.kill('SIGKILL'); } }, seconds * 1000);
    ch.on('error', (e) => { clearTimeout(timer); resolve({ code: 127, out: String(e.message || e), ms: Date.now() - t0 }); });
    ch.on('close', (code) => { clearTimeout(timer); if (sink) sink.end(); resolve({ code: killed ? 124 : code ?? 1, out: killed ? out + '\n(stopped: the step ran longer than ' + seconds + ' s)' : out, ms: Date.now() - t0 }); });
  });
}

function walk(dir, rel, out, skip) {
  const full = rel ? path.join(dir, rel) : dir;
  let st;
  try { st = fs.lstatSync(full); } catch { return; }
  if (st.isSymbolicLink()) return;
  if (st.isDirectory()) { for (const n of fs.readdirSync(full).sort()) walk(dir, rel ? rel + '/' + n : n, out, skip); return; }
  if (st.isFile() && !skip(rel)) out.push([rel, st.size]);
}

export async function runJob(dir, { log = (s) => process.stdout.write(s + '\n') } = {}) {
  const job = JSON.parse(fs.readFileSync(path.join(dir, 'chip-job.json'), 'utf8'));
  if (job.format !== 'cadcraft-chip-job' || job.version !== 1) throw new Error('not a chip job');
  if (job.toolsDir && !path.isAbsolute(job.toolsDir)) throw new Error('the tools folder must be a full path');
  if (job.pdkDir && !path.isAbsolute(job.pdkDir)) throw new Error('the PDK folder must be a full path');
  fs.mkdirSync(path.join(dir, 'out'), { recursive: true });
  const env = { ...process.env };
  if (job.toolsDir) env.PATH = [job.toolsDir, path.join(job.toolsDir, 'bin'), env.PATH].join(path.delimiter);
  if (job.pdkDir) env.PDK_ROOT = job.pdkDir;
  const steps = Array.isArray(job.steps) ? job.steps.slice(0, 40) : [];
  const record = { format: 'cadcraft-chip-run', version: 1, ok: true, steps: [], started: new Date().toISOString(), platform: process.platform };
  const before = new Map(); { const l = []; walk(dir, '', l, () => false); for (const [rel] of l) before.set(rel, fs.statSync(path.join(dir, rel)).mtimeMs); }
  for (let i = 0; i < steps.length; i++) {
    const st = steps[i];
    log('CCPROGRESS ' + (i / Math.max(1, steps.length)).toFixed(3));
    const label = String(st.label || st.tool).replace(/[^\w.+ -]/g, '').slice(0, 40) || 'step';
    const logName = 'out/log-' + String(i + 1).padStart(2, '0') + '-' + label.replace(/\s+/g, '-') + '.txt';
    const r = { tool: String(st.tool), label, args: [], code: 0, ms: 0, log: logName, program: '' };
    try {
      if (st.stdout && (!SAFE_REL.test(st.stdout) || !st.stdout.startsWith('out/'))) throw new Error('stdout must be a file under out/');
      const args = (Array.isArray(st.args) ? st.args : []).slice(0, 2000).map((a) => checkArg(a, job));
      const program = findProgram(r.tool, job, dir);
      r.args = args;
      if (!program) { r.code = 127; fs.writeFileSync(path.join(dir, logName), r.tool + ': not found on this computer' + (job.toolsDir ? ' (looked in ' + job.toolsDir + ' and on the search path)' : ' (looked on the search path)') + '\n'); }
      else {
        r.program = program;
        log('running ' + r.tool + ' ' + args.join(' ').slice(0, 300));
        const res = await runOne(program, args, dir, env, Math.min(Number(job.stepSeconds) || 3600, 12 * 3600), st.stdout || null);
        r.code = res.code; r.ms = res.ms;
        fs.writeFileSync(path.join(dir, logName), res.out);
      }
    } catch (e) { r.code = 126; fs.writeFileSync(path.join(dir, logName), String(e.message || e) + '\n'); }
    record.steps.push(r);
    if (r.code !== 0 && !st.optional) { record.ok = false; record.failed = i; break; }
  }
  record.ended = new Date().toISOString();
  // hand back: every file the run made or changed, plus what `collect` names (no obj_dir build tree unless asked)
  const collect = (Array.isArray(job.collect) ? job.collect : []).filter((c) => typeof c === 'string' && SAFE_REL.test(c));
  const listed = [];
  walk(dir, '', listed, (rel) => {
    if (rel === 'out/result.zip' || rel.startsWith('engine/')) return true;
    if (collect.includes(rel)) return false;   // named exactly: always handed back
    const unchanged = (() => { try { return before.has(rel) && fs.statSync(path.join(dir, rel)).mtimeMs === before.get(rel); } catch { return true; } })();
    if (unchanged) return true;                 // an input the run did not touch (even under out/) does not come back
    if (collect.some((c) => c.endsWith('/') && rel.startsWith(c))) return false;
    if (rel.startsWith('obj_dir/')) return true;
    try { return before.has(rel) && fs.statSync(path.join(dir, rel)).mtimeMs === before.get(rel); } catch { return true; }
  });
  const files = [];
  let total = 0;
  for (const [rel, size] of listed) { if (total + size > MAX_COLLECT) { record.cut = true; continue; } total += size; files.push([rel, fs.readFileSync(path.join(dir, rel))]); }
  files.push(['cc-run.json', Buffer.from(JSON.stringify(record, null, 2))]);
  fs.writeFileSync(path.join(dir, 'out/result.zip'), zipStored(files));
  log('CCPROGRESS 1');
  log('CCRESULT out/result.zip');
  return record;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const arg = process.argv[2];
  if (!arg) { console.log('usage: node cc-chip-run.mjs <job folder>/chip-job.json   (Studio passes <job folder>/cc-engine-job.json)'); process.exit(2); }
  const dir = fs.existsSync(arg) && fs.statSync(arg).isDirectory() ? path.resolve(arg) : path.dirname(path.resolve(arg));
  runJob(dir).then(() => process.exit(0), (e) => { console.log('CCERROR job_failed'); console.error(String(e.stack || e)); process.exit(3); });
}
