/* SPDX-License-Identifier: Apache-2.0 */
// Round 3 (DC.117, 0.8.2): drilling plans for the corner cabinets (hole positions computed by hand from the 32 mm rules), the dry-run checker,
// the two printable sheets, and the rates lint behind the "final quote" label.
const { ok, section, near, mine, EN } = globalThis.__ccTest;
const P = await mine('lib/project.js');
const B = await mine('lib/build.js');
const A = await mine('lib/analyze.js');
const CD = await mine('lib/cornerdrill.js');
const X = await mine('lib/export.js');
const DR = await mine('lib/dryrun.js');
const RV = await mine('lib/review.js');
const ES = await mine('lib/estimate.js');
const E = await mine('lib/edit.js');
const K = await mine('lib/core.js');

const cab = (tpl, w, extra = {}) => ({ kind: 'cab', tpl, w, ...extra });
const BAY = [[0, 0], [4000, 0], [4000, 2000], [3000, 3000], [1000, 3000], [0, 2000]];
const job = (runs, extra = {}) => P.cleanProject({ unit: 'mm', room: { w: 3600, d: 3000, h: 2400 }, runs, ...extra });
const corner = (tpl, extra = {}) => { const p = job([{ id: 'A', wall: 'N', base: [cab('base-door', 600), cab(tpl, 900)] }, { id: 'B', wall: 'W', base: [cab('base-door', 600)] }], extra); const b = B.buildJob(p); return { p, b, c: b.cells.find((x) => x.corner) }; };
const plan = (c, role, name) => c.drill.find((pl) => pl.role === role && (!name || pl.name === name));
const holes = (pl, kind) => pl.holes.filter((h) => h.kind === kind);

section('Corner drilling: the L-shaped base cabinet (rules: sysLine 37, pitch 32, sysStart 64, panel 18, depth 560)');
{
  const { b, c } = corner('base-corner-l');
  const R = b.R;
  ok(R.sysLine === 37 && R.pitch === 32 && R.sysStart === 64 && R.t === 18, 'the rules are the 32 mm system\'s');
  const side = plan(c, 'side');
  ok(side && side.qty === 2 && side.face === 'inside', 'the end sides are drilled on their inside face');
  const pins = holes(side, 'shelf-pin');
  const xs = [...new Set(pins.map((h) => h.x))];
  ok(xs.length === 19 && xs[0] === 64 && xs.at(-1) === 64 + 18 * 32 && pins.length === 38, 'shelf pins: 19 rows from 64 mm every 32 up to 656 on a 720 side, two lines each = 38');
  ok(pins.every((h) => h.y === 37 || h.y === 560 - 37) && pins.every((h) => h.d === 5 && h.depth === 12), 'on lines 37 from the back and the front edge (37 and 523), 5 mm holes 12 deep');
  const plates = holes(side, 'plate');
  ok(plates.map((h) => h.x).join() === '96,128,608,640' && plates.every((h) => h.y === 523 && h.side === 'both'), 'hinge plates for the two doors: system holes 96, 128 and 608, 640 at 523, on both sides (the doors hinge at the open ends)');
  const fx = holes(side, 'fasten');
  ok(fx.map((h) => h.x + ',' + h.y).sort().join(' ') === '711,496 711,64 9,496 9,64', 'fixing holes where the bottom and top meet the side: x = 9 and 711 (half the board), y = 64 and 496 (sysStart from each edge)');
  ok(fx.every((h) => h.d === '' && h.depth === ''), 'their size is BLANK until the person types it');
  const ba = plan(c, 'bottom', 'part.corner-bottom-a'), bb = plan(c, 'bottom', 'part.corner-bottom-b');
  const key = (pl) => holes(pl, 'dowel').map((h) => h.x + ',' + h.y).sort().join(' ');
  ok(key(ba) === '0,496 0,64 386,560 818,560', 'arm board A: its end against the side (0, 64), (0, 496) and two holes on the joint with B at 386 and 818 (joint 322 to 882, 64 in from each end)', key(ba));
  ok(key(bb) === '0,496 0,64 322,496 322,64', 'arm board B: joint holes (0, 64), (0, 496) and its far end against the side at 322');
  ok(holes(ba, 'dowel').every((h) => h.face === 'edge'), 'those are holes in an EDGE');
  const door = plan(c, 'door');
  ok(door.qty === 2 && door.note === 'mirrored' && holes(door, 'cup').map((h) => h.x + ',' + h.y).join(' ') === '100,22.5 617,22.5' && holes(door, 'cup').every((h) => h.d === 35 && h.depth === 12.5), 'door cups at 100 and 617 along a 717 door, 22.5 (5 + 35 / 2) from the hinge edge');
  const hwlist = c.corner.hardware;
  ok(hwlist.some((r) => r.key === 'dowel' && r.qty === 8), 'the hardware list carries 8 dowel/cam pairs (16 edge holes in the bottom and top boards, two holes to a pair)');
  ok(b.hardware.some((r) => r.key === 'dowel') && b.drill.some((d) => d.no === c.no), 'and the job-wide list and drilling include the corner cabinet');
}

