/* SPDX-License-Identifier: Apache-2.0 */
/**
 * daylight.js — windows and the daylight factor (0.9 IL.7, session `adapters-09`). DOM-free. Clean room (rule 32): the sky is the CIE standard overcast sky, whose
 * luminance rises from the horizon to the zenith as  L(γ) = Lz · (1 + 2 sin γ) / 3  (γ = altitude above the horizon); the light it puts on an unobstructed
 * horizontal plane is  Eext = 7π/9 · Lz.  Everything below is geometry and that one law.
 *
 * The model, stated so nobody expects more:
 *   - the room is the one calc.js uses (patches, form factors, Gauss-Seidel inter-reflection); a window is a rectangle in one wall;
 *   - each window is cut into small cells; a surface point sees each cell under some altitude γ and receives  T · L(γ) · cos θ_point · cos θ_cell · A / r²  from it;
 *     directions that point below the horizon (the ground outside) give no light: no ground reflection, no buildings, trees or overhangs outside, no sun, clear sky or
 *     other sky type; the glass transmits T of the light whatever the angle; no frames, bars or curtains;
 *   - the window opening lets light OUT as well: a wall patch behind the glass reflects nothing;
 *   - the daylight factor DF = 100 · E_inside / Eext (percent) on the workplane grid, daylight alone (no electric light), for the reference external illuminance `eext`.
 * It is a design aid for comparing windows, not a daylight certificate. Checks against a required DF are the person's own number: none is typed here.
 *
 *   cleanWindows(room, list) → [{ edge, from, width, sill, head, t }]   edge = index of the polygon edge (the wall from point `edge` to `edge + 1`), from = mm along it
 *   windowCells(room, win, { nu, nv }) → cells [{ c: [x, y, z] mm, n: outward unit normal, a: m² }]
 *   skyIlluminance(cells, p, normal, lz, t) → lux at p (mm) on a surface with unit normal `normal`, from the sky seen through the cells
 *   runDaylight({ room, windows, eext, spacing, maxPatches, prep }) → result
 */
import { prepare, solveFrom, indirectAt, polyArea, autoSpacing } from './calc.js';
import { gridPoints, stats } from './photometry.js';

export const DEFAULT_EEXT = 10000;                 // lux, a reference value for the DF to lux conversion only (the DF itself does not depend on it)
export const DEFAULT_T = 0.7;                      // visible light transmittance of the glass (a typical double-glazed value; the person types the real one)
export const lzOf = (eext) => (9 * eext) / (7 * Math.PI);
export const skyRel = (alt) => (1 + 2 * Math.sin(alt)) / 3;

const edgeVec = (P, i) => { const a = P[i], b = P[(i + 1) % P.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); return { a, b, L, tx: (b[0] - a[0]) / L, ty: (b[1] - a[1]) / L }; };
const ccwOf = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const u = P[i], v = P[(i + 1) % P.length]; a += u[0] * v[1] - v[0] * u[1]; } return a > 0; };

/** Windows that fit their wall and the room's height; others are dropped with a reason: → { windows, dropped: [{ index, key }] } (throws nothing). */
export function checkWindows(room, list) {
  const P = room.polygon, windows = [], dropped = [];
  (Array.isArray(list) ? list : []).forEach((w, index) => {
    if (!w) return;
    const edge = Math.round(Number(w.edge)), from = Number(w.from), width = Number(w.width), sill = Number(w.sill), head = Number(w.head), t = w.t === undefined || w.t === '' ? DEFAULT_T : Number(w.t);
    if (![edge, from, width, sill, head, t].every(Number.isFinite) || edge < 0 || edge >= P.length) return void dropped.push({ index, key: 'err.win.edge' });
    const { L } = edgeVec(P, edge);
    if (width < 100 || from < -1 || from + width > L + 1) return void dropped.push({ index, key: 'err.win.fit' });
    if (sill < 0 || head <= sill + 50 || head > room.height + 1) return void dropped.push({ index, key: 'err.win.height' });
    if (!(t > 0 && t <= 1)) return void dropped.push({ index, key: 'err.win.t' });
    windows.push({ edge, from: Math.max(0, from), width, sill, head, t });
  });
  return { windows, dropped };
}
export const cleanWindows = (room, list) => checkWindows(room, list).windows;

/** The window cut into nu × nv cells (the cells are the glass, at the wall line). n points out of the room. */
export function windowCells(room, win, { nu = 14, nv = 14 } = {}) {
  const P = room.polygon, e = edgeVec(P, win.edge), ccw = ccwOf(P), n = ccw ? [ e.ty, -e.tx, 0] : [-e.ty, e.tx, 0];   // the room is on the left of a counter-clockwise edge: outward = right
  const h = win.head - win.sill, cells = [], a = (win.width / nu / 1000) * (h / nv / 1000);
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const s = win.from + (win.width * (i + 0.5)) / nu, z = win.sill + (h * (j + 0.5)) / nv;
    cells.push({ c: [e.a[0] + e.tx * s, e.a[1] + e.ty * s, z], n, a });
  }
  return cells;
}

