#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-roads11.mjs — CivilCraft 0.11, session civil-roads-11: SU.1941 (template binding check; named values by station on a
 * corridor), FX.366 (circular vertical curves by radius, LandXML CircCurve), SU.1937 (profile of a pipe run), SU.1937b (named drainage
 * rule sets), FX.367 (road design standards as cited data). DOM-free.
 *
 *   node bin/test-civilcraft-roads11.mjs [--build dev|x.y] [--verbose]
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
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const TP = await mod('templates.js');
const PJ = await mod('project.js');
const PF = await mod('profile.js');
const LX = await mod('landxml.js');
const PP = await mod('pipe-profile.js');
const PS = await mod('pipe-profile-sheet.js');
const PL = await mod('plot.js');
const RS = await mod('rulesets.js');
const HY = await mod('hydro.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);

const ground = (zf = () => 100) => { const p = new PJ.Project(), pts = []; let n = 1; for (let x = -100; x <= 1300; x += 25) for (let y = -300; y <= 300; y += 25) pts.push({ n: String(n++), x, y, z: zf(x, y), d: 'G' }); p.setPoints(pts, 'ground'); return p; };
const EX = TP.exampleTemplates('ft');
const tpl = (id, nid) => ({ ...JSON.parse(JSON.stringify(EX.find((x) => x.id === 'ex-' + id))), id: nid, source: 'project' });
const off = (q) => Math.abs(q.y);
const at = (it, sta) => it.sections.find((s) => Math.abs(s.sta - sta) < 1e-6);

section('SU.1941: the binding check reads the draft, not the cleaned template');
{
  const draft = { name: 'x', params: [{ key: 'w', value: 12, kind: 'len' }, { key: 'sl', value: -0.02, kind: 'slope' }, { key: 'idle', value: 1, kind: 'len' }, { key: 'w', value: 9 }, { key: 'Bad Key', value: 1 }],
    points: [{ code: 'A', from: '0', kind: 'slope', dx: 'w', slope: 'sl', top: true }, { code: 'B', from: 'A', kind: 'delta', dx: 'widht', dz: 'sl' }, { code: 'C', from: 'B', kind: 'daylight', cut: 2, fill: 'w' }] };
  const b = TP.bindingCheck(draft), codes = b.problems.map((p) => p.code + ':' + (p.at || ''));
  ok(b.bound.find((x) => x.key === 'w').uses.map((u) => u.code + u.field).join() === 'Adx,Cfill', 'w is bound to A.dx and C.fill');
  ok(codes.includes('missing:B') && b.problems.find((p) => p.code === 'missing').vars.key === 'widht', 'the typo "widht" is a missing value (cleanTemplate would silently use the default)');
  ok(codes.includes('kind:B') && codes.includes('kind:C'), 'a slope in a length field, a length in a ratio field');
  ok(codes.includes('unused:idle'), 'a value nothing uses'); ok(codes.includes('dupkey:w') && codes.includes('badkey:Bad Key'), 'a duplicate and an invalid key');
  const clean = TP.cleanTemplate(draft, 'ft');
  ok(clean.points[1].dx === 0, 'cleanTemplate puts 0 in place of the typo without a word: ' + clean.points[1].dx);
  ok(!TP.templateProblems(clean).some((p) => p.code === 'noparam'), 'and templateProblems on the clean one never sees it (the old check was dead)');
  ok(TP.bindingCheck(EX.find((x) => x.id === 'ex-lanes')).problems.every((p) => p.code === 'unused') || TP.bindingCheck(EX.find((x) => x.id === 'ex-lanes')).problems.length === 0, 'the example lanes template is bound cleanly');
}
section('SU.1941: named values by station');
{
  const n = { key: 'w', rows: [{ sta0: 100, sta1: 200, v0: 12, v1: 16 }, { sta0: 300, sta1: 300, v0: 16, v1: 10 }, { sta0: 400, sta1: 500, v0: 10, v1: 10 }] };
  near(TP.namedValueAt(n, 50), 12, 1e-12, 'before the first row: its start value'); near(TP.namedValueAt(n, 150), 14, 1e-12, 'half-way up a ramp: 14');
  near(TP.namedValueAt(n, 200), 16, 1e-12, 'at the stop: 16'); near(TP.namedValueAt(n, 250), 16, 1e-12, 'between rows: the last stop value held');
  near(TP.namedValueAt(n, 300), 10, 1e-12, 'a row whose start and stop stations are the same steps to its stop value'); near(TP.namedValueAt(n, 450), 10, 1e-12, 'a flat row'); near(TP.namedValueAt(n, 900), 10, 1e-12, 'after the last row: its stop value');
  const c = TP.cleanNamed([{ key: 'w', rows: [{ sta0: 5, sta1: 1, v0: 3, v1: 4 }, { sta0: 'x', v0: 1 }, { sta0: 0, v0: 1, sta1: 10, v1: 2 }] }, { key: 'w', rows: [] }, { key: 'Bad Key', rows: [{ sta0: 0, v0: 0 }] }, { key: 'sl', rows: [] }]);
  ok(c && c.length === 1 && c[0].rows.length === 2 && c[0].rows[0].sta0 === 0 && c[0].rows[1].sta1 === 5, 'untrusted rows are cleaned, sorted, a stop before its start becomes a point'); ok(TP.cleanNamed([]) === null && TP.cleanNamed(null) === null, 'none → null');
  // a corridor
  const p = ground();
  p.change('road', (s) => {
    s.templates = [tpl('lanes', 'tp1'), tpl('daylight', 'tp3')]; s.seq = 20;
    s.alignments.push({ id: 'a1', name: 'Road', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 1000, y: 0, r: 0 }], pvis: [{ sta: 0, z: 103, L: 0 }, { sta: 1000, z: 103, L: 0 }], sampling: null,
      corridor: { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 50, regions: [{ from: 0, L: { uses: [{ tpl: 'tp1' }], end: { tpl: 'tp3' } }, R: { uses: [{ tpl: 'tp1' }], end: { tpl: 'tp3' } } }],
        named: [{ key: 'w', rows: [{ sta0: 200, sta1: 400, v0: 12, v1: 16 }] }] } });
  });
  const it = p.graded().items.find((x) => x.id === 'a1');
  ok(it && !it.problems.length, 'the corridor builds, no problems ' + JSON.stringify(it?.problems));
  const eop = (s, side) => off(s[side][1]);
  near(eop(at(it, 100), 'R'), 12, 1e-9, 'before the table: the template\'s own 12'); near(eop(at(it, 300), 'R'), 14, 1e-9, 'at 300: 14 on the right'); near(eop(at(it, 300), 'L'), 14, 1e-9, 'and on the left');
  near(eop(at(it, 400), 'R'), 16, 1e-9, 'at the stop: 16'); near(eop(at(it, 800), 'R'), 16, 1e-9, 'after it: 16 held');
  ok(it.sections.some((s) => Math.abs(s.sta - 200) < 1e-6) && it.sections.some((s) => Math.abs(s.sta - 400) < 1e-6), 'the row\'s end stations are sections');
  const j = JSON.parse(JSON.stringify(p.toJSON ? p.toJSON() : p.state));
  ok(JSON.stringify(j.alignments?.[0]?.corridor?.named || null) === JSON.stringify([{ key: 'w', rows: [{ sta0: 200, sta1: 400, v0: 12, v1: 16 }] }]), 'the table is kept in the project state');
  p.change('table', (s) => { s.alignments[0].corridor.named[0].rows[0].v1 = 20; });
  near(eop(at(p.graded().items.find((x) => x.id === 'a1'), 400), 'R'), 20, 1e-9, 'a change of the table regrades the corridor');
}

