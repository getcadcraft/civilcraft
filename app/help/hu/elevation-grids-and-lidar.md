---
title: Magassági rácsok és LiDAR
summary: A meglévő terep felépítése DEM-ből (GeoTIFF vagy ASCII-rács) vagy LiDAR-pontokból (LAS, LAZ) — terület kiválasztása, az adatok ritkítása, osztályok megjelölése és a magasság-mértékegységek ellenőrzése —, majd a felület visszaadása GeoTIFF magassági rácsként.
keywords: dem, dtm, magassági rács, geotiff, tif, ascii rács, asc, lidar, las, laz, pontfelhő, osztályok, terep, ritkítás, nodata, raszter, geotiff exportálás, gis
from: c8b2d18a
---

A nyilvános magassági adatok kétféleképpen érkeznek: **magassági rácsok** (DEM: cellánként egy magassági érték, általában GeoTIFF `.tif` vagy ASCII-rács `.asc` formában) és **LiDAR-pontok** (millió lézeres visszaverődés egy `.las` fájlban, tömörítve `.laz` formában). A CivilCraft mindkettőt a böngészőben alakítja mérési pontokká vagy felületté: semmi nem töltődik fel.

## A fájl megnyitása

1. Kattintson a {{ui:Megnyitás}} gombra (vagy a GIS csoport {{ui:Importálás}} gombjára), válassza ki a fájlt, vagy húzza a terven. ASCII-rácsnál válassza ki a `.prj` fájlt is, hogy a CivilCraft ismerje a koordinátarendszerét.
2. Az importálási párbeszédpanel megmutatja, mit mond a fájl magáról: méretét, celláit vagy pontjait, koordinátarendszerét, szélesség- és hosszúsági fokban mért helyét, valamint magassági tartományát. LiDAR esetén először minden pontot végigolvas, hogy megszámolja az **osztályokat** (folyamatjelző mutatja az előrehaladást; a {{ui:Mégse}} gomb megállítja).

Egy három vagy négy sávos (vörös, zöld, kék) GeoTIFF kép, nem magassági adat: helyette a térképrétegekbe kerül.

## Mit hozzon be

- **Terület**: {{ui:A projekt kiterjedése és egy ráhagyás}} (adja meg a ráhagyást), {{ui:Amit az alaprajz most mutat}} vagy {{ui:A teljes fájl}}. A fájlnak csak ez a része olvasódik be.
- **Ritkítás**: a kapott pontok közötti távolság a projekt mértékegységeiben. A beállítások alatti sor azt mutatja, hány pont lesz ebből, ahogy gépel. Rácsnál a CivilCraft minden második, harmadik … cellát megtartja, így a magasságok pontosan a fájl értékei maradnak; cellákat soha nem átlagol. LiDAR-nál a területet ekkora négyzetekre osztja, és négyzetenként egy pontot tart meg: {{ui:A cella középpontjához legközelebbi pont}} (alapértelmezés), {{ui:A cella legalacsonyabb pontja}} (jó, ha a fájlban nincs talajosztály: a talaj a fák alatt van), vagy {{ui:A cella pontjainak átlaga}}.
- **Osztályok** (LiDAR): a talaj (2. osztály) be van jelölve, ha a fájl tartalmazza; az épületek, a fák és a zaj kimaradnak. Ha nincs talajosztály, minden osztály be van jelölve, és a párbeszédpanel ezt jelzi.
- **Talaj** (LiDAR, 0.8): a drónfelhőnek nincs talajosztálya. Ha a fájlban nincs ilyen, a párbeszédpanel a {{ui:A terep megkeresése (drónfelhők, nincs tereposztály)}} beállítással indul: minden osztály beolvasódik a zaj kivételével, cellánként a legalacsonyabb pont marad meg, majd a CivilCraft egy szabályozható, progresszív morfológiai szűrővel (Zhang és mások, 2003) kiveszi az épületeket, a fákat és a kóbor alacsony pontokat. Szabályozható: **Kivehető legnagyobb objektum** (a legnagyobb épület szélessége; az ablakok addig nőnek, amíg le nem fedik; 0 esetén 20 cella) és a **Legmeredekebb terepesés**. A munka a legalacsonyabb pontok rácsán történik, így tízmillió pontos felhő feldolgozása nem kerül többe, mint a cellák száma (a ritkítás egyetlen folyamatos olvasási menet). A távolság a cella mérete: a nagyobb cella gyorsabb, és a kis tárgyakat kevésbé hagyja ki, mint gondolná; a kisebb több talajrészletet tart meg. A jelentés megmondja, hány pont maradt talajként, hány cellát vettek ki objektumként és hány kóbor alacsony pontot dobtak el. Egy kitalált, 300 m-es drónfelmérésen, öt épülettel, 70 fával és 200 alacsony kiugró ponttal a megtartott pontok 3 cm-en belül estek a valódi terephez, és egyetlen tető vagy lombkorona sem maradt meg.
- **Magasságok a fájlban**: méter, láb vagy US survey láb. Ha a fájl megmondja, a mértékegység már ki van választva. Ha nem, Önnek kell választania: a párbeszédpanel mindkét módon megmutatja a magassági tartományt, hogy lássa, melyik illik a helyszínhez.
- **Importálás mint** (csak rácsnál): {{ui:Mérési pontok (leírás: DEM)}} vagy {{ui:Maga a felület (háromszögháló)}}.

