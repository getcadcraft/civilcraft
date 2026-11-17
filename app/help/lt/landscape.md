---
title: Kraštovaizdžio darbo sritis
summary: Sodinimo planai, vertikalusis planavimas, grindinys, sienos, laiptai, laistymas ir kraštovaizdžio lapai tame pačiame vietovės objekte, tuose pačiuose paviršiuose ir tame pačiame civilinių darbų faile.
keywords: kraštovaizdis, kraštovaizdžio architektūra, sodas, sodinimas, augalai, medžiai, vertikalusis planavimas, kietosios dangos, grindinys, laistymas, purkštukai, darbo sritis, vietovės projektavimas, kraštovaizdžio planas
from: eea929d1
---

Kraštovaizdžio darbo sritis prideda kraštovaizdžio projektavimo įrankius prie jau turimo CivilCraft objekto: tie patys geodezinės nuotraukos taškai, tas pats esamas gruntas, tas pats projektuojamas paviršius ir tas pats projekto failas.

## Atidarymas

Pasirinkite {{ui:Paviršius}} › {{ui:Daugiau}} › {{ui:Kraštovaizdžio darbo sritis}}. Įrankių juostoje tada rodomas pasirinkimas **Darbo sritis** ir grupė **Kraštovaizdis**, o grupės Paviršius, Projektavimas ir GIS pasitraukia. Norėdami grįžti, pasirinkite **Civilinė** skiltyje Darbo sritis. CivilCraft šiame kompiuteryje prisimena paskutinę jūsų naudotą darbo sritį.

Kairysis skydelis viršuje įgauna tris skiltis:

- **Augalai**: augalų sąrašas, kuriame ieškoti ir pasirinkti, ką dėti. Žr. [Augalų sąrašas](topic:plant-list).
- **Vertikaliojo planavimo patikros**: nuolydžio analizė, tėkmės rodyklės ir vandens telkimasis. Žr. [Vertikalusis planavimas](topic:landscape-grading).
- **Laistymas**: purkštukai ir vamzdžiai, kuriuos dedate toliau, ir vandens tiekimo nustatymai. Žr. [Laistymas](topic:irrigation).

## Kas yra Kraštovaizdžio grupėje

| Įrankis | Ką daro | Tema |
|---|---|---|
| **Augalas**, **Lysvė**, **Gyvatvorė** | Atskiri augalai, sodinimo lysvės, užpildytos augalams tinkamu tarpu, gyvatvorės palei liniją | [Sodinimas](topic:planting) |
| **Vertikalusis planavimas** | Platformos, pylimėliai, grioveliai, vertikaliojo planavimo plotai su taškiniais aukščiais ir horizontalėmis, nuolydžio ir tėkmės patikros | [Vertikalusis planavimas](topic:landscape-grading) |
| **Kietosios dangos** | Grindinys, takai, sienos, bordiūrai, pandusai ir laiptai, kurie seka gruntą | [Kietosios dangos](topic:hardscape) |
| **Plotai** | Sodinami plotai: vejos, lysvės, pievos ir žema augmenija su sluoksniais, apkirptos aplink kietąsias dangas | [Sodinami plotai](topic:planted-areas) |
| **Lygiai** | Žemės modifikatoriai eilės tvarka su iškasimu ir užpylimu, taškiniai lygiai, nuolydžio rodyklės, pjūvio linijos | [Žemės modifikatoriai](topic:ground-modifiers), [Pjūviai](topic:landscape-sections) |
| **Laistymas** | Purkštukai, vamzdžiai, vožtuvai, lašelinimo linijos, tiekimas, apimtis ir hidraulinė patikra | [Laistymas](topic:irrigation) |
| **Daugiau** | Iš linijos (objektai, išlaikantys ryšį su linijų brėžiniu), augalų žiniaraštis, augalų lentelė, žiniaraščiai, augalų grafika, laisvos formos objektai, kraštovaizdžio lapai ir leidybos rinkinys, IFC eksportas, augalo dydis ir žymos | [Objektai iš linijų](topic:objects-from-lines), [Augalų įrašai](topic:plant-records), [Žiniaraščiai](topic:worksheets), [Kraštovaizdžio lapai](topic:landscape-sheets), [Laisvos formos objektai](topic:freeform-objects) |

Viskas, ką pridedate, yra vienas anuliavimo žingsnis, išsaugomas projekto faile ir piešiama plane sluoksniuose, pavadintuose `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` ir `L-IRRG-…`, todėl DXF, DWG ir PDF eksportai perima ir jį.

## Vienas paviršius visam

Platformos, pylimėliai, grioveliai, vertikaliojo planavimo plotai, grindinys ir takai suformuojami į **projektuojamą paviršių** – tą patį, kurį naudoja koridoriai ir aikštelės. **Esamas gruntas** niekada nesikeičia. Augalai stovi ant to grunto, kuris yra po jais, todėl jie juda, kai keičiasi vertikalusis planavimas. Žemės darbų skaičiavimas įtraukia kraštovaizdžio vertikalųjį planavimą kartu su visu kitu.

:::tip
Naujas? [Sodo projektavimas nuo pradžios iki galo](topic:landscape-walkthrough) veda per visą darbo sritį pavyzdinėje vietovėje.
:::
