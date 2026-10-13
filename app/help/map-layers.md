---
title: Show map layers under the plan
summary: Put a georeferenced picture, map tiles, a WMS or WMTS server or a map service under the plan as site context, with the internet setting, opacity, order and attribution.
section: tasks
order: 135
keywords: map layers, basemap, base map, background, aerial, orthophoto, imagery, satellite, raster, world file, pgw, jgw, tfw, wld, geotiff, georeferenced image, xyz, tiles, slippy map, wms, wmts, getcapabilities, map service, rest, mapserver, imageserver, usgs, national map, attribution, opacity
---

Map layers are pictures drawn under your design: an aerial photo with its world file, or maps from servers on the internet. They are site context on screen only: they are **not** in PDF plots, DXF or DWG exports, or the 3D view.

Choose {{ui:Map}} in the {{ui:GIS}} group. The **Map layers** dialog lists the project's layers and adds new ones. Map layers need the project's coordinate system ([Set the project's coordinate system](topic:coordinate-systems)), except a picture whose world file uses the project's own coordinates.

## The internet setting

CivilCraft never asks a map server for anything until you allow it: {{ui:Settings}}, {{ui:CivilCraft}}, **Map layers from the internet**: **Off** (the start) or **On**.

:::note
When on, CivilCraft asks the map servers you add for pictures of the area on screen. Your drawing stays on this computer; the server sees the area and your internet address.
:::

While it is off, internet layers are listed in the dialog but grayed out, with the reason, and nothing is drawn or requested. Opening a project that names map servers does not contact them either. A picture from a file works either way. The dialog's {{ui:Open Settings}} button takes you there.

## A georeferenced picture (works offline)

1. In **Add a layer**, keep **Georeferenced picture** and choose the files: the picture (PNG or JPEG) **together with** its world file (`.pgw` for PNG, `.jgw` for JPEG, or `.wld`) and, if there is one, its `.prj`. You can also drop them on the plan together.
2. Without a `.prj`, CivilCraft asks which system the world file uses: {{ui:The project’s system}} (most common), {{ui:Pick a system…}}, or, in a project without a system, **Project coordinates**.
3. The picture appears under the plan and {{ui:Fit}} includes it.

An RGB GeoTIFF (an aerial photo saved as GeoTIFF) carries its own placement and system: open it on its own. The picture is kept **inside the project file** (up to 25 MB); a larger one is refused with its size, so save a smaller copy (fewer pixels, or JPEG).

## Tiles, WMS, WMTS and map services

Turn **Map layers from the internet** on first. Then, in **Add a layer**:

| From | What to paste | What CivilCraft does |
|---|---|---|
| Tile URL | A template with `{z}`, `{x}` and `{y}` (or `{-y}`), and `{s}` for a server letter, for example `https://tile.example.org/{z}/{x}/{y}.png`. Give it a name and its attribution. | Tiles in web Mercator for the area and zoom on screen. |
| WMS server | The server's address, or its GetCapabilities link. Choose {{ui:Get the layers}}, then the layer. | One picture of the area on screen, asked in the project's EPSG code when the server offers it, else in web Mercator or WGS 84. |
| WMTS server | The server's address, or its `WMTSCapabilities.xml`. Choose {{ui:Get the layers}}, then the layer and tile matrix set. | Tiles from the set in the project's system when there is one, else web Mercator. |
| ArcGIS map service (REST) | A URL ending in `/MapServer` or `/ImageServer`. Choose {{ui:Read the service}}. | Cached web Mercator services are drawn from their tiles; others are asked for one picture of the area on screen. |

No servers come preset. Public examples, all from the USGS National Map (public domain):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Map service: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (also `USGSImageryOnly` for aerial photos)

Many city and county GIS departments publish their own WMS or map services; their GIS pages give the address. A server that asks for a sign-in or a key does not work: CivilCraft sends no user names, passwords or keys.

## How layers are drawn

- Pictures in another system than the project's are warped into it: the picture is cut into pieces, each placed so it is within a quarter of a screen pixel of where an exact conversion puts it.
- Tiles are chosen for the area on screen and the zoom: never more than 64 for a view, 6 at a time. When you pan or zoom, requests for the old view are cancelled. About 200 tiles are kept in memory (nothing is stored on disk).
- A WMS or map service picture is asked for once the view has stopped moving; until it arrives the last one stays in place.
- The attribution of each layer on screen shows small at the bottom right of the plan.

## Change, order and remove layers

In the dialog each layer has a checkbox to show or hide it, an **Opacity** slider, arrows to draw it earlier (lower) or later (on top), a zoom button (pictures) and a remove button. The first layer in the list is drawn at the bottom. Each change is one undo step.

## When a layer shows nothing

The reason appears once in the status line and stays under the layer's name in the dialog:

| Message | What to do |
|---|---|
| Off: map layers from the internet are off in Settings. | Turn **Map layers from the internet** on. |
| Needs the project's coordinate system | Set it under {{ui:Coordinates}}. |
| The server did not allow this page to use its images (CORS), or could not be reached. | The server does not let web pages use its pictures, or it is down. After four refusals CivilCraft stops asking; hide and show the layer to try again. |
| The server answered 404 … / The server sent text/xml, not an image: … | The URL, layer or style is wrong, or the server's message says what it wants. |
| This layer is not offered in the project's system, web Mercator or WGS 84 | The server cannot draw where CivilCraft can place it. |

## What was checked

- Tile numbers were checked against the standard web Mercator tiling; WMS 1.1.1 and 1.3.0, WMTS and map service answers were read from hand-written files and from real answers saved from the USGS National Map and terrestris OpenStreetMap servers; WMS 1.3.0 requests put latitude first for EPSG:4326, as the standard says.
- Warping was compared with an exact per-pixel conversion through PROJ's numbers: within 0.13 px for tiles, WMS pictures and a county-sized picture, at site scale and zoomed out.
- A picture with its world file and an RGB GeoTIFF written by GDAL (through rasterio) were drawn where their placement says, checked pixel by pixel in the browser.
- In the browser, against a stand-in server on the test computer: tiles land in the tile PROJ puts each point in, a WMS picture lands within 2 px, at most 6 requests run at a time, and with the setting off no request leaves the page. The USGS National Map map service above was also read and drawn live in the browser once (its tiles arrived and were drawn, with its copyright text); the other public servers were read from saved answers only.
