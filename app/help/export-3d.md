---
title: Export the site in 3D
summary: Save what the 3D view shows as a GLB or OBJ file for other 3D programs, in meters with Y up, around a local origin that the file records.
section: tasks
order: 126
keywords: glb, gltf, obj, 3d export, export 3d, model export, game engine, visualization, 3d viewer, meters, y up, origin, local origin, state plane
---

The 3D view exports what it shows as a 3D model another program can open: a 3D viewer, a modeler, a game engine or a visualization tool.

## Export

1. Open the 3D view ({{key:D}}) and choose what shows with {{ui:Show}}. What is hidden is not exported.
2. Click {{ui:GLB}} or {{ui:OBJ}} on the bar.
   The file downloads as "*project name*-3d.glb" or "-3d.obj", and the status bar says the origin.

## What the files hold

| | GLB | OBJ |
|---|---|---|
| Surfaces | Meshes with normals and the band or surface colours | Meshes with normals (no colours) |
| Pipes and structures | Round meshes, problem ones in red | Round meshes |
| Contours, breaklines, alignments, ticks, corridor and pad lines | Lines, each set in its colour | Line records (`l`) |
| Survey points | Points | Point records (`p`) |

Each set keeps its name ("Existing ground", "Pipes", "Major contours" and so on), so you can hide or style it in the other program.

## Units, axes and the origin

- **Meters.** A feet project is converted from US survey feet (1 ft = 1200/3937 m).
- **Y up**, the usual convention for these formats: easting becomes +X, elevation +Y, and northing −Z.
- **True scale.** The vertical exaggeration of the view is not applied.
- **A local origin.** State plane coordinates are millions of feet, too large for the single-precision numbers these formats store, so the file is written relative to a nearby origin: the existing ground's own origin for easting and northing, and its lowest elevation rounded down. The origin, in project units, is recorded in the file: in a GLB as `extras` on the scene and its top node, in an OBJ as a comment line near the top (`# origin easting … northing … elevation …`). To place the model back in project coordinates, add the origin (after converting meters back to feet on a feet project).

## Not built yet

- Exporting the exaggerated view, or exporting in project units instead of meters.
- Textures, a material file for OBJ (.mtl) and per-object properties (names of pipes and structures are only in CivilCraft).
- Exporting the corridor as separate solids, or the profile view in 3D.
