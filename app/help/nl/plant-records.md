---
title: Plantrecords, cultivars en geleverde maten
summary: De eigen plantenlijst van uw project als tabel: cultivars, geleverde maten (container, kluit, stamomtrek, vrije stamhoogte), dichtheid, specificatie-opmerkingen, CSV in en uit; elke geplaatste plant noemt een maat; plantsymbolen per schaal en uw eigen symbolen en 3D-modellen.
keywords: plantentabel, plantendatabase, cultivar, variëteit, geleverde maat, container, kluit, wortelkluit, wortelnaakt, stamomtrek, vrije stamhoogte, dichtheid, planten per m², specificatie, specificatie-opmerkingen, plantsymbool, blok, eigen symbool, 3D-plant, detailniveau, schaal
from: 12251beb
---

Open {{ui:Plant table}} via het menu {{ui:More}} van de groep Landschap, of via de sectie Planten. Elke rij is een plantrecord in de eigen lijst van dit project (een record uit de plantenlijst wordt gekopieerd wanneer u het toevoegt). Elke wijziging wordt gecontroleerd zoals een geïmporteerd bestand, en is één stap die u ongedaan kunt maken.

## De kolommen

- **Botanische naam**, **Nederlandse naam**, **Type**, **Hoogte** en **Breedte** op volwassen leeftijd (meter).
- **Plantafstand** (hart op hart) of **Dichtheid** (planten per m²). Een vak van een record met een dichtheid en zonder plantafstand wordt gevuld met die dichtheid, volgens het eigen patroon (driehoekig of vierkant).
- **Geleverde maten**: één item per maat, gescheiden door `;`. Elk item is een id, een soort (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) en daarna een van: een volume `10L`, een hoogte `h0.6`, een breedte `s0.4`, een stamomtrek `g14-16` (cm), een vrije stamhoogte `st1.8`. Voorbeeld: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Cultivars**: namen, gescheiden door `;`. Een cultivar behoudt zijn eigen maten en opmerkingen wanneer het geïmporteerde bestand die had.
- **Specificatie-opmerkingen**.

{{ui:Duplicate}} kopieert een rij onder een nieuwe sleutel; {{ui:Save as CSV}} en {{ui:Save as a plants file}} schrijven de lijst uit (CSV-rijen voor cultivars staan onder hun soort, met `cultivar_of`). Een CSV- of plantenbestand importeren voegt het samen met de tabel.

## Uw eigen plantenlijst in de Bibliotheek

Meld u aan bij uw CadCraft-account (Instellingen, Uw add-ons, Aanmelden). Dan kan de plantentabel de lijst gebruiken die u in de Bibliotheek bewaart:

- {{ui:From my Library list}} haalt uw eigen plantenitems op (ook die nog op beoordeling wachten). Een plant die u hier al hebt, wordt bijgewerkt vanuit de Bibliotheek; de cultivars, geleverde maten, dichtheid en specificatie die u hier hebt toegevoegd, blijven behouden.
- {{ui:Save as a plant list}} slaat elke rij op als uw eigen plantenitem in de Bibliotheek, één item per soort: een nieuwe plant is een nieuw item, een gewijzigde plant is een nieuwe versie, een ongewijzigde plant blijft ongemoeid. Vink eerst het vakje aan: opslaan geeft de planten vrij aan het publiek onder CC0. Een eerste publieke upload van iemand die nog niet vertrouwd is, wordt door een persoon gecontroleerd voordat die verschijnt, zoals elke upload.

De Bibliotheek bewaart het basisrecord van de plant. Cultivars, geleverde maten, dichtheid en specificatie-opmerkingen blijven in het project en in het plantenbestand ({{ui:Save as a plants file}}); het dialoogvenster meldt elke keer bij het opslaan hoeveel rijen dat raakt.

## Een geplaatste plant noemt een maat

Selecteer een plant, een haag of een mengrij van een vak of beplant gebied: wanneer het record cultivars of geleverde maten heeft, kiest {{ui:Cultivar and size}} er één. De plantenstaat telt dan per soort, cultivar en maat, en een label kan ze tonen: `{botanical} '{cultivar}' {size}` of `{full}`.

## Plantsymbolen per schaal

{{ui:Plant graphics}} (Landschap › Meer) bepaalt hoe planten in plan worden getekend: **automatisch** (grover dan 1:500 een cirkel op de breedte, tussen 1:200 en 1:500 een omtrek met middelpunt, fijner het gedetailleerde symbool; beide schalen zijn aan te passen) of één niveau voor elke schaal. Het dialoogvenster Bladen heeft een eigen **Plantdetail in plan** voor die set.

Op een record in de sectie Planten leest {{ui:Own symbol…}} een SVG, of een blok uit een DXF/DWG-tekening, en tekent het op de breedte van de plant op het gedetailleerde niveau. {{ui:Own 3D model…}} leest een OBJ, STL of GLB; kies in Plantsymbolen **Eigen model van elk record** om het in 3D te zien. Bestanden hebben een maximum (512 KB SVG, 2000 vormen, 50 000 driehoeken) en worden in het project bewaard. SVG-transformaties worden niet toegepast (u krijgt een melding wanneer een bestand die heeft). Zie [Plantsymbolen, eigen symbolen en 3D-planten](topic:plant-graphics) voor de niveaus, de grenzen en wat een GLB mag bevatten.
