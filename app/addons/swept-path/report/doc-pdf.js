/* SPDX-License-Identifier: Apache-2.0 */
/**
 * doc-pdf.js — a document's blocks (md-blocks.js parseMarkdown) as a PDF 1.4. Shared copy of BimCraft's doc-pdf.js (SU.889) for hosts with no app of their own. Written by hand
 * like BimCraft's other PDFs (model-pdf.js, res-sheets.js setPdf, frame/frame-pdf.js): no library, no compression, the Core 14 fonts
 * Helvetica / -Bold / -Oblique / -BoldOblique and Courier in WinAnsiEncoding (a character outside Windows-1252 prints "?" and is
 * counted in `missing`). Those writers draw sheets and landscape report tables; a specification is portrait text that flows over
 * pages, so the flow lives here and the measuring is frame-pdf.js's textWidth (the same Helvetica metrics). DOM-free, Node-tested.
 *
 *   docPdf(blocks, { title, paper: 'a4' | 'letter', page: (n, of) => text, footer, producer }) → { bytes, pages, missing, rows }
 *   docPdfFonts(blocks, { …, fonts: [font (pdf-font.js readTtf)] }) → Promise of the same: characters outside WinAnsi print in the first font that has them, embedded and subset;
 *     Arabic is joined and right-to-left text is ordered (bidi.js). Those stretches print upright and regular (the fonts have one face).
 *   fontKinds(text) → the font kinds this text needs from FONT_FILES ('latin', 'rtl', 'thai', 'cjk'), in the order to try them
 *   rows = every table body row [{ table, row, page (0-based), x0, y0, x1, y1 (points) }], for page links
 * Headings, paragraphs with bold / italic / code runs (wrapped at words), bullet and numbered lists, quotes, rules, and tables
 * (columns sized to their contents, cells wrapped, the header row repeated on each page, numbers right-aligned). Footer on every
 * page: `footer` left, "n / of" right.
 */
// Helvetica advance widths, characters 32-126 (the Core 14 AFM)
const HW = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
export function textWidth(s, size, bold = false) {
  let w = 0;
  for (const ch of String(s)) { const c = ch.charCodeAt(0); w += c >= 32 && c <= 126 ? HW[c - 32] : 556; }
  return w / 1000 * size * (bold ? 1.05 : 1);
}

import { FontUse, fontObjects } from './pdf-font.js';
import { shapeArabic, bidiLine, isRtlCode } from './bidi.js';

