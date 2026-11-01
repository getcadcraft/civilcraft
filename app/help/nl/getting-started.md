---
title: Aan de slag met CivilCraft
summary: Wat CivilCraft doet, hoe u het opent en de eerste tien minuten met het voorbeeldterrein, van punten tot hoogtelijnen, een weg en een opgeslagen project.
keywords: starten, eerste keer, voorbeeldterrein, introductie, snelstart, handleiding, beginnen, nieuw project
from: c9b6dd8e
---

CivilCraft is de app voor civiel en terreinontwerp van de CadCraft-familie. Hij maakt van meetpunten een oppervlak (een TIN) met hoogtelijnen, laat u tracés met ontwerpprofielen uitzetten, een eenvoudige wegcorridor laten lopen, bouwplateaus tot de dagzoom afgraven, een zwaartekrachtleidingnet toetsen aan uw regels en ontgravings- en ophogingsvolumes zien. Hij leest en schrijft LandXML, exporteert het plan als DXF en plot het naar PDF.

Hebt u Civil 3D gebruikt, dan zijn de ideeën bekend: punten, puntengroepen, breeklijnen, tracés met PI's, profielen met PVI's, corridors, grading, leidingnetten. De manier van werken is anders, en een stuk kleiner: er is geen opdrachtregel, geen stijlen en geen tekenbestand. Lees [Als u van andere civiele software komt](topic:coming-from) één keer vóór uw eerste echte klus.

## Wat u nodig hebt

