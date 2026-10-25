#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-workspaces.mjs — PartCraft's workspaces in headless Chromium: the switcher (first in the toolbar), every
 * workspace chosen through it, one toolbar row at 1440 px in each, Design's groups only in Design, the placeholder
 * panel, back to Design with the part unchanged, a sketch / the drawing sheet left cleanly on a switch, an assembly
 * disabling the others with the reason, the view hooks (overlay, result colours, hidden part) cleared on leaving,
 * a compute worker built from blob modules, the exact worker's op dispatch, 390 px, no console errors.
 *   node tools/partcraft-test/browser-workspaces.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 *   (also run from browser.mjs by one line: run(h) gets the same helpers as browser-harness.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const IDS = ['design', 'form', 'simulation', 'generative', 'manufacture', 'script'];

export async function run(h) {
  const { page, ok, pc, built, tool, shot, F, nearRel } = h;
  const rows = () => page.evaluate(() => new Set([...document.querySelectorAll('.pc-tools [role=group]')].filter((g) => !g.hidden).map((g) => g.offsetTop)).size);
  const visibleGroups = () => page.evaluate(() => [...document.querySelectorAll('.pc-tools [role=group]')].filter((g) => !g.hidden).map((g) => g.dataset.group));
  const choose = async (id) => { await page.selectOption('[data-workspace]', id); await page.waitForFunction((id) => window.partcraft.workspace === id, id); };

  console.log('\n== workspaces: the switcher, each workspace, back to Design');
  await pc(() => window.partcraft.exactReady());   // one kernel throughout, so volumes compare exactly
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
  await built();
  const v0 = await pc(() => window.partcraft.regen.stats.volume);
  const n0 = await pc(() => window.partcraft.part.features.length);
  const sw = await page.evaluate(() => {
    const first = document.querySelector('.pc-tools [role=group]');
    const s = document.querySelector('[data-workspace]');
    return { first: first.dataset.group, label: document.querySelector(`label[for="${s.id}"]`)?.textContent.trim(), opts: [...s.options].map((o) => o.value + ':' + o.textContent), tag: s.tagName };
  });
  ok(sw.first === 'workspace' && sw.tag === 'SELECT' && sw.label === 'Workspace', 'the toolbar starts with the workspace switcher: a labelled <select>');
  // 0.7: Illustrate (session illustrate) registers after these; its own browser test covers it
  ok(sw.opts.filter((o) => o !== 'illustrate:Illustrate').join() === 'design:Design,form:Form,simulation:Simulation,generative:Generative,manufacture:Manufacture,script:Script' && sw.opts.includes('illustrate:Illustrate'), `its options: ${sw.opts.map((o) => o.split(':')[1]).join(', ')}`);
  ok((await rows()) === 1 && (await visibleGroups()).join() === 'workspace,file,sketch,features,drawing,assembly,edit,view', 'Design: the toolbar is one row at 1440 px with every Design group');
  for (const id of IDS.slice(1)) {
    await choose(id);
    const g = await visibleGroups();
    const panel = await page.textContent('.pc-right');
    const head = await page.textContent('[data-props-h]');
    const label = id[0].toUpperCase() + id.slice(1);
    // a filled-in workspace may have several groups and its own panel; a scaffold has one group and the placeholder
    const filled = await page.evaluate((id) => !!window.partcraft.WS.getWorkspace(id).renderPanel, id);
    const own = g.slice(2, -2);
    ok((await rows()) === 1 && g.slice(0, 2).join() === 'workspace,file' && g.slice(-2).join() === 'edit,view' && own.length >= 1 && own.every((x) => x === `ws-${id}`) && (filled ? head.startsWith(label) : head === label && panel.includes(`The ${label} workspace is being built.`)), `${label}: one row at 1440 px; only its own group${own.length > 1 ? 's' : ''} besides workspace/file/edit/view; ${filled ? 'its own panel' : 'the panel says it is being built'}`);
    await shot('ws-' + id);
  }
  ok((await page.isDisabled('[data-edit-menu] [data-cmd="copy"]')) && /Design workspace/.test(await page.getAttribute('.pc-tools .pc-tool[data-cmd="copy"]', 'title')), 'outside Design, Copy is off and its title says copy and paste work in Design');
  // keyboard: the switcher is a native select
  await page.focus('[data-workspace]');
  await page.keyboard.press('Home');
  await page.waitForFunction(() => window.partcraft.workspace === 'design', null, { timeout: 3000 }).catch(() => {});
  ok((await pc(() => window.partcraft.workspace)) === 'design', 'the switcher works from the keyboard (Home on it picks Design)');
  if ((await pc(() => window.partcraft.workspace)) !== 'design') await choose('design');
  await built();
  ok((await pc(() => window.partcraft.part.features.length)) === n0 && nearRel(await pc(() => window.partcraft.regen.stats.volume), v0, 1e-12), 'back in Design: the same part, same volume');
  ok((await visibleGroups()).includes('features') && !(await page.textContent('.pc-right')).includes('being built'), 'Design\'s groups and panel are back');

  console.log('\n== workspaces: leaving a sketch, the drawing sheet; assemblies stay in Design');
  await page.dblclick('.pc-tree [data-id="f1"]');
  await page.waitForFunction(() => window.partcraft.mode === 'sketch');
  ok((await rows()) === 1, 'in a sketch the toolbar (with the switcher) is one row at 1440 px');
  await choose('form');
  let st = await pc(() => ({ mode: window.partcraft.mode, editing: window.partcraft.editing, canvas: document.querySelector('[data-sketch-canvas]').hidden, bar: document.querySelector('[data-sketch-bar]').hidden, frame: window.partcraft.view.sketchFrame }));
  ok(st.mode === 'model' && st.editing === null && st.canvas && st.bar && st.frame === null, 'switching from a sketch closes it first (Exit): model mode, sketch canvas and bar hidden');
  await built();
  ok(nearRel(await pc(() => window.partcraft.regen.stats.volume), v0, 1e-12), 'the part rebuilt unchanged');
  await page.dblclick('.pc-tree [data-id="f1"]');
  ok((await pc(() => window.partcraft.mode)) === 'model' && /Design workspace/.test(await h.statusText()), 'outside Design, double-clicking a sketch does not open it; the status says it is in Design');
  await choose('design');
  await tool('drawing');
  await page.waitForFunction(() => window.partcraft.mode === 'drawing' && window.partcraft.drawing?.sheet, null, { timeout: 20000 });
  ok((await rows()) === 1, 'on the drawing sheet the toolbar is one row at 1440 px');
  await choose('manufacture');
  ok((await pc(() => [window.partcraft.mode, document.querySelector('[data-sheet]').hidden].join())) === 'model,true', 'switching from the drawing sheet leaves it first (Back)');
  await choose('design');
  await tool('asm-new');
  await page.waitForFunction(() => window.partcraft.mode === 'assembly');
  await pc(() => window.partcraft.asmBuilt());
  const asm = await page.evaluate(() => { const s = document.querySelector('[data-workspace]'); return { opts: [...s.options].map((o) => [o.value, o.disabled, o.title]), title: s.title }; });
  // a workspace that says `assemblies: true` (Illustrate, 0.7) stays open in an assembly
  ok(asm.opts.filter((o) => o[0] !== 'design' && o[0] !== 'illustrate').every((o) => o[1] && /close the assembly first/.test(o[2])) && !asm.opts[0][1] && /close the assembly first/.test(asm.title)
    && asm.opts.filter((o) => o[0] === 'illustrate').every((o) => !o[1]), 'in an assembly the other workspaces are disabled, the reason in their title and the switcher\'s (Illustrate, which takes assemblies, stays open)');
  ok((await pc(() => window.partcraft.setWorkspace('form'))) === false && (await pc(() => window.partcraft.workspace)) === 'design' && (await rows()) === 1, 'asking for Form anyway is refused; still Design, one toolbar row');
  await tool('asm-close');
  if (await page.$('dialog[open]')) await page.click('dialog[open] button[data-key="discard"]');
  await page.waitForFunction(() => window.partcraft.mode === 'model');
  ok(!(await page.isDisabled('[data-workspace] option[value="form"]')), 'after closing the assembly the workspaces are on again');

  console.log('\n== workspaces: view hooks, compute worker, exact worker ops');
  await choose('simulation');
  await built();
  const hooks = await pc(() => {
    const { host } = window.partcraft, v = host.view, T = host.THREE;
    v.setOverlay('probe', new T.Mesh(new T.SphereGeometry(5), new T.MeshBasicMaterial({ color: 0xff0000 })));
    const m = host.regen.mesh, c = new Float32Array(m.positions.length);
    for (let i = 0; i < c.length; i += 3) { const y = m.positions[i + 1]; c[i] = Math.min(1, Math.max(0, y / 80)); c[i + 2] = 1 - c[i]; }
    v.setFaceColors(c);
    v.setPartVisible(false);
    const before = { overlays: v.overlays.size, colours: v.mesh.material.vertexColors && !!v.mesh.geometry.getAttribute('color'), hidden: !v.mesh.visible && !v.edges.visible, pick: v.pickAt(v.canvas.getBoundingClientRect().left + v.w / 2, v.canvas.getBoundingClientRect().top + v.h / 2, { planes: false }) };
    return before;
  });
  ok(hooks.overlays === 1 && hooks.colours && hooks.hidden && hooks.pick === null, 'setOverlay adds a scene object, setFaceColors colours the part per vertex, setPartVisible(false) hides it (and it cannot be picked)');
  await shot('ws-hooks');
  await choose('design');
  const after = await pc(() => { const v = window.partcraft.view; return { overlays: v.overlays.size, colours: v.mesh.material.vertexColors, shown: v.mesh.visible && v.edges.visible }; });
  ok(after.overlays === 0 && !after.colours && after.shown, 'leaving the workspace clears its overlays and colours and shows the part again');
  // a compute worker from a module of this build (its text handed to the page's fetch by the test): blob-linked,
  // progress, buffers transferred both ways
  const CW = `import { addOps } from './worker-ops.js';\naddOps({ testSum(args, ctx) { const a = new Float64Array(args.buf); let s = 0; for (let i = 0; i < a.length; i++) { s += a[i]; if (i === 1) ctx.progress(0.5); } const out = new Float64Array([s]); ctx.transfer(out.buffer); return { s, out }; } });\n`;
  await pc((src) => { const orig = window.fetch; window.__pcFetch = orig; window.fetch = (u, o) => (/\/cw-test\.js/.test(String(u)) ? Promise.resolve(new Response(src, { headers: { 'content-type': 'text/javascript' } })) : orig(u, o)); }, CW);
  const cw = await pc(async () => {
    const w = window.partcraft.host.computeWorker(['cw-test.js'], { name: 'test' });
    const buf = new Float64Array([1, 2, 3, 4.5]).buffer, seen = [];
    const r = await w.call('testSum', { buf }, { transfer: [buf], onProgress: (p) => seen.push(p) });
    let err = '';
    try { await w.call('nope', {}); } catch (e) { err = e.message; }
    w.terminate();
    window.fetch = window.__pcFetch;
    return { s: r.s, out: r.out[0], moved: buf.byteLength === 0, seen, err };
  });
  ok(cw.s === 10.5 && cw.out === 10.5 && cw.moved && cw.seen.join() === '0.5' && /Unknown request nope/.test(cw.err), 'computeWorker([module]): an addOps op runs in a blob worker (sum 10.5, input transferred, progress 0.5); an unknown op is refused');
  const ex = await pc(async () => { try { await window.partcraft.exact.call('noSuchOp', {}); return 'resolved'; } catch (e) { return e.message; } });
  ok(/Unknown request noSuchOp/.test(ex), 'the exact worker looks extension ops up and refuses an unknown one');

  console.log('\n== workspaces: 390 px');
  await page.setViewportSize({ width: 390, height: 844 });
  await choose('generative');
  await page.waitForTimeout(200);
  const ph = await page.evaluate(() => { const m = document.querySelector('main'); const wide = [...m.querySelectorAll('*')].filter((n) => { const b = n.getBoundingClientRect(); return b.right > innerWidth + 1 && !n.closest('.pc-tools'); }).length; return [m.scrollWidth, innerWidth, wide, !!document.querySelector('[data-ws-placeholder="generative"], [data-gen-new], [data-gen-generate]')]; });
  ok(ph[0] <= ph[1] && ph[2] === 0 && ph[3], `390 px: Generative's panel shows and PartCraft's area has no horizontal scroll (main ${ph[0]} ≤ ${ph[1]})`);
  await shot('ws-phone');
  await choose('design');
  await page.setViewportSize({ width: 1440, height: 900 });
  ok(h.problems.length === 0, 'workspaces: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
