---
title: Sag and tension
summary: Your load cases (temperature, wind, ice) and tension limits, how CivilCraft works out each section's tension, and the stringing tables.
section: tasks
order: 163
keywords: sag, tension, load case, temperature, wind, ice, asymmetric ice, ruling span, equivalent span, change of state, catenary, stringing table, breaking strength, everyday stress
---

## Load cases and limits

{{ui:More}} › {{ui:Load cases and limits…}} edits the rules every line in the project follows.

- **Load cases**: a temperature, a wind pressure on the conductor (Pa), and radial ice (mm, with its density). The first case is the reference.
- **Tension limits**: a share of the conductor's breaking strength, on the horizontal tension or on the largest tension at a support, in one load case. Or give the horizontal tension yourself.
- **Clearances**: the clearance the conductor keeps over the ground, a road, a building and so on. Add, rename and remove them: they are yours. Below them, choose the rules for **Landscape plants under a line**, **Landscape walls under a line** and **Underground crossings**.
- **Cases the checks use**: which case gives the largest sag (hot), the insulator swing (wind), ice, and ice on one side of a support.
- **Factors**: phase spacing factor k, largest insulator swing, a factor on support and fitting loads, the turn angles that make angle and dead-end supports, the least cover over buried cables, the largest voltage drop.

## Packs: rules and a library for a country

No country's rules are built into CivilCraft. A **pack** keeps a rule set and a library together in one file (`.cclinepack.json`), for a country, a network operator or a company:

- **Save as a pack…** in {{ui:Load cases and limits…}} writes the rule set shown and your library (or, with nothing in your library yet, the items this project uses). Type the **Country or region** first.
- **Open a rule set or pack…** reads a pack, a rules file or a library file. A pack's rules are shown in the dialog (click **Apply** to use them) and its items go into your library.
- Packs others share are listed on the add-ons page under **Power line packs**. Two example packs show the format; they are not any country's rules.

Every pack is checked when it is opened, like any file. Check every value against the standard that applies before anything is built.

Two example rule sets are there to start from: **Example: cold climate** and **Example: mild climate**. Their numbers come from no standard: set the values your standard gives. {{ui:Save rules}} and {{ui:Open rules…}} share a rule set as a file.

## How the tension is worked out

For each section between dead-ends:

1. The **ruling span** is √(ΣL³ ÷ ΣL) of its spans.
2. Each limit is turned into a horizontal tension in the reference case through the **change-of-state equation** on the ruling span: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. The most restrictive one sets the tension.
3. Every load case's tension follows from that one, and each span's shape is the exact **catenary** through its two attachment points (spans on a slope included): sag from the chord, length, and the tension at each end.

The load per metre in a case: weight plus ice (ice area × density × g) vertically; wind pressure × the iced diameter horizontally.

## Stringing tables

{{ui:More}} › {{ui:Stringing tables…}} lists, for each section, the horizontal tension and every span's sag at each temperature of the rule set (−5 °C to 40 °C by 5 °C to start with), in still air. Save them, and the supports table, as CSV.

Not counted: conductor creep over the years, and the stretch of a new conductor. Add them through the temperatures you string at.
