---
title: De plantenlijst
summary: Ongeveer 420 gangbare planten van gematigde en mediterrane streken met hun maten, winterhardheid, licht en water, doorzoekbaar in elke taal, plus uw eigen lijst die met het project wordt opgeslagen.
keywords: plantenlijst, plantendatabase, soort, botanische naam, Nederlandse naam, plantenpalet, kwekerslijst, winterhardheidszone, csv, planten importeren, planten exporteren, mijn planten, boomlijst, struiklijst, plantenbibliotheek
from: 7ed09e7e
---

De sectie **Planten** van het linkerpaneel toont elke plant die u kunt plaatsen. Klik op een plant om zijn maten te zien en om hem de plant te maken die **Plant**, **Vak** en **Haag** gebruiken.

## Zoeken en filteren

Typ in **Zoeken**: elk woord uit de naam van een plant in elke taal (Engels, Spaans, Portugees), de botanische naam, het type of een woord in de opmerkingen. Elk woord dat u typt, moet overeenkomen, dus `quercus evergreen` vindt de wintergroene eiken. Accenten maken niet uit.

Beperk de lijst met **Type**, **Licht**, **Water** en **Winterhardheidszone** (de USDA-zone waarin uw terrein ligt: een plant wordt getoond wanneer de zone binnen zijn bereik valt).

## Wat een plant bevat

| Veld | Betekenis |
|---|---|
| Type | Boom, struik, haag, gras (gazons inbegrepen), vaste plant, bodembedekker of klimplant |
| Op volwassen leeftijd | Hoogte en breedte van de plant gegroeid in een tuin of een straat, in meters |
| Bij het planten | De maat waarin hij wordt geplant, en zijn container |
| Plantafstand | Hart op hart in een vak of langs een haag |
| Winterhardheidszone | De USDA-zones waarin hij meestal winterhard is |
| Licht, water, grond | Wat hij nodig heeft |
| Opmerkingen | Gebruik en waarschuwingen, zoals giftige delen of een plant die zich uitbreidt |

:::note
De ingebouwde lijst is voor CadCraft opgesteld op basis van algemene tuinbouwkennis: gebruikelijke maten, afgerond. Het is niet de catalogus van een kwekerij. Controleer maten en winterhardheid bij een lokale kwekerij. De bekendste invasieve planten van het Iberisch schiereiland en een groot deel van de gematigde wereld zijn bewust weggelaten, en enkele die elders invasief zijn, hebben een opmerking.
:::

## Uw eigen planten

- **Toevoegen aan de lijst van dit project** kopieert een plant naar de eigen lijst van het project, waar hij met het project wordt opgeslagen. Een plant in uw lijst vervangt de ingebouwde plant met dezelfde sleutel, zodat u de maten voor uw regio kunt aanpassen.
- **Een plantenlijst importeren…** leest een CSV (of een plantenbestand). De CSV heeft een kolom met de botanische naam nodig en, bij voorkeur, type, hoogte en breedte; kolomnamen in uw eigen woorden werken (Latijn, Nederlandse naam, Hoogte, Spreiding, Breedte, Zone). Komma's, puntkomma's of tabs, en decimale komma's worden gelezen. Lege plantmaten, afstanden en containers krijgen verstandige standaardwaarden voor het type.
- **Exporteren als CSV** slaat uw lijst op (of, zonder eigen lijst, de planten die de zoekopdracht toont) om in een spreadsheet te openen.

Een plantenlijst wordt net als elk bestand van buiten gelezen: wat niet te gebruiken is, wordt weggelaten en geteld.

## Planten in andere apps

De plantenlijst is één bibliotheek voor elke CadCraft-app: BimCraft en ModelCraft hebben dezelfde lijst, maar hun eigen Plaatsen uit bibliotheek biedt nog geen planten. Momenteel komen planten in een BIM-model terecht via de landschaps-IFC van CivilCraft (elke plant is een `IfcGeographicElement`). Zie [Beplanting](topic:planting#ifc).
