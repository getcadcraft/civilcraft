---
title: Voer die terrein in 3D uit
summary: Stoor wat die 3D-aansig wys as 'n GLB- of OBJ-lêer vir ander 3D-programme, in meter met Y op, rondom 'n plaaslike oorsprong wat die lêer aanteken.
keywords: glb, gltf, obj, 3D-uitvoer, uitvoer 3D, modeluitvoer, speelmotor, visualisering, 3D-kyker, meter, y op, oorsprong, plaaslike oorsprong, staatsvlak
from: 07d23992
---

Die 3D-aansig voer uit wat dit wys as 'n 3D-model wat 'n ander program kan oopmaak: 'n 3D-kyker, 'n modelleerder, 'n speelmotor of 'n visualiseringshulpmiddel.

## Uitvoer

1. Maak die 3D-aansig oop ({{key:D}}) en kies wat wys met {{ui:Wys}}. Wat weggesteek is, word nie uitgevoer nie.
2. Klik {{ui:GLB}} of {{ui:OBJ}} op die balk.
   Die lêer laai af as "*projeknaam*-3d.glb" of "-3d.obj", en die statusbalk sê die oorsprong.

## Wat die lêers bevat

| | GLB | OBJ |
|---|---|---|
| Oppervlaktes | Meshes met normale en die band- of oppervlakkleure | Meshes met normale (geen kleure nie) |
| Pype en strukture | Ronde meshes, probleemgevalle in rooi | Ronde meshes |
| Kontoere, breeklyne, belyninge, merke, koridor- en platformlyne | Lyne, elke stel in sy kleur | Lynrekords (`l`) |
| Opmetingspunte | Punte | Puntrekords (`p`) |

Elke stel hou sy naam ("Bestaande grond", "Pype", "Hoofkontoere" en so aan), sodat jy hom in die ander program kan wegsteek of stileer.

## Eenhede, asse en die oorsprong

- **Meter.** 'n Voet-projek word vanaf Amerikaanse opmetingsvoet omgeskakel (1 ft = 1200/3937 m).
- **Y op**, die gewone konvensie vir hierdie formate: oostelik word +X, hoogte +Y, en noordelik −Z.
- **Ware skaal.** Die vertikale oordrywing van die aansig word nie toegepas nie.
- **'n Plaaslike oorsprong.** Staatsvlak-koördinate is miljoene voete, te groot vir die enkel-presisie-getalle wat hierdie formate stoor, so die lêer word relatief tot 'n nabygeleë oorsprong geskryf: die bestaande grond se eie oorsprong vir oostelik en noordelik, en sy laagste hoogte afgerond na onder. Die oorsprong, in projekeenhede, word in die lêer aangeteken: in 'n GLB as `extras` op die toneel en sy boonste node, in 'n OBJ as 'n kommentaarreël naby die bokant (`# origin easting … northing … elevation …`). Om die model terug in projekkoördinate te plaas, tel die oorsprong by (nadat meter terug na voet omgeskakel is op 'n voet-projek).

## Nog nie gebou nie

- Uitvoer van die oordrewe aansig, of uitvoer in projekeenhede in plaas van meter.
- Teksture, 'n materiaallêer vir OBJ (.mtl) en voorwerp-eienskappe (name van pype en strukture is net in CivilCraft).
- Uitvoer van die korridor as afsonderlike soliede liggame, of die lengteprofiel-aansig in 3D.
