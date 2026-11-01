#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * merge.mjs — `cadcraft merge <base> <ours> <theirs>` for git, Fossil and Mercurial (0.8 DC.27, first cut: the JSON project files).
 *
 *   node tools/cli/merge.mjs <base> <ours> <theirs> [--out <file>] [--report <file>] [--no-validate]
 *
 * Writes the merged file over <ours> (git's %A) unless --out is given; prints a report; exit 0 = merged cleanly, 1 = conflicts (the file
 * is still written with your side kept where the two differ, and the report lists both), 2 = it could not run (not JSON, different formats).
 * After merging, the app's own reader opens the result (--no-validate skips it); a file its reader refuses is a conflict too.
 *
 * MarkupCraft PDFs merge too, markup by markup (tools/cli/merge/pdf-merge.mjs; each markup is matched by its name /NM):
 *   *.pdf merge=cadcraft
 * CadCraft drawings (.dwg, .dxf) merge too, object by object (tools/cli/merge/cad-merge.mjs; objects are matched by the stable key each one carries):
 *   *.dwg merge=cadcraft    *.dxf merge=cadcraft
 *
 * git:  .gitattributes   *.takeoff.json merge=cadcraft     git config merge.cadcraft.driver "node /path/to/tools/cli/merge.mjs %O %A %B"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mergeJson } from './merge/json-merge.mjs';
import { mergeCad } from './merge/cad-merge.mjs';
import { mergePdf } from './merge/pdf-merge.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = path.join(ROOT, 'public_html/assets/apps');
const imp = (rel) => import(pathToFileURL(path.join(APPS, rel)).href);

/** Per format: values that change on every save (ours), counters that take the larger number, and the reader that validates a result. */
export const FORMATS = {
  'takeoffcraft-project': { volatile: ['savedAt'], maxKeys: ['seq'], read: async () => { const m = await imp('takeoffcraft/dev/model.js'); return (o) => m.readProject(o); } },
  detailcraft: { volatile: [], maxKeys: ['seq'], read: async () => { const m = await imp('detailcraft/dev/model.js'); return (o) => m.readModel(JSON.stringify(o)); } },
  modelcraft: { volatile: ['view.cam'], maxKeys: ['nextId'], read: async () => { const m = await imp('modelcraft/dev/model.js'); return (o) => new m.Model().load(o); } },
  partcraft: { volatile: [], maxKeys: ['seq'], read: async () => { const m = await imp('partcraft/dev/part.js'); return (o) => m.readPart(JSON.stringify(o)); } },
  'civilcraft-project': { volatile: ['saved'], maxKeys: ['seq'], read: async () => { const { readProject } = await (await import('./merge/civil-load.mjs')).loadCivil(); return (o) => readProject(o); } },
  'markupcraft-markups': { volatile: ['saved'], maxKeys: [], read: async () => { const m = await imp('markupcraft/dev/sidecar.js'); return (o) => { const r = m.readSidecar(o); return r.ok ? r : { ok: false, error: r.why }; }; } },   // 0.8 H5: <name>.markups.json
};

export async function mergeFiles(baseText, oursText, theirsText, { validate = true } = {}) {
  let b, o, t;
  try { b = JSON.parse(baseText); o = JSON.parse(oursText); t = JSON.parse(theirsText); } catch (e) { return { code: 2, error: 'A file is not JSON: ' + e.message }; }
  const fmt = o.format;
  if (o.format !== t.format || (b && b.format && b.format !== o.format)) return { code: 2, error: `The files are not the same format (${b?.format} / ${o.format} / ${t.format}).` };
  const spec = FORMATS[fmt] || { volatile: [], maxKeys: [] };
  const r = mergeJson(b, o, t, spec);
  if (typeof o.version === 'number' && typeof t.version === 'number' && (!(r.merged.version >= Math.max(o.version, t.version)))) r.merged.version = Math.max(o.version, t.version);   // never a lower version than either side wrote
  if (validate && spec.read) {
    try {
      const read = await spec.read();
      const res = read(r.merged);
      if (res && res.ok === false) r.conflicts.push({ path: '(whole file)', kind: 'invalid', ours: null, theirs: null, base: null, why: String(res.error) });
    } catch (e) {
      if (/Cannot find package|ERR_MODULE_NOT_FOUND/.test(String(e))) r.notes.push('Not validated: this app\'s reader could not be loaded here.');
      else r.conflicts.push({ path: '(whole file)', kind: 'invalid', ours: null, theirs: null, base: null, why: String(e.message || e) });
    }
  }
  return { code: r.conflicts.length ? 1 : 0, merged: r.merged, conflicts: r.conflicts, notes: r.notes, format: fmt };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2);
  const flag = (n) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : null; };
  const files = a.filter((x, i) => !x.startsWith('--') && !['--out', '--report'].includes(a[i - 1]));
  if (files.length !== 3) { console.error('Usage: node tools/cli/merge.mjs <base> <ours> <theirs> [--out f] [--report f] [--no-validate]'); process.exit(2); }
  const [bf, of, tf] = files;
  const isJson = (f) => { const b = fs.readFileSync(f); let i = 0; while (i < b.length && (b[i] === 0x20 || b[i] === 0x0a || b[i] === 0x0d || b[i] === 0x09 || (i === 0 && b[0] === 0xef))) i++; return b[i] === 0x7b || b[i] === 0xbb; };
  if (!isJson(of)) {   // a PDF (MarkupCraft's markups), else a drawing: DWG or DXF
    const bytes = (f) => new Uint8Array(fs.readFileSync(f));
    const isPdf = fs.readFileSync(of).subarray(0, 5).toString('latin1') === '%PDF-';
    const r = isPdf ? await mergePdf(fs.existsSync(bf) ? bytes(bf) : new Uint8Array(), bytes(of), bytes(tf)) : await mergeCad(fs.existsSync(bf) ? bytes(bf) : new Uint8Array(), bytes(of), bytes(tf));
    if (r.code === 2) { console.error(r.error); process.exit(2); }
    fs.writeFileSync(flag('--out') || of, r.bytes);
    const lines = [`${r.format}: ${r.conflicts.length ? r.conflicts.length + ' conflict(s)' : 'merged cleanly'}`, ...r.notes];
    for (const c of r.conflicts) lines.push(`  ${c.kind}  ${c.path}${c.why ? ' — ' + c.why : ''}`);
    if (flag('--report')) fs.writeFileSync(flag('--report'), JSON.stringify({ format: r.format, conflicts: r.conflicts, notes: r.notes }, null, 1) + '\n');
    console.log(lines.join('\n'));
    process.exit(r.code);
  }
  const res = await mergeFiles(fs.readFileSync(bf, 'utf8'), fs.readFileSync(of, 'utf8'), fs.readFileSync(tf, 'utf8'), { validate: !a.includes('--no-validate') });
  if (res.code === 2) { console.error(res.error); process.exit(2); }
  fs.writeFileSync(flag('--out') || of, JSON.stringify(res.merged, null, 1) + '\n');
  const lines = [`${res.format}: ${res.conflicts.length ? res.conflicts.length + ' conflict(s)' : 'merged cleanly'}`, ...res.notes];
  for (const c of res.conflicts) lines.push(`  ${c.kind}  ${c.path}${c.why ? ' — ' + c.why : ''}`);
  if (flag('--report')) fs.writeFileSync(flag('--report'), JSON.stringify({ format: res.format, conflicts: res.conflicts, notes: res.notes }, null, 1) + '\n');
  console.log(lines.join('\n'));
  process.exit(res.code);
}
