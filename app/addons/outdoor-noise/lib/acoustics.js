/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — English fallbacks for the assistant's results and file text; the panels pass t() and show the language files' words. */
/**
 * acoustics.js — room acoustics: reverberation time by octave band (0.8 EG.49, session bim-sim_PART_2; moved to lib/acoustics by xe-sound_PART_3, XE.3).
 * CANONICAL HERE: hosts carry byte-identical copies from `node tools/acoustics/sync.mjs [--check] bimcraft` (never edit a copy). No DOM: tools/bimcraft-test/acoustics-test.mjs
 * (node bin/test-bimcraft.mjs --acoustics) runs it in Node. SI units (m, m², m³, s); six octave bands, 125 Hz – 4 kHz.
 *
 * The classical statistical room (a diffuse sound field):
 *   Sabine  T = 0.161 V / (A + 4mV)                      A = Σ Sᵢαᵢ (m² sabins), best while the room is not very absorbent (ᾱ under about 0.2)
 *   Eyring  T = 0.161 V / (−S ln(1 − ᾱ) + 4mV)           ᾱ = A / S, better for dead rooms; the two agree as ᾱ → 0
 * m is the air's absorption of sound energy (1/m) from ISO 9613-1's formula at the room's temperature, humidity and pressure.
 * It is a guide for choosing finishes, not a prediction of how one particular room measures: it assumes absorption spread evenly and a room
 * of ordinary proportions, and it knows nothing of furniture, people, openings to other rooms or scattering. Coefficients are typical published
 * values (textbook tables of reverberation-room measurements, rounded) labelled as defaults for the person to replace with a product's data.
 *
 *   BANDS · MATERIALS · materialKeys(kind)
 *   airAbsorption(f, { T, RH, p }) → dB per metre (ISO 9613-1)           airM(f, env) → m, energy absorption per metre (1/m)
 *   reverb(room, env) → { volume, area, bands: [{ f, A, alpha, sabine, eyring, T }], mean, mid: { sabine, eyring, T }, notes }
 *        room = { volume_m3, surfaces: [{ key?, name?, area_m2, alpha?: [6] }], extra?: [{ name?, a: [6] }]  (m² sabins per band, e.g. people, a curtain) }
 *        env  = { T: °C (20), RH: % (50), p: kPa (101.325), air: true }
 *   rtProblems(rooms, { target, t }) → [problem]    mid-band reverberation over the person's own target, with the absorption that would meet it
 */
export const BANDS = [125, 250, 500, 1000, 2000, 4000];
const C = 0.161;   // 24 ln(10) / c at 20 °C: the constant of both formulas

/** Typical octave-band absorption coefficients α (125 … 4000 Hz). `kind`: where it is meant to be used. Defaults to review, not a product's data. */
export const MATERIALS = {
  'concrete': { name: 'Concrete or masonry, painted', kind: 'any', alpha: [0.01, 0.01, 0.02, 0.02, 0.02, 0.03] },
  'brick': { name: 'Brick, unglazed', kind: 'wall', alpha: [0.03, 0.03, 0.03, 0.04, 0.05, 0.07] },
  'plaster': { name: 'Plaster on solid backing', kind: 'any', alpha: [0.01, 0.02, 0.02, 0.03, 0.04, 0.05] },
  'gypsum': { name: 'Gypsum board on studs', kind: 'any', alpha: [0.29, 0.10, 0.05, 0.04, 0.07, 0.09] },
  'wood-panel': { name: 'Wood panelling on battens', kind: 'wall', alpha: [0.28, 0.22, 0.17, 0.09, 0.10, 0.11] },
  'wood-floor': { name: 'Wood floor on joists', kind: 'floor', alpha: [0.15, 0.11, 0.10, 0.07, 0.06, 0.07] },
  'vinyl-floor': { name: 'Vinyl or tile floor on concrete', kind: 'floor', alpha: [0.02, 0.03, 0.03, 0.03, 0.03, 0.02] },
  'carpet': { name: 'Carpet, heavy, on concrete', kind: 'floor', alpha: [0.02, 0.06, 0.14, 0.37, 0.60, 0.65] },
  'ceiling-tile': { name: 'Suspended mineral-fibre ceiling tile', kind: 'ceiling', alpha: [0.50, 0.60, 0.70, 0.75, 0.75, 0.70] },
  'ceiling-board': { name: 'Plasterboard ceiling', kind: 'ceiling', alpha: [0.29, 0.10, 0.05, 0.04, 0.07, 0.09] },
  'glass': { name: 'Window glass', kind: 'opening', alpha: [0.35, 0.25, 0.18, 0.12, 0.07, 0.04] },
  'door': { name: 'Wood door', kind: 'opening', alpha: [0.14, 0.10, 0.06, 0.08, 0.10, 0.10] },
  'curtain': { name: 'Heavy curtain, draped', kind: 'any', alpha: [0.07, 0.31, 0.49, 0.75, 0.70, 0.60] },
};
/**
 * 0.8 EG.49 (bim-sim_PART_3): sound absorbed by people and furnishings, in m² sabins per band (125 … 4000 Hz) for one person or piece. Rough planning figures in
 * the range textbooks give for a seated adult and for upholstered and hard furniture, rounded: defaults for the person to review, not a product's data.
 */
