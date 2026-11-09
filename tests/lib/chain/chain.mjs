/* SPDX-License-Identifier: Apache-2.0 */
/**
 * chain.mjs — roller-chain sprockets from the chain's own geometry (0.9 SU.961, session sprocket-09). DOM-free, imports nothing.
 *
 * The chain NUMBERS (pitch, roller diameter, inner width, plate depth per chain designation) are DATA: lib/chain/chain-table.json,
 * copied from ISO 606 or ANSI B29.1 by a person who holds the standard. Nothing in this file is a table value. Everything else is
 * computed from a row { chain, pitch, roller, inner, plate } (mm):
 *
 *   pitch diameter     D  = p / sin(180° / N)                       (the chain's pitch polygon is inscribed in this circle)
 *   seat radius        rs = d/2 + c      c = seat clearance, a generator parameter (default 0.02 d, NOT a value of the standard)
 *   root diameter      Df = D − 2 rs     (the seat arc bottoms out on the root circle)
 *   tooth profile      per gap: the seat arc of radius rs around the roller centre (on the pitch circle), swept ±β from the
 *                      direction to the sprocket centre; then the flank, the straight tangent to the seat circle at the arc end;
 *                      the two flanks of a tooth meet on its centre line (a point) or are cut by the tip circle Dt.
 *                      β (default 80°) and Dt (default D + 0.7 p; was 0.6 p until 2026-11-06, when the real chain rows showed the 25 to 28 tooth sprockets touching the swinging roller at the tip edge) are generator parameters, NOT values of the standard; set them from
 *                      the standard's tooth form when you hold it. meshCheck() proves the result against the chain it was made for.
 *   tooth width        tw = ratio · inner width (default 0.9: a design choice, set it from the standard)
 *
 * API
 *   validateTable(t)                      → { ok, errors[] }
 *   sprocketDims(row, N, opts)            → { N, pitch, roller, D, Df, Dt, rs, beta, tooth width … } or throws Error naming the cause
 *   toothProfile(row, N, opts)            → closed outline [[x,y]…] of the whole sprocket (centre at 0,0, gap 0 on +x)
 *   chainRollers(row, N)                  → roller centres [[x,y]…] wrapped on the pitch circle (gap k at angle 2πk/N)
 *   meshCheck(row, N, opts)               → { ok, minClearance, minSeatGap, entering, rollerRadius … } roller discs vs outline
 *   sprocketItem(row, N, o)               → a Library item (format 1, kind detail, plan = the real outline, box body)
 *   DEFAULTS
 */

export const DEFAULTS = Object.freeze({ seatClearance: 0.02, seatHalfAngle: 80, tipAbovePitch: 0.35, toothWidthRatio: 0.9, arcSteps: 16 });

const D2R = Math.PI / 180;
const need = (cond, msg) => { if (!cond) throw new Error(msg); };
const num = (v) => typeof v === 'number' && Number.isFinite(v) && v > 0;

export function validateTable(t) {
  const errors = [];
  if (!t || t.format !== 'cadcraft-chain-table') errors.push('not a cadcraft-chain-table');
  const rows = t && Array.isArray(t.rows) ? t.rows : null;
  if (!rows) errors.push('no rows array');
  const seen = new Set();
  (rows || []).forEach((r, i) => {
    const w = 'row ' + (i + 1);
    if (!r || typeof r.chain !== 'string' || !r.chain.trim()) errors.push(w + ': chain designation missing');
    else if (seen.has(r.chain)) errors.push(w + ': chain ' + r.chain + ' twice'); else seen.add(r.chain);
    for (const k of ['pitch', 'roller', 'inner']) if (!r || !num(r[k])) errors.push(w + ': ' + k + ' must be a positive number (mm)');
    if (r && r.plate != null && !num(r.plate)) errors.push(w + ': plate must be a positive number (mm) or null when no two sources agree');
    if (r && num(r.pitch) && num(r.roller) && !(r.roller < r.pitch)) errors.push(w + ': roller diameter must be smaller than the pitch');
    if (r && num(r.inner) && num(r.pitch) && !(r.inner < r.pitch)) errors.push(w + ': inner width must be smaller than the pitch');
  });
  if (rows && rows.length && !(t.standard && t.source)) errors.push('standard and source must say which edition the rows were copied from');
  if (rows && rows.length && t.format_version >= 2) (rows || []).forEach((r, i) => { if (!r.checks || !['pitch', 'roller', 'inner'].every((k) => r.checks[k] && Array.isArray(r.checks[k].agree) && r.checks[k].agree.length >= 2)) errors.push('row ' + (i + 1) + ': each of pitch, roller, inner needs two agreeing sources in checks'); });
  return { ok: errors.length === 0, errors };
}

