/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: what a person reads goes through msg() (messages.js); the rest is file-format text (class names). */
/**
 * objects.js — the records inside a .3dm file's tables: geometry objects, their attributes, layers, materials and block
 * definitions. Every record is an "openNURBS class": a chunk holding the class's UUID, then a data chunk the class reads.
 * Layouts from openNURBS's Read() functions (opennurbs_mesh.cpp, _nurbscurve, _linecurve, _polylinecurve, _arccurve,
 * _polycurve, _nurbssurface, _planesurface, _revsurface, _sumsurface, _brep_io, _beam (extrusions), _instance, _layer,
 * _material, _3dm_attributes, _model_component; read as a reference, see NOTICE), written here in our own words and code.
 *
 *   readObject(r, ctx) → a plain record { cls, ... } (see KINDS below) or null for a nil object; a class this reader does not
 *                        know comes back as { cls: 'unknown', uuid } (the caller counts it, nothing is guessed)
 *   readAttributes(r, ctx) → { id, layer, name, material, color, colorSource, materialSource, visible, mode }
 *   ctx = { ar (the Archive: version, onVersion), depth, limits }
 *
 * Geometry records keep the file's numbers as they are (file units, openNURBS knot vectors without the two end knots,
 * rational control points in homogeneous form x·w, y·w, z·w, w); geom.js evaluates them.
 */
import { TC } from './archive.js';
import { damaged, tooBig } from './util.js';

/** Class UUIDs (ON_OBJECT_IMPLEMENT in the toolkit) → our record names. */
export const CLASSES = {
  '4ED7D4E4-E947-11D3-BFE5-0010830122F0': 'mesh',
  '4ED7D4DD-E947-11D3-BFE5-0010830122F0': 'nurbsCurve',
  '4ED7D4DB-E947-11D3-BFE5-0010830122F0': 'lineCurve',
  '4ED7D4E6-E947-11D3-BFE5-0010830122F0': 'polylineCurve',
  'CF33BE2A-09B4-11D4-BFFB-0010830122F0': 'arcCurve',
  '4ED7D4E0-E947-11D3-BFE5-0010830122F0': 'polyCurve',
  '4ED7D4D9-E947-11D3-BFE5-0010830122F0': 'curveProxy',
  '4ED7D4D8-E947-11D3-BFE5-0010830122F0': 'curveOnSurface',
  '4ED7D4DE-E947-11D3-BFE5-0010830122F0': 'nurbsSurface',
  '4ED7D4DF-E947-11D3-BFE5-0010830122F0': 'planeSurface',
  'DBC5A584-CE3F-4170-98A8-497069CA5C36': 'clippingPlane',
  'A16220D3-163B-11D4-8000-0010830122F0': 'revSurface',
  'C4CD5359-446D-4690-9FF5-29059732472B': 'sumSurface',
  '4ED7D4E2-E947-11D3-BFE5-0010830122F0': 'surfaceProxy',
  '00C61749-D430-4ECC-83A8-29130A20CF9C': 'offsetSurface',
  '60B5DBC5-E660-11D3-BFE4-0010830122F0': 'brep',
  '36F53175-72B8-4D47-BF1F-B4E6FC24F4B9': 'extrusion',
  'F9CFB638-B9D4-4340-87E3-C56E7865D96A': 'instanceRef',
  '26F8BFF6-2618-417F-A158-153D64A94989': 'instanceDefinition',
  '95809813-E985-11D3-BFE5-0010830122F0': 'layer',
  '60B5DBBC-E660-11D3-BFE4-0010830122F0': 'material',
  'C3101A1D-F157-11D3-BFE7-0010830122F0': 'point',
  '2488F347-F8FA-11D3-BFEC-0010830122F0': 'pointCloud',
  'F09BA4D9-455B-42C3-BA3B-E6CCACEF853B': 'subd',
  '74198302-CDF4-4F95-9609-6D684F22AB37': 'textDot',
  '0559733B-5332-49D1-A936-0532AC76ADE5': 'hatch',
  '57376349-62A9-4A16-B411-A46BCD544790': 'text',
  '945BF594-6FF9-4F5C-BFC0-B3AF528F29D2': 'leader',
  'E550882B-F44D-4154-A1EF-6E50CBBBF543': 'dimension',
  'D417786B-F6CD-4F12-9E1F-063F414DBEB6': 'dimension',
  'FC749C2F-4C00-41FD-9840-26D94F047AD3': 'dimension',
  '03124828-4C9B-4D28-9A82-664DDDE7A14F': 'dimension',
  'D46767BA-7E8F-4D9D-9A92-66050219A5B9': 'dimension',
  '85A08513-F383-11D3-BFE7-0010830122F0': 'light',
  'C8C66EFA-B3CB-4E00-9440-2AD66203379E': 'detail',
  '4ED7D4E5-E947-11D3-BFE5-0010830122F0': 'pointGrid',
  'D379E6D8-7C31-4407-A913-E3B7040D034A': 'morphControl',
};
const NIL = '00000000-0000-0000-0000-000000000000';
const RENDER_MESH = 'F5E3BAA9-A7A2-49FD-B8A1-66EB274A5F91';

