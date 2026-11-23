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

/** Where on the drawing a run problem happened (SW.5, for Problems' jump-to): the middle of the first body of the frame nearest station s, or null. */
export function positionAt(result, s) {
  const F = result?.frames; if (!F?.length || !fin(s)) return null;
  let best = F[0], bd = Infinity; for (const f of F) { const d = Math.abs(f.s - s); if (d < bd) { bd = d; best = f; } }
  const b = best.bodies?.[0]; if (!b?.length) return null;
  return { x: b.reduce((a, p) => a + p.x, 0) / b.length, y: b.reduce((a, p) => a + p.y, 0) / b.length };
}

/** The report as one Markdown page (SW.5, for the binder / PDF kit: lib/report parseMarkdown + docPdf). Empty fields print "not set", nothing is invented. L = optional label overrides. */
export function markdown(sum, L = {}) {
  const u = sum.units, f = (v, d = 2) => (fin(v) ? (+v).toFixed(d) : null), n = (v, unit = '') => (v == null ? '*not set*' : v + (unit ? ' ' + unit : ''));
  const md = (x) => String(x ?? '').replace(/[\\`*_{}\[\]<>|]/g, (c) => '\\' + c).replace(/[\r\n]+/g, ' ');
  const out = ['# ' + md(L.title || 'Swept path report'), ''];
  out.push('**Vehicle:** ' + (sum.vehicle ? md(sum.vehicle) : '*not set*') + (sum.verified === false ? '  (**placeholder figures, not checked against a standard**)' : sum.verified ? '  (figures checked)' : ''), '');
  out.push('| Item | Value |', '| --- | --- |');
  const rows = [['Path length', n(f(sum.length), u)], ['Steps', String(sum.steps)], ['Largest steering angle', n(f(sum.maxSteer, 1), 'deg') + (sum.steerLimit ? ' of ' + f(sum.steerLimit, 0) + ' deg' : '')],
    ['Largest hitch angle', n(f(sum.maxArticulation, 1), 'deg') + (sum.articulationLimit ? ' of ' + f(sum.articulationLimit, 0) + ' deg' : '')], ['Swath width', n(f(sum.swath), u)], ['Clearance margin', n(f(sum.margin), u)]];
  for (const [a, b] of rows) out.push('| ' + a + ' | ' + b + ' |');
  out.push('');
  out.push('## Problems', '');
  if (sum.problems?.length) for (const p of sum.problems) out.push('- ' + md(p.kind) + (fin(p.s) ? ' at ' + f(p.s) + ' ' + u : '') + (fin(p.value) ? ': ' + f(p.value, 1) + (fin(p.limit) ? ' against a limit of ' + f(p.limit, 1) : '') : ''));
  else out.push('None found by the run.');
  out.push('', '## Clearance', '');
  if (sum.conflicts == null) out.push('*Not checked.*');
  else if (!sum.conflicts.length) out.push('No conflicts with the chosen obstacles.');
  else for (const c of sum.conflicts) out.push('- ' + md(c.name) + ' at ' + f(c.s) + ' ' + u + ', distance ' + f(c.distance));
  out.push('', '*A planning aid: the engineer decides. No dynamics, braking, speed or driver behaviour.*', '');
  return out.join('\n');
}
