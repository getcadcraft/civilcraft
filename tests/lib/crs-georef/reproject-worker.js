/* SPDX-License-Identifier: Apache-2.0 */
/**
 * reproject-worker.js — reprojects a Float64Array of x, y off the page (0.8 D8.9 item 3). The page sends { proj4Url, fromDef, toDef, xy }
 * (proj4 is imported by the URL the page resolved: workers do not see the page's import map) and gets { progress } messages, then
 * { xy, bad } or { error }. The loop is reproject-batch.js, imported next to this file.
 */
import { reprojectBatch } from './reproject-batch.js';
self.onmessage = async (e) => {
  const { proj4Url, fromDef, toDef, xy } = e.data;
  try {
    const proj4 = (await import(proj4Url)).default;
    const n = xy.length / 2;
    let bad = 0;
    for (let i = 0; i < n; i += 50000) {
      bad += reprojectBatch(proj4, fromDef, toDef, xy, { start: i, end: Math.min(n, i + 50000) });
      self.postMessage({ progress: Math.min(1, (i + 50000) / n) });
    }
    self.postMessage({ xy, bad }, [xy.buffer]);
  } catch (err) {
    self.postMessage({ error: String(err && err.message || err) });   // i18n-ignore: an engine failure, shown inside a translated sentence
  }
};
