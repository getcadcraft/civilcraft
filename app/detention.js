/* SPDX-License-Identifier: Apache-2.0 */
/**
 * detention.js — detention ponds (0.8 EG.12): runoff hydrographs, stage–storage, outlet structures, hydrograph routing through the pond
 * (Modified Puls), a size-the-outlet helper and the checks a reviewer asks for. No DOM, no strings (the UI words the codes), no imports.
 * SI inside (m, m², m³, m³/s, minutes, mm); the UI converts. Tested by bin/test-civilcraft-detention.mjs. A calculation aid, not a stamped design.
 *
 * Published maths (nothing copied):
 *  - Runoff depth, curve number method: Q = (P − 0.2S)² / (P + 0.8S) for P > 0.2S, S = 25400/CN − 254 (mm); NRCS National Engineering Handbook part 630 ch. 10.
 *  - Triangular unit hydrograph: Qp = 0.208·A/Tp (m³/s per mm, A in km², Tp in hours), Tp = Δt/2 + 0.6·Tc, base 2.67·Tp (NEH part 630 ch. 16).
 *  - Rational method: Q = C·i·A/360 (i mm/h, A ha, Q m³/s).
 *  - Modified Puls / storage-indication routing: (2S₂/Δt + O₂) = (I₁ + I₂) + (2S₁/Δt − O₁) (Chow, Maidment and Mays 1988, Applied Hydrology § 8.4).
 *  - Orifice Q = Cd·A·√(2gH); sharp weir (Francis) Q = Cw·(L − 0.2·n·H)·H^1.5, Cw = 1.84; broad crest Cw = 1.66; V-notch Q = (8/15)·Cd·√(2g)·tan(θ/2)·H^2.5.
 *  - Offset of a convex polygon by d: area A + P·d + π·d² (Steiner) — a pond with side slope m has area(h) = A₀ + P₀·m·h + π·m²·h².
 *
 *   runoffDepth(P, cn) → mm
 *   scsHydrograph({ area (m²), cn, tc (min), rain: [{ t (min), i (mm/h) }] | mm/h number, duration (min), dt (min), tail (min) }) → { dt, q: [m³/s], volume, depth, peak, tPeak }
 *   rationalHydrograph({ c, area, intensity, tc, duration, dt }) → same shape
 *   stageStorage({ kind: 'table', rows: [{ z, area }] } | { kind: 'slopes', bottom, area0, perimeter0, side, top, step } | { kind: 'ground', ... via groundStorage }) → [{ z, area, storage }]
 *   groundStorage(ground, polygon, { bottom, top, step, cell }) → [{ z, area, storage }]  (the pond that is the ground's own low place inside `polygon`)
 *   outletFlow(devices, z) → m³/s       devices: [{ kind: 'orifice'|'weir'|'vnotch'|'riser'|'spillway'|'pipe', invert|crest, ... }]
 *   outletTable(devices, zs) → [{ z, q }]
 *   routePond(inflow, dt (min), storage (stageStorage rows), devices, { z0, tailEmpty }) → { dt, z[], q[] (out), storage[], peakOut, peakIn, tPeak, zMax, sMax, attenuation, drawdown (min) }
 *   routeTable(inflow, dt, { s: [..], o: [..] }) → the same on a plain storage–outflow table (tests, linear reservoir)
 *   sizeOrifice(inflow, dt, storage, { target, z0, base, cd, lo, hi }) → { diameter, peakOut, zMax } the orifice that holds the peak to `target`
 *   checkPond(result, { top, target, drawdownMax }) → [{ code, ... }]   codes: overtop, over-target, no-attenuation, draindown, dry
 */

const G = 9.80665;

export function runoffDepth(P, cn) {
  if (!(cn > 0 && cn <= 100)) return 0;
  const S = 25400 / cn - 254, Ia = 0.2 * S;
  return P > Ia ? ((P - Ia) ** 2) / (P + 0.8 * S) : 0;
}

const rainAt = (rain, t) => {
  if (typeof rain === 'number') return rain;
  let v = 0; for (const r of rain || []) { if (r.t <= t + 1e-9) v = r.i; else break; }
  return v;
};

