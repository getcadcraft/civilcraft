#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-sheets.mjs — CivilCraft 0.4 V15: plan and profile sheets along an alignment (pp-sheets.js) and the
 * multi-page PDF (plot.js toPdfPages), DOM-free, in Node; the PDF read back by poppler (pdfinfo, pdftotext) when installed.
 *
 *   node bin/test-civilcraft-sheets.mjs [--build dev|x.y] [--verbose] [--keep]
 *
 * By hand: the stretch per sheet on Tabloid at 1" = 40' (the plan window's 375.8 mm = 591.8 ft → 550 ft); a 1,000 ft road
 * = 2 sheets with match lines at 5+50 pointing at each other; the plan turned so the stretch runs left to right (a road
 * at 45° too) and the plan's stations line up with the profile's below; the vertical exaggeration lowered when the
 * elevations would not fit; the fixture site with a corridor; the PDF's pages, text and missing characters.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const KEEP = process.argv.includes('--keep');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
const OUT = KEEP ? path.join(REPO, 'tmp/civilcraft-sheets') : fs.mkdtempSync('/tmp/civilcraft-sheets-');
fs.mkdirSync(OUT, { recursive: true });
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
const PP = await mod('pp-sheets.js');
const PL = await mod('plot.js');
const AL = await mod('alignment.js');
const PR = await mod('profile.js');
const SC = await mod('scene.js');
const PJ = await mod('project.js');
const PTS = await mod('points.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const has = (cmd) => { try { execFileSync('sh', ['-c', 'command -v ' + cmd]); return true; } catch { return false; } };
const scale40 = PL.scalesFor('ft').find((s) => s.label === `1" = 40'`);

function road(angleDeg, len = 1000) {
  const a = (angleDeg * Math.PI) / 180, x0 = 5000, y0 = 2000;
  const al = AL.buildAlignment({ pis: [{ x: x0, y: y0 }, { x: x0 + Math.cos(a) * len, y: y0 + Math.sin(a) * len }] });
  const eg = []; for (let s = 0; s <= len; s += 5) eg.push({ sta: s, z: 100 + 0.01 * s + 2 * Math.sin(s / 80) });
  const prof = PR.buildProfile([{ sta: 0, z: 101 }, { sta: 500, z: 108, L: 200 }, { sta: len, z: 104 }]);
  const scene = SC.planScene({ units: 'ft', alignments: [{ name: 'Main St', alignment: al, pis: [] }] }, { mmPerUnit: scale40.mmPerUnit });
  return { al, eg, prof, scene };
}

section('stretches per sheet, by hand');
{
  const { al } = road(0);
  const pl = PP.sheetPlan(al, { paper: 'tabloid', scale: scale40 });
  const W = pl.window.plan.x1 - pl.window.plan.x0;
  near(W, 431.8 - 2 * 12 - 2 * 16, 1e-9, 'plan window 375.8 mm wide on Tabloid');
  ok(pl.length === 550, 'that is 591.8 ft at 1" = 40\', rounded down to a whole 50: 550 ft per sheet');
  ok(JSON.stringify(pl.stations) === '[[0,550],[550,1000]]', 'a 1,000 ft road → two sheets, 0+00–5+50 and 5+50–10+00');
  const m = PP.sheetPlan(AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 900, y: 0 }] }), { paper: 'a3', scale: PL.scalesFor('m').find((s) => s.label === '1:500'), units: 'm' });
  ok(m.length === 180 && m.stations.length === 5, 'metric A3 at 1:500: the 364 mm window = 182 m → 180 m per sheet (whole 20 m), 5 sheets for 900 m (' + m.length + ')');
  const s10 = PP.sheetPlan(al, { paper: 'tabloid', scale: PL.scalesFor('ft').find((x) => x.label === `1" = 10'`) });
  ok(s10.length === 140 && s10.stations.length === 8, 'at 1" = 10\' the window holds 147.9 ft → 140 ft (a whole 10 ft on short stretches), 8 sheets');
  const part = PP.sheetPlan(al, { paper: 'tabloid', scale: scale40, from: 200, to: 400 });
  ok(JSON.stringify(part.stations) === '[[200,400]]', 'a station range: one sheet 2+00–4+00');
}

