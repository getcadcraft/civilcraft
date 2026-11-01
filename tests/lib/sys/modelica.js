/* SPDX-License-Identifier: Apache-2.0 */
/**
 * modelica.js — reads a subset of Modelica (the language specification is open, modelica.org) into a cc-sys Model (0.8 XE.12; DOM-free).
 * What it reads: a flat `model … end …;` of parameters (`parameter Real R = 2*3.3e3;`), component declarations with modifiers
 * (`Modelica.Electrical.Analog.Basic.Resistor R1(R = 100);`, `Capacitor C1(C = 1e-6, v(start = 0))`) and `connect(a.p, b.n);` equations.
 * Components (by the last two parts of the class name): Electrical.Analog.Basic — Resistor, Capacitor, Inductor, Ground; Electrical.Analog.Sources —
 * ConstantVoltage, StepVoltage, SineVoltage, ConstantCurrent; HeatTransfer.Components — HeatCapacitor, ThermalConductor; HeatTransfer.Sources —
 * FixedTemperature, FixedHeatFlow. Anything else (other classes, `der()` equations, algorithms, packages, extends) is **named and reported as a
 * problem**, never skipped silently. Mechanical classes of the standard library carry position, not velocity, so they are not mapped here.
 * Expressions are parsed by a small recursive-descent parser (numbers, parameters, + − * / ^, parentheses): no eval.
 *   readModelica(text) → { ok, model, name, problems }
 */
import { Model, step, sine } from './model.js';
import { problem } from './solve.js';

function strip(src) { return src.replace(/"[^"]*"/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ').replace(/annotation\s*\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)\s*;?/g, ' '); }

function evalExpr(text, vars) {
  const toks = text.match(/\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?|[A-Za-z_]\w*|[()+\-*/^]/g) || []; let i = 0;
  const peek = () => toks[i], next = () => toks[i++];
  function prim() {
    const t = next();
    if (t === undefined) throw new Error('unexpected end of expression');
    if (t === '(') { const v = add(); if (next() !== ')') throw new Error('missing )'); return v; }
    if (t === '-') return -pow(); if (t === '+') return pow();
    if (/^[\d.]/.test(t)) return parseFloat(t);
    if (Object.prototype.hasOwnProperty.call(vars, t)) return vars[t];
    if (t === 'pi') return Math.PI;
    throw new Error('unknown name ' + t);
  }
  function pow() { const b = prim(); if (peek() === '^') { next(); return Math.pow(b, pow()); } return b; }
  function mul() { let v = pow(); while (peek() === '*' || peek() === '/') v = next() === '*' ? v * pow() : v / pow(); return v; }
  function add() { let v = mul(); while (peek() === '+' || peek() === '-') v = next() === '+' ? v + mul() : v - mul(); return v; }
  const v = add(); if (i < toks.length) throw new Error('unexpected ' + toks[i]); return v;
}
/** split on commas at paren depth 0 */
function splitTop(s) { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur); return out; }

// class → { ports, make(name, p, node) → element[] , params: [...] }
const CLASSES = {
  'Basic.Resistor': { ports: ['p', 'n'], par: { R: 1 }, make: (n, p, a) => [{ id: n, type: 'resistor', a: a.p, b: a.n, R: p.R }] },
  'Basic.Capacitor': { ports: ['p', 'n'], par: { C: 1 }, make: (n, p, a, st) => [{ id: n, type: 'capacitor', a: a.p, b: a.n, C: p.C, ...(st.v != null ? { ic: st.v } : {}) }] },
  'Basic.Inductor': { ports: ['p', 'n'], par: { L: 1 }, make: (n, p, a, st) => [{ id: n, type: 'inductor', a: a.p, b: a.n, L: p.L, ...(st.i != null ? { ic: st.i } : {}) }] },
  'Basic.Ground': { ports: ['p'], ground: 'p', par: {}, make: () => [] },
  'Sources.ConstantVoltage': { ports: ['p', 'n'], par: { V: 1 }, make: (n, p, a) => [{ id: n, type: 'vsource', a: a.p, b: a.n, V: p.V }] },
  'Sources.StepVoltage': { ports: ['p', 'n'], par: { V: 1, startTime: 0, offset: 0 }, make: (n, p, a) => [{ id: n, type: 'vsource', a: a.p, b: a.n, V: step(p.startTime, p.offset, p.offset + p.V) }] },
  'Sources.SineVoltage': { ports: ['p', 'n'], par: { V: 1, freqHz: 1, offset: 0, phase: 0 }, make: (n, p, a) => [{ id: n, type: 'vsource', a: a.p, b: a.n, V: sine(p.V, p.freqHz, p.offset, p.phase) }] },
  'Sources.ConstantCurrent': { ports: ['p', 'n'], par: { I: 1 }, make: (n, p, a) => [{ id: n, type: 'isource', a: a.p, b: a.n, I: p.I }] },
  'Components.HeatCapacitor': { ports: ['port'], domain: 'thermal', par: { C: 1 }, make: (n, p, a, st) => [{ id: n, type: 'thermalCapacity', a: a.port, C: p.C, ...(st.T != null ? { ic: st.T } : {}) }] },
  'Components.ThermalConductor': { ports: ['port_a', 'port_b'], domain: 'thermal', par: { G: 1 }, make: (n, p, a) => [{ id: n, type: 'thermalResistance', a: a.port_a, b: a.port_b, R: 1 / p.G }] },
  'Sources.FixedTemperature': { ports: ['port'], domain: 'thermal', par: { T: 293.15 }, make: (n, p, a) => [{ id: n, type: 'temperatureSource', a: a.port, T: p.T }] },
  'Sources.FixedHeatFlow': { ports: ['port'], domain: 'thermal', par: { Q_flow: 0 }, make: (n, p, a) => [{ id: n, type: 'heatSource', a: 'gnd', b: a.port, Q: p.Q_flow }] },
};
const keyOf = (cls) => cls.split('.').slice(-2).join('.');

