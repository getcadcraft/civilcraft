/* SPDX-License-Identifier: Apache-2.0 */
/**
 * mesh-codec.js — the default mesh codec for a host that has none of its own (0.8 CE.12). DOM-free.
 * A Generated feature keeps its body as { nv, nt, v: base64 float32 xyz, i: base64 uint32 triangles }, little-endian: the same bytes as
 * the first host's mesh importer, so a body moves between hosts untouched. Hosts that already have a codec hand in their own (the contract's
 * `mesh`); this one is for a host that builds on Engineer alone. A generator's body is a dual-contouring surface (indexed, manifold), so
 * `repairMesh` does not weld or fill: it reports what the surface is (closed or not) and leaves the triangles alone.
 *
 *   codec(topology) → { repairMesh, encodeMesh, decodeMesh, readReport, MAX_TRIS }     topology = the field kernel's meshTopology
 */
export const MAX_TRIS = 3000000;
const bad = () => { const e = new Error('mesh.err.kept_bad'); e.code = 'mesh.err.kept_bad'; return e; };   // the key the first host's reader uses
const toB64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const fromB64 = (s) => { const b = atob(s), u8 = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u8[i] = b.charCodeAt(i); return u8; };
const le = (typed) => { const u8 = new Uint8Array(typed.buffer, typed.byteOffset, typed.byteLength); if (new Uint8Array(new Uint16Array([1]).buffer)[0] === 1) return u8; const o = new Uint8Array(u8.length); for (let i = 0; i < u8.length; i += 4) { o[i] = u8[i + 3]; o[i + 1] = u8[i + 2]; o[i + 2] = u8[i + 1]; o[i + 3] = u8[i]; } return o; };
const REPORT_KEYS = ['vertices', 'triangles', 'welded', 'degenerate', 'duplicates', 'gapsClosed', 'holesFilled', 'holesLeft', 'openEdges', 'nonManifold', 'flipped', 'shells'];

export function encodeMesh({ positions, indices }) {
  return { nv: positions.length / 3, nt: indices.length / 3, v: toB64(le(Float32Array.from(positions))), i: toB64(le(Uint32Array.from(indices))) };
}
/** The mesh a file keeps, checked (untrusted): counts against the data, every index in range, every number finite. */
export function decodeMesh(m) {
  if (!m || typeof m !== 'object' || !Number.isInteger(m.nv) || !Number.isInteger(m.nt) || m.nv < 3 || m.nt < 1 || m.nt > MAX_TRIS || m.nv > 3 * MAX_TRIS) throw bad();
  if (typeof m.v !== 'string' || typeof m.i !== 'string' || m.v.length !== 4 * Math.ceil(m.nv * 12 / 3) || m.i.length !== 4 * Math.ceil(m.nt * 12 / 3)) throw bad();
  let vb, ib;
  try { vb = fromB64(m.v); ib = fromB64(m.i); } catch { throw bad(); }
  if (vb.length !== m.nv * 12 || ib.length !== m.nt * 12) throw bad();
  const dv = new DataView(vb.buffer), di = new DataView(ib.buffer);
  const positions = new Float32Array(m.nv * 3), indices = new Uint32Array(m.nt * 3);
  for (let k = 0; k < positions.length; k++) { const x = dv.getFloat32(k * 4, true); if (!Number.isFinite(x)) throw bad(); positions[k] = x; }
  for (let k = 0; k < indices.length; k++) { const x = di.getUint32(k * 4, true); if (x >= m.nv) throw bad(); indices[k] = x; }
  return { positions, indices };
}
export function readReport(r) {
  if (!r || typeof r !== 'object') return null;
  const out = {};
  for (const k of REPORT_KEYS) { const v = r[k]; out[k] = Number.isInteger(v) && v >= 0 && v <= 1e9 ? v : 0; }
  out.closed = r.closed === true;
  return out;
}
/** @param meshTopology the field kernel's meshTopology({ positions, indices }) */
export function codec(meshTopology) {
  const repairMesh = ({ positions, indices }) => {
    const top = meshTopology({ positions, indices });
    return { positions, indices, report: { vertices: positions.length / 3, triangles: indices.length / 3, openEdges: top.boundaryEdges || 0, nonManifold: top.nonManifoldEdges || 0, shells: top.components || 0, closed: !!(top.closed && top.vertexManifold) } };
  };
  return { repairMesh, encodeMesh, decodeMesh, readReport, MAX_TRIS };
}
