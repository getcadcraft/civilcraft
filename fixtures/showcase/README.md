# Showcase models (ours, CC0) — open these for screenshots instead of rebuilding demo content

- `bimcraft-house.ifc` (IFC4, ~700 KB): "Maple Street house", drawn in BimCraft 0.5 via File › New building (2 levels): L-shaped one-story ranch, 2×6 exterior + 2×4 interior walls, 5 rooms, entry door with sidelites, garage door, French doors, 4 interior doors, picture + 8 double-hung windows, 6/12 hip roof with fascia/soffit (on Level 2), 3/12 porch roof plane on 3 posts, slab-on-grade foundation, terrain from a made-up survey with building pad, driveway, walk and porch patio; walls painted Red brick, roofs Gray asphalt shingles.
- Opens in BimCraft (`/use/bimcraft`, 0.5+): Choose a file. Shot used: 1920 × 1080, model theme, signed out, 3D view framed on the walls + roof (`viewer.keyBounds`) from direction (0.7, 0.32, 1) (south-east, viewer Y up, +Z = south) at ~0.97 × the fit distance, target 10 % of the height below centre; picture window picked (Properties), left panel scrolled to Model tree.
- `cadcraft-sample-house.dwg` / `.dxf` and `cadcraft-sample-asbuilt.dwg` / `.dxf` (CadCraft, 0.6 DF.9; CC0): byte-identical
  copies of CadCraft's sample drawings (`public_html/assets/apps/cadcraft/dev/samples/`, made once by
  `tools/cadcraft-test/make-samples.mjs`). Shots: open `cadcraft-sample-house.dwg` in /lab/cadcraft (paper theme), sheet tab
  **A-101 FLOOR PLAN** for a sheet, or the Model tab after Extents for the whole set; `cadcraft-sample-asbuilt.dwg`, sheet
  **AB-101 AS-BUILT PLAN**, for scan points, revision clouds and dimensions in two units.
- `bimcraft-house-turned.ifc` (IFC4, ~700 KB; CC0; 0.6 bim-fixes_PART_2, DC.57): the same house with the whole site turned 30°
  and moved to map-sized coordinates (417 598 m E, 78 717 m N), as a model on survey / shared coordinates arrives. Made once by
  `node tools/bimcraft-test/make-turned-showcase.mjs` from `bimcraft-house.ifc` (only the site placement #19 changes; `--check`
  compares). Shots: open it in /lab/bimcraft; with Settings › BimCraft › A building turned in its site = Square to the
  building (the start) Top and the section box run along its walls.
