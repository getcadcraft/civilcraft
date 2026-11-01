/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and keys; the host's panels pass t() and show the language files' words. */
/**
 * metrics.js — the room acoustic measures of ISO 3382-1 from any impulse response, computed or measured (0.8 XE.3 phase S1,
 * session dec-ind_PART_3; owner 2026-10-29: Europe first, ISO standards). DOM-free; lib/acoustics is canonical (tools/acoustics/sync.mjs).
 * Written from the definitions of ISO 3382-1 (Annex A) and Schroeder's backward integration, from the formulas not from any program.
 *
 *   parseWav(bytes) → { sr, x: Float32Array, channels }       PCM 8/16/24/32-bit or float32 WAV; the first channel
 *   roomMetrics(ir, sr, band|null, { noise }) → { edt, t20, t30, c50, c80, d50, ts, t0 }   band = index into BANDS (octave), null = broadband
 *   allBands(ir, sr, opts) → { bands: [{ f, ...metrics }], broadband }
 *   compare(predicted, measured) → [{ f, key, predicted, measured, diff, jnd, within }]   per band and measure, against the just-noticeable difference
 *   JND = { edt 5 %, t20 5 %, t30 5 %, c50 1 dB, c80 1 dB, d50 0.05, ts 10 ms }  (ISO 3382-1 Annex A table A.1)
 *
 * Decay times: a least-squares line through the Schroeder curve from 0 to −10 dB (EDT, × 6), −5 to −25 dB (T20, × 3), −5 to −35 dB (T30, × 2).
 * Clarity C50 / C80 = 10 lg (energy before 50 / 80 ms ÷ energy after), definition D50 = energy before 50 ms ÷ all, centre time Ts = Σ t p² ÷ Σ p²,
 * all counted from the direct sound t0 (the first sample within 20 dB below the peak … of the band's envelope, a documented choice).
 * noise: 'none' (a computed response, default) or 'auto' (a measured one): the energy floor is the mean p² of the last 10 % of the response,
 * subtracted, and the integral stops where a 10 ms moving average meets twice the floor. STI is not built (it needs the 8 kHz band).
 */
import { BANDS } from './acoustics.js';
import { bandFilter } from './acoustics-ir.js';

export const JND = { edt: { rel: 0.05 }, t20: { rel: 0.05 }, t30: { rel: 0.05 }, c50: { abs: 1 }, c80: { abs: 1 }, d50: { abs: 0.05 }, ts: { abs: 0.010 } };

export function parseWav(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const tag = (o) => String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3]);
  if (b.length < 44 || tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new Error('not a WAV file');
  let fmt = null, data = null;
  for (let o = 12; o + 8 <= b.length;) {
    const id = tag(o), size = dv.getUint32(o + 4, true), body = o + 8;
    if (id === 'fmt ') fmt = { code: dv.getUint16(body, true) === 0xFFFE && size >= 40 ? dv.getUint16(body + 24, true) : dv.getUint16(body, true), channels: dv.getUint16(body + 2, true), sr: dv.getUint32(body + 4, true), bits: dv.getUint16(body + 14, true) };
    else if (id === 'data') { data = { at: body, size: Math.min(size, b.length - body) }; break; }
    o = body + size + (size & 1);
  }
  if (!fmt || !data) throw new Error('the WAV file has no format or data');
  const bytesPer = fmt.bits / 8, frame = bytesPer * fmt.channels, n = Math.floor(data.size / frame);
  if (![8, 16, 24, 32].includes(fmt.bits) || !fmt.channels || !fmt.sr || n < 2) throw new Error('this WAV layout is not supported');
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const o = data.at + i * frame;
    if (fmt.code === 3 && fmt.bits === 32) x[i] = dv.getFloat32(o, true);
    else if (fmt.bits === 8) x[i] = (b[o] - 128) / 128;
    else if (fmt.bits === 16) x[i] = dv.getInt16(o, true) / 32768;
    else if (fmt.bits === 24) x[i] = (((b[o + 2] << 24) | (b[o + 1] << 16) | (b[o] << 8)) >> 8) / 8388608;
    else x[i] = dv.getInt32(o, true) / 2147483648;
  }
  return { sr: fmt.sr, x, channels: fmt.channels };
}

