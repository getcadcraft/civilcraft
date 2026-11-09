#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-templates.mjs — CivilCraft 0.9 SU.1110 + WB.6: corridor templates (templates.js), templates by station with left
 * and right apart (corridor.js), several corridors on one alignment and terrain templates (project.js), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-templates.mjs [--build dev|x.y] [--verbose]
 *
 * By hand, on flat ground at 100 ft with the road 3 ft above it (ft), the alignment along +x (right = −y):
 *   right, region 1 (0–500): two lanes (12 ft at −2 %: EOP 102.76 at 12), curb and gutter (2 ft pan at −8 %: flowline 102.60 at 14;
 *     face 0.5 ft up over 0.01 ft: top of curb 103.10 at 14.01; back 0.5 ft flat: 103.10 at 14.51), daylight 3:1 to the ground:
 *     3 × 3.10 = 9.30 ft out (23.81).
 *   left, both regions: two lanes, then a ditch: foreslope 8 ft at −25 % (100.76 at 20), bottom 4 ft (24), backslope 3:1 down
 *     0.76 × 3 = 2.28 ft (26.28, z 100).
 *   right, region 2 (500–1000): two lanes, then a retaining wall 1 ft thick: in fill the road runs over it (12 → 13 at 102.76) and its
 *     outer face drops to the ground (100): height 2.76, body 2.76 sq ft.
 *   Volumes by average end areas: the lanes' surface course 12 × 0.33 = 3.96 sq ft, base 12 × 0.67 = 8.04 sq ft, × 500 ft per region
 *   and side = 1980 / 4020 cu ft; the curb body 1.8934 sq ft by the shoelace formula (worked out separately) × 500 = 946.7; the wall
 *   2.76 × 500 = 1380.
 * Also: untrusted templates and files, parametric values and their negatives, targets, an end condition in cut, several corridors on
 * one alignment, terrain templates (topsoil below, pavement on) in a pad's outline, materials into the quantities file, the section
 * view's component lines, and older project files opening and saving unchanged.
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
const TP = await mod('templates.js');
const PJ = await mod('project.js');
const QO = await mod('qtyout.js');
const PC = await mod('problems-civilcraft.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);

const ground = (zf = () => 100) => { const p = new PJ.Project(), pts = []; let n = 1; for (let x = -100; x <= 1300; x += 25) for (let y = -300; y <= 300; y += 25) pts.push({ n: String(n++), x, y, z: zf(x, y), d: 'G' }); p.setPoints(pts, 'ground'); return p; };
const EX = TP.exampleTemplates('ft');
const tpl = (id, nid) => ({ ...JSON.parse(JSON.stringify(EX.find((x) => x.id === 'ex-' + id))), id: nid, source: 'project' });
const road = (p, z, regions, more = {}) => p.change('road', (s) => {
  s.templates = [tpl('lanes', 'tp1'), tpl('curb', 'tp2'), tpl('daylight', 'tp3'), tpl('ditch', 'tp4'), tpl('wall', 'tp5'), tpl('walk', 'tp6'), tpl('topsoil', 'tp7'), tpl('parking', 'tp8')];
  s.seq = 20;
  s.alignments.push({ id: 'a1', name: 'Road', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 1000, y: 0, r: 0 }], pvis: [{ sta: 0, z, L: 0 }, { sta: 1000, z, L: 0 }], sampling: null,
    corridor: { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 50, regions, ...more } });
});
const off = (q) => Math.abs(q.y);   // offsets from the centreline (the alignment runs along y = 0)
const at = (it, sta) => it.sections.find((s) => Math.abs(s.sta - sta) < 1e-6);
const pt = (sec, side, code) => sec.det[side].find((q) => q.code === code);
const STD = [{ from: 0, L: { uses: [{ tpl: 'tp1' }], end: { tpl: 'tp4' } }, R: { uses: [{ tpl: 'tp1' }, { tpl: 'tp2' }], end: { tpl: 'tp3' } } },
  { from: 500, L: { uses: [{ tpl: 'tp1' }], end: { tpl: 'tp4' } }, R: { uses: [{ tpl: 'tp1' }], end: { tpl: 'tp5' } } }];

