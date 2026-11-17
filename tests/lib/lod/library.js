// SPDX-License-Identifier: Apache-2.0
/* i18n-ignore-file: the sentences here are the English fallback for a host with no catalog (keys lod.* in the host language file say the same) and file-format values */
/**
 * library.js: what a Library item says about itself before it is placed, host-free (0.10 booklet row BK.95, session bim-lod-10).
 * No DOM. A READ of the Library item's own data (libitem.js validates it: `lod`, a Type's `type.lod`, `ifc.class`, `classification`);
 * nothing here writes an item. An item with no LOD says "LOD not stated" rather than a guess.
 *
 *   itemLod(item)              → 100 … 500 | null   (a Type keeps it in type.lod; the item's own `lod` otherwise)
 *   itemClass(item)            → { ifcClass, from: 'item' | 'kind' | '' }   the item's own class; a few kinds name one by themselves
 *   itemCodes(item)            → [{ system, code, title }]
 *   placeInfo(item, { required }) → { lod, label, ifcClass, codes, vsStage: 'ok' | 'below' | 'above' | '' }
 *   placeLine(item, { t })     → "LOD 300 · IfcDoor · uniclass Ss_25_30" for the card and the place dialog
 */
import { isLod, lodLabel } from '../walls/lod.js';

const KIND_CLASS = { door: 'IfcDoor', window: 'IfcWindow', symbol: 'IfcAnnotation', detail: 'IfcAnnotation' };

export function itemLod(item) {
  if (!item || typeof item !== 'object') return null;
  const v = item.kind === 'type' && item.type && typeof item.type === 'object' && isLod(item.type.lod) ? item.type.lod : item.lod;
  return isLod(v) ? v : null;
}
export function itemClass(item) {
  const c = item?.ifc && typeof item.ifc === 'object' ? item.ifc.class : '';
  if (typeof c === 'string' && /^Ifc[A-Za-z0-9]+$/.test(c)) return { ifcClass: c, from: 'item' };
  const k = KIND_CLASS[item?.kind];
  return k ? { ifcClass: k, from: 'kind' } : { ifcClass: '', from: '' };
}
export const itemCodes = (item) => (Array.isArray(item?.classification) ? item.classification : []).filter((c) => c && typeof c.code === 'string' && c.code).slice(0, 12)
  .map((c) => ({ system: String(c.system || ''), code: c.code, title: String(c.title || '') }));

export function placeInfo(item, { required = null } = {}) {
  const lod = itemLod(item), cls = itemClass(item);
  return { lod, label: lod === null ? '' : lodLabel(lod), ifcClass: cls.ifcClass, classFrom: cls.from, codes: itemCodes(item),
    vsStage: !isLod(required) || lod === null ? '' : lod < required ? 'below' : lod > required ? 'above' : 'ok' };
}
export function placeLine(item, { t = null } = {}) {
  const i = placeInfo(item), none = t ? t('lod.item.none') : '';
  const lod = i.label || (none && none !== 'lod.item.none' ? none : 'LOD not stated');
  return [lod, i.ifcClass, ...i.codes.slice(0, 2).map((c) => c.system + ' ' + c.code)].filter(Boolean).join(' · ');
}
