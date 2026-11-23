/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and keys. */
/**
 * cnossos-road.js — the values CNOSSOS-EU fixes for road traffic sources (0.11 XE.3 phase S4, sound-11). Data only; the method is road.js.
 * Sources (refs/acoustics/, SOURCE.md): Directive (EU) 2015/996 Annex § 2.2 and Appendix F, OJ L 168, 1.7.2015 ("2015"), as amended by Delegated Directive
 * (EU) 2021/1226, OJ L 269, 28.7.2021 ("2021"): Table F-1 and Table F-4 REPLACED by 2021 point (19) (OJ L 269/96–99); Tables F-2 and F-3 unchanged (2015).
 * Every number copied from those texts, never typed from memory. Octave bands 63 … 8 000 Hz in that order (cnossos.js OCTAVES).
 */
/** Vehicle categories, Table [2.2.a] (OJ L 168/6). Category 5 (open) has no coefficients in Appendix F. */
export const CATEGORIES = {
  1: { name: 'Light motor vehicles', description: 'Passenger cars, delivery vans ≤ 3,5 tons, SUVs, MPVs including trailers and caravans', approval: 'M1 and N1' },
  2: { name: 'Medium heavy vehicles', description: 'Medium heavy vehicles, delivery vans > 3,5 tons, buses, motorhomes, etc. with two axles and twin tyre mounting on rear axle', approval: 'M2, M3 and N2, N3' },
  3: { name: 'Heavy vehicles', description: 'Heavy duty vehicles, touring cars, buses, with three or more axles', approval: 'M2 and N2 with trailer, M3 and N3' },
  '4a': { name: 'Powered two-wheelers: mopeds', description: 'Two-, Three- and Four-wheel Mopeds', approval: 'L1, L2, L6' },
  '4b': { name: 'Powered two-wheelers: motorcycles', description: 'Motorcycles with and without sidecars, Tricycles and Quadricycles', approval: 'L3, L4, L5, L7' },
  5: { name: 'Open category', description: 'To be defined according to future needs', approval: 'N/A' },
};
/** Reference conditions, § 2.2.2 (OJ L 168/8–9): vref 70 km/h (§ 2.2.3), τref 20 °C, flat, dry, no studded tyres, the virtual reference surface. */
export const REF = { vref: 70, tref: 20 };
/** Speeds under 20 km/h take the level of 20 km/h (text under eq. 2.2.2 and 2.2.3, OJ L 168/8). */
export const V_MIN = 20;
/** Point source 0.05 m above the road surface (2021 point (2)(a), OJ L 269/67). */
export const SOURCE_HEIGHT = 0.05;
/** Temperature coefficient Km, dB/°C (text under eq. 2.2.10, OJ L 168/10): 0,08 for category 1, 0,04 for 2 and 3. */
export const K_TEMP = { 1: 0.08, 2: 0.04, 3: 0.04 };

