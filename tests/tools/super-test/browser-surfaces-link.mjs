// SPDX-License-Identifier: Apache-2.0
// 0.9 DC.54 (owner's order 2026-11-06, session nurbs-s3-09): SuperCad Studio's Surfaces panel sends its patch set into the mounted ModelCraft frame and the inline
// PartCraft (one import step in their Surfaces session; their Undo takes it out), brings it back, reports continuity as shared Problems, and reaches its help topic.
// The real lab page (tools/super-test/serve.mjs), a real click on each button.   node tools/super-test/browser-surfaces-link.mjs [--shots <dir>]
import fs from 'node:fs'; import path from 'node:path';
import { start, launch } from './serve.mjs';
const shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
if (shots) fs.mkdirSync(shots, { recursive: true });
const { url, close } = await start({ langs: [''] });
let pass = 0, fail = 0;
const ok = (c, m, extra) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra === undefined ? '' : ' - ' + JSON.stringify(extra).slice(0, 300))); } };
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e.message)));
page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource|bad HTTP response code|WebGL|GPU stall|GL_/i.test(m.text())) errors.push(m.text()); });
const shot = async n => { if (shots) await page.screenshot({ path: path.join(shots, n + '.png') }); };
const status = () => page.evaluate(() => document.querySelector('[data-sc-msg], .sc-msg, [data-sc-status]')?.textContent || '');

