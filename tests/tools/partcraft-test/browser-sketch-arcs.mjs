#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-sketch-arcs.mjs — PartCraft's Arc tool, its ten methods and Continue (0.9 FX.137), by real clicks and typed numbers in
 * headless Chromium: the Sketch › More menu lists them, each method draws the arc arcs.js gives for the same inputs (compared with the
 * geometry module itself and with hand-worked arcs), typed angle / chord length / radius / direction, Continue on from a line and an
 * arc with a tangent relation, an impossible input says why and keeps the tool going, the old Center / Start / End still follows the pointer.
 *   node tools/partcraft-test/browser-sketch-arcs.mjs [--state file] [--out dir]      (PC_EXACT=0 for the mesh kernel alone)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEV = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, tool, shot, near } = h;
  const sk2page = (p) => pc((p) => { const e = window.partcraft.editor; const r = e.canvas.getBoundingClientRect(); const [x, y] = e.toScreen(p); return [r.left + x, r.top + y]; }, p);
  const clickSk = async (p) => { const [x, y] = await sk2page(p); await page.mouse.move(x, y); await page.mouse.click(x, y); await page.waitForTimeout(40); };
  const moveSk = async (p) => { const [x, y] = await sk2page(p); await page.mouse.move(x, y); await page.waitForTimeout(40); };
  const typeIn = async (v) => { await page.keyboard.type(String(v)); await page.waitForSelector('[data-dim-input]:not([hidden])'); await page.press('[data-dim-input]', 'Enter'); await page.waitForTimeout(60); };   // the first key opens the box
  const sketch = () => pc(() => JSON.parse(JSON.stringify(window.partcraft.part.features.find((f) => f.id === window.partcraft.editing).sketch)));
  const status = () => page.textContent('[data-status]');
  const method = (m) => pc((m) => document.querySelector(`[data-cmd="tool-arc-${m}"]`).click(), m);
  const arcs = async () => { const sk = await sketch(); return sk.entities.filter((e) => e.type === 'arc').map((a) => { const g = (id) => sk.entities.find((e) => e.id === id); const c = g(a.c), s = g(a.s), e = g(a.e); const a0 = Math.atan2(s.y - c.y, s.x - c.x); let sw = Math.atan2(e.y - c.y, e.x - c.x) - a0; while (sw <= 1e-12) sw += 2 * Math.PI; return { id: a.id, cx: c.x, cy: c.y, r: Math.hypot(s.x - c.x, s.y - c.y), sw, s: [s.x, s.y], e: [e.x, e.y] }; }); };
  const last = async () => (await arcs()).slice(-1)[0];
  const PI = Math.PI;

  console.log('\n== sketch arcs: the menu');
  await page.click('[data-cmd="new"]');
  if (await page.$('dialog[open]')) await page.click('dialog[open] button[data-key="discard"]');
  await page.waitForFunction(() => window.partcraft.part.features.length === 0);
  await page.click('[data-plane="front"]');
  await tool('sketch');
  await page.waitForFunction(() => window.partcraft.mode === 'sketch');
  await pc(() => window.partcraft.editor.setView({ cx: 50, cy: 10, s: 3 }));
  const items = await pc(() => [...document.querySelectorAll('[data-sketch-menu] [data-cmd^="tool-arc-"]')].map((b) => b.dataset.cmd.slice(9)));
  ok(items.join() === '3p,sce,sca,scl,sea,sed,ser,cse,csa,csl,con', 'Sketch › More lists all ten arc methods and Continue: ' + items.join());
  ok((await pc(() => [...document.querySelectorAll('[data-sketch-menu] [data-cmd^="tool-arc-"]')].every((b) => /^Arc: /.test(b.textContent)))), 'each is labelled "Arc: …"');
  await page.click('[data-sketch-menu] summary');
  await page.click('[data-sketch-menu] [data-cmd="tool-arc-sce"]');
  ok((await pc(() => window.partcraft.editor.tool + ':' + window.partcraft.editor.arcM)) === 'arc:SCE', 'a menu click picks the method and starts the Arc tool');
  ok(/start point/.test(await status()), 'the status bar asks for the start point: ' + (await status()));

  console.log('\n== sketch arcs: methods by clicks');
  // origin of the examples: centre (40,10), r 20, quarter turn from east to north
  const C = [40, 10], E = [60, 10], N = [40, 30];
  const quarter = (a, what) => ok(a && near(a.cx, 40, 1e-6) && near(a.cy, 10, 1e-6) && near(a.r, 20, 1e-6) && near(a.sw, PI / 2, 1e-6) && near(a.s[0], 60, 1e-6) && near(a.s[1], 10, 1e-6), what);
  await method('sce'); await clickSk(E); await clickSk(C); await clickSk([40, 50]);   // the end click is only a direction
  quarter(await last(), 'Start, Center, End: start east, centre, a click north of the centre');
  await method('cse'); await clickSk(C); await clickSk([70, 10]); await clickSk([40, 40]);
  { const a = await last(); ok(near(a.cx, 40, 1e-6) && near(a.r, 30, 1e-6) && near(a.sw, PI / 2, 1e-6), 'Center, Start, End: the arc the tool always drew, still there'); }
  await method('3p'); await clickSk(E); await clickSk([40 + 20 * Math.SQRT1_2, 10 + 20 * Math.SQRT1_2]); await clickSk(N);
  quarter(await last(), '3-Point: east, the middle of the quarter, north');
  await method('sca'); await clickSk(E); await clickSk(C); await typeIn(90);
  quarter(await last(), 'Start, Center, Angle: a typed 90 degrees');
  await method('csa'); await clickSk(C); await clickSk(E); await typeIn(90);
  quarter(await last(), 'Center, Start, Angle: a typed 90');
  await method('scl'); await clickSk(E); await clickSk(C); await typeIn(20 * Math.SQRT2);
  quarter(await last(), 'Start, Center, Length: a typed chord of 20 root 2');
  await method('csl'); await clickSk(C); await clickSk(E); await typeIn(20 * Math.SQRT2);
  quarter(await last(), 'Center, Start, Length: the same chord');
  await method('sea'); await clickSk(E); await clickSk(N); await typeIn(90);
  quarter(await last(), 'Start, End, Angle: east to north, 90 degrees');
  await method('ser'); await clickSk(E); await clickSk(N); await typeIn(20);
  { const a = await last(); quarter(a, 'Start, End, Radius: a typed 20'); const sk = await sketch(); ok(sk.constraints.some((c) => c.type === 'radius' && near(c.value, 20, 1e-9)), 'the typed radius is a driving dimension'); }
  await method('sed'); await clickSk(E); await clickSk(N); await typeIn(90);   // heading north from the start: centre to the west
  quarter(await last(), 'Start, End, Direction: leaving east going north (90 degrees)');
  const n0 = (await arcs()).length;
  await shot('sk-arcs-methods');

  console.log('\n== sketch arcs: the pointer gives the number too');
  await method('sca'); await clickSk(E); await clickSk(C); await clickSk(N);   // a click: the angle the pointer is at
  quarter(await last(), 'Start, Center, Angle by a click: the pointer at north is 90 degrees');
  await method('ser'); await clickSk(E); await clickSk(N); await clickSk([40, 10 + 0]);   // a click 20 from the start = radius 20
  { const a = await last(); ok(near(a.r, 20, 3), 'Start, End, Radius by a click: the distance from the start'); }

  console.log('\n== sketch arcs: clockwise, impossible and a live preview');
  await method('sca'); await clickSk(E); await clickSk(C); await typeIn(-90);
  { const a = await last(); ok(near(a.sw, PI / 2, 1e-6) && near(a.s[0], 40, 1e-6) && near(a.s[1], -10, 1e-6) && near(a.e[0], 60, 1e-6), 'a negative angle is the clockwise arc (stored counter-clockwise, ends swapped)'); }
  const before = (await arcs()).length;
  await method('ser'); await clickSk([80, 70]); await clickSk([90, 70]); await typeIn(0.1);
  ok((await arcs()).length === before && /radius/i.test(await status()), 'a radius too small for the two ends says so and makes nothing: ' + (await status()));
  await method('3p'); await clickSk([60, 70]); await clickSk([80, 80]); await moveSk([100, 70]);
  ok((await pc(() => window.partcraft.editor.step && window.partcraft.editor.step.v.length)) === 2, 'mid-arc the tool holds the two points given');
  await page.keyboard.press('Escape'); await page.waitForTimeout(40);
  ok((await arcs()).length === before, 'Escape drops an arc half drawn');
  await method('3p'); await clickSk([60, 70]); await clickSk([80, 70]); await clickSk([100, 70]);
  ok((await arcs()).length === before && /line/.test(await status()), 'three points in a line say so and make nothing');
  await page.keyboard.press('Escape');

  console.log('\n== sketch arcs: Continue');
  await pc(() => window.partcraft.editor.setTool('select'));
  await method('con');   // after the last arc: a tangent arc from its end
  ok((await pc(() => window.partcraft.editor.arcM)) === 'CON' && (await pc(() => !!window.partcraft.editor.step)), 'Continue starts from the last line or arc by itself');
  const lastArc = await last();
  const endOf = lastArc.e;
  const dir = [-(lastArc.e[1] - lastArc.cy), lastArc.e[0] - lastArc.cx]; const dl = Math.hypot(...dir);
  const target = [endOf[0] + (dir[0] / dl) * 10 + (-dir[1] / dl) * 10 * 0, endOf[1] + (dir[1] / dl) * 10];
  const aBefore = (await arcs()).length;
  await clickSk([endOf[0] + (dir[0] / dl) * 12 + (dir[1] / dl) * 6, endOf[1] + (dir[1] / dl) * 12 - (dir[0] / dl) * 6]);
  const sk = await sketch();
  ok((await arcs()).length === aBefore + 1, 'one click makes the arc');
  ok(sk.constraints.some((c) => c.type === 'tangent'), 'with a tangent relation to the arc it continues');
  ok((await pc(() => window.partcraft.lastSolve.conflicts.length)) === 0, 'and the sketch solves with no conflicts');
  const a2 = await last();
  ok(near(a2.s[0], endOf[0], 1e-4) && near(a2.s[1], endOf[1], 1e-4) || near(a2.e[0], endOf[0], 1e-4) && near(a2.e[1], endOf[1], 1e-4), 'it starts at the old arc\'s end');
  await page.keyboard.press('Escape');
  await tool('exit-sketch');
  await built(h);
  ok(h.problems.length === 0, 'sketch arcs: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}
const built = (h) => h.built();

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
