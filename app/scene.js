/* SPDX-License-Identifier: Apache-2.0 */
/**
 * scene.js — the plan drawing as plain linework and labels, in model coordinates. No DOM.
 * The screen (view.js), the DXF (dxf.js) and the PDF plot (plot.js) all draw from it, so what you
 * see is what you export.
 *
 *   planScene(state, opts) → { layers: LAYERS, items }
 *     state: { units, points, surface, contours: {interval, major, list}, breaklines, boundary,
 *              alignments: [{name, alignment}], pads: [{name, pts, daylight, rays}], corridors: [{lines, sections}],
 *              network: {net, check} }
 *     opts:  { mmPerUnit (paper mm per model unit — sets label sizes and spacing), show: {...} } — show.pointLabelText 'n' | 'nz' | 'nzd' (default): number, + elevation, + description
 *   items: { layer, kind:'poly', pts, closed, elev?, z? (3D) } | { layer, kind:'arc', c, r, a0, a1 }
 *          | { layer, kind:'text', x, y, mm (paper height), rot, text, align } | { layer, kind:'point', x, y, z }
 *   toDxfEntities(scene, mmPerUnit) → entities for writeDxf (text heights in model units)
 */

import { t } from './i18n.js';
import { formatStation, fixed } from './units.js';
import { structGeom } from './structs.js';   // 0.6 WL.27: rectangular structure types

export const LAYERS = [
  { name: 'C-TOPO-MINR', token: 'minor', aci: 8, get label() { return t('scene.layer.minr'); } },
  { name: 'C-TOPO-MAJR', token: 'major', aci: 7, get label() { return t('scene.layer.majr'); } },
  { name: 'C-TOPO-TEXT', token: 'major', aci: 7, get label() { return t('scene.layer.topotext'); } },
  { name: 'C-TOPO-TINN', token: 'tin', aci: 8, get label() { return t('scene.layer.tin'); } },
  { name: 'C-TOPO-BRKL', token: 'orange', aci: 30, get label() { return t('scene.layer.brkl'); } },
  { name: 'C-TOPO-BNDY', token: 'ink2', aci: 7, get label() { return t('scene.layer.bndy'); } },
  { name: 'C-TOPO-SLOP', token: 'cyan', aci: 4, get label() { return t('scene.layer.slop'); } },
  { name: 'V-NODE', token: 'green', aci: 3, get label() { return t('scene.layer.node'); } },
  { name: 'V-NODE-TEXT', token: 'green', aci: 3, get label() { return t('scene.layer.nodetext'); } },
  { name: 'V-NODE-LINE', token: 'green', aci: 3, get label() { return t('scene.layer.figure'); } },   // 0.4 V16 lines from line codes (codes-ui.js)
  { name: 'C-ROAD-CNTR', token: 'red', aci: 1, get label() { return t('scene.layer.cntr'); } },
  { name: 'C-ROAD-STAN', token: 'red', aci: 1, get label() { return t('scene.layer.stan'); } },
  { name: 'C-ROAD-CORR', token: 'ochre', aci: 2, get label() { return t('scene.layer.corr'); } },
  { name: 'C-ROAD-SCTN', token: 'ink2', aci: 8, get label() { return t('scene.layer.sctn'); } },   // 0.4 V13 sample lines (sections-ui.js adds them)
  { name: 'C-GRAD-PADS', token: 'blue', aci: 5, get label() { return t('scene.layer.pads'); } },
  { name: 'C-GRAD-DAYL', token: 'magenta', aci: 6, get label() { return t('scene.layer.dayl'); } },
  { name: 'C-GRAD-SLOP', token: 'magenta', aci: 6, get label() { return t('scene.layer.gradslop'); } },
  { name: 'C-GRAD-FEAT', token: 'green', aci: 3, get label() { return t('scene.layer.feat'); } },
  { name: 'C-ROAD-SWPT', token: 'orange', aci: 30, get label() { return t('scene.layer.swpt'); } },   // 0.6 WL.28 swept paths (swept-ui.js adds them)   // 0.4 V14 feature lines (features-ui.js adds them)
  { name: 'V-PROP', token: 'ink2', aci: 7, get label() { return t('scene.layer.prop'); } },   // 0.4 V21 parcels (parcels-ui.js adds them)
  { name: 'V-PROP-TEXT', token: 'ink2', aci: 7, get label() { return t('scene.layer.proptext'); } },
  { name: 'C-STRM-PIPE', token: 'blue', aci: 5, get label() { return t('scene.layer.pipe'); } },
  { name: 'C-STRM-STRC', token: 'blue', aci: 5, get label() { return t('scene.layer.strc'); } },
  { name: 'C-STRM-TEXT', token: 'blue', aci: 5, get label() { return t('scene.layer.strmtext'); } },
  { name: 'C-STRM-PROB', token: 'red', aci: 1, get label() { return t('scene.layer.prob'); } },
];

