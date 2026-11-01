/* SPDX-License-Identifier: Apache-2.0 */
/**
 * site3d-landscape.js — 0.7.1 71.19 (FIX-071-CIVIL-3D): what the 3D site view adds for the road and the Landscape workspace.
 * No DOM, no three.js: site3d.js calls these while it builds its scene, the view (site-view3d.js) draws the result, the
 * exporters get the plants written out as plain meshes (expandInstances).
 *
 *   landscapeInput(project, { species, zAt })   → { plants:[{x,y,z,h,s,type,form,foliage,owner}], hard:[{kind,…,owner}], unknown }
 *   roadMesh(B, corridors, L, exag, C)          the corridor's road body from its sections: lanes, shoulders, gutters, curbs,
 *                                                strips and walks in their own colours (the daylight slopes are the graded ground)
 *   hardMesh(B, hard, L, exag, C)                paving and paths (slabs with their falls), walls, kerbs, ramps (sloped, with
 *                                                their landings), steps
 *   plantInstances(plants, L, exag, C, {max})   → { sets, count, cut }  one set per shape, drawn as instances (thousands of
 *                                                plants = a few draw calls): set = { key, shape, proto, at, size, colors,
 *                                                owners, instOwner }  (at = the bottom middle of the shape's box, local;
 *                                                size = its full width, depth, height, local and exaggerated)
 *   expandInstances(scene)                       → meshes (the plants as ordinary triangles, for GLB / OBJ / USD)
 *   pickInstances(scene, o, d)                   → { t, set, i } | null   the nearest plant whose box the ray meets
 *
 * Plants are simple forms sized from the plant list (metres, the size the plan shows: mature or at planting): a tree is a trunk
 * and a round crown (a cone for a conifer, a tuft high on a tall trunk for a palm), a shrub, hedge plant, perennial or
 * groundcover a dome, a grass a tuft (cone), a climber a thin column. They stand on the graded surface (else the existing
 * ground). The ground under them is exaggerated with the view, the plants are not: they keep their true proportions.
 */

import { placed, speciesIndex, unitM } from './landscape/planting.js';
import { sizeOf, displayName } from './landscape/plants.js';
import { pavingSurface, pathStrip, rampLayout, hardElements } from './landscape/hardscape.js';
import { offsetLine } from './landscape/planting.js';
import { triangulate } from './massing.js';
import { normalizeModel } from './landscape/symbols.js';   // 0.8 LA.7 (landscape-arch_PART_4): a record's own 3D model
import { t } from './i18n.js';

export const MAX_PLANTS_3D = 100000;
/** Physical colours (the same on paper and model): road parts, plants, hardscape. */
export const LANDSCAPE_COLORS = {
  asphalt: '#55595e', shoulder: '#8b8e90', concrete: '#c4c0b6', strip: '#7f9b5c', walk: '#d0cbbf',
  foliage: '#6d9f48', evergreen: '#3f7f46', semi: '#5a8f45', grass: '#9aab58', trunk: '#6b4f35', flower: '#7b8f4a',
  paving: '#b9b1a2', path: '#c7b89a', wall: '#9c9488',   // wall: hardscape walls and pads' retaining walls (71.22)
  kerb: '#bdb8ad', ramp: '#cbc2b0', steps: '#c0b9aa',
};

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const rgbOf = (hex) => { const v = parseInt(String(hex).replace('#', ''), 16) || 0; return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255]; };

// ---------------------------------------------------------------------------- input

/**
 * The Landscape workspace's plants and hardscape for the 3D view. `species` = the plant list (a Map key → species, the
 * workspace's index; without it the project's own list); `zAt(x, y)` = the ground (graded, else existing), or null.
 */
