/* SPDX-License-Identifier: Apache-2.0 */
/**
 * viewcube.js — the view cube and the corner axis icon, shared by every 3D view (docs/3D-SPEC.md §F,
 * docs/apps/viewcube.md). Canonical copy: modelcraft/dev/viewcube.js; every other app keeps a
 * BYTE-IDENTICAL copy (its test checks) — change it here, keep `node bin/test-viewcube.mjs` green, re-copy.
 *
 * DOM only (SVG + injected CSS), no three.js, no app imports. World is Z up, north = +Y (rotated by `north`).
 * A view is {dir: [x,y,z] the direction the camera looks along, up: [x,y,z] screen up, persp}.
 *
 *   const cube = mountViewCube(host, {
 *     getView() → {dir, up, persp},             read on every update()
 *     setView({dir, up}, {animate}),             the app moves its camera (and animates when asked)
 *     home(),                                    optional: the Home button (fit + iso)
 *     north: 0,                                  radians, counter-clockwise from +Y to north
 *     labels: {top, bottom, front, back, left, right},   sentence-case words (CSS small-caps them)
 *     i18n: {t, has},                            optional: the app's own i18n.js (import * as i18n); every word
 *                                                below comes from its catalog when it has the key (VC_STRINGS),
 *                                                else English. Explicit `labels` win over both.
 *     menu: {label, items: [{label, value}], value, onChange(value)},   optional (e.g. "WCS")
 *     onDrag(dx, dy),                            optional: dragging the cube orbits with the app's own
 *                                                controls (CSS px); without it the cube turns the view itself
 *     corner: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
 *   });
 *   cube.update()  (call after every render; cheap when nothing moved) · cube.setNorth(rad) ·
 *   cube.setVisible(bool) · cube.setMenuValue(v) · cube.destroy() · cube.el
 *
 *   const axes = mountAxisIcon(host, {getView, corner: 'bottom-left', i18n});   X/Y/Z triad; axes.update() · destroy()
 *
 * Pure helpers (Node-run by bin/test-viewcube.mjs): TARGETS (26 keys: 'top', 'top-front', 'top-front-right', …),
 * VC_STRINGS, vcTranslator, targetVector, targetLabel, basis, project, pickTarget, viewForTarget, faceOn, stepView, turnView, orbitView,
 * heading, compassPoints, ringAt, letterAt, viewFromLetter, slerpView, nearestTarget, keyStep.
 */

// ------------------------------------------------------------------ vectors
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a); return l > 1e-12 ? mul(a, 1 / l) : [0, 0, 0]; };
const Z = [0, 0, 1];
/** Rotate v about a unit axis k by angle t (Rodrigues). */
function rot(v, k, t) {
  const c = Math.cos(t), s = Math.sin(t);
  return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)));
}

// ------------------------------------------------------------------ the cube's faces and targets
/** Faces: outward normal n, and the face's own right (a) and down (b) seen from outside (a × b = −n, so text reads). */
export const FACES = {
  top: { n: [0, 0, 1], a: [1, 0, 0], b: [0, -1, 0] },
  bottom: { n: [0, 0, -1], a: [1, 0, 0], b: [0, 1, 0] },
  front: { n: [0, -1, 0], a: [1, 0, 0], b: [0, 0, -1] },
  back: { n: [0, 1, 0], a: [-1, 0, 0], b: [0, 0, -1] },
  left: { n: [-1, 0, 0], a: [0, -1, 0], b: [0, 0, -1] },
  right: { n: [1, 0, 0], a: [0, 1, 0], b: [0, 0, -1] },
};
export const DEFAULT_LABELS = { top: 'Top', bottom: 'Bottom', front: 'Front', back: 'Back', left: 'Left', right: 'Right' };
/**
 * Every word the cube and the axis icon show or say, by language key, in English. An app that wants them translated
 * adds these keys to its own lang/<locale>.json and passes {i18n: {t, has}}; the module itself reads no catalog,
 * so each app keeps its own (docs/apps/viewcube.md § Language keys).
 */
export const VC_STRINGS = {
  'viewcube.face.top': 'Top', 'viewcube.face.bottom': 'Bottom', 'viewcube.face.front': 'Front',
  'viewcube.face.back': 'Back', 'viewcube.face.left': 'Left', 'viewcube.face.right': 'Right',
  'viewcube.edge': '{a} {b} edge',
  'viewcube.corner': '{a} {b} {c} corner',
  'viewcube.group': 'View cube',
  'viewcube.role': 'view cube',
  'viewcube.hint': 'Arrow keys choose a side, edge or corner; Enter looks from there. Shift with Left or Right turns the view a quarter turn. Home goes to the home view.',
  'viewcube.looking': 'View cube, looking from {view}',
  'viewcube.looking-chosen': 'View cube, looking from {view}. Chosen: {chosen}',
  'viewcube.step.up': 'Look from the side above', 'viewcube.step.down': 'Look from the side below',
  'viewcube.step.left': 'Look from the side on the left', 'viewcube.step.right': 'Look from the side on the right',
  'viewcube.step.ccw': 'Turn the view a quarter turn counter-clockwise', 'viewcube.step.cw': 'Turn the view a quarter turn clockwise',
  'viewcube.home': 'Home view',
  'viewcube.home.title': 'Home view: fit everything, looking from the front, right and above',
  'viewcube.menu': 'Coordinate system',
  'viewcube.letter.n': 'N', 'viewcube.letter.e': 'E', 'viewcube.letter.s': 'S', 'viewcube.letter.w': 'W',
  'viewcube.axes': 'Axes: X red, Y green, Z blue',
};
/** A translator over VC_STRINGS: the app's catalog when it has the key, else English; {name} fills. */
export function vcTranslator(i18n) {
  const fill = (s, f) => String(s).replace(/\{([a-z]+)\}/g, (m, k) => (f && f[k] != null ? String(f[k]) : m));
  return (key, f) => {
    if (i18n && typeof i18n.t === 'function' && (typeof i18n.has !== 'function' || i18n.has(key))) return i18n.t(key, f);
    return fill(VC_STRINGS[key] ?? key, f);
  };
}
const EN = vcTranslator(null);
/** Edge band: the outer 20% of each face side picks an edge or a corner (face-local |u| > BAND). */
export const BAND = 0.6;

