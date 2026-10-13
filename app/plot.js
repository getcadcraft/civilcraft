/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plot.js — the plan on a sheet as a vector PDF, written by hand (adapted from CadCraft's plot.js:
 * its own copy). No DOM; bin/test-civilcraft.mjs runs it in Node.
 *
 *   PAPERS, scalesFor(units), fitScale(units, extents, paper)
 *   planSheet(scene, { extents, paper, landscape, scale, title, units, notes }) → sheet (mm)
 *   await toPdf(sheet, { mono }) → { bytes, report: { missing, size } }
 *   await toPdfPages(sheets, { mono, title }) → { bytes, report: { missing, size, pages } }   one PDF, a page per sheet (0.4 V15)
 * A sheet draws either one clipped view (clip, strokes, points, texts) or several: views: [{ clip, strokes, points, texts }]
 * (plan and profile on one page), then its chrome (frame, title) unclipped. A stroke may carry dash: [on, off] (mm).
 * 0.4 V8: a view may carry images: [{ jpeg (Uint8Array, baseline JPEG), pxW, pxH, x, y, w, h (mm on the page) }] drawn first
 * (under the linework, inside the clip) as /DCTDecode image XObjects. planSheet takes images: [{ jpeg, pxW, pxH, box }]
 * with box in project coordinates; sheetWindow(extents, { paper, landscape, scale }) = the drawing window's box in
 * project coordinates (what a map picture for the sheet should cover).
 * 0.4 V17: a view may carry fills: [{ color, pts }] (closed, non-zero) drawn after its images and before its strokes.
 *
 * A scale is { label, mmPerUnit }: engineering scales for feet (1" = 40' → 25.4/40 mm per foot) and
 * 1:n for metres (1000/n mm per metre). Lines are true vectors (arcs as Béziers), text is the PDF's
 * built-in Helvetica (WinAnsi); characters outside Windows-1252 print "?" and are counted.
 * Elevation bands and slope arrows are screen displays and are not plotted yet.
 */

import { t } from "./i18n.js";
import { CP1252, SUBST, charAdvance, advance } from './font.js';

export const PAPERS = [
  { key: 'letter', get name() { return t('plot.paper.letter'); }, w: 279.4, h: 215.9 },
  { key: 'tabloid', get name() { return t('plot.paper.tabloid'); }, w: 431.8, h: 279.4 },
  { key: 'ansi-d', get name() { return t('plot.paper.ansi-d'); }, w: 863.6, h: 558.8 },
  { key: 'arch-d', get name() { return t('plot.paper.arch-d'); }, w: 914.4, h: 609.6 },
  { key: 'a4', get name() { return t('plot.paper.a4'); }, w: 297, h: 210 },
  { key: 'a3', get name() { return t('plot.paper.a3'); }, w: 420, h: 297 },
  { key: 'a1', get name() { return t('plot.paper.a1'); }, w: 841, h: 594 },
];
export const paperBy = (k) => PAPERS.find((p) => p.key === k) || PAPERS[1];

export function scalesFor(units) {
  if (units === 'm') return [50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000].map((n) => ({ label: '1:' + n, mmPerUnit: 1000 / n }));
  return [5, 10, 20, 30, 40, 50, 60, 100, 200, 300, 400, 500, 1000].map((n) => ({ label: `1" = ${n}'`, mmPerUnit: 25.4 / n }));
}

export const MARGIN = 12, TITLE_H = 16;   // exported for pp-sheets.js (0.4 V15)

/** The largest standard scale at which the extents fit inside the sheet's drawing area. */
export function fitScale(units, ext, paper, landscape = true) {
  const { w, h } = orient(paper, landscape);
  const aw = w - 2 * MARGIN, ah = h - 2 * MARGIN - TITLE_H;
  const W = Math.max(ext.maxX - ext.minX, 1e-9), H = Math.max(ext.maxY - ext.minY, 1e-9);
  const list = scalesFor(units);
  for (const s of list.slice().sort((a, b) => b.mmPerUnit - a.mmPerUnit)) if (W * s.mmPerUnit <= aw && H * s.mmPerUnit <= ah) return s;
  return list[list.length - 1];
}
export function orient(paper, landscape) { return landscape ? { w: Math.max(paper.w, paper.h), h: Math.min(paper.w, paper.h) } : { w: Math.min(paper.w, paper.h), h: Math.max(paper.w, paper.h) }; }

export const WIDTH = { 'C-TOPO-MAJR': 0.35, 'C-TOPO-MINR': 0.13, 'C-TOPO-TINN': 0.09, 'C-ROAD-CNTR': 0.5, 'C-GRAD-PADS': 0.5, 'C-GRAD-DAYL': 0.35, 'C-GRAD-SLOP': 0.09, 'C-TOPO-BRKL': 0.25, 'C-STRM-PIPE': 0.5, 'C-STRM-STRC': 0.35, 'C-STRM-PROB': 0.5 };
export const RGB = { 1: '#c00000', 2: '#b09000', 3: '#008000', 4: '#007a8a', 5: '#1e48c8', 6: '#9a1f86', 7: '#000000', 8: '#808080', 30: '#c05000' };

/** 0.4 V8: the drawing window of planSheet (the frame above the title strip) in project coordinates. */
export function sheetWindow(extents, { paper = 'tabloid', landscape = true, scale }) {
  const P = orient(paperBy(paper), landscape);
  const frame = { x0: MARGIN, y0: MARGIN + TITLE_H, x1: P.w - MARGIN, y1: P.h - MARGIN };
  const s = scale.mmPerUnit, cx = (extents.minX + extents.maxX) / 2, cy = (extents.minY + extents.maxY) / 2;
  const hw = (frame.x1 - frame.x0) / 2 / s, hh = (frame.y1 - frame.y0) / 2 / s;
  return { minX: cx - hw, maxX: cx + hw, minY: cy - hh, maxY: cy + hh };
}

export function planSheet(scene, { extents, paper = 'tabloid', landscape = true, scale, title = t('plot.title'), units = 'ft', notes = [], hidden = new Set(), images = [] }) {
  const P = orient(paperBy(paper), landscape);
  const frame = { x0: MARGIN, y0: MARGIN + TITLE_H, x1: P.w - MARGIN, y1: P.h - MARGIN };
  const s = scale.mmPerUnit;
  const cx = (extents.minX + extents.maxX) / 2, cy = (extents.minY + extents.maxY) / 2;
  const ox = (frame.x0 + frame.x1) / 2 - cx * s, oy = (frame.y0 + frame.y1) / 2 - cy * s;
  const tx = (p) => ({ x: p.x * s + ox, y: p.y * s + oy });
  const layerAci = new Map(scene.layers.map((l) => [l.name, l.aci]));
  const strokes = [], texts = [], points = [];
  for (const it of scene.items) {
    if (hidden.has(it.layer)) continue;
    const color = RGB[layerAci.get(it.layer)] || '#000000', width = WIDTH[it.layer] || 0.18;
    if (it.kind === 'poly') strokes.push({ color, width, pts: it.pts.map(tx), closed: !!it.closed });
    else if (it.kind === 'arc') strokes.push({ color, width, arc: { ...tx(it.c), r: it.r * s, a0: it.a0, a1: it.a1 } });
    else if (it.kind === 'point') points.push({ color, ...tx(it) });
    else if (it.kind === 'text') texts.push({ color, ...tx(it), h: it.mm, rot: it.rot || 0, text: it.text, align: it.align, middle: it.middle });
  }
  // title strip and frame
  const ink = '#000000', chrome = [];
  chrome.push({ color: ink, width: 0.5, pts: [{ x: frame.x0, y: MARGIN }, { x: frame.x1, y: MARGIN }, { x: frame.x1, y: frame.y1 }, { x: frame.x0, y: frame.y1 }], closed: true });
  chrome.push({ color: ink, width: 0.35, pts: [{ x: frame.x0, y: frame.y0 }, { x: frame.x1, y: frame.y0 }] });
  const tt = [
    { color: ink, x: frame.x0 + 4, y: MARGIN + TITLE_H - 6, h: 4, rot: 0, text: title, align: 'left' },
    { color: ink, x: frame.x0 + 4, y: MARGIN + 3.5, h: 2.2, rot: 0, text: [t('plot.scale', { scale: scale.label }), ...notes].join('   ·   '), align: 'left' },
    { color: ink, x: frame.x1 - 4, y: MARGIN + 3.5, h: 2.2, rot: 0, text: t('plot.made', { date: new Date().toISOString().slice(0, 10) }), align: 'right' },
  ];
  // north arrow (plan north = up)
  const na = { x: frame.x1 - 12, y: frame.y1 - 20 };
  chrome.push({ color: ink, width: 0.35, pts: [{ x: na.x, y: na.y - 6 }, { x: na.x, y: na.y + 8 }] });
  chrome.push({ color: ink, width: 0.35, pts: [{ x: na.x - 3, y: na.y + 3 }, { x: na.x, y: na.y + 8 }, { x: na.x + 3, y: na.y + 3 }] });
  tt.push({ color: ink, x: na.x, y: na.y + 10, h: 3, rot: 0, text: 'N', align: 'center' });   // i18n-ignore: north arrow letter (symbol)
  // scale bar: 0 … a round length about 50 mm long
  const want = 50 / s, pow = Math.pow(10, Math.floor(Math.log10(want))), len = [1, 2, 5, 10].map((m) => m * pow).filter((v) => v <= want).pop() || pow;
  const sb = { x: frame.x1 - 4 - len * s, y: MARGIN + TITLE_H - 6 };
  chrome.push({ color: ink, width: 0.35, pts: [{ x: sb.x, y: sb.y + 1.5 }, { x: sb.x, y: sb.y }, { x: sb.x + len * s, y: sb.y }, { x: sb.x + len * s, y: sb.y + 1.5 }] });
  tt.push({ color: ink, x: sb.x, y: sb.y + 2.2, h: 2, rot: 0, text: '0', align: 'center' }, { color: ink, x: sb.x + len * s, y: sb.y + 2.2, h: 2, rot: 0, text: len + (units === 'm' ? ' m' : ' ft'), align: 'center' });
  // 0.4 V8: map pictures, placed by their box (project coordinates) on the sheet
  const imgs = images.filter((im) => im && im.jpeg && im.pxW > 0 && im.pxH > 0 && im.box).map((im) => { const a = tx({ x: im.box.minX, y: im.box.minY }), b = tx({ x: im.box.maxX, y: im.box.maxY }); return { jpeg: im.jpeg, pxW: im.pxW, pxH: im.pxH, x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y }; });
  return { w: P.w, h: P.h, name: title, clip: frame, strokes, points, texts, chrome, chromeTexts: tt, images: imgs };
}

// ---------------------------------------------------------------------------
// PDF

/** One page's content stream (uncompressed) and how many characters had no glyph. */
function pageContent(sheet, mono, imageNames = []) {
  const out = [];
  let img = 0;
  let missing = 0;
  const col = (c) => (mono ? '#000000' : c);
  out.push((72 / 25.4).toFixed(9) + ' 0 0 ' + (72 / 25.4).toFixed(9) + ' 0 0 cm', '1 J 1 j');
  const drawStroke = (st) => {
    out.push(rgb(col(st.color)) + ' RG ' + num(st.width) + ' w');
    if (st.dash) out.push('[' + st.dash.map(num).join(' ') + '] 0 d');
    if (st.arc) {
      const a = st.arc;
      out.push(num(a.x + a.r * Math.cos(a.a0)) + ' ' + num(a.y + a.r * Math.sin(a.a0)) + ' m');
      for (const c of arcBeziers(a.x, a.y, a.r, a.a0, a.a1 < a.a0 ? a.a1 + Math.PI * 2 : a.a1)) out.push(c.map(num).join(' ') + ' c');
    } else {
      st.pts.forEach((p, i) => out.push(num(p.x) + ' ' + num(p.y) + (i ? ' l' : ' m')));
      if (st.closed) out.push('h');
    }
    out.push('S');
    if (st.dash) out.push('[] 0 d');
  };
  const drawText = (t) => {
    const enc = winAnsi(t.text);
    missing += enc.missing;
    const w = enc.width / 1000 * t.h / 0.72, fs = t.h / 0.72;   // t.h = cap height ≈ 0.72 em for Helvetica
    const c = Math.cos(t.rot), s = Math.sin(t.rot);
    const lx = t.align === 'center' ? -w / 2 : t.align === 'right' ? -w : 0, ly = t.middle ? -t.h / 2 : 0;
    const x = t.x + lx * c - ly * s, y = t.y + lx * s + ly * c;
    // i18n-ignore: PDF operators
    out.push(rgb(col(t.color)) + ' rg BT /F1 1 Tf ' + [fs * c, fs * s, -fs * s, fs * c, x, y].map(num).join(' ') + ' Tm (' + enc.str + ') Tj ET');
  };
  for (const v of sheet.views || [sheet]) {
    out.push('q');
    const f = v.clip;
    out.push(num(f.x0) + ' ' + num(f.y0) + ' ' + num(f.x1 - f.x0) + ' ' + num(f.y1 - f.y0) + ' re W n');
    for (const im of v.images || []) out.push('q ' + [im.w, 0, 0, im.h, im.x, im.y].map(num).join(' ') + ' cm /' + imageNames[img++] + ' Do Q');   // 0.4 V8: under the linework
    for (const fl of v.fills || []) { if (fl.pts?.length < 3) continue; out.push(rgb(mono ? '#d9d9d9' : fl.color) + ' rg'); fl.pts.forEach((p, i) => out.push(num(p.x) + ' ' + num(p.y) + (i ? ' l' : ' m'))); out.push('h f'); }   // 0.4 V17
    for (const st of v.strokes) drawStroke(st);
    for (const p of v.points || []) { out.push(rgb(col(p.color)) + ' RG 0.18 w'); const k = 0.6; out.push(`${num(p.x - k)} ${num(p.y - k)} m ${num(p.x + k)} ${num(p.y + k)} l ${num(p.x - k)} ${num(p.y + k)} m ${num(p.x + k)} ${num(p.y - k)} l S`); }
    for (const t of v.texts || []) drawText(t);
    out.push('Q');
  }
  for (const st of sheet.chrome) drawStroke(st);
  for (const t of sheet.chromeTexts) drawText(t);
  return { content: new TextEncoder().encode(out.join('\n') + '\n'), missing };
}

const imagesOf = (sheet) => (sheet.views || [sheet]).flatMap((v) => v.images || []);
export async function toPdf(sheet, { mono = false } = {}) {
  const imgs = imagesOf(sheet);
  const { content, missing } = pageContent(sheet, mono, imgs.map((_, i) => 'Im' + (i + 1)));
  const packed = await deflate(content);
  const bytes = assemble([{ w: sheet.w, h: sheet.h, content: packed || content, flate: !!packed, images: imgs }], sheet.name);
  return { bytes, report: { missing, size: bytes.length, compressed: !!packed } };
}

/** Several sheets as the pages of one PDF (0.4 V15: plan and profile sheets). */
export async function toPdfPages(sheets, { mono = false, title = '' } = {}) {
  const pages = [];
  let missing = 0, compressed = true;
  for (const sh of sheets) {
    const imgs = imagesOf(sh);
    const pc = pageContent(sh, mono, imgs.map((_, i) => 'Im' + (i + 1)));
    missing += pc.missing;
    const packed = await deflate(pc.content);
    if (!packed) compressed = false;
    pages.push({ w: sh.w, h: sh.h, content: packed || pc.content, flate: !!packed, images: imgs });
  }
  const bytes = assemble(pages, title || sheets[0]?.name || '');
  return { bytes, report: { missing, size: bytes.length, compressed, pages: pages.length } };
}

/** Cubic Béziers for an arc from angle a to b, ≤ 90° each: [x1 y1 x2 y2 x3 y3]. */
export function arcBeziers(cx, cy, r, a, b) {
  const sweep = b - a, n = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 2) - 1e-9)), d = sweep / n, k = 4 / 3 * Math.tan(d / 4);
  const out = [];
  for (let i = 0; i < n; i++) {
    const t0 = a + d * i, t1 = t0 + d;
    const c0 = Math.cos(t0), s0 = Math.sin(t0), c1 = Math.cos(t1), s1 = Math.sin(t1);
    out.push([cx + r * (c0 - k * s0), cy + r * (s0 + k * c0), cx + r * (c1 + k * s1), cy + r * (s1 - k * c1), cx + r * c1, cy + r * s1]);
  }
  return out;
}

