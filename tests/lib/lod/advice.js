// SPDX-License-Identifier: Apache-2.0
/* i18n-ignore-file: the sentences here are the English fallback for a host with no catalog (keys lod.* in the host language file say the same) and file-format values */
/**
 * advice.js: the "stay generic early" guard, host-free (0.10 booklet row BK.101, session bim-lod-10). No DOM.
 *
 * The booklet's evidence: once a model holds a lot of detail, designers resist changing it. So early on the program SUGGESTS staying
 * generic (LOD 100 to 200) and says so when a person places something more developed than the stage needs. It is ADVICE ONLY: every
 * function here returns `block: false`; nothing is refused, delayed or changed (BK.73: checks advise and never block). A person who
 * wants LOD 300 on day one just places it; the note says it will be harder to change, once, and goes away.
 *
 *   EARLY_MAX                       200: a milestone asking this or less is "early"
 *   isEarly(required)               the stage / milestone asks LOD 200 or less
 *   startingLod(required)           the LOD a new element is given at an early stage: 200 (generic placeholder); null when not early
 *   placeAdvice({ itemLod, required, name }) → { block: false, key, vars } | null     a more developed item than an early stage needs
 *   modelAdvice({ elements, required, stage }) → { block: false, notes: [{ key, vars, ids }] }    the model so far
 *   words(key, vars)
 */
import { isLod } from '../walls/lod.js';

export const EARLY_MAX = 200;
export const isEarly = (required) => isLod(required) && required <= EARLY_MAX;
export const startingLod = (required) => (isEarly(required) ? 200 : null);

export function placeAdvice({ itemLod = null, required = null, name = '' } = {}) {
  if (!isEarly(required) || !isLod(itemLod) || itemLod <= EARLY_MAX) return null;
  return { block: false, key: 'lod.advice.place', vars: { name: String(name || ''), lod: itemLod, required } };
}
export function modelAdvice({ elements = [], required = null, stage = '' } = {}) {
  const notes = [];
  if (isEarly(required)) {
    const ahead = (elements || []).filter((e) => isLod(e.lod) && e.lod > EARLY_MAX && e.lod < 500);
    if (ahead.length) notes.push({ key: 'lod.advice.model', vars: { n: ahead.length, required, stage: String(stage || '') }, ids: ahead.slice(0, 50).map((e) => e.id) });
  }
  return { block: false, notes };
}
const EN = {
  'lod.advice.place': '{name} is LOD {lod}. At this stage LOD {required} is enough, and detail is harder to change later. You can stay generic for now, or place it as it is.',
  'lod.advice.model': '{n} elements are more developed than LOD {required}, which is what the {stage} stage asks. Detail is harder to change later; staying generic keeps changes cheap.',
};
export function words(key, vars = {}) { return String(EN[key] ?? key).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m)); }
