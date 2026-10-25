#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-items.mjs — LibraryCraft material items from the fetched CC0 texture sets (0.7 MT.3, session `materials`): for each set
 * of sets.json, `items/<id>.item.json` (format 1, partial, kind material: the node graph that ModelCraft's shading/texset.js
 * makes from the set's pictures, the pictures by sha256, the tile's real size from Poly Haven's dimensions) and
 * `items/<id>.credit.json` (author(s), CC0, the source page, the attribution line). Small files, kept beside this script; the
 * pictures stay in CC_HOME/refs/cc0-materials (fetch.mjs). Every item is checked with libitem.js validateItem (partial).
 * Deterministic: the same lock.json and sets give the same bytes; `--check` compares without writing.
 *
 *   node tools/library/materials/make-items.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const APP = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev');
const REFS = '/var/www/CADCRAFT/refs/cc0-materials';
const TS = await import(pathToFileURL(path.join(APP, 'shading/texset.js')).href);
const LI = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/apps/bimcraft/dev/libitem.js')).href);
const SETS = JSON.parse(fs.readFileSync(path.join(HERE, 'sets.json'), 'utf8'));
const LOCK = JSON.parse(fs.readFileSync(path.join(HERE, 'lock.json'), 'utf8'));
const OUT = path.join(HERE, 'items');
const check = process.argv.includes('--check');
fs.mkdirSync(OUT, { recursive: true });

const round = (x) => Math.round(x * 1000) / 1000;
let bad = 0, same = 0, wrote = 0;
for (const { id, category } of SETS.sets) {
  const info = JSON.parse(fs.readFileSync(path.join(REFS, id, 'info.json'), 'utf8'));
  const files = Object.keys(LOCK[id] || {}).filter((n) => /\.jpg$/i.test(n));
  const { maps, convention } = TS.pickMaps(files);
  const name = String(info.name || id).slice(0, 120);
  const size = (Array.isArray(info.dimensions) && info.dimensions.length === 2 ? info.dimensions : [1000, 1000]).map((mm) => round(mm / 1000));
  const graph = TS.textureSetGraph(maps, { name, size, convention, key: (role) => 'map:' + role });
  const mapRec = {};
  for (const [role, file] of Object.entries(maps).sort()) {
    const e = LOCK[id][file];
    mapRec[role] = { file, sha256: e.sha256, media: 'image/jpeg', bytes: e.bytes, ...(role === 'normal' ? { convention } : {}) };
  }
  const authors = Object.keys(info.authors || {});
  const item = {
    format: LI.FORMAT, format_version: 1, name, kind: 'material', category,
    description: `${name}: a CC0 texture set from Poly Haven, one tile ${size[0]} × ${size[1]} m (color${maps.roughness ? ', roughness' : ''}${maps.metalness ? ', metalness' : ''}${maps.normal ? ', normal' : ''}${maps.height ? ', height' : ''} pictures).`,
    plan: { layers: [], entities: [] }, body: null, params: {},
    material: { graph: JSON.stringify(graph), maps: mapRec, size },
  };
  const v = LI.validateItem(item, { partial: true });
  if (!v.ok) { console.log('! ' + id + ': ' + v.errors.slice(0, 3).join('; ')); bad++; continue; }
  if (!authors.length) { console.log('! ' + id + ': no author'); bad++; continue; }
  const url = 'https://polyhaven.com/a/' + id;
  const credit = {
    title: name, author: authors.join(', '), authors: info.authors, license: 'CC0-1.0', license_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    library: 'Poly Haven', source_url: url, attribution: `“${name}” by ${authors.join(', ')}, Poly Haven (${url}), CC0 1.0`,
    changes: 'The 1k JPEG pictures as published; wired into a CadCraft node material (shading/texset.js); the preview rendered by CadCraft.',
  };
  for (const [f, obj] of [[id + '.item.json', item], [id + '.credit.json', credit]]) {
    const text = JSON.stringify(obj, null, 1) + '\n', p = path.join(OUT, f);
    if (fs.existsSync(p) && fs.readFileSync(p, 'utf8') === text) { same++; continue; }
    if (check) { console.log('differs ' + f); bad++; continue; }
    fs.writeFileSync(p, text); wrote++;
  }
}
console.log(`material items: ${wrote} written, ${same} unchanged, ${bad} problems`);
process.exit(bad ? 1 : 0);
