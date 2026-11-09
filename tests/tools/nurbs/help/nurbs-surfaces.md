<!-- SPDX-License-Identifier: Apache-2.0 -->
# Freeform surfaces (NURBS)

*Draft for ModelCraft and PartCraft help (0.8 SU.747b, session `nurbs`). Each app's owner copies it into the app's help folder when the
Surfaces tools are mounted, and adjusts the menu names.*

The Surfaces tools make smooth curves and surfaces of the kind used for car bodies, product shells and boat hulls: NURBS, the same maths
other surface modellers use. Everything is measured on the exact surfaces, never on the triangles you see.

## Curves

- **Curve through points** passes through every point you click. **Curve by control points** follows a cage of points instead.
- **Insert knot**, **Raise degree** and **Lower degree** change how a curve is described without moving it (lowering refuses when the
  curve would move more than the tolerance). **Rebuild curve** gives it a new number of control points and says how far it moved.
- **Match curve** makes one curve's end meet another's with G0 (touching), G1 (same direction) or G2 (same curvature too).
  **Blend curve** adds a new curve between two ends, G1 or G2.

## Surfaces

- **Loft** through two or more curves, **Ruled surface** between two, **Extrude curve**, **Revolve curve**.
- **Sweep along one rail** carries a profile along a path without twisting it; **Sweep along two rails** keeps the profile's ends on
  both rails. Sweeps are fitted: the result says how close it stayed to the true sweep.
- **Surface from a curve network** passes through a grid of curves (each one crossing each of the others once).
  **Patch from four edges** fills four curves that meet at their corners.
- **Match surface** makes a surface edge meet a neighbour with G0, G1 or G2; **Blend surface** adds a surface between two edges.
- **Offset surface**, **Extend surface** (the surface carries on as it was going), **Rebuild surface**.

## Checking the quality

The **Shared edges** table lists every edge two surfaces share, with the gap (mm), the angle between them (°) and the curvature jump
(1/mm), and whether that makes it G0, G1 or G2. An edge that is worse than you asked for appears in **Problems** with a **Match** fix.
**Zebra** stripes and **curvature** colours come from the exact surface: stripes that run on unbroken across an edge mean G1; stripes
that also keep their width mean G2.

G0–G2 are measured, at 33 points per edge. **G3 and "class A" quality are not measured** and are not claimed.

## Trim a surface

The **Trim** group cuts a surface without changing its shape: the surface keeps all its control points, and only the part inside the outline is shown, counted and written. **Trim to a rectangle** and **Trim with a circle** work on a share (0 to 1) of the surface in each direction, so they need no picking in the view; **Trim by a curve** takes a closed curve that lies on the surface (it is projected into the surface, and refused in words when it is open or more than the tolerance away). Tick **Cut a hole** to remove the inside of the outline; leave it off to keep only the inside. A surface can have one kept outline and any number of holes; an outline that crosses another is refused. **Remove the trim** shows the whole surface again. The panel's Undo takes a trim back like any other step.

STEP carries the trim as the face's bounds and reads it back. IGES holds the whole patches only: it says so when you save trimmed surfaces.

## Files

Export **STEP** (AP242) or **IGES** with the curves and surfaces exactly as they are (B-spline curves and surfaces, nothing turned into
triangles). Each surface is its own face (with its trim, if it has one): surfaces are not stitched together yet.

## Not built yet

Trimming a surface by another surface, solid Booleans on trimmed surfaces, stitching surfaces into a closed body, thickening, fillets between surfaces, filling
holes with more than four sides, projecting curves onto surfaces.
