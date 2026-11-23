/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and keys; panel.js shows the words. */
/**
 * model.js — the Outdoor noise add-on's work on a CivilCraft project (0.11 XE.3 S4, sound-11). No DOM: tools/acoustics-test/noise-addon-test.mjs runs it in Node.
 * The method is lib/acoustics (copied into ./lib by `node tools/acoustics/sync.mjs civilcraft-noise`): outdoor.js (CNOSSOS-EU § 2.5 propagation), pathfind.js
 * (the reflected and lateral paths, the railway-barrier equivalent source), road.js (§ 2.2), rail.js (§ 2.3). CivilCraft gives the ground (its existing-ground
 * TIN, cut exactly along each path by terrain-section.js) and the geometry.
 *
 *   computeNoise({ project, settings, emission, terrain }) → { ok, receivers: [{ id, name, x, y, h, periods: { day, evening, night: { LAeq, bands[8], top: [{ source, LAeq }], paths } } }], sources, notes, problems }
 *     settings = {
 *       ground:      G of the ground between sources and receivers (Table 2.5.a), one value for the project
 *       periods:     { day: { p, hours }, evening: {…}, night: {…} }   p = occurrence of favourable conditions (eq. 2.5.9), hours = Tref (eq. 2.4.2)
 *       lines:       { [alignmentId]: { kind: 'road'|'rail'|'off', day, evening, night: the emission inputs of that period, surface?, track?, cref? } }
 *                    cref = the railway vehicle body's reflection coefficient Cref of eq. 2.5.45 (1; 0 for open flat-bed freight wagons)
 *       points:      [{ id, name, x, y, h, lw: [8], hours: { day, evening, night } }]   industrial point sources (§ 2.4)
 *       receivers:   [{ id, name, x, y, h }]                      plan coordinates in project units, h above the ground in metres
 *       barriers:    { [featureId]: { height, alpha? } }           a feature line as a thin vertical barrier; alpha = αr of its faces (eq. 2.5.35; one value or 8)
 *       buildings:   { [featureId]: { height, alpha? } }           a CLOSED feature line as a building footprint of that height; alpha = αr of its façades
 *       reflections: 0 | 1 | 2                                     the highest order of reflection (default 1; the 2015 text: "at least the first reflection")
 *       limits:      { day?, evening?, night? }                    the person's own targets in dB(A): a receiver above one is a warning in Problems
 *     }
 *     emission = { road(input) → { ok, lwPerMetre: [8], sourceHeight, notes }, rail(input) → { ok, sources: [{ h, kind, thirds, lwPerMetre: [8] }], notes } }
 *     terrain  = { cutSection, crossing, flatten } from CivilCraft's terrain-section.js
 *
 * Paths from each source piece to each receiver:
 *  - the direct path in the vertical plane (§ 2.5.6), over the terrain, thin barriers (one wall each) and buildings (a block: foot, roof, roof, foot; the
 *    roof is the building's height over the lowest ground at its corners; G = 0 on the roof);
 *  - reflections off barrier faces and building façades by image sources (Figure 2.5.g, pathfind.js), order 1 or 2: the image's power is eq. 2.5.35 and
 *    each reflection costs Δretrodif (eq. 2.5.36–2.5.37) in each condition, from the reflector's top over the reflection point; a reflection the ray passes
 *    over (straight in H, the arc of eq. 2.5.24 in F) does not exist in that condition. A façade within 0.2 m of the receiver is not a reflector
 *    ("reflections from the façade being considered shall be excluded", Annex II § 2.8, 2021);
 *  - lateral paths round vertical edges (eq. 2.5.33–2.5.34, 2021 point (9)(i)) for INDUSTRIAL POINT SOURCES only, when the direct ray is clear of the
 *    terrain and blocked by barriers or buildings: up to two, in H, and in F only where the curved ray is blocked too;
 *  - railways: directivity (eq. 2.3.15–2.3.17) toward each path's first leg, and a barrier crossed by the direct path within 5 × its height of the track
 *    turns the source into the equivalent source of eq. 2.5.39–2.5.48 (the barrier's α, the line's Cref).
 * Line sources are cut into pieces no longer than half their distance to the receiver (§ 2.4.1), at most 25 m and at least 0.25 m; each piece radiates
 * LW′ + 10 lg(length). Plan distances in feet projects are US survey feet (1200/3937 m), as the rest of CivilCraft.
 *
 * Design levels (0.11 XE.3, sound-11): a road or track with a design profile (its PVIs, CivilCraft's designProfile) puts each piece's source on that profile
 * (0.05 m above it for a road, § 2.2.1 as amended in 2021; 0.5 m and 4 m for rail, § 2.3.1), and the ground between source and receiver is the GRADED
 * surface (existing ground with the corridors, pads and grading cut and filled in, project.graded()) wherever the project has one, else the existing ground.
 * A station outside the profile keeps the ground. `settings.design = false` goes back to the existing ground for both.
 *
 * Honest limits (said in `notes`): one G for the whole project except the source area (Gs: road 0, rail on ballast 1, eq. 2.5.14); a lateral path's ground leaves out thin
 * barriers it passes.
 *
 * Lden and Lnight (Directive 2002/49/EC Annex I, lib/acoustics/indicators.js): from the three period levels with the period hours of `settings.periods`
 * (12, 4, 8, or an evening shortened by one or two hours, Annex I § 1); `res.Lden`, `res.Lnight`; `settings.limits.den` warns like the period limits.
 * The façade a receiver stands on is never a reflector (FACADE_GAP), so the levels are incident sound as Annex I asks.
 */
