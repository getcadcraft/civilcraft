#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * browser-ask-ownkey.mjs: the Ask box and a model the person brings, in the real /lab pages (owner 2026-11-20: AI belongs to the Studios
 * and is passed down to the apps; the "Your own AI key" add-on is the same engine for one app without Studio). Headless Chromium, run
 * as root, one browser.
 *
 *   node tools/shell-test/browser-ask-ownkey.mjs [--apps cadcraft,bimcraft] [--shots <dir>]
 *
 * What is real: the app page, the shell's Ask box, Studio's own engine file and the engine it runs (studio/hub/ask-engine.js + the
 * tested tools/mcp/byok.mjs, served to the page as Studio's pack serves them), the app's add-on loader and its package store, the
 * add-on's own files (read from addons/own-ai-key/), its set-up dialog, the limits.
 * What is stood in, and why:
 *   Studio            window.cadcraftStudio is a page script (post / on / hub), because the test runs in a browser, and Studio's
 *                     passDown() is called by a page script as Studio's window.js calls it. Its "hub" hands each 'ask.call' to this
 *                     Node process (as Studio's hub hands it to the native side), which makes the HTTP request.
 *   the provider      a local HTTP server on 127.0.0.1 in this process, speaking the OpenAI-compatible format, and for the one check
 *                     with a key a route in the browser that answers for the provider's address. No real provider is called and no
 *                     real key exists anywhere in the test.
 *   the Library       the add-on is put in the loader's store through the loader's own install check, which is what the account
 *                     client does after fetching and checking it. Nothing is written to an account's list.
 *   the signature     the package is not signed here (signing is the Library's step), so the page runs with the loader's developer
 *                     mode on (localStorage cc-addons-dev = 1), which is what lets an unsigned package load.
 *
 * Checks, per app:
 *   A browser tab, no Studio, no add-on: no note, no engine.
 *   INSIDE STUDIO, nothing added: Studio's engine is on the page. With no model set up the box says where to set one up (Studio › Your own
 *     AI model) and offers no add-on; a question gets no model answer and nothing is posted to the hub. With a model set up the box says
 *     "Answered here with Your own model" and a question is answered through the hub after one tool step; the limits count the calls;
 *     no key is in anything; every request of the page went to this site.
 *   INSIDE STUDIO with the add-on also added: the add-on registers nothing; Studio's engine is the only one.
 *   ONE APP IN A BROWSER with the add-on: the box says the add-on is added and offers its set-up; the set-up dialog saves a provider,
 *     a model and an address on this computer; the page itself then calls the stand-in provider and a question is answered. With a
 *     (made-up) key and a hosted provider's address, the call carries the key and the browser header and goes nowhere but the route.
 *     Switched off in Add-ons the engine is gone at once.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { openLab, REPO } from './lab-page.mjs';
import { CHECKS } from '../ai-scan/no-ai-scan.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const APPS = arg('--apps', 'cadcraft,bimcraft').split(',').filter(Boolean);
const SHOTS = arg('--shots', null);
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? '  [' + d + ']' : '')); } };
const VENDOR = CHECKS.find((c) => c.id === 'vendor-host').re;
const SETTINGS_KEY = 'cadcraft.studio.byok.settings', LEDGER_KEY = 'cadcraft.studio.byok.ledger';

// ---------------------------------------------------------------------------------------------- the stand-in provider (this computer only)
const provider = { requests: [] };
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-private-network': 'true' };
const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); res.end(); return; }   // a browser page asks first
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    let j = null; try { j = JSON.parse(body); } catch { j = null; }
    provider.requests.push({ method: req.method, url: req.url, auth: req.headers.authorization || req.headers['x-api-key'] || '', body: j });
    const msgs = (j && j.messages) || [], tools = (j && j.tools) || [];
    const hadTool = msgs.some((m) => m.role === 'tool');
    const pick = tools.map((t) => t.function && t.function.name).find((n) => /(_list|_describe|_summary|_info)$/.test(n || ''));
    const reply = !hadTool && pick
      ? { choices: [{ message: { content: null, tool_calls: [{ id: 'call_1', type: 'function', function: { name: pick, arguments: '{}' } }] }, finish_reason: 'tool_calls' }], usage: { prompt_tokens: 40, completion_tokens: 8 } }
      : { choices: [{ message: { content: 'Stand-in answer: I looked at the file with your tools.' }, finish_reason: 'stop' }], usage: { prompt_tokens: 60, completion_tokens: 12 } };
    res.writeHead(200, { 'content-type': 'application/json', ...CORS }); res.end(JSON.stringify(reply));
  });
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = 'http://127.0.0.1:' + server.address().port + '/v1';

