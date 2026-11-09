/* SPDX-License-Identifier: Apache-2.0 */
/** Cross-check the addresses a program declares (Runtime.addresses()) against the channels a schematic wires (lib/schematic plcChannels()). Plain data in, Problems out. */
import { problem } from './st.js';

export const normAddress = (a) => String(a).toUpperCase().replace(/^%([IQM])X/, '%$1');

export function crossCheckIO(addresses, channels) {
  const out = [], byAddr = new Map(channels.map((c) => [normAddress(c.address), c])), used = new Set();
  for (const a of addresses) {
    const key = normAddress(a.address), c = byAddr.get(key); used.add(key);
    if (a.direction === 'memory') continue;
    if (!c) { out.push(problem('io-unwired', 'warning', a.name + ' is at ' + a.address + ', which no module channel in the schematic has', { address: a.address, name: a.name })); continue; }
    if (!c.wired) out.push(problem('io-not-wired', 'warning', a.address + ' (' + a.name + ') is on ' + c.tag + ' but nothing is wired to it in the schematic', { address: a.address, name: a.name }));
  }
  for (const c of channels) {
    if (c.direction === 'output' && c.kind === 'in') out.push(problem('io-pin-kind', 'error', 'Channel ' + c.address + ' on ' + c.tag + ' is an output address but its pin is drawn as an input', { address: c.address }));
    if (c.direction === 'input' && (c.kind === 'out' || c.kind === 'power-out')) out.push(problem('io-pin-kind', 'error', 'Channel ' + c.address + ' on ' + c.tag + ' is an input address but its pin is drawn as an output', { address: c.address }));
  }
  for (const c of channels) if (c.direction !== 'memory' && !used.has(normAddress(c.address))) out.push(problem('io-unused', 'warning', 'Channel ' + c.address + ' on ' + c.tag + ' is wired but no program variable uses it', { address: c.address }));
  return out;
}
