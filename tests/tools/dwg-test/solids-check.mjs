/* SPDX-License-Identifier: Apache-2.0 */
/**
 * solids-check.mjs — builder S's check of REGION / 3DSOLID / BODY (ACIS data) and LIGHT, reader and writer.
 *
 *   node tools/dwg-test/solids-check.mjs [--read] [--write] [--keep] [--quick]
 *
 * Inputs: tmp/dwg-solids (made by solids-fixture.sh: ezdxf ACIS as SAT and as SAB → ODA File Converter → DWG in all six
 * versions + the converter's DXF of each in its own version) and AutoCAD's example_20xx.dwg in every corpus version
 * (truth: the corpus's ODA DXF 2018).
 *
 * --read: our reader's ACIS data per handle against the converter's DXF (solids-compare.py, ezdxf as a black box): the
 *   same bytes / text when both carry the same format, else the same body vertices; every entity present; LIGHT fields.
 * --write: every input read by us → written in all six versions → ODA File Converter (audit; no .err allowed) → its DXF:
 *   the same ACIS bodies (vertices) and lights by position as the source; our reader reads our file back with the same
 *   ACIS data; LibreDWG dwgread and libdxfrw dwg2dxf open it with no more errors than they report on the source DWG.
 * Default: both. --quick: the fixtures without the big sphere (CC_BIG=0 fixture) and only the first corpus sample.
 */
import fs from 'node:fs';
import path from 'node:path';
import { readDwg } from '../../lib/dwg/read.js';
import { writeDwg } from '../../lib/dwg/write.js';
import { REPO, CORPUS, TRUTH, PYTHON, READERS, TAGS, TAG_TO_ODA, mkdirp, runTimed, odaConvert, flag, pool } from './lib/util.mjs';

const HERE = path.join(REPO, 'tools/dwg-test');
const FIX = path.join(REPO, 'tmp/dwg-solids');
const WORK = mkdirp(path.join(FIX, 'check'));
const doRead = flag('--read') || !flag('--write');
const doWrite = flag('--write') || !flag('--read');
const ACIS_TYPES = new Set(['REGION', '3DSOLID', 'BODY']);
let failures = 0;
const fail = (m) => { failures++; console.log('  FAIL ' + m); };

/** Every ACIS entity / LIGHT of a model, by handle (blocks included). */
function collect(model) {
  const acis = {}, lights = {};
  for (const b of model.blocks || []) for (const e of b.entities || []) {
    if (ACIS_TYPES.has(e.type)) acis[e.handle] = { type: e.type, format: e.acis?.format, data: e.acis?.data, version: e.acis?.version, block: b.name };
    if (e.type === 'LIGHT') lights[e.handle] = e;
  }
  return { acis, lights };
}

async function compare(truthDxf, ours, tag) {
  const oj = path.join(WORK, tag + '.ours.json'), rj = path.join(WORK, tag + '.cmp.json');
  fs.writeFileSync(oj, JSON.stringify(ours));
  const r = await runTimed(PYTHON, ['-I', path.join(HERE, 'solids-compare.py'), truthDxf, oj, rj], { timeout: 900000, encoding: 'utf8' });
  if (r.status !== 0) { fail(tag + ': solids-compare.py: ' + r.stderr.trim().split('\n').slice(-2).join(' | ')); return null; }
  return JSON.parse(fs.readFileSync(rj, 'utf8'));
}

const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
function checkLights(tag, ours, truth) {
  let n = 0;
  for (const [h, t] of Object.entries(truth)) {
    const o = ours[h];
    if (!o) { fail(`${tag} LIGHT ${h}: missing`); continue; }
    const bad = [];
    const eq = (k, a, b) => { if (typeof b === 'number' ? !near(+a, b) : a !== b) bad.push(`${k} ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`); };
    eq('name', o.name, t.name); eq('type', o.lightType, t.type); eq('status', +o.status, t.status); eq('plotGlyph', +o.plotGlyph, t.plotGlyph);
    eq('intensity', o.intensity, t.intensity); eq('attenuationType', o.attenuationType, t.attenuationType);
    eq('useAttenuationLimits', +o.useAttenuationLimits, t.useAttenuationLimits); eq('attenuationStart', o.attenuationStart, t.attenuationStart);
    eq('attenuationEnd', o.attenuationEnd, t.attenuationEnd); eq('castShadows', +o.castShadows, t.castShadows); eq('shadowType', o.shadowType, t.shadowType);
    eq('shadowMapSize', o.shadowMapSize, t.shadowMapSize); eq('shadowMapSoftness', o.shadowMapSoftness, t.shadowMapSoftness);
    // DXF 50/51 are degrees; the DWG stores radians
    eq('hotspot', o.hotspot * 180 / Math.PI, t.hotspot); eq('falloff', o.falloff * 180 / Math.PI, t.falloff);
    for (const k of ['x', 'y', 'z']) { eq('position.' + k, o.position[k], t.position['xyz'.indexOf(k)]); eq('target.' + k, o.target[k], t.target['xyz'.indexOf(k)]); }
    const ec = o.color || {};   // the entity's colour (DXF 62/420)
    if (t.trueColor !== undefined && t.trueColor !== null) eq('trueColor', ec.rgb, t.trueColor & 0xFFFFFF);
    else eq('color', ec.index, t.color);
    const lc = o.lightColor || {}, tl = t.lightColor || {};   // the light's colour (DXF 63/421)
    if (tl.rgb !== undefined) eq('lightColor.rgb', lc.rgb, tl.rgb);
    else if (tl.index !== undefined) eq('lightColor.index', lc.index, tl.index);
    if (bad.length) fail(`${tag} LIGHT ${h}: ${bad.join('; ')}`); else n++;
  }
  return n;
}

