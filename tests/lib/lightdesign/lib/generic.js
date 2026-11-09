/* SPDX-License-Identifier: Apache-2.0 */
/**
 * generic.js — built-in luminaires for trying the add-on without a maker's file (0.9 LD.1). Each is a SYNTHETIC distribution I(γ) = I0 · cos^n γ about the
 * nadir, scaled so the flux over the lower hemisphere equals the lumens (flux = 2π · I0 / (n + 1)). They are typical figures of the kind, not a maker's:
 * load the real .ies or .ldt for a real design. Same shape as parsePhotometry()'s `photo`, so the engine cannot tell them apart.
 */
const SPECS = {
  downlight: { n: 1.6, lumens: 1500, watts: 15, width: 150, length: 150, height: 0, ra: 80 },
  panel: { n: 1.0, lumens: 3600, watts: 36, width: 595, length: 595, height: 0, ra: 80 },
  batten: { n: 1.2, lumens: 4000, watts: 32, width: 70, length: 1200, height: 0, ra: 80 },
  highbay: { n: 3.5, lumens: 15000, watts: 110, width: 350, length: 350, height: 0, ra: 80 },
  floodlight: { n: 9, lumens: 8000, watts: 80, width: 250, length: 300, height: 0, ra: 70 },
};
export const GENERIC_IDS = Object.keys(SPECS);

/** photo for a generic id, or null. Vertical angles 0..90 every 2.5°, nothing above the horizon; one horizontal plane (rotationally symmetric). */
export function genericPhoto(id) {
  const s = SPECS[id];
  if (!s) return null;
  const i0 = s.lumens * (s.n + 1) / (2 * Math.PI);
  const v = [], row = [];
  for (let g = 0; g <= 90; g += 2.5) { v.push(g); row.push(i0 * Math.pow(Math.cos(g * Math.PI / 180), s.n)); }
  return { format: 'generic', name: id, lumens: s.lumens, watts: s.watts, vAngles: v, hAngles: [0, 360], cd: [row.slice(), row.slice()], sym: 'axial', width: s.width, length: s.length, height: s.height, maxCd: i0, keywords: {}, type: 'C', ra: s.ra, generic: id };
}
