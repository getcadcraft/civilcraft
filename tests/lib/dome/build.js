/* SPDX-License-Identifier: Apache-2.0 */
/**
 * build.js — a resolved dome design turned into solid elements (0.11 DOME.1). Host-free; millimetres.
 *
 * Axes: the dome's axis is the vertical through (0, 0); z = 0 is the finished floor; the springline (where the curve starts) is at z = stem.
 * Angles round the dome are measured from +x, counter-clockwise seen from above.
 *
 * An element = { key, group, ifc (class), predefined, objectType, name, material, color, alpha, pieces, props, qty }. A piece is a closed profile
 * [[r, z]…] in the half-plane through the axis, turned about the axis from the angle a0 to a1 (radians): { rev: true, profile, a0, a1 }. Every host
 * draws the same list: BimCraft as elements in the model, the IFC writer (ifcout.js) as a file, the drawings (drawings.js) as plan and section.
 *
 * Layers, from the outside in: the form's membrane, the foam sprayed on its inside, the concrete sprayed on the foam (thicker toward the base),
 * on a ring beam with a floor slab inside it. An opening is cut between two radial planes from its sill to its head: its width is true on the
 * form's face at the sill and narrows a little above, as the dome does. An opening can have a frame: a band of thicker concrete (extra thickness,
 * inward) a frame's width wide at each side, over its head and under its sill.
 *
 * The solids use 48 straight pieces along the curve; the quantities are taken from the same construction with 512, so a volume is within a few
 * parts in a million of the true curved solid (the tests compare both with the closed forms for a sphere and an ellipsoid).
 */
import { meridian, thicknessAt, offsetCurve, revolvedVolume, revolvedArea, clipZ, radiusAt } from './geometry.js';

export const COLORS = { concrete: '#b8b8b0', footing: '#9c9c94', slab: '#c4c4bc', foam: '#e8d98a', membrane: '#f4f1e8' };
export const SEGMENTS = 48, FINE = 512;
const TAU = 2 * Math.PI;

const el = (key, group, ifc, name, material, color, extra = {}) => ({ key, group, ifc, predefined: null, objectType: null, name, material, color, alpha: 1, pieces: [], props: {}, qty: {}, ...extra });
const rect = (r0, r1, z0, z1) => [[r0, z0], [r1, z0], [r1, z1], [r0, z1]];
const lift = (pts, dz) => pts.map(([r, z]) => [r, z + dz]);
/** The part of a base-to-crown curve between two levels, as a line. */
function between(curve, z0, z1) {
  if (z1 <= z0) return [];
  const out = [[radiusAt(curve, z0), z0]];
  for (const p of curve) if (p[1] > z0 && p[1] < z1) out.push(p);
  out.push([radiusAt(curve, z1), z1]);
  return out;
}

/**
 * The openings that fit, each with its angles, and the remarks about those that do not. → { kept: [{ …opening, n (its number in the list),
 * half (radians), a0, a1, head }], problems }.
 */
export function placeOpenings(d, m = meridian(d)) {
  const form = lift(offsetCurve(m, 0, FINE), d.stem), a = d.diameter / 2, problems = [], fit = [];
  const top = d.stem + d.height - d.foam - d.shell - 100;
  d.openings.forEach((o, i) => {
    const head = o.sill + o.height, rRef = o.sill < d.stem ? a : radiusAt(form, o.sill);
    if (head > top) { problems.push({ code: 'opening.high', vars: { n: i + 1, head: Math.round(head), top: Math.round(top) } }); return; }
    if (o.width / 2 > rRef * 0.9) { problems.push({ code: 'opening.wide', vars: { n: i + 1 } }); return; }
    const half = Math.asin(o.width / 2 / rRef), c = (o.az * Math.PI) / 180;
    fit.push({ ...o, n: i + 1, half, a0: c - half, a1: c + half, head, rRef });
  });
  fit.sort((p, q) => p.a0 - q.a0);
  const kept = [];
  for (const o of fit) {
    // two openings clash when their angle ranges meet (also across 0°)
    const hit = kept.some((k) => { const dc = Math.abs((((o.a0 + o.a1) / 2 - (k.a0 + k.a1) / 2) % TAU + TAU + Math.PI) % TAU - Math.PI); return dc < o.half + k.half + 1e-9; });
    if (hit) problems.push({ code: 'opening.overlap', vars: { n: o.n } }); else kept.push(o);
  }
  return { kept, problems };
}

/**
 * The dome cut into sectors round the axis: [{ a0, a1, opening | null, frame: { z0, z1 } | null }], the openings in order with the solid wall between
 * them. With a frame (width fw > 0), each opening gets a jamb sector either side, and the sectors of an opening and its jambs carry the levels
 * between which the concrete is thickened: from a frame's width under the sill to a frame's width over the head. A jamb never takes more than
 * 45 % of the wall to the next opening.
 */