/** Integer vector (each −1, 0, 1) → key: 'top' | 'bottom', then 'front' | 'back', then 'left' | 'right', joined by '-'. */
export function keyOf(v) {
  const p = [];
  if (v[2] > 0.5) p.push('top'); else if (v[2] < -0.5) p.push('bottom');
  if (v[1] < -0.5) p.push('front'); else if (v[1] > 0.5) p.push('back');
  if (v[0] < -0.5) p.push('left'); else if (v[0] > 0.5) p.push('right');
  return p.join('-');
}
/** Key → the integer vector pointing from the cube's centre to that face, edge or corner. */
export function targetVector(key) {
  const v = [0, 0, 0];
  for (const p of String(key).split('-')) {
    if (p === 'top') v[2] = 1; else if (p === 'bottom') v[2] = -1;
    else if (p === 'front') v[1] = -1; else if (p === 'back') v[1] = 1;
    else if (p === 'left') v[0] = -1; else if (p === 'right') v[0] = 1;
    else return null;
  }
  return v[0] || v[1] || v[2] ? v : null;
}
/** All 26 targets: 6 faces, 12 edges, 8 corners. */
export const TARGETS = (() => {
  const out = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) if (x || y || z) out.push(keyOf([x, y, z]));
  const n = (k) => k.split('-').length;
  return out.sort((a, b) => n(a) - n(b) || a.localeCompare(b));
})();
export const targetKind = (key) => ['face', 'edge', 'corner'][String(key).split('-').length - 1] || null;
/**
 * "Front", "Top front edge", "Bottom back left corner" (from the labels given; sentence case). tr = a vcTranslator
 * (English by default); plain = true leaves out the "edge" / "corner" word ("top front", for "looking from …").
 */
export function targetLabel(key, labels = DEFAULT_LABELS, tr = EN, plain = false) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const w = String(key).split('-').map((p) => String(L[p] || p));
  const first = w[0].charAt(0).toUpperCase() + w[0].slice(1);
  const rest = w.slice(1).map((s) => s.toLowerCase());
  if (w.length === 1 || plain) return [first, ...rest].join(' ');
  return w.length === 2 ? tr('viewcube.edge', { a: first, b: rest[0] }) : tr('viewcube.corner', { a: first, b: rest[0], c: rest[1] });
}

// ------------------------------------------------------------------ views
/** Screen basis of a view: r right, u up, d into the screen (all unit, world coordinates). */
export function basis(view) {
  const d = norm(view.dir);
  let r = cross(d, view.up || Z);
  if (len(r) < 1e-9) r = cross(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]);
  r = norm(r);
  return { r, u: cross(r, d), d };
}
/** World point → [x, y (down), depth (bigger = farther)] in the same units, orthographic, about the origin. */
export function project(view, p, B = basis(view)) {
  return [dot(p, B.r), -dot(p, B.u), dot(p, B.d)];
}
/** Which target is under screen point (x, y) (cube half-size 1, y down, origin at the cube's centre)? → key | null */
export function pickTarget(view, x, y, band = BAND) {
  const { r, u, d } = basis(view);
  const o = sub(mul(r, x), mul(u, y));
  let tIn = -Infinity, tOut = Infinity, axis = -1;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-12) { if (Math.abs(o[i]) > 1) return null; continue; }
    const t1 = (-1 - o[i]) / d[i], t2 = (1 - o[i]) / d[i];
    const tn = Math.min(t1, t2), tf = Math.max(t1, t2);
    if (tn > tIn) { tIn = tn; axis = i; }
    if (tf < tOut) tOut = tf;
  }
  if (axis < 0 || tIn > tOut) return null;
  const p = add(o, mul(d, tIn));
  const n = [0, 0, 0]; n[axis] = d[axis] > 0 ? -1 : 1;
  const f = Object.values(FACES).find((F) => dot(F.n, n) > 0.5);
  const pu = dot(p, f.a), pv = dot(p, f.b);
  const su = Math.abs(pu) > band ? Math.sign(pu) : 0, sv = Math.abs(pv) > band ? Math.sign(pv) : 0;
  return keyOf(add(add(f.n, mul(f.a, su)), mul(f.b, sv)));
}
const AXES6 = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const snapTo = (v, list) => list.reduce((best, a) => (dot(a, v) > dot(best, v) ? a : best), list[0]).slice();
/** Up for a straight-down (top) or straight-up (bottom) view, coming from `current`: keeps where you were facing. */
function verticalUp(lookingDown, current) {
  const H4 = AXES6.slice(0, 4);
  if (current) {
    const B = basis(current);
    if (Math.abs(B.d[2]) > 0.999) return snapTo(B.u, H4);   // already vertical: keep the screen's up
    const f = norm([B.d[0], B.d[1], 0]);
    if (len(f) > 0.5) return snapTo(lookingDown ? f : mul(f, -1), H4);
  }
  return lookingDown ? [0, 1, 0] : [0, -1, 0];
}
/** The view that looks at the cube from `key`'s side (dir = −vector); up = Z, or for top/bottom what keeps your bearing. */
export function viewForTarget(key, current = null) {
  const v = targetVector(key);
  if (!v) return null;
  const dir = mul(norm(v), -1);
  if (Math.abs(dir[2]) > 0.999) return { dir, up: verticalUp(dir[2] < 0, current) };
  return { dir, up: norm(sub(Z, mul(dir, dir[2]))) };
}
/** Face-on view (looking straight at a face, screen square to the axes)? → that face's key | null. */
export function faceOn(view, tol = 1e-3) {
  const { u, d } = basis(view);
  const da = snapTo(d, AXES6), ua = snapTo(u, AXES6);
  if (1 - dot(da, d) > tol || 1 - dot(ua, u) > tol) return null;
  return keyOf(mul(da, -1));
}
/** Face-on steps: 'up' | 'down' | 'left' | 'right' bring the neighbouring face (on that side of the screen) to the
 *  front; 'cw' | 'ccw' turn the picture 90° clockwise / counter-clockwise about the line of sight. */
