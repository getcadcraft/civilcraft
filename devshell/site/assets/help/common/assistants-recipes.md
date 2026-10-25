---
title: Recipes for AI assistants
summary: Worked examples for using your own AI assistant with the CadCraft apps: what to ask, the tools it calls, and the permissions each needs. Every recipe here is run by our tests with the same calls.
section: tasks
order: 62
keywords: ai, assistant, mcp, recipes, examples, prompts, automation, batch, convert, plot, check, takeoff, cut, fill, parameters, script
---

## What you will learn

Ready-made requests for your own AI assistant, and what it does with them. The apps contain no AI: your assistant reads the files and calls the apps' tools, and you decide which permissions it has. Each recipe names the tools it calls, so you can check its work in the activity log, and each one is run by our tests with exactly these calls, so they keep working.

There are two ways in. In **CadCraft Studio**, an assistant works with the apps you have open (Settings › Assistants in each app). **Without a window**, the CadCraft file server for assistants (`npx @getcadcraft/mcp --root <folder>`) works on files in folders you name; the `cadcraft` command line does the same jobs for your own scripts. The recipes say which way they use; most work both ways.

:::tip
Start read-only. Ask the assistant to describe a file before it changes anything; its answers are better when it has looked first, and Read is the only permission that is on to begin with.
:::

## Recipes

### Tidy a drawing

**Ask:** "List the layers with nothing on them and the blocks nobody uses, then purge the unused blocks."

The assistant opens the drawing and reads it, then runs PURGE:

```
drawing_open {path: "Kitchen/kitchen-equipment.dwg"}            → d1
drawing_describe {doc: "d1"}                                    layers with 0 objects, blocks with 0 uses
command_run {doc: "d1", input: "PURGE"}                         one undo step: "Assistant: PURGE"
drawing_save {doc: "d1", path: "Kitchen/kitchen-tidy.dwg"}
```

Needs Read and Edit, and Save to write the result. Dimension arrowheads count as used, so they stay.

### Plot a set of sheets

**Ask:** "Plot every sheet of every drawing in the Kitchen folder to PDF."

```
files_list {folder: "Kitchen", extensions: ["dwg", "dxf"]}
drawing_open {path: …}  ·  drawing_describe {doc}                the sheets of each drawing
drawing_plot {doc, layout: "<sheet>", out: "Plots/<drawing> <sheet>.pdf"}
```

Needs Read and Export. From the command line, one PDF per drawing with all its sheets: `cadcraft plot Kitchen/*.dwg Plots --all`.

### Convert drawings for a consultant

**Ask:** "Save copies of the drawings in Kitchen as AutoCAD 2013 DWG in the Out folder."

```
files_list {folder: "Kitchen", extensions: ["dwg", "dxf"]}
drawing_convert {path: "Kitchen/<file>", out: "Out/<file>.dwg", version: "2013"}
```

Needs Read and Export; the originals are not changed. From the command line: `cadcraft convert Kitchen/*.dwg Kitchen/*.dxf Out --to dwg --version 2013`.

### Check drawings before sending them

**Ask:** "Check the drawings in Kitchen: nothing on layer 0, colours by layer, no unused blocks. Give me a table of what fails."

```
drawing_check {doc, rules: {layers: {noObjectsOn: ["0"]}, objects: {colorByLayer: true}, blocks: {noUnused: true}}}
```

Needs Read. Keep your office's rules in a file and the command line checks a whole folder: `cadcraft check Kitchen/*.dwg --rules office-standards.json` (exit code 1 when something fails, so it fits in a script).

### Ask a building model questions

**Ask:** "How many doors does the house have on each level, and which are external?"

```
ifc_open {path: "house.ifc"}                                    → d1
ifc_query {doc: "d1", class: "IfcDoor"}                         each door with its level
ifc_properties {doc: "d1", id: <door>}                          Pset_DoorCommon.IsExternal
```

Needs Read. In Studio, BimCraft's own tools answer the same about the model you have open.

### Draw a room in BimCraft

**Ask:** "Draw a 6 by 4 metre room on Level 1 with a single door in the south wall."

```
walls_add {points: [[0, 0], [6000, 0], [6000, 4000], [0, 4000]], closed: true}     one undo step
opening_add {wall: "<the first wall's GlobalId>", kind: "door"}                    one undo step
```

Needs Edit. Walls join and the room follows, as with the Draw tools. Without a window, `ifc_new` starts a building first and `ifc_save` writes it.

### Total a takeoff

**Ask:** "Give me the estimate by item and export it to XLSX."

```
takeoff_open {path: "job.takeoff.json"}  ·  takeoff_estimate {doc}  ·  takeoff_export {doc, out: "job.xlsx"}
```

Needs Read, and Export for the file. Marks on sheets with no scale are listed and never counted as zero, so an incomplete estimate says so.

### Site numbers

**Ask:** "How much cut and fill does the pad need?"

```
site_open {path: "site.civilcraft.json"}  ·  surface_volume {doc}       cut, fill and net, per pad
```

Needs Read. With a level instead of a design: `surface_volume {doc, datum: 100}`.

### Try a part variant

**Ask:** "Set the length to 40 mm, rebuild, and give me the mass."

```
part_open {path: "screw.partcraft.json"}  ·  params_list {doc}
param_set {doc, name: "l", value: 40}                           one undo step, the part rebuilt
mass_properties {doc}                                            volume, mass from the material, centre, inertia
```

Needs Read and Edit; Save (`part_save`) to keep it.

### Fill in a title block

**Ask:** "Insert the title block at 0,0 with sheet number A-101 and the title Kitchen plan."

```
block_insert {doc, block: "TITLEBLOCK-ARCHD", at: [0, 0], attributes: {"SHEET-NO": "A-101", "SHEET-TITLE": "Kitchen plan"}}
```

Needs Edit. One undo step; the attributes it does not name keep their defaults.

## Your files and your assistant

The apps never send your files anywhere. **But what your assistant reads goes to whoever runs that assistant:** a cloud assistant's maker sees the parts of the drawing it is shown. If that matters for a job, use an assistant that runs on your own computer, or keep that job's folders out of the ones you allow.
