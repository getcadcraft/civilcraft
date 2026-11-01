/* SPDX-License-Identifier: Apache-2.0 */
/**
 * drawings.js — shop drawings of a job as SVG: plan, elevation of each run, section of a cabinet, and a 3D view (0.8 DC.117, session
 * `cabinetcraft_addon`). DOM-free: every function returns text, so the panel, the printable sheet set and the tests all use the same
 * drawings. The cabinet geometry is the shared model's (draw.js sideEnts, solid.js boxesOf); this file places it in the room and
 * dimensions it.
 *
 *   planSvg(build) · elevationSvg(build, runId) · sectionSvg(build, no) · isoSvg(build, { view }) → { svg, w, h } (w/h = the drawing's size in job units)
 *   bestView(build) → 0..3   the way to look at the room so most cabinet fronts face the viewer
 *   sheetSet(build, { title, view }) → [{ id, title, svg }] plan, an elevation per run, a section per distinct template, the 3D view
 *   sheetSetHtml(sheets, { title, unit, date }) → one printable HTML file, a page per drawing (print landscape at 100 %)
 *   entsToSvg(ents, opts) — the small renderer (line, poly, text, rect) the drawings use
 */
import { sideEnts } from './draw.js';
import { boxesOf, colorOf, quads } from './solid.js';
import { fmtLen, r6, t as T } from './core.js';
import { frameLayout } from './build.js';
import { allSolids } from './solids.js';
import { roomOutline } from './room.js';
import { toWorld as toWorldF, cellFrame } from './footprint.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const ln = (x1, y1, x2, y2, o = {}) => ({ type: 'line', x1, y1, x2, y2, ...o });
const rect = (x, y, w, h, o = {}) => ({ type: 'poly', pts: [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }], closed: true, ...o });
const txt = (x, y, h, s, o = {}) => ({ type: 'text', x, y, h, s: String(s), ha: 'center', va: 'middle', rot: 0, ...o });

