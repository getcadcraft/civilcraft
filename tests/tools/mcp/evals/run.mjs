#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer messages. */
/**
 * run.mjs — the eval set's scripted client (docs/AI-CONNECT-SPEC.md § 8, AC eval). For each task in evals/<app>.json it starts the
 * real stdio MCP server (tools/mcp/server.mjs) on a temporary folder with the task's permissions, makes the calls an assistant
 * would make (JSON-RPC: initialize, tools/call), then lets checkers.mjs read the SAVED file and judge it. No model is involved,
 * so the set is deterministic; any failure is a regression.
 *
 *   node tools/mcp/evals/run.mjs [--app cadcraft,bimcraft…] [--task id] [--verbose] [--json] [--package <installed @getcadcraft/mcp dir>]
 *
 * Task file: [{ id, title, headliner?, prompt, folders?: ["Out"], fixtures: { "dest/in/folder": "repo-relative/source" }, allow: ["read","edit","save"],
 *   steps: [{ tool, args, as?, fail? }], check: [{ file, kind, path?, eq|gte|lte|approx(+tol)|includes|matches|exists }] }]
 *   - a string "$name.path.to.value" in args is replaced by that value of an earlier step saved with `as: "name"`;
 *   - `expect: [{path, eq|gte|…}]` judges the step's structured result; `fail: "text"` expects the call to come back as a tool error whose text contains it (an assistant must see why);
 *   - "$dir" in a string is the temporary folder.
 * Exit 1 when any task fails. `--json` prints { app: { passed, total, tasks[] } } for the results log.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { factsOf, at, judge } from './checkers.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const argv = process.argv.slice(2);
const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const VERBOSE = argv.includes('--verbose'), JSON_OUT = argv.includes('--json');
const PKG = arg('--package');
const SERVER = PKG ? path.join(PKG, 'mcp/server.mjs') : path.join(ROOT, 'tools/mcp/server.mjs');

function startServer(dir, allow) {
  const p = spawn(process.execPath, [SERVER, '--root', dir, '--allow', allow.join(',')], { stdio: ['pipe', 'pipe', 'pipe'], cwd: dir });
  let buf = '', n = 0, err = '';
  const waiting = new Map();
  p.stdout.on('data', (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i); buf = buf.slice(i + 1); if (!line.trim()) continue; try { const m = JSON.parse(line); if (waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } } catch { /* not a message */ } } });
  p.stderr.on('data', (d) => { err += d; });
  const send = (method, params, notify = false) => new Promise((res, rej) => {
    const id = notify ? undefined : ++n;
    p.stdin.write(JSON.stringify({ jsonrpc: '2.0', ...(notify ? {} : { id }), method, params }) + '\n');
    if (notify) return res(null);
    const t = setTimeout(() => { waiting.delete(id); rej(new Error('no answer to ' + method + ' in 120 s. ' + err.slice(-300))); }, 120000);
    waiting.set(id, (m) => { clearTimeout(t); res(m); });
  });
  return { send, close: () => { try { p.stdin.end(); p.kill(); } catch { /* gone */ } }, err: () => err };
}

const resolveRefs = (v, saved, dir) => {
  if (typeof v === 'string') {
    const m = /^\$([a-zA-Z0-9_]+)((?:\.[^\s]+)?)$/.exec(v);
    if (m && m[1] !== 'dir') { const base = saved[m[1]]; if (base === undefined) throw new Error('step "' + m[1] + '" has no result yet'); const r = m[2] ? at(base, m[2].slice(1)) : base; if (r === undefined) throw new Error('no ' + v + ' in the result of ' + m[1]); return r; }
    return v.replace(/\$dir/g, dir);
  }
  if (Array.isArray(v)) return v.map((x) => resolveRefs(x, saved, dir));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolveRefs(x, saved, dir)]));
  return v;
};

