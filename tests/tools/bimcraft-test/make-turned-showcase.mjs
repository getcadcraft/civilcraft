#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-turned-showcase.mjs — fixtures/showcase/bimcraft-house-turned.ifc, made ONCE from the showcase house
 * (fixtures/showcase/bimcraft-house.ifc): the whole project turned 30° and moved to map-sized coordinates (417 598 m east,
 * 78 717 m north), as a model exported on shared / survey coordinates arrives. Only the site's placement (#19, which
 * every other placement hangs from) changes: four lines are added and #19 points at them. Used by bim-fixes_PART_2's
 * DC.57 repro and tests (a model that "imports at an angle").
 *   node tools/bimcraft-test/make-turned-showcase.mjs [--check]   (skips when the file exists; --check compares it)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc');
const OUT = path.join(REPO, 'fixtures/showcase/bimcraft-house-turned.ifc');
export const TURN_DEG = 30;

export function turnedText(src) {
  const ids = [...src.matchAll(/^#(\d+)=/gm)].map((m) => Number(m[1]));
  let n = Math.max(...ids);
  const r = TURN_DEG * Math.PI / 180;
  const add = [];
  const line = (s) => { add.push('#' + (++n) + '=' + s + ';'); return '#' + n; };
  const o = line('IFCCARTESIANPOINT((417598225.,78717139.,0.))');   // millimetres, as the file
  const z = line('IFCDIRECTION((0.,0.,1.))');
  const x = line(`IFCDIRECTION((${Math.cos(r).toFixed(12)},${Math.sin(r).toFixed(12)},0.))`);
  const a = line(`IFCAXIS2PLACEMENT3D(${o},${z},${x})`);
  if (!/^#19=IFCLOCALPLACEMENT\(\$,#12\);$/m.test(src)) throw new Error('the showcase\'s site placement is not #19=IFCLOCALPLACEMENT($,#12)');
  return src
    .replace(/^#19=IFCLOCALPLACEMENT\(\$,#12\);$/m, `#19=IFCLOCALPLACEMENT($,${a});`)
    .replace("FILE_NAME('Maple Street house.ifc'", "FILE_NAME('Maple Street house (turned).ifc'")
    .replace(/^ENDSEC;\nEND-ISO-10303-21;/m, add.join('\n') + '\nENDSEC;\nEND-ISO-10303-21;');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const want = turnedText(fs.readFileSync(SRC, 'utf8'));
  if (process.argv.includes('--check')) {
    const same = fs.existsSync(OUT) && fs.readFileSync(OUT, 'utf8') === want;
    console.log(same ? 'bimcraft-house-turned.ifc matches' : 'bimcraft-house-turned.ifc differs from the generator');
    process.exit(same ? 0 : 1);
  }
  if (fs.existsSync(OUT)) { console.log('kept ' + path.relative(REPO, OUT) + ' (exists)'); process.exit(0); }
  fs.writeFileSync(OUT, want);
  console.log('wrote ' + path.relative(REPO, OUT) + ' (' + want.length + ' bytes)');
}
