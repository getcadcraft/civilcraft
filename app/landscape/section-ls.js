/* SPDX-License-Identifier: Apache-2.0 */
/**
 * section-ls.js — the Landscape workspace's sections and the publish set (0.8 LA.9, session `landscape-arch_PART_4`). No DOM. A section line
 * cuts the existing and the proposed ground (terrain-section.js cutSection), walls with their footings, paving and path build-ups,
 * planted-area build-ups (what is left after clipping), steps in profile, and draws the plants near the line as silhouettes at mature
 * size (lib/landscape/section.js). Sections go on their own sheets (plot.js, the details-sheet way: no second sheet engine); each section's
 * marker on the plan names its sheet ("A / L-5"), worked out from the publish order every time, so renaming or renumbering follows.
 *
 * state.landscape.sections = [{ id, name ('A'), pts: [a, b], band (how far either side plants are drawn, project units), vex (1–10) }]
 *
 *   cleanSections(list, units) · sectionInput(sec, ls, index, units, { existing, proposed }) → sectionDrawing input
 *   publishOrder(ls, kinds) → [{ kind, number: 'L-1', sections? }]   the numbering the markers and the publish set share
 *   sectionSheets(list, o) → sheets   (o as landscapeSheets: paper, landscape, units, title, fmt; list = [{ sec, drawing }])
 *   markerItems(ls, units, { unitPerMm, refs }) → plan items on L-SECT-MARK
 *   sheetIndex(entries, o) → the sheet list page · dwgEntitiesOf(drawing) → entities for writeDwg/writeDxf (section units, layers kept)
 */
import { cutSection } from '../terrain-section.js';
import { crossIntervals, crossAt, offsetFrom, sectionDrawing, lineLen } from './section.js';
import { wallLayout, stepsLayout } from './hardscape.js';
import { obstacles } from './planted.js';
import { placed, offsetLine } from './planting.js';
import { sizeOf } from './plants.js';
import { planSheet, orient, paperBy, MARGIN, TITLE_H, RGB } from '../plot.js';
import { t } from '../i18n.js';
import './layers.js';

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const XY = (q) => (q && fin(q.x) && fin(q.y) && Math.abs(q.x) < 1e9 && Math.abs(q.y) < 1e9 ? { x: q.x, y: q.y } : null);

export function cleanSections(list, units) {
  const out = [];
  for (const s of Array.isArray(list) ? list.slice(0, 200) : []) {
    const pts = (Array.isArray(s?.pts) ? s.pts.slice(0, 2) : []).map(XY).filter(Boolean);
    if (!/^l\d{1,9}$/.test(String(s?.id)) || pts.length < 2 || Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) < 1e-6) continue;
    out.push({ id: s.id, name: String(s.name ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 12) || 'A', pts,
      band: fin(s.band) && s.band >= 0 && s.band <= 1000 ? s.band : units === 'm' ? 3 : 10, vex: [1, 2, 5, 10].includes(s.vex) ? s.vex : 1 });
  }
  return out;
}

/** 1-D: intervals minus intervals. */
function minus(iv, cut) {
  let out = iv.map((x) => x.slice());
  for (const [c0, c1] of cut) out = out.flatMap(([a, b]) => (c1 <= a || c0 >= b ? [[a, b]] : [...(c0 > a ? [[a, c0]] : []), ...(c1 < b ? [[c1, b]] : [])]));
  return out.filter(([a, b]) => b - a > 1e-9);
}

