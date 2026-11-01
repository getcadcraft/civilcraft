/* SPDX-License-Identifier: Apache-2.0 */
/**
 * molsketch.js — the model behind the structure editor (0.8 Track CH, CH.24; DOM-free). A sketch is atoms with positions and bonds; hydrogens are never drawn
 * (they follow from valence, as in cheminfo.js). Every edit returns a new sketch (the editor keeps an undo stack of them).
 *
 *   newSketch()            → { atoms: [{ el, x, y, charge }], bonds: [{ a, b, order }] }
 *   addAtom(s, el, x, y)   · setElement(s, i, el) · moveAtom(s, i, x, y) · removeAtom(s, i)
 *   bond(s, a, b)          adds a single bond, or cycles single → double → triple → single on an existing one
 *   addRing(s, n, cx, cy, { aromatic })   a regular ring of n carbons (benzene is written as its Kekulé form)
 *   toMolblock(s)          MOL V2000 with the sketch's own positions (y flipped to up)
 *   toMolecule(s)          the cheminfo.js molecule (hydrogens from valence), for formula, molar mass and Joback
 *   toSmiles(s)            SMILES written depth-first with ring closures; atoms outside the organic subset or charged go in brackets
 *   fromMolecule(mol) / fromSmiles(text)   a sketch laid out by cheminfo.layout2D
 *   problems(s)            valence errors (a carbon with five bonds), empty sketch, disconnected pieces
 */
import { WEIGHT, fromMol, layout2D, parse, formula } from './cheminfo.js';

export const ELEMENTS = ['C', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I', 'B', 'Si'];
const MAX_ATOMS = 400, VAL = { B: 3, C: 4, N: 3, O: 2, P: 3, S: 2, F: 1, Cl: 1, Br: 1, I: 1, Si: 4 };
const ORGANIC = new Set(['B', 'C', 'N', 'O', 'P', 'S', 'F', 'Cl', 'Br', 'I']);
const clone = (s) => ({ atoms: s.atoms.map((a) => ({ ...a })), bonds: s.bonds.map((b) => ({ ...b })) });
const fin = (v) => (Number.isFinite(+v) ? +v : 0);

export const newSketch = () => ({ atoms: [], bonds: [] });
export function addAtom(s, el, x, y) {
  if (!(el in WEIGHT) || el === 'H') throw new Error('Element ' + el + ' is not available in the editor.');
  if (s.atoms.length >= MAX_ATOMS) throw new Error('A sketch holds up to ' + MAX_ATOMS + ' atoms.');
  const n = clone(s); n.atoms.push({ el, x: fin(x), y: fin(y), charge: 0 }); return n;
}
export function setElement(s, i, el) { if (!(el in WEIGHT) || el === 'H' || !s.atoms[i]) return s; const n = clone(s); n.atoms[i].el = el; return n; }
export function moveAtom(s, i, x, y) { if (!s.atoms[i]) return s; const n = clone(s); n.atoms[i].x = fin(x); n.atoms[i].y = fin(y); return n; }
export function removeAtom(s, i) {
  if (!s.atoms[i]) return s;
  const n = { atoms: s.atoms.filter((_, k) => k !== i).map((a) => ({ ...a })), bonds: [] };
  for (const b of s.bonds) { if (b.a === i || b.b === i) continue; n.bonds.push({ a: b.a > i ? b.a - 1 : b.a, b: b.b > i ? b.b - 1 : b.b, order: b.order }); }
  return n;
}
export function bond(s, a, b) {
  if (a === b || !s.atoms[a] || !s.atoms[b]) return s;
  const n = clone(s), e = n.bonds.find((k) => (k.a === a && k.b === b) || (k.a === b && k.b === a));
  if (e) e.order = e.order >= 3 ? 1 : e.order + 1; else n.bonds.push({ a, b, order: 1 });
  return n;
}
export function removeBond(s, a, b) { return { atoms: s.atoms.map((x) => ({ ...x })), bonds: s.bonds.filter((k) => !((k.a === a && k.b === b) || (k.a === b && k.b === a))).map((k) => ({ ...k })) }; }
export function addRing(s, n, cx, cy, { aromatic = false, bondLength = 40 } = {}) {
  if (!(n >= 3 && n <= 8)) throw new Error('A ring has 3 to 8 atoms.');
  if (s.atoms.length + n > MAX_ATOMS) throw new Error('A sketch holds up to ' + MAX_ATOMS + ' atoms.');
  const t = clone(s), base = t.atoms.length, r = bondLength / (2 * Math.sin(Math.PI / n));
  for (let k = 0; k < n; k++) t.atoms.push({ el: 'C', x: fin(cx) + r * Math.cos(2 * Math.PI * k / n - Math.PI / 2), y: fin(cy) + r * Math.sin(2 * Math.PI * k / n - Math.PI / 2), charge: 0 });
  for (let k = 0; k < n; k++) t.bonds.push({ a: base + k, b: base + (k + 1) % n, order: aromatic && n % 2 === 0 ? (k % 2 ? 1 : 2) : 1 });
  return t;
}
export function nearest(s, x, y, within = 14) {
  let best = -1, d2 = within * within;
  s.atoms.forEach((a, i) => { const d = (a.x - x) ** 2 + (a.y - y) ** 2; if (d <= d2) { d2 = d; best = i; } });
  return best;
}
export function nearestBond(s, x, y, within = 8) {
  let best = -1, dm = within;
  s.bonds.forEach((b, k) => {
    const A = s.atoms[b.a], B = s.atoms[b.b], dx = B.x - A.x, dy = B.y - A.y, L2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - A.x) * dx + (y - A.y) * dy) / L2));
    const d = Math.hypot(x - (A.x + t * dx), y - (A.y + t * dy)); if (d < dm) { dm = d; best = k; }
  });
  return best;
}

