---
title: Units, typed values and the unit lists
summary: Type a length in any unit with its mark, choose which units the unit lists show, and star the unit new work starts in. A file always keeps its own unit.
section: reference
order: 60
keywords: units, unit list, metric, imperial, feet, inches, feet and inches, meters, millimeters, US survey foot, survey feet, international foot, yards, miles, nautical mile, chain, rod, link, furlong, fathom, point, pica, acre, hectare, square, roofing square, acre-foot, board foot, gallon, gon, grad, radian, degrees minutes seconds, slope, percent, H:V, rise run, default unit, star, INSUNITS
---

## What you will learn

How to type a value in any unit, and how to choose which units the unit lists in the apps show and which one new work starts in. Every app shares one table of units, with the exact sizes their legal definitions give.

## Type a length in any unit

In a box that takes a length, type the number and the unit's mark after it. The app turns it into the unit the box is in.

| Type | Means |
|---|---|
| `12'6"`, `12' 6 1/2"`, `12'-6"`, `3 ft 6 in` | feet and inches |
| `450 mm`, `3.2 m`, `1.5 km`, `2 dm`, `400 nm` | metric lengths (`nm` is the nanometer) |
| `3 yd`, `2.5 mi`, `250 mil` | yards, miles, thousandths of an inch |
| `10 US ft`, `1 US mi` | the US survey foot and mile |
| `2 rd`, `100 li`, `3 ch`, `1 fur` | rods, links, chains, furlongs |
| `1 nmi` or `1 NM`, `6 ftm` | nautical miles, fathoms |
| `12 pt`, `3 pc` | points and picas (1/72 and 1/6 of an inch) |

- `nm` is always the nanometer. For the nautical mile type `nmi` or `NM`. `Nm` is refused, because it could be either.
- `ft` is the international foot (0.3048 m). The US survey foot (1200/3937 m) is a different unit: type `US ft`, `usft` or `survey ft`. Rods, links, chains, furlongs and acres are the international-foot ones.
- Sums work as before where the app takes them, with any of these marks: `2*3 yd`, `12'6" + 3 ch`.
- In CadCraft a mark is read when the drawing has units (its $INSUNITS). A drawing with no units reads one only when its length format is Engineering or Architectural, where one drawing unit is an inch.
- In CivilCraft a project in feet is in US survey feet, as it always was, so `10 US ft` is 10 and `10 ft` is 10 project feet.

## Choose the units the lists show

Open {{ui:Settings}} (the gear on the app bar, or {{key:Mod+,}}), choose {{ui:General}}, and find {{ui:Units}}. There is one list for each kind: {{ui:Length}}, {{ui:Area}}, {{ui:Volume}}, {{ui:Angle}} and {{ui:Slope}}.

- Each unit has a switch. A unit that is off is left out of the unit lists in the apps.
- Click the star beside a unit to make it the default for new work. Click it again to take the star away. With no star, each app keeps its own default (the file's unit, or the one for your region).
- {{ui:Reset the unit lists}} puts the starting lists back, with no stars.
- The choices are the same in every app in this browser, and they are saved as you make them.

## Where the lists and the star are used

| App | What follows the switches | What the star sets |
|---|---|---|
| CadCraft | | The units ($INSUNITS) of a new drawing, when it is a unit a drawing can carry |
| CivilCraft | The project's units list | Length: a new project in meters (a metric star) or feet. Area and volume: the unit areas and volumes are reported in |
| ModelCraft | The units list beside the value box | The unit of a new model |
| BimCraft | The units list on the plan toolbar | The display units, until you pick them on the toolbar (your earlier pick is kept) |
| MarkupCraft | The measuring and position units in {{ui:Settings}}, and the unit in the calibrate dialog | The measuring unit, until MarkupCraft's own settings have been saved |
| TakeoffCraft | The unit lists of an item | Length and area: the unit of a new item |

The angle and slope lists are saved, but no app's box follows them yet.

## A file keeps its own unit

The settings never change a file. A drawing keeps its units, a CivilCraft project its feet or meters, a model its unit. The unit a file uses is always in its list, even when it is turned off in {{ui:Settings}}.
