/* SPDX-License-Identifier: Apache-2.0 */
/**
 * model.js — cabinets as boxes and construction rules → parts (0.8 SU.1035, session `sx-cabinet`). DOM-free and import-free.
 * Default construction (owner decision O1's default): **frameless, 32 mm system** — sides run the full box height, bottom and
 * top (or two rails on a base cabinet) sit between the sides, the back sits in grooves, adjustable shelves, full-overlay doors
 * and drawer fronts with an even reveal, a box on adjustable legs with a plinth board. Every rule is a number in `RULES`, so a
 * shop changes them, not the code. Units: one rule set per unit ('mm', 'in'); all sizes in a cabinet are in that unit.
 *
 *   RULES.mm · RULES.in · rulesFor(unit, overrides) → a rule set
 *   TYPES ['base', 'drawers', 'wall', 'tall'] · SIZES[unit][type] → default { w, h, d }
 *   cleanCabinet(c, R) → { no, type, w, h, d, shelves, doors ('auto' | 1 | 2), hinge ('left' | 'right'), drawers (count),
 *                         fronts ([heights] | null), elev (height of its bottom above the floor) } | null
 *   cabinetParts(cab, R) → lib/cutlist parts ({ id 'B01-03', name key, group, length, width, thickness, material, grain,
 *                          qty, band, outline?, role }) — `name` is a word key (part.side …) the add-on translates
 *   frontsOf(cab, R) → [{ kind 'door' | 'drawer', x, y, w, h, hinge? }] in the cabinet's front view (x from its left side,
 *                       y from its bottom, the plinth included); the elevation drawing and the door parts agree by construction
 *   boxOf(cab, R) → { boxH, kick, iw, backDepth (what the back takes off the inside depth) }
 *   problems(cab, R) → [{ code, vars }]   (too small for its parts, a drawer with no slide that fits, …)
 *
 * How the sizes come out (t = carcass thickness, iw = w − 2t, boxH = h − plinth for base/drawers/tall on legs):
 *   side        boxH × d (back applied: d − backT), front edge (L1) banded
 *   bottom/top  iw × the side's depth, L1 banded · base rails iw × railDepth (front rail L1 banded)
 *   back        groove: (iw + 2·groove) × (boxH − t + groove) under rails, (boxH − 2t + 2·groove) with a top;
 *               between: iw × (boxH − t) or (boxH − 2t); applied: w × boxH
 *   shelf       (iw − 2·shelfClear) × (d − backSetback − backT − shelfFront), L1 banded (applied back: d − backT − shelfFront)
 *   doors       one (w − reveal) wide, or a pair each (w − 2·reveal) / 2 when w > maxDoorW; height boxH − reveal, or two
 *               rows each (boxH − 2·reveal) / 2 when that is taller than maxDoorH (a fixed shelf between); banded all round
 *   drawers     n fronts (w − reveal) × (boxH − n·reveal) / n (or the heights given); a box per drawer: width iw − 2·slideGap,
 *               depth = the longest slide that fits, height = front − drawerHClear; sides L × bh, ends (bw − 2·dt) × bh,
 *               bottom (bw − 2·dt + 2·dGroove) × (L − 2·dt + 2·dGroove)
 */

export const TYPES = ['base', 'drawers', 'wall', 'tall'];
/**
 * Material and banding names: word keys by default (the add-on writes them in the person's language with the thickness, e.g.
 * "Carcass 18 mm"); a shop's own names (rulesFor overrides) are kept as typed. A cut list groups by name AND thickness.
 */
const MATS = { carcass: 'mat.carcass', backMat: 'mat.back', frontMat: 'mat.fronts', drawerMat: 'mat.drawer', drawerBottomMat: 'mat.drawer-bottom' };
export const isWordKey = (s) => /^(mat|band|part)\.[a-z-]+$/.test(String(s));
const PREFIX = { base: 'B', drawers: 'D', wall: 'W', tall: 'T' };

