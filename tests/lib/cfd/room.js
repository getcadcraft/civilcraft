/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: developer errors and keys; a host words them */
/**
 * room.js — room air for terminals and fan coils (0.11 SU.1812, session su-finish-11 lane cfd). Own code, Apache-2.0, host-free and DOM-free.
 * The solver is lbm3d.js (the spike's choice, engineering-10/11): D3Q19 flow with Boussinesq buoyancy and a Smagorinsky eddy viscosity, D3Q7 temperature,
 * temperature and the humidity ratio (a passive scalar) on D3Q19 links like the air (`thermal: 19`), so the heat and water an inlet brings in are exactly what its air carries.
 *
 *   const run = new RoomRun(spec);  run.advance(steps) …;  const r = run.result();
 *   spec = {
 *     poly: [[x, y]…] mm (the room's plan outline), height: mm, cell?: mm (else picked so the room is at most maxCells cells), maxCells?: 12000,
 *     start: { T: °C, rh: % },  p?: Pa (101325),
 *     terminals: [{ id, name?, kind: 'supply' | 'return' | 'exhaust' | 'fancoil', x, y, z (mm; a terminal's face centre; a fan coil's bottom centre), rot?: degrees,
 *                   w, d (mm, a terminal's face; a fan coil's length and width), h? (a fan coil's height), flowLps (L/s), T?, rh? (the supply air) }],
 *     sources: [{ name?, x0, y0, z0, x1, y1, z1 (mm box), watts, moistureGph? (g/h) }],
 *     seconds?: the time to simulate (s), uLat?: 0.1, tauMin?: 0.52, Cs?: 0.1,
 *   }
 *   r = { grid, ok, warnings[], time (s), steps, lattice, flows { supplyLps, returnTypedLps, outLps }, exhaust { T, rh }, zone (the occupied-zone numbers), fields
 *         { speed m/s, ux, uy, uz, T °C, w g/kg, rh % } (Float32Array, NaN outside the air), section(), line(), at() }
 *
 *   Terminals on the ceiling (face within 300 mm of it) blow down into the room through the ceiling cells under their face; on the floor (within 300 mm of
 *   it) they blow up. A supply is a velocity inlet (flow / the face area on the grid) at its supply temperature and humidity; a return or exhaust is a
 *   pressure outlet, so the air leaves there at whatever rate the supplies give (the typed return flow is reported, not imposed). A fan coil inside the
 *   room is a solid box that blows out of its +x end (turned by rot) and takes air in at its -x end; one above the ceiling (concealed) blows down under its
 *   +x end and takes air in under its -x end.
 *   Heat sources (people, equipment) heat the air in their box; moisture sources add water vapour there.
 *
 *   What it is NOT (said on every result, `limits`): the turbulence is a Smagorinsky eddy viscosity with a viscosity floor (tauMin) so a coarse grid stays
 *   stable; walls are adiabatic and smooth; no radiation; a terminal's face is as big as the grid cells it covers, and a diffuser blows straight down (no
 *   swirl or four-way throw). It has been checked against conservation (air, heat and water in = out), not against measured room air: compareProfiles is
 *   the hook for the measured profiles, and until those numbers are given every result says so.
 *
 *   compareProfiles(r, measured) → { status: 'waits' | 'compared', … }   measured = { source (a citation, required), profiles: [{ id, along: 'x' | 'y' | 'z',
 *       at: { x?, y?, z? } mm, quantity: 'speed' | 'ux' | 'uy' | 'uz' | 'T' | 'rh' | 'w', points: [[s mm, value]…] }] }
 *   psychro: satP(t) Pa · ratio(t, rh, p) kg/kg · rhOf(t, w, p) %   the same equations as lib/weather/metrics.js (ASHRAE Handbook of Fundamentals,
 *       Psychrometrics, as written there), copied so this file travels alone.
 */
import { Lbm3D, FLAG } from './lbm3d.js';

export const AIR = Object.freeze({ rho: 1.2, cp: 1006, nu: 1.516e-5, Pr: 0.71, g: 9.81 });   // dry air near 20 °C (kg/m3, J/kg K, m2/s): stated defaults
export const DEFAULTS = Object.freeze({ maxCells: 12000, seconds: 120, uLat: 0.1, tauMin: 0.52, Cs: 0.1, zoneLow: 100, zoneHigh: 1800, zoneEdge: 500, snap: 300 });
export const LIMITS_KEY = 'roomair.limits';

