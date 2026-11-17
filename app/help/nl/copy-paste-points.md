---
title: Opmeetpunten selecteren, kopiëren en plakken
summary: Selecteer opmeetpunten met een klik, Shift en een kader, of allemaal tegelijk; kopieer, knip, plak, plak op dezelfde plaats, dupliceer en verwijder ze met nieuwe puntnummers die nooit botsen; plak puntrijen van en naar een spreadsheet.
keywords: kopiëren, plakken, knippen, dupliceren, punten verwijderen, punten selecteren, alles selecteren, kaderselectie, venster, klembord, spreadsheet, csv, hernummeren, puntnummers, plakken op dezelfde plaats, klonen, uitzetten
from: 78a6aea7
---

Opmeetpunten kunnen binnen een project worden gekopieerd en geplakt, tussen projecten in twee browsertabbladen, en van en naar een spreadsheet. Elke wijziging is één ongedaan-stap, en het oppervlak wordt meteen opnieuw opgebouwd uit de nieuwe punten.

## Punten selecteren

Met {{ui:Selecteren}} ({{key:V}}):

- **Klik** op een punt om het te selecteren (en alleen dat). De nummers verschijnen onder **Eigenschappen**.
- {{key:Shift}} en **klik** voegt een punt aan de selectie toe, of haalt het eruit.
- {{key:Shift}} en **sleep** tekent een kader: de punten erin worden aan de selectie toegevoegd. Sleep eromheen in plaats daarvan, dan wordt het een lasso; zie [Lassoselectie van opmeetpunten](topic:lasso-selection). Een slepen zonder {{key:Shift}} verschuift het plan, zoals altijd.
- {{key:Mod+A}} (of {{ui:Meer}} › {{ui:Alle punten selecteren}}) selecteert elk punt.
- {{key:Esc}} (of {{ui:Meer}} › {{ui:Selectie opheffen}}) wist de selectie.

Geselecteerde punten hebben een ring. Bij meer dan één geselecteerd punt toont **Eigenschappen** hoeveel er zijn, hun nummers, hun hoogtebereik en hun groepen.

## Kopiëren, knippen en verwijderen

- {{ui:Kopiëren}} of {{key:Mod+C}} kopieert de geselecteerde punten. CivilCraft bewaart de kopie en zet die ook op het systeemklembord als puntrijen, zodat u ze direct in een spreadsheet of tekstbestand kunt plakken.
- {{ui:Meer}} › {{ui:Knippen}} of {{key:Mod+X}} kopieert ze en verwijdert ze, in één stap.
- {{ui:Meer}} › {{ui:Verwijderen}} of {{key:Delete}} verwijdert ze. {{key:Mod+Z}} brengt ze terug.

De rijen zijn punt, Northing, Easting, hoogte, beschrijving (P,N,E,Z,D), gescheiden door komma's, met drie decimalen. Om Easting vóór Northing te zetten, stelt u **Puntrijen** in bij [CivilCraft-instellingen](topic:settings). Een beschrijving die een spreadsheet als formule zou lezen (beginnend met =, +, - of @) krijgt een apostrof ervoor, zodat ze tekst blijft.

## Plakken

1. Druk op {{key:Mod+V}} of klik op {{ui:Plakken}}. De punten volgen de aanwijzer als kleine kruisjes, met een stippellijn terug naar waar ze vandaan kwamen.
2. Klik waar ze moeten komen. Het midden van de gekopieerde punten komt op de klik terecht.
3. Of druk op {{key:Enter}} om ze op hun eigen coördinaten te zetten, of op {{key:Esc}} om te annuleren.

{{ui:Meer}} › {{ui:Plakken op dezelfde plaats}} of {{key:Mod+Shift+V}} plakt op de eigen coördinaten van de punten, meteen. De geplakte punten worden daarna geselecteerd, zodat u ze opnieuw kunt kopiëren, verplaatsen of verwijderen.

