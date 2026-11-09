/* SPDX-License-Identifier: GPL-3.0-or-later */
/**
 * geom.js — buildings as a closed triangle surface (ASCII STL) for OpenFOAM's snappyHexMesh (wind-openfoam add-on).
 *   triangulate(pts) → [[i,j,k]...]   ear clipping of a simple polygon (any winding; result indices into pts, counter-clockwise)
 *   prismTriangles(pts, zBottom, zTop) → [[a,b,c]...] with a,b,c = [x,y,z]; outward normals; closed
 *   stl(name, solids) → ASCII STL text for solids = [{ pts, zBottom, zTop }]; every solid becomes its own closed shell in one named surface
 */
const area2 = (p) => { let a = 0; for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j].x * p[i].y - p[i].x * p[j].y); return a; };

export function triangulate(pts) {
  const n = pts.length; if (n < 3) return [];
  const idx = pts.map((_, i) => i); if (area2(pts) < 0) idx.reverse();
  const cross = (a, b, c) => (pts[b].x - pts[a].x) * (pts[c].y - pts[a].y) - (pts[b].y - pts[a].y) * (pts[c].x - pts[a].x);
  const inTri = (p, a, b, c) => cross(a, b, p) >= -1e-12 && cross(b, c, p) >= -1e-12 && cross(c, a, p) >= -1e-12;   // p, a, b, c are indices
  const out = []; let guard = 0;
  while (idx.length > 3 && guard++ < 10000) {
    let cut = false;
    for (let k = 0; k < idx.length; k++) {
      const a = idx[(k + idx.length - 1) % idx.length], b = idx[k], c = idx[(k + 1) % idx.length];
      if (cross(a, b, c) <= 1e-12) continue;                                   // reflex or flat
      let ear = true;
      for (const q of idx) { if (q === a || q === b || q === c) continue; if (inTri(q, a, b, c)) { ear = false; break; } }
      if (!ear) continue;
      out.push([a, b, c]); idx.splice(k, 1); cut = true; break;
    }
    if (!cut) { out.push([idx[0], idx[1], idx[2]]); idx.splice(1, 1); }        // degenerate input: do not loop forever
  }
  if (idx.length === 3) out.push([idx[0], idx[1], idx[2]]);
  return out;
}

export function prismTriangles(pts0, zBottom, zTop) {
  const pts = area2(pts0) < 0 ? pts0.slice().reverse() : pts0.slice();            // counter-clockwise seen from above
  const tris = [], n = pts.length, P = (i, z) => [pts[i].x, pts[i].y, z];
  for (const [a, b, c] of triangulate(pts)) { tris.push([P(a, zTop), P(b, zTop), P(c, zTop)]); tris.push([P(a, zBottom), P(c, zBottom), P(b, zBottom)]); }
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; tris.push([P(i, zBottom), P(j, zBottom), P(j, zTop)]); tris.push([P(i, zBottom), P(j, zTop), P(i, zTop)]); }
  return tris;
}

export function stl(name, solids) {
  const lines = ['solid ' + name];
  for (const s of solids) for (const t of prismTriangles(s.pts, s.zBottom, s.zTop)) {
    const u = [t[1][0] - t[0][0], t[1][1] - t[0][1], t[1][2] - t[0][2]], v = [t[2][0] - t[0][0], t[2][1] - t[0][1], t[2][2] - t[0][2]];
    let nx = u[1] * v[2] - u[2] * v[1], ny = u[2] * v[0] - u[0] * v[2], nz = u[0] * v[1] - u[1] * v[0]; const l = Math.hypot(nx, ny, nz) || 1;
    lines.push(`facet normal ${nx / l} ${ny / l} ${nz / l}`, ' outer loop', ...t.map((p) => `  vertex ${p[0]} ${p[1]} ${p[2]}`), ' endloop', 'endfacet');
  }
  lines.push('endsolid ' + name);
  return lines.join('\n') + '\n';
}
