/* SPDX-License-Identifier: Apache-2.0 */
/**
 * spef.js — SPEF (IEEE 1481 Standard Parasitic Exchange Format) reader: header, units, name map, ports and per-net parasitics
 * (*D_NET with *CONN, *CAP — ground and coupling — and *RES; *R_NET totals). Written from the public description of the format.
 *
 *   readSpef(text) → { spef: { header, units, nameMap, ports, nets: [{ name, total, conns, caps, res, reduced? }] }, problems }
 *   netSummary(net) → { name, total, ground, coupling, resistance, nodes, conns }   (capacitance in the file's C_UNIT, resistance in R_UNIT)
 * Values written as triples (0.1:0.2:0.3) read as the middle (typical) value; the triple is kept in `tri`.
 */
import { prob } from './problem.js';

function lex(text) { const out = []; let line = 1; for (const raw of String(text).split('\n')) { const l = raw.replace(/\/\/.*$/, ''); const re = /"[^"]*"|\S+/g; let m; while ((m = re.exec(l))) out.push({ v: m[0], line }); line++; } return out; }
const num = (s) => { if (s.includes(':')) { const t = s.split(':').map(Number); return { v: t.length === 3 ? t[1] : t[0], tri: t }; } return { v: Number(s) }; };
const unq = (s) => (s && s[0] === '"' ? s.slice(1, -1) : s);
const HEADER = ['*SPEF', '*DESIGN', '*DATE', '*VENDOR', '*PROGRAM', '*VERSION', '*DESIGN_FLOW', '*DIVIDER', '*DELIMITER', '*BUS_DELIMITER'];

export function readSpef(text) {
  const t = lex(text), problems = [], spef = { header: {}, units: {}, nameMap: {}, ports: [], nets: [] };
  let i = 0; const at = () => t[i]?.v;
  const name = (s) => { if (!s) return s; const m = /^\*(\d+)(.*)$/.exec(s); if (!m) return s; const n = spef.nameMap[m[1]]; if (n === undefined) { problems.push(prob('spef.name', 'Name *' + m[1] + ' is not in the name map.', { severity: 'warning', line: t[i]?.line })); return s; } return n + m[2]; };
  while (i < t.length) {
    const k = at();
    if (HEADER.includes(k)) { const key = k.slice(1); i++; const vals = []; while (i < t.length && t[i].v[0] !== '*') vals.push(unq(t[i++].v)); spef.header[key] = vals.join(' '); continue; }
    if (/^\*[TCRL]_UNIT$/.test(k)) { spef.units[k[1].toLowerCase()] = { value: Number(t[i + 1].v), unit: t[i + 2].v }; i += 3; continue; }
    if (k === '*NAME_MAP') { i++; while (i < t.length && /^\*\d+$/.test(at())) { spef.nameMap[at().slice(1)] = unq(t[i + 1].v); i += 2; } continue; }
    if (k === '*PORTS' || k === '*PHYSICAL_PORTS') { i++; while (i < t.length && !/^\*[A-Z]/.test(at())) { const p = { name: name(at()), dir: t[i + 1]?.v }; i += 2; while (i < t.length && ['*C', '*L', '*S', '*D'].includes(at())) i += at() === '*C' ? 3 : at() === '*S' ? 3 : 2; spef.ports.push(p); } continue; }
    if (k === '*D_NET' || k === '*R_NET') {
      const line = t[i].line, net = { name: name(t[i + 1].v), total: num(t[i + 2].v).v, conns: [], caps: [], res: [] }; if (k === '*R_NET') net.reduced = true; i += 3;
      let sec = null;
      while (i < t.length && at() !== '*END') {
        const w = at();
        if (w === '*CONN' || w === '*CAP' || w === '*RES' || w === '*INDUC') { sec = w; i++; continue; }
        if (w === '*D_NET' || w === '*R_NET') { problems.push(prob('spef.end', 'Net ' + net.name + ' has no *END.', { line })); break; }
        if (sec === '*CONN' && (w === '*P' || w === '*I')) { const c = { kind: w[1], name: name(t[i + 1].v), dir: t[i + 2].v }; i += 3; while (i < t.length && ['*C', '*L', '*S', '*D'].includes(at())) { const a = at(); if (a === '*C') { c.at = [Number(t[i + 1].v), Number(t[i + 2].v)]; i += 3; } else if (a === '*L') { c.load = num(t[i + 1].v).v; i += 2; } else if (a === '*D') { c.driver = t[i + 1].v; i += 2; } else i += 3; } net.conns.push(c); continue; }
        if (sec === '*CONN' && w === '*N') { i += 2; while (i < t.length && at() === '*C') i += 3; continue; }
        if (sec === '*CAP') { // id node [node2] value
          let j = i + 1; const nodes = []; while (j < t.length && !/^-?[\d.]+(e[-+]?\d+)?(:|$)/i.test(t[j].v)) nodes.push(t[j++].v);
          const v = num(t[j].v); net.caps.push({ id: w, node: name(nodes[0]), node2: nodes[1] !== undefined ? name(nodes[1]) : undefined, value: v.v, tri: v.tri }); i = j + 1; continue;
        }
        if (sec === '*RES' || sec === '*INDUC') { const v = num(t[i + 3].v); (sec === '*RES' ? net.res : (net.induc ||= [])).push({ id: w, a: name(t[i + 1].v), b: name(t[i + 2].v), value: v.v, tri: v.tri }); i += 4; continue; }
        i++; // a word this reader does not use
      }
      if (at() === '*END') i++;
      for (const c of net.caps) if (c.tri === undefined) delete c.tri; for (const r of net.res) if (r.tri === undefined) delete r.tri;
      const s = netSummary(net); if (!net.reduced && net.caps.length && Math.abs(s.ground + s.coupling - net.total) > Math.max(1e-9, Math.abs(net.total) * 0.01)) problems.push(prob('spef.total', 'Net ' + net.name + ' says total capacitance ' + net.total + ' but its *CAP lines add to ' + +(s.ground + s.coupling).toPrecision(6) + '.', { line, severity: 'warning', about: [{ kind: 'net', id: net.name }] }));
      spef.nets.push(net); continue;
    }
    i++;
  }
  if (!spef.header.SPEF) problems.push(prob('spef.header', 'No *SPEF line: this may not be a SPEF file.', { severity: 'warning' }));
  return { spef, problems };
}

/** Totals for one net. Coupling capacitors count once for this net (their other node belongs to another net). */
export function netSummary(n) {
  let ground = 0, coupling = 0, r = 0; const nodes = new Set();
  for (const c of n.caps) { if (c.node2 !== undefined) coupling += c.value; else ground += c.value; nodes.add(c.node); }
  for (const x of n.res) { r += x.value; nodes.add(x.a); nodes.add(x.b); }
  return { name: n.name, total: n.total, ground, coupling, resistance: r, nodes: nodes.size, conns: n.conns.length };
}

/** Elmore delay from the driver to each sink through a resistor tree (R in R_UNIT, C in C_UNIT; the product is in their units). Loops are named. */
export function elmore(net) {
  const adj = new Map(), cap = new Map(), problems = [];
  for (const c of net.caps) if (c.node2 === undefined) cap.set(c.node, (cap.get(c.node) || 0) + c.value); else { cap.set(c.node, (cap.get(c.node) || 0) + c.value); }
  for (const r of net.res) { (adj.get(r.a) || adj.set(r.a, []).get(r.a)).push([r.b, r.value]); (adj.get(r.b) || adj.set(r.b, []).get(r.b)).push([r.a, r.value]); }
  const drv = net.conns.find((c) => (c.kind === 'I' && c.dir === 'O') || (c.kind === 'P' && c.dir === 'I'));
  if (!drv) return { delays: {}, problems: [prob('spef.driver', 'Net ' + net.name + ' has no driver in *CONN.', { severity: 'note' })] };
  // tree from the driver: parent, resistance to parent, downstream capacitance
  const parent = new Map([[drv.name, null]]), rTo = new Map([[drv.name, 0]]), order = [drv.name];
  for (let k = 0; k < order.length; k++) for (const [b, rv] of adj.get(order[k]) || []) { if (parent.has(b)) { if (parent.get(order[k]) !== b) problems.push(prob('spef.loop', 'Net ' + net.name + ' has a resistor loop; the delay uses a spanning tree.', { severity: 'note' })); continue; } parent.set(b, order[k]); rTo.set(b, rv); order.push(b); }
  const down = new Map(); for (let k = order.length - 1; k >= 0; k--) { const n = order[k]; down.set(n, (down.get(n) || 0) + (cap.get(n) || 0)); const p = parent.get(n); if (p !== null) down.set(p, (down.get(p) || 0) + down.get(n)); }
  const delay = new Map([[drv.name, 0]]); for (const n of order.slice(1)) delay.set(n, delay.get(parent.get(n)) + rTo.get(n) * down.get(n));
  const delays = {}; for (const c of net.conns) if (c !== drv) delays[c.name] = delay.get(c.name);
  return { delays, problems: problems.slice(0, 1) };
}
