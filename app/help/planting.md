---
title: Planting plans and schedules
summary: Place single plants, planting beds filled at the plants' spacing with mixed plants by percentage, and hedges; label them; count them in a plant schedule for a spreadsheet or TakeoffCraft.
section: tasks
order: 152
keywords: planting plan, plant schedule, planting bed, mass planting, hedge, tree, shrub, groundcover, spacing, triangular spacing, plant count, quantities, labels, canopy, plant symbols, ifc, takeoff
---

## Place plants

1. Choose a plant in **Plants** on the left.
2. Click {{ui:Plant}}, then click on the plan: each click places one plant. Press {{key:Esc}} to stop.

A plant's symbol is drawn at its spread at maturity; More › {{ui:Show at planting size}} draws every plant at the size it goes in at. Trees sit on the ground under them: when you grade the site later, they follow it. To fix a plant at an elevation instead, type it in **Elevation** in Properties.

## Planting beds

1. Choose the main plant, click {{ui:Bed}} and click the bed's corners. Press {{key:Enter}} (or click the first corner again) to close it.
2. The bed fills with that plant at its spacing, in a **triangular** pattern (the usual one: each plant the same distance from six others), half a spacing in from the edge.
3. In Properties, **Add a plant** mixes in the plant chosen on the left. Set each plant's **Share %**: the bed takes exactly that many of each, spread through it. **Mix again** shuffles where they go.

**Spacing** empty uses the plants' own spacing (weighted by their shares); type one to use it for every plant. **Pattern** can be square, and **Rows at** turns the rows.

## Hedges

Choose the hedge plant, click {{ui:Hedge}}, click along the hedge and press {{key:Enter}}. Plants go along the line at their spacing, centred so both ends have the same margin. A hedge can be **two rows, staggered**, a set distance apart.

## Labels

Single plants are labelled with the label setting (`{name}` by default); type your own label for one plant in Properties. Beds are labelled with each plant's count, hedges with theirs. More › {{ui:Plant labels}} turns labels on and off. Label fields: `{name}`, `{botanical}`, `{size}` (the container), `{qty}`, `{height}`, `{spread}`, `{container}`.

## The plant schedule

More › {{ui:Plant schedule…}} counts every plant by species, from single plants, beds and hedges together, with its planting size. Save it as **CSV** or **XLSX**, or **Send to TakeoffCraft**: a quantities file TakeoffCraft opens to price the plants (with the hardscape and irrigation quantities beside them).

## IFC

More › {{ui:Export landscape IFC}} saves the landscape as an IFC file (IFC 4.3) a BIM model can hold: each plant an `IfcGeographicElement` of type VEGETATION, typed by its species with the plant's properties (botanical name, sizes, hardiness, water, light), each bed and hedge one element with its counts, on the site. BimCraft opens it beside the building.