export function readModelica(text) {
  const problems = [], P = (code, msg) => problems.push(problem('modelica.' + code, 'error', msg, []));
  const src = strip(text), m = src.match(/\b(?:model|block)\s+(\w+)([\s\S]*?)\bend\s+\1\s*;/);
  if (!m) { P('nomodel', 'No `model … end …;` found.'); return { ok: false, problems }; }
  const name = m[1], body = m[2], eqIdx = body.search(/\bequation\b/);
  const decls = (eqIdx < 0 ? body : body.slice(0, eqIdx)), eqs = eqIdx < 0 ? '' : body.slice(eqIdx + 8);
  if (/\balgorithm\b|\bextends\b|\bwhen\b|\bif\b.*\bthen\b/.test(src)) P('unsupported', 'algorithm sections, extends, when and if are not part of the supported subset.');
  const vars = {}, comps = new Map();
  for (const raw of decls.split(';').map((s) => s.trim()).filter(Boolean)) {
    let mm = raw.match(/^(?:final\s+)?parameter\s+(?:Real|Modelica\.SIunits\.\w+|Integer)\s+(\w+)\s*=\s*([\s\S]+)$/);
    if (mm) { try { vars[mm[1]] = evalExpr(mm[2], vars); } catch (e) { P('param', `parameter ${mm[1]}: ${e.message}`); } continue; }
    mm = raw.match(/^((?:\w+\.)+\w+)\s+(\w+)\s*(?:\(([\s\S]*)\))?$/);
    if (!mm) { P('decl', `Cannot read the declaration "${raw.slice(0, 60)}".`); continue; }
    const [, cls, cname, mods] = mm, C = CLASSES[keyOf(cls)];
    if (!C) { P('class', `${cname}: the class ${cls} is not in the supported subset.`); continue; }
    const par = { ...C.par }, st = {};
    for (const part of splitTop(mods || '')) {
      const sm = part.trim().match(/^(\w+)\s*\(\s*start\s*=\s*([\s\S]+)\)$/);
      if (sm) { try { st[sm[1]] = evalExpr(sm[2], vars); } catch (e) { P('mod', `${cname}.${sm[1]}(start): ${e.message}`); } continue; }
      const em = part.trim().match(/^(\w+)\s*=\s*([\s\S]+)$/);
      if (!em) { if (part.trim()) P('mod', `${cname}: cannot read the modifier "${part.trim()}".`); continue; }
      if (!(em[1] in par)) { P('mod', `${cname}: ${cls} has no parameter ${em[1]} in this subset.`); continue; }
      try { par[em[1]] = evalExpr(em[2], vars); } catch (e) { P('mod', `${cname}.${em[1]}: ${e.message}`); }
    }
    comps.set(cname, { C, par, st, cls });
  }
  // connections → union-find over "comp.port"
  const parent = new Map(); const find = (a) => { if (!parent.has(a)) parent.set(a, a); let r = a; while (parent.get(r) !== r) r = parent.get(r); parent.set(a, r); return r; };
  const dom = new Map();
  for (const [cn, c] of comps) for (const pt of c.C.ports) { find(cn + '.' + pt); dom.set(cn + '.' + pt, c.C.domain || 'electrical'); }
  for (const e of eqs.split(';').map((s) => s.trim()).filter(Boolean)) {
    const cm = e.match(/^connect\s*\(\s*([\w.]+)\s*,\s*([\w.]+)\s*\)$/);
    if (!cm) { P('equation', `Only connect(a, b) equations are supported; found "${e.slice(0, 60)}".`); continue; }
    const [a, b] = [cm[1], cm[2]];
    if (!parent.has(a) || !parent.has(b)) { P('connect', `connect(${a}, ${b}): unknown port.`); continue; }
    if (dom.get(a) !== dom.get(b)) { P('domain', `connect(${a}, ${b}) joins ${dom.get(a)} to ${dom.get(b)}.`); continue; }
    parent.set(find(a), find(b));
  }
  if (problems.length) return { ok: false, name, problems };
  const gnd = new Set(); for (const [cn, c] of comps) if (c.C.ground) gnd.add(find(cn + '.' + c.C.ground));
  const names = new Map(); let k = 0; const nodeOf = (port) => { const r = find(port); if (gnd.has(r)) return 'gnd'; if (!names.has(r)) names.set(r, 'n' + ++k); return names.get(r); };
  const model = new Model(name);
  for (const [cn, c] of comps) {
    const a = {}; for (const pt of c.C.ports) a[pt] = nodeOf(cn + '.' + pt);
    for (const el of c.C.make(cn, c.par, a, c.st)) model.add(el);
  }
  if (!gnd.size && [...comps.values()].some((c) => !c.C.domain)) problems.push(problem('modelica.noground', 'warning', 'The electrical part has no Ground component, so its potentials are undetermined.', []));
  return { ok: true, model, name, problems };
}
