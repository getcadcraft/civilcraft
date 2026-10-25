# Spike 0.4 P12 — bonded assemblies in simulation: GO (for 0.5), with node-to-surface ties first

Run: `node tools/partcraft-test/bonded-spike/spike.mjs [--h 5]` (Node, ~1 min). Not app code.

## What was tried

Each part meshed on its own (tetmesh.js T10, its own element size, so the meshes do not match at the joint) with its own
E; the slave part's interface nodes tied to the master part's interface faces by **exact master–slave elimination**,
u_s = Σ Nᵢ(T6) u_m (T6 shape functions at the slave node's position on the master face), assembled as Tᵀ K T with
tetfea.js's `t10Stiffness`, solved by Jacobi-CG. No penalty (no conditioning trouble).

## Results (h 5 / 3.85 at the joint)

| Case | Result |
|---|---|
| A1 one material, two non-matching bars, uniaxial | tip δ off by 2.5e-4 (relative); worst nodal error 1.47e-4 mm at the joint; **h 3.5: 4.19e-5** (≈ h³) |
| A2 steel + aluminium, ν 0.3 | δ within 1.0e-3 of the 1-D formula (the joint really holds back the different Poisson contractions) |
| A3 steel + aluminium, ν 0 | 1.7e-4 (the tie error again) |
| B cantilever: two bonded halves vs one solid | tip 2.859212 vs 2.858700 mm: **0.018 %** (the mesh itself is 0.72 % off Timoshenko) |
| Cost | 85–313 tied nodes; assembly ~1 s, solve 3–35 s with the spike's naive Jacobi-CG (the app's IC(0)/AMG will be far faster) |

The tie reproduces the exact field to 1e-17 and the one-solid run is exact to 1e-14, so the A1 error is the known
**node-to-surface inconsistency**: the slave's quadratic trace meets the master's only at the nodes, and the traction does
work on the gap between nodes. It falls like h³. A **mortar** tie (the constraint integrated over the interface) passes
the patch test exactly; it is the follow-up, not a prerequisite.

## Go: what it takes in the app (estimate 5–6 days)

1. Per-element material in tetfea.js `assemble` / postprocess (stress and mass with each part's E, ν, ρ): 1 d.
2. Several meshes in one model: node offsets, the tie elimination in the CSR pattern (master–master couplings), IC(0)/AMG
   on that pattern, results split back per part: 1.5 d.
3. Find the bonded faces: coincident opposite faces between placed instances (rigid joints, or touching faces within a
   tolerance), with the instances' transforms: 1 d.
4. UI: a Simulation study on an assembly (which parts, materials from the BOM, bonded pairs listed), results per part: 1.5 d.
5. Tests: the patch test (A1 to 1e-4 at h 5, falling with h), two materials against the 1-D formula with ν 0, the
   cantilever against one solid, then a mortar tie to make A1 exact (+1–2 d, optional).

Not covered: sliding / frictional contact, separation (nonlinear), bolted joints with preload.
