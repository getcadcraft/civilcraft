#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer messages. Makes site.civilcraft.json (the sample survey + a pad, an alignment, a parcel) with CivilCraft's own Project. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const { load } = await import(pathToFileURL(path.join(ROOT, 'tools/cli/headless/apps.mjs')).href);
const PJ = await load('civilcraft', 'project.js'), PT = await load('civilcraft', 'points.js');
const p = new PJ.Project();
p.setPoints(PT.parsePoints(fs.readFileSync(path.join(ROOT, 'tools/civilcraft-test/site-topo.csv'), 'utf8')).points, 'site-topo.csv');
p.state.name = 'Eval site';
const xs = p.points.map((q) => q.x), ys = p.points.map((q) => q.y), mx = (Math.min(...xs) + Math.max(...xs)) / 2, my = (Math.min(...ys) + Math.max(...ys)) / 2;
const z = Math.round(p.eg().surface.elevationAt(mx, my)) + 2;
p.state.pads.push({ id: 'd1', name: 'Pad A', pts: [{ x: mx - 25, y: my - 25 }, { x: mx + 25, y: my - 25 }, { x: mx + 25, y: my + 25 }, { x: mx - 25, y: my + 25 }], z, cut: 2, fill: 2 });
p.state.alignments.push({ id: 'a1', name: 'Main street', start: 0, pis: [{ x: mx - 150, y: my - 100 }, { x: mx + 150, y: my - 90, r: 0 }], pvis: [], corridor: null });
p.state.parcels.push({ id: 'r1', name: 'Lot 1', pts: [{ x: mx - 100, y: my + 50 }, { x: mx - 20, y: my + 50 }, { x: mx - 20, y: my + 120 }, { x: mx - 100, y: my + 120 }] });
fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'site.civilcraft.json'), JSON.stringify(p.toJSON()));
console.log('site.civilcraft.json', mx, my, z);
