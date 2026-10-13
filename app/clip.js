/* SPDX-License-Identifier: Apache-2.0 */
/**
 * clip.js — copying and pasting survey points. No DOM: the page (civilcraft.js) and the Node test use it alike.
 *
 *   makeClip(points, { units, order, source })  → clip { format: 'civilcraft-clip', v: 1, units, at, source, pts: [[n, x, y, z, d]], csv }
 *   readClip(obj)                                → a clean clip, or null (untrusted: localStorage can hold anything)
 *   pointsText(points, order)                    → "P,N,E,Z,D" lines (or P,E,N,Z,D) for a spreadsheet; CRLF; formula-looking text gets a leading '
 *   textPoints(text, order)                      → { points, res } from text on the system clipboard, read by points.js parsePoints
 *   choosePaste(own, systemText, order)          → { kind: 'clip'|'text'|'none', points, units?, why }
 *   renumber(incoming, existing, { mode, start }) → { points, changed: [[old, new]], kept }
 *   renumberText(changed, kept, total)           → "3 kept their numbers; 9 got new numbers: 10–18 became 277–285"
 *   moveBy(points, dx, dy) · centre(points)
 *
 * Numbers (`mode`): 'clash' (default) keeps a pasted point's number when no point in the project has it and gives
 * the clashing ones new numbers; 'always' gives every pasted point a new number. New numbers are whole numbers
 * counting up from `start` (when set) or from one past the highest whole number in use, skipping any taken.
 */

import { t } from "./i18n.js";
import { parsePoints } from './points.js';

export const CLIP_FORMAT = 'civilcraft-clip';
export const MAX_CLIP = 200000;
const MAX_COORD = 1e9;

const clean = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
const fin = (v) => typeof v === 'number' && Number.isFinite(v) && Math.abs(v) < MAX_COORD;

