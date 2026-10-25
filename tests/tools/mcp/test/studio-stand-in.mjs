/* SPDX-License-Identifier: Apache-2.0 */
/**
 * studio-stand-in.mjs — Studio, stood in around one app page in Playwright (0.7 session assistants; browser-paths.mjs,
 * browser-civil.mjs):
 *   - the desktop bridge (window.cadcraftDesktop): open/save/folder dialogs, read/write/stat/list, backed by Node's fs and
 *     refusing any path the person did not choose, as desktop-shell's files.rs does (a picked folder grants what is in it);
 *   - the window channel (window.cadcraftStudio): control.request in, control.response out, as the hub's relay sends them.
 *
 *   const s = await studioStandIn(page, { app: 'cadcraft', folder: JOB });   // before page.goto
 *   s.openNext([path]) · s.dialogs · s.grants · await s.rpc('tools/list', {}) · await s.call('tool', args) → CallToolResult
 * The folder dialog answers with `folder` (and grants it); the open dialog with what openNext queued (else cancelled).
 * desktop: false = the window channel only (a browser window in Studio's place: no desktop bridge, no file paths).
 */
import fs from 'node:fs';
import path from 'node:path';

export async function studioStandIn(page, { app, folder = null, desktop = true }) {
  const grants = new Set(), dialogs = [], queue = [];
  const granted = (p) => [...grants].some((g) => p === g || p.startsWith(g + path.sep));
  if (desktop) await page.exposeBinding('__ccDesk', async (_src, op, p, b64) => {
    if (op === 'folderDialog') { dialogs.push('folder'); grants.add(folder); return folder; }
    if (op === 'openDialog') { dialogs.push('open'); const got = queue.splice(0); got.forEach((g) => grants.add(g)); return got.length ? got : null; }
    if (op === 'saveDialog') { dialogs.push('save'); return null; }
    const real = path.resolve(String(p));
    if (!granted(real)) throw new Error('not_allowed: the app can reach only files you opened or saved, or folders you chose');
    if (op === 'read') return fs.readFileSync(real).toString('base64');
    if (op === 'write') { fs.writeFileSync(real, Buffer.from(b64, 'base64')); return true; }
    if (op === 'stat') { try { const st = fs.statSync(real); return { size: st.size, mtime: st.mtimeMs }; } catch { return null; } }
    if (op === 'list') return fs.readdirSync(real, { withFileTypes: true }).map((e) => ({ name: e.name, dir: e.isDirectory() }));
    throw new Error('unknown op ' + op);
  });
  if (desktop) await page.addInitScript(() => {
    const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
    const u8 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
    window.cadcraftDesktop = { version: 1,
      openDialog: async () => window.__ccDesk('openDialog'),
      saveDialog: async () => window.__ccDesk('saveDialog'),
      openFolderDialog: async () => window.__ccDesk('folderDialog'),
      readFile: async (p) => u8(await window.__ccDesk('read', p)),
      writeFile: async (p, bytes) => { await window.__ccDesk('write', p, b64(bytes)); },
      stat: async (p) => window.__ccDesk('stat', p),
      listDir: async (p) => window.__ccDesk('list', p),
      launchFiles: async () => [], onOpenFiles: () => {} };
  });
  const waiting = new Map();
  await page.exposeBinding('__ccStudioPost', (_src, json) => {
    const { type, data } = JSON.parse(json);
    if (type === 'control.response' && waiting.has(data.rid)) { waiting.get(data.rid)(data.answer); waiting.delete(data.rid); }
  });
  await page.addInitScript((appName) => {
    const handlers = new Map();
    window.__ccStudioDeliver = (type, data, env) => { for (const fn of handlers.get(type) || []) { try { fn(data, env); } catch { /* a handler */ } } };
    window.cadcraftStudio = Object.freeze({ id: appName + '-stand-in', app: appName, hub() {},
      post: (type, data, to) => { window.__ccStudioPost(JSON.stringify({ type, data, to })); return 'm'; },
      on: (type, fn) => { if (!handlers.has(type)) handlers.set(type, new Set()); handlers.get(type).add(fn); return () => handlers.get(type).delete(fn); } });
  }, app);
  let seq = 0;
  const rpc = (method, params) => new Promise((resolve, reject) => {
    const rid = 'r' + ++seq;
    waiting.set(rid, resolve);
    setTimeout(() => { if (waiting.has(rid)) { waiting.delete(rid); reject(new Error('no answer to ' + method)); } }, 120000);
    page.evaluate(([rid, message]) => window.__ccStudioDeliver('control.request', { rid, sid: 'stand-in', client: { name: 'stand-in-test', version: '1' }, message }, { from: 'studio-hub', app: 'studio' }),
      [rid, { jsonrpc: '2.0', id: seq, method, params }]).catch(reject);
  });
  return {
    grants, dialogs, rpc,
    openNext: (paths) => queue.push(...paths.map((p) => path.resolve(p))),
    call: async (name, a = {}) => (await rpc('tools/call', { name, arguments: a })).result,
  };
}
