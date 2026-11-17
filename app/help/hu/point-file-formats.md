---
title: Pontfájl-formátumok
summary: A CivilCraft által olvasott oszlopsorrendek, az elválasztó és a fejlécsor felismerése, a felismert fejlécnevek és a sorok ellenőrzése.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, pontfájl formátum, oszlopok, fejléc, elválasztó
from: 84fab42e
---

A pontfájl egyszerű szöveg, soronként egy pont. A CivilCraft a böngészőben olvassa; semmi nem kerül feltöltésre.

## Oszlopsorrendek

A betűk balról jobbra nevezik meg az oszlopokat: **P** pontszám vagy név, **N** északi koordináta, **E** keleti koordináta, **Z** magasság, **D** leírás.

| Sorrend | Oszlopok | Példasor |
|---|---|---|
| PNEZD | pont, északi, keleti, magasság, leírás | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | pont, keleti, északi, magasság, leírás | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | pont, északi, keleti, magasság | `101,2080000.00,6150000.00,250.00` |
| PENZ | pont, keleti, északi, magasság | `101,6150000.00,2080000.00,250.00` |
| NEZD | északi, keleti, magasság, leírás | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | keleti, északi, magasság, leírás | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | északi, keleti, magasság | `2080000.00 6150000.00 250.00` |
| ENZ | keleti, északi, magasság | `6150000.00 2080000.00 250.00` |

A P nélküli sorrendek a pontokat 1, 2, 3 … számmal sorszámozzák fájlsorrendben. Az X a keleti, az Y az északi koordináta.

## Elválasztók

A CivilCraft az első 20 sort nézi, és a következők közül az elsőt választja, amely a sorok legalább 60%-ában előfordul: vessző, tabulátor, pontosvessző. Ha egyik sincs meg, szóközsorozatoknál bont.

- Vessző-, tabulátor- és pontosvesszős fájlban a dupla idézőjelbe tett mező tartalmazhatja az elválasztót (`"FL, NORTH"`), az idézőjelen belüli `""` pedig egy idézőjelet jelent.
- Szóközzel elválasztott fájlban a sor végi leírás tartalmazhat szóközt: az utolsó koordinátaoszlop utáni minden a leírás része.
- A `#`, `;` vagy `//` jellel kezdődő sorok és az üres sorok kimaradnak.
- A fájl elején lévő bájtsorrend-jelölő figyelmen kívül marad.

## Fejlécsor

Az első sort fejlécnek tekinti, ha mezőinek kevesebb mint kettő száma. Ha a fejléc minden mezője a CivilCraft által felismert név, az oszlopsorrend ebből származik („a fejlécsorból”). A nevek összevetése független a kis- és nagybetűtől, a szóközöktől, a pontoktól, az aláhúzásjelektől, a kötőjelektől és a szögletes zárójelektől.

| Oszlop | Felismert nevek |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Ha valamelyik fejlécnév nem ismert, vagy a nevek nem alkotnak a nyolc sorrend egyikét, a fejlécet kihagyja, és a sorrendet az oszlopszám alapján becsüli.

:::warning
Ha a fejléc egyszerre nevez meg szélességi (`lat`, `latitude`) és hosszúsági (`lon`, `long`, `longitude`) oszlopot, fokban értelmezi, nem északi és keleti koordinátaként. Az {{ui:Importálás}} gombnál a pontok a projekt koordinátarendszerén keresztül alakulnak át, és koordinátarendszer nélküli projektnél előbb kéri azt kiválasztani. A ±90° szélesség vagy ±180° hosszúság tartományán kívüli sorokat elutasítja. Lásd: [GIS-adatok importálása](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Becslés az oszlopszám alapján

Fejléc nélkül, és ha az **Oszlopok** mező a {{ui:Felismerés}} értéken áll:

- 5 vagy több oszlop: PNEZD.
- 4 oszlop: PNEZ, ha az első oszlop minden mintavett sorban egész szám, a negyedik pedig szám; egyébként NEZD.
- 3 oszlop: NEZ.

A PNEZD és a PENZD a számok alapján nem különíthető el. A becslés a [CivilCraft beállításai](topic:settings) között megadott **Pontsorok** szerint történik: P, N, E, Z, D a sor elején, vagy P, E, N, Z, D (ekkor a négy oszlop PENZ, a három ENZ). A párbeszédpanel ezt írja: „oszlopszám alapján becsülve — ellenőrizze, hogy az északi és a keleti koordináta nincs-e felcserélve”. Ha az előnézet rossznak tűnik, az **Oszlopok** mezőben kell a helyes sorrendet kiválasztani.

## A sorok ellenőrzése

- Egy sor kihagyhatja a leírást.
- Az északi és a keleti koordinátának számnak kell lennie. A magasság üres lehet (a pont megmarad, de a felületben nem használódik).
- A pontszám lehet bármilyen szöveg (betűk is, például `CP1`), de nem lehet üres.
- Ha a pontszám ismétlődik, az első sor marad meg, a többit nem beolvasottként jelöli.
- A leírás legfeljebb 200 karakterig marad meg; a vezérlőkarakterek szóközzé válnak.
- Legfeljebb 200 nem beolvasott sor marad meg a párbeszédpanelhez (25 látszik), de mindet megszámolja.

## Ponthalmazok

Egy pont csoportja a leírása első szava nagybetűvel. A „GRD”, a „grd shot” és a „Grd” mind a GRD csoportba tartozik. Leírás nélküli pont a „(nincs leírás)” csoportba kerül. Lásd: [Felmérési pontok importálása](topic:import-points).

## Pontok írása

A CivilCraft még nem exportál pontszöveg-fájlt. A pontok LandXML-ben (CgPontként), a projektfájlban és a GIS {{ui:Exportálás}} parancson keresztül shapefile, GeoPackage vagy GeoJSON formátumban érhetők el, P, N, E, Z és D mezőkkel ([Kivitelezési adatok exportálása GIS-hez](topic:gis-export)). Lásd: [Még nincs elkészítve](topic:not-built-yet).
