---
title: What's new in 0.6
summary: CivilCraft 0.6 adds arcs in feature lines, corridor edges that follow other lines, a structure builder for pipe networks, vehicle swept paths, sanitary design flows, cut and fill sent to TakeoffCraft, and sums wherever a length is typed.
section: start
order: 5
keywords: whats new, what's new, release notes, changelog, changes, 0.6, version, new features, arc, curved feature line, corridor target, widening, gutter grade, structure builder, structure type, rectangular structure, manhole, swept path, turning path, design vehicle, trailer, reversing, sanitary, sewer, peak flow, peaking factor, cut and fill, earthwork, takeoff, calculation, arithmetic, toolbar, interface size, pen, touch, indonesian
---

This is what changed in CivilCraft 0.6, compared with 0.5. Most of it was asked for on public ideas boards and in the CadCraft Discord.

## New

### Feature lines

- **Arcs in feature lines.** A segment can be an arc whose ends sit at different elevations, with its grade running evenly along the curve. Press {{key:C}} while drawing (a point on the curve, then its end), or type a radius and `L` or `R` in the vertex's **Arc** box in Properties. Properties shows the plan length and the 3D length. See [Arcs](topic:feature-lines#arcs).
- **Arcs everywhere the line goes.** Stepped offsets, the profile view's crossings, the surfaces and the 3D view follow the arc. LandXML writes and reads feature lines with their arcs; DXF and DWG get 3D polylines in short pieces that CivilCraft reads back as the same feature lines, arcs and all. See [Arcs in other files](topic:feature-lines#arcs-in-other-files).

### Corridors

