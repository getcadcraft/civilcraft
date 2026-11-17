// SPDX-License-Identifier: Apache-2.0
/**
 * tiles.js: tile set-out on a wall face (0.10 BK.28; session bim-finishes-10). Host-free, no DOM, imports face.js only. Face coordinates (face.js).
 *
 * The tiles are laid as a grid with one JOINT between neighbours. Where the first tile goes (the START POINT) decides where every joint lands:
 *   corner  { corner: 'bl' | 'br' | 'tl' | 'tr' }   a tile corner sits in that corner of the zone (b = bottom, t = top, l = low s, r = high s)
 *   centre                                          a tile is centred on the middle of the zone
 *   opening { opening, edge }                       a tile edge is ON that edge of the opening, the tile lying outside the opening: edge 'left' = a tile ends
 *                                                   at the opening's low-s edge, 'right' = a tile starts at its high-s edge, 'bottom' = a tile ends at its
 *                                                   lower edge, 'top' = a tile starts at its upper edge
 *   point   { s, v }                                a tile's lower-left corner is exactly there
 * DIRECTION: 'horizontal' = the tile's LENGTH runs along s (the wall); 'vertical' = along v. PATTERN: 'grid' (joints line up) or 'brick' (every second
 * row, or column for a vertical tile, shifted by `shift` of a tile, default a half).
 *
 * A tile that lies wholly inside the zone and touches no opening is WHOLE. A tile that is partly outside the zone, or has an opening or a zone laid on top
 * of it taking part of it away, is CUT (what remains is one or more pieces, counted as ONE cut tile). A tile with nothing left is not counted.
 * Tiles to order = (whole + cut) x (1 + waste percent), rounded up: every cut tile is counted as a new tile, offcuts are not reused.
 * A zone over LIMIT tiles is counted from its area instead and marked `estimated`.
 *
 *   setOut({ region: [rect], zone: rect, holes: [rect], tile: { length, width, joint, waste }, setout?, openings?: { id: rect } })
 *     region = the part of the zone that is visible (the zone less what lies on top of it); zone = its whole rectangle (the start point is taken from it);
 *     holes = openings (and anything else that takes tile away) inside the zone; openings = the same, by id, for 'opening' starts.
 *     → { whole, cut, order, estimated, area (net), tileArea, rows, cols, origin: { s, v }, tiles: [{ rect, cut, piece: { w, h } }] (omitted when estimated or `list: false`),
 *         cutSizes: [{ w, h, count }] the distinct cut pieces' bounding sizes (to the mm) with how many, most first }
 *   startOrigin(zone, tile, setout, openings) → { s, v } the lower-left corner of the tile the grid is hung from
 *   tilesToOrder(whole, cut, waste) → n
 */
import { rect, area, inter, subtract, areaOf } from './face.js';

export const LIMIT = 40000;
const EPS = 1e-6;

/** The tile's size on the wall: width along s and height along v, after the direction. */
export function tileSize(tile, direction = 'horizontal') {
  return direction === 'vertical' ? { w: tile.width, h: tile.length } : { w: tile.length, h: tile.width };
}
export const tilesToOrder = (whole, cut, waste = 0) => Math.ceil((whole + cut) * (1 + waste / 100) - 1e-9);

export function startOrigin(zone, size, setout = null, openings = {}) {
  const st = setout?.start || { kind: 'corner', corner: 'bl' };
  const W = size.w, H = size.h;
  if (st.kind === 'centre') return { s: (zone.s0 + zone.s1) / 2 - W / 2, v: (zone.v0 + zone.v1) / 2 - H / 2 };
  if (st.kind === 'point') return { s: st.s, v: st.v };
  if (st.kind === 'opening') {
    const o = openings[st.opening];
    if (o) {
      switch (st.edge) {
        case 'left': return { s: o.s0 - W, v: zone.v0 };
        case 'right': return { s: o.s1, v: zone.v0 };
        case 'bottom': return { s: zone.s0, v: o.v0 - H };
        case 'top': return { s: zone.s0, v: o.v1 };
        default: break;
      }
    }
  }
  const c = st.corner || 'bl';
  return { s: c[1] === 'r' ? zone.s1 - W : zone.s0, v: c[0] === 't' ? zone.v1 - H : zone.v0 };
}

