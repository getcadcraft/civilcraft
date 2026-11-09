/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ps-profiles.js — what a print is made with (roadmap PS.1): printers, materials and qualities as data, and cleanJob(), which keeps
 * every number inside what a machine can safely be asked for. Imports nothing, no DOM.
 *
 *   PRINTERS, MATERIALS, QUALITIES   the choices; a person can edit the bed size and the start and end G-code of their printer
 *     a printer may carry its own `start` / `end` G-code (data, PS.10); one that does not uses the generic START / END
 *   defaultStart(printer) · defaultEnd(printer)   the G-code a printer starts from (the panel follows it until the person edits it)
 *   DEFAULT_JOB                      the settings of a new job
 *   cleanJob(any) → job              always whole and in range; never throws
 *   startLines(job) · endLines(job)  the job's start and end G-code, {bed_temp} {nozzle_temp} {max_z} filled in
 */
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const START = ['G90', 'M83', 'M140 S{bed_temp}', 'M104 S{nozzle_temp}', 'G28', 'M190 S{bed_temp}', 'M109 S{nozzle_temp}', 'G92 E0', 'G1 Z5 F600'].join('\n');
const END = ['M104 S0', 'M140 S0', 'M107', 'G91', 'G1 E-2 F1800', 'G1 Z10 F600', 'G90', 'M84'].join('\n');

// Named machines (PS.10). The start G-code is the one these printers' own slicers or the community's usual profiles begin with, cut down to
// commands the firmware family documents; each is written as data and has NOT been run on the machine itself (PS.5 is the owner's real print).
// Every move stays inside the bed: a purge line along the front edge, never outside it (checkGcode would refuse the plate).
const ENDER3_START = ['G90', 'M83', 'M140 S{bed_temp}', 'M104 S{nozzle_temp}', 'G28', 'G1 Z2 F3000', 'M190 S{bed_temp}', 'M109 S{nozzle_temp}', 'G92 E0',
  'G1 X0.4 Y20 Z0.3 F5000', 'G1 X0.4 Y200 Z0.3 F1500 E15', 'G1 X0.7 Y200 Z0.3 F5000', 'G1 X0.7 Y20 Z0.3 F1500 E30', 'G92 E0', 'G1 Z2 F3000'].join('\n');
const MK4_START = ['G90', 'M83', 'M140 S{bed_temp}', 'M104 S170', 'G28', 'M190 S{bed_temp}', 'G29', 'M109 S{nozzle_temp}', 'G92 E0',
  'G1 X10 Y1 Z0.3 F4000', 'G1 X110 Y1 Z0.3 F1000 E14', 'G1 X110 Y1.6 Z0.3 F1000', 'G1 X10 Y1.6 Z0.3 F1000 E14', 'G92 E0', 'G1 Z2 F1200'].join('\n');
const KLIPPER_START = ['G90', 'M83', 'M140 S{bed_temp}', 'M104 S150', 'G28', 'M190 S{bed_temp}', 'M109 S{nozzle_temp}', 'G92 E0',
  'G1 X10 Y1 Z0.3 F6000', 'G1 X110 Y1 Z0.3 F1500 E12', 'G92 E0', 'G1 Z3 F1200'].join('\n');
