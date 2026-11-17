---
title: Een polygoon invoeren en vereffenen met de kompasregel
summary: Typ veldhoeken of richtingshoeken en afstanden, controleer de hoek- en lineaire sluitfout en de precisie, vereffen met de kompasregel en voeg de punten toe als punten of de lus als perceel.
keywords: polygoon, gesloten polygoon, lus, rechtse hoeken, achteruitkijkpunt, richtingshoeken, afstanden, sluitfout, afwijking, precisie, kompasregel, bowditch, vereffening, meting
from: 56ce5a8c
---

Een polygoon is een reeks gemeten trajecten: op elk punt een hoek (of een richtingshoek) en een afstand naar het volgende. Klik op **Een polygoon invoeren** onder **Polygoon** in het rechterpaneel wanneer niets is geselecteerd.

## Waar het begint en eindigt

1. **Start bij punt**: het nummer ervan. Of typ een Northing en een Easting.
2. **Trajecten als**: **Rechtse hoeken en afstanden**, of **Richtingshoeken en afstanden**.
3. Bij hoeken geeft u aan waar ze beginnen: een **Achteruitkijkpunt**, of **de azimut ervan** (van het eerste punt naar het achteruitkijkpunt, rechtsom vanaf het noorden).
4. **Eindigt**: **terug bij het startpunt (een lus)**, of **bij punt** en het nummer ervan (een open polygoon tussen bekende punten).

## De trajecten typen

Eén traject per regel: eerst de hoek, dan de afstand, en eventueel een naam voor het punt dat het bereikt:

- Rechte hoeken, rechtsom gemeten op het punt waar het traject vandaan komt, van het vorige punt naar het volgende: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` en `270.0028` werken ook.
- Richtingshoeken: `N 45°30'15" E 125.50 B`, of een azimut als één woord: `AZ 45-30-15 125.50 B`.
- Bij een lus met hoeken eindigt u met `close` en de hoek bij het startpunt nogmaals, gemeten van het laatste punt naar het tweede: `close 270°00'05"`. Dat is wat de hoeken controleert.

Regels die niet gelezen kunnen worden, worden met hun regelnummer weergegeven. "feet", komma's en `#`-commentaarregels zijn toegestaan.

## De sluitfout lezen

Terwijl u typt, toont het dialoogvenster:

- **Hoekafwijking**: hoeveel de hoeken afwijken van sluiting, en het aandeel dat elke hoek krijgt. Zonder sluithoek worden de hoeken niet gecontroleerd; een fout daarin komt terug in de lineaire afwijking.
- **Lineaire afwijking**: hoe ver het eindpunt van de polygoon afwijkt van waar het zou moeten liggen, en in welke richting.
- **Precisie**: de lengte van de polygoon gedeeld door de lineaire afwijking: 1 : 10,000 betekent 1 ft op 10,000 ft.
- De punten na de vereffening, en hoe ver elk punt is verschoven.

## De vereffening

Eerst wordt de hoekafwijking gelijkmatig over de hoeken verdeeld. Daarna wordt de lineaire afwijking over de trajecten verdeeld met de kompasregel (Bowditch): elk punt verschuift tegen de afwijking in, evenredig met de afgelegde lengte tot dat punt, zodat de polygoon precies op de juiste plek eindigt.

:::note
De kompasregel is een standaardvereffening, geen kleinste-kwadratenvereffening, en hij weegt hoeken en afstanden niet tegen elkaar af. Of de precisie goed genoeg is, bepalen uw eigen normen en die van uw jurisdictie.
:::

## Het resultaat gebruiken

- **Toevoegen als punten**: de vereffende punten worden punten met de namen die u gaf (anders de eerstvolgende vrije nummers), beschrijving `TRAV`, zonder hoogte. Het laatste punt van een lus is het startpunt, dus het wordt niet tweemaal toegevoegd. Eén stap: {{key:Mod+Z}} maakt het ongedaan.
- **Toevoegen als perceel** (lussen): de vereffende punten worden een [perceel](topic:parcels), met de labels en de juridische beschrijving.
- **Rapport (CSV)**: de sluitregels, daarna per punt de richting, afstand, de niet-vereffende en vereffende coördinaten en de correcties.
