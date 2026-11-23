/* SPDX-License-Identifier: Apache-2.0 */
/**
 * site3d-bodies.js: site3d.js's 0 bindings for this topic, moved out of buildSite3D() unchanged (0.11 PERF.78 one builder per feature family, perf-finish-11 r2 civil-detail; same scene).
 * buildBodies3D(ctx) is called once by buildSite3D(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables buildSite3D() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { roadMesh, wallMesh } from './site3d-landscape.js';
import { t } from './i18n.js';
import { RAIL_COLORS, railMesh, ballastMesh } from './site3d-rail.js';
import { fixed } from './units.js';
import { solarMesh } from './site3d-solar.js';
import { pitMesh, pitLines, PIT_COLORS } from './site3d-pit.js';

export function buildBodies3D(ctx) {
  const { show, exag, C, notes, L, scene, label, input, meshBuilder } = ctx;

  // 0.7.1 71.19: the road body of every corridor (lanes, shoulders, gutters, curbs, strips, walks) over the graded surface it
  // shaped, and the Landscape workspace's hardscape. `onGround`: drawn just in front of the ground and picked only when in front
  if (show.roads && input.corridors?.length) {
    const rb = meshBuilder();
    if (roadMesh(rb, input.corridors, L, exag, C)) scene.meshes.push({ key: 'road', name: t('s3.roads'), onGround: true, ...rb.done() });
  }
  for (const c of input.corridors || []) for (const w of c.warnings || []) notes.push(t('s3.warning', { name: c.name, text: w.text }));   // 0.7.1 71.19
  if (show.walls && input.walls?.length) {   // 0.7.1 71.22
    const wb = meshBuilder();
    if (wallMesh(wb, input.walls, L, C)) scene.meshes.push({ key: 'walls', name: t('s3.walls'), onGround: true, ...wb.done() });
  }
  if (show.track && input.turnouts?.length) {   // CV.1 2026-11-12: turnouts' diverging rails, as lines
    const pos = [];
    for (const l of input.turnouts) for (let i = 1; i < l.pts.length; i++) { const a = l.pts[i - 1], b = l.pts[i]; pos.push(...L(a.x, a.y, a.z), ...L(b.x, b.y, b.z)); }
    if (pos.length) scene.lines.push({ key: 'turnouts', name: t('s3.turnouts'), color: C.rail || RAIL_COLORS.rail, positions: new Float32Array(pos) });
  }
  if (show.track && input.tracks?.length) {   // 0.7.1 71.26: rails and the ballast bed (sleepers are instances, below)
    const rb = meshBuilder(), bb = meshBuilder();
    if (railMesh(rb, input.tracks, L, C)) scene.meshes.push({ key: 'rails', name: t('s3.rails'), ...rb.done() });
    if (ballastMesh(bb, input.tracks, L, C)) scene.meshes.push({ key: 'ballast', name: t('s3.ballast'), onGround: true, ...bb.done() });
  }
  if (show.spots && input.spots?.length) {   // 0.8 SU.914 rest: each spot's level change on the designed surface, the deepest cut and fill marked
    for (const sp of input.spots) {
      const txt = sp.kind === 'level' ? '0' : (sp.dz > 0 ? '+' : '−') + fixed(Math.abs(sp.dz), Math.abs(sp.dz) < 10 ? 2 : 1);
      label('spot', sp.extreme ? txt + ' ◆' : txt, sp.x, sp.y, sp.zd, sp.kind === 'cut' ? C.problem : sp.kind === 'fill' ? C.pad : C.alignment);
    }
  }
  if (show.solar && input.solar?.length) {   // 0.8 EG.15
    const sb = meshBuilder(), gAt = input.fg || input.eg ? (x, y) => { const z = (input.fg || input.eg).elevationAt(x, y, 1e-6); return Number.isFinite(z) ? z : null; } : null;
    if (solarMesh(sb, input.solar, L, gAt)) scene.meshes.push({ key: 'solar', name: t('solar.title'), ...sb.done() });
  }
  if (show.pit && input.pits?.length) {   // 0.8 EG.27: haul ramps as ribbons, bench rims as lines
    const pb = meshBuilder();
    if (pitMesh(pb, input.pits, L)) scene.meshes.push({ key: 'pit-ramp', name: t('geo.pit.show3d'), ...pb.done() });
    const rim = pitLines(input.pits, L);
    if (rim.length) scene.lines.push({ key: 'pit-bench', name: t('geo.pit.benchlines'), color: PIT_COLORS.bench, positions: rim });
  }
}
