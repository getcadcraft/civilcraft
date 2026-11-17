---
title: Mérési pontok importálása
summary: CSV- vagy szöveges pontfájl megnyitása, az oszlopsorrend ellenőrzése a Pontok importálása párbeszédpanelen, a nem olvasható sorok javítása, és a pontok csoportosítása.
keywords: pontok importálása, csv, txt, pnezd, penzd, pontfájl, felmérés, cogo-pontok, pontcsoportok, oszlopok, északi keleti
from: ad33d88a
---

A pontfájl szöveges fájl, soronként egy ponttal: pontszám, északi érték, keleti érték, magasság és leírás valamilyen sorrendben, vesszővel, tabulátorral, pontosvesszővel vagy szóközzel elválasztva. A CivilCraft a böngészőben olvassa be, és azonnal felületet épít belőle.

## Mielőtt elkezdi

- Ismerje a fájl oszlopsorrendjét, ha tudja (a PNEZD és a PENZD a gép számára egyformának látszik).
- Ismerje a mértékegységeit. A CivilCraft nem vált át: állítsa a **Mértékegységek** beállítást a bal panelen a fájlhoz (lásd: [Mértékegységek, állomások és számformátumok](topic:units-and-stations)).
- A koordináták nagyok lehetnek (állósík-koordinátáknál több millió északi és keleti érték is rendben van).

## Fájl importálása

1. Kattintson az eszköztár {{ui:Megnyitás}} gombjára, vagy nyomja meg a {{key:Mod+O}} billentyűket, és válassza ki a fájlt. A tervre is húzhatja.
   Megnyílik a **Pontok importálása** párbeszédpanel a fájl nevével, egy **Oszlopok** listával, amely {{ui:Felismerés}} állapotban van, egy összefoglaló sorral és az első hat ponttal.
2. Olvassa el az összefoglaló sort. Megmondja, hány pontot olvastak be, milyen oszlopsorrendben, hogyan találták meg ezt a sorrendet, és mi választja el az oszlopokat. A sorrend háromféleképpen állapítható meg:
   - „a fejléc sorából”: az első sor nevezi meg az oszlopokat (Pont, Északi, Keleti, Magasság, Leírás, vagy X, Y, Z …). Ez a legbiztonságosabb.
   - „kiválasztva”: Ön választott sorrendet az **Oszlopok** listában.
   - „az oszlopok száma és a pontsor beállítása alapján becsülve (PNEZD) — ellenőrizze, hogy az északi és a keleti érték nincs-e felcserélve”: nem volt használható fejléc. Ha a fájljai általában keleti értékkel kezdődnek, állítsa a **Pontsorok** beállítást P, E, N, Z, D értékre a [CivilCraft beállításaiban](topic:settings).
