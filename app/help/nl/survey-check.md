---
title: Een meettekening controleren bij het importeren
summary: Lees hoogtes die als tekst of in blokattributen zijn geschreven in als meetpunten, en controleer een DWG of DXF op verkeerde eenheden, geen coördinatenstelsel, een oorsprong ver weg, vlakke hoogtelijnen, rare hoogtes en dubbele punten voordat u er terrein van bouwt.
keywords: meettekening, importcontrole, meethoogtes, hoogtepunten, tekst-hoogtes, hoogtes als tekst, attributen, eenheden, coördinatenstelsel, ver van de oorsprong, hoogtelijnen op nul, afwijkers, dubbele punten, problemen, landschapsarchitect
from: d46acd24
---

Een meettekening kan goed lijken en toch fout zijn voor een terrein: de eenheden kunnen zijn geraden, de hoogtelijnen kunnen vlak op hoogte 0 liggen, of de hoogtes kunnen als tekst zijn geschreven die helemaal geen geometrie is. Het gedeelte **Meethoogtes en controle** van het dialoogvenster {{ui:Lijnwerk}} (zie [Een DWG of DXF als lijnwerk openen](topic:open-dwg-dxf)) leest die hoogtes en laat zien wat er niet klopt voordat er iets wordt toegevoegd.

## Hoogtes geschreven als tekst of in attributen

Veel meettekeningen geven een hoogtepunt als een klein tekstje naast een kruis, zoals `104.37` of `EL 104.37`, of als attribuut van een puntblok. Dit zijn geen lijnen, dus de lijnwerklezer laat ze weg. Het gedeelte toont hoeveel het er heeft gevonden en laat u ze als **meetpunten** overnemen:

1. Vink **… hoogtes als meetpunten overnemen** aan. Ze staan standaard uit, omdat niet elk getal in een tekening een hoogte is.
2. Tekst wordt gelezen wanneer het op zichzelf een hoogte is: een getal met een decimaal deel (`104.37`, `+104,37`, `-3.50`), of een getal na `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` of `LEVEL`, met optioneel `m`, `ft` of `'` erachter. Een los geheel getal (`12`) wordt gelezen als een perceel- of bladnummer, niet als hoogte; tekst zoals `GATE 3` of een datum wordt nooit gelezen. Opmaakcodes van tekst worden genegeerd.
3. Kies bij blokattributen **Blokattribuut dat de hoogte bevat**. CivilCraft vindt zelf een label met de naam ELEV, Z, LEVEL, RL of iets dergelijks; kies een ander label uit de lijst wanneer de tekening een eigen label gebruikt. De keuze wordt onthouden voor die bestandsnaam op deze computer, dus bij opnieuw openen begint het met hetzelfde label. Een label dat u kiest, neemt ook gehele getallen als hoogte over.
4. Klik op {{ui:Toevoegen}}. De punten krijgen nummers na het hoogste nummer in het project, elk punt wordt beschreven met zijn laag (of zijn blok), en de hoogtes worden omgerekend naar de eenheden van het project, net als de rest van de tekening. Dit alles is één stap: {{key:Mod+Z}} verwijdert de punten weer.

De tekst staat op zijn eigen invoegpunt (of op zijn uitlijnpunt wanneer die er is). Tekst binnen blokken wordt niet gelezen, en de tekening wordt nooit gewijzigd.

## De controle

De controle loopt over wat u op het punt staat in te laden en somt op wat zij vindt, één regel per soort probleem:

| Melding | Wat het betekent |
|---|---|
| **Eenheden niet vermeld** | De tekening zegt niet welke eenheden zij gebruikt, dus de getallen worden gelezen als de eenheden van het project. Controleer één afstand die u kent. |
| **Eenheden omgerekend** | De eenheden van de tekening wijken af van die van het project en worden geschaald (een opmerking, geen fout). |
| **De gegevens beslaan … km** of **… m** | De omvang is groter dan 200 km of kleiner dan een halve meter, wat meestal een verkeerde eenheid betekent (millimeters gelezen als meters, of andersom). |
| **Geen coördinatenstelsel** | Het project heeft er geen. Het is een waarschuwing wanneer de gegevens ver van nul liggen, zoals bij State Plane- of nationale roostercoördinaten. Zie [Coördinatenstelsels](topic:coordinate-systems). |
| **Ver van de oorsprong** | De gegevens liggen meer dan 100 km van nul. Ver van nul verliezen 3D-weergaven en exports precisie en gaan ze schudden. |
| **Hoogtelijnlaag … heeft geen hoogte** | Een laag met een naam zoals hoogtelijnen (TOPO, CONT, CNTR, CONTOUR) bevat lijnen op hoogte 0, dus een terrein dat ervan wordt gebouwd, zou vlak zijn. |
| **Hoogtes precies 0** | Sommige hoogtes zijn 0 terwijl de gebruikelijke hoogte ver daarvan af ligt: waarschijnlijk ontbrekende hoogtes. |
| **Hoogtes ver van de rest** | Enkele hoogtes liggen ver buiten de andere (gemeten ten opzichte van het midden van alle hoogtes, zodat een steil terrein met een grote spreiding niet wordt gemeld), of boven 9,000 m of onder -11,000 m. |
| **Punten bovenop een ander punt** | Twee punten op dezelfde plaats met dezelfde hoogte, of met verschillende hoogtes. |

Nadat u op {{ui:Toevoegen}} klikt, gaan dezelfde regels naar **Problemen**, één per soort, met de bestandsnaam, zodat u er later naar terug kunt. De controle beoordeelt de tekening; zij verandert er niets aan, en zij belet u niet om de tekening te gebruiken.

:::tip
Als de controle meldt dat hoogtelijnen vlak op 0 liggen en er hoogtes als tekst zijn geschreven, neem de hoogtes dan over als meetpunten: die bevatten vaak de echte hoogtes die de hoogtelijnen missen.
:::

## Wat niet wordt gecontroleerd

De controle vergelijkt de tekening niet met een tweede meting, en zij kan niet zien in welk coördinatenstelsel de tekening staat: zij meldt alleen dat er geen is ingesteld.
