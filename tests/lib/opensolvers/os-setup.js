/* SPDX-License-Identifier: Apache-2.0 */
/**
 * os-setup.js — the settings of the Open solver cases add-on as plain data, and the reader that checks them (lib/opensolvers; suggestion 1309).
 * DOM-free, imports nothing. A host registers the reader for the file's key (PartCraft: part.studies['open-solvers']) so a file saved with the
 * settings opens when the add-on is off and an untrusted file cannot put anything else in the file.
 *
 *   setup = { v: 1, target: 'flow' | 'structure' | 'impact'        which kind of case (one outside program each, see TARGETS)
 *     h: mm | null                                                 element size of the solid mesh (structure, impact); null = automatic
 *     material: { id, E MPa, nu, rho kg/m³, yield MPa | null, k W/(m·K) | null }
 *     groups: [{ id, role, faces: [faceRef], …values of the role }]   faces picked in the 3D view, by role (ROLES)
 *     flow:   { flavour 'esi' | 'foundation', kind 'external' | 'internal', model 'kOmegaSST' | 'laminar', fluid 'air' | 'water' | 'custom',
 *               nu m²/s, rho kg/m³, speed m/s, dir 0…5 (+X −X +Y −Y +Z −Z), up, down, side (box margins, × the model's largest size),
 *               cell mm | null, levelMin, levelMax, layers 0…10, intensity %, mixing mm | null, procs, steps, dt s | null, endTime s }
 *     structure: { kind 'static' | 'modal' | 'thermal', modes, gravity: boolean, gdir 0…5 }
 *     impact: { elem 'tetra4' | 'tetra10', law 'elastic' | 'jc', jc: { a MPa, b MPa, n, c, eps0 1/s }, v0: [vx, vy, vz] m/s, floor: boolean,
 *               floorDir 0…5 (the side the floor is on), gap mm, gravity: boolean, contact: boolean, tEnd ms, frames }
 *     plot: { field: string | null, scale: number | null, beside: boolean } }
 *   faceRef = { name, at: [x, y, z] }   the host's stable reference to a face
 *
 * Material presets: the same typical room-temperature figures as lib/fem/solid-setup.js (ASM data sheets as published on MatWeb); thermal
 * conductivity is not preset here: the host hands its own material list (PartCraft's materials.js) or the person types it.
 * Fluids: dry air and water at 20 °C and 101 325 Pa (air: ρ = p/(R T) with R = 287.05 J/(kg·K) → 1.204 kg/m³, μ by Sutherland's law
 * 1.813e-5 Pa·s → ν = 1.506e-5 m²/s; water: ρ = 998.2 kg/m³, μ = 1.0016e-3 Pa·s (the IAPWS value at 20 °C) → ν = 1.003e-6 m²/s);
 * the same figures as PartCraft's own flow study (flow.js FLUIDS).
 */
export const FILE_KEY = 'open-solvers';
export const TARGETS = ['flow', 'structure', 'impact'];
export const ROLES = {
  flow: ['inlet', 'outlet', 'wall', 'symmetry', 'slip'],
  structure: ['fixed', 'force', 'pressure', 'temp', 'flux', 'conv'],
  impact: ['fixed', 'velocity'],
};
/** Roles a structure study of each kind reads. */
export const STRUCTURE_ROLES = { static: ['fixed', 'force', 'pressure'], modal: ['fixed'], thermal: ['temp', 'flux', 'conv'] };
export const LIMITS = { groups: 32, faces: 64, coord: 1e9 };
export const MATERIAL_IDS = ['steel', 'stainless', 'aluminium', 'titanium', 'abs', 'custom'];
export const PRESETS = {
  steel: { E: 200000, nu: 0.26, rho: 7850, yield: 250 }, stainless: { E: 193000, nu: 0.29, rho: 8000, yield: 215 },
  aluminium: { E: 68900, nu: 0.33, rho: 2700, yield: 276 }, titanium: { E: 113800, nu: 0.342, rho: 4430, yield: 880 }, abs: { E: 2300, nu: 0.35, rho: 1050, yield: 40 },
};
export const FLUIDS = { air: { nu: 1.506e-5, rho: 1.204 }, water: { nu: 1.003e-6, rho: 998.2 } };
export const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
export const DIR_NAMES = ['+X', '-X', '+Y', '-Y', '+Z', '-Z'];

