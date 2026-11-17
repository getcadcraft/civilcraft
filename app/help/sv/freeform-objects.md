---
title: Frihandsobjekt
summary: Ta in en form gjord i ett annat program (STL, OBJ eller ett biblioteksobjekt) till platsen; den står på marken eller skärs in i den, och dess volym, area och fotavtryck räknas som resten.
keywords: frihand, eget objekt, skulptur, planteringslåda, sittplats, nät, stl, obj, biblioteksobjekt, terrängmedveten, följa marken, skära in i marken, mängder, volym, ifc
from: ec835f33
---

En engångsfunktion (en planteringslåda, en sittmur, en skulptur, en lekkulle) kan skapas i ModelCraft eller PartCraft och placeras här, så att den ingår i samma modell och förteckningar som allt annat.

1. Landskap › Mer › {{ui:Frihandsobjekt…}} och välj en **STL**- eller **OBJ**-fil (i projektets enheter: fot i ett projekt i fot, meter i ett projekt i meter) eller ett CadCraft-**biblioteksobjekt** (`.json`) med en nätkropp.
2. Klicka där det ska stå.

## Dess bas

- **Följer marken**: dess lägsta punkt sitter på den lägsta marken under dess fotavtryck, så att inget svävar. Egenskaper uppskattar hur stor del av den som ligger under marken.
- **Skär in i marken**: dess bas sätts på en höjd och marken inom dess fotavtryck planeras till den med släntkrön, och räknas i Jordarbeten som en plattform.

Vrid den med **Vriden**, dra den i planen för att flytta den.

## Räknat

Egenskaper ger dess **volym** (för en sluten solid), **ytarea**, **fotavtryck** och **höjd**, uppmätta från nätet. IFC-exporten skriver den med den **IFC-klass** du väljer och dessa mängder.

:::note
Fotavtrycket är det konvexa höljet av konturen: en konkav form (en L-formad planteringslåda) planeras som om den vore ifylld.
:::
