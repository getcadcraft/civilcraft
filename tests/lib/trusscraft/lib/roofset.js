/* SPDX-License-Identifier: Apache-2.0 */
/**
 * roofset.js — the truss set for a roof from the roof's own geometry (DOM-free; pure, plan mm). It takes BimCraft's roof plan (res-roof.js
 * roofGeometry: faces, ridge / hip / valley lines) and cuts it with the planes the trusses stand in, so the profile of every truss IS the roof:
 *   layoutRoof(roof, opts) → { ok, trusses: [{ id, kind, u, span, a, b, end, key, zBase, ... }], designs: Map(key → request), groups, issues, failures, ... }
 *   valleySet(p) → the triangular valley trusses that carry a lower wing roof on a main roof (typed numbers, or taken from a valley pair of the plan)
 *   detectValleys(plan) → [{ top, ends, e, wingSpan, mainSlope, ridgeZ }]
 * roof: { outline, plan, pitch, overhang }.  opts: { spacing, ridge, inset, type, base (a truss spec: panels, heel...), hipMethod 'stepdown' | 'girder',
 *   setback (mm, 0 = half the hip), minHeight (smallest truss height made, mm), valleyMode 'cross' | 'set' }.
 * Forms: common (a triangle: any of the named types), stepdown (a flat-topped truss in a hip end), girder (the flat-topped truss that carries the jack
 * trusses), jack and corner (monoslope trusses from the end wall to the girder; a corner one rises, then runs level along the side plane), valley
 * (a triangle standing on the main roof), profile (anything else the roof's section is, with its valley or hip kinks as joints).
 * A station that cannot be made is not skipped quietly: it goes in `failures` / `issues`, and layoutProblems() turns each into a Problem.
 */
import { sectionProfile, classify } from './profile.js';

const D2R = Math.PI / 180;
const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
const area = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - a[1] * b[0]; } return s / 2; };
const r1 = (x) => Math.round(x * 10) / 10;

function crossings(P, u0) {
  const xs = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length];
    if ((a[0] <= u0 && b[0] > u0) || (b[0] <= u0 && a[0] > u0)) xs.push(a[1] + ((u0 - a[0]) / (b[0] - a[0])) * (b[1] - a[1]));
  }
  return xs.sort((p, q) => p - q);
}

