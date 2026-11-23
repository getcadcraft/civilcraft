/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pick-ui.js: civilcraft.js's 15 bindings for this topic, moved out of init() unchanged (0.11 PERF.71 round two, perf-finish-11 r2 civil-detail; no behaviour change).
 * mountPick(ctx) is called once by init(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables init() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { nearestSnap, snapTargets, segmentSnap, snapSegments } from './snap.js';
import { t } from './i18n.js';
import { el, num } from './ui-util.js';
import { bulgeThrough } from './featureline.js';
import { fixed } from './units.js';
import { lassoMode, thin } from './lasso-core.js';
import { lassoPoints } from './points.js';
import { pointInPoly } from './tin.js';

export function mountPick(ctx) {
  const { ST, ui, SNAP_TOOLS, view, refresh, commitPaste, measureText, finishDraft, say, is3D } = ctx;

  /** 0.9 WB.10: the closest vertex of anything drawn, or survey point, within 10 pixels of screen point s. */
  function snapHere(s, skip = null) {
    const v = nearestSnap(snapTargets(ST.project.state, { skip }), (x, y) => view.toScreen(x, y), s, 10);
    const p = nearestPoint(s, 10, false);
    if (p && (!v || Math.hypot(view.toScreen(p.x, p.y).x - s.x, view.toScreen(p.x, p.y).y - s.y) < Math.hypot(view.toScreen(v.x, v.y).x - s.x, view.toScreen(v.x, v.y).y - s.y))) return { x: p.x, y: p.y, z: p.z, kind: 'point', label: String(p.n) };
    if (v) return v;
    // 0.10.1 #1970: no vertex there, so the lines themselves: where two cross, a middle, the perpendicular from the last point placed, the nearest place
    return segmentSnap(snapSegments(ST.project.state, { skip }), view.toWorld(s.x, s.y), 10 / view.zoom, { from: ST.draft.length && !ST.pickJob ? ST.draft[ST.draft.length - 1] : null });
  }
  /** 0.9 WB.15: a Pick button (next to an easting / northing) waits for one plan click; Esc cancels. */
  function armPick(label, cb) {
    if (is3D()) { say(t('cv.pick.plan')); return; }
    ST.pickJob = { label, cb };
    ui.over.classList.add('is-picking');
    say(t('cv.pick.armed', { what: label }));
    view.invalidate();
  }
  /** 0.10.1 #1970: ring one vertex on the plan (a table row under the pointer or with the focus); null = none. */
  function setHot(get) {   // get: () => the vertex as it is now (it follows an edit), or null
    if (!get && !ST.hotVertex) return;
    ST.hotVertex = typeof get === 'function' ? get : null; view.invalidate();
  }
  const hotPoint = () => { let p = null; try { p = ST.hotVertex?.(); } catch { p = null; } return p && Number.isFinite(p.x) && Number.isFinite(p.y) ? p : null; };
  function endPick() { ST.pickJob = null; ST.snapHit = null; ui.over.classList.remove('is-picking'); view.invalidate(); }
  /** A small button that arms a pick: `onPick({x, y, z?})` gets the snapped place. */
  function pickBtn(what, onPick, extra = {}) { return el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-pick', 'data-cv-pick': '', title: t('cv.pick.title', { what }), 'aria-label': t('cv.pick.title', { what }), onclick: () => armPick(what, onPick), ...extra }, el('i', { className: 'bi bi-crosshair', 'aria-hidden': 'true' })); }

  function click(w, s, d = {}) {
    if (ST.pickJob) {   // 0.9 WB.15
      const j = ST.pickJob, h = d.alt ? null : snapHere(s);
      endPick();
      j.cb(h ? { x: h.x, y: h.y, z: h.z } : { x: w.x, y: w.y });
      return;
    }
    let snapZ = null;   // 0.10.1 #1970: a snap on a feature line or a pad edge knows its elevation there (the Feature line tool takes it)
    if (!d.alt && SNAP_TOOLS.includes(ST.tool)) { const h = snapHere(s); if (h) { w = { x: h.x, y: h.y }; if (h.kind !== 'point' && Number.isFinite(h.z)) snapZ = h.z; } }   // 0.9 WB.10
    if (ctx.lsUi.ownsTool(ST.tool) && ctx.lsUi.click(ST.tool, w, s)) { view.invalidateScene(); view.invalidate(); return; }   // 0.7 LD: Plant places at once
    if (ctx.wmUi.ownsTool(ST.tool) && ctx.wmUi.click(ST.tool, w)) { view.invalidateScene(); view.invalidate(); return; }   // 0.8 LC.16: a node places at once; a link takes two clicks
    if (ctx.plUi.ownsTool(ST.tool) && ctx.plUi.click(ST.tool, w, s)) { view.invalidateScene(); view.invalidate(); return; }   // 0.7 PL: equipment and an added support place at once
    if (ST.tool === 'paste' && ST.pasteJob) {
      const j = ST.pasteJob;
      commitPaste(j.pts, w.x - j.anchor.x, w.y - j.anchor.y, j.label, j.from, j.note);
      return;
    }
    if (ST.tool === 'select') {
      if (d.shift) {
        // Shift+click adds a survey point to the selection, or takes it out
        const pt = nearestPoint(s, 8, false);
        if (pt) { if (ST.picked.has(pt.n)) ST.picked.delete(pt.n); else ST.picked.add(pt.n); ST.sel = null; ST.selPvi = -1; refresh(); say(t('cv.pts.selected', { n: ST.picked.size, count: num(ST.picked.size) })); }
        return;
      }
      const hit = pickAt(s);
      ST.picked.clear();
      if (hit?.kind === 'point') { ST.picked.add(hit.p.n); ST.sel = null; } else ST.sel = hit;
      ST.selPvi = -1;
      if (hit?.kind === 'alignment' && !ui.profPanel.hidden) ui.profAl.dataset.want = hit.id;
      refresh();
      return;
    }
    if (ST.tool === 'feature') {   // 0.4 V14: a survey point's place and elevation, else the ground's (finish); the first vertex closes
      const p = nearestPoint(s, 10, true), at = p ? { x: p.x, y: p.y } : { x: w.x, y: w.y };
      if (ST.flArc && ST.draft.length && !ST.flMid) { ST.flMid = at; say(t('fl.arc.mid')); view.invalidate(); return; }   // 0.6 WL.24: a point on the curve
      const bendTo = (end) => { if (ST.flMid) { const b = bulgeThrough(ST.draft[ST.draft.length - 1], ST.flMid, end); if (b) ST.draft[ST.draft.length - 1].b = b; else delete ST.draft[ST.draft.length - 1].b; ST.flMid = null; } };
      if (ST.draft.length >= 3 || (ST.flMid && ST.draft.length >= 2)) { const q = view.toScreen(ST.draft[0].x, ST.draft[0].y); if (Math.hypot(q.x - s.x, q.y - s.y) < 8) { bendTo(ST.draft[0]); ST.draftClosed = true; finishDraft(); return; } }
      bendTo(at);
      ST.draft.push(p ? { x: p.x, y: p.y, z: p.z, n: p.n } : snapZ !== null ? { x: w.x, y: w.y, z: snapZ } : { x: w.x, y: w.y });
      say(p ? t('fl.click.point', { n: p.n, z: fixed(p.z, 2) }) : snapZ !== null ? t('fl.click.snapz', { n: ST.draft.length, z: fixed(snapZ, 2) }) : t('fl.click.ground', { n: ST.draft.length }));
      view.invalidate();
      return;
    }
    if (ST.tool === 'measure') {   // 0.7 PL.10: survey points snap; the first point again closes the shape (area)
      if (ST.measClosed) { ST.draft = []; ST.measClosed = false; }
      if (ST.draft.length >= 3) { const q = view.toScreen(ST.draft[0].x, ST.draft[0].y); if (Math.hypot(q.x - s.x, q.y - s.y) < 8) { ST.measClosed = true; say(measureText(ST.draft, true)); view.invalidate(); return; } }
      const p = nearestPoint(s, 10, false);
      ST.draft.push(p ? { x: p.x, y: p.y, z: p.z } : { x: w.x, y: w.y });
      say(measureText(ST.draft, false));
      view.invalidate();
      return;
    }
    if (ST.tool === 'breakline') {
      const p = nearestPoint(s, 14, true);
      if (!p) { say(t('cv.bl.click.need')); return; }
      if (ST.draft.length && ST.draft[ST.draft.length - 1].n === p.n) return;
      ST.draft.push({ x: p.x, y: p.y, z: p.z, n: p.n });
      say(t('cv.bl.click', { n: p.n, z: fixed(p.z, 2) }));
    } else if (ST.tool === 'mass') {   // 0.7 LC.1: a click near a parcel corner or a survey point takes its place; the first corner again closes
      if (ST.draft.length >= 3) { const q = view.toScreen(ST.draft[0].x, ST.draft[0].y); if (Math.hypot(q.x - s.x, q.y - s.y) < 8) { finishDraft(); return; } }
      let hit = null;
      for (const pc of ST.project.state.parcels || []) for (const c of pc.pts) { const q = view.toScreen(c.x, c.y); if (Math.hypot(q.x - s.x, q.y - s.y) < 10) hit = c; }
      const p = hit ? null : nearestPoint(s, 10, false);
      ST.draft.push(hit ? { x: hit.x, y: hit.y } : p ? { x: p.x, y: p.y } : { x: w.x, y: w.y });
      say(t('ms.click', { k: ST.draft.length }));
    } else if (ST.tool === 'parcel') {   // 0.4 V21: a click near a survey point takes its place; the first corner again closes
      if (ST.draft.length >= 3) { const q = view.toScreen(ST.draft[0].x, ST.draft[0].y); if (Math.hypot(q.x - s.x, q.y - s.y) < 8) { finishDraft(); return; } }
      const p = nearestPoint(s, 10, false);
      ST.draft.push(p ? { x: p.x, y: p.y } : { x: w.x, y: w.y });
      say(p ? t('pc.click.point', { n: p.n, k: ST.draft.length }) : t('pc.click', { k: ST.draft.length }));
    } else if (ST.tool === 'pipe') {
      const st = structAt(s);
      if (ST.draft.length && st && ST.draft[ST.draft.length - 1].sid === st.id) return;
      ST.draft.push(st ? { x: st.x, y: st.y, sid: st.id } : { x: w.x, y: w.y });
      say(st ? t('cv.pp.joined', { name: st.name }) : t('cv.pp.placed'));
    } else {
      if (ST.draft.length && Math.hypot(view.toScreen(ST.draft[ST.draft.length - 1].x, ST.draft[ST.draft.length - 1].y).x - s.x, view.toScreen(ST.draft[ST.draft.length - 1].x, ST.draft[ST.draft.length - 1].y).y - s.y) < 3) return;
      ST.draft.push({ x: w.x, y: w.y });
    }
    view.invalidate();
  }

  /** Add the survey points inside the screen rectangle a–b to the selection. */
  function boxSelect(a, b) {
    const p = view.toWorld(Math.min(a.x, b.x), Math.max(a.y, b.y)), q = view.toWorld(Math.max(a.x, b.x), Math.min(a.y, b.y));
    const x0 = Math.min(p.x, q.x), x1 = Math.max(p.x, q.x), y0 = Math.min(p.y, q.y), y1 = Math.max(p.y, q.y);
    let added = 0;
    const T = ST.project.pointTable;   // 0.11: the table's columns; a name is read only for a point inside the box
    for (const b of T.blocks) for (let k = 0; k < b.n; k++) {
      const o = b.irr && b.irr.get(k), x = o ? o.x : b.x[k], y = o ? o.y : b.y[k];
      if (!(x >= x0 && x <= x1 && y >= y0 && y <= y1)) continue;
      const n = o ? o.n : T.rowName(b, k);
      if (!ST.picked.has(n)) { ST.picked.add(n); added++; }
    }
    ST.sel = null; ST.selPvi = -1;
    refresh();
    view.invalidate();
    say(added ? t('cv.pts.box', { added: t('cv.pts.n', { n: added, count: num(added) }), total: t('cv.pts.n', { n: ST.picked.size, count: num(ST.picked.size) }) }) : t('cv.pts.box.none'));
  }

  // 0.4 W2.7: a Shift+drag stays a box while it runs close to the line from its start; once it bends more than 12 px off
  // that line it is a lasso. Its mode follows the first sideways move (right = window, left = crossing) until Space picks one.
  function lassoTrack(d) {
    if (d.kind === 'box') {
      const a = d.s, b = d.last, L = Math.hypot(b.x - a.x, b.y - a.y);
      const off = (q) => (L < 1 ? Math.hypot(q.x - a.x, q.y - a.y) : Math.abs((b.x - a.x) * (a.y - q.y) - (a.x - q.x) * (b.y - a.y)) / L);
      if (!d.path.some((q) => off(q) > 12)) return;
      d.kind = 'lasso';
    }
    if (!d.spaced) d.mode = lassoMode(d.s, d.path.find((q) => lassoMode(d.s, q)) || d.last) || d.mode || 'window';
    if (d.said !== d.mode) { d.said = d.mode; say(t('cv.lasso.' + d.mode)); }
  }
  function lassoPick(path, mode) {
    const z = view.zoom;
    const pts = thin(path, 2).map((q) => view.toWorld(q.x, q.y));
    const got = lassoPoints(ST.project.points, pts, mode, 4 / z);
    let added = 0;
    for (const pt of got) if (!ST.picked.has(pt.n)) { ST.picked.add(pt.n); added++; }
    ST.sel = null; ST.selPvi = -1;
    refresh();
    view.invalidate();
    say(added ? t('cv.pts.box', { added: t('cv.pts.n', { n: added, count: num(added) }), total: t('cv.pts.n', { n: ST.picked.size, count: num(ST.picked.size) }) }) : t('cv.pts.lasso.none'));
  }

  function nearestPoint(s, px, needZ) {
    // 0.11 (the cap lifted): walked as the table's columns (every mouse move: no object a point); the nearest one comes back as a point object
    let bb = null, bk = -1, bd = px;
    const vb = view.viewBounds(), T = ST.project.pointTable;
    for (const b of T.blocks) for (let k = 0; k < b.n; k++) {
      const o = b.irr && b.irr.get(k), x = o ? o.x : b.x[k], y = o ? o.y : b.y[k];
      if (needZ && (o ? o.z === null : b.z[k] !== b.z[k])) continue;
      if (x < vb.minX || x > vb.maxX || y < vb.minY || y > vb.maxY) continue;
      const q = view.toScreen(x, y), d = Math.hypot(q.x - s.x, q.y - s.y);
      if (d < bd) { bd = d; bb = b; bk = k; }
    }
    return bb ? T.rowGet(bb, bk) : null;
  }

  /** Grips of the selected alignment (PIs) or pad (corners) under screen point s. */
  function gripAt(s) {
    const a = ctx.selAl(), d = ctx.selPad();
    const R = ctx.gripR();
    const test = (list, label, get, keys = null) => { for (let i = 0; i < list.length; i++) { const q = view.toScreen(list[i].x, list[i].y); if (Math.abs(q.x - s.x) <= R && Math.abs(q.y - s.y) <= R) return { list, i, label, get, keys }; } return null; };   // keys: 0.11 PERF.21 hint for the move's undo step
    if (a) return test(a.pis, t('cv.undo.pi.move'), () => ctx.findAl(a.id)?.pis, ST.project.keysOf('alignments', a.id));
    const pg = ctx.plUi.grip(ST.sel);   // 0.7 PL: supports, route vertices, equipment, obstacles
    if (pg) return pg.only >= 0 ? (test([pg.list[pg.only]], '', null) ? { list: pg.list, i: pg.only, label: pg.label, get: pg.get } : null) : test(pg.list, pg.label, pg.get);
    const lg = ctx.lsUi.grip(ST.sel);   // 0.7 LD: a plant, bed / hedge corners, grading corners, spots, edited contours
    if (lg) return lg.only >= 0 ? (test([lg.list[lg.only]], '', null) ? { list: lg.list, i: lg.only, label: lg.label, get: lg.get } : null) : test(lg.list, lg.label, lg.get);
    const fg = ctx.flUi.grip(ST.sel);   // 0.4 V14: a feature line's vertices
    if (fg) return test(fg.list, fg.label, fg.get, fg.keys || null);
    if (d) return test(d.pts, t('cv.undo.pad.corner'), () => ctx.findPad(d.id)?.pts, ST.project.keysOf('pads', d.id));
    const st = ctx.selStruct();
    if (st && test([st], '', null)) { const list = ctx.net().structures; return { list, i: list.indexOf(st), label: t('cv.undo.st.move'), get: () => ctx.net()?.structures, keys: ['k:network'] }; }
    return null;
  }

  function structAt(s, px = 10) {
    let best = null, bd = px;
    for (const x of ctx.net()?.structures || []) { const q = view.toScreen(x.x, x.y); const d = Math.hypot(q.x - s.x, q.y - s.y); if (d < bd) { bd = d; best = x; } }
    return best;
  }
  function pickAt(s) {
    const w = view.toWorld(s.x, s.y), tol = 7 / view.zoom;
    if (ctx.lsUi.active()) { const h = ctx.lsUi.pick(w, tol); if (h) return h; }   // 0.7 LD: in the Landscape workspace the plants come first
    if (ctx.plUi.active()) { const h = ctx.plUi.pick(w, tol); if (h) return h; }   // 0.7 PL: in the Power lines workspace supports and spans come first
    const st = structAt(s);
    if (st) return { kind: 'structure', id: st.id };
    let best = null, bd = tol;
    for (const p of ctx.net()?.pipes || []) {
      const a = ctx.findStruct(p.from), b = ctx.findStruct(p.to);
      if (!a || !b) continue;
      const d = polyDist([a, b], w);
      if (d < bd) { bd = d; best = { kind: 'pipe', id: p.id }; }
    }
    for (const a of ST.project.state.alignments) {
      const al = ST.project.alignment(a);
      const line = al.ok ? al.polyline(Infinity, Math.PI / 90) : a.pis;
      const d = polyDist(line, w);
      if (d < bd) { bd = d; best = { kind: 'alignment', id: a.id }; }
    }
    const fh = ctx.flUi.pick(w, bd);   // 0.4 V14: a feature line nearer than anything so far
    if (fh) { best = fh; bd = 0; }
    for (const p of ST.project.state.pads) {
      const d = pointInPoly(w.x, w.y, p.pts) ? 0 : polyDist([...p.pts, p.pts[0]], w);
      if ((d < bd || (d === 0 && !best)) && best?.kind !== 'feature') { bd = d; best = { kind: 'pad', id: p.id }; }
    }
    if (best) return best;
    const pt = nearestPoint(s, 6, false);
    if (pt) return { kind: 'point', p: pt };
    for (const f of ctx.gisReg.pick) { const h = f(w, tol); if (h) return h; }   // GIS: a feature of a GIS layer
    { const wm = ctx.wmUi.pick(w, tol); if (wm) return wm; }   // 0.8 LC.16: a water node or pipe
    { const rv = ctx.rvUi.pick(w, tol); if (rv) return rv; }   // 0.8 SU.957: a river's centreline or cut lines
    const area = ctx.msUi.pick(w) || ctx.drUi.pick(w) || ctx.pcUi.pick(w) || ctx.swUi.pick(w) || ctx.lsUi.pick(w, tol) || ctx.plUi.pick(w, tol);   // 0.7 LD: plants, hedges, beds last in the Civil workspace   // 0.4 V19/V21: inside a catchment, else a parcel (anything nearer wins); 0.6 WL.28 a swept path
    if (area) return area;
    return null;
  }
  function polyDist(pts, p) {
    let d = Infinity;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
      const t = L ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L)) : 0;
      d = Math.min(d, Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t));
    }
    return d;
  }

  return { snapHere, armPick, setHot, hotPoint, endPick, pickBtn, click, boxSelect, lassoTrack, lassoPick, nearestPoint, gripAt };
}
