---
title: Issues and BCF
summary: Pin a problem to the plan, an alignment station, a surface point or a pipe, give it a status and comments, and exchange the issues as BCF 2.1 files next to the LandXML file.
section: tasks
order: 63
keywords: issue, issues, bcf, comment, markup, snag, defect, site, pin, status, open, resolved, closed, bim collaboration format, landxml, problems
---

An issue is a note pinned to a place in your CivilCraft drawing, with a title, a status and comments. Use it to tell site staff or another program what to look at, and to read back what they answer.

## Add an issue

1. Open **Surface, More, Issues (BCF)...**
2. Type a title and what is wrong.
3. Choose where to pin it: the centre of the plan view, the surface point at the centre, a station of the selected alignment (type the station and an offset, right is positive), or the selected pipe, structure or feature line.
4. Press **Add issue**. The pin shows on the plan as a small diamond with its number.

Click an issue's title to zoom to it, change its status in the list (Open, Active, Resolved, Closed) and add comments. Each change is one undo step, and issues are saved in the project file.

## Exchange them as BCF

- **Export BCF** writes a BCF 2.1 file with one topic per issue: title, status, comments, and one viewpoint with an orthogonal plan camera and the pin.
- **Import BCF** reads a BCF file (2.0 and 3.0 files are read as far as they match 2.1). A topic with a guid you already have updates that issue (status, new comments) instead of adding a second one.
- **From Problems** makes an issue from every open entry in the Problems panel that says where it is.

BCF carries metres in this project's own coordinates, with no shift. The other program must be in the same coordinate system as your LandXML file for the pins to land in the right place. The element a pin points at (alignment, station, offset, pipe) travels as labels that start with "cc:", which CivilCraft reads back.

## What is not checked

The pins and viewpoints were tested only by writing a file and reading it back in CivilCraft. No other BIM program has opened them yet, and whether a BCF "view to world scale" means the full or half height of the view differs between programs: CivilCraft writes the full height.
