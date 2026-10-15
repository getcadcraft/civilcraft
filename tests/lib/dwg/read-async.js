/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: worker plumbing; the reader's own messages come from messages.js (the page's language reaches the worker below). */
/**
 * read-async.js — readDwgAsync(bytes, opts) → Promise<model>: readDwg (read.js) in a module Worker, so a big drawing
 * no longer freezes the page (cc-dwg, Apache-2.0).
 *
 *   import { readDwgAsync } from './dwg/read-async.js';
 *   const model = await readDwgAsync(bytes);            // same model as readDwg(bytes), same options ({ strict })
 *   readDwgAsync(bytes, { worker: false })               // on this thread (what happens anyway without Worker: Node)
 *   dwgWorkerState()  → 'idle' | 'worker' | 'main'       how the last read ran (tests, diagnostics)
 *
 * The worker is built from this library's own files: each is fetched by `import.meta.resolve` — so an app's import
 * map (version-busted URLs) and its saved offline copy apply, exactly as for the page's own imports — and its relative
 * imports are rewritten to blob: URLs (workers do not see the page's import map). One worker is kept and reused; reads
 * queue on it. The caller's bytes are copied, never transferred away. If a worker cannot start (no Worker, a blocked
 * blob: URL, a fetch that fails), the read runs on this thread instead, and later reads do too.
 * Errors come back as Error objects with the reader's message and `name` (DwgReadError, UnsupportedDwg).
 * Language: the worker has no page, so it gets the `ccdwg.*` strings of the page's catalog (globalThis.ccI18n, i18n.js) as a
 * small ccI18n of its own; messages.js finds it there exactly as on the page. No catalog → the reader's English.
 */

const ROOT = 'read.js';
let worker = null;            // Promise<Worker | null>
let state = 'idle';
let seq = 0;
const pending = new Map();    // id → { resolve, reject }

export function dwgWorkerState() { return state; }

export async function readDwgAsync(bytes, opts = {}) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const { worker: useWorker = true, ...readOpts } = opts;
  const w = useWorker ? await startWorker() : null;
  if (!w) return onThisThread(data, readOpts);
  const copy = data.slice();
  return new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject, data, readOpts });
    w.postMessage({ id, bytes: copy.buffer, opts: readOpts }, [copy.buffer]);
  });
}

async function onThisThread(data, readOpts) {
  state = 'main';
  const { readDwg } = await import('./read.js');
  return readDwg(data, readOpts);
}

function startWorker() {
  if (worker) return worker;
  worker = (async () => {
    if (typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof URL?.createObjectURL !== 'function' || typeof import.meta.resolve !== 'function') return null;
    try {
      const urls = await blobModules([ROOT]);
      const body = `import { readDwg } from '${urls.get(ROOT)}';
const L = ${JSON.stringify(workerStrings())};
if (L) {
  let pr; try { pr = new Intl.PluralRules(L.locale); } catch { pr = { select: () => 'other' }; }
  self.ccI18n = { has: (k) => Object.prototype.hasOwnProperty.call(L.strings, k), t(k, f = {}) {
    let v = L.strings[k];
    if (v && typeof v === 'object') v = v['=' + f.n] ?? v[pr.select(Number(f.n))] ?? v.other;
    return String(v ?? k).replace(/\\{\\{|\\}\\}|\\{([A-Za-z_][A-Za-z0-9_]*)\\}/g, (m, n) => m === '{{' ? '{' : m === '}}' ? '}' : f[n] != null ? String(f[n]) : m);
  } };
}
self.onmessage = (e) => {
  const { id, bytes, opts } = e.data;
  try { self.postMessage({ id, model: readDwg(new Uint8Array(bytes), opts || {}) }); }
  catch (err) { self.postMessage({ id, error: { name: err && err.name || 'Error', message: String(err && err.message || err) } }); }
};
self.postMessage({ ready: true });`;
      const w = new Worker(URL.createObjectURL(new Blob([body], { type: 'text/javascript' })), { type: 'module' });
      await new Promise((ok, fail) => {
        const t = setTimeout(() => fail(new Error('the DWG worker did not start')), 15000);
        w.addEventListener('message', function ready(e) { if (e.data?.ready) { clearTimeout(t); w.removeEventListener('message', ready); ok(); } });
        w.addEventListener('error', (e) => { clearTimeout(t); fail(new Error(e.message || 'the DWG worker failed to load')); }, { once: true });
      });
      w.addEventListener('message', (e) => {
        const p = pending.get(e.data?.id);
        if (!p) return;
        pending.delete(e.data.id);
        if (e.data.error) { const err = new Error(e.data.error.message); err.name = e.data.error.name; p.reject(err); }
        else { state = 'worker'; p.resolve(e.data.model); }
      });
      // a worker that dies (out of memory) hands its reads back to this thread
      w.addEventListener('error', () => {
        worker = Promise.resolve(null);
        for (const [id, p] of pending) { pending.delete(id); onThisThread(p.data, p.readOpts).then(p.resolve, p.reject); }
      });
      return w;
    } catch (err) {
      if (typeof console !== 'undefined') console.warn('cc-dwg: reading on the page instead of in a worker:', err?.message || err);
      return null;
    }
  })();
  return worker;
}

/** The ccdwg.* strings of the page's language catalog ({locale, strings}), or null (no catalog: the worker speaks English). */
function workerStrings() {
  const c = typeof globalThis.ccI18n?.catalog === 'function' ? globalThis.ccI18n.catalog() : null;
  if (!c || !c.strings) return null;
  const strings = {};
  for (const k of Object.keys(c.strings)) if (k.startsWith('ccdwg.')) strings[k] = c.strings[k];
  return Object.keys(strings).length ? { locale: c.locale, strings } : null;
}

/** This library's modules as blob: URLs, relative imports ('./x.js', single quotes) rewritten: Map file → blob URL. */
async function blobModules(files) {
  const urls = new Map(), texts = new Map();
  const visit = async (file, stack) => {
    if (urls.has(file)) return urls.get(file);
    if (stack.includes(file)) throw new Error('import cycle at ' + file);
    if (!texts.has(file)) {
      const res = await fetch(import.meta.resolve('./' + file));
      if (!res.ok) throw new Error('could not load ' + file + ' (' + res.status + ')');
      texts.set(file, await res.text());
    }
    let src = texts.get(file);
    const deps = [...new Set([...src.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*)'\.\/([\w.-]+\.js)'/g)].map((m) => m[1]))];
    for (const d of deps) src = src.split(`'./${d}'`).join(`'${await visit(d, [...stack, file])}'`);
    const u = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
    urls.set(file, u);
    return u;
  };
  for (const f of files) await visit(f, []);
  return urls;
}