export function landscapeInput(project, { species = null, zAt = null } = {}) {
  const s = project.state, ls = s.landscape, units = s.units;
  const out = { plants: [], hard: [], unknown: 0 };
  if (!ls) return out;
  const index = species instanceof Map ? species : speciesIndex([], ls.palette || []);
  const k = unitM(units), which = ls.show || 'mature', lang = 'en';
  const view = ls.plants3d || 'forms';   // 0.8 LA.7: simple masses, the built-in forms, or each record's own model where it has one
  if (view === 'own') for (const [id, a] of Object.entries(ls.assets || {})) if (a.kind === 'model') ownProto(id, a);
  const names = new Map();
  const ownerOf = (p) => {
    const key = p.from + ':' + p.id;
    let o = names.get(key);
    if (!o) {
      const list = p.from === 'plant' ? ls.plants : p.from === 'bed' ? ls.beds : p.from === 'area' ? ls.areas || [] : ls.hedges;   // area: 0.8 LA.5
      const rec = list.find((x) => x.id === p.id), sp = index.get(p.key);
      o = { kind: p.from === 'area' ? 'ls-pa' : 'ls-' + p.from, id: p.id, name: (p.from === 'plant' ? (sp ? displayName(sp, lang) : p.key) : rec?.name) || p.id };
      names.set(key, o);
    }
    return o;
  };
  for (const p of placed(ls, index, units, zAt)) {
    const sp = index.get(p.key);
    if (!sp) { out.unknown++; continue; }
    const z = sizeOf(sp, which);
    const own = view === 'own' && sp.own?.model && PROTOS.has('own:' + sp.own.model) ? sp.own.model : '';
    out.plants.push({ x: p.x, y: p.y, z: fin(p.z) ? p.z : null, h: z.h / k, s: z.s / k, type: sp.type, form: sp.form, foliage: sp.foliage, owner: ownerOf(p), seed: p.id + ':' + out.plants.length, ...(own ? { own } : {}), ...(view === 'simple' ? { simple: true } : {}) });
  }
  const surface = zAt ? { elevationAt: (x, y) => zAt(x, y) } : null;
  const els = new Map(hardElements(ls, surface, units).map((e) => [e.tag, e]));
  for (const h of ls.hardscape || []) {
    const owner = { kind: 'ls-hard', id: h.id, name: h.name || h.id }, th = (h.layers || []).reduce((a, l) => a + (Number(l.thickness) || 0), 0);
    if (h.kind === 'paving') out.hard.push({ kind: 'paving', owner, top: pavingSurface(h, surface).corners, th: th || 0.1 / k });
    else if (h.kind === 'path') { const st = pathStrip(h, surface); if (st.left.length >= 2) out.hard.push({ kind: 'path', owner, left: st.left, right: st.right, th: th || 0.1 / k }); }
    else if (h.kind === 'ramp') out.hard.push({ kind: 'ramp', owner, pts: h.pts, width: h.width, landing: h.landing, lay: rampLayout(h, surface, units), slab: 0.15 / k, zAt });
    else if (els.get(h.id)) out.hard.push({ kind: h.kind, owner, el: els.get(h.id) });   // walls, kerbs, steps: their IFC bodies
  }
  return out;
}

// ---------------------------------------------------------------------------- the road

/** What a section point's code makes of the stretch that ends at it (corridor.js codes; D7.35 parts). */
function partOf(code) {
  if (!code || code === 'CL') return null;
  if (/^(LANE|EOP)/.test(code)) return 'asphalt';
  if (/^SH/.test(code)) return 'shoulder';
  if (/^(FL|TOC|BOC|BC)/.test(code)) return 'concrete';
  if (/^STRIP/.test(code)) return 'strip';
  if (/^WALK/.test(code)) return 'walk';
  return null;   // DL: the daylight slope is the graded ground itself
}

/** One side of a section as [{x, y, z, part}] from the centreline out (the plain assembly: lane, shoulder). */
function sidePoints(sec, side) {
  if (sec.det?.[side]) return sec.det[side].map((q, i) => ({ x: q.x, y: q.y, z: q.z, code: i ? q.code : 'CL' }));
  const a = sec[side];
  if (!a) return [];
  return [{ ...a[0], code: 'CL' }, { ...a[1], code: 'EOP' }, { ...a[2], code: 'SH' }, { ...a[3], code: 'DL' }];
}

/** A flat-shaded triangle in local space; faces turned up unless it stands (a curb face). */
function face(B, a, b, c, col, up = true) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const l = Math.hypot(nx, ny, nz);
  if (!(l > 1e-12)) return;
  if (up && nz < 0) { nx = -nx; ny = -ny; nz = -nz; [b, c] = [c, b]; }
  const n = [nx / l, ny / l, nz / l];
  B.tri(B.vert(a, n, col), B.vert(b, n, col), B.vert(c, n, col));
}