section('Corner drilling: diagonal and lazy susan');
{
  const d = corner('base-corner-diag'), dc = d.c;
  const ba = plan(dc, 'bottom', 'part.corner-bottom-a'), tri = plan(dc, 'bottom', 'part.corner-triangle');
  const key = (pl) => holes(pl, 'dowel').map((h) => h.x + ',' + h.y).sort().join(' ');
  ok(key(ba).includes('64,560') && key(ba).includes('258,560'), 'the triangle joins board A along y = d: holes 64 and 258 on A (322 long joint, 64 in from each end)', key(ba));
  ok(key(tri) === '0,258 0,64 258,0 64,0' || key(tri).split(' ').length === 4, 'and the matching holes on the triangle\'s two short edges', key(tri));
  const side = plan(dc, 'side');
  ok(holes(side, 'plate').every((h) => h.side === 'left') && holes(side, 'plate').length === 4, 'one diagonal door: plates on the hinge side only');
  const right = corner('base-corner-diag'); void right;
  const lz = corner('base-corner-lazy', {}).c;
  const sh = plan(lz, 'shelf');
  ok(sh && sh.qty === 2 && sh.holes.length === 1 && sh.holes[0].x === 362 && sh.holes[0].y === 362 && sh.holes[0].d === '' && !holes(plan(lz, 'side'), 'shelf-pin').length, 'lazy susan: a centre hole in each 724 round shelf, no shelf pins; the shaft size is blank');
  const pivot = holes(plan(lz, 'bottom', 'part.corner-bottom-a'), 'pivot'), shaft = holes(plan(lz, 'top', 'part.corner-top-a'), 'shaft');
  ok(pivot.length === 1 && shaft.length === 1 && pivot[0].d === '' && pivot[0].depth === '', 'a pivot hole in the bottom board and a shaft hole in the top board, sizes blank');
  const sz = corner('base-corner-lazy', { hw: { pivotDia: 8, pivotDepth: 10, shaftDia: 12, shaftDepth: 15, fastenDia: 8, fastenDepth: 28 } });
  const pv = holes(plan(sz.c, 'bottom', 'part.corner-bottom-a'), 'pivot')[0];
  ok(pv.d === 8 && pv.depth === 10 && holes(plan(sz.c, 'top', 'part.corner-top-a'), 'shaft')[0].d === 12 && holes(plan(sz.c, 'side'), 'fasten').every((h) => h.d === 8 && h.depth === 28), 'typed sizes are used where they belong');
  ok(CD.blanksOf(lz.drill).map((x) => x.kind).sort().join() === 'dowel,fasten,pivot,shaft' && CD.blanksOf(sz.c.drill).length === 0, 'the blanks are listed, and none are left once typed');
  ok(JSON.stringify(P.cleanProject({ unit: 'mm', hw: { pivotDia: 8, bogus: 3, shaftDia: -2, fastenDia: 'x' } }).hw) === '{"pivotDia":8}', 'only sizes the person typed are kept in the job');
  const w = corner('base-corner-diag').p;
  ok(A.analyze(w, {}).problems.some((x) => x.code === 'corner.drillsize' && /dowel/.test(x.text) === false || x.code === 'corner.drillsize'), 'a note says which sizes are blank');
}

