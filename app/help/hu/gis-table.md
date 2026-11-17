---
title: Munka a réteg attribútumtáblájával
summary: Egy GIS-réteg minden elemének megtekintése táblázatban, rendezés és szűrés, sorok és elemek együttes kijelölése, értékek javítása, mezők hozzáadása, új értékek kiszámítása és a táblázat CSV-ként mentése.
keywords: attribútumtábla, tábla, mezők, oszlopok, sorok, rendezés, szűrés, kifejezés, kijelölés, szerkesztés, mezőszámológép, számítás, mező hozzáadása, mező átnevezése, mező eltávolítása, csv, export, gis, shapefile, geopackage, szimbólum
from: fd9d6c11
---

Nyissa meg a réteg táblázatát a GIS-rétegek listájában lévő **három pont** menüjéből ({{ui:Attribútumtábla…}}), a Felület › {{ui:Továbbiak}} › {{ui:Attribútumtábla}} útvonalon, vagy a `ATTRIBUTES`, `ATTTABLE` vagy `TABLE` parancs begépelésével. A táblázat a terv mellett nyílik meg, és a munka közben nyitva marad. Csak a látható sorok rajzolódnak ki, így a több ezer elemes réteg is gyorsan nyílik és görgethető.

## Rendezés, szűrés és kijelölés

- **Rendezés:** kattintson egy oszlopcímre. A második kattintás megfordítja, a harmadik visszaadja a fájl eredeti sorrendjét. Az üres értékek mindig alul maradnak. A rendezés csak a látványt változtatja, a réteget soha nem.
- **Szűrés:** írjon a szűrőmezőbe. Egy olyan kifejezés, mint `AREA > 500 and USE = 'Res'`, azokat a sorokat tartja meg, ahol igaz (ugyanazok a szavak, mint a [GIS-rétegek elemzése](topic:gis-analysis) témakör Kijelölés lapján: `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Ami nem kifejezés, például `oak maple`, az minden oszlopban ezeket a szavakat keresi.
- **Sorok kijelölése:** kattintson egy sorra. A Ctrl+kattintás hozzáad vagy eltávolít egy sort, a Shift+kattintás egy egybefüggő tartományt jelöl ki, a {{ui:Megjelenített sorok kijelölése}} pedig minden, a szűrőn átmenő sort kijelöl. A kijelölt elemek a terven rajzolódnak ki, és a terven lévő elemre kattintva itt a hozzá tartozó sor is kijelölődik.
- Kijelölt sorok mellett a {{ui:Nagyítás}} paranccsal rájuk nagyíthat, a kijelölésből réteget készíthet, és az állapotsorban elolvashatja a teljes területet vagy hosszt.

## Értékek javítása

Kattintson duplán egy cellára (vagy mozogjon oda a nyilakkal, és nyomja meg az Entert), írja be az új értéket, és nyomja meg az Entert. Az Esc a cellát az eredeti értékén hagyja. Az értéknek illenie kell az oszlopba: a számok számként, a dátumok `YYYY-MM-DD` alakban, az igen/nem típusnál yes, no, true vagy false. Az oszlopba nem illő értéket egy mondattal elutasítja, és semmi nem változik. Üres mező üres értéket eredményez. Minden szerkesztés egy visszavonási lépés: a {{ui:Visszavonás}} és az {{ui:Ismétlés}} a táblázat alján vannak, a Ctrl+Z pedig a terven működik.

## Mezők

A **Mezők** alatt mezőt adhat hozzá (szöveg, szám, dátum vagy igen/nem), átnevezhet egyet, vagy eltávolíthat egyet. Az új mező üresen indul. Az átnevezés követi a változást: a réteg címkézéshez használt mezője és [attribútum szerinti stílusa](topic:gis-symbology) az új névre kerül, a mező eltávolításakor pedig az azt használó címke és stílus megszűnik. Mindegyik egy visszavonási lépés, amely mindent visszaállít.

## Mezőszámológép

Minden sorba (vagy csak a kijelölt sorokba) értéket ír a sor többi mezőjéből, a geometriájából és néhány függvényből. Válasszon egy meglévő mezőt, vagy az **Új mező…** lehetőséget, és adjon neki nevet és típust. Semmi nem fut kódként: a kifejezést egy kis elemző olvassa be, rögzített függvénylistával.

| Csoport | Szavak |
|---|---|
| Számok | `+ - * /`, zárójelek, `abs round(x, digits) floor ceil sqrt pow min max` |
| Szöveg | `upper lower trim len substr(text, from, count) left right replace concat` (a szöveg 'egyszeres idézőjelben' áll; a szóközt tartalmazó mezőnév "dupla idézőjelben" vagy [szögletes zárójelben] írandó) |
| Választás | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Dátumok | `year month day` egy `YYYY-MM-DD` értékből |
| Geometria | `$area $perimeter $length $x $y $vertices`, a projekt mértékegységében |

Az eredmény, amelyet a mező típusa nem tud tárolni (szöveg számmezőben), üres marad, és az üzenetben megszámolódik. Nullával osztva üres értéket ad. Például a `round($area / 43560, 2)` négyzetlábból írja ki az akrokat.

## Exportálás

A {{ui:CSV exportálása}} a látható sorokat menti (a szűrés és rendezés után) UTF-8 CSV-fájlba, a mezőneveket az első sorban. Az `=`, `+`, `-` vagy `@` jellel kezdődő szöveg elé aposztrófot tesz, hogy a táblázatkezelő ne futtassa képletként. A réteg magát mentéséhez használja az [As-built adatok exportálása GIS-hez](topic:gis-export) lehetőséget.

## Korlátok

A táblázat a réteget egyszerre egy rendezési sorrendben és egy szűrővel mutatja. Sorokat itt nem lehet hozzáadni vagy törölni (helyette készítsen új réteget a kijelölésből), a geometria nem szerkeszthető, a mező típusa pedig létrehozás után nem változtatható.