/** One openNURBS class from `r` (the reader stands at its TCODE_OPENNURBS_CLASS chunk). */
export function readObject(r, ctx) {
  const c = r.expect(TC.CLASS);
  const body = r.sub(c);
  const u = body.expect(TC.CLASS_UUID);
  const ur = body.sub(u);
  const uuid = ur.uuid();
  if (uuid === NIL) return null;
  const cls = CLASSES[uuid];
  if (!cls) return { cls: 'unknown', uuid };
  const dc = body.expect(TC.CLASS_DATA);
  const d = body.sub(dc);
  if ((ctx.depth || 0) > ctx.limits.depth) throw tooBig('ccdm.too_big.count', { n: ctx.depth });
  const reader = READERS[cls];
  if (!reader) return { cls };
  const inner = { ...ctx, depth: (ctx.depth || 0) + 1 };
  const out = reader(d, inner);
  // version 5 files keep an extrusion's render mesh as user data after the class data
  if (out && out.cls === 'extrusion' && !out.mesh) { try { out.mesh = v5ExtrusionMesh(body, inner); } catch { /* the mesh is an extra */ } }
  return out;
}

const V5_EXTRUSION_MESH = 'A8130A3E-E4F3-4CB0-BB8A-F10A473912D0';
/** The user data chunks after a class's data: { class uuid → body reader } for the one we use. */
function v5ExtrusionMesh(body, ctx) {
  while (!body.atEnd()) {
    const c = body.chunk();
    if (c.tc === TC.CLASS_END) break;
    if (c.short) continue;
    const u = body.sub(c);
    if (c.tc !== TC.CLASS_USERDATA) continue;
    const [major] = u.versioned();
    let cls;
    if (major === 2) { const h = u.sub(u.expect(TC.CLASS_USERDATA_HEADER)); cls = h.uuid(); }
    else if (major === 1) { cls = u.uuid(); u.uuid(); u.i32(); u.xform(); }
    else continue;
    if (cls !== V5_EXTRUSION_MESH) continue;
    const a = u.sub(u.expect(TC.ANONYMOUS));
    const m = readObject(a, ctx);
    return m && m.cls === 'mesh' && !m.unread ? m : null;
  }
  return null;
}

const curveOf = (o) => (o && CURVES.has(o.cls) ? o : null);
const CURVES = new Set(['nurbsCurve', 'lineCurve', 'polylineCurve', 'arcCurve', 'polyCurve', 'curveProxy', 'curveOnSurface']);
export const SURFACES = new Set(['nurbsSurface', 'planeSurface', 'clippingPlane', 'revSurface', 'sumSurface', 'surfaceProxy', 'offsetSurface', 'extrusion']);

// --------------------------------------------------------------------------------------------------------- curves

