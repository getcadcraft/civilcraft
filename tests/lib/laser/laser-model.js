/* SPDX-License-Identifier: Apache-2.0 */
/**
 * laser-model.js — the settings of a laser job (0.7 SU.772, session `make-07`): which drawing layer is cut, scored, engraved as
 * lines, filled or engraved as a picture, with what power, speed and passes, and the machine it is for. DOM-free, import-free.
 * Plain data, saved with the project file; `cleanJob` is what every untrusted copy (a file, the clipboard) goes through.
 *
 *   job = { format: 'cadcraft-laser', version: 1, machine, layers: [layer], origin }
 *   machine = { sMax (the controller's maximum S value, GRBL $30; 1000 default), rapid (mm/min), bedW, bedH (mm, 0 = unknown),
 *               dynamic (M4: power follows speed through corners; false = M3 constant power), air (M8 … M9 around the job),
 *               setLaserMode (send $32=1 first), framePower (percent for "frame the job"; 0 = laser off while the head traces
 *               the box), tol (arc sag in mm) }
 *   layer = { name, mode, power (0–100 %), speed (mm/min), passes (1–50), + for fill and image: interval (mm between lines),
 *             angle (deg), bidirectional, overscan (mm), crosshatch (fill), and for image: dither, threshold, gamma, invert,
 *             levels, minPower (%, the power of the lightest burnt level), skipGap (mm of blank crossed by a fast move) }
 *   origin: 'job' (the job's lower left corner is X0 Y0, the usual "start from here") | 'drawing' (the drawing's own coordinates)
 *
 * The starting values below are placeholders to be tested on scrap, never recommendations for a material: the app ships no
 * material table (what a laser does to a material depends on its power, optics, focus, air and the material itself).
 *
 *   MODES, ORDER, DEFAULTS, defaultMachine(), newLayer(name, mode), cleanJob(untrusted) → job, jobFor(job, layerNames) → job
 *   sValue(machine, percent) → the integer S for a power in percent
 */
export const FORMAT = 'cadcraft-laser';
export const VERSION = 1;
export const MODES = ['off', 'cut', 'score', 'engrave', 'fill', 'image'];
/** What goes first when nothing else says: engraving before scoring before cutting, so a cut-out part does not move. */
export const ORDER = { image: 1, fill: 2, engrave: 3, score: 4, cut: 5, off: 99 };
export const DITHER_NAMES = ['threshold', 'floyd', 'atkinson', 'bayer', 'gray'];

export const DEFAULTS = Object.freeze({
  cut: { power: 100, speed: 300, passes: 1 },
  score: { power: 20, speed: 1500, passes: 1 },
  engrave: { power: 30, speed: 3000, passes: 1 },
  fill: { power: 25, speed: 4000, passes: 1, interval: 0.1, angle: 0, bidirectional: true, overscan: 2, crosshatch: false },
  image: { power: 60, speed: 4000, passes: 1, interval: 0.1, angle: 0, bidirectional: true, overscan: 2, dither: 'floyd', threshold: 128, gamma: 1, invert: false, levels: 16, minPower: 0, skipGap: 2 },
  off: { power: 0, speed: 1000, passes: 1 },
});

export const defaultMachine = () => ({ sMax: 1000, rapid: 6000, bedW: 0, bedH: 0, dynamic: true, air: false, setLaserMode: true, framePower: 0, tol: 0.01 });

export function newLayer(name, mode = 'off') {
  const m = MODES.includes(mode) ? mode : 'off';
  return { name: String(name), mode: m, ...DEFAULTS[m] };
}

const fin = (v, lo, hi, d) => { const n = Number(v); return typeof v !== 'boolean' && v !== null && v !== '' && Number.isFinite(n) && n >= lo && n <= hi ? n : d; };
const txt = (s, max = 80) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);

export function cleanJob(obj) {
  const o = obj && typeof obj === 'object' ? obj : {};
  const dm = defaultMachine(), m = o.machine && typeof o.machine === 'object' ? o.machine : {};
  const machine = {
    sMax: Math.round(fin(m.sMax, 1, 100000, dm.sMax)), rapid: fin(m.rapid, 100, 100000, dm.rapid), bedW: fin(m.bedW, 0, 100000, 0), bedH: fin(m.bedH, 0, 100000, 0),
    dynamic: m.dynamic !== false, air: m.air === true, setLaserMode: m.setLaserMode !== false, framePower: fin(m.framePower, 0, 100, 0), tol: fin(m.tol, 0.001, 1, dm.tol),
  };
  const layers = [], seen = new Set();
  for (const l of (Array.isArray(o.layers) ? o.layers : []).slice(0, 500)) {
    const name = txt(l?.name);
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const mode = MODES.includes(l.mode) ? l.mode : 'off', d = DEFAULTS[mode];
    const out = { name, mode, power: fin(l.power, 0, 100, d.power), speed: fin(l.speed, 1, 100000, d.speed), passes: Math.round(fin(l.passes, 1, 50, 1)) };
    if (mode === 'fill' || mode === 'image') {
      out.interval = fin(l.interval, 0.005, 10, d.interval); out.angle = fin(l.angle, -360, 360, 0);
      out.bidirectional = l.bidirectional !== false; out.overscan = fin(l.overscan, 0, 50, d.overscan);
    }
    if (mode === 'fill') out.crosshatch = l.crosshatch === true;
    if (mode === 'image') {
      out.dither = DITHER_NAMES.includes(l.dither) ? l.dither : d.dither; out.threshold = fin(l.threshold, 0, 255, 128); out.gamma = fin(l.gamma, 0.1, 10, 1);
      out.invert = l.invert === true; out.levels = Math.round(fin(l.levels, 2, 256, 16)); out.minPower = fin(l.minPower, 0, 100, 0); out.skipGap = fin(l.skipGap, 0, 1000, d.skipGap);
    }
    layers.push(out);
  }
  return { format: FORMAT, version: VERSION, machine, layers, origin: o.origin === 'drawing' ? 'drawing' : 'job' };
}

/** The job with an entry for every drawing layer name (new ones are `off`), keeping the order of `names`. */
export function jobFor(job, names) {
  const have = new Map(job.layers.map((l) => [l.name, l]));
  const layers = names.map((n) => have.get(n) || newLayer(n, 'off'));
  for (const l of job.layers) if (!names.includes(l.name)) layers.push(l);          // settings of a layer that is gone are kept
  return { ...job, layers };
}

export const sValue = (machine, percent) => Math.max(0, Math.min(machine.sMax, Math.round(machine.sMax * percent / 100)));
