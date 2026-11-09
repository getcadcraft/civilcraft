/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bim.js — floor slabs and shear walls as plate elements in lib/fem (0.9 SU.1056 library side). DOM-free. The apps read their slabs and walls
 * into the plain shapes lib/frame/plate-bim.js takes; this file meshes them, joins them to the frame's beams and columns and hands the
 * whole model to lib/fem (static and modal). The Analysis panels' wiring is not here: it is listed for mounts-09 in the session log.
 * An analysis aid, not a code check; your engineer reviews the results.
 *
 *   slabsAndWalls(raw, { slabs, walls }, { fc, size }) → { frame, fem, warnings, skipped, quality }
 *       raw = a raw lib/frame model (nodes, materials, sections, members, supports, cases) before cleanFrame; slabs/walls as plate-bim.js
 *   fromFrame(frame) → { model, ids, warnings }      a cleaned lib/frame model (members + plates) as a lib/fem model
 *   frameLoads(frame, ids, caseId) → loads           node loads, plate area loads and self weight of one load case
 * Carried over from lib/frame: members (E, G, A, Iy, Iz, J, roll), plates (t, E, ν = E/2G − 1), supports (held dofs, springs), cases.
 * Carried (0.9, mounts): member end releases (static condensation) and rigid floors (in-plane diaphragms).
 * Not carried, said in `warnings`: member loads (udl/point: 'member-loads'), load combinations (solve the cases, add the results).
 */
import { addPlates } from '../frame/plate-bim.js';
import { cleanFrame } from '../frame/frame-model.js';
import { G_ACC } from '../frame/frame-model.js';

export function fromFrame(frame) {
  const warnings = [], ids = new Map(frame.nodes.map((n, k) => [n.id, k]));
  const mats = new Map(frame.materials.map((m) => [m.id, m])), secs = new Map(frame.sections.map((s) => [s.id, s]));
  const nodes = frame.nodes.map((n) => [n.x, n.y, n.z]);
  const beams = [], shells = [], fix = [], springs = [];
  for (const m of frame.members) {
    const s = secs.get(m.section), mt = mats.get(m.material);
    const rel = m.rel && (m.rel.i.some(Boolean) || m.rel.j.some(Boolean)) ? { i: m.rel.i.map(Boolean), j: m.rel.j.map(Boolean) } : null;     // 0.9: released ends are carried (condensed in model.js)
    beams.push({ i: ids.get(m.i), j: ids.get(m.j), E: mt.E, G: mt.G, A: s.A, Iy: s.Iy, Iz: s.Iz, J: s.J, rho: mt.rho || 0, roll: m.roll || 0, id: m.id, ...(rel ? { rel } : {}) });
  }
  for (const p of frame.plates || []) {
    const mt = mats.get(p.material);
    shells.push({ n: p.nodes.map((q) => ids.get(q)), E: mt.E, nu: mt.E / (2 * mt.G) - 1, t: p.t, rho: mt.rho || 0, bending: 'mitc4', id: p.id });
  }
  const diaphragms = (frame.diaphragms || []).map((d) => ({ id: d.id, nodes: d.nodes.map((n) => ids.get(n)).filter((n) => n !== undefined) }));
  for (const s of frame.supports) {
    const dofs = []; s.fix.forEach((f, d) => { if (f) dofs.push(d); });
    if (dofs.length) fix.push({ node: ids.get(s.node), dofs });
    if (s.k) s.k.forEach((k, d) => { if (k > 0 && !s.fix[d]) springs.push({ node: ids.get(s.node), dof: d, k }); });
  }
  return { model: { nodes, beams, shells, fix, springs, ...(diaphragms.length ? { diaphragms } : {}) }, ids, warnings };
}

export function frameLoads(frame, ids, caseId) {
  const c = frame.cases.find((q) => q.id === caseId), loads = { nodal: [], area: [] }, warnings = [];
  if (!c) return { loads, warnings: [{ code: 'no-case', id: caseId }] };
  const plateIndex = new Map((frame.plates || []).map((p, k) => [p.id, k]));
  for (const l of c.loads) {
    if (l.type === 'node') loads.nodal.push({ node: ids.get(l.node), F: l.F });
    else if (l.type === 'area') {
      const k = plateIndex.get(l.plate);
      if (k === undefined) continue;
      loads.area.push({ shell: k, dir: l.dir, p: l.p });
    } else warnings.push({ code: 'member-loads' });
  }
  if (c.selfWeight) loads.gravity = [0, 0, -G_ACC * c.selfWeight];
  return { loads, warnings };
}

/** Area loads of lib/frame ('X' 'Y' 'Z' or the plate's own normal 'n') become global force-per-area vectors. */
export function resolveAreaLoads(fem, loads, shellAxes) {
  const out = { ...loads, area: [] };
  for (const l of loads.area || []) {
    if (l.q) { out.area.push(l); continue; }
    let q;
    if (l.dir === 'n') { const ax = shellAxes(fem.shells[l.shell].n.map((n) => fem.nodes[n])); q = ax.ez.map((v) => v * l.p); }
    else q = [l.dir === 'X' ? l.p : 0, l.dir === 'Y' ? l.p : 0, l.dir === 'Z' ? l.p : 0];
    out.area.push({ shell: l.shell, q });
  }
  return out;
}

export function slabsAndWalls(raw, elements, opts = {}) {
  const made = addPlates(raw, elements, opts);
  const frame = cleanFrame(raw).model;
  const conv = fromFrame(frame);
  return { frame, fem: conv.model, ids: conv.ids, warnings: conv.warnings, skipped: made.skipped, quality: made.quality };
}