/** The 32 mm system's numbers (step 5): drilling and hardware. mm are the source; inches are the same distances (k = 1 / 25.4). */
const hw = (k) => {
  const r = (v) => Math.round(v * k * 1e4) / 1e4;
  return {
    sysLine: r(37), pitch: r(32), sysStart: r(64), pinD: r(5), pinDepth: r(12), pinsPerShelf: 4,
    cupD: r(35), cupDepth: r(12.5), cupEdge: r(5), hingeInset: r(100), hingeSteps: [r(1000), r(1600), r(2200)],
    plateD: r(5), plateDepth: r(12), slideHole: r(5), legsWide: r(900), pulls: true,
  };
};

export const RULES = {
  mm: {
    unit: 'mm', t: 18, back: 'groove', backT: 8, groove: 8, backSetback: 16, reveal: 3,
    kick: 'legs', kickH: 150, kickSetback: 50, plinth: true, railDepth: 100,
    shelfClear: 1, shelfFront: 20, maxDoorW: 600, maxDoorH: 1400, frontT: 18,
    drawerT: 15, drawerBottomT: 6, drawerGroove: 6, slideGap: 13, slideLengths: [250, 300, 350, 400, 450, 500, 550], drawerBackClear: 10, drawerHClear: 40, drawerMinH: 60,
    wallElev: 1400, ...hw(1),
    ...MATS, bandCarcass: { code: 'band.edge', thickness: 1 }, bandFront: { code: 'band.edge', thickness: 2 }, bandDrawer: { code: 'band.edge', thickness: 1 },
  },
  in: {
    unit: 'in', t: 0.75, back: 'groove', backT: 0.25, groove: 0.25, backSetback: 0.5, reveal: 0.125,
    kick: 'legs', kickH: 4, kickSetback: 2, plinth: true, railDepth: 4,
    shelfClear: 0.0625, shelfFront: 0.75, maxDoorW: 24, maxDoorH: 55, frontT: 0.75,
    drawerT: 0.5, drawerBottomT: 0.25, drawerGroove: 0.25, slideGap: 0.5, slideLengths: [12, 14, 16, 18, 20, 22], drawerBackClear: 0.5, drawerHClear: 1.5, drawerMinH: 2.5,
    wallElev: 54, ...hw(1 / 25.4),
    ...MATS, bandCarcass: { code: 'band.edge', thickness: 0.02 }, bandFront: { code: 'band.edge', thickness: 0.08 }, bandDrawer: { code: 'band.edge', thickness: 0.02 },
  },
};
export const SIZES = {
  mm: { base: { w: 600, h: 870, d: 560 }, drawers: { w: 600, h: 870, d: 560 }, wall: { w: 600, h: 720, d: 320 }, tall: { w: 600, h: 2100, d: 560 } },
  in: { base: { w: 24, h: 34.5, d: 23.25 }, drawers: { w: 18, h: 34.5, d: 23.25 }, wall: { w: 24, h: 30, d: 12 }, tall: { w: 24, h: 84, d: 23.25 } },
};
const SHELVES = { base: 1, drawers: 0, wall: 2, tall: 4 };

const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const r6 = (v) => { const r = Math.round(v * 1e6) / 1e6; return Object.is(r, -0) ? 0 : r; };

