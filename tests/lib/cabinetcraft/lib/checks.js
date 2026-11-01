/* SPDX-License-Identifier: Apache-2.0 */
/**
 * checks.js — what is technically wrong with a job, in the shared Problems shape (docs/0.8-PROBLEMS-SPEC.md § 1; house rule 29). DOM-free.
 * Every problem is `{ id, code, severity ('error' | 'warning' | 'note'), text, about: [{ kind, id, label? }], req?, found?, fixes? }` with
 * the words already written (an add-on's words are not in the page catalog): `t(key, vars)` is the add-on's. Ids and codes do not
 * change with the language.
 *
 *   checkJob(build, { nest, estimate, t }) → [problem]
 *   codes: cab.<model code> (too-narrow, too-low, too-shallow, no-slide, drawer-low, fronts-tall, no-size) · run.over · run.gap ·
 *          cab.wall-clearance · cab.too-tall · cab.door-wide · filler.thin · filler.wide · blind.short · counter.long ·
 *          nest.unplaced · est.placeholder · ff.opening · cab.collide · cab.outside · cab.opening · cab.under-window · cab.opening-tight · cab.door-swing ·
 *          corner.misplaced · corner.double · corner.small · corner.drillsize · island.aisle ·
 *          (0.8.2) corner.angle · corner.sharp · corner.wedge · corner.diag · arc.invalid · arc.over · arc.gap · arc.void · arc.wedge · curved.straight · curved.order
 */
import { problems as modelProblems } from './model.js';
import { conv, fmtLen, r6 } from './core.js';
import { footprints, overlap, polyGap } from './footprint.js';
import { blanksOf } from './cornerdrill.js';
import { diagAt } from './angled.js';
import { polyInRoom, distToWalls, openingPoly } from './room.js';

const f1 = (v) => String(Math.round(v * 10) / 10);
const diagFront = (ev, build) => { const c = build.cells.find((x) => x.no === ev.cab.no); return c && c.corner && c.corner.frontLen ? c.corner.frontLen : (c && c.corner ? diagAt(ev.tau, c.cab.w, c.cab.d).front : 0); };
const P = (code, severity, id, text, about, extra = {}) => ({ id: 'cabinetcraft:' + code + ':' + id, code, severity, text, about, ...extra });

