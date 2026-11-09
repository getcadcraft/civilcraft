---
title: Undo the last step across windows
summary: In CadCraft Studio, take back the last thing you did in any app window from the Studio window, in the order you worked, without changing windows first.
section: tasks
order: 140
keywords: undo, undo across apps, undo last step, last step, project undo, studio undo, order I worked, undo in another app, windows, journal
---

## What you will do

You drew a wall in BimCraft, then moved a mark in TakeoffCraft, and you want the last one back without hunting for the right window. In the Studio window, under **Open windows**, choose {{ui:Undo last step}}.

## How it works

Each app window tells Studio when it finishes a step, with the name you see in its own Undo. Studio keeps the newest step of every window and the order between them. The line beside the button names the newest one, for example "Rename the takeoff in TakeoffCraft".

1. Choose {{ui:Undo last step}} in the Studio window. Studio asks "Undo this step in that app?"; nothing happens until you say {{ui:Undo it}}.
2. Studio asks that window for its own next undo and the window runs it, exactly as if you had pressed Undo there. Choose the button again for the step before.

## What it will not do

- It takes back **one window's own last step** only. It does not undo the effects of that step in another app: a change in BimCraft that fed a takeoff is not undone in TakeoffCraft by this.
- If you have changed that window since (typed in it, opened another file, or undone by hand there), Studio does not force anything. It skips that window and says nothing was undone; use Undo inside the app.
- A closed window's steps are gone. Steps older than half an hour are not offered.
- It does not undo a save, and it is not offered in a browser tab on its own: it needs the apps open as windows of one Studio.

Each app's own Undo ({{key:Ctrl}}+{{key:Z}}) works as before, and is told to Studio too, so the two never disagree.