:::note
Klikken op {{ui:Plakken}} in de werkbalk leest het systeemklembord. De eerste keer kan de browser vragen of CivilCraft het klembord mag zien. Weigert u, dan plakt de werkbalkknop alleen de eigen kopie van CivilCraft; {{key:Mod+V}} plakt nog steeds rijen uit een spreadsheet zonder te vragen.
:::

## Puntnummers botsen nooit

Twee punten delen nooit een nummer. Bij het plakken:

- Een geplakt punt behoudt zijn nummer als geen enkel punt in het project dat nummer heeft. Na **Knippen** worden de punten dus met hun eigen nummers teruggeplakt, en punten die uit een ander project zijn gekopieerd behouden hun nummer waar het vrij is.
- Een geplakt punt waarvan het nummer bezet is, krijgt een nieuw geheel getal: één meer dan het hoogste gebruikte nummer, oplopend.
- De statusbalk zegt wat er is gebeurd, bijvoorbeeld "1 behield zijn nummer; 9 kregen nieuwe nummers: 10–18 werd 277–285".

In [CivilCraft-instellingen](topic:settings) kunt u **Altijd nieuwe nummers** kiezen, en een nummer waarmee nieuwe nummers beginnen, bijvoorbeeld 5000 voor ontwerppunten.

:::warning
Puntgroepen die het oppervlak als **breeklijn** opbouwen, verbinden hun punten in nummervolgorde. Geplakte kopieën van breeklijnpunten (bijvoorbeeld FL-opnamen) krijgen nieuwe, hogere nummers en sluiten aan op het einde van die breeklijn, mogelijk met een lange sprong. Controleer het plan na het plakken van zulke punten, of zet hun groep op {{ui:Punten}}.
:::

## Dupliceren

{{ui:Meer}} › {{ui:Dupliceren}} of {{key:Mod+D}} maakt een kopie van de geselecteerde punten die de aanwijzer volgt: klik waar ze moeten komen. De kopieën krijgen altijd nieuwe nummers, en het klembord van CivilCraft blijft zoals het was.

## Uit een spreadsheet of tekstbestand

Selecteer rijen met punten in een spreadsheet (punt, Northing, Easting, hoogte, beschrijving) en kopieer ze. Druk in CivilCraft op {{key:Mod+V}} en klik waar ze moeten komen, of druk op {{key:Mod+Shift+V}} om ze op hun eigen coördinaten te zetten; dat is meestal wat u wilt voor echte opmeetgegevens.

De rijen worden precies gelezen als een [puntenbestand](topic:point-file-formats): komma's, tabs of spaties, een kopregel als die er is. Zonder kopregel komt de kolomvolgorde uit **Puntrijen** in [CivilCraft-instellingen](topic:settings).

Staan beide klaar, dan beslist CivilCraft op basis van wat het nieuwst is: rijen op het systeemklembord die verschillen van de laatste kopie van CivilCraft, zijn later gekopieerd en worden dus geplakt. Tekst zonder punten wordt genegeerd, en in plaats daarvan wordt de eigen kopie van CivilCraft geplakt.

## Tussen projecten en tabbladen

De kopie wordt in deze browser bewaard, zodat een tweede tabblad van CivilCraft hem kan plakken, zelfs nadat het eerste tabblad is gesloten. Punten die in een project in meter zijn gekopieerd en in een project in voet zijn geplakt, behouden hun nummers zoals ze zijn: er wordt niets omgezet, en de statusbalk zegt dat.

## Wat niet wordt gekopieerd

Voorlopig worden alleen opmeetpunten gekopieerd. Tracés, platen, leidingnetwerken, breeklijnen en grenzen kunnen nog niet worden gekopieerd of geplakt. Plakken kan bestaande punten niet verplaatsen: gebruik {{ui:Knippen}} en plakken, of verplaats één punt tegelijk ([Een opmeetpunt bewerken](topic:edit-points)).
