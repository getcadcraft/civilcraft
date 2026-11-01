/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — English fallbacks for the assistant's results and file text; the panels pass t() and show the language files' words. */
/**
 * acoustics-ir.js — a computed room impulse response, and listening through it (0.8 EG.49, session bim-sim_PART_2; moved to lib/acoustics by xe-sound_PART_3, XE.3 — canonical here, hosts get copies from tools/acoustics/sync.mjs). No DOM, no Web Audio:
 * tools/bimcraft-test/acoustics-test.mjs runs it in Node; acoustics-ui.js plays what it makes.
 *
 * The impulse response is the statistical kind: the direct sound, the six first reflections of a box of the room's size, and a diffuse tail
 * of noise whose level falls at the room's own reverberation time in each octave band (acoustics.js), starting after the room's mean free
 * path, at the level a diffuse field has at the listener's distance (direct and reverberant energy are equal at the critical distance
 * r = √(R / 16π), R = Sᾱ/(1 − ᾱ)). It sounds like the room's size and finishes, not like any exact measured room.
 *
 *   synthIR(res, { sr, distance, seed, box, source?, listener? }) → { ir: Float32Array, sr, rt: [per band] }       res = acoustics.js reverb() result
 *   measureRT(ir, sr, band, { from, to }) → seconds | null     Schroeder backward integration of the band-filtered response, a line fit from −5 dB to −35 dB, × 60 / range
 *   drySample(kind, sr) → Float32Array         'clap' · 'speech' (vowel-like syllables) · 'music' (a plucked arpeggio): made here, nothing recorded
 *   convolve(x, h) → Float32Array              FFT convolution
 *   listen(dry, ir, { tail }) → Float32Array   the dry sound heard in the room, level matched to the dry one so they can be compared
 *   wavBytes(samples, sr) → Uint8Array         16-bit mono PCM WAV
 */
import { BANDS } from './acoustics.js';

const SOUND = 343;
function mulberry(seed) {
  let a = (seed >>> 0) || 1;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const gauss = (rnd) => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
const pow2 = (n) => { let p = 1; while (p < n) p <<= 1; return p; };

/** In-place radix-2 FFT (inverse = true gives the unscaled inverse). */
export function fft(re, im, inverse = false) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (2 * Math.PI / len) * (inverse ? 1 : -1), wr = Math.cos(ang), wi = Math.sin(ang), half = len >> 1;
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < half; k++) {
        const a = i + k, b = a + half, tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
}

/** Weight of octave band i at frequency f: cos over one octave either side, so the squares of neighbours add to one (the bands share energy, none is lost). */
function bandWeight(f, i) {
  if (f <= 0) return 0;
  const p = Math.log2(f / BANDS[i]);
  if (i === 0 && p < 0) return 1;
  if (i === BANDS.length - 1 && p > 0) return 1;
  return Math.abs(p) >= 1 ? 0 : Math.cos(Math.PI / 2 * Math.abs(p));
}
/** A zero-phase band-pass by FFT. `pad` doubles the buffer so the filter's ringing before time zero is cut off, not wrapped to the end of the response. */
export function bandFilter(x, sr, i, pad = false) {
  const n = pow2(pad ? x.length * 2 : x.length), re = new Float64Array(n), im = new Float64Array(n);
  re.set(x);
  fft(re, im);
  for (let k = 0; k <= n / 2; k++) {
    const w = bandWeight((k * sr) / n, i);
    re[k] *= w; im[k] *= w;
    if (k > 0 && k < n / 2) { re[n - k] *= w; im[n - k] *= w; }
  }
  fft(re, im, true);
  const out = new Float64Array(x.length);
  for (let k = 0; k < x.length; k++) out[k] = re[k] / n;
  return out;
}

