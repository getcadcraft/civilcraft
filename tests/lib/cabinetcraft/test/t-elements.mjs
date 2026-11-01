/* SPDX-License-Identifier: Apache-2.0 */
// Hosts round (DC.117, cabinetcraft_hosts): the built job as elements for BimCraft / ModelCraft / CadCraft (lib/elements.js): grouping, units, origin, prisms.
const { ok, section, near, mine, ROOT } = globalThis.__ccTest;
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const P = await mine('lib/project.js');
const An = await mine('lib/analyze.js');
const El = await mine('lib/elements.js');
const Core = await mine('lib/core.js');
Core.setT((k) => k);

section('Elements from the built job');
{
  const a = An.analyze(P.sampleProject('mm'));
  const els = El.cabinetElements(a.build);
  const cabs = els.filter((e) => e.kind === 'cabinet');
  ok(cabs.length === a.build.cells.filter((c) => c.kind === 'cab').length, 'one element per cabinet (' + cabs.length + ')');
  ok(els.every((e) => e.pieces.length > 0 && e.pieces.every((p) => p.pts.length >= 3 && p.z1 > p.z0)), 'every element has pieces that are prisms with a height');
  ok(els.some((e) => e.kind === 'counter') && els.some((e) => e.kind === 'endpanel' || e.kind === 'filler'), 'countertops and end panels / fillers are elements too');
  const t1 = cabs.find((e) => e.tag === 'tall'), b1 = cabs.find((e) => e.tag === 'base');
  ok(t1 && near(t1.h, 2100) && near(t1.elev, 0) && b1 && near(b1.d, 560), 'sizes in mm: the tall unit 2100 high, a base cabinet 560 deep');
  const w1 = cabs.find((e) => e.tag === 'wall');
  ok(w1 && w1.elev > 1000 && w1.bbox[2] >= w1.elev - 1, 'a wall cabinet hangs: its elevation and its lowest z agree');
  const shifted = El.cabinetElements(a.build, { origin: [1000, 2000, 50] });
  ok(near(shifted[0].bbox[0] - els[0].bbox[0], 1000) && near(shifted[0].bbox[1] - els[0].bbox[1], 2000) && near(shifted[0].bbox[2] - els[0].bbox[2], 50), 'the origin moves every point (x, y, z)');
  const ccw = els.every((e) => e.pieces.every((p) => p.pts.reduce((s, q, i) => { const r = p.pts[(i + 1) % p.pts.length]; return s + q[0] * r[1] - r[0] * q[1]; }, 0) > 0));
  ok(ccw, 'all footprints run counter-clockwise');
  const inch = El.cabinetElements(An.analyze(P.sampleProject('in')).build);
  ok(inch.length > 0 && near(inch.find((e) => e.tag === 'tall').h, 2100, 80), 'a job in inches comes out in mm (a tall unit about 2100 mm)');
  const m = El.prismMesh([[0, 0], [10, 0], [10, 5], [0, 5]], 0, 3);
  ok(m.positions.length === 24 && m.indices.length === 36, 'prismMesh: 8 points, 12 triangles for a box');
}
section('Elements of the angled bay kitchen');
{
  const { BAY_JOB } = await import(pathToFileURL(path.join(ROOT, 'tools/addons-test/cabinetcraft-bay-job.mjs')).href).catch(() => ({ BAY_JOB: null }));
  if (BAY_JOB) {
    const a = An.analyze(P.cleanProject(BAY_JOB));
    const els = El.cabinetElements(a.build);
    ok(els.length > 10 && els.every((e) => e.pieces.every((p) => p.pts.every((q) => Number.isFinite(q[0]) && Number.isFinite(q[1])))), 'slanted and curved walls: ' + els.length + ' elements, every point finite');
  } else ok(true, 'bay job not reachable from this folder (run from the repo)');
}