export function stepView(view, which) {
  const { r, u, d } = basis(view);
  const s = (v) => snapTo(v, AXES6);
  const R = s(r), U = s(u), D = s(d);
  switch (which) {
    case 'up': return { dir: mul(U, -1), up: D };
    case 'down': return { dir: U, up: mul(D, -1) };
    case 'left': return { dir: R, up: U };
    case 'right': return { dir: mul(R, -1), up: U };
    case 'cw': return { dir: D, up: mul(R, -1) };
    case 'ccw': return { dir: D, up: R };
    default: return { dir: d, up: u };
  }
}
/** Turn the view about Z by `angle` radians (counter-clockwise seen from above). */
export function turnView(view, angle) {
  const { u, d } = basis(view);
  return { dir: rot(d, Z, angle), up: rot(u, Z, angle) };
}
/** Turntable orbit for a cube drag (dx, dy in screen px): drag right turns the model right, drag down tips it toward you. */
export function orbitView(view, dx, dy, k = 0.01) {
  const B = basis(view);
  let d = rot(B.d, Z, -dx * k), u = rot(B.u, Z, -dx * k);
  const r = norm(cross(d, u));
  const d2 = rot(d, r, -dy * k), u2 = rot(u, r, -dy * k);
  if (Math.abs(d2[2]) < 0.999) { d = d2; u = u2; }
  if (Math.abs(d[2]) < 0.99) u = norm(sub(Z, mul(d, d[2])));
  return { dir: d, up: u };
}
/** Unit vectors of north and east on the ground for a north angle (radians CCW from +Y). */
export function northEast(north = 0) {
  return { N: [-Math.sin(north), Math.cos(north), 0], E: [Math.cos(north), Math.sin(north), 0] };
}
/** The bearing the camera faces: radians clockwise from north, 0 … 2π (looking down: the screen's up). */
export function heading(view, north = 0) {
  const { u, d } = basis(view);
  let h = [d[0], d[1], 0];
  if (len(h) < 1e-6) h = d[2] < 0 ? [u[0], u[1], 0] : [-u[0], -u[1], 0];
  const { N, E } = northEast(north);
  const b = Math.atan2(dot(h, E), dot(h, N));
  return b < -1e-12 ? b + 2 * Math.PI : Math.max(0, b);
}

// ---- compass ring geometry (cube half-size = 1) ----
export const RING = { r: 70 / 32, z: -1, band: 0.28, letter: 88 / 32, hit: 0.4 };
/** Screen positions of the four letters: {n:[x,y], e, s, w}. */
export function compassPoints(view, north = 0) {
  const B = basis(view), { N, E } = northEast(north), R = RING.letter, c = [0, 0, RING.z];
  const at = (v) => project(view, add(c, mul(v, R)), B).slice(0, 2);
  return { n: at(N), e: at(E), s: at(mul(N, -1)), w: at(mul(E, -1)) };
}
/** Is (x, y) on the compass ring? → {angle (world, radians CCW from +X)} | null. Edge-on rings use the screen. */
export function ringAt(view, x, y) {
  const B = basis(view);
  if (Math.abs(B.d[2]) < 0.2) {
    const cy = project(view, [0, 0, RING.z], B)[1];
    if (Math.abs(y - cy) > 0.35 || Math.abs(x) > RING.r + 0.3) return null;
    return { angle: Math.atan2(0, x), edgeOn: true };
  }
  const o = sub(mul(B.r, x), mul(B.u, y));
  const t = (RING.z - o[2]) / B.d[2];
  const p = add(o, mul(B.d, t));
  const rho = Math.hypot(p[0], p[1]);
  if (rho < RING.r - RING.band * 1.6 || rho > RING.r + RING.band * 1.6) return null;
  return { angle: Math.atan2(p[1], p[0]), edgeOn: false };
}
/** How visible each letter is (0…1). As the camera levels out the ring closes to a line and the letters pointing
 *  towards and away from you slide onto each other: they fade out (gone in an elevation, as on the reference cube),
 *  leaving only the side letters. A letter's measure is its distance from the ring's centre on screen / its radius. */
export function letterVisibility(view, north = 0) {
  const P = compassPoints(view, north), c = project(view, [0, 0, RING.z]);
  const out = {}, K = ['n', 'e', 's', 'w'], B = basis(view), { N, E } = northEast(north);
  for (const k of K) {
    const q = Math.hypot(P[k][0] - c[0], P[k][1] - c[1]) / RING.letter;
    out[k] = Math.max(0, Math.min(1, (q - 0.24) / 0.16));
  }
  // two letters closing on each other (a level view along a diagonal): the farther one gives way
  const depth = { n: dot(N, B.d), e: dot(E, B.d), s: -dot(N, B.d), w: -dot(E, B.d) };
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    const a = K[i], b = K[j], sep = Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]);
    const far = depth[a] > depth[b] ? a : b;
    out[far] = Math.min(out[far], Math.max(0, Math.min(1, (sep - 0.3) / 0.3)));
  }
  return out;
}
/** Vertical shift (cube units, y down) that centres cube + ring together in the widget: the ring hangs under the
 *  cube in tilted views, so the pair is moved up by half the ring's drop (0 looking straight down). */
export function layoutOffset(view) {
  return -project(view, [0, 0, RING.z])[1] / 2;
}
/** A compass letter under (x, y)? → 'n' | 'e' | 's' | 'w' | null (letters faded out are not hit) */
export function letterAt(view, x, y, north = 0) {
  const P = compassPoints(view, north), vis = letterVisibility(view, north);
  let best = null, bd = RING.hit;
  for (const k of ['n', 'e', 's', 'w']) {
    if (vis[k] < 0.5) continue;
    const dd = Math.hypot(P[k][0] - x, P[k][1] - y);
    if (dd < bd) { bd = dd; best = k; }
  }
  return best;
}
/** Look from that compass side, keeping the tilt; straight down/up: turn so that side is at the bottom of the screen. */
export function viewFromLetter(letter, view, north = 0) {
  const { N, E } = northEast(north);
  const L = { n: N, e: E, s: mul(N, -1), w: mul(E, -1) }[letter];
  if (!L) return null;
  const B = basis(view);
  if (Math.abs(B.d[2]) > 0.999) return { dir: B.d, up: B.d[2] < 0 ? mul(L, -1) : L };
  const dz = B.d[2], c = Math.sqrt(1 - dz * dz);
  const dir = [-L[0] * c, -L[1] * c, dz];
  return { dir, up: norm(sub(Z, mul(dir, dir[2]))) };
}
/** The target nearest the view's eye side (for the keyboard's starting point). */
export function nearestTarget(view) {
  const f = mul(basis(view).d, -1), t = Math.sin(Math.PI / 8);
  return keyOf(f.map((c) => (Math.abs(c) > t ? Math.sign(c) : 0)));
}
const RING8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
/** Keyboard walk over the 26 targets: 'left' / 'right' go round (45° steps), 'up' / 'down' change level
 *  (bottom face · lower ring · middle · upper ring · top face). `from` = a view, used to leave the top/bottom face. */