/** Lux at p [x, y, z] mm on a surface with unit normal `normal` from the sky seen through `cells` (glass transmittance t). lz = zenith luminance of the sky. */
export function skyIlluminance(cells, p, normal, lz, t = 1) {
  let E = 0;
  for (const q of cells) {
    const vx = (q.c[0] - p[0]) / 1000, vy = (q.c[1] - p[1]) / 1000, vz = (q.c[2] - p[2]) / 1000, r2 = vx * vx + vy * vy + vz * vz;
    if (r2 < 1e-9) continue;
    const r = Math.sqrt(r2), sinAlt = vz / r;
    if (sinAlt <= 0) continue;                                       // the ground outside: no light
    const cp = (normal[0] * vx + normal[1] * vy + normal[2] * vz) / r, cq = (q.n[0] * vx + q.n[1] * vy + q.n[2] * vz) / r;
    if (cp <= 0 || cq <= 0) continue;                                // the point faces away, or the ray does not go outward
    E += lz * ((1 + 2 * sinAlt) / 3) * cp * cq * q.a / r2;
  }
  return E * t;
}
const wallPatchInWindow = (room, win, patch) => {
  if (patch.kind !== 'wall') return false;
  const e = edgeVec(room.polygon, win.edge), dx = patch.c[0] - e.a[0], dy = patch.c[1] - e.a[1], s = dx * e.tx + dy * e.ty, off = Math.abs(-dx * e.ty + dy * e.tx);
  return off < 2 && s >= win.from && s <= win.from + win.width && patch.c[2] >= win.sill && patch.c[2] <= win.head;
};

export function runDaylight({ room, windows, eext = DEFAULT_EEXT, spacing = 0, maxPatches = 1300, prep = null, nu = 14, nv = 14 }) {
  const pr = prep || prepare(room, { maxPatches }), rm = pr.room;
  const { windows: wins, dropped } = checkWindows(rm, windows);
  if (!wins.length) throw Object.assign(new Error('no windows'), { key: 'err.nowindows' });
  const lz = lzOf(eext), sets = wins.map((w) => ({ w, cells: windowCells(rm, w, { nu, nv }) }));
  const patches = pr.patches.map((p) => (sets.some((s) => wallPatchInWindow(rm, s.w, p)) ? { ...p, rho: 0 } : p));
  const lit = { ...pr, patches };
  const sky = (p, n) => sets.reduce((s, x) => s + skyIlluminance(x.cells, p, n, lz, x.w.t), 0);
  const E0 = patches.map((p) => sky(p.c, p.n));
  const sol = solveFrom(lit, E0);
  const sp = spacing > 0 ? spacing : autoSpacing(rm.polygon);
  let g = gridPoints(rm.polygon, { spacing: sp, height: rm.workplane, margin: rm.margin });
  if (!g.points.length) g = gridPoints(rm.polygon, { spacing: sp, height: rm.workplane, margin: 0 });
  if (!g.points.length) throw Object.assign(new Error('no grid'), { key: 'err.nogrid' });
  const up = [0, 0, 1], direct = g.points.map((p) => sky(p, up)), lux = g.points.map((p, i) => direct[i] + indirectAt(lit, sol, p, up)), df = lux.map((x) => (100 * x) / eext);
  const st = stats(df), winArea = sets.reduce((s, x) => s + x.cells.reduce((a, c) => a + c.a, 0), 0);
  const flux = patches.reduce((s, p, i) => s + p.a * E0[i], 0);   // lumens that reach the room's surfaces straight from the sky through the glass
  return {
    room: rm, eext, lz, windows: wins, dropped, grid: { points: g.points, values: df, lux, spacing: sp, nx: g.nx, ny: g.ny },
    df: { min: st.min, avg: st.avg, max: st.max, uo: st.minAvg }, dfAvg: st.avg, dfMin: st.min, dfMax: st.max, uo: st.minAvg,
    luxAvg: (st.avg * eext) / 100, windowArea: winArea, glazingRatio: pr.areaM2 > 0 ? winArea / pr.areaM2 : 0, areaM2: pr.areaM2, flux, directShare: st.avg > 0 ? Math.min(1, (direct.reduce((a, b) => a + b, 0) / direct.length) * 100 / eext / st.avg) : 0,
    notes: ['note.daylight', 'note.daylight2'],
    /** Share of the workplane grid (0..1) at or above a daylight factor the person asks for. */
    shareAbove(target) { return df.filter((x) => x >= target).length / df.length; },
  };
}

/**
 * Windows the host found near the room's walls (BimCraft: { x, y, w, sill } at the window's centre on its wall, mm) as the engine's windows. The model's room list gives no
 * window height, so `height` (1200 mm) is assumed and the panel says so. An opening further than `maxDist` from every wall is skipped.
 */
export function windowsFromOpenings(poly, openings, { height = 1200, maxDist = 700, ceiling = 2800 } = {}) {
  const out = [];
  for (const o of Array.isArray(openings) ? openings : []) {
    const x = Number(o.x), y = Number(o.y), w = Number(o.w), sill = Number(o.sill) || 0;
    if (![x, y, w].every(Number.isFinite) || w < 100) continue;
    let best = null;
    for (let i = 0; i < poly.length; i++) {
      const e = edgeVec(poly, i), s = (x - e.a[0]) * e.tx + (y - e.a[1]) * e.ty, d = Math.abs(-(x - e.a[0]) * e.ty + (y - e.a[1]) * e.tx);
      if (s < -w / 2 || s > e.L + w / 2 || d > maxDist) continue;
      if (!best || d < best.d) best = { i, s, d, L: e.L };
    }
    if (!best) continue;
    const from = Math.max(0, Math.min(best.L - w, best.s - w / 2)), head = Math.min(sill + height, ceiling);
    if (head > sill + 50) out.push({ edge: best.i, from: Math.round(from), width: Math.round(Math.min(w, best.L)), sill: Math.round(sill), head: Math.round(head), t: DEFAULT_T });
  }
  return out;
}
