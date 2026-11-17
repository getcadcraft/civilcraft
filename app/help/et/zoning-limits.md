---
title: Kontrolli mahte sisestatud tsoneerimispiirangute vastu
summary: Sisesta krundi tagasiastmed joonte kaupa, kõrgusepiirang, taevavalguse tasapind, hoonestusintensiivsus ja katvus, vaata plaanil ehitatavat ala ning loe, millised mahud millist piirangut rikuvad.
keywords: tsoneerimine, tagasiaste, tagasiastmed, esi, külg, tagumine, ümbrik, ehitatav ala, kõrgusepiirang, taevavalguse tasapind, hoonestusintensiivsus, FAR, katvus, krunt, parcel, kohalik määrus, normikontroll
from: 3e267b31
---

**CivilCraft-is pole tsoneerimisnorme.** See ei tunne ühegi linna reegleid ega sisalda nende kogumikku. Iga number sellel lehel on see, mille sina sisestad oma kohalikust määrusest, ja iga tulemus ütleb, et seda võrreldakse sinu sisestatud piirangutega. See on viis näha, kuidas krundi piirangud kujundavad hoone, mitte otsus selle kohta, kas projekt on lubatud.

## Sisesta piirangud

Omadustes jaotises **Ehitusmahud** vali **Krunt** (või vali maht: selle krundi piirangud kuvatakse selle all). Seejärel täida, mis kehtib; jäta kast tühjaks, kui piirangut pole:

- **Tänavajoon**: krundi joon tänaval. **Esitagasiaste** kehtib sellele, **Tagumine tagasiaste** sellele joonele, mis on kõige vastasküljel, ja **Külgtagasiaste** ülejäänutele.
- **Kõrgusepiirang**.
- **Taevavalguse tasapind**: see algab kõrgusest krundi joonel ja tõuseb sisestatud koguse võrra iga 1 ühiku kohta sissepoole, mõõdetuna tänavajoonest või igast krundijoonest (2 tähendab 2:1). Punkti kohal lubatud kõrgus on tasapinna ja kõrgusepiirangu madalaim.
- **Hoonestusintensiivsus** (krundil olevate mahtude brutopõrandapind jagatud krundi pindalaga) ja **Katvus** (nende jalajäljed jagatud krundi pindalaga, sisestatud protsentides).

## Ümbrik

Märgi **Näita ümbrikku plaanil**, et joonistada see kihile `A-MASS-ENVL`. Ümbrik on krunt, mille igast krundijoonest on sisse võetud selle joone enda tagasiaste; nihkejooned kohtuvad nurkades lõikejoontega. Kõverast koosnev krundijoon võetakse lühikeste kõõludena, mis jäävad kõverast 0.01 piiresse. Nii kumerad kui nõgusad krundid sobivad. Kui tagasiastmed kattuvad (sügav tagasiaste kitsal või väga nõgusal krundil), ümbrikku pole ja Omadused ütleb seda; proovi väiksemaid vahemaid.

## Tulemus

Kastide all saab iga mahu ja iga piirangu kohta rea, millel on linnuke või rist:

- **tagasiastmed**: mahu osa, mis jääb ümbrikust välja;
- **kõrgus**: mahu kõrgus võrreldes kõige suurema lubatud kõrgusega tema jalajäljel (ühe kõrgusega prisma piirab madalaim lubatud kõrgus mis tahes tema nurga juures);
- **hoonestusintensiivsus** ja **katvus**: kõik krundil olevad mahud kokku.