export function keyStep(key, which, view = null) {
  const v = targetVector(key) || [0, -1, 0];
  let lvl = v[2], i = RING8.findIndex((h) => h[0] === v[0] && h[1] === v[1]);
  const pole = i < 0;
  if (pole) {
    const hb = view ? heading(view) : 0;     // clockwise from +Y
    const ang = Math.PI / 2 - hb + Math.PI;  // stand on the side you look from
    i = ((Math.round(ang / (Math.PI / 4)) % 8) + 8) % 8;
  }
  if (which === 'left' || which === 'right') {
    if (pole) return key;
    i = (i + (which === 'right' ? 1 : 7)) % 8;
  } else if (which === 'up') {
    if (pole) return lvl > 0 ? key : keyOf([RING8[i][0], RING8[i][1], -1]);
    if (lvl === 1) return 'top';
    lvl += 1;
  } else if (which === 'down') {
    if (pole) return lvl < 0 ? key : keyOf([RING8[i][0], RING8[i][1], 1]);
    if (lvl === -1) return 'bottom';
    lvl -= 1;
  }
  return keyOf([RING8[i][0], RING8[i][1], lvl]);
}

// ---- smooth turns (for the adapters) ----
function frameQuat(view) {
  const { r, u, d } = basis(view);
  const m = [r, u, mul(d, -1)];   // columns
  const m00 = m[0][0], m11 = m[1][1], m22 = m[2][2], tr = m00 + m11 + m22;
  let q;
  if (tr > 0) { const s = Math.sqrt(tr + 1) * 2; q = [(m[1][2] - m[2][1]) / s, (m[2][0] - m[0][2]) / s, (m[0][1] - m[1][0]) / s, s / 4]; }
  else if (m00 > m11 && m00 > m22) { const s = Math.sqrt(1 + m00 - m11 - m22) * 2; q = [s / 4, (m[1][0] + m[0][1]) / s, (m[2][0] + m[0][2]) / s, (m[1][2] - m[2][1]) / s]; }
  else if (m11 > m22) { const s = Math.sqrt(1 + m11 - m00 - m22) * 2; q = [(m[1][0] + m[0][1]) / s, s / 4, (m[2][1] + m[1][2]) / s, (m[2][0] - m[0][2]) / s]; }
  else { const s = Math.sqrt(1 + m22 - m00 - m11) * 2; q = [(m[2][0] + m[0][2]) / s, (m[2][1] + m[1][2]) / s, s / 4, (m[0][1] - m[1][0]) / s]; }
  return q;
}
function qrot(q, v) {
  const [x, y, z, w] = q, t = mul(cross([x, y, z], v), 2);
  return add(add(v, mul(t, w)), cross([x, y, z], t));
}
/** The view part-way (t = 0…1, eased) from a to b: the whole camera frame turns along the shortest rotation. */
export function slerpView(a, b, t) {
  const s = t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
  const qa = frameQuat(a); let qb = frameQuat(b);
  let c = qa[0] * qb[0] + qa[1] * qb[1] + qa[2] * qb[2] + qa[3] * qb[3];
  if (c < 0) { qb = qb.map((x) => -x); c = -c; }
  let k0 = 1 - s, k1 = s;
  if (c < 0.9995) { const th = Math.acos(Math.min(1, c)), sn = Math.sin(th); k0 = Math.sin((1 - s) * th) / sn; k1 = Math.sin(s * th) / sn; }
  let q = qa.map((x, i) => x * k0 + qb[i] * k1);
  const ql = Math.hypot(...q); q = q.map((x) => x / ql);
  return { dir: norm(mul(qrot(q, [0, 0, 1]), -1)), up: norm(qrot(q, [0, 1, 0])) };
}
/** Angle between two views' frames (radians) — how far a turn goes. */
export function viewAngle(a, b) {
  const qa = frameQuat(a), qb = frameQuat(b);
  const c = Math.abs(qa[0] * qb[0] + qa[1] * qb[1] + qa[2] * qb[2] + qa[3] * qb[3]);
  return 2 * Math.acos(Math.min(1, c));
}
/** Run a view animation: apply(view) each frame for `ms` (0 or reduced motion = one step). Returns cancel(). */
export function animateView(from, to, apply, { ms = 420, done } = {}) {
  const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null;
  if (!raf || ms <= 0 || viewAngle(from, to) < 1e-4) { apply(to, true); done?.(); return () => {}; }
  let id = 0, stop = false;
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const step = (now) => {
    if (stop) return;
    const k = Math.min(1, (now - t0) / ms);
    apply(k < 1 ? slerpView(from, to, k) : to, k >= 1);
    if (k < 1) id = raf(step); else done?.();
  };
  id = raf(step);
  return () => { stop = true; if (id && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id); };
}
export const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// ------------------------------------------------------------------ DOM
const SVGNS = 'http://www.w3.org/2000/svg';
const H = 32;            // cube half-size in SVG units (view box −100…100)
const STYLE_ID = 'cc-viewcube-style';
const CSS = `
.cc-vc, .cc-axes { position: absolute; z-index: 4; pointer-events: none; user-select: none; -webkit-user-select: none; font-family: var(--font, system-ui, sans-serif); }
.cc-vc { width: 8rem; opacity: .7; transition: opacity .15s; }
.cc-vc:hover, .cc-vc:focus-within, .cc-vc.is-active { opacity: 1; }
.cc-vc[hidden], .cc-axes[hidden] { display: none; }
.cc-vc.at-top-right, .cc-axes.at-top-right { top: .5rem; right: .5rem; }
.cc-vc.at-top-left, .cc-axes.at-top-left { top: .5rem; left: .5rem; }
.cc-vc.at-bottom-right, .cc-axes.at-bottom-right { bottom: .5rem; right: .5rem; }
.cc-vc.at-bottom-left, .cc-axes.at-bottom-left { bottom: .5rem; left: .5rem; }
.cc-vc svg { display: block; width: 8rem; height: 8rem; overflow: visible; pointer-events: none; outline: none; touch-action: none; }
.cc-vc svg:focus-visible .vc-focus { stroke: var(--action); }
.cc-vc .vc-focus { fill: none; stroke: transparent; stroke-width: 1.5; vector-effect: non-scaling-stroke; }
.cc-vc .vc-cell { fill: transparent; pointer-events: all; cursor: pointer; }
.cc-vc .vc-cell.is-hot { fill: color-mix(in srgb, var(--action) 42%, transparent); }
.cc-vc .vc-face-bg { fill: color-mix(in srgb, var(--sheet-2) 82%, var(--ink) 18%); }
.cc-vc .vc-shade { fill: var(--ink); pointer-events: none; }
.cc-vc .vc-edge { fill: none; stroke: color-mix(in srgb, var(--ink-2) 80%, transparent); stroke-width: 1.25; vector-effect: non-scaling-stroke; pointer-events: none; }
.cc-vc .vc-label { fill: var(--ink-2); font-size: 25px; font-weight: 650; font-variant: small-caps; letter-spacing: .03em; text-anchor: middle; dominant-baseline: central; pointer-events: none; }
.cc-vc .vc-ring { fill: none; stroke: color-mix(in srgb, var(--line) 50%, transparent); stroke-width: 9; stroke-linecap: round; pointer-events: none; }
.cc-vc .vc-ring.is-hot { stroke: color-mix(in srgb, var(--action) 55%, transparent); }
.cc-vc .vc-ring-hit { fill: none; stroke: transparent; stroke-width: 18; pointer-events: stroke; cursor: ew-resize; }
.cc-vc .vc-letter { fill: var(--ink); font-size: 16px; font-weight: 700; text-anchor: middle; dominant-baseline: central; paint-order: stroke; stroke: var(--sheet); stroke-width: 3px; stroke-linejoin: round; pointer-events: none; }
.cc-vc .vc-letter.is-hot { fill: var(--action); }
.cc-vc .vc-letter-hit { fill: transparent; pointer-events: all; cursor: pointer; }
.cc-vc .vc-step { pointer-events: all; cursor: pointer; }
.cc-vc .vc-step path { fill: color-mix(in srgb, var(--ink-2) 70%, transparent); stroke: var(--sheet); stroke-width: 1; vector-effect: non-scaling-stroke; }
.cc-vc .vc-step .vc-hit { fill: transparent; stroke: none; }
.cc-vc .vc-step.is-hot path:not(.vc-hit) { fill: var(--action); }
.cc-vc .vc-steps[hidden] { display: none; }
.cc-vc.is-drag .vc-cell, .cc-vc.is-drag .vc-ring-hit { cursor: grabbing; }
.cc-vc .vc-home { position: absolute; top: 0; left: 0; width: 1.6rem; height: 1.6rem; display: grid; place-items: center; padding: 0; border: var(--pen-1, 1px) solid color-mix(in srgb, var(--line) 70%, transparent); border-radius: var(--radius, 2px); background: color-mix(in srgb, var(--sheet-2) 85%, transparent); color: var(--ink-2); font-size: .85rem; line-height: 1; cursor: pointer; pointer-events: auto; }
.cc-vc .vc-home:hover { color: var(--action); border-color: var(--action); }
.cc-vc .vc-home:focus-visible, .cc-vc .vc-menu:focus-visible { outline: var(--pen-3, 2px) solid var(--action); outline-offset: 1px; }
.cc-vc .vc-menu-row { display: flex; justify-content: center; margin-top: .15rem; }
.cc-vc .vc-menu { pointer-events: auto; font: inherit; font-size: .75rem; color: var(--ink-2); background: color-mix(in srgb, var(--sheet-2) 85%, transparent); border: var(--pen-1, 1px) solid color-mix(in srgb, var(--line) 70%, transparent); border-radius: var(--radius, 2px); padding: .1rem 1.1rem .1rem .45rem; appearance: none; -webkit-appearance: none; cursor: pointer;
  background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%); background-position: right .55rem center, right .35rem center; background-size: .2rem .2rem; background-repeat: no-repeat; }
.cc-vc .vc-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.cc-axes { width: 4rem; height: 4rem; }
.cc-axes svg { display: block; width: 100%; height: 100%; overflow: visible; }
.cc-axes line { stroke-width: 2; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.cc-axes text { font-size: 15px; font-weight: 700; text-anchor: middle; dominant-baseline: central; paint-order: stroke; stroke: var(--sheet); stroke-width: 3px; }
.cc-axes .ax-x { stroke: var(--layer-red); fill: var(--layer-red); }
.cc-axes .ax-y { stroke: var(--layer-green); fill: var(--layer-green); }
.cc-axes .ax-z { stroke: var(--layer-blue); fill: var(--layer-blue); }
.cc-axes text.ax-x, .cc-axes text.ax-y, .cc-axes text.ax-z { stroke: var(--sheet); }
.cc-axes .ax-o { fill: var(--ink-2); }
@media (prefers-reduced-motion: reduce) { .cc-vc { transition: none; } }
`;
function injectStyles(doc) {
  if (doc.getElementById(STYLE_ID)) return;
  const s = doc.createElement('style');
  s.id = STYLE_ID;
  s.textContent = CSS;
  (doc.head || doc.documentElement).appendChild(s);
}
function svgEl(doc, tag, attrs = {}, parent = null) {
  const e = doc.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (parent) parent.appendChild(e);
  return e;
}
const f2 = (x) => (Math.round(x * 100) / 100).toString();
const f4 = (x) => (Math.round(x * 1e4) / 1e4).toString();
const CORNERS = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];

