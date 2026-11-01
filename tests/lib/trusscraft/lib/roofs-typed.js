/* SPDX-License-Identifier: Apache-2.0 */
/**
 * roofs-typed.js — a roof made from typed (or picked) outline corners, for every host app (DOM-free, no app imports).
 *   typedRoof(outline, { pitch, overhang, ends: 'gable' | 'hip', ridge }) → { outline, plan, pitch, overhang } | { error }
 * The roof plan (faces, ridge / hip / valley lines) comes from the straight-skeleton roof geometry BimCraft uses (lib/bim/res-roofplan.js, a
 * byte-identical copy; canonical in bimcraft/dev), so a roof typed in PartCraft gets the same hips and valleys as one drawn in BimCraft.
 */
import { roofGeometry } from './bim/res-roofplan.js';
import { ridgeDirection } from './roofset.js';

const area = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - a[1] * b[0]; } return s / 2; };

export function typedRoof(outline, { pitch = 30, overhang = 450, ends = 'gable', ridge = 'auto' } = {}) {
  if (!Array.isArray(outline) || outline.length < 3 || Math.abs(area(outline)) < 1e6) return { error: 'outline' };
  const poly = area(outline) < 0 ? [...outline].reverse() : outline.map((q) => [q[0], q[1]]);
  const ru = ridgeDirection({ outline: poly, plan: null }, ridge);
  const kinds = poly.map((a, i) => {
    const b = poly[(i + 1) % poly.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, d = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
    return ends === 'gable' && Math.abs(d[0] * ru[0] + d[1] * ru[1]) < 0.05 ? { kind: 'gable', pitch: null, overhang } : { kind: 'pitch', pitch, overhang };
  });
  if (!kinds.some((k) => k.kind === 'pitch')) return { error: 'roofplan' };
  const plan = roofGeometry(poly, kinds, { plate: 0 });
  if (plan.error) return { error: 'roofplan' };
  return { outline: poly, plan, pitch, overhang };
}
