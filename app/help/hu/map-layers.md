---
title: Térképrétegek megjelenítése a terv alatt
summary: Georeferált kép, térképcsempék, WMS- vagy WMTS-szerver vagy térképszolgáltatás a terv alá helyezése helyszíni kontextusként, az internetes beállítással, átlátszatlansággal, sorrenddel és forrásmegjelöléssel.
keywords: térképrétegek, alaptérkép, háttér, légifelvétel, ortofotó, képalkotás, műholdkép, raszter, world file, pgw, jgw, tfw, wld, geotiff, georeferált kép, xyz, csempék, wms, wmts, getcapabilities, térképszolgáltatás, rest, mapserver, imageserver, usgs, national map, forrásmegjelölés, átlátszatlanság
from: 32d7718e
---

A térképrétegek a tervezés alatt megjelenített képek: egy légifelvétel a world file-jával, vagy térképek internetes szerverekről. Csak képernyőn jelennek meg helyszíni kontextusként: **nincsenek** a PDF-kiíratásokban, DXF- vagy DWG-exportokban, sem a 3D-nézetben.

Válassza a {{ui:Térkép}} gombot a {{ui:GIS}} csoportban. A **Térképrétegek** párbeszédpanel listázza a projekt rétegeit, és új rétegeket ad hozzá. A térképrétegekhez a projekt koordináta-rendszere kell ([A projekt koordináta-rendszerének beállítása](topic:coordinate-systems)), kivéve azt a képet, amelynek world file-ja a projekt saját koordinátáit használja.

## Az internetes beállítás

A CivilCraft addig nem kér semmit a térképszerverektől, amíg Ön nem engedélyezi: {{ui:Beállítások}}, {{ui:CivilCraft}}, **Térképrétegek az internetről**: **Ki** (kezdéskor) vagy **Be**.

:::note
Bekapcsolva a CivilCraft a hozzáadott térképszerverektől kér képeket a képernyőn látható területről. A rajza ezen a számítógépen marad; a szerver látja a területet és az Ön internetcímét.
:::

Kikapcsolt állapotban az internetes rétegek a párbeszédpanelen szürkén, az okkal együtt szerepelnek, és semmi nem rajzolódik ki, és semmi nem kérődik le. Olyan projekt megnyitása, amely térképszervereket nevez meg, szintén nem keresi fel őket. Fájlból származó kép mindkét esetben működik. A párbeszédpanel {{ui:Beállítások megnyitása}} gombja odavisz.

## Georeferált kép (offline működik)

1. Az **Új réteg hozzáadása** alatt hagyja a **Georeferált kép** lehetőséget, és válassza ki a fájlokat: a képet (PNG vagy JPEG) **és** a hozzá tartozó world file-t (PNG esetén `.pgw`, JPEG esetén `.jgw`, vagy `.wld`), és ha van, a `.prj` fájlt is. A tervre húzva együtt is áthelyezheti őket.
2. `.prj` nélkül a CivilCraft megkérdezi, melyik rendszert használja a world file: {{ui:A projekt rendszere}} (a leggyakoribb), {{ui:Rendszer kiválasztása…}}, vagy rendszer nélküli projektben a **Projekt koordinátái**.
3. A kép megjelenik a terv alatt, és az {{ui:Illesztés}} magába foglalja.

Egy RGB GeoTIFF (légifelvétel GeoTIFF-ként mentve) saját elhelyezéssel és rendszerrel rendelkezik: külön nyissa meg. A kép a **projektfájlon belül** tárolódik (legfeljebb 25 MB); a nagyobbat a mérete miatt elutasítja, ezért mentsen kisebb másolatot (kevesebb képponttal vagy JPEG-ként).

## Csempék, WMS, WMTS és térképszolgáltatások

Először kapcsolja be a **Térképrétegek az internetről** beállítást. Ezután az **Új réteg hozzáadása** alatt:

| Forrás | Mit illesszen be | Mit csinál a CivilCraft |
|---|---|---|
| Csempe URL | Sablon `{z}`, `{x}` és `{y}` (vagy `{-y}`), és `{s}` a szerverbetűhöz, például `https://tile.example.org/{z}/{x}/{y}.png`. Adjon nevet és forrásmegjelölést. | A képernyőn látható területnek és nagyításnak megfelelő csempék web Mercator vetületben. |
| WMS-szerver | A szerver címe, vagy a GetCapabilities-hivatkozása. Válassza a {{ui:Rétegek lekérése}} gombot, majd a réteget. | Egy kép a képernyőn látható területről, a projekt EPSG-kódjával kérve, ha a szerver kínálja; különben web Mercatorban vagy WGS 84-ben. |
| WMTS-szerver | A szerver címe, vagy a `WMTSCapabilities.xml`. Válassza a {{ui:Rétegek lekérése}} gombot, majd a réteget és a csempemátrix-készletet. | Csempék a készletből, a projekt rendszerében, ha van ilyen; különben web Mercatorban. |
| ArcGIS térképszolgáltatás (REST) | `/MapServer` vagy `/ImageServer` végű URL. Válassza a {{ui:A szolgáltatás beolvasása}} gombot. | A gyorsítótárazott web Mercator szolgáltatásokat a csempéikből rajzolja; a többit a képernyőn látható területről egyetlen képként kéri. |

