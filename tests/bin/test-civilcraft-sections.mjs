#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-sections.mjs — CivilCraft 0.4 V13: sample lines, cross sections, cut/fill areas and average end area
 * volumes (sections.js + project.sections), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-sections.mjs [--build dev|x.y] [--verbose]
 *
 * Worked by hand: flat ground at 100 ft, a straight road at a constant 105 ft (fill) or 95 ft (cut) with the default
 * assembly (12 ft lane at 2 %, 4 ft shoulder at 4 %, fill 3:1, cut 2:1) — every section's area is known exactly
 * (218.04 sq ft of fill, 223.76 sq ft of cut) and so is the volume (area × length). Also: exact sections on a curved
 * TIN (every crossing of a triangle edge, nothing between), the crossing of two lines inside an interval, stations
 * (multiples, curve ends, extra), the right side positive, corridor feature lines marked, untrusted sampling settings,
 * the CSV, the project file and undo, and the grid-method volume agreeing with the end areas.
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const SE = await mod('sections.js');
const PJ = await mod('project.js');
const AL = await mod('alignment.js');
const TIN = await mod('tin.js');
const U = await mod('units.js');
const XS = await mod('section-sheets.js');
const PL = await mod('plot.js');
import { execFileSync } from 'node:child_process';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);

function flatSite(zRoad) {
  const p = new PJ.Project();
  const pts = [];
  let n = 1;
  for (let x = -100; x <= 1100; x += 25) for (let y = -250; y <= 250; y += 25) pts.push({ n: String(n++), x, y, z: 100, d: 'G' });
  p.setPoints(pts, 'flat');
  p.change('road', (s) => s.alignments.push({ id: 'a1', name: 'Road', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 1000, y: 0, r: 0 }], pvis: [{ sta: 0, z: zRoad, L: 0 }, { sta: 1000, z: zRoad, L: 0 }], corridor: { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 10 }, sampling: null }));
  return p;
}

section('stations and sample lines');
{
  const al = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 500, y: 0, r: 200 }, { x: 500, y: 500 }], start: 1000 });
  const st = SE.sampleStations(al, { step: 50, extra: [1234.5, -5, 99999] });
  ok(st[0] === al.start && st.at(-1) === al.end, 'the ends are stations');
  ok(st.filter((s) => s % 50 === 0).length === Math.floor(al.end / 50) - Math.ceil(al.start / 50) + 1 - (al.end % 50 === 0 ? 0 : 0), 'every whole multiple of 50 inside');
  const pc = al.keyStations().filter((k) => k.sta > al.start && k.sta < al.end).map((k) => k.sta);
  ok(pc.length >= 2 && pc.every((s) => st.includes(s)), 'the curve ends (PC, PT) are stations');
  ok(st.includes(1234.5) && !st.includes(-5) && !st.includes(99999), 'an extra station inside is kept, outside ones are not');
  ok(st.every((s, i) => !i || s > st[i - 1]), 'sorted, no duplicates');
  const ln = SE.sampleLine(al, 1100, 30, 40);
  near(Math.hypot(ln.a.x - ln.c.x, ln.a.y - ln.c.y), 30, 1e-9, 'left end 30 from the centre');
  near(Math.hypot(ln.b.x - ln.c.x, ln.b.y - ln.c.y), 40, 1e-9, 'right end 40 from the centre');
  const so = al.stationOffset(ln.b.x, ln.b.y);
  ok(so && Math.abs(so.sta - 1100) < 1e-6 && Math.abs(so.off - 40) < 1e-6, 'the right end is at +40 by stationOffset (right = +)');
  const so2 = al.stationOffset(ln.a.x, ln.a.y);
  ok(so2 && Math.abs(so2.off + 30) < 1e-6, 'the left end at −30');
  ok(SE.sampleStations({ ok: false }, { step: 10 }).length === 0, 'a broken alignment has no stations');
  ok(SE.sampleStations(AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 1e6, y: 0 }] }), { step: 1 }).length === SE.MAX_SECTIONS, 'capped at ' + SE.MAX_SECTIONS + ' sections');
}

