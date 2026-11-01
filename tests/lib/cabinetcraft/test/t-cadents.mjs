/* SPDX-License-Identifier: Apache-2.0 */
// Hosts round (DC.117, cabinetcraft_hosts): the job as CAD content (lib/cadents.js): sheets, layers, blocks, real dimensions, hatches, schedule, cut list, nest.
const { ok, section, near, mine, ROOT } = globalThis.__ccTest;
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const P = await mine('lib/project.js');
const An = await mine('lib/analyze.js');
const C = await mine('lib/cadents.js');
const Core = await mine('lib/core.js');
Core.setT((k) => k);

section('CAD sheets');
{
  const a = An.analyze(P.sampleProject('mm'));
  const nest = An.runNest(a.build, { tries: 1, timeLimit: 800 });
  const res = C.cadSheets(a.build, { list: a.list, nest, t: (k) => k });
  const ids = res.sheets.map((s) => s.id);
  ok(ids.includes('plan') && ids.some((i) => i.startsWith('elev-')) && ids.some((i) => i.startsWith('section-')) && ids.includes('schedule') && ids.includes('cutlist') && ids.includes('nest'), 'plan, elevations, sections, schedule, cut list and nest sheets: ' + ids.length + ' sheets');
  const types = new Set(res.sheets.flatMap((s) => s.entities.map((e) => e.type)));
  ok(['line', 'poly', 'text', 'dim', 'hatch', 'insert'].every((t2) => types.has(t2)), 'entity types used: ' + [...types].join(', '));
  ok(res.sheets.flatMap((s) => s.entities).every((e) => !e.layer || e.layer in res.layers || e.layer === '0'), 'every entity is on a layer the result defines');
  ok(res.blocks.length > 0 && res.blocks.length <= 12, 'cabinet blocks: ' + res.blocks.length + ' (identical fronts share one)');
  const inserts = res.sheets.flatMap((s) => s.entities).filter((e) => e.type === 'insert');
  ok(inserts.length > res.blocks.length && inserts.every((e) => res.blocks.some((b) => b.name === e.block)), 'more inserts than blocks, each naming a defined block');
  const dims = res.sheets.flatMap((s) => s.entities).filter((e) => e.type === 'dim');
  ok(dims.length >= 6 && dims.every((d) => d.kind === 'linear' && d.p1 && d.p2 && d.loc && d.st && d.st.scale > 0), 'real linear dimensions with a style scale: ' + dims.length);
  const plan = res.sheets.find((s) => s.id === 'plan');
  const pd = plan.entities.filter((e) => e.type === 'dim');
  ok(pd.some((d) => near(Math.hypot(d.p2.x - d.p1.x, d.p2.y - d.p1.y), 3600, 1)), 'the plan has a dimension of the room width, 3600');
  ok(plan.entities.some((e) => e.type === 'hatch' && e.pattern === 'ANSI31') && plan.entities.some((e) => e.type === 'hatch' && e.solid), 'countertops are hatched (ANSI31), cabinets filled');
  ok(res.sheets.every((s) => s.entities.every((e) => (e.type !== 'line' || (e.x1 >= -1e-6 && e.y1 >= -1e-6)) && (e.type !== 'poly' || e.pts.every((q) => q.x >= -1e-6 && q.y >= -1e-6)))), 'every sheet is moved to its own origin (no negative corner)');
  const sch = res.sheets.find((s) => s.id === 'schedule');
  ok(sch.entities.filter((e) => e.type === 'text').length > 20 && sch.entities.some((e) => e.type === 'line'), 'the schedule is a table (lines and text)');
  const cut = res.sheets.find((s) => s.id === 'cutlist');
  ok(cut.entities.some((e) => e.type === 'text' && /T01|B01/.test(e.s)), 'the cut list table names the pieces');
  const nsh = res.sheets.find((s) => s.id === 'nest');
  ok(nsh.entities.filter((e) => e.type === 'poly').length > a.list.pieces / 2, 'the nest sheet draws the sheets and the placed parts');
  // scaling
  const m = C.scaleSheets(res, 0.001);
  ok(near(m.sheets[0].w, res.sheets[0].w * 0.001, 1e-6) && m.blocks[0].entities.length === res.blocks[0].entities.length, 'scaleSheets: a metre drawing gets the sheets 1000 times smaller');
  const t1 = res.sheets[0].entities.find((e) => e.type === 'text'), t2 = m.sheets[0].entities.find((e) => e.type === 'text');
  ok(near(t2.h, t1.h * 0.001, 1e-4), 'text heights scale with it');
  const d1 = dims[0], d2 = C.scaleEnts([d1], 0.001)[0];
  ok(near(d2.st.scale, d1.st.scale * 0.001, 1e-4) && near(d2.p1.x, d1.p1.x * 0.001, 1e-4), 'a dimension scales its points and its style scale');
  // layout
  const lay = C.layoutSheets(res, { x: 100, y: 200 });
  ok(lay.frames.length === res.sheets.length && lay.frames.every((f, i) => i === 0 || f.x0 !== lay.frames[0].x0 || f.y0 !== lay.frames[0].y0), 'layoutSheets: a frame for every sheet, none on another');
  const ov = lay.frames.some((f, i) => lay.frames.some((g, j) => j > i && f.x0 < g.x1 && g.x0 < f.x1 && f.y0 < g.y1 && g.y0 < f.y1));
  ok(!ov, 'no two frames overlap');
  ok(lay.entities.filter((e) => e.type === 'text' && res.sheets.some((s) => s.title === e.s)).length === res.sheets.length, 'every sheet has its title');
}
section('CAD sheets of the bay kitchen');
{
  const { BAY_JOB } = await import(pathToFileURL(path.join(ROOT, 'tools/addons-test/cabinetcraft-bay-job.mjs')).href).catch(() => ({ BAY_JOB: null }));
  if (BAY_JOB) {
    const a = An.analyze(P.cleanProject(BAY_JOB));
    const res = C.cadSheets(a.build, { list: a.list, t: (k) => k });
    ok(res.sheets.length > 5 && res.sheets.flatMap((s) => s.entities).every((e) => e.type !== 'line' || [e.x1, e.y1, e.x2, e.y2].every(Number.isFinite)), 'slanted and curved walls draw: ' + res.sheets.length + ' sheets, all numbers finite');
  } else ok(true, 'bay job not reachable from this folder (run from the repo)');
}
