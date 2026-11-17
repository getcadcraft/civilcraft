#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * browser-ask-ownkey.mjs: the Ask box and the "Your own AI key" add-on in the real /lab pages (0.10, owner 2026-11-11: "no AI in the apps"
 * with no exception; session bk-aiaddon-10). Headless Chromium, run as root, one browser.
 *
 *   node tools/shell-test/browser-ask-ownkey.mjs [--apps cadcraft,bimcraft] [--shots <dir>]
 *
 * What is real: the app page, the shell's Ask box, the app's add-on loader and its package store, the add-on's own files (read from
 * addons/own-ai-key/ and put in the store in the package shape the account client writes), the engine and its limits.
 * What is stood in, and why:
 *   Studio            window.cadcraftStudio is a page script (post / on / hub), because the test runs in a browser. Its "hub" hands each
 *                     'ask.call' to this Node process (as Studio's hub hands it to the native side), which makes the HTTP request.
 *   the provider      a local HTTP server on 127.0.0.1 in this process, speaking the OpenAI-compatible format. No real provider is called
 *                     and no key exists anywhere in the test (a model on this computer needs none).
 *   the Library       "Add it" is clicked for real, but the account's add-on client is replaced by a stand-in whose add + ensure put the
 *                     package in the loader's store, which is what the real one does after fetching and checking it. The real Library has
 *                     no listing for the add-on until the lead publishes it, and this test must not write to the account's list.
 *   the signature     the package is not signed here (signing is the Library's step), so the page runs with the loader's developer
 *                     mode on (localStorage cc-addons-dev = 1), which is what lets an unsigned package load.
 *
 * Checks, per app:
 *   WITHOUT the add-on, inside Studio: the box says what is needed and names the add-on, with an "Add it" button; a question gets no
 *     model answer; nothing is posted to the hub; the stand-in provider gets no request; no request of the page goes to a model provider.
 *     With settings stored before 0.10 the note says they are kept. With no account client the offer shows the Library page.
 *   "Add it": the stand-in client is asked to add and fetch own-ai-key; the box says it starts the next time the app is opened.
 *   WITH the add-on (after a reload): the add-on is active, the note is gone, the box says "Answered here with Your own model", a question
 *     is answered by the stand-in provider after one tool step, the limits count the calls, the settings stored before are unchanged,
 *     no key is in anything, and every request of the page went to this site.
 *   Switched off in the loader: the engine is gone at once and the note is back.
 *   Outside Studio (no window.cadcraftStudio): no note, no engine, with or without the add-on.
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
const server = http.createServer((req, res) => {
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
    res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(reply));
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

const askState = (page) => page.evaluate(() => {
  const s = window.ccAsk.state();
  const panel = document.querySelector('[data-k="ownkey"]');
  return { attached: s.attached, routes: s.routes, note: panel ? panel.textContent : null, addBtn: !!document.querySelector('[data-k="ownkey-add"]'), added: !!document.querySelector('[data-k="ownkey-added"]'),
    why: document.querySelector('[data-k="ownkey-why"]')?.textContent || '', page: document.querySelector('[data-k="ownkey-page"]')?.href || '',
    noroute: document.querySelector('[data-k="noroute"]')?.textContent || '', engines: (window.ccAskEngines || []).map((p) => p.id) };
});
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
    console.log('== ' + slug + ': the Ask box WITHOUT the add-on, inside Studio');
    provider.requests.length = 0;
    const { ctx, page, errors } = await lab.page(slug, { viewport: { width: 1600, height: 1000 }, storage: { ['cadcraft.assistants.' + slug]: JSON.stringify({ enabled: true, groups: ['read'] }), ...(slug === 'bimcraft' ? { 'bimcraft.settings': JSON.stringify({ assistants: { enabled: true, groups: ['read'] } }) } : {}), 'cc-addons-dev': '1' } });   // Settings › Assistants: on, Read only
    const hosts = new Map();
    page.on('request', (r) => { try { const u = new URL(r.url()); if (/^https?:$/.test(u.protocol)) hosts.set(u.host, (hosts.get(u.host) || 0) + 1); if (VENDOR.test(r.url())) hosts.set('PROVIDER ' + u.host, 1); } catch { /* data: */ } });
    await ctx.exposeFunction('__hubCall', hubCall);

    // first, outside Studio: nothing about the add-on, no engine
    await openAsk(page, slug);
    let s = await askState(page);
    ok(s.attached && s.note === null && !s.routes[0].ready, 'outside Studio (a browser tab): no add-on note and no engine of the person\'s own', JSON.stringify(s).slice(0, 200));

    // now inside "Studio"
    await ctx.addInitScript(studioStub);
    await page.reload({ waitUntil: 'networkidle' });
    await reopen(page, slug);
    await openAsk(page, slug);
    s = await askState(page);
    ok(s.note && /"Your own AI key" add-on/.test(s.note) && /no AI of their own/.test(s.note) && s.addBtn, 'the box says plainly what is needed and offers to add it: "' + (s.note || '').slice(0, 150) + '…"');
    ok(!s.routes[0].ready && s.engines.length === 0, 'there is no engine for the person\'s own model in the page');
    if (SHOTS) { await page.screenshot({ path: path.join(SHOTS, slug + '-ask-without-light.png') }); }
    const q0 = await ask(page, 'What is in this file?');
    ok(['no_route', 'waiting'].includes(q0.state) && !q0.answer, 'a question gets no model answer (' + q0.state + ': ' + (q0.error || 'it waits for a connected AI app') + ')');
    const posts0 = await page.evaluate(() => window.__studio.posts.filter((p) => p.type === 'ask.call').length);
    ok(posts0 === 0 && provider.requests.length === 0, 'nothing was posted to the hub and the stand-in provider got no request');

    // settings from before 0.10: the note says they are kept
    const before = JSON.stringify({ provider: 'compatible', model: 'local-test', baseUrl: BASE, keyName: 'default', maxOutputTokens: 512, maxToolSteps: 4, caps: { dayAmount: 5, monthAmount: 50, dayTokens: 400000, callsPerHour: 9 }, currency: 'USD', prices: {} });
    await page.evaluate(([k, v]) => { localStorage.setItem(k, v); window.ccAsk.close(); window.ccAsk.open(); }, [SETTINGS_KEY, before]);
    s = await askState(page);
    ok(/set up your own model before/.test(s.note || '') && /kept/.test(s.note || '') && s.addBtn && !s.routes[0].ready, 'with settings stored before: the note says they and the key are kept, and still no engine without the add-on');

    // no account client on the page → "Add it" cannot, and shows the Library page
    await page.waitForFunction(() => !!window.ccAddonsAccount, null, { timeout: 70000 }).catch(() => {});
    const realAcc = await page.evaluate(() => { window.__realAcc = window.ccAddonsAccount; window.ccAddonsAccount = undefined; return !!window.__realAcc; });
    await page.click('[data-k="ownkey-add"]'); await page.waitForSelector('[data-k="ownkey-why"]', { timeout: 10000 });
    s = await askState(page);
    ok(/cannot add from the Library by itself/.test(s.why) && /\/library\/addons\/own-ai-key$/.test(s.page), 'a page with no account add-on client: the box says so and links the add-on\'s Library page (' + s.page + ')');

    console.log('== ' + slug + ': "Add it"');
    // the stand-in account client: add + ensure put the package where the real one does (the loader's store), through the loader's own install check
    const build = await page.evaluate(() => JSON.parse(document.getElementById('cc-addons-account').textContent).build);
    await page.evaluate(([build, manifest, files, app]) => {
      window.__accCalls = [];
      window.ccAddonsAccount = {
        signedIn: () => true,
        add: async (id) => { window.__accCalls.push('add ' + id); return { ok: true, added: [id] }; },
        ensure: async (id) => {
          window.__accCalls.push('ensure ' + id);
          const mod = await import(new URL('addons.js', new URL(build, location.href)).href);
          const loader = new mod.AddonLoader({ app, apiVersion: '1.4', appName: app, packages: mod.packageStore(), fetchJson: async () => null });
          const r = await loader.installPackage({ manifest, files, signature: null, source: 'test:own-ai-key' });
          window.__accCalls.push('installed ' + JSON.stringify(r));
          return r.ok ? { ok: true, installed: [id + '@' + manifest.version] } : { ok: false, reason: r.reason };
        },
      };
    }, [build, manifest, pkgFiles, slug]);
    await page.click('[data-k="ownkey-add"]'); await page.waitForSelector('[data-k="ownkey-added"]', { timeout: 15000 }).catch(() => {});
    s = await askState(page);
    const calls = await page.evaluate(() => window.__accCalls);
    ok(s.added && calls[0] === 'add own-ai-key' && calls[1] === 'ensure own-ai-key' && /"ok":true/.test(calls[2] || ''), 'Add it: the account client is asked to add and fetch own-ai-key, the loader takes the package, and the box says it starts next time (' + calls.join(' | ').slice(0, 140) + ')');
    ok(realAcc, 'the page has the account add-on client (window.ccAddonsAccount), which the offer uses in the lab');
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, slug + '-ask-added.png') });
    ok(provider.requests.length === 0, 'adding it called no provider');

    console.log('== ' + slug + ': the Ask box WITH the add-on');
    await page.reload({ waitUntil: 'networkidle' });
    await reopen(page, slug);
    await page.waitForFunction(() => (window.ccAskEngines || []).some((p) => p.id === 'own-ai-key'), null, { timeout: 70000 }).catch(() => {});
    await openAsk(page, slug);
    s = await askState(page);
    const listed = await page.evaluate(() => { try { return (window.ccAddons.list() || []).filter((a) => a.id === 'own-ai-key').map((a) => ({ state: a.state, source: a.source, version: a.version, reason: a.reason })); } catch (e) { return [{ state: 'no list: ' + e.message }]; } });
    ok(listed.length === 1 && listed[0].state === 'active' && listed[0].source === 'installed', 'after opening the app again the add-on is active, as an added package (never bundled): ' + JSON.stringify(listed));
    ok(s.note === null && s.routes[0].ready && s.routes[0].name === 'Your own model' && s.engines.join() === 'own-ai-key', 'the note is gone and the box has the person\'s own model as its engine ("' + s.routes[0].name + '")');
    const sum = await page.evaluate(() => [...document.querySelectorAll('body *:not(script):not(style)')].find((e) => e.children.length === 0 && (e.textContent || '').length < 120 && /Answered here with/.test(e.textContent || ''))?.textContent || '');
    ok(/Answered here with Your own model/.test(sum), 'the panel says: "' + sum + '"');
    const q1 = await ask(page, 'What is in this file?');
    ok(q1.state === 'answered' && /Stand-in answer/.test(q1.answer || ''), 'a question is answered by the stand-in provider: "' + (q1.answer || q1.error || '') + '"');
    const toolSteps = q1.steps.filter((x) => x.kind === 'tool');
    ok(toolSteps.length === 1 && toolSteps[0].ok && provider.requests.length === 2, 'through one tool step of the app (' + (toolSteps[0] && toolSteps[0].tool) + '), in two calls to the stand-in provider', JSON.stringify(q1.steps).slice(0, 200) + ' requests ' + provider.requests.length);
    ok(provider.requests.every((r) => r.method === 'POST' && r.url === '/v1/chat/completions' && r.auth === '' && r.body && r.body.model === 'local-test' && r.body.max_tokens === 512), 'each call: the compatible chat path, the stored model and output limit, and no key (a model on this computer needs none)');
    const after = await page.evaluate(([k, l]) => ({ settings: localStorage.getItem(k), ledger: JSON.parse(localStorage.getItem(l) || '[]'), keys: Object.keys(localStorage).filter((x) => /byok|own-ai-key/.test(x)) }), [SETTINGS_KEY, LEDGER_KEY]);
    ok(after.settings === before, 'the settings stored before the add-on are byte for byte as they were (nothing migrated, nothing lost)');
    ok(after.ledger.length === 2 && after.ledger.every((e) => e.cost === 0 && e.model === 'local-test') && after.keys.sort().join() === [LEDGER_KEY, SETTINGS_KEY].sort().join(), 'the limits counted both calls in the same ledger as before; no new stored entry (' + after.keys.join(', ') + ')');
    const posts = await page.evaluate(() => window.__studio.posts);
    ok(posts.filter((p) => p.type === 'ask.call').length === 2 && !/sk-|Bearer|authorization|x-api-key/i.test(JSON.stringify(posts)), 'the app window sent two calls to the hub, naming the key store entry and carrying no key or key header');
    if (SHOTS) {
      await page.screenshot({ path: path.join(SHOTS, slug + '-ask-with-light.png') });
    }

    // switched off: the engine goes at once, the note is back
    const off = await page.evaluate(async () => { const l = window.ccAddons.loader; if (!l || typeof l.setEnabled !== 'function') return 'no loader'; await l.setEnabled('own-ai-key', false); return 'off'; });
    await page.waitForTimeout(300);
    s = await askState(page);
    ok(off === 'off' && s.engines.length === 0 && !s.routes[0].ready && /Your own AI key/.test(s.note || ''), 'switched off in Add-ons: the engine is gone at once and the note is back', off + ' ' + JSON.stringify(s).slice(0, 160));
    await page.evaluate(async () => { await window.ccAddons.loader.setEnabled('own-ai-key', true); });
    await page.waitForTimeout(300);
    s = await askState(page);
    ok(s.routes[0].ready && s.note === null, 'switched on again: the engine is back');

    const others = [...hosts.keys()].filter((h) => h !== 'getcadcraft.com');
    ok(others.length === 0, 'every request of the page went to this site (' + [...hosts].map(([h, n]) => h + ' ' + n).join(', ') + '); none to a model provider; the two model calls were made by the stand-in hub in this process, to 127.0.0.1', others.join(', '));
    ok(errors.length === 0, 'no page error', errors.slice(0, 3).join(' | '));

    if (SHOTS) {   // the note in the dark (model) space, for the eye: add-on switched off again, the site's own theme switch
      await page.evaluate(async () => { await window.ccAddons.loader.setEnabled('own-ai-key', false); });
      await page.evaluate(() => { const b = document.querySelector('[data-space="model"]') || [...document.querySelectorAll('.space-toggle button')].pop(); if (b) b.click(); });
      await page.waitForTimeout(1500);
      if (await page.evaluate(() => !!(window.ccAsk && window.ccAsk.state().attached))) { await page.evaluate(() => window.ccAsk.open()); await page.waitForTimeout(300); await page.screenshot({ path: path.join(SHOTS, slug + '-ask-without-dark.png') }); }
    }
    // leave the browser profile as found (a context is thrown away, but be exact): remove the package
    await page.evaluate(async () => { try { await window.ccAddons.uninstall('own-ai-key'); } catch (e) { /* context is closed next */ } });
    await ctx.close();
  }
} catch (e) { ok(false, 'stopped: ' + (e.stack || e.message || e)); } finally { await lab.close(); server.close(); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
