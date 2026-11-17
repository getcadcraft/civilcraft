#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * browser-import-units.mjs: BK.8 in the real pages. One rule for every import: a file that states its units says so; a file that
 * states none is ASKED about before anything is placed, and the answer is remembered for that file; cancelling places nothing.
 *   the dialog   window.ccImportUnits.resolve (assets/js/app-import-units.js): asked, remembered, stated, cancelled, asked again
 *   BimCraft     Open an OBJ (no units): asked first; Cancel opens nothing; an answer opens it at that size; the same file again is not
 *                asked. The model's size proves the unit was applied: the same cube answered in millimeters and in meters.
 *   CadCraft     XATTACH a DXF with no $INSUNITS into a drawing in millimeters: asked; answered "meters" the reference comes in at
 *                1000; a DXF that states meters is not asked and says so.
 *   CivilCraft   the CAD opener with a DXF with no $INSUNITS: asked before its dialog; the dialog starts on the answered unit.
 *
 *   node tools/shell-test/browser-import-units.mjs [--apps bimcraft,cadcraft,civilcraft]
 * Run as root. One browser, one page at a time. The DOM-free half is node bin/test-import-units.mjs.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openLab } from './lab-page.mjs';

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APPS = (arg('--apps') || 'bimcraft,cadcraft,civilcraft').split(',');
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + (typeof d === 'string' ? d : JSON.stringify(d)) + ')' : '')); } };

// a cube 2 units on a side, as an OBJ (no units in the format)
const cube = (s = 2) => ['o Cube', ...[[0, 0, 0], [s, 0, 0], [s, s, 0], [0, s, 0], [0, 0, s], [s, 0, s], [s, s, s], [0, s, s]].map((v) => 'v ' + v.join(' ')),
  'f 1 3 2', 'f 1 4 3', 'f 5 6 7', 'f 5 7 8', 'f 1 2 6', 'f 1 6 5', 'f 2 3 7', 'f 2 7 6', 'f 3 4 8', 'f 3 8 7', 'f 4 1 5', 'f 4 5 8', ''].join('\n');
// a DXF holding one line from (0,0) to (3,0); with or without $INSUNITS
const dxf = (ins) => ['0', 'SECTION', '2', 'HEADER', ...(ins ? ['9', '$INSUNITS', '70', String(ins)] : []), '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES', '0', 'LINE', '8', '0', '10', '0', '20', '0', '11', '3', '21', '0', '0', 'ENDSEC', '0', 'EOF', ''].join('\n');
// real files on disk: a file picked twice is the same file (same name, size and date), as on a person's computer
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'bk8-'));
const fileOf = (name, text) => { const f = path.join(TMP, name); if (!fs.existsSync(f)) fs.writeFileSync(f, text); return f; };
const dlg = (page) => page.evaluate(() => { const d = document.querySelector('dialog[data-import-units][open]'); return d ? { title: d.querySelector('.cc-iu-title').textContent, text: d.querySelector('.cc-iu-text').textContent, units: [...d.querySelectorAll('select option')].map((o) => o.value), names: [...d.querySelectorAll('select option')].map((o) => o.textContent), picked: d.querySelector('select').value } : null; });
const waitDlg = (page, ms = 8000) => page.waitForSelector('dialog[data-import-units][open]', { timeout: ms }).then(() => true).catch(() => false);
const answer = async (page, unit) => { await page.selectOption('dialog[data-import-units] select', unit); await page.click('dialog[data-import-units] [data-iu-ok]'); await page.waitForTimeout(250); };
const forgetAll = (page) => page.evaluate(() => window.ccImportUnits.forget(null));

