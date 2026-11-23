/* SPDX-License-Identifier: Apache-2.0 */
/**
 * mechanism.js — a reaction-mechanism file loader and a batch reactor on it (0.8 Track CH, CH.3; DOM-free, deterministic).
 *
 *   parseYaml(text)               the small YAML subset mechanism files use: block maps and lists, flow maps {a: 1} and lists [1, 2], quoted and plain
 *                                 scalars, numbers, comments. No anchors, tags, multi-document files or multi-line scalars (refused with a message).
 *   loadMechanism(text, opts)     a mechanism file in the open YAML layout of the Cantera project (BSD-3; the FORMAT is read, none of its code is
 *                                 used): species with NASA 7-coefficient thermo, reactions with Arrhenius rate constants, reversible or not, with
 *                                 an optional third-body efficiency table. Falloff, plog, chebyshev, surface and electrochemical reactions are NOT
 *                                 supported: each is listed in `problems` (rule 29) and left out, never guessed. The file's `units:` block (length,
 *                                 quantity, activation-energy) is honoured and everything is converted to SI (m3, mol, s, J/mol).
 *   speciesThermo(sp, T)          cp/R, H/RT, S/R from the NASA 7 form (two temperature ranges).
 *   batchReactor(mech, spec)      closed vessel, constant volume: isothermal, or adiabatic with the energy balance on internal energy; stiff integration.
 * The reverse rate comes from the equilibrium constant of the thermodynamic data (Kc = exp(-dG/RT) (P0/RT)^dnu, P0 = 101325 Pa unless the
 * file says otherwise), so the mechanism's rates and thermo stay consistent. A run on a real mechanism against the Cantera program itself needs that program
 * (workstation11a does not have it); the tests use a small made-up mechanism with closed-form answers.
 */
import { stiff } from './dynamics.js';
import { problem } from './report.js';

const RGAS = 8.31446261815324;

// ---- YAML subset ------------------------------------------------------------------------------------------------------------------
function scalar(s) {
  s = s.trim();
  if (s === '' || s === '~' || s === 'null') return null;
  if (s === 'true' || s === 'True') return true; if (s === 'false' || s === 'False') return false;
  if ((s[0] === '"' && s.endsWith('"')) || (s[0] === "'" && s.endsWith("'"))) return s.slice(1, -1);
  if (/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(s)) return Number(s);
  return s;
}
function splitTop(s, sep = ',') {                              // split on a separator outside brackets and quotes
  const out = []; let depth = 0, q = '', cur = '';
  for (const ch of s) {
    if (q) { cur += ch; if (ch === q) q = ''; continue; }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
    if (ch === '{' || ch === '[') depth++; if (ch === '}' || ch === ']') depth--;
    if (ch === sep && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  if (cur.trim() !== '' || out.length) out.push(cur);
  return out;
}
function keyColon(s) {                                          // index of the colon that ends a mapping key, or -1
  let q = '', depth = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) { if (ch === q) q = ''; continue; }
    if (ch === '"' || ch === "'") { q = ch; continue; }
    if (ch === '{' || ch === '[') depth++; if (ch === '}' || ch === ']') depth--;
    if (ch === ':' && depth === 0 && (i === s.length - 1 || s[i + 1] === ' ')) return i;
  }
  return -1;
}
function flow(s) {
  s = s.trim();
  if (s[0] === '{') { const o = {}; for (const part of splitTop(s.slice(1, -1))) { if (!part.trim()) continue; const k = keyColon(part); if (k < 0) throw new Error('bad flow map: ' + part); o[String(scalar(part.slice(0, k)))] = flow(part.slice(k + 1)); } return o; }
  if (s[0] === '[') return splitTop(s.slice(1, -1)).filter((p) => p.trim() !== '').map(flow);
  return scalar(s);
}
function stripComment(line) {
  let q = ''; for (let i = 0; i < line.length; i++) { const ch = line[i]; if (q) { if (ch === q) q = ''; continue; } if (ch === '"' || ch === "'") q = ch; else if (ch === '#' && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i); }
  return line;
}
export function parseYaml(text) {
  if (/^\s*---\s*$/m.test(text.replace(/^\s*---\s*\n/, ''))) throw new Error('YAML: more than one document is not supported');
  const raw = text.split(/\r?\n/).map((l) => stripComment(l).replace(/\s+$/, '')).map((l) => ({ ind: l.length - l.trimStart().length, t: l.trim() })).filter((l) => l.t !== '' && l.t !== '---');
  for (const l of raw) { if (/(^|:\s+|^-\s+)[&*!][A-Za-z_]/.test(l.t)) throw new Error('YAML: anchors, aliases and tags are not supported'); if (/:\s*[|>][-+]?$/.test(l.t)) throw new Error('YAML: multi-line scalars are not supported'); }
  let pos = 0;
  function block(ind) {
    if (pos >= raw.length) return null;
    if (raw[pos].t.startsWith('- ') || raw[pos].t === '-') {
      const arr = [];
      while (pos < raw.length && raw[pos].ind === ind && (raw[pos].t.startsWith('- ') || raw[pos].t === '-')) {
        const body = raw[pos].t === '-' ? '' : raw[pos].t.slice(2);
        if (body === '') { pos++; arr.push(pos < raw.length && raw[pos].ind > ind ? block(raw[pos].ind) : null); continue; }
        if (keyColon(body) >= 0 && body[0] !== '{' && body[0] !== '[') {          // a map starting on the dash line: re-read it as an indented map
          const sub = ind + 2; raw[pos] = { ind: sub, t: body }; arr.push(block(sub));
        } else { pos++; arr.push(flow(body)); }
      }
      return arr;
    }
    const obj = {};
    while (pos < raw.length && raw[pos].ind === ind && !raw[pos].t.startsWith('- ')) {
      const t = raw[pos].t, k = keyColon(t); if (k < 0) throw new Error('YAML: expected "key: value" near "' + t.slice(0, 40) + '"');
      const key = String(scalar(t.slice(0, k))), rest = t.slice(k + 1).trim(); pos++;
      if (rest !== '') obj[key] = flow(rest);
      else if (pos < raw.length && (raw[pos].ind > ind || (raw[pos].ind === ind && raw[pos].t.startsWith('- ')))) obj[key] = block(raw[pos].ind);
      else obj[key] = null;
    }
    if (pos < raw.length && raw[pos].ind > ind) throw new Error('YAML: unexpected indentation near "' + raw[pos].t.slice(0, 40) + '"');
    return obj;
  }
  const out = block(raw.length ? raw[0].ind : 0);
  if (pos < raw.length) throw new Error('YAML: could not read past line "' + raw[pos].t.slice(0, 40) + '"');
  return out;
}

