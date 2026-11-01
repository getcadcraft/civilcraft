#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-framing-3.mjs — EG.6, round 3 (detail_PART_3): framing panels placed in the model as members (right place, right size, right weight, the Analysis
 * leaves them out, the file keeps them) and the PDF sheets.   node tools/detailcraft-test/test-framing-3.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const F = await load('framing.js'), { Model, starterState, readModel } = await load('model.js'), { build } = await load('build.js'), AN = await load('analysis.js');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x) : '')); } };
const near = (a, b, tol = 1) => Math.abs(a - b) <= tol;
const place = (model, panel, at, id = 'pw') => { const r = F.placePanel(panel, at); model.change('place', (tx) => { for (const p of r.profiles) { try { tx.addProfile(p); } catch { /* already there */ } } for (const m of r.members) tx.addMember(m); }); return r; };
// the world box of a built part from its frame: the profile's width runs along u, its depth along v
const box = (part) => {
  const f = part.frame, w = part.profile.width, d = part.profile.depth, L = f.len, c = [0, 1, 2];
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (const a of [0, L]) for (const sw of [-1, 1]) for (const sd of [-1, 1]) { for (const i of c) { const v = f.o[i] + f.x[i] * a + f.u[i] * sw * w / 2 + f.v[i] * sd * d / 2; lo[i] = Math.min(lo[i], v); hi[i] = Math.max(hi[i], v); } }
  return { lo, hi, size: c.map((i) => hi[i] - lo[i]) };
};

console.log('A wall placed as members');
{
  const spec = { id: 'w1', kind: 'wall', material: 'timber', length: 3600, height: 2400, size: '2x4', spacing: 400, openings: [{ x: 1200, width: 900, height: 2100, sill: 0 }] };
  const panel = F.wallPanel(spec);
  const m = new Model(starterState('t'));
  const r = place(m, panel, { x: 1000, y: 500, z: 0, angle: 0 });
  ok(r.members.length === panel.pieces.length, 'one member for every piece', [r.members.length, panel.pieces.length]);
  ok(m.state.members.every((x) => x.panel === 'w1'), 'every member is tagged with its panel');
  const b = build(m.state);
  // each stud: 38 along the wall (x), 89 across it (y), standing from the bottom plate up
  const stud = b.parts.find((p) => p.name && p.name.startsWith('S') && near(p.length, 2286, 1));
  const bx = box(stud);
  ok(near(bx.size[0], 38, 0.01) && near(bx.size[1], 89, 0.01) && near(bx.size[2], 2286, 0.01), 'a stud is 38 along the wall, 89 across, 2286 tall', bx.size);
  ok(near(bx.lo[2], 38, 0.01) && near(bx.hi[2], 2324, 0.01), 'it stands on the bottom plate and meets the underside of the top plates (2 × 38 above it)', [bx.lo[2], bx.hi[2]]);
  // a stud sits at its x in the panel plus the origin
  const first = panel.pieces.find((p) => p.kind === 'stud'), fp = b.parts.find((p) => p.name === first.mark && near(box(p).lo[0], 1000 + first.x, 0.01));
  ok(!!fp, 'the first stud is at the panel x plus the origin 1000');
  const plate = b.parts.find((p) => p.name && p.name.startsWith('P'));
  const pb = box(plate);
  ok(near(pb.size[0], 3600, 0.01) && near(pb.size[1], 89, 0.01) && near(pb.size[2], 38, 0.01), 'a plate is 3600 long, 89 deep across, 38 thick', pb.size);
  const header = b.parts.filter((p) => p.name && p.name.startsWith('H')).map(box);
  ok(header.length === 2 && header.every((h) => near(h.size[2], 235, 0.01) && near(h.size[1], 38, 0.01)), 'two header plies, each 38 wide on edge 235 deep', header.map((h) => h.size));
  ok(header.length === 2 && near(Math.abs(header[0].lo[1] - header[1].lo[1]), 38, 0.01), 'the plies sit side by side across the wall', header.map((h) => h.lo[1]));
  // weight: timber density 500 kg/m³ on the dressed section
  const total = b.parts.reduce((a, p) => a + p.weight, 0), vol = panel.pieces.reduce((a, p) => a + p.length * (p.kind === 'header' ? 38 * 235 : 38 * 89), 0) / 1e9;
  ok(near(total, vol * 500, vol * 500 * 0.02), 'the weight is the dressed volume at 500 kg/m³, not steel', [total, vol * 500]);
  ok(total < 200, 'a timber wall weighs tens of kilograms, not a steel wall\'s', total);
  // the Analysis leaves the pieces out
  const fr = AN.frameOf(m.state);
  ok(!fr.model || fr.model.members.length === 0, 'the Analysis does not take timber pieces as steel frame members', fr.model && fr.model.members.length);
  // the file keeps the tag, the profile and the density
  const back = readModel(m.toJSON()).state;
  ok(back.members.length === m.state.members.length && back.members.every((x) => x.panel === 'w1'), 'the file keeps the panel tag on every member');
  ok(back.profiles.some((p) => p.density === 500 && p.kind === 'FLAT'), 'the file keeps the custom profile with its density');
  // turned 90 degrees the wall runs along y
  const m2 = new Model(starterState('t'));
  place(m2, panel, { x: 0, y: 0, z: 0, angle: 90 });
  const p2 = build(m2.state).parts.find((p) => p.name && p.name.startsWith('P'));
  const b2 = box(p2);
  ok(near(b2.size[1], 3600, 0.01) && near(b2.size[0], 89, 0.01), 'at 90 degrees the plate runs along y and its depth is across, along x', b2.size);
}