const PAPER = { a4: [210, 297], letter: [215.9, 279.4] };
const K = 72 / 25.4;
const CP = { '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87, 'ˆ': 0x88, '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '˜': 0x98, '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f };
const SUB = { '−': '-', '≤': '<=', '≥': '>=', '→': '->', ' ': ' ' };
const num = (v) => { const s = (Math.abs(v) < 5e-5 ? 0 : v).toFixed(3); return s.replace(/\.?0+$/, '') || '0'; };
function lit(s, miss) {
  let out = '';
  for (let ch of String(s)) {
    if (SUB[ch]) ch = SUB[ch];
    for (const c of ch) {
      let code = CP[c] ?? c.codePointAt(0);
      if (code > 255 || (code >= 0x80 && code <= 0x9f && !CP[c]) || code < 32) { code = 63; miss.n++; }
      if (code === 40 || code === 41 || code === 92) out += '\\' + String.fromCharCode(code);
      else if (code > 126) out += '\\' + code.toString(8).padStart(3, '0');
      else out += String.fromCharCode(code);
    }
  }
  return '(' + out + ')';
}
// Helvetica-Bold advance widths (1/1000 em), characters 32–126 (Adobe's Core 14 AFM); oblique faces share the upright widths
const HBW = [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584];
const boldWidth = (s, size) => { let w = 0; for (const ch of String(s)) { const c = ch.charCodeAt(0); w += c >= 32 && c <= 126 ? HBW[c - 32] : 611; } return w / 1000 * size; };
const fontOf = (r) => (r.code ? 'F5' : r.b && r.i ? 'F4' : r.b ? 'F2' : r.i ? 'F3' : 'F1');
const baseWidth = (s, size, r) => (r.code ? [...String(s)].length * 0.6 * size : r.b ? boldWidth(s, size) : textWidth(s, size));

/** Files of the fonts a page can call on, under assets/vendor. */
export const FONT_FILES = { latin: 'liberation-sans/current/LiberationSans-Regular.ttf', rtl: 'rtl-sans/current/DejaVuSans.ttf', thai: 'thai-sans/current/NotoSansThai-VF.ttf', cjk: 'cjk-sans/current/CadCraftCJKSans-Regular.ttf' };
const isCore = (ch) => { const c = ch.codePointAt(0); return (c >= 32 && c <= 126) || (c >= 0xA0 && c <= 0xFF) || CP[ch] !== undefined || SUB[ch] !== undefined; };
export function fontKinds(text) {
  const need = new Set();
  for (const ch of String(text)) {
    if (isCore(ch)) continue;
    const c = ch.codePointAt(0);
    if (c < 32) continue;
    if (isRtlCode(c)) need.add('rtl');
    else if (c >= 0x0E00 && c <= 0x0E7F) need.add('thai');
    else if ((c >= 0x3000 && c <= 0x30FF) || (c >= 0x3400 && c <= 0x9FFF) || (c >= 0xAC00 && c <= 0xD7AF) || (c >= 0x1100 && c <= 0x11FF) || (c >= 0xF900 && c <= 0xFAFF) || (c >= 0xFF00 && c <= 0xFFEF)) need.add('cjk');
    else if (c <= 0x052F || (c >= 0x1E00 && c <= 0x20CF)) need.add('latin');
    else need.add('rtl');   // Armenian, Georgian, symbols: DejaVu Sans has many of them
  }
  return ['latin', 'rtl', 'thai', 'cjk'].filter((k) => need.has(k));
}
const shapeBlocks = (blocks) => {
  const R = (runs) => runs.map((r) => ({ ...r, s: shapeArabic(r.s) }));
  return blocks.map((b) => {
    if (b.t === 'table') return { ...b, head: b.head.map(R), rows: b.rows.map((r) => r.map(R)) };
    if (b.items) return { ...b, items: b.items.map(R) };
    return b.runs ? { ...b, runs: R(b.runs) } : b;
  });
};

export function docPdf(blocks, opts = {}) {
  const r = layout(blocks, opts);
  return { bytes: assemble(r.pages, r.W, r.H, opts.title || '', r.miss, opts.producer || 'CadCraft', []), pages: r.pages.length, missing: r.miss.n, rows: r.rows };
}
export async function docPdfFonts(blocks, { fonts = [], ...opts } = {}) {
  if (!fonts.length) return docPdf(blocks, opts);
  const extras = fonts.map((font) => ({ font, use: new FontUse(font) }));
  const r = layout(shapeBlocks(blocks), { ...opts, extras });
  const first = 9 + 2 * r.pages.length, objs = [], res = [];
  let n = first;
  for (let i = 0; i < extras.length; i++) {
    if (!extras[i].use.order.length) continue;
    const f = await fontObjects(extras[i].use, n);
    res.push('/X' + i + ' ' + n + ' 0 R');
    objs.push(...f.objects);
    n += f.objects.length;
  }
  return { bytes: assemble(r.pages, r.W, r.H, opts.title || '', r.miss, opts.producer || 'CadCraft', objs, res.join(' ')), pages: r.pages.length, missing: r.miss.n, rows: r.rows };
}

function layout(blocks, { paper = 'a4', page = (n, of) => n + ' / ' + of, footer = '', extras = [] } = {}) {
  const [W, H] = PAPER[paper] || PAPER.a4;
  const miss = { n: 0 }, rows = [];
  let tableNo = -1;
  /* stretches of one string by the font that prints them: f -1 = the built-in faces */
  const segs = (s) => {
    if (!extras.length || /^[\x20-\x7e]*$/.test(s)) return null;
    const out = []; let cur = null;
    for (const ch of s) {
      const f = isCore(ch) ? -1 : extras.findIndex((e) => e.font.glyph(ch.codePointAt(0)));
      if (!cur || cur.f !== f) out.push(cur = { s: '', f });
      cur.s += ch;
    }
    return out;
  };
  const widthOf = (s, size, r) => {
    const sg = segs(String(s));
    if (!sg) return baseWidth(s, size, r);
    return sg.reduce((w, g) => {
      if (g.f < 0) return w + baseWidth(g.s, size, r);
      const ft = extras[g.f].font;
      let u = 0; for (const ch of g.s) u += ft.advance(ft.glyph(ch.codePointAt(0)));
      return w + u / ft.unitsPerEm * size;
    }, 0);
  };
  const left = 20, right = W - 20, top = H - 20, bottom = 22;
  const pages = [];
  let ops = null, y = 0;
  const newPage = () => { ops = []; pages.push(ops); y = top; };
  newPage();
  const ensure = (h) => { if (y - h < bottom) newPage(); };
  const putCore = (s, x, yy, size, r) => ops.push(`BT /${fontOf(r)} ${num(size * K)} Tf ${num(x * K)} ${num(yy * K)} Td ${lit(s, miss)} Tj ET`);   // i18n-ignore: PDF operators
  const put = (s, x, yy, size, r) => {
    const sg = segs(String(s));
    if (!sg) { putCore(s, x, yy, size, r); return; }
    let at = x;
    for (const g of sg) {
      if (g.f < 0) { if (g.s.trim()) putCore(g.s, at, yy, size, r); }
      else {
        const e = extras[g.f].use.encode(g.s);
        miss.n += e.missing;
        ops.push(`BT /X${g.f} ${num(size * K)} Tf ${num(at * K)} ${num(yy * K)} Td ${e.ops || '<' + e.hex + '> Tj'} ET`);   // i18n-ignore: PDF operators
      }
      at += widthOf(g.s, size, r);
    }
  };
  const rule = (x0, x1, yy, wd = 0.2) => ops.push(`${num(wd * K)} w ${num(x0 * K)} ${num(yy * K)} m ${num(x1 * K)} ${num(yy * K)} l S`);   // i18n-ignore: PDF operators

  /** Runs → lines of pieces [{ s, r, w }] no wider than width (mm), font size in mm. Words never split unless longer than a line. */
  function wrap(runs, width, size, base = {}) {
    const lines = [[]];
    let x = 0;
    const space = (r) => widthOf(' ', size, r);
    for (const r0 of runs) {
      const r = { ...base, ...r0 };
      const parts = String(r.s).split(/(\s+)/);
      for (const p of parts) {
        if (!p) continue;
        if (/^\s+$/.test(p)) { if (x > 0) { lines[lines.length - 1].push({ s: ' ', r, w: space(r) }); x += space(r); } continue; }
        let word = p, wd = widthOf(word, size, r);
        if (x + wd > width && x > 0) {
          const ln = lines[lines.length - 1];
          while (ln.length && ln[ln.length - 1].s === ' ') { x -= ln.pop().w; }
          lines.push([]); x = 0;
        }
        while (wd > width && word.length > 1) {   // a word longer than the line: cut it
          let n = word.length;
          while (n > 1 && widthOf(word.slice(0, n), size, r) > width - x) n--;
          lines[lines.length - 1].push({ s: word.slice(0, n), r, w: widthOf(word.slice(0, n), size, r) });
          lines.push([]); x = 0;
          word = word.slice(n); wd = widthOf(word, size, r);
        }
        lines[lines.length - 1].push({ s: word, r, w: wd });
        x += wd;
      }
    }
    return lines.filter((l, i) => l.length || i === 0);
  }
  const lineW = (l) => l.reduce((s, p) => s + p.w, 0);
  function drawLine(l, x, yy, size, align = 'l', width = 0) {
    if (extras.length) { const v = bidiLine(l, (s, r) => widthOf(s, size, r)); if (v) { l = v.line; if (v.rtl && align === 'l' && width) align = 'r'; } }
    let at = align === 'r' ? x + width - lineW(l) : align === 'c' ? x + (width - lineW(l)) / 2 : x;
    // one string per stretch in the same font, spaces inside it: the viewer spaces the words and text copies out whole
    let run = null;
    const flushRun = () => { if (run && run.s.trim()) put(run.s.replace(/\s+$/, ''), run.x, yy, size, run.r); run = null; };
    for (const p of l) {
      if (run && fontOf(run.r) === fontOf(p.r)) run.s += p.s;
      else { flushRun(); run = { s: p.s, x: at, r: p.r }; }
      at += p.w;
    }
    flushRun();
  }
  function flow(runs, { size = 3.6, lead = 1.45, x = left, width = right - left, base = {}, before = 0, after = 2.2, marker = null } = {}) {
    const lines = wrap(runs, width, size, base);
    const lh = size * lead;
    y -= before;
    lines.forEach((l, i) => {
      ensure(lh);
      y -= lh;
      const rtl = extras.length && bidiLine(lines[0], () => 0)?.rtl;
      if (i === 0 && marker) put(marker, rtl ? x + width + 2 : x - 5, y, size, base);
      drawLine(l, x, y, size, 'l', width);
    });
    y -= after;
  }
  const SIZES = { 1: 7.2, 2: 5.6, 3: 4.6, 4: 4.0 };
  function tableBlock(b) {
    const size = 3.1, pad = 1.4, lh = size * 1.35;
    tableNo++;
    const n = b.head.length, full = right - left;
    const runsW = (runs, bold) => runs.reduce((s, r) => s + widthOf(r.s, size, bold ? { ...r, b: true } : r), 0);
    const longestWord = (runs, bold) => Math.max(0, ...runs.flatMap((r) => String(r.s).split(/\s+/).map((wd) => widthOf(wd, size, bold ? { ...r, b: true } : r))));
    const col = (j) => [[b.head[j], true], ...b.rows.map((r) => [r[j], false])];
    const natural = Array.from({ length: n }, (_, j) => Math.max(...col(j).map(([runs, bold]) => runsW(runs, bold))) + 2 * pad);
    const least = Array.from({ length: n }, (_, j) => Math.min(natural[j], Math.max(...col(j).map(([runs, bold]) => longestWord(runs, bold))) + 2 * pad));
    const sum = (a) => a.reduce((s, c) => s + c, 0);
    let cols = natural.map((c) => c + 0.3);   // a hair over, so a word measured to fit is never cut by rounding
    if (sum(cols) > full) {
      // columns that fit a fair share keep their natural width; the rest share what is left, each keeping its longest word whole
      const fixed = new Array(n).fill(false);
      let room = full, left = n, changed = true;
      while (changed && left) {
        changed = false;
        for (let j = 0; j < n; j++) if (!fixed[j] && cols[j] <= room / left) { fixed[j] = true; room -= cols[j]; left--; changed = true; }
      }
      const open = cols.map((_, j) => j).filter((j) => !fixed[j]);
      const lo = open.map((j) => least[j] + 0.3), hi = open.map((j) => cols[j]);
      if (sum(lo) >= room) open.forEach((j, i) => { cols[j] = Math.max(lo[i] * room / sum(lo), 1); });
      else { const extra = room - sum(lo), want = sum(hi) - sum(lo); open.forEach((j, i) => { cols[j] = lo[i] + (want > 0 ? extra * (hi[i] - lo[i]) / want : 0); }); }
      const t2 = sum(cols);
      if (t2 > full) cols = cols.map((c) => c * full / t2);   // the longest words alone are wider than the page
    }
    const width = cols.reduce((a, c) => a + c, 0);
    const rowLines = (row, bold) => row.map((runs, j) => wrap(runs, cols[j] - 2 * pad, size, bold ? { b: true } : {}));
    const drawRow = (lines, bold) => {
      const h = Math.max(...lines.map((l) => l.length)) * lh + pad;
      let x = left;
      lines.forEach((ls, j) => { ls.forEach((l, i) => drawLine(l, x + pad, y - pad / 2 - (i + 1) * lh + size * 0.3, size, bold ? 'l' : b.align[j], cols[j] - 2 * pad)); x += cols[j]; });
      y -= h;
      rule(left, left + width, y, bold ? 0.35 : 0.12);
    };
    const headLines = rowLines(b.head, true);
    const headH = Math.max(...headLines.map((l) => l.length)) * lh + pad;
    y -= 1;
    ensure(headH + lh * 2);
    rule(left, left + width, y, 0.35);
    drawRow(headLines, true);
    for (const [rowNo, r] of b.rows.entries()) {
      const ls = rowLines(r, false);
      const h = Math.max(...ls.map((l) => l.length)) * lh + pad;
      if (y - h < bottom) { newPage(); rule(left, left + width, y, 0.35); drawRow(headLines, true); }
      const top = y;
      drawRow(ls, false);
      rows.push({ table: tableNo, row: rowNo, page: pages.length - 1, x0: left * K, y0: y * K, x1: (left + width) * K, y1: top * K });
    }
    y -= 3;
  }
  for (const b of blocks) {
    if (b.t === 'h') { const s = SIZES[b.level] || 4; ensure(s * 3.2); flow(b.runs, { size: s, lead: 1.25, base: { b: true }, before: b.level <= 2 ? 3 : 2, after: b.level === 1 ? 3 : 1.6 }); if (b.level === 1) { rule(left, right, y + 1.2, 0.35); y -= 1.5; } }
    else if (b.t === 'p') flow(b.runs);
    else if (b.t === 'quote') flow(b.runs, { x: left + 6, width: right - left - 6, base: { i: true } });
    else if (b.t === 'ul' || b.t === 'ol') { b.items.forEach((it, i) => flow(it, { x: left + 7, width: right - left - 7, after: 0.8, marker: b.t === 'ul' ? '•' : (i + 1) + '.' })); y -= 1.4; }
    else if (b.t === 'hr') { ensure(4); y -= 2; rule(left, right, y, 0.25); y -= 2; }
    else if (b.t === 'table') tableBlock(b);
  }
  // footers, now that the page count is known
  const of = pages.length;
  pages.forEach((p, i) => {
    ops = p;
    rule(left, right, bottom - 6, 0.2);
    if (footer) put(footer, left, bottom - 10, 2.6, {});
    const t = page(i + 1, of);
    put(t, right - textWidth(t, 2.6), bottom - 10, 2.6, {});
  });
  return { pages, W, H, miss, rows };
}

function assemble(pages, W, H, title, miss, producer, extraObjects, extraFonts = '') {
  const enc = (s) => Uint8Array.from(String(s), (c) => c.charCodeAt(0) & 0xff);
  const n = pages.length;
  const fonts = ['Helvetica', 'Helvetica-Bold', 'Helvetica-Oblique', 'Helvetica-BoldOblique', 'Courier'];
  // 1 catalog, 2 pages, 3–7 fonts, 8 info, then page + contents per page
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [' + pages.map((_, i) => (9 + 2 * i) + ' 0 R').join(' ') + '] /Count ' + n + ' >>'];   // i18n-ignore: PDF syntax
  for (const f of fonts) objs.push(`<< /Type /Font /Subtype /Type1 /BaseFont /${f} /Encoding /WinAnsiEncoding >>`);   // i18n-ignore: PDF syntax
  objs.push('<< /Title ' + lit(title, miss) + ' /Producer (' + producer + ') >>');   // i18n-ignore: PDF metadata (the program's name)
  const res = '/Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R /F5 7 0 R' + (extraFonts ? ' ' + extraFonts : '') + ' >>';   // i18n-ignore: PDF syntax
  const streams = {};
  pages.forEach((p, i) => {
    objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(W * K)} ${num(H * K)}] /Resources << ${res} >> /Contents ${10 + 2 * i} 0 R >>`);   // i18n-ignore: PDF syntax
    objs.push(null); streams[objs.length - 1] = enc(p.join('\n'));
  });
  for (const o of extraObjects) objs.push(o.parts);   // the embedded fonts: numbered straight after the pages (docPdfFonts)
  const parts = [], offs = [];
  let size = 0;
  const putb = (b) => { parts.push(b); size += b.length; };
  putb(enc('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'));   // i18n-ignore: PDF syntax
  objs.forEach((o, i) => {
    offs.push(size);
    if (Array.isArray(o)) { putb(enc(`${i + 1} 0 obj\n` + o[0])); putb(o[1]); putb(enc(o[2] + '\nendobj\n')); }
    else if (o === null) { const b = streams[i]; putb(enc(`${i + 1} 0 obj\n<< /Length ${b.length} >>\nstream\n`)); putb(b); putb(enc('\nendstream\nendobj\n')); }   // i18n-ignore: PDF syntax
    else putb(enc(`${i + 1} 0 obj\n${o}\nendobj\n`));
  });
  const xref = size;
  putb(enc(`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info 8 0 R >>\nstartxref\n${xref}\n%%EOF\n`));   // i18n-ignore: PDF syntax
  const out = new Uint8Array(size);
  let p = 0;
  for (const b of parts) { out.set(b, p); p += b.length; }
  return out;
}
