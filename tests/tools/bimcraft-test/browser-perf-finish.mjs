#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-perf-finish.mjs — the real /lab/bimcraft page (perf-finish-11, lane bim; PERF.8 / 23 / 24). Per IFC:
 *   1 the geometry worker path (default) and the page path (window.ccIfcGeoWorker = false) give the same model: every batch's positions, normals,
 *     indices, triangle keys and element runs, the counts, the coordination matrix; the worker path says geometryIn 'worker'
 *   2 progressive display: preview meshes are on screen before "Opened", none after; the model draws, picks (hitAt) and cuts (setSection)
 *   3 an edit (Name) rebuilds through the worker and the model is still the same geometry; Save (IfcFile.save, coalesced ranges) gives the bytes
 *     the old line-by-line save gives (compared in the page with a copy of it)
 *   node tools/bimcraft-test/browser-perf-finish.mjs [file.ifc …]     run as root; default: two showcase models (small, for the VPS)
 */
import { openLab } from '../shell-test/lab-page.mjs';

const FILES = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const LIST = FILES.length ? FILES : ['/var/www/CADCRAFT/getcadcraft.com/fixtures/showcase/bimcraft-house.ifc', '/var/www/CADCRAFT/getcadcraft.com/fixtures/showcase/bimcraft-office-5-storey.ifc'];
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + (typeof d === 'string' ? d : JSON.stringify(d)) + ')' : '')); } };
const lab = await openLab('perffinishbim');

const DIGEST = async () => {
  const v = document.querySelector('[data-canvas]').viewer, L = [...v.layers.values()][0], m = L.model;
  const h = async (a) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', a))].slice(0, 10).map((x) => x.toString(16).padStart(2, '0')).join('');
  const parts = [];
  for (const b of m.batches) {
    parts.push(b.storey + '|' + b.space + '|' + b.color.join(','));
    for (const a of [b.positions, b.normals, b.indices, b.triIds, b.elems.ids, b.elems.t0, b.elems.tn, b.elems.v0, b.elems.vn]) parts.push(await h(a));
  }
  const ed = window.bimcraftLive.editor;
  return { geo: await h(new TextEncoder().encode(parts.join(';'))), batches: m.batches.length, elements: m.elements, spaces: m.spaces, triangles: m.triangles, C: ed.api.GetCoordinationMatrix(ed.mid).map((x) => +x.toFixed(9)).join(','), via: ed.model?.geometryIn || null };
};

async function openOne(file, mode) {
  const { ctx, page } = await lab.page('bimcraft', { layout: 'standard', viewport: { width: 1400, height: 900 }, storage: { 'bimcraft.model.units': 'mm' }, prepare: false });
  const errs = []; page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|status of 429/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  await page.evaluate((mode) => {
    if (mode === 'page') window.ccIfcGeoWorker = false;
    window.__prev = { max: 0, beforeOpened: 0 };
    const look = () => { const v = document.querySelector('[data-canvas]')?.viewer; const st = [...document.querySelectorAll('[data-status], [role="status"]')].map((e) => e.textContent).join(' '); if (v && v.previewCount > window.__prev.max) { window.__prev.max = v.previewCount; if (!/Opened/.test(st)) window.__prev.beforeOpened = v.previewCount; } if (!window.__stop) requestAnimationFrame(look); };
    requestAnimationFrame(look);
  }, mode);
  await page.setInputFiles('[data-file]', file);
  await page.waitForFunction(() => /Opened .*element/.test([...document.querySelectorAll('[data-status], [role="status"]')].map((e) => e.textContent.trim()).join(' ')), null, { timeout: 240000 });
  await page.evaluate(() => { window.__stop = true; });
  return { ctx, page, errs };
}

