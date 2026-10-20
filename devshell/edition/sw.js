/* SPDX-License-Identifier: Apache-2.0 */
/*
 * sw.js — "Save for offline" for one app's browser edition (0.4 part 2, D.4). It lives in the edition's folder, so its
 * scope is that folder and nothing else on the server: it never sees another app or another site's pages.
 *
 * Same messages as getcadcraft.com's /sw.js (assets/js/app-offline.js sends them): {type:'status'|'save'|'remove', key}.
 * Nothing is cached until someone clicks "Save for offline"; a save fills a new cache "cc-edition:<scope>@<time>" and,
 * once every file is in, deletes the older one, so a failed save keeps the last good copy. URLs in a save may be
 * relative (the edition does not know which folder it was put in); they are resolved against this worker's scope.
 * Requests: the page (the folder or its index.html) network first, the saved copy offline; files under the scope a
 * saved copy first when the folder name holds a version (assets/vendor/<lib>/<x.y.z>/, assets/apps/<slug>/<x.y>/),
 * else network first. Anything outside the scope, or not a GET, is never touched.
 */
'use strict';

const SCOPE = new URL(self.registration.scope);
const PREFIX = 'cc-edition:' + SCOPE.pathname + '@';
const IMMUTABLE = /^assets\/(vendor\/[a-z0-9._-]+\/\d[^/]*\/|apps\/[a-z0-9-]+\/\d[^/]*\/)/;
const META = new URL('__offline-meta', SCOPE).href;

const inScope = (url) => url.origin === SCOPE.origin && url.pathname.startsWith(SCOPE.pathname);
const rel = (url) => url.pathname.slice(SCOPE.pathname.length);
const isPage = (url) => inScope(url) && (rel(url) === '' || rel(url) === 'index.html');
const ours = async () => (await caches.keys()).filter((k) => k.startsWith(PREFIX));

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

async function saved(req, loose = true) {
  for (const k of await ours()) {
    const c = await caches.open(k);
    const hit = await c.match(req) || (loose ? await c.match(req, { ignoreSearch: true }) : null);
    if (hit) return { hit, cache: c };
  }
  return null;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!inScope(url)) return;
  if (req.mode === 'navigate' && isPage(url)) {
    e.respondWith((async () => {
      const page = new URL('./', SCOPE).href;
      const copy = await saved(new Request(page));
      try {
        const res = await fetch(req);
        if (copy && res.ok && !res.redirected) copy.cache.put(page, res.clone());
        return res;
      } catch (err) {
        if (copy) return copy.hit;
        throw err;
      }
    })());
    return;
  }
  e.respondWith((async () => {
    if (IMMUTABLE.test(rel(url))) {
      const exact = await saved(req, false);
      if (exact) return exact.hit;
    }
    try {
      return await fetch(req);
    } catch (err) {
      const near = await saved(req);
      if (near) return near.hit;
      throw err;
    }
  })());
});

self.addEventListener('message', (e) => {
  const msg = e.data || {};
  const port = e.ports && e.ports[0];
  const reply = (m) => { try { port ? port.postMessage(m) : e.source.postMessage(m); } catch (_) {} };
  const key = typeof msg.key === 'string' && /^[a-z0-9-]+\/[a-z0-9.-]+$/.test(msg.key) ? msg.key : null;
  if (!key) return;

  if (msg.type === 'status') {
    e.waitUntil((async () => {
      let when = null;
      for (const k of await ours()) {
        const meta = await (await caches.open(k)).match(META);
        if (meta) when = (await meta.json()).saved || when;
      }
      reply({ type: 'status', key, saved: when !== null, when });
    })());
  }

  if (msg.type === 'remove') {
    e.waitUntil((async () => {
      for (const k of await ours()) await caches.delete(k);
      reply({ type: 'removed', key });
    })());
  }

  if (msg.type === 'save' && Array.isArray(msg.urls) && typeof msg.page === 'string') {
    e.waitUntil((async () => {
      const urls = [...new Set([msg.page, ...msg.urls].filter((u) => typeof u === 'string').map((u) => {
        try { const x = new URL(u, SCOPE); return inScope(x) ? x.href : null; } catch { return null; }
      }).filter(Boolean))];
      const older = await ours();
      const name = PREFIX + Date.now();
      const tmp = await caches.open(name);
      let done = 0;
      const failed = [];
      const queue = urls.slice();
      const worker = async () => {
        while (queue.length) {
          const u = queue.shift();
          try {
            const res = await fetch(u, { cache: 'no-cache', credentials: 'same-origin' });
            if (!res.ok || res.redirected) throw new Error(String(res.status));
            await tmp.put(u, res);
          } catch (err) {
            failed.push(rel(new URL(u)));
          }
          done++;
          if (done % 5 === 0 || done === urls.length) reply({ type: 'progress', key, done, total: urls.length });
        }
      };
      await Promise.all([worker(), worker(), worker(), worker()]);
      if (failed.length) {
        await caches.delete(name);
        reply({ type: 'failed', key, failed: failed.slice(0, 5), count: failed.length });
        return;
      }
      await tmp.put(META, new Response(JSON.stringify({ saved: new Date().toISOString(), files: urls.length }), { headers: { 'Content-Type': 'application/json' } }));
      for (const k of older) await caches.delete(k);
      reply({ type: 'saved', key, files: urls.length });
    })());
  }
});
