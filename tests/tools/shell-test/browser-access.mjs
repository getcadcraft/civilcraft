#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-access.mjs — the shared drafting-without-sight module in an app's lab page (round 3, session shell_PART_3, EG.52; assets/js/app-access.js), on a scratch
 * copy of the page (no app's manifest has the "access" key yet, so the script pair app-shell.inc would print and the Settings fieldset from app-settings.inc are put
 * into the page as fetched; no app folder is edited):
 *   - /use (a release) has no #cc-access; app-settings.inc has the fieldset only behind the "access" key
 *   - off by default and silent: nothing in the two live regions, no sound, no data-cc-access
 *   - Settings › Global › Drafting without sight: the card; ticking Access speaks "Access is on…" in the polite region; say() reaches it; an urgent line reaches the alert
 *     region; "say that again" repeats; the choice is kept in localStorage cc-access (one record for every app) and survives a reload
 *   - sounds: ticking sounds turns the earcons on and beep() plays a snap's sound (Web Audio is in headless Chromium); off, it is silent
 *   - voice with a fake recogniser: local starts with processLocally; what is heard becomes a command through the app's known()/act(); an unknown phrase is
 *     answered "Not a command"; online is refused until allowed by name and says so; turning Access off stops listening
 *   - the app bar still fits at 360 px; no page errors
 *
 *   node tools/shell-test/browser-access.mjs [--apps partcraft]
 * Run as root (a session minted for the shell's test admin). One app at a time.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const APPS = (opt('--apps') || 'partcraft').split(',');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const curl = (url, cookie) => execFileSync('curl', ['-sk', '--resolve', 'getcadcraft.com:443:127.0.0.1', ...(cookie ? ['-b', cookie] : []), url], { encoding: 'utf8', maxBuffer: 64 << 20 });
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));

// the Settings fieldset, exactly as app-settings.inc prints it behind the key (the PHP echoes become the lang keys' English words)
const inc = fs.readFileSync(path.join(REPO, 'public_html/core/components/app-settings.inc'), 'utf8');
const fm = inc.match(/<\?php if \(in_array\('access', AppBuilds::extras\(\$__build\), true\)\):[^?]*\?>\s*(<fieldset[\s\S]*?<\/fieldset>)\s*<\?php endif; \?>/);
ok(!!fm, 'app-settings.inc prints the fieldset only behind the "access" key');
const EN = JSON.parse(fs.readFileSync(path.join(REPO, 'public_html/assets/lang/shell/en.json'), 'utf8'));
const FIELDSET = fm ? fm[1].replace(/<\?= Lang::e\('([^']+)'\) \?>/g, (_, k) => EN[k] || k) : '';

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pw = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, pw, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
const [cn, cv] = minted.cookie.split('=');
await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
let problems = [];
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const wait = async (fn, ms = 4000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await page.evaluate(fn).catch(() => false)) return true; await sleep(60); } return false; };
const live = () => page.evaluate(() => ({ polite: document.querySelector('[data-access-live="polite"]')?.textContent || '', urgent: document.querySelector('[data-access-live="assertive"]')?.textContent || '' }));

