// SPDX-License-Identifier: Apache-2.0
/* i18n-ignore-file: the sentences here are the English fallback for a host with no catalog (keys lod.* in the host language file say the same) and file-format values */
/**
 * scale.js: what each level of development (LOD) means in the app, FIXED, host-free (0.10 booklet rows BK.13, BK.87 to BK.93 and BK.100,
 * session bim-lod-10). No DOM. The numbers are lib/walls/lod.js's one scale (100, 200, 300, 350, 400, 500); this file gives each its
 * meaning and locks the whole.
 *
 * SOURCES. The six levels and "each level includes everything below it" are the BIMForum Level of Development (LOD) Specification
 * (2025), Part I, as the architects' booklet 0.4.1 (chapter 03) and its rows BK.87 to BK.92 state them. The sentences below are
 * CadCraft's own plain-words summary of those rows, NOT the specification's text (SCALE_SOURCE says so, and the panel shows it).
 * The split of an element's needs into geometry, information and documentation is ISO 7817-1 (level of information need): parts.js.
 *
 * LEVEL OF DEVELOPMENT IS NOT LEVEL OF DETAIL (BK.100). Development = how far the element has been thought through, so how much
 * others may rely on it. Detail = how much is drawn. A finely drawn window in the wrong place is still LOD 200. `drawnDetail` names
 * what the page draws; `compareDetail` says whether the two agree; neither ever changes the other.
 *
 * THE SCALE IS FIXED (BK.93). The definitions are frozen objects; `scaleFingerprint()` is a hash of them; `checkContent(pack)` refuses
 * (as a problem list, never a block of the person's own work) any pack, template or table that carries its own definitions, its own
 * numbers or a different fingerprint. Content may state WHICH level a milestone needs (milestones.js); it never says what a level means.
 * An engineer's LOD 300 and an architect's LOD 300 are the same promise.
 *
 *   LOD_SCALE, isLod, parseLod, lodLabel, lodBand, lodOf, lodChange     re-exported from ../walls/lod.js (the one scale)
 *   LOD_LEVELS                    [{ lod, key, name, means, example, drawn, reliable, home }] frozen, in order
 *   SCALE_ID, SCALE_SOURCE        'cadcraft-lod-scale 1' and the citation text
 *   levelOf(lod)                  → the level's record | null
 *   includesBelow(lod)            → the levels it includes: [100, 200] for 300
 *   atLeast(have, need)           → have reaches need (a level reaches every level below it); null / unset reaches nothing
 *   compareLod(a, b)              → -1 | 0 | 1 (unset sorts below every level)
 *   scaleFingerprint()            → 8 hex digits over the definitions (the test pins it: a changed definition is a decision, not an edit)
 *   checkContent(content)         → [{ code, path, text }] for anything in `content` that tries to redefine the scale
 *   DETAIL_LEVELS, drawnDetail(facts), compareDetail(drawn, lod)    BK.100
 *   words(key, vars)              the English sentences
 */
import { LOD_SCALE, isLod, parseLod, lodLabel, lodBand, lodOf, lodChange } from '../walls/lod.js';

export { LOD_SCALE, isLod, parseLod, lodLabel, lodBand, lodOf, lodChange };

export const SCALE_ID = 'cadcraft-lod-scale 1';
export const SCALE_SOURCE = 'Levels 100 to 500 and "each level includes the ones below": BIMForum Level of Development (LOD) Specification, 2025, Part I, as summarised in the architects\' booklet 0.4.1 (chapter 03, rows BK.87 to BK.92). The sentences are CadCraft\'s own plain-words summary, not the specification\'s text. Geometry, information and documentation as separate parts: ISO 7817-1 (level of information need).';

const deep = (o) => { if (o && typeof o === 'object') { for (const v of Object.values(o)) deep(v); Object.freeze(o); } return o; };

