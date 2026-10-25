# K.1 spike: PartCraft without OpenCascade (0.4 part 2, session `part`, 2026-10-13)

**Result: no-go on truck (and on its fork monstertruck) for 0.4. Recommendation for owner decision 3: ship PartCraft 0.4 on
the mesh kernel (manifold-3d), with the exact-only features marked "Not built yet" (K.2–K.6), and start our own exact kernel
(cc-brep) as a spec'd project for 0.6+, beginning with booleans on analytic surfaces. Re-run this spike against truck and
monstertruck each round: they are moving.**

Everything here is reproducible:

| What | How |
|---|---|
| truck 0.6 (ricosjp, Apache-2.0) | `truck/` — `CARGO_TARGET_DIR=<tmp> cargo run --release --bin k1 [<step dir>]`; `K1_TOL=0.05` changes the boolean tolerance |
| monstertruck 0.4.1 (truck fork with fillets, Apache-2.0) | `monstertruck/` — `cargo run --release --bin k1m [<step dir>] [case]` |
| wasm32 builds | `cargo build --release --lib --target wasm32-unknown-unknown`, then `node run-wasm.mjs <file.wasm> [case…]` |
| OpenCascade + manifold baseline, STEP read-back | `node baseline.mjs [--step <dir>]` (OCCT is a test-only black box here) |

## Test parts (mm), with closed-form volumes

| Case | Part | Why |
|---|---|---|
| plate | 100 × 60 × 10 box − 4 through holes Ø8 | the most common cut |
| bracket | L from two boxes sharing faces, + a Ø10 cross hole | coplanar union, then a cut |
| bracket-touch | a box standing on another box's top face | **what every "extrude on a face" makes** |
| bracket-inset | upright inside the base outline, no coplanar faces | union without coincident faces |
| shaft / shaft-bore | flanged shaft revolved through / off the axis | revolve |
| tee | two Ø20 cylinders crossing at right angles | curved × curved intersection |
| fillet-1, chamfer-1 | one edge of a 50 mm cube, r / d 5 | the simplest round |
| fillet-top4 | four top edges, vertical edges sharp (mitred corners: r³(5/3 − π/2) each) | a chain of fillets |
| fillet-plate-hole | the plate's four top outer edges, r 2, after the holes | fillet after a boolean |

## Results

Volume error against the closed form; "fails" = the kernel returned no solid. OCCT reproduces every closed form to all printed
digits, which checks the expectations.

| Case | OCCT 8 (wasm, Node) | manifold 3.5 (64 segments) | truck 0.6 native | monstertruck 0.4.1 native |
|---|---|---|---|---|
| plate | 0 %, 97–139 ms | 0.006 %, 44–51 ms | 0.007 %, **6.0 s** (10.6 s as wasm); mesh not closed at tol 0.01 | fails at tol 0.01/0.05/0.1; at 0.001: 0.0003 %, **8.7 s** |
| bracket | 0 %, 37–57 ms | 0.002 %, 5 ms | **fails** (any tol) | **fails** (any tol) |
| bracket-touch | 0 %, 4–9 ms | 0 %, 0.3–7 ms | **fails** (any tol) | **fails** (any tol) |
| bracket-inset | — | — | 0 %, 1 ms (4 open mesh edges) | 0 %, 3 ms |
| shaft | 0 %, 5–8 ms | 0.16 %, 4 ms | 0.04 %, 2 ms | 0.04 %, 19 ms |
| tee | 0 %, 28–47 ms | 0.15 %, 13–17 ms | **panics** / fails (any tol) | **fails** (any tol) |
| fillet-1 | 0 %, 1–37 ms | — | no fillets | 0.0003 %, 19 ms |
| chamfer-1 | 0 %, 4 ms | — | no chamfers | 0 %, 5 ms |
| fillet-top4 | 0 %, 14 ms | — | — | **fails** ("NotConnected") |
| fillet-plate-hole | 0 %, 73 ms | — | — | **fails** (the holes fail first) |