/** What Studio's hub and native side do with one 'ask.call': only this computer is reached here, and no key is added (there is none). */
async function hubCall(call) {
  const base = String(call.baseUrl || '');
  if (!/^http:\/\/127\.0\.0\.1:\d+\/v1$/.test(base)) return { status: 0, error: 'no_address' };   // a hosted provider would be reached here in Studio; never in this test
  try {
    const r = await fetch(base + call.request.path, { method: 'POST', headers: call.request.headers, body: JSON.stringify(call.request.body) });
    return { status: r.status, json: await r.json() };
  } catch { return { status: 0, error: 'unreachable' }; }
}

// ---------------------------------------------------------------------------------------------- the add-on as a package
const ADDON_DIR = path.join(REPO, 'addons/own-ai-key');
const pkgFiles = {};
(function read(dir, rel) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { if (e.name.startsWith('.')) continue; const p = path.join(dir, e.name), r = rel ? rel + '/' + e.name : e.name; if (e.isDirectory()) read(p, r); else pkgFiles[r] = fs.readFileSync(p, 'utf8'); } })(ADDON_DIR, '');
const manifest = JSON.parse(pkgFiles['addon.json']);

/** Page script: Studio's window channel, with the hub answered by this Node process. */
const studioStub = () => {
  const handlers = new Map();
  window.__studio = { posts: [] };
  window.cadcraftStudio = {
    hub: () => 'studio-hub',
    on(type, fn) { if (!handlers.has(type)) handlers.set(type, new Set()); handlers.get(type).add(fn); return () => handlers.get(type).delete(fn); },
    post(type, data) {
      window.__studio.posts.push({ type, data: JSON.parse(JSON.stringify(data)) });
      if (type !== 'ask.call') return;
      window.__hubCall(data.call).then((out) => { for (const fn of handlers.get('ask.result') || []) fn({ id: data.id, ...out }); });
    },
  };
};

/** Page script: what Studio's window.js does once the channel is up: hand Studio's engine to this page. The two files are Studio's own, served as its pack serves them. */
const passDownStub = () => { import('/__studio/hub/ask-engine.js').then((m) => { window.__passedDown = true; m.passDown({ g: window, studio: window.cadcraftStudio, name: 'Your own model' }); }, (e) => { window.__passedDown = String(e); }); };
const STUDIO = process.env.CADCRAFT_STUDIO || '/var/www/CADCRAFT/studio';
const studioFiles = { '/__studio/hub/ask-engine.js': path.join(STUDIO, 'hub/ask-engine.js'), '/__studio/hub/byok.mjs': path.join(REPO, 'tools/mcp/byok.mjs') };

const askState = (page) => page.evaluate(() => {
  const s = window.ccAsk.state();
  const panel = document.querySelector('[data-k="ownkey"]');
  return { attached: s.attached, routes: s.routes, note: panel ? panel.textContent : null, noteState: panel ? panel.getAttribute('data-state') : null,
    studioBtn: !!document.querySelector('[data-k="ownkey-studio"]'), setupBtn: !!document.querySelector('[data-k="ownkey-setup"]'), addBtn: !!document.querySelector('[data-k="ownkey-add"]'),
    noroute: document.querySelector('[data-k="noroute"]')?.textContent || '', engines: (window.ccAskEngines || []).map((p) => p.id) };
});
const installAddon = (page, slug) => page.evaluate(async ([manifest, files, app]) => {
  const build = JSON.parse(document.getElementById('cc-addons-account').textContent).build;
  const mod = await import(new URL('addons.js', new URL(build, location.href)).href);
  const loader = new mod.AddonLoader({ app, apiVersion: '1.4', appName: app, packages: mod.packageStore(), fetchJson: async () => null });
  return loader.installPackage({ manifest, files, signature: null, source: 'test:own-ai-key' });
}, [manifest, pkgFiles, slug]);
/** Back to the model on this computer, so the add-on has an engine again before it is switched off. */
const setFieldBack = async (page) => { await page.evaluate(() => (window.ccAskEngines || []).find((p) => p.id === 'own-ai-key').setup()); await page.waitForSelector('dialog[data-ownkey-setup][open]', { timeout: 10000 }); await setField(page, '[data-ownkey-provider]', 'compatible'); await page.click('[data-ownkey-close]'); await page.waitForTimeout(300); };
const setField = (page, sel, value) => page.evaluate(([sel, value]) => { const e = document.querySelector('dialog[data-ownkey-setup] ' + sel); e.value = value; e.dispatchEvent(new Event('change', { bubbles: true })); }, [sel, value]);
/** Open the Ask panel once the app attached the box. An app that attaches only with a document open (BimCraft) gets its document hook again if a slow first load swallowed it. */
const openAsk = async (page, slug) => {
  for (let i = 0; i < 4; i++) {
    if (await page.waitForFunction(() => window.ccAsk && window.ccAsk.state().attached, null, { timeout: 15000 }).then(() => true, () => false)) break;
    await reopen(page, slug);
  }
  await page.evaluate(() => window.ccAsk.open()); await page.waitForTimeout(300);
};
const ask = (page, text) => page.evaluate(async (t) => { const q = await window.ccAsk.ask(t); return { state: q.state, answer: q.answer, error: q.error, steps: q.steps.map((s) => ({ kind: s.kind, tool: s.tool, ok: s.ok })) }; }, text);

