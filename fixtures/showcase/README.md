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
- `cadcraft-sample-house-rev-B.pdf` / `cadcraft-sample-house-rev-C.pdf` (4 ARCH D sheets each, CadCraft 0.6 plot; CC0; video
  07): the sample house published from `/use/cadcraft` (Plot › All sheets in one PDF) as "REV B" (dated 2026-10-05), then
  again as "REV C" (2026-10-19) after three changes on A-101: the bath wall moves 2'-0" into Bedroom 2 (bath door with it),
  a closet ("CL") is added in Bedroom 1, and Bedroom 2's south window is removed. Made once by
  `videos/07-compare/make-revisions.mjs` (refuses to overwrite). For MarkupCraft compare and slip-sheet shots.
- `bimcraft-clash.ifc` (IFC4, ~1 MB; CC0; videos/06-clash, 2026-10-19): `bimcraft-house.ifc` opened in /use/bimcraft 0.6,
  Draw › Level 2 › Build › Framing › one click on the roof (stick framing: 173 members, 37 beams incl. ceiling joists), then
  Build › Pipe, 3" domestic cold water at 70 mm above Level 2, three clicks (1500,9500) → (12500,9500) → (12500,6500) mm,
  Enter, Save as IFC. Made once in the app. Clash check Pipe segments against Beams (0.01 m) → 28 clashes, each pipe ×
  ceiling joist. For clash / BCF / 4D shots.
- `civilcraft-sample-site-nad27.csv` (CC0; video 11): CivilCraft's built-in sample site (`civilcraft/0.6/sample-site.csv`, NAD83 /
  California zone 6 ftUS, EPSG:2230) converted by PROJ 9.5.1 to NAD27 / California zone VI (EPSG:26746) through PROJ's own
  NADCON5 pick (NAD27 to NAD83 (7), `us_noaa_nadcon5_nad27_nad83_1986_conus.tif`); elevations unchanged. 276 points. Made
  once by `videos/11-coordinates/make-fixtures.py`. Shots: open in /use/civilcraft, GIS › Coordinates → 26746, add the grid
  file, convert to 2230.
- `civilcraft-sample-lidar.laz` (CC0; video 11): a made-up LiDAR scan over the same site, LAZ 1.4 format 6, NAD83 / UTM 11N
  (EPSG:26911, metres, no vertical unit), 160,000 points (ground 141,710 from the sample's survey points, low/high
  vegetation, unclassified). Same script. Opens in CivilCraft through the LiDAR import dialog (pick Meters).
- `modelcraft-house.modelcraft` (CC0; 0.7 RN.1, session `render`): the small house of ModelCraft's render tests — slab, walls
  painted `mat:brick-red`, a red gable roof, a window set to the Glass look, a door, a tree — with the Render dialog's settings
  (High quality, Good) saved in it. Made once by `node tools/modelcraft-test/browser-render.mjs` (§ WebGPU; it writes the file
  only when it is missing). Shots / video: open it in /lab/modelcraft, Export › Render a picture… › Render.
- `modelcraft-materials.modelcraft` (CC0; 0.7 MT.1/MT.2, session `materials`): the same house with four node materials of its own —
  Brick wall (Bricks + noise, bump from the bricks' height), Oak floor (Tiles × Wood planks, a light clear coat), Slate roof (Tiles +
  noise, bump), Painted door (Wood, clear coat) — painted on Walls, Slab, Roof and Door; all box-mapped. Made once by
  `node tools/shading-test/make-showcase.mjs` (refuses to overwrite; `--check` compares). Shots / video: open it in /lab/modelcraft,
  Workspace › Shading, pick a material in the panel.
- `modelcraft-print.modelcraft` (CC0; 0.7 LC.21, session `print-07`): six placements in a row, millimetres — Bridge (two legs and a
  span 30 mm up), Bracket (a 0.6 mm fin on a 4 mm base), Ball (a 40 mm sphere), Box + Round hole (a Beginner box with a round hole
  through it, not grouped), Broken box (a 30 mm cube with no bottom and its top turned over). Made once by
  `node tools/modelcraft-test/make-print-showcase.mjs` (refuses to overwrite; `--check` compares). Shots / video: open it in
  /lab/modelcraft, Zoom extents, select a part, Export › Check for 3D printing… › Print tools: Supports preview on the Bridge, Wall
  thickness on the Bracket, Hollow on the Ball, Repair on the Broken box; the Beginner style's Group on the Box and the hole.
