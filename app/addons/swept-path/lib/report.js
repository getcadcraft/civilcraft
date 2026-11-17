/* SPDX-License-Identifier: Apache-2.0 */
/** report.js — the numbers a run and its clearance check put on paper (SW.5): a summary object and a CSV with a formula guard. Empty stays empty. */
import { fin } from './geom.js';

export function summary(result, clear, { vehicle = null, units = 'm', margin = 0 } = {}) {
  const u = units === 'ft' ? 'ft' : 'm';
  const art = (result?.maxArt || []).filter(fin);
  return {
    vehicle: vehicle?.name || null, kind: result?.kind || null, units: u, length: fin(result?.length) ? result.length : null, steps: result?.frames?.length || 0,
    maxSteer: fin(result?.maxSteer) && result.kind !== 'rail' ? result.maxSteer : null, steerLimit: result?.limit?.steer || null,
    maxArticulation: art.length ? Math.max(...art) : null, articulationLimit: (result?.limit?.art || []).filter(fin).length ? Math.min(...result.limit.art.filter(fin)) : null,
    swath: result?.envelope && fin(result.envelope.area) && result.length > 0 ? result.envelope.area / result.length : null,
    problems: (result?.problems || []).map((p) => ({ kind: p.kind, s: p.s, value: p.value, limit: p.limit })),
    conflicts: clear ? clear.conflicts.map((c) => ({ name: c.name, s: c.s, distance: c.distance })) : null, margin, verified: vehicle ? vehicle.verified === true : null,
  };
}
const q = (v) => { const s = v == null ? '' : String(v); return /^[=+\-@\t\r]/.test(s) ? "'" + s : s; };
const cell = (v) => { const s = q(v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
export function csv(sum) {
  const rows = [['item', 'value', 'unit'], ['vehicle', sum.vehicle, ''], ['vehicle figures verified', sum.verified === null ? '' : sum.verified ? 'yes' : 'NO (placeholder)', ''], ['path length', sum.length, sum.units],
    ['steps', sum.steps, ''], ['max steer', sum.maxSteer, 'deg'], ['steer limit', sum.steerLimit, 'deg'], ['max articulation', sum.maxArticulation, 'deg'], ['articulation limit', sum.articulationLimit, 'deg'],
    ['swath width (area / length)', sum.swath, sum.units], ['clearance margin', sum.margin, sum.units]];
  for (const p of sum.problems) rows.push(['problem: ' + p.kind, p.value, 'at ' + (fin(p.s) ? p.s.toFixed(2) : '') + ' ' + sum.units]);
  for (const c of sum.conflicts || []) rows.push(['conflict: ' + c.name, c.distance, 'at ' + (fin(c.s) ? c.s.toFixed(2) : '') + ' ' + sum.units]);
  return rows.map((r) => r.map(cell).join(',')).join('\n') + '\n';
}