3. Ellenőrizze az előnézeti táblázatot. Oszlopai mindig **Pont**, **Északi**, **Keleti**, **Magasság** és **Leírás**, függetlenül attól, milyen sorrendben van a fájl. Egy valódi terület északi és keleti értékei általában jól láthatóan eltérő nagyságúak: ha felcserélődöttnek látszanak, a becslés téves volt.
4. Ha a sorrend rossz, válassza ki a helyeset az **Oszlopok** listából (például {{ui:PENZD — pont, keleti érték, északi érték, magasság, leírás}}). Az összefoglaló és az előnézet azonnal frissül.
5. Nézze meg az előnézet alatti **Nem beolvasott sorok** részt. Minden sor megnevezi a fájlbeli sorszámot, az okot és a sor elejét. Lásd: [Nem beolvasott sorok](topic:import-points#rows-that-are-not-read).
6. Kattintson az {{ui:Importálás}} gombra.
   A pontok megjelennek a terven, a nézet rájuk nagyít, és a felület felépül. Az állapotsor például ezt írja: „276 pont importálva a site.csv fájlból; felület: 546 háromszög.”

Ha a projektnek még nem volt neve, a fájl nevét kapja.

## Csoportok ellenőrzése

Minden pont egy csoporthoz tartozik, amelyet a leírása **első szava** nevez el, nagybetűvel: a „GRD”, az „FL 12” és az „fl” csoportjai GRD, FL és FL. A leírás nélküli pontok a „(nincs leírás)” csoportba kerülnek.

1. A bal panel **Pontok** része alatti táblázatban látható: csoport, pontok száma és egy **Felület** választás.
2. Minden csoport {{ui:Pontok}} állapotban indul. A folyásvonalakat, burkolatszéleket, a lejtők lábát és tetejét, gerinceket és hasonló kódolt vonalakat állítsa át {{ui:Töréselő}} típusra. Állítsa a {{ui:Kihagyva}} állapotba azokat a csoportokat, amelyek nem alakíthatják a terepet (vezérlőpontok, fák koronái, a tetejükön felvett közműoszlopok).
3. Kattintson egy pontra a terven (a {{ui:Kijelölés}} eszközzel), hogy a jobb panelen lássa a számát, koordinátáit, magasságát, leírását és csoportját.

:::warning
Egy töréselő-csoport **az összes** pontját **egy** vonallá köti össze, pontszám szerinti sorrendben. Ez akkor működik, ha minden kódolt vonalat sorban, saját kóddal mértek fel. Két külön folyásvonal, mindkettő „FL” kóddal, egy cikk-cakkos vonallá válik, amely köztük ugrál. Ha a kódjai közösek, használja inkább a {{ui:Töréselő}} eszközt, és kattintson minden vonal pontjaira (lásd: [A felület felépítése és finomítása](topic:build-surface)).
:::

## Nem beolvasott sorok

| Megjelenő ok | Mit jelent | Mit tegyen |
|---|---|---|
| "az északi vagy keleti érték nem szám" | Egy koordinátaoszlop szöveget tartalmaz | Ellenőrizze az oszlopsorrendet, vagy egy szöveges sort a fájl közepén |
| "a magasság nem szám" | A magasságoszlop szöveget tartalmaz | Rossz oszlopsorrend, vagy leírás a magasságoszlopban |
| "nincs pontszám" | A pontoszlop üres | Számozza meg a pontot, vagy válasszon P nélküli sorrendet (NEZD, NEZ …): ekkor a pontok 1, 2, 3 … számot kapnak |
| "a 12-es pont kétszer szerepel (az első marad meg)" | Két sor ugyanazt a számot viseli | Ha mindkettő valódi mérés, számozza át az egyiket a fájlban |
| "3 oszlop, 5 várt (PNEZD)" | A sor rövid | Törött sor vagy rossz oszlopsorrend |

Üres magasságú pont megmarad, de nem kerül be a felületbe. A **Pontok** adatai megmutatják, hány pontnak van magassága.

A `#`, `;` vagy `//` jellel kezdődő sorok megjegyzések, és kimaradnak. Az üres sorok szintén kimaradnak.

## Pontok cseréje vagy hozzáadása

Az újraimportálás **lecseréli** az összes pontot; nem adja hozzá őket. A nyomvonalai, tereplépcsői, csővezetékei, rajzolt töréselői és határai megmaradnak. A visszavonási előzmények törlődnek, ezért mentse el a projektet előbb, ha később vissza akarhatja kapni a régi pontokat. Két fájl egyesítéséhez egyesítse őket egy szövegszerkesztőben vagy táblázatkezelőben az importálás előtt (ügyeljen az ismétlődő pontszámokra).

A pontokat a CivilCraftban még nem lehet mozgatni, szerkeszteni vagy törölni. Javítsa őket a fájlban, és importálja újra.

## Kapcsolódó

- [Pontfájl-formátumok](topic:point-file-formats): minden oszlopsorrend és a fejlécek felismerésének módja.
- [A felület felépítése és finomítása](topic:build-surface).