section('FX.366: a circular vertical curve');
{
  const R = 2000, g1 = 0.03, g2 = -0.02, th1 = Math.atan(g1), th2 = Math.atan(g2);
  const P = PF.buildProfile([{ sta: 0, z: 100 }, { sta: 1000, z: 100 + 30 }, { sta: 2000, z: 130 - 20, R }]);
  ok(P.ok, 'builds (profile of 3 PVIs, the middle one with R)'); void P;
  const Q = PF.buildProfile([{ sta: 0, z: 100 }, { sta: 1000, z: 130, R }, { sta: 2000, z: 110 }]);
  ok(Q.ok && Q.curves.length === 1 && Q.curves[0].circ, 'a crest of R 2000 between +3 % and −2 %');
  const c = Q.curves[0], T = R * Math.tan(Math.abs(th2 - th1) / 2);
  near(c.T, T, 1e-9, `tangent length T = R·tan(Δθ/2) = ${T.toFixed(4)}`); near(T, 49.9988, 5e-4, 'T = 49.9988 by hand (Δθ = 0.0499883 rad, tan(Δθ/2) = 0.0249994)');
  near(c.pvi - c.bvc, T * Math.cos(th1), 1e-9, 'BVC is T·cos θ1 before the PVI'); near(c.evc - c.pvi, T * Math.cos(th2), 1e-9, 'EVC is T·cos θ2 after');
  near(c.L, 99.9650, 5e-4, 'horizontal length 99.965 = T·(cos θ1 + cos θ2) (a parabola of K = R/100 has 100)'); near(c.K, c.L / 5, 1e-12, 'K = L/|A| as for a parabola');
  near(Q.elevationAt(c.bvc), 130 - g1 * (1000 - c.bvc), 1e-9, 'at the BVC it is on grade 1'); near(Q.elevationAt(c.evc), 130 + g2 * (c.evc - 1000), 1e-9, 'at the EVC on grade 2');
  near(Q.gradeAt(c.bvc + 1e-9), g1, 1e-9, 'the grade at the BVC is g1 (tangent)'); near(Q.gradeAt(c.evc - 1e-9), g2, 1e-9, 'and g2 at the EVC');
  let worst = 0, wslope = 0;
  for (let s = c.bvc; s <= c.evc; s += 2.5) { const z = Q.elevationAt(s); worst = Math.max(worst, Math.abs(Math.hypot(s - c.cx, z - c.cz) - R)); const h = 1e-4; wslope = Math.max(wslope, Math.abs((Q.elevationAt(Math.min(c.evc, s + h)) - Q.elevationAt(Math.max(c.bvc, s - h))) / (Math.min(c.evc, s + h) - Math.max(c.bvc, s - h)) - Q.gradeAt(s))); }
  ok(worst < 1e-9, 'every point is R from the centre (' + worst.toExponential(1) + ')'); ok(wslope < 1e-6, 'gradeAt is the slope of elevationAt (' + wslope.toExponential(1) + ')');
  ok(c.high && c.high.sta > c.bvc && c.high.sta < c.evc, 'the high point is found'); near(c.high.z, c.cz + R, 1e-9, 'at the top of the circle'); near(Q.elevationAt(c.high.sta), c.high.z, 1e-9, 'where elevationAt agrees');
  // against the parabola of the same K, a few mm at most
  const Pp = PF.buildProfile([{ sta: 0, z: 100 }, { sta: 1000, z: 130, K: 20 }, { sta: 2000, z: 110 }]);
  let dz = 0; for (let s = 960; s <= 1040; s += 5) dz = Math.max(dz, Math.abs(Pp.elevationAt(s) - Q.elevationAt(s)));
  ok(dz < 0.01, 'the circle and the parabola K = R/100 differ by under 10 mm here (' + dz.toFixed(4) + ')');
  // a sag, and R winning over L
  const S = PF.buildProfile([{ sta: 0, z: 100 }, { sta: 500, z: 95, L: 40, R: 1500 }, { sta: 1000, z: 100 }]);
  ok(S.ok && S.curves[0].kind === 'sag' && S.curves[0].circ, 'a sag; R wins over a typed L'); near(S.curves[0].low.z, S.curves[0].cz - 1500, 1e-9, 'its low point is the bottom of the circle');
  const tooBig = PF.buildProfile([{ sta: 0, z: 100 }, { sta: 100, z: 103, R: 5000 }, { sta: 200, z: 100 }]);
  ok(!tooBig.ok && tooBig.errors.length > 0, 'a radius that does not fit between the neighbours says so: ' + tooBig.errors[0]);
  // LandXML: written as CircCurve, read back
  const al = (await mod('alignment.js')).buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 2000, y: 0 }], start: 0 });
  const xml = LX.writeLandXml({ name: 't', units: 'm', alignments: [{ name: 'A', alignment: al, profile: { name: 'P', profile: Q } }] });
  ok(/<CircCurve length="[\d.]+" radius="2000(\.0+)?">1000 130<\/CircCurve>/.test(xml), 'LandXML has <CircCurve length radius> at the PVI: ' + (xml.match(/<CircCurve[^>]*>/) || ['none'])[0]);
  const back = LX.readLandXml(xml);
  ok(back.alignments?.[0]?.profiles?.[0]?.pvis?.[1]?.R === 2000, 'read back: the PVI carries R 2000'); ok(!(back.notes || []).some((x) => /vertical curves/.test(x)), 'with no "not read" note');
}

