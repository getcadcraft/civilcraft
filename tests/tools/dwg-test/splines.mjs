#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * splines.mjs — CadCraft's splines in DWG and DXF 2000, read by the ODA File Converter (0.7 D7.10, session cad-07).
 *
 *   node tools/dwg-test/splines.mjs [--keep]
 *
 * A drawing with five splines made by CadCraft's own spline.js (a fit spline, a control-point spline, a closed fit spline, a
 * rational one, a periodic closed one) is saved as DWG 2000 … 2018 and as DXF 2000, each converted by the ODA File Converter
 * (needs xvfb) to DXF 2018; its SPLINE entities are read and compared with ours: degree, flags (closed 1, periodic 2, rational 4),
 * the number of knots and control points, the fit points of the fit spline, the weights, and the ends of the curve (the first
 * and last control point of a clamped spline, equal to the first and last fit point). Audit clean. The curve itself is not
 * compared with another program's evaluation (that is the cc-dwg fit-spline work of 0.6.1: lib/dwg/spline-fit.js).
 * Files in tmp/splines-check/ (removed unless --keep).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { REPO, flag } from './lib/util.mjs';

const ODA = path.join(REPO, 'tools/civilcraft-test/venv/dwg-readers/oda/AppRun');
const DIR = path.join(REPO, 'tmp/splines-check');
const KEEP = flag('--keep');
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  FAIL ') + m + (c || !extra ? '' : '  — ' + extra)); return !!c; };
const A = path.join(REPO, 'public_html/assets/apps/cadcraft/dev/');
const I18n = await import(pathToFileURL(A + 'i18n.js').href);
I18n.init({ strings: JSON.parse(fs.readFileSync(A + 'lang/en.json', 'utf8')) });
const { Doc } = await import(pathToFileURL(A + 'doc.js').href);
const { saveDwg } = await import(pathToFileURL(A + 'dwg-save.js').href);
const { writeDxf2000 } = await import(pathToFileURL(A + 'dxf2000.js').href);
const Sp = await import(pathToFileURL(A + 'spline.js').href);

const fit = [{ x: 0, y: 0 }, { x: 10, y: 8 }, { x: 20, y: -3 }, { x: 35, y: 5 }, { x: 50, y: 0 }];
const cvp = [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 0 }, { x: 30, y: 10 }, { x: 40, y: 0 }];
const list = [Sp.fitSpline(fit), Sp.cvSpline(cvp, { degree: 3 }), Sp.fitSpline(fit, { closed: true }), Sp.setWeight(Sp.cvSpline(cvp, { degree: 3 }), 2, 3),
  Sp.cvSpline([{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 0 }, { x: 10, y: -10 }], { degree: 3, closed: true })];
const doc = new Doc();
doc.load({ entities: list.map((e, i) => ({ ...e, layer: '0', color: i + 1 })), meta: { units: 'millimeters' } });

const xvfb = (() => { try { return execFileSync('sh', ['-c', 'command -v xvfb-run'], { encoding: 'utf8' }).trim(); } catch { return ''; } })();
if (!fs.existsSync(ODA) || !xvfb) { console.log('  note: the ODA File Converter (or xvfb-run) is not set up — nothing to check'); process.exit(0); }
fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(path.join(DIR, 'in'), { recursive: true });
const VERSIONS = ['2000', '2007', '2018'];
for (const v of VERSIONS) fs.writeFileSync(path.join(DIR, 'in', 'dwg-' + v + '.dwg'), saveDwg(doc, { version: v }).bytes);
fs.writeFileSync(path.join(DIR, 'in', 'dxf2000.dxf'), writeDxf2000(doc).text);
for (const ext of ['dwg', 'dxf']) spawnSync(xvfb, ['-a', ODA, path.join(DIR, 'in'), path.join(DIR, 'out'), 'ACAD2018', 'DXF', '0', '1', '*.' + ext], { encoding: 'utf8', timeout: 600000 });
const records = (txt) => {
  const a = txt.replace(/\r/g, '').split('\n'), out = []; let cur = null;
  for (let i = 0; i + 1 < a.length; i += 2) { const c = a[i].trim(), v = a[i + 1]; if (c === '0') { cur = { type: v.trim(), pairs: [] }; out.push(cur); } else if (cur) cur.pairs.push([c, v]); }
  return out;
};
const all = (r, c) => r.pairs.filter(([k]) => k === c).map(([, v]) => parseFloat(v));
for (const name of [...VERSIONS.map((v) => 'dwg-' + v), 'dxf2000']) {
  const f = path.join(DIR, 'out', name + '.dxf');
  if (!ok(fs.existsSync(f), name + ': ODA opens it')) continue;
  ok(!fs.existsSync(f + '.err'), name + ': audit is clean', fs.existsSync(f + '.err') ? fs.readFileSync(f + '.err', 'utf8').slice(0, 300) : '');
  const sp = records(fs.readFileSync(f, 'latin1')).filter((r) => r.type === 'SPLINE');
  ok(sp.length === 5, name + ': five SPLINE entities', String(sp.length));
  if (sp.length !== 5) continue;
  const num = (r, c) => all(r, c)[0];
  const flags = (r) => num(r, '70') & 15;
  ok(num(sp[0], '71') === 3 && all(sp[0], '11').length === 5 && Math.abs(all(sp[0], '11')[1] - 10) < 1e-9, name + ': the fit spline: degree 3 and its five fit points', JSON.stringify(all(sp[0], '11')));
  ok(all(sp[0], '10').length >= 7 && Math.abs(all(sp[0], '10')[0]) < 1e-9 && Math.abs(all(sp[0], '10').at(-1) - 50) < 1e-6, name + ': its control points start and end on the first and last fit point', JSON.stringify(all(sp[0], '10')));
  ok(num(sp[1], '73') === 5 && num(sp[1], '72') === 9 && all(sp[1], '11').length === 0, name + ': the control-point spline: 5 control points, 9 knots, no fit points');
  ok(flags(sp[2]) & 1, name + ': the closed fit spline is flagged closed', String(flags(sp[2])));
  ok((flags(sp[3]) & 4) && all(sp[3], '41').length === 5 && all(sp[3], '41')[2] === 3, name + ': the rational one: flag 4 and its weights (the third is 3)', JSON.stringify(all(sp[3], '41')));
  ok((flags(sp[4]) & 3) === 3 && num(sp[4], '73') === 7 && num(sp[4], '72') === 11, name + ': the periodic closed one: flags closed + periodic, 7 control points, 11 knots', JSON.stringify([flags(sp[4]), num(sp[4], '73'), num(sp[4], '72')]));
}
if (!KEEP) fs.rmSync(DIR, { recursive: true, force: true });
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
