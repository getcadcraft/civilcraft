#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-dayone.mjs — BK.74 "draw from day one" in the real page (/lab/bimcraft, headless, real clicks), session
 * `bk-instep-10`.   node tools/bimcraft-test/browser-dayone.mjs [--shots <dir>]      (run as root)
 *
 * The first minutes, counted: from the empty app to the first wall with EVERY default accepted.
 *   click 1  New building            (the dialog opens with a name, 2 levels, a level height, the wall type, the units and
 *                                     the first sheet already filled in or said)
 *   click 2  Create                  (nothing typed, nothing picked)
 *   click 3  Wall                    (the tool; the W key does the same)
 *   click 4  the wall's start        on the plan
 *   click 5  the wall's end          → the first wall is in the model
 * Asserted: five clicks, no key typed, no dialog, list or question between Create and the wall; the wall has the type the
 * dialog showed and runs up to the level above; sheet A-101 came with the building and now shows that wall (in the sheet
 * editor and in what the sheets are made from). Once with millimetres (A3, 1:100) and once as a browser with no saved units
 * (feet and inches, Tabloid, 1/8" = 1'-0"). Then: another wall type picked in the dialog is the type of the first wall.
 */
import { openLab, M } from './bk-page.mjs';

let code = 1;
/** Two points of the plan as it is shown, with nothing over them (in the page). */
const FREE = () => { const c = window.bimcraftPlan.view.canvas.getBoundingClientRect(); const free = (x, y) => document.elementFromPoint(x, y) === window.bimcraftPlan.view.canvas;
  // the Draw bar and a tool's option rows lie over the top of the plan pane and grow with the tool list: look down the pane for a free row (2026-11-11)
  for (const fy of [0.6, 0.7, 0.5, 0.8, 0.85, 0.88, 0.9, 0.92]) { const a = [c.left + c.width * 0.3, c.top + c.height * fy], b = [c.left + c.width * 0.7, c.top + c.height * fy]; if (free(...a) && free(...b)) return [a, b]; } return null; };
