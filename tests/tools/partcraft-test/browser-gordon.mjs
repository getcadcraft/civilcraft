#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-gordon.mjs — the Gordon (curve-network) surface by real clicks in headless Chromium: More › Gordon surface on a
 * part holding three arc sketches and three line sketches (profiles and guides assigned by their planes), the network
 * report, the quarter-cylinder area against π/2·r·h, a sketch switched to "Not used" from the panel and back with
 * Ctrl+Z, More › Thicken on it (exact tube volume within 1e-5), then a block whose four top edges are clicked in the view
 * as profiles and guides (a 100 × 80 surface), the toolbar one row at 1440 px, the part saved, no console errors.
 *   node tools/partcraft-test/browser-gordon.mjs [--state file] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.resolve(HERE, '../../public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, built, shot, nearRel } = h;
  const P = await import(path.join(DEV, 'part.js'));
  const S = await import(path.join(DEV, 'sketch.js'));
  const V = await import(path.join(DEV, 'vec.js'));
  const rows = () => page.evaluate(() => new Set([...document.querySelectorAll('.pc-tools [role=group]')].filter((g) => !g.hidden).map((g) => g.offsetTop)).size);
  const menu = async (cmd) => { await page.click('[data-features-menu] > summary'); await page.click(`[data-features-menu] [data-cmd="${cmd}"]`); await built(); };
  const last = () => pc(() => { const p = window.partcraft.part, f = p.features[p.features.length - 1], r = window.partcraft.regen.results.get(f.id); return { f, status: r?.status, message: r?.message, gordon: r?.gordon || null, sheets: (window.partcraft.regen.sheets || []).map((s) => ({ feature: s.feature, area: s.area })), volume: window.partcraft.regen.stats?.volume || 0 }; });
  const open = async (part) => {
    await pc((t) => window.partcraft.openText(t, 'Gordon.partcraft.json'), P.toJSON(part));
    await page.waitForTimeout(200);
    if (await page.locator('dialog[open] button', { hasText: 'Discard' }).count()) await page.click('dialog[open] button:has-text("Discard")');
    await pc(() => window.partcraft.exactReady());
    await built();
  };
  const screen = (p) => pc((p) => { const { view, host } = window.partcraft; const r = view.canvas.getBoundingClientRect(); const v = new host.THREE.Vector3(...p).project(view.camera); return [(v.x + 1) / 2 * r.width + r.left, (1 - v.y) / 2 * r.height + r.top]; }, p);

  console.log('\n== gordon: a curve network from sketches, by the More menu');
  const R = 50, PI = Math.PI;
  const part = P.newPart('Gordon');
  const onPlane = (o, n, draw) => { const fr = V.frameFor(n, o); const sk = S.newSketch(); draw(sk, (p) => V.toPlane(fr, p)); return P.addFeature(part, 'sketch', { sketch: sk, plane: { kind: 'fixed', o, n } }); };
  const arcs = [0, 50, 100].map((z) => onPlane([0, 0, z], [0, 0, 1], (sk, L) => S.addArc(sk, L([0, 0, z]), L([R, 0, z]), L([0, R, z]))));
  const lines = [0, 40, 90].map((deg) => { const th = deg * PI / 180, d = [Math.cos(th), Math.sin(th), 0]; return onPlane([0, 0, 0], [-Math.sin(th), Math.cos(th), 0], (sk, L) => S.addLine(sk, L(V.mul(d, R)), L(V.add(V.mul(d, R), [0, 0, 100])))); });
  await open(part);
  const items = await page.evaluate(() => [...document.querySelectorAll('[data-features-menu] [data-cmd]')].map((b) => b.dataset.cmd));
  ok(items.includes('gordon') && items.indexOf('gordon') === items.indexOf('surfloft') + 1, 'Features › More lists "Gordon surface" after "Loft surface"');
  await menu('gordon');
  let g = await last();
  const area = PI / 2 * R * 100;
  const sheet = g.sheets.find((s) => s.feature === g.f.id);
  ok(g.f.type === 'gordon' && g.f.profiles.map((x) => x.sketch).join() === arcs.map((s) => s.id).join() && g.f.guides.map((x) => x.sketch).join() === lines.map((s) => s.id).join(), 'More › Gordon surface: the arc sketches (parallel planes) become the profiles, the line sketches the guides');
  ok(g.status === 'ok' && sheet && nearRel(sheet.area, area, 1e-6), `a surface body of area ${sheet?.area.toFixed(5)} = π/2·50·100 = ${area.toFixed(5)} (${g.message || 'ok'})`);
  const panel = await page.textContent('#main');
  ok(/3 profiles × 3 guides/.test(panel) && /follows every curve within/.test(panel), 'the panel describes the network: "3 profiles × 3 guides … follows every curve within …"');
  ok(g.gordon && g.gordon.dev < 1e-6 * g.gordon.size, `the surface follows every curve within ${g.gordon?.dev.toExponential(1)} mm (< 1e-6 of the network size)`);
  await shot('gordon-network');
  // the middle arc switched off from the panel, then Ctrl+Z
  const n0 = await pc(() => window.partcraft.hist.undoStack.length);
  await page.selectOption(`[data-gordon-sketch="${arcs[1].id}"]`, '');
  await built();
  g = await last();
  ok(g.f.profiles.length === 2 && g.status === 'ok' && nearRel(g.sheets.find((s) => s.feature === g.f.id)?.area || 0, area, 1e-6), `the middle arc set to "Not used": 2 profiles, the same quarter cylinder (${g.status})`);
  await page.keyboard.press('Control+z');
  await built();
  g = await last();
  ok(g.f.profiles.length === 3 && await pc(() => window.partcraft.hist.undoStack.length) === n0, 'Ctrl+Z brings it back (one undo step)');
  // thicken it from the menu
  await page.click('[data-tree] [data-id="' + g.f.id + '"]').catch(() => {});
  await menu('thicken');
  const th = await last();
  const vOut = PI / 4 * ((R + th.f.t) ** 2 - R ** 2) * 100, vIn = PI / 4 * (R ** 2 - (R - th.f.t) ** 2) * 100;
  const err = Math.min(Math.abs(th.volume - vOut) / vOut, Math.abs(th.volume - vIn) / vIn);
  ok(th.f.type === 'thicken' && th.f.sheet === g.f.id && th.status === 'ok' && err < 1e-5, `More › Thicken on the Gordon surface: ${th.volume.toFixed(3)} mm³ = the exact quarter tube within ${err.toExponential(1)}`);
  ok(await rows() === 1, 'the toolbar is one row at 1440 px');
  const saved = await pc(() => JSON.parse(window.partcraft.toJSON ? window.partcraft.toJSON() : JSON.stringify(window.partcraft.part)));
  ok(saved.features.some((f) => f.type === 'gordon' && f.guides.length === 3), 'the Gordon feature is in the saved part');

  console.log('\n== gordon: model edges clicked in the view');
  const bp = P.newPart('GordonEdges');
  const sk = S.newSketch(); S.addRect(sk, [0, 0], [100, 80]);
  const s1 = P.addFeature(bp, 'sketch', { sketch: sk, plane: { kind: 'base', name: 'front' } });
  const ex = P.addFeature(bp, 'extrude', { sketch: s1.id, op: 'add', end: 'blind', depth: 20 });
  await open(bp);
  await pc(() => window.partcraft.view.fit?.());
  await menu('gordon');
  g = await last();
  ok(g.f.type === 'gordon' && g.status === 'error' && /profiles and the guides/.test(g.message), `with no curves the feature says what it needs: "${g.message}"`);
  const pickEdges = async (key, mids) => {
    await page.click(`[data-slot="edges-${key}"]`);
    for (const m of mids) { const [x, y] = await screen(m); await page.mouse.click(x, y); await built(); }
    await page.keyboard.press('Escape');
    await built();
  };
  await pickEdges('profiles', [[50, 0, 20], [50, 80, 20]]);
  await pickEdges('guides', [[0, 40, 20], [100, 40, 20]]);
  g = await last();
  const es = g.sheets.find((s) => s.feature === g.f.id);
  ok(g.f.profiles.length === 2 && g.f.guides.length === 2 && g.f.profiles.every((x) => x.edge && x.edge.faces.includes(`${ex.id}.end`)), `Pick edges as profiles / guides: four clicks on the block's top edges add them (${g.f.profiles.length} + ${g.f.guides.length})`);
  ok(g.status === 'ok' && es && nearRel(es.area, 8000, 1e-9), `a 100 × 80 surface over the top face (area ${es?.area.toFixed(6)})`);
  await shot('gordon-edges');
  ok(h.problems.length === 0, 'gordon: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
