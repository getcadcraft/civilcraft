/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cheminfo.js — structures and group-contribution estimates for CH.1 components (0.8 Track CH, CH.24; DOM-free).
 * Our own small, deterministic code: a SMILES reader for the organic subset, formula and molar mass, MOL (V2000 text) in and out, a plain 2D layout and
 * SVG, Joback group contributions, and a bridge that turns the estimate into a component for lib/process (`toComponent`).
 *
 * RDKit MinimalLib (BSD-3-Clause, WebAssembly) is the plan's foundation for the full job (stereo, aromaticity perception, canonical SMILES, thousands of
 * descriptors). It is NOT bundled: npm metadata measured 2026-10-28 puts @rdkit/rdkit 2026.9.1 at 7.5 MB unpacked, which is far over what a page should
 * load, so it fits only as an on-demand code add-on (rule 44). The `registerStructureBackend` hook below lets such an add-on replace `parse`.
 *
 * Joback and Reid (1987) values were typed WITHOUT the paper open and cover only the groups listed in GROUPS (alkane, ring CH2/CH, aromatic CH/C, a few
 * alkene, alcohol OH, ether O, F/Cl/Br). A molecule with any other group gets no estimate and says which group is missing (Problems), never a guess. Every
 * value is `check: 'not confirmed'`: an engineer or chemist must compare GROUPS with the paper. An estimate is accurate to a few percent for small
 * hydrocarbons and worse elsewhere; it is a stand-in until a measured value is typed.
 */
import { defineComponent } from '../data.js';
import { solveLinear } from '../numeric.js';
import { problem as baseProblem } from '../report.js';

const SRC = { kind: 'engine', name: 'process.env' };
const problem = (code, severity, text, about = [], extra = {}) => { const p = baseProblem('chem.' + code, severity, text, about, extra); p.source = SRC; return p; };
export const REVIEW = { state: 'not confirmed', note: 'Joback group values and atomic weights typed without the sources open; compare with the paper and the IUPAC table before use.' };
export const WEIGHT = { H: 1.008, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Br: 79.904, I: 126.904, Na: 22.990, K: 39.098 };
const ORGANIC = ['Br', 'Cl', 'B', 'C', 'N', 'O', 'P', 'S', 'F', 'I'], AROM = ['b', 'c', 'n', 'o', 'p', 's'];
const VALENCE = { B: [3], C: [4], N: [3, 5], O: [2], P: [3, 5], S: [2, 4, 6], F: [1], Cl: [1], Br: [1], I: [1] };

let backend = null;
/** An on-demand add-on (RDKit MinimalLib) may provide `parse(smiles) → molecule` in the shape of ours. */
export function registerStructureBackend(b) { backend = b; }

/** Parse SMILES (organic subset, brackets, branches, rings, charges, aromatic lower case). → { atoms: [{ el, aromatic, charge, h }], bonds: [{ a, b, order }], notes }.
 *  Stereo marks (@ / \) are read and dropped (noted). Order 1.5 = aromatic. h = total hydrogens. */
