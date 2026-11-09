#!/usr/bin/env node
/* SPDX-License-Identifier: GPL-3.0-or-later */
/**
 * cc-openfoam-runner.mjs — the helper program of the wind-openfoam add-on. It runs on YOUR computer, outside the browser and outside CadCraft, and calls
 * YOUR OpenFOAM installation. CadCraft never ships OpenFOAM; this file only starts it as a separate process and passes files in and out.
 *
 *   node cc-openfoam-runner.mjs serve [--port 8765] [--config runner.json]     listens on 127.0.0.1 only; prints a token to paste into the add-on
 *   node cc-openfoam-runner.mjs run --case <dir> [--config runner.json]        runs the steps listed in <dir>/steps.json (used by the validation scripts)
 * runner.json (all optional): { "bashrc": "/usr/lib/openfoam/openfoam2312/etc/bashrc"   source this before each command (the usual install),
 *                               "env": { "NAME": "value" }                               extra environment (a user-space install: LD_LIBRARY_PATH, WM_PROJECT_DIR, ...),
 *                               "path": ["/dir/with/the/binaries"],                       prepended to PATH,
 *                               "work": "/tmp/cc-openfoam", "origins": ["https://getcadcraft.com"], "maxJobs": 1 }
 * HTTP (JSON): GET /health → { ok, runner, foam }   POST /job { files:{path:text}, steps:[{cmd,args,optional}], collect:[path prefixes, e.g. 'cc-samples.json'] } → { id }
 *              GET /job/<id> → { state: queued|running|done|failed|stopped, step, log, files? }   DELETE /job/<id> → stops it
 * Every request needs the header  x-cc-token: <token>.  Only the commands cc-sample (built in, reads files), blockMesh, snappyHexMesh, checkMesh, surfaceFeatureExtract, simpleFoam, postProcess
 * and decomposePar/reconstructPar may be started, with arguments that begin with '-' only. Case folders are created under `work` and removed after collecting.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sampleCase } from './foam-sample.mjs';

export const ALLOWED_CMDS = new Set(['blockMesh', 'snappyHexMesh', 'checkMesh', 'surfaceFeatureExtract', 'simpleFoam', 'postProcess', 'decomposePar', 'reconstructPar']);
const SAFE_REL = /^[A-Za-z0-9_][A-Za-z0-9_.+-]*(\/[A-Za-z0-9_][A-Za-z0-9_.+-]*)*$/;

/** Write `files` under dir (relative safe paths only). */
export function writeFiles(dir, files) {
  for (const [rel, text] of Object.entries(files)) {
    if (!SAFE_REL.test(rel) || rel.length > 200) throw new Error('bad file path ' + rel);
    const p = path.join(dir, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text);
  }
}
const sh = (s) => "'" + String(s).replace(/'/g, "'\\''") + "'";

/** Run one command in `dir` with the configured OpenFOAM environment. → { code, out } (out = the last ~200 kB). */
export function runCmd(dir, cmd, args, cfg = {}, onData = null, procRef = null) {
  return new Promise((resolve) => {
    if (!ALLOWED_CMDS.has(cmd)) return resolve({ code: 126, out: 'command not allowed: ' + cmd });
    if (!args.every((a) => /^-[A-Za-z0-9_.=,-]*$/.test(a) || /^[A-Za-z0-9_.-]+$/.test(a))) return resolve({ code: 126, out: 'argument not allowed' });
    const env = { ...process.env, ...(cfg.env || {}) };
    if (cfg.path?.length) env.PATH = cfg.path.join(path.delimiter) + path.delimiter + env.PATH;
    const line = (cfg.bashrc ? `source ${sh(cfg.bashrc)} >/dev/null 2>&1; ` : '') + `${cmd} ${args.map(sh).join(' ')}`;
    const ch = spawn('bash', ['-c', line], { cwd: dir, env });
    if (procRef) procRef.proc = ch;
    let out = '';
    const take = (d) => { out += d; if (out.length > 400000) out = out.slice(-200000); if (onData) onData(String(d)); };
    ch.stdout.on('data', take); ch.stderr.on('data', take);
    ch.on('error', (e) => resolve({ code: 127, out: String(e) }));
    ch.on('close', (code) => resolve({ code: code ?? 1, out: out.slice(-200000) }));
  });
}

/** Run a whole case: steps in order. → { ok, log, failedStep }. A step with optional:true may fail. */
export async function runCase(dir, steps, cfg = {}, hooks = {}) {
  let log = '';
  for (let i = 0; i < steps.length; i++) {
    const st = steps[i]; if (hooks.stopped?.()) return { ok: false, log, failedStep: 'stopped' };
    if (hooks.onStep) hooks.onStep(i, st.cmd);
    let r;
    if (st.cmd === 'cc-sample') {   // not an OpenFOAM program: read the finished case's files and sample U and p at cc-probes.json's points
      try { const pts = JSON.parse(fs.readFileSync(path.join(dir, 'cc-probes.json'), 'utf8')); fs.writeFileSync(path.join(dir, 'cc-samples.json'), JSON.stringify(sampleCase(dir, pts))); r = { code: 0, out: 'sampled ' + pts.length + ' points' }; } catch (e) { r = { code: 1, out: String(e.stack || e) }; }
    } else r = await runCmd(dir, st.cmd, st.args || [], cfg, (d) => hooks.onLog?.(d), hooks.procRef);
    log += `\n== ${st.cmd} ${(st.args || []).join(' ')} -> exit ${r.code}\n` + r.out.slice(-6000);
    fs.writeFileSync(path.join(dir, `log.${st.cmd}`), r.out);
    if (r.code !== 0 && !st.optional) return { ok: false, log, failedStep: st.cmd };
  }
  return { ok: true, log };
}

/** Read the files named by `collect` (path prefixes inside the case; files under postProcessing/ and the log files) into { path: text }, ≤ 40 MB in total. */
export function collectFiles(dir, collect) {
  const out = {}; let total = 0;
  const walk = (rel) => {
    const full = path.join(dir, rel); if (!fs.existsSync(full)) return;
    const st = fs.statSync(full);
    if (st.isDirectory()) { for (const n of fs.readdirSync(full)) walk(rel ? rel + '/' + n : n); return; }
    if (total + st.size > 40e6) return; out[rel] = fs.readFileSync(full, 'utf8'); total += st.size;
  };
  for (const c of collect) walk(c.replace(/\/$/, ''));
  return out;
}

function loadConfig(file) { try { return file ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}; } catch (e) { throw new Error('cannot read config ' + file + ': ' + e.message); } }

