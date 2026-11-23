#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// finish.test.mjs — 0.11 IL.7 (the person's luminaire catalogues, the 3D lux surface view) and IL.8 (the ModelCraft adapter), session `light-finish-11`.
// node lib/lightdesign/test/finish.test.mjs
import * as L from '../lib/index.js';
import * as M from '../../../public_html/assets/apps/modelcraft/dev/addons/lightdesign/host.js';   // the synced copy (its imports are ./lib/…)
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x ? ' — ' + x : '')); } };
const near = (a, b, e) => Math.abs(a - b) <= e;

// two small files written here from the formats' published layouts (no maker's data): an IES axial downlight and an EULUMDAT axial luminaire
const IES = ['IESNA:LM-63-2002', '[MANUFAC] Example Works', '[LUMINAIRE] Test downlight', 'TILT=NONE', '1 1000 1 7 1 1 2 0.15 0.15 0 1 1 12', '0 15 30 45 60 75 90', '0', '1000 900 700 450 200 50 0'].join('\n');
const ld = Array(26).fill('0');
Object.assign(ld, { 0: 'ACME', 1: '1', 2: '1', 3: '0', 4: '0', 5: '3', 6: '45', 8: 'Lamb LDT', 12: '200', 14: '50', 15: '180', 22: '100', 23: '1', 24: '0', 25: '1' });
const LDT = [...ld, '1', 'LED', '1000', '3000', '80', '10', ...Array(10).fill('0'), '0', '45', '90', '318.3', '225.1', '0'].join('\n') + '\n';

console.log('\nbeam angle (half of the peak)');
const ei = L.entryOf(IES, 'down.ies'), el = L.entryOf(LDT, 'lamb.ldt');
// by hand: 1000 cd at 0°, 700 at 30°, 450 at 45°: half (500) at 30 + 15 × 200 / 250 = 42°, so 84° across
ok(ei.ok && near(ei.entry.beam, 84, 0.01) && ei.entry.beamC0 === ei.entry.beamC90, 'IES: 1000 / 700 / 450 cd at 0 / 30 / 45° gives 84° (worked by hand: 2 × (30 + 15 × 200 / 250))', String(ei.entry && ei.entry.beam));
// by hand: 318.3 at 0°, 225.1 at 45°, 0 at 90°: half (159.15) at 45 + 45 × (225.1 − 159.15) / 225.1 = 58.18°
ok(el.ok && near(el.entry.beam, 2 * (45 + 45 * (225.1 - 159.15) / 225.1), 0.01), 'EULUMDAT: 318.3 / 225.1 / 0 cd at 0 / 45 / 90° gives 116.4° (by hand)', String(el.entry && el.entry.beam));
ok(near(L.beamAngle(L.genericPhoto('panel'), 0), 120, 0.05), 'a cosine (Lambertian) panel: half of the peak at 60°, 120° across');
const bare = { ...ei.entry.photo, vAngles: [0, 90, 180], hAngles: [0, 360], cd: [[100, 100, 100], [100, 100, 100]] };
ok(L.beamAngle(bare, 0) === null, 'a bare lamp (the same in every direction) has no beam angle: null, shown as "wide"');

console.log('\nentries');
ok(ei.entry.name === 'Test downlight' && ei.entry.maker === 'Example Works' && ei.entry.lumens === 1000 && ei.entry.watts === 12 && near(ei.entry.efficacy, 83.33, 0.01), 'IES: name [LUMINAIRE], maker [MANUFAC], lumens, watts and lm/W as the file says');
ok(el.entry.name === 'Lamb LDT' && el.entry.maker === 'ACME' && el.entry.lumens === 1000 && el.entry.watts === 10 && el.entry.format === 'ldt', 'EULUMDAT: name (line 9), maker (line 1), lamp lumens and watts');
ok(L.entryOf('junk', 'x.ies').key === 'photo.ies.nofile' && L.entryOf('x'.repeat(L.MAX_FILE + 1), 'big.ldt').key === 'cat.toobig', 'a file that is not photometry or is too big is refused with a reason');

