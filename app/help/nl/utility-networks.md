---
title: Nutsleidingnetwerken en OpenStreetMap
summary: Trajecten van water, riool, hemelwater, gas, stroom en telecom met materiaal, afmeting, dekking en eigenaar; OpenStreetMap-gegevens uit een Overpass-JSON-bestand; kruisingen, sleufdoorsneden en volumes; voorzieningslagen in DWG, DXF en PDF; IFC-leiding- en kabelsegmenten.
keywords: nutsvoorziening, nutsvoorzieningen, netwerk, osm, openstreetmap, overpass, leiding, kabel, gas, riool, hemelwater, telecom, stroom, water, brandkraan, put, sleuf, kruising, vrije ruimte, dekking, diepte, dwg, ifc, georefereerd, lagen
from: 8a85dace
---

Teken de ondergrondse voorzieningen van een terrein als één netwerk per voorziening, controleer waar ze elkaar kruisen en exporteer ze als tekeningslagen en als IFC.

## Trajecten maken

Open **Terrein, Meer, Leidingnetwerken...**

- **Traject maken van de selectie** zet de geselecteerde as, elementlijn of leiding om in een traject van de voorziening die u kiest. Vul daarna in de tabel het materiaal, de afmeting (mm), de dekking (de diepte tot de bovenkant van de leiding of kabel) en de eigenaar in.
- **OpenStreetMap-gegevens inlezen** leest een Overpass-JSON-bestand in dat u hebt opgeslagen (een query met `out geom;`). Het project heeft eerst een coördinatenstelsel nodig, omdat OpenStreetMap-posities breedte- en lengtegraden zijn. Leidingen (per stof), ondergrondse stroom- en telecomkabels, brandkranen, putten en hemelwaterafvoeren worden ingelezen; al het andere wordt als weggelaten geteld en in het bericht vermeld. Bovengrondse leidingen worden weggelaten.
- **OpenStreetMap-kaart toevoegen** voegt de OpenStreetMap-kaart onder het plan toe. Die wordt alleen getekend als kaartlagen van internet zijn ingeschakeld in Instellingen.

## Controles en uitvoer

- **Kruisingen**: trajecten van verschillende voorzieningen die elkaar in plan kruisen, worden vermeld met de vrije hoogte ertussen, waar er een maaiveld is. Het minimum is een tijdelijke waarde die u instelt, niet het getal van een norm.
- **Sleuf**: elk traject krijgt een sleuf (leidingdiameter plus vrije ruimte aan beide zijden, taludhelling, zandbed) met een volume. Het totaal staat in het venster en in het CSV-bestand.
- **Tekening**: trajecten en punten staan op voorzieningslagen (bijvoorbeeld U-WATR-RUN, U-POWR-RUN), zodat ze in PDF, DXF en DWG terechtkomen.
- **IFC**: trajecten gaan de IFC-export in als leidingsegmenten en kabelsegmenten, met brandkranen, kleppen en kamers, één systeem per voorziening, in het coördinatenstelsel van het project.

## OpenStreetMap-gegevens

OpenStreetMap-gegevens zijn auteursrechtelijk beschermd door de OpenStreetMap-bijdragers en gelicentieerd onder de ODbL. De bronvermelding wordt toegevoegd aan de tekening, het CSV-bestand en de IFC. Als u een bestand deelt dat OpenStreetMap-gegevens bevat, behoud dan de bronvermelding en lees de share-alike-voorwaarden van de licentie.

## Wat nog niet beschikbaar is

Trajecten worden nog niet punt voor punt met een gereedschap op het plan getekend, en kruisingen worden nog niet in het langsprofiel getekend (de berekening is wel gebouwd). Diepten, afmetingen en vrije ruimtes beginnen als tijdelijke waarden: gebruik de getallen van uw eigen norm.
