# PartCraft ⇄ SolidWorks exchange

**Not yet tested in SolidWorks.** SolidWorks is Windows-only and licensed; nothing here has been run in it. Both
macros were written from the SolidWorks API Help and are checked for structure by `bin/test-partcraft-sw.mjs`.

## Forward: PartCraft → a native SolidWorks part

PartCraft's Export › "Macro for SolidWorks (.swb)" (or `swmacro.js` `partToSwb(part, {regen, regenAt, name})`)
writes a plain-text VBA macro. In SolidWorks: Tools › Macro › Run, pick the `.swb`. It makes a new part from the
default part template, sets MMGS, adds the global variables, rebuilds every feature (one Sub per feature) with its
sketch, relations and dimensions renamed to PartCraft's ids, adds the equations, suppresses what is suppressed, puts the
rollback bar where it was, and compares SolidWorks' body (volume + box) with PartCraft's after every solid feature,
flipping a feature's direction once when they differ. Every step is logged to `<part> macro log.txt` next to the macro.
The API members it calls, with argument counts, are listed at the top of `swmacro.js` (`SW_API`).

Export › "STEP for SolidWorks (named, AP214)" (`brep-xcaf.js`): the solid through OpenCascade's XCAF document — product
name, millimetres, the part colour, Y up.

## Backward: SolidWorks → PartCraft

`CadCraftExport.swb`: open a part in SolidWorks, Tools › Macro › Run, pick this file. It writes
`<part>.cadcraft-sw.json` next to the part (format `cadcraft-sw-export` v1, docs/PARAMETRIC-SPEC.md: mm, degrees) and
changes nothing. PartCraft's Open rebuilds it with `swimport.js` `fromSwExport(json, {oc})` and shows a report;
CadCraft's Open takes its sketches.

Read: sketches (points, lines, arcs, circles, relations, dimensions, plane), boss/cut extrudes (blind, through all, mid
plane), revolves, fillets and chamfers (a point on each face they made), shells (a point on each removed face), linear
and circular patterns (direction from an edge or reference axis), mirrors of features, global variables, equations, the
mass-properties volume. Everything else is written as `"type": "unsupported"` with the reason.

Assumptions that a first run in SolidWorks must confirm (each is noted in the macro):
- `swConstraintType_e` numbers in `RelName` (4 horizontal, 5 vertical, 6 tangent, 7 parallel, 8 perpendicular,
  9 coincident, 10 concentric, 11 symmetric, 12 midpoint, 14 equal, 17 fix, 25/26 horizontal/vertical points,
  27 collinear); unknown ones are written as `"other"` with `"swType"`.
- `Dimension.GetType` = 2 for angular dimensions (`swDimensionParamType_e`).
- Late-bound sketch segments answer `SketchLine`/`SketchArc` members.

## Fixtures

`fixtures/*.cadcraft-sw.json` are **hand-written** (not produced by SolidWorks): a block with four fillets, the Catalog
flange (revolve, a cut on its top face, circular pattern, equations) and a ring (revolve on the Right plane, chamfer,
an unsupported sweep). `bin/test-partcraft-sw.mjs` rebuilds each to its exact volume.