export function sectionInput(sec, ls, index, units, { existing = null, proposed = null } = {}) {
  const line = sec.pts, L = lineLen(line), sf = proposed || existing;
  const runs = (s) => (s ? cutSection(s, line).runs.map((r) => r.map((q) => ({ d: q.d, z: q.z }))) : []);
  const input = { length: L, existing: proposed && existing ? runs(existing) : [], proposed: runs(sf), walls: [], bands: [], steps: [], plants: [] };
  const hard = ls.hardscape || [];
  for (const w of hard.filter((h) => h.kind === 'wall')) {
    const lay = wallLayout(w, sf, units);
    for (const d of crossAt(line, w.pts)) {
      const f = d / L, p = { x: line[0].x + f * (line[1].x - line[0].x), y: line[0].y + f * (line[1].y - line[0].y) };
      const st = lay.stations.reduce((b, s) => (!b || Math.hypot(s.x - p.x, s.y - p.y) < Math.hypot(b.x - p.x, b.y - p.y) ? s : b), null);
      if (st) input.walls.push({ d, top: st.top, footing: st.footing, thickness: w.thickness, footingWidth: w.footing.width, footingDepth: Math.min(w.footing.depth, units === 'm' ? 0.3 : 1), name: w.name });
    }
  }
  const strips = [];
  for (const h of hard) {
    const poly = h.kind === 'paving' ? h.pts : h.kind === 'path' ? [...offsetLine(h.pts, h.width / 2), ...offsetLine(h.pts, -h.width / 2).reverse()] : null;
    if (!poly) continue;
    for (const [d0, d1] of crossIntervals(line, poly)) input.bands.push({ d0, d1, layers: h.layers, kind: 'paving', name: h.name });
  }
  for (const s of hard.filter((h) => h.kind === 'steps')) {
    const lay = stepsLayout(s, sf, units);
    if (!lay.n) continue;
    const poly = [...offsetLine(s.pts, s.width / 2), ...offsetLine(s.pts, -s.width / 2).reverse()];
    strips.push(...crossIntervals(line, poly));
    for (const [d0, d1] of crossIntervals(line, poly)) {
      const prof = [], step = Math.max((d1 - d0) / 400, lay.going / 8);
      for (let d = d0; d <= d1 + 1e-9; d += step) {
        const f = Math.min(d, d1) / L, p = { x: line[0].x + f * (line[1].x - line[0].x), y: line[0].y + f * (line[1].y - line[0].y) };
        const sAlong = (p.x - s.pts[0].x) * lay.ux + (p.y - s.pts[0].y) * lay.uy;
        const k = sAlong >= lay.run ? lay.n : Math.max(0, Math.min(lay.n, Math.floor(sAlong / lay.going) + 1));
        prof.push({ d: Math.min(d, d1), z: lay.zB + k * lay.riser });
      }
      input.steps.push({ name: s.name, profile: prof });
    }
  }
  const obs = obstacles(ls).map((o) => crossIntervals(line, o.pts)).flat();
  for (const a of ls.areas || []) {
    const b = a.buildup, layers = [...(b.mulch ? [{ name: t('ls.a.l.mulch'), thickness: b.mulch }] : []), ...(b.topsoil ? [{ name: t('ls.a.l.topsoil'), thickness: b.topsoil }] : [])];
    if (!layers.length) continue;
    for (const [d0, d1] of minus(crossIntervals(line, a.pts), a.clip ? obs : [])) input.bands.push({ d0, d1, layers, kind: 'area', name: a.name });
  }
  const show = ls.show || 'mature', k = units === 'm' ? 1 : 0.3048;
  for (const p of placed(ls, index, units, sf ? (x, y) => sf.elevationAt(x, y) : null)) {
    const sp = index.get(p.key);
    if (!sp) continue;
    const o = offsetFrom(line, p), sz = sizeOf(sp, show);
    if (Math.abs(o.off) > sec.band || o.d <= 0 || o.d >= L || !fin(p.z)) continue;
    input.plants.push({ d: o.d, z: p.z, h: sz.h / k, s: sz.s / k, tree: sp.type === 'tree', name: sp.botanical });
  }
  return input;
}

/** The publish order: the plan sheets, the details, a sheet per few sections, then the worksheets; numbered L-1, L-2… */
export function publishOrder(ls, kinds = ['planting', 'grading', 'irrigation', 'details', 'sections', 'worksheets'], { perSheet = 4 } = {}) {
  const out = [];
  for (const k of kinds) {
    if (k === 'sections') { const S = ls.sections || []; for (let i = 0; i < S.length; i += perSheet) out.push({ kind: 'sections', sections: S.slice(i, i + perSheet).map((s) => s.id) }); }
    else out.push({ kind: k });
  }
  return out.map((e, i) => ({ ...e, number: 'L-' + (i + 1) }));
}

