---
title: Eksportér projektet i 3D
summary: Gem det, 3D-visningen viser, som en GLB- eller OBJ-fil til andre 3D-programmer, i meter med Y op, omkring et lokalt udgangspunkt, som filen registrerer.
keywords: glb, gltf, obj, 3D-eksport, eksportér 3D, modeleksport, spilmotor, visualisering, 3D-viser, meter, y op, udgangspunkt, lokalt udgangspunkt, state plane
from: 07d23992
---

3D-visningen eksporterer det, den viser, som en 3D-model, et andet program kan åbne: en 3D-viser, et modelleringsprogram, en spilmotor eller et visualiseringsværktøj.

## Eksport

1. Åbn 3D-visningen ({{key:D}}) og vælg, hvad der vises med {{ui:Vis}}. Det, der er skjult, eksporteres ikke.
2. Klik på {{ui:GLB}} eller {{ui:OBJ}} i værktøjslinjen.
   Filen downloades som "*projektnavn*-3d.glb" eller "-3d.obj", og statuslinjen oplyser udgangspunktet.

## Hvad filerne indeholder

| | GLB | OBJ |
|---|---|---|
| Overflader | Net med normaler og bånd- eller overfladefarverne | Net med normaler (ingen farver) |
| Rør og konstruktioner | Runde net, problematiske i rødt | Runde net |
| Højdekurver, brudlinjer, tracéer, streger, korridor- og plateaulinjer | Linjer, hvert sæt i sin farve | Linjeposter (`l`) |
| Opmålingspunkter | Punkter | Punktposter (`p`) |

Hvert sæt beholder sit navn ("Eksisterende terræn", "Rør", "Større højdekurver" og så videre), så du kan skjule eller style det i det andet program.

## Enheder, akser og udgangspunkt

- **Meter.** Et fodprojekt omregnes fra US survey-fod (1 ft = 1200/3937 m).
- **Y op**, den sædvanlige konvention for disse formater: øst bliver +X, kote +Y og nord −Z.
- **Sand målestok.** Visningens lodrette overdrivelse anvendes ikke.
- **Et lokalt udgangspunkt.** State plane-koordinater er millioner af fod, for store til de enkeltpræcisionstal, disse formater gemmer, så filen skrives relativt til et nærliggende udgangspunkt: det eksisterende terrængs eget udgangspunkt for øst og nord, og dets laveste kote afrundet nedad. Udgangspunktet, i projektenheder, registreres i filen: i en GLB som `extras` på scenen og dens øverste knude, i en OBJ som en kommentarlinje nær toppen (`# origin easting … northing … elevation …`). For at placere modellen tilbage i projektkoordinater skal du lægge udgangspunktet til (efter at have omregnet meter tilbage til fod i et fodprojekt).

## Ikke lavet endnu

- Eksport af den overdrevne visning, eller eksport i projektenheder i stedet for meter.
- Teksturer, en materialefil til OBJ (.mtl) og egenskaber pr. objekt (navne på rør og konstruktioner findes kun i CivilCraft).
- Eksport af korridoren som separate legemer, eller længdeprofilvisningen i 3D.
