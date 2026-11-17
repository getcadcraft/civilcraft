---
title: Parking lot layout
summary: Lay out stalls, aisles, accessible and van spaces and islands inside an outline, grade the lot with falls to drains against the existing ground, then pave and plant it. Also available to an assistant.
section: tasks
order: 65
keywords: parking, lot, stall, aisle, accessible, ada, van, island, drain, fall, grade, cut, fill, paving, pavers, planting, trees, terrain, point cloud, mcp, assistant
---

Fit a parking lot into a parcel, a pad or a closed feature line, and get the counts, the grading and the paving in one step.

## Lay it out

1. Select a parcel, a pad or a closed feature line on the plan.
2. Open **Surface, More, Parking lot...**
3. Choose the rules, the stall angle (90, 75, 60, 45, 30 degrees or parallel) and one-way or two-way aisles. The stall, aisle and island sizes start from the table and every one can be typed over.
4. Choose **Lay out**.

The rows run along the outline's edge that gives the most stalls (or at the angle you type). A stall counts only if it lies wholly inside the outline. Where room is left for one row and an aisle, a single-loaded band is added. The window lists spaces, accessible and van spaces, islands, drains and the area per space, and the plan shows stalls, accessible spaces with their hatched access aisles, islands, aisle centre lines and drains on their own layers (C-PARK-...), so they reach PDF, DXF and DWG.

## Accessible spaces

With the United States rules the count follows the 2010 ADA Standards table 208.2 for the spaces provided (one in six, rounded up, is a van space), placed nearest the first corner of the outline (the entrance), each with an access aisle; two share one. A stall narrower than the accessible width, or a fall steeper than 1:48 on accessible spaces, shows as a problem. **These numbers were typed from the standard as remembered and have not been checked against the printed standard.** Typical stall and aisle sizes come from parking design guides and are likewise unchecked. Check both, and your local code, before relying on them. Choose **Custom** to enter your own accessible count.

## Falls to drains, cut and fill

Unless you turn it off, the lot becomes a grading area in the Landscape workspace. Drains are put on the aisle centre lines about every 100 feet (30 m); the surface rises from each drain at the fall you give (1.5 percent to start), so every point falls to its nearest drain. The level is chosen so the lot's cut and fill balance on the existing ground. The existing ground is the project's existing surface, which can come from survey points, LandXML, a lidar or scan point cloud turned into a surface, or contours. The window shows the cut and fill estimate; the project's own volumes show the exact figure afterwards. The grading area keeps its edge on the existing ground, so where the new surface differs from the ground at the edge you get a step, and the window says how big.

## Paving and planting

The whole outline gets a paver paving (a stretcher pattern you can change under Landscape, Hardscape) and every island gets a shrub bed and, where it is wide enough, a tree, taken from the plant list. Everything is an ordinary Landscape object after that: edit it, or choose **Lay out again** to replace what the lot made. Removing the lot removes what it made.

## From an assistant

The same lot can be asked for over MCP: `parking_layout` previews, `parking_build` writes, `parking_remove` takes a lot away. Ask by parcel name or send the outline.

## What is not done

Whether the aisles reach a street is not checked. Paving covers the whole outline, so its area includes the islands. Paving material choices from the Library and a Library type for stalls are not built; the paving pattern is the Hardscape one. No other country's rules are built.