export function checkJob(build, { nest = null, est = null, t = (k) => k } = {}) {
  const out = [];
  const { project, R, layout } = build;
  const u = project.unit, U = u === 'in' ? 'in' : 'mm';
  const f = (v) => fmtLen(v, u) + ' ' + U;
  const cabAbout = (c) => [{ kind: 'cabinet', id: c.no, label: c.no }];
  for (const c of build.cells) {
    if (c.kind !== 'cab') continue;
    if (c.bad) { out.push(P('cab.no-size', 'error', c.no, t('prob.cab.no-size', { no: c.no }), cabAbout(c))); continue; }
    for (const pr of modelProblems(c.cab, R)) {
      const key = 'prob.cab.' + pr.code;
      out.push(P('cab.' + pr.code, 'error', c.no, t(key, { no: c.no, ...Object.fromEntries(Object.entries(pr.vars || {}).map(([k, v]) => [k, fmtLen(v, u)])), unit: U }), cabAbout(c),
        pr.vars && pr.vars.min !== undefined ? { req: { op: '>=', value: r6(pr.vars.min), unit: U } } : {}));
    }
    const ceiling = project.room.h;
    const top = c.cab.elev + c.cab.h;
    if (top > ceiling + 1e-6) out.push(P('cab.too-tall', 'error', c.no, t('prob.cab.too-tall', { no: c.no, top: f(top), ceiling: f(ceiling) }), cabAbout(c), { req: { op: '<=', value: ceiling, unit: U }, found: { value: r6(top), unit: U } }));
    for (const fr of c.fronts) if (fr.kind === 'door' && fr.w > R.maxDoorW + 1e-6) {
      out.push(P('cab.door-wide', 'warning', c.no, t('prob.cab.door-wide', { no: c.no, w: f(fr.w), max: f(R.maxDoorW) }), cabAbout(c), { req: { op: '<=', value: R.maxDoorW, unit: U }, found: { value: fr.w, unit: U } }));
      break;
    }
    if (c.blind > 0) {
      // the blind part must reach past the neighbouring run's cabinets plus a door's width of clearance
      const L = layout.runs.find((r) => r.run.id === c.run);
      const need = conv(75, u) + R.t;
      if (c.blind < need) out.push(P('blind.short', 'warning', c.no, t('prob.blind.short', { no: c.no, blind: f(c.blind), need: f(need) }), cabAbout(c), { req: { op: '>=', value: r6(need), unit: U }, found: { value: c.blind, unit: U } }));
      void L;
    }
  }
  // a hung cabinet in front of a taller floor cabinet's side, or over it, is a collision
  for (const L of layout.runs) for (const a of L.rows.upper.cells) {
    if (a.kind !== 'cab') continue;
    const hit = L.rows.base.cells.find((b) => b.kind === 'cab' && b.cab.type === 'tall' && b.x < a.x + a.w - 1e-6 && a.x < b.x + b.w - 1e-6 && a.cab.elev < b.cab.h - 1e-6);
    if (hit) out.push(P('cab.overlap', 'error', a.no + '.' + hit.no, t('prob.cab.overlap', { a: a.no, b: hit.no }), [{ kind: 'cabinet', id: a.no, label: a.no }, { kind: 'cabinet', id: hit.no, label: hit.no }]));
  }
  // a wall cabinet needs room over the counter
  const base = Math.max(0, ...build.cells.filter((c) => c.kind === 'cab' && (c.cab.type === 'base' || c.cab.type === 'drawers')).map((c) => c.cab.h));
  for (const c of build.cells) if (c.kind === 'cab' && c.cab.type === 'wall' && base > 0) {
    const clear = c.cab.elev - base;
    if (clear < conv(400, u)) out.push(P('cab.wall-clearance', 'warning', c.no, t('prob.cab.wall-clearance', { no: c.no, clear: f(clear), min: f(conv(400, u)) }), cabAbout(c), { req: { op: '>=', value: conv(400, u), unit: U }, found: { value: r6(clear), unit: U } }));
  }
  // runs: over the wall, or a gap too big for a filler
  const maxFiller = conv(75, u);
  for (const L of layout.runs) for (const row of ['base', 'upper']) {
    const rw = L.rows[row];
    if (!rw.cells.length) continue;
    const id = L.run.id + '.' + row;
    const about = [{ kind: 'run', id: L.run.id, label: L.run.id + (L.run.name ? ' ' + L.run.name : '') }];
    if (rw.rest < -1e-6) out.push(P('run.over', 'error', id, t('prob.run.over', { run: L.run.id, over: f(-rw.rest), row: t('row.' + row) }), about, { req: { op: '<=', value: r6(rw.end - rw.start), unit: U }, found: { value: r6(rw.used), unit: U } }));
    else if (rw.rest > maxFiller + 1e-6) out.push(P('run.gap', 'note', id, t('prob.run.gap', { run: L.run.id, gap: f(rw.rest), row: t('row.' + row) }), about));
    for (const c of rw.cells) {
      if (c.kind === 'filler' && c.w < conv(20, u)) out.push(P('filler.thin', 'warning', c.no, t('prob.filler.thin', { no: c.no, w: f(c.w) }), [{ kind: 'filler', id: c.no }]));
      if (c.kind === 'filler' && c.w > maxFiller + 1e-6) out.push(P('filler.wide', 'warning', c.no, t('prob.filler.wide', { no: c.no, w: f(c.w), max: f(maxFiller) }), [{ kind: 'filler', id: c.no }]));
    }
  }

  // ---- the room: footprints against each other, the walls, the openings, corners, islands
  const fp = footprints(build);
  const aisle = conv(900, u), tight = conv(50, u), tolO = conv(1, u);
  for (let i = 0; i < fp.length; i++) for (let j = i + 1; j < fp.length; j++) {
    const a = fp[i], b = fp[j];
    if (a.row !== b.row || a.no === b.no) continue;
    if (a.z0 >= b.z1 - 1e-6 || b.z0 >= a.z1 - 1e-6) continue;
    let o = 0;
    for (const pa of a.pieces) for (const pb of b.pieces) o = Math.max(o, overlap(pa, pb));
    if (o > tolO) out.push(P('cab.collide', 'error', a.no + '.' + b.no, t('prob.cab.collide', { a: a.no, b: b.no, by: f(o) }), [{ kind: 'cabinet', id: a.no, label: a.no }, { kind: 'cabinet', id: b.no, label: b.no }]));
  }
  for (const a of fp) {
    if (a.row !== 'base' && a.row !== 'upper') continue;
    if (!a.pieces.every((pc) => polyInRoom(project.room, pc, conv(2, u)))) out.push(P('cab.outside', 'error', a.no, t('prob.cab.outside', { no: a.no }), [{ kind: 'cabinet', id: a.no, label: a.no }]));
  }
  // doors and windows
  for (const op of project.openings || []) {
    const about = [{ kind: 'opening', id: op.id, label: op.id }];
    const label = t(op.kind === 'door' ? 'open.door' : 'open.window') + ' ' + op.id;
    for (const a of fp) {
      const L = layout.runs.find((r) => r.run.id === a.run);
      if (!L || L.wall !== op.wall) continue;
      const c = a.cell;
      const [x0, x1] = c.ext || [c.x, c.x + c.w];
      const hit = x0 < op.at + op.w - 1e-6 && op.at < x1 - 1e-6;
      const near = !hit && op.kind === 'door' && x0 < op.at + op.w + tight - 1e-6 && op.at - tight < x1 - 1e-6;
      const z0 = a.z0, z1 = a.z1, o0 = op.sill, o1 = op.sill + op.h;
      const vert = z0 < o1 - 1e-6 && o0 < z1 - 1e-6;
      const cabAbout = [...about, { kind: 'cabinet', id: a.no, label: a.no }];
      if (hit && vert) out.push(P('cab.opening', 'error', op.id + '.' + a.no, t('prob.cab.opening', { no: a.no, what: label }), cabAbout));
      else if (hit && op.kind === 'window' && z1 <= o0 + 1e-6 && a.row === 'upper') out.push(P('cab.under-window', 'warning', op.id + '.' + a.no, t('prob.cab.under-window', { no: a.no, what: label }), cabAbout));
      else if (near && vert && a.row === 'base') out.push(P('cab.opening-tight', 'warning', op.id + '.' + a.no, t('prob.cab.opening-tight', { no: a.no, what: label, gap: f(tight) }), cabAbout));
    }
    if (op.kind === 'door' && op.swing === 'in') {
      const zone = openingPoly(project.room, op, op.w);
      if (zone) for (const a of fp) {
        if (a.row !== 'base') continue;
        const L = layout.runs.find((r) => r.run.id === a.run);
        const [e0, e1] = a.cell.ext || [a.cell.x, a.cell.x + a.cell.w];
        if (L && L.wall === op.wall && e0 < op.at + op.w && op.at < e1) continue;   // already an error
        let o = 0;
        for (const pc of a.pieces) o = Math.max(o, overlap(zone, pc));
        if (o > tolO) out.push(P('cab.door-swing', 'warning', op.id + '.' + a.no, t('prob.cab.door-swing', { no: a.no, what: label }), [...about, { kind: 'cabinet', id: a.no, label: a.no }]));
      }
    }
  }
  // corners
  for (const c of build.cells) if (c.kind === 'cab' && c.cell.turn) {
    if (!c.cell.corner) out.push(P('corner.misplaced', 'error', c.no, t('prob.corner.misplaced', { no: c.no }), cabAbout(c)));
    if (c.cab.w - c.cab.d < conv(250, u)) out.push(P('corner.small', 'error', c.no, t('prob.corner.small', { no: c.no, w: f(c.cab.w), d: f(c.cab.d), min: f(c.cab.d + conv(250, u)) }), cabAbout(c), { req: { op: '>=', value: r6(c.cab.d + conv(250, u)), unit: U }, found: { value: c.cab.w, unit: U } }));
  }
  for (const A of layout.runs) for (const row of ['base', 'upper']) {
    const ce = A.rows[row].cornerEnd;
    if (!ce) continue;
    const B = layout.runs.find((r) => !r.island && r.wall === A.wallInfo.nextId);
    if (B && B.rows[row].cornerStart) out.push(P('corner.double', 'error', ce.no + '.' + B.rows[row].cornerStart.no, t('prob.corner.double', { a: ce.no, b: B.rows[row].cornerStart.no }), [{ kind: 'cabinet', id: ce.no, label: ce.no }, { kind: 'cabinet', id: B.rows[row].cornerStart.no, label: B.rows[row].cornerStart.no }]));
  }
  // corners that are not right angles, curved walls, made-to-order cabinets
  for (const c of build.cells) if (c.kind === 'cab' && c.cell.angleMismatch) {
    const m = c.cell.angleMismatch;
    out.push(P('corner.angle', 'error', c.no, t('prob.corner.angle.' + m.why, { no: c.no, tau: f1(m.tau), inside: f1(180 - m.tau), form: t('tpl.' + c.cell.entry.tpl) }), cabAbout(c)));
  }
  for (const ev of layout.corners || []) {
    const id = ev.from + '.' + ev.to + '.' + ev.row;
    const about = [{ kind: 'run', id: ev.from, label: ev.from }, { kind: 'run', id: ev.to, label: ev.to }];
    if (ev.kind === 'sharp') out.push(P('corner.sharp', 'error', id, t('prob.corner.sharp', { a: ev.from, b: ev.to, inside: f1(180 - ev.tau) }), about, { req: { op: '>=', value: 90, unit: 'deg' }, found: { value: r6(180 - ev.tau), unit: 'deg' } }));
    else if (ev.kind === 'wedge') {
      const wd = layout.wedges[ev.wedge];
      if (wd) out.push(P('corner.wedge', 'note', wd.no, t('prob.corner.wedge', { no: wd.no, a: ev.from, b: ev.to, inside: f1(180 - ev.tau), leg1: f(wd.leg1), leg2: f(wd.leg2), stop: f(ev.stop) }), about));
    } else if (ev.kind === 'diag') out.push(P('corner.diag', 'note', id, t('prob.corner.diag', { no: ev.cab.no, inside: f1(180 - ev.tau), front: f(diagFront(ev, build)) }), [{ kind: 'cabinet', id: ev.cab.no, label: ev.cab.no }]));
  }
  for (const L of layout.runs) for (const row of ['base', 'upper']) {
    const ar = L.rows[row].arc;
    if (!ar) continue;
    const id = L.run.id + '.' + row;
    const about = [{ kind: 'run', id: L.run.id, label: L.run.id }];
    if (ar.invalid) { out.push(P('arc.invalid', 'error', id, t('prob.arc.invalid', { run: L.run.id, r: f(ar.r) }), about)); continue; }
    if (ar.overflow > tolO) out.push(P('arc.over', 'error', id, t('prob.arc.over', { run: L.run.id, over: f(ar.overflow), row: t('row.' + row) }), about, { found: { value: r6(ar.overflow), unit: U } }));
    const cabs = L.rows[row].cells.filter((c) => c.kind === 'cab' && !c.cab.curved);
    if (cabs.length) out.push(P('arc.gap', 'note', id, t(ar.bay ? 'prob.arc.gap.bay' : 'prob.arc.gap.bow', { run: L.run.id, row: t('row.' + row), gap: f(ar.gapMax), r: f(ar.r) }), about));
    const open = ar.wedges.filter((wd) => (ar.bay ? wd.back : wd.front) > conv(1, u) && wd.cabs);
    if (open.length) {
      const widest = Math.max(...open.map((wd) => (ar.bay ? wd.back : wd.front)));
      out.push(P(ar.bay ? 'arc.void' : 'arc.wedge', ar.bay ? 'note' : 'warning', id, t(ar.bay ? 'prob.arc.void' : 'prob.arc.wedge', { run: L.run.id, row: t('row.' + row), n: String(open.length), w: f(widest) }), about));
    }
  }
  for (const c of build.cells) if (c.kind === 'cab' && c.cell.tpl.curved) {
    const L = layout.runs.find((r) => r.run.id === c.run);
    const ok = L && L.rows[c.row].arc && !L.rows[c.row].arc.invalid;
    if (!ok) out.push(P('curved.straight', 'error', c.no, t('prob.curved.straight', { no: c.no }), cabAbout(c)));
    else out.push(P('curved.order', 'warning', c.no, t('prob.curved.order', { no: c.no, r: f(c.madeToOrder ? c.madeToOrder.rFront : 0), arc: f(c.cab.w) }), cabAbout(c)));
  }
  const cornerNos = build.cells.filter((c) => c.kind === 'cab' && c.cell.turn && c.corner).map((c) => c.no);
  if (cornerNos.length) {
    const blanks = blanksOf(build.drill);
    if (blanks.length) out.push(P('corner.drillsize', 'note', 'corners', t('prob.corner.drillsize', { list: cornerNos.join(', '), kinds: blanks.map((b) => b.kind + ' ×' + b.n).join(', ') }), cornerNos.map((no) => ({ kind: 'cabinet', id: no, label: no }))));
  }
  // islands: the walk-around space
  for (const isl of project.islands || []) {
    const mine = fp.filter((a) => a.island === isl.id && a.row === 'base');
    if (!mine.length) continue;
    let least = Infinity, what = '';
    for (const a of fp) { if (a.island === isl.id || a.row !== 'base') continue; const g = polyGap(mine.flatMap((m) => m.pieces), a.pieces); if (g > tolO && g < least) { least = g; what = a.no; } }
    const g = Math.min(...mine.flatMap((m) => m.pieces).map((pc) => distToWalls(project.room, pc)));
    const attached = isl.attach.start || isl.attach.end;
    if (g > tolO && g < least) { least = g; what = t('open.wall'); }
    else if (g <= tolO && !attached && least > g) { /* touching a wall without being marked as a peninsula: the collision check says nothing, the aisle check has no gap to measure */ }
    if (least < aisle - 1e-6) out.push(P('island.aisle', 'warning', isl.id, t('prob.island.aisle', { id: isl.id, gap: f(least), what, min: f(aisle) }), [{ kind: 'island', id: isl.id, label: isl.id }], { req: { op: '>=', value: r6(aisle), unit: U }, found: { value: r6(least), unit: U } }));
  }
  for (const c of layout.counters) if (c.length > conv(3000, u) + 1e-6) out.push(P('counter.long', 'note', c.no, t('prob.counter.long', { no: c.no, len: f(c.length), max: f(conv(3000, u)) }), [{ kind: 'counter', id: c.no }]));
  if (build.cells.some((c) => c.construction === 'faceframe')) for (const c of build.cells) {
    if (c.kind !== 'cab' || !c.frame) continue;
    const o = c.frame.openings[0];
    if (o && o.w < conv(100, u)) out.push(P('ff.opening', 'warning', c.no, t('prob.ff.opening', { no: c.no, w: f(o.w) }), cabAbout(c), { req: { op: '>=', value: conv(100, u), unit: U }, found: { value: o.w, unit: U } }));
  }
  if (nest) for (const un of nest.unplaced) out.push(P('nest.unplaced', 'error', un.id, t('prob.nest.unplaced', { id: un.id, name: un.name || '', material: un.material }), [{ kind: 'part', id: un.id }]));
  if (est && est.placeholders > 0) out.push(P('est.placeholder', 'note', 'rates', t('prob.est.placeholder', { n: est.placeholders, of: est.rows.length }), [{ kind: 'estimate', id: 'rates' }]));
  return out;
}
