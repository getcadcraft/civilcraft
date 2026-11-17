---
title: Arbetsytan Landskap
summary: Planteringsplaner, planering, beläggning, murar, trappsteg, bevattning och landskapsblad på samma tomt, samma ytor och samma fil som anläggningsarbetet.
keywords: landskap, landskapsarkitektur, trädgård, plantering, växter, träd, planering, hårdgjorda ytor, beläggning, bevattning, sprinklers, arbetsyta, tomtdesign, landskapsplan
from: eea929d1
---

Arbetsytan Landskap lägger landskapsdesignverktyg på den CivilCraft-tomt du redan har: samma mätpunkter, samma befintliga mark, samma planerade yta och samma projektfil.

## Öppna den

Välj {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Arbetsytan Landskap}}. Verktygsfältet visar då ett val **Arbetsyta** och gruppen **Landskap**, och grupperna Terrängmodell, Design och GIS flyttas åt sidan för att ge plats. Välj **Civil** under Arbetsyta för att gå tillbaka. CivilCraft minns vilken arbetsyta du använde senast på den här datorn.

Den vänstra panelen får tre avsnitt överst:

- **Växter**: växtlistan, för att söka och välja vad du placerar. Se [Växtlistan](topic:plant-list).
- **Planeringskontroller**: lutningsanalys, flödespilar och uppdämning. Se [Planering](topic:landscape-grading).
- **Bevattning**: sprinklerna och rören du placerar härnäst, vattenförsörjningens inställningar. Se [Bevattning](topic:irrigation).

## Vad finns i gruppen Landskap

| Verktyg | Vad det gör | Ämne |
|---|---|---|
| **Växt**, **Bädd**, **Häck** | Enskilda växter, planteringsbäddar fyllda med växternas avstånd, häckar längs en linje | [Plantering](topic:planting) |
| **Planera** | Platåer, vallar, svackor, planeringsområden med punkthöjder och höjdkurvor, lutnings- och flödeskontroller | [Planering](topic:landscape-grading) |
| **Hårdgjorda ytor** | Beläggning, stigar, murar, kantstenar, ramper och trappsteg som följer marken | [Hårdgjorda ytor](topic:hardscape) |
| **Ytor** | Planteringsytor: gräsmattor, bäddar, ängar och marktäckare med en uppbyggnad, klippta runt de hårdgjorda ytorna | [Planteringsytor](topic:planted-areas) |
| **Nivåer** | Markmodifierare i ordning med schakt och fyllning, punkthöjder, lutningspilar, snittlinjer | [Markmodifierare](topic:ground-modifiers), [Sektioner](topic:landscape-sections) |
| **Bevattning** | Sprinklerhuvuden, rör, ventiler, droppledningar, försörjningen, täckning och en hydraulisk kontroll | [Bevattning](topic:irrigation) |
| **Mer** | Från en linje (objekt kopplade till linjerna), växtförteckningen, växtlistan, kalkylblad, växtgrafik, fria objekt, landskapsblad och utgivningsuppsättningen, IFC-export, växtstorlek och etiketter | [Objekt från linjer](topic:objects-from-lines), [Växtposter](topic:plant-records), [Kalkylblad](topic:worksheets), [Landskapsblad](topic:landscape-sheets), [Fria objekt](topic:freeform-objects) |

Allt du lägger till är ett ångra-steg, sparas i projektfilen och ritas i planen på lager med namnen `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` och `L-IRRG-…`, så DXF-, DWG- och PDF-exporten bär det också.

## En yta för allt

Platåer, vallar, svackor, planeringsområden, beläggning och stigar planeras in i den **planerade ytan**, samma som korridorer och byggplattor använder. Den **befintliga marken** ändras aldrig. Växter står på den mark som finns under dem, så de flyttas när planeringen ändras. Jordarbetet räknar landskapsplaneringen tillsammans med allt annat.

:::tip
Ny här? [Designa en trädgård från start till mål](topic:landscape-walkthrough) går igenom hela arbetsytan på exempeltomten.
:::