/** Ridge direction: the longest ridge line of the roof plan, else the longest outline edge. */
export function ridgeDirection(roof, ridge = 'auto') {
  if (ridge === 'x') return [1, 0];
  if (ridge === 'y') return [0, 1];
  if (ridge !== 'auto' && ridge !== '' && Number.isFinite(Number(ridge))) { const a = Number(ridge) * D2R; return [Math.cos(a), Math.sin(a)]; }
  const rl = (roof.plan && roof.plan.lines ? roof.plan.lines : []).filter((l) => l.kind === 'ridge').sort((a, b) => b.len - a.len)[0];
  if (rl) return norm([rl.b[0] - rl.a[0], rl.b[1] - rl.a[1]]);
  let best = null;
  const o = roof.outline;
  for (let i = 0; i < o.length; i++) { const a = o[i], b = o[(i + 1) % o.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (!best || l > best.l) best = { l, d: norm([b[0] - a[0], b[1] - a[1]]) }; }
  return best.d;
}

export function detectValleys(plan) {
  const lines = plan && plan.lines ? plan.lines : [], vs = lines.filter((l) => l.kind === 'valley'), out = [];
  const high = (l) => (l.a[2] >= l.b[2] ? [l.a, l.b] : [l.b, l.a]);
  const used = new Set();
  vs.forEach((v, i) => {
    if (used.has(i)) return;
    const [t1, q1] = high(v);
    const j = vs.findIndex((w, k) => k !== i && !used.has(k) && Math.hypot(...high(w)[0].map((c, n) => c - t1[n])) < 3);
    if (j < 0) return;
    used.add(i); used.add(j);
    const [, q2] = high(vs[j]);
    const rl = lines.find((l) => l.kind === 'ridge' && (Math.hypot(l.a[0] - t1[0], l.a[1] - t1[1]) < 3 || Math.hypot(l.b[0] - t1[0], l.b[1] - t1[1]) < 3));
    if (!rl) return;
    const far = Math.hypot(rl.a[0] - t1[0], rl.a[1] - t1[1]) < 3 ? rl.b : rl.a, e = norm([far[0] - t1[0], far[1] - t1[1]]);
    const mid = [(q1[0] + q2[0]) / 2, (q1[1] + q2[1]) / 2], dq = [mid[0] - t1[0], mid[1] - t1[1]], dist = Math.hypot(...dq);
    const aligned = dist > 1 ? Math.abs((dq[0] * e[0] + dq[1] * e[1]) / dist) : 0;
    out.push({ top: t1, ends: [q1, q2], e, ridgeZ: t1[2], aligned, reach: dist, wingAtEave: Math.hypot(q1[0] - q2[0], q1[1] - q2[1]) });
  });
  return out;
}

/**
 * The valley trusses of a wing roof over a main roof. Typed: { wingWidth, wingPitch, mainPitch, spacing, minHeight } (the wing's ridge height
 * (W2/2) tan(wing pitch) above the plate; it meets the main roof plane x0 = R2 / tan(main pitch) up the slope). From a plan: { valley: detectValleys()[i] }.
 * Each truss is a triangle on a level base standing on the main roof, spanning the wing between the valley lines at that height, its apex on the wing ridge.
 */
export function valleySet(p = {}) {
  const spacing = p.spacing > 0 ? p.spacing : 600, minH = p.minHeight > 0 ? p.minHeight : 300, out = [], issues = [];
  let R2, s1, dmax, span = (z) => 0, place = null;
  if (p.valley) {
    const v = p.valley;
    if (v.aligned < 0.95) return { ok: false, error: 'valleyskew', trusses: [], issues };
    R2 = v.ridgeZ; const dQ = v.reach, zQ = (v.ends[0][2] + v.ends[1][2]) / 2;
    s1 = (R2 - zQ) / dQ;      // the main roof's fall per mm along the wing axis, from the valley lines
    dmax = dQ;
    span = (d) => { const t = d / dQ, q1 = v.ends[0], q2 = v.ends[1]; return Math.hypot((q1[0] - v.top[0]) * t - (q2[0] - v.top[0]) * t, (q1[1] - v.top[1]) * t - (q2[1] - v.top[1]) * t); };
    place = (d) => { const t = d / dQ, q1 = v.ends[0], q2 = v.ends[1]; return { a: [v.top[0] + (q1[0] - v.top[0]) * t, v.top[1] + (q1[1] - v.top[1]) * t], b: [v.top[0] + (q2[0] - v.top[0]) * t, v.top[1] + (q2[1] - v.top[1]) * t] }; };
  } else {
    const W2 = Number(p.wingWidth), pw = Number(p.wingPitch), pm = Number(p.mainPitch);
    if (!(W2 >= 1500) || !(pw >= 5 && pw <= 60) || !(pm >= 5 && pm <= 60)) return { ok: false, error: 'valleyparams', trusses: [], issues };
    R2 = (W2 / 2) * Math.tan(pw * D2R); s1 = Math.tan(pm * D2R);
    dmax = R2 / s1;
    span = (d) => (2 * d * s1) / Math.tan(pw * D2R);
    place = (d) => ({ a: [-span(d) / 2, d], b: [span(d) / 2, d] });
  }
  const dFull = p.dFull > 0 ? p.dFull : dmax;
  // stations from the wall end up toward the ridge junction (distance d from the top point along the wing axis)
  for (let k = 1; ; k++) {
    const d = dFull - k * spacing;
    if (d <= 0) break;
    const rise = d * s1, S = span(d);
    if (rise < minH) { issues.push({ code: 'valleylow', vars: { from: Math.round(d), rise: Math.round(rise) } }); break; }
    if (S < 600) break;
    const pl = place(d);
    out.push({ d: r1(d), span: Math.round(S), rise: r1(rise), zBase: r1(R2 - rise), a: pl.a.map(r1), b: pl.b.map(r1) });
  }
  if (!out.length) return { ok: false, error: 'valleyempty', trusses: [], issues };
  return { ok: true, trusses: out, ridgeZ: R2, fall: s1, issues };
}

export function layoutRoof(roof, o = {}) {
  const spacing = o.spacing || 600, inset = o.inset ?? 19, minHeight = o.minHeight > 0 ? o.minHeight : 300, minSpan = o.minSpan || 1500, base = o.base || {};
  const outline = roof.outline, plan = roof.plan;
  if (!Array.isArray(outline) || outline.length < 3 || Math.abs(area(outline)) < 1e6) return { ok: false, error: 'outline' };
  if (!plan || !plan.faces || !plan.faces.length) return { ok: false, error: 'roofplan' };
  if (!(spacing >= 200 && spacing <= 3000)) return { ok: false, error: 'spacing' };
  const poly = area(outline) < 0 ? [...outline].reverse() : outline.map((q) => [q[0], q[1]]);
  const oh = Number.isFinite(roof.overhang) ? roof.overhang : (base.overhang ?? 0);
  const issues = [], failures = [], trusses = [], designs = new Map();
  let nId = 0;
  const addDesign = (key, d) => { if (!designs.has(key)) designs.set(key, { key, ...d }); return key; };
  const make = (kind, p) => { const id = (p.prefix || 'T') + (++nId); trusses.push({ id, kind, ...p }); return id; };

  const runSet = (ru, label, clip) => {
    const rv = [-ru[1], ru[0]];
    const P = poly.map((q) => [q[0] * ru[0] + q[1] * ru[1], q[0] * rv[0] + q[1] * rv[1]]);
    const w = (u, v) => [u * ru[0] + v * rv[0], u * ru[1] + v * rv[1]];
    let u0 = Math.min(...P.map((q) => q[0])), u1 = Math.max(...P.map((q) => q[0]));
    if (clip) { u0 = Math.max(u0, clip.u0); u1 = Math.min(u1, clip.u1); }
    const L = u1 - u0 - 2 * inset;
    if (L <= 0) return null;
    const n = Math.max(1, Math.ceil(L / spacing)), step = L / n;
    const stations = [];
    for (let i = 0; i <= n; i++) {
      const u = u0 + inset + i * step, xs = crossings(P, u + (i === 0 ? 1e-3 : i === n ? -1e-3 : 0)), iv = [];
      for (let j = 0; j + 1 < xs.length; j += 2) if (xs[j + 1] - xs[j] >= minSpan) iv.push([xs[j], xs[j + 1]]);
      stations.push({ i, u, iv, end: i === 0 || i === n });
    }
    // the section of every interval, and the highest point of each station
    for (const s of stations) { s.sec = s.iv.map(([v0, v1]) => sectionProfile(plan, w(s.u, v0), w(s.u, v1))); s.hmax = Math.max(0, ...s.sec.map((p) => (p.length ? Math.max(...p.map((q) => q[1])) : 0))); }
    const Hc = Math.max(...stations.map((s) => s.hmax));
    const zone = (dir) => { let k = 0; const idx = dir > 0 ? stations : [...stations].reverse(); while (k < idx.length && idx[k].hmax < Hc - 5) k++; return k < idx.length ? k : 0; };
    const zA = zone(1), zB = zone(-1);   // stations lying in a hip end at the start / at the end
    const skipped = new Set(), jackOf = new Map();
    const girders = [];
    const useGirder = o.hipMethod === 'girder';
    for (const [dir, zlen] of [[1, zA], [-1, zB]]) {
      if (!zlen) continue;
      const seq = dir > 0 ? stations : [...stations].reverse();
      const uEnd = dir > 0 ? u0 : u1;
      const lowStations = seq.slice(0, zlen).filter((s) => s.hmax < minHeight);
      if (useGirder) {
        const zoneLen = Math.abs(seq[zlen].u - uEnd), goal = o.setback > 0 ? o.setback : zoneLen / 2;
        let gi = seq.findIndex((s) => Math.abs(s.u - uEnd) >= goal);
        while (gi >= 0 && gi < seq.length && seq[gi].hmax < minHeight) gi++;
        if (gi < 1 || gi >= zlen + 1) { issues.push({ code: 'nogirder', vars: { end: dir > 0 ? 'start' : 'end' } }); }
        else {
          const g = seq[gi];
          for (let k = 0; k < gi; k++) skipped.add(seq[k].i);
          girders.push({ st: g, dir, uEnd, seqIndex: gi });
        }
      } else if (lowStations.length) {
        for (const s of lowStations) skipped.add(s.i);
        issues.push({ code: 'endzone', vars: { n: lowStations.length, minHeight, within: Math.round(Math.abs(lowStations[lowStations.length - 1].u - uEnd)), end: dir > 0 ? 'start' : 'end' } });
      }
    }
    const trussFrom = (s, j, kind, extra = {}) => {
      const [v0, v1] = s.iv[j], pts = s.sec[j], S = v1 - v0;
      if (!pts || pts.length < 2) { failures.push({ station: s.i, u: r1(s.u), error: 'profile', label }); return null; }
      const c = classify(pts);
      let form = extra.form;
      if (!form) form = c.triangle && c.symmetric && c.endsLow ? 'common' : c.flats.length && c.endsLow && !c.notches && !c.vertexNotches ? 'stepdown' : 'profile';
      if (c.notches || c.vertexNotches) issues.push({ code: 'valleycross', vars: { u: Math.round(s.u) } });
      const a = w(s.u, v0).map(r1), b = w(s.u, v1).map(r1);
      if (form === 'common') {
        const pitch = Math.atan((2 * c.apex) / S) / D2R;
        if (pitch >= 5 && pitch <= 60) {
          const type = o.type || 'fink', key = `c|${type}|${Math.round(S)}|${pitch.toFixed(2)}`;
          addDesign(key, { kind: 'common', spec: { ...base, type, span: S, pitch, overhang: oh }, trib: step });
          return make('common', { u: r1(s.u), span: Math.round(S), a, b, end: s.end, key, zBase: 0, label, v0, v1 });
        }
        form = 'profile';
      }
      const prof = pts.map((q) => [r1(q[0]), r1(q[1])]), sig = prof.map((q) => q.map(Math.round).join(',')).join(';');
      const key = `p|${form}|${Math.round(S)}|${sig}|${Math.round(extra.trib || step)}${extra.girder ? '|g' : ''}`;
      addDesign(key, { kind: form, spec: { form, span: S, profile: prof, overhangL: pts[0][1] < 1 ? oh : 0, overhangR: pts[pts.length - 1][1] < 1 ? oh : 0, heel: base.heel, panels: base.panels }, trib: extra.trib || step, extraX: extra.extraX || [], pointFrom: extra.pointFrom || [] });
      return make(form, { u: r1(s.u), span: Math.round(S), a, b, end: s.end, key, zBase: 0, label, v0, v1 });
    };
    // girders and their jacks first
    for (const gd of girders) {
      const g = gd.st;
      g.iv.forEach((iv, j) => {
        const [v0, v1] = iv, W = v1 - v0, nJ = Math.max(1, Math.ceil((W - 2 * inset) / spacing)), sj = (W - 2 * inset) / nJ;
        const pf = [], extraX = [], jackIds = [];
        let small = 0;
        for (let k = 0; k <= nJ; k++) {
          const v = v0 + inset + k * sj;
          const pts = sectionProfile(plan, w(gd.uEnd, v), w(g.u, v));
          if (pts.length < 2) { failures.push({ station: g.i, u: r1(g.u), error: 'profile', label }); continue; }
          const top = Math.max(...pts.map((q) => q[1]));
          if (top < minHeight || pts[0][1] > 1) { small++; continue; }
          const L1 = pts[pts.length - 1][0], c = classify(pts), form = c.flats.length ? 'corner' : 'jack';
          const prof = pts.map((q) => [r1(q[0]), r1(q[1])]), sig = prof.map((q) => q.map(Math.round).join(',')).join(';');
          const key = `j|${form}|${Math.round(L1)}|${sig}|${Math.round(sj)}`;
          addDesign(key, { kind: form, spec: { form, span: L1, profile: prof, overhangL: oh, overhangR: 0, heel: 0, panels: 0 }, trib: sj });
          const id = make(form, { u: r1(gd.uEnd), span: Math.round(L1), a: w(gd.uEnd, v).map(r1), b: w(g.u, v).map(r1), end: false, key, zBase: 0, label, v0: gd.uEnd, v1: g.u, lateral: r1(v) });
          jackIds.push(id); pf.push({ key, x: r1(v - v0) }); extraX.push(r1(v - v0));
        }
        if (small) issues.push({ code: 'smalljacks', vars: { n: small, minHeight, end: gd.dir > 0 ? 'start' : 'end' } });
        const tg = trussFrom(g, j, 'girder', { form: 'girder', trib: step / 2, girder: true, extraX, pointFrom: pf });
        if (tg) { const t = trusses.find((x) => x.id === tg); t.kind = 'girder'; t.carries = jackIds; }
      });
    }
    for (const s of stations) {
      if (skipped.has(s.i) || girders.some((gd) => gd.st.i === s.i)) continue;
      s.iv.forEach((_, j) => trussFrom(s, j));
    }
    return { u0, u1, step, ru, rv, P, w, stations };
  };

  const valleys = detectValleys(plan);
  let ru = ridgeDirection(roof, o.ridge);
  const V0 = valleys.filter((v) => v.aligned >= 0.95).sort((a, b) => b.wingAtEave - a.wingAtEave)[0];
  // a valley set over a main roof: the main trusses span across the wing's axis, so the main ridge is square to it
  if (o.valleyMode === 'set' && V0 && (o.ridge === 'auto' || !o.ridge)) ru = norm([-V0.e[1], V0.e[0]]);
  let wingRun = null;
  if (o.valleyMode === 'set' && valleys.length) {
    // a wing over the main roof: the main trusses stop at the wing's mouth; the wing gets its own trusses and a valley set
    const V = valleys.filter((v) => v.aligned >= 0.95).sort((a, b) => b.wingAtEave - a.wingAtEave)[0];
    const rvv = [-ru[1], ru[0]];
    if (V && Math.abs(V.e[0] * rvv[0] + V.e[1] * rvv[1]) > 0.98) {
      const U = (p) => p[0] * ru[0] + p[1] * ru[1], Vv = (p) => p[0] * rvv[0] + p[1] * rvv[1];
      const nearest = (q) => poly.reduce((b, p) => (Math.hypot(p[0] - q[0], p[1] - q[1]) < Math.hypot(b[0] - q[0], b[1] - q[1]) ? p : b));
      const R1 = nearest(V.ends[0]), R2 = nearest(V.ends[1]);
      const sgn = Math.sign(V.e[0] * rvv[0] + V.e[1] * rvv[1]);
      wingRun = { mouthV: Vv(R1), u0: Math.min(U(R1), U(R2)), u1: Math.max(U(R1), U(R2)), sgn, valley: V, R1, R2 };
    } else issues.push({ code: 'valleysetskip', vars: {} });
  }
  const mainRun = runSet(ru, 'main', null);
  if (!mainRun) return { ok: false, error: 'outline' };
  let valley = null;
  if (wingRun) {
    // drop the main stations that cross the wing's mouth beyond it, then lay the wing's own trusses along the wing axis
    const rvv = mainRun.rv, Vm = wingRun.mouthV, inWing = (t) => t.u > wingRun.u0 + 1 && t.u < wingRun.u1 - 1;
    for (const t of trusses.filter((x) => x.label === 'main' && inWing(x))) {
      const cut = wingRun.sgn > 0 ? { v1: Vm } : { v0: Vm };
      const nv0 = cut.v0 ?? t.v0, nv1 = cut.v1 ?? t.v1, S = nv1 - nv0;
      const idx = trusses.indexOf(t);
      if (S < minSpan) { trusses.splice(idx, 1); continue; }
      const pts = sectionProfile(plan, mainRun.w(t.u, nv0), mainRun.w(t.u, nv1));
      trusses.splice(idx, 1);
      if (pts.length < 2) continue;
      const prof = pts.map((q) => [r1(q[0]), r1(q[1])]), sig = prof.map((q) => q.map(Math.round).join(',')).join(';'), key = `p|mouth|${Math.round(S)}|${sig}|${Math.round(mainRun.step)}`;
      addDesign(key, { kind: 'profile', spec: { form: 'mouth', span: S, profile: prof, overhangL: pts[0][1] < 1 ? oh : 0, overhangR: pts[pts.length - 1][1] < 1 ? oh : 0, heel: base.heel, panels: base.panels }, trib: mainRun.step, extraX: [], pointFrom: [] });
      trusses.push({ id: t.id, kind: 'profile', u: t.u, span: Math.round(S), a: mainRun.w(t.u, nv0).map(r1), b: mainRun.w(t.u, nv1).map(r1), end: t.end, key, zBase: 0, label: 'main', v0: nv0, v1: nv1, atMouth: true });
    }
    issues.push({ code: 'mouth', vars: { n: trusses.filter((x) => x.atMouth).length } });
    // the wing's own run: stations along the wing axis from the mouth to its far end, spanning across it
    const e = wingRun.valley.e, mouthU = e[0] * wingRun.R1[0] + e[1] * wingRun.R1[1];
    runSet(e, 'wing', { u0: mouthU, u1: 1e12 });
    const dFull = (wingRun.R1[0] - wingRun.valley.top[0]) * e[0] + (wingRun.R1[1] - wingRun.valley.top[1]) * e[1], vs = valleySet({ valley: wingRun.valley, spacing, minHeight, dFull });
    if (vs.ok) {
      valley = vs;
      for (const t of vs.trusses) {
        const prof = [[0, 0], [t.span / 2, t.rise], [t.span, 0]], key = `v|${t.span}|${t.rise}`;
        addDesign(key, { kind: 'valley', spec: { form: 'valley', span: t.span, profile: prof, overhangL: 0, overhangR: 0, heel: 0, panels: 0 }, trib: spacing });
        make('valley', { u: t.d, span: t.span, a: t.a, b: t.b, end: false, key, zBase: t.zBase, label: 'valley', v0: 0, v1: t.span });
      }
    } else failures.push({ station: -1, u: 0, error: vs.error, label: 'valley' });
  }
  for (const f of valleys.filter((v) => v.aligned < 0.95)) issues.push({ code: 'valleyskew', vars: { x: Math.round(f.top[0]), y: Math.round(f.top[1]) } });
  if (!trusses.length) return { ok: false, error: 'outline' };
  const groups = [];
  for (const t of trusses) { const g = groups.find((x) => x.key === t.key); if (g) g.ids.push(t.id); else groups.push({ key: t.key, kind: t.kind, span: t.span, ids: [t.id] }); }
  groups.sort((a, b) => b.ids.length - a.ids.length);
  const rect = Math.abs(area(mainRun.P) - (mainRun.u1 - mainRun.u0 + 0) * (Math.max(...mainRun.P.map((q) => q[1])) - Math.min(...mainRun.P.map((q) => q[1])))) < 1e4;
  if (!rect && !trusses.some((t) => t.kind === 'valley')) issues.push({ code: 'notrect', vars: { spans: new Set(trusses.map((t) => t.span)).size } });
  if (trusses.some((t) => t.span > 12000)) issues.push({ code: 'longspan', vars: { span: Math.max(...trusses.map((t) => t.span)) } });
  return { ok: true, ridgeDir: ru, spanDir: mainRun.rv, trusses, designs, groups, issues, failures, spacing: r1(mainRun.step), count: trusses.length, valley, valleys, wing: wingRun ? { u0: wingRun.u0, u1: wingRun.u1, sgn: wingRun.sgn, mouthV: wingRun.mouthV } : null, ruDir: ru, roofPitch: roof.pitch, hipMethod: o.hipMethod || 'stepdown' };
}

/** A layout made of the valley set alone (typed numbers, or one valley of a plan): positions are relative unless a plan gave them. */
export function valleyLayout(p = {}) {
  const vs = valleySet(p);
  if (!vs.ok) return { ok: false, error: vs.error };
  const trusses = [], designs = new Map(), spacing = p.spacing > 0 ? p.spacing : 600;
  vs.trusses.forEach((t, i) => {
    const key = `v|${t.span}|${t.rise}`;
    if (!designs.has(key)) designs.set(key, { key, kind: 'valley', spec: { form: 'valley', span: t.span, profile: [[0, 0], [t.span / 2, t.rise], [t.span, 0]], overhangL: 0, overhangR: 0, heel: 0, panels: 0 }, trib: spacing });
    trusses.push({ id: 'V' + (i + 1), kind: 'valley', u: t.d, span: t.span, a: t.a, b: t.b, end: false, key, zBase: t.zBase, label: 'valley', v0: 0, v1: t.span });
  });
  const groups = trusses.map((t) => ({ key: t.key, kind: 'valley', span: t.span, ids: [t.id] }));
  return { ok: true, trusses, designs, groups, issues: vs.issues, failures: [], spacing, count: trusses.length, valley: vs, ridgeDir: [1, 0], spanDir: [0, 1] };
}