export function mountViewCube(host, opts = {}) {
  const doc = host.ownerDocument;
  injectStyles(doc);
  const tr = vcTranslator(opts.i18n);
  const labels = { ...Object.fromEntries(Object.keys(DEFAULT_LABELS).map((k) => [k, tr('viewcube.face.' + k)])), ...(opts.labels || {}) };
  let north = Number.isFinite(opts.north) ? opts.north : 0;
  const corner = CORNERS.includes(opts.corner) ? opts.corner : 'top-right';

  const root = doc.createElement('div');
  root.className = 'cc-vc at-' + corner;
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', tr('viewcube.group'));
  root.dataset.viewcube = '';

  const svg = svgEl(doc, 'svg', { viewBox: '-100 -100 200 200', tabindex: '0', role: 'button', 'aria-roledescription': tr('viewcube.role'), focusable: 'true' });
  const hintId = 'cc-vc-hint-' + Math.random().toString(36).slice(2, 8);
  svg.setAttribute('aria-describedby', hintId);
  root.appendChild(svg);
  const hint = doc.createElement('span');
  hint.className = 'vc-sr'; hint.id = hintId;
  hint.textContent = tr('viewcube.hint');
  const live = doc.createElement('span');
  live.className = 'vc-sr'; live.setAttribute('aria-live', 'polite');
  root.append(hint, live);

  // everything moves together inside stageG (layoutOffset keeps cube + ring centred in the widget)
  const stageG = svgEl(doc, 'g', { class: 'vc-stage' }, svg);
  const ringBack = svgEl(doc, 'path', { class: 'vc-ring' }, stageG);
  const cubeG = svgEl(doc, 'g', { class: 'vc-cube' }, stageG);
  const ringFront = svgEl(doc, 'path', { class: 'vc-ring' }, stageG);
  const ringHit = svgEl(doc, 'path', { class: 'vc-ring-hit', 'data-vc-ring': '' }, stageG);
  const lettersG = svgEl(doc, 'g', { class: 'vc-letters' }, stageG);
  const focusPath = svgEl(doc, 'path', { class: 'vc-focus' }, stageG);
  const LETTERS = { n: 'N', e: 'E', s: 'S', w: 'W' };
  const letters = {};
  for (const k of Object.keys(LETTERS)) {
    const hit = svgEl(doc, 'circle', { class: 'vc-letter-hit', r: 11, 'data-vc-letter': k }, lettersG);
    const t = svgEl(doc, 'text', { class: 'vc-letter' }, lettersG);
    t.textContent = tr('viewcube.letter.' + k);
    letters[k] = { hit, t };
  }

  // faces: a group per face, transformed from face-local units (−50…50) to the screen
  const faces = {};
  for (const [name, F] of Object.entries(FACES)) {
    const g = svgEl(doc, 'g', { class: 'vc-face', 'data-vc-face': name }, cubeG);
    svgEl(doc, 'rect', { class: 'vc-face-bg', x: -50, y: -50, width: 100, height: 100 }, g);
    const shade = svgEl(doc, 'rect', { class: 'vc-shade', x: -50, y: -50, width: 100, height: 100, 'fill-opacity': 0 }, g);
    const cells = [];
    const span = { '-1': [-50, -30], 0: [-30, 30], 1: [30, 50] };
    for (const su of [-1, 0, 1]) for (const sv of [-1, 0, 1]) {
      const [x0, x1] = span[su], [y0, y1] = span[sv];
      const key = keyOf(add(add(F.n, mul(F.a, su)), mul(F.b, sv)));
      cells.push(svgEl(doc, 'rect', { class: 'vc-cell', x: x0, y: y0, width: x1 - x0, height: y1 - y0, 'data-vc-key': key }, g));
    }
    svgEl(doc, 'rect', { class: 'vc-edge', x: -50, y: -50, width: 100, height: 100 }, g);
    const label = svgEl(doc, 'text', { class: 'vc-label', x: 0, y: 0 }, g);
    label.textContent = labels[name];
    faces[name] = { g, shade, cells, label };
  }

  // face-on step arrows: four triangles, two curved arrows (top right)
  const stepsG = svgEl(doc, 'g', { class: 'vc-steps' }, stageG);
  const STEP_TITLES = Object.fromEntries(['up', 'down', 'left', 'right', 'ccw', 'cw'].map((k) => [k, tr('viewcube.step.' + k)]));
  const tri = (cx, cy, ang) => {
    const p = [[9, 0], [-4, -7], [-4, 7]].map(([x, y]) => [cx + x * Math.cos(ang) - y * Math.sin(ang), cy + x * Math.sin(ang) + y * Math.cos(ang)]);
    return 'M' + p.map((q) => q.map(f2).join(' ')).join('L') + 'Z';
  };
  const arcArrow = (a0, a1, r = 57) => {
    // a curved band from a0 to a1 (screen radians, y down) with its head at a1
    const P = (a, rr = r) => [rr * Math.cos(a), rr * Math.sin(a)];
    const w = 2.6, sweep = a1 > a0 ? 1 : 0, tip = P(a1 + Math.sign(a1 - a0) * 0.16);
    const [ix0, iy0] = P(a0, r - w), [ix1, iy1] = P(a1, r - w), [ox0, oy0] = P(a0, r + w), [ox1, oy1] = P(a1, r + w);
    const [hi0, hi1] = P(a1, r - 6.5), [ho0, ho1] = P(a1, r + 6.5);
    return `M${f2(ix0)} ${f2(iy0)}A${r - w} ${r - w} 0 0 ${sweep} ${f2(ix1)} ${f2(iy1)}L${f2(hi0)} ${f2(hi1)}L${f2(tip[0])} ${f2(tip[1])}`
      + `L${f2(ho0)} ${f2(ho1)}L${f2(ox1)} ${f2(oy1)}A${r + w} ${r + w} 0 0 ${1 - sweep} ${f2(ox0)} ${f2(oy0)}Z`;
  };
  const STEP_SHAPES = {
    up: tri(0, -46, -Math.PI / 2), down: tri(0, 46, Math.PI / 2), left: tri(-46, 0, Math.PI), right: tri(46, 0, 0),
    ccw: arcArrow(-0.85, -1.2), cw: arcArrow(-0.72, -0.37),
  };
  const steps = {};
  for (const [k, d] of Object.entries(STEP_SHAPES)) {
    const g = svgEl(doc, 'g', { class: 'vc-step', 'data-vc-step': k, role: 'presentation' }, stepsG);
    svgEl(doc, 'path', { d }, g);
    const bb = k === 'up' ? [-10, -56, 20, 20] : k === 'down' ? [-10, 36, 20, 20] : k === 'left' ? [-56, -10, 20, 20] : k === 'right' ? [36, -10, 20, 20] : null;
    if (bb) svgEl(doc, 'rect', { class: 'vc-hit', x: bb[0], y: bb[1], width: bb[2], height: bb[3] }, g);
    const tt = svgEl(doc, 'title', {}, g); tt.textContent = STEP_TITLES[k];
    steps[k] = g;
  }

  let home = null;
  if (typeof opts.home === 'function') {
    home = doc.createElement('button');
    home.type = 'button';
    home.className = 'vc-home';
    home.title = tr('viewcube.home.title');
    home.setAttribute('aria-label', tr('viewcube.home'));
    home.dataset.vcHome = '';
    const i = doc.createElement('i');
    i.className = 'bi bi-house'; i.setAttribute('aria-hidden', 'true');
    home.appendChild(i);
    home.addEventListener('click', () => opts.home());
    root.appendChild(home);
  }
  let menuSel = null;
  if (opts.menu && Array.isArray(opts.menu.items) && opts.menu.items.length) {
    const row = doc.createElement('div');
    row.className = 'vc-menu-row';
    menuSel = doc.createElement('select');
    menuSel.className = 'vc-menu';
    menuSel.setAttribute('aria-label', String(opts.menu.label || tr('viewcube.menu')));
    for (const it of opts.menu.items) {
      const o = doc.createElement('option');
      o.value = String(it.value); o.textContent = String(it.label);
      menuSel.appendChild(o);
    }
    if (opts.menu.value != null) menuSel.value = String(opts.menu.value);
    menuSel.addEventListener('change', () => opts.menu.onChange?.(menuSel.value));
    row.appendChild(menuSel);
    root.appendChild(row);
  }
  host.appendChild(root);

  // ---- state + drawing ----
  let view = null, oy = 0, last = '', hot = null, hotRing = false, hotLetter = null, hotStep = null, kb = null, focused = false;
  const getView = () => {
    const v = opts.getView?.();
    if (!v || !Array.isArray(v.dir) || len(v.dir) < 1e-9) return { dir: [-0.6, 0.65, -0.47], up: [0, 0, 1] };
    return v;
  };
  function ringPath(B, front) {
    // the ring's near half (towards the viewer) is drawn over the cube, the far half under it
    let d = '', pen = false;
    const N = 96;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const p = [RING.r * Math.cos(a), RING.r * Math.sin(a), RING.z];
      const s = project(view, p, B);
      const isFront = s[2] <= 1e-9;
      if (isFront === front) { d += (pen ? 'L' : 'M') + f2(s[0] * H) + ' ' + f2(s[1] * H); pen = true; } else pen = false;
    }
    return d;
  }
  function draw(force = false) {
    view = getView();
    const B = basis(view);
    const sig = [...B.d, ...B.u].map((x) => x.toFixed(5)).join(',') + '|' + north.toFixed(5) + '|' + hot + hotRing + hotLetter + hotStep + kb + focused;
    if (!force && sig === last) return;
    last = sig;
    oy = layoutOffset(view);
    stageG.setAttribute('transform', `translate(0 ${f2(oy * H)})`);
    for (const [name, F] of Object.entries(FACES)) {
      const fc = faces[name];
      const facing = -dot(F.n, B.d);
      if (facing <= 0.015) { fc.g.setAttribute('display', 'none'); continue; }
      fc.g.removeAttribute('display');
      const s = H / 50;
      const a = project(view, F.a, B), b = project(view, F.b, B), c = project(view, F.n, B);
      fc.g.setAttribute('transform', `matrix(${f4(a[0] * s)} ${f4(a[1] * s)} ${f4(b[0] * s)} ${f4(b[1] * s)} ${f2(c[0] * H)} ${f2(c[1] * H)})`);
      fc.shade.setAttribute('fill-opacity', f2((1 - facing) * 0.2));
      fc.label.setAttribute('opacity', f2(Math.max(0, Math.min(1, (facing - 0.18) * 3))));
      const want = focused && kb ? kb : hot;
      for (const cell of fc.cells) cell.classList.toggle('is-hot', !!want && cell.dataset.vcKey === want);
    }
    ringBack.setAttribute('d', ringPath(B, false));
    ringFront.setAttribute('d', ringPath(B, true));
    ringHit.setAttribute('d', ringPath(B, false) + ringPath(B, true));
    ringBack.classList.toggle('is-hot', hotRing); ringFront.classList.toggle('is-hot', hotRing);
    // edge-on the ring is a bar: draw it thinner so it reads as the ground line, not a slab
    const ringW = f2(4 + 5 * Math.min(1, Math.abs(B.d[2]) / 0.35));
    ringBack.style.strokeWidth = ringW; ringFront.style.strokeWidth = ringW;
    const P = compassPoints(view, north), vis = letterVisibility(view, north);
    for (const k of Object.keys(letters)) {
      const [x, y] = P[k];
      letters[k].t.setAttribute('x', f2(x * H)); letters[k].t.setAttribute('y', f2(y * H));
      letters[k].hit.setAttribute('cx', f2(x * H)); letters[k].hit.setAttribute('cy', f2(y * H));
      letters[k].t.classList.toggle('is-hot', hotLetter === k);
      letters[k].t.setAttribute('opacity', f2(vis[k]));
      if (vis[k] < 0.5) letters[k].hit.setAttribute('display', 'none'); else letters[k].hit.removeAttribute('display');
    }
    const fo = faceOn(view);
    if (fo) stepsG.removeAttribute('hidden'); else stepsG.setAttribute('hidden', '');
    for (const [k, g] of Object.entries(steps)) g.classList.toggle('is-hot', hotStep === k);
    // focus ring: the cube's silhouette, slightly grown
    const corners = [];
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) corners.push(project(view, [x * 1.12, y * 1.12, z * 1.12], B));
    const xs = corners.map((p) => p[0] * H), ys = corners.map((p) => p[1] * H);
    focusPath.setAttribute('d', `M${f2(Math.min(...xs))} ${f2(Math.min(...ys))}H${f2(Math.max(...xs))}V${f2(Math.max(...ys))}H${f2(Math.min(...xs))}Z`);
    const nt = nearestTarget(view);
    const from = targetLabel(nt, labels, tr, true).toLowerCase();
    svg.setAttribute('aria-label', kb ? tr('viewcube.looking-chosen', { view: from, chosen: targetLabel(kb, labels, tr) }) : tr('viewcube.looking', { view: from }));
    root.dataset.vcView = nt;
    root.dataset.vcFaceOn = fo || '';
  }

  // ---- pointer ----
  // pointer → cube units about the cube's centre (undoing the layout shift for that view)
  const local = (e, v = getView()) => {
    const r = svg.getBoundingClientRect();
    return [((e.clientX - r.left) / Math.max(r.width, 1) * 200 - 100) / H, ((e.clientY - r.top) / Math.max(r.height, 1) * 200 - 100) / H - layoutOffset(v), r.width / 200];
  };
  const go = (v) => { if (v) opts.setView?.(v, { animate: !reducedMotion() }); };
  function hitTest(e) {
    const stepEl = e.target?.closest?.('[data-vc-step]');
    if (stepEl && !stepsG.hasAttribute('hidden')) return { kind: 'step', step: stepEl.dataset.vcStep };
    const v = getView();
    const [x, y] = local(e, v);
    const key = pickTarget(v, x, y);
    if (key) return { kind: 'cube', key };
    const L = letterAt(v, x, y, north);
    if (L) return { kind: 'letter', letter: L };
    const ring = ringAt(v, x, y);
    if (ring) return { kind: 'ring', ring };
    return null;
  }
  function setHot(h) {
    hot = h?.kind === 'cube' ? h.key : null;
    hotRing = h?.kind === 'ring' || h?.kind === 'letter';
    hotLetter = h?.kind === 'letter' ? h.letter : null;
    hotStep = h?.kind === 'step' ? h.step : null;
    root.dataset.vcHot = hot || hotLetter || hotStep || (hotRing ? 'ring' : '');
    draw();
  }
  let drag = null;
  svg.addEventListener('pointermove', (e) => {
    if (!drag) { setHot(hitTest(e)); return; }
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved && Math.hypot(dx, dy) < 3) return;
    if (!drag.moved) { drag.moved = true; root.classList.add('is-drag'); }
    if (drag.hit?.kind === 'cube') {
      const ix = e.clientX - drag.lx, iy = e.clientY - drag.ly;
      drag.lx = e.clientX; drag.ly = e.clientY;
      if (typeof opts.onDrag === 'function') opts.onDrag(ix, iy);
      else opts.setView?.(orbitView(getView(), ix, iy), { animate: false });
    } else if (drag.hit?.kind === 'ring' || drag.hit?.kind === 'letter') {
      const [x, y] = local(e, drag.view);
      const r1 = ringAt(drag.view, x, y);
      let da;
      if (drag.edgeOn || !r1 || !drag.a0) da = dx * 0.012 * (drag.view.dir[2] > 0 ? -1 : 1);
      else { da = r1.angle - drag.a0; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; }
      opts.setView?.(turnView(drag.view, -da), { animate: false });
    }
    e.preventDefault();
  });
  svg.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const h = hitTest(e);
    if (!h) return;
    e.preventDefault(); e.stopPropagation();
    const v = getView();
    const [x, y] = local(e, v);
    const r0 = h.kind === 'ring' || h.kind === 'letter' ? ringAt(v, x, y) : null;
    drag = { hit: h, x0: e.clientX, y0: e.clientY, lx: e.clientX, ly: e.clientY, moved: false, view: v, a0: r0?.angle ?? null, edgeOn: Math.abs(basis(v).d[2]) < 0.2 };
    try { svg.setPointerCapture(e.pointerId); } catch { /* fine */ }
    root.classList.add('is-active');
  });
  const endDrag = (e, cancel) => {
    if (!drag) return;
    const d = drag; drag = null;
    root.classList.remove('is-drag', 'is-active');
    try { svg.releasePointerCapture(e.pointerId); } catch { /* fine */ }
    if (cancel || d.moved) return;
    kb = null;
    const v = getView();
    if (d.hit.kind === 'cube') go(viewForTarget(d.hit.key, v));
    else if (d.hit.kind === 'letter') go(viewFromLetter(d.hit.letter, v, north));
    else if (d.hit.kind === 'step') go(stepView(v, d.hit.step));
  };
  svg.addEventListener('pointerup', (e) => endDrag(e, false));
  svg.addEventListener('pointercancel', (e) => endDrag(e, true));
  svg.addEventListener('pointerleave', () => { if (!drag) setHot(null); });
  svg.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
  svg.addEventListener('contextmenu', (e) => e.preventDefault());

  // ---- keyboard ----
  // the keyboard's choice shows only when focus came from the keyboard; a click leaves the mouse's highlight alone
  svg.addEventListener('focus', () => {
    focused = true;
    let kbd = true;
    try { kbd = typeof svg.matches !== 'function' || svg.matches(':focus-visible'); } catch { /* old browsers */ }
    kb = kbd && !drag ? nearestTarget(getView()) : null;
    draw();
  });
  svg.addEventListener('blur', () => { focused = false; kb = null; draw(); });
  svg.addEventListener('keydown', (e) => {
    const k = e.key;
    const arrows = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
    let handled = true;
    if (arrows[k] && e.shiftKey && (k === 'ArrowLeft' || k === 'ArrowRight')) {
      go(turnView(getView(), (k === 'ArrowLeft' ? -1 : 1) * Math.PI / 2));
    } else if (arrows[k] && !e.ctrlKey && !e.metaKey && !e.altKey) {
      kb = keyStep(kb || nearestTarget(getView()), arrows[k], getView());
      live.textContent = targetLabel(kb, labels, tr);
      draw();
    } else if (k === 'Enter' || k === ' ') {
      go(viewForTarget(kb || nearestTarget(getView()), getView()));
    } else if (k === 'Home' && typeof opts.home === 'function') {
      opts.home();
    } else if (k === 'Escape') {
      kb = null; svg.blur();
    } else handled = false;
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  });
  // keys typed on the cube never reach the app's shortcuts
  svg.addEventListener('keyup', (e) => e.stopPropagation());
  svg.addEventListener('keypress', (e) => e.stopPropagation());

  draw(true);
  return {
    el: root,
    update() { draw(); },
    setNorth(rad) { if (Number.isFinite(rad)) { north = rad; draw(true); } },
    setVisible(on) { root.hidden = !on; if (on) draw(true); },
    setMenuValue(v) { if (menuSel) menuSel.value = String(v); },
    destroy() { root.remove(); },
  };
}

