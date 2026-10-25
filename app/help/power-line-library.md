---
title: Your power-line library
summary: Make your own conductors, underground cables, supports, equipment and trench types, in categories you name, and share them as files.
section: tasks
order: 161
keywords: library, conductor, cable, pole, support, crossarm, insulator, fitting, stay, guy, transformer, cabinet, joint, trench, category, csv, import, export
---

The **Library** section of the Power lines workspace holds every item a line or a cable can use. Nothing in it is tied to a country or a maker: you make the items you work with.

## Three kinds of items

| Kind | Where it lives | Can you change it? |
|---|---|---|
| **Examples** | Shipped with CivilCraft, with generic numbers we worked out from material properties | No: {{ui:Copy to my library}} first |
| **In project** | Came with the project file you opened | No: {{ui:Copy to my library}} first |
| **Mine** | Your own items, kept in this browser | Yes, and changes save at once |

Every project keeps a copy of each item it uses, so a project opens on any computer with its own conductors and poles.

:::warning
The example items are examples: check every number against your supplier's data. The underground cables have no current rating on purpose, because it depends on how the cable is laid.
:::

## Make an item

1. In **Library**, choose the **Kind** (overhead conductors, underground cables, supports, equipment or trench types).
2. Click {{ui:New item}}, or pick an example and click {{ui:Copy to my library}} or {{ui:Duplicate}}.
3. Fill in its fields. Fields marked `*` are the ones the checks need; an item missing one is marked `!` and listed under **Checks** when a line uses it.
4. Give it a **Category**, with `/` between levels: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. The tree follows your categories.

What each kind needs:

| Kind | Needed for the checks |
|---|---|
| Overhead conductor | cross-section, diameter, mass per metre, breaking strength, elastic modulus, thermal expansion |
| Underground cable | cores, cross-section, voltage, diameter, resistance, current rating |
| Support | overall length, nominal load (taken at a point below the top), depth in the ground |
| Equipment | its type; a rated load for crossarms, fittings and stays; phase spacing and drop for crossarms; length for insulators; the angle for stays |
| Trench type | depth, width, cover over the cables |

## Share it

- {{ui:Save my library}} saves every item of yours as one `.cclines.json` file; {{ui:Open a library…}} reads one back (items with the same key are replaced).
- {{ui:Save as CSV}} saves the kind you are looking at as a spreadsheet; {{ui:Open a library…}} reads a CSV of that kind back. Columns may come in any order; a semicolon-separated file may use a decimal comma.