function nurbsCurve(d) {
  const [major] = d.versioned();
  if (major !== 1) return { cls: 'nurbsCurve', unread: true };
  const dim = d.i32(), rat = d.i32() !== 0, order = d.i32(), n = d.i32();
  d.i32(); d.i32();
  d.f64s(6);
  if (!(dim >= 1 && dim <= 3) || !(order >= 2 && order <= 32) || !(n >= order)) throw damaged('ccdm.damaged.layout', { tc: 'nurbs curve' });
  const kc = d.i32();
  if (kc !== order + n - 2) throw damaged('ccdm.damaged.count');
  const knots = d.f64s(d.count(kc, 8));
  const cvn = d.i32();
  const cvs = cvn > 0 ? d.f64s(d.count(n * (dim + (rat ? 1 : 0)), 8)) : new Float64Array(n * (dim + (rat ? 1 : 0)));
  return { cls: 'nurbsCurve', dim, rat, order, n, knots, cvs };
}

function lineCurve(d) {
  d.versioned();
  const a = d.point(), b = d.point(), t = d.interval(), dim = d.i32();
  return { cls: 'lineCurve', a, b, t, dim };
}

function polylineCurve(d) {
  d.versioned();
  const n = d.i32();
  const pts = [];
  if (n > 0) { d.count(n, 24); for (let i = 0; i < n; i++) pts.push(d.point()); }
  const t = d.doubleArray();
  const dim = d.i32();
  return { cls: 'polylineCurve', pts, t: Array.from(t), dim };
}

function circle(d) {
  const plane = d.plane(), radius = d.f64();
  d.f64s(9);
  return { plane, radius };
}

function arcCurve(d) {
  const [major] = d.versioned();
  if (major !== 1) return { cls: 'arcCurve', unread: true };
  const c = circle(d), angle = d.interval(), t = d.interval(), dim = d.i32();
  return { cls: 'arcCurve', ...c, angle, t, dim };
}

function polyCurve(d, ctx) {
  d.versioned();
  const n = d.i32();
  d.i32(); d.i32();
  d.f64s(6);
  const t = Array.from(d.doubleArray());
  if (n < 0 || n > ctx.limits.items) throw damaged('ccdm.damaged.count');
  const segs = [];
  for (let i = 0; i < n; i++) {
    const o = curveOf(readObject(d, ctx));
    if (!o) throw damaged('ccdm.damaged.layout', { tc: 'poly curve' });
    segs.push(o);
  }
  if (t.length !== n + 1) throw damaged('ccdm.damaged.count');
  return { cls: 'polyCurve', segs, t };
}

// ------------------------------------------------------------------------------------------------------- surfaces

function nurbsSurface(d) {
  const [major] = d.versioned();
  if (major !== 1) return { cls: 'nurbsSurface', unread: true };
  const dim = d.i32(), rat = d.i32() !== 0;
  const order = [d.i32(), d.i32()], n = [d.i32(), d.i32()];
  d.i32(); d.i32();
  d.f64s(6);
  if (!(dim >= 1 && dim <= 3) || !(order[0] >= 2 && order[1] >= 2 && order[0] <= 32 && order[1] <= 32) || !(n[0] >= order[0] && n[1] >= order[1])) throw damaged('ccdm.damaged.layout', { tc: 'nurbs surface' });
  const k0 = d.i32();
  if (k0 !== order[0] + n[0] - 2) throw damaged('ccdm.damaged.count');
  const knots0 = d.f64s(d.count(k0, 8));
  const k1 = d.i32();
  if (k1 !== order[1] + n[1] - 2) throw damaged('ccdm.damaged.count');
  const knots1 = d.f64s(d.count(k1, 8));
  const cvn = d.i32();
  if (cvn !== n[0] * n[1]) throw damaged('ccdm.damaged.count');
  const size = dim + (rat ? 1 : 0);
  const cvs = d.f64s(d.count(cvn * size, 8));
  return { cls: 'nurbsSurface', dim, rat, order, n, knots: [knots0, knots1], cvs };
}

function planeSurface(d) {
  const [, minor] = d.versioned();
  const plane = d.plane();
  const domain = [d.interval(), d.interval()];
  const extents = minor >= 1 ? [d.interval(), d.interval()] : [domain[0].slice(), domain[1].slice()];
  return { cls: 'planeSurface', plane, domain, extents };
}