export function sectors(kept, fw = 0) {
  if (!kept.length) return [{ a0: 0, a1: TAU, opening: null, frame: null }];
  const out = [], n = kept.length;
  const gap = (i) => (i + 1 < n ? kept[i + 1].a0 : kept[0].a0 + TAU) - kept[i].a1;   // the wall after opening i
  const jamb = (i, g) => (fw > 0 ? Math.min(fw / kept[i].rRef, 0.45 * g) : 0);
  kept.forEach((o, i) => {
    const before = gap((i + n - 1) % n), after = gap(i), next = kept[(i + 1) % n];
    const jl = jamb(i, before), jr = jamb(i, after), frame = fw > 0 ? { z0: Math.max(0, o.sill - fw), z1: o.head + fw } : null;
    if (jl > 1e-9) out.push({ a0: o.a0 - jl, a1: o.a0, opening: null, frame });
    out.push({ a0: o.a0, a1: o.a1, opening: o, frame });
    if (jr > 1e-9) out.push({ a0: o.a1, a1: o.a1 + jr, opening: null, frame });
    const nl = jamb((i + 1) % n, after), end = (i + 1 < n ? next.a0 : next.a0 + TAU) - nl;
    if (end - (o.a1 + jr) > 1e-9) out.push({ a0: o.a1 + jr, a1: end, opening: null, frame: null });
  });
  return out;
}

