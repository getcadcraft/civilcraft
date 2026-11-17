---
title: LandXML: ce se citește și ce se scrie
summary: Elementele și atributele LandXML 1.2 pe care CivilCraft le citește și le scrie, element cu element, și tot ce omite.
keywords: landxml, xml, cgpoints, model de teren, TIN, linii de rupere, limită, aliniament, coordgeom, profil, profalign, pvi, paracurve, pipenetworks, struct, conductă, planfeatures, planfeature, linie caracteristică, schemă
from: ca3cf359
---

CivilCraft scrie LandXML 1.2 cu spațiul de nume oficial și locația schemei. Citește orice fișier al cărui element rădăcină este `LandXML` și ia elementele de mai jos după nume (prefixele de spațiu de nume sunt ignorate; versiunea nu se verifică). Cititorul său XML acceptă numai cele cinci entități standard și referințele numerice la caractere; nu încarcă niciodată un DTD sau un fișier extern. Pentru pași, vedeți [Schimbul de date LandXML](topic:landxml).

LandXML scrie coordonatele începând cu nordul: un punct este „N E” sau „N E Z”.

## Scris

| Element | Ce scrie CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, suprafețe în picioare pătrate, volume în yarzi cubi, diametre în țoli) sau `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = numele proiectului |
| `Application` | nume CivilCraft, producător CadCraft |
| `CgPoints` / `CgPoint` | `name` = numărul punctului, `desc` = descrierea, `code` = grupul; text „N E Z” (sau „N E” fără cotă) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw sau ccw, `radius`, `length`, `staStart`, `chord`, `delta` (grade), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | terenul natural de-a lungul aliniamentului, ca perechi stație și cotă (`PntList2D`), împărțit acolo unde iese de la suprafață |
| `Profile` / `ProfAlign` | profilul de proiectare (numit "<alignment> design"): `PVI` pentru capete și puncte de unghi, `ParaCurve` cu `length` pentru curbele verticale |
| `Surfaces` / `Surface` | `name` și `desc`; întâi terenul natural, apoi "Proposed" când platformele sau coridoarele sunt sistematizate |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (numai terenul natural) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (numai terenul natural, când există) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` cu `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm sau sanitary |
| `Struct` | `name`, `elevRim` (cota gurii folosite, fixată sau din suprafață), `elevSump`; `Center`; `CircStruct` cu `diameter`; `Invert` cu `elev`, `flowDir` in sau out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` cu `diameter` |
| `PlanFeatures` / `PlanFeature` | câte una pentru fiecare linie caracteristică: `name`; `CoordGeom` cu `Line` (`length`, `Start`, `End`) și `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` și `End` ca „N E Z”, `Center` ca „N E”); `Feature` `code="CivilCraft"` cu `Property` use și closed |

Nu se scriu: platformele și coridoarele ca obiecte (rezultatul lor este suprafața "Proposed"), aliniamentele cu erori, conductele fără ambele radiere, regulile rețelei.

## Citit

| Element | Ce ia CivilCraft |
|---|---|
| `Units` | `Imperial` sau `Metric` și `linearUnit` decid între picioare sau metri. O unitate necunoscută este notată. |
| `Project` | `name` devine numele proiectului. |
| `CgPoints` / `CgPoint` (și imbricate) | nume (sau `oID`), „N E” sau „N E Z”, `desc` (sau `code`) ca descriere |
| `Surface` cu `Definition surfType="TIN"` | `Pnts` și `Faces` ca terenul natural (numai prima suprafață); fețele invizibile (`i="1"`) sunt lăsate deoparte |
| `SourceData` / `Breaklines` | linii de rupere 3D, păstrate cu suprafața |
| `SourceData` / `Boundaries` | limita exterioară |
| `Alignment` / `CoordGeom` | elementele `Line` și `Curve`; PI-urile refăcute din `PI`-ul fiecărei curbe sau din `Center` și tangente; `staStart` |
| `Profile` / `ProfAlign` | `PVI` și `ParaCurve` (cu `length`); primul profil de proiectare cu cel puțin două PVI |
| `PlanFeatures` / `PlanFeature` | fiecare ca linie caracteristică: `Line`, `Curve` (`Start`, `Center`, `End` și `rot`) și `IrregularLine` (`PntList3D` sau `PntList2D`) unite cap la cap (un gol se unește cu un segment drept și este notat); închisă când se termină unde a început; use și closed din `Feature`-ul propriu al CivilCraft, altfel **Doar desenată**. Punctele fără cotă primesc 0 (notat). |
| `Spiral` | spirale clotoide lângă un `Curve` (la intrare și la ieșire; citite ca un PI cu rază și lungimi de spirală, scrise înapoi cu `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | prima rețea care are conducte: `Struct` (`Center`, `elevRim`, `elevSump`, diametrul `CircStruct`, `Invert` pentru fiecare conductă) și `Pipe` (`refStart`, `refEnd`, diametrul `CircPipe`) |

## Omise, numite în note

- Suprafețele după prima, suprafețele de tip grilă și celelalte suprafețe non-TIN
- Aliniamentele care conțin elemente `IrregularLine` sau `Chain`, spiralele altele decât clotoidele, o spirală între două curbe sau cele fără geometrie
- Profilurile de proiectare după primul; curbele verticale `CircCurve` și `UnsymParaCurve` (PVI-urile lor sunt păstrate fără curbă)
- Punctele care se referă numai la alte puncte (`pntRef`) și punctele fără coordonate citibile
- Nume de puncte repetate (se păstrează primul)
- Limitele ascunse, afișate și de decupare a datelor; liniile de rupere fără puncte 3D
- Rețelele de conducte după prima; tipuri de rețele altele decât storm și sanitary (citite ca storm)
- Structurile dreptunghiulare, de intrare și de ieșire (citite ca rotunde); conductele și canalele ovoidale, eliptice și în cutie (citite ca țevi rotunde fără dimensiune)
- Elementele `Spiral` din liniile caracteristice
- `Parcels`, `Roadways`, `GradeModel` și `Survey`

Profilurile de teren (`ProfSurf`) dintr-un fișier nu sunt folosite: CivilCraft eșantionează terenul direct din suprafață.

## Mesaje când un fișier nu se deschide

| Mesaj | Înseamnă |
|---|---|
| "Acesta este XML, dar nu LandXML (elementul rădăcină este <…>)." | Fișierul este alt tip de XML. |
| "… nu are puncte, suprafețe TIN sau aliniamente pe care CivilCraft să le poată citi." | Tot ce este în fișier se află în lista omisă. Notele de după ea spun ce era acolo. |
| "Etichetă de închidere nepotrivită …", "Etichetă nerămasă închisă …", "Fișierul se termină în interiorul …" | Fișierul este deteriorat sau tăiat. |
