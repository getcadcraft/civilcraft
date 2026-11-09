/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-dyn.js — response spectrum and time history of a lib/frame model, for the Analysis panels (0.9 SU.1056). DOM-free. It sits on frame-fem.js
 * (the modal run: modalOfFrame) and dyn-core.js (the numerics) and hands the panel plain results. An analysis aid, not a code check; your engineer reviews the results.
 *
 *   responseSpectrum(out, frame, opts) → { ok, modes, cum, directions, disp, drifts, ends, baseShear, warnings, … }
 *       opts = { spectrum: (T) → Sa mm/s², dirs: { X: scale, Y: scale, Z: scale }, xi, method: 'cqc'|'srss'|'abs'|'tenpct', directional: '100-30'|'srss',
 *                scale: { mode: 'none'|'factor'|'target', factor, target: { X, Y, Z } (N), upOnly } }
 *   timeHistory(out, frame, opts) → { ok, t, series, peaks, drifts, ends: { max, min }, warnings, … }
 *       opts = { record: { dt, a, t? }, unit: 'g'|'ms2', dir, scale, method: 'modal'|'direct', damping: { kind: 'modal', xi } | { kind: 'rayleigh', modes: [i, j], xi }, h, tail, nModes }
 *   DYN                                                   what the apps pass the panel as host.fem.dyn
 * `out` is the result of modalOfFrame(frame, { n, bending, masses }) (ok = true). Units: mm, N, tonne, s.
 */
import { modalOfFrame } from './frame-fem.js';
import { beamEnds, expandFull } from './model.js';
import { G_MM, NOTE, spectrumFn, ccqc, directional, influence, reduceVec, mulCsr, dot, parseGroundMotion, resample, syntheticMotion, modalHistory, newmark, rayleighCoeffs, modalDamping } from './dyn-core.js';
import { storiesOf, floorMotion, driftVector, probeCount, driftRows, massesFromCases } from './stories.js';
import { pushoverOfFrame, nlTimeHistoryOfFrame, plasticOf, PUSH_NOTE } from './frame-push.js';

export { NOTE };
const AX = ['X', 'Y', 'Z'];

// ---- modal data shared by both analyses --------------------------------------------------------------------------------------------------------
function setup(out, frame, n) {
  const sys = out.sys, fem = out.conv.model, nm = Math.min(n || out.modal.omega.length, out.modal.omega.length);
  const w = out.modal.omega.slice(0, nm), phiFull = out.modal.modes.slice(0, nm);
  const phi = phiFull.map((f) => reduceVec(sys, f)), Mr = AX.map((_, a) => mulCsr(sys.M, influence(sys, a)));
  const gamma = phi.map((p) => Mr.map((m) => dot(p, m)));            // [mode][axis]
  const { stories } = storiesOf(fem, frame);
  const nb = fem.beams.length;
  const ends = phiFull.map((f) => { const e = new Float64Array(12 * nb); for (let m = 0; m < nb; m++) e.set(beamEnds(sys, f, m), 12 * m); return e; });
  const drift = phiFull.map((f) => driftVector(fem, stories, f));
  const totalMass = Mr.map((m, a) => dot(influence(sys, a), m));
  return { sys, fem, nm, w, phiFull, gamma, stories, ends, drift, totalMass, nb };
}
const effShare = (S) => S.gamma.map((g) => g.map((v, a) => (S.totalMass[a] > 0 ? v * v / S.totalMass[a] : 0)));

/** Combine nm signed modal arrays into one array of magnitudes. */
function combineArrays(V, w, { method = 'cqc', xi = 0.05 } = {}) {
  const nm = V.length, len = V[0].length, out = new Float64Array(len);
  if (method === 'abs') { for (let i = 0; i < nm; i++) for (let k = 0; k < len; k++) out[k] += Math.abs(V[i][k]); return out; }
  const rho = [];
  for (let i = 0; i < nm; i++) { rho.push(new Float64Array(nm)); for (let j = 0; j < nm; j++) rho[i][j] = i === j ? 1 : method === 'cqc' ? ccqc(w[j] / w[i], xi) : method === 'tenpct' ? (Math.abs(w[j] - w[i]) <= 0.1 * Math.min(w[i], w[j]) ? 1 : 0) : 0; }
  const abs = method === 'tenpct';
  for (let k = 0; k < len; k++) {
    let s = 0;
    for (let i = 0; i < nm; i++) {
      const a = abs ? Math.abs(V[i][k]) : V[i][k]; if (!a) continue;
      s += a * a;
      for (let j = i + 1; j < nm; j++) { if (!rho[i][j]) continue; const b = abs ? Math.abs(V[j][k]) : V[j][k]; s += 2 * rho[i][j] * a * b; }
    }
    out[k] = Math.sqrt(Math.max(s, 0));
  }
  return out;
}

