#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-tools-b.mjs — the ten tools of session bk-tools-b-10 in the real page (/lab/bimcraft, headless), in the "Ribbon and
 * project browser" (docked) layout: each ribbon button clicked, the thing drawn, seen in the plan and the 3D view, undone.
 *   node tools/bimcraft-test/browser-tools-b.mjs [--shots <dir>]   (as root)
 * Curtain System, Curtain Grid, Mullion, By Face (a real click on a wall's face in the 3D view), Set Work Plane (a level, a line,
 * a reference plane), Show Work Plane, Reference Plane, Work Plane Viewer (a line and a text drawn in it), Model Text, Model Line;
 * then the file saved and opened again in the page, the "Auto-revise" layout, and the commands in the menu styles.
 * The arithmetic is in tools/bimcraft-test/tools-b-test.mjs (the Node suite).
 */
import { openLab } from './bk-page.mjs';

const L = await openLab({ tag: 'bktoolsb', units: 'mm' });
const { page, ok, inPage } = L;
const near = (a, b, tol = 0.5) => Math.abs(a - b) <= tol;
// Which request a console "Failed to load resource" was. The shell's hardware report (POST /api/v1/hardware) is limited to 30 an hour for a
// network, and every test run on this server shares 127.0.0.1: its 429 is the limit doing its work, not a fault of the page under test.
const refused = [];
page.on('response', (r) => { if (r.status() >= 400) { refused.push([r.status(), r.url()]); console.log('  note ' + r.status() + ': ' + r.url().slice(0, 140)); } });
const TEN = ['curtain', 'curtaingrid', 'mullion', 'byface', 'workplane', 'showplane', 'referenceplane', 'viewer', 'modeltext', 'modelline'];
const planClick = async (x, y) => { await inPage(([x, y]) => { window.bimcraftPlan.move([x, y]); window.bimcraftPlan.click([x, y]); }, [x, y]); await page.waitForTimeout(250); await L.settled(); };
const ribbon = async (cmd) => { await page.click('.ws-ribbon [data-ws-command="' + cmd + '"]'); await page.waitForTimeout(500); };
const tool = () => inPage(() => window.bimcraftPlan.state.tool);
const curtains = () => inPage(() => window.bimcraftCurtain.state.list.map((c) => ({ guid: c.guid, id: c.id, source: c.source, host: c.host, plates: c.plates.length, members: c.members.length, u: c.linesU.map((l) => [l.at, l.m]), v: c.linesV.map((l) => [l.at, l.m]), border: c.border, t: c.totals, parts: c.parts, n: c.frame.n })));
const wp = () => inPage(() => { const S = window.bimcraftWorkPlane.state; return { kind: S.wp?.kind, ref: S.wp?.ref, n: S.wp?.frame.n, o: S.wp?.frame.o, stored: S.stored, show: S.show, refs: S.refs.map((r) => ({ guid: r.guid, name: r.name, len: r.length, id: r.id })), lines: S.lines.map((l) => ({ guid: l.guid, id: l.id, kind: l.kind, len: l.length, closed: l.closed, n: l.frame.n, o: l.frame.o, pts: l.pts })), texts: S.texts.map((x) => ({ guid: x.guid, id: x.id, text: x.text, h: x.height, d: x.depth, area: x.faceArea, n: x.frame.n })) }; });
const setRow = async (sel, value) => { await page.fill(sel, value); await page.dispatchEvent(sel, 'change'); await page.waitForTimeout(150); };
/** Undo / Redo from the button the layout shows (the docked layout's title bar; the classic toolbar). */
const press = async (what) => { const sel = (await inPage((w) => [...document.querySelectorAll('[data-ws-command="' + w + '"]')].some((b) => b.offsetParent), what)) ? '[data-ws-command="' + what + '"]:visible' : '[data-' + what + ']'; await page.locator(sel).first().click(); await page.waitForTimeout(400); await L.settled(); };
const undo = () => press('undo');
const viewTab = async (name) => { await inPage((n) => { const b = [...document.querySelectorAll('[data-ws-drawing]')].find((x) => x.textContent.includes(n)); b?.click(); }, name); await page.waitForTimeout(1200); };
const keys3d = () => inPage(() => [...(window.bimcraftRes.api.host.viewer()?.allKeys?.() || [])]);
let code = 1;
try {
  await L.newBuilding({ name: 'Tools B', levels: 2, height: '3000 mm' });
  await inPage(() => window.ccShellWorkspace.set('docked')); await page.waitForTimeout(2000);
  ok(await inPage(() => document.querySelector('main')?.dataset.wsLayout === 'docked'), 'the "Ribbon and project browser" layout is on');
  const state = await inPage((TEN) => TEN.map((k) => { const b = document.querySelector('.ws-ribbon [data-ws-command="' + k + '"]'); return k + ':' + (b ? b.getAttribute('aria-disabled') + ':' + b.classList.contains('ws-notbuilt') + ':' + !!b.querySelector('svg') : 'missing'); }), TEN);
  ok(state.every((s) => /:false:false:true$/.test(s)), 'the ten tools are on in its ribbon: enabled, not marked "not built", each with its icon', state.join(' '));

  // ---------------------------------------------------------------- 1 Curtain System
  console.log('== 1 Curtain System');
  await ribbon('curtain');
  ok(await tool() === 'curtain' && await inPage(() => !document.querySelector('[data-mopts="curtain"]').hidden), 'the ribbon\'s Curtain System starts the tool; its options show');
  await L.frame(-1500, -3000, 9500, 8000);
  await planClick(0, 0); await planClick(6000, 0);
  let C = await curtains();
  ok(C.length === 1 && C[0].plates === 4 && C[0].members === 7 && near(C[0].t.net, 16675000) && near(C[0].t.mullionLength, 26500), 'two clicks 6000 apart: one system, 4 panes, 7 mullion pieces, 16.675 m2 of glass, 26 500 of mullion', JSON.stringify(C[0]?.t));
  const G = C[0].guid;
  const sym = await inPage(() => { const pv = window.bimcraftPlan.view, kb = window.bimcraftRes.api.kb(), c = window.bimcraftCurtain.state.list[0]; const s = pv.scene.symbols.find((x) => x.key === kb + c.id); return s ? { lines: s.lines.length, solid: s.solid.length } : null; });
  ok(sym && sym.lines === 2 && sym.solid === 5, 'the plan draws it: the pane as two lines, five mullions cut (3 on the grid, 2 at the ends)', JSON.stringify(sym));
  let K = await keys3d();
  ok(C[0].parts.every((p) => K.includes(p)), 'the 3D view has its 4 panes and 7 mullions');
  await L.shot('1-curtain');
  await undo();
  ok((await curtains()).length === 0, 'Undo takes the whole system away (one step)');
  await press('redo');
  C = await curtains();
  ok(C.length === 1 && C[0].guid === G, 'Redo brings the same system back');

  // ---------------------------------------------------------------- 2 Curtain Grid
  console.log('== 2 Curtain Grid');
  await ribbon('curtaingrid');
  ok(await tool() === 'curtaingrid', 'the ribbon\'s Curtain Grid starts the tool');
  await page.selectOption('[data-cg-dir]', 'v'); await setRow('[data-cg-at]', '1000');
  await planClick(3000, 0);
  C = await curtains();
  ok(C[0].v.length === 1 && C[0].v[0][0] === 1000 && C[0].plates === 8 && near(C[0].t.mullionLength, 32250), 'a level line at 1000 (typed in At, then a click on the system): 8 panes, 32 250 of mullion', JSON.stringify(C[0].v));
  await page.selectOption('[data-cg-dir]', 'u'); await setRow('[data-cg-at]', ''); await page.selectOption('[data-cg-act]', 'add');
  await planClick(750, 0);
  C = await curtains();
  ok(C[0].u.map((l) => l[0]).join() === '750,1500,3000,4500', 'an upright line added where the system is clicked (750 along it)', C[0].u.join(' '));
  await page.selectOption('[data-cg-act]', 'move');
  await planClick(760, 0); await planClick(1000, 0);
  C = await curtains();
  ok(C[0].u.map((l) => l[0]).join() === '1000,1500,3000,4500', 'moved: click the line at 750, then 1000', C[0].u.join(' '));
  await page.selectOption('[data-cg-act]', 'remove');
  await planClick(1010, 0);
  C = await curtains();
  ok(C[0].u.map((l) => l[0]).join() === '1500,3000,4500' && C[0].plates === 8, 'removed: a click on the line at 1000', C[0].u.join(' '));
  await page.selectOption('[data-cg-act]', 'spacing'); await setRow('[data-cg-every]', '2000');
  await planClick(3000, 0);
  C = await curtains();
  ok(C[0].u.map((l) => l[0]).join() === '2000,4000' && C[0].plates === 6, 'by spacing 2000: lines at 2000 and 4000, 6 panes', C[0].u.join(' '));
  await undo();
  C = await curtains();
  ok(C[0].u.map((l) => l[0]).join() === '1500,3000,4500', 'Undo puts the three lines back (one step)');

  // ---------------------------------------------------------------- 3 Mullion
  console.log('== 3 Mullion');
  await ribbon('mullion');
  ok(await tool() === 'mullion', 'the ribbon\'s Mullion starts the tool');
  await page.selectOption('[data-mu-dir]', 'u'); await page.selectOption('[data-mu-on]', '0');
  await planClick(3000, 0);
  C = await curtains();
  ok(C[0].u.map((l) => l[1]).join() === 'true,false,true' && C[0].members === 4 + 2 + 3, 'Remove on the upright line clicked (3000): its mullion goes, the level mullion runs through it (9 pieces)', C[0].members);
  await page.selectOption('[data-mu-dir]', 'all'); await page.selectOption('[data-mu-on]', '1'); await page.selectOption('[data-mu-profile]', '80x200');
  await planClick(3000, 0);
  C = await curtains();
  ok(C[0].u.every((l) => l[1]) && C[0].members === 11 && await inPage(() => { const c = window.bimcraftCurtain.state.list[0]; return c.mullion.width === 80 && c.mullion.depth === 200; }), 'Place on every line with profile 80 x 200: 11 pieces of 80 x 200');
  await undo();
  ok(await inPage(() => window.bimcraftCurtain.state.list[0].mullion.width === 50) && (await curtains())[0].u.map((l) => l[1]).join() === 'true,false,true', 'Undo: 50 x 150 again, the line at 3000 without its mullion');
  // Properties and the schedule
  await ribbon('select').catch(() => {});
  await inPage(() => { const A = window.bimcraftRes.api, c = window.bimcraftCurtain.state.list[0]; A.host.select([A.kb() + c.plates[0]]); });
  await page.waitForTimeout(600);
  const props = await inPage(() => ({ panes: document.querySelector('[data-mp-cwpanes]')?.textContent, lines: document.querySelectorAll('[data-mp-cwlinesu] [data-mp-cwline]').length, boxes: document.querySelectorAll('[data-mp-cwlinesu] input[type="checkbox"]').length }));
  ok(props.panes === '8' && props.lines === 3 && props.boxes === 3, 'a pane picked in 3D shows its system in Properties: 8 panes, the three upright lines each with its place and its mullion tick', JSON.stringify(props));
  const sch = await inPage(() => { const s = window.bimcraftCurtain.api.schedule(); return s ? { head: s.head.length, row: s.rows[0], nums: s.nums[0] } : null; });
  ok(sch && sch.nums[2] === 8 && near(sch.nums[3], 18e6) && sch.row[5] === '8', 'Schedules has a Curtain systems list: 6000 x 3000, 8 panes, 18 m2 gross', JSON.stringify(sch?.row));
  await inPage(() => window.bimcraftRes.api.host.select([]));

  // ---------------------------------------------------------------- 5 Set Work Plane, 6 Show Work Plane
  console.log('== 5 Set Work Plane, 6 Show Work Plane');
  let P = await wp();
  ok(P.kind === 'level' && !P.stored && P.o[2] === 0, 'before any is set, the work plane is the lowest level');
  await ribbon('workplane');
  ok(await tool() === 'workplane' && await inPage(() => document.querySelector('[data-wp-level]').options.length === 3), 'the ribbon\'s Set Work Plane starts the tool; its row lists the two levels');
  const L2 = await inPage(() => window.bimcraftPlan.state.data.levels[1].guid);
  await page.selectOption('[data-wp-level]', L2); await page.waitForTimeout(400); await L.settled();
  P = await wp();
  ok(P.kind === 'level' && P.ref === L2 && P.o[2] === 3000 && P.stored, 'a level picked: the work plane is Level 2 (z = 3000), kept in the file');
  await planClick(3000, 20);
  P = await wp();
  ok(P.kind === 'line' && P.ref === G && near(P.n[2], 0, 1e-9) && near(Math.abs(P.n[1]), 1, 1e-9), 'a click on the curtain system\'s line in the plan: the upright plane through it', JSON.stringify(P.n));
  await undo();
  ok((await wp()).kind === 'level', 'Undo goes back to Level 2');
  await ribbon('showplane');
  const shown = await inPage(() => { const v = window.bimcraftRes.api.host.viewer(), o = v.overlays?.get('workplane'), pv = window.bimcraftPlan.view; return { on: window.bimcraftWorkPlane.state.show, pressed: document.querySelector('[data-wp-show]').getAttribute('aria-pressed'), faces: o?.userData.counts.faces, lines: o?.userData.counts.lines, plan: pv.scene.symbols.filter((s) => s.wp).length }; });
  ok(shown.on && shown.pressed === 'true' && shown.faces === 1 && shown.lines > 4 && shown.plan === 1, 'the ribbon\'s Show Work Plane: on; the 3D view has the plane (a tinted sheet and its grid), the plan its outline', JSON.stringify(shown));
  await ribbon('showplane');
  ok(await inPage(() => !window.bimcraftWorkPlane.state.show && !window.bimcraftRes.api.host.viewer().overlays?.get('workplane') && !window.bimcraftPlan.view.scene.symbols.some((s) => s.wp)), 'again: off, gone from the 3D view and the plan');
  await ribbon('showplane');

  // ---------------------------------------------------------------- 7 Reference Plane
  console.log('== 7 Reference Plane');
  await ribbon('referenceplane');
  ok(await tool() === 'refplane', 'the ribbon\'s Reference Plane starts the tool');
  await planClick(2500, -1000); await planClick(2500, 5000);
  P = await wp();
  ok(P.refs.length === 1 && P.refs[0].name === 'Reference plane 1' && near(P.refs[0].len, 6000), 'two clicks in the plan: Reference plane 1, 6000 long', JSON.stringify(P.refs));
  const refShown = await inPage(() => { const A = window.bimcraftRes.api, r = window.bimcraftWorkPlane.state.refs[0], pv = window.bimcraftPlan.view, s = pv.scene.symbols.find((x) => x.key === A.kb() + r.id), o = A.host.viewer().overlays?.get('refplanes'); return { dashed: s?.dashed.length, label: pv.scene.rooms.some((x) => x.label?.[0] === r.name), d3: o?.userData.counts.dashed }; });
  ok(refShown.dashed === 1 && refShown.label && refShown.d3 === 4, 'drawn as a dashed named line in the plan and as a dashed outline in the 3D view', JSON.stringify(refShown));
  await ribbon('workplane');
  await page.selectOption('[data-wp-ref]', P.refs[0].guid); await page.waitForTimeout(400); await L.settled();
  P = await wp();
  ok(P.kind === 'reference' && P.ref === P.refs[0].guid && near(Math.abs(P.n[0]), 1, 1e-9) && near(P.o[0], 2500), 'picked by name in Set Work Plane: the work plane is the upright plane x = 2500', JSON.stringify([P.kind, P.n, P.o]));
  await L.shot('7-refplane');

  // ---------------------------------------------------------------- 8 Work Plane Viewer
  console.log('== 8 Work Plane Viewer');
  await ribbon('viewer');
  await page.waitForSelector('[data-wpv-dialog][open]', { timeout: 15000 });
  const cut = await inPage(() => { const c = window.bimcraftWorkPlane.api.section(); return { els: c.length, segs: c.reduce((n, x) => n + x.segs.length / 4, 0), drawn: !!document.querySelector('[data-wpv-cut]'), levels: document.querySelectorAll('[data-wpv-level]').length }; });
  ok(cut.els >= 2 && cut.segs >= 8 && cut.drawn && cut.levels === 2, 'the ribbon\'s Work Plane Viewer opens: the model cut by the plane (the panes and the level mullion it crosses), the two levels', JSON.stringify(cut));
  await page.click('[data-wpv-tool="line"]');
  await inPage(() => { const a = window.bimcraftWorkPlane.api; a.viewerClick([1500, 500]); a.viewerClick([4500, 2500]); });
  await page.waitForTimeout(500); await L.settled();
  P = await wp();
  const vl = P.lines[0];
  ok(P.lines.length === 1 && vl.kind === 'line' && near(vl.len, Math.hypot(3000, 2000), 0.01) && near(Math.abs(vl.n[0]), 1, 1e-9) && await inPage(() => !!document.querySelector('[data-wpv-line]')), 'a line drawn in the viewer lies on the upright plane: 3605.55 long, shown in the viewer', JSON.stringify(vl));
  await page.click('[data-wpv-tool="text"]');
  await page.fill('[data-wpv-text]', 'A1');
  await inPage(() => window.bimcraftWorkPlane.api.viewerClick([500, 1200]));
  await page.waitForFunction(() => window.bimcraftWorkPlane.state.texts.length === 1, null, { timeout: 30000 }); await L.settled();
  P = await wp();
  ok(P.texts[0].text === 'A1' && P.texts[0].h === 300 && near(Math.abs(P.texts[0].n[0]), 1, 1e-9) && P.texts[0].area > 10000, 'a model text typed and placed in the viewer stands on the upright plane ("A1", 300 high)', JSON.stringify(P.texts[0]));
  await L.shot('8-viewer');
  // pick the line with a real click in the viewer and delete it, then undo
  await page.click('[data-wpv-tool="select"]');
  const mid = await inPage(() => { const n = document.querySelector('[data-wpv-line]'), svg = n.ownerSVGElement, p = n.getPointAtLength(n.getTotalLength() / 2), pt = svg.createSVGPoint(); pt.x = p.x; pt.y = p.y; const q = pt.matrixTransform(svg.getScreenCTM()); return [q.x, q.y]; });
  await page.mouse.click(mid[0], mid[1]); await page.waitForTimeout(300);
  ok(await inPage(() => window.bimcraftWorkPlane.state.v.sel?.kind === 'modelline' && !document.querySelector('[data-wpv-delete]').disabled), 'a real click on the line in the viewer picks it');
  await page.click('[data-wpv-delete]'); await page.waitForTimeout(400); await L.settled();
  ok((await wp()).lines.length === 0, 'Delete removes it');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(600); await L.settled();
  ok((await wp()).lines.length === 1, 'Ctrl+Z in the viewer brings it back');
  await page.click('[data-wpv-look]'); await page.waitForTimeout(500);
  ok(await inPage(() => { const v = window.bimcraftRes.api.host.viewer(), d = v.camera.position.clone().sub(v.controls.target).normalize(); return Math.abs(Math.abs(d.x) - 1) < 1e-3; }), 'Look at it in 3D: the camera looks along the plane\'s normal (X)');
  await page.click('[data-wpv-close]'); await page.waitForTimeout(300);
  ok(await inPage(() => !document.querySelector('[data-wpv-dialog]')), 'the viewer closes');

  // ---------------------------------------------------------------- 10 Model Line, 9 Model Text (in the plan, on a level plane)
  console.log('== 10 Model Line, 9 Model Text');
  await ribbon('modelline');
  ok(await tool() === 'modelline' && await page.waitForSelector('[data-wpv-dialog][open]', { timeout: 10000 }).then(() => true, () => false), 'Model Line on an upright work plane opens the viewer (a plan cannot point at a height)');
  await page.click('[data-wpv-close]');
  await ribbon('workplane');
  const L1 = await inPage(() => window.bimcraftPlan.state.data.levels[0].guid);
  await page.selectOption('[data-wp-level]', L1); await page.waitForTimeout(400); await L.settled();
  await ribbon('modelline');
  await page.selectOption('[data-wp-linekind]', 'polyline');
  await planClick(500, 2000); await planClick(3500, 2000); await planClick(3500, 6000); await planClick(500, 2000);
  P = await wp();
  const pl = P.lines.find((l) => l.kind === 'polyline');
  ok(pl && pl.closed && near(pl.len, 12000, 0.01) && near(pl.n[2], 1), 'a polyline of three clicks, closed on its first point, on Level 1\'s plane: 3000 + 4000 + 5000 = 12 000', JSON.stringify(pl));
  await page.selectOption('[data-wp-linekind]', 'arc');
  await planClick(6000, 3000); await planClick(5000, 4000); await planClick(4000, 3000);
  P = await wp();
  const ar = P.lines.find((l) => l.kind === 'arc');
  ok(ar && near(ar.len, Math.PI * 1000, 0.01), 'an arc of three clicks: half a circle of radius 1000, 3141.59 long', ar?.len);
  const lineShown = await inPage(() => { const A = window.bimcraftRes.api, S = window.bimcraftWorkPlane.state, pv = window.bimcraftPlan.view, o = A.host.viewer().overlays?.get('modellines'); return { plan: S.lines.filter((l) => pv.scene.symbols.some((s) => s.key === A.kb() + l.id)).length, d3: o?.userData.counts.lines }; });
  ok(lineShown.plan === 3 && lineShown.d3 > 20, 'the plan draws the three lines of its level (the one on the upright plane seen from above); the 3D view draws all three (the arc as chords)', JSON.stringify(lineShown));
  await undo();
  ok((await wp()).lines.length === 2, 'Undo removes the arc (one step)');
  await ribbon('modeltext');
  ok(await tool() === 'modeltext', 'the ribbon\'s Model Text starts the tool');
  await page.fill('[data-wp-text]', 'LOBBY'); await setRow('[data-wp-texth]', '400'); await setRow('[data-wp-textd]', '60');
  await planClick(1000, 4000);
  await page.waitForFunction(() => window.bimcraftWorkPlane.state.texts.length === 2, null, { timeout: 30000 }); await L.settled();
  P = await wp();
  const lob = P.texts.find((x) => x.text === 'LOBBY');
  K = await keys3d();
  ok(lob && lob.h === 400 && lob.d === 60 && near(lob.n[2], 1) && K.includes(lob.id), '"LOBBY" 400 high, 60 deep on Level 1\'s plane; the 3D view has its solid', JSON.stringify(lob));
  const tb = await inPage((id) => { const v = window.bimcraftRes.api.host.viewer(), b = v.keyBounds([id]); return b ? [b.max[1] - b.min[1], b.max[0] - b.min[0]] : null; }, lob.id);
  ok(tb && near(tb[0], 0.06, 0.001) && tb[1] > 1.2, 'its box in the 3D view: 60 mm tall off the floor, over 1.2 m wide', JSON.stringify(tb));
  await inPage((id) => { const A = window.bimcraftRes.api; A.host.select([A.kb() + id]); }, lob.id); await page.waitForTimeout(600);
  ok(await inPage(() => document.querySelector('[data-mp-wptext]')?.value === 'LOBBY' && !!document.querySelector('[data-mp-wpvol]')), 'picked, Properties has its words, height, depth, face area and volume');
  await page.fill('[data-mp-wptext]', 'HALL'); await page.press('[data-mp-wptext]', 'Enter');
  await page.waitForFunction(() => window.bimcraftWorkPlane.state.texts.some((x) => x.text === 'HALL'), null, { timeout: 30000 }); await L.settled();
  await undo();
  ok((await wp()).texts.some((x) => x.text === 'LOBBY'), 'changed to "HALL" in Properties, and back to "LOBBY" with Undo');
  await inPage(() => window.bimcraftRes.api.host.select([]));
  await L.shot('9-text');

  // ---------------------------------------------------------------- 4 By Face
  console.log('== 4 By Face');
  // a free-standing wall 4000 long to give a face
  await inPage(async () => { const O = await import('/assets/apps/bimcraft/dev/model-ops.js'); const A = window.bimcraftRes.api, lv = A.S.data.levels[0]; A.commit(O.drawWalls({ storey: lv.guid, segs: [{ a: [8000, 2000], b: [8000, 6000] }], typeKey: 'int-2x4', height: 3000 }), { label: 'Wall', verb: 'Drew' }); });
  await L.settled(); await page.waitForTimeout(500);
  await viewTab('3D');
  await ribbon('byface');
  ok(await tool() === 'byface' && /flat face/.test(await inPage(() => document.querySelector('[data-status]')?.textContent || '')), 'in the 3D view, the ribbon\'s By Face starts the tool and says what to click');
  const wallKey = await inPage(() => { const A = window.bimcraftRes.api, w = A.S.data.walls[0]; return A.kb() + w.id; });
  await inPage((k) => { const v = window.bimcraftRes.api.host.viewer(); v.view('side'); v.frameKeys([k]); }, wallKey); await page.waitForTimeout(800);
  const sp = await inPage((k) => window.bimcraftRes.api.host.viewer().screenOf(k), wallKey);
  ok(await tool() === 'byface' && !!sp, 'the 3D view is up with the tool still on');
  const before = (await curtains()).length;
  await page.mouse.move(sp.x, sp.y); await page.mouse.down(); await page.mouse.up();
  await page.waitForFunction((n) => window.bimcraftCurtain.state.list.length === n + 1, before, { timeout: 30000 }).catch(() => {});
  await L.settled();
  C = await curtains();
  const fc = C.find((c) => c.source === 'face');
  const wallGuid = await inPage(() => window.bimcraftRes.api.S.data.walls[0].guid);
  // the wall's side face: 4000 long, 3000 high = 12 m2; a line every 1500 along it: 3 panes; mullions round the border and on the 2 lines
  ok(fc && fc.host === wallGuid && near(fc.t.area, 12e6, 2000) && fc.plates === 3 && near(Math.abs(fc.n[0]), 1, 1e-6), 'a real click on the wall\'s face in the 3D view: a curtain system on that face (4000 x 3000 = 12 m2, 3 panes), its host the wall', JSON.stringify(fc && [fc.host, fc.t, fc.n]));
  await L.shot('4-byface');
  await undo();
  ok((await curtains()).length === before, 'Undo takes it away (one step)');
  await page.selectOption('[data-bf-make]', 'wall').catch(() => {});
  const nw = await inPage(() => window.bimcraftRes.api.S.data.walls.length);
  await page.mouse.move(sp.x, sp.y); await page.mouse.down(); await page.mouse.up();
  await page.waitForFunction((n) => window.bimcraftPlan.state.data.walls.length === n + 1, nw, { timeout: 30000 }).catch(() => {});
  await L.settled();
  const made = await inPage(() => { const W = window.bimcraftRes.api.S.data.walls; return W.length === 2 ? { len: W[1].len, h: W[1].height } : null; });
  ok(made && near(made.len, 4000, 2) && near(made.h, 3000, 2), 'Make: Wall on the same face: a wall along its foot, 4000 long, 3000 high', JSON.stringify(made));
  await undo();
  await page.selectOption('[data-bf-make]', 'curtain').catch(() => {});

  // ---------------------------------------------------------------- the elevation panel
  console.log('== the elevation panel, save and reopen, the other layout, the menu styles');
  await inPage(() => window.bimcraftElevEdit.open('elevation:south')); await page.waitForSelector('[data-ev-dialog][open]', { timeout: 15000 });
  const ev = await inPage(() => ({ lines: document.querySelectorAll('[data-wp-evline]').length, refs: document.querySelectorAll('[data-wp-evref]').length, plane: document.querySelectorAll('[data-wp-evplane]').length }));
  ok(ev.lines === 2 && ev.refs === 1 && ev.plane === 1, 'the south elevation shows the model lines, the reference plane and (Show Work Plane is on) the work plane', JSON.stringify(ev));
  await inPage(() => window.bimcraftElevEdit.close());
  // the Auto-revise layout
  await inPage(() => window.ccShellWorkspace.set('autorev')); await page.waitForTimeout(2000);
  await inPage(() => window.bimcraftRes.api.host.select([])); await page.waitForTimeout(500);
  await page.click('[data-ws-tab="architecture"]'); await page.waitForTimeout(700);
  const st2 = await inPage((TEN) => TEN.map((k) => { const b = document.querySelector('[data-ws-command="' + k + '"]'); return k + ':' + (b ? b.getAttribute('aria-disabled') + ':' + b.classList.contains('ws-notbuilt') : 'missing'); }), TEN);
  ok(await inPage(() => document.querySelector('main')?.dataset.wsLayout === 'autorev') && st2.every((s) => /:false:false$/.test(s)), 'the "Auto-revise" layout has the ten tools on too', st2.join(' '));
  await page.click('[data-ws-command="modelline"]'); await page.waitForTimeout(600);
  ok(await tool() === 'modelline', 'its Model Line button starts the tool');
  await page.keyboard.press('Escape');
  // save, and open the saved file again in the page
  const bytes = await inPage(() => Array.from(window.bimcraftRes.api.ed().save()));
  const text = Buffer.from(bytes).toString('latin1');
  ok(/IFCCURTAINWALL\(/.test(text) && /IFCPLATE\(/.test(text) && /IFCMEMBER\(/.test(text) && /'ReferencePlane'/.test(text) && /'ModelLine'/.test(text) && /'ModelText'/.test(text) && /CadCraft_WorkPlane/.test(text), 'the saved IFC holds the curtain wall with its plates and members, the reference plane, the model lines, the model text and the work plane');
  await inPage(() => window.ccShellWorkspace.set('standard')); await page.waitForTimeout(1500);
  page.once('dialog', (d) => d.accept().catch(() => {}));
  await page.setInputFiles('input[type="file"][data-file-input], input[type="file"]', { name: 'tools-b.ifc', mimeType: 'application/x-step', buffer: Buffer.from(bytes) });
  await page.waitForFunction(() => /tools-b\.ifc/.test(document.title + ' ' + (document.querySelector('[data-status]')?.textContent || '')), null, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await inPage(() => { const t = document.querySelector('[data-model-toggle]'); if (t.getAttribute('aria-pressed') !== 'true') t.click(); }); await page.waitForTimeout(1200); await L.settled();
  C = await curtains(); P = await wp();
  ok(C.length === 1 && C[0].guid === G && C[0].plates === 8 && C[0].u.map((l) => l[1]).join() === 'true,false,true', 'opened again: the curtain system with its grid, its 8 panes and the line without a mullion', JSON.stringify(C.map((c) => [c.plates, c.u])));
  ok(P.stored && P.kind === 'level' && P.refs.length === 1 && P.refs[0].name === 'Reference plane 1' && P.lines.length === 2 && P.texts.map((x) => x.text).sort().join() === 'A1,LOBBY', 'opened again: the work plane, the reference plane, two model lines, the texts "A1" and "LOBBY"', JSON.stringify([P.kind, P.refs.length, P.lines.length, P.texts.map((x) => x.text)]));

  // every menu style runs the same commands
  const CMDS = { 'curtain.system': 'curtain', 'curtain.grid': 'curtaingrid', 'curtain.mullion': 'mullion', 'model.byface': 'byface', 'workplane.set': 'workplane', 'workplane.reference': 'refplane', 'model.text': 'modeltext', 'model.line': 'modelline' };
  for (const style of ['home', 'ribbon', 'drafting', 'viewer']) {
    await inPage((id) => window.ccInput.setStyle(id), style); await page.waitForTimeout(700);
    const res = [];
    for (const [id, name] of Object.entries(CMDS)) { await inPage((id) => window.ccInput.run(id), id); await page.waitForTimeout(250); res.push(await tool() === name ? '' : id); await page.keyboard.press('Escape'); }
    await inPage(() => window.ccInput.run('workplane.show')); await page.waitForTimeout(250);
    const toggled = await inPage(() => window.bimcraftWorkPlane.state.show);
    await inPage(() => window.ccInput.run('workplane.show')); await page.waitForTimeout(250);
    await inPage(() => window.ccInput.run('workplane.viewer')); await page.waitForTimeout(500);
    const vw = await inPage(() => !!document.querySelector('[data-wpv-dialog][open]'));
    await inPage(() => document.querySelector('[data-wpv-close]')?.click());
    const placed = await inPage((ids) => { const have = new Set([...document.querySelectorAll('.cc-inbar [data-cmd], [role="menu"] [data-cmd]')].map((b) => b.dataset.cmd)); return ids.filter((i) => !have.has(i)); }, [...Object.keys(CMDS), 'workplane.show', 'workplane.viewer']);
    ok(res.every((x) => !x) && toggled !== await inPage(() => window.bimcraftWorkPlane.state.show) && vw, `menu style ${style}: the ten commands run (eight start their tool, Show toggles, the Viewer opens)`, res.filter(Boolean).join(' ') + ' show:' + toggled + ' viewer:' + vw);
    ok(placed.length === 0, `menu style ${style}: each of the ten has a place in its menus`, placed.join(' '));
  }
  await inPage(() => window.ccInput.setStyle('cadcraft'));
  if (refused.length && refused.every(([st, u]) => st === 429 && /\/api\/v1\/hardware$/.test(u))) for (let i = L.problems.length - 1; i >= 0; i--) if (/status of 429/.test(L.problems[i])) L.problems.splice(i, 1);
  code = L.done();
} catch (e) { console.log('  FAIL the run threw: ' + (e.stack || e)); await L.shot('error').catch(() => {}); }
await L.close();
process.exit(code);
