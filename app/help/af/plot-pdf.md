---
title: Plot die plan na PDF
summary: Plot alles of die huidige aansig na 'n vektor-PDF op 'n standaardblad teen 'n ingenieurs- of metriese skaal, in laagkleure of swart.
keywords: plot, druk, pdf, blad, skaal, papiergrootte, planblad, publiseer, titelblok, noordpyl, skaalbalk
from: 9af396ca
---

{{ui:PDF}} plot die plan na 'n vektor-PDF op een blad, met 'n titelstrook, 'n noordpyl en 'n skaalbalk. Die PDF word in die blaaier gemaak en afgelaai; dit gaan nie deur die blaaier se drukdialoog nie.

## Plot

1. Stel die plan op onder **Vertoning**: die oppervlak wat gewys word, die kontoerinterval en watter dinge aan is. Die plot volg hierdie instellings.
2. As jy net deel van die terrein wil hê, zoem en pan die plan daarheen.
3. Klik {{ui:PDF}} in die **Uitvoer**-groep, of druk {{key:Mod+P}}.
   Die dialoog **Plot die plan na PDF** maak oop.
4. Kies die **Oppervlakte**: {{ui:Alles}} of {{ui:Wat op die skerm is}}.
5. Kies die **Papier**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 of A1. 'n Projek in voet begin op Tabloid, 'n projek in meter op A3. Blaaie is altyd landskap.
6. Kies die **Skaal**. Die lys merk die grootste skaal wat pas met "(pas)" en kies dit.
   - Voet: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Meter: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Kies die **Inkt**: {{ui:Laagkleure}} of {{ui:Swart}}.
8. Lees die reël onder die keuses. Dit gee die grootte van die oppervlakte op papier en die bladgrootte, byvoorbeeld "Die oppervlakte is 297 × 222 mm by 1" = 40' op 'n 432 × 279 mm-blad (landskap)."
9. Klik {{ui:Laai PDF af}}.
   Die blaaier laai `<name>.pdf` af. Die statusbalk sê "Geplot <name>.pdf by 1" = 40'."

As die oppervlakte groter as die blad is by die skaal wat jy gekies het, word die plot gesentreer en die rande word afgesny. Kies die skaal wat "(pas)" gemerk is, of 'n groter blad.

## Wat op die blad is

- Die plan, gesentreer in die tekenarea, as ware vektore: kontoerlyne, etikette, belynings met stasionering, korridors, padomtrekke en dagligtlyne, pype, punte.
- Lynddiktes per laag: belynings, padomtrekke en pype swaarder; driehoeke en ondergeskikte kontoerlyne fyn.
- 'n Titelstrook langs die onderkant met die projek se **Naam**, die skaal, 'n notas van die kontoerinterval en watter oppervlak (bestaande of gelykgemaak), en die datum en bouweergawe aan die regterkant.
- 'n Noordpyl in die regter-boonste hoek (plan-noord is op) en 'n skaalbalk in die titelstrook.
- Die kaartlae wat onder die plan gewys word ('n prent, kaarttegels of 'n kaartdiens), wanneer **Kaartlae onder die plan** gemerk is: hulle word as een prent van die hele tekenarea geteken, teen 150 kolpunte per duim, onder die lynwerk, en 'n kaart se erkenning gaan in die titelstrook. CivilCraft wag tot 8 sekondes vir kaartprente wat nog aankom; as sommige nog ontbreek, sê die statusbalk dit.

Teks gebruik die PDF se ingeboude Helvetica. Karakters buite die Wes-Europese stel (Windows-1252) word as "?" gedruk, en die statusboodskap tel hulle.

## Wat nie geplot word nie

- Hoogtebande.
- Die profielaansig. Plot van profiele is nog nie beskikbaar nie.
- Meer as een blad (vir 'n belyning, gebruik [plan- en profielblaaie](topic:plan-profile-sheets)), aansigvensters, 'n pasgemaakte titelblok of staande blaaie.

:::note
Die dialoog sê helling-pyltjies is net op die skerm. In hierdie weergawe word helling-pyltjies wat onder **Vertoning** aangeskakel is, geplot (en na DXF uitgevoer). Skakel hulle af voor jy plot as jy hulle nie wil hê nie.
:::

## Druk op papier

Maak die afgelaaide PDF in enige PDF-leser oop en druk dit op 100% (werklike grootte) sodat die skaal waar bly. "Pas by bladsy" verander die skaal.