function construct(d, n) {
  const m = meridian(d), a = d.diameter / 2, hs = d.stem, tf = d.foam, tm = d.membrane, tb = d.shell + d.thicken;
  const tAt = (z) => thicknessAt(d, z);
  const form = offsetCurve(m, 0, n), concOut = offsetCurve(m, tf, n), concIn = offsetCurve(m, (z) => tf + tAt(z), n);
  const band = (outer, inner) => lift(clipZ([...outer, ...inner.slice().reverse()], 0, 'above'), hs);
  const { kept, problems } = placeOpenings(d, m);
  const frw = d.frameExtra > 0 ? d.frameWidth : 0, secs = sectors(kept, frw);
  const E = [];
  /**
   * One layer cut by the openings. profiles = [[plain, thick?]…]: a dome profile and, with a stem wall, a rectangle; `thick` is the same profile with
   * the opening frame's extra concrete, used between a frame sector's two levels.
   */
  const layer = (e, profiles) => {
    let volume = 0, frame = 0;
    for (const [prof, thick] of profiles) {
      if (prof.length < 3) continue;
      for (const s of secs) {
        // the frame first: plain below and above its levels, thick between them
        const bands = s.frame && thick ? [clipZ(prof, s.frame.z0, 'below'), clipZ(clipZ(thick, s.frame.z0, 'above'), s.frame.z1, 'below'), clipZ(prof, s.frame.z1, 'above')] : [prof];
        for (const band of bands) {
          if (band.length < 3) continue;
          const parts = !s.opening ? [band] : [s.opening.sill > 0 ? clipZ(band, s.opening.sill, 'below') : [], clipZ(band, s.opening.head, 'above')];
          for (const p of parts) {
            if (p.length < 3) continue;
            const v = revolvedVolume(p, s.a1 - s.a0);
            if (v > 1e-3) { e.pieces.push({ rev: true, profile: p, a0: s.a0, a1: s.a1 }); volume += v; }
          }
        }
        if (s.frame && thick) {
          const cut = (q) => (!s.opening ? [q] : [s.opening.sill > 0 ? clipZ(q, s.opening.sill, 'below') : [], clipZ(q, s.opening.head, 'above')]);
          const mid = (q) => clipZ(clipZ(q, s.frame.z0, 'above'), s.frame.z1, 'below'), vol = (q) => cut(mid(q)).reduce((t, x) => t + (x.length >= 3 ? revolvedVolume(x, s.a1 - s.a0) : 0), 0);
          frame += vol(thick) - vol(prof);
        }
      }
    }
    e.qty.volume = volume;
    if (frame > 0) e.qty.frame = frame;
    E.push(e);
    return e;
  };
  // where the concrete meets the floor
  const rOut = hs > 0 ? a - tf : radiusAt(concOut, 0), rIn = hs > 0 ? a - tf - tb : radiusAt(concIn, 0), rc = (rOut + rIn) / 2;
  const fw = d.footingWidth, f0 = Math.max(0, rc - fw / 2), f1 = rc + fw / 2;

  const footing = el('footing', 'base', 'IFCFOOTING', 'Ring beam footing', 'concrete', COLORS.footing, { predefined: 'STRIP_FOOTING', props: { WidthMm: fw, DepthMm: d.footingDepth, CentreRadiusMm: rc } });
  footing.pieces.push({ rev: true, profile: rect(f0, f1, -d.footingDepth, 0), a0: 0, a1: TAU });
  footing.qty.volume = revolvedVolume(footing.pieces[0].profile); E.push(footing);
  if (d.slab > 0 && f0 > 0) {
    const slab = el('slab', 'base', 'IFCSLAB', 'Floor slab', 'concrete', COLORS.slab, { predefined: 'BASESLAB', props: { ThicknessMm: d.slab } });
    slab.pieces.push({ rev: true, profile: rect(0, f0, -d.slab, 0), a0: 0, a1: TAU });
    slab.qty.volume = revolvedVolume(slab.pieces[0].profile); slab.qty.area = Math.PI * f0 * f0; E.push(slab);
  }
  const fe = frw > 0 ? d.frameExtra : 0, concThick = fe > 0 ? offsetCurve(m, (z) => tf + tAt(z) + fe, n) : null;
  if (hs > 0) layer(el('stem', 'shell', 'IFCWALL', 'Stem wall', 'concrete', COLORS.concrete, { predefined: 'SOLIDWALL', props: { ThicknessMm: tb, HeightMm: hs } }), [[rect(a - tf - tb, a - tf, 0, hs), fe > 0 ? rect(Math.max(0, a - tf - tb - fe), a - tf, 0, hs) : null]]);
  layer(el('shell', 'shell', 'IFCROOF', 'Dome shell', 'concrete', COLORS.concrete, { predefined: 'DOME_ROOF', props: { CrownThicknessMm: d.shell, BaseThicknessMm: tb, Shape: d.shape, ...(fe > 0 ? { OpeningFrameWidthMm: frw, OpeningFrameExtraMm: fe } : {}) } }), [[band(concOut, concIn), fe > 0 ? band(concOut, concThick) : null]]);
  if (tf > 0) layer(el('foam', 'skin', 'IFCCOVERING', 'Foam insulation', 'foam', COLORS.foam, { predefined: 'INSULATION', props: { ThicknessMm: tf } }), [[band(form, concOut)], ...(hs > 0 ? [[rect(a - tf, a, 0, hs)]] : [])]);
  if (tm > 0) layer(el('membrane', 'skin', 'IFCCOVERING', 'Form membrane', 'membrane', COLORS.membrane, { predefined: 'MEMBRANE', props: { ThicknessMm: tm } }), [[band(offsetCurve(m, -tm, n), form)], ...(hs > 0 ? [[rect(a, a + tm, 0, hs)]] : [])]);

  // ---- areas, the inside, the openings
  const formW = lift(form, hs);
  const innerLine = [[rIn, hs], ...lift(concIn.filter((p) => p[1] > 0), hs)];
  const formArea = revolvedArea(form) + TAU * a * hs;
  const innerArea = revolvedArea(innerLine) + TAU * (a - tf - tb) * hs;
  let openForm = 0, openInner = 0;
  for (const o of kept) {
    const ang = o.a1 - o.a0, s0 = Math.min(o.sill, hs), s1 = Math.min(o.head, hs);
    openForm += ang * a * (s1 - s0) + revolvedArea(between(formW, Math.max(o.sill, hs), o.head), ang);
    openInner += ang * (a - tf - tb) * (s1 - s0) + revolvedArea(between(innerLine, Math.max(o.sill, hs), o.head), ang);
  }
  const floorR = hs > 0 ? a - tf - tb : rIn;
  const inside = revolvedVolume([[0, hs], ...innerLine, [0, innerLine[innerLine.length - 1][1]]]) + Math.PI * floorR * floorR * hs;
  const headR = d.headroom <= hs ? floorR : Math.min(floorR, radiusAt(innerLine, d.headroom));
  const metrics = {
    formArea, openForm, innerArea, openInner, floorArea: Math.PI * floorR * floorR, floorRadius: floorR, insideVolume: inside,
    clearHeight: hs + d.height - tf - d.shell, headroomArea: Math.PI * headR * headR, headroomRadius: headR,
    baseCircumference: TAU * a, sphereRadius: m.R, rOut, rIn, rc, footing: [f0, f1], trench: revolvedVolume(rect(f0, f1, -d.footingDepth, 0)),
    frameVolume: E.reduce((t, e) => t + (e.qty.frame || 0), 0),
  };
  return { elements: E, layout: { meridian: m, form, concOut, concIn, kept, sectors: secs, a, rOut, rIn, rc, footing: [f0, f1] }, metrics, problems };
}

/**
 * Build everything. d = a resolved design (model.js resolve). → { elements, layout (curves at 48 pieces: form, concOut, concIn as [r, z above the
 * springline]; kept openings; sectors), metrics (areas mm², volumes mm³, lengths mm, from the 512-piece construction), problems }.
 */
export function build(d) {
  const coarse = construct(d, SEGMENTS), fine = construct(d, FINE);
  const byKey = new Map(fine.elements.map((e) => [e.key, e]));
  for (const e of coarse.elements) { const f = byKey.get(e.key); if (f) e.qty = { ...f.qty }; }
  return { elements: coarse.elements, layout: coarse.layout, metrics: fine.metrics, problems: coarse.problems };
}

/** [x0, y0, z0, x1, y1, z1] of an element list. */
export function bounds(elements) {
  let r = 0, z0 = Infinity, z1 = -Infinity;
  for (const e of elements) for (const pc of e.pieces) for (const [pr, pz] of pc.profile) { r = Math.max(r, pr); z0 = Math.min(z0, pz); z1 = Math.max(z1, pz); }
  return [-r, -r, z0, r, r, z1];
}
