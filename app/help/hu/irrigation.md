---
title: Öntözéstervezés
summary: Számítási segédeszköz, nem hitelesített terv: fejek, oldalvezetékek, főág, szelepek és csepegtető vezetékek a telken; a csöveken megtalált zónák; nyomásveszteség Hazen–Williams szerint, a legrosszabb fej, az átfolyás és a nyomás az ellátással szemben, csapadékintenzitás, futási idők, lefedettség és anyagjegyzék.
keywords: öntözés, szóró fej, permetező, forgófej, forgó fúvóka, bubbler, csepegtetés, csepegtető vezeték, adagoló, szelep, zóna, állomás, vezérlő, főág, oldalvezeték, csatlakozási pont, vízellátás, nyomás, psi, kpa, átfolyás, gpm, súrlódási veszteség, Hazen–Williams, csapadékintenzitás, futási idő, lefedettség, fejtől fejig, anyagjegyzék
from: 7d6342c1
---

:::warning
Ez számítási segédeszköz, nem hitelesített terv: az öntözési tervező minden eredményt ellenőriz, mielőtt bármi épül.
:::

## A rendszer kialakítása

1. Az **Öntözés** szakaszban a bal oldalon válassza ki a **Fejet**, annak **Ívét** és az ív kezdetét, valamint az oldalvezetékek és a főág csőméreteit.
2. {{ui:Öntözés}} › {{ui:Csatlakozási pont}}: kattintson oda, ahol a vízellátás csatlakozik. Állítsa be a **nyomását**, az **elérhető átfolyást**, valamint a mérő és a visszaáramlásgátló veszteségét a Tulajdonságokban.
3. {{ui:Öntözés}} › {{ui:Szelep}}: kattintson arra a helyre, ahová az egyes zónák szelepe kerül. A szelep kezd egy zónát.
4. {{ui:Öntözés}} › {{ui:Fej}}: kattintson a fejek elhelyezéséhez; minden kattintás egy fejet helyez el.
5. {{ui:Öntözés}} › {{ui:Mellékág}}: kattintson egy szeleptől indulva a fejeken át, és nyomja meg az {{key:Enter}} billentyűt. {{ui:Főág}}: a csatlakozási ponttól minden szelepig.

A csővégek a fejekhez, szelepekhez, az ellátáshoz és más csővégekhez illeszkednek, így a hálózat összekapcsolódik. Zóna mindaz, amit a szelepéből az oldalvezetékeken át elér; a főág egyszerre egy zónát szállít.

## Csepegtetés

{{ui:Öntözés}} › {{ui:Csepegtető vezeték}}: kattintson a vonal mentén, onnan kezdve, ahol táplálják (oldalvezeték vége vagy szelep). Állítsa be az **adagoló átfolyását** és a **távolságot** a Tulajdonságokban; a vonal átfolyása a rajta lévő adagolók összege.

## Ellenőrzés

{{ui:Öntözés}} › {{ui:A rendszer ellenőrzése…}} minden zónát felsorol:

| Oszlop | Hogyan számítódik |
|---|---|
| Átfolyás | A fejek (és a csepegtető vezetékek) átfolyásainak összege |
| A szelepnél | A legrosszabb fej működési nyomása, plusz a hozzá vezető csővesztségek (Hazen–Williams, a cső belső átmérője, a magasságváltozás), valamint a szelepen át bekövetkező veszteség |
| Az ellátásnál | Ugyanez, plusz a főágnak az adott zónát szállító vesztesége, valamint a mérő és a visszaáramlásgátló vesztesége |
| Csapadék | A fejek átfolyása osztva azzal a területtel, amelyet fejtől fejig távolságra öntöznek |
| Percek hetente | A **Hetente öntözés** beállítás szerint szükséges idő |
| Problémák | Sebesség a határ fölött, fej a nyomástartományán kívül, permetezők és forgófejek egy szelepen, nincs elég nyomás vagy átfolyás az ellátásnál, zónához nem tartozó fejek, hurkok |

Válasszon ki egy szelepet, hogy megjelenjenek a zónája adatai, és a legrosszabb fej bekarikázva a terven. Az anyagjegyzék a fejeket típus és ív szerint, a csöveket méret szerint, a szelepeket, a csepegtető vezetéket és az adagolókat, valamint a vezérlő állomásait számolja. A **Mentés CSV-ként** mindkettőt elmenti.

Az Öntözés szakasz beállításai: **Hazen–Williams C** (150 új műanyag csőhöz), a **leggyorsabb átfolyás** egy csőben (1,5 m/s), a **szelepen át bekövetkező veszteség** és a **hetente öntözés**. Ezek címkézett alapértékek.

## Lefedettség

{{ui:Öntözés}} › {{ui:Lefedettség megjelenítése}} megmutatja, a terület mekkora részét hagyják szárazon a fejek, mekkorát fed le kettő vagy több fej, és mely fejek nem érik el a szomszédjukat (fejtől fejig távolság).

## Fejek

A felsorolt fejek **általános** típusok, amelyeket a CadCraft a tervezési csapadékintenzitásból írt (fix szóró fejek, forgó fúvókák, fogaskerekes forgófejek, bubblerek, mikropermetezők, adagolók), nem valamely gyártó termékei. Az **Fejek hozzáadása fájlból…** a saját fejeit olvassa be (JSON-lista minden fej szórástávolságával, átfolyásával vagy csapadékintenzitásával és nyomástartományával); ezek a projekttel együtt mentődnek. Gyártó közzétett adatai csak a gyártó rögzített engedélyével kerülhetnek be.

Az általános fejek alatt a lista **tipikus fejeket** tartalmaz (nevük végén a „typical values” áll): fix szóró fejek, forgó fúvókák és fogaskerekes forgófejek fúvókaméretei, mikropermetezők, bubblerek és adagolók, sugárral, átfolyással és nyomástartománnyal. Ezeket a CadCraft csak nyílt forrásokból származó közzétett képletekből számolja (az átfolyáshoz a nyílás-egyenlet, a sugárhoz a sugárszórás skálázása) és névleges átfolyási osztályokból; gyártói táblázat nem kerül át. Válasszon egyet, és a választó megmutatja az alapját és a licencét. Az a projekt, amely használ egyet, megtartja a fejet és annak forrását a projektfájlban. Tervezésre valók: a valódi fej saját adatait ellenőrizze építés előtt.
