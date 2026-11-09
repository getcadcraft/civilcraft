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
- `modelcraft-split.modelcraft` (CC0; 0.8 SU.929, session `sx-split`): two parts too big for a 220 mm bed, millimetres — Cube (a
  300 mm Beginner box) and Column (a Beginner cylinder 120 mm across, 360 mm tall). Made once by
  `node tools/modelcraft-test/make-split-showcase.mjs` (refuses to overwrite; `--check` compares). Shots / video: open it in
  /lab/modelcraft, select a part, Export › Check for 3D printing… › Print tools › Split for printing.
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
- `civilcraft-staircase.civilcraft.json` (CC0; 0.8 LA.10, session `landscape-arch_PART_4`): "Terrace steps", metric, a made-up ground sloping 5 % east: two paved terraces, a
  flight of steps linked to a feature line, a cheek wall whose top follows the ground, a planted bed clipped around them, the ground modifiers in order, spot
  levels, two worksheets and section A–A. Built once by `node tools/landscape-test/make-staircase.mjs` (refuses to overwrite without `--force`). The LA.10
  acceptance test (`bin/test-landscape.mjs --only la10`, `tools/landscape-test/browser.mjs --only la`) opens it. Shots: /lab/civilcraft, Landscape workspace.
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
- `modelcraft-physics.modelcraft`, `modelcraft-arm.modelcraft`, `modelcraft-leg-ik.modelcraft` (CC0, ours; 0.7 Track AN, video
  r07-04 animation, 2026-10-25): made once in the released /use/modelcraft 0.7 with the app's own modules and saved by its own Save,
  by `node /var/www/CADCRAFT/videos/r07-04-animation/make-files.mjs` (refuses to overwrite; reopens each and prints what it holds).
  **physics**: a 10 × 10 m floor (Stays put), five 1 m crates stacked crooked with the top one half over the edge (Falls and
  collides, 1 kg, bounce 0.1), a 0.4 m ball above that edge with no physics yet, physics 0–3 s, one camera key at 0 s (the timeline
  saves an animation only when it has a key). Shots: Workspace › Animate, the Ball: Falls and collides, Sphere, 5 kg, bounce 0.6;
  Bake physics; Play. **arm**: a tube 4 m tall, 0.3 m radius, 16 rings of 12 faces ("Arm"), nothing rigged. Shots: Animate, Add bone
  three times, Automatic weights, Pose and drag the middle bone, Skin › Dual quaternion, Paint weights. **leg-ik**: a rigged tube
  ("Leg": thigh + shin, automatic weights), a curve object "Track" and a 0.5 m "Ball" running it by Follow path (offset keyed 0 → 1
  over 0–3 s), no IK yet. Shots: Animate, the Leg, the shin bone, Add constraint › Reach (IK), target Ball; Play.
- `cadcraft-classes.dwg` (DWG 2018, inches; CC0, ours; 0.8 SU.912, session `sx-classes`): the sample house with classes (Architecture-Walls,
  -Openings-Doors, -Openings-Windows, Annotation-Text, -Dimensions, Finishes-Hatch); walls take colour and lineweight by class, hatches their fill;
  sheet A-101 FLOOR PLAN's viewport hides Annotation-Dimensions and draws the walls red, only there. Made once by
  `node tools/cadcraft-test/make-classes-showcase.mjs` (refuses to overwrite without `--force`). Shots: open it in /lab/cadcraft, type `CLASSES`;
  click the eye beside Annotation; the A-101 FLOOR PLAN tab, select its viewport to show This viewport.
- `cadcraft-cabinets.dwg` (DWG, millimetres; CC0, ours; 0.8 SU.1035, session `sx-cabinet`): a 3.6 m wall line with B01 (600 base), B02 (800
  base, a pair of doors), D01 (450 three-drawer base), W01 and W02 (wall cabinets above), and the front view of that wall. Saved once from
  `tools/addons-test/browser-cabinet.mjs`'s run (Ctrl+S). Needs the Cabinets add-on switched on (Settings › General › Add-ons); without it the
  cabinets are plain block references. Shots: open it in /lab/cadcraft, `CABLIST`, `CABNEST`, EXPORT › Cabinet labels.