// ---------------------------------------------------------------------------------------------------- psychrometrics
export function satP(t) {
  const T = t + 273.15;
  if (t < 0) return Math.exp(-5674.5359 / T + 6.3925247 - 9.677843e-3 * T + 6.2215701e-7 * T * T + 2.0747825e-9 * T ** 3 - 9.484024e-13 * T ** 4 + 4.1635019 * Math.log(T));
  return Math.exp(-5800.2206 / T + 1.3914993 - 4.8640239e-2 * T + 4.1764768e-5 * T * T - 1.4452093e-8 * T ** 3 + 6.5459673 * Math.log(T));
}
export function ratio(t, rh, p = 101325) { const pw = (rh / 100) * satP(t); return 0.621945 * pw / (p - pw); }
export function rhOf(t, w, p = 101325) { const pw = p * w / (0.621945 + w); return 100 * pw / satP(t); }

// ---------------------------------------------------------------------------------------------------- geometry
function inPoly(q, p) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const a = p[i], b = p[j];
    if ((a[1] > q[1]) !== (b[1] > q[1]) && q[0] < (b[0] - a[0]) * (q[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}
function edgeDist(q, p) {
  let m = Infinity;
  for (let i = 0; i < p.length; i++) {
    const a = p[i], b = p[(i + 1) % p.length], dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / L));
    m = Math.min(m, Math.hypot(q[0] - a[0] - dx * t, q[1] - a[1] - dy * t));
  }
  return m;
}
/** Is plan point q inside the w × d rectangle centred at (x, y), turned rot degrees? */
function inRect(q, x, y, w, d, rot) {
  const a = -(rot || 0) * Math.PI / 180, dx = q[0] - x, dy = q[1] - y;
  const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
  return Math.abs(lx) <= w / 2 && Math.abs(ly) <= d / 2;
}
/** The share of the plan cell [cx0, cx0 + c] × [cy0, cy0 + c] inside the turned rectangle (8 × 8 sample points). */
function share(cx0, cy0, c, x, y, w, d, rot) { let n = 0; for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) if (inRect([cx0 + (a + 0.5) * c / 8, cy0 + (b + 0.5) * c / 8], x, y, w, d, rot)) n++; return n / 64; }
const refuse = (key, vars = {}) => { throw Object.assign(new Error(key), { key, vars }); };
const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);

/** The spec, checked: plain numbers, a closed outline, at least one supply and one way out. Throws { key, vars } on what it cannot run. */
export function cleanSpec(spec = {}) {
  const poly = (spec.poly || []).map((p) => [Number(p[0]), Number(p[1])]).filter((p) => p.every(Number.isFinite));
  if (poly.length < 3) refuse('roomair.err.outline');
  const height = num(spec.height, 0);
  if (!(height >= 1000 && height <= 30000)) refuse('roomair.err.height');
  const terminals = (spec.terminals || []).map((t, i) => ({
    id: String(t.id ?? 't' + (i + 1)), name: String(t.name || t.id || 't' + (i + 1)), kind: String(t.kind || 'supply'),
    x: num(t.x, NaN), y: num(t.y, NaN), z: num(t.z, NaN), rot: num(t.rot, 0), w: num(t.w, 600), d: num(t.d, t.w ?? 600), h: num(t.h, 270),
    flowLps: Math.max(0, num(t.flowLps, 0)), T: num(t.T, NaN), rh: num(t.rh, NaN),
  }));
  for (const t of terminals) {
    if (!['supply', 'return', 'exhaust', 'fancoil'].includes(t.kind)) refuse('roomair.err.kind', { name: t.name });
    if (![t.x, t.y, t.z].every(Number.isFinite)) refuse('roomair.err.where', { name: t.name });
    if ((t.kind === 'supply' || t.kind === 'fancoil') && !(t.flowLps > 0)) refuse('roomair.err.flow', { name: t.name });
    if ((t.kind === 'supply' || t.kind === 'fancoil') && (!Number.isFinite(t.T) || !Number.isFinite(t.rh))) refuse('roomair.err.supplyair', { name: t.name });
  }
  if (!terminals.some((t) => t.kind === 'supply' || t.kind === 'fancoil')) refuse('roomair.err.nosupply');
  if (!terminals.some((t) => t.kind === 'return' || t.kind === 'exhaust' || t.kind === 'fancoil')) refuse('roomair.err.noreturn');
  const sources = (spec.sources || []).map((s, i) => ({ name: String(s.name || 'source ' + (i + 1)), x0: Math.min(num(s.x0, 0), num(s.x1, 0)), x1: Math.max(num(s.x0, 0), num(s.x1, 0)),
    y0: Math.min(num(s.y0, 0), num(s.y1, 0)), y1: Math.max(num(s.y0, 0), num(s.y1, 0)), z0: Math.min(num(s.z0, 0), num(s.z1, 0)), z1: Math.max(num(s.z0, 0), num(s.z1, 0)),
    watts: num(s.watts, 0), moistureGph: Math.max(0, num(s.moistureGph, 0)) }));
  const start = { T: num(spec.start?.T, 24), rh: num(spec.start?.rh, 50) };
  if (!(start.rh >= 0 && start.rh <= 100)) refuse('roomair.err.rh');
  return { poly, height, terminals, sources, start, p: num(spec.p, 101325), cell: num(spec.cell, 0), maxCells: Math.max(500, num(spec.maxCells, DEFAULTS.maxCells)),
    seconds: Math.max(1, num(spec.seconds, DEFAULTS.seconds)), uLat: Math.min(0.15, Math.max(0.02, num(spec.uLat, DEFAULTS.uLat))), tauMin: Math.max(0.505, num(spec.tauMin, DEFAULTS.tauMin)),
    Cs: Math.max(0, num(spec.Cs, DEFAULTS.Cs)), zone: { low: num(spec.zone?.low, DEFAULTS.zoneLow), high: num(spec.zone?.high, DEFAULTS.zoneHigh), edge: num(spec.zone?.edge, DEFAULTS.zoneEdge) } };
}

