---
title: Interior lighting design: glare, uniformity and the light loss factor
summary: How the add-on reports uniformity and glare, where its UGR figure comes from, and what the light loss factor does.
section: reference
order: 2
keywords: ugr, glare, uniformity, uo, light loss factor, maintenance factor, workplane, margin, grid, lux
---

## Uniformity

Uniformity is the lowest lux divided by the mean lux over the calculation grid on the workplane. The grid is spaced by the rule of EN 12464-1 (finer for a smaller room) and leaves out an edge strip (0.5 m by default) the way the standard does for the task area.

## Glare (UGR)

UGR comes from the CIE 117 formula, UGR = 8 log10 (0.25 / Lb × Σ L² ω / p²). Lb is the background luminance, from the light bounced off the room. L and ω are the luminance and the size of each luminaire seen from the eye, from its candela table and luminous opening. p is the position index. Four observers sit at 1.2 m, in the middle of each side of the room, looking along the room; the worst of them is shown.

It is an estimate. It treats the luminous opening as a flat face and uses the full (initial) light output. The maker's UGR table, made the standard way, is the reference.

## Light loss factor

Lamps lose output and luminaires collect dirt. The light loss factor (default 0.8) multiplies every lux figure, so the numbers show what the room gives when it needs cleaning, not when it is new. Set it from the maintenance plan.