- `cadcraft-pdf-underlay.dwg` + `kitchen-plan-sheet.pdf` (0.7, session cad-bugs): a DWG with the kitchen plan PDF attached as an underlay at true size. Open the DWG, type `PDF` and pick `kitchen-plan-sheet.pdf` (the drawing keeps only the file's name) to show it.
- `partcraft-bracket.stl` (binary STL, ~27 KB; CC0, ours; 0.7 D7.49, session part-08): a 60 × 40 × 20 mm bracket (Z up) with two
  Ø10 through holes and a 20 × 20 × 10 boss, one triangle of its top left out on purpose. Made once by
  `node tools/partcraft-test/make-mesh-showcase.mjs` (refuses to overwrite; `--check` compares). Shots: open it in /lab/partcraft
  (Open or drop): the dialog says "1 hole filled" and that it closes; Open as a body → Imported1, its flat faces to sketch on.
- `partcraft-four-bar.partcraft-asm.json` (PartCraft assembly; CC0, ours; 0.7 D7.40, session part-08): a crank-rocker four-bar
  linkage of flat bars (ground 100, crank 30, coupler 110, rocker 80 mm between hole centres), four revolute joints, saved closed
  with the crank at 60°. Made once by `node tools/partcraft-test/make-linkage-showcase.mjs` (refuses to overwrite; `--check`
  compares). Shots: open it in /lab/partcraft, select Revolute1 and drag its Angle slider: the linkage follows.
- `partcraft-frame.partcraft.json` (PartCraft part; CC0, ours; 0.7 D7.50, session part-08): a welded table frame — a 900 × 500 top
  on a plane 750 up and four legs drawn on two front planes — as one Structural member of HSS2x2x1/4, mitred, 6 mm caps on the
  feet; a crossbar sketch (Sketch4) left unticked. Made once by `node tools/partcraft-test/make-frame-showcase.mjs` (refuses to
  overwrite; `--check` compares). Shots: open it in /lab/partcraft, select Member1 (the cut list is in the panel), tick Sketch4.
- `step-plate-and-pegs.step` (STEP AP214, ~23 KB; CC0, ours; 0.7 D7.26, session part-08): a 100 × 40 × 10 mm plate with two
  pegs placed on it (one part placed twice, one turned 30°), written by OpenCascade as a black box — a copy of
  `fixtures/step/assembly.step` (`tools/step-test/make-fixtures.mjs`). Shots: open it in /lab/partcraft (Open: "AP214 file: 2 solids…
  3 parts placed in the file come in where they stand", Open as a body), Import it in /lab/modelcraft (three meshes in a group
  "step-plate-and-pegs") and Open it in /lab/bimcraft (three elements on the storey "STEP").
- `partcraft-four-bar.partcraft-manual.json` (PartCraft manual, format partcraft-manual v1; CC0, ours; 0.7 TP.12, session
  illustrate): a manual of `partcraft-four-bar.partcraft-asm.json` — part numbers FB-100…130 in aluminium, views Assembled
  (balloons 1–4, the parts list), Exploded (bars pulled out along the pivots, trails, a Crank label, a turn arrow) and Pivot detail
  (the magnifier), a two-step instructions document and an animation (Assembled → Exploded as camera stops). Made once by
  `node tools/partcraft-test/make-illustrate-showcase.mjs` (refuses to overwrite; `--check` compares). Shots: /lab/partcraft,
  Workspace › Illustrate, Open, this file; click the views; Export › PDF or the interactive file. The views have no thumbnails
  until Update view is clicked on each (made in Node, no renderer).
- `civilcraft-site-massing.civilcraft.json` (CC0; 0.7 LC.1, session `massing`): "Hillside lot study", CivilCraft's sample site (276 points, US survey
  feet) with the project's coordinate system SET to the one its numbers are in, NAD83 / California zone 6 ftUS (EPSG:2230) — the garden file has
  none, and no owner site file with one was in `testfiles/`, so this one is built. A 180 × 200 ft lot (the south line is the street), Block A (a bar,
  3 floors, stepped base) and Block B (an L, 2 floors, podium base, 5 ft into the front setback on purpose, so one mass shows a failed check), and
  zoning limits that are EXAMPLES typed for the demonstration, not any city's rules: setbacks front 25 / sides 10 / rear 20 ft, height limit 40 ft, sky
  plane 20 ft + 2 : 1 from the street, floor area ratio 0.9, coverage 45 %, envelope shown. Made once by `node tools/massing-test/make-showcase.mjs`
  (refuses to overwrite without `--force`). Shots: open it in /lab/civilcraft; Building masses › Sun hours, Develop in BimCraft, 3D with Sun.