/** Table F-1 as replaced by 2021 point (19)(a) (OJ L 269/96): AR, BR (rolling), AP, BP (propulsion) per octave. */
export const F1 = {
  1: { AR: [83.1, 89.2, 87.7, 93.1, 100.1, 96.7, 86.8, 76.2], BR: [30.0, 41.5, 38.9, 25.7, 32.5, 37.2, 39.0, 40.0],
       AP: [97.9, 92.5, 90.7, 87.2, 84.7, 88.0, 84.4, 77.1], BP: [-1.3, 7.2, 7.7, 8.0, 8.0, 8.0, 8.0, 8.0] },
  2: { AR: [88.7, 93.2, 95.7, 100.9, 101.7, 95.1, 87.8, 83.6], BR: [30.0, 35.8, 32.6, 23.8, 30.1, 36.2, 38.3, 40.1],
       AP: [105.5, 100.2, 100.5, 98.7, 101.0, 97.8, 91.2, 85.0], BP: [-1.9, 4.7, 6.4, 6.5, 6.5, 6.5, 6.5, 6.5] },
  3: { AR: [91.7, 96.2, 98.2, 104.9, 105.1, 98.5, 91.1, 85.6], BR: [30.0, 33.5, 31.3, 25.4, 31.8, 37.1, 38.6, 40.6],
       AP: [108.8, 104.2, 103.5, 102.9, 102.6, 98.5, 93.8, 87.5], BP: [0.0, 3.0, 4.6, 5.0, 5.0, 5.0, 5.0, 5.0] },
  '4a': { AR: [0, 0, 0, 0, 0, 0, 0, 0], BR: [0, 0, 0, 0, 0, 0, 0, 0],
          AP: [93.0, 93.0, 93.5, 95.3, 97.2, 100.4, 95.8, 90.9], BP: [4.2, 7.4, 9.8, 11.6, 15.7, 18.9, 20.3, 20.6] },
  '4b': { AR: [0, 0, 0, 0, 0, 0, 0, 0], BR: [0, 0, 0, 0, 0, 0, 0, 0],
          AP: [99.9, 101.9, 96.7, 94.4, 95.2, 94.7, 92.1, 88.6], BP: [3.2, 5.9, 11.9, 11.6, 11.5, 12.6, 11.1, 12.0] },
};
/** Table F-2 (2015, OJ L 168/125, not amended): studded-tyre coefficients ai, bi, category 1 only. */
export const F2 = { a: [0.0, 0.0, 0.0, 2.6, 2.9, 1.5, 2.3, 9.2], b: [0.0, 0.0, 0.0, -3.1, -6.4, -14.0, -22.4, -11.4] };
/** Table F-3 (2015, OJ L 168/125, not amended): CR, CP per category for k = 1 crossing with traffic lights, k = 2 roundabout. */
export const F3 = {
  1: { crossing: { CR: -4.5, CP: 5.5 }, roundabout: { CR: -4.4, CP: 3.1 } },
  2: { crossing: { CR: -4, CP: 9 }, roundabout: { CR: -2.3, CP: 6.7 } },
  3: { crossing: { CR: -4, CP: 9 }, roundabout: { CR: -2.3, CP: 6.7 } },
  '4a': { crossing: { CR: 0, CP: 0 }, roundabout: { CR: 0, CP: 0 } },
  '4b': { crossing: { CR: 0, CP: 0 }, roundabout: { CR: 0, CP: 0 } },
};
const Z = [0, 0, 0, 0, 0, 0, 0, 0];
const S = (name, vmin, vmax, c1, b1, c2, b2, c3, b3) => ({ name, vmin, vmax, alpha: { 1: c1, 2: c2, 3: c3, '4a': Z, '4b': Z }, beta: { 1: b1, 2: b2, 3: b3, '4a': 0, '4b': 0 } });
/** Table F-4 as replaced by 2021 point (19)(b) (OJ L 269/97–99): αi,m per octave and βm, with the speed range each surface is valid for (km/h). Rows 4a/4b are 0. */
export const F4 = {
  reference: S('Reference road surface', null, null, Z, 0, Z, 0, Z, 0),
  'zoab-1': S('1-layer ZOAB', 50, 130,
    [0.0, 5.4, 4.3, 4.2, -1.0, -3.2, -2.6, 0.8], -6.5, [7.9, 4.3, 5.3, -0.4, -5.2, -4.6, -3.0, -1.4], 0.2, [9.3, 5.0, 5.5, -0.4, -5.2, -4.6, -3.0, -1.4], 0.2),
  'zoab-2': S('2-layer ZOAB', 50, 130,
    [1.6, 4.0, 0.3, -3.0, -4.0, -6.2, -4.8, -2.0], -3.0, [7.3, 2.0, -0.3, -5.2, -6.1, -6.0, -4.4, -3.5], 4.7, [8.3, 2.2, -0.4, -5.2, -6.2, -6.1, -4.5, -3.5], 4.7),
  'zoab-2-fine': S('2-layer ZOAB (fine)', 80, 130,
    [-1.0, 3.0, -1.5, -5.3, -6.3, -8.5, -5.3, -2.4], -0.1, [7.9, 0.1, -1.9, -5.9, -6.1, -6.8, -4.9, -3.8], -0.8, [9.4, 0.2, -1.9, -5.9, -6.1, -6.7, -4.8, -3.8], -0.9),
  'sma-nl5': S('SMA-NL5', 40, 80, [10.3, -0.9, 0.9, 1.8, -1.8, -2.7, -2.0, -1.3], -1.6, Z, 0, Z, 0),
  'sma-nl8': S('SMA-NL8', 40, 80, [6.0, 0.3, 0.3, 0.0, -0.6, -1.2, -0.7, -0.7], -1.4, Z, 0, Z, 0),
  'brushed-concrete': S('Brushed down concrete', 70, 120,
    [8.2, -0.4, 2.8, 2.7, 2.5, 0.8, -0.3, -0.1], 1.4, [0.3, 4.5, 2.5, -0.2, -0.1, -0.5, -0.9, -0.8], 5.0, [0.2, 5.3, 2.5, -0.2, -0.1, -0.6, -1.0, -0.9], 5.5),
  'brushed-concrete-optimised': S('Optimised brushed down concrete', 70, 80,
    [-0.2, -0.7, 1.4, 1.2, 1.1, -1.6, -2.0, -1.8], 1.0, [-0.7, 3.0, -2.0, -1.4, -1.8, -2.7, -2.0, -1.9], -6.6, [-0.5, 4.2, -1.9, -1.3, -1.7, -2.5, -1.8, -1.8], -6.6),
  'broomed-concrete': S('Fine broomed concrete', 70, 120,
    [8.0, -0.7, 4.8, 2.2, 1.2, 2.6, 1.5, -0.6], 7.6, [0.2, 8.6, 7.1, 3.2, 3.6, 3.1, 0.7, 0.1], 3.2, [0.1, 9.8, 7.4, 3.2, 3.1, 2.4, 0.4, 0.0], 2.0),
  'worked-surface': S('Worked surface', 50, 130,
    [8.3, 2.3, 5.1, 4.8, 4.1, 0.1, -1.0, -0.8], -0.3, [0.1, 6.3, 5.8, 1.8, -0.6, -2.0, -1.8, -1.6], 1.7, [0.0, 7.4, 6.2, 1.8, -0.7, -2.1, -1.9, -1.7], 1.4),
  'hard-elements-herringbone': S('Hard elements in herring-bone', 30, 60,
    [27.0, 16.2, 14.7, 6.1, 3.0, -1.0, 1.2, 4.5], 2.5, [29.5, 20.0, 17.6, 8.0, 6.2, -1.0, 3.1, 5.2], 2.5, [29.4, 21.2, 18.2, 8.4, 5.6, -1.0, 3.0, 5.8], 2.5),
  'hard-elements': S('Hard elements not in herring-bone', 30, 60,
    [31.4, 19.7, 16.8, 8.4, 7.2, 3.3, 7.8, 9.1], 2.9, [34.0, 23.6, 19.8, 10.5, 11.7, 8.2, 12.2, 10.0], 2.9, [33.8, 24.7, 20.4, 10.9, 10.9, 6.8, 12.0, 10.8], 2.9),
  'quiet-hard-elements': S('Quiet hard elements', 30, 60,
    [26.8, 13.7, 11.9, 3.9, -1.8, -5.8, -2.7, 0.2], -1.7, [9.2, 5.7, 4.8, 2.3, 4.4, 5.1, 5.4, 0.9], 0.0, [9.1, 6.6, 5.2, 2.6, 3.9, 3.9, 5.2, 1.1], 0.0),
  'thin-layer-a': S('Thin layer A', 40, 130,
    [10.4, 0.7, -0.6, -1.2, -3.0, -4.8, -3.4, -1.4], -2.9, [13.8, 5.4, 3.9, -0.4, -1.8, -2.1, -0.7, -0.2], 0.5, [14.1, 6.1, 4.1, -0.4, -1.8, -2.1, -0.7, -0.2], 0.3),
  'thin-layer-b': S('Thin layer B', 40, 130,
    [6.8, -1.2, -1.2, -0.3, -4.9, -7.0, -4.8, -3.2], -1.8, [13.8, 5.4, 3.9, -0.4, -1.8, -2.1, -0.7, -0.2], 0.5, [14.1, 6.1, 4.1, -0.4, -1.8, -2.1, -0.7, -0.2], 0.3),
};
