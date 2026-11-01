---
title: Plant graphics by scale, your own symbols and 3D plants
summary: How plants are drawn in plan at each drawing scale and level of detail, and how a plant record gets your own symbol (SVG, or a DXF/DWG block) and your own 3D model (OBJ, STL or GLB).
section: tasks
order: 160
keywords: plant graphics, plant symbol, symbol by scale, level of detail, detail level, simple circle, outline, detailed symbol, own symbol, block, svg, dxf, dwg, 3d plant, own 3d model, obj, stl, glb, gltf, tree model, plants in 3d
---

## Plan symbols by scale

Landscape › {{ui:More}} › {{ui:Plant graphics}} sets how plants are drawn in plan. **Automatic, by scale** picks one of three levels from the drawing scale:

- **Simple circle** (coarser than 1:500): a circle at the plant's spread.
- **Outline with centre** (from 1:500 to 1:200): the circle and a small centre cross.
- **Detailed symbol** (finer than 1:200): the record's own symbol if it has one, else the built-in symbol.

Change the two scales with **Simple from 1:** and **Outline from 1:**, or choose one level for every scale. Each sheet set in the Sheets dialog has its own **Plant detail in plan**, so a 1:500 site plan and a 1:100 planting plan can differ. The settings are saved with the project.

## Your own symbol

Pick a plant in the Plants section and press {{ui:Own symbol…}}. It reads an SVG, or a block of a DXF or DWG drawing (when the drawing has several blocks, you choose one). The symbol is fitted to the plant's spread and drawn at the detailed level. It is kept in the project, so the file travels with it.

- An SVG is read for its lines, polylines, polygons, rectangles, circles, ellipses and paths. Scripts, styles, links and images in it are never looked at. Transforms are not applied: you are told when the file has them, so flatten them in your drawing program first.
- Limits: 512 KB of SVG and 2000 shapes. A bigger file is refused with the reason.

## Your own 3D plant

{{ui:Own 3D model…}} on the same record reads an **OBJ**, **STL** or **GLB** file. Then, in Plant graphics, set **Plants in 3D** to **Each record's own model**: every plant of that record shows your model, scaled to its height and spread. Records without a model of their own keep the built-in forms. Choose **Simple masses** for quick views of large sites.

A GLB is read for its shape only:

- Everything the model needs must be inside the .glb file. A model that points at other files (a separate .bin, or images by address) is refused: nothing is downloaded.
- Compressed or packed geometry (Draco, meshopt, quantized positions) is not read. Export without compression.
- Textures and colours in the file are not used: the model is drawn in the plant's own colour. Textures are still checked, and a texture over 4096 pixels a side is refused.
- Limits: a 32 MB file, 50 000 triangles (counting every copy of a part placed more than once), 64 images and 16 MB of images.

Each limit refuses the file with the reason; nothing half-read is kept. One undo step gives the record its symbol or model, and {{ui:Remove own symbol}} or {{ui:Remove own 3D model}} takes it away again.

See [Plant records](topic:plant-records) for the record itself, and [View the site in 3D](topic:site-3d).
