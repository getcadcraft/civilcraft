---
title: Vehicle swept paths
summary: Drive a vehicle with up to three trailers along a feature line or an alignment, forward or reversing, and see the area it sweeps, its wheel paths, its steering and where it jackknifes.
section: tasks
order: 63
keywords: swept path, turning path, vehicle tracking, turning template, design vehicle, truck, bus, trailer, semitrailer, reversing, backing, jackknife, articulation, steering lock, offtracking, wheel path, loading dock, turning radius
---

A swept path drives a vehicle along a line and shows the ground its body passes over. Use it to check that a truck can make a corner, reach a loading dock or back a trailer into place without leaving the paving.

## Drive a vehicle along a line

1. Draw the line the vehicle follows, in the direction of travel: a feature line (arcs are fine: press {{key:C}} while drawing it, see [Feature lines](topic:feature-lines)) or an alignment.
2. Select it and click {{ui:Swept path…}} in its **Properties**.
3. Under **Start from**, pick a vehicle, then set its sizes from your own design vehicle: width, front overhang, wheelbase, rear overhang, track and **Steering lock**. Add up to three trailers, each with where it is hitched, its length from the hitch to its axle, its overhangs and its **Largest articulation**.
4. Choose **Driving**: forward or reversing. Click {{ui:Drive it}}.

:::warning
The vehicles to start from are placeholders, not a standard. Set the sizes from the design vehicle your project uses.
:::

## Forward and reversing

| Driving | What follows the line | What CivilCraft works out |
|---|---|---|
| **Forward** | The front axle's centre | Where the rear axle and every trailer go, the steering angle and the articulation |
| **Reversing** | The last axle's centre (the back of the trailer) | Where each unit ahead goes, and the steering the cab needs to put the trailer there |

Reversing is how a backing move is checked: say where the trailer should go, and CivilCraft says whether the cab can make it.

## Read the result

The swept path is drawn on the plan in orange: its outline and, dashed, the paths of the outermost wheels. Select it (click inside it) to see in **Properties**:

- **Length driven**, the largest **Steering** angle and **Articulation** against their limits, and the **Swept area**.
- Any problem along the line, with its distance: the steering past the lock, or a trailer turning past its articulation limit (it jackknifes).
- **The vehicle along the line**: move the slider to see the vehicle at any point, with its steering and articulation there.

Change the line and the swept path follows. {{ui:Edit the vehicle…}} changes the sizes; **Driving** switches between forward and reversing. Each change is one step: {{key:Mod+Z}} undoes it. {{key:Delete}} deletes the selected swept path (the line stays).

The outline and the wheel paths go to the PDF, DXF and DWG on layer C-ROAD-SWPT.

## How it is worked out

Each unit turns about its rear axle's line and is dragged by the point ahead of it (the front axle, or the hitch), the low-speed, no-slip model swept path checks use. The swept area is every position's body outline put together. It does not model speed, tyre slip, the time the steering takes to turn, steering trailers or the clearance under the body.
