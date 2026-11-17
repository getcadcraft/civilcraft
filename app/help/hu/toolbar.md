---
title: Eszköztár – referencia
summary: Minden eszköztárgomb a CivilCraftban, mit csinál, a billentyűparancsa, és mikor szürke vagy mikor utasítja el a műveletet.
keywords: eszköztár, gombok, parancsok, eszközök, fájl, exportálás, felület, tervezés, szerkesztés, nézet, menü
from: 4c4352bc
---

Az eszköztár az alkalmazás tetején fut végig, hét csoportban. Minden gomb a rámutatáskor megmutatja a súgóját és a billentyűparancsát.

## Fájl

| Gomb | Billentyű | Mit tesz |
|---|---|---|
| {{ui:Új}} | nincs | Új, üres projektet indít. Ha vannak nem mentett módosítások, előbb kérdez. |
| {{ui:Megnyitás}} | {{key:Mod+O}} | Pontfájlt (CSV, TXT), LandXML-t vagy CivilCraft-projektet nyit meg. |
| {{ui:Mentés}} | {{key:Mod+S}} | Letölti a projektet `<name>.civilcraft.json` fájlként. |

## Exportálás

| Gomb | Billentyű | Mit tesz |
|---|---|---|
| {{ui:LandXML}} | nincs | Letölti a `<name>.xml` fájlt: pontokat, felületeket, nyomvonalakat, hossz-szelvényeket és a csőhálózatot LandXML 1.2 formátumban. Üres projekt esetén a „Még nincs exportálható adat.” üzenet jelenik meg. |
| {{ui:DXF}} | nincs | Letölti a `<name>.dxf` fájlt: az alaprajzi vonalrajzot R12 DXF formátumban. |
| {{ui:PDF}} | {{key:Mod+P}} | Megnyitja az **Alaprajz plottolása PDF-be** párbeszédpanelt. Üres projekt esetén a „Még nincs plottolható adat.” üzenet jelenik meg. |

## Felület

| Gomb | Billentyű | Mit tesz |
|---|---|---|
| {{ui:Töréselő}} | {{key:B}} | Kattintson a felmérési pontokra sorrendben, az {{key:Enter}} befejezi. A töréselem a pontok magasságait veszi át. |
| {{ui:Határvonal}} | {{key:O}} | Kattintson a külső határvonal sarkaira, az {{key:Enter}} befejezi. Lecseréli a meglévő határvonalat. |

Mindkettő azt írja ki, ha nincs felület: „Még nincs felület: előbb nyisson meg felmérési pontokat.”

## Tervezés

| Gomb | Billentyű | Mit tesz |
|---|---|---|
| {{ui:Nyomvonal}} | {{key:A}} | Kattintson a PI-kra sorrendben, az {{key:Enter}} befejezi. |
| {{ui:Tereplépcső}} | {{key:G}} | Kattintson a tereplépcső sarkaira, az {{key:Enter}} befejezi. A felület-eszközökhöz hasonlóan figyelmeztet, ha nincs felület; a tereplépcső csak felületen alakítható ki. |
| {{ui:Csövek}} | {{key:P}} | Kattintson a műtárgyakra a felső résztől lefelé (egy meglévőre kattintva csatlakozik hozzá), az {{key:Enter}} befejezi. |
| {{ui:Hossz-szelvény}} | {{key:R}} | Megjeleníti vagy elrejti az alaprajz alatti hossz-szelvény nézetet. |

## Szerkesztés

| Gomb | Billentyű | Mit tesz |
|---|---|---|
| {{ui:Visszavonás}} | {{key:Mod+Z}} | Visszavonja az utolsó módosítást (legfeljebb 200). Szürke, ha nincs visszavonható művelet. |
| {{ui:Ismétlés}} | {{key:Mod+Y}} | Megismétli a visszavont műveletet. Szürke, ha nincs ismételhető művelet. |
| {{ui:Másolás}} | {{key:Mod+C}} | Másolja a kijelölt felmérési pontokat, és táblázatkezelő számára is fogadható pontsorokként a vágólapra teszi. Addig szürke, amíg nincs pont kijelölve. |
| {{ui:Beillesztés}} | {{key:Mod+V}} | Beilleszti a pontokat: a mutatót követik, és kattintásra olyan számokkal kerülnek le, amelyeket más pont nem használ. A táblázatkezelőből másolt pontsorok is beillesztődnek. |
| {{ui:Továbbiak}} | nincs | Megnyitja az alábbi menüt. |

A {{ui:Továbbiak}} menü:

| Elem | Billentyű | Mit tesz |
|---|---|---|
| {{ui:Kivágás}} | {{key:Mod+X}} | Másolja a kijelölt pontokat, majd törli őket (egy visszavonási lépés). |
| {{ui:Másolás}} | {{key:Mod+C}} | Mint a {{ui:Másolás}} gomb. |
| {{ui:Beillesztés}} | {{key:Mod+V}} | Mint a {{ui:Beillesztés}} gomb. |
| {{ui:Beillesztés helyben}} | {{key:Mod+Shift+V}} | A pontokat saját koordinátáikra illeszti, olyan számokkal, amelyeket más pont nem használ. |
| {{ui:Kettőzés}} | {{key:Mod+D}} | A kijelölt pontok másolata követi a mutatót; kattintson arra a helyre, ahová kerülnie kell. A vágólap nem változik. |
| {{ui:Törlés}} | {{key:Delete}} | Törli a kijelölt felmérési pontokat, vagy a kijelölt nyomvonalat, tereplépcsőt, műtárgyat (a csöveivel együtt), csövet vagy PVI-t. |
| {{ui:Összes pont kijelölése}} | {{key:Mod+A}} | Kijelöli az összes felmérési pontot. |
| {{ui:Kijelölés megszüntetése}} | {{key:Esc}} | Megszünteti a kijelölést. |

