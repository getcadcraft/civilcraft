#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer messages. */
/**
 * run-hub.mjs — the hub-mode eval runner (ai_PART_3, AC eval; docs/AI-CONNECT-SPEC.md § 8). The apps that have no headless twin
 * (ModelCraft, DetailCraft) and the window-only tools (MarkupCraft's tasks, redlines and pins) run in a real /lab page, the way
 * Studio's hub reaches them: assistants switched on in the app's stored settings, Studio's window channel stood in
 * (tools/mcp/test/studio-stand-in.mjs), every call a JSON-RPC `tools/call` that goes through the app's own host.control, so
 * permissions, schemas, previews and undo labels are the real ones. No model is involved: the scripted client makes the calls an
 * assistant would make, then an INDEPENDENT read judges the result: the page's own state (`eval:`), or a file the app wrote.
 *
 *   node tools/mcp/evals/run-hub.mjs [--app modelcraft,detailcraft,markupcraft] [--task id] [--verbose] [--json]      (run as root)
 *
 * Task files: evals/hub/<app>.json, an array of
 *   { id, title, headliner?, prompt, allow: ["read","edit"], setup?: { files?: [{ fixture, via: "<js function path>", type }], wait?: "<js expression>" },
 *     steps: [{ tool, args, as?, fail?, expect?: [{path, eq|gte|lte|approx|includes|matches|exists}], download?: { name: "<regexp>", includes?: [text] } }],
 *     check: [{ eval: "<js expression run in the page; {{name.path}} = a value saved with `as`>" | tool + args, path?, eq|gte|lte|approx(+tol)|includes|matches|exists }] }
 *   - "$name.path" in a string is a value saved earlier with `as`; the same `fail`/`expect` as run.mjs;
 *   - setup.files: the fixture (repo-relative) is handed to the page function `via` as a File (e.g. "window.markupcraft.openFiles");
 *   - setup.run: a JavaScript statement run in the page first, awaited (e.g. `await window.ccAddons.loader.setEnabled('pid', true)`);
 *   - setup.wait: a JavaScript expression the page must make true before the first step (30 s).
 * One browser context per task (no state shared); the signed-in session is minted by tools/mcp/evals/hub-admin.php (no sign-in, so the admin sign-in limit is never used): its own test admin (tools/mcp/evals/hub-admin.php).
 * Exit 1 when any task fails. `--json` prints { app: { passed, total, tasks[] } } for the results log.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { at, judge } from './checkers.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../..');
const argv = process.argv.slice(2);
const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const VERBOSE = argv.includes('--verbose'), JSON_OUT = argv.includes('--json');
const BASE = process.env.CADCRAFT_BASE || 'https://getcadcraft.com';
const APPS = arg('--app') ? arg('--app').split(',') : fs.existsSync(path.join(HERE, 'hub')) ? fs.readdirSync(path.join(HERE, 'hub')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)) : [];
const only = arg('--task');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const dbg = (...a) => { if (process.env.CC_HUB_DEBUG) console.error('[hub ' + new Date().toISOString().slice(11, 19) + ']', ...a); };

const { studioStandIn } = await import(pathToFileURL(path.join(REPO, 'tools/mcp/test/studio-stand-in.mjs')).href);
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/mcp/evals/hub-admin.php'), 'session'], { encoding: 'utf8' }));   // { cookie: 'cc_session=…', email }
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
// A signed-in session minted in-process (hub-admin.php), put in each task's context as a cookie: nothing here touches the admin sign-in limit.
const sessionCookie = () => { const [name, ...v] = admin.cookie.split('='); return { name, value: v.join('='), domain: new URL(BASE).hostname, path: '/', httpOnly: true, secure: BASE.startsWith('https') }; };

const resolveRefs = (v, saved) => {
  if (typeof v === 'string') {
    const m = /^\$([a-zA-Z0-9_]+)((?:\.[^\s]+)?)$/.exec(v);
    if (m) { const base = saved[m[1]]; if (base === undefined) throw new Error('step "' + m[1] + '" has no result yet'); const r = m[2] ? at(base, m[2].slice(1)) : base; if (r === undefined) throw new Error('"' + v + '" has no value'); return r; }
    return v;
  }
  if (Array.isArray(v)) return v.map((x) => resolveRefs(x, saved));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolveRefs(x, saved)]));
  return v;
};
const wanted = (c) => JSON.stringify(Object.fromEntries(Object.entries(c).filter(([k]) => !['eval', 'tool', 'args', 'path'].includes(k))));

async function runTask(app, task) {
  const t0 = Date.now(), log = [], problems = [];
  let ctx = null;
  try {
    dbg('task', task.id);
    ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
    await ctx.addCookies([sessionCookie()]);
    dbg('opening', app);
    const p = await ctx.newPage();
    p.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
    const S = await studioStandIn(p, { app, desktop: false });
    await p.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch { /* fine */ } }, ['cadcraft.assistants.' + app, JSON.stringify({ enabled: true, groups: task.allow || ['read'] })]);
    await p.goto(BASE + '/lab/' + app + '?space=paper', { waitUntil: 'networkidle' });
    dbg('page loaded', p.url(), JSON.stringify(await p.title()));
    if (/\/login/.test(p.url())) throw new Error('the lab page sent us to the sign-in: the test admin is not signed in');
    const setup = task.setup || {};
    for (const f of setup.files || []) {
      const b64 = fs.readFileSync(path.join(REPO, f.fixture)).toString('base64');
      await p.evaluate(async ([via, name, type, data]) => {
        const bin = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
        const fn = via.split('.').reduce((o, k) => (o ? o[k] : undefined), window), owner = via.split('.').slice(0, -1).reduce((o, k) => (o ? o[k] : undefined), window);
        if (typeof fn !== 'function') throw new Error(via + ' is not a function in the page');
        await fn.call(owner, [new File([bin], name, { type })]);
      }, [f.via, path.basename(f.fixture), f.type || 'application/octet-stream', b64]);
    }
    if (setup.run) await p.evaluate(`(async () => { ${setup.run} })()`);   // 0.8 chem-draw_PART_4: a page expression run before the first step (e.g. switch an add-on on)
    if (setup.wait) await p.waitForFunction(setup.wait, null, { timeout: 30000 });
    // ready = the app answers through Studio's channel (its host.control is configured and listening)
    for (let i = 0, ready = false; !ready; i++) {
      if (i > 25) throw new Error('the app did not answer app_info in 50 s');
      ready = await Promise.race([S.call('app_info', {}).then((r) => { if (i < 3) dbg('app_info →', JSON.stringify(r).slice(0, 160)); return !!(r && !r.isError); }, (e) => { if (i < 3) dbg('app_info failed', e.message); return false; }), wait(1500).then(() => false)]);
      if (!ready) await wait(500);
    }
    dbg('app answers');
    const saved = {};
    const call = async (tool, args) => {
      const r = await S.call(tool, args || {});
      return r;
    };
    for (const [i, s] of (task.steps || []).entries()) {
      const args = resolveRefs(s.args || {}, saved);
      const dl = s.download ? p.waitForEvent('download', { timeout: 20000 }).catch(() => null) : null;
      const res = await call(s.tool, args);
      if (!res) throw new Error('step ' + (i + 1) + ' ' + s.tool + ': no result');
      const text = (res.content || []).map((c) => c.text || '').join(' ');
      log.push(s.tool + (res.isError ? ' (error)' : ''));
      if (s.fail === '') throw new Error('step ' + (i + 1) + ': fail needs the text the error must contain');
      if (s.fail) { if (!res.isError || !text.includes(s.fail)) throw new Error('step ' + (i + 1) + ' ' + s.tool + ' should fail with "' + s.fail + '" but: ' + text.slice(0, 200)); }
      else if (res.isError) throw new Error('step ' + (i + 1) + ' ' + s.tool + ' failed: ' + text.slice(0, 300));
      for (const c of s.expect || []) { const v = at(res.structuredContent || {}, c.path); if (!judge(v, c)) throw new Error('step ' + (i + 1) + ' ' + s.tool + ' result ' + c.path + ' is ' + JSON.stringify(v)?.slice(0, 100) + ', wanted ' + wanted(c)); }
      if (dl) {
        const d = await dl;
        if (!d) throw new Error('step ' + (i + 1) + ' ' + s.tool + ': the app downloaded nothing');
        if (s.download.name && !new RegExp(s.download.name).test(d.suggestedFilename())) throw new Error('step ' + (i + 1) + ': the file is named ' + d.suggestedFilename() + ', wanted ' + s.download.name);
        const body = fs.readFileSync(await d.path(), 'utf8');
        for (const inc of s.download.includes || []) if (!body.includes(inc)) throw new Error('step ' + (i + 1) + ': the downloaded file lacks "' + inc + '"');
      }
      if (s.as) saved[s.as] = res.structuredContent || {};
    }
    for (const c of task.check || []) {
      let v;
      if (c.eval) v = await p.evaluate(`(async () => (${c.eval.replace(/\{\{([^}]+)\}\}/g, (m, ref) => { const [name, ...rest] = ref.split('.'); const base = saved[name]; const val = rest.length ? at(base, rest.join('.')) : base; if (val === undefined) throw new Error('{{' + ref + '}} has no value'); return JSON.stringify(val); })}))()`);   // {{name.path}} = a value saved with `as`
      else { const r = await call(c.tool, resolveRefs(c.args || {}, saved)); if (r.isError) throw new Error('check ' + c.tool + ' failed: ' + (r.content || []).map((x) => x.text).join(' ').slice(0, 200)); v = r.structuredContent || {}; }
      if (c.path) v = at(v, c.path);
      if (!judge(v, c)) throw new Error('check ' + (c.eval || c.tool) + (c.path ? ' ' + c.path : '') + ' is ' + JSON.stringify(v)?.slice(0, 120) + ', wanted ' + wanted(c));
    }
    if (problems.length) throw new Error('the page reported ' + problems[0]);
    return { id: task.id, ok: true, ms: Date.now() - t0, calls: log.length };
  } catch (e) {
    return { id: task.id, ok: false, ms: Date.now() - t0, error: String(e && e.message || e), calls: log };
  } finally {
    if (ctx) await ctx.close().catch(() => {});
  }
}

