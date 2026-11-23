/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — no words. */
/**
 * project-rows.js — the survey point rows of a project file, read the way Project.fromJSON reads them (0.11 PERF.33, perf-finish-11).
 * No imports, no DOM: the open Worker (open-async.js) runs this very file, so the Worker and the page cannot read a row differently.
 *
 *   cleanText(v, n = 200)          the file's text values as fromJSON keeps them (control characters → space, at most n)
 *   pointColumns(rows, max)        the rows fromJSON keeps (the first `max`; a row needs an array with finite x and y) as columns:
 *                                  { count, total, x, y, z (Float64Array; z NaN = no elevation), names, descs (cleaned, '\u0000'-joined),
 *                                    blk: [index, raw, …] (raw block references, cleaned on the page by cleanBlk) }
 *   pointRow(r)                    one row → { n, x, y, z, d } | null (without blk), what fromJSON makes of it
 *   writeRow(r, w)                 one row into a point-table.js BlockWriter when pointColumns would keep it (0.11, the streamed open)
 */
export const cleanText = (v, n = 200) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, n);
const fin = (v) => typeof v === 'number' && Number.isFinite(v);

export function pointRow(r) {
  if (!Array.isArray(r) || !fin(r[1]) || !fin(r[2])) return null;
  return { n: cleanText(r[0], 40), x: r[1], y: r[2], z: fin(r[3]) ? r[3] : null, d: cleanText(r[4]) };
}

export function pointColumns(rows, max) {
  const all = Array.isArray(rows) ? rows : [], n0 = Math.min(all.length, max);
  const x = new Float64Array(n0), y = new Float64Array(n0), z = new Float64Array(n0), names = new Array(n0), descs = new Array(n0), blk = [];
  let k = 0;
  for (let i = 0; i < n0; i++) {
    const r = all[i];
    if (!Array.isArray(r) || !fin(r[1]) || !fin(r[2])) continue;
    x[k] = r[1]; y[k] = r[2]; z[k] = fin(r[3]) ? r[3] : NaN;
    names[k] = cleanText(r[0], 40); descs[k] = cleanText(r[4]);
    if (r[5] !== undefined && r[5] !== null) blk.push(k, r[5]);
    k++;
  }
  names.length = k; descs.length = k;
  // the cleaned texts hold no control character, so '\u0000' cannot occur inside one: one string each crosses to the page cheaply
  return { count: k, total: all.length, x: x.slice(0, k), y: y.slice(0, k), z: z.slice(0, k), names: names.join('\u0000'), descs: descs.join('\u0000'), blk };
}

export function writeRow(r, w) {
  if (!Array.isArray(r) || !fin(r[1]) || !fin(r[2])) return;
  w.add(r[1], r[2], fin(r[3]) ? r[3] : NaN, cleanText(r[0], 40), cleanText(r[4]), r[5] !== undefined && r[5] !== null ? r[5] : undefined);
}
