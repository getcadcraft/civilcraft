/* SPDX-License-Identifier: Apache-2.0 */
/**
 * profile-snap.js — CV.3 (suggestion #1534): what a click in the profile view snaps to, and the slope arithmetic for the PVI table.
 * Pure functions (no DOM), so tests run them under node.
 *
 *   snapCandidates({ eg, pvis, skip }) → [{ sta, z, kind: 'pvi' | 'ground', label }]   points a click can take
 *   snapProfile(sx, sy, { toScreen, toData, eg, pvis, skip, px }) → { sta, z, kind, label } | null
 *       kind 'pvi' / 'ground' = a point (both values), 'station' = the station of a PVI with the pointer's elevation,
 *       'groundline' = the pointer's station with the existing ground's elevation there. `px` = reach in screen pixels.
 *   slopeOut(pvis, i) → the grade (rise / run, a fraction) of the tangent from PVI i to PVI i + 1, null on the last
 *   setSlope(pvis, i, g) → { ok, moved, message } changes pvis[i + 1].z (or pvis[i].z when that one is locked): the stations never move;
 *       a locked PVI is never moved; both locked = refused.
 */

export function snapCandidates({ eg, pvis, skip = -1 }) {
  const out = [];
  (pvis || []).forEach((v, i) => { if (i !== skip) out.push({ sta: v.sta, z: v.z, kind: 'pvi', label: 'PVI ' + (i + 1) }); });
  for (const p of eg || []) if (p.z !== null && Number.isFinite(p.z)) out.push({ sta: p.sta, z: p.z, kind: 'ground', label: '' });
  return out;
}

export function groundZ(eg, sta) {
  for (let i = 1; i < (eg || []).length; i++) if (sta <= eg[i].sta) {
    const a = eg[i - 1], b = eg[i];
    if (a.z === null || b.z === null || sta < a.sta) return null;
    return a.z + ((b.z - a.z) * (sta - a.sta)) / Math.max(b.sta - a.sta, 1e-12);
  }
  return null;
}

export function snapProfile(sx, sy, { toScreen, toData, eg, pvis, skip = -1, px = 10, labels = {} }) {
  let best = null, bd = px;
  for (const c of snapCandidates({ eg, pvis, skip })) {
    const s = toScreen(c.sta, c.z), d = Math.hypot(s.x - sx, s.y - sy);
    if (d < bd) { bd = d; best = { ...c, label: c.kind === 'pvi' ? (labels.pvi || 'PVI') + c.label.slice(3) : (labels.ground || '') }; }
  }
  if (best) return best;
  const d = toData(sx, sy);
  // the station of another PVI (a vertical guide), keeping the pointer's elevation
  let bx = px, st = null;
  (pvis || []).forEach((v, i) => { if (i === skip) return; const dx = Math.abs(toScreen(v.sta, d.z).x - sx); if (dx < bx) { bx = dx; st = { sta: v.sta, z: d.z, kind: 'station', label: labels.station || '' }; } });
  if (st) return st;
  const gz = groundZ(eg, d.sta);
  if (gz !== null && Math.abs(toScreen(d.sta, gz).y - sy) < px) return { sta: d.sta, z: gz, kind: 'groundline', label: labels.groundline || '' };
  return null;
}

export function slopeOut(pvis, i) {
  const a = pvis[i], b = pvis[i + 1];
  if (!a || !b || !(b.sta > a.sta)) return null;
  return (b.z - a.z) / (b.sta - a.sta);
}

export function setSlope(pvis, i, g) {
  const a = pvis[i], b = pvis[i + 1];
  if (!a || !b || !Number.isFinite(g) || !(b.sta > a.sta)) return { ok: false, moved: -1, message: 'bad' };
  const dz = g * (b.sta - a.sta);
  if (!b.locked) { b.z = Number((a.z + dz).toFixed(2)); return { ok: true, moved: i + 1 }; }
  if (!a.locked) { a.z = Number((b.z - dz).toFixed(2)); return { ok: true, moved: i }; }
  return { ok: false, moved: -1, message: 'locked' };
}