- `partcraft-gyroid-heat-exchanger.partcraft.json`, `partcraft-manifold.partcraft.json`, `partcraft-lattice-beam.partcraft.json`, `partcraft-nozzle-lab.partcraft.json`
  (PartCraft parts, file version 6; CC0, ours; 0.8 CE.5, session `engineer`; 3.7 / 5.7 / 2.1 / 2.7 MB): one Generated body each, made by the
  generator of that name with the inputs in `tools/field-test/make-showcase.mjs`, with its data sheet and manufacturing checks kept in the file
  (opening one runs nothing). Made once by `node tools/field-test/make-showcase.mjs` (refuses to overwrite; `--check` runs the generators again and
  compares the bytes). Shots: open one in /lab/partcraft (the mesh kernel: `localStorage` `partcraft.exactKernel` unset), choose the Engineer
  workspace; the Problems list (⚠) shows the checks. The nozzle file is **lab only** (owner decision O3: no rocket-engine example goes public
  until the export-control wording is checked).
- `cadcraft-autocomplete.dwg` (CadCraft, 0.8 cad_PART_2, EG.54; CC0): inches. A wall framed with four studs at 16" (layer FRAMING), a
  three-step stair as one polyline (STAIR) and a room drawn on three sides (WALLS). Made once by
  `tools/cadcraft-test/make-autocomplete-showcase_PART_2.mjs` (refuses to overwrite). Shots: open in /lab/cadcraft, Extents, rest
  the cursor beside the fifth stud's place, the stair's next step, or the open side of the room: a grey dashed ghost shows, Tab draws it.
- `detailcraft-erection.detailcraft.json` and `detailcraft-erection-movie.html` (DetailCraft, 0.8 detail_PART_2, EG.72; CC0): the
  sample frame with one example crane (a made-up chart, not a real crane's): 11 lifts in about 162 minutes. Made once by
  `tools/detailcraft-test/make-erection-showcase.mjs`. Shots: open the .json in /lab/detailcraft, tab Erection; open the .html
  from disk (phone-sized window) and scrub to half way.
- `markupcraft-markups-that-act.pdf` (0.8 EG.64/66): the sample house plan, revision B, with three tasks (one for an assistant on the stair area, one for a person on a calm area, one overdue) and a pinned decision. Open it, then open `cadcraft-sample-house-rev-C.pdf` and choose Tasks, Check now: only the stair task closes. Made once by `tools/markupcraft-test/make-act-showcase.mjs`.
- `takeoffcraft-count-everything.pdf` + `takeoffcraft-count-everything.counts.json` (TakeoffCraft, 0.8 takeoff_PART_2, EG.67; CC0): a made-up 12-sheet electrical set, 24 × 36 in. E-001 is the symbol legend (six symbols named in real text, a general-notes box with no symbol); E-101 … E-111 are floor plans with the symbols along the walls. The .json lists what Count everything should find (797 symbols). Made once by `tools/takeoffcraft-test/make-count-everything-showcase_PART_2.mjs` (refuses to overwrite). Shots: open the PDF in /lab/takeoffcraft, toolbar **Count everything**, drag a box round the legend on E-001, **Count on 12 sheets**, click a sheet link.

- `modelcraft-say-the-scene.modelcraft` (CC0; 0.8 EG.61 ★, session `model_PART_2`): a 26 × 24 m plaza with a 6 × 6 × 7 m hall on it, after ONE
  `look_set` call — dusk, light rain, autumn trees, people on the plaza: October sun at 17:12, overcast sky, haze, a wet (satin) plaza, eight
  autumn trees and twelve people under umbrellas, on the tags "Scene trees" / "Scene people". The Render dialog's settings and the scene's words are
  saved in it. Made once by `node tools/modelcraft-test/browser-look.mjs` (writes it only when missing, and only on the VPS run). Shots / video: open it
  in /lab/modelcraft, Export › Render a picture… › Mode High quality › Render (the haze shows in the high-quality render only); then ask the
  assistant "make it clear noon in summer" to see the same plaza dry and green.
- `bimcraft-office-5-storey.ifc` (IFC4, ~2.2 MB; CC0, ours; 0.8 Great Eight cards, 2026-10-29): "Harbor Street offices", five storeys + roof level,
  36 × 18 m, 4 m floor to floor, built with BimCraft's own operations (lab build) by `node tools/great-eight-media/make-office.mjs` (refuses to overwrite
  without `--force`): rendered-block outside walls (ext-300) with 2.4 m windows all round, a corridor, six offices south, an open office, a concrete stair
  core with a U stair on every level and meeting rooms north, a lobby with a double door on Level 1, Ø450 round columns on a 6 m grid, floors in the rooms
  and the corridor (none in the stair core, so the stairs show), furniture from the furnish tool (182 pieces), a low-slope roof (a flat roof is refused:
  `model.err.pitch`), library materials put on with the Paint tool (sand stucco outside, concrete core and columns, oak floors, grey tile corridor, metal
  roof). 75 walls, 178 doors and windows. Shots: `tools/great-eight-media/shoot.mjs apps|workflows` (Draw, Split, Level 2 beside a 3D view cut by a section box;
  a section box through the stair core rendered High quality, path traced, on the GPU workstation).
