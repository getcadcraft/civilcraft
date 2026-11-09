/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-profiles.js — what a resin print is made with (roadmap RSN.1): printers, resins and settings as data, and cleanResin(), which keeps every number inside
 * what a machine can safely be asked for. Imports nothing, no DOM. The values are the makers' published screen and build sizes and generic starting
 * exposures: none has been checked on the machine, so the card says "starting point" and the calibration add-on exists to find the person's own.
 *
 *   PRINTERS    id → { name, px: [w, h], mm: [x, y, z], formats: [format ids], flip: { x, y }, note }   mm is the lit screen area and the build height
 *   RESINS      id → { exposure, bottomExposure, bottomLayers, liftHeight, liftSpeed, retractSpeed, lightOff, density, price }   times in s, speeds in mm/min
 *   DEFAULT_JOB · cleanResin(any) → job     always whole and in range; never throws
 *   pixelMm(printer) → [mm per pixel in x, in y]
 */
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

export const PRINTERS = {
  'elegoo-mars-4-ultra': { name: 'Elegoo Mars 4 Ultra', px: [8520, 4320], mm: [153.36, 77.76, 165], formats: ['goo'], flip: { x: false, y: false } },
  'elegoo-saturn-3-ultra': { name: 'Elegoo Saturn 3 Ultra', px: [11520, 5120], mm: [218.88, 122.88, 260], formats: ['goo'], flip: { x: false, y: false } },
  'elegoo-saturn-2': { name: 'Elegoo Saturn 2', px: [7680, 4320], mm: [218.88, 123.12, 250], formats: ['goo'], flip: { x: false, y: false } },
  'prusa-sl1s': { name: 'Prusa SL1S Speed', px: [2560, 1620], mm: [127, 80, 150], formats: ['sl1'], flip: { x: false, y: false } },
  'prusa-sl1': { name: 'Prusa SL1', px: [2560, 1440], mm: [120.96, 68.04, 150], formats: ['sl1'], flip: { x: false, y: false } },
  'elegoo-mars': { name: 'Elegoo Mars (the original)', px: [1440, 2560], mm: [68.04, 120.96, 155], formats: ['cbddlp'], flip: { x: false, y: false } },
  'creality-ld-002r': { name: 'Creality LD-002R', px: [1440, 2560], mm: [68.04, 120.96, 160], formats: ['cbddlp', 'ctb'], flip: { x: false, y: false } },
  'anycubic-photon-mono-x': { name: 'Anycubic Photon Mono X', px: [3840, 2400], mm: [192, 120, 245], formats: ['pwmx'], flip: { x: false, y: false } },
  'generic-4k': { name: 'Generic 4K, 6.6 in screen', px: [3840, 2400], mm: [134.4, 84, 150], formats: ['goo', 'sl1', 'cbddlp', 'ctb'], flip: { x: false, y: false } },
  'generic-8k': { name: 'Generic 8K, 10 in screen', px: [7680, 4320], mm: [218.88, 123.12, 250], formats: ['goo', 'sl1'], flip: { x: false, y: false } },
  custom: { name: 'Custom (set the screen yourself)', px: [3840, 2400], mm: [134.4, 84, 150], formats: ['goo', 'sl1'], flip: { x: false, y: false }, custom: true },
};

export const RESINS = {
  standard: { exposure: 2.5, bottomExposure: 25, bottomLayers: 6, liftHeight: 6, liftSpeed: 120, retractSpeed: 240, lightOff: 1, density: 1.1, price: 25 },
  tough: { exposure: 3, bottomExposure: 30, bottomLayers: 6, liftHeight: 7, liftSpeed: 100, retractSpeed: 200, lightOff: 1.5, density: 1.12, price: 35 },
  washable: { exposure: 2.8, bottomExposure: 28, bottomLayers: 6, liftHeight: 6, liftSpeed: 120, retractSpeed: 240, lightOff: 1, density: 1.1, price: 30 },
  flexible: { exposure: 4, bottomExposure: 35, bottomLayers: 8, liftHeight: 8, liftSpeed: 80, retractSpeed: 160, lightOff: 2, density: 1.1, price: 40 },
};

export const DEFAULT_JOB = {
  printer: 'generic-4k', resin: 'standard', layerHeight: 0.05,
  hollow: false, wall: 2, drain: 3,
  supports: false, density: 'medium', overhang: 40, lift: 4, tilt: 0,
  screen: null,   // { px: [w, h], mm: [x, y, z] } when the printer is "custom"
};

/** Support density: pillar and tip radii, and the grid the unsupported areas are sampled on (mm). */
export const DENSITIES = {
  light: { spacing: 7, tip: 0.2, shaft: 0.45, base: 1.4 },
  medium: { spacing: 4.5, tip: 0.25, shaft: 0.55, base: 1.7 },
  heavy: { spacing: 3, tip: 0.3, shaft: 0.7, base: 2 },
};

const num = (v, lo, hi, d) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };
export const pixelMm = (p) => [p.mm[0] / p.px[0], p.mm[1] / p.px[1]];

/** The printer a job means: a named profile, or the custom one with the person's screen (held in range). */
export function printerOf(job) {
  const P = PRINTERS[job.printer];
  if (!P.custom || !job.screen) return P;
  const s = job.screen;
  return { ...P, px: [Math.round(num(s.px?.[0], 320, 20000, P.px[0])), Math.round(num(s.px?.[1], 200, 12000, P.px[1]))], mm: [num(s.mm?.[0], 20, 600, P.mm[0]), num(s.mm?.[1], 20, 400, P.mm[1]), num(s.mm?.[2], 20, 600, P.mm[2])] };
}

export function cleanResin(j) {
  const o = j && typeof j === 'object' ? j : {};
  const printer = typeof o.printer === 'string' && has(PRINTERS, o.printer) ? o.printer : DEFAULT_JOB.printer;
  const resin = typeof o.resin === 'string' && has(RESINS, o.resin) ? o.resin : DEFAULT_JOB.resin;
  const R = RESINS[resin];
  const screen = PRINTERS[printer].custom && o.screen && typeof o.screen === 'object' ? { px: [o.screen.px?.[0], o.screen.px?.[1]], mm: [o.screen.mm?.[0], o.screen.mm?.[1], o.screen.mm?.[2]] } : null;
  const job = {
    printer, resin, screen,
    layerHeight: num(o.layerHeight, 0.01, 0.2, DEFAULT_JOB.layerHeight),
    hollow: !!o.hollow, wall: num(o.wall, 0.8, 6, DEFAULT_JOB.wall), drain: num(o.drain, 1.5, 6, DEFAULT_JOB.drain),
    supports: !!o.supports, density: has(DENSITIES, o.density) ? o.density : DEFAULT_JOB.density,
    overhang: num(o.overhang, 10, 70, DEFAULT_JOB.overhang), lift: num(o.lift, 1, 10, DEFAULT_JOB.lift), tilt: num(o.tilt, 0, 60, 0),
    exposure: num(o.exposure, 0.2, 60, R.exposure), bottomExposure: num(o.bottomExposure, 1, 300, R.bottomExposure), bottomLayers: Math.round(num(o.bottomLayers, 1, 30, R.bottomLayers)),
    liftHeight: num(o.liftHeight, 1, 30, R.liftHeight), liftSpeed: num(o.liftSpeed, 10, 600, R.liftSpeed), retractSpeed: num(o.retractSpeed, 10, 900, R.retractSpeed),
    lightOff: num(o.lightOff, 0, 20, R.lightOff), density_g: R.density, price: num(o.price, 0, 1000, R.price),
  };
  job.printerSpec = printerOf(job);
  return job;
}