export function toMolblock(s, name = '') {
  const pad = (v, w) => String(v).padStart(w), padR = (v, w) => String(v).padEnd(w), k = 1 / 40;   // 40 screen units = one bond length of 1 (any scale is fine for a MOL file)
  const L = [String(name).replace(/[\r\n]/g, ' ').slice(0, 80), '  cc-process', '', pad(s.atoms.length, 3) + pad(s.bonds.length, 3) + '  0  0  0  0  0  0  0  0999 V2000'];
  const ch = { 1: 3, 2: 2, 3: 1, '-1': 5, '-2': 6, '-3': 7 };
  s.atoms.forEach((a) => L.push(pad((a.x * k * 1.5).toFixed(4), 10) + pad((-a.y * k * 1.5).toFixed(4), 10) + pad('0.0000', 10) + ' ' + padR(a.el, 3) + ' 0' + pad(a.charge ? (ch[a.charge] || 0) : 0, 3) + '  0  0  0  0  0  0  0  0  0  0'));
  s.bonds.forEach((b) => L.push(pad(b.a + 1, 3) + pad(b.b + 1, 3) + pad(b.order, 3) + '  0'));
  L.push('M  END'); return L.join('\n') + '\n';
}
export function toMolecule(s) { return fromMol(toMolblock(s)); }

