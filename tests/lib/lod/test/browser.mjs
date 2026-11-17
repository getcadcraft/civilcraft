// SPDX-License-Identifier: Apache-2.0
/**
 * browser.mjs: the LOD framework on the real /lab page (0.10 BK.13, 14, 17, 87-93, 95, 100, 101, 150, 151; session bim-lod-10).
 * Run as root, ONE browser at a time:   nice -n 10 timeout 600 node lib/lod/test/browser.mjs [--shots <dir>]
 * Built on the shared harness tools/bimcraft-test/bk-page.mjs (read only). bimcraft.js is not this session's: the page is given
 * the MOUNT LINES (the ones posted to docs/0.10-sessions/closing.md § Inbox for bim-core-10) by a request interception, so the real
 * module graph and the real model run, and nothing in the repo is edited. Once bim-core-10 lands the lines, PATCH can be turned off
 * with --no-patch and the same checks must pass on the page as served.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openLab, REPO, BASE } from '../../../tools/bimcraft-test/bk-page.mjs';

const FIXTURE = path.join(REPO, 'fixtures/bimcraft/small-house.ifc');
const PATCH = !process.argv.includes('--no-patch');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-lod10-'));
const L = await openLab({ tag: 'bimlod10', units: 'mm', viewport: { width: 1600, height: 1400 } });
const { page, ok } = L;
if (process.argv.includes('--stacks')) page.on('pageerror', (e) => console.log('  STACK ' + String(e.stack).slice(0, 1200)));
const status = () => page.textContent('[data-status]');

/** The five mount lines (docs/0.10-sessions/bim-lod-10.md § Mount lines), applied to the served bimcraft.js text. */
export function patch(src) {
  const rep = (a, b) => { if (!src.includes(a)) throw new Error('mount anchor missing: ' + a); src = src.replace(a, a + b); };
  rep("import { mountAudit } from './audit-ui.js';", "\nimport { mountLod } from './lod/lod-ui.js';   // 0.10 BK.13 / 14 / 17 / 87-93 / 95 / 100 / 101 / 150 / 151 (bim-lod-10): the LOD framework");
  rep('let verifyUi = null, auditUi = null;', '\n  let lodUi = null;   // 0.10 bim-lod-10: lod/lod-ui.js');
  rep('if (editor) verifyUi?.decorate(ui.props, [id]);', "\n    if (editor) lodUi?.decorate(ui.props, [id]);   // 0.10 BK.13 / BK.14 / BK.100: Properties › Level of development (lod/lod-ui.js)");
  rep('auditUi?.changed();', '\n    lodUi?.changed();   // 0.10 bim-lod-10: another model: the last milestone check goes');
  const m = /\n  auditUi = mountAudit\(/.exec(src);
  if (!m) throw new Error('mount anchor missing: auditUi = mountAudit(');
  src = src.slice(0, m.index) + "\n  if (modelUi) lodUi = mountLod({ root, modelUi, editor: () => (mode === 'ifc' ? editor : null), model: () => (mode === 'ifc' ? model : null), t, status: (text, isError) => status(text, isError) });   // 0.10 bim-lod-10 (lod/lod-ui.js): Properties › Level of development, Model checks › LOD milestones" + src.slice(m.index);
  return src;
}

try {
  if (PATCH) {
    // the service worker answers module requests before the page's routing sees them: drop it (and its caches) and keep it from registering again
    await page.addInitScript(() => { try { navigator.serviceWorker.register = () => new Promise(() => {}); } catch (e) { /* none */ } });
    await page.evaluate(async () => { for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister(); for (const k of await caches.keys()) await caches.delete(k); });
    await page.route(/\/assets\/apps\/bimcraft\/dev\/bimcraft\.js(\?.*)?$/, async (route) => {
      const r = await route.fetch();
      await route.fulfill({ response: r, body: patch(await r.text()), headers: { ...r.headers(), 'cache-control': 'no-store' } });
    });
    await page.reload({ waitUntil: 'networkidle' });
  }
  console.log('== the page, ' + (PATCH ? 'with the mount lines' : 'as served'));
  await page.setInputFiles('[data-file]', FIXTURE);
  await L.waitStatus(/^Opened /, 120000);
  if (!(await page.evaluate(() => !!window.bimcraftPlan?.state?.on))) await page.click('[data-model-toggle]');
  await page.waitForFunction(() => window.bimcraftPlan?.state?.on && window.bimcraftPlan.state.data?.walls?.length === 5, null, { timeout: 120000 });
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(400);
  await L.settled();
  ok(await page.evaluate(() => !!window.bimcraftLod), 'the LOD module is mounted (window.bimcraftLod)');
  ok(await page.locator('[data-lod-open]').count() === 1 && await page.locator('[data-lod-details]').count() === 1, 'Model checks › LOD milestones is in the left panel, with its link under Audit');

  console.log('== BK.13 + BK.87-92: Properties › Level of development on a wall');
  await L.mouseClick(4000, 0);   // the south wall between its door and its window
  await page.waitForSelector('[data-lod]');
  await page.evaluate(() => { const d = document.querySelector('[data-lod]'); if (!d.open) d.open = true; });
  ok(await page.locator('[data-lod-select] option').count() === 7, 'the chooser lists Not set and the six levels', await page.locator('[data-lod-select] option').allTextContents());
  const opts = await page.locator('[data-lod-select] option').allTextContents();
  ok(opts.includes('LOD 100 · Symbol or generic representation') && opts.includes('LOD 350 · Interfaces coordinated') && opts.includes('LOD 500 · Field-verified, as built'), 'each level is named by what it means');
  ok(/IfcWall/.test(await page.textContent('[data-lod]')), 'the IFC class is shown');
  ok(await page.locator('[data-lod-part]').count() === 3 && await page.locator('[data-lod-mark]').count() === 3, 'three parts, three marks');
  ok(await page.getAttribute('[data-lod-state]', 'data-lod-state') === 'none', 'a wall with no tag says it has no LOD yet');
  await page.selectOption('[data-lod-select]', '300');
  await L.waitStatus(/LOD set on 1 elements/); await L.settled();
  await page.waitForSelector('[data-lod]');
  ok(await page.getAttribute('[data-lod-state]', 'data-lod-state') === 'element' && /LOD 300, set on this element/.test(await page.textContent('[data-lod-state]')), 'LOD 300 set on the element');
  ok(/Specific and measurable|specific element as designed/i.test(await page.textContent('[data-lod]')) && /Each level includes everything below it/.test(await page.textContent('[data-lod]')), 'what LOD 300 means and that it includes the levels below');
  console.log('== BK.14: three parts');
  await page.selectOption('[data-lod-part="geometry"]', '300');
  await L.waitStatus(/LOD set on 1 elements/); await L.settled();
  await page.selectOption('[data-lod-part="information"]', '200');
  await L.waitStatus(/LOD set on 1 elements/); await L.settled();
  await page.waitForSelector('[data-lod-mark="geometry"]');
  const marks = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-lod-mark]')].map((m) => [m.dataset.lodMark, m.dataset.state])));
  ok(marks.geometry === 'met' && marks.information === 'below' && marks.documentation === 'not-stated', 'geometry met, information below, documentation not stated', marks);
  const inFile = await page.evaluate(async () => { const { ModelWriter } = await import('/assets/apps/bimcraft/dev/model-write.js'); const A = window.bimcraftRes.api, e = A.ed(), w = new ModelWriter(e.W, e.api, e.mid); const id = A.selectedKeys()[0] - A.kb(); return w.readPset(id, 'CadCraft_LOD'); });
  ok(inFile && inFile.LOD === 300 && inFile.LODGeometry === 300 && inFile.LODInformation === 200 && !('LODDocumentation' in inFile), 'in the file: plain integers in CadCraft_LOD', inFile);
  ok((await L.changes()).filter((c) => /Level of development/.test(c)).length === 3, 'each choice is one undo step', await L.changes());
  await L.shot('lod10-01-properties');
  console.log('== BK.100: detail apart from development');
  ok(await page.getAttribute('[data-lod-two]', 'data-lod-two') !== null && /How much is drawn/.test(await page.textContent('[data-lod-two]')) && /How far developed/.test(await page.textContent('[data-lod-two]')), 'two columns: how much is drawn, how far developed');

  console.log('== BK.17 + BK.150: the milestone check');
  await page.evaluate(() => document.querySelector('[data-lod-open]').click());
  await page.waitForSelector('[data-lod-run]');
  ok(/CadCraft starting table/.test(await page.textContent('[data-lod-table-name]')) && /not a standard/i.test(await page.textContent('[data-lod-details]')), 'starts from the starting table, and says it is not a standard');
  await page.selectOption('[data-lod-milestone]', 'dd');
  await page.click('[data-lod-run]');
  await L.waitStatus(/^Milestone check done/);
  // worked in lib/lod/test/adapter.mjs (floors, roofs and ceilings have no tag either, so untagged is 4 walls and more): at DD the starter table asks 300 of walls, doors, windows; the house has 5 walls (one at 300), 2 doors and 3 windows at LOD 200
  const tt = await page.evaluate(() => { const e = document.querySelector('[data-lod-totals]'); return { reached: +e.dataset.reached, notReached: +e.dataset.notReached, untagged: +e.dataset.untagged }; });
  ok(tt.reached === 1 && tt.notReached === 5 && tt.untagged >= 4, 'DD: the tagged wall reached it, 5 doors and windows have not, the 4 other walls (and floors, roof) have no LOD', JSON.stringify(tt));
  const pr = await page.evaluate(() => window.ccProblems.store.list({}).filter((p) => p.id.startsWith('bimcraft.lod:')).map((p) => p.code + ':' + p.severity));
  ok(pr.filter((x) => x === 'lod.below:warning').length === tt.notReached && pr.includes('lod.untagged:note') && !pr.some((x) => /error/.test(x)), 'findings are in the shared Problems list: warnings and one note, never an error', pr);
  const acc = await page.evaluate(() => { const p = window.ccProblems.store.list({}).find((x) => x.id.startsWith('bimcraft.lod:')); return !!window.ccProblems.store.accept(p.id, { by: 'Test' }); });
  ok(acc, 'a finding can be accepted like any other (advisory, nothing blocked)');
  await page.selectOption('[data-lod-milestone]', 'sd');
  await page.click('[data-lod-run]'); await L.waitStatus(/^Milestone check done/);
  ok(await page.getAttribute('[data-lod-totals]', 'data-not-reached') === '0', 'SD asks 200 of doors and windows: nothing below it');
  console.log('== BK.101: staying generic early is advice only');
  ok(await page.locator('[data-lod-advice]').count() === 1 && /more developed than LOD 200/.test(await page.textContent('[data-lod-advice]')), 'at SD the one LOD 300 wall gets the "stay generic" note');
  ok((await page.evaluate(() => window.bimcraftRes.api.ed().changes.length)) === (await L.changes()).length, 'the check changed nothing in the model');
  await L.shot('lod10-02-milestones');
  console.log('== BK.17: a loaded table');
  const csv = path.join(TMP, 'office.csv');
  fs.writeFileSync(csv, 'name,ifc,system,code,sd,dd\nAll doors,IfcDoor,,,100,350\nBad,,,,200,200\nWalls,IfcWall,,,200,300\n');
  await page.setInputFiles('[data-lod-file]', csv);
  await page.waitForFunction(() => /office/.test(document.querySelector('[data-lod-table-name]')?.textContent || ''));
  ok(/loaded with 1 notes/.test(await status()) && await page.locator('[data-lod-table-problems]').count() === 1, 'the office table loads; the row with no class or code is said, not guessed');
  await page.selectOption('[data-lod-milestone]', 'dd'); await page.click('[data-lod-run]'); await L.waitStatus(/^Milestone check done/);
  const tt2 = await page.evaluate(() => { const e = document.querySelector('[data-lod-totals]'); return { notReached: +e.dataset.notReached, checked: +e.dataset.checked }; });
  ok(tt2.checked === 7 && tt2.notReached === 2, 'the office table asks 350 of the 2 doors and 300 of walls: 7 checked, the 2 doors below', tt2);

  console.log('== BK.151: fix lists');
  await page.evaluate(() => { const A = window.bimcraftRes.api, e = A.ed(); const dg = window.bimcraftPlan.state.data.openings.find((o) => o.kind === 'door'); window.__door = dg.guid; });
  await page.evaluate(async () => { const { ModelWriter } = await import('/assets/apps/bimcraft/dev/model-write.js'); const A = window.bimcraftRes.api, e = A.ed(); e.modelChange((ed) => new ModelWriter(ed.W, ed.api, ed.mid).run((w) => { const id = w.byGuid(window.__door); const l = w.touch(id); l.Tag = null; w.write(l); return { id, ids: [id] }; })); });
  await L.settled();
  await page.click('[data-lod-find]');
  await page.waitForSelector('[data-lod-fix-tag]');
  const prop = await page.inputValue('[data-lod-fix-tag]');
  ok(/^D\d+$/.test(prop), 'a missing door mark is proposed, continuing the pattern', prop);
  await page.click('[data-lod-apply]');
  await L.waitStatus(/Applied to 1 elements in one step/); await L.settled();
  ok(await page.locator('[data-lod-fix-none]').count() === 1, 'found again: nothing left to fix');

  console.log('== every request stayed on this site; no console errors');
  ok([...L.hosts.keys()].every((h) => /getcadcraft\.com$/.test(h)), 'hosts', [...L.hosts.keys()]);
  const errs = L.problems.filter((p) => !/favicon|Failed to load resource/.test(p));
  ok(errs.length === 0, 'no console errors', errs.slice(0, 3));
} catch (e) { ok(false, 'the run stopped: ' + String(e.message || e).slice(0, 600)); await L.shot('lod10-stopped').catch(() => {}); }
const code = L.done();
await L.close();
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(code);