const out = {};
let failed = 0;
try {
  for (const app of APPS) {
    const file = path.join(HERE, 'hub', app + '.json');
    if (!fs.existsSync(file)) { out[app] = { passed: 0, total: 0, tasks: [], note: 'no hub eval file' }; continue; }
    const tasks = JSON.parse(fs.readFileSync(file, 'utf8')).filter((t) => !only || t.id === only);
    const res = [];
    for (const t of tasks) {
      let r = await runTask(app.replace(/^packs-/, ''), t);   // hub/packs-<app>.json = the pack starters of that app
      if (!r.ok && /did not answer app_info/.test(r.error)) r = await runTask(app.replace(/^packs-/, ''), t);   // a page that never woke up (a cold start under load): once more, in a fresh context
      res.push({ ...r, headliner: !!t.headliner });
      if (!r.ok) failed++;
      if (!JSON_OUT && (VERBOSE || !r.ok)) console.log((r.ok ? '  ok   ' : '  FAIL ') + app + '/' + t.id + (r.ok ? ' (' + r.calls + ' calls, ' + r.ms + ' ms)' : ' — ' + r.error));
    }
    out[app] = { passed: res.filter((r) => r.ok).length, total: res.length, tasks: res };
  }
} finally {
  await browser.close().catch(() => {});
  try { execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/mcp/evals/hub-admin.php'), 'down'], { encoding: 'utf8' }); } catch { /* left up for the next run */ }
}
if (JSON_OUT) console.log(JSON.stringify(out, null, 1));
else for (const [app, r] of Object.entries(out)) console.log(app.padEnd(13) + r.passed + '/' + r.total + (r.note ? '  (' + r.note + ')' : ''));
process.exit(failed ? 1 : 0);
