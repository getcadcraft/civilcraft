/* SPDX-License-Identifier: Apache-2.0 */
/**
 * host.js — the Weather files add-on's adapter for CivilCraft (copied from tools/weather/src/weather/hosts/civilcraft.js by tools/weather/sync.mjs).
 * 0.11 T24.9. CivilCraft's project has no place in the add-on API yet, so the person types the latitude and longitude (the panel keeps it in this browser);
 * the station figures, the year viewer and the .epw download are the add-on's own and need nothing from the app. No hand-off actions: Heating and cooling
 * loads and the EnergyPlus check are BimCraft's. When CivilCraft offers its site's latitude and longitude, site() reads it here and nothing else changes.
 */
export function makeHost() {
  return {
    id: 'civilcraft',
    async site() { return null; },
    actions: [],
    off() {},
  };
}
