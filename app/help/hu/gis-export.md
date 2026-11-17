---
title: Kivitelezés utáni (as-built) adatok exportálása GIS-hez
summary: Felmért pontok, szintvonalak, nyomvonalak, tereplépcsők, csövek és műtárgyak átadása városi vagy megyei GIS-osztálynak shapefile, GeoPackage, GeoJSON vagy KML formátumban, a projekt koordináta-rendszerének rácskoordinátáiban.
keywords: gis, export, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, csövek, műtárgyak, közművek, város, megye, rács, terep, epsg, prj
from: bba4fea5
---

Sok város és megye GIS-formátumú as-built adatot kér, amikor a projekt lezárul: hol kerültek a csövek és a műtárgyak, a végső szintek, az út tengelyvonala. A **GIS › Exportálás** a CivilCraft által tárolt adatokat GIS-rétegekként írja ki, típusonként egyet.

## Az exportálás előtt

1. Állítsa be a projekt koordináta-rendszerét a {{ui:Koordináták}} beállításában. A GIS-osztálynak tudnia kell, hol vannak a számok; koordináta-rendszer nélkül a fájlok a projekt saját számait tartalmazzák, és nem neveznek meg rendszert.
2. Ellenőrizze a felületet, a nyomvonalakat, a tereplépcsőket és a csőhálózatot úgy, ahogy át szeretné adni őket.
3. Kérdezze meg az osztálytól, melyik formátumot és melyik koordináta-rendszert kéri. Sokan még mindig shapefile-t kérnek az állami síkkoordináta-rendszer helyi zónájában; az újabb rendszerek a GeoPackage-et fogadják el.

## Exportálás

1. Kattintson a **GIS** csoport {{ui:Exportálás}} gombjára.
2. A **Mit** részben jelölje be a küldendő típusokat. Mindegyik megmutatja, hány elemet tartalmaz; az üres típusok szürkén jelennek meg.
3. A **Formátum** részben válassza ki a formátumot.
4. Olvassa el a koordinátákra és mértékegységekre vonatkozó megjegyzéseket, majd kattintson a letöltés gombra. Az állapotsor megmondja, mi került bele, és mely mezőnevek lettek rövidítve.

A párbeszédpanelen található a magasságrács-export is ({{ui:Felület GeoTIFF magasságrácsként}}); lásd [Magasságrácsok és LiDAR](topic:elevation-grids-and-lidar).

## Az egyes típusok tartalma

| Típus | Alakzat | Mezők |
|---|---|---|
| Felmért pontok | Magassággal rendelkező pontok | `P` pontszám, `N` északi koordináta, `E` keleti koordináta, `Z` magasság, `D` leírás |
| Meglévő terep, illetve a szintezett felület szintvonalai | Adott magasságú vonalak | `ELEV` |
| Törésvonalak | Magassággal rendelkező vonalak | `NAME` |
| Felület határa | Poligon (a megrajzolt határ, különben a felület széle) | `NAME` |
| Nyomvonalak | Tengelyvonalak | `NAME`, `LENGTH`, `STA_START`, `STA_END` (a szelvényszámok egyszerű számként) |
| Tereplépcsők | Poligonok a tereplépcső magasságán | `NAME`, `ELEV`, `AREA` |
| Daylight-vonalak | Magassággal rendelkező vonalak (tereplépcsők és sávok) | `NAME` |
| Sáv jellemzővonalai | Magassággal rendelkező vonalak: tengely, burkolatszél, padka | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Csövek | Vonalak a felső fenékszinttől az alsóig | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (százalékban), `LENGTH`, `NETWORK` |
| Műtárgyak | Pontok a fedlapnál | `NAME`, `RIM`, `INVERT` (a legalacsonyabb csőfenék ott), `SUMP`, `DIA`, `DIA_UNIT` |
| Minden GIS-réteg | Ahogy importálva lett | Saját mezői |

A hosszak, szelvényszámok és magasságok a projekt mértékegységében vannak (US survey láb vagy méter). A cső- és műtárgyátmérők lábas projekteknél hüvelykben, méteres projekteknél milliméterben vannak; a `DIA_UNIT` jelzi, melyik.

## A formátumok

- **Shapefile**: egy `.zip` fájl, benne típusonként egy shapefile (`.shp`, `.shx`, `.dbf`), egy `.cpg`, amely megadja, hogy a szöveg UTF-8, és egy `.prj`, amely megnevezi a koordináta-rendszert. A magassággal rendelkező alakzatok a shapefile Z-típusaiként íródnak. A 10 karakternél hosszabb mezőneveket a formátum előírása szerint lerövidíti, az állapotsor pedig felsorolja őket.
- **GeoPackage**: egy `.gpkg` fájl, típusonként egy táblával, a koordináta-rendszer EPSG-kóddal tárolva. Egy fájl a sok helyett, a hosszú mezőnevek megmaradnak.
- **KML** vagy **KMZ** (tömörített KML): egy fájl szélességi és hosszúsági fokokkal a Google Earthhez és webes térképekhez, típusonként egy mappa, minden elem egy jelölő (placemark), amelyet a NAME mezőjéről neveznek el, minden mező kiterjesztett adatként; a magasságok méterben vannak (magassági mód: abszolút). A GeoJSON-hoz hasonlóan a projekt koordináta-rendszerét igényli.
- **GeoJSON**: egy fájl szélességi és hosszúsági fokokkal (a GeoJSON-szabvány mást nem enged), minden elem `kind` tulajdonsággal (`pipes`, `structures`, …), hogy a címzett szét tudja választani őket. A magasságok a szabvány szerint méterre vannak átalakítva; a projekt függőleges alapfelületén maradnak (a CivilCraft-ban nincs geoidmodell). Koordináta-rendszer nélküli projekt nem exportálhat GeoJSON-t, a párbeszédpanel pedig megmondja, miért.

## Rács, nem terep

A GIS-osztályok adataikat a koordináta-rendszer **rács**koordinátáiban tartják. Ha a projekt terep- vagy helyi koordinátákat használ (a {{ui:Koordináták}} beállításában), kiviteleskor minden koordináta visszaalakul rácsra: a fájlok számai a terv számaitól a méretarány-tényezővel térnek el (helyi rendszernél a forgatás miatt is). A pontmezők `N` és `E` szintén rácsértékeket tartalmaznak. A párbeszédpanel emlékeztet erre.

:::tip
Küldjön a fájlokhoz rövid megjegyzést: a koordináta-rendszert és annak EPSG-kódját, a magasságai függőleges alapfelületét, a mértékegységeket, és hogy melyik fájl mit tartalmaz.
:::

## Az ellenőrzések

- Minden kiírt fájlt visszaolvasott a GDAL, a könyvtár, amelyet a legtöbb GIS-program használ ezeknek a fájloknak az olvasására: minden alakzat, magasság és attribútum, az elemszámok, valamint a koordináta-rendszer EPSG-kódként (`.prj` és GeoPackage). Saját olvasóink ugyanazt az eredményt adják.
- A GeoJSON-fájlok az RFC 7946-ot követik: hosszúság áll a szélesség előtt, nincs `crs` tag, a külső gyűrűk az óramutató járásával ellentétesek, a lyukak az óramutató járásával megegyező irányúak; a pozíciók 2 mm pontossággal egyeztek a PROJ-jal (a PROJ vetítéskönyvtár).
- Egy terep-koordinátás projektet exportáltak, és minden pontot ellenőriztek a rácskoordinátáival.
- Ezt még nem nyitották meg más GIS-programokban. Az első átadásnál egyeztessen az osztállyal, mielőtt megbízna benne.
