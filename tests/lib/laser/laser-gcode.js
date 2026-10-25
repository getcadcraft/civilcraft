/* SPDX-License-Identifier: Apache-2.0 */
/**
 * laser-gcode.js — GRBL laser-mode G-code from a plan (0.7 SU.772, session `make-07`). DOM-free; imports laser-model.js only.
 *
 * What it writes, for GRBL 1.1 in laser mode ($32=1):
 *   ; comment header (counts, bounds, an estimate)         G21 G90 G17 · optional $32=1 · M5 · optional M8 (air)
 *   per operation (a comment line names the layer and mode), `passes` times:
 *     G0 X Y                       a rapid to the start of a path (GRBL turns the laser off for G0 in laser mode)
 *     G1 X Y S<n> F<speed>         a move that burns at S n (S and F only when they change); G1 … S0 is a move with the laser off
 *   M4 (dynamic power: GRBL scales S with the speed through corners) or M3 (constant power) is set once, with S0, before the
 *   first move; M5 · optional M9 · G0 X0 Y0 at the end. Lines are short (GRBL's input line is 80 characters).
 * Coordinates are mm with three decimals; arcs were flattened by the plan, so only G0 and G1 are used.
 *
 *   gcode(job, plan, { comments = true, returnToOrigin = true }) → string (LF line ends)
 *   gcodeLines(job, plan, opts) → [line]          the same, one string per line (what the serial sender streams)
 *   frameLines(job, plan, { speed }) → [line]     "frame the job": the head traces the box of everything that burns, once, with
 *       the laser off (M5) — or at machine.framePower percent (M4 S<n>) for a machine with a visible pointer at low power
 *   fmt(v) → the number as written
 */
import { sValue } from './laser-model.js';

export const fmt = (v) => { const s = (Math.abs(v) < 5e-4 ? 0 : v).toFixed(3); return s.replace(/\.?0+$/, '') || '0'; };

export function gcodeLines(job, plan, { comments = true, returnToOrigin = true, header = true } = {}) {
  const m = job.machine, L = [];
  const c = (t) => { if (comments) L.push('; ' + String(t).replace(/[\r\n]+/g, ' ').replace(/[^\x20-\x7e]/g, '?').slice(0, 70)); };
  if (header) {
    /* i18n-ignore-start: comment lines inside the G-code file, always English (a controller and a machinist read them) */
    c('CadCraft laser job');
    if (plan.bounds) c('size ' + fmt(plan.bounds.x1 - plan.bounds.x0) + ' x ' + fmt(plan.bounds.y1 - plan.bounds.y0) + ' mm, ' + plan.ops.length + ' operation(s), about ' + Math.max(1, Math.round(plan.stats.time / 60)) + ' min without acceleration');
    c(job.origin === 'drawing' ? 'X0 Y0 is the drawing origin' : 'X0 Y0 is the job lower left corner: set the work zero there');
    c('start values are for testing on scrap first');
    /* i18n-ignore-end */
    L.push('G21', 'G90', 'G17');
    if (m.setLaserMode) L.push('$32=1');
    L.push('M5');
    if (m.air) L.push('M8');
  }
  let started = false, S = -1, F = -1;
  for (const op of plan.ops) {
    c('layer ' + op.layer + ': ' + op.mode + ' power ' + fmt(op.power) + '% speed ' + fmt(op.speed) + ' x' + op.passes);
    for (let pass = 0; pass < op.passes; pass++) {
      if (op.passes > 1) c('pass ' + (pass + 1));
      for (const mv of op.moves) {
        if (!started) { L.push((m.dynamic ? 'M4' : 'M3') + ' S0'); started = true; S = 0; }
        const rapid = (mv.start && !mv.link) || mv.rapid;
        if (rapid) { L.push('G0 X' + fmt(mv.x) + ' Y' + fmt(mv.y)); continue; }
        let line = 'G1 X' + fmt(mv.x) + ' Y' + fmt(mv.y);
        if (mv.s !== S) { line += ' S' + mv.s; S = mv.s; }
        if (op.speed !== F) { line += ' F' + fmt(op.speed); F = op.speed; }
        L.push(line);
      }
    }
  }
  if (header) {
    L.push('M5');
    if (m.air) L.push('M9');
    if (returnToOrigin) L.push('G0 X0 Y0');
  }
  return L;
}

export const gcode = (job, plan, opts) => gcodeLines(job, plan, opts).join('\n') + '\n';

export function frameLines(job, plan, { speed = 3000 } = {}) {
  const b = plan.bounds, m = job.machine;
  if (!b) return [];
  const f = fmt(speed);
  const L = ['G21', 'G90', 'G17', 'M5'];
  const lit = m.framePower > 0;
  const pts = [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1], [b.x0, b.y0]];
  L.push('G0 X' + fmt(pts[0][0]) + ' Y' + fmt(pts[0][1]));
  if (lit) L.push((m.dynamic ? 'M4' : 'M3') + ' S' + sValue(m, m.framePower));
  for (let i = 1; i < pts.length; i++) L.push('G1 X' + fmt(pts[i][0]) + ' Y' + fmt(pts[i][1]) + (i === 1 ? ' F' + f : ''));
  L.push('M5', 'G0 X0 Y0');
  return L;
}
