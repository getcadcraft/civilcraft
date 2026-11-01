---
title: CabinetCraft: materials and cost
summary: Picking boards and edge banding, your own materials, the construction numbers, and the cost estimate with its placeholder rates.
section: tasks
order: 3
keywords: materials, edge banding, sheet size, cost, estimate, rates, placeholder, hardware, labour
---

## Materials

{{ui:Materials}} lists generic boards by kind and thickness, with no maker named: melamine and plywood carcass boards, fibreboard and plywood backs, fronts, drawer sides and bottoms, hardwood for a face frame, and edge bands. A pick sets the thickness in the construction rules (a 15 mm carcass makes 15 mm sides) and the name in the cut list. Each material has its own sheet, and the nest uses it.

Add your own under {{ui:Your own materials}}: a name as your shop writes it, what it is used for, its thickness and, if you like, its sheet size. A material of your own keeps its name exactly as typed.

## Construction numbers

Plinth height, how far the plinth sits back, the gap between fronts, the height wall cabinets hang at, how far shelves stop short of the front, the widest and tallest single door and the drawer slide gap are all numbers you can change. The default for each is shown when you hold the pointer over it.

## Cost estimate

{{ui:Cost}} adds up sheets, edge banding, face-frame hardwood, hardware, countertop, shop labour by kind of cabinet and machine time, then a markup and tax.

**Every rate starts as a placeholder.** The numbers shipped with the add-on are round figures in one currency so the arithmetic works; they are not a price list and not anyone's prices. A placeholder is marked with a star in the table, the page says so in capitals while any are left, and the CSV has a column and a closing note that say so. When you put in your own rate for a line it stops being a placeholder. Until your shop has set its own, treat the total as an example of how the estimate works, not as a quote.

## Your shop's own rates

To replace the placeholders, type your rate for a line under {{ui:Rates}}, or import a table of your own: {{ui:Download the rate sheet}} gives a CSV of every rate (its path, its value now and whether it is still a placeholder); fill in your prices, using a decimal point, and {{ui:Import my rates}}. A CSV of `path,value` lines or a JSON file in the job's own shape also works. Only the rates the file names are replaced, a line that is not a rate or not a usable number is listed and ignored, and the rest stay placeholders. Your rates are saved with the job and with the job file. CabinetCraft supplies no rate of its own that is anyone's price.

## The first run, and the final quote

The first time you open {{ui:Cost}} on a job whose rates you have not touched, it asks **Type your shop's rates**: type them under {{ui:Rates}}, or download the rate sheet, fill it in and import it. The estimate carries a label. It says **DRAFT** while any rate in use is a placeholder, and the lint under it lists the categories that still are (sheet materials, banding, hardware, labour, machine time, countertop, made-to-order cabinets, markup and tax). It says **FINAL QUOTE** only when every rate the job uses is yours, and the estimate CSV ends with the same label. A rate counts as yours when you typed or imported it, even if it happens to equal the placeholder (a tax of 0, say). The label is a check on the rates, not on the arithmetic or the quantities: have the numbers looked at before a quote goes out. The real rates are your shop's to supply; CabinetCraft supplies none.

Sheets are counted from the nest when you have nested the job, else estimated from the area of the parts with 15 % for the saw kerf and waste.