section('templates: examples, untrusted input, problems, files');
{
  ok(EX.length === 8 && EX.every((x) => x.check === true && x.source === 'example'), 'eight examples, every one marked for checking by an engineer');
  ok(['ex-curb', 'ex-walk', 'ex-wall', 'ex-ditch'].every((id) => EX.some((x) => x.id === id)), 'the asked examples: curb and gutter, sidewalk, retaining wall, ditch');
  ok(EX.every((x) => TP.templateProblems(x).length === 0), 'no example has a problem');
  ok(TP.endKind(EX.find((x) => x.id === 'ex-wall')) === 'wall' && TP.endKind(EX.find((x) => x.id === 'ex-ditch')) === 'daylight' && TP.endKind(EX.find((x) => x.id === 'ex-curb')) === null, 'end kinds: wall, daylight (ditch), none (curb)');
  const EM = TP.exampleTemplates('m');
  near(TP.paramValue(EM.find((x) => x.id === 'ex-lanes'), 'w'), 3.6, 1e-12, 'metric examples in metres (3.6 m lane)');
  const c = TP.cleanTemplate({ name: 'x\u0001y', kind: 'bogus', params: [{ key: 'w', value: 10 }, { key: 'w', value: 3 }, { key: 'Bad Key', value: 1 }, { key: 'h', value: 'x' }],
    points: [{ code: 'A', from: '0', kind: 'slope', dx: 'w', slope: -0.02, top: true }, { code: 'A', from: '0', kind: 'slope' }, { code: 'B', from: 'Z', kind: 'delta' }, { code: 'C', from: 'A', kind: 'vertical', dz: '-w' }, { code: 'D', from: 'C', kind: 'nope' }, { code: 'E', from: 'A', kind: 'slope', dx: 'nokey', slope: 9e9 }],
    components: [{ name: 'k', pts: ['0', 'A', 'C'] }, { name: 'two', pts: ['0', 'A'] }, { name: 'bad', pts: ['0', 'A', 'Q'] }] }, 'ft');
  ok(c.name === 'x y' && c.kind === 'pavement', 'control characters stripped, an unknown kind is pavement');
  ok(c.params.length === 1 && c.params[0].value === 10, 'params: one per key, bad keys and values dropped');
  ok(c.points.map((q) => q.code).join() === 'A,C,E', 'points: duplicates, unknown parents and unknown kinds dropped');
  ok(c.points[2].dx === 0 && c.points[2].slope === 0, 'a value naming no param, and one out of range, fall back to 0');
  ok(c.components.length === 1, 'components: fewer than three known points dropped');
  const r = TP.evalTemplate(c, { params: { w: 20 } });
  near(r.pts.get('A').o, 20, 1e-12, 'a use\'s value overrides the template\'s'); near(r.pts.get('C').z, r.pts.get('A').z - 20, 1e-12, '"-w" = minus the value');
  near(r.comps[0].area, 0.5 * 20 * 20, 1e-9, 'the component\'s area (a right triangle 20 × 20)');
  ok(TP.templateProblems({ ...c, kind: 'end' }).some((p) => p.code === 'endnoground'), 'an end condition that never meets the ground is a problem');
  ok(TP.templateProblems(TP.cleanTemplate({ name: 'n', points: [{ code: 'A', from: '0', kind: 'slope', dx: 1, slope: 0 }] })).some((p) => p.code === 'notop'), 'no top point is a problem');
  ok(TP.templateProblems(TP.cleanTemplate({ name: 'n', kind: 'pavement', points: [{ code: 'A', from: '0', kind: 'daylight', top: true }] })).some((p) => p.code === 'pavementends'), 'a pavement template that ends on the ground is a problem');
  const f = TP.templatesFile(EX), back = TP.readTemplatesFile(JSON.parse(JSON.stringify(f)), 'ft');
  ok(f.format === 'cadcraft-corridor-templates' && f.version === 1 && back.templates.length === 8 && back.templates.every((x) => x.source === 'file'), 'the .cctemplates.json file round-trips the examples');
  ok(JSON.stringify(back.templates.map(({ source, ...x }) => x)) === JSON.stringify(EX.map(({ source, ...x }) => x)), 'byte for byte the same templates after the trip');
  ok(TP.readTemplatesFile({ format: 'x' }).notes[0].code === 'notfile' && TP.readTemplatesFile({ format: TP.TPL_FORMAT, version: 2 }).notes[0].code === 'newer', 'not a template file / a newer version: said, nothing read');
  ok(TP.readTemplatesFile({ format: TP.TPL_FORMAT, version: 1, templates: [EX[0], null, 'x'] }).notes[0]?.vars?.n === 2, 'unreadable templates in a file are counted');
}

