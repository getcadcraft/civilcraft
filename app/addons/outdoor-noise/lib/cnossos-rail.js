/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and keys. */
/**
 * cnossos-rail.js — the railway source data of CNOSSOS-EU (0.11 XE.3 phase S4, sound-11, rail fork). Data only; the method is rail.js.
 * Sources (refs/acoustics/SOURCE.md): Directive (EU) 2015/996 Annex II § 2.3 and Appendix G ("2015", OJ L 168, 1.7.2015) as amended by Delegated Directive
 * (EU) 2021/1226 point (20) ("2021", OJ L 269, 28.7.2021). Every value copied from those pages; the 2021 replacements are used where they exist.
 * Only the printed Official Journal is authentic: https://eur-lex.europa.eu/eli/dir/2015/996/oj · https://eur-lex.europa.eu/eli/dir_del/2021/1226/oj
 */

/** One-third-octave bands of the transfer and source tables, 50 Hz – 10 kHz (Table G-3 to G-7; 2021 corrects 316/3 160/6 350 Hz to 315/3 150/6 300 Hz). */
export const THIRDS = [50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000];

/** Wavelengths of the roughness, contact-filter and impact tables as amended in 2021 (Table G-1 second table, G-2, G-4; OJ L 269/99–103), mm. */
export const WAVELENGTHS_MM = [2000, 1600, 1250, 1000, 800, 630, 500, 400, 315, 250, 200, 160, 125, 100, 80, 63, 50, 40, 31.5, 25, 20, 16, 12.5, 10, 8, 6.3, 5, 4, 3.15, 2.5, 2, 1.6, 1.25, 1, 0.8];

/**
 * Rail roughness Lr,TR,i, dB re 1 µm (2021 point (20)(a), Table G-1 second table, OJ L 269/99–100). Keys are the Table 2.3.b railhead codes; only E and M have data.
 */
export const RAIL_ROUGHNESS = {
  E: { name: 'EN ISO 3095:2013 (well maintained and very smooth)', L: [17.1, 17.1, 17.1, 17.1, 17.1, 17.1, 17.1, 17.1, 15.0, 13.0, 11.0, 9.0, 7.0, 4.9, 2.9, 0.9, -1.1, -3.2, -5.0, -5.6, -6.2, -6.8, -7.4, -8.0, -8.6, -9.2, -9.8, -10.4, -11.0, -11.6, -12.2, -12.8, -13.4, -14.0, -14.0] },
  M: { name: 'Average network (normally maintained smooth)', L: [35.0, 31.0, 28.0, 25.0, 23.0, 20.0, 17.0, 13.5, 10.5, 9.0, 6.5, 5.5, 5.0, 3.5, 2.0, 0.1, -0.2, -0.3, -0.8, -3.0, -5.0, -7.0, -8.0, -9.0, -10.0, -12.0, -13.0, -14.0, -15.0, -16.0, -17.0, -18.0, -19.0, -19.0, -19.0] },
};

/**
 * Wheel roughness Lr,VEH,i by brake type, dB re 1 µm (2015 Table G-1 first table, OJ L 168/129–130, not amended). The table starts at 1 000 mm; its rows
 * printed 120, 12, 3,2 and 1,2 mm are the 125, 12,5, 3,15 and 1,25 mm bands of the 2021 tables.
 */
