/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node tools/bimcraft-test/takeoff-sync.mjs [--check]` (0.5 part 4 RC.8; session bim-residential): the TakeoffCraft trade
 * packs' assemblies BimCraft hands over with the model's quantities. Reads the packs (`takeoffcraft/dev/packs/*.ccpack.json`,
 * built by takeoff-packs' build-packs.mjs) and writes `bimcraft/dev/res-takeoff-packs.js` — data only, generated, never edited
 * by hand. MAP below says which pack item each kind of model element takes (by the pack's id and the item's exact name); the
 * metric twin is the item right after it in the pack when that one is metric, else the same item. `--check` fails when the file
 * is not what the packs give now (or a named item is gone). Run it after the packs change.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PACKS = path.join(ROOT, 'public_html/assets/apps/takeoffcraft/dev/packs');
const OUT = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev/res-takeoff-packs.js');

const MAP = {
  'slab.4': ['concrete', 'Slab on grade 4 in, WWR, vapor retarder, 4 in base'],
  'slab.5': ['concrete', 'Slab on grade 5 in, WWR, vapor retarder, 4 in base'],
  'slab.6': ['concrete', 'Slab on grade 6 in, WWR, vapor retarder, 4 in base'],
  'footing.16': ['concrete', 'Continuous footing 16 x 8 in, 2 #4 continuous'],
  'footing.20': ['concrete', 'Continuous footing 20 x 10 in, 2 #4 continuous'],
  'footing.24': ['concrete', 'Continuous footing 24 x 12 in, 2 #4 continuous'],
  'stem.8.4': ['concrete', 'Foundation wall 8 in, 4 ft high, #4 at 48 in vert. / 24 in horiz.'],
  'stem.8.8': ['concrete', 'Foundation wall 8 in, 8 ft high, #4 at 48 in vert. / 24 in horiz.'],
  'stem.10.4': ['concrete', 'Foundation wall 10 in, 4 ft high, #4 at 48 in vert. / 24 in horiz.'],
  'stem.10.8': ['concrete', 'Foundation wall 10 in, 8 ft high, #4 at 48 in vert. / 24 in horiz.'],
  'wall.ext.2x6': ['general-contractor', 'Exterior wall, wood studs 2x6 at 16 in o.c., 7/16 in sheathing, 9 ft'],
  'wall.int.2x4.8': ['drywall-framing', 'Gypsum partition, 1/2 in, one layer each side, wood studs 2x4 at 16 in o.c., 8 ft high'],
  'wall.int.2x4.9': ['drywall-framing', 'Gypsum partition, 1/2 in, one layer each side, wood studs 2x4 at 16 in o.c., 9 ft high'],
  'wall.int.2x4.10': ['drywall-framing', 'Gypsum partition, 1/2 in, one layer each side, wood studs 2x4 at 16 in o.c., 10 ft high'],
  'wall.int.2x4.12': ['drywall-framing', 'Gypsum partition, 1/2 in, one layer each side, wood studs 2x4 at 16 in o.c., 12 ft high'],
  'roof.shingles': ['roofing-residential', 'Asphalt shingles, architectural, synthetic underlayment, drip edge'],
  'roof.ridge': ['roofing-residential', 'Ridge and hip cap with ridge vent'],
  'roof.valley': ['roofing-residential', 'Valley: metal valley flashing over self-adhered underlayment'],
  'roof.eave': ['roofing-residential', 'Ice barrier at eaves, two 3 ft courses'],
  'door.interior': ['finish-carpentry', 'Interior door, prehung, cased both sides'],
  'window.trim': ['finish-carpentry', 'Window trim: casing, stool and apron'],
  'cab.base': ['finish-carpentry', 'Base cabinets with countertop and 4 in backsplash'],
  'cab.wall': ['finish-carpentry', 'Wall cabinets'],
  'el.receptacle': ['electrical', 'Duplex receptacle 20 A, new-work box'],
  'el.switch': ['electrical', 'Single-pole switch, new-work box'],
  'el.switch3': ['electrical', 'Three-way switch, new-work box'],
  'el.dimmer': ['electrical', 'Dimmer switch, new-work box'],
  'el.junction': ['electrical', 'Junction box 4 in square with cover'],
  'el.downlight': ['electrical', 'LED downlight 6 in, new construction'],
  'el.fixture': ['electrical', 'Surface-mounted ceiling fixture'],
  'el.panel': ['electrical', 'Panelboard 42 circuits, surface or flush'],
};
const METRIC = new Set(['m', 'm²', 'm2', 'm³']);
const keep = (it) => ({ name: it.name, type: it.type, unit: it.unit, ...(it.heightFt ? { heightFt: it.heightFt } : {}), ...(it.waste ? { waste: it.waste } : {}), ...(it.csi ? { csi: it.csi } : {}),
  components: (it.components || []).map((c) => ({ name: c.name, unit: c.unit, formula: c.formula, ...(c.waste ? { waste: c.waste } : {}) })) });
const packs = new Map();
const out = {}, problems = [];
for (const [key, [packId, name]] of Object.entries(MAP)) {
  if (!packs.has(packId)) packs.set(packId, JSON.parse(fs.readFileSync(path.join(PACKS, packId + '.ccpack.json'), 'utf8')));
  const p = packs.get(packId);
  const i = p.items.findIndex((x) => x.name === name);
  if (i < 0) { problems.push(key + ': "' + name + '" is not in ' + packId); continue; }
  const it = p.items[i], nx = p.items[i + 1];
  const metric = nx && nx.type === it.type && (METRIC.has(nx.unit) || /metric|\d mm\b/.test(nx.name)) && !METRIC.has(it.unit) ? nx : it;
  out[key] = { pack: p.id, packVersion: p.packVersion || p.version || '', ftin: keep(it), mm: keep(metric) };
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
const text = `/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: trade pack data — the packs' own item and material names, which TakeoffCraft shows as they are */
/**
 * res-takeoff-packs.js — GENERATED by tools/bimcraft-test/takeoff-sync.mjs from TakeoffCraft's trade packs
 * (takeoffcraft/dev/packs; CC0, "starter, not reviewed by an estimator yet", no rates): the assemblies the model's quantities
 * go to TakeoffCraft with (RC.8). Do not edit; run the sync. Each key: { pack, packVersion, ftin: item, mm: item }.
 */
export const PACK_ITEMS = {
${Object.entries(out).map(([k, v]) => '  ' + JSON.stringify(k) + ': ' + JSON.stringify(v)).join(',\n')},
};
`;
if (process.argv.includes('--check')) {
  const have = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (have !== text) { console.error('res-takeoff-packs.js is not what the trade packs give now: run node tools/bimcraft-test/takeoff-sync.mjs'); process.exit(1); }
  console.log('res-takeoff-packs.js matches the trade packs (' + Object.keys(out).length + ' assemblies)');
} else {
  fs.writeFileSync(OUT, text);
  console.log('wrote ' + path.relative(ROOT, OUT) + ' (' + Object.keys(out).length + ' assemblies)');
}
