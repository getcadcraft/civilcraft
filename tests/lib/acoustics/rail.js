/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and keys; the host's panels pass t() and show the language files' words. */
/**
 * rail.js — railway noise emission by CNOSSOS-EU (0.11 XE.3 phase S4, sound-11, rail fork). DOM-free; imports only from lib/acoustics.
 * Method: Directive (EU) 2015/996 Annex II § 2.3 as amended by Delegated Directive (EU) 2021/1226 points (1), (3)–(5); data in cnossos-rail.js (Appendix G).
 * Equation numbers below are the directive's. The source power is worked in one-third octaves 50 Hz – 10 kHz (2021 point (1)) and summed to octaves
 * 63 Hz – 8 kHz (text under eq. 2.3.5, OJ L 168/18) for outdoor.js.
 *
 *   railEmission({ trains, track, curve?, bridge? }) → { ok, sources: [{ h, kind: 'A'|'B', lwPerMetre: [8], thirds: { rolling, traction, aero, bridge } }], notes }
 *     trains  [{ type /* Table 2.3.a: h m p c d e a o *\/, count /* vehicles per hour *\/, v /* km/h *\/, axles, brake /* WHEEL_ROUGHNESS key *\/,
 *               wheel /* WHEEL_TRANSFER key *\/, contact /* CONTACT_FILTER key *\/, traction? /* TRACTION key *\/, aero? /* true: eq. 2.3.13–2.3.14 *\/ }]
 *             one entry per vehicle type and speed: count is vehicles (not trains) per hour (§ 2.3.1, e.g. 24 vehicles in 4 hours = 6 per hour)
 *     track   { roughness: 'E'|'M', transfer: TRACK_TRANSFER key, joints?: joint density nl in m⁻¹ (true = the default 0,01) }
 *     curve   { radius (m), length (m, along the curve), turnout?: true }      bridge: BRIDGE_TRANSFER key ('+10' | '+15')
 *   lwPerMetre: the directional sound power per metre LW′,eq,T,dir (eq. 2.3.1–2.3.2) per octave, dB/m re 1 pW, in the direction φ = 90°, ψ = 0 where every
 *   directivity term of eq. 2.3.15–2.3.17 is 0 dB. Other directions: railDirectional(source, psi, phi). Idling (eq. 2.3.4) is a fixed point source for
 *   the industrial method (§ 2.3.2) and is not a line source here.
 *   The parts are exported for tests: roughnessAt, spectrumAtSpeed, totalRoughness (2.3.7), impactRoughness (2.3.11–2.3.12), rollingPower (2.3.8–2.3.10),
 *   aeroPower (2.3.13–2.3.14), bridgePower (2.3.18, 2021), flowTerm (2.3.2), squealExcess (2021), dirHorizontal (2.3.15), dirVertical (2.3.16 2021, 2.3.17), toOctaves.
 *
 * Read from the text, stated as choices (each also in `notes` where it applies):
 *  - "averaged energetically and proportionally" between the two wavelength bands around λ = v/f (OJ L 168/19): energy interpolation, linear in lg λ.
 *    The contact filter A3 is a filter in dB and is interpolated linearly in dB over lg λ.
 *  - A wavelength outside a table (wheel roughness starts at 1 000 mm, the 2021 tables at 2 000 mm) takes the nearest row; `notes` says so.
 *  - v is converted from km/h to m/s for λ = v/f (the text gives v in km/h next to f in Hz; the ratio is a wavelength in metres only in m/s).
 *  - Traction noise is taken as omnidirectional horizontally: eq. 2.3.15's dipole lists "fans" but not the traction source as a whole.
 */
import {
  THIRDS, WAVELENGTHS_MM, WHEEL_WAVELENGTHS_MM, RAIL_ROUGHNESS, WHEEL_ROUGHNESS, CONTACT_FILTER, TRACK_TRANSFER, WHEEL_TRANSFER, SUPER_TRANSFER, IMPACT,
  NL_DEFAULT, TRACTION, AERO, BRIDGE_TRANSFER, HEIGHTS, V_MIN, SQUEAL,
} from './cnossos-rail.js';

const lg = Math.log10;
const e10 = (L) => Math.pow(10, L / 10);
export const sumLevels = (levels) => { const s = levels.reduce((a, L) => a + (Number.isFinite(L) ? e10(L) : 0), 0); return s > 0 ? 10 * lg(s) : -Infinity; };
const add = (a, b) => a.map((x, i) => sumLevels([x, b[i]]));
const NONE = () => THIRDS.map(() => -Infinity);

