/* SPDX-License-Identifier: Apache-2.0 */
/**
 * surfaces-check.mjs — the SURFACE family check (SURFACE PLANESURFACE EXTRUDEDSURFACE LOFTEDSURFACE REVOLVEDSURFACE
 * SWEPTSURFACE NURBSURFACE), reader and writer.
 *
 *   node tools/dwg-test/surfaces-check.mjs [--read] [--write] [--keep] [--quick]
 *
 * Inputs: tmp/dwg-surfaces (made by surfaces-fixture.sh: ezdxf surfaces with ACIS as SAT and as SAB → ODA File Converter →
 * DWG in all six versions + the converter's DXF of each in its own version).
 *
 * --read: per surface (by handle), our reader against the converter's DXF (surfaces-compare.py; ezdxf reads the ACIS):
 *   the type, layer, colour, revision GUID, every type-specific field the DXF gives (isolines, matrices, sweep / loft /
 *   revolve options, NURBS fields) and the ACIS data (identical when both carry the same format, else the same tokens);
 *   every surface present, none extra.
 * --write: every input read by us → written in all six versions →
 *   our reader reads it back: every surface with the same type (NURBSURFACE ⇄ SURFACE across R2013 as the converter
 *   saves it), the same fields and the same ACIS data;
 *   the ODA File Converter (audit on) saves it as DXF in the same version: no .err, and that DXF has the same surfaces
 *   (type, fields, layer, colour, GUID, ACIS data) as the converter's DXF of the source saved in that version;
 *   LibreDWG dwgread and libdxfrw dwg2dxf: no kind of error they do not show on the converter's own DWG of the same
 *   fixture in that version, apart from the LibreDWG ACIS-misread kinds solids-check allows (same rule; see ACIS_MISREAD).
 *   libdxfrw's dwg2dxf fails on every DWG holding a surface class, the converter's own included (a drawing of one line
 *   or of solids converts), so for these fixtures it can only show that it fails no worse.
 * Default: both. --quick: only the AC1032 inputs (written in all six versions).
 */
import fs from 'node:fs';
import path from 'node:path';
import { readDwg } from '../../lib/dwg/read.js';
import { writeDwg } from '../../lib/dwg/write.js';
import { SURFACE_TYPES, SURFACE_LAYOUTS } from '../../lib/dwg/surface-layout.js';
import { REPO, PYTHON, READERS, TAGS, TAG_TO_ODA, mkdirp, runTimed, odaConvert, flag, pool } from './lib/util.mjs';

const HERE = path.join(REPO, 'tools/dwg-test');
const FIX = path.join(REPO, 'tmp/dwg-surfaces');
const WORK = mkdirp(path.join(FIX, 'check'));
const OUT = mkdirp(path.join(FIX, 'written'));
const SRCDXF = mkdirp(path.join(FIX, 'source-dxf'));
const LR = path.join(READERS, 'libredwg/bin/dwgread');
const DXFRW = path.join(READERS, 'libdxfrw/dwg2dxf');
const doRead = flag('--read') || !flag('--write');
const doWrite = flag('--write') || !flag('--read');
const TYPES = new Set(SURFACE_TYPES);
const VNUM = { AC1015: 15, AC1018: 18, AC1021: 21, AC1024: 24, AC1027: 27, AC1032: 32 };
let failures = 0;
const fail = (m) => { failures++; console.log('  FAIL ' + m); };

/** Every surface of a model by handle (blocks included). */
function collect(model) {
  const out = {};
  for (const b of model.blocks || []) for (const e of b.entities || []) if (TYPES.has(e.type)) out[e.handle] = e;
  return out;
}
const near = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
function same(a, b) {
  if (a === undefined || a === null) return b === undefined || b === null || b === false;
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((x, i) => same(x, b[i]));
  if (typeof a === 'object') return !!b && typeof b === 'object' && Object.keys({ ...a, ...b }).every((k) => same(a[k], b[k]));
  if (typeof a === 'number' && typeof b === 'number') return near(a, b);
  if (typeof a === 'boolean' || typeof b === 'boolean') return !!a === !!b;
  return a === b;
}
const show = (v) => (typeof v === 'object' ? JSON.stringify(v) : String(v)).slice(0, 120);
/** The model fields of a surface type (the layout's names + isolines). */
const fieldNames = (t) => ['uIsolines', 'vIsolines', ...(SURFACE_LAYOUTS[t] || []).map(([n]) => n)];

