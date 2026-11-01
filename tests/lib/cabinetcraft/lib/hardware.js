/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hardware.js — drilling and the hardware list of a cabinet (0.8 SU.1035 step 5, session `fab-08`). DOM-free; imports model.js.
 * The 32 mm system: a hole row 37 mm from the front and the back edge of a side, 32 mm apart, the first one 64 mm from the end;
 * cup hinges bored 5 mm from the door's edge (centre = edge + 5 + 35/2), the hinge plate on two system holes of the side.
 * Every number is a rule (model.js RULES: sysLine, pitch, sysStart, cupD, cupEdge, hingeInset, hingeSteps …), so a shop changes them.
 *
 *   drillPlan(cab, R) → [{ id, role, name (word key), qty, face, holes: [{ x, y, d, depth, kind }], note }]
 *     one entry per part that is drilled, with the part's id from cabinetParts. A part's frame: x along its length from the end
 *     the cut list starts at, y across its width. Sides: y from the BACK edge to the front edge, face 'inside', x from the
 *     floor (notched kick) or from the bottom of the box. Doors: face 'back' (the inside), y from the HINGE edge. A pair of
 *     doors is one part of quantity 2: the second is the mirror image (drilled from its own hinge edge). Kinds: 'shelf-pin',
 *     'plate', 'cup', 'slide'. A side is one part of quantity 2 too; `side` on a hole group says which sides take it
 *     ('both' | 'left' | 'right': the hinge side only).
 *   hardwareList(items) → [{ key, item (word key), spec, qty }]   items = [{ cab, R }]; keys hinge, plate, shelf-pin, slide,
 *     leg, bracket, pull, fastener
 *   hingeCount(h, R) → 2 … 5   by door height against R.hingeSteps
 *   hingeSpots(h, R) → [x]   positions along a door of height h
 *   drillCsv(items, { head }) → CSV text (one row per hole) · hardwareCsv(rows, { head })
 */
import { cabinetParts, cleanCabinet, frontsOf, boxOf, slideFor } from './model.js';

const r6 = (v) => { const r = Math.round(v * 1e6) / 1e6; return Object.is(r, -0) ? 0 : r; };

export function hingeCount(h, R) {
  const steps = R.hingeSteps || [];
  let n = 2;
  for (const s of steps) if (h > s + 1e-9) n++;
  return n;
}
export function hingeSpots(h, R) {
  const n = hingeCount(h, R), a = R.hingeInset, b = h - R.hingeInset;
  if (b <= a) return [h / 2];
  return Array.from({ length: n }, (_, i) => r6(a + (b - a) * i / (n - 1)));
}

/** The grid of a side: heights (from the floor or the box bottom) of the system holes. */
function gridX(len, R, x0 = 0) {
  const out = [];
  for (let x = x0 + R.sysStart; x <= x0 + len - R.sysStart + 1e-9; x += R.pitch) out.push(r6(x));
  return out;
}
const snap = (v, grid) => grid.length ? grid.reduce((b, g) => (Math.abs(g - v) < Math.abs(b - v) ? g : b), grid[0]) : v;

export function drillPlan(cabIn, R) {
  const cab = cleanCabinet(cabIn, R);
  if (!cab) return [];
  const parts = cabinetParts(cab, R);
  const { kick, boxH, panelD } = boxOf(cab, R);
  const out = [];
  const notch = kick > 0 && R.kick === 'notch';
  const side = parts.find((p) => p.role === 'side');
  const fronts = frontsOf(cab, R);
  if (side) {
    const x0 = notch ? kick : 0, len = notch ? side.length - kick : side.length;
    const grid = gridX(len, R, x0);
    const yF = r6(side.width - R.sysLine), yB = r6(R.sysLine);
    const holes = [];
    // the box's own bottom edge on the side is at x0; fronts are measured from the floor, so subtract what the side does not cover
    const base = notch ? 0 : kick;        // distance from the floor to the side's x = 0
    if (cab.shelves > 0 && cab.type !== 'drawers') for (const x of grid) for (const y of [yF, yB]) holes.push({ x, y, d: R.pinD, depth: R.pinDepth, kind: 'shelf-pin' });
    const note = [];
    // hinge plates (two system holes at each hinge), on the hinge side only
    const plates = new Map();     // side → holes
    const addPlate = (which, f) => {
      for (const hx of hingeSpots(f.h, R)) {
        const centre = f.y + hx - base;
        const lo = snap(centre - R.pitch / 2, grid);
        for (const x of [lo, r6(lo + R.pitch)]) {
          const list = plates.get(which) || [];
          if (!list.some((q) => Math.abs(q.x - x) < 1e-6)) list.push({ x, y: yF, d: R.plateD, depth: R.plateDepth, kind: 'plate' });
          plates.set(which, list);
        }
      }
    };
    for (const f of fronts) if (f.kind === 'door') addPlate(f.hinge === 'right' ? 'right' : 'left', f);
    // drawer slides: a front and a rear fixing hole per drawer box on each side
    const L = cab.type === 'drawers' ? slideFor(cab, R) : 0;
    const slides = [];
    if (L > 0) for (const f of fronts) {
      const x = snap(f.y + R.pitch - base, grid);
      slides.push({ x, y: yF, d: R.slideHole, depth: R.pinDepth, kind: 'slide' }, { x, y: r6(Math.max(R.sysLine, yF - (L - 2 * R.sysLine))), d: R.slideHole, depth: R.pinDepth, kind: 'slide' });
    }
    const groups = [{ side: 'both', holes: holes.concat(slides) }];
    for (const [which, list] of plates) groups.push({ side: which, holes: list });
    const all = groups.flatMap((g) => g.holes.map((h) => ({ ...h, side: g.side })));
    if (all.length) out.push({ id: side.id, role: 'side', name: side.name, qty: side.qty, face: 'inside', holes: all, note: plates.size ? 'plates' : '' });
  }
  // door cups on the back of each door size (a pair = one part of qty 2, the second mirrored)
  const doorPart = parts.find((p) => p.role === 'door');
  if (doorPart) {
    const doors = fronts.filter((f) => f.kind === 'door');
    const f0 = doors[0];
    if (f0) {
      const holes = hingeSpots(f0.h, R).map((x) => ({ x, y: r6(R.cupEdge + R.cupD / 2), d: R.cupD, depth: R.cupDepth, kind: 'cup' }));
      const pair = new Set(doors.map((f) => f.hinge)).size > 1;
      out.push({ id: doorPart.id, role: 'door', name: doorPart.name, qty: doorPart.qty, face: 'back', holes, note: pair ? 'mirrored' : '' });
    }
  }
  return out;
}

