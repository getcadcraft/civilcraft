#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-nodes.mjs — the node editor (0.8 round 3, nodes_PART_3; DC.54) in PartCraft's real page, headless Chromium on /lab/partcraft: the Nodes
 * workspace is in the switcher and opens the shared window; a lamp shade built by wiring nodes (series → vector → points → circles → loft) is drawn
 * in the view (overlay 'nodes'); the graph is kept in the part file (studies.nodes) and comes back when the part opens again; the Script workspace
 * runs the same graph as nd_ lines (CraftScript) and gets the same area; a node error is a Problem (source partcraft.nodes). No console errors.
 *   node tools/partcraft-test/browser-nodes.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');
const LIB = path.join(HERE, '../../lib/nodes/');

export async function run(h) {
  const { page, ok, pc, built, shot } = h;
  console.log('\n== DC.54 Nodes workspace');
  const P = await import(DEV + 'part.js');
  const NODES = await import(LIB + 'index.js');
  await pc((t) => window.partcraft.openText(t, 'Empty.partcraft.json'), P.toJSON(P.newPart('Lamp')));
  await built();
  const wss = await page.$$eval('[data-workspace] option', (o) => o.map((x) => x.value));
  ok(wss.includes('nodes'), 'the workspace switcher has Nodes: ' + wss.join(', '));
  await page.selectOption('[data-workspace]', 'nodes');
  await page.waitForSelector('[data-nodes-window]:not([hidden])', { timeout: 20000 });
  ok(await page.isVisible('[data-nodes-open]'), 'the panel has the Open button and the window is up');
  // the lamp: the same graph the library's test builds
  const g = new NODES.Graph(), w = (a, ap, b, bp) => g.connect({ node: a, port: ap }, { node: b, port: bp });
  const seed = g.add('random', { params: { seed: 7, count: 6, min: 20, max: 40 } }), z = g.add('series', { params: { start: 0, step: 15, count: 6 } });
  const ctr = g.add('point'), pol = g.add('vector', { params: { z: 1 } }), vs = g.add('vector_scale'), pa = g.add('point_add');
  const c = g.add('circle'), lf = g.add('loft', { params: { degree: 3 } }), a = g.add('surface_area'), tm = g.add('to_mesh', { params: { tolerance: 1 }, show: true });
  w(pol, 'out', vs, 'vector'); w(z, 'out', vs, 'factor'); w(ctr, 'out', pa, 'point'); w(vs, 'out', pa, 'vector');
  w(pa, 'out', c, 'center'); w(seed, 'out', c, 'radius'); w(c, 'out', lf, 'sections'); w(lf, 'out', a, 'surface'); w(lf, 'out', tm, 'surface');
  g.layout();
  const json = g.toJSON(), want = new NODES.Evaluator(g).run().values[a].out;
  await pc((j) => window.partcraft.nodes.win.panel.set(j), json);
  await page.waitForFunction(() => window.partcraft.nodes.win.display.group.children.length === 1, null, { timeout: 15000 });
  ok(true, 'the lamp shade (a mesh from the loft) is drawn in the view');
  await pc(() => window.partcraft.nodes.win.panel.set(window.partcraft.nodes.win.panel.graph.toJSON()));
  const foot = (await page.textContent(`[data-nd-node="${a}"] .nd-foot`)).trim();
  ok(Math.abs(Number(foot) - want) < 0.1, `the area node reads ${foot} (library says ${want.toFixed(3)})`);
  // an edit goes into the part file
  await page.fill(`[data-nd-node="${seed}"] input[aria-label="Count"]`, '4'); await page.press(`[data-nd-node="${seed}"] input[aria-label="Count"]`, 'Tab');
  const study = await pc(() => window.partcraft.part.studies?.nodes);
  ok(study && study.nodes.find((n) => n.id === 'n1').params.count === 4, 'a change is kept in the part (studies.nodes)');
  await shot('nodes-lamp');
  // reopen the part: the window reads the graph again
  const text = await pc(() => JSON.stringify(window.partcraft.part));
  await pc((t) => window.partcraft.openText(t, 'Lamp.partcraft.json'), text);
  await built();
  const n = await pc(() => window.partcraft.nodes.win.panel.graph.nodes.length);
  ok(n === 10, 'the part opened again brings the graph back (' + n + ' nodes)');
  // CraftScript: the same graph as nd_ lines
  const script = NODES.script.toScript(NODES.Graph.fromJSON(await pc(() => window.partcraft.part.studies.nodes)));
  const area = await pc(async ({ src, id }) => {
    const RT = await import('/assets/apps/partcraft/dev/cs-all.js'), rt = RT.makeRuntime({ onPrint: () => {} });
    const r = await rt.run(src, { lang: 'craft' });
    const v = rt.ws.get(id);   // the area node
    return r.ok ? (typeof v === 'number' ? v : v.data[0]) : r.error.message;
  }, { src: script, id: a });
  ok(typeof area === 'number' && Math.abs(area - (await pc((id) => window.partcraft.nodes.win.panel.result.values[id].out, a))) < 1e-9, 'CraftScript in the page runs the same graph as nd_ lines: area ' + area);
  // an error: a negative radius is a Problem
  await page.fill(`[data-nd-node="${ctr}"] input[aria-label="Point x"]`, '0').catch(() => {});
  await pc(() => { const gr = window.partcraft.nodes.win.panel.graph; gr.setParam('n1', 'min', -5); gr.setParam('n1', 'max', -1); window.partcraft.nodes.win.panel.set(gr.toJSON()); });
  await page.waitForFunction(() => window.ccProblems.store.list().some((p) => p.source?.name === 'partcraft.nodes' && p.code === 'nodes.err.radius'), null, { timeout: 10000 });
  ok(true, 'a negative radius is a Problem from partcraft.nodes (nodes.err.radius)');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-nodes');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