import { pathLevels, lateralLevels, sumLevels, workingHours, longTerm } from './lib/outdoor.js';
import { reflectedPaths, lateralPaths, segHit, rayAbove, retroDelta, retroDif, reflectorOk, trainBarrierSource, wavelengths } from './lib/pathfind.js';
import { railDirectional } from './lib/rail.js';
import { OCTAVES, AWC, GS, C_SOUND } from './lib/cnossos.js';
import { lden, assessmentNotes } from './lib/indicators.js';

export const PERIODS = ['day', 'evening', 'night'];
const toMetres = (units) => (units === 'm' ? 1 : 1200 / 3937);
const LAMBDAS = wavelengths(OCTAVES);
const FACADE_GAP = 0.2;   // m: a façade this close to the receiver is the one it stands on
const alphaBands = (a) => (Array.isArray(a) && a.length === 8 ? a.map((v) => clampA(v)) : OCTAVES.map(() => clampA(a)));
function clampA(v) { const x = Number(v); return Number.isFinite(x) ? Math.min(0.99, Math.max(0, x)) : 0; }

/** The plan line of an alignment cut into pieces, each with its middle and its direction of travel. */
function linePieces(al, R, k, prof = null) {
  const out = [], end = al.end;
  let s = al.start;
  while (s < end - 1e-9) {
    const p = al.pointAt(s), d = Math.hypot(p.x - R.x, p.y - R.y) * k;
    const len = Math.min(end - s, Math.max(0.25 / k, Math.min(25 / k, d / 2 / k)));
    const a = al.pointAt(s), b = al.pointAt(s + len), m = al.pointAt(s + len / 2);
    const z = prof ? prof.elevationAt(s + len / 2) : null;   // the design level at the piece's middle (project units), or null: the ground
    out.push({ x: m.x, y: m.y, len: len * k, dir: { x: b.x - a.x, y: b.y - a.y }, z: Number.isFinite(z) ? z : null });
    s += len;
  }
  return out;
}
const pointInPoly = (P, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a.y > P.y) !== (b.y > P.y) && P.x < (b.x - a.x) * (P.y - a.y) / (b.y - a.y) + a.x) c = !c; } return c; };