export function sprocketDims(row, N, o = {}) {
  need(row && num(row.pitch) && num(row.roller) && num(row.inner), 'chain row needs pitch, roller, inner');
  need(Number.isInteger(N) && N >= 6, 'tooth count must be a whole number of at least 6');
  const c = o.seatClearance ?? DEFAULTS.seatClearance, beta = o.seatHalfAngle ?? DEFAULTS.seatHalfAngle;
  const p = row.pitch, d = row.roller;
  const D = p / Math.sin(Math.PI / N), rs = d / 2 * (1 + c);
  const Dt = o.tipDiameter ?? D + 2 * DEFAULTS.tipAbovePitch * p;
  need(beta > 0 && beta < 90 + 1e-9, 'seat half angle must be above 0 and at most 90 degrees');
  need(Dt > D, 'tip circle must lie outside the pitch circle');
  const Df = D - 2 * rs;
  need(Df > 0, 'the roller does not fit: root diameter would be ' + Df.toFixed(3) + ' for ' + N + ' teeth');
  need(2 * rs < p, 'seat diameter reaches the pitch: the chain does not fit');
  return { N, pitch: p, roller: d, inner: row.inner, D, Df, Dt, rs, beta, toothWidth: row.inner * (o.toothWidthRatio ?? DEFAULTS.toothWidthRatio) };
}

const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

/** One half-gap of tooth k: the seat arc from the root (φ = 0) to the flank start, then the flank to its end. Returns { arc, flankEnd, apex|null } for the + side. */
function plusSide(g, steps) {
  const R = g.D / 2, beta = g.beta * D2R;
  const arc = [];
  for (let i = 0; i <= steps; i++) {      // from the root up to the flank start, on the + side (towards the next tooth centre)
    const phi = beta * i / steps;
    const ux = -Math.cos(phi), uy = Math.sin(phi);   // from the roller centre (R, 0): φ = 0 points at the sprocket centre (-1, 0), φ > 0 turns towards +y, the next tooth
    arc.push([R + g.rs * ux, g.rs * uy]);
  }
  const P = arc[arc.length - 1];
  const tx = Math.sin(beta), ty = Math.cos(beta);   // tangent in the direction of increasing φ
  need(P[0] * tx + P[1] * ty > 0, 'seat angle too small: the flank does not rise away from the root');
  const half = Math.PI / g.N;             // the tooth centre line sits at this angle
  const at = (s) => [P[0] + s * tx, P[1] + s * ty];
  const rad = (s) => Math.hypot(...at(s));
  const ang = (s) => { const q = at(s); return Math.atan2(q[1], q[0]); };
  // s where the flank reaches the tip circle, s where it crosses the tooth centre line (a point tooth)
  let lo = 0, hi = g.Dt; while (rad(hi) < g.Dt / 2) hi *= 2;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (rad(m) < g.Dt / 2) lo = m; else hi = m; }
  const sTip = (lo + hi) / 2;
  let sAxis = null;
  if (ang(sTip) >= half) {
    let a = 0, b = sTip; for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if (ang(m) < half) a = m; else b = m; }
    sAxis = (a + b) / 2;
  }
  const flankEnd = at(sAxis ?? sTip);
  return { arc, flankEnd, apex: sAxis !== null };
}