A most nem használható elem szürke, a súgója pedig megmondja, miért. Részletek: [Felmérési pontok kijelölése, másolása és beillesztése](topic:copy-paste-points).

A visszavonás a tervezés, a felületbeállítások és a felmérési pontok módosításait fedi le (beillesztés, kivágás, kettőzés, törlés). A megjelenítési beállításokat nem, és bármely fájl megnyitása vagy importálása törli.

## GIS

| Gomb | Billentyű | Mit tesz |
|---|---|---|
| {{ui:Koordináták}} | nincs | Megnyitja a **Koordináta-rendszer** párbeszédpanelt: adja meg, melyik rendszerben van a projekt, vagy használjon terepi vagy helyi koordinátákat. Lásd [A projekt koordináta-rendszerének beállítása](topic:coordinate-systems) és [Terepi és helyi koordináták](topic:ground-and-local-coordinates). |
| {{ui:Importálás}} | nincs | GIS-adatokat importál: shapefile-okat, GeoJSON-t, GeoPackage-t, magassági rácsokat és LiDAR-t. Lásd [GIS-adatok importálása](topic:gis-import). |
| {{ui:Exportálás}} | nincs | Kivitelezési (as-built) adatokat exportál a GIS-osztály számára. Lásd [Kivitelezési adatok exportálása GIS-hez](topic:gis-export). |
| {{ui:Elemzés}} | nincs | Megnyitja a GIS-elemző panelt: puffer, átfedés, térbeli összekapcsolás, kijelölés attribútum szerint, mérés. Lásd [GIS-rétegek elemzése](topic:gis-analysis). |
| {{ui:Attribútumtábla}} | nincs | A Felület › Továbbiak menüben. Megnyitja a GIS-réteg attribútumtábláját: rendezés, szűrés, kijelölés, szerkesztés, mezők hozzáadása, számítás, mentés CSV-ként. Lásd [Réteg attribútumtáblájának használata](topic:gis-table). |
| {{ui:Térkép}} | nincs | Megnyitja a **Térképrétegek** párbeszédpanelt: georeferált kép, vagy Ön által hozzáadott térképszerverek, amelyek az alaprajz alatt jelennek meg. Lásd [Térképrétegek megjelenítése az alaprajz alatt](topic:map-layers). |

A GIS-eszközök az első használatkor töltődnek be: amikor ezek egyik gombját használja, GIS-fájlt nyit meg, vagy olyan projektet, amelynek van koordináta-rendszere vagy GIS-rétege.

## Nézet

| Gomb | Billentyű | Mit tesz |
|---|---|---|
| {{ui:Kijelölés}} | {{key:V}} vagy {{key:Esc}} | Kattintson a nyomvonalak, tereplépcsők, műtárgyak, csövek és pontok kijelöléséhez ({{key:Shift}} és egy kattintás vagy húzás pontokat ad hozzá); húzza a fogópontokat a PI-k, tereplépcső-sarkok és műtárgyak mozgatásához. |
| {{ui:Illesztés}} | {{key:F}} | Az alaprajzot úgy nagyítja, hogy megjelenjen a felület, a pontok, a nyomvonalak és a tereplépcsők (3D nézetben: mindent megjelenít). |
| {{ui:3D}} | {{key:D}} | Megjeleníti a területet 3D-ben az alaprajz fölött, vagy visszavált az alaprajzra. A 3D nézet fölötti sáv állítja a nézetet, a túlzást, a színezést és azt, mi látszik, és GLB vagy OBJ formátumban exportál. Lásd [A terület megtekintése 3D-ben](topic:site-3d). |

## Gombok a panelekben

| Gomb | Hol | Mit tesz |
|---|---|---|
| {{ui:Mintaterület megnyitása}} | Az üres alaprajzon lévő doboz | Betölti a mintafelmérést (kapcsolat szükséges, kivéve, ha a CivilCraft offline használatra van mentve) |
| {{ui:A határvonal eltávolítása}} | Bal panel, Felület | Eltávolítja a külső határvonalat |
| {{ui:Rajzolt töréselemek eltávolítása}} | Bal panel, Felület | Eltávolítja az eszközzel rajzolt töréselemeket (a töréselem-csoportokat nem) |
| {{ui:A felület újraépítése a pontokból}} | Bal panel, Felület (csak LandXML-felület esetén) | Eldobja a LandXML TIN-t, és a pontokból épít; nem vonható vissza |
| {{ui:Kezdés a terepről}} | Jobb panel, Nyomvonal | Tervezési hossz-szelvényt indít, PVI-vel a talajon mindkét végén |
| {{ui:Hossz-szelvény nézet}} | Jobb panel, Nyomvonal | Megnyitja ennek a nyomvonalnak a hossz-szelvény nézetét |
| {{ui:PVI-k hozzáadása}} | Hossz-szelvény sáv | Amíg nyomva van, a hossz-szelvényre kattintva PVI-t ad hozzá |
| {{ui:Minden csőfenékmagasság beállítása a szabályok szerint}} | Jobb panel, Csőhálózat | Minden cső fenékmagasságát a szabályok szerint állítja be |
| {{ui:A fenékmagasságok beállítása a szabályok szerint}} | Jobb panel, Cső | Ennek a csőnek a fenékmagasságát a szabályok szerint állítja be |
