/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-pdf.js — the frame analysis report as a PDF 1.4 (0.6 LC.4): report tables (frame-report.js) on A4 or Letter
 * landscape pages, carried over as many pages as they need, every page titled and numbered. Written by hand, no
 * library, no compression (text only: a few kB a page). Helvetica and Helvetica-Bold in WinAnsiEncoding; a character
 * outside Windows-1252 prints "?" and is counted (`missing`). DOM-free, imports nothing.
 *
 *   reportPdf(tables, { title, sub, paper: 'a4' | 'letter', page: (n, of) => text, continued }) → { bytes, pages, missing }
 *
 * Widths are Helvetica's (the AFM table BimCraft's model-pdf.js uses: Adobe's Core 14 metrics, ASCII 32–126; other
 * characters count as a digit, bold as 1.05 × regular), so columns fit their contents and numbers line up on the right.
 */
const HW = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
const PAPER = { a4: [297, 210], letter: [279.4, 215.9] };
const K = 72 / 25.4;
// Windows-1252 bytes 0x80–0x9F that differ from Latin-1
const CP = { '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87, 'ˆ': 0x88, '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '˜': 0x98, '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f };
const SUB = { '⁴': '4', '−': '-', '≤': '<=', '≥': '>=', 'Δ': 'D', 'φ': 'phi', '√': 'sqrt' };

export function textWidth(s, size, bold = false) {
  let w = 0;
  for (const ch of String(s)) { const c = ch.charCodeAt(0); w += c >= 32 && c <= 126 ? HW[c - 32] : 556; }
  return w / 1000 * size * (bold ? 1.05 : 1);
}

function lit(s, miss) {
  let out = '';
  for (let ch of String(s)) {
    if (SUB[ch]) ch = SUB[ch];
    for (const c of ch) {
      let code = CP[c] ?? c.codePointAt(0);
      if (code > 255 || (code >= 0x80 && code <= 0x9f && !CP[c])) { code = 63; miss.n++; }
      if (code === 40 || code === 41 || code === 92) out += '\\' + c;
      else if (code < 32 || code > 126) out += '\\' + code.toString(8).padStart(3, '0');
      else out += c;
    }
  }
  return '(' + out + ')';
}
const n = (v) => { const s = (Math.abs(v) < 5e-5 ? 0 : v).toFixed(3); return s.replace(/\.?0+$/, '') || '0'; };

export function reportPdf(tables, { title = '', sub = '', paper = 'a4', page = (i, of) => i + ' / ' + of, continued = '' } = {}) {
  const [W, H] = PAPER[paper] || PAPER.a4;
  const miss = { n: 0 };
  const pages = [];
  let ops = null, y = 0;
  const left = 15, right = W - 15, top = H - 24, bottom = 16, size = 2.6, line = 4.2;
  const text = (s, x, yy, { sz = size, bold = false, align = 'left' } = {}) => {
    const w = textWidth(s, sz, bold);
    const x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
    // i18n-ignore: PDF operators
    ops.push(`BT /${bold ? 'F2' : 'F1'} ${n(sz * K)} Tf ${n(x0 * K)} ${n(yy * K)} Td ${lit(s, miss)} Tj ET`);
  };
  const rule = (x0, x1, yy, w = 0.2) => ops.push(`${n(w * K)} w ${n(x0 * K)} ${n(yy * K)} m ${n(x1 * K)} ${n(yy * K)} l S`);
  const newPage = () => {
    ops = [];
    pages.push(ops);
    text(title, left, H - 14, { sz: 4.2, bold: true });
    if (sub) text(sub, right, H - 14, { sz: 2.6, align: 'right' });
    rule(left, right, H - 17, 0.35);
    y = top;
  };
  /** Wraps a long cell into lines no wider than `max` mm. */
  const wrap = (s, max, bold) => {
    const words = String(s).split(/\s+/), out = [];
    let cur = '';
    for (const w of words) { const nx = cur ? cur + ' ' + w : w; if (cur && textWidth(nx, size, bold) > max) { out.push(cur); cur = w; } else cur = nx; }
    if (cur || !out.length) out.push(cur);
    return out;
  };
  newPage();
  for (const tb of tables) {
    const num = new Set(tb.numeric || []);
    const cols = tb.head.length;
    let widths = tb.head.map((h, c) => Math.max(textWidth(h, size, true), ...tb.rows.map((r) => textWidth(r[c] ?? '', size))) + 3.5);
    const avail = right - left;
    const total = widths.reduce((a, b) => a + b, 0);
    if (total > avail) {   // the widest text column wraps; numbers never do
      const c = widths.reduce((b, w, i) => (!num.has(i) && w > widths[b] ? i : b), widths.findIndex((_, i) => !num.has(i)));
      if (c >= 0) widths[c] = Math.max(30, widths[c] - (total - avail));
    }
    const xs = []; let x = left;
    for (const w of widths) { xs.push(x); x += w; }
    const head = (cont) => {
      text(tb.title + (cont && continued ? ' ' + continued : ''), left, y, { sz: 3.2, bold: true });
      y -= line + 0.8;
      tb.head.forEach((h, i) => text(h, num.has(i) ? xs[i] + widths[i] - 3.5 : xs[i], y, { bold: true, align: num.has(i) ? 'right' : 'left' }));
      rule(left, Math.min(right, x), y - 1.3);
      y -= line;
    };
    if (y - 3 * line < bottom) newPage();
    head(false);
    for (const r of tb.rows) {
      const cells = Array.from({ length: cols }, (_, i) => (num.has(i) ? [String(r[i] ?? '')] : wrap(r[i] ?? '', widths[i] - 3.5, false)));
      const hgt = Math.max(...cells.map((c) => c.length));
      if (y - (hgt - 1) * line < bottom) { newPage(); head(true); }
      cells.forEach((c, i) => c.forEach((s, k) => text(s, num.has(i) ? xs[i] + widths[i] - 3.5 : xs[i], y - k * line, { align: num.has(i) ? 'right' : 'left' })));
      y -= hgt * line;
    }
    y -= line;
  }
  pages.forEach((ops2, i) => { ops = ops2; text(page(i + 1, pages.length), right, 9, { sz: 2.2, align: 'right' }); });
  // assemble: catalog, pages, fonts, one content stream per page
  const objs = [];
  const add = (s) => { objs.push(s); return objs.length; };
  const catalog = add(''), pagesObj = add('');
  const f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const kids = [];
  for (const ops2 of pages) {
    const body = '0 0 0 RG 0 0 0 rg\n' + ops2.join('\n');
    const content = add(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`);
    kids.push(add(`<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${n(W * K)} ${n(H * K)}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${content} 0 R >>`));
  }
  objs[catalog - 1] = `<< /Type /Catalog /Pages ${pagesObj} 0 R >>`;
  objs[pagesObj - 1] = `<< /Type /Pages /Kids [${kids.map((k) => k + ' 0 R').join(' ')}] /Count ${kids.length} >>`;
  const info = add(`<< /Title ${lit(title, miss)} /Producer (CadCraft) >>`);
  let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
  const offs = [];
  objs.forEach((s, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${s}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('');
  out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
  return { bytes, pages: pages.length, missing: miss.n };
}
