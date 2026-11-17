---
title: Cím a helyszínhez
summary: A címből megtudhatja, amit a helyszínről tudni kell: a telket, a körülötte lévő épületeket, az övezeti besorolást, a talajt és az árvízi zónát. Nyílt adatokból dolgozik, amelyeket gombnyomásra kér le, vagy fájlként ad meg, és javaslatként átadja a BimCraftnak.
keywords: cím, geokódolás, helyszín, telek, épületek, övezeti besorolás, talaj, árvíz, nyílt adatok, openstreetmap, fema, ssurgo, usgs, kontextus, ccsite, bimcraft
from: 125d848a
---

## Mit csinál

Terepfelület › További › Cím a helyszínhez egy pontra válaszol: melyik telekben van, mely épületek veszik körül, mi az övezeti besorolása, milyen a talaj és melyik az árvízi zóna. Az adatok nyíltak: a hozzáadott fájlok (GeoJSON, shapefile, KML, GeoPackage), valamint – ha a bővítményeket bekapcsolták – olyan gombok, amelyek egy-egy nyílt szolgáltatást kérdeznek le.

## Használat

1. Írjon be egy címet, és nyomja meg a címkeresés gombot (a bővítmény: „Címkeresés”), vagy adja meg a szélességi és hosszúsági fokot.
2. Adjon hozzá rétegeket: fájlokat a „Fájlok hozzáadása” gombbal, vagy a többi forrásgombbal (árvízi zóna, épületek, talaj, terepmagasság, megyei telkek). Szolgáltatást csak a hozzá tartozó gomb megnyomásakor kérdezünk le; indításkor semmi nem töltődik le.
3. A szöveges válaszért és egy CSV-fájlért nyomja meg a futtatás gombot.
4. A „Helyszín mentése fájlként” vagy a „Küldés a BimCraftnak javaslatként” a körvonalakat átadja a BimCraftnak vagy a ModelCraftnak; ők listázzák őket, és csak azokat veszik fel, amelyeket bejelöltek.

## Tudnivalók

- A címkeresés a getcadcraft.com oldalon keresztül történik, amely a kérést az OpenStreetMap Nominatim szolgáltatásának továbbítja (másodpercenként legfeljebb egy kérés; a válaszokat 90 napig tároljuk, így ugyanazt a címet nem kérdezzük le kétszer; csak a cím kivonatát (hash) tároljuk, a kérdezőt soha). A többi gomb közvetlenül a böngészőből megy a saját szolgáltatásához.
- Minden forrásnak saját licence van (az OpenStreetMap ODbL licencű: a forrásmegjelölő sort meg kell tartani).
- A rétegek pontossága attól függ, milyen jók a helyi nyílt adatok. Ami fontos, azt ellenőrizze felmérés alapján.