export function roadMesh(B, corridors, L, exag, C) {
  let n = 0;
  for (const c of corridors || []) {
    const secs = c.sections || [];
    if (secs.length < 2) continue;
    B.owner({ kind: 'alignment', id: c.id, name: c.name });
    for (let i = 0; i + 1 < secs.length; i++) for (const side of ['L', 'R']) {
      const A = sidePoints(secs[i], side), Bs = sidePoints(secs[i + 1], side);
      const byCode = new Map(Bs.map((q, k) => [q.code, k]));
      for (let k = 1; k < A.length; k++) {
        const part = partOf(A[k].code), kb = byCode.get(A[k].code), kb0 = byCode.get(A[k - 1].code);
        if (!part || kb === undefined || kb0 === undefined) continue;
        const p0 = L(A[k - 1].x, A[k - 1].y, A[k - 1].z), p1 = L(A[k].x, A[k].y, A[k].z), q0 = L(Bs[kb0].x, Bs[kb0].y, Bs[kb0].z), q1 = L(Bs[kb].x, Bs[kb].y, Bs[kb].z);
        const col = rgbOf(C[part]), standing = /^(TOC|BC)/.test(A[k].code);
        face(B, p0, p1, q1, col, !standing); face(B, p0, q1, q0, col, !standing);
        n++;
      }
    }
  }
  return n;
}

// ---------------------------------------------------------------------------- hardscape

/** A solid between a top and a bottom outline of the same points (closed: a slab; open strips use ring = false). */
function solid(B, top, bot, col, closed = true) {
  const n = top.length;
  if (n < 3) return;
  const tri = triangulate(top.map((p) => ({ x: p[0], y: p[1] })));
  for (let i = 0; i < tri.length; i += 3) { face(B, top[tri[i]], top[tri[i + 1]], top[tri[i + 2]], col, true); face(B, bot[tri[i]], bot[tri[i + 2]], bot[tri[i + 1]], col, false); }
  for (let i = 0; i < (closed ? n : n - 1); i++) { const j = (i + 1) % n; face(B, top[i], bot[i], bot[j], col, false); face(B, top[i], bot[j], top[j], col, false); }
}
/** A strip between a left and a right line (same count, with z), thickness th below: top, bottom, both sides, both ends. */
function strip(B, left, right, th, L, col) {
  const n = left.length;
  const T = (q) => L(q.x, q.y, q.z), D = (q, z) => L(q.x, q.y, z ?? q.z - th);
  for (let i = 0; i + 1 < n; i++) {
    const a = T(left[i]), b = T(left[i + 1]), c = T(right[i + 1]), d = T(right[i]);
    face(B, a, b, c, col); face(B, a, c, d, col);
    const a2 = D(left[i], left[i].zb), b2 = D(left[i + 1], left[i + 1].zb), c2 = D(right[i + 1], right[i + 1].zb), d2 = D(right[i], right[i].zb);
    face(B, a2, c2, b2, col, false); face(B, a2, d2, c2, col, false);
    face(B, a, a2, b2, col, false); face(B, a, b2, b, col, false);
    face(B, d, c2, d2, col, false); face(B, d, c, c2, col, false);
  }
  for (const i of [0, n - 1]) { const a = T(left[i]), d = T(right[i]), a2 = D(left[i], left[i].zb), d2 = D(right[i], right[i].zb); face(B, a, a2, d2, col, false); face(B, a, d2, d, col, false); }
}

/** The ramp's top along its line: sloped runs with level landings between them (rampLayout's runs and landings). */
export function rampProfile(len, lay, landing) {
  const runs = Math.max(1, lay.runs || 1), lands = Math.max(0, runs - 1);
  const run = (len - lands * landing) / runs, dz = (lay.ze - lay.zs) / runs;
  if (!(run > 1e-9)) return { breaks: [], zAt: (s) => lay.zs + (len > 0 ? (s / len) * (lay.ze - lay.zs) : 0) };
  const breaks = [];
  for (let k = 1; k <= lands; k++) breaks.push(k * run + (k - 1) * landing, k * (run + landing));
  return {
    breaks,
    zAt(s) {
      const per = run + landing, k = Math.min(runs - 1, Math.floor(s / per)), u = s - k * per;
      return lay.zs + dz * k + (u >= run ? dz : (dz * Math.max(0, u)) / run);
    },
  };
}