export function scsHydrograph({ area, cn, tc, rain, duration, dt = 5, tail = null } = {}) {
  const n = Math.max(1, Math.round(duration / dt)), incr = [];
  let cumP = 0, cumQ = 0;
  for (let k = 0; k < n; k++) {
    cumP += (rainAt(rain, k * dt) * dt) / 60;
    const q = runoffDepth(cumP, cn); incr.push(q - cumQ); cumQ = q;
  }
  const tpH = (dt / 2 + 0.6 * tc) / 60, qp = (0.208 * (area / 1e6)) / tpH, tpMin = tpH * 60, base = 2.67 * tpMin;
  const total = duration + base + (tail ?? 0), m = Math.ceil(total / dt) + 1;
  const uh = (t) => (t <= 0 || t >= base ? 0 : t < tpMin ? (qp * t) / tpMin : (qp * (base - t)) / (base - tpMin));   // m³/s per mm, a pulse of one step's rain
  const q = new Array(m).fill(0);
  for (let i = 0; i < m; i++) { let s = 0; for (let k = 0; k < n; k++) if (incr[k] > 0) s += incr[k] * uh((i - k) * dt - 0); q[i] = s; }
  // the unit hydrograph above is for one step of rain starting at k·dt; shift by half a step is inside Tp = dt/2 + lag
  let vol = 0, peak = 0, tp = 0;
  for (let i = 0; i < m; i++) { vol += q[i] * dt * 60; if (q[i] > peak) { peak = q[i]; tp = i * dt; } }
  return { dt, q, volume: vol, depth: cumQ, peak, tPeak: tp };
}

export function rationalHydrograph({ c, area, intensity, tc, duration, dt = 5 } = {}) {
  const qp = (c * intensity * (area / 1e4)) / 360, D = Math.max(duration, tc), total = D + tc, m = Math.ceil(total / dt) + 1, q = [];
  // rises linearly over tc to the peak, holds until the storm ends, falls linearly over tc
  for (let i = 0; i < m; i++) {
    const t = i * dt;
    q.push(t <= tc ? (qp * t) / tc : t <= D ? qp : t < D + tc ? (qp * (D + tc - t)) / tc : 0);
  }
  let vol = 0; for (const v of q) vol += v * dt * 60;
  return { dt, q, volume: vol, depth: (vol / area) * 1000, peak: qp, tPeak: tc };
}

// ---------------------------------------------------------------------------
// Stage–storage

export function stageStorage(def) {
  if (def.kind === 'slopes') {
    const out = [], { bottom, area0, perimeter0, side, top, step } = def, m = side || 0;
    const n = Math.max(1, Math.ceil((top - bottom) / (step || (top - bottom) / 20) - 1e-9));
    for (let k = 0; k <= n; k++) {
      const h = Math.min(top - bottom, (k * (top - bottom)) / n);
      out.push({ z: bottom + h, area: area0 + perimeter0 * m * h + Math.PI * m * m * h * h, storage: area0 * h + (perimeter0 * m * h * h) / 2 + (Math.PI * m * m * h ** 3) / 3 });
    }
    return out;
  }
  const rows = [...(def.rows || [])].sort((a, b) => a.z - b.z), out = [];
  let s = 0;
  for (let k = 0; k < rows.length; k++) {
    if (k) {   // frustum of a pyramid between two areas: h/3·(A1 + A2 + √(A1·A2)), the standard contour-area volume
      const a1 = rows[k - 1].area, a2 = rows[k].area, h = rows[k].z - rows[k - 1].z;
      s += (h / 3) * (a1 + a2 + Math.sqrt(a1 * a2));
    }
    out.push({ z: rows[k].z, area: rows[k].area, storage: s });
  }
  return out;
}

