---
title: Távolságok, területek és lejtések mérése
summary: Mérés az alaprajzon pontok kattintásos megadásával: az egyes oldalak hossza és irányszöge, a futó összeg, a talajmenti hossz, a lejtés, valamint egy zárt alakzat területe és kerülete, továbbá két pont között az erővezeték hossz-szelvényén.
keywords: mérés, mérni, távolság, hossz, terület, kerület, irányszög, lejtés, esés, mérőléc, mérőszalag, talajmenti, hossz-szelvény, magasságkülönbség
from: d614eb25
---

{{ui:Surface}} › {{ui:More}} › {{ui:Measure}} (az Erővezetékek munkaterület {{ui:More}} menüjében is, vagy nyomja meg a {{key:M}} billentyűt) a projekthez semmit sem ad hozzá, csak mér.

## Az alaprajzon

1. Válassza a {{ui:Measure}} parancsot, majd kattintson pontokra. Ha egy felmérési pont közelébe kattint, a kattintás annak helyét és magasságát veszi át.
2. Az állapotsor megadja a pontok számát és a teljes hosszt, az utolsó oldal hosszát és irányszögét, a lejtését, ha a terep mindkét végpontnál ismert, valamint a talajmenti hosszt. A mutató mellett látható a éppen rajzolt oldal és a futó összeg.
3. Az első pontra újra kattintva zárja be az alakzatot: az állapotsor kiegészül a **területtel** és a **kerülettel**. A következő kattintás új mérést kezd.
4. Az {{key:Enter}} befejezi a mérést, és megtartja az eredményeit az állapotsorban; a {{key:Backspace}} visszavonja az utolsó pontot; az {{key:Esc}} törli a mérést, a másodszori {{key:Esc}} pedig visszatér a {{ui:Select}} eszközre.

A hosszak a projekt mértékegységében, a területek annak négyzetmértékegységében szerepelnek. A lejtést és a talajmenti hosszt a tervezett terepfelület adja, ha van ilyen, egyébként a meglévő terep; felület nélkül ezek kimaradnak.

## Erővezeték hossz-szelvényén

A [vonal hossz-szelvényén](topic:overhead-line#the-line-profile) a szelvény sávjában lévő {{ui:Measure}} két kattintással adja meg a vízszintes távolságot, a magasságkülönbséget, az egyenes távolságot és a lejtést köztük. A talajhoz, a vezetőhöz vagy egy tartó tetejéhez közeli kattintás oda pattan. A leállításhoz kattintson ismét a {{ui:Measure}} gombra.