section('a corridor from templates by station, left and right apart (by hand)');
let P1;
{
  const p = ground(); road(p, 103, STD); P1 = p;
  const it = p.graded().items.find((x) => x.id === 'a1');
  ok(it && !it.problems.length && it.sections.length === 22, 'graded: 22 sections (every 50 ft + the end of region 1 just short of 500), no problems');
  ok(it.sections.some((s) => Math.abs(s.sta - 499.7) < 1e-9 && s.region === 0) && at(it, 500).region === 1, 'region 1 runs to 499.7 (0.3 ft short), region 2 starts at 500');
  const s = at(it, 100);
  near(off(pt(s, 'R', 'EOP')), 12, 1e-9, 'right EOP at 12'); near(pt(s, 'R', 'EOP').z, 102.76, 1e-9, 'right EOP z 102.76');
  near(off(pt(s, 'R', 'FL')), 14, 1e-9, 'flowline at 14'); near(pt(s, 'R', 'FL').z, 102.60, 1e-9, 'flowline z 102.60');
  near(off(pt(s, 'R', 'TC')), 14.01, 1e-9, 'top of curb at 14.01'); near(pt(s, 'R', 'TC').z, 103.10, 1e-9, 'top of curb z 103.10');
  near(off(pt(s, 'R', 'BC')), 14.51, 1e-9, 'back of curb at 14.51');
  near(off(pt(s, 'R', 'DL')), 23.81, 1e-4, 'right daylight at 23.81 (3:1 fill)'); near(pt(s, 'R', 'DL').z, 100, 1e-4, 'on the ground');
  ok(s.R[3].kind === 'fill', 'the daylight is in fill');
  near(off(pt(s, 'L', 'DF')), 20, 1e-9, 'left ditch foreslope foot at 20'); near(pt(s, 'L', 'DF').z, 100.76, 1e-9, 'z 100.76');
  near(off(pt(s, 'L', 'DB')), 24, 1e-9, 'ditch bottom 4 ft'); near(off(pt(s, 'L', 'DL')), 26.28, 1e-4, 'backslope 3:1 to 26.28');
  ok(!pt(s, 'L', 'FL'), 'the left side has no curb (sides set apart)');
  const s2 = at(it, 750);
  ok(pt(s2, 'R', 'W_I') && !pt(s2, 'R', 'FL'), 'region 2 on the right: the wall instead of curb and daylight');
  near(pt(s2, 'R', 'W_I').z, 102.76, 1e-9, 'in fill the road runs over the wall'); near(pt(s2, 'R', 'DL').z, 100, 1e-9, 'the outer face drops to the ground');
  near(off(pt(s2, 'R', 'DL')), 13.01, 1e-9, 'the face is nudged 0.01 ft out (one height per offset)');
  ok(pt(s2, 'L', 'DF'), 'the left keeps its ditch in region 2');
  ok(at(it, 500).compsBefore?.R?.some((c) => /curb/.test(c.name)), 'the boundary station keeps the region before\'s components for the volumes');
  const q = (side, region, re) => it.components.find((c) => c.side === side && c.region === region && re.test(c.name));
  near(q('R', 0, /surface/).volume, 1980, 1e-6, 'right surface course, 0–500: 1980 cu ft'); near(q('R', 0, /base/).volume, 4020, 1e-6, 'right base: 4020 cu ft');
  near(q('L', 1, /surface/).volume, 1980, 1e-6, 'left surface course, 500–1000: 1980');
  near(q('R', 0, /curb/).volume, 946.7, 1e-6, 'curb and gutter 0–500: 1.8934 × 500 = 946.7 cu ft');
  ok(!q('R', 1, /curb/), 'no curb volume past 500');
  near(q('R', 1, /wall/).volume, 1380, 1e-6, 'the wall 500–1000: 2.76 × 500 = 1380 cu ft'); near(q('R', 1, /wall/).maxH, 2.76, 1e-9, 'its tallest height 2.76');
  ok(it.lines.FL_R?.length === 11 && it.lines.W_I_R?.length === 11 && it.lines.DF_L?.length === 22, 'a line per code: FL on the right 0–499.7 (11 sections), the wall 500–1000, the ditch all along');
  if (VERBOSE) console.log(Object.entries(it.lines).map(([k, v]) => k + ':' + v.length).join(' '));
  ok(it.lines.EOP_R.length === 22 && it.lines.DL_L.length === 22, 'EOP and DL lines all along (staking, sections, targets keep working)');
  const v = p.volumes();
  ok(v && v.fill > 0 && v.items.length === 1, 'earthwork: the corridor graded into the existing ground');
}

