/* SPDX-License-Identifier: Apache-2.0 */
/**
 * furnish.js — furnish rooms for renderings (0.8 EG.60, session bim_PART_2). No DOM: tools/bimcraft-test/furnish-test.mjs
 * (node bin/test-bimcraft.mjs --furnish) runs it in Node. Plan millimetres, angles in degrees, counter-clockwise from +x.
 *
 * A rule-based layout, not a model of taste: each room kind has a short list of pieces (the starter families of family-starters.js),
 * each with a place to stand (against a wall, or free in the middle), clearance it needs in front, and whether it blocks windows.
 * Pieces go against the walls from the longest wall round; a door's swing zone and a window's width in front of tall pieces stay free;
 * nothing overlaps; a piece that does not fit is skipped and said (furnishProblems → the shared Problems shape, severity note).
 * The result is the same for the same room: no randomness. Defaults are labelled "furnish.defaults" for the person to review.
 *
 *   KINDS                        'bedroom' | 'living' | 'dining' | 'kitchen' | 'bath' | 'office'
 *   PIECES                       family key → { w, d, h, at: 'wall' | 'free', clear, tall }   sizes match the starter recipes
 *   planFurnish(room, { kind, doors, windows, pieces }) → { placements: [{ family, x, y, rot, w, d, why }], skipped: [{ family, why }] }
 *       room = { poly: [[x, y]…] anticlockwise (the walls' inner faces), holes? }
 *       doors = [{ x, y, w }]   (centre of the door in the wall, its width)       windows = [{ x, y, w, sill }]
 *       pieces = an override list for a kind: [family keys] (default: PRESETS[kind])
 *   furnishProblems(room, result, { id, label }) → [problem]   one note per piece that did not fit
 *
 * Frame of a piece: x across (centred), y from the front (0) to the back (d); a wall piece stands with its back to the wall, so rot turns +y to face the wall.
 */
export const KINDS = ['bedroom', 'living', 'dining', 'kitchen', 'bath', 'office'];
export const DEFAULTS_NOTE = 'furnish.defaults';

/** Footprints in mm (width across, depth front to back, height). `clear` is the free depth wanted in front; `tall` blocks a window. */
export const PIECES = {
  'fam-bed': { w: 1600, d: 2000, h: 500, at: 'wall', clear: 600, side: 500, tall: false },
  'fam-sofa': { w: 2000, d: 900, h: 850, at: 'wall', clear: 900, side: 0, tall: false },
  'fam-wardrobe': { w: 1200, d: 600, h: 2100, at: 'wall', clear: 700, side: 0, tall: true },
  'fam-desk': { w: 1400, d: 700, h: 740, at: 'wall', clear: 900, side: 0, tall: false },   // 0.8 EG.60: its chair stands in the clear space in front
  'fam-chair': { w: 450, d: 500, h: 880, at: 'tuck', to: 'fam-desk', clear: 0, side: 0, tall: false },   // in front of the desk, facing it
  'fam-bathtub': { w: 1700, d: 750, h: 550, at: 'wall', clear: 600, side: 0, tall: false },   // not in a preset (a tub is a choice): ask for it with `pieces`
  'fam-shelf': { w: 900, d: 350, h: 1800, at: 'wall', clear: 600, side: 0, tall: true },
  'fam-cabinet': { w: 600, d: 600, h: 870, at: 'wall', clear: 900, side: 0, tall: false },
  'fam-table': { w: 1500, d: 900, h: 750, at: 'free', clear: 800, side: 0, tall: false },
  'fam-kitchensink': { w: 1200, d: 600, h: 900, at: 'wall', clear: 900, side: 0, tall: false },
  'fam-wc': { w: 380, d: 680, h: 780, at: 'wall', clear: 600, side: 200, tall: false },
  'fam-lavatory': { w: 500, d: 450, h: 850, at: 'wall', clear: 600, side: 100, tall: false },
  'fam-shower': { w: 900, d: 900, h: 2100, at: 'wall', clear: 600, side: 0, tall: false },
};

/** Pieces per kind, in the order they are placed (the biggest need first). */
export const PRESETS = {
  bedroom: ['fam-bed', 'fam-wardrobe', 'fam-table'],
  living: ['fam-sofa', 'fam-shelf', 'fam-table'],
  dining: ['fam-table', 'fam-cabinet', 'fam-cabinet'],
  kitchen: ['fam-kitchensink', 'fam-cabinet', 'fam-cabinet', 'fam-cabinet', 'fam-cabinet'],
  bath: ['fam-shower', 'fam-wc', 'fam-lavatory'],
  office: ['fam-desk', 'fam-chair', 'fam-shelf', 'fam-shelf'],
};
/** A table in a bedroom or office is a desk: smaller. */
const SIZE = { 'bedroom:fam-table': { w: 1200, d: 600 }, 'office:fam-table': { w: 1500, d: 750 }, 'living:fam-table': { w: 1000, d: 600 }, 'dining:fam-table': { w: 1800, d: 900 } };

const rad = (d) => (d * Math.PI) / 180;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const len = (a) => Math.hypot(a[0], a[1]);

