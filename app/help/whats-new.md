---
title: What's new in 0.4
summary: CivilCraft 0.4 adds cross sections and mass haul, feature lines, plan and profile sheets, description keys, superelevation, storm drainage, parcels, traverses, staking reports, point editing, grid shift files, KML, and more GIS and map layers in 3D, the PDF and DWG.
section: start
order: 5
keywords: whats new, what's new, release notes, changelog, changes, 0.4, version, new features, sections, mass haul, feature lines, sheets, superelevation, drainage, parcels, traverse, staking, kml, grid shift, spanish, touch
---

This is what changed in CivilCraft 0.4, compared with 0.3, the version Try runs now.

## New

- **Cross sections.** Add sample lines to an alignment to see the ground and the design across the road at every station, with cut and fill shaded and the volumes by average end areas (download them as CSV). {{ui:Sections}} is under Surface › {{ui:More}}, or press {{key:X}}. See [Sample lines and cross sections](topic:sections).
- **Cross-section sheets.** {{ui:Section sheets (PDF)}} under an alignment's sample lines puts every section on PDF pages in rows, with cut and fill shaded and each section's areas. See [Section sheets](topic:sections#section-sheets).
- **Mass haul.** From an alignment's sample lines: the mass-haul diagram with shrink or swell, balance points, the volumes moved and how far, and what is left as waste or borrow. See [Mass haul](topic:sections#mass-haul).
- **Feature lines.** Draw 3D lines and grade them vertex by vertex (elevations or grades), make stepped offsets (a curb back 0.5 ft and up), and use them as breaklines of the ground or, closed, as sloped pads with cut and fill slopes to daylight. {{ui:Feature line}} is under Surface › {{ui:More}}, or press {{key:L}}. See [Feature lines](topic:feature-lines).
- **Plan and profile sheets.** Select an alignment and choose {{ui:Plan and profile sheets}} to plot it as a set of sheets in one PDF: the plan turned along the road above, the profile below at the same scale, and match lines between sheets. See [Plan and profile sheets](topic:plan-profile-sheets).
- **Description keys and line codes.** Field codes become point groups with long descriptions, and line codes join coded points into lines: B begins, E ends, C closes. Breakline groups follow those lines, so a curb with a gap is never stretched across it. Open {{ui:Description keys and line codes}} under **Points**. See [Description keys and line codes](topic:description-keys).
- **Superelevation.** Tick {{ui:Superelevate the curves}} under a corridor: the lanes rotate through each curve by a rate table, with runoff and runout worked out and a superelevation diagram. Sections, volumes, 3D and sheets follow. See [Superelevation](topic:corridor#superelevation).
- **Storm drainage.** Draw catchments over the pipe network: flows add up down the pipes by the rational method, {{ui:Size the pipes for these flows}} picks sizes by Manning's equation, and the hydraulic grade line flags pipes flowing full and structures where water reaches the surface. See [Work out storm flows, pipe sizes and the hydraulic grade line](topic:storm-drainage).
- **Parcels.** Draw parcels or type the calls from a deed: closure and precision as you go, bearings, distances and curves labeled on the plan and in the PDF and DWG, and a draft legal description to copy. See [Draw parcels and write their legal descriptions](topic:parcels).
- **Traverses.** Type angles or bearings and distances: the angular and linear closure and the precision show as you type, the compass rule adjusts the stations, and they go in as survey points or a parcel. See [Enter a traverse and adjust it by the compass rule](topic:traverse).
- **Staking reports.** From an alignment: stakes at stations and offsets (or the survey points near it) with design and ground elevations and cut or fill, as CSV or PDF. See [Make a staking report](topic:staking).
- **Edit one point.** Select a survey point to change its number, coordinates, elevation or description in **Properties**, or drag it on the plan. The surface follows, and so do breaklines drawn through it. See [Edit a survey point](topic:edit-points).
- **Lasso selection.** Hold {{key:Shift}} and drag round survey points to select them as a window, a crossing or a fence ({{key:Space}} switches while you drag); a straight drag still draws a box. See [Lasso selection of survey points](topic:lasso-selection).
- **Grid shift files.** A NAD27 project can use NADCON5, or any NTv2 or PROJ grid file, in place of the rough datum shift, so latitude and longitude, GIS files and map layers land where they belong. See [Grid shift files](topic:coordinate-systems#grid-shift-files).
- **KML and KMZ.** Open KML or KMZ files from Google Earth or a web map as GIS layers, and export to KML or KMZ from GIS › {{ui:Export}}. See [Import GIS data](topic:gis-import) and [Export as-built data for GIS](topic:gis-export).
- **Labels from attributes.** Label a GIS layer's features with one of its fields (the layer's menu › {{ui:Label with}}). The labels go into the PDF, DXF and DWG too. See [Label features from an attribute](topic:gis-import#label-features-from-an-attribute).
- **Open DWG and DXF drawings as linework.** Open or drop a .dwg or .dxf (or use Surface › {{ui:Linework}}) to bring the drawing's model space onto the plan layer by layer, and use its contours, 3D polylines and closed outlines for the surface. See [Open a DWG or DXF as linework](topic:open-dwg-dxf).
- **Drive and sun in 3D.** Drive along an alignment from the driver's seat, and light the site from where the sun is at any date and time, with shadows. See [View the site in 3D](topic:site-3d#drive-along-an-alignment).
- **Work by touch.** Bigger buttons, tap to pick, pinch to zoom, and a long press for the second click. While you draw, a bar with {{ui:Finish}}, {{ui:Undo point}} and {{ui:Cancel}} appears at the top. See [Keys and mouse](topic:keyboard#mouse-trackpad-and-touch).
- **Recover your work.** CivilCraft keeps a copy of the open project in the browser while you work. After a crash, a closed tab or a reload, it asks **Recover your work?** See [Recover unsaved work](common:recover).
- **Spanish (Mexico), as a draft.** Settings › General › **Language** offers Español (México). It is a machine-made draft that nobody has reviewed yet, and the help topics are still in English.
- **Find anything.** Press {{key:Mod+K}}, or click **Find** in the bar at the top, and type a few letters to run a tool, jump to a setting or open a help topic. See [Find a tool or setting](common:find-tools).

## Improved

- **Pick in 3D.** Click an alignment, a pad, a feature line or a breakline in the 3D view to select it. The selection is highlighted in 3D and on the plan.
- **GIS layers in 3D.** The 3D view shows the GIS layers (Show › {{ui:GIS layers}}): 3D lines at their elevations, flat ones laid on the ground.
- **Map layers in 3D.** Choose {{ui:Map layers}} in the 3D view's color list to lay an aerial photo or map tiles over the surfaces.
- **Map layers in the PDF and DWG.** Map layers can go under the plan in the PDF plot, and beside the DWG as a picture it shows in place (the download is then a zip). See [Plot the plan to PDF](topic:plot-pdf).
- **Undo a surface swap.** Replacing the surface with an elevation grid, or rebuilding a LandXML surface from the points, can now be undone with {{key:Mod+Z}}.
- The extents of exports now include parcels, catchments and feature lines.
- Every word on screen comes from a language file, and counts read properly ("1 file", not "1 files").
- The view cube's words come from the language file too, so they follow the language you pick.
- The start screen lists the files you opened lately, in browsers that can reopen them (Chrome and Edge). Click one to open it again.
- Panels can have more windows of their own, up to four, one per monitor. See [Arrange the panels and use a second monitor](common:arrange-panels).
- {{ui:Save for offline}} says how much it keeps before you click.

## Not in this version yet

- **AI assistants.** The **Assistants** switch is in Settings, but an assistant connects through CadCraft Studio, which is not out yet.
- Desktop builds and cloud saving are not available yet.
- Vertical datums and geoid models are not handled: elevations are used as each file gives them.
- [What is not built yet](topic:not-built-yet)
