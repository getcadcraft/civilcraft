/* SPDX-License-Identifier: Apache-2.0 */
/**
 * drawings.js — the plan and the section of a dome as plain 2D entities (0.11 DOME.1 / DOME.2). Host-free; millimetres, y up.
 *   { type: 'line', layer, a: [x, y], b: [x, y] } · { type: 'poly', layer, pts: [[x, y]…], closed } · { type: 'circle', layer, c, r } ·
 *   { type: 'arc', layer, c, r, a0, a1 (radians, counter-clockwise from a0 to a1) } · { type: 'text', layer, at, h, s, ha } ·
 *   { type: 'dim', layer, p1, p2, loc, rot (0 | 90) }
 * CadCraft's host turns them into real entities; the panel draws the same list as its preview. The section is cut through the axis, between
 * the openings (it shows the whole shell).
 */
import { clipZ } from './geometry.js';

export const LAYERS = {
  'DOME-SHELL': { color: 8 }, 'DOME-SKIN': { color: 2 }, 'DOME-BASE': { color: 9 }, 'DOME-OPENING': { color: 1 }, 'DOME-CLEAR': { color: 4 }, 'DOME-TEXT': { color: 7 }, 'DOME-DIMS': { color: 3 },
};
const m = (mm) => (mm / 1000).toFixed(2);
/** A length and an area in the dome's own units, for the notes on the drawing. */
const len = (d, mm) => (d.units === 'imperial' ? (mm / 304.8).toFixed(2) + ' ft' : m(mm) + ' m');
const sq = (d, mm2) => (d.units === 'imperial' ? (mm2 / (304.8 * 304.8)).toFixed(0) + ' ft²' : (mm2 / 1e6).toFixed(1) + ' m²');
const TAU = 2 * Math.PI;

/** The plan at floor level. words = { floor, headroom, door, window } (already in the person's language). */
export function planEnts(result, words = {}) {
  const d = result.design, { layout, metrics: M } = result.built, out = [];
  const W = { floor: 'floor', headroom: 'headroom', door: 'Door', window: 'Window', ...words };
  const a = layout.a, doors = layout.kept.filter((o) => o.sill === 0);
  const text = (at, s, h = 150, ha = 'center') => out.push({ type: 'text', layer: 'DOME-TEXT', at, h, s: String(s), ha });
  /** A circle at floor level, broken where a door stands. */
  const ringLine = (layer, r) => {
    if (!(r > 0)) return;
    if (!doors.length) { out.push({ type: 'circle', layer, c: [0, 0], r }); return; }
    doors.forEach((o, i) => { const next = doors[(i + 1) % doors.length]; let a1 = next.a0; while (a1 <= o.a1 + 1e-9) a1 += TAU; out.push({ type: 'arc', layer, c: [0, 0], r, a0: o.a1, a1 }); });
  };
  ringLine('DOME-SKIN', a);
  if (d.foam > 0) ringLine('DOME-SHELL', layout.rOut);
  ringLine('DOME-SHELL', layout.rIn);
  out.push({ type: 'circle', layer: 'DOME-BASE', c: [0, 0], r: layout.footing[1] });
  if (layout.footing[0] > 0) out.push({ type: 'circle', layer: 'DOME-BASE', c: [0, 0], r: layout.footing[0] });
  if (M.headroomRadius > 0 && M.headroomRadius < M.floorRadius - 1) out.push({ type: 'circle', layer: 'DOME-CLEAR', c: [0, 0], r: M.headroomRadius });
  for (const o of layout.kept) {
    for (const ang of [o.a0, o.a1]) out.push({ type: 'line', layer: 'DOME-OPENING', a: [layout.rIn * Math.cos(ang), layout.rIn * Math.sin(ang)], b: [a * Math.cos(ang), a * Math.sin(ang)] });
    const c = (o.a0 + o.a1) / 2, rt = a + 350;
    text([rt * Math.cos(c), rt * Math.sin(c)], (o.kind === 'door' ? W.door : W.window) + ' ' + o.n + ' ' + len(d, o.width) + ' x ' + len(d, o.height), 110);
  }
  // an opening's frame, where it reaches the floor: the thicker concrete at each side
  if (d.frameWidth > 0 && d.frameExtra > 0) for (const sct of layout.sectors) {
    if (!sct.frame || sct.opening || sct.frame.z0 > 0) continue;
    const rr = Math.max(0, layout.rIn - d.frameExtra), n = 6, pts = [];
    for (let i = 0; i <= n; i++) { const g = sct.a0 + ((sct.a1 - sct.a0) * i) / n; pts.push([layout.rIn * Math.cos(g), layout.rIn * Math.sin(g)]); }
    for (let i = n; i >= 0; i--) { const g = sct.a0 + ((sct.a1 - sct.a0) * i) / n; pts.push([rr * Math.cos(g), rr * Math.sin(g)]); }
    out.push({ type: 'poly', layer: 'DOME-OPENING', pts, closed: true });
  }
  const k = Math.min(400, a / 8);
  out.push({ type: 'line', layer: 'DOME-TEXT', a: [-k, 0], b: [k, 0] }, { type: 'line', layer: 'DOME-TEXT', a: [0, -k], b: [0, k] });
  text([0, a * 0.42], d.name, 250);
  text([0, a * 0.42 - 380], 'Ø ' + len(d, d.diameter), 180);
  text([0, -a * 0.3], W.floor + ' ' + sq(d, M.floorArea), 140);
  if (M.headroomRadius > 0 && M.headroomRadius < M.floorRadius - 1) text([0, -a * 0.3 - 260], W.headroom + ' ' + len(d, d.headroom) + ': ' + sq(d, M.headroomArea), 110);
  out.push({ type: 'dim', layer: 'DOME-DIMS', p1: [-a, 0], p2: [a, 0], loc: [0, -(layout.footing[1] + 700)], rot: 0 });
  return out;
}

