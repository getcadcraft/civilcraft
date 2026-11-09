/* SPDX-License-Identifier: Apache-2.0 */
/**
 * solid-setup.js — the settings of the Solid FEM add-on (0.9 SU.908c) as plain data, and the reader that checks them. DOM-free, imports nothing.
 * The reader is what a host registers for the file's key (PartCraft: part.studies['fem-solid'], via its own fem-solid-study.js) so a file saved
 * with the settings opens even when the add-on is off, and an untrusted file cannot put anything else in the part.
 *
 *   setup = { v: 1, h: number | null (element size, mm; null = automatic), material: { id, E (MPa), nu, rho (kg/m³), yield (MPa) | null },
 *             kind: 'static' | 'modal', modes: 1..12,
 *             supports: [{ id, faces: [faceRef] }]                 fixed faces (all three directions held)
 *             loads:    [{ id, type: 'force', faces, F: [Fx, Fy, Fz] N total, spread evenly over the faces' area }
 *                        | { id, type: 'pressure', faces, p: MPa, pushes into the body when positive }
 *                        | { id, type: 'gravity', g: [gx, gy, gz] m/s² }],
 *             plot: { field: 'vm' | 'disp' | 'mode', mode: 1..12, scale: number | null (null = automatic), beside: boolean } }
 *   faceRef = { name: string, at: [x, y, z] } (the host's stable reference to a face: PartCraft's named face and a point on it)
 *
 *   newSetup() · readSetup(raw) → clean copy or throws Error(plain message) · MATERIAL_IDS
 */
export const FILE_KEY = 'fem-solid';
export const LIMITS = { items: 24, faces: 64, h: [1e-3, 1e5], E: [1e-3, 1e8], rho: [0, 1e5], modes: 12, coord: 1e9, force: 1e12, pressure: 1e6, g: 1e6 };
export const MATERIAL_IDS = ['steel', 'stainless', 'aluminium', 'titanium', 'abs', 'custom'];
/**
 * Typical room-temperature values (E, yield MPa; rho kg/m³), the same figures as PartCraft's materials.js; a real design uses the supplier's certified data.
 * Sources: A36 structural steel, 304 stainless (annealed), 6061-T6 aluminium and Ti-6Al-4V (grade 5, annealed) from ASM data sheets as published on MatWeb
 * (asm.matweb.com); ABS (injection moulded, general purpose) from MatWeb's overview averages. The solver treats every material as isotropic.
 */
export const PRESETS = {
  steel: { E: 200000, nu: 0.26, rho: 7850, yield: 250 }, stainless: { E: 193000, nu: 0.29, rho: 8000, yield: 215 },
  aluminium: { E: 68900, nu: 0.33, rho: 2700, yield: 276 }, titanium: { E: 113800, nu: 0.342, rho: 4430, yield: 880 }, abs: { E: 2300, nu: 0.35, rho: 1050, yield: 40 },
};

export const newSetup = () => ({
  v: 1, h: null, material: { id: 'steel', ...PRESETS.steel }, kind: 'static', modes: 4, supports: [], loads: [],
  plot: { field: 'vm', mode: 1, scale: null, beside: true },
});

function bad(msg) { throw new Error(msg); }
const num = (v, lo, hi, what) => {
  const n = typeof v === 'number' ? v : NaN;
  if (!Number.isFinite(n) || n < lo || n > hi) bad(what + ': a number from ' + lo + ' to ' + hi);
  return n;
};
const text = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, n);
const id = (v, what) => { const s = text(v, 24); if (!/^[a-z][a-z0-9-]{0,23}$/.test(s)) bad(what + ': a short id'); return s; };
const vec = (v, lim, what) => { if (!Array.isArray(v) || v.length !== 3) bad(what + ': three numbers'); return v.map((x) => num(x, -lim, lim, what)); };
function faceRefs(v) {
  if (!Array.isArray(v) || v.length > LIMITS.faces) bad('faces: a list of at most ' + LIMITS.faces);
  return v.map((f) => {
    if (!f || typeof f !== 'object') bad('faces: a face reference');
    const name = text(f.name, 80);
    if (!name) bad('faces: a face has a name');
    return { name, at: vec(f.at, LIMITS.coord, 'faces') };
  });
}
function list(v, fn) {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v) || v.length > LIMITS.items) bad('a list of at most ' + LIMITS.items);
  const out = v.map(fn), seen = new Set();
  for (const x of out) { if (seen.has(x.id)) bad('two items with the id ' + x.id); seen.add(x.id); }
  return out;
}

export function readSetup(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) bad('the Solid FEM settings are not an object');
  const m = raw.material || {}, plot = raw.plot || {};
  if (!MATERIAL_IDS.includes(m.id)) bad('material: an id from the list');
  const kind = raw.kind === 'modal' ? 'modal' : raw.kind === 'static' || raw.kind === undefined ? 'static' : bad('kind: static or modal');
  return {
    v: 1,
    h: raw.h === null || raw.h === undefined ? null : num(raw.h, LIMITS.h[0], LIMITS.h[1], 'element size'),
    material: {
      id: m.id, E: num(m.E, LIMITS.E[0], LIMITS.E[1], 'E'), nu: num(m.nu, 0, 0.4999, 'Poisson ratio'), rho: num(m.rho ?? 0, LIMITS.rho[0], LIMITS.rho[1], 'density'),
      yield: m.yield === null || m.yield === undefined ? null : num(m.yield, 1e-3, 1e7, 'yield stress'),
    },
    kind, modes: Math.round(num(raw.modes ?? 4, 1, LIMITS.modes, 'modes')),
    supports: list(raw.supports, (s) => ({ id: id(s && s.id, 'support'), faces: faceRefs(s && s.faces) })),
    loads: list(raw.loads, (l) => {
      if (!l || typeof l !== 'object') bad('load: an object');
      const base = { id: id(l.id, 'load'), type: l.type };
      if (l.type === 'force') return { ...base, faces: faceRefs(l.faces), F: vec(l.F, LIMITS.force, 'force') };
      if (l.type === 'pressure') return { ...base, faces: faceRefs(l.faces), p: num(l.p, -LIMITS.pressure, LIMITS.pressure, 'pressure') };
      if (l.type === 'gravity') return { ...base, g: vec(l.g, LIMITS.g, 'gravity') };
      return bad('load: force, pressure or gravity');
    }),
    plot: {
      field: ['vm', 'disp', 'mode'].includes(plot.field) ? plot.field : 'vm', mode: Math.round(num(plot.mode ?? 1, 1, LIMITS.modes, 'plot mode')),
      scale: plot.scale === null || plot.scale === undefined ? null : num(plot.scale, 0, 1e9, 'deformation scale'), beside: plot.beside !== false,
    },
  };
}
