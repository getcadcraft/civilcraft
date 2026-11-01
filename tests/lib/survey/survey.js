/* SPDX-License-Identifier: Apache-2.0 */
/**
 * survey.js — levels from text and block attributes, and the survey check on import (0.8 LA.3). DOM-free, no imports,
 * Node-tested (bin/test-survey.mjs). lib/survey is canonical: `node tools/survey/sync.mjs --to civilcraft,cadcraft,bimcraft`
 * copies it to `<app>/dev/survey.js` (rule 39: copies are made, never edited).
 *
 * A surveyor's drawing often carries its levels as text beside a small cross ("104.37") or as an attribute of a point block.
 * Neither is geometry, so the linework reader skips them. This reads them as points with a z, and checks the drawing before
 * anyone builds a ground from it. Input is the drawing model cc-dwg / dxf-model.js return (model space only) and, for the
 * check, what the linework reader made of it. Drawings are untrusted: every loop has a cap, a non-finite number is dropped.
 *
 *   levelFromText(raw, { minDecimals })        → number | null    "104.37", "+104,37", "EL 104.37", "RL=104.37 m", MTEXT codes stripped.
 *                                                                 Without a prefix word the number needs a decimal part ("12" is a lot number, not a level).
 *   surveyLevels(model, { scale, layers, tag, minDecimals })
 *     → { points: [{ x, y, z, src: 'text'|'attrib', layer, text, handle, block? }], layers: [{ name, text, attrib }],
 *         tags: [{ tag, count, numeric }], tag, skipped: { capped }, notes: [] }
 *       scale = drawing units → project units (x, y and z alike). layers = only those layers (a Set/array). tag = the block attribute
 *       that holds the level (upper case); undefined = the likeliest one (ELEV, Z, LEVEL …) when a tag looks like one, null = none.
 *   checkSurvey({ header, points, layers, projectUnit, scale, crs }) → { issues, stats }
 *       layers = cadLinework()'s `layers` (features with g.c) so contours and the extent are known; points = [{ x, y, z|null }].
 *       An issue = { code, severity: 'warning'|'note', vars, layer?, count? }.
 *   toProblems(issues, { file }) → the shared Problems shape (docs/0.8-PROBLEMS-SPEC.md § 1), kind 'import', one row per kind of issue.
 *   fileKey(name) · rememberTag(storage, name, tag) · recallTag(storage, name)      the attribute choice, remembered per file
 */

export const MAX_ENTITIES = 2e6;
export const MAX_POINTS = 200000;
export const MAX_VERTICES = 5e6;
const fin = Number.isFinite;
const METRES = { m: 1, ft: 1200 / 3937 };
const CONTOUR = /TOPO|CONT|CNTR|CTR|CONTOUR|HOEHEN|COTA/i;
const TAG_Z = /^(ELEV|ELEVATION|EL|Z|HEIGHT|ELV|LEVEL|RL|COTA|ALT|ALTITUDE|NIVEL)$/;
const PREFIX = '(?:ELEV(?:ATION)?|EL|RL|FFL|FGL|NGL|LEVEL|LVL|Z|H|GL|FL|TW|BW|TOP|INV|FG|EG|COTA|ALT)';

/** MTEXT/TEXT value → plain text: formatting codes, braces and %% codes out. */
export function plainText(raw) {
  return String(raw ?? '')
    .replace(/\\[Pp]/g, ' ').replace(/\\~/g, ' ')
    .replace(/\\[fFcCHWQTAa][^;\\]{0,80};/g, '')   // \fArial|b0;  \H2.5x;  \A1;  \C1;
    .replace(/\\[LlOoKk]/g, '')
    .replace(/%%[dDpPcC]/g, '').replace(/%%u|%%o/gi, '')
    .replace(/[{}]/g, '').replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ').trim().slice(0, 200);
}

/** A level written as text, or null. */
export function levelFromText(raw, { minDecimals = 1 } = {}) {
  const s = plainText(raw);
  if (!s || s.length > 40) return null;
  const re = new RegExp('^(?:(' + PREFIX + ')\\s*[.:=]?\\s*)?([+\\-−]?)\\s*(\\d{1,7})(?:[.,](\\d{1,6}))?\\s*(?:m|ft|\'|’)?$', 'i');
  const m = re.exec(s);
  if (!m) return null;
  const dec = m[4] || '';
  if (!m[1] && dec.length < minDecimals) return null;
  const v = Number(m[3] + (dec ? '.' + dec : '')) * (m[2] === '-' || m[2] === '−' ? -1 : 1);
  return fin(v) ? v : null;
}

