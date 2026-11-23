/* SPDX-License-Identifier: Apache-2.0 */
/**
 * night.js — the lighting design as lights in a render scene (0.10 SU.1816, session `night-light-10`). DOM-free, no imports from an app.
 *
 * Every luminaire of a design becomes one lamp the path tracer understands (`scene.lights` of RENDER-SPEC § 5.2: kind 'point', position, aim, lumens, colour),
 * with its measured intensity web as an IES (LM-63) text the tracer's own reader takes (`settings.ies[name]`). The files we read are IES and EULUMDAT
 * (photometry.js); the web goes to the tracer as IES text either way, so an .ldt reaches it without the tracer knowing the format.
 *
 *   kelvinToHex(K)                     the colour of white light at K kelvin as '#rrggbb' (brightest channel 255)
 *   webFlux(photo)                     lumens in the web itself (∫ I dω over the whole sphere)
 *   iesText(photo, { rotation, name }) → IES LM-63-2002 text of the web, its horizontal planes turned by `rotation` degrees
 *   renderLamps(luminaires, opts)      → { lamps, ies, notes } for the renderer (metres; scene axes 'z' or 'y' up)
 *   exposureFor(lux, rho)              stops that put a surface of reflectance rho lit by `lux` at mid grey in the render
 *   nightPreset({ lat, lux })          → render settings of a night picture lit by the lamps only
 *   luxFromRadiance(Y, rho)            the illuminance a Lambertian surface of reflectance rho must have to show luminance Y in the render
 *
 * What the numbers mean. The renderer's scene scale is LIGHT_SCALE = 0.02 (looks.js; the app's sun is 3.2 there, about 100 klx): a lamp of Φ lumens has the
 * intensity Φ/4π · 0.02 · (web / its sphere average). So a surface of reflectance ρ lit by E lux shows radiance ρ · E · 0.02 / π, and `luxFromRadiance` turns
 * that back into lux. The web is carried as a 64 × 32 grid (pt-spec IES_THETA × IES_PHI), bilinear: a beam narrower than about 3 degrees is smoothed.
 * Sources of the maths: Kim et al. 2002 (the Planckian locus fit, as pt-camera.js uses it), IESNA LM-63-2002 (the file layout), CIE 15 (XYZ to sRGB is the
 * IEC 61966-2-1 matrix).
 */
import { candela, frame } from './photometry.js';

export const SCENE_LIGHT_SCALE = 0.02;   // = pt-spec.js LIGHT_SCALE = looks.js LIGHT_SCALE (a test keeps the three equal)
export const MAX_WEBS = 32;              // looks.js IES_MAX_LAMPS: the renderer takes this many profiles
const rad = (d) => (d * Math.PI) / 180;
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

// ------------------------------------------------------------------------------------------------------------- colour
function cctToXy(T) {   // Kim et al. 2002 below 4000 K, the CIE daylight locus above: the same fit as render/pt-camera.js
  T = Math.min(25000, Math.max(1667, T));
  let x, y;
  if (T < 4000) {
    x = -0.2661239e9 / T ** 3 - 0.2343589e6 / T ** 2 + 0.8776956e3 / T + 0.17991;
    y = T < 2222 ? -1.1063814 * x ** 3 - 1.3481102 * x ** 2 + 2.18555832 * x - 0.20219683 : -0.9549476 * x ** 3 - 1.37418593 * x ** 2 + 2.09137015 * x - 0.16748867;
  } else {
    x = T <= 7000 ? -4.607e9 / T ** 3 + 2.9678e6 / T ** 2 + 0.09911e3 / T + 0.244063 : -2.0064e9 / T ** 3 + 1.9018e6 / T ** 2 + 0.24748e3 / T + 0.23704;
    y = -3 * x * x + 2.87 * x - 0.275;
  }
  return [x, y];
}
const enc = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
export function kelvinToHex(K) {
  const k = Number(K);
  if (!Number.isFinite(k) || k <= 0) return '#ffffff';
  const [x, y] = cctToXy(k), X = x / y, Z = (1 - x - y) / y;
  let rgb = [3.2406 * X - 1.5372 - 0.4986 * Z, -0.9689 * X + 1.8758 + 0.0415 * Z, 0.0557 * X - 0.204 + 1.057 * Z].map((v) => Math.max(0, v));
  const m = Math.max(...rgb) || 1;
  rgb = rgb.map((v) => Math.round(255 * enc(v / m)));
  return '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
}