export function rulesFor(unit = 'mm', over = {}) {
  const base = RULES[unit === 'in' ? 'in' : 'mm'];
  const R = { ...structuredClone(base) };
  for (const [k, v] of Object.entries(over || {})) {
    if (!(k in base) || k === 'unit') continue;
    if (typeof base[k] === 'number') { const n = Number(v); if (Number.isFinite(n) && n >= 0) R[k] = n; }
    else if (typeof base[k] === 'string') { if (k === 'back') { if (['groove', 'between', 'applied'].includes(v)) R[k] = v; } else if (k === 'kick') { if (['legs', 'notch', 'none'].includes(v)) R[k] = v; } else if (String(v).trim()) R[k] = String(v).trim().slice(0, 60); }
    else if (typeof base[k] === 'boolean') R[k] = !!v;
    else if (Array.isArray(base[k])) { const a = Array.isArray(v) ? v.map(Number).filter((x) => x > 0).sort((a1, b1) => a1 - b1) : []; if (a.length) R[k] = a; }
    else if (base[k] && typeof base[k] === 'object') { const th = Number(v?.thickness); R[k] = { code: String(v?.code || base[k].code).slice(0, 40), thickness: Number.isFinite(th) && th >= 0 ? th : base[k].thickness }; }
  }
  return R;
}

export function cleanCabinet(c, R = RULES.mm) {
  if (!c || typeof c !== 'object') return null;
  const type = TYPES.includes(c.type) ? c.type : 'base';
  const S = SIZES[R.unit === 'in' ? 'in' : 'mm'][type];
  const w = num(c.w, S.w), h = num(c.h, S.h), d = num(c.d, S.d);
  if (!(w > 0 && h > 0 && d > 0)) return null;
  const doors = c.doors === 1 || c.doors === 2 || c.doors === 0 ? c.doors : 'auto';
  const fronts = Array.isArray(c.fronts) ? c.fronts.map(Number).filter((x) => x > 0).slice(0, 8) : null;
  return {
    no: String(c.no || PREFIX[type] + '01').replace(/[^A-Za-z0-9-]/g, '').slice(0, 12) || PREFIX[type] + '01',
    type, w, h, d,
    shelves: Math.max(0, Math.min(12, Math.round(num(c.shelves, SHELVES[type])))),
    doors, hinge: c.hinge === 'right' ? 'right' : 'left',
    drawers: Math.max(1, Math.min(8, Math.round(num(c.drawers, 3)))),
    fronts: fronts && fronts.length ? fronts : null,
    elev: num(c.elev, type === 'wall' ? R.wallElev : 0),
    name: String(c.name || '').slice(0, 60),
  };
}

export const prefixOf = (type) => PREFIX[type] || 'B';
const hasKick = (cab, R) => cab.type !== 'wall' && R.kick !== 'none';
const hasTop = (cab) => cab.type === 'wall' || cab.type === 'tall';

export function boxOf(cab, R) {
  const kick = hasKick(cab, R) ? R.kickH : 0;
  const boxH = cab.h - kick;
  const iw = cab.w - 2 * R.t;
  const backDepth = R.back === 'applied' ? 0 : R.backSetback + R.backT;   // inside depth lost to the back (applied: outside the panels)
  const panelD = R.back === 'applied' ? cab.d - R.backT : cab.d;
  return { kick, boxH, iw, backDepth, panelD };
}

/** The fronts in the cabinet's front view: x from its left side, y from its bottom (floor for base/tall, its own bottom for wall). */
export function frontsOf(cab, R) {
  const { kick, boxH } = boxOf(cab, R);
  const rv = R.reveal, out = [];
  if (cab.type === 'drawers') {
    const n = cab.fronts ? cab.fronts.length : cab.drawers;
    const free = boxH - n * rv;
    const hs = cab.fronts ? cab.fronts : Array.from({ length: n }, () => free / n);
    let y = kick + boxH - rv / 2;            // top down
    for (const fh of hs) { out.push({ kind: 'drawer', x: rv / 2, y: r6(y - fh), w: r6(cab.w - rv), h: r6(fh) }); y -= fh + rv; }
    return out;
  }
  if (cab.doors === 0) return out;
  const pair = cab.doors === 2 || (cab.doors === 'auto' && cab.w - rv > R.maxDoorW);
  const rows = boxH - rv > R.maxDoorH ? 2 : 1;
  const dh = rows === 2 ? (boxH - 2 * rv) / 2 : boxH - rv;
  for (let r = 0; r < rows; r++) {
    const y = kick + rv / 2 + r * (dh + rv);
    if (pair) {
      const dw = (cab.w - 2 * rv) / 2;
      out.push({ kind: 'door', x: rv / 2, y: r6(y), w: r6(dw), h: r6(dh), hinge: 'left' });
      out.push({ kind: 'door', x: r6(rv / 2 + dw + rv), y: r6(y), w: r6(dw), h: r6(dh), hinge: 'right' });
    } else out.push({ kind: 'door', x: rv / 2, y: r6(y), w: r6(cab.w - rv), h: r6(dh), hinge: cab.hinge });
  }
  return out;
}

