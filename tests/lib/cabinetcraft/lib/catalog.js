/* SPDX-License-Identifier: Apache-2.0 */
/**
 * catalog.js — the catalog of parametric cabinet templates (0.8 DC.117, session `cabinetcraft_addon`). DOM-free; imports model.js and core.js.
 * A template is a starting point, never a fixed product: every number is the person's to change after it is picked.
 *
 *   TEMPLATES [{ id, group ('base' | 'wall' | 'tall'), type (model.js TYPES), name (word key 'tpl.<id>'), w: [min, max, step] (mm),
 *                def: { w, h?, d?, shelves?, doors?, drawers?, blind?, overTop? }, blind?, sink?, corner? }]
 *   templateById(id) · listTemplates(group?) · widthsFor(tpl, unit) → the usual widths in the unit (mm steps of 50; inches in 3s)

 *   a template with `turn` ('l' | 'diag' | 'lazy') is a corner cabinet that turns the corner (corner.js)
 *   a template with `curved` is a made-to-order cabinet whose front is an arc, only on a curved wall (angled.js)
 *   resolveEntry(entry, unit) → { turn, tpl, cab (a model.js cabinet before cleaning: type, w, h, d, shelves, doors, hinge, drawers, elev),
 *                                 blind (width of the closed blind part, 0 when none) } | null
 *   rowOf(entry) → 'base' | 'upper'   (a tall cabinet stands on the floor, in the base row)
 */
import { SIZES, RULES, cleanCabinet, rulesFor } from './model.js';
import { num, conv } from './core.js';

export const TEMPLATES = [
  { id: 'base-door', group: 'base', type: 'base', w: [300, 600, 50], def: { w: 600, shelves: 1, doors: 'auto' } },
  { id: 'base-pair', group: 'base', type: 'base', w: [600, 1200, 50], def: { w: 900, shelves: 1, doors: 2 } },
  { id: 'base-sink', group: 'base', type: 'base', w: [600, 1200, 50], sink: true, def: { w: 900, shelves: 0, doors: 'auto' } },
  { id: 'base-drawers2', group: 'base', type: 'drawers', w: [300, 900, 50], def: { w: 600, drawers: 2 } },
  { id: 'base-drawers3', group: 'base', type: 'drawers', w: [300, 900, 50], def: { w: 600, drawers: 3 } },
  { id: 'base-drawers4', group: 'base', type: 'drawers', w: [300, 900, 50], def: { w: 600, drawers: 4 } },
  { id: 'base-blind', group: 'base', type: 'base', w: [900, 1200, 50], corner: true, def: { w: 1050, shelves: 1, doors: 1, blind: 300 } },
  { id: 'wall-door', group: 'wall', type: 'wall', w: [200, 600, 50], def: { w: 600, shelves: 2, doors: 'auto' } },
  { id: 'wall-pair', group: 'wall', type: 'wall', w: [600, 1200, 50], def: { w: 800, shelves: 2, doors: 2 } },
  { id: 'wall-open', group: 'wall', type: 'wall', w: [200, 900, 50], def: { w: 600, shelves: 2, doors: 0 } },
  { id: 'wall-over', group: 'wall', type: 'wall', w: [500, 1200, 50], def: { w: 800, h: 360, shelves: 0, doors: 'auto', overTop: true } },
  { id: 'wall-blind', group: 'wall', type: 'wall', w: [600, 900, 50], corner: true, def: { w: 750, shelves: 2, doors: 1, blind: 250 } },
  // corner cabinets that turn the corner (corner.js): first or last item of a run in a room corner, an arm along each wall
  { id: 'base-corner-l', group: 'base', type: 'base', turn: 'l', w: [800, 1100, 50], def: { w: 900, shelves: 1 } },
  { id: 'base-corner-diag', group: 'base', type: 'base', turn: 'diag', w: [800, 1100, 50], def: { w: 900, shelves: 1 } },
  { id: 'base-corner-lazy', group: 'base', type: 'base', turn: 'lazy', w: [800, 1100, 50], def: { w: 900 } },
  { id: 'wall-corner-l', group: 'wall', type: 'wall', turn: 'l', w: [600, 900, 50], def: { w: 650, shelves: 2 } },
  { id: 'wall-corner-diag', group: 'wall', type: 'wall', turn: 'diag', w: [600, 900, 50], def: { w: 650, shelves: 2 } },
  // a cabinet with a CURVED front on a curved wall, made to order (angled.js stepArc): `w` is its length along the wall (an arc length), not a stock size
  { id: 'base-curved-front', group: 'base', type: 'base', curved: true, w: [300, 1500, 50], def: { w: 900, shelves: 1, doors: 'auto' } },
  { id: 'tall-pantry', group: 'tall', type: 'tall', w: [450, 900, 50], def: { w: 600, shelves: 4, doors: 'auto' } },
  { id: 'tall-broom', group: 'tall', type: 'tall', w: [300, 600, 50], def: { w: 450, shelves: 4, doors: 1 } },
].map((x) => ({ ...x, name: 'tpl.' + x.id }));

