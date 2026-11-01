---
title: Soils, junctions, survey adjustment, pits, radio links and turnouts
summary: The six windows under Surface › More: soils and slopes, junctions and striping (three-centre curb returns, crosswalks, a drawing on the plan and a .dxf), survey adjustment (free networks, closing traverses, field files), open pits (phases and a schedule), radio links (availability and a tower check) and rail turnouts placed on an alignment.
section: tasks
order: 63
keywords: soils, boring log, slope stability, bishop, settlement, junction, intersection, curb return, three-centre, compound curve, crosswalk, striping, signs, sight distance, least squares, adjustment, free network, traverse, bowditch, compass rule, data collector, rw5, gsi, jobxml, pit, mining, block model, phases, schedule, npv, radio link, fresnel, availability, tower, wind, turnout, crossover, dxf
---

Open **Surface › More** and pick the window. Each one keeps its items in your project file, runs the same calculation the assistant runs, and says where a number is only a starting value. These are calculation aids: an engineer checks every result.

**Junctions and striping.** A junction is legs meeting at a point. Give each leg its own curb return radius if you like, or choose *Three centres (2:1:2)* for the compound return a turning truck needs. *Crosswalks* puts a crosswalk and a stop bar on every leg. Striping and signs go along an alignment. Items with *Show on the plan* set to yes are drawn on the plan, and **Save the road drawing (.dxf)** writes the same drawing with named layers (`C-ROAD-EDGE`, `C-ROAD-MARK-YELLOW`, `C-ROAD-XWALK`, `C-ROAD-SIGN`, `C-RAIL-TURNOUT`). Setbacks, widths and sign codes are placeholders: your authority's manual governs.

**Survey adjustment.** Enter points and measurements, or import a data collector file (RW5, GSI, JobXML, CSV). Choose *Free network: yes* when no point is held: the datum is fixed by the least that is needed, so coordinates depend on that choice but the residuals, the variance factor and the blunder test do not. **Save adjusted points (.csv)** writes the result. The readers were written from the formats' public descriptions and tested on files we made; they list every line they do not understand. *Traverses* closes a traverse by the compass rule and gives the misclosure and precision as 1 : n.

**Open pits.** Drill samples become a block model and the ultimate pit. Set *Pit phases* above 0 for nested pits by revenue factor, and the plant and fleet capacity for a schedule by period with a discounted cash flow. Every price, cost and slope is yours.

**Radio links.** Besides the line of sight and the margin, a link reports the multipath outage (the Vigants–Barnett estimate, no rain). Give the tower's face width to get the wind shear and moment at its base and an overturning factor.

**Rail turnouts.** Pick an alignment and a station and the turnout is drawn on it. All limits are placeholders until you set them from your railway's own standard.

**A haul ramp and the pit in 3D.** Give a pit a ramp width and the pit window lays a haul ramp on the walls at the ramp grade: it goes down each bench's wall for the bench height over the grade, then steps in to the next bench. A picture shows every bench rim and the ramp over them. "Ramp lane flattens the pit wall" makes the pit limit use the flatter wall a ramp on every bench needs. The ramp is a sketch on the stepped block walls, not a haul-road design; the window tells you when the road would have to lap the pit more than once, hang over a lower bench or does not fit the floor. "Cut the pit into the ground" digs the pit out of the existing ground and says how much; "Show in the 3D view" draws the cut ground, the bench rims and the ramp in the 3D view (the Open pits and haul ramps switch).

**Coverage.** Under Radio links, the Coverage tab takes a transmitter, its power and gains, the receiver sensitivity, a radius and a cell size and shades the area it can reach over the existing ground, on the plan and in a picture you can save. Each cell has free-space loss plus the worst ridge on the straight path (knife-edge diffraction, ITU-R P.526); it leaves out several ridges in a row, rain and antenna patterns, so it is a little optimistic. The tower on a link also gets a leg check: the leg compression and uplift from the wind moment and the weight, set against the leg capacity and load factor you give, and Euler buckling when you give the section. It is statics only: no tower code's numbers are built in, so your own code decides.

**Field files are untested on real ones.** The RW5, GSI, JobXML and CSV readers were written from each format's public description and tried only on files we made, including damaged ones that must not crash them. The survey window says so every time you import. Check the points and observations against your instrument's own report; if a real file does not read, send it to us (the community test note is in docs/community-tests/EG.11.md).