- `bimcraft-process-plant.ifc` (IFC4, ~6 MB; CC0, ours; 0.8 Great Eight cards, 2026-10-29): "Process plant study", a made-up plant (not an engineered
  design), built by `node tools/great-eight-media/make-plant.mjs` (refuses to overwrite without `--force`) with BimCraft's own operations and its Plant
  add-on: 110 pieces of the add-on's generic process equipment placed by its place.js with nozzles as ports (three process units, each with two columns,
  a third column, feed/reflux/surge/knock-out drums, shell-and-tube and plate exchangers incl. a stacked bank, ten pumps and an open steel structure with
  grating decks carrying exchangers and an accumulator; ten 11 m storage tanks in a concrete bund; four horizontal pressure vessels), an L-shaped pipe
  rack of 29 bents and 28 ties (two BimCraft families saved through family-ops.js: "Pipe rack bent", "Pipe rack tie"; and "Process structure"), and 154
  steel pipe runs in ten systems (rack lines in their own lanes on three tiers; 81 connections found by the add-on's router, 24 by a simple fallback path
  out-up-across when it found none). Shot: `tools/great-eight-media/shoot.mjs projects` (shaded with edges, side panels closed).
- `partcraft-bellcrank-study.partcraft.json` (PartCraft part, ~15 KB; CC0, ours; 0.8 Great Eight cards, 2026-10-29): an aluminium bellcrank (hub,
  two arms with lightening slots, a web, bosses, three bores) built with PartCraft's part document and mesh kernel by
  `node tools/great-eight-media/make-bellcrank.mjs` (refuses to overwrite without `--force`), with a static Simulation study (not solved in the file):
  6061-T6, tets of 4 mm, the hub bore Fixed, 3 kN down on the long arm's pin hole, 2 kN sideways on the other (made-up loads). Open it in /lab/partcraft
  (mesh kernel), Workspace › Simulation, Solve (≈ 90 s on the GPU workstation, 99,135 elements; max von Mises 163.6 MPa). The automatic 8 mm size
  stops with "A mesh element is inverted (internal mesher error)" (lab build, 2026-10-29), hence the 4 mm size.