function inputs() {
  const list = [];
  for (const s of ['sat', 'sab']) for (const v of TAGS) {
    const dwg = path.join(FIX, 'dwg', `${s}-${v}.dwg`), truth = path.join(FIX, 'truth', `${s}-${v}.dxf`);
    if (fs.existsSync(dwg) && fs.existsSync(truth)) list.push({ tag: `${s}-${v}`, s, v, dwg, truth });
  }
  return list;
}

async function py(args) {
  const r = await runTimed(PYTHON, ['-I', path.join(HERE, 'surfaces-compare.py'), ...args], { timeout: 900000, encoding: 'utf8' });
  if (r.status !== 0) throw new Error('surfaces-compare.py: ' + r.stderr.trim().split('\n').slice(-2).join(' | '));
}

// ---------------------------------------------------------------- reader
async function readCheck(list) {
  console.log('== reader: every surface field and its ACIS data against the ODA File Converter\'s DXF');
  const tot = { surfaces: 0, ok: 0, fields: 0, acisExact: 0, acisTokens: 0 };
  const perType = {};
  await pool(list, 4, async (inp) => {
    const m = readDwg(fs.readFileSync(inp.dwg));
    const ours = collect(m);
    const oj = path.join(WORK, inp.tag + '.ours.json'), rj = path.join(WORK, inp.tag + '.cmp.json');
    fs.writeFileSync(oj, JSON.stringify(Object.fromEntries(Object.entries(ours).map(([h, e]) => [h, { type: e.type, acis: e.acis }]))));
    try { await py([inp.truth, oj, rj]); } catch (e) { fail(`${inp.tag}: ${e.message}`); return; }
    const cmp = JSON.parse(fs.readFileSync(rj, 'utf8'));
    let n = 0, ok = 0, nf = 0;
    for (const [h, t] of Object.entries(cmp)) {
      n++;
      const o = ours[h];
      const k = `${inp.v} ${t.type}`;
      perType[k] = perType[k] || { n: 0, ok: 0 };
      perType[k].n++;
      if (!o) { fail(`${inp.tag} ${t.type} ${h}: not read`); continue; }
      const bad = [];
      if (o.type !== t.type) bad.push(`type ${o.type} ≠ ${t.type}`);
      if (t.layer !== undefined && o.layer !== t.layer) bad.push(`layer ${o.layer} ≠ ${t.layer}`);
      if ((t.color ?? 256) !== (o.color?.index ?? -1)) bad.push(`color ${show(o.color)} ≠ ${t.color ?? 256}`);
      if (t.guid !== undefined) {
        if (String(o.revisionGuid || '').toLowerCase() !== t.guid) bad.push(`GUID ${o.revisionGuid} ≠ ${t.guid}`);
        if (!!o.hasRevisionGuid !== !!t.hasGuid) bad.push(`GUID flag ${o.hasRevisionGuid} ≠ ${t.hasGuid}`);
      }
      for (const [f, v] of Object.entries(t.fields)) { nf++; if (!same(v, o[f])) bad.push(`${f} ${show(o[f])} ≠ ${show(v)}`); }
      // a field the model has that the DXF does not give (the loft's embedded-data counts …) must be at its default
      for (const f of fieldNames(o.type)) if (!(f in t.fields) && o[f] !== undefined && o[f] !== null && o[f] !== false) bad.push(`${f} ${show(o[f])} (not in the DXF) is set`);
      if (t.truthError) bad.push('truth ACIS unreadable: ' + t.truthError);
      else if (!t.acisFormat) bad.push('no ACIS data read');
      else if (t.exact) tot.acisExact++;
      else if (t.sameTokens) tot.acisTokens++;
      else bad.push(`ACIS ${t.acisFormat.join('/')} differs: ${t.tokenDiff || t.tokenError || ''}`);
      if (bad.length) fail(`${inp.tag} ${t.type} ${h}: ${bad.join('; ')}`);
      else { ok++; perType[k].ok++; }
    }
    const extra = Object.keys(ours).filter((h) => !cmp[h]);
    if (extra.length) fail(`${inp.tag}: surfaces the converter's DXF does not have: ${extra.join(' ')}`);
    tot.surfaces += n; tot.ok += ok; tot.fields += nf;
    console.log(`  ${inp.tag.padEnd(12)} surfaces ${ok}/${n} equal (${nf} fields)`);
  });
  console.log(`  total: ${tot.ok}/${tot.surfaces} surfaces equal in every field (${tot.fields} fields); ACIS identical ${tot.acisExact}, same tokens ${tot.acisTokens}`);
  const byType = {};
  for (const [k, x] of Object.entries(perType)) { const [v, t] = k.split(' '); (byType[t] = byType[t] || {})[v] = `${x.ok}/${x.n}`; }
  for (const [t, vs] of Object.entries(byType)) console.log(`    ${t.padEnd(16)} ${TAGS.map((v) => `${v} ${vs[v] || '-'}`).join('  ')}`);
}

