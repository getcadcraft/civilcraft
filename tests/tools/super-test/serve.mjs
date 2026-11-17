// SPDX-License-Identifier: Apache-2.0
// Super 0.1 test harness: the lab page rendered without a sign-in (render.php), served with the real /assets, plus the two things the page
// asks the server for (an app's payload, an app's own page for a frame), and a headless Chromium. Shared by browser.mjs and mounts.mjs.
import { chromium } from '../../node_modules/playwright-core/index.mjs';
import { execFileSync } from 'node:child_process'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const OUT = path.join(ROOT, 'tmp/super-test'); fs.mkdirSync(OUT, { recursive: true });

export async function start({ langs = ['', 'es-MX', 'id'] } = {}) {
  for (const l of langs) execFileSync('php', [path.join(ROOT, 'tools/super-test/render.php'), path.join(OUT, `lab${l ? '-' + l : ''}.html`), l], { stdio: 'inherit' });
  for (const f of fs.readdirSync(OUT)) if (/^render-(payload|app)-/.test(f)) fs.rmSync(path.join(OUT, f));   // a payload cached by an earlier run goes stale when an app's markup changes
  const missing = [];
const TYPES = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.wasm': 'application/wasm' };
  const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const q = new URL(req.url, 'http://x').searchParams;
  // what the page asks the server for besides itself: an app's payload (lab/supercadcraft-app.php) and an app's own page for a frame (?embed=1)
  const gen = (script, slug, ext, ctype) => {
    const l = q.get('lang') || '', f = path.join(OUT, `${script}-${slug}${l ? '-' + l : ''}.${ext}`);
    if (!fs.existsSync(f)) execFileSync('php', [path.join(ROOT, `tools/super-test/${script}.php`), slug, f, l], { stdio: 'ignore' });
    res.writeHead(200, { 'Content-Type': ctype, 'Cache-Control': 'no-store' }); return fs.createReadStream(f).pipe(res);
  };
  // SuperCad asks the site for its own account key (super-account.js): the harness is a signed-out site, which answers 200 {signedIn:false} like the real endpoint
  if (p === '/api/account/super-connect') { res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); return res.end(JSON.stringify({ status: 'success', data: { signedIn: false } })); }
  if (p === '/lab/supercadcraft-app' && /^[a-z0-9-]+$/.test(q.get('app') || '')) return gen('render-payload', q.get('app'), 'json', 'application/json');
  if (/^\/lab\/[a-z0-9]+$/.test(p) && p !== '/lab/supercadcraft' && q.get('embed') === '1') return gen('render-app', p.slice(5), 'html', 'text/html');
  if (p === '/lab/supercadcraft') { const l = new URL(req.url, 'http://x').searchParams.get('lang'); res.writeHead(200, { 'Content-Type': 'text/html' }); return fs.createReadStream(path.join(OUT, l ? `lab-${l}.html` : 'lab.html')).pipe(res); }
  const f = path.join(ROOT, 'public_html', p);
  if (!p.startsWith('/assets/') || !f.startsWith(path.join(ROOT, 'public_html')) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { missing.push(p); res.writeHead(404); return res.end('no'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(res);
}).listen(0, '127.0.0.1');
await new Promise(r => server.on('listening', r));
  return { url: `http://127.0.0.1:${server.address().port}/lab/supercadcraft`, missing, close: () => server.close() };
}


export async function launch(viewport = { width: 1440, height: 900 }) {
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cache).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map(s => path.join(cache, build, s)).find(p => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  // Home (the intro screen) covers the window; the older suites drive the window itself, so every context starts with Home off unless a test chose (home.mjs sets 'on').
  // Save writes two files by default (.supercad + .ccproject, 2026-11-12). The older suites count ONE download and read the zip, so they start with the old form only;
  // formats.mjs sets SUPER_TEST_FORMATS=1 to get the real default (both).
  const oneFile = !process.env.SUPER_TEST_FORMATS;
  const noHome = (zipOnly) => { try { if (!localStorage.getItem('cc-super-home')) localStorage.setItem('cc-super-home', 'off'); localStorage.setItem('cc-fit', 'never'); if (zipOnly && !localStorage.getItem('cc-super-file-format')) localStorage.setItem('cc-super-file-format', 'ccproject'); } catch { /* no storage */ } };
  const newContext = browser.newContext.bind(browser), newPage = browser.newPage.bind(browser);
  browser.newContext = async (...a) => { const c = await newContext(...a); await c.addInitScript(noHome, oneFile); return c; };
  browser.newPage = async (...a) => { const p = await newPage(...a); await p.context().addInitScript(noHome, oneFile); return p; };
  return browser;
}

