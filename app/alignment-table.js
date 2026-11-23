/* SPDX-License-Identifier: Apache-2.0 */
/**
 * alignment-table.js — 0.11 FX.369 (civilcraft#3, part 4): the table of an alignment's elements. No DOM.
 *
 *   elementRows(alignment) → [{ n, kind: 'line' | 'arc' | 'spiral' | 'cspiral', sta0, sta1, len, R, R2, A, gisement, x, y }]
 *     each straight, circular arc and spiral in order with the station where it starts and ends, its length, its radius R
 *     (a spiral's: the radius it ends at; a compound spiral's: the radius it leaves, R, and the one it reaches, R2), the
 *     clothoid parameter A = √(R·L) (the compound spiral's: A² = L / |1/R2 − 1/R|; blank for the other transition shapes), the
 *     direction at the start as a gisement in gons, and the start point (x easting, y northing).
 *   gisement(dir) → gons   the angle from the grid NORTH, clockwise, 0 to 400 gon (the French "gisement"); dir is the
 *     mathematical angle from +x (east) counter-clockwise, radians, as alignment.js carries it. North 0, east 100, south 200, west 300.
 *   elementsCsv(rows, { locale: 'fr' | 'en', labels, unitDigits }) → text   the French spreadsheet format: semicolon between
 *     cells, comma for the decimal mark, CRLF lines, a byte-order mark in front (so the French spreadsheet reads the accents); 'en':
 *     comma and point, LF.
 *
 * A gon is 1/400 of a circle (ISO 80000-3: π/200 rad). Nothing here knows a unit of length: every length is in the project's own unit.
 */

const TAU = Math.PI * 2;
export const gisement = (dir) => {
  let g = (Math.PI / 2 - dir) % TAU;
  if (g < 0) g += TAU;
  const gon = (g * 200) / Math.PI;
  return gon >= 400 - 1e-9 ? 0 : gon;
};
const startDir = (e) => (e.type === 'line' ? e.dir : e.type === 'arc' ? (e.dirIn ?? e.a0 + (e.ccw ? Math.PI / 2 : -Math.PI / 2)) : e.dir0);

export function elementRows(al) {
  if (!al?.elements?.length) return [];
  return al.elements.map((e, i) => {
    const kind = e.type === 'spiral' && e.io === 'cs' ? 'cspiral' : e.type;
    const row = { n: i + 1, kind, sta0: e.sta, sta1: e.sta + e.len, len: e.len, R: null, R2: null, A: null, gisement: gisement(startDir(e)), x: e.p0.x, y: e.p0.y };
    if (e.type === 'arc') row.R = e.r;
    else if (e.type === 'spiral' && e.io === 'cs') {
      row.R = e.r1; row.R2 = e.r2;
      const dk = Math.abs(1 / e.r2 - 1 / e.r1);
      row.A = dk > 0 ? Math.sqrt(e.len / dk) : null;
    } else if (e.type === 'spiral') { row.R = e.r; row.A = (e.tr || 'clothoid') === 'clothoid' ? Math.sqrt(e.r * e.len) : null; }
    return row;
  });
}

const KINDS_FR = { line: 'Droite', arc: 'Arc', spiral: 'Clothoïde', cspiral: 'Clothoïde de raccordement' };
const KINDS_EN = { line: 'Straight', arc: 'Arc', spiral: 'Spiral', cspiral: 'Compound spiral' };
const HEAD_FR = ['N°', 'Type', 'PK début', 'PK fin', 'Longueur', 'R', 'R fin', 'A', 'Gisement (gon)', 'X début', 'Y début'];
const HEAD_EN = ['No.', 'Type', 'Start station', 'End station', 'Length', 'R', 'R end', 'A', 'Gisement (gon)', 'Start X', 'Start Y'];

export function elementsCsv(rows, { locale = 'fr', head, kinds, digits = 3 } = {}) {
  const fr = locale === 'fr', sep = fr ? ';' : ',', nl = fr ? '\r\n' : '\n';
  const num = (v, d = digits) => (v === null || v === undefined || !Number.isFinite(v) ? '' : fr ? v.toFixed(d).replace('.', ',') : v.toFixed(d));
  const text = (s) => { const x = String(s); return /[;,"\r\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
  const K = kinds || (fr ? KINDS_FR : KINDS_EN), H = head || (fr ? HEAD_FR : HEAD_EN);
  const lines = [H.map(text).join(sep)];
  for (const r of rows) lines.push([r.n, text(K[r.kind] || r.kind), num(r.sta0), num(r.sta1), num(r.len), num(r.R), num(r.R2), num(r.A), num(r.gisement, 4), num(r.x), num(r.y)].join(sep));
  return (fr ? '﻿' : '') + lines.join(nl) + nl;
}
