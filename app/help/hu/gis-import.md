---
title: GIS-adatok importálása
summary: Shapefile, GeoJSON és GeoPackage fájlok betöltése a projektbe GIS-rétegként, elhelyezésük a megfelelő koordináta-rendszeren keresztül, attribútumaik megtekintése és felhasználásuk a felületen.
keywords: gis, elemek címkézése, attribútumok a terven, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, importálás, rétegek, attribútumok, koordináta-rendszer, epsg, szélességi fok, hosszúsági fok, szintvonalak, telkek, törésvonalak, határ
from: f6b235cc
---

A városi és megyei GIS-osztályok a helyszíni környezeti adatokat GIS-fájlokként adják ki: telkeket, szolgalmi jogokat, szintvonalakat, közműveket, felmérési alappontokat. A CivilCraft ezek közül háromféle fájlt megnyit **GIS-rétegként**, amelyek a terv alatt helyezkednek el.

| Fájl | Mit nyisson meg |
|---|---|
| Shapefile | A `.shp` fájlt a hozzá tartozó `.shx`, `.dbf`, `.prj` és `.cpg` fájlokkal együtt (jelölje ki mindet), vagy a beérkezett `.zip` fájlt. Több shapefile-t tartalmazó zip több réteget ad. |
| GeoJSON | A `.geojson` fájlt (a `.json` fájl is működik, ha első sorai `FeatureCollection` vagy `Feature` szót tartalmaznak). |
| GeoPackage | A `.gpkg` fájlt. Minden benne lévő elemtábla felsorolásra kerül. |
| KML vagy KMZ | A `.kml` fájlt (Google Earth-ből vagy webes térképről), vagy a tömörített `.kmz` fájlt. Minden mappából réteg lesz (ha többféle elemet tartalmaz, pontokra, vonalakra és poligonokra bontva); a jelölő neve, leírása és kiterjesztett adatai attribútumokká válnak. A magasságok méterben, szélességi és hosszúsági fokban vannak, akárcsak a GeoJSON-nál. |

A pontok, többpontos alakzatok, vonalak, lyukas poligonok és többrészes alakzatok beolvasásra kerülnek, a magasságaikkal (z) együtt, ha a fájl tartalmazza őket. Az M (mérési) értékek kimaradnak. A magasságrácsok és a LiDAR ugyanígy nyílnak meg: lásd [Magasságrácsok és LiDAR](topic:elevation-grids-and-lidar).

## Fájlok megnyitása

1. Kattintson a **GIS** csoport {{ui:Importálás}} gombjára (vagy a {{ui:Megnyitás}} gombra), válassza ki a fájlokat, vagy húzza őket a tervre. A fájlok ezen a számítógépen olvasódnak be; semmi nem töltődik fel.
2. A **GIS-adatok importálása** párbeszédpanel felsorolja az összes talált réteget: típusát, az elemek számát (és hogy hány elemnek nincs geometriája), a mezők számát és a fájl által megnevezett koordináta-rendszert. Törölje a jelölést azokról a rétegekről, amelyekre nincs szüksége.
3. Olvassa el a **Koordináta-rendszer** részt (lentebb), valamint a **Mi fog történni** sort, majd kattintson az {{ui:Importálás}} gombra.
4. A rétegek megjelennek a terven és a bal oldali panelen a **GIS-rétegek** alatt. Az importálás egy lépés: a {{key:Mod+Z}} visszavonja.

Nagy fájl betöltésekor a terv fölött folyamatsor jelenik meg, rajta egy {{ui:Mégse}} gombbal.

## A koordináta-rendszer

A GIS-fájlok koordináta-rendszeren keresztül adják meg, hol vannak (a shapefile `.prj` fájlja, a GeoPackage térbeli hivatkozási táblája; a GeoJSON mindig szélességi és hosszúsági fokban van). A CivilCraft az egyes rétegeket a saját rendszerükből a projekt rendszerébe alakítja át. Soha nem találgat:

