/* SPDX-License-Identifier: Apache-2.0 */
/**
 * desckeys.js — description keys and line codes (0.4 V16). No DOM; the Node test drives it (bin/test-civilcraft-codes.mjs).
 *
 * A survey point's description starts with its field code ("EP", "EP1", "TOPO"); after it may come a line code and words.
 *   description key   { code: 'EP*', group: 'EP', use: 'points'|'breakline'|'off'|'', label: 'Edge of pavement' }
 *     `code` is matched against the point's code, case-blind, * = any run of characters, ? = one; the first key that
 *     matches wins. `group` names the point group the point joins (empty = the code itself), `use` sets that group's use
 *     the first time the group appears (empty = leave it to the user), `label` is the long description shown for it.
 *   line codes        { on, begin: ['B', …], end: ['E', …], close: ['C', …] }: a token right after the code (or any token,
 *     see `anywhere`) that is one of these makes the point begin a new line, end the line after it, or close the line back
 *     to its first point. Points of one code join in point-number order; EP1 and EP2 are separate lines, both in group EP.
 *
 *   DEFAULT_LINE_CODES · cleanDescKeys(list) · cleanLineCodes(obj)   (untrusted: the project file and the dialog)
 *   parseDesc(desc, lineCodes) → { code, ctrl: 'begin'|'end'|'close'|null, rest }
 *   compileKeys(keys) → (code) → key | null           wildcards turned into anchored regexes (special characters escaped)
 *   grouper(keys) → (point) → group name               what project.groups() and the surface use
 *   figures(points, { keys, lineCodes, only }) → [{ code, group, pts: [point], closed, coded }]   (coded: the code used a line code)
 *       every line made by line codes (codes that use no line code join all their points, as before); `only` = a set
 *       of group names to keep
 *   keyStats(points, keys) → [{ key index, n }]        how many points each key catches (the dialog's live count)
 */

export const DEFAULT_LINE_CODES = { on: true, begin: ['B', 'BEG', 'START'], end: ['E', 'END'], close: ['C', 'CLO', 'CLOSE'] };
export const USES = ['points', 'breakline', 'off'];
const CTRL = /[\u0000-\u001f\u007f]/g;
const tok = (s, max) => String(s ?? '').replace(CTRL, '').trim().toUpperCase().slice(0, max);

export function cleanDescKeys(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const k of list.slice(0, 500)) {
    if (!k || typeof k !== 'object') continue;
    const code = tok(k.code, 40).replace(/\s+/g, '');
    if (!code || !/^[A-Z0-9*?_.\-/#]+$/.test(code)) continue;
    out.push({ code, group: tok(k.group, 40).replace(/\s+/g, ''), use: USES.includes(k.use) ? k.use : '', label: String(k.label ?? '').replace(CTRL, ' ').trim().slice(0, 120) });
  }
  return out;
}
export function cleanLineCodes(o) {
  if (!o || typeof o !== 'object') return { ...DEFAULT_LINE_CODES, begin: [...DEFAULT_LINE_CODES.begin], end: [...DEFAULT_LINE_CODES.end], close: [...DEFAULT_LINE_CODES.close] };
  const list = (v, d) => {
    const a = (Array.isArray(v) ? v : String(v ?? '').split(/[\s,;]+/)).map((x) => tok(x, 12)).filter((x) => /^[A-Z0-9_.\-]+$/.test(x));
    return a.length ? [...new Set(a)].slice(0, 10) : [...d];
  };
  const r = { on: o.on !== false, begin: list(o.begin, DEFAULT_LINE_CODES.begin), end: list(o.end, DEFAULT_LINE_CODES.end), close: list(o.close, DEFAULT_LINE_CODES.close) };
  // one token cannot mean two things: begin wins over end, end over close
  r.end = r.end.filter((x) => !r.begin.includes(x));
  r.close = r.close.filter((x) => !r.begin.includes(x) && !r.end.includes(x));
  return r;
}

export function parseDesc(desc, lc = DEFAULT_LINE_CODES) {
  const words = String(desc ?? '').trim().split(/\s+/).filter(Boolean);
  const code = words.length ? words[0].toUpperCase() : '';
  let ctrl = null, at = -1;
  if (lc?.on !== false && words.length > 1) {
    const w = words[1].toUpperCase();
    if (lc.begin.includes(w)) ctrl = 'begin'; else if (lc.end.includes(w)) ctrl = 'end'; else if (lc.close.includes(w)) ctrl = 'close';
    if (ctrl) at = 1;
  }
  return { code, ctrl, rest: words.filter((_, i) => i > 0 && i !== at).join(' ') };
}

export function compileKeys(keys) {
  const rx = (keys || []).map((k) => ({ k, re: new RegExp('^' + k.code.replace(/[.+^${}()|[\]\\\/#-]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i') }));
  return (code) => { for (const { k, re } of rx) if (re.test(code)) return k; return null; };
}

export function grouper(keys) {
  const match = compileKeys(keys);
  const cache = new Map();
  return (p) => {
    const code = String(p?.d ?? '').trim().split(/\s+/)[0]?.toUpperCase() || '';
    if (!code) return '(no description)';   // i18n-ignore (a stored group key: the same as points.js groupKey)
    let g = cache.get(code);
    if (g === undefined) { const k = match(code); g = k && k.group ? k.group : code; cache.set(code, g); }
    return g;
  };
}

const byNumber = (a, b) => {
  const na = Number(a.n), nb = Number(b.n);
  if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
  return String(a.n).localeCompare(String(b.n), 'en', { numeric: true });
};

export function figures(points, { keys = [], lineCodes = DEFAULT_LINE_CODES, only = null } = {}) {
  const groupOf = grouper(keys);
  const byCode = new Map();
  for (const p of points) {
    const d = parseDesc(p.d, lineCodes);
    if (!d.code) continue;
    const g = groupOf(p);
    if (only && !only.has(g)) continue;
    let e = byCode.get(d.code);
    if (!e) byCode.set(d.code, (e = { group: g, list: [] }));
    e.list.push({ p, ctrl: d.ctrl });
  }
  const out = [];
  for (const [code, { group, list }] of byCode) {
    list.sort((a, b) => byNumber(a.p, b.p));
    let cur = null;
    const coded = list.some((x) => x.ctrl);
    const flush = (closed = false) => { if (cur && cur.length >= 2) out.push({ code, group, pts: cur, closed: closed && cur.length >= 3, coded }); cur = null; };
    for (const { p, ctrl } of list) {
      if (ctrl === 'begin') { flush(); cur = [p]; continue; }
      if (!cur) cur = [];
      cur.push(p);
      if (ctrl === 'end') flush();
      else if (ctrl === 'close') flush(true);
    }
    flush();
  }
  return out;
}

export function keyStats(points, keys) {
  const match = compileKeys(keys), n = new Array((keys || []).length).fill(0), idx = new Map((keys || []).map((k, i) => [k, i]));
  for (const p of points) { const code = String(p?.d ?? '').trim().split(/\s+/)[0]; if (!code) continue; const k = match(code.toUpperCase()); if (k) n[idx.get(k)]++; }
  return n;
}
