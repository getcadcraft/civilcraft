/* SPDX-License-Identifier: Apache-2.0 */
/** Rule checks (rule 29: every result is a Problems-shape problem with a rule id the person can switch off). */
import { problem, splitRef } from './model.js';
import { buildNets, conductiveGroups } from './nets.js';
import { crossRefs } from './xref.js';
import { numberWires } from './number.js';
import { bom, cablePlan } from './plans.js';

export const RULES = {
  floating: 'A pin with nothing on it (not marked nc or optional)',
  dangling: 'A net with one pin and no label',
  'driver-conflict': 'Two outputs drive one net',
  undriven: 'An input with no source anywhere in its conductive group',
  'net-two-names': 'Two label names joined by wiring',
  'dup-tag': 'Two devices with one tag',
  xref: 'Coil and contact cross-references',
  terminals: 'Terminal numbers within a strip',
  cable: 'Cable cores used twice',
  rating: 'A wire rated below the current its net carries',
  numbers: 'Wire numbers',
  bom: 'Symbols with no part number',
};

/** checkSchematic(sch, {off: [ruleIds]}) → problems[]. */
export function checkSchematic(sch, opts = {}) {
  const off = new Set(opts.off || []), out = [...sch.validate()];
  const built = buildNets(sch), push = (rule, p) => { if (!off.has(rule)) out.push({ ...p, rule }); };
  if (!off.has('net-two-names')) out.push(...built.problems.map((p) => ({ ...p, rule: 'net-two-names' })));
  for (const s of sch.symbols) for (const p of s.pins) {
    const r = s.id + '.' + p.id, n = built.netOf.get(r);
    if (n.pins.length === 1 && !n.labelled && p.kind !== 'nc' && !p.optional) push('floating', problem('floating', 'warning', (s.tag || s.id) + ' pin ' + (p.name || p.id) + ' is not connected', { symbol: s.id, ref: r }));
  }
  for (const n of built.nets) {
    if (n.pins.length === 1 && !n.labelled) continue;
    const kinds = n.pins.map((r) => { const q = splitRef(r); return sch.symbol(q.sym).pins.find((x) => x.id === q.pin); });
    const drivers = n.pins.filter((r, i) => kinds[i].kind === 'out' || kinds[i].kind === 'power-out');
    if (drivers.length > 1) push('driver-conflict', problem('driver-conflict', 'error', 'Net ' + n.name + ' is driven by ' + drivers.length + ' outputs: ' + drivers.join(', '), { net: n.id, ref: drivers[0] }));
  }
  for (const g of conductiveGroups(sch, built)) {
    const pins = g.pins.map((r) => { const q = splitRef(r); return { r, s: sch.symbol(q.sym), p: sch.symbol(q.sym).pins.find((x) => x.id === q.pin) }; });
    const hasSource = pins.some((x) => ['out', 'power-out', 'io'].includes(x.p.kind) || x.s.role === 'source');
    if (!hasSource) for (const x of pins) if ((x.p.kind === 'in' || x.p.kind === 'power-in') && g.pins.length > 1) push('undriven', problem('undriven', 'warning', (x.s.tag || x.s.id) + ' pin ' + (x.p.name || x.p.id) + ' has no source anywhere in its circuit', { symbol: x.s.id, ref: x.r }));
  }
  const tags = new Map();
  for (const s of sch.symbols) {
    if (!s.tag || s.role === 'terminal' || s.type === 'label' || s.role === 'contact-no' || s.role === 'contact-nc' || s.device) continue;
    if (tags.has(s.tag)) push('dup-tag', problem('dup-tag', 'error', 'The tag ' + s.tag + ' is on two devices', { symbol: s.id })); else tags.set(s.tag, s.id);
  }
  for (const p of crossRefs(sch).problems) push('xref', p);
  const strips = new Map();
  for (const s of sch.symbols) if (s.role === 'terminal') {
    const k = s.strip || '', m = strips.get(k) || new Set(); strips.set(k, m);
    if (s.number && m.has(s.number)) push('terminals', problem('terminal-dup', 'error', 'Strip ' + k + ' has two terminals numbered ' + s.number, { symbol: s.id }));
    if (s.number) m.add(s.number); else push('terminals', problem('terminal-no-number', 'warning', 'A terminal on strip ' + k + ' has no number', { symbol: s.id }));
  }
  for (const p of cablePlan(sch, built).problems) push('cable', p);
  for (const w of sch.wires) {
    if (w.rating === undefined) continue;
    const n = built.netOf.get(w.from); if (!n) continue;
    const load = n.pins.reduce((a, r) => { const q = splitRef(r), pin = sch.symbol(q.sym).pins.find((x) => x.id === q.pin); return a + (pin.kind === 'in' || pin.kind === 'power-in' ? pin.amps || 0 : 0); }, 0);
    if (load > w.rating) push('rating', problem('wire-rating', 'error', 'Wire ' + w.id + ' is rated ' + w.rating + ' A but its net ' + n.name + ' carries ' + load + ' A', { wire: w.id, net: n.id, req: load, found: w.rating }));
  }
  for (const p of numberWires(sch, { built }).problems) push('numbers', p);
  for (const p of bom(sch).problems) push('bom', p);
  return out;
}
