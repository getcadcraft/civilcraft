---
title: Eksporter området i 3D
summary: Lagre det 3D-visningen viser som en GLB- eller OBJ-fil for andre 3D-programmer, i meter med Y opp, rundt et lokalt origo som filen registrerer.
keywords: glb, gltf, obj, 3d-eksport, eksporter 3d, modelleksport, spillmotor, visualisering, 3d-visning, meter, y opp, origo, lokalt origo, state plane
from: 07d23992
---

3D-visningen eksporterer det den viser som en 3D-modell som et annet program kan åpne: en 3D-viser, et modelleringsprogram, en spillmotor eller et visualiseringsverktøy.

## Eksport

1. Åpne 3D-visningen ({{key:D}}) og velg hva som vises med {{ui:Vis}}. Det som er skjult, eksporteres ikke.
2. Klikk {{ui:GLB}} eller {{ui:OBJ}} på verktøylinjen.
   Filen lastes ned som "*prosjektnavn*-3d.glb" eller "-3d.obj", og statuslinjen sier origoet.

## Hva filene inneholder

| | GLB | OBJ |
|---|---|---|
| Terrengmodeller | Nett med normaler og høydebåndenes eller terrengmodellens farger | Nett med normaler (uten farger) |
| Rør og konstruksjoner | Runde nett, de med problemer i rødt | Runde nett |
| Høydekurver, bruddlinjer, veglinjer, profilnummermerker, korridor- og byggeplatelinjer | Linjer, hver gruppe i sin farge | Linjeposter (`l`) |
| Oppmålingspunkter | Punkter | Punktposter (`p`) |

Hver gruppe beholder sitt navn ("Eksisterende terreng", "Rør", "Tykke høydekurver" og så videre), slik at den kan skjules eller formateres i det andre programmet.

## Enheter, akser og origo

- **Meter.** Et prosjekt i fot konverteres fra US survey-fot (1 ft = 1200/3937 m).
- **Y opp**, den vanlige konvensjonen for disse formatene: øst blir +X, høyde +Y, og nord −Z.
- **Virkelig skala.** Den vertikale overdrivelsen i visningen brukes ikke.
- **Et lokalt origo.** State plane-koordinater er millioner av fot, for store for de enkeltpresisjonstallene disse formatene lagrer, så filen skrives relativt til et nærliggende origo: det eksisterende terrengets eget origo for øst og nord, og dets laveste høyde avrundet nedover. Origoet, i prosjektenheter, registreres i filen: i en GLB som `extras` på scenen og dens øverste node, i en OBJ som en kommentarlinje nær toppen (`# origin easting … northing … elevation …`). For å plassere modellen tilbake i prosjektkoordinater legges origoet til (etter at meter er omregnet tilbake til fot i et prosjekt i fot).

## Ikke bygget ennå

- Eksport av den overdrevne visningen, eller eksport i prosjektenheter i stedet for meter.
- Teksturer, en materialfil for OBJ (.mtl) og egenskaper per objekt (navn på rør og konstruksjoner finnes bare i CivilCraft).
- Eksport av korridoren som separate volumlegemer, eller profilvisningen i 3D.
