---
title: Corridor templates and terrain templates
summary: Make small reusable templates (curb and gutter, sidewalk, wall, ditch), build a corridor from them by station with left and right set apart, split an alignment into several corridors, and drape layered materials on a terrain.
section: tasks
order: 62
keywords: template, templates, template library, template creation, typical section, assembly, subassembly, components, point codes, end condition, daylight, ditch, retaining wall, curb, gutter, sidewalk, regions, station range, several corridors, multiple corridors, left and right, terrain template, topsoil, pavement, base, drape, materials, quantities
---

A **template** is a small cross-section you draw once and reuse: points with offsets, slopes and point codes, and components with materials. A corridor can be built from templates by station, each side with its own pavement templates and its own end condition, and the same templates can be draped on a terrain.

:::warning
The example templates are placeholders to start from. Their numbers are not taken from any standard or agency. An engineer must check every template, and every value you give it, before it is used for a design.
:::

## Open the templates

Open {{ui:Surface}} › {{ui:More}} › {{ui:Corridor templates…}} (or type {{cmd:TEMPLATES}}). The window has three lists:

- **In this project**: the templates this project's corridors and terrain templates use. They are saved in the project file.
- **My library**: templates kept in this browser and offered in every project. Use {{ui:Save to My library}} on a project template to keep it.
- **Examples**: two lanes with courses, curb and gutter, sidewalk, daylight, ditch, retaining wall, topsoil below the terrain, and pavement on the terrain. Each is marked "For checking by an engineer".

{{ui:Use in this project}} copies a library or example template into the project. {{ui:Export this project's templates}} saves them as a `.cctemplates.json` file, and {{ui:Import a file}} reads one into the project and My library. Use the file to share templates or move them to another computer.

## Make a template

{{ui:New template}} (or {{ui:Edit}} on a project template) opens the template editor. Draw the right side, outward from the template's 0,0 point; the left side uses the same template outward to the left.

1. Give it a name and a kind: **Pavement** (the next template attaches at its end), **End condition** (it meets the ground) or **Terrain template**.
2. Add **values**: named numbers such as a width `w` or a slope `s`. A number box anywhere in the template takes a number or a value's name; `-t` is the value `t` made negative. A corridor can give each use of the template its own values, so one curb template serves every curb height.
3. Add **points** in order. Each is placed from an earlier point (or the 0,0 point) by its constraint:

| Constraint | Places the point |
|---|---|
| Offset at a slope | An offset outward and a slope (rise per run; −0.02 falls 2%) |
| Offset and rise | An offset and a rise |
| Straight up or down | A rise only |
| Side slope to the ground | Out from its point to the ground, at the cut ratio where the ground is above and the fill ratio where it is below |
| To the ground | An offset, then straight up or down to the ground |
| Retaining wall | A wall of the thickness you give: in cut its top meets the ground at the road face, in fill the road runs over it and its outer face drops to the ground |

   Tick **Top** for the points the finished surface runs through. The last top point is where the next template on that side starts. A **Target** lets a corridor move the point: its offset or its elevation comes from a line.
4. Add **components**: closed shapes through point codes (`0` is the 0,0 point), each with a name, a material and a kind. Their areas give the volumes.

The drawing follows every change to true scale, and the list under it says what is wrong (a point that meets the ground before the end, a value the template does not have, a component with no area). {{ui:Add to this project}} or {{ui:Save}} keeps it, as one undo step.

## Build a corridor from templates

Select an alignment with a corridor and, in its Properties, turn on {{ui:Build from templates by station}}. The corridor starts with the two-lanes and daylight examples on both sides.

- **Regions.** Each region starts at a station and runs to the next region's. {{ui:Add a region}} adds one; change its start station in its box.
- **Left and right apart.** Each side of each region has its own **Pavement** list, from the centerline outward, and its own **End condition**: daylight, a ditch, a wall, or any template that meets the ground. With no end condition the side daylights at the corridor's cut and fill slopes. {{ui:Copy left to right}} copies a side.
- **Values and targets.** Under each template on a side, a box per value (empty = the template's own value) and, for a point that takes a target, the feature line or other corridor's line that moves it.
- **From and To** limit the corridor to part of the alignment.

The sections, the plan lines for every point code, the proposed surface, staking and earthwork all follow. Properties lists each component's volume per side and region (average end areas along the centerline). Superelevation and the corridor's edge targets are not used while the corridor is built from templates.

## Several corridors on one alignment

Under **Corridors on this alignment**, {{ui:Add a corridor}} adds a corridor on the rest of the alignment: the first corridor is given an end station at the middle (or keeps its own), and the new one starts there with the first one's last region of templates. Each corridor has its own name, station range, templates and earthwork. Turn one off with its {{ui:On}} box. Where two ranges overlap, the later corridor grades over the earlier one.

## Terrain templates

A terrain template drapes a template's layers on a terrain from its 0,0 point: a layer below the 0,0 point goes into the ground (topsoil to strip), a layer above it sits on the ground (base and pavement on a parking lot). Widths and slopes do not matter, only each component's depth above or below the 0,0 point.

Open {{ui:Surface}} › {{ui:More}} › {{ui:Terrain templates…}} (or type {{cmd:TERRAINTEMPLATES}}); the block is also in the project's Properties. {{ui:Add a terrain template}} adds one with the topsoil example. For each one pick:

- the **template** (its values can be changed for this one),
- the **terrain**: the existing ground or the proposed surface,
- the **shape** that clips it: the whole terrain, a parcel, a pad or a closed feature line. Several terrain templates can use different shapes on the same terrain.

Each layer lists its thickness, plan area and volume. Volume is the plan area times the thickness, the thickness measured straight down; the area is measured on a grid, and the draped (sloped) area is given too. The shapes are drawn on the plan on the layer C-TOPO-TMPL. Terrain templates do not change the proposed surface.

## Materials and quantities

The project's Earthwork block lists **Materials from templates**: every corridor component and terrain template layer with its volume. {{ui:Send to TakeoffCraft}} writes them into the quantities file after the cut and fill, one item each, in cubic yards (feet projects) or cubic metres.

## Files

Templates, regions, the extra corridors and the terrain templates are saved in the project file. A project that uses none of them is saved exactly as before, and older CivilCraft builds open a project that uses them (they ignore the templates and build the corridor's own assembly).