const lab = await openLab('bkaiaddon');
/** After a reload an app may need its document again before it attaches the Ask box (BimCraft attaches once a building is open). */
const reopen = async (page, slug) => { const hooks = await import(pathToFileURL(path.join(REPO, 'tools/workspace-test/apps', slug + '.mjs')).href).catch(() => ({})); if (hooks.prepare) await hooks.prepare(page); await page.waitForTimeout(600); };
try {
  for (const slug of APPS) {
    console.log('== ' + slug + ': a browser tab, no Studio, no add-on');
    provider.requests.length = 0;
    const { ctx, page, errors } = await lab.page(slug, { viewport: { width: 1600, height: 1000 }, storage: { ['cadcraft.assistants.' + slug]: JSON.stringify({ enabled: true, groups: ['read'] }), ...(slug === 'bimcraft' ? { 'bimcraft.settings': JSON.stringify({ assistants: { enabled: true, groups: ['read'] } }) } : {}), 'cc-addons-dev': '1' } });   // Settings › Assistants: on, Read only
    const hosts = new Map();
    page.on('request', (r) => { try { const u = new URL(r.url()); if (/^https?:$/.test(u.protocol)) hosts.set(u.host, (hosts.get(u.host) || 0) + 1); } catch { /* data: */ } });
    await ctx.exposeFunction('__hubCall', hubCall);
    await ctx.route('**/__studio/**', (route) => { const f = studioFiles[new URL(route.request().url()).pathname]; if (f) route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(f, 'utf8') }); else route.fulfill({ status: 404, body: '' }); });
    const hosted = [];   // the one check with a key: the provider's address is answered here, in the browser, and never reaches the network
    await ctx.route('https://api.anthropic.com/**', (route) => { const r = route.request(); hosted.push({ url: r.url(), method: r.method(), headers: r.headers() }); if (r.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
      return route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify({ content: [{ type: 'text', text: 'Stand-in hosted answer.' }], usage: { input_tokens: 9, output_tokens: 4 }, stop_reason: 'end_turn' }) }); });

    await openAsk(page, slug);
    let s = await askState(page);
    ok(s.attached && s.note === null && !s.routes[0].ready && s.engines.length === 0, 'a browser tab with no add-on: no note and no engine of the person\'s own', JSON.stringify(s).slice(0, 200));

    console.log('== ' + slug + ': ONE APP IN A BROWSER with the add-on');
    await page.waitForFunction(() => !!document.getElementById('cc-addons-account'), null, { timeout: 70000 }).catch(() => {});
    const inst = await installAddon(page, slug);
    ok(inst && inst.ok, 'the add-on is put in the loader\'s store through the loader\'s own install check', JSON.stringify(inst).slice(0, 160));
    await page.reload({ waitUntil: 'networkidle' });
    await reopen(page, slug);
    await page.waitForFunction(() => (window.ccAskEngines || []).some((p) => p.id === 'own-ai-key'), null, { timeout: 70000 }).catch(() => {});
    await openAsk(page, slug);
    s = await askState(page);
    const listed = await page.evaluate(() => { try { return (window.ccAddons.list() || []).filter((a) => a.id === 'own-ai-key').map((a) => ({ state: a.state, source: a.source, version: a.version, reason: a.reason })); } catch (e) { return [{ state: 'no list: ' + e.message }]; } });
    ok(listed.length === 1 && listed[0].state === 'active' && listed[0].source === 'installed', 'after opening the app again the add-on is active, as an added package (never bundled): ' + JSON.stringify(listed));
    ok(s.engines.join() === 'own-ai-key' && s.noteState === 'addon' && s.setupBtn && !s.routes[0].ready, 'added but not set up: the box says so and offers the add-on\'s own set-up: "' + (s.note || '').slice(0, 120) + '…"', JSON.stringify(s).slice(0, 200));
    await page.click('[data-k="ownkey-setup"]'); await page.waitForSelector('dialog[data-ownkey-setup][open]', { timeout: 10000 });
    const warn = await page.evaluate(() => document.querySelector('[data-ownkey-where]')?.textContent || '');
    ok(/not encrypted/.test(warn) && /never sent to CadCraft/.test(warn), 'the set-up says plainly where a key is kept in a browser: "' + warn.slice(0, 110) + '…"');
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, slug + '-addon-setup.png') });
    await setField(page, '[data-ownkey-provider]', 'compatible');
    await setField(page, '[data-ownkey-base]', BASE);
    await setField(page, '[data-ownkey-model]', 'local-test');
    const ready = await page.evaluate(() => ({ ready: document.querySelector('[data-ownkey-ready]')?.getAttribute('data-ownkey-ready'), local: !!document.querySelector('[data-ownkey-local]'), key: !!document.querySelector('[data-ownkey-key]') }));
    ok(ready.ready === 'yes' && ready.local && !ready.key, 'a model on this computer: the set-up says ready, asks for no key and counts no money');
    await page.click('[data-ownkey-close]'); await page.waitForTimeout(300);
    s = await askState(page);
    ok(s.note === null && s.routes[0].ready && s.routes[0].name === 'Your own model', 'set up: the note is gone and the box has the person\'s own model as its engine, with no reload ("' + s.routes[0].name + '")', JSON.stringify(s).slice(0, 200));
    const q1 = await ask(page, 'What is in this file?');
    ok(q1.state === 'answered' && /Stand-in answer/.test(q1.answer || ''), 'a question is answered by the stand-in provider, called by the page itself: "' + (q1.answer || q1.error || '') + '"');
    const toolSteps = q1.steps.filter((x) => x.kind === 'tool');
    const posted = provider.requests.filter((r) => r.method === 'POST');
    ok(toolSteps.length === 1 && toolSteps[0].ok && posted.length === 2, 'through one tool step of the app (' + (toolSteps[0] && toolSteps[0].tool) + '), in two calls to the stand-in provider', JSON.stringify(q1.steps).slice(0, 200) + ' requests ' + posted.length);
    ok(posted.every((r) => r.url === '/v1/chat/completions' && r.auth === '' && r.body && r.body.model === 'local-test'), 'each call: the compatible chat path, the model typed in the set-up, and no key (a model on this computer needs none)');
    const kept = await page.evaluate((app) => Object.keys(localStorage).filter((k) => k.startsWith('cc-addon:' + app + ':own-ai-key:')).map((k) => k.split(':').pop()).sort().join(), slug);
    ok(kept === 'ledger,settings' && !(await page.evaluate((k) => localStorage.getItem(k), SETTINGS_KEY)), 'the add-on keeps its settings and its record of calls in its own entries for this app; nothing of Studio\'s is written (' + kept + ')');

    // a hosted provider with a (made-up) key: answered by the route above, so nothing leaves this browser
    await page.evaluate(() => (window.ccAskEngines || []).find((p) => p.id === 'own-ai-key').setup());
    await page.waitForSelector('dialog[data-ownkey-setup][open]', { timeout: 10000 });
    await setField(page, '[data-ownkey-provider]', 'anthropic');
    await setField(page, '[data-ownkey-model]', 'stand-in-model');
    const FAKE = 'made-up-key-for-this-test-only';
    await page.fill('dialog[data-ownkey-setup] [data-ownkey-key]', FAKE); await page.click('dialog[data-ownkey-setup] [data-ownkey-save]'); await page.waitForSelector('[data-ownkey-state="stored"]', { timeout: 10000 });
    const shown = await page.evaluate((k) => document.querySelector('dialog[data-ownkey-setup]').outerHTML.includes(k) || document.querySelector('dialog[data-ownkey-setup] [data-ownkey-key]').value !== '', FAKE);
    ok(!shown, 'a saved key is not shown again');
    await page.click('[data-ownkey-close]'); await page.waitForTimeout(300);
    const q2 = await ask(page, 'And now?');
    const call = hosted.find((h) => h.method === 'POST');
    ok(q2.state === 'answered' && /Stand-in hosted answer/.test(q2.answer || '') && call && /\/v1\/messages$/.test(call.url) && call.headers['x-api-key'] === FAKE && call.headers['anthropic-dangerous-direct-browser-access'] === 'true', 'with a key and a hosted provider the page sends the key only to that provider\'s address, with the header a browser caller needs: "' + (q2.answer || q2.error || '') + '"');
    ok(!JSON.stringify(q2).includes(FAKE), 'the key is not in the answer or its steps');
    await page.evaluate(() => (window.ccAskEngines || []).find((p) => p.id === 'own-ai-key').setup()); await page.waitForSelector('dialog[data-ownkey-setup] [data-ownkey-remove]', { timeout: 10000 });
    await page.click('dialog[data-ownkey-setup] [data-ownkey-remove]'); await page.waitForSelector('[data-ownkey-state="none"]', { timeout: 10000 }); await page.click('[data-ownkey-close]'); await page.waitForTimeout(300);
    s = await askState(page);
    ok(!s.routes[0].ready && s.noteState === 'addon' && !(await page.evaluate((k) => JSON.stringify(Object.entries(localStorage)).includes(k), FAKE)), 'Remove the key: it is gone from the browser and the engine with it');
    const outside = [...hosts.keys()].filter((h) => h !== 'getcadcraft.com').sort().join();
    ok(outside === ['127.0.0.1:' + server.address().port, 'api.anthropic.com'].sort().join(), 'the page reached this site, the stand-in on this computer, and the routed provider address, nothing else (' + outside + ')');
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, slug + '-addon-ask.png') });

    // switched off: the engine goes at once
    await setFieldBack(page);
    const off = await page.evaluate(async () => { const l = window.ccAddons.loader; if (!l || typeof l.setEnabled !== 'function') return 'no loader'; await l.setEnabled('own-ai-key', false); return 'off'; });
    await page.waitForTimeout(300);
    s = await askState(page);
    ok(off === 'off' && s.engines.length === 0 && !s.routes[0].ready && s.note === null, 'switched off in Add-ons: the engine is gone at once', off + ' ' + JSON.stringify(s).slice(0, 160));
    await page.evaluate(async () => { await window.ccAddons.loader.setEnabled('own-ai-key', true); });
    await page.waitForTimeout(300);

    console.log('== ' + slug + ': INSIDE STUDIO with the add-on also added');
    hosts.clear(); provider.requests.length = 0;
    await ctx.addInitScript(studioStub);
    await ctx.addInitScript(passDownStub);
    await page.reload({ waitUntil: 'networkidle' });
    await reopen(page, slug);
    await page.waitForFunction(() => (window.ccAskEngines || []).some((p) => p.id === 'studio'), null, { timeout: 30000 }).catch(() => {});
    await page.waitForFunction(() => { try { return (window.ccAddons.list() || []).some((a) => a.id === 'own-ai-key' && a.state === 'active'); } catch (e) { return false; } }, null, { timeout: 70000 }).catch(() => {});
    await openAsk(page, slug);
    s = await askState(page);
    ok(s.engines.join() === 'studio', 'Studio handed its engine to the page, and the add-on, active there too, registers nothing (' + s.engines.join() + ')', String(await page.evaluate(() => window.__passedDown)));
    await page.evaluate(async () => { try { await window.ccAddons.uninstall('own-ai-key'); } catch (e) { /* removed below with the context */ } });

    console.log('== ' + slug + ': INSIDE STUDIO, nothing added');
    await page.reload({ waitUntil: 'networkidle' });
    await reopen(page, slug);
    await page.waitForFunction(() => (window.ccAskEngines || []).some((p) => p.id === 'studio'), null, { timeout: 30000 }).catch(() => {});
    await openAsk(page, slug);
    s = await askState(page);
    const listed0 = await page.evaluate(() => { try { return (window.ccAddons.list() || []).filter((a) => a.id === 'own-ai-key').length; } catch (e) { return -1; } });
    ok(s.engines.join() === 'studio' && listed0 === 0, 'the engine is on the page with no add-on at all: nothing was added by the person');
    ok(s.noteState === 'studio' && /Your own AI model/.test(s.note || '') && s.studioBtn && !s.addBtn && !/add-on/i.test(s.note || ''), 'no model set up yet: the box says where to set one up in Studio and offers no add-on: "' + (s.note || '').slice(0, 150) + '…"');
    ok(!s.routes[0].ready, 'and there is no engine ready until then');
    if (SHOTS) { await page.screenshot({ path: path.join(SHOTS, slug + '-ask-studio-setup.png') }); }
    const q0 = await ask(page, 'What is in this file?');
    ok(['no_route', 'waiting'].includes(q0.state) && !q0.answer, 'a question gets no model answer (' + q0.state + ': ' + (q0.error || 'it waits for a connected AI app') + ')');
    const posts0 = await page.evaluate(() => window.__studio.posts.filter((p) => p.type === 'ask.call').length);
    ok(posts0 === 0 && provider.requests.length === 0, 'nothing was posted to the hub and the stand-in provider got no request');

    // the person sets a model up in Studio (the hub card writes these settings; another window's write arrives as a storage event)
    const before = JSON.stringify({ provider: 'compatible', model: 'local-test', baseUrl: BASE, keyName: 'default', maxOutputTokens: 512, maxToolSteps: 4, caps: { dayAmount: 5, monthAmount: 50, dayTokens: 400000, callsPerHour: 9 }, currency: 'USD', prices: {} });
    await page.evaluate(([k, v]) => { localStorage.setItem(k, v); window.dispatchEvent(new StorageEvent('storage', { key: k, newValue: v })); }, [SETTINGS_KEY, before]);
    await page.waitForTimeout(300);
    s = await askState(page);
    ok(s.note === null && s.routes[0].ready && s.routes[0].name === 'Your own model', 'set up in Studio: the note is gone and the box has the person\'s own model as its engine, with no reload and no add-on ("' + s.routes[0].name + '")', JSON.stringify(s).slice(0, 200));
    const sum = await page.evaluate(() => [...document.querySelectorAll('body *:not(script):not(style)')].find((e) => e.children.length === 0 && (e.textContent || '').length < 120 && /Answered here with/.test(e.textContent || ''))?.textContent || '');
    ok(/Answered here with Your own model/.test(sum), 'the panel says: "' + sum + '"');
    const q3 = await ask(page, 'What is in this file?');
    ok(q3.state === 'answered' && /Stand-in answer/.test(q3.answer || ''), 'a question is answered through Studio\'s hub: "' + (q3.answer || q3.error || '') + '"');
    const steps3 = q3.steps.filter((x) => x.kind === 'tool');
    ok(steps3.length === 1 && steps3[0].ok && provider.requests.length === 2, 'through one tool step of the app (' + (steps3[0] && steps3[0].tool) + '), in two calls to the stand-in provider', JSON.stringify(q3.steps).slice(0, 200) + ' requests ' + provider.requests.length);
    ok(provider.requests.every((r) => r.method === 'POST' && r.url === '/v1/chat/completions' && r.auth === '' && r.body && r.body.model === 'local-test' && r.body.max_tokens === 512), 'each call: the compatible chat path, the stored model and output limit, and no key');
    const after = await page.evaluate(([k, l]) => ({ settings: localStorage.getItem(k), ledger: JSON.parse(localStorage.getItem(l) || '[]') }), [SETTINGS_KEY, LEDGER_KEY]);
    ok(after.settings === before && after.ledger.length === 2 && after.ledger.every((e) => e.cost === 0 && e.model === 'local-test'), 'the settings are byte for byte as Studio stored them, and the limits counted both calls in Studio\'s shared ledger');
    const posts = await page.evaluate(() => window.__studio.posts);
    ok(posts.filter((p) => p.type === 'ask.call').length === 2 && !/sk-|Bearer|authorization|x-api-key/i.test(JSON.stringify(posts)), 'the app window sent two calls to the hub, naming the key store entry and carrying no key or key header');
    const others = [...hosts.keys()].filter((h) => h !== 'getcadcraft.com');
    ok(others.length === 0, 'inside Studio every request of the page went to this site (' + [...hosts].map(([h, n]) => h + ' ' + n).join(', ') + '); the model calls were made by the stand-in hub in this process', others.join(', '));
    ok(errors.length === 0, 'no page error', errors.slice(0, 3).join(' | '));
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, slug + '-ask-studio-answer.png') });
    await ctx.close();
  }
} catch (e) { ok(false, 'stopped: ' + (e.stack || e.message || e)); } finally { await lab.close(); server.close(); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
