/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hosts/cad.js — the CadCraft adapter of the Interior lighting design add-on (copied to cadcraft/dev/addons/lightdesign/host.js by tools/lightdesign/sync.mjs).
 * 0.9 LD.8, session `lightdesign-09`. The engine (lib/) and the panel (main.js) know nothing of CadCraft; this file is all that does.
 *
 *   detect(api, { t }) → the host, or null when the api has no drawing to read and write (no api.doc.change)
 *   host.id = 'cad'
 *   host.rooms() → [{ name, poly [[x, y]] mm, area m², height: undefined }]   the closed shapes of the selection (or of the drawing when nothing is selected) as CadCraft's
 *       Laser reads them (laser-cad.js drawingInput: polylines, rectangles, circles, hatch loops, blocks expanded, layers that show) — at least 1 m², at most 60, our own layers left out
 *   host.draw({ luminaires, result, room }) → { n }   the luminaires (outline of the luminous opening, or a circle), the lux at each grid point and a summary line, on layers LD-LUMINAIRE and LD-LUX
 *       (one undo step; drawing again replaces them)     host.erase() → n     host.count()
 *   host.start(app) → adds the commands LDESIGN (calculate) and LDDRAW (calculate and draw)
 */
import { drawingInput } from '../../laser-cad.js';

/** A drawing loop [{ x, y, b? }] (b = the bulge of the arc to the next point) as plain [x, y] points, arcs cut into chords that sag no more than `tol`. */
function flatten(pts, tol) {
  const out = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    out.push([a.x, a.y]);
    const bulge = Number(a.b) || 0, dx = b.x - a.x, dy = b.y - a.y, chord = Math.hypot(dx, dy);
    if (!bulge || !(chord > 0)) continue;
    const sweep = 4 * Math.atan(bulge), r = chord / (2 * Math.sin(Math.abs(sweep) / 2)), off = r * Math.cos(Math.abs(sweep) / 2) * (bulge > 0 ? 1 : -1);
    const cx = (a.x + b.x) / 2 - (dy / chord) * off, cy = (a.y + b.y) / 2 + (dx / chord) * off, a0 = Math.atan2(a.y - cy, a.x - cx);
    const step = 2 * Math.acos(Math.max(0, 1 - tol / Math.max(r, tol))), steps = Math.max(1, Math.ceil(Math.abs(sweep) / Math.max(step, 0.01)));
    for (let k = 1; k < steps; k++) { const ang = a0 + sweep * (k / steps); out.push([cx + r * Math.cos(ang), cy + r * Math.sin(ang)]); }
  }
  return out;
}

export const LAYERS = { 'LD-LUMINAIRE': { color: 2, lineweight: 0.25 }, 'LD-LUX': { color: 5, lineweight: 0.13 } };

export function detect(api, { t }) {
  if (!api || !api.doc || typeof api.doc.change !== 'function') return null;
  const doc = () => api.doc;
  const mine = (d) => [...d.model.values()].filter((e) => String(e.layer).startsWith('LD-'));
  const per = () => { const u = doc().meta && doc().meta.units; const i = { '': 1, inches: 25.4, feet: 304.8, millimeters: 1, centimeters: 10, meters: 1000, yards: 914.4 }; return i[String(u || '')] ?? 1; };
  const host = {
    id: 'cad',
    rooms() {
      const d = doc(), sel = api.selection ? new Set(api.selection().map(Number)) : new Set();
      const inp = drawingInput(d, { only: sel.size ? sel : null, tol: 5 });
      const out = [];
      for (const s of inp.shapes) {
        if (!s.closed || String(s.layer).startsWith('LD-')) continue;
        for (const loop of s.loops) {
          const pts = flatten(loop, 5);
          let a = 0; for (let i = 0; i < pts.length; i++) { const u = pts[i], v = pts[(i + 1) % pts.length]; a += u[0] * v[1] - v[0] * u[1]; }
          const area = Math.abs(a) / 2e6;
          if (pts.length >= 3 && area >= 1) out.push({ name: s.layer + ' · ' + (out.length + 1), poly: pts, area });
        }
      }
      return out.sort((x, y) => y.area - x.area).slice(0, 60);
    },
    count: () => mine(doc()).length,
    erase() {
      const d = doc(); let n = 0;
      d.change(t('cad.erase.label'), () => { for (const e of mine(d)) { d.remove(e.id); n++; } });
      return n;
    },
    draw({ luminaires, result, room }) {
      const d = doc(), f = 1 / per(), poly = (pts, layer) => ({ type: 'poly', layer, closed: true, pts: pts.map((q) => ({ x: q[0] * f, y: q[1] * f })) });
      for (const [name, l] of Object.entries(LAYERS)) if (!d.layers.has(name)) d.addLayer({ name, ...l });
      let n = 0;
      d.change(t('cad.draw.label'), () => {
        for (const e of mine(d)) d.remove(e.id);
        for (const L of luminaires) {
          const w = L.photo.width, l = L.photo.length, [x, y] = L.p, hw = w > 0 && l > 0 && w <= 3000 && l <= 3000 ? [w / 2, l / 2] : null;
          const pts = hw ? [[x - hw[0], y - hw[1]], [x + hw[0], y - hw[1]], [x + hw[0], y + hw[1]], [x - hw[0], y + hw[1]]] : Array.from({ length: 16 }, (_, k) => [x + 150 * Math.cos(k * Math.PI / 8), y + 150 * Math.sin(k * Math.PI / 8)]);
          d.add(poly(pts, 'LD-LUMINAIRE')); n++;
        }
        const sp = result.grid.spacing, th = Math.max(60, Math.min(250, sp / 4));
        const step = Math.max(1, Math.ceil(result.grid.points.length / 600));
        result.grid.points.forEach((p, i) => { if (i % step === 0) d.add({ type: 'text', layer: 'LD-LUX', color: null, x: p[0] * f, y: p[1] * f, h: th * f, rot: 0, s: String(Math.round(result.grid.values[i])), ha: 'center', va: 'middle', wf: 1 }); });
        const xs = room.polygon.map((p) => p[0]), ys = room.polygon.map((p) => p[1]);
        d.add({ type: 'text', layer: 'LD-LUX', color: null, x: Math.min(...xs) * f, y: (Math.max(...ys) + 400) * f, h: 200 * f, rot: 0, s: t('cad.summary', { em: Math.round(result.em), emin: Math.round(result.emin), uo: result.uo.toFixed(2), ugr: result.ugr === null ? '-' : result.ugr.toFixed(1) }), ha: 'left', va: 'bottom', wf: 1 });
      });
      return { n };
    },
    start(app) {
      const say = (s) => { try { api.print(s); } catch { /* no history */ } };
      api.commands.add('LDESIGN', ['LD'], async () => { const r = app.run(); say(r.ok ? t('cmd.ldesign.done', r.summary) : r.message); }, { help: () => t('cmd.ldesign.help') });
      api.commands.add('LDDRAW', [], async () => { const r = app.run(); if (!r.ok) { say(r.message); return; } const dr = await app.draw(); say(t('draw.done', { n: dr.n })); }, { help: () => t('cmd.lddraw.help') });
    },
  };
  return host;
}
