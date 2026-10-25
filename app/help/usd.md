---
title: Export the 3D site as USD
summary: Write the 3D site view (surfaces, lines, alignments, pipes and survey points) as USD at true scale and true coordinates.
section: tasks
order: 140
keywords: usd, usda, usdc, usdz, openusd, export, 3d, site, surface, alignment, survey points, coordinates, scene assembly
---

In the 3D view, {{ui:USD}} beside {{ui:GLB}} and {{ui:OBJ}} writes what the view shows as USD.

1. Open the 3D view and choose what to show.
2. Open {{ui:USD}} and pick {{ui:Text (.usda)}}, {{ui:Binary (.usdc)}} or {{ui:Package (.usdz)}}.

The file is at true scale (the vertical exaggeration is taken back out), in metres with Z up. The site sits at its project eastings, northings and elevations, and names its coordinate system when the project has one. Surfaces, pipes and structures are meshes with their colours; contours, breaklines and corridor lines are lines; each alignment is its own line under its name; survey points keep their numbers.
