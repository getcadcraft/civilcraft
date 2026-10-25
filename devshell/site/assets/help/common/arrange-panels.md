---
title: Arrange the panels and use a second monitor
summary: Dock the side panels left, right or at the bottom, stack them, group them as tabs, pin or hide them, float them over the drawing, make the layout denser, or move them to their own window on another screen.
section: start
order: 35
keywords: panels, dock, float, move panel, drag, layout, tabs, tab group, stack, pin, auto-hide, hide panel, close panel, compact, layout density, dense, second monitor, two screens, dual monitor, multiple monitors, window, pop-up, reset layout
---

The panels beside the drawing can move. Put them where they suit you, or give them a window of their own on a second monitor so the drawing gets the whole of the first one.

:::note
Each panel has a title bar: a slim bar with the panel's name, a {{ui:⋯}} menu, a pin and a close button at the top of the panel. Versions before 0.7 have the name and the {{ui:⋯}} menu only.
:::

## Move a panel in the window

1. Drag the panel by its name at the top.
2. While you drag, outlined areas appear on the left, the right and the bottom of the drawing. Drop the panel on one to dock it there. The area you are over darkens.
3. Drop it anywhere else over the drawing to make it float.

Panels can share one side: they stack, and each line between two of them drags to share the space (with a line focused, the arrow keys move it, and double-clicking it shares the space equally). Drag the inner edge of a docked side to make it wider or narrower; double-click the edge to put it back.

A floating panel stays over the drawing. Move it by its name, and resize it by dragging its lower-right corner (or tab to the corner and use the arrow keys). Double-click its name to dock it again where it was.

:::touch
Drag with one finger on the panel's name. Drag the lower-right corner of a floating panel with one finger to resize it, and the edges between docked panels the same way. To float or dock with no dragging, use the {{ui:⋯}} menu.
:::

## Group panels as tabs

Two panels can share one frame and show one at a time. Drag a panel by its name onto another panel's title bar (the bar is outlined while you are over it) and let go: the frame now has a tab for each panel, in its title bar. Click a tab to show that panel. With a tab focused, {{key:Left}} and {{key:Right}} switch tabs, and {{key:Home}} and {{key:End}} go to the first and last.

To take a panel out of the group, choose {{ui:Move out of the tab group}} in its {{ui:⋯}} menu, or drag it somewhere else. Choose {{ui:Tab with}} and a panel's name to group them without dragging.

## Pin, hide and bring back

- The pin in a panel's title bar makes it **auto-hide**: the panel leaves its dock and becomes a small tab at that edge. Point at the tab, focus it or click it and the panel slides out over the drawing; move away (or press {{key:Esc}}) and it slides back. Press the pin again, or choose {{ui:Unpin}}, to dock it for good.
- The close button, or {{ui:Hide this panel}} in the menu, hides the panel and closes up its dock. A dashed tab at the edge brings it back: click it, or focus it and press {{key:Enter}}.

## Make the layout denser

{{ui:Settings}} › {{ui:General}} › {{ui:Layout density}} has two choices. {{ui:Comfortable}} is the default. {{ui:Compact}} tightens the row heights, panel padding, toolbar buttons and panel text of that app so more fits on the screen. It is kept for each app. A touch screen keeps its large buttons in both, and a phone keeps its own layout. {{ui:Reset layout}} leaves the density as you set it.

## Use the keyboard

Every panel's {{ui:⋯}} button opens a menu: {{ui:Dock on the left}}, {{ui:Dock on the right}}, {{ui:Dock at the bottom}}, {{ui:Float over the drawing}}, {{ui:Pin to the edge}}, {{ui:Hide this panel}}, {{ui:Tab with}} another panel, {{ui:Move to a new window}} and {{ui:Put it back}}. Tab to the button, press {{key:Enter}}, move with the arrow keys and press {{key:Enter}} again. {{key:Esc}} closes the menu.

## Put the panels on a second monitor

1. Choose {{ui:⋯}} on a panel, then {{ui:Move all panels to a new window}}. You can also choose {{ui:Move panels to a new window}} in {{ui:Settings}}.
2. A small window opens with the panels in it. Drag it to your other monitor and make it as big as you like.
3. Keep working: the panels act on the drawing as before, and the drawing fills the main window.

Shortcuts keep working while the panels window is in front: keys you press there, other than typing in a box, go to the drawing. Questions and dialogs the app asks still open in the main window, so look there when one appears. The theme and the panel text size follow the main window.

:::chromium
Chrome and Edge can place the window on the other screen for you. With a second screen connected, choose {{ui:Put it on my other screen}} in the panels window (or {{ui:Put the panels on my other screen}} in a panel's {{ui:⋯}} menu). The browser asks once whether this site may see your screens; after you allow it, the panels window opens on that screen every time.
:::

:::firefox safari
Drag the panels window to the other monitor yourself. It opens in the same place and at the same size next time.
:::

## More than one panels window

Each panel can have a window of its own: up to four panels windows, for example one per monitor.

- In a panel's {{ui:⋯}} menu, {{ui:Move to a new window}} opens another window for that panel, and {{ui:Move to panels window 2}} (and so on) moves it into one that is open. The second window is called "panels 2".
- Drag a panel by its name from one window to another: let go over the main window to dock it there (the outlined areas show while you are over it) or to float it, and over another panels window to move it in. Let go anywhere else and it stays where it was.
- A panels window that has no panels left closes by itself.

After a reload the app offers your panels windows again. Browsers open one window per click, so choose {{ui:Open the next one}} once for each window.

## Move a dialog

Every dialog can be moved out of the way of the drawing: press and drag its title bar. The dialog remembers where you left it, each dialog on its own, and comes back to that place the next time it opens. Double-click the title bar to centre it again.

From the keyboard, press {{key:Alt}}+{{key:Shift}}+an arrow key with the focus inside the dialog to move it 16 pixels at a time; add {{key:Ctrl}} for 64. A dialog that ends up off the screen (after a smaller window or screen) is brought back.

On a phone, dialogs stay full-width sheets and are not moved.

In CadCraft Studio, CadCraft's {{ui:Plot to PDF}} dialog, which you may keep open while you work, has a button in its title bar, {{ui:Open in its own window}}. The dialog moves into a window of its own that you can put on another monitor. Closing the dialog closes the window, and closing the window closes the dialog.

## Put the panels back

- Choose {{ui:Put the panels back}} in the panels window, or simply close it. The panels go back where they were.
- Closing or reloading the main window closes the panels window too. When the app opens again it says your panels were in their own window; choose {{ui:Open it}} to bring the window back, or {{ui:Keep them here}}.
- {{ui:Settings}} › {{ui:General}} › {{ui:Reset layout}} puts every panel back where it started.

:::tip
If nothing opens when you move panels to a new window, the browser blocked the pop-up. The app says so and keeps the panels where they were. Allow pop-ups for getcadcraft.com, then try again.
:::

The layout is kept for each app in this browser, along with your other settings.