async function runTask(app, task) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-eval-'));
  const t0 = Date.now(), log = [];
  let srv = null;
  try {
    for (const f of task.folders || []) fs.mkdirSync(path.join(dir, f), { recursive: true });
    for (const [dest, src] of Object.entries(task.fixtures || {})) {
      const to = path.join(dir, dest);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(path.join(ROOT, src), to);
    }
    srv = startServer(dir, task.allow || ['read']);
    const init = await srv.send('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'cadcraft-eval', version: '1' } });
    if (!init.result) throw new Error('initialize failed: ' + JSON.stringify(init.error));
    await srv.send('notifications/initialized', {}, true);
    const saved = {};
    for (const [i, s] of (task.steps || []).entries()) {
      const args = resolveRefs(s.args || {}, saved, dir);
      const r = await srv.send('tools/call', { name: s.tool, arguments: args });
      const res = r.result;
      if (!res) throw new Error('step ' + (i + 1) + ' ' + s.tool + ': protocol error ' + JSON.stringify(r.error));
      const text = (res.content || []).map((c) => c.text || '').join(' ');
      log.push(s.tool + (res.isError ? ' (error)' : ''));
      if (s.fail === '') throw new Error('step ' + (i + 1) + ': fail needs the text the error must contain');
      if (s.fail) { if (!res.isError || !text.includes(s.fail)) throw new Error('step ' + (i + 1) + ' ' + s.tool + ' should fail with "' + s.fail + '" but: ' + text.slice(0, 200)); }
      else if (res.isError) throw new Error('step ' + (i + 1) + ' ' + s.tool + ' failed: ' + text.slice(0, 300));
      if (s.expect) for (const c of s.expect) { const v = at(res.structuredContent || {}, c.path); if (!judge(v, c)) throw new Error('step ' + (i + 1) + ' ' + s.tool + ' result ' + c.path + ' is ' + JSON.stringify(v)?.slice(0, 100) + ', wanted ' + JSON.stringify(c)); }
      if (s.as) saved[s.as] = res.structuredContent || {};
    }
    srv.close(); srv = null;
    const facts = {};
    for (const c of task.check || []) {
      const file = path.join(dir, resolveRefs(c.file, saved, dir));
      if (!fs.existsSync(file)) throw new Error('check: ' + c.file + ' was not written');
      const key = c.kind + ':' + file;
      facts[key] ??= await factsOf(c.kind, file);
      const v = c.path ? at(facts[key], c.path) : facts[key];
      if (!judge(v, c)) throw new Error('check: ' + c.file + (c.path ? ' ' + c.path : '') + ' is ' + JSON.stringify(v)?.slice(0, 120) + ', wanted ' + JSON.stringify(Object.fromEntries(Object.entries(c).filter(([k]) => !['file', 'kind', 'path'].includes(k)))));
    }
    return { id: task.id, ok: true, ms: Date.now() - t0, calls: log.length };
  } catch (e) {
    return { id: task.id, ok: false, ms: Date.now() - t0, error: String(e && e.message || e), calls: log };
  } finally {
    if (srv) srv.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const apps = arg('--app') ? arg('--app').split(',') : fs.readdirSync(HERE).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5));
const only = arg('--task');
const out = {};
let failed = 0;
for (const app of apps) {
  const file = path.join(HERE, app + '.json');
  if (!fs.existsSync(file)) { out[app] = { passed: 0, total: 0, tasks: [], note: 'no eval file' }; continue; }
  const tasks = JSON.parse(fs.readFileSync(file, 'utf8')).filter((t) => !only || t.id === only);
  const res = [];
  for (const t of tasks) {
    const r = await runTask(app, t);
    res.push({ ...r, headliner: !!t.headliner });
    if (!r.ok) failed++;
    if (!JSON_OUT && (VERBOSE || !r.ok)) console.log((r.ok ? '  ok   ' : '  FAIL ') + app + '/' + t.id + (r.ok ? ' (' + r.calls + ' calls, ' + r.ms + ' ms)' : ' — ' + r.error));
  }
  out[app] = { passed: res.filter((r) => r.ok).length, total: res.length, tasks: res };
}
if (JSON_OUT) console.log(JSON.stringify(out, null, 1));
else for (const [app, r] of Object.entries(out)) console.log(app.padEnd(13) + r.passed + '/' + r.total + (r.note ? '  (' + r.note + ')' : ''));
process.exit(failed ? 1 : 0);