// ---- response spectrum ------------------------------------------------------------------------------------------------------------------------
export function responseSpectrum(out, frame, opts) {
  const warnings = [];
  if (!out?.ok) return { ok: false, error: { code: 'no-modes' }, warnings };
  if (typeof opts.spectrum !== 'function') return { ok: false, error: { code: 'no-spectrum' }, warnings };
  const xi = opts.xi ?? 0.05, method = opts.method || 'cqc', rule = opts.directional || '100-30';
  const dirsOn = AX.filter((a) => (opts.dirs?.[a] ?? 0) > 0);
  if (!dirsOn.length) return { ok: false, error: { code: 'no-direction' }, warnings };
  const S = setup(out, frame, opts.nModes), { w, gamma, nm } = S;
  const share = effShare(S), cum = [0, 0, 0];
  const rows = w.map((om, k) => {
    for (let a = 0; a < 3; a++) cum[a] += share[k][a];
    return { n: k + 1, omega: om, hz: om / (2 * Math.PI), period: 2 * Math.PI / om, gamma: gamma[k], share: share[k], cum: [...cum], Sa: opts.spectrum(2 * Math.PI / om) };
  });
  const need = dirsOn.filter((a) => cum[AX.indexOf(a)] < 0.9);
  if (need.length) warnings.push({ code: 'mass-short', dirs: need.join(', '), pct: Math.round(100 * Math.min(...need.map((a) => cum[AX.indexOf(a)]))) });
  if (rows.some((r) => r.Sa === 0)) warnings.push({ code: 'zero-sa' });
  const nn6 = 6 * S.fem.nodes.length, perDir = {}, magD = {}, magR = {}, magE = {}, magBS = { X: [0, 0, 0], Y: [0, 0, 0], Z: [0, 0, 0] };
  const sc = opts.scale || { mode: 'none' };
  for (const a of dirsOn) {
    const ai = AX.indexOf(a), s = opts.dirs[a];
    const Sa = rows.map((r) => r.Sa * s);
    const c = rows.map((r, k) => gamma[k][ai] * Sa[k] / (r.omega * r.omega));                        // modal peak displacement factor
    // base shear along each axis b caused by excitation a: Γb Γa Sa
    const V = AX.map((_, b) => combineArrays(rows.map((r, k) => Float64Array.of(gamma[k][b] * gamma[k][ai] * Sa[k])), w, { method, xi })[0]);
    let f = 1;
    if (sc.mode === 'factor') f = Number(sc.factor) > 0 ? Number(sc.factor) : 1;
    else if (sc.mode === 'target') { const tgt = Number(sc.target?.[a]); if (tgt > 0 && V[ai] > 0) { f = tgt / V[ai]; if (sc.upOnly !== false) f = Math.max(1, f); } }
    perDir[a] = { scaleIn: s, baseShear: V.map((v) => v * f), baseShearUnscaled: V, factor: f };
    const dispM = rows.map((_, k) => Float64Array.from(S.phiFull[k], (v) => v * c[k]));
    magD[a] = combineArrays(dispM, w, { method, xi }).map((v) => v * f);
    magR[a] = combineArrays(rows.map((_, k) => Float64Array.from(S.drift[k], (v) => v * c[k])), w, { method, xi }).map((v) => v * f);
    magE[a] = combineArrays(rows.map((_, k) => Float64Array.from(S.ends[k], (v) => v * c[k])), w, { method, xi }).map((v) => v * f);
    for (let b = 0; b < 3; b++) magBS[a][b] = V[b] * f;
  }
  const disp = directional(magD, rule), dvec = directional(magR, rule), ends = directional(magE, rule);
  const baseShear = AX.map((_, b) => directional(Object.fromEntries(dirsOn.map((a) => [a, Float64Array.of(magBS[a][b])])), rule)[0]);
  if (nm < 3) warnings.push({ code: 'few-modes', n: nm });
  return { ok: true, modes: rows, cum, dirs: dirsOn, perDir, disp, nn: nn6 / 6, drifts: driftRows(S.fem, S.stories, dvec), ends, baseShear, baseShearDir: AX.map((_, b) => ({ axis: AX[b], v: baseShear[b] })),
    method, rule, xi, warnings, stories: S.stories, fem: S.fem, note: NOTE };
}