try {
  for (const file of LIST) {
    const name = file.split('/').pop();
    console.log('== ' + name);
    const P = await openOne(file, 'page');
    const a = await P.page.evaluate(DIGEST);
    const pPrev = await P.page.evaluate(() => window.__prev);
    ok(!P.errs.length, name + ': page path, no page error', P.errs);
    await P.ctx.close();
    const W = await openOne(file, 'worker');
    const pg = W.page;
    const b = await pg.evaluate(DIGEST);
    const prev = await pg.evaluate(() => ({ ...window.__prev, now: document.querySelector('[data-canvas]').viewer.previewCount || 0, meshes: document.querySelector('[data-canvas]').viewer.meshes.length }));
    ok(a.geo === b.geo && a.triangles === b.triangles && a.batches === b.batches && a.elements === b.elements && a.spaces === b.spaces && a.C === b.C, `${name}: worker model = page model (${b.elements} elements, ${b.spaces} spaces, ${b.triangles} triangles, ${b.batches} batches, ${b.geo})`, { a, b });
    ok(pPrev.max === 0, name + ': the page path draws no preview (it has no pieces to show)', pPrev);
    ok(prev.beforeOpened > 0 && prev.now === 0 && prev.meshes === b.batches, `${name}: progressive display: ${prev.beforeOpened} preview meshes on screen before "Opened", none after, ${prev.meshes} batch meshes`, prev);
    ok(b.via === 'worker' && a.via === 'page', name + ': geometry made in the ' + b.via + ' (worker path) and the ' + a.via + ' (page path)', { a: a.via, b: b.via });
    // picking and a section on the worker's model
    const pick = await pg.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer, r = v.canvas.getBoundingClientRect(); let hits = 0; for (let i = 0; i < 25; i++) { const h = v.hitAt(r.left + r.width * (0.3 + 0.02 * i), r.top + r.height * 0.5); if (h) hits++; } const B = v.secBox(); v.setSection({ axis: 'top', offset: (B.max.y - B.min.y) / 2 }); const calls = v.renderer.info.render.calls; v.setSection(null); return { hits, calls }; });
    ok(pick.hits > 0, name + ': picking hits the model (' + pick.hits + ' of 25 rays)', pick);
    // the save: new ranges = the old line-by-line save, unchanged and after an edit
    const saveSame = async () => pg.evaluate(() => {
      const ed = window.bimcraftLive.editor, f = ed.api.file(ed.mid), enc = new TextEncoder(), TS = { timeStamp: '2026-01-01T00:00:00' };
      const old = () => { const ch = []; let n = 0; const put = (x) => { const u = typeof x === 'string' ? enc.encode(x) : x; ch.push(u); n += u.length; };
        put('ISO-10303-21;\nHEADER;\n'); put(f.headerText(TS.timeStamp)); put('ENDSEC;\nDATA;\n');
        const ix = f.ix, B = f.bytes; for (let i = 0; i < ix.count; i++) { const id = ix.ids[i]; if (f.gone.has(id)) continue; const e = f.edits.get(id); if (e) { if (f.rec(id) === i) put(f.formatLine(id, e.type, e.params) + '\n'); continue; } put('#' + id + '=' + ix.names[ix.types[i]]); put(B.subarray(ix.starts[i], ix.ends[i] + 1)); put(new Uint8Array([10])); }
        for (const id of f.newIds()) { const e = f.edits.get(id); put(f.formatLine(id, e.type, e.params) + '\n'); } put('ENDSEC;\nEND-ISO-10303-21;\n');
        const o = new Uint8Array(n); let k = 0; for (const c of ch) { o.set(c, k); k += c.length; } return o; };
      const x = old(), y = f.save(TS);
      let same = x.length === y.length; for (let i = 0; same && i < x.length; i++) if (x[i] !== y[i]) same = false;
      return { same, bytes: y.length, renamed: new TextDecoder().decode(y).includes('perf-finish renamed') };
    });
    const s0 = await saveSame();
    ok(s0.same, name + ': Save (byte ranges) = the old save, unchanged model (' + s0.bytes + ' bytes)', s0);
    const target = await pg.evaluate(() => { const ed = window.bimcraftLive.editor; const l = ed.api.GetLineIDsWithType(ed.mid, ed.W.IFCWALL); const m = l.size() ? l : ed.api.GetLineIDsWithType(ed.mid, ed.W.IFCSLAB); return m.size() ? m.get(0) : 0; });
    if (target) {
      await pg.evaluate((id) => { const ed = window.bimcraftLive.editor; ed.setAttribute(id, 'Name', 'perf-finish renamed'); window.bimcraftLive.refresh(true); }, target);
      await pg.waitForFunction(() => { const v = document.querySelector('[data-canvas]').viewer; const L = [...v.layers.values()][0]; return L && L.model && !/Updating/i.test([...document.querySelectorAll('[data-status], [role="status"]')].map((e) => e.textContent).join(' ')); }, null, { timeout: 120000 });
      await pg.waitForTimeout(1500);
      const c = await pg.evaluate(DIGEST);
      ok(c.geo === b.geo && c.triangles === b.triangles, name + ': after a Name edit and a rebuild (through the worker) the geometry is the same', { b: b.geo, c: c.geo });
      const s1 = await saveSame();
      ok(s1.same && s1.renamed, name + ': Save after the edit = the old save (' + s1.bytes + ' bytes)', s1);
    }
    ok(!W.errs.length, name + ': worker path, no page error', W.errs);
    await W.ctx.close();
  }
} finally { await lab.close(); }
console.log(`perf-finish bim page test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
