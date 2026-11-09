/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors are codes (the app words them). */
/**
 * iges.js — cc-nurbs (0.8 SU.747b, session `nurbs`): IGES for what cc-nurbs makes: entity 126 (rational B-spline curve), entity
 * 128 (rational B-spline surface) and, since 0.9 DC.54 S2 (session `nurbs-09`), entity 144 (trimmed parametric surface) with its
 * boundaries as entity 142 (curve on a parametric surface: the loop in the patch's (u, v) plane as a degree-1 126 with z = 0, and the
 * same loop on the surface in model space), written and read back. Reading also takes a 142 whose (u, v) curve is a 102 (composite
 * curve) of 126 pieces, and a 142 with only the model-space curve (projected onto the surface). DOM-free. No other session owns IGES.
 *
 * Solids (0.9 SU.747c, session `nurbs-s3-09`, owner's order 2026-11-06): a solid whose faces pair up edge for edge (step.js shellOf) is written as
 * ONE entity 186 (manifold solid B-rep object) -> 514 form 1 (closed shell) -> 510 form 1 (faces, each over its own 128) -> 508 form 1 (loops of
 * edge uses) -> 504 form 1 (ONE edge list: a degree-1 126 per edge, vertex indexes) -> 502 form 1 (ONE vertex list); read back the same way as a
 * solid of the patch set. Written from IGES 5.3 § 4.49 (entity 186, pp. 197-200), § 4.143 (502, pp. 514-515), § 4.144 (504, pp. 516-517), § 4.145
 * (508, pp. 518-519), § 4.146 (510, pp. 520-521), § 4.147 (514, pp. 522-523); US PRO 1996, copyright: the PDF is NOT in refs/, it is cited
 * (http://www.uspro.org/documents/IGES5-3_forDownload.pdf, archived web.archive.org/web/20120821190122/ the same address). The spec marks these
 * entities 'not tested' (§ 1.9). Faces' loops are relative to the underlying surface's normal (the face entity knows no shell), the shell's
 * orientation flag per face says whether the face-use is turned; the parameter-space curves of an edge use are left out (K = 0, allowed).
 *
 * Written from the published specification only: Initial Graphics Exchange Specification (IGES) 5.3 (U.S. Product Data
 * Association, 1996), § 2.2 file structure (Start, Global, Directory Entry, Parameter Data, Terminate sections, 80-column
 * records), § 2.2.4.3 Global parameters, § 2.2.4.4 Directory Entry fields, § 4.5 entity 102, § 4.23 entity 126, § 4.24 entity 128,
 * § 4.31 entity 142, § 4.32 entity 144. No IGES library's code read.
 *
 *   writeIges(doc, { name, author, org, time }) → text (units mm: Global unit flag 2); a trimmed surface → 144 + 142 per loop
 *   readIges(text) → doc (every 144 as a trimmed surface; every 126 and 128 no 144 uses; units converted to mm) — NurbsError nurbs.err.iges_*
 */
import * as C from './curve.js';
import * as S from './surface.js';
import * as D from './doc.js';
import * as T from './trim.js';
import * as SO from './solid.js';
import { shellOf, trimFromLoops } from './step.js';

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

/** writeIges plus what was written for each solid: { text, solids: [{ id, name, closed (one 186), faces, edges, vertices, loops, euler, why }] } */
export function writeIgesReport(doc, opts = {}) { const out = { solids: [] }; out.text = writeIges(doc, { ...opts, _report: out }); return out; }

