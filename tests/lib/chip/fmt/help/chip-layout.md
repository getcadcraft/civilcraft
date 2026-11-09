---
title: Chip design: view and convert a layout (GDSII, OASIS)
summary: Open a GDSII or OASIS layout, show and hide layers, pick a cell from the hierarchy, move around a big layout quickly and save it in the other format.
section: tasks
order: 40
keywords: gds, gdsii, gds2, oasis, oas, layout, mask, layer map, layer, datatype, hierarchy, cell, top cell, array, aref, sref, convert, stream
---

## Open a layout

Open the {{ui:Layout}} panel and choose a `.gds` or `.oas` file in {{ui:Layout file}}. The file is read on your computer; nothing is sent anywhere. The kind is found from the file's first bytes, so a file with an odd name still opens.

The line under the view says how many cells were read and how long it took. Anything odd in the file (a cell placed but never defined, a record cut short, a damaged checksum in an OASIS file) is listed in Problems.

## Layers

{{ui:Layers}} lists every layer and datatype the layout uses, with two counts: how many shapes are stored in the file, and how many there are once every placement is counted ("placed"). Untick a layer to hide it.

Layers have no names in a GDSII file, only numbers. To name and colour them, choose a layer map in {{ui:Layer map file}}. Two kinds are read:

- a plain text file, one layer a line, in any of these forms: `1/0 : NWELL`, `METAL1 5/0 #2e6fd1 drawing`, `VIA1 6 0`, or `metal1 drawing 15 0` (name, purpose, layer, datatype). Lines starting with `#` or `//` are comments.
- a CadCraft layer map (`.json`, format `cc-layer-map`), the same kind the PCB tools use.

An OASIS file can carry its own layer names; they are used until you choose a map. XML layer property files from other programs are not read: export a plain text map from them.

## Cells and the top cell

{{ui:Cells}} shows the cell hierarchy from the top cell (the cell nothing else places). The number beside a cell is how many times its parent places it, arrays counted. Choose a cell's name to make it the top of the view. A cell that places itself through other cells is marked and the loop is cut.

## Move around

Drag to move; scroll to zoom about the pointer; {{ui:Fit}} shows the whole cell. Big layouts stay quick:

- placements outside the window are skipped, and of an array only the rows and columns in view are drawn;
- a cell smaller than a few pixels is drawn as its outline; a row of tiny cells is one outline;
- a big flat cell seen from far away is drawn as shaded squares, darker where it holds more shapes;
- a cell that is wholly in view is drawn once and reused at each of its placements.

The line under the view says what was drawn. If a view holds more than it can draw it says so; zoom in to see the rest.

On our test layout of 1,000,960 stored shapes (20.2 million once every placement is counted) the whole-layout view is planned in about 20 ms after reading; reading takes about 0.3 s for the 62 MB GDSII file and 0.7 s for the 9.5 MB OASIS file on our server.

## Save in the other format

{{ui:Save as GDSII}} and {{ui:Save as OASIS}} write the open layout next to the original, with the same name. OASIS files are compressed and carry a CRC32 checksum. Converting keeps every shape, path, placement, array, text and property, with these differences:

- GDSII has no repeated shapes: a repeated shape from an OASIS file is written out one copy at a time.
- OASIS texts have no turn, size or mirror: those are dropped. GDSII BOX elements become polygons. Paths with round ends become paths with square ends half a width long.
- A GDSII polygon can have at most 8,191 corners; a bigger one is left out and named in Problems.

See [Chip design: limits of the file formats](topic:chip-formats-limits).