/** The corner axis icon: X red, Y green, Z blue, turning with the view (decorative; the cube is the control). */
export function mountAxisIcon(host, opts = {}) {
  const doc = host.ownerDocument;
  injectStyles(doc);
  const tr = vcTranslator(opts.i18n);
  const corner = CORNERS.includes(opts.corner) ? opts.corner : 'bottom-left';
  const root = doc.createElement('div');
  root.className = 'cc-axes at-' + corner;
  root.dataset.axisIcon = '';
  const svg = svgEl(doc, 'svg', { viewBox: '-50 -50 100 100', role: 'img', 'aria-label': tr('viewcube.axes') });
  root.appendChild(svg);
  const AX = [['x', [1, 0, 0], 'X'], ['y', [0, 1, 0], 'Y'], ['z', [0, 0, 1], 'Z']];
  const parts = AX.map(([k, , t]) => {
    const g = svgEl(doc, 'g', {}, svg);
    const ln = svgEl(doc, 'line', { class: 'ax-' + k, x1: 0, y1: 0 }, g);
    const tx = svgEl(doc, 'text', { class: 'ax-' + k }, g);
    tx.textContent = t;
    return { g, ln, tx };
  });
  svgEl(doc, 'circle', { class: 'ax-o', r: 2.5, cx: 0, cy: 0 }, svg);
  host.appendChild(root);
  let last = '';
  function draw() {
    const v = opts.getView?.();
    if (!v) return;
    const B = basis(v);
    const sig = [...B.d, ...B.u].map((x) => x.toFixed(4)).join(',');
    if (sig === last) return;
    last = sig;
    const P = AX.map(([, a]) => project(v, a, B));
    const order = [0, 1, 2].sort((i, j) => P[j][2] - P[i][2]);   // far first
    order.forEach((i) => {
      const [x, y] = P[i], p = parts[i];
      p.ln.setAttribute('x2', f2(x * 30)); p.ln.setAttribute('y2', f2(y * 30));
      const l = Math.hypot(x, y);
      p.tx.setAttribute('x', f2(x * 30 + (l > 0.05 ? (x / l) * 10 : 8)));
      p.tx.setAttribute('y', f2(y * 30 + (l > 0.05 ? (y / l) * 10 : -8)));
      p.tx.setAttribute('opacity', l < 0.15 ? '0.55' : '1');
      svg.appendChild(p.g);
    });
  }
  draw();
  return {
    el: root,
    update: draw,
    setVisible(on) { root.hidden = !on; if (on) { last = ''; draw(); } },
    destroy() { root.remove(); },
  };
}
