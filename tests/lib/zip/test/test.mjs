/* SPDX-License-Identifier: Apache-2.0 */
// lib/zip/zlib.js against Node's zlib: what we write, Node reads; what Node writes, we read; the copies stay in step.
import zlib from 'node:zlib';
import { inflateZlib, deflateZlib, inflateRawSized, deflateRaw, adler32 } from '../zlib.js';
import { compare } from '../../../tools/zip/sync.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
const same = (a, b) => a.length === b.length && Buffer.compare(Buffer.from(a), Buffer.from(b)) === 0;

let seed = 12345;
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const samples = [new Uint8Array(0), new Uint8Array([1]), new TextEncoder().encode('abcabcabcabc'.repeat(500)),
  Uint8Array.from({ length: 70000 }, () => (rnd() * 256) | 0), Uint8Array.from({ length: 200000 }, (_, i) => (i * 7) & 0x3f)];
for (const [i, s] of samples.entries()) {
  for (const level of [0, 1]) ok(same(zlib.inflateSync(deflateZlib(s, { level })), s), `ours -> node, sample ${i} level ${level}`);
  ok(same(inflateZlib(zlib.deflateSync(s), s.length), s), `node -> ours, sample ${i}`);
  ok(same(inflateRawSized(zlib.deflateRawSync(s, { level: 9 }), s.length), s), `raw node -> ours, sample ${i}`);
  ok(same(zlib.inflateRawSync(deflateRaw(s)), s), `raw ours -> node, sample ${i}`);
}
ok(adler32(new TextEncoder().encode('Wikipedia')) === 0x11E60398, 'Adler-32 of "Wikipedia"');
let threw = false; try { inflateZlib(zlib.deflateSync(samples[2]), 10); } catch { threw = true; }
ok(threw, 'a stream larger than the size asked for is refused');
for (const r of compare()) ok(r.state === 'ok', `${r.rel} is a byte copy of lib/zip/zlib.js (node tools/zip/sync.mjs)`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
