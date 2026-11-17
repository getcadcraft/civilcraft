---
title: LandXML: čo sa číta a zapisuje
summary: Prvky a atribúty LandXML 1.2, ktoré CivilCraft číta a zapisuje, prvok po prvku, a všetko, čo preskočí.
keywords: landxml, xml, cgpoints, povrch, tin, zlomové čiary, hranica, trasa, coordgeom, profil, profalign, pvi, paracurve, pipenetworks, struct, potrubie, planfeatures, planfeature, čiara tvaru, schéma
from: ca3cf359
---

CivilCraft zapisuje LandXML 1.2 s oficiálnym menným priestorom a umiestnením schémy. Číta ľubovoľný súbor, ktorého koreňový prvok je `LandXML`, a berie nižšie uvedené prvky podľa názvu (prefixy menných priestorov sa ignorujú; verzia sa nekontroluje). Jeho čítač XML prijíma iba päť štandardných entít a číselné odkazy na znaky; nikdy nenačíta DTD ani externý súbor. Kroky nájdete v [Výmena LandXML](topic:landxml).

LandXML zapisuje súradnice najprv Y (sever): bod je "N E" alebo "N E Z".

## Zapísané

| Prvok | Čo CivilCraft zapíše |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, plochy v štvorcových stopách, objemy v kubických yardoch, priemery v palcoch) alebo `Metric` (meter, štvorcový meter, kubický meter, milimeter) |
| `Project` | `name` = názov projektu |
| `Application` | názov CivilCraft, výrobca CadCraft |
| `CgPoints` / `CgPoint` | `name` = číslo bodu, `desc` = popis, `code` = skupina; text "N E Z" (alebo "N E" bez výšky) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw alebo ccw, `radius`, `length`, `staStart`, `chord`, `delta` (stupne), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | existujúci terén pozdĺž trasy ako dvojice staničenia a výšky (`PntList2D`), rozdelený tam, kde opúšťa povrch |
| `Profile` / `ProfAlign` | návrhový profil (pomenovaný "<alignment> design"): `PVI` pre konce a lomové body, `ParaCurve` s `length` pre zvislé oblúky |
| `Surfaces` / `Surface` | `name` a `desc`; najprv existujúci terén, potom "Proposed", keď plochy alebo koridory upravujú terén |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (iba existujúci terén) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (iba existujúci terén, ak nejaký je) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` s `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm alebo sanitary |
| `Struct` | `name`, `elevRim` (použitá hodnota horného okraja, nastavená alebo z povrchu), `elevSump`; `Center`; `CircStruct` s `diameter`; `Invert` s `elev`, `flowDir` in alebo out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` s `diameter` |
| `PlanFeatures` / `PlanFeature` | jeden na každú čiaru tvaru: `name`; `CoordGeom` s `Line` (`length`, `Start`, `End`) a `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` a `End` ako "N E Z", `Center` ako "N E"); `Feature` `code="CivilCraft"` s `Property` use a closed |

Nezapísané: plochy a koridory ako objekty (ich výsledkom je povrch "Proposed"), trasy s chybami, potrubia bez oboch dien (invertov), pravidlá siete.

## Čítané

| Prvok | Čo CivilCraft prevezme |
|---|---|
| `Units` | `Imperial` alebo `Metric` a jeho `linearUnit` určia stopy alebo metre. Neznáma jednotka sa zaznamená. |
| `Project` | `name` sa stane názvom projektu. |
| `CgPoints` / `CgPoint` (aj vnorené) | názov (alebo `oID`), "N E" alebo "N E Z", `desc` (alebo `code`) ako popis |
| `Surface` s `Definition surfType="TIN"` | `Pnts` a `Faces` ako existujúci terén (iba prvý povrch); neviditeľné plochy (`i="1"`) sa vynechajú |
| `SourceData` / `Breaklines` | 3D zlomové čiary, zachované s povrchom |
| `SourceData` / `Boundaries` | vonkajšia hranica |
| `Alignment` / `CoordGeom` | prvky `Line` a `Curve`; PI sa obnovia z `PI` každej krivky alebo z jej `Center` a dotyčníc; `staStart` |
| `Profile` / `ProfAlign` | `PVI` a `ParaCurve` (s `length`); prvý návrhový profil s aspoň dvoma PVI |
| `PlanFeatures` / `PlanFeature` | každý ako čiara tvaru: `Line`, `Curve` (jej `Start`, `Center`, `End` a `rot`) a `IrregularLine` (`PntList3D` alebo `PntList2D`) spojené koniec na koniec (medzera sa spojí rovnou úsečkou a zaznamená sa); uzavretá, keď končí tam, kde začala; použitie a uzavretie z vlastného `Feature` CivilCraft, inak **Iba nakreslené**. Body bez výšky dostanú 0 (zaznamená sa). |
| `Spiral` | klotoidné špirály vedľa `Curve` (vstupná a výstupná; čítané ako PI s polomerom a dĺžkami špirál, zapisované späť s `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | prvá sieť, ktorá má potrubia: `Struct` (`Center`, `elevRim`, `elevSump`, priemer `CircStruct`, `Invert` pre každé potrubie) a `Pipe` (`refStart`, `refEnd`, priemer `CircPipe`) |

## Preskočené a uvedené v poznámkach

- Povrchy po prvom, mriežkové povrchy a iné než TIN povrchy
- Trasy, ktoré obsahujú prvky `IrregularLine` alebo `Chain`, špirály iné než klotoidné, špirálu medzi dvoma oblúkmi, alebo trasy bez geometrie
- Návrhové profily po prvom a zvislé oblúky `CircCurve` a `UnsymParaCurve` (ich PVI sa zachovajú bez oblúka)
- Body, ktoré iba odkazujú na iné body (`pntRef`), a body bez čitateľných súradníc
- Opakované názvy bodov (zachová sa prvý)
- Skryté, zobrazené a orezové hranice dát; zlomové čiary bez 3D bodov
- Siete potrubí po prvej; typy sietí iné než storm a sanitary (čítané ako storm)
- Obdĺžnikové, vtokové a výtokové šachty (čítané ako okrúhle); vajcové, elipsovité a škatuľové potrubia a žľaby (čítané ako okrúhle potrubia bez veľkosti)
- Prvky `Spiral` v čiarach tvaru
- `Parcels`, `Roadways`, `GradeModel` a `Survey`

Terénne profily (`ProfSurf`) v súbore sa nepoužívajú: CivilCraft vzorkuje terén priamo z povrchu.

## Hlásenia, keď sa súbor neotvorí

| Hlásenie | Význam |
|---|---|
| "Toto je XML, ale nie LandXML (jeho koreňový prvok je <…>)." | Súbor je iný druh XML. |
| "… nemá body, povrchy TIN ani trasy, ktoré CivilCraft dokáže čítať." | Všetko v súbore je v zozname preskočených. Poznámky za ním uvádzajú, čo tam bolo. |
| "Nezodpovedajúca koncová značka …", "Neuzavretá značka …", "Súbor končí vnútri …" | Súbor je poškodený alebo skrátený. |
