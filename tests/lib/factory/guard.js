/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — codes; the panel words them. */
/**
 * guard.js — writing to a running machine or PLC (0.9 D8.13). Off by default, everywhere. A write needs ALL of:
 *   1. the device's own switch on (machine.write === true; the panel asks a yes before it turns it on, and it is kept per device),
 *   2. a confirm for this one write (the panel asks "Write <value> to <tag> on <machine>?" each time),
 *   3. a host that can write at all: Studio's `ccStudioBridge.live.write` — which does NOT exist today. The OPC UA connector has no write
 *      operation by design (owner decision 2026-10-29: writes need written approval per plant) and lib/live's bridge contract is read only.
 * So in this build every write ends at step 3 with `no-channel`, and says so. This is not a safety system and is never part of a safety
 * chain: a machine's own guards, interlocks and emergency stops are the only safety functions.
 *
 *   requestWrite(machine, { node, value }, { confirmed, bridge }) → Promise<{ ok, code }>   codes: off, confirm, no-node, no-channel, refused, written
 */
export const NOT_SAFETY = 'Not a safety system, and never part of a safety chain.';
export function writeAllowed(machine) { return !!machine && machine.write === true; }
export async function requestWrite(machine, { node, value } = {}, { confirmed = false, bridge = null } = {}) {
  if (!writeAllowed(machine)) return { ok: false, code: 'off' };
  if (!node) return { ok: false, code: 'no-node' };
  if (confirmed !== true) return { ok: false, code: 'confirm' };
  const w = bridge && bridge.live && typeof bridge.live.write === 'function' ? bridge.live.write : null;
  if (!w) return { ok: false, code: 'no-channel' };
  try { const r = await w({ protocol: machine.source.protocol, host: machine.source.host, port: machine.source.port, unit: machine.source.unit, node: String(node), value }); return r && r.ok ? { ok: true, code: 'written' } : { ok: false, code: 'refused' }; }
  catch { return { ok: false, code: 'refused' }; }
}