async function firstMinutes(units) {
  const L = await openLab({ tag: 'bkdayone', units });
  const { page, ok, inPage } = L;
  try {
    const metric = units === 'mm';
    console.log('== BK.74 first minutes, ' + (metric ? 'millimetres' : 'a browser with no saved units (feet and inches)'));
    let clicks = 0, keys = 0;
    const click = async (sel) => { await page.click(sel); clicks++; };
    // click 1
    await click('[data-empty] [data-new]');
    await page.waitForSelector('dialog.bc-new[open]');
    const dlg = await inPage(() => ({ name: document.querySelector('[data-new-name]').value, levels: document.querySelector('[data-new-levels]').value, height: document.querySelector('[data-new-height]').value,
      wall: document.querySelector('[data-new-walltype]')?.value, wallText: document.querySelector('[data-new-walltype]')?.selectedOptions[0]?.textContent, starts: document.querySelector('[data-new-starts]')?.textContent || '',
      required: [...document.querySelectorAll('dialog.bc-new input, dialog.bc-new select')].filter((i) => i.required && !i.closest('[hidden]') && i.offsetParent && !String(i.value).trim()).length, invalid: document.querySelectorAll('dialog.bc-new :invalid:not(form)').length }));
    ok(dlg.name === 'New building' && dlg.levels === '2' && dlg.height === (metric ? '3000 mm' : "10'-0\""), 'the dialog is filled in: "' + dlg.name + '", ' + dlg.levels + ' levels, ' + dlg.height + ' apart', JSON.stringify(dlg));
    ok(dlg.wall === 'ext-2x6' && /Exterior 2×6/.test(dlg.wallText || ''), 'it says the wall type the Wall tool starts on: ' + dlg.wallText);
    ok(new RegExp(metric ? 'Millimeters' : 'Feet and inches').test(dlg.starts) && new RegExp(metric ? 'A-101 \\(A3, 1:100\\)' : 'A-101 \\(Tabloid, 1/8" = 1\'-0"\\)').test(dlg.starts), 'and what it starts with: ' + dlg.starts.replace(/\s+/g, ' ').trim());
    ok(dlg.required === 0 && dlg.invalid === 0, 'no field is waiting for an answer (every required field has its value)', JSON.stringify([dlg.required, dlg.invalid]));
    await L.shot('dayone-' + units + '-1-dialog');
    // click 2
    await click('[data-new-ok]');
    await L.waitStatus(/^New building /);
    await page.waitForSelector('[data-plan-wrap]:not([hidden])');
    await L.settled();
    const start = await inPage(() => { const S = window.bimcraftPlan.state; return { on: S.on, levels: S.data.levels.map((l) => [l.name, Math.round(l.elevation), Math.round(l.height)]), shown: S.data.levels.find((l) => l.id === S.level)?.name, units: S.units, sheets: window.bimcraftViews.state.sheets.map((s) => ({ id: s.id, number: s.number, title: s.title, paper: s.paper, views: s.views })), changes: window.bimcraftRes.api.ed().changes.length, dialogs: document.querySelectorAll('dialog[open]').length }; });
    const H = metric ? 3000 : 3048;
    ok(start.on && start.shown === 'Level 1' && JSON.stringify(start.levels) === JSON.stringify([['Level 1', 0, H], ['Level 2', H, H]]) && start.dialogs === 0, 'the plan of Level 1 is open, ready to draw; Level 1 at 0 and Level 2 at ' + H + '; no dialog', JSON.stringify(start));
    ok(start.units === (metric ? 'mm' : 'ftin'), 'units: ' + start.units);
    ok(start.sheets.length === 1 && start.sheets[0].number === 'A-101' && start.sheets[0].title === 'Level 1 plan' && start.sheets[0].paper === (metric ? 'a3' : 'tabloid') && start.sheets[0].views.length === 1 && start.sheets[0].views[0].kind === 'plan' && start.sheets[0].views[0].ratio === (metric ? 100 : 96) && start.changes === 0, 'sheet A-101 "Level 1 plan" came with the building (' + (metric ? 'A3, 1:100' : 'Tabloid, 1:96') + '), with nothing to undo', JSON.stringify(start.sheets));
    // click 3
    await click('[data-mtool="wall"]');
    const bar = await inPage(() => ({ tool: window.bimcraftPlan.state.tool, type: document.querySelector('[data-model-walltype]')?.value, dialogs: document.querySelectorAll('dialog[open]').length }));
    ok(bar.tool === 'wall' && bar.type === 'ext-2x6' && bar.dialogs === 0, 'Wall: the tool is on with the type the dialog showed, nothing asked');
    // clicks 4 and 5: two points of the plan as it is shown (nothing framed or zoomed by the test)
    const pts = await inPage(FREE);
    ok(!!pts, 'the plan has free room to click in');
    for (const p of pts) { await page.mouse.move(p[0], p[1], { steps: 3 }); await page.mouse.click(p[0], p[1]); clicks++; await page.waitForTimeout(150); }
    await L.settled();
    await page.waitForFunction(() => window.bimcraftPlan.state.data.walls.length === 1, null, { timeout: 30000 }).catch(() => {});
    const W = await L.walls();
    const after = await inPage(() => ({ dialogs: document.querySelectorAll('dialog[open]').length, changes: window.bimcraftRes.api.ed().changes.length, keys: window.__keys || 0 }));
    ok(W.length === 1 && W[0].len > 500 && Math.abs(W[0].a[1] - W[0].b[1]) < 1, 'the first wall is drawn: ' + (W[0] ? Math.round(W[0].len) + ' mm long' : 'none'), JSON.stringify(W));
    ok(clicks === 5 && keys === 0, 'from the empty app to the first wall: ' + clicks + ' clicks, ' + keys + ' keys typed');
    ok(after.dialogs === 0 && after.changes === 1, 'no question on the way, and the wall is one undo step');
    ok(W[0] && W[0].type === 'ext-2x6' && Math.abs(W[0].height - H) < 0.5 && Math.abs(W[0].t - 184.15) < 0.01, 'it has the default type (Exterior 2×6, 184.15 mm) and runs up to Level 2 (' + H + ' mm)');
    await L.shot('dayone-' + units + '-2-wall');

    console.log('== BK.74 the first sheet shows that wall');
    const sh = await inPage(async ([u]) => {
      const RS = await import(u);
      const input = window.bimcraftRes.api.ask('sheetInput'), opts = window.bimcraftRes.api.ask('sheetOpts'), spec = window.bimcraftViews.state.sheets[0];
      const s = RS.composeSheet(spec, input, { ...opts, paper: spec.paper });
      const v = s.views[0];
      const xs = v ? s.items.filter((i) => i.t === 'line' || i.t === 'fill').flatMap((i) => i.pts || i.polys.flat()).filter((q) => q[0] >= v.box[0] && q[0] <= v.box[2] && q[1] >= v.box[1] && q[1] <= v.box[3]).map((q) => q[0]) : [];
      return { views: s.views, missing: s.missing, drawn: xs.length ? Math.max(...xs) - Math.min(...xs) : 0, paper: RS.PAPERS[spec.paper], plans: input.plans.map((p) => p.title) };
    }, [M('res-sheets.js')]);
    const ratio = metric ? 100 : 96;
    ok(sh.views.length === 1 && !sh.missing.length && sh.views[0].kind === 'plan' && sh.views[0].ratio === ratio, 'made from the model now, A-101 holds the plan of Level 1 at 1:' + ratio, JSON.stringify(sh));
    ok(W[0] && Math.abs(sh.drawn - W[0].len / ratio) < 0.05, 'the wall is on it, ' + (W[0].len / ratio).toFixed(2) + ' mm long on the paper (' + Math.round(W[0].len) + ' mm at 1:' + ratio + ')', String(sh.drawn));
    ok(sh.views[0] && sh.views[0].box[0] > 10 && sh.views[0].box[2] < sh.paper[0] - 10 && sh.views[0].box[1] > 28 && sh.views[0].box[3] < sh.paper[1] - 10, 'inside the frame, above the title block');
    // the sheet editor, as the person opens it
    await inPage(() => window.bimcraftViews.api.openSheet(window.bimcraftViews.state.sheets[0].id));
    await page.waitForSelector('[data-sh-stage] svg');
    const ed = await inPage(() => { const st = document.querySelector('[data-sh-stage]'); return { text: st.textContent, shapes: st.querySelectorAll('svg path, svg line, svg polyline, svg polygon').length, views: document.querySelectorAll('.bc-sh-ov rect').length, number: document.querySelector('[data-sh-number]')?.value || '' }; });
    ok(/A-101/.test(ed.text) && /Level 1 plan/.test(ed.text) && ed.views === 1, 'the sheet editor opens A-101 with its one view, the plan of Level 1', JSON.stringify({ ...ed, text: ed.text.slice(0, 120) }));
    await L.shot('dayone-' + units + '-3-sheet');
    await inPage(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
    code = L.done();
  } catch (e) {
    ok(false, 'stopped: ' + (e.stack || e.message || e)); await L.shot('dayone-stopped'); L.done(); code = 1;
  } finally { await L.close(); }
  return code;
}

async function otherType() {
  const L = await openLab({ tag: 'bkdayone', units: 'mm' });
  const { page, ok, inPage } = L;
  try {
    console.log('== BK.74 another wall type picked in the dialog is the first wall\'s type');
    await L.newBuilding({ accept: false });
    await page.selectOption('[data-new-walltype]', 'ext-300');
    await page.click('[data-new-ok]');
    await L.waitStatus(/^New building /);
    await page.waitForSelector('[data-plan-wrap]:not([hidden])');
    await L.settled();
    await page.click('[data-mtool="wall"]');
    ok(await page.inputValue('[data-model-walltype]') === 'ext-300', 'the Wall tool starts on Exterior masonry 300 mm');
    for (const p of await inPage(FREE)) { await page.mouse.move(p[0], p[1], { steps: 3 }); await page.mouse.click(p[0], p[1]); await page.waitForTimeout(150); }
    await L.settled();
    await page.waitForFunction(() => window.bimcraftPlan.state.data.walls.length === 1, null, { timeout: 30000 }).catch(() => {});
    const W = await L.walls();
    ok(W.length === 1 && W[0].type === 'ext-300' && Math.abs(W[0].t - 300) < 0.01, 'the first wall is 300 mm masonry', JSON.stringify(W));
    const r = L.done();
    return r;
  } catch (e) { ok(false, 'stopped: ' + (e.stack || e.message || e)); L.done(); return 1; } finally { await L.close(); }
}

const a = await firstMinutes('mm');
const b = await firstMinutes(null);
const c = await otherType();
process.exit(a || b || c ? 1 : 0);