- **A projektnek van koordináta-rendszere** (a {{ui:Koordináták}} beállításában): minden saját rendszerrel rendelkező réteg átalakul ebbe, a terep- vagy helyi igazítással együtt. A `.prj` nélküli fájl két választást kap: **Megegyezik a projekttel** (a számai változatlanul töltődnek be) vagy **A fájl rendszerének kiválasztása**.
- **A projektnek nincs koordináta-rendszere, a fájl pedig vetített rendszerben van a projekt mértékegységeiben** (például állami síkkoordináta-zóna US survey lábban egy lábas projekthez): a párbeszédpanel felajánlja a **Ezt a rendszert használja a projekt koordináta-rendszereként** lehetőséget. Ez az importálással egy visszavonási lépésben kerül beállításra. A projekt nem mozdul; a rendszer csak azt mondja meg, mit jelentenek a számok. Helyette a projekthez másik rendszert is választhat, és a rétegek abba alakulnak át.
- **A projektnek nincs koordináta-rendszere, a fájl pedig szélességi és hosszúsági fokban van** (minden GeoJSON), **vagy más mértékegységekben**: az {{ui:Importálás}} gomb szürke marad, amíg ki nem választja a projekt koordináta-rendszerét. A kiválasztó az adatok közelében indul.
- **Sem a projekt, sem a fájlok nem neveznek meg rendszert**: a számok változatlanul töltődnek be, és a párbeszédpanel ezt jelzi.

A magasságok is átalakulnak: a GeoJSON-magasságok méterben vannak (ezt a GeoJSON-szabvány mondja ki); más fájlok magasságait a saját rendszerük mértékegységében veszik.

:::warning
Egy GeoJSON-fájl azon pozíciói, amelyek a ±180° hosszúsági vagy ±90° szélességi tartományon kívül esnek, nem szélességi és hosszúsági fokok. Ezek az elemek kimaradnak, és a párbeszédpanel megmondja, hány. Az ilyen fájl általában vetített fájl, amelyet rendszer nélkül mentettek; kérje újra, vagy kérje a shapefile-t a `.prj` fájljával együtt.
:::

A NAD83-at a WGS 84-gyel azonosnak kezeli (ezt használja a GeoJSON). A kettő Észak-Amerikában néhány méterrel tér el, így a GeoJSON-adatok ekkora mértékben eltérhetnek. Ahol a legjobb eltolás rácsfájlt igényel (például a NAD27-hez a NADCON), a CivilCraft egy durvább, közzétett eltolást használ, és a koordináta-rendszer párbeszédpanel megmutatja, mennyire durva (a NAD27-nél körülbelül 20 m), amíg hozzá nem adja a rácsot: lásd [Rácseltolási fájlok](topic:coordinate-systems).

## GIS-rétegek

A **GIS-rétegek** alatti minden sornak van:

- egy jelölőnégyzete a réteg megjelenítéséhez vagy elrejtéséhez (az elrejtett rétegek a kijelölésben sem vesznek részt);
- színe, a listából választva;
- egy menüje (a három pont), amelyben: {{ui:Nagyítás rá}}, {{ui:Felhasználás a felülethez…}}, {{ui:Átnevezés…}} és {{ui:Eltávolítás}}.

A megjelenítés, elrejtés, újraszínezés, átnevezés és eltávolítás visszavonható lépések. A GIS-rétegek a projektfájlba mentődnek, és megnyitáskor visszajönnek. A terv PDF-plottjában, valamint a DXF- és DWG-exportokban is megjelennek, mindegyik `GIS-` nevű és sorszámú rétegen.

## Elemek címkézése egy attribútumból

A réteg {{ui:Továbbiak}} menüjében (a három pont a **GIS-rétegek** alatt) válasszon mezőt a **Címkézés ezzel** alatt: minden elem a terven megmutatja az értékét, a réteg színében. A pontok a pont mellett kapnak címkét, a vonalak leghosszabb részük közepe mentén (balról jobbra olvashatóan elforgatva), a poligonok a közepükön. A számok három tizedesjegyig jelennek meg. A címkék papíron, bármilyen méretarányban 1,8 mm magasak, és bekerülnek a PDF-plottba, a DXF- és DWG-fájlokba. A **Nincs címke** választásával eltávolíthatja őket; minden változtatás egy lépés ({{key:Mod+Z}} visszavonja). Egy réteg legfeljebb 5 000 elemet címkéz.

