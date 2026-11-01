---
title: CabinetCraft: rooms, runs and cabinets
summary: How a room (rectangle, L, U, free outline with angled and curved walls), its doors and windows, its runs and islands are laid out, the catalog, corner cabinets, face frames, fillers, end panels and countertops.
section: tasks
order: 2
keywords: run, room, angled wall, curved wall, bay, bow, arc, wedge, mitre, L-shaped, U-shaped, outline, island, peninsula, door, window, lazy susan, wall, corner, filler, end panel, countertop, face frame, frameless, blind corner, template, catalog
---

## The room

The {{ui:Room}} view sets the room's shape: a **rectangle**, an **L** (the rectangle with a notch cut from a corner), a **U** (a notch cut from the middle of a side) or a **free outline** with right angles. A free outline is typed, one corner per line as x, y, or picked: click the corners in order round the room on the small plan, each snaps to 50 mm (2 in) and to a straight line from the one before, then press {{ui:Close outline}}. Edges that cross are refused.

### Angled and curved walls

Under {{ui:Angled and curved walls}} type the walls one a line from the first corner: `length angle` for a straight wall (the angle is its direction in degrees, 0 east, 90 north), or `arc radius sweep heading` for an arc (sweep + bulges away from the room, a bay, and - into it; the heading is the direction from where it starts to where it ends). The outline closes itself. Or tick {{ui:Any angle}} on the plan and click the corners, and {{ui:Arc walls}} to click a point on an arc and then where it ends. Or take a wall of a free outline and make it an arc of a sweep you give, and straight again. Walls then say their direction and how far the room turns at each corner.

The walls go round counter-clockwise. A rectangle's are the south, east, north and west walls; an L, U or free outline has Wall 1, Wall 2 and so on. A corner where the walls turn away from the room (the inside corner of an L) has no wall behind the end of the run that reaches it, so that end gets an end panel.

## Runs

A **run** lies along one wall and starts at that wall's start corner. Each run has two rows: the **floor row** (base, drawer and tall cabinets) and the **upper row** (wall cabinets). Both are measured along the wall from the start of the run.

Where two walls meet in a room corner and both runs reach it, the run listed later stops short by the depth of the one listed first, so their backs butt and nothing overlaps. List the run that keeps the corner first. If the second run was designed to the full wall it goes over, and {{ui:Checks}} says by how much.

## Runs on angled and curved walls

A run on a slanted wall is turned to follow it: its cabinets, end panels and fillers are rotated, and the checks, plan, elevation, cut list, 3D drawing and viewport bodies all follow. Where two runs meet at a corner that is not a right angle, the later run stops short by **depth x sin(the turn)** (the same as the depth at a right angle). What is left behind is a right triangle; a **closing panel** (W01, W02 ...) shuts the end of the other run, and {{ui:Checks}} gives the legs of the triangle behind it. An inside angle under 90 degrees has no stock form: it is an error that says so.

On a **curved wall** the cabinets stay straight and are stepped along the curve, each turned to the tangent at its own middle.

- On a **bay** (the centre of the curve in the room) the back corners of each cabinet touch the wall, the middle of its back is a sagitta from the curve (the largest gap, stated in {{ui:Checks}}), neighbours just clear each other at their fronts and a wedge-shaped void is left at the wall behind them.
- On a **bow** (the wall bulges into the room) the middle of each back touches the wall, neighbours just clear at their backs, and a wedge gap opens at the fronts: close it with wedge fillers or choose narrower cabinets. {{ui:Checks}} warns.
- Fewer cabinets fit than their widths add up to, because of the wedges. A run that goes past the end of the curve is an error with the amount.
- A **curved-front cabinet** (Base, curved front) is a sector of the ring, its width an arc length. It is **made to order**: flagged in {{ui:Checks}}, a segmented body in the drawings and viewport, a placeholder line in the estimate by the metre of front arc, no cut list or drilling. Its front radius is shown.
- A countertop on a curve is one piece following the cabinets' corners.

Doors and windows work on angled walls; on a curve they sit at positions along the chord (the straight line between its corners).

## Corner cabinets that turn the corner

A corner cabinet is the first or last item of a run that reaches a room corner. It fills the corner square and has an arm along each wall, so the next wall's run starts after the arm instead of after a depth. Three kinds, in base and (L-shaped and diagonal) wall sizes:

- **L-shaped:** an arm on each wall, a door on each arm. Its bottom, top and shelves are cut as two rectangles.
- **Diagonal front:** the two arms and one diagonal door. Bottom, top and shelves have a triangle blank, cut on the diagonal.
- **Lazy susan:** the diagonal cabinet with two round shelves on a pole; the shelf is cut from a square blank.

The corner cabinet has a countertop of its own with the shape of its footprint. A gap before it that is 75 mm (3 in) or less becomes a filler beside it; any more is left as a gap. Corner cabinets are drilled: see the export topic.

At a corner that is **not** a right angle only the **diagonal front** cabinet is made, at the true angle: two arm boards joined in a mitre, a triangle closing the front and one door as long as the front. The L-shaped and lazy susan cabinets only fit a right angle and are laid out as plain cabinets with an error. A corner cabinet needs two straight walls. The common-practice sizes are in numbers you can change, and {{ui:Checks}} says when an arm is too short for a door.

## Islands and peninsulas

An island is a free-standing run: set where its back line starts (x, y), which way it runs and how long it is in {{ui:Room}}, then lay out its cabinets in {{ui:Layout}} like a run. The cabinets face the left of the back line; a second row on the **back** faces the other way. A countertop overhang over the back is the seating. An end against a wall makes it a peninsula: no end panel and no overhang at that end. {{ui:Checks}} warns when the walk-around space is under 900 mm (36 in), a common-practice figure and not a code.

## Doors and windows

A door or window is placed on a wall, measured along it from the wall's start corner, with its width, height and (for a window) the sill height. Cabinets respect them:

- A cabinet that stands in front of a door, or a pantry as tall as a window, is an error. Within 50 mm (2 in) of a door frame is a warning, and so is a cabinet in the swing of a door that opens into the room.
- A base cabinet under a window is fine as long as the sill is above it. A wall cabinet in front of the glass is an error; one hung below a window is flagged.
- {{ui:Leave it free in run}} puts a gap in the run's floor row where the opening is, so the cabinets after it move on.

## The catalog

Twenty templates give you a starting point: base cabinets with one door, a pair, for a sink, with two, three or four drawers and a blind corner; wall cabinets with one door, a pair, open, short for over a fridge or hood and a blind corner; tall pantry and broom cabinets; corner cabinets that turn the corner, and a made-to-order curved-front base cabinet for a curved wall. Every number is yours to change after you pick one: the gear on a cabinet opens its height, depth, shelves, doors, drawers, hinge side, blind part and a note.

## Frameless or face frame

The job has a construction, and any one cabinet can differ.

- **Frameless (32 mm system):** full-overlay doors and drawer fronts, the boxes carrying the hinges on the sides.
- **Face frame:** a frame of stiles and rails (hardwood, cut by length, listed apart from the sheets) on the front of a box that is shallower by the frame's thickness. Doors and drawer fronts overlay the frame's openings by the amount you set, with a gap between them. Hinge plates go on the frame, so the sides carry no plate holes.

The frame numbers (stile, rail, overlay, gap) are in {{ui:Materials}} › {{ui:Construction numbers}}.

## Blind corners

A blind corner cabinet has a closed part of a width you set. The door is on the open part, hinged on the side away from the blind part, and a blind panel closes the front of the rest. {{ui:Checks}} warns when the blind part is too short for the next run's door to clear it.

## Fillers, end panels, countertops

- A **filler** is a flat strip closing a small space. With the run's automatic filler on, a leftover up to 75 mm (3 in) becomes one.
- An **end panel** finishes an open end of a row. It covers the cabinet's depth and the front, and is made when the end is not against a wall or the next run (you can force it on or off for each end).
- A **countertop** piece is worked out for each stretch of base cabinets, fillers and appliance gaps that carry the counter: its length with the overhang at an open end, its width with the front overhang. It is priced in the cost, not cut from sheets. A gap marked as an appliance space keeps the counter going over it.

## What it does not know

The sizes are common shop practice in numbers you can change. They are not tied to any maker's hinges, slides or legs: check them before cutting. Drawings are made from the same cabinets as the cut list, so they cannot disagree with it.
