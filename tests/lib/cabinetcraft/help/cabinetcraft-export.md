---
title: CabinetCraft: cut list, nest, labels and G-code
summary: The files a job gives the shop, drilling for corner cabinets, the dry-run checker, the first-run checklist and the maker's review sheet.
section: tasks
order: 4
keywords: dry run, checklist, maker review, corner drilling, dowel, cut list, csv, nest, dxf, labels, bar code, drilling, hardware list, g-code, nested sheets, post
---

## The files

{{ui:Export}} gives you:

- **Cut list (CSV):** every part with its material, length, width, quantity, grain and the edge bands on each side, with the size to cut once the banding is taken off.
- **Drilling list (CSV):** the shelf-pin, hinge-plate, cup-hinge and drawer-slide holes on the 32 mm system, by part and face, and the corner cabinets' holes (below).
- **Drilling as XML (generic):** the same holes, a panel at a time, in a format of our own that is described below. It is not any boring machine's file format.
- **Hardware list (CSV)** and **Cost estimate (CSV).**
- **Labels:** a printable page of labels, one for each piece, with its name, cabinet, size, material, a drawing of its banded edges and a Code 128 bar code. After a nest the labels are in cutting order.
- **Nested sheets (DXF):** every sheet of every material, with layers for the sheet, the parts and the labels.

## Nest on sheets

{{ui:Nest on sheets}} lays the parts of each material on that material's sheet, keeping the grain. It runs on a Web Worker, so the page stays usable while a bar shows which material it is on; when a page cannot start a worker it runs on the page's own thread, one material at a time, and the page is slow to answer for a few seconds. Parts that do not fit their sheet are listed and shown in {{ui:Checks}}. Any edit that changes the parts drops the nest, because it would no longer match.

## G-code

{{ui:Make the G-code}} uses PartCraft's nested-sheets path, the same one as {{ui:Manufacture}} › {{ui:Nested sheets to G-code}}: each material's sheets go through the shared contour operation (offset by the tool radius, climbing, lead arcs, tabs) and the post you pick, one program per sheet. The cut depth is the board's thickness.

Nothing here has been run on a machine. Check every program in a simulator and on a scrap board before you cut, and check that the tool, the speeds and the post fit your machine.

## The generic hole list (XML)

The file's root is `cabinetcraft-holes` with `format`, `version` (1), `generic="true"`, `unit` (`mm` or `in`) and `job`. Each `panel` has `id` (the cut list's part id), `cabinet`, `name`, `qty`, `length`, `width`, `thickness`, `material` and `face` (which face of the panel the holes are on). Each `hole` inside has `kind` (`shelf-pin`, `plate`, `cup`, `slide`, and for corner cabinets `fasten`, `dowel`, `pivot` or `shaft`), `x`, `y`, `diameter`, `depth` and `side` (`both`, `left` or `right`: which of a pair of panels takes it). **x** runs along the panel's length from the end the cut list starts at, **y** across its width from the first long edge, both in the file's unit. A shop's own software, or a post-processor someone writes, can read it; nothing here has been run on a machine.

## The cabinets in the viewport

On {{ui:Drawings}}, {{ui:Place in viewport}} puts the job in PartCraft's 3D view as bodies: one for every panel, door, drawer front, filler, end panel and countertop piece, coloured by your material picks, with the floor and the walls (translucent, with the doors and windows cut in) if you leave that box ticked. It is one undo step; placing again replaces the group and {{ui:Remove from viewport}} takes it out. The command {{ui:CAB3D}} does the same from PartCraft's command list. They are for looking at: display bodies are kept in the part file but are not part of the part's solid, so they add nothing to its mass, an STL or a STEP file. The SVG 3D drawing is still there.

## Drilling the corner cabinets

L-shaped, diagonal-front (at any angle), lazy susan and blind cabinets are drilled with the same numbers as the straight ones (the 32 mm system, changeable under {{ui:Materials}}):

- **End sides:** shelf pins on the lines `sysLine` (37 mm) from the front and back edges, every `pitch` (32 mm), the first `sysStart` (64 mm) from the end; hinge plates, two system holes for each hinge, on the side that carries the hinge (both for the L-shaped cabinet's two doors); four fixing holes where the bottom and top meet the side, `sysStart` from each edge.
- **Boards that meet:** a hole in the EDGE (face `edge`, with the edge number) at `sysStart` from each end of every joint line two boards share (one at the middle if the joint is shorter than 2 x `sysStart` + `pitch`), and two where an arm board meets a side. At an angled corner the joints are the **mitre** between the arm boards and the sides of the triangle.
- **Doors:** cup hinges on the back, `cupEdge` + half the cup from the hinge edge.
- **Lazy susan:** a pivot hole in the bottom, a shaft hole in the top and a centre hole in each round shelf.

The size of a **fixing hole** (dowel or cam) and of a lazy susan's **shaft and pivot** depends on the hardware you chose. Type them under {{ui:Drilling sizes you type}}; until you do the holes are in the list with a **blank** diameter and depth, and {{ui:Checks}} says so. Nothing is invented. A dowel-or-cam pair per two holes is in the hardware list. In the XML a hole may carry `face` and `edge`.

## Dry run, the first-run checklist and the maker's review sheet

None of these is a machine run, and none says one happened.

- {{ui:Check the programs and holes}} reads each G-code program like a very small simulator and reports its bounding box, tools and tool changes, the feed rates, the length of cutting and fast travel and the time (cutting only, or with the fast-move rate you type), and finds: cutting with no feed, fast sideways moves below the top of the sheet, cuts outside the sheet, wrong units, no tool or spindle, and cuts that do not go through. It also checks that **every hole of the hole list lies inside its panel**, keeps at least the smallest edge distance the drilling rules themselves use (the cup edge) from each edge, is not deeper than the panel is thick, and lists the sizes still blank.
- {{ui:First machine run checklist}} is one printable page: the programs, what the dry run saw, what to check before the sheet goes on and in the first cuts, empty boxes and a sign-off. It says that no run has been made.
- {{ui:Maker's review sheet}} lists every size and rule the corner cabinets, angled and curved walls and drilling used, where each comes from (common practice, a rule of the 32 mm system, geometry, typed by you) and an empty "maker confirms" box and "corrects to" space for a cabinet maker.

## Not built

The labels have a Code 128 bar code and no QR code. The hole list is a generic format, not a boring machine's own file. The display bodies have no joinery detail: a panel is a box. A cabinet with a curved front is made to order and is not in the cut list, the programs or the hole list.