function num(v) {
  if (!Number.isFinite(v)) return '0';
  const s = (Math.abs(v) < 5e-5 ? 0 : v).toFixed(4);
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
}
function rgb(hex) {
  const h = hex.length === 4 ? hex.slice(1).split('').map((x) => x + x).join('') : hex.slice(1, 7);
  return [0, 2, 4].map((i) => num(parseInt(h.slice(i, i + 2), 16) / 255)).join(' ');
}

/** A string as an escaped PDF literal in WinAnsiEncoding, its width, and how many characters had no glyph. */
export function winAnsi(s) {
  let str = '', width = 0, missing = 0;
  for (let ch of String(s)) {
    ch = SUBST[ch] || ch;
    let code = ch.codePointAt(0);
    if (CP1252[ch] !== undefined) code = CP1252[ch];
    else if (code > 0xff || (code >= 0x7f && code < 0xa0) || code < 0x20) { code = 0x3f; missing++; width += 556; }
    if (code === 0x28 || code === 0x29 || code === 0x5c) str += '\\' + String.fromCharCode(code);
    else if (code >= 0x20 && code < 0x7f) str += String.fromCharCode(code);
    else str += '\\' + code.toString(8).padStart(3, '0');
    if (code !== 0x3f || ch === '?') width += charAdvance(ch);
  }
  return { str, width, missing };
}
export { advance };

