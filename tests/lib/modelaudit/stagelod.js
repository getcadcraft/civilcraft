// SPDX-License-Identifier: Apache-2.0
/* i18n-ignore-file: the sentences here are the English fallback for a host with no catalog (keys audit.*, iface.*, verify.* in the host language file say the same) and file-format values */
/**
 * stagelod.js: which level of development (LOD) a project stage asks of its elements, host-free (0.10 booklet row BK.65, session
 * bk-r3-checks-10). No DOM. The scale is lib/walls/lod.js (the one LOD scale); the stages are the shell's (assets/js/docinfo.js STAGES:
 * the test checks the keys agree).
 *
 * THE TABLE IS DATA and it is CADCRAFT'S OWN STARTING POINT, NOT A STANDARD: no published standard fixes one LOD per stage (a real
 * project sets it per element kind in its BIM execution plan). An office overrides any row (BimCraft: Settings › Default Policies ›
 * Audit, or the Audit panel), and a stage with no number asks nothing.
 *
 *   STAGE_LOD                         { brief: null, concept: 100, 'design-development': 200, submission: 300, 'working-drawings': 350,
 *                                       tender: 350, 'close-out': 500 }
 *   cleanStageLod(raw, base)          → a full table: base (default STAGE_LOD) with the valid rows of raw laid over (a number of the
 *                                       scale, or null / 'none' = this stage asks nothing); anything else is ignored
 *   requiredLod(stage, table)         → the number, or null (no stage set, or the stage asks nothing)
 *   lodGaps(elements, required)       → { below: [element…], untagged: [element…], ok: n }   elements = [{ id, label, kind, lod }]
 *                                       (lod = the element's effective LOD: its own, else its type's, 500 while field-verified; null = no tag)
 */
import { isLod } from '../walls/lod.js';

export const STAGE_LOD_NOTE = 'CadCraft starting values, not a standard: set them to your project\'s BIM execution plan.';
export const STAGE_LOD = Object.freeze({ brief: null, concept: 100, 'design-development': 200, submission: 300, 'working-drawings': 350, tender: 350, 'close-out': 500 });

export function cleanStageLod(raw, base = STAGE_LOD) {
  const out = { ...base };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const k of Object.keys(base)) {
    if (!(k in raw)) continue;
    const v = raw[k];
    if (v === null || v === 'none' || v === 0) out[k] = null;
    else if (isLod(typeof v === 'string' && /^\d{3}$/.test(v) ? Number(v) : v)) out[k] = Number(v);
  }
  return out;
}

export const requiredLod = (stage, table = STAGE_LOD) => (stage && Object.prototype.hasOwnProperty.call(table, stage) && isLod(table[stage]) ? table[stage] : null);

export function lodGaps(elements, required) {
  const below = [], untagged = [];
  let ok = 0;
  if (!isLod(required)) return { below, untagged, ok: (elements || []).length };
  for (const e of elements || []) {
    if (!isLod(e.lod)) untagged.push(e);
    else if (e.lod < required) below.push(e);
    else ok++;
  }
  return { below, untagged, ok };
}
