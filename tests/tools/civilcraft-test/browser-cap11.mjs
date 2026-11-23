#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-cap11.mjs — CivilCraft with the 2,000,000-point cap lifted (perf-finish-11 lane civil, owner 2026-11-22), in the real /lab page.
 * Opens a project file through the page's own file input and measures, then edits:
 *   open   time from the file input to the first scene shown (the page's cv-open marks), long tasks (count, longest, blocked), the JS heap
 *          (performance.memory) and the ArrayBuffer memory (CDP Runtime.getHeapUsage backingStorageSize), points, triangles, contours;
 *   copy   the autosave journal's first copy (the same journal the app writes: Project.autosaveJournal) — time, size, longest task;
 *   edit   one point moved (point-edit.js editPoint, the Properties box's call): the call, the undo step's recorded bytes, the surface rebuilt
 *          (off the page from 2,000,000 points), the autosave change written after it (size);
 *   undo   the same, back.
 * --sig  also prints a signature of the opened project (the project file's text, the surface's stats, the contours) for old-vs-new runs;
 * --before (VPS only) serves the snapshot taken before the cap was lifted (tmp/pf11-civil-cap-before/) in place of the working files.
 *   VPS:      flock tmp/pf11-browser.lock nice -n 10 node tools/civilcraft-test/browser-cap11.mjs --file <path> [--sig] [--before]
 *   ws11a:    tools/gpu-remote/run.sh --session civil-cap11 --lab -- tools/civilcraft-test/browser-cap11.mjs --file 'C:\Users\Public\cc-large\civil\survey-10m.civilcraft.json'
 * Writes tmp/civil-cap11-<file>.json beside the log.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, remote, BASE } from '../gpu-remote/browser.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const FILE = arg('--file') || '/var/www/CADCRAFT/testfiles/generated/civil/survey-500k.civilcraft.json';
const SIG = process.argv.includes('--sig'), BEFORE = process.argv.includes('--before');
const TIMEOUT = Number(arg('--timeout') || 1500) * 1000;
const out = { file: FILE.split(/[\\/]/).pop(), before: BEFORE, remote, when: new Date().toISOString() };
const T0 = Date.now();
const log = (s) => { console.log(s); try { fs.mkdirSync(path.join(REPO, 'tmp'), { recursive: true }); fs.appendFileSync(path.join(REPO, 'tmp', 'civil-cap11-progress.txt'), new Date().toISOString().slice(11, 19) + ' ' + s + '\n'); } catch { /* */ } };

const browser = await launch({ args: ['--enable-precise-memory-info', '--js-flags=--max-old-space-size=16000'] });
let code = 0;
try {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addCookies(labCookie());
  await ctx.addInitScript(() => { window.__lt = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch { /* */ } try { localStorage.setItem('cc-autofocus', 'off'); localStorage.setItem('cc-hw-share', 'off'); } catch { /* */ } });
  await ctx.addInitScript(() => {   // every IndexedDB write the page makes, and how it ended (the autosave's own errors go to the shell's screen reader line)
    window.__idb = [];
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...a) {
      const e = { store: this.name, t: Math.round(performance.now()), r: 'pending' }; window.__idb.push(e);
      try { const q = put.apply(this, a); q.addEventListener('success', () => { e.r = 'ok'; }); q.addEventListener('error', () => { e.r = 'error ' + (q.error && q.error.name + ': ' + q.error.message); }); this.transaction.addEventListener('abort', () => { e.r = 'abort ' + (this.transaction.error && this.transaction.error.name + ': ' + this.transaction.error.message); }); return q; }
      catch (err) { e.r = 'throw ' + err.name + ': ' + err.message; throw err; }
    };
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 300)));
  let crashed = false;
  page.on('crash', () => { crashed = true; errors.push('the tab crashed'); log('THE TAB CRASHED'); });
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 300)); if (/civilcraft:|autosave|quota|IndexedDB/i.test(m.text())) log(m.type().toUpperCase() + ' ' + m.text().slice(0, 300) + ' (' + Math.round((Date.now() - T0) / 1000) + ' s)'); });
  if (BEFORE) {
    if (remote) throw new Error('--before runs on the VPS only');
    const snap = path.join(REPO, 'tmp/pf11-civil-cap-before');
    await page.route('**/assets/apps/civilcraft/dev/**/*.js*', (r) => {
      const rel = new URL(r.request().url()).pathname.replace(/^.*\/assets\/apps\/civilcraft\/dev\//, '');
      const f = path.join(snap, rel);
      if (!fs.existsSync(f)) return r.continue();
      return r.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(f) });
    });
  }
  const cdp = await ctx.newCDPSession(page);
  const mem = async () => {
    const h = await cdp.send('Runtime.getHeapUsage').catch(() => ({}));
    const js = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);
    return { jsHeapMB: Math.round(js / 1048576), heapUsedMB: Math.round((h.usedSize || 0) / 1048576), arrayBuffersMB: h.backingStorageSize !== undefined ? Math.round(h.backingStorageSize / 1048576) : null };
  };
  log(`CivilCraft /lab ← ${out.file}${BEFORE ? ' (BEFORE: the snapshot)' : ''}${remote ? ' on workstation11a' : ' on the VPS'}`);
  await page.goto(BASE + '/lab/civilcraft', { waitUntil: 'networkidle', timeout: 180000 });
  await page.waitForFunction(() => window.civilcraft?.project, null, { timeout: 120000 });
  await page.waitForTimeout(1500);
  out.machine = await page.evaluate(() => navigator.userAgent.replace(/^.*\) /, '') + ', ' + (navigator.hardwareConcurrency || '?') + ' threads, ' + (navigator.deviceMemory || '?') + '+ GB');
  const ltN = () => page.evaluate(() => window.__lt.length);
  const lt = (n0) => page.evaluate((n0) => { const l = window.__lt.slice(n0); return { tasks: l.length, blockedMs: Math.round(l.reduce((a, x) => a + x[1], 0)), longestMs: Math.round(l.reduce((a, x) => Math.max(a, x[1]), 0)) }; }, n0);
  const quiet = async (t0, ms = 2000) => { for (;;) { await page.waitForTimeout(500); const q = await page.evaluate(() => { const l = window.__lt, e = l.length ? l[l.length - 1][0] + l[l.length - 1][1] : 0; return performance.now() - e; }); if (q > ms) return; if (Date.now() - t0 > TIMEOUT) throw new Error('not quiet in time'); } };

  // the app's own autosave journal (made when the file opens): every copy it writes is timed and sized (window.__as)
  await page.evaluate(() => {
    const P = window.civilcraft.project.constructor, orig = P.prototype.autosaveJournal;
    window.__as = [];
    P.prototype.autosaveJournal = function (...a) {
      const j = orig.apply(this, a), wrap = (k) => { const f = j[k]; j[k] = async (...b) => { const t = performance.now(), r = await f.apply(j, b); if (r) window.__as.push({ kind: k, ms: Math.round(performance.now() - t), sizeKB: Math.round((r.size || 0) / 1024), at: Math.round(performance.now()) }); return r; }; };
      wrap('base'); wrap('delta'); return j;
    };
  });
  // ---- open
  const n0 = await ltN(), t0 = Date.now();
  const PROF = process.argv.includes('--profile');   // the open's top self-time functions (CDP sampling profiler)
  if (PROF) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 1000 }); await cdp.send('Profiler.start'); }
  await page.setInputFiles('[data-file]', FILE);
  await page.waitForFunction(() => !!performance.getEntriesByName('cv-open:shown').length || /could not|failed|too large|over \d/i.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: TIMEOUT });
  await quiet(t0);
  if (PROF) { const { profile } = await cdp.send('Profiler.stop'); const self = new Map(), byId = new Map(profile.nodes.map((n) => [n.id, n])); profile.samples.forEach((id, i) => { const cf = byId.get(id)?.callFrame; if (!cf) return; const k = (cf.functionName || '(anonymous)') + ' @ ' + cf.url.replace(/\?.*$/, '').replace(/^.*\/dev\//, '') + ':' + (cf.lineNumber + 1); self.set(k, (self.get(k) || 0) + (profile.timeDeltas[i] || 0)); }); log('profile of the open (page): ' + [...self.entries()].filter(([k]) => !/^\((idle|program|root)\)/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => `${v / 1000 | 0} ms ${k}`).join(' · ')); }
  const marks = await page.evaluate(() => { const m = performance.getEntriesByType('mark').filter((x) => x.name.startsWith('cv-open:')); return Object.fromEntries(m.map((x) => [x.name.slice(8), Math.round(x.startTime - m[0].startTime)])); });
  out.open = { ms: marks.shown ?? null, marks, wallMs: Date.now() - t0, ...(await lt(n0)), ...(await mem()) };
  Object.assign(out.open, await page.evaluate(() => { const p = window.civilcraft.project, s = p.cache.get('eg')?.value?.surface; return { points: p.points.length, triangles: s ? s.nT : null, contours: (p.cache.get('contours:eg')?.value || []).length, notes: (window.civilcraft.lastReport || []).slice?.(0, 3) || null }; }));
  log(`open: ${out.open.points.toLocaleString('en-US')} points, ${out.open.triangles?.toLocaleString('en-US')} triangles, ${out.open.contours} contours; shown after ${out.open.ms} ms (marks ${JSON.stringify(marks)}); ${out.open.tasks} long tasks, longest ${out.open.longestMs} ms, ${out.open.blockedMs} ms blocked; JS heap ${out.open.jsHeapMB} MB, ArrayBuffers ${out.open.arrayBuffersMB} MB`);
  if (SIG) {
    out.sig = await page.evaluate(() => {
      const p = window.civilcraft.project, h = (s) => { let a = 0x811c9dc5, b = 0x01000193; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); a = Math.imul(a ^ c, 16777619) >>> 0; b = Math.imul(b ^ c, 2246822507) >>> 0; } return a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0'); };
      const j = p.toJSON(); delete j.saved; const s = p.eg().surface;
      return { file: h(JSON.stringify(j, null, 1)), stats: s ? JSON.stringify(s.stats()) : null, nT: s ? s.nT : null, contours: h(JSON.stringify(p.contours())), groups: JSON.stringify(p.groups()) };
    });
    log('signature: ' + JSON.stringify(out.sig));
  }

  // ---- the autosave journal's first copy, then a point moved, then undone
  const step = async (label, fn, a) => {
    const n1 = await ltN(), t1 = Date.now();
    const r = await page.evaluate(fn, a);
    log(`${label}: the call returned after ${Date.now() - t1} ms: ${JSON.stringify(r)}`);
    for (let last = Date.now(); ;) {   // wait for the rebuilt surface, saying where things are every 20 s
      if (crashed) throw new Error(label + ': the tab crashed');
      const done = await page.evaluate(() => { const p = window.civilcraft.project, c = p.cache.get('eg'); return !!c && c.deps === p.surfaceDeps(); }).catch((e) => { throw new Error('page gone: ' + e.message); });
      if (done) break;
      if (Date.now() - t1 > TIMEOUT) throw new Error(label + ': the surface was not rebuilt in time');
      if (Date.now() - last > 20000) { last = Date.now(); log(`  … ${Math.round((Date.now() - t1) / 1000)} s: ${JSON.stringify({ ...(await lt(n1)), ...(await mem()), autosave: await page.evaluate(() => window.__as.length), status: await page.evaluate(() => (document.querySelector('[data-status]')?.textContent || '').slice(0, 120)) })}`); }
      await page.waitForTimeout(500);
    }
    const rebuiltMs = Date.now() - t1;
    await quiet(t1, 1500);
    const res = { ...r, rebuiltMs, ...(await lt(n1)), ...(await mem()) };
    log(`${label}: ${JSON.stringify(res)}`);
    return res;
  };
  const peUrl = await page.evaluate(() => (performance.getEntriesByType('resource').find((e) => /\/civilcraft\/dev\/point-edit\.js/.test(e.name)) || {}).name || new URL('point-edit.js', document.querySelector('script[src*="civilcraft/dev/"]')?.src || location.href).href);
  out.edit = await step('edit (one point moved)', async (u) => {
    const { editPoint } = await import(u), p = window.civilcraft.project, i = Math.floor(p.points.length / 2), q = p.points[i];
    const t = performance.now(), r = editPoint(p, q.n, { x: q.x + 2.5, y: q.y - 1.5 }), callMs = Math.round(performance.now() - t);
    const st = p.undoStack[p.undoStack.length - 1];
    return { ok: r.ok, point: q.n, callMs, undoStepBytes: st.prec ? st.prec.bytes : st.pts ? 'whole points array kept (' + st.pts.length + ')' : 0 };
  }, peUrl);
  // the app writes its copy ~2 s after the last change: the first one after an edit is the whole project (a base), then changes
  const asWait = async (n) => { const t = Date.now(); while ((await page.evaluate(() => window.__as.length)) < n && Date.now() - t < TIMEOUT) await page.waitForTimeout(500); return page.evaluate(() => window.__as.slice()); };
  { const n4 = await ltN(); const as = await asWait(1); out.edit.appAutosave = { writes: as, ...(await lt(n4)), ...(await mem()) }; log('the app\'s autosave after the edit: ' + JSON.stringify(out.edit.appAutosave)); }
  out.undo = await step('undo', () => { const p = window.civilcraft.project, t = performance.now(), l = p.undo(); return { label: l, callMs: Math.round(performance.now() - t) }; });
  { const n5 = await ltN(), had = out.edit.appAutosave.writes.length; const as = await asWait(had + 1); out.undo.appAutosave = { writes: as.slice(had), ...(await lt(n5)), ...(await mem()) }; log('the app\'s autosave after the undo: ' + JSON.stringify(out.undo.appAutosave)); }
  // what the app's autosave really stored (IndexedDB 'cadcraft-autosave', its index records): the writes reached storage
  const readStored = () => page.evaluate(() => new Promise((res) => { const r = indexedDB.open('cadcraft-autosave'); r.onerror = () => res({ error: String(r.error) }); r.onsuccess = () => { try { const q = r.result.transaction('index').objectStore('index').getAll(); q.onsuccess = () => res(q.result.filter((x) => /civilcraft/.test(x.app)).map((x) => ({ app: x.app, sizeMB: +((x.size || 0) / 1048576).toFixed(1), segs: x.segs, savedAt: x.savedAt }))); q.onerror = () => res({ error: String(q.error) }); } catch (e) { res({ error: e.message }); } }; }));
  { const t8 = Date.now(); do { out.autosaveStored = await readStored(); if (Array.isArray(out.autosaveStored) && out.autosaveStored.length) break; await page.waitForTimeout(2000); } while (Date.now() - t8 < 180000 && !crashed); out.autosaveStoredAfterS = Math.round((Date.now() - t8) / 1000); }   // the write lands a little after the copy is made
  log('the autosave copies stored: ' + JSON.stringify(out.autosaveStored) + ' (looked for ' + out.autosaveStoredAfterS + ' s); status line: ' + JSON.stringify(await page.evaluate(() => (document.querySelector('[data-status]')?.textContent || '').slice(0, 200))) + '; IndexedDB writes: ' + JSON.stringify(await page.evaluate(() => window.__idb.filter((e) => e.store === 'data' || e.r !== 'ok').slice(-8))) + '; storage estimate: ' + JSON.stringify(await page.evaluate(async () => { try { const e = await navigator.storage.estimate(); return { usageMB: Math.round(e.usage / 1048576), quotaMB: Math.round(e.quota / 1048576) }; } catch (err) { return String(err); } })));
  if (!out.autosaveStored?.length) code = 1;
  const tableSig = () => page.evaluate(() => {   // the points and the state as numbers and hashes (no row strings made)
    const p = window.civilcraft.project, T = p.pointTable, H = (s, h = 2166136261) => { for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0; return h; };
    const dh = T.dict.map((d) => H(String(d)));
    let n = 0, sx = 0, sy = 0, sz = 0, hn = 2166136261, hd = 0;
    for (const b of T.blocks) for (let k = 0; k < b.n; k++, n++) { sx += b.x[k]; sy += b.y[k]; if (b.z[k] === b.z[k]) sz += b.z[k]; hn = H(T.rowName(b, k) + '\u0001', hn); hd = (Math.imul(hd, 31) + dh[b.d[k]]) >>> 0; }
    const j = p.toJSON({ light: true }); for (const k of ['saved', 'pair', 'pointsFile', 'name']) delete j[k];
    const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);   // values, not key order (fromJSON puts surface.tin after the keys it read, the open before; tested in Node)
    for (const k of Object.keys(j)) j[k] = canon(j[k]);
    return { n, sx, sy, sz, hn, hd, state: H(JSON.stringify(j)), keys: Object.fromEntries(Object.keys(j).map((k) => [k, H(JSON.stringify(j[k]) || '')])), seq: j.seq };
  });
  if (process.argv.includes('--save')) {   // the app's own Save (the toolbar's command): in the headless browser it downloads the pair
    const sig0 = await tableSig();
    log('signature before Save: ' + JSON.stringify(sig0));
    const n6 = await ltN(), t6 = Date.now(), dls = [];
    page.on('download', (d) => dls.push(d));
    const status = () => Promise.race([page.evaluate(() => (document.querySelector('[data-status]')?.textContent || '')), new Promise((r) => setTimeout(() => r('\u0000'), 60000))]).then((v) => { if (v === '\u0000') { crashed = true; log('the page does not answer for 60 s (crashed?)'); return ''; } return v; });
    page.evaluate(() => window.civilcraft.command('save')).catch(() => {});
    while (dls.length < 2 && Date.now() - t6 < TIMEOUT && !crashed) { await page.waitForTimeout(500); if (/could not|failed/i.test(await status())) break; }
    if (crashed) { out.save = { crashed: true, ms: Date.now() - t6 }; log('save: THE TAB CRASHED after ' + out.save.ms + ' ms'); throw new Error('the tab crashed during Save'); }
    out.save = { ms: Date.now() - t6, downloads: dls.length, status: (await status()).slice(0, 300), ...(await lt(n6)), ...(await mem()) };
    const dir = remote ? 'C:\\Users\\Public\\cc-large\\civil\\' : path.join(REPO, 'tmp') + '/';
    const saved = dir + 'cap11-saved-' + out.file.replace(/\W+/g, '_') + '.civilcraft.json';
    for (const d of dls) { const name = d.suggestedFilename(); const to = /\.json$/i.test(name) ? saved : dir + 'cap11-saved.ifc'; await d.saveAs(to); const sz = fs.existsSync(to) ? fs.statSync(to).size : null; (out.save.files ||= []).push({ name, bytes: sz }); }
    log('save: ' + JSON.stringify(out.save));
    if (process.argv.includes('--reopen') && out.save.files?.some((f) => /\.json$/i.test(f.name))) {
      await page.evaluate(() => performance.clearMarks());
      const n7 = await ltN(), t7 = Date.now();
      // the pair together (the JSON names its IFC: opened alone, the page would ask for the other one); a JSON over 200 MB opens on its own
      await page.setInputFiles('[data-file]', fs.existsSync(dir + 'cap11-saved.ifc') && out.save.files.find((f) => /\.json$/i.test(f.name)).bytes <= 200 * 1048576 ? [saved, dir + 'cap11-saved.ifc'] : [saved]);
      await page.waitForFunction(() => !!performance.getEntriesByName('cv-open:shown').length, null, { timeout: TIMEOUT });
      await quiet(t7);
      out.reopen = { ms: Date.now() - t7, ...(await lt(n7)), ...(await mem()) };
      const sig1 = await tableSig();
      const pts = (g) => JSON.stringify([g.n, g.sx, g.sy, g.sz, g.hn, g.hd]);
      out.reopen.samePoints = pts(sig0) === pts(sig1);
      out.reopen.stateKeysDiffer = Object.keys({ ...sig0.keys, ...sig1.keys }).filter((k) => sig0.keys[k] !== sig1.keys[k]);
      // `seq` is the next id: every open takes a new block of ids for its session (0.11 DC.27), so it differs by design
      out.reopen.same = out.reopen.samePoints && out.reopen.stateKeysDiffer.every((k) => k === 'seq');
      log('reopen of the saved file: ' + JSON.stringify(out.reopen) + (out.reopen.same ? ' — the same points and state (seq: ' + sig0.seq + ' → ' + sig1.seq + ', a new block of ids)' : ' — DIFFERS: ' + JSON.stringify({ pointsSame: out.reopen.samePoints, keys: out.reopen.stateKeysDiffer })));
      if (!out.reopen.same) code = 1;
      try { fs.unlinkSync(saved); fs.unlinkSync(dir + 'cap11-saved.ifc'); } catch { /* */ }
    }
  }
  if (process.argv.includes('--writepair')) {   // Save's own writer (ifc-native.js writePair: the project file + its IFC), timed; a failure is reported, not hidden
    const u = await page.evaluate(() => (performance.getEntriesByType('resource').find((e) => /\/civilcraft\/dev\/ifc-native\.js/.test(e.name)) || {}).name || new URL('ifc-native.js', document.querySelector('script[src*="civilcraft/dev/"]')?.src || location.href).href);
    const n3 = await ltN();
    out.save = await page.evaluate(async (u) => { try { const { writePair } = await import(u); const t = performance.now(), r = await writePair(window.civilcraft.project, { stem: 'cap11' }); return { ok: true, ms: Math.round(performance.now() - t), jsonMB: +(r.jsonText.length / 1048576).toFixed(1), ifcMB: +(r.ifcText.length / 1048576).toFixed(1) }; } catch (e) { return { ok: false, error: String(e && e.message || e).slice(0, 200) }; } }, u);
    Object.assign(out.save, await lt(n3), await mem());
    log('save (writePair): ' + JSON.stringify(out.save));
  }
  out.errors = errors.filter((e) => !/429|hardware|connect-auto/.test(e));
  log(out.errors.length ? 'errors: ' + out.errors.join(' | ') : 'no console errors');
  if (out.errors.length || !out.edit?.ok) code = 1;
} catch (e) { log('ERROR ' + (e.stack || e.message)); out.error = e.message; code = 2; }
finally {
  await browser.close();
  fs.mkdirSync(path.join(REPO, 'tmp'), { recursive: true });
  fs.writeFileSync(path.join(REPO, 'tmp', 'civil-cap11-' + out.file.replace(/\W+/g, '_') + (BEFORE ? '-before' : '') + '.json'), JSON.stringify(out, null, 1));
}
process.exit(code);