/** Entities → SVG. y runs up in the entities, down on the page. */
export function entsToSvg(ents, { pad = 0.04, width = 900, stroke = '#1b1b1b' } = {}) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const see = (x, y) => { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; };
  for (const e of ents) {
    if (e.type === 'line') { see(e.x1, e.y1); see(e.x2, e.y2); }
    else if (e.type === 'poly') for (const p of e.pts) see(p.x, p.y);
    else if (e.type === 'text') { const w = String(e.s).length * e.h * 0.35; see(e.x - w, e.y - e.h); see(e.x + w, e.y + e.h); }
  }
  if (!Number.isFinite(x0)) return { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"></svg>', w: 0, h: 0 };
  const W = x1 - x0, H = y1 - y0, p = Math.max(W, H) * pad;
  const vx = x0 - p, vy = -(y1 + p), vw = W + 2 * p, vh = H + 2 * p;
  const sw = Math.max(vw, vh) / 900;
  const pts = (a) => a.map((q) => r6(q.x) + ',' + r6(-q.y)).join(' ');
  const body = ents.map((e) => {
    const dash = e.dash ? ` stroke-dasharray="${r6(sw * 6)} ${r6(sw * 4)}"` : '';
    const w = (e.heavy ? 2 : e.thin ? 0.5 : 1) * sw;
    if (e.type === 'line') return `<line x1="${r6(e.x1)}" y1="${r6(-e.y1)}" x2="${r6(e.x2)}" y2="${r6(-e.y2)}" stroke="${e.color || stroke}" stroke-width="${r6(w)}"${dash}/>`;
    if (e.type === 'poly') return `<${e.closed ? 'polygon' : 'polyline'} points="${pts(e.pts)}" fill="${e.fill || 'none'}" stroke="${e.color || stroke}" stroke-width="${r6(w)}" stroke-linejoin="round"${dash}/>`;
    if (e.type === 'text') return `<text x="${r6(e.x)}" y="${r6(-e.y)}" font-size="${r6(e.h)}" text-anchor="${e.ha === 'left' ? 'start' : e.ha === 'right' ? 'end' : 'middle'}" dominant-baseline="${e.va === 'middle' ? 'central' : 'alphabetic'}" font-family="sans-serif" fill="${e.color || stroke}"${e.rot ? ` transform="rotate(${r6(-e.rot)} ${r6(e.x)} ${r6(-e.y)})"` : ''}>${esc(e.s)}</text>`;
    return '';
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r6(vx)} ${r6(vy)} ${r6(vw)} ${r6(vh)}" width="${width}" preserveAspectRatio="xMidYMid meet" role="img">${body}</svg>`;
  return { svg, w: W, h: H };
}

// ---- dimensions
const dimLine = (x1, y1, x2, y2, label, th, off = 0, vertical = false) => {
  const out = [];
  if (!vertical) {
    const y = y1 + off;
    out.push(ln(x1, y1, x1, y + Math.sign(off || 1) * th * 0.4, { thin: true }), ln(x2, y2, x2, y + Math.sign(off || 1) * th * 0.4, { thin: true }), ln(x1, y, x2, y, { thin: true }));
    out.push(txt((x1 + x2) / 2, y + th * 0.9, th, label));
  } else {
    const x = x1 + off;
    out.push(ln(x1, y1, x + Math.sign(off || 1) * th * 0.4, y1, { thin: true }), ln(x2, y2, x + Math.sign(off || 1) * th * 0.4, y2, { thin: true }), ln(x, y1, x, y2, { thin: true }));
    out.push(txt(x + Math.sign(off || 1) * th * 0.9, (y1 + y2) / 2, th, label, { rot: 90 }));
  }
  const spec = { x1, y1, x2, y2, label, off, vertical, th };
  for (const e of out) e.dimPart = spec;
  return out;
};

// ---- plan
const toWorld = toWorldF;
const quad = (frame, s0, s1, o0, o1, o = {}) => ({ type: 'poly', closed: true, pts: [toWorld(frame, s0, o0), toWorld(frame, s1, o0), toWorld(frame, s1, o1), toWorld(frame, s0, o1)], ...o });

/** The plan as CadCraft-shaped entities ({type: line | poly | text}, flags dash / thin / heavy / fill; the parts of a dimension carry `dimPart`). planSvg draws the same list. */
export function planEnts(build) {
  const { project, layout, R } = build;
  const u = project.unit, W = project.room.w, D = project.room.d;
  const th = Math.max(W, D) * 0.018;
  const pts = roomOutline(project.room).map(([x, y]) => ({ x, y }));
  const ents = [{ type: 'poly', pts, closed: true, heavy: true }];
  // a quad in a cell's own frame (a cell on a curved wall has its own, the others sit at c.x along their run)
  const cq = (L, c, x0, x1, o0, o1, o = {}) => { const f = cellFrame(L, c); return quad(f.frame, f.s + x0, f.s + x1, o0, o1, o); };
  const cp = (L, c, list) => { const f = cellFrame(L, c); return list.map(([s, o]) => toWorld(f.frame, f.s + s, o)); };
  const byNo = new Map(build.cells.map((c) => [c.no, c]));
  const wpts = (frame, list) => list.map(([s, o]) => toWorld(frame, s, o));
  for (const L of layout.runs) for (const row of ['base', 'upper']) for (const c of L.rows[row].cells) {
    if (c.kind === 'gap') { ents.push(cq(L, c, 0, c.w, 0, L.rows.base.depth || R.t * 25, { dash: true, thin: true })); continue; }
    const b = byNo.get(c.no);
    if (b && b.corner) {   // a corner cabinet: its own outline, the door lines on its fronts
      ents.push({ type: 'poly', closed: true, pts: cp(L, c, b.corner.outline), dash: row === 'upper', fill: row === 'upper' ? 'none' : '#f3ece0' });
      const mid = b.corner.outline.reduce((a2, p) => [a2[0] + p[0] / b.corner.outline.length, a2[1] + p[1] / b.corner.outline.length], [0, 0]);
      const ct = cp(L, c, [mid])[0];
      ents.push(txt(ct.x, ct.y, th * 0.8, c.no));
      continue;
    }
    const depth = c.kind === 'cab' ? c.cab.d : c.kind === 'endpanel' ? c.depth : R.t * 4;
    const dashed = row === 'upper';
    if (c.curved) {   // a made-to-order cabinet: its ring sector, hatched
      for (const sl of c.curved.slices) ents.push({ type: 'poly', closed: true, pts: sl.map(([x, y]) => ({ x, y })), thin: true, fill: dashed ? 'none' : '#eadfc8', dash: dashed });
      const sl = c.curved.slices[Math.floor(c.curved.slices.length / 2)], cx = sl.reduce((q, p) => q + p[0], 0) / sl.length, cy = sl.reduce((q, p) => q + p[1], 0) / sl.length;
      ents.push(txt(cx, cy, th * 0.8, c.no + ' ' + T('draw.mto')));
      continue;
    }
    ents.push(cq(L, c, 0, c.w, 0, depth, { dash: dashed, fill: row === 'upper' ? 'none' : '#f3ece0' }));
    if (c.kind === 'cab') {
      ents.push(cq(L, c, 0, c.w, depth, depth + R.frontT, { thin: true }));
      if (c.cab.type === 'wall') ents.push(...[[0, 0, c.w, depth], [0, depth, c.w, 0]].map(([a, b2, c2, d]) => { const p = cp(L, c, [[a, b2]])[0], q = cp(L, c, [[c2, d]])[0]; return ln(p.x, p.y, q.x, q.y, { dash: true, thin: true }); }));
      const ct = cp(L, c, [[c.w / 2, row === 'upper' ? depth * 0.5 : Math.max(depth * 0.55, depth - th * 2.6)]])[0];
      ents.push(txt(ct.x, ct.y, th * 0.8, c.no));
    }
  }
  // wedge voids between cabinets on a curved wall (grey), the corners that are not right angles (the void behind a closing panel)
  for (const L of layout.runs) for (const row of ['base', 'upper']) { const ar = L.rows[row].arc; if (ar) for (const wd of ar.wedges) if ((ar.bay ? wd.back : wd.front) > 0.5) ents.push({ type: 'poly', closed: true, pts: wd.poly.map(([x, y]) => ({ x, y })), thin: true, fill: '#d9d3c7' }); }
  for (const wd of layout.wedges || []) {
    ents.push({ type: 'poly', closed: true, pts: wd.tri.map(([x, y]) => ({ x, y })), thin: true, fill: '#d9d3c7' });
    const m = wd.tri.reduce((q, p) => [q[0] + p[0] / 3, q[1] + p[1] / 3], [0, 0]);
    ents.push(txt(m[0], m[1], th * 0.7, wd.no));
    ents.push(ln(wd.tri[0][0], wd.tri[0][1], wd.tri[1][0], wd.tri[1][1], { heavy: true }));
  }
  for (const cs of layout.counters) {
    const L = layout.runs.find((r) => r.run.id === cs.run);
    if (cs.world) ents.push({ type: 'poly', closed: true, pts: cs.poly.map(([x, y]) => ({ x, y })), dash: true, thin: true, color: '#8a6d3b' });
    else if (cs.poly) ents.push({ type: 'poly', closed: true, pts: wpts(L.frame, cs.poly), dash: true, thin: true, color: '#8a6d3b' });
    else ents.push(quad(L.frame, cs.x0, cs.x0 + cs.length, cs.y0 || 0, (cs.y0 || 0) + cs.width, { dash: true, thin: true, color: '#8a6d3b' }));
  }
  // doors and windows in the walls
  const wallT = Math.max(W, D) * 0.012;
  for (const op of project.openings || []) {
    const wl = layout.walls.find((w) => w.id === op.wall);
    if (!wl) continue;
    const f = wl.frame;
    if (op.kind === 'window') {
      ents.push(quad(f, op.at, op.at + op.w, -wallT, wallT, { fill: '#cfe6f5', thin: true }));
      const m = toWorld(f, op.at + op.w / 2, -wallT * 2.2);
      ents.push(txt(m.x, m.y, th * 0.7, op.id));
    } else {
      ents.push(quad(f, op.at, op.at + op.w, -wallT, wallT, { fill: '#ffffff', thin: true }));
      if (op.swing !== 'out' || true) {
        const sgn = op.swing === 'out' ? -1 : 1;
        const arc = Array.from({ length: 13 }, (_, i) => { const a = (Math.PI / 2) * (i / 12); return [op.at + op.w * Math.cos(a), sgn * op.w * Math.sin(a)]; });
        ents.push({ type: 'poly', closed: false, pts: wpts(f, [[op.at, 0], [op.at, sgn * op.w], ...arc.slice().reverse()]), thin: true, dash: true });
      }
      const m = toWorld(f, op.at + op.w / 2, -wallT * 2.2);
      ents.push(txt(m.x, m.y, th * 0.7, op.id));
    }
  }
  for (const L of layout.runs) {
    const mid = toWorld(L.frame, (L.wallInfo ? L.wallInfo.chord : L.len) / 2, L.island ? -th * 2.4 : -th * 2.4);
    ents.push(txt(mid.x, mid.y, th * 0.9, L.run.id + (L.run.name ? ' ' + L.run.name : '')));
  }
  const unitLabel = u === 'in' ? 'in' : 'mm';
  ents.push(...dimLine(0, 0, W, 0, fmtLen(W, u) + ' ' + unitLabel, th, -th * 4));
  ents.push(...dimLine(0, 0, 0, D, fmtLen(D, u) + ' ' + unitLabel, th, -th * 4, true));
  return ents;
}
export function planSvg(build) { return entsToSvg(planEnts(build)); }

/** x → −x on every entity (the view of a wall from inside the room runs right to left along the wall). */
function mirrorX(ents) {
  const mir = new Map();
  const spec = (d) => { if (!d) return d; if (!mir.has(d)) mir.set(d, { ...d, x1: -d.x1, x2: -d.x2, off: d.vertical ? -d.off : d.off }); return mir.get(d); };
  return ents.map((e) => (e.type === 'line' ? { ...e, x1: -e.x1, x2: -e.x2, dimPart: spec(e.dimPart) } : e.type === 'poly' ? { ...e, pts: e.pts.map((p) => ({ ...p, x: -p.x })) } : { ...e, x: -e.x, dimPart: spec(e.dimPart) }));
}

// ---- elevation of a run
/** The elevation of a run as entities, seen from the room (x runs right to left along the wall). */
export function elevationEnts(build, runId) {
  const { project, layout, R } = build;
  const L = layout.runs.find((r) => r.run.id === runId);
  if (!L) return [];
  const u = project.unit;
  const ents = [];
  const th = Math.max(L.len, project.room.h) * 0.016;
  const cells = (row) => L.rows[row].cells;
  const byNo = new Map(build.cells.map((c) => [c.no, c]));
  const face = (c, X, base, Z0) => {   // the boxes and lines of one cabinet are tagged `cab` (CadCraft makes one block of the same ones)
    const n0 = ents.length;
    face0(c, X, base, Z0);
    for (let i = n0; i < ents.length; i++) if (ents[i].type !== 'text' && !ents[i].dimPart) ents[i].cab = c.no;
  };
  const face0 = (c, X, base, Z0) => {
    const b = byNo.get(c.no);
    if (!b) return;
    const kx = c.pf && c.ext ? Math.max(0.05, (c.ext[1] - c.ext[0]) / c.w) : 1;   // a cabinet turned on a curved wall is seen foreshortened
    const cw = c.w * kx;
    if (c.kind === 'cab') {
      const cab = b.cab, kick = cab.type === 'wall' || R.kick === 'none' ? 0 : R.kickH;
      const boxH = cab.h - kick;
      ents.push(rect(X, base + kick, cw, boxH));
      if (kick > 0) ents.push(rect(X, base, cw, kick, { thin: true }));
      if (b.frame) {
        for (const o of b.frame.openings) ents.push(rect(X + o.x * kx, base + o.y, o.w * kx, o.h, { thin: true }));
      }
      for (const f of b.fronts) {
        const fx = X + f.x * kx, fy = base + f.y, fw = f.w * kx;
        ents.push(rect(fx, fy, fw, f.h, f.kind === 'blind' ? { thin: true } : {}));
        if (f.kind === 'door') {
          const hx = f.hinge === 'right' ? fx + fw : fx, ox = f.hinge === 'right' ? fx : fx + fw;
          ents.push(ln(ox, fy, hx, fy + f.h / 2, { dash: true, thin: true }), ln(hx, fy + f.h / 2, ox, fy + f.h, { dash: true, thin: true }));
        } else if (f.kind === 'drawer') { const pw = Math.min(fw * 0.3, 160 / (u === 'in' ? 25.4 : 1)), py = fy + f.h * 0.7; ents.push(ln(fx + (fw - pw) / 2, py, fx + (fw + pw) / 2, py, { heavy: true })); }
      }
      ents.push(txt(X + cw / 2, base - th * 1.4, th, c.no + (b.madeToOrder ? ' ' + T('draw.mto') : '')));
      ents.push(...dimLine(X, base + cab.h + Z0, X + cw, base + cab.h + Z0, fmtLen(c.w, u), th, th * 1.2));
    } else if (c.kind === 'filler' || c.kind === 'endpanel') {
      ents.push(rect(X, base, cw, c.height, { fill: '#e9e2d6' }));
      ents.push(txt(X + cw / 2, base - th * 1.4, th * 0.8, c.no));
    }
  };
  const xo = (c) => (c.pf && c.ext ? c.ext[0] : c.x);
  for (const c of cells('base')) face(c, xo(c), 0, 0);
  for (const c of cells('upper')) { if (c.kind === 'cab') face(c, xo(c), c.cab.elev, 0); else if (c.kind === 'filler' || c.kind === 'endpanel') face(c, xo(c), (cells('upper').find((q) => q.kind === 'cab') || { cab: { elev: 0 } }).cab.elev, 0); }
  const top = Math.max(0, ...build.cells.filter((c) => c.run === runId && c.kind === 'cab').map((c) => c.cab.elev + c.cab.h));
  for (const op of project.openings || []) if (op.wall === L.wall) {
    ents.push(rect(op.at, op.sill, op.w, op.h, { dash: true, thin: true, color: '#3a7ab5' }), txt(op.at + op.w / 2, op.sill + op.h + th, th * 0.8, op.id, { color: '#3a7ab5' }));
  }
  const arcRun = !!(L.wallInfo && L.wallInfo.arc);
  const exts = [...cells('base'), ...cells('upper')].filter((c) => c.ext).map((c) => c.ext);
  ents.push(arcRun && exts.length ? ln(Math.min(...exts.map((e) => e[0])) - th, 0, Math.max(...exts.map((e) => e[1])) + th, 0, { heavy: true }) : ln(L.rows.base.start - th, 0, L.rows.base.end + th, 0, { heavy: true }));
  const used = [L.rows.base, L.rows.upper].filter((r) => r.cells.length).map((r) => [r.start, r.end]);
  const a = arcRun && exts.length ? Math.min(...exts.map((e) => e[0])) : Math.min(...used.map((x) => x[0])), b = arcRun && exts.length ? Math.max(...exts.map((e) => e[1])) : Math.max(...used.map((x) => x[1]));
  ents.push(...dimLine(a, 0, b, 0, fmtLen(b - a, u) + (u === 'in' ? ' in' : ' mm'), th, -th * 4.5));
  ents.push(...dimLine(a, 0, a, top, fmtLen(top, u), th, -th * 2, true));
  return mirrorX(ents);   // seen from the room, facing the wall: its start corner is on the right
}
export function elevationSvg(build, runId) { return entsToSvg(elevationEnts(build, runId)); }

// ---- section of one cabinet
/** One cabinet cut through its middle, as entities. */
export function sectionEnts(build, no) {
  const c = build.cells.find((x) => x.no === no && x.kind === 'cab');
  if (!c) return [];
  const { R, F, project } = build;
  const u = project.unit;
  const ff = c.construction === 'faceframe';
  const cab = c.cab;
  const mine = (e) => !(e.type === 'poly' && e.pts.every((p) => p.x >= cab.d - 1e-6) && e.pts.some((p) => p.x > cab.d + 1e-6));
  let ents = sideEnts(cab, R, 1).filter(mine);
  const frontX = cab.d + (ff ? F.t : 0);
  if (ff) { const kick = R.kick === 'none' || cab.type === 'wall' ? 0 : R.kickH; ents.push(rect(cab.d, cab.elev + kick, F.t, cab.h - kick, { fill: '#d9c9a6' })); }
  for (const f of c.fronts) if (f.kind !== 'blind') ents.push(rect(frontX, cab.elev + f.y, R.frontT, f.h));
  const th = Math.max(cab.d, cab.h) * 0.03;
  ents.push(...dimLine(0, cab.elev, frontX + R.frontT, cab.elev, fmtLen(frontX + R.frontT, u), th, -th * 2.4));
  ents.push(...dimLine(0, cab.elev, 0, cab.elev + cab.h, fmtLen(cab.h, u), th, -th * 2.4, true));
  if (ff) ents.push(txt(cab.d + F.t / 2, cab.elev + cab.h + th * 1.2, th * 0.8, T('draw.frame')));
  return ents;
}
export function sectionSvg(build, no) { return entsToSvg(sectionEnts(build, no)); }

// ---- 3D
const ROT = [(x, y) => [x, y], (x, y) => [y, -x], (x, y) => [-x, -y], (x, y) => [-y, x]];

export function bestView(build) {
  const frames = build.layout.runs.filter((r) => r.rows.base.cells.length || r.rows.upper.cells.length);
  let best = 0, score = -1;
  for (let v = 0; v < 4; v++) {
    let s = 0;
    for (const L of frames) { const n = ROT[v](L.frame.n.x, L.frame.n.y); s += (n[0] + n[1] > 0 ? 1 : 0) * (L.rows.base.cells.length + L.rows.upper.cells.length); }
    if (s > score) { score = s; best = v; }
  }
  return best;
}

export function isoSvg(build, { view = null } = {}) {
  const v = view === null || view === undefined ? bestView(build) : ((view % 4) + 4) % 4;
  const { project, layout } = build;
  const cx = project.room.w / 2, cy = project.room.d / 2;
  const rot = (x, y) => { const [a, b] = ROT[v](x - cx, y - cy); return [a + cx, b + cy]; };
  const proj = (X, Y, Z) => { const [rx, ry] = rot(X, Y); return { x: (rx - ry) * 0.866, y: -((rx + ry) * 0.5 - Z) }; };
  const items = allSolids(build);
  const polys = [];
  const NORMALS = [[0, 0, -1], [0, 0, 1], [0, -1, 0], [0, 1, 0], [-1, 0, 0], [1, 0, 0]];
  const facesOf = (b) => {
    if (b.kind !== 'prism') return { qs: quads(b), normals: NORMALS };
    const qs = [], normals = [];
    const pts = b.pts, n = pts.length;
    qs.push(pts.map(([x, y]) => [x, y, b.z0]).reverse()); normals.push([0, 0, -1]);
    qs.push(pts.map(([x, y]) => [x, y, b.z1])); normals.push([0, 0, 1]);
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
      qs.push([[p[0], p[1], b.z0], [q[0], q[1], b.z0], [q[0], q[1], b.z1], [p[0], p[1], b.z1]]); normals.push([dy / L, -dx / L, 0]);
    }
    return { qs, normals };
  };
  for (const { shape: b, to, role } of items) {
    const { qs, normals } = facesOf(b);
    const world = qs.map((q) => q.map(([x, y, z]) => to(x, y, z)));
    // the wall frame's axes in the room tell where a face looks
    const o = to(0, 0, 0), ex = to(1, 0, 0), ey = to(0, 1, 0);
    const ux = [ex[0] - o[0], ex[1] - o[1]], uy = [ey[0] - o[0], ey[1] - o[1]];
    const all = world.flat();
    const cen = all.reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]).map((s) => s / all.length);
    const [rcx, rcy] = rot(cen[0], cen[1]);
    qs.forEach((q, i) => {
      const [nx, ny, nz] = normals[i];
      const wn = [ux[0] * nx + uy[0] * ny, ux[1] * nx + uy[1] * ny];
      const [rx, ry] = ROT[v](wn[0], wn[1]);
      const visible = nz > 0 || (nz === 0 && rx + ry > 0.001);
      if (!visible) return;
      const hue = colorOf(role === 'frame' ? 'plinth' : role === 'end' ? 'door' : role === 'counter' ? 'top' : role);
      polys.push({ depth: rcx + rcy + cen[2] * 0.001, pts: world[i].map(([X, Y, Z]) => proj(X, Y, Z)), fill: role === 'counter' ? '#b9b3a6' : hue, k: nz > 0 ? 1 : (rx + ry) > 0 && rx > ry ? 0.82 : 0.68 });
    });
  }
  polys.sort((a, c) => a.depth - c.depth);
  const ents = [];
  // the room's floor and the two far walls' lines
  const floor = roomOutline(project.room).map(([X, Y]) => proj(X, Y, 0));
  ents.push({ type: 'poly', closed: true, pts: floor, fill: '#f5f3ee', thin: true });
  for (const p of polys) ents.push({ type: 'poly', closed: true, pts: p.pts, fill: shadeHex(p.fill, p.k), thin: true });
  return entsToSvg(ents);
}
function shadeHex(hex, k) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (x) => Math.max(0, Math.min(255, Math.round(x * k)));
  return '#' + [f(r), f(g), f(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// ---- the set
export function sheetSet(build, { title = '', view = null } = {}) {
  const out = [{ id: 'plan', title: T('draw.plan'), ...planSvg(build) }];
  for (const L of build.layout.runs) if (L.rows.base.cells.length || L.rows.upper.cells.length) out.push({ id: 'elev-' + L.run.id, title: T('draw.elevation', { run: L.run.id + (L.run.name ? ' ' + L.run.name : '') }), ...elevationSvg(build, L.run.id) });
  const seen = new Set();
  for (const c of build.cells) {
    if (c.kind !== 'cab') continue;
    const k = c.cell.entry.tpl + (c.construction === 'faceframe' ? '-ff' : '');
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ id: 'section-' + c.no, title: T('draw.section', { no: c.no, name: T(c.cell.tpl.name) }), ...sectionSvg(build, c.no) });
  }
  out.push({ id: 'iso', title: T('draw.iso'), ...isoSvg(build, { view }) });
  return out.map((s) => ({ ...s, job: title }));
}

export function sheetSetHtml(sheets, { title = '', unit = 'mm', date = '' } = {}) {
  const pages = sheets.map((s, i) => `<section class="sheet"><header><b>${esc(title || T('draw.untitled'))}</b><span>${esc(s.title)}</span><span>${esc(T('draw.sheet', { n: i + 1, of: sheets.length }))} · ${esc(unit)}${date ? ' · ' + esc(date) : ''}</span></header><div class="art">${s.svg}</div><footer>${esc(T('draw.note'))}</footer></section>`).join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title || T('draw.untitled'))}</title><style>
@page{size:A3 landscape;margin:10mm}body{margin:0;font-family:sans-serif;color:#1b1b1b;background:#fff}
.sheet{page-break-after:always;border:1px solid #1b1b1b;margin:8px;padding:8px;display:flex;flex-direction:column;min-height:270mm}
header{display:flex;justify-content:space-between;border-bottom:1px solid #1b1b1b;padding-bottom:6px;font-size:14px;gap:12px}
.art{flex:1;display:flex;align-items:center;justify-content:center}.art svg{width:100%;height:auto;max-height:230mm}
footer{border-top:1px solid #1b1b1b;padding-top:6px;font-size:11px}
</style></head><body>${pages}</body></html>`;
}