STEP output (read back by OCCT's STEPControl_Reader + BRepCheck_Analyzer):

| File | Read | Valid | Volume |
|---|---|---|---|
| truck plate | yes | yes | 0.024 % off (intersection curves are fitted approximations) |
| truck shaft | yes | **no** | 0.016 % off |
| monstertruck shaft | yes | **no** | exact |
| monstertruck fillet-1 | yes | yes, but **a shell with zero volume** (not written as a closed solid) |

Download size: OCCT 23.0 MB (7.2 MB gz); truck spike 1.5 MB (0.40 MB gz); monstertruck spike 2.8 MB (0.72 MB gz). Both Rust
builds pull wasm-bindgen imports in places (time, random numbers, `self`), so a real build needs wasm-bindgen glue; not a blocker.

### What the numbers say

- **Booleans are the blocker.** A feature standing on another feature's face is a coplanar union. That is the single most common
  operation in PartCraft, and neither Rust kernel can do it at any tolerance. Curved-curved intersections (the tee) fail too.
- **Speed.** Where truck's booleans work they are 40–100× slower than OCCT (4 holes: 6 s native, 10.6 s in wasm, against 0.14 s).
  A typical part rebuilds tens of booleans on every edit.
- **Fillets.** truck has none. monstertruck rounds or chamfers one edge exactly, but fails on a chain of edges, which is what
  people pick.
- **Licences are fine:** both are Apache-2.0 (not dual MIT, as the plan said), and their dependency trees are permissive.

## Every OpenCascade call, by feature

13 modules, ~4,700 lines, ~400 call sites on about 90 OCCT classes. The mesh kernel (`kernel.js`, manifold-3d) already builds
the features marked ✓.

| Feature / service | OCCT classes | Mesh kernel today | Mesh path for 0.4 (K items) | cc-brep size (corrected days) |
|---|---|---|---|---|
| Extrude (blind, mid, through), revolve, hole, patterns, mirror, reference geometry | MakePrism, MakeRevol, Fuse/Cut/Common, Transform | ✓ faceted | — | prism/revolve 1; **booleans on analytic surfaces incl. coplanar 8–10** |
| Extrude up to / next / vertex / offset, taper | MakeHalfSpace + Common, DraftAngle | partly | refuse "next" on curved, taper via K.5 draft | 1 |
| Fillet (constant, r1→r2 law) | BRepFilletAPI_MakeFillet | refused | **K.4** approximate on straight edges | 6+ (rolling ball, vertex blends) |
| Chamfer (two distances, distance + angle) | BRepFilletAPI_MakeChamfer | refused | **K.4** | 2 |
| Shell | MakeThickSolid | refused | **K.5** approximate | 5 |
| Draft | DraftAngle | refused | **K.5** planar faces | 2 |
| Sweep (orientations, scale law) | MakePipeShell, Law_Linear | refused | Not built yet | 3 |
| Loft (+ rails) | ThruSections (+ our Gordon) | refused | Not built yet | 2 |
| Surfaces ×9 (Form, Patch, loft surface, stitch, thicken, offset, extend, trim, Gordon) | MakeFilling, Sewing, MakeOffsetShape, Splitter, B-spline surfaces | refused | Not built yet (Form/Gordon math is ours; only the B-rep step is OCCT) | 8+ |
| Bodies ×4 (combine, move, scale, path pattern) | booleans, Transform, gtrsf, CompCurve | refused (one solid) | possible on manifold (several meshes) — not in the K list | 1 |
| Sheet metal ×2 + flat pattern | Prism, Box, Fuse, UnifySameDomain, adaptors | refused | Not built yet | 2 |
| Rib | Prism, DistShapeShape, Cut | refused | possible on manifold (rays to the walls) — not in the K list | 1 |
| Import STEP | STEPControl_Reader, Sewing | refused | **Not built yet** (needs an exact kernel) | 3 (reader) |
| Export STEP (+ assembly XCAF names/colours) | STEPControl_Writer, XCAF | faceted AP242 already exists (`export.js stepFaceted`, "STEP (faceted)") | **K.6**: make it the STEP when OCCT is gone; AP214 too | 1 (exact writer) |
| Drawings | HLRBRep_Algo | facets, no sections | **K.3** feature edges + depth test | 3 (exact HLR) |
| Measure (distances, radii, mass) | DistShapeShape, GProp, Bnd | mesh numbers | mesh numbers, labelled | 1 |
| Named faces/edges for picking | ShapeHasher, explorers | none | **K.2b (proposed):** faces and edges recovered on the mesh (below) | (inside the kernel) |
| **Workspaces: Simulation (static, modal, buckling, thermal), Flow, Generative design, Manufacture** | none directly: they read the exact kernel's **named face records** (`regen.faces`: type, plane/cylinder data, area, name) and edge table, and refuse without them (`sim.js`, `flow-study.js`, `ws-manufacture.js`, `ws-generative.js`) | **refused** | **K.2b (proposed)** brings them back on the mesh kernel | — |

**Found after the first draft of this report: four workspaces depend on the exact kernel too.** Simulation, Flow, Generative
design and Manufacture never call OpenCascade themselves, but they need its face records (which face is a plane or a cylinder,
its axis and radius, its stable name for loads and supports, and the edge table CAM snaps to). The mesh kernel hands them
none, so on the mesh kernel alone they refuse ("needs the exact kernel"). Mesh-only PartCraft therefore loses much more than
fillets. **K.2b (built 2026-10-13, 0.7 d; `meshfaces.js`, `test-meshfaces.mjs`): the workspaces work on the mesh kernel again.** The plan as proposed: give the mesh kernel named faces and edges. manifold-3d carries a
per-triangle `faceID` through every boolean; kernel.js can stamp each tool face with the same name brep.js gives it
(`<feature>.side:<sketch entity>`, `.start`, `.end`, `@pattern#i`) and an exact surface record taken from the sketch, not
fitted (a plane, or a cylinder / cone / torus from a line, arc or circle and the extrude or revolve). The workspaces then get
the records they read today, and K.4 gets the edge picking it needs. Without K.2b, 0.4 PartCraft is a sketch-and-solid
modeller with scripts.

**cc-brep total: about 50–60 corrected days** before it matches today's OCCT feature set, with booleans (8–10) as the gate:
nothing else is worth starting until coplanar and curved booleans pass this spike's parts. That is several rounds, not one.

## Options scored

| | (a) truck / monstertruck in WASM | (b) our own cc-brep in JS | (c) mesh kernel only for 0.4 |
|---|---|---|---|
| Licence | Apache-2.0 ✓ | Apache-2.0 ✓ | Apache-2.0 ✓ (manifold) |
| Booleans PartCraft needs | **fail** (coplanar, curved) | to be built (8–10 d) | ✓ (faceted, 0.002–0.16 % volume) |
| Fillet / chamfer | none / one edge only | to be built (8+ d) | approximate (K.4) |
| Speed | 40–100× slower than OCCT | unknown | as fast as OCCT or faster |
| Exact STEP | writes it, two of four files invalid | to be built | faceted only (K.6) |
| Workspaces (simulation, flow, generative, CAM) | would need the same face records | yes, once built | only with K.2b |
| Effort for 0.4 | K.7 adapter 2 d, then still blocked | 50–60 d | K.2–K.6, ~8.5 d (less: a faceted STEP writer exists) + K.2b 2–3 d |
| **Verdict** | **no-go now**; re-test each round | **go for 0.6+**, booleans first | **go for 0.4** |

K.7 ("if K.1 says go on truck") is therefore not done.
