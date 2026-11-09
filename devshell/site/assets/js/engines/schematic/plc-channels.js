/* SPDX-License-Identifier: Apache-2.0 */
/** The hand-over to lib/plc: every pin with an `address` (%IX0.0 …) with the device it sits on and the net it is wired to. Plain data, no imports from lib/plc. */
import { buildNets } from './nets.js';

export function plcChannels(sch, built = buildNets(sch)) {
  const out = [];
  for (const s of sch.symbols) for (const p of s.pins) {
    if (!p.address) continue;
    const n = built.netOf.get(s.id + '.' + p.id);
    out.push({ address: p.address, symbol: s.id, tag: s.tag, pin: p.id, kind: p.kind, direction: /^%?I/i.test(p.address) ? 'input' : /^%?Q/i.test(p.address) ? 'output' : 'memory', net: n ? n.name : '', wired: !!n && (n.pins.length > 1 || n.labelled) });
  }
  return out;
}
