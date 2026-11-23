#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-stages.mjs: the "Project stages" section (dev/stages/stages-ui.js) in a real browser on the real /lab page, headless (0.10 W1.10, session stages-10):
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-stages.mjs [--shots <dir>]      run as root (a test admin session)
 * The section is not mounted in bimcraft.js yet (a line in docs/0.10-sessions/closing.md § Inbox for bim-core-10), so this test mounts it itself:
 * it loads the page for its import map and engine, makes its own IfcEditor and gives mountStages a host. It drives every control with the mouse
 * and the keyboard: the brief, the accommodation schedule, options against the brief, details on types, shop drawings, site instructions,
 * and a new project from a brief.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimstages'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const throttled = new Set();
page.on('response', (r) => { if (r.status() === 429) throttled.add(r.url()); });
const D = '/assets/apps/bimcraft/dev/';
const text = (sel) => page.textContent(sel);
const openSec = async (key) => { if (!(await page.evaluate((k) => document.querySelector(`[data-st-sec="${k}"]`)?.open, key))) await page.click(`[data-st-sec="${key}"] > summary`); };
const rows = (sel) => page.$$eval(sel, (r) => r.map((x) => x.dataset.stStatus + '|' + [...x.querySelectorAll('td')].map((c) => c.textContent.replace(/\s+/g, ' ').trim()).join(' ')));
try {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  const boot = await page.evaluate(async (D) => {
    const imp = (f) => import(D + f);
    const [WebIFC, { IfcModel }, { IfcEditor }, N, OPS, { ModelWriter }, UI] = await Promise.all([imp('ifc/api.js'), imp('ifc-model.js'), imp('ifc-edit.js'), imp('new-model.js'), imp('model-ops.js'), imp('model-write.js'), imp('stages/stages-ui.js')]);
    const make = async (bytes) => { const eng = await IfcModel.create(WebIFC); await eng.load(bytes); return new IfcEditor(WebIFC, eng); };
    const H = { ed: await make(new TextEncoder().encode(N.newBuilding({ name: 'Stages house', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'stages.ifc' }))), sel: [], picked: [], msg: '' };
    document.querySelector('[data-stages-details]')?.remove();   // 0.11: the page mounts its own now (browser-core11 drives that one); this test drives a copy on its own editor
    const anchor = document.createElement('div'); anchor.id = 'st-anchor'; document.body.prepend(anchor);
    const host = { after: anchor, editor: () => H.ed, status: (t, e) => { H.msg = t; }, afterEdit() {}, selection: () => H.sel, select: (g) => { H.picked = g; }, today: () => '2026-11-13', fileName: () => 'stages.ifc', download() {}, WebIFC, IfcModel,
      openNew: async (bytes, name) => { H.ed = await make(bytes); H.opened = name; }, templates: async () => [], issues: () => [] };
    window.__st = { H, OPS, ModelWriter, WebIFC, N, make, mount: UI.mountStages(host), imp };
    return { mounted: !!window.__st.mount };
  }, D);
  ok(boot.mounted, 'the Project stages section mounts on the real page with a real engine');
  await page.evaluate(() => { document.querySelector('.nh-offer [data-k="no"]')?.click(); });
  await page.click('[data-stages-details] > summary');
  await page.waitForSelector('[data-st-sec="brief"]');
  ok((await text('[data-stages-details] > summary')).includes('Project stages'), 'the section has its title and is a closed details until opened');

  console.log('== BK.176 the brief');
  await openSec('brief');
  ok(/No brief yet/.test(await text('[data-st-sec="brief"]')), 'with no brief it says how to start');
  await page.fill('[data-st-rooms-text]', 'Living; 1; 30\nBedroom, 3, 12 m2\nBath\t6\nStudy ; 10\nnonsense line');
  await page.click('[data-st-rooms-add]');
  await page.waitForSelector('[data-st-accommodation]');
  let acc = await rows('[data-st-brief-row]');
  ok(acc.length === 4 && acc.every((r) => r.startsWith('notdrawn|')) && /Bedroom 3 12 36/.test(acc[1]), 'four rooms added in one paste (the nonsense line skipped), none drawn yet', acc);
  ok(/skipped/.test(await page.evaluate(() => window.__st.H.msg)) && /Target 82 m² net/.test(await text('[data-st-totals]')) && /102\.5 m² gross/.test(await text('[data-st-totals]')), 'the status says a line was skipped; totals 82 m² net, about 102.5 gross');
  await page.fill('[data-st-client]', 'A. Client'); await page.fill('[data-st-budget]', '100000'); await page.fill('[data-st-currency]', 'ZAR');
  await page.click('[data-st-brief-save]');
  await page.waitForFunction(() => window.__st.H.msg === 'The brief is saved.');
  const saved = await page.evaluate(() => { const { H, ModelWriter } = window.__st; const w = new ModelWriter(H.ed.W, H.ed.api, H.ed.mid); return w.readPset(H.ed.api.GetLineIDsWithType(H.ed.mid, H.ed.W.IFCPROJECT).get(0), 'CadCraft_Brief'); });
  ok(saved?.Client === 'A. Client' && saved?.Budget === 100000, 'the brief fields are in the IFC project', saved);
  // walls make a room; the person names it
  await page.evaluate(async () => {
    const { H, OPS } = window.__st, snap = OPS.snapshotModel(H.ed), L1 = snap.levels[0];
    H.ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [[0, 0, 6300, 0], [6300, 0, 6300, 5000], [6300, 5000, 0, 5000], [0, 5000, 0, 0]].map(([a, b, c, d]) => ({ a: [a, b], b: [c, d] })), typeKey: 'ext-2x6', height: 2700 }));
    const { nameRoom } = await window.__st.imp('spaces-ops.js'); const sp = OPS.snapshotModel(H.ed).derived.spaces[0];
    H.ed.modelChange(nameRoom(sp.guid, { name: 'Living', number: 'R1' }));
    window.bimcraftStages.render();
  });
  acc = await rows('[data-st-brief-row]');
  ok(acc[0].startsWith('met|') && /1 \/ 1/.test(acc[0]) && /Met/.test(acc[0]) && acc[1].startsWith('notdrawn|'), 'the drawn Living room (about 29.5 m²) MEETS its 30 m² target within 5 %; the bedrooms are not drawn', acc[0]);
  await page.screenshot({ path: SHOTS ? path.join(SHOTS, 'brief.png') : '/dev/null' }).catch(() => {});
  await page.fill('[data-st-tol]', '0'); await page.click('[data-st-brief-save]');
  await page.waitForFunction(() => document.querySelector('[data-st-brief-row] [data-st-status]') || true);
  acc = await rows('[data-st-brief-row]');
  ok(acc[0].startsWith('short|') && /Short -/.test(acc[0]), 'a tolerance of 0 % makes the same room SHORT, with the shortfall in m²', acc[0]);
  await page.fill('[data-st-tol]', '5'); await page.click('[data-st-brief-save]');
  const pr = await page.evaluate(() => window.bimcraftStages.problems());
  ok(pr.every((p) => p.source.name === 'bimcraft.stages') && !pr.some((p) => p.code === 'brief.short'), 'back at 5 %: no brief shortfall in Problems (the others are not drawn, which is not a warning)');
  await page.click('[data-st-brief-row] [data-st-brief-remove] >> nth=3');
  await page.waitForFunction(() => document.querySelectorAll('[data-st-brief-row]').length === 3);
  await page.evaluate(() => window.__st.H.ed.undo());
  await page.evaluate(() => window.bimcraftStages.render());
  ok((await rows('[data-st-brief-row]')).length === 4, 'removing a brief room, then Undo, brings it back');

  console.log('== BK.105 options against the brief');
  await page.evaluate(async () => {
    const { H, imp } = window.__st, MO = await imp('mass-options.js');
    const P = (w, h) => [[0, 0], [w, 0], [w, h], [0, h]];
    H.ed.modelChange(MO.addMassOption({ set: 'Scheme', name: 'Bar', pts: P(20000, 10000), floors: 3, floorHeight: 3200 }));
    H.ed.modelChange(MO.addMassOption({ set: 'Scheme', name: 'Tight', pts: P(8000, 5000), floors: 1, floorHeight: 3200 }));
    window.bimcraftStages.render();
  });
  await openSec('options');
  await page.waitForSelector('[data-st-options-table]');
  let opts = await page.$$eval('[data-st-option]', (r) => r.map((x) => [...x.querySelectorAll('td')].map((c) => c.textContent.replace(/\s+/g, ' ').trim()).join(' ')));
  ok(opts.length === 2 && /Bar \(current\) 3 600 /.test(opts[0]) && /102\.5/.test(opts[0]) && /1 of 6/.test(opts[1]) && /Tight 1 40 /.test(opts[1]), 'two options with their gross area and what the brief asks (102.5 m² gross)', opts);
  ok(await page.$('[data-st-figure] svg polygon') !== null && (await page.$$('[data-st-figure] polygon')).length === 2, 'the picture draws both footprints on one scale');
  await page.click('[data-st-option] [data-st-stack] >> nth=0');
  await page.click('[data-st-option] [data-st-stack] >> nth=1');
  await page.waitForSelector('[data-st-layout]');
  opts = await page.$$eval('[data-st-option]', (r) => r.map((x) => x.dataset.stOption + '|' + [...x.querySelectorAll('td')].map((c) => c.textContent.trim()).join(' ')));
  ok(/6 of 6/.test(opts[0]) && /1 of 6/.test(opts[1]), 'Stack the brief here: Bar takes all 6 rooms, Tight only 1 of 6', opts);
  ok(/Does not fit: 3 × Bedroom, Study, Bath/.test((await page.$$eval('[data-st-layout]', (r) => r.map((x) => x.textContent))).join(' ')), 'the layout under the table names what does not fit');
  await page.screenshot({ path: SHOTS ? path.join(SHOTS, 'options.png') : '/dev/null' }).catch(() => {});

  console.log('== BK.110 / BK.111 types, specification, details');
  await page.evaluate(async () => { const { H, OPS } = window.__st; const wall = OPS.snapshotModel(H.ed).walls[0]; H.ed.modelChange(OPS.placeOpening({ wall: wall.guid, typeKey: 'door-single', offset: 1000, face: 'left' })); window.bimcraftStages.render(); });
  await openSec('types');
  await page.waitForSelector('[data-st-types-table]');
  let types = await rows('[data-st-type]');
  ok(types.length >= 2 && types.some((r) => /Wall type/.test(r) && /No specification text/.test(r) && /No detail linked/.test(r)) && types.some((r) => /Door type/.test(r)), 'the wall type and the door type are listed with what is missing', types);
  const wallRow = await page.$('[data-st-type^="wall:"]');
  const wallId = await wallRow.getAttribute('data-st-type');
  await page.click(`[data-st-type="${wallId}"] [data-st-link-start]`);
  await page.fill('[data-st-l-title]', 'Eaves detail'); await page.fill('[data-st-l-ref]', 'eaves-01.dcraft');
  await page.click('[data-st-link-save]');
  await page.waitForSelector(`[data-st-type="${wallId}"] [data-st-link]`);
  ok(/Eaves detail/.test(await text(`[data-st-type="${wallId}"]`)) && !/No detail linked/.test(await text(`[data-st-type="${wallId}"]`)), 'a detail linked from the page shows on the wall type and the "no detail" note goes');
  await page.click(`[data-st-type="${wallId}"] [data-st-link-start]`);
  await page.fill('[data-st-l-title]', 'Section 9'); await page.fill('[data-st-l-sheet]', 'A-999'); await page.click('[data-st-link-save]');
  await page.waitForFunction((id) => /missing/.test(document.querySelector(`[data-st-type="${id}"]`)?.textContent || ''), wallId);
  ok(/A linked sheet is missing/.test(await text(`[data-st-type="${wallId}"]`)), 'a link to a sheet this model does not have is reported');
  await page.click(`[data-st-type="${wallId}"] [data-st-link] [data-st-unlink] >> nth=1`);
  await page.waitForFunction((id) => !/A linked sheet is missing/.test(document.querySelector(`[data-st-type="${id}"]`)?.textContent || ''), wallId);
  ok(true, 'removing that link clears the note');
  await page.screenshot({ path: SHOTS ? path.join(SHOTS, 'types.png') : '/dev/null' }).catch(() => {});

  console.log('== BK.113 shop drawings');
  const guids = await page.evaluate(() => window.__st.OPS.snapshotModel(window.__st.H.ed).walls.map((w) => w.guid));
  await page.evaluate((g) => { window.__st.H.sel = g.slice(0, 2); window.bimcraftStages.render(); }, guids);
  await openSec('shop');
  ok(/covers the 2 elements/.test(await text('[data-st-shop-form]')), 'the form says it covers the 2 elements selected in the model');
  await page.fill('[data-st-s-title]', 'Steel frame'); await page.fill('[data-st-s-trade]', 'Steel'); await page.fill('[data-st-s-due]', '2026-12-01'); await page.selectOption('[data-st-s-as]', 'markup');
  await page.setInputFiles('[data-st-s-file]', { name: 'frame.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 a shop drawing') });
  await page.click('[data-st-shop-save]');
  await page.waitForSelector('[data-st-shop]');
  let shop = await rows('[data-st-shop]');
  ok(shop.length === 1 && shop[0].startsWith('open|SD-001 Steel frame') && /frame\.pdf/.test(shop[0]) && /Steel/.test(shop[0]) && /A/.test(shop[0]) && /With the reviewer/.test(shop[0]), 'SD-001 received: revision A, with the reviewer, file name kept', shop);
  ok(/2 elements wait/.test(await text('[data-st-waiting]')), 'two elements wait on a review');
  const mark = (g) => page.evaluate((guid) => { const { H, ModelWriter } = window.__st; const w = new ModelWriter(H.ed.W, H.ed.api, H.ed.mid); return w.readPset(w.byGuid(guid), 'CadCraft_ShopDrawing'); }, g);
  ok((await mark(guids[0])).Status === 'open' && (await mark(guids[0])).Ref === 'SD-001', 'the element itself carries the state in the IFC');
  await page.fill('[data-st-review-by]', 'Architect'); await page.fill('[data-st-review-note]', 'Add base plates');
  await page.click('[data-st-review-revise]');
  await page.waitForSelector('[data-st-shop][data-st-status="revise"]');
  ok(/Revise and resubmit/.test(await text('[data-st-shop]')) && /Architect/.test(await text('[data-st-reviews]')) && (await mark(guids[1])).Status === 'revise', 'reviewed "revise": the row, the review history (who, note) and the element say so');
  await page.click('[data-st-resubmit]');
  await page.waitForSelector('[data-st-shop][data-st-status="open"]');
  ok(/\bB\b/.test(await text('[data-st-shop] td:nth-child(4)')) && (await mark(guids[0])).Rev === 'B', 'resubmitted as revision B of the same record');
  await page.click('[data-st-review-approved]');
  await page.waitForSelector('[data-st-shop][data-st-status="approved"]');
  ok(/No element is waiting/.test(await text('[data-st-waiting]')) && (await page.$('[data-st-resubmit]')) === null, 'approved: nothing waits, the action buttons go');
  await page.click('[data-st-shop] [data-st-select]');
  ok(JSON.stringify(await page.evaluate(() => window.__st.H.picked)) === JSON.stringify(guids.slice(0, 2)), 'the element count selects the elements in the model');
  await page.screenshot({ path: SHOTS ? path.join(SHOTS, 'shop.png') : '/dev/null' }).catch(() => {});

  console.log('== BK.178 site instructions');
  await page.evaluate((g) => { window.__st.H.sel = [g[0]]; window.bimcraftStages.render(); }, guids);
  await openSec('si');
  await page.fill('[data-st-i-title]', 'Move the door 300 mm'); await page.selectOption('[data-st-i-cause]', 'site'); await page.fill('[data-st-i-by]', 'Site agent'); await page.fill('[data-st-i-cost]', 'R 4 500');
  await page.click('[data-st-si-save]');
  await page.waitForSelector('[data-st-si]');
  const si = (await rows('[data-st-si]'))[0];
  ok(/SI-001/.test(si) && /Site condition/.test(si) && /cost R 4 500/.test(si) && /Open/.test(si), 'SI-001 recorded with its cause and effect', si);
  const siMark = await page.evaluate((g) => { const { H, ModelWriter } = window.__st; const w = new ModelWriter(H.ed.W, H.ed.api, H.ed.mid); return w.readPset(w.byGuid(g), 'CadCraft_SiteInstruction'); }, guids[0]);
  ok(siMark?.Refs === 'SI-001' && siMark.Cause === 'site', 'the instruction is on the element', siMark);
  await page.click('[data-st-si-close]');
  await page.waitForSelector('[data-st-si][data-st-status="closed"]');
  ok(!(await page.$('[data-st-si-close]')), 'closed');
  await page.evaluate(() => window.__st.H.ed.undo());
  await page.evaluate(() => window.bimcraftStages.render());
  ok((await rows('[data-st-si]'))[0].startsWith('open|'), 'Undo reopens it');

  console.log('== a new project from a brief');
  await openSec('brief');
  await page.click('[data-st-new] > summary');
  await page.fill('[data-st-new-name]', 'Villa brief'); await page.fill('[data-st-new-levels]', '2');
  await page.fill('[data-st-new-rooms]', 'Lounge; 1; 40\nBedroom; 2; 14'); await page.fill('[data-st-new-budget]', '900000'); await page.fill('[data-st-new-client]', 'B. Owner');
  await page.click('[data-st-new-make]');
  await page.waitForFunction(() => window.__st.H.opened === 'Villa brief.ifc' && /started with 2 brief rooms/.test(window.__st.H.msg), null, { timeout: 60000 });
  const nb = await page.evaluate(async () => { const { H, ModelWriter, imp } = window.__st, BR = await imp('stages/brief.js'); return BR.readBrief(new ModelWriter(H.ed.W, H.ed.api, H.ed.mid)); });
  ok(nb.client === 'B. Owner' && nb.budget === 900000 && nb.rooms.length === 2 && nb.rooms[1].count === 2, 'a new model was opened with the brief as its first step', nb);
  await page.evaluate(() => window.bimcraftStages.render());
  ok((await rows('[data-st-brief-row]')).length === 2 && /Target 68 m² net/.test(await text('[data-st-totals]')), 'its accommodation schedule lists the two rooms (40 + 2 x 14 = 68 m² net)');
  await page.screenshot({ path: SHOTS ? path.join(SHOTS, 'new.png') : '/dev/null' }).catch(() => {});

  const real = problems.filter((p) => !(/429/.test(p) && [...throttled].some((u) => /hardware/.test(u))));
  ok(real.length === 0, 'no console errors', real.slice(0, 5));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'stopped.png') }).catch(() => {});
} finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
