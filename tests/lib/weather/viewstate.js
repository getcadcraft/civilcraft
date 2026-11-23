/* SPDX-License-Identifier: Apache-2.0 */
/**
 * viewstate.js — what the year viewer remembers, and its colours (0.11 Track WX, WX.9). Host-free and DOM-free.
 *
 *   DEFAULTS                       the settings a fresh viewer starts with
 *   cleanSettings(raw)             → a whole settings object: every value checked and bounded, anything unknown dropped, nothing trusted
 *                                    (a settings file is somebody else's text)
 *   RAMPS                          { id: [[at 0…1, r, g, b]…] } colour scales; the stops need not be evenly spaced
 *   rampColor(id, t, { reverse, bands }) → [r, g, b] 0…255      bands = that many flat steps instead of a smooth run (0 = smooth)
 *   rampBytes(id, opts, n = 256)   → Uint8Array(n × 4) for a texture or an image
 *   EASE                           { id: f(t 0…1) → 0…1 } how one chart turns into the next
 *   VIEWS, PROJECTIONS, ANIMATE, PERIODS    the lists the settings may name
 *   shareCode({ station 'set/station', compare?, settings }) → text for a link · readShare(code) → the same, checked, or null
 */
import { METRICS } from './metrics.js';

export const VIEWS = ['surface', 'map', 'profiles', 'rose', 'hist', 'table', 'psychro', 'sunpath', 'compare', 'stations'];
export const PROJECTIONS = ['perspective', 'parallel', 'plan', 'year', 'day'];
export const ANIMATE = ['none', 'date', 'time', 'value'];
export const PERIODS = ['year', 'day', 'night', ...Array.from({ length: 12 }, (_, i) => 'm' + (i + 1))];

export const RAMPS = {
  spectrum: [[0, 38, 70, 190], [0.22, 40, 160, 220], [0.42, 60, 180, 90], [0.62, 240, 220, 60], [0.82, 240, 130, 40], [1, 200, 30, 40]],
  heat: [[0, 20, 10, 40], [0.3, 130, 20, 90], [0.6, 230, 80, 40], [0.85, 250, 190, 60], [1, 255, 250, 210]],
  coolwarm: [[0, 50, 80, 190], [0.5, 235, 235, 235], [1, 190, 40, 50]],
  viridis: [[0, 68, 1, 84], [0.25, 59, 82, 139], [0.5, 33, 145, 140], [0.75, 94, 201, 98], [1, 253, 231, 37]],
  blues: [[0, 240, 247, 255], [0.5, 110, 170, 215], [1, 10, 50, 120]],
  grey: [[0, 30, 30, 30], [1, 240, 240, 240]],
};
export function rampColor(id, t, { reverse = false, bands = 0 } = {}) {
  const stops = RAMPS[id] || RAMPS.spectrum;
  let x = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0));
  if (bands > 1) x = Math.min(bands - 1, Math.floor(x * bands)) / (bands - 1);
  if (reverse) x = 1 - x;
  let i = 0;
  while (i < stops.length - 2 && x > stops[i + 1][0]) i++;
  const a = stops[i], b = stops[i + 1], f = Math.min(1, Math.max(0, (x - a[0]) / (b[0] - a[0] || 1)));
  return [1, 2, 3].map((k) => Math.round(a[k] + (b[k] - a[k]) * f));
}
export function rampBytes(id, opts = {}, n = 256) {
  const out = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) { const c = rampColor(id, i / (n - 1), opts); out.set([c[0], c[1], c[2], 255], i * 4); }
  return out;
}

export const EASE = {
  none: () => 1,
  linear: (t) => t,
  sine: (t) => 0.5 - Math.cos(Math.PI * t) / 2,
  exponential: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2),
  cubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  quintic: (t) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2),
  stretchy: (t) => { const c = 1.70158 * 1.525; return t < 0.5 ? ((2 * t) ** 2 * ((c + 1) * 2 * t - c)) / 2 : ((2 * t - 2) ** 2 * ((c + 1) * (t * 2 - 2) + c) + 2) / 2; },
  elastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1),
};

export const DEFAULTS = Object.freeze({
  format: 'cadcraft-weather-view', version: 1,
  metric: 'db', view: 'surface', units: 'si', average: 0,
  scale: { auto: true, min: 0, max: 1 }, ramp: 'spectrum', reverse: false, bands: 0, iso: true, light: true, sun: true,
  section: { date: { on: true, day: 171 }, time: { on: true, hour: 12 }, value: { on: false, level: null } },
  block: false,
  camera: { proj: 'perspective', az: -58, el: 28, dist: 3.4, tx: 0, ty: 0 },
  size: { x: 2.4, y: 1.2, z: 0.7 },
  animate: { what: 'none', speed: 1, daytime: false },
  transition: { ease: 'cubic', secs: 0.8 },
  rose: { period: 'year' },
  comfort: { on: true, tmin: 20, tmax: 26, rhmin: 30, rhmax: 60 }, psy: 'hours',
});