export function setOut({ region, zone, holes = [], tile, setout = null, openings = {}, list = true }) {
  const dir = setout?.direction === 'vertical' ? 'vertical' : 'horizontal';
  const size = tileSize(tile, dir), joint = tile.joint || 0, waste = tile.waste || 0;
  const pS = size.w + joint, pV = size.h + joint, tileArea = size.w * size.h;
  const brick = setout?.pattern === 'brick', shift = brick ? (setout.shift ?? 0.5) : 0;
  const origin = startOrigin(zone, size, setout, openings);
  const rects = region?.length ? region : [zone];
  const net = areaOf(rects.flatMap((r) => subtract(r, holes)));
  const bb = { s0: Math.min(...rects.map((r) => r.s0)), s1: Math.max(...rects.map((r) => r.s1)), v0: Math.min(...rects.map((r) => r.v0)), v1: Math.max(...rects.map((r) => r.v1)) };
  const r0 = Math.floor((bb.v0 - origin.v) / pV) - 1, r1 = Math.ceil((bb.v1 - origin.v) / pV) + 1;
  // a brick pattern shifts along s for a horizontal tile; for a vertical tile the SAME idea runs the other way (columns shifted along v)
  const vertBrick = brick && dir === 'vertical';
  const rows = r1 - r0 + 1, colsGuess = Math.ceil((bb.s1 - bb.s0) / pS) + 3;
  if (rows * colsGuess > LIMIT * 4) return estimated(net, tileArea, waste, origin, size);
  const out = [], sizes = new Map();
  let whole = 0, cut = 0, count = 0, nrow = 0;
  for (let r = r0; r <= r1; r++) {
    const v = origin.v + r * pV, rowShift = !vertBrick && brick ? ((r % 2) + 2) % 2 * shift * pS : 0;
    const c0 = Math.floor((bb.s0 - origin.s - rowShift) / pS) - 1, c1 = Math.ceil((bb.s1 - origin.s - rowShift) / pS) + 1;
    for (let c = c0; c <= c1; c++) {
      const s = origin.s + c * pS + rowShift, vv = vertBrick ? v + ((((c % 2) + 2) % 2) * shift * pV) : v;
      const T = { s0: s, s1: s + size.w, v0: vv, v1: vv + size.h };
      let left = 0, bbox = null;
      const parts = [];
      for (const rg of rects) {
        const i = inter(T, rg);
        if (i) parts.push(...subtract(i, holes));
      }
      for (const p of parts) left += area(p);
      if (left <= EPS) continue;
      const isWhole = Math.abs(left - tileArea) <= 1e-6 * Math.max(1, tileArea);
      count++;
      if (isWhole) whole++;
      else {
        cut++;
        const q = parts.reduce((b, p) => ({ s0: Math.min(b.s0, p.s0), s1: Math.max(b.s1, p.s1), v0: Math.min(b.v0, p.v0), v1: Math.max(b.v1, p.v1) }), { s0: Infinity, s1: -Infinity, v0: Infinity, v1: -Infinity });
        bbox = { w: q.s1 - q.s0, h: q.v1 - q.v0 };
        const key = Math.round(bbox.w) + 'x' + Math.round(bbox.h);
        sizes.set(key, { w: Math.round(bbox.w), h: Math.round(bbox.h), count: (sizes.get(key)?.count || 0) + 1 });
      }
      if (list && count <= LIMIT) out.push({ rect: T, cut: !isWhole, ...(bbox ? { piece: bbox } : {}) });
      if (count > LIMIT) return estimated(net, tileArea, waste, origin, size);
    }
    nrow++;
  }
  const ncol = Math.round(count / Math.max(1, nrow));
  return {
    whole, cut, order: tilesToOrder(whole, cut, waste), estimated: false, area: net, tileArea, rows: new Set(out.map((t) => t.rect.v0.toFixed(3))).size || nrow, cols: ncol, origin,
    ...(list ? { tiles: out } : {}), cutSizes: [...sizes.values()].sort((x, y) => y.count - x.count || y.w * y.h - x.w * x.h),
  };
}
function estimated(net, tileArea, waste, origin, size) {
  const n = Math.ceil(net / tileArea);
  return { whole: n, cut: 0, order: Math.ceil(n * (1 + waste / 100) - 1e-9), estimated: true, area: net, tileArea, rows: 0, cols: 0, origin, cutSizes: [] };
}
