/* SPDX-License-Identifier: Apache-2.0 */
/**
 * reconcile.js — the drawing against the record (0.11 LR.4): each parcel's drawn area beside the area its record states, parcels that
 * share ground, corners that nearly meet a neighbour's line (the slivers and gaps a common boundary drawn twice leaves), outlines that
 * cross themselves, references used twice, records with no parcel and parcels with no record. DOM-free; Node-tested.
 *
 * It compares; it does not decide. Which figure is right (the deed, the plan, the walk) is a surveyor's and the registry's call, and the
 * tolerances are the person's own (book.settings): the add-on ships no authority's.
 *
 *   reconcile(book, parcels, { unitM }) → { rows, issues, totals }
 *     parcels: [{ id, name, ring: [{ x, y }] (project units, arcs already chords), area (project units², exact) }]   unitM = metres per project unit
 *     rows:   [{ parcel, name, record | null, drawnM2, recordM2 | null, diffM2, pct, ok: true | false | null }]   ok null = nothing to compare with
 *     issues: [{ code, severity: 'warning' | 'note', parcel?, other?, record?, value?, at?: { x, y } }]
 *       'area' (differs by more than the tolerance) · 'overlap' (two parcels share ground; value = m²) · 'near' (a corner within the gap
 *       tolerance of a neighbour's line without being on it; value = m) · 'crossing' (the outline crosses itself) · 'dupref' · 'norecord' ·
 *       'noparcel' · 'noarea' (a record that states no area: a note)
 *     totals: { parcels, records, drawnM2, recordM2, compared, outside }
 *   checkLots(lots, rules) → [{ code: 'minarea' | 'minfrontage', lot, value, limit, use }]   lots: [{ name, use, areaM2, frontageM | null }] against the
 *       person's own rules (the rule for the lot's designation, else the rule for every lot); a frontage that is not known is not judged
 *   toProblems(issues, words) → the shared Problems shape (docs/0.8-PROBLEMS-SPEC.md § 1), one row per issue; words(code, vars) → text
 *   reconcileCsv(result, unit) → text
 */
import { area as ringAreaAbs, overlapArea, nearMisses, selfCrossings, bbox, centroid } from './geo.js';
import { recordOf, toM2, fromM2 } from './book.js';
import { csvRows } from './walk.js';