- `civilcraft-power-lines.civilcraft.json` (CC0; 0.7 Track PL): "Village LV line study", CivilCraft's sample site (276 points, US survey
  feet, EPSG:2230 set) with a low-voltage bundled cable on four 11 m wood poles across the slope (suspension clamps; anchor clamps and a 30 kN
  stay on the dead-ends and the angle pole), a road crossing, a pole-mounted transformer as the 400 V source and an underground cable to a
  street cabinet with a 40 kW load. Cold-climate EXAMPLE rule set (no standard's numbers); every check passes. Made once by
  `node tools/powerline-test/make-showcase.mjs` (refuses to overwrite without `--force`). Shots: open it in /lab/civilcraft; Power lines
  workspace, select the line, Profile; drag a pole's top down to see a clearance fail; More › Sheets and report.
- `civilcraft-garden.civilcraft.json` (CC0; 0.7 LD.9, session `landscape`): "Hillside garden", CivilCraft's sample site (276 points, US
  feet) with a Landscape workspace garden: a 50 × 30 ft terrace paved in herringbone falling 1.5 % to a drain, a 3 ft retaining
  wall above it with steps and a path up the slope, a kerb, two olives, a cork oak and a Judas tree, a herb bed (lavender 50 %,
  rosemary 30 %, sage 20 %), a box hedge, a swale, a play mound shaped by a spot elevation 2.5 ft up, and irrigation (point of
  connection at 60 psi / 20 gpm, two valves of four 15 ft sprays each: 14.3 gpm, ~39 psi at the supply, no problems). Made once
  by `node tools/landscape-test/make-showcase.mjs` (refuses to overwrite without `--force`). Shots: open it in /lab/civilcraft,
  Surface › More › Landscape workspace, Fit; Grading checks › Slope analysis for the grading shot; Irrigation › Check the system…
  for the zone table; Landscape › More › Landscape sheets… for the PDF set.
- `cadcraft-acis-solids.dwg` (DWG 2018, millimetres; CC0, ours; 0.7 D7.25, session `acis`): seven 3D solids in a row, each on its
  own layer — a box with a round hole, a cylinder, a cone, a frustum, a sphere, a hemisphere and a torus — our hand-made SAT
  (`tools/acis/fixtures.mjs`) saved by the ODA File Converter, so the file holds the SAB its modeler wrote. Made once by
  `node tools/acis/make-showcase.mjs` (refuses to overwrite without `--force`). Shots: open it in /lab/cadcraft, the 3D tab,
  Fit (the solids are read-only; the command line says 7 drawn); in /lab/modelcraft, File › Import this file (each solid its own group).