function revSurface(d, ctx) {
  const [major] = d.versioned();
  if (major !== 1 && major !== 2) return { cls: 'revSurface', unread: true };
  const axis = [d.point(), d.point()];
  const angle = d.interval();
  const t = major === 2 ? d.interval() : angle.slice();
  d.f64s(6);
  const transposed = d.i32() !== 0;
  const has = d.u8();
  const curve = has ? curveOf(readObject(d, ctx)) : null;
  return { cls: 'revSurface', axis, angle, t, transposed, curve };
}

function sumSurface(d, ctx) {
  const [major] = d.versioned();
  if (major !== 1) return { cls: 'sumSurface', unread: true };
  const base = d.point();
  d.f64s(6);
  const c0 = curveOf(readObject(d, ctx)), c1 = curveOf(readObject(d, ctx));
  return { cls: 'sumSurface', base, curves: [c0, c1] };
}

// ---------------------------------------------------------------------------------------------------------- meshes

const f32view = (bytes, n) => {
  if (!bytes) return null;
  const a = new Float32Array(n);
  new Uint8Array(a.buffer).set(bytes.subarray(0, n * 4));   // little-endian files on little-endian machines (every browser)
  return a;
};
const f64view = (bytes, n) => {
  if (!bytes) return null;
  const a = new Float64Array(n);
  new Uint8Array(a.buffer).set(bytes.subarray(0, n * 8));
  return a;
};
const arrF32 = (d, per) => { const n = d.i32(); if (n <= 0) return null; d.count(n, 4 * per); const a = new Float32Array(n * per); for (let i = 0; i < a.length; i++) a[i] = d.f32(); return a; };

function mesh(d, ctx) {
  const [major, minor] = d.versioned();
  if (major !== 1 && major !== 3) return { cls: 'mesh', unread: true };
  const nv = d.i32(), nf = d.i32();
  if (nv < 0 || nf < 0 || nv > ctx.limits.items || nf > ctx.limits.items) throw damaged('ccdm.damaged.count');
  d.f64s(10);
  for (let i = 0; i < 16; i++) d.f32();
  const closed = d.i32();
  if (d.u8()) d.skipChunk();               // meshing parameters
  for (let i = 0; i < 4; i++) if (d.u8()) d.skipChunk();   // curvature statistics
  // faces: four corners each (a triangle repeats its third), stored as 1, 2 or 4 byte numbers
  const size = d.i32();
  if (size !== 1 && size !== 2 && size !== 4 && nf) throw damaged('ccdm.damaged.layout', { tc: 'mesh faces' });
  d.count(nf, 4 * size);
  const F = new Int32Array(nf * 4);
  for (let i = 0; i < nf * 4; i++) F[i] = size === 1 ? d.u8() : size === 2 ? d.u16() : d.i32();
  let V = null, N = null, T = null, C = null;
  if (major === 1) {
    V = arrF32(d, 3); N = arrF32(d, 3); T = arrF32(d, 2);
    const nk = d.i32(); if (nk > 0) d.f64s(d.count(nk * 2, 8));
    const nc = d.i32(); if (nc > 0) { d.count(nc, 4); C = d.b.slice(d.pos, d.pos + nc * 4); d.pos += nc * 4; }
  } else if (nv > 0) {
    V = f32view(d.compressed(nv * 12), nv * 3);
    N = f32view(d.compressed(nv * 12), nv * 3);
    T = f32view(d.compressed(nv * 8), nv * 2);
    d.compressed(nv * 16);
    C = d.compressed(nv * 4);
  }
  if (!V || V.length !== nv * 3) { if (nv) throw damaged('ccdm.damaged.layout', { tc: 'mesh points' }); V = new Float32Array(0); }
  if (N && N.length !== nv * 3) N = null;
  if (T && T.length !== nv * 2) T = null;
  if (C && C.length !== nv * 4) C = null;
  for (let i = 0; i < F.length; i++) if (F[i] < 0 || F[i] >= nv) throw damaged('ccdm.damaged.index', { what: 'mesh corner' });
  // the tail: double-precision points (version 3.7 and later) when the file has them; anything odd here leaves the floats
  let dV = null;
  try {
    if (minor >= 2) d.i32();
    if (major === 3 && minor >= 3) {
      d.uuid();
      if (nv > 0) d.compressed(null);
      if (minor >= 4 && ctx.ar.onVersion >= 200606010) {
        d.skipChunk();
        if (minor >= 5) {
          d.u8(); d.u8(); d.u8();
          if (minor >= 6) {
            if (d.bool()) d.skipChunk();
            if (minor >= 7 && d.bool()) {
              const { r: q } = d.versionedChunk();
              const n = q.u32();
              if (n === nv && n > 0) {
                const a = f64view(q.compressed(n * 24), n * 3);
                // the toolkit drops them when they disagree with the floats; so do we
                let ok = !!a;
                for (let i = 0; ok && i < n * 3; i++) if (!(Math.abs(a[i] - V[i]) <= Math.abs(V[i]) * 1e-6 + 1e-6 * Math.max(1, Math.abs(a[i])))) ok = false;
                if (ok) dV = a;
              }
            }
          }
        }
      }
    }
  } catch { dV = null; }
  return { cls: 'mesh', nv, nf, V: dV || V, N, T, C, F, closed: closed === 1 || closed === 2 };
}

