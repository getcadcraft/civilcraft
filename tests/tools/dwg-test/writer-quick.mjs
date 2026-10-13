/* SPDX-License-Identifier: Apache-2.0 */
/**
 * writer-quick.mjs — builder W's quick loop: write a small drawing in the given versions and run the three
 * oracles (LibreDWG dwgread, libdxfrw, ODA File Converter) on it. Usage:
 *   node tools/dwg-test/writer-quick.mjs [AC1015,AC1018,…] [--keep dir] [--case name]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { writeDwg } from '../../lib/dwg/write.js';
import { fromCivilList } from '../../lib/dwg/civil.js';
import { kitchenSink } from './writer-models.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TOOLS = path.join(ROOT, 'tools/civilcraft-test');
const args = process.argv.slice(2);
const versions = (args.find((a) => /^AC10/.test(a)) || 'AC1015,AC1018,AC1021,AC1024,AC1027,AC1032').split(',');
const ki = args.indexOf('--keep');
const OUT = ki >= 0 ? path.resolve(args[ki + 1]) : fs.mkdtempSync('/tmp/dwgw-');
fs.mkdirSync(OUT, { recursive: true });
const ci = args.indexOf('--case');
const which = ci >= 0 ? args[ci + 1] : 'small';

export const CASES = {
  sink: kitchenSink,
  small: () => fromCivilList({ units: 'm', layers: [{ name: 'A', color: 1 }, { name: 'B', color: 3 }], entities: [
    { type: 'line', layer: 'A', a: { x: 0, y: 0 }, b: { x: 10, y: 5 } },
    { type: 'circle', layer: 'B', c: { x: 3, y: 3 }, r: 2 },
    { type: 'arc', layer: 'B', c: { x: 8, y: 2 }, r: 1.5, a0: 0.2, a1: 2.5 },
    { type: 'poly', layer: 'A', pts: [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 3 }], closed: true, elev: 2.5 },
    { type: 'poly3d', layer: 'B', pts: [{ x: 1, y: 1, z: 1 }, { x: 2, y: 3, z: 4 }, { x: 5, y: 1, z: 2 }] },
    { type: 'point', layer: 'A', x: 5, y: 5, z: 1 },
    { type: 'text', layer: 'A', x: 1, y: 8, h: 0.5, rot: 0.3, text: 'Hello Ω € 12°', align: 'center' },
  ] }),
  big: () => {
    const ents = [], layers = [];
    for (let i = 0; i < 300; i++) layers.push({ name: 'L' + i, color: 1 + (i % 255) });
    let s = 7; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < 70000; i++) ents.push({ type: 'point', layer: 'L' + (i % 300), x: 6.2e6 + r() * 1e4, y: 2.1e6 + r() * 1e4, z: r() * 100 });
    ents.push({ type: 'poly', layer: 'L1', pts: Array.from({ length: 20000 }, (_, i) => ({ x: i * 0.5, y: Math.sin(i / 100) * 50 })), elev: 250.5 });
    ents.push({ type: 'poly3d', layer: 'L2', pts: Array.from({ length: 3000 }, (_, i) => ({ x: i, y: Math.cos(i / 30) * 9, z: i / 10 })) });
    return fromCivilList({ units: 'ft', layers, entities: ents });
  },
};

const { availableReaders } = await import(pathToFileURL(path.join(TOOLS, 'dwg-readers.mjs')).href);
const readers = availableReaders(TOOLS);
const files = [];
for (const v of versions) {
  try {
    const { bytes, report } = writeDwg(CASES[which](), { version: v, created: new Date(Date.UTC(2026, 9, 11, 12)) });
    const f = path.join(OUT, `${which}-${v}.dwg`);
    fs.writeFileSync(f, bytes);
    files.push(f);
    console.log(v, bytes.length, 'bytes', report.objects, 'objects', report.notes.join(' | '));
  } catch (e) { console.log(v, 'WRITE FAILED', e.stack.split('\n').slice(0, 4).join(' / ')); }
}
for (const rd of readers) {
  const res = rd.run(files, OUT);
  for (const f of files) {
    const r = res.get(f);
    console.log(`${rd.name.padEnd(32)} ${path.basename(f).padEnd(22)} ${r.problems.length ? 'PROBLEMS: ' + r.problems.slice(0, 6).join(' | ') : 'ok'}`);
  }
}
console.log('files in', OUT);