// ---- thermo -----------------------------------------------------------------------------------------------------------------------
function coeffsAt(sp, T) {
  const th = sp.thermo; if (!th || th.model !== 'NASA7') return null;
  const Tr = th['temperature-ranges']; const hi = T >= Tr[1] && th.data.length > 1 ? 1 : 0; return th.data[hi];
}
export function speciesThermo(sp, T) {
  const a = coeffsAt(sp, T); if (!a) throw new Error('species ' + sp.name + ' has no NASA7 thermo');
  const cpR = a[0] + a[1] * T + a[2] * T * T + a[3] * T ** 3 + a[4] * T ** 4;
  const hRT = a[0] + a[1] * T / 2 + a[2] * T * T / 3 + a[3] * T ** 3 / 4 + a[4] * T ** 4 / 5 + a[5] / T;
  const sR = a[0] * Math.log(T) + a[1] * T + a[2] * T * T / 2 + a[3] * T ** 3 / 3 + a[4] * T ** 4 / 4 + a[6];
  return { cpR, hRT, sR, gRT: hRT - sR };
}

// ---- mechanism --------------------------------------------------------------------------------------------------------------------
const LEN = { m: 1, cm: 0.01, mm: 0.001, km: 1000 }, QTY = { mol: 1, kmol: 1000, mmol: 0.001 };
const EA = { 'J/kmol': 1e-3, 'J/mol': 1, 'kJ/mol': 1e3, 'kJ/kmol': 1, 'cal/mol': 4.184, 'kcal/mol': 4184, 'K': RGAS, 'eV': 96485.33212 };
function side(s) {                                              // "2 H + O2" → { H: 2, O2: 1 }
  const o = {};
  for (const term of s.split(/\s+\+\s+/)) {
    const t = term.trim(); if (!t) continue; const m = t.match(/^(\d+\.?\d*)\s+(.+)$/) || t.match(/^(\d+\.?\d*)(\D.*)$/);
    const nu = m ? Number(m[1]) : 1, name = (m ? m[2] : t).trim(); o[name] = (o[name] || 0) + nu;
  }
  return o;
}
export function loadMechanism(text, opts = {}) {
  const doc = parseYaml(text), problems = [];
  const u = doc.units || {}, L = LEN[u.length || 'm'], Q = QTY[u.quantity || 'kmol'], eaFactor = EA[u['activation-energy'] || 'J/kmol'];
  if (L == null || Q == null || eaFactor == null) throw new Error('mechanism: unknown unit in the units block');
  const species = (doc.species || []).map((s) => ({ name: String(s.name), composition: s.composition || {}, thermo: s.thermo || null }));
  const names = species.map((s) => s.name), ix = Object.fromEntries(names.map((n, i) => [n, i]));
  for (const s of species) if (!s.thermo || s.thermo.model !== 'NASA7') problems.push(problem('mech.thermo', 'error', `Species ${s.name} has no NASA7 thermo; only NASA7 is read.`, [{ id: s.name }]));
  const reactions = [];
  (doc.reactions || []).forEach((r, k) => {
    const id = 'R' + (k + 1), eq = String(r.equation || ''), rev = /<=>/.test(eq), parts = eq.split(/\s*(?:<=>|=>)\s*/);
    const type = r.type || 'elementary', rate = r['rate-constant'];
    const skip = (why) => problems.push(problem('mech.unsupported', 'warning', `Reaction ${id} (${eq}) was left out: ${why}.`, [{ id }]));
    if (parts.length !== 2) return skip('the equation is not readable');
    if (!['elementary', 'three-body'].includes(type)) return skip(`type "${type}" is not supported`);
    if (!rate || rate.A == null) return skip('no Arrhenius rate constant');
    const reactants = side(parts[0].replace(/\s*\(\+\s*M\)\s*/g, '').replace(/\s*\+\s*M\s*$/, '')), products = side(parts[1].replace(/\s*\(\+\s*M\)\s*/g, '').replace(/\s*\+\s*M\s*$/, ''));
    for (const n of [...Object.keys(reactants), ...Object.keys(products)]) if (!(n in ix)) return skip(`species ${n} is not declared`);
    const order = Object.values(reactants).reduce((a, b) => a + b, 0) + (type === 'three-body' ? 1 : 0);
    const A = rate.A * Math.pow(L * L * L / Q, order - 1), Ea = (rate.Ea || 0) * eaFactor;      // m3, mol, s; J/mol
    const orders = r.orders || null;
    reactions.push({ id, equation: eq, reversible: rev, type, reactants, products, A, b: rate.b || 0, Ea, order, efficiencies: type === 'three-body' ? { default: r['default-efficiency'] ?? 1, ...(r.efficiencies || {}) } : null, orders });
  });
  return { species, names, index: ix, reactions, problems, p0: opts.p0 || 101325 };
}
export function rateConstant(rx, T) { return rx.A * Math.pow(T, rx.b) * Math.exp(-rx.Ea / (RGAS * T)); }
/** Concentration equilibrium constant Kc of a reaction (mol/m3 units). */
export function kcOf(mech, rx, T) {
  let dG = 0, dn = 0;
  for (const [n, nu] of Object.entries(rx.products)) { dG += nu * speciesThermo(mech.species[mech.index[n]], T).gRT; dn += nu; }
  for (const [n, nu] of Object.entries(rx.reactants)) { dG -= nu * speciesThermo(mech.species[mech.index[n]], T).gRT; dn -= nu; }
  return Math.exp(-dG) * Math.pow(mech.p0 / (RGAS * T), dn);
}
/** Net molar production rates (mol/m3/s) at concentrations C (mol/m3) and temperature T. */
export function production(mech, C, T) {
  const w = new Array(mech.names.length).fill(0), M = C.reduce((a, b) => a + Math.max(b, 0), 0);
  for (const rx of mech.reactions) {
    let kf = rateConstant(rx, T), kr = 0;
    if (rx.reversible) kr = kf / kcOf(mech, rx, T);
    let rf = kf, rr = kr;
    for (const [n, nu] of Object.entries(rx.reactants)) rf *= Math.pow(Math.max(C[mech.index[n]], 0), (rx.orders && rx.orders[n]) ?? nu);
    if (rx.reversible) for (const [n, nu] of Object.entries(rx.products)) rr *= Math.pow(Math.max(C[mech.index[n]], 0), nu);
    let mult = 1;
    if (rx.efficiencies) { mult = 0; mech.names.forEach((n, i) => { mult += (rx.efficiencies[n] ?? rx.efficiencies.default) * Math.max(C[i], 0); }); }
    const rate = (rf - rr) * mult;
    for (const [n, nu] of Object.entries(rx.reactants)) w[mech.index[n]] -= nu * rate;
    for (const [n, nu] of Object.entries(rx.products)) w[mech.index[n]] += nu * rate;
  }
  return w;
}
/** spec: { T (K), C0 { name: mol/m3 }, t (s), adiabatic?, samples? }  → { t[], T[], C[][], names, problems } */
export function batchReactor(mech, spec) {
  const n = mech.names.length, C0 = mech.names.map((nm) => spec.C0[nm] || 0), adiabatic = !!spec.adiabatic;
  const f = (t, y) => {
    const C = y.slice(0, n), T = adiabatic ? y[n] : spec.T, w = production(mech, C, T), d = w.slice();
    if (adiabatic) {                                                  // constant volume: sum(C cv) dT/dt = -sum(u_i w_i), u = h - RT
      let num = 0, den = 0; mech.species.forEach((sp, i) => { const th = speciesThermo(sp, T), u = RGAS * T * (th.hRT - 1), cv = RGAS * (th.cpR - 1); num += u * w[i]; den += Math.max(C[i], 0) * cv; });
      d.push(-num / Math.max(den, 1e-30));
    }
    return d;
  };
  const y0 = adiabatic ? [...C0, spec.T] : C0;
  const r = stiff(f, 0, y0, spec.t, { rtol: spec.rtol || 1e-8, atol: spec.atol || 1e-12 });
  const pts = r.points;
  return { names: mech.names, t: pts.map((p) => p[0]), C: pts.map((p) => p[1].slice(0, n)), T: pts.map((p) => (adiabatic ? p[1][n] : spec.T)), final: r.y.slice(0, n), problems: mech.problems.slice(), steps: r.steps };
}
