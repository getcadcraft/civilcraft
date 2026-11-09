/* SPDX-License-Identifier: Apache-2.0 */
/**
 * fam.mjs — round-4 object families (2026-11-03). One family = one builder plus a list of real size or configuration variants; each variant is one
 * library object. The same definitions make the CSV rows (make-round4.mjs) and the plan and 3D detail (commercial.mjs), so they cannot disagree.
 *
 *   fam({ cat: 'foodservice/cooking',            // a key of LibraryCatalog::CATEGORIES
 *         title: 'Generic conveyor toaster',     // every name starts with "Generic"
 *         desc: (v) => `…`  |  'text',            // says only what build() draws; no marketing, no maker, no model
 *         vs: [ ['two slot, 14 in', 14, 12, 10, 36, { slots: 2 }], … ],   // [label, width in, depth in, height in, z in, params]
 *         build: (a, v) => { … a.log('Added …'); } })
 *   Object name = `${title}, ${label}`  (label may be '' for the title alone).   `a` is an Acc (com-core.mjs); `v` = { label, w, d, h, z, ...params }.
 */
export function fam(spec) { return spec; }

export const GROUP_OF = (cat) => cat.split('/')[0];
export const KIND_OF = { printing: 'equipment', aerospace: 'equipment', agriculture: 'equipment', architecture: 'equipment', automotive: 'equipment', computer: 'equipment', educational: 'equipment', energy: 'equipment', fixtures: 'fixture', hobby: 'equipment', household: 'equipment', industrial: 'equipment', interior: 'equipment', jewellery: 'equipment', fun: 'equipment', machine: 'equipment', marine: 'equipment', military: 'equipment', nature: 'symbol', piping: 'equipment', robotics: 'equipment', speedrun: 'equipment', sport: 'equipment', tech: 'equipment', tools: 'equipment', toys: 'equipment', medical: 'equipment', construction: 'equipment', earthmoving: 'equipment', mining: 'equipment', aviation: 'equipment', foodservice: 'equipment', casework: 'furniture', furniture: 'furniture', plumbing: 'fixture', electrical: 'fixture', mechanical: 'equipment', appliances: 'equipment', site: 'symbol', people: 'symbol', other: 'equipment' };
export const REMARK_OF = (g, cat) => g === 'people' ? "Generic symbol; a scale figure, not a person's measurements."
  : cat === 'site/vehicles' ? 'Generic symbol; a scale shape, not a particular vehicle.'
  : g === 'site' ? "Generic symbol; check the chosen product's spec sheet."
  : "Generic size; check the chosen unit's spec sheet.";

/** Every variant of a family as { name, cat, desc, w, d, h, z, v, fam }. */
export function expand(f) {
  return f.vs.map((row) => {
    const [label, w, d, h, z = 0, params = {}] = row;
    const v = { label, w, d, h, z, ...params };
    const name = label ? `${f.title}, ${label}` : f.title;
    const desc = typeof f.desc === 'function' ? f.desc(v) : f.desc;
    return { name, cat: f.cat, desc, w, d, h, z, v, fam: f };
  });
}
