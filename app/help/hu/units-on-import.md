---
title: Mértékegységek importáláskor: a fájl megadja az egységeit, vagy előbb megkérdezik
summary: Ha a rajz vagy háló, amelyet a projektbe hoz, megadja az egységeit, a CivilCraft átszámítja és jelzi. Ha nem, a CivilCraft a beolvasás előtt megkérdezi, és megjegyzi a válaszát az adott fájlhoz.
keywords: mértékegységek, importálás, DWG, DXF, STL, OBJ, felmérés, láb, US survey láb, méter, milliméter, méretarány, rossz méret, túl nagy, túl kicsi, kérdés, megjegyzett, INSUNITS, rajz mértékegységei
from: 60921963
---

## Mit fog csinálni

Hozzon be egy fájlt a projektbe, és győződjön meg róla, hogy a helyes méretben érkezik.

## Lépések

1. Nyissa meg a fájlt szokás szerint: {{ui:Megnyitás}}, húzza az alaprajzra, vagy használja a CAD-rajz parancsát.
2. Ha a fájl megadja az egységeit, nem kérdeznek semmit: az importálási párbeszédpanel **A rajz szerint** értéket mutatja.
3. Ha nem, egy párbeszédpanel megkérdezi a fájl **mértékegységeit**, mielőtt az importálási párbeszédpanel megnyílik. Válassza ki, mit jelent egy egység a fájlban, és kattintson a {{ui:Ezek a mértékegységek használata}} gombra.
4. A {{ui:Mégse}} (vagy az {{key:Esc}}) kihagyja a fájlt. Abból semmi sem kerül a projektbe.

## Mely fájlok adják meg az egységeiket

- **DWG és DXF**: a rajz beillesztési egységei (`$INSUNITS`). Az olyan fájlról, amelyben nincsenek, rákérdeznek. Az importálási párbeszédpanel **Rajz egységei** listája az Ön válaszával kezdődik, és még módosítható.
- **STL és OBJ** (tájformák szabad alakú felületei): soha nem adják meg az egységeket. Önnek kell megadnia.
- **Pontlisták** (CSV, TXT) és folyamatban lévő felmérési listák: az a lista, amely az első sorában megadja az egységét, átszámítódik, és az állapotsor ezt mondja. Amelyik nem ad meg semmit, a {{ui:Importálás}} gomb megnyomásakor kérdezik meg, mielőtt a pontok bekerülnének. A földrajzi szélesség- és hosszúság-oszlopok helyette a koordinátarendszeren keresztül mennek.
- **A pontfelhő-bővítmény**: rákérdez, amikor olyan felhőt épít, amelynek fájlja nem ad meg egységet, és a felhő számait a hordozott egységben címkézi.
- **IFC és LandXML**: megadják a sajátjukat; a projekt egységeire konvertálódnak.
- **LAS, LAZ és magassági rasztrok**: a koordinátarendszerük szerint kerülnek el; a terep párbeszédpanel rákérdez a magassági egységre, ha a fájl nem mondja meg.

## Érdemes tudni

- A válasz az adott fájlra van megjegyezve ezen a számítógépen, minden CadCraft-alkalmazásban. Legközelebb, amikor a fájl bekerül, nem kérdeznek.
- Ha újra meg akarják kérdezni: a parancspaletta ({{key:Mod+K}}) › **Importált fájlok mértékegységeit kérdezze meg újra**.
- A lista által megadott egységet az első nyolc sorából olvassa be: például egy `units: ft` sorból, vagy olyan oszlopfejlécekből, amelyek mind ugyanazt az egységet tartalmazzák zárójelben, például `Elevation (m)`.