export function writeIges(doc, { name = 'nurbs', author = '', org = '', time = null, _report = null } = {}) {
  const d = D.cleanDoc(doc);
  const when = (time || new Date().toISOString()).replace(/[-:]/g, '').replace('T', '.').slice(0, 15);
  const start = ['CadCraft cc-nurbs patch set: B-spline curves (126), B-spline surfaces (128), trimmed surfaces (144, 142), solids (186, 514, 510, 508, 504, 502).'];
  let maxc = 1;
  for (const it of d.items) for (const q of it.kind === 'curve' ? it.curve.cvs : it.surface.cvs.flat()) for (const x of q) maxc = Math.max(maxc, Math.abs(x));
  const global = [
    '1H,', '1H;', holl('CadCraft'), holl(name + '.igs'), holl('CadCraft cc-nurbs'), holl('cc-nurbs 0.8'), '32', '38', '6', '308', '15', holl(name),
    '1.', '2', '2HMM', '1', '1.', holl(when), '1.D-6', num(maxc), holl(author), holl(org), '11', '0', holl(when),
  ];
  const ents = [];
  const push = (e) => { ents.push(e); return 2 * (ents.length - 1) + 1; };   // → its Directory Entry number
  const curve126 = (c, label, status, plane = null) => {
    const K = c.cvs.length - 1, M = c.deg, w = c.w || c.cvs.map(() => 1);
    const [a, b] = C.domain(c);
    // PROP1 planar: a (u, v) curve lies in z = 0 (normal 0, 0, 1)
    return push({ type: 126, form: 0, label, status, ints: 7, params: [126, K, M, plane ? 1 : 0, 0, c.w ? 0 : 1, 0, ...c.knots, ...w, ...c.cvs.flat(), a, b, ...(plane || [0, 0, 0])] });
  };
  const surface128 = (s, label, status) => {
    const K1 = s.cvs.length - 1, K2 = s.cvs[0].length - 1;
    const W = [], X = [];
    for (let j = 0; j <= K2; j++) for (let i = 0; i <= K1; i++) { W.push(s.w ? s.w[i][j] : 1); X.push(...s.cvs[i][j]); }
    const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s);
    return push({ type: 128, form: 0, label, status, ints: 10, params: [128, K1, K2, s.degU, s.degV, 0, 0, s.w ? 0 : 1, 0, 0, ...s.knotsU, ...s.knotsV, ...W, ...X, ua, ub, va, vb] });
  };
  // status (DE field 9): physically dependent entities under a 144 = 01 subordinate; a (u, v) curve's use = 05 (2D parametric)
  const DEP = '00010000', DEP2D = '00010500';
  // solids: one 186 each when the faces pair up; else (and for faces outside a solid) as below
  const inSolid = new Set(), solidsOut = [];
  for (const b of SO.solids(d)) {
    const its = b.faces.map((f) => d.items.find((i) => i.id === f)).filter(Boolean);
    let sh = null;
    try { sh = shellOf(its, {}); } catch (e) { sh = { fail: e && e.code ? e.code : 'error' }; }
    if (!sh || sh.fail) { solidsOut.push({ id: b.id, name: b.name, closed: false, why: sh ? sh.fail : 'error' }); continue; }
    const vl = push({ type: 502, form: 1, label: b.id, status: '00010000', ints: 1, params: [502, sh.verts.length, ...sh.verts.flat()] });
    const crv = sh.edges.map((e) => {   // no zero-length step (two equal points make a repeated knot)
      const pts = []; for (const q of e.pts) if (!pts.length || Math.hypot(q[0] - pts.at(-1)[0], q[1] - pts.at(-1)[1], q[2] - pts.at(-1)[2]) > 1e-9) pts.push(q);
      return curve126(C.polyline(pts.length > 1 ? pts : [e.pts[0], e.pts.at(-1)]), b.id, DEP);
    });
    const el = push({ type: 504, form: 1, label: b.id, status: '00010001', ints: 1 + 5 * sh.edges.length, params: [504, sh.edges.length, ...sh.edges.flatMap((e, i) => [crv[i], vl, e.v0 + 1, vl, e.v1 + 1])] });
    const faceDe = sh.faces.map((f) => {
      const sde = surface128(f.item.surface, f.item.id, DEP);
      // loops relative to the surface's own normal: a face whose surface points inward has them turned round
      const loopDe = f.loops.map((L) => {
        const uses = f.sense ? L : L.slice().reverse().map((oe) => ({ e: oe.e, fwd: !oe.fwd }));
        const params = [508, uses.length];
        for (const oe of uses) params.push(0, el, oe.e + 1, oe.fwd ? 1 : 0, 0);
        return push({ type: 508, form: 1, label: f.item.id, status: '00010000', ints: params.length, params });
      });
      return push({ type: 510, form: 1, label: f.item.id, status: '00010000', ints: 4 + loopDe.length, params: [510, sde, loopDe.length, 1, ...loopDe] });
    });
    const shell = push({ type: 514, form: 1, label: b.id, status: '00010000', ints: 2 + 2 * faceDe.length, params: [514, faceDe.length, ...faceDe.flatMap((fd, i) => [fd, sh.faces[i].sense ? 1 : 0])] });
    push({ type: 186, form: 0, label: b.id, status: '00000000', ints: 4, params: [186, shell, 1, 0] });
    for (const f of b.faces) inSolid.add(f);
    solidsOut.push({ id: b.id, name: b.name, closed: true, ...sh.stats });
  }
  if (_report) _report.solids = solidsOut;
  for (const it of d.items) {
    if (inSolid.has(it.id)) continue;
    if (it.kind === 'curve') { curve126(it.curve, it.id, '00000000'); continue; }
    const s = it.surface;
    if (!it.trim) { surface128(s, it.id, '00000000'); continue; }
    const sde = surface128(s, it.id, DEP);
    const onSurface = (L) => {
      const ring = [...L, L[0]];
      const b = curve126(C.polyline(ring.map((q) => [q[0], q[1], 0])), it.id, DEP2D, [0, 0, 1]);
      const P3 = [], size = S.size(s);   // no zero-length step where two (u, v) points are one point in space (a seam, a pole)
      for (const { p } of [...T.onSurface(s, L), { p: S.point(s, L[0][0], L[0][1]) }]) if (!P3.length || Math.hypot(p[0] - P3.at(-1)[0], p[1] - P3.at(-1)[1], p[2] - P3.at(-1)[2]) > 1e-9 * size) P3.push(p);   // each (u, v) step followed on the surface
      const m = curve126(C.polyline(P3.length > 1 ? P3 : [P3[0], P3[0]]), it.id, DEP);
      // CRTN 0 (unspecified), SPTR, BPTR, CPTR, PREF 1 (the (u, v) curve on the surface is the one to use)
      return push({ type: 142, form: 0, label: it.id, status: DEP, ints: 6, params: [142, 0, sde, b, m, 1] });
    };
    const outer = it.trim.outer ? onSurface(it.trim.outer) : 0;
    const holes = it.trim.holes.map(onSurface);
    push({ type: 144, form: 0, label: it.id, status: '00000000', ints: 5 + holes.length, params: [144, sde, outer ? 1 : 0, holes.length, outer, ...holes] });
  }
  const dir = [], par = [];
  ents.forEach((e, k) => {
    const de = 2 * k + 1;
    const toks = e.params.map((x, i) => (i < e.ints ? String(x) : num(x)));
    const lines = wrap(toks, 64);
    const first = par.length + 1;
    lines.forEach((ln) => par.push(ln.padEnd(64, ' ') + ' ' + String(de).padStart(7, ' ')));
    const lbl = String(e.label).slice(0, 8);
    dir.push(f8(e.type) + f8(first) + f8(0) + f8(0) + f8(0) + f8(0) + f8(0) + f8(0) + (e.status || '00000000'));
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
  // every entity by its Directory Entry number first: a 144 points at its 128 and its 142s, which point at 126 / 102 curves
  const ents = new Map();
  const WANT = new Set([102, 126, 128, 142, 144, 186, 502, 504, 508, 510, 514]);
  for (let k = 0; k + 1 < sec.D.length; k += 2) {
    const a = sec.D[k], b = sec.D[k + 1];
    const type = +a.slice(0, 8), ptr = +a.slice(8, 16), cnt = +b.slice(24, 32), label = b.slice(56, 64).trim();
    if (!WANT.has(type)) continue;
    if (!(ptr >= 1) || !(cnt >= 1) || ptr - 1 + cnt > sec.P.length) fail('nurbs.err.iges_pointer');
    const body = sec.P.slice(ptr - 1, ptr - 1 + cnt).map((l) => l.slice(0, 64)).join('');
    const P = freeParams(body, pd, rd).map((x) => (typeof x === 'string' ? x : '0'));
    if (+P[0] !== type) fail('nurbs.err.iges_entity');
    ents.set(k + 1, { type, P, label });
  }
  const reader = (P) => {
    let at = 1;
    return (n) => { if (n < 0 || at + n > P.length || n > 5e6) fail('nurbs.err.iges_entity'); const o = P.slice(at, at + n).map(fnum); at += n; return o; };
  };
  const curveOf = (e, sc) => {
    const take = reader(e.P);
    const [K, M, , , poly] = take(6);
    if (!Number.isInteger(K) || !Number.isInteger(M) || K < 1 || M < 1) fail('nurbs.err.iges_entity');
    const knots = take(K + M + 2), w = take(K + 1), xyz = take(3 * (K + 1));
    const cvs = []; for (let i = 0; i <= K; i++) cvs.push([xyz[3 * i] * sc, xyz[3 * i + 1] * sc, xyz[3 * i + 2] * sc]);
    return C.cleanCurve({ deg: M, knots, cvs, w: poly === 1 ? null : w });
  };
  const surfaceOf = (e) => {
    const take = reader(e.P);
    const [K1, K2, M1, M2, , , poly] = take(9);
    if (![K1, K2, M1, M2].every((x) => Number.isInteger(x) && x >= 1)) fail('nurbs.err.iges_entity');
    if ((K1 + 1) * (K2 + 1) > 2e6) fail('nurbs.err.too_many', { max: 2e6 });
    const ku = take(K1 + M1 + 2), kv = take(K2 + M2 + 2), W = take((K1 + 1) * (K2 + 1)), X = take(3 * (K1 + 1) * (K2 + 1));
    const cvs = Array.from({ length: K1 + 1 }, () => new Array(K2 + 1)), w = Array.from({ length: K1 + 1 }, () => new Array(K2 + 1));
    let n = 0;
    for (let j = 0; j <= K2; j++) for (let i = 0; i <= K1; i++, n++) { cvs[i][j] = [X[3 * n] * scale, X[3 * n + 1] * scale, X[3 * n + 2] * scale]; w[i][j] = W[n]; }
    return S.cleanSurface({ degU: M1, degV: M2, knotsU: ku, knotsV: kv, cvs, w: poly === 1 ? null : w });
  };
  const used = new Set();
  const get = (de, types) => { const e = ents.get(de); if (!e || !types.includes(e.type)) fail('nurbs.err.iges_pointer'); used.add(de); return e; };
  /** Points of a (u, v) curve (126, or a 102 of 126s): parameter space is never scaled. A degree-1 curve gives its own corners. */
  const uvPoints = (de, depth = 0) => {
    const e = get(de, [126, 102]);
    if (e.type === 102) {
      if (depth > 2) fail('nurbs.err.iges_entity');
      const [n] = reader(e.P)(1);
      if (!Number.isInteger(n) || n < 1 || n > 10000) fail('nurbs.err.iges_entity');
      const out = [];
      for (const p of reader(e.P)(1 + n).slice(1)) out.push(...uvPoints(p, depth + 1));
      return out;
    }
    const c = curveOf(e, 1);
    if (c.deg === 1 && !c.w) return c.cvs.map((q) => [q[0], q[1]]);
    const [a, b] = C.domain(c), n = Math.min(1024, Math.max(32, c.cvs.length * 8));
    const out = [];
    for (let i = 0; i <= n; i++) { const q = C.point(c, a + (b - a) * i / n); out.push([q[0], q[1]]); }
    return out;
  };
  const modelPoints = (de, depth = 0) => {
    const e = get(de, [126, 102]);
    if (e.type === 102) {
      if (depth > 2) fail('nurbs.err.iges_entity');
      const [n] = reader(e.P)(1);
      if (!Number.isInteger(n) || n < 1 || n > 10000) fail('nurbs.err.iges_entity');
      return reader(e.P)(1 + n).slice(1).flatMap((p) => modelPoints(p, depth + 1));
    }
    const c = curveOf(e, scale);
    if (c.deg === 1 && !c.w) return c.cvs.slice();   // a polyline: its own points
    const [a, b] = C.domain(c), n = Math.min(1024, Math.max(32, c.cvs.length * 8));
    return Array.from({ length: n + 1 }, (_, i) => C.point(c, a + (b - a) * i / n));
  };
  /** One boundary (a 142) → a loop in the surface's (u, v) plane. */
  const loopOf = (de, s) => {
    const e = get(de, [142]);
    const [, , bp, cp] = reader(e.P)(5);
    if (cp > 0 && ents.has(cp)) used.add(cp);   // the model-space copy is the same loop: never a curve of its own
    if (bp > 0) return uvPoints(bp);
    if (!(cp > 0)) fail('nurbs.err.iges_entity');
    let uv0 = null;
    return modelPoints(cp).map((p) => { const r = S.closestPoint(s, p, uv0 ? { uv0 } : {}); uv0 = [r.u, r.v]; return uv0; });
  };
  let doc = D.newDoc();
  const label = (e) => (/^[A-Za-z0-9_.-]+$/.test(e.label) ? e.label : null);
  for (const [de, e] of ents) {
    if (e.type !== 144) continue;
    const [sp, n1, n2, po] = reader(e.P)(4);
    if (!Number.isInteger(n2) || n2 < 0 || n2 > T.MAX_LOOPS) fail('nurbs.err.iges_entity');
    const holesDe = reader(e.P)(4 + n2).slice(4);
    const se = get(sp, [128]);
    const s = surfaceOf(se);
    const trim = T.cleanTrim({ outer: n1 === 1 && po > 0 ? loopOf(po, s) : null, holes: holesDe.map((h) => loopOf(h, s)) }, s);
    used.add(de);
    const r = D.add(doc, 'surface', s, { id: label(e) });
    doc = trim ? D.setTrim(r.doc, r.id, trim) : r.doc;
  }
  // solids (0.9 SU.747c): each 186 -> its closed shell -> faces (over a 128) -> loops of edge uses -> edge lists -> curves; a loop is read as the
  // points of its edges in the order and direction of the uses, put on the surface (step.js trimFromLoops, as for STEP)
  const surfOfDe = new Map();
  let solidList = [];
  for (const [, e] of ents) {
    if (e.type !== 186) continue;
    const [shDe] = reader(e.P)(1);
    const sh = get(shDe, [514]);
    const n = reader(sh.P)(1)[0];
    if (!Number.isInteger(n) || n < 1 || n > 1e6) fail('nurbs.err.iges_entity');
    const fl = reader(sh.P)(1 + 2 * n).slice(1);
    const faces = [];
    for (let i = 0; i < n; i++) {
      const fe = get(fl[2 * i], [510]);
      const [sd, nl, of] = reader(fe.P)(3);
      if (!Number.isInteger(nl) || nl < 1 || nl > T.MAX_LOOPS) fail('nurbs.err.iges_entity');
      const loopDe = reader(fe.P)(3 + nl).slice(3);
      let s = surfOfDe.get(sd);
      if (!s) { s = surfaceOf(get(sd, [128])); surfOfDe.set(sd, s); }
      const list = loopDe.map((ld, k) => {
        const le = get(ld, [508]), take = reader(le.P), [m] = take(1);
        if (!Number.isInteger(m) || m < 1 || m > 1e6) fail('nurbs.err.iges_entity');
        const uses = [];
        for (let j = 0; j < m; j++) {
          const [type, ed, ndx, flag, kk] = take(5);
          if (!Number.isInteger(kk) || kk < 0) fail('nurbs.err.iges_entity');
          take(2 * kk);
          if (type !== 0) continue;   // a pole (a vertex use): no curve
          const el = get(ed, [504]), tk = reader(el.P), [cnt] = tk(1);
          if (!Number.isInteger(ndx) || ndx < 1 || ndx > cnt) fail('nurbs.err.iges_pointer');
          uses.push({ key: ed + '/' + ndx, curve: tk(5 * cnt)[5 * (ndx - 1)], flag });
        }
        // a loop on a closed surface walks its seam twice: it is read from the seam (the unwrapping into the patch starts on it)
        const seam = uses.findIndex((u, i) => uses.some((v, j) => j !== i && v.key === u.key));
        if (seam > 0) uses.push(...uses.splice(0, seam));
        const pts3 = [];
        for (const u of uses) {
          let pts = modelPoints(u.curve);
          if (u.flag === 0) pts = pts.slice().reverse();
          for (const q of pts) if (!pts3.length || Math.hypot(q[0] - pts3.at(-1)[0], q[1] - pts3.at(-1)[1], q[2] - pts3.at(-1)[2]) > 1e-12) pts3.push(q);
        }
        return { pts3, reverse: false, outer: k === 0 && of === 1 };
      }).filter((l) => l.pts3.length >= 3);
      faces.push({ s, trim: trimFromLoops(s, list), de: sd + '/' + fe.label });
    }
    solidList.push({ label: label(e), name: e.label, faces });
  }
  const sols = [];
  for (const b of solidList) {
    const ids = [];
    for (const f of b.faces) { const r = D.add(doc, 'surface', f.s, {}); doc = f.trim ? D.setTrim(r.doc, r.id, f.trim) : r.doc; ids.push(r.id); }
    if (ids.length) sols.push({ id: 'b' + (sols.length + 1), name: b.name || '', faces: ids });
  }
  if (sols.length) {
    const taken = new Set(doc.items.map((i) => i.id));
    for (const b of sols) { let n = 1; while (taken.has('b' + n)) n++; b.id = 'b' + n; taken.add(b.id); }
    doc = D.cleanDoc({ ...doc, solids: sols });
  }
  for (const [de, e] of ents) {
    if (used.has(de) || (e.type !== 126 && e.type !== 128)) continue;
    if (e.type === 126) doc = D.add(doc, 'curve', curveOf(e, scale), { id: label(e) }).doc;
    else doc = D.add(doc, 'surface', surfaceOf(e), { id: label(e) }).doc;
  }
  if (!doc.items.length) fail('nurbs.err.iges_empty');
  return doc;
}
