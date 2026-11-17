---
title: LandXML: šta se čita i upisuje
summary: LandXML 1.2 elementi i atributi koje CivilCraft čita i upisuje, element po element, i sve što preskače.
keywords: landxml, xml, cgpoints, površ, tin, linije prelamanja, granica, osovina trase, coordgeom, profil, profalign, pvi, paracurve, pipenetworks, struct, cev, planfeatures, planfeature, linija objekta, šema
from: ca3cf359
---

CivilCraft upisuje LandXML 1.2 sa zvaničnim imenskim prostorom i lokacijom šeme. Čita svaku datoteku čiji je korenski element `LandXML` i uzima elemente ispod po imenu (prefiksi imenskih prostora se ignorišu; verzija se ne proverava). Njegov XML čitač prihvata samo pet standardnih entiteta i numeričke reference na znakove; nikad ne učitava DTD ili spoljnu datoteku. Za korake pogledajte [Razmena LandXML](topic:landxml).

LandXML upisuje koordinate prvo severno: tačka je „N E“ ili „N E Z“.

## Upisano

| Element | Šta CivilCraft upisuje |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, površine u kvadratnim stopama, zapremine u kubnim jardima, prečnici u inčima) ili `Metric` (metar, kvadratni metar, kubni metar, milimetar) |
| `Project` | `name` = ime projekta |
| `Application` | ime CivilCraft, proizvođač CadCraft |
| `CgPoints` / `CgPoint` | `name` = broj tačke, `desc` = opis, `code` = grupa; tekst „N E Z“ (ili „N E“ bez kote) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw ili ccw, `radius`, `length`, `staStart`, `chord`, `delta` (stepeni), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | postojeći teren duž osovine, kao parovi stacionaže i kote (`PntList2D`), podeljen tamo gde izlazi iz površi |
| `Profile` / `ProfAlign` | projektovani profil (nazvan „<osovina> design“): `PVI` za krajeve i tačke prelamanja, `ParaCurve` sa `length` za vertikalne krivine |
| `Surfaces` / `Surface` | `name` i `desc`; prvo postojeći teren, zatim „Proposed“ kad podloge ili koridori nivelišu |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (samo postojeći teren) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (samo postojeći teren, kad postoji) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` sa `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm ili sanitary |
| `Struct` | `name`, `elevRim` (korišćen obod, zadat ili sa površi), `elevSump`; `Center`; `CircStruct` sa `diameter`; `Invert` sa `elev`, `flowDir` in ili out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` sa `diameter` |
| `PlanFeatures` / `PlanFeature` | po jedan za svaku liniju objekta: `name`; `CoordGeom` sa `Line` (`length`, `Start`, `End`) i `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` i `End` kao „N E Z“, `Center` kao „N E“); `Feature` `code="CivilCraft"` sa `Property` use i closed |

Nije upisano: podloge i koridori kao objekti (njihov rezultat je površ „Proposed“), osovine sa greškama, cevi bez oba invert-a, pravila mreže.

## Učitano

| Element | Šta CivilCraft uzima |
|---|---|
| `Units` | `Imperial` ili `Metric`, i njegov `linearUnit`, odlučuju da li su stope ili metri. Nepoznata jedinica se beleži. |
| `Project` | `name` postaje ime projekta. |
| `CgPoints` / `CgPoint` (i ugnježdene) | ime (ili `oID`), „N E“ ili „N E Z“, `desc` (ili `code`) kao opis |
| `Surface` sa `Definition surfType="TIN"` | `Pnts` i `Faces` kao postojeći teren (samo prva površ); nevidljive strane (`i="1"`) se izostavljaju |
| `SourceData` / `Breaklines` | 3D linije prelamanja, zadržane uz površ |
| `SourceData` / `Boundaries` | spoljna granica |
| `Alignment` / `CoordGeom` | elementi `Line` i `Curve`; PI se obnavljaju iz `PI` svake krive, ili iz njenog `Center` i tangenti; `staStart` |
| `Profile` / `ProfAlign` | `PVI` i `ParaCurve` (sa `length`); prvi projektovani profil sa najmanje dve PVI |
| `PlanFeatures` / `PlanFeature` | svaki kao linija objekta: `Line`, `Curve` (njeni `Start`, `Center`, `End` i `rot`) i `IrregularLine` (`PntList3D` ili `PntList2D`) spojeni kraj do kraja (praznina se spaja pravom linijom i beleži se); zatvoreno kad se završi tamo gde je počelo; upotreba i zatvoreno iz sopstvenog `Feature` CivilCraft-a, inače **Samo nacrtano**. Tačke bez kote dobijaju 0 (beleži se). |
| `Spiral` | klotoidne spirale uz `Curve` (ulazna i izlazna; čitaju se kao PI sa poluprečnikom i dužinama spirala, upisuju se nazad sa `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | prva mreža koja ima cevi: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` po cevi) i `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Preskočeno i navedeno u beleškama

- Površi posle prve, mrežaste površi i druge ne-TIN površi
- Osovine koje sadrže elemente `IrregularLine` ili `Chain`, spirale osim klotoidnih, spirala između dve krive, ili osovine bez geometrije
- Projektovani profili posle prvog; vertikalne krivine `CircCurve` i `UnsymParaCurve` (njihove PVI se čuvaju bez krive)
- Tačke koje samo upućuju na druge tačke (`pntRef`), i tačke bez čitljivih koordinata
- Ponovljena imena tačaka (prva se zadržava)
- Sakrivene, prikazane i isečene granice sa podacima; linije prelamanja bez 3D tačaka
- Mreže cevi posle prve; tipovi mreže osim storm i sanitary (čitaju se kao storm)
- Pravougaoni, ulazni i izlazni objekti (čitaju se kao okrugli); jajaste, eliptične i kutijaste cevi i kanali (čitaju se kao okrugle cevi bez veličine)
- Elementi `Spiral` u linijama objekata
- `Parcels`, `Roadways`, `GradeModel` i `Survey`

Profili terena (`ProfSurf`) u datoteci se ne koriste: CivilCraft uzima teren direktno iz same površi.

## Poruke kad se datoteka ne može otvoriti

| Poruka | Značenje |
|---|---|
| „Ovo je XML, ali nije LandXML (korenski element je <…>).“ | Datoteka je druga vrsta XML-a. |
| „… nema tačaka, TIN površi ni osovina koje CivilCraft može da čita.“ | Sve u datoteci je na listi preskočenog. Beleške posle nje kažu šta je bilo. |
| „Neusklađena završna oznaka …“, „Nezatvorena oznaka …“, „Datoteka se završava unutar …“ | Datoteka je oštećena ili skraćena. |
