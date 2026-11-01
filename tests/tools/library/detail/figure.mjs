/* SPDX-License-Identifier: Apache-2.0 */
/**
 * figure.mjs — a generic standing or walking person, and a wheeled suitcase, built from primitives (mm, z up, plan front at −Y).
 * Original geometry (no third-party model is used or copied). Proportions are a generic adult scale figure, not a measured person.
 *
 *   figure({ pose: 'stand' | 'walk', suitcase: bool, scale, cx, cy }) → { tris: [[a,b,c], …], plan: [...] }
 *
 * `tris` are triangles of [x, y, z] points. `plan` holds the top-view outlines as plain shapes the generator draws.
 */

const TAU = Math.PI * 2;

/** An ellipsoid centred on (cx, cy, cz) with radii rx, ry, rz. */
export function ellipsoid(cx, cy, cz, rx, ry, rz, nu = 12, nv = 8) {
  const P = (u, v) => [cx + rx * Math.sin(v) * Math.cos(u), cy + ry * Math.sin(v) * Math.sin(u), cz + rz * Math.cos(v)];
  const tris = [];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const u0 = (i / nu) * TAU, u1 = ((i + 1) / nu) * TAU, v0 = (j / nv) * Math.PI, v1 = ((j + 1) / nv) * Math.PI;
    const a = P(u0, v0), b = P(u1, v0), c = P(u1, v1), d = P(u0, v1);
    tris.push([a, b, c], [a, c, d]);
  }
  return tris;
}

