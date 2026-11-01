/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors are codes (the app words them). */
/**
 * iges.js — cc-nurbs (0.8 SU.747b, session `nurbs`): IGES for exactly what S1 makes: entity 126 (rational B-spline curve) and
 * entity 128 (rational B-spline surface), written and read back. DOM-free. No other session owns IGES.
 *
 * Written from the published specification only: Initial Graphics Exchange Specification (IGES) 5.3 (U.S. Product Data
 * Association, 1996), § 2.2 file structure (Start, Global, Directory Entry, Parameter Data, Terminate sections, 80-column
 * records), § 2.2.4.3 Global parameters, § 2.2.4.4 Directory Entry fields, § 4.23 entity 126, § 4.24 entity 128. No IGES
 * library's code read.
 *
 *   writeIges(doc, { name, author, org, time }) → text (units mm: Global unit flag 2)
 *   readIges(text) → doc (every 126 and 128 entity; units converted to mm) — NurbsError nurbs.err.iges_*
 */
import * as C from './curve.js';
import * as S from './surface.js';
import * as D from './doc.js';

const { fail } = C;
export const MAX_BYTES = 200 * 1024 * 1024;

const num = (x) => {
  if (!Number.isFinite(x)) fail('nurbs.err.iges_number');
  if (Number.isInteger(x) && Math.abs(x) < 1e15) return x + '.';
  return String(x).toUpperCase().replace('E', 'D');
};
const holl = (s) => { const a = String(s).replace(/[^\x20-\x7e]/g, '?'); return a.length ? a.length + 'H' + a : ''; };

/** Free-format parameters cut into records of `width` columns at delimiters. */
function wrap(tokens, width) {
  const out = [];
  let line = '';
  for (let k = 0; k < tokens.length; k++) {
    let tk = tokens[k] + (k === tokens.length - 1 ? ';' : ',');
    while (tk.length > width) { // a very long token (a Hollerith name): split it as it stands
      if (line) { out.push(line); line = ''; }
      out.push(tk.slice(0, width)); tk = tk.slice(width);
    }
    if (line.length + tk.length > width) { out.push(line); line = ''; }
    line += tk;
  }
  if (line) out.push(line);
  return out;
}

const rec = (body, letter, n) => body.padEnd(72, ' ').slice(0, 72) + letter + String(n).padStart(7, '0');
const f8 = (x) => String(x).padStart(8, ' ').slice(-8);

