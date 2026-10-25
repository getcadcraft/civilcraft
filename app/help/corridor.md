---
title: Sweep a road corridor
summary: Turn on a corridor for an alignment, set lane, shoulder and side slope values, and read the sections, daylight lines and earthwork it produces.
section: tasks
order: 60
keywords: superelevation, super, banking, runoff, runout, rate table, cross slope, rotation, corridor, assembly, subassembly, typical section, road, lane, shoulder, cross slope, side slope, daylight, cut, fill, sections, target, targets, width target, elevation target, offset target, widening, edge of pavement, follow another corridor
---

A corridor sweeps one simple typical section (an assembly) along an alignment and its design profile, grades it into the existing ground and adds the result to the proposed surface. In this build each alignment can carry one corridor. The simple assembly below is the same on both sides; to give each side its own parts, see [Build each side from parts](topic:corridor#build-each-side-from-parts).

## The assembly

From the centerline outward, on each side:

1. a **lane** of a given width, falling away from the crown at the **lane slope**
2. a **shoulder** of a given width at the **shoulder slope**
3. a **side slope** from the shoulder edge to where it meets the ground: the **cut slope** where the ground is above, the **fill slope** where it is below

The starting values are placeholders, not a design standard:

| Value | US feet | Metres |
|---|---|---|
| Lane width | 12 ft | 3.6 m |
| Lane slope | 2% | 2% |
| Shoulder width | 4 ft | 1.2 m |
| Shoulder slope | 4% | 4% |
| Cut slope | 2 : 1 | 2 : 1 |
| Fill slope | 3 : 1 | 3 : 1 |
| Section every | 10 ft | 5 m |

Slopes for side slopes are horizontal to vertical (H:V): 3 : 1 means 3 across for 1 down.

## Build the corridor

You need an alignment without errors and a design profile with at least two PVIs and no errors.

1. Select the alignment.
2. In the right panel, under **Corridor**, tick **Sweep an assembly along the design profile**.
   The fields appear and the corridor is built at once. The plan shows the edges of lane and shoulder and the daylight lines; with {{ui:Proposed (graded)}} chosen under **Display**, the contours show the new ground.
3. Change any value: **Lane width**, **Lane slope**, **Shoulder width**, **Shoulder slope**, **Cut slope**, **Fill slope**, **Section every**. Press {{key:Enter}} after each. Cut, fill and section spacing must be more than 0.
4. Read the line under the fields, for example "39 sections from 0+00.00 to 3+86.36; cut 240.2 cu yd, fill 556.0 cu yd."

Sections are cut at every **Section every** step, at the ends, and at the start and end of every horizontal and vertical curve. Each section and the lines through them (centerline, edges of lane and shoulder, daylight) become breaklines of the proposed surface.

To turn the corridor off, untick the box. Its values are kept for next time.

## When it does not build

A red box under the fields says why:

| Message | What to do |
|---|---|
| "The corridor needs a design profile without errors." | Add PVIs, or fix overlapping vertical curves (see [Design a vertical profile](topic:profile)). |
| "The design profile does not overlap the alignment." | Move the PVIs onto the alignment's station range. |
| "The corridor needs at least two sections on the surface." | Most of the corridor is off the existing ground. |
| "4 side slopes run off the surface before meeting the ground." | Near the edge of the surface the slope cannot reach the ground. Keep the road away from the edge, or lower the fill or cut height there. |
| "The corridor’s daylight lines cross (sections overlap, for example on the inside of a tight curve). Use a larger radius or narrower assembly." | Sections on the inside of a sharp curve overlap. Increase the radius or narrow the assembly. |

A corridor with a problem is not graded in and does not count in the earthwork.

## Corridors and pads together

The proposed surface is built in order: every corridor first, then every pad. Where a pad's grading overlaps a corridor, the pad wins. Volumes are worked out inside all the daylight lines together; see [Earthwork volumes](topic:volumes).

## Superelevation

Through a curve the road can tilt toward the inside, so traffic is pushed less to the outside. Tick **Superelevate the curves** under **Superelevation** in the alignment's **Properties**:

- Each circular curve takes a rate **e** from the rate table: the first row whose radius the curve reaches (a row with an empty rate keeps normal crown). The table and the **Max relative gradient** (0.5 % to start) are placeholders, not a standard: set them from your own design criteria. Add or remove rows as you need.
- The lanes rotate about the centerline. Before the curve the outside lane flattens over the **runout** (normal crown ÷ e × runoff), then over the **runoff** (lane width × e ÷ the gradient) the outside lane keeps turning until the whole road slopes at e toward the inside; two thirds of the runoff lies before the curve and one third on it. After the curve the same happens in reverse.
- A shoulder on the low side is never flatter than its lane; on the high side it keeps its own slope (it rolls over).
- The table under it lists each curve's radius, rate, runoff and runout and where full superelevation starts and ends. The **superelevation diagram** draws both lanes' cross slopes along the stations (the left lane solid, the right one dashed).
- A curve too short to reach full superelevation, or two curves whose transitions overlap, is said in a box above the table.

Sections, volumes, the 3D view and the sheets all show the tilted road. Each change is one step: {{key:Mod+Z}} undoes it.

## Targets

A target moves one point of one side of the road to a line: the **Edge of pavement** or the **Shoulder edge**, on the **Left** or the **Right**. Each section meets the line square to the centerline, going out on that side only, so a target on the right never moves the left side.

| Sets | What happens where a section meets the line |
|---|---|
| **Width** | The point sits on the line: the lane (or the shoulder) widens or narrows to it, keeping its cross slope. |
| **Elevation** | The point takes the line's elevation there, at its own offset: the lane's (or shoulder's) cross slope follows. |

The line can be a feature line (whatever its **Use**) or a line of another corridor: its centerline, edges of pavement, shoulder edges or daylight lines. A corridor's line follows that corridor: change the other road and this one follows. CivilCraft builds the other corridor first; two corridors that would target each other in a loop are refused on one side, and the table says which.

1. Select the alignment and turn its corridor on.
2. Under **Targets**, click {{ui:Add a target}}.
3. Choose the **Side**, the **Point**, what it **Sets** and **To the line**. Each change is one undo step.

**Result** says at how many sections the line was reached. Sections that do not reach it (past its ends, or where it is behind the centerline) keep the assembly's values. A line that is deleted leaves the corridor as it was before the target, and the table says so. One side can have one width and one elevation target for each point.

## Build each side from parts

Turn on **Build each side from parts** under the corridor's settings. Each side then has its own list, from the centerline outward: lanes, a shoulder, a gutter, a curb, a planting strip, a sidewalk and, last, the side slope to the ground (with its own cut and fill ratios). Start from {{ui:Rural road}} or {{ui:Urban street}}, add and remove parts, move them with the arrows, and {{ui:Copy}} one side to the other. Every change is one undo step.

A cross slope is the fall away from the road, so a sidewalk that drains toward the road is negative. A curb is a face of the height you give, a top of the width you give and an optional drop at the back. Superelevation turns every lane in the first row; the gutter, curb, strip and sidewalk hang from the edge of the lanes as built. Targets still move the end of the lanes and the last part. Cross sections mark the gutter flowline, top and back of curb, and the rest. On a curve with spirals the runoff is the spiral: level crown at the TS, full superelevation at the SC.

## What is not built yet

Assemblies that change along the road, regions, and targets for the daylight slope are not available yet. See [Not built yet](topic:not-built-yet).
