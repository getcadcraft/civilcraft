---
title: Biblioteka juaj e linjave elektrike
summary: Bëj përçuesit, kabllot nëntokësorë, mbajtëset, pajisjet dhe llojet e hendekut, në kategori që ti i emërton, dhe ndaji si skedarë.
keywords: bibliotekë, përçues, kabllo, shtyllë, mbajtëse, traversë, izolator, pajisje lidhëse, tirant, guy, transformator, kabinet, bashkim, hendek, kategori, csv, importo, eksporto
from: 88733744
---

Seksioni **Biblioteka** i hapësirës së Linjave elektrike mban çdo artikull që mund ta përdorë një linjë ose kabllo. Asgjë në të nuk është e lidhur me një vend ose prodhues: ti bën artikujt me të cilët punon.

## Tre lloje artikujsh

| Lloji | Ku ndodhet | A mund ta ndryshosh? |
|---|---|---|
| **Shembuj** | Të dhënë me CivilCraft, me numra të përgjithshëm që kemi nxjerrë nga vetitë e materialeve | Jo: {{ui:Kopjo në bibliotekën time}} më parë |
| **Në projekt** | Erdhi me skedarin e projektit që hapët | Jo: {{ui:Kopjo në bibliotekën time}} më parë |
| **Të mijat** | Artikujt tuaj, të mbajtur në këtë shfletues | Po, dhe ndryshimet ruhen menjëherë |

Çdo projekt mban një kopje të çdo artikulli që përdor, kështu që një projekt hapet në çdo kompjuter me përçuesit dhe shtyllat e vet.

:::warning
Artikujt shembull janë vetëm shembuj: kontrollo çdo numër me të dhënat e furnitorit tënd. Kabllot nëntokësorë nuk kanë vlerësim rryme me qëllim, sepse varet nga mënyra si shtrihen.
:::

## Bëj një artikull

1. Te **Biblioteka**, zgjidh **Llojin** (përçues ajror, kabllo nëntokësorë, mbajtëse, pajisje ose lloje hendeku).
2. Kliko {{ui:Artikull i ri}}, ose zgjidh një shembull dhe kliko {{ui:Kopjo në bibliotekën time}} ose {{ui:Dublo}}.
3. Plotëso fushat e tij. Fushat e shënuara me `*` janë ato që u duhen kontrolleve; një artikull që i mungon një shenjohet me `!` dhe listohet te **Kontrollet** kur e përdor një linjë.
4. Jepi një **Kategori**, me `/` midis niveleve: `Ajror/LV/Të lidhur`, `Mbajtëse/Beton/12 m`. Pema ndjek kategoritë e tua.

Çfarë nevojitet për çdo lloj:

| Lloji | Të nevojshme për kontrollet |
|---|---|
| Përçues ajror | prerja tërthore, diametri, masa për metër, forca e thyerjes, moduli elastik, zgjerimi termik |
| Kabllo nëntokësor | bërthamat, prerja tërthore, tensioni, diametri, rezistenca, vlerësimi i rrymës |
| Mbajtëse | gjatësia totale, ngarkesa nominale (matet në një pikë nën majë), thellësia në tokë |
| Pajisje | lloji i saj; ngarkesë e vlerësuar për traversat, pajisjet lidhëse dhe tirantët; hapësira e fazave dhe rënia për traversat; gjatësia për izolatorët; këndi për tirantët |
| Lloj hendeku | thellësia, gjerësia, mbulesa mbi kabllot |

## Ndaji

- {{ui:Ruaj bibliotekën time}} ruan çdo artikull tënd si një skedar `.cclines.json`; {{ui:Hap një bibliotekë…}} e lexon përsëri (artikujt me të njëjtin çelës zëvendësohen).
- {{ui:Ruaj si CSV}} ruan llojin që po shikon si fletëllogaritëse; {{ui:Hap një bibliotekë…}} lexon një CSV të atij lloji. Kolonat mund të vijnë në çdo renditje; një skedar me ndarës pikëpresjeje mund të përdorë presje dhjetore.