export const WHEEL_WAVELENGTHS_MM = [1000, 800, 630, 500, 400, 315, 250, 200, 160, 125, 100, 80, 63, 50, 40, 31.5, 25, 20, 16, 12.5, 10, 8, 6.3, 5, 4, 3.15, 2.5, 2, 1.6, 1.25, 1, 0.8];
export const WHEEL_ROUGHNESS = {
  'cast-iron': { name: 'Cast iron tread brake', L: [2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.4, 0.6, 2.6, 5.8, 8.8, 11.1, 11.0, 9.8, 7.5, 5.1, 3.0, 1.3, 0.2, -0.7, -1.2, -1.0, 0.3, 0.2, 1.3, 3.1, 3.1, 3.1, 3.1, 3.1] },
  composite: { name: 'Composite brake', L: [-4.0, -4.0, -4.0, -4.0, -4.0, -4.0, -4.0, -4.0, -4.0, -4.0, -4.0, -4.3, -4.6, -4.9, -5.2, -6.3, -6.8, -7.2, -7.3, -7.3, -7.1, -6.9, -6.7, -6.0, -3.7, -2.4, -2.6, -2.5, -2.5, -2.5, -2.5, -2.5] },
  disc: { name: 'Disk brake', L: [-5.9, -5.9, -5.9, -5.9, -5.9, -5.9, 2.3, 2.8, 2.6, 1.2, 2.1, 0.9, -0.3, -1.6, -2.9, -4.9, -7.0, -8.6, -9.3, -9.5, -10.1, -10.3, -10.3, -10.8, -10.9, -9.5, -9.5, -9.5, -9.5, -9.5, -9.5, -9.5] },
};

/** Contact filter A3,i, dB (2021 point (20)(b), Table G-2, OJ L 269/100–101), by wheel load and wheel diameter. */
export const CONTACT_FILTER = {
  'w50-d360': { name: 'Wheel load 50 kN, wheel diameter 360 mm', A: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.1, -0.2, -0.3, -0.6, -1.0, -1.8, -3.2, -5.4, -8.7, -12.2, -16.7, -17.7, -17.8, -20.7, -22.1, -22.8, -24.0, -24.5, -24.7, -27.0, -27.8] },
  'w50-d680': { name: 'Wheel load 50 kN, wheel diameter 680 mm', A: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.1, -0.2, -0.3, -0.7, -1.2, -2.0, -4.1, -6.0, -9.2, -13.8, -17.2, -17.7, -18.6, -21.5, -22.3, -23.1, -24.4, -24.5, -25.0, -28.0, -28.8, -29.6] },
  'w50-d920': { name: 'Wheel load 50 kN, wheel diameter 920 mm', A: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.1, -0.1, -0.3, -0.6, -1.1, -1.3, -3.5, -5.3, -8.0, -12.0, -16.8, -17.7, -18.0, -21.5, -21.8, -22.8, -24.0, -24.5, -25.0, -27.3, -28.1, -28.9, -29.7] },
  'w25-d920': { name: 'Wheel load 25 kN, wheel diameter 920 mm', A: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.1, -0.3, -0.5, -1.1, -1.8, -3.3, -5.3, -7.9, -12.8, -16.8, -17.7, -18.2, -20.5, -22.0, -22.8, -24.2, -24.5, -25.0, -27.4, -28.2, -29.0] },
  'w100-d920': { name: 'Wheel load 100 kN, wheel diameter 920 mm', A: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.1, -0.2, -0.3, -0.6, -1.0, -1.8, -3.2, -5.4, -8.7, -12.2, -16.7, -17.7, -17.8, -20.7, -22.1, -22.8, -24.0, -24.5, -24.7, -27.0, -27.8, -28.6, -29.4, -30.2] },
};