export const PERSON_ABSORPTION = [0.25, 0.35, 0.42, 0.46, 0.50, 0.50];
export const FURNISHINGS = [
  { key: 'sofa', re: /sofa|couch|armchair|settee/i, a: [0.5, 0.7, 0.9, 0.9, 0.9, 0.8] },
  { key: 'bed', re: /bed\b|mattress/i, a: [0.4, 0.6, 0.8, 0.9, 0.9, 0.8] },
  { key: 'wardrobe', re: /wardrobe|closet/i, a: [0.1, 0.15, 0.2, 0.25, 0.3, 0.3] },
  { key: 'chair', re: /chair|stool/i, a: [0.03, 0.04, 0.06, 0.08, 0.09, 0.09] },
  { key: 'hard', re: /table|desk|cabinet|shelf|sink|lavatory|wc\b|toilet|bath|shower/i, a: [0.02, 0.03, 0.04, 0.05, 0.06, 0.06] },
];
export const furnishingFor = (name) => FURNISHINGS.find((f) => f.re.test(String(name || ''))) || null;
export const materialKeys = (kind) => Object.keys(MATERIALS).filter((k) => MATERIALS[k].kind === kind || MATERIALS[k].kind === 'any');

/** ISO 9613-1 pure-tone attenuation in dB per metre (temperature °C, relative humidity %, pressure kPa). */
export function airAbsorption(f, { T = 20, RH = 50, p = 101.325 } = {}) {
  const Tk = T + 273.15, T0 = 293.15, pr = 101.325, T01 = 273.16;
  const Csat = -6.8346 * Math.pow(T01 / Tk, 1.261) + 4.6151, psat = pr * Math.pow(10, Csat), h = RH * (psat / p);   // molar concentration of water vapour, %
  const frO = (p / pr) * (24 + 4.04e4 * h * (0.02 + h) / (0.391 + h));
  const frN = (p / pr) * Math.pow(Tk / T0, -0.5) * (9 + 280 * h * Math.exp(-4.170 * (Math.pow(Tk / T0, -1 / 3) - 1)));
  return 8.686 * f * f * (1.84e-11 * (pr / p) * Math.sqrt(Tk / T0) + Math.pow(Tk / T0, -2.5) * (0.01275 * Math.exp(-2239.1 / Tk) / (frO + f * f / frO) + 0.1068 * Math.exp(-3352 / Tk) / (frN + f * f / frN)));
}
/** Energy absorption of the air in 1/m: the dB figure over 10 log10(e). */
export const airM = (f, env = {}) => airAbsorption(f, env) / 4.343;

export function reverb(room, env = {}) {
  const e = { T: 20, RH: 50, p: 101.325, air: true, ...env }, V = Number(room.volume_m3), notes = [];
  const surfaces = (room.surfaces || []).map((s) => ({ ...s, alpha: s.alpha || MATERIALS[s.key]?.alpha })).filter((s) => s.area_m2 > 0);
  if (!(V > 0) || !surfaces.length) return { ok: false, reason: 'noroom', notes };
  for (const s of surfaces) if (!s.alpha) return { ok: false, reason: 'nomaterial', notes, key: s.key };
  const S = surfaces.reduce((a, s) => a + s.area_m2, 0);
  const bands = BANDS.map((f, i) => {
    const sa = surfaces.reduce((a, s) => a + s.area_m2 * s.alpha[i], 0) + (room.extra || []).reduce((a, x) => a + (x.a?.[i] || 0), 0);
    const alpha = Math.min(0.999, sa / S), air = e.air ? 4 * airM(f, e) * V : 0;
    return { f, A: sa, alpha, air, sabine: C * V / (sa + air), eyring: C * V / (-S * Math.log(1 - alpha) + air) };
  });
  for (const b of bands) b.T = b.alpha > 0.2 ? b.eyring : b.sabine;
  const mean = bands.reduce((a, b) => a + b.alpha, 0) / bands.length;
  const mid = { sabine: (bands[2].sabine + bands[3].sabine) / 2, eyring: (bands[2].eyring + bands[3].eyring) / 2, T: (bands[2].T + bands[3].T) / 2 };
  const dims = Math.cbrt(V);
  if (V < 30) notes.push({ key: 'ac.note.small', V: Math.round(V) });
  if (Number(room.aspect) > 3) notes.push({ key: 'ac.note.aspect', ratio: Math.round(room.aspect * 10) / 10 });
  if (bands.some((b) => b.alpha > 0.2)) notes.push({ key: 'ac.note.dead' });
  if (room.uneven) notes.push({ key: 'ac.note.uneven' });
  return { ok: true, volume: V, area: S, bands, mean, mid, meanFreePath: 4 * V / S, dims, notes };
}

/** Findings as shared Problems (rule 29): the mid-band reverberation time over the person's own target. */
export function rtProblems(rooms, { target = null, t = null } = {}) {
  if (!(target > 0)) return [];
  const out = [], say = (key, vars, en) => (t ? t(key, vars) : en);
  for (const r of rooms) {
    if (!r.res?.ok) continue;
    const T = Math.round(r.res.mid.T * 100) / 100;
    if (T > target + 1e-9) {
      const need = Math.round(Math.max(0, r.res.volume * C / target - (r.res.bands[2].A + r.res.bands[3].A) / 2));   // m² sabins more absorption for the target (Sabine)
      out.push({ code: 'acoustics.rt', severity: 'warning', msg: { key: 'ac.p.rt', vars: { room: r.name, t: T, target, a: need } },
        text: say('ac.p.rt', { room: r.name, t: T, target, a: need }, r.name + ': reverberation ' + T + ' s at mid frequencies, over your ' + target + ' s target. About ' + need + ' m² more absorption would bring it down.'),
        req: { op: '<=', value: target, unit: 's' }, found: { value: T, unit: 's' }, source: { kind: 'engine', name: 'bimcraft.acoustics' }, where: r.at ? { space: '2d', at: r.at } : undefined });
    }
  }
  return out;
}
