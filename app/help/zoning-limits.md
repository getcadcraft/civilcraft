---
title: Check masses against the zoning limits you type
summary: Type a lot's setbacks line by line, a height limit, a sky-exposure plane, a floor area ratio and a coverage, see the buildable envelope on the plan, and read which masses break which limit.
section: tasks
order: 97
keywords: zoning, setback, setbacks, front, side, rear, envelope, buildable area, height limit, sky exposure plane, floor area ratio, FAR, coverage, lot, parcel, ordinance, code check
---

**CivilCraft has no zoning code in it.** It does not know any city's rules and does not ship a library of them. Every number on this page is one you type, taken from your own ordinance, and every result says it is measured against the limits you typed. It is a way to see how a lot's limits shape a building, not a ruling on whether a design is allowed.

## Type the limits

In **Properties**, under **Building masses**, choose a **Parcel** (or select a mass: its parcel's limits show under it). Then fill in what applies; leave a box empty for "no limit":

- **Street line**: the lot line on the street. The **Front setback** applies to it, the **Rear setback** to the line most opposite it, and the **Side setback** to the rest.
- **Height limit**.
- **Sky plane**: it starts at a height at the lot line and rises by the amount you type for every 1 of run inward, measured from the street line or from every lot line (2 means 2 to 1). The height allowed over a point is the lowest of the plane and the height limit.
- **Floor area ratio** (gross floor area of the masses on the lot divided by the lot's area) and **Coverage** (their footprints divided by the lot's area, typed in percent).

## The envelope

Tick **Show the envelope on the plan** to draw it on the layer `A-MASS-ENVL`. The envelope is the lot taken in from each lot line by that line's own setback, the offset lines meeting at mitred corners. A lot line made of a curve is taken as short chords within 0.01 of the curve. Convex and concave lots both work. If the setbacks fold over themselves (a deep setback on a narrow or very concave lot) there is no envelope, and Properties says so; try smaller distances.

## The result

Under the boxes, each mass and each limit gets a line, with a tick or a cross:

- **setbacks**: the area of the mass that lies outside the envelope;
- **height**: the mass's height against the most allowed over its footprint (a prism of one height is limited by the lowest allowed height at any of its corners);
- **floor area ratio** and **coverage**: all the masses on the parcel added up.
