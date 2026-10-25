// SPDX-License-Identifier: Apache-2.0
// k1.cpp — the K.1 kernel tests (tools/partcraft-test/k1-spike/REPORT.md) against NVIDIA SMLib (usd-brep 1.0.1, Apache-2.0),
// through its C API (SM_API). 0.7 D7.45 spike, session part-08. Built by build.sh (native g++ or Emscripten); prints one JSON
// line per case: { case, ok, volume, expect, err (relative), ms, note }. Nothing ships from here.
//   k1 [case …]      (no arguments: every case)

#include <SmApiBrep.h>
#include <SmApiFillets.h>
#include <SmApiGeneral.h>
#include <SmApiPrimitives.h>
#include <SmApiQueries.h>
#include <SmApiPolygons.h>
#include <SmApiTessellationParams.h>
#include <SmBrep.h>
#include <SmEdge.h>
#include <SmFace.h>
#include <SmVector3d.h>

#include <chrono>
#include <cmath>
#include <cstdio>
#include <cstring>
#include <functional>
#include <string>
#include <vector>

namespace {

const double PI = 3.14159265358979323846;
using Clock = std::chrono::steady_clock;

struct Fail { std::string what; int status; };

void check(SmApiStatus s, const char* what) { if (s != SM_SUCCESS) throw Fail{ what, (int)s }; }

SmBrep* box(double x, double y, double z, double dx, double dy, double dz) {
  SmBrep* b = nullptr; check(SmApiCreateBox(SmVector3d(x, y, z), dx, dy, dz, b), "create_box"); return b;
}
// a cylinder along +z from (x, y, z), or along +x / +y when axis says so (turned about the start point)
SmBrep* cyl(double x, double y, double z, double r, double h, char axis = 'z') {
  SmBrep* b = nullptr; check(SmApiCreateCylinder(SmVector3d(x, y, z), r, h, b), "create_cylinder");
  if (axis == 'x') check(SmApiRotate(b, SmVector3d(x, y, z), SmVector3d(0, 1, 0), 90.0), "rotate");
  if (axis == 'y') check(SmApiRotate(b, SmVector3d(x, y, z), SmVector3d(1, 0, 0), -90.0), "rotate");
  return b;
}
SmBrep* op(SmBrep* a, SmBrep* b, SmBooleanOperationType t, const char* what) {
  SmBrep* r = nullptr; check(SmApiBoolean(a, b, t, r), what); return r;
}
SmBrep* uni(SmBrep* a, SmBrep* b) { return op(a, b, SM_BO_UNION, "union"); }
SmBrep* dif(SmBrep* a, SmBrep* b) { return op(a, b, SM_BO_DIFFERENCE, "difference"); }

double brepVolume(SmBrep* b) { double v = 0; check(SmApiBrepComputeVolume(b, 1e-9, v), "volume"); return v; }
bool isSolid(SmBrep* b) { SmBoolean s = FALSE; check(SmApiBrepIsManifoldSolid(b, s), "is_manifold_solid"); return s == TRUE; }

// the edges nearest the given points
SmTArray<SmEdge*> edgesAt(SmBrep* b, const std::vector<SmPoint3d>& pts) {
  SmTArray<SmEdge*> all, out;
  check(SmApiGetEdges(b, all), "get_edges");
  for (const auto& p : pts) {
    ULONG idx = 0; double t = 0;
    check(SmApiFindEdge(b, p, idx, t), "find_edge");
    out.Add(all[idx]);
  }
  return out;
}

SmBrep* plate() {
  SmBrep* p = box(0, 0, 0, 100, 60, 10);
  for (double hx : { 20.0, 80.0 }) for (double hy : { 15.0, 45.0 }) p = dif(p, cyl(hx, hy, -5, 4, 20));
  return p;
}
const double PLATE = 60000 - 4 * PI * 16 * 10;
const double CORNER = 5.0 / 3.0 - PI / 2;   // where two rounded edges meet at a sharp third edge (mitred): r³ (5/3 − π/2) each

struct Case { const char* name; double expect; std::function<SmBrep*()> make; const char* note; };

std::vector<Case> cases() {
  return {
    { "plate", PLATE, [] { return plate(); }, "100x60x10 box - 4 through holes d8" },
    { "bracket", 60 * 40 * 10 + 10 * 40 * 40 - PI * 25 * 10,
      [] { SmBrep* b = uni(box(0, 0, 0, 60, 40, 10), box(0, 0, 0, 10, 40, 50)); return dif(b, cyl(-5, 20, 30, 5, 20, 'x')); }, "L of two boxes sharing faces, + d10 cross hole" },
    { "bracket-touch", 60 * 40 * 10 + 20 * 20 * 30, [] { return uni(box(0, 0, 0, 60, 40, 10), box(10, 10, 10, 20, 20, 30)); }, "a box standing on another's top face" },
    { "shaft", PI * 400 * 10 + PI * 100 * 60, [] { return uni(cyl(0, 0, 0, 20, 10), cyl(0, 0, 10, 10, 60)); }, "flange r20 x 10 + shaft r10 x 60 on its face" },
    { "tee", 2 * PI * 100 * 100 - 16.0 / 3.0 * 1000, [] { return uni(cyl(0, 0, -50, 10, 100), cyl(-50, 0, 0, 10, 100, 'x')); }, "two d20 cylinders crossing (Steinmetz)" },
    { "fillet-1", 125000 - 50 * 25 * (1 - PI / 4),
      [] { SmBrep* c = box(0, 0, 0, 50, 50, 50); auto e = edgesAt(c, { SmPoint3d(25, 0, 0) }); check(SmApiFilletEdges(c, e, 5.0, 1, 1, 1.0), "fillet"); return c; }, "one edge of a 50 cube, r5" },
    { "chamfer-1", 125000 - 50 * 12.5,
      [] { SmBrep* c = box(0, 0, 0, 50, 50, 50); auto e = edgesAt(c, { SmPoint3d(25, 0, 0) }); check(SmApiFilletEdges(c, e, 5.0, 0, 1, 1.0), "chamfer"); return c; }, "one edge, linear cross-section 5 (expect: 5 back on each face)" },
    { "fillet-top4", 125000 - 4 * 50 * 25 * (1 - PI / 4) + 4 * 125 * CORNER,
      [] { SmBrep* c = box(0, 0, 0, 50, 50, 50); auto e = edgesAt(c, { SmPoint3d(25, 0, 50), SmPoint3d(50, 25, 50), SmPoint3d(25, 50, 50), SmPoint3d(0, 25, 50) });
           check(SmApiFilletEdges(c, e, 5.0, 1, 1, 1.0), "fillet"); return c; }, "four top edges r5, vertical edges sharp (expect: mitred corners)" },
    { "fillet-plate-hole", PLATE - 320 * 4 * (1 - PI / 4) + 4 * 8 * CORNER,
      [] { SmBrep* p = plate(); auto e = edgesAt(p, { SmPoint3d(50, 0, 10), SmPoint3d(100, 30, 10), SmPoint3d(50, 60, 10), SmPoint3d(0, 30, 10) });
           check(SmApiFilletEdges(p, e, 2.0, 1, 1, 1.0), "fillet"); return p; }, "the plate's four top outer edges r2, after the holes" },
    // beyond K.1: a corner where three rounded edges meet (rolling ball: a sphere octant at the corner), a concave round where a
    // boss meets a plate, a flush pocket (coplanar difference), 100 holes, a shell after a fillet (KNOWN_ISSUES: extended offset)
    { "corner-3", 125000 - (3 * 45 * 25 * (1 - PI / 4) + 125 * (1 - PI / 6)),
      [] { SmBrep* c = box(0, 0, 0, 50, 50, 50); auto e = edgesAt(c, { SmPoint3d(25, 0, 50), SmPoint3d(0, 25, 50), SmPoint3d(0, 0, 25) });
           check(SmApiFilletEdges(c, e, 5.0, 1, 1, 1.0), "fillet"); return c; }, "three edges at one corner r5 (expect: spherical corner)" },
    // the round fills r²(1 − π/4) of section whose centroid is r (5/6 − π/4) / (1 − π/4) out from the boss's wall (Pappus)
    { "boss-fillet", 100 * 60 * 10 + PI * 100 * 20 + 4 * (1 - PI / 4) * 2 * PI * (10 + 2 * (5.0 / 6 - PI / 4) / (1 - PI / 4)),
      [] { SmBrep* b = uni(box(0, 0, 0, 100, 60, 10), cyl(50, 30, 10, 10, 20)); auto e = edgesAt(b, { SmPoint3d(60, 30, 10) });
           check(SmApiFilletEdges(b, e, 2.0, 1, 1, 1.0), "fillet"); return b; }, "boss r10 on a plate, the concave edge r2 (Pappus)" },
    { "flush-pocket", 125000 - 30 * 30 * 10, [] { return dif(box(0, 0, 0, 50, 50, 50), box(10, 10, 40, 30, 30, 10)); }, "pocket flush with the top face (coplanar difference)" },
    { "holes-100", 200 * 200 * 10 - 100 * PI * 4 * 10,
      [] { SmBrep* p = box(0, 0, 0, 200, 200, 10); for (int i = 0; i < 10; i++) for (int j = 0; j < 10; j++) p = dif(p, cyl(10 + 20 * i, 10 + 20 * j, -5, 2, 20)); return p; }, "100 holes d4, one boolean each" },
    // outside: the box with its top edges rounded r5; inside: that box offset 2 inward (46 x 46 x 26, rounds r3), plus the opened top
    // face's own 2 mm slab (its flat 40 x 40 after the rounds)
    { "shell-filleted", (75000 - 4 * 50 * 25 * (1 - PI / 4) + 4 * 125 * CORNER) - (46 * 46 * 26 - 4 * 46 * 9 * (1 - PI / 4) + 4 * 27 * CORNER + 40 * 40 * 2),
      [] { SmBrep* c = box(0, 0, 0, 50, 50, 30); auto e = edgesAt(c, { SmPoint3d(25, 0, 30), SmPoint3d(50, 25, 30), SmPoint3d(25, 50, 30), SmPoint3d(0, 25, 30) });
           check(SmApiFilletEdges(c, e, 5.0, 1, 1, 1.0), "fillet"); SmFace* top = nullptr; check(SmApiFindFaces(c, SmPoint3d(25, 25, 30), top), "find_face");
           SmTArray<const SmFace*> open; open.Add(top); SmBrep* r = nullptr; check(SmApiShellBrepFull(c, -2.0, TRUE, TRUE, FALSE, open, r), "shell"); return r; }, "top edges r5, then shelled open at the top, walls 2" },
    { "shell", 50 * 50 * 30 - 46 * 46 * 28,
      [] { SmBrep* c = box(0, 0, 0, 50, 50, 30); SmFace* top = nullptr; check(SmApiFindFaces(c, SmPoint3d(25, 25, 30), top), "find_face");
           SmTArray<const SmFace*> open; open.Add(top); SmBrep* r = nullptr;
           check(SmApiShellBrepFull(c, -2.0, TRUE, TRUE, FALSE, open, r), "shell"); return r; }, "50x50x30 box, top open, walls 2 inward" },
  };
}

}   // namespace

