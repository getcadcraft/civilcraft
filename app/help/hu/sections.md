---
title: Mintavételi vonalak és keresztszelvények
summary: Keresztszelvények vágása a nyomvonalra merőlegesen, a terep, a tervezett szint és a bevágás és töltés megtekintése minden szelvényszámnál, térfogatok átlagolt végterületekkel.
keywords: tömegdiagram, tömeg-diagram, kiegyenlítési pont, zsugorodás, duzzadás, szállítási távolság, kölcsönzés, felesleg, keresztszelvény-lapok, szelvény PDF, szelvények, keresztszelvények, mintavételi vonalak, keresztszelvény-nézet, bevágás, töltés, területek, átlagolt végterület, végterület-térfogatok, földmunka, szelvényszám, eltolás, csv
from: 5060173c
---

A keresztszelvény úgy mutatja az utat, ahogyan majd épül: a nyomvonalra merőlegesen, egy szelvényszámnál, a meglévő terepet, a tervezett szintet (a folyosót vagy a tereplépcsőt, amelyet beléptetnek), és közöttük a bevágást és töltést.

## Mintavételi vonalak hozzáadása

1. Jelöljön ki egy nyomvonalat. A **Tulajdonságok** között, a **Mintavételi vonalak** alatt kattintson a {{ui:Mintavételi vonalak hozzáadása}} gombra.
2. Állítsa be a **Minden** értéket (a távolságot: kezdetben 50 ft vagy 20 m), a **Bal szélesség** és a **Jobb szélesség** értéket (meddig nyúlik minden szelvény a középvonaltól).
3. Ha egy adott szelvényszámnál akar szelvényt vágni, írja be az **Szelvényszám hozzáadása** mezőbe (például `2+35`), és nyomja meg az {{key:Enter}} billentyűt.

A szelvények a távolság minden egész többszörösénél vágódnak, a nyomvonal mindkét végén, minden ív kezdeténél és végénél (PC és PT), valamint a hozzáadott szelvényszámoknál. A mintavételi vonalak az alaprajzon szürke vonalként jelennek meg, a nyomvonalra keresztben; DXF-, DWG- és PDF-formátumban is kimennek a C-ROAD-SCTN rétegen. Minden változtatás egy lépés: a {{key:Mod+Z}} visszavonja.

## A keresztszelvény-nézet

Nyissa meg a nyomvonal **Tulajdonságok** részében lévő {{ui:Keresztszelvény-nézet}} gombbal, a **Felület** › {{ui:Továbbiak}} alatti {{ui:Szelvények}} gombbal, vagy az {{key:X}} billentyűvel. Az alaprajz alatti hossz-szelvény-nézet helyét veszi át.

- Léptessen a szelvények között a sávjában lévő nyilakkal, a szelvényszám-listával, vagy a {{key:Left}} és {{key:Right}} billentyűkkel, ha a keresztszelvény-nézet van fókuszban ({{key:Home}} és {{key:End}} az első és az utolsó szelvényre).
- A szürke vonal a meglévő terep, a piros vonal a terv. A bevágás narancssárgával, a töltés zölddel van árnyékolva. A folyosó pontjai jelölve vannak: CL (középvonal), EOP (burkolatszél), SH (padka) és DL (határvonal).
- A fejléc megadja a szelvényszámot, a szelvény bevágási és töltési területeit és a függőleges nagyítást. Az **Illesztés** kitölti a panelt; az 1×-es beállítás a szelvényt valós méretarányban mutatja.
- A vastag vonal az alaprajzon mutatja, melyik szelvény látszik.

## Szelvénylapok

A **Mintavételi vonalak** alatti {{ui:Keresztszelvény lapok (PDF)}} minden szelvényt PDF-oldalakra tesz, sorokban, balról jobbra és felülről lefelé, szelvényszám szerinti sorrendben. Válassza ki a **Papír** méretet, az **Alaprajzi méretarány** (a szelvények vízszintes méretaránya) és a **Hossz-szelvény magasságnagyítása** (1×, 2×, 5× vagy 10×) értéket; a párbeszédpanel megmondja, hány szelvény fér egy oldalra, és ez hány oldalt tesz ki.

Minden szelvényen rács látszik az eltolásokkal és magasságokkal, a terep (szaggatott), a terv, a bevágás és a töltés árnyékolva (narancs és zöld), a folyosó pontjai, és alatta a szelvényszám és a bevágás- és töltési területek. A lapokon minden szelvény azonos méretű, elég magas a legnagyobbhoz; ha ez a választott nagyításnál nem fér az oldalra, a CivilCraft a legnagyobbat használja, amely belefér, és ezt jelzi. A címsor megnevezi a nyomvonalat, az oldalon lévő szelvényszámokat, a méretarányokat és az „1. lap / 3” jelzést.

## Térfogatok átlagolt végterületekkel

Két szomszédos szelvény között a térfogat a két terület átlaga, szorozva a szelvényszámaik közötti távolsággal. A sáv a nyomvonal összegeit mutatja, a {{ui:CSV}} pedig letölti minden szelvény területeit és térfogatait futó összegekkel (köbyard a lábmértékű projektben, köbméter a métereseknél).

A **Tulajdonságok** ugyanezeket az összegeket mutatja a [Földmunka-térfogatok](topic:volumes) rácsmódszerrel számított térfogatai mellett. A kettő különböző közelítés: a sűrűbb szelvények közelebb hozzák őket, és egyenes úton, sík terepen azonosak.

:::note
A bevágás és a töltés csak a kialakított területeken belül számít (folyosó vagy tereplépcső határvonalai), ahogy a rácsmódszer is teszi. Folyosó vagy tereplépcső nélkül a terv maga a terep, így a szelvény nem mutat bevágást vagy töltést.
:::

## Tömegdiagram

A **Mintavételi vonalak** alatti **Tömegdiagram** ugyanabból a végterület-térfogatból rajzolja a tömegdiagramot: a szelvényszámok mentén a bevágás futó összege mínusz a töltés.

- **Bevágás zsugorodása (−) vagy duzzadása (+)**: megmondja, mit ad egy köbyard bevágás, amint töltésként beépítik: a −10% (kezdőérték, helyőrző) azt jelenti, hogy 0,9-re zsugorodik; a duzzadó kőzet lehet +5%. Használja a geotechnikai jelentés értékét.
- Ahol a vonal emelkedik, az út bevágásban van; ahol esik, töltésben. A nulla felett (narancs) a föld a szelvényszám felé halad; alatta (zöld) a szelvényszám csökkenő irányában.
- **Kiegyenlítési pontok** azok, ahol a vonal átlépi a nullát: két pont között a bevágás és a töltés kiegyenlíti egymást. A táblázat minden kiegyenlített szakaszt felsorol, a mozgatott térfogatot (a legmagasabb vagy legalacsonyabb pontjánál) és az átlagos szállítási távolságot (az árnyékolt terület osztva a térfogattal).
- Ahol a vonal nulla nélkül ér véget, a maradék **felesleg** (felette) vagy **kölcsönzés** (alatta). Az utolsó szakaszon csak a végső szinten túli föld számít mozgatottként.

A **CSV** menti minden szelvény tömegértékét, a szakaszokat és a tényezőt.
