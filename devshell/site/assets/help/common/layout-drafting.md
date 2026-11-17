---
title: The Drafting layout: a 2D drafting workspace
summary: A workspace with a menu bar, a ribbon, file tabs, a viewport label, navigation bar and axes over the drawing, Model and sheet tabs and a row of drawing-mode toggles, in dark chrome.
section: start
order: 42
keywords: drafting, layout, workspace, menu bar, ribbon, quick access, navigation bar, axes, viewport label, command line, model tab, sheet tab, status bar, toggles, grid, snap, ortho, polar, dark, 2D
---

Drafting is a layout for people who draw in 2D all day: the whole chrome is dark, and the controls sit where drafting programs have taught people to look for them. It is built from the same blocks as every other layout, so it works in every app that has the parts it asks for and leaves out, with a note, the parts an app does not have (a view cube in an app with no 3D view, for example).

## What is where

- **Top row:** the app mark and name, your quick-access tools (the ones this app has), the document name and the window buttons. The document name shows a dot while there are unsaved changes.
- **Menu bar** under it, with the menus drafting programs use: {{ui:File}}, {{ui:Edit}}, {{ui:View}}, {{ui:Modify}}, {{ui:Tools}} and the rest the app has.
- **Ribbon** under the menu bar. A tab that appears when something is selected lights up in the app's colour. The ribbon never wraps: what does not fit goes behind a {{ui:⋯}} button.
- **Over the drawing:** the view label at the top left, the navigation bar at the right edge and the axes at the bottom left. An app with a 3D view also gets a view cube at the top right. Between them the drawing keeps the pointer.
- **Command line:** in an app that has one (CadCraft), the app's own command bar stays where it was: Drafting does not add a second one.
- **Bottom:** the Model and sheet tabs, and a row of mode toggles ({{ui:Grid}}, {{ui:Snap}}, {{ui:Ortho}}, {{ui:Polar}} and the others the app has) with the app's messages beside them. A toggle the app does not have is simply not there.

The app's name and logo show once, in the top row, whatever the width of the window.

## Choose it

{{ui:Settings}} › {{ui:Global}} › {{ui:Layout}} › {{ui:Drafting}}. {{ui:Classic}} always brings back the layout you had. To move a block or change what a block holds, see [Change a layout on the screen](common:layout-edit).

## Good to know

- On a phone, or in a window 760 pixels wide or narrower, the app uses its phone layout whatever you picked. A wider window brings Drafting back.
- This layout is in the lab (the version for testing) and is not released yet.
