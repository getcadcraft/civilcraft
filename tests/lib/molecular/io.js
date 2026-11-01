/* SPDX-License-Identifier: Apache-2.0 */
/**
 * io.js — XYZ and PDB text in and out (open file formats; a format is not code). DOM-free. Atom records only: PDB CRYST1, ATOM/HETATM and TER/END; no
 * residue chains, secondary structure or connectivity are interpreted. Anything unreadable is refused with a message, nothing is guessed.
 */
const clean = (v, n) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').slice(0, n);
export function toXYZ(sys, comment = '') {
  const L = [String(sys.N), clean(comment || 'cc-molecular t=' + sys.time, 120)];
  for (let i = 0; i < sys.N; i++) L.push(clean(sys.types[sys.type[i]].element || sys.types[sys.type[i]].name, 3).padEnd(3) + ' ' + [0, 1, 2].map((d) => sys.x[3 * i + d].toFixed(6).padStart(14)).join(''));
  return L.join('\n') + '\n';
}
/** → { atoms: [{ el, x, y, z }], comment } */
export function fromXYZ(text) {
  const L = String(text).split(/\r?\n/), n = parseInt(L[0], 10); if (!(n > 0 && n <= 100000) || L.length < n + 2) throw new Error('Not an XYZ file: the first line is the atom count.');
  const atoms = []; for (let i = 0; i < n; i++) { const p = L[2 + i].trim().split(/\s+/); const x = +p[1], y = +p[2], z = +p[3]; if (p.length < 4 || ![x, y, z].every(Number.isFinite)) throw new Error('Bad atom line ' + (i + 1)); atoms.push({ el: clean(p[0], 3), x, y, z }); }
  return { atoms, comment: clean(L[1], 200) };
}
export function toPDB(sys, name = 'MOL') {
  const L = [`CRYST1${sys.box[0].toFixed(3).padStart(9)}${sys.box[1].toFixed(3).padStart(9)}${sys.box[2].toFixed(3).padStart(9)}  90.00  90.00  90.00 P 1           1`];
  for (let i = 0; i < sys.N; i++) { const el = clean(sys.types[sys.type[i]].element || sys.types[sys.type[i]].name, 2); L.push('ATOM  ' + String(i + 1).padStart(5) + ' ' + el.padEnd(4) + ' ' + clean(name, 3).padEnd(3) + ' A   1    ' + [0, 1, 2].map((d) => sys.x[3 * i + d].toFixed(3).padStart(8)).join('') + '  1.00  0.00          ' + el.padStart(2)); }
  L.push('END'); return L.join('\n') + '\n';
}
/** → { box: [a, b, c] | null, atoms: [{ el, x, y, z }] } */
export function fromPDB(text) {
  let box = null; const atoms = [];
  for (const l of String(text).split(/\r?\n/)) {
    if (l.startsWith('CRYST1')) box = [+l.slice(6, 15), +l.slice(15, 24), +l.slice(24, 33)];
    else if (l.startsWith('ATOM') || l.startsWith('HETATM')) { const x = +l.slice(30, 38), y = +l.slice(38, 46), z = +l.slice(46, 54); if (![x, y, z].every(Number.isFinite)) throw new Error('Bad coordinates in: ' + clean(l, 40)); atoms.push({ el: clean(l.slice(76, 78).trim() || l.slice(12, 16).trim().replace(/\d/g, ''), 3), x, y, z }); }
    if (atoms.length > 100000) throw new Error('More than 100000 atoms.');
  }
  if (!atoms.length) throw new Error('No ATOM or HETATM records.');
  if (box && !box.every((v) => v > 0)) box = null;
  return { box, atoms };
}