export function planScene(state, { mmPerUnit = 1, show = {} } = {}) {
  const items = [];
  const u = state.units || 'ft';
  const S = { triangles: false, contours: true, labels: true, breaklines: true, outline: true, points: true, pointLabels: false, slopes: false, alignments: true, pads: true, ...show };
  if (!['n', 'nz', 'nzd'].includes(S.pointLabelText)) S.pointLabelText = 'nzd';
  const unitPerMm = 1 / mmPerUnit;
  const sf = state.surface;

  if (sf && S.triangles) {
    const E = sf.edges(), { X, Y, ox, oy } = sf;
    for (let i = 0; i < E.length; i += 2) items.push({ layer: 'C-TOPO-TINN', kind: 'poly', pts: [{ x: X[E[i]] + ox, y: Y[E[i]] + oy }, { x: X[E[i + 1]] + ox, y: Y[E[i + 1]] + oy }] });
  }
  if (sf && S.outline) for (const loop of sf.outline()) items.push({ layer: 'C-TOPO-BNDY', kind: 'poly', pts: loop, closed: true });
  const C = state.contours;
  if (sf && S.contours && C?.list) {
    const major = C.interval * (C.major || 5);
    const isMajor = (z) => Math.abs(z / major - Math.round(z / major)) < 1e-6;
    const dec = decimalsOf(C.interval);
    for (const c of C.list) {
      const maj = isMajor(c.z);
      items.push({ layer: maj ? 'C-TOPO-MAJR' : 'C-TOPO-MINR', kind: 'poly', pts: c.pts, closed: c.closed, elev: c.z });
      if (maj && S.labels) for (const l of labelsAlong(c.pts, 60 * unitPerMm, 25 * unitPerMm)) items.push({ layer: 'C-TOPO-TEXT', kind: 'text', x: l.x, y: l.y, rot: l.rot, mm: 2.0, align: 'center', middle: true, text: fixed(c.z, dec), mask: true });
    }
  }
  if (sf && S.slopes) {
    const arrows = sf.slopes(), len = 4 * unitPerMm;
    for (const a of arrows) {
      if (a.size < len * 0.8 || !(a.slope > 1e-6)) continue;
      const dx = Math.cos(a.dir) * len / 2, dy = Math.sin(a.dir) * len / 2;
      const tip = { x: a.x + dx, y: a.y + dy };
      const h = len * 0.3, ang = a.dir;
      items.push({ layer: 'C-TOPO-SLOP', kind: 'poly', pts: [{ x: a.x - dx, y: a.y - dy }, tip] });
      items.push({ layer: 'C-TOPO-SLOP', kind: 'poly', pts: [{ x: tip.x - Math.cos(ang - 0.45) * h, y: tip.y - Math.sin(ang - 0.45) * h }, tip, { x: tip.x - Math.cos(ang + 0.45) * h, y: tip.y - Math.sin(ang + 0.45) * h }] });
    }
  }
  if (S.breaklines) for (const b of state.breaklines || []) items.push({ layer: 'C-TOPO-BRKL', kind: 'poly', pts: b.pts, z: true });
  if (S.points) for (const p of state.points || []) {
    items.push({ layer: 'V-NODE', kind: 'point', x: p.x, y: p.y, z: p.z ?? 0 });
    if (S.pointLabels) items.push({ layer: 'V-NODE-TEXT', kind: 'text', x: p.x + 1.2 * unitPerMm, y: p.y + 0.4 * unitPerMm, rot: 0, mm: 1.5, align: 'left', text: p.n + (S.pointLabelText !== 'n' && p.z !== null ? '  ' + fixed(p.z, 2) : '') + (S.pointLabelText === 'nzd' && p.d ? '  ' + p.d : '') });
  }
  if (S.pads) for (const pd of state.pads || []) {
    items.push({ layer: 'C-GRAD-PADS', kind: 'poly', pts: pd.pts, closed: true, elev: pd.z });
    if (pd.daylight?.length) {
      items.push({ layer: 'C-GRAD-DAYL', kind: 'poly', pts: pd.daylight, closed: true, z: true });
      for (const r of pd.rays || []) if (r.d > 1e-6) items.push({ layer: 'C-GRAD-SLOP', kind: 'poly', pts: [{ x: r.x0, y: r.y0 }, { x: r.x, y: r.y }] });
    }
    const c = centroid(pd.pts);
    items.push({ layer: 'C-GRAD-PADS', kind: 'text', x: c.x, y: c.y, rot: 0, mm: 2.2, align: 'center', middle: true, text: t('scene.pad.label', { name: pd.name || t('scene.pad.default'), z: fixed(pd.z, 2) }), mask: true });
  }
  if (S.pads) for (const c of state.corridors || []) {
    const L = c.lines || {};
    for (const k of ['EOP_L', 'EOP_R', 'SH_L', 'SH_R']) if (L[k]?.length >= 2) items.push({ layer: 'C-ROAD-CORR', kind: 'poly', pts: L[k], z: true });
    for (const k of ['DL_L', 'DL_R']) if (L[k]?.length >= 2) items.push({ layer: 'C-GRAD-DAYL', kind: 'poly', pts: L[k], z: true });
    for (const sec of c.sections || []) for (const side of ['L', 'R']) { const q = sec[side]; if (q && Math.hypot(q[3].x - q[2].x, q[3].y - q[2].y) > 1e-6) items.push({ layer: 'C-GRAD-SLOP', kind: 'poly', pts: [q[2], q[3]] }); }
  }
  if (S.alignments) for (const a of state.alignments || []) {
    const al = a.alignment;
    if (!al?.ok) {
      if (a.pis?.length >= 2) items.push({ layer: 'C-ROAD-CNTR', kind: 'poly', pts: a.pis, dashed: true });
      continue;
    }
    for (const e of al.elements) {
      if (e.type === 'line') items.push({ layer: 'C-ROAD-CNTR', kind: 'poly', pts: [e.p0, e.p1] });
      else {
        const a1 = e.a0 + (e.ccw ? e.delta : -e.delta);
        items.push({ layer: 'C-ROAD-CNTR', kind: 'arc', c: e.c, r: e.r, a0: e.ccw ? e.a0 : a1, a1: e.ccw ? a1 : e.a0 });
      }
    }
    // stationing: ticks every minor step, labels every major step
    const major = 100, minor = u === 'm' ? 20 : 50;
    const tick = 1.5 * unitPerMm;
    for (const t of al.ticks(minor)) {
      const isMaj = Math.abs(t.sta / major - Math.round(t.sta / major)) < 1e-9;
      const nx = Math.sin(t.dir), ny = -Math.cos(t.dir);   // to the right
      const k = isMaj ? tick * 1.6 : tick;
      items.push({ layer: 'C-ROAD-STAN', kind: 'poly', pts: [{ x: t.x - nx * k, y: t.y - ny * k }, { x: t.x + nx * k, y: t.y + ny * k }] });
      if (isMaj) {
        let rot = t.dir - Math.PI / 2;   // reads along the tick, from the left side outward
        const off = -(k + 0.8 * unitPerMm);
        let align = 'right';
        if (Math.cos(rot) < -1e-9 || (Math.abs(Math.cos(rot)) <= 1e-9 && Math.sin(rot) < 0)) { rot += Math.PI; align = 'left'; }
        items.push({ layer: 'C-ROAD-STAN', kind: 'text', x: t.x + nx * off, y: t.y + ny * off, rot, mm: 1.8, align, middle: true, text: formatStation(t.sta, u, 0) });
      }
    }
    for (const e of al.elements) {
      if (e.type !== 'arc') continue;
      for (const [p, sta, kind] of [[e.p0, e.sta, 'PC'], [e.p1, e.sta + e.len, 'PT']]) {
        const pt = al.pointAt(sta), nx = Math.sin(pt.dir), ny = -Math.cos(pt.dir);
        const k = 3 * unitPerMm;
        items.push({ layer: 'C-ROAD-STAN', kind: 'poly', pts: [{ x: p.x, y: p.y }, { x: p.x + nx * k, y: p.y + ny * k }] });
        // along the tick, outward to the right, kept upright
        let rot = pt.dir - Math.PI / 2, align = 'left';
        if (Math.cos(rot) < -1e-9) { rot += Math.PI; align = 'right'; }
        items.push({ layer: 'C-ROAD-STAN', kind: 'text', x: p.x + nx * (k + 0.8 * unitPerMm), y: p.y + ny * (k + 0.8 * unitPerMm), rot, mm: 1.6, align, middle: true, text: t(kind === 'PC' ? 'scene.sta.pc' : 'scene.sta.pt', { sta: formatStation(sta, u) }) });
      }
    }
    const p0 = al.pointAt(al.start);
    items.push({ layer: 'C-ROAD-CNTR', kind: 'text', x: p0.x - Math.cos(p0.dir) * 3 * unitPerMm, y: p0.y - Math.sin(p0.dir) * 3 * unitPerMm, rot: 0, mm: 2.2, align: 'right', middle: true, text: a.name || t('scene.al.default') });
  }
  if (S.pipes !== false && state.network?.net) {
    const { net, check } = state.network;
    const per = u === 'm' ? 1000 : 12, diaTxt = (d) => (u === 'm' ? fixed(d, 0) + ' mm' : fixed(d, 0) + '"');
    const bad = new Set((check?.problems || []).map((p) => p.id));
    const byId = new Map(net.structures.map((x) => [x.id, x]));
    for (const p of net.pipes) {
      const a = byId.get(p.from), b = byId.get(p.to);
      if (!a || !b) continue;
      const L = Math.hypot(b.x - a.x, b.y - a.y);
      if (L < 1e-9) continue;
      const ux = (b.x - a.x) / L, uy = (b.y - a.y) / L;
      // from the edge of one structure to the next
      // 0.6 WL.27: from the structure's centre to its wall along the pipe (a rectangle lies along its outlet pipe)
      const half = (x, dx, dy) => {
        const g = structGeom(x, net, u);
        if (!g.type) return (x.dia || 0) / per / 2;
        if (g.shape !== 'rect') return g.outW / 2;
        const out = net.pipes.find((q) => q.from === x.id), to = out && byId.get(out.to), ang = to ? Math.atan2(to.y - x.y, to.x - x.x) : 0;
        const lx = Math.abs(dx * Math.cos(ang) + dy * Math.sin(ang)), ly = Math.abs(-dx * Math.sin(ang) + dy * Math.cos(ang));
        return Math.min(lx > 1e-12 ? g.outL / 2 / lx : Infinity, ly > 1e-12 ? g.outW / 2 / ly : Infinity);
      };
      const ra = Math.max(half(a, ux, uy), 1.2 * unitPerMm), rb = Math.max(half(b, -ux, -uy), 1.2 * unitPerMm);
      const p0 = { x: a.x + ux * ra, y: a.y + uy * ra }, p1 = { x: b.x - ux * rb, y: b.y - uy * rb };
      items.push({ layer: bad.has(p.id) ? 'C-STRM-PROB' : 'C-STRM-PIPE', kind: 'poly', pts: [p0, p1] });
      // flow arrow at the middle
      const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, h = 1.6 * unitPerMm;
      const tip = { x: m.x + ux * h, y: m.y + uy * h };
      items.push({ layer: 'C-STRM-PIPE', kind: 'poly', pts: [{ x: tip.x - ux * h * 1.6 + uy * h * 0.7, y: tip.y - uy * h * 1.6 - ux * h * 0.7 }, tip, { x: tip.x - ux * h * 1.6 - uy * h * 0.7, y: tip.y - uy * h * 1.6 + ux * h * 0.7 }] });
      const info = check?.pipes.get(p.id);
      if (L * mmPerUnit > 18) {
        let rot = Math.atan2(uy, ux); if (rot > Math.PI / 2) rot -= Math.PI; else if (rot < -Math.PI / 2) rot += Math.PI;
        const off = 1.8 * unitPerMm;
        items.push({ layer: 'C-STRM-TEXT', kind: 'text', x: m.x - Math.sin(rot) * off, y: m.y + Math.cos(rot) * off, rot, mm: 1.6, align: 'center', middle: true, text: p.name + ' ' + diaTxt(p.dia) + (info?.slope !== null && info?.slope !== undefined ? ' @ ' + fixed(info.slope * 100, 2) + '%' : '') });
      }
    }
    for (const x of net.structures) {
      // 0.6 WL.27: a structure of a rectangular type is drawn as its outside rectangle, square to its outlet pipe
      const g = structGeom(x, net, u);
      let r = Math.max((x.dia || 0) / per / 2, 1.2 * unitPerMm), pts = [];
      if (g.type && g.shape === 'rect') {
        const out = net.pipes.find((p) => p.from === x.id), to = out && byId.get(out.to), ang = to ? Math.atan2(to.y - x.y, to.x - x.x) : 0;
        const c = Math.cos(ang), s = Math.sin(ang), hl = Math.max(g.outL / 2, 0.6 * unitPerMm), hw = Math.max(g.outW / 2, 0.6 * unitPerMm);
        for (const [a, b] of [[-hl, -hw], [hl, -hw], [hl, hw], [-hl, hw]]) pts.push({ x: x.x + a * c - b * s, y: x.y + a * s + b * c });
        r = Math.hypot(hl, hw);
      } else {
        if (g.type) r = Math.max(g.outW / 2, 1.2 * unitPerMm);
        for (let k = 0; k <= 24; k++) pts.push({ x: x.x + Math.cos(k * Math.PI / 12) * r, y: x.y + Math.sin(k * Math.PI / 12) * r });
      }
      items.push({ layer: bad.has(x.id) ? 'C-STRM-PROB' : 'C-STRM-STRC', kind: 'poly', pts, closed: true });
      const st = check?.structs.get(x.id);
      items.push({ layer: 'C-STRM-TEXT', kind: 'text', x: x.x + r + 1 * unitPerMm, y: x.y + r, rot: 0, mm: 1.6, align: 'left', text: st?.rim !== null && st?.rim !== undefined ? t('scene.strc.rim', { name: x.name, rim: fixed(st.rim, 2) }) : x.name });
    }
  }
  return { layers: LAYERS, items };
}

