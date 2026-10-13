/* SPDX-License-Identifier: Apache-2.0 */
// reader-container.mjs — print the sections our container reader finds (builder R's check).
import fs from 'node:fs';
import { readContainer } from '../../lib/dwg/container-read.js';
for (const f of process.argv.slice(2)) {
  const t = performance.now();
  try {
    const c = readContainer(new Uint8Array(fs.readFileSync(f)));
    console.log(f.split('/').pop(), c.version, 'maint', c.maintenance, 'cp', c.codepageNum, (performance.now() - t).toFixed(0) + 'ms');
    for (const [k, v] of Object.entries(c.sections)) console.log('   ', k, v ? v.length : v, v ? Buffer.from(v.subarray(0, 16)).toString('hex') : '');
    for (const n of c.notes) console.log('   NOTE', n);
  } catch (e) { console.log(f.split('/').pop(), 'ERROR', e.message); }
}