/** Plan area (mm2) of a polygon. */
const area = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - a[1] * b[0]; } return Math.abs(s / 2); };

// ---------------------------------------------------------------------------------------------------- the run
export class RoomRun {
  constructor(spec) {
    const S = this.spec = cleanSpec(spec);
    const warnings = this.warnings = [];
    const xs = S.poly.map((p) => p[0]), ys = S.poly.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const vol = area(S.poly) * S.height / 1e9;   // m3
    let c = S.cell > 0 ? S.cell : Math.ceil(Math.cbrt(vol / S.maxCells) * 1000 / 25) * 25;
    c = Math.max(25, c);
    const nx = Math.ceil((maxX - minX) / c) + 2, ny = Math.ceil((maxY - minY) / c) + 2, nz = Math.max(3, Math.round(S.height / c)) + 2;
    if (nx * ny * nz > 2e6) refuse('roomair.err.toobig', { cells: nx * ny * nz });
    const x0 = minX - c, y0 = minY - c;   // the grid's corner (mm): cell (i, j) centre = x0 + (i + 0.5) c
    this.grid = { nx, ny, nz, cell: c, x0, y0, z0: -c, cells: nx * ny * nz };
    const cm = c / 1000;   // m
    // lattice scaling: the fastest face velocity is held at uLat
    const faces = this._faces(S, c);
    const vmax = Math.max(0.3, ...faces.filter((f) => f.inlet).map((f) => f.speed));
    const dt = S.uLat * cm / vmax;
    const nuPhys = AIR.nu * dt / (cm * cm), nuFloor = (S.tauMin - 0.5) / 3, nu = Math.max(nuPhys, nuFloor);
    const alpha = nu / AIR.Pr;
    const beta = 1 / (S.start.T + 273.15), gbeta = AIR.g * beta * dt * dt / cm;
    this.lattice = { dt, nu, nuPhys, alpha, gbeta, tau0: 3 * nu + 0.5, floored: nu > nuPhys, nuEffective: nu * cm * cm / dt, vmax, Cs: S.Cs, uLat: S.uLat };
    if (nu > nuPhys) warnings.push({ key: 'roomair.warn.floor', vars: { nu: +(nu * cm * cm / dt).toExponential(2) } });
    const s = this.s = new Lbm3D({ nx, ny, nz, nu, alpha, gbeta, Tref: 0, Cs: S.Cs, PrT: 0.85, periodic: [false, false, false], scalar: true, Dh: alpha, ScT: 0.85, thermal: 19 });
    // cells: air where the centre is inside the outline and between floor and ceiling
    const air = this.air = new Uint8Array(nx * ny * nz);
    for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const q = [x0 + (i + 0.5) * c, y0 + (j + 0.5) * c], idx = s.idx(i, j, k);
      if (k >= 1 && k <= nz - 2 && inPoly(q, S.poly)) air[idx] = 1; else s.setFlag(i, j, k, FLAG.WALL);
    }
    // solid fan-coil bodies
    for (const t of S.terminals) if (t.kind === 'fancoil' && !t.concealed) for (const id of this._boxCells(t.box, c)) { air[id] = 0; const [i, j, k] = this._ijk(id); s.setFlag(i, j, k, FLAG.WALL); }
    if (!air.some((v) => v)) refuse('roomair.err.empty');
    // the start: still air at the room's temperature and humidity (scalar = humidity ratio in g/kg, temperature as T - Tstart)
    this.w0 = ratio(S.start.T, S.start.rh, S.p) * 1000;
    // faces → inlet / outlet cells
    this.inlets = []; this.outlets = [];
    for (const f of faces) {
      const cells = f.cells(this).filter((id) => !air[id] && this._touchesAir(id));
      if (!cells.length) { warnings.push({ key: 'roomair.warn.noface', vars: { name: f.name } }); continue; }
      if (f.inlet) {
        const A = cells.length * cm * cm, V = f.flowLps / 1000 / A, uL = V * dt / cm;
        const wSup = ratio(f.T, f.rh, S.p) * 1000;
        for (const id of cells) { const [i, j, k] = this._ijk(id); s.setFlag(i, j, k, FLAG.INLET, { u: f.dir[0] * uL, v: f.dir[1] * uL, w: f.dir[2] * uL, T: f.T - S.start.T, H: wSup }); }
        this.inlets.push({ name: f.name, cells: cells.length, areaM2: A, speed: V, flowLps: f.flowLps, T: f.T, rh: f.rh, w: wSup, dir: f.dir, ids: cells });
        if (Math.abs(A - f.faceM2) / f.faceM2 > 0.5) warnings.push({ key: 'roomair.warn.facearea', vars: { name: f.name, grid: +A.toFixed(3), face: +f.faceM2.toFixed(3) } });
      } else {
        for (const id of cells) { const [i, j, k] = this._ijk(id); s.setFlag(i, j, k, FLAG.OUTLET); }
        this.outlets.push({ name: f.name, cells, flowLps: f.flowLps });
      }
    }
    // each face gives the airflow asked for: its velocity is scaled by what its links really put in (a face at a body's edge loses some to links that point back)
    for (const f of this.inlets) {
      const set = new Set(f.ids), want = f.flowLps / 1000 * dt / (cm * cm * cm), have = s.inletRate((id) => set.has(id));
      if (have > 0) { f.scale = want / have; s.scaleInlet((id) => set.has(id), f.scale); }
      delete f.ids;
    }
    if (!this.inlets.length) refuse('roomair.err.nosupply');
    if (!this.outlets.length) refuse('roomair.err.noreturn');
    // heat and moisture sources: volumetric, spread over the air cells in their box
    let srcCells = 0;
    this.heatW = 0; this.moistGph = 0;
    for (const src of S.sources) {
      const ids = this._boxCells(src, c).filter((id) => air[id]);
      if (!ids.length) { warnings.push({ key: 'roomair.warn.nosource', vars: { name: src.name } }); continue; }
      this.heatW += src.watts; this.moistGph += src.moistureGph;
      const V = ids.length * cm * cm * cm, dT = src.watts * dt / (AIR.rho * AIR.cp * V), dW = src.moistureGph / 3600 * dt / (AIR.rho * V);   // K and g/kg per step
      for (const id of ids) { const [i, j, k] = this._ijk(id); s.setSource(i, j, k, (s.Q ? s.Q[id] : 0) + dT); if (dW) s.setSourceH(i, j, k, (s.Qh ? s.Qh[id] : 0) + dW); }
      srcCells += ids.length;
    }
    this.srcCells = srcCells;   // heatW and moistGph: the sources that hold air cells (the others are warned and add nothing)
    s.init({ T: 0, H: this.w0 });
    this.steps = 0; this.totalSteps = Math.ceil(S.seconds / dt); this.failed = null; this.history = [];
  }
  _ijk(id) { const { nx, ny } = this.grid; return [id % nx, Math.floor(id / nx) % ny, Math.floor(id / (nx * ny))]; }
  _touchesAir(id) {
    const { nx, ny, nz } = this.grid, [i, j, k] = this._ijk(id);
    for (const [a, b, d] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
      const I = i + a, J = j + b, K = k + d;
      if (I >= 0 && J >= 0 && K >= 0 && I < nx && J < ny && K < nz && this.air[I + nx * (J + ny * K)]) return true;
    }
    return false;
  }
  /** The cells whose centre lies in a box { x0..x1, y0..y1, z0..z1 } mm, or a turned box { cx, cy, L, W, z0, z1, rot }. */
  _boxCells(b, c) {
    const { nx, ny, nz, x0, y0 } = this.grid, out = [];
    for (let k = 0; k < nz; k++) {
      const z = (k - 0.5) * c;
      if (z < b.z0 || z > b.z1) continue;
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const q = [x0 + (i + 0.5) * c, y0 + (j + 0.5) * c];
        const inside = b.L !== undefined ? inRect(q, b.cx, b.cy, b.L, b.W, b.rot) : q[0] >= b.x0 && q[0] <= b.x1 && q[1] >= b.y0 && q[1] <= b.y1;
        if (inside) out.push(i + nx * (j + ny * k));
      }
    }
    return out;
  }
  /** Every terminal face: { name, inlet, flowLps, T, rh, dir, speed (nominal), faceM2, cells(run) → ids }. */
  _faces(S, c) {
    const faces = [], H = S.height, snap = DEFAULTS.snap;
    const plane = (k, x, y, w, d, rot) => (run) => {
      const { nx, ny, x0, y0 } = run.grid, out = [];
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) if (share(x0 + i * c, y0 + j * c, c, x, y, Math.max(w, 1), Math.max(d, 1), rot) > 0.5) out.push(i + nx * (j + ny * k));
      if (!out.length) {   // a face smaller than a cell: the cell under its centre
        const i = Math.floor((x - x0) / c), j = Math.floor((y - y0) / c);
        if (i >= 0 && j >= 0 && i < nx && j < ny) out.push(i + nx * (j + ny * k));
      }
      return out;
    };
    for (const t of S.terminals) {
      const inlet = t.kind === 'supply';
      if (t.kind !== 'fancoil') {
        const ceil = Math.abs(t.z - H) <= snap, floor = Math.abs(t.z) <= snap;
        if (!ceil && !floor) { this.warnings.push({ key: 'roomair.warn.where', vars: { name: t.name } }); continue; }
        const k = ceil ? Math.max(3, Math.round(H / c)) + 1 : 0;
        faces.push({ name: t.name, inlet, flowLps: t.flowLps, T: t.T, rh: t.rh, dir: [0, 0, ceil ? -1 : 1], speed: t.flowLps / 1000 / Math.max(1e-4, t.w * t.d / 1e6), faceM2: t.w * t.d / 1e6, cells: plane(k, t.x, t.y, t.w, t.d, t.rot) });
        continue;
      }
      // a fan coil: L = w along its own x, W = d, height h; supply out of +x, return in at -x
      const a = t.rot * Math.PI / 180, ex = [Math.cos(a), Math.sin(a)], L = t.w, W = t.d;
      const faceM2 = W * Math.min(t.h, 200) / 1e6;
      if (t.z >= H - snap / 3) {   // above the ceiling: concealed, ducted to the ceiling under its ends
        t.concealed = true;
        const k = Math.max(3, Math.round(H / c)) + 1, sx = t.x + ex[0] * (L / 2 - c / 2), sy = t.y + ex[1] * (L / 2 - c / 2), rx = t.x - ex[0] * (L / 2 - c / 2), ry = t.y - ex[1] * (L / 2 - c / 2);
        faces.push({ name: t.name + ' supply', inlet: true, flowLps: t.flowLps, T: t.T, rh: t.rh, dir: [0, 0, -1], speed: t.flowLps / 1000 / (W * c / 1e6), faceM2: W * c / 1e6, cells: plane(k, sx, sy, c, W, t.rot) });
        faces.push({ name: t.name + ' return', inlet: false, flowLps: t.flowLps, cells: plane(k, rx, ry, c, W, t.rot) });
        continue;
      }
      t.box = { cx: t.x, cy: t.y, L, W, rot: t.rot, z0: t.z, z1: t.z + t.h };
      const ends = (sign) => (run) => {
        // the body's cells on that end that have air beyond them along ±ex
        const body = run._boxCells(t.box, c), set = new Set(body), out = [];
        const step = [Math.round(sign * ex[0]), Math.round(sign * ex[1])];
        for (const id of body) { const [i, j, k] = run._ijk(id), n = (i + step[0]) + run.grid.nx * ((j + step[1]) + run.grid.ny * k); if (!set.has(n)) out.push(id); }
        return out;
      };
      faces.push({ name: t.name + ' supply', inlet: true, flowLps: t.flowLps, T: t.T, rh: t.rh, dir: [ex[0], ex[1], 0], speed: t.flowLps / 1000 / faceM2, faceM2, cells: ends(1) });
      faces.push({ name: t.name + ' return', inlet: false, flowLps: t.flowLps, cells: ends(-1) });
    }
    return faces;
  }

  get done() { return this.steps >= this.totalSteps || !!this.failed; }
  get progress() { return Math.min(1, this.steps / this.totalSteps); }
  /** Run n more steps (stops at the planned time, or when the lattice speed shows the run has gone unstable). → steps run. */
  advance(n = 200) {
    if (this.done) return 0;
    const m = Math.min(n, this.totalSteps - this.steps);
    this.s.step(m); this.steps += m;
    const v = this.s.maxSpeed();
    if (!(v < 0.35)) this.failed = { key: 'roomair.err.unstable', vars: { at: +(this.steps * this.lattice.dt).toFixed(1) } };
    this.history.push({ t: this.steps * this.lattice.dt, ...this._means() });
    return m;
  }
  _means() {
    const s = this.s, N = s.N; let n = 0, T = 0, sp = 0;
    for (let i = 0; i < N; i++) if (this.air[i]) { n++; T += s.T[i]; sp += Math.hypot(s.ux[i], s.uy[i], s.uz[i]); }
    const k = this.grid.cell / 1000 / this.lattice.dt;
    return { T: this.spec.start.T + T / n, speed: sp / n * k };
  }

  /** Everything in physical units. */
  result() {
    const S = this.spec, s = this.s, { nx, ny, nz, cell: c, x0, y0 } = this.grid, N = s.N, k = c / 1000 / this.lattice.dt;
    const F = (fn) => { const a = new Float32Array(N); for (let i = 0; i < N; i++) a[i] = this.air[i] ? fn(i) : NaN; return a; };
    const ux = F((i) => s.ux[i] * k), uy = F((i) => s.uy[i] * k), uz = F((i) => s.uz[i] * k);
    const speed = F((i) => Math.hypot(ux[i], uy[i], uz[i])), T = F((i) => S.start.T + s.T[i]), w = F((i) => s.H[i]);
    const rh = F((i) => rhOf(T[i], w[i] / 1000, S.p));
    const fields = { speed, ux, uy, uz, T, w, rh };
    // the air through each outlet and inlet, from the populations crossing their links (lbm3d boundaryFlux)
    const cm = c / 1000, vol = cm * cm * cm / this.lattice.dt;   // lattice volume per step → m3/s
    let out = 0, Tout = 0, Wout = 0;
    for (const o of this.outlets) {
      const set = new Set(o.cells), fl = s.boundaryFlux((id) => set.has(id));
      o.measuredLps = fl.q * vol * 1000;
      if (fl.q > 0) { out += fl.q; Tout += fl.qT; Wout += fl.qH; }
    }
    const inFlux = s.boundaryFlux((id) => s.flag[id] === FLAG.INLET);
    const inLps = -inFlux.q * vol * 1000;
    Tout = out > 0 ? S.start.T + Tout / out : NaN; Wout = out > 0 ? Wout / out : NaN; out *= vol;
    const supplyLps = this.inlets.reduce((a, x) => a + x.flowLps, 0);
    const exhaust = out > 0 ? { T: Tout, w: Wout, rh: rhOf(Tout, Wout / 1000, S.p) } : null;
    // the occupied zone: low..high above the floor, at least `edge` from the outline, not in a fan coil
    const Z = S.zone, zc = [];
    for (let kk = 1; kk < nz - 1; kk++) { const z = (kk - 0.5) * c; if (z >= Z.low && z <= Z.high) zc.push(kk); }
    let zn = 0, zs = 0, zsMax = 0, zT = 0, zTmin = Infinity, zTmax = -Infinity, zrh = 0, zrhMin = Infinity, zrhMax = -Infinity;
    const layer = (zmm) => Math.max(1, Math.min(nz - 2, Math.round(zmm / c + 0.5)));
    const kLow = layer(100), kHigh = layer(1100);
    let lo = 0, loN = 0, hi = 0, hiN = 0;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const q = [x0 + (i + 0.5) * c, y0 + (j + 0.5) * c];
      if (!inPoly(q, S.poly) || edgeDist(q, S.poly) < Z.edge) continue;
      for (const kk of zc) {
        const id = i + nx * (j + ny * kk); if (!this.air[id]) continue;
        zn++; zs += speed[id]; zsMax = Math.max(zsMax, speed[id]); zT += T[id]; zTmin = Math.min(zTmin, T[id]); zTmax = Math.max(zTmax, T[id]); zrh += rh[id]; zrhMin = Math.min(zrhMin, rh[id]); zrhMax = Math.max(zrhMax, rh[id]);
      }
      const a = i + nx * (j + ny * kLow), b = i + nx * (j + ny * kHigh);
      if (this.air[a]) { lo += T[a]; loN++; }
      if (this.air[b]) { hi += T[b]; hiN++; }
    }
    const zone = zn ? { cells: zn, speedMean: zs / zn, speedMax: zsMax, Tmean: zT / zn, Tmin: zTmin, Tmax: zTmax, rhMean: zrh / zn, rhMin: zrhMin, rhMax: zrhMax,
      dTvertical: loN && hiN ? hi / hiN - lo / loN : NaN, low: Z.low, high: Z.high, edge: Z.edge } : null;
    const warnings = [...this.warnings];
    if (!zone) warnings.push({ key: 'roomair.warn.nozone' });
    // settling: how far the room's mean temperature moved over the last tenth of the time simulated
    const H = this.history, tEnd = H.length ? H[H.length - 1].t : 0, ref = H.length ? [...H].reverse().find((x) => x.t <= 0.9 * tEnd) : null;
    const settling = ref && H.length >= 2 ? Math.abs(H[H.length - 1].T - ref.T) : NaN, settlingOver = ref ? tEnd - ref.t : NaN;
    const r = {
      ok: !this.failed, failed: this.failed, warnings, limits: LIMITS_KEY, validated: false, validation: 'waits',
      grid: { ...this.grid }, lattice: { ...this.lattice }, steps: this.steps, time: this.steps * this.lattice.dt, planned: S.seconds, history: this.history.slice(),
      inlets: this.inlets.map((x) => ({ ...x })), outlets: this.outlets.map((o) => ({ name: o.name, cells: o.cells.length, flowLps: o.flowLps, measuredLps: o.measuredLps })),
      flows: { supplyLps, inLps, returnTypedLps: this.outlets.reduce((a, x) => a + (x.flowLps || 0), 0), outLps: out * 1000 }, heatW: this.heatW, moistureGph: this.moistGph,
      exhaust, zone, fields, start: { ...S.start, w: this.w0 }, settling, settlingOver, poly: S.poly.map((p) => [...p]), height: S.height,
      memoryBytes: s.memoryBytes() + this.air.byteLength,
    };
    r.at = (x, y, z, q = 'speed') => valueAt(r, x, y, z, q);
    r.section = (o) => section(r, o);
    r.line = (o) => line(r, o);
    return r;
  }
}

