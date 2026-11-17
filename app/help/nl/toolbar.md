---
title: Werkbalkverwijzing
summary: Elke werkbalkknop van CivilCraft, wat hij doet, zijn sneltoets, en wanneer hij uitgeschakeld is of weigert.
keywords: werkbalk, knoppen, opdrachten, gereedschappen, bestand, export, terrein, ontwerp, bewerken, weergave, menu
from: 4c4352bc
---

De werkbalk loopt over de bovenkant van de app in zeven groepen. Elke knop toont bij het aanwijzen zijn infotekst en sneltoets.

## Bestand

| Knop | Sneltoets | Wat het doet |
|---|---|---|
| {{ui:Nieuw}} | geen | Start een leeg project. Vraagt eerst als er niet-opgeslagen wijzigingen zijn. |
| {{ui:Openen}} | {{key:Mod+O}} | Opent een puntenbestand (CSV, TXT), LandXML of een CivilCraft-project. |
| {{ui:Opslaan}} | {{key:Mod+S}} | Downloadt het project als `<name>.civilcraft.json`. |

## Exporteren

| Knop | Sneltoets | Wat het doet |
|---|---|---|
| {{ui:LandXML}} | geen | Downloadt `<name>.xml`: punten, oppervlakken, tracés, profielen en het leidingnet als LandXML 1.2. "Nog niets om te exporteren." wanneer het project leeg is. |
| {{ui:DXF}} | geen | Downloadt `<name>.dxf`: het lijnwerk van het plan als R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Opent **Plan naar PDF plotten**. "Nog niets om te plotten." wanneer het project leeg is. |

## Terrein

| Knop | Sneltoets | Wat het doet |
|---|---|---|
| {{ui:Breeklijn}} | {{key:B}} | Klik meetpunten in volgorde aan, {{key:Enter}} om af te ronden. De breeklijn neemt de hoogtes van de punten over. |
| {{ui:Begrenzing}} | {{key:O}} | Klik de hoekpunten van de buitenste begrenzing aan, {{key:Enter}} om af te ronden. Vervangt elke bestaande begrenzing. |

Beide melden "Er is nog geen terrein: open eerst meetpunten." wanneer er geen terrein is.

## Ontwerp

| Knop | Sneltoets | Wat het doet |
|---|---|---|
| {{ui:Tracé}} | {{key:A}} | Klik de PI's in volgorde aan, {{key:Enter}} om af te ronden. |
| {{ui:Plaat}} | {{key:G}} | Klik de hoekpunten van het plateau aan, {{key:Enter}} om af te ronden. Net als de terreingereedschappen waarschuwt het wanneer er geen terrein is; een plateau wordt alleen op een terrein afgewerkt. |
| {{ui:Leidingen}} | {{key:P}} | Klik kunstwerken aan van stroomopwaarts naar beneden (klik op een bestaand kunstwerk om erbij aan te sluiten), {{key:Enter}} om af te ronden. |
| {{ui:Profiel}} | {{key:R}} | Toont of verbergt de profielweergave onder het plan. |

## Bewerken

| Knop | Sneltoets | Wat het doet |
|---|---|---|
| {{ui:Ongedaan maken}} | {{key:Mod+Z}} | Maakt de laatste wijziging ongedaan (tot 200). Uitgeschakeld wanneer er niets is om ongedaan te maken. |
| {{ui:Opnieuw}} | {{key:Mod+Y}} | Herstelt wat ongedaan is gemaakt. Uitgeschakeld wanneer er niets is om te herstellen. |
| {{ui:Kopiëren}} | {{key:Mod+C}} | Kopieert de geselecteerde meetpunten en zet ze op het klembord als puntrijen die een spreadsheet kan verwerken. Uitgeschakeld totdat er punten zijn geselecteerd. |
| {{ui:Plakken}} | {{key:Mod+V}} | Plakt punten: ze volgen de aanwijzer, en een klik zet ze neer met nummers die geen ander punt heeft. Puntrijen die in een spreadsheet zijn gekopieerd, worden ook geplakt. |
| {{ui:Meer}} | geen | Opent het menu hieronder. |

Het menu {{ui:Meer}}:

| Menu-item | Sneltoets | Wat het doet |
|---|---|---|
| {{ui:Knippen}} | {{key:Mod+X}} | Kopieert de geselecteerde punten en verwijdert ze (één stap ongedaan te maken). |
| {{ui:Kopiëren}} | {{key:Mod+C}} | Zoals de knop {{ui:Kopiëren}}. |
| {{ui:Plakken}} | {{key:Mod+V}} | Zoals de knop {{ui:Plakken}}. |
| {{ui:Plakken op dezelfde plaats}} | {{key:Mod+Shift+V}} | Plakt de punten op hun eigen coördinaten, met nummers die geen ander punt heeft. |
| {{ui:Dupliceren}} | {{key:Mod+D}} | Een kopie van de geselecteerde punten volgt de aanwijzer; klik waar ze moet komen. Het klembord blijft ongemoeid. |
| {{ui:Verwijderen}} | {{key:Delete}} | Verwijdert de geselecteerde meetpunten, of het geselecteerde tracé, plateau, kunstwerk (met zijn leidingen), leiding of PVI. |
| {{ui:Alle punten selecteren}} | {{key:Mod+A}} | Selecteert elk meetpunt. |
| {{ui:Selectie opheffen}} | {{key:Esc}} | Heft de selectie op. |