// ------------------------------------------------------------------------------------------------------------- the web
const FLUX = new WeakMap();
export function webFlux(photo) {
  if (FLUX.has(photo)) return FLUX.get(photo);
  const NT = 180, NP = 72;
  let f = 0;
  for (let a = 0; a < NT; a++) {
    const g = (a + 0.5) * (180 / NT), dw = Math.sin(rad(g)) * (Math.PI / NT) * ((2 * Math.PI) / NP);
    for (let b = 0; b < NP; b++) f += candela(photo, g, (b + 0.5) * (360 / NP)) * dw;
  }
  FLUX.set(photo, f);
  return f;
}
/** The same candela in every horizontal plane (rotationally symmetric): one plane is enough. */
export function isAxial(photo) {
  const rows = photo.cd || [];
  if (rows.length <= 1) return true;
  const a = rows[0];
  return rows.every((r) => r.length === a.length && r.every((v, i) => Math.abs(v - a[i]) <= 1e-9 * (1 + Math.abs(a[i]))));
}
const f3 = (x) => (Math.round(x * 1000) / 1000).toString();
export function iesText(photo, { rotation = 0, name = '' } = {}) {
  const V = photo.vAngles.map(Number), axial = isAxial(photo), step = 5;
  const H = axial ? [0] : Array.from({ length: 360 / step + 1 }, (_, i) => i * step);
  const lines = ['IESNA:LM-63-2002', '[TEST] generated from a CadCraft luminaire web', '[MANUFAC] ' + String(photo.keywords?.MANUFAC || '').slice(0, 80), '[LUMCAT] ' + String(name || photo.name || '').replace(/[\r\n\[\]]/g, ' ').slice(0, 80), 'TILT=NONE'];
  const mm = (v) => f3((v || 0) / 1000);
  lines.push(['1', f3(photo.lumens > 0 ? photo.lumens : webFlux(photo)), '1', V.length, H.length, '1', '2', mm(photo.width), mm(photo.length), mm(photo.height)].join(' '));
  lines.push(['1', '1', f3(photo.watts || 0)].join(' '));
  lines.push(V.map(f3).join(' '));
  lines.push(H.map(f3).join(' '));
  for (const h of H) lines.push(V.map((g) => f3(candela(photo, g, h - rotation))).join(' '));
  return lines.join('\n') + '\n';
}

