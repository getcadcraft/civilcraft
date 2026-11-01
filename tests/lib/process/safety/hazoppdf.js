/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hazoppdf.js — the HAZOP / What-If worksheet as a PDF (0.8 CH.14, chem-draw_PART_4). DOM-free, no imports, no library: PDF 1.4 written by hand with the Core 14 font
 * Helvetica in WinAnsiEncoding (a character outside Windows-1252 prints "?"), landscape pages, the title and the disclaimers first, then the worksheet as a table whose header
 * repeats on every page, then the actions. Text widths use a per-class estimate (narrow, regular, wide), so a long word is cut at the column edge rather than overflowing.
 *
 *   toPdf(rep, { paper: 'a4' | 'letter', footer? }) → { bytes: Uint8Array, pages, missing }      rep = hazop.report(...)
 */
import { toSheets } from './hazop.js';

const PAPER = { a4: [841.89, 595.28], letter: [792, 612] };
const NARROW = new Set('iljtfI.,:;\'|!()[] '), WIDE = new Set('mwMW@%'), CAPS = /[A-Z0-9]/;
const width = (s, size) => { let w = 0; for (const c of String(s)) w += (NARROW.has(c) ? 0.26 : WIDE.has(c) ? 0.85 : CAPS.test(c) ? 0.62 : 0.5) * size; return w; };
const SUB = { '−': '-', '≤': '<=', '≥': '>=', '→': '->', '–': '-', '—': '-', '‘': "'", '’': "'", '“': '"', '”': '"', '…': '...', ' ': ' ' };
function lit(s, miss) {
  let out = '';
  for (let ch of String(s ?? '')) {
    ch = SUB[ch] ?? ch; for (const c of ch) {
      const code = c.codePointAt(0);
      if (code < 32 || code > 255) { out += '?'; miss.n++; } else if (code === 40 || code === 41 || code === 92) out += '\\' + c; else if (code > 126) out += '\\' + code.toString(8).padStart(3, '0'); else out += c;
    }
  }
  return out;
}
function wrap(text, w, size) {
  const lines = []; let cur = '';
  for (const word of String(text ?? '').split(/\s+/)) {
    if (!word) continue;
    let t = cur ? cur + ' ' + word : word;
    if (width(t, size) <= w) { cur = t; continue; }
    if (cur) lines.push(cur);
    cur = word; while (width(cur, size) > w && cur.length > 1) { let k = cur.length - 1; while (k > 1 && width(cur.slice(0, k), size) > w) k--; lines.push(cur.slice(0, k)); cur = cur.slice(k); }
  }
  if (cur) lines.push(cur); return lines.length ? lines : [''];
}

export function toPdf(rep, { paper = 'a4', footer = '' } = {}) {
  const [W, H] = PAPER[paper] || PAPER.a4, M = 36, miss = { n: 0 }, pages = [];
  let cur = null, y = 0;
  const newPage = () => { cur = []; pages.push(cur); y = H - M; };
  const text = (x, yy, s, size = 8, bold = false) => cur.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x.toFixed(2)} ${yy.toFixed(2)} Td (${lit(s, miss)}) Tj ET`);
  const rule = (x1, yy, x2) => cur.push(`0.5 w ${x1.toFixed(2)} ${yy.toFixed(2)} m ${x2.toFixed(2)} ${yy.toFixed(2)} l S`);
  newPage();
  text(M, y, rep.title, 16, true); y -= 20;
  for (const d of rep.disclaimers || []) for (const l of wrap(d, W - 2 * M, 9)) { text(M, y, l, 9, true); y -= 12; }
  const meta = `${rep.method === 'whatif' ? 'What-If' : 'HAZOP'}, ${rep.date || ''}. Team: ${(rep.team || []).join(', ')}. Risk matrix: ${rep.matrix}. Rows: ${rep.summary.rows} (${rep.summary.accepted} accepted, ${rep.summary.notAccepted} not accepted).`;
  for (const l of wrap(meta, W - 2 * M, 9)) { text(M, y, l, 9); y -= 12; }
  y -= 6;
  const sheets = toSheets(rep), table = (head, rows, colW, size = 7) => {
    const sum = colW.reduce((a, b) => a + b, 0), cw = colW.map((c) => (c / sum) * (W - 2 * M)), lh = size + 2;
    const drawRow = (cells, bold) => {
      const lines = cells.map((c, i) => wrap(c, cw[i] - 4, size)), n = Math.max(...lines.map((l) => l.length));
      if (y - n * lh < M + 14) { newPage(); drawRow(head, true); }
      let x = M; lines.forEach((l, i) => { l.forEach((s, k) => text(x + 2, y - size - k * lh, s, size, bold)); x += cw[i]; });
      y -= n * lh + 3; rule(M, y + 1.5, W - M);
    };
    drawRow(head, true); for (const r of rows) drawRow(r, false);
  };
  const [head, ...rows] = sheets.Worksheet; table(head, rows, [9, 5, 8, 8, 12, 14, 14, 14, 3, 3, 5, 14, 9, 7]);
  y -= 12; if (y < M + 60) newPage(); text(M, y, 'Actions', 12, true); y -= 16;
  const [ah, ...ar] = sheets.Actions; if (ar.length) table(ah, ar, [6, 6, 40, 12, 8, 8, 10, 10]); else { text(M, y, 'No actions yet.', 9); y -= 12; }
  // assemble
  const objs = []; const add = (s) => { objs.push(s); return objs.length; };
  add('<< /Type /Catalog /Pages 2 0 R >>'); add('PAGES'); const f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'), f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const kids = [];
  pages.forEach((ops, i) => {
    const foot = `BT /F1 7 Tf ${M} 20 Td (${lit(footer || rep.title, miss)}) Tj ET BT /F1 7 Tf ${W - M - 40} 20 Td (${i + 1} / ${pages.length}) Tj ET`, body = ops.join('\n') + '\n' + foot;
    const c = add(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`), p = add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Contents ${c} 0 R /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> >>`); kids.push(p + ' 0 R');
  });
  objs[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${kids.length} >>`;
  let out = '%PDF-1.4\n', offs = [];
  objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = out.length; out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const bytes = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
  return { bytes, pages: pages.length, missing: miss.n };
}