// ---------------------------------------------------------------- writer
async function libredwgErrors(file) {
  if (!fs.existsSync(LR)) return null;
  const r = await runTimed(LR, ['-v2', file], { timeout: 300000 });
  const errs = r.stderr.split('\n').filter((l) => /^ERROR/i.test(l.trim()));
  const kinds = [...new Set(errs.map((l) => l.trim().replace(/-?\d+/g, '#')))];
  return { n: errs.length + (r.status !== 0 ? 1 : 0), kinds, crashed: r.status !== 0 };
}
async function libdxfrwOk(file) {
  if (!fs.existsSync(DXFRW)) return null;
  const dxf = file + '.dxfrw.dxf';
  const r = await runTimed(DXFRW, [file, '-y', '-v2000', dxf], { timeout: 300000, encoding: 'utf8' });
  const ok = /Success/.test(r.stdout) && fs.existsSync(dxf);
  fs.rmSync(dxf, { force: true });
  return ok;
}
// solids-check's rule (solids-write-check.mjs): LibreDWG 0.14 misreads ACIS entity data of R2007+ files — AutoCAD's and the
// converter's too — and the kinds of error that gives depend on the data. The same expression, with the one surface class
// LibreDWG decodes added to its entity list: PLANESURFACE (it leaves the others undecoded). Its misread shows on the
// converter's own files as well ("Invalid PLANESURFACE.materials x 216" on tmp/dwg-surfaces/dwg/sab-AC1027.dwg) and the
// field it names moves with the data (materials, silhouettes, wires), as for the solids; nothing else is allowed.
const ACIS_MISREAD = /(REGION|#DSOLID|3DSOLID|BODY|PLANESURFACE)\.|revision_bytes|bit_read_\w+ buffer overflow|bit_advance_position buffer overflow|unexpected (#|\d)-bit code/;

/** The type a surface has once written in `v` (the converter's save-down / save-up of NURBSURFACE). */
function typeIn(e, v) {
  if (e.type === 'NURBSURFACE' && VNUM[v] < 27) return 'SURFACE';
  if (e.type === 'SURFACE' && e.savedDownFrom === 'NURBSURFACE' && VNUM[v] >= 27) return 'NURBSURFACE';
  return e.type;
}

async function writeCheck(list, { keep = false, quick = false } = {}) {
  console.log('== writer: every input written in all six versions → our reader, ODA (audit), LibreDWG, libdxfrw');
  const inputs = quick ? list.filter((x) => x.v === 'AC1032') : list;
  const base = new Map();
  const peer = (inp, v) => { const f = path.join(FIX, 'dwg', `${inp.s}-${v}.dwg`); return fs.existsSync(f) ? f : inp.dwg; };
  const bjobs = [];
  for (const s of new Set(inputs.map((x) => x.s))) for (const v of TAGS) bjobs.push({ s, v });
  await pool(bjobs, 6, async ({ s, v }) => { const f = peer({ s, dwg: '' }, v); base.set(s + v, { lr: await libredwgErrors(f), rw: await libdxfrwOk(f) }); });
  const jobs = [];
  for (const inp of inputs) for (const v of TAGS) jobs.push({ inp, v });
  const tot = { files: 0, surfaces: 0, back: 0, oda: 0, odaSame: 0 };
  const perType = {};
  await pool(jobs, 6, async ({ inp, v }) => {
    const tag = `${inp.tag}-to-${v}`;
    const src = readDwg(fs.readFileSync(inp.dwg));
    const srcS = collect(src);
    let out;
    try { out = writeDwg(src, { version: v }); } catch (e) { fail(`${tag}: writer threw ${e.message}`); return; }
    const file = path.join(OUT, tag + '.dwg');
    fs.writeFileSync(file, out.bytes);
    tot.files++;
    const map = out.report.handles || {};
    // 1. our reader
    const back = collect(readDwg(out.bytes));
    let same1 = 0;
    for (const [h, e] of Object.entries(srcS)) {
      tot.surfaces++;
      const b = back[map[h]];
      if (!b) { fail(`${tag} ${e.type} ${h}: not in the written file`); continue; }
      const want = typeIn(e, v), bad = [];
      if (b.type !== want) bad.push(`type ${b.type} ≠ ${want}`);
      if (b.acis?.format !== e.acis?.format || b.acis?.data !== e.acis?.data) bad.push(`ACIS ${b.acis?.format} ${String(b.acis?.data).length} ≠ ${e.acis?.format} ${String(e.acis?.data).length}`);
      if (want === e.type) for (const f of fieldNames(e.type)) if (!same(e[f], b[f])) bad.push(`${f} ${show(b[f])} ≠ ${show(e[f])}`);
      if (want === e.type && !!e.hasRevisionGuid && String(e.revisionGuid).toLowerCase() !== String(b.revisionGuid).toLowerCase()) bad.push(`GUID ${b.revisionGuid} ≠ ${e.revisionGuid}`);
      if (bad.length) fail(`${tag} ${e.type} ${h}→${map[h]}: reads back ${bad.join('; ')}`); else same1++;
    }
    tot.back += same1;
    // 2. ODA: DXF in the same version (audit on), against its DXF of the source saved in that version
    const o = await odaConvert(file, TAG_TO_ODA[v], 'DXF', path.join(OUT, 'oda'), { stem: tag });
    if (o.err.length) fail(`${tag}: ODA .err: ${o.err.slice(0, 3).join(' | ')}`);
    let odaOk = 0;
    if (!o.out) fail(`${tag}: ODA wrote no DXF`);
    else {
      tot.oda++;
      const sd = path.join(SRCDXF, `${inp.tag}-${v}.dxf`);
      if (!fs.existsSync(sd)) { const so = await odaConvert(inp.dwg, TAG_TO_ODA[v], 'DXF', SRCDXF, { stem: `${inp.tag}-${v}` }); if (!so.out) fail(`${tag}: ODA cannot convert the source`); }
      const mj = path.join(OUT, tag + '.map.json'), rj = path.join(OUT, tag + '.pair.json');
      fs.writeFileSync(mj, JSON.stringify(map));
      try {
        await py(['--pair', sd, o.out, mj, rj]);
        const cmp = JSON.parse(fs.readFileSync(rj, 'utf8'));
        for (const [h, r] of Object.entries(cmp.surfaces)) {
          const e = srcS[h];
          const k = `${v} ${r.type}`;
          perType[k] = perType[k] || { n: 0, ok: 0 };
          perType[k].n++;
          // the converter gives a NURBS surface it restores from a save-down a new random GUID each time
          const fresh = e && typeIn(e, v) !== e.type && typeIn(e, v) === 'NURBSURFACE';
          const diff = (r.diff || []).filter(([f]) => !(fresh && (f === 'guid' || f === 'hasGuid')));
          if (r.missing) fail(`${tag} ${r.type} ${h}: not in the converter's DXF of our file`);
          else if (r.writtenType !== r.type) fail(`${tag} ${r.type} ${h}→${r.to}: the converter reads it as ${r.writtenType}`);
          else if (diff.length) fail(`${tag} ${r.type} ${h}→${r.to}: ${diff.map(([f, a, b]) => `${f} ${show(b)} ≠ ${show(a)}`).join('; ')}`);
          else if (r.sourceError) fail(`${tag} ${r.type} ${h}: source ACIS unreadable (${r.sourceError})`);
          else if (r.writtenError) fail(`${tag} ${r.type} ${h}→${r.to}: no readable ACIS in the converter's DXF of our file (${r.writtenError})`);
          else if (!r.exact && !r.sameTokens) fail(`${tag} ${r.type} ${h}→${r.to}: ACIS differs (${r.tokenDiff || r.tokenError || ''}; ${r.format})`);
          else { odaOk++; perType[k].ok++; }
        }
        if (cmp.extra.length) fail(`${tag}: surfaces the source does not have: ${cmp.extra.join(' ')}`);
      } catch (e) { fail(`${tag}: ${e.message}`); }
      if (!keep) for (const p of [o.out, o.out + '.err', mj, rj]) fs.rmSync(p, { force: true });
    }
    tot.odaSame += odaOk;
    // 3. LibreDWG / libdxfrw against their baseline on the converter's own DWG of the fixture in this version
    const b = base.get(inp.s + v);
    const lr = await libredwgErrors(file);
    let lrNew = [];
    if (lr && b.lr) {
      lrNew = lr.kinds.filter((k) => !b.lr.kinds.includes(k) && !ACIS_MISREAD.test(k));
      if (lrNew.length || (lr.crashed && !b.lr.crashed)) fail(`${tag}: LibreDWG errors the converter's own file does not have: ${lrNew.join(' | ') || 'exit status'}`);
    }
    const rw = await libdxfrwOk(file);
    if (rw === false && b.rw) fail(`${tag}: libdxfrw cannot convert it (it converts the converter's own file)`);
    console.log(`  ${tag.padEnd(22)} read back ${same1}/${Object.keys(srcS).length}, ODA ${o.err.length ? '.err' : 'ok'} ${odaOk}/${Object.keys(srcS).length} same, LibreDWG ${lr ? lr.n : '-'} (own ${b.lr ? b.lr.n : '-'}), libdxfrw ${rw === null ? '-' : rw ? 'ok' : b.rw ? 'FAIL' : 'fails (as on the converter\'s own file)'}`);
    if (!keep) fs.rmSync(file, { force: true });
  });
  console.log(`  total: ${tot.files} files; ${tot.back}/${tot.surfaces} surfaces read back equal; ODA opened ${tot.oda}, ${tot.odaSame} surfaces in its DXF equal to its DXF of the source`);
  const byType = {};
  for (const [k, x] of Object.entries(perType)) { const [v, t] = k.split(' '); (byType[t] = byType[t] || {})[v] = `${x.ok}/${x.n}`; }
  for (const [t, vs] of Object.entries(byType)) console.log(`    ${t.padEnd(16)} ${TAGS.map((v) => `${v} ${vs[v] || '-'}`).join('  ')}`);
}

async function main() {
  const list = inputs();
  if (!list.length) { console.log('No inputs: run tools/dwg-test/surfaces-fixture.sh first.'); process.exit(1); }
  if (doRead) await readCheck(list);
  if (doWrite) await writeCheck(list, { keep: flag('--keep'), quick: flag('--quick') });
  console.log(failures ? `${failures} failure(s)` : 'all surface checks passed');
  process.exit(failures ? 1 : 0);
}
main();