section('SU.1937: the profile of a pipe run');
{
  const surf = { elevationAt: (x) => 100 - 0.01 * x };   // ground falls 1 % along x
  const net = { name: 'N', type: 'storm', rules: { minSlope: 0.005, minCover: 2, minDrop: 0.1 }, structures: [
    { id: 's1', name: 'MH-1', x: 0, y: 0, rim: 100, sumpDepth: 0, dia: 48 }, { id: 's2', name: 'MH-2', x: 100, y: 0, rim: null, sumpDepth: 1, dia: 60 },
    { id: 's3', name: 'MH-3', x: 180, y: 0, rim: 98.4, sumpDepth: 0.5, dia: 48 }, { id: 's4', name: 'MH-4', x: 100, y: 60, rim: 99.5, sumpDepth: 0, dia: 48 }],
  pipes: [{ id: 'p1', name: 'P1', from: 's1', to: 's2', dia: 12, invUp: 96.5, invDn: 96.0 }, { id: 'p2', name: 'P2', from: 's2', to: 's3', dia: 15, invUp: 95.9, invDn: 95.5 },
    { id: 'p3', name: 'P3', from: 's4', to: 's2', dia: 12, invUp: 96.9, invDn: 96.3 }] };
  ok(PP.outletsOf(net).join() === 's3', 'the outlet is MH-3');
  const r = PP.pipeRun(net, 's1');
  ok(r.ok && r.structs.join() === 's1,s2,s3' && r.pipes.join() === 'p1,p2', 'the run from MH-1: MH-1, MH-2, MH-3 by P1 and P2');
  ok(PP.pipeRun(net, 's4').pipes.join() === 'p3,p2', 'from the branch MH-4: P3 then P2'); ok(!PP.pipeRun(net, 's3').ok && PP.pipeRun(net, 's3').why === 'nopipe', 'from the outlet there is no run'); ok(PP.pipeRun(net, 'zz').why === 'nostart', 'a missing structure');
  const pr = PP.pipeProfile(net, surf, 'ft', { start: 's1' });
  ok(pr.ok, 'profile made'); near(pr.length, 180, 1e-9, 'length 180 (100 + 80 plan)');
  ok(pr.structs.map((x) => x.sta).join() === '0,100,180', 'manholes at stations 0, 100, 180');
  const [p1, p2] = pr.pipes;
  near(p1.slope, 0.005, 1e-12, 'P1 falls 0.5 / 100 = 0.5 %'); near(p2.slope, 0.005, 1e-12, 'P2 falls 0.4 / 80 = 0.5 %');
  near(pr.crown[0].z, 97.5, 1e-12, 'crown at the start = invert + 12 in = 97.5'); near(pr.crown[2].z, 95.9 + 1.25, 1e-12, 'P2 crown = invert + 15 in = 97.15');
  ok(pr.invert.length === 4 && pr.invert[1].z === 96.0 && pr.invert[2].z === 95.9, 'the invert drops 0.1 through MH-2 (96.0 in, 95.9 out)');
  const m2 = pr.structs[1];
  near(m2.rim, 99, 1e-9, 'MH-2 has no rim set: the ground there (99.0)'); ok(m2.rimFrom === 'surface', 'and says so'); near(m2.floor, 95.9 - 1, 1e-9, 'sump = the lowest invert − 1 ft depth = 94.9');
  near(m2.depth, 99 - 94.9, 1e-9, 'depth rim to sump 4.1'); ok(m2.invIn.length === 2 && m2.side === 1, 'two pipes come in (P1 and the branch P3), one is off the run');
  ok(pr.ground.length > 6 && Math.abs(pr.ground[0].z - 100) < 1e-9 && Math.abs(pr.ground[pr.ground.length - 1].z - 98.4) < 1e-9, 'ground sampled along the run: 100 at MH-1, the set rim 98.4 at MH-3');
  near(p1.cover, 99 - 97, 1e-9, 'P1 least cover = ground 99 − crown 97 = 2.0 at its lower end (the ground falls 1 %, the pipe 0.5 %)'); near(p2.cover, (await mod('pipes.js')).analyzeNetwork(net, surf, 'ft').pipes.get('p2').cover, 1e-12, 'P2 cover is analyzeNetwork\'s own figure (one source)');
  ok(pr.hgl === null, 'no HGL unless asked');
  const hg = { pipes: new Map([['p1', { hglUp: 97.0, hglDn: 96.8 }], ['p2', { hglUp: 96.6, hglDn: 96.2 }]]), structs: new Map() };
  const ph = PP.pipeProfile(net, surf, 'ft', { start: 's1', hgl: hg });
  ok(ph.hgl && ph.hgl.length === 4 && ph.hgl[0].z === 97.0 && ph.hgl[3].z === 96.2, 'the HGL (read from the storm table\'s result) is a line from each pipe\'s upper to its lower HGL');
  const noinv = JSON.parse(JSON.stringify(net)); delete noinv.pipes[1].invUp; noinv.pipes[1].invUp = null;
  ok(PP.pipeProfile(noinv, surf, 'ft', { start: 's1' }).why === 'noinv', 'a run with a pipe without inverts is refused (nothing guessed)');
  // the sheet
  const { sheet, vex, notes } = PS.pipeProfileSheet(ph, { paper: 'a3', units: 'ft', name: 'N' });
  ok(sheet.w === 420 && sheet.h === 297 && sheet.views.length === 1, 'an A3 landscape sheet'); ok(vex > 1, 'exaggerated ' + vex.toFixed(1) + ' times'); ok(notes.length === 0, 'no notes');
  const texts = sheet.views[0].texts.map((q) => q.text);
  ok(texts.includes('MH-1') && texts.includes('MH-2') && texts.includes('MH-3'), 'manholes named'); ok(texts.some((q) => q.startsWith('100.0 12 in @ ') && /0\.50%$/.test(q)), 'P1 labelled length, size, slope: ' + texts.find((q) => /12 in/.test(q)));
  ok(texts.includes('rim 100.00') && texts.includes('sump 94.90'), 'rim and sump written');
  ok(sheet.views[0].strokes.some((q) => q.color === '#1e48c8' && q.dash), 'the HGL is drawn dashed');
  const svg = PS.sheetSvg(sheet);
  ok(svg.startsWith('<svg') && svg.endsWith('</svg>') && (svg.match(/<polyline/g) || []).length > 20 && svg.includes('>MH-2<'), 'SVG: well formed, with lines and the manhole names');
  const pdf = await PL.toPdfPages([sheet], { title: 'N' });
  ok(pdf.bytes[0] === 0x25 && pdf.bytes[1] === 0x50 && pdf.bytes[2] === 0x44 && pdf.bytes[3] === 0x46 && pdf.bytes.length > 1500, 'PDF: %PDF, ' + pdf.bytes.length + ' bytes');
}