/** Track transfer function LH,TR,i, dB per axle (2021 point (20)(c), Table G-3 first table, OJ L 269/101–102); keys = track base / rail pad codes. */
export const TRACK_TRANSFER = {
  MS: { name: 'Mono-block sleeper on soft rail pad', L: [53.3, 59.3, 67.2, 75.9, 79.2, 81.8, 84.2, 88.6, 91.0, 94.5, 97.0, 99.2, 104.0, 107.1, 108.3, 108.5, 109.7, 110.0, 110.0, 110.0, 110.3, 110.0, 110.1, 110.6] },
  MM: { name: 'Mono-block sleeper on medium stiffness rail pad', L: [50.9, 57.8, 66.5, 76.8, 80.9, 83.3, 85.8, 90.0, 91.6, 93.9, 95.6, 97.4, 101.7, 104.4, 106.0, 106.8, 108.3, 108.9, 109.1, 109.4, 109.9, 109.9, 110.3, 111.0] },
  MH: { name: 'Mono-block on hard rail pad', L: [50.1, 57.2, 66.3, 77.2, 81.6, 84.0, 86.5, 90.7, 92.1, 94.3, 95.8, 97.0, 100.3, 102.5, 104.2, 105.4, 107.1, 107.9, 108.2, 108.7, 109.4, 109.7, 110.4, 111.4] },
  BS: { name: 'Bi-block sleeper on soft rail pad', L: [50.9, 56.6, 64.3, 72.3, 75.4, 78.5, 81.8, 86.6, 89.1, 91.9, 94.5, 97.5, 104.0, 107.9, 108.9, 108.8, 109.8, 110.2, 110.1, 110.1, 110.3, 109.9, 110.0, 110.4] },
  BM: { name: 'Bi-block sleeper on medium stiffness rail pad', L: [50.0, 56.1, 64.1, 72.5, 75.8, 79.1, 83.6, 88.7, 89.6, 89.7, 90.6, 93.8, 100.6, 104.7, 106.3, 107.1, 108.8, 109.3, 109.4, 109.7, 110.0, 109.8, 110.0, 110.5] },
  BH: { name: 'Bi-block sleeper on hard rail pad', L: [49.8, 55.9, 64.0, 72.5, 75.9, 79.4, 84.4, 89.7, 90.2, 90.2, 90.8, 93.1, 97.9, 101.1, 103.4, 105.4, 107.7, 108.5, 108.7, 109.1, 109.6, 109.6, 109.9, 110.6] },
  W: { name: 'Wooden sleepers', L: [44.0, 51.0, 59.9, 70.8, 75.1, 76.9, 77.2, 80.9, 85.3, 92.5, 97.0, 98.7, 102.8, 105.4, 106.5, 106.4, 107.5, 108.1, 108.4, 108.7, 109.1, 109.1, 109.5, 110.2] },
  D: { name: 'Direct fastening on bridges', L: [75.4, 77.4, 81.4, 87.1, 88.0, 89.7, 83.4, 87.7, 89.8, 97.5, 99.0, 100.8, 104.9, 111.8, 113.9, 115.5, 114.9, 118.2, 118.3, 118.4, 118.9, 117.5, 117.9, 118.6] },
};

/** Vehicle (wheel) transfer function LH,VEH,i, dB per axle (2015 Table G-3, OJ L 168/134–135; 2021 point (20)(d) corrects the band labels only), by wheel diameter, no measure. */
export const WHEEL_TRANSFER = {
  d920: { name: 'Wheel diameter 920 mm, no measure', L: [75.4, 77.3, 81.1, 84.1, 83.3, 84.3, 86.0, 90.1, 89.8, 89.0, 88.8, 90.4, 92.4, 94.9, 100.4, 104.6, 109.6, 114.9, 115.0, 115.0, 115.5, 115.6, 116.0, 116.7] },
  d840: { name: 'Wheel diameter 840 mm, no measure', L: [75.4, 77.3, 81.1, 84.1, 82.8, 83.3, 84.1, 86.9, 87.9, 89.9, 90.9, 91.5, 91.5, 93.0, 98.7, 101.6, 107.6, 111.9, 114.5, 114.5, 115.0, 115.1, 115.5, 116.2] },
  d680: { name: 'Wheel diameter 680 mm, no measure', L: [75.4, 77.3, 81.1, 84.1, 82.8, 83.3, 83.9, 86.3, 88.0, 92.2, 93.9, 92.5, 90.9, 90.4, 93.2, 93.5, 99.6, 104.9, 108.0, 111.0, 111.5, 111.6, 112.0, 112.7] },
  d1200: { name: 'Wheel diameter 1 200 mm, no measure', L: [75.4, 77.3, 81.1, 84.1, 82.8, 83.3, 84.5, 90.4, 90.4, 89.9, 90.1, 91.3, 91.5, 93.6, 100.5, 104.6, 115.6, 115.9, 116.0, 116.0, 116.5, 116.6, 117.0, 117.7] },
};
/** Superstructure transfer function LH,VEH,SUP,i, "EU standard" column, dB per axle (2015 Table G-3, OJ L 168/135–136): 0,0 in every band. Freight wagons (type a) only (§ 2.3.2). */
export const SUPER_TRANSFER = { name: 'EU standard', L: THIRDS.map(() => 0.0) };

