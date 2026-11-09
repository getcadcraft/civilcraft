/* SPDX-License-Identifier: Apache-2.0 */
/**
 * comfort.js — pedestrian-wind comfort classes, as a READING of a speed series, not a certificate (0.9 SU.1119 wind; DOM-free, Apache-2.0).
 *
 * Lawson (London Docklands Development Corporation, as widely published): the activity whose threshold speed is exceeded no more than 5 % of the hours.
 * The thresholds below are the commonly printed ones and are data, so a person can change them; check them against the version of the criteria your authority uses.
 * NEN 8100 (Netherlands): the grade (A-E) comes from the share of hours the hourly mean wind speed at pedestrian height exceeds 5 m/s: A < 2.5 %, B 2.5-5, C 5-10, D 10-20, E > 20.
 * The activity table for NEN 8100 differs by year of the standard; this module reports the grade and the share only.
 *
 *   LAWSON = [{ id, label, limit }]   limit in m/s, exceeded for at most `LAWSON_SHARE` of the hours
 *   lawsonClass(shareOver) → index into LAWSON.concat(uncomfortable): shareOver is a function (limit) → fraction of hours above it
 *   lawsonFromSeries(speeds (m/s, one per hour), gust = 1) → { index, id, over: {limit: share} }
 *   nenGrade(speeds) → { grade: 'A'..'E', share }
 */
export const LAWSON_SHARE = 0.05;
export const LAWSON = [
  { id: 'sitting', label: 'Sitting', limit: 4 },
  { id: 'standing', label: 'Standing', limit: 6 },
  { id: 'strolling', label: 'Strolling', limit: 8 },
  { id: 'walking', label: 'Walking', limit: 10 },
];
export const UNCOMFORTABLE = { id: 'uncomfortable', label: 'Uncomfortable' };
export const NEN_LIMIT = 5;

export function lawsonFromSeries(speeds, gust = 1, table = LAWSON) {
  const n = speeds.length || 1, over = {};
  let index = table.length;
  for (let k = 0; k < table.length; k++) {
    let c = 0; for (let i = 0; i < speeds.length; i++) if (speeds[i] * gust > table[k].limit) c++;
    over[table[k].limit] = c / n;
    if (index === table.length && c / n <= LAWSON_SHARE) index = k;
  }
  return { index, id: (table[index] || UNCOMFORTABLE).id, over };
}
export function nenGrade(speeds) {
  let c = 0; for (let i = 0; i < speeds.length; i++) if (speeds[i] > NEN_LIMIT) c++;
  const share = c / (speeds.length || 1);
  return { grade: share < 0.025 ? 'A' : share < 0.05 ? 'B' : share < 0.1 ? 'C' : share < 0.2 ? 'D' : 'E', share };
}
