---
title: What's new in 0.10
summary: Railroads with spirals, cant, track corridors, turnouts and clearance envelopes, the Swept path add-on for vehicles, big surveys that stay smooth when you zoom, and the concept stage with BimCraft and ModelCraft.
section: start
order: 5
keywords: whats new, what's new, 0.10, release notes, changelog, changes, version, new features, railroad, railway, rail, rail alignment, spiral, transition, cant, track, track corridor, ballast, sleepers, formation, turnout, crossover, clearance envelope, swept path, vehicle, truck, trailer, turning, big survey, large surface, outline, zoom, survey points, labels, concept stage, massing, building lines, boundary, ground surface, undo, paving, lawns, regulations, pro layouts, trackpad, swipe, tour
---

This is what changed in CivilCraft 0.10, compared with 0.9. The big parts are railroads and the Swept path add-on.

## New

### Railroads

- **Rail alignments** with spirals and cant, **track corridors** (ballast, sleepers, formation), **turnouts** and **clearance envelopes**, on the alignment, profile and corridor tools. See [Design a railway track](topic:railway).

### Swept paths

- **The Swept path add-on** (off by default) draws vehicle swept paths, checked against closed forms and published turning radii. See [Vehicle swept paths](topic:swept-paths).

### Big surveys

- A large surface no longer rebuilds its outline on every zoom, and survey points are thinned and labels capped when you zoom out.

### Concept stage

- With BimCraft and ModelCraft: survey points, a ground surface, the boundary, building lines and massing options. See [Draw building masses on a site](topic:building-masses).

## Fixed

- An edit that failed half-way left the half edit in the project.
- What linked paving and lawns change was outside the undo step.
- The Regulations add-on's language files had drifted, and a pack with no rules could not be ticked.

## In every app

- **Docking tool groups.** In a layout with a ribbon, tool rows or a toolbox, a group of tools can be docked as a palette beside the drawing. See [Dock a group of tools](common:dock-tool-groups).
- **Four Pro layouts** (Ribbon, Workbench, Review, Studio) in an optional Pro skin, in {{ui:Settings}} › {{ui:Global}} › {{ui:Layout}}.
- **A two-finger trackpad swipe pans** the plan.
- **Tour tips** have one {{ui:Next}} button; the X closes the tour.

## Said plainly

- No railway engineer has compared the rail tools with a standard, and the rail LandXML and IFC were not opened in another program.
- The Swept path add-on has not been checked against a real site and is in English only.
- The big-survey timings were taken on a busy server, so no number is claimed here.
- Docking tool groups has not been tried on two monitors.
- The new tools were checked by automated tests in a browser, not yet by a person on a real project.
- Languages beyond English are machine drafts, and some words new in 0.10 are still English only.

For the version before this one, see [What's new in 0.9](topic:whats-new-0-9).
