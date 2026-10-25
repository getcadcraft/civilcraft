/* SPDX-License-Identifier: Apache-2.0 */
/**
 * writer-sync.mjs — copy cc-dwg's library files into the apps that ship them (apps cannot import outside their build
 * folder; AppBuilds' import map resolves one subfolder level). Each app gets the import closure of what it uses:
 *   civilcraft/dev/dwg   the writer (write.js, civil.js + what they import)
 *   cadcraft/dev/dwg     the reader and the writer (read.js, read-async.js, write.js + what they import) — it opens and saves DWG —
 *                        and dynblock-write.js (an edited visibility parameter, 0.5 DB.9; only CadCraft edits dynamic blocks)
 *   bimcraft/dev/dwg     the reader (read.js, read-async.js + what they import) — it reads DWG, never writes it
 *   modelcraft/dev/dwg   the reader and the writer — it opens DWG and exports it (0.4 part 2 M2)
 *   detailcraft/dev/dwg  the writer only (write.js + what it imports) — it exports DWG, never reads it (D4)
 *   partcraft/dev/dwg    the writer only — the variant pack writes each variant's drawing sheet as DWG (0.7 W3.19, session configurator)
 *   takeoffcraft/dev/dwg the reader (read.js, read-async.js + what they import) — it opens DWG sheets to count from, never writes (0.7 TD.1)
 * Files in a target that the closure no longer needs are removed (reported by --check). bin/test-civilcraft.mjs,
 * bin/test-bimcraft.mjs, bin/test-cadcraft.mjs and bin/test-modelcraft.mjs fail when a copy differs from lib/dwg.
 *
 *   node tools/dwg-test/writer-sync.mjs [--check] [civilcraft|bimcraft|cadcraft|modelcraft|detailcraft|takeoffcraft …]   (no app: all of them)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LIB = path.join(ROOT, 'lib/dwg');

/** lib/dwg files reachable from `entries` through relative static imports / re-exports (and import('./x.js')). */
export function closure(entries) {
  const seen = new Set(), todo = [...entries];
  while (todo.length) {
    const f = todo.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    const src = fs.readFileSync(path.join(LIB, f), 'utf8');
    for (const m of src.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)['"]\.\/([\w.-]+\.js)['"]/g)) todo.push(m[1]);
  }
  return [...seen].sort();
}

export const WRITER_FILES = closure(['write.js', 'civil.js', 'bits-write.js', 'container-write.js']);   // civilcraft/dev/dwg-write.js imports these
export const READER_FILES = closure(['read.js', 'model.js', 'read-async.js']);   // read-async.js: readDwg in a worker (0.4 1.3)
export const READ_WRITE_FILES = closure(['read.js', 'model.js', 'read-async.js', 'write.js']);   // cadcraft/dev/dwg-save.js imports write.js
export const CADCRAFT_FILES = closure(['read.js', 'model.js', 'read-async.js', 'write.js', 'dynblock-write.js']);   // + DB.9's visibility encoder (dyn-blocks.js)
const APPS = 'public_html/assets/apps';
export const TARGETS = {
  [`${APPS}/civilcraft/dev/dwg`]: closure(['write.js', 'civil.js', 'bits-write.js', 'container-write.js', 'read.js', 'model.js', 'read-async.js']),   // + the reader: Linework (civil V1)
  [`${APPS}/bimcraft/dev/dwg`]: READER_FILES,
  [`${APPS}/cadcraft/dev/dwg`]: CADCRAFT_FILES,
  [`${APPS}/modelcraft/dev/dwg`]: READ_WRITE_FILES,
  [`${APPS}/detailcraft/dev/dwg`]: closure(['write.js']),
  [`${APPS}/partcraft/dev/dwg`]: closure(['write.js']),   // 0.7 W3.19: the variant pack's DWG (drawing sheets), writer only
  [`${APPS}/takeoffcraft/dev/dwg`]: READER_FILES,
};

/** Copy (or with `check` only compare) every target, or the targets of `apps`. → number of files that differ. */
export function sync(check, apps = []) {
  let differ = 0;
  for (const [t, files] of Object.entries(TARGETS)) {
    if (apps.length && !apps.includes(t.split('/')[3])) continue;
    const dir = path.join(ROOT, t);
    if (!check) fs.mkdirSync(dir, { recursive: true });
    for (const f of files) {
      const src = fs.readFileSync(path.join(LIB, f));
      const dst = path.join(dir, f);
      const same = fs.existsSync(dst) && Buffer.compare(src, fs.readFileSync(dst)) === 0;
      if (!same) {
        differ++;
        if (check) console.log('differs:', path.join(t, f));
        else { fs.writeFileSync(dst, src); console.log('copied:', path.join(t, f)); }
      }
    }
    for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
      if (!f.endsWith('.js') || files.includes(f)) continue;
      differ++;
      if (check) console.log('not needed:', path.join(t, f));
      else { fs.unlinkSync(path.join(dir, f)); console.log('removed:', path.join(t, f)); }
    }
  }
  return differ;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const differ = sync(check, process.argv.slice(2).filter((a) => !a.startsWith('--')));
  if (check) { console.log(differ ? `${differ} file(s) differ` : 'all copies identical'); process.exit(differ ? 1 : 0); }
}
