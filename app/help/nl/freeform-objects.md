---
title: Vrije objecten
summary: Breng een vorm die in een andere app is gemaakt (STL, OBJ of een bibliotheekitem) op de bouwplaats; hij staat op de grond of wordt erin gesneden, en zijn volume, oppervlak en voetafdruk worden geteld zoals de rest.
keywords: vrij, vrij object, beeldhouwwerk, plantenbak, zitbank, mesh, stl, obj, bibliotheekitem, terreinbewust, volg het maaiveld, snijd in het maaiveld, hoeveelheden, volume, ifc
from: ec835f33
---

Een eenmalig onderdeel (een plantenbak, een zitmuur, een beeldhouwwerk, een speelheuvel) kan in ModelCraft of PartCraft gemaakt en hier geplaatst worden, zodat het in hetzelfde model en in dezelfde staten voorkomt als alles andere.

1. Landschap › Meer › {{ui:Vrij object…}} en kies een **STL**- of **OBJ**-bestand (in de eenheden van het project: feet in een feet-project, meter in een meter-project) of een CadCraft-**bibliotheekitem** (`.json`) met een mesh-lichaam.
2. Klik waar het moet komen.

## Zijn basis

- **Volgt het maaiveld**: zijn laagste punt zit op het laagste maaiveld onder zijn voetafdruk, zodat niets zweeft. Eigenschappen schatten hoeveel ervan onder het maaiveld zit.
- **Snijdt het maaiveld**: zijn basis wordt op een hoogte gezet en het maaiveld binnen zijn voetafdruk wordt met ontgravingstaluds naar die hoogte gegradeerd, en geteld in Grondverzet zoals een platform.

Draai het met **Draaien**, en sleep het op het plan om het te verplaatsen.

## Geteld

Eigenschappen geven zijn **volume** (voor een gesloten volume), **oppervlakte**, **voetafdruk** en **hoogte**, gemeten aan de mesh. De IFC-export schrijft het weg met de **IFC-klasse** die u kiest en die hoeveelheden.

:::note
De voetafdruk is de convexe romp van de omtrek: een concave vorm (een L-vormige plantenbak) wordt gegradeerd alsof hij is opgevuld.
:::
