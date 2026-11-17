#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-elevation.mjs — the ribbon's Elevation and Tile Views (0.10 BT.10, BT.11) in the real page (/lab/bimcraft, headless), in the
 * "Ribbon and project browser" (docked) layout.
 *   node tools/bimcraft-test/browser-elevation.mjs [--shots <dir>]   (as root)
 * Elevation: the View tab's button starts the tool; two clicks (where it stands, the way it looks) place an elevation marker; the plan
 * draws it; the Project Browser lists "Elevation 1" under Elevations (not Sections); its view draws the walls in front of it; it opens
 * in the elevation editor; undo / redo; a second one is "Elevation 2"; a section line drawn after is still "Section A"; the saved file
 * opened again has them. Tile Views: the plan and the 3D view side by side. Then the classic layout: the Draw tool and the command.
 */
import { openLab } from './bk-page.mjs';

const L = await openLab({ tag: 'bkelev', units: 'mm' });
const { page, ok, inPage } = L;
page.on('response', (r) => { if (r.status() >= 400) console.log('  note ' + r.status() + ': ' + r.url().slice(0, 140)); });
const planClick = async (x, y) => { await inPage(([x, y]) => { window.bimcraftPlan.move([x, y]); window.bimcraftPlan.click([x, y]); }, [x, y]); await page.waitForTimeout(250); await L.settled(); };
const tab = async (name) => { await page.click('[data-ws-tab="' + name + '"]'); await page.waitForTimeout(500); };
const ribbon = async (cmd) => { await page.click('.ws-ribbon [data-ws-command="' + cmd + '"]'); await page.waitForTimeout(600); };
const tool = () => inPage(() => window.bimcraftPlan.state.tool);
const lines = () => inPage(() => window.bimcraftRes.state.secs.map((s) => ({ guid: s.guid, id: s.id, name: s.name, kind: s.kind, a: s.a, b: s.b, look: s.look })));
const press = async (what) => { const sel = (await inPage((w) => [...document.querySelectorAll('[data-ws-command="' + w + '"]')].some((b) => b.offsetParent), what)) ? '[data-ws-command="' + what + '"]:visible' : '[data-' + what + ']'; await page.locator(sel).first().click(); await page.waitForTimeout(500); await L.settled(); };
const near = (a, b, tol = 1) => Math.abs(a - b) <= tol;
let code = 1;
try {
  await L.newBuilding({ name: 'Elevation', levels: 2, height: '3000 mm' });
  // a 6 x 4 m room
  await L.tool('wall');
  await L.frame(-4000, -5000, 10000, 9000);
  for (const [x, y] of [[0, 0], [6000, 0], [6000, 4000], [0, 4000], [0, 0]]) await planClick(x, y);
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  ok((await L.walls()).length === 4, 'four walls drawn', (await L.walls()).length);

  await inPage(() => window.ccShellWorkspace.set('docked')); await page.waitForTimeout(2000);
  ok(await inPage(() => document.querySelector('main')?.dataset.wsLayout === 'docked'), 'the "Ribbon and project browser" layout is on');
  await tab('view');
  const st = await inPage(() => ['elevation', 'tile'].map((k) => { const b = document.querySelector('.ws-ribbon [data-ws-command="' + k + '"]'); return k + ':' + (b ? b.getAttribute('aria-disabled') + ':' + b.classList.contains('ws-notbuilt') : 'missing'); }));
  ok(st.every((s) => /:false:false$/.test(s)), 'View tab: Elevation and Tile Views are enabled, not marked "not built"', st.join(' '));

  // ---------------------------------------------------------------- Elevation
  console.log('== Elevation');
  await ribbon('elevation');
  ok(await tool() === 'elevation', 'the ribbon\'s Elevation starts the tool (no "Not built" box)', await tool());
  ok(!(await page.$('dialog[open]')), 'no dialog is open');
  await L.frame(-4000, -5000, 10000, 9000);
  await planClick(3000, -3000); await planClick(3000, 0);   // south of the room, looking north
  let S = await lines();
  ok(S.length === 1 && S[0].kind === 'elevation' && S[0].name === '1', 'two clicks: one elevation marker, named 1', JSON.stringify(S));
  const G = S[0]?.guid;
  const dirOk = await inPage(async (g) => { const m = await import('/assets/apps/bimcraft/dev/res-sheets.js'); const s = window.bimcraftRes.state.secs.find((x) => x.guid === g); const e = m.elevationMarkerOf(s); return [e.at, e.dir, m.sectionTitle(s)]; }, G);
  ok(near(dirOk[0][0], 3000) && near(dirOk[0][1], -3000) && near(dirOk[1][0], 0, 1e-6) && near(dirOk[1][1], 1, 1e-6) && dirOk[2] === 'Elevation 1', 'it stands at 3000, -3000 and looks north; it is called "Elevation 1"', JSON.stringify(dirOk));
  const sym = await inPage(() => { const pv = window.bimcraftPlan.view, kb = window.bimcraftRes.api.kb(), s = window.bimcraftRes.state.secs[0]; const y = pv.scene.symbols.find((x) => x.key === kb + s.id), r = pv.scene.rooms.find((x) => x.key === kb + s.id); return y ? { lines: y.lines.length, label: r?.label } : null; });
  ok(sym && sym.lines === 26 && sym.label?.[0] === '1', 'the plan draws the marker: a circle, a pointer and its number', JSON.stringify(sym));
  await L.shot('1-marker');
  // the Project Browser
  const pb = await inPage((g) => { const row = document.querySelector('[data-pb-section="' + g + '"]'); const inGroup = (n) => { let p = n; while (p && !(p.matches?.('details, section, li') && /Elevations|Sections/.test(p.querySelector('summary, h3, h4, .bc-pb-head')?.textContent || ''))) p = p.parentElement; return p ? (p.querySelector('summary, h3, h4, .bc-pb-head')?.textContent || '').trim() : ''; }; return row ? { text: row.textContent.trim(), marker: row.getAttribute('data-pb-elevmarker'), group: inGroup(row), sideGroup: inGroup(document.querySelector('[data-pb-elev="north"]')) } : null; }, G);
  ok(pb && /Elevation 1/.test(pb.text) && pb.marker === '1' && pb.group === pb.sideGroup && /Elevations/.test(pb.group), 'the Project Browser lists "Elevation 1" under Elevations, with the four sides', JSON.stringify(pb));
  // its view: the sheets' input
  const view = await inPage((g) => { const inp = window.bimcraftRes.api.host && window.bimcraftViews.api ? null : null; const i = window.bimcraftRes.state && window.bimcraftPlan ? window.bimcraftRes.api.ask?.('sheetInput') : null; const v = (i?.sections || []).find((x) => x.ref === g); return v ? { title: v.title, bounds: v.view.bounds, lines: (v.view.lines || v.view.visible || []).length, keys: Object.keys(v.view) } : null; }, G);
  ok(view && view.title === 'Elevation 1' && view.bounds, 'the sheets have its view, titled "Elevation 1", with something drawn in it', JSON.stringify(view)?.slice(0, 300));
  // the elevation editor
  await inPage((g) => document.querySelector('[data-pb-elevedit="section:' + g + '"]').click(), G);   // the row's own button (its group may be folded)
  await page.waitForSelector('[data-ev-dialog][open]');
  await page.waitForSelector('[data-ev-wall]', { state: 'attached' });
  const ev = await inPage(() => ({ walls: document.querySelectorAll('[data-ev-wall]').length, levels: document.querySelectorAll('[data-ev-level]').length, title: document.querySelector('[data-ev-dialog] h2, [data-ev-dialog] [data-ev-title]')?.textContent || '' }));
  ok(ev.walls >= 2 && ev.levels === 2, 'it opens in the elevation editor: the walls that face it (south and north) and both levels', JSON.stringify(ev));
  ok(/Elevation 1/.test(ev.title), 'the editor names it "Elevation 1"', ev.title);
  await L.shot('2-editor');
  await inPage(() => window.bimcraftElevEdit.close()); await page.waitForTimeout(300);
  // undo / redo
  await press('undo');
  ok((await lines()).length === 0, 'Undo takes the marker away');
  await press('redo');
  S = await lines();
  ok(S.length === 1 && S[0].guid === G, 'Redo brings it back');
  // a second one, then a section line
  await tab('view'); await ribbon('elevation');
  await planClick(9000, 2000); await planClick(6000, 2000);   // east of the room, looking west
  S = await lines();
  ok(S.length === 2 && S.filter((x) => x.kind === 'elevation').map((x) => x.name).sort().join() === '1,2', 'a second one is "2"', JSON.stringify(S.map((x) => [x.kind, x.name])));
  await ribbon('section');
  await planClick(-1000, 2000); await planClick(7000, 2000);
  S = await lines();
  ok(S.length === 3 && S.find((x) => x.kind === 'section')?.name === 'A', 'a section line drawn after is still "Section A"', JSON.stringify(S.map((x) => [x.kind, x.name])));
  const groups = await inPage(() => ({ elevs: document.querySelectorAll('[data-pb-elevmarker]').length, secs: [...document.querySelectorAll('[data-pb-section]')].filter((r) => !r.hasAttribute('data-pb-elevmarker')).length }));
  ok(groups.elevs === 2 && groups.secs === 1, 'Project Browser: two placed elevations, one section', JSON.stringify(groups));
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);

  // ---------------------------------------------------------------- Tile Views
  console.log('== Tile Views');
  await tab('view'); await ribbon('tile');
  await page.waitForTimeout(800);
  const tile = await inPage(() => { const st = document.querySelector('.bc-stage'), plan = document.querySelector('[data-plan-wrap]'), c3 = document.querySelector('[data-canvas-wrap]'); const vis = (n) => { if (!n) return null; const r = n.getBoundingClientRect(), cs = getComputedStyle(n); return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), shown: cs.visibility !== 'hidden' && cs.display !== 'none' }; }; return { split: st.classList.contains('is-plan-split'), layout: window.bimcraftPlan.state.layout, plan: vis(plan), three: vis(c3) }; });
  ok(tile.split && tile.layout === 'split' && tile.plan?.shown && tile.three?.shown && tile.plan.w > 200 && tile.three.w > 200 && tile.plan.h > 200 && tile.three.h > 200, 'Tile Views: the plan and the 3D view are both on screen', JSON.stringify(tile));
  ok(tile.three.x >= tile.plan.x + tile.plan.w - 2 && Math.abs(tile.plan.w - tile.three.w) <= 4, 'side by side, half each: the 3D view starts where the plan ends (neither covers the other)', JSON.stringify(tile));
  const div = await inPage(() => { const s = document.querySelector('[data-model-splitter]'), r = s.getBoundingClientRect(), p = document.querySelector('[data-plan-wrap]').getBoundingClientRect(); return { hidden: s.hidden || getComputedStyle(s).display === 'none', mid: Math.round(r.left + r.width / 2), edge: Math.round(p.right) }; });
  ok(!div.hidden && Math.abs(div.mid - div.edge) <= 2, 'the divider is between them', JSON.stringify(div));
  // a view tab goes back to one view
  await inPage(() => [...document.querySelectorAll('[data-ws-drawing]')].find((x) => /Level 1/.test(x.textContent))?.click()); await page.waitForTimeout(1000);
  const one = await inPage(() => ({ layout: window.bimcraftPlan.state.layout, w: Math.round(document.querySelector('[data-plan-wrap]').getBoundingClientRect().width), stage: Math.round(document.querySelector('.bc-stage').getBoundingClientRect().width), div: document.querySelector('[data-model-splitter]').hidden }));
  ok(one.layout === 'plan' && Math.abs(one.w - one.stage) <= 2 && one.div, 'a click on the Level 1 tab: the plan alone again, full width, no divider', JSON.stringify(one));
  await tab('view'); await ribbon('tile'); await page.waitForTimeout(600);
  ok(!(await page.$('dialog[open]')), 'no "Not built" box');
  await L.shot('3-tile');

  // ---------------------------------------------------------------- saved and opened again; the classic layout
  console.log('== Saved and opened again');
  const bytes = await inPage(() => Array.from(window.bimcraftRes.api.ed().save()));
  const text = Buffer.from(bytes).toString('latin1');
  ok(/'Elevation marker'/.test(text) && /'Section line'/.test(text) && /'Kind'/.test(text), 'the saved IFC holds the elevation markers (ObjectType "Elevation marker", Kind) and the section line');
  await inPage(() => window.ccShellWorkspace.set('standard')); await page.waitForTimeout(1500);
  page.once('dialog', (d) => d.accept().catch(() => {}));
  await page.setInputFiles('input[type="file"][data-file-input], input[type="file"]', { name: 'elevation.ifc', mimeType: 'application/x-step', buffer: Buffer.from(bytes) });
  await page.waitForFunction(() => /elevation\.ifc/.test(document.title + ' ' + (document.querySelector('[data-status]')?.textContent || '')), null, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await inPage(() => { const t = document.querySelector('[data-model-toggle]'); if (t.getAttribute('aria-pressed') !== 'true') t.click(); }); await page.waitForTimeout(1200); await L.settled();
  S = await lines();
  ok(S.length === 3 && S.filter((x) => x.kind === 'elevation').map((x) => x.name).sort().join() === '1,2' && S.some((x) => x.guid === G), 'opened again: Elevation 1 and 2 and Section A', JSON.stringify(S.map((x) => [x.kind, x.name])));
  console.log('== Classic layout');
  await L.tool('elevation');
  ok(await tool() === 'elevation', 'classic layout: Build has an Elevation tool');
  const hint = await inPage(() => document.querySelector('[data-model-hint]')?.textContent || '');
  ok(/where the elevation stands/.test(hint), 'its hint says what to click', hint);
  await page.keyboard.press('Escape');
  const cmd = await inPage(() => { const c = window.ccInput?.commands; const list = Array.isArray(c) ? c : c ? [...(c.values?.() || Object.values(c))] : []; const x = list.find((k) => k.id === 'build.elevation'); return x ? (x.label || x.id) : null; });
  ok(!!cmd, 'the Elevation command is in the command list for the menu styles', String(cmd));
  code = L.done();
} catch (e) { console.error(e); code = 1; }
await L.close();
process.exit(code);
