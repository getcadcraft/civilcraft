---
title: Open a DWG or DXF as linework
summary: Open a drawing's linework on the plan, layer by layer, use its contours, 3D polylines and closed outlines for the surface, and turn its point blocks into survey points.
section: tasks
order: 22
keywords: dwg, dxf, cad, drawing, linework, contours, breaklines, boundary, polyline, 3d polyline, layers, base map, topo, survey drawing, blocks, block references, survey points from blocks, attributes, point blocks, insertion point
---

A topographic survey often arrives as a drawing: contours as polylines at their elevation, breaklines as 3D polylines, the site outline as a closed polyline. CivilCraft opens the drawing's **model space** as layers on the plan, and can turn those lines straight into the surface.

## Open the drawing

1. Click {{ui:Linework}} in the **Surface** group (or {{ui:Open}}, or drop the file on the plan) and choose a `.dwg` or `.dxf` file. The drawing is read on this computer; nothing is uploaded. DWG from 2000 to 2018 and ASCII DXF are read.
2. The **Linework** dialog lists the drawing's layers that hold lines, closed shapes or points, and whether they have **elevations**. Layers that are off in the drawing start unticked. Text, hatches, dimensions and other objects that are not linework are counted and left out (the dialog says which).
3. Check **Drawing units**. When the drawing says its units, CivilCraft converts them into the project's (millimeters into meters, meters into feet, inches into feet). A drawing in feet is read as US survey feet without scaling: the two differ by 2 parts per million, and scaling state plane coordinates by that would move them by feet. When the drawing does not say its units, its numbers are read in the project's units; pick the right units in the list if they are not.
4. In **Use for the surface**, choose what each layer gives the surface (or leave **Only show it**). Layers named like contours (TOPO, CONT, CNTR) that have elevations start as breaklines.
5. Click {{ui:Add}}. The layers appear under **GIS layers** in the left panel; each use is put into the surface. Every part is a step of its own: {{key:Mod+Z}} takes them back one at a time.

## What each kind of layer can give

| The layer holds | Use for the surface |
|---|---|
| Contours (polylines at an elevation) | Breaklines at the lines' own elevation, or at the ELEV field |
| 3D polylines | Breaklines at their own elevations |
| A closed outline | The surface boundary (the largest closed shape, or the one you selected) |
| Points with an elevation | Survey points, described with the layer name |
| Lines at elevation 0 (plan linework) | Nothing: it stays on the plan as a base drawing |

Later, use {{ui:Use for the surface}} in the layer's menu under **GIS layers** to do the same for a layer you only showed.

## Survey points from blocks

Survey drawings often carry their points as blocks: a small symbol at each shot, with attributes for the point number, the description and the elevation. When the drawing has block references, the dialog has a **Survey points from blocks** section:

1. Tick the blocks to take (the table says how many references each has, on which layers, and which attributes), or tick layers to take every block reference on them.
2. Choose where each point's **number**, **description** and **elevation** come from: an attribute, the block's or the layer's name, the next free numbers, or the insertion point's Z. CivilCraft starts on the likely attributes (PT, DESC, ELEV and similar), and takes the elevation from an attribute only when the blocks sit at zero.
3. Untick the linework layers if you only want the points, then click {{ui:Add}}.

Each reference becomes one survey point at its insertion point. Only references placed in model space count; blocks nested inside other blocks do not. Numbers already in the project, or used twice in the drawing, get new numbers after the highest, and an elevation attribute that is not a number leaves that point without an elevation; the status line counts both. The drawing is never changed, and each point remembers its block: its Properties show **From block** with the block, layer and handle. Adding the points is one step, so {{key:Mod+Z}} takes them all away.

## How the drawing is read

- Arcs, circles, ellipses, bulged polyline segments and splines become short straight pieces (every 5° at most).
- Block references are drawn where they are placed, nested blocks too; what a block holds on layer 0 takes the reference's layer.
- Objects drawn in another plane (a different extrusion direction) are placed in world coordinates.
- Each object gets three fields: LAYER, TYPE (the object type) and ELEV (its elevation when all its points share one).
- Coordinates are taken as they are: the drawing must use the same coordinates as the project (for example the same state plane zone). Linked drawings (xrefs) are not opened: open them on their own.

:::tip
A contour drawing gives the best surface with a few spot elevations on hilltops and in hollows, where contours alone leave flat triangles. Add them as survey points, or from a points layer in the drawing.
:::