// ------------------------------------------------------------------------------------------------------------- axes
/** Design space is millimetres, z up. The renderer's scene is metres: 'z' keeps the axes (ModelCraft), 'y' is BimCraft's (x, z, -y). */
export function axesOf(axes = 'z') {
  return axes === 'y'
    ? { id: 'y', up: [0, 1, 0], pt: (p) => [p[0] / 1000, p[2] / 1000, -p[1] / 1000], dir: (d) => [d[0], d[2], -d[1]], inv: (p) => [p[0] * 1000, -p[2] * 1000, p[1] * 1000], upIndex: 1 }
    : { id: 'z', up: [0, 0, 1], pt: (p) => [p[0] / 1000, p[1] / 1000, p[2] / 1000], dir: (d) => [d[0], d[1], d[2]], inv: (p) => [p[0] * 1000, p[1] * 1000, p[2] * 1000], upIndex: 2 };
}
/** The renderer's own tangent frame about a unit axis (render/pt-ref.js basisInto, the same in every kernel): t, b with b = axis × t. */
export function rendererFrame(u) {
  const a = Math.abs(u[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0], t = unit(cross(u, a));
  return { t, b: cross(u, t) };
}

// ------------------------------------------------------------------------------------------------------------- lamps
/**
 * luminaires: [{ photo, p [x, y, z] mm, aim?, rot?, scale?, cct? }] (the design's own list). opts: { axes 'z' | 'y', llf (0.8), maintained (false: initial lumens, the
 * photometry's own; true: times llf, what the lux in the report are), cct (3000 K; null = white) }.
 * → { lamps: [{ key, name, kind: 'point', p, dir, color, lumens, size, on }], ies: { name: { file, text } }, notes: ['webs.cap'] }
 * A web that is not axial is written with its planes turned so that the tracer's C0 direction is the luminaire's (the tracer measures its angle from its own tangent).
 */
export function renderLamps(luminaires, opts = {}) {
  const A = axesOf(opts.axes), llf = Number.isFinite(opts.llf) ? opts.llf : 0.8, lamps = [], ies = {}, byKey = new Map(), used = new Set(), notes = [];
  const cctOf = (L) => (L.cct === null || (L.cct === undefined && opts.cct === null) ? null : Number(L.cct ?? opts.cct ?? 3000));
  luminaires.forEach((L, i) => {
    const photo = L.photo, f = frame(L.aim, L.rot), n = unit(A.dir(f.n)), r = A.dir(f.r), axial = isAxial(photo);
    const { t, b } = rendererFrame(n), delta = axial ? 0 : (Math.atan2(dot(r, b), dot(r, t)) * 180) / Math.PI;
    const key = (photo.name || 'luminaire') + '|' + (photo.lumens || 0) + '|' + (axial ? '' : delta.toFixed(1));
    let name = byKey.get(key);
    if (name === undefined) {
      if (byKey.size >= MAX_WEBS) { name = ''; if (!notes.includes('webs.cap')) notes.push('webs.cap'); }
      else {
        let base = 'LD ' + String(photo.name || 'luminaire').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 60) + (axial ? '' : ' ' + Math.round(delta) + 'deg'), nm = base, k = 2;
        while (used.has(nm)) nm = base + ' #' + k++;
        name = nm; used.add(nm);
        ies[name] = { file: name.replace(/[^A-Za-z0-9._-]+/g, '_') + '.ies', text: iesText(photo, { rotation: delta, name }) };
      }
      byKey.set(key, name);
    }
    const w = Math.sqrt(Math.max(0, photo.width || 0) * Math.max(0, photo.length || 0)) / 1000, size = Math.min(0.12, Math.max(0.03, w || 0.06)), K = cctOf(L);
    lamps.push({
      key: i, name: name || 'LD luminaire ' + (i + 1), kind: 'point', p: A.pt(L.p), dir: n, color: K === null ? '#ffffff' : kelvinToHex(K),
      lumens: webFlux(photo) * (L.scale ?? 1) * (opts.maintained ? llf : 1), size: [size, size], angle: 170, on: true,
    });
  });
  return { lamps, ies, notes };
}

// ------------------------------------------------------------------------------------------------------------- exposure and preset
export const luxFromRadiance = (Y, rho) => (rho > 0 ? (Math.PI * Y) / (rho * SCENE_LIGHT_SCALE) : 0);
/** Stops that bring a surface of reflectance `rho` lit by `lux` to 0.18, mid grey before the view transform, within the dialog's range of -3 … 3. */
export function exposureFor(lux, rho = 0.25) {
  if (!(lux > 0) || !(rho > 0)) return 1;
  const Y = (rho * lux * SCENE_LIGHT_SCALE) / Math.PI;
  return Math.round(Math.min(3, Math.max(-3, Math.log2(0.18 / Y))) * 10) / 10;
}
/** The sun is down (midnight on the winter solstice of the hemisphere, as looks.js nightSun), the sky is the dark night sky, and the exposure is set for the lamps. */
export function nightPreset({ lat = 0, lux = 0, rho = 0.25, base = {} } = {}) {
  return { ...base, sky: 'clear', sun: { month: Number(lat) < 0 ? 6 : 12, day: 21, hour: 0 }, exposure: lux > 0 ? exposureFor(lux, rho) : 1, ground: true, edges: false, mode: 'hq', exposureMode: 'slider' };
}
