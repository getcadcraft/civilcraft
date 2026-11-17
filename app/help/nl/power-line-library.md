---
title: Uw elektriciteitslijnbibliotheek
summary: Maak uw eigen geleiders, ondergrondse kabels, masten, apparatuur en sleuftypen, in categorieën die u benoemt, en deel ze als bestanden.
keywords: bibliotheek, geleider, kabel, paal, mast, dwarsarm, isolator, aansluitstuk, fitting, stag, spanstag, transformator, kast, verbinding, sleuf, categorie, csv, importeren, exporteren
from: 88733744
---

De **Bibliotheek**-sectie van de werkomgeving Elektriciteitslijnen bevat elk item dat een lijn of kabel kan gebruiken. Niets erin is gekoppeld aan een land of een fabrikant: u maakt de items waarmee u werkt.

## Drie soorten items

| Soort | Waar het staat | Kunt u het wijzigen? |
|---|---|---|
| **Voorbeelden** | Meegeleverd met CivilCraft, met generieke getallen die we uit materiaaleigenschappen hebben afgeleid | Nee: eerst {{ui:Naar mijn bibliotheek kopiëren}} |
| **In project** | Meegekomen met het projectbestand dat u opende | Nee: eerst {{ui:Naar mijn bibliotheek kopiëren}} |
| **Eigen items** | Uw eigen items, bewaard in deze browser | Ja, en wijzigingen worden meteen opgeslagen |

Elk project bewaart een kopie van elk item dat het gebruikt, zodat een project op elke computer opent met zijn eigen geleiders en palen.

:::warning
De voorbeelditems zijn voorbeelden: controleer elk getal tegen de gegevens van uw leverancier. De ondergrondse kabels hebben met opzet geen stroomwaarde, omdat die afhangt van hoe de kabel wordt gelegd.
:::

## Een item maken

1. Kies in **Bibliotheek** de **Soort** (bovenleidinggeleiders, ondergrondse kabels, masten, apparatuur of sleuftypen).
2. Klik op {{ui:Nieuw item}}, of kies een voorbeeld en klik op {{ui:Naar mijn bibliotheek kopiëren}} of {{ui:Dupliceren}}.
3. Vul de velden in. Velden met `*` zijn die welke de controles nodig hebben; een item met een ontbrekend veld wordt met `!` gemarkeerd en vermeld onder **Controles** wanneer een lijn het gebruikt.
4. Geef het een **Categorie**, met `/` tussen de niveaus: `Bovenleiding/LS/Gebundeld`, `Masten/Beton/12 m`. De boomstructuur volgt uw categorieën.

Wat elke soort nodig heeft:

| Soort | Nodig voor de controles |
|---|---|
| Bovenleidinggeleider | doorsnede, diameter, massa per meter, breuksterkte, elasticiteitsmodulus, thermische uitzetting |
| Ondergrondse kabel | aders, doorsnede, spanning, diameter, weerstand, stroomsterkte |
| Mast | totale lengte, nominale belasting (genomen op een punt onder de top), diepte in de grond |
| Apparatuur | het type; een nominale belasting voor dwarsarmen, aansluitstukken en stagen; fasenafstand en val voor dwarsarmen; lengte voor isolatoren; de hoek voor stagen |
| Sleuftype | diepte, breedte, dekking over de kabels |

## Delen

- {{ui:Mijn bibliotheek opslaan}} bewaart al uw items als één `.cclines.json`-bestand; {{ui:Een bibliotheek openen…}} leest er één terug (items met dezelfde sleutel worden vervangen).
- {{ui:Opslaan als CSV}} bewaart de soort die u bekijkt als spreadsheet; {{ui:Een bibliotheek openen…}} leest een CSV van die soort terug. Kolommen mogen in elke volgorde staan; een bestand met puntkomma's mag een decimale komma gebruiken.