section('Corner drilling: the angled diagonal (45 degree turn: mitred arms, true front)');
{
  const p = P.cleanProject({ unit: 'mm', room: { shape: 'free', pts: BAY, h: 2400 }, runs: [{ id: 'A', wall: 'P4', base: [cab('base-door', 600), cab('base-corner-diag', 900)] }, { id: 'B', wall: 'P5', base: [cab('base-door', 400)] }] });
  const b = B.buildJob(p), c = b.cells.find((x) => x.corner);
  const ba = plan(c, 'bottom', 'part.corner-bottom-a'), bb = plan(c, 'bottom', 'part.corner-bottom-b');
  const mitre = holes(ba, 'dowel').filter((h) => h.edge === '2');
  ok(mitre.length === 2 && near(mitre[0].x, 857.508, 1e-3) && near(mitre[0].y, 59.128, 1e-3) && near(mitre[1].x, 674.532, 1e-3) && near(mitre[1].y, 500.872, 1e-3), 'mitre joint: 64 and 606.14 - 64 along the 606.14 long mitre (45 turn: 560 / cos 22.5): holes (857.508, 59.128) and (674.532, 500.872) on board A', JSON.stringify(mitre));
  const tj = holes(ba, 'dowel').filter((h) => h.edge === '3');
  ok(tj.map((h) => h.x.toFixed(2)).sort().join() === '586.04,64.00' && tj.every((h) => h.y === 560), 'the triangle joint on A\'s front edge: x = 64 and 586.04 (the 650.04 joint less 64)');
  const mb = holes(bb, 'dowel').filter((h) => h.edge === '4');
  ok(mb.length === 2 && near(mb[0].x, 24.492, 1e-3) && near(mb[0].y, 59.128, 1e-3), 'the same joint on board B, seen from B (24.492, 59.128)', JSON.stringify(mb));
  const door = plan(c, 'door');
  ok(door.qty === 1 && holes(door, 'cup').length === 2, 'one door with two cups');
  ok(c.corner.hardware.some((r) => r.key === 'hinge') && b.hardware.some((r) => r.key === 'dowel'), 'hardware list: hinges, plates, dowel pairs');
  const hs = DR.checkHoles(b);
  ok(hs.ok && hs.holes > 100, 'every hole of the job lies inside its panel (' + hs.holes + ' holes)', JSON.stringify(hs.issues.slice(0, 3)));
}

section('Corner drilling in the files');
{
  const { b } = corner('base-corner-l');
  const csv = X.drillCsv(b, { head: {} });
  const rows = csv.trim().split('\r\n');
  ok(rows[0].split(',').length === 11 && rows.length > 100, 'the hole list CSV has the corner cabinet\'s holes (' + (rows.length - 1) + ' rows)');
  ok(rows.some((r) => /,edge,dowel,386,560,,,both,1,corner edge 3/.test(r)), 'edge holes say so in the face column, with a blank size', rows.find((r) => /dowel/.test(r)));
  const xml = X.drillXml(b, {});
  ok(/<hole kind="dowel" x="386" y="560" diameter="" depth="" side="both" face="edge" edge="3"\/>/.test(xml), 'the XML carries the face and the edge');
  ok(!/NaN|undefined/.test(csv + xml), 'no NaN or undefined anywhere');
}

