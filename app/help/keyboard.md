---
title: Keys and mouse
summary: Every keyboard shortcut and mouse, trackpad and touch action in CivilCraft, grouped, with the browser and platform differences.
section: reference
order: 10
keywords: keyboard, shortcuts, hotkeys, keys, mouse, trackpad, touch, pan, zoom, pinch, wheel, right-click, mac, command key
---

Single-letter keys work when you are not typing in a box. Shortcuts with {{key:Mod}} use Command on a Mac and Ctrl elsewhere. See also [Keys in the browser](common:keys).

## Files and editing

| Key | Action |
|---|---|
| {{key:Mod+O}} | Open a point file, LandXML or project |
| {{key:Mod+S}} | Save the project (downloads a `.civilcraft.json` file) |
| {{key:Mod+P}} | Plot the plan to PDF (opens the plot dialog, not the browser's print) |
| {{key:Mod+Z}} | Undo |
| {{key:Mod+Y}} | Redo |
| {{key:Delete}} | Delete the selected survey points, alignment, pad, structure, pipe or PVI |
| {{key:Mod+C}} | Copy the selected survey points (also as point rows for a spreadsheet) |
| {{key:Mod+X}} | Cut the selected survey points |
| {{key:Mod+V}} | Paste points: they follow the pointer, click where they go |
| {{key:Mod+Shift+V}} | Paste in place: at the points' own coordinates |
| {{key:Mod+D}} | Duplicate the selected points: a copy follows the pointer |
| {{key:Mod+A}} | Select every survey point |
| {{key:Esc}} | Select none (and cancel a paste) |

{{key:Mod+S}}, {{key:Mod+O}} and {{key:Mod+P}} work even while you are typing in a box. {{key:Mod+Z}} and {{key:Mod+Y}} in a text box undo your typing instead, as usual, and so do {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} and {{key:Mod+A}}: in a box they copy, cut, paste and select its text. With text selected on the page (in a panel), {{key:Mod+C}} copies that text. {{key:Mod+Shift+Z}} does nothing in CivilCraft: use {{key:Mod+Y}} or the {{ui:Redo}} button.

:::mac
The Mac key labeled **delete** is {{key:Backspace}} to the browser. To delete a selection, press {{key:Delete}} (Fn and delete), or choose {{ui:Delete}} in the toolbar's {{ui:More}} menu.
:::

## Tools

| Key | Tool |
|---|---|
| {{key:V}} | {{ui:Select}} |
| {{key:A}} | {{ui:Alignment}} |
| {{key:G}} | {{ui:Pad}} |
| {{key:P}} | {{ui:Pipes}} |
| {{key:B}} | {{ui:Breakline}} |
| {{key:O}} | {{ui:Boundary}} |
| {{key:R}} | Show or hide the profile view |
| {{key:I}} | Turn {{ui:Add PVIs}} on or off (opens the profile view if it is closed) |
| {{key:F}} | {{ui:Fit}}: show everything |
| {{key:D}} | {{ui:3D}}: show the site in 3D, or go back to the plan |
| {{key:E}} | Show or hide grades and elevations along every feature line (on the screen only) |

Pressing the key of the active tool again goes back to {{ui:Select}}. Letters with Shift do nothing.

## While drawing

| Key | Action |
|---|---|
| {{key:Enter}} | Finish the alignment, pad, pipe run, breakline or boundary |
| {{key:Backspace}} | Remove the last point clicked |
| {{key:Esc}} | Cancel the drawing (or the paste); pressed again (or with nothing drawn), go back to {{ui:Select}} and clear the selection |

## Plan view

| Key or action | Result |
|---|---|
| Wheel | Zoom in or out at the pointer |
| Drag on empty space | Pan (in any tool; a short click still clicks; with {{key:Shift}} held it draws a selection box instead) |
| Drag with the middle button | Pan |
| Drag with the right button | Pan (no menu opens) |
| {{key:Space}} and drag | Pan |
| Click | Select (with {{ui:Select}}), or place a point (with a drawing tool) |
| {{key:Shift}} and click | Add a survey point to the selection, or take it out |
| {{key:Shift}} and drag | Draw a box: the survey points inside it are added to the selection. Drag round them for a [lasso](topic:lasso-selection) |
| {{key:Space}} while drawing a lasso | Window, then crossing, then fence |
| Click while pasting | Put the pasted points there ({{key:Enter}} puts them at their own coordinates) |
| Drag a grip | Move a PI, pad corner or structure (one undo step) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Pan, when the plan has the focus (click it first) |
| {{key:Plus}} and {{key:Minus}} | Zoom in and out at the middle, when the plan has the focus |

The = key zooms in like {{key:Plus}}, so you do not need Shift.

## Profile view

| Action | Result |
|---|---|
| Click with {{ui:Add PVIs}} on | Add a PVI there |
| Click a PVI | Select it |
| Drag a PVI | Move it (one undo step) |
| {{key:Delete}} or {{key:Backspace}} | Remove the selected PVI (Backspace only when the profile view has the focus) |

The profile view does not zoom or pan.

## Screen and help

| Key | Action |
|---|---|
| {{key:F1}} | Open or close this help (the side panel); {{ui:Help}} in the app bar does the same |
| {{key:Esc}} | Close the help panel when it is open |
| {{key:Ctrl+Shift+F}} | Cycle the screen modes: full screen, full screen with the bars hidden, normal |
| {{key:Esc}} | Leave full screen (the browser's own key) |

{{key:F1}} reaches the help before CivilCraft sees it, so it works in any tool. On most Mac keyboards, press fn with F1, or click {{ui:Help}}. {{key:Ctrl+Shift+F}} uses the Control key on every platform, including a Mac. See [Using help](common:help) for how to search this help.

## Mouse, trackpad and touch

:::mouse
- Wheel zooms at the pointer. A mouse with a free-spinning wheel zooms quickly: give it short turns.
- Pan with any drag on empty space, the middle button, the right button, or {{key:Space}} and drag.
:::

:::mac
On a Mac trackpad:

- Two-finger scrolling **zooms** (it does not pan), and pinching zooms too.
- To pan, press and drag on empty space with one finger, or hold {{key:Space}} and drag.
- A two-finger click (right-click) opens no menu and does nothing on its own.
:::

:::touch
On a touch screen:

- The first touch makes buttons and menu rows finger-sized.
- Tap to select or to place a point; one finger dragged on empty space pans. A tap may wobble a little: it only pans after the finger moves about 10 pixels.
- Two fingers pinch to zoom and move together to pan.
- Drag a grip or a PVI with one finger. Grips take a finger's width round them.
- While you draw an alignment, pad, breakline, boundary, pipe run, feature line or parcel, a bar over the plan offers {{ui:Finish}} ({{key:Enter}}), {{ui:Undo point}} ({{key:Backspace}}) and {{ui:Cancel}} ({{key:Esc}}). A long press (half a second without moving) also finishes.
- In {{ui:Select}}, a long press on a survey point adds it to the selection, or takes it out, as {{key:Shift}}+click does.
- In the 3D view, one finger orbits, two pinch and pan, and a tap picks.
- There is no hover on touch, so the status bar readouts update only while a finger is down.
:::

## Browser keys that win

Some keys belong to the browser and never reach CivilCraft, for example {{key:Mod+W}} (close tab), {{key:Mod+T}} (new tab), {{key:Mod+N}} (new window) and {{key:F11}} (full screen in Windows and Linux browsers). CivilCraft does not use them. If a shortcut opens something in the browser instead, click the plan once so the page has the focus, and try again.
