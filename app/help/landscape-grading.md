---
title: Grading for landscape
summary: Platforms, berms, swales and free grading with spot elevations and contours you drag, cut and fill live, slope analysis, flow arrows and ponding — all in CivilCraft's proposed surface.
section: tasks
order: 153
keywords: grading, landscape grading, platform, terrace, pad, berm, mound, swale, spot elevation, spot level, contours, edit contours, cut and fill, earthwork, slope analysis, accessibility, steep slopes, flow arrows, drainage, ponding, puddles
---

Everything here is graded into the **proposed surface** with the same grading as pads and corridors. The **existing ground** is never changed, and Earthwork counts it all. The Grade menu is in the Landscape group.

## Platforms

{{ui:Grade}} › {{ui:Platform}}, then click the corners and press {{key:Enter}}. The platform starts at the mean ground elevation under it; type an **Elevation** to set it, or empty it to follow the ground again. A **Fall** in % and **Falls towards** in degrees (0 = east, 90 = north) tilt it. Its sides are graded out to the ground at the **Cut slope** and **Fill slope** (horizontal to 1).

## Berms

{{ui:Grade}} › {{ui:Berm}}: a mound whose top is its **Height** above the mean ground under it, its sides graded out.

## Swales

{{ui:Grade}} › {{ui:Swale}}, then click along the swale **the way water runs** and press {{key:Enter}}. Set its **Depth**, **Bottom width** (0 for a V) and **Side slope**. With no **Fall**, its bottom follows the ground, its depth below it, and never runs uphill; type a fall to give it a steady one from its start.

## Spot elevations and contours

1. {{ui:Grade}} › {{ui:Grading area}}: click the outline of the area you want to shape.
2. {{ui:Grade}} › {{ui:Spot elevation}}: click inside the area. Type its elevation in Properties, or use the ▲ ▼ buttons.
3. {{ui:Grade}} › {{ui:Edit a contour}}: click a contour inside the area to take it as a line you can reshape.

Select a spot or a contour and **drag** it (or its points) on the plan: the surface follows when you let go, one undo step. Inside the area the ground is rebuilt from its edge (where it meets the existing ground), the spot elevations and the edited contours.

## Cut and fill, live

Every grading object's Properties show its **Cut** and **Fill** and the whole site's, by the grid method Earthwork uses, as you change it. Problems (off the surface, an outline that crosses itself) are listed there.

## Grading checks

In the **Grading checks** section on the left:

- **Slope analysis** colours the surface by gradient: up to the gentle limit, between, and steeper than the steep limit (5 % and 33.3 % to start: the usual 1:20 for accessible routes and 1:3 for mowing). The legend says how much of the area falls in each. The steep areas print on sheets too.
- **Flow arrows and ponding** draws which way water runs and rings every place it would pond, with its depth; the section says how many places, the deepest and how much water they hold.

The checks read the proposed surface when anything is graded, else the existing ground.
