/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Ladder diagram (IEC 61131-3 LD) as a power-flow graph, the same shape PLCopen XML uses: nodes with `in` lists; several inputs on one node are
 * wired together (OR), a node passes power when it has power and its own condition holds. Rungs run top to bottom, every box is called every scan.
 *   left {id} · contact {id, var, kind NO|NC|P|N, in} · box {id, fb, inst, args, pin, out, in} · coil {id, var, kind out|neg|set|reset, in} · right {id, in}
 */
import { problem } from './st.js';

export const CONTACTS = ['NO', 'NC', 'P', 'N'], COILS = ['out', 'neg', 'set', 'reset'];

/** Build one rung from a tree: ['NO','x'] · ['series', …] · ['par', …] · ['box','TON','T1',{PT:'T#2s'}] and a list of coils [['out','Motor']]. */
export function rung(tree, coils, comment = '') {
  const nodes = [{ id: 1, t: 'left' }]; let next = 2;
  const add = (n) => { n.id = next++; nodes.push(n); return n.id; };
  const build = (t, ins) => {
    const [h, ...rest] = t;
    if (h === 'series') { let cur = ins; for (const x of rest) cur = build(x, cur); return cur; }
    if (h === 'par') { const outs = []; for (const x of rest) outs.push(...build(x, ins)); return outs; }
    if (h === 'box') {   // an argument given as a tree (an array) is a second power input, e.g. the reset of a counter
      const args = {}, extra = {};
      for (const [a, v] of Object.entries(rest[2] || {})) { if (Array.isArray(v)) extra[a] = build(v, [1]); else args[a] = v; }
      const n = { t: 'box', fb: rest[0], inst: rest[1], args, pin: rest[3] || defaultPin(rest[0]), out: rest[4] || defaultOut(rest[0]), in: ins };
      if (Object.keys(extra).length) n.ins = extra;
      return [add(n)];
    }
    if (CONTACTS.includes(h)) return [add({ t: 'contact', kind: h, var: rest[0], in: ins })];
    throw new Error('Unknown ladder element ' + h);
  };
  const outs = build(tree, [1]);
  for (const [kind, v] of coils) add({ t: 'coil', kind, var: v, in: outs });
  add({ t: 'right', in: outs });
  return { comment, nodes };
}
const defaultPin = (fb) => ({ TON: 'IN', TOF: 'IN', TP: 'IN', CTU: 'CU', CTD: 'CD', R_TRIG: 'CLK', F_TRIG: 'CLK', RS: 'SET', SR: 'SET1' }[fb] || 'IN');
const defaultOut = (fb) => ({ RS: 'Q1', SR: 'Q1', CTUD: 'QU' }[fb] || 'Q');

/** Run the rungs once. env: {get(name), set(name, v), box(node, powerIn) → boolean, mem: Map}. Returns problems (a cycle in a rung is one, and the loop is cut). */
export function execLadder(body, env) {
  const problems = [];
  body.rungs.forEach((r, ri) => {
    const power = new Map(), busy = new Set(), byId = new Map(r.nodes.map((n) => [n.id, n]));
    const p = (id) => {
      if (power.has(id)) return power.get(id);
      const n = byId.get(id); if (!n) return false;
      if (busy.has(id)) { problems.push(problem('ladder-cycle', 'error', 'Rung ' + (ri + 1) + ' has a loop in its wiring', { rung: ri + 1 })); return false; }
      busy.add(id);
      const pin = n.t === 'left' ? true : (n.in || []).some((x) => p(x));
      let out = pin;
      if (n.t === 'contact') {
        const v = !!env.get(n.var), key = ri + ':' + n.id, prev = !!env.mem.get(key); env.mem.set(key, v);
        out = pin && (n.kind === 'NO' ? v : n.kind === 'NC' ? !v : n.kind === 'P' ? v && !prev : !v && prev);
      } else if (n.t === 'box') {
        const extra = {}; for (const [k, ids] of Object.entries(n.ins || {})) extra[k] = ids.some((x) => p(x));
        out = !!env.box(n, pin, extra);
      }
      else if (n.t === 'coil') {
        if (n.kind === 'out') env.set(n.var, pin); else if (n.kind === 'neg') env.set(n.var, !pin);
        else if (pin) env.set(n.var, n.kind === 'set');
      }
      busy.delete(id); power.set(id, out); return out;
    };
    for (const n of r.nodes) p(n.id);
  });
  return problems;
}

/** Ladder → Structured Text text. Same scan semantics: contacts read the variable now, boxes are calls, coils are assignments. → {vars:[{name,type}], text} */
export function ladderToST(body) {
  const vars = [], lines = []; let k = 0;
  body.rungs.forEach((r, ri) => {
    if (r.comment) lines.push('(* ' + String(r.comment).replace(/\*\)/g, '* )') + ' *)');
    const byId = new Map(r.nodes.map((n) => [n.id, n])), memo = new Map(), busy = new Set();
    const expr = (id) => {
      if (memo.has(id)) return memo.get(id);
      const n = byId.get(id); if (!n) return 'FALSE';
      if (busy.has(id)) return 'FALSE'; busy.add(id);
      const ins = n.t === 'left' ? ['TRUE'] : (n.in || []).map(expr);
      const pin = ins.length === 1 ? ins[0] : '(' + ins.join(' OR ') + ')';
      let out = pin;
      if (n.t === 'contact') {
        let c;
        if (n.kind === 'NO') c = n.var; else if (n.kind === 'NC') c = 'NOT ' + n.var;
        else { const e = '_ldEdge' + (++k); vars.push({ name: e, type: n.kind === 'P' ? 'R_TRIG' : 'F_TRIG' }); lines.push(e + '(CLK := ' + n.var + ');'); c = e + '.Q'; }
        out = pin === 'TRUE' ? c : pin + ' AND ' + c;
      } else if (n.t === 'box') {
        const extra = Object.entries(n.ins || {}).map(([a, ids]) => a + ' := ' + (ids.length === 1 ? expr(ids[0]) : '(' + ids.map(expr).join(' OR ') + ')'));
        const args = [n.pin + ' := ' + pin, ...extra, ...Object.entries(n.args || {}).map(([a, v]) => a + ' := ' + v)];
        if (!vars.some((v) => v.name === n.inst)) vars.push({ name: n.inst, type: n.fb });
        lines.push(n.inst + '(' + args.join(', ') + ');'); out = n.inst + '.' + n.out;
      }
      busy.delete(id); memo.set(id, out); return out;
    };
    for (const n of r.nodes) if (n.t === 'box' || n.t === 'contact') expr(n.id);
    for (const n of r.nodes) {
      if (n.t !== 'coil') continue;
      const e = (n.in || []).length ? (n.in.length === 1 ? expr(n.in[0]) : '(' + n.in.map(expr).join(' OR ') + ')') : 'FALSE';
      if (n.kind === 'out') lines.push(n.var + ' := ' + e + ';'); else if (n.kind === 'neg') lines.push(n.var + ' := NOT (' + e + ');');
      else lines.push('IF ' + e + ' THEN ' + n.var + ' := ' + (n.kind === 'set' ? 'TRUE' : 'FALSE') + '; END_IF;');
    }
  });
  return { vars, text: lines.join('\n') };
}