export function toothProfile(row, N, o = {}) {
  const g = sprocketDims(row, N, o), steps = o.arcSteps ?? DEFAULTS.arcSteps;
  const h = plusSide(g, steps), pts = [];
  const mirror = (q) => [q[0], -q[1]];
  const step = 2 * Math.PI / N;
  for (let k = 0; k < N; k++) {
    const a = k * step, add = (q) => pts.push(rot(q[0], q[1], a));
    // gap k: minus flank (from the previous tooth) down the − side, the seat arc through the root, the + flank up
    add(mirror(h.flankEnd));
    for (let i = h.arc.length - 1; i > 0; i--) add(mirror(h.arc[i]));
    for (let i = 0; i < h.arc.length; i++) add(h.arc[i]);
    // the tooth between gap k and k+1: flank end of gap k (+ side) to the mirrored flank end of gap k+1
    add(h.flankEnd);
    if (!h.apex) {                         // a flat/rounded tip: along the tip circle
      const e0 = Math.atan2(h.flankEnd[1], h.flankEnd[0]), e1 = step - e0, n = 4;
      for (let i = 1; i < n; i++) { const t = e0 + (e1 - e0) * i / n; pts.push(rot(g.Dt / 2 * Math.cos(t), g.Dt / 2 * Math.sin(t), a)); }
    }
  }
  // the last pushed point of each tooth equals the first of the next gap's minus flank end: drop exact repeats
  const out = [];
  for (const q of pts) { const l = out[out.length - 1]; if (!l || Math.hypot(q[0] - l[0], q[1] - l[1]) > 1e-9) out.push(q); }
  return out;
}

export function chainRollers(row, N) {
  const R = row.pitch / Math.sin(Math.PI / N) / 2;
  return Array.from({ length: N }, (_, k) => [R * Math.cos(2 * Math.PI * k / N), R * Math.sin(2 * Math.PI * k / N)]);
}

function distToPolyline(p, poly) {
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0;
    best = Math.min(best, Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy));
  }
  return best;
}

/**
 * Roller discs against the outline. Seated: every roller of the wrapped chain keeps at least `roller radius` from the outline
 * (clearance = distance − radius ≥ 0 means no overlap) and the nearest outline point is the seat arc (distance = rs). Entering:
 * the free strand leaves the last seated roller along the tangent of the pitch circle, one pitch long; the roller at its end must not
 * overlap the outline either (a tooth tip in the way would show here). Distances are to the sampled outline, so the tolerance is the
 * arc sampling sag (rs · (1 − cos(β / steps / 2)) at most).
 */
export function meshCheck(row, N, o = {}) {
  const g = sprocketDims(row, N, o), poly = toothProfile(row, N, o), r = row.roller / 2;
  const R = g.D / 2, rollers = chainRollers(row, N);
  let minClearance = Infinity, minSeatGap = Infinity, maxSeatGap = -Infinity;
  for (const c of rollers) {
    const d = distToPolyline(c, poly);
    minClearance = Math.min(minClearance, d - r);
    minSeatGap = Math.min(minSeatGap, d - g.rs); maxSeatGap = Math.max(maxSeatGap, d - g.rs);
  }
  const sag = g.rs * (1 - Math.cos(g.beta * D2R / (o.arcSteps ?? DEFAULTS.arcSteps) / 2));
  // Engagement. A link pivots on the seated roller at gap 0 and swings the next roller outward from its seat (gap 1) on the circle of
  // radius p about roller 0, from ψ = 0 (seated) to the free strand, the tangent of the pitch circle (ψ = 360°/N). The roller meets the
  // tooth between them at some ψ_touch: from there the chain rides the flank (chordal action). A straight strand cannot be required to
  // clear the tooth (a tooth tilted by up to 360°/N does not pass between two rollers one pitch apart), so what is checked is that the
  // roller is free to leave its seat (ψ_touch > 0) and that first contact is on the flank, below the tip circle, never on the tip edge (a graze of the tip corner in the last 10 % of the swing, where the strand is nearly free, is allowed).
  const c0 = rollers[0], c1 = rollers[1 % N], psiMax = 2 * Math.PI / N, base = Math.atan2(c1[1] - c0[1], c1[0] - c0[0]);
  const at = (psi) => [c0[0] + row.pitch * Math.cos(base - psi), c0[1] + row.pitch * Math.sin(base - psi)];
  let psiTouch = psiMax, contactRadius = null;
  for (let i = 1; i <= 400; i++) {
    const psi = psiMax * i / 400, q = at(psi);
    if (distToPolyline(q, poly) - r < -sag - 1e-9) { psiTouch = psiMax * (i - 1) / 400; break; }
  }
  if (psiTouch < psiMax) {      // where on the outline: the nearest outline point to the roller at first contact
    const q = at(Math.min(psiMax, psiTouch + psiMax / 400)); let best = Infinity;
    for (const pt of poly) { const d = Math.hypot(pt[0] - q[0], pt[1] - q[1]); if (d < best) { best = d; contactRadius = Math.hypot(pt[0], pt[1]); } }
  }
  const entering = { psiTouchDeg: psiTouch / D2R, freeSwingDeg: psiMax / D2R, free: psiTouch >= psiMax, contactRadius };
  const enteringOk = psiTouch >= 0 && (entering.free || (psiTouch > 0 && (contactRadius < g.Dt / 2 - 1e-6 || psiTouch >= 0.9 * psiMax)));
  return { ok: minClearance >= -sag - 1e-9 && enteringOk, minClearance, minSeatGap, maxSeatGap, entering, rollerRadius: r, seatRadius: g.rs, sag };
}

