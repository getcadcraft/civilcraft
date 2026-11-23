#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-shell-mount-core.mjs — 0.11 PERF.74: the seven apps that carried the doc's mount block in their own shell-mount.js now import it from
 * the shared shell-mount-core.js. For each app, the OLD block (from a before-copy of its shell-mount.js) and the NEW path (the app's
 * dev/shell-mount.js as it now is: its import of ./shell-mount-core.js and the options it passes) are run against the same recording stand-ins
 * (window.ccCalc … ccAsk, document events, ccDocTitleFollow), modules ready at once and modules that come later by their ready event; every
 * call the block makes (which module, which method, the argument's keys and what its functions return) and what it adds to the host
 * (emit, fileOpened and the words fileOpened() resets Suggest with) must be the same. Also: each app's dev/shell-mount-core.js is a byte copy.
 *
 *   node tools/shell-test/test-shell-mount-core.mjs <before-dir> [app …]     before-dir holds <app>/shell-mount.js (the old files)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const [BEFORE, ...want] = process.argv.slice(2);
if (!BEFORE) { console.error('usage: test-shell-mount-core.mjs <before-dir> [app …]'); process.exit(2); }
const APPS = want.length ? want : ['cadcraft', 'modelcraft', 'detailcraft', 'bimcraft', 'markupcraft', 'partcraft', 'takeoffcraft'];
const CORE_PATH = path.join(ROOT, 'public_html/assets/js/shell-mount-core.js');
const CORE = fs.readFileSync(CORE_PATH, 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };

/** the text of `export function mountShellModules…` up to its closing brace at column 0 */
const blockOf = (src) => { const i = src.indexOf('export function mountShellModules('); const j = src.indexOf('\n}', i); return src.slice(i, j + 2).replace(/^export /, ''); };
const TR = (k) => 'T[' + k + ']';   // a stand-in translator: what the block asked for stays visible

function stage(ready) {
  const calls = [];
  const listeners = new Map();
  const win = { addEventListener: (ev, f) => calls.push(['window.addEventListener', ev]) || (ev === 'load' && listeners.set('load', f)) };
  const doc = { addEventListener: (ev, f) => { calls.push(['document.addEventListener', ev]); listeners.set(ev, f); } };
  const mod = (name) => new Proxy({}, { get: (_, m) => (arg) => {
    const shape = arg && typeof arg === 'object' ? Object.keys(arg).sort().map((k) => k + (typeof arg[k] === 'function' ? '()=' + safe(() => JSON.stringify(arg[k]('x'))) : '=' + typeof arg[k])) : [typeof arg];
    calls.push([name + '.' + String(m), ...shape]);
    return 'ret:' + name;
  } });
  const safe = (f) => { try { return f(); } catch (e) { return 'threw ' + e.message; } };
  const names = ['ccCalc', 'ccReasons', 'ccTotals', 'ccLessons', 'ccDocInfo', 'ccSuggest', 'ccActivity', 'ccAsk'];
  const g = { window: win, document: doc };
  for (const n of names) if (ready) g[n] = mod(n);
  if (ready) win.ccDocTitleFollow = (h) => calls.push(['ccDocTitleFollow', typeof h]);
  for (const n of names) win[n] = g[n];
  const fire = () => {   // the modules arrive later: install them, then fire each ready event and the load event
    for (const n of names) { g[n] = mod(n); win[n] = g[n]; }
    win.ccDocTitleFollow = (h) => calls.push(['ccDocTitleFollow', typeof h]);
    for (const [ev, f] of [...listeners]) { calls.push(['fire', ev]); f(); }
  };
  return { calls, g, fire };
}
function host() {
  const h = { control: { name: 'control' } };
  for (const k of ['units', 'params', 'step', 'selection', 'onSelection', 'select', 'expected', 'statusBar', 'docinfo', 'rev', 'document', 'perms', 'ghost', 'undoTo', 'history', 'version', 'askContext', 'skillPack'])
    h[k] = typeof k === 'string' && ['units', 'params', 'perms', 'docinfo'].includes(k) ? { read: () => 'r', onChange: () => 'c' } : (x) => k + ':' + x;
  h.file = { set: (k, j) => 'set ' + k + ' ' + j };
  h.totals = [{ id: 't1' }];
  h.lessons = [{ id: 'l1' }];
  h.probes = { p1: () => true };
  return h;
}
const run = (fnText, call, ready) => {
  const st = stage(ready);
  const h = host();
  // the block reads its globals bare (ccCalc.attach…) and through window[…]: give it both
  // the block reads its globals bare (ccCalc.attach…) and through window[…]; bare names must follow late arrivals, so they are read
  // through a Proxy scope (a sloppy-mode `with`, test only)
  const scope = new Proxy({}, { has: (_, k) => k in st.g || k === 'tr', get: (_, k) => (k === 'tr' ? TR : st.g[k]) });
  const fn = new Function('scope', 'host', 'with (scope) { return (' + fnText + ')(host' + call + '); }');
  fn(scope, h);
  if (!ready) st.fire();
  const opened = h.fileOpened ? h.fileOpened() : 'no fileOpened';
  const openedWhy = h.fileOpened ? h.fileOpened('why') : '';
  st.calls.push(['host.emit', typeof h.emit, h.emit ? h.emit('tool', {}) : '']);
  st.calls.push(['host.fileOpened()', String(opened), String(openedWhy)]);
  return st.calls.map((c) => c.join(' | '));
};

for (const app of APPS) {
  const before = fs.readFileSync(path.join(BEFORE, app, 'shell-mount.js'), 'utf8');
  const now = fs.readFileSync(path.join(ROOT, 'public_html/assets/apps', app, 'dev/shell-mount.js'), 'utf8');
  const copy = path.join(ROOT, 'public_html/assets/apps', app, 'dev/shell-mount-core.js');
  ok(fs.existsSync(copy) && fs.readFileSync(copy).equals(Buffer.from(CORE)), `${app}: dev/shell-mount-core.js is a byte copy of assets/js/shell-mount-core.js`);
  ok(!now.includes('const when = (api, name, go)'), `${app}: dev/shell-mount.js no longer carries its own copy of the block`);
  ok(/from '\.\/shell-mount-core\.js'/.test(now), `${app}: dev/shell-mount.js imports ./shell-mount-core.js`);
  // what the app's file now runs: either a re-export of the core, or a wrapper with its own options
  const wrap = now.match(/export function mountShellModules\(host\) \{ return mountCore\(host, (\{[^\n]*\})\); \}/);
  const reexport = /import \{ mountShellModules \} from '\.\/shell-mount-core\.js';[^\n]*\nexport \{ mountShellModules \};/.test(now);
  ok(!!wrap !== reexport, `${app}: dev/shell-mount.js either re-exports the core or wraps it once`);
  const coreFn = blockOf(CORE);
  const callArgs = wrap ? ', ' + wrap[1] : '';
  for (const ready of [true, false]) {
    const a = run(blockOf(before), '', ready), b = run(coreFn, callArgs, ready);
    const same = a.length === b.length && a.every((x, i) => x === b[i]);
    ok(same && a.length > 20, `${app}: the same ${a.length} calls as the old block (modules ${ready ? "ready at once" : "arriving later"})`);
    if (!same) for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) { console.log(`     old: ${a[i]}\n     new: ${b[i]}`); break; }
  }
}
console.log(`\ntest-shell-mount-core: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