export function groundStorage(ground, polygon, { bottom, top, step, cell } = {}) {
  let x0 = Infinity, y0 = Infinity, x1 = Infinity * -1, y1 = -Infinity;
  for (const p of polygon) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  const c = cell > 0 ? cell : Math.sqrt(((x1 - x0) * (y1 - y0)) / 40000), A = c * c;
  const inside = (x, y) => { let k = false; for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) { const p = polygon[i], q = polygon[j]; if ((p.y > y) !== (q.y > y) && x < ((q.x - p.x) * (y - p.y)) / (q.y - p.y) + p.x) k = !k; } return k; };
  const zs = [];
  for (let y = y0 + c / 2; y < y1; y += c) for (let x = x0 + c / 2; x < x1; x += c) if (inside(x, y)) { const z = ground.elevationAt(x, y); if (z !== null && z !== undefined && Number.isFinite(z)) zs.push(z); }
  if (!zs.length) return [];
  const lo = bottom ?? Math.min(...zs), hi = top ?? Math.max(...zs), st = step || (hi - lo) / 20, out = [];
  for (let z = lo; z <= hi + 1e-9; z += st) {
    let area = 0, vol = 0;
    for (const v of zs) if (v < z) { area += A; vol += (z - v) * A; }
    out.push({ z, area, storage: vol });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Outlets

function deviceFlow(d, z) {
  switch (d.kind) {
    case 'orifice': case 'pipe': {
      const D = d.diameter ?? Math.sqrt((4 * d.area) / Math.PI), A = d.area ?? (Math.PI * D * D) / 4, head = z - d.invert, cd = d.cd ?? 0.6;
      if (head <= 0) return 0;
      const full = cd * A * Math.sqrt(2 * G * (D / 2));   // flow when the water just covers the opening (head to its centre = D/2)
      // below that the opening is partly covered: a weir-like rise, exact at both ends (zero at the invert, `full` at head = D)
      return head < D ? full * (head / D) ** 1.5 : cd * A * Math.sqrt(2 * G * (head - D / 2));
    }
    case 'weir': case 'spillway': {
      const H = z - d.crest; if (H <= 0) return 0;
      const broad = d.kind === 'spillway' || d.broad, cw = d.cw ?? (broad ? 1.66 : 1.84);
      return cw * (broad ? d.length : Math.max(0, d.length - 0.2 * (d.contractions ?? 2) * H)) * H ** 1.5;
    }
    case 'vnotch': {
      const H = z - d.invert; if (H <= 0) return 0;
      return (8 / 15) * (d.cd ?? 0.58) * Math.sqrt(2 * G) * Math.tan(((d.angle ?? 90) * Math.PI) / 360) * H ** 2.5;
    }
    case 'riser': {   // a box or pipe riser: weir over the top rim until it submerges, then an orifice into the barrel (the smaller governs)
      const H = z - d.crest; if (H <= 0) return 0;
      const per = d.perimeter ?? Math.PI * (d.diameter ?? 1), qw = (d.cw ?? 1.66) * per * H ** 1.5;
      const A = d.barrelArea ?? (Math.PI * (d.barrel ?? d.diameter ?? 0.5) ** 2) / 4, qo = (d.cd ?? 0.6) * A * Math.sqrt(2 * G * Math.max(1e-9, z - (d.barrelInvert ?? d.crest - 1)));
      return Math.min(qw, qo);
    }
    default: return 0;
  }
}

export const outletFlow = (devices, z) => (devices || []).reduce((s, d) => s + Math.max(0, deviceFlow(d, z)), 0);
export const outletTable = (devices, zs) => zs.map((z) => ({ z, q: outletFlow(devices, z) }));

// ---------------------------------------------------------------------------
// Routing

function interp(xs, ys, x) {
  const n = xs.length;
  if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1] + ((x - xs[n - 1]) * (ys[n - 1] - ys[n - 2])) / (xs[n - 1] - xs[n - 2] || 1);
  let lo = 0, hi = n - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (xs[m] <= x) lo = m; else hi = m; }
  return ys[lo] + ((ys[hi] - ys[lo]) * (x - xs[lo])) / (xs[hi] - xs[lo] || 1);
}

/** Storage–outflow table routing. s[] ascending storage (m³), o[] outflow (m³/s). Returns storage and outflow per step. */
export function routeTable(inflow, dt, { s, o, s0 = 0 } = {}) {
  const T = dt * 60, ind = s.map((v, k) => (2 * v) / T + o[k]);   // storage-indication curve
  const outS = [s0], outO = [interp(s, o, s0)];
  let ind1 = (2 * s0) / T - outO[0];
  for (let i = 1; i < inflow.length; i++) {
    const rhs = inflow[i - 1] + inflow[i] + ind1;                         // 2S₂/Δt + O₂
    const O2 = Math.max(0, interp(ind, o, rhs)), S2 = Math.max(0, ((rhs - O2) * T) / 2);
    outS.push(S2); outO.push(O2); ind1 = rhs - 2 * O2;                   // 2S₂/Δt − O₂
  }
  return { storage: outS, q: outO };
}

