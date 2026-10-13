---
title: Export the plan to DXF
summary: Write the plan linework as an R12 DXF on named layers, with contours at their elevations and breaklines in 3D, for any CAD program.
section: tasks
order: 110
keywords: dxf, dwg, cad, export, linework, r12, 2000, 2004, 2007, 2010, 2013, 2018, layers, contours, drawing exchange, base map, background
---

{{ui:DXF}} writes what the plan shows as a DXF file in the R12 format, the version every CAD program opens. If you have used AutoCAD or Civil 3D, open or insert it as you would any DXF.

## Export

1. Set up the plan the way you want the drawing: under **Display**, choose the surface (existing or proposed), the contour interval, and which things are on (contours, labels, points, point labels, triangles, breaklines, surface edge, pipes, slope arrows).
2. Click {{ui:DXF}} in the **Export** group.
3. The browser downloads `<name>.dxf`. The status bar says, for example, "Exported R12 DXF: 2,140 objects; labels sized for 1" = 40'. Bands are not exported."

Coordinates are written in your project units, at their real values (state plane coordinates stay as they are). Nothing is scaled or moved.

## What is in the file

| Thing | DXF entity | Layer |
|---|---|---|
| Minor and major contours | 2D polylines at their elevation | C-TOPO-MINR, C-TOPO-MAJR |
| Contour labels | Text | C-TOPO-TEXT |
| Triangles | Polylines | C-TOPO-TINN |
| Breaklines and boundary | 3D polylines | C-TOPO-BRKL |
| Surface edge | Polylines | C-TOPO-BNDY |
| Slope arrows | Polylines | C-TOPO-SLOP |
| Survey points and their labels | Points (with elevation), text | V-NODE, V-NODE-TEXT |
| Lines from line codes | 3D polylines | V-NODE-LINE |
| Alignment centerlines | Lines and arcs | C-ROAD-CNTR |
| Stationing ticks and labels | Polylines, text | C-ROAD-STAN |
| Corridor edges | Polylines | C-ROAD-CORR |
| Sample lines | Polylines | C-ROAD-SCTN |
| Pads, daylight lines, slope lines | Polylines | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Feature lines | 3D polylines | C-GRAD-FEAT |
| Pipes, structures, labels | Polylines, text | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Pipes and structures with problems | Polylines | C-STRM-PROB |

Each layer has a color. The full list is in [Plan layers](topic:plan-layers).

## Label size

Text has to have a size in drawing units. CivilCraft sizes labels for the scale at which the whole plan fits on a Tabloid sheet (feet) or an A3 sheet (metres), and says which scale in the status message. If you plot at another scale in your CAD program, scale the text there.

## What is not exported

- Elevation bands (screen only).
- The profile view. Profiles go out as LandXML, not as a drawing.
- The surface itself as a 3D object. Use LandXML for the TIN, or turn on {{ui:Triangles}} to get its edges as linework.
- Anything you turned off under **Display**.

## DWG

{{ui:DWG}} writes the same linework as a DWG drawing. A small dialog asks for the format: 2000, 2004, 2007, 2010, 2013 or 2018. 2000 opens in almost every CAD program, old and new; pick a newer one when whoever gets the drawing asks for it. Your choice is remembered in this browser.

1. Click {{ui:DWG}} in the **Export** group.
2. Pick the **Format** and click **Download DWG**.
3. The browser downloads `<name>.dwg`. The status bar says what went in, for example "Exported DWG (2018 format): 12 polylines, 40 labels on 9 layers".

The DWG has the same layers, colors, contours (as polylines at their elevation), 3D breaklines, labels and points as the DXF, in the same coordinates. Layer names a DWG cannot hold are changed, and the status message says so. CivilCraft writes DWG with its own code, so nothing leaves your computer.

### Map layers in the DWG

A DWG drawing cannot hold a picture inside it: CAD programs show a picture that sits beside the drawing. When map layers are showing, the dialog offers **Map layers as a picture beside the drawing**. With it ticked, the download is a `.zip` holding `<name>.dwg`, `<name>-map.png` (the map layers over the whole drawing, up to 4,096 pixels across) and `<name>-map.pgw` (its world file, for GIS programs). The drawing shows the picture as an image on layer G-MAP-IMAG, in place. Unzip the files into one folder and keep them together.
