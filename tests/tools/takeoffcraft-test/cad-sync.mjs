/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cad-sync.mjs — TakeoffCraft's byte-identical copies of the CAD modules it opens drawings with (0.7 TD.1). No second parser:
 *   dxf-model.js, dxf-decode.js   from cadcraft/dev   (the DXF reader and its code pages)
 *   dwg-compile.js, dwg-dynamic.js from bimcraft/dev  (the drawing model → what a sheet draws; dynamic-block states)
 * The DWG reader itself (dwg/) is lib/dwg through tools/dwg-test/writer-sync.mjs. Only this script writes the copies.
 *
 *   node tools/takeoffcraft-test/cad-sync.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = path.join(ROOT, 'public_html/assets/apps');
export const COPIES = [
  ['cadcraft', 'dxf-model.js'], ['cadcraft', 'dxf-decode.js'],
  ['bimcraft', 'dwg-compile.js'], ['bimcraft', 'dwg-dynamic.js'],
];

/** Copy (or with `check` only compare) every module. → number of files that differ. */
export function sync(check) {
  let differ = 0;
  for (const [app, file] of COPIES) {
    const src = fs.readFileSync(path.join(APPS, app, 'dev', file));
    const dst = path.join(APPS, 'takeoffcraft/dev', file);
    if (fs.existsSync(dst) && Buffer.compare(src, fs.readFileSync(dst)) === 0) continue;
    differ++;
    if (check) console.log('differs:', 'takeoffcraft/dev/' + file, '(from ' + app + ')');
    else { fs.writeFileSync(dst, src); console.log('copied:', 'takeoffcraft/dev/' + file, '(from ' + app + ')'); }
  }
  return differ;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const differ = sync(check);
  if (check) { console.log(differ ? `${differ} file(s) differ` : 'all copies identical'); process.exit(differ ? 1 : 0); }
}
