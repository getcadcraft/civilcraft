#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-illustrate.mjs — the Illustrate workspace in headless Chromium (0.7 Track TP, session `illustrate`): a manual from
 * the open part and from the open assembly, the scene drawn in place of the part, the toolbar one row at 1440 px, views
 * (add, thumbnail, go to, update), picking and looks (ghost, hide, isolate) as undo steps on the manual's own history with
 * the Undo button in step, annotations on the overlay (a label placed on a part and dragged), balloons, the parts list in
 * the view, save → the file reads back, Design untouched after, no console errors.
 *   node tools/partcraft-test/browser-illustrate.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]   (PC_EXACT=0: mesh kernel)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, built, shot, F } = h;
  const choose = async (id) => { await page.selectOption('[data-workspace]', id); await page.waitForFunction((id) => window.partcraft.workspace === id, id); };
  const S = (fn, arg) => page.evaluate(([f, a]) => (0, eval)(f)(window.partcraft.WS.getWorkspace('illustrate')._state, a), [fn.toString(), arg]);
  const rows = () => page.evaluate(() => new Set([...document.querySelectorAll('.pc-tools [role=group]')].filter((g) => !g.hidden).map((g) => g.offsetTop)).size);
  const stageBox = () => page.evaluate(() => { const r = document.querySelector('[data-partcraft] canvas').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });

  console.log('\n== illustrate: a manual from the open part');
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
  await built();
  await choose('illustrate');
  ok((await page.textContent('[data-props-h]')).trim() === 'Illustrate' && await page.isVisible('[data-il-new="part"]'), 'Illustrate opens on its panel: start from the open part, a file, or open a manual');
  ok((await rows()) === 1, 'the toolbar is one row at 1440 px in Illustrate');
  await page.click('[data-il-new="part"]');
  await page.waitForFunction(() => window.partcraft.WS.getWorkspace('illustrate')._state.doc);
  const st0 = await S((s) => ({ parts: Object.keys(s.doc.m.parts).length, placed: s.doc.m.instances.length, drawn: s.scene3d.count, overlay: !!s.overlay, partShown: window.partcraft.view.mesh?.visible }));
  ok(st0.parts === 1 && st0.placed === 1 && st0.drawn === 1 && st0.overlay && st0.partShown === false, 'the manual has the part; its scene is drawn and the part itself is hidden');
  ok(await page.isDisabled('.pc-tools [data-cmd="undo"]'), 'Undo is off: nothing done in the manual yet');

  console.log('\n== illustrate: views, picking, looks, undo');
  await page.click('.pc-tools [data-cmd="illustrate-view-add"]');
  const v1 = await S((s) => ({ n: s.doc.m.views.length, thumb: s.doc.m.views[0]?.thumb.slice(0, 23), id: s.viewId }));
  ok(v1.n === 1 && v1.thumb === 'data:image/jpeg;base64,' && v1.id === 'v' + (v1.id || '').slice(1), 'Add view: a view with a thumbnail');
  ok(await page.isVisible('.il-views img.il-thumb'), 'the views list shows the thumbnail');
  ok(!(await page.isDisabled('.pc-tools [data-cmd="undo"]')), 'Undo is on after an edit (the manual\'s own history)');
  const b = await stageBox();
  await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2);
  ok((await S((s) => [...s.sel].join())) === 'i2' || (await S((s) => s.sel.size)) === 1, 'a click on the part selects it');
  await page.keyboard.press('g');
  ok(await S((s) => !!s.doc.m.scene.insts[[...s.sel][0]]?.ghost), 'G ghosts the selected part');
  await page.click('.pc-tools [data-cmd="undo"]');
  ok(await S((s) => !Object.keys(s.doc.m.scene.insts).length), 'Undo (the button) takes the ghost back');
  await page.click('.pc-tools [data-cmd="redo"]');
  ok(await S((s) => Object.values(s.doc.m.scene.insts).some((x) => x.ghost)), 'Redo puts it back');
  await page.locator('canvas').first().focus().catch(() => {});
  await page.keyboard.press('Control+z');
  const afterKey = await S((s) => Object.values(s.doc.m.scene.insts).some((x) => x.ghost));
  await page.keyboard.press('Control+Shift+z');
  ok(!afterKey && (await S((s) => Object.values(s.doc.m.scene.insts).some((x) => x.ghost))), 'Ctrl+Z and Ctrl+Shift+Z act on the manual too');
  await page.click('.pc-tools [data-cmd="illustrate-show-all"]');
  await page.click('[data-il-inst]');
  await page.click('.pc-tools [data-cmd="illustrate-hide"]');
  ok(await S((s) => Object.values(s.doc.m.scene.insts).some((x) => x.hide)) && (await S((s) => s.scene3d.count)) === 0, 'Hide (tree row selected, toolbar) hides it in the scene');
  await page.click('[data-il-view] .il-view-name');
  ok(await S((s) => !Object.values(s.doc.m.scene.insts).some((x) => x.hide)) && (await S((s) => s.scene3d.count)) === 1, 'clicking the view goes back to it (the part shown again)');

  console.log('\n== illustrate: annotations and the parts list');
  await page.click('[data-il-tool="label"]');
  await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2);
  const lab = await S((s) => { const a = s.doc.m.annotations[0]; return a && { id: a.id, kind: a.kind, off: a.off, shown: s.doc.m.scene.annots.includes(a.id) }; });
  ok(lab && lab.kind === 'label' && lab.shown, 'Label tool: a click on the part pins a label there');
  const el0 = await page.evaluate((id) => { const e = document.querySelector(`.il-overlay text[data-ref="${id}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: e.textContent }; }, lab.id);
  ok(el0 && el0.text === 'Flange', `the overlay draws it with its field filled ("${el0?.text}")`);
  const steps0 = await S((s) => s.doc.undoStack.length);
  await page.mouse.move(el0.x, el0.y); await page.mouse.down(); await page.mouse.move(el0.x + 60, el0.y - 30, { steps: 5 }); await page.mouse.up();
  const lab2 = await S((s, id) => s.doc.m.annotations.find((a) => a.id === id).off, lab.id);
  ok(lab2[0] > lab.off[0] && lab2[1] > lab.off[1] && (await S((s) => s.doc.undoStack.length)) === steps0 + 1, 'dragging the label moves it: one undo step');
  await page.fill('[data-il-text]', 'Part {number}: {name}');
  await page.press('[data-il-text]', 'Tab');
  ok((await page.textContent(`.il-overlay text[data-ref="${lab.id}"]`)) === 'Part : Flange', 'its text with fields, edited in the panel');
  await page.click('[data-il-balloons]');
  const bal = await page.evaluate(() => [...document.querySelectorAll('.il-overlay text[font-weight="bold"]')].map((e) => e.textContent));
  ok((await S((s) => s.doc.m.annotations.filter((a) => a.kind === 'balloon').length)) === 1 && bal.join() === '1', `Balloon the shown parts: balloon 1 (${bal.join()})`);
  await page.check('[data-il-table]');
  ok(await page.isVisible('.il-overlay [data-ref="table"]') && (await S((s) => s.doc.m.scene.table?.columns.join())) === 'item,qty,number,name,material', 'the parts list is shown in the view');
  await shot('illustrate-annotated');

  console.log('\n== illustrate: looks, export');
  await page.check('[data-il-section]');
  const caps = await S((s) => s.scene3d.group.children.find((c) => c.type === 'Group')?.children.length || 0);
  ok((await S((s) => !!s.doc.m.scene.look?.section)) && caps >= 1, `Section plane: the scene is cut and its cut face filled (${caps} cap mesh)`);
  await page.selectOption('[data-il-style]', 'lines');
  ok((await S((s) => s.doc.m.scene.look.style)) === 'lines', 'style: line art only');
  await page.check('[data-il-mag]');
  ok(await page.$('.il-overlay clipPath') && (await S((s) => s.doc.m.scene.look.magnifier?.zoom)) === 3, 'the magnifier draws on the overlay (a clipped lens)');
  await shot('illustrate-look');
  ok((await rows()) === 1, 'with four groups the toolbar is still one row at 1440 px');
  await page.click('.pc-tools [data-cmd="illustrate-export"]');
  await page.waitForSelector('.pc-dialog [data-il-export]');
  await page.selectOption('.pc-dialog select[name="format"]', 'pdf');
  const [pdl] = await Promise.all([page.waitForEvent('download'), page.click('.pc-dialog [data-key="go"]')]);
  const pdfPath = path.join(h.OUT, pdl.suggestedFilename());
  await pdl.saveAs(pdfPath);
  const pdfTxt = fs.readFileSync(pdfPath).toString('latin1');
  ok(/\.pdf$/.test(pdfPath) && pdfTxt.startsWith('%PDF-1.4') && /\/Count 1/.test(pdfTxt) && pdfTxt.trimEnd().endsWith('%%EOF'), `Export → PDF: ${path.basename(pdfPath)}, one page (${Math.round(pdfTxt.length / 1024)} KB)`);
  await page.click('.pc-tools [data-cmd="illustrate-export"]');
  await page.waitForSelector('.pc-dialog [data-il-export]');
  await page.selectOption('.pc-dialog select[name="format"]', 'png-picture');
  await page.fill('.pc-dialog input[name="width"]', '800');
  const [gdl] = await Promise.all([page.waitForEvent('download'), page.click('.pc-dialog [data-key="go"]')]);
  const pngPath = path.join(h.OUT, 'illustrate-export.png');
  await gdl.saveAs(pngPath);
  const png = fs.readFileSync(pngPath);
  ok(png[0] === 0x89 && png.readUInt32BE(16) === 800, `Export → PNG picture of the 3D view, 800 px wide (${png.readUInt32BE(16)} × ${png.readUInt32BE(20)})`);
  await page.uncheck('[data-il-mag]');
  await page.uncheck('[data-il-section]');

  console.log('\n== illustrate: the interactive 3D file, opened offline');
  await page.click('.pc-tools [data-cmd="illustrate-export"]');
  await page.waitForSelector('.pc-dialog [data-il-export]');
  await page.selectOption('.pc-dialog select[name="format"]', 'html3d');
  const [xdl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('.pc-dialog [data-key="go"]')]);
  const xPath = path.join(h.OUT, 'illustrate-viewer.html');
  await xdl.saveAs(xPath);
  const xHtml = fs.readFileSync(xPath, 'utf8');
  ok(xHtml.includes("default-src 'none'") && xHtml.length > 1e6, `the interactive file: one HTML file (${(xHtml.length / 1048576).toFixed(1)} MB) that forbids every request`);
  const vp = await h.ctx.newPage();
  const asked = [], errs = [];
  vp.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  vp.on('pageerror', (e) => errs.push(String(e)));
  await vp.route('**/*', (r) => { const u = r.request().url(); if (u.startsWith('file:')) return r.continue(); asked.push(u); return r.abort(); });
  await vp.goto('file://' + xPath);
  await vp.waitForFunction(() => window.__manualViewer, null, { timeout: 30000 }).catch(() => {});
  const v0 = await vp.evaluate(() => { const v = window.__manualViewer; if (!v) return null; const c = document.querySelector('canvas.main'); const g = v.renderer.getContext(); const px = new Uint8Array(4); g.readPixels(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1, g.RGBA, g.UNSIGNED_BYTE, px); return { views: document.querySelectorAll('#views button').length, rows: document.querySelectorAll('tbody tr').length, px: [...px] }; });
  ok(v0 && v0.views === 1 && v0.rows === 1 && v0.px.slice(0, 3).some((x) => x < 250), `opened from the disk with the network cut: the model drawn (centre pixel ${v0?.px.slice(0, 3)}), its view and parts list`);
  await vp.click('tbody tr');
  ok((await vp.getAttribute('tbody tr', 'aria-selected')) === 'true' && (await vp.evaluate(() => window.__manualViewer.picked.length)) === 1, 'a parts-list row lights its part');
  ok(asked.length === 0 && errs.length === 0, 'it asked for nothing and logged no errors' + (asked.length || errs.length ? ': ' + [...asked, ...errs].slice(0, 3).join('; ') : ''));
  await vp.screenshot({ path: path.join(h.OUT, 'illustrate-viewer.png') });
  await vp.close();

  console.log('\n== illustrate: instructions');
  await page.click('[data-il-ins] > summary');
  await page.click('[data-il-ins-start]');
  ok((await S((s) => s.doc.m.instructions?.steps.length)) === 1, 'Start instructions: one step from the one view');
  if (!(await page.isVisible('[data-il-notes="0"]'))) await page.click('[data-il-ins] > summary');
  await page.fill('[data-il-notes="0"]', 'Line up the holes, then press down.');
  await page.press('[data-il-notes="0"]', 'Tab');
  ok((await S((s) => s.doc.m.instructions.steps[0].notes)) === 'Line up the holes, then press down.', 'a step\'s notes, typed in the panel');
  if (!(await page.isVisible('[data-il-ins-pdf]'))) await page.click('[data-il-ins] > summary');
  const [idl] = await Promise.all([page.waitForEvent('download'), page.click('[data-il-ins-pdf]')]);
  const insPath = path.join(h.OUT, idl.suggestedFilename());
  await idl.saveAs(insPath);
  const insTxt = fs.readFileSync(insPath).toString('latin1');
  ok(insTxt.startsWith('%PDF-1.4') && /\/Count 3/.test(insTxt), 'Save as PDF: cover, the step and the parts list (3 pages)');
  const [hdl] = await Promise.all([page.waitForEvent('download'), page.click('[data-il-ins-html]')]);
  const htmlPath = path.join(h.OUT, hdl.suggestedFilename());
  await hdl.saveAs(htmlPath);
  const htmlTxt = fs.readFileSync(htmlPath, 'utf8');
  ok(/^<!doctype html>/.test(htmlTxt) && htmlTxt.includes('Line up the holes, then press down.') && /<svg /.test(htmlTxt), 'Save as HTML: one page with the step\'s notes and its drawing');

  console.log('\n== illustrate: animation');
  await page.click('[data-il-anim] > summary');
  await page.click('[data-il-key-all]');
  ok((await S((s) => s.doc.m.anim?.objects.length)) === 1, 'Key everything: the part has a track');
  await page.evaluate(() => { const r = document.querySelector('[data-il-time]'); r.max = '3'; });
  await S((s) => { s.animTime = 2; });   // keys at 2 s
  await page.click('[data-il-inst]');
  await page.click('.pc-tools [data-cmd="illustrate-ghost"]');
  await page.click('[data-il-key-all]');
  const keys = await S((s) => s.doc.m.anim.props.find((p) => p.prop === 'opacity').keys.map((k) => k.t + ':' + k.v[0]).join());
  ok(keys === '0:1,2:0.22', `a second key at 2 s with the part ghosted (opacity keys ${keys})`);
  await S((s) => { s.animTime = 0; });
  await page.click('[data-il-play]');
  await page.waitForTimeout(700);
  const mid = await S((s) => ({ t: s.animTime, op: s.scene3d.group.children.find((o) => o.type === 'Mesh')?.material.opacity }));
  ok(mid.t > 0.2 && mid.op < 1 && mid.op > 0.22, `Play: the part fades as the time runs (t ${mid.t?.toFixed(2)} s, opacity ${mid.op?.toFixed(2)})`);
  await page.selectOption('[data-il-video-kind]', 'png');
  await page.fill('[data-il-video-w]', '320');
  const [vdl] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.click('[data-il-video]')]);
  const vPath = path.join(h.OUT, vdl.suggestedFilename());
  await vdl.saveAs(vPath);
  const vbytes = fs.readFileSync(vPath);
  ok(/\.zip$/.test(vPath) && vbytes[0] === 0x50 && vbytes[1] === 0x4b && vbytes.length > 2000, `Save video (PNG frames): ${path.basename(vPath)}, ${Math.round(vbytes.length / 1024)} KB`);
  await page.click('[data-il-stop]');
  await page.click('.pc-tools [data-cmd="illustrate-show-all"]');
  await page.click('[data-il-inst]');
  await page.click('.pc-tools [data-cmd="illustrate-ghost"]');

  console.log('\n== illustrate: save, and back to Design');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('.pc-tools [data-cmd="illustrate-save"]')]);
  const file = path.join(h.OUT, dl.suggestedFilename());
  await dl.saveAs(file);
  const I18N = await import(DEV + 'i18n.js'); I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(DEV, 'lang/en.json'), 'utf8')) });
  const MN = await import(DEV + 'illustrate/all.js');
  const back = MN.readManual(fs.readFileSync(file));
  ok(/\.partcraft-manual\.json$/.test(file) && back.m.views.length === 1 && back.m.annotations.length === 2 && back.m.scene.table && back.m.scene.look?.style === 'lines' && back.m.instructions?.steps.length === 1, `saved ${path.basename(file)}; it reads back with its view, label, balloon and table`);
  await choose('design');
  ok(await pc(() => window.partcraft.view.mesh.visible) && !(await page.$('.il-overlay')), 'back in Design: the part shows again, the overlay is gone');
  await choose('illustrate');
  ok((await S((s) => s.doc?.m.annotations.length)) === 2 && await page.$('.il-overlay'), 'back in Illustrate: the manual is still open');

  console.log('\n== illustrate: update from the design');
  await choose('design');
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange({ holes: 6 }).part));
  await built();
  await choose('illustrate');
  await page.click('[data-il-update]');
  await page.click('.pc-dialog [data-key="open"]');
  await page.waitForSelector('.pc-dialog [data-il-update]');
  const report = await page.textContent('.pc-dialog [data-il-update]');
  ok(/Changed shape \(1\)/.test(report) && !/Moved/.test(report), 'Update from the open part (now 6 holes): the report says one part changed shape');
  const steps1 = await S((s) => s.doc.undoStack.length);
  const tri0 = await S((s) => s.doc.meshes.get(s.doc.m.instances[0].part).indices.length);
  await page.click('.pc-dialog [data-key="go"]');
  await page.waitForFunction((n) => window.partcraft.WS.getWorkspace('illustrate')._state.doc.undoStack.length === n, steps1 + 1, { timeout: 10000 }).catch(() => {});
  const tri1 = await S((s) => s.doc.meshes.get(s.doc.m.instances[0].part).indices.length);
  const upd = { tri0, tri1, steps: (await S((s) => s.doc.undoStack.length)) - steps1, annots: await S((s) => s.doc.m.annotations.map((a) => a.kind).join()) };
  ok(tri1 !== tri0 && upd.steps === 1 && upd.annots === 'label,balloon', `applied as one undo step: the new shape, the label and balloon kept (${JSON.stringify(upd)})`);
  await page.click('.pc-tools [data-cmd="undo"]');
  ok((await S((s) => s.doc.meshes.get(s.doc.m.instances[0].part).indices.length)) === tri0, 'Undo takes the update back');

  console.log('\n== illustrate: from the open assembly');
  await choose('design');
  const P = F.flange({ resolution: 24 }).part;
  const asm = { format: 'partcraft-assembly', version: 2, name: 'Two flanges', seq: 10, parts: { p1: { name: 'Flange', part: P, number: 'FL-1' } }, instances: [{ id: 'i1', part: 'p1', name: 'Flange <1>', place: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }, { id: 'i2', part: 'p1', name: 'Flange <2>', place: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 150, 0, 1] }], joints: [] };
  await pc((t) => window.partcraft.openText(t, 'Two.partcraft-asm.json'), JSON.stringify(asm));
  await page.waitForFunction(() => window.partcraft.host?.assembly?.()?.world || window.partcraft.WS);
  await page.waitForTimeout(500);
  await choose('illustrate');
  page.once('dialog', (d) => d.accept());
  await S((s) => { s.doc.dirty = false; });
  await page.click('.pc-tools [data-cmd="illustrate-new"]');
  await page.click('.pc-dialog [data-key="asm"]');
  await page.waitForFunction(() => window.partcraft.WS.getWorkspace('illustrate')._state.doc?.m.instances.length === 2);
  const asmSt = await S((s) => ({ kind: s.doc.m.source.kind, rows: s.doc.m.parts.p1?.number, drawn: s.scene3d.count, hidden: (window.partcraft.view.instances || []).every((o) => !o.mesh.visible) }));
  ok(asmSt.kind === 'partcraft-assembly' && asmSt.rows === 'FL-1' && asmSt.drawn === 2 && asmSt.hidden, 'Illustrate opens with an assembly open: a manual of its two flanges; the assembly\'s own parts are hidden meanwhile');
  await choose('design');
  ok(await page.evaluate(() => (window.partcraft.view.instances || []).every((o) => o.mesh.visible)), 'back in Design the assembly shows again');

  ok(h.problems.length === 0, 'illustrate: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