/** Impact roughness LR,IMPACT,i for a single switch/joint/crossing per 100 m, dB (2021 point (20)(e), Table G-4, OJ L 269/102–103). */
export const IMPACT = [22.0, 22.0, 22.0, 22.0, 22.0, 20.0, 16.0, 15.0, 14.0, 15.0, 14.0, 12.0, 11.0, 10.0, 9.0, 8.0, 6.0, 3.0, 2.0, -3.0, -8.0, -13.0, -17.0, -19.0, -22.0, -25.0, -26.0, -32.0, -35.0, -40.0, -43.0, -45.0, -47.0, -49.0, -50.0];
/** Joint density the impact table is given for, m⁻¹ (eq. 2.3.12 text, OJ L 168/21): one joint per 100 m; also the default for jointed track. */
export const NL_DEFAULT = 0.01;

/**
 * Traction noise LW,0,idling per vehicle, source A (0.5 m) and B (4.0 m), dB (2015 Table G-5, OJ L 168/137–138). 2021 point (20)(f) corrects the band labels
 * and replaces the 6 300 Hz row's misprinted 31,4 / 30,7 by 81,4 / 80,7 (the diesel locomotive c. 2 200 kW, the only columns with those values).
 * § 2.3.2: the modelled strength is the maximum-load one, LW,0,const,i = LW,0,idling,i.
 */
export const TRACTION = {
  'diesel-800': { name: 'Diesel locomotive (c. 800 kW)',
    A: [98.9, 94.8, 92.6, 94.6, 92.8, 92.8, 93.0, 94.8, 94.6, 95.7, 95.6, 98.6, 95.2, 95.1, 95.1, 94.1, 94.1, 99.4, 92.5, 89.5, 87.0, 84.1, 81.5, 79.2],
    B: [103.2, 100.0, 95.5, 94.0, 93.3, 93.6, 92.9, 92.7, 92.4, 92.8, 92.8, 96.8, 92.7, 93.0, 92.9, 93.1, 93.2, 98.3, 91.5, 88.7, 86.0, 83.4, 80.9, 78.7] },
  'diesel-2200': { name: 'Diesel locomotive (c. 2 200 kW)',
    A: [99.4, 107.3, 103.1, 102.1, 99.3, 99.3, 99.5, 101.3, 101.1, 102.2, 102.1, 101.1, 101.7, 101.6, 99.3, 96.0, 93.7, 101.9, 89.5, 87.1, 90.5, 81.4, 81.2, 79.6],
    B: [103.7, 112.5, 106.0, 101.5, 99.8, 100.1, 99.4, 99.2, 98.9, 99.3, 99.3, 99.3, 99.2, 99.5, 97.1, 95.0, 92.8, 100.8, 88.5, 86.3, 89.5, 80.7, 80.6, 79.1] },
  dmu: { name: 'Diesel multiple unit',
    A: [82.6, 82.5, 89.3, 90.3, 93.5, 99.5, 98.7, 95.5, 90.3, 91.4, 91.3, 90.3, 90.9, 91.8, 92.8, 92.8, 90.8, 88.1, 85.2, 83.2, 81.7, 78.8, 76.2, 73.9],
    B: [86.9, 87.7, 92.2, 89.7, 94.0, 100.3, 98.6, 93.4, 88.1, 88.5, 88.5, 88.5, 88.4, 89.7, 90.6, 91.8, 89.9, 87.0, 84.2, 82.4, 80.7, 78.1, 75.6, 73.4] },
  electric: { name: 'Electric locomotive',
    A: [87.9, 90.8, 91.6, 94.6, 94.8, 96.8, 104.0, 100.8, 99.6, 101.7, 98.6, 95.6, 95.2, 96.1, 92.1, 89.1, 87.1, 85.4, 83.5, 81.5, 80.0, 78.1, 76.5, 75.2],
    B: [92.2, 96.0, 94.5, 94.0, 95.3, 97.6, 103.9, 98.7, 97.4, 98.8, 95.8, 93.8, 92.7, 94.0, 89.9, 88.1, 86.2, 84.3, 82.5, 80.7, 79.0, 77.4, 75.9, 74.7] },
  emu: { name: 'Electric multiple unit',
    A: [80.5, 81.4, 80.5, 82.2, 80.0, 79.7, 79.6, 96.4, 80.5, 81.3, 97.2, 79.5, 79.8, 86.7, 81.7, 82.7, 80.7, 78.0, 75.1, 72.1, 69.6, 66.7, 64.1, 61.8],
    B: [84.8, 86.6, 83.4, 81.6, 80.5, 80.5, 79.5, 94.3, 78.3, 78.4, 94.4, 77.7, 77.3, 84.6, 79.5, 81.7, 79.8, 76.9, 74.1, 71.3, 68.6, 66.0, 63.5, 61.3] },
};

