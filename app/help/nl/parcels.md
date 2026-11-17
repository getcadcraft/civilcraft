---
title: Percelen tekenen en juridische omschrijvingen schrijven
summary: Teken een perceel op zijn hoekpunten of voer de strekkingen uit een akte of kadastraal plan in, controleer hoe goed de strekkingen sluiten, label richtingshoeken en afstanden op het plan, maak elke strekking een boog en kopieer een concept van de juridische omschrijving.
keywords: percelen, kavels, perceelsgrenzen, grens, akte, kadastraal plan, maten en grenzen, richtingshoek, afstand, sluiting, sluitfout, precisie, juridische omschrijving, beginpunt, boog, straal, oppervlakte, acres
from: 6793d6ce
---

Percelen staan op het plan met de richtingshoek en afstand langs elke rechte strekking (een boog toont zijn straal, lengte en middelpuntshoek) en hun naam en oppervlakte in het midden. Ze gaan mee in de PDF-plot en de DWG- en DXF-exports, op de lagen `V-PROP` (lijnen) en `V-PROP-TEXT` (labels). Alles staat onder **Percelen** in het rechterpaneel wanneer niets is geselecteerd.

## Een perceel tekenen

1. Klik op **Perceel tekenen**.
2. Klik op de hoekpunten, beginnend bij het beginpunt. Een klik nabij een meetpunt neemt de exacte plaats van dat punt over.
3. Klik nogmaals op het eerste hoekpunt, of druk op {{key:Enter}}, om af te ronden. {{key:Backspace}} neemt het laatste hoekpunt terug; {{key:Esc}} laat de tot dan toe geplaatste hoekpunten vallen; druk er nogmaals op om het gereedschap te verlaten.

## Strekkingen uit een akte invoeren

1. Klik op **Aktestrekkingen invoeren**.
2. Zeg waar de strekkingen beginnen: het nummer van een meetpunt, of een Northing en Easting.
3. Typ of plak de strekkingen, één per regel:
   - een lijn: een richtingshoek en een afstand, zoals `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` en azimuts (`AZ 45°30'15"`) werken ook, en "thence", komma's en "feet" worden genegeerd.
   - een boog: `C R 300 L 52.36 right` (straal en boglengte), of `C R 300 D 10°00'00" left` (straal en middelpuntshoek). Een boog volgt op de strekking ervoor; als dat niet zo is, voeg dan de koordrichting toe: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` begint een commentaarregel.
4. Terwijl u typt, toont het dialoogvenster de lengte van de strekkingen, de **sluitfout** (hoe ver ze van het begin eindigen, en in welke richting), de **precisie** (de lengte gedeeld door de sluitfout, 1 : 10,000 enzovoort) en het oppervlak. Regels die niet kunnen worden gelezen, worden met hun regelnummers vermeld.
5. **Perceel toevoegen**. Wanneer de strekkingen niet sluiten, sluit het perceel met een rechte strekking over de opening: controleer de strekkingen tegen de akte. Om de fout van een polygoonmeting over zijn strekkingen te verdelen, past u die eerst aan.

## Bogen

In de **Eigenschappen** van een perceel heeft elke strekking een **Radius**. Typ er een om die strekking een boog te maken tussen dezelfde twee hoekpunten (een straal kleiner dan de helft van de afstand tussen de hoekpunten kan niet worden bereikt en wordt geweigerd). Kies **Rechts** of **Links** onder **Bogen**: een boog naar rechts heeft zijn middelpunt rechts van de rijrichting, zoals in een akte. Wis de radius om hem weer recht te maken. Elke wijziging is één stap: {{key:Mod+Z}} maakt haar ongedaan.

## De juridische omschrijving

De **Eigenschappen** van een perceel eindigen met zijn juridische omschrijving, uit de tekening geschreven:

- "Beginnend bij" het **Beginpunt** dat u typt (bijvoorbeeld "het noordoostelijke hoekpunt van Kavel 4"), anders de Northing en Easting van het eerste hoekpunt, of het meetpunt waarmee de strekkingen begonnen.
- "vervolgens" elke strekking: een richtingshoek en een afstand, of een boog met zijn straal, boglengte, middelpuntshoek, en koordrichting en -afstand.
- "Omvattende" zijn oppervlakte in vierkante voet en acres (vierkante meter en hectare in een meterproject).

**Kopiëren** zet hem op het klembord; **Downloaden als tekst** slaat hem op als `.txt`-bestand.

:::warning
De juridische omschrijving is een concept uit de tekening, geen meting. Een beëdigd landmeter moet die controleren tegen de registratie en ondertekenen voordat iemand erop vertrouwt.
:::

Klik binnen een perceel op het plan om het te selecteren; {{key:Delete}} verwijdert het. Percelen worden opgeslagen in het projectbestand.
