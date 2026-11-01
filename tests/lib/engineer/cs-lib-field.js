/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cs-lib-field.js — CraftScript builtins for fields (0.8 CE.2; DOM-free; script worker and Node). A field is a signed-distance
 * shape kept as plain data (field/field.js): build it from primitives, combine with booleans, offset, shell and blends, add
 * lattices and minimal surfaces, then turn it into a body (`to_body`) or voxels (`field_voxel`) or ask it a number (`sample`).
 *
 * Field value: { t:'sdf', kind, spec, scalar? } — spec is the JSON-able tree field/field.js compiles. `scalar` marks a profile
 * (ramp / radial) used for a cell size or wall thickness. Nothing here samples until a builtin that needs numbers asks.
 * Units are whatever the script uses consistently (millimetres in the first host). Same inputs always give the same bytes (rule D2).
 * The builtins keep their plan names (field_*, tpms, lattice, along, sample, to_body); the Lua and Python adapters get the same names.
 */
import { t, has, SH, F as FD } from './host.js';   // the host's CraftScript helpers are reached through SH (host.js), at call time

const mat = (...a) => SH.mat(...a), tensor = (...a) => SH.tensor(...a), voxelMeshOf = (...a) => SH.voxelMeshOf(...a), meshValue = (...a) => SH.meshValue(...a);
const asTensor = (...a) => SH.asTensor(...a), scalarOf = (...a) => SH.scalarOf(...a), optsOf = (...a) => SH.optsOf(...a), typeName = (...a) => SH.typeName(...a);
const err = (msg) => new SH.CsError(msg);
/** A field-library error → words in the user's language (by its code), else the library's own text. */
const libErr = (e) => (e && e.code && has('script.field.e.' + e.code) ? err(t('script.field.e.' + e.code, e.vars || {})) : err(String(e && e.message || e).replace(/^(field|process|mfg): /, '')));
const wrap = (fn) => (a, ctx) => { try { return fn(a, ctx); } catch (e) { throw e instanceof SH.CsError ? e : libErr(e); } };
const struct = (o) => ({ t: 'struct', fields: o });
const N = (v, what) => scalarOf(v, what);
const vec3 = (v, what) => { const d = asTensor(v, what).data; if (d.length !== 3) throw err(t('script.field.need3', { what: what ?? t('script.field.what.field') })); return [d[0], d[1], d[2]]; };
const sdf = (spec, extra = {}) => ({ t: 'sdf', kind: spec.t, spec, ...extra });
const isSdf = (v) => !!v && typeof v === 'object' && v.t === 'sdf';
export function fieldArg(v, what) {
  if (isSdf(v) && !v.scalar) return v.spec;
  throw err(t('script.field.not_field', { what: what ?? t('script.field.what.field'), got: typeName(v) }));
}
const sizeArg = (v, what) => {                           // a number or a profile
  if (isSdf(v) && v.scalar) return v.spec;
  const x = N(v, what);
  if (!(x > 0)) throw err(t('script.field.positive', { what }));
  return x;
};
const posArg = (v, what) => { const x = N(v, what); if (!(x > 0)) throw err(t('script.field.positive', { what })); return x; };
const list = (a, from, what) => { const out = []; for (let i = from; i < a.length; i++) { if (isSdf(a[i]) && !a[i].scalar) out.push(a[i].spec); else if (a[i] && a[i].t === 'cell') for (const x of a[i].items) out.push(fieldArg(x, what)); else throw err(t('script.field.not_field', { what, got: typeName(a[i]) })); } return out; };

/** Bake in slices so Stop works: bricks are computed `SLICE` at a time with a check between. */
const SLICE = 256;
function bakeChecked(spec, o, check) {
  let p;
  try { p = FD.plan(spec, o); } catch (e) { throw libErr(e); }
  if (p.keys.length > 6e6) throw err(t('script.field.too_big', { n: p.keys.length }));
  const arrays = [];
  for (let i = 0; i < p.keys.length; i += SLICE) { check(); for (const a of FD.bakeKeys(spec, p.h, p.band, p.keys.slice(i, i + SLICE))) arrays.push(a); }
  return FD.assemble(p, arrays);
}
const bakeOpts = (h, opts) => {
  const o = { h: posArg(h, 'h'), band: opts.band ?? 3 };
  if (opts.bbox !== undefined) { const d = asTensor(opts.bbox, 'bbox').data; if (d.length !== 6) throw err(t('script.field.bbox6')); o.bbox = Array.from(d); }
  return o;
};
const checker = (ctx) => (ctx && typeof ctx.check === 'function' ? () => ctx.check() : () => {});

