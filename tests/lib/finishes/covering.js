// SPDX-License-Identifier: Apache-2.0
/**
 * covering.js: the finishes of a wall as IfcCovering (0.10 BK.130; session bim-finishes-10). Host-free: a row from schedule.js in, a plain description
 * of the element out; the host writes it. No imports but face.js.
 *
 * One IfcCovering per zone, PredefinedType CLADDING, related to its wall by IfcRelCoversBldgElements (IFC4: IfcRelCoversBldgElements,
 * RelatingBuildingElement + RelatedCoverings; IFC2X3 has the same entity). Source for the entity, the enumeration and the relationship:
 * lib/ifc/schema-ifc4.js (generated from IFC4_ADD2_TC1.exp): IfcCoveringTypeEnum = CEILING, FLOORING, CLADDING, ROOFING, MOLDING, SKIRTINGBOARD,
 * INSULATION, MEMBRANE, SLEEVING, WRAPPING, USERDEFINED, NOTDEFINED. The property sets are ours (CadCraft_WallFinish), plus Pset_CoveringCommon.Reference
 * (every Pset_*Common has a Reference); no other buildingSMART property is written until it is checked against the property-set definitions.
 *
 *   coveringSpec(row, wall, doc) → { guid (stable: the same row always names the same element), name, predefined: 'CLADDING', wall, face, thickness,
 *        frame: { origin: [x, y] (plan, at the face's s = 0), z: [nx, ny, 0] (out of the wall), x: [dx, dy, 0] }, profiles: [[ [x, y]... ]] (one closed rectangle each,
 *        in the frame's X (along the face as the frame sees it) and Y (up), mm), baseZ (the wall's base above its storey), props: [[name, ifc type, value]],
 *        layers: [{ role, material, thickness }], area, volume }
 *   profileX(face, s) → the frame's X for a face coordinate s (the left face is seen from the other side: its X runs against s)
 */
import { faceFrame } from './face.js';

export const profileX = (face, s) => (face === 'left' ? -s : s);
/** A stable 22-character id for this row (GlobalId alphabet), from its own key. FNV-1a, two lanes: not a secret, only the same every time. */
export function stableGuid(key) {
  const A = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';
  let h1 = 0x811c9dc5, h2 = 0x01000193 ^ 0xdeadbeef;
  for (let i = 0; i < key.length; i++) { const c = key.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619) >>> 0; h2 = Math.imul(h2 + c + i, 2246822519) >>> 0; h2 ^= h2 >>> 13; }
  let out = A[(h1 >>> 30) & 1];
  let x = h1, y = h2;
  for (let i = 0; i < 21; i++) { out += A[((i & 1 ? y : x) >>> ((i * 3) % 26)) & 63]; x = Math.imul(x ^ (y >>> 7), 0x9e3779b1) >>> 0; y = Math.imul(y + x, 0x85ebca6b) >>> 0; }
  return out;
}
export function coveringSpec(row, wall, doc) {
  const f = faceFrame({ a: wall.a, b: wall.b, t: wall.t }, row.face);
  const sx = row.face === 'left' ? -1 : 1;
  const profiles = (row.pieces || []).filter((p) => p.s1 - p.s0 > 1e-6 && p.v1 - p.v0 > 1e-6).map((p) => {
    const x0 = profileX(row.face, p.s0), x1 = profileX(row.face, p.s1);
    return [[Math.min(x0, x1), p.v0], [Math.max(x0, x1), p.v0], [Math.max(x0, x1), p.v1], [Math.min(x0, x1), p.v1]];
  });
  const name = (row.typeName || 'Finish') + (row.name ? ' ' + row.name : '');
  return {
    guid: stableGuid('covering:' + row.id), name, predefined: 'CLADDING', wall: row.wall, face: row.face, thickness: row.thickness,
    frame: { origin: f.origin, z: [f.normal[0], f.normal[1], 0], x: [f.dir[0] * sx, f.dir[1] * sx, 0] }, profiles, baseZ: wall.baseZ ?? 0,
    props: [['Type', 'IFCLABEL', row.type], ['Zone', 'IFCIDENTIFIER', row.zone], ['Face', 'IFCLABEL', row.face], ['Kind', 'IFCLABEL', row.finishKind], ['Wall', 'IFCIDENTIFIER', row.wall]],
    layers: row.layers.map((l) => ({ role: l.role, material: l.material, thickness: l.thickness })), area: row.net, volume: row.volume, room: row.room,
  };
}
