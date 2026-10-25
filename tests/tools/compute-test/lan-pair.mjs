/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lan-pair.mjs — two connected stand-in transports for lib/compute/lan*.js tests (0.7 CU.7): what one end sends arrives at
 * the other asynchronously, copied (as a socket would), and closing either end closes both. Test-only.
 *   const [a, b] = transportPair({ delayMs })
 */
export function transportPair({ delayMs = 0 } = {}) {
  const mk = () => ({ onmessage: null, onclose: null, closed: false, peer: null, sent: 0,
    send(bytes) { if (this.closed) return; this.sent += bytes.length; const copy = Uint8Array.from(bytes), p = this.peer; setTimeout(() => { if (!p.closed) p.onmessage?.(copy); }, delayMs); },
    close() { if (this.closed) return; this.closed = true; const p = this.peer; setTimeout(() => { this.onclose?.(); if (!p.closed) { p.closed = true; p.onclose?.(); } }, 0); },
  });
  const a = mk(), b = mk();
  a.peer = b; b.peer = a;
  return [a, b];
}
