---
title: "Požeminiai kabeliai"
summary: "Kabelių trasos grioviuose tarp atramų ir įrangos, danga ir kirtimai, jungtys pagal būgno ilgį bei griovių ir kabelių kiekiai."
keywords: "požeminis kabelis, kabelio trasa, griovys, kanalas, danga, kirtimas, vamzdžio kirtimas, jungtis, būgnas, spintelė, transformatorius, šaltinis, įtampos kritimas"
from: adfd2717
---

## Nubrėžkite kabelio trasą

1. Jei kabelis baigiasi spintelėje, transformatoriuje ar jungtyje, pirmiausia padėkite įrangą: {{ui:Įranga}}, tada spustelėkite.
2. Spustelėkite {{ui:Kabelis}} ir spustelėkite trasą; pradėkite ir baikite ant atramos ar įrangos, kad prie jos prisijungtų. {{key:Enter}} baigia.

Ypatybėse pasirinkite **Kabelis**, **Griovio tipas**, kiek **kabelių greta**, ir **atsargą** (%). Trasa rodo savo ilgį, kur ji prasideda ir baigiasi bei srovę, kurią neša.

## Kas tikrinama

- **Danga**: kabelio viršus po žeme visoje trasoje, palyginus su griovio tipo danga (arba taisyklių rinkinio mažiausia danga).
- **Kirtimai**: kur trasa kerta CivilCraft vamzdį ar kitą kabelį, tarpas tarp jų lyginamas su atstumo taisykle: paties maršruto **Kirtimo tarpas** (jo Ypatybėse), jei jį pasirinkote; kitu atveju taisyklių rinkinio taisyklė **Požeminiai kirtimai** (pavyzdiniai rinkiniai naudoja *Požeminis kirtimas*, 0.3 m); kitu atveju griovio tipo tarpas iki kitų komunikacijų. Dviems kryžiuojantiems kabeliams taikomas didesnysis iš jų. Kertama oro linija pateikiama informacijai, o kabelis rodomas tos linijos profilyje.
- **Jungtys**: viena kas būgno ilgį (su atsarga), kai kabelio elementas nurodo būgno ilgį.

## Įranga

Įranga turi bibliotekos elementą, **apkrovą** (kW) su savo **galios koeficientu** ir gali būti **šaltiniu**: tinklas maitinamas iš jos. Šaltinio įtampa paimama iš jo bibliotekos elemento, arba kitu atveju iš linijos ar kabelio, kurį jis maitina.

## Kiekiai

{{ui:Daugiau}} › {{ui:Kiekiai…}} suskaičiuoja kabelį (trasos ilgis × (1 + atsarga) × kabeliai greta + pakilimas kiekviename gale), griovius pagal tipą, iškasimo, paklotės ir užpylimo tūrius, kanalus ir jungtis, su oro linijų laidininku, atramomis ir įranga.
