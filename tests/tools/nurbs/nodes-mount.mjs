#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * nodes-mount.mjs — the mount of cc-nurbs' solid nodes (lib/nurbs/nodes-solid.js, 0.9 SU.747c, session `nurbs-s3-09`) into the node
 * editor's library (cc-nodes, lib/nodes: not this session's folder). It is the exact text change, kept as a script so the folder's owner
 * (or `mounts-09`) lands it in one step and the nurbs tests can prove it on a scratch copy first:
 *   types.js    a `solid` port type (isSolid: a cc-nurbs patch set holding one solid), typeOf / brief know it
 *   library.js  SOLID_NODES pushed into LIBRARY before BY_ID is made; category `solid`
 *   words.js    the category's draft es-MX word and the new ports' (en only otherwise: the rest come from the node definitions)
 * After it: `node tools/nodes/sync.mjs modelcraft partcraft supercadcraft`, `node tools/nodes/lang.mjs <app>` for each app, and the host
 * hands the mesh engine over once: `N.nodesSolid.setEngine(manifold)` (without it the Boolean nodes say the engine is missing).
 *
 *   node tools/nurbs/nodes-mount.mjs --to <folder holding types.js, library.js, words.js> [--check]
 *   --check   change nothing; exit 1 when the folder does not have the mount yet
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const EDITS = {
  'types.js': [
    ["export const TYPES = Object.freeze(['number', 'bool', 'text', 'point', 'vector', 'curve', 'surface', 'mesh', 'geometry', 'any']);",
      "export const TYPES = Object.freeze(['number', 'bool', 'text', 'point', 'vector', 'curve', 'surface', 'mesh', 'solid', 'geometry', 'any']);"],
    ["export const isMesh = (v) => !!v && typeof v === 'object' && v.positions instanceof Float64Array && v.indices instanceof Uint32Array;",
      "export const isMesh = (v) => !!v && typeof v === 'object' && v.positions instanceof Float64Array && v.indices instanceof Uint32Array;\n/** A solid (0.9 SU.747c): a cc-nurbs patch set holding exactly one solid (lib/nurbs/nodes-solid.js). */\nexport const isSolid = (v) => !!v && typeof v === 'object' && !Array.isArray(v) && v.format === 'cadcraft-nurbs' && Array.isArray(v.items) && Array.isArray(v.solids) && v.solids.length === 1;"],
    ["  if (isMesh(v)) return 'mesh';\n  return 'unknown';", "  if (isMesh(v)) return 'mesh';\n  if (isSolid(v)) return 'solid';\n  return 'unknown';"],
    ["  if (t === 'mesh') return 'mesh ' + (v.indices.length / 3) + ' triangles';",
      "  if (t === 'mesh') return 'mesh ' + (v.indices.length / 3) + ' triangles';\n  if (t === 'solid') return 'solid ' + v.items.length + ' faces';"],
  ],
  'library.js': [
    ["import { vec, isVec, isCurve, isSurface, isMesh, typeOf, fail } from './types.js';",
      "import { vec, isVec, isCurve, isSurface, isMesh, typeOf, fail } from './types.js';\nimport { SOLID_NODES } from '../nurbs/nodes-solid.js';"],
    ["export const BY_ID = Object.freeze(Object.fromEntries(LIBRARY.map((d) => [d.id, d])));",
      "for (const d of SOLID_NODES) LIBRARY.push(d);   // solids and Booleans (0.9 SU.747c): cc-nurbs' own node definitions\nexport const BY_ID = Object.freeze(Object.fromEntries(LIBRARY.map((d) => [d.id, d])));"],
    ["export const CATEGORIES = Object.freeze(['input', 'math', 'list', 'vector', 'curve', 'transform', 'surface']);",
      "export const CATEGORIES = Object.freeze(['input', 'math', 'list', 'vector', 'curve', 'transform', 'surface', 'solid']);"],
  ],
  'words.js': [
    ["transform: 'Transformar', surface: 'Superficies' };", "transform: 'Transformar', surface: 'Superficies', solid: 'Sólidos' };"],
  ],
};

/** Apply (or check) the mount in a folder: → { done: [file], already: [file], missing: [{ file, text }] }. */
export function mount(dir, { check = false } = {}) {
  const out = { done: [], already: [], missing: [] };
  for (const [file, edits] of Object.entries(EDITS)) {
    const p = path.join(dir, file);
    let s = fs.readFileSync(p, 'utf8'), changed = false;
    for (const [a, b] of edits) {
      if (s.includes(b)) continue;
      if (!s.includes(a)) { out.missing.push({ file, text: a.slice(0, 80) }); continue; }
      s = s.replace(a, b); changed = true;
    }
    if (changed) { if (!check) fs.writeFileSync(p, s); out.done.push(file); } else out.already.push(file);
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), check = args.includes('--check'), i = args.indexOf('--to');
  if (i < 0 || !args[i + 1]) { console.error('name the folder: --to <lib/nodes or a copy>'); process.exit(2); }
  const r = mount(path.resolve(args[i + 1]), { check });
  for (const m of r.missing) console.error('not found in ' + m.file + ': ' + m.text);
  console.log((check ? 'would change: ' : 'changed: ') + (r.done.join(', ') || 'nothing') + (r.already.length ? '; already mounted: ' + r.already.join(', ') : ''));
  process.exit(r.missing.length ? 2 : check && r.done.length ? 1 : 0);
}