export const LOD_LEVELS = deep([
  { lod: 100, key: 'symbol', name: 'Symbol or generic representation',
    means: 'A symbol or generic representation. Information can be read from it but is approximate; it need not be geometry.',
    example: 'A room before its walls, a switch on a layout, a space with a target area.',
    drawn: 'a symbol, a hatched band or a bare shape', reliable: 'that the thing exists and roughly where', home: 'BimCraft' },
  { lod: 200, key: 'placeholder', name: 'Generic placeholder',
    means: 'A generic element with approximate quantity, size, shape, location and orientation. It is in 3D and recognisable.',
    example: 'A generic 230 mm wall, a door of approximate width.',
    drawn: 'a simple solid or a hatched band', reliable: 'roughly how big, what shape and where', home: 'BimCraft' },
  { lod: 300, key: 'specific', name: 'Specific and measurable',
    means: 'A specific element as designed, measurable, enough for design intent. It is not necessarily free of clashes.',
    example: 'A 230 clay brick wall with its build-up and takeoff data, a specific door type and size.',
    drawn: 'the designed shape, with its layers', reliable: 'the designed size, place and build-up, and quantities taken from it', home: 'BimCraft' },
  { lod: 350, key: 'coordinated', name: 'Interfaces coordinated',
    means: 'As LOD 300, plus the interfaces with the elements next to it: a wall with its openings, lintels and service penetrations coordinated.',
    example: 'A wall with its door openings, the lintels over them and the sleeves for the pipes.',
    drawn: 'as 300, with the pieces it meets', reliable: 'that it fits what it touches', home: 'BimCraft' },
  { lod: 400, key: 'fabrication', name: 'Fabrication and installation',
    means: 'A specific element with the detail needed to fabricate and install it: coursing, cut sizes.',
    example: 'Brick coursing of a wall, cut lengths of a steel member.',
    drawn: 'every piece as it is made', reliable: 'that it can be made and installed from this', home: 'DetailCraft and the trades\' own tools' },
  { lod: 500, key: 'field-verified', name: 'Field-verified, as built',
    means: 'Measured on site. The element is marked verified: a tick on the element, who checked it, when and how.',
    example: 'A wall measured with a tape or a scan after it was built.',
    drawn: 'as built', reliable: 'that it is how it stands on site', home: 'BimCraft (the verification mark)' },
]);

const BY = new Map(LOD_LEVELS.map((l) => [l.lod, l]));
export const levelOf = (lod) => BY.get(lod) || null;
export const includesBelow = (lod) => (isLod(lod) ? LOD_SCALE.filter((n) => n < lod) : []);
export const compareLod = (a, b) => { const x = isLod(a) ? a : 0, y = isLod(b) ? b : 0; return x < y ? -1 : x > y ? 1 : 0; };
export const atLeast = (have, need) => isLod(have) && isLod(need) && have >= need;

