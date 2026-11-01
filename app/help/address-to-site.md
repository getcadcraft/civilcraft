---
title: Address to site
summary: Turn an address into what a site needs to know: the parcel, buildings round it, zoning, soil and flood zone, from open data you ask for by button or bring as files, and hand them to BimCraft as suggestions.
section: tasks
order: 60
keywords: address, geocode, site, parcel, buildings, zoning, soil, flood, open data, openstreetmap, fema, ssurgo, usgs, context, ccsite, bimcraft
---

## What it does

Surface › More › Address to site answers, for a point: which parcel it is in, the buildings round it, the zoning, the soil and the flood zone. The data are open: files you add (GeoJSON, shapefile, KML, GeoPackage) and, when you switch the add-ons on, buttons that ask one open service each.

## How to use it

1. Type an address and press the address-search button (the add-on "Address search"), or type the latitude and longitude.
2. Add layers: files with "Add files", or the other source buttons (flood zone, buildings, soil, ground height, county parcels). A service is asked only when you press its button; nothing is fetched at start.
3. Press the run button for the answer in words, with a CSV.
4. "Save the site as a file" or "Send to BimCraft as suggestions" gives the outlines to BimCraft or ModelCraft; they list them and add only what you tick.

## What to know

- The address search goes through getcadcraft.com, which asks OpenStreetMap's Nominatim for you (one request a second at most, answers kept 90 days so the same address is never asked twice; only a hash of the address is stored, never who asked). The other buttons go straight from your browser to their service.
- Each source has its own licence (OpenStreetMap is ODbL: keep the credit line).
- The layers are as good as the open data in your place. Check what matters against a survey.
