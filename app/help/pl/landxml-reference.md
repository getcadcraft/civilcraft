---
title: LandXML: co jest odczytywane i zapisywane
summary: Elementy i atrybuty LandXML 1.2, które CivilCraft odczytuje i zapisuje, element po elemencie, oraz wszystko, co pomija.
keywords: landxml, xml, cgpoints, powierzchnia, tin, linie wymuszające, granica, trasa, coordgeom, profil, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, linia charakterystyczna, schemat
from: ca3cf359
---

CivilCraft zapisuje LandXML 1.2 z oficjalną przestrzenią nazw i lokalizacją schematu. Odczytuje każdy plik, którego element główny to `LandXML`, i pobiera poniższe elementy po nazwie (prefiksy przestrzeni nazw są ignorowane; wersja nie jest sprawdzana). Jego czytnik XML akceptuje tylko pięć standardowych encji i numeryczne referencje znaków; nigdy nie wczytuje DTD ani pliku zewnętrznego. Kroki znajdziesz w [Wymiana LandXML](topic:landxml).

LandXML zapisuje współrzędne zaczynając od północy: punkt to „N E” albo „N E Z”.

## Zapisywane

| Element | Co zapisuje CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, pola w stopach kwadratowych, objętości w jardach sześciennych, średnice w calach) albo `Metric` (metr, metr kwadratowy, metr sześcienny, milimetr) |
| `Project` | `name` = nazwa projektu |
| `Application` | nazwa CivilCraft, producent CadCraft |
| `CgPoints` / `CgPoint` | `name` = numer punktu, `desc` = opis, `code` = grupa; tekst „N E Z” (albo „N E” bez rzędnej) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw lub ccw, `radius`, `length`, `staStart`, `chord`, `delta` (stopnie), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | istniejący teren wzdłuż trasy, jako pary kilometraż i rzędna (`PntList2D`), podzielony tam, gdzie opuszcza powierzchnię |
| `Profile` / `ProfAlign` | profil projektowy (nazwany „<alignment> design”): `PVI` dla końców i punktów załamania, `ParaCurve` z `length` dla łuków pionowych |
| `Surfaces` / `Surface` | `name` i `desc`; najpierw istniejący teren, potem „Proposed”, gdy place lub korytarze są niwelowane |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (tylko istniejący teren) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (tylko istniejący teren, gdy taki jest) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` z `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm lub sanitary |
| `Struct` | `name`, `elevRim` (użyty wieniec, ustawiony lub z powierzchni), `elevSump`; `Center`; `CircStruct` z `diameter`; `Invert` z `elev`, `flowDir` in lub out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` z `diameter` |
| `PlanFeatures` / `PlanFeature` | jeden na linię charakterystyczną: `name`; `CoordGeom` z `Line` (`length`, `Start`, `End`) i `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` i `End` jako „N E Z”, `Center` jako „N E”); `Feature` `code="CivilCraft"` z zastosowaniem w `Property` i informacją o zamknięciu |

Nie są zapisywane: place i korytarze jako obiekty (ich wynikiem jest powierzchnia „Proposed”), trasy z błędami, rury bez obu rzędnych dna oraz reguły sieci.

## Odczytywane

| Element | Co pobiera CivilCraft |
|---|---|
| `Units` | `Imperial` lub `Metric` oraz ich `linearUnit` decydują, czy są to stopy, czy metry. Nieznana jednostka jest zaznaczana. |
| `Project` | `name` staje się nazwą projektu. |
| `CgPoints` / `CgPoint` (także zagnieżdżone) | nazwa (lub `oID`), „N E” lub „N E Z”, `desc` (lub `code`) jako opis |
| `Surface` z `Definition surfType="TIN"` | `Pnts` i `Faces` jako istniejący teren (tylko pierwsza powierzchnia); niewidoczne ściany (`i="1"`) są pomijane |
| `SourceData` / `Breaklines` | linie wymuszające 3D, zachowane z powierzchnią |
| `SourceData` / `Boundaries` | zewnętrzna granica |
| `Alignment` / `CoordGeom` | elementy `Line` i `Curve`; PI odtwarzane z `PI` każdego łuku albo z jego `Center` i stycznych; `staStart` |
| `Profile` / `ProfAlign` | `PVI` i `ParaCurve` (z `length`); pierwszy profil projektowy z co najmniej dwoma PVI |
| `PlanFeatures` / `PlanFeature` | każdy jako linia charakterystyczna: `Line`, `Curve` (jej `Start`, `Center`, `End` i `rot`) oraz `IrregularLine` (`PntList3D` lub `PntList2D`) połączone od końca do końca (przerwa jest łączona odcinkiem prostym i zaznaczana); zamknięta, gdy kończy się tam, gdzie się zaczyna; zastosowanie i zamknięcie z własnego `Feature` CivilCraft, w przeciwnym razie **Only drawn**. Punkty bez rzędnej dostają 0 (zaznaczane). |
| `Spiral` | klotoidy obok `Curve` (wejście i wyjście; odczytywane jako PI z promieniem i długościami spiral, zapisywane z `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | pierwsza sieć, która ma rury: `Struct` (`Center`, `elevRim`, `elevSump`, średnica `CircStruct`, `Invert` na rurę) i `Pipe` (`refStart`, `refEnd`, średnica `CircPipe`) |

## Pominięte, z wymienieniem w uwagach

- Powierzchnie po pierwszej, powierzchnie siatkowe i inne powierzchnie niebędące TIN
- Trasy zawierające elementy `IrregularLine` lub `Chain`, spirale inne niż klotoidy, spirala między dwoma łukami albo trasy bez geometrii
- Profile projektowe po pierwszym; łuki pionowe `CircCurve` i `UnsymParaCurve` (ich PVI są zachowane bez łuku)
- Punkty, które odnoszą się tylko do innych punktów (`pntRef`), oraz punkty bez czytelnych współrzędnych
- Powtórzone nazwy punktów (zachowany jest pierwszy)
- Granice ukrywające, pokazujące i przycinające dane; linie wymuszające bez punktów 3D
- Sieci rurociągów po pierwszej; typy sieci inne niż storm i sanitary (odczytywane jako storm)
- Konstrukcje prostokątne, wlotowe i wylotowe (odczytywane jako okrągłe); rury i kanały jajowe, eliptyczne i skrzynkowe (odczytywane jako okrągłe rury bez rozmiaru)
- Elementy `Spiral` w liniach charakterystycznych
- `Parcels`, `Roadways`, `GradeModel` i `Survey`

Profile terenu (`ProfSurf`) w pliku nie są używane: CivilCraft pobiera teren z samej powierzchni.

## Komunikaty, gdy plik się nie otwiera

| Komunikat | Znaczenie |
|---|---|
| „To jest XML, ale nie LandXML (jego element główny to <…>).” | Plik jest innym rodzajem XML. |
| „… nie ma punktów, powierzchni TIN ani tras, które CivilCraft umie odczytać.” | Wszystko w pliku jest na liście pominiętych. Uwagi po nim mówią, co tam było. |
| „Niezgodny znacznik zamknięcia …”, „Niezamknięty znacznik …”, „Plik kończy się wewnątrz …” | Plik jest uszkodzony lub urwany. |
