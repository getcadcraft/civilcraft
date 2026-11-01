/* SPDX-License-Identifier: Apache-2.0 */
/**
 * place.js — write the trusses into the open BimCraft model (add-on API 1.1 `api.model.write`). Each member is an IfcMember (IFC4: CHORD, STRUT or
 * POST; IFC2x3: plain IfcMember) as a closed sawn-section solid, contained in the storey, with the property set CadCraft_Truss (truss, mark, role,
 * size, species, timber section, the "indicative" flag). Points are the storey's plan mm. The fn that calls this must be repeatable (Redo runs it again).
 *   boxMesh(a, b, depth, thick, planeDir) → { positions, indices } relative to a, closed, outward faces
 *   memberSegments(layoutTruss, g, z0) → [{ mark, role, a: [x,y,z], b: [x,y,z], size }]
 *   placeTrusses(w, { storey, trusses, designFor, z0, species }) → [{ id, guid, mark }]
 */
import { sizeById } from './tables.js';
import { boxMesh, memberSegments } from './bodies.js';

export { boxMesh, memberSegments } from './bodies.js';

const PREDEF = { top: 'CHORD', tail: 'CHORD', bottom: 'CHORD', web: 'STRUT', post: 'POST', stub: 'POST' };

export function placeTrusses(w, { storey, trusses, designFor, z0 = 0, species = '' }) {
  const stLine = w.api.GetLine(w.mid, storey, false), made = [];
  for (const t of trusses) {
    const d = designFor(t.span, t);
    if (!d) continue;
    for (const s of memberSegments(t, d.g, z0, d.sizes)) {
      const size = sizeById(s.size) || sizeById('2x4'), mesh = boxMesh(s.a, s.b, size.d, size.b, s.dir);
      const lp = w.placeAt(stLine.ObjectPlacement.value, s.a[0], s.a[1], s.a[2], 0), g = w.gid(), name = w.L(t.id + ' ' + s.mark);
      const id = w.v4 ? w.make('IFCMEMBER', g, w.ownerHistory(), name, null, w.L('Truss member'), w.H(lp), null, null, PREDEF[s.role] || 'MEMBER')
        : w.make('IFCMEMBER', g, w.ownerHistory(), name, null, w.L('Truss member'), w.H(lp), null, null);
      w.noteGuid(g, id);
      const body = w.bodyItems({ type: 'mesh', positions: mesh.positions, indices: mesh.indices });
      w.setShape(id, [w.rep('body', 'Body', body.type, body.items)]);
      w.contain(id, storey);
      w.upsertPset(id, 'CadCraft_Truss', [['Truss', 'IFCLABEL', t.id], ['Mark', 'IFCLABEL', s.mark], ['Role', 'IFCLABEL', s.role], ['Section', 'IFCLABEL', size.id + ' (' + size.b + ' x ' + size.d + ' mm)'], ['Species', 'IFCLABEL', String(species)], ['Status', 'IFCLABEL', 'Indicative - not engineered truss design']]);
      made.push({ id, guid: g, mark: t.id + ' ' + s.mark });
    }
  }
  return made;
}