function fitTime(db, sr, from, to, scale) {
  let sx = 0, sy = 0, sxx = 0, sxy = 0, m = 0;
  for (let i = 0; i < db.length; i++) {
    const d = db[i];
    if (d > from || d < to) continue;
    const t = i / sr; sx += t; sy += d; sxx += t * t; sxy += t * d; m++;
  }
  if (m < 8) return null;
  const slope = (m * sxy - sx * sy) / (m * sxx - sx * sx);
  return slope < 0 ? scale / -slope : null;
}

export function roomMetrics(ir, sr, band = null, { noise = 'none' } = {}) {
  const x = band === null ? Float64Array.from(ir) : bandFilter(ir, sr, band, true), n = x.length;
  const e = new Float64Array(n);
  let peak = 0, at = 0;
  for (let i = 0; i < n; i++) { e[i] = x[i] * x[i]; if (e[i] > peak) { peak = e[i]; at = i; } }
  if (!(peak > 0)) return null;
  let t0 = 0;
  while (t0 < at && e[t0] < peak * 0.01) t0++;              // within 20 dB of the peak
  let end = n, floor = 0;
  if (noise === 'auto') {
    const k = Math.max(8, Math.floor(n * 0.1));
    for (let i = n - k; i < n; i++) floor += e[i];
    floor /= k;
    const w = Math.max(8, Math.round(0.01 * sr));
    let acc = 0;
    for (let i = at; i < n; i++) { acc += e[i]; if (i - w >= at) acc -= e[i - w]; if (i - at >= w && acc / w <= 2 * floor) { end = i - w; break; } }
    end = Math.max(end, at + w);
  }
  const p = new Float64Array(end - t0);
  for (let i = t0; i < end; i++) p[i - t0] = Math.max(0, e[i] - floor);
  const m = p.length, cum = new Float64Array(m);
  let s = 0;
  for (let i = m - 1; i >= 0; i--) { s += p[i]; cum[i] = s; }
  if (!(cum[0] > 0)) return null;
  const db = new Float64Array(m);
  for (let i = 0; i < m; i++) db[i] = 10 * Math.log10(cum[i] / cum[0] + 1e-30);
  const upTo = (ms) => Math.min(m, Math.round((ms / 1000) * sr));
  const early = (ms) => { let a = 0; const k = upTo(ms); for (let i = 0; i < k; i++) a += p[i]; return a; };
  const tot = cum[0], c = (ms) => { const a = early(ms), l = tot - a; return l > 0 ? 10 * Math.log10(a / l) : null; };
  let st = 0;
  for (let i = 0; i < m; i++) st += (i / sr) * p[i];
  return { edt: fitTime(db, sr, 0, -10, 60), t20: fitTime(db, sr, -5, -25, 60), t30: fitTime(db, sr, -5, -35, 60), c50: c(50), c80: c(80), d50: early(50) / tot, ts: st / tot, t0: t0 / sr };
}

export function allBands(ir, sr, opts = {}) {
  return { bands: BANDS.map((f, i) => ({ f, ...roomMetrics(ir, sr, i, opts) })), broadband: roomMetrics(ir, sr, null, opts) };
}

/** Predicted against measured, per octave band and measure; `within` = the difference is under one just-noticeable difference. */
export function compare(pred, meas) {
  const out = [];
  for (let i = 0; i < pred.bands.length; i++) for (const key of Object.keys(JND)) {
    const a = pred.bands[i]?.[key], b = meas.bands[i]?.[key];
    if (a == null || b == null) continue;
    const j = JND[key], jnd = j.rel ? j.rel * b : j.abs, diff = a - b;
    out.push({ f: pred.bands[i].f, key, predicted: a, measured: b, diff, jnd, within: Math.abs(diff) <= jnd });
  }
  return out;
}
