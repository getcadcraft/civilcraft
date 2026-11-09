/* SPDX-License-Identifier: Apache-2.0 */
/** bytes.js — small helpers shared by the protocol codecs (0.8 XE.9). Uint8Array only: runs in a page, in Studio and in Node. */
export const u8 = (a) => (a instanceof Uint8Array ? a : Uint8Array.from(a));
export const hex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join(' ');
export const fromHex = (s) => Uint8Array.from(String(s).trim().split(/\s+/).filter(Boolean).map((x) => parseInt(x, 16)));
export const concat = (...parts) => { const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } return out; };
export const view = (b) => new DataView(b.buffer, b.byteOffset, b.byteLength);
export const utf8 = (s) => new TextEncoder().encode(s);
export const unutf8 = (b) => new TextDecoder('utf-8', { fatal: false }).decode(b);
// control characters and bidi overrides are removed from any text that came off a wire
const BAD = new RegExp('[\\u0000-\\u001f\\u007f\\u202a-\\u202e\\u2066-\\u2069]', 'g');
export const cleanText = (s, n = 256) => String(s ?? '').replace(BAD, '').slice(0, n);
export class ProtocolError extends Error { constructor(code, message) { super(message); this.code = code; } }