// ------------------------------------------------------------------------------------------------------------ breps

function objArray(d, ctx, test) {
  const c = d.expect(TC.ANONYMOUS);
  const r = d.sub(c);
  const [major] = r.versioned();
  if (major !== 1) throw damaged('ccdm.damaged.layout', { tc: 'brep list' });
  const n = r.i32();
  if (n < 0 || n > ctx.limits.items) throw damaged('ccdm.damaged.count');
  const out = [];
  for (let i = 0; i < n; i++) {
    const flag = r.i32();
    if (flag !== 1) { out.push(null); continue; }
    const o = readObject(r, ctx);
    out.push(o && test(o) ? o : (o ? { cls: o.cls, unread: true } : null));
  }
  return out;
}

function list(d, ctx, item) {
  const c = d.expect(TC.ANONYMOUS);
  const r = d.sub(c);
  const [major, minor] = r.versioned();
  if (major !== 1) throw damaged('ccdm.damaged.layout', { tc: 'brep list' });
  const n = r.i32();
  if (n < 0 || n > ctx.limits.items) throw damaged('ccdm.damaged.count');
  r.count(n, 4);
  const out = [];
  for (let i = 0; i < n; i++) out.push(item(r));
  return { out, r, minor };
}

function brep(d, ctx) {
  const [major, minor] = d.versioned();
  if (major !== 3) return { cls: 'brep', unread: true, old: true };
  const ar = ctx.ar;
  const newer = ar.version >= 3 && ar.onVersion >= 200206180;
  const c2 = objArray(d, ctx, (o) => CURVES.has(o.cls));
  const c3 = objArray(d, ctx, (o) => CURVES.has(o.cls));
  const S = objArray(d, ctx, (o) => SURFACES.has(o.cls));
  const V = list(d, ctx, (r) => { r.i32(); const p = r.point(); r.intArray(); r.f64(); return p; }).out;
  const E = list(d, ctx, (r) => {
    r.i32();
    const c3i = r.i32(), rev = r.i32() !== 0, proxy = r.interval(), vi = [r.i32(), r.i32()];
    r.intArray(); r.f64();
    const domain = newer ? r.interval() : proxy.slice();
    return { c3i, rev, proxy, vi, domain };
  }).out;
  const T = list(d, ctx, (r) => {
    r.i32();
    const c2i = r.i32(), proxy = r.interval(), ei = r.i32(), vi = [r.i32(), r.i32()], rev3d = r.i32() !== 0, type = r.i32(), iso = r.i32(), li = r.i32();
    r.f64(); r.f64();
    let domain = proxy.slice(), rev = false;
    if (newer) { domain = r.interval(); const b = r.u8(); r.need(7); r.pos += 7; rev = b === 1; r.need(24); r.pos += 24; } else r.f64s(6);
    r.f64(); r.f64();
    return { c2i, proxy, ei, vi, rev3d, type, iso, li, domain, rev };
  }).out;
  const L = list(d, ctx, (r) => { r.i32(); const ti = Array.from(r.intArray()); const type = r.i32(), fi = r.i32(); return { ti, type, fi }; }).out;
  const Fl = list(d, ctx, (r) => { r.i32(); const li = Array.from(r.intArray()); const si = r.i32(), rev = r.i32() !== 0; r.i32(); return { li, si, rev, mesh: null, color: null }; });
  const F = Fl.out;
  if (Fl.minor >= 1) {
    try {
      for (let i = 0; i < F.length; i++) Fl.r.uuid();
      if (Fl.minor >= 2 && Fl.r.bool()) for (let i = 0; i < F.length; i++) { const c = [Fl.r.u8(), Fl.r.u8(), Fl.r.u8(), Fl.r.u8()]; if (!(c[0] === 0xff && c[1] === 0xff && c[2] === 0xff && c[3] === 0xff)) F[i].color = c; }
    } catch { /* face ids and colours are extras */ }
  }
  const bbox = d.bbox();
  // check every index the faces, loops and trims hold
  const bad = (i, n) => !(Number.isInteger(i) && i >= 0 && i < n);
  for (const f of F) { if (bad(f.si, S.length)) throw damaged('ccdm.damaged.index', { what: 'surface' }); for (const li of f.li) if (bad(li, L.length)) throw damaged('ccdm.damaged.index', { what: 'loop' }); }
  for (const l of L) for (const ti of l.ti) if (bad(ti, T.length)) throw damaged('ccdm.damaged.index', { what: 'trim' });
  for (const t of T) { if (bad(t.c2i, c2.length)) throw damaged('ccdm.damaged.index', { what: 'trim curve' }); if (t.ei >= E.length) throw damaged('ccdm.damaged.index', { what: 'edge' }); }
  for (const e of E) if (e.c3i >= c3.length) throw damaged('ccdm.damaged.index', { what: 'edge curve' });
  if (minor >= 1) {
    // the render meshes saved with the faces (when the program saved them): our first source for curved faces
    try {
      const c = d.expect(TC.ANONYMOUS);
      const r = d.sub(c);
      for (let i = 0; i < F.length; i++) if (r.u8()) { const m = readObject(r, ctx); if (m && m.cls === 'mesh' && !m.unread) F[i].mesh = m; }
    } catch (e) { if (e && e.code === 'too_big') throw e; }
  }
  return { cls: 'brep', c2, c3, S, V, E, T, L, F, bbox };
}

