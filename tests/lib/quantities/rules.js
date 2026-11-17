// SPDX-License-Identifier: Apache-2.0
/**
 * rules.js — the measuring rules for quantities, written down ONCE (booklet rows BK.11 and BK.84, session bk-quantities-10).
 * Host-free: no imports, no DOM, no units of its own (give it one unit, get the same unit back). BimCraft's schedules, the
 * IFC Qto values BimCraft writes and TakeoffCraft's wall areas and area marks all call these functions, so a quantity is
 * measured one way everywhere. Canonical copy: lib/quantities/; each app carries a byte-identical copy in
 * <app>/dev/quantities/ (node tools/quantities/sync.mjs). Nobody edits a copy.
 *
 * Every measured quantity is three numbers that always add up:  gross - deductions = net.
 *
 *   RULES                       the stated rule per quantity: { id, gross, deductions, net, text } (English; the apps show `text`)
 *   ruleText(id)                one rule as one sentence, '' for an unknown id
 *   measure(gross, deductions)  → { gross, deductions, net }   deductions: a number or a list of numbers
 *   wallSide({ length, height, gross, openings })   one face of a wall: openings [{ id?, width, height } | { id?, area }]
 *   outlineArea(outer, holes)   an area inside an outline with cut-outs (a floor, a ceiling, an area mark): areas in, measure out
 *   finishFaces(layers)         the faces of a wall type that carry a finish: [{ index, mat, materialId, side }]
 *   addMeasures(list)           the sum of several measures (still gross - deductions = net)
 *
 * BK.42 (bk-measure-10): the rules above are the DEFAULT method ("CadCraft default": every opening deducted, lengths on the centre
 * line, reveals not measured). A project may pick another measurement method (methods.js: packs of data, each stating its source).
 * A method reaches these functions as a resolved `rule` (methods.js methodRule): { minArea, inclusive } in the caller's own area
 * unit. No rule = the default, so every caller written before BK.42 measures as it did. RULE_VERSION stays 1: the default did not change.
 *
 *   wallSide({ ..., rule, cut })   rule: openings not above the method's minimum size stay in (not deducted); cut: an area taken
 *                                  off the gross where the wall meets other walls (junctions.js), for methods that measure to the face
 *   outlineArea(outer, holes, rule)   the same minimum size for cut-outs
 *   deducts(area, rule)            does the method deduct an opening of this area?
 *
 * Bricks, blocks and mortar: masonry.js.
 */

export const RULE_VERSION = 1;

const R = (id, gross, deductions, net) => Object.freeze({ id, gross, deductions, net, text: 'Gross: ' + gross + ' Deductions: ' + deductions + ' Net: ' + net });
const NET = 'gross less deductions, never below zero.';

export const RULES = Object.freeze({
  'wall.side': R('wall.side',
    'the area of one face of the wall, its length along the centre line times its height (the real face for a wall with a shaped top or base).',
    'every door, window and other opening in the wall, its width times its height, each opening once.',
    NET),
  'floor': R('floor',
    'the area inside the outline of the floor.',
    'every opening and cut-out inside that outline, each once.',
    NET),
  'finish.wall': R('finish.wall',
    'for each finish layer of the wall type, the gross area of the wall face it covers. A finish is a layer of the wall: it is listed here and is not added to the wall area.',
    'the same openings as the wall, each once per face.',
    NET),
  'finish.ceiling': R('finish.ceiling',
    'the area inside the outline of the ceiling.',
    'every cut-out inside that outline, each once.',
    NET),
});

export function ruleText(id) { return RULES[id]?.text || ''; }

const num = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0);

/** gross and what is taken out of it → the three numbers. Deductions never exceed the gross, so gross - deductions = net always. */
export function measure(gross, deductions = 0) {
  const g = num(gross);
  const d = Array.isArray(deductions) ? deductions.reduce((s, v) => s + num(v), 0) : num(deductions);
  const net = Math.max(0, g - d);
  return { gross: g, deductions: g - net, net };
}

/**
 * One face of a wall. `gross` given (a shaped wall's real face) wins over length × height. An opening is { width, height } or
 * { area }; openings that carry the same `id` are one opening and are deducted once.
 */
export function wallSide({ length = 0, height = 0, gross = null, openings = [], rule = null, cut = 0 } = {}) {
  const seen = new Set(), cuts = [];
  let kept = 0, keptArea = 0;
  for (const o of openings || []) {
    if (!o) continue;
    if (o.id !== undefined && o.id !== null) { if (seen.has(o.id)) continue; seen.add(o.id); }
    const a = o.area !== undefined ? num(o.area) : num(o.width) * num(o.height);
    if (rule && a > 0 && !deducts(a, rule)) { kept++; keptArea += a; continue; }   // BK.42: not above the method's minimum size
    cuts.push(a);
  }
  const g = gross !== null && gross !== undefined ? num(gross) : num(length) * num(height);
  const m = measure(Math.max(0, g - num(cut)), cuts);
  if (!rule && !(cut > 0)) return m;                       // the default: the three numbers, as before BK.42
  return { ...m, junctions: Math.min(g, num(cut)), deducted: cuts.length, notDeducted: kept, notDeductedArea: keptArea };
}

/**
 * BK.42: does the method deduct an opening of this area? rule { minArea, inclusive } in the same area unit; inclusive = an opening
 * of exactly the minimum size is NOT deducted ("not exceeding"). An area within 2 parts in 10 000 of the minimum counts as exactly
 * the minimum, so the two apps (which hand lengths over rounded to 1 part in 10 000) always decide the same way.
 */
export function deducts(area, rule) {
  const min = rule && rule.minArea > 0 ? rule.minArea : 0;
  if (!(min > 0)) return true;
  const eps = min * 2e-4;
  if (Math.abs(area - min) <= eps) return rule.inclusive === false;
  return area > min;
}

/** An outline with cut-outs: the outline's own area and each cut-out's area (numbers, already measured). */
export function outlineArea(outer, holes = [], rule = null) {
  const list = Array.isArray(holes) ? holes : [holes];
  return measure(outer, rule ? list.filter((a) => deducts(num(a), rule)) : list);
}

/**
 * The faces of a wall type that carry a finish, from its layers (exterior side first). A finish layer is a layer whose
 * function is 'finish', that is a material (not a cavity) with a thickness. Its side is the side of the core it lies on.
 */
export function finishFaces(layers) {
  const list = Array.isArray(layers) ? layers : [];
  const cores = list.map((l, i) => (l && l.core ? i : -1)).filter((i) => i >= 0);
  const first = cores.length ? cores[0] : -1, last = cores.length ? cores[cores.length - 1] : -1;
  const out = [];
  list.forEach((l, index) => {
    if (!l || l.function !== 'finish' || l.kind === 'cavity' || !(l.t > 0)) return;
    if (index >= first && index <= last && first >= 0) return;                       // inside the core: not a face finish
    out.push({ index, mat: String(l.mat ?? ''), materialId: l.materialId ?? null, side: first < 0 || index < first ? 'exterior' : 'interior' });
  });
  return out;
}

/** Several measures added up. */
export function addMeasures(list) {
  const o = { gross: 0, deductions: 0, net: 0 };
  for (const m of list || []) { if (!m) continue; o.gross += num(m.gross); o.deductions += num(m.deductions); o.net += num(m.net); }
  return o;
}
