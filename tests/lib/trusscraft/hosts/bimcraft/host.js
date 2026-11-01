/* SPDX-License-Identifier: Apache-2.0 */
/**
 * host.js — TrussCraft's adapter for BimCraft (add-on API 1.1+: api.model.read / write). The roofs come from the model (the walls, the app's own roof
 * geometry), the trusses go back as an IfcMember per timber piece in one undo step. A bundled add-on may import the app's modules (lib/roofs.js does).
 */
import { readRoofsFrom } from './lib/roofs.js';
import { placeTrusses } from './lib/place.js';

export function makeHost(api, { t }) {
  const canWrite = !!(api.model && typeof api.model.write === 'function');
  return {
    id: 'bimcraft',
    needsStorey: true,
    roofs: () => (api.model && typeof api.model.read === 'function' ? api.model.read((w) => readRoofsFrom(w)) || [] : []),
    canPlace: canWrite,
    placeKey: 'btn.place',
    async place({ layout, designFor, storey, z0, species }) {
      const r = await api.model.write(t('cmd.place.undo'), (w) => placeTrusses(w, { storey: w.byGuid(storey), trusses: layout.trusses, designFor, z0, species }).length);
      return r.value;
    },
    limits: () => [],
  };
}