for (const slug of APPS) {
  console.log('== ' + slug);
  problems = [];
  ok(!curl(`${BASE}/use/${slug}`).includes('id="cc-access"'), `${slug}: /use (release) has no #cc-access`);
  const scratch = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/mount-kit.php'), slug, 'access'], { encoding: 'utf8' }));
  ok(scratch.extras.includes('access') && scratch.missing.length === 0, 'the scratch build names app-access.js in its import map, offline list and on disk' + (scratch.missing.length ? ': ' + scratch.missing.join(', ') : ''));
  const tag = scratch.tags.split('\n').filter((l) => l.includes('cc-access') || l.includes('app-access.js')).join('\n');
  // the pair app-shell.inc prints for the key, on its own line (the tags string has one line per key: json + module)
  const pair = scratch.tags.match(/<script type="application\/json" id="cc-access">[^\n]*<\/script><script type="module" src="[^"]*app-access\.js[^"]*"><\/script>/);
  ok(!!pair, 'app-shell.inc prints #cc-access and app-access.js for the key');

  await page.addInitScript(() => { try { if (!sessionStorage.getItem('__acc_clean')) { localStorage.removeItem('cc-access'); sessionStorage.setItem('__acc_clean', '1'); } } catch (e) { /* */ } });
  await page.route(`${BASE}/lab/${slug}`, async (route) => {
    const res = await route.fetch();
    let body = await res.text();
    if (!body.includes('data-access-settings')) body = body.replace(/(<fieldset class="shell-set"[^>]*>\s*<legend>)/, FIELDSET + '\n$1').replace('</body>', (pair ? pair[0] : '') + '</body>');   // round 3: apps whose manifest has the key print both themselves
    await route.fulfill({ response: res, body });
  });
  await page.goto(`${BASE}/lab/${slug}`, { waitUntil: 'domcontentloaded' });
  ok(await wait(() => !!window.ccAccess, 20000), 'window.ccAccess is there');
  // a fake recogniser, set up before voice is ever started
  await page.evaluate(() => {
    window.__rec = { starts: 0, stops: 0, last: null };
    window.SpeechRecognition = function () { window.__rec.last = this; this.start = () => { window.__rec.starts++; }; this.stop = () => { window.__rec.stops++; }; };
    window.SpeechRecognition.available = async () => 'available';
  });

  console.log('-- off and silent');
  let st = await page.evaluate(() => window.ccAccess.state());
  ok(st.on === false && st.sound === false && st.voice === 'off' && st.online === false, 'everything is off to begin with');
  ok(await page.evaluate(() => !document.documentElement.hasAttribute('data-cc-access')), 'no data-cc-access while off');
  await page.evaluate(() => window.ccAccess.say('should stay silent')); await sleep(350);
  let l = await live(); ok(l.polite === '' && l.urgent === '', 'two live regions exist and say nothing while Access is off');
  ok(await page.evaluate(() => window.ccAccess.beep('end') === undefined && window.ccAccess.earcons.last.kind === ''), 'no sound while off');

  console.log('-- Settings › Global › Drafting without sight');
  await page.keyboard.press('Control+Comma'); await sleep(300);
  ok(await page.locator('[data-access-settings]').isVisible(), 'the card is in Settings');
  ok(await page.locator('[data-access-settings] input[data-k="sound"]').isDisabled(), 'sounds, voice and volume wait until Access is on');
  await page.locator('[data-access-settings] input[data-k="on"]').check(); await sleep(450);
  l = await live(); ok(/Access is on/.test(l.polite), 'ticking Access says so in the polite region: ' + l.polite.slice(0, 50));
  ok(await page.evaluate(() => document.documentElement.hasAttribute('data-cc-access') && JSON.parse(localStorage.getItem('cc-access')).on === true), 'it is kept in localStorage cc-access (one record for every app) and marked on the page');
  await page.evaluate(() => window.ccAccess.say('Command: LINE')); await sleep(400);
  l = await live(); ok(/Command: LINE/.test(l.polite), 'say() reaches the polite region');
  await page.evaluate(() => window.ccAccess.say('Error: bad point', { urgent: true })); await sleep(120);
  l = await live(); ok(l.urgent === 'Error: bad point', 'an urgent line reaches the alert region');
  await page.evaluate(() => { window.ccAccess.repeat(); }); await sleep(120);
  l = await live(); ok(l.urgent === 'Error: bad point', 'repeat says the last sentence again');

  console.log('-- sounds');
  await page.locator('[data-access-settings] input[data-k="sound"]').check(); await sleep(300);
  l = await live(); ok(/Sounds are on/.test(l.polite), 'ticking sounds says so');
  const played = await page.evaluate(() => { window.ccAccess.beep('end', 0.2); return window.ccAccess.earcons.last.kind; });
  ok(played === 'end', 'a snap kind plays its sound (' + played + ')');
  await page.locator('[data-access-settings] input[data-k="sound"]').uncheck(); await sleep(100);
  ok(await page.evaluate(() => { window.ccAccess.earcons.last = { kind: '', at: 0 }; window.ccAccess.beep('mid'); return window.ccAccess.earcons.last.kind === ''; }), 'with sounds off, beep is silent');

  console.log('-- voice');
  const heardLog = await page.evaluate(() => { window.__acts = []; window.ccAccess.attach({ known: (n) => ['line', 'circle', 'zoom'].includes(n), act: (r) => window.__acts.push(r) }); return true; });
  await page.locator('[data-access-settings] input[data-k="voice"]').check(); await sleep(500);
  ok(await page.evaluate(() => window.__rec.starts === 1 && window.__rec.last.processLocally === true), 'voice starts on this computer (processLocally)');
  ok(/recognised on this computer/.test(await page.locator('[data-access-state]').innerText()), 'the card says where speech is recognised');
  const say = (txt) => page.evaluate((t) => window.__rec.last.onresult({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: t } }] }), txt);
  await say('line'); await sleep(350);
  ok(await page.evaluate(() => window.__acts.length === 1 && window.__acts[0].kind === 'command' && window.__acts[0].text === 'line'), 'what is heard becomes a command through known() and act()');
  l = await live(); ok(/Heard: line/.test(l.polite), 'and is said back: ' + l.polite.slice(0, 40));
  await say('point three hundred comma four hundred'); await sleep(200);
  ok(await page.evaluate(() => window.__acts.at(-1).kind === 'input' && window.__acts.at(-1).text === '300,400'), 'a coordinate by voice');
  await say('flibbertigibbet'); await sleep(400);
  l = await live(); ok(/Not a command: flibbertigibbet/.test(l.polite) && await page.evaluate(() => window.__acts.length === 2), 'an unknown phrase is answered, and nothing runs');
  await page.locator('[data-access-settings] input[data-k="on"]').uncheck(); await sleep(300);
  ok(await page.evaluate(() => window.__rec.stops >= 1 && !window.ccAccess.state().listening), 'turning Access off stops listening');
  await page.evaluate(() => { window.SpeechRecognition = undefined; window.webkitSpeechRecognition = function () { window.__rec.onlineStarted = true; this.start = () => {}; this.stop = () => {}; }; });
  await page.locator('[data-access-settings] input[data-k="on"]').check(); await sleep(200);
  await page.locator('[data-access-settings] input[data-k="voice"]').uncheck(); await sleep(100);
  await page.locator('[data-access-settings] input[data-k="voice"]').check(); await sleep(500);
  ok(await page.evaluate(() => !window.__rec.onlineStarted) && /online service is not allowed/.test(await page.locator('[data-access-state]').innerText()), 'online recognition is refused until allowed by name, and the card says so');
  await page.locator('[data-access-settings] input[data-k="online"]').check(); await sleep(600);
  ok(await page.evaluate(() => window.__rec.onlineStarted === true) && /online speech service/.test(await page.locator('[data-access-state]').innerText()), 'allowed by name, it starts and says whose service it is');
  await page.locator('[data-access-settings] input[data-k="voice"]').uncheck(); await sleep(100);
  await page.keyboard.press('Escape');

  console.log('-- kept across a reload');
  await page.reload({ waitUntil: 'domcontentloaded' });
  ok(await wait(() => !!window.ccAccess, 20000), 'back after a reload');
  st = await page.evaluate(() => window.ccAccess.state());
  ok(st.on === true && st.online === true && st.voice === 'off', 'the choices are kept: ' + JSON.stringify({ on: st.on, online: st.online, voice: st.voice }));
  await page.setViewportSize({ width: 360, height: 780 }); await sleep(250);
  ok(await page.evaluate(() => { const b = document.querySelector('.app-bar'); return b.scrollWidth <= b.clientWidth + 1; }), 'the app bar still fits at 360 px');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.evaluate(() => localStorage.removeItem('cc-access'));
  ok(!problems.length, 'no page errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
}
await browser.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
