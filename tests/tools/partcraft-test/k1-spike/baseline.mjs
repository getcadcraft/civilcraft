// SPDX-License-Identifier: Apache-2.0
/**
 * K.1 spike baseline: the spike's test parts (see truck/src/lib.rs) on OpenCascade (today's exact
 * kernel; a test-only black box here) and on manifold-3d (the mesh kernel), with times and volume
 * errors, so the truck / monstertruck numbers have something to stand next to.
 *   node tools/partcraft-test/k1-spike/baseline.mjs [--step <dir>]   (STEP read-back of the spike's files)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const VENDOR = path.join(REPO, 'public_html/assets/vendor');
const PI = Math.PI;
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };

const quarter = (r) => r * r - PI * r * r / 4;
const mitre = (r) => r ** 3 * (5 / 3 - PI / 2);
const HOLES = [[15, 15], [85, 15], [15, 45], [85, 45]];
const EXPECT = {
  plate: 60000 - 4 * PI * 160,
  bracket: 80 * 40 * 8 + 8 * 40 * 52 - PI * 25 * 8,
  'bracket-touch': 80 * 40 * 8 + 8 * 40 * 52,
  tee: 2 * PI * 100 * 60 - 16 / 3 * 1000,
  shaft: PI * 100 * 50 + PI * 525 * 8,
  'fillet-1': 125000 - quarter(5) * 50,
  'fillet-top4': 125000 - 4 * quarter(5) * 50 + 4 * mitre(5),
  'fillet-plate-hole': 60000 - 4 * PI * 160 - quarter(2) * 320 + 4 * mitre(2),
  'chamfer-1': 125000 - 12.5 * 50,
};
const rows = [];
const row = (kernel, name, ms, vol, note = '') => {
  const e = EXPECT[name];
  rows.push({ kernel, name, ms: +ms.toFixed(1), volume: vol == null ? null : +vol.toFixed(3), errPct: vol == null ? null : +(100 * Math.abs(vol - e) / e).toFixed(4), note });
};

// ---------------- OpenCascade ----------------
const { default: occtInit } = await import(path.join(VENDOR, 'replicad-opencascadejs/current/replicad_single.js'));
let t = performance.now();
const oc = await occtInit({ print: () => {}, printErr: () => {} });
const occLoad = performance.now() - t;
const P = (x, y, z) => new oc.gp_Pnt(x, y, z);
const D = (x, y, z) => new oc.gp_Dir(x, y, z);
const PR = () => new oc.Message_ProgressRange();
const box = (x, y, z, dx, dy, dz) => new oc.BRepPrimAPI_MakeBox(P(x, y, z), P(x + dx, y + dy, z + dz)).Shape();
const prism = (face, v) => new oc.BRepPrimAPI_MakePrism(face, new oc.gp_Vec(...v), false, true).Shape();
const disc = (c, n, r) => {
  const circ = new oc.gp_Circ(new oc.gp_Ax2(P(...c), D(...n)), r);
  const e = new oc.BRepBuilderAPI_MakeEdge(circ).Edge();
  const w = new oc.BRepBuilderAPI_MakeWire(e).Wire();
  return new oc.BRepBuilderAPI_MakeFace(w, true).Face();
};
const cyl = (c, n, r, h) => prism(disc(c, n, r), n.map((v) => v * h));
const fuse = (a, b) => { const op = new oc.BRepAlgoAPI_Fuse(a, b, PR()); op.SimplifyResult(true, true, 1e-7); return op.Shape(); };
const cut = (a, b) => new oc.BRepAlgoAPI_Cut(a, b, PR()).Shape();
const volOf = (s) => { const g = new oc.GProp_GProps(); oc.BRepGProp.VolumeProperties(s, g, false, false, false); return g.Mass(); };
const edgesWhere = (s, pick) => {
  const out = []; const ex = new oc.TopExp_Explorer(s, oc.TopAbs_ShapeEnum.TopAbs_EDGE, oc.TopAbs_ShapeEnum.TopAbs_SHAPE);
  for (; ex.More(); ex.Next()) {
    const e = oc.TopoDS.Edge(ex.Current());
    const c = new oc.BRepAdaptor_Curve(e);
    const a = c.Value(c.FirstParameter()), b = c.Value(c.LastParameter());
    if (pick([a.X(), a.Y(), a.Z()]) && pick([b.X(), b.Y(), b.Z()])) out.push(e);
  }
  return out;
};
const fillet = (s, pick, r, chamfer = false) => {
  const op = chamfer ? new oc.BRepFilletAPI_MakeChamfer(s) : new oc.BRepFilletAPI_MakeFillet(s, oc.ChFi3d_FilletShape.ChFi3d_Rational);
  for (const e of edgesWhere(s, pick)) chamfer ? op.Add(r, e) : op.Add(r, e);
  op.Build(PR());
  return op.Shape();
};
const plate = () => HOLES.reduce((s, [x, y]) => cut(s, cyl([x, y, -1], [0, 0, 1], 4, 12)), box(0, 0, 0, 100, 60, 10));
const shaftOcc = () => {
  const pts = [[0, 0], [25, 0], [25, 8], [10, 8], [10, 50], [0, 50]].map(([x, z]) => P(x, 0, z));
  const wb = new oc.BRepBuilderAPI_MakeWire();
  for (let i = 0; i < pts.length; i++) wb.Add(new oc.BRepBuilderAPI_MakeEdge(pts[i], pts[(i + 1) % pts.length]).Edge());
  const f = new oc.BRepBuilderAPI_MakeFace(wb.Wire(), true).Face();
  return new oc.BRepPrimAPI_MakeRevol(f, new oc.gp_Ax1(P(0, 0, 0), D(0, 0, 1)), 2 * PI, true).Shape();
};
const OCC = {
  plate,
  bracket: () => cut(fuse(box(0, 0, 0, 80, 40, 8), box(0, 0, 0, 8, 40, 60)), cyl([-1, 20, 40], [1, 0, 0], 5, 10)),
  'bracket-touch': () => fuse(box(0, 0, 0, 80, 40, 8), box(0, 0, 8, 8, 40, 52)),
  tee: () => fuse(cyl([-30, 0, 0], [1, 0, 0], 10, 60), cyl([0, -30, 0], [0, 1, 0], 10, 60)),
  shaft: shaftOcc,
  'fillet-1': () => fillet(box(0, 0, 0, 50, 50, 50), (p) => p[2] > 49.9 && p[1] < 0.1, 5),
  'fillet-top4': () => fillet(box(0, 0, 0, 50, 50, 50), (p) => p[2] > 49.9, 5),
  'fillet-plate-hole': () => fillet(plate(), (p) => p[2] > 9.9 && (p[0] < 0.1 || p[0] > 99.9 || p[1] < 0.1 || p[1] > 59.9), 2),
  'chamfer-1': () => fillet(box(0, 0, 0, 50, 50, 50), (p) => p[2] > 49.9 && p[1] < 0.1, 5, true),
};
for (const [name, fn] of Object.entries(OCC)) {
  t = performance.now();
  try { const s = fn(); const ms = performance.now() - t; row('occt', name, ms, volOf(s)); }
  catch (e) { row('occt', name, performance.now() - t, null, String(typeof e === 'number' ? oc.OCJS?.getStandard_FailureData?.(e)?.GetMessageString?.() ?? e : e.message)); }
}

// ---------------- manifold-3d (64 segments per turn, as the mesh kernel's default resolution) ----------------
const { default: Module } = await import(path.join(VENDOR, 'manifold-3d/current/manifold.js'));
t = performance.now();
const M = await Module(); M.setup();
const manLoad = performance.now() - t;
const { Manifold } = M;
const SEG = 64;
const mbox = (x, y, z, dx, dy, dz) => Manifold.cube([dx, dy, dz]).translate([x, y, z]);
const mcyl = (c, axis, r, h) => {
  let m = Manifold.cylinder(h, r, r, SEG);
  if (axis === 'x') m = m.rotate([0, 90, 0]);
  if (axis === 'y') m = m.rotate([-90, 0, 0]);
  return m.translate(c);
};
const mplate = () => HOLES.reduce((s, [x, y]) => s.subtract(mcyl([x, y, -1], 'z', 4, 12)), mbox(0, 0, 0, 100, 60, 10));
const MAN = {
  plate: mplate,
  bracket: () => mbox(0, 0, 0, 80, 40, 8).add(mbox(0, 0, 0, 8, 40, 60)).subtract(mcyl([-1, 20, 40], 'x', 5, 10)),
  'bracket-touch': () => mbox(0, 0, 0, 80, 40, 8).add(mbox(0, 0, 8, 8, 40, 52)),
  tee: () => mcyl([-30, 0, 0], 'x', 10, 60).add(mcyl([0, -30, 0], 'y', 10, 60)),
  shaft: () => Manifold.revolve(new M.CrossSection([[[0, 0], [25, 0], [25, 8], [10, 8], [10, 50], [0, 50]]]), SEG),
};
for (const [name, fn] of Object.entries(MAN)) {
  t = performance.now();
  try { const m = fn(); const v = m.volume(); row('manifold', name, performance.now() - t, v, m.genus() >= 0 ? '' : 'bad'); }
  catch (e) { row('manifold', name, performance.now() - t, null, e.message); }
}

console.log(JSON.stringify({ occtLoadMs: Math.round(occLoad), manifoldLoadMs: Math.round(manLoad) }));
console.table(rows);

// ---------------- STEP read-back: the spike kernels' files, read by OpenCascade (oracle only) ----------------
const dir = arg('--step');
if (dir) {
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.step')).sort()) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    const name = 'k1.step';
    oc.FS.writeFile('/' + name, text);
    const rd = new oc.STEPControl_Reader();
    const st = rd.ReadFile(name);
    let out = { file: f, bytes: text.length, read: st === oc.IFSelect_ReturnStatus.IFSelect_RetDone };
    if (out.read) {
      rd.TransferRoots(PR());
      const s = rd.OneShape();
      const an = new oc.BRepCheck_Analyzer(s, true, false);
      const key = f.replace(/^(truck|mt)-/, '').replace(/\.step$/, '').replace('plate-step', 'plate');
      const v = volOf(s);
      out = { ...out, valid: an.IsValid(), volume: +v.toFixed(3), errPct: EXPECT[key] ? +(100 * Math.abs(Math.abs(v) - EXPECT[key]) / EXPECT[key]).toFixed(4) : null };
    }
    console.log(JSON.stringify(out));
  }
}
