/* SPDX-License-Identifier: Apache-2.0 */
/**
 * node-env.mjs — BimCraft's point cloud modules in Node, the way bin/test-pointcloud.mjs loads them: the app's import map
 * (laz-perf, proj4, …) resolved to public_html/assets/vendor, its English strings, the crs catalog, laz-perf started.
 *   const { P, R, X, L, E57_LIB, APP } = await loadPointCloudEnv();
 * P pointcloud.js · R register.js · X scan-export.js · L las.js · E57_LIB the { glue, wasm } web-e57 reader needs (or null).
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const APP = path.join(REPO, 'public_html/assets/apps/bimcraft/dev');
let done = null;
export function loadPointCloudEnv() {
  return (done ||= (async () => {
    const VENDOR = path.join(REPO, 'public_html/assets/vendor');
    const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
    registerHooks({
      resolve(spec, ctx, next) {
        const m = manifest.imports?.[spec];
        if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
        return next(spec, ctx);
      },
    });
    const imp = (f) => import(pathToFileURL(path.join(APP, f)).href);
    (await imp('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
    (await imp('crs.js')).setCatalog(JSON.parse(fs.readFileSync(path.join(APP, 'crs-db.json'), 'utf8')));
    const [P, R, X, L] = await Promise.all([imp('pointcloud.js'), imp('register.js'), imp('scan-export.js'), imp('las.js')]);
    globalThis.window = globalThis;   // laz-perf's web build checks it is in a page
    await L.lazPerf({ wasmBinary: fs.readFileSync(path.join(VENDOR, 'laz-perf/current/laz-perf.wasm')) });
    delete globalThis.window;
    const dir = path.join(VENDOR, 'web-e57/current');
    const E57_LIB = fs.existsSync(dir) ? { glue: pathToFileURL(path.join(dir, 'e57_bg.js')).href, wasm: fs.readFileSync(path.join(dir, 'e57_bg.wasm')) } : null;
    return { P, R, X, L, E57_LIB, APP, REPO, VENDOR };
  })());
}