- Een recente desktopbrowser: Chrome, Edge, Firefox of Safari. Zie [Browsers](common:browsers).
- Een muis of trackpad en een toetsenbord, of een aanraakscherm: tekenen heeft daar knoppen op het scherm voor {{ui:Gereed}}, {{ui:Punt ongedaan maken}} en {{ui:Annuleren}} (zie [Muis, trackpad en aanraken](topic:keyboard#mouse-trackpad-and-touch)).
- Het plan wordt in 2D getekend met het canvas van de browser. De [3D-weergave](topic:site-3d) gebruikt de WebGL-graphics van de browser; kan die niet starten, dan zegt de statusbalk waarom en werkt het plan nog.
- Geen account en niets uploaden. Bestanden openen op uw computer en worden als downloads opgeslagen. Zie [Uw bestanden](common:your-files).

:::note
CivilCraft draait vandaag als een vroege browserbuild die nog wordt gemaakt. Desktopbuilds zijn nog niet beschikbaar, en opslaan in de cloud is nog niet beschikbaar. Alles wat u maakt, blijft op uw computer totdat u het opslaat of exporteert.
:::

## CivilCraft openen

1. Open CivilCraft in uw browser.
2. Wacht tot het scherm zich vult: bovenaan een werkbalk, links een paneel, in het midden het plan en rechts een paneel **Eigenschappen**.
3. Op een leeg plan ziet u een vak met de titel **Begin met meetpunten**. Het somt de eerste stappen op en heeft een koppeling, {{ui:Het voorbeeldterrein openen}}.

Om CivilCraft later zonder verbinding te gebruiken, klikt u in de appbalk op {{ui:Opslaan voor offline gebruik}} en wacht u op {{ui:Klaar voor offline gebruik}}. Dat omvat deze Help, het voorbeeldterrein en de 3D- en GIS-bibliotheken. Zie [Offline](common:offline). Druk op {{key:F1}} of klik op {{ui:Help}} om deze Help op elk moment naast de app te openen.

## Uw eerste tien minuten: het voorbeeldterrein

Het voorbeeldterrein is een kleine opmeting in US feet: 276 punten op State Plane-coördinaten, een rug, een greppel met een stroomlijn en twee bovenkanten van talud. Het wordt met de app geleverd, dus u kunt meedoen zonder eigen bestand.

1. Klik in het vak op het plan op {{ui:Het voorbeeldterrein openen}}.
   Het dialoogvenster **Punten importeren** opent. Het zegt "276 punten gelezen als PNEZD (uit de koprij), gescheiden door komma's." en toont de eerste rijen.
2. Klik op {{ui:Importeren}}.
   Het plan vult zich met punten, hoogtelijnen en de rand van het oppervlak. De statusbalk onderaan zegt dat de punten zijn geïmporteerd en hoeveel driehoeken het oppervlak heeft (546).
3. Kijk in het linkerpaneel onder **Punten**. De punten zijn gegroepeerd op het eerste woord van hun beschrijving: CP, FL, GRD, RIDGE, TBN, TBS en TREE.
4. Zet in de kolom **Oppervlak** van die tabel **FL**, **RIDGE**, **TBN** en **TBS** op {{ui:Breeklijn}}.
   Het oppervlak wordt meteen opnieuw opgebouwd. De feiten bij **Oppervlak** zeggen nu "Breeklijnen: 4", en de hoogtelijnen buigen scherp langs de stroomlijn en de rug in plaats van er dwars doorheen te snijden.
5. Beweeg de aanwijzer over het plan. De statusbalk toont de oostwaarde en noordwaarde onder de aanwijzer en de maaiveldhoogte daar.
6. Stel onder **Weergave** {{ui:Hoogtelijnen elke}} in op 0.5 ft en zet {{ui:Hoogtebanden}} aan. Onder de selectievakjes verschijnt een kleurenschaal met een legenda. Zet de banden weer uit als u klaar bent.

U hebt nu een oppervlak van het bestaande maaiveld. Daarna een weg.

## Een korte weg uitzetten

1. Druk op {{key:A}} (of klik in de groep **Ontwerp** op {{ui:Tracé}}).
2. Klik drie punten over het terrein, na elkaar. Een rode lijn volgt de aanwijzer en toont de lengte en richtingshoek van de volgende raaklijn.
3. Druk op {{key:Enter}} om af te ronden.
   Het tracé verschijnt met stationering. Het rechterpaneel toont **Tracé**: zijn lengte, de PI-tabel en de boog bij de middelste PI (radius 100 ft, of kleiner als 100 ft niet past).
4. Klik in het rechterpaneel onder **Ontwerpprofiel** op {{ui:Beginnen vanaf het maaiveld}}.
   De profielweergave opent onder het plan met het bestaande maaiveld en een rechte ontwerphelling van begin tot eind.
5. Druk op {{key:I}} om {{ui:PVI's toevoegen}} aan te zetten en klik daarna één keer in de profielweergave ongeveer in het midden. Er verschijnt een PVI.
6. Typ in de PVI-tabel rechts een lengte voor de boog (bijvoorbeeld 100) in het vak **Boog L** van de middelste PVI en druk op {{key:Enter}}. Het profiel heeft nu een verticale boog, met zijn K-waarde erbij.
7. Vink onder **Corridor** **Een dwarsprofiel langs het ontwerpprofiel laten lopen** aan.
   De weg wordt in het terrein afgegraven: rijstroken, bermen en taluds tot de dagzoom. Het blok **Grondverzet** toont ontgraving en ophoging.

Maak u geen zorgen over exacte waarden. Elk getal kunt u in het rechterpaneel wijzigen, en {{key:Mod+Z}} maakt de laatste wijziging ongedaan.

## Uw werk opslaan

1. Typ een naam in **Naam** bovenaan het linkerpaneel.
2. Druk op {{key:Mod+S}} (of klik op {{ui:Opslaan}}).
   De browser downloadt een bestand genoemd naar het terrein, eindigend op `.civilcraft.json`. Het bevat de punten, de oppervlakinstellingen, tracés, profielen, corridors, plateaus en leidingen.
3. Om later verder te gaan, klikt u op {{ui:Openen}} (of drukt u op {{key:Mod+O}}) en kiest u dat bestand, of zet u het op het plan neer.

:::warning
Er is geen automatisch opslaan. Sluit u het tabblad met niet-opgeslagen wijzigingen, dan vraagt de browser of u weg wilt; gaat u weg, dan zijn de wijzigingen verloren. Sla vaak op.
:::

## Waar u daarna naartoe kunt

- [Meetpunten importeren](topic:import-points) met uw eigen bestanden.
- [Het oppervlak opbouwen en verfijnen](topic:build-surface) met breeklijnen en een begrenzing.
- [Het scherm, onderdeel voor onderdeel](topic:workspace).
- [Toetsen en muis](topic:keyboard).
