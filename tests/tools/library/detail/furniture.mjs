/* SPDX-License-Identifier: Apache-2.0 */
/**
 * furniture.mjs — finer 3D and plan detail for the generic furniture (seating, tables, desks, beds). Original geometry built
 * from boxes, tubes and ellipsoids (figure.mjs). Sizes come from the object's own body box (mm, z up, plan front at −Y).
 *
 *   furnitureDetail(name, b) → { tris: [[a,b,c]…], plan: [shape…], clear: [], changelog }
 *
 * Shapes in `plan` use the generator's kinds: rect, circle, line, ellipse (see detail.mjs).
 */
import { box, tube, ellipsoid } from './figure.mjs';

const legR = (w) => Math.max(18, Math.min(30, w * 0.035));

/** Four legs at the corners, inset by `inset`, from z0 up to z1. */
function legs(b, inset, z0, z1, r) {
  const X0 = b.x, X1 = b.x + b.w, Y0 = b.y, Y1 = b.y + b.d;
  const out = [];
  for (const [x, y] of [[X0 + inset, Y0 + inset], [X1 - inset, Y0 + inset], [X0 + inset, Y1 - inset], [X1 - inset, Y1 - inset]]) {
    out.push(...tube([[x, y, z0], [x, y, z1]], [r, r], 8));
  }
  return out;
}

/** A dining or side chair: seat, four legs, a back with two uprights, optional arms. */
function chair(b, { arms = false, height = 460, stool = false } = {}) {
  const tris = [], plan = [];
  const X0 = b.x, X1 = b.x + b.w, Y0 = b.y, Y1 = b.y + b.d, H = b.h;
  const seatZ = stool ? H - 90 : height;
  const t = 38;
  tris.push(...box(X0 + 20, Y0 + 20, seatZ, X1 - 20, Y1 - 20, seatZ + t));          // seat
  tris.push(...legs(b, 40, 0, seatZ, legR(b.w)));
  if (!stool) {
    // back: two uprights and a top rail and a panel
    const backY0 = Y1 - 60, backY1 = Y1 - 30;
    tris.push(...tube([[X0 + 40, backY0, seatZ], [X0 + 40, backY0, H]], [legR(b.w), legR(b.w)], 8));
    tris.push(...tube([[X1 - 40, backY0, seatZ], [X1 - 40, backY0, H]], [legR(b.w), legR(b.w)], 8));
    tris.push(...box(X0 + 40, backY0, H - 240, X1 - 40, backY1, H - 150));          // top rail
    tris.push(...box(X0 + 60, backY0 + 10, seatZ + t, X1 - 60, backY0 + 16, H - 180)); // back panel
    plan.push({ kind: 'rect', x0: X0 + 40, y0: backY0, x1: X1 - 40, y1: backY1 });
  }
  if (arms) {
    for (const x of [X0 + 25, X1 - 45]) {
      tris.push(...box(x, Y0 + 40, seatZ + t, x + 20, Y1 - 60, seatZ + t + 180));  // arm pad
      tris.push(...tube([[x + 10, Y0 + 60, seatZ], [x + 10, Y0 + 60, seatZ + t + 180]], [18, 18], 6));
    }
    plan.push({ kind: 'rect', x0: X0 + 25, y0: Y0 + 40, x1: X0 + 45, y1: Y1 - 60 }, { kind: 'rect', x0: X1 - 45, y0: Y0 + 40, x1: X1 - 25, y1: Y1 - 60 });
  }
  plan.push({ kind: 'rect', x0: X0 + 20, y0: Y0 + 20, x1: X1 - 20, y1: Y1 - 20 });
  return { tris, plan };
}

/** A sofa or loveseat: base, cushions per seat, back cushions, arms and short legs. */
function sofa(b, seats) {
  const tris = [], plan = [];
  const X0 = b.x, X1 = b.x + b.w, Y0 = b.y, Y1 = b.y + b.d, H = b.h;
  const armW = 110;
  tris.push(...box(X0 + armW, Y0 + 60, 120, X1 - armW, Y1 - 120, 360));                     // base
  for (const x of [X0, X1 - armW]) tris.push(...box(x, Y0 + 60, 120, x + armW, Y1 - 60, H - 150)); // arms
  const seatW = (b.w - 2 * armW) / seats;
  for (let i = 0; i < seats; i++) {
    const x0 = X0 + armW + i * seatW;
    tris.push(...box(x0 + 8, Y0 + 130, 360, x0 + seatW - 8, Y1 - 150, 440));                 // seat cushion
    tris.push(...box(x0 + 12, Y1 - 160, 440, x0 + seatW - 12, Y1 - 90, H - 100));          // back cushion
    if (i) plan.push({ kind: 'line', x1: x0, y1: Y0 + 130, x2: x0, y2: Y1 - 150 });
  }
  tris.push(...legs(b, 60, 0, 120, 26));
  plan.push({ kind: 'rect', x0: X0, y0: Y0 + 60, x1: X1, y1: Y1 - 60 });
  return { tris, plan };
}