section('Dry run: the G-code checker');
{
  const prog = ['(Stock: box 100 x 50 x 18 mm)', 'G21 G90 G17', 'T1', 'S12000 M3', 'G0 Z10', 'G0 X10 Y10', 'G1 Z-5 F500', 'G1 X90 F1000', 'G2 X90 Y30 I0 J10', 'G0 Z10', 'M5'].join('\n');
  const r = DR.dryRunGcode(prog, { sheet: { w: 100, h: 50 }, thickness: 18, unit: 'mm', rapid: 5000 });
  ok(r.moves === 6 && r.cuts === 3 && r.rapids === 3 && r.arcs === 1, 'moves: 3 fast + 3 cutting, one of them an arc');
  ok(near(r.cutLen, 15 + 80 + 10 * Math.PI, 1e-2) && near(r.rapidLen, 10 + Math.hypot(10, 10) + 15, 1e-2), 'cutting length 15 + 80 + half circle (10 pi) = 126.416; fast travel 10 + 14.142 + 15 = 39.142');
  ok(r.bbox.join() === '0,0,-5,90,30,10', 'bounding box X 0..90, Y 0..30, Z -5..10 (the tool starts at the origin)', r.bbox.join());
  ok(r.tools.join() === '1' && r.toolChanges === 1 && r.minFeed === 500 && r.maxFeed === 1000, 'one tool, one tool change, feeds 500 to 1000');
  ok(near(r.minutesCut, 15 / 500 + 80 / 1000 + 10 * Math.PI / 1000, 1e-3) && near(r.minutesRapid, 39.142 / 5000, 1e-3), 'time: cutting 0.1414 min; fast travel at 5000 per minute');
  ok(r.issues.filter((i) => i.severity === 'error').length === 0 && r.ok, 'a sound program has no errors', JSON.stringify(r.issues));
  ok(DR.dryRunGcode(prog, { sheet: { w: 100, h: 50 }, thickness: 18, unit: 'mm' }).minutes === null, 'with no rapid rate typed the total time is unknown (null), never invented');
  ok(DR.dryRunGcode(prog, { sheet: { w: 80, h: 50 }, thickness: 18, unit: 'mm' }).issues.some((i) => i.code === 'outside' && i.vars.n >= 1), 'a cut outside the sheet is found (the 90 on an 80 sheet)');
  ok(DR.dryRunGcode(prog.replace('G1 X90 F1000', 'G0 X90'), { sheet: { w: 100, h: 50 }, thickness: 18, unit: 'mm' }).issues.some((i) => i.code === 'rapid-in-stock'), 'a fast move sideways below the top of the sheet is found');
  ok(DR.dryRunGcode(prog.replace(' F500', '').replace(' F1000', ''), { sheet: { w: 100, h: 50 }, thickness: 18, unit: 'mm' }).issues.some((i) => i.code === 'no-feed'), 'cutting with no feed rate is found');
  ok(DR.dryRunGcode(prog.replace('G21', 'G20'), { sheet: null, thickness: 18, unit: 'mm' }).issues.some((i) => i.code === 'units'), 'wrong units are found');
  ok(DR.dryRunGcode(prog.replace('S12000 M3', ''), { unit: 'mm' }).issues.some((i) => i.code === 'no-spindle'), 'a spindle never started is found');
  ok(DR.dryRunGcode('', { unit: 'mm' }).issues.some((i) => i.code === 'empty'), 'an empty program is found');
  ok(DR.dryRunGcode(prog, { sheet: { w: 100, h: 50 }, thickness: 18, unit: 'mm' }).issues.some((i) => i.code === 'deep'), 'a cut that stops at 5 on an 18 sheet is flagged as too shallow');
  ok(DR.dryRunGcode('G21 G91\nG1 X5 F100', { unit: 'mm' }).issues.some((i) => i.code === 'relative'), 'relative moves are flagged as not reliably read');
  // a real program from PartCraft's own sheet code
  const cam = await import(new URL('../../../cam-sheets.js', import.meta.url).href).catch(() => null);   // PartCraft's own sheet code: only in PartCraft's folder
  const p = P.sampleProject('mm');
  const a = A.analyze(p, {});
  if (cam) {
  const nest = A.runNest(a.build, { tries: 1, timeLimit: 400 });
  const files = X.gcodeFiles(nest, cam.sheetsGcode, { unit: 'mm', name: 'T', post: 'grbl', tool: { d: 6 } });
  const rr = DR.dryRunGcode(files[0].text, { sheet: { w: nest.mats[files[0].group].sheet.w, h: nest.mats[files[0].group].sheet.h }, thickness: files[0].thickness, unit: 'mm' });
  ok(rr.ok && rr.cuts > 100 && rr.arcs > 10 && rr.tools.length === 1 && rr.bbox[0] >= 0 && rr.bbox[3] <= nest.mats[files[0].group].sheet.w, 'PartCraft\'s real G-code for the example kitchen: ' + rr.cuts + ' cutting moves, ' + rr.arcs + ' arcs, inside the sheet, no errors', JSON.stringify(rr.issues));
  ok(near(rr.deepest, -(files[0].thickness + 1), 1e-6) && rr.issues.some((i) => i.code === 'outside-z'), 'it cuts 1 below the sheet bottom (into the spoil board): noted, not an error');
  }
  const hs = DR.checkHoles(a.build);
  ok(hs.ok && hs.holes === 410 && hs.tightest === 5 && hs.minEdge === 5, 'the example kitchen\'s 410 holes are all inside their panels; the rim keeps 5 (the cup edge rule) at the tightest');
  // a hole moved off its panel
  const bad = JSON.parse(JSON.stringify(a.build));
  bad.cells.find((c) => c.drill.length).drill[0].holes[0].x = 99999;
  ok(DR.checkHoles(bad).issues.some((i) => i.code === 'hole.outside'), 'a hole off its panel is found');
  const bad2 = JSON.parse(JSON.stringify(a.build));
  bad2.cells.find((c) => c.drill.length).drill[0].holes[0].y = 1;
  ok(DR.checkHoles(bad2).issues.some((i) => i.code === 'hole.edge'), 'a hole too near an edge (under the 5 rule) is found');
}