export const PRINTERS = {
  small: { bed: [180, 180, 180], nozzle: 0.4, filament: 1.75 },
  medium: { bed: [220, 220, 250], nozzle: 0.4, filament: 1.75 },
  large: { bed: [256, 256, 256], nozzle: 0.4, filament: 1.75 },
  xl: { bed: [300, 300, 400], nozzle: 0.4, filament: 1.75 },
  ender3: { bed: [220, 220, 250], nozzle: 0.4, filament: 1.75, start: ENDER3_START },
  mk4: { bed: [250, 210, 220], nozzle: 0.4, filament: 1.75, start: MK4_START },
  klipper250: { bed: [250, 250, 250], nozzle: 0.4, filament: 1.75, start: KLIPPER_START },
};
export const defaultStart = (printer) => (has(PRINTERS, printer) && PRINTERS[printer].start) || START;
export const defaultEnd = (printer) => (has(PRINTERS, printer) && PRINTERS[printer].end) || END;
export const MATERIALS = {
  pla: { nozzle_temp: 205, bed_temp: 60, fan: 100, density: 1.24, retract: 0.8 },
  petg: { nozzle_temp: 235, bed_temp: 80, fan: 40, density: 1.27, retract: 1 },
  abs: { nozzle_temp: 245, bed_temp: 100, fan: 0, density: 1.04, retract: 0.8 },
  tpu: { nozzle_temp: 225, bed_temp: 45, fan: 60, density: 1.21, retract: 0 },
};
export const QUALITIES = {
  draft: { layer: 0.28, walls: 2, top: 3, bottom: 3, speed: 60 },
  normal: { layer: 0.2, walls: 2, top: 4, bottom: 3, speed: 50 },
  fine: { layer: 0.12, walls: 3, top: 6, bottom: 5, speed: 40 },
};
export const DEFAULT_JOB = { printer: 'medium', material: 'pla', quality: 'normal', infill: 15, supports: false, skirt: true, bridges: true, seam: 'aligned', bed: null, start: START, end: END };

const num = (v, lo, hi, d) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };
/** G-code a person typed: plain ASCII lines only, a sane length. */
const lines = (v, d) => (typeof v === 'string' && v.length < 8000 ? v.replace(/[^\x20-\x7e\n]/g, '').replace(/\r/g, '') : d);

export function cleanJob(j) {
  const o = j && typeof j === 'object' ? j : {};
  const printer = typeof o.printer === 'string' && has(PRINTERS, o.printer) ? o.printer : DEFAULT_JOB.printer;
  const material = typeof o.material === 'string' && has(MATERIALS, o.material) ? o.material : DEFAULT_JOB.material;
  const quality = typeof o.quality === 'string' && has(QUALITIES, o.quality) ? o.quality : DEFAULT_JOB.quality;
  const P = PRINTERS[printer], M = MATERIALS[material], Q = QUALITIES[quality];
  const bed = Array.isArray(o.bed) && o.bed.length === 3 ? o.bed.map((v, i) => num(v, 50, 2000, P.bed[i])) : P.bed.slice();
  return {
    printer, material, quality, bed,
    infill: num(o.infill, 0, 100, DEFAULT_JOB.infill), supports: !!o.supports, skirt: o.skirt !== false, bridges: o.bridges !== false, seam: o.seam === 'nearest' ? 'nearest' : 'aligned',
    start: lines(o.start, defaultStart(printer)), end: lines(o.end, defaultEnd(printer)),
    nozzle: num(o.nozzle, 0.1, 1.2, P.nozzle), filament: num(o.filament, 1, 3, P.filament),
    nozzle_temp: Math.round(num(o.nozzle_temp, 150, 300, M.nozzle_temp)), bed_temp: Math.round(num(o.bed_temp, 0, 120, M.bed_temp)),
    fan: num(o.fan, 0, 100, M.fan), density: M.density, retract: num(o.retract, 0, 8, M.retract),
    layer: num(o.layer, 0.05, 0.8, Q.layer), walls: Math.round(num(o.walls, 1, 8, Q.walls)), top: Math.round(num(o.top, 0, 20, Q.top)), bottom: Math.round(num(o.bottom, 0, 20, Q.bottom)),
    speed: num(o.speed, 5, 300, Q.speed),
  };
}

const fill = (text, job) => String(text).replace(/\{(bed_temp|nozzle_temp|max_z)\}/g, (_, k) => String(k === 'max_z' ? job.bed[2] : job[k]))
  .split('\n').map((l) => l.trim()).filter(Boolean);
export const startLines = (job) => fill(job.start, job);
export const endLines = (job) => fill(job.end, job);
