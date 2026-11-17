---
title: Startwaarden en tijdelijke invullingen
summary: Elke waarde waarmee CivilCraft start, voor nieuwe projecten, weergave, tracés, platen, corridors, leidingnetwerken, volumes en plots, en welke daarvan tijdelijke invullingen zijn die u moet vervangen.
keywords: standaardwaarden, instellingen, startwaarden, tijdelijke invullingen, ontwerpcriteria, normen, regels, aannames
from: fbfc7432
---

CivilCraft heeft geen instellingendialoogvenster en geen sjabloon. Dit zijn de waarden waarmee dingen beginnen. Waarden die als **tijdelijke invulling** zijn gemarkeerd, komen niet uit een norm: vervang ze door de criteria van uw project voordat u op een controle of hoeveelheid vertrouwt.

## Nieuw project

| Instelling | Waarde |
|---|---|
| Naam | Naamloze locatie (de naam van het eerste puntenbestand vervangt deze) |
| Eenheden | US feet |
| Oppervlaknaam | Bestaand terrein |
| Puntgroepen | Elke groep begint als {{ui:Punten}} |
| Langste buitenrand | 0 (elke driehoek behouden) |
| Bewaarde ongedaan-stappen | 200 |

## Weergave

| Instelling | Waarde |
|---|---|
| Oppervlak | {{ui:Bestaand terrein}} |
| Hoogtelijnen elke | 1 (ft of m) |
| Hoofd elke | 5e hoogtelijn |
| Banden | 8 |
| Aan | Hoogtelijnen, labels van hoogtelijnen, punten, breeklijnen, rand van het oppervlak, leidingen |
| Uit | Driehoeken, hoogtebanden, helling-pijlen, puntlabels |

## Tracés en langsprofielen

| Instelling | Waarde |
|---|---|
| Naam | Tracé 1, Tracé 2 … |
| Startstation | 0+00 |
| Boogstraal bij elke tussenliggende PI | 100 ft of 30 m, kleiner als dat niet past in de helft van elke raaklijn |
| Ontwerpprofiel | Geen tot u er een start; {{ui:Beginnen vanaf het maaiveld}} zet een PVI op het terrein aan elk uiteinde |
| Lengte verticale boog | 0 (geen boog) tot u er een typt |

## Platen

| Instelling | Waarde |
|---|---|
| Naam | Plaat 1, Plaat 2 … |
| Hoogte | Het terrein in het midden van de plaat, afgerond op 0.1 (0 als het midden buiten het oppervlak ligt) |
| Ontgravingshelling | 2 : 1 (tijdelijke invulling) |
| Ophogingshelling | 3 : 1 (tijdelijke invulling) |

## Corridorsamenstelling (tijdelijke invullingen)

| Instelling | US feet | Meter |
|---|---|---|
| Breedte rijstrook | 12 ft | 3.6 m |
| Rijstrookhelling | 2% | 2% |
| Breedte berm | 4 ft | 1.2 m |
| Bermhelling | 4% | 4% |
| Ontgravingshelling | 2 : 1 | 2 : 1 |
| Ophogingshelling | 3 : 1 | 3 : 1 |
| Doorsnede elke | 10 ft | 5 m |

## Leidingnetwerk

| Instelling | US feet | Meter |
|---|---|---|
| Naam en soort | Regenwater, regenwater | Regenwater, regenwater |
| Kleinste helling (tijdelijke invulling) | 0.50% | 0.50% |
| Kleinste dekking (tijdelijke invulling) | 2 ft | 0.6 m |
| Val in kunstwerken (tijdelijke invulling) | 0.10 ft | 0.03 m |
| Diameter nieuw kunstwerk | 48 in | 1200 mm |
| Diameter nieuwe leiding | 12 in | 300 mm |
| Diepte van de put (sump) | 0 | 0 |
| Bovenrand | Vanaf het oppervlak | Vanaf het oppervlak |

Een leidingnetwerk dat uit LandXML wordt geopend, gebruikt deze regels ook, omdat LandXML ze niet bevat.

## Volumes

| Instelling | Waarde |
|---|---|
| Methode | Raster, bemonsterd in de middelpunten van cellen binnen de overgangslijnen |
| Celgrootte | Gekozen zodat het begrenzende rechthoek van het ingewerkte oppervlak ongeveer 250,000 cellen bevat (1, 2 of 5 keer een macht van tien) |
| Zwelling en krimp | Geen |

## Plot

| Instelling | Waarde |
|---|---|
| Gebied | {{ui:Alles}} |
| Papier | Tabloid 11 × 17 in (projecten in voet), ISO A3 (projecten in meter); altijd liggend |
| Schaal | De grootste vermelde schaal die past |
| Inkt | {{ui:Kleuren per laag}} |

Labels van DXF worden geschaald op de schaal waarop alles op Tabloid (voet) of A3 (meter) past.