- `takeoffcraft-kitchen-bid.takeoff.json` (CC0, ours; 0.7 LC.13, session `bidding`): a small kitchen job on `kitchen-plan-sheet.pdf` for the bid screenshots and video — gypsum board 410 SF, paint 410 SF and rubber base 96 LF (09), 14 base cabinets and 32 LF of shelving (06), a typed slab patch (03) and a typed mobilization (no number): four packages in Export › Bid packages and leveling…, total $3,468.00 priced by hand. Made once by `node tools/takeoffcraft-test/make-bid-showcase.mjs` (refuses to overwrite; checks the total). Shots: open it in /lab/takeoffcraft, then File › Open plans and choose `kitchen-plan-sheet.pdf` (matched by hash); the Send for bids dialog, Get prices (against a stand-in or a lab account that can send) and "Use" on a bid are the scenes.
- `bimcraft-mep-plant-room.ifc` (IFC4, ~220 KB; CC0, ours; 0.7 LC.9, session `mep-07`): "Plant room", a 12 × 8 m room on two levels
  with an air handler (AHU-1) feeding two ceiling diffusers through a 600 × 400 supply main and Ø250 branches, a return grille
  ducted back to it, a chilled-water pump (CHWP-1) piped to the coil in steel cut into spools (CHW-1-S01 …), the coil's return leaving
  through the south wall (an opening to list), a boiler, a water heater and a tank with open ports for the Connections check. Every
  run is fixed to the ports it starts or ends on. Built once by `node bin/test-bimcraft.mjs --mep07 --showcase` (refuses to
  overwrite without `--force`). Shots: open it in /lab/bimcraft, Draw on, Level 1 in plan beside the 3D view; Build › Check
  connections; Clash check › Pipes and ducts × structure / Openings needed; a spooled pipe's Properties › Spool sheets (PDF).
- `bimcraft-house-ops.ifc` (IFC4, ~720 KB; CC0, ours; 0.7 LC.12 / LC.20, session `bim-ops`): `bimcraft-house.ifc` with its site
  placed in Denver (39° 44′ 21″ N, 104° 59′ 3″ W, 1609 m), windows W1 (picture), W2 and W5 tracked as assets — maker, model, serial,
  warranty, service life, a maintenance record (W1's next service 3 May 2026: overdue), W1's documents (a care guide by web address,
  a photo by file name), sensor limits 5–28 °C on all three — and the Live feed settings (ws://localhost:9001/mqtt,
  `site/{tag}/temperature`). Made once by `node bin/test-bimcraft.mjs --ops --only showcase` (skips when it exists).
- `bimcraft-house-readings.csv` (CC0, ours, made by the same run): a day of glass-surface readings for W1, W2, W5 every half hour, 16:00
  on 20 July to 15:30 on 21 July 2026; W1's latest (the afternoon sun) is over 28 °C. For a live demo: `node tools/bimcraft-test/ops-broker.mjs --port 9001 --tags
  W1,W2,W5` (127.0.0.1 only; publishes every 2 s), then Assets › Live feed › Connect.
- `3dm-sampler.3dm` (version 8 layout, ~98 KB; CC0, ours; 0.7 SU.810, session `3dm`): every kind cc-3dm reads, made with
  `tools/3dm/oracle.py make` (rhino3dm, MIT, test-only) and copied from `testfiles/generated/3dm/samples-v8.3dm` — layers Red,
  Hidden (off) and Red::Child; a coloured mesh; NURBS, line, polyline, circle, arc and poly curves; a box, sphere, capped cylinder,
  NURBS patch, cone, half torus, trimmed disc and square (planes and revolutions, no saved meshes: tessellated by cc-3dm); a box and
  an extrusion carrying saved render meshes; a tube (extrusion with a hole); a box coloured by its material; blocks Bolt and Pair
  (Pair holds two Bolts, placed once turned 90°); a point, a point cloud and a text dot (left out and said). Shots: /lab/modelcraft,
  File › Import this file (the status line lists saved-mesh vs tessellated faces and what was left out; Tags shows the layers);
  /lab/partcraft, Open the same file (one body, does not close: the open surfaces are in it).
- `partcraft-plate.3dm` (version 8 layout, ~14 KB; CC0, ours; 0.7 SU.810, session `3dm`): a 120 × 80 × 10 mm plate (an
  extrusion with two Ø 20 holes) with a Ø 30 × 25 mm boss (a capped cylinder polysurface) on it; no saved meshes, so cc-3dm
  tessellates both. Made once by `python -I tools/3dm/oracle.py plate fixtures/showcase/partcraft-plate.3dm` (the 3dm oracle venv).
  Shots: /lab/partcraft, Open it: the dialog says 2 objects, tessellated by PartCraft, closes, 2 pieces; Open as a body, then
  sketch on the plate's top face and cut a slot.