/** A Library item for N teeth: the real outline as one closed poly, the pitch circle as a centre line, the bore and hub. */
export function sprocketItem(row, N, o = {}) {
  const g = sprocketDims(row, N, o), poly = toothProfile(row, N, o);
  const bore = o.bore ?? Math.max(0, Math.round(g.Df / 3));
  const hubDia = o.hubDiameter ?? Math.min(g.Df - 2 * g.rs, Math.max(bore * 1.6, bore + 10));
  const hubLen = o.hubLength ?? Math.round(row.inner * 1.5 * 10) / 10;
  need(bore < hubDia && hubDia < g.Df, 'bore and hub do not fit inside the root circle');
  const total = g.toothWidth + hubLen, f = (v) => Math.round(v * 1000) / 1000;
  const name = 'Roller chain sprocket ' + row.chain + ', ' + N + ' teeth, bore ' + f(bore);
  const L = (n, c) => ({ name: n, color: c });
  return {
    format: 'cadcraft-library-item', format_version: 1, name, kind: 'detail', category: 'mechanical/parts',
    description: 'Roller chain sprocket for chain ' + row.chain + ' (pitch ' + f(row.pitch) + ' mm, roller ' + f(row.roller) + ' mm), ' + N + ' teeth. Pitch diameter ' + f(g.D) +
      ' mm, root ' + f(g.Df) + ' mm, tip ' + f(g.Dt) + ' mm, tooth width ' + f(g.toothWidth) + ' mm, bore ' + f(bore) + ' mm, hub ' + f(hubDia) + ' x ' + f(hubLen) +
      ' mm. Face view drawn tooth by tooth: the seating curve and flank are computed from the chain geometry (seat radius ' + f(g.rs) + ' mm), see lib/chain. Chain numbers from ' + (o.standardTitle || 'the owner\'s chain table') + '.',
    maker: '', model: '',
    plan: {
      layers: [L('PART', 7), L('PART-THIN', 8), L('PART-CENTER', 1)],
      entities: [
        { type: 'poly', layer: 'PART', color: null, closed: true, pts: poly.map((q) => [f(q[0]), f(q[1])]) },
        { type: 'circle', layer: 'PART-CENTER', color: null, x: 0, y: 0, r: f(g.D / 2) },
        { type: 'circle', layer: 'PART-THIN', color: null, x: 0, y: 0, r: f(hubDia / 2) },
        { type: 'circle', layer: 'PART', color: null, x: 0, y: 0, r: f(bore / 2) },
        { type: 'line', layer: 'PART-CENTER', color: null, x1: -f(g.Dt / 2 + 3), y1: 0, x2: f(g.Dt / 2 + 3), y2: 0 },
        { type: 'line', layer: 'PART-CENTER', color: null, x1: 0, y1: -f(g.Dt / 2 + 3), x2: 0, y2: f(g.Dt / 2 + 3) },
      ],
    },
    body: { type: 'box', x: -f(g.Dt / 2), y: -f(g.Dt / 2), z: 0, w: f(g.Dt), d: f(g.Dt), h: f(total) },
    params: { width: f(g.Dt), depth: f(g.Dt), height: f(total) },
    source_attrs: { 'CC-PART-TYPE': 'Roller chain sprocket', 'CC-PART-STD': o.standardName || '', 'CC-PART-SIZE': row.chain + ', z ' + N, 'CC-PART-MATERIAL': 'Steel' },
  };
}
