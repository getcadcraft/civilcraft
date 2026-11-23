#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// tools/detailcraft-test/clash-11/make-clash-model.mjs (0.11 PERF.36): a clash fixture from a generated grid model: every 30th connection removed (a beam end runs into its column), every 60th column moved 120 mm
// sideways (its beams' plates and ends sit in it), a diagonal brace with no connection for every 40th beam, and a footing under every 25th ground column
// that reaches 150 mm up round it.
//   node make-clash-model.mjs <grid.detailcraft.json> <out.json>
import fs from 'node:fs';
const [src, out] = process.argv.slice(2);
const j = JSON.parse(fs.readFileSync(src, 'utf8'));
j.connections = j.connections.filter((c, i) => i % 30 !== 7);
let n = 0;
j.members.forEach((m, i) => { if (m.type === 'column' && i % 60 === 11) { m.start = [m.start[0] + 120, m.start[1], m.start[2]]; m.end = [m.end[0] + 120, m.end[1], m.end[2]]; n++; } });
const beams = j.members.filter((m) => m.type === 'beam');
let seq = j.seq || 100000;
beams.forEach((b, i) => { if (i % 40 === 3) j.members.push({ id: 'm' + (++seq), type: 'brace', profile: 'HSS6X6X1/4', material: 'A500', start: [b.start[0], b.start[1], Math.max(0, b.start[2] - 4000)], end: b.end.slice(), rotation: 0, position: 'middle', name: '', cuts: [], holes: [], phase: 1 }); });
j.footings = j.footings || [];
j.members.filter((m) => m.type === 'column' && m.start[2] === 0).forEach((c, i) => { if (i % 25 === 0) j.footings.push({ id: 'f' + (++seq), x: c.start[0], y: c.start[1], top: 150, L: 1500, B: 1500, H: 600, rotation: 0, concrete: 'C30/37', mat: { barX: 'H16', sX: 250, barY: 'H16', sY: 250, cover: 75, hooks: true }, starters: { on: true, bar: 'H20', nx: 2, ny: 2, sx: 250, sy: 250, projection: 600, hook: true }, phase: 1 }); });
j.seq = seq + 1;
fs.writeFileSync(out, JSON.stringify(j));
console.log(out, j.members.length, j.connections.length, j.footings.length, 'moved', n);