/** The section through the axis: x across, level along y, set down by `drop` so it sits under the plan. */
export function sectionEnts(result, drop = 0, words = {}) {
  const d = result.design, { layout } = result.built, out = [];
  const W = { section: 'Section', ...words };
  const hs = d.stem, a = layout.a, tb = d.shell + d.thicken, y = (z) => z - drop;
  const poly = (layer, pts, closed = true) => { for (const sx of [1, -1]) out.push({ type: 'poly', layer, pts: pts.map(([r, z]) => [sx * r, y(z)]), closed }); };
  const up = (pts) => pts.map(([r, z]) => [r, z + hs]);
  const band = (outer, inner) => up(clipZ([...outer, ...inner.slice().reverse()], 0, 'above'));
  poly('DOME-SHELL', band(layout.concOut, layout.concIn));
  if (d.foam > 0) poly('DOME-SKIN', band(layout.form, layout.concOut));
  if (hs > 0) {
    poly('DOME-SHELL', [[a - d.foam - tb, 0], [a - d.foam, 0], [a - d.foam, hs], [a - d.foam - tb, hs]]);
    if (d.foam > 0) poly('DOME-SKIN', [[a - d.foam, 0], [a, 0], [a, hs], [a - d.foam, hs]]);
  }
  const [f0, f1] = layout.footing;
  poly('DOME-BASE', [[f0, -d.footingDepth], [f1, -d.footingDepth], [f1, 0], [f0, 0]]);
  if (d.slab > 0 && f0 > 0) out.push({ type: 'poly', layer: 'DOME-BASE', pts: [[-f0, y(-d.slab)], [f0, y(-d.slab)], [f0, y(0)], [-f0, y(0)]], closed: true });
  out.push({ type: 'line', layer: 'DOME-BASE', a: [-(f1 + 1500), y(0)], b: [f1 + 1500, y(0)] });
  const top = hs + d.height;
  out.push({ type: 'dim', layer: 'DOME-DIMS', p1: [-a, y(0)], p2: [a, y(0)], loc: [0, y(-d.footingDepth - 700)], rot: 0 });
  out.push({ type: 'dim', layer: 'DOME-DIMS', p1: [a, y(0)], p2: [a, y(top)], loc: [f1 + 900, y(top / 2)], rot: 90 });
  if (hs > 0) out.push({ type: 'dim', layer: 'DOME-DIMS', p1: [-a, y(0)], p2: [-a, y(hs)], loc: [-(f1 + 900), y(hs / 2)], rot: 90 });
  out.push({ type: 'text', layer: 'DOME-TEXT', at: [0, y(top + 500)], h: 200, s: W.section, ha: 'center' });
  out.push({ type: 'text', layer: 'DOME-TEXT', at: [0, y(Math.max(600, (top - d.foam - d.shell) / 2))], h: 140, s: len(d, result.built.metrics.clearHeight), ha: 'center' });
  return out;
}

/** Plan and section on one sheet: the plan round the origin, the section under it. */
export function sheetEnts(result, words = {}) {
  const d = result.design, f1 = result.built.layout.footing[1];
  return [...planEnts(result, words), ...sectionEnts(result, f1 + 2400 + d.stem + d.height, words)];
}

/** [x0, y0, x1, y1] of a list of entities. */
export function extent(ents) {
  const b = [Infinity, Infinity, -Infinity, -Infinity];
  const add = (p) => { b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]); b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]); };
  for (const e of ents) {
    if (e.type === 'line') { add(e.a); add(e.b); }
    else if (e.type === 'poly') e.pts.forEach(add);
    else if (e.type === 'circle' || e.type === 'arc') { add([e.c[0] - e.r, e.c[1] - e.r]); add([e.c[0] + e.r, e.c[1] + e.r]); }
    else if (e.type === 'text') add(e.at);
    else if (e.type === 'dim') { add(e.p1); add(e.p2); add(e.loc); }
  }
  return b;
}
