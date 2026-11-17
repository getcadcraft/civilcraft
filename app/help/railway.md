---
title: Design a railway track
summary: Make an alignment a railway: rail transitions (clothoid, cubic parabola, Bloss, Helmert, sine half-wave, sine), cant on each curve with its equilibrium cant, deficiency and excess, cant and track geometry limits as warnings, turnouts and crossovers by station, a clearance envelope swept along the line, and a track with rails, sleepers and a ballast bed built as the corridor, in plan, sections, profile, 3D and quantities.
section: tasks
order: 62
keywords: railway, rail, railroad, track, train, metro, tram, cant, superelevation, cant deficiency, cant excess, equilibrium cant, transition, transition curve, clothoid, cubic parabola, bloss, helmert, sine half-wave, cosine, gauge, standard gauge, broad gauge, metre gauge, narrow gauge, sleeper, tie, crosstie, ballast, sub-ballast, formation, cess, track centres, 60E1, 54E1, UIC60, 115RE, 136RE, cant gradient, rate of change of cant, turnout, switch, points, crossover, frog, frog number, lead, closure curve, diverging speed, clearance, clearance envelope, structure gauge, loading gauge, kinematic envelope, platform, platform gap, track spacing, gradient, vertical curve, minimum radius, LandXML cant
---

Any alignment can be a railway track. Its curves then get rail transitions and a cant (the rails' superelevation), and its corridor is built as a track: rails on sleepers on a ballast bed, graded into the ground like a road. Turnouts and crossovers go on it by station, and a clearance envelope can be swept along it and checked against what stands beside the track.

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

## Track geometry checks

Beside the cant, the Railway block checks the line itself against six more limits (all placeholders, all yours to set):

- **Steepest gradient** of the design profile, in mm per metre.
- **Least vertical curve radius**, as a factor k in R ≥ k·V² (R in metres, V in km/h). A parabolic vertical curve of length L between two gradients has a radius of L divided by the change of gradient.
- **Shortest vertical curve**.
- **Least curve radius** in plan (0 turns the check off).
- **Shortest arc or straight**, as seconds of travel at line speed: a circular arc, or the straight between two curves, shorter than that distance is warned. 1.8 s is the familiar "half the speed in km/h, in metres".
- **Rate of change of cant deficiency** along each transition, in mm/s at line speed.

**Track geometry** lists the steepest gradient found and every vertical curve with its radius and the radius the line speed needs. A vertical curve that lies on a transition or a cant ramp gets a note. With no design profile or no design speed, the checks that need one are skipped and a note says so.

## Turnouts and crossovers

Under **Turnouts and crossovers**, press **Add a turnout**. It is placed on the longest straight; set in the table:

- **Switch toe station**: where the turnout starts on this alignment.
- **Frog**: the frog number N (1:N). The frog angle is 2·atan(1 / 2N).
- **Side**: left or right, looking up-station.
- **Crossover spacing** in metres: above 0, the turnout becomes a crossover to a parallel track that far away (two turnouts and the straight between them).

The table shows the **Lead** (switch toe to frog), the closure curve's **Radius** and the **Diverging speed** that radius allows with your cant deficiency limit and no cant. **Make its track** turns the diverging route into an alignment of its own (the switch, the closure curve, then straight on at the frog angle) with the same railway settings, ready to be lengthened.

The plan draws each turnout's two diverging rails, its centreline, a tick at the switch toe and at the frog, and "1:N" (layer C-RAIL-TURN), on screen and in DXF, DWG, PDF and sheets. The 3D view draws the diverging rails at the main track's level.

The shape is a **placeholder**: a straight switch and one closure curve from the frog number. A built turnout follows the railway's standard and the maker's drawing. Warnings: a turnout that runs off the alignment, lies on a curve, a transition, cant or a vertical curve, or overlaps another; and a note when the line speed is above its diverging speed.

## Clearance envelope

Tick **Sweep a clearance envelope along this track**. Choose the **Outline** (two placeholder shapes, or **Your own outline** typed as one point a line: offset from the track centre, then height above the top of rail, in metres), the **Vehicle length** and **Bogie centres**, and, if there is one, a **Platform edge** (side, distance from the track centre, height above the rail).

At every station the outline is tilted with the cant about the low rail and widened by the curve: the middle of the vehicle moves in by b² / 8R, its ends out by (L² − b²) / 8R (b the bogie centres, L the vehicle length, R the radius there, following the transition). The block draws the section on the straight and where it is widest, and lists:

- the **widest envelope** and where,
- the **track centres** set against the centres two neighbouring envelopes need,
- the room left at the **platform edge**, or how far it is inside,
- every feature line, pipe structure and other railway alignment found **inside the envelope**.

A feature line with elevations is judged against the outline at its height above the rail; without a design profile, or for a point with no elevation, it is judged in plan only and the list says so. The plan shows the envelope's two edges (layer C-RAIL-CLRN) with a cross at each thing inside.

The outlines offered are **placeholders, not any railway's gauge**. Type your railway's structure gauge before relying on a result.

## In other programs

- **LandXML**: a railway alignment is written with its transitions (spiType) and a `Cant` block: the gauge, the rotation point, the line speed, and a station where each cant ramp starts and ends with the applied cant, the equilibrium cant and the deficiency. Opening a LandXML file with a `Cant` block makes that alignment a railway with those cants.
- **IFC**: the alignment with its cant segments, the rails, sleepers, ballast and sub-ballast.

## Not built yet

Turnouts in the IFC export, turnout families beyond the single closure curve (curved switches, swing-nose frogs, slips, diamonds), kinematic gauge rules (the envelope is a fixed outline with curve throw), overhead lines and signalling.

**Which standard.** In the Railway block, "Standard to cite" takes None or European (UIC and EN). Choosing European names the documents a European project cites (EN 13803 for the alignment parameters, EN 13232 for switches and crossings, EN 15273 for gauges, EN 13848 for track geometry quality) and gives each limit a box for the clause it comes from. No number from any standard is built in: the cant, deficiency, excess, gradient and rate limits, the turnout geometry and the structure gauge are all still placeholders, and the window says so. A railway engineer checks each value against the standard's own text, and types the clause beside it, before anything is built. South Africa and the AREMA tables are not in this release.
