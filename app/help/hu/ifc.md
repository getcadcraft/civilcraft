---
title: IFC-exportálás és -importálás
summary: A teljes projekt mentése egyetlen IFC-fájlként IFC 4.3, IFC4 vagy IFC2x3 formátumban (nyomvonalak, utak, földmunkák, felületek, falak, csővezetékek), valamint IFC-fájlok megnyitása nyomvonalaik és felületeik kiolvasásához.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, nyomvonal, ifcalignment, út, ifcroad, földmunka, tin, átadandó dokumentum, beszerzés, ifc exportálása, ifc importálása
from: 6b998bcf
---

Az IFC az a nyílt csereformátum, amelyet sok közintézmény átadandó dokumentumként kér. A CivilCraft a teljes projektet egyetlen IFC-fájlba írja, és IFC-fájlokból olvassa vissza a nyomvonalakat és felületeket.

## Exportálás

1. Kattintson a {{ui:IFC}} gombra az **Exportálás** csoportban (a szalagos stílusban: {{ui:Kimenet}} › {{ui:Exportálás}} › {{ui:IFC}}).
2. Válassza ki a sémát. Az **IFC 4.3 ADD2** van elöl, és ez az alapértelmezett: ez az a kiadás, amely nyomvonalakat, utakat és földmunkákat is tartalmaz. IFC4-et vagy IFC2x3-at csak akkor válasszon, ha a fogadó szoftver nem tudja olvasni a 4.3-at.
3. A párbeszédpanel elmondja, mit tartalmaz a fájl, és mit hagy ki a választott séma. Kattintson az {{ui:IFC exportálása}} gombra.
   A fájl letöltődik "*projekt neve*-ifc4x3.ifc", "-ifc4.ifc" vagy "-ifc2x3.ifc" néven. A CivilCraft megjegyzi, melyik sémát választotta utoljára.

## Mit tartalmaz az egyes sémák

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Nyomvonalak | IfcAlignment vízszintes (egyenesek, körívek, klotoid-spirálok) és függőleges (lejtések, parabolaívek) elrendezéssel, görbéik (IfcCompositeCurve, IfcGradientCurve), a kezdőállomás és a túlemelési események | Háromdimenziós polivonal egy civil elemen | Háromdimenziós polivonal egy proxy elemen |
| Folyosók | IfcRoad útrészekkel; sávok, vállak, árkok és járdák IfcPavement-ként, szegélyek IfcKerb-ként, növénysávok; minden burkolatréteg IfcCourse-ként a vastagságával, anyagával és térfogatával; az oldallejtők IfcEarthworksCut és IfcEarthworksFill elemként a bevágási és feltöltési térfogatokkal; a tervezési sebesség és osztály | Civil elemek a nevükön, útonként csoportosítva | Proxyk, útonként csoportosítva |
| Felületek | IfcGeographicElement TERRAIN háromszögelt szabálytalan hálóval (TIN) | Háromszögelt lapcsoportok | Lapalapú felületmodellek (nagyobb fájlok) |
| Tereplépcsők és falak | A tereplépcső teteje, lejtői földmunkaként, a támfalak IfcWall RETAININGWALL típusként | Ugyanez, a fal felhasználó által definiált falfajtaként | Ugyanez, a fal típusa az ObjectType mezőben |
| Csővezeték-hálózatok | IfcPipeSegment és IfcDistributionChamberElement egy IfcDistributionSystem alatt | Ugyanez | IfcFlowSegment és aknák egy IfcSystem alatt |
| Georeferencia | IfcProjectedCRS és IfcMapConversion | Ugyanez | ePSet_ProjectedCRS és ePSet_MapConversion a telken |

A **vasúti pálya** (a Vasút beállítással bekapcsolt nyomvonal) IFC 4.3-ban IfcRailway elemként kerül be: átmenetei saját típusaikként (klotoid, köbös parabola, Bloss, Helmert, szinusz félhullám koszinuszgörbeként, szinusz), túlemelése IfcAlignmentCant elemként, pályája sínekként, talpfákként és zúzottkő-ágyazatként, alatta az alzúzottkővel. Az IFC4 és IFC2x3 ugyanezeket a részeket civil elemként vagy proxyként kapja. IFC 4.3 vasúti pálya megnyitásakor az átmenetei és túlemelése visszakerül.

Minden fájl tartalmazza a telekhatárokat (lábnyomokat), a Tájépítészet munkaterület növényeit és burkolatait, valamint az épülettömegeket (mindegyik IfcBuilding szintekkel), mind egy telken belül. A tulajdonságkészletek azt tárolják, amit tervezett: állomásokat, a keresztszelvényt, a bevágási és feltöltési lejtőket, a sávszélességet és sávszámot, a fenékszinteket, a peremszinteket, a falmagasságokat; a mennyiségek (hosszúságok, felületek, térfogatok) IfcElementQuantity készletek.

## Mértékegységek és koordináták

A fájl a projekt hosszmértékegységében készül (méter vagy US survey láb); a felületek és térfogatok négyzet- és köbméterben vannak. Ha van koordinátarendszer (GIS › Koordináták), a fájl a térképre kerül: az origó keleti és északi értéke, valamint egy helyi (talaj) rendszer forgatása és léptéke a térképi átalakításban szerepel. Nélküle a fájl a helyi origóját egy tulajdonságkészletben rögzíti, és nem kerül térképre.

## Importálás

Nyisson meg egy .ifc fájlt a {{ui:Megnyitás}} gombbal, vagy húzza a tervre. Az importálási párbeszédpanel elmondja, mit tartalmaz a fájl:

- **Nyomvonalak** az IFC 4.3 vízszintes és függőleges elrendezéséből, valamint az IFC 4x1 nyomvonal-görbékből CivilCraft-nyomvonalakká válnak a PI-jukkal, sugaraikkal, spirálhosszaikkal és PVI-ikkel. Az a nyomvonal, amelyet a CivilCraft PI-modellje nem tud tárolni (összetett ívek, két ív közötti spirál, görbében kezdődő vagy végződő), nem importálódik, és a párbeszédpanel megmondja az okát.
- **Felületek**: válassza ki azt, amelyik a meglévő talaj lesz, vagy tartsa meg a projektét.
- **Minden más** (és a többi felület) megjeleníthető a 3D nézetben referenciaként. A referenciaelemek a projekt nyitva tartásáig maradnak; nem mentődnek a projektfájlba.

Az IFC4 vagy IFC2x3 formátumban a CivilCraft által írt fájl nyomvonalait a tulajdonságkészletükből pontosan visszaadja.

## Még nincs elkészítve

- Az út túlemelése túlemelési eseményként és az útfelületekben íródik ki (a keresztdőlés vasúti fogalom).
- A referenciaelemek mentése a projektfájlba, valamint csővezeték-hálózatok vagy tereplépcsők importálása IFC-ből szerkeszthető objektumként.