/** The ground (project units) at each vertex of a polyline, from the TIN cut along it; null where there is no surface. */
function groundAtVertices(pts, ctx) {
  if (!ctx.surface) return pts.map(() => 0);
  const sec = ctx.terrain.cutSection(ctx.surface, pts);
  const fl = sec.runs.length ? ctx.terrain.flatten(sec.runs) : [];
  if (fl.length < 1) return pts.map(() => 0);
  const zAt = (o) => { let best = fl[0]; for (const p of fl) if (Math.abs(p.o - o) < Math.abs(best.o - o)) best = p; for (let i = 0; i + 1 < fl.length; i++) if (o >= fl[i].o && o <= fl[i + 1].o && fl[i + 1].o > fl[i].o) return fl[i].z + (fl[i + 1].z - fl[i].z) * (o - fl[i].o) / (fl[i + 1].o - fl[i].o); return best.z; };
  let o = 0; return pts.map((p, i) => { if (i) o += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y); return zAt(o); });
}

/**
 * The profile along a plan polyline (project units) in metres: the TIN cut exactly, thin walls where a barrier is crossed, blocks where a building is
 * crossed. Crossings at the polyline's own vertices (its ends and its reflection points) are not walls: the reflector a path touches does not block it.
 */
function profileOf(plan, ctx, { walls = true, z0 = null } = {}) {
  const { surface, terrain, barriers, buildings, k, G } = ctx;
  const legs = []; let acc = 0;
  for (let i = 0; i + 1 < plan.length; i++) { const l = Math.hypot(plan[i + 1].x - plan[i].x, plan[i + 1].y - plan[i].y); legs.push({ p: plan[i], q: plan[i + 1], o: acc, l }); acc += l; }
  const L = acc * k, verts = [0, ...legs.map((g) => (g.o + g.l) * k)];
  let T = [];
  if (surface) { const sec = terrain.cutSection(surface, plan); if (sec.runs.length) T = terrain.flatten(sec.runs).map((p) => ({ x: p.o * k, z: p.z * k })); }
  const flat = T.length < 2;
  if (flat) T = [{ x: 0, z: 0 }, { x: L, z: 0 }];
  if (T[0].x > 1e-6) T.unshift({ x: 0, z: T[0].z });
  if (T[T.length - 1].x < L - 1e-6) T.push({ x: L, z: T[T.length - 1].z });
  if (Number.isFinite(z0)) T[0] = { x: 0, z: z0 };   // the source stands on the design road, not on the ground under it
  const zAt = (x) => { for (let i = 0; i + 1 < T.length; i++) if (x >= T[i].x && x <= T[i + 1].x) { const a = T[i], b = T[i + 1]; return b.x > a.x ? a.z + (b.z - a.z) * (x - a.x) / (b.x - a.x) : a.z; } return x <= 0 ? T[0].z : T[T.length - 1].z; };
  const atVertex = (x) => verts.some((v) => Math.abs(v - x) < 0.01);
  const hits = (segs) => { const out = []; for (const g of legs) for (const [a, b] of segs) { const h = segHit(g.p, g.q, a, b); if (h) { const x = (g.o + h.t * g.l) * k; if (!atVertex(x)) out.push(x); } } return out.sort((a, b) => a - b); };
  const items = [];   // { x, ord, z, g }
  if (walls) for (const b of barriers) for (const x of hits(b.segs)) { const z = zAt(x); items.push({ x, ord: 0, z, g: G }, { x, ord: 1, z: z + b.height, g: G }, { x, ord: 2, z, g: G }); }
  const blocks = [];
  for (const B of buildings) {
    const xs = hits(B.segs);
    if (pointInPoly(plan[0], B.pts) || pointInPoly(plan[plan.length - 1], B.pts)) return { inside: true };
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const x1 = xs[i], x2 = xs[i + 1], roof = B.roof * k;
      blocks.push([x1, x2]);
      items.push({ x: x1, ord: 0, z: zAt(x1), g: G }, { x: x1, ord: 1, z: roof, g: 0 }, { x: x2, ord: 0, z: roof, g: G }, { x: x2, ord: 1, z: zAt(x2), g: G });
    }
  }
  const inBlock = (x) => blocks.some(([a, b]) => x > a - 1e-6 && x < b + 1e-6);
  const near = (x) => items.some((it) => Math.abs(it.x - x) < 1e-6);
  for (const p of T) if (!inBlock(p.x) && !near(p.x)) items.push({ x: p.x, ord: -1, z: p.z, g: G });
  items.sort((a, b) => a.x - b.x || a.ord - b.ord);
  return { profile: items.map((p) => ({ x: p.x, z: p.z, g: p.g })), terrain: T, flat, L, zAt };
}