- `partcraft-two-bars-contact.partcraft.json` (PartCraft part, ~6 KB; CC0, ours; 0.8 SU.891, session `addons-finish-advanced-sim`, 2026-10-30): two 10 × 10 × 50 mm
  steel bars end to end across a 0.01 mm gap (one sketch of two rectangles, one extrude: two pieces), with a static Simulation study (steel, tets of 5 mm,
  the first bar's free end and the bottom and back faces held frictionless, 27.5 kN pushing the far end: 275 MPa, past yield). As saved the study cannot
  be solved (the second bar is held only along its sides); the Advanced simulation add-on turns it into a contact study. Made once by
  `node tools/addons-test/make-advanced-sim-showcase.mjs` (refuses to overwrite without `--force`). Shots: `node tools/addons-test/browser-advanced-sim.mjs`.

### Great Eight Studio pictures and launch videos (0.8, 2026-10-30)

Made ONCE each by `tools/great-eight-media/make-*.mjs` with the apps' own operations (lab build); every script refuses to overwrite
without `--force`. All CC0, ours, made up to show the tools (not engineered designs). Pictures: `shoot-projects-*.mjs`,
`shoot-cap-*.mjs`, then `finish.py` / `compose.py`; videos: `videos/ramp-kit` (no Lab badge or version number in any frame).

| File | Script | What it is |
|---|---|---|
| `bimcraft-mixed-use.ifc` | make-mixed-use | "Market Square", six-storey mixed-use building |
| `bimcraft-warehouse.ifc` | make-warehouse | "Dock Road warehouse expansion", existing warehouse + new steel bays |
| `bimcraft-data-center.ifc` | make-data-center | "North Ridge data hall", one-storey data center |
| `bimcraft-loft-apartment.ifc` | make-cap-interior | "Loft apartment", furnished one-floor interior |
| `bimcraft-pump-skid.ifc` | make-pump-skid | "Fire water pump skid", duty/standby (Plant add-on) |
| `bimcraft-water-treatment.ifc` | make-water-treatment | "Hillside water treatment plant" on a sloping site |
| `bimcraft-piping-retrofit.ifc` | make-piping-retrofit | the process plant with one new transfer line (reads `bimcraft-process-plant.ifc`) |
| `cadcraft-pump-skid-pid.dwg` | make-pump-skid-pid | P&ID of the pump skid, same tags (P&ID add-on) |
| `cadcraft-hvac-office.dwg` | make-hvac-office | made-up 60 x 40 ft office: supply main S-1 (3 sections sized from 2400/1500/700 cfm, two transitions), branches S-2 and S-3, five 150 cfm round takeoffs with diffusers, duct schedule table under the plan (HVAC add-on, CC0, ours; shoot the plan view, then the 3D tab) |
| `cadcraft-piping-plumbing.dwg` | make-piping-plumbing | made-up bathroom group: copper type L cold-water main CW-1 with 3/4 and 1/2 in branches and gate/ball valves, 4 in PVC drain D-1 on the code's 1/8 in/ft with 2 and 3 in branch drains, pipe and fitting schedule table (Piping add-on, CC0, ours; shoot the plan view, then the 3D tab to show the fall) |
| `cadcraft-chip-sky130.gds` + `.dwg` | make-cap-chip | chip layout at nanometer scale, opened with GDSIN (SU.752) |
| `cadcraft-wafer-map.dwg` + `.lsp` | make-cap-wafer | 300 mm wafer map drawn by a LISP routine (APPLOAD) |
| `cadcraft-pcb-fab-drawing.dwg` | make-cap-pcb | PCB fabrication / assembly drawing (a drawing, not a board router) |
| `cadcraft-harness.dwg` | make-cap-harness | wire harness drawing (SU.892) from the Electrical add-on's sample schematic |
| `cadcraft-control-panel.dwg` | make-cap-panel | control panel cabinet layout on DIN rails (SU.892) |
| `cadcraft-office-data.dwg` | make-cap-network | office floor data and power outlets on cable trays (Electrical add-on) |
| `civilcraft-road-corridor.civilcraft.json` | make-road-corridor | "Ridge Road", 1.6 km two-lane rural road, spirals, invented superelevation table |
| `civilcraft-subdivision.civilcraft.json` | make-subdivision | "Meadow Run" subdivision, placeholder IDF curve |
| `civilcraft-solar-site.civilcraft.json` | make-solar-site | "Mesa Verde Solar" ground-mount PV site (panels draw grey: known bug) |
| `modelcraft-conveyor-line.modelcraft` | make-conveyor | "Packing line" on a factory floor |
| `partcraft-machine-fixture.partcraft-asm.json` + `.partcraft-manual.json` | make-fixture | milling fixture assembly + Illustrate manual |
| `partcraft-enclosure.partcraft.json` | make-enclosure | control box enclosure (shelled box on the mesh kernel, not sheet metal) |
| `partcraft-heat-sink-thermal.partcraft.json` | make-cap-thermal | finned heat sink with a steady thermal study |
| `partcraft-wind-tunnel-car.partcraft.json` | make-cap-flow | 120 mm car-shaped body with an external Flow study |
- `cadcraft-apparel-bodice.dwg` (DWG, millimetres; CC0, ours; 0.8 Add-on Library video, 2026-10-30): two made-up pattern pieces drawn with the
  Apparel add-on in /lab/cadcraft — "Front bodice" and "Back bodice" (PLINE outlines, PIECE with a 10 mm seam allowance and the automatic
  grain line, a V notch on each side seam), sizes XS S M L XL with M as the base (GRADE › Sizes), simple grade rules (side corners 10 mm out
  per size, shoulder and neck corners up to 5 mm up, centre lines fixed), Nest view on. Not a real block. Made once by
  `videos/a08-apparel/make-showcase.mjs` (run through `videos/ramp-kit/film.mjs`; refuses to overwrite). Needs the Apparel add-on switched on
  (Settings › Global › Add-ons); without it the pieces are plain block references. Shots: open it in /lab/cadcraft, select a piece (the
  Grading section), `PIECETABLE`, `MARKER` + `MARKERADD` + `MARKERNEST`.
- `partcraft-turbo-compressor.partcraft-asm.json` (PartCraft assembly, ~27 MB; CC0, ours; 2026-11-01, the SuperCad Studio block of the Great Eight page):
  "Turbo compressor with intercooler and bypass valve", 27 distinct parts placed 53 times, every shaped part a Generated body (a CraftScript over the
  solid fields, run headless exactly as the app runs it; scripts in `tools/great-eight-media/turbo-compressor/` and in the maker): a volute casing
  (inlet pipe, shroud, vaneless diffuser, one-turn scroll, tangential outlet, three flanges, ears), a backswept impeller (11 blades + 11
  splitters, Ø64), rotor shaft, back plate and gasket, bearing housing (fins, oil feed and drain bosses, oil passages), two ball bearings, lock nut,
  8 cap screws + 8 washers, an oil fitting and line; the outlet duct with gasket, 4 screws + 4 nuts; a charge-air hose with 2 clamps; an
  intercooler (two tanks and OUR gyroid core: `generators/heat-exchanger.craft`, cell 16, 1 mm voxel, a 45 mm cube); a bypass valve (body, gasket,
  4 screws, stem and poppet, actuator bowl, spring, cover). One saved exploded view, "Exploded" (23 steps, along x / y / z). Frame (mm): rotor axis x,
  inlet towards -x, outlet going +z. A made-up design to show the tools: no compressor map, no stress, no tolerances, no balance, parts not joined
  (every part is free, so the app lists them as not joined). Mesh voxels are coarse (0.4 to 1.2 mm) to keep the file near 27 MB; two parts show
  stray shells (outlet gasket, duct) from thin features. **No Flow study is saved in it**: the compressor stage as one part with an internal Flow
  study (inlet and outlet on the two flange faces, the impeller a still obstacle in steady air: it would NOT be a rotating-machinery simulation)
  was not built; the picture is geometry and the exploded view only. Made once by `tools/great-eight-media/make-turbo-compressor.mjs`
  (refuses to overwrite; `--cache <dir>` keeps the part meshes between runs). Shots: open it in /lab/supercadcraft, Model workspace > Parts view,
  Explode view "Exploded" (Properties panel), look along (-0.55, -0.45, -0.85), zoom 1.8.
- `chip-pebble/` (CC0; 0.9 HD.10, session `chip-runners-09`): **Pebble**, the Chip design add-on's sample design — our own small RISC-style
  teaching core (Verilog, testbench, SDC), the made-up `cc_cells` teaching cell library (Liberty, LEF, Verilog models), the project file, and
  the outputs of REAL Icarus Verilog 11 + Yosys 0.9 runs (RTL waves, mapped netlist of 801 cells, gate-level waves with an SDF, STIL), plus a
  DEF/GDS placement and SDF made by the script itself (no routing; OpenROAD/KLayout/Netgen not run). Made once by
  `node tools/chip/make-sample.mjs` (refuses to overwrite; `--check` compares the sources); `node tools/chip/sync.mjs cadcraft` copies it
  into the add-on's `sample/`. Shots: /lab/cadcraft, Chip design › Project › Open the sample design.
- `scan-rim-can.stl` and `scan-var-fillet-block.stl` (binary STL; CC0, ours; 0.9 SU.1082, video 18-scan-fit, 2026-11-09): synthetic "scans" with known truth, written once from `tools/nurbs/scan-fixtures.mjs` (`roundedCan(20, 40, 4, 96, 8, 0.01)`: a can R 20, H 40 mm with a rim fillet of 4 mm, 0.01 mm noise; `varFilletBlock(60, 40, 30, x => 2 + 4x/60, 10, 0.01)`: a 60 x 40 x 30 mm block whose edge radius runs 2 to 6 mm). Shots: import in /lab/modelcraft, Surfaces › Scan › Fit (tolerance 0.1 mm) lists the Torus / Variable fillet rows, then Stitch. Not a real scan.
- `detailcraft-frame-live-load.detailcraft.json` (CC0, ours; 0.9 SU.1056, video 19-pdelta, 2026-11-09): DetailCraft's built-in sample frame with a 20 kN/m live load (case L) on its first beam, saved from the app's own model (`model.toJSON()`). Shots: open it in /lab/detailcraft, Analysis tab, Run, tick Second order (P-Delta), Run again.
- `modelcraft-step-part.modelcraft` (CC0, ours; 0.9 TW.13, video 20-conveyor-from-step, 2026-11-09): `fixtures/step/box.step` (50 x 40 x 30 mm) imported through ModelCraft's own Import and saved with `modelcraft.file()`. Shots: open it in /lab/modelcraft with the Digital twin add-on on, Behaviours on imported parts › Pick a face (top), Conveyor, Test. A plain box, not a real machine part.
