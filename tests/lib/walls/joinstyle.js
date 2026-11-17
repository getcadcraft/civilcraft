/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lib/walls/joinstyle.js — the join STYLE of a corner (0.9 WT.5, wall tool spec sections 5 and 8; session walls-join-10). Host-free:
 * no DOM, no IFC, no app imports; plan millimetres. BimCraft (model-walls.js wallOutlines), CadCraft plan walls (lib/plan2d/walls.js)
 * and SuperCad Studio use this one file; each host keeps only where it stores the style.
 *
 * What a style is. Two walls meet end + end at a corner (an L join). The style says how the two wall ENDS are cut:
 *   mitre    both ends are cut on the line through the inner and the outer corner (the default; what every older file has)
 *   butt     one wall RUNS THROUGH to the other wall's far (outer) face; the other STOPS against the side of the first
 *   square   "square off": as butt, but the wall that runs through ends SQUARE (at 90 degrees to itself), exactly where the other wall's
 *            far face reaches its side; the other wall stops against its side. At a right angle butt and square are the same shape.
 * `through` says which of the two walls runs through (butt, square). A T join has no choice (the wall whose side is met runs
 * through) and its geometry is not this file's; an X join only records which wall is continuous (layerjoin.js reads it).
 *
 *   cornerEnds(A, B, { style, through, tol })  → { a: { left, right }, b: { left, right }, style }
 *       A, B     the two wall ends at the corner: { p, d, h }
 *                  p  [x, y]  the corner: where the two centre lines meet (both walls give the same point, within the join tolerance)
 *                  d  [x, y]  UNIT direction along the wall's centre line, pointing OUT of the corner (from the joined end toward the
 *                             wall's other end). For a wall a→b joined at its start that is (b − a) / |b − a|; joined at its end, (a − b) / |a − b|.
 *                  h  number  half the wall's thickness (centre line to face), > 0
 *       style    'mitre' | 'butt' | 'square' (anything else = 'mitre')
 *       through  'a' | 'b': which wall runs through (default 'a'); ignored for mitre
 *       tol      mm added to the sharp-corner limit (default 1)
 *     Answer: for each wall the two points where its END is cut, named looking along d (out of the corner):
 *       left   the end of the face on the left of d      = the point on the line  p + left(d)·h + s·d
 *       right  the end of the face on the right of d     = the point on the line  p − left(d)·h + s·d        (left(d) = [−d.y, d.x])
 *     A host builds the wall's outline from them: for a wall a→b, at its START (d runs a→b) `left` is the wall's own left face and
 *     `right` its right face; at its END (d runs b→a) they swap: `left` is the wall's own RIGHT face, `right` its LEFT face.
 *     `style` in the answer is the style that was APPLIED: 'mitre' comes back when butt or square could not be made (walls in one line, or a
 *     corner so sharp that an end point would be more than SHARP × the larger half thickness (+ tol) from the corner: about under 30 or
 *     over 150 degrees between the walls). A mitre point that far away is not used either: that face ends square (p ± left(d)·h).
 *     Curved walls: not handled here; a host keeps its own mitre for a corner with a curved wall (BimCraft does).
 *
 *   The stored form (BimCraft writes it into the join record's name, "CadCraft join L butt 1"; another host may store the two fields):
 *   styleToken({ style, through })   → '' (mitre) | 'butt 1' | 'butt 2' | 'square 1' | 'square 2'   (1 = the record's first wall runs through)
 *   parseStyleToken(text)            → { style, through: 1 | 2 }; text with no style word = { style: 'mitre', through: 1 } (older records)
 *   nextStyle(style)                 mitre → butt → square → mitre (the Join style tool's click)
 */
export const JOIN_STYLES = ['mitre', 'butt', 'square'];
/** A corner whose cut end would lie further than this many (larger) half thicknesses from the corner is too sharp: it falls back. */
export const SHARP = 4;

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const left = (d) => [-d[1], d[0]];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
/** Where p1 + s·d1 meets p2 + t·d2 (null: parallel). */
function meet(p1, d1, p2, d2) {
  const c = cross(d1, d2);
  if (Math.abs(c) < 1e-9) return null;
  return add(p1, mul(d1, cross(sub(p2, p1), d2) / c));
}
const face = (W, side) => add(W.p, mul(left(W.d), W.h * side));   // a point on the wall's left (+1) or right (−1) face line
const squareEnd = (W) => ({ left: face(W, 1), right: face(W, -1) });

function mitre(A, B, limit) {
  const a = squareEnd(A), b = squareEnd(B);
  // A's left face meets B's right face (the corner on A's left), A's right meets B's left (the corner on A's right)
  const cl = meet(a.left, A.d, b.right, B.d), cr = meet(a.right, A.d, b.left, B.d);
  if (cl && dist(cl, A.p) <= limit) { a.left = cl; b.right = cl; }
  if (cr && dist(cr, A.p) <= limit) { a.right = cr; b.left = cr; }
  return { a, b, style: 'mitre' };
}

export function cornerEnds(A, B, { style = 'mitre', through = 'a', tol = 1 } = {}) {
  const limit = SHARP * Math.max(A.h, B.h) + tol;
  if (style !== 'butt' && style !== 'square') return mitre(A, B, limit);
  const T = through === 'b' ? B : A, S = through === 'b' ? A : B;   // T runs through, S stops against its side
  const turn = cross(T.d, S.d);
  if (Math.abs(turn) < 1e-9) return mitre(A, B, limit);   // in one line: nothing to butt against
  const sideS = turn > 0 ? 1 : -1;        // S lies on this side of T (+1 = T's left)
  const near = face(T, sideS);            // T's face that S stops against
  const far = face(S, sideS);             // S's face away from T's body: T lies on S's −sideS side (cross(S.d, T.d) = −turn), so the far face is S's sideS side
  const s = { left: meet(face(S, 1), S.d, near, T.d), right: meet(face(S, -1), S.d, near, T.d) };
  let t;
  if (style === 'butt') t = { left: meet(face(T, 1), T.d, far, S.d), right: meet(face(T, -1), T.d, far, S.d) };
  else {
    const X = meet(near, T.d, far, S.d);   // where the stopping wall's far face reaches the through wall's side
    const at = X ? add(T.p, mul(T.d, dot(sub(X, T.p), T.d))) : null;
    t = at ? { left: add(at, mul(left(T.d), T.h)), right: add(at, mul(left(T.d), -T.h)) } : { left: null, right: null };
  }
  const pts = [s.left, s.right, t.left, t.right];
  if (pts.some((q) => !q || dist(q, T.p) > limit)) return mitre(A, B, limit);
  return through === 'b' ? { a: s, b: t, style } : { a: t, b: s, style };
}

export function styleToken({ style = 'mitre', through = 1 } = {}) {
  return style === 'butt' || style === 'square' ? style + ' ' + (through === 2 ? 2 : 1) : '';
}
export function parseStyleToken(text) {
  const m = /(?:^|\s)(butt|square)(?:\s+([12]))?(?=\s|$)/.exec(String(text || ''));
  return m ? { style: m[1], through: m[2] === '2' ? 2 : 1 } : { style: 'mitre', through: 1 };
}
export const nextStyle = (style) => JOIN_STYLES[(Math.max(0, JOIN_STYLES.indexOf(style)) + 1) % JOIN_STYLES.length];
