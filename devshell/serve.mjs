#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * serve.mjs — run this app from a clone, without getcadcraft.com (docs/DEVSHELL.md). Node 20.19+, no packages.
 *
 *   node devshell/serve.mjs [--port 8000] [--host 127.0.0.1] [--offline]
 *   → open http://127.0.0.1:8000/   (?lang=es-MX or ?lang=en-XA for the pseudo-locale; ?space=model for dark)
 *
 * The page: `php devshell/render.php` on every load when PHP is installed (edits to ui.inc show at once), else the
 * pre-rendered devshell/index.html. URLs mirror the site so the build runs unchanged:
 *   /assets/apps/<slug>/dev/…        app/
 *   /assets/vendor/<lib>/<ver>/…     devshell/vendor/<lib>/<ver>/ — fetched once from getcadcraft.com by the exact
 *                                    version app.json pins (npm run fetch-vendor does them all up front);
 *                                    --offline never fetches
 *   other /assets/…, /favicon.svg    devshell/site/ (the shared shell files, copied at pack time)
 * Nothing is cached by the browser (Cache-Control: no-store), so a reload always shows your edits.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const APP_DIR = path.join(ROOT, 'app');
const SITE = path.join(HERE, 'site');
const VENDOR = path.join(HERE, 'vendor');
const META = JSON.parse(fs.readFileSync(path.join(HERE, 'app.json'), 'utf8'));
const SLUG = META.app.slug;
const ORIGIN = META.origin || 'https://getcadcraft.com';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8', '.map': 'application/json',
  '.bcmap': 'application/octet-stream', '.pfb': 'application/octet-stream', '.icc': 'application/vnd.iccprofile',
  '.data': 'application/octet-stream', '.craft': 'text/plain; charset=utf-8',
};

export function parseArgs(argv) {
  const o = { port: 8000, host: '127.0.0.1', offline: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--port') o.port = Number(argv[++i]);
    else if (argv[i] === '--host') o.host = argv[++i];
    else if (argv[i] === '--offline') o.offline = true;
  }
  return o;
}

/** A path under base, or null when it would leave it. */
function inside(base, rel) {
  const p = path.resolve(base, '.' + path.posix.normalize('/' + rel));
  return p === base || p.startsWith(base + path.sep) ? p : null;
}

/** The local file for a URL path (may not exist yet for vendor files). {file, vendor?: {lib, ver, rest}} | null */
export function mapUrl(pathname) {
  let m;
  if ((m = pathname.match(/^\/assets\/apps\/([a-z0-9-]+)\/dev\/(.*)$/))) {
    return m[1] === SLUG ? { file: inside(APP_DIR, m[2]) } : null;
  }
  if ((m = pathname.match(/^\/assets\/vendor\/([a-z0-9._-]+)\/([a-z0-9._-]+)\/(.*)$/)) && !['bootstrap-icons'].includes(m[1])) {
    const ver = m[2] === 'current' ? (META.vendor?.[m[1]] || null) : m[2];
    if (!ver) return null;
    return { file: inside(path.join(VENDOR, m[1], ver), m[3]), vendor: { lib: m[1], ver, rest: m[3] } };
  }
  if (pathname.startsWith('/assets/') || /^\/favicon[\w.-]*\.(svg|ico|png)$/.test(pathname)) return { file: inside(SITE, pathname.slice(1)) };
  return null;
}

async function fetchVendor(v, file) {
  const url = `${ORIGIN}/assets/vendor/${v.lib}/${v.ver}/${v.rest}`;
  const r = await fetch(url);
  if (!r.ok) return false;
  const buf = Buffer.from(await r.arrayBuffer());
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file + '.part', buf);
  fs.renameSync(file + '.part', file);
  return true;
}

function renderPage(query) {
  return new Promise((resolve) => {
    const env = { ...process.env };
    const lang = query.get('lang');
    if (lang && /^[a-z]{2,3}(-[A-Za-z0-9]{2,4})?$/.test(lang)) env.CC_LANG = lang;
    execFile('php', [path.join(HERE, 'render.php')], { env, maxBuffer: 64 << 20 }, (err, stdout, stderr) => {
      if (err && err.code === 'ENOENT') return resolve(null);                // no PHP: use the pre-rendered page
      if (err) return resolve({ error: (stderr || err.message).toString() });
      resolve({ html: stdout });
    });
  });
}

export function start(opts = {}) {
  const o = { ...parseArgs([]), ...opts };
  const isolate = (() => {
    try { return JSON.parse(fs.readFileSync(path.join(APP_DIR, 'manifest.json'), 'utf8')).isolate || ''; } catch { return ''; }
  })();
  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, 'http://x');
    const head = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
    if (['require-corp', 'credentialless'].includes(isolate)) {
      head['Cross-Origin-Opener-Policy'] = 'same-origin';
      head['Cross-Origin-Embedder-Policy'] = isolate;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, head); return res.end(); }
    if (u.pathname === '/' || u.pathname === '/index.html' || u.pathname === `/lab/${SLUG}`) {
      const r = await renderPage(u.searchParams);
      if (r && r.error) {
        res.writeHead(500, { ...head, 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('render.php failed:\n' + r.error);
      }
      const html = r ? r.html : fs.readFileSync(path.join(HERE, 'index.html'), 'utf8');
      res.writeHead(200, { ...head, 'Content-Type': MIME['.html'] });
      return res.end(req.method === 'HEAD' ? undefined : html);
    }
    const hit = mapUrl(decodeURIComponent(u.pathname));
    if (!hit || !hit.file) { res.writeHead(404, head); return res.end('Not in the dev shell: ' + u.pathname); }
    let file = hit.file;
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) { res.writeHead(404, head); return res.end(); }
    if (!fs.existsSync(file) && hit.vendor && !o.offline) {
      try { await fetchVendor(hit.vendor, file); } catch (e) { console.error('vendor fetch failed:', e.message); }
    }
    if (!fs.existsSync(file)) { res.writeHead(404, head); return res.end('Not found: ' + u.pathname); }
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { ...head, 'Content-Type': type, 'Content-Length': fs.statSync(file).size });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(o.port, o.host, () => resolve(server)));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const o = parseArgs(process.argv.slice(2));
  await start(o);
  console.log(`${META.app.name} dev shell: http://${o.host}:${o.port}/  (Ctrl+C to stop)`);
}
