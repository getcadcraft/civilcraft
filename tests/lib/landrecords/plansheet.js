/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plansheet.js — the parcel plan on one sheet, for marking up (0.11 LR.16): a vector PDF of the lots, the buildings and the numbered notes at
 * a round scale, the place of every note on that paper, and the way back from the paper to the drawing. DOM-free; Node-tested.
 *
 * MarkupCraft opens the PDF (handed over or opened) and reads the notes from a BCF file: a topic that names the sheet's file is placed at
 * its camera's spot in metres of paper. That is the only contract used here, and it is MarkupCraft's own (its bcf-read.js): this file writes
 * no BCF (the host's BCF writer does) and knows no app.
 *
 *   SCALES · PAPER { w, h } (A3 landscape, points)
 *   planSheet({ title, sub, parcels: [{ name, ring }], buildings: [{ ring }], notes: [{ n, x, y }], unitM }) → { ok, bytes: Uint8Array, scale (1:N),
 *       map: { a, bx, by } (paper point = a × drawing + b), page: { w, h } } | { ok: false, why: 'empty' }
 *   toPaper(map, x, y) → [pt, pt] · toDrawing(map, px, py) → { x, y } · PT_M (metres in a point)
 *   latin(text) → text a standard PDF font can show (letters outside Latin-1 lose their marks: ğ → g, ş → s, ı → i; anything else → ?)
 *   matchReturn(topics, notes, map, { tolPt }) → { updates: [{ id, status?, comments: [{ date, author, text }] }], adds: [{ title, text, status, x, y, comments }], unplaced }
 *     topics: [{ title, description, status, comments, paper: { x, y } (metres of paper) | null }]   as read back from a marked-up set
 *     notes:  [{ id, title, status, x, y, comments: [text] }]                                        the notes that were sent
 *     A returning topic is the note it lies on (within tolPt on paper) when its words still carry that note's title; else it is a new note at
 *     its place on the plan. A topic with no place on the sheet is counted as unplaced and left out: where it belongs is not known.
 */
export const PT_M = 0.0254 / 72;
export const PAPER = { w: 1190.55, h: 841.89 };
export const SCALES = [20, 50, 100, 200, 250, 500, 1000, 1250, 2000, 2500, 5000, 10000, 20000, 25000, 50000, 100000, 200000, 500000, 1000000];
const MARGIN = 42, HEAD = 64;

const FOLD = { 'ı': 'i', 'İ': 'I', 'ł': 'l', 'Ł': 'L', 'đ': 'd', 'Đ': 'D', 'ø': 'ø', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', '…': '...', '²': '²', '›': '>' };
export function latin(text) {
  let out = '';
  for (const ch of String(text ?? '')) {
    const c = FOLD[ch] ?? ch;
    if ([...c].every((x) => x.codePointAt(0) <= 0xff && x.codePointAt(0) >= 0x20)) { out += c; continue; }
    const base = ch.normalize('NFKD').replace(/[̀-ͯ]/g, '');
    out += base && [...base].every((x) => x.codePointAt(0) <= 0xff && x.codePointAt(0) >= 0x20) ? base : '?';
  }
  return out;
}
const pdfText = (s) => latin(s).replace(/[\\()]/g, (c) => '\\' + c);
const n2 = (v) => (Math.round(v * 100) / 100).toString();

export const toPaper = (map, x, y) => [map.a * x + map.bx, map.a * y + map.by];
export const toDrawing = (map, px, py) => ({ x: (px - map.bx) / map.a, y: (py - map.by) / map.a });

export function planSheet({ title = '', sub = '', parcels = [], buildings = [], notes = [], unitM = 1 } = {}) {
  const rings = [...parcels.map((p) => p.ring), ...buildings.map((b) => b.ring)].filter((r) => Array.isArray(r) && r.length >= 3);
  if (!rings.length) return { ok: false, why: 'empty' };
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of rings) for (const p of r) { if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y; }
  for (const q of notes) { if (q.x < x0) x0 = q.x; if (q.x > x1) x1 = q.x; if (q.y < y0) y0 = q.y; if (q.y > y1) y1 = q.y; }
  const W = PAPER.w - 2 * MARGIN, H = PAPER.h - 2 * MARGIN - HEAD, wm = Math.max(1e-9, (x1 - x0) * unitM), hm = Math.max(1e-9, (y1 - y0) * unitM);
  const need = Math.max(wm / (W * PT_M), hm / (H * PT_M)), scale = SCALES.find((s) => s >= need) || Math.ceil(need / 1e6) * 1e6;
  const a = unitM / (scale * PT_M);   // points per drawing unit
  const map = { a, bx: MARGIN + (W - (x1 - x0) * a) / 2 - x0 * a, by: MARGIN + (H - (y1 - y0) * a) / 2 - y0 * a };
  const P = (p) => { const [u, v] = toPaper(map, p.x, p.y); return n2(u) + ' ' + n2(v); };
  const C = [];
  const text = (x, y, size, s, centre = false) => { const t = pdfText(s); if (!t) return; const w = centre ? t.length * size * 0.25 : 0; C.push('BT /F1 ' + size + ' Tf ' + n2(x - w) + ' ' + n2(y) + ' Td (' + t + ') Tj ET'); };
  const path = (r, close = true) => { C.push(P(r[0]) + ' m'); for (let i = 1; i < r.length; i++) C.push(P(r[i]) + ' l'); C.push(close ? 'h S' : 'S'); };
  // the frame and the head
  C.push('0.5 w 0 G', n2(MARGIN / 2) + ' ' + n2(MARGIN / 2) + ' ' + n2(PAPER.w - MARGIN) + ' ' + n2(PAPER.h - MARGIN) + ' re S');
  text(MARGIN, PAPER.h - MARGIN - 6, 15, String(title).slice(0, 110));
  text(MARGIN, PAPER.h - MARGIN - 24, 9, String(sub).slice(0, 200));
  text(MARGIN, PAPER.h - MARGIN - 38, 9, '1:' + scale.toLocaleString('en-US') + '   North is up   A3');
  // a scale bar of a round length, and north
  const barM = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 50000].reverse().find((m) => m / (scale * PT_M) <= 170) || 1, barPt = barM / (scale * PT_M), bx = PAPER.w - MARGIN - 190, by = PAPER.h - MARGIN - 30;
  C.push('1 w', n2(bx) + ' ' + n2(by) + ' m ' + n2(bx + barPt) + ' ' + n2(by) + ' l S', n2(bx) + ' ' + n2(by - 3) + ' m ' + n2(bx) + ' ' + n2(by + 3) + ' l S', n2(bx + barPt) + ' ' + n2(by - 3) + ' m ' + n2(bx + barPt) + ' ' + n2(by + 3) + ' l S');
  text(bx, by + 6, 8, barM.toLocaleString('en-US') + ' m');
  const nx = PAPER.w - MARGIN - 8, ny = PAPER.h - MARGIN - 44;
  C.push(n2(nx) + ' ' + n2(ny) + ' m ' + n2(nx) + ' ' + n2(ny + 30) + ' l S', n2(nx - 4) + ' ' + n2(ny + 22) + ' m ' + n2(nx) + ' ' + n2(ny + 30) + ' l ' + n2(nx + 4) + ' ' + n2(ny + 22) + ' l S');
  text(nx - 3, ny + 33, 9, 'N');
  // buildings (thin, grey), lots (black) with their names, notes (numbered)
  C.push('0.5 w 0.45 G'); for (const b of buildings) if (b.ring && b.ring.length >= 3) path(b.ring);
  C.push('1 w 0 G');
  for (const p of parcels) {
    if (!p.ring || p.ring.length < 3) continue; path(p.ring);
    let cx = 0, cy = 0; for (const q of p.ring) { cx += q.x; cy += q.y; } const [u, v] = toPaper(map, cx / p.ring.length, cy / p.ring.length);
    text(u, v - 3, 9, String(p.name || '').slice(0, 40), true);
  }
  C.push('0.8 w');
  for (const q of notes) { const [u, v] = toPaper(map, q.x, q.y); C.push(n2(u - 5) + ' ' + n2(v) + ' m ' + n2(u + 5) + ' ' + n2(v) + ' l S', n2(u) + ' ' + n2(v - 5) + ' m ' + n2(u) + ' ' + n2(v + 5) + ' l S'); text(u + 6, v + 4, 8, String(q.n)); }
  const stream = C.join('\n') + '\n';
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PAPER.w + ' ' + PAPER.h + '] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    '<< /Length ' + stream.length + ' >>\nstream\n' + stream + 'endstream', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Title (' + pdfText(String(title).slice(0, 120)) + ') /Creator (CadCraft Land records) >>'];
  let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'; const at = [];
  objs.forEach((o, i) => { at.push(out.length); out += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; });
  const xref = out.length;
  out += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' + at.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('') + 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R /Info 6 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';
  const bytes = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
  return { ok: true, bytes, scale, map, page: { w: PAPER.w, h: PAPER.h } };
}

