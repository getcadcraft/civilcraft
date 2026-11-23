/* SPDX-License-Identifier: Apache-2.0 */
/**
 * md-blocks.js — Markdown → the blocks doc-pdf.js draws. Shared copy of BimCraft's doc-template.js parser (SU.889). DOM-free.
 */
/** Inline Markdown: **bold**, *italic* / _italic_, `code`, \ escapes. */
export function inline(s) {
  const runs = [];
  let b = false, i = false, buf = '';
  const flush = () => { if (buf) { const r = { s: buf }; if (b) r.b = true; if (i) r.i = true; runs.push(r); buf = ''; } };
  for (let k = 0; k < s.length; k++) {
    const c = s[k];
    if (c === '\\' && k + 1 < s.length && /[\\*_`|#[\]{}()+\-.!>~]/.test(s[k + 1])) { buf += s[++k]; continue; }
    if (c === '`') { const e = s.indexOf('`', k + 1); if (e > k) { flush(); runs.push({ s: s.slice(k + 1, e), code: true }); k = e; continue; } }
    if (c === '*' && s[k + 1] === '*') { flush(); b = !b; k++; continue; }
    if (c === '*' || (c === '_' && (k === 0 || /\W/.test(s[k - 1]) || i))) { flush(); i = !i; continue; }
    buf += c;
  }
  flush();
  return runs;
}
export const plainText = (runs) => runs.map((r) => r.s).join('');
/** Split a table line on | that is not escaped. */
function cells(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const out = [];
  let cur = '';
  for (let k = 0; k < s.length; k++) {
    if (s[k] === '\\' && k + 1 < s.length) { cur += s[k] + s[k + 1]; k++; continue; }
    if (s[k] === '|') { out.push(cur.trim()); cur = ''; continue; }
    cur += s[k];
  }
  out.push(cur.trim());
  return out;
}
export function parseMarkdown(md) {
  const lines = String(md ?? '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let para = [];
  const flush = () => { if (para.length) { blocks.push({ t: 'p', runs: inline(para.join(' ')) }); para = []; } };
  for (let k = 0; k < lines.length; k++) {
    const line = lines[k];
    const t = line.trim();
    if (!t) { flush(); continue; }
    let m;
    if ((m = /^(#{1,4})\s+(.*)$/.exec(t))) { flush(); blocks.push({ t: 'h', level: m[1].length, runs: inline(m[2].replace(/\s+#+\s*$/, '')) }); continue; }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { flush(); blocks.push({ t: 'hr' }); continue; }
    if (t.startsWith('|') && k + 1 < lines.length && /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/.test(lines[k + 1].trim())) {
      flush();
      const head = cells(t);
      const align = cells(lines[k + 1]).map((c) => (/^:-+:$/.test(c) ? 'c' : /-:$/.test(c) ? 'r' : 'l'));
      const rows = [];
      k += 2;
      while (k < lines.length && lines[k].trim().startsWith('|')) { rows.push(cells(lines[k])); k++; }
      k--;
      const n = head.length;
      blocks.push({ t: 'table', head: head.map(inline), align: Array.from({ length: n }, (_, j) => align[j] || 'l'), rows: rows.map((r) => Array.from({ length: n }, (_, j) => inline(r[j] ?? ''))) });
      continue;
    }
    if ((m = /^[-*+]\s+(.*)$/.exec(t)) || (m = /^\d+[.)]\s+(.*)$/.exec(t))) {
      flush();
      const kind = /^\d/.test(t) ? 'ol' : 'ul';
      const last = blocks[blocks.length - 1];
      if (last && last.t === kind && last.open) last.items.push(inline(m[1]));
      else blocks.push({ t: kind, items: [inline(m[1])], open: true });
      continue;
    }
    if ((m = /^>\s?(.*)$/.exec(t))) { flush(); blocks.push({ t: 'quote', runs: inline(m[1]) }); continue; }
    const last = blocks[blocks.length - 1];
    if (!para.length && last && (last.t === 'ul' || last.t === 'ol') && last.open && /^\s{2,}/.test(line)) { last.items[last.items.length - 1].push({ s: ' ' }, ...inline(t)); continue; }
    para.push(t);
  }
  flush();
  for (const b of blocks) delete b.open;
  return blocks;
}