// ---------------------------------------------------------------------------------------------------- reading a result
const QUANT = ['speed', 'ux', 'uy', 'uz', 'T', 'w', 'rh'];
function cellOf(r, x, y, z) { const { nx, ny, nz, cell: c, x0, y0 } = r.grid, i = Math.floor((x - x0) / c), j = Math.floor((y - y0) / c), k = Math.floor(z / c + 1); return i < 0 || j < 0 || k < 0 || i >= nx || j >= ny || k >= nz ? -1 : i + nx * (j + ny * k); }
/** The value of quantity q at plan x, y and height z (mm): the cell's value, NaN outside the air. */
export function valueAt(r, x, y, z, q = 'speed') { if (!QUANT.includes(q)) refuse('roomair.err.quantity', { q }); const id = cellOf(r, x, y, z); return id < 0 ? NaN : r.fields[q][id]; }
/**
 * A plane through the grid: { axis: 'z' (a plan at height at), 'x' or 'y' (an upright section at x = at or y = at), at: mm, q } →
 * { cols, rows, values: Float32Array(rows × cols) (row 0 at the bottom / the low y), origin: [u0, v0] mm, cell, axis, at, q, min, max } (NaN outside the air).
 */
export function section(r, { axis = 'z', at = 1100, q = 'speed' } = {}) {
  if (!QUANT.includes(q)) refuse('roomair.err.quantity', { q });
  const { nx, ny, nz, cell: c, x0, y0 } = r.grid, f = r.fields[q];
  let cols, rows, get, origin;
  if (axis === 'z') { const k = Math.max(1, Math.min(nz - 2, Math.floor(at / c + 1))); cols = nx; rows = ny; get = (u, v) => f[u + nx * (v + ny * k)]; origin = [x0, y0]; }
  else if (axis === 'x') { const i = Math.max(0, Math.min(nx - 1, Math.floor((at - x0) / c))); cols = ny; rows = nz; get = (u, v) => f[i + nx * (u + ny * v)]; origin = [y0, -c]; }
  else if (axis === 'y') { const j = Math.max(0, Math.min(ny - 1, Math.floor((at - y0) / c))); cols = nx; rows = nz; get = (u, v) => f[u + nx * (j + ny * v)]; origin = [x0, -c]; }
  else refuse('roomair.err.axis', { axis });
  const values = new Float32Array(cols * rows); let min = Infinity, max = -Infinity;
  for (let v = 0; v < rows; v++) for (let u = 0; u < cols; u++) { const x = get(u, v); values[u + cols * v] = x; if (x === x) { if (x < min) min = x; if (x > max) max = x; } }
  return { cols, rows, values, origin, cell: c, axis, at, q, min, max };
}
/** Values along a straight line of the grid: { along: 'z' | 'x' | 'y', x?, y?, z? (mm, the other two), q } → [[s mm, value]…] at the air cells' centres. */
export function line(r, { along = 'z', x = 0, y = 0, z = 1100, q = 'speed' } = {}) {
  const { nx, ny, nz, cell: c, x0, y0 } = r.grid, out = [];
  if (along === 'z') for (let k = 1; k < nz - 1; k++) { const s = (k - 0.5) * c, v = valueAt(r, x, y, s, q); if (v === v) out.push([s, v]); }
  else if (along === 'x') for (let i = 0; i < nx; i++) { const s = x0 + (i + 0.5) * c, v = valueAt(r, s, y, z, q); if (v === v) out.push([s, v]); }
  else if (along === 'y') for (let j = 0; j < ny; j++) { const s = y0 + (j + 0.5) * c, v = valueAt(r, x, s, z, q); if (v === v) out.push([s, v]); }
  else refuse('roomair.err.axis', { axis: along });
  return out;
}
const interp = (pts, s) => {
  if (!pts.length) return NaN;
  if (s <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (s <= pts[i][0]) { const [a, va] = pts[i - 1], [b, vb] = pts[i]; return va + (vb - va) * (s - a) / (b - a || 1); }
  return pts[pts.length - 1][1];
};

/**
 * The hook for measured room air. With no measured numbers (or none with a source), nothing is compared: { status: 'waits', key }. With them, each profile is
 * read along the same line of the result and compared point by point: { status: 'compared', source, profiles: [{ id, quantity, n, rms, maxAbs, meanMeasured,
 * meanSimulated, points: [[s, measured, simulated]] }] }. Measured points outside the air (the result has no value there) are counted in `outside`.
 */
export function compareProfiles(r, measured) {
  if (!measured || !Array.isArray(measured.profiles) || !measured.profiles.length) return { status: 'waits', key: 'roomair.valid.waits' };
  if (!String(measured.source || '').trim()) return { status: 'waits', key: 'roomair.valid.nosource' };
  const profiles = measured.profiles.map((p, n) => {
    const q = p.quantity || 'speed', at = p.at || {};
    const sim = line(r, { along: p.along || 'z', x: at.x, y: at.y, z: at.z, q });
    const pts = []; let outside = 0;
    for (const [s, m] of p.points || []) {
      if (!Number.isFinite(s) || !Number.isFinite(m)) continue;
      const lo = sim.length ? sim[0][0] - r.grid.cell / 2 : 0, hi = sim.length ? sim[sim.length - 1][0] + r.grid.cell / 2 : -1;
      if (s < lo || s > hi) { outside++; continue; }
      pts.push([s, m, interp(sim, s)]);
    }
    const d = pts.map((x) => x[2] - x[1]);
    return { id: p.id ?? 'p' + (n + 1), quantity: q, along: p.along || 'z', n: pts.length, outside, rms: d.length ? Math.sqrt(d.reduce((a, x) => a + x * x, 0) / d.length) : NaN,
      maxAbs: d.length ? Math.max(...d.map(Math.abs)) : NaN, meanMeasured: pts.length ? pts.reduce((a, x) => a + x[1], 0) / pts.length : NaN,
      meanSimulated: pts.length ? pts.reduce((a, x) => a + x[2], 0) / pts.length : NaN, points: pts };
  });
  return { status: 'compared', source: String(measured.source), profiles };
}

/** Run a whole spec to its planned time in one call (Node tests, workstation runs): → result. onChunk(run) after each chunk. */
export function runRoom(spec, { chunk = 500, onChunk } = {}) {
  const run = new RoomRun(spec);
  while (!run.done) { run.advance(chunk); if (onChunk) onChunk(run); }
  return run.result();
}
