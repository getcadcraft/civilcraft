---
title: Pick an interface style
summary: Choose how the toolbar, panels and tabs are arranged, see what a style leaves out in your app, keep one style for every app or one for a single app, and export or import a style file.
section: start
order: 36
keywords: interface style, style, layout, workspace, ribbon, toolbox, drafting, multi-view, sketch, vector, duncan, classic, per app, import, export, ccworkspace, arrange, my tools, settings
---

An interface style is one arrangement of the toolbar, the panels, the tabs and the command line. Pick the one you are used to and the app opens in it. Your tools, menus and keys do not change; only where they sit does.

## Pick a style

1. Open {{ui:Settings}} (the gear, or {{key:Mod+,}}) and choose the {{ui:Global}} tab.
2. Under {{ui:Interface style}} choose {{ui:Pick a style}}. The list shows each style with a line that says how it is arranged.
3. Choose one. The window changes at once. The first choice, the app's classic style, is the arrangement the app started with.

The styles are {{ui:Drafting}}, {{ui:Multi-view}}, {{ui:Sketch}}, {{ui:Vector}}, {{ui:Duncan}}, {{ui:Ribbon and project browser}}, {{ui:Toolbox and info box}}, {{ui:AutoRev}} and the four {{ui:PRO-cad1 Ribbon}}, {{ui:PRO-cad2 Workbench}}, {{ui:PRO-cad3 Review}} and {{ui:PRO-cad4 Studio}} styles. Styles that come from an add-on or from a file you imported are listed under {{ui:From add-ons and files}}. Which of these you see depends on the app and on the build: a style the app cannot use is not offered.

:::note
This page describes the picker as it stands in the lab build. Some of the styles are still being finished; a style that looks incomplete in your build is one of those.
:::

## See what a style leaves out

An app is not the same as every other app. A style may ask for a ribbon, a tool column, view tabs, several views side by side or a 3D view cube, and your app may have none of those. Under the picker {{ui:Settings}} says what the chosen style leaves out in this app, for example: "In this app this style leaves out: the ribbon (this app has none)." It also counts tools and commands the style names that the app does not have. {{ui:Multi-view}} splits the drawing area into Top, Front, Right and Perspective views, which needs an app with a 3D model; in an app with one view at a time it keeps that one view.

## One style for every app, or one for this app

The style you pick is used in every app that has it; an app that does not have it keeps its own layout. To give just this app a different style, tick {{ui:Use a different interface style for}} this app. Unticked, the app follows your choice for all apps.

In the lab (the version for testing) the choice under the picker reads {{ui:This app}} or {{ui:Every app}}, and {{ui:This app}} is the start: the style you pick is kept for the app you are in, and the other apps keep theirs. Choose {{ui:Every app}} to make this app follow the style you pick for every app; choose {{ui:This app}} again and the style in use becomes this app's own. Each app opens in its own style straight away, before the page draws.

## Arrange your own

{{ui:Arrange your own interface style…}} opens a list of choices for where each part goes: the commands as a ribbon or the app's toolbar, what is on the left and the right, the tabs, a status bar, an info box or quick bar, the edit palette by the pointer and the look of tabs and button outlines. Only parts the app has are offered. The result is saved as {{ui:My layout}} (or the name you type), works in every app that has layouts, and its panels still dock, float and move to their own window ([Arrange the panels](topic:arrange-panels)).

In a style that has the {{ui:My tools}} slots, right-click a tool and choose {{ui:Add to My tools}}, or drag it to an empty slot. {{ui:Empty this slot}} clears one.

## Export and import a style

{{ui:Export this interface style}} saves the style as a `.ccworkspace.json` file. {{ui:Import an interface style…}} reads one, or drop the file on the box. The file holds layout data only and is read as untrusted: it can arrange the app's own blocks and cannot run anything. A file that is larger than 64 kB, made for a newer version, or has no name or blocks is refused, and the message says why. Up to eight imported styles are kept; remove one before adding a ninth. An imported style appears under {{ui:From add-ons and files}}; pick it there.

## If a style does not work

- If a style cannot be used in this app, the app shows its classic layout and says so.
- Finish or cancel the running command first: a style cannot change while a tool is running.
- To go back at any time, choose the classic style again in {{ui:Settings}}.
