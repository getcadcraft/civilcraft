---
title: The plant list
summary: About 420 common temperate and Mediterranean plants with their sizes, hardiness, light and water, searchable in any language, plus your own list saved with the project.
section: tasks
order: 151
keywords: plant list, plant database, species, botanical name, common name, plant palette, nursery list, hardiness zone, csv, import plants, export plants, my plants, tree list, shrub list, plantas, plant library
---

The **Plants** section of the left panel lists every plant you can place. Click one to see its sizes and to make it the plant that **Plant**, **Bed** and **Hedge** use.

## Search and filter

Type in **Search**: any word of a plant's name in any language (English, Spanish, Portuguese), its botanical name, its type or a word in its notes. Every word you type must match, so `quercus evergreen` finds the evergreen oaks. Accents do not matter.

Narrow the list with **Type**, **Light**, **Water** and **Hardiness zone** (the USDA zone your site is in: a plant is listed when the zone is within its range).

## What a plant carries

| Field | Meaning |
|---|---|
| Type | Tree, shrub, hedge, grass (lawns included), perennial, groundcover or climber |
| At maturity | Height and spread of the plant grown in a garden or a street, in metres |
| At planting | The size it goes in at, and its container |
| Spacing | Centre to centre in a bed or along a hedge |
| Hardiness zone | The USDA zones it is usually hardy in |
| Light, water, soil | What it needs |
| Notes | Uses and cautions, such as toxic parts or a plant that spreads |

:::note
The built-in list was written for CadCraft from general horticultural knowledge: typical sizes, rounded. It is not any nursery's catalogue. Check sizes and hardiness with a local nursery. The best-known invasive plants of Iberia and much of the temperate world are left out on purpose, and a few that are invasive somewhere carry a note.
:::

## Your own plants

- **Add to this project's list** copies a plant into the project's own list, where it is saved with the project. A plant in your list replaces the built-in one with the same key, so you can change its sizes for your region.
- **Import a plant list…** reads a CSV (or a plants file). The CSV needs a column with the botanical name and, ideally, type, height and spread; column names in your own words work (Latin, Common name, Height, Spread, Width, Zone). Commas, semicolons or tabs, and decimal commas, are read. Empty planting sizes, spacing and containers take sensible defaults for the type.
- **Export as CSV** saves your list (or, with none, the plants the search shows) to open in a spreadsheet.

A plant list is read like any file from outside: anything it cannot use is left out and counted.

## Plants in other apps

The plant list is one library for every CadCraft app: BimCraft and ModelCraft carry the same list, but their own Place from library does not offer plants yet. Today plants reach a BIM model through CivilCraft's landscape IFC (each plant an `IfcGeographicElement`). See [Planting](topic:planting#ifc).
