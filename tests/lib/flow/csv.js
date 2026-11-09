/* SPDX-License-Identifier: Apache-2.0 */
/**
 * csv.js — the small CSV reading the order files and the measured-line files share (0.9 TW.15, TW.12). DOM-free, no imports.
 *   readRecord(text, i, delim) → { cells, next } | { badQuote: true }    one record from text[i]; quoted cells may hold the delimiter, a line break and "" for a quote
 *   parseClock('6:05:30')      → seconds after midnight | null
 *   number('1.5e3')            → a finite number | NaN (strict: no spaces inside, no 0x, no Infinity)
 *   formatClock(seconds)       → 'h:mm:ss'
 */
/** One CSV record starting at text[i]; returns { cells, next } or { badQuote }. Quoted cells may hold the delimiter and "" for a quote. */
export function readRecord(text, i, delim) {
  const cells = [];
  let cell = '', q = false, any = false;
  for (; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c;
    } else if (c === '"' && cell === '' && !any) { q = true; any = true; }
    else if (c === delim) { cells.push(cell); cell = ''; any = false; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; i++; cells.push(cell); return { cells, next: i }; }
    else { cell += c; any = true; }
  }
  if (q) return { badQuote: true };
  cells.push(cell);
  return { cells, next: text.length };
}

export function parseClock(s) {
  const m = /^(\d{1,3}):([0-5]\d)(?::([0-5]\d(?:\.\d+)?))?$/.exec(s.trim());
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + (m[3] ? Number(m[3]) : 0) : null;
}

export function number(s) {
  const t = s.trim();
  return /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(t) ? Number(t) : NaN;
}

export function formatClock(s) {
  const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = Math.floor(s % 60);
  return `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}
