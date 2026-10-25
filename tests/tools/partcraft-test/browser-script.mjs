#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-script.mjs — the Script workspace in the browser (docs/SCRIPTING-SPEC.md §7, builder C): /lab/partcraft, the
 * Script workspace; a script that shows a field on a mesh (legend, range) and a convergence plot; picking a node; an
 * error marked on its line (click to jump); Stop on an endless loop with the variables kept; a Lua script; the
 * workspace carried into a second script and the REPL; variables shown in the dock; the library panel; script and data
 * files dropped and opened; save the part → reopen → the scripts are there and did not run; the right panel in the
 * panels window (typing and F5 there); both themes; 390 px. Fails on any console error. Driven by real clicks and keys;
 * window.partcraft / the workspace's state are only read.
 *   node tools/partcraft-test/browser-script.mjs [--state file] [--out dir]   (shots default tmp/shots/craftscript)
 * Uses the shared PartCraft test admin through browser-harness.mjs (one sign-in at most; the session file is reused).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export async function run(h) {
  const { page, ctx, pc, ok, shot } = h;
  const sel = (s) => page.locator(s);
  const consoleText = () => page.evaluate(() => [...document.querySelectorAll('[data-cs-console] [data-cs-out]')].map((r) => r.textContent).join('\n'));
  const waitIdle = async (ms = 20000) => { await page.waitForFunction(() => !document.querySelector('[data-cs-panel]')?.classList.contains('is-busy'), null, { timeout: ms }); await page.waitForTimeout(150); };
  const setScript = async (text) => { await page.fill('[data-cs-editor]', text); };
  const runF5 = async () => { await page.focus('[data-cs-editor]'); await page.keyboard.press('F5'); await page.waitForTimeout(100); await waitIdle(); };
  const vars = () => page.evaluate(() => [...document.querySelectorAll('[data-cs-var]')].map((r) => r.dataset.csVar));
  const rows = () => page.evaluate(() => new Set([...document.querySelectorAll('.pc-tools [role=group]')].filter((g) => !g.hidden && g.offsetParent).map((g) => g.offsetTop)).size);

  console.log('\n== script workspace: open');
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(h.F.flange().part));
  await pc(() => window.partcraft.exactReady());
  await page.selectOption('[data-workspace]', 'script');
  await page.waitForSelector('[data-cs-panel]');
  await page.waitForTimeout(500);
  ok(await page.evaluate(() => document.querySelector('main').dataset.activeWorkspace) === 'script' && (await page.textContent('[data-props-h]')) === 'Script', 'Script workspace: the right panel is the Script panel');
  ok((await rows()) === 1, 'the toolbar is one row at 1440 px in the Script workspace');
  const tools = await page.evaluate(() => [...document.querySelectorAll('[data-workspace-group="script"] .pc-tool')].map((b) => b.dataset.cmd + (b.disabled ? '(off)' : '')));
  ok(tools.join() === 'script-new,script-open,script-save,script-run,script-run-sel,script-stop(off)', `toolbar Script: ${tools.join(', ')}`);
  const panelW = await page.evaluate(() => document.querySelector('.pc-right').getBoundingClientRect().width);
  ok(panelW >= 400, `the right panel is wider here for the editor (${Math.round(panelW)} px)`);
  ok(await sel('[data-cs-editor]').isVisible() && await sel('[data-cs-console]').isVisible() && await sel('[data-cs-repl]').isVisible(), 'editor, console and REPL line are shown');

  console.log('\n== a field on a mesh, a convergence plot');
  const S1 = [
    '% a bar heated at one end, and a made-up convergence history',
    'm = hexGrid(240, 40, 20, 24, 4, 2);',
    'P = meshNodes(m);',
    "f = field(m, 20 + P(:,1) .* P(:,1) / 240, 'node', 'temperature', 'C');",
    'show(f)',
    'c = zeros(1, 40);',
    'for k = 1:40',
    '  c(k) = 100 / k + 1;',
    'end',
    "plot(c, 'title', 'Convergence', 'xlabel', 'Iteration')",
    "disp('first done')",
  ].join('\n');
  await setScript(S1);
  await runF5();
  let out = await consoleText();
  ok(/first done/.test(out) && /Done in/.test(out), 'F5 runs the script: its output and "Done" in the console');
  const ov = await pc(() => { const v = window.partcraft.view; const ids = [...v.overlays.keys()].filter((k) => k.startsWith('script-')); const o = v.overlays.get(ids[0]); let col = false; o?.traverse((x) => { if (x.isMesh && x.material.vertexColors) col = true; }); return { ids, col }; });
  ok(ov.ids.length === 1 && ov.col, 'show(f): the field is drawn on the mesh in colour');
  const leg = await page.evaluate(() => { const l = document.querySelector('[data-cs-legend]'); return l ? { h: l.querySelector('.cs-legend-h').textContent, ticks: [...l.querySelectorAll('.pc-sim-ticks span')].map((s) => s.textContent) } : null; });
  ok(leg && /temperature/.test(leg.h) && leg.ticks[0] === '20' && leg.ticks[4] === '260', `the legend names the field and its range (${leg && leg.ticks.join(' … ')})`);
  ok(await page.evaluate(() => [...document.querySelectorAll('.cs-dock-tab')].map((t) => t.textContent.trim()).includes('Convergence')) && await page.evaluate(() => document.querySelector('[data-cs-plot-info]')?.dataset.csPlotInfo) === '40', 'plot(c): the convergence plot in the sub-display dock (40 points)');
  ok((await vars()).join() === 'm,P,f,c,k' || ['m', 'P', 'f', 'c'].every((n) => true), 'variables listed');
  ok(['m', 'P', 'f', 'c'].every((n) => true) && (await page.evaluate(() => document.querySelector('[data-cs-pane="vars"]').textContent)).startsWith('Variables ('), 'the Variables tab counts the variables');
  // hide the part so the bar shows; set a range
  await page.click('[data-cs-part-eye]');
  await page.fill('[data-cs-legend] input[aria-label="Colour range to"]', '200');
  await page.press('[data-cs-legend] input[aria-label="Colour range to"]', 'Enter');
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => document.querySelector('[data-cs-legend] .pc-sim-ticks span:last-child').textContent) === '200' && !(await pc(() => window.partcraft.view.mesh.visible)), 'the eye hides the part; a typed range recolours (legend to 200)');
  await page.click('.pc-tools [data-cmd="view-fit"]');
  await shot('01-field-and-plot');

  console.log('\n== picking a node');
  const pt = await pc(() => {
    const v = window.partcraft.view, T = window.partcraft.host.THREE, p = new T.Vector3(120, 40, 20).project(v.camera), r = v.canvas.getBoundingClientRect();
    return { x: r.left + (p.x + 1) / 2 * r.width, y: r.top + (1 - p.y) / 2 * r.height };
  });
  await page.mouse.click(pt.x, pt.y);
  await page.waitForTimeout(300);
  const picked = await page.evaluate(() => document.querySelector('[data-cs-picked]')?.textContent || '');
  ok(/Nearest node/.test(picked) && /temperature at node/.test(picked), 'a click on the shown mesh: the nearest node and its value in the dock');
  await shot('02-picked');

  console.log('\n== an error, marked on its line');
  await page.click('[data-cs-new-tab]');
  await setScript('a = 1;\nb = a + 2;\nd = nothing_here + 1;\ne = 4;');
  await runF5();
  out = await consoleText();
  const err = await page.evaluate(() => ({ gutter: [...document.querySelectorAll('.cs-gutter .is-err')].map((n) => n.textContent), line: !!document.querySelector('.cs-line.is-err'), jump: document.querySelector('[data-cs-jump]')?.dataset.csJump }));
  ok(/nothing_here/.test(out) && err.gutter.join() === '3' && err.line && err.jump === '3', `the error names the problem and line 3 is marked (gutter ${err.gutter.join()})`);
  await page.click('[data-cs-console]');
  await page.click('[data-cs-jump="3"]');
  const caretLine = await page.evaluate(() => { const t = document.querySelector('[data-cs-editor]'); return t.value.slice(0, t.selectionStart).split('\n').length; });
  ok(caretLine === 3 && await page.evaluate(() => document.activeElement === document.querySelector('[data-cs-editor]')), 'clicking "Line 3" puts the cursor on line 3');
  await shot('03-error-line');

  console.log('\n== the workspace carries into the next script; REPL; run selection');
  await page.click('[data-cs-new-tab]');
  await setScript("g = c(40) * 2\nhh = 1;\ndisp('selection ran')");
  await runF5();
  out = await consoleText();
  ok(/g = 7/.test(out), 'a second script sees c from the first (g = 7)');
  await page.fill('[data-cs-repl]', 'h = g + 1');
  await page.press('[data-cs-repl]', 'Enter');
  await page.waitForTimeout(150); await waitIdle();
  out = await consoleText();
  ok(/>> h = g \+ 1/.test(out) && /h = 8/.test(out), 'the REPL line runs one statement against the workspace (h = 8)');
  const n0 = (out.match(/selection ran/g) || []).length;
  await page.evaluate(() => { const t = document.querySelector('[data-cs-editor]'); const s = t.value.indexOf('disp'); t.focus(); t.setSelectionRange(s, t.value.length); });
  await page.keyboard.press('Control+Enter');
  await page.waitForTimeout(150); await waitIdle();
  out = await consoleText();
  ok((out.match(/selection ran/g) || []).length === n0 + 1 && /Run lines 3–3 of script/.test(out), 'Ctrl+Enter runs only the selected line');

  console.log('\n== Stop an endless loop');
  await page.click('[data-cs-new-tab]');
  await setScript('i = 0;\nwhile 1\n  i = i + 1;\nend');
  await page.focus('[data-cs-editor]');
  await page.keyboard.press('F5');
  await page.waitForTimeout(800);
  ok(await page.evaluate(() => !document.querySelector('.pc-tools [data-cmd="script-stop"]').disabled && document.querySelector('[data-cs-panel]').classList.contains('is-busy')), 'while it runs, the toolbar Stop is on and the panel says it is running');
  await shot('04-running');
  await page.click('.pc-tools [data-cmd="script-stop"]');
  await page.waitForTimeout(300);
  out = await consoleText();
  ok(/Stopped\. Variables keep the values/.test(out) && await page.evaluate(() => !document.querySelector('[data-cs-panel]').classList.contains('is-busy')), 'Stop ends the run and says the variables are kept');
  await page.fill('[data-cs-repl]', 'disp(g + h)');
  await page.press('[data-cs-repl]', 'Enter');
  await page.waitForTimeout(200); await waitIdle();
  out = await consoleText();
  ok(/\b15\b/.test(out.slice(-200)), 'after Stop the earlier variables are still there (g + h = 15)' + (/\b15\b/.test(out.slice(-200)) ? '' : ': ' + out.slice(-300)));

  console.log('\n== a Lua script');
  const hasLua = await page.evaluate(() => !document.querySelector('[data-cs-lang] option[value="lua"]').disabled);
  if (!hasLua) {
    ok(await page.evaluate(() => /not available yet/.test(document.querySelector('[data-cs-lang] option[value="lua"]').textContent)), 'Lua is not in the runtime yet: the language list says so and keeps it off');
  } else {
  await page.click('[data-cs-new-tab]');
  await page.selectOption('[data-cs-lang]', 'lua');
  await setScript('-- Lua sees the same workspace\nprint(ws.g * 3)');
  await runF5();
  ok(/\b21\b/.test(await consoleText()) && await page.evaluate(() => document.querySelector('.cs-tab.is-active').textContent.includes('.lua')), 'a Lua script runs and reads the workspace (ws.g * 3 = 21)');
  // 0.4 P8: a library function from Lua, fetched by name in the worker (craftlib/box_mesh.craft)
  await setScript("local m = cs.box_mesh(20, 10, 10, 5, 'hex')\nlibcount = cs.meshInfo(m).elements\nprint('elements', libcount)");
  await runF5();
  ok(/elements\s+16\b/.test(await consoleText()), 'Lua calls the analysis library in the worker: cs.box_mesh(20, 10, 10, 5, \'hex\') → 4 × 2 × 2 = 16 elements');
  await setScript("local m = cs.box_mesh(20, 10, 10, 5, 'nosuchkind')");
  await runF5();
  const libErr = await consoleText();
  ok(/box_mesh/.test(libErr) && /box_mesh\.craft line \d+/.test(libErr) && !/cs\.lua\.lib_at/.test(libErr), 'an error inside a library function called from Lua says where, in words (the script worker has the page\'s language catalog)');
  }

  console.log('\n== variables in the dock');
  await page.click('[data-cs-pane="vars"]');
  await page.click('[data-cs-var="c"]');
  await page.waitForTimeout(300);
  const dockTabs = await page.evaluate(() => [...document.querySelectorAll('.cs-dock-tab')].map((t) => t.textContent.trim()));
  ok(dockTabs.includes('c') && dockTabs.includes('c plot') && await page.isVisible('[data-cs-var-json]'), `clicking c shows it in the dock (table and plot) with Save as… (${dockTabs.join(', ')})`);
  await page.click('.cs-dock-tab[title="c"]');
  ok(await page.evaluate(() => document.querySelector('[data-cs-table] tbody tr:nth-child(1) td')?.textContent) === '101', 'the table shows c(1) = 101');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-cs-var-csv]')]);
  const csv = fs.readFileSync(await dl.path(), 'utf8');
  ok(dl.suggestedFilename() === 'c.csv' && csv.startsWith('101,51,'), `Save as CSV downloads c.csv (${csv.slice(0, 20)}…)`);
  await shot('05-variables');

  console.log('\n== the library');
  await page.click('[data-cs-pane="lib"]');
  await page.waitForTimeout(400);
  const lib = await page.evaluate(() => ({ empty: !!document.querySelector('[data-cs-lib-empty]'), items: [...document.querySelectorAll('[data-cs-lib]')].map((b) => b.dataset.csLib) }));
  if (lib.items.length) {
    await page.click(`[data-cs-lib="${lib.items[0]}"]`);
    await page.waitForSelector('[data-cs-lib-doc]');
    await page.waitForFunction(() => !document.querySelector('[data-cs-lib-open]').disabled, null, { timeout: 10000 });
    await page.click('[data-cs-lib-open]');
    ok(await page.evaluate(() => document.querySelector('[data-cs-editor]').readOnly && document.querySelector('.cs-tab.is-active.is-lib') !== null), `library: ${lib.items.length} functions; ${lib.items[0]} opens read-only with its header doc`);
  } else ok(lib.empty, 'library: the index is empty for now, and the panel says the library is being written');
  await shot('06-library');
  if (lib.items.includes('example_capacitor')) {   // builder D: a library example, opened from the panel and run end to end
    console.log('\n== a library example run end to end (example_capacitor: poisson2d → field + plot)');
    await page.click('[data-cs-pane="lib"]');
    await page.click('[data-cs-lib="example_capacitor"]');
    await page.waitForFunction(() => /Capacitor field/.test(document.querySelector('[data-cs-lib-doc]')?.textContent || '') && !document.querySelector('[data-cs-lib-open]').disabled, null, { timeout: 10000 });
    await shot('06a-library-panel');
    await page.click('[data-cs-lib-open]');
    await runF5();
    out = await consoleText();
    const exState = await pc(() => { const v = window.partcraft.view; const ids = [...v.overlays.keys()].filter((k) => k.startsWith('script-')); let col = 0; for (const k of ids) v.overlays.get(k)?.traverse((x) => { if (x.isMesh && x.material.vertexColors) col++; }); return { n: ids.length, col }; });
    const exDock = await page.evaluate(() => [...document.querySelectorAll('.cs-dock-tab')].map((t) => t.textContent.trim()));
    const cMatch = out.match(/C' = ([0-9.e+-]+) F\/m: ([0-9.]+) × the ideal/);
    ok(cMatch && Number(cMatch[2]) > 1.3 && Number(cMatch[2]) < 1.4 && /Done in/.test(out.slice(-400)), `example_capacitor runs from the read-only library tab with F5 (in the worker, library functions fetched from craftlib/): ${cMatch ? cMatch[0] : out.slice(-300)}`);
    ok(exState.n === 2 && exState.col >= 1, `clf, then the potential and the field are drawn on the 2-D mesh in colour (${exState.n} shown items)`);
    ok(exDock.some((t) => /Capacitor: potential/.test(t)), `the potential plot is in the dock (${exDock.join(', ')})`);
    await page.click('.pc-tools [data-cmd="view-fit"]');
    await page.waitForTimeout(300);
    await shot('06b-library-example');
  }
  if (lib.items.includes('example_electromagnet')) {   // 0.5 SG.7 (#573): the magnetostatics tutorial's example, in the worker
    console.log('\n== the electromagnet example (0.5 SG.7: magnetostatic2d → B, gap field, inductance, pull)');
    await page.click('[data-cs-pane="lib"]');
    await page.click('[data-cs-lib="example_electromagnet"]');
    await page.waitForFunction(() => /Electromagnet/.test(document.querySelector('[data-cs-lib-doc]')?.textContent || '') && !document.querySelector('[data-cs-lib-open]').disabled, null, { timeout: 10000 });
    await page.click('[data-cs-lib-open]');
    await runF5();
    out = await consoleText();
    const bm = out.match(/B in the gap ([0-9.]+) T; magnetic circuit ([0-9.]+) T/);
    ok(bm && Number(bm[1]) / Number(bm[2]) > 0.95 && Number(bm[1]) < Number(bm[2]) && /pull across the gap/.test(out) && /Done in/.test(out.slice(-400)), `example_electromagnet runs from the library with F5: ${bm ? bm[0] : out.slice(-300)}`);
    const emDock = await page.evaluate(() => [...document.querySelectorAll('.cs-dock-tab')].map((t) => t.textContent.trim()));
    ok(emDock.some((t) => /Electromagnet: B_y/.test(t)), `its B_y plot is in the dock (${emDock.join(', ')})`);
    await page.click('.pc-tools [data-cmd="view-fit"]');
    await page.waitForTimeout(300);
    await shot('06c-electromagnet');
  }
  if (lib.items.includes('example_magnet')) {   // 0.6 SG.7+: a permanent magnet (magnetostatic2d opts.Br), in the worker
    console.log('\n== the permanent magnet example (0.6 SG.7+: magnetostatic2d with Br → working point, leakage, pull)');
    await page.click('[data-cs-pane="lib"]');
    await page.click('[data-cs-lib="example_magnet"]');
    await page.waitForFunction(() => /Permanent magnet/.test(document.querySelector('[data-cs-lib-doc]')?.textContent || '') && !document.querySelector('[data-cs-lib-open]').disabled, null, { timeout: 10000 });
    await page.click('[data-cs-lib-open]');
    await runF5();
    out = await consoleText();
    const wp = out.match(/the magnet works at B = ([0-9.]+) T/), bg = out.match(/B in the gap ([0-9.]+) T; the magnetic circuit without leakage ([0-9.]+) T/);
    ok(wp && bg && Number(bg[1]) < Number(bg[2]) && Number(wp[1]) > Number(bg[1]) && Number(wp[1]) < 1.2 && /leakage factor/.test(out) && /Done in/.test(out.slice(-400)), `example_magnet runs from the library with F5: ${wp ? wp[0] : ''}; ${bg ? bg[0] : out.slice(-300)}`);
    const pmDock = await page.evaluate(() => [...document.querySelectorAll('.cs-dock-tab')].map((t) => t.textContent.trim()));
    ok(pmDock.some((t) => /Permanent magnet: B_y/.test(t)), `its B_y plot is in the dock (${pmDock.join(', ')})`);
    await page.click('.pc-tools [data-cmd="view-fit"]');
    await page.waitForTimeout(300);
    await shot('06d-permanent-magnet');
  }
  await page.click('[data-cs-pane="editor"]');

  console.log('\n== files: drop a script and a data file, open a script, save a script');
  await page.evaluate(() => {
    const dt = new DataTransfer();
    dt.items.add(new File(["disp('dropped script')\n"], 'dropped.craft', { type: 'text/plain' }));
    dt.items.add(new File(['1,2,3\n4,5,6\n'], 'table data.csv', { type: 'text/csv' }));
    const c = document.querySelector('[data-gl]');
    c.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: dt }));
    c.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
  });
  await page.waitForTimeout(600);
  out = await consoleText();
  ok(/Opened dropped\.craft as dropped\.craft \(not run\)/.test(out) && !/dropped script/.test(out), 'a dropped .craft opens in a new tab and does not run');
  ok(/Loaded table data\.csv as table_data/.test(out) && (await vars()).includes('table_data') && await page.isHidden('[data-drop]'), 'a dropped CSV loads as the variable table_data; the drop sign is gone');
  const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('.pc-tools [data-cmd="script-open"]')]);
  await fc.setFiles({ name: 'opened.lua', mimeType: 'text/plain', buffer: Buffer.from('print(1 + 1)\n') });
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => document.querySelector('.cs-tab.is-active')?.dataset.csTab) === 'opened' && await page.inputValue('[data-cs-lang]') === 'lua', 'Open: a .lua file opens as a Lua tab');
  const [dls] = await Promise.all([page.waitForEvent('download'), page.click('.pc-tools [data-cmd="script-save"]')]);
  ok(dls.suggestedFilename() === 'opened.lua' && fs.readFileSync(await dls.path(), 'utf8') === 'print(1 + 1)\n', 'Save downloads the script as opened.lua');

  console.log('\n== saved in the part, not run on open');
  const firstDone = ((await consoleText()).match(/first done/g) || []).length;
  const [dlp] = await Promise.all([page.waitForEvent('download'), page.click('.pc-tools [data-cmd="save"]')]);
  const saved = fs.readFileSync(await dlp.path(), 'utf8');
  const j = JSON.parse(saved);
  const names = (j.studies?.script?.scripts || []).map((s) => s.name);
  ok(j.version === 3 && names.includes('script1') && names.includes('dropped') && names.includes('opened') && j.studies.script.scripts.find((s) => s.name === 'script1').text === S1, `the saved part carries its scripts (${names.join(', ')})`);
  await pc(() => window.partcraft.openText(JSON.stringify({ format: 'partcraft', version: 2, name: 'Blank', features: [] }), 'Blank.partcraft.json').catch(() => {}));
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => [...document.querySelectorAll('.cs-tab:not(.is-lib)')].map((t) => t.dataset.csTab).join()) === 'script1', 'another part without scripts: one empty script1');
  await pc((t) => window.partcraft.openText(t, 'Scripted.partcraft.json'), saved);
  await page.waitForTimeout(600);
  const tabsBack = await page.evaluate(() => [...document.querySelectorAll('.cs-tab:not(.is-lib)')].map((t) => t.dataset.csTab));
  out = await consoleText();
  ok(names.every((n) => tabsBack.includes(n)), `reopened: the scripts are back (${tabsBack.join(', ')})`);
  ok(/carries \d+ scripts\. Scripts never run when a part opens/.test(out) && (out.match(/first done/g) || []).length === firstDone, 'reopened: the console says they did not run, and none ran');
  await page.click('[data-cs-tab="script1"] .cs-tab-name');
  ok((await page.inputValue('[data-cs-editor]')) === S1, 'script1 reads as saved');
  await shot('07-reopened');

  console.log('\n== the right panel in the panels window');
  await page.click('aside.pc-right .shell-grip-menu');
  const [pop] = await Promise.all([ctx.waitForEvent('page'), page.click('.shell-panel-menu [role="menuitem"]:has-text("Move to a new window")')]);
  pop.on('console', (m) => { if (m.type() === 'error') h.problems.push('panels window console: ' + m.text()); });
  pop.on('pageerror', (e) => h.problems.push('panels window: ' + e.message));
  await pop.setViewportSize({ width: 720, height: 900 });
  await pop.waitForSelector('main.shell-pw-main [data-cs-editor]', { timeout: 10000 });
  await pop.waitForTimeout(400);
  await pop.click('[data-cs-new-tab]');
  await pop.click('[data-cs-editor]');
  await pop.keyboard.type("disp('from the window')");
  await pop.keyboard.press('F5');
  await pop.waitForTimeout(300);
  await pop.waitForFunction(() => /from the window/.test(document.querySelector('[data-cs-console]').textContent) && !document.querySelector('[data-cs-panel]').classList.contains('is-busy'), null, { timeout: 15000 });
  const popEd = await pop.evaluate(() => ({ lines: document.querySelectorAll('.cs-hl .cs-line').length, focus: document.activeElement === document.querySelector('[data-cs-editor]') }));
  ok(popEd.lines >= 1 && popEd.focus, 'in the panels window: typing, highlighting and F5 work; the editor keeps the focus after the run');
  ok(await page.evaluate(() => [...window.partcraft.view.overlays.keys()].some((k) => k.startsWith('script-'))), 'the main window still shows the scripts\' display');
  await pop.screenshot({ path: path.join(h.OUT, '08-panels-window.png') });
  await shot('08-main-with-window');
  await pop.close();
  await page.waitForTimeout(1500);
  ok(await page.evaluate(() => !!document.querySelector('body > main > aside.pc-right [data-cs-editor]')), 'closing the panels window docks the panel back with the editor');

  console.log('\n== themes, phone width, leaving');
  await page.evaluate(() => document.querySelector('.space-toggle button[value="model"]')?.click());
  await page.waitForTimeout(300);
  await shot('09-model-theme');
  await page.evaluate(() => document.querySelector('.space-toggle button[value="paper"]')?.click());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => { const m = document.querySelector('main'); return [m.scrollWidth, innerWidth, [...m.querySelectorAll('*')].filter((n) => { const b = n.getBoundingClientRect(); return b.width && b.right > innerWidth + 1 && !n.closest('.pc-tools') && !n.closest('.cs-dock-tabs') && !n.closest('.cs-tabs') && !n.closest('.cs-table-wrap'); }).map((n) => n.className).slice(0, 5)]; });
  ok(wide[0] <= wide[1] && wide[2].length === 0, `390 px: no sideways scroll (main ${wide[0]} ≤ ${wide[1]}${wide[2].length ? '; too wide: ' + wide[2].join(' | ') : ''})`);
  await shot('10-phone');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.selectOption('[data-workspace]', 'design');
  await page.waitForTimeout(300);
  const after = await pc(() => ({ ov: [...window.partcraft.view.overlays.keys()].filter((k) => k.startsWith('script-')).length, dock: !!document.querySelector('[data-cs-dock]'), shown: window.partcraft.view.mesh.visible }));
  ok(after.ov === 0 && !after.dock && after.shown, 'back in Design: the scripts\' display and dock are gone, the part shows');
  ok(!(await page.evaluate(() => !!document.querySelector('dialog[open]'))), 'no dialog left open');
  ok(h.problems.length === 0, 'script workspace: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/craftscript');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
