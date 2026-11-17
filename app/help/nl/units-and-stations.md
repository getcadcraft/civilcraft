---
title: Eenheden, stationeringen en getalnotaties
summary: Feet- en meterprojecten, hoe stationeringen, hellingen, taluds, richtingen, oppervlakten, volumes en leidingdiameters worden geschreven en getypt, en wat het wijzigen van eenheden doet.
keywords: lengte typen, rekenen, rekenmachine, som, breuk, feet en inches, 4+7/16, eenheden, feet, US survey feet, meter, metrisch, imperiaal, stationsnotatie, stationering, helling, procent, talud, h:v, richting, kubieke yard, diameter
from: 0b9b5b6b
---

## Projecteenheden

Een project is in **US feet** of **meter** (**Eenheden** in het linkerpaneel). Elke coördinaat, hoogte, lengte en stationering in het project staat in die eenheid.

:::warning
Het wijzigen van **Eenheden** verandert de labels, de stationsnotatie, de standaardwaarden en hoe bestanden worden geschreven. Het zet **geen** getallen om. Een terrein dat in feet is opgemeten en naar meter wordt gezet, houdt dezelfde getallen, nu gelezen als meter. De statusbalk zegt "Eenheden zijn nu meter. Coördinaten zijn niet omgezet." Stel de eenheden in op uw gegevens voordat u gaat ontwerpen.
:::

Dit hangt af van de eenheden:

| | US feet | Meter |
|---|---|---|
| Stationsnotatie | `12+34.56` (stations van 100 ft) | `1+234.567` (stations van 1000 m) |
| Aangeboden hoogtelijnintervallen | 0.25 tot 20 ft | 0.1 tot 10 m |
| Oppervlakte | ft² | m² |
| Volume | yd³ | m³ |
| Diameter van leiding en kunstwerk | inches | millimeter |
| Standaard bochtstraal | 100 ft | 30 m |
| Stationeringsstreepjes op het plan | elke 50 ft, labels elke 100 ft | elke 20 m, labels elke 100 m |
| Plotschalen | 1" = 5' tot 1" = 1000' | 1:50 tot 1:10000 |
| LandXML-lengte-eenheid | USSurveyFoot | meter |

Een nieuw project begint in feet, of in meter wanneer de lengte-eenheid die in {{ui:Instellingen}} › {{ui:Algemeen}} › {{ui:Eenheden}} met een ster is gemarkeerd een metrieke eenheid is. De lijst **Eenheden** toont de eenheden die daar zijn ingeschakeld, en altijd die van het project zelf. Met een oppervlakte- of volume-eenheid met een ster (acres, hectaren, acre-feet …) worden oppervlakten en volumes daarin gerapporteerd in plaats van in de kolom hierboven. Zie [Eenheden, getypte waarden en de eenheidslijsten](common:unit-lists).

Wanneer u LandXML opent, neemt het project de eenheden van het bestand over. Een bestand in internationale feet opent als een feetproject; de getallen worden niet gewijzigd.

## Lengtes en sommen typen

Elk veld dat een lengte of hoogte aanneemt, leest meer dan een gewoon getal: druk op {{key:Enter}} en het veld toont het resultaat in de eenheden van het project.

| U typt | In een feetproject | In een meterproject |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | dezelfde lengtes in meter |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | in feet | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, en de andere in US survey feet | dezelfde lengtes in meter |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | de som, in feet | de som, in meter |

Elke lengte-aanduiding uit de gedeelde eenhedentabel werkt, met zijn exacte grootte: de feet van een project zijn US survey feet, dus `10 US ft` is 10 en `3 ch` (de ketting van internationale voet) is 197.9996. Gebruik `+ - * /` en haakjes, en `abs`, `round`, `ceil` en `floor`. Een streepje dat in een lengte is geschreven hoort erbij (`24'-6"`, `6-1/2`); met spaties eromheen trekt het af (`24' - 6"` = 23.5 ft). Een los getal vermenigvuldigt of deelt een lengte, en is een lengte in de eenheden van het project wanneer het bij een lengte wordt opgeteld. Als CivilCraft niet kan lezen wat u typte, wordt het veld gemarkeerd en zegt de statusbalk waar.

Stationeringen zijn geen sommen: `10+00` in een stationsveld is station 10+00. Hellingen in procent, puntnummers en beschrijvingen worden gelezen zoals ze zijn.

## Stationeringen

Een station is een afstand langs een tracé, geschreven met een plusteken:

- Feet: het deel vóór het plusteken is honderden feet. `12+34.56` is 1,234.56 ft.
- Meter: het deel vóór het plusteken is duizenden meter. `1+234.567` is 1,234.567 m.
- Negatieve stationeringen houden het teken voorop: `-0+50.00`.

Waar u een station typt (**Startstation**, het **Station** van een PVI), kunt u het typen met het plusteken (`12+34.56`) of als gewoon getal (`1234.56`). Spaties worden genegeerd.

## Hellingen en taluds

- **Hellingen** (profielen, leidingen, rijstrook- en bermhellingen) staan in procent: `+1.25%` stijgt in de stationsrichting, `-0.50%` daalt.
- **Taluds** (plateau-ontgraving en -ophoging, corridor-ontgraving en -ophoging) zijn horizontaal naar verticaal: `3` betekent 3 : 1, drie horizontaal voor één omhoog of omlaag.
- **K** voor een verticale bocht is de lengte gedeeld door de verandering van de helling in procent.

## Richtingen en hoeken

Richtingen zijn kwadrantrichtingen in graden, minuten en seconden: `N 63°12'05" E`. Boogdeflecties (Δ) gebruiken dezelfde graden, minuten en seconden, met "links" of "rechts".

## Offsets

Offsets vanaf een tracé zijn loodrechte afstanden, gemarkeerd met **L** (links) of **R** (rechts), kijkend in de richting van toenemende stationering.

## Getalweergave

- Coördinaten en hoogten tonen 2 decimalen in panelen en de statusbalk (3 voor een geselecteerd meetpunt).
- Oppervlakten en volumes worden per duizendtal gegroepeerd: `128,250 ft²`, `454.9 yd³`.
- Coördinaten worden nooit gegroepeerd, zodat ze zoals ze zijn gekopieerd kunnen worden.

## Coördinaten

CivilCraft werkt in een vlak: Easting naar rechts, Northing omhoog. Ontwerpwerk gebeurt altijd in geprojecteerde coördinaten (state plane, UTM of een lokaal raster). U kunt CivilCraft vertellen welk coördinatenstelsel ze hebben, en of het raster-, maaiveld- of lokale coördinaten zijn; het toont dan breedte- en lengtegraad en plaatst GIS-bestanden en kaartlagen, maar het verandert nooit zelf de eenheden of verplaatst uw coördinaten. Zie [Het coördinatenstelsel van het project instellen](topic:coordinate-systems) en [Maaiveld- en lokale coördinaten](topic:ground-and-local-coordinates). Grote state-plane-waarden (miljoenen feet) zijn prima; CivilCraft werkt intern ten opzichte van het terrein om de precisie te behouden.
