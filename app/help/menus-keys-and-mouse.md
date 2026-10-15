---
title: Menus, keys and mouse
summary: Pick a menu style that matches the way you already work, give any command your own key, move commands between ribbon tabs, and set what the wheel and the mouse buttons do in the plan and in 3D.
section: reference
order: 12
keywords: menu style, menus, ribbon, civil ribbon, toolbar, command line, drafting classic, keyboard shortcuts, hotkeys, keys, customize, remap, rebind, mouse, wheel, invert, zoom direction, middle button, right button, pan, orbit, export, import, switching, familiar
---

CivilCraft's commands are the same whichever way you reach them. A **menu style** only decides where they sit on screen, what they are called there and which keys run them, so you can keep the habits you have. Choose one in {{ui:Settings}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menus, keys and mouse}}; the change is immediate, and this browser remembers it.

## The three styles

| Style | What you get |
|---|---|
| {{ui:CivilCraft}} | CivilCraft's own toolbar (File, Export, Surface, Design, Edit, GIS, View) and single keys: {{key:A}} alignment, {{key:G}} pad, {{key:P}} pipes, {{key:B}} breakline, {{key:O}} boundary, {{key:L}} feature line, {{key:R}} profile, {{key:X}} sections, {{key:E}} grades, {{key:D}} 3D, {{key:F}} fit, {{key:V}} select. The start. |
| {{ui:Drafting classic}} | A small ribbon ({{ui:Home}}, {{ui:Insert}}, {{ui:Output}}) and a command line, for people who type commands: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (undo), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Start typing anywhere and the letters go to the command line; {{key:Enter}} runs, {{key:Enter}} on nothing repeats the last command, {{key:Esc}} clears it. The middle button pans. |
| {{ui:Civil ribbon}} | Tabs of large buttons the way civil design programs group their tools: {{ui:Home}} (ground data, create design, profile and section views), {{ui:Surfaces}}, {{ui:Modify}}, {{ui:Geolocation}}, {{ui:View}} and {{ui:Output}}, with a {{ui:File}} menu and quick buttons on the right. The single keys stay. The middle button pans the plan; in 3D the middle button pans and {{key:Shift}} with the middle button orbits. |

Every style keeps the {{key:Mod}} keys: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
A key that belongs to CivilCraft's own layout but that your style gave another command does nothing, and the status line says where its command went ("In My keys, Pad is Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} and the arrows always keep their meaning, and while you draw a line its points keep their keys ({{key:Backspace}}, {{key:Enter}}).
:::

## Make it your own

1. Pick the style closest to what you want, then click {{ui:Customize…}}.
2. On {{ui:Keys and menus}}, find a command (the search box helps). {{ui:Add a key}} and press the key, or two keys in a row for a two-letter key. Click a key to take it off.
3. With a ribbon, {{ui:Where it sits}} moves the command to another tab and panel, to the {{ui:File}} menu, or to {{ui:Keys only}}.
4. On {{ui:Mouse}}, set the wheel, the buttons that pan the plan, and what each button does in the 3D view.
5. Give it a name and click {{ui:Save}}.

Saving a built-in style makes your own copy ("My Civil ribbon"); the built-in one never changes. A key given to two commands, or one that would run before a two-letter key could be typed, is shown in red and has to be fixed before you can save.

## Mouse

- **Mouse wheel**: {{ui:Scroll up zooms in}} (the start) or {{ui:Scroll up zooms out}}, and how fast, in the plan and in 3D. A trackpad pinch always zooms the way your fingers move.
- **Pan the plan with**: the middle button, the right button, or both. {{key:Space}} and drag pans too. The left button always picks and draws.
- **Drag in the 3D view**: {{ui:Each view's own}} keeps CivilCraft's buttons (left orbits, right pans). Or set each button to orbit, pan, zoom or nothing; {{key:Shift}} with the button swaps orbit and pan. A click without dragging still picks.

## Take it with you

{{ui:Export}} saves the style in use as a small `.ccinput.json` file; {{ui:Import…}} adds one, from another computer or a colleague. An imported file can only point at CivilCraft's own commands: anything else in it is left out and counted in the status line. {{ui:Delete this style}} removes one of your own.

:::note
These settings stay in this browser. {{ui:Use this style in every app}} under the style cards makes every app open in its matching style (its own toolbar, a ribbon or Drafting classic), with the changes you made in each app. CivilCraft has no menu-bar style: when another app's menu bar is chosen for every app, CivilCraft keeps its own toolbar.
:::

Related: [Keyboard and mouse](topic:keyboard) · [CivilCraft settings](topic:settings) · [Coming from other civil software](topic:coming-from)