console.log('A floor and a roof placed');
{
  const fl = F.floorPanel({ id: 'f1', kind: 'floor', material: 'timber', width: 3600, span: 4200, size: '2x10', spacing: 400 });
  const m = new Model(starterState('t'));
  place(m, fl, { x: 0, y: 0, z: 3000, angle: 0 });
  const b = build(m.state);
  const joist = b.parts.find((p) => p.name && p.name.startsWith('J'));
  const jb = box(joist);
  ok(near(jb.size[1], fl.pieces.find((p) => p.kind === 'joist').length, 0.01) && near(jb.size[0], 38, 0.01) && near(jb.size[2], 235, 0.01), 'a joist runs along the span, 38 wide on edge 235 deep', jb.size);
  ok(near(jb.lo[2], 3000, 0.01), 'its underside is at z', jb.lo[2]);
  ok(b.parts.length === fl.pieces.length, 'a floor: one member per piece');
  const rf = F.roofPanel({ id: 'r1', kind: 'roof', material: 'timber', length: 4800, run: 3000, rise: 1500, overhang: 400, size: '2x6', spacing: 600, ridge: '2x8' });
  const m2 = new Model(starterState('t'));
  place(m2, rf, { x: 0, y: 0, z: 2400, angle: 0 });
  const br = build(m2.state);
  const nPairs = rf.pairAt.length;
  ok(br.parts.filter((p) => p.name === 'R1' || p.name === 'R2' || /^R/.test(p.name)).length >= 2 * nPairs && m2.state.members.length === 2 * nPairs + 1, 'a roof: a pair of rafters at every spacing and the ridge', [m2.state.members.length, nPairs]);
  const raf = br.parts.find((p) => /^R/.test(p.name) && p.type !== 'ridge');
  ok(near(raf.length, rf.pieces.find((p) => p.kind === 'rafter').length, 2), 'a rafter is as long as the panel\'s rafter piece', [raf.length]);
}

console.log('Steel studs');
{
  const panel = F.wallPanel({ id: 'w2', kind: 'wall', material: 'lgs', size: 'C92-1.2', headerSize: 'C150-1.2', length: 2400, height: 2400, spacing: 600, topPlates: 1, openings: [] });
  const m = new Model(starterState('t'));
  const r = place(m, panel, { x: 0, y: 0, z: 0, angle: 0 });
  ok(r.profiles.every((p) => p.kind === 'C' && p.density === undefined), 'steel studs are C profiles with the steel density');
  const b = build(m.state);
  ok(b.parts.length === panel.pieces.length, 'every steel piece is built');
  const stud = b.parts.find((p) => /^S/.test(p.name)), w = stud.weight / (stud.length / 1000);
  ok(w > 0.8 && w < 2, 'a C92-1.2 stud is about a kilogram a metre', w);
}

console.log('The PDF sheet');
{
  const panel = F.wallPanel({ kind: 'wall', material: 'timber', length: 3600, height: 2400, size: '2x4', spacing: 400, openings: [{ x: 1200, width: 900, height: 2100, sill: 0 }] });
  const page = F.panelPage(panel, { title: 'Wall A', project: 'Test job' });
  ok(page.w === 420 && page.h === 297 && page.items.length > panel.pieces.length, 'an A3 page with every piece and its text', page.items.length);
  const texts = page.items.filter((i) => i.k === 'text').map((i) => i.s);
  ok(texts.includes('Wall A') && texts.some((s) => /Test job/.test(s)) && panel.pieces.some((p) => texts.includes(p.mark)), 'the title, the project and the marks are on the page');
  const { bytes } = await F.panelsPdf([panel, F.floorPanel({ kind: 'floor' })], { names: ['Wall A', 'Floor B'], project: 'Test job' });
  ok(new TextDecoder('latin1').decode(bytes.slice(0, 5)) === '%PDF-', 'it is a PDF');
  const f = path.join(os.tmpdir(), 'dc-framing-3.pdf'); fs.writeFileSync(f, bytes);
  let text = '', pages = 0;
  try { text = execFileSync('pdftotext', ['-layout', f, '-'], { encoding: 'utf8' }); pages = (execFileSync('pdfinfo', [f], { encoding: 'utf8' }).match(/Pages:\s+(\d+)/) || [])[1] | 0; } catch (e) { text = 'NO PDFTOTEXT'; }
  fs.unlinkSync(f);
  ok(pages === 2, 'two panels, two pages', pages);
  ok(/Wall A/.test(text) && /Floor B/.test(text) && /2x4/.test(text) && /Test job/.test(text), 'pdftotext reads the titles, the sizes and the project back');
  ok(/S1/.test(text) && /3600/.test(text) && /2286/.test(text), 'the marks and lengths of the cut list are in the PDF', text.slice(0, 200));
}
console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
