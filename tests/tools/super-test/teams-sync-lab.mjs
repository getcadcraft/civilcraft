// SPDX-License-Identifier: Apache-2.0
// The REAL lab page, not the test harness: sign in at https://getcadcraft.com as a throwaway lab account (bin/lab-sync-fixture.php), open /lab/supercadcraft as served by Apache, and see whether the
// Teams plugin connects with the site session by itself and syncs. Run as ROOT.   node tools/super-test/teams-sync-lab.mjs
import { launch, OUT } from './serve.mjs';
import { execFileSync } from 'node:child_process'; import path from 'node:path';
const ROOT = path.resolve(OUT, '../..'), SITE = 'https://getcadcraft.com';
const fx = a => execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'bin/lab-sync-fixture.php'), ...a], { encoding: 'utf8' });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const F = JSON.parse(fx(['create']).trim().split('\n').pop()); let browser;
try {
  browser = await launch({ width: 1440, height: 900 });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.addInitScript(() => { try { localStorage.setItem('cc-super-home', 'off'); } catch {} });
  const page = await ctx.newPage(); const errors = [], calls = [];
  page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
  page.on('request', r => { const u = new URL(r.url()); if (/\/api\/(v1\/(team|account)|account\/super-connect)/.test(u.pathname)) calls.push(r.method() + ' ' + u.pathname + u.search); });
  await page.goto(SITE + '/login'); await page.fill('input[name="email"]', F.email); await page.fill('input[name="password"]', F.password);
  await Promise.all([page.waitForNavigation({ waitUntil: 'load' }).catch(() => {}), page.click('#login button[type="submit"], form[action="/api/auth/login"] button[type="submit"]')]);
  await page.goto(SITE + '/lab/supercadcraft', { waitUntil: 'load' }); await page.waitForSelector('[data-sc-ready]', { timeout: 60000 });
  ok(await page.evaluate(() => !!window.superWindow), 'the real lab page opened signed in (window.superWindow is there)');
  const ST = '[data-pstat="teams:sync"]', TXT = ST + ' .sc-pstat-text';
  await page.waitForSelector(ST, { timeout: 20000 });
  await page.waitForFunction(s => /synced/i.test((document.querySelector(s) || {}).textContent || '') && !/not synced/i.test(document.querySelector(s).textContent), TXT, { timeout: 20000 }).catch(() => {});
  const text = await page.textContent(TXT); ok(/^Teams: synced/.test(text), 'the status line says synced by itself, with no click: "' + text + '"');
  ok(calls.some(c => c === 'POST /api/account/super-connect') && calls.some(c => c.startsWith('GET /api/v1/account/database')) && calls.some(c => c.startsWith('GET /api/v1/team/teams?since=')), 'it asked the site for its key, then the account database, then pulled: ' + [...new Set(calls)].join(' | '));
  const hasKey = await page.evaluate(() => { try { return /^ccu_/.test(sessionStorage.getItem('cc-super-token') || ''); } catch { return false; } });
  ok(hasKey, 'the key is in this tab\'s session storage, not localStorage'); ok(await page.evaluate(() => { try { return !Object.keys(localStorage).some(k => /token/i.test(k) && /^ccu_/.test(localStorage.getItem(k) || '')); } catch { return true; } }), 'and in no localStorage entry');
  // make a team in the real dialog and see it reach the account
  await page.evaluate(() => window.superWindow.plugins.run('teams:teams')); const PG = '[data-home-view="page"]:not([hidden])'; await page.waitForSelector(PG + ' [data-tm-new]');   // Teams is a PAGE of the welcome area
  await page.fill(PG + ' [data-tm-new]', 'Real lab team'); await page.click(PG + ' [data-act="team-add"]'); await page.waitForSelector(PG + ' [data-team-card]'); await page.waitForTimeout(1500);
  const api = async p => (await (await fetch(SITE + p, { headers: { Authorization: 'Bearer ' + F.token } })).json()).data;
  const viaFixtureToken = await api('/api/v1/team/teams'); ok((viaFixtureToken.teams || []).some(t => t.name === 'Real lab team'), 'the team made in the real page is in the account: ' + (viaFixtureToken.teams || []).map(t => t.name).join(', '));
  ok(await page.$eval(PG + ' [data-act="team-sync"]', b => b.disabled), 'and the page\'s Sync button is off: nothing is left to sync');
  await page.screenshot({ path: path.join(OUT, 'teams-reallab-1-page.png') });
  ok(errors.length === 0, 'no page errors: ' + errors.slice(0, 3).join(' | '));
} catch (e) { fail++; console.log('FAIL (exception)', e && e.stack || e); }
finally { try { if (browser) await browser.close(); } catch {} console.log(fx(['clean']).trim()); }
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
