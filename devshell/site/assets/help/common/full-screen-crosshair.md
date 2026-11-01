---
title: Full-screen crosshair
summary: Two thin lines through the pointer, edge to edge across the drawing or view, to check by eye that things line up. One switch turns it on in every app.
section: reference
order: 30
keywords: full screen crosshair, full-screen cursor, crosshair, cursor, cursorsize, cursorsize 100, edge to edge, line up, alignment, align, guide lines, cross hairs
---

The full-screen crosshair draws two thin lines through the pointer: one across the whole width of the drawing or view under it, one down its whole height. Move the pointer to an edge or a corner and you can see at once whether other things sit on the same line. It is the same as AutoCAD's {{cmd:CURSORSIZE}} 100.

## Turn it on

Open {{ui:Settings}} (the gear in the app bar, or {{key:Mod+,}}), go to {{ui:General}} and tick **Crosshair from edge to edge in every app** under **Full-screen crosshair**. It is one switch for all eight apps on this computer: turn it on in one app and the others have it too, also in tabs that are already open.

## What it does

- The lines show while the pointer is over a drawing or a view, also when no tool is running.
- Toolbars, cards and hints that sit over the view stay on top of the lines; a dialog never gets them.
- With a finger nothing changes: the lines follow a mouse, a trackpad or a pen.
- In CadCraft the crosshair is drawn by the drawing itself: it turns with the coordinate system (UCS), and with the view split it stays in the pane you are working in. CadCraft also has it as a cursor size of its own: {{ui:Settings}} › {{ui:CadCraft}} › **Cursor** › **Full screen**, or type {{cmd:CURSORSIZE}} and 100.