async function deflate(bytes) {
  if (typeof CompressionStream === 'undefined') return null;
  try {
    const cs = new CompressionStream('deflate');
    const stream = new Blob([bytes]).stream().pipeThrough(cs);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch { return null; }
}

function assemble(pages, title) {
  const enc = new TextEncoder();
  const parts = [], offsets = [];
  let size = 0;
  const push = (b) => { const u = typeof b === 'string' ? enc.encode(b) : b; parts.push(u); size += u.length; };
  const obj = (n, body) => { offsets[n] = size; push(n + ' 0 obj\n'); for (const b of [].concat(body)) push(b); push('\nendobj\n'); };
  const pt = (mm) => num(mm * 72 / 25.4);
  const now = new Date(), pad = (x) => String(x).padStart(2, '0');
  const date = 'D:' + now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds()) + 'Z';
  const pdfText = (s) => '(' + winAnsi(String(s || '')).str + ')';
  // objects: 1 catalog, 2 pages, 3 font, 4 info, then a page + its content per sheet (5, 6), (7, 8) …, then the images
  const pageObj = (i) => 5 + 2 * i;
  let nextImg = 5 + 2 * pages.length;
  const imgObjs = pages.map((pg) => (pg.images || []).map(() => nextImg++));
  push('%PDF-1.4\n');
  push(Uint8Array.from([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [' + pages.map((_, i) => pageObj(i) + ' 0 R').join(' ') + '] /Count ' + pages.length + ' >>');
  obj(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  obj(4, '<< /Title ' + pdfText(title) + ' /Producer (CivilCraft) /Creator (CivilCraft) /CreationDate (' + date + ') >>');
  pages.forEach((pg, i) => {
    const xo = imgObjs[i].length ? ' /XObject << ' + imgObjs[i].map((n, k) => '/Im' + (k + 1) + ' ' + n + ' 0 R').join(' ') + ' >>' : '';
    obj(pageObj(i), '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pt(pg.w) + ' ' + pt(pg.h) + '] /Resources << /Font << /F1 3 0 R >>' + xo + ' >> /Contents ' + (pageObj(i) + 1) + ' 0 R >>');
    obj(pageObj(i) + 1, ['<< /Length ' + pg.content.length + (pg.flate ? ' /Filter /FlateDecode' : '') + ' >>\nstream\n', pg.content, '\nendstream']);
  });
  pages.forEach((pg, i) => (pg.images || []).forEach((im, k) => obj(imgObjs[i][k], ['<< /Type /XObject /Subtype /Image /Width ' + im.pxW + ' /Height ' + im.pxH + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + im.jpeg.length + ' >>\nstream\n', im.jpeg, '\nendstream'])));
  const n = nextImg;
  const xref = size;
  push('xref\n0 ' + n + '\n0000000000 65535 f \n' + offsets.slice(1).map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join(''));
  push('trailer\n<< /Size ' + n + ' /Root 1 0 R /Info 4 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
  const outB = new Uint8Array(size);
  let at = 0;
  for (const p of parts) { outB.set(p, at); at += p.length; }
  return outB;
}
