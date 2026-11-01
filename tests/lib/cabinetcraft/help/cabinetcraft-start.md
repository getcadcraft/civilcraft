---
title: CabinetCraft: getting started
summary: What the CabinetCraft add-on does in PartCraft, BimCraft, CadCraft and ModelCraft, how to switch it on and how to lay out your first kitchen.
section: start
order: 1
keywords: cabinetcraft, cabinets, kitchen, millwork, casework, joinery, base cabinet, wall cabinet, tall cabinet, cut list, add-on
---

## What it is

CabinetCraft is one add-on for four apps (PartCraft, BimCraft, CadCraft and ModelCraft) for designing a run of cabinets the way a cabinet shop works: a room (a rectangle, an L, a U or an outline of your own, with angled walls and curved bay walls) with its doors and windows, runs of base, wall and tall cabinets along its walls, islands, the boards and edge banding you use, and then everything the shop needs. From one job you get the cut list, a nest of the panels on sheets, a bar-coded label for every piece, 32 mm drilling, a hardware list, a cost estimate (a draft until the rates are your own), shop drawings (plan, elevations, sections and a 3D view), and then what your app can do with the cabinets: in PartCraft G-code for the sheets and the cabinets as bodies in the viewport; in BimCraft the cabinets as elements of the building model; in CadCraft the shop drawings as CAD entities; in ModelCraft the cabinets as bodies of the model. The job, the cut list, the nest, the drilling, the estimate and the drawings are the same in all four; the topic for your app says what it adds and what it cannot do.

It is an add-on, not another app: it comes with PartCraft, is free and is off until you switch it on in {{ui:Settings}} › {{ui:General}} › {{ui:Add-ons}} › {{ui:CabinetCraft}}. Its tab, {{ui:CabinetCraft}}, is then in the right panel. It does not change your part's solid: a job is its own file. The one thing it puts in the part is the display bodies you ask for with {{ui:Place in viewport}}.

The cabinets themselves are the ones CadCraft's Cabinets add-on builds: frameless boxes on the 32 mm system by default, and sides, bottom, rails or top, a back in grooves, shelves, doors and drawer boxes worked out from your construction numbers. CabinetCraft adds the designer's side of it: the room, the runs, a catalog of templates, face frames, blind corners, fillers, end panels, countertops, materials and the cost.

## Your first kitchen

1. Open the {{ui:Job}} view and press {{ui:Example kitchen}} to see a finished job, or {{ui:New job}} to start empty. Then open {{ui:Room}} and give the room's shape and size, its doors and windows, and any island.
2. In {{ui:Layout}}, pick a run, then add cabinets: choose the type, check the width and press {{ui:Add cabinet}}. Cabinets go along the wall from its start corner in the order of the list; use the arrows to move one.
3. A {{ui:Gap}} leaves room for an appliance. A {{ui:Filler}} closes a small space. {{ui:Fill the rest}} adds a filler for what is left when it is 75 mm (3 in) or less.
4. Open {{ui:Checks}} to see what is technically wrong: a run too long for its wall, a cabinet too narrow for its sides, a wall cabinet hung in front of a tall one.
5. {{ui:Drawings}} shows the plan, an elevation of each run, a section of each kind of cabinet and a 3D view, and places the cabinets in the PartCraft viewport. {{ui:Export}} nests the sheets and writes the files.

## Units

A job is in millimetres or inches, chosen in {{ui:Job}}. Changing the unit converts every size (inches to a sixteenth) and puts the construction numbers back to that unit's own set.

## Your work is kept

The job is kept in this browser as you work. {{ui:Save the job file}} writes a `.cabinetcraft.json` file you can keep anywhere; {{ui:Open a job file}} reads it back. A file you open is checked and cleaned before it is used.
