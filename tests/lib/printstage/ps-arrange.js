/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ps-arrange.js — laying things out on a printer's bed (roadmap PS.1). Imports nothing, no DOM. Boxes in millimetres, X and Y.
 *
 *   arrange(sizes, bed, { gap = 5 }) → { at: [[x, y] | null …], placed, left }    corners; a row packer, biggest first, centred on the
 *                                                                                 bed; what does not fit is null, never overlapped
 *   fitScale(size, bed, { margin = 0.9 }) → factor that fits a [x, y, z] box on the bed, turned neither way (1 or less unless asked)
 *   checkPlate(boxes, bed) → { off: [i …], overlaps: [[i, j] …] }                 boxes: [{ min: [x, y, z], max: [x, y, z] }]
 */
export function arrange(sizes, bed, { gap = 5 } = {}) {
  const order = sizes.map((s, i) => i).sort((a, b) => sizes[b][1] - sizes[a][1] || sizes[b][0] - sizes[a][0]);
  const at = new Array(sizes.length).fill(null), rows = [];
  let x = 0, y = 0, rowH = 0, row = [];
  for (const i of order) {
    const [w, d, h = 0] = sizes[i];
    if (w > bed[0] || d > bed[1] || h > (bed[2] ?? Infinity)) continue;
    if (x > 0 && x + w > bed[0]) { rows.push({ row, y, w: x - gap }); y += rowH + gap; x = 0; rowH = 0; row = []; }
    if (y + d > bed[1]) continue;
    row.push([i, x]);
    x += w + gap; rowH = Math.max(rowH, d);
  }
  if (row.length) rows.push({ row, y, w: x - gap });
  const total = rows.length ? y + rowH : 0, offY = (bed[1] - total) / 2;
  let placed = 0;
  for (const r of rows) {
    const offX = (bed[0] - r.w) / 2;
    for (const [i, rx] of r.row) { at[i] = [offX + rx, offY + r.y]; placed++; }
  }
  return { at, placed, left: sizes.length - placed };
}

export function fitScale(size, bed, { margin = 0.9 } = {}) {
  let f = Infinity;
  for (let k = 0; k < 3; k++) if (size[k] > 0) f = Math.min(f, bed[k] * margin / size[k]);
  return Number.isFinite(f) ? f : 1;
}

export function checkPlate(boxes, bed) {
  const off = [], overlaps = [], E = 0.01;
  boxes.forEach((b, i) => {
    if (b.min[0] < -E || b.min[1] < -E || b.max[0] > bed[0] + E || b.max[1] > bed[1] + E || b.max[2] > bed[2] + E) off.push(i);
    for (let j = i + 1; j < boxes.length; j++) {
      const o = boxes[j];
      if (b.min[0] < o.max[0] - E && o.min[0] < b.max[0] - E && b.min[1] < o.max[1] - E && o.min[1] < b.max[1] - E) overlaps.push([i, j]);
    }
  });
  return { off, overlaps };
}