/**
 * Aerodynamic noise at v0 = 300 km/h per vehicle (for a vehicle length of 20 m), dB, with α1 = α2 = 50 (2015 Table G-6, OJ L 168/138–139; 2021 point (20)(g)
 * corrects the band labels). eq. 2.3.13–2.3.14 with v0 fixed at 300 km/h (OJ L 168/22).
 */
export const AERO = { v0: 300, alpha1: 50, alpha2: 50,
  L1: [112.6, 113.2, 115.7, 117.4, 115.3, 115.0, 114.9, 116.4, 115.9, 116.3, 116.2, 115.2, 115.8, 115.7, 115.7, 114.7, 114.7, 115.0, 114.5, 113.1, 112.1, 110.6, 109.6, 108.8],
  L2: [36.7, 38.5, 39.0, 37.5, 36.8, 37.1, 36.4, 36.2, 35.9, 36.3, 36.3, 36.3, 36.2, 36.5, 36.4, 105.2, 110.3, 110.4, 105.6, 37.2, 37.5, 37.9, 38.4, 39.2] };

/** Bridge transfer function LH,bridge,i, dB per axle (2021 point (20)(h), Table G-7 as replaced, OJ L 269/104); eq. 2.3.18 as replaced by 2021 point (5). */
export const BRIDGE_TRANSFER = {
  '+10': { name: 'Bridge type +10 dB(A)', L: [85.2, 87.1, 91.0, 94.0, 94.4, 96.0, 92.5, 96.7, 97.4, 99.4, 100.7, 102.5, 107.1, 109.8, 112.0, 107.2, 106.8, 107.3, 99.3, 91.4, 86.9, 79.7, 75.1, 70.8] },
  '+15': { name: 'Bridge type +15 dB(A)', L: [90.1, 92.1, 96.0, 99.5, 99.9, 101.5, 99.6, 103.8, 104.5, 106.5, 107.8, 109.6, 116.1, 118.8, 120.9, 109.5, 109.1, 109.6, 102.0, 94.1, 89.6, 83.6, 79.0, 74.7] },
};

/** Vehicle types, Table 2.3.a digit 1 (OJ L 168/13). */
export const VEHICLE_TYPES = { h: 'High speed vehicle (> 200 km/h)', m: 'Self-propelled passenger coaches', p: 'Hauled passenger coaches', c: 'City tram or light metro', d: 'Diesel loco', e: 'Electric loco', a: 'Any generic freight vehicle', o: 'Other (maintenance vehicles etc.)' };
/** Source heights above the rail plane, m (§ 2.3.1, OJ L 168/15): A = 0.5 m, B = 4.0 m. */
export const HEIGHTS = { A: 0.5, B: 4.0 };
/** Minimum speed for the roughness and sound power, km/h (OJ L 168/20): 50 km/h, 30 km/h for trams and light metro. Not for the flow (eq. 2.3.2). */
export const V_MIN = { train: 50, tram: 30 };
/** Curve squeal excess added to the rolling noise in every band, dB (2021 point (4)(b), OJ L 269/67–68). */
export const SQUEAL = { train: { curve500: 5, curve300: 8, turnout300: 8, minLength: 50 }, tram: { r200: 5 } };