/** One value of a wavelength table at wavelength λ (m). mode 'energy' (roughness) or 'db' (a filter). → { L, clamped } */
export function roughnessAt(wavelengthsMm, values, lambdaM, mode = 'energy') {
  const x = lambdaM * 1000, n = wavelengthsMm.length;            // tables run from the longest wavelength down
  if (x >= wavelengthsMm[0]) return { L: values[0], clamped: x > wavelengthsMm[0] * (1 + 1e-9) };
  if (x <= wavelengthsMm[n - 1]) return { L: values[n - 1], clamped: x < wavelengthsMm[n - 1] * (1 - 1e-9) };
  let k = 0; while (!(wavelengthsMm[k] >= x && wavelengthsMm[k + 1] <= x)) k++;
  const a = wavelengthsMm[k], b = wavelengthsMm[k + 1], w = (lg(a) - lg(x)) / (lg(a) - lg(b));
  const L = mode === 'db' ? values[k] * (1 - w) + values[k + 1] * w : 10 * lg((1 - w) * e10(values[k]) + w * e10(values[k + 1]));
  return { L, clamped: false };
}
/** A wavelength table as a one-third-octave frequency spectrum at speed v (km/h): λ = v/f (OJ L 168/19, 21). → { L: [24], clamped } */
export function spectrumAtSpeed(wavelengthsMm, values, vKmh, mode = 'energy') {
  const v = vKmh / 3.6; let clamped = false;
  const L = THIRDS.map((f) => { const r = roughnessAt(wavelengthsMm, values, v / f, mode); clamped ||= r.clamped; return r.L; });
  return { L, clamped };
}
/** eq. 2.3.7: LR,TOT,i = 10 lg(10^(Lr,TR/10) + 10^(Lr,VEH/10)) + A3,i, per band. */
export const totalRoughness = (rail, wheel, a3) => rail.map((r, i) => 10 * lg(e10(r) + e10(wheel[i])) + a3[i]);
/** eq. 2.3.12 then 2.3.11: LR,IMPACT = single + 10 lg(nl/0,01), added energetically to LR,TOT. */
export const impactRoughness = (lrTot, impactSingle, nl) => lrTot.map((L, i) => 10 * lg(e10(L) + e10(impactSingle[i] + 10 * lg(nl / NL_DEFAULT))));
/** eq. 2.3.8–2.3.10: track, wheel and superstructure sound power per vehicle (h = 1). sup = null for non-freight vehicles. */
export function rollingPower(lrTot, { track, wheel, sup = null, axles }) {
  const n = 10 * lg(axles);
  const tr = lrTot.map((L, i) => L + track[i] + n), veh = lrTot.map((L, i) => L + wheel[i] + n), su = sup ? lrTot.map((L, i) => L + sup[i] + n) : NONE();
  return { tr, veh, sup: su, total: tr.map((x, i) => sumLevels([x, veh[i], su[i]])) };
}
/** eq. 2.3.13 (h = 1) and 2.3.14 (h = 2): aerodynamic noise per vehicle at speed v (km/h). */
export const aeroPower = (vKmh) => ({ A: AERO.L1.map((L) => L + AERO.alpha1 * lg(vKmh / AERO.v0)), B: AERO.L2.map((L) => L + AERO.alpha2 * lg(vKmh / AERO.v0)) });
/** eq. 2.3.18 (2021 point (5)): bridge noise per vehicle, an extra source at h = 1, omnidirectional. */
export const bridgePower = (lrTot, bridge, axles) => lrTot.map((L, i) => L + bridge[i] + 10 * lg(axles));
/** eq. 2.3.2: from one vehicle to a flow of Q vehicles an hour at v km/h, per metre. */
export const flowTerm = (Q, vKmh) => 10 * lg(Q / (1000 * vKmh));
/** 2021 point (4)(b): the simple squeal excess, dB. tram = vehicle type c. */
export function squealExcess(curve, tram) {
  if (!curve || !(curve.radius > 0)) return 0;
  const R = curve.radius, l = Number(curve.length) || 0;
  if (tram) return R <= 200 ? SQUEAL.tram.r200 : 0;
  if (curve.turnout && R <= 300) return SQUEAL.train.turnout300;
  if (R <= 300 && l >= SQUEAL.train.minLength) return SQUEAL.train.curve300;
  if (R > 300 && R <= 500 && l >= SQUEAL.train.minLength) return SQUEAL.train.curve500;
  return 0;
}
/** eq. 2.3.15: horizontal dipole, φ in radians from the direction of travel. */
export const dirHorizontal = (phi) => 10 * lg(0.01 + 0.99 * Math.sin(phi) ** 2);
/** eq. 2.3.16 as replaced in 2021 (source A, 0 < ψ < π/2; 0 for ψ ≤ 0) and eq. 2.3.17 (source B, aerodynamic, ψ < 0). */
export function dirVertical(psi, fc, kind, aero = false) {
  if (kind === 'A') return psi > 0 && psi < Math.PI / 2 ? (40 / 3) * ((2 / 3) * Math.sin(2 * psi) - Math.sin(psi)) * lg((fc + 600) / 200) : 0;
  if (kind === 'B' && aero) return psi < 0 ? 10 * lg(Math.cos(psi) ** 2) : 0;
  return 0;
}
/** Third octaves 50 Hz – 10 kHz → octaves 63 Hz – 8 kHz by energy (text under eq. 2.3.5). */
export const toOctaves = (t) => [0, 1, 2, 3, 4, 5, 6, 7].map((k) => sumLevels([t[3 * k], t[3 * k + 1], t[3 * k + 2]]));

