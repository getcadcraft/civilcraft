/* SPDX-License-Identifier: Apache-2.0 */
/**
 * services.js — the table of building services a 2D MEP drawing is drawn in (lib/mep2d). DOM-free.
 *
 * A service is { tag, name, layer, color (ACI 1–255), linetype, use: 'pipe' | 'duct' }. Drawing a run puts it on the service's
 * layer; the layer is made on demand with the service's colour and linetype. The layer names, colours and linetypes below are
 * CadCraft's own starting set (flow lines continuous, return lines dashed, as most offices draw them) — not taken from a layer
 * standard; every one can be changed and services can be added (mergeServices).
 */

export const SERVICES = Object.freeze([
  { tag: 'HF', name: 'Heating flow', layer: 'M-HEAT-FLOW', color: 1, linetype: 'Continuous', use: 'pipe' },
  { tag: 'HR', name: 'Heating return', layer: 'M-HEAT-RETN', color: 5, linetype: 'DASHED', use: 'pipe' },
  { tag: 'CHF', name: 'Chilled water flow', layer: 'M-CHW-FLOW', color: 4, linetype: 'Continuous', use: 'pipe' },
  { tag: 'CHR', name: 'Chilled water return', layer: 'M-CHW-RETN', color: 140, linetype: 'DASHED', use: 'pipe' },
  { tag: 'DCW', name: 'Domestic cold water', layer: 'P-DOM-COLD', color: 150, linetype: 'Continuous', use: 'pipe' },
  { tag: 'DHW', name: 'Domestic hot water', layer: 'P-DOM-HOT', color: 10, linetype: 'Continuous', use: 'pipe' },
  { tag: 'DHC', name: 'Domestic hot water circulation', layer: 'P-DOM-CIRC', color: 30, linetype: 'DASHDOT', use: 'pipe' },
  { tag: 'W', name: 'Waste', layer: 'P-DRAIN-WASTE', color: 34, linetype: 'Continuous', use: 'pipe' },
  { tag: 'S', name: 'Soil', layer: 'P-DRAIN-SOIL', color: 36, linetype: 'DASHED', use: 'pipe' },
  { tag: 'G', name: 'Gas', layer: 'P-GAS', color: 2, linetype: 'DASHDOT', use: 'pipe' },
  { tag: 'F', name: 'Fire protection', layer: 'F-FIRE-PIPE', color: 240, linetype: 'Continuous', use: 'pipe' },
  { tag: 'REF', name: 'Refrigerant', layer: 'M-REFR', color: 6, linetype: 'DASHED2', use: 'pipe' },
  { tag: 'CD', name: 'Condensate', layer: 'M-COND', color: 8, linetype: 'DOT', use: 'pipe' },
  { tag: 'SA', name: 'Supply air', layer: 'M-DUCT-SUPP', color: 5, linetype: 'Continuous', use: 'duct' },
  { tag: 'RA', name: 'Return air', layer: 'M-DUCT-RETN', color: 3, linetype: 'Continuous', use: 'duct' },
  { tag: 'EA', name: 'Extract air', layer: 'M-DUCT-EXTR', color: 30, linetype: 'Continuous', use: 'duct' },
]);

export const TAG_RE = /^[A-Z][A-Z0-9]{0,7}$/;
const LAYER_RE = /^[^\u0000-\u001f<>/\\":;?*|=,`]{1,120}$/;
const LT_RE = /^[A-Za-z0-9_$-]{1,31}$/;

/** One service from a person or a file → a clean service, or null when it cannot be used. */
export function cleanService(s) {
  if (!s || typeof s !== 'object') return null;
  const tag = String(s.tag ?? '').trim().toUpperCase();
  if (!TAG_RE.test(tag)) return null;
  const name = String(s.name ?? tag).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 60) || tag;
  const layer = LAYER_RE.test(String(s.layer ?? '').trim()) ? String(s.layer).trim() : 'M-' + tag;
  const c = Number(s.color);
  const color = Number.isInteger(c) && c >= 1 && c <= 255 ? c : 7;
  const linetype = LT_RE.test(String(s.linetype ?? '')) ? String(s.linetype) : 'Continuous';
  return { tag, name, layer, color, linetype, use: s.use === 'duct' ? 'duct' : 'pipe', ...(s.user ? { user: true } : {}) };
}

/** The built-in services with a person's own laid over them (same tag = theirs wins; new tags are added at the end). */
export function mergeServices(own = []) {
  const out = SERVICES.map((s) => ({ ...s }));
  for (const raw of Array.isArray(own) ? own : []) {
    const s = cleanService({ ...raw, user: true });
    if (!s) continue;
    const i = out.findIndex((x) => x.tag === s.tag);
    if (i >= 0) out[i] = s; else out.push(s);
    if (out.length >= 200) break;
  }
  return out;
}

export const serviceOf = (list, tag) => list.find((s) => s.tag === String(tag ?? '').toUpperCase()) || null;