export function hardwareList(items) {
  const rows = new Map();
  const add = (key, item, spec, qty) => { if (!(qty > 0)) return; const k = key + '|' + spec; const r = rows.get(k) || { key, item, spec, qty: 0 }; r.qty += qty; rows.set(k, r); };
  for (const { cab: c, R } of items) {
    const cab = cleanCabinet(c, R);
    if (!cab) continue;
    const fronts = frontsOf(cab, R);
    const mm = R.unit === 'in' ? 25.4 : 1;
    for (const f of fronts) if (f.kind === 'door') {
      const n = hingeCount(f.h, R);
      add('hinge', 'hw.hinge', '', n);
      add('plate', 'hw.plate', '', n);
    }
    if (cab.type !== 'drawers' && cab.shelves > 0) add('shelf-pin', 'hw.shelf-pin', '', cab.shelves * R.pinsPerShelf);
    const L = cab.type === 'drawers' ? slideFor(cab, R) : 0;
    if (L > 0) add('slide', 'hw.slide', String(L), fronts.length);
    if (cab.type !== 'wall' && R.kick === 'legs') add('leg', 'hw.leg', '', cab.w * mm > R.legsWide * mm ? 6 : 4);
    if (cab.type === 'wall') add('bracket', 'hw.bracket', '', 2);
    if (R.pulls) add('pull', 'hw.pull', '', fronts.length);
    // fasteners: two per joint — bottom, top (or two rails), a fixed shelf; each joint meets both sides
    const parts = cabinetParts(cab, R);
    const joints = parts.reduce((a, p) => a + (['bottom', 'top', 'rail', 'shelf-fixed'].includes(p.role) ? 2 * p.qty : 0), 0);
    add('fastener', 'hw.fastener', '', joints * 2);
  }
  return [...rows.values()].sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key) || a.spec.localeCompare(b.spec, undefined, { numeric: true }));
}
const ORDER = ['hinge', 'plate', 'shelf-pin', 'slide', 'leg', 'bracket', 'pull', 'fastener'];

const q = (v) => { const s = String(v ?? ''); return /[",\n\r]/.test(s) || /^[=+\-@]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
export function drillCsv(items, { head = {}, word = (k) => k } = {}) {
  const cols = ['part', 'name', 'face', 'kind', 'x', 'y', 'diameter', 'depth', 'side', 'qty', 'note'];
  const lines = [cols.map((c) => q(head[c] ?? c)).join(',')];
  for (const { cab, R } of items) for (const pl of drillPlan(cab, R)) for (const h of pl.holes) lines.push([pl.id, word(pl.name), pl.face, h.kind, r6(h.x), r6(h.y), h.d, h.depth, h.side || 'both', pl.qty, pl.note].map(q).join(','));
  return lines.join('\r\n') + '\r\n';
}
export function hardwareCsv(rows, { head = {}, word = (k) => k } = {}) {
  const cols = ['item', 'spec', 'qty'];
  return [cols.map((c) => q(head[c] ?? c)).join(','), ...rows.map((r) => [word(r.item), r.spec, r.qty].map(q).join(','))].join('\r\n') + '\r\n';
}
