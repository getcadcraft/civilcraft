/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pointer-ui.js: civilcraft.js's 2 bindings for this topic, moved out of init() unchanged (0.11 PERF.71 round two, perf-finish-11 r2 civil-detail; no behaviour change).
 * mountPointer(ctx) is called once by init(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables init() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { t } from './i18n.js';
import { num } from './ui-util.js';
import { panButton, wheelFactor } from './input-mouse.js';
import { fixed } from './units.js';
import { movePoint } from './point-edit.js';
import { PadDetector } from './wheel-pad.js';

export function mountPointer(ctx) {
  const { ST, ui, SNAP_TOOLS, view, nearestPoint, gripAt, snapHere, lassoTrack, boxSelect, lassoPick, click, refresh, finishDraft, pointers, LONG_MS, slack, gripR, local, syncDraftBar, updateStatus, say } = ctx;

  ui.over.addEventListener('pointerdown', (e) => {
    ui.over.focus({ preventScroll: true });
    const s = local(e);
    pointers.set(e.pointerId, s);
    ui.over.setPointerCapture(e.pointerId);
    if (pointers.size === 2) {
      const [p, q] = [...pointers.values()];
      ST.pinch = { d: Math.hypot(p.x - q.x, p.y - q.y), m: { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 } };
      ST.drag = null; clearTimeout(ST.longTimer); return;
    }
    const w = view.toWorld(s.x, s.y);
    clearTimeout(ST.longTimer);
    if (e.pointerType === 'touch') {
      ST.longTimer = setTimeout(() => {
        if (!ST.drag || ST.drag.moved || ST.pinch || (ST.drag.kind !== 'maybe' && ST.drag.kind !== 'maybe-box')) return;
        const at = ST.drag.s;
        ST.drag = null;   // the lift that follows is not a tap
        navigator.vibrate?.(15);
        if (ST.draft.length) { finishDraft(); syncDraftBar(); view.invalidate(); return; }   // = Enter
        if (ST.tool === 'select') {   // = Shift+click
          const pt = nearestPoint(at, 14, false);
          if (pt) { if (ST.picked.has(pt.n)) ST.picked.delete(pt.n); else ST.picked.add(pt.n); ST.sel = null; ST.selPvi = -1; refresh(); say(t('cv.pts.selected', { n: ST.picked.size, count: num(ST.picked.size) })); }
        }
      }, LONG_MS);
    }
    if ((e.button !== 0 && panButton(e.button)) || ST.spaceDown) { ST.drag = { kind: 'pan', s, last: s, moved: true }; ui.over.classList.add('is-panning'); return; }   // IP.3: the style's pan buttons (middle and right unless changed)
    if (e.button !== 0) return;   // a middle or right button the style took off panning does nothing
    if (ST.tool === 'select' && !ST.pickJob) {   // 0.9 WB.15: a waiting Pick button takes the click, even on a grip
      const g = gripAt(s);
      if (g) { ST.drag = { kind: 'grip', g, s, last: s, moved: false, orig: JSON.stringify(g.list[g.i]) }; return; }
      // 0.4 V2: the one selected survey point is a grip too — drag it to move it (one undo step on release)
      if (ST.picked.size === 1 && !e.shiftKey && e.button === 0) {
        const pt = ST.project.points.find((q) => ST.picked.has(q.n));
        const q = pt && view.toScreen(pt.x, pt.y);
        if (q && Math.abs(q.x - s.x) <= gripR() && Math.abs(q.y - s.y) <= gripR()) { ST.drag = { kind: 'point', pt, s, last: s, moved: false, at: { x: pt.x, y: pt.y } }; return; }
      }
    }
    // Shift+drag in Select draws a box that adds the survey points inside it (a Shift+click still clicks); 0.4 W2.7: a drag
    // that bends away from a straight line becomes a lasso (lasso-core.js), Space while dragging: window → crossing → fence
    ST.drag = { kind: ST.tool === 'select' && e.shiftKey && e.button === 0 ? 'maybe-box' : 'maybe', s, last: s, moved: false, w, shift: e.shiftKey, alt: e.altKey, path: [s] };
  });
  ui.over.addEventListener('pointermove', (e) => {
    const s = local(e);
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, s);
    if (ST.pinch && pointers.size === 2) {
      const [p, q] = [...pointers.values()];
      const d = Math.hypot(p.x - q.x, p.y - q.y), m = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
      view.panBy(m.x - ST.pinch.m.x, m.y - ST.pinch.m.y);
      if (ST.pinch.d > 0 && d > 0) view.zoomAt(m.x, m.y, d / ST.pinch.d);
      ST.pinch = { d, m }; return;
    }
    ST.cursor = view.toWorld(s.x, s.y);
    // 0.9 WB.10: drawing tools, a grip being dragged and a waiting Pick button snap to survey points and to the vertices of what is drawn (Alt = free)
    ST.snapHit = !e.altKey && (ST.pickJob || (ST.drag?.kind === 'grip' && ST.drag.moved) || SNAP_TOOLS.includes(ST.tool)) ? snapHere(s, ST.drag?.kind === 'grip' ? ST.drag.g.list[ST.drag.g.i] : null) : null;
    if (ST.snapHit) ST.cursor = { x: ST.snapHit.x, y: ST.snapHit.y };
    if (ST.drag) {
      if (!ST.drag.moved && Math.hypot(s.x - ST.drag.s.x, s.y - ST.drag.s.y) > slack(e)) { clearTimeout(ST.longTimer); ST.drag.moved = true; if (ST.drag.kind === 'maybe') { ST.drag.kind = 'pan'; ui.over.classList.add('is-panning'); } else if (ST.drag.kind === 'maybe-box') ST.drag.kind = 'box'; }
      if (ST.drag.kind === 'pan' && ST.drag.moved) { view.panBy(s.x - ST.drag.last.x, s.y - ST.drag.last.y); ST.drag.last = s; }
      else if (ST.drag.kind === 'box' || ST.drag.kind === 'lasso') { ST.drag.last = s; ST.drag.path.push(s); lassoTrack(ST.drag); }
      else if (ST.drag.kind === 'grip' && ST.drag.moved) { const g = ST.drag.g; g.list[g.i].x = ST.cursor.x; g.list[g.i].y = ST.cursor.y; view.invalidateScene(); ST.project.cache.clear(); }
      else if (ST.drag.kind === 'point' && ST.drag.moved) { ST.drag.at = { x: ST.cursor.x, y: ST.cursor.y }; say(t('pt.drag', { n: ST.drag.pt.n, e: fixed(ST.cursor.x, 3), nn: fixed(ST.cursor.y, 3) })); }
    }
    ST.snapPt = ST.tool === 'breakline' ? nearestPoint(s, 14, true) : null;
    ST.hoverPt = ST.tool === 'select' && !ST.drag ? nearestPoint(s, 6, false) : null;
    updateStatus();
    view.invalidate();
  });
  const endPointer = (e) => {
    clearTimeout(ST.longTimer);
    pointers.delete(e.pointerId);
    if (ST.pinch) { if (pointers.size < 2) ST.pinch = null; ST.drag = null; return; }
    const d = ST.drag; ST.drag = null;
    ui.over.classList.remove('is-panning');
    if (!d || e.type === 'pointercancel') return;
    if (d.kind === 'grip') {
      if (d.moved) {
        const g = d.g, now = { ...g.list[g.i] };
        Object.assign(g.list[g.i], JSON.parse(d.orig));   // put back, then make the move one undo step
        ST.project.change(g.label, () => { const l = g.get(); if (l && l[g.i]) Object.assign(l[g.i], { x: now.x, y: now.y }); }, { keys: g.keys });   // 0.11 PERF.21: the grip names its object (none: the full look)
      }
      return;
    }
    if (d.kind === 'point') {
      if (d.moved && !d.cancelled) { const r = movePoint(ST.project, d.pt.n, d.at.x, d.at.y); if (r.message) say(r.message); }
      return;
    }
    if (d.kind === 'box') { boxSelect(d.s, d.last); return; }
    if (d.kind === 'lasso') { lassoPick(d.path, d.mode || 'window'); return; }
    if ((d.kind !== 'maybe' && d.kind !== 'maybe-box') || d.moved) return;
    click(d.w, d.s, d);
    syncDraftBar();
  };
  ui.over.addEventListener('pointerup', endPointer);
  ui.over.addEventListener('pointercancel', endPointer);
  ui.over.addEventListener('pointerleave', () => { ST.cursor = null; updateStatus(); view.invalidate(); });
  ui.over.addEventListener('dblclick', (e) => { if (ST.tool !== 'select' && ST.draft.length) { e.preventDefault(); ST.draft.pop(); finishDraft(); } });
  const padDetector = new PadDetector();
  ui.over.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (padDetector.isSwipe(e)) { view.panBy(-e.deltaX, -e.deltaY); return; }   // D7.56: two fingers pan (the plan follows them); a pinch and a mouse wheel zoom
    const s = local(e);
    view.zoomAt(s.x, s.y, Math.pow(1.0015, -e.deltaY * (e.deltaMode === 1 ? 16 : 1) * (e.ctrlKey ? 1 : wheelFactor())));   // IP.3: the style's wheel (a pinch stays as it is)
  }, { passive: false });
}
