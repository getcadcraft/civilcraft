/* SPDX-License-Identifier: Apache-2.0 */
/**
 * draw.js — what a cabinet looks like on the drawing (0.8 SU.1035, session `sx-cabinet`). DOM-free; imports only model.js.
 * Returns plain CadCraft entities (doc.js shapes) for the add-on objects to draw.
 *
 *   planEnts(cab, R, k) → the cabinet seen from above, in its own frame: x along the wall (0 = its left end as you face it),
 *     y out from the wall (0 = the wall). The carcass, the fronts in front of it, its number and width; a wall cabinet is drawn
 *     crossed (its layer is dashed), a tall one with one diagonal. k = drawing units per rule unit (1 for a mm drawing in mm).
 *   elevEnts(items, R?, k, { textH }) → the front view of a run: items = [{ cab, R, x (its left end along the run, rule units) }]
 *     every cabinet's box, plinth, fronts (a door's hinge side shown by the two lines that meet at it, a drawer by a pull) and
 *     its number under it; x along the run, y up from the floor.
 *   sideEnts(cab, R, k) → the cabinet cut through its middle and seen from the side (step 5): x from the wall out (the front
 *     of the cabinet at its depth), y up from the floor. The side panel's outline (a notched kick shows its notch), the bottom,
 *     the top or the two rails, the back, every shelf, the plinth, the fronts and a drawer box with its slide; the number under it.
 *   runPlace(wallA, wallB, roomPt) → { x, y, ang, len } the run's frame: origin at the end that is on your left as you face
 *     the wall from the room side, x along the wall, y toward the room (a rotation, never a mirror)
 *   along(run, p) → { s (distance along), off (distance out from the wall) } of a point in the run's frame
 */
import { frontsOf, boxOf, cabinetParts, slideFor } from './model.js';

const ln = (x1, y1, x2, y2) => ({ type: 'line', x1, y1, x2, y2 });
const rect = (x, y, w, h) => ({ type: 'poly', pts: [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }], closed: true });
const fmt = (v) => { const r = Math.round(v * 100) / 100; return String(r); };

export function planEnts(cab, R, k = 1) {
  const W = cab.w * k, D = cab.d * k, F = R.frontT * k;
  const out = [rect(0, 0, W, D)];
  // fronts across the cabinet's face (doors or drawers: the same strip seen from above), with the reveals
  for (const f of frontsOf(cab, R).filter((g, i, a) => a.findIndex((h) => h.x === g.x) === i)) out.push(rect(f.x * k, D, f.w * k, F));
  if (cab.type === 'wall') out.push(ln(0, 0, W, D), ln(0, D, W, 0));
  if (cab.type === 'tall') out.push(ln(0, 0, W, D));
  // a wall cabinet hangs over a base one in plan: its words sit near the wall, a base cabinet's near the front, so they don't meet
  const mmK = k * (R.unit === 'in' ? 1 / 25.4 : 1);   // drawing units per mm
  const h = Math.min(D * 0.16, W * 0.12, 60 * mmK), wallish = cab.type === 'wall';
  const ty = wallish ? D * 0.5 : Math.max(D * 0.62, Math.min(D - h * 0.8, 400 * mmK));
  out.push({ type: 'text', x: W / 2, y: ty, h, rot: 0, s: cab.no, ha: 'center', va: 'middle' });
  out.push({ type: 'text', x: W / 2, y: ty - h * 1.5, h: h * 0.7, rot: 0, s: fmt(cab.w), ha: 'center', va: 'middle' });
  return out;
}

export function elevEnts(items, k = 1, { textH = null } = {}) {
  const out = [];
  let th = textH;
  if (!th) { const ws = items.map((i) => i.cab.w); th = (ws.length ? Math.min(...ws) : 600) * 0.08; }
  for (const { cab, R, x } of items) {
    const X = x * k, base = cab.elev * k, { kick, boxH } = boxOf(cab, R);
    const W = cab.w * k;
    // the box (behind the fronts) and the plinth, set back (drawn as its top line and its face)
    out.push(rect(X, base + kick * k, W, boxH * k));
    if (kick > 0) {
      if (R.kick === 'notch') out.push(ln(X, base, X, base + kick * k), ln(X + W, base, X + W, base + kick * k), ln(X, base, X + W, base));
      else out.push(rect(X, base, W, kick * k));
    }
    for (const f of frontsOf(cab, R)) {
      const fx = X + f.x * k, fy = base + f.y * k, fw = f.w * k, fh = f.h * k;
      out.push(rect(fx, fy, fw, fh));
      if (f.kind === 'door') {
        // the swing lines meet at the hinge side's middle
        const hx = f.hinge === 'right' ? fx + fw : fx, ox = f.hinge === 'right' ? fx : fx + fw;
        out.push(ln(ox, fy, hx, fy + fh / 2), ln(hx, fy + fh / 2, ox, fy + fh));
      } else {
        const pw = Math.min(fw * 0.3, 160 * k * (R.unit === 'in' ? 1 / 25.4 : 1)), py = fy + fh * 0.7;
        out.push(ln(fx + (fw - pw) / 2, py, fx + (fw + pw) / 2, py));
      }
    }
    out.push({ type: 'text', x: X + W / 2, y: base - th * 1.6, h: th, rot: 0, s: cab.no, ha: 'center', va: 'middle' });
  }
  return out;
}