/** A spreadsheet cell: quoted when it holds the separator or a quote; text that a spreadsheet would run as a formula gets a leading '. */
function cell(s) {
  let t = String(s);
  if (/^[=+\-@]/.test(t) && !/^[+-]?\d/.test(t)) t = "'" + t;
  return /[",\r\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
}
const num = (v, dec = 3) => (v === null || v === undefined ? '' : Number(v.toFixed(dec)).toString());

export function pointsText(points, order = 'PNEZD') {
  const pene = order === 'PENZD';
  return points.map((p) => [cell(p.n), pene ? num(p.x) : num(p.y), pene ? num(p.y) : num(p.x), num(p.z), cell(p.d || '')].join(',')).join('\r\n') + '\r\n';
}

export function makeClip(points, { units = 'ft', order = 'PNEZD', source = '' } = {}) {
  const pts = points.slice(0, MAX_CLIP).map((p) => [String(p.n), p.x, p.y, p.z === null || p.z === undefined ? null : p.z, p.d || '']);
  return { format: CLIP_FORMAT, v: 1, units: units === 'm' ? 'm' : 'ft', at: Date.now(), source: clean(source, 40), pts, csv: pointsText(points.slice(0, MAX_CLIP), order) };
}

/** Rows that are not a point (bad numbers, too far out, junk) are dropped; nothing usable → null. */
export function readClip(obj) {
  if (!obj || typeof obj !== 'object' || obj.format !== CLIP_FORMAT || obj.v !== 1 || !Array.isArray(obj.pts)) return null;
  const seen = new Set(), pts = [];
  for (const r of obj.pts.slice(0, MAX_CLIP)) {
    if (!Array.isArray(r) || !fin(r[1]) || !fin(r[2])) continue;
    const n = clean(r[0], 40);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    pts.push({ n, x: r[1], y: r[2], z: fin(r[3]) ? r[3] : null, d: clean(r[4], 200).replace(/^'(?=[=+\-@])/, '') });
  }
  if (!pts.length) return null;
  return {
    format: CLIP_FORMAT, v: 1, units: obj.units === 'm' ? 'm' : 'ft', at: fin(obj.at) ? obj.at : 0, source: clean(obj.source, 40),
    points: pts, csv: typeof obj.csv === 'string' ? obj.csv.slice(0, 50e6) : '',
  };
}

/** Points from text someone copied (a spreadsheet, a text editor, another program), through the import parser. */
export function textPoints(text, order = 'PNEZD') {
  const res = parsePoints(String(text ?? '').slice(0, 50e6), { prefer: order });
  // a leading ' that a spreadsheet export put in front of formula-looking text is not part of the description
  for (const p of res.points) p.d = p.d.replace(/^'(?=[=+\-@])/, '');
  return { points: res.points, res };
}

const sameText = (a, b) => String(a || '').replace(/\r\n?/g, '\n').trim() === String(b || '').replace(/\r\n?/g, '\n').trim();

/**
 * What a paste uses. CivilCraft writes its copy to the system clipboard as text too, so text there that differs
 * from our copy was copied later (in a spreadsheet, another program): that text wins when it holds points.
 * `systemText` null = the system clipboard could not be read.
 */
export function choosePaste(own, systemText, order = 'PNEZD') {
  const hasText = typeof systemText === 'string' && systemText.trim() !== '';
  if (hasText && !(own && sameText(systemText, own.csv))) {
    const { points, res } = textPoints(systemText, order);
    if (points.length) return { kind: 'text', points, res, why: own ? t('clip.why.newer') : t('clip.why.text') };
    if (!own) return { kind: 'none', points: [], why: t('clip.why.unread', { why: res.badCount ? res.bad[0].why : t('clip.why.norows') }) };
  }
  if (own) return { kind: 'clip', points: own.points, units: own.units, why: t('clip.why.own') };
  return { kind: 'none', points: [], why: t('clip.why.nothing') };
}

const whole = (n) => (/^\d{1,15}$/.test(n) ? Number(n) : null);

export function renumber(incoming, existing, { mode = 'clash', start = null } = {}) {
  const used = new Set();
  let high = 0;
  for (const p of existing) { const n = String(p.n ?? p); used.add(n); const w = whole(n); if (w !== null && w > high) high = w; }
  const out = new Array(incoming.length), changed = [], todo = [];
  let kept = 0;
  incoming.forEach((p, i) => {
    const n = String(p.n);
    if (mode !== 'always' && !used.has(n)) {
      used.add(n); out[i] = { ...p, n }; kept++;
      const w = whole(n); if (w !== null && w > high) high = w;
    } else todo.push(i);
  });
  let next = Number.isInteger(start) && start > 0 ? start : high + 1;
  for (const i of todo) {
    while (used.has(String(next))) next++;
    const n = String(next++);
    used.add(n);
    changed.push([String(incoming[i].n), n]);
    out[i] = { ...incoming[i], n };
  }
  return { points: out, changed, kept };
}

/** "10–18" style ranges of whole numbers (others listed as they are), at most `max` pieces. */
function ranges(list, max = 4) {
  const parts = [];
  for (let i = 0; i < list.length;) {
    let j = i;
    const w = whole(list[i]);
    if (w !== null) while (j + 1 < list.length && whole(list[j + 1]) === whole(list[j]) + 1) j++;
    parts.push(j > i ? list[i] + '–' + list[j] : list[i]);
    i = j + 1;
  }
  return parts.length > max ? parts.slice(0, max).join(', ') + ' …' : parts.join(', ');
}

export function renumberText(changed, kept) {
  const bits = [];
  if (kept) bits.push(t('clip.kept', { n: kept }));
  if (changed.length) {
    const was = changed.map((c) => c[0]), now = changed.map((c) => c[1]);
    bits.push(t('clip.changed', { n: changed.length, was: ranges(was), now: ranges(now) }));
  }
  return bits.join('; ');
}

export function moveBy(points, dx, dy) { return points.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy })); }
export function centre(points) {
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  for (const p of points) { a = Math.min(a, p.x); b = Math.min(b, p.y); c = Math.max(c, p.x); d = Math.max(d, p.y); }
  return points.length ? { x: (a + c) / 2, y: (b + d) / 2 } : { x: 0, y: 0 };
}
