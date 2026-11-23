/* SPDX-License-Identifier: Apache-2.0 */
/**
 * overlay-ui.js: civilcraft.js's 1 bindings for this topic, moved out of init() unchanged (0.11 PERF.71 round two, perf-finish-11 r2 civil-detail; no behaviour change).
 * mountOverlay(ctx) is called once by init(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables init() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { LABEL_FONT, mix } from './view.js';
import { bulgeThrough, flatten as flattenFl } from './featureline.js';
import { measure } from './measure.js';
import { t } from './i18n.js';
import { fixed, areaText, bearing } from './units.js';

export function mountOverlay(mc) {
  const { ST, units, syncDraftBar } = mc;

  // ------------------------------------------------------------------ overlay
  function drawOverlay(ctx, v) {
    syncDraftBar();   // every change to the draft redraws the overlay, so the bar follows it here
    const C = v.colors;
    const S = (p) => v.toScreen(p.x, p.y);
    const path = (pts, close) => { ctx.beginPath(); pts.forEach((p, i) => { const q = S(p); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }); if (close) ctx.closePath(); };
    const grip = (p, hot) => { const q = S(p); ctx.fillStyle = hot ? C.action : C.bg; ctx.strokeStyle = C.action; ctx.lineWidth = 1.5; ctx.fillRect(q.x - 4.5, q.y - 4.5, 9, 9); ctx.strokeRect(q.x - 4.5, q.y - 4.5, 9, 9); };
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    mc.drUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, ST.sel);   // 0.4 V19/V20: catchments, flooded structures
    mc.pcUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, ST.sel);   // 0.4 V21: the selected parcel
    mc.msUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, ST.sel);   // 0.7 LC.1: the selected mass
    for (const f of mc.gisReg.overlay) f(ctx, v, ST.sel);   // GIS: the picked feature
    mc.secUi.overlay(ctx, (x, y) => v.toScreen(x, y), C.action);   // 0.4 V13: the section on show
    if (ST.project.state.display.gradeOverlay) mc.flUi.gradeLayer(ctx, (x, y) => v.toScreen(x, y), C, ST.sel, LABEL_FONT);   // 0.5 WL.21: screen only
    mc.swUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, ST.sel);   // 0.6 WL.28: the selected swept path, its vehicle where the slider is
    mc.lsUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, ST.sel);   // 0.7 LD: the selected plant, bed or hedge; the plant under the pointer
    mc.plUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, ST.sel);   // 0.7 PL: the selection, its grips, and what fails (red)
    mc.pfUi.overlay(ctx, (x, y) => v.toScreen(x, y), C);   // 0.8 SU.914 rest: the saved free-section lines
    mc.solarUi.overlay(ctx, (x, y) => v.toScreen(x, y), C);   // 0.8 EG.15: ground PV tables
    mc.geoUi.overlay(ctx, (x, y) => v.toScreen(x, y), C);   // 0.8 EG.10/CV.1 (civil-geo_PART_3): junctions, striping, signs, crossings, turnouts
    mc.wmUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, ST.sel);   // 0.8 LC.16: water nodes, pipes, pressures
    mc.rvUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, ST.sel);   // 0.8 SU.957: rivers, cut lines, the flood extent when shown
    mc.flUi.overlay(ctx, (x, y) => v.toScreen(x, y), C, ST.sel, LABEL_FONT);   // 0.4 V14: the selected feature line, its elevations and grades
    const a = mc.selAl();
    if (a) {
      const al = ST.project.alignment(a);
      ctx.strokeStyle = mix(C.action, C.bg, 0.25); ctx.lineWidth = 5; ctx.globalAlpha = 0.45;
      path(al.ok ? al.polyline(Infinity, Math.PI / 180) : a.pis); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.action; ctx.lineWidth = 1; ctx.setLineDash([5, 4]); path(a.pis); ctx.stroke(); ctx.setLineDash([]);
      a.pis.forEach((p) => grip(p, false));
    }
    const d = mc.selPad();
    if (d) {
      ctx.strokeStyle = C.action; ctx.lineWidth = 3; ctx.globalAlpha = 0.5; path(d.pts, true); ctx.stroke(); ctx.globalAlpha = 1;
      d.pts.forEach((p) => grip(p, false));
    }
    const st = mc.selStruct(), pp = mc.selPipe();
    if (st) { const q = S(st); ctx.strokeStyle = C.action; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(q.x, q.y, 11, 0, Math.PI * 2); ctx.stroke(); grip(st, false); }
    if (pp) { const a = mc.findStruct(pp.from), b = mc.findStruct(pp.to); if (a && b) { ctx.strokeStyle = C.action; ctx.lineWidth = 6; ctx.globalAlpha = 0.45; path([a, b]); ctx.stroke(); ctx.globalAlpha = 1; } }
    if (ST.picked.size) {
      const vb = v.viewBounds();
      ctx.strokeStyle = C.action; ctx.lineWidth = 2; ctx.beginPath();
      const T = ST.project.pointTable;   // 0.11: columns first, the name only for a point in view
      for (const b of T.blocks) for (let k = 0; k < b.n; k++) {
        const o = b.irr && b.irr.get(k), x = o ? o.x : b.x[k], y = o ? o.y : b.y[k];
        if (x < vb.minX || x > vb.maxX || y < vb.minY || y > vb.maxY || !ST.picked.has(o ? o.n : T.rowName(b, k))) continue;
        const q = S({ x, y }); ctx.moveTo(q.x + 5, q.y); ctx.arc(q.x, q.y, 5, 0, Math.PI * 2);
      }
      ctx.stroke();
    }
    if (ST.drag?.kind === 'point' && ST.drag.moved && !ST.drag.cancelled) {
      const a = S(ST.drag.pt), b = S(ST.drag.at);
      ctx.strokeStyle = C.action; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]);
      ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.moveTo(b.x - 9, b.y); ctx.lineTo(b.x + 9, b.y); ctx.moveTo(b.x, b.y - 9); ctx.lineTo(b.x, b.y + 9); ctx.stroke();
    }
    if (ST.hoverPt) {
      const q = S(ST.hoverPt);
      ctx.strokeStyle = C.action; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(q.x, q.y, 7, 0, Math.PI * 2); ctx.stroke();
    }
    if (ST.drag?.kind === 'lasso' && ST.drag.path.length > 1) {   // window = solid, crossing = dashed green, fence = dashed orange path
      const m = ST.drag.mode || 'window', col = m === 'crossing' ? C.green : m === 'fence' ? C.orange : C.action;
      ctx.save();
      ctx.beginPath(); ctx.moveTo(ST.drag.path[0].x, ST.drag.path[0].y); for (const q of ST.drag.path.slice(1)) ctx.lineTo(q.x, q.y);
      if (m !== 'fence') { ctx.closePath(); ctx.fillStyle = col; ctx.globalAlpha = 0.1; ctx.fill(); ctx.globalAlpha = 1; }
      ctx.strokeStyle = col; ctx.lineWidth = m === 'fence' ? 1.5 : 1; ctx.setLineDash(m === 'window' ? [] : [5, 4]);
      ctx.stroke();
      ctx.restore();
    }
    if (ST.drag?.kind === 'box') {
      const a = ST.drag.s, b = ST.drag.last;
      ctx.strokeStyle = C.action; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
      ctx.fillStyle = mix(C.action, C.bg, 0.88);
      ctx.globalAlpha = 0.5; ctx.fillRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y)); ctx.globalAlpha = 1;
      ctx.strokeRect(Math.min(a.x, b.x) + 0.5, Math.min(a.y, b.y) + 0.5, Math.abs(b.x - a.x), Math.abs(b.y - a.y));
      ctx.setLineDash([]);
    }
    if (ST.tool === 'paste' && ST.pasteJob && ST.cursor) {
      // the carried points, as crosses, with the move from their own place shown by a thin line
      const j = ST.pasteJob, dx = ST.cursor.x - j.anchor.x, dy = ST.cursor.y - j.anchor.y;
      const vb = v.viewBounds(), many = j.pts.length > 20000;
      ctx.strokeStyle = C.action; ctx.lineWidth = 1.5; ctx.beginPath();
      j.pts.forEach((p, i) => {
        if (many && i % Math.ceil(j.pts.length / 20000)) return;
        const x = p.x + dx, y = p.y + dy;
        if (x < vb.minX || x > vb.maxX || y < vb.minY || y > vb.maxY) return;
        const q = S({ x, y }); ctx.moveTo(q.x - 4, q.y); ctx.lineTo(q.x + 4, q.y); ctx.moveTo(q.x, q.y - 4); ctx.lineTo(q.x, q.y + 4);
      });
      ctx.stroke();
      const a = S(j.anchor), b = S(ST.cursor);
      ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]);
    }
    if (ST.profCursor) {
      const pa = mc.findAl(ST.profCursor.id), al = pa && ST.project.alignment(pa);
      if (al?.ok) { const p = al.pointAt(ST.profCursor.sta), q = S(p); ctx.fillStyle = C.action; ctx.beginPath(); ctx.arc(q.x, q.y, 5, 0, Math.PI * 2); ctx.fill(); }
    }
    if (ST.tool !== 'select' && (ST.draft.length || ST.snapPt)) {
      const pts = ST.cursor && ST.tool !== 'breakline' && !(ST.tool === 'measure' && ST.measClosed) ? [...ST.draft, ST.cursor] : ST.snapPt ? [...ST.draft, ST.snapPt] : ST.draft;
      ctx.strokeStyle = ST.tool === 'parcel' || ST.tool === 'mass' ? C.ink2 : ST.tool === 'catchment' ? C.cyan || C.blue : ST.tool === 'pad' || ST.tool === 'pipe' ? C.blue : ST.tool === 'alignment' ? C.red : ST.tool === 'boundary' ? C.ink2 : ST.tool === 'feature' ? C.green || C.orange : ST.tool === 'measure' ? C.action : C.orange;
      ctx.lineWidth = 2; ctx.setLineDash(ST.tool === 'boundary' ? [7, 5] : ST.tool === 'measure' ? [4, 3] : []);
      if (ST.tool === 'feature' && ST.draft.length) {   // 0.6 WL.24: arcs drawn as arcs, the one being drawn through its curve point
        const dp = ST.draft.map((p) => ({ ...p, z: 0 }));
        if (ST.flMid && ST.cursor) { const b = bulgeThrough(dp[dp.length - 1], ST.flMid, ST.cursor); if (b) dp[dp.length - 1].b = b; }
        if (ST.cursor) dp.push({ x: ST.cursor.x, y: ST.cursor.y, z: 0 });
        path(flattenFl({ pts: dp, closed: false }), false); ctx.stroke();
        if (ST.flMid) { const q = S(ST.flMid); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q.x, q.y, 5, 0, Math.PI * 2); ctx.stroke(); }
      } else if (pts.length >= 2) { path(pts, (ST.tool === 'pad' || ST.tool === 'boundary' || ST.tool === 'catchment' || ST.tool === 'parcel' || ST.tool === 'mass' || (ST.tool === 'measure' && ST.measClosed) || mc.lsUi.closedTool(ST.tool)) && pts.length >= 3); ctx.stroke(); }
      ctx.setLineDash([]);
      ST.draft.forEach((p) => grip(p, true));
      if (ST.snapPt) { const q = S(ST.snapPt); ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.strokeRect(q.x - 6, q.y - 6, 12, 12); }
      if (ST.tool === 'measure' && ST.draft.length && (ST.cursor || ST.measClosed)) {   // 0.7 PL.10: the side being drawn and the running total, by the pointer
        const live = ST.measClosed ? ST.draft : [...ST.draft, ST.cursor], m = measure(live, { closed: ST.measClosed }), at = S(ST.measClosed ? ST.draft[ST.draft.length - 1] : ST.cursor);
        const seg = ST.measClosed ? null : m.segs[m.segs.length - 1];
        ctx.font = '600 12px ' + 'Helvetica, Arial, sans-serif'; ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';   // i18n-ignore: a CSS font stack
        ctx.fillText(seg ? t('meas.live', { l: fixed(seg.L, 2), total: fixed(m.total, 2), u: mc.u().short }) : t('meas.live.area', { a: areaText(m.area, units(), 2) }), at.x + 12, at.y - 8);
      }
      if (ST.tool === 'alignment' && ST.cursor && ST.draft.length) {
        const last = ST.draft[ST.draft.length - 1], L = Math.hypot(ST.cursor.x - last.x, ST.cursor.y - last.y), q = S(ST.cursor);
        ctx.font = '600 12px ' + 'Helvetica, Arial, sans-serif'; ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';   // i18n-ignore: a CSS font stack
        ctx.fillText(fixed(L, 2) + ' ' + mc.u().short + '  ' + bearing(Math.atan2(ST.cursor.y - last.y, ST.cursor.x - last.x)), q.x + 12, q.y - 8);
      }
    }
    // 0.10.1 #1970: the selected pad's or feature line's corners are numbered as its table numbers them, and the row in use is ringed
    const numbered = mc.selPad()?.pts || (ST.sel?.kind === 'feature' ? mc.flUi.find(ST.sel.id)?.pts : ST.sel?.kind === 'parcel' ? mc.pcUi.find(ST.sel.id)?.pts : null);
    if (numbered && numbered.length <= 400) {
      ctx.font = '600 11px Helvetica, Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';   // i18n-ignore: a CSS font stack
      numbered.forEach((p, i) => { const q = S(p), txt = String(i + 1), w2 = ctx.measureText(txt).width / 2 + 3; ctx.fillStyle = C.bg; ctx.globalAlpha = 0.85; ctx.fillRect(q.x - 14 - w2, q.y + 7, w2 * 2, 13); ctx.globalAlpha = 1; ctx.fillStyle = C.action; ctx.fillText(txt, q.x - 14, q.y + 14); });
    }
    const hotP = mc.hotPoint();
    if (hotP) {
      const q = S(hotP);
      ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(q.x, q.y, 11, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = C.orange; ctx.fillRect(q.x - 5.5, q.y - 5.5, 11, 11);
    }
    if (ST.snapHit) {   // 0.9 WB.10: where the pointer will land
      const q = S(ST.snapHit);
      ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.strokeRect(q.x - 6, q.y - 6, 12, 12);
      ctx.font = '600 12px Helvetica, Arial, sans-serif'; ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'top';   // i18n-ignore: a CSS font stack
      ctx.fillText(t('cv.snap.' + ST.snapHit.kind, { n: ST.snapHit.label || '' }) + '  ' + fixed(ST.snapHit.x, 2) + ', ' + fixed(ST.snapHit.y, 2), q.x + 10, q.y + 8);
    }
  }

  return { drawOverlay };
}
