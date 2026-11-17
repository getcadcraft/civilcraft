// SPDX-License-Identifier: Apache-2.0
/**
 * lod.js: the level of development (LOD) tag, host-free (0.10 BK.16, session bk-typeswap-10). No imports, no DOM.
 * It lives in lib/walls because the wall types are the first thing that carries it (the sync sends it to every host that has walls); nothing
 * in it is about walls, so the LOD framework on every element (BK.13) can use it as it is.
 *
 * THE STORED FIELD (for BK.13 to reuse): `lod`, a whole number, one of LOD_SCALE (100, 200, 300, 350, 400, 500). No field = not set
 * (never 0, never null, never a string). On a wall type it is a field of the type's recipe (BimCraft: wall-assemblies.js validateAssembly,
 * kept in the IfcWallType's CadCraft_WallType Recipe) and is mirrored for other programs as the plain property LOD_PROPERTY ('LOD',
 * IFCINTEGER) in the same property set, written only when set. An element of its own would carry the same `lod` number and the same
 * plain property; an element with none reads its type's (lodOf(element, type)).
 *
 *   LOD_SCALE                    [100, 200, 300, 350, 400, 500]
 *   isLod(v)                     v is a number of the scale
 *   parseLod(v)                  300 | '300' | 'LOD 300' | 'lod300' → 300; anything else → null
 *   lodLabel(n)                  'LOD 300' ('' when not set): the tag as people write it; the same in every language
 *   lodBand(n)                   'generic' (100, 200) | 'specific' (300 and up) | '' (not set)
 *   lodOf(element, type)         the element's own tag, else its type's, else null
 *   lodChange(from, to)          'none' (both not set) | 'same' | 'up' | 'down' | 'set' (was not set) | 'cleared' (is not set now)
 */
export const LOD_SCALE = [100, 200, 300, 350, 400, 500];
export const LOD_PROPERTY = 'LOD';

export const isLod = (v) => typeof v === 'number' && LOD_SCALE.includes(v);
export function parseLod(v) {
  if (isLod(v)) return v;
  if (typeof v !== 'string') return null;
  const m = /^\s*(?:lod)?\s*(\d{3})\s*$/i.exec(v);
  const n = m ? Number(m[1]) : NaN;
  return isLod(n) ? n : null;
}
export const lodLabel = (n) => (isLod(n) ? 'LOD ' + n : '');
export const lodBand = (n) => (!isLod(n) ? '' : n < 300 ? 'generic' : 'specific');
export const lodOf = (element, type = null) => (isLod(element?.lod) ? element.lod : isLod(type?.lod) ? type.lod : null);
export function lodChange(from, to) {
  const a = isLod(from) ? from : null, b = isLod(to) ? to : null;
  if (a === null && b === null) return 'none';
  if (a === null) return 'set';
  if (b === null) return 'cleared';
  return a === b ? 'same' : b > a ? 'up' : 'down';
}
