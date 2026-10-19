/* SPDX-License-Identifier: Apache-2.0 */
/**
 * df1-check.mjs — 0.6 DF.1: CadCraft's reading of fixtures/dwg/df1-ocs-blocks.{dxf,dwg} (made by ezdxf, tools/cadcraft-test/
 * df1-fixture.py; DWGs by the ODA File Converter) against ezdxf's own plan extents in df1-ocs-blocks.truth.json.
 *
 *   node tools/cadcraft-test/df1-check.mjs [--build dev|0.4|0.5] [--verbose]
 *
 * Exports check(load) for bin/test-cadcraft.mjs: → [{ file, case, ok, want, got }].
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FIX = path.join(ROOT, 'fixtures/dwg');
export const FILES = ['df1-ocs-blocks.dxf', 'df1-ocs-blocks.dwg', 'df1-ocs-blocks-r2000.dwg'];

/** Every case of every file: CadCraft's extents of the case's layer vs ezdxf's (tolerance 0.005: ezdxf flattens arcs as Béziers). */
export async function check(load) {
  const truth = JSON.parse(fs.readFileSync(path.join(FIX, 'df1-ocs-blocks.truth.json'), 'utf8'));
  const G = await load('geom.js');
  const { Doc } = await load('doc.js');
  const { readDxf } = await load('dxf.js');
  const { importDwg } = await load('dwg-import.js');
  const { readDwg } = await load('dwg/read.js');
  const out = [];
  for (const f of FILES) {
    const bytes = fs.readFileSync(path.join(FIX, f));
    const data = f.endsWith('.dxf') ? readDxf(bytes.toString('latin1')) : importDwg(readDwg(new Uint8Array(bytes)), { versionTag: 'x' });
    const doc = new Doc(); doc.load(data);
    const ents = [...doc.model.values()];
    for (const [name, want] of Object.entries(truth.cases)) {
      const list = ents.filter((e) => e.layer === 'CASE_' + name);
      const b = G.emptyBounds();
      // text left out, as in the truth (each program measures its own font): a dimension's text box is marked `box`
      for (const e of list) for (const p of e.type === 'text' ? [] : G.prims(e, doc.blocks)) if (!p.box || p.k === 'A') G.primBounds(p, b);
      const got = G.validBounds(b) ? { min: [b.minX, b.minY], max: [b.maxX, b.maxY] } : null;
      const tol = 0.005;   // ezdxf draws arcs as Béziers: within 3e-4 of their radius
      const good = !!got && [0, 1].every((i) => Math.abs(got.min[i] - want.min[i]) <= tol && Math.abs(got.max[i] - want.max[i]) <= tol);
      out.push({ file: f, case: name, ok: good, want, got, n: list.length });
    }
  }
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const i = args.indexOf('--build');
  const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft', i >= 0 ? args[i + 1] : 'dev');
  const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
  const I18n = await load('i18n.js');
  I18n.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const r = await check(load);
  const fmt = (b) => (b ? `(${b.min.map((v) => v.toFixed(3)).join(', ')})–(${b.max.map((v) => v.toFixed(3)).join(', ')})` : 'nothing');
  for (const x of r) if (!x.ok || args.includes('--verbose')) console.log(`${x.ok ? 'ok  ' : 'FAIL'} ${x.file} ${x.case}: want ${fmt(x.want)} got ${fmt(x.got)} [${x.n}]`);
  const bad = r.filter((x) => !x.ok).length;
  console.log(`${r.length - bad}/${r.length} cases match ezdxf`);
  process.exit(bad ? 1 : 0);
}
