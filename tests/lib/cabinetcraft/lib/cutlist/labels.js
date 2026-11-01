/* SPDX-License-Identifier: Apache-2.0 */
/**
 * labels.js — a label for every piece, laid out on label sheets as SVG (0.8 SU.1035, session `sx-cabinet`; shared with SU.874).
 * DOM-free; imports only code128.js. Canonical in lib/cutlist; copies only through `node tools/cutlist/sync.mjs`.
 *
 * A label shows the part's name, its cabinet (group), the finished size, the material, where it was nested (sheet and number),
 * a small drawing of the part with its banded edges drawn heavy and the grain as an arrow, and a Code 128 bar code of the
 * piece id with the id written beside it. Sizes are in millimetres on the page (label sheets are sold by mm or inch sizes;
 * the inch templates are given in mm).
 *
 *   TEMPLATES { id: { page: {w, h}, cols, rows, label: {w, h}, left, top, gapX, gapY } }   (generic layouts, no product names)
 *   labelItem(piece, { fmt, nest, words }) → an item for one expanded piece (cutlist.js expand()):
 *     { id (the bar code), name, group, size, cut, material, l, w, bands {l1, l2, w1, w2}, grain, nest }
 *   labelSheets(items, template, { words, startAt = 0 (labels already used on the first sheet), module }) →
 *     { pages: [svg text], perPage, count, warnings: [{ code, id }] }
 *     items are laid in the order given (nest order when the caller passes it), left to right, top to bottom.
 *   labelsHtml(pages, { title, template }) → one printable HTML file: a page per sheet at its true size (print at 100 %).
 *   esc(text) → XML-escaped text
 */
import { encode, barsSvg } from './code128.js';

export const TEMPLATES = {
  'a4-24': { page: { w: 210, h: 297 }, cols: 3, rows: 8, label: { w: 70, h: 37 }, left: 0, top: 0.5, gapX: 0, gapY: 0 },
  'a4-14': { page: { w: 210, h: 297 }, cols: 2, rows: 7, label: { w: 99.1, h: 38.1 }, left: 4.65, top: 15.15, gapX: 2.5, gapY: 0 },
  'letter-30': { page: { w: 215.9, h: 279.4 }, cols: 3, rows: 10, label: { w: 66.675, h: 25.4 }, left: 4.7625, top: 12.7, gapX: 3.175, gapY: 0 },
  'letter-10': { page: { w: 215.9, h: 279.4 }, cols: 2, rows: 5, label: { w: 101.6, h: 50.8 }, left: 3.96875, top: 12.7, gapX: 4.7625, gapY: 0 },
  'roll-100x50': { page: { w: 100, h: 50 }, cols: 1, rows: 1, label: { w: 100, h: 50 }, left: 0, top: 0, gapX: 0, gapY: 0 },
  'roll-4x2in': { page: { w: 101.6, h: 50.8 }, cols: 1, rows: 1, label: { w: 101.6, h: 50.8 }, left: 0, top: 0, gapX: 0, gapY: 0 },
};
export const WORDS = { nest: 'Sheet {sheet}, no. {n}', cut: 'Cut {cut}', grain: 'Grain', none: '' };

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
  // eslint-disable-next-line no-control-regex
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
const fill = (s, v) => String(s).replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? String(v[k]) : m));
const r3 = (v) => Math.round(v * 1000) / 1000;

/** One piece → what its label says. fmt(v) formats a size (the caller's units and precision). nest = {sheet, n} or null. */
export function labelItem(piece, { fmt = (v) => String(v), nest = null, words = WORDS, cut = null } = {}) {
  const x = (a, b, c) => [a, b, c].filter((v) => v !== null && v !== undefined && v !== '').map(fmt).join(' × ');
  return {
    id: String(piece.pieceId ?? piece.id ?? ''),
    name: String(piece.name || ''),
    group: String(piece.group || ''),
    size: x(piece.length, piece.width, piece.thickness || null),
    cut: cut ? fill(words.cut, { cut: x(cut.length, cut.width) }) : '',
    material: String(piece.material || ''),
    l: piece.length, w: piece.width,
    bands: { l1: !!piece.band?.l1, l2: !!piece.band?.l2, w1: !!piece.band?.w1, w2: !!piece.band?.w2 },
    grain: piece.grain !== 'none',
    nest: nest ? fill(words.nest, nest) : '',
  };
}

/** The drawing of the part: a rectangle in the box (bx, by, bw, bh) kept to the part's proportions (within 1:4), banded edges heavy. */
function partSketch(it, bx, by, bw, bh) {
  const aspect = Math.max(0.25, Math.min(4, (Number(it.l) || 1) / (Number(it.w) || 1)));   // length runs across
  let w = bw, h = bw / aspect;
  if (h > bh) { h = bh; w = bh * aspect; }
  const x0 = bx + (bw - w) / 2, y0 = by + (bh - h) / 2, thin = 0.15, heavy = Math.max(0.6, Math.min(w, h) * 0.08);
  const edge = (on, x1, y1, x2, y2, key) => `<line x1="${r3(x1)}" y1="${r3(y1)}" x2="${r3(x2)}" y2="${r3(y2)}" stroke="#000" stroke-width="${r3(on ? heavy : thin)}" stroke-linecap="square" data-edge="${key}"${on ? ' data-banded="1"' : ''}/>`;
  // L1 = the bottom edge (a front edge reads at the bottom), L2 the top, W1 the left end, W2 the right
  let s = edge(it.bands.l1, x0, y0 + h, x0 + w, y0 + h, 'l1') + edge(it.bands.l2, x0, y0, x0 + w, y0, 'l2') +
    edge(it.bands.w1, x0, y0, x0, y0 + h, 'w1') + edge(it.bands.w2, x0 + w, y0, x0 + w, y0 + h, 'w2');
  if (it.grain) {
    const cy = y0 + h / 2, a = x0 + w * 0.2, b = x0 + w * 0.8, k = Math.min(h * 0.18, w * 0.08);
    s += `<path d="M${r3(a)} ${r3(cy)}H${r3(b)}M${r3(b - k)} ${r3(cy - k)}L${r3(b)} ${r3(cy)}L${r3(b - k)} ${r3(cy + k)}" fill="none" stroke="#000" stroke-width="0.2" data-grain="1"/>`;
  }
  return s;
}

