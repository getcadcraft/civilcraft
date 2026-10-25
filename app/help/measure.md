---
title: Measure distances, areas and slopes
summary: Measure on the plan by clicking points — each side's length and bearing, the running total, the length along the ground, the slope, and the area and perimeter of a closed shape — and between two points on a power line's profile.
section: tasks
order: 21
keywords: measure, measuring, distance, length, area, perimeter, bearing, slope, grade, ruler, tape, along the ground, profile, height difference
---

{{ui:Surface}} › {{ui:More}} › {{ui:Measure}} (also in the Power lines workspace's {{ui:More}} menu, or press {{key:M}}) measures without adding anything to the project.

## On the plan

1. Choose {{ui:Measure}}, then click points. A click near a survey point takes its place and elevation.
2. The status line reads the number of points and the total length, the last side's length and bearing, its slope where the ground is known under both ends, and the length along the ground. Beside the pointer, the side being drawn and the running total.
3. Click the first point again to close the shape: the status line adds its **area** and **perimeter**. The next click starts a new measurement.
4. {{key:Enter}} ends the measurement and keeps its numbers in the status line; {{key:Backspace}} takes back the last point; {{key:Esc}} clears it, and {{key:Esc}} again goes back to {{ui:Select}}.

Lengths are in the project's unit and areas in its square unit. The slope and the length along the ground use the proposed surface where there is one, else the existing ground; off the surface they are left out.

## On a power line's profile

In the [line profile](topic:overhead-line#the-line-profile), {{ui:Measure}} in the profile's bar takes two clicks and reads the distance across, the height difference, the straight distance and the slope between them. A click near the ground, the conductor or a support's top snaps to it. Click {{ui:Measure}} again to stop.