export function runPlace(a, b, room) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
  if (!(len > 0)) return null;
  const ux = dx / len, uy = dy / len;
  const left = (room.x - a.x) * -uy + (room.y - a.y) * ux;   // + = the room is on the left of a → b
  if (left >= 0) return { x: a.x, y: a.y, ang: Math.atan2(uy, ux), len };
  return { x: b.x, y: b.y, ang: Math.atan2(-uy, -ux), len };
}

export function along(run, p) {
  const c = Math.cos(run.ang), s = Math.sin(run.ang), dx = p.x - run.x, dy = p.y - run.y;
  return { s: dx * c + dy * s, off: -dx * s + dy * c };
}

/** The cabinet in section from the side: x out from the wall, y up from the floor (rule units × k). */
export function sideEnts(cab, R, k = 1) {
  const { kick, boxH, backDepth, panelD } = boxOf(cab, R);
  const out = [];
  const t = R.t, px0 = R.back === 'applied' ? R.backT : 0, px1 = cab.d, top = kick + boxH;
  const X = (v) => v * k, Y = (v) => (cab.elev + v) * k;
  const R_ = (x0, y0, x1, y1) => rect(X(x0), Y(y0), X(x1 - x0), Y(y1) - Y(y0));
  const notch = kick > 0 && R.kick === 'notch';
  // the side panel (the cut face): a notched kick runs to the floor with a corner cut out
  if (notch) out.push({ type: 'poly', closed: true, pts: [[px0, 0], [px1 - R.kickSetback, 0], [px1 - R.kickSetback, kick], [px1, kick], [px1, top], [px0, top]].map(([x, y]) => ({ x: X(x), y: Y(y) })) });
  else out.push(R_(px0, kick, px1, top));
  // bottom, and the top or the two rails (the panels between the sides, seen end-on at the middle)
  out.push(R_(px0, kick, px1, kick + t));
  const hasTop = cab.type === 'wall' || cab.type === 'tall';
  if (hasTop) out.push(R_(px0, top - t, px1, top));
  else out.push(R_(px1 - R.railDepth, top - t, px1, top), R_(px0, top - t, px0 + R.railDepth, top));
  // the back
  if (R.back === 'applied') out.push(R_(0, kick, R.backT, top));
  else if (R.back === 'groove') out.push(R_(R.backSetback, kick + t - R.groove, R.backSetback + R.backT, hasTop ? top - t + R.groove : top - t));
  else out.push(R_(R.backSetback, kick + t, R.backSetback + R.backT, hasTop ? top - t : top - t));
  // the shelves, spread evenly between the bottom and the top (or the rails)
  const inside = cabinetParts(cab, R).filter((p) => p.role === 'shelf' || p.role === 'shelf-fixed');
  const innerBottom = kick + t, innerTop = top - t;
  const sx0 = px0 + backDepth + (R.back === 'applied' ? 0 : 0), sx1 = px1 - R.shelfFront;
  for (const p of inside) {
    const n = p.qty;
    for (let i = 0; i < n; i++) {
      const y = p.role === 'shelf-fixed' ? (innerBottom + innerTop) / 2 - t / 2 : innerBottom + (innerTop - innerBottom) * (i + 1) / (n + 1) - t / 2;
      out.push(R_(sx0, y, p.role === 'shelf-fixed' ? px1 : sx1, y + t));
    }
  }
  // the plinth, set back
  if (kick > 0 && R.plinth) { const x = notch ? px1 - R.kickSetback : px1 - R.kickSetback - t; out.push(R_(x, 0, x + t, kick)); }
  // the fronts, standing in front of the box; drawers also show their box and slide
  const L = cab.type === 'drawers' ? slideFor(cab, R) : 0;
  for (const f of frontsOf(cab, R)) {
    out.push(R_(px1, f.y, px1 + R.frontT, f.y + f.h));
    if (f.kind === 'drawer' && L > 0) {
      const bh = f.h - R.drawerHClear, y0 = f.y + (f.h - bh) / 2;
      if (bh > 0) out.push(R_(px1 - L, y0, px1, y0 + bh));
    }
  }
  const th = Math.max(6, cab.d * 0.06);
  out.push({ type: 'text', x: X(cab.d / 2), y: Y(0) - th * 1.6 * k, h: th * k, rot: 0, s: cab.no, ha: 'center', va: 'middle' });
  return out;
}