const BY_ID = new Map(TEMPLATES.map((x) => [x.id, x]));
export const templateById = (id) => BY_ID.get(String(id)) || null;
export const listTemplates = (group) => (group ? TEMPLATES.filter((x) => x.group === group) : TEMPLATES.slice());
export const rowOf = (entry) => (templateById(entry?.tpl)?.group === 'wall' ? 'upper' : 'base');

export function widthsFor(tpl, unit = 'mm') {
  const [lo, hi, step] = tpl.w;
  const out = [];
  if (unit === 'in') { for (let w = 9; w <= 48; w += 3) if (w * 25.4 >= lo - 15 && w * 25.4 <= hi + 15) out.push(w); }
  else for (let w = lo; w <= hi; w += step) out.push(w);
  return out.length ? out : [conv(tpl.def.w, unit)];
}

export function resolveEntry(entry, unit = 'mm') {
  const tpl = templateById(entry?.tpl);
  if (!tpl) return null;
  const S = SIZES[unit === 'in' ? 'in' : 'mm'][tpl.type];
  const R = rulesFor(unit);
  const d0 = tpl.def;
  const pick = (key, base) => (entry[key] !== undefined && entry[key] !== null && entry[key] !== '' ? entry[key] : d0[key] !== undefined ? (typeof d0[key] === 'number' && ['w', 'h', 'd', 'blind'].includes(key) ? conv(d0[key], unit) : d0[key]) : base);
  const w = num(pick('w', S.w), S.w), h = num(pick('h', S.h), S.h), d = num(pick('d', S.d), S.d);
  const cab = {
    type: tpl.type, w, h, d,
    shelves: num(pick('shelves', undefined), undefined), doors: pick('doors', 'auto'), hinge: entry.hinge === 'right' ? 'right' : 'left',
    drawers: num(pick('drawers', 3), 3),
    elev: tpl.group === 'wall' ? (d0.overTop ? R.wallElev + (SIZES[unit === 'in' ? 'in' : 'mm'].wall.h - h) : R.wallElev) : 0,
  };
  if (Number.isFinite(num(entry.elev, NaN))) cab.elev = num(entry.elev, cab.elev);
  if (cab.shelves === undefined) delete cab.shelves;
  const blind = tpl.corner ? Math.max(0, Math.min(w - conv(150, unit), num(pick('blind', 0), 0))) : 0;
  return { tpl, cab, blind, turn: tpl.turn || null };
}

/** Is this entry's cabinet one the model accepts? (for the editor: a number that makes no cabinet is refused with the reason in checks.js) */
export const valid = (entry, unit) => { const r = resolveEntry(entry, unit); return !!(r && cleanCabinet(r.cab, RULES[unit === 'in' ? 'in' : 'mm'])); };