export function scaleFingerprint() {
  let h = 0x811c9dc5;
  const feed = (s) => { for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } };
  feed(SCALE_ID);
  for (const l of LOD_LEVELS) feed('|' + [l.lod, l.key, l.name, l.means, l.example, l.drawn, l.reliable, l.home].join('\u0001'));
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * BK.93: a pack, template, library item or milestone table may NOT carry the scale. Anything that looks like one is reported (the host
 * shows it and ignores it; the person's own work is never blocked). `content` is untrusted JSON.
 */
const REDEFINE_KEYS = ['lodscale', 'lod_scale', 'lodlevels', 'lod_levels', 'lodscale', 'lodDefinitions', 'definitions', 'levels', 'scale', 'meanings'];
export function checkContent(content, { path = '' } = {}) {
  const out = [];
  const walk = (v, p, depth) => {
    if (!v || typeof v !== 'object' || depth > 6) return;
    if (Array.isArray(v)) { v.slice(0, 200).forEach((x, i) => walk(x, p + '[' + i + ']', depth + 1)); return; }
    for (const [k, x] of Object.entries(v).slice(0, 400)) {
      const q = p ? p + '.' + k : k, low = k.toLowerCase();
      if (REDEFINE_KEYS.some((r) => r.toLowerCase() === low) && x && typeof x === 'object') {
        // `levels` / `scale` are common words: only a block that names the LOD numbers counts
        const s = JSON.stringify(x);
        if (/lod|\b(100|200|300|350|400|500)\b/i.test(s) && (low !== 'levels' && low !== 'scale' || /lod/i.test(s) || /"(100|200|300|350|400|500)"/.test(s))) out.push({ code: 'lod.scale.redefined', path: q, text: words('lod.scale.redefined', { path: q }) });
      } else if (low === 'fingerprint' || low === 'scalefingerprint') {
        if (x !== scaleFingerprint()) out.push({ code: 'lod.scale.fingerprint', path: q, text: words('lod.scale.fingerprint', { path: q }) });
      } else if (low === 'scaleid' || low === 'scale_id') {
        if (x !== SCALE_ID) out.push({ code: 'lod.scale.id', path: q, text: words('lod.scale.id', { path: q, id: String(x).slice(0, 40) }) });
      } else if (/^(lod|requiredlod|level)$/i.test(k) && typeof x === 'number' && !isLod(x)) {
        out.push({ code: 'lod.scale.number', path: q, text: words('lod.scale.number', { path: q, n: x }) });
      } else walk(x, q, depth + 1);
    }
  };
  walk(content, path, 0);
  return out;
}

// ---------------------------------------------------------------------------------------------------- level of detail (BK.100)
/** What the page draws, coarsest first. Not the same thing as a level of development. */
export const DETAIL_LEVELS = Object.freeze(['symbol', 'band', 'envelope', 'layers', 'full']);
/**
 * drawnDetail({ sketch, layers, planDetail, hasShape, mesh }) → one of DETAIL_LEVELS | ''
 *   sketch    the element is drawn as ONE hatched band (a LOD 100 / 200 wall type: the sketch band)
 *   layers    number of material layers drawn separately in the plan or section
 *   planDetail  'coarse' | 'medium' | 'fine' (the plan's detail setting)
 *   mesh      the element has its own solid shape (an imported or Library body)
 *   hasShape  the element is drawn at all
 */
export function drawnDetail(f = {}) {
  if (f.hasShape === false) return '';
  if (f.sketch) return 'band';
  if (Number(f.layers) > 1 && f.planDetail === 'fine') return 'layers';
  if (Number(f.layers) > 1 && f.planDetail === 'medium') return 'layers';
  if (f.mesh) return 'full';
  if (f.planDetail === 'fine' && Number(f.layers) <= 1) return 'envelope';
  if (f.planDetail === 'coarse' || Number(f.layers) <= 1) return 'envelope';
  return 'envelope';
}
const DETAIL_RANK = { symbol: 1, band: 2, envelope: 3, layers: 4, full: 5 };
/** The LOD whose drawing is about this much: a rough match, for the "drawn ahead / developed ahead" hint only. */
const DETAIL_FOR_LOD = { 100: 1, 200: 2, 300: 4, 350: 4, 400: 5, 500: 5 };
/**
 * compareDetail(drawn, lod) → { drawn, lod, state: 'agree' | 'drawn-ahead' | 'developed-ahead' | 'unknown' }
 * drawn-ahead: it is drawn finer than its development supports (the "finely drawn window in the wrong place": still only that LOD).
 */
export function compareDetail(drawn, lod) {
  const r = DETAIL_RANK[drawn] || 0, want = isLod(lod) ? DETAIL_FOR_LOD[lod] : 0;
  if (!r || !want) return { drawn: drawn || '', lod: isLod(lod) ? lod : null, state: 'unknown' };
  const gap = r - want;
  return { drawn, lod, state: gap > 1 ? 'drawn-ahead' : gap < -1 ? 'developed-ahead' : 'agree' };
}

const EN = {
  'lod.scale.redefined': '"{path}" carries its own definition of the levels of development. The scale is fixed in CadCraft; the block is ignored.',
  'lod.scale.fingerprint': '"{path}" was made for a different LOD scale than this one. The scale is fixed; its levels are used as they are.',
  'lod.scale.id': '"{path}" names the scale "{id}". The scale is fixed; its levels are used as they are.',
  'lod.scale.number': '"{path}" is {n}, which is not a level of the scale (100, 200, 300, 350, 400, 500).',
};
export function words(key, vars = {}) { return String(EN[key] ?? key).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m)); }
