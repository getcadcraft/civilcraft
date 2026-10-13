---
title: Lay out a gravity pipe network
summary: Draw storm or sanitary pipe runs structure by structure, set your slope, cover and drop rules, let CivilCraft set inverts, and fix the problems it lists.
section: tasks
order: 90
keywords: pipe network, storm, sanitary, sewer, structures, manholes, inlets, inverts, cover, slope, drop, rim, sump, gravity pipes
---

A project holds one gravity pipe network, storm or sanitary. It is made of structures (manholes, inlets) and straight pipes between them. Flow runs in the direction you draw. CivilCraft checks every pipe and structure against three rules you set, and can set every invert from those rules.

## Draw a run

You can draw pipes without a surface, but rims, cover and automatic inverts need one.

1. Press {{key:P}}, or click {{ui:Pipes}} in the **Design** group.
   The hint says "Pipes: click structures from the top of the run down (click an existing one to join it). Enter finishes."
2. Click where the upstream structure goes. A structure is placed.
3. Click each next structure downstream. To connect to a structure that already exists, click on it: the status bar says "Joined S3."
4. Press {{key:Enter}}.
   The pipes are drawn, their inverts are set from the rules, and the status bar says, for example, "3 pipes drawn, 12", inverts set from the rules; every check passes."

New structures are named S1, S2 … with a 48 in (1200 mm) diameter. New pipes are named P1, P2 … with a 12 in (300 mm) diameter. Diameters are in inches in a feet project and millimetres in a metre project.

Finish with {{key:Enter}}. Double-clicking also works, but when you double-click on an existing structure to end the run there, the join is dropped: click it once, then press {{key:Enter}}.

## Set your rules

With nothing selected, the right panel (**Project**) has a **Pipe network** block:

| Setting | Starting value | Meaning |
|---|---|---|
| Type | Storm | {{ui:Storm}} or {{ui:Sanitary}}; written to LandXML |
| Least slope | 0.50% | Every pipe must fall at least this much |
| Least cover | 2 ft (0.6 m) | Ground to pipe crown, all along the pipe |
| Drop in structures | 0.10 ft (0.03 m) | The outlet invert must be at least this far below every inlet invert |

**These starting values are placeholders, not a standard.** Set the values your agency or project requires. Cover is measured from the ground to the crown (invert plus inside diameter); wall thickness is not counted. Where pads or corridors are graded, the graded surface is the ground.

## Let CivilCraft set inverts

- {{ui:Set every invert from the rules}} (in the **Pipe network** block) sets all pipes.
- {{ui:Set its inverts from the rules}} (with one pipe selected) sets that pipe only.

Working downstream, each run starts at least cover at its top structure, falls at least the least slope, drops at least the drop through each structure, and goes deeper wherever the ground along the pipe would leave less than the least cover. Inverts are rounded down to 0.01, never up. The status bar says "Inverts set: least cover at the top of each run, at least the least slope, at least the drop in each structure." or names what it could not do.

## Edit structures and pipes

Click a structure or pipe with {{ui:Select}} to see it in the right panel.

**Structure**: **Name**, **Rim**, **Sump depth**, **Diameter**, then **Rim used**, **Sump**, **Easting** and **Northing**, and the pipes in and out with their inverts.

- Leave **Rim** empty to take it from the surface; the box then shows the surface value in gray. Type a value to fix the rim.
- Drag the structure's grip on the plan to move it. Its pipes follow; their inverts stay as they were, so check the problems afterwards.

**Pipe**: **Name**, the structures it runs between, **Diameter**, **Upper invert**, **Lower invert**, then **Length**, **Slope** and **Least cover**.

Press {{key:Enter}} after each value.

## Read and fix problems

The **Pipe network** block lists every problem (up to 40); click one to select the pipe or structure. A selected pipe or structure lists its own. With none, it says "Every pipe and structure passes the rules."

| Message (examples) | What to do |
|---|---|
| "P2 runs uphill (-0.40%)." or "… runs flat …" | Swap the inverts, or set them from the rules. |
| "P2 at 0.30% is flatter than the minimum 0.50%." | Lower the downstream invert or raise the upstream one. |
| "P3 has 1.40 of cover 35 along it, less than the minimum 2." | Lower the pipe; set its inverts from the rules. |
| "In S3, P4 leaves at 245.20, less than 0.1 below P3 coming in at 245.25." | Lower the outlet pipe's upper invert. |
| "P1's crown is above S1's rim." | The pipe is too high for the structure. |
| "S2 has 2 pipes leaving it; a gravity network should have one way out of each structure." | Remove one outgoing pipe, or redraw it in the right direction. |
| "The pipes form a loop; flow has to end at an outlet." | A run was drawn back into itself; delete a pipe. |
| "S5 is off the surface and has no rim elevation." | Type a rim, or move the structure onto the surface. |
| "P6 runs partly off the surface; cover there is unknown." | Extend the surface, or accept that cover is not checked there. |
| "P7 has no inverts yet." | Type them, or set them from the rules. |

Problem pipes and structures are also marked in red on the plan.

## Delete

Select a pipe and press {{key:Delete}} to remove it. Deleting a structure removes the pipes connected to it as well. On a Mac, press Fn and delete, or click {{ui:Delete}}.

## Not built yet

Flows, pipe sizes and the hydraulic grade line are in [Storm drainage](topic:storm-drainage). Parts catalogs, pipes in the profile view, curved pipes, rectangular structures and more than one network per project are not available yet. See [Not built yet](topic:not-built-yet).