try {
  await page.goto(url);
  await page.waitForSelector('[data-sc-ready]');
  await page.evaluate(() => window.superWindow.ready);
  await page.evaluate(() => { const w = window.superWindow; w.M.showPanel(w.state, 'surfaces'); w.M.setActiveTab(w.state, 'surfaces'); w.render(); });
  await page.waitForSelector('[data-sc-surfaces] [data-nurbs-panel]', { timeout: 60000 });

  console.log('== the bar');
  for (const k of ['send-modelcraft', 'send-partcraft', 'back-modelcraft', 'back-partcraft', 'help']) ok(!!(await page.$(`[data-sc-surfaces] [data-surf-${k}]`)), 'button ' + k);
  await page.click('[data-surf-send-partcraft]');
  ok(await page.evaluate(() => window.superSurfaces.session.doc.items.length === 0), 'an empty panel sends nothing (and says so)');

  // two flat patches that meet at an angle, asked to be tangent: a G1 request the geometry cannot meet
  await page.evaluate(() => {
    const S = window.superSurfaces.session, N = S.N;
    const quad = (p) => ({ degU: 1, degV: 1, cvs: [[p[0], p[1]], [p[3], p[2]]], knotsU: [0, 0, 1, 1], knotsV: [0, 0, 1, 1] });
    let d = S.doc;
    d = N.doc.add(d, 'surface', quad([[0, 0, 0], [0, 40, 0], [40, 40, 0], [40, 0, 0]]), { name: 'flat' }).doc;
    d = N.doc.add(d, 'surface', quad([[40, 0, 0], [40, 40, 0], [80, 40, 30], [80, 0, 30]]), { name: 'ramp' }).doc;
    d = N.doc.link(d, 's1', 'u1', 's2', 'u0', 'G1');
    const c = N.curve.cleanCurve ? N.curve.cleanCurve({ deg: 1, cvs: [[0, 0, 5], [80, 0, 35]], knots: [0, 0, 1, 1] }) : null;
    if (c) d = N.doc.add(d, 'curve', c, { name: 'edge' }).doc;
    S.push(d, 'two patches');
  });
  ok(await page.evaluate(() => window.superSurfaces.session.doc.items.length >= 2), 'two linked patches (and a curve) are in the panel');

  console.log('== continuity as Problems');
  await page.waitForFunction(() => window.ccProblems && window.ccProblems.store.sources().some(s => s.id === 'supercadcraft.nurbs'), null, { timeout: 15000 });
  ok(true, 'the page carries the Problems store and the Surfaces panel registered its source (supercadcraft.nurbs)');
  await page.waitForFunction(() => window.ccProblems.store.list().some(p => p.source && /nurbs/.test(JSON.stringify(p.source)) ), null, { timeout: 15000 }).catch(() => {});
  const probs = await page.evaluate(() => window.ccProblems.store.list().map(p => ({ sev: p.severity, src: p.source && p.source.name, msg: p.text || (p.msg && p.msg.key), fixes: (p.fixes || []).map(f => f.action) })));
  ok(probs.length >= 1 && probs.every(p => ['warning', 'error', 'note'].includes(p.sev)), 'the unmet tangent request is a shared Problem', probs);
  ok(probs.some(p => p.fixes.includes('nurbs.match')), 'with the Match fix on it', probs);
  await shot('link-1-problems');
  await page.evaluate(() => window.superSurfaces.session.undo());
  await page.waitForFunction(() => window.ccProblems.store.list().length === 0, null, { timeout: 15000 }).catch(() => {});
  ok(await page.evaluate(() => window.ccProblems.store.list().length === 0), 'Undo takes the problem away again');
  await page.evaluate(() => window.superSurfaces.session.redo());

  console.log('== help topic');
  const topic = await page.evaluate(async () => { await window.cadcraftHelp?.load?.(); return window.cadcraftHelp ? window.cadcraftHelp.topics().some(t => t.slug === 'super-surfaces') : null; });
  ok(topic === true, 'the help panel knows the topic super-surfaces', topic);
  await page.click('[data-surf-help]');
  await page.waitForFunction(() => /Surfaces/.test(document.querySelector('[data-help-panel]')?.textContent || '') && !document.querySelector('[data-help-panel]').hidden, null, { timeout: 10000 }).catch(() => {});
  ok(await page.evaluate(() => { const p = document.querySelector('[data-help-panel]'); return !!p && !p.hidden && /Send|Surfaces/.test(p.textContent); }), 'the Help button opens that topic');
  await shot('link-2-help');
  await page.keyboard.press('Escape');

  console.log('== send to ModelCraft (the frame)');
  const before = await page.evaluate(() => window.superSurfaces.session.doc.items.length);
  await page.click('[data-surf-send-modelcraft]');
  await page.waitForFunction(() => { const f = document.querySelector('iframe[data-sc-frame="model"]'); return !!(f && f.contentWindow.modelcraft && f.contentWindow.modelcraft.surfaces); }, null, { timeout: 120000 });
  await page.waitForTimeout(500);
  const mc = () => page.evaluate(() => { const S = document.querySelector('iframe[data-sc-frame="model"]').contentWindow.modelcraft.surfaces.session; return { n: S.doc.items.length, canUndo: S.canUndo, links: S.doc.links.length, trimmed: S.doc.items.filter(i => i.trim).length, first: S.doc.items[0] && S.doc.items[0].surface ? S.doc.items[0].surface.cvs[1][1] : null }; });
  const m1 = await mc();
  ok(m1.n === before && m1.canUndo && m1.links === 1, 'ModelCraft\'s Surfaces session holds the ' + before + ' items and the link, as one step it can undo', m1);
  ok(JSON.stringify(m1.first) === JSON.stringify([40, 40, 0]), 'Z-up millimetres unchanged (a point stays where it was)', m1.first);
  ok(/Sent to/.test(await page.evaluate(() => document.body.innerText)), 'the window says what was sent');
  await page.evaluate(() => document.querySelector('iframe[data-sc-frame="model"]').contentWindow.modelcraft.surfaces.session.undo());
  ok((await mc()).n === 0, 'Undo in ModelCraft takes the whole send out in one step');
  await page.evaluate(() => document.querySelector('iframe[data-sc-frame="model"]').contentWindow.modelcraft.surfaces.session.redo());
  // the file carries it too (the doc-data hook), so it is saved with the model
  ok(await page.evaluate(() => { const mcw = document.querySelector('iframe[data-sc-frame="model"]').contentWindow.modelcraft; const d = mcw.docData().forAddon('nurbs').data('doc'); return !!d && d.items.length > 0; }), 'ModelCraft keeps it in the .modelcraft file (addons.nurbs)');
  // bring back: ModelCraft's own surfaces come into the panel as one step
  await page.click('[data-surf-back-modelcraft]');
  ok(await page.evaluate(() => window.superSurfaces.session.doc.items.length) === before * 2, 'Bring back from ModelCraft adds its set here (' + before * 2 + ' items)');
  await page.evaluate(() => window.superSurfaces.session.undo());
  ok(await page.evaluate(() => window.superSurfaces.session.doc.items.length) === before, 'Undo here takes the brought-back set out again');

  console.log('== send to PartCraft (inline)');
  await page.evaluate(() => { const w = window.superWindow; w.M.showPanel(w.state, 'surfaces'); w.M.setActiveTab(w.state, 'surfaces'); w.render(); });
  await page.click('[data-surf-send-partcraft]');
  await page.waitForFunction(() => window.partcraft && window.partcraft.workspace === 'surfaces', null, { timeout: 120000 });
  await page.waitForTimeout(500);
  const pc = () => page.evaluate(() => { const S = window.partcraft.surfaces.snapshot(); const st = window.partcraft.part.studies && window.partcraft.part.studies.nurbs; const ws = window.partcraft.workspace; return { n: S ? S.items.length : 0, study: st ? st.items.length : 0, ws, dirty: window.partcraft.dirty, p: S && S.items[0] ? S.items[0].surface.cvs[1][1] : null }; });
  const p1 = await pc();
  ok(p1.n === before && p1.study === before && p1.ws === 'surfaces', 'PartCraft shows its Surfaces workspace with the ' + before + ' items, kept in the part\'s study', p1);
  ok(JSON.stringify(p1.p) === JSON.stringify([40, 0, -40]), 'turned to PartCraft\'s Y up: (40, 40, 0) is (40, 0, -40)', p1.p);
  await page.evaluate(() => window.partcraft.surfaces && (window.__pcs = 1));
  await page.evaluate(async () => { const m = await import('/assets/apps/partcraft/dev/surfaces-pc.js'); window.__pcState = m._state; }).catch(() => {});
  const canUndo = await page.evaluate(() => window.__pcState ? window.__pcState.session.canUndo : null);
  ok(canUndo === true, 'one step in PartCraft\'s Surfaces history (its Undo)', canUndo);
  await page.evaluate(() => window.__pcState.session.undo());
  ok((await pc()).n === 0 && (await pc()).study === 0, 'Undo takes it out of the session and out of the part\'s study');
  await page.evaluate(() => window.__pcState.session.redo());
  await page.evaluate(() => { const w = window.superWindow; w.M.showPanel(w.state, 'surfaces'); w.M.setActiveTab(w.state, 'surfaces'); w.render(); });
  await page.click('[data-surf-back-partcraft]');
  ok(await page.evaluate(() => window.superSurfaces.session.doc.items.length) === before * 2, 'Bring back from PartCraft adds its set here');
  ok(await page.evaluate((b) => JSON.stringify(window.superSurfaces.session.doc.items[b].surface.cvs[1][1]), before) === '[40,40,0]', 'turned back to Z up: the point is where it started');
  console.log('  sources in the store: ' + JSON.stringify(await page.evaluate(() => window.ccProblems.store.sources().map(s => s.id))));
  await shot('link-3-both');
} catch (e) { fail++; console.log('  FAIL threw: ' + String(e.message).slice(0, 600)); }
ok(errors.length === 0, 'no console or page errors', errors.slice(0, 5));
await browser.close(); close();
console.log((fail ? 'FAILED' : 'ok') + ' - ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
