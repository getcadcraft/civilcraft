---
title: Laisvos formos objektai
summary: Perkelkite į vietovę formą, sukurtą kitoje programoje (STL, OBJ arba bibliotekos elementą); ji stovi ant žemės arba įpjaunama į ją, o jos tūris, plotas ir pėdsakas skaičiuojami kaip ir visa kita.
keywords: laisva forma, pasirinktinis objektas, skulptūra, vazonas, suolas, tinklas, stl, obj, bibliotekos elementas, reljefą atitinkantis, sekti žemę, įpjauti į žemę, kiekiai, tūris, ifc
from: ec835f33
---

Vienkartinį elementą (vazoną, suoliuko sieną, skulptūrą, žaidimo kauburį) galima sukurti ModelCraft ar PartCraft ir čia patalpinti, kad jis būtų tame pačiame modelyje ir žiniaraščiuose kaip visa kita.

1. Kraštovaizdis › Daugiau › {{ui:Freeform object…}} ir pasirinkite **STL** arba **OBJ** failą (projekto vienetais: pėdomis pėdų projekte, metrais metrų projekte) arba CadCraft **bibliotekos elementą** (`.json`) su tinklo korpusu.
2. Spustelėkite, kur jis turi būti.

## Jo pagrindas

- **Seka žemę**: jo žemiausias taškas stovi ant žemiausios žemės po jo pėdsaku, todėl nieko neplaukia. Ypatybės įvertina, kiek jo yra žemiau žemės.
- **Įpjauna žemę**: jo pagrindas nustatomas kotoje, o žemė jo pėdsako viduje nuformuojama iki jos su dienos šviesos šlaitais ir skaičiuojama Žemės darbuose kaip aikštelė.

Pasukite jį su **Pasukta**, vilkite plane, kad perkeltumėte.

## Skaičiuojama

Ypatybės pateikia jo **tūrį** (uždaram kūnui), **paviršiaus plotą**, **pėdsaką** ir **aukštį**, išmatuotus iš tinklo. IFC eksportas jį įrašo su pasirinkta **IFC klase** ir tais kiekiais.

:::note
Pėdsakas yra kontūro išgaubtasis apvalkas: įgaubta forma (L formos vazonas) formuojama lyg būtų užpildyta.
:::