// ------------------------------------------------------------------------------------------------------- extrusions

function meshCache(d, ctx) {
  const { r } = d.versionedChunk();
  const out = [];
  for (let k = 0; k < 64; k++) {
    const c = r.u8();
    if (c !== 1) break;
    const { r: q } = r.versionedChunk();
    const id = q.uuid();
    const m = readObject(q, ctx);
    if (m && m.cls === 'mesh' && !m.unread) out.push({ id, mesh: m });
  }
  return (out.find((x) => x.id === RENDER_MESH) || out[0] || {}).mesh || null;
}

function extrusion(d, ctx) {
  const { r, major, minor } = d.versionedChunk();
  if (major !== 1) return { cls: 'extrusion', unread: true };
  const profile = curveOf(readObject(r, ctx));
  const path = [r.point(), r.point()];
  const t = r.interval();
  const up = r.point();
  const haveN = [r.bool(), r.bool()];
  const N = [r.point(), r.point()];
  r.interval();
  const transposed = r.bool();
  let count = profile ? 1 : 0, cap = [false, false], mesh = null;
  if (minor >= 1) {
    count = r.i32();
    if (minor >= 2) {
      cap = [r.bool(), r.bool()];
      if (minor >= 3) { try { mesh = meshCache(r, ctx); } catch { mesh = null; } }
    }
  }
  if (minor < 2) cap = [true, true];   // an old file: closed profiles were capped (checked again when the profile is sampled)
  const mitered = haveN.some((h, i) => h && (N[i][0] !== 0 || N[i][1] !== 0));
  return { cls: 'extrusion', profile, count, path, t, up, cap, mitered, transposed, mesh, oldCaps: minor < 2 };
}