/** Inputs: [{ tag, dwg, truth }] */
function inputs() {
  const list = [];
  for (const s of ['sat', 'sab']) for (const v of TAGS) {
    const dwg = path.join(FIX, 'dwg', `${s}-${v}.dwg`), truth = path.join(FIX, 'truth', `${s}-${v}.dxf`);
    if (fs.existsSync(dwg) && fs.existsSync(truth)) list.push({ tag: `${s}-${v}`, dwg, truth });
  }
  const samples = flag('--quick') ? ['example-2013'] : ['example-2000', 'example-2004', 'example-2007', 'example-2010', 'example-2013', 'example-2018'];
  for (const name of samples) for (const v of TAGS) {
    // the converter's DXF in the DWG's own version (solids-fixture.sh), else the corpus's DXF 2018
    const own = path.join(FIX, 'corpus-truth', v, name + '.dxf');
    const dwg = path.join(CORPUS, v, name + '.dwg'), truth = fs.existsSync(own) ? own : path.join(TRUTH, v, name + '.dxf');
    if (fs.existsSync(dwg) && fs.existsSync(truth)) list.push({ tag: `${name}-${v}`, dwg, truth });
  }
  return list;
}

async function readCheck(list) {
  console.log('== reader: ACIS data and LIGHT against the ODA File Converter\'s DXF');
  const tot = { ent: 0, exact: 0, geom: 0, tok: 0, lights: 0 };
  await pool(list, 4, async (inp) => {
    const m = readDwg(fs.readFileSync(inp.dwg));
    const { acis, lights } = collect(m);
    const cmp = await compare(inp.truth, acis, inp.tag);
    if (!cmp) return;
    let ex = 0, ge = 0, tk = 0, n = 0;
    for (const [h, r] of Object.entries(cmp.entities)) {
      n++;
      if (r.truthError) { fail(`${inp.tag} ${r.type} ${h}: truth unreadable (${r.truthError})`); continue; }
      if (!r.oursFormat) { fail(`${inp.tag} ${r.type} ${h}: no ACIS data read`); continue; }
      if (r.exact) ex++;
      if (r.sameVertices) ge++;
      if (r.sameTokens) tk++;
      // identical (save date aside) when both carry the same format; else the same records, numbers and pointers
      // (bytes that differ while every token is equal: the converter writes −0 as 0 in its DXF)
      if (r.exact === false && !r.sameTokens) fail(`${inp.tag} ${r.type} ${h}: ${r.oursFormat} data differs from the converter's (${r.oursSize} vs ${r.truthSize})`);
      if (!r.exact && !r.sameTokens) fail(`${inp.tag} ${r.type} ${h}: ${r.tokenDiff || r.tokenError} (ours ${r.oursFormat} ${r.oursSize}, truth ${r.truthFormat} ${r.truthSize})`);
    }
    const extra = Object.keys(acis).filter((h) => !cmp.entities[h]);
    if (extra.length) fail(`${inp.tag}: ACIS entities the converter's DXF does not have: ${extra.join(' ')}`);
    const nl = checkLights(inp.tag, lights, cmp.lights);
    if (Object.keys(lights).length !== Object.keys(cmp.lights).length) fail(`${inp.tag}: ${Object.keys(lights).length} lights read, DXF has ${Object.keys(cmp.lights).length}`);
    tot.ent += n; tot.exact += ex; tot.geom += ge; tot.tok += tk; tot.lights += nl;
    console.log(`  ${inp.tag.padEnd(22)} ACIS ${n} (identical ${ex}, same tokens ${tk}, same ezdxf vertices ${ge})  lights ${nl}/${Object.keys(cmp.lights).length}  ${m.report.notes.filter((x) => /ACIS|data storage/i.test(x)).join(' ')}`);
  });
  console.log(`  total: ${tot.ent} ACIS entities, ${tot.exact} identical, ${tot.tok} same tokens, ${tot.geom} same ezdxf vertices; ${tot.lights} lights equal`);
}

export { collect, compare, checkLights, inputs, fail };

async function main() {
  const list = inputs();
  if (!list.length) { console.log('No inputs: run tools/dwg-test/solids-fixture.sh first.'); process.exit(1); }
  if (doRead) await readCheck(list);
  if (doWrite) { const { writeCheck } = await import('./solids-write-check.mjs'); await writeCheck(list, { keep: flag('--keep'), quick: flag('--quick') }); }   // its failures count through fail()
  console.log(failures ? `${failures} failure(s)` : 'all solids checks passed');
  process.exit(failures ? 1 : 0);
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) main();