export const newSetup = () => ({
  v: 1, target: 'flow', h: null, material: { id: 'steel', ...PRESETS.steel, k: null }, groups: [],
  flow: { flavour: 'esi', kind: 'external', model: 'kOmegaSST', fluid: 'air', ...FLUIDS.air, speed: 10, dir: 0, up: 2, down: 5, side: 2, cell: null, levelMin: 2, levelMax: 3, layers: 0,
    intensity: 5, mixing: null, procs: 4, steps: 500, dt: null, endTime: 1 },
  structure: { kind: 'static', modes: 6, gravity: false, gdir: 3 },
  impact: { elem: 'tetra4', law: 'elastic', jc: { a: 250, b: 0, n: 1, c: 0, eps0: 1 }, v0: [0, -4.43, 0], floor: true, floorDir: 3, gap: 1, gravity: true, contact: false, tEnd: 2, frames: 20 },
  plot: { field: null, scale: null, beside: true },
});

function bad(msg) { throw new Error(msg); }
const num = (v, lo, hi, what) => { const n = typeof v === 'number' ? v : NaN; if (!Number.isFinite(n) || n < lo || n > hi) bad(what + ': a number from ' + lo + ' to ' + hi); return n; };
const opt = (v, lo, hi, what) => (v === null || v === undefined ? null : num(v, lo, hi, what));
const whole = (v, lo, hi, what) => Math.round(num(v, lo, hi, what));
const text = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, n);
const one = (v, list, what) => (list.includes(v) ? v : bad(what + ': one of ' + list.join(', ')));
const vec = (v, lim, what) => { if (!Array.isArray(v) || v.length !== 3) bad(what + ': three numbers'); return v.map((x) => num(x, -lim, lim, what)); };
function faceRefs(v) {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v) || v.length > LIMITS.faces) bad('faces: a list of at most ' + LIMITS.faces);
  return v.map((f) => {
    if (!f || typeof f !== 'object') bad('faces: a face reference');
    const name = text(f.name, 600);
    if (!name) bad('faces: a face has a name');
    return { name, at: vec(f.at, LIMITS.coord, 'faces') };
  });
}
const ALL_ROLES = [...new Set(Object.values(ROLES).flat())];

function group(g) {
  if (!g || typeof g !== 'object') bad('group: an object');
  const id = text(g.id, 24); if (!/^[a-z][a-z0-9]{0,23}$/.test(id)) bad('group: a short id');
  const role = one(g.role, ALL_ROLES, 'role'), out = { id, role, faces: faceRefs(g.faces) };
  if (role === 'inlet') out.U = num(g.U ?? 1, 0, 1e4, 'inlet speed');
  if (role === 'outlet') out.p = num(g.p ?? 0, -1e9, 1e9, 'outlet pressure');
  if (role === 'force') out.F = vec(g.F ?? [0, -100, 0], 1e12, 'force');
  if (role === 'pressure') out.p = num(g.p ?? 1, -1e6, 1e6, 'pressure');
  if (role === 'temp') out.T = num(g.T ?? 20, -273.15, 1e5, 'temperature');
  if (role === 'flux') out.q = num(g.q ?? 1000, -1e12, 1e12, 'heat flux');
  if (role === 'conv') { out.hc = num(g.hc ?? 10, 0, 1e9, 'film coefficient'); out.Tinf = num(g.Tinf ?? 20, -273.15, 1e5, 'ambient temperature'); }
  if (role === 'velocity') out.v = vec(g.v ?? [0, -1, 0], 1e5, 'velocity');
  return out;
}