section('SU.1937b: named drainage rule sets');
{
  const raw = { name: 'Office set', rainfall: [
    { ret: 10, tMin: 5, tMax: 30, form: 'montana', a: 1000, b: 0.75, c: 0.75, src: 'Office note 12, table 3' },
    { ret: 10, tMin: 30, tMax: 120, form: 'idf', a: 90, b: 12, c: 0.8, entered: true },
    { ret: 100, tMin: 5, tMax: 120, form: 'idf', a: 150, b: 12, c: 0.8, src: 'Office note 12, table 4' },
    { ret: 25, tMin: 5, tMax: 120, form: 'idf', a: 120, b: 12, c: 0.8 },
    { ret: 5, tMin: 50, tMax: 20, form: 'idf', a: 1, b: 1, c: 1, entered: true }],
  materials: [{ key: 'conc', name: 'Concrete', n: 0.013, src: 'Supplier sheet' }, { key: 'pvc', name: 'PVC', n: 0.011, entered: true }, { key: 'x', name: 'No proof', n: 0.02 }, { key: 'Bad Key', n: 0.01, entered: true }],
  limits: { minSlope: 0.004, minCover: 1.5, minDrop: 0.05, bogus: 9, src: 'Local rules 2020' } };
  const c = RS.cleanRuleset(raw, 'ft'), rs = c.rs;
  ok(rs && rs.rainfall.length === 3 && rs.materials.length === 2, 'rows with neither a source nor "entered" are dropped (the 25-year row, the "No proof" material)');
  ok(c.dropped.some((d) => d.group === 'rainfall' && d.why === 'nosource') && c.dropped.some((d) => d.group === 'materials' && d.why === 'nosource'), 'and said why'); ok(c.dropped.some((d) => d.why === 'bad'), 'a row with a range backwards or a bad key is refused as bad');
  ok(rs.rainfall[0].form === 'montana' && rs.rainfall[0].b === 0 && rs.rainfall[0].c === 0.75, 'Montana i = a·t^(−b) is stored as idf with b = 0 and c = the exponent');
  ok(rs.limits && rs.limits.minSlope === 0.004 && !('bogus' in rs.limits), 'limits keep the three the checks use');
  ok(RS.returnPeriods(rs).join() === '10,100', 'return periods 10 and 100');
  const f30 = RS.rainfallFor(rs, 10, 30), f60 = RS.rainfallFor(rs, 10, 60), f200 = RS.rainfallFor(rs, 10, 200);
  ok(f30.row.form === 'montana' && !f30.outside, 'at 30 min (the range end) the first row'); ok(f60.row.form === 'idf' && f60.a === 90, 'at 60 min the second'); ok(f200.outside && f200.a === 90, 'beyond every range: the nearest, said to be outside');
  ok(RS.rainfallFor(rs, 50, 10) === null, 'no row of that return period: null');
  const h0 = HY.cleanHydro(null, 'ft'), net = { rules: { minSlope: 0.005, minCover: 2, minDrop: 0.1 }, hydro: h0 };
  const ap = RS.applyRuleset(h0, net.rules, rs, 10);
  near(ap.rules.minSlope, 0.004, 1e-12, 'limits applied'); ok(ap.hydro.ret === 10 && ap.hydro.rs.name === 'Office set', 'the set is copied into the hydrology settings');
  const h = HY.cleanHydro(ap.hydro, 'ft');
  ok(h.rs && h.ret === 10, 'it survives cleanHydro (project round trip)');
  near(HY.idf(20, h), 1000 * Math.pow(20, -0.75), 1e-9, 'i at 20 min = 1000·20^−0.75 (the Montana row)'); near(HY.idf(60, h), 90 / Math.pow(72, 0.8), 1e-9, 'i at 60 min = 90 / (60 + 12)^0.8 (the second row)');
  near(HY.idf(20, { ...h, ret: 100 }), 150 / Math.pow(32, 0.8), 1e-9, 'a 100-year return period picks that set'); near(HY.idf(20, HY.cleanHydro(null, 'ft')), 60 / Math.pow(30, 0.75), 1e-9, 'with no set in force the settings\' own a, b, c');
  ok(!HY.cleanHydro({ ...ap.hydro, rs: { name: 'x', rainfall: [{ ret: 5, tMin: 0, tMax: 9, a: 5, b: 1, c: 1 }] } }, 'ft').rs, 'a set with an unproven row does not survive a file');
  // roughness by material
  const pipes = [{ id: 'p1', name: 'P1', from: 's1', to: 's2', dia: 12, invUp: 100, invDn: 99, mat: 'pvc' }, { id: 'p2', name: 'P2', from: 's1', to: 's2', dia: 12, invUp: 100, invDn: 99, mat: 'conc' }, { id: 'p3', name: 'P3', from: 's1', to: 's2', dia: 12, invUp: 100, invDn: 99 }];
  const flows = { hydro: h, pipes: new Map(pipes.map((p) => [p.id, { S: 0.01, Q: 0.0001 }])) };
  const sz = Object.fromEntries(HY.sizePipes({ pipes }, flows, 'ft').map((x) => [x.id, x.cap]));
  near(sz.p1 / sz.p2, 0.013 / 0.011, 1e-9, 'capacity goes with 1/n: PVC (0.011) carries 0.013/0.011 times what concrete (0.013) does'); near(sz.p3 / sz.p2, 1, 1e-9, 'a pipe with no material uses the network\'s n (0.013)');
  ok(HY.nOf({ mat: 'pvc' }, h) === 0.011 && HY.nOf({ mat: 'zzz' }, h) === h.n && HY.nOf({}, h) === h.n, 'nOf: the material\'s n, else the network\'s');
  // the project keeps it
  const PJ2 = await mod('project.js');
  const base = new PJ2.Project().toJSON();
  const js = JSON.parse(JSON.stringify({ ...base, network: { name: 'N', type: 'storm', rules: ap.rules, structures: [{ id: 's1', name: 'A', x: 0, y: 0 }, { id: 's2', name: 'B', x: 100, y: 0 }], pipes, hydro: ap.hydro,
    rulesets: [{ ...rs, id: 'rs7' }, { ...rs, id: 'rs7', name: 'dup' }, { name: 'empty', rainfall: [] }] } }));
  const back = PJ2.Project.fromJSON(js), nw = back.project?.state?.network || back.state?.network;
  ok(nw && nw.pipes.find((x) => x.id === 'q1' || x.mat === 'pvc')?.mat === 'pvc', 'the pipe\'s material is kept in the project');
  ok(nw.hydro.rs?.name === 'Office set' && nw.hydro.ret === 10, 'the rule set in force is kept'); ok(nw.rulesets?.length === 2 && nw.rulesets[0].id === 'rs7' && nw.rulesets[1].id !== 'rs7', 'the rule-set library is kept; a repeated id is renumbered; an empty set is dropped');
  const fl = RS.readRulesetFile(JSON.parse(JSON.stringify(RS.rulesetFile([rs]))), 'ft');
  ok(fl.rulesets.length === 1 && fl.notes.length === 0 && fl.rulesets[0].rainfall.length === 3, 'the .ccrules.json file reads back whole'); ok(RS.readRulesetFile({ format: 'other' }).rulesets.length === 0, 'a file of another format is refused');
  const cur = RS.ruleFromNetwork({ hydro: h0, rules: { minSlope: 0.005, minCover: 2, minDrop: 0.1 } }, 'Now');
  ok(RS.cleanRuleset(cur).rs?.materials[0].n === 0.013 && cur.rainfall[0].entered === true, 'the current settings saved as a set are "entered", and pass the check');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