export function writeIges(doc, { name = 'nurbs', author = '', org = '', time = null } = {}) {
  const d = D.cleanDoc(doc);
  const when = (time || new Date().toISOString()).replace(/[-:]/g, '').replace('T', '.').slice(0, 15);
  const start = ['CadCraft cc-nurbs patch set: B-spline curves (126) and untrimmed B-spline surfaces (128).'];
  let maxc = 1;
  for (const it of d.items) for (const q of it.kind === 'curve' ? it.curve.cvs : it.surface.cvs.flat()) for (const x of q) maxc = Math.max(maxc, Math.abs(x));
  const global = [
    '1H,', '1H;', holl('CadCraft'), holl(name + '.igs'), holl('CadCraft cc-nurbs'), holl('cc-nurbs 0.8'), '32', '38', '6', '308', '15', holl(name),
    '1.', '2', '2HMM', '1', '1.', holl(when), '1.D-6', num(maxc), holl(author), holl(org), '11', '0', holl(when),
  ];
  const ents = [];
  for (const it of d.items) {
    if (it.kind === 'curve') {
      const c = it.curve, K = c.cvs.length - 1, M = c.deg, w = c.w || c.cvs.map(() => 1);
      const [a, b] = C.domain(c);
      // planar: every control point in one plane (PROP1), with its normal
      const P = [126, K, M, 0, 0, c.w ? 0 : 1, 0, ...c.knots, ...w, ...c.cvs.flat(), a, b, 0, 0, 0];
      ents.push({ type: 126, form: 0, label: it.id, params: P, ints: 7 });
    } else {
      const s = it.surface, K1 = s.cvs.length - 1, K2 = s.cvs[0].length - 1;
      const W = [], X = [];
      for (let j = 0; j <= K2; j++) for (let i = 0; i <= K1; i++) { W.push(s.w ? s.w[i][j] : 1); X.push(...s.cvs[i][j]); }
      const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s);
      ents.push({ type: 128, form: 0, label: it.id, ints: 10, params: [128, K1, K2, s.degU, s.degV, 0, 0, s.w ? 0 : 1, 0, 0, ...s.knotsU, ...s.knotsV, ...W, ...X, ua, ub, va, vb] });
    }
  }
  const dir = [], par = [];
  ents.forEach((e, k) => {
    const de = 2 * k + 1;
    const toks = e.params.map((x, i) => (i < e.ints ? String(x) : num(x)));
    const lines = wrap(toks, 64);
    const first = par.length + 1;
    lines.forEach((ln) => par.push(ln.padEnd(64, ' ') + ' ' + String(de).padStart(7, ' ')));
    const lbl = String(e.label).slice(0, 8);
    dir.push(f8(e.type) + f8(first) + f8(0) + f8(0) + f8(0) + f8(0) + f8(0) + f8(0) + '00000000');
    dir.push(f8(e.type) + f8(0) + f8(0) + f8(lines.length) + f8(e.form) + f8('') + f8('') + lbl.padStart(8, ' ') + f8(0));
  });
  const S1 = start.map((t, i) => rec(t, 'S', i + 1));
  const G1 = wrap(global, 72).map((t, i) => rec(t, 'G', i + 1));
  const D1 = dir.map((t, i) => rec(t, 'D', i + 1));
  const P1 = par.map((t, i) => rec(t, 'P', i + 1));
  const T1 = [rec('S' + String(S1.length).padStart(7, '0') + 'G' + String(G1.length).padStart(7, '0') + 'D' + String(D1.length).padStart(7, '0') + 'P' + String(P1.length).padStart(7, '0'), 'T', 1)];
  return [...S1, ...G1, ...D1, ...P1, ...T1].join('\n') + '\n';
}

// ------------------------------------------------------------------------------------------------ reading

