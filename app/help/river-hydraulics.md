---
title: River water surface profiles
summary: Model a river from the ground surface and compute steady water surface profiles by the standard step method: water levels, energy, velocities, Froude numbers and the flood extent on the plan. A lab feature; every result needs an engineer's review.
section: tasks
order: 58
keywords: levee, ineffective flow area, section editor, river, hydraulics, water surface profile, backwater, standard step, steady flow, 1d, cross sections, manning, roughness, conveyance, critical depth, normal depth, froude, energy grade line, flood extent, floodplain, inundation, bank stations, reach lengths, contraction, expansion, subcritical, supercritical, mixed regime, hydraulic jump
---

CivilCraft computes steady, one-dimensional water surface profiles along a river: for each flow you give, the water level at every cross section, from the energy balance between neighboring sections (the standard step method). It is in the lab while it is checked.

**Design aid only.** The water levels need a qualified engineer's review before anyone relies on them: a 1D model is only as good as its sections, roughness values, reach lengths and boundaries, and it does not know about bridges, culverts or flow leaving the river.

## Draw the river

1. Build the existing ground surface first (points, breaklines, or a TIN you opened).
2. Under **Surface** › {{ui:More}}, choose {{ui:River}}.
3. Click along the river's centerline **from upstream to downstream**, then press {{key:Enter}} or double-click.

CivilCraft cuts a section square to the centerline every 50 m (200 ft), 100 m (300 ft) to each side, from the ground. River stations are measured from the downstream end, so they grow upstream. The banks start as a guess 10 m (30 ft) either side of each section's lowest point.

To add a section where the river narrows or a structure sits, select the river, click {{ui:Add a section}} and draw a cut line across it (either way: it is turned to run left to right looking downstream).

## Set the river up

Select the river to see it in **Properties**:

- **Flow regime**: subcritical (the usual case: computed upstream from the downstream boundary), supercritical (computed downstream from the upstream boundary) or mixed (both, then the one with the larger specific force at each section; a preview).
- **Flow profiles**: a name and a flow for each (for example a 10-year and a 100-year flow), and the boundary at the downstream end (and the upstream end when the regime is not subcritical): **Normal depth** with an energy slope (the bed slope is a first guess), a **Known water surface** elevation, or **Critical depth**.
- **Sections from the ground**: the spacing, how far left and right, the bank guess and the two Manning's n values; {{ui:Cut sections again}} replaces the sections (one undo step).
- **The sections table**: for each section, the left and right bank offsets, the channel n and the overbank n, the reach lengths to the next section downstream (left overbank, channel, right overbank; measured from the plan to start) and the contraction and expansion coefficients (0.1 and 0.3 to start: gradual transitions). {{ui:Edit}} opens the section editor (next); a dot after it means the section has a levee or an ineffective area.

Every change is one undo step ({{key:Mod+Z}}).

## Edit a section: banks, levees and ineffective areas

{{ui:Edit}} on a section draws its ground and lets you drag what the solver reads: the **left and right bank** (they split the section into the left overbank, the main channel and the right overbank), a **levee** on either side and **ineffective flow areas**. Every handle can also be moved with the arrow keys, and every number can be typed beside the plot. {{ui:Apply}} is one undo step.

- A **levee** has a place (offset) and a crest elevation. The ground beyond it, away from the river, is cut off from the river while the water surface is below the crest: its area, wetted perimeter and conveyance are left out. Above the crest the whole section counts again. A levee stands outside the bank it protects; one inside the banks is flagged.
- An **ineffective flow area** holds water but carries no flow (a pocket behind an embankment, dead water beside a bridge approach). Give its two offsets and, if you like, a water level below which it is ineffective ({{ui:always}} when blank): above that level it flows like the rest. One that covers part of the main channel is flagged.
- Between two sections the flood extent leaves dry the ground behind a levee that both sections have, while the water surface there is below the crest (the line between the two crests is straight).

## Compute and read the results

Click {{ui:Water surface profiles}}. For the profile you pick you get:

- a **plot** along the river (flow left to right): channel bottom, banks, water surface, energy grade line and critical water surface; sections held at critical depth are circled;
- a **table** per section: river station, flow, channel bottom, water surface, critical water surface, energy grade line, depth, velocity in the channel and overall, the channel Froude number, flow area, top width, the flow in each overbank and the channel, the energy slope, and warnings;
- **warnings** in plain words, for example a section set to critical depth, water above a section's ends, or a big change in conveyance between two sections (add sections in between).

{{ui:Table (CSV)}}, {{ui:Report}} (plain text with the method, the boundaries and every table) and {{ui:Plot (SVG)}} save to your downloads. Each one carries the review line.

Tick {{ui:Show the flood extent}} in **Properties** to shade the wet area on the plan for the chosen profile, with the waterline drawn where the depth is zero. Between sections the water surface is level across the river and changes linearly with river station. Ground behind a levee is left dry while the water is under its crest. Other low ground inside the river's corridor that the water cannot reach (behind a road embankment, say) is still shaded: check it.

