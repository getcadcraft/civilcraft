/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Nets from wires and labels (union–find), and "conductive groups": nets joined through passive devices
 * (contacts, terminals, fuses — `through` pin pairs), ignoring switch state. Used by the rules and the numbering.
 */
import { splitRef, problem } from './model.js';

class DSU {
  constructor() { this.p = new Map(); }
  find(x) { if (!this.p.has(x)) this.p.set(x, x); let r = x; while (this.p.get(r) !== r) r = this.p.get(r); while (this.p.get(x) !== r) { const n = this.p.get(x); this.p.set(x, r); x = n; } return r; }
  union(a, b) { const ra = this.find(a), rb = this.find(b); if (ra !== rb) this.p.set(rb < ra ? ra : rb, rb < ra ? rb : ra); }
}

/** Every pin on the sheet is a node. Returns {nets[], netOf: Map(pinRef → net), problems}. Net order and automatic names are deterministic. */
export function buildNets(sch) {
  const d = new DSU(), problems = [];
  const pinRefs = [];
  for (const s of sch.symbols) for (const p of s.pins) { const r = s.id + '.' + p.id; pinRefs.push(r); d.find(r); }
  for (const w of sch.wires) if (sch.pin(w.from) && sch.pin(w.to)) d.union(w.from, w.to);
  const byName = new Map();
  for (const l of sch.labels) {
    if (!sch.pin(l.at)) continue;
    const key = l.local ? 'local:' + (l.sheet || '') + ':' + l.name : 'global:' + l.name;
    if (byName.has(key)) d.union(byName.get(key), l.at); else byName.set(key, l.at);
  }
  const groups = new Map();
  for (const r of pinRefs) { const root = d.find(r); if (!groups.has(root)) groups.set(root, []); groups.get(root).push(r); }
  const nets = [];
  for (const pins of groups.values()) {
    pins.sort();
    const names = new Set(sch.labels.filter((l) => pins.includes(l.at)).map((l) => l.name));
    nets.push({ id: '', name: names.size ? [...names].sort()[0] : '', names: [...names].sort(), pins, wires: [], labelled: names.size > 0 });
  }
  const sortKey = (n) => { const s = sch.symbol(splitRef(n.pins[0]).sym); return [sch.sheetIndex(s.sheet), s.col, n.pins[0]]; };
  nets.sort((a, b) => { const x = sortKey(a), y = sortKey(b); return x[0] - y[0] || x[1] - y[1] || (x[2] < y[2] ? -1 : x[2] > y[2] ? 1 : 0); });
  let k = 0; const netOf = new Map();
  for (const n of nets) {
    n.id = 'N' + (++k); if (!n.name) n.name = 'N$' + k;
    for (const r of n.pins) netOf.set(r, n);
    if (n.names.length > 1) problems.push(problem('net-two-names', 'error', 'Net ' + n.names.join(' and ') + ' are joined by wiring: one of them is a short or a mislabel', { net: n.id, names: n.names, ref: n.pins[0] }));
  }
  for (const w of sch.wires) { const n = netOf.get(w.from); if (n) n.wires.push(w.id); }
  return { nets, netOf, problems };
}

/** Nets merged through `through` pairs of passive devices → conductive groups (a source can feed a load across a contact). */
export function conductiveGroups(sch, built = buildNets(sch)) {
  const d = new DSU();
  for (const n of built.nets) d.find(n.id);
  for (const s of sch.symbols) for (const [a, b] of s.through || []) {
    const na = built.netOf.get(s.id + '.' + a), nb = built.netOf.get(s.id + '.' + b);
    if (na && nb) d.union(na.id, nb.id);
  }
  const groups = new Map();
  for (const n of built.nets) { const r = d.find(n.id); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(n); }
  return [...groups.values()].map((nets) => ({ nets, pins: nets.flatMap((n) => n.pins) }));
}

export const netByName = (built, name) => built.nets.find((n) => n.name === name) || null;
