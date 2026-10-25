#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-manufacture.mjs — PartCraft's Manufacture workspace in headless Chromium, by clicks: the flange, a new setup,
 * Face, Pocket (the disc top picked in the view, step-down typed), Drill (the eight bolt holes picked), Contour (the
 * Ø200 rim picked), toolpaths and the stock simulated in the compute worker with no gouges, playback, the stock
 * overlay, GRBL G-code downloaded and read back by test-cam.mjs's parser (hole points at the bolt circle, depths,
 * arcs), the study saved in the part, one toolbar row at 1440 px, back to Design, no console errors.
 *   node tools/partcraft-test/browser-manufacture.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function run(h) {
  const { page, ok, pc, built, tool, shot, F } = h;
  const { parseGcode } = await import('./test-cam.mjs');
  const rows = () => page.evaluate(() => new Set([...document.querySelectorAll('.pc-tools [role=group]')].filter((g) => !g.hidden).map((g) => g.offsetTop)).size);
  const choose = async (id) => { await page.selectOption('[data-workspace]', id); await page.waitForFunction((id) => window.partcraft.workspace === id, id); };
  // a screen point on face `name` (or every face matching a pattern): candidate world points projected, kept when the view picks that face
  const facePoints = (sel) => page.evaluate(({ sel }) => {
    const pcw = window.partcraft, view = pcw.view, THREE = pcw.host.THREE, rg = pcw.regen;
    const re = new RegExp(sel.re);
    const out = [];
    rg.faces.forEach((f, i) => {
      if (!re.test(f.name)) return;
      const cands = [];
      if (f.type === 'cylinder') { const c = f.axis.o; for (let a = 0; a < 360; a += 15) for (const y of sel.ys) cands.push([c[0] + f.r * Math.cos(a * Math.PI / 180), y, c[2] + f.r * Math.sin(a * Math.PI / 180)]); }
      else for (const [r, a] of sel.polar) cands.push([r * Math.cos(a * Math.PI / 180), f.o[1], r * Math.sin(a * Math.PI / 180)]);
      const rect = view.canvas.getBoundingClientRect();
      for (const w of cands) {
        const v = new THREE.Vector3(...w).project(view.camera);
        const x = rect.left + (v.x + 1) / 2 * rect.width, y = rect.top + (1 - v.y) / 2 * rect.height;
        if (x < rect.left + 4 || y < rect.top + 4 || x > rect.right - 4 || y > rect.bottom - 4) continue;
        const hit = view.pickAt(x, y, { edges: false });
        if (hit && hit.kind === 'face' && hit.face === i) { out.push({ name: f.name, x, y }); break; }
      }
    });
    return out;
  }, { sel });
  const waitResult = () => page.waitForFunction(() => !!document.querySelector('[data-mgouges]') && !/Generating/.test(document.querySelector('[data-mprogram]')?.textContent || ''), null, { timeout: 180000 });


  console.log('\n== manufacture: setup and operations by clicks');
  await pc(() => window.partcraft.exactReady());
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
  await built();
  await choose('manufacture');
  await page.click('[data-mnew]');
  await page.waitForFunction(() => !!window.partcraft.part.studies?.manufacture);
  ok(await rows() === 1, 'Manufacture: the toolbar is one row at 1440 px');
  ok(await page.isVisible('[data-mtab="setup"][aria-pressed="true"]'), 'New setup opens the Setup tab');
  await page.click('[data-mtab="ops"]');
  await tool('manufacture-face');
  await page.waitForSelector('[data-mop]');
  // pocket: the disc top face (around the hub), picked in the view
  await tool('manufacture-pocket');
  await page.waitForSelector('[data-mpick][aria-pressed="true"]');
  const disc = await facePoints({ re: '^f2\\.side:l17$', polar: [[62, -90], [62, 90], [62, 0], [62, 180], [88, -60], [88, 120]], ys: [] });
  ok(disc.length === 1, 'the disc top face is found on screen');
  await page.mouse.click(disc[0].x, disc[0].y);
  await page.waitForFunction(() => window.partcraft.part.studies.manufacture.ops[1]?.geo.faces.length === 1);
  await page.fill('[data-mparam="stepdown"]', '10');
  await page.press('[data-mparam="stepdown"]', 'Tab');
  await page.waitForFunction(() => window.partcraft.part.studies.manufacture.ops[1].params.stepdown === 10);
  await page.click('[data-mpick]');
  ok((await pc(() => window.partcraft.part.studies.manufacture.ops[1].geo.faces[0].name)) === 'f2.side:l17', 'Pocket: the disc top picked by a click, step-down 10 typed');
  // drill: the eight bolt holes
  await tool('manufacture-drill');
  await page.waitForSelector('[data-mpick][aria-pressed="true"]');
  // the Top view (Views menu), then each hole's rim clicked (a rim means its hole)
  await page.click('[data-views-menu] summary');
  await page.click('[data-cmd="view-top"]');
  await page.waitForTimeout(200);
  const holes = await page.evaluate(() => {
    const pcw = window.partcraft, view = pcw.view, THREE = pcw.host.THREE, rg = pcw.regen;
    const rect = view.canvas.getBoundingClientRect(), out = [];
    rg.faces.forEach((f, i) => {
      if (!/^f4\.wall/.test(f.name)) return;
      for (let a = 0; a < 360; a += 20) {
        const w = [f.axis.o[0] + 7 * Math.cos(a * Math.PI / 180), 30, f.axis.o[2] + 7 * Math.sin(a * Math.PI / 180)];
        const v = new THREE.Vector3(...w).project(view.camera);
        const x = rect.left + (v.x + 1) / 2 * rect.width, y = rect.top + (1 - v.y) / 2 * rect.height;
        const hit = view.pickAt(x, y);
        if (hit && hit.kind === 'edge' && hit.edge >= 0 && rg.edges[hit.edge].faces.includes(f.name)) { out.push({ name: f.name, x, y }); break; }
      }
    });
    return out;
  });
  for (const p of holes) { await page.mouse.click(p.x, p.y); await page.waitForTimeout(60); }
  await page.waitForFunction((n) => window.partcraft.part.studies.manufacture.ops[2]?.geo.faces.length === n, holes.length);
  await page.keyboard.press('Escape');
  ok(holes.length === 8, `Drill: all 8 bolt holes picked by clicking their rims in the Top view (${holes.length})`);
  await page.click('[data-views-menu] summary');
  await page.click('[data-cmd="view-iso"]');
  await page.waitForTimeout(200);
  // contour: the Ø200 rim
  await tool('manufacture-contour');
  await page.waitForSelector('[data-mpick][aria-pressed="true"]');
  const rim = await facePoints({ re: '^f2\\.side:l13$', ys: [15, 5, 25] });
  await page.mouse.click(rim[0].x, rim[0].y);
  await page.waitForFunction(() => window.partcraft.part.studies.manufacture.ops[3]?.geo.faces.length === 1);
  await page.fill('[data-mparam="stepdown"]', '10');
  await page.press('[data-mparam="stepdown"]', 'Tab');
  await page.click('[data-mpick]');
  const ops = await pc(() => window.partcraft.part.studies.manufacture.ops.map((o) => o.type).join(','));
  ok(ops === 'face,pocket,drill,contour', 'four operations in order: ' + ops);
  // a bad pick is refused with a reason
  await page.click('[data-mop]:nth-child(3)');
  await page.click('[data-mpick]');
  await page.mouse.click(disc[0].x, disc[0].y);
  await page.waitForTimeout(150);
  ok(/round holes/.test(await h.statusText()) && (await pc(() => window.partcraft.part.studies.manufacture.ops[2].geo.faces.length)) === 8, 'Drill refuses a flat face, saying it takes round holes');
  await page.keyboard.press('Escape');

  console.log('\n== manufacture: simulate, playback, post');
  await tool('manufacture-simulate');
  await waitResult();
  const flags = await page.evaluate(() => [...document.querySelectorAll('[data-mop] .pc-node-flag')].map((n) => n.textContent));
  ok(flags.every((f) => /moves|note/.test(f)), 'every operation has a toolpath: ' + flags.join(', '));
  const g = await page.getAttribute('[data-mgouges]', 'data-mgouges');
  ok(g === '0', 'the simulated program cuts no gouges into the flange');
  const secs = Number(await page.getAttribute('[data-mtime]', 'data-mtime'));
  ok(secs > 60, `cycle time shown (${Math.round(secs / 60)} min)`);
  const ov = await pc(() => [...window.partcraft.view.overlays.keys()].sort().join(','));
  ok(/manufacture-paths/.test(ov) && /manufacture-stock/.test(ov), 'toolpaths and the simulated stock drawn as overlays: ' + ov);
  ok(await page.isEnabled('.pc-tools [data-cmd="manufacture-post"]'), 'the toolbar Post button is on once toolpaths exist');
  await page.focus('[data-mplay]');
  await page.keyboard.press('End');
  await page.waitForTimeout(100);
  ok(/Segment \d+ of \d+/.test(await page.textContent('[data-mwhere]')) && (await pc(() => window.partcraft.view.overlays.has('manufacture-tool'))), 'playback: the tool shown at the last segment');
  await shot('manufacture-flange');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-mpost]')]);
  const file = path.join(h.OUT, 'flange-grbl.nc');
  await dl.saveAs(file);
  const text = fs.readFileSync(file, 'utf8');
  ok(dl.suggestedFilename().endsWith('.nc') && /^\(Generated by PartCraft, lab build - verify before running\)/.test(text) && !/G8[13]|M6|^N\d/m.test(text), `GRBL file downloaded (${dl.suggestedFilename()}): header, no canned cycles, no M6`);
  const got = parseGcode(text);
  ok(!got.err && got.moves.length > 500 && got.moves.some((m) => m.k === 'arc'), `the downloaded G-code parses: ${got.moves.length} moves, arcs included`);
  const bottoms = new Map();
  for (const m of got.moves) if (m.k === 'feed' && Math.abs(m.a[0] - m.b[0]) < 1e-9 && Math.abs(m.a[1] - m.b[1]) < 1e-9) { const k = m.b[0].toFixed(3) + ',' + m.b[1].toFixed(3); bottoms.set(k, Math.min(bottoms.get(k) ?? 0, m.b[2])); }
  const tip = 7 / Math.tan(59 * Math.PI / 180);
  const want = Array.from({ length: 8 }, (_, k) => [102 + 75 * Math.cos(k * Math.PI / 4), 102 + 75 * Math.sin(k * Math.PI / 4)]);
  const hit = want.filter((w) => [...bottoms].some(([k, z]) => { const [x, y] = k.split(',').map(Number); return Math.hypot(x - w[0], y - w[1]) < 1e-3 && Math.abs(z - (-82 - tip)) < 1e-3; }));
  ok(hit.length === 8, 'G-code drills all 8 bolt holes at the bolt circle to −82 − tip (through, full diameter)');
  ok(Math.min(...got.moves.map((m) => m.b[2])) < -81.9, 'the contour goes through the bottom (breakthrough 1 mm)');
  const saved = await pc(() => JSON.parse(JSON.stringify(window.partcraft.part)).studies.manufacture.ops.length);
  ok(saved === 4, 'the study is saved in the part (4 operations)');
  await choose('design');
  ok(await pc(() => window.partcraft.view.overlays.size === 0), 'back in Design: the overlays are gone');
  ok(h.problems.length === 0, 'manufacture: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