// ---------------------------------------------------------------------------------------------------- other geometry

function point(d) { d.versioned(); return { cls: 'point', p: d.point() }; }
function pointCloud(d) {
  d.versioned();
  const n = d.i32();
  if (n > 0) d.count(n, 24);
  return { cls: 'pointCloud', n: Math.max(0, n) };
}
function instanceRef(d) {
  const [major] = d.versioned();
  if (major !== 1) return { cls: 'instanceRef', unread: true };
  const idef = d.uuid();
  const xform = d.xform();
  return { cls: 'instanceRef', idef, xform };
}

// --------------------------------------------------------------------------------------------- tables' components

/** ON_ModelComponent's own attributes (materials from version 6): an anonymous chunk with a bit set saying what follows. */
function memberAttributes(d) {
  const { r } = d.versionedChunk();
  const bits = r.u32();
  const out = {};
  if (bits & 1) out.id = r.uuid();
  if (bits & 2) out.parent = r.uuid();
  if (bits & 4) out.index = r.i32();
  if (bits & 8) out.name = r.wstring();
  return out;
}
/** ON_BinaryArchive's model-component attributes chunk (block definitions from version 6): five items, each 0 / 1 + value / 2. */
function archiveAttributes(d) {
  const { r } = d.versionedChunk(TC.MODEL_ATTRIBUTES);
  const out = {};
  if (r.u8() === 1) { r.u32(); r.u32(); r.u32(); }
  if (r.u8() === 1) out.id = r.uuid();
  if (r.u8() === 1) r.u32();
  if (r.u8() === 1) out.index = r.i32();
  if (r.u8() === 1) out.name = r.wstring();
  return out;
}

function layer(d, ctx) {
  const [major, minor] = d.versioned();
  if (major !== 1) return { cls: 'layer', unread: true };
  const mode = d.i32();
  const index = d.i32();
  d.i32();
  const material = d.i32();
  d.i32();
  const color = [d.u8(), d.u8(), d.u8(), d.u8()];
  d.i16(); d.i16(); d.f64(); d.f64();
  const name = d.wstring();
  const out = { cls: 'layer', index, name, color, visible: mode !== 1, locked: mode === 2, material, id: null, parent: null };
  if (minor >= 1) {
    if (!d.bool()) out.visible = false;
    if (minor >= 2) {
      d.i32();
      if (minor >= 3) {
        d.u32(); d.f64();
        if (minor >= 4) {
          if (d.bool()) out.locked = true;
          if (minor >= 5) {
            out.id = d.uuid();
            if (minor >= 6 && ctx.ar.onVersion > 200505110) { out.parent = d.uuid(); d.bool(); }
          }
        }
      }
    }
  }
  if (out.parent === NIL) out.parent = null;
  return out;
}

function material(d, ctx) {
  const ar = ctx.ar;
  const colours = (r) => { const c = []; for (let i = 0; i < 6; i++) c.push([r.u8(), r.u8(), r.u8(), r.u8()]); return c; };
  if (ar.version < 60 || ar.onVersion < 2348833910) {
    const [major] = d.versioned();
    if (major !== 2) return { cls: 'material', unread: true };
    const { r } = d.versionedChunk();
    const id = r.uuid(), index = r.i32(), name = r.wstring();
    r.uuid();
    const [, diffuse, , , , ] = colours(r);
    r.f64(); r.f64(); r.f64();
    const transparency = r.f64();
    return { cls: 'material', id, index, name, diffuse, transparency };
  }
  const { r, major } = d.versionedChunk();
  if (major !== 1) return { cls: 'material', unread: true };
  const a = memberAttributes(r);
  r.uuid();
  const [, diffuse] = colours(r);
  r.f64(); r.f64(); r.f64();
  const transparency = r.f64();
  return { cls: 'material', id: a.id || null, index: a.index ?? -1, name: a.name || '', diffuse, transparency };
}