section('an end condition in cut, and the corridor\'s own daylight');
{
  const p = ground(); road(p, 97, [{ from: 0, L: { uses: [{ tpl: 'tp1' }], end: null }, R: { uses: [{ tpl: 'tp1' }], end: { tpl: 'tp5' } } }]);
  const it = p.graded().items.find((x) => x.id === 'a1'), s = at(it, 300);
  near(pt(s, 'R', 'W_I').z, 100, 1e-9, 'in cut the wall\'s top meets the ground at its road face');
  near(off(pt(s, 'R', 'W_I')), 12.01, 1e-9, 'its road face is the edge of pavement (nudged 0.01)');
  const w = it.components.find((c) => c.wall);
  near(w.volume, 3.24 * 1000, 1e-6, 'wall body 3.24 × 1 ft (96.76 up to 100) × 1000 ft');
  near(off(pt(s, 'L', 'DL')), 12 + 2 * 3.24, 1e-4, 'no end condition on the left: the corridor\'s own 2:1 cut daylight (18.48)');
  ok(s.L[3].kind === 'cut', 'in cut');
}

section('parametric values and point targets');
{
  const p = ground();
  road(p, 103, [{ from: 0, L: { uses: [{ tpl: 'tp1', params: { w: 18, s: -0.03 } }], end: null }, R: { uses: [{ tpl: 'tp1', targets: { EOP: { kind: 'feature', id: 'f1' } } }], end: { tpl: 'tp3', params: { fill: 4 } } } }]);
  p.change('feature', (s) => { s.features = [{ id: 'f1', name: 'Edge', pts: [{ x: -10, y: -16, z: 0 }, { x: 1010, y: -16, z: 0 }], closed: false, use: 'off', daylight: false, cut: 2, fill: 2 }]; });
  const it = p.graded().items.find((x) => x.id === 'a1'), s = at(it, 400);
  near(off(pt(s, 'L', 'EOP')), 18, 1e-9, 'a use\'s own width: 18 on the left'); near(pt(s, 'L', 'EOP').z, 103 - 18 * 0.03, 1e-9, 'and its own slope (−3 %)');
  near(off(pt(s, 'R', 'EOP')), 16, 1e-9, 'a width target: the right EOP on the feature line at 16'); near(pt(s, 'R', 'EOP').z, 103 - 16 * 0.02, 1e-9, 'its cross slope kept');
  near(off(pt(s, 'R', 'DL')), 16 + 4 * (103 - 0.32 - 100), 1e-4, 'the daylight end condition with its own 4:1 fill');
  const v1 = it.components.find((c) => c.side === 'R' && /surface/.test(c.name)).volume;
  near(v1, 16 * 0.33 * 1000, 1e-6, 'the targeted lane\'s surface course follows the target (16 × 0.33 × 1000)');
  p.change('move', (s) => { s.features[0].pts.forEach((q) => { q.y = -20; }); });
  near(off(pt(at(p.graded().items.find((x) => x.id === 'a1'), 400), 'R', 'EOP')), 20, 1e-9, 'moving the line moves the point (the corridor depends on it)');
}

