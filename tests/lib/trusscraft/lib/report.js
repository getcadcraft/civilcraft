/* SPDX-License-Identifier: Apache-2.0 */
/**
 * report.js — the member list, cut list and joint schedule as CSV (DOM-free; pure). Each file ends with the not-a-design label.
 *   memberCsv(design) · cutCsv(design, qtyPerTruss) · jointCsv(design) · layoutCsv(layout)
 */
import { csv } from './core.js';
import { DISCLAIMER, PLATE_LABEL } from './tables.js';

const n = (x, d = 1) => (Number.isFinite(x) ? Math.round(x * 10 ** d) / 10 ** d : '');

export function memberCsv(d) {
  const byMark = new Map((d.rows || []).map((r) => [r.mark, r]));
  const rows = [['mark', 'role', 'size', 'node_length_mm', 'angle_deg', 'force_kN (+ tension)', 'kind', 'utilisation', 'force_max_kN', 'force_min_kN', 'governing_combination', 'bending_stress_MPa', 'bending_checked'],
    ...d.list.map((m) => { const r = byMark.get(m.mark) || {}; return [m.mark, m.role, m.size, m.nodeLen, m.angle, m.force === null ? '' : n(m.force, 2), m.kind, m.util === null ? '' : m.util, n(r.forceMax, 2), n(r.forceMin, 2), r.combo || '', r.fb > 0 ? n(r.fb, 1) : '', r.fb > 0 ? (r.bendChecked ? 'yes' : 'NO: no Fb in the species table') : '']; })];
  if (d.comboDefs) rows.push([], ['combinations', d.comboDefs.map((c) => `${c.name}: ${c.fD}D + ${c.fS}S + ${c.fW}W + ${c.fU}U, duration ${c.CD}`).join(' | ')]);
  rows.push([], ['note', DISCLAIMER]);
  return csv(rows);
}

/** qty = how many trusses of this design the roof has. */
export function cutCsv(d, qty = 1) {
  const rows = [['mark', 'role', 'size', 'qty_per_truss', 'qty_total', 'cut_length_mm', 'node_length_mm', 'end_A_deg_from_square', 'end_B_deg_from_square', 'notes'],
    ...d.cut.map((c) => [c.mark, c.role, c.size, c.qty, c.qty * qty, c.cutLen, c.nodeLen, c.cutA, c.cutB, c.notes])];
  rows.push([], ['note', 'Lengths are long point to long point along the centre-line; check them against the plate layout.'], ['note', DISCLAIMER]);
  return csv(rows);
}

export function jointCsv(d) {
  const rows = [['joint', 'x_mm', 'z_mm', 'members (mark @ deg: kN)', 'largest_force_kN', 'plate_indicative', 'plate_kN_indicative', 'status', 'plate_table'],
    ...d.joints.map((j) => [j.node + 1, j.x, j.z, j.members.map((m) => `${m.mark} @${m.angle}: ${m.force === null ? '' : n(m.force, 1)}`).join(' | '), j.maxForce, j.plate || '', j.plateKN ?? '', j.beyond ? (j.source === 'yours' ? 'beyond your table: engineered' : 'beyond the placeholder series: engineered') : (j.source === 'yours' ? 'from your table, not checked for teeth or net section' : 'INDICATIVE'), j.tableLabel || 'Placeholder, not a manufacturer value'])];
  rows.push([], ['note', d.plates ? 'Plates from your table "' + d.plates.label + '": capacities as you gave them.' : PLATE_LABEL], ['note', DISCLAIMER]);
  return csv(rows);
}

export function layoutCsv(L, designBySpan) {
  const rows = [['truss', 'span_mm', 'station_mm', 'start_x_mm', 'start_y_mm', 'end_x_mm', 'end_y_mm', 'end_truss', 'type', 'form', 'base_height_mm']];
  for (const t of L.trusses) rows.push([t.id, t.span, n(t.u), t.a[0], t.a[1], t.b[0], t.b[1], t.end ? 'yes' : '', (designBySpan(t.span, t)?.g.type) || '', t.kind || '', t.zBase || 0]);
  rows.push([], ['note', DISCLAIMER]);
  return csv(rows);
}

/** The whole set: one block per distinct design with the count of trusses of it. designs: Map(key → design) from setdesign.designSet. */
export function setCutCsv(L, designs, names = {}) {
  const rows = [['design', 'form', 'trusses', 'mark', 'role', 'size', 'qty_per_truss', 'qty_total', 'cut_length_mm', 'node_length_mm', 'end_A_deg_from_square', 'end_B_deg_from_square', 'notes']];
  for (const g of L.groups) {
    const d = designs.get(g.key);
    if (!d || !d.ok) { rows.push([g.key, g.kind, g.ids.length, 'NOT GENERATED']); continue; }
    for (const c of d.cut) rows.push([`${g.kind} ${g.span} mm (${g.ids.join(' ')})`, g.kind, g.ids.length, c.mark, c.role, c.size, c.qty, c.qty * g.ids.length, c.cutLen, c.nodeLen, c.cutA, c.cutB, c.notes]);
  }
  rows.push([], ['note', 'Lengths are long point to long point along the centre-line; check them against the plate layout.'], ['note', DISCLAIMER]);
  void names;
  return csv(rows);
}
export function setJointCsv(L, designs) {
  const rows = [['design', 'trusses', 'joint', 'members (mark @ deg: kN)', 'largest_force_kN', 'plate', 'plate_kN', 'status', 'plate_table']];
  for (const g of L.groups) {
    const d = designs.get(g.key);
    if (!d || !d.ok) continue;
    for (const j of d.joints) rows.push([`${g.kind} ${g.span} mm`, g.ids.length, j.node + 1, j.members.map((m) => `${m.mark} @${m.angle}: ${m.force === null ? '' : n(m.force, 1)}`).join(' | '), j.maxForce, j.plate || '', j.plateKN ?? '', j.beyond ? 'beyond the table: engineered' : (j.source === 'yours' ? 'from your table' : 'INDICATIVE'), j.tableLabel]);
  }
  rows.push([], ['note', PLATE_LABEL], ['note', DISCLAIMER]);
  return csv(rows);
}