function instanceDefinition(d, ctx) {
  const ar = ctx.ar;
  let v6 = ar.version > 50;
  if (v6 && ar.version <= 60) v6 = ar.onVersion > 2348834153 && d.peekTc() === TC.ANONYMOUS;
  if (!v6) {
    const [major] = d.versioned();
    if (major !== 1) return { cls: 'instanceDefinition', unread: true };
    const id = d.uuid();
    const objects = d.uuidArray();
    const name = d.wstring();
    d.wstring(); d.wstring(); d.wstring();
    d.bbox();
    const type = d.u32();
    let path = '';
    try { path = d.wstring(); } catch { path = ''; }
    return { cls: 'instanceDefinition', id, name, objects, linked: (type === 2 || type === 3) && !!path, embedded: type !== 3 };
  }
  const { r, major } = d.versionedChunk();
  if (major !== 1) return { cls: 'instanceDefinition', unread: true };
  const a = archiveAttributes(r);
  const type = r.u32();
  r.skipChunk();
  r.wstring(); r.wstring(); r.wstring();
  r.bbox();
  const objects = r.bool() ? r.uuidArray() : [];
  const linked = r.bool();
  return { cls: 'instanceDefinition', id: a.id || null, name: a.name || '', objects, linked, embedded: type !== 3 };
}

/** ON_3dmObjectAttributes (the object record's attributes chunk). */
export function readAttributes(d, ctx) {
  const ar = ctx.ar;
  const out = { id: null, layer: 0, name: '', material: -1, color: null, colorSource: 0, materialSource: 0, visible: true, mode: 0 };
  if (ar.version >= 5 && ar.onVersion >= 200712190) {
    const [major] = d.versioned();
    if (major !== 2) return out;
    out.id = d.uuid();
    out.layer = d.i32();
    let id = d.u8();
    // items in rising order, each only when it differs from the default; we stop after the ones we use
    while (id && id <= 17) {
      switch (id) {
        case 1: out.name = d.wstring(); break;
        case 2: d.wstring(); break;
        case 3: d.i32(); break;
        case 4: out.material = d.i32(); break;
        case 5: d.skipChunk(); break;
        case 6: out.color = [d.u8(), d.u8(), d.u8(), d.u8()]; break;
        case 7: d.u32(); break;
        case 8: d.f64(); break;
        case 9: d.u8(); break;
        case 10: d.i32(); break;
        case 11: out.visible = d.bool(); break;
        case 12: out.mode = d.u8(); break;
        case 13: out.colorSource = d.u8(); break;
        case 14: d.u8(); break;
        case 15: d.u8(); break;
        case 16: out.materialSource = d.u8(); break;
        case 17: d.u8(); break;
        default: break;
      }
      id = d.u8();
    }
    return out;
  }
  const [major, minor] = d.versioned();
  if (major !== 1) return out;
  out.id = d.uuid();
  out.layer = d.i32();
  out.material = d.i32();
  out.color = [d.u8(), d.u8(), d.u8(), d.u8()];
  d.i16(); d.i16(); d.f64(); d.f64();
  d.i32();
  out.mode = d.u8();
  out.colorSource = d.u8();
  d.u8();
  out.materialSource = d.u8();
  out.name = d.wstring();
  d.wstring();
  out.visible = out.mode !== 1;
  if (minor >= 1) { d.intArray(); if (minor >= 2) out.visible = d.bool(); }
  return out;
}

const READERS = {
  mesh, nurbsCurve, lineCurve, polylineCurve, arcCurve, polyCurve,
  nurbsSurface, planeSurface, revSurface, sumSurface,
  brep, extrusion, point, pointCloud, instanceRef,
  layer, material, instanceDefinition,
};
