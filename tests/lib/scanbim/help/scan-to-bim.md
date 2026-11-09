---
title: Scan to BIM: walls, floors and openings from a point cloud
summary: Open a point cloud in BimCraft and get proposed floors, walls, doors and windows, each with how far it sits from the scanned points. You accept, edit or reject them.
section: start
order: 1
keywords: scan, point cloud, scan to bim, walls, doors, windows, floors, phone scan, laser scan, e57, las, ply, proposals, deviation
---

## What it does

Scan to BIM reads a point cloud you have already opened and proposes a first model of the building: the floors, the walls on each floor (with thickness and height), the doors and windows in them, and a floor for every room the walls close. Nothing is drawn until you accept. It works in BimCraft, and it needs the Point clouds add-on.

## Steps

1. Open a model in BimCraft, switch on **Point clouds** in Settings, General, Add-ons, and build your cloud there (LAS, LAZ, E57, PLY, PCD, PTX, XYZ or PTS). Use the Point clouds tab to clean stray points first.
2. Switch on **Scan to BIM** and open its tab. It says which cloud is open and whether the cloud lines up with the model or is centred on it.
3. **Find the floors.** The add-on looks at the heights of all the points. Where many points lie on one level it finds a flat surface. The lowest is a floor. A surface at least 1.8 m above it is its ceiling. If it guessed wrong, type the floor and ceiling heights.
4. Choose a floor and press **Propose**. For walls it cuts a slice 1.2 m over the floor and finds the long thin runs of points, as the plan-trace in BimCraft's Scan menu does. For each wall it reads the rest of the storey's points to get its height and, when both faces were scanned, its thickness. Doors and windows are gaps in the wall's own points.
5. Look at the table. Untick what you do not want, type a new thickness, height, width or sill, then press **Show on the plan** to see the proposals on the level, or **Accept ticked** to draw them. Accepting is one undo step. **Reject all** drops everything.

## How far from the points

Every proposal carries a number in millimetres: how far it sits from the scanned points, with the number of points it was measured on.

- A **wall**: the spread of the points that lie on its faces (within 60 mm), around the face. Points of other walls meeting it are not counted.
- A **door or window**: the gap between each proposed edge and the nearest point beside it, and the number of points left inside the opening.
- A **floor**: the spread of the floor points, away from the walls, around the floor level.

A small number says the points agree with the proposal. It does not say the building is that size: a scan has its own error, and the units and scale of the file are the file's.

## What it cannot know

- A wall scanned from one side shows one face, so its thickness is **assumed** (the figure you type, 150 mm to start). A wall scanned from both sides has its thickness **measured**. Each wall says which.
- Only rectilinear rooms are read: walls that are parallel to one of two perpendicular directions. A curved or diagonal wall is not found.
- A shadow in the scan, where nothing could see, looks like an opening. Check each one against the building.
- Floor and ceiling are told apart by their distance (1.8 m or more). A mezzanine or a very low room can fool it.
- It has been tried on made-up clouds of a known room, and the error of each number is in the test log. A real phone scan with a tape-measured wall is still to be checked.

## Not built yet

- Stairs, curved or sloped walls, columns, roofs and ceilings.
- Matching proposals to walls already in the model (proposals are new walls on the level).
- Window types and door swings: doors and windows are placed as plain openings you then change.
