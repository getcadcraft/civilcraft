---
title: LandXML: što se čita i zapisuje
summary: Elementi i atributi LandXML 1.2 koje CivilCraft čita i zapisuje, element po element, i sve što preskače.
keywords: landxml, xml, cgpoints, površina, tin, linije loma, granica, trasa, coordgeom, profil, profalign, pvi, paracurve, pipenetworks, struct, cijev, planfeatures, planfeature, značajna linija, shema
from: ca3cf359
---

CivilCraft zapisuje LandXML 1.2 sa službenim imenskim prostorom i lokacijom sheme. Čita svaku datoteku čiji je korijenski element `LandXML` i uzima dolje navedene elemente po nazivu (prefiksi imenskih prostora se zanemaruju; verzija se ne provjerava). Njegov XML čitač prihvaća samo pet standardnih entiteta i numeričke referencije znakova; nikad ne učitava DTD ni vanjsku datoteku. Korake pogledajte u [Razmjena LandXML](topic:landxml).

LandXML zapisuje koordinate prvo kao sjever, pa istok: točka je "N E" ili "N E Z".

## Zapisano

| Element | Što CivilCraft zapisuje |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, površine u četvornim stopama, volumeni u kubnim jardima, promjeri u inčima) ili `Metric` (meter, kvadratni metar, kubni metar, milimetar) |
| `Project` | `name` = naziv projekta |
| `Application` | naziv CivilCraft, proizvođač CadCraft |
| `CgPoints` / `CgPoint` | `name` = broj točke, `desc` = opis, `code` = skupina; tekst "N E Z" (ili "N E" bez kote) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw ili ccw, `radius`, `length`, `staStart`, `chord`, `delta` (stupnjevi), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | postojeći teren uz trasu, kao parovi stacionaže i kote (`PntList2D`), podijeljen mjestom gdje napušta površinu |
| `Profile` / `ProfAlign` | projektirani profil (nazvan "<trasa> design"): `PVI` za krajeve i prijelomne točke, `ParaCurve` s `length` za vertikalne krivine |
| `Surfaces` / `Surface` | `name` i `desc`; prvo postojeći teren, zatim "Proposed" kad platoi ili koridori uređuju teren |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (samo postojeći teren) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (samo postojeći teren, kad postoji) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` s `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm ili sanitary |
| `Struct` | `name`, `elevRim` (korišteni obrub, zadan ili s površine), `elevSump`; `Center`; `CircStruct` s `diameter`; `Invert` s `elev`, `flowDir` in ili out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` s `diameter` |
| `PlanFeatures` / `PlanFeature` | jedan po značajnoj liniji: `name`; `CoordGeom` s `Line` (`length`, `Start`, `End`) i `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` i `End` kao "N E Z", `Center` kao "N E"); `Feature` `code="CivilCraft"` s `Property` use i closed |

Nisu zapisani: platoi i koridori kao objekti (njihov rezultat je površina „Proposed“), trase s greškama, cijevi bez obje kote dna i pravila mreže.

## Čitano

| Element | Što CivilCraft uzima |
|---|---|
| `Units` | `Imperial` ili `Metric` i njezin `linearUnit` određuju stope ili metre. Nepoznata jedinica se bilježi. |
| `Project` | `name` postaje naziv projekta. |
| `CgPoints` / `CgPoint` (i ugniježđeni) | ime (ili `oID`), "N E" ili "N E Z", `desc` (ili `code`) kao opis |
| `Surface` s `Definition surfType="TIN"` | `Pnts` i `Faces` kao postojeći teren (samo prva površina); nevidljive plohe (`i="1"`) se izostavljaju |
| `SourceData` / `Breaklines` | 3D linije loma, zadržane uz površinu |
| `SourceData` / `Boundaries` | vanjska granica |
| `Alignment` / `CoordGeom` | elementi `Line` i `Curve`; PI-ji se rekonstruiraju iz `PI` svake krivine ili iz njezina `Center` i tangenti; `staStart` |
| `Profile` / `ProfAlign` | `PVI` i `ParaCurve` (s `length`); prvi projektirani profil s barem dvije PVI točke |
| `PlanFeatures` / `PlanFeature` | svaka kao značajna linija: `Line`, `Curve` (njezin `Start`, `Center`, `End` i `rot`) i `IrregularLine` (`PntList3D` ili `PntList2D`) spojeni od kraja do kraja (praznina se spaja ravnim segmentom i bilježi); zatvoreno kad završava tamo gdje je počela; use i closed iz vlastitog `Feature` CivilCraft, inače **Samo nacrtano**. Točke bez kote dobivaju 0 (bilježi se). |
| `Spiral` | klotoidne prijelaznice uz `Curve` (ulazna i izlazna; čitaju se kao PI s radijusom i duljinama prijelaznica, zapisuju se natrag s `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | prva mreža koja ima cijevi: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` promjer, `Invert` po cijevi) i `Pipe` (`refStart`, `refEnd`, `CircPipe` promjer) |

## Preskočeno i navedeno u bilješkama

- Površine nakon prve, mrežaste površine i ostale površine koje nisu TIN
- Trase koje sadrže `IrregularLine` ili `Chain`, prijelaznice koje nisu klotoida, prijelaznica između dviju krivina ili trase bez geometrije
- Projektirani profili nakon prvog; vertikalne krivine `CircCurve` i `UnsymParaCurve` (njihove PVI točke se čuvaju bez krivine)
- Točke koje samo upućuju na druge točke (`pntRef`) i točke bez čitljivih koordinata
- Ponovljeni nazivi točaka (zadržava se prvi)
- Skrivene, prikazane i granice za izrezivanje podataka; linije loma bez 3D točaka
- Mreže cijevi nakon prve; vrste mreža osim storm i sanitary (čitaju se kao storm)
- Pravokutne, ulazne i izlazne građevine (čitaju se kao okrugle); jajaste, eliptične i kutijaste cijevi i kanali (čitaju se kao okrugle cijevi bez veličine)
- Elementi `Spiral` u značajnim linijama
- `Parcels`, `Roadways`, `GradeModel` i `Survey`

Profili terena (`ProfSurf`) u datoteci se ne koriste: CivilCraft uzima teren iz same površine.

## Poruke kad se datoteka ne može otvoriti

| Poruka | Značenje |
|---|---|
| "Ovo je XML, ali ne LandXML (korijenski element je <…>)." | Datoteka je druga vrsta XML-a. |
| "… nema točaka, TIN površina ni trasa koje CivilCraft može čitati." | Sve u datoteci je na popisu preskočenog. Bilješke iza nje kažu što je bilo. |
| "Neodgovarajuća završna oznaka …", "Nezatvorena oznaka …", "Datoteka završava unutar …" | Datoteka je oštećena ili skraćena. |
