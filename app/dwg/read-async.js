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
 *   readDwgAsync(bytes, { onHead(model, lists), onSlice({ kind, block, items, total, have }) })
 *        page-side callbacks, called from the message handlers while the model arrives (worker reads of a big drawing only): onHead with the
 *        model whose block `entities` and `objects` are still empty, then onSlice for each slice just added (kind 'entities' with its
 *        block index, or 'objects'; `items` the new objects, `have` of `total` so far). An app builds its own records slice by slice
 *        and yields between them; the promise still resolves with the whole model.
 *
 * The worker is built from this library's own files: each is fetched by `import.meta.resolve` — so an app's import
 * map (version-busted URLs) and its saved offline copy apply, exactly as for the page's own imports — and its relative
 * imports are rewritten to blob: URLs (workers do not see the page's import map). One worker is kept and reused; reads
 * queue on it. The caller's bytes are copied, never transferred away. If a worker cannot start (no Worker, a blocked
 * blob: URL, a fetch that fails), the read runs on this thread instead, and later reads do too.
 * How the model comes back (PERF.9 / PERF.22): not as one structured clone, which the PAGE's thread has to rebuild (1.3 s of freeze for
 * a 150,000-face drawing, and two copies of every object at once), but as the model without its long lists (each block's
 * entities, the objects) followed by those lists packed into typed arrays (model-pack.js) and TRANSFERRED, a few thousand
 * entities at a time. The page rebuilds a slice per message, each a few milliseconds, so input and painting go on between
 * them, and the promise resolves with the same model readDwg gives. `{ pack: false }` asks for the old single clone. A list
 * the packer cannot take (anything but plain data) comes as an ordinary clone of that slice.
 * Errors come back as Error objects with the reader's message and `name` (DwgReadError, UnsupportedDwg).
 * Language: the worker has no page, so it gets the `ccdwg.*` strings of the page's catalog (globalThis.ccI18n, i18n.js) as a
 * small ccI18n of its own; messages.js finds it there exactly as on the page. No catalog → the reader's English.
 */

import { Unpacker } from './model-pack.js';

const ROOT = 'read.js', PACK = 'model-pack.js';
let worker = null;            // Promise<Worker | null>
let state = 'idle';
let seq = 0;
const pending = new Map();    // id → { resolve, reject }

export function dwgWorkerState() { return state; }

export async function readDwgAsync(bytes, opts = {}) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const { worker: useWorker = true, pack: usePack = true, onHead, onSlice, ...readOpts } = opts;
  const w = useWorker ? await startWorker() : null;
  if (!w) return onThisThread(data, readOpts);
  const copy = data.slice();
  return new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject, data, readOpts, onHead, onSlice });
    w.postMessage({ id, bytes: copy.buffer, opts: readOpts, pack: usePack }, [copy.buffer]);
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
      const urls = await blobModules([ROOT, PACK]);
      const body = `import { readDwg } from '${urls.get(ROOT)}';
import { Packer, chunkBuffers, PackError } from '${urls.get(PACK)}';
const L = ${JSON.stringify(workerStrings())};
if (L) {
  let pr; try { pr = new Intl.PluralRules(L.locale); } catch { pr = { select: () => 'other' }; }
  self.ccI18n = { has: (k) => Object.prototype.hasOwnProperty.call(L.strings, k), t(k, f = {}) {
    let v = L.strings[k];
    if (v && typeof v === 'object') v = v['=' + f.n] ?? v[pr.select(Number(f.n))] ?? v.other;
    return String(v ?? k).replace(/\\{\\{|\\}\\}|\\{([A-Za-z_][A-Za-z0-9_]*)\\}/g, (m, n) => m === '{{' ? '{' : m === '}}' ? '}' : f[n] != null ? String(f[n]) : m);
  } };
}
const SMALL = 3000, BUDGET = 100000, FALLBACK = 500;
// The model without its long lists first, then each list packed in slices that are transferred (model-pack.js).
function send(id, model) {
  const blocks = Array.isArray(model.blocks) ? model.blocks : [], objects = Array.isArray(model.objects) ? model.objects : [];
  const lists = [];   // { kind, block, items }
  blocks.forEach((b, i) => { if (b && Array.isArray(b.entities) && b.entities.length) lists.push({ kind: 'entities', block: i, items: b.entities }); });
  if (objects.length) lists.push({ kind: 'objects', items: objects });
  if (lists.reduce((n, l) => n + l.items.length, 0) < SMALL) { self.postMessage({ id, model }); return; }
  const head = { ...model };
  if (Array.isArray(model.blocks)) head.blocks = blocks.map((b) => (b && Array.isArray(b.entities) ? { ...b, entities: [] } : b));
  if (objects.length) head.objects = [];
  self.postMessage({ id, head, lists: lists.map((l) => ({ kind: l.kind, block: l.block, n: l.items.length })) });
  const packer = new Packer();
  lists.forEach((l, k) => {
    for (let i = 0; i < l.items.length;) {
      let c = null;
      try { c = packer.pack(l.items, i, l.items.length, BUDGET); } catch (err) { if (!(err instanceof PackError)) throw err; }
      if (c) { self.postMessage({ id, list: k, chunk: c }, chunkBuffers(c)); i += c.count; }
      else { const items = l.items.slice(i, i + FALLBACK); self.postMessage({ id, list: k, items }); i += items.length; }
    }
  });
  self.postMessage({ id, done: true });
}
self.onmessage = (e) => {
  const { id, bytes, opts, pack } = e.data;
  let model;
  try { model = readDwg(new Uint8Array(bytes), opts || {}); }
  catch (err) { self.postMessage({ id, error: { name: err && err.name || 'Error', message: String(err && err.message || err) } }); return; }
  try { if (pack === false) self.postMessage({ id, model }); else send(id, model); }
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
        const d = e.data, p = pending.get(d?.id);
        if (!p) return;
        if (d.error) { pending.delete(d.id); const err = new Error(d.error.message); err.name = d.error.name; p.reject(err); }
        else if (d.head) {   // the model without its long lists; they follow
          p.model = d.head; p.unpacker = new Unpacker(); p.lists = d.lists;
          p.targets = d.lists.map((l) => (l.kind === 'objects' ? (d.head.objects = d.head.objects || []) : d.head.blocks[l.block].entities));
          if (p.onHead) try { p.onHead(d.head, d.lists); } catch (err) { console.warn('cc-dwg: onHead failed:', err); }
        }
        else if (d.chunk || d.items) {
          const items = d.chunk ? p.unpacker.unpack(d.chunk) : d.items, t = p.targets[d.list];
          for (let i = 0; i < items.length; i++) t.push(items[i]);
          const l = p.lists[d.list];
          if (p.onSlice) try { p.onSlice({ kind: l.kind, block: l.block, items, total: l.n, have: t.length }); } catch (err) { console.warn('cc-dwg: onSlice failed:', err); }
        }
        else { pending.delete(d.id); state = 'worker'; p.resolve(d.done ? p.model : d.model); }
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