const lines = (s) => String(s ?? '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
export function matchReturn(topics, notes, map, { tolPt = 14 } = {}) {
  const updates = [], adds = [], used = new Set(); let unplaced = 0;
  for (const t of Array.isArray(topics) ? topics : []) {
    const pp = t && t.paper && Number.isFinite(t.paper.x) && Number.isFinite(t.paper.y) ? [t.paper.x / PT_M, t.paper.y / PT_M] : null;
    const words = new Set([...lines(t.title), ...lines(t.description)].map((x) => x.toLowerCase()));
    let best = null, bestD = Infinity;
    for (const n of notes) {
      if (used.has(n.id) || !words.has(String(n.title).trim().toLowerCase())) continue;
      const [u, v] = toPaper(map, n.x, n.y), d = pp ? Math.hypot(pp[0] - u, pp[1] - v) : Infinity;
      if ((pp ? d <= tolPt : true) && d < bestD) { best = n; bestD = d; }
    }
    if (!best && !pp) { const same = notes.filter((n) => !used.has(n.id) && words.has(String(n.title).trim().toLowerCase())); if (same.length === 1) best = same[0]; }
    if (best) {
      used.add(best.id);
      const have = new Set((best.comments || []).map((c) => String(c).trim())), fresh = (t.comments || []).filter((c) => c && c.text && !have.has(String(c.text).trim()));
      if (fresh.length || (t.status && t.status !== best.status)) updates.push({ id: best.id, ...(t.status && t.status !== best.status ? { status: t.status } : {}), comments: fresh });
      continue;
    }
    if (!pp || pp[0] < 0 || pp[1] < 0 || pp[0] > PAPER.w || pp[1] > PAPER.h) { unplaced++; continue; }
    const body = lines(t.description), head = body[0] || lines(t.title)[0] || 'Note', at = toDrawing(map, pp[0], pp[1]);
    adds.push({ title: head.slice(0, 200), text: body.slice(1).join('\n').slice(0, 4000), status: t.status || 'open', x: at.x, y: at.y, comments: t.comments || [] });
  }
  return { updates, adds, unplaced };
}
