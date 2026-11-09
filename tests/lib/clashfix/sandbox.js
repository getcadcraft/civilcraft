/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sandbox.js — a proposal checked on a copy of the model, never on the model (cc-clashfix, 0.9 EG.42). DOM-free.
 *
 * A PROPOSAL: { id, clash (pair key), discipline, by: 'rules' | 'assistant', client?, title: { key, vars }, why?: string, actions: [action] }
 * An ACTION (mm, the host's frame, z up):
 *   { op: 'shift', element, dx, dy, dz }                     a whole run moves (its fixed ends must not be fixed to equipment)
 *   { op: 'crossover', element, segment, from, to, dz }      a detour on one leg: up (dz > 0) or down, between `from` and `to` mm along
 *                                                            the leg's plan length from its first point
 *   { op: 'resize', element, w, h }                          a rectangular duct made flatter or narrower, its area kept
 *   { op: 'move_column', element, dx, dy }                   a column moved in plan
 *   { op: 'move_wall', element, dx, dy }                     a wall known not to carry load moved in plan
 *   { op: 'opening', element, through, w, h }                a web opening in a beam, a hole in a slab or a sleeve in a wall for `through`
 *
 *   validate(model, proposal, limits) → [refusal]           { code, element, vars } — empty = allowed. Codes: unknown_element, not_yours,
 *        not_a_tool, too_far, fixed_end, drain_detour, too_many, bad_leg, not_rect, area, aspect, small, load_bearing, not_through, bad_op, too_tight (no room for the bends: the host's `bend` radius)
 *   applyActions(model, actions) → { elements, allowed, changed: Set, moved, added, fittings, byOp }
 *   checks(before, after, changedIds, actions, limits) → { breaks: [{ rule, element, vars }], notes: [{ key, vars }] }
 *   evaluate(model, proposal, { limits, costs, baseline }) → scored proposal (see below) or { ok: false, refused }
 *
 * model = { elements: [element], allowed?: Set(pair key) }  (geom.js for the element shapes)
 */
import { findClashes, pairKey, pathLength, piecesOf, boxOf, gapBetween, runVertices, nearest, halfSection } from './geom.js';
import { DISCIPLINES, ownerOf, isDrain, LIMITS, COSTS } from './disciplines.js';

const byId = (model) => { if (!model._by || model._byN !== model.elements.length) { model._by = new Map(model.elements.map((e) => [e.id, e])); model._byN = model.elements.length; } return model._by; };
const num = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);
const clone = (e) => ({ ...e, path: e.path ? e.path.map((p) => p.slice()) : undefined, box: e.box ? e.box.slice() : undefined, section: e.section ? { ...e.section } : undefined });

/** Plan length of leg `i` of a run's stored points, and the point `s` mm along it (z of the leg's first point plus the leg's own climb). */
function legAt(e, i, s) {
  const a = e.path[i], b = e.path[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const t = L > 0 ? s / L : 0;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
export const legLength = (e, i) => Math.hypot(e.path[i + 1][0] - e.path[i][0], e.path[i + 1][1] - e.path[i][1]);

export function validate(model, p, limits = LIMITS) {
  const out = [], by = byId(model), d = p.discipline, def = DISCIPLINES[d];
  const no = (code, element, vars = {}) => out.push({ code, element, vars });
  if (!def) { no('not_a_tool', null, { discipline: String(d) }); return out; }
  if (!Array.isArray(p.actions) || !p.actions.length) { no('bad_op', null); return out; }
  const perRun = new Map();
  for (const a of p.actions) {
    const e = by.get(a && a.element);
    if (!e) { no('unknown_element', a && a.element); continue; }
    if (!def.tools.includes(a.op)) { no('not_a_tool', e.id, { op: String(a.op) }); continue; }
    if (ownerOf(e) !== d) { no('not_yours', e.id, { owner: ownerOf(e) || '?' }); continue; }
    const fixed = Array.isArray(e.fixedEnds) && e.fixedEnds.some(Boolean);
    if (a.op === 'shift') {
      if (!e.path) { no('bad_op', e.id); continue; }
      if (Math.abs(num(a.dz)) > limits.shift.dz || Math.hypot(num(a.dx), num(a.dy)) > limits.shift.dxy) no('too_far', e.id, { max: limits.shift.dz });
      if (fixed) no('fixed_end', e.id);
    } else if (a.op === 'crossover') {
      if (!e.path) { no('bad_op', e.id); continue; }
      if (isDrain(e)) { no('drain_detour', e.id); continue; }
      const i = Math.floor(num(a.segment)), from = num(a.from), to = num(a.to);
      if (!(i >= 0 && i < e.path.length - 1) || !(from >= 0 && to > from + limits.crossover.minLeg / 2 && to <= legLength(e, i) + 0.5)) { no('bad_leg', e.id); continue; }
      if (Math.abs(num(a.dz)) > limits.crossover.rise || Math.abs(num(a.dz)) < 1) no('too_far', e.id, { max: limits.crossover.rise });
      // room for the fittings: each straight piece between two bends is at least two bend radii (the host gives `bend`, mm)
      const B = num(e.bend), L = legLength(e, i);
      if (B && (Math.abs(num(a.dz)) < 2 * B - 0.5 || to - from < 2 * B - 0.5 || (from > 0.5 && from < 2 * B - 0.5) || (L - to > 0.5 && L - to < 2 * B - 0.5))) no('too_tight', e.id, { need: Math.round(2 * B) });
      perRun.set(e.id, (perRun.get(e.id) || 0) + 1);
      if (perRun.get(e.id) > limits.crossover.perRun) no('too_many', e.id, { max: limits.crossover.perRun });
    } else if (a.op === 'resize') {
      if (e.kind !== 'duct' || !e.section || e.section.round) { no('not_rect', e.id); continue; }
      const w = num(a.w), h = num(a.h), A0 = e.section.w * e.section.h;
      if (!(w * h >= A0 * 0.95)) no('area', e.id);
      if (Math.max(w / h, h / w) > limits.resize.aspect) no('aspect', e.id, { max: limits.resize.aspect });
      if (Math.min(w, h) < limits.resize.minSide) no('small', e.id, { min: limits.resize.minSide });
    } else if (a.op === 'move_column') {
      if (e.kind !== 'column') { no('bad_op', e.id); continue; }
      if (Math.hypot(num(a.dx), num(a.dy)) > limits.move_column.dxy) no('too_far', e.id, { max: limits.move_column.dxy });
    } else if (a.op === 'move_wall') {
      if (e.kind !== 'wall') { no('bad_op', e.id); continue; }
      if (e.loadBearing !== false) no('load_bearing', e.id);
      if (Math.hypot(num(a.dx), num(a.dy)) > limits.move_wall.dxy) no('too_far', e.id, { max: limits.move_wall.dxy });
    } else if (a.op === 'opening') {
      const t = by.get(a.through);
      if (!['beam', 'slab', 'wall'].includes(e.kind) || !t || !t.path) { no('not_through', e.id); continue; }
    } else no('bad_op', e.id);
  }
  return out;
}

export function applyActions(model, actions) {
  const by = byId(model), copies = new Map(), allowed = new Set(model.allowed || []);
  let moved = 0, added = 0, fittings = 0;
  const byOp = {};
  const get = (id) => { if (!copies.has(id)) copies.set(id, clone(by.get(id))); return copies.get(id); };
  // crossovers on one leg are applied from the far end back, so the leg's earlier distances stay true
  const order = actions.map((a, i) => [a, i]).sort((x, y) => (x[0].op === 'crossover' && y[0].op === 'crossover' && x[0].element === y[0].element ? (num(y[0].segment) - num(x[0].segment)) || (num(y[0].from) - num(x[0].from)) : x[1] - y[1]));
  for (const [a] of order) {
    if (!by.has(a.element)) continue;
    byOp[a.op] = (byOp[a.op] || 0) + 1;
    if (a.op === 'opening') { allowed.add(pairKey(a.element, a.through)); continue; }
    const e = get(a.element), L0 = e.path ? pathLength(e) : 0;
    if (a.op === 'shift') {
      const d = [num(a.dx), num(a.dy), num(a.dz)];
      e.path = e.path.map((p) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]]);
      moved += Math.hypot(...d);
      fittings += 2;   // where the run meets what it joins now sits elsewhere: an offset at each end
    } else if (a.op === 'crossover') {
      const i = Math.floor(num(a.segment)), dz = num(a.dz);
      const A = legAt(e, i, num(a.from)), B = legAt(e, i, num(a.to));
      const pts = [A, [A[0], A[1], A[2] + dz], [B[0], B[1], B[2] + dz], B];
      e.path.splice(i + 1, 0, ...pts);
      e.path = e.path.filter((p, k, all) => !k || Math.hypot(p[0] - all[k - 1][0], p[1] - all[k - 1][1], p[2] - all[k - 1][2]) > 0.5);
      fittings += 4;
    } else if (a.op === 'resize') {
      e.section = { ...e.section, w: num(a.w), h: num(a.h) };
      fittings += 2;
    } else if (a.op === 'move_column' || a.op === 'move_wall') {
      const dx = num(a.dx), dy = num(a.dy);
      e.box = [e.box[0] + dx, e.box[1] + dy, e.box[2], e.box[3] + dx, e.box[4] + dy, e.box[5]];
      moved += Math.hypot(dx, dy);
    }
    if (e.path) added += pathLength(e) - L0;
  }
  const elements = model.elements.map((e) => copies.get(e.id) || e);
  return { elements, allowed, changed: new Set(copies.keys()), moved, added, fittings, byOp };
}

const planOverlap = (a, b) => Math.min(a[3], b[3]) > Math.max(a[0], b[0]) && Math.min(a[4], b[4]) > Math.max(a[1], b[1]);

export function checks(before, after, changed, actions, limits = LIMITS) {
  const breaks = [], notes = [];
  const B = byId(before), A = new Map(after.elements.map((e) => [e.id, e]));
  const allowed = after.allowed || new Set();
  for (const id of changed) {
    const e = A.get(id), e0 = B.get(id);
    if (!e.path) continue;
    // clearance round the run (insulation is already in its swept size)
    for (const n of nearest(e, after.elements, { within: limits.gap, skip: (o) => (e.group && o.group === e.group) || allowed.has(pairKey(e.id, o.id)) })) {
      if (n.gap > 0.5 && n.gap < limits.gap - 0.5) breaks.push({ rule: 'clearance', element: id, vars: { other: n.id, gap: Math.round(n.gap), need: limits.gap } });
    }
    // headroom: never lower than it was, or than level + headroom when the host knows the level
    if (Number.isFinite(e.level)) {
      const low = (x) => Math.min(...piecesOf(x).map((p) => p[2]));
      const floor = Math.min(low(e0), e.level + limits.headroom);
      if (low(e) < floor - 1) breaks.push({ rule: 'headroom', element: id, vars: { need: limits.headroom, now: Math.round(low(e) - e.level) } });
    }
    if (isDrain(e)) {
      const V = runVertices(e);
      for (let i = 1; i < V.length; i++) if (V[i][2] > V[i - 1][2] + 1) { breaks.push({ rule: 'drain_slope', element: id, vars: {} }); break; }
    }
    if (e.kind === 'tray') {
      const top = boxOf(e);
      for (const o of after.elements) {
        if (o.id === id || (e.group && o.group === e.group)) continue;
        const ob = boxOf(o);
        if (!ob || !planOverlap(top, ob)) continue;
        const clear = ob[2] - top[5];
        if (clear >= 0 && clear < limits.access_above) { breaks.push({ rule: 'access_above', element: id, vars: { other: o.id, gap: Math.round(clear), need: limits.access_above } }); break; }
      }
    }
  }
  for (const a of actions) {
    const e = B.get(a.element);
    if (!e) continue;
    if (a.op === 'opening' && e.kind === 'beam') {
      const t = A.get(a.through), D = e.box[5] - e.box[2], ax = (e.box[3] - e.box[0]) >= (e.box[4] - e.box[1]) ? 0 : 1;
      const tb = piecesOf(t).filter((p) => p[0] < e.box[3] && p[3] > e.box[0] && p[1] < e.box[4] && p[4] > e.box[1] && p[2] < e.box[5] && p[5] > e.box[2]);
      const hole = num(a.h) || (t.section ? (t.section.round ? t.section.w : t.section.h) + 2 * limits.gap : 0);
      if (hole > limits.opening.depthRatio * D + 0.5) breaks.push({ rule: 'web_opening', element: e.id, vars: { what: 'depth', hole: Math.round(hole), max: Math.round(limits.opening.depthRatio * D) } });
      if (tb.length) {
        const c = (Math.max(...tb.map((p) => p[ax])) + Math.min(...tb.map((p) => p[ax + 3]))) / 2;
        const zc = (Math.max(e.box[2], Math.min(...tb.map((p) => p[2]))) + Math.min(e.box[5], Math.max(...tb.map((p) => p[5])))) / 2;
        const fromEnd = Math.min(c - e.box[ax], e.box[ax + 3] - c);
        if (fromEnd < limits.opening.endRatio * D - 0.5) breaks.push({ rule: 'web_opening', element: e.id, vars: { what: 'end', at: Math.round(fromEnd), min: Math.round(limits.opening.endRatio * D) } });
        if (Math.abs(zc - (e.box[2] + e.box[5]) / 2) > limits.opening.centreRatio * D + 0.5) breaks.push({ rule: 'web_opening', element: e.id, vars: { what: 'centre' } });
      }
    }
    if (a.op === 'opening' && e.kind === 'wall' && e.fireRated) notes.push({ key: 'note.fire_stop', vars: { element: e.id } });
    if (a.op === 'move_column') {
      const cb = e.box, c = [(cb[0] + cb[3]) / 2, (cb[1] + cb[4]) / 2], d = [num(a.dx), num(a.dy)];
      for (const o of before.elements) {
        if (o.kind !== 'beam' || !o.box) continue;
        const ob = o.box, ax = (ob[3] - ob[0]) >= (ob[4] - ob[1]) ? 0 : 1, ac = 1 - ax;
        const near = ob[0] <= cb[3] + 50 && ob[3] >= cb[0] - 50 && ob[1] <= cb[4] + 50 && ob[4] >= cb[1] - 50 && ob[2] <= cb[5] + 50 && ob[5] >= cb[5] - 50;   // the beam sits on (or frames into) the column's top
        if (!near) continue;
        const span = ob[ax + 3] - ob[ax], atMax = Math.abs(c[ax] - ob[ax + 3]) < Math.abs(c[ax] - ob[ax]);
        const grow = atMax ? d[ax] : -d[ax];
        if (grow > limits.move_column.spanGrow * span + 0.5) breaks.push({ rule: 'span', element: e.id, vars: { beam: o.id, grow: Math.round(grow), max: Math.round(limits.move_column.spanGrow * span) } });
        if (Math.abs(d[ac]) > 50) breaks.push({ rule: 'span', element: e.id, vars: { beam: o.id, off: Math.round(Math.abs(d[ac])) } });
      }
    }
    if (DISCIPLINES.structure.tools.includes(a.op) && ownerOf(e) === 'structure') notes.push({ key: 'note.engineer', vars: { element: e.id } });
  }
  // one note per key and element
  const seen = new Set();
  return { breaks, notes: notes.filter((n) => { const k = n.key + n.vars.element; if (seen.has(k)) return false; seen.add(k); return true; }) };
}

/**
 * A proposal judged in the sandbox. baseline = the clashes before (list, from findClashes or the host). →
 *   { ...proposal, ok: true, resolved, alsoResolved: [pair], newClashes: [clash], breaks, notes, moved, added, fittings, cost, score, changed: [id] }
 * The score is lower for better: not resolving costs most, then each new clash, then each rule broken, then the cost proxy.
 */
export function evaluate(model, p, { limits = LIMITS, costs = COSTS, baseline = [] } = {}) {
  const refused = validate(model, p, limits);
  if (refused.length) return { ...p, ok: false, refused };
  const after = applyActions(model, p.actions);
  const tol = limits.tolerance;
  const base = new Set(baseline.map((c) => c.id));
  const touched = new Set(after.changed);
  for (const a of p.actions) if (a.op === 'opening') { touched.add(a.element); touched.add(a.through); }
  const now = findClashes(after.elements, { tolerance: tol, among: [...touched], allowed: after.allowed });
  const nowIds = new Set(now.map((c) => c.id));
  const [ta, tb] = String(p.clash || '').split('|');
  const target = !!p.clash && (touched.has(ta) || touched.has(tb)) && !nowIds.has(p.clash);
  // new = clashing now and not before, among the elements it touches (the host's list may cover only some sets; the sandbox sees all)
  const before = new Set(findClashes(model.elements, { tolerance: tol, among: [...touched], allowed: model.allowed }).map((c) => c.id));
  const newClashes = now.filter((c) => !base.has(c.id) && !before.has(c.id));
  const alsoResolved = baseline.filter((c) => c.id !== p.clash && (touched.has(c.a) || touched.has(c.b)) && !nowIds.has(c.id)).map((c) => c.id);
  const { breaks, notes } = checks(model, after, after.changed, p.actions, limits);
  const by = byId(model);
  let cost = 0;
  for (const a of p.actions) {
    const e = by.get(a.element); if (!e) continue;
    cost += costs.fixed[a.op] || 0;
  }
  for (const id of after.changed) {
    const e0 = by.get(id), e1 = after.elements.find((x) => x.id === id), k = e0.kind;
    if (e0.path) cost += Math.max(0, pathLength(e1) - pathLength(e0)) / 1000 * (costs.perMetre[k] || 50);
  }
  const k0 = by.get(p.actions[0].element).kind;
  cost += after.fittings * (costs.perFitting[k0] || 30) + after.moved / 1000 * (costs.perMetreMoved[k0] || 10);
  cost = Math.round(cost);
  const score = (target ? 0 : 100000) + newClashes.length * 10000 + breaks.length * 1000 + cost - alsoResolved.length * 500;
  return { ...p, ok: true, resolved: !!target, alsoResolved, newClashes, breaks, notes, moved: Math.round(after.moved), added: Math.round(after.added), fittings: after.fittings, cost, score, changed: [...after.changed] };
}

export { halfSection, gapBetween };
