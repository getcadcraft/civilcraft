#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fillet-mesh.mjs — 0.4 part 2, K.2b + K.4 on the page as it ships (the mesh kernel, no OpenCascade): edges of the
 * part are picked whole by clicks (Shift+click adds), Fillet rounds the two picked edges (radius from the panel; the volume
 * against the closed form to the faceting), the fillet follows a width change by the names of its edges, Shell opens the picked
 * top face (K.5), Chamfer with
 * nothing picked opens pick mode and builds a bevel, the history and the fillet's note say what the mesh kernel did.
 *   node tools/partcraft-test/browser-fillet-mesh.mjs [--state <file>] [--out <dir>]
 */
import { startHarness, cliArgs } from './browser-harness.mjs';

const { state, out } = cliArgs();
const h = await startHarness({ state, out, exact: false });
const { page, ok, pc, built, tool, shot, F } = h;
const PI = Math.PI;
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
const stats = async () => { await built(); return pc(() => window.partcraft.regen.stats); };
const proj3 = (p) => pc((p) => { const v = window.partcraft.view; const q = new (v.camera.position.constructor)(p[0], p[1], p[2]).project(v.camera); const r = v.canvas.getBoundingClientRect(); return [r.left + (q.x + 1) / 2 * r.width, r.top + (1 - q.y) / 2 * r.height]; }, p);

