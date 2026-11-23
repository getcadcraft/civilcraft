// SPDX-License-Identifier: Apache-2.0
// SCF.8 end to end against the REAL getcadcraft.com: the lab Super page, signed in with a throwaway fixture account that holds one seat (bin/lab-sync-fixture.php create --seat), blob sync
// opted in on this computer (localStorage cc-super-blob-sync = 1). A Save sends the project's files into the account's real cloud folder by sha256; the server holds each one under
// supercad/blobs/<2>/<sha> with the same bytes (read back and hashed); a second Save sends nothing new (409 = already there). Every blob is removed through the API at the end (the bucket
// version goes for good) and the fixture is cleaned, even on a failure. Run as ROOT.
//   node tools/super-test/blob-sync-live.mjs
import { start, launch, OUT } from './serve.mjs';
import { execFileSync } from 'node:child_process'; import path from 'node:path'; import crypto from 'node:crypto';
const ROOT = path.resolve(OUT, '../..'), SITE = 'https://getcadcraft.com';
const fx = args => execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'bin/lab-sync-fixture.php'), ...args], { encoding: 'utf8' });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const F = JSON.parse(fx(['create', '--seat']).trim().split('\n').pop());
let browser, close, folder = null; const stored = new Set();
const api = async (method, p, body) => { const r = await fetch(SITE + p, { method, headers: { Authorization: 'Bearer ' + F.token, Accept: 'application/json' }, body }); const type = r.headers.get('content-type') || ''; return { status: r.status, json: /json/.test(type) ? await r.json().catch(() => null) : null, bytes: /json/.test(type) ? null : new Uint8Array(await r.arrayBuffer()) }; };
try {
  const fl = await api('GET', '/api/v1/vault/folders');
  const mine = (fl.json?.data?.folders || []).find(f => f.mine || f.own || f.owner === 'me') || (fl.json?.data?.folders || [])[0];
  ok(fl.status === 200 && !!mine, 'the fixture (one seat) has its own cloud folder on the real server: ' + JSON.stringify((fl.json?.data?.folders || []).map(f => f.name)));
  folder = mine && (mine.uuid || mine.id);

  const h = await start({ langs: [''] }); close = h.close;
  browser = await launch(); const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route('**/api/account/super-connect', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: { signedIn: true, token: F.token, expires_at: 'x' } }) }));
  const hits = [];
  await ctx.route(/\/api\/v1\//, async route => {
    const req = route.request(), u = new URL(req.url()); hits.push(req.method() + ' ' + u.pathname + u.search);
    const r = await route.fetch({ url: SITE + u.pathname + u.search }); await route.fulfill({ response: r });
  });
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-super-blob-sync', '1'); } catch { /* */ } });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
  page.on('dialog', d => d.accept().catch(() => {}));
  await ctx.on('download', d => d.cancel().catch(() => {}));
  await page.goto(h.url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  // something in the project: a note (the notes plug-in's files travel in the save)
  const WF = '.sc-barbtn[data-act="workflow"]', DLG = 'dialog[data-sc-plugin="notes-tasks"][open]';
  if (!await page.$('.sc-wf-menu')) await page.click(WF); await page.waitForSelector('.sc-wf-menu'); await page.click('.sc-wf-menu [data-act="plugin:notes-tasks:new-note"]');
  await page.waitForSelector(DLG); await page.fill('[data-note-text]', 'Blob sync note ' + Date.now()); await page.click('[data-note-new-save]'); await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelectorAll('dialog[open]').forEach(d => d.close()));
  // the shas this save will carry, from the page's own project files
  const local = await page.evaluate(() => { const { P, project } = window.superWindow; const set = P.projectFiles(project, { mode: 'zip' }); return [...new Set(set.files.map(f => P.shaOf(f.bytes)))]; });
  ok(local.length > 0, 'the save carries ' + local.length + ' file(s)');
  await page.evaluate(() => window.superWindow.saveProject());
  await page.waitForFunction(() => true); for (let i = 0; i < 40 && hits.filter(x => /^POST \/api\/v1\/vault\/.*\?create=1/.test(x)).length < local.length; i++) await page.waitForTimeout(500);
  await page.waitForTimeout(1500);
  const posts = hits.filter(x => /^POST \/api\/v1\/vault\/[^/]+\/f\/supercad\/blobs\/[0-9a-f]{2}\/[0-9a-f]{64}\?create=1$/.test(x));
  ok(posts.length >= 1, 'the Save sent blobs to the real cloud folder: ' + posts.length + ' POST(s)');
  // the real server holds each one under its sha, with the same bytes
  const sent = [...new Set(posts.map(x => x.match(/([0-9a-f]{64})\?create=1$/)[1]))];
  ok(local.filter(x => sent.includes(x)).length >= Math.min(local.length, 4), 'the files that do not change between saves (members, plug-in files) are among those sent: ' + local.filter(x => sent.includes(x)).length + ' of ' + local.length);
  let held = 0, same = 0;
  for (const sha of sent) {
    const g = await api('GET', `/api/v1/vault/${folder}/f/supercad/blobs/${sha.slice(0, 2)}/${sha}`);
    if (g.status === 200 && g.bytes) { held++; stored.add(sha); if (crypto.createHash('sha256').update(g.bytes).digest('hex') === sha) same++; }
  }
  ok(held === sent.length, `every blob the page sent is in the real folder: ${held} of ${sent.length}`);
  ok(same === held && held > 0, 'read back, each hashes to its own name (no bytes changed on the way)');
  // a second Save with nothing new: the cloud already holds them (409 = already there), nothing is sent twice
  const before = hits.length; await page.evaluate(() => window.superWindow.saveProject()); await page.waitForTimeout(3000);
  const again = hits.slice(before).filter(x => /\?create=1$/.test(x)).length;
  ok(again <= local.length, 'a second Save of the same project: at most one check per file (' + again + '), nothing duplicated');
  const list = await api('GET', `/api/v1/vault/${folder}/list?dir=supercad/blobs`);
  ok(list.status === 200, 'the folder lists its supercad/blobs');
  ok(errors.length === 0, 'no page errors: ' + errors.slice(0, 3).join(' | '));
} catch (e) { fail++; console.log('FAIL (exception)', e && e.stack || e); }
finally {
  // remove every blob through the API (the bucket version goes for good), then the fixture
  for (const sha of stored) { try { const d = await api('DELETE', `/api/v1/vault/${folder}/f/supercad/blobs/${sha.slice(0, 2)}/${sha}`); if (d.status !== 204) console.log('  note: delete answered', d.status, sha.slice(0, 12)); } catch { /* the fixture clean discards the rest */ } }
  try { if (browser) await browser.close(); } catch {} try { if (close) close(); } catch {}
  console.log(fx(['clean']).trim());
}
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
