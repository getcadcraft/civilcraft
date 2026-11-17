---
title: Ärenden och BCF
summary: Fäst ett problem på planen, en linjeföringsstation, en ytpunkt eller en ledning, ge det en status och kommentarer, och utbyt ärendena som BCF 2.1-filer bredvid LandXML-filen.
keywords: ärende, ärenden, bcf, kommentar, markering, brist, fel, plats, nål, status, öppen, åtgärdad, stängd, BIM-samarbetsformat, landxml, problem
from: e44153b1
---

Ett ärende är en anteckning som är fäst på en plats i din CivilCraft-ritning, med en titel, en status och kommentarer. Använd det för att tala om för platspersonal eller ett annat program vad de ska titta på, och för att läsa av vad de svarar.

## Lägg till ett ärende

1. Öppna **Yta, Mer, Ärenden (BCF)...**
2. Skriv en titel och vad som är fel.
3. Välj var det ska fästas: mitten av planvyn, ytpunkten i mitten, en station på den markerade linjeföringen (skriv stationen och ett sidoavstånd, höger är positivt), eller den markerade ledningen, brunnen eller funktionslinjen.
4. Tryck på **Lägg till ärende**. Markören visas på planen som en liten romb med sitt nummer.

Klicka på ett ärendes titel för att zooma till det, ändra dess status i listan (Öppen, Aktiv, Åtgärdad, Stängd) och lägg till kommentarer. Varje ändring kan ångras i ett steg, och ärenden sparas i projektfilen.

## Utbyt dem som BCF

- **Exportera BCF** skriver en BCF 2.1-fil med ett ämne per ärende: titel, status, kommentarer och en vy med en ortogonal plankamera och markören.
- **Importera BCF** läser en BCF-fil (2.0- och 3.0-filer läses så långt de stämmer med 2.1). Ett ämne med ett guid du redan har uppdaterar det ärendet (status, nya kommentarer) i stället för att lägga till ett andra.
- **Från problem** skapar ett ärende av varje öppen post i Problempanelen som anger var den finns.

BCF bär meter i det här projektets egna koordinater, utan förskjutning. Det andra programmet måste använda samma koordinatsystem som din LandXML-fil för att markörerna ska hamna rätt. Elementet som en markör pekar på (linjeföring, station, sidoavstånd, ledning) överförs som etiketter som börjar med "cc:", och CivilCraft läser tillbaka dem.

## Vad som inte är kontrollerat

Markörerna och vyerna har bara testats genom att skriva en fil och läsa tillbaka den i CivilCraft. Inget annat BIM-program har öppnat dem ännu. Om BCF:s "view to world scale" avser hela eller halva vyhöjden skiljer sig mellan programmen: CivilCraft skriver full höjd.
