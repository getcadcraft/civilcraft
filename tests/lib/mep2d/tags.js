/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tags.js — tag numbers, the count schedule, the legend and the size tag of 2D MEP drafting (lib/mep2d). DOM-free.
 *
 *   tagPrefix(prefix, svc, scheme)       'kind' → "V" · 'service' → "HF-V"
 *   nextTag(used, prefix, opts)          the next free number of a prefix: "V-01" (used = every tag already in the drawing)
 *   renumber(items, scheme)              → Map(id → tag): every tagged item numbered again, in reading order (top to bottom,
 *                                          left to right), one sequence per prefix
 *   schedule(items)                      → rows [{ kind, name, size, svc, n }] (kind, then size, then service)
 *   scheduleRows(rows, head)             → the table's rows of text
 *   tableEntities(title, rows, h, tw)    → lines and text, the top-left corner at (0, 0); tw(s, h) = how wide text runs
 *   legendEntities(items, h, tw)         → items [{ ents (a symbol about its own origin, already at size), label }] or
 *                                          { line: { lt, color, layer }, label } for a service line
 *   sizeTagText(size, svc)               "DN25 HF"
 * An item is { id, kind (symbol or equipment key), name, prefix, svc, size, tag, x, y }.
 */
import { L, text } from './geom.js';

export const tagPrefix = (prefix, svc, scheme = 'kind') => (scheme === 'service' && svc ? svc + '-' + prefix : prefix);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function nextTag(used, prefix, { width = 2, sep = '-' } = {}) {
  if (!prefix) return '';
  const re = new RegExp('^' + esc(prefix) + esc(sep) + '?(\\d+)$', 'i');
  let max = 0;
  for (const t of used || []) { const m = re.exec(String(t ?? '').trim()); if (m) max = Math.max(max, Number(m[1])); }
  return prefix + sep + String(max + 1).padStart(width, '0');
}

export function renumber(items, scheme = 'kind', opts = {}) {
  const list = items.filter((i) => i.prefix).slice().sort((a, b) => (Math.abs(a.y - b.y) > 1e-9 ? b.y - a.y : a.x - b.x));
  const out = new Map(), used = new Map();
  for (const i of list) {
    const p = tagPrefix(i.prefix, i.svc, scheme);
    if (!used.has(p)) used.set(p, []);
    const t = nextTag(used.get(p), p, opts);
    used.get(p).push(t);
    out.set(i.id, t);
  }
  return out;
}

export function schedule(items) {
  const by = new Map();
  for (const i of items) {
    const key = [i.kind, i.size || '', i.svc || ''].join('\u0001');
    let r = by.get(key);
    if (!r) by.set(key, (r = { kind: i.kind, name: i.name || i.kind, size: i.size || '', svc: i.svc || '', n: 0, tags: [] }));
    r.n++;
    if (i.tag) r.tags.push(i.tag);
  }
  const cmp = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true });
  return [...by.values()].sort((a, b) => cmp(a.name, b.name) || cmp(a.size, b.size) || cmp(a.svc, b.svc));
}
export const scheduleRows = (rows, head) => [head, ...rows.map((r) => [r.name, r.size || '-', r.svc || '-', String(r.n)])];
export const scheduleCsv = (rows, head) => scheduleRows(rows, head).map((r) => r.map((c) => { let s = String(c ?? ''); if (/^[=+\-@]/.test(s) && s !== '-') s = "'" + s; return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(',')).join('\r\n') + '\r\n';

const approxWidth = (s, h) => String(s).length * h * 0.72;

export function tableEntities(title, rows, h, tw = approxWidth) {
  const pad = h * 0.6, rowH = h * 2, out = [];
  const cols = Math.max(1, ...rows.map((r) => r.length));
  const widths = Array.from({ length: cols }, (_, j) => Math.max(...rows.map((r) => tw(r[j] ?? '', h))) + 2 * pad);
  const W = widths.reduce((a, b) => a + b, 0);
  out.push(text(0, rowH * 0.3, h * 1.25, title, { ha: 'left', va: 'bottom' }));
  let y = 0;
  out.push(L(0, 0, W, 0));
  rows.forEach((r, i) => {
    let x = 0;
    for (let j = 0; j < cols; j++) {
      const s = String(r[j] ?? ''), right = i > 0 && /^\d+$/.test(s) && j === cols - 1;
      if (s) out.push(text(right ? x + widths[j] - pad : x + pad, y - rowH / 2, h, s, { ha: right ? 'right' : 'left', va: 'middle' }));
      x += widths[j];
    }
    y -= rowH;
    out.push(L(0, y, W, y));
  });
  let x = 0;
  for (let j = 0; j <= cols; j++) { out.push(L(x, 0, x, y)); x += widths[j] || 0; }
  return out;
}

const shift = (e, dx, dy) => {
  if (e.type === 'line') return { ...e, x1: e.x1 + dx, y1: e.y1 + dy, x2: e.x2 + dx, y2: e.y2 + dy };
  if (e.type === 'circle' || e.type === 'arc') return { ...e, cx: e.cx + dx, cy: e.cy + dy };
  if (e.type === 'poly') return { ...e, pts: e.pts.map((q) => ({ x: q.x + dx, y: q.y + dy, b: q.b || 0 })) };
  if (e.type === 'hatch') return { ...e, loops: e.loops.map((lp) => lp.map((v, i) => v + (i % 2 ? dy : dx))) };
  if (e.type === 'text') return { ...e, x: e.x + dx, y: e.y + dy };
  return e;
};

/** A legend: its title, then one row per item — the symbol (or a sample of the service's line) and what it is. */
export function legendEntities(title, items, h, tw = approxWidth) {
  const rowH = h * 4, symW = h * 9, pad = h, out = [];
  const W = symW + pad * 2 + Math.max(tw(title, h * 1.25), ...items.map((i) => tw(i.label, h))) + pad;
  out.push(text(pad, -h * 1.6, h * 1.25, title, { ha: 'left', va: 'middle' }));
  let y = -h * 3.2;
  for (const it of items) {
    const cy = y - rowH / 2;
    if (it.line) out.push({ ...L(pad, cy, pad + symW, cy), ...(it.line.layer ? { layer: it.line.layer } : {}), ...(it.line.lt ? { lt: it.line.lt } : {}) });
    else for (const e of it.ents || []) out.push(shift(e, pad + symW / 2, cy));
    out.push(text(symW + pad * 2, cy, h, it.label, { ha: 'left', va: 'middle' }));
    y -= rowH;
  }
  out.push(L(0, 0, W, 0), L(W, 0, W, y), L(W, y, 0, y), L(0, y, 0, 0));
  return out;
}

export const sizeTagText = (size, svc) => [size, svc].filter(Boolean).join(' ');
