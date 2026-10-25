---
title: Power-line checks
summary: What CivilCraft checks on every line and cable, always up to date: clearances, spacing, swing, uplift, support loads and sizing, fittings, stays, foundations, missing data, connections, overloads and voltage drop.
section: tasks
order: 164
keywords: checks, clearance, ground clearance, obstacle, crossing, phase spacing, insulator swing, uplift, support load, nominal load, sizing, foundation, stay, guy, fitting, crossarm, voltage drop, overload, missing data, disconnected
---

**Checks** in the Power lines section lists every problem, red for what fails and amber for warnings. Click one to select the line, support, cable or equipment it is about; failing supports and spans are ringed in red on the plan while the workspace is open.

:::warning
A design aid: these are checks of your design against your own rules, not a certification.
:::

## Clearances

The conductor's lowest phase is followed along every span at every load case. Its lowest clearance over the ground must reach the line's **Clearance rule**. Where a span crosses an **obstacle** (drawn with {{ui:Obstacle}}: a point or a line, with its height above the ground and its own clearance rule), the clearance over the obstacle's top is checked the same way.

**What the Landscape workspace puts above the ground counts too.** Single plants (their crown at mature spread and height), hedges and planting beds (the tallest species in them) and walls (their top) are obstacles under a line, without drawing them again. They keep the rules set in {{ui:Load cases and limits…}}: **Landscape plants under a line** (the example sets use *Trees and plants*, 3 m) and **Landscape walls under a line** (*Building*); choose **Not checked** to leave them out. The clearance is measured straight up from the top of the plant or wall to the conductor where the span crosses it; the distance sideways to a crown beside the line is not checked. Moving a tree or raising a wall changes the checks at once.

Your clearance rules are your own: open them with **Rules…** beside any **Clearance rule** (or {{ui:Load cases and limits…}}) to add, rename, change or remove them.

## Spacing and swing

- **Phase spacing** needed: k·√(sag + insulator length) + U/150, with the hot case's sag and the voltage U in kV (a common form; k is your rule set's). Compared with the crossarm's phase spacing.
- **Insulator swing** on suspension supports, under the wind case: atan(transverse load ÷ vertical load), against the rule set's largest swing.
- **Uplift**: a suspension support lower than its neighbours can be pulled up in the cold; it is flagged.

## Support loads and sizing

For each support and load case, with every conductor of the line:

- **Transverse**: wind per metre × the wind span (half of the two spans), plus 2·H·sin(turn ÷ 2) at a turn.
- **Along the line**: the difference of the two sides' tensions at a dead-end or angle; at a suspension support only under ice on one side (each span worked on its own, which errs on the safe side).
- **Vertical**: the vertical load per metre × the weight span (between the lowest points either side) plus the equipment.

The horizontal load is taken to the support's nominal point (equivalent load = load × attachment height ÷ height of the nominal point) and compared with its **nominal load** × the rule set's factor. When it is too weak, the smallest support of the same material in your library that carries it is suggested. A support with a **stay** passes the horizontal load to the stay, which carries load ÷ sin(stay angle) and is checked against its own rating.

Fittings (clamps, insulators, crossarms) are checked against their rated load: an anchoring fitting carries the conductor's tension, a suspension fitting its share of the vertical and transverse load. The **foundation** shown is the support's depth in the ground and a hole a little wider than its foot.

## Data, connections and current

- An item with a needed field empty, or a key that is not in the library.
- A cable route end, or equipment, connected to nothing.
- **Voltage drop** and **current** from each source (equipment marked as a source) to the loads (kW and power factor on equipment), along overhead spans and cables: √3·I·L·(R cos φ + X sin φ), with R at 20 °C. More than the cable's current rating, or more drop than the rule set allows, is flagged.