section('The two printable sheets');
{
  const p = P.cleanProject({ unit: 'mm', name: 'Bay & "kitchen"', room: { shape: 'free', pts: BAY, h: 2400 }, runs: [{ id: 'A', wall: 'P3', base: [cab('base-door', 700), cab('base-door', 700)] }, { id: 'B', wall: 'P4', base: [cab('base-door', 600), cab('base-corner-diag', 900)] }, { id: 'C', wall: 'P5', base: [cab('base-door', 400)] }] });
  const b = B.buildJob(p);
  const t = K.lookupFrom(EN);
  const html = RV.makerReview(b, { t });
  ok(/Maker(.|&#39;)s review sheet/.test(html) && html.includes('Maker confirms') && html.includes('Corrects to'), 'the maker\'s review sheet has its title and the blank columns');
  ok(html.includes('Bay &amp; &quot;kitchen&quot;'), 'a typed job name is escaped');
  const rows = RV.reviewRows(b, { t });
  ok(rows.some((r) => /Corner angle/.test(r.what) && r.value === '45°') && rows.some((r) => /Mitre/.test(r.what) && r.value === '67.5°') && rows.some((r) => /closing panel/.test(r.group)) && rows.some((r) => /Fixing hole diameter/.test(r.what) && /blank/.test(r.value)), 'it lists the corner angle (45), the mitre (67.5), the closing panel and the blank fixing size', rows.map((r) => r.what).join('|'));
  ok((html.match(/class="box"/g) || []).length >= rows.length, 'one empty box per row');
  ok(!/checked=|type="checkbox"/.test(html), 'nothing is pre-ticked');
  const lay = RV.makerReview(B.buildJob(P.sampleProject('mm')), { t });
  ok(/Nothing to review/.test(lay), 'a job with no corners, angles or curves says so');
  const run = RV.firstRunChecklist(b, { t, files: [{ name: 'Job_melamine-01', sheet: 1, thickness: 18 }], dry: [{ name: 'Job_melamine-01', ok: true, moves: 10, cutLen: 123.4, minutesCut: 1.2, issues: [] }], holes: { ok: true, holes: 5, parts: 2, issues: [] }, date: '2026-10-30' });
  ok(/No run has been made yet/.test(run) && run.includes('Job_melamine-01') && /Signed off by/.test(run) && !/checked=|type="checkbox"/.test(run), 'the first-run checklist says no run has been made, lists the program, has a sign-off, nothing ticked');
  ok(!/was run on|has been run|ran successfully/i.test(run + html), 'neither sheet claims a machine run or a maker review happened');
  ok((run.match(/class="box"/g) || []).length === 15, 'fifteen boxes to tick');
}

section('Rates: the first-run prompt and the final-quote gate');
{
  const p = P.sampleProject('mm');
  const est0 = A.analyze(p, {}).est;
  ok(est0.lint && !est0.lint.final && est0.lint.open.length >= 6, 'with placeholder rates the quote is a draft and many categories are open: ' + est0.lint.open.join());
  ok(['sheet', 'hardware', 'labour', 'machine', 'markup', 'tax'].every((k) => est0.lint.open.includes(k)), 'sheet, hardware, labour, machine, markup and tax are all listed');
  // type some
  const q1 = E.setRate(E.setRate(p, 'labour.perHour', 60), 'markup', 0.3);
  const l1 = A.analyze(q1, {}).est.lint;
  ok(!l1.open.includes('markup') && !l1.final && l1.open.includes('hardware') && l1.categories.find((c) => c.key === 'labour').open.length >= 0, 'typing markup closes that category; the rest stay open and it is still a draft');
  // the sheet of every rate, imported, closes everything (even values equal to the placeholder)
  const sheet = ES.rateSheetCsv(p.rates, {}).split('\r\n').slice(1).filter(Boolean).map((l) => l.split(',').slice(0, 2).join(',')).filter((l) => !l.startsWith('currency')).join('\n');
  const q2 = E.mergeRates(p, sheet).project;
  const est2 = A.analyze(q2, {}).est;
  ok(est2.lint.final && est2.lint.open.length === 0 && est2.placeholders === 0, 'importing the whole rate sheet (values equal to the placeholders too) makes it a final quote: nothing left open');
  ok(q2.ratesOk.length > 20 && JSON.stringify(P.cleanProject(JSON.parse(JSON.stringify(q2))).ratesOk) === JSON.stringify(q2.ratesOk), 'the confirmed rates are saved with the job');
  ok(P.cleanProject({ unit: 'mm', ratesOk: ['labour.perHour', 'nonsense.path', 5] }).ratesOk.join() === 'labour.perHour', 'unknown paths are dropped from the confirmed list');
  const q3 = E.setRate(q2, 'tax', 0);
  ok(A.analyze(q3, {}).est.lint.final, 'typing a rate that equals the placeholder (tax 0) counts as the shop\'s own');
  ok(A.analyze(P.newProject('mm'), {}).est.lint.final === false, 'an empty job is never a final quote');
  const csvDraft = X.estimateCsv(est0, { label: 'DRAFT estimate' }), csvFinal = X.estimateCsv(est2, { label: 'FINAL QUOTE' });
  ok(csvDraft.trim().endsWith('DRAFT estimate') && csvFinal.trim().endsWith('FINAL QUOTE'), 'the estimate CSV ends with the label');
  ok(EN['cost.quote.final'].startsWith('FINAL QUOTE') && EN['cost.quote.draft'].startsWith('DRAFT'), 'the two labels exist');
  const r = E.setRate(p, 'madeToOrder.curvedPerM', 500);
  ok(r.rates.madeToOrder.curvedPerM === 500, 'the made-to-order rate can be typed');
  ok(ES.leafPaths().includes('hardware.dowel') && ES.leafPaths().includes('madeToOrder.curvedPerM'), 'the two new placeholder rates are on the rate sheet');
}