/** A table: a top with an apron below, four legs (or a pedestal for round tables), hidden lower shelf when there is one. */
function table(b, { round = false, shelf = false } = {}) {
  const tris = [], plan = [];
  const X0 = b.x, X1 = b.x + b.w, Y0 = b.y, Y1 = b.y + b.d, H = b.h;
  const topT = 40;
  if (round) {
    const cx = (X0 + X1) / 2, cy = (Y0 + Y1) / 2, rad = b.w / 2;
    tris.push(...ellipsoid(cx, cy, H - topT / 2, rad, rad, topT / 2, 24, 4));          // top disc
    tris.push(...tube([[cx, cy, 0], [cx, cy, H - topT]], [legR(b.w) * 2, legR(b.w) * 1.4], 14));   // pedestal
    tris.push(...ellipsoid(cx, cy, 14, rad * 0.45, rad * 0.45, 14, 16, 3));                 // foot
    plan.push({ kind: 'circle', x: cx, y: cy, r: rad }, { kind: 'circle', x: cx, y: cy, r: rad * 0.12 });
  } else {
    tris.push(...box(X0, Y0, H - topT, X1, Y1, H));                                        // top
    tris.push(...box(X0 + 60, Y0 + 60, H - topT - 120, X1 - 60, Y1 - 60, H - topT));       // apron
    tris.push(...legs(b, 60, 0, H - topT - 120, legR(b.w)));
    if (shelf) tris.push(...box(X0 + 90, Y0 + 90, 200, X1 - 90, Y1 - 90, 230));
    plan.push({ kind: 'rect', x0: X0, y0: Y0, x1: X1, y1: Y1 });
    for (const [x, y] of [[X0 + 60, Y0 + 60], [X1 - 60, Y0 + 60], [X0 + 60, Y1 - 60], [X1 - 60, Y1 - 60]]) plan.push({ kind: 'circle', x, y, r: legR(b.w) });
  }
  return { tris, plan };
}

/** A bed: frame, mattress, two pillows at the head, a headboard and a footboard. */
function bed(b) {
  const tris = [], plan = [];
  const X0 = b.x, X1 = b.x + b.w, Y0 = b.y, Y1 = b.y + b.d, H = b.h;
  tris.push(...box(X0, Y0, 120, X1, Y1, 300));                                              // frame
  tris.push(...box(X0 + 40, Y0 + 40, 300, X1 - 40, Y1 - 40, 420));                          // mattress
  tris.push(...box(X0, Y1 - 60, 0, X1, Y1, H));                                             // headboard
  tris.push(...box(X0, Y0, 0, X1, Y0 + 50, 420));                                           // footboard
  const pw = (b.w - 160) / 2;
  for (let i = 0; i < 2; i++) {
    const px = X0 + 60 + i * (pw + 40);
    tris.push(...ellipsoid(px + pw / 2, Y1 - 220, 470, pw / 2, 130, 55, 16, 6));          // pillow
    plan.push({ kind: 'ellipse', x: px + pw / 2, y: Y1 - 220, rx: pw / 2, ry: 130 });
  }
  tris.push(...legs({ x: X0, y: Y0, w: b.w, d: b.d }, 40, 0, 120, 30));
  plan.push({ kind: 'rect', x0: X0, y0: Y0, x1: X1, y1: Y1 });
  return { tris, plan };
}

/** A desk: a top, two pedestals with drawers, and a modesty panel. */
function desk(b) {
  const tris = [], plan = [];
  const X0 = b.x, X1 = b.x + b.w, Y0 = b.y, Y1 = b.y + b.d, H = b.h;
  tris.push(...box(X0, Y0, H - 40, X1, Y1, H));                                              // top
  for (const x of [X0, X1 - 420]) {
    tris.push(...box(x + 10, Y0 + 40, 0, x + 410, Y1 - 40, H - 40));                       // pedestal
    for (let r = 0; r < 3; r++) tris.push(...box(x + 20, Y1 - 60, 80 + r * 300, x + 400, Y1 - 30, 340 + r * 300)); // drawer fronts
  }
  plan.push({ kind: 'rect', x0: X0, y0: Y0, x1: X1, y1: Y1 });
  return { tris, plan };
}

/** Furniture detail for one object, or null when the name is not one of these types. */
export function furnitureDetail(name, b) {
  const n = name.toLowerCase();
  const seats = Math.max(1, Math.round(b.w / 610));
  let out = null, changelog = '';
  if (/sofa|loveseat/.test(n)) { out = sofa(b, /loveseat/.test(n) ? 2 : Math.max(2, seats)); changelog = 'Added the sofa base, arms, seat and back cushions and the legs (3D and plan).'; }
  else if (/armchair|lounge chair/.test(n)) { out = chair(b, { arms: true, height: 380 }); changelog = 'Added the seat, arms, back and legs (3D and plan).'; }
  else if (/bar stool|counter stool|stool/.test(n)) { out = chair(b, { stool: true }); changelog = 'Added the seat and four legs (3D and plan).'; }
  else if (/chair/.test(n) && !/wheelchair/.test(n)) { out = chair(b, {}); changelog = 'Added the seat, back, legs and back panel (3D and plan).'; }
  else if (/ottoman/.test(n)) { out = null; }
  else if (/bench|banquette/.test(n)) { out = sofa(b, 2); changelog = 'Added the seat base, cushions and legs (3D and plan).'; }
  else if (/coffee table/.test(n)) { out = table(b, { shelf: true }); changelog = 'Added the top, apron, four legs and the lower shelf (3D and plan).'; }
  else if (/side table|end table|cafe table|bistro table|round/.test(n) && b.w === b.d) { out = table(b, { round: true }); changelog = 'Added the round top and pedestal base (3D and plan).'; }
  else if (/table/.test(n) && b.w === b.d) { out = table(b, { round: true }); changelog = 'Added the round top and pedestal base (3D and plan).'; }
  else if (/table/.test(n)) { out = table(b, {}); changelog = 'Added the top, apron and four legs (3D and plan).'; }
  else if (/bed|bunk|daybed/.test(n)) { out = bed(b); changelog = 'Added the frame, mattress, pillows, headboard and footboard (3D and plan).'; }
  else if (/desk|credenza/.test(n) && !/computer desk, 42/.test(n)) { out = desk(b); changelog = 'Added the top, two pedestals with drawer fronts, and the modesty panel (3D and plan).'; }
  if (!out) return null;
  return { tris: out.tris, plan: out.plan, clear: [], changelog };
}
