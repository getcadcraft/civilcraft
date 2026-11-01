/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hosts/part.js — the PartCraft adapter of CabinetCraft (copied to partcraft/dev/addons/cabinetcraft/host.js by tools/cabinetcraft/sync.mjs).
 * PartCraft is the host that can do the most with the job: the cabinets as display bodies in the 3D viewport (`api.model.addBodies`, add-on API 1.1; main.js
 * wires that itself, with the buttons in Drawings) and G-code for each nested sheet through PartCraft's own cam-sheets.js. So this adapter only says who it is.
 * detect(api, { t }) → the host descriptor, or null when the api is not PartCraft's (no `api.part`).
 */
export function detect(api) {
  if (!api || !api.part || typeof api.part.get !== 'function') return null;
  return { id: 'part', gcode: true };
}