Een item dat nu niet kan worden uitgevoerd, is uitgeschakeld, en de infotekst zegt waarom. Details: [Meetpunten selecteren, kopiëren en plakken](topic:copy-paste-points).

Ongedaan maken geldt voor wijzigingen aan het ontwerp, de terreininstellingen en de meetpunten (plakken, knippen, dupliceren, verwijderen). Weergave-instellingen vallen er niet onder, en het openen of importeren van een bestand wist het.

## GIS

| Knop | Sneltoets | Wat het doet |
|---|---|---|
| {{ui:Coördinaten}} | geen | Opent het dialoogvenster **Coördinatenstelsel**: geef aan in welk stelsel het project staat, of gebruik terrein- of lokale coördinaten. Zie [Het coördinatenstelsel van het project instellen](topic:coordinate-systems) en [Terrein- en lokale coördinaten](topic:ground-and-local-coordinates). |
| {{ui:Importeren}} | geen | Importeert GIS-gegevens: shapefiles, GeoJSON, GeoPackage, hoogterasters en LiDAR. Zie [GIS-gegevens importeren](topic:gis-import). |
| {{ui:Exporteren}} | geen | Exporteert as-built gegevens voor een GIS-afdeling. Zie [As-built gegevens voor GIS exporteren](topic:gis-export). |
| {{ui:Analyseren}} | geen | Opent het GIS-analysepaneel: buffer, overlay, ruimtelijke join, selecteren op attribuut, meten. Zie [GIS-lagen analyseren](topic:gis-analysis). |
| {{ui:Attributentabel}} | geen | In Terrein › {{ui:Meer}}. Opent de attributentabel van een GIS-laag: sorteren, filteren, selecteren, bewerken, velden toevoegen, berekenen, opslaan als CSV. Zie [Met de attributentabel van een laag werken](topic:gis-table). |
| {{ui:Kaart}} | geen | Opent het dialoogvenster **Kaartlagen**: een geregistreerde afbeelding, of kaartservers die u toevoegt, onder het plan getekend. Zie [Kaartlagen onder het plan tonen](topic:map-layers). |

De GIS-gereedschappen laden de eerste keer dat u een van deze knoppen gebruikt, een GIS-bestand opent, of een project opent dat een coördinatenstelsel of GIS-lagen heeft.

## Weergave

| Knop | Sneltoets | Wat het doet |
|---|---|---|
| {{ui:Selecteren}} | {{key:V}} of {{key:Esc}} | Klik om tracés, plateaus, kunstwerken, leidingen en punten te selecteren ({{key:Shift}} met een klik of een slepen voegt punten toe); sleep grepen om PI's, plateauhoeken en kunstwerken te verplaatsen. |
| {{ui:Passend}} | {{key:F}} | Zoomt het plan zodat het terrein, de punten, tracés en plateaus zichtbaar zijn (in de 3D-weergave: toont alles). |
| {{ui:3D}} | {{key:D}} | Toont de locatie in 3D over het plan, of keert terug naar het plan. De balk boven de 3D-weergave bepaalt het aanzicht, de verticale overhoging, de kleuring en wat er getoond wordt, en exporteert GLB of OBJ. Zie [De locatie in 3D bekijken](topic:site-3d). |

## Knoppen in de panelen

| Knop | Waar | Wat het doet |
|---|---|---|
| Voorbeeldlocatie openen | Het vak op een leeg plan | Laadt de voorbeeldmeting (vereist een verbinding, tenzij CivilCraft is opgeslagen voor offline gebruik) |
| {{ui:De begrenzing verwijderen}} | Linkerpaneel, Terrein | Haalt de buitenste begrenzing weg |
| {{ui:Getekende breeklijnen verwijderen}} | Linkerpaneel, Terrein | Verwijdert elke breeklijn die met het gereedschap is getekend (niet de breeklijngroepen) |
| {{ui:Het oppervlak opnieuw bouwen uit de punten}} | Linkerpaneel, Terrein (alleen LandXML-terrein) | Verwijdert de LandXML-TIN en bouwt opnieuw op basis van de punten; kan niet ongedaan worden gemaakt |
| {{ui:Beginnen vanaf het maaiveld}} | Rechterpaneel, Tracé | Start een ontwerpprofiel met een PVI op het maaiveld aan elk uiteinde |
| {{ui:Profielweergave}} | Rechterpaneel, Tracé | Opent de profielweergave voor dit tracé |
| {{ui:PVI's toevoegen}} | Profielbalk | Zolang deze is ingedrukt, voegt een klik in het profiel een PVI toe |
| {{ui:Alle binnenonderkanten uit de regels instellen}} | Rechterpaneel, Leidingnet | Stelt de binnenonderkanten van elke leiding in volgens de regels |
| {{ui:Binnenonderkanten uit de regels instellen}} | Rechterpaneel, Leiding | Stelt de binnenonderkanten van deze leiding in volgens de regels |
