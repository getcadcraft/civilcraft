/* SPDX-License-Identifier: Apache-2.0 */
/**
 * check.js — read a program back and look for what would crash or waste a job (lib/carve). DOM-free, and meant to be run by a person or by an
 * AI assistant on any G-code, not only ours.
 *   checkProgram(text, limits) → { ok, issues: [{ key, line, detail }], stats }
 *     limits = { bed: { x0, y0, x1, y1 } | null, maxDepth (mm below the top, default none), safeZ (default 5) }
 *   Issues: a cut (G1) before any feed rate or spindle speed was set; a rapid (G0) that moves across the work below the top of the stock; a move outside
 *   the bed; a cut deeper than the stock allows; a plunge into the work with no spindle on; the unit (inches vs millimetres) never declared; no program end.
 */
import { parseGcode, gcodeLines } from './post.js';

export function checkProgram(text, limits = {}) {
  const moves = parseGcode(text), issues = [];
  const bed = limits.bed || null, maxDepth = Number(limits.maxDepth) > 0 ? Number(limits.maxDepth) : null;
  const add = (key, line, detail) => { if (issues.length < 60) issues.push({ key, line, detail }); };
  let spindle = false, feedSeen = false, px = null, py = null, pz = null, minZ = 0, maxX = -Infinity, minX = Infinity, maxY = -Infinity, minY = Infinity, cuts = 0;
  // perf-finish-11 (PERF.26): `text` may be the program's parts (gcode() → parts, or TextParts), read a line at a time, so a program past one string is
  // checked too; the moves are walked in step with the lines (they come in line order), where a moves.find per line made the check quadratic.
  let unit = null, mi = 0, i = -1, ended = false, spans = false;
  for (const raw of gcodeLines(text)) {
    i++;
    const code = raw.replace(/\([^)]*\)/g, '').replace(/;.*$/, '');
    if (/\bG2[01]\b/i.test(code)) unit = /G20/i.test(code) ? 'in' : 'mm';
    if (/\bM0?[34]\b/i.test(code)) spindle = true;
    if (/\bM0?5\b/i.test(code)) spindle = false;
    if (/\bF\d/i.test(code)) feedSeen = true;
    // the program end, as the old test on the whole text (comments taken out) found it: per line, unless a "(" is left open on its line (then that
    // comment ran into the next lines and the whole text is tested at the end, as before)
    const bare = raw.replace(/\([^)]*\)/g, '');
    if (!ended && /\bM0?[2]\b|\bM30\b/i.test(bare)) ended = true;
    if (!spans && bare.indexOf('(') >= 0) spans = true;
    while (mi < moves.length && moves[mi].line < i + 1) mi++;
    const mv = mi < moves.length && moves[mi].line === i + 1 ? moves[mi] : null;
    if (!mv) continue;
    const k = mv.mm ? 1 : 25.4;
    const x = mv.x === null ? px : mv.x * k, y = mv.y === null ? py : mv.y * k, z = mv.z === null ? pz : mv.z * k;
    if (mv.g === 1) {
      cuts++;
      if (!feedSeen && mv.f === null) add('nofeed', i + 1, raw.trim());
      if (!spindle && z !== null && z < 0) add('nospindle', i + 1, raw.trim());
      if (maxDepth !== null && z !== null && z < -maxDepth - 1e-6) add('toodeep', i + 1, z.toFixed(2));
    } else if (mv.g === 0 && pz !== null && z !== null && (px !== x || py !== y) && Math.min(pz, z) < -1e-6) add('rapidcut', i + 1, raw.trim());
    if (bed && x !== null && y !== null && (x < bed.x0 - 1e-6 || x > bed.x1 + 1e-6 || y < bed.y0 - 1e-6 || y > bed.y1 + 1e-6)) add('outsidebed', i + 1, x.toFixed(2) + ', ' + y.toFixed(2));
    if (x !== null) { maxX = Math.max(maxX, x); minX = Math.min(minX, x); }
    if (y !== null) { maxY = Math.max(maxY, y); minY = Math.min(minY, y); }
    if (z !== null) minZ = Math.min(minZ, z);
    px = x; py = y; pz = z;
  }
  if (!unit) add('nounit', 0, '');
  if (spans) ended = /\bM0?[2]\b|\bM30\b/i.test([...gcodeLines(text)].join('\n').replace(/\([^)]*\)/g, ''));
  if (!ended) add('noend', 0, '');
  if (!cuts) add('nocuts', 0, '');
  return { ok: !issues.length, issues, stats: { cuts, bounds: cuts ? { x0: minX, y0: minY, x1: maxX, y1: maxY } : null, minZ, unit } };
}