Egy importálás legfeljebb 500 000 pontot hozhat be. Ha egy választás ennél többet adna, a párbeszédpanel megmondja, mennyivel, és milyen távolság férne bele; az {{ui:Importálás}} gomb ilyenkor inaktív marad.

Kattintson az {{ui:Importálás}} gombra. Folyamatjelző mutatja az olvasást; a {{ui:Mégse}} gomb megállítja, és semmi nem változik.

:::warning
A függőleges mértékegységek gyakori csapdák. Sok síkvetületi DEM kelet- és északi koordinátái lábban vannak, de a magasságai méterben. Vesse össze a párbeszédpanel tartományát azzal, amit a helyszínről tud.
:::

## Mit kap

- **Mérési pontok**: a legmagasabb pontszámuk után számozva, leírásuk `DEM` (rács) vagy `LIDAR`, így egy ponthalmazt alkotnak a **Pontok** alatt, és ugyanúgy építenek belőlük felületet, mint bármely más pontból. Az importálás egy lépés: a {{key:Mod+Z}} újra kiveszi őket.
- **Maga a felület**: rácsos TIN, cellánként két háromszöggel, a délnyugat–északkelet átlón osztva. Az a háromszög, amelynek sarka nem tartalmaz adatot, kimarad, így az adathiányok lyukak maradnak. A felület minden rácspontban egyezik a ráccsal, és a háromszögeken belül sík. Ez felváltja a projekt felületét (a párbeszédpanel előbb kérdez); a {{key:Mod+Z}} visszahozza az előző felületet. A bal panel fejléce a **Felület (magassági rácsból)** feliratot mutatja.

## Koordinátarendszerek

- Ha a projektnek van koordinátarendszere, a fájl pedig másikat nevez meg, minden pont a projekt rendszerére konvertálódik (és a terep- vagy helyi koordinátáira is, ha vannak ilyenek).
- Ha a projektnek nincs koordinátarendszere, a fájl rendszere pedig a projekt mértékegységében van (láb vagy méter), a párbeszédpanel felajánlja, hogy ez legyen a projekt koordinátarendszere, a pontokkal azonos visszavonási lépésben.
- Ha a fájl szélesség- és hosszúsági fokban van, vagy méterben egy lábas projekthez, a párbeszédpanel előbb kéri a projekt koordinátarendszerének kiválasztását.
- Ha a fájl nem mondja meg, számait a projekt koordinátáinak veszik. A fájl rendszerét is kiválaszthatja.

## Felület exportálása GeoTIFF-ként

1. Kattintson a GIS csoport {{ui:Exportálás}} gombjára.
2. A GeoTIFF részben válassza ki a felületet (meglévő terep vagy a kialakított felület) és a cellaméretet. Az alapértelmezés a felület átlagos háromszög-élhosszából jön. A párbeszédpanel mutatja a kiírandó rács méretét.
3. Kattintson a {{ui:GeoTIFF letöltése}} gombra.

A fájl egy sáv, 32 bites lebegőpontos magasságokból áll a projekt mértékegységeiben, a felület kiterjedésén belül; a felületen kívüli cellák „nincs adat” értékűek (−3.4028235e38). Minden cella értéke a felület magassága a cella középpontjában. A koordináták **rácskoordináták**: a terep- vagy helyi koordinátákban lévő projekt vissza lesz konvertálva rácskoordinátákra. A fájl a projekt koordinátarendszerét EPSG-kódjával nevezi meg; EPSG-kód nélküli rendszer nem íródik ki, és a párbeszédpanel figyelmeztet, hogy közölje a GIS-osztállyal, melyik rendszerről van szó.

## Mi lett ellenőrizve

- A GeoTIFF- és ASCII-rács-olvasókat a GDAL-lal ellenőriztük (a rasterio-n keresztül), a könyvtárral, amelyet a legtöbb GIS-program használ ezek olvasására: 32 bites lebegőpontos és 16 bites egész rácsok, csempézett és csíkos elrendezés, DEFLATE és LZW tömörítés, nodata, skála és eltolás, pixel-is-point, UTM-rács, US survey lábas síkvetületi rács és szélesség-hosszúsági rács: minden érték egyezett.
- A LAS- és LAZ-olvasókat a laspy-jal ellenőriztük: LAS 1.2 és 1.4, a 0, 1, 3, 6, 7 és 8 pontformátumok, koordinátarendszerrel és anélkül, valamint a LASzip-kompatibilis háttérrel írt LAZ: minden pont egyezett.
- A konvertált koordinátákat 1 mm pontossággal ellenőriztük a PROJ-hez képest.
- A kiírt GeoTIFF-eket a GDAL visszaolvasta: koordinátarendszer, cellapozíciók, nodata, mértékegységek, és a felület értékei 0,0001 pontossággal egyeztek.
- Itt semmit nem nyitottunk meg más GIS- vagy CAD-programban.

## Még nincs kész

- Függőleges adatum-váltás (geoid-modellek): a magasságokat úgy használjuk, ahogy a fájl tartalmazza.
- Hullámforma-adatok, a LiDAR-visszaverődések az osztályon kívül, színek és intenzitások.
- Több sáv, áttekintő szintek vagy 200 MB-nál nagyobb fájlok.
- LAS vagy LAZ írása felületből vagy ebből az eszközből (a [Pontfelhők](topic:point-clouds) bővítmény írja a tisztított felhőt LAS 1.4 vagy LAZ formátumban).
