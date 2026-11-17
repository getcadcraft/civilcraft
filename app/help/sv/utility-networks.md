---
title: Ledningsnät och OpenStreetMap
summary: Sträckor för vatten, spillvatten, dagvatten, gas, el och tele med material, dimension, täckning och ägare; OpenStreetMap-data från en Overpass JSON-fil; korsningar, schaktsektioner och volymer; tjänstelager i DWG, DXF och PDF; IFC-rörsegment och kabelsegment.
keywords: ledning, ledningar, nät, nätverk, osm, openstreetmap, overpass, rör, kabel, gas, avlopp, dagvatten, tele, kraft, vatten, brandpost, brunn, schakt, korsning, marginal, täckning, djup, dwg, ifc, georefererad, lager
from: 8a85dace
---

Rita de underjordiska ledningarna på en plats som ett nät per tjänst, kontrollera var de korsar varandra och skicka ut dem som ritningslager och som IFC.

## Skapa sträckor

Öppna **Terrängmodell, Mer, Ledningsnät...**

- **Skapa en sträcka av markeringen** gör den markerade linjeföringen, funktionslinjen eller röret till en sträcka för den tjänst du valde. Fyll sedan i material, dimension (mm), täckning (djupet till rörets eller kabelns överkant) och ägare i tabellen.
- **Läs OpenStreetMap-data** läser en Overpass JSON-fil som du har sparat (en fråga med `out geom;`). Projektet behöver ett koordinatsystem först, eftersom OpenStreetMap-positioner är latitud och longitud. Rörledningar (efter ämne), underjordiska el- och telekablar, brandposter, brunnar och dagvattenbrunnar läses in. Allt annat räknas som utelämnat, och det anges i meddelandet. Luftledningar utelämnas.
- **Lägg till OpenStreetMap-kartan** lägger till OpenStreetMap-kartan under planen. Den ritas bara när kartlager från internet är på i Inställningar.

## Kontroller och utdata

- **Korsningar**: sträckor för olika tjänster som korsar varandra i plan listas med den fria höjden mellan dem där det finns en markyta. Minimum är en platshållare som du anger, inte en standards värde.
- **Schakt**: varje sträcka får ett schakt (rördimension plus marginal på varje sida, sidolutning och bäddning) med en volym. Summan visas i fönstret och i CSV-filen.
- **Ritning**: sträckor och punkter ligger på tjänstlager (till exempel U-WATR-RUN, U-POWR-RUN), så de når PDF, DXF och DWG.
- **IFC**: sträckor går in i IFC-exporten som rörsegment och kabelsegment, med brandposter, ventiler och kammare, ett system per tjänst, i projektets koordinatsystem.

## OpenStreetMap-data

OpenStreetMap-data omfattas av upphovsrätt för OpenStreetMap-bidragsgivarna och är licensierad under ODbL. Källangivelsen läggs till i ritningen, CSV-filen och IFC-filen. Om du delar en fil som innehåller OpenStreetMap-data ska du behålla källangivelsen och läsa licensens villkor om att dela lika.

## Vad som inte är gjort

Sträckor ritas ännu inte punkt för punkt i planen med ett verktyg, och korsningar ritas ännu inte i profilvyn (beräkningen är klar). Djup, dimensioner och fria höjder börjar som platshållare: använd din egen standards värden.