function labelSvg(it, x, y, L, { module }) {
  const W = L.w, H = L.h, p = Math.min(2, H * 0.06);
  const fs1 = Math.min(4, H * 0.13), fs2 = Math.min(3, H * 0.095);
  const barH = Math.max(4, H * 0.22), barTop = H - p - barH;
  const sk = W * 0.3;
  const line = (yy, text, size, bold = false, anchor = 'start', xx = p) => text ? `<text x="${r3(xx)}" y="${r3(yy)}" font-size="${r3(size)}"${bold ? ' font-weight="700"' : ''}${anchor !== 'start' ? ` text-anchor="${anchor}"` : ''}>${esc(text)}</text>` : '';
  let body = '';
  const y1 = p + fs1, y2 = y1 + fs1 * 1.2, y3 = y2 + fs2 * 1.25, y4 = y3 + fs2 * 1.2;
  body += line(y1, it.name, fs1, true);
  body += line(y2, it.size, fs1 * 0.95, true);
  body += line(y3, [it.group, it.material].filter(Boolean).join('  '), fs2);
  if (y4 + fs2 * 0.3 < barTop) body += line(y4, [it.nest, it.cut].filter(Boolean).join('  '), fs2);
  body += partSketch(it, W - sk - p, p, sk, Math.max(1, barTop - 2 * p));
  // the bar code fills what is left of the bottom row after the id text
  let warn = null;
  try {
    const enc = encode(it.id);
    const idW = Math.min(W * 0.4, fs2 * 0.6 * it.id.length + p);
    const room = W - 2 * p - idW;
    const m = Math.min(module || 0.33, room / (enc.width + 20));
    if (it.id && m >= 0.19) body += barsSvg(it.id, { x: p, y: barTop, h: barH, module: m, quiet: 10 });
    else if (it.id) warn = 'barcode_too_small';
    body += line(barTop + barH * 0.7, it.id, fs2, true, 'end', W - p);
  } catch { warn = 'barcode_bad_text'; body += line(barTop + barH * 0.7, it.id, fs2, true, 'end', W - p); }
  const clip = `cl${Math.round(x * 100)}_${Math.round(y * 100)}`;   // i18n-ignore (an SVG id)
  return {
    svg: `<g transform="translate(${r3(x)} ${r3(y)})" data-label="${esc(it.id)}"><clipPath id="${clip}"><rect width="${r3(W)}" height="${r3(H)}"/></clipPath>` +
      `<rect width="${r3(W)}" height="${r3(H)}" fill="none" stroke="#bbb" stroke-width="0.1" data-outline="1"/><g clip-path="url(#${clip})">${body}</g></g>`,
    warn,
  };
}

export function labelSheets(items, template, { startAt = 0, module = 0.33 } = {}) {
  const T = typeof template === 'string' ? TEMPLATES[template] : template;
  if (!T) throw new Error('labels: no template ' + template);   // i18n-ignore (for developers)
  const per = T.cols * T.rows, pages = [], warnings = [];
  let slots = [];
  const flush = () => {
    if (!slots.length) return;
    pages.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${T.page.w}mm" height="${T.page.h}mm" viewBox="0 0 ${T.page.w} ${T.page.h}" font-family="Arial, Helvetica, sans-serif" data-page="${pages.length + 1}"><rect width="${T.page.w}" height="${T.page.h}" fill="#fff"/>${slots.join('')}</svg>`);
    slots = [];
  };
  let pos = Math.max(0, Math.min(per - 1, Math.floor(startAt) || 0));
  for (const it of items) {
    const c = pos % T.cols, r = Math.floor(pos / T.cols);
    const x = T.left + c * (T.label.w + T.gapX), y = T.top + r * (T.label.h + T.gapY);
    const { svg, warn } = labelSvg(it, x, y, T.label, { module });
    slots.push(svg);
    if (warn) warnings.push({ code: warn, id: it.id });
    pos++;
    if (pos >= per) { flush(); pos = 0; }
  }
  flush();
  return { pages, perPage: per, count: items.length, warnings };
}

export function labelsHtml(pages, { title = 'Labels', template = 'a4-24' } = {}) {
  const T = typeof template === 'string' ? TEMPLATES[template] : template;
  const size = T ? `${T.page.w}mm ${T.page.h}mm` : 'auto';   // i18n-ignore (CSS)
  return '<!doctype html>\n<html><head><meta charset="utf-8"><title>' + esc(title) + '</title><style>@page{size:' + size + ';margin:0}' +
    'html,body{margin:0;padding:0;background:#fff}.page{break-after:page;page-break-after:always;line-height:0}.page:last-child{break-after:auto;page-break-after:auto}' +
    'svg{display:block}</style></head><body>\n' + pages.map((p) => '<div class="page">' + p + '</div>').join('\n') + '\n</body></html>\n';
}