export function routePond(inflow, dt, storage, devices, { z0 = null, tailEmpty = 1e-4 } = {}) {
  const zs = storage.map((r) => r.z), S = storage.map((r) => r.storage), O = zs.map((z) => outletFlow(devices, z));
  const zStart = z0 ?? zs[0], s0 = interp(zs, S, zStart);
  const r = routeTable(inflow, dt, { s: S, o: O, s0 });
  const z = r.storage.map((v) => interp(S, zs, v));
  let peakOut = 0, tPeak = 0, peakIn = 0, zMax = -Infinity, sMax = 0;
  for (let i = 0; i < r.q.length; i++) {
    if (r.q[i] > peakOut) { peakOut = r.q[i]; tPeak = i * dt; }
    if (inflow[i] > peakIn) peakIn = inflow[i];
    if (z[i] > zMax) zMax = z[i]; if (r.storage[i] > sMax) sMax = r.storage[i];
  }
  // draw-down: the time from the highest level until the storage is back to the starting storage (within a thousandth of the maximum)
  let drawdown = null;
  const iMax = r.storage.indexOf(sMax);
  for (let i = iMax; i < r.storage.length; i++) if (r.storage[i] <= s0 + Math.max(1e-6, sMax * 1e-3)) { drawdown = (i - iMax) * dt; break; }
  return { dt, z, q: r.q, storage: r.storage, peakOut, peakIn, tPeak, zMax, sMax, attenuation: peakIn > 0 ? 1 - peakOut / peakIn : 0, drawdown, s0,
    volumeIn: inflow.reduce((a, v, i) => a + (i ? ((inflow[i - 1] + v) / 2) * dt * 60 : 0), 0), volumeOut: r.q.reduce((a, v, i) => a + (i ? ((r.q[i - 1] + v) / 2) * dt * 60 : 0), 0) };
}

export function sizeOrifice(inflow, dt, storage, { target, z0 = null, base = null, cd = 0.6, lo = 0.02, hi = 2, devices = [] } = {}) {
  const inv = base ?? storage[0].z, run = (dia) => routePond(inflow, dt, storage, [...devices, { kind: 'orifice', invert: inv, diameter: dia, cd }], { z0 });
  if (run(lo).peakOut > target) return { diameter: lo, ...pick(run(lo)), met: false, reason: 'too-small' };
  if (run(hi).peakOut < target) return { diameter: hi, ...pick(run(hi)), met: true, reason: 'larger-ok' };
  let a = lo, b = hi;
  for (let k = 0; k < 50; k++) { const m = (a + b) / 2; if (run(m).peakOut > target) b = m; else a = m; }
  return { diameter: a, ...pick(run(a)), met: true };
  function pick(r) { return { peakOut: r.peakOut, zMax: r.zMax, sMax: r.sMax }; }
}

export function checkPond(res, { top = null, target = null, drawdownMax = 72 * 60, minAttenuation = 0.05 } = {}) {
  const out = [];
  if (top !== null && res.zMax > top + 1e-9) out.push({ code: 'overtop', zMax: res.zMax, top, by: res.zMax - top });
  if (target !== null && res.peakOut > target * 1.0001) out.push({ code: 'over-target', peakOut: res.peakOut, target });
  if (res.peakIn > 0 && res.attenuation < minAttenuation) out.push({ code: 'no-attenuation', attenuation: res.attenuation });
  if (res.drawdown === null) out.push({ code: 'draindown', drawdown: null, max: drawdownMax });
  else if (res.drawdown > drawdownMax) out.push({ code: 'draindown', drawdown: res.drawdown, max: drawdownMax });
  if (res.sMax <= 1e-9) out.push({ code: 'dry' });
  return out;
}

// ---------------------------------------------------------------------------
// A pond as saved in the project file (state.ponds), in the project's units (ft: ft, ft², in, cfs | m: m, m², mm, m³/s)

import { alternatingBlock } from './rain.js';

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const clampN = (v, d, lo, hi) => (fin(v) && v >= lo && v <= hi ? v : d);
const nm = (s, d) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 120) || d;
export const POND_KINDS = ['orifice', 'weir', 'vnotch', 'spillway'];

export function pondDefaults(units = 'ft') {
  const m = units === 'm';
  return { id: null, name: 'Pond', area: m ? 20000 : 5, cn: 80, tc: 20, catchment: null,   // area: m² | acres (the catchment's own unit)
    storm: { mode: 'uniform', depth: m ? 75 : 3, duration: 60 }, start: null, target: null, drawdownMax: 72,
    storage: { bottom: 100, area0: m ? 600 : 6000, perimeter0: m ? 100 : 320, side: 3, top: 104 },
    devices: [{ kind: 'orifice', invert: 100, diameter: m ? 0.15 : 0.5 }, { kind: 'spillway', crest: 103, length: m ? 3 : 10 }] };
}

