/* SPDX-License-Identifier: Apache-2.0 */
/**
 * policy.js — where a reader may connect and what it may ask (0.8 XE.9). The page never opens a socket: the host (Studio) does, after the person says yes to each server.
 * Plant networks are private ones, so a public address needs an approval for that host; this computer itself needs a switch (tests only).
 */
export const PROTOCOLS = { modbus: 502, mqtt: 1883, bacnet: 47808, opcua: 4840 };
export const READ_ONLY = true;
export function isPrivate(host) {
  const h = String(host).toLowerCase();
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) { const [a, b] = h.split('.').map(Number); return a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254); }
  return h === '::1' || h === 'localhost' || h.startsWith('fe80:') || /^f[cd][0-9a-f]{2}:/.test(h) || /\.local$/.test(h);
}
export function addressPolicy(host, { allow = [], loopback = false } = {}) {
  const h = String(host).toLowerCase();
  if (!/^[a-z0-9.\-:\[\]]{1,253}$/.test(h)) return { ok: false, code: 'host', message: 'That is not a host name or address.' };
  if (allow.map((x) => String(x).toLowerCase()).includes(h)) return { ok: true };
  if (/^127\.|^::1$|^localhost$/.test(h)) return loopback ? { ok: true } : { ok: false, code: 'loopback', message: 'This computer itself is not offered as a plant server unless the person turns that on.' };
  if (/^(0\.0\.0\.0|255\.255\.255\.255|2(2[4-9]|3\d)\.)/.test(h)) return { ok: false, code: 'special', message: 'Multicast and broadcast addresses are not servers.' };
  return isPrivate(h) ? { ok: true } : { ok: false, code: 'public', message: 'The device is not on a private network. Approve this host once to connect to it.' };
}
export function cleanTarget(t, protocol) {
  if (!PROTOCOLS[protocol]) return { ok: false, code: 'protocol', message: 'Unknown protocol.' };
  const host = String(t?.host ?? ''), port = t?.port == null ? PROTOCOLS[protocol] : Number(t.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return { ok: false, code: 'port', message: 'The port must be 1 to 65535.' };
  return { ok: true, host, port };
}
