/* SPDX-License-Identifier: Apache-2.0 */
/**
 * commercial.mjs — dispatch for the commercial blocks (the *-3.csv and later municipal/vertical sets, 2026-11-03).
 * `commercialDetail(base)` returns { tris, plan, clear, changelog } for an object listed in one of those CSVs, or null.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expand } from './fam.mjs';
import { Acc } from './com-core.mjs';
import { FOOD } from './com-food.mjs';
import { CASE } from './com-case.mjs';
import { FURN } from './com-furn.mjs';
import { OTHER } from './com-other.mjs';
import { PLUMB, ELEC, MECH } from './com-mep.mjs';
import { SITE, PEOPLE } from './com-site.mjs';
import { APPL } from './com-appl.mjs';
import { CITY } from './com-city.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BLOCKS = path.join(HERE, '..', 'blocks');
const TABLES = [FOOD, CASE, FURN, OTHER, PLUMB, ELEC, MECH, APPL, SITE, PEOPLE, CITY];
const RE_CSV = /-([3-9])\.csv$/;
// Round-4 families (r4-*.mjs): one builder, many variants; looked up by exact object name.
const FAMILY_BY_NAME = new Map();
for (const f of fs.readdirSync(HERE).filter((x) => /^r\d-.+\.mjs$/.test(x) && !/^r\d-(kit|preview)\.mjs$/.test(x)).sort()) {
  try {
    const m = await import(pathToFileURL(path.join(HERE, f)).href);
    for (const fm of m.default || []) for (const r of expand(fm)) FAMILY_BY_NAME.set(r.name, { fam: fm, v: r.v });
  } catch (e) { console.error(`commercial: ${f} skipped: ${String(e.message).split('\n')[0]}`); }
}
export const commercialNames = new Set();
for (const f of fs.readdirSync(BLOCKS)) if (RE_CSV.test(f)) {
  for (const line of fs.readFileSync(path.join(BLOCKS, f), 'utf8').split('\n').slice(1)) { const m = line.match(/^"([^"]+)"/); if (m) commercialNames.add(m[1]); }
}

export function commercialDetail(base) {
  const hit = FAMILY_BY_NAME.get(base.name);
  if (hit) { const a = new Acc(base.body); hit.fam.build(a, hit.v); return a.t.length ? a.out() : null; }
  if (!commercialNames.has(base.name)) return null;
  for (const t of TABLES) for (const [re, fn] of t) {
    if (!re.test(base.name)) continue;
    const a = new Acc(base.body);
    fn(a, base.name);
    if (!a.t.length) continue;
    return a.out();
  }
  return null;
}