/** Rail: the source's octave power per metre toward a plan direction from the piece (φ from the direction of travel, ψ the elevation, Figure 2.3.b). */
function railLw(part, piece, toward, dz, k) {
  if (!part.thirds || !piece.dir) return part.lwPerMetre;
  const dx = toward.x - piece.x, dy = toward.y - piece.y, dl = Math.hypot(dx, dy) * k, tl = Math.hypot(piece.dir.x, piece.dir.y);
  if (!(dl > 0) || !(tl > 0)) return part.lwPerMetre;
  const cos = Math.min(1, Math.max(-1, (dx * piece.dir.x + dy * piece.dir.y) / (Math.hypot(dx, dy) * tl)));
  return railDirectional({ kind: part.kind, thirds: part.thirds }, Math.atan2(dz, dl), Math.acos(cos));
}

export function computeNoise({ project, settings = {}, emission, terrain }) {
  const st = project.state, k = toMetres(st.units), notes = [], problems = [];
  const design = settings.design !== false;
  const eg = project.eg ? project.eg().surface : null;
  let graded = null;
  if (design && eg && typeof project.graded === 'function') { try { graded = project.graded().surface || null; } catch { graded = null; } }
  const surface = graded || eg;
  if (!surface) notes.push({ key: 'nz.note.flat' });
  else notes.push({ key: graded ? 'nz.note.graded' : 'nz.note.eg' });
  const G = Number.isFinite(settings.ground) ? Math.min(1, Math.max(0, settings.ground)) : 0.5;
  const order = [0, 1, 2].includes(Number(settings.reflections)) ? Number(settings.reflections) : 1;
  const periods = settings.periods || {};
  const ctx0 = { surface, terrain, k };
  // barriers and buildings, with the ground under them (project units)
  const barriers = [], buildings = [], reflectors = [];
  for (const f of st.features || []) {
    const pts = (f.pts || []).map((p) => ({ x: p.x, y: p.y }));
    const b = settings.barriers?.[f.id], B = settings.buildings?.[f.id];
    if (b && b.height > 0 && pts.length >= 2) {
      const gz = groundAtVertices(pts, ctx0), segs = [];
      for (let i = 0; i + 1 < pts.length; i++) segs.push([pts[i], pts[i + 1]]);
      const bar = { id: f.id, name: f.name, pts, segs, height: Number(b.height), alpha: alphaBands(b.alpha), top: pts.map((p, i) => gz[i] + Number(b.height) / k) };
      barriers.push(bar);
      segs.forEach(([a, c], i) => reflectors.push({ id: f.id + ':' + i, a, b: c, owner: bar, kind: 'barrier' }));
    } else if (B && B.height > 0 && pts.length >= 3) {
      const ring = Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y) < 1e-9 ? pts.slice(0, -1) : pts;
      if (ring.length < 3) continue;
      const gz = groundAtVertices(ring, ctx0), base = Math.min(...gz), segs = [];
      for (let i = 0; i < ring.length; i++) segs.push([ring[i], ring[(i + 1) % ring.length]]);
      let area = 0; for (let i = 0; i < ring.length; i++) { const a = ring[i], c = ring[(i + 1) % ring.length]; area += a.x * c.y - c.x * a.y; }
      const out = area > 0 ? -1 : 1;   // counter-clockwise ring: the outside is right of each edge
      const bld = { id: f.id, name: f.name, pts: ring, segs, height: Number(B.height), alpha: alphaBands(B.alpha), roof: base + Number(B.height) / k };
      buildings.push(bld);
      segs.forEach(([a, c], i) => reflectors.push({ id: f.id + ':' + i, a, b: c, side: out, owner: bld, kind: 'building' }));
    }
  }
  const ctx = { ...ctx0, barriers, buildings, G };
  // the sources of each period
  const sources = [], designed = [];
  for (const a of st.alignments || []) {
    const set = settings.lines?.[a.id];
    if (!set || set.kind === 'off' || !set.kind) continue;
    const al = project.alignment(a);
    if (!al || !al.ok) { notes.push({ key: 'nz.note.badline', name: a.name }); continue; }
    const per = {};
    for (const P of PERIODS) {
      const input = set[P];
      if (!input) continue;
      if (set.kind === 'road') {
        const r = emission.road({ ...input, surface: set.surface ?? input.surface });
        if (!r.ok) { notes.push({ key: 'nz.note.emission', name: a.name, period: P, why: r.reason || '' }); continue; }
        per[P] = [{ h: r.sourceHeight, lwPerMetre: r.lwPerMetre }];
        for (const n of r.notes || []) notes.push({ ...n, name: a.name, period: P });
      } else if (set.kind === 'rail') {
        const r = emission.rail({ ...input, track: set.track ?? input.track });
        if (!r.ok) { notes.push({ key: 'nz.note.emission', name: a.name, period: P, why: r.reason || '' }); continue; }
        per[P] = r.sources.map((s) => ({ h: s.h, kind: s.kind, thirds: s.thirds, lwPerMetre: s.lwPerMetre }));
        for (const n of r.notes || []) notes.push({ ...n, name: a.name, period: P });
      }
    }
    let prof = null;
    if (design && (a.pvis || []).length >= 2 && typeof project.designProfile === 'function') {
      try { prof = project.designProfile(a); } catch { prof = null; }
      if (prof && prof.errors?.length) { notes.push({ key: 'nz.note.badprofile', name: a.name }); prof = null; }
    }
    if (prof) designed.push(a.name);
    sources.push({ id: a.id, name: a.name, kind: set.kind, al, prof, per, gs: set.kind === 'road' ? GS.road : GS.ballast, cref: set.cref === 0 || set.cref === '0' ? 0 : 1 });
  }
  for (const pnt of settings.points || []) {
    if (!Array.isArray(pnt.lw) || pnt.lw.length !== 8 || !Number.isFinite(pnt.x) || !Number.isFinite(pnt.y)) { notes.push({ key: 'nz.note.badpoint', name: pnt.name || pnt.id }); continue; }
    const per = {};
    for (const P of PERIODS) {
      const T = Number(pnt.hours?.[P]), Tref = Number(periods[P]?.hours);
      if (!(T > 0) || !(Tref > 0)) continue;
      const cw = workingHours(Math.min(T, Tref), Tref);                                    // eq. 2.4.2
      per[P] = [{ h: Number(pnt.h) || 0, lw: pnt.lw.map((v) => v + cw) }];
    }
    sources.push({ id: pnt.id, name: pnt.name || pnt.id, kind: 'point', at: { x: pnt.x, y: pnt.y }, per, gs: Number.isFinite(pnt.gs) ? pnt.gs : G });
  }
  const count = { reflected: 0, lateral: 0, trainBarrier: 0, inside: 0 };

  /** Every path from one piece to one receiver for one source part: [{ kind, bands: [LLT] }]. */
  function pathsFor(s, part, piece, R, Rh, p) {
    const out = [];
    const z0 = piece.z != null ? piece.z * k : null;
    const D = profileOf([piece, R], ctx, { z0 });
    if (D.inside) { count.inside++; return out; }
    const L = D.L, zS = D.zAt(0) + part.h, zR = D.zAt(L) + Rh;
    const perLen = piece.len ? 10 * Math.log10(piece.len) : 0;
    const lwToward = (to, dz) => (part.lw ? part.lw : (s.kind === 'rail' ? railLw(part, piece, to, dz, k) : part.lwPerMetre).map((v) => v + perLen));
    // direct
    let lw = lwToward(R, zR - zS);
    if (s.kind === 'rail') {
      const wall = barriers.map((b) => ({ b, x: firstWall(b, piece, R) })).filter((w) => w.x != null).sort((a, c) => a.x - c.x)[0];
      if (wall) {
        const z0 = D.zAt(0), top = D.zAt(wall.x) + wall.b.height;
        const tb = trainBarrierSource({ lw, hs: part.h, dB: wall.x, hB: top - z0, dR: L - wall.x, hR: zR - z0, alpha: wall.b.alpha, Cref: s.cref, lambdas: LAMBDAS });
        if (tb.applied.some(Boolean)) { lw = tb.lw; count.trainBarrier++; for (const n of tb.notes) notes.push(n); }
      }
    }
    const direct = pathLevels({ lw, profile: D.profile, source: { x: 0, h: part.h }, receiver: { x: L, h: Rh }, p, gs: s.gs });
    out.push({ kind: 'direct', bands: direct.bands.map((b) => b.LLT) });
    // reflections (image sources; never for lateral paths)
    if (order > 0 && reflectors.length) {
      const usable = reflectors.filter((r) => distToSeg(R, r.a, r.b) * k > FACADE_GAP && distToSeg(piece, r.a, r.b) * k > 0.01);
      for (const path of reflectedPaths(piece, R, usable, { order })) {
        const P = profileOf(path.plan, ctx, { z0 });
        if (P.inside) continue;
        const Lp = P.L, Sz = P.zAt(0) + part.h, Rz = P.zAt(Lp) + Rh;
        const tops = []; let acc = 0, okH = true;
        for (let i = 0; i < path.via.length; i++) {
          const a = path.plan[i], b = path.plan[i + 1]; acc += Math.hypot(b.x - a.x, b.y - a.y) * k;
          const own = path.via[i].seg.owner, h = own.kind === 'building' || own.roof != null ? own.roof * k - P.zAt(acc) : own.height;
          if (!reflectorOk(Infinity, h)) okH = false;
          tops.push([acc, P.zAt(acc) + h]);
        }
        if (!okH) continue;
        let lwI = lwToward({ x: piece.x + path.firstDir.x, y: piece.y + path.firstDir.y }, Rz - Sz);
        for (const v of path.via) lwI = lwI.map((x, i) => x + 10 * Math.log10(1 - v.seg.owner.alpha[i]));   // eq. 2.5.35, each reflection
        const res = pathLevels({ lw: lwI, profile: P.profile, source: { x: 0, h: part.h }, receiver: { x: Lp, h: Rh }, p, gs: s.gs });
        const d3 = Math.hypot(Lp, Rz - Sz), Gm = Math.max(1000, 8 * d3);
        const bands = res.bands.map((b, i) => {
          const retro = (cond, G) => {
            const first = (cond === 'H' ? b.boundH : b.boundF).first;
            let sum = 0;
            for (const [x, z] of tops) {
              if (rayAbove([0, Sz], [Lp, Rz], x, G) >= z) return Infinity;                       // the ray passes over: no reflection in this condition
              const Rp = first && first[0] > x ? first : [Lp, Rz];                                 // Figure 2.5.j: up to the first diffraction point after it
              sum += retroDif(retroDelta([0, Sz], [x, z], Rp, G), C_SOUND / OCTAVES[i]);
            }
            return sum;
          };
          const LH = b.LH - retro('H', 0), LF = b.LF - retro('F', Gm);
          return longTerm(LF, LH, p);
        });
        if (bands.some(Number.isFinite)) { out.push({ kind: 'reflected', bands }); count.reflected++; }
      }
    }
    // lateral paths: real point sources only, direct ray clear of the terrain and blocked
    if (s.kind === 'point' && (barriers.length || buildings.length) && direct.bands[0].boundH.blocked) {
      const clear = D.terrain.every((t) => t.x <= 1e-6 || t.x >= L - 1e-6 || t.z < zS + (zR - zS) * t.x / L);
      if (clear) {
        const obs = penetrated(piece, R, D, zS, zR, L);
        const S3 = { x: piece.x, y: piece.y, z: zS / k }, R3 = { x: R.x, y: R.y, z: zR / k };
        const favourable = !!direct.bands[0].boundF.blocked;
        for (const lp of lateralPaths(S3, R3, obs)) {
          const Lt = profileOf(lp.plan, ctx, { walls: false });
          if (Lt.inside) continue;
          const r = lateralLevels({ lw, profile: Lt.profile, source: { x: 0, h: part.h }, receiver: { x: Lt.L, h: Rh }, d: Math.hypot(L, zR - zS), pathLength: lp.length * k, delta: lp.delta * k, e: lp.e * k, nEdges: lp.edges.length, p, gs: s.gs, favourable });
          out.push({ kind: 'lateral', bands: r.bands.map((b) => b.LLT) }); count.lateral++;
        }
      }
    }
    return out;
  }
  /** Distance (plan, along piece → R) to the first crossing of a barrier, or null. */
  function firstWall(b, piece, R) { let best = null; for (const [a, c] of b.segs) { const h = segHit(piece, R, a, c); if (h && h.t > 1e-6 && h.t < 1 - 1e-6) { const x = h.t * Math.hypot(R.x - piece.x, R.y - piece.y) * k; if (best == null || x < best) best = x; } } return best; }
  /** The obstacles the direct ray passes through (top above the straight ray where it crosses), with their tops in project units. */
  function penetrated(piece, R, D, zS, zR, L) {
    const out = [], ray = (x) => zS + (zR - zS) * x / L, len = Math.hypot(R.x - piece.x, R.y - piece.y);
    for (const b of barriers) {
      const hit = b.segs.some(([a, c]) => { const h = segHit(piece, R, a, c); if (!h) return false; const x = h.t * len * k; return D.zAt(x) + b.height > ray(x); });
      if (hit) out.push({ id: b.id, pts: b.pts.map((p, i) => ({ x: p.x, y: p.y, top: b.top[i] })) });
    }
    for (const B of buildings) {
      const hit = B.segs.some(([a, c]) => { const h = segHit(piece, R, a, c); if (!h) return false; return B.roof * k > ray(h.t * len * k); });
      if (hit) out.push({ id: B.id, closed: true, pts: B.pts.map((p) => ({ x: p.x, y: p.y, top: B.roof })) });
    }
    return out;
  }

  const receivers = [];
  for (const R of settings.receivers || []) {
    if (!Number.isFinite(R.x) || !Number.isFinite(R.y)) continue;
    const res = { id: R.id, name: R.name || R.id, x: R.x, y: R.y, h: Number(R.h) || 4, periods: {} };
    for (const P of PERIODS) {
      const p = Number(periods[P]?.p);
      if (!(p >= 0 && p <= 1)) continue;
      const bySource = [], kinds = { direct: 0, reflected: 0, lateral: 0 };
      for (const s of sources) {
        const parts = s.per[P];
        if (!parts) continue;
        const levels = [];
        const pieces = s.kind === 'point' ? [{ x: s.at.x, y: s.at.y, len: null, z: null }] : linePieces(s.al, R, k, s.prof);
        for (const piece of pieces) {
          if (Math.hypot(piece.x - R.x, piece.y - R.y) * k < 0.5) continue;
          for (const part of parts) for (const path of pathsFor(s, part, piece, R, res.h, p)) { levels.push(path.bands); kinds[path.kind]++; }
        }
        if (!levels.length) continue;
        const bands = OCTAVES.map((_, i) => sumLevels(levels.map((l) => l[i])));
        bySource.push({ source: s.name, id: s.id, bands, LAeq: sumLevels(bands.map((v, i) => v + AWC[i])) });
      }
      if (!bySource.length) continue;
      const bands = OCTAVES.map((_, i) => sumLevels(bySource.map((b) => b.bands[i])));
      const LAeq = sumLevels(bands.map((v, i) => v + AWC[i]));
      res.periods[P] = { LAeq, bands, paths: kinds, top: bySource.sort((a, b) => b.LAeq - a.LAeq).slice(0, 3).map((b) => ({ source: b.source, LAeq: b.LAeq })) };
      const lim = Number(settings.limits?.[P]);
      if (lim > 0 && LAeq > lim + 1e-9) problems.push({ code: 'noise.limit', severity: 'warning', receiver: res.id, period: P, value: LAeq, limit: lim, where: { space: '2d', at: [R.x, R.y] } });
    }
    // Lden and Lnight (Directive 2002/49/EC Annex I)
    const ind = lden({ day: res.periods.day?.LAeq, evening: res.periods.evening?.LAeq, night: res.periods.night?.LAeq }, { day: periods.day?.hours, evening: periods.evening?.hours, night: periods.night?.hours });
    if (ind.ok) {
      res.Lden = ind.Lden; res.Lnight = ind.Lnight;
      for (const nt of ind.notes) if (!notes.some((x) => x.key === nt.key && x.period === nt.period)) notes.push(nt);
      const limD = Number(settings.limits?.den);
      if (limD > 0 && res.Lden > limD + 1e-9) problems.push({ code: 'noise.limit', severity: 'warning', receiver: res.id, period: 'den', value: res.Lden, limit: limD, where: { space: '2d', at: [R.x, R.y] } });
    } else if (ind.reason === 'hours' && !notes.some((x) => x.key === 'ac.ind.note.hours')) notes.push(...ind.notes);
    for (const nt of assessmentNotes(res.h)) if (!notes.some((x) => x.key === nt.key)) notes.push(nt);
    receivers.push(res);
  }
  if (barriers.length) notes.push({ key: 'nz.note.barriers', n: barriers.length });
  if (buildings.length) notes.push({ key: 'nz.note.buildings', n: buildings.length });
  if (reflectors.length) notes.push(order ? { key: 'nz.note.reflections', order, n: count.reflected } : { key: 'nz.note.noreflections' });
  if (count.lateral) notes.push({ key: 'nz.note.lateral', n: count.lateral });
  if (count.trainBarrier) notes.push({ key: 'nz.note.trainbarrier', n: count.trainBarrier });
  if (count.inside) notes.push({ key: 'nz.note.inside', n: count.inside });
  if (sources.some((s) => s.kind === 'rail')) notes.push({ key: 'nz.note.raildir' });
  if (designed.length) notes.push({ key: 'nz.note.design', names: designed.join(', ') });
  if (receivers.some((r) => Number.isFinite(r.Lden))) notes.push({ key: 'nz.note.lden' });
  notes.push({ key: 'nz.note.limits' });
  return { ok: true, receivers, sources: sources.map((s) => ({ id: s.id, name: s.name, kind: s.kind, periods: Object.keys(s.per) })), notes, problems };
}
function distToSeg(P, a, b) { const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy; const t = L2 ? Math.max(0, Math.min(1, ((P.x - a.x) * dx + (P.y - a.y) * dy) / L2)) : 0; return Math.hypot(P.x - a.x - t * dx, P.y - a.y - t * dy); }

/** A CSV of the results (receiver, x, y, h, LAeq per period, the loudest source). */
export function toCsv(result) {
  const q = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) || /^[=+\-@]/.test(s) ? '"' + s.replace(/"/g, '""').replace(/^([=+\-@])/, "'$1") + '"' : s; };
  const rows = [['receiver', 'x', 'y', 'h_m', 'LAeq_day', 'LAeq_evening', 'LAeq_night', 'Lden', 'Lnight', 'loudest_source_day']];
  for (const r of result.receivers) rows.push([r.name, r.x, r.y, r.h, ...PERIODS.map((P) => (r.periods[P] ? r.periods[P].LAeq.toFixed(1) : '')), Number.isFinite(r.Lden) ? r.Lden.toFixed(1) : '', Number.isFinite(r.Lnight) ? r.Lnight.toFixed(1) : '', r.periods.day?.top?.[0]?.source || '']);
  return rows.map((r) => r.map(q).join(',')).join('\n') + '\n';
}
