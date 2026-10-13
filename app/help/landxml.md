---
title: Exchange LandXML
summary: Open LandXML from other civil software as a new project, export points, surfaces, alignments, profiles and the pipe network as LandXML 1.2, and know what does not make the trip.
section: tasks
order: 100
keywords: landxml, xml, import, export, exchange, tin, surface, alignment, profile, pipe network, interoperability, data exchange
---

LandXML is the open exchange format most civil programs read and write. CivilCraft reads and writes LandXML 1.2. If you have used Civil 3D, its LandXML import and export dialogs are the closest match; here there are no choices to make, and the notes tell you what was left out.

## Open a LandXML file

1. Click {{ui:Open}} (or press {{key:Mod+O}}) and choose the `.xml` or `.landxml` file, or drop it on the plan.
2. If the current project has unsaved changes, CivilCraft asks first. Choose {{ui:Save a copy}}, {{ui:Don’t save}} or {{ui:Cancel}}.
3. A **new project** is made. The status bar says what was read, for example "Opened site.xml: 412 points, 2 surfaces, 3 alignments."
4. Look at the box under the **Surface** facts. It lists everything that was skipped or changed, for example:
   - "Only the first surface ("EG") was opened; the file has 1 more."
   - "Alignment "Ramp A" has spirals or other elements CivilCraft cannot draw yet; it was skipped."
   - "Pipe network rules were not in the file; the placeholders are in use — set yours under Project."

What becomes what:

| In the file | In CivilCraft |
|---|---|
| Units (Imperial or Metric) | The project's **Units** (feet or metres) |
| Project name | The project **Name** |
| CgPoints | The project's points; the description (or code) gives the group |
| The first TIN surface | The existing ground, used as it is ("Surface (from LandXML)") |
| Every alignment of lines and arcs | An alignment with its PIs and radii rebuilt from the curves |
| The first design profile of each alignment | Its design profile, with parabolic vertical curves |
| The first pipe network | The pipe network, with its rims, sumps and inverts |

The full list of elements and attributes is in [LandXML: what is read and written](topic:landxml-reference).

:::note
A surface read from LandXML is not rebuilt when you change point groups or draw breaklines. Click {{ui:Rebuild the surface from the points}} in the **Surface** section to build it from the points instead ({{key:Mod+Z}} brings the LandXML surface back).
:::

## Export LandXML

1. Click {{ui:LandXML}} in the **Export** group.
2. The browser downloads `<name>.xml`. The status bar says what went in, for example "Exported LandXML 1.2: 276 points, 2 surfaces, 1 alignment, the pipe network. Pads are not part of LandXML here; the graded surface is."

The file holds:

- **Units**: US survey feet or metres.
- **CgPoints**: every point with its number as the name, its description and its group as the code.
- **Surfaces**: the existing ground as a TIN, with its breaklines and outer boundary as source data; and, when pads or corridors grade, a second TIN surface named "Proposed".
- **Alignments**: lines and arcs with their stations, each with a profile holding the existing ground sampled along it and the design profile (PVIs and parabolic curves) when it has at least two PVIs.
- **PipeNetworks**: structures with their rims, sumps and invert per pipe, and the pipes with diameter, length and slope.

## What does not make the trip

- Pads and corridors as objects. Their result is in the "Proposed" surface.
- Alignments with errors (for example overlapping curves): left out, and counted in the status message.
- Pipes without both inverts, and networks with fewer than two structures.
- A rim taken from the surface is written as a fixed rim. Opened again, the structure keeps that number even if the surface changes.
- Network rules (least slope, cover, drop): LandXML has no place for them.
- Display settings and point groups' surface choices: save a CivilCraft project for those.

When opening, CivilCraft does not read spirals, grid surfaces, points that only refer to other points, parcels, plan features, roadways or survey data. Each is named in the notes, never guessed.

## Round trips

To hand work to someone using other civil software and get it back, export LandXML, let them edit, and open their LandXML as a new project. Keep your own `.civilcraft.json` as well: it is the only file that keeps everything CivilCraft knows.
