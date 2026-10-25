/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sheets.js — the Landscape workspace's sheets (0.7 LD.6, session `landscape`), on CivilCraft's own sheet and plot code
 * (plot.js planSheet / toPdfPages: no second one). No DOM.
 *
 *   landscapeSheets(scene, { kinds: ['planting', 'grading', 'irrigation', 'details'], extents, paper, landscape, scale, units,
 *     title, plants: { rows, index }, irrigation: { zones, bom, heads }, details: { walls, pavings, steps } }) → [sheet]
 *   Each plan sheet is the plan with the other disciplines' layers hidden and a legend column on the right:
 *     planting   — plants, beds, hedges, hardscape and the ground; legend = the plant schedule with each plant's symbol
 *     grading    — contours, spot elevations, grading outlines, slope and flow, hardscape levels; legend = what the marks mean
 *     irrigation — heads, coverage, pipes, valves, the supply over the hardscape and bed outlines; legend = heads by type with
 *                  their symbol, pipes by size, valves and the zone table (and the calculation-aid line)
 *   details    — a sheet drawn from numbers: each wall's section at its tallest point (ground both sides, footing, wall with
 *                its batter, coping, drainage layer), each paving's build-up, each flight of steps in profile
 *   SHEET_LAYERS — which layers each plan shows (prefixes)
 */

import { planSheet, orient, paperBy, MARGIN, TITLE_H, RGB } from '../plot.js';
import { symbolPlan, sizeOf } from './plants.js';
import { t } from '../i18n.js';
import { GENERIC_HEADS } from './irrigation.js';

export const SHEET_KINDS = ['planting', 'grading', 'irrigation', 'details'];
export const SHEET_LAYERS = {
  planting: ['C-TOPO-', 'V-PROP', 'L-PLNT-', 'L-HARD-'],
  grading: ['C-TOPO-', 'C-GRAD-', 'L-GRAD-', 'L-HARD-', 'V-PROP'],
  irrigation: ['C-TOPO-MAJR', 'L-IRRG-', 'L-HARD-', 'L-PLNT-BEDS', 'L-PLNT-HDGE'],
};
const LEGEND_W = 78;   // mm: the legend column on a plan sheet

const ink = '#000000';
function hiddenFor(kind, scene) {
  const keep = SHEET_LAYERS[kind] || [];
  return new Set(scene.layers.map((l) => l.name).filter((n) => !keep.some((p) => n.startsWith(p))));
}

/** A plan sheet with the legend column: the extents are widened so the plan sits left of the column. */
function planWithLegend(scene, kind, o) {
  const s = o.scale.mmPerUnit, ext = { ...o.extents, maxX: o.extents.maxX + LEGEND_W / s };
  const sh = planSheet(scene, { extents: ext, paper: o.paper, landscape: o.landscape, scale: o.scale, title: t('ls.sh.title.' + kind, { name: o.title }), units: o.units, notes: o.notes || [], hidden: hiddenFor(kind, scene) });
  const x0 = sh.clip.x1 - LEGEND_W;
  sh.clip = { ...sh.clip, x1: x0 };   // the plan stops at the column
  sh.chrome.push({ color: ink, width: 0.35, pts: [{ x: x0, y: sh.clip.y0 }, { x: x0, y: sh.clip.y1 }] });
  return { sh, col: { x0: x0 + 3, x1: x0 + LEGEND_W - 3, y: sh.clip.y1 - 30 } };   // below the north arrow
}
const T = (sh, x, y, text, h = 2.2, align = 'left') => sh.chromeTexts.push({ color: ink, x, y, h, rot: 0, text: String(text).slice(0, 80), align });
const L = (sh, pts, w = 0.18, color = ink, closed = false) => sh.chrome.push({ color, width: w, pts, closed });
const A = (sh, x, y, r, a0 = 0, a1 = 2 * Math.PI, color = ink, w = 0.18) => sh.chrome.push({ color, width: w, arc: { x, y, r, a0, a1 } });