section('cutFill: areas between two lines');
{
  const run = (...pts) => [pts.map(([o, z]) => ({ o, z }))];
  let r = SE.cutFill(run([0, 0], [10, 0]), run([0, 2], [10, 2]));
  ok(r.fill === 20 && r.cut === 0, 'a 10 × 2 strip of fill = 20');
  r = SE.cutFill(run([0, 0], [10, 0]), run([0, 2], [10, -2]));
  near(r.fill, 5, 1e-12, 'lines crossing in the middle: fill triangle 5'); near(r.cut, 5, 1e-12, '… and cut triangle 5');
  ok(r.parts.length === 2 && Math.abs(r.parts[0].o1 - 5) < 1e-12 && r.parts[0].kind === 'fill', 'split at the crossing, offset 5');
  r = SE.cutFill(run([0, 0], [4, 4], [10, 4]), run([0, 1], [10, 1]));
  near(r.fill, 0.5, 1e-12, 'fill only where design is above (½ × 1 × 1)'); near(r.cut, 0.5 * 3 * 3 + 6 * 3 - 0, 1e-12, 'cut where the ground is above');
  r = SE.cutFill(run([-5, 0], [5, 0]), run([0, 3], [10, 3]));
  near(r.fill, 15, 1e-12, 'only where both are defined (offset 0 to 5)');
  ok(SE.cutFill([], run([0, 1], [1, 1])).fill === 0, 'no ground: nothing');
  const g2 = [[{ o: -10, z: 0 }, { o: -2, z: 0 }], [{ o: 2, z: 0 }, { o: 10, z: 0 }]];
  near(SE.cutFill(g2, run([-10, 1], [10, 1])).fill, 16, 1e-12, 'a gap in the ground is left out');
}

section('surfaceSection is exact');
{
  const pts = [];
  for (let i = 0; i < 400; i++) { const x = (i * 37.3) % 200, y = (i * 91.7) % 200; pts.push({ x, y, z: 50 + Math.sin(x / 23) * 7 + Math.cos(y / 17) * 5 }); }
  const sf = TIN.buildSurface({ points: pts }).surface;
  const a = { x: 10, y: 15 }, b = { x: 190, y: 170 };
  const runs = SE.surfaceSection(sf, a, b, -100, 100);
  ok(runs.length >= 1, 'one run or more');
  let worst = 0, n = 0;
  for (let k = 0; k <= 2000; k++) {
    const tt = k / 2000, z = sf.elevationAt(a.x + (b.x - a.x) * tt, a.y + (b.y - a.y) * tt);
    const zs = SE.zAt(runs, -100 + 200 * tt);
    if (z === null || zs === null) continue;
    n++; worst = Math.max(worst, Math.abs(z - zs));
  }
  ok(n > 1500 && worst < 1e-9, `linear between the vertices: worst ${worst.toExponential(2)} over ${n} samples (exact, ${runs.flat().length} vertices)`);
  const outside = SE.surfaceSection(sf, { x: -500, y: -500 }, { x: -400, y: -400 }, 0, 100);
  ok(outside.length === 0, 'a line off the surface: no section');
  const half = SE.surfaceSection(sf, { x: -100, y: 100 }, { x: 100, y: 100 }, 0, 200);
  ok(half.length === 1 && half[0][0].o > 99, 'a line starting off the surface starts where the surface does (o ' + half[0]?.[0].o.toFixed(3) + ')');
}

