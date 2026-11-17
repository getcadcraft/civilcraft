---
title: LandXML: ko nolasa un ko raksta
summary: LandXML 1.2 elementi un atribūti, ko CivilCraft nolasa un raksta, pa elementam, un viss, ko tas izlaiž.
keywords: landxml, xml, cgpoints, virsma, tin, lūzumlīnijas, robeža, trase, coordgeom, profils, profalign, pvi, paracurve, pipenetworks, struct, caurule, planfeatures, planfeature, elementa līnija, shēma
from: ca3cf359
---

CivilCraft raksta LandXML 1.2 ar oficiālo vārdtelpu un shēmas atrašanās vietu. Tas nolasa jebkuru failu, kura saknes elements ir `LandXML`, un ņem zemāk uzskaitītos elementus pēc nosaukuma (vārdtelpu prefiksi tiek ignorēti; versija netiek pārbaudīta). Tā XML lasītājs pieņem tikai piecas standarta entītijas un skaitliskās rakstzīmju atsauces; tas nekad neielādē DTD vai ārēju failu. Soļiem skatiet [Apmaiņa ar LandXML](topic:landxml).

LandXML raksta koordinātas ar ziemeļiem pirmajā vietā: punkts ir "N E" vai "N E Z".

## Ko raksta

| Elements | Ko raksta CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, platības kvadrātpēdās, tilpumi kubikjardos, diametri collās) vai `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = projekta nosaukums |
| `Application` | nosaukums CivilCraft, ražotājs CadCraft |
| `CgPoints` / `CgPoint` | `name` = punkta numurs, `desc` = apraksts, `code` = grupa; teksts "N E Z" (vai "N E" bez augstuma) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw vai ccw, `radius`, `length`, `staStart`, `chord`, `delta` (grādi), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | esošā zeme gar trasi kā stacijas un augstuma pāri (`PntList2D`), sadalīta vietā, kur tā atstāj virsmu |
| `Profile` / `ProfAlign` | projektētais profils (nosaukts "<alignment> design"): `PVI` galiem un leņķu punktiem, `ParaCurve` ar `length` vertikālajām līknēm |
| `Surfaces` / `Surface` | `name` un `desc`; vispirms esošā zeme, tad "Proposed", kad platformas vai koridori veido reljefu |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (tikai esošā zeme) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (tikai esošā zeme, ja tāda ir) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` ar `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm vai sanitary |
| `Struct` | `name`, `elevRim` (izmantotā akas mala, uzstādīta vai no virsmas), `elevSump`; `Center`; `CircStruct` ar `diameter`; `Invert` ar `elev`, `flowDir` in vai out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` ar `diameter` |
| `PlanFeatures` / `PlanFeature` | viens katrai elementa līnijai: `name`; `CoordGeom` ar `Line` (`length`, `Start`, `End`) un `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` un `End` kā "N E Z", `Center` kā "N E"); `Feature` ar `code="CivilCraft"`, `Property` lietojumu un slēgts |

Nav rakstīts: platformas un koridori kā objekti (to rezultāts ir virsma "Proposed"), trases ar kļūdām, caurules bez abiem dibena augstumiem, tīkla noteikumi.

## Ko nolasa

| Elements | Ko ņem CivilCraft |
|---|---|
| `Units` | `Imperial` vai `Metric`, un tā `linearUnit` nosaka pēdas vai metrus. Nezināma mērvienība tiek atzīmēta. |
| `Project` | `name` kļūst par projekta nosaukumu. |
| `CgPoints` / `CgPoint` (arī iekrāmēti) | nosaukums (vai `oID`), "N E" vai "N E Z", `desc` (vai `code`) kā apraksts |
| `Surface` ar `Definition surfType="TIN"` | `Pnts` un `Faces` kā esošā zeme (tikai pirmā virsma); neredzamās šķautnes (`i="1"`) tiek izlaistas |
| `SourceData` / `Breaklines` | 3D lūzumlīnijas, saglabātas kopā ar virsmu |
| `SourceData` / `Boundaries` | ārējā robeža |
| `Alignment` / `CoordGeom` | elementi `Line` un `Curve`; PI atjaunoti no katras līknes `PI` vai no tās `Center` un tangentēm; `staStart` |
| `Profile` / `ProfAlign` | `PVI` un `ParaCurve` (ar `length`); pirmais projektētais profils ar vismaz diviem PVI |
| `PlanFeatures` / `PlanFeature` | katra kā elementa līnija: `Line`, `Curve` (tās `Start`, `Center`, `End` un `rot`) un `IrregularLine` (`PntList3D` vai `PntList2D`), savienoti gali pie gala (sprauga tiek savienota ar taisnu segmentu un atzīmēta); slēgta, ja beidzas tur, kur sākās; lietojums un slēgts no CivilCraft paša `Feature`, citādi **Tikai uzzīmēts**. Punkti bez augstuma saņem 0 (atzīmēts). |
| `Spiral` | klotoīdas spirāles blakus `Curve` (ieejā un izejā; nolasītas kā PI ar rādiusu un spirāļu garumiem, atpakaļ rakstītas ar `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | pirmais tīkls, kuram ir caurules: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diametrs, `Invert` katrai caurulei) un `Pipe` (`refStart`, `refEnd`, `CircPipe` diametrs) |

## Izlaists, un piezīmēs minēts

- Virsmas pēc pirmās, režģa virsmas un citas ne-TIN virsmas
- Trases, kurās ir elementi `IrregularLine` vai `Chain`, spirāles, kas nav klotoīdas, spirāle starp divām līknēm vai trases bez ģeometrijas
- Projektētie profili pēc pirmā; `CircCurve` un `UnsymParaCurve` vertikālās līknes (to PVI saglabāti bez līknes)
- Punkti, kas tikai atsaucas uz citiem punktiem (`pntRef`), un punkti bez nolasāmām koordinātām
- Atkārtoti punktu nosaukumi (paturēts pirmais)
- Paslēpšanas, rādīšanas un datu apgriešanas robežas; lūzumlīnijas bez 3D punktiem
- Cauruļu tīkli pēc pirmā; tīklu veidi, kas nav storm un sanitary (nolasīti kā storm)
- Taisnstūra, ieplūdes un izplūdes konstrukcijas (nolasītas kā apaļas); olveida, elipšu un kastveida caurules un kanāli (nolasīti kā apaļas caurules bez izmēra)
- Elementi `Spiral` elementu līnijās
- `Parcels`, `Roadways`, `GradeModel` un `Survey`

Zemes profili (`ProfSurf`) failā netiek izmantoti: CivilCraft zemi ņem no pašas virsmas.

## Ziņojumi, kad fails neatveras

| Ziņojums | Nozīme |
|---|---|
| "This is XML but not LandXML (its root element is <…>)." — "Šis ir XML, bet nav LandXML (tā saknes elements ir <…>)." | Fails ir cita veida XML. |
| "… has no points, TIN surfaces or alignments CivilCraft can read." — "… nav punktu, TIN virsmu vai trašu, ko CivilCraft var nolasīt." | Viss faila saturs ir izlaistajā sarakstā. Tam sekojošās piezīmes saka, kas tur bija. |
| "Mismatched end tag …", "Unclosed tag …", "The file ends inside …" — "Neatbilstoša beigu atzīme …", "Neaizvērta atzīme …", "Fails beidzas …" | Fails ir bojāts vai saīsināts. |
