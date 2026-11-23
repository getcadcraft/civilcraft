/* SPDX-License-Identifier: Apache-2.0 */
/**
 * site3d-objects.js: site3d.js's 0 bindings for this topic, moved out of buildSite3D() unchanged (0.11 PERF.78 one builder per feature family, perf-finish-11 r2 civil-detail; same scene).
 * buildObjects3D(ctx) is called once by buildSite3D(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables buildSite3D() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { t } from './i18n.js';
import { DIA_UNIT } from './pipes.js';
import { structGeom } from './structs.js';
import { massMesh, centroid as massCentroid, massHeight } from './massing.js';
import { surfaceSection } from './sections.js';
import { plantInstances, MAX_PLANTS_3D } from './site3d-landscape.js';
import { sleeperInstances } from './site3d-rail.js';

export function buildObjects3D(ctx) {
  const { show, exag, C, units, notes, origin, L, scene, label, input, rgb, meshBuilder, cylinder, box, MAX_GIS_SEGMENTS } = ctx;

  // 0.7.1 71.24: reference elements from an opened IFC (project coordinates, flat-shaded, one grey; not picked: no owners)
  if (input.ifcRefs?.length) {
    const pos = [], nor = [], col = [], idx = [], c = rgb(C.ifcRef);
    for (const r of input.ifcRefs) {
      const P = r.positions, I = r.indices;
      for (let i = 0; i < I.length; i += 3) {
        const a = L(P[I[i] * 3], P[I[i] * 3 + 1], P[I[i] * 3 + 2]), b = L(P[I[i + 1] * 3], P[I[i + 1] * 3 + 1], P[I[i + 1] * 3 + 2]), d = L(P[I[i + 2] * 3], P[I[i + 2] * 3 + 1], P[I[i + 2] * 3 + 2]);
        const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
        let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
        const k = pos.length / 3;
        for (const q of [a, b, d]) { pos.push(q[0], q[1], q[2]); nor.push(nx, ny, nz); col.push(c[0], c[1], c[2]); }
        idx.push(k, k + 1, k + 2);
      }
    }
    if (idx.length) { scene.meshes.push({ key: 'ifc-refs', name: t('s3.ifcrefs'), positions: new Float32Array(pos), normals: new Float32Array(nor), colors: new Float32Array(col), indices: new Uint32Array(idx) }); scene.counts.triangles += idx.length / 3; }
  }

  // pipe network
  if (show.pipes && input.network) {
    const net = input.network, chk = input.check;
    const per = DIA_UNIT[units].perUnit;
    const bad = new Set((chk?.problems || []).map((p) => p.id).filter(Boolean));
    const byId = new Map(net.structures.map((s) => [s.id, s]));
    const pipeB = meshBuilder(), strB = meshBuilder();
    let noInv = 0, noRim = 0;
    for (const p of net.pipes) {
      const a = byId.get(p.from), b = byId.get(p.to);
      if (!a || !b) continue;
      if (!Number.isFinite(p.invUp) || !Number.isFinite(p.invDn)) { noInv++; continue; }
      const D = (Number(p.dia) || 0) / per;
      if (!(D > 0)) continue;
      const r = D / 2;
      pipeB.owner({ kind: 'pipe', id: p.id, name: p.name });
      cylinder(pipeB, [a.x, a.y, p.invUp + r], [b.x, b.y, p.invDn + r], r, 16, false, L, exag, rgb(bad.has(p.id) ? C.problem : C.pipe));
      scene.counts.pipes++;
    }
    for (const s of net.structures) {
      const info = chk?.structs?.get(s.id);
      const rim = info?.rim ?? (Number.isFinite(s.rim) ? s.rim : null);
      if (!Number.isFinite(rim)) { noRim++; continue; }
      let bottom = info?.sump;
      if (!Number.isFinite(bottom)) bottom = rim - (units === 'm' ? 1.5 : 5);
      const g = structGeom(s, net, units);   // 0.6 WL.27: a type gives the outside size; a rectangular one is a box
      const r = g.type ? g.outW / 2 : (Number(s.dia) || 0) / per / 2;
      if (!(r > 0) || bottom >= rim) continue;
      strB.owner({ kind: 'structure', id: s.id, name: s.name });
      label('structure', s.name, s.x, s.y, rim, C.structure);
      if (g.type && g.shape === 'rect') {
        const out = net.pipes.find((p) => p.from === s.id), to = out && byId.get(out.to), ang = to ? Math.atan2(to.y - s.y, to.x - s.x) : 0;
        box(strB, s.x, s.y, ang, g.outL / 2, g.outW / 2, bottom, rim, L, exag, rgb(bad.has(s.id) ? C.problem : C.structure));
      } else cylinder(strB, [s.x, s.y, bottom], [s.x, s.y, rim], r, 24, true, L, exag, rgb(bad.has(s.id) ? C.problem : C.structure));
      scene.counts.structures++;
    }
    if (noInv) notes.push(t('s3.noinv', { n: noInv }));
    if (noRim) notes.push(t('s3.norim', { n: noRim }));
    if (pipeB.count()) scene.meshes.push({ key: 'pipes', name: t('scene.layer.pipe'), ...pipeB.done() });
    if (strB.count()) scene.meshes.push({ key: 'structures', name: t('scene.layer.strc'), ...strB.done() });
  }

  // 0.7 LC.1 M2: building masses — a prism per mass (walls from the lowest ground under it, roof), a line round every floor, the
  // name over the roof. Picking and the highlight go through the owners like pipes, so a mass is found in front of the ground.
  scene.roofs = [];
  if (show.masses && input.masses?.length) {
    const mb = meshBuilder(), lb = [], lo = [], so = [];
    const col = rgb(C.mass);
    for (const ms of input.masses) {
      const m = ms.mass, mesh = massMesh(m, ms.z0, ms.zBottom), P = mesh.positions;
      mb.owner({ kind: 'mass', id: ms.id, name: ms.name });
      const base = mb.pos.length / 3;
      for (let i = 0; i < P.length; i += 3) {
        const q = L(P[i], P[i + 1], P[i + 2]), n = mesh.normals.slice(i, i + 3);
        const nz = n[2] / exag, nl = Math.hypot(n[0], n[1], nz) || 1;
        mb.vert(q, [n[0] / nl, n[1] / nl, nz / nl], col);
      }
      for (let i = 0; i < mesh.indices.length; i += 3) mb.tri(base + mesh.indices[i], base + mesh.indices[i + 1], base + mesh.indices[i + 2]);
      const owner = lo.push({ kind: 'mass', id: ms.id, name: ms.name }) - 1;
      for (let k = 0; k <= m.floors; k++) {
        const z = ms.z0 + k * m.floorHeight;
        for (let i = 0; i < m.pts.length; i++) {
          const a = m.pts[i], b = m.pts[(i + 1) % m.pts.length];
          lb.push(...L(a.x, a.y, z), ...L(b.x, b.y, z)); so.push(owner);
        }
      }
      const c = massCentroid(m.pts);
      label('mass', ms.name, c.x, c.y, ms.z0 + massHeight(m), C.massLine);
      scene.roofs.push({ id: ms.id, z: ms.z0 + massHeight(m), z0: ms.z0, floorHeight: m.floorHeight, floors: m.floors });
      scene.counts.masses = (scene.counts.masses || 0) + 1;
    }
    scene.meshes.push({ key: 'masses', name: t('scene.layer.mass'), ...mb.done() });
    scene.lines.push({ key: 'mass-floors', name: t('ms.floors.lines'), color: C.massLine, positions: new Float32Array(lb), owners: lo, segOwner: Uint32Array.from(so) });
  }

  // 0.4 V4: GIS layers — lines and outlines at their own z when every vertex has one, else draped on the existing ground
  // (exact: a vertex wherever a segment crosses a triangle edge); points as small crosses
  if (show.gis && input.gis?.length) {
    let budget = MAX_GIS_SEGMENTS, cut = false, flatOff = 0;
    const eg = input.eg;
    const sb = eg ? eg.bounds : null, cross = sb ? Math.max(sb.maxX - sb.minX, sb.maxY - sb.minY) / 300 : 1;
    for (const l of input.gis) {
      const seg = [];
      const add = (a, b) => { if (budget <= 0) { cut = true; return; } budget--; seg.push(...L(a[0], a[1], a[2]), ...L(b[0], b[1], b[2])); };
      const part = (pts) => {
        if (pts.length < 2 || cut) return;
        if (pts.every((q) => q.length > 2 && Number.isFinite(q[2]))) { for (let i = 1; i < pts.length; i++) add(pts[i - 1], pts[i]); return; }
        if (!eg) { flatOff++; return; }
        for (let i = 1; i < pts.length && !cut; i++) {
          const a = { x: pts[i - 1][0], y: pts[i - 1][1] }, b = { x: pts[i][0], y: pts[i][1] }, len = Math.hypot(b.x - a.x, b.y - a.y);
          for (const run of surfaceSection(eg, a, b, 0, len)) for (let k = 1; k < run.length; k++) {
            const p0 = run[k - 1], p1 = run[k], f0 = len ? p0.o / len : 0, f1 = len ? p1.o / len : 0;
            add([a.x + (b.x - a.x) * f0, a.y + (b.y - a.y) * f0, p0.z], [a.x + (b.x - a.x) * f1, a.y + (b.y - a.y) * f1, p1.z]);
          }
        }
      };
      for (const f of l.features) {
        const g = f?.g;
        if (!g) continue;
        if (g.t === 'ln') for (const q of g.c) part(q);
        else if (g.t === 'pg') for (const poly of g.c) for (const r of poly) part(r);
        else if (g.t === 'pt') {
          const [x, y] = g.c, z = g.c.length > 2 && Number.isFinite(g.c[2]) ? g.c[2] : eg?.elevationAt(x, y, 1e-6);
          if (z === null || z === undefined) { flatOff++; continue; }
          add([x - cross, y, z], [x + cross, y, z]); add([x, y - cross, z], [x, y + cross, z]);
        }
        if (cut) break;
      }
      if (seg.length) scene.lines.push({ key: 'gis-' + l.id, name: l.name, color: C['gis:' + l.color] || C['gis:blue'], positions: new Float32Array(seg) });
      if (cut) break;
    }
    if (cut) notes.push(t('v3d.gis.cut', { n: MAX_GIS_SEGMENTS.toLocaleString('en-US') }));
    if (flatOff) notes.push(t('v3d.gis.off', { n: flatOff }));
  }

  // 0.7.1 71.19: plants — simple forms by type and size from the plant list, one instanced set per shape (thousands of plants
  // stay a few draw calls); exports write them out as meshes (site3d-landscape.js expandInstances)
  scene.instances = [];
  if (show.plants && input.landscape?.plants?.length) {
    const r = plantInstances(input.landscape.plants, L, exag, C, { groundZ: origin.z });
    scene.instances = r.sets;
    scene.counts.plants = r.count;
    if (r.cut) notes.push(t('s3.plants.cut', { n: MAX_PLANTS_3D.toLocaleString('en-US') }));
  }
  if (show.track && input.tracks?.length) {   // 0.7.1 71.26: one box per sleeper, turned with the track and tilted with the cant
    const sl = sleeperInstances(input.tracks, L, C, { name: t('s3.sleepers') });
    if (sl) { scene.instances.push(sl); scene.counts.sleepers = sl.count; }
  }
  if (show.plants && input.landscape?.unknown) notes.push(t('s3.plants.unknown', { n: input.landscape.unknown }));
}