/** Levels from the drawing's text and attributes (see the header). */
export function surveyLevels(model, { scale = 1, layers = null, tag, minDecimals = 1 } = {}) {
  const k = fin(scale) && scale > 0 ? scale : 1;
  const notes = [], skipped = { capped: 0 };
  const ms = (model?.blocks || []).find((b) => String(b.name).toUpperCase() === '*MODEL_SPACE');
  const only = layers ? new Set([...layers].map(String)) : null;
  const ents = ms?.entities || [];
  const found = [];   // every candidate; the layer filter comes after the count
  const tags = new Map();
  let seen = 0;
  for (const e of ents) {
    if (++seen > MAX_ENTITIES) { notes.push('entities'); break; }
    if (!e || e.invisible) continue;
    if (e.type === 'TEXT' || e.type === 'MTEXT') {
      const z = levelFromText(e.value, { minDecimals });
      const p = e.type === 'TEXT' && (e.hAlign || e.vAlign) && e.align ? e.align : e.insert;
      if (z === null || !p || !fin(p.x) || !fin(p.y)) continue;
      found.push({ x: p.x * k, y: p.y * k, z: z * k, src: 'text', layer: String(e.layer ?? '0'), text: plainText(e.value).slice(0, 40), handle: String(e.handle ?? '').slice(0, 32) });
    } else if ((e.type === 'INSERT' || e.type === 'MINSERT') && e.attribs?.length && e.insert && fin(e.insert.x) && fin(e.insert.y)) {
      for (const a of e.attribs) {
        const tg = String(a.tag ?? '').toUpperCase().slice(0, 255);
        if (!tg) continue;
        const val = a.value ?? a.text;
        const z = levelFromText(val, { minDecimals });
        const t = tags.get(tg) || { tag: tg, count: 0, numeric: 0 };
        t.count++; if (z !== null) t.numeric++;
        tags.set(tg, t);
        found.push({ x: e.insert.x * k, y: e.insert.y * k, z: z === null ? null : z * k, raw: val, src: 'attrib', tag: tg, layer: String(e.layer ?? '0'), text: plainText(val).slice(0, 40), handle: String(e.handle ?? '').slice(0, 32), block: String(e.block ?? '').slice(0, 255) });
      }
    }
  }
  const tagList = [...tags.values()].sort((a, b) => b.numeric - a.numeric || a.tag.localeCompare(b.tag));
  const chosen = tag === undefined ? (tagList.find((t) => TAG_Z.test(t.tag) && t.numeric > 0)?.tag ?? null) : (tag === null ? null : String(tag).toUpperCase());
  // a chosen attribute is trusted as a level, so a whole number ("101") counts there; elsewhere it needs a decimal part
  for (const f of found) if (f.src === 'attrib' && f.tag === chosen && f.z === null) { const z = levelFromText(f.raw, { minDecimals: 0 }); if (z !== null) f.z = z * k; }
  const byLayer = new Map();
  for (const f of found) {
    if (f.src === 'attrib' && (f.tag !== chosen || f.z === null)) continue;
    const b = byLayer.get(f.layer) || { name: f.layer, text: 0, attrib: 0 };
    b[f.src]++;
    byLayer.set(f.layer, b);
  }
  const points = [];
  for (const f of found) {
    if (f.src === 'attrib' && (f.tag !== chosen || f.z === null)) continue;
    if (only && !only.has(f.layer)) continue;
    if (points.length >= MAX_POINTS) { skipped.capped++; continue; }
    const { tag: _t, raw: _r, ...p } = f;
    points.push(p);
  }
  if (skipped.capped) notes.push('points');
  return { points, layers: [...byLayer.values()].sort((a, b) => (b.text + b.attrib) - (a.text + a.attrib) || a.name.localeCompare(b.name)), tags: tagList, tag: chosen, skipped, notes };
}

// ---------------------------------------------------------------- the check

const median = (a) => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };

