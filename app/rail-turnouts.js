/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rail-turnouts.js — turnouts and crossovers placed ON a railway alignment (CV.1, 2026-11-12). turnout.js is the geometry of one
 * turnout in its own axes; this puts it at a station of an alignment, in project units and coordinates, and gives the plan, the
 * 3D view, LandXML, IFC and Problems one record to read. No DOM. Tested by bin/test-civilcraft-railline.mjs.
 * Placeholder geometry (turnout.js): the railway's standard and the maker's drawing govern a built turnout.
 *
 *   placeTurnout(al, t, { units, rail, tail }) → placed | { ok: false, problems }
 *     t: a geo.turnouts item { id, name, n, gauge (m), side 'L'|'R', switchLength (m), switchAngle (rad), station, spacing (m; > 0 = a crossover) }
 *     placed: { ok, id, name, n, side, theta, beta, R (project units), lead, toeSta, frogSta, endSta, toe {x,y,dir}, frog {x,y},
 *               centre: [{x,y}] (the diverging centreline from the toe, past the frog by `tail`), stas: [the main line's station abreast of each centre point], rails: [[{x,y}], [{x,y}]] (its two rails),
 *               speed (km/h on the diverging route, from the closure radius and the cant deficiency limit), crossover: null |
 *               { spacing, straight, length, centre: [{x,y}] (toe on this track to toe on the other), far: { toeSta, x, y } },
 *               branch: { pis: [{x,y}, {x,y,r}, {x,y}] } (the diverging route as an alignment's PIs: switch straight, closure curve, on at the frog angle) }
 *   placeAll(al, list, alignmentId, o) → [placed]   every turnout of geo.turnouts on that alignment (show 'no' ones too: Problems still reads them)
 *   turnoutChecks(al, prof, plan, placed, { id, name, speed, t }) → warnings (Problems shape): rail.turnout.geometry, .range, .curve, .cant,
 *     .vertical, .overlap, and the note rail.turnout.speed
 *   turnoutSceneItems(placed, { unitPerMm, label }) → plan items on C-RAIL-TURN (rails, centreline dashed, toe and frog ticks, a label)
 *   turnoutLines3d(placed, zAt) → [{ pts: [{x,y,z}] }] the diverging rails at the main track's top of rail abreast of each point
 */

import { t as tr } from './i18n.js';
import { LAYERS } from './scene.js';
import { turnout, crossover, divergingSpeed } from './turnout.js';
import { baseOf, cantAt, toM } from './rail.js';

if (!LAYERS.some((l) => l.name === 'C-RAIL-TURN')) LAYERS.push({ name: 'C-RAIL-TURN', token: 'orange', aci: 30, get label() { return tr('scene.layer.railturn'); } });

const fin = (v) => typeof v === 'number' && Number.isFinite(v);

export function placeTurnout(al, t, { units = 'm', rail = null, tail = null } = {}) {
  if (!al?.ok || !t) return { ok: false, id: t?.id, name: t?.name, problems: [{ code: 'tur.noalignment' }] };
  const k = toM(1, units), g = { n: t.n, gauge: t.gauge, switchLength: t.switchLength, switchAngle: t.switchAngle };
  const X = t.spacing > 0 ? crossover({ ...g, side: t.side, spacing: t.spacing }) : null, T = X ? X.turnout : turnout({ ...g, side: t.side });
  if (!T.ok) return { ok: false, id: t.id, name: t.name, station: t.station, problems: T.problems };
  const sta = fin(t.station) ? t.station : al.start, at = al.pointAt(Math.min(al.end, Math.max(al.start, sta)));
  const c = Math.cos(at.dir), s = Math.sin(at.dir), W = (x, y) => ({ x: at.x + (c * x - s * y) / k, y: at.y + (s * x + c * y) / k });   // local metres (x along, y left) → project
  const sg = t.side === 'R' ? -1 : 1, th = T.theta, lead = T.lead / k;
  const tl = (tail ?? (X && X.ok ? 0 : T.lead * 0.5));   // metres past the frog
  const local = [...T.centre]; if (tl > 0) local.push({ x: T.tfp.x + tl * Math.cos(th), y: T.tfp.y + sg * tl * Math.sin(th) });
  // the two rails of the diverging route: half the gauge either side of its centreline (offset along each point's normal)
  const h = t.gauge / 2, off = (d) => local.map((p, i) => { const a = local[Math.max(0, i - 1)], b = local[Math.min(local.length - 1, i + 1)], L = Math.hypot(b.x - a.x, b.y - a.y) || 1; return W(p.x - ((b.y - a.y) / L) * d, p.y + ((b.x - a.x) / L) * d); });
  const base = rail ? baseOf(rail) : 1500, defLim = rail?.limits?.deficiency ?? 100;
  const out = { ok: true, id: t.id, name: t.name, n: t.n, side: t.side, gauge: t.gauge / k, theta: th, beta: T.beta, R: T.R / k, lead, toeSta: sta, frogSta: sta + lead, endSta: sta + lead,
    toe: { x: at.x, y: at.y, dir: at.dir }, frog: W(T.tfp.x, T.tfp.y), centre: local.map((p) => W(p.x, p.y)), stas: local.map((p) => sta + p.x / k), rails: [off(h), off(-h)],
    speed: divergingSpeed(T.R, { cant: 0, deficiency: defLim, rail: base }), crossover: null, problems: [], show: t.show !== 'no' };
  // the diverging route as an alignment: the switch straight at β, the closure curve of radius R, then straight on at the frog angle
  const Tt = T.R * Math.tan((th - T.beta) / 2), d1 = t.switchLength + Tt, run = Math.max(tl, T.lead);
  const pi = { x: d1 * Math.cos(T.beta), y: sg * d1 * Math.sin(T.beta) }, end = { x: pi.x + (Tt + run) * Math.cos(th), y: pi.y + sg * (Tt + run) * Math.sin(th) };
  out.branch = { pis: [{ x: at.x, y: at.y }, { ...W(pi.x, pi.y), r: T.R / k }, W(end.x, end.y)] };
  if (X) {
    if (!X.ok) out.problems.push(...X.problems);
    else {
      // the second turnout is the first turned half a turn about the crossover's middle: (x, y) → (length − x, side·spacing − y)
      const far = T.centre.map((p) => ({ x: X.length - p.x, y: sg * X.spacing - p.y })).reverse();
      out.crossover = { spacing: X.spacing / k, straight: X.straight / k, length: X.length / k, centre: [...T.centre, ...far].map((p) => W(p.x, p.y)), far: { toeSta: sta + X.length / k, ...W(X.length, sg * X.spacing) } };
      out.rails = [h, -h].map((d) => { const L2 = [...T.centre, ...far]; return L2.map((p, i) => { const a = L2[Math.max(0, i - 1)], b = L2[Math.min(L2.length - 1, i + 1)], L = Math.hypot(b.x - a.x, b.y - a.y) || 1; return W(p.x - ((b.y - a.y) / L) * d, p.y + ((b.x - a.x) / L) * d); }); });
      out.centre = out.crossover.centre; out.stas = [...T.centre, ...far].map((p) => sta + p.x / k); out.endSta = out.crossover.far.toeSta;
    }
  }
  return out;
}

export function placeAll(al, list, alignmentId, o = {}) {
  return (list || []).filter((t) => t && t.alignment === alignmentId).map((t) => placeTurnout(al, t, o));
}

export function turnoutChecks(al, prof, plan, placed, { id = '', name = '', speed = null, t = tr } = {}) {
  const warnings = [];
  if (!al?.ok) return warnings;
  const n1 = (x) => String(Math.round(x * 10) / 10), n0 = (x) => String(Math.round(x));
  const warn = (code, severity, part, vars, extra = {}) => {
    const msg = { key: code, vars: { name, ...vars } };
    warnings.push({ code, severity, text: t(code, msg.vars), hard: false, msg, ref: id, about: { kind: 'alignment', id }, part, ...extra });
  };
  const good = [];
  for (const p of placed || []) {
    const tn = p.name || p.id || '';
    if (!p.ok) { warn('rail.turnout.geometry', 'warning', 'tu-' + p.id, { turnout: tn }); continue; }
    for (const q of p.problems || []) if (q.code === 'tur.spacing') warn('rail.turnout.spacing', 'warning', 'tu-' + p.id + '-sp', { turnout: tn });
    const a = p.toeSta, b = p.endSta;
    if (a < al.start - 1e-6 || b > al.end + 1e-6) { warn('rail.turnout.range', 'warning', 'tu-' + p.id + '-range', { turnout: tn, from: n0(a), to: n0(b) }); continue; }
    good.push(p);
    const bent = (al.elements || []).find((e) => e.type !== 'line' && Math.min(e.sta + e.len, b) - Math.max(e.sta, a) > 1e-6);
    if (bent) warn('rail.turnout.curve', 'warning', 'tu-' + p.id + '-curve', { turnout: tn, sta: n0(a) });
    else if (plan && [a, (a + b) / 2, b].some((s) => Math.abs(cantAt(plan, s).E) > 1e-6)) warn('rail.turnout.cant', 'warning', 'tu-' + p.id + '-cant', { turnout: tn, sta: n0(a) });
    const vc = prof?.ok ? prof.curves.find((c) => Math.min(c.evc, b) - Math.max(c.bvc, a) > 1e-6) : null;
    if (vc) warn('rail.turnout.vertical', 'warning', 'tu-' + p.id + '-vert', { turnout: tn, pvi: vc.i + 1 });
    if (speed > 0 && p.speed < speed - 0.5) warn('rail.turnout.speed', 'note', 'tu-' + p.id + '-speed', { turnout: tn, v: n0(p.speed), line: n0(speed), r: n1(p.R) }, { value: p.speed, unit: 'km/h' });
  }
  good.sort((x, y) => x.toeSta - y.toeSta);
  for (let i = 1; i < good.length; i++) if (good[i].toeSta < good[i - 1].endSta - 1e-6) warn('rail.turnout.overlap', 'warning', 'tu-' + good[i - 1].id + '-' + good[i].id, { a: good[i - 1].name || good[i - 1].id, b: good[i].name || good[i].id });
  return warnings;
}

/** Plan items: the diverging rails, its centreline (dashed), a tick across the track at the switch toe and at the frog, and a label. */
export function turnoutSceneItems(placed, { unitPerMm = 1, label = (p) => '1:' + p.n } = {}) {
  const out = [];
  for (const p of placed || []) {
    if (!p.ok || !p.show) continue;
    for (const r of p.rails) out.push({ layer: 'C-RAIL-TURN', kind: 'poly', pts: r, of: p.id });
    out.push({ layer: 'C-RAIL-TURN', kind: 'poly', dashed: true, pts: p.centre, of: p.id });
    const nx = -Math.sin(p.toe.dir), ny = Math.cos(p.toe.dir), w = p.gauge;
    const tick = (q) => out.push({ layer: 'C-RAIL-TURN', kind: 'poly', pts: [{ x: q.x - nx * w, y: q.y - ny * w }, { x: q.x + nx * w, y: q.y + ny * w }], of: p.id });
    tick(p.toe); tick(p.frog);
    const sg = p.side === 'R' ? -1 : 1, off = 3 * unitPerMm + w;
    out.push({ layer: 'C-RAIL-TURN', kind: 'text', x: p.toe.x - sg * nx * off, y: p.toe.y - sg * ny * off, mm: 2, rot: p.toe.dir, text: label(p), align: 'left', of: p.id });
  }
  return out;
}

/** 3D: the diverging rails at the main track's top of rail (zAt(station) → z | null); stations by the distance run from the toe. */
export function turnoutLines3d(placed, zAt) {
  const out = [];
  for (const p of placed || []) {
    if (!p.ok || !p.show) continue;
    for (const r of p.rails) {
      const pts = [];
      r.forEach((q, i) => { const z = zAt(p.stas[i]); if (fin(z)) pts.push({ x: q.x, y: q.y, z }); });
      if (pts.length > 1) out.push({ id: p.id, pts });
    }
  }
  return out;
}