Nincs előre beállított szerver. Nyilvános példák, mind az USGS National Map-ből (közkincs):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Térképszolgáltatás: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (a légifelvételekhez `USGSImageryOnly` is)

Sok város- és megyei GIS-osztály publikál saját WMS-t vagy térképszolgáltatást; a GIS-oldalaik megadják a címet. Az a szerver, amely bejelentkezést vagy kulcsot kér, nem működik: a CivilCraft nem küld felhasználóneveket, jelszavakat vagy kulcsokat.

## Hogyan rajzolódnak ki a rétegek

- A projekt rendszerétől eltérő rendszerű képek átvetődnek: a képet darabokra vágja, és mindegyiket úgy helyezi el, hogy a pontos átszámítás szerinti helytől a képernyő negyed képpontján belül legyen.
- A csempéket a képernyőn látható területhez és nagyításhoz választja: nézetenként legfeljebb 64, egyszerre 6 darab. Panorámázáskor vagy nagyításkor a régi nézetre vonatkozó kérések törlődnek. Körülbelül 200 csempe marad a memóriában (lemezre semmi nem mentődik).
- Egy WMS- vagy térképszolgáltatás-képet azután kér, hogy a nézet megállt; addig az utolsó kép marad a helyén.
- Minden réteg forrásmegjelölése kicsiben jelenik meg a terv jobb alsó sarkában.

## Rétegek módosítása, sorrendje és eltávolítása

A párbeszédpanelen minden rétegnek van egy jelölőnégyzete a megjelenítéshez vagy elrejtéshez, egy **Átlátszatlanság** csúszkája, nyilak a korábbi (alsóbb) vagy későbbi (felsőbb) rajzoláshoz, egy nagyítás gombja (képekhez), és egy eltávolítás gombja. A lista első rétege van legalul. Minden módosítás egy visszavonási lépés.

## Amikor egy réteg nem mutat semmit

Az ok egyszer megjelenik az állapotsorban, és a párbeszédpanelen a réteg neve alatt marad:

| Üzenet | Teendő |
|---|---|
| Ki: a térképrétegek az internetről ki vannak kapcsolva a Beállításokban. | Kapcsolja be a **Térképrétegek az internetről** beállítást. |
| Szükséges a projekt koordináta-rendszere | Állítsa be a {{ui:Koordináták}} alatt. |
| A szerver nem engedélyezte, hogy ez az oldal használja a képeit (CORS), vagy nem érhető el. | A szerver nem engedi, hogy a weboldalak használják a képeit, vagy le van állva. Négy elutasítás után a CivilCraft abbahagyja a kérést; a réteg elrejtésével és megjelenítésével újra próbálkozhat. |
| A szerver 404-et válaszolt … / A szerver text/xml-t küldött, nem képet: … | Az URL, a réteg vagy a stílus hibás, vagy a szerver üzenete megmondja, mit kér. |
| Ez a réteg nincs felajánlva a projekt rendszerében, a web Mercatorban vagy a WGS 84-ben | A szerver nem tud ott rajzolni, ahol a CivilCraft el tudja helyezni. |

## Mit ellenőriztek

- A csempeszámokat a szabványos web Mercator csempézéshez ellenőrizték; a WMS 1.1.1 és 1.3.0, a WMTS és a térképszolgáltatás válaszait kézzel írt fájlokból, valamint az USGS National Map és a terrestris OpenStreetMap szervereiről mentett valódi válaszokból olvasták. A WMS 1.3.0 kérések az EPSG:4326 esetén a szabvány szerint a szélességet teszik elöl.
- Az átvetést a PROJ számaival kiszámított, pontonkénti pontos átszámítással hasonlították össze: a csempéknél, a WMS-képeknél és egy megyényi képnél a 0,13 képponton belül van, telek- és kicsinyített léptéknél egyaránt.
- A world file-lal rendelkező képet és a GDAL (rasterio) által írt RGB GeoTIFF-et ott rajzolták, ahol az elhelyezésük mondja, a böngészőben képpontonként ellenőrizve.
- A böngészőben, egy helyettes szerverrel szemben a tesztgépen: a csempék abba a csempébe érkeznek, ahová a PROJ az egyes pontokat teszi, a WMS-kép 2 képponton belül érkezik, egyszerre legfeljebb 6 kérés fut, és a beállítás kikapcsolt állapotában semmi nem hagyja el az oldalt. A fenti USGS National Map térképszolgáltatást egyszer be is olvasták, és élőben kirajzolták a böngészőben (csempéi megérkeztek és ki lettek rajzolva, a szerzői jogi szövegével együtt); a többi nyilvános szervert csak mentett válaszokból olvasták.
