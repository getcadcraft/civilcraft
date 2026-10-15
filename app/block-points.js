/* SPDX-License-Identifier: Apache-2.0 */
/**
 * block-points.js — survey points from block references in a DWG or DXF (0.5 WL.19). No DOM; bin/test-civilcraft-blocks.mjs.
 *
 * Surveyors' drawings often carry their points as blocks: a symbol per point, inserted at the shot's position, with
 * attributes for the number, the description and the elevation. Each chosen reference in MODEL SPACE (not the references
 * nested inside other blocks) becomes one survey point at its insertion point (X, Y, Z in project units); the drawing is
 * read, never changed, and each point remembers the reference it came from (`blk`).
 *
 *   blockRefs(model, { projectUnit, scale }) → { refs, blocks, layers, scale, notes }
 *     refs   [{ block (true name of a dynamic block's anonymous copy), layer, handle, x, y, z, attrs: { TAG: value } }]
 *     blocks [{ name, count, layers: [names], tags: [attribute tags, upper case] }]   (most used first)
 *     layers [{ name, count }]
 *   pointsFromBlocks(refs, { blocks, layers, desc, z, number, existing, start }) → { points, skipped: { noZ, noNumber }, renumbered }
 *     blocks / layers: names to take (a reference is taken when its block OR its layer is chosen; neither given = none)
 *     desc   'block' | 'layer' | 'attr:<TAG>' (an empty attribute falls back to the block name)
 *     z      'insert' | 'attr:<TAG>' | 'none' (an attribute that does not read as a number → no elevation, counted)
 *     number 'next' | 'attr:<TAG>'   numbers taken already (or twice in the drawing) get new ones after the highest
 *     → points { n, x, y, z | null, d, blk: { name, layer, handle } }
 *   cleanBlk(raw) → a safe `blk` (project files are untrusted)
 */

import { unitScale, ocs } from './cad-linework.js';

export const MAX_REFS = 200000;
const str = (v, n = 200) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

/** Every top-level block reference in model space with its insertion point in project units. */
export function blockRefs(model, { projectUnit = 'ft', scale = null } = {}) {
  const notes = [];
  const us = unitScale(model?.header || {}, projectUnit);
  const k = Number.isFinite(scale) && scale > 0 ? scale : us.scale;
  if (scale == null && us.note) notes.push(us.note);
  const byName = new Map();
  for (const b of model?.blocks || []) byName.set(String(b.name).toUpperCase(), b);
  const ms = byName.get('*MODEL_SPACE');
  const refs = [];
  for (const e of ms?.entities || []) {
    if (!e || (e.type !== 'INSERT' && e.type !== 'MINSERT') || e.invisible) continue;
    const b = byName.get(String(e.block || '').toUpperCase());
    if (b && (b.xrefPath || (b.flags & 4))) continue;   // linked drawings are not points
    const name = str(b?.trueName || e.block || '?', 255);
    const ins = e.insert || { x: 0, y: 0, z: 0 };
    // the insertion point is in the reference's object coordinate system (its extrusion), as every 2D entity
    const O = ocs(e.extrusion) || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];   // row-major 3 × 4; null = +Z
    const ix = ins.x || 0, iy = ins.y || 0, iz = ins.z || 0;
    const w = [O[0] * ix + O[1] * iy + O[2] * iz, O[4] * ix + O[5] * iy + O[6] * iz, O[8] * ix + O[9] * iy + O[10] * iz];
    const attrs = {};
    for (const a of e.attribs || []) { const tag = str(a.tag, 255).toUpperCase(); if (tag && !(tag in attrs)) attrs[tag] = str(a.value ?? a.text, 500); }
    const cols = e.type === 'MINSERT' ? Math.max(1, Math.min(1000, e.cols | 0 || 1)) : 1, rows = e.type === 'MINSERT' ? Math.max(1, Math.min(1000, e.rows | 0 || 1)) : 1;
    const r = e.rotation || 0, c = Math.cos(r), s = Math.sin(r);
    for (let ci = 0; ci < cols; ci++) for (let ri = 0; ri < rows; ri++) {
      const dx = ci * (e.colSpacing || 0), dy = ri * (e.rowSpacing || 0);
      const ox = c * dx - s * dy, oy = s * dx + c * dy;   // MINSERT steps run along the reference's own turned axes (OCS)
      const p = [w[0] + O[0] * ox + O[1] * oy, w[1] + O[4] * ox + O[5] * oy, w[2] + O[8] * ox + O[9] * oy].map((v) => v * k);
      if (!p.every(Number.isFinite)) continue;
      refs.push({ block: name, layer: str(e.layer ?? '0', 255), handle: str(e.handle, 32) + (cols * rows > 1 ? '#' + (ci * rows + ri + 1) : ''), x: p[0], y: p[1], z: p[2], attrs });
      if (refs.length >= MAX_REFS) break;
    }
    if (refs.length >= MAX_REFS) { notes.push('max'); break; }
  }
  const blocks = new Map(), layers = new Map();
  for (const r of refs) {
    let b = blocks.get(r.block);
    if (!b) blocks.set(r.block, (b = { name: r.block, count: 0, layers: new Set(), tags: new Set() }));
    b.count++; b.layers.add(r.layer); for (const tg of Object.keys(r.attrs)) b.tags.add(tg);
    layers.set(r.layer, (layers.get(r.layer) || 0) + 1);
  }
  const order = (a, b) => b.count - a.count || a.name.localeCompare(b.name, undefined, { numeric: true });
  return {
    refs,
    blocks: [...blocks.values()].map((b) => ({ name: b.name, count: b.count, layers: [...b.layers].sort(), tags: [...b.tags].sort() })).sort(order),
    layers: [...layers].map(([name, count]) => ({ name, count })).sort(order),
    scale: k, notes,
  };
}

