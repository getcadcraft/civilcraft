#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// Timings on the generated 1M-shape layout (make it once with gen-big.mjs). Light: one read of each file and a few view plans.
import fs from 'node:fs';
import { readGds, writeGds } from '../gds.js';
import { readOasis, writeOasis } from '../oasis.js';
import { buildIndex, planView, fitView } from '../view.js';
import { layoutStats } from '../layout.js';
const DIR = '/var/www/CADCRAFT/testfiles/generated/chip/', gf = DIR + 'layout-1m-shapes.gds', of = DIR + 'layout-1m-shapes.oas';
if (!fs.existsSync(gf)) { console.log('skip: run gen-big.mjs first'); process.exit(0); }
const ms = (f) => { const t = process.hrtime.bigint(); const r = f(); return [r, Number(process.hrtime.bigint() - t) / 1e6]; };
const gb = new Uint8Array(fs.readFileSync(gf)), ob = new Uint8Array(fs.readFileSync(of));
const [g, tg] = ms(() => readGds(gb)), [o, to] = ms(() => readOasis(ob));
console.log(`read GDSII ${(gb.length / 1048576).toFixed(1)} MB: ${tg.toFixed(0)} ms; OASIS ${(ob.length / 1048576).toFixed(1)} MB: ${to.toFixed(0)} ms; problems ${g.problems.length}/${o.problems.length}`);
const s = layoutStats(o.lib, 'TOP'); console.log(`cells ${s.cells}, stored shapes ${s.stored}, placed out ${s.flatShapes}`);
const [, tw1] = ms(() => writeGds(o.lib)), [, tw2] = ms(() => writeOasis(o.lib)); console.log(`write GDSII ${tw1.toFixed(0)} ms, OASIS (compressed) ${tw2.toFixed(0)} ms`);
const [ix, ti] = ms(() => buildIndex(o.lib)); console.log(`index ${ti.toFixed(0)} ms`);
const W = 1600, H = 1000, fv = fitView(ix, 'TOP', W, H);
for (const [label, f] of [['whole layout', 1], ['1/10 wide', 0.1], ['1/100 wide', 0.01], ['1/1000 wide', 0.001]]) {
  for (const [where, cx, cy] of [['in SEA', 1e6, 1e6], ['in CORE', 3.0e6, 0.5e6]]) {
    if (f === 1 && where === 'in CORE') continue;
    const w = (fv.x1 - fv.x0) * f, h = (fv.y1 - fv.y0) * f, v = f === 1 ? fv : { x0: cx - w / 2, x1: cx + w / 2, y0: cy - h / 2, y1: cy + h / 2, scale: fv.scale / f };
    const [p, tp] = ms(() => planView(ix, 'TOP', v)); const st = p.stats;
    console.log(`${label.padEnd(12)} ${f === 1 ? '' : where.padEnd(8)} plan ${tp.toFixed(1)} ms: ${st.shapes} shapes in ${st.instances} placements, ${p.boxes.length} outline boxes, ${st.density} density bins, ${st.tiny} tiny, ${st.culled} culled${st.truncated ? ', TRUNCATED' : ''}`);
  }
}