export function cleanPond(o, units = 'ft') {
  const d = pondDefaults(units);
  if (!o || typeof o !== 'object') return null;
  const s = o.storage || {}, st = o.storm || {};
  const devices = (Array.isArray(o.devices) ? o.devices : []).slice(0, 20).map((x) => {
    if (!x || !POND_KINDS.includes(x.kind)) return null;
    if (x.kind === 'orifice') return { kind: 'orifice', invert: clampN(x.invert, 0, -1e5, 1e5), diameter: clampN(x.diameter, d.devices[0].diameter, 0.001, 100), cd: clampN(x.cd, 0.6, 0.1, 1) };
    if (x.kind === 'vnotch') return { kind: 'vnotch', invert: clampN(x.invert, 0, -1e5, 1e5), angle: clampN(x.angle, 90, 5, 170) };
    return { kind: x.kind, crest: clampN(x.crest, 0, -1e5, 1e5), length: clampN(x.length, 1, 0.01, 1e4) };
  }).filter(Boolean);
  return {
    id: /^q\d{1,9}$/.test(String(o.id)) ? String(o.id) : null, name: nm(o.name, d.name),
    area: clampN(o.area, d.area, 1e-6, 1e12), cn: clampN(o.cn, d.cn, 1, 100), tc: clampN(o.tc, d.tc, 1, 5000), catchment: typeof o.catchment === 'string' && o.catchment.length < 40 ? o.catchment : null,
    storm: { mode: st.mode === 'idf' ? 'idf' : 'uniform', depth: clampN(st.depth, d.storm.depth, 0.001, 5000), duration: clampN(st.duration, d.storm.duration, 1, 4320) },
    start: fin(o.start) ? o.start : null, target: fin(o.target) && o.target > 0 ? o.target : null, drawdownMax: clampN(o.drawdownMax, 72, 1, 2000),
    storage: { bottom: clampN(s.bottom, d.storage.bottom, -1e5, 1e5), area0: clampN(s.area0, d.storage.area0, 0, 1e10), perimeter0: clampN(s.perimeter0, d.storage.perimeter0, 0, 1e7), side: clampN(s.side, 3, 0, 20), top: clampN(s.top, d.storage.top, -1e5, 1e5) },
    devices: devices.length ? devices : d.devices,
  };
}

/** Run a saved pond: convert to SI, build the inflow, route it, check it; results come back in SI and in the project's units. `hydro` = the project's IDF settings (idf a, b, c) for the IDF storm. */
export function runPond(pond, units = 'ft', { hydro = null } = {}) {
  const p = cleanPond(pond, units); if (!p) return null;
  const m = units === 'm', L = m ? 1 : 0.3048, A = m ? 1 : 0.09290304, areaM2 = m ? p.area : p.area * 4046.8564224, depthMM = (v) => (m ? v : v * 25.4), Q = m ? 1 : 0.028316846592, V = L * L * L;
  const dt = Math.max(1, Math.min(10, Math.round(p.storm.duration / 60)));
  let rain;
  if (p.storm.mode === 'idf' && hydro?.idf) {
    const f = (tc) => hydro.idf.a / Math.pow(tc + hydro.idf.b, hydro.idf.c);
    rain = alternatingBlock(f, p.storm.duration, dt).map((r) => ({ t: r.t, i: depthMM(r.i) }));
  } else rain = (depthMM(p.storm.depth) / p.storm.duration) * 60;
  const hy = scsHydrograph({ area: areaM2, cn: p.cn, tc: p.tc, rain, duration: p.storm.duration, dt });
  const s = p.storage, rows = stageStorage({ kind: 'slopes', bottom: s.bottom * L, area0: s.area0 * A, perimeter0: s.perimeter0 * L, side: s.side, top: s.top * L, step: Math.max(0.02, (s.top - s.bottom) * L / 30) });
  const devs = p.devices.map((d) => (d.kind === 'orifice' ? { ...d, invert: d.invert * L, diameter: d.diameter * L } : d.kind === 'vnotch' ? { ...d, invert: d.invert * L } : { ...d, crest: d.crest * L, length: d.length * L }));
  const r = routePond(hy.q, hy.dt, rows, devs, { z0: (p.start ?? s.bottom) * L });
  const checks = checkPond(r, { top: s.top * L, target: p.target ? p.target * Q : null, drawdownMax: p.drawdownMax * 60 });
  return { pond: p, hydro: hy, rows, devices: devs, route: r, checks, conv: { len: L, area: A, vol: V, flow: Q }, runoffVolume: hy.volume,
    show: { peakIn: hy.peak / Q, peakOut: r.peakOut / Q, zMax: r.zMax / L, storageMax: r.sMax / V, capacity: rows[rows.length - 1].storage / V, runoff: hy.volume / V } };
}
