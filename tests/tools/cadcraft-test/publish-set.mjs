/* SPDX-License-Identifier: Apache-2.0 */
/**
 * publish-set.mjs — publishing a sheet set to DWG (0.8 SU.912 step 6, publish-set.js), run by classes.mjs: the Clinic fixture
 * set (tools/cadcraft-test/fixtures/sheetset, read-only) → one DWG per sheet holding the model and that sheet only, title blocks
 * filled in the copy, the PDF beside it on request, a manifest, the zip for the web and a folder for Studio (a temp folder in the
 * scratch space, removed at the end).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FX = path.join(ROOT, 'tools/cadcraft-test/fixtures/sheetset');

export default async function run({ ok, section, imp }) {
  section('publish a sheet set to DWG (publish-set.js)');
  const PS = await imp('publish-set.js');
  const SS = await imp('sheetset.js');
  const { readDwg } = await imp('dwg/read.js');
  const { importDwg } = await imp('dwg-import.js');
  const { Doc } = await imp('doc.js');
  const syncRead = async (b) => readDwg(b);
  const before = new Map(fs.readdirSync(FX, { recursive: true }).map((f) => [f, fs.statSync(path.join(FX, f)).mtimeMs]));
  const ro = { name: 'sheetset', read: async (p) => { const f = path.join(FX, p); if (!f.startsWith(FX + path.sep)) throw new Error('outside'); return new Uint8Array(fs.readFileSync(f)); } };
  const set = SS.readSheetSet(fs.readFileSync(path.join(FX, 'Clinic.ccsheets'), 'utf8')).set;
  const sheets = SS.allSheets(set);
  const r = await PS.publishSetDwg(set, ro, { readDwg: syncRead, version: '2013', made: new Date('2026-10-27T12:00:00Z') });
  const dwgs = r.files.filter((f) => f.path.endsWith('.dwg'));
  ok(dwgs.length === sheets.length && r.report.sheets === sheets.length && !r.report.missing.length, 'one DWG per sheet (' + sheets.length + ')', r.files.map((f) => f.path).join(' | '));
  ok(dwgs[0].path === 'A-101 Level 1 floor plan.dwg', 'named by number and title', dwgs[0].path);
  ok(r.files.some((f) => f.path === 'publish.json') && !r.files.some((f) => f.path.endsWith('.pdf')), 'a manifest; no PDF unless asked');
  ok(r.manifest.format === 'cadcraft-publish' && r.manifest.dwgVersion === '2013' && r.manifest.sheets.every((s) => /^[0-9a-f]{64}$/.test(s.sha256) && s.bytes > 0) && r.manifest.made === '2026-10-27T12:00:00.000Z', 'the manifest lists each file with its size and SHA-256');
  let good = 0, tbOk = 0;
  for (const [i, f] of dwgs.entries()) {
    const sh = sheets[i].sheet;
    const tag = new TextDecoder().decode(f.bytes.subarray(0, 6));
    const d = new Doc(); d.load(importDwg(readDwg(f.bytes), { versionTag: tag }));
    if (tag === 'AC1027' && d.layouts.length === 1 && d.layouts[0].name === sh.layout && d.model.size > 0) good++;
    const vals = [...d.layouts[0].entities.values()].filter((e) => e.type === 'insert' && e.attrs).flatMap((e) => Object.values(e.attrs));
    if (vals.includes(sh.number)) tbOk++;
  }
  ok(good === dwgs.length, 'each DWG (2013) opens with the model and only its own sheet', good + '/' + dwgs.length);
  ok(tbOk >= 1, 'title blocks carry the sheet number from the set in the published copy', tbOk + ' of ' + dwgs.length);
  const after = new Map(fs.readdirSync(FX, { recursive: true }).map((f) => [f, fs.statSync(path.join(FX, f)).mtimeMs]));
  ok(JSON.stringify([...before]) === JSON.stringify([...after]), 'the source drawings are not changed');
  // DWG + PDF, a subset
  const both = await PS.publishSetDwg(set, ro, { readDwg: syncRead, subset: 'plans', pdf: true });
  const pdf = both.files.find((f) => f.path.endsWith('.pdf'));
  ok(pdf && new TextDecoder('latin1').decode(pdf.bytes.subarray(0, 5)) === '%PDF-' && both.manifest.pdf === pdf.path && both.report.pdfPages === both.report.sheets, 'DWG + PDF: the PDF beside the DWGs, a page per sheet', both.report.pdfPages + ' pages, ' + both.report.sheets + ' sheets');
  ok(both.report.sheets === SS.allSheets(set).filter((x) => x.path.some((g) => g.id === 'plans')).length, 'a subset publishes only its sheets');
  // a missing file and a missing sheet are reported, the rest still goes
  const broken = SS.updateSheet(SS.updateSheet(set, 'p2', { file: 'gone.dwg' }), 'p1', { layout: 'Nope' });
  const mr = await PS.publishSetDwg(broken, ro, { readDwg: syncRead });
  ok(mr.report.missing.length === 2 && mr.report.sheets === sheets.length - 2 && mr.report.notes.map((n) => n.key).sort().join() === 'nofile,nolayout', 'a missing file or sheet is reported, the others published', JSON.stringify(mr.report.notes.map((n) => n.key)));
  // names: unsafe characters, duplicates
  ok(PS.safeName('A/1: "x"?') === 'A-1- -x-' && PS.publishedDir({ name: 'Riverside: Clinic' }, 'Plans') === 'Riverside- Clinic - published - Plans', 'file names lose characters a file system refuses');
  const dup = SS.updateSheet(set, 'p2', { number: 'A-101', title: 'Level 1 floor plan' });
  const dr = await PS.publishSetDwg(dup, ro, { readDwg: syncRead, ids: ['p1', 'p2'] });
  ok(dr.files.filter((f) => f.path.endsWith('.dwg')).map((f) => f.path).join('|') === 'A-101 Level 1 floor plan.dwg|A-101 Level 1 floor plan (2).dwg', 'two sheets with the same name get distinct files');
  // Studio: a folder; the web: a zip
  const tmp = fs.mkdtempSync(path.join(process.env.CC_SCRATCH || os.tmpdir(), 'cc-publish-'));
  try {
    const out = { name: 'out', write: async (p, data) => { const f = path.join(tmp, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, Buffer.from(data)); } };
    const dir = PS.publishedDir(set);
    const n = await PS.writePublished(r, out, dir);
    ok(n === r.files.length && fs.readdirSync(path.join(tmp, dir)).length === r.files.length && JSON.parse(fs.readFileSync(path.join(tmp, dir, 'publish.json'), 'utf8')).sheets.length === sheets.length, 'Studio: every file in "<set> - published/"');
    const z = await PS.zipPublished(r, dir);
    const { unzip } = await imp('sheetset-archive.js');
    const back = await unzip(z);
    const names = (Array.isArray(back) ? back : back.entries || []).map((e) => e.name);
    ok(names.length === r.files.length && names.every((x) => x.startsWith(dir + '/')), 'the web: one zip with the same files', names.slice(0, 3).join(' | '));
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}
