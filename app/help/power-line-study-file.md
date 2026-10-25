---
title: Study files for another line program (.DON)
summary: Save one overhead line as a .DON study file, or read the supports of one into a new line. Untested with the program that reads them.
section: tasks
order: 167
keywords: don, .don, study file, xml, export, import, overhead line program, stringing, canton
---

Some overhead-line programs keep a study in a `.DON` file (XML text). CivilCraft can write one line as such a file and read the supports of one.

:::warning
**Untested.** We built this from a list of the format's field names that a user shared, not from a real file, and we have not opened our files in the program that reads them. Open the file there and check every value before you rely on it. If you can share a `.DON` file (with the client's details removed), it helps us make this right.
:::

## Save a study file

1. Give the line a conductor and make sure it has results (no "not worked out" in its Properties).
2. {{ui:More}} › {{ui:Save a study file (.DON)…}}, pick the line, add a description and a job number.
3. {{ui:Save the study file}}.

The file holds the line's supports (coordinates, ground, heights, roles, crossarm, the support kept or suggested, loads per load case, foundation), one section per stretch between dead-ends (conductor, voltage, ruling span, spans, tension and catenary parameter, the largest tension per load case) and the stringing tables. Lengths are in metres and forces in daN; text is written in Latin-1, so a character outside it becomes `?`.

## Read a study file

{{ui:More}} › {{ui:Open a study file (.DON)…}} reads the supports into a new line. The conductor, supports and crossarms are matched to your library by name; anything not found is left for you to pick in Properties.
