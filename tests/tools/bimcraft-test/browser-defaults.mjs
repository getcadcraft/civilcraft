#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-defaults.mjs: 0.10 DP.1 Default Policies in the real page (/lab/bimcraft, headless, real clicks), session
 * `bk-defaults-10`.   node tools/bimcraft-test/browser-defaults.mjs [--shots <dir>]   (run as root)
 *
 *   off      the add-on is off until switched on: no Settings section; policies left in storage by an earlier session change
 *            nothing (the New building dialog, the new building and the type lists are exactly as before)
 *   on       switched on with nothing set: still exactly as before
 *   set      the policies are set in Settings › BimCraft › Default Policies and Settings › Global › Default Policies with the
 *            real controls; the New building dialog shows them and says "from your Default Policies"; Create gives three named
 *            levels 2700 apart, sheet A-001 on A1 at 1:50, the Wall tool already on with Exterior masonry 300 mm [LOD 200];
 *            two clicks draw the first wall in that type
 *   file     Save to a file gives open JSON; Reset every policy; Load from a file brings them back; a file with an unknown
 *            policy loads and names what it left out
 *   none     "No first sheet": the new building has no sheet
 */
import fs from 'node:fs';
import { openLab } from './bk-page.mjs';

/** Two points of the plan as it is shown, on one horizontal line, with nothing over them (the Draw bar and the chips float over the plan). */
const FREE = () => { const cv = window.bimcraftPlan.view.canvas, c = cv.getBoundingClientRect(); const free = (x, y) => document.elementFromPoint(x, y) === cv;
  for (let fy = 0.95; fy >= 0.2; fy -= 0.025) { const y = c.top + c.height * fy, xs = []; for (let fx = 0.05; fx <= 0.95; fx += 0.05) { const x = c.left + c.width * fx; if ([[0, 0], [0, -14], [0, 14], [-45, 0], [45, 0], [-45, 14], [45, 14]].every(([dx, dy]) => free(x + dx, y + dy))) xs.push(x); }   // clear of the chips beside it too: their text changes as the pointer moves
    if (xs.length >= 2 && xs[xs.length - 1] - xs[0] >= 150) return [[xs[0], y], [xs[xs.length - 1], y]]; } return null; };
const ID = 'default-policies', KEY = 'cc-default-policies';
const STORED = { format: KEY, version: 1, office: 'Left over', policies: { 'bimcraft.wall.first': { metric: 'ext-300' }, 'bimcraft.levels.count': 4, 'bimcraft.wall.starterLod': 300, 'bimcraft.tool.afterCreate': 'wall', 'bimcraft.sheet.first': 'none' } };

/** A lab page with the add-on on or off and `stored` (or nothing) as the saved policies, set before the app starts. */
async function lab({ on, stored = null }) {
  const L = await openLab({ tag: 'bkdefaults', units: 'mm' });
  await L.page.evaluate(([id, key, on, stored]) => {
    localStorage.setItem('cc-addons:bimcraft', JSON.stringify(on ? { off: {}, on: { [id]: true } } : { off: {}, on: {} }));
    if (stored) localStorage.setItem(key, JSON.stringify(stored)); else localStorage.removeItem(key);
  }, [ID, KEY, on, stored]);
  await L.page.reload({ waitUntil: 'networkidle' });
  await L.page.waitForFunction((id) => !!window.ccAddons?.list().find((x) => x.id === id), ID, { timeout: 20000 });
  if (on) await L.page.waitForFunction((id) => window.ccAddons.list().find((x) => x.id === id)?.state === 'active', ID, { timeout: 20000 });
  return L;
}
const dialogState = () => ({ levels: document.querySelector('[data-new-levels]').value, height: document.querySelector('[data-new-height]').value, wall: document.querySelector('[data-new-walltype]').value,
  wallText: document.querySelector('[data-new-walltype]').selectedOptions[0].textContent, starts: document.querySelector('[data-new-starts]').textContent.replace(/\s+/g, ' ').trim(),
  marks: [...document.querySelectorAll('dialog.bc-new [data-new-policy]')].map((n) => n.dataset.newPolicy + ': ' + n.textContent.trim()) });
