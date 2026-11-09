---
title: "Climate futures: 2050 and 2080 flood, heat and wildfire"
summary: In Address to site, raise the site's flood level for a future climate, screen the wildfire exposure and morph a weather file, present beside future, from a climate data pack (SSP2-4.5 and SSP5-8.5, 2050 and 2080).
section: tasks
order: 61
keywords: climate, climate change, future, 2050, 2080, ssp, cmip6, scenario, sea level, flood, base flood elevation, bfe, fema, heat, weather file, epw, morph, wildfire, bushfire
---

The climate figures come from a **data pack**, not from the app. Switch on the {{ui:Climate futures}} add-on in Settings › Add-ons, or load a pack file of your own in the {{ui:Climate future}} block.

:::warning
The pack that comes with the add-on is a **sample**: three places (Denver, Miami, Johannesburg), one climate model, five years in each 20-year period. It is there to try the tools, **not for design**. A full pack is built with `tools/climate/build-pack.mjs` from NASA's NEX-GDDP-CMIP6 data.
:::

## Where it is

Surface › More › Address to site. Set the point, add the layers (a FEMA flood layer gives the base flood elevation) and press the button that reads the site. Under the site's rows is the {{ui:Climate future}} block: pick a **Scenario** (SSP2-4.5 or SSP5-8.5) and a **Year** (2050 = 2041-2060, 2080 = 2071-2090, both against 1995-2014). The pack's place nearest to the point is used, or the one you pick; far from every place, the global average changes are used and the panel says so.

## Design flood level

The present level is FEMA's base flood elevation when the flood layer had one (feet, NAVD 88), else type your own. Choose the flood type (coastal, river or heavy rain, or both), the flood depth at the site for the rainfall part, and a freeboard if you want one. {{ui:Raise the flood level}} shows the present and the future level side by side, the sea-level and rainfall parts, and the assumptions: the whole sea-level rise is added to a coastal level; river flow rises one to one with the wettest-day rainfall and depth follows flow to the power 0.6 (Manning, wide channel); the parts are added.

:::warning
A screening of the change, not a flood study. The design flood level is the authority's or your engineer's.
:::

## Wildfire exposure (screening only)

The nearest vegetation, the slope up from it and the distance give a band from very low to extreme, present and future (the future multiplies by the pack's change in the fire-weather index). **Screening only:** our own relative scale to tell whether a site needs a proper wildfire assessment; not a code rating.

## Heat: a future weather file

Pick a present-day `.epw` file and {{ui:Make the future weather file}}: it is morphed with the published shift and stretch method (Belcher, Hacker and Powell 2005) and the heat is compared (mean and hottest temperature, design temperatures, hours over 30 °C and 35 °C, degree-days). {{ui:Save the future weather file}} saves it for the Environment panel, BimCraft's energy check or your own tools.

## Where the numbers come from

NASA NEX-GDDP-CMIP6 (downscaled CMIP6 model output, CC BY 4.0 per model) for temperature, humidity, sunshine, rain and fire weather; the IPCC AR6 global mean for sea-level rise unless the pack carries local figures. The panel shows the pack's source, licence and date.