const need = (table, key, what) => { const v = table[key]; if (!v) throw Object.assign(new Error(what + ': unknown key ' + key), { code: 'badkey', what, key }); return v; };

export function railEmission({ trains = [], track = {}, curve = null, bridge = null } = {}) {
  const notes = [], parts = { A: { rolling: NONE(), traction: NONE(), aero: NONE(), bridge: NONE() }, B: { traction: NONE(), aero: NONE() } };
  try {
    const rr = need(RAIL_ROUGHNESS, track.roughness, 'rail roughness (Table 2.3.b code with data: E or M)');
    const tt = need(TRACK_TRANSFER, track.transfer, 'track transfer');
    const bt = bridge ? need(BRIDGE_TRANSFER, bridge, 'bridge type') : null;
    const nl = track.joints === true ? NL_DEFAULT : Number(track.joints) > 0 ? Number(track.joints) : 0;
    for (const [n, t] of trains.entries()) {
      const Q = Number(t.count), v = Number(t.v), axles = Number(t.axles);
      if (!(Q > 0) || !(v > 0) || !(axles > 0)) { notes.push({ key: 'ac.rail.note.skip', n: n + 1 }); continue; }
      const tram = t.type === 'c', vmin = tram ? V_MIN.tram : V_MIN.train, vs = Math.max(v, vmin);
      if (vs > v) notes.push({ key: 'ac.rail.note.vmin', n: n + 1, v: vmin });
      const wr = need(WHEEL_ROUGHNESS, t.brake, 'wheel roughness (brake)'), wt = need(WHEEL_TRANSFER, t.wheel, 'wheel transfer'), cf = need(CONTACT_FILTER, t.contact, 'contact filter');
      const rail = spectrumAtSpeed(WAVELENGTHS_MM, rr.L, vs), wheel = spectrumAtSpeed(WHEEL_WAVELENGTHS_MM, wr.L, vs), a3 = spectrumAtSpeed(WAVELENGTHS_MM, cf.A, vs, 'db');
      if (rail.clamped || wheel.clamped || a3.clamped) notes.push({ key: 'ac.rail.note.clamped', n: n + 1 });
      let lr = totalRoughness(rail.L, wheel.L, a3.L);
      if (nl > 0) {
        if (v < vmin) notes.push({ key: 'ac.rail.note.noimpact', n: n + 1 });   // OJ L 168/20: impact is not modelled below the minimum speed
        else { const imp = spectrumAtSpeed(WAVELENGTHS_MM, IMPACT, vs); lr = impactRoughness(lr, imp.L, nl); }
      }
      const flow = flowTerm(Q, v);
      const roll = rollingPower(lr, { track: tt.L, wheel: wt.L, sup: t.type === 'a' ? SUPER_TRANSFER.L : null, axles });
      const sq = squealExcess(curve, tram);
      parts.A.rolling = add(parts.A.rolling, roll.total.map((L) => L + sq + flow));
      if (bt) parts.A.bridge = add(parts.A.bridge, bridgePower(lr, bt.L, axles).map((L) => L + flow));
      if (t.traction) { const tr = need(TRACTION, t.traction, 'traction'); parts.A.traction = add(parts.A.traction, tr.A.map((L) => L + flow)); parts.B.traction = add(parts.B.traction, tr.B.map((L) => L + flow)); }
      if (t.aero) { const ae = aeroPower(vs); parts.A.aero = add(parts.A.aero, ae.A.map((L) => L + flow)); parts.B.aero = add(parts.B.aero, ae.B.map((L) => L + flow)); if (v <= 200) notes.push({ key: 'ac.rail.note.aerolow', n: n + 1 }); }
    }
    if (!['E', 'M'].includes(track.roughness)) notes.push({ key: 'ac.rail.note.nodata' });
  } catch (e) {
    if (e.code === 'badkey') return { ok: false, reason: 'badkey', what: e.what, key: e.key, notes };
    throw e;
  }
  const sources = [['A', parts.A], ['B', parts.B]].map(([kind, p]) => {
    const all = THIRDS.map((_, i) => sumLevels(Object.values(p).map((s) => s[i])));
    return { h: HEIGHTS[kind], kind, thirds: p, lwPerMetre: toOctaves(all) };
  });
  return { ok: true, sources, notes };
}

/** A source of railEmission in the direction (ψ, φ) (radians, Figure 2.3.b): eq. 2.3.5 with 2.3.15–2.3.17, per octave. */
export function railDirectional(source, psi, phi) {
  const h = dirHorizontal(phi), out = THIRDS.map((fc, i) => {
    const p = source.thirds, ls = [];
    if (source.kind === 'A') {
      const v = dirVertical(psi, fc, 'A');
      ls.push(p.rolling[i] + h + v, p.aero[i] + h + v, p.traction[i] + v, p.bridge[i]);   // bridge omnidirectional (2021 point (4)(c))
    } else ls.push(p.traction[i], p.aero[i] + h + dirVertical(psi, fc, 'B', true));
    return sumLevels(ls);
  });
  return toOctaves(out);
}