export function synthIR(res, { sr = 44100, distance = 3, seed = 1, box = null, source = null, listener = null } = {}) {
  if (!res?.ok) throw new Error('synthIR needs a reverberation result');
  const rt = res.bands.map((b) => b.T), maxT = Math.max(...rt);
  const dur = Math.min(8, Math.max(0.5, maxT * 1.15 + 0.1)), N = pow2(Math.ceil(sr * dur));
  const rnd = mulberry(seed), noise = new Float64Array(N);
  for (let i = 0; i < N; i++) noise[i] = gauss(rnd);
  const tail = new Float64Array(N);
  for (let b = 0; b < BANDS.length; b++) {
    const x = bandFilter(noise, sr, b), k = 6.907755 / rt[b];   // amplitude falls 60 dB in rt[b]: exp(−k t) with k = 3 ln 10 / T
    for (let n = 0; n < N; n++) tail[n] += x[n] * Math.exp(-k * (n / sr));
  }
  const onset = Math.max(0.002, 2 * res.meanFreePath / SOUND);   // the field builds up over about two mean free paths
  for (let n = 0; n < N; n++) { const u = Math.min(1, n / sr / onset); tail[n] *= u * u; }
  const aMid = Math.min(0.95, Math.max(0.02, (res.bands[2].alpha + res.bands[3].alpha) / 2)), R = res.area * aMid / (1 - aMid);
  const ir = new Float64Array(N);
  ir[0] = 1;
  // six first reflections of a box (a room of this volume and floor area when no box is given), source and listener `distance` apart
  const V = res.volume, H = box?.h || Math.min(4, Math.cbrt(V)), base = V / H, lx = box?.lx || Math.sqrt(base * 1.4), ly = box?.ly || base / lx;
  // 0.8 EG.49 (bim-sim_PART_3): a source and a listener the person placed (metres from the room's low corner, inside the box) replace the default pair
  const inBox = (p) => (p ? [Math.min(lx - 0.05, Math.max(0.05, p[0])), Math.min(ly - 0.05, Math.max(0.05, p[1])), Math.min(H - 0.05, Math.max(0.05, p[2] ?? 1.2))] : null);
  let src = inBox(source) || [0.3 * lx, 0.45 * ly, Math.min(1.5, H * 0.5)], lis = inBox(listener);
  if (!lis) {
    lis = [src[0] + distance, src[1], src[2]];
    if (lis[0] > lx - 0.1) lis = [Math.max(0.1, src[0] - distance), src[1], src[2]];
  }
  const g = Math.sqrt(1 - aMid), d0 = Math.max(0.3, Math.hypot(lis[0] - src[0], lis[1] - src[1], lis[2] - src[2]) || distance);
  let want = 16 * Math.PI * d0 * d0 / R;   // tail energy with the direct sound's energy as 1
  let er = 0;
  const images = [[-src[0], src[1], src[2]], [2 * lx - src[0], src[1], src[2]], [src[0], -src[1], src[2]], [src[0], 2 * ly - src[1], src[2]], [src[0], src[1], -src[2]], [src[0], src[1], 2 * H - src[2]]];
  for (const im of images) {
    const d = Math.hypot(lis[0] - im[0], lis[1] - im[1], lis[2] - im[2]), idx = Math.round(((d - d0) / SOUND) * sr);
    if (idx > 0 && idx < N) { const a = g * d0 / d; ir[idx] += a; er += a * a; }
  }
  want = Math.max(want - er, want * 0.2);
  let e = 0;
  for (let n = 0; n < N; n++) e += tail[n] * tail[n];
  const scale = e > 0 ? Math.sqrt(want / e) : 0;
  for (let n = 0; n < N; n++) ir[n] += tail[n] * scale;
  const out = new Float32Array(N);
  for (let n = 0; n < N; n++) out[n] = ir[n];
  return { ir: out, sr, rt, distance: d0, source: src, listener: lis, criticalDistance: Math.sqrt(R / (16 * Math.PI)) };
}

/** The reverberation time of a response in one octave band by Schroeder's backward integration (T30: a fit from −5 to −35 dB, scaled to 60 dB). */
export function measureRT(ir, sr, band, { from = -5, to = -35 } = {}) {
  const x = bandFilter(ir, sr, band, true), n = x.length, cum = new Float64Array(n);
  let s = 0;
  for (let i = n - 1; i >= 0; i--) { s += x[i] * x[i]; cum[i] = s; }
  if (!(cum[0] > 0)) return null;
  let sx = 0, sy = 0, sxx = 0, sxy = 0, m = 0;
  for (let i = 0; i < n; i++) {
    const db = 10 * Math.log10(cum[i] / cum[0] + 1e-30);
    if (db > from || db < to) continue;
    const t = i / sr;
    sx += t; sy += db; sxx += t * t; sxy += t * db; m++;
  }
  if (m < 20) return null;
  const slope = (m * sxy - sx * sy) / (m * sxx - sx * sx);
  return slope < 0 ? 60 / -slope : null;
}

