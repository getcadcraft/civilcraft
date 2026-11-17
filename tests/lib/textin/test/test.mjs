// SPDX-License-Identifier: Apache-2.0
import { decodeParts, decodePartsAsync, linesOf, parseJsonParts, startsWithText, TextParts, partsOf } from '../textin.js';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const enc = new TextEncoder();
// text with multibyte, CRLF, mixed endings, no trailing newline
let s = '';
for (let i = 0; i < 20000; i++) s += (i % 3 ? 'line ' + i + ' é中\u{1F600}' : 'x' + i) + (i % 5 === 0 ? '\r\n' : '\n');
s += 'last';
for (const sz of [1, 7, 64, 1000, 4 << 20]) {
  const p = decodeParts(enc.encode(s), { partBytes: sz });
  ok(p.parts.join('') === s, 'roundtrip ' + sz);
  ok(p.parts.slice(0, -1).every((x) => x.endsWith('\n')), 'parts end at a line feed ' + sz);
  const a = [...linesOf(p)], b = s.split(/\r?\n/);
  ok(a.length === b.length && a.every((x, i) => x === b[i]), 'linesOf = split ' + sz);
  const q = await decodePartsAsync(new Blob([enc.encode(s)]), { partBytes: sz });
  ok(q.parts.join('') === s, 'async blob ' + sz);
  const rs = new Blob([enc.encode(s)]).stream();
  const r = await decodePartsAsync(rs, { partBytes: sz });
  ok(r.parts.join('') === s, 'async stream ' + sz);
}
ok([...linesOf('')].length === 1 && [...linesOf('a\n')].join('|') === 'a|', 'edge lines');
ok(decodeParts(new Uint8Array([0xEF, 0xBB, 0xBF, 65, 10, 66]), { partBytes: 1 }).parts.join('') === 'A\nB', 'BOM stripped once');
let threw = false; try { decodeParts(new Uint8Array([0xff, 10, 65]), { fatal: true }); } catch { threw = true; } ok(threw, 'fatal');
ok(startsWithText(new TextParts(['ab', 'cd']), 'abc'), 'startsWith');
// JSON
const doc = { a: [1, -2.5e10, 0, 1e-7, true, false, null, 'q"\\\né\u0001'], b: { c: {}, d: [], e: '\u{1F600}' }, n: Array.from({ length: 500 }, (_, i) => ({ i, s: 'v' + i })) };
const j = JSON.stringify(doc, null, 1).replace('"c": {}', '"__proto__": 5,\n "c": {}');
for (const cut of [1, 2, 3, 5, 17, 100]) {
  const ps = []; for (let i = 0; i < j.length; i += cut) ps.push(j.slice(i, i + cut));
  const v = parseJsonParts(ps);
  ok(JSON.stringify(v) === JSON.stringify(JSON.parse(j)) && Object.getOwnPropertyDescriptor(v.b, '__proto__')?.value === 5, 'json cut ' + cut);
}
for (const bad of ['{"a":1,}', '[1,2', '{"a" 1}', '01', '"abc', 'tru', '[1] x']) { let t = false; try { parseJsonParts(['', bad.slice(0, 2), bad.slice(2)]); } catch (e) { t = e instanceof SyntaxError; } ok(t, 'bad json ' + bad); }
ok(parseJsonParts(['  ', '[1', ',2]  ']).length === 2, 'ws');
console.log(`textin: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
