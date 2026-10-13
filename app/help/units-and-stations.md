---
title: Units, stations and number formats
summary: Feet and metre projects, how stations, grades, side slopes, bearings, areas, volumes and pipe sizes are written and typed, and what changing units does.
section: reference
order: 40
keywords: units, feet, us survey feet, metres, meters, metric, imperial, station format, stationing, grade, percent, side slope, h:v, bearing, cubic yards, diameter
---

## Project units

A project is in **US feet** or **metres** (**Units** in the left panel). Every coordinate, elevation, length and station in the project is in that unit.

:::warning
Changing **Units** changes the labels, the station format, the defaults and how files are written. It does **not** convert any number. A site surveyed in feet and switched to metres keeps the same numbers, now read as metres. The status bar says "Units are now metres. Coordinates were not converted." Set the units to match your data before you design.
:::

What depends on the units:

| | US feet | Metres |
|---|---|---|
| Station format | `12+34.56` (100 ft stations) | `1+234.567` (1000 m stations) |
| Contour intervals offered | 0.25 to 20 ft | 0.1 to 10 m |
| Area | sq ft | sq m |
| Volume | cu yd | cu m |
| Pipe and structure diameter | inches | millimetres |
| Default curve radius | 100 ft | 30 m |
| Stationing ticks on the plan | every 50 ft, labels every 100 ft | every 20 m, labels every 100 m |
| Plot scales | 1" = 5' to 1" = 1000' | 1:50 to 1:10000 |
| LandXML linear unit | USSurveyFoot | meter |

When you open LandXML, the project takes the file's units. A file in international feet opens as a feet project; the numbers are not changed.

## Stations

A station is a distance along an alignment, written with a plus sign:

- Feet: the part before the plus is hundreds of feet. `12+34.56` is 1,234.56 ft.
- Metres: the part before the plus is thousands of metres. `1+234.567` is 1,234.567 m.
- Negative stations keep the sign in front: `-0+50.00`.

Wherever you type a station (**Start station**, a PVI's **Station**), you can type it with the plus (`12+34.56`) or as a plain number (`1234.56`). Spaces are ignored.

## Grades and slopes

- **Grades** (profiles, pipes, lane and shoulder slopes) are in percent: `+1.25%` rises up-station, `-0.50%` falls.
- **Side slopes** (pad cut and fill, corridor cut and fill) are horizontal to vertical: `3` means 3 : 1, three across for one up or down.
- **K** for a vertical curve is its length divided by the change in grade in percent.

## Bearings and angles

Bearings are quadrant bearings in degrees, minutes and seconds: `N 63°12'05" E`. Curve deflections (Δ) use the same degrees, minutes and seconds, with "left" or "right".

## Offsets

Offsets from an alignment are distances square to it, marked **L** (left) or **R** (right) looking up-station.

## Number display

- Coordinates and elevations show 2 decimals in panels and the status bar (3 for a selected survey point).
- Areas and volumes are grouped by thousands: `128,250 sq ft`, `454.9 cu yd`.
- Coordinates are never grouped, so they can be copied as they are.

## Coordinates

CivilCraft works in a flat plane: easting to the right, northing up. Design work always happens in projected coordinates (state plane, UTM or a local grid). You can tell CivilCraft which coordinate system they are in, and whether they are grid, ground or local coordinates; it then shows latitude and longitude and places GIS files and map layers, but it never changes units or moves your coordinates by itself. See [Set the project's coordinate system](topic:coordinate-systems) and [Ground and local coordinates](topic:ground-and-local-coordinates). Large state plane values (millions of feet) are fine; CivilCraft works relative to the site internally to keep precision.
