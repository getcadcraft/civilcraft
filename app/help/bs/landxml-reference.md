---
title: LandXML: šta se čita i piše
summary: Elementi i atributi LandXML 1.2 koje CivilCraft čita i piše, element po element, i sve što preskače.
keywords: landxml, xml, cgpoints, površina, tin, linije loma, granica, osa trase, coordgeom, uzdužni profil, profalign, pvi, paracurve, pipenetworks, struct, cijev, planfeatures, planfeature, karakteristična linija, šema
from: ca3cf359
---

CivilCraft piše LandXML 1.2 sa zvaničnim imenskim prostorom i lokacijom šeme. Čita svaku datoteku čiji je korijenski element `LandXML` i uzima elemente ispod po nazivu (prefiksi imenskih prostora se zanemaruju; verzija se ne provjerava). Njegov XML čitač prihvata samo pet standardnih entiteta i numeričke reference znakova; nikada ne učitava DTD ili vanjsku datoteku. Za korake pogledajte [Razmjena LandXML](topic:landxml).

LandXML piše koordinate najprije sjevernom (N) koordinatom: tačka je „N E“ ili „N E Z“.

## Zapisano

| Element | Šta CivilCraft piše |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, površine u kvadratnim stopama, zapremine u kubnim jardima, prečnici u inčima) ili `Metric` (meter, kvadratni metar, kubni metar, milimetar) |
| `Project` | `name` = naziv projekta |
| `Application` | naziv CivilCraft, proizvođač CadCraft |
| `CgPoints` / `CgPoint` | `name` = broj tačke, `desc` = opis, `code` = grupa; tekst „N E Z“ (ili „N E“ bez kote) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw ili ccw, `radius`, `length`, `staStart`, `chord`, `delta` (stepeni), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | postojeći teren duž trase, kao parovi stacionaže i kote (`PntList2D`), podijeljen tamo gdje izlazi iz površine |
| `Profile` / `ProfAlign` | projektovani profil (nazvan „<trasa> design“): `PVI` za krajeve i lomne tačke, `ParaCurve` sa `length` za vertikalne krivine |
| `Surfaces` / `Surface` | `name` i `desc`; prvo postojeći teren, zatim „Proposed“ kada platoi ili koridori nivelišu |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (samo postojeći teren) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (samo postojeći teren, kada postoji) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` sa `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm ili sanitary |
| `Struct` | `name`, `elevRim` (korišteni rub, zadan ili iz površine), `elevSump`; `Center`; `CircStruct` sa `diameter`; `Invert` sa `elev`, `flowDir` in ili out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` sa `diameter` |
| `PlanFeatures` / `PlanFeature` | po jedan za svaku karakterističnu liniju: `name`; `CoordGeom` sa `Line` (`length`, `Start`, `End`) i `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` i `End` kao „N E Z“, `Center` kao „N E“); `Feature` `code="CivilCraft"` sa `Property` use i closed |

Nije zapisano: platoi i koridori kao objekti (njihov rezultat je površina „Proposed“), trase sa greškama, cijevi bez oba inverta, pravila mreže.

## Čitanje

| Element | Šta CivilCraft uzima |
|---|---|
| `Units` | `Imperial` ili `Metric` i njihov `linearUnit` određuju stope ili metre. Nepoznata jedinica se bilježi. |
| `Project` | `name` postaje naziv projekta. |
| `CgPoints` / `CgPoint` (i ugniježđeni) | naziv (ili `oID`), „N E“ ili „N E Z“, `desc` (ili `code`) kao opis |
| `Surface` sa `Definition surfType="TIN"` | `Pnts` i `Faces` kao postojeći teren (samo prva površina); nevidljive strane (`i="1"`) se izostavljaju |
| `SourceData` / `Breaklines` | 3D linije loma, zadržane uz površinu |
| `SourceData` / `Boundaries` | vanjska granica |
| `Alignment` / `CoordGeom` | elementi `Line` i `Curve`; PI-jevi se obnavljaju iz `PI` svake krivine, ili iz njenog `Center` i tangenti; `staStart` |
| `Profile` / `ProfAlign` | `PVI` i `ParaCurve` (sa `length`); prvi projektovani profil sa najmanje dva PVI-ja |
| `PlanFeatures` / `PlanFeature` | svaki kao karakteristična linija: `Line`, `Curve` (njegovi `Start`, `Center`, `End` i `rot`) i `IrregularLine` (`PntList3D` ili `PntList2D`) spojeni kraj na kraj (praznina se spaja pravim segmentom i bilježi); zatvoren kada završava tamo gdje je počeo; use i closed iz vlastitog `Feature` elementa CivilCraft-a, inače **Samo nacrtano**. Tačke bez kote dobijaju 0 (bilježi se). |
| `Spiral` | klotoidne spirale uz `Curve` (ulazna i izlazna; čita se kao PI sa radijusom i dužinama spirala, a zapisuje se nazad sa `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | prva mreža koja ima cijevi: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` po cijevi) i `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Preskočeno, i navedeno u napomenama

- Površine poslije prve, mrežaste površine i druge površine koje nisu TIN
- Trase koje sadrže elemente `IrregularLine` ili `Chain`, spirale osim klotoidnih, spiralu između dvije krivine, ili trase koje nemaju geometriju
- Projektovani profili poslije prvog; vertikalne krivine `CircCurve` i `UnsymParaCurve` (njihovi PVI-jevi se zadržavaju bez krivine)
- Tačke koje samo upućuju na druge tačke (`pntRef`), i tačke bez čitljivih koordinata
- Ponovljeni nazivi tačaka (zadržava se prvi)
- Granice za sakrivanje, prikazivanje i odsijecanje podataka; linije loma bez 3D tačaka
- Mreže cijevi poslije prve; tipovi mreže osim storm i sanitary (čitaju se kao storm)
- Pravougaoni, ulazni i izlazni objekti (čitaju se kao okrugli); jajaste, eliptične i kutijaste cijevi i kanali (čitaju se kao okrugle cijevi bez veličine)
- Elementi `Spiral` u karakterističnim linijama
- `Parcels`, `Roadways`, `GradeModel` i `Survey`

Uzdužni profili terena (`ProfSurf`) u datoteci se ne koriste: CivilCraft uzima teren direktno iz same površine.

## Poruke kada se datoteka ne može otvoriti

| Poruka | Značenje |
|---|---|
| „Ovo je XML, ali nije LandXML (korijenski element je <…>).“ | Datoteka je drugi tip XML-a. |
| „… nema tačaka, TIN površina ni trasa koje CivilCraft može da čita.“ | Sve u datoteci je na listi preskočenog. Napomene poslije kažu šta je bilo. |
| „Neusklađena završna oznaka …“, „Nezatvorena oznaka …“, „Datoteka se završava unutar …“ | Datoteka je oštećena ili skraćena. |
