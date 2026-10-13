/* SPDX-License-Identifier: Apache-2.0 */
/**
 * point-edit.js — edit one survey point at a time (0.4 V2). No DOM; the Node test drives it (bin/test-civilcraft-points.mjs).
 *
 *   checkPointEdit(points, n, patch) → { ok, point, errors: { field: message }, message }
 *       patch: any of { n, x, y, z, d } as numbers or as typed text ('' elevation = none). Untrusted: the number must be
 *       1–40 characters and not taken by another point, coordinates finite and |v| < 1e9, an elevation finite and
 *       |z| < 1e6 (or empty), a description ≤ 200 characters (control characters become spaces). `point` is the new
 *       object (never the old one changed). ok false with no errors = nothing changed.
 *   editPoint(project, n, patch, { label }) → the same result; on ok it is ONE undo step (project.editPoints) that
 *       replaces the point and moves every drawn breakline vertex that sat on the point's old spot (the Breakline tool
 *       copies the points it is drawn through) to the new place and elevation. result.followed = how many vertices.
 *   movePoint(project, n, x, y) = editPoint(project, n, { x, y }, { label: 'Move point n' }).
 */

import { t } from './i18n.js';

const CTRL = /[\u0000-\u001f\u007f]/g;
const LIMIT_XY = 1e9, LIMIT_Z = 1e6;

function numberOf(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  const s = String(v ?? '').trim().replace(/,/g, '');
  return /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s) ? Number(s) : NaN;
}

export function checkPointEdit(points, n, patch = {}) {
  const i = points.findIndex((p) => p.n === n);
  if (i < 0) return { ok: false, errors: { n: t('pt.edit.gone', { n }) }, message: t('pt.edit.gone', { n }) };
  const old = points[i], next = { ...old }, errors = {};
  if ('n' in patch) {
    const v = String(patch.n ?? '').replace(CTRL, '').trim();
    if (!v) errors.n = t('pt.edit.n.empty');
    else if (v.length > 40) errors.n = t('pt.edit.n.long');
    else if (v !== old.n && points.some((p) => p.n === v)) errors.n = t('pt.edit.n.taken', { n: v });
    else next.n = v;
  }
  for (const k of ['x', 'y']) {
    if (!(k in patch)) continue;
    const v = numberOf(patch[k]);
    if (!Number.isFinite(v) || Math.abs(v) >= LIMIT_XY) errors[k] = t('pt.edit.coord');
    else next[k] = v;
  }
  if ('z' in patch) {
    const raw = patch.z;
    if (raw === null || (typeof raw === 'string' && raw.trim() === '')) next.z = null;
    else {
      const v = numberOf(raw);
      if (!Number.isFinite(v) || Math.abs(v) >= LIMIT_Z) errors.z = t('pt.edit.z');
      else next.z = v;
    }
  }
  if ('d' in patch) {
    const v = String(patch.d ?? '').replace(CTRL, ' ').trim();
    if (v.length > 200) errors.d = t('pt.edit.d.long');
    else next.d = v;
  }
  if (Object.keys(errors).length) return { ok: false, errors, message: Object.values(errors)[0] };
  if (next.n === old.n && next.x === old.x && next.y === old.y && next.z === old.z && (next.d || '') === (old.d || '')) return { ok: false, errors: {}, message: '' };
  return { ok: true, index: i, old, point: next, errors: {}, message: '' };
}

export function editPoint(project, n, patch, { label } = {}) {
  const r = checkPointEdit(project.points, n, patch);
  if (!r.ok) return r;
  const { old, point, index } = r;
  let followed = 0;
  const moved = point.x !== old.x || point.y !== old.y || point.z !== old.z;
  project.editPoints(label || t('pt.edit.undo', { n: old.n }), (pts, s) => {
    pts[index] = point;
    if (moved) {
      for (const b of s.surface.breaklines) {
        for (const v of b.pts) {
          if (v.x !== old.x || v.y !== old.y) continue;
          v.x = point.x; v.y = point.y;
          if (point.z !== null) v.z = point.z;
          followed++;
        }
      }
    }
    return pts;
  });
  const parts = [t('pt.edit.done', { n: point.n })];
  if (point.n !== old.n) parts.push(t('pt.edit.renumbered', { from: old.n, to: point.n }));
  if (followed) parts.push(t('pt.edit.followed', { n: followed }));
  if (moved && point.z === null && followed) parts.push(t('pt.edit.no.z'));
  if (project.state.surface.tin) parts.push(t('pt.edit.tin'));
  return { ...r, followed, message: parts.join(' ') };
}

export function movePoint(project, n, x, y) {
  return editPoint(project, n, { x, y }, { label: t('pt.move.undo', { n }) });
}
