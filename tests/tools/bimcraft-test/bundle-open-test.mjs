/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --bundle-open` (0.7 BIM-BUNDLE-OPEN, session bim-07): project bundles are found where people look
 * for files. A folder scan lists …ccbundle.zip and …ccbundle apart from the other files (by name; a plain .zip stays among the
 * rest), and the real sample bundle still opens through openBundle. The browser side is tools/bimcraft-test/browser-bundle.mjs.
 */
import path from 'node:path';
import fs from 'node:fs';

export async function bundleOpenMode({ APP, ROOT }) {
  const FS = await import(path.join(APP, 'folder-scan.js'));
  const BO = await import(path.join(APP, 'bundle-open.js'));
  let bad = 0;
  const ok = (cond, label) => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const f = (p, n = 10) => ({ path: p, file: new File([new Uint8Array(n)], p.split('/').pop()) });

  console.log('== A folder scan finds the bundles');
  ok(FS.isBundleName('FZK-Haus.ccbundle.zip') && FS.isBundleName('x.CCBundle') && FS.isBundleName('a/b/House.ccbundle.ZIP') && !FS.isBundleName('plans.zip') && !FS.isBundleName('ccbundle.txt') && !FS.isBundleName('my.ccbundle.zip.bak'), 'isBundleName: .ccbundle.zip and .ccbundle in any case; not a plain .zip, not a .bak');
  const scan = await FS.scanFolder({ name: 'Job', files: [f('Job/FZK-Haus.ccbundle.zip', 500), f('Job/old/Annex.ccbundle'), f('Job/plans.zip'), f('Job/house.ifc'), f('Job/site.dwg'), f('Job/notes.txt')] });
  ok(scan.bundles.length === 2 && scan.bundles.map((x) => x.path).join() === 'Job/FZK-Haus.ccbundle.zip,Job/old/Annex.ccbundle', 'two bundles listed, sorted by path');
  ok(scan.ifc.length === 1 && scan.cad.length === 1 && scan.other.map((x) => x.path).sort().join() === 'Job/notes.txt,Job/plans.zip', 'the IFC, the drawing and the rest are where they were; plans.zip stays among the others');
  ok(scan.files === 6, 'all six files counted');

  console.log('== The sample bundle still opens');
  const sample = path.join(ROOT, '..', 'testfiles/archicad-bundle/FZK-Haus.ccbundle.zip');
  if (!fs.existsSync(sample)) console.log('  skip no sample at ' + sample + ' (node tools/archicad-bundle/make-sample.mjs makes it)');
  else {
    const buf = fs.readFileSync(sample);
    const b = await BO.openBundle(new Uint8Array(buf));
    ok(b.manifest.views.length === 4 && b.manifest.layouts.length === 2 && b.index.has(b.manifest.model.file), 'FZK-Haus: 4 views, 2 layouts, its model is in the zip');
  }
  console.log(bad ? `\n${bad} FAILED` : '\nall ok');
  return bad ? 1 : 0;
}
