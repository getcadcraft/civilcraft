---
title: Plant records, cultivars and supplied sizes
summary: Your project's own plant list as a table: cultivars, supplied sizes (container, rootball, girth, clear stem), density, specification notes, CSV in and out; each placed plant names a size; plant symbols by scale and your own symbols and 3D models.
section: tasks
order: 159
keywords: plant table, plant database, cultivar, variety, supplied size, container, rootball, root ball, bare root, girth, clear stem, density, plants per square metre, specification, spec notes, plant symbol, block, own symbol, 3D plant, detail level, scale
---

Open {{ui:Plant table}} from the Landscape group's {{ui:More}} menu, or from the Plants section. Each row is a plant record in this project's own list (a record from the plant list is copied in when you add it). Every edit is checked the way an imported file is, and is one undo step.

## The columns

- **Botanical name**, **Common name**, **Type**, **Height** and **Spread** at maturity (metres).
- **Spacing** (centre to centre) or **Density** (plants per m²). A bed of a record with a density and no spacing is filled at that density, for its own pattern (triangular or square).
- **Supplied sizes**: one entry per size, separated by `;`. Each entry is an id, a kind (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) and then any of: a volume `10L`, a height `h0.6`, a spread `s0.4`, a girth `g14-16` (cm), a clear stem `st1.8`. Example: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Cultivars**: names separated by `;`. A cultivar keeps its own sizes and notes when the file you imported had them.
- **Specification notes**.

{{ui:Duplicate}} copies a row under a new key; {{ui:Save as CSV}} and {{ui:Save as a plants file}} write the list out (CSV rows for cultivars sit under their species, with `cultivar_of`). Importing a CSV or plants file merges it in.

## Your own Library plant list

Sign in to your CadCraft account (Settings, Your add-ons, Sign in) and the plant table can use the list you keep in the Library:

- {{ui:From my Library list}} brings in your own plant items (any that are still waiting for review too). A plant you already have here is updated from the Library; the cultivars, supplied sizes, density and specification you added here are kept.
- {{ui:Save as a plant list}} saves every row as your own Library plant item, one item per species: a new plant is a new item, a changed plant is a new version, an unchanged one is left alone. Tick the box first: saving gives the plants to the public under CC0. A first public upload from a person who is not yet trusted is checked by a person before it appears, as every upload is.

The Library keeps the basic plant record. Cultivars, supplied sizes, density and specification notes stay in the project and in the plants file ({{ui:Save as a plants file}}); the dialog says how many rows that affects each time you save.

## A placed plant names a size

Select a plant, a hedge, or a mix row of a bed or planted area: when the record has cultivars or supplied sizes, {{ui:Cultivar and size}} picks one. The plant schedule then counts by species, cultivar and size, and a label can show them: `{botanical} '{cultivar}' {size}` or `{full}`.

## Plant symbols by scale

{{ui:Plant graphics}} (Landscape › More) sets how plants are drawn in plan: **automatic** (coarser than 1:500 a circle at the spread, between 1:200 and 1:500 an outline with its centre, finer the detailed symbol; both scales can be changed) or one level for every scale. The Sheets dialog has its own **Plant detail in plan** for that set.

On a record in the Plants section, {{ui:Own symbol…}} reads an SVG, or a block of a DXF/DWG drawing, and draws it at the plant's spread at the detailed level. {{ui:Own 3D model…}} reads an OBJ, STL or GLB; in Plant graphics choose **Each record's own model** to see it in 3D. Files are capped (512 KB of SVG, 2000 shapes, 50 000 triangles) and kept in the project. SVG transforms are not applied (you are told when a file has them). See [Plant graphics, your own symbols and 3D plants](topic:plant-graphics) for the levels, the limits and what a GLB may hold.