for (const ang of [0, 45, 160]) {
  section(`a road at ${ang}°: plan turned, plan and profile line up`);
  const { al, eg, prof, scene } = road(ang);
  const r = PP.planProfileSheets(scene, { alignment: al, eg, profile: prof, paper: 'tabloid', scale: scale40, vex: 10, units: 'ft', title: 'Main St', name: 'Main St' });
  ok(r.sheets.length === 2 && r.vex === 10 && !r.notes.length, 'two sheets at 10× exaggeration, nothing to say');
  for (const [k, sh] of r.sheets.entries()) {
    near(sh.theta, (ang * Math.PI) / 180 > Math.PI ? 0 : (ang * Math.PI) / 180, 1e-12, `sheet ${k + 1}: turned by the road's direction`);
    const cl = sh.views[0].strokes.filter((st) => st.color === '#c00000' && st.width === 0.5);
    const ys = cl.flatMap((st) => st.pts.map((p) => p.y));
    ok(cl.length && Math.max(...ys) - Math.min(...ys) < 1e-6, `sheet ${k + 1}: the centerline runs straight across the plan window`);
    const [a, b] = sh.stations, PW = r.plan.window.plan, VW = r.plan.window.profile;
    // the plan's x of a station = the profile's x of it
    const s = scale40.mmPerUnit;
    for (const sta of [a, (a + b) / 2, b]) {
      const p = al.pointAt(sta), q = { x: (p.x - al.pointAt(a).x) * Math.cos(-sh.theta) - (p.y - al.pointAt(a).y) * Math.sin(-sh.theta) };
      near(PW.x0 + q.x * s, VW.x0 + (sta - a) * s, 1e-6, `sheet ${k + 1}: station ${sta} at the same x in plan and profile`);
    }
    const match = sh.views[0].texts.filter((x) => /Match line/.test(x.text)).map((x) => x.text);
    ok(match.length === 1 && match[0] === (k === 0 ? 'Match line sta 5+50.00, see sheet 2' : 'Match line sta 5+50.00, see sheet 1'), `sheet ${k + 1}: one match line, "${match[0]}"`);
    ok(sh.views[0].strokes.some((st) => st.dash && st.width === 0.7), `sheet ${k + 1}: the match line is drawn (dash-dot)`);
    const pv = sh.views[1];
    ok(pv.strokes.some((st) => st.color === '#c00000' && st.width === 0.6) && pv.strokes.some((st) => st.color === '#606060'), `sheet ${k + 1}: profile with the design (red) and the ground (dashed grey)`);
    ok(sh.chromeTexts.some((x) => x.text === `Sheet ${k + 1} of 2`) && sh.chromeTexts.some((x) => /Horizontal 1" = 40', vertical 1" = 4' \(10× exaggerated\)/.test(x.text)), `sheet ${k + 1}: title strip with sheet number and both scales`);
  }
  if (ang === 0) {
    const vc = r.sheets[0].views[1].texts.find((x) => /^PVI 5\+00/.test(x.text));
    ok(vc && /L 200\.00/.test(vc.text) && /K /.test(vc.text), 'the vertical curve at 5+00 is labeled with L and K: ' + vc?.text);
    ok(r.sheets[0].views[1].texts.some((x) => x.text === '+1.40%'), 'the first grade is labeled +1.40%');
  }
}

section('the exaggeration is lowered when the elevations do not fit');
{
  const { al, scene } = road(0);
  const eg = []; for (let s = 0; s <= 1000; s += 10) eg.push({ sta: s, z: 100 + s * 0.08 });
  const r = PP.planProfileSheets(scene, { alignment: al, eg, profile: null, paper: 'tabloid', scale: scale40, vex: 10, units: 'ft', name: 'Steep' });
  ok(r.vex < 10 && r.notes.some((n) => new RegExp(`drawn ${r.vex}× exaggerated, not 10×`).test(n)), 'a 44 ft climb on one sheet: drawn at ' + r.vex + '×, said');
  ok(r.sheets.every((sh) => sh.chromeTexts.some((x) => x.text.includes('(' + r.vex + '× exaggerated)'))), 'every sheet says the exaggeration used');
}

section('the fixture site, a corridor, the PDF');
{
  const p = new PJ.Project();
  p.setPoints(PTS.parsePoints(fs.readFileSync(path.join(REPO, 'tools/civilcraft-test/site-topo.csv'), 'utf8')).points, 'site');
  const b = p.eg().surface.bounds, y = (b.minY + b.maxY) / 2;
  p.change('road', (s) => s.alignments.push({ id: 'a1', name: 'Site road', start: 0, pis: [{ x: b.minX + 20, y, r: 0 }, { x: (b.minX + b.maxX) / 2, y: y + 40, r: 150 }, { x: b.maxX - 20, y, r: 0 }], pvis: [], corridor: null, sampling: null }));
  const a = p.state.alignments[0], al = p.alignment(a), egp = p.egProfile(a).filter((q) => q.z !== null);
  p.change('profile', (s) => { s.alignments[0].pvis = [{ sta: egp[0].sta, z: egp[0].z + 2, L: 0 }, { sta: egp.at(-1).sta, z: egp.at(-1).z + 2, L: 0 }]; s.alignments[0].corridor = { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 10 }; });
  const sc20 = PL.scalesFor('ft').find((s) => s.label === `1" = 20'`);
  const scene = SC.planScene({ units: 'ft', surface: p.eg().surface, contours: { interval: 1, major: 5, list: p.contours() }, alignments: [{ name: a.name, alignment: al, pis: a.pis }], corridors: p.graded().items.filter((x) => x.kind === 'corridor') }, { mmPerUnit: sc20.mmPerUnit });
  const r = PP.planProfileSheets(scene, { alignment: al, eg: p.egProfile(a), profile: p.designProfile(a), paper: 'tabloid', scale: sc20, vex: 5, units: 'ft', title: 'Sample site', name: a.name });
  const n = r.plan.stations.length;
  ok(n >= 1 && r.plan.stations.at(-1)[1] === al.end, `${n} sheet(s) cover 0+00 to the end (${al.end.toFixed(2)})`);
  ok(r.sheets.every((sh) => sh.views[0].strokes.length > 20), 'every sheet has plan linework (contours, corridor)');
  ok(r.sheets.every((sh) => sh.views[1].strokes.some((st) => st.color === '#c00000' && st.width === 0.6 && st.pts.length >= 2)), 'every sheet draws the design profile, even one between two PVIs');
  const { bytes, report } = await PL.toPdfPages(r.sheets, { title: 'Sample site' });
  const f = path.join(OUT, 'sample-site-pp.pdf');
  fs.writeFileSync(f, bytes);
  ok(report.pages === n && report.missing === 0, `PDF: ${report.pages} page(s), no missing characters`);
  ok(new TextDecoder('latin1').decode(bytes).includes('/Count ' + n), '/Pages /Count ' + n);
  const one = await PL.toPdf(PL.planSheet(scene, { extents: p.eg().surface.bounds, paper: 'tabloid', scale: sc20, title: 'Plan', units: 'ft' }));
  ok(new TextDecoder('latin1').decode(one.bytes).includes('/Count 1'), 'the single-sheet plot still writes one page');
  if (has('pdfinfo')) {
    const info = execFileSync('pdfinfo', [f], { encoding: 'utf8' });
    ok(new RegExp('Pages:\\s+' + n + '\\b').test(info) && /Page size:\s+1224 x 792 pts/.test(info), 'poppler: ' + n + ' Tabloid landscape page(s)');
    const txt = execFileSync('pdftotext', ['-layout', f, '-'], { encoding: 'utf8' });
    ok(txt.includes('Sheet 1 of ' + n) && txt.includes('Site road: sta 0+00.00'), 'poppler reads the title strip');
    if (n > 1) ok(/Match line sta/.test(txt), 'and the match lines');
    const t2 = execFileSync('pdfinfo', [path.join(OUT, 'sample-site-pp.pdf')], { encoding: 'utf8' });
    ok(/Title:\s+Sample site/.test(t2), 'the PDF title');
  } else console.log('  note poppler not installed: PDF read-back skipped');
}

console.log(`\n${pass} passed, ${fail} failed` + (KEEP ? ' — files in ' + path.relative(REPO, OUT) : ''));
if (!KEEP) fs.rmSync(OUT, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