int main(int argc, char** argv) {
  SmApiCreateContext();
  for (const auto& c : cases()) {
    if (argc > 1) { bool want = false; for (int i = 1; i < argc; i++) if (!strcmp(argv[i], c.name)) want = true; if (!want) continue; }
    auto t0 = Clock::now();
    std::string err;
    double v = NAN, tv = NAN, tms = 0; bool ok = false, man = false, tman = false;
    double ms = 0;
    try {
      SmBrep* b = c.make();
      v = brepVolume(b);
      man = isSolid(b);
      ok = true;
      ms = std::chrono::duration<double, std::milli>(Clock::now() - t0).count();
      // what the page would draw: the tessellation (defaults), its volume and whether it is watertight
      auto t1 = Clock::now();
      SmPolyBrep* pb = nullptr;
      if (SmApiTessellate(b, pb) == SM_SUCCESS && pb) { SmBoolean w = FALSE; SmApiPolyBrepIsManifoldSolid(pb, w); tman = w == TRUE; SmApiPolyBrepComputeVolume(pb, tv); }
      tms = std::chrono::duration<double, std::milli>(Clock::now() - t1).count();
    } catch (const Fail& f) { err = f.what + " status " + std::to_string(f.status); }
    catch (...) { err = "exception"; }
    if (!ok) ms = std::chrono::duration<double, std::milli>(Clock::now() - t0).count();
    double rel = ok && c.expect > 0 ? std::fabs(v - c.expect) / c.expect : -1.0;
    printf("{\"case\":\"%s\",\"ok\":%s,\"solid\":%s,\"volume\":%.6f,\"expect\":%.6f,\"err\":%.3e,\"ms\":%.1f,\"mesh_watertight\":%s,\"mesh_volume\":%.3f,\"tess_ms\":%.1f,\"note\":\"%s\",\"fail\":\"%s\"}\n",
      c.name, ok ? "true" : "false", man ? "true" : "false", ok ? v : 0.0, c.expect, rel, ms, tman ? "true" : "false", std::isfinite(tv) ? tv : 0.0, tms, c.note, err.c_str());
    fflush(stdout);
  }
  return 0;
}