function plantingLegend(sh, col, plants, units) {
  let y = col.y;
  T(sh, col.x0, y, t('ls.sh.legend.plants'), 3); y -= 6;
  T(sh, col.x0 + 12, y, t('ls.sch.name'), 1.8); T(sh, col.x1, y, t('ls.sch.qty'), 1.8, 'right'); y -= 2;
  L(sh, [{ x: col.x0, y }, { x: col.x1, y }], 0.25); y -= 5;
  for (const r of plants.rows) {
    if (y < sh.clip.y0 + 8) { T(sh, col.x0, y, t('ls.sh.more', { n: plants.rows.length }), 1.8); break; }
    const sp = plants.index.get(r.key);
    if (sp) {   // the plant's own symbol, 7 mm across
      const plan = symbolPlan(sp, { which: 'mature', scale: 7 / sizeOf(sp, 'mature').s });
      for (const e of plan.entities) {
        const cx = col.x0 + 4.5, cy = y + 1;
        const color = RGB[3];
        if (e.type === 'circle') A(sh, cx + e.x, cy + e.y, e.r, 0, 2 * Math.PI, color);
        else if (e.type === 'line') L(sh, [{ x: cx + e.x1, y: cy + e.y1 }, { x: cx + e.x2, y: cy + e.y2 }], 0.13, color);
        else if (e.type === 'poly') L(sh, e.pts.map((p) => ({ x: cx + p[0], y: cy + p[1] })), 0.13, color, e.closed);
        else if (e.type === 'arc') A(sh, cx + e.x, cy + e.y, e.r, (e.a0 * Math.PI) / 180, (e.a1 * Math.PI) / 180, color);
      }
    }
    T(sh, col.x0 + 12, y + 1.5, r.botanical, 2); T(sh, col.x0 + 12, y - 1.5, r.name + (r.container ? ' · ' + r.container : ''), 1.6);   // i18n-ignore: a separator
    T(sh, col.x1, y, r.qty, 2.2, 'right');
    y -= 9;
  }
  L(sh, [{ x: col.x0, y: y + 4 }, { x: col.x1, y: y + 4 }], 0.25);
  T(sh, col.x0, y, t('ls.sch.total'), 2.2); T(sh, col.x1, y, plants.rows.reduce((a, r) => a + r.qty, 0), 2.2, 'right');
  void units;
}
function gradingLegend(sh, col, units) {
  let y = col.y;
  T(sh, col.x0, y, t('ls.sh.legend.grading'), 3); y -= 7;
  const row = (draw, text) => { draw(col.x0, y + 1); T(sh, col.x0 + 14, y, text, 2); y -= 7; };
  row((x, yy) => L(sh, [{ x, y: yy }, { x: x + 10, y: yy }], 0.35), t('ls.sh.g.major'));
  row((x, yy) => L(sh, [{ x, y: yy }, { x: x + 10, y: yy }], 0.13), t('ls.sh.g.minor'));
  row((x, yy) => { L(sh, [{ x: x + 3, y: yy - 1.5 }, { x: x + 6, y: yy + 1.5 }], 0.18, RGB[6]); L(sh, [{ x: x + 3, y: yy + 1.5 }, { x: x + 6, y: yy - 1.5 }], 0.18, RGB[6]); }, t('ls.sh.g.spot'));
  row((x, yy) => { L(sh, [{ x, y: yy }, { x: x + 10, y: yy }], 0.18, RGB[4]); L(sh, [{ x: x + 7.5, y: yy + 1.2 }, { x: x + 10, y: yy }, { x: x + 7.5, y: yy - 1.2 }], 0.18, RGB[4]); }, t('ls.sh.g.flow'));
  row((x, yy) => L(sh, [{ x, y: yy - 2 }, { x: x + 10, y: yy - 2 }, { x: x + 5, y: yy + 2 }], 0.18, RGB[1], true), t('ls.sh.g.steep'));
  row((x, yy) => A(sh, x + 5, yy, 2.5, 0, 2 * Math.PI, RGB[4]), t('ls.sh.g.pond'));
  T(sh, col.x0, y, t('ls.sh.g.units', { u: units === 'm' ? 'm' : 'ft' }), 1.8);
}
function irrigationLegend(sh, col, irr, units, fmt) {
  let y = col.y;
  T(sh, col.x0, y, t('ls.sh.legend.irrigation'), 3); y -= 6;
  for (const h of irr.bom.heads) {
    if (y < sh.clip.y0 + 40) break;
    const a1 = (h.arc * Math.PI) / 180;
    A(sh, col.x0 + 4, y + 1, 3, 0, a1, RGB[4]); A(sh, col.x0 + 4, y + 1, 0.6, 0, 2 * Math.PI, RGB[5]);
    const name = GENERIC_HEADS.some((g) => g.key === h.type) ? t('ls.i.h.' + h.type) : h.name;
    T(sh, col.x0 + 10, y, `${name} ${h.arc}°`, 1.8); T(sh, col.x1, y, h.n, 2, 'right');
    y -= 7;
  }
  for (const p of irr.bom.pipes) { L(sh, [{ x: col.x0, y: y + 1 }, { x: col.x0 + 8, y: y + 1 }], 0.25, RGB[5]); T(sh, col.x0 + 10, y, p.label, 1.8); T(sh, col.x1, y, fmt.len(p.m), 1.8, 'right'); y -= 5; }
  L(sh, [{ x: col.x0 + 2, y: y - 1 }, { x: col.x0 + 6, y: y - 1 }, { x: col.x0 + 6, y: y + 3 }, { x: col.x0 + 2, y: y + 3 }], 0.25, RGB[5], true);
  T(sh, col.x0 + 10, y, t('ls.sh.i.valves', { n: irr.bom.valves }), 1.8); y -= 8;
  T(sh, col.x0, y, t('ls.sh.i.zones'), 2.4); y -= 5;
  for (const z of irr.zones) {
    if (y < sh.clip.y0 + 12) break;
    T(sh, col.x0, y, z.name, 1.8); T(sh, col.x1, y, `${fmt.flow(z.flow)} · ${fmt.press(z.pressureNeed)}`, 1.8, 'right');   // i18n-ignore: a separator
    y -= 4.5;
  }
  T(sh, col.x0, sh.clip.y0 + 4, t('ls.i.aid'), 1.5);
}