export function parse(smiles) {
  if (backend) return backend.parse(smiles);
  const s = String(smiles ?? '').trim();
  if (!s || s.length > 2000) throw new Error('Give a SMILES string of up to 2000 characters.');
  const atoms = [], bonds = [], notes = [], rings = {}; const stack = []; let prev = -1, order = 0, i = 0;
  const add = (el, aromatic, charge, h) => {
    atoms.push({ el, aromatic, charge, hExplicit: h }); const k = atoms.length - 1;
    if (prev >= 0) bonds.push({ a: prev, b: k, order: order || (aromatic && atoms[prev].aromatic ? 1.5 : 1) });
    prev = k; order = 0;
  };
  while (i < s.length) {
    const ch = s[i];
    if (ch === '[') {
      const j = s.indexOf(']', i); if (j < 0) throw new Error('Unclosed [ in the SMILES.');
      const m = /^(\d*)([A-Z][a-z]?|[bcnops]|se|as)(@{0,2})(?:H(\d?))?([+-]+\d?|)(?::\d+)?$/.exec(s.slice(i + 1, j));
      if (!m) throw new Error('Cannot read the bracket atom [' + s.slice(i + 1, j) + '].');
      const aromatic = /^[a-z]/.test(m[2]), el = aromatic ? m[2][0].toUpperCase() + m[2].slice(1) : m[2];
      if (!(el in WEIGHT)) throw new Error('Element ' + el + ' is not in the weight table.');
      if (m[3]) notes.push('Stereo marks were ignored.');
      let q = 0; if (m[5]) { const sign = m[5][0] === '+' ? 1 : -1, digits = m[5].replace(/[+-]/g, ''); q = sign * (digits ? +digits : m[5].length); }
      add(el, aromatic, q, m[4] === undefined ? 0 : (m[4] === '' ? 1 : +m[4]));
      i = j + 1; continue;
    }
    if (ch === '(') { stack.push(prev); i++; continue; }
    if (ch === ')') { prev = stack.pop(); if (prev === undefined) throw new Error('Unbalanced ) in the SMILES.'); i++; continue; }
    if (ch === '.') { prev = -1; order = 0; i++; continue; }
    if ('-=#:'.includes(ch)) { order = { '-': 1, '=': 2, '#': 3, ':': 1.5 }[ch]; i++; continue; }
    if (ch === '/' || ch === '\\') { notes.push('Stereo marks were ignored.'); i++; continue; }
    if (/[0-9%]/.test(ch)) {
      let d = ch; if (ch === '%') { d = s.slice(i + 1, i + 3); i += 2; }
      if (prev < 0) throw new Error('A ring number needs an atom before it.');
      if (rings[d] !== undefined) { const o = rings[d]; bonds.push({ a: o.atom, b: prev, order: order || o.order || (atoms[o.atom].aromatic && atoms[prev].aromatic ? 1.5 : 1) }); delete rings[d]; }
      else rings[d] = { atom: prev, order };
      order = 0; i++; continue;
    }
    const two = s.slice(i, i + 2);
    if (ORGANIC.includes(two)) { add(two, false, 0, null); i += 2; continue; }
    if (ORGANIC.includes(ch)) { add(ch, false, 0, null); i++; continue; }
    if (AROM.includes(ch)) { add(ch.toUpperCase(), true, 0, null); i++; continue; }
    throw new Error('Cannot read "' + ch + '" at position ' + (i + 1) + ' of the SMILES.');
  }
  if (Object.keys(rings).length) throw new Error('A ring closure was left open.');
  if (stack.length) throw new Error('Unbalanced ( in the SMILES.');
  // hydrogens
  const sum = atoms.map(() => 0); for (const b of bonds) { sum[b.a] += b.order === 1.5 ? 1 : b.order; sum[b.b] += b.order === 1.5 ? 1 : b.order; }
  atoms.forEach((a, k) => {
    if (a.hExplicit != null) a.h = a.hExplicit;
    else {
      const val = VALENCE[a.el]; if (!val) { a.h = 0; return; }
      const used = sum[k] + (a.aromatic ? 1 : 0), v = a.aromatic ? (used <= val[0] ? val[0] : null) : val.find((x) => x >= used);
      a.h = v == null ? 0 : v - used;
    }
    delete a.hExplicit;
  });
  return { atoms, bonds, notes: [...new Set(notes)] };
}

/** Atoms present (Hill order string) and the counts. */
export function composition(mol) {
  const c = {}; for (const a of mol.atoms) { c[a.el] = (c[a.el] || 0) + 1; c.H = (c.H || 0) + a.h; }
  return c;
}
export function formula(mol) {
  const c = composition(mol), keys = Object.keys(c).filter((k) => c[k] > 0), hasC = 'C' in c;
  const order = hasC ? ['C', 'H', ...keys.filter((k) => k !== 'C' && k !== 'H').sort()] : keys.sort();
  return order.filter((k) => c[k] > 0).map((k) => k + (c[k] > 1 ? c[k] : '')).join('');
}
/** Molar mass, g/mol. */
export function molarMass(mol) { const c = composition(mol); let m = 0; for (const [k, n] of Object.entries(c)) { if (!(k in WEIGHT)) throw new Error('No weight for ' + k); m += n * WEIGHT[k]; } return m; }

