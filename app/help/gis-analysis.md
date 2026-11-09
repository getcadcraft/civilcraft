---
title: Analyze GIS layers
summary: Buffer, overlay (intersect, union, erase, dissolve), spatial join, select by attribute and measure the GIS layers in a project, each as a new layer you can undo.
section: tasks
order: 142
keywords: gis, analysis, buffer, overlay, intersect, union, erase, clip, dissolve, spatial join, join, select by attribute, query, where, expression, statistics, area, length, perimeter, measure, parcels, easement, setback, shapefile, geopackage, attribute table
---

Once a project has GIS layers (see [Import GIS data](topic:gis-import)), the **Analyze** button in the GIS group (typed `GISANALYSIS`, `ANALYZE` or `BUFFER`) opens a panel with five tabs. It stays open beside the plan, so what you select is drawn on the plan while you work.

Every tool that makes something **adds a new layer** and leaves the layers it read exactly as they were. Each is one undo step: {{ui:Undo}} in the panel (or Ctrl+Z) removes the new layer. Export the result like any layer with [Export as-built data for GIS](topic:gis-export) as a shapefile, GeoJSON or GeoPackage.

The full table of a layer, with sorting, editing and a field calculator, is in [Work with a layer's attribute table](topic:gis-table); colouring by a field is in [Style a layer by an attribute](topic:gis-symbology).

Everything is worked in the plan, in the project's units (feet or meters). A project is always in a projected or local system, so a distance of 50 means 50 feet or 50 meters, never degrees. Heights (z) are not kept in the results.

## Buffer

Draws a zone of a set distance around every feature, as a new polygon layer. Points become circles, lines become corridors with rounded ends, polygons grow. A **negative** distance shrinks polygons (a 100 by 100 square shrunk by 5 is 90 by 90; shrunk by 60 there is nothing left, and the panel says so). Take the distance from a number field to give each feature its own, or tick **Merge all the buffers into one shape** to dissolve them.

The rounded parts are straight pieces drawn inside the true curve, so a buffer is a hair smaller than the exact circle: about 0.6 % in area at the normal setting, 0.16 % at Fine. Use Fine for anything you will measure.

## Overlay

| Tool | What you get |
|---|---|
| Intersect | The pieces where the input layer meets the overlay polygons, each with the fields of both. Lines and points are clipped to the polygons. |
| Union | Both polygon layers cut along each other's edges: shared pieces carry both layers' fields, the rest carry one layer's (the other's fields are empty). |
| Erase | The input polygons with the overlay polygons taken out. Fields stay with the input. A feature erased completely is left out (the panel counts them). |
| Dissolve | Merges polygons that touch or overlap, all of them or one shape for each value of a field. Adds `COUNT` and `AREA`. |

A field name that both layers have is kept for the first layer, and the second layer's is written with `_2`. Features inside one layer should not overlap each other: where they do, a Union counts the overlap in both.

## Join

A spatial join copies attributes from a **source** layer onto each **target** feature that meets it, and gives a new layer with the target's shapes. Choose when they meet: touching or overlapping, the target lying inside a source polygon, the target holding the source feature, the nearest source feature (with an optional limit), or any source feature within a distance.

When several source features match you take the first one's attributes (the nearest, for nearest and distance joins; `DISTANCE` is added), or **count them and total their number fields**: `COUNT`, and `SUM_`, `MEAN_`, `MIN_`, `MAX_` for each number field. Untick **Keep target features that found no match** to leave those out. Joined fields are empty where nothing matched, and the panel counts the unmatched.

## Select

Type a question about the attributes or the shape, press **Select**, and the features are drawn on the plan with their count, a table and the total area, length or number. Then make them a layer of their own, zoom to them or clear the selection.

| You can write | Example |
|---|---|
| A field by name; use "quotes" or [brackets] if the name has spaces | `VALUE`, `"Lot Number"` |
| Numbers, 'text', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (text ignores case; in `like`, `%` is any run and `_` one letter) | `Notes contains 'corner'` |
| `is null`, `is not null` (an empty value counts as null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` and brackets | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Shape values `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

A question that is incomplete or names a field the layer does not have is refused with a sentence that says where.

## Measure

Shows the total area and perimeter, length or number of the layer, and **adds fields** to it: `AREA` and `PERIMETER` for polygons, `LENGTH` for lines (the plan length), `X` and `Y` for points. A field that exists already is never overwritten: the new one is called `AREA_2`. This is one undo step. **Statistics** gives the count, sum, mean, minimum and maximum of a number field, optionally for each value of another field.

:::note
The checks behind these tools are worked by hand in the test (`node bin/test-civilcraft-gisanalysis.mjs`): for example parcels of 100 by 100 under a zone of 100 by 80 intersect in 3,000 plus 3,000, and a 100-long line buffered by 10 is 2,000 plus a circle.
:::
