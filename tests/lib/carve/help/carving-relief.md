---
title: Carving a relief from a picture, and engraving
summary: Turn a grey picture into a 3D relief with a ball, flat or V cutter and a roughing pass, or follow lines at a depth.
section: tasks
order: 3
keywords: relief, depth map, heightmap, grey picture, 3d carving, ball nose, roughing, stepover, scallop, engraving, engrave
---

## A relief from a picture

1. Under {{ui:What to cut}} choose {{ui:Relief}} and pick a picture. A grey picture works best: white stays at the top of the material and black is cut to the full depth (tick {{ui:Black is the top}} to turn that round).
2. Set the **width** of the relief (the height follows from the picture) and the **depth**, and where its lower left corner goes.
3. Choose the cutter: ball nose (the usual finishing bit), flat end mill, or V-bit. A ball nose leaves a small ridge between lines; the result panel tells you how high.
4. Leave **Rough first** ticked to clear most of the material with a flat mill in layers first, leaving a little (default 0.3 mm) for the finishing pass.
5. {{ui:Make toolpaths}}.

The picture is resampled to at most 1200 pixels on its long side. The size of a pixel on the relief limits how fine the lines can be: a V-bit needs fine lines, so use a smaller relief or a larger picture.

## It does not cut into the picture

The cutter is dropped onto the surface: at every point its tip goes as low as it can without the body of the cutter touching the relief. The tests cut the paths into a simulated block and check that finishing never goes below the picture, with a ball nose, a flat mill and a V-bit. A round tool cannot reach a corner narrower than itself, so a deep corner is left rounded, and the border of the picture within a tool radius is left as it is.

## Engraving

Choose {{ui:Engrave}} to follow lines and outlines at a depth, in passes of at most the depth you set. Open lines and closed shapes are both followed. A V-bit's line is as wide at the top as it is deep: the result panel gives the width.
