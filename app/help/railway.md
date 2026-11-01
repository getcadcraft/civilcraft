---
title: Design a railway track
summary: Make an alignment a railway: rail transitions (clothoid, cubic parabola, Bloss, Helmert, sine half-wave, sine), cant on each curve with its equilibrium cant, deficiency and excess, cant limits as warnings, and a track with rails, sleepers and a ballast bed built as the corridor, in plan, sections, profile, 3D and quantities.
section: tasks
order: 62
keywords: railway, rail, railroad, track, train, metro, tram, cant, superelevation, cant deficiency, cant excess, equilibrium cant, transition, transition curve, clothoid, cubic parabola, bloss, helmert, sine half-wave, cosine, gauge, standard gauge, broad gauge, metre gauge, narrow gauge, sleeper, tie, crosstie, ballast, sub-ballast, formation, cess, track centres, 60E1, 54E1, UIC60, 115RE, 136RE, cant gradient, rate of change of cant
---

Any alignment can be a railway track. Its curves then get rail transitions and a cant (the rails' superelevation), and its corridor is built as a track: rails on sleepers on a ballast bed, graded into the ground like a road.

Every number below is a **placeholder**, not a standard. Railways set their limits by line speed, track type and country; set them from your own railway's standard. CivilCraft ships no national table.

## Make the alignment a railway

1. Select the alignment and find **Railway** in Properties.
2. Tick **This alignment is a railway track**. Each change is one undo step.
3. Set the **Design speed** at the top of the alignment's Properties: it is the line speed the cant is checked against. **Slowest trains** (in the Railway block) is the speed the cant excess is checked against.

## Transitions

Give each curve a spiral length at either end in the PI table (**Spiral in**, **Spiral out**), then choose its kind in the Railway block's curve table, or **Transition for every curve**:

| Kind | Curvature along the transition |
|---|---|
| Clothoid | grows evenly (the road spiral) |
| Cubic parabola | y = x³ / (6·R·L), with L measured along the tangent; the curve itself is a little longer |
| Bloss | 3u² − 2u³ of the full curvature (u = the share of the length): starts and ends gently |
| Helmert | two parabolas, 2u² then 1 − 2(1 − u)² |
| Sine half-wave | (1 − cos πu) / 2 |
| Sine | u − sin(2πu) / 2π |

All but the cubic parabola turn by L / 2R, like the clothoid. Stations run along the true length. LandXML keeps the kind (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Cant

Type the **Cant** of each curve in millimetres. The table shows for each curve:

- **Equilibrium** cant = G·v² / (g·R), G being the distance between the rails' centres (**Rail centres**, the gauge plus the rail's head width unless you type it). With G = 1500 mm this is the familiar 11.8·V² / R (V in km/h, R in m).
- **Deficiency** = equilibrium at the line speed − applied cant.
- **Excess** = applied cant − equilibrium at the slowest trains' speed.
- **Ramp**: the steepest cant gradient along its ramps, in mm per metre.

The cant ramps up over each transition, shaped like its curvature: straight for a clothoid or a cubic parabola, Bloss-shaped for Bloss, and so on. A curve end with no transition ramps on the straight before it, as long as the cant gradient limit needs, and says so: the cant then changes where the curvature does not.

**Cant turns about** says which rail stays on the design profile: **the low rail** (the usual), **the inner rail**, or **the track centre** (each rail moves half the cant). The design profile is the top of rail there.

The **Cant diagram** draws each rail's height over the profile along the stations; the profile view and the plan and profile sheets get the same as a band under the profile.

## Cant limits and warnings

**Most applied cant**, **Most cant deficiency**, **Most cant excess**, **Steepest cant gradient** and **Fastest change of cant** (the gradient at line speed, mm/s) are checked on every curve. A value over a limit is a warning in the Railway block and in the Problems panel, with the limit and the value found. With no design speed, deficiency and the rate of change are not checked (a note says so).

## The track

Set the **Gauge** (standard 1435 mm, broad, metre or narrow presets, or your own), the **Rail section** (60E1, 54E1, 49E1, 115RE, 136RE: their published dimensions only), the number of **Tracks** and their **Track centres**, then **Sleepers and ballast**: sleeper material, length, width, depth and spacing; ballast depth under the sleeper (at the low rail), shoulder, slope, how far its top lies below the sleepers'; sub-ballast depth, the cess past the ballast toe, and the formation's cross fall.

Press **Build the track**. It turns on the alignment's corridor, built as a track along the design profile: the rails and sleepers tilt with the cant, the formation does not. Daylight slopes run from the cess edge at the corridor's cut and fill slopes, and the track grades into the proposed surface like a road.

- **Plan**: both rails of each track (layer C-RAIL-TRAK) and, with more than one track, each track's centre (C-RAIL-CNTR), on screen, in DXF, DWG, PDF and plan and profile sheets.
- **Sections**: the sleepers, rails, the ballast's and sub-ballast's bottoms in every section.
- **3D**: the rails, every sleeper and the ballast bed (Show › Track), also in GLB, OBJ and USD.
- **Quantities**: track length, rail (both rails of every track, along each track's own line), sleepers, the ballast bed and the ballast less the sleepers, and the sub-ballast, by average end areas between sections.

## Not built yet

Turnouts and crossovers, clearance envelopes and structure gauges, track vertical checks (grade and vertical curve limits by speed), the cant and the track in the IFC export (not written yet), overhead lines and signalling.

**Which standard.** In the Railway block, "Standard to cite" takes None or European (UIC and EN). Choosing European names the documents a European project cites (EN 13803 for the alignment parameters, EN 13232 for switches and crossings, EN 15273 for gauges, EN 13848 for track geometry quality) and gives each limit a box for the clause it comes from. No number from any standard is built in: the cant, deficiency, excess, gradient and rate limits, the turnout geometry and the structure gauge are all still placeholders, and the window says so. A railway engineer checks each value against the standard's own text, and types the clause beside it, before anything is built. South Africa and the AREMA tables are not in this release.