/** The four corners of a rectangle centred at (x, y), `w` across and `d` deep, turned `rot`; extra margins front/back/sides widen the box (used as the reserved zone). */
function corners(x, y, w, d, rot, { front = 0, side = 0 } = {}) {
  const c = Math.cos(rad(rot)), s = Math.sin(rad(rot));
  // local frame: u across (x), v from front (0) to back (d): the box spans v in [-front, d]
  const u0 = -w / 2 - side, u1 = w / 2 + side, v0 = -front, v1 = d;
  return [[u0, v0], [u1, v0], [u1, v1], [u0, v1]].map(([u, v]) => [x + u * c - v * s, y + u * s + v * c]);
}
const axes = (p) => [0, 1].map((i) => { const e = sub(p[i + 1], p[i]); const l = len(e); return [-e[1] / l, e[0] / l]; });
const range = (p, ax) => { let lo = Infinity, hi = -Infinity; for (const q of p) { const v = q[0] * ax[0] + q[1] * ax[1]; if (v < lo) lo = v; if (v > hi) hi = v; } return [lo, hi]; };
/** Do two convex rectangles overlap by more than a hair (separating axis)? */
function overlaps(a, b, eps = 1) {
  for (const ax of [...axes(a), ...axes(b)]) { const [a0, a1] = range(a, ax), [b0, b1] = range(b, ax); if (a1 <= b0 + eps || b1 <= a0 + eps) return false; }
  return true;
}
function inside(poly, p) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}
const distToSeg = (p, a, b) => { const ab = sub(b, a), t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / (ab[0] * ab[0] + ab[1] * ab[1]))); return len([p[0] - (a[0] + ab[0] * t), p[1] - (a[1] + ab[1] * t)]); };
/** Does the rectangle sit inside the room (corners and edge midpoints in, none in a hole)? */
function fits(room, rect) {
  // a piece stands against the wall: its back is ON the boundary, where "inside" is a coin toss, so the points are pulled 2 mm toward the middle
  const mx = rect.reduce((s, q) => s + q[0], 0) / 4, my = rect.reduce((s, q) => s + q[1], 0) / 4;
  const pull = (q) => { const dx = mx - q[0], dy = my - q[1], l = Math.hypot(dx, dy) || 1; return [q[0] + (dx / l) * 2, q[1] + (dy / l) * 2]; };
  const pts = [...rect, ...rect.map((q, i) => [(q[0] + rect[(i + 1) % 4][0]) / 2, (q[1] + rect[(i + 1) % 4][1]) / 2])].map(pull);
  if (!pts.every((p) => inside(room.poly, p))) return false;
  for (const h of room.holes || []) if (pts.some((p) => inside(h, p))) return false;
  return true;
}
const area = (poly) => { let s = 0; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };

/** A placement's four plan corners (the box of the piece itself, no clearance). */
export function footprint(p) {
  const free = PIECES[p.family]?.at === 'free';
  return free ? corners(p.x + Math.sin(rad(p.rot)) * (p.d / 2), p.y - Math.cos(rad(p.rot)) * (p.d / 2), p.w, p.d, p.rot) : corners(p.x, p.y, p.w, p.d, p.rot);
}
export const boxesOverlap = overlaps;

