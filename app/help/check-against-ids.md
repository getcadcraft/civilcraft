---
title: Check the IFC export against a client's IDS
summary: Load the .ids file a client or road authority gave you and see every exported element that does not meet it in Problems.
section: tasks
order: 46
keywords: ids, information delivery specification, buildingsmart, requirements, delivery, check, validation, qa, ifc export, ifc 4.3, alignment, road, procurement
---

## What you'll do

An IDS (Information Delivery Specification, a buildingSMART standard) is the list of what an IFC must contain. Public procurement often sends one with the job. CivilCraft checks the IFC this project exports, in the IFC version you picked for the export, against it and lists every element that falls short.

## Steps

1. Open your project.
2. Click {{ui:IFC}} in the Export group of the toolbar. In the dialog, pick the IFC version you will deliver.
3. Click {{ui:Check against IDS…}}.
4. Click {{ui:Load an .ids file…}} and pick the file. Nothing is uploaded.
5. Read the result: each specification with {{ui:Pass}} or {{ui:Fail}} and how many elements it applies to.
6. Open Problems ({{key:Ctrl+Shift+M}}) and click a failure to select the alignment, pad, pipe, structure or building mass it came from.

## What you should see

- One warning per exported element and requirement it misses, with the specification's name, what the IDS asks for and what the export has.
- The check report (in Problems) starts with the IDS: its title, version, author and each specification's counts.

## Good to know

- The IDS is saved in the project file, so it is checked again when you open the project. Loading or forgetting it is one step you can undo.
- Each change is checked again a moment later. Large surfaces take longer to write, so the check then waits a little longer between runs.
- The check uses the same file the {{ui:IFC}} export writes, in the version last picked there (IFC 4.3 when you have not picked one).
- Numbers are compared in SI units: a project in feet is converted to metres first.

- Patterns in the IDS are read as the whole value. A `^` at the start and a `$` at the end are taken as "the whole value" too, as most IDS files mean them.

## Next

- [Export IFC](topic:ifc)