/** The details sheet: each wall's section, each paving's build-up, each flight of steps, drawn from numbers in boxes. */
function detailsSheet(o) {
  const sh = planSheet({ layers: [], items: [] }, { extents: { minX: 0, minY: 0, maxX: 1, maxY: 1 }, paper: o.paper, landscape: o.landscape, scale: o.scale, title: t('ls.sh.title.details', { name: o.title }), units: o.units });
  // a details sheet has no plan: no north arrow or scale bar; each detail names its own scale
  sh.chrome = sh.chrome.slice(0, 2);
  sh.chromeTexts = [sh.chromeTexts[0], { ...sh.chromeTexts[1], text: t('ls.sh.d.asnoted') }, sh.chromeTexts[2]];
  const P = orient(paperBy(o.paper), o.landscape), box = { x0: MARGIN + 6, y1: P.h - MARGIN - 6, w: 0, h: 0 };
  const per = o.units === 'm' ? 1000 : 304.8;   // mm of real size per project unit
  const items = [...(o.details.walls || []).map((w) => ['wall', w]), ...(o.details.pavings || []).map((p) => ['paving', p]), ...(o.details.steps || []).map((s) => ['steps', s])];
  const cellW = 120, cellH = 90, cols = Math.max(1, Math.floor((P.w - 2 * MARGIN - 12) / cellW)), rows = Math.max(1, Math.floor((P.h - 2 * MARGIN - TITLE_H - 12) / cellH));
  items.slice(0, cols * rows).forEach(([kind, d], i) => {
    const cx0 = box.x0 + (i % cols) * cellW, cy1 = box.y1 - Math.floor(i / cols) * cellH;
    const drawIn = (w, h) => { const sc = Math.min((cellW - 20) / w, (cellH - 28) / h); const sStd = [5, 10, 20, 25, 50, 100].find((n) => 1 / n <= sc / per) || 100; return { k: per / sStd, label: '1:' + sStd }; };   // mm on paper per project unit
    if (kind === 'wall') {
      const st = d.layout.stations.reduce((a, b) => (b.height > a.height ? b : a), d.layout.stations[0]);
      if (!st) return;
      const w = d.wall, H = st.top - st.footing, W = w.footing.width * 2.2;
      const { k, label } = drawIn(W, H + 0.3 * H);
      const bx = cx0 + cellW / 2, by = cy1 - cellH + 18, z = (v) => by + (v - st.footing) * k;
      const half = (w.thickness / 2) * k, fw = (w.footing.width / 2) * k, ft = Math.min(w.footing.depth * 0.6, 0.3 * (o.units === 'm' ? 1 : 3.28)) * k;
      const bat = Math.tan((w.batter * Math.PI) / 180) * (st.top - st.footing) * k;
      L(sh, [{ x: bx - fw, y: z(st.footing) - ft }, { x: bx + fw, y: z(st.footing) - ft }, { x: bx + fw, y: z(st.footing) }, { x: bx - fw, y: z(st.footing) }], 0.35, ink, true);   // footing
      L(sh, [{ x: bx - half, y: z(st.footing) }, { x: bx + half, y: z(st.footing) }, { x: bx + half - bat, y: z(st.top) }, { x: bx - half - bat, y: z(st.top) }], 0.5, ink, true);   // wall
      const co = w.coping.overhang * k, ct = w.coping.thickness * k;
      if (ct > 0) L(sh, [{ x: bx - half - bat - co, y: z(st.top) }, { x: bx + half - bat + co, y: z(st.top) }, { x: bx + half - bat + co, y: z(st.top) + ct }, { x: bx - half - bat - co, y: z(st.top) + ct }], 0.35, ink, true);
      if (w.wall === 'retaining' && w.drain > 0) L(sh, [{ x: bx + half, y: z(st.footing) }, { x: bx + half + w.drain * k, y: z(st.footing) }, { x: bx + half + w.drain * k - bat, y: z(st.top) - 0.1 * k }, { x: bx + half - bat, y: z(st.top) - 0.1 * k }], 0.18, RGB[8], true);
      L(sh, [{ x: cx0 + 6, y: z(st.ground) }, { x: bx - half, y: z(st.ground) }], 0.35, RGB[8]);   // ground in front
      L(sh, [{ x: bx + half + (w.drain || 0) * k, y: z(w.wall === 'retaining' ? st.top - 0.1 * (o.units === 'm' ? 1 : 3.28) : st.ground) }, { x: cx0 + cellW - 6, y: z(w.wall === 'retaining' ? st.top - 0.1 * (o.units === 'm' ? 1 : 3.28) : st.ground) }], 0.35, RGB[8]);   // retained ground
      T(sh, cx0 + 6, cy1 - 4, t('ls.sh.d.wall', { name: w.name }), 2.6); T(sh, cx0 + 6, cy1 - 8, t('ls.sh.d.wallsub', { h: o.fmt.lvl(st.height), scale: label }), 1.8);
      T(sh, bx + half + 2, z(st.top), t('ls.h.tw.bw', { tw: o.fmt.lvl(st.top), bw: o.fmt.lvl(st.ground) }), 1.6);
    } else if (kind === 'paving') {
      const th = d.layers.reduce((a, l) => a + l.thickness, 0);
      const { k, label } = drawIn(th * 4, th * 1.3);
      let y = cy1 - 20, x0 = cx0 + 10, x1 = cx0 + cellW - 40;
      for (const l of d.layers) {
        const h = l.thickness * k;
        L(sh, [{ x: x0, y }, { x: x1, y }, { x: x1, y: y - h }, { x: x0, y: y - h }], 0.25, ink, true);
        T(sh, x1 + 3, y - h / 2 - 0.8, `${l.name} ${o.fmt.thick(l.thickness)}`, 1.8);
        y -= h;
      }
      T(sh, cx0 + 6, cy1 - 4, t('ls.sh.d.paving', { name: d.name }), 2.6); T(sh, cx0 + 6, cy1 - 8, t('ls.sh.d.scale', { scale: label }), 1.8);
    } else {
      const s = d.layout;
      if (!s.n) return;
      const { k, label } = drawIn(s.run + s.going, s.H * 1.2);
      const bx = cx0 + 10, by = cy1 - cellH + 14, pts = [{ x: bx, y: by }];
      for (let i = 1; i <= s.n; i++) { const xi = bx + (i - 1) * s.going * k; pts.push({ x: xi, y: by + i * s.riser * k }); if (i < s.n) pts.push({ x: xi + s.going * k, y: by + i * s.riser * k }); }
      pts.push({ x: pts[pts.length - 1].x + s.going * k, y: pts[pts.length - 1].y });
      L(sh, pts, 0.5);
      T(sh, cx0 + 6, cy1 - 4, t('ls.sh.d.steps', { name: d.steps.name }), 2.6); T(sh, cx0 + 6, cy1 - 8, t('ls.h.steps.label', { n: s.n, r: o.fmt.lvl(s.riser), g: o.fmt.lvl(s.going) }) + '   ' + label, 1.8);
    }
    L(sh, [{ x: cx0, y: cy1 }, { x: cx0 + cellW - 4, y: cy1 }, { x: cx0 + cellW - 4, y: cy1 - cellH + 4 }, { x: cx0, y: cy1 - cellH + 4 }], 0.13, RGB[8], true);
  });
  if (!items.length) T(sh, MARGIN + 10, P.h / 2, t('ls.sh.d.none'), 3);
  return sh;
}

export function landscapeSheets(scene, o) {
  const out = [];
  for (const kind of o.kinds) {
    if (kind === 'details') { out.push(detailsSheet(o)); continue; }
    if (!SHEET_LAYERS[kind]) continue;
    const { sh, col } = planWithLegend(scene, kind, o);
    if (kind === 'planting') plantingLegend(sh, col, o.plants, o.units);
    else if (kind === 'grading') gradingLegend(sh, col, o.units);
    else irrigationLegend(sh, col, o.irrigation, o.units, o.fmt);
    out.push(sh);
  }
  return out;
}
