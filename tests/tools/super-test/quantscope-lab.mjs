// SPDX-License-Identifier: Apache-2.0
// 0.11 CE.12: QuantScope's own section in the REAL lab page (https://getcadcraft.com/lab/supercadcraft as Apache serves it, signed in as the throwaway
// lab account of bin/lab-sync-fixture.php). Opens the QuantScope section, adds a body from a shipped generator, runs it in the PartCraft build's
// CraftScript worker, and reads the data sheet, the export-control notice, the Engineer member of the project and a data-sheet download.
// Then PartCraft's own /lab page: its QuantScope workspace still runs (the other adapter of the same library). Run as ROOT.
//   node tools/super-test/quantscope-lab.mjs [--gen gyroid-block]
import { launch, OUT } from './serve.mjs';
import { execFileSync } from 'node:child_process'; import path from 'node:path';
const ROOT = path.resolve(OUT, '../..'), SITE = 'https://getcadcraft.com';
const GEN = (process.argv.indexOf('--gen') > 0 ? process.argv[process.argv.indexOf('--gen') + 1] : '') || 'gyroid-block';
const fx = a => execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'bin/lab-sync-fixture.php'), ...a], { encoding: 'utf8' });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } console.log((c ? 'ok   ' : 'FAIL ') + m); };
const F = JSON.parse(fx(['create']).trim().split('\n').pop()); let browser;
try {
  browser = await launch({ width: 1500, height: 1000 });
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 }, acceptDownloads: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-super-home', 'off'); } catch {} });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
  await page.goto(SITE + '/login'); await page.fill('input[name="email"]', F.email); await page.fill('input[name="password"]', F.password);
  await Promise.all([page.waitForNavigation({ waitUntil: 'load' }).catch(() => {}), page.click('#login button[type="submit"], form[action="/api/auth/login"] button[type="submit"]')]);
  await page.goto(SITE + '/lab/supercadcraft', { waitUntil: 'load' }); await page.waitForSelector('[data-sc-ready]', { timeout: 60000 });
  ok(await page.evaluate(() => location.pathname === '/lab/supercadcraft' && !!window.superWindow), 'the real /lab/supercadcraft page opened signed in');
  const ids = await page.evaluate(() => window.superWindow.features.list().map(f => f.id + (f.built ? '*' : '')));
  ok(ids.includes('quantscope'), 'a QuantScope section is registered under Properties: ' + ids.join(','));
  const title = await page.evaluate(() => window.superWindow.features.section('quantscope').querySelector('.shell-addon-section-tog span').textContent);
  ok(title === 'QuantScope', 'its title reads "' + title + '"');
  await page.evaluate(() => window.superWindow.features.open('quantscope'));
  await page.waitForSelector('[data-sc-quantscope] [data-eng-new]', { timeout: 60000 });
  const before = await page.evaluate(() => ({ qs: !!window.superWindow.quantscope, members: window.superWindow.project.members.filter(m => m.app === 'engineer').length, notice: !!document.querySelector('[data-sc-quantscope] [data-eng-notice]') }));
  ok(before.qs && before.members === 0, 'the section opened on a project with no Engineer member yet');
  ok(before.notice, 'the export-control notice is in the section before anything runs');
  const opts = await page.evaluate(() => [...document.querySelectorAll('[data-sc-quantscope] #pc-eng-pick option')].map(o => o.value));
  ok(opts.includes(GEN) && opts.length >= 4, 'the shipped generators are listed: ' + opts.join(', '));
  await page.selectOption('[data-sc-quantscope] #pc-eng-pick', GEN);
  const t0 = Date.now();
  await page.click('[data-sc-quantscope] [data-eng-new]');
  await page.waitForFunction(() => { const s = document.querySelector('[data-sc-quantscope] [data-gen-state]'); return s && (s.dataset.genState === 'fresh' || s.dataset.genState === 'failed'); }, null, { timeout: 300000 });
  const st = await page.evaluate(() => ({ state: document.querySelector('[data-sc-quantscope] [data-gen-state]').dataset.genState, err: (document.querySelector('[data-sc-quantscope] [data-gen-error]') || {}).textContent || '' }));
  ok(st.state === 'fresh', `the generator ran in the PartCraft build's worker (${((Date.now() - t0) / 1000).toFixed(1)} s): ${st.state} ${st.err}`);
  const sheet = await page.evaluate(() => [...document.querySelectorAll('[data-sc-quantscope] [data-gen-sheet] tbody tr')].map(r => [...r.cells].map(c => c.textContent)));
  ok(sheet.length >= 5, 'the data sheet shows ' + sheet.length + ' rows, e.g. ' + JSON.stringify(sheet.slice(0, 3)));
  const notices = await page.evaluate(() => [...document.querySelectorAll('[data-sc-quantscope] [data-eng-notice]')].map(n => n.textContent));
  ok(notices.length >= 2 && notices.every(n => /^Export controls\./.test(n)), 'the export-control notice is the footer of the data sheet too (' + notices.length + ' in the section): "' + notices[0].slice(0, 80) + '…"');
  await page.waitForTimeout(800);   // the member is written 400 ms after the change
  const mem = await page.evaluate(() => { const m = window.superWindow.project.members.find(x => x.app === 'engineer'); if (!m) return null; const j = JSON.parse(new TextDecoder().decode(m.bytes)); return { name: m.name, format: j.format, n: j.features.length, mesh: j.features[0] && j.features[0].mesh && j.features[0].mesh.nt, sheet: j.features[0] && (j.features[0].sheet || []).length, gen: j.features[0] && j.features[0].gen && j.features[0].gen.id }; });
  ok(mem && mem.format === 'cadcraft-engineer' && mem.n === 1 && mem.mesh > 100 && mem.gen === GEN, 'the body is kept in the project as its Engineer member: ' + JSON.stringify(mem));
  ok(await page.evaluate(() => /kept in this project/.test(document.querySelector('[data-sc-quantscope] [data-qs-kept]').textContent)), 'the section says where the bodies are kept');
  // data out: the JSON data sheet carries the notice
  await page.evaluate(() => { const d = document.querySelector('[data-sc-quantscope] [data-gen-export]'); if (d) d.closest('details').open = true; });
  const dl = page.waitForEvent('download', { timeout: 30000 });
  await page.click('[data-sc-quantscope] [data-gen-export-kind="json"]');
  const d = await dl; const p = path.join(OUT, 'quantscope-lab-sheet.json'); await d.saveAs(p);
  const j = JSON.parse((await import('node:fs')).readFileSync(p, 'utf8'));
  ok(/data sheet\.json$/.test(d.suggestedFilename()) && /Export controls\./.test(j.exportNotice || j.notice || ''), 'the data sheet downloads as ' + d.suggestedFilename() + ' with the notice in it');
  // an input change is one step and Undo brings the old one back
  const inp = page.locator('[data-sc-quantscope] .sc-qs-panel input[type="number"]').first();
  if (await inp.count()) {
    const old = await inp.inputValue(); await inp.fill(String(Number(old) + 1)); await inp.press('Tab'); await page.waitForTimeout(300);
    ok(await page.locator('[data-sc-quantscope] [data-qs-undo]').count() === 1, 'an input change gives an Undo');
    await page.evaluate(() => window.superWindow.quantscope && document.querySelector('[data-sc-quantscope] [data-gen-stop]') && document.querySelector('[data-sc-quantscope] [data-gen-stop]').click());
    await page.click('[data-sc-quantscope] [data-qs-undo]'); await page.waitForTimeout(300);
    ok(await page.locator('[data-sc-quantscope] .sc-qs-panel input[type="number"]').first().inputValue() === old, 'Undo puts the input back to ' + old);
  }
  // the project file carries it: save to bytes and read back
  const round = await page.evaluate(async () => { const W = window.superWindow; const b = W.P.toBytes(W.project); const back = await W.P.fromBytes(b); return back.project.members.filter(m => m.app === 'engineer').map(m => m.name); });
  ok(round.length === 1, 'the .ccproject keeps the Engineer member: ' + round.join(','));
  await page.screenshot({ path: path.join(OUT, 'quantscope-lab-super.png'), fullPage: false });
  await page.evaluate(() => window.superWindow.features.section('quantscope').scrollIntoView());
  await page.screenshot({ path: path.join(OUT, 'quantscope-lab-section.png') });
  ok(errors.length === 0, 'no page errors in Super: ' + errors.slice(0, 3).join(' | '));
  // PartCraft's own lab page: the other adapter still runs the same library
  const pc = await ctx.newPage(); const pcErr = []; pc.on('pageerror', e => pcErr.push(String(e.message)));
  await pc.goto(SITE + '/lab/partcraft', { waitUntil: 'load' }); await pc.waitForFunction(() => !!window.partcraft, null, { timeout: 60000 });
  await pc.waitForSelector('[data-workspace]', { timeout: 30000 });
  const wsOk = (await pc.$$eval('[data-workspace] option', (o) => o.map((x) => x.value))).includes('engineer');
  if (wsOk) await pc.selectOption('[data-workspace]', 'engineer');
  await pc.waitForSelector('#pc-eng-pick', { timeout: 30000 }).catch(() => {});
  const pcHas = await pc.evaluate(() => !!document.querySelector('#pc-eng-pick'));
  ok(wsOk && pcHas, 'PartCraft /lab: the QuantScope workspace opens with the generator list');
  if (pcHas) {
    await pc.selectOption('#pc-eng-pick', GEN); await pc.click('[data-eng-new]');
    await pc.waitForFunction(() => { const s = document.querySelector('[data-gen-state]'); return s && (s.dataset.genState === 'fresh' || s.dataset.genState === 'failed'); }, null, { timeout: 300000 });
    const s2 = await pc.evaluate(() => ({ st: document.querySelector('[data-gen-state]').dataset.genState, rows: document.querySelectorAll('[data-gen-sheet] tbody tr').length, notice: !!document.querySelector('[data-gen-sheet] ~ [data-eng-notice], [data-eng-notice]') }));
    ok(s2.st === 'fresh' && s2.rows >= 5 && s2.notice, 'PartCraft /lab: the same generator runs there too (' + s2.st + ', ' + s2.rows + ' sheet rows, notice ' + s2.notice + ')');
    await pc.screenshot({ path: path.join(OUT, 'quantscope-lab-partcraft.png') });
  }
  ok(pcErr.length === 0, 'no page errors in PartCraft: ' + pcErr.slice(0, 3).join(' | '));
} catch (e) { fail++; console.log('FAIL (exception)', e && e.stack || e); }
finally { try { if (browser) await browser.close(); } catch {} console.log(fx(['clean']).trim()); }
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
