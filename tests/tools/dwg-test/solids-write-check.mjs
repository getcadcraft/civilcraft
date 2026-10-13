/* SPDX-License-Identifier: Apache-2.0 */
/**
 * solids-write-check.mjs — the --write half of solids-check.mjs (builder S): every input read by our reader, written by
 * our writer in all six versions, then
 *   - our reader reads the written file: every ACIS entity carries the same data (format + bytes/text) and every LIGHT
 *     the same fields as the source model;
 *   - the ODA File Converter (audit on) saves it as DXF in the same version: no .err, and that DXF carries the same
 *     ACIS data and lights as the converter's DXF of the source DWG in that version (the converter re-saves ACIS its own
 *     way — another ACIS version, SAB ↔ SAT — the same way for both: identical apart from the save date, else the same
 *     records, numbers and pointers);
 *   - LibreDWG dwgread -v2 and libdxfrw dwg2dxf: no kind of error they do not show on the converter's own DWG of the
 *     same drawing in that version.
 * Written files: tmp/dwg-solids/written/<input>-to-<version>.dwg (kept with --keep).
 */
import fs from 'node:fs';
import path from 'node:path';
import { readDwg } from '../../lib/dwg/read.js';
import { writeDwg } from '../../lib/dwg/write.js';
import { REPO, READERS, TAGS, TAG_TO_ODA, mkdirp, runTimed, odaConvert, pool } from './lib/util.mjs';
import { collect, fail } from './solids-check.mjs';
import { PYTHON } from './lib/util.mjs';

const OUT = mkdirp(path.join(REPO, 'tmp/dwg-solids/written'));
const SRCDXF = mkdirp(path.join(REPO, 'tmp/dwg-solids/source-dxf'));
const LR = path.join(READERS, 'libredwg/bin/dwgread');
const DXFRW = path.join(READERS, 'libdxfrw/dwg2dxf');

async function libredwgErrors(file) {
  if (!fs.existsSync(LR)) return null;
  const r = await runTimed(LR, ['-v2', file], { timeout: 300000 });
  const errs = r.stderr.split('\n').filter((l) => /^ERROR/i.test(l.trim()));
  const kinds = [...new Set(errs.map((l) => l.trim().replace(/-?\d+/g, '#')))];
  return { n: errs.length + (r.status !== 0 ? 1 : 0), kinds, crashed: r.status !== 0, sample: kinds.slice(0, 3) };
}
async function libdxfrwOk(file) {
  if (!fs.existsSync(DXFRW)) return null;
  const dxf = file + '.dxfrw.dxf';
  const r = await runTimed(DXFRW, [file, '-y', '-v2000', dxf], { timeout: 300000, encoding: 'utf8' });
  const ok = /Success/.test(r.stdout) && fs.existsSync(dxf);
  fs.rmSync(dxf, { force: true });
  return ok;
}