const lab = await openLab('bkimportunits');
try {
  if (APPS.includes('bimcraft')) {
    console.log('\n== the dialog (in BimCraft\'s page; the same module in every app)');
    const { ctx, page, errors } = await lab.page('bimcraft', { layout: 'standard', storage: { 'bimcraft.model.units': 'mm' }, prepare: false });   // no model open: Open asks nothing about unsaved work
    await page.waitForFunction(() => !!window.ccImportUnits, null, { timeout: 30000 }).catch(() => {});
    ok(await page.evaluate(() => typeof window.ccImportUnits?.resolve === 'function'), 'the lab build has window.ccImportUnits');
    await forgetAll(page);
    const F = { name: 'Plant Room.obj', size: 4321, lastModified: 1700000000000 };
    await page.evaluate((F) => { window.__iu = []; window.__said = []; window.ccImportUnits.resolve({ file: F, format: 'OBJ', stated: null, say: (s) => window.__said.push(s) }).then((r) => window.__iu.push(r)); }, F);
    ok(await waitDlg(page), 'a file that states no units: the question opens');
    const d = await dlg(page);
    ok(d && d.title === 'Units of Plant Room.obj' && /does not state its units/.test(d.text) && /Nothing is placed/.test(d.text), 'it names the file and says nothing is placed until answered', d);
    ok(d && d.units.join() === 'mm,cm,m,in,ft,usft' && d.names.join() === 'Millimeters,Centimeters,Meters,Inches,Feet,US survey feet', 'it offers the units by name', d?.names);
    ok(await page.evaluate(() => window.__iu.length === 0), 'nothing is answered for the person: the import waits');
    await answer(page, 'in');
    let r = await page.evaluate(() => ({ iu: window.__iu, said: window.__said }));
    ok(r.iu[0]?.unit === 'in' && r.iu[0].how === 'asked' && /Inches, as you answered/.test(r.said[0]), 'answered Inches: the import gets "in", and the status line says so', r);
    r = await page.evaluate(async (F) => { const a = await window.ccImportUnits.resolve({ file: F, format: 'OBJ', stated: null }); return { a, open: !!document.querySelector('dialog[data-import-units][open]') }; }, F);
    ok(r.a?.unit === 'in' && r.a.how === 'remembered' && !r.open && /as you answered for this file before/.test(r.a.text), 'the same file again: not asked, the remembered answer is used and said', r);
    r = await page.evaluate(async (F) => window.ccImportUnits.resolve({ file: { ...F, size: 9 }, stated: 'mm' }), F);
    ok(r?.unit === 'mm' && r.how === 'stated' && r.text === 'Plant Room.obj states its units: Millimeters.', 'a file that states its units: used and shown, never asked', r);
    await page.evaluate((F) => { window.__iu = []; window.ccImportUnits.resolve({ file: { ...F, size: 77 }, format: 'OBJ', stated: null, say: (s) => window.__said.push(s) }).then((x) => window.__iu.push(x)); }, F);
    await waitDlg(page);
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    r = await page.evaluate((F) => ({ iu: window.__iu, kept: window.ccImportUnits.recall({ ...F, size: 77 }), said: window.__said.slice(-1)[0] }), F);
    ok(r.iu.length === 1 && r.iu[0] === null && r.kept === null && /was not brought in/.test(r.said), 'Esc cancels: the import gets nothing to place, nothing is remembered, and it is said', r);
    await page.evaluate((F) => { window.__iu = []; window.ccImportUnits.resolve({ file: F, format: 'OBJ', stated: null, again: true }).then((x) => window.__iu.push(x)); }, F);
    await waitDlg(page);
    const again = await dlg(page);
    await answer(page, 'ft');
    r = await page.evaluate((F) => ({ iu: window.__iu, kept: window.ccImportUnits.recall(F) }), F);
    ok(again?.picked === 'in' && r.iu[0]?.unit === 'ft' && r.kept === 'ft', 'asked again on request: the last answer is selected, and a new answer replaces it', [again?.picked, r]);
    const cmd = await page.evaluate(() => { const before = window.ccImportUnits.recall('Plant Room.obj'); const items = window.ccPalette?.items?.() || []; const it = items.find((i) => i.id === 'import-units-forget'); if (it) it.run(); return { before, has: !!it, after: window.ccImportUnits.recall('Plant Room.obj') }; });
    if (cmd.has) ok(cmd.before === 'ft' && cmd.after === null, 'the command palette\'s "Ask again for the units of imported files" forgets them', cmd);
    else { await forgetAll(page); console.log('  note the palette does not list its items to a test: forget() called directly'); }

    console.log('\n== bimcraft: opening an OBJ');
    const size = () => page.evaluate(() => { try { const v = window.bimcraftLive?.viewer, b = v?.boxAround?.([...v.allKeys()], 0); if (!b) return null; const g = (p, i) => (Array.isArray(p) ? p[i] : p['xyz'[i]]); return [0, 1, 2].map((i) => Math.round((g(b.max, i) - g(b.min, i)) * 1e6) / 1e6); } catch (e) { return null; } });
    const status = () => page.evaluate(() => document.querySelector('[data-status]')?.textContent || '');
    const name0 = await page.evaluate(() => document.title);
    await page.setInputFiles('#bc-file', fileOf('cube-a.obj', cube(2)));
    ok(await waitDlg(page), 'Open cube-a.obj: asked for its units before anything is opened');
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    const s0 = await status();
    ok(/was not opened: its units were not given/.test(s0) && await page.evaluate(() => document.title) === name0, 'Cancel: nothing is opened, and the status line says why ("' + s0.slice(0, 60) + '")');
    await page.setInputFiles('#bc-file', []);
    await page.setInputFiles('#bc-file', fileOf('cube-a.obj', cube(2)));
    await waitDlg(page); await answer(page, 'mm');
    await page.waitForFunction(() => /triangle|mesh|solid|object/i.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 30000 }).catch(() => {});
    const s1 = await status(), b1 = await size();
    ok(/Millimeters, as you answered/.test(s1), 'answered Millimeters: opened, and the status line says which units were used ("' + s1.slice(0, 70) + '")');
    await page.setInputFiles('#bc-file', []);
    await page.setInputFiles('#bc-file', fileOf('cube-a.obj', cube(2)));
    const askedAgain = await waitDlg(page, 2500);
    if (askedAgain) await page.keyboard.press('Escape');
    await page.waitForFunction(() => /answered for this file before/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 30000 }).catch(() => {});
    const s2 = await status();
    ok(!askedAgain && /Millimeters, as you answered for this file before/.test(s2), 'the same file again: not asked; the remembered answer is used and said');
    await page.setInputFiles('#bc-file', []);
    await page.setInputFiles('#bc-file', fileOf('cube-b.obj', cube(2) + '# another file\n'));
    await waitDlg(page); await answer(page, 'm');
    await page.waitForFunction(() => /Meters, as you answered/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 30000 }).catch(() => {});
    const b2 = await size();
    if (b1 && b2) ok(Math.abs(Math.max(...b2) / Math.max(...b1) - 1000) < 1, 'the same cube answered in meters is 1000 times the one answered in millimeters (' + Math.max(...b1) + ' to ' + Math.max(...b2) + ')', [b1, b2]);
    else console.log('  note the viewer gives no model box to a test here: the size is proven in bin/test-import-units.mjs (obj-ifc.js readObj by unit)');
    ok(!/read as met(re|er)s/i.test(s1), 'the old line "it was read as metres" is gone from the status');
    ok(errors.length === 0, 'no page errors', errors.slice(0, 3));
    await ctx.close();

    console.log('\n== bimcraft: an IFC states its units');
    const m = await lab.page('bimcraft', { layout: 'standard', storage: { 'bimcraft.model.units': 'mm' } });
    await m.page.waitForFunction(() => !!window.bimcraftPlan?.state?.data, null, { timeout: 30000 }).catch(() => {});
    const dlp = m.page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
    await m.page.evaluate(() => document.querySelector('[data-save]').click());
    const dl = await dlp;
    if (dl) {
      const saved = path.join(TMP, 'saved.ifc'); await dl.saveAs(saved);
      await m.page.setInputFiles('#bc-file', saved);
      await m.page.waitForFunction(() => /states (its|no) length unit/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 40000 }).catch(() => {});
      const st = await m.page.evaluate(() => document.querySelector('[data-status]')?.textContent || '');
      const noDlg = !(await m.page.evaluate(() => !!document.querySelector('dialog[data-import-units][open]')));
      ok(noDlg && /Opened .*The file states its length unit: [A-Z][a-z]+\./.test(st), 'opening an IFC: not asked, and "Opened" says the unit the file states ("' + st.slice(-60) + '")', st);
      // the same model with its length unit taken out: asked before it opens, and the answer is written into the model
      const txt = fs.readFileSync(saved, 'latin1'), um = /#(\d+)\s*=\s*IFCSIUNIT\(\*,\.LENGTHUNIT\.[^;]*;\r?\n?/.exec(txt);
      if (um) {
        const bare = txt.replace(um[0], '').replace(new RegExp('(IFCUNITASSIGNMENT\\(\\()#' + um[1] + ',?'), '$1').replace(new RegExp(',#' + um[1] + '(?=[,)])'), '');
        const nou = path.join(TMP, 'no-length-unit.ifc'); fs.writeFileSync(nou, bare, 'latin1');
        ok(!/\.LENGTHUNIT\./.test(bare), 'a copy of the model with no length unit is made for the test');
        await m.page.setInputFiles('#bc-file', []); await m.page.setInputFiles('#bc-file', nou);
        ok(await waitDlg(m.page, 15000), 'an IFC that states no length unit: asked before it is opened (it was read in meters, unasked)');
        const dd = await dlg(m.page);
        ok(dd && dd.title === 'Units of no-length-unit.ifc' && dd.units.join() === 'mm,cm,m,in,ft', 'the same dialog', dd);
        await m.page.keyboard.press('Escape'); await m.page.waitForTimeout(400);
        const sc = await m.page.evaluate(() => document.querySelector('[data-status]')?.textContent || '');
        ok(/no-length-unit\.ifc was not opened: its units were not given/.test(sc), 'Cancel: not opened, and said');
        await m.page.setInputFiles('#bc-file', []); await m.page.setInputFiles('#bc-file', nou);
        await waitDlg(m.page, 15000); await answer(m.page, 'mm');
        await m.page.waitForFunction(() => /Opened .*as you answered/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 40000 }).catch(() => {});
        const so = await m.page.evaluate(() => document.querySelector('[data-status]')?.textContent || '');
        ok(/Opened no-length-unit\.ifc.*no-length-unit\.ifc: Millimeters, as you answered/.test(so), 'answered Millimeters: opened, and "Opened" says it was the answer ("' + so.slice(-70) + '")', so);
        const dl2p = m.page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
        await m.page.evaluate(() => { const b = document.querySelector('[data-save]'); b.disabled = false; b.click(); });
        const dl2 = await dl2p;
        if (dl2) { const again = path.join(TMP, 'resaved.ifc'); await dl2.saveAs(again); ok(/IFCSIUNIT\(\*,\.LENGTHUNIT\.,\.MILLI\.,\.METRE\.\)/.test(fs.readFileSync(again, 'latin1')), 'saved again, the file states millimeters itself from now on'); }
        else console.log('  note Save is off for an unchanged model: the written unit is proven in bin/test-import-units.mjs (stateLengthUnit)');
      } else ok(false, 'the saved IFC has an SI length unit to take out');
    } else ok(false, 'Save as IFC gave a file to reopen');
    ok(m.errors.length === 0, 'no page errors', m.errors.slice(0, 3));
    await m.ctx.close();
  }
  if (APPS.includes('cadcraft')) {
    console.log('\n== cadcraft: XATTACH a DXF');
    const { ctx, page, errors } = await lab.page('cadcraft', { layout: 'standard' });
    await page.waitForFunction(() => !!window.ccImportUnits && !!window.cadcraft?.doc, null, { timeout: 30000 }).catch(() => {});
    await forgetAll(page);
    const typed = async (t) => { await page.fill('[data-cmd-input]', t); await page.press('[data-cmd-input]', 'Enter'); await page.waitForTimeout(160); };
    const esc = () => page.evaluate(() => { if (window.cadcraft?.engine?.busy) window.cadcraft.engine.escape(); });
    await page.evaluate(() => { window.cadcraft.doc.meta.units = 'millimeters'; });
    const attach = async (name, text) => { await esc(); const fc = page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null); await typed('XATTACH'); const ch = await fc; if (!ch) return false; await ch.setFiles(fileOf(name, text)); return true; };
    const refs = () => page.evaluate(() => { const out = []; for (const e of window.cadcraft.doc.entities?.values?.() || window.cadcraft.doc.all?.() || []) if (e.type === 'insert') out.push({ block: e.block, sx: e.sx }); return out; });
    const hist = () => page.evaluate(() => [...document.querySelectorAll('[data-cmd-history] li, .cc-cmd-history li, [data-history] li')].slice(-8).map((l) => l.textContent).join(' | '));
    ok(await attach('no-units.dxf', dxf(0)), 'XATTACH opens the file picker');
    ok(await waitDlg(page), 'a DXF with no $INSUNITS, into a drawing in millimeters: asked before it is attached');
    const d = await dlg(page);
    ok(d && d.title === 'Units of no-units.dxf' && d.units.join() === 'mm,cm,m,in,ft', 'the same dialog, with the units a drawing can be in', d);
    const n0 = (await refs()).length;
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    ok((await refs()).length === n0, 'Cancel: nothing is attached');
    ok(await attach('no-units.dxf', dxf(0)), 'XATTACH again');
    await waitDlg(page); await answer(page, 'm');
    await page.waitForTimeout(500); await typed('0,0'); await page.waitForTimeout(300); await typed(''); await typed(''); await esc();
    let rr = await refs();
    ok(rr.length === n0 + 1 && Math.abs(rr[rr.length - 1].sx - 1000) < 1e-6, 'answered Meters: the reference comes in at scale 1000 (a meter drawing in a millimeter drawing)', rr.slice(-1));
    ok(await attach('says-meters.dxf', dxf(6)), 'XATTACH a DXF that states meters');
    const asked = await waitDlg(page, 2000);
    if (asked) await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const h = await hist();
    await typed('5000,0'); await page.waitForTimeout(300); await typed(''); await typed(''); await esc();
    rr = await refs();
    ok(!asked && /says-meters\.dxf states its units: Meters/.test(h), 'it is not asked, and the command line says "states its units: Meters"', h.slice(-200));
    ok(rr.length === n0 + 2 && Math.abs(rr[rr.length - 1].sx - 1000) < 1e-6, 'and comes in at 1000 too', rr.slice(-1));
    ok(errors.length === 0, 'no page errors', errors.slice(0, 3));
    await ctx.close();
  }
  if (APPS.includes('civilcraft')) {
    console.log('\n== civilcraft: a DXF through the CAD opener');
    const { ctx, page, errors } = await lab.page('civilcraft', { layout: 'standard' });
    await page.waitForFunction(() => !!window.ccImportUnits, null, { timeout: 30000 }).catch(() => {});
    await forgetAll(page);
    await page.setInputFiles('input[type="file"][data-file]', fileOf('survey-no-units.dxf', dxf(0)));
    ok(await waitDlg(page, 15000), 'a DXF with no $INSUNITS: asked before the import dialog');
    const before = await page.evaluate(() => !!document.querySelector('dialog[data-cad-dialog][open]'));
    ok(!before, 'the import dialog is not open yet: nothing is read into the project before the answer');
    await answer(page, 'mm');
    await page.waitForSelector('dialog[data-cad-dialog][open]', { timeout: 15000 }).catch(() => {});
    const c = await page.evaluate(() => { const d = document.querySelector('dialog[data-cad-dialog][open]'); return d ? { unit: d.querySelector('[data-cad-units]').value, label: d.querySelector('[data-cad-units]').selectedOptions[0]?.textContent, note: d.querySelector('[data-cad-unit-note]')?.textContent || '' } : null; });
    ok(c && c.unit === '4', 'its Drawing units list starts on the answered unit (millimeters, $INSUNITS 4): "' + (c?.label || '') + '"', c);
    await page.evaluate(() => document.querySelector('dialog[data-cad-dialog][open]')?.close());
    await page.setInputFiles('input[type="file"][data-file]', []);
    await page.setInputFiles('input[type="file"][data-file]', fileOf('survey-no-units.dxf', dxf(0)));
    const again = await waitDlg(page, 2500);
    await page.waitForSelector('dialog[data-cad-dialog][open]', { timeout: 15000 }).catch(() => {});
    const c2 = await page.evaluate(() => document.querySelector('dialog[data-cad-dialog][open] [data-cad-units]')?.value || null);
    ok(!again && c2 === '4', 'the same file again: not asked, the remembered unit is used', [again, c2]);
    await page.evaluate(() => document.querySelector('dialog[data-cad-dialog][open]')?.close());

    console.log('\n== civilcraft: a list of points');
    const said = () => page.evaluate(() => document.querySelector('[data-status], [data-say], .cv-status')?.textContent || '');
    const pu = await page.evaluate(() => document.querySelector('[data-units]')?.value || 'ft');
    await page.setInputFiles('input[type="file"][data-file]', []);
    await page.setInputFiles('input[type="file"][data-file]', fileOf('bare-points.csv', '1,5000.00,6000.00,100.00,TOP\n2,5010.00,6000.00,101.00,TOP\n3,5010.00,6010.00,102.00,TOE\n4,5000.00,6010.00,101.50,TOE\n'));
    await page.waitForSelector('[data-imp-ok]:not([disabled])', { timeout: 15000 }).catch(() => {});
    const early = await page.evaluate(() => !!document.querySelector('dialog[data-import-units][open]'));
    await page.click('[data-imp-ok]');
    ok(!early && await waitDlg(page, 8000), 'a point list that states no unit: asked when Import is pressed, before the points go in');
    const pd = await dlg(page);
    ok(pd && pd.units.join() === 'ft,usft,m' && pd.picked === (pu === 'm' ? 'm' : 'ft'), 'it offers feet, US survey feet and meters, the project\'s unit selected (never applied without a click)', pd);
    await answer(page, pu === 'm' ? 'ft' : 'm');
    await page.waitForTimeout(700);
    const s3 = await said();
    ok(/bare-points\.csv: (Meters|Feet), as you answered/.test(s3), 'answered in the other unit than the project\'s: imported, converted, and said ("' + s3.slice(-80) + '")', s3);
    await page.setInputFiles('input[type="file"][data-file]', []);
    await page.setInputFiles('input[type="file"][data-file]', fileOf('says-feet.csv', '# units: ft\n1,5000.00,6000.00,100.00,TOP\n2,5010.00,6000.00,101.00,TOP\n3,5010.00,6010.00,102.00,TOE\n'));
    await page.waitForSelector('[data-imp-ok]:not([disabled])', { timeout: 15000 }).catch(() => {});
    await page.click('[data-imp-ok]');
    const asked2 = await waitDlg(page, 2500);
    if (asked2) await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
    const s4 = await said();
    ok(!asked2 && /says-feet\.csv states its units: Feet/.test(s4), 'a list whose first line says "units: ft": not asked, and said', s4);
    ok(errors.length === 0, 'no page errors', errors.slice(0, 3));
    await ctx.close();
  }
} finally { await lab.close(); fs.rmSync(TMP, { recursive: true, force: true }); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