/** Every vertex of the linework layers' features: fn(x, y, z|null). Returns how many it saw (capped). */
function eachVertex(layers, fn) {
  let n = 0;
  const pt = (c) => { fn(c[0], c[1], c.length > 2 ? c[2] : null); n++; };
  for (const L of layers || []) {
    for (const f of L.features || []) {
      const g = f.g;
      if (!g) continue;
      if (g.t === 'pt') pt(g.c);
      else if (g.t === 'ln') for (const r of g.c) for (const c of r) { pt(c); if (n > MAX_VERTICES) return n; }
      else if (g.t === 'pg') for (const ring of g.c) for (const r of ring) for (const c of r) { pt(c); if (n > MAX_VERTICES) return n; }
    }
  }
  return n;
}

export function checkSurvey({ header = {}, points = [], layers = [], projectUnit = 'ft', scale = 1, crs = null } = {}) {
  const issues = [];
  const add = (code, severity, vars = {}, extra = {}) => issues.push({ code, severity, vars, ...extra });
  const mPer = METRES[projectUnit === 'm' ? 'm' : 'ft'];
  const code = header?.INSUNITS | 0;
  const pts = points.filter((p) => p && fin(p.x) && fin(p.y)).slice(0, MAX_POINTS);

  // extent (project units) from the linework and the points
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, maxAbs = 0, nv = 0;
  const grow = (x, y) => { if (!fin(x) || !fin(y)) return; nv++; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; maxAbs = Math.max(maxAbs, Math.abs(x), Math.abs(y)); };
  eachVertex(layers, grow);
  for (const p of pts) grow(p.x, p.y);
  const spanM = nv > 1 ? Math.hypot(maxX - minX, maxY - minY) * mPer : 0;
  const farM = maxAbs * mPer;

  // 1. units
  if (!code) add('units.none', 'warning', { unit: projectUnit });
  else if (Math.abs(scale - 1) > 1e-9) add('units.scaled', 'note', { scale: +Number(scale).toPrecision(8), unit: projectUnit });
  if (nv > 1 && spanM > 0) {
    if (spanM > 200e3) add('units.big', 'warning', { km: Math.round(spanM / 1000) });
    else if (spanM < 0.5) add('units.small', 'warning', { m: +spanM.toPrecision(3) });
  }

  // 2. coordinate system
  if (!crs) add('crs.none', farM > 1e5 ? 'warning' : 'note', { far: farM > 1e5 ? 1 : 0 });

  // 3. distance from the origin
  if (farM > 1e5) add('origin.far', 'warning', { km: Math.round(farM / 1000), x: Math.round((minX + maxX) / 2), y: Math.round((minY + maxY) / 2) });

  // 4. contours flattened at z 0 (a contour layer whose lines carry no height)
  const byFlat = new Map();
  for (const L of layers || []) {
    if (L.geom === 'pt' || !CONTOUR.test(L.cadLayer || L.name || '')) continue;
    const b = byFlat.get(L.cadLayer || L.name) || { all: 0, flat: 0 };
    for (const f of L.features || []) {
      b.all++;
      const g = f.g, c = g.t === 'ln' ? g.c : g.t === 'pg' ? g.c.flat() : [];
      if (!c.some((r) => r.some((q) => q.length > 2 && q[2] !== 0))) b.flat++;
    }
    byFlat.set(L.cadLayer || L.name, b);
  }
  for (const [layer, b] of byFlat) if (b.flat) add('contours.flat', b.flat === b.all ? 'warning' : 'note', { layer, flat: b.flat, all: b.all }, { layer, count: b.flat });

  // 5. level outliers
  const zs = pts.filter((p) => fin(p.z)).map((p) => p.z);
  let zMin = null, zMax = null;
  for (const z of zs) { if (zMin === null || z < zMin) zMin = z; if (zMax === null || z > zMax) zMax = z; }
  const absurd = (z) => z * mPer > 9000 || z * mPer < -11000;
  if (zs.length >= 8) {
    const med = median(zs), mad = median(zs.map((z) => Math.abs(z - med))) * 1.4826;
    const lim = Math.max(6 * mad, 5 / mPer);
    const zero = Math.abs(med) * mPer > 5 ? zs.filter((z) => z === 0).length : 0;
    const out = zs.filter((z) => z !== 0 && (absurd(z) || Math.abs(z - med) > lim)).length;
    if (zero) add('z.zero', 'warning', { n: zero, median: +med.toFixed(2) }, { count: zero });
    if (out) add('z.outlier', 'warning', { n: out, median: +med.toFixed(2), low: +(med - lim).toFixed(2), high: +(med + lim).toFixed(2) }, { count: out });
  } else {
    const bad = zs.filter(absurd).length;
    if (bad) add('z.outlier', 'warning', { n: bad, median: 0, low: -11000, high: 9000 }, { count: bad });
  }

  // 6. duplicates (1 mm cells)
  const cell = 1e-3 / mPer, seen = new Map();
  let dup = 0, conflict = 0;
  for (const p of pts) {
    const key = Math.round(p.x / cell) + ',' + Math.round(p.y / cell);
    const prev = seen.get(key);
    if (prev === undefined) { seen.set(key, fin(p.z) ? p.z : null); continue; }
    if (prev === null || !fin(p.z) || Math.abs(prev - p.z) <= cell) dup++; else conflict++;
  }
  if (dup) add('dup.same', 'warning', { n: dup }, { count: dup });
  if (conflict) add('dup.level', 'warning', { n: conflict }, { count: conflict });

  return { issues, stats: { points: pts.length, withZ: zs.length, zMin, zMax, extentM: { w: (maxX - minX) * mPer, h: (maxY - minY) * mPer }, farM, vertices: nv } };
}