function bodyFromGrid(g) {
  const m = FD.contour(g), top = FD.meshTopology(m);
  const nodes = Float64Array.from(m.positions), elems = Int32Array.from(m.indices);
  const info = struct({ volume: FD.meshVolume(m), area: FD.meshArea(m), triangles: m.indices.length / 3, vertices: m.positions.length / 3, watertight: top.closed && top.vertexManifold, components: top.components, bricks: g.bricks.size, h: g.h, hash: FD.fingerprint(m.positions, m.indices) });
  return [meshValue('tri', nodes, elems), info];
}

const BUILTINS = {
  field_sphere: [(a) => sdf(FD.sphere(vec3(a[0], 'c'), posArg(a[1], 'r'))), 'f = field_sphere(c, r)'],
  field_box: [(a) => sdf(FD.box(vec3(a[0], 'c'), vec3(a[1], 'half').map((x) => { if (!(x > 0)) throw err(t('script.field.positive', { what: 'half' })); return x; }), a[2] === undefined ? 0 : N(a[2], 'round'))), 'f = field_box(c, half, round)'],
  field_capsule: [(a) => sdf(FD.capsule(vec3(a[0], 'a'), vec3(a[1], 'b'), posArg(a[2], 'r0'), a[3] === undefined ? posArg(a[2], 'r0') : posArg(a[3], 'r1'))), 'f = field_capsule(a, b, r0, r1)'],
  field_cylinder: [(a) => sdf(FD.cylinder(vec3(a[0], 'a'), vec3(a[1], 'b'), posArg(a[2], 'r'))), 'f = field_cylinder(a, b, r)'],
  field_torus: [(a) => sdf(FD.torus(vec3(a[0], 'c'), posArg(a[1], 'R'), posArg(a[2], 'r'))), 'f = field_torus(c, R, r)'],
  field_plane: [(a) => sdf(FD.halfspace(vec3(a[0], 'n'), N(a[1], 'd'))), 'f = field_plane(n, d)'],
  field_union: [(a) => { const l = list(a, 0, 'union'); if (!l.length) throw err(t('script.field.none')); return sdf(FD.union(...l)); }, 'f = field_union(a, b, …)'],
  field_intersect: [(a) => { const l = list(a, 0, 'intersect'); if (!l.length) throw err(t('script.field.none')); return sdf(FD.intersect(...l)); }, 'f = field_intersect(a, b, …)'],
  field_subtract: [(a) => sdf(FD.subtract(fieldArg(a[0], 'a'), ...list(a, 1, 'subtract'))), 'f = field_subtract(a, b, …)'],
  field_blend: [(a) => { const op = a[3] === undefined ? 'union' : String(a[3]); if (!['union', 'intersect', 'subtract'].includes(op)) throw err(t('script.field.blend_op')); const k = N(a[2], 'k'); if (!(k >= 0)) throw err(t('script.field.positive', { what: 'k' })); return sdf({ t: 'smooth', op, a: fieldArg(a[0], 'a'), b: fieldArg(a[1], 'b'), k }); }, 'f = field_blend(a, b, k, op)'],
  field_offset: [(a) => sdf(FD.offset(fieldArg(a[0]), N(a[1], 'd'))), 'f = field_offset(f, d)'],
  field_shell: [(a) => { const side = a[2] === undefined ? 'in' : String(a[2]); if (!['in', 'out', 'mid'].includes(side)) throw err(t('script.field.shell_side')); return sdf(FD.shell(fieldArg(a[0]), posArg(a[1], 'thickness'), side)); }, 'f = field_shell(f, thickness, side)'],
  field_invert: [(a) => sdf(FD.invert(fieldArg(a[0]))), 'f = field_invert(f)'],
  field_move: [(a) => sdf(FD.translate(fieldArg(a[0]), vec3(a[1], 'v'))), 'f = field_move(f, v)'],
  field_rotate: [(a) => sdf(FD.rotate(fieldArg(a[0]), vec3(a[1], 'axis'), N(a[2], 'angle'), a[3] === undefined ? [0, 0, 0] : vec3(a[3], 'about'))), 'f = field_rotate(f, axis, angle, about)'],
  field_scale: [(a) => sdf(FD.scale(fieldArg(a[0]), posArg(a[1], 's'), a[2] === undefined ? [0, 0, 0] : vec3(a[2], 'about'))), 'f = field_scale(f, s, about)'],
  field_ramp: [(a) => { const ax = N(a[0], 'axis'); if (![1, 2, 3].includes(ax)) throw err(t('script.field.axis')); return { t: 'sdf', kind: 'ramp', scalar: true, spec: FD.ramp(ax - 1, N(a[1], 'a'), N(a[2], 'b'), N(a[3], 'v0'), N(a[4], 'v1')) }; }, 'p = field_ramp(axis, a, b, v0, v1)'],
  field_radial: [(a) => ({ t: 'sdf', kind: 'radialramp', scalar: true, spec: FD.radial(vec3(a[0], 'c'), N(a[1], 'r0'), N(a[2], 'r1'), N(a[3], 'v0'), N(a[4], 'v1')) }), 'p = field_radial(c, r0, r1, v0, v1)'],
  tpms: [(a) => {
    const kind = String(a[0]), o = optsOf(a[3]);
    if (!['gyroid', 'schwarzp', 'diamond'].includes(kind)) throw err(t('script.field.tpms_kind'));
    const mode = o.mode === undefined ? 'sheet' : String(o.mode);
    if (!['sheet', 'network'].includes(mode)) throw err(t('script.field.tpms_mode'));
    let bounds = null;
    if (o.bounds !== undefined) { const d = asTensor(o.bounds, 'bounds').data; if (d.length !== 6) throw err(t('script.field.bbox6')); bounds = Array.from(d); }
    return sdf(FD.tpms(kind, sizeArg(a[1], 'cell'), sizeArg(a[2], 'wall'), { mode, iso: o.iso ?? 0, bounds }));
  }, 'f = tpms(kind, cell, wall, opts)'],
  field_density: [wrap((a) => {
    const D = asTensor(a[0], 'density'), shape = D.shape.length === 3 ? D.shape : [D.shape[0], D.shape[1], 1];
    const [ny, nx, nz] = shape;                                            // rows are y from the top (image order), columns x, pages z
    const box = Array.from(asTensor(a[1], 'box').data);
    if (box.length !== 6) throw err(t('script.field.bbox6'));
    const v0 = N(a[2], 'v0'), v1 = N(a[3], 'v1'), data = new Float32Array(nx * ny * nz);
    for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const dv = D.data[j + ny * (i + nx * k)];                              // column-major tensor: (row j, column i, page k)
      data[i + nx * ((ny - 1 - j) + ny * k)] = dv < 0 ? 0 : dv > 1 ? 1 : dv;   // row 1 is the top: y runs up, so flip
    }
    return { t: 'sdf', kind: 'dens', scalar: true, spec: FD.density(data, [nx, ny, nz], box, v0, v1) };
  }), 'p = field_density(D, box, v0, v1)'],
  lattice: [(a) => {
    const B = asTensor(a[0], 'beams'), [rows, cols] = B.shape;
    if (cols !== 6 && cols !== 8) throw err(t('script.field.beams_cols'));
    const r = a[1] === undefined ? null : asTensor(a[1], 'r');
    const list = [];
    for (let i = 0; i < rows; i++) {
      const row = []; for (let c = 0; c < cols; c++) row.push(B.data[i + c * rows]);
      let r0, r1;
      if (cols === 8) { r0 = row[6]; r1 = row[7]; } else if (r && r.data.length === rows) { r0 = r1 = r.data[i]; } else if (r && r.data.length === 1) { r0 = r1 = r.data[0]; } else throw err(t('script.field.beam_r'));
      if (!(r0 > 0 && r1 > 0)) throw err(t('script.field.positive', { what: 'r' }));
      list.push([row[0], row[1], row[2], row[3], row[4], row[5], r0, r1]);
    }
    return sdf(FD.beams(list));
  }, 'f = lattice(beams, r)'],
  lattice_beams: [(a) => {
    let b;
    try { b = FD.latticeBeams(String(a[0]), Array.from(asTensor(a[1], 'box').data), posArg(a[2], 'cell'), 1); } catch (e) { throw libErr(e); }
    const n = b.length / 8, d = new Float64Array(n * 6);
    for (let i = 0; i < n; i++) for (let c = 0; c < 6; c++) d[i + c * n] = b[i * 8 + c];
    return mat(n, 6, d);
  }, 'B = lattice_beams(kind, box, cell)'],
  field_revolve: [wrap((a) => {
    const P = asTensor(a[0], 'profile'), [n, k] = P.shape;
    if (k !== 2 || n < 2) throw err(t('script.field.profile_shape'));
    const pts = []; for (let i = 0; i < n; i++) pts.push([P.data[i], P.data[i + n]]);
    return sdf(FD.revolve(pts));
  }), 'f = field_revolve(profile)'],
  along: [(a) => {
    const P = asTensor(a[0], 'path'), [n, c] = P.shape;
    if (c !== 3 || n < 2) throw err(t('script.field.path_shape'));
    const pts = []; for (let i = 0; i < n; i++) pts.push([P.data[i], P.data[i + n], P.data[i + 2 * n]]);
    const R = asTensor(a[1], 'profile').data;
    if (R.length !== 1 && R.length !== n) throw err(t('script.field.profile_len', { n }));
    for (const x of R) if (!(x > 0)) throw err(t('script.field.positive', { what: 'radius' }));
    return sdf(FD.beams(FD.pathBeams(pts, R.length === 1 ? R[0] : R)));
  }, 'f = along(path, radius)'],
  sample: [(a) => {
    const f = FD.compile(fieldArg(a[0])).f, P = asTensor(a[1], 'points'), [n, c] = P.shape;
    if (c !== 3) throw err(t('script.field.points_shape'));
    const d = new Float64Array(n);
    for (let i = 0; i < n; i++) d[i] = f(P.data[i], P.data[i + n], P.data[i + 2 * n]);
    return mat(n, 1, d);
  }, 'd = sample(f, points)'],
  field_from_mesh: [(a, ctx) => {
    const m = a[0];
    if (!m || m.t !== 'mesh' || m.kind !== 'tri') throw err(t('script.field.need_tri'));
    check0(ctx);
    const g = FD.fromMesh({ positions: m.nodes, indices: m.elems }, { h: posArg(a[1], 'h'), band: 3 });
    if (!g.bricks.size) throw err(t('script.field.empty'));
    return sdf({ t: 'grid', pack: FD.packGrid(g) });
  }, 'f = field_from_mesh(mesh, h)'],
  field_bake: [(a, ctx) => { const o = optsOf(a[2]), g = bakeChecked(fieldArg(a[0]), bakeOpts(a[1], o), checker(ctx)); if (!g.bricks.size) throw err(t('script.field.empty')); return sdf({ t: 'grid', pack: FD.packGrid(g) }); }, 'f = field_bake(f, h, opts)'],
  field_volume: [(a, ctx) => { const o = optsOf(a[2]), g = bakeChecked(fieldArg(a[0]), bakeOpts(a[1], o), checker(ctx)); return FD.meshVolume(FD.contour(g)); }, 'V = field_volume(f, h, opts)'],
  to_body: [(a, ctx) => { const o = optsOf(a[2]), g = bakeChecked(fieldArg(a[0]), bakeOpts(a[1], o), checker(ctx)); if (!g.bricks.size) throw err(t('script.field.empty')); const r = bodyFromGrid(g); return ctx && ctx.nargout > 1 ? r : r[0]; }, '[mesh, info] = to_body(f, h, opts)'],
  field_kind: [wrap((a, ctx) => {
    const f = FD.compile(fieldArg(a[0])).f, hh = posArg(a[1], 'h'), b = Array.from(asTensor(a[2], 'box').data);
    if (b.length !== 6) throw err(t('script.field.bbox6'));
    const n = [0, 1, 2].map((i) => Math.round((b[i + 3] - b[i]) / hh));
    if (n.some((x) => x < 1) || n[0] * n[1] * n[2] > 2.5e7) throw err(t('script.field.too_big', { n: n[0] * n[1] * n[2] }));
    const d = new Float64Array(n[0] * n[1] * n[2]), check = checker(ctx);
    for (let k = 0; k < n[2]; k++) { check(); for (let j = 0; j < n[1]; j++) for (let i = 0; i < n[0]; i++) d[i + n[0] * (j + n[1] * k)] = f(b[0] + (i + 0.5) * hh, b[1] + (j + 0.5) * hh, b[2] + (k + 0.5) * hh) < 0 ? -1 : 0; }
    return tensor(n, d);
  }), 'kind = field_kind(f, h, box)'],
  field_voxel: [(a, ctx) => { const o = optsOf(a[2]), g = bakeChecked(fieldArg(a[0]), bakeOpts(a[1], o), checker(ctx)), v = FD.toVoxelGrid(g); if (!v.count) throw err(t('script.field.empty')); return voxelMeshOf(v); }, 'v = field_voxel(f, h, opts)'],
  process_profile: [wrap((a) => {
    const p = a[0] && a[0].t === 'struct' ? FD.customProfile(optsOf(a[0]), a[1] === undefined ? 'fdm' : String(a[1])) : FD.profileOf(String(a[0]));
    const q = (value, unit) => struct({ value, unit, ref: p.ref });
    return struct({ name: p.name, label: p.label, min_wall: q(p.minWall, 'mm'), min_gap: q(p.minGap, 'mm'), min_hole: q(p.minHole, 'mm'), overhang: q(p.overhang === null ? -1 : p.overhang, 'deg'), drain: q(p.drain, 'mm'), needs_drain: p.needsDrain, layer: q(p.layer, 'mm'), ref: p.ref });
  }), 'p = process_profile(name)'],
  mfg_check: [(a, ctx) => {
    const spec = fieldArg(a[0]), o = optsOf(a[2]), check = checker(ctx);
    let prof;
    try { prof = a[1] && a[1].t === 'struct' ? FD.customProfile(optsOf(a[1]), o.base === undefined ? 'fdm' : String(o.base)) : FD.profileOf(String(a[1])); } catch (e) { throw libErr(e); }
    const g = bakeChecked(spec, bakeOpts(a[3] === undefined ? o.h : a[3], o), check);
    if (!g.bricks.size) throw err(t('script.field.empty'));
    check();
    let r;
    try { r = FD.mfgAnalyze(FD.toVoxelGrid(g), prof); } catch (e) { throw libErr(e); }
    check();
    const mesh = FD.contour(g), problems = r.problems.slice();
    if (prof.overhang !== null) {
      const oh = FD.mfgOverhang({ positions: mesh.positions, indices: mesh.indices }, prof.overhang);
      if (oh.area > g.h * g.h * 4) problems.push({ code: 'mfg.overhang', severity: 'warning', req: { op: '<=', value: prof.overhang, unit: 'deg' }, found: { value: +oh.area.toFixed(2), unit: 'mm2' }, vars: { area: +oh.area.toFixed(1), share: +(100 * oh.share).toFixed(1), angle: prof.overhang, process: prof.short || prof.name }, at: oh.at.map((p) => p.map((x) => +x.toFixed(3))) });
    }
    const row = (p) => struct({ code: p.code, severity: p.severity, ...(p.req ? { req_op: p.req.op, req_value: Array.isArray(p.req.value) ? p.req.value[0] : p.req.value, req_unit: p.req.unit } : {}), ...(p.found ? { found_value: p.found.value, found_unit: p.found.unit } : {}),
      vars: struct(Object.fromEntries(Object.entries(p.vars || {}).map(([k, v]) => [k, v]))), at: mat(p.at.length, 3, (() => { const d = new Float64Array(p.at.length * 3); p.at.forEach((q, i) => { d[i] = q[0]; d[i + p.at.length] = q[1]; d[i + 2 * p.at.length] = q[2]; }); return d; })()) });
    const list = { t: 'cell', shape: [1, problems.length], items: problems.map(row) };
    return struct({ ok: !problems.some((p) => p.severity !== 'note'), count: problems.length, problems: list, process: prof.name, h: g.h });
  }, 'r = mfg_check(f, process, opts, h)'],
  field_info: [(a) => {
    const n = FD.compile(fieldArg(a[0])), b = n.bounds, fin = b.every(Number.isFinite);
    return struct({ kind: a[0].kind, bounded: fin, bounds: fin ? mat(1, 6, Float64Array.from(b)) : mat(0, 0) });
  }, 's = field_info(f)'],
};
function check0(ctx) { if (ctx && typeof ctx.check === 'function') ctx.check(); }

export const skipped = [];
let registered = false;
export function register(registerBuiltin = SH.registerBuiltin) {
  if (typeof registerBuiltin !== 'function') return skipped;     // no host yet: the host's shim registers once it has called setHost
  const own = registerBuiltin === SH.registerBuiltin;
  if (own && registered) return skipped;
  for (const [name, [fn, args]] of Object.entries(BUILTINS)) {
    try { registerBuiltin(name, fn, { args, module: 'field' }); } catch { if (own) skipped.push(name); }   // doc: script.doc.<name> in the language file (cs-runtime.js docKey)
  }
  if (own) registered = true;
  return skipped;
}
register();
export { BUILTINS };
