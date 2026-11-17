---
title: LandXML: co se čte a zapisuje
summary: Prvky a atributy LandXML 1.2, které CivilCraft čte a zapisuje, prvek po prvku, a vše, co přeskakuje.
keywords: landxml, xml, cgpoints, surface, tin, lomové hrany, hranice, osa trasy, coordgeom, profil, profalign, pvi, paracurve, pipenetworks, struct, potrubí, planfeatures, planfeature, hranová čára, schéma
from: ca3cf359
---

CivilCraft zapisuje LandXML 1.2 s oficiálním jmenným prostorem a umístěním schématu. Čte jakýkoli soubor, jehož kořenový prvek je `LandXML`, a bere níže uvedené prvky podle názvu (předpony jmenných prostorů se ignorují; verze se nekontroluje). Jeho čtečka XML přijímá jen pět standardních entit a číselné odkazy na znaky; nikdy nenačítá DTD ani externí soubor. Kroky najdete v [Výměna LandXML](topic:landxml).

LandXML zapisuje souřadnice nejprve severně: bod je „N E“ nebo „N E Z“.

## Zapisuje se

| Prvek | Co CivilCraft zapisuje |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, plochy ve čtverečních stopách, objemy v krychlových yardech, průměry v palcích), nebo `Metric` (metr, čtvereční metr, krychlový metr, milimetr) |
| `Project` | `name` = název projektu |
| `Application` | název CivilCraft, výrobce CadCraft |
| `CgPoints` / `CgPoint` | `name` = číslo bodu, `desc` = popis, `code` = skupina; text „N E Z“ (nebo „N E“ bez výšky) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw nebo ccw, `radius`, `length`, `staStart`, `chord`, `delta` (stupně), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | stávající terén podél osy trasy jako dvojice staničení a výška (`PntList2D`), rozdělený tam, kde opouští povrch |
| `Profile` / `ProfAlign` | navržený podélný profil (pojmenovaný „<osa> design“): `PVI` pro konce a lomové body, `ParaCurve` s `length` pro svislé oblouky |
| `Surfaces` / `Surface` | `name` a `desc`; nejprve stávající terén, pak „Proposed“, když se plošiny nebo koridory upravují |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (jen stávající terén) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (jen stávající terén, je-li k dispozici) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` s `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm nebo sanitary |
| `Struct` | `name`, `elevRim` (použitý poklop, nastavený nebo z povrchu), `elevSump`; `Center`; `CircStruct` s `diameter`; `Invert` s `elev`, `flowDir` in nebo out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` s `diameter` |
| `PlanFeatures` / `PlanFeature` | jeden na každou hranovou čáru: `name`; `CoordGeom` s `Line` (`length`, `Start`, `End`) a `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` a `End` jako „N E Z“, `Center` jako „N E“); `Feature` `code="CivilCraft"` s `Property` použití a closed |

Nezapisuje se: plošiny a koridory jako objekty (jejich výsledkem je povrch „Proposed“), osy trasy s chybami, potrubí bez obou den, pravidla sítě.

## Čte se

| Prvek | Co CivilCraft přebírá |
|---|---|
| `Units` | `Imperial` nebo `Metric` a jeho `linearUnit` rozhodnou o stopách nebo metrech. Neznámá jednotka se zaznamená. |
| `Project` | `name` se stane názvem projektu. |
| `CgPoints` / `CgPoint` (i vnořené) | název (nebo `oID`), „N E“ nebo „N E Z“, `desc` (nebo `code`) jako popis |
| `Surface` s `Definition surfType="TIN"` | `Pnts` a `Faces` jako stávající terén (jen první povrch); neviditelné plochy (`i="1"`) se vynechají |
| `SourceData` / `Breaklines` | 3D lomové hrany, zachované s povrchem |
| `SourceData` / `Boundaries` | vnější hranice |
| `Alignment` / `CoordGeom` | prvky `Line` a `Curve`; PI se obnoví z `PI` každého oblouku, nebo z jeho `Center` a tečen; `staStart` |
| `Profile` / `ProfAlign` | `PVI` a `ParaCurve` (s `length`); první navržený profil s alespoň dvěma PVI |
| `PlanFeatures` / `PlanFeature` | každý jako hranová čára: `Line`, `Curve` (jeho `Start`, `Center`, `End` a `rot`) a `IrregularLine` (`PntList3D` nebo `PntList2D`) spojené od konce ke konci (mezera se spojí přímým úsekem a zaznamená se); uzavřeno, pokud končí tam, kde začalo; použití a closed z vlastního `Feature` CivilCraftu, jinak **Jen nakresleno**. Body bez výšky dostanou 0 (zaznamenáno). |
| `Spiral` | klotoidní spirály vedle `Curve` (dovnitř i ven; čtené jako PI s poloměrem a délkami spirál, zapisované zpět s `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | první síť, která má potrubí: `Struct` (`Center`, `elevRim`, `elevSump`, průměr `CircStruct`, `Invert` na každé potrubí) a `Pipe` (`refStart`, `refEnd`, průměr `CircPipe`) |

## Přeskočeno, uvedeno v poznámkách

- Povrchy po prvním, mřížkové povrchy a ostatní povrchy, které nejsou TIN
- Osy trasy obsahující prvky `IrregularLine` nebo `Chain`, spirály jiné než klotoidní, spirála mezi dvěma oblouky, nebo osy bez geometrie
- Navržené profily po prvním; svislé oblouky `CircCurve` a `UnsymParaCurve` (jejich PVI se zachovají bez oblouku)
- Body, které odkazují jen na jiné body (`pntRef`), a body bez čitelných souřadnic
- Opakované názvy bodů (zachová se první)
- Hranice skrytí, zobrazení a oříznutí dat; lomové hrany bez 3D bodů
- Sítě potrubí po první; typy sítí jiné než storm a sanitary (čtou se jako storm)
- Obdélníkové, vtokové a výtokové objekty (čtou se jako kulaté); vejčitá, eliptická a krabicová potrubí a žlaby (čtou se jako kulatá potrubí bez velikosti)
- Prvky `Spiral` v prvcích půdorysu
- `Parcels`, `Roadways`, `GradeModel` a `Survey`

Terénní profily (`ProfSurf`) v souboru se nepoužívají: CivilCraft vzorkuje terén přímo z povrchu.

## Zprávy, když soubor nejde otevřít

| Zpráva | Význam |
|---|---|
| „Toto je XML, ale ne LandXML (jeho kořenový prvek je <…>).“ | Soubor je jiný druh XML. |
| „… nemá body, povrchy TIN ani osy, které CivilCraft umí číst.“ | Vše v souboru je na seznamu přeskočených. Poznámky za ní říkají, co tam bylo. |
| „Mismatched end tag …“, „Unclosed tag …“, „The file ends inside …“ | Soubor je poškozen nebo useknut. |
