#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-codes.mjs — CivilCraft 0.4 V16: description keys and line codes (desckeys.js + project), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-codes.mjs [--build dev|x.y] [--verbose]
 *
 * Parsing (code, line code, the rest), wildcards (* ? and escaped specials), first key wins, grouping EP1/EP2 into EP,
 * a key's use for a new group, line codes B / E / C (and their aliases, custom codes, codes switched off), lines per code
 * in point-number order, closing, a begin with no end, points between strings; the surface built from a field-coded
 * curb: two separate breaklines that never join across the gap; untrusted keys and codes; undo; the project file; the
 * fixture (no line codes) builds the same surface as before.
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
const DK = await mod('desckeys.js');
const PJ = await mod('project.js');
const PTS = await mod('points.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const P = (n, x, y, z, d) => ({ n: String(n), x, y, z, d });
const LC = DK.cleanLineCodes();

section('parsing descriptions');
{
  let d = DK.parseDesc('ep1 b back of walk', LC);
  ok(d.code === 'EP1' && d.ctrl === 'begin' && d.rest === 'back of walk', 'EP1 B back of walk → code EP1, begin, rest');
  ok(DK.parseDesc('BLDG CLOSE', LC).ctrl === 'close' && DK.parseDesc('FL end', LC).ctrl === 'end' && DK.parseDesc('FL START', LC).ctrl === 'begin', 'aliases CLOSE, end, START');
  ok(DK.parseDesc('CP 1 IRON ROD', LC).ctrl === null && DK.parseDesc('TREE 12 OAK', LC).ctrl === null, 'a number or a word after the code is not a line code');
  ok(DK.parseDesc('EP B', { ...LC, on: false }).ctrl === null, 'line codes switched off: B is just a word');
  ok(DK.parseDesc('', LC).code === '' && DK.parseDesc('   ', LC).ctrl === null, 'an empty description');
  ok(DK.parseDesc('EP X', DK.cleanLineCodes({ begin: 'X' })).ctrl === 'begin', 'a custom begin code');
}

section('description keys');
{
  const keys = DK.cleanDescKeys([{ code: 'ep*', group: 'ep', use: 'breakline', label: 'Edge of pavement' }, { code: 'E?', group: 'ELEC' }, { code: 'TR*', group: 'TREES', use: 'off' }, { code: 'CP', group: '', use: 'off', label: 'Control' }, { code: 'A.B', group: 'DOT' }]);
  const m = DK.compileKeys(keys);
  ok(m('EP')?.group === 'EP' && m('EP12')?.group === 'EP' && m('ep2').label === 'Edge of pavement', 'EP* catches EP, EP12, ep2 (case-blind)');
  ok(m('EX')?.group === 'ELEC' && m('EXX') === null, 'E? catches exactly one character after E (EP is caught earlier by EP*: first key wins)');
  ok(m('A.B')?.group === 'DOT' && m('AXB') === null, 'a dot is a dot, not any character');
  const g = DK.grouper(keys);
  ok(g(P(1, 0, 0, 0, 'EP1 B')) === 'EP' && g(P(2, 0, 0, 0, 'EP2')) === 'EP' && g(P(3, 0, 0, 0, 'GRD')) === 'GRD' && g(P(4, 0, 0, 0, 'CP 1')) === 'CP' && g(P(5, 0, 0, 0, '')) === '(no description)', 'groups: EP1/EP2 → EP; no key → the code; a key with no group → the code');
  const n = DK.keyStats([P(1, 0, 0, 0, 'EP1'), P(2, 0, 0, 0, 'EP2 B'), P(3, 0, 0, 0, 'TREE'), P(4, 0, 0, 0, 'GRD')], keys);
  ok(n.join() === '2,0,1,0,0', 'key counts for the dialog: ' + n.join());
  ok(DK.cleanDescKeys([{ code: 'bad code' }, { code: '' }, { code: '<x>' }, null, { code: 'OK', use: 'weird', label: 'a\u0007b' }]).map((k) => k.code + ':' + k.use + ':' + k.label).join() === 'BADCODE::,OK::a b', 'untrusted keys: spaces removed, junk dropped, bad use emptied, control characters cleaned');
  const lc = DK.cleanLineCodes({ on: true, begin: 'B, X', end: ['E', 'X'], close: 'C;E' });
  ok(lc.begin.join() === 'B,X' && lc.end.join() === 'E' && lc.close.join() === 'C', 'one token cannot mean two things (begin > end > close)');
  ok(DK.cleanLineCodes({ begin: '!!' }).begin.join() === 'B,BEG,START' && DK.cleanLineCodes(null).on === true && DK.cleanLineCodes({ on: false }).on === false, 'bad codes → defaults; on by default');
}

section('line codes → lines');
{
  const pts = [
    P(1, 0, 0, 10, 'EP1 B'), P(2, 10, 0, 11, 'EP1'), P(3, 20, 0, 12, 'EP1 E'),
    P(4, 30, 0, 13, 'EP1 B'), P(5, 40, 0, 14, 'EP1'),
    P(6, 0, 5, 10, 'EP2 B'), P(7, 10, 5, 10, 'GRD'), P(8, 20, 5, 10, 'EP2'),
    P(9, 0, 20, 1, 'BLDG B'), P(10, 10, 20, 1, 'BLDG'), P(11, 10, 30, 1, 'BLDG'), P(12, 0, 30, 1, 'BLDG C'),
    P(13, 50, 50, 1, 'FL'), P(14, 60, 50, 1, 'FL'), P(15, 70, 50, 1, 'FL'),
  ];
  const keys = DK.cleanDescKeys([{ code: 'EP*', group: 'EP' }]);
  const f = DK.figures(pts, { keys, lineCodes: LC });
  const desc = f.map((x) => x.code + '[' + x.pts.map((p) => p.n).join(' ') + ']' + (x.closed ? 'c' : '') + (x.coded ? '' : '-')).sort().join(' ');
  ok(desc === 'BLDG[9 10 11 12]c EP1[1 2 3] EP1[4 5] EP2[6 8] FL[13 14 15]-', 'lines: ' + desc);
  ok(f.filter((x) => x.group === 'EP').length === 3, 'EP1 and EP2 lines are both in group EP');
  const shuffled = DK.figures([...pts].reverse(), { keys, lineCodes: LC }).map((x) => x.code + x.pts.map((p) => p.n).join('')).sort().join();
  ok(shuffled === f.map((x) => x.code + x.pts.map((p) => p.n).join('')).sort().join(), 'point-number order, not file order');
  ok(DK.figures(pts, { keys, lineCodes: { ...LC, on: false } }).filter((x) => x.code === 'EP1').length === 1, 'line codes off: each code is one line through all its points');
  ok(DK.figures(pts, { keys, lineCodes: LC, only: new Set(['BLDG']) }).length === 1, 'only one group');
  ok(DK.figures([P(1, 0, 0, 1, 'X B'), P(2, 1, 0, 1, 'X E')], { lineCodes: LC }).length === 1 && DK.figures([P(1, 0, 0, 1, 'X E')], { lineCodes: LC }).length === 0, 'a two-point line; a lone point makes none');
  ok(DK.figures([P(1, 0, 0, 1, 'X B'), P(2, 1, 0, 1, 'X C')], { lineCodes: LC })[0].closed === false, 'closing needs three points');
}

section('the surface from a field-coded curb');
{
  const p = new PJ.Project();
  const pts = [];
  let n = 1;
  for (let x = -20; x <= 120; x += 20) for (let y = -40; y <= 40; y += 20) pts.push(P(n++, x, y, 100, 'GRD'));
  // two separate curb runs at 101 with a 40 ft gap where the ground stays at 100
  for (const [x, c] of [[0, 'TC B'], [10, 'TC'], [30, 'TC E'], [70, 'TC B'], [90, 'TC'], [100, 'TC E']]) pts.push(P(100 + x, x, 0.5, 101, c));
  p.setPoints(pts, 'curb');
  ok(p.state.surface.groups.TC === 'points' && p.state.surface.groups.GRD === 'points', 'groups appear with use Points');
  const steps = p.undoStack.length;
  p.setCoding([{ code: 'TC', group: 'CURB', use: 'breakline', label: 'Top of curb' }], p.state.surface.lineCodes);
  ok(p.state.surface.groups.CURB === 'breakline' && !('TC' in p.state.surface.groups) && p.undoStack.length === steps + 1, 'setCoding: group CURB (key use Breakline) replaces TC, in one undo step');
  p.change('GRD use', (s) => { s.surface.groups.GRD = 'off'; });
  p.setCoding([{ code: 'TC', group: 'CURB', use: 'breakline', label: 'Top of curb' }, { code: 'G*', group: 'GRD', use: 'breakline' }], p.state.surface.lineCodes);
  ok(p.state.surface.groups.GRD === 'off', 'a group that stays keeps the use the user gave it');
  p.undo(); p.undo();
  const bl = p.egBreaklines().filter((b) => b.fromGroup);
  ok(bl.length === 2 && bl.every((b) => b.name === 'TC' && b.pts.length === 3), 'two breaklines, 3 points each (not one line across the gap)');
  const sf = p.eg().surface;
  near(sf.elevationAt(20, 0.5), 101, 1e-9, 'on the first run the surface is at the curb (101)');
  ok(sf.elevationAt(50, 0.5) < 100.75, 'across the gap it is not pulled up to the curb (' + sf.elevationAt(50, 0.5).toFixed(3) + ')');
  p.undo();
  ok(!p.state.surface.descKeys.length && !p.egBreaklines().some((b) => b.fromGroup) && p.state.surface.groups.TC === 'points', 'undo takes the keys back (and TC is back)');
  p.redo();
  p.change('B off', (s) => { s.surface.lineCodes = { ...s.surface.lineCodes, on: false }; });
  ok(p.egBreaklines().filter((b) => b.fromGroup).length === 1, 'line codes off: one breakline through all six points');
  const q = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
  ok(JSON.stringify(q.state.surface.descKeys) === JSON.stringify(p.state.surface.descKeys) && q.state.surface.lineCodes.on === false, 'the project file keeps the keys and the line codes');
  const old = PJ.Project.fromJSON({ format: 'civilcraft-project', version: 1, units: 'ft', surface: { groups: {} } }).project;
  ok(old.state.surface.descKeys.length === 0 && old.state.surface.lineCodes.on === true, 'an older file: no keys, line codes on');
}

section('the fixture (no line codes) builds the same surface as before');
{
  const csv = fs.readFileSync(path.join(REPO, 'tools/civilcraft-test/site-topo.csv'), 'utf8');
  const p = new PJ.Project();
  p.setPoints(PTS.parsePoints(csv).points, 'site');
  p.change('groups', (s) => { for (const k of ['FL', 'TBN', 'TBS', 'RIDGE']) s.surface.groups[k] = 'breakline'; s.surface.groups.CP = 'off'; });
  ok(p.eg().surface.constrainedEdges.length === 65, 'four breakline groups: 65 constrained pieces, as the browser test of 0.3 counts');
  ok(p.egBreaklines().filter((b) => b.fromGroup).map((b) => b.name).sort().join() === 'FL,RIDGE,TBN,TBS', 'one breakline per group');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
