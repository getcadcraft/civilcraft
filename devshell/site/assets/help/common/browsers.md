---
title: Browsers and computers
summary: Which browsers the apps run in, what differs between them, and what your computer needs.
section: start
order: 20
keywords: chrome, edge, firefox, safari, brave, browser, mac, windows, linux, ipad, tablet, webgl, requirements, memory
---

The apps run inside a web browser. They do the work on your own computer: your files are opened there and never sent to us (see [Where your files go](common:your-files)).

## Which browser

Use an up-to-date version of one of these:

| Browser | Engine | Notes |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | The most complete: folder picking, saving for offline use, file handling. |
| Firefox | Gecko | Works. Opening a whole folder uses a simpler picker. Offline saving may not work in private windows. |
| Safari | WebKit | Works on Mac and iPad. Opening a whole folder uses a simpler picker. Safari may delete an offline copy you have not used for a few weeks. |

All three engines are fine for everyday work. Where an app does something differently in one of them, its help shows the steps for your browser.

## What differs between browsers

- **Opening a folder.** Chromium browsers show a real folder picker and can read the folder directly. Firefox and Safari ask you to choose a folder and then read every file in it, which takes longer for big project folders; dragging the folder onto the app works in all three.
- **Saving.** The apps save by downloading a file. Your browser decides where downloads go and whether it asks first.

:::chromium
In Chrome or Edge, turn on "Ask where to save each file before downloading" (in Settings, under Downloads) to choose a folder every time.
:::

:::firefox
In Firefox, open Settings, then General, then Downloads, and choose "Always ask you where to save files" to pick a folder every time.
:::

:::safari
In Safari, open Settings, then General, and set "File download location" to "Ask for each download" to pick a folder every time.
:::

## Mac, Windows and Linux

The apps are the same on every computer. What changes is the keyboard: shortcuts are written for your computer automatically. See [Keys, mice and trackpads](common:keys).

## Tablets and touch screens

Some apps accept touch (one finger draws or selects, two fingers pinch to zoom and pan). Each app's help says whether it does. On an iPad, use Safari or Chrome. A keyboard helps with apps that use typed commands.

## What your computer needs

These are planned minimums for the apps, not measured requirements:

- 8 GB of memory (16 GB is recommended for large federated models).
- A graphics chip with WebGL 2 for the 3D apps. If a 3D view stays blank, check that hardware acceleration is on in your browser's settings.
- A screen at least 1280 pixels wide for the full toolbars; smaller screens wrap them.

Very large files (big plan sets, big models) use a lot of memory in a browser tab. Close other heavy tabs if an app slows down.