export function reconcile(book, parcels, { unitM = 1 } = {}) {
  const k2 = unitM * unitM, set = book.settings, issues = [], rows = [];
  const tol = Math.max(0, set.areaTolPct) / 100, gap = Math.max(0, set.gapTol) / unitM;
  let drawn = 0, rec = 0, compared = 0, outside = 0;
  for (const p of parcels) {
    const r = recordOf(book, p.id), drawnM2 = (p.area ?? ringAreaAbs(p.ring)) * k2;
    const recordM2 = r && r.recordArea !== null ? toM2(r.recordArea, r.areaUnit) : null;
    const row = { parcel: p.id, name: p.name, record: r ? r.id : null, ref: r ? r.ref : '', drawnM2, recordM2, diffM2: recordM2 === null ? null : drawnM2 - recordM2, pct: recordM2 ? (drawnM2 - recordM2) / recordM2 : null, ok: null };
    drawn += drawnM2;
    if (!r) issues.push({ code: 'norecord', severity: 'note', parcel: p.id });
    else if (recordM2 === null) issues.push({ code: 'noarea', severity: 'note', parcel: p.id, record: r.id });
    else {
      rec += recordM2; compared++;
      row.ok = Math.abs(row.pct) <= tol;
      if (!row.ok) { outside++; issues.push({ code: 'area', severity: 'warning', parcel: p.id, record: r.id, value: row.diffM2, pct: row.pct, at: centroid(p.ring) }); }
    }
    if (p.ring.length >= 4 && selfCrossings(p.ring).length) issues.push({ code: 'crossing', severity: 'warning', parcel: p.id, at: selfCrossings(p.ring)[0].at });
    rows.push(row);
  }
  // neighbours: shared ground, and corners that nearly meet
  const boxes = parcels.map((p) => bbox(p.ring));
  const pairs = Math.min(parcels.length, 600);   // a bound on the pair loop: 600 parcels = 180,000 pairs
  for (let i = 0; i < pairs; i++) for (let j = i + 1; j < pairs; j++) {
    const A = boxes[i], B = boxes[j];
    if (A.maxX + gap < B.minX || B.maxX + gap < A.minX || A.maxY + gap < B.minY || B.maxY + gap < A.minY) continue;
    const a = parcels[i], b = parcels[j], ov = overlapArea(a.ring, b.ring);
    const floor = 1e-9 * Math.min(ringAreaAbs(a.ring), ringAreaAbs(b.ring));
    if (ov > floor && ov * k2 > 1e-6) issues.push({ code: 'overlap', severity: 'warning', parcel: a.id, other: b.id, value: ov * k2 });
    if (gap > 0) {
      const near = [...nearMisses(a.ring, b.ring, gap), ...nearMisses(b.ring, a.ring, gap)];
      if (near.length) { const worst = near.reduce((m, x) => (x.d > m.d ? x : m)); issues.push({ code: 'near', severity: 'warning', parcel: a.id, other: b.id, value: worst.d * unitM, count: near.length, at: worst.at }); }
    }
  }
  const refs = new Map();
  for (const r of book.records) {
    if (r.ref) { const k = r.ref.toLowerCase(); if (refs.has(k)) issues.push({ code: 'dupref', severity: 'warning', record: r.id, other: refs.get(k), ref: r.ref, parcel: r.parcel || undefined }); else refs.set(k, r.id); }
    if (!r.parcel || !parcels.some((p) => p.id === r.parcel)) issues.push({ code: 'noparcel', severity: 'note', record: r.id, ref: r.ref });
  }
  return { rows, issues, totals: { parcels: parcels.length, records: book.records.length, drawnM2: drawn, recordM2: rec, compared, outside, capped: parcels.length > pairs } };
}

export function checkLots(lots, rules) {
  const out = [];
  for (const lot of lots) {
    const rule = rules.find((r) => r.use && r.use.toLowerCase() === String(lot.use || '').toLowerCase()) || rules.find((r) => !r.use);
    if (!rule) continue;
    if (rule.minArea > 0 && lot.areaM2 < rule.minArea - 1e-9) out.push({ code: 'minarea', lot: lot.name, value: lot.areaM2, limit: rule.minArea, use: rule.use });
    if (rule.minFrontage > 0 && lot.frontageM !== null && lot.frontageM !== undefined && lot.frontageM < rule.minFrontage - 1e-9) out.push({ code: 'minfrontage', lot: lot.name, value: lot.frontageM, limit: rule.minFrontage, use: rule.use });
  }
  return out;
}

export function toProblems(issues, words) {
  return issues.slice(0, 500).map((x, i) => ({
    key: [x.code, x.parcel || '', x.other || '', x.record || ''].join(':') || 'i' + i,
    severity: x.severity === 'note' ? 'info' : 'warning',
    title: words(x.code, x),
    ...(x.at ? { at: { x: x.at.x, y: x.at.y } } : {}),
    ...(x.parcel ? { target: { kind: 'parcel', id: x.parcel } } : {}),
  }));
}

export function reconcileCsv(result, unit = 'm2') {
  const f = (v) => (v === null || v === undefined ? '' : Number(fromM2(v, unit).toFixed(unit === 'm2' || unit === 'ft2' ? 2 : 5)));
  const rows = [['parcel', 'reference', 'drawn_' + unit, 'record_' + unit, 'difference_' + unit, 'difference_percent', 'within_your_tolerance']];
  for (const r of result.rows) rows.push([r.name, r.ref, f(r.drawnM2), f(r.recordM2), f(r.diffM2), r.pct === null ? '' : Number((r.pct * 100).toFixed(3)), r.ok === null ? 'not compared' : r.ok ? 'yes' : 'NO']);
  rows.push([], ['issue', 'parcel', 'other', 'value']);
  for (const x of result.issues) rows.push([x.code, x.parcel || x.ref || '', x.other || '', x.value === undefined ? '' : Number(Number(x.value).toFixed(3))]);
  return csvRows(rows);
}
