---
title: Épülettömegek rajzolása a helyszínen
summary: Épülettömeg rajzolása a telken, szintek és szintmagasság megadása, a bruttó szintterület megtekintése, a lejtős terephez való illeszkedés kiválasztása, a magasság tolása és húzása 3D-ben, valamint küldés a BimCraftnak vagy mentés IFC-fájlként.
keywords: tömeg, tömegtervezés, épülettömeg, térfogat, alaprajzi lábnyom, szintek, szintmagasság, bruttó szintterület, GFA, lejtő, podium, feltöltés és bevágás, tolás húzás, 3D, telekvizsgálat, korai tervezés, IFC, kidolgozás, BimCraft, A-MASS
from: e5a67c16
---

Az épülettömeg alaprajzi lábnyom, szintszám és szintmagasság: a korai kérdésre ad választ, hogy „mekkora épület fér ide, és mit csinál a terepen”. A tömegek a terven a nevükkel, szintszámukkal és bruttó szintterületükkel jelennek meg, bekerülnek a PDF-kiíratba és a DWG- és DXF-exportba az `A-MASS` és `A-MASS-TEXT` rétegeken, és a projektfájlban mentődnek.

## Tömeg rajzolása

1. A **Tulajdonságok** panelen, az **Épülettömegek** alatt kattintson a **Tömeg rajzolása** gombra. (A {{ui:Terepfelület}} melletti eszköztár **További** menüjében is megtalálható.)
2. Kattintson az alaprajzi lábnyom sarkaira. A telek sarka vagy egy felmérési pont közelében kattintva az a pont pontos helyét veszi át.
3. Kattintson újra az első sarokra, vagy nyomja meg az {{key:Enter}} billentyűt a befejezéshez. A {{key:Backspace}} visszaveszi az utolsó sarkot; az {{key:Esc}} megáll.

Egy új tömegnek három szintje van, 12 láb (3,6 m) szintmagassággal, és ahhoz a telekhez tartozik, amelybe a közepe esik.

## Szintek, magasság és terület

Kattintson egy tömegre, ha meg akarja változtatni a **Nevét**, a **Használatát**, a **Szintjeit**, a **Szintmagasságát** vagy a **Telkét**. A **Magasság** a szintek száma szorozva a szintmagassággal: ha magasságot ír be, a szintszám a legközelebbi egész szintre áll (legalább egy). A **Lábnyom** és a **Bruttó szintterület** (lábnyom szorozva a szintekkel) automatikusan számítódik.

## Lejtős terepen

A tömeg alatti terepet a felület adja: a meglévő terep, vagy az a rendezett terep, amelyet a **Tervezett terep (rendezett)** beállításnál választott. Az **Lejtős terepen** mezőben adja meg, hol legyen a földszint:

- **Lépcsőzetes**: a lábnyom alatti átlagos terepen. Az alacsony oldal fel van töltve, a magas oldal le van vágva, és a kettő közel kiegyenlíti egymást.
- **Podium**: a legmagasabb terepen. Egy tömör alap tölti fel az alacsony oldalt.
- **Bevágás**: a legalacsonyabb terepen. A magas oldal le van vágva a dombba.

A Tulajdonságok mutatja a tömeg alatti terep tartományát, a **Földszint szintjét**, valamint a feltöltés és a bevágás térfogatát a terep és ez a szint között. A lábnyomnak az a része, amely a felületen kívül esik, kimarad, és a Tulajdonságok megmondja, hányan.

## 3D nézetben

A tömegek a 3D helyszíni nézetben jelennek meg: minden szint körül vonal fut, a nevük pedig a tető fölött van. A **Megjelenítés** mezőben van egy jelölőnégyzet az **Épülettömegek** számára. Kattintson egy tömegre a kijelöléséhez. Ha a tömeg ki van jelölve:

- húzza a tetejét felfelé vagy lefelé, hogy szintenként tolja vagy húzza, vagy nyomja meg a {{key:PageUp}} és a {{key:PageDown}} billentyűt;
- az egész mozgatás egy visszavonási lépés.

A **Hajtás** utcanézete is látja a tömegeket, a **Nap** pedig a terepre vetíti az árnyékukat.

## Továbbküldés

- A **Tömegek IFC-ként** minden tömeget IFC4-fájlként ment: egy telket, egy épületet a szintjeivel, és a tömeget épületelemként a **CadCraft_SiteMass** tulajdonságkészletben lévő adatokkal. Ha a projekthez koordináta-rendszer van beállítva, a fájl a térképen helyezkedik el, és tartalmazza a helyszín szélességi és hosszúsági fokát; ha nincs, a fájl nem mond semmit arról, hol van.
- A **Kidolgozás a BimCraftban** új lapon megnyitja a BimCraftot a tömegekkel. Ott a tömeg kiválasztásakor megjelennek az adatai és a **Ez a tömeg kidolgozása** gomb, amely minden szinten falat és az épület alatt födémet készít a lábnyomból, egy visszavonási lépésben. Semmi nem töltődik fel: a fájl ennek a böngészőnek a két lapja között mozog.

Lásd még: **Zónahatárok** és **Napos órák**.