for (const [zRoad, kind, area] of [[105, 'fill', 218.04], [95, 'cut', 223.76]]) {
  section(`flat ground, road at ${zRoad}: ${kind} worked by hand`);
  const p = flatSite(zRoad);
  ok(!!p.graded().surface, 'the corridor grades in');
  p.change('Sample lines', (s) => { s.alignments[0].sampling = SE.cleanSampling({ step: 50, left: 60, right: 60 }); });
  const set = p.sections(p.state.alignments[0]);
  ok(set.sections.length === 21, '21 sections every 50 ft from 0+00 to 10+00');
  let worst = 0;
  for (const s of set.sections) worst = Math.max(worst, Math.abs(s[kind] - area), s[kind === 'fill' ? 'cut' : 'fill']);
  ok(worst < 1e-6, `every section: ${kind} ${area} sq ft, nothing the other way (worst ${worst.toExponential(2)})`);
  near(set.totals[kind], area * 1000, 1e-3, `average end volume = ${area} × 1000 cu ft`);
  near(set.rows.at(-1)[kind === 'fill' ? 'cumFill' : 'cumCut'], area * 1000, 1e-3, 'the running total ends at the same');
  const mid = set.sections[10];
  const m = Object.fromEntries(mid.marks.map((q) => [q.code, q]));
  ok(Math.abs(m.CL.o) < 1e-9 && Math.abs(m.CL.z - zRoad) < 1e-9, 'CL marked at offset 0, z ' + zRoad);
  ok(Math.abs(m.EOP_L.o + 12) < 1e-9 && Math.abs(m.EOP_R.o - 12) < 1e-9 && Math.abs(m.EOP_R.z - (zRoad - 0.24)) < 1e-9, 'edges of pavement at ±12, 0.24 ft down');
  const dl = zRoad > 100 ? 16 + 4.6 * 3 : 16 + 5.4 * 2;
  ok(Math.abs(m.DL_R.o - dl) < 1e-6 && Math.abs(m.DL_L.o + dl) < 1e-6 && Math.abs(m.DL_R.z - 100) < 1e-6, `daylight at ±${dl.toFixed(2)} on the ground (the daylight search stops at 1e-7)`);
  const vol = p.volumes();
  near(vol[kind], area * 1000, area * 1000 * 0.01, 'the grid-method volume agrees within 1 %');
  const csv = SE.sectionsCsv(set, { units: 'ft', station: (s) => U.formatStation(s, 'ft') });
  const lines = csv.split('\r\n');
  ok(lines.length === 23 && lines[0].startsWith('Station,') && /cu yd/.test(lines[0]), 'CSV: header (cu yd) + 21 rows + final CRLF');
  ok(lines[2].startsWith('0+50.00,') && lines[2].split(',')[kind === 'fill' ? 2 : 1] === area.toFixed(2), 'CSV row: station text and area');
  near(Number(lines[21].split(',')[kind === 'fill' ? 6 : 5]), area * 1000 / 27, 0.06, 'CSV cumulative in cubic yards');
}

section('no grading: ground = design, nothing to cut or fill');
{
  const p = flatSite(105);
  p.change('corridor off', (s) => { s.alignments[0].corridor.on = false; s.alignments[0].sampling = { step: 100, left: 50, right: 50, extra: [] }; });
  const set = p.sections(p.state.alignments[0]);
  ok(set.sections.length === 11 && set.totals.cut === 0 && set.totals.fill === 0 && set.sections.every((s) => s.marks.length === 0), '11 sections, no cut, no fill, no corridor marks');
  ok(set.sections[0].ground[0].length >= 2 && set.sections[0].ground[0].every((q) => q.z === 100), 'the ground line is at 100');
}

