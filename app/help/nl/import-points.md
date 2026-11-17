---
title: Meetpunten importeren
summary: Open een CSV- of tekstbestand met punten, controleer de kolomvolgorde in het dialoogvenster Punten importeren, los rijen op die niet gelezen kunnen worden, en sorteer de punten in groepen.
keywords: punten importeren, csv, txt, pnezd, penzd, puntenbestand, meetpunten, cogo-punten, puntengroepen, kolommen, noordwaarde, oostwaarde
from: ad33d88a
---

Een puntenbestand is een tekstbestand met één punt per regel: puntnummer, noordwaarde, oostwaarde, hoogte en beschrijving in een willekeurige volgorde, gescheiden door komma's, tabs, puntkomma's of spaties. CivilCraft leest het in de browser en bouwt er meteen een terrein uit.

## Voordat u begint

- Ken de kolomvolgorde van het bestand als u die weet (PNEZD en PENZD zien er voor een computer hetzelfde uit).
- Ken de eenheden. CivilCraft converteert niet: stel **Eenheden** in het linkerpaneel in op die van het bestand (zie [Eenheden, stations en getalnotaties](topic:units-and-stations)).
- Coördinaten mogen groot zijn (noord- en oostwaarden in de miljoenen zijn prima).

## Het bestand importeren

1. Klik op {{ui:Openen}} in de werkbalk, of druk op {{key:Mod+O}}, en kies het bestand. U kunt het ook op het plan slepen.
   Het dialoogvenster **Punten importeren** opent met de bestandsnaam, een lijst **Kolommen** die op {{ui:Herkennen}} staat, een samenvattingsregel en de eerste zes punten.
2. Lees de samenvattingsregel. Die zegt hoeveel punten zijn gelezen, in welke kolomvolgorde, hoe die volgorde is gevonden en wat de kolommen scheidt. De drie manieren waarop de volgorde wordt gevonden:
   - "uit de kopregel": de eerste regel noemt de kolommen (Punt, Noordwaarde, Oostwaarde, Hoogte, Beschrijving, of X, Y, Z …). Dit is het veiligst.
   - "zoals gekozen": u koos een volgorde in **Kolommen**.
   - "geraden uit het aantal kolommen en uw instelling voor Puntrijen (PNEZD) — controleer of noord- en oostwaarde niet zijn omgewisseld": er was geen bruikbare kopregel. Als uw bestanden meestal eerst de oostwaarde hebben, zet u **Puntrijen** in de [CivilCraft-instellingen](topic:settings) op P, E, N, Z, D.
3. Controleer de voorbeeldtabel. De kolommen zijn altijd **Punt**, **Noordwaarde**, **Oostwaarde**, **Hoogte**, **Beschrijving**, ongeacht de volgorde in het bestand. Noord- en oostwaarden van een echte locatie zijn meestal duidelijk verschillend van grootte: als ze omgewisseld lijken, was het raden fout.
4. Staat de volgorde verkeerd, kies dan de juiste in **Kolommen** (bijvoorbeeld {{ui:PENZD — punt, oostwaarde, noordwaarde, hoogte, beschrijving}}). De samenvatting en de voorbeeldtabel werken meteen bij.
5. Kijk onder de voorbeeldtabel naar **Rijen niet gelezen**. Elke regel noemt het regelnummer in het bestand, de reden en het begin van de rij. Zie [Rijen die niet gelezen worden](topic:import-points#rows-that-are-not-read).
6. Klik op {{ui:Importeren}}.
   De punten verschijnen op het plan, de weergave zoomt erop in en het terrein wordt gebouwd. De statusbalk zegt bijvoorbeeld "276 punten geïmporteerd uit site.csv; terrein: 546 driehoeken."

Als het project nog geen naam had, neemt het de naam van het bestand.

## De groepen controleren

Elk punt hoort bij een groep die genoemd is naar het **eerste woord van zijn beschrijving**, in hoofdletters: "GRD", "FL 12" en "fl" zijn groepen GRD, FL en FL. Punten zonder beschrijving gaan in "(geen beschrijving)".

1. Kijk naar de tabel onder **Punten** in het linkerpaneel: groep, aantal punten en een keuze voor **Terrein**.
2. Elke groep begint als {{ui:Punten}}. Zet stroomlijnen, verhardingsranden, boven- en teenlijnen van taluds, richels en vergelijkbare gecodeerde lijnen op {{ui:Breeklijn}}. Zet groepen die het maaiveld niet mogen vormen (controlepunten, boomtoppen, nutspalen die bovenaan zijn ingemeten) op {{ui:Weggelaten}}.
3. Klik op een punt op het plan (met {{ui:Selecteren}}) om het nummer, de coördinaten, de hoogte, de beschrijving en de groep in het rechterpaneel te zien.

:::warning
Een breeklijngroep voegt **alle** punten samen tot **één** lijn, in puntnummervolgorde. Dat werkt als elke gecodeerde lijn in volgorde met een eigen code is ingemeten. Twee aparte stroomlijnen die allebei als "FL" zijn gecodeerd, worden één lijn die zigzagt tussen beide. Als uw codes gedeeld zijn, gebruik dan het gereedschap {{ui:Breeklijn}} om de punten van elke lijn aan te klikken (zie [Het terrein bouwen en verfijnen](topic:build-surface)).
:::

## Rijen die niet gelezen worden

| Getoonde reden | Wat het betekent | Wat te doen |
|---|---|---|
| "noord- of oostwaarde is geen getal" | Een coördinaatkolom bevat tekst | Controleer de kolomvolgorde, of een losse tekstrij midden in het bestand |
| "hoogte is geen getal" | De hoogtekolom bevat tekst | Verkeerde kolomvolgorde, of een beschrijving in de hoogtekolom |
| "geen puntnummer" | De puntkolom is leeg | Nummer het punt, of kies een volgorde zonder P (NEZD, NEZ …): punten worden dan genummerd 1, 2, 3 … |
| "punt 12 komt twee keer voor (de eerste blijft behouden)" | Twee rijen delen een nummer | Nummer er een opnieuw in het bestand als beide echte metingen zijn |
| "3 kolommen, verwacht 5 (PNEZD)" | De rij is te kort | Een gebroken regel, of de verkeerde kolomvolgorde |

Een punt zonder hoogte blijft behouden, maar wordt niet in het terrein gebruikt. De feiten onder **Punten** tonen hoeveel punten een hoogte hebben.

Regels die beginnen met `#`, `;` of `//` zijn commentaar en worden overgeslagen. Lege regels worden overgeslagen.

## Punten vervangen of toevoegen

Opnieuw importeren **vervangt** alle punten; het voegt er niets aan toe. Uw tracés, platen, leidingen, getekende breeklijnen en begrenzing blijven. De ongedaan-maakgeschiedenis wordt gewist, dus sla het project eerst op als u de oude punten misschien terug wilt. Om twee bestanden te combineren, voegt u ze samen in een teksteditor of spreadsheet voordat u importeert (let op herhaalde puntnummers).

Punten kunnen binnen CivilCraft nog niet worden verplaatst, bewerkt of verwijderd. Corrigeer ze in het bestand en importeer opnieuw.

## Gerelateerd

- [Puntbestandsformaten](topic:point-file-formats): elke kolomvolgorde en hoe kopregels worden herkend.
- [Het terrein bouwen en verfijnen](topic:build-surface).
