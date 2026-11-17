/* SPDX-License-Identifier: Apache-2.0 */
/**
 * annoscale.js: draw at 1:1, annotate by scale (0.10 BK.10, session bk-r3-scale-10). THE ONE RULE that sizes text, dimensions, tags,
 * room names, grid bubbles and view titles from PAPER heights and says how big they are in the model at a drawing scale. Host-free:
 * no imports, no DOM. Canonical in lib/annoscale/; copied byte for byte into each host's dev/ by `node tools/annoscale/sync.mjs`;
 * never edit a copy. BimCraft (sheets, plan PDF, the plan on screen, plan symbols) and CadCraft (annotative text and dimensions)
 * are the first two hosts.
 *
 * The model is always full size. An annotation has a PAPER height (millimetres on the printed sheet, measured as drafting does:
 * the height of a capital letter). At a drawing scale of 1 : ratio it is `paper height x ratio` tall in the model, so it prints at
 * its paper height at that scale. Change the scale from 1:100 to 1:50 and the same annotation is half as tall in the model and
 * exactly as tall on paper.
 *
 * THE OFFICE STANDARD is data: { format: 'cc-annotation-standard', version: 1, heights: { <kind>: paper mm } }. A kind that is
 * not in `heights` keeps the host's own size (OWN_PT below: the sizes the sheets were drawn with before this rule existed), so an
 * empty standard changes nothing. The numbers in OWN_PT are the app's own, not a drafting standard.
 *
 *   KINDS                               ['text', 'dimension', 'tag', 'room', 'grid', 'title', 'schedule']
 *   OWN_PT                              { kind: font size in points } the host's own sizes
 *   CAP                                 capital height / font size of the sheet font (Helvetica: 0.718)
 *   MIN_MM, MAX_MM                      what a paper height may be (0.5 … 50 mm)
 *   emptyStandard() · cleanStandard(raw) → { standard, ignored: [kind] }      untrusted data in, a clean standard out
 *   isSet(standard, kind) → bool
 *   paperMm(kind, standard) → mm        the paper height in force (the standard's, else the own size as a capital height)
 *   fontPt(kind, standard) → pt         the font size that prints that capital height (exactly OWN_PT when the kind is not set)
 *   factor(kind, standard) → number     fontPt / OWN_PT: what gaps and offsets that belong to the text grow by (1 when not set)
 *   modelOf(paperMm, ratio, unitMm = 1) → drawing units               THE sum: a paper size x ratio, in the host's drawing unit
 *   modelHeight(kind, ratio, standard, unitMm = 1) → drawing units    a kind's paper height x ratio
 *   modelFont(kind, ratio, standard, unitMm = 1) → drawing units      the font size (em) with that capital height
 *   symbolScale(ratio) → model mm per paper mm                          a symbol drawn in paper millimetres, in the model
 *   rescale(size, fromRatio, toRatio) → size                            a model size when its scale changes (rounded to 1e-9)
 *   validRatio(r) → bool                0.01 … 100000 (2:1 enlarged = 0.5)
 *   sameStandard(a, b) → bool
 */
export const FORMAT = 'cc-annotation-standard';
export const VERSION = 1;
export const KINDS = ['text', 'dimension', 'tag', 'room', 'grid', 'title', 'schedule'];
export const OWN_PT = { text: 6, dimension: 6, tag: 6.5, room: 7.5, grid: 6.5, title: 9, schedule: 7 };
export const CAP = 0.718;
export const MIN_MM = 0.5;
export const MAX_MM = 50;
const PT_MM = 25.4 / 72;
const r3 = (v) => Math.round(v * 1000) / 1000;

export const emptyStandard = () => ({ format: FORMAT, version: VERSION, heights: {} });
export const validRatio = (r) => typeof r === 'number' && Number.isFinite(r) && r >= 0.01 && r <= 100000;

/** Untrusted → { standard, ignored }: only known kinds, finite numbers inside MIN_MM … MAX_MM, rounded to a micron. */
export function cleanStandard(raw) {
  const out = emptyStandard(), ignored = [];
  const h = raw && typeof raw === 'object' && raw.heights && typeof raw.heights === 'object' ? raw.heights : {};
  for (const k of Object.keys(h)) {
    const v = h[k];
    if (KINDS.includes(k) && typeof v === 'number' && Number.isFinite(v) && v >= MIN_MM && v <= MAX_MM) out.heights[k] = r3(v);
    else ignored.push(k);
  }
  return { standard: out, ignored };
}
export const isSet = (standard, kind) => !!standard && !!standard.heights && typeof standard.heights[kind] === 'number';
const own = (kind) => OWN_PT[kind] ?? OWN_PT.text;

export function paperMm(kind, standard = null) {
  return isSet(standard, kind) ? standard.heights[kind] : r3(own(kind) * PT_MM * CAP);
}
export function fontPt(kind, standard = null) {
  return isSet(standard, kind) ? standard.heights[kind] / CAP / PT_MM : own(kind);
}
export const factor = (kind, standard = null) => fontPt(kind, standard) / own(kind);
export function modelOf(paperMm, ratio, unitMm = 1) {
  if (!(typeof paperMm === 'number' && Number.isFinite(paperMm)) || !validRatio(ratio) || !(unitMm > 0)) return NaN;
  return paperMm * ratio / unitMm;
}
export function modelHeight(kind, ratio, standard = null, unitMm = 1) {
  return modelOf(isSet(standard, kind) ? standard.heights[kind] : own(kind) * PT_MM * CAP, ratio, unitMm);
}
export function modelFont(kind, ratio, standard = null, unitMm = 1) {
  return modelOf(fontPt(kind, standard) * PT_MM, ratio, unitMm);
}
export const symbolScale = (ratio) => (validRatio(ratio) ? ratio : NaN);
export function rescale(size, fromRatio, toRatio) {
  if (!(typeof size === 'number' && Number.isFinite(size)) || !validRatio(fromRatio) || !validRatio(toRatio)) return NaN;
  return Math.round(size * toRatio / fromRatio * 1e9) / 1e9;
}
export function sameStandard(a, b) {
  const x = cleanStandard(a).standard.heights, y = cleanStandard(b).standard.heights;
  return KINDS.every((k) => x[k] === y[k]);
}
