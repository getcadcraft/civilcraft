/* SPDX-License-Identifier: Apache-2.0 */
/**
 * webifc-node.mjs — loadCcIfc(app): cc-ifc (the app's dev/ifc/api.js, what DetailCraft ships since 0.4 I.11) with the
 * web-ifc call surface; loadWebIfc(root): loads the VENDORED browser build of web-ifc (public_html/assets/vendor/web-ifc/current)
 * in Node, so bin/test-detailcraft.mjs reads DetailCraft's IFC with exactly the library the browser apps use.
 * The browser build refuses Node by checking process.versions.node and window; for the moment of Init we hide
 * the first, give it a window, and serve the .wasm through fetch from disk. Nothing is downloaded.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadWebIfc(root) {
  const dir = path.join(root, 'public_html/assets/vendor/web-ifc/current') + '/';
  const W = await import(pathToFileURL(dir + 'web-ifc-api.js').href);
  const api = new W.IfcAPI();
  const realVersions = process.versions, realFetch = globalThis.fetch, hadWindow = 'window' in globalThis;
  const realErr = console.error;
  globalThis.fetch = async (u) => {
    const p = String(u);
    if (p.startsWith(dir)) return new Response(fs.readFileSync(p), { headers: { 'content-type': 'application/wasm' } });
    return realFetch(u);
  };
  if (!hadWindow) globalThis.window = globalThis;
  console.error = (...a) => { if (!/streaming compile|falling back/.test(String(a[0]))) realErr(...a); };
  api.SetWasmPath(dir, true);
  Object.defineProperty(process, 'versions', { value: { ...realVersions, node: undefined }, configurable: true });
  const ready = api.Init(undefined, true);
  Object.defineProperty(process, 'versions', { value: realVersions, configurable: true });
  try { await ready; } finally {
    globalThis.fetch = realFetch;
    console.error = realErr;
    if (!hadWindow) delete globalThis.window;
  }
  const version = fs.realpathSync(dir.slice(0, -1)).split(path.sep).pop();
  return { W, api, version };
}

/** cc-ifc from the app's own copy (dev/ifc/), the engine DetailCraft imports with. */
export async function loadCcIfc(app) {
  const W = await import(pathToFileURL(path.join(app, 'ifc/api.js')).href);
  const api = new W.IfcAPI();
  await api.Init();
  return { W, api, version: 'cc-ifc' };
}
/** Is the vendored web-ifc still here (a test-only oracle now)? */
export const hasWebIfc = (root) => fs.existsSync(path.join(root, 'public_html/assets/vendor/web-ifc/current/web-ifc-api.js'));
