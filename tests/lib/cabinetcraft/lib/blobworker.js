/* SPDX-License-Identifier: Apache-2.0 */
/**
 * blobworker.js — a module Web Worker for an add-on file, the way PartCraft builds its own workers (exact-client.js blobModules). PartCraft pages are
 * cross-origin isolated, which refuses a worker script loaded by URL; the worker's modules are fetched here and linked as blob: modules instead.
 *
 *   depsOf(source) → the relative single-quoted imports ('./x.js', '../y/z.js') a module names
 *   blobGraph(entryUrl, { fetchText }) → Promise<{ root: blob URL, urls: Map(url → blob URL) }>   (each module once; an import cycle is an error)
 *   blobWorker(entryUrl, { name }) → Promise<Worker>
 * The worker's modules must be DOM-free and import each other only with relative single-quoted paths (lib/nest-worker.js and what it imports are).
 */
export const depsOf = (src) => [...new Set([...String(src).matchAll(/^\s*(?:import|export)\b[^'"\n;]*?from\s*'(\.\.?\/[A-Za-z0-9_./-]+\.m?js)'|^\s*import\s*'(\.\.?\/[A-Za-z0-9_./-]+\.m?js)'/gm)].map((m) => m[1] || m[2]))];

export async function blobGraph(entryUrl, { fetchText = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(u + ': ' + r.status); return r.text(); }, makeUrl = (src) => URL.createObjectURL(new Blob([src], { type: 'text/javascript' })) } = {}) {
  const urls = new Map();
  const visit = async (url, stack = []) => {
    if (urls.has(url)) return urls.get(url);
    if (stack.includes(url)) throw new Error('import cycle at ' + url);   // i18n-ignore: a developer error
    let src = await fetchText(url);
    for (const d of depsOf(src)) {
      const u = await visit(new URL(d, url).href, [...stack, url]);
      src = src.split(`'${d}'`).join(`'${u}'`);
    }
    const b = makeUrl(src);
    urls.set(url, b);
    return b;
  };
  const root = await visit(entryUrl);
  return { root, urls };
}

export async function blobWorker(entryUrl, { name = 'CabinetCraft' } = {}) {
  const g = await blobGraph(entryUrl);
  return new Worker(g.root, { type: 'module', name });
}
