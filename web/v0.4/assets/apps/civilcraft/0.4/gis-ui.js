/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-ui.js — installs CivilCraft's GIS parts (docs/GIS-SPEC.md §0). civilcraft.js imports this on first use and calls
 * install(host); each part registers what it adds through host.reg (scene, underlay, status, commands, openers,
 * extents, onProject, hasWork). One line per part, each part owned by one builder; a part that is not built yet is
 * simply not listed. Order matters only for openers: the first whose accepts() says yes opens the files.
 */

import { loadCatalog } from './crs.js';

const PARTS = [
  // builder C: coordinate system dialog + lat/long status (gis-crs-ui.js), map layers (gis-map-ui.js)
  () => import('./gis-crs-ui.js'),   // first: reg.pickCrs exists before the other parts install
  // builder A: GIS vector files in and out (gis-vector-ui.js)
  () => import('./gis-vector-ui.js'),
  // builder B: elevation grids and LiDAR (gis-terrain-ui.js)
  () => import('./gis-terrain-ui.js'),
  // 0.4 V1 (session civil): DWG / DXF as linework (gis-cad-ui.js); its opener goes first (unshift)
  () => import('./gis-cad-ui.js'),
  () => import('./gis-map-ui.js'),   // builder C, last: its opener takes pictures (+ world file) after builder B's has looked at a .tif
];

export async function install(host) {
  await loadCatalog();
  for (const load of PARTS) {
    const m = await load();
    await m.install(host);
  }
  host.refresh();
}