console.log('\ncatalogue');
const cat = { id: 'mine', name: 'Mine', files: [], entries: [] };
const a1 = L.addFiles(cat, [{ name: 'down.ies', text: IES }, { name: 'sub/lamb.ldt', text: LDT }, { name: 'readme.txt', text: 'x' }, { name: 'bad.ies', text: 'nope' }, { name: 'huge.ldt', text: '', tooBig: true }]);
ok(a1.added === 2 && a1.refused.length === 3 && cat.files.map((f) => f.name).join() === 'down.ies,lamb.ldt', 'adding a folder: 2 photometry files kept (folder path dropped), a .txt, a broken file and an oversize one refused', JSON.stringify(a1.refused));
const a2 = L.addFiles(cat, [{ name: 'down.ies', text: IES.replace('1000 900', '2000 900').replace('1 1000 1 7', '1 2000 1 7') }]);
ok(a2.replaced === 1 && cat.entries.length === 2 && cat.entries[0].lumens === 2000, 'a file with the same name replaces the older one');
const more = Array.from({ length: 30 }, (_, i) => ({ name: 'lum' + i + '.ies', text: IES.replace('Test downlight', 'Spot ' + i).replace('1 1000 1 7 1 1 2 0.15 0.15 0 1 1 12', '1 ' + (500 + 100 * i) + ' 1 7 1 1 2 0.15 0.15 0 1 1 ' + (5 + i)) }));
L.addFiles(cat, more);
ok(cat.entries.length === 32, '30 more files: 32 in the catalogue');
const s1 = L.searchEntries(cat.entries, { q: 'SPOT lum1' });
ok(s1.length === 11 && s1.every((e) => /^Spot 1/.test(e.name)), 'search: every word must match name, maker or file, any case: "SPOT lum1" finds Spot 1 and Spot 10-19', String(s1.length));
const s2 = L.searchEntries(cat.entries, { sort: 'lumens' });
ok(s2.every((e, i) => i === 0 || e.lumens <= s2[i - 1].lumens) && s2[0].lumens === 3400, 'sort by lumens: most first');
const s3 = L.searchEntries(cat.entries, { sort: 'beam' });
ok(s3[0].beam <= s3[s3.length - 1].beam && s3[s3.length - 1].file === 'lamb.ldt', 'sort by beam: narrowest first (the 116° EULUMDAT last)');
const s4 = L.searchEntries(cat.entries, { minLm: 2000, maxW: 25 });
ok(s4.length && s4.every((e) => e.lumens >= 2000 && e.watts <= 25), 'at least 2000 lm and at most 25 W', String(s4.length));
ok(L.searchEntries(cat.entries, { maker: 'ACME', q: 'acme' }).length === 1, 'search finds the maker named in the file');
const back = L.cleanCatalogue(JSON.parse(JSON.stringify({ id: 'mine', name: 'Mine', files: cat.files })));
ok(back.entries.length === 32 && back.entries[1].name === 'Lamb LDT' && L.storedSize(back) === L.storedSize(cat), 'stored as the files\' text and read back the same (32 entries)');
ok(L.cleanCatalogue({ id: '', files: [] }) === null && L.cleanCatalogue({ id: 'x', name: '', files: [{ name: 'a.ies' }] }).files.length === 0, 'a stored catalogue with no id, or a file with no text, is dropped');
const full = { id: 'f', name: 'f', files: Array.from({ length: L.MAX_FILES }, (_, i) => ({ name: i + '.ies', text: '' })), entries: [] };
ok(L.addFiles(full, [{ name: 'one.ies', text: IES }]).refused[0].key === 'cat.full', 'a catalogue holds at most ' + L.MAX_FILES + ' files');

console.log('\n3D lux surface view');
const room = L.cleanRoom({ polygon: [[0, 0], [6000, 0], [6000, 4000], [0, 4000]], height: 2800, workplane: 800, margin: 500 });
const photo = L.genericPhoto('downlight');
const lay = L.gridLayout(room, photo, 3, 2, { z: 2800 });
for (const q of lay.luminaires) q.photo = photo;
const res = L.runDesign({ room, luminaires: lay.luminaires, llf: 0.8 });
const surf = L.luxSurface(L.gridField(res));
const pr = L.projectSurface(surf, { yaw: 30, pitch: 35, w: 420, h: 260, outline: room.polygon, marks: lay.luminaires.map((q) => q.p) });
ok(pr.tris.length === surf.indices.length / 3 && pr.tris.length >= 20, 'one picture triangle per surface triangle', String(pr.tris.length));
ok(pr.tris.every((t, i) => i === 0 || t.depth <= pr.tris[i - 1].depth), 'triangles are drawn far to near (painter\'s order)');
const allPts = [...pr.tris.flatMap((t) => t.p), ...pr.outline, ...pr.marks];
ok(allPts.every((q) => q[0] >= 11.9 && q[0] <= 408.1 && q[1] >= 11.9 && q[1] <= 248.1), 'the picture fits the canvas inside its 12 px margin');
const top = L.projectSurface(surf, { yaw: 0, pitch: 90, w: 420, h: 260, pad: 0, outline: room.polygon });
const ox = top.outline.map((q) => q[0]), oy = top.outline.map((q) => q[1]);
ok(near((Math.max(...ox) - Math.min(...ox)) / (Math.max(...oy) - Math.min(...oy)), 1.5, 1e-6) && top.outline[0][1] > top.outline[2][1], 'seen from above (tilt 90°) the 6 × 4 m outline is 3 : 2 and y points up the screen');
const side = L.projectSurface(surf, { yaw: 0, pitch: 0, w: 420, h: 260, outline: room.polygon });
let hi = null; for (const t of side.tris) for (const q of t.p) if (!hi || q[1] < hi[1]) hi = q;
ok(hi[1] < Math.min(...side.outline.map((q) => q[1])) - 20, 'from the side (tilt 0°) the lux rises above the floor line');
ok(pr.tris.every((t) => t.rgb.every((v) => v >= 0 && v <= 255)), 'colours are the map\'s, shaded, within 0..255');

