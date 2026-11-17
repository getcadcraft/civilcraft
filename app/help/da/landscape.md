---
title: Landskabsarbejdsområdet
summary: Beplantningsplaner, planering, befæstelse, mure, trin, vanding og landskabsark på samme område, med de samme overflader og den samme fil som anlægsarbejdet.
keywords: landskab, landskabsarkitektur, have, beplantning, planter, træer, planering, befæstelse, belægning, vanding, sprinklere, arbejdsområde, områdedesign, landskabsplan
from: eea929d1
---

Landskabsarbejdsområdet lægger landskabsdesignværktøjer oven på det CivilCraft-område, du allerede har: de samme opmålingspunkter, det samme eksisterende terræn, den samme projekterede overflade og den samme projektfil.

## Åbn det

Vælg {{ui:Overflade}} › {{ui:Mere}} › {{ui:Landskabsarbejdsområde}}. Værktøjslinjen viser så et valg **Arbejdsområde** og en gruppe **Landskab**, og grupperne Overflade, Design og GIS træder til side for at give plads. Vælg **Civil** under **Arbejdsområde** for at komme tilbage. CivilCraft husker det arbejdsområde, du sidst brugte på denne computer.

Venstre panel får tre sektioner øverst:

- **Planter**: plantekataloget, til at søge i og vælge det, du placerer. Se [Plantekatalog](topic:plant-list).
- **Planeringskontrol**: skråningsanalyse, flowpile og vandsamlinger. Se [Planering](topic:landscape-grading).
- **Vanding**: sprinklerne og rørene, du placerer næst, og vandforsyningens indstillinger. Se [Vanding](topic:irrigation).

## Hvad der er i gruppen Landskab

| Værktøj | Hvad det gør | Emne |
|---|---|---|
| **Plante**, **Bed**, **Hæk** | Enkeltplanter, plantebede udfyldt i planternes afstand, hække langs en linje | [Beplantning](topic:planting) |
| **Planér** | Platforme, jordvolde, grøfter, planeringsområder med koteangivelser og højdekurver, skrånings- og flowkontrol | [Planering](topic:landscape-grading) |
| **Befæstelse** | Belægning, stier, mure, kantsten, rampe og trin, der følger terrænet | [Befæstelse](topic:hardscape) |
| **Områder** | Beplantede områder: græsplæner, bede, enge og jorddække med en opbygning, beskåret omkring befæstelsen | [Beplantede områder](topic:planted-areas) |
| **Koter** | Terrænmodifikatorer i rækkefølge med afgravning og opfyldning, koteangivelser, fald-pile og snitlinjer | [Terrænmodifikatorer](topic:ground-modifiers), [Snit](topic:landscape-sections) |
| **Vanding** | Sprinklere, rør, ventiler, dryprør, forsyningen, dækning og en hydraulisk kontrol | [Vanding](topic:irrigation) |
| **Mere** | Fra en linje (objekter knyttet til stregtegningen), planteliste, plantedata, arbejdsark, plantegrafik, frie objekter, landskabsark og udgivelsessættet, IFC-eksport, plantestørrelse og mærkater | [Objekter fra stregtegning](topic:objects-from-lines), [Plantedata](topic:plant-records), [Arbejdsark](topic:worksheets), [Landskabsark](topic:landscape-sheets), [Frie objekter](topic:freeform-objects) |

Alt, du tilføjer, er ét fortrydelsestrin, gemmes i projektfilen og tegnes på planen på lag med navnene `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` og `L-IRRG-…`, så DXF-, DWG- og PDF-eksporterne også indeholder det.

## Én overflade til alt

Platforme, jordvolde, grøfter, planeringsområder, belægning og stier planeres ind i den **projekterede overflade**, den samme som korridorer og byggeplateauer bruger. Det **eksisterende terræn** ændres aldrig. Planter står på det terræn, de er på, så de flytter sig, når planeringen ændres. Jordarbejdet tæller landskabsplaneringen med alt det andet.

:::tip
Ny til det? [Anlæg en have, fra start til slut](topic:landscape-walkthrough) gennemgår hele arbejdsområdet på prøvegrunden.
:::
