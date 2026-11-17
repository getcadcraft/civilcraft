/* SPDX-License-Identifier: Apache-2.0 */
import assert from 'node:assert/strict';
import { SIZES, pageSize, sizeText, groupBySize, ptToMm } from '../pagesize.js';
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const get = (name) => SIZES.find((s) => s.name === name);
// ISO tables against their definitions (within 1 mm)
let a = [Math.pow(2, -0.25) * 1000, Math.pow(2, 0.25) * 1000], b = [1000, 1000 * Math.SQRT2];
const A0 = a.slice(), B0 = b.slice();
for (let i = 0; i <= 7; i++) { const s = get('A' + i); ok(Math.abs(s.w - a[0]) <= 1 && Math.abs(s.h - a[1]) <= 1, 'A' + i + ' ' + s.w + 'x' + s.h + ' vs ' + a.map((v) => v.toFixed(1))); a = [a[1] / 2, a[0]]; }
for (let i = 0; i <= 6; i++) { const s = get('B' + i); ok(Math.abs(s.w - b[0]) <= 1 && Math.abs(s.h - b[1]) <= 1, 'B' + i); b = [b[1] / 2, b[0]]; }
let c = [Math.sqrt(A0[0] * B0[0]), Math.sqrt(A0[1] * B0[1])];
for (let i = 0; i <= 6; i++) { const s = get('C' + i); ok(Math.abs(s.w - c[0]) <= 1 && Math.abs(s.h - c[1]) <= 1, 'C' + i + ' ' + c.map((v) => v.toFixed(1))); c = [c[1] / 2, c[0]]; }
// no two names within the tolerance of each other
for (const p of SIZES) for (const q of SIZES) if (p !== q) ok(Math.max(Math.abs(p.w - q.w), Math.abs(p.h - q.h)) > 4, p.name + ' too near ' + q.name);
// real pages in points
const pt = (w, h, userUnit = 1) => pageSize({ width: w, height: h, userUnit });
ok(pt(595.276, 841.89).name === 'A4' && pt(595, 842).orient === 'portrait', 'A4');
ok(pt(842, 595).name === 'A4' && pt(842, 595).orient === 'landscape', 'A4 landscape');
ok(pt(612, 792).name === 'ANSI A', 'Letter'); ok(pt(792, 1224).name === 'ANSI B', 'Tabloid');
ok(pt(2384, 3370).name === 'A0', 'A0');
ok(pt(1224, 1584).name === 'ANSI C', 'ANSI C'); ok(pt(1296, 1728).name === 'ARCH C', 'ARCH C');
ok(pt(2592, 3456).name === 'ARCH E', 'ARCH E');
ok(pt(2448, 3168).name === 'ANSI E', 'ANSI E');
ok(pt(700, 1000).custom && pt(700, 1000).name === null && pt(700, 1000).near.name, 'custom keeps its nearest');
ok(pt(0, 0).custom && pt(0, 0).near === null, 'no size');
ok(Math.abs(ptToMm(72, 1) - 25.4) < 1e-9 && Math.abs(ptToMm(72, 2) - 50.8) < 1e-9, 'userUnit');
ok(pt(297.64, 420.945, 2).name === 'A4', 'userUnit 2 doubles the page: A5 points are an A4 sheet');
ok(sizeText(pt(595.276, 841.89)) === '210 × 297 mm (8.27 × 11.69 in)', sizeText(pt(595.276, 841.89)));
// groups
const mk = (k, w, h) => ({ key: k, info: pt(w, h) });
const g = groupBySize([mk('a', 842, 595), mk('b', 595, 842), mk('c', 842, 595), mk('d', 612, 792), mk('e', 700, 1000), mk('f', 701, 1000)]);
ok(g[0].id === 'A4' && g[0].keys.length === 3 && !g[0].odd, 'main group'); ok(g.slice(1).every((x) => x.odd) && g.length === 3, 'odd groups: ' + g.map((x) => x.id));
ok(g.find((x) => x.id.startsWith('custom:')).keys.length === 2, 'customs 1 mm apart share a group');
ok(groupBySize([mk('a', 595, 842)])[0].odd === false, 'one group is never odd');
console.log('pagesize: ' + n + ' checks passed');
