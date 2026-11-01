#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-r3.mjs — round 3 in TakeoffCraft at /lab/takeoffcraft (session takeoff_PART_3): the shell's seven modules mounted (calc sheets and design reasons in the
 * file, running totals for cost and carbon, the first lesson, Suggest / activity / Ask), supplier prices from an Excel file into the price Library, Carbon (EG.14)
 * and the 5D price table (EG.17), a tag schedule as quantities (SU.915), a two-finger swipe that pans (D7.56), the live adapter's where().
 *   node tools/takeoffcraft-test/browser-r3.mjs [--out dir]
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, BASE } from '../gpu-remote/browser.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : path.join(ROOT, 'tmp/shots/takeoffcraft-r3');
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const browser = await launch();
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addInitScript(() => { try { window.showOpenFilePicker = undefined; window.showSaveFilePicker = undefined; } catch { /* the plain input / download then */ } });
  await ctx.addCookies(labCookie());
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/takeoffcraft?space=paper');
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 30000 });
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  const T = (fn, a) => page.evaluate(fn, a);

  // ---- the shell's seven modules
  await page.waitForFunction(() => window.ccCalc && window.ccReasons && window.ccTotals && window.ccLessons && window.ccSuggest && window.ccActivity && window.ccAsk, null, { timeout: 15000 });
  ok(true, 'all seven shell modules are loaded');
  ok(await T(() => ccAsk.state().attached && ccSuggest.state().attached), 'Ask and Suggest are attached to host.control');
  ok(await T(() => !!window.takeoffcraft.shell() && window.takeoffcraft.shell().totals.length === 2), 'the page hands over two total sources (cost and carbon)');

  const b64 = await T(async () => { const L = await import('/assets/vendor/pdf-lib/current/pdf-lib.esm.min.js'); const d = await L.PDFDocument.create(); d.addPage([612, 792]).drawText('R3 TEST', { x: 50, y: 700, size: 12 }); const b = await d.save(); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); });
  await page.setInputFiles('[data-file-pdf]', { name: 'p.pdf', mimeType: 'application/pdf', buffer: Buffer.from(b64, 'base64') });
  await page.waitForFunction(() => window.takeoffcraft.sheets().length === 1, null, { timeout: 20000 });
  const key = await T(() => window.takeoffcraft.sheets()[0].key);

  // the lesson steps on the takeoff itself
  await T(() => ccLessons.start('first-takeoff'));
  const step = () => T(() => (c => c && (c.step?.id || c.step))(ccLessons.state().current) || null);
  ok((await step()) === 'scale', 'the lesson waits at: set the scale', await step());
  await T((k) => window.takeoffcraft.model.setScale(k, { method: 'calibrated', ftPerUnit: 1, label: '1:1', preset: null, cal: null }), key);
  ok((await step()) === 'item', 'a scale completes step one');
  const ids = await T((k) => {
    const m = window.takeoffcraft.model;
    const a = m.addItem({ name: 'Concrete slab', type: 'area', unit: 'm²', mat: 1000000 }), b = m.addItem({ name: 'Steel beam', type: 'linear', unit: 'm', mat: 500000 }), c = m.addItem({ name: 'Mystery', type: 'count' });
    return { a, b, c };
  }, key);
  ok((await step()) === 'measure', 'an item completes step two');
  await T(({ a, b, c }) => {
    const k = window.takeoffcraft.sheets()[0].key, m = window.takeoffcraft.model;
    m.addMark({ item: a, sheet: k, pts: [[0, 0], [10, 0], [10, 10], [0, 10]], kind: 'area' });
    m.addMark({ item: b, sheet: k, pts: [[0, 0], [20, 0]], kind: 'linear' });
    m.addMark({ item: c, sheet: k, pts: [[1, 1]], kind: 'count' });
  }, ids);
  ok((await step()) === 'save', 'a mark completes step three');
  await T(() => { ccLessons.stop(); ccLessons.close(); });
  // totals: cost and carbon
  await page.waitForTimeout(300);
  const tot = await T(() => JSON.stringify(ccTotals.snapshot()));
  ok(/cost/.test(tot) && /carbon/.test(tot), 'both totals have a number: ' + tot.slice(0, 220));
  // 10x10 ft = 100 SF... units m²: scale 1 ft per unit so area 100 sq ft = 9.2903 m²; concrete: 0.12 per kg, 2400 kg/m3 but basis kg needs a volume -> left out; steel beam 20 ft = 6.096 m (basis kg) -> left out
  const car = await T(() => window.takeoffcraft.carbonDrive().check());
  ok(car.leftOut.some((l) => /Concrete/.test(l.item) && l.why === 'noqty') && car.leftOut.some((l) => /Mystery/.test(l.item) && l.why === 'nofactor'), 'carbon: a volume factor on an area, and a name with no factor, are left out with the reason', JSON.stringify(car.leftOut));
  // calc sheet + reasons in the file
  await T(() => { const s = ccCalc.calcs.addSheet({ title: 'Mount check' }); ccCalc.calcs.setRow(s.id, null, { name: 'w', expr: '5 m * 2' }); });
  await T(() => window.takeoffcraft.model.emit('change'));   // an unrelated change must not wipe a sheet that is not yet written
  await T((id) => { window.ccReasons.reasons.set({ kind: 'item', id, label: 'Concrete slab' }, { decision: 'Chosen for the span' }); }, ids.a);
  await page.waitForTimeout(700);
  let file = await T(() => JSON.parse(JSON.stringify(window.takeoffcraft.model.toJSON())));
  ok(file.calcs?.format === 'cadcraft-calcs' && file.calcs.sheets[0].title === 'Mount check', 'the calc sheet is in the saved takeoff file');
  ok(file.reasons?.records?.length === 1, 'the design reason is in the saved takeoff file');
  const back = await T(() => { const m = window.takeoffcraft.model, j = m.toJSON(); const r = m.load(JSON.parse(JSON.stringify(j))); return r.ok && ccCalc.save() && ccCalc.save().sheets.length; });
  ok(back === 1, 'reopening the file gives the calc sheet back (load keeps the key)');
  const clean = await T(() => { const m = window.takeoffcraft.model; const j = JSON.parse(JSON.stringify(m.toJSON())); delete j.calcs; delete j.reasons; m.load(j); return JSON.parse(JSON.stringify(m.toJSON())); });
  ok(!('calcs' in clean) && !('reasons' in clean) && await T(() => ccCalc.save() === null), 'a file without them stays without the keys, and the modules empty');
  ok(await T((c) => window.takeoffcraft.model.state.items.length === 3, 0), 'the items came back from the reload');

  // ---- supplier prices from an Excel file into the Library
  const xl = await T(async () => { const X = await import('/assets/apps/takeoffcraft/dev/xlsx.js'); const b = await X.writeXlsx([{ name: 'Stock', rows: [['SKU', 'Description', 'In Stock', 'Lead Time', 'UOM', 'Unit Price', 'Vendor'], ['S-1', 'Concrete slab', 40, '2 days', 'm²', 55.5, 'Pour Co'], ['S-2', 'Steel beam', 10, '1 week', 'm', 80, 'Mill']] }]); return Array.from(b); }).catch(() => null);
  ok(Array.isArray(xl) && xl.length > 200, 'an Excel workbook was made in the page');
  await T(() => localStorage.setItem('takeoffcraft.library', JSON.stringify([{ name: 'Concrete slab', type: 'area', unit: 'm²', heightFt: 0, waste: 0, mat: 1, lab: 0, components: [] }, { name: 'Steel beam', type: 'linear', unit: 'LF', heightFt: 0, waste: 0, mat: 7, lab: 0, components: [] }])));
  await page.click('[data-act="supply"]');
  await page.waitForSelector('[data-supply-dialog][open]');
  await page.setInputFiles('[data-supply-file]', { name: 'acme.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from(xl) });
  await page.waitForSelector('[data-supply-source="acme.xlsx"]', { timeout: 8000 });
  ok(true, 'the Excel supplier file is read and listed');
  ok(!(await page.isDisabled('[data-supply-library]')), 'Prices into the Library is on once a file has prices');
  await page.click('[data-supply-library]');
  await page.waitForTimeout(300);
  const lib = await T(() => JSON.parse(localStorage.getItem('takeoffcraft.library')));
  ok(lib[0].mat === 555000 && lib[1].mat === 7, 'the slab took the supplier price (55.50 = 555000) and the beam, priced per metre against an LF entry, stayed', JSON.stringify(lib.map((e) => e.mat)));
  await page.screenshot({ path: path.join(OUT, '01-supply-library.png') });
  await page.keyboard.press('Escape');

  // ---- Carbon and 5D
  await T(() => localStorage.removeItem('takeoffcraft.library'));
  ok(await page.isVisible('[data-act="carbon"]'), 'the toolbar has Carbon');
  await page.click('[data-act="carbon"]');
  await page.waitForSelector('[data-carbon-dialog][open]');
  ok(/Starter values/.test(await page.textContent('[data-carbon-starter]')), 'the starter-values sentence stays beside the figures');
  // pick a metre-based factor for the beam: add a factor row by file, then choose it
  const rowsJson = JSON.stringify({ format: 'cadcraft-carbon-factors', version: 1, rows: [{ id: 'beam-m', match: ['steel beam'], basis: 'm', a1a3: 40, a4: 2, a5: 1, source: 'test', checked: true }, { id: 'slab-m2', match: ['concrete slab'], basis: 'm2', a1a3: 100, source: 'test' }] });
  await page.setInputFiles('[data-carbon-file]', { name: 'f.json', mimeType: 'application/json', buffer: Buffer.from(rowsJson) });
  await page.waitForSelector('[data-carbon-row]');
  const sum = await page.textContent('[data-carbon-summary]');
  // beam: 20 ft = 6.096 m x 40 = 243.84; slab 100 sq ft = 9.290304 m2 x 100 = 929.03
  ok(/1,?172\.87|1172\.87/.test(sum.replace(/\s/g, '')) || /1172/.test(sum), 'the total follows the quantities: ' + sum);
  const kg = await T(() => window.takeoffcraft.carbonDrive().check().lines.map((l) => [l.item, l.kgCO2e]));
  ok(JSON.stringify(kg) === JSON.stringify([['Concrete slab', 929.03], ['Steel beam', 243.84]]), 'by hand: 9.2903 m2 x 100 and 6.096 m x 40', JSON.stringify(kg));
  await page.click('[data-carbon-modules] input:not([disabled]) >> nth=0');   // + A4 transport
  await page.waitForTimeout(200);
  const kg4 = await T(() => window.takeoffcraft.carbonDrive().check().lines.find((l) => l.item === 'Steel beam').kgCO2e);
  ok(kg4 === 256.03, 'A4 transport adds 2 per metre to the beam only: ' + kg4);
  await T(() => document.querySelector('[data-carbon-pick="' + window.takeoffcraft.model.state.items[1].id + '"]').value = 'none');
  await page.dispatchEvent('[data-carbon-pick]:nth-of-type(1)', 'change').catch(() => {});
  await page.screenshot({ path: path.join(OUT, '02-carbon.png') });
  const dlj = page.waitForEvent('download', { timeout: 10000 });
  await page.click('[data-price-json]');
  const pj = JSON.parse(fs.readFileSync(await (await dlj).path(), 'utf8'));
  ok(pj.format === 'cadcraft-price-table' && pj.version === 1 && pj.rows.length === 2 && pj.rows.every((r) => ['m2', 'm'].includes(r.unit)), '5D price table: the format BimCraft reads, one row per priced item', JSON.stringify(pj.rows.map((r) => [r.id, r.unit, r.mat])));
  ok(pj.rows.find((r) => r.id === 'concrete-slab').mat === 100 && pj.rows.find((r) => r.id === 'steel-beam').mat === 50, 'rates in dollars (mat 1000000 / 10000 = 100)');
  await page.keyboard.press('Escape');
  // saved with the takeoff
  const save = page.waitForEvent('download', { timeout: 15000 });
  await page.keyboard.press('Control+s');
  const saved = JSON.parse(fs.readFileSync(await (await save).path(), 'utf8'));
  ok(saved.carbon?.v === 1 && saved.carbon.rows.length === 2 && saved.carbon.modules.includes('a4'), 'the person\'s factors and modules are saved in the takeoff file');

  // ---- SU.915 tag schedule as quantities
  await page.click('[data-act="tagqty"]');
  await page.waitForSelector('[data-tagqty-dialog][open]');
  const csv = 'Tag,Class,Area (m2)\nW1,IfcWall,12.5\nW1,IfcWall,7.5\nW2,IfcWall,30\nD1,IfcDoor,\n';
  await page.setInputFiles('[data-tagqty-file]', { name: 'tags.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await page.waitForSelector('[data-tagqty-row]');
  const rows = await T(() => [...document.querySelectorAll('[data-tagqty-row]')].map((r) => r.querySelector('.tc-learn-name').textContent + '|' + r.querySelector('.tc-learn-sub').textContent));
  ok(rows.some((r) => /^W2\|30 m²/.test(r)) && rows.some((r) => /^W1\|20 m²/.test(r)), 'the groups are summed by tag, in m²: ' + JSON.stringify(rows));
  await page.click('[data-tagqty-add]');
  await page.waitForTimeout(300);
  const typed = await T(() => window.takeoffcraft.model.state.items.filter((i) => i.type === 'fixed').map((i) => [i.name, i.qty, i.unit]));
  ok(typed.length === 2 && typed.some((x) => x[0] === 'W1' && x[1] === 20 && x[2] === 'm²'), 'the tags became typed quantities', JSON.stringify(typed));
  await T(() => document.querySelector('[data-act="tagqty"]').click());
  await page.waitForSelector('[data-tagqty-dialog][open]');
  await page.setInputFiles('[data-tagqty-file]', { name: 'tags.csv', mimeType: 'text/csv', buffer: Buffer.from(csv.replace('7.5', '9.5')) });
  await page.waitForSelector('[data-tagqty-row]');
  await page.click('[data-tagqty-add]');
  await page.waitForTimeout(300);
  const again = await T(() => window.takeoffcraft.model.state.items.filter((i) => i.type === 'fixed').map((i) => [i.name, i.qty]));
  ok(again.length === 2 && again.find((x) => x[0] === 'W1')[1] === 22, 'bringing the schedule again updates the quantities in place', JSON.stringify(again));

  // ---- D7.56: a two-finger swipe pans, a wheel step zooms
  const view = () => T(() => { const v = window.takeoffcraft.view; return { z: v.z, ox: v.ox, oy: v.oy }; });
  const box = await page.locator('[data-over]').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const v0 = await view();
  await T(() => { const el = document.querySelector('[data-over]'); el.dispatchEvent(new WheelEvent('wheel', { deltaX: 12.5, deltaY: 7.25, deltaMode: 0, clientX: 400, clientY: 300, bubbles: true, cancelable: true })); });
  const v1 = await view();
  ok(v1.z === v0.z && Math.abs((v1.ox - v0.ox) + 12.5) < 1e-6 && Math.abs((v1.oy - v0.oy) + 7.25) < 1e-6, 'a trackpad swipe pans and keeps the zoom', JSON.stringify([v0, v1]));
  await T(() => { const el = document.querySelector('[data-over]'); el.dispatchEvent(new WheelEvent('wheel', { deltaX: 0, deltaY: 100, deltaMode: 0, clientX: 400, clientY: 300, bubbles: true, cancelable: true })); });
  const v2 = await view();
  ok(v2.z !== v1.z, 'a mouse-wheel step still zooms');

  // ---- the live adapter
  const w = await T(async () => { const { createLive } = await import('/assets/apps/takeoffcraft/dev/live.js'); const m = window.takeoffcraft.model; const lv = createLive(m, { sheetTitle: () => 'R3' }); const mk = m.state.marks[0]; return { where: lv.where([{ o: 'set', c: 'marks', id: mk.id, f: 'item', v: mk.item }]), label: lv.sheetLabel(mk.sheet), none: lv.where([{ o: 'top', f: 'name', v: 'x' }]) }; });
  ok(w.where && w.where.box && w.label === 'R3' && w.none === null, 'the live adapter says where a mark change landed', JSON.stringify(w));
} catch (e) {
  fail++; console.log('  FAIL threw: ' + (e.stack || e.message));
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console or page errors' + (problems.length ? ': ' + problems.join(' | ').slice(0, 400) : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