/** A number read from attribute text: "105.32", "105,32", "EL 105.32", "105.32'" — the first number in it. */
export function attrNumber(text) {
  const m = /[-+]?\d+(?:[.,]\d+)?(?:e[-+]?\d+)?/i.exec(String(text ?? ''));
  if (!m) return null;
  const v = Number(m[0].replace(',', '.'));
  return Number.isFinite(v) ? v : null;
}

/** The chosen references as survey points (see the header). */
export function pointsFromBlocks(refs, { blocks = [], layers = [], desc = 'block', z = 'insert', number = 'next', existing = [], start = null } = {}) {
  const wantB = new Set(blocks), wantL = new Set(layers);
  const chosen = refs.filter((r) => wantB.has(r.block) || wantL.has(r.layer));
  const tagOf = (how) => (typeof how === 'string' && how.startsWith('attr:') ? how.slice(5).toUpperCase() : null);
  const dTag = tagOf(desc), zTag = tagOf(z), nTag = tagOf(number);
  const taken = new Set(existing.map((p) => String(p.n)));
  let highest = existing.reduce((m, p) => (/^\d+$/.test(String(p.n)) ? Math.max(m, Number(p.n)) : m), 0);
  if (Number.isFinite(start) && start > 0) highest = Math.max(0, Math.floor(start) - 1);
  const skipped = { noZ: 0, noNumber: 0 };
  let renumbered = 0;
  const points = [];
  const fresh = () => { do highest++; while (taken.has(String(highest))); return String(highest); };
  for (const r of chosen) {
    let n = nTag ? str(r.attrs[nTag], 40) : '';
    if (nTag && !n) skipped.noNumber++;
    if (!n || taken.has(n)) { if (n) renumbered++; n = fresh(); }
    taken.add(n);
    let zz = null;
    if (z === 'insert') zz = r.z;
    else if (zTag) { zz = attrNumber(r.attrs[zTag]); if (zz === null) skipped.noZ++; }
    let d = desc === 'layer' ? r.layer : dTag ? str(r.attrs[dTag]) : r.block;
    if (!d) d = str(r.block);
    points.push({ n, x: r.x, y: r.y, z: Number.isFinite(zz) && Math.abs(zz) < 1e6 ? zz : null, d: str(d), blk: { name: str(r.block, 255), layer: str(r.layer, 255), handle: str(r.handle, 40) } });
  }
  return { points, skipped, renumbered };
}

/** A point's `blk` from a project file (untrusted), or undefined. */
export function cleanBlk(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.name !== 'string') return undefined;
  return { name: str(raw.name, 255), layer: str(raw.layer, 255), handle: str(raw.handle, 40) };
}
