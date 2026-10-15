---
title: What's new in 0.5
summary: CivilCraft 0.5 turns DWG and DXF blocks into survey points, shows feature lines in the profile, adds a grade and elevation overlay and 3D labels that face you, explains curves that do not fit, and adds menu styles, live sessions in CadCraft Studio and a phone layout.
section: start
order: 5
keywords: whats new, what's new, release notes, changelog, changes, 0.5, version, new features, survey points from blocks, feature lines in profile, grade overlay, elevation overlay, 3d labels, curve does not fit, largest radius, menu styles, keys, mouse, live, studio, phone, fold phone, tablet, settings, spanish
---

This is what changed in CivilCraft 0.5, compared with 0.4. It is a smaller release than 0.4: five wishes from public ideas boards, plus what came to every app.

## New

### Survey points from blocks

- **Blocks become survey points.** When you open a DWG or DXF, tick point blocks by name or by their layers. Each insertion becomes a survey point, numbered, described and raised from its attributes (or from the block name, the layer or the insertion height), in one undo step. Each point remembers its block, in the project file too, and its Properties show "From block". See [Open a DWG or DXF as linework](topic:open-dwg-dxf).

### Profiles and feature lines

- **Feature lines in the profile view.** Where a feature line crosses an alignment, its profile shows a labeled diamond with the line's name and its elevation at the crossing. Type a distance in {{ui:Alongside within}} to also show the lines running beside the alignment, as dashed lines. Click a diamond to select its line; {{ui:Feature lines}} in the profile bar hides or shows them. See [Design a vertical profile](topic:profile).
- **Grade and elevation overlay.** Press {{key:E}}, or tick **Grades and elevations on feature lines** under Display, to see each segment's grade with an arrow pointing downhill and the elevation at the vertices. It is on the screen only: the PDF, DXF and DWG stay as they are. See [Feature lines](topic:feature-lines).

### When a curve does not fit

- **CivilCraft says why, in numbers.** When alignment curves need more tangent than there is, a red box shows how much they need and how much there is, and offers the largest radius that fits at each PI, or both radii shrunk together. With a **Design minimum radius** set, it offers the smallest radius that meets it, or says why none fits. A vertical curve that is too long gets the longest length that fits, with K shown. Each fix is one click and one undo step. See [Lay out a horizontal alignment](topic:alignment) and [Design a vertical profile](topic:profile).

### The 3D view

- **Labels that face you.** {{ui:Show}} › {{ui:Labels}} in the 3D view shows alignment names and stations, major contours, pads, feature lines, structures and, with survey points shown, each point's number and elevation. Labels stay one size and upright however you turn, hide behind hills, and thin out where they would crowd. See [View the site in 3D](topic:site-3d).

### Menu styles

- **Three menu styles.** {{ui:CivilCraft}} is the toolbar you know. {{ui:Drafting classic}} adds a small ribbon and a command line: type ALIGNMENT, PAD, PIPE, PROFILE or ZOOM and press {{key:Enter}}. {{ui:Civil ribbon}} groups the tools in tabs of large buttons. See [Menus, keys and mouse](topic:menus-keys-and-mouse).

### Working together

- **Live sessions in CadCraft Studio.** Several people edit points, alignments and the design in one project at once, and every window builds the same surface. See [Design one site together, live](topic:work-live).

## Improved

- Messages about damaged or unsupported DWG and DXF files now come from the language file, also when the drawing is read in the background.
- BimCraft 0.5 can send a building site's terrain to CivilCraft as LandXML, and TakeoffCraft 0.5 exports spot elevations as a points file CivilCraft opens.

## Fixed

- The profile's readout could wrap the profile bar, so the plot moved under the pointer. It no longer wraps.
- A typed number could be applied twice (on {{key:Enter}}, then again on leaving the box), so raising a feature line by 2 raised it by 4. It is applied once now.

## In every app

- **CadCraft Studio is the desktop app.** From 0.5 the desktop download is CadCraft Studio: all eight apps in one install. The separate installer for each app stops. CivilCraft still runs in the browser, and as a browser edition you can download.
- **Installers are not signed yet.** Code signing comes with 0.6. On Windows, if SmartScreen stops the installer, choose {{ui:More info}}, then {{ui:Run anyway}}. The macOS disk image (Apple silicon and Intel, macOS 13 or later) is not signed or notarized: the first time, right-click the app and choose {{ui:Open}}. iPad, Android and iPhone come with 0.6.
- **Work together live.** In CadCraft Studio, {{ui:Live}} shares the file you have open: teammates on the same network join with a short code and edit with you, each with their own undo. Sessions on your own network are free, for everyone. Invite links over the internet aren't open yet. See [Work together live](common:work-together-live) and [Design one site together, live](topic:work-live).
- **Menus, keys and mouse.** In {{ui:Settings}} › {{ui:CivilCraft}} › {{ui:Menus, keys and mouse}}, pick a menu style ({{ui:CivilCraft}}, {{ui:Drafting classic}} or {{ui:Civil ribbon}}), give any command your own key, move commands between menus, set the wheel and the mouse buttons, and export or import a style as a `.ccinput.json` file. {{ui:Use this style in every app}} opens every app in its matching style. See [Menus, keys and mouse](topic:menus-keys-and-mouse).
- **A wider Settings dialog,** in two columns, so more fits without scrolling. See [CivilCraft settings](topic:settings).
- **Floating and bottom panels fit the window.** A floating panel stays above the status bar and shrinks with a small window; on a short window a panel docked at the bottom leaves the drawing room. See [Arrange the panels and use a second monitor](common:arrange-panels).
- **Phones and fold phones.** On a screen up to 760 px wide, or a phone held sideways, the plan keeps the screen: panels open as sheets from a bar at the bottom, and the toolbar is one row of icons that scrolls sideways (the group names are read to screen readers). {{ui:Tools}} hides the toolbar and {{ui:Move}} puts it at the bottom. The tool hint is one line; tap it to read all of it. Turning the phone, or opening and closing a fold phone, keeps your work, the selection and an open dialog. The app bar's {{ui:More}} menu holds the version, Find and the links. Phones work, but CivilCraft is made for larger screens.
- **Touch tablets.** On a touch screen each toolbar is one row that scrolls sideways instead of wrapping onto several lines.
- **Spanish** stays a machine-made draft that has not been reviewed yet. Help topics are in English.

## Not in this version yet

- Vertical datums and geoid models: elevations are used as the file gives them.
- 3D arcs in feature lines, corridor targets, feature lines shared between projects, a structure builder and vehicle swept paths.
- Survey points from blocks come only from blocks placed directly in model space: blocks inside other blocks and linked drawings are skipped.
- In a live session, GIS layers, map pictures, grid shift files and a grid surface loaded from a file are not shared, and CivilCraft shows no cursors of other people yet.
- [Not built yet](topic:not-built-yet)