export function hardMesh(B, hard, L, exag, C) {
  let n = 0;
  for (const h of hard || []) {
    const col = rgbOf(C[h.kind] || C.paving);
    B.owner(h.owner);
    if (h.kind === 'paving') {
      const top = h.top.filter((q) => fin(q.z));
      if (top.length < 3 || top.length !== h.top.length) continue;
      solid(B, top.map((q) => L(q.x, q.y, q.z)), top.map((q) => L(q.x, q.y, q.z - h.th)), col);
    } else if (h.kind === 'path') strip(B, h.left, h.right, h.th, L, col);
    else if (h.kind === 'ramp') {
      const P = h.pts, cum = [0];
      for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
      const len = cum[cum.length - 1];
      if (!(len > 1e-9)) continue;
      const lf = offsetLine(P, h.width / 2), rt = offsetLine(P, -h.width / 2), prof = rampProfile(len, h.lay, h.landing);
      const left = [], right = [];
      const at = (i, f) => { const s = cum[i] + f * (cum[i + 1] - cum[i]), z = prof.zAt(s); for (const [src, dst] of [[lf, left], [rt, right]]) { const x = src[i].x + f * (src[i + 1].x - src[i].x), y = src[i].y + f * (src[i + 1].y - src[i].y), g = h.zAt ? h.zAt(x, y) : null; dst.push({ x, y, z, zb: Math.min(z - h.slab, fin(g) ? g : z - h.slab) }); } };
      for (let i = 0; i + 1 < P.length; i++) {
        const fs = [0, ...prof.breaks.filter((s) => s > cum[i] + 1e-9 && s < cum[i + 1] - 1e-9).map((s) => (s - cum[i]) / (cum[i + 1] - cum[i]))];
        for (const f of fs) at(i, f);
      }
      at(P.length - 2, 1);
      strip(B, left, right, h.slab, L, col);
    } else if (h.el) {
      const e = h.el, list = e.body.kind === 'prisms' ? e.body.list : e.body.kind === 'prism' ? [e.body] : [];
      for (const pr of list) {
        const pts = pr.pts.map((q) => ({ x: q.x + e.at.x, y: q.y + e.at.y }));
        solid(B, pts.map((q) => L(q.x, q.y, e.at.z + pr.z1)), pts.map((q) => L(q.x, q.y, e.at.z + pr.z0)), col);
      }
    } else continue;
    n++;
  }
  return n;
}

// ---------------------------------------------------------------------------- retaining walls (0.7.1 71.22)

/** Retaining walls of pads and platforms (sides.js wallRuns): between the pad edge and the outer face, from the lower to the
 *  higher of the pad and the ground at each station; every run one solid, owned by its pad or platform. */
export function wallMesh(B, list, L, C) {
  let n = 0;
  const col = rgbOf(C.wall);
  for (const it of list || []) for (const w of it.walls || []) {
    const P = w.pts, m = P.length;
    if (m < 2) continue;
    B.owner(it.owner);
    const I = (p, z) => L(p.x, p.y, z), O = (p, z) => L(p.ox, p.oy, z);
    const segs = w.closed ? m : m - 1;
    for (let i = 0; i < segs; i++) {
      const a = P[i], b = P[(i + 1) % m];
      face(B, I(a, a.top), O(a, a.top), O(b, b.top), col); face(B, I(a, a.top), O(b, b.top), I(b, b.top), col);
      face(B, I(a, a.bottom), O(b, b.bottom), O(a, a.bottom), col, false); face(B, I(a, a.bottom), I(b, b.bottom), O(b, b.bottom), col, false);
      face(B, I(a, a.bottom), I(b, b.top), I(b, b.bottom), col, false); face(B, I(a, a.bottom), I(a, a.top), I(b, b.top), col, false);
      face(B, O(a, a.bottom), O(b, b.bottom), O(b, b.top), col, false); face(B, O(a, a.bottom), O(b, b.top), O(a, a.top), col, false);
    }
    if (!w.closed) for (const p of [P[0], P[m - 1]]) { face(B, I(p, p.bottom), O(p, p.bottom), O(p, p.top), col, false); face(B, I(p, p.bottom), O(p, p.top), I(p, p.top), col, false); }
    n++;
  }
  return n;
}