export function toSmiles(s) {
  const n = s.atoms.length; if (!n) return '';
  const mol = toMolecule(s), adj = Array.from({ length: n }, () => []);
  s.bonds.forEach((b, k) => { adj[b.a].push([b.b, k]); adj[b.b].push([b.a, k]); });
  const visited = new Array(n).fill(false), ringAt = Array.from({ length: n }, () => []), closure = new Map(), used = new Set(); let nextRing = 1;
  const symbol = (i) => {
    const a = mol.atoms[i], el = s.atoms[i].el, q = s.atoms[i].charge || 0;
    if (ORGANIC.has(el) && !q) return el === 'Cl' || el === 'Br' ? el : el;
    return '[' + el + (a.h ? (a.h === 1 ? 'H' : 'H' + a.h) : '') + (q ? (q > 0 ? '+' + (q > 1 ? q : '') : '-' + (q < -1 ? -q : '')) : '') + ']';
  };
  const bondSym = (k) => ({ 1: '', 2: '=', 3: '#' }[s.bonds[k].order] ?? '');
  // pass 1: a DFS that finds the ring-closure bonds
  const tree = new Set(), order = [];
  const find = (u, from) => { visited[u] = true; order.push(u); for (const [v, k] of adj[u]) { if (k === from) continue; if (!visited[v]) { tree.add(k); find(v, k); } } };
  const starts = []; for (let i = 0; i < n; i++) if (!visited[i]) { starts.push(i); find(i, -1); }
  for (let k = 0; k < s.bonds.length; k++) if (!tree.has(k)) { const lab = nextRing++; closure.set(k, lab); ringAt[s.bonds[k].a].push(k); ringAt[s.bonds[k].b].push(k); }
  const seen = new Array(n).fill(false);
  const write = (u, from) => {
    seen[u] = true; let out = symbol(u);
    for (const k of ringAt[u]) { const lab = closure.get(k); out += (used.has(k) ? '' : bondSym(k)) + (lab > 9 ? '%' + lab : lab); used.add(k); }
    const kids = adj[u].filter(([v, k]) => k !== from && tree.has(k) && !seen[v]);
    kids.forEach(([v, k], idx) => { const piece = bondSym(k) + write(v, k); out += idx < kids.length - 1 ? '(' + piece + ')' : piece; });
    return out;
  };
  return starts.map((u) => write(u, -1)).join('.');
}
export function fromMolecule(mol) {
  const P = layout2D(mol), s = newSketch();
  mol.atoms.forEach((a, i) => s.atoms.push({ el: a.el, x: P[i][0] * 40 / 1.5 + 120, y: P[i][1] * 40 / 1.5 + 120, charge: a.charge || 0 }));
  for (const b of mol.bonds) s.bonds.push({ a: b.a, b: b.b, order: b.order === 1.5 ? 1 : b.order });
  kekulise(mol, s);
  return s;
}
/** Aromatic bonds become alternating single and double ones: a maximum matching (Kuhn) on the aromatic atoms that must carry a double bond (carbon; nitrogen with no H and two neighbours). */
function kekulise(mol, s) {
  const n = mol.atoms.length, deg = new Array(n).fill(0); for (const b of mol.bonds) { deg[b.a]++; deg[b.b]++; }
  const need = mol.atoms.map((a, i) => a.aromatic && (a.el === 'C' || (a.el === 'N' && !a.h && deg[i] === 2 && !a.charge)));
  const arom = mol.bonds.map((b, k) => ({ k, a: b.a, b: b.b })).filter((e) => mol.bonds[e.k].order === 1.5 && need[e.a] && need[e.b]);
  const adj = Array.from({ length: n }, () => []); for (const e of arom) { adj[e.a].push([e.b, e.k]); adj[e.b].push([e.a, e.k]); }
  const mate = new Array(n).fill(-1), via = new Array(n).fill(-1);
  const try1 = (u, seen) => { for (const [v, k] of adj[u]) { if (seen.has(v)) continue; seen.add(v); if (mate[v] < 0 || try1(mate[v], seen)) { mate[v] = u; via[v] = k; mate[u] = v; via[u] = k; return true; } } return false; };
  for (let i = 0; i < n; i++) if (need[i] && mate[i] < 0) try1(i, new Set([i]));
  for (let i = 0; i < n; i++) if (mate[i] >= 0 && mate[mate[i]] === i && via[i] >= 0) s.bonds[via[i]].order = 2;
}
export const fromSmiles = (text) => fromMolecule(parse(text));

export function problems(s) {
  const out = [];
  if (!s.atoms.length) return [{ code: 'sketch.empty', severity: 'info', text: 'The sketch is empty.' }];
  const sum = s.atoms.map(() => 0); for (const b of s.bonds) { sum[b.a] += b.order; sum[b.b] += b.order; }
  s.atoms.forEach((a, i) => { const v = VAL[a.el]; if (v && !a.charge && sum[i] > (a.el === 'S' ? 6 : a.el === 'P' ? 5 : v)) out.push({ code: 'sketch.valence', severity: 'error', text: a.el + ' atom ' + (i + 1) + ' has bond order ' + sum[i] + ', more than it can hold.' }); });
  const seen = new Set([0]), q = [0], adj = s.atoms.map(() => []); for (const b of s.bonds) { adj[b.a].push(b.b); adj[b.b].push(b.a); }
  while (q.length) { const u = q.pop(); for (const v of adj[u]) if (!seen.has(v)) { seen.add(v); q.push(v); } }
  if (seen.size < s.atoms.length) out.push({ code: 'sketch.pieces', severity: 'info', text: 'The sketch has more than one separate piece.' });
  return out;
}
/** Hill-order formula of the sketch (hydrogens from valence). */
export function formulaOf(s) { return formula(toMolecule(s)); }