- **Corridor targets.** A corridor's edge of pavement or shoulder edge, on one side, can follow a line in width or in elevation: a feature line, to widen a lane or hold a gutter grade, or another corridor's line, which keeps following when that corridor changes. Each target says at how many sections it reached its line. See [Targets](topic:corridor#targets).

### Pipe networks

- **A structure builder.** {{ui:New structure type}} builds a structure from its parameters: round or rectangular, inside size, wall, floor slab, sump and frame and cover, drawn in plan and section as you type. Rectangular structures show as rectangles on the plan, in 3D, DXF, DWG and PDF, and go to LandXML as rectangular structures. See [Structure types](topic:pipe-network#structure-types).
- **Share a type through the library.** {{ui:Save as library item}} saves a structure type as a library item, and {{ui:Open a library item}} reads one back. See [Share a type through the library](topic:pipe-network#share-a-type-through-the-library).
- **Sanitary design flows.** Set a pipe network's type to Sanitary and enter the people and area that enter at each manhole. CivilCraft works out each pipe's peak flow with a peaking factor and infiltration, how full it runs and how fast, lists pipes over the limit, too slow or too fast, and sizes the pipes. It was checked against a published design sheet. See [Work out sanitary design flows and check the sewer](topic:sanitary-design).

### Swept paths

- **Vehicle swept paths.** Drive a vehicle with up to three trailers along a feature line or an alignment, forward or reversing: say where the trailer goes, and CivilCraft works out the steering the cab needs. The swept outline and the outer wheel paths show on the plan and go to the PDF, DXF and DWG. See [Vehicle swept paths](topic:swept-paths).
- **Read the result.** Properties gives the largest steering and articulation against their limits, where it jackknifes and the swept area, and a slider shows the vehicle anywhere along the line. The vehicles to start from are placeholders: set your own design vehicle. See [Read the result](topic:swept-paths#read-the-result).

### Earthwork

- **Cut and fill to TakeoffCraft.** {{ui:Send to TakeoffCraft}} at the foot of the Earthwork block saves the project's cut and fill, in cubic yards or cubic meters, as a quantities file. TakeoffCraft opens it as two items to price. Send again after a design change: the same items take the new numbers and keep their rates. See [Send them to TakeoffCraft](topic:volumes#send-them-to-takeoffcraft).

### Typing lengths

- **Sums wherever a length is typed.** Every box that takes a length or an elevation reads `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3` or `2*450mm`, and plain lengths such as `12'6"` or `450 mm`, in the project's units. Station boxes keep reading `10+00` as a station. See [Typing lengths and sums](topic:units-and-stations#typing-lengths-and-sums).

## Fixed

- Closing a project where only feature lines had changed didn't ask about unsaved work. Feature lines count now.

## In every app

- **The toolbar can't get lost.** While full screen hides the bars, a small {{ui:Show bars}} tab stays at the top of the window. {{ui:Settings}} › {{ui:General}} › {{ui:Reset the layout}} puts the toolbar, panels, screen mode and menu style back to how the app starts (your interface size and panel text size stay). In CadCraft Studio, its own {{ui:Settings}} has {{ui:Reset the layout in every app}}. See [Where did my toolbar go?](common:lost-toolbar).
- **A menu on the toolbar.** Right-click the toolbar, or press and hold it, to arrange it, lock it so nothing moves by accident, or reset it. Ribbon menu styles collapse to their tab names: a tab opens its tools for one command; double-click a tab or use the pin to keep the ribbon open. See [The toolbar's own menu](common:lost-toolbar#the-toolbars-own-menu).
- **Interface size.** {{ui:Settings}} › {{ui:General}} › {{ui:Interface size}} makes the bars, toolbars, panels and dialogs 80 % to 140 % of normal, for this app only, so two apps side by side on one monitor both fit. The drawing keeps its own zoom. See [Everything is too big or too small](common:lost-toolbar#everything-is-too-big-or-too-small).
- **Pen and touch.** On a tablet or a touch-screen laptop with a pen, your palm is ignored while you draw, fingers can be left to moving the view, a two-finger tap undoes and a three-finger tap redoes, and the pen's side button and eraser end can undo or redo. {{ui:Settings}} › {{ui:General}} › {{ui:Pen and touch}}. See [Draw with a pen on a tablet](common:pen-and-touch).
- **Live sessions can grow past 20 people.** In CadCraft Studio, when more people knock than the usual 20, Studio tells you what to expect and you choose {{ui:Allow anyway}} for this session or {{ui:Keep it at 20}}. {{ui:Recent edits}} in the Live panel shows who changed what. See [Work together live](common:work-together-live#when-many-people-join).
- **Bahasa Indonesia** is new in {{ui:Settings}} › {{ui:General}} › {{ui:Language}}: a machine-made draft of every word, not yet reviewed by a native speaker. **Spanish (Mexico)** is still a draft too. Help topics are in English.
- **Installers are still not signed** (signing comes next, in 0.7), and CadCraft Studio is not in an app store yet. Check the SHA-256 beside each file on getcadcraft.com/download. On Windows, if SmartScreen stops the installer, choose {{ui:More info}}, then {{ui:Run anyway}}. On a Mac, the first time, right-click CadCraft Studio and choose {{ui:Open}}. There is no iPad or iPhone build yet.
- **Fixed:** with the bars hidden, {{ui:Arrange the toolbar…}} in Settings was grayed out, and from the keyboard it lost its place after the first move.

## Not in this version yet

- Arcs in drawn breaklines.
- Corridor targets move only the edge of pavement and the shoulder edge, in width or elevation, one side each. Daylight targets, regions and tapers aren't built yet. See [What is not built yet](topic:corridor#what-is-not-built-yet) for corridors.
- Standard design-vehicle tables: the five vehicles that ship are labeled placeholders.
- Structure types saved to the library are filed under "other", because the library has no drainage category yet.
- Water mains, flows that change over time, and links between water and storm networks. The sanitary design is steady peak flow only.
- Feature lines shared between projects wait for team projects, and site massing isn't built yet.
- Everything else is in [What is not built yet](topic:not-built-yet).
