---
title: A projekt koordináta-rendszerének beállítása
summary: Adja meg, melyik koordináta-rendszerben van a felmérés, hogy a CivilCraft megjelenítse a szélességi és hosszúsági fokot, elhelyezze a GIS-fájlokat és a térképrétegeket, és .prj fájlokat írjon. Kiválasztás kód, név, maguk a koordináták vagy egy .prj fájl alapján történhet.
keywords: koordináta-rendszer, crs, epsg, srid, állami vetület, spcs, utm, nad83, wgs 84, vetület, prj, wkt, alapfelület, szélesség, hosszúság, lat long, földrajzi, rács, georeferencia, georeferálás, koordináta-rendszer hozzárendelése
from: 964250e2
---

A projekt koordinátái egyszerű számok, amíg meg nem adja, mit jelentenek. A koordináta-rendszer beállítása **soha nem mozgat semmit**: azt mondja meg a CivilCraftnak, hogy például az E 6 150 000 N 2 080 000 koordináták a kaliforniai 6. zóna állami síkkoordinátái US survey feet mértékegységben. Ha ez megvan:

- az állapotsor megmutatja a mutató szélességi és hosszúsági fokát,
- a más rendszerű GIS-fájlok (shapefile, GeoJSON, GeoPackage, magassági rácsok, LiDAR) megnyitáskor átkerülnek a projektbe,
- térképrétegek rajzolhatók a terv alá ([Térképrétegek megjelenítése a terv alatt](topic:map-layers)),
- a GIS-formátumokba való exportok hordozzák a rendszert (shapefile esetén egy `.prj`, GeoPackage és GeoTIFF esetén az EPSG-kód).

## A rendszer kiválasztása

1. Válassza a {{ui:Koordináták}} gombot az eszköztár {{ui:GIS}} csoportjában. Megnyílik a **Koordináta-rendszer** párbeszédpanel. Tetején látható, mi a projekt jelenlegi rendszere, vagy a **Nincs — a koordináták csak számok** üzenet.
2. Keresse meg a rendszert az alábbi módok egyikével:
   - **Keresés**: írja be az EPSG-kódot (`2277`, `EPSG:2277`) vagy a név szavait (`texas central`, `utm 14n`, `lambert-93`). A kódok a beírttól kezdve listázódnak; a szavak azokat a rendszereket listázzák, amelyek nevében minden szó szerepel.
   - {{ui:Ezekbe a koordinátákba illő rendszerek}} (ha a projektben vannak pontok vagy felület): a CivilCraft a projekt közepét a projekt mértékegység-családjának minden rendszerében leolvassa, és listázza azokat, amelyek felhasználási területe magában foglalja. Az állami síkkoordináták általában csak néhány zónába illenek: egy texasi projekt E 3 115 000 N 10 070 000 US survey feet értékkel a négy Texas Central változatba illik (NAD83, NAD83(2011), HARN, NSRS2007). Minden bejegyzés megmutatja, hol lenne a projekt közepe.
   - **Közel (szélesség, hosszúság)** és {{ui:Javaslat}}: írja be, hol van a telek, például `30.27, -97.74` vagy `30°16′N 97°44′W`, és a CivilCraft listázza a vetített rendszereket, amelyek területe magában foglalja, előbb az országos és állami rácsokat.
   - {{ui:Egy .prj fájl beolvasása…}}: nyissa meg a shapefile-hoz vagy rajzhoz tartozó `.prj` fájlt. A CivilCraft a vetítési számítás alapján párosítja a listájával (így az a `.prj` fájl is megtalálja a helyes rendszert, amely az alapfelületet másként nevezi), és megmondja, melyik ez; ha semmi nem egyezik pontosan, a fájl saját leírása kerül felhasználásra. A `.prj` fájlt a párbeszédpanelre húzhatja, vagy magában a terven nyithatja meg vagy húzhatja rá.
3. Kattintson a listában egy rendszerre. A **Kiválasztva** alatt megjelenik a neve, EPSG-kódja, mértékegysége, az alapfelületének WGS 84-hez való kötöttsége, felhasználási területe szélességi és hosszúsági fokban, valamint az, hogy hol esik a projekt közepe benne.
4. Hagyja kijelölve a **Rács** lehetőséget (a legtöbb projektnél; a többi esetről lásd: [Talaj- és helyi koordináták](topic:ground-and-local-coordinates)), és válassza az {{ui:Alkalmaz}} gombot.

Az állapotsor most a mutató szélességi és hosszúsági fokát mutatja az E és N értékek mellett. A rendszer beállítása egy visszavonási lépés: a {{key:Mod+Z}} visszavonja.

:::note
A mértékegységeknek egyezniük kell: láb mértékegységű projekthez US survey feet vagy nemzetközi láb rendszer tartozik, méteres projekthez méteres rendszer. A CivilCraft megindokolja az elutasítást („A projekt lábban van, de ez a rendszer méterben van…”). Láb mértékegységű projektnél egy US survey láb rendszer esetén survey lábat használ: a projekt „ft” jelentése a rendszer lába. A földrajzi rendszerek (szélesség és hosszúság, például maga a WGS 84) nem lehetnek a projekt rendszerei: a rajzokhoz keleti és északi koordináták kellenek.
:::

## A rendszer megváltoztatása vagy eltávolítása

Nyissa meg újra a {{ui:Koordináták}} párbeszédpanelt, válasszon másik rendszert, és válassza az {{ui:Alkalmaz}} gombot. Ha a projektben vannak pontok vagy tervek, a CivilCraft megkérdezi: **A koordináták már a(z) … rendszerben vannak?**

