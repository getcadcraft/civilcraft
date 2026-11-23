/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and keys. */
/**
 * cnossos.js — the values CNOSSOS-EU fixes, each with where it is written (0.11 XE.3 phase S4, sound-11). Data only; the method is outdoor.js.
 * Sources (refs/acoustics/, SOURCE.md): Commission Directive (EU) 2015/996, OJ L 168, 1.7.2015 ("2015"), Annex II as amended by Commission Delegated Directive
 * (EU) 2021/1226, OJ L 269, 28.7.2021 ("2021"). Only the printed Official Journal is authentic; read it at https://eur-lex.europa.eu/eli/dir/2015/996/oj and
 * https://eur-lex.europa.eu/eli/dir_del/2021/1226/oj. Values are copied from those texts, never typed from memory.
 */
export const SOURCE = {
  method: 'CNOSSOS-EU, Directive (EU) 2015/996 Annex II § 2.5 as amended by Delegated Directive (EU) 2021/1226',
  links: ['https://eur-lex.europa.eu/eli/dir/2015/996/oj', 'https://eur-lex.europa.eu/eli/dir_del/2021/1226/oj'],
};
/** Octave bands, 63 Hz to 8 000 Hz (2015 § 2.5.1, OJ L 168/26). */
export const OCTAVES = [63, 125, 250, 500, 1000, 2000, 4000, 8000];
/** A-weighting correction AWC per band, dB (2021 Annex point (8)(b), the table under eq. 2.5.11, OJ L 269/69). */
export const AWC = [-26.2, -16.1, -8.6, -3.2, 0, 1.2, 1.0, -1.1];
/** Speed of sound for k (eq. 2.5.15, OJ L 168/34) and for λ (2021 point (9)(c), OJ L 269/70): 340 m/s. */
export const C_SOUND = 340;
/** a0 = 2 × 10⁻⁴ m⁻¹, the inverse of the ray's radius of curvature in favourable conditions (eq. 2.5.19, OJ L 168/35). */
export const A0 = 2e-4;
/** Atmospheric absorption is given at 15 °C, 70 % relative humidity, 101 325 Pa (§ 2.5.6 "Atmospheric absorption", OJ L 168/31). */
export const ATM = { T: 15, RH: 70, p: 101.325 };
/** Ground types, Table 2.5.a (OJ L 168/32): flow resistivity in kPa·s/m² and G. */
export const GROUND = {
  A: { name: 'Very soft (snow or moss-like)', sigma: 12.5, G: 1 },
  B: { name: 'Soft forest floor (short, dense heather-like or thick moss)', sigma: 31.5, G: 1 },
  C: { name: 'Uncompacted, loose ground (turf, grass, loose soil)', sigma: 80, G: 1 },
  D: { name: 'Normal uncompacted ground (forest floors, pasture field)', sigma: 200, G: 1 },
  E: { name: 'Compacted field and gravel (compacted lawns, park area)', sigma: 500, G: 0.7 },
  F: { name: 'Compacted dense ground (gravel road, car park)', sigma: 2000, G: 0.3 },
  G: { name: 'Hard surfaces (most normal asphalt, concrete)', sigma: 20000, G: 0 },
  H: { name: 'Very hard and dense surfaces (dense asphalt, concrete, water)', sigma: 200000, G: 0 },
};
/** Ground factor of the source area Gs (text under eq. 2.5.14, OJ L 168/33): road platforms and slab tracks 0, rail tracks on ballast 1; industrial sources: no general answer. */
export const GS = { road: 0, slab: 0, ballast: 1 };
/** Upper bound of Δdif on the Adif term of a horizontal edge, dB (OJ L 168/38). */
export const DIF_CAP = 25;
/** e above which C″ departs from 1, m (eq. 2.5.23 text; 2021 point (9)(d)). */
export const E_MIN = 0.3;
/** Reflectors: slope under 15° from the vertical, at least 0.5 m high and wide (2021 point (9)(j), OJ L 269/73). */
export const REFLECTOR = { maxSlopeDeg: 15, minSize: 0.5 };
/** Reference periods for the working-hours correction, the examples the text gives (eq. 2.4.2 text, OJ L 168/25: "e.g. day is 12 hours, evening is 4 hours, night is 8 hours"). */
export const TREF = { day: 12, evening: 4, night: 8 };
