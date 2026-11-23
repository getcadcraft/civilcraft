/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its errors are English (an app translates what it shows). */
/**
 * mesh-worker.js — the module Worker of mesh-stream.js (0.11 PERF.8): cc-ifc's geometry pass (profiles, sweeps, openings and booleans,
 * triangulation) for a whole model, off the page's thread. It gets a copy of the file's bytes and its index (the page keeps its own
 * IfcFile for everything else), meshes every product in the order IfcAPI.StreamAllMeshesAsync does, and posts the pieces back in batches of
 * about `sliceMs` as transferred typed arrays, already placed in the world (the piece's flatTransformation applied: positions, and normals
 * turned and made unit length), so the page only copies them into its draw batches. Nothing here touches a DOM.
 *
 *   → { cmd: 'init', manifoldUrl }                  ← { ready: true, booleans }
 *   → { cmd: 'stream', id, bytes, ix, settings, passes, sliceMs }
 *   ← { id, C }  then  { id, pieces: [{ pass, id, index, total, color: [r,g,b,a], matrix, pos, nrm, idx }] } …  then  { id, done: true, elements }
 *   ← { id, error }                                  → { cmd: 'cancel', id }
 * passes: [null, ['IFCSPACE']] = StreamAllMeshes, then StreamAllMeshesWithTypes(IFCSPACE) (what BimCraft's ifc-model.js asks for).
 */
import { IfcFile } from './model.js';
import { IfcAPI } from './api.js';
import { setManifold } from './geo-bool.js';

let api = null;
const cancelled = new Set();
const now = () => performance.now();
const breathe = () => new Promise((r) => setTimeout(r, 0));   // lets a 'cancel' message in

self.onmessage = async (e) => {
  const m = e.data || {};
  if (m.cmd === 'cancel') { cancelled.add(m.id); return; }
  if (m.cmd === 'init') {
    api = new IfcAPI();
    let booleans = false;
    if (m.manifoldUrl) {
      try {
        const mod = await import(m.manifoldUrl);
        const M = await (mod.default || mod)();
        M.setup?.();
        setManifold(M);
        booleans = true;
      } catch (err) { booleans = false; }
    }
    api.booleans = booleans;
    self.postMessage({ ready: true, booleans });
    return;
  }
  if (m.cmd !== 'stream') return;
  const { id, settings = {}, passes = [null], sliceMs = 8 } = m;
  let mid = -1;
  try {
    const file = new IfcFile(new Uint8Array(m.bytes), m.ix);
    mid = api.AdoptModel(file, settings);
    self.postMessage({ id, C: api.GetCoordinationMatrix(mid) });
    const geo = api.geometry(mid);
    geo.tracking = true;
    let out = [], bufs = [], t0 = now(), elements = 0;
    const flush = async () => {
      if (out.length) self.postMessage({ id, pieces: out }, bufs);
      out = []; bufs = [];
      await breathe();
      t0 = now();
      return !cancelled.has(id);
    };
    for (let p = 0; p < passes.length; p++) {
      const types = passes[p];
      const ids = geo.products(types ? { types, exclude: [] } : {});
      const total = ids.length;
      let i = 0;
      for (const pid of ids) {
        const fm = api.flatMesh(mid, pid);
        const n = fm.geometries.size();
        if (n) {
          const index = i++;
          elements++;
          for (let k = 0; k < n; k++) {
            const pg = fm.geometries.get(k);
            const g = api.GetGeometry(mid, pg.geometryExpressID);
            const verts = g.GetVertexData(), idx = g.GetIndexData();
            const { pos, nrm } = place(verts, pg.flatTransformation);
            const c = pg.color;
            out.push({ pass: p, id: pid, index, total, color: [c.x, c.y, c.z, c.w], pos, nrm, idx });
            bufs.push(pos.buffer, nrm.buffer, idx.buffer);
          }
        }
        geo.sweep();
        if (now() - t0 >= sliceMs && !(await flush())) { self.postMessage({ id, done: true, cancelled: true }); return; }
      }
    }
    await flush();
    self.postMessage({ id, done: true, elements });
  } catch (err) {
    self.postMessage({ id, error: { name: err?.name || 'Error', message: String(err?.message || err) } });
  } finally {
    if (mid >= 0) { try { api.CloseModel(mid); } catch (e2) { /* closed */ } }
    cancelled.delete(id);
  }
};

/**
 * verts (x y z nx ny nz per vertex, file units) placed by the column-major 4x4 m: the same arithmetic, in the same order, as BimCraft's
 * ifc-model.js appendGeometry, so the Float32 values are identical to the ones the page made before (rule 62).
 */
function place(verts, m) {
  const nv = verts.length / 6, pos = new Float32Array(nv * 3), nrm = new Float32Array(nv * 3);
  for (let i = 0, j = 0; i < verts.length; i += 6, j += 3) {
    const x = verts[i], y = verts[i + 1], z = verts[i + 2];
    pos[j] = m[0] * x + m[4] * y + m[8] * z + m[12];
    pos[j + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    pos[j + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
    const nx = verts[i + 3], ny = verts[i + 4], nz = verts[i + 5];
    const tx = m[0] * nx + m[4] * ny + m[8] * nz;
    const ty = m[1] * nx + m[5] * ny + m[9] * nz;
    const tz = m[2] * nx + m[6] * ny + m[10] * nz;
    const l = Math.hypot(tx, ty, tz) || 1;
    nrm[j] = tx / l; nrm[j + 1] = ty / l; nrm[j + 2] = tz / l;
  }
  return { pos, nrm };
}