export function sectionSheets(list, o) {
  const out = [];
  const P = orient(paperBy(o.paper), o.landscape), per = Math.max(1, o.perSheet || 4);
  for (let i = 0; i < list.length; i += per) {
    const sh = planSheet({ layers: [], items: [] }, { extents: { minX: 0, minY: 0, maxX: 1, maxY: 1 }, paper: o.paper, landscape: o.landscape, scale: o.scale, title: t('ls.sh.title.sections', { name: o.title }), units: o.units });
    sh.chrome = sh.chrome.slice(0, 2);
    sh.chromeTexts = [sh.chromeTexts[0], { ...sh.chromeTexts[1], text: t('ls.sh.d.asnoted') }, sh.chromeTexts[2]];
    const cellH = (P.h - 2 * MARGIN - TITLE_H - 8) / Math.min(per, 2), cols = per > 2 ? 2 : 1, cellW = (P.w - 2 * MARGIN - 8) / cols;
    list.slice(i, i + per).forEach(({ sec, drawing }, j) => {
      const cx0 = MARGIN + 4 + (j % cols) * cellW, cy1 = P.h - MARGIN - 4 - Math.floor(j / cols) * cellH;
      const b = drawing.box;
      sh.chromeTexts.push({ color: '#000000', x: cx0 + 4, y: cy1 - 6, h: 3, rot: 0, text: t('ls.sec.title', { name: sec.name }), align: 'left' });
      if (!b) { sh.chromeTexts.push({ color: '#000000', x: cx0 + 4, y: cy1 - 14, h: 2, rot: 0, text: t('ls.sec.empty'), align: 'left' }); return; }
      const w = Math.max(1e-6, b.x1 - b.x0), h = Math.max(1e-6, b.y1 - b.y0);
      const fit = Math.min((cellW - 16) / w, (cellH - 24) / h), real = o.units === 'm' ? 1000 : 304.8;
      const std = [10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000].find((n) => real / n <= fit) || 5000, k = real / std;
      sh.chromeTexts.push({ color: '#000000', x: cx0 + 4, y: cy1 - 10, h: 1.8, rot: 0, text: t('ls.sec.scale', { scale: '1:' + std, vex: sec.vex }), align: 'left' });
      const ox = cx0 + 8 - b.x0 * k, oy = cy1 - cellH + 10 - b.y0 * k;
      const col = { 'L-SECT-EXST': RGB[8], 'L-SECT-GRND': '#000000', 'L-SECT-WALL': '#000000', 'L-SECT-BLDP': RGB[42] || '#8a6200', 'L-SECT-PLNT': RGB[3] || '#007a00' };
      for (const p of drawing.paths) sh.chrome.push({ color: col[p.layer] || '#000000', width: p.layer === 'L-SECT-GRND' || p.layer === 'L-SECT-WALL' ? 0.35 : 0.18, pts: p.pts.map((q) => ({ x: q.x * k + ox, y: q.y * k + oy })), closed: !!p.closed, ...(p.dashed ? { dash: [1.5, 1] } : {}) });
      for (const x of drawing.texts) sh.chromeTexts.push({ color: '#000000', x: x.x * k + ox, y: x.y * k + oy + (x.below ? -3 : 1.5), h: 1.6, rot: 0, text: String(x.text).slice(0, 60), align: x.align || 'left' });
    });
    out.push(sh);
  }
  return out;
}

/** Plan: the section line with its end ticks, its name at both ends and the sheet it is drawn on. */
export function markerItems(ls, units, { unitPerMm = 1, refs = {} } = {}) {
  const items = [];
  for (const s of ls.sections || []) {
    const [a, b] = s.pts, L = Math.hypot(b.x - a.x, b.y - a.y), ux = (b.x - a.x) / L, uy = (b.y - a.y) / L, tk = 3 * unitPerMm;
    items.push({ layer: 'L-SECT-MARK', kind: 'poly', pts: [a, b], dashed: true });
    for (const p of [a, b]) {
      items.push({ layer: 'L-SECT-MARK', kind: 'poly', pts: [{ x: p.x - uy * tk, y: p.y + ux * tk }, { x: p.x + uy * tk, y: p.y - ux * tk }] });
      items.push({ layer: 'L-SECT-MARK', kind: 'text', x: p.x - ux * 2 * tk * (p === a ? 1 : -1), y: p.y - uy * 2 * tk * (p === a ? 1 : -1), mm: 3, rot: 0, text: refs[s.id] ? `${s.name} / ${refs[s.id]}` : s.name, align: 'center', middle: true });
    }
  }
  return items;
}

/** The sheet list page that opens a publish set. */
export function sheetIndex(entries, o) {
  const sh = planSheet({ layers: [], items: [] }, { extents: { minX: 0, minY: 0, maxX: 1, maxY: 1 }, paper: o.paper, landscape: o.landscape, scale: o.scale, title: t('ls.pub.index', { name: o.title }), units: o.units });
  sh.chrome = sh.chrome.slice(0, 2);
  sh.chromeTexts = [sh.chromeTexts[0], { ...sh.chromeTexts[1], text: '' }, sh.chromeTexts[2]];
  const P = orient(paperBy(o.paper), o.landscape);
  let y = P.h - MARGIN - 14;
  sh.chromeTexts.push({ color: '#000000', x: MARGIN + 8, y, h: 3, rot: 0, text: t('ls.pub.list'), align: 'left' });
  y -= 8;
  for (const e of entries) { sh.chromeTexts.push({ color: '#000000', x: MARGIN + 8, y, h: 2.4, rot: 0, text: e.number, align: 'left' }, { color: '#000000', x: MARGIN + 28, y, h: 2.4, rot: 0, text: e.title, align: 'left' }); y -= 5; if (y < MARGIN + TITLE_H + 6) break; }
  return sh;
}

export function dwgEntitiesOf(drawing) {
  return [...drawing.paths.map((p) => ({ type: 'poly', layer: p.layer, pts: p.pts, closed: !!p.closed, elev: 0 })), ...drawing.texts.map((x) => ({ type: 'text', layer: x.layer, x: x.x, y: x.y, h: 0.25, rot: 0, text: String(x.text).slice(0, 120), align: x.align || 'left' }))];
}