section('several corridors on one alignment');
{
  const p = ground();
  road(p, 103, [{ from: 0, L: { uses: [{ tpl: 'tp1' }], end: { tpl: 'tp3' } }, R: { uses: [{ tpl: 'tp1' }], end: { tpl: 'tp3' } } }], { to: 600 });
  p.change('more', (s) => { s.alignments[0].corridors = [{ id: 'cr30', name: 'East', on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 50, from: 600, to: 1000,
    regions: [{ from: 600, L: { uses: [{ tpl: 'tp1' }, { tpl: 'tp6' }], end: { tpl: 'tp3' } }, R: { uses: [{ tpl: 'tp1' }, { tpl: 'tp6' }], end: { tpl: 'tp3' } } }] }]; });
  const items = p.graded().items.filter((x) => x.kind === 'corridor');
  ok(items.length === 2 && items.every((x) => !x.problems.length), 'two corridors graded');
  const a = items.find((x) => x.id === 'a1'), b = items.find((x) => x.id === 'cr30');
  ok(a.from === 0 && a.to === 600 && b.from === 600 && b.to === 1000, 'each on its own station range (0–600, 600–1000)');
  ok(b.alignment === 'a1' && /East/.test(b.name), 'the second knows its alignment and its name');
  ok(pt(at(b, 800), 'R', 'BW') && !pt(at(a, 300), 'R', 'BW'), 'its own templates (a sidewalk only on the second)');
  ok(p.volumes().items.length === 2, 'earthwork per corridor');
  const back = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
  ok(JSON.stringify(back.state.alignments[0].corridors) === JSON.stringify(p.state.alignments[0].corridors), 'the project file keeps the second corridor');
  ok(back.state.seq > 30, 'ids counted (seq past cr30)');
  p.change('sample', (s) => { s.alignments[0].sampling = { step: 100, left: 40, right: 40, extra: [] }; });
  const sec = p.sections(p.state.alignments[0]);
  const s8 = sec.sections.find((x) => Math.abs(x.sta - 800) < 1e-6), s3 = sec.sections.find((x) => Math.abs(x.sta - 300) < 1e-6);
  ok(s8.marks.some((m) => m.code === 'BW_R') && !s8.marks.some((m) => /#/.test(m.code)), 'sections: the second corridor\'s marks, codes without its key');
  ok(s3.layers.length > 0 && s8.layers.length > s3.layers.length, 'sections: the templates\' components as lines (more where the walk is)');
}

section('terrain templates (WB.6)');
{
  const p = ground((x, y) => 100 + 0.1 * y);   // a 10 % slope across the road
  road(p, 103, STD);
  p.change('pad', (s) => { s.pads = [{ id: 'p40', name: 'Lot', pts: [{ x: 100, y: 50 }, { x: 300, y: 50 }, { x: 300, y: 150 }, { x: 100, y: 150 }], z: 120, cut: 2, fill: 2 }]; });
  p.change('tt', (s) => { s.terrainTemplates = [{ id: 'tt41', name: 'Strip topsoil', tpl: 'tp7', surface: 'eg', clip: { kind: 'pad', id: 'p40' } }, { id: 'tt42', name: 'Parking', tpl: 'tp8', surface: 'eg', clip: { kind: 'pad', id: 'p40' }, params: { base: 1.5 } }]; });
  const r = p.terrainResults();
  ok(r.length === 2 && r.every((x) => !x.problem), 'two terrain templates worked out');
  const top = r[0].q, park = r[1].q;
  near(top.planArea, 20000, 200, 'plan area of the pad outline: 200 × 100 = 20 000 sq ft (grid)');
  near(top.slopedArea / top.planArea, Math.sqrt(1 + 0.01), 1e-3, 'the draped area follows the 10 % slope (√1.01)');
  near(top.layers[0].t, 0.5, 1e-12, 'topsoil 0.5 ft'); ok(top.layers[0].where === 'below', 'placed into the terrain');
  near(top.layers[0].volume, top.planArea * 0.5, 1e-9, 'its volume = plan area × 0.5');
  ok(park.layers.length === 2 && park.layers.every((L) => L.where === 'on'), 'pavement and base placed on the terrain');
  ok(park.layers[0].name.includes('surface') && Math.abs(park.layers[0].t - 5 / 12) < 1e-12, 'top down: the surface course first (5 in)');
  near(park.layers[1].t, 1.5, 1e-12, 'the base 1.5 ft: this terrain template\'s own value'); near(park.layers[1].volume, park.planArea * 1.5, 1e-9, 'base volume');
  const whole = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
  ok(JSON.stringify(whole.state.terrainTemplates) === JSON.stringify(p.state.terrainTemplates), 'the project file keeps the terrain templates');
  p.change('nopad', (s) => { s.pads = []; });
  ok(p.terrainResults()[0].problem === 'noshape', 'a deleted shape is said, nothing counted');
  const tw = p.templateWarnings(), pr = PC.civilProblems({ templates: tw }, { t: I18N.t });
  ok(tw.some((w) => w.code === 'tpl.terrain.noshape') && pr.some((x) => x.code === 'tpl.terrain.noshape' && x.severity === 'warning' && x.about[0].id === 'tt41' && x.source.name === 'civilcraft.templates'), 'Problems: the terrain template with no shape, as a shared warning about it');
  p.change('whole', (s) => { s.terrainTemplates[0].clip = null; });
  ok(p.terrainResults()[0].q.planArea > 100000, 'no shape = the whole terrain');
  const mats = p.materials();
  ok(mats.some((m) => m.source === 'corridor' && /curb/.test(m.name)) && mats.some((m) => m.source === 'terrain' && m.kind === 'topsoil'), 'materials: corridor components and terrain layers');
  const f = QO.earthworkFile({ name: 'T', units: 'ft', volumes: p.volumes(), materials: mats, made: 'x' });
  const items = f.json.items;
  if (VERBOSE) console.log(f.ok, f.why, items?.map((x) => x.key));
  ok(items[0].key === 'earthwork:cut' && items.filter((x) => x.key.startsWith('material:')).length === mats.length, 'the quantities file: cut, fill, then one item per material');
  const tsoil = items.find((x) => x.key.startsWith('material:terrain:tt41'));
  near(tsoil.qty, Math.round((mats.find((m) => m.id === 'tt41').volume / 27) * 100) / 100, 1e-9, 'in cubic yards (÷ 27)');
  const only = QO.earthworkFile({ name: 'T', units: 'm', volumes: null, materials: [{ source: 'terrain', id: 'tt1', item: 'x', name: 'Topsoil', material: '', kind: 'topsoil', volume: 12 }], made: 'x' });
  ok(only.ok && only.json.items.length === 1 && only.json.items[0].unit === 'm³', 'materials alone (nothing graded) still make a file');
}

section('older files open and save as before');
{
  // the released build (current) makes and saves the project; this build opens it and saves it again
  const REL = path.join(REPO, 'public_html/assets/apps/civilcraft/current');
  const relMod = (f) => import(pathToFileURL(path.join(REL, f)).href);
  (await relMod('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(REL, 'lang/en.json'), 'utf8')) });
  const OLD = await relMod('project.js');
  const old = new OLD.Project(), pts = []; let n = 1; for (let x = -100; x <= 1300; x += 25) for (let y = -300; y <= 300; y += 25) pts.push({ n: String(n++), x, y, z: 100, d: 'G' });
  old.setPoints(pts, 'ground');
  old.change('road', (s) => s.alignments.push({ id: 'a1', name: 'Road', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 1000, y: 0, r: 0 }], pvis: [{ sta: 0, z: 103, L: 0 }, { sta: 1000, z: 103, L: 0 }], sampling: null,
    corridor: { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 50, parts: { L: [{ type: 'lane', w: 12, slope: 0.02 }, { type: 'daylight', cut: 2, fill: 3 }], R: [{ type: 'lane', w: 12, slope: 0.02 }, { type: 'gutter', w: 2, slope: 0.08 }, { type: 'daylight', cut: 2, fill: 3 }] } } }));
  // the file as the released build writes it after opening it (its own key order and id counter)
  const oldFile = JSON.parse(JSON.stringify(OLD.Project.fromJSON(JSON.parse(JSON.stringify(old.toJSON()))).project.toJSON()));
  const r = PJ.Project.fromJSON(JSON.parse(JSON.stringify(oldFile)));
  const j = JSON.parse(JSON.stringify(r.project.toJSON()));
  ok(!r.notes.length, 'a file saved by the released build (' + fs.readlinkSync(REL) + ') opens with no notes');
  ok(j.version === 1 && !('templates' in j) && !('terrainTemplates' in j) && !('corridors' in j.alignments[0]), 'saved again: file version 1, no new keys');
  ok(!('from' in j.alignments[0].corridor) && !('regions' in j.alignments[0].corridor), 'its corridor has no new keys');
  delete oldFile.saved; delete j.saved;
  ok(JSON.stringify(j) === JSON.stringify(oldFile), 'opened and saved again: byte for byte what the released build writes');
  const before = old.graded().items[0], after = r.project.graded().items[0];
  ok(JSON.stringify(before.sections.map((s) => s.det)) === JSON.stringify(after.sections.map((s) => s.det)), 'and it builds the same sections as the released build');
  const newer = JSON.parse(JSON.stringify(P1.toJSON()));
  const o2 = OLD.Project.fromJSON(newer);
  ok(o2.project.state.alignments[0].corridor.on && o2.project.graded().items.length === 1, 'a file with templates still opens in the released build (it ignores the new keys and grades the assembly)');
  const j2 = JSON.parse(JSON.stringify(P1.toJSON()));
  j2.alignments[0].corridor.regions[0].R.uses.push({ tpl: 'tp99' }); j2.templates.push({ name: 1, points: 'x' });
  const r2 = PJ.Project.fromJSON(j2);
  ok(r2.project.state.alignments[0].corridor.regions[0].R.uses.length === 2, 'a use naming a template the file lacks is dropped');
  ok(r2.project.state.templates.length === 8 && r2.notes.some((n) => /could not be read/.test(n)), 'an unreadable template is dropped and said');
  const j3 = JSON.parse(JSON.stringify(P1.toJSON())); delete j3.templates;
  const r3 = PJ.Project.fromJSON(j3).project;
  ok(!r3.state.alignments[0].corridor.regions, 'regions without their templates are left out (the corridor falls back to its assembly)');
  ok(r3.graded().items[0].sections.length > 2, 'and it still grades');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