section('the design counts only inside the graded regions');
{
  const line = { a: { x: -50, y: 0 }, b: { x: 50, y: 0 }, left: 50, right: 50 };
  const sq = (x0, x1) => [{ x: x0, y: -5 }, { x: x1, y: -5 }, { x: x1, y: 5 }, { x: x0, y: 5 }];
  const sp = SE.regionSpans(line, [sq(-30, -10), sq(5, 20)]);
  ok(JSON.stringify(sp.map((q) => q.map((v) => +v.toFixed(9)))) === JSON.stringify([[-30, -10], [5, 20]]), 'two regions → two spans: ' + JSON.stringify(sp));
  const runs = [[{ o: -50, z: 1 }, { o: 0, z: 2 }, { o: 50, z: 3 }]];
  const c = SE.clipRuns(runs, sp);
  ok(c.length === 2 && c[0][0].o === -30 && Math.abs(c[0][0].z - 1.4) < 1e-12 && c[1].at(-1).o === 20 && Math.abs(c[1].at(-1).z - 2.4) < 1e-12, 'runs clipped with exact end values');
  ok(SE.regionSpans(line, []).length === 0 && SE.regionSpans(line, [sq(100, 120)]).length === 0, 'no region crossed → no span');
  // a pad on the real fixture site: re-triangulation noise outside the pad never counts
  const PTS = await mod('points.js');
  const p = new PJ.Project();
  p.setPoints(PTS.parsePoints(fs.readFileSync(path.join(REPO, 'tools/civilcraft-test/site-topo.csv'), 'utf8')).points, 'site');
  const b = p.eg().surface.bounds, cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2, z = p.eg().surface.elevationAt(cx, cy);
  p.change('pad', (st) => { st.pads.push({ id: 'p1', name: 'Pad', pts: [{ x: cx - 40, y: cy - 30 }, { x: cx + 40, y: cy - 30 }, { x: cx + 40, y: cy + 30 }, { x: cx - 40, y: cy + 30 }], z: z + 1, cut: 2, fill: 2 });
    st.alignments.push({ id: 'a1', name: 'Base', start: 0, pis: [{ x: cx - 120, y: cy }, { x: cx + 120, y: cy }], pvis: [], corridor: null, sampling: { step: 10, left: 120, right: 120, extra: [] } }); });
  const g = p.graded();
  ok(!!g.surface && g.regions.filter(Boolean).length === 1, 'the pad grades in');
  const set = p.sections(p.state.alignments[0]);
  let outside = 0;
  for (const sec of set.sections) {
    const spans = SE.regionSpans({ a: sec.a, b: sec.b, left: sec.left, right: sec.right }, g.regions.filter(Boolean));
    for (const q of sec.parts) if (!spans.some(([o0, o1]) => q.o0 >= o0 - 1e-9 && q.o1 <= o1 + 1e-9)) outside++;
  }
  ok(outside === 0, 'every cut and fill part lies inside the pad’s daylight outline');
  const vol = p.volumes();
  const endFill = set.totals.fill, endCut = set.totals.cut;
  ok(endFill > 0 && Math.abs(endFill - vol.fill) / vol.fill < 0.1, `end-area fill ${endFill.toFixed(1)} vs grid ${vol.fill.toFixed(1)} cu ft: within 10 % (two approximations: sections every 10 ft across a 60 ft pad, grid cells)`);
  ok(Math.abs(endCut - vol.cut) <= Math.max(0.1 * vol.cut, 5), `end-area cut ${endCut.toFixed(1)} vs grid ${vol.cut.toFixed(1)} cu ft: within 10 %`);
}

