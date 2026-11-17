---
title: LandXML: mit olvas és mit ír
summary: A CivilCraft által olvasott és írt LandXML 1.2 elemek és attribútumok, elemenként, valamint minden, amit kihagy.
keywords: landxml, xml, cgpoints, felület, tin, töréspontok, határ, nyomvonal, coordgeom, szelvény, profalign, pvi, paracurve, csőhálózatok, pipenetworks, struct, cső, planfeatures, planfeature, tervezővonal, séma
from: ca3cf359
---

A CivilCraft LandXML 1.2-t ír a hivatalos névtérrel és sémahellyel. Olvas minden olyan fájlt, amelynek gyökéreleme `LandXML`, és a lent felsorolt elemeket névvel veszi; a névtérelőtagokat figyelmen kívül hagyja, a verziót nem ellenőrzi. XML-olvasója csak az öt szabványos entitást és a numerikus karakterhivatkozásokat fogadja el, soha nem tölt be DTD-t vagy külső fájlt. A lépésekhez lásd [LandXML-csere](topic:landxml).

A LandXML a koordinátákat először az északi (N) értékkel írja: a pont „N E” vagy „N E Z” alakú.

## Írva

| Elem | Amit a CivilCraft ír |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, területek square feet-ben, térfogatok cubic yardban, átmérők inch-ben) vagy `Metric` (meter, négyzetméter, köbméter, milliméter) |
| `Project` | `name` = a projekt neve |
| `Application` | name CivilCraft, manufacturer CadCraft |
| `CgPoints` / `CgPoint` | `name` = pontszám, `desc` = leírás, `code` = csoport; szöveg „N E Z” (vagy „N E”, magasság nélkül) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw vagy ccw, `radius`, `length`, `staStart`, `chord`, `delta` (fok), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | a meglévő terep a nyomvonal mentén, szelvényszám- és magasságpárként (`PntList2D`), törve ott, ahol elhagyja a felületet |
| `Profile` / `ProfAlign` | a tervezett hossz-szelvény („<nyomvonal> design” néven): `PVI` a végpontokhoz és a töréspontokhoz, `ParaCurve` a `length`-tel a függőleges ívekhez |
| `Surfaces` / `Surface` | `name` és `desc`; először a meglévő terep, majd „Proposed”, ha emelvények vagy sávok tereprendeznek |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (csak a meglévő terep) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (csak a meglévő terep, ha van) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` `id`-val; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm vagy sanitary |
| `Struct` | `name`, `elevRim` (a használt perem: beállított vagy a felületről véve), `elevSump`; `Center`; `CircStruct` a `diameter`-rel; `Invert` az `elev`-vel, `flowDir` in vagy out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` a `diameter`-rel |
| `PlanFeatures` / `PlanFeature` | tervezővonalanként egy: `name`; `CoordGeom` a `Line`-nal (`length`, `Start`, `End`) és a `Curve`-vel (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` és `End` „N E Z”-ként, `Center` „N E”-ként); `Feature` `code="CivilCraft"`-tal, a `Property` use és closed elemekkel |

Nem íródik: emelvények és sávok mint objektumok (az eredményük a „Proposed” felület), hibás nyomvonalak, mindkét fenékszint nélküli csövek, hálózati szabályok.

## Olvasva

| Elem | Amit a CivilCraft átvesz |
|---|---|
| `Units` | `Imperial` vagy `Metric`, és a `linearUnit` dönti el, hogy láb vagy méter. Az ismeretlen egységet megjegyzi. |
| `Project` | a `name` lesz a projekt neve. |
| `CgPoints` / `CgPoint` (beágyazva is) | név (vagy `oID`), „N E” vagy „N E Z”, a `desc` (vagy a `code`) mint leírás |
| `Surface` a `Definition surfType="TIN"`-nel | a `Pnts` és `Faces` mint a meglévő terep (csak az első felület); a láthatatlan lapok (`i="1"`) kimaradnak |
| `SourceData` / `Breaklines` | 3D töréspontok, a felülettel együtt megtartva |
| `SourceData` / `Boundaries` | a külső határ |
| `Alignment` / `CoordGeom` | `Line` és `Curve` elemek; a PI-k minden ívből a `PI`-ből, vagy a `Center`-ből és az érintőkből épülnek újra; `staStart` |
| `Profile` / `ProfAlign` | `PVI` és `ParaCurve` (a `length`-tel); az első tervezett hossz-szelvény, legalább két PVI-vel |
| `PlanFeatures` / `PlanFeature` | mindegyik tervezővonalként: `Line`, `Curve` (a `Start`, `Center`, `End` és `rot`) és `IrregularLine` (`PntList3D` vagy `PntList2D`), végig összefűzve (a rést egyenes szakasz zárja, és megjegyzi); zárt, ha ott végződik, ahol kezdődött; a use és a closed a CivilCraft saját `Feature` elemétől, egyébként **Csak rajzolva**. A magasság nélküli pontok 0-t kapnak (megjegyezve). |
| `Spiral` | a `Curve` mellett lévő klotoid spirálok (be- és kilépő; PI-ként, sugárral és spirálhosszakkal beolvasva, visszaírva a `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant` elemekkel) |
| `PipeNetwork` | az első, csöveket tartalmazó hálózat: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` `diameter`-rel, `Invert` csövenként) és `Pipe` (`refStart`, `refEnd`, `CircPipe` `diameter`-rel) |

## Kihagyva, és a megjegyzésekben megnevezve

- Az első utáni felületek, rácsfelületek és más, nem TIN felületek
- Olyan nyomvonalak, amelyek `IrregularLine` vagy `Chain` elemet tartalmaznak, a klotoidtól eltérő spirálok, két ív közötti spirál, vagy amelyeknek nincs geometriájuk
- Az első utáni tervezett hossz-szelvények; `CircCurve` és `UnsymParaCurve` függőleges ívek (PVI-jeik ív nélkül megmaradnak)
- Csak más pontokra hivatkozó pontok (`pntRef`), és olvasható koordináták nélküli pontok
- Ismétlődő pontnevek (az első marad meg)
- Elrejtett, megjelenített és adatvágó határok; 3D pontok nélküli töréspontok
- Az első utáni csőhálózatok; a storm és sanitary-tól eltérő hálózattípusok (storm-ként olvasva)
- Téglalap, befolyó és kifolyó műtárgyak (körként olvasva); tojás-, ellipszis- és doboz-keresztmetszetű csövek és csatornák (méret nélküli körcsövekként olvasva)
- `Spiral` elemek tervezővonalakban
- `Parcels`, `Roadways`, `GradeModel` és `Survey`

A fájlban lévő terepszelvényeket (`ProfSurf`) nem használja a program: a CivilCraft a terepmintát magából a felületből veszi.

## Üzenetek, ha egy fájl nem nyílik meg

| Üzenet | Jelentés |
|---|---|
| „Ez XML, de nem LandXML (gyökéreleme <…>).” | A fájl más típusú XML. |
| „… nem tartalmaz olyan pontot, TIN-felületet vagy nyomvonalat, amelyet a CivilCraft olvasni tud.” | Minden a fájlban a kihagyottak listáján szerepel. A utána következő megjegyzések megmondják, mi volt benne. |
| „Mismatched end tag …”, „Unclosed tag …”, „The file ends inside …” | A fájl sérült vagy csonka. |
