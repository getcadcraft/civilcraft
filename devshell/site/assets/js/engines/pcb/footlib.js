/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Parametric footprints (0.8 XE.11). Land patterns here are EXAMPLES worked out from body and lead sizes with plain rules; they are not IPC-7351 values
 * (that standard is not reproduced) — a shop's own library replaces them. Pad numbers are strings. Local origin = the part centre, pin 1 at the left/top.
 */
const mk = (name, pads, margin = 0.25, silk = []) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of pads) { x0 = Math.min(x0, p.x - p.w / 2); x1 = Math.max(x1, p.x + p.w / 2); y0 = Math.min(y0, p.y - p.h / 2); y1 = Math.max(y1, p.y + p.h / 2); }
  return { name, pads, courtyard: [x0 - margin, y0 - margin, x1 + margin, y1 + margin], silk };
};
const smd = (num, shape, x, y, w, h) => ({ num: String(num), shape, x, y, w, h, drill: 0, plated: true, rot: 0 });
const tht = (num, shape, x, y, w, h, drill) => ({ num: String(num), shape, x, y, w, h, drill, plated: true, rot: 0 });

/** Two-terminal chip: pitch between pad centres, pad w×h (w along the pitch axis). */
export const chip = (name, pitch, padW, padH) => mk(name, [smd(1, 'rect', -pitch / 2, 0, padW, padH), smd(2, 'rect', pitch / 2, 0, padW, padH)], 0.2);
export const CHIPS = { R0402: chip('R0402', 1.0, 0.6, 0.6), R0603: chip('R0603', 1.6, 0.9, 1.0), R0805: chip('R0805', 2.0, 1.0, 1.4), R1206: chip('R1206', 3.0, 1.2, 1.8) };
/** Dual-row SMD (SOIC style): n pins, pitch, row-to-row distance between pad centres. Pin 1 top-left, counter-clockwise. */
export function soic(n, pitch = 1.27, rowSpacing = 5.4, padW = 0.6, padL = 1.5, name = 'SOIC-' + n) {
  const half = n / 2, pads = [];
  for (let i = 0; i < half; i++) { const y = ((half - 1) / 2 - i) * pitch; pads.push(smd(i + 1, 'rect', -rowSpacing / 2, y, padL, padW)); pads.push(smd(n - i, 'rect', rowSpacing / 2, y, padL, padW)); }
  return mk(name, pads.sort((a, b) => +a.num - +b.num), 0.3);
}
/** Dual in-line through-hole. */
export function dip(n, pitch = 2.54, rows = 7.62, drill = 0.8, pad = 1.6, name = 'DIP-' + n) {
  const half = n / 2, pads = [];
  for (let i = 0; i < half; i++) { const y = ((half - 1) / 2 - i) * pitch; pads.push(tht(i + 1, i === 0 ? 'rect' : 'oval', -rows / 2, y, pad, pad, drill)); pads.push(tht(n - i, 'oval', rows / 2, y, pad, pad, drill)); }
  return mk(name, pads.sort((a, b) => +a.num - +b.num), 0.4);
}
/** Pin header, one or two rows. */
export function header(n, rows = 1, pitch = 2.54, drill = 1.0, pad = 1.7, name = 'HDR-' + rows + 'x' + n) {
  const pads = []; let k = 1;
  for (let i = 0; i < n; i++) for (let r = 0; r < rows; r++) pads.push(tht(k, k++ === 1 ? 'rect' : 'circle', (r - (rows - 1) / 2) * pitch, ((n - 1) / 2 - i) * pitch, pad, pad, drill));
  return mk(name, pads, 0.4);
}
export function sot23(name = 'SOT-23') { return mk(name, [smd(1, 'rect', -0.95, 1.0, 0.8, 0.9), smd(2, 'rect', 0.95, 1.0, 0.8, 0.9), smd(3, 'rect', 0, -1.0, 0.8, 0.9)], 0.25); }
/** Quad flat pack: nPerSide pins on each side, pitch, span between opposite pad-row centres. Pin 1 top-left, counter-clockwise. */
export function quad(nPerSide, pitch = 0.5, span = 8.4, padW = 0.3, padL = 1.4, name = 'QFP-' + nPerSide * 4) {
  const pads = []; let k = 1;
  for (let i = 0; i < nPerSide; i++) pads.push(smd(k++, 'rect', -span / 2, ((nPerSide - 1) / 2 - i) * pitch, padL, padW));
  for (let i = 0; i < nPerSide; i++) pads.push(smd(k++, 'rect', (-(nPerSide - 1) / 2 + i) * pitch, -span / 2, padW, padL));
  for (let i = 0; i < nPerSide; i++) pads.push(smd(k++, 'rect', span / 2, (-(nPerSide - 1) / 2 + i) * pitch, padL, padW));
  for (let i = 0; i < nPerSide; i++) pads.push(smd(k++, 'rect', ((nPerSide - 1) / 2 - i) * pitch, span / 2, padW, padL));
  return mk(name, pads, 0.4);
}
/** Axial through-hole part (resistor, diode): lead pitch. */
export const axial = (pitch = 7.62, drill = 0.8, pad = 1.6, name = 'AXIAL-' + pitch) => mk(name, [tht(1, 'rect', -pitch / 2, 0, pad, pad, drill), tht(2, 'circle', pitch / 2, 0, pad, pad, drill)], 0.4);
export function standardLibrary() { return { ...CHIPS, 'SOIC-8': soic(8), 'SOIC-14': soic(14), 'DIP-8': dip(8), 'DIP-14': dip(14), 'HDR-1x2': header(2), 'HDR-1x4': header(4), 'HDR-1x6': header(6), 'HDR-2x5': header(5, 2), 'SOT-23': sot23(), 'QFP-32': quad(8), 'AXIAL-7.62': axial(), C0603: { ...chip('C0603', 1.6, 0.9, 1.0), name: 'C0603' }, C0805: { ...chip('C0805', 2.0, 1.0, 1.4), name: 'C0805' } }; }
