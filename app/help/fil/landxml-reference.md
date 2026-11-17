---
title: LandXML: ano ang binabasa at isinusulat
summary: Ang mga elemento at attribute ng LandXML 1.2 na binabasa at isinusulat ng CivilCraft, elemento por elemento, at ang lahat ng nilalaktawan nito.
keywords: landxml, xml, cgpoints, surface, tin, breaklines, hangganan, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, tubo, planfeatures, planfeature, feature line, schema
from: ca3cf359
---

Sumusulat ang CivilCraft ng LandXML 1.2 gamit ang opisyal na namespace at schema location. Binabasa nito ang anumang file na ang root element ay `LandXML` at kinukuha ang mga elemento sa ibaba ayon sa pangalan (hindi pinapansin ang namespace prefix; hindi sinusuri ang bersyon). Limang standard na entity at numeric character reference lamang ang tinatanggap ng XML reader nito; hindi ito kailanman naglo-load ng DTD o external na file. Para sa mga hakbang, tingnan ang [I-exchange ang LandXML](topic:landxml).

Ang LandXML ay sumusulat ng coordinates na northing muna: ang punto ay "N E" o "N E Z".

## Isinusulat

| Elemento | Ano ang isinusulat ng CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, lawak sa square feet, volume sa cubic yard, diameter sa inches) o `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = pangalan ng project |
| `Application` | pangalang CivilCraft, manufacturer CadCraft |
| `CgPoints` / `CgPoint` | `name` = numero ng punto, `desc` = paglalarawan, `code` = grupo; text na "N E Z" (o "N E" kung walang elevation) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw o ccw, `radius`, `length`, `staStart`, `chord`, `delta` (degrees), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | ang umiiral na ground sa kahabaan ng alignment, bilang station at elevation pairs (`PntList2D`), hinahati kung saan ito lumalabas sa surface |
| `Profile` / `ProfAlign` | ang design profile (pinangalanang "<alignment> design"): `PVI` para sa dulo at angle point, `ParaCurve` na may `length` para sa vertical curve |
| `Surfaces` / `Surface` | `name` at `desc`; una ang umiiral na ground, pagkatapos ang "Proposed" kapag may pad o corridor na nagra-grade |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (umiiral na ground lamang) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (umiiral na ground lamang, kung mayroon) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` na may `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm o sanitary |
| `Struct` | `name`, `elevRim` (ang rim na ginamit, itinakda o galing sa surface), `elevSump`; `Center`; `CircStruct` na may `diameter`; `Invert` na may `elev`, `flowDir` in o out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` na may `diameter` |
| `PlanFeatures` / `PlanFeature` | isa bawat feature line: `name`; `CoordGeom` na may `Line` (`length`, `Start`, `End`) at `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` at `End` bilang "N E Z", `Center` bilang "N E"); `Feature` `code="CivilCraft"` na may `Property` use at closed |

Hindi isinusulat: pad at corridor bilang object (ang resulta nila ay ang surface na "Proposed"), mga alignment na may error, mga tubo na walang parehong invert, mga network rule.

## Binabasa

| Elemento | Ano ang kinukuha ng CivilCraft |
|---|---|
| `Units` | Ang `Imperial` o `Metric` at ang `linearUnit` nito ang nagpapasya kung feet o metro. Itinatala ang hindi kilalang unit. |
| `Project` | Ang `name` ay nagiging pangalan ng project. |
| `CgPoints` / `CgPoint` (kasama ang nested) | pangalan (o `oID`), "N E" o "N E Z", `desc` (o `code`) bilang paglalarawan |
| `Surface` na may `Definition surfType="TIN"` | `Pnts` at `Faces` bilang umiiral na ground (unang surface lamang); hindi kasama ang mga invisible face (`i="1"`) |
| `SourceData` / `Breaklines` | 3D breakline, itinatago kasama ng surface |
| `SourceData` / `Boundaries` | ang outer boundary |
| `Alignment` / `CoordGeom` | elemento ng `Line` at `Curve`; muling binubuo ang PI mula sa `PI` ng bawat curve, o mula sa `Center` at tangent nito; `staStart` |
| `Profile` / `ProfAlign` | `PVI` at `ParaCurve` (na may `length`); ang unang design profile na may kahit dalawang PVI |
| `PlanFeatures` / `PlanFeature` | bawat isa bilang feature line: `Line`, `Curve` (ang `Start`, `Center`, `End` at `rot` nito) at `IrregularLine` (`PntList3D` o `PntList2D`) na pinagdurugtong nang dulo-sa-dulo (ang puwang ay dinudugtong ng tuwid na segment at itinatala); sarado kapag nagtatapos kung saan nagsimula; use at closed mula sa sariling `Feature` ng CivilCraft, kung hindi ay **Only drawn**. Ang mga punto na walang elevation ay nakakakuha ng 0 (itinatala). |
| `Spiral` | clothoid spiral sa tabi ng `Curve` (papasok at palabas; binabasa bilang PI na may radius at haba ng spiral, isinusulat pabalik gamit ang `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | ang unang network na may tubo: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` bawat tubo) at `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Nilalaktawan, at binabanggit sa mga tala

- Mga surface pagkatapos ng una, grid surface at iba pang surface na hindi TIN
- Mga alignment na may elemento ng `IrregularLine` o `Chain`, spiral na hindi clothoid, spiral sa pagitan ng dalawang curve, o walang geometry
- Mga design profile pagkatapos ng una; mga vertical curve na `CircCurve` at `UnsymParaCurve` (pinapanatili ang kanilang PVI nang walang curve)
- Mga punto na tumutukoy lamang sa ibang punto (`pntRef`), at mga punto na walang nababasang coordinates
- Mga paulit-ulit na pangalan ng punto (pinananatili ang una)
- Hide, show at data-clip na boundary; mga breakline na walang 3D point
- Mga pipe network pagkatapos ng una; mga uri ng network maliban sa storm at sanitary (binabasa bilang storm)
- Mga rectangular, inlet at outlet na structure (binabasa bilang bilog); egg, elliptical at box na tubo at channel (binabasa bilang bilog na tubo na walang laki)
- Mga elemento ng `Spiral` sa plan feature
- `Parcels`, `Roadways`, `GradeModel` at `Survey`

Hindi ginagamit ang mga ground profile (`ProfSurf`) sa isang file: kumukuha ng sample ang CivilCraft ng ground mula mismo sa surface.

## Mga mensahe kapag hindi mabuksan ang file

| Mensahe | Ibig sabihin |
|---|---|
| "Ito ay XML pero hindi LandXML (ang root element nito ay <…>)." | Ibang uri ng XML ang file. |
| "… ay walang points, TIN surfaces o alignment na mababasa ng CivilCraft." | Nasa listahan ng nilalaktawan ang lahat ng nasa file. Sinasabi ng mga tala pagkatapos nito kung ano ang naroon. |
| "Hindi tugmang end tag …", "Hindi nasarang tag …", "Natatapos ang file sa loob ng …" | Sira o putol ang file. |