export function serve({ port = 8765, cfg = {} } = {}) {
  const token = crypto.randomBytes(16).toString('hex'), jobs = new Map(), work = cfg.work || path.join(os.tmpdir(), 'cc-openfoam');
  fs.mkdirSync(work, { recursive: true });
  const origins = new Set(cfg.origins || []);
  const srv = http.createServer(async (req, res) => {
    const origin = req.headers.origin;
    const cors = (origin && (origins.has(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) ? { 'access-control-allow-origin': origin, 'access-control-allow-headers': 'x-cc-token, content-type', 'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS', vary: 'origin' } : {};
    const send = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json', ...cors }); res.end(JSON.stringify(obj)); };
    if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
    if (req.headers['x-cc-token'] !== token) return send(401, { ok: false, error: 'token' });
    const url = new URL(req.url, 'http://x'), m = /^\/job\/([0-9a-f]{16})$/.exec(url.pathname);
    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        const r = await runCmd(work, 'postProcess', ['-help'], cfg); return send(200, { ok: r.code === 0, runner: 1, foam: (/Build:\s*(\S+)/.exec(r.out) || /OpenFOAM-?v?([\w.]+)/.exec(r.out) || [])[0] || '', detail: r.code === 0 ? '' : r.out.slice(-300) });
      }
      if (req.method === 'POST' && url.pathname === '/job') {
        let body = ''; for await (const c of req) { body += c; if (body.length > 60e6) return send(413, { ok: false, error: 'too large' }); }
        const j = JSON.parse(body), id = crypto.randomBytes(8).toString('hex'), dir = path.join(work, id);
        if ([...jobs.values()].filter((x) => x.state === 'running').length >= (cfg.maxJobs || 1)) return send(429, { ok: false, error: 'busy' });
        fs.mkdirSync(dir, { recursive: true }); writeFiles(dir, j.files || {});
        const job = { id, dir, state: 'running', step: '', log: '', stopped: false, procRef: {} }; jobs.set(id, job);
        runCase(dir, j.steps || [], cfg, { stopped: () => job.stopped, onStep: (i, c) => { job.step = c; job.stepIndex = i; }, onLog: (d) => { job.tail = (job.tail + d).slice(-3000); }, procRef: job.procRef }).then((r) => {
          job.log = r.log; job.state = job.stopped ? 'stopped' : r.ok ? 'done' : 'failed'; job.failedStep = r.failedStep;
          if (r.ok) job.files = collectFiles(dir, j.collect || ['cc-samples.json', 'postProcessing/probes']);
          job.files = { ...(job.files || {}), ...collectFiles(dir, fs.readdirSync(dir).filter((n) => n.startsWith('log.'))) };
          fs.rmSync(dir, { recursive: true, force: true });
        });
        job.tail = ''; return send(200, { ok: true, id });
      }
      if (m && jobs.has(m[1])) {
        const job = jobs.get(m[1]);
        if (req.method === 'DELETE') { job.stopped = true; job.procRef.proc?.kill('SIGTERM'); return send(200, { ok: true }); }
        if (req.method === 'GET') { const o = { ok: true, id: job.id, state: job.state, step: job.step, tail: job.tail }; if (job.state !== 'running') { o.log = job.log; o.files = job.files; o.failedStep = job.failedStep; } return send(200, o); }
      }
      send(404, { ok: false, error: 'not found' });
    } catch (e) { send(500, { ok: false, error: String(e.message || e) }); }
  });
  return new Promise((resolve) => srv.listen(port, '127.0.0.1', () => resolve({ srv, token, port: srv.address().port })));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
  const cfg = loadConfig(arg('--config', process.env.CC_OPENFOAM_CONFIG || ''));
  if (a[0] === 'serve') {
    const { token, port } = await serve({ port: Number(arg('--port', 8765)), cfg });
    console.log(`cc-openfoam-runner listening on http://127.0.0.1:${port}\ntoken: ${token}\n(paste the token into Settings > Add-ons > Pedestrian wind (OpenFOAM); stop with Ctrl+C)`);
  } else if (a[0] === 'run') {
    const dir = path.resolve(arg('--case', '.')); const steps = JSON.parse(fs.readFileSync(path.join(dir, 'steps.json'), 'utf8'));
    const r = await runCase(dir, steps, cfg, { onStep: (i, c) => console.log('step', i, c) }); console.log(r.ok ? 'done' : 'failed at ' + r.failedStep); if (!r.ok) console.log(r.log.slice(-3000)); process.exit(r.ok ? 0 : 1);
  } else { console.log('usage: node cc-openfoam-runner.mjs serve|run  (see the top of this file)'); process.exit(2); }
}