function decimalsOf(v) { const s = String(v); const i = s.indexOf('.'); return i < 0 ? 0 : Math.min(3, s.length - i - 1); }
function centroid(pts) { let x = 0, y = 0; for (const p of pts) { x += p.x; y += p.y; } return { x: x / pts.length, y: y / pts.length }; }

/**
 * Label places along a polyline: every `spacing` (model units) of length, on straight-ish stretches,
 * text upright (rotation in −90°…90°).
 */
export function labelsAlong(pts, spacing, minLen) {
  const out = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  if (total < minLen) return out;
  const n = Math.max(1, Math.floor(total / spacing));
  const step = total / n;
  let want = step / 2, acc = 0;
  for (let i = 1; i < pts.length && out.length < n; i++) {
    const a = pts[i - 1], b = pts[i], L = Math.hypot(b.x - a.x, b.y - a.y);
    while (acc + L >= want && out.length < n) {
      const t = L ? (want - acc) / L : 0;
      let rot = Math.atan2(b.y - a.y, b.x - a.x);
      if (rot > Math.PI / 2) rot -= Math.PI; else if (rot < -Math.PI / 2) rot += Math.PI;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, rot });
      want += step;
    }
    acc += L;
  }
  return out;
}

/** Scene → DXF entities (text height from paper mm through the plot scale). */
export function toDxfEntities(scene, mmPerUnit) {
  const out = [];
  for (const it of scene.items) {
    if (it.kind === 'poly') out.push(it.z ? { type: 'poly3d', layer: it.layer, pts: it.pts, closed: it.closed, ...(it.xdata ? { xdata: it.xdata } : {}) } : { type: 'poly', layer: it.layer, pts: it.pts, closed: it.closed, elev: it.elev || 0 });
    else if (it.kind === 'arc') out.push({ type: 'arc', layer: it.layer, c: it.c, r: it.r, a0: it.a0, a1: it.a1 });
    else if (it.kind === 'point') out.push({ type: 'point', layer: it.layer, x: it.x, y: it.y, z: it.z });
    else if (it.kind === 'text') {
      const h = it.mm / mmPerUnit;
      // DXF text sits on its baseline; move a middle-anchored label down by half its height
      const dx = it.middle ? Math.sin(it.rot) * h / 2 : 0, dy = it.middle ? -Math.cos(it.rot) * h / 2 : 0;
      out.push({ type: 'text', layer: it.layer, x: it.x + dx, y: it.y + dy, h, rot: it.rot, text: it.text, align: it.align });
    }
  }
  return out;
}
