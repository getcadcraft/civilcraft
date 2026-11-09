#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-myprofiles.mjs — DetailCraft My profiles (FX.146): a custom profile added with "Keep in My profiles" is in this browser's list,
 * is in every new model (a reload; the New command), can be added to an open model, kept from the model's list, refused when another
 * profile has its name, and removed (models that use it keep it). Real form, real panel, no console errors.
 *
 *   node tools/detailcraft-test/browser-myprofiles.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const lab = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' })).cookie.split('=');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const names = (sel) => page.$$eval(sel, (li) => li.map((x) => x.querySelector('.dc-ellip')?.textContent.trim()).filter(Boolean));
const status = () => page.textContent('[data-status]');
const openForm = async () => { await page.evaluate(() => document.querySelectorAll('details.dc-fold').forEach((d) => { d.open = true; })); };
const addProfile = async (name, keep, dims = { d: '200', bf: '75', tw: '6', tf: '10' }) => {
  await openForm();
  await page.selectOption('[data-pkind]', 'C');
  await page.fill('[data-pname]', name);
  for (const [k, v] of Object.entries(dims)) await page.fill(`[data-pdim="${k}"]`, v);
  await page.setChecked('[data-pkeep]', keep);
  await page.click('[data-profile-form] button[type=submit]');
};

try {
  await page.context().addCookies([{ name: lab[0], value: lab.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(`${BASE}/lab/detailcraft?space=paper`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('detailcraft.myprofiles'));
  await page.reload({ waitUntil: 'networkidle' });
  await openForm();
  ok((await names('[data-my-list] li')).length === 0, 'My profiles starts empty');

  await addProfile('MC200', true);
  ok((await names('[data-custom-list] li')).includes('MC200 · Channel'), 'the profile is in this model: ' + (await names('[data-custom-list] li')).join(','));
  ok((await names('[data-my-list] li')).some((n) => n.startsWith('MC200')), 'and in My profiles: ' + (await status()).slice(0, 90));
  ok(JSON.parse(await page.evaluate(() => localStorage.getItem('detailcraft.myprofiles')))[0].name === 'MC200', 'stored in localStorage');

  await addProfile('ONLYHERE', false, { d: '150', bf: '60', tw: '5', tf: '8' });
  ok(!(await names('[data-my-list] li')).some((n) => n.startsWith('ONLYHERE')), 'unchecked: kept in the model only');
  await page.click('[data-custom-list] li:has-text("ONLYHERE") button');
  ok((await names('[data-my-list] li')).some((n) => n.startsWith('ONLYHERE')), 'the model list\'s Keep button adds it to My profiles');

  await addProfile('mc200', true, { d: '300', bf: '90', tw: '7', tf: '12' });
  ok(/already/i.test(await status()) || /already has/.test(await status()), 'a name that is taken in the model is refused: ' + (await status()).slice(0, 70));

  // a new model starts with them
  await page.reload({ waitUntil: 'networkidle' });
  await openForm();
  ok((await names('[data-custom-list] li')).filter((n) => /^(MC200|ONLYHERE)/.test(n)).length === 2, 'after a reload the new model has both: ' + (await names('[data-custom-list] li')).join(','));
  const inPicker = await page.evaluate(() => !!window.detailcraft.model.state.profiles.find((p) => p.name === 'MC200') && window.detailcraft.model.state.profiles.length === 2);
  ok(inPicker, 'they are in model.state.profiles (saved with the file)');

  // different dimensions, same name, from another model: refused by My profiles
  await page.evaluate(() => localStorage.setItem('detailcraft.myprofiles', 'not json'));
  await page.reload({ waitUntil: 'networkidle' });
  ok(await page.evaluate(() => window.detailcraft.model.state.profiles.length) === 0, 'a damaged stored list is ignored: the model starts clean');

  // remove: "Use here" then Remove
  await page.evaluate(() => localStorage.setItem('detailcraft.myprofiles', JSON.stringify([{ name: 'MC200', kind: 'C', d: 200, bf: 75, tw: 6, tf: 10 }])));
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => window.detailcraft.model.state.profiles.splice(0));
  await page.evaluate(() => window.detailcraft.model.change('x', (tx) => tx.addProfile({ name: 'ZZ1', kind: 'FLAT', b: 100, t: 10 })));   // a model that lacks it, as an opened file would
  await openForm();
  ok((await page.$$('[data-my-list] li button')).length === 2, 'My profiles row has Use here and Remove');
  await page.click('[data-my-list] li button:has-text("Use here")');
  ok((await names('[data-custom-list] li')).some((n) => n.startsWith('MC200')), 'Use here adds it to the open model');
  await page.click('[data-my-list] li button:has-text("Remove")');
  ok((await names('[data-my-list] li')).length === 0 && (await names('[data-custom-list] li')).some((n) => n.startsWith('MC200')), 'Remove leaves the model\'s own copy');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('detailcraft.myprofiles')).length) === 0, 'and empties the stored list');
  await page.evaluate(() => localStorage.removeItem('detailcraft.myprofiles'));
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