/** A tube along a polyline of points with radii (a limb, a neck, a rod). Open ends are capped. */
export function tube(pts, rads, segs = 10) {
  const tris = [];
  const rings = pts.map((p, i) => {
    const prev = pts[Math.max(0, i - 1)], next = pts[Math.min(pts.length - 1, i + 1)];
    let t = [next[0] - prev[0], next[1] - prev[1], next[2] - prev[2]];
    const len = Math.hypot(...t) || 1; t = t.map((v) => v / len);
    const ref = Math.abs(t[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    let u = [t[1] * ref[2] - t[2] * ref[1], t[2] * ref[0] - t[0] * ref[2], t[0] * ref[1] - t[1] * ref[0]];
    const ul = Math.hypot(...u) || 1; u = u.map((v) => v / ul);
    const w = [t[1] * u[2] - t[2] * u[1], t[2] * u[0] - t[0] * u[2], t[0] * u[1] - t[1] * u[0]];
    const ring = [];
    for (let k = 0; k < segs; k++) {
      const a = (k / segs) * TAU, c = Math.cos(a) * rads[i], s = Math.sin(a) * rads[i];
      ring.push([p[0] + u[0] * c + w[0] * s, p[1] + u[1] * c + w[1] * s, p[2] + u[2] * c + w[2] * s]);
    }
    return ring;
  });
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < segs; k++) {
    const k2 = (k + 1) % segs;
    tris.push([rings[i][k], rings[i + 1][k], rings[i + 1][k2]], [rings[i][k], rings[i + 1][k2], rings[i][k2]]);
  }
  for (const [ring, centre] of [[rings[0], pts[0]], [rings[rings.length - 1], pts[pts.length - 1]]]) {
    for (let k = 0; k < segs; k++) tris.push([centre, ring[k], ring[(k + 1) % segs]]);
  }
  return tris;
}

/** A box (x0..x1, y0..y1, z0..z1) as triangles. */
export function box(x0, y0, z0, x1, y1, z1) {
  const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
  const f = [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [2, 3, 7], [2, 7, 6], [1, 2, 6], [1, 6, 5], [0, 4, 7], [0, 7, 3]];
  return f.map((t) => [v[t[0]], v[t[1]], v[t[2]]]);
}

/** A standing or walking adult, optionally with a wheeled suitcase in the right hand. Front (the viewer) is −Y. */
export function figure({ pose = 'stand', suitcase = false, scale = 1, cx = 0, cy = 0 } = {}) {
  const S = (v) => v * scale;
  const X = (v) => cx + S(v), Y = (v) => cy + S(v);
  const tris = [];
  const add = (list) => { for (const t of list) tris.push(t); };
  // Walking: the left leg and arm lead, the right leg trails and the right arm holds the suitcase at the side.
  const lead = pose === 'walk' ? 1 : 0;
  // Head, neck, torso.
  add(ellipsoid(X(0), Y(0), S(1600), S(95), S(110), S(125), 14, 10));
  add(tube([[X(0), Y(0), S(1460)], [X(0), Y(0), S(1520)]], [S(55), S(55)]));
  add(ellipsoid(X(0), Y(0), S(1150), S(175), S(105), S(260), 16, 10));
  // Pelvis.
  add(ellipsoid(X(0), Y(0), S(880), S(165), S(105), S(110), 14, 8));
  // Legs: hip, knee, ankle, each a tube. Walking moves the front leg forward (−Y) and the back leg back (+Y).
  for (const side of [-1, 1]) {
    const fwd = pose === 'walk' ? (side === -1 ? -lead : lead) : 0;
    const hip = [X(side * 95), Y(0), S(880)];
    const knee = [X(side * 95), Y(fwd * 90), S(480)];
    const ankle = [X(side * 95), Y(fwd * 160), S(90)];
    add(tube([hip, knee, ankle], [S(85), S(65), S(55)]));
    // Shoe: a box in front of the ankle.
    add(box(X(side * 95 - 55), Y(fwd * 160 - 210), S(0), X(side * 95 + 55), Y(fwd * 160 + 40), S(90)));
  }
  // Arms: the left arm swings forward when walking; the right arm hangs with the hand at the side (holding the suitcase).
  const lShoulder = [X(-190), Y(0), S(1380)];
  const sit = pose === 'sit';
  const lElbow = [X(-205), Y(sit ? -110 : pose === 'walk' ? -150 : -20), S(sit ? 1080 : 1120)];
  const lHand = [X(-215), Y(sit ? -230 : pose === 'walk' ? -260 : -40), S(sit ? 830 : 930)];
  add(tube([lShoulder, lElbow, lHand], [S(60), S(50), S(40)]));
  const rShoulder = [X(190), Y(0), S(1380)];
  const rElbow = [X(220), Y(sit ? -110 : -20), S(sit ? 1080 : 1110)];
  const rHand = [X(240), Y(sit ? -230 : -30), S(sit ? 830 : 920)];
  add(tube([rShoulder, rElbow, rHand], [S(60), S(50), S(40)]));
  // Hands: small ellipsoids.
  add(ellipsoid(X(-215), Y(pose === 'walk' ? -260 : -40), S(905), S(45), S(40), S(55), 8, 6));
  add(ellipsoid(X(240), Y(-30), S(905), S(45), S(40), S(55), 8, 6));

  const plan = [];
  if (suitcase) {
    // Upright wheeled suitcase on the right: a shell, four wheels, and a telescoping handle to the hand.
    const sx0 = X(230), sx1 = X(230 + 240), sy0 = Y(-120), sy1 = Y(40);
    add(box(sx0, sy0, S(170), sx1, sy1, S(700)));                                  // shell
    add(box(sx0 + S(8), sy0 - S(6), S(170), sx1 - S(8), sy0, S(700)));             // front ribs
    for (const [wx, wy] of [[sx0 + S(40), sy0 + S(30)], [sx1 - S(40), sy0 + S(30)], [sx0 + S(40), sy1 - S(30)], [sx1 - S(40), sy1 - S(30)]]) {
      add(ellipsoid(wx, wy, S(60), S(30), S(30), S(30), 8, 6));
    }
    add(tube([[X(260), Y(-20), S(700)], [X(260), Y(-20), S(930)]], [S(14), S(14)], 8));  // handle rod
    add(box(X(240), Y(-40), S(920), X(280), Y(-10), S(940)));                       // grip
    plan.push({ kind: 'rect', x0: sx0, y0: sy0, x1: sx1, y1: sy1 }, { kind: 'circle', x: sx0 + S(40), y: sy0 + S(30), r: S(20) });
  }
  // Plan: shoulders, head, and the feet.
  plan.unshift({ kind: 'ellipse', x: X(0), y: Y(0), rx: S(195), ry: S(115) }, { kind: 'circle', x: X(0), y: Y(0), r: S(110) });
  return { tris, plan };
}

// ---------------------------------------------------------------------------------------------------------------------
// Version 2: a lofted figure. Torso, pelvis, legs and arms are cross-sections (ellipses) joined into surfaces, so the
// silhouette follows the body. Clothing is a slightly larger shell over the same sections. Still our own geometry.

/** A loft through sections [{ z, x, y, rx, ry }] (centre x, y, radii rx, ry), capped at both ends. */
export function loft(sections, segs = 14) {
  const tris = [];
  const rings = sections.map((s) => {
    const ring = [];
    for (let k = 0; k < segs; k++) {
      const a = (k / segs) * TAU;
      ring.push([s.x + s.rx * Math.cos(a), s.y + s.ry * Math.sin(a), s.z]);
    }
    return ring;
  });
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < segs; k++) {
    const k2 = (k + 1) % segs;
    tris.push([rings[i][k], rings[i + 1][k], rings[i + 1][k2]], [rings[i][k], rings[i + 1][k2], rings[i][k2]]);
  }
  for (const [ring, s] of [[rings[0], sections[0]], [rings[rings.length - 1], sections[sections.length - 1]]]) {
    for (let k = 0; k < segs; k++) tris.push([[s.x, s.y, s.z], ring[k], ring[(k + 1) % segs]]);
  }
  return tris;
}

