/* SPDX-License-Identifier: Apache-2.0 */
// reader-fuzz.mjs — damaged-file robustness for readDwg (builder R): random byte damage and truncation
// of corpus files must never throw and must finish in bounded time.
//   node tools/dwg-test/reader-fuzz.mjs [rounds=40] [file.dwg …]
import fs from 'node:fs';
import { readDwg } from '../../lib/dwg/index.js';
const C = '/var/www/CADCRAFT/testfiles/dwg-corpus';
const files = [];
for (const v of ['AC1015', 'AC1018', 'AC1021', 'AC1024', 'AC1027', 'AC1032']) for (const n of ['example-2000.dwg', 'kitchen-equipment.dwg', 'civil-example-imperial.dwg']) if (fs.existsSync(`${C}/${v}/${n}`)) files.push(`${C}/${v}/${n}`);
const rounds = +(process.argv[2] || 40);
if (process.argv.length > 3) files.splice(0, files.length, ...process.argv.slice(3));
let seed = 7;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
let threw = 0, runs = 0, worst = 0;
for (const f of files) {
  const orig = new Uint8Array(fs.readFileSync(f));
  for (let i = 0; i < rounds; i++) {
    const b = orig.slice();
    const mode = i % 4;
    let damaged = b;
    if (mode === 0) for (let k = 0; k < 1 + rnd() * 20; k++) b[Math.floor(rnd() * b.length)] ^= 1 + Math.floor(rnd() * 255);
    else if (mode === 1) damaged = b.subarray(0, Math.floor(rnd() * b.length));
    else if (mode === 2) { const at = Math.floor(rnd() * b.length); for (let k = at; k < Math.min(b.length, at + 4096); k++) b[k] = Math.floor(rnd() * 256); }
    else for (let k = 0; k < 200; k++) b[0x80 + Math.floor(rnd() * Math.min(b.length - 0x80, 0x4000))] ^= 0xFF;
    const t = performance.now();
    try { readDwg(damaged); } catch (e) { threw++; console.log('THREW', f.split('/').slice(-2).join('/'), 'mode', mode, e.stack.split('\n').slice(0, 3).join(' | ')); }
    const ms = performance.now() - t; worst = Math.max(worst, ms); runs++;
    if (ms > 5000) console.log('SLOW', f, mode, ms.toFixed(0));
  }
}
console.log(`${runs} damaged reads, ${threw} threw, slowest ${worst.toFixed(0)} ms`);
process.exit(threw ? 1 : 0);