function freeParams(text, pd, rd) {
  // split free-format parameters, keeping Hollerith strings whole
  const out = [];
  let i = 0, cur = '';
  while (i < text.length) {
    const ch = text[i];
    if (/[0-9]/.test(ch) && !cur.trim()) {
      let j = i; while (j < text.length && /[0-9]/.test(text[j])) j++;
      if (text[j] === 'H') { const n = +text.slice(i, j); out.push({ h: text.slice(j + 1, j + 1 + n) }); i = j + 1 + n; while (i < text.length && text[i] === ' ') i++; if (text[i] === pd || text[i] === rd) { if (text[i] === rd) return out; i++; } cur = ''; continue; }
    }
    if (ch === pd || ch === rd) { out.push(cur.trim()); cur = ''; if (ch === rd) return out; i++; continue; }
    cur += ch; i++;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const fnum = (s) => {
  if (typeof s !== 'string' || s === '') return 0;
  const v = +s.replace(/[Dd]/, 'E');
  if (!Number.isFinite(v)) fail('nurbs.err.iges_number');
  return v;
};

const UNITS = { 1: 25.4, 2: 1, 3: 25.4 * 12, 4: 1609344, 5: 1e6, 6: 1000, 7: 1e6, 8: 1e-3, 9: 1e-3, 10: 10, 11: 25.4e-6 };

export function readIges(text) {
  if (typeof text !== 'string') fail('nurbs.err.iges_not');
  if (text.length > MAX_BYTES) fail('nurbs.err.too_big');
  const lines = text.split(/\r?\n/).filter((l) => l.length >= 73);
  const sec = { S: [], G: [], D: [], P: [] };
  for (const l of lines) { const k = l[72]; if (sec[k]) sec[k].push(l.slice(0, 72)); }
  if (!sec.G.length || !sec.D.length) fail('nurbs.err.iges_not');
  const gtext = sec.G.join('');
  let pd = ',', rd = ';';
  if (/^1H./.test(gtext)) pd = gtext[2];
  const g0 = freeParams(gtext, pd, '\u0000');
  if (g0[1] && g0[1].h) rd = g0[1].h;
  const G = freeParams(gtext, pd, rd);
  const unitFlag = Math.round(fnum(typeof G[13] === 'string' ? G[13] : '2'));
  const scale = (UNITS[unitFlag] ?? 1) * (typeof G[12] === 'string' && G[12] ? 1 : 1);
  let doc = D.newDoc();
  for (let k = 0; k + 1 < sec.D.length; k += 2) {
    const a = sec.D[k], b = sec.D[k + 1];
    const type = +a.slice(0, 8), ptr = +a.slice(8, 16), cnt = +b.slice(24, 32), label = b.slice(56, 64).trim();
    if (type !== 126 && type !== 128) continue;
    if (!(ptr >= 1) || !(cnt >= 1) || ptr - 1 + cnt > sec.P.length) fail('nurbs.err.iges_pointer');
    const body = sec.P.slice(ptr - 1, ptr - 1 + cnt).map((l) => l.slice(0, 64)).join('');
    const P = freeParams(body, pd, rd).map((x) => (typeof x === 'string' ? x : '0'));
    if (+P[0] !== type) fail('nurbs.err.iges_entity');
    let at = 1;
    const take = (n) => { if (n < 0 || at + n > P.length || n > 5e6) fail('nurbs.err.iges_entity'); const o = P.slice(at, at + n).map(fnum); at += n; return o; };
    if (type === 126) {
      const [K, M, , , poly] = take(6);
      if (!Number.isInteger(K) || !Number.isInteger(M) || K < 1 || M < 1) fail('nurbs.err.iges_entity');
      const knots = take(K + M + 2), w = take(K + 1), xyz = take(3 * (K + 1));
      const cvs = []; for (let i = 0; i <= K; i++) cvs.push([xyz[3 * i] * scale, xyz[3 * i + 1] * scale, xyz[3 * i + 2] * scale]);
      const c = C.cleanCurve({ deg: M, knots, cvs, w: poly === 1 ? null : w });
      doc = D.add(doc, 'curve', c, { id: /^[A-Za-z0-9_.-]+$/.test(label) ? label : null }).doc;
    } else {
      const [K1, K2, M1, M2, , , poly] = take(9);
      if (![K1, K2, M1, M2].every((x) => Number.isInteger(x) && x >= 1)) fail('nurbs.err.iges_entity');
      if ((K1 + 1) * (K2 + 1) > 2e6) fail('nurbs.err.too_many', { max: 2e6 });
      const ku = take(K1 + M1 + 2), kv = take(K2 + M2 + 2), W = take((K1 + 1) * (K2 + 1)), X = take(3 * (K1 + 1) * (K2 + 1));
      const cvs = Array.from({ length: K1 + 1 }, () => new Array(K2 + 1)), w = Array.from({ length: K1 + 1 }, () => new Array(K2 + 1));
      let n = 0;
      for (let j = 0; j <= K2; j++) for (let i = 0; i <= K1; i++, n++) { cvs[i][j] = [X[3 * n] * scale, X[3 * n + 1] * scale, X[3 * n + 2] * scale]; w[i][j] = W[n]; }
      const s = S.cleanSurface({ degU: M1, degV: M2, knotsU: ku, knotsV: kv, cvs, w: poly === 1 ? null : w });
      doc = D.add(doc, 'surface', s, { id: /^[A-Za-z0-9_.-]+$/.test(label) ? label : null }).doc;
    }
  }
  if (!doc.items.length) fail('nurbs.err.iges_empty');
  return doc;
}