// ---------------------------------------------------------------- the Problems rows

/** English words for every code (the apps give their own through msg.key `survey.p.<code>`). */
export const MESSAGES = {
  'units.none': 'The drawing does not say what its units are; it is read as {unit}. Check a known distance.',
  'units.scaled': 'The drawing’s units are converted to {unit} (x {scale}).',
  'units.big': 'The data spans about {km} km. The drawing may be in millimetres or another unit than the one it says.',
  'units.small': 'The data spans {m} m. The drawing may be in metres but read as millimetres, or drawn tiny.',
  'crs.none': 'No coordinate system is known for this drawing.',
  'origin.far': 'The data lies about {km} km from the origin (centre near {x}, {y}). Far from zero, 3D views lose precision and shake.',
  'contours.flat': 'Contour layer {layer}: {flat} of {all} lines have no height (flat at 0). A ground built from them would be flat.',
  'z.zero': '{n} levels are exactly 0 while the typical level is {median}. They look like missing heights.',
  'z.outlier': '{n} levels are far from the rest (typical {median}; expected between {low} and {high}).',
  'dup.same': '{n} points sit on top of another point at the same level.',
  'dup.level': '{n} points sit on top of another point with a different level.',
};
const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));

export function fileKey(name) { return String(name ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 200).toLowerCase(); }

/** The issues as shared Problems rows: kind 'import', one per kind (and layer), never one per point. */
export function toProblems(issues, { file = '' } = {}) {
  const fk = fileKey(file);
  return issues.map((i) => {
    const vars = Object.fromEntries(Object.entries(i.vars || {}).map(([k, v]) => [k, typeof v === 'number' || typeof v === 'string' ? v : String(v)]));
    return {
      id: 'survey:' + i.code + (i.layer ? ':' + i.layer : '') + ':' + fk, code: 'survey.' + i.code, severity: i.severity,
      msg: { key: 'survey.p.' + i.code, vars }, text: fill(MESSAGES[i.code] || i.code, vars),
      about: [{ kind: 'file', id: fk.slice(0, 120), label: String(file).slice(0, 120) }, ...(i.layer ? [{ kind: 'layer', id: String(i.layer).slice(0, 120) }] : [])],
      source: { kind: 'import', name: 'survey' },
    };
  });
}

// ---------------------------------------------------------------- remembered per file

const KEY = 'cc.survey.tag.';
export function rememberTag(storage, name, tag) {
  try { if (tag) storage.setItem(KEY + fileKey(name), String(tag).slice(0, 255)); else storage.removeItem(KEY + fileKey(name)); } catch { /* storage may be off */ }
}
export function recallTag(storage, name) {
  try { const v = storage.getItem(KEY + fileKey(name)); return v ? String(v).slice(0, 255) : undefined; } catch { return undefined; }
}
