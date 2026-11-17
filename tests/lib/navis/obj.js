// SPDX-License-Identifier: Apache-2.0
/**
 * obj.js — read a Wavefront OBJ for its groups: triangles and a bounding box per `o`/`g` name, and the whole. Metres, as written. DOM-free.
 *   scanObj(bytes, { max }) → { groups: Map<name, { triangles, min[3], max[3] }>, triangles, min, max, vertices, bad }
 * The numbers are read, not trusted: a face that points outside the vertex list is counted in `bad` and skipped.
 */
export function scanObj(bytes, { max = 1024 * 1024 * 1024 } = {}) {
  if (bytes.length > max) throw Object.assign(new Error('navis.obj.toolarge'), { code: 'toolarge' });
  const txt = new TextDecoder().decode(bytes); const V = []; const groups = new Map(); let cur = null, tris = 0, bad = 0;
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  const grp = n => { let g = groups.get(n); if (!g) groups.set(n, g = { triangles: 0, min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }); return g; };
  for (const line of txt.split('\n')) {
    const c = line.charCodeAt(0);
    if (c === 118 && line.charCodeAt(1) === 32) { const p = line.split(' '); const x = +p[1], y = +p[2], z = +p[3]; V.push(Number.isFinite(x + y + z) ? [x, y, z] : null); }
    else if (c === 111 || c === 103) { const n = line.slice(2).trim(); cur = n ? grp(n) : null; }
    else if (c === 102 && line.charCodeAt(1) === 32) {
      const ix = line.slice(2).trim().split(/\s+/).map(t => parseInt(t, 10)).map(i => (i < 0 ? V.length + i : i - 1));
      if (ix.length < 3 || ix.some(i => !V[i])) { bad++; continue; }
      const g = cur || grp('(none)'); const n = ix.length - 2; g.triangles += n; tris += n;
      for (const i of ix) for (let k = 0; k < 3; k++) { const v = V[i][k]; if (v < g.min[k]) g.min[k] = v; if (v > g.max[k]) g.max[k] = v; if (v < lo[k]) lo[k] = v; if (v > hi[k]) hi[k] = v; }
    }
  }
  return { groups, triangles: tris, min: tris ? lo : null, max: tris ? hi : null, vertices: V.length, bad };
}