- {{ui:Igen — semmi sem mozdul}}: a számok maradnak, csak a jelentésük változik. Akkor használja, ha a régi rendszert tévedésből választotta.
- {{ui:Nem — számítsa át őket}}: minden felmérési pont, töréselem, határ, nyomvonal PI-pontja, tereplépcső sarka és műtárgy átkonvertálódik a régi rendszerből az újba, egy visszavonási lépésben. A LandXML-ből háromszögekként beolvasott felület nem konvertálható; előbb építse újra a pontokból.

Az {{ui:A rendszer eltávolítása}} elveszi a rendszert (semmi sem mozdul). A projektben már meglévő GIS-rétegek a helyükön maradnak.

## Szélesség és hosszúság az állapotsorban

Amíg a projektnek van rendszere, az állapotsor a mutató szélességi és hosszúsági fokát mutatja a WGS 84-en, például `30°18′00.00″ N  97°42′00.00″ W` formában. Tizedes fokokat a {{ui:Beállítások}} alatt, a {{ui:CivilCraft}} csoportban, a **Szélesség és hosszúság** beállításnál választhat ([CivilCraft beállításai](topic:settings)). Talaj- vagy helyi koordináták esetén a kiolvasás előbb ezt a lépést végzi el, így a mutató alatti pontra helyes értéket mutat.

## Az alapfelület-eltolás pontossága

A szélesség, hosszúság, GeoJSON és térképrétegek mind WGS 84-en vannak. A párbeszédpanelben minden rendszer WGS 84-hez való kötése látható:

| A párbeszédpanel szövege | Mit jelent |
|---|---|
| WGS 84 maga | Nincs eltolás. |
| NAD83-at WGS 84-nek veszik | A kettő Észak-Amerika legtöbb részén egy-két méterrel tér el, legfeljebb néhány méterrel. Térképrétegekhez és helyszíni kontextushoz jó, geodéziai alappontokhoz nem. |
| Körülbelül *n* m (az EPSG értéke) | Közzétett eltolás; a térképrétegek és a GeoJSON ekkora mértékben lehet pontatlan. |
| Ehhez az alapfelülethez nincs ismert eltolás | Rácsfájl nélkül nincs közzétett eltolás: a térképrétegek és a GeoJSON akár több száz méterrel is eltérhet. |
| A rácseltolási fájlból … | Rácseltolási fájl van használatban (lentebb): a rácson belül körülbelül 10 cm-en belül van a NAD83-hoz képest. |

A projekt saját koordinátái soha nem mennek át alapfelület-eltoláson: csak az, ami szélességi és hosszúsági fokká, vagy onnan vissza konvertálódik. A magassági alapfelületeket és a geoidmodelleket nem kezeli a program (a magasságok soha nem konvertálódnak). Ahol a legjobb eltoláshoz rácsfájl kell, a lista egy durvább közzétett eltolást tartalmaz, és a párbeszédpanel megmutatja annak pontosságát (például a NAD27-rendszerek esetében körülbelül 20 m), amíg a rácsot nem adja hozzá.

## Rácseltolási fájlok

NAD27-rendszer esetén a koordináta-rendszer párbeszédpanelen a **Rácseltolási fájl** a szélességet, hosszúságot, GIS-fájlokat és térképrétegeket körülbelül 10 cm-en belülre hozza a NAD83-hoz, nem pedig körülbelül 20 m-re:

- **Letöltés**: a rendszer területéhez javasolt rácsot (NADCON5 az Egyesült Államok szomszédos államaira, NADCON Alaszkára, NTv2 Kanadára) a cdn.proj.org-ról, a PROJ nyilvános rácsszerveréről. Csak a rács fájlneve kerül elküldésre.
- Vagy a **Rácsfájl hozzáadása…**, ha már megvan: NTv2 (`.gsb`) vagy PROJ GeoTIFF rács (`.tif`), legfeljebb 20 MB.

A rács a projektfájlba mentődik, így a projekttel együtt utazik. A szakasz megmondja, hogy a projekt közepe a rácson belül van-e: a rácson kívül egyáltalán nincs eltolás, ezért olyan rácsot használjon, amely lefedi a telket. A **Rács használatának leállítása** visszaállítja a durva eltolást. Minden változtatás egy lépés: a {{key:Mod+Z}} visszavonja.

A projektben már meglévő GIS-rétegek a rács változásakor a helyükön maradnak; importálja őket újra, hogy a rácson keresztül kerüljenek elhelyezésre. A projekt saját koordinátái soha nem mozdulnak.

## Mit ellenőriztek

- Minden konverziót összevetettek a PROJ-jal (pyproj 3.7.1, PROJ 9.5.1), a legtöbb GIS-program által használt koordinátakönyvtárral, több mint 330 rendszeren: állami síkkoordináták US survey feet és láb mértékegységben, UTM észak és dél, Lambert-93, British National Grid, GDA2020 MGA, új-zélandi Transverse Mercator és webes Mercator többek között. A keleti és északi koordináták azonos alapfelület-eltolással 1 cm-en belül egyeznek (a legtöbb jóval 1 mm alatt), a vetítési számítások pedig 1 cm-en belül egyeznek a PROJ saját definícióival.
- A PROJ által írt `.prj` fájlokat mindkét gyakori formában (ESRI és OGC) visszaolvasták 105 rendszerre: a 210-ből 208 egyezett a pontos EPSG-kóddal, a másik kettő pedig ugyanazon az ellipszoidon, ugyanazt a számítást használó rendszerrel. A CivilCraft által írt `.prj` fájlokat a PROJ ugyanazként a rendszerként olvassa. A poláris sztereografikus rendszerek (UPS, alaszkai poláris) ESRI `.prj` fájljai nem olvashatók; ezeket kóddal válassza ki.
- Az állapotsor szélességi és hosszúsági értékei a böngészőben 0,01″-en belül egyeztek a PROJ-val.
