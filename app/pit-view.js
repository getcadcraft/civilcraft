/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — data only. */
/**
 * pit-view.js — what the 3D view needs of the saved pits (0.8 EG.27, civil_PART_4): the ground with every pit set to "cut into the ground" dug out of it, and for each
 * pit shown in 3D its haul ramp and bench rims in project units. Remembered per pit and ground (the block model's maximum-closure run is not cheap).
 *   pitScene(project) → { ground: Surface | null (null = no pit is cut), pits: [{ id, name, road, benches }], notes: [{ code, item }] }
 */
import { runPit, pitLoops, toM } from './geo-run.js';
import { pitGround } from './pit-surface.js';

export function pitScene(project) {
  const geo = project.state.geo, list = (geo?.pits || []).filter((p) => p.show3d !== 'no');
  if (!list.length) return { ground: null, pits: [], notes: [] };
  const units = project.state.units === 'm' ? 'm' : 'ft', k = toM(units), eg = project.eg().surface;
  const key = project.surfaceDeps() + '|' + units + '|' + JSON.stringify(list);
  return project.memo('pit3d', key, () => {
    let ground = eg, cutAny = false; const pits = [], notes = [];
    for (const p of list) {
      const r = runPit(p, units);
      pits.push({ id: p.id, name: p.name, road: r.road && r.road.pts.length ? { pts: r.road.pts.map((q) => [q[0] / k, q[1] / k, q[2] / k]), width: p.rampWidth } : null,
        benches: pitLoops(r).map((b) => ({ z: b.z / k, loops: b.loops.filter((l) => l.area > 0).map((l) => l.pts.map((q) => [q[0] / k, q[1] / k])) })) });
      for (const pr of r.problems) notes.push(pr);
      if (p.cut === 'yes' && ground) {
        const g = pitGround(ground, p, units, r);
        if (g) { ground = g.surface; cutAny = true; if (g.belowTop) notes.push({ code: 'pit.top.belowground', item: p.name || p.id }); }
        else notes.push({ code: 'pit.cut.failed', item: p.name || p.id });
      }
    }
    return { ground: cutAny ? ground : null, pits, notes };
  });
}