const num = (x, lo, hi, d) => (typeof x === 'number' && Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : d);
const pick = (x, list, d) => (list.includes(x) ? x : d);
const bool = (x, d) => (typeof x === 'boolean' ? x : d);
const obj = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});

function comfortOf(c) {
  const D = DEFAULTS.comfort;
  let tmin = num(c.tmin, -40, 60, D.tmin), tmax = num(c.tmax, -40, 60, D.tmax), rhmin = num(c.rhmin, 0, 100, D.rhmin), rhmax = num(c.rhmax, 0, 100, D.rhmax);
  if (!(tmax > tmin)) { tmin = D.tmin; tmax = D.tmax; }
  if (!(rhmax > rhmin)) { rhmin = D.rhmin; rhmax = D.rhmax; }
  return { on: bool(c.on, true), tmin, tmax, rhmin, rhmax };
}

/** A view as a short code for a link (WX.10): the station, a second station to compare, and the settings. Somebody else's text on the way in. */
export function shareCode({ station, compare = null, settings }) {
  const text = JSON.stringify({ st: station, cmp: compare || undefined, s: cleanSettings(settings) });
  return btoa(unescape(encodeURIComponent(text))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
const STATION_RE = /^[a-z0-9][a-z0-9._-]{1,79}\/[a-z0-9][a-z0-9._-]{1,79}$/;
export function readShare(code) {
  if (typeof code !== 'string' || code.length > 6000 || !/^[A-Za-z0-9_-]+$/.test(code)) return null;
  try {
    const raw = JSON.parse(decodeURIComponent(escape(atob(code.replace(/-/g, '+').replace(/_/g, '/')))));
    if (!raw || typeof raw.st !== 'string' || !STATION_RE.test(raw.st)) return null;
    return { station: raw.st, compare: typeof raw.cmp === 'string' && STATION_RE.test(raw.cmp) ? raw.cmp : null, settings: cleanSettings(raw.s) };
  } catch { return null; }
}

export function cleanSettings(raw) {
  const r = obj(raw), D = DEFAULTS, sc = obj(r.scale), se = obj(r.section), ca = obj(r.camera), si = obj(r.size), an = obj(r.animate), tr = obj(r.transition);
  const sd = obj(se.date), st = obj(se.time), sv = obj(se.value);
  let min = num(sc.min, -1e9, 1e9, D.scale.min), max = num(sc.max, -1e9, 1e9, D.scale.max);
  if (!(max > min)) { min = D.scale.min; max = D.scale.max; }
  return {
    format: D.format, version: 1,
    metric: pick(r.metric, METRICS.map((m) => m.id), D.metric), view: pick(r.view, VIEWS, D.view), units: pick(r.units, ['si', 'us'], D.units),
    average: Math.round(num(r.average, 0, 60, D.average)),
    scale: { auto: bool(sc.auto, true), min, max }, ramp: pick(r.ramp, Object.keys(RAMPS), D.ramp), reverse: bool(r.reverse, false),
    bands: Math.round(num(r.bands, 0, 24, 0)), iso: bool(r.iso, true), light: bool(r.light, true), sun: bool(r.sun, true),
    section: {
      date: { on: bool(sd.on, true), day: num(sd.day, 0, 365, D.section.date.day) },
      time: { on: bool(st.on, true), hour: num(st.hour, 0, 24, D.section.time.hour) },
      value: { on: bool(sv.on, false), level: typeof sv.level === 'number' && Number.isFinite(sv.level) ? Math.min(1e9, Math.max(-1e9, sv.level)) : null },
    },
    block: bool(r.block, false),
    camera: { proj: pick(ca.proj, PROJECTIONS, D.camera.proj), az: num(ca.az, -3600, 3600, D.camera.az), el: num(ca.el, -90, 90, D.camera.el), dist: num(ca.dist, 0.5, 20, D.camera.dist), tx: num(ca.tx, -5, 5, 0), ty: num(ca.ty, -5, 5, 0) },
    size: { x: num(si.x, 0.5, 5, D.size.x), y: num(si.y, 0.3, 5, D.size.y), z: num(si.z, 0.1, 3, D.size.z) },
    animate: { what: pick(an.what, ANIMATE, 'none'), speed: num(an.speed, 0.1, 10, 1), daytime: bool(an.daytime, false) },
    transition: { ease: pick(tr.ease, Object.keys(EASE), D.transition.ease), secs: num(tr.secs, 0, 5, D.transition.secs) },
    rose: { period: pick(obj(r.rose).period, PERIODS, 'year') },
    comfort: comfortOf(obj(r.comfort)), psy: pick(r.psy, ['hours', 'metric'], 'hours'),
  };
}
