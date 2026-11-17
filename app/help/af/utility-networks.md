---
title: Nutsnetwerke en OpenStreetMap
summary: Lope van water, riool, storm, gas, krag en telekommunikasie met materiaal, grootte, dekking en eienaar; OpenStreetMap-data uit 'n Overpass JSON-lêer; kruisings, sloot-snitte en volumes; dienslae in DWG, DXF en PDF; IFC-pyp- en kabelsegmente.
keywords: nut, nutsdienste, netwerk, osm, openstreetmap, overpass, pyp, kabel, gas, riool, storm, telekom, krag, water, brandkraan, inspeksiegat, sloot, kruising, speling, dekking, diepte, dwg, ifc, georefereer, lae
from: 8a85dace
---

Teken die begrawe dienste van 'n terrein as een netwerk per diens, kyk waar hulle kruis, en stuur hulle uit as tekeningslae en as IFC.

## Maak lope

Maak oop **Oppervlak, Meer, Nutsnetwerke...**

- **Maak 'n loop uit die keuse** verander die gekose belyning, kenlyn of pyp in 'n loop van die diens wat jy gekies het. Vul dan materiaal, grootte (mm), dekking (die diepte tot by die bopunt van die pyp of kabel) en eienaar in die tabel in.
- **Lees OpenStreetMap-data** lees 'n Overpass JSON-lêer wat jy gestoor het (’n navraag met `out geom;`). Die projek benodig eers 'n koördinaatstelsel, omdat OpenStreetMap-posisies breedte- en lengtegrade is. Pypleidings (volgens stof), ondergrondse krag- en telekommunikasiekabels, brandkrane, inspeksiegate en stormdreinering word gelees; alles anders word as uitgelaat getel en in die boodskap gesê. Bolyne word uitgelaat.
- **Voeg die OpenStreetMap-kaart by** voeg die OpenStreetMap-kaart onder die plan by. Dit word slegs geteken as kaartlae van die internet in Instellings aan is.

## Kontroles en uitvoere

- **Kruisings**: lope van verskillende dienste wat in plan kruis, word gelys met die vrye hoogte tussen hulle waar daar 'n grondoppervlak is; die minimum is 'n plekhouer wat jy stel, nie 'n standaard se getal nie.
- **Sloot**: elke loop kry 'n sloot (pypgrootte plus speling aan elke kant, sylhelling, bedding) met 'n volume. Die totaal verskyn in die venster en in die CSV.
- **Tekening**: lope en punte is op diensplae (byvoorbeeld U-WATR-RUN, U-POWR-RUN), so bereik hulle PDF, DXF en DWG.
- **IFC**: lope gaan in die IFC-uitvoer as pypsegmente en kabelsegmente, met brandkrane, kleppe en kamers, een stelsel per diens, in die projek se koördinaatstelsel.

## OpenStreetMap-data

OpenStreetMap-data is outeursreg van OpenStreetMap-bydraers en gelisensieer onder die ODbL. Die erkenning word by die tekening, die CSV en die IFC gevoeg. As jy 'n lêer deel wat OpenStreetMap-data bevat, hou die erkenning en lees die lisensie se deel-alike-voorwaardes.

## Wat nog nie gedoen is nie

Lope word nog nie punt-vir-punt op die plan met 'n gereedskap geteken nie, en kruisings word nog nie in die lengteprofielaansig geteken nie (die berekening is gebou). Dieptes, groottes en spelings begin as plekhouers: gebruik jou eie standaard se getalle.
