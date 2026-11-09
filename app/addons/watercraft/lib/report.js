/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: DOM-free engine */
/**
 * report.js — the analyses as tables (0.9 WN.6): one CSV writer (RFC 4180 quoting, and a leading = + - @ is neutralised so a spreadsheet
 * never runs a name as a formula) and the row builders for fire flow, criticality, quality and demand.
 */
const cell = (v) => {
  if (v == null) return '';
  let s = typeof v === 'number' ? (Number.isFinite(v) ? String(Math.round(v * 1e6) / 1e6) : '') : String(v);
  if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
export const toCsv = (header, rows) => [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';

export const fireCsv = (res, u = {}) => toCsv(['Node', 'Name', 'Available flow' + (u.q ? ' (' + u.q + ')' : ''), 'Needed', 'Residual', 'Pressure at needed flow', 'System minimum at needed flow', 'Limited by', 'Result'],
  res.rows.map((r) => [r.id, r.name, r.available, res.needed, res.residual, r.pressureAtNeeded, r.systemMinAtNeeded, r.limitedBy, r.pass ? 'meets' : 'short']));
export const criticalCsv = (res) => toCsv(['Outage', 'Name', 'Pipes closed', 'Demand cut off', 'Nodes cut off', 'Nodes newly under minimum', 'Lowest pressure left'],
  res.rows.map((r) => [r.id, r.name, r.closed, r.unservedDemand, r.unservedNodes.join(' '), r.lowNodes, r.minPressure]));
export const qualityCsv = (res) => toCsv(['Node', 'Last step', 'Highest in the last day', 'Lowest in the last day'],
  [...res.nodes].map(([id, n]) => [id, n.last, n.max, n.min]));
export const demandCsv = (alloc) => toCsv(['Node', 'Demand', 'Loads'], [...alloc.demands].filter(([, v]) => v > 0).map(([id, v]) => [id, v, (alloc.perNode.get(id) || []).map((p) => p.load).join(' ')]));