// ---- time history -----------------------------------------------------------------------------------------------------------------------------
export function timeHistory(out, frame, opts) {
  const warnings = [];
  if (!out?.ok) return { ok: false, error: { code: 'no-modes' }, warnings };
  const rec = opts.record;
  if (!rec || !rec.a || rec.a.length < 2) return { ok: false, error: { code: 'no-record' }, warnings };
  const dir = opts.dir || 'X', ai = AX.indexOf(dir);
  const unit = opts.unit === 'g' ? G_MM : opts.unit === 'mms2' ? 1 : 1000, sc = (opts.scale ?? 1) * unit;
  const h = opts.h > 0 ? opts.h : rec.dt;
  if (h > rec.dt * 1.0000001) warnings.push({ code: 'step-coarse' });
  const tail = Math.max(0, opts.tail ?? 0);
  const rs = resample(rec, h, { tail });
  const a = Float64Array.from(rs.a, (v) => v * sc), nsteps = a.length;
  if (nsteps > 200000) return { ok: false, error: { code: 'too-many-steps', n: nsteps }, warnings };
  const S = setup(out, frame, opts.nModes), { w, gamma, nm } = S;
  const kind = opts.method === 'direct' ? 'direct' : 'modal';
  let dmp = opts.damping || { kind: 'modal', xi: 0.05 };
  if (dmp.kind === 'rayleigh') { const nO = out.modal.omega.length; let i = Math.min(Math.max(1, dmp.modes?.[0] ?? 1), nO), j = Math.min(Math.max(1, dmp.modes?.[1] ?? nO), nO); if (i === j) j = Math.min(nO, i + 1); if (i === j) i = Math.max(1, j - 1); dmp = { kind: 'rayleigh', ...rayleighCoeffs(out.modal.omega[i - 1], out.modal.omega[j - 1], dmp.xi) }; }
  else if (kind === 'direct') { dmp = { kind: 'rayleigh', ...rayleighCoeffs(out.modal.omega[0], out.modal.omega[Math.max(1, nm - 1)], dmp.xi) }; warnings.push({ code: 'direct-rayleigh' }); }
  const t = Float64Array.from({ length: nsteps }, (_, i) => i * h);
  const top = S.stories.length - 1, fem = S.fem;
  const NS = S.stories.length, np = probeCount(S.stories), nb = S.nb;
  const roof = new Float64Array(nsteps), base = new Float64Array(nsteps), floors = Array.from({ length: NS }, () => new Float64Array(nsteps));
  const driftMax = new Float64Array(2 * np), driftAt = new Float64Array(2 * np);
  const driftSeries = Array.from({ length: NS }, () => new Float64Array(nsteps));        // the worst probe's drift (by amplitude, either axis along the input) per story
  const emax = new Float64Array(12 * nb).fill(-Infinity), emin = new Float64Array(12 * nb).fill(Infinity);
  const mot = S.phiFull.map((f) => S.stories.map((st) => floorMotion(fem, st, f)));         // [mode][floor] → [Ux, Uy, Rz]
  const axis = ai === 1 ? 1 : 0;
  const probeAt = []; let at = 0; S.stories.forEach((st, s) => { st.probes.forEach(() => { probeAt.push({ s, k: at }); at += 2; }); });
  const onStep = (i, drift2, floorsU, ends, vb) => {
    if (NS) roof[i] = floorsU[top][axis];
    for (let s = 0; s < NS; s++) floors[s][i] = floorsU[s][axis];
    base[i] = vb;
    let wr = new Float64Array(NS);
    for (let k = 0; k < probeAt.length; k++) { const v = Math.abs(drift2[probeAt[k].k + axis]); if (v > wr[probeAt[k].s]) { wr[probeAt[k].s] = v; driftSeries[probeAt[k].s][i] = drift2[probeAt[k].k + axis]; } }
    for (let k = 0; k < 2 * np; k++) { const v = Math.abs(drift2[k]); if (v > driftMax[k]) { driftMax[k] = v; driftAt[k] = i * h; } }
    for (let k = 0; k < ends.length; k++) { const v = ends[k]; if (v > emax[k]) emax[k] = v; if (v < emin[k]) emin[k] = v; }
  };
  if (kind === 'modal') {
    const xis = modalDamping(dmp, w);
    if (xis.some((x) => !(x > 0 && x < 1))) return { ok: false, error: { code: 'bad-damping' }, warnings };
    const hist = modalHistory(w.map((om, k) => ({ w: om, gamma: gamma[k][ai], xi: xis[k] })), a, h);
    const d2 = new Float64Array(2 * np), fU = Array.from({ length: NS }, () => [0, 0, 0]), en = new Float64Array(12 * nb);
    for (let i = 0; i < nsteps; i++) {
      d2.fill(0); en.fill(0); for (const f of fU) f.fill(0);
      let vb = 0;
      for (let k = 0; k < nm; k++) {
        const q = hist[k].q[i]; if (!q) continue;
        const dk = S.drift[k], ek = S.ends[k];
        for (let m = 0; m < d2.length; m++) d2[m] += q * dk[m];
        for (let m = 0; m < en.length; m++) en[m] += q * ek[m];
        for (let s = 0; s < NS; s++) { const mm = mot[k][s]; fU[s][0] += q * mm[0]; fU[s][1] += q * mm[1]; }
        vb += gamma[k][ai] * w[k] * w[k] * q;
      }
      onStep(i, d2, fU, en, vb);
    }
  } else {
    if (S.sys.ndof > 6000 || nsteps * nb > 4e6) return { ok: false, error: { code: 'too-big-direct' }, warnings };
    const r = influence(S.sys, ai), Kr = S.sys.K;
    const res = newmark(S.sys, r, a, h, { a0: dmp.a0, a1: dmp.a1, each: (i, u) => {
      const full = expandFull(S.sys, u), en = new Float64Array(12 * nb);
      for (let m = 0; m < nb; m++) en.set(beamEnds(S.sys, full, m), 12 * m);
      const fU = S.stories.map((st) => floorMotion(fem, st, full));
      let vb = 0; const ku = mulCsr(Kr, u); for (let q = 0; q < r.length; q++) vb += r[q] * ku[q];
      onStep(i, driftVector(fem, S.stories, full), fU, en, vb);
    } });
    if (!res.ok) return { ok: false, error: { code: 'solver', step: res.step }, warnings };
  }
  const peak = (arr) => { let m = 0, k = 0; for (let i = 0; i < arr.length; i++) if (Math.abs(arr[i]) > m) { m = Math.abs(arr[i]); k = i; } return { value: m, t: k * h }; };
  const pga = peak(a);
  let off = 0;
  const drifts = S.stories.map((st) => {
    let mx = 0, my = 0, tx = 0, ty = 0, nx = null, ny = null;
    st.probes.forEach((p, pi) => { const k = 2 * (off + pi); if (driftMax[k] > mx) { mx = driftMax[k]; tx = driftAt[k]; nx = p.node; } if (driftMax[k + 1] > my) { my = driftMax[k + 1]; ty = driftAt[k + 1]; ny = p.node; } });
    off += st.probes.length;
    return { name: st.name, z: st.z, h: st.h, dx: mx, dy: my, tX: tx, tY: ty, nodeX: nx, nodeY: ny, ratioX: st.h > 0 ? mx / st.h : null, ratioY: st.h > 0 ? my / st.h : null };
  });
  const series = { roof: { label: 'roof', data: roof, peak: peak(roof) }, base: { label: 'base', data: base, peak: peak(base) }, input: { label: 'input', data: a, peak: pga }, floors: floors.map((d, s) => ({ name: S.stories[s].name, data: d, peak: peak(d) })), drift: driftSeries.map((d, s) => ({ name: S.stories[s].name, data: d, peak: peak(d) })) };
  return { ok: true, t, h, dt: h, steps: nsteps, series, drifts, ends: { max: emax, min: emin }, damping: dmp, method: kind, dir, warnings, stories: S.stories, fem, note: NOTE,
    modes: w.map((om, k) => ({ n: k + 1, hz: om / (2 * Math.PI), gamma: gamma[k][ai] })), cum: effShare(S).reduce((c, r) => c + r[ai], 0) };
}

/** What the apps hand the panel (host.fem.dyn). */
export const DYN = { modal: modalOfFrame, massesFromCases, responseSpectrum, timeHistory, pushover: pushoverOfFrame, nlTimeHistory: nlTimeHistoryOfFrame, plasticOf, spectrumFn, parseGroundMotion, syntheticMotion, resample, note: NOTE, pushNote: PUSH_NOTE };