/** The longest slide that fits the inside depth, or 0. */
export function slideFor(cab, R) {
  const { backDepth, panelD } = boxOf(cab, R);
  const room = panelD - backDepth - R.drawerBackClear;
  let best = 0;
  for (const L of R.slideLengths) if (L <= room + 1e-9) best = L;
  return best;
}

export function cabinetParts(cabIn, R = RULES.mm) {
  const cab = cleanCabinet(cabIn, R);
  if (!cab) return [];
  const { t, backT, groove } = R;
  const { kick, boxH, iw, backDepth, panelD } = boxOf(cab, R);
  const out = [];
  let seq = 0;
  const add = (role, name, length, width, thickness, material, extra = {}) => {
    if (!(length > 0 && width > 0)) return;
    seq++;
    out.push({ id: cab.no + '-' + String(seq).padStart(2, '0'), name, role, group: cab.no, length: r6(length), width: r6(width), thickness, material, grain: 'length', qty: 1, band: {}, ...extra });
  };
  const L1 = (b) => ({ l1: b });
  const all = (b) => ({ l1: b, l2: b, w1: b, w2: b });
  // sides: a notched toe kick runs the sides to the floor with the kick cut out of the front bottom corner
  const notch = kick > 0 && R.kick === 'notch';
  const sideL = notch ? cab.h : boxH;
  const side = { qty: 2, band: L1(R.bandCarcass) };
  if (notch) {
    // x along the length (up the side, from the floor), y across the width (from the back edge to the front edge, L1 at y = width)
    // the outline is at the CUT size (lib/cutlist nests outlines as given): the front edge's banding comes off the width
    const a = R.kickSetback, W = r6(panelD - R.bandCarcass.thickness);
    side.outline = [[{ x: 0, y: 0 }, { x: sideL, y: 0 }, { x: sideL, y: W }, { x: kick, y: W }, { x: kick, y: W - a }, { x: 0, y: W - a }]];
  }
  add('side', 'part.side', sideL, panelD, t, R.carcass, side);
  add('bottom', 'part.bottom', iw, panelD, t, R.carcass, { band: L1(R.bandCarcass) });
  if (hasTop(cab)) add('top', 'part.top', iw, panelD, t, R.carcass, { band: L1(R.bandCarcass) });
  else {
    add('rail', 'part.rail-front', iw, R.railDepth, t, R.carcass, { band: L1(R.bandCarcass) });
    add('rail', 'part.rail-back', iw, R.railDepth, t, R.carcass);
  }
  const ends = hasTop(cab) ? 2 : 1;      // panels the back meets top and bottom (rails don't take a groove)
  if (R.back === 'groove') add('back', 'part.back', iw + 2 * groove, boxH - ends * t + ends * groove, backT, R.backMat, { grain: 'none' });
  else if (R.back === 'between') add('back', 'part.back', iw, boxH - ends * t, backT, R.backMat, { grain: 'none' });
  else add('back', 'part.back', cab.w, boxH, backT, R.backMat, { grain: 'none' });

  const fronts = frontsOf(cab, R);
  const insideD = panelD - backDepth;
  if (cab.type !== 'drawers') {
    if (fronts.length && cab.type === 'tall' && fronts.some((f) => f.y > kick + boxH / 2 - 1e-9))   // two rows of doors: a fixed shelf between
      add('shelf-fixed', 'part.shelf-fixed', iw, insideD, t, R.carcass, { band: L1(R.bandCarcass) });
    if (cab.shelves) add('shelf', 'part.shelf', iw - 2 * R.shelfClear, insideD - R.shelfFront, t, R.carcass, { qty: cab.shelves, band: L1(R.bandCarcass) });
    // doors: the same size merge into one part with a quantity (grain up the door)
    const sizes = new Map();
    for (const f of fronts) { const k = f.h + 'x' + f.w; sizes.set(k, { f, n: (sizes.get(k)?.n || 0) + 1 }); }
    for (const { f, n } of sizes.values()) add('door', 'part.door', f.h, f.w, R.frontT, R.frontMat, { qty: n, band: all(R.bandFront) });
  } else {
    const sizes = new Map();
    for (const f of fronts) { const k = f.h + 'x' + f.w; sizes.set(k, { f, n: (sizes.get(k)?.n || 0) + 1 }); }
    // drawer fronts: grain across (along the width), as most shops run it
    for (const { f, n } of sizes.values()) add('drawer-front', 'part.drawer-front', f.w, f.h, R.frontT, R.frontMat, { qty: n, band: all(R.bandFront) });
    const L = slideFor(cab, R), bw = iw - 2 * R.slideGap, dt = R.drawerT, g = R.drawerGroove;
    if (L > 0) {
      const boxes = new Map();
      for (const f of fronts) { const bh = r6(f.h - R.drawerHClear); if (bh >= R.drawerMinH) boxes.set(bh, (boxes.get(bh) || 0) + 1); }
      for (const [bh, n] of boxes) {
        add('drawer-side', 'part.drawer-side', L, bh, dt, R.drawerMat, { qty: 2 * n, band: L1(R.bandDrawer), meta: { slide: L } });
        add('drawer-end', 'part.drawer-end', bw - 2 * dt, bh, dt, R.drawerMat, { qty: 2 * n, band: L1(R.bandDrawer) });
        add('drawer-bottom', 'part.drawer-bottom', bw - 2 * dt + 2 * g, L - 2 * dt + 2 * g, R.drawerBottomT, R.drawerBottomMat, { qty: n, grain: 'none' });
      }
    }
  }
  if (kick > 0 && R.plinth) {
    if (notch) add('plinth', 'part.kick-board', iw, kick, t, R.carcass);
    else add('plinth', 'part.plinth', cab.w, kick, t, R.carcass);
  }
  return out;
}