export async function writeCheck(list, { keep = false, quick = false } = {}) {
  console.log('== writer: every input written in all six versions → our reader, ODA (audit), LibreDWG, libdxfrw');
  let before = 0;
  const failsAt = () => before;
  const inputs = quick ? list.filter((x) => /^(sat|sab)-AC1032$|^example-2013-AC1027$/.test(x.tag)) : list;
  const base = new Map();
  // baseline: the oracles on the converter's own DWG of the same drawing in the target version (fixtures and corpus
  // hold one per version), else on the source
  const peer = (inp, v) => {
    const f = inp.tag.startsWith('sat-') || inp.tag.startsWith('sab-') ? path.join(REPO, 'tmp/dwg-solids/dwg', inp.tag.slice(0, 4) + v + '.dwg')
      : path.join('/var/www/CADCRAFT/testfiles/dwg-corpus', v, inp.tag.replace(/-AC10\d\d$/, '') + '.dwg');
    return fs.existsSync(f) ? f : inp.dwg;
  };
  const bjobs = [];
  for (const inp of inputs) for (const v of TAGS) bjobs.push({ inp, v });
  await pool(bjobs, 6, async ({ inp, v }) => { const f = peer(inp, v); base.set(inp.tag + v, { lr: await libredwgErrors(f), rw: await libdxfrwOk(f) }); });
  const jobs = [];
  for (const inp of inputs) for (const v of TAGS) jobs.push({ inp, v });
  const tot = { files: 0, acis: 0, same: 0, oda: 0, odaAcis: 0, lights: 0 };
  await pool(jobs, 6, async ({ inp, v }) => {
    const tag = `${inp.tag}-to-${v}`;
    const src = readDwg(fs.readFileSync(inp.dwg));
    const { acis: srcAcis, lights: srcLights } = collect(src);
    let out;
    try { out = writeDwg(src, { version: v }); } catch (e) { fail(`${tag}: writer threw ${e.message}`); return; }
    const file = path.join(OUT, tag + '.dwg');
    fs.writeFileSync(file, out.bytes);
    tot.files++;
    const map = out.report.handles || {};
    // 1. our reader
    const back = readDwg(out.bytes);
    const { acis: backAcis, lights: backLights } = collect(back);
    let same = 0, n = 0;
    for (const [h, a] of Object.entries(srcAcis)) {
      const nh = map[h];
      if (!a.format) continue;
      n++;
      if (!nh || !backAcis[nh]) { fail(`${tag} ${a.type} ${h}: not in the written file`); continue; }
      const b = backAcis[nh];
      if (b.format !== a.format || b.data !== a.data) fail(`${tag} ${a.type} ${h}→${nh}: reads back ${b.format} ${String(b.data).length} ≠ ${a.format} ${String(a.data).length}`);
      else same++;
    }
    tot.acis += n; tot.same += same;
    const srcLightN = Object.keys(srcLights).length;
    if (Object.keys(backLights).length !== srcLightN) fail(`${tag}: ${Object.keys(backLights).length} lights read back, source has ${srcLightN}`);
    // 2. ODA: DXF in the same version, audit on
    const o = await odaConvert(file, TAG_TO_ODA[v], 'DXF', path.join(OUT, 'oda'), { stem: tag });
    if (o.err.length) fail(`${tag}: ODA .err: ${o.err.slice(0, 3).join(' | ')}`);
    if (!o.out) { fail(`${tag}: ODA wrote no DXF`); return; }
    tot.oda++;
    // the converter's DXF of the source in this version (cached)
    const sd = path.join(SRCDXF, `${inp.tag}-${v}.dxf`);
    if (!fs.existsSync(sd)) { const so = await odaConvert(inp.dwg, TAG_TO_ODA[v], 'DXF', SRCDXF, { stem: `${inp.tag}-${v}` }); if (!so.out) fail(`${tag}: ODA cannot convert the source`); }
    const mj = path.join(OUT, tag + '.map.json'), rj = path.join(OUT, tag + '.pair.json');
    fs.writeFileSync(mj, JSON.stringify(map));
    const pr = await runTimed(PYTHON, ['-I', path.join(REPO, 'tools/dwg-test/solids-compare.py'), '--pair', sd, o.out, mj, rj], { timeout: 900000, encoding: 'utf8' });
    if (pr.status !== 0) fail(`${tag}: solids-compare.py --pair: ${pr.stderr.trim().split('\n').slice(-2).join(' | ')}`);
    else {
      const cmp = JSON.parse(fs.readFileSync(rj, 'utf8'));
      let ok = 0;
      for (const [h, r] of Object.entries(cmp.acis)) {
        if (r.sourceError) continue;   // the converter cannot write the source's either
        if (r.missing) fail(`${tag} ${r.type} ${h}: not in the converter's DXF of our file`);
        else if (r.writtenError) fail(`${tag} ${r.type} ${h}→${r.to}: the converter's DXF of our file holds no readable ACIS (${r.writtenError})`);
        else if (r.exact || r.sameTokens) ok++;
        else fail(`${tag} ${r.type} ${h}→${r.to}: ACIS differs from the source's (${r.tokenDiff || r.tokenError || ''}; ${r.format} ${r.size})`);
      }
      if (cmp.extraAcis.length) fail(`${tag}: ACIS entities the source does not have: ${cmp.extraAcis.join(' ')}`);
      let lok = 0;
      const F = ['name', 'type', 'status', 'plotGlyph', 'intensity', 'position', 'target', 'attenuationType', 'useLimits', 'start', 'end', 'hotspot', 'falloff', 'castShadows', 'shadowType', 'mapSize', 'softness', 'color', 'trueColor', 'layer', 'lightColor'];
      for (const [h, r] of Object.entries(cmp.lights)) {
        if (r.missing) fail(`${tag} LIGHT ${h}: not in the converter's DXF of our file`);
        else if (r.diff.length) fail(`${tag} LIGHT ${h}→${r.to}: ${r.diff.map((i) => F[i]).join(', ')} differ from the source's`);
        else lok++;
      }
      if (cmp.extraLights.length) fail(`${tag}: lights the source does not have: ${cmp.extraLights.join(' ')}`);
      tot.odaAcis += ok; tot.lights += lok;
    }
    if (!keep) for (const p of [o.out, o.out + '.err', mj, rj]) fs.rmSync(p, { force: true });
    // 3. LibreDWG / libdxfrw against their baseline on the source
    const b = base.get(inp.tag + v);
    const lr = await libredwgErrors(file);
    // LibreDWG trips on R2013+ ACIS entities of AutoCAD's and the converter's files alike (revision bytes, buffer
    // overflows that follow): a written file passes when it shows no kind of error the source does not show
    if (lr && b.lr) {
      // LibreDWG 0.14 misreads the ACIS entities of R2007+ files (it takes the R2013 data-storage flag's entity data for
      // the inline layout, finds no ASM end mark in version 2 data …) on AutoCAD's and the converter's own files too: the
      // kinds of error that misreading gives depend on the data, so they are allowed; anything else is not
      const ACIS_MISREAD = /(REGION|#DSOLID|3DSOLID|BODY)\.|revision_bytes|bit_read_\w+ buffer overflow|bit_advance_position buffer overflow|unexpected (#|\d)-bit code/;
      const nw = lr.kinds.filter((k) => !b.lr.kinds.includes(k) && !ACIS_MISREAD.test(k));
      if (nw.length || (lr.crashed && !b.lr.crashed)) fail(`${tag}: LibreDWG errors the source does not have: ${nw.join(' | ') || 'exit status'}`);
    }
    const rw = await libdxfrwOk(file);
    if (rw === false && b.rw) fail(`${tag}: libdxfrw cannot convert it (it converts the source)`);
    console.log(`  ${tag.padEnd(34)} ACIS ${same}/${n} read back, ODA ${o.err.length ? '.err' : 'ok'}, LibreDWG ${lr ? lr.n : '-'} (src ${b.lr ? b.lr.n : '-'}), libdxfrw ${rw === null ? '-' : rw ? 'ok' : 'FAIL'}${out.report.notes.filter((x) => /ACIS/.test(x)).map((x) => ' · ' + x).join('')}`);
    if (!keep) fs.rmSync(file, { force: true });
  });
  console.log(`  total: ${tot.files} files, ${tot.same}/${tot.acis} ACIS entities read back identical, ODA opened ${tot.oda}, ${tot.odaAcis} ACIS entities and ${tot.lights} lights in its DXF equal to its DXF of the source`);
  return failsAt();
}