/** Which bonds lie on a ring (a bond is on a ring when its ends stay connected without it). */
export function ringBonds(mol) {
  const n = mol.atoms.length, adj = Array.from({ length: n }, () => []); mol.bonds.forEach((b, k) => { adj[b.a].push([b.b, k]); adj[b.b].push([b.a, k]); });
  return mol.bonds.map((b, k) => { const seen = new Set([b.a]), q = [b.a]; while (q.length) { const u = q.pop(); for (const [v, e] of adj[u]) { if (e === k || seen.has(v)) continue; seen.add(v); q.push(v); } } return seen.has(b.b); });
}

// ---- MOL (V2000) -------------------------------------------------------------------------------------------------------------------
/** 2D coordinates by a deterministic spring layout (bond length 1.5): good enough to draw and to carry in a MOL file, not a depiction standard. */
export function layout2D(mol) {
  const n = mol.atoms.length, P = mol.atoms.map((_, i) => [Math.cos(2 * Math.PI * i / Math.max(n, 1)) * (0.8 + 0.3 * n), Math.sin(2 * Math.PI * i / Math.max(n, 1)) * (0.8 + 0.3 * n)]);
  for (let it = 0; it < 400; it++) {
    const F = P.map(() => [0, 0]);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1], d2 = dx * dx + dy * dy + 0.01, f = 1.2 / d2; F[i][0] += f * dx; F[i][1] += f * dy; F[j][0] -= f * dx; F[j][1] -= f * dy; }
    for (const b of mol.bonds) { const dx = P[b.b][0] - P[b.a][0], dy = P[b.b][1] - P[b.a][1], d = Math.sqrt(dx * dx + dy * dy) + 1e-9, f = (d - 1.5) * 0.5 / d; F[b.a][0] += f * dx; F[b.a][1] += f * dy; F[b.b][0] -= f * dx; F[b.b][1] -= f * dy; }
    for (let i = 0; i < n; i++) { P[i][0] += 0.2 * F[i][0]; P[i][1] += 0.2 * F[i][1]; }
  }
  return P;
}
const pad = (v, w) => String(v).padStart(w), padR = (v, w) => String(v).padEnd(w);
/** MOL file text (V2000). Hydrogens stay implicit. Aromatic bonds are written as type 4. */
export function toMol(mol, name = '') {
  const P = layout2D(mol), L = [String(name).replace(/[\r\n]/g, ' ').slice(0, 80), '  cc-process', '', pad(mol.atoms.length, 3) + pad(mol.bonds.length, 3) + '  0  0  0  0  0  0  0  0999 V2000'];
  mol.atoms.forEach((a, i) => L.push(pad(P[i][0].toFixed(4), 10) + pad(P[i][1].toFixed(4), 10) + pad('0.0000', 10) + ' ' + padR(a.el, 3) + ' 0' + pad(a.charge ? ({ 1: 3, 2: 2, 3: 1, '-1': 5, '-2': 6, '-3': 7 })[a.charge] ?? 0 : 0, 3) + '  0  0  0  0  0  0  0  0  0  0'));
  mol.bonds.forEach((b) => L.push(pad(b.a + 1, 3) + pad(b.b + 1, 3) + pad(b.order === 1.5 ? 4 : b.order, 3) + '  0'));
  L.push('M  END'); return L.join('\n') + '\n';
}
/** Read a MOL (V2000) file. Hydrogens are recomputed from valence. */
export function fromMol(text) {
  const L = String(text).split(/\r?\n/); if (L.length < 5 || !/V2000/.test(L[3])) throw new Error('Not a MOL V2000 file.');
  const na = +L[3].slice(0, 3), nb = +L[3].slice(3, 6); if (!(na >= 0 && na <= 5000 && nb >= 0 && nb <= 10000)) throw new Error('Bad counts line.');
  const atoms = [], bonds = [];
  for (let i = 0; i < na; i++) { const l = L[4 + i] || '', el = l.slice(31, 34).trim(); if (!(el in WEIGHT)) throw new Error('Unknown element "' + el + '" on atom line ' + (i + 1)); const cc = +l.slice(36, 39) || 0; atoms.push({ el, aromatic: false, charge: ({ 3: 1, 2: 2, 1: 3, 5: -1, 6: -2, 7: -3 })[cc] || 0, hExplicit: null }); }
  for (let i = 0; i < nb; i++) { const l = L[4 + na + i] || '', a = +l.slice(0, 3) - 1, b = +l.slice(3, 6) - 1, t = +l.slice(6, 9); if (!(a >= 0 && a < na && b >= 0 && b < na && t >= 1 && t <= 4)) throw new Error('Bad bond line ' + (i + 1)); bonds.push({ a, b, order: t === 4 ? 1.5 : t }); if (t === 4) { atoms[a].aromatic = atoms[b].aromatic = true; } }
  const sum = atoms.map(() => 0); for (const b of bonds) { const o = b.order === 1.5 ? 1 : b.order; sum[b.a] += o; sum[b.b] += o; }
  atoms.forEach((a, k) => { const val = VALENCE[a.el]; if (!val) { a.h = 0; delete a.hExplicit; return; } const used = sum[k] + (a.aromatic ? 1 : 0) + Math.max(0, a.charge ? (a.el === 'N' ? a.charge : -a.charge) : 0), v = val.find((x) => x >= used); a.h = v == null ? 0 : v - used; delete a.hExplicit; });
  return { atoms, bonds, notes: [] };
}
/** A plain SVG drawing (bonds as lines, double and triple bonds offset, heteroatom labels). */
export function toSvg(mol, { size = 240 } = {}) {
  const P = layout2D(mol); if (!P.length) return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '"/>';
  const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(...xs) - x0 || 1, h = Math.max(...ys) - y0 || 1, k = (size - 40) / Math.max(w, h);
  const X = (p) => 20 + (p[0] - x0) * k, Y = (p) => 20 + (p[1] - y0) * k, esc = (t) => String(t).replace(/[&<>"]/g, '');
  let out = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" stroke="currentColor" fill="none" stroke-width="1.5" font-family="sans-serif" font-size="13">';
  for (const b of mol.bonds) {
    const a = P[b.a], c = P[b.b], dx = c[0] - a[0], dy = c[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d * 2.5, ny = dx / d * 2.5, ln = (ox, oy) => `<line x1="${(X(a) + ox).toFixed(1)}" y1="${(Y(a) + oy).toFixed(1)}" x2="${(X(c) + ox).toFixed(1)}" y2="${(Y(c) + oy).toFixed(1)}"/>`;
    out += b.order === 2 || b.order === 1.5 ? ln(nx, ny) + ln(-nx, -ny) : b.order === 3 ? ln(0, 0) + ln(2 * nx, 2 * ny) + ln(-2 * nx, -2 * ny) : ln(0, 0);
  }
  mol.atoms.forEach((a, i) => { if (a.el !== 'C') out += `<text x="${X(P[i]).toFixed(1)}" y="${(Y(P[i]) + 4).toFixed(1)}" text-anchor="middle" fill="currentColor" stroke="none">${esc(a.el)}</text>`; });
  return out + '</svg>';
}

// ---- Joback -----------------------------------------------------------------------------------------------------------------------
// [Tc, Pc, Vc, Tb, Tf, Hf kJ/mol, Gf kJ/mol, Cp a, b, c, d | null]
export const GROUPS = {
  'CH3': [0.0141, -0.0012, 65, 23.58, -5.10, -76.45, -43.96, 19.5, -8.08e-3, 1.53e-4, -9.67e-8],
  'CH2': [0.0189, 0, 56, 22.88, 11.27, -20.64, 8.42, -0.909, 9.50e-2, -5.44e-5, 1.19e-8],
  'CH': [0.0164, 0.0020, 41, 21.74, 12.64, 29.89, 58.36, -23.0, 2.04e-1, -2.65e-4, 1.20e-7],
  'C': [0.0067, 0.0043, 27, 18.25, 46.43, 82.23, 116.02, -66.2, 4.27e-1, -6.41e-4, 3.01e-7],
  'ring CH2': [0.0100, 0.0025, 48, 27.15, 7.75, -26.80, -3.68, -6.03, 8.54e-2, 8.0e-6, -1.8e-8],
  'ring CH': [0.0122, 0.0004, 38, 21.78, 19.88, 8.67, 40.99, -20.5, 1.62e-1, -1.60e-4, 6.24e-8],
  '=CH2': [0.0113, -0.0028, 56, 18.25, -4.32, -9.630, 3.77, null],
  '=CH-': [0.0129, -0.0006, 46, 24.96, 8.73, 37.97, 48.53, null],
  'ring =CH-': [0.0082, 0.0011, 41, 26.73, 8.13, 2.09, 11.30, -2.14, 5.74e-2, -1.64e-6, -1.59e-8],
  'ring =C<': [0.0143, 0.0008, 32, 31.18, 37.02, 46.43, 54.05, -8.25, 1.01e-1, -1.42e-4, 6.78e-8],
  '-OH (alcohol)': [0.0741, 0.0112, 28, 92.88, 44.45, -208.04, -189.20, 25.7, -6.91e-2, 1.77e-4, -9.88e-8],
  '-O- (non-ring)': [0.0168, 0.0015, 18, 22.42, 22.23, -132.22, -105.00, null],
  '-F': [0.0111, -0.0057, 27, -0.03, -15.78, -251.92, -247.19, null],
  '-Cl': [0.0105, -0.0049, 58, 38.13, 13.55, -71.55, -64.31, null],
  '-Br': [0.0133, 0.0057, 71, 66.86, 43.43, -29.48, -38.06, null],
};
/** Assign Joback groups. → { groups: { name: count }, missing: ['description'…] } */
export function groupsOf(mol) {
  const rb = ringBonds(mol), inRing = mol.atoms.map(() => false); mol.bonds.forEach((b, k) => { if (rb[k]) inRing[b.a] = inRing[b.b] = true; });
  const nb = mol.atoms.map(() => []); mol.bonds.forEach((b) => { nb[b.a].push({ o: b.b, order: b.order }); nb[b.b].push({ o: b.a, order: b.order }); });
  const groups = {}, missing = [], inc = (g) => { groups[g] = (groups[g] || 0) + 1; };
  mol.atoms.forEach((a, i) => {
    const dbl = nb[i].filter((x) => x.order === 2).length, trp = nb[i].filter((x) => x.order === 3).length, arom = nb[i].some((x) => x.order === 1.5);
    if (a.charge) { missing.push('charged ' + a.el); return; }
    if (a.el === 'C') {
      if (arom) inc(a.h === 1 ? 'ring =CH-' : a.h === 0 ? 'ring =C<' : 'ring =CH-');
      else if (trp || nb[i].some((x) => x.order === 3)) missing.push('triple-bond carbon');
      else if (dbl) { if (nb[i].some((x) => x.order === 2 && mol.atoms[x.o].el !== 'C')) missing.push('carbonyl or C=X carbon'); else if (inRing[i]) missing.push('ring alkene carbon'); else if (dbl === 1 && a.h === 2) inc('=CH2'); else if (dbl === 1 && a.h === 1) inc('=CH-'); else missing.push('substituted alkene carbon'); }
      else if (inRing[i]) { if (a.h === 2) inc('ring CH2'); else if (a.h === 1) inc('ring CH'); else missing.push('ring quaternary carbon'); }
      else inc(['C', 'CH', 'CH2', 'CH3'][a.h] ?? 'C');
    } else if (a.el === 'O') {
      if (a.h === 1 && nb[i].length === 1 && !mol.atoms[nb[i][0].o].aromatic) inc('-OH (alcohol)');
      else if (a.h === 0 && nb[i].length === 2 && !inRing[i] && nb[i].every((x) => x.order === 1 && !mol.atoms[x.o].aromatic)) inc('-O- (non-ring)');
      else missing.push('this oxygen group (phenol, carbonyl, ring ether, acid, ester …)');
    } else if (a.el === 'F') inc('-F'); else if (a.el === 'Cl') inc('-Cl'); else if (a.el === 'Br') inc('-Br');
    else missing.push(a.el + ' group');
  });
  return { groups, missing: [...new Set(missing)] };
}
export const SOURCES = { joback: 'Joback and Reid (1987): Tb = 198 + sum; Tc = Tb/(0.584 + 0.965 sum - sum^2); Pc = (0.113 + 0.0032 nA - sum)^-2 bar; Vc = 17.5 + sum cm3/mol; Tf = 122 + sum; Hf = 68.29 + sum kJ/mol; Gf = 53.88 + sum kJ/mol; Cp = sum a - 37.93 + (sum b + 0.210) T + (sum c - 3.91e-4) T^2 + (sum d + 2.06e-7) T^3 J/(mol K)', edmister: 'Edmister (1958): omega = 3/7 theta/(1 - theta) log10(Pc/1.01325 bar) - 1, theta = Tb/Tc' };
/** Joback estimate for a molecule. → { ok, Tb, Tc, Pc (bar), Vc, Tf, Hf (kJ/mol), Gf, cp: (T) => J/mol/K | null, omega, groups, problems, notes } */
export function joback(mol) {
  const { groups, missing } = groupsOf(mol), problems = [];
  if (missing.length) { problems.push(problem('joback.missing', 'warning', 'No Joback estimate: this molecule has groups the table does not hold (' + missing.join('; ') + ').', [{ kind: 'molecule', id: formula(mol) }])); return { ok: false, groups, missing, problems }; }
  const S = new Array(11).fill(0); let hasCp = true;
  for (const [g, n] of Object.entries(groups)) { const row = GROUPS[g]; for (let k = 0; k < 7; k++) S[k] += n * row[k]; if (row[7] == null) hasCp = false; else for (let k = 7; k < 11; k++) S[k] += n * row[k]; }
  const nAtoms = mol.atoms.length + mol.atoms.reduce((s, a) => s + a.h, 0);
  const Tb = 198 + S[3], Tc = Tb / (0.584 + 0.965 * S[0] - S[0] * S[0]), Pc = Math.pow(0.113 + 0.0032 * nAtoms - S[1], -2), Vc = 17.5 + S[2];
  const th = Tb / Tc, omega = 3 / 7 * th / (1 - th) * Math.log10(Pc / 1.01325) - 1;
  const cp = hasCp ? (T) => (S[7] - 37.93) + (S[8] + 0.210) * T + (S[9] - 3.91e-4) * T * T + (S[10] + 2.06e-7) * T ** 3 : null;
  const notes = ['Group-contribution estimate: a few percent for small hydrocarbons, worse for polar molecules. Not a measured value.'];
  if (!hasCp) notes.push('The table holds no Cp terms for one of the groups, so no heat capacity was estimated.');
  return { ok: true, groups, Tb, Tc, Pc, Vc, Tf: 122 + S[4], Hf: 68.29 + S[5], Gf: 53.88 + S[6], cp, omega, problems, notes };
}

/** A component spec for lib/process (`defineComponent`) from SMILES: MW, Tc, Pc, omega, Tb, hf, gf and a quadratic Cp/R fitted to the Joback cubic over 300-800 K.
 *  opts { id, name?, define?: true (register it), TcRange? } Throws when the estimate or the Cp is not available (give measured values instead). */
export function toComponent(smiles, { id, name, define = false } = {}) {
  if (!id || !/^[a-z][a-z0-9_]{0,30}$/.test(id)) throw new Error('Give a component id of lower-case letters, digits and underscores.');
  const mol = parse(smiles), j = joback(mol);
  if (!j.ok) throw new Error(j.problems[0].text);
  if (!j.cp) throw new Error('No heat-capacity estimate for this molecule; give Cp yourself.');
  const T = Array.from({ length: 11 }, (_, i) => 300 + 50 * i), ata = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], atb = [0, 0, 0];
  for (const t of T) { const row = [1, t, t * t], y = j.cp(t) / 8.314462618; for (let a = 0; a < 3; a++) { atb[a] += row[a] * y; for (let b = 0; b < 3; b++) ata[a][b] += row[a] * row[b]; } }
  const k = [1, 1e3, 1e6]; for (let a = 0; a < 3; a++) { atb[a] /= k[a]; for (let b = 0; b < 3; b++) ata[a][b] /= k[a] * k[b]; }
  const co = solveLinear(ata, atb).map((v, i) => v / k[i]);
  const maxErr = Math.max(...T.map((t) => Math.abs((co[0] + co[1] * t + co[2] * t * t) * 8.314462618 - j.cp(t)) / j.cp(t)));
  const spec = { id, name: name || id, formula: formula(mol), MW: molarMass(mol), Tc: j.Tc, Pc: j.Pc, omega: j.omega, Tb: j.Tb, hf: j.Hf * 1000, gf: j.Gf * 1000, cp: { A: co[0], B: co[1], C: co[2], D: 0 }, src: 'Joback estimate (' + smiles + '), NOT confirmed', estimated: true, cpFitMaxError: maxErr };
  if (define) defineComponent(spec);
  return spec;
}
