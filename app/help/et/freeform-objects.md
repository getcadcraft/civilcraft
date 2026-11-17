---
title: Vabakujulised objektid
summary: Too teises rakenduses tehtud kuju (STL, OBJ või teegi objekt) alale; see asub maapinnal või lõigatakse maasse ning selle maht, pindala ja jalajälg arvestatakse nagu teistel.
keywords: vabakujuline, kohandatud objekt, skulptuur, istutuskast, istmed, võrk, stl, obj, teegi objekt, maastikuteadlik, järgib maapinda, lõigatakse maapinda, koguseid, maht, ifc
from: ec835f33
---

Ühekordse elemendi (istutuskast, istmemüür, skulptuur, mänguküngas) võib teha ModelCraftis või PartCraftis ja paigutada siia, et see asuks samas mudelis ja loendites kõige muuga.

1. Maastik › Veel › {{ui:Vabakujuline objekt…}} ja vali **STL**- või **OBJ**-fail (projekti ühikutes: jalgades jalgade projektil, meetrites meetrite projektil) või CadCrafti **teegi objekt** (`.json`), millel on võrgukeha.
2. Klõpsa kohta, kuhu see läheb.

## Alus

- **Järgib maapinda**: selle madalaim punkt asub jalajälje all oleva madalaima maapinna peal, nii et miski ei hõljugu. Omadused hindavad, kui palju sellest on maapinna all.
- **Lõikub maapinda**: selle alus seatakse kindlale kõrgusele ja maapind jalajälje sees profileeritakse sellele kaldusvälja nõlvadega; see arvestatakse pinnatöödes nagu platvorm.

Pööra seda nupuga **Pööratud**, lohista plaanil, et seda teisaldada.

## Arvestatud

**Omadused** annavad selle **mahu** (suletud tahke puhul), **pinnapindala**, **jalajälje** ja **kõrguse**, mõõdetuna võrgust. IFC-eksport kirjutab selle valitud **IFC-klassiga** ja nende kogustega.

:::note
Jalajälg on kontuuri kumer ümbris: kontuuri järgi kujundatud (L-kujuline istutuskast) kujutis profileeritakse nii, nagu oleks see täidetud.
:::