const built = () => { const S = window.bimcraftPlan.state; return { tool: S.tool, units: S.units, levels: S.data.levels.map((l) => [l.name, Math.round(l.elevation), Math.round(l.height)]),
  sheets: window.bimcraftViews.state.sheets.map((s) => ({ number: s.number, title: s.title, paper: s.paper, views: s.views.map((v) => [v.kind, v.ratio, v.x, v.y]) })),
  wallType: document.querySelector('[data-model-walltype]')?.value || '', typeTexts: [...(document.querySelector('[data-model-walltype]')?.options || [])].map((o) => o.textContent), changes: window.bimcraftRes.api.ed().changes.length }; };
const sections = async (page) => { await page.click('[data-settings-open]'); await page.waitForSelector('dialog[data-app-settings][open]'); const n = await page.evaluate(() => ({ global: !!document.querySelector('[data-dp-global]'), app: !!document.querySelector('[data-dp-app]') })); await page.keyboard.press('Escape'); await page.waitForSelector('dialog[data-app-settings][open]', { state: 'detached', timeout: 5000 }).catch(() => {}); return n; };
const asBefore = (ok, d, b, what) => {
  ok(d.levels === '2' && d.height === '3000 mm' && d.wall === 'ext-2x6' && /Exterior 2×6 \(184/.test(d.wallText) && !/LOD/.test(d.wallText) && d.marks.length === 0 && /A-101 \(A3, 1:100\)/.test(d.starts) && !/Wall tool ready/.test(d.starts), what + ': the dialog is as before (2 levels, 3000 mm, Exterior 2×6, A-101 on A3 at 1:100, no policy marks)', JSON.stringify(d));
  ok(b.tool === 'select' && JSON.stringify(b.levels) === JSON.stringify([['Level 1', 0, 3000], ['Level 2', 3000, 3000]]) && b.sheets.length === 1 && b.sheets[0].number === 'A-101' && b.sheets[0].paper === 'a3' && b.sheets[0].views[0][1] === 100 && b.changes === 0, what + ': the new building is as before (Level 1 and 2, sheet A-101, Select active)', JSON.stringify(b));
  ok(b.wallType === 'ext-2x6' && b.typeTexts.length === 11 && b.typeTexts.filter((x) => !/^Generic wall/.test(x)).every((x) => !/LOD/.test(x)), what + ': the Wall tool\'s type list has no LOD tags (but on the two generic walls of BK.15) and starts on Exterior 2×6', JSON.stringify(b.typeTexts));
};
let code = 0;

async function off() {
  const L = await lab({ on: false, stored: STORED });
  const { page, ok, inPage } = L;
  try {
    console.log('== off: bundled, off by default, and stored policies change nothing');
    const row = await inPage((id) => { const a = window.ccAddons.list().find((x) => x.id === id); return a && { state: a.state, source: a.source, name: a.manifest?.name || a.name }; }, ID);
    ok(row && row.state === 'off' && row.source === 'bundled' && row.name === 'Default Policies', 'Default Policies is a bundled add-on that is off', JSON.stringify(row));
    const s = await sections(page);
    ok(!s.global && !s.app, 'no Default Policies section in Settings');
    await L.newBuilding({ accept: false });
    const d = await inPage(dialogState);
    await page.click('[data-new-ok]'); await L.waitStatus(/^New building /); await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await L.settled();
    asBefore(ok, d, await inPage(built), 'add-on off, policies left in storage');
    return L.done();
  } catch (e) { ok(false, 'stopped: ' + (e.stack || e.message || e)); await L.shot('defaults-off-stopped'); L.done(); return 1; } finally { await L.close(); }
}

async function onUnset() {
  const L = await lab({ on: true });
  const { page, ok, inPage } = L;
  try {
    console.log('== on, nothing set: exactly as before');
    const s = await sections(page);
    ok(s.global && s.app, 'Settings has Default Policies under Global and under BimCraft');
    await L.newBuilding({ accept: false });
    const d = await inPage(dialogState);
    await page.click('[data-new-ok]'); await L.waitStatus(/^New building /); await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await L.settled();
    asBefore(ok, d, await inPage(built), 'add-on on, no policy set');
    return L.done();
  } catch (e) { ok(false, 'stopped: ' + (e.stack || e.message || e)); await L.shot('defaults-unset-stopped'); L.done(); return 1; } finally { await L.close(); }
}

async function setAndBuild() {
  const L = await lab({ on: true });
  const { page, ok, inPage } = L;
  const doc = () => inPage((k) => JSON.parse(localStorage.getItem(k) || 'null'), KEY);
  const openPane = async (tab) => {
    await page.click('[data-settings-open]'); await page.waitForSelector('dialog[data-app-settings][open]');
    const b = await page.$(`dialog[data-app-settings] [data-settings-tab="${tab}"]`); if (b) await b.click();
    await page.click('dialog[data-app-settings] .shell-sec-nav button:text-is("Default Policies") >> visible=true');
    await page.waitForSelector(tab === 'general' ? '[data-dp-global] [data-dp-office]' : '[data-dp-app] [data-dp="bimcraft.levels.count"]', { state: 'visible' });
  };
  const close = async () => { await page.keyboard.press('Escape'); await page.waitForSelector('dialog[data-app-settings][open]', { state: 'detached', timeout: 5000 }).catch(() => {}); };
  const sel = (id, sys) => `[data-dp-app] [data-dp="${id}"]` + (sys ? `[data-dp-system="${sys}"]` : '');
  const type = async (id, sys, text) => { await page.fill(sel(id, sys), text); await page.press(sel(id, sys), 'Tab'); };
  try {
    console.log('== set: Settings › BimCraft › Default Policies, with the real controls');
    await openPane('app');
    const ui = await inPage(() => { const fs = document.querySelector('[data-dp-app]'); return { lede: fs.querySelector('[data-dp-lede]').textContent, groups: [...fs.querySelectorAll('[data-dp-group]')].map((g) => g.textContent), rows: fs.querySelectorAll('[data-dp-row]').length,
      first: [...fs.querySelector('[data-dp="bimcraft.wall.first"][data-dp-system="metric"]').options].map((o) => o.textContent), own: fs.querySelector('[data-dp="bimcraft.levels.count"]').placeholder, legend: fs.querySelector('legend').textContent,
      wide: fs.scrollWidth <= fs.clientWidth + 1 }; });
    ok(/office defaults/.test(ui.lede) && /A project you already started is not changed/.test(ui.lede), 'it says: these are your office defaults; a project you already started is not changed');
    ok(ui.legend === 'Default Policies' && ui.rows === 13 && ui.groups.join() === 'Units,Levels,Walls,First sheet,After Create', '13 policies in five groups: ' + ui.groups.join(', '), JSON.stringify(ui));
    ok(/^BimCraft's own \(Exterior 2×6\)$/.test(ui.first[0]) && ui.first.length === 12 && ui.first.some((x) => /^Exterior masonry 300 mm \(300 mm\)$/.test(x)) && ui.own === "BimCraft's own (2)", 'each control starts on "BimCraft\'s own" and says what that is; the wall types are the eleven available ones (nine and the two generic walls of BK.15)', JSON.stringify([ui.first, ui.own]));
    ok(ui.wide, 'the section fits its pane (no sideways scroll)');
    await L.shot('defaults-1-settings-unset');
    await page.selectOption(sel('bimcraft.wall.first', 'metric'), 'ext-300');
    await type('bimcraft.levels.count', null, '3');
    await type('bimcraft.levels.name', null, 'Floor {nn0}');
    await type('bimcraft.levels.height', 'metric', '2700');
    await page.selectOption(sel('bimcraft.wall.starterLod'), '200');
    await page.selectOption(sel('bimcraft.sheet.paper', 'metric'), 'a1');
    await page.selectOption(sel('bimcraft.sheet.scale', 'metric'), '50');
    await type('bimcraft.sheet.number', 'metric', 'A-001');
    await type('bimcraft.sheet.title', 'metric', 'Plan: {level}');
    await page.selectOption(sel('bimcraft.tool.afterCreate'), 'wall');
    const want = { 'bimcraft.wall.first': { metric: 'ext-300' }, 'bimcraft.levels.count': 3, 'bimcraft.levels.name': 'Floor {nn0}', 'bimcraft.levels.height': { metric: 2700 }, 'bimcraft.wall.starterLod': 200,
      'bimcraft.sheet.paper': { metric: 'a1' }, 'bimcraft.sheet.scale': { metric: 50 }, 'bimcraft.sheet.number': { metric: 'A-001' }, 'bimcraft.sheet.title': { metric: 'Plan: {level}' }, 'bimcraft.tool.afterCreate': 'wall' };
    const same = (a, b) => Object.keys(b).length === Object.keys(a || {}).length && Object.keys(b).every((k) => JSON.stringify(a[k]) === JSON.stringify(b[k]));
    let d = await doc();
    ok(d && d.format === KEY && same(d.policies, want), 'ten policies are saved as set, each at once', JSON.stringify(d));
    const shown = await inPage(() => ({ height: document.querySelector('[data-dp-app] [data-dp="bimcraft.levels.height"][data-dp-system="metric"]').value, imp: document.querySelector('[data-dp-app] [data-dp="bimcraft.levels.height"][data-dp-system="imperial"]').value,
      marks: [...document.querySelectorAll('[data-dp-app] [data-dp-mark]')].filter((m) => m.textContent.trim()).length, msg: document.querySelector('[data-dp-app] [data-dp-msg]').textContent }));
    ok(shown.height === '2700 mm' && shown.imp === '' && shown.marks === 10 && /Saved/.test(shown.msg), 'the height reads back as "2700 mm", the imperial half stays BimCraft\'s own, ten rows are marked "set"', JSON.stringify(shown));
    await type('bimcraft.levels.count', null, '500');
    const refused = await inPage(() => ({ msg: document.querySelector('[data-dp-app] [data-dp-msg]').textContent, bad: document.querySelector('[data-dp-app] [data-dp-msg]').className }));
    ok(/outside what this policy allows \(1 to 200\)/.test(refused.msg) && /bad/.test(refused.bad) && (await doc()).policies['bimcraft.levels.count'] === 3, '500 levels is refused in words and the saved 3 stays', JSON.stringify(refused));
    await type('bimcraft.levels.count', null, '3');
    await L.shot('defaults-2-settings-set');
    await close();

    console.log('== set: Settings › Global › Default Policies');
    await openPane('general');
    await page.fill('[data-dp-global] [data-dp-office]', 'Smith and Jones'); await page.press('[data-dp-global] [data-dp-office]', 'Tab');
    const g = await inPage(() => { const fs = document.querySelector('[data-dp-global]'); return { lede: fs.querySelector('[data-dp-lede]').textContent, count: fs.querySelector('[data-dp-count]').textContent, system: [...fs.querySelector('[data-dp="all.system"]').options].map((o) => o.textContent), buttons: [...fs.querySelectorAll('button')].map((b) => b.textContent) }; });
    d = await doc();
    ok(d.office === 'Smith and Jones' && /Policies set: 10/.test(g.count) && /bimcraft/.test(g.count) && /not changed/.test(g.lede), 'the office name is saved; Global counts 10 policies set for bimcraft', JSON.stringify(g));
    ok(g.system.length === 3 && g.buttons.join('|') === 'Save to a file|Load from a file|Reset every policy', 'Global has the unit system for every app, Save to a file, Load from a file, Reset every policy', JSON.stringify(g));
    await L.shot('defaults-3-global');

    console.log('== file: save, reset, load, and a file with something unknown in it');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-dp-global] [data-dp-export]')]);
    const file = await dl.path(), text = fs.readFileSync(file, 'utf8'), obj = JSON.parse(text);
    ok(dl.suggestedFilename() === 'smith-and-jones.ccdefaults.json' && obj.format === KEY && obj.version === 1 && obj.office === 'Smith and Jones' && same(obj.policies, want) && /^\d{4}-\d\d-\d\dT/.test(obj.saved), 'Save to a file: smith-and-jones.ccdefaults.json, open JSON with the ten policies', text.slice(0, 200));
    await page.click('[data-dp-global] [data-dp-reset-all]');
    ok((await page.textContent('[data-dp-global] [data-dp-reset-all]')) === 'Click again to reset' && Object.keys((await doc()).policies).length === 10, 'Reset asks once more before it does anything');
    await page.click('[data-dp-global] [data-dp-reset-all]');
    d = await doc();
    ok(Object.keys(d.policies).length === 0 && d.office === 'Smith and Jones' && /No policy is set/.test(await page.textContent('[data-dp-global] [data-dp-count]')), 'second click: every policy is reset, the office name stays');
    const tmp = file + '-in.json';
    fs.writeFileSync(tmp, JSON.stringify({ ...obj, version: 2, policies: { ...obj.policies, 'bimcraft.future.policy': 1, 'bimcraft.wall.first': { metric: 'ext-300', imperial: 'no-such-type' } } }));
    await page.setInputFiles('[data-dp-global] [data-dp-file]', tmp);
    await page.waitForFunction(() => /Loaded/.test(document.querySelector('[data-dp-global] [data-dp-msg]').textContent));
    const loaded = await page.textContent('[data-dp-global] [data-dp-msg]');
    d = await doc();
    ok(same(d.policies, want) && /Loaded 10 policies/.test(loaded) && /bimcraft\.future\.policy/.test(loaded) && /bimcraft\.wall\.first \(Imperial\)/.test(loaded) && /later version/.test(loaded), 'Load from a file brings the ten back; the unknown policy and the wall type BimCraft does not have are left out and named', loaded);
    fs.writeFileSync(tmp, '{"format":"something-else"}');
    await page.setInputFiles('[data-dp-global] [data-dp-file]', tmp);
    await page.waitForFunction(() => /not a Default Policies file/.test(document.querySelector('[data-dp-global] [data-dp-msg]').textContent));
    ok(same((await doc()).policies, want), 'a file of another kind is refused and nothing changes');
    fs.rmSync(tmp, { force: true });
    await close();

    console.log('== the New building dialog shows the policies and where they came from');
    await L.newBuilding({ accept: false });
    const dl2 = await inPage(dialogState);
    ok(dl2.levels === '3' && dl2.height === '2700 mm' && dl2.wall === 'ext-300' && /^Exterior masonry 300 mm \(300/.test(dl2.wallText), 'filled in from the policies: 3 levels, 2700 mm, Exterior masonry 300 mm', JSON.stringify(dl2));
    ok(/sheet A-001 \(A1, 1:50\)/.test(dl2.starts) && /Wall tool ready to draw/.test(dl2.starts), 'it says: sheet A-001 (A1, 1:50), the Wall tool ready to draw: ' + dl2.starts);
    ok(['levels', 'height', 'wallType', 'sheet', 'tool'].every((k) => dl2.marks.some((m) => m.startsWith(k + ': ') && /from your Default Policies/.test(m))) && !dl2.marks.some((m) => m.startsWith('units')), 'levels, height, wall type, sheet and tool are each marked "from your Default Policies"; the units are not (no units policy)', JSON.stringify(dl2.marks));
    await L.shot('defaults-4-dialog');
    await page.click('[data-new-ok]'); await L.waitStatus(/^New building /); await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await L.settled();

    console.log('== the new building really starts that way');
    const b = await inPage(built);
    ok(JSON.stringify(b.levels) === JSON.stringify([['Floor 00', 0, 2700], ['Floor 01', 2700, 2700], ['Floor 02', 5400, 2700]]), 'levels Floor 00, Floor 01, Floor 02 at 0, 2700, 5400', JSON.stringify(b.levels));
    ok(b.sheets.length === 1 && b.sheets[0].number === 'A-001' && b.sheets[0].title === 'Plan: Floor 00' && b.sheets[0].paper === 'a1' && JSON.stringify(b.sheets[0].views) === JSON.stringify([['plan', 50, 420.5, 311]]), 'one sheet: A-001 "Plan: Floor 00" on A1, the plan at 1:50 in the middle of the drawing area', JSON.stringify(b.sheets));
    ok(b.tool === 'wall' && b.wallType === 'ext-300' && b.changes === 0, 'the Wall tool is already active, on Exterior masonry 300 mm; nothing to undo yet', JSON.stringify([b.tool, b.wallType, b.changes]));
    ok(b.typeTexts.length === 11 && b.typeTexts.every((x) => / \[LOD 200\]$/.test(x)), 'every starter type in the Wall tool\'s list carries [LOD 200]', JSON.stringify(b.typeTexts));
    const pts = await inPage(FREE);
    for (const p of pts) { await page.mouse.move(p[0], p[1], { steps: 3 }); await page.mouse.click(p[0], p[1]); await page.waitForTimeout(150); }
    await L.settled();
    await page.waitForFunction(() => window.bimcraftPlan.state.data.walls.length === 1, null, { timeout: 30000 }).catch(() => {});
    const W = await L.walls();
    ok(W.length === 1 && W[0].type === 'ext-300' && Math.abs(W[0].t - 300) < 0.01 && Math.abs(W[0].height - 2700) < 0.5, 'two clicks after Create draw the first wall: masonry, 300 thick, 2700 high (three clicks from the empty app, not five)', JSON.stringify(W));
    await L.shot('defaults-5-built');

    console.log('== a policy changed while the plan is open; a started project is not changed');
    await openPane('app');
    await page.selectOption(sel('bimcraft.wall.starterLod'), '350');
    await page.selectOption(sel('bimcraft.sheet.first'), 'none');
    const dis = await inPage(() => ['paper', 'scale', 'number', 'title'].map((k) => document.querySelector(`[data-dp-app] [data-dp="bimcraft.sheet.${k}"][data-dp-system="metric"]`).disabled));
    ok(dis.every(Boolean), '"No first sheet" greys out paper, scale, number and name');
    await close();
    const b2 = await inPage(built);
    ok(b2.typeTexts.filter((x) => !/^Generic wall/.test(x)).every((x) => / \[LOD 350\]$/.test(x)) && b2.typeTexts.filter((x) => /^Generic wall/.test(x)).every((x) => / \[LOD 200\]$/.test(x)), 'the open plan\'s type list follows the LOD policy at once ([LOD 350])', JSON.stringify(b2.typeTexts.slice(0, 2)));
    ok(JSON.stringify(b2.levels) === JSON.stringify(b.levels) && b2.sheets.length === 1 && b2.sheets[0].number === 'A-001' && (await L.walls()).length === 1, 'the building already started keeps its levels, its sheet and its wall');
    code = L.done();
  } catch (e) { ok(false, 'stopped: ' + (e.stack || e.message || e)); await L.shot('defaults-set-stopped'); L.done(); code = 1; } finally { await L.close(); }
  return code;
}

async function noSheet() {
  const L = await lab({ on: true, stored: { format: KEY, version: 1, office: '', policies: { 'bimcraft.sheet.first': 'none', 'bimcraft.units': 'm' } } });
  const { page, ok, inPage } = L;
  try {
    console.log('== none: "No first sheet", and a units policy');
    await L.newBuilding({ accept: false });
    const d = await inPage(dialogState);
    ok(/no first sheet/.test(d.starts) && /Meters as the units/.test(d.starts) && d.marks.some((m) => /^sheet: .*from your Default Policies/.test(m)) && d.marks.some((m) => /^units: .*from your Default Policies/.test(m)) && d.wall === 'ext-2x6' && d.levels === '2', 'the dialog says: Meters, no first sheet, both from your Default Policies; the rest is BimCraft\'s own', JSON.stringify(d));
    await page.click('[data-new-ok]'); await L.waitStatus(/^New building /); await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await L.settled();
    const b = await inPage(built);
    ok(b.sheets.length === 0 && b.units === 'm' && b.tool === 'select' && JSON.stringify(b.levels) === JSON.stringify([['Level 1', 0, 3000], ['Level 2', 3000, 3000]]), 'the new building has no sheet, the units are metres, everything else as before', JSON.stringify(b));
    return L.done();
  } catch (e) { ok(false, 'stopped: ' + (e.stack || e.message || e)); await L.shot('defaults-none-stopped'); L.done(); return 1; } finally { await L.close(); }
}

const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const runs = { off, unset: onUnset, set: setAndBuild, none: noSheet };
let worst = 0;
for (const [k, fn] of Object.entries(runs)) if (!only || only === k) worst = Math.max(worst, await fn());
process.exit(worst);