// ---------------------------------------------------------------------------- plants

/** Unit shapes, x and y in −0.5 … 0.5, z in 0 … 1 (scaled to a plant's width and height). */
function protoShape(shape) {
  const pos = [], nor = [], idx = [];
  const v = (x, y, z, nx, ny, nz) => { pos.push(x, y, z); const l = Math.hypot(nx, ny, nz) || 1; nor.push(nx / l, ny / l, nz / l); return pos.length / 3 - 1; };
  const S = 12;
  if (shape === 'sphere' || shape === 'dome') {
    const R = shape === 'dome' ? 4 : 8, a0 = shape === 'dome' ? 0 : -Math.PI / 2;
    for (let r = 0; r <= R; r++) {
      const a = a0 + ((Math.PI / 2 - a0) * r) / R, cz = Math.sin(a), cr = Math.cos(a);
      for (let k = 0; k < S; k++) { const b = (2 * Math.PI * k) / S; v(0.5 * cr * Math.cos(b), 0.5 * cr * Math.sin(b), shape === 'dome' ? cz : 0.5 + 0.5 * cz, cr * Math.cos(b), cr * Math.sin(b), cz); }
    }
    for (let r = 0; r < R; r++) for (let k = 0; k < S; k++) { const a = r * S + k, b = r * S + (k + 1) % S; idx.push(a, b, b + S, a, b + S, a + S); }
  } else {   // 'cone' and 'cyl': a ring at the bottom, a ring (or the tip) at the top, a bottom cap
    const top = shape === 'cyl' ? 0.5 : 0, n = shape === 'cyl' ? 8 : S;
    for (let k = 0; k < n; k++) {
      const b = (2 * Math.PI * k) / n, c = Math.cos(b), s = Math.sin(b), nz = shape === 'cyl' ? 0 : 0.5;
      v(0.5 * c, 0.5 * s, 0, c, s, nz); v(top * c, top * s, 1, c, s, nz);
    }
    for (let k = 0; k < n; k++) { const a = 2 * k, b = 2 * ((k + 1) % n); idx.push(a, b, b + 1, a, b + 1, a + 1); }
    const cb = v(0, 0, 0, 0, 0, -1), ring = [];
    for (let k = 0; k < n; k++) { const b = (2 * Math.PI * k) / n; ring.push(v(0.5 * Math.cos(b), 0.5 * Math.sin(b), 0, 0, 0, -1)); }
    for (let k = 0; k < n; k++) idx.push(cb, ring[(k + 1) % n], ring[k]);
    if (shape === 'cyl') { const ct = v(0, 0, 1, 0, 0, 1), rt = []; for (let k = 0; k < n; k++) { const b = (2 * Math.PI * k) / n; rt.push(v(0.5 * Math.cos(b), 0.5 * Math.sin(b), 1, 0, 0, 1)); } for (let k = 0; k < n; k++) idx.push(ct, rt[k], rt[(k + 1) % n]); }
  }
  return { positions: new Float32Array(pos), normals: new Float32Array(nor), indices: new Uint32Array(idx) };
}
const PROTOS = new Map();
/** 0.8 LA.7: a record's own model as a shape (normalised to the unit box once; an asset that will not read is left out). */
function ownProto(id, a) { const key = 'own:' + id, sig = a.positions.length + ':' + a.indices.length; const was = PROTOS.get(key); if (was && was.sig === sig) return; try { PROTOS.set(key, { ...normalizeModel(a.positions, a.indices), sig }); } catch { PROTOS.delete(key); } }
export const proto = (shape) => { let p = PROTOS.get(shape); if (!p) PROTOS.set(shape, (p = protoShape(shape))); return p; };