export function planFurnish(room, { kind = 'living', doors = [], windows = [], pieces = null } = {}) {
  if (!room?.poly || room.poly.length < 3) return { placements: [], skipped: [], reason: 'noroom' };
  let poly = room.poly;
  if (area(poly) < 0) poly = [...poly].reverse();   // anticlockwise: the inside is on the left of each edge
  const r = { ...room, poly };
  const list = pieces || PRESETS[kind] || [];
  // walls longest first; each with its unit direction and inward normal
  const edges = poly.map((a, i) => { const b = poly[(i + 1) % poly.length], l = len(sub(b, a)); const dir = [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; return { a, b, l, dir, n: [-dir[1], dir[0]] }; })
    .filter((e) => e.l > 300).sort((p, q) => q.l - p.l);
  // door swing zones: the opening's width + a margin each side, a door's width deep on both sides of the wall
  const doorRects = doors.map((d) => {
    const e = edges.find((x) => distToSeg([d.x, d.y], x.a, x.b) < 400) || edges[0];
    const ang = (Math.atan2(e.dir[1], e.dir[0]) * 180) / Math.PI;
    // box centred on the door, aligned with the wall: v from -(w) to +(w)
    return corners(d.x, d.y, d.w + 300, d.w, ang, { front: d.w });
  });
  const winRects = windows.map((wd) => {
    const e = edges.find((x) => distToSeg([wd.x, wd.y], x.a, x.b) < 400) || edges[0];
    const ang = (Math.atan2(e.dir[1], e.dir[0]) * 180) / Math.PI;
    return { rect: corners(wd.x, wd.y, wd.w, 400, ang, { front: 400 }), sill: wd.sill ?? 900 };
  });
  const placed = [], placements = [], skipped = [];
  const free = (rect, p, zoneRect) => {
    if (!fits(r, rect)) return false;
    if (doorRects.some((dr) => overlaps(zoneRect || rect, dr))) return false;
    if (p.tall && winRects.some((wr) => wr.sill < p.h && overlaps(rect, wr.rect))) return false;
    if (placed.some((q) => overlaps(zoneRect || rect, q.rect) || overlaps(rect, q.zone))) return false;
    return true;
  };
  const step = 100;
  for (const family of list) {
    const base = PIECES[family];
    if (!base) { skipped.push({ family, why: 'unknown' }); continue; }
    const p = { ...base, ...(SIZE[kind + ':' + family] || {}) };
    let done = null;
    if (p.at === 'tuck') {
      // 0.8 EG.60: a chair in front of the desk it belongs to, facing it; the desk's clear zone is its own space, so only the other pieces' zones count
      const desk = placed.find((q) => q.family === p.to);
      if (desk) {
        const rot = desk.rot + 180, fx = Math.sin(rad(desk.rot)), fy = -Math.cos(rad(desk.rot));   // the way the desk faces
        for (const gap of [40, 140, 240]) {
          const x = desk.x + fx * gap, y = desk.y + fy * gap;
          const rect = corners(x, y, p.w, p.d, rot);
          if (fits(r, rect) && !doorRects.some((dr) => overlaps(rect, dr)) && !placed.some((q) => q !== desk && (overlaps(rect, q.rect) || overlaps(rect, q.zone))) && !placed.some((q) => q === desk && overlaps(rect, q.rect))) {
            done = { family, x: Math.round(x), y: Math.round(y), rot: Math.round(rot * 1000) / 1000, w: p.w, d: p.d, rect, zone: rect, why: 'in front of the desk' }; break;
          }
        }
      }
    } else if (p.at === 'wall') {
      for (const e of edges) {
        const rot = (Math.atan2(e.n[0], -e.n[1]) * 180) / Math.PI;
        if (e.l < p.w + 2 * (p.side || 0) - 1) continue;
        // slide along the wall from one end; the first free spot wins (deterministic)
        const from = p.w / 2 + (p.side || 0), to = e.l - p.w / 2 - (p.side || 0);
        for (let t = from; t <= to + 0.5; t += step) {
          const wx = e.a[0] + e.dir[0] * t, wy = e.a[1] + e.dir[1] * t;
          const x = wx + e.n[0] * p.d, y = wy + e.n[1] * p.d;   // origin = the front of the piece; the back stands on the wall
          const rect = corners(x, y, p.w, p.d, rot);
          const zr = corners(x, y, p.w, p.d, rot, { front: p.clear, side: p.side || 0 });
          if (free(rect, p, zr)) { done = { family, x: Math.round(x), y: Math.round(y), rot: Math.round(rot * 1000) / 1000, w: p.w, d: p.d, rect, zone: zr, why: 'against the wall ' + Math.round(e.l) + ' mm long' }; break; }
        }
        if (done) break;
      }
    } else {
      // free in the middle: try the room's middle, then a ring of offsets, each turn; the piece is centred on (x, y)
      const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]);
      const mid = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
      const along = edges[0] ? (Math.atan2(edges[0].dir[1], edges[0].dir[0]) * 180) / Math.PI : 0;
      const spots = [[0, 0]];
      for (let k = 1; k <= 20; k++) for (const [ux, uy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) spots.push([ux * k * 150, uy * k * 150]);
      for (const rot of [along, along + 90]) {
        for (const [dx, dy] of spots) {
          const cx = mid[0] + dx, cy = mid[1] + dy;
          const ox = cx + Math.sin(rad(rot)) * (p.d / 2), oy = cy - Math.cos(rad(rot)) * (p.d / 2);   // the front-centre of the box
          const rect = corners(ox, oy, p.w, p.d, rot);
          const zr = corners(ox, oy, p.w, p.d, rot, { front: p.clear / 2, side: p.clear / 2 });
          if (free(rect, p, zr)) { done = { family, x: Math.round(cx), y: Math.round(cy), rot: Math.round(rot * 1000) / 1000, w: p.w, d: p.d, rect, zone: zr, why: 'in the middle of the room' }; break; }
        }
        if (done) break;
      }
    }
    if (done) { placed.push(done); placements.push({ family, x: done.x, y: done.y, rot: done.rot, w: done.w, d: done.d, why: done.why }); }
    else skipped.push({ family, why: 'nofit' });
  }
  return { placements, skipped, kind, defaults: DEFAULTS_NOTE };
}

/** The pieces that did not fit as shared Problems (rule 29): a note about the room, with the piece named. */
export function furnishProblems(room, result, { id = 'room', label = 'Room', t = (k) => k } = {}) {
  return (result?.skipped || []).map((s) => ({
    id: 'furnish:' + id + ':' + s.family, code: 'furnish.' + s.why, severity: 'note',
    msg: { key: 'eg60.p.' + s.why, vars: { room: label, piece: s.family } }, text: t('eg60.p.' + s.why),
    about: [{ kind: 'element', id, label }], source: { name: 'bimcraft.furnish' },
  }));
}