/** Scales a set of triangles about a point (used for clothing shells slightly larger than the body). */
export function grow(tris, c, f) {
  return tris.map((t) => t.map((p) => [c[0] + (p[0] - c[0]) * f, c[1] + (p[1] - c[1]) * f, c[2] + (p[2] - c[2]) * f]));
}

/** A standing or walking adult, version 2 (lofted torso and legs, clothing over the body). Front is −Y. */
export function figure2({ pose = 'stand', suitcase = false, scale = 1, cx = 0, cy = 0, hi = false } = {}) {
  const S = (v) => v * scale;
  const N = hi ? 2 : 1; // detail level: 2 doubles the surface detail (more segments and the small parts below)
  const X = (v) => cx + S(v), Y = (v) => cy + S(v);
  const walk = pose === 'walk';
  const body = [];      // skin
  const cloth = [];     // clothing shells
  // Torso: from pelvis (z 900) to shoulders (z 1420), wider at the chest.
  const torso = [
    { z: S(900), x: X(0), y: Y(0), rx: S(150), ry: S(95) },
    { z: S(1000), x: X(0), y: Y(0), rx: S(165), ry: S(100) },
    { z: S(1120), x: X(0), y: Y(0), rx: S(178), ry: S(108) },
    { z: S(1250), x: X(0), y: Y(0), rx: S(180), ry: S(110) },
    { z: S(1350), x: X(0), y: Y(5), rx: S(190), ry: S(112) },
    { z: S(1420), x: X(0), y: Y(5), rx: S(175), ry: S(100) },
    { z: S(1460), x: X(0), y: Y(0), rx: S(95), ry: S(70) },
    { z: S(1490), x: X(0), y: Y(0), rx: S(55), ry: S(55) },
  ];
  body.push(...loft(torso, 14 * N));
  cloth.push(...grow(loft(torso.slice(0, 6), 14 * N), [X(0), Y(0), S(1100)], 1.05));
  // Head: an ellipsoid with a jaw, and hair as a cap over it.
  body.push(...ellipsoid(X(0), Y(-5), S(1610), S(92), S(112), S(122), 16 * N, 12 * N));
  body.push(...ellipsoid(X(0), Y(20), S(1545), S(80), S(85), S(70), 12 * N, 8 * N));  // jaw and chin
  cloth.push(...grow(ellipsoid(X(0), Y(-10), S(1660), S(98), S(118), S(70), 16, 10), [X(0), Y(0), S(1660)], 1.0)); // hair
  // Pelvis and legs (lofted down to the ankle), trousers as a shell over each leg.
  for (const side of [-1, 1]) {
    const hipX = X(side * 95);
    const fwd = walk ? (side === -1 ? -1 : 1) : 0;
    const seatLeg = [
      { z: S(880), x: hipX, y: Y(0), rx: S(100), ry: S(100) },
      { z: S(700), x: hipX, y: Y(-120), rx: S(95), ry: S(95) },
      { z: S(560), x: hipX, y: Y(-260), rx: S(80), ry: S(80) },
      { z: S(480), x: hipX, y: Y(-330), rx: S(72), ry: S(72) },   // knee
      { z: S(300), x: hipX, y: Y(-335), rx: S(60), ry: S(60) },
      { z: S(100), x: hipX, y: Y(-340), rx: S(52), ry: S(52) },
    ];
    const leg = pose === 'sit' ? seatLeg : [
      { z: S(880), x: hipX, y: Y(0), rx: S(100), ry: S(100) },
      { z: S(700), x: hipX + S(0), y: Y(fwd * 30), rx: S(95), ry: S(95) },
      { z: S(520), x: hipX + S(0), y: Y(fwd * 70), rx: S(78), ry: S(80) },
      { z: S(430), x: hipX, y: Y(fwd * 90), rx: S(64), ry: S(68) },
      { z: S(250), x: hipX, y: Y(fwd * 130), rx: S(58), ry: S(60) },
      { z: S(100), x: hipX, y: Y(fwd * 150), rx: S(52), ry: S(52) },
    ];
    body.push(...loft(leg, 14 * N));
    cloth.push(...grow(loft(leg.slice(0, 5), 14 * N), [hipX, Y(fwd * 60), S(600)], 1.08));
    // Shoe: a rounded box in front of the ankle.
    body.push(...box(hipX - S(55), Y(fwd * 150 - 210), S(0), hipX + S(60), Y(fwd * 150 + 40), S(100)));
  }
  // Arms: tapered from shoulder to wrist, with a sleeve shell over them; hands as ellipsoids.
  const arm = (sx, lead) => {
    const sh = [X(sx), Y(0), S(1380)];
    const el = [X(sx * 1.08), Y(lead ? -150 : -20), S(1120)];
    const wr = [X(sx * 1.13), Y(lead ? -260 : -40), S(940)];
    const sec = (a, b, t, ra, rb) => ({ z: S(a[2] + (b[2] - a[2]) * t), x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, rx: S(ra + (rb - ra) * t), ry: S(ra + (rb - ra) * t) });
    const sleeve = [];
    for (let i = 0; i <= 6; i++) sleeve.push(sec(sh, el, i / 6, 62, 50));
    for (let i = 1; i <= 6; i++) sleeve.push(sec(el, wr, i / 6, 50, 40));
    body.push(...loft(sleeve, 14 * N));
    cloth.push(...grow(loft(sleeve.slice(0, 9), 14 * N), sh, 1.12));
    body.push(...ellipsoid(wr[0], wr[1], wr[2] - S(30), S(44), S(38), S(55), 10, 8));
    return { sh, wr };
  };
  arm(-190, walk);
  const right = arm(190, false);
  // Neck is part of the torso loft; the clothing collar is a short ring.
  if (suitcase) {
    const sx0 = X(230), sx1 = X(470), sy0 = Y(-120), sy1 = Y(40);
    cloth.push(...box(sx0, sy0, S(170), sx1, sy1, S(700)));
    for (const [wx, wy] of [[sx0 + S(40), sy0 + S(30)], [sx1 - S(40), sy0 + S(30)], [sx0 + S(40), sy1 - S(30)], [sx1 - S(40), sy1 - S(30)]]) {
      body.push(...ellipsoid(wx, wy, S(60), S(30), S(30), S(30), 8, 6));
    }
    body.push(...tube([[X(260), Y(-20), S(700)], [X(260), Y(-20), S(930)]], [S(14), S(14)], 8));
    cloth.push(...box(X(240), Y(-40), S(920), X(280), Y(-10), S(940)));
  }
  if (hi) {
    // Face: ears and a nose on the head (the head faces −Y).
    for (const side of [-1, 1]) body.push(...ellipsoid(X(side * 92), Y(-5), S(1600), S(16), S(28), S(42), 8, 6));
    body.push(...ellipsoid(X(0), Y(-118), S(1590), S(15), S(22), S(30), 8, 6));
    // Shirt collar: a short ring under the neck, and the jacket's two buttons on the front of the chest.
    cloth.push(...loft([{ z: S(1420), x: X(0), y: Y(0), rx: S(84), ry: S(60) }, { z: S(1470), x: X(0), y: Y(0), rx: S(70), ry: S(52) }], 16));
    for (const bz of [1240, 1140]) body.push(...ellipsoid(X(0), Y(-112), S(bz), S(9), S(9), S(9), 8, 6));
    // Belt: a thin band round the waist.
    cloth.push(...grow(loft([{ z: S(880), x: X(0), y: Y(0), rx: S(168), ry: S(104) }, { z: S(905), x: X(0), y: Y(0), rx: S(170), ry: S(106) }], 20), [X(0), Y(0), S(892)], 1.0));
    // Fingers and thumbs on each hand.
    for (const [hx, hy] of [[X(-215), Y(walk ? -260 : -40)], [X(240), Y(-30)]]) {
      for (let f = -2; f <= 1; f++) body.push(...tube([[hx + S(f * 14), hy - S(20), S(900)], [hx + S(f * 16), hy - S(50), S(860)]], [S(7), S(6)], 6));
      body.push(...tube([[hx + S(hx < 0 ? 35 : -35), hy - S(5), S(930)], [hx + S(hx < 0 ? 60 : -60), hy - S(25), S(905)]], [S(9), S(7)], 6));
    }
    // Shoe detail: a sole band under each shoe.
    for (const side of [-1, 1]) {
      const f = walk ? (side === -1 ? -1 : 1) : 0;   // the same forward offset as the shoe it sits under
      body.push(...box(X(side * 95 - 55), Y(f * 150 - 210), S(0), X(side * 95 + 60), Y(f * 150 + 40), S(22)));
    }
    // Suitcase: top handle, side zip and corner guards.
    if (suitcase) {
      const sx0 = X(230), sx1 = X(470), sy0 = Y(-120), sy1 = Y(40);
      cloth.push(...box(X(300), Y(-124), S(700), X(400), Y(-116), S(730)));          // top grip
      cloth.push(...box(sx0 + S(4), sy0 - S(4), S(180), sx0 + S(12), sy0 - S(2), S(690)));  // zip line on the front
      for (const [cxk, cyk] of [[sx0, sy0], [sx1, sy0], [sx0, sy1], [sx1, sy1]]) cloth.push(...box(cxk - S(12), cyk - S(12), S(170), cxk + S(12), cyk + S(12), S(700)));
    }
  }
  const plan = [
    { kind: 'ellipse', x: X(0), y: Y(0), rx: S(190), ry: S(112) },   // shoulders and chest
    { kind: 'circle', x: X(0), y: Y(0), r: S(92) },                  // head
  ];
  if (suitcase) plan.push({ kind: 'rect', x0: X(230), y0: Y(-120), x1: X(470), y1: Y(40) });
  if (hi) {
    plan.push({ kind: 'circle', x: X(-92), y: Y(-5), r: S(16) }, { kind: 'circle', x: X(92), y: Y(-5), r: S(16) });       // ears
    for (const bz of [0, 1]) plan.push({ kind: 'circle', x: X(0), y: Y(-112), r: S(9) });                                 // buttons
    plan.push({ kind: 'circle', x: X(-215), y: Y(walk ? -260 : -40), r: S(44) }, { kind: 'circle', x: X(240), y: Y(-30), r: S(44) }); // hands
    if (suitcase) plan.push({ kind: 'line', x1: X(230), y1: Y(-120), x2: X(470), y2: Y(-120) }); // suitcase front edge
  }
  return { tris: [...body, ...cloth], plan };
}
