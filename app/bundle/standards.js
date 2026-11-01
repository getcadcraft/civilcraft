// SPDX-License-Identifier: Apache-2.0
// cc-bundle standards.js: the template standards a project bundle carries (layers, layer combinations, line types, pen sets) turned into the
// plain shapes a drawing app loads (0.8 DF.12b, session ifc_PART_3, rule 39). Canonical copy: lib/bundle/; apps carry byte-identical copies in
// dev/bundle/ (tools/bundle/sync.mjs). Input is a manifest already checked by readManifest(); no DOM, no app imports.
/* i18n-ignore-file: data shapes and note codes; apps turn `notes[].code` into words with their own t('bundle.std.*'). */

/** The standards a bundle holds, counted: [{ key, n }] for the rows that are not empty. */
export function standardsSummary(manifest) {
  const s = (manifest && manifest.standards) || {};
  return ['layers', 'layer_combinations', 'pen_sets', 'line_types', 'fills', 'surfaces', 'composites', 'materials']
    .map((key) => ({ key, n: Array.isArray(s[key]) ? s[key].length : 0 })).filter((r) => r.n > 0);
}

/**
 * Layers for a drawing app. `combination` (a layer combination's name) applies that combination's hidden/locked flags on top of the plain
 * layer flags; an unknown name is noted and ignored. Colours are not in a bundle's layers: `color` is left out (the app picks its default).
 * → { layers: [{ name, on, locked, frozen }], notes: [{ code, name? }] }
 */
export function layersFor(manifest, { combination = null } = {}) {
  const s = (manifest && manifest.standards) || {}, notes = [];
  const combo = combination ? (s.layer_combinations || []).find((c) => c.name === combination) : null;
  if (combination && !combo) notes.push({ code: 'combination', name: String(combination) });
  const layers = [];
  const seen = new Set();
  for (const l of s.layers || []) {
    if (!l || typeof l.name !== 'string' || !l.name || seen.has(l.name)) continue;
    seen.add(l.name);
    const c = combo && combo.layers && combo.layers[l.name];
    const hidden = c ? !!c.hidden : !!l.hidden, locked = c ? !!c.locked : !!l.locked;
    layers.push({ name: l.name, on: !hidden, locked, frozen: false });
  }
  return { layers, notes };
}

/**
 * Line types as dash patterns in millimetres: `+dash, -gap, 0 = dot`, the form the drawing apps hold. A bundle pattern lists lengths
 * alternating dash, gap, dash, gap …; solid types and "symbol" types (a line with symbols along it) are not dashes, so they are left out
 * and noted. → { lineTypes: [{ name, description, pattern }], notes: [{ code: 'symbol' | 'nopattern', name }] }
 */
export function lineTypesFor(manifest) {
  const s = (manifest && manifest.standards) || {}, lineTypes = [], notes = [];
  for (const t of s.line_types || []) {
    if (!t || typeof t.name !== 'string' || !t.name) continue;
    if (t.kind === 'solid') continue;
    if (t.kind === 'symbol') { notes.push({ code: 'symbol', name: t.name }); continue; }
    const p = Array.isArray(t.pattern) ? t.pattern.filter((v) => Number.isFinite(v) && v >= 0) : [];
    if (p.length < 2 || p.length > 64) { notes.push({ code: 'nopattern', name: t.name }); continue; }
    lineTypes.push({ name: t.name, description: '', pattern: p.map((v, i) => (i % 2 === 0 ? v : -v)) });
  }
  return { lineTypes, notes };
}

/** Pen sets as { name, pens: [{ index, color, weight (mm) }] }, trimmed to what the apps' plot styles take (index 1–255, #rrggbb, 0–5 mm). */
export function penSetsFor(manifest) {
  const s = (manifest && manifest.standards) || {};
  return (s.pen_sets || []).filter((p) => p && typeof p.name === 'string').map((p) => ({
    name: p.name,
    pens: (p.pens || []).filter((x) => x && Number.isInteger(x.index) && x.index >= 1 && x.index <= 255)
      .map((x) => ({ index: x.index, color: /^#[0-9a-f]{6}$/i.test(x.color || '') ? x.color.toLowerCase() : null, weight: Number.isFinite(x.weight) && x.weight >= 0 && x.weight <= 5 ? x.weight : null })),
  }));
}