export function problems(cabIn, R = RULES.mm) {
  const cab = cleanCabinet(cabIn, R);
  if (!cab) return [{ code: 'no-size', vars: {} }];
  const out = [];
  const { boxH, iw, backDepth, panelD } = boxOf(cab, R);
  if (iw <= 0) out.push({ code: 'too-narrow', vars: { min: 2 * R.t } });
  if (boxH <= 2 * R.t) out.push({ code: 'too-low', vars: { min: 2 * R.t + (cab.type === 'wall' ? 0 : R.kickH) } });
  if (panelD - backDepth <= R.shelfFront) out.push({ code: 'too-shallow', vars: { min: backDepth + R.shelfFront } });
  if (cab.type === 'drawers') {
    if (!slideFor(cab, R)) out.push({ code: 'no-slide', vars: { min: R.slideLengths[0] + backDepth + R.drawerBackClear } });
    const fr = frontsOf(cab, R);
    if (fr.some((f) => f.h - R.drawerHClear < R.drawerMinH)) out.push({ code: 'drawer-low', vars: { min: R.drawerMinH + R.drawerHClear } });
    if (cab.fronts) { const sum = cab.fronts.reduce((a, b) => a + b, 0) + cab.fronts.length * R.reveal; if (sum > boxH + 1e-9) out.push({ code: 'fronts-tall', vars: { sum: r6(sum), max: r6(boxH) } }); }
  }
  return out;
}
