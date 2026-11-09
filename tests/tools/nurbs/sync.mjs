#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sync.mjs — lib/nurbs (cc-nurbs, 0.8 SU.747b, session `nurbs`) is canonical; ModelCraft and PartCraft carry byte-identical
 * copies. Run it after every change to lib/nurbs (nobody edits a copy). Same idea as tools/cutlist/sync.mjs.
 *
 *   node tools/nurbs/sync.mjs [--check] [target …]
 *   targets: modelcraft (modelcraft/dev/nurbs/), partcraft (partcraft/dev/nurbs/)
 *   --check   change nothing; exit 1 and list what differs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LIB = path.join(ROOT, 'lib/nurbs');
const APPS = path.join(ROOT, 'public_html/assets/apps');
export const FILES = ['basis.js', 'vec.js', 'curve.js', 'fit.js', 'surface.js', 'construct.js', 'continuity.js', 'match.js', 'analysis.js', 'doc.js', 'step.js', 'iges.js', 'tools.js', 'trim.js', 'solid.js', 'reverse.js', 'blend.js', 'nodes-solid.js', 'cage.js', 'index.js'];
export const TARGETS = {
  modelcraft: { dir: path.join(APPS, 'modelcraft/dev/nurbs'), files: FILES },
  partcraft: { dir: path.join(APPS, 'partcraft/dev/nurbs'), files: FILES },
  supercadcraft: { dir: path.join(APPS, 'supercadcraft/dev/nurbs'), files: FILES },   // 0.8 round 3 (nodes_PART_3): the node editor's geometry in Super
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const names = args.filter((a) => !a.startsWith('--'));
  let diff = 0;
  const libHas = fs.readdirSync(LIB).filter((n) => n.endsWith('.js'));
  const unlisted = libHas.filter((n) => !FILES.includes(n));
  if (unlisted.length) { console.error('lib/nurbs has files the sync does not copy: ' + unlisted.join(', ') + ' (add them to FILES)'); diff++; }
  for (const name of names.length ? names : Object.keys(TARGETS)) {
    const tg = TARGETS[name];
    if (!tg) { console.error(name + ': not a target (' + Object.keys(TARGETS).join(', ') + ')'); diff++; continue; }
    if (!fs.existsSync(path.dirname(tg.dir))) { console.error(name + ': ' + path.dirname(tg.dir) + ' is missing'); diff++; continue; }
    if (!check) fs.mkdirSync(tg.dir, { recursive: true });
    const have = fs.existsSync(tg.dir) ? fs.readdirSync(tg.dir).filter((n) => n.endsWith('.js')) : [];
    const changed = [];
    for (const n of tg.files) {
      const src = fs.readFileSync(path.join(LIB, n));
      const dst = path.join(tg.dir, n);
      if (fs.existsSync(dst) && Buffer.compare(src, fs.readFileSync(dst)) === 0) continue;
      changed.push(n);
      if (!check) fs.writeFileSync(dst, src);
    }
    const stale = have.filter((n) => !tg.files.includes(n));
    for (const n of stale) if (!check) fs.unlinkSync(path.join(tg.dir, n));
    if (changed.length || stale.length) {
      diff++;
      console.log(name + ': ' + (check ? 'differs' : 'updated') + (changed.length ? ' — ' + changed.join(', ') : '') + (stale.length ? (check ? ' — stale: ' : ' — removed: ') + stale.join(', ') : ''));
    } else console.log(name + ': ok (' + tg.files.length + ' files)');
  }
  process.exit(check && diff ? 1 : 0);
}