try {
  console.log('\n== mesh kernel: fillet and chamfer on edges picked in the view (K.2b, K.4)');
  const P = await import('../../public_html/assets/apps/partcraft/dev/part.js');
  const bp = P.newPart('Block');
  const s1 = P.addFeature(bp, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: F.blockSketch(100, 50).sk });
  P.addFeature(bp, 'extrude', { sketch: s1.id, depth: 20 });
  await pc((t) => window.partcraft.openText(t, 'Block.partcraft.json'), JSON.stringify(bp));
  let s = await stats();
  ok((await pc(() => window.partcraft.exact.state)) === 'off' && near(s.volume, 100000, 1e-3) && (await pc(() => !!window.partcraft.regen.named)), 'block opened on the mesh kernel, with named faces and edges');
  await pc(() => window.partcraft.view.view('iso'));
  await page.waitForTimeout(100);
  const vert = await pc(() => window.partcraft.regen.edges.map((e, i) => ({ i, at: e.at, side: e.faces.every((n) => n.includes('.side:')) })).filter((e) => e.side));
  const clickEdge = async (at, shift) => { const [x, y] = await proj3(at); if (shift) await page.keyboard.down('Shift'); await page.mouse.click(x, y); if (shift) await page.keyboard.up('Shift'); await page.waitForTimeout(40); };
  const e1 = vert.find((e) => near(e.at[0], 0, 1e-4) && near(e.at[2], 0, 1e-4)), e2 = vert.find((e) => near(e.at[0], 100, 1e-4) && near(e.at[2], 0, 1e-4));
  await clickEdge(e1.at, false);
  let pk = await pc(() => window.partcraft.pick);
  ok(pk && pk.kind === 'edge' && pk.edge === e1.i && near(pk.info.len, 20, 1e-4), `clicking an edge picks the whole edge (length ${pk?.info?.len?.toFixed(4)}, the two faces it joins)`);
  await clickEdge(e2.at, true);
  ok((await pc(() => window.partcraft.multi.length)) === 2, 'Shift+click adds the second edge');
  ok(!(await page.isDisabled('.pc-tools [data-cmd="fillet"]')) && !/not built/.test(await page.getAttribute('.pc-tools [data-cmd="fillet"]', 'title')), 'Fillet is on the toolbar as a working tool (no "not built yet")');
  await tool('fillet');
  const fil = await pc(() => window.partcraft.part.features.at(-1));
  ok(fil.type === 'fillet' && fil.edges.length === 2, 'Fillet makes a fillet of the two picked edges');
  const rIn = page.locator('.pc-right label:has-text("Radius") + input');
  await rIn.fill('5'); await rIn.press('Enter');
  s = await stats();
  const corner = (25 - 25 * PI / 4) * 20;
  ok(Math.abs(s.volume - (100000 - 2 * corner)) / (2 * corner) < 0.01, `radius 5: 100000 − 2·(5² − 25π/4)·20 = ${(100000 - 2 * corner).toFixed(3)} (${s.volume.toFixed(3)}; the rounds are faceted)`);
  const r3 = await pc(() => window.partcraft.regen.results.get('f3'));
  ok(r3.status === 'ok' && !r3.warning, 'the fillet builds; its two edges do not meet, so there is no note');
  const blends = await pc(() => window.partcraft.regen.faces.filter((f) => /\.blend:/.test(f.name)).map((f) => [f.type, f.r]));
  ok(blends.length === 2 && blends.every(([ty, r]) => ty === 'cylinder' && near(r, 5, 1e-9)), 'its two round faces are cylinders r 5 (blend:0, blend:1), pickable like any face');
  await shot('fm-1-fillet');
  await page.click('.pc-tree [data-id="f2"]');
  const w = page.locator('.pc-right .pc-dimrow').first().locator('input');
  await w.fill('120'); await w.press('Enter');
  s = await stats();
  ok((await pc(() => window.partcraft.regen.results.get('f3').status)) === 'ok' && Math.abs(s.volume - (120000 - 2 * corner)) / (2 * corner) < 0.01, `width 100 → 120: the fillet follows its two edges by their names (${s.volume.toFixed(3)})`);

  // shell: pick the top face, then "Shell, opening this face" (K.5)
  await pc(() => window.partcraft.view.view('iso'));
  await page.waitForTimeout(80);
  const topPt = await proj3([60, 20, -25]);
  await page.mouse.click(topPt[0], topPt[1]);
  pk = await pc(() => window.partcraft.pick);
  ok(pk && pk.kind === 'face' && pk.info && pk.info.type === 'plane' && pk.info.name === 'f2.end', 'clicking the top face picks it (face f2.end, a plane)');
  await page.click('.pc-right button:has-text("Shell, opening this face")');
  s = await stats();
  const outer = 120000 - 2 * corner, inner = (116 * 46 - 2 * (9 - 9 * PI / 4)) * 18;
  const shR = await pc(() => { const f = window.partcraft.part.features.at(-1); return [f.type, window.partcraft.regen.results.get(f.id).status, window.partcraft.regen.faces.filter((x) => /~/.test(x.name)).length]; });
  ok(shR[0] === 'shell' && shR[1] === 'ok' && Math.abs(s.volume - (outer - inner)) / (outer - inner) < 3e-3 && shR[2] >= 5, `Shell 2 mm, top open: ${(outer - inner).toFixed(3)} with the exact kernel's rounded inside corners (${s.volume.toFixed(3)}, faceted); ${shR[2]} inner faces named`);
  await shot('fm-15-shell');

  await page.keyboard.press('Escape');
  await tool('chamfer');
  await page.waitForFunction(() => window.partcraft.mode === 'pick');
  ok(true, 'Chamfer with nothing picked opens pick mode');
  await pc(() => window.partcraft.view.view('iso'));
  await page.waitForTimeout(80);
  const topBack = await pc(() => window.partcraft.regen.edges.filter((e) => e.type === 'line' && e.faces.includes('f2.end') && e.faces.some((n) => /side/.test(n))).map((e) => e.at));
  const ed = topBack.sort((a, b) => b[0] - a[0] || a[2] - b[2])[0];
  const [bx, by] = await proj3(ed);
  await page.mouse.click(bx, by);
  await built();
  ok((await pc(() => window.partcraft.part.features.at(-1).edges.length)) === 1, 'clicking an edge in pick mode adds it to the chamfer');
  await tool('pick-done');
  await page.waitForFunction(() => window.partcraft.mode === 'model');
  const ch = await pc(() => { const f = window.partcraft.part.features.at(-1); return [window.partcraft.regen.results.get(f.id).status, window.partcraft.regen.faces.filter((x) => /\.bevel:/.test(x.name)).length]; });
  ok(ch[0] === 'ok' && ch[1] === 1, `Done: the chamfer builds one bevel face (${ch.join(', ')})`);
  await shot('fm-2-chamfer');
  ok((await page.textContent('.pc-tree')).includes('Fillet1') && (await page.textContent('.pc-tree')).includes('Shell1') && (await page.textContent('.pc-tree')).includes('Chamfer1'), 'the history lists Fillet1, Shell1 and Chamfer1');
  // draft (K.5): a fresh block, its front face clicked, Draft from the menu (3° about the base by default), 5° from the panel
  await pc((t) => window.partcraft.openText(t, 'Block.partcraft.json'), JSON.stringify(bp));
  await stats();
  await pc(() => window.partcraft.view.view('iso'));
  await page.waitForTimeout(80);
  const frontPt = await proj3([50, 10, 0]);
  await page.mouse.click(frontPt[0], frontPt[1]);
  pk = await pc(() => window.partcraft.pick);
  ok(pk && pk.kind === 'face' && pk.info?.type === 'plane' && Math.abs(pk.info.n[2] - 1) < 1e-9, `the front face picked (${pk?.info?.name})`);
  await pc(() => window.partcraft.run('draft'));
  await built();
  const dr = await pc(() => window.partcraft.part.features.at(-1));
  ok(dr.type === 'draft' && dr.faces.length === 1 && dr.angle === 3, 'Draft from the menu takes the picked face, 3° about the base');
  const aIn = page.locator('.pc-right label:has-text("Angle") + input').first();
  await aIn.fill('5'); await aIn.press('Enter');
  s = await stats();
  const wedge = 400 * Math.tan(5 * PI / 180) / 2 * 100;
  ok(Math.abs((100000 - s.volume) - wedge) < 1e-2 && (await pc(() => window.partcraft.regen.results.get(window.partcraft.part.features.at(-1).id).status)) === 'ok', `5° from the panel: ${wedge.toFixed(3)} mm³ taken off the 100 mm face (${(100000 - s.volume).toFixed(3)})`);
  await shot('fm-3-draft');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
} catch (err) { await h.failed(err); }
await h.finish();