section('cross-section sheets (0.4 V17)');
{
  const p = flatSite(105);
  p.change('Sample lines', (s) => { s.alignments[0].sampling = SE.cleanSampling({ step: 50, left: 60, right: 60 }); });
  const set = p.sections(p.state.alignments[0]);
  const sc20 = PL.scalesFor('ft').find((x) => x.label === `1" = 20'`);
  const r = XS.sectionSheets(set, { paper: 'tabloid', scale: sc20, vex: 5, units: 'ft', title: 'Flat', name: 'Road' });
  // by hand: cell 120 ft × 1.27 mm/ft + 18 mm = 170.4 mm wide → 2 across 399.8 mm; 5 ft relief × 1.2 × 1.27 × 5 + 19 = 57.1 mm
  // tall → 4 down 231.4 mm; 8 a page, 21 sections → 3 pages
  near(r.cell.w, 120 * 1.27 + 18, 1e-9, 'cell width'); near(r.cell.h, 5 * 1.2 * 1.27 * 5 + 19, 1e-9, 'cell height');
  ok(r.cell.cols === 2 && r.cell.rows === 4 && r.perPage === 8 && r.sheets.length === 3 && r.vex === 5, '2 × 4 = 8 a page, 3 pages, 5×');
  ok(JSON.stringify(r.sheets.map((sh) => sh.stations.length)) === '[8,8,5]' && r.sheets[0].stations[0] === 0 && r.sheets[2].stations.at(-1) === 1000, 'stations in order, 8 + 8 + 5');
  const v = r.sheets[0].views[0];
  ok(v.fills.length === 8 && v.fills.every((f) => f.color === '#bfe3c4'), 'every section on the first page has its fill shaded');
  ok(v.texts.some((x) => x.text === 'Sta 0+00.00   Cut 0.00 sq ft   Fill 218.04 sq ft'), 'the first cell is labeled with its station and areas');
  ok(r.sheets[1].chromeTexts.some((x) => x.text === 'Sheet 2 of 3') && r.sheets[0].chromeTexts.some((x) => /Road: cross sections, sta 0\+00\.00 to 3\+50\.00\. Horizontal 1" = 20', vertical 1" = 4' \(5× exaggerated\)/.test(x.text)), 'title strips: sheet numbers, the stations, both scales');
  const tall = XS.sectionSheets(set, { paper: 'letter', scale: PL.scalesFor('ft').find((x) => x.label === `1" = 5'`), vex: 10, units: 'ft', name: 'R' });
  ok(tall.vex < 10 && tall.notes.some((n) => /exaggerated, not 10×/.test(n)), 'on Letter at 1" = 5\' 10× does not fit: drawn at ' + tall.vex + '×, said');
  ok(tall.notes.some((n) => /wider than the paper/.test(n)), 'and the sections are wider than Letter at 1" = 5\': said');
  ok(XS.sectionSheets({ sections: [] }, { scale: sc20 }).notes.length === 1, 'no sections: no sheets, said');
  const { bytes } = await PL.toPdfPages(r.sheets, { title: 'Flat Road' });
  const f = path.join(fs.mkdtempSync('/tmp/civilcraft-xs-'), 'xs.pdf'); fs.writeFileSync(f, bytes);
  try {
    const info = execFileSync('pdfinfo', [f], { encoding: 'utf8' });
    ok(/Pages:\s+3\b/.test(info), 'poppler: 3 pages');
    ok(/Fill 218\.04 sq ft/.test(execFileSync('pdftotext', ['-raw', f, '-'], { encoding: 'utf8' })), 'poppler reads the cell labels');
  } catch (e) { console.log('  note poppler not installed: ' + e.message.split('\n')[0]); }
}

section('settings: untrusted, undo, the project file');
{
  ok(SE.cleanSampling(null) === null && SE.cleanSampling('x') === null, 'not an object → no sample lines');
  const c = SE.cleanSampling({ step: -1, left: 1e9, right: 'x', extra: [5, 5, NaN, 'a', 3, 1e9] }, 'm');
  ok(c.step === 20 && c.left === 30 && c.right === 30 && c.extra.join() === '3,5', 'bad numbers → metric defaults; extra cleaned, sorted, unique');
  const p = flatSite(105);
  p.change('Sample lines', (s) => { s.alignments[0].sampling = SE.cleanSampling({ step: 25, left: 40, right: 45, extra: [512.5] }); });
  ok(p.sections(p.state.alignments[0]).sections.length === 42, '41 multiples of 25 + station 512.5 = 42 sections');
  const json = JSON.parse(JSON.stringify(p.toJSON()));
  json.alignments[0].sampling.extra.push('junk', 1e12);
  const back = PJ.Project.fromJSON(json);
  const q = back.project || back;
  ok(JSON.stringify(q.state.alignments[0].sampling) === JSON.stringify({ step: 25, left: 40, right: 45, extra: [512.5] }), 'the project file keeps the sample lines (junk dropped)');
  p.undo();
  ok(p.state.alignments[0].sampling === null && p.sections(p.state.alignments[0]) === null, 'undo removes the sample lines');
  ok(PJ.Project.fromJSON({ format: 'civilcraft-project', version: 1, units: 'ft', alignments: [{ id: 'a1', name: 'x', pis: [{ x: 0, y: 0 }, { x: 1, y: 0 }] }] }).project?.state.alignments[0].sampling === null, 'an older file without sample lines reads as none');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
