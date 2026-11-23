---
title: Change a layout on the screen
summary: Drag a block to another place, right-click a tool to remove, move or add one, and keep the result as a layout of your own that you can export.
section: start
order: 40
keywords: layout, arrange, drag, handle, move block, right-click, tool, remove tool, add tool, new group, rename group, my layout, reset, undo, workspace, customize ribbon, customize toolbox, window, palette stack, large tools, small tools, more tools
---

You can change a layout without leaving the drawing. The built-in layout is never changed: your first change makes a copy named {{ui:My}} and the layout's name, and every later change edits that copy.

## Move a block

1. Open {{ui:Settings}} (the gear, or {{key:Mod+,}}), choose {{ui:Global}}, then {{ui:Layout}}, and choose {{ui:Arrange your own layout…}}. With a layout on, the screen goes into Arrange mode and the dialog closes.
2. Every block (the ribbon, the tool rows, the toolbox, the palettes, the status bar and the others) has a small handle at its corner. Drag a handle: a map of the places appears. The places the block can go to are outlined; the others are dimmed and say why.
3. Drop the block on a place. The layout changes at once.
4. The bar at the bottom has {{ui:Undo}} and {{ui:Redo}} for each move, {{ui:Reset}} to bring the built-in layout back, and {{ui:Done}}.

Without a mouse: put the focus on a handle and press {{key:Enter}}. A list of the places that block may go to opens; choose one.

## Change what a block holds

Right-click a tool in the ribbon, the tool rows or the toolbox:

- {{ui:Remove from here}} takes the tool out of its group (the tool is still in the app; it is only not shown here).
- {{ui:Move earlier}} and {{ui:Move later}} change its place in the group.
- {{ui:Add a tool}} lists the app's tools and then every command the app has; the one you pick goes after the tool you clicked.
- {{ui:New group}} and {{ui:Rename the group}} make a group and name it.
- {{ui:Reset this block}} gives the block back the tools the app offers.
- {{ui:Show the first … tools}} keeps that many tools of the group in view; the rest wait under the group's {{ui:▾}}. {{ui:Show all its tools}} undoes it.
- In the ribbon, {{ui:Large tools}} and {{ui:Small tools}} draw every tool of the group one size; {{ui:Sizes as the app draws them}} goes back.

## A block in a window of its own

In Arrange mode the map of places also has {{ui:In a window}} for the ribbon, the tool rows, the toolbox and the status bar. The block stays in its place until you click {{ui:Open in windows}} in the note at the bottom: a browser opens a window only when you click. A layout file can ask for the same with the place `window`.

## Palettes in two stacks

The panel's palettes can stand in two stacks, one over the other, each with its own tabs. Drag a palette by its tab (or use the grip at the left of its stack's tabs) to the other stack, to a stack of its own, or to the other panel. Each move is one step of {{ui:Undo}}. The panel's own content always stays in its panel.

## Switch layouts

Layouts are chosen in {{ui:Settings}} › {{ui:Global}} › {{ui:Layout}}: your own layouts first, then the built-in ones and {{ui:Classic}}. Choosing one does not reload the app.

## Keep it

Your layout is listed in Settings under {{ui:From add-ons and files}}. {{ui:Export this layout}} saves it as a file you can give a colleague or check on the developers' layouts page. The file only says where blocks go and which tools they hold: no code.

See also [Arrange your own layout and save your setups](common:layout-own).
