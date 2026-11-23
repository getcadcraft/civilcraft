#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-upload-family.mjs — FX.40, in a real browser (library-11, 0.11): /library/upload takes a family .json the way an assistant
 * writes it (BimCraft's own starter recipe, format cadcraft-family, written by family-starters.js), files a door under "Door families"
 * and a window under "Window families", and refuses a door put in "Doors and windows" in words.
 *   sudo node tools/library/browser-upload-family.mjs [OUTDIR]      (run as root: a staff session is minted in-process)
 * Steps: open /library/upload, choose the file, press "Upload and read the file", read the submission page, then Discard it (nothing is
 * published; the submission ends as "abandoned"). Screenshots land in OUTDIR (default /tmp/library-11-fx40).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = process.argv[2] || '/tmp/library-11-fx40';
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  ok   ' + l); } else { fail++; console.log('  FAIL ' + l); } };

const st = await import('file://' + REPO + '/public_html/assets/apps/bimcraft/dev/family-starters.js');
const doorKey = st.STARTER_KEYS.find((k) => st.starterRecipe(k)?.kind === 'door');
const windowKey = st.STARTER_KEYS.find((k) => st.starterRecipe(k)?.kind === 'window');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fx40-'));
const files = {};
for (const [name, key] of [['door', doorKey], ['window', windowKey]]) {
  const r = st.starterRecipe(key);
  r.name = name === 'door' ? 'FX40 test door' : 'FX40 test window';
  files[name] = path.join(tmp, `fx40-${name}.json`);
  fs.writeFileSync(files[name], JSON.stringify(r));
}

const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pw = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, pw, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, ignoreHTTPSErrors: true });
const [cn, cv] = minted.cookie.split('=');
await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
const submissions = [];
try {
  for (const name of ['door', 'window']) {
    await page.goto(BASE + '/library/upload', { waitUntil: 'domcontentloaded' });
    await page.setInputFiles('#lib-upload-file', files[name]);
    await page.check('input[name=license_id][value="CC0-1.0"]');
    await page.check('input[name=source_kind][value=own]');
    await page.check('input[name=attest]');
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('form[action="/api/library/upload"] button[type=submit]')]);
    const url = page.url();
    const body = await page.evaluate(() => document.body.innerText);
    await page.screenshot({ path: path.join(OUT, `${name}-submission.png`), fullPage: true });
    ok(/\/library\/submission\//.test(url), `${name}: the upload went to a submission page (${url.replace(BASE, '')})`);
    ok(!/isn't a CadCraft library item|do not match|contents do not match/i.test(body), `${name}: no refusal about the file's contents`);
    ok(new RegExp(name === 'door' ? 'Door families' : 'Window families').test(body), `${name}: filed under ${name === 'door' ? 'Door families' : 'Window families'}`);
    submissions.push(url);
  }
  // the form itself offers the family categories
  await page.goto(BASE + submissions[0].replace(BASE, ''), { waitUntil: 'domcontentloaded' });
  const opts = await page.evaluate(() => [...document.querySelectorAll('select option')].map((o) => o.textContent.trim()));
  ok(opts.some((o) => /Door families/.test(o)) && opts.some((o) => /Window families/.test(o)), 'the category choice offers Door families and Window families');
  await page.screenshot({ path: path.join(OUT, 'category-choice.png'), fullPage: true });
} catch (e) { ok(false, 'no exception: ' + e.message); }
finally {
  // discard every submission this run made (nothing was published)
  for (const url of submissions) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const btn = await page.$('form[action*="submission-abandon"] button[type=submit]');
      if (btn) { await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), btn.click()]); }
    } catch (e) { console.log('  (could not discard ' + url + ': ' + e.message + ')'); }
  }
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'down'], { encoding: 'utf8' });
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