/** The parts of one plant: [shape, z0 (fraction of h), height (fraction), width (fraction of the spread), colour token]. */
export function plantParts(p) {
  if (p.own) return [['own:' + p.own, 0, 1, 1, null]];   // 0.8 LA.7
  if (p.simple) return [['sphere', 0, 1, 1, null]];
  if (p.type === 'tree') {
    if (p.form === 'palm') return [['cyl', 0, 0.8, 0.07, 'trunk'], ['sphere', 0.66, 0.34, 1, 'evergreen']];
    if (p.form === 'conifer') return [['cyl', 0, 0.18, 0.08, 'trunk'], ['cone', 0.1, 0.9, 1, 'evergreen']];
    if (p.form === 'columnar') return [['cyl', 0, 0.15, 0.12, 'trunk'], ['sphere', 0.08, 0.92, 1, null]];   // a narrow upright crown (Lombardy poplar, cypress)
    return [['cyl', 0, 0.4, 0.07, 'trunk'], ['sphere', 0.28, 0.72, p.form === 'upright' ? 0.8 : 1, null]];
  }
  if (p.type === 'grass') return [['cone', 0, 1, 1, 'grass']];
  if (p.type === 'climber') return [['cyl', 0, 1, 0.3, null]];
  if (p.type === 'perennial') return [['dome', 0, 1, 1, 'flower']];
  return [['dome', 0, 1, 1, null]];   // shrub, hedge, groundcover
}

export function plantInstances(plants, L, exag, C, { max = MAX_PLANTS_3D, groundZ = 0 } = {}) {
  const sets = new Map(), cut = plants.length > max;
  const list = cut ? plants.slice(0, max) : plants;
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return ((h >>> 0) % 1000) / 1000; };
  for (const p of list) {
    if (!(p.h > 0) || !(p.s > 0)) continue;
    const z = fin(p.z) ? p.z : groundZ, vary = 0.9 + 0.2 * hash(p.seed);   // a little variety, the same every time
    for (const [shape, z0, hf, wf, tok] of plantParts(p)) {
      const key = 'plants-' + shape + (tok === 'trunk' ? '-trunk' : '');
      let s = sets.get(key);
      if (!s) sets.set(key, (s = { key, shape, name: t('s3.plants'), at: [], size: [], colors: [], owners: [], ownerOf: new Map(), instOwner: [] }));
      // stood on the (exaggerated) ground, in its own true proportions: vertical exaggeration is for the terrain, a tree
      // stretched 2× reads as a spike (lead review, 71.19)
      const w = Math.max(p.s * wf, 0.01), base = L(p.x, p.y, z);
      base[2] += p.h * z0 * vary;
      s.at.push(...base); s.size.push(w * vary, w * vary, p.h * hf * vary);
      const c = rgbOf(C[tok || (p.foliage === 'evergreen' ? 'evergreen' : p.foliage === 'semi' ? 'semi' : 'foliage')]), k = tok === 'trunk' ? 1 : 0.88 + 0.24 * hash(p.seed + 'c');
      s.colors.push(Math.min(1, c[0] * k), Math.min(1, c[1] * k), Math.min(1, c[2] * k));
      const ok = p.owner.kind + ':' + p.owner.id;
      let oi = s.ownerOf.get(ok);
      if (oi === undefined) { oi = s.owners.push(p.owner) - 1; s.ownerOf.set(ok, oi); }
      s.instOwner.push(oi);
    }
  }
  const out = [...sets.values()].map(({ ownerOf, ...s }) => ({ ...s, proto: proto(s.shape), at: new Float32Array(s.at), size: new Float32Array(s.size), colors: new Float32Array(s.colors), instOwner: new Uint32Array(s.instOwner), count: s.instOwner.length }));
  return { sets: out, count: list.length, cut };
}

/** The plants as plain meshes (exports): every instance's shape scaled and moved, its normals through the scale. The
 *  exporters take everything back to true scale (z ÷ exag); plants are already true, so their height is put in the view's
 *  exaggerated space here and comes out true in the file. */
