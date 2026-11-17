---
title: Exportera platsen i 3D
summary: Spara det 3D-vyn visar som en GLB- eller OBJ-fil för andra 3D-program, i meter med Y uppåt, runt ett lokalt origo som filen registrerar.
keywords: glb, gltf, obj, 3d-export, exportera 3d, modellexport, spelmotor, visualisering, 3d-visare, meter, y uppåt, origo, lokalt origo, state plane
from: 07d23992
---

3D-vyn exporterar det den visar som en 3D-modell som ett annat program kan öppna: en 3D-visare, ett modelleringsprogram, en spelmotor eller ett visualiseringsverktyg.

## Exportera

1. Öppna 3D-vyn ({{key:D}}) och välj vad som visas med {{ui:Visa}}. Det som är dolt exporteras inte.
2. Klicka på {{ui:GLB}} eller {{ui:OBJ}} i verktygsfältet.
   Filen laddas ner som ”*projektnamn*-3d.glb” eller ”-3d.obj”, och statusfältet anger origo.

## Vad filerna innehåller

| | GLB | OBJ |
|---|---|---|
| Terrängmodeller | Nät med normaler och band- eller ytfärgerna | Nät med normaler (inga färger) |
| Ledningar och konstruktioner | Runda nät, de med problem i rött | Runda nät |
| Höjdkurvor, brytlinjer, linjeföringar, markeringar, korridor- och byggplattelinjer | Linjer, varje grupp i sin färg | Linjeposter (`l`) |
| Inmätningspunkter | Punkter | Punktposter (`p`) |

Varje grupp behåller sitt namn ("Befintlig mark", "Ledningar", "Tjocka höjdkurvor" och så vidare), så att du kan dölja eller formatera den i det andra programmet.

## Enheter, axlar och origo

- **Meter.** Ett projekt i fot omvandlas från US survey feet (1 ft = 1200/3937 m).
- **Y uppåt**, den vanliga konventionen för dessa format: östvärdet blir +X, höjden +Y och nordvärdet −Z.
- **Verklig skala.** Vyns vertikala överdrift tillämpas inte.
- **Ett lokalt origo.** State plane-koordinater är miljontals fot, för stora för de enkelprecisionstal som dessa format lagrar, så filen skrivs relativt ett närliggande origo: den befintliga markens eget origo för öst- och nordvärde, och dess lägsta höjd avrundad nedåt. Origot, i projektenheter, registreras i filen: i en GLB som `extras` på scenen och dess översta nod, i en OBJ som en kommentarsrad nära början (`# origin easting … northing … elevation …`). För att placera modellen tillbaka i projektkoordinater lägger du till origot (efter att ha omvandlat meter tillbaka till fot i ett projekt i fot).

## Finns inte ännu

- Export av den överdrivna vyn, eller export i projektenheter i stället för meter.
- Texturer, en materialfil för OBJ (.mtl) och egenskaper per objekt (namnen på ledningar och konstruktioner finns bara i CivilCraft).
- Export av korridoren som separata solider, eller längdprofilvyn i 3D.
