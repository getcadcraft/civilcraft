---
title: Work out storm flows, pipe sizes and the hydraulic grade line
summary: Draw the catchments that drain to each structure, add up the flows down the network with the rational method, size the pipes by Manning's equation, and see where the hydraulic grade line runs full or reaches the surface.
section: tasks
order: 92
keywords: storm drainage, catchment, drainage area, rational method, runoff coefficient, time of concentration, rainfall intensity, idf, manning, pipe sizing, hydraulic grade line, hgl, energy grade line, egl, surcharge, flooding, tailwater
---

Storm drainage works on the [pipe network](topic:pipe-network): draw the network first, then the areas that drain into it. Everything appears under **Storm drainage** in the right panel when nothing is selected.

## Draw a catchment

1. Click **Draw a catchment** under **Storm drainage**.
2. Click the corners of the area that drains to one structure. {{key:Enter}} or a double-click finishes; {{key:Backspace}} takes back the last corner, {{key:Esc}} stops.
3. The catchment drains to a structure inside it, else the nearest one. Its **Properties** open: set its name, the **Runoff coefficient C** (the share of the rain that runs off, 0 to 1), the **Time of concentration** in minutes, and which structure it **Drains to**.

**Draw another catchment** in its Properties starts the next one. Click inside a catchment on the plan to select it; {{key:Delete}} removes it. Each change is one step: {{key:Mod+Z}} undoes it.

## Set the design storm

The rainfall intensity is i = a ÷ (tc + b) to the power c, in inches per hour for a feet project and millimeters per hour for a meter project. Fit **Intensity a**, **b** and **c** to your own intensity-duration-frequency curve for the return period you design for.

:::warning
The starting intensity curve, Manning n (0.013) and junction loss (0.5) are placeholders, not a standard. Set them from your own rainfall data and design criteria.
:::

- **Shortest time of concentration**: no pipe is worked out at a shorter time (10 minutes to start).
- **Manning n**: the roughness of the pipes.
- **Junction loss**: the head lost in each structure, as a share of the velocity head V²/2g of the pipe leaving it.
- **Water level at the outlet**: the tailwater, where the last pipe empties. Leave it empty when the outlet runs free.

## How the flows add up

Each pipe carries every catchment above it. Q = C × i × A, where C × A is summed down the network and i is the intensity at the longest time of concentration of the water arriving: a catchment's own time, or the time from an upstream catchment plus the travel time through the pipes (length ÷ the velocity flowing full). Q is in cubic feet per second (A in acres) or cubic meters per second (A in hectares).

## Size the pipes

The table under **Flows and grade lines** shows, for each pipe, the flow, what it carries flowing full at its slope, the velocity, the hydraulic grade at its top and foot, and how deep it flows.

**Size the pipes for these flows** gives each pipe the smallest standard size that carries its flow at its own slope (12 to 72 in, or 300 to 1800 mm). It is one step. The inverts stay where they are: if sizes change, use **Set every invert from the rules** to keep the cover, then check the table again.

## Read the grade lines

The hydraulic grade line (HGL) is worked out from the outlet upstream:

- A pipe flowing part full has its HGL at the water surface: the invert plus the normal depth.
- When the water below is higher than its crown, or it carries more than it can flowing full, it flows full (surcharged) and its HGL rises by the friction slope over its length.
- At each structure the HGL is the leaving pipe's top HGL plus the junction loss.
- The energy grade line (EGL) is the HGL plus the velocity head.

A pipe that flows full is listed, and so is any structure where the HGL is above the rim: water reaches the surface there, and the structure is ringed in red on the plan. Select a pipe or a structure to see its flow, depth, velocity and both grade lines in its Properties.

## Saved with the project

Catchments and the storm settings are saved in the project file. They are not yet in the PDF plot, the DWG or DXF, or LandXML: see [Not built yet](topic:not-built-yet).