export function readSetup(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) bad('the open solver case settings are not an object');
  const d = newSetup(), m = raw.material || d.material, f = { ...d.flow, ...(raw.flow || {}) }, s = { ...d.structure, ...(raw.structure || {}) }, i = { ...d.impact, ...(raw.impact || {}) }, p = raw.plot || {};
  const jc = { ...d.impact.jc, ...(i.jc || {}) };
  const groups = raw.groups === undefined || raw.groups === null ? [] : Array.isArray(raw.groups) && raw.groups.length <= LIMITS.groups ? raw.groups.map(group) : bad('groups: a list of at most ' + LIMITS.groups);
  const seen = new Set(); for (const g of groups) { if (seen.has(g.id)) bad('two groups with the id ' + g.id); seen.add(g.id); }
  return {
    v: 1, target: one(raw.target ?? 'flow', TARGETS, 'target'),
    h: opt(raw.h, 1e-3, 1e5, 'element size'),
    material: { id: one(m.id, MATERIAL_IDS, 'material'), E: num(m.E, 1e-3, 1e8, 'E'), nu: num(m.nu, 0, 0.4999, 'Poisson ratio'), rho: num(m.rho ?? 0, 0, 1e5, 'density'),
      yield: opt(m.yield, 1e-3, 1e7, 'yield stress'), k: opt(m.k, 1e-6, 1e5, 'thermal conductivity') },
    groups,
    flow: { flavour: one(f.flavour, ['esi', 'foundation'], 'flavour'), kind: one(f.kind, ['external', 'internal'], 'flow kind'), model: one(f.model, ['kOmegaSST', 'laminar'], 'flow model'),
      fluid: one(f.fluid, ['air', 'water', 'custom'], 'fluid'), nu: num(f.nu, 1e-9, 10, 'kinematic viscosity'), rho: num(f.rho, 1e-3, 1e5, 'fluid density'),
      speed: num(f.speed, 1e-6, 1e4, 'speed'), dir: whole(f.dir, 0, 5, 'flow direction'), up: num(f.up, 0.1, 100, 'upstream margin'), down: num(f.down, 0.1, 100, 'downstream margin'), side: num(f.side, 0.1, 100, 'side margin'),
      cell: opt(f.cell, 1e-3, 1e6, 'cell size'), levelMin: whole(f.levelMin, 0, 8, 'refinement level'), levelMax: whole(Math.max(f.levelMax, f.levelMin), 0, 8, 'refinement level'), layers: whole(f.layers, 0, 10, 'layers'),
      intensity: num(f.intensity, 0.01, 100, 'turbulence intensity'), mixing: opt(f.mixing, 1e-6, 1e6, 'length scale'), procs: whole(f.procs, 1, 512, 'processes'), steps: whole(f.steps, 1, 1e7, 'iterations'),
      dt: opt(f.dt, 1e-12, 1e3, 'time step'), endTime: num(f.endTime, 1e-9, 1e7, 'end time') },
    structure: { kind: one(s.kind, ['static', 'modal', 'thermal'], 'study'), modes: whole(s.modes, 1, 50, 'modes'), gravity: s.gravity === true, gdir: whole(s.gdir, 0, 5, 'gravity direction') },
    impact: { elem: one(i.elem, ['tetra4', 'tetra10'], 'element'), law: one(i.law, ['elastic', 'jc'], 'material law'),
      jc: { a: num(jc.a, 1e-6, 1e7, 'A'), b: num(jc.b, 0, 1e7, 'B'), n: num(jc.n, 0, 10, 'n'), c: num(jc.c, 0, 10, 'C'), eps0: num(jc.eps0, 1e-12, 1e9, 'reference strain rate') },
      v0: vec(i.v0, 1e5, 'initial velocity'), floor: i.floor !== false, floorDir: whole(i.floorDir, 0, 5, 'floor side'), gap: num(i.gap, 0, 1e6, 'gap'), gravity: i.gravity !== false, contact: i.contact === true,
      tEnd: num(i.tEnd, 1e-6, 1e6, 'run time'), frames: whole(i.frames, 1, 1000, 'frames') },
    plot: { field: p.field === null || p.field === undefined ? null : text(p.field, 120), scale: opt(p.scale, 0, 1e9, 'deformation scale'), beside: p.beside !== false },
  };
}

/** Groups of one role list, in the order they were made. */
export const groupsOf = (setup, roles) => setup.groups.filter((g) => roles.includes(g.role));