## Elem megtekintése

Ha a {{ui:Kijelölés}} be van kapcsolva, kattintson egy elemre. A **Tulajdonságok** megmutatja a rétegét, hogy melyik elem ez, az alakzatát (részek, lyukak, csúcsok), a magasságait, a forrásfájlt és annak koordináta-rendszerét, majd az összes attribútumot egy táblázatban. Az attribútumok csak olvashatók: a CivilCraft a GIS-adatokat úgy mutatja, ahogy érkeztek, nem szerkeszti őket.

Ha a mutató alatt pont és vonal is van, a pont nyer; poligonon belül a legkisebb poligon lesz kiválasztva.

## Felhasználás a felülethez

Nyissa meg a réteg menüjét, és válassza a {{ui:Felhasználás a felülethez…}} lehetőséget (vagy a **Tulajdonságok** gombját). A felajánlott lehetőségek a rétegtől függenek:

| Réteg | Ebből lehet |
|---|---|
| Magassággal rendelkező vonalak (3D-s vonalak) | Törésvonalak a saját magasságukon |
| Magasság nélküli vonalak, de számmezővel (szintvonalak) | Törésvonalak a kiválasztott mező magasságán |
| Poligonok | A felület határa (a kijelölt poligon, különben a legnagyobb), vagy törésvonalak a széleik mentén |
| Magassággal rendelkező pontok, vagy magassági mezővel | Felmért pontok, a réteg nevével leírva, így ponthalmazt alkotnak |

Minden felhasználás egy visszavonási lépés, amely a geometriát a projektbe másolja; maga a réteg változatlan marad. A magasságok a projekt mértékegységében kerülnek át.

## Szélességi és hosszúsági fokos pontfájlok

Az olyan pontfájl, amelynek fejléce **szélesség** és **hosszúság** oszlopot nevez meg (`lat`, `latitude`, `lon`, `long`, `longitude`), fokokban olvasódik, nem északi és keleti koordinátaként. Az importálási párbeszédpanel ezt jelzi. Az {{ui:Importálás}} gombra a pontok a projekt koordináta-rendszerébe alakulnak; ha a projektnek nincs ilyen, előbb kéri a kiválasztását. A fokok soha nem töltődnek be lábként. A ±90°-os szélességi vagy ±180°-os hosszúsági tartományon kívül eső sorok az okuk megjelölésével elutasításra kerülnek. A magasságoszlop változatlanul, a projekt mértékegységében kerül át.

## LandXML-fájlok, amelyek koordináta-rendszert neveznek meg

Ha a megnyitott LandXML-fájlban van `CoordinateSystem` elem (EPSG-kód, WKT-leírás vagy rendszernév), a CivilCraft felajánlja azt a projekt koordináta-rendszereként. Az elfogadásnál semmi nem mozdul; a rendszer csak azt mondja meg, mit jelentenek a számok.

## Az ellenőrzések

- Minden olvasót összehasonlítottak a GDAL-lal, a könyvtárral, amelyet a legtöbb GIS-program használ ezeknek a fájloknak az olvasására. A GDAL által írt fájlokon vizsgáltak: minden típusú shapefile magassággal és anélkül, többrészes vonalak, lyukas poligonok, üres geometriák, szöveges, szám-, dátum- és igaz/hamis attribútumok, UTF-8 és Windows-1252 szöveg `.cpg` fájllal és anélkül, több shapefile-t tartalmazó zip, minden geometriatípusú GeoJSON, valamint négy táblát tartalmazó GeoPackage. Minden geometria, magasság és attribútum egyezett.
- A szélességi és hosszúsági fokból, valamint UTM-ből átalakított pozíciók 3 mm pontossággal egyeztek a PROJ-val (a GDAL mögötti vetítéskönyvtár).
- A sérült fájlok (csonkák, hamis méretekkel, hibás zipek, hibás GeoPackage-ek) egyetlen egyszerű üzenetet adnak; semmi nem akad meg.
- Ezt még nem nyitották meg más GIS-programokban. A fájlgeodatabase-ek, a KML és a KMZ pedig még nem olvashatók (lásd [Még nincs elkészítve](topic:not-built-yet)).
