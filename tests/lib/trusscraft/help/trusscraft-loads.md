---
title: TrussCraft: loads, combinations and tables
summary: Enter your own dead, snow or live, wind and uplift pressures and combination factors; chord bending, deflection, bearings and uplift; your own species and connector plate tables.
section: reference
order: 4
keywords: loads, combinations, wind, uplift, snow, dead, factors, bending, Fb, deflection, bearing, plate table, species table, csv, json, psf, kPa
---

## Your loads

Pressures are in kPa or psf (choose the unit). TrussCraft does not know any standard's loads, wind map or snow map: type what your standard gives.

| Case | Meaning |
|---|---|
| Dead | Roof dead load on the slope, ceiling dead load on the bottom chord. |
| Snow or live | Snow (or roof live) on plan; the attic floor live load goes on the room floor. |
| Wind | A pressure normal to the roof, windward on the left half of the span and leeward on the right (+ pushes onto the roof, − is suction). |
| Uplift | A net upward pressure on plan. |

Each **combination** row multiplies the cases by factors you type, with its own duration factor. A row with every factor zero is not run. If wind or uplift pressures are set but no combination uses them, Problems says nothing was run. Under uplift the forces reverse, so a bottom chord that is in tension under gravity is checked as a compression member; each member shows its largest tension, largest compression and governing combination in the member list.

## Checks

- **Axial** force by the method of joints, tension on the gross section, compression with a column stability factor from E_min.
- **Bending** of a chord between panel points: a simple span (w L² / the divisor you set, 8 by default). It is **checked only when you give an Fb** (or load a species table with one). Without it the bending stress is reported and the Problems say it was not checked.
- **Deflection** under dead plus snow, by virtual work from the species table's E. A limit you enter (span / n) is checked; without one a note says none is. Chord bending, joint slip and creep are not in it.
- **Bearings**: the largest reaction at a heel, the bearing length it needs when you give an Fc⊥, any net uplift, and the horizontal reaction.
- **Bracing** checklist: a note for the designer, plus a warning for slender webs.

## Your own tables

Load a **species table** (CSV or JSON: id, label, Ft, Fc, E, Emin and optionally Fb and Fcp, in MPa) to replace the typical values. Load a **connector plate table** (CSV or JSON: id, w, h, kN, optionally a label line `# label: name`) and the joint schedule uses it, marked as yours; until then every plate is labelled "Placeholder, not a manufacturer value". TrussCraft never invents a capacity: a joint larger than the biggest plate in the table says so.