export function expandInstances(scene) {
  const ex = scene.exag || 1;
  return (scene.instances || []).map((s) => {
    const P = s.proto.positions, N = s.proto.normals, I = s.proto.indices, nv = P.length / 3, n = s.count;
    const pos = new Float32Array(nv * n * 3), nor = new Float32Array(nv * n * 3), col = new Float32Array(nv * n * 3), idx = new Uint32Array(I.length * n), triOwner = new Uint32Array((I.length / 3) * n);
    for (let i = 0; i < n; i++) {
      const ax = s.at[3 * i], ay = s.at[3 * i + 1], az = s.at[3 * i + 2], sx = s.size[3 * i], sy = s.size[3 * i + 1], sz = s.size[3 * i + 2] * ex;
      const q = s.rot ? [s.rot[4 * i], s.rot[4 * i + 1], s.rot[4 * i + 2], s.rot[4 * i + 3]] : null;   // 0.7.1 71.26: sleepers are turned
      for (let j = 0; j < nv; j++) {
        const o = 3 * (i * nv + j);
        if (q) {
          const v = rotQ(q, [P[3 * j] * s.size[3 * i], P[3 * j + 1] * s.size[3 * i + 1], P[3 * j + 2] * s.size[3 * i + 2]]), m = rotQ(q, [N[3 * j], N[3 * j + 1], N[3 * j + 2]]);
          pos[o] = ax + v[0]; pos[o + 1] = ay + v[1]; pos[o + 2] = az + v[2] * ex;
          nor[o] = m[0]; nor[o + 1] = m[1]; nor[o + 2] = m[2];
        } else {
          pos[o] = ax + P[3 * j] * sx; pos[o + 1] = ay + P[3 * j + 1] * sy; pos[o + 2] = az + P[3 * j + 2] * sz;
          const nx = N[3 * j] / sx, ny = N[3 * j + 1] / sy, nz = N[3 * j + 2] / sz, l = Math.hypot(nx, ny, nz) || 1;
          nor[o] = nx / l; nor[o + 1] = ny / l; nor[o + 2] = nz / l;
        }
        col[o] = s.colors[3 * i]; col[o + 1] = s.colors[3 * i + 1]; col[o + 2] = s.colors[3 * i + 2];
      }
      for (let k = 0; k < I.length; k++) idx[i * I.length + k] = I[k] + i * nv;
      triOwner.fill(s.instOwner[i], (i * I.length) / 3, ((i + 1) * I.length) / 3);
    }
    return { key: s.key, name: s.name, positions: pos, normals: nor, colors: col, indices: idx, owners: s.owners, triOwner };
  });
}

/** 0.7.1 71.26: a vector turned by the quaternion (x, y, z, w) (instances with `rot`: the sleepers, site3d-rail.js). */
function rotQ([x, y, z, w], [vx, vy, vz]) {
  const tx = 2 * (y * vz - z * vy), ty = 2 * (z * vx - x * vz), tz = 2 * (x * vy - y * vx);
  return [vx + w * tx + (y * tz - z * ty), vy + w * ty + (z * tx - x * tz), vz + w * tz + (x * ty - y * tx)];
}

/** The nearest plant whose box (its shape's extent) the ray o + t·d meets, or null. */
export function pickInstances(scene, o, d) {
  let best = null;
  for (const s of scene.instances || []) for (let i = 0; i < s.count; i++) {
    const hx = s.size[3 * i] / 2, hy = s.size[3 * i + 1] / 2, lo = [s.at[3 * i] - hx, s.at[3 * i + 1] - hy, s.at[3 * i + 2]], hi = [s.at[3 * i] + hx, s.at[3 * i + 1] + hy, s.at[3 * i + 2] + s.size[3 * i + 2]];
    let t0 = -Infinity, t1 = Infinity;
    for (let k = 0; k < 3 && t0 <= t1; k++) {
      if (Math.abs(d[k]) < 1e-12) { if (o[k] < lo[k] || o[k] > hi[k]) t0 = Infinity; continue; }
      const a = (lo[k] - o[k]) / d[k], b = (hi[k] - o[k]) / d[k];
      t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b));
    }
    if (t0 <= t1 && t1 >= 0 && (!best || Math.max(0, t0) < best.t)) best = { t: Math.max(0, t0), set: s, i };
  }
  return best;
}
