---
title: Beginwaardes en plekhouers
summary: Elke waarde waarmee CivilCraft begin, vir nuwe projekte, vertoning, belynings, plataforms, koridors, pypnetwerke, volumes en plotte, en watter daarvan plekhouers is wat vervang moet word.
keywords: standaardwaardes, instellings, beginwaardes, plekhouers, ontwerpkriteria, standaarde, reëls, aannames
from: fbfc7432
---

CivilCraft het geen instellingsdialoog of sjabloon nie. Dit is die waardes waarmee dinge begin. Waardes wat met **plekhouer** gemerk is, is nie uit 'n standaard geneem nie: vervang hulle met jou projek se kriteria voordat jy op 'n kontrole of 'n hoeveelheid staatmaak.

## Nuwe projek

| Instelling | Waarde |
|---|---|
| Naam | Ongetitelde terrein (die eerste puntlêer se naam vervang dit) |
| Eenhede | US feet |
| Oppervlaknaam | Bestaande grond |
| Puntgroepe | Elke groep begin as {{ui:Punte}} |
| Langste buitekant | 0 (hou elke driehoek) |
| Ontdoenstappe wat behou word | 200 |

## Vertoon

| Instelling | Waarde |
|---|---|
| Oppervlak | {{ui:Bestaande grond}} |
| Kontoere elke | 1 (ft of m) |
| Hoof elke | 5de kontoer |
| Bande | 8 |
| Aan | Kontoere, {{ui:Kontoerlynetikette}}, punte, breeklyne, oppervlakrand, pype |
| Af | Driehoeke, hoogtebande, helling-pyltjies, puntetikette |

## Belynings en profiele

| Instelling | Waarde |
|---|---|
| Naam | Belyning 1, Belyning 2 … |
| Beginstasie | 0+00 |
| Kromradius by elke binne-PI | 100 ft of 30 m, kleiner as dit nie in die helfte van elke raaklyn pas nie |
| Ontwerpprofiel | Geen totdat jy een begin nie; {{ui:Begin vanaf die grond}} plaas 'n PVI op die grond by elke einde |
| Lengte van vertikale kromme | 0 (geen kromme) totdat jy een tik |

## Plataforms

| Instelling | Waarde |
|---|---|
| Naam | Plataform 1, Plataform 2 … |
| Hoogte | Die grond by die plataform se middel, afgerond tot 0.1 (0 as die middel buite die oppervlak is) |
| Snithelling | 2 : 1 (plekhouer) |
| Opvulhelling | 3 : 1 (plekhouer) |

## Koridorsamestelling (plekhouers)

| Instelling | US feet | Meter |
|---|---|---|
| Baanbreedte | 12 ft | 3.6 m |
| Baanhelling | 2% | 2% |
| Skouerbreedte | 4 ft | 1.2 m |
| Skouerhelling | 4% | 4% |
| Snithelling | 2 : 1 | 2 : 1 |
| Opvulhelling | 3 : 1 | 3 : 1 |
| Snit elke | 10 ft | 5 m |

## Pypnetwerk

| Instelling | US feet | Meter |
|---|---|---|
| Naam en tipe | Storm, storm | Storm, storm |
| Kleinste helling (plekhouer) | 0.50% | 0.50% |
| Kleinste dekking (plekhouer) | 2 ft | 0.6 m |
| Val in strukture (plekhouer) | 0.10 ft | 0.03 m |
| Nuwe struktuur-deursnee | 48 in | 1200 mm |
| Nuwe pyp-deursnee | 12 in | 300 mm |
| Sumpdiepte | 0 | 0 |
| Rand | Vanaf die oppervlak | Vanaf die oppervlak |

'n Pypnetwerk wat uit LandXML oopgemaak word, gebruik ook hierdie reëls, omdat LandXML hulle nie dra nie.

## Volumes

| Instelling | Waarde |
|---|---|
| Metode | Rooster, gemonster by selsentrums binne die dagliglyne |
| Selgrootte | Gekies sodat die gegradeerde oppervlak se begrensende reghoek ongeveer 250,000 selle hou (1, 2 of 5 keer 'n mag van tien) |
| Swel en krimp | Geen |

## Plot

| Instelling | Waarde |
|---|---|
| Gebied | {{ui:Alles}} |
| Papier | Tabloid 11 × 17 in (voetprojekte), ISO A3 (meterprojekte); altyd landskap |
| Skaal | Die grootste gelyste skaal wat pas |
| Inkt | {{ui:Laagkleure}} |

DXF-etikette is gegrootte vir die skaal waarby alles op Tabloid (voet) of A3 (meter) pas.
