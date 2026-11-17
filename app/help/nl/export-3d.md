---
title: De bouwplaats in 3D exporteren
summary: Sla op wat de 3D-weergave toont als GLB- of OBJ-bestand voor andere 3D-programma's, in meter met Y omhoog, rond een lokale oorsprong die het bestand vastlegt.
keywords: glb, gltf, obj, 3d-export, 3D exporteren, modelexport, game-engine, visualisatie, 3D-viewer, meter, y omhoog, oorsprong, lokale oorsprong, state plane
from: 07d23992
---

De 3D-weergave exporteert wat die toont als 3D-model dat een ander programma kan openen: een 3D-viewer, een modelleerprogramma, een game-engine of een visualisatietool.

## Exporteren

1. Open de 3D-weergave ({{key:D}}) en kies wat wordt getoond met {{ui:Show}}. Wat verborgen is, wordt niet geëxporteerd.
2. Klik op {{ui:GLB}} of {{ui:OBJ}} op de balk.
   Het bestand wordt gedownload als "*projectnaam*-3d.glb" of "-3d.obj", en de statusbalk zegt de oorsprong.

## Wat de bestanden bevatten

| | GLB | OBJ |
|---|---|---|
| Oppervlakken | Meshes met normalen en de hoogtebanden- of terreinkleuren | Meshes met normalen (zonder kleuren) |
| Leidingen en kunstwerken | Ronde meshes, de problematische in rood | Ronde meshes |
| Hoogtelijnen, breeklijnen, tracés, streepjes, corridor- en plateaulijnen | Lijnen, elke set in zijn kleur | Lijnrecords (`l`) |
| Meetpunten | Punten | Puntrecords (`p`) |

Elke set behoudt zijn naam ("Bestaand maaiveld", "Leidingen", "Hoofdhoogtelijnen" enzovoort), zodat u hem in het andere programma kunt verbergen of opmaken.

## Eenheden, assen en de oorsprong

- **Meter.** Een feet-project wordt omgezet vanuit US survey feet (1 ft = 1200/3937 m).
- **Y omhoog**, de gebruikelijke conventie voor deze formaten: easting wordt +X, hoogte +Y en northing −Z.
- **Echte schaal.** De verticale overhoging van de weergave wordt niet toegepast.
- **Een lokale oorsprong.** State Plane-coördinaten zijn miljoenen feet, te groot voor de enkele-precisiegetallen die deze formaten opslaan, dus het bestand wordt geschreven ten opzichte van een nabije oorsprong: de eigen oorsprong van het bestaande maaiveld voor easting en northing, en zijn laagste hoogte naar beneden afgerond. De oorsprong, in projecteenheden, staat in het bestand vastgelegd: in een GLB als `extras` op de scène en zijn bovenste knoop, in een OBJ als een commentaarregel bovenaan (`# origin easting … northing … elevation …`). Om het model terug op projectcoördinaten te zetten, telt u de oorsprong erbij (na omrekenen van meter terug naar feet bij een feet-project).

## Nog niet beschikbaar

- De overhoogde weergave exporteren, of exporteren in projecteenheden in plaats van meter.
- Texturen, een materiaalbestand voor OBJ (.mtl) en eigenschappen per object (namen van leidingen en kunstwerken staan alleen in CivilCraft).
- De corridor als afzonderlijke volumes exporteren, of de profielweergave in 3D.