## On the drawing and in Problems

The river's lines go to the plan, the PDF and the DWG on their own layers: **C-WATR-CNTR** (the centerline), **C-WATR-SCTN** (each cut line, with its river station) and **C-WATR-FLOD** (the flood extent's waterline, when {{ui:Show the flood extent}} is ticked for a profile). The river's warnings (a section set to critical depth, water above the section ends, a change in conveyance that asks for more sections, an energy balance that did not close, a levee inside the banks) also go to the **Problems** panel, about the river and placed at the section they come from.

## How it is computed

- Energy between two sections: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Conveyance by subdivision: each overbank is split where its n changes, K = Σ (1/n)·A·R^(2/3) (1.486/n in US units); the channel is one piece, with a composite n when its n changes. α comes from how the conveyance is split.
- Friction slope by average conveyance, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², over the flow-weighted reach length.
- Contraction coefficient when the flow speeds up downstream, expansion when it slows.
- Critical depth = least specific energy. Each water level is solved on a bracket, so it never jumps to the wrong side of critical; when no answer exists it is set to critical depth and flagged.

The program is checked against Manning's normal depth, critical depth in a rectangular channel, and Chow's backwater example (*Open-Channel Hydraulics*, 1959, chapter 10) integrated independently. The same method is used by the common 1D river programs, so a hand calculation or a student's notes carry over.

## Culverts and bridges

In the river's **Properties**, under **Culverts and bridges**, {{ui:Add a culvert}} or {{ui:Add a bridge}} puts one between two sections (every stretch keeps at least two). The profile below it is unchanged; the water surface just above it comes from the structure, and the profile carries on upstream from there. **Results** adds a table of each structure: tailwater, headwater level, which control governs, the flow through the opening and the flow over the road or deck. Subcritical flow only.

- **Culvert** (box or round, one or more equal barrels). Entrance control is weir flow while the entrance is free and orifice flow once it is drowned, blended between a headwater of one and one and a half times the rise. Outlet control is the energy balance: entrance loss, friction and exit velocity head, over the higher of the tailwater and the mid-height of critical depth and the crown, less the fall along the barrel. The headwater is the larger of the two. Tick **Water can go over the road** and the road's weir flow shares the flow with the barrels.
- **Bridge.** The opening is the section below the bridge, cut at the abutments, with each pier as an area that carries no flow. The water surface in the opening comes from the section below (expansion coefficient), and the section above from the opening (contraction coefficient). If the opening cannot pass the flow at that tailwater it runs at critical depth and the bridge is flagged as choking. If the water reaches the low chord the flow is pressure flow (sluice type while the tailwater is below the low chord, drowned above it), and water over the deck adds weir flow; the upstream level is the one at which they add up to the flow.

The coefficients (discharge, entrance loss, weir) are typed round-number defaults. Change them for your design. They are not the fitted charts that culvert design manuals print, so treat the headwater of a culvert near its limit as an estimate. Water over a road or deck, a drowned entrance, a choked opening and fast flow in a barrel are shown in **Problems**.

## Unsteady flow

{{ui:Unsteady flow…}} in the river's **Properties** routes a flood hydrograph down the sections. Type the inflow as hours and flows, one pair per line, the downstream slope (normal depth) and how long to run. It starts from the steady water surface at the first flow and solves the full one-dimensional equations (the implicit four-point scheme, weighted 0.6 in time). You get the peak water level and flow at every section with the hour each one happens, a plot of the flow at the two ends, and the volume check (in, out and the change stored). It is checked for steady flow staying steady, a step in the inflow ending at the steady profile of the new flow, volume closing, and the speed of the flood wave against the kinematic wave. Subcritical flow, one reach, no side inflow, and no culverts or bridges inside the run.

## Junctions

Reaches that join flow to one outlet: the flows add, and the water surface at the head of the downstream reach is carried up to the ends of the reaches that join it (the same water surface at the junction, the simple method: no angle, no momentum, so it suits low Froude numbers). The model and tests are in place (`river-structures.js`); a panel to join two rivers on the plan is not built yet.

## Not built yet

Weirs and gates as their own structures, a panel for junctions, structures inside an unsteady run, and supercritical unsteady flow. A mixed-regime run flags a hydraulic jump between two sections but does not place it.

**Where rivers join.** In a river's Properties, "Flows into" names the river it joins. The rivers that join are solved together: the river they flow into carries the sum of their flows, and each of them ends at the water surface of that river's first section (the equal water surface method; it leaves out the angle and the momentum of the flows). To join a main river and a creek, draw a short river below the junction and let both flow into it. Results show a junction table. The defaults in these results (contraction 0.1, expansion 0.3, one-piece channel with a composite roughness, the mixed regime by specific force) stay until an engineer reviews them, and the Results say so.
