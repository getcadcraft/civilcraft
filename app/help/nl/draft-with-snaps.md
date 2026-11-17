---
title: Tekenen met snaps, gekozen hoeken en verplaatsen, kopiëren, roteren
summary: Plaats tracés, platen, percelen en elementlijnen precies op punten en hoeken die er al zijn, typ of kies de Easting en Northing van een hoek, draai een raaklijn naar twee punten, en verplaats, kopieer of roteer een object met een afstand of hoek.
keywords: snap, snaps, osnap, snap naar punt, snap naar hoek, PI, hoekpunt, hoek, kiezen, kruisdraad, easting, northing, coördinaten, getypte coördinaten, raaklijn, richting, richtingshoek, verplaatsen, kopiëren, roteren, transformeren, geroteerd kopiëren, dupliceren, alt, vrij punt, tekenen
from: 49864dda
---

Nieuw in 0.9: wanneer u tekent, komt de cursor op de punten en hoeken die al in het plan staan, en een hoek van een plaat, perceel of elementlijn kan worden getypt of gekozen. Dit onderwerp loopt de drie gereedschappen door.

## Wat u gaat doen

- Teken met snaps, zodat een nieuw tracé, plaat, perceel of lijn precies op iets dat er al is begint en eindigt.
- Stel de Easting en Northing van een hoek in door ze te typen of door een plaats in het plan te kiezen.
- Draai de raaklijn van een tracé naar twee gekozen punten.
- Verplaats, kopieer of roteer een heel object.

## Stappen

1. Kies een tekengereedschap, bijvoorbeeld {{ui:Tracé}}, {{ui:Plaat}}, {{ui:Perceel}} of {{ui:Elementlijn}}. Beweeg de aanwijzer naar een opmeetpunt, een PI van een tracé, een hoek van een plaat, perceel of massa, een hoekpunt van een elementlijn of een kunstwerk van het riool. Er verschijnt een markering met een label (PI, Hoek, Hoekpunt, Kunstwerk, of Punt met zijn nummer) en de Easting en Northing waar hij op terechtkomt. Klik om het punt daar te plaatsen.
2. Om een punt vrij te plaatsen, houdt u {{key:Alt}} ingedrukt terwijl u klikt. De snap wordt uitgeschakeld.
3. Selecteer een plaat, perceel of elementlijn. In de eigenschappen toont het blok {{ui:Hoeken}} elke hoek met een vak Easting en een vak Northing. Typ nieuwe getallen, of druk op de kruisdraadknop naast een hoek en klik op een plaats in het plan. De hoek krijgt die Easting en Northing. Druk op {{key:Esc}} om een keuze te annuleren. De kruisdraad werkt alleen in het plan: sluit eerst het 3D-beeld.
4. Om een raaklijn te draaien, selecteer een tracé. In de eigenschappen, onder {{ui:Raaklijn vanuit twee punten}}, kies de raaklijn, druk op {{ui:Eerste punt}} en klik in het plan, druk op {{ui:Tweede punt}} en klik opnieuw, en druk dan op {{ui:Richting instellen}}. De raaklijn draait zodat hij van het eerste punt naar het tweede loopt en behoudt zijn lengte.
5. Om te verplaatsen, kopiëren of roteren: selecteer een tracé, plaat, perceel of elementlijn. Typ in de eigenschappen, onder {{ui:Verplaatsen, kopiëren en roteren}}, {{ui:Verplaats oostwaarts}} en {{ui:Verplaats noordwaarts}} (negatieve getallen gaan naar het westen en het zuiden), en druk op {{ui:Verplaatsen}} of {{ui:Kopiëren}}. Of druk op {{ui:Afstand uit twee punten}} en klik op het punt om vanaf te verplaatsen en het punt om naartoe te verplaatsen.
6. Om te roteren, typ de hoek in {{ui:Roteer linksom}} (in graden), en druk dan op {{ui:Roteren}} of {{ui:Geroteerd kopiëren}}. Het draait om het midden van zijn hoeken, tenzij u met de kruisdraad naast de hoek een punt kiest om om te draaien.

## Opmerkingen

- Een kopie laat het origineel staan waar het is, en wordt daarna geselecteerd.
- Elk verplaatsen, kopiëren, roteren, gekozen hoek en gedraaide raaklijn is één ongedaan-stap.
- Snaps reiken tot 10 schermpixels van de cursor. Een snapmarkering biedt alleen een plaats aan; er verandert niets tot u klikt.
- Dezelfde kruisdraad staat bij de PI-rijen van een tracé. Zie [Tracés](topic:alignment), [Percelen](topic:parcels) en [Elementlijnen](topic:feature-lines).