// ---------------------------------------------------------------------------------------------------------------- dry sounds
export function drySample(kind, sr = 44100) {
  const rnd = mulberry(7);
  if (kind === 'clap') {
    const x = new Float32Array(Math.round(sr * 0.25));
    for (let i = 0; i < x.length; i++) x[i] = gauss(rnd) * Math.exp(-(i / sr) / 0.006);
    return normal(x, 0.9);
  }
  if (kind === 'music') {
    const notes = [261.63, 329.63, 392, 523.25, 392, 329.63, 261.63, 196], step = 0.42, x = new Float32Array(Math.round(sr * (step * notes.length + 0.6)));
    notes.forEach((f, k) => {
      const t0 = Math.round(k * step * sr);
      for (let i = 0; t0 + i < x.length && i < sr * 0.9; i++) {
        const t = i / sr, env = Math.exp(-t / 0.28) * Math.min(1, t / 0.004);
        x[t0 + i] += 0.28 * env * (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * 2 * f * t) + 0.25 * Math.sin(2 * Math.PI * 3 * f * t));
      }
    });
    return normal(x, 0.8);
  }
  // 'speech': vowel-like syllables (a voice's pulse train through three resonances), each begun by a short burst
  const vowels = [[800, 1200, 2500], [300, 2300, 3000], [500, 1800, 2500], [300, 870, 2250], [500, 1000, 2500], [800, 1200, 2500]];
  const syl = 0.26, x = new Float32Array(Math.round(sr * (syl * vowels.length * 1.35 + 0.3)));
  vowels.forEach((form, k) => {
    const t0 = Math.round(k * syl * 1.35 * sr), len = Math.round(syl * sr), y = new Float32Array(len);
    let phase = 0;
    const f0 = 118 + 14 * Math.sin(k * 1.7);
    const src = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      phase += (f0 * (1 + 0.04 * Math.sin(i / sr * 5))) / sr;
      if (phase >= 1) { phase -= 1; src[i] = 1; }
      if (i < sr * 0.018) src[i] += 0.5 * gauss(rnd);
    }
    for (const fc of form) {
      const bw = 90 + fc * 0.06, r = Math.exp(-Math.PI * bw / sr), a1 = 2 * r * Math.cos((2 * Math.PI * fc) / sr), a2 = -r * r, b0 = 1 - r;
      let y1 = 0, y2 = 0;
      for (let i = 0; i < len; i++) { const v = b0 * src[i] + a1 * y1 + a2 * y2; y[i] += v; y2 = y1; y1 = v; }
    }
    for (let i = 0; i < len; i++) { const u = i / len, env = Math.sin(Math.PI * Math.min(1, u * 1.2)) ** 0.6; if (t0 + i < x.length) x[t0 + i] += y[i] * env * 1.6; }
  });
  return normal(x, 0.7);
}
function normal(x, peak) {
  let m = 0;
  for (const v of x) m = Math.max(m, Math.abs(v));
  if (m > 0) for (let i = 0; i < x.length; i++) x[i] *= peak / m;
  return x;
}

export function convolve(x, h) {
  const n = pow2(x.length + h.length - 1), ar = new Float64Array(n), ai = new Float64Array(n), br = new Float64Array(n), bi = new Float64Array(n);
  ar.set(x); br.set(h);
  fft(ar, ai); fft(br, bi);
  for (let i = 0; i < n; i++) { const r = ar[i] * br[i] - ai[i] * bi[i]; ai[i] = ar[i] * bi[i] + ai[i] * br[i]; ar[i] = r; }
  fft(ar, ai, true);
  const out = new Float32Array(x.length + h.length - 1);
  for (let i = 0; i < out.length; i++) out[i] = ar[i] / n;
  return out;
}

const rms = (x) => { let s = 0; for (const v of x) s += v * v; return Math.sqrt(s / Math.max(1, x.length)); };
/** The dry sound in the room, its loudness matched to the dry sound's (over the dry sound's own length) so a switch between them changes the room, not the volume. */
export function listen(dry, ir, { tail = 0.5 } = {}) {
  const y = convolve(dry, ir), keep = Math.min(y.length, dry.length + Math.round(tail * 44100 * 4));
  const out = y.slice(0, keep), a = rms(dry), b = rms(out.subarray(0, dry.length));
  const k = b > 0 ? a / b : 1;
  for (let i = 0; i < out.length; i++) out[i] *= k;
  return out;
}

export function wavBytes(x, sr = 44100) {
  const n = x.length, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, n * 2, true);
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(x[i]));
  const k = peak > 1 ? 1 / peak : 1;   // never clip: scale down when the response is hot
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, x[i] * k)) * 32767), true);
  return new Uint8Array(buf);
}