console.log('\nModelCraft adapter (hosts/model.js) against a stand-in model host');
const calls = [];
const groups = new Map();
const fakeApi = (capsList) => ({ model: {
  capabilities: () => capsList,
  rooms: async () => [{ name: 'house.mc', poly: [[0, 0], [6000, 0], [6000, 4000], [0, 4000]], holes: [], z: 300, area: 24e6, doors: [], windows: [{ x: 3000, y: 0, w: 1200, sill: 900 }] }],
  addBodies: async (g, bodies, o) => { calls.push(['add', g, bodies, o]); groups.set(g, bodies.length); return bodies.length; },
  removeBodies: async (g) => { calls.push(['remove', g]); return groups.delete(g); },
  bodies: () => [...groups].map(([group, count]) => ({ group, name: group, count })),
} });
const tt = (k) => k;
ok(M.detect(null, { t: tt }) === null && M.detect({ model: { capabilities: () => ['read', 'bodies'] } }, { t: tt }) === null, 'no adapter where the app has no model host or no rooms (PartCraft\'s host has none)');
const host = M.detect(fakeApi(['read', 'bodies', 'rooms']), { t: tt });
const rs = await host.rooms();
ok(rs.length === 1 && rs[0].area === 24 && rs[0].z === 300 && rs[0].windows.length === 1 && rs[0].height === undefined, 'rooms(): the selected floor face, area in m², its floor height and windows; no ceiling height');
const dr = await host.draw({ luminaires: lay.luminaires, result: res, room, cct: 4000 });
const [, g, bodies, opt] = calls.find((c) => c[0] === 'add');
const lums = bodies.filter((b) => b.box), mesh = bodies.filter((b) => b.mesh);
ok(dr.n === 6 && dr.surface && g === 'lightdesign' && lums.length === 6 && opt.at[2] === 300, 'draw: ONE addBodies call, 6 luminaire boxes and the lux surface, raised to the face\'s floor (300 mm)');
ok(lums.every((b, i) => b.box[5] === lay.luminaires[i].p[2] && b.box[5] - b.box[2] === 40 && b.color === L.kelvinToHex(4000)), 'luminaires: 40 mm deep under their height, coloured from the colour temperature');
const tri = mesh.reduce((s, b) => s + b.mesh.indices.length / 3, 0), zs = mesh.flatMap((b) => b.mesh.positions.filter((_, i) => i % 3 === 2));
ok(tri === surf.indices.length / 3 && mesh.length >= 2 && mesh.length <= 60, 'the lux surface: every triangle once, in a few colour bands', tri + ' triangles in ' + mesh.length + ' bodies');
ok(Math.min(...zs) >= 810 && Math.max(...zs) <= 810 + 1000 + 1 && mesh.every((b) => Array.isArray(b.mesh.positions) && b.mesh.indices.every((k) => k < b.mesh.positions.length / 3)), 'over the workplane (800 mm), rising at most 1 m, plain arrays with valid indices');
ok(host.count() === bodies.length && (await host.erase()) === bodies.length && host.count() === 0, 'count() and erase() through the model host');
const noBodies = M.detect(fakeApi(['read', 'rooms']), { t: tt });
let threw = ''; try { await noBodies.draw({ luminaires: lay.luminaires, result: res, room }); } catch (e) { threw = e.key; }
ok(threw === 'mod.noroom' && (await noBodies.erase()) === 0, 'a model host without bodies: Draw says so, Erase does nothing');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
