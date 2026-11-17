---
title: LandXML: vad som läses och skrivs
summary: LandXML 1.2-elementen och attributen som CivilCraft läser och skriver, element för element, och allt det hoppar över.
keywords: landxml, xml, cgpoints, terrängmodell, tin, brytlinjer, avgränsning, linjeföring, coordgeom, profil, profalign, pvi, paracurve, pipenetworks, struct, ledning, planfeatures, planfeature, funktionslinje, schema
from: ca3cf359
---

CivilCraft skriver LandXML 1.2 med den officiella namnrymden och schemaplatsen. Den läser alla filer vars rotelement är `LandXML` och tar elementen nedan efter namn (namnrymdsprefix ignoreras; versionen kontrolleras inte). Dess XML-läsare accepterar endast de fem standardentiteterna och numeriska teckenreferenser; den läser aldrig en DTD eller en extern fil. För stegen, se [Utbyt LandXML](topic:landxml).

LandXML skriver koordinater med nordvärde först: en punkt är "N E" eller "N E Z".

## Skrivet

| Element | Vad CivilCraft skriver |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, ytor i kvadratfot, volymer i kubikyard, diametrar i tum) eller `Metric` (meter, kvadratmeter, kubikmeter, millimeter) |
| `Project` | `name` = projektnamnet |
| `Application` | namn CivilCraft, tillverkare CadCraft |
| `CgPoints` / `CgPoint` | `name` = punktnummer, `desc` = beskrivning, `code` = grupp; text "N E Z" (eller "N E" utan höjd) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw eller ccw, `radius`, `length`, `staStart`, `chord`, `delta` (grader), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | den befintliga marken längs linjeföringen, som par av station och höjd (`PntList2D`), delad där den lämnar terrängmodellen |
| `Profile` / `ProfAlign` | projekteringsprofilen (namnad "<alignment> design"): `PVI` för ände- och vinkelpunkter, `ParaCurve` med `length` för vertikalkurvor |
| `Surfaces` / `Surface` | `name` och `desc`; först den befintliga marken, sedan "Proposed" när byggplattor eller korridorer planeras |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (endast befintlig mark) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (endast befintlig mark, när en finns) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` med `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm eller sanitary |
| `Struct` | `name`, `elevRim` (den använda brunnskanten, angiven eller från terrängmodellen), `elevSump`; `Center`; `CircStruct` med `diameter`; `Invert` med `elev`, `flowDir` in eller out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` med `diameter` |
| `PlanFeatures` / `PlanFeature` | en per funktionslinje: `name`; `CoordGeom` med `Line` (`length`, `Start`, `End`) och `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` och `End` som "N E Z", `Center` som "N E"); `Feature` `code="CivilCraft"` med `Property` användning och stängd |

Skrivs inte: byggplattor och korridorer som objekt (resultatet är ytan "Proposed"), linjeföringar med fel, ledningar utan båda bottennivåerna, nätverksregler.

## Läst

| Element | Vad CivilCraft tar |
|---|---|
| `Units` | `Imperial` eller `Metric` och dess `linearUnit` avgör om fot eller meter används. En okänd enhet anges. |
| `Project` | `name` blir projektnamnet. |
| `CgPoints` / `CgPoint` (även nästlade) | namn (eller `oID`), "N E" eller "N E Z", `desc` (eller `code`) som beskrivning |
| `Surface` med `Definition surfType="TIN"` | `Pnts` och `Faces` som befintlig mark (endast första ytan); osynliga ytor (`i="1"`) utelämnas |
| `SourceData` / `Breaklines` | 3D-brytlinjer, behålls med ytan |
| `SourceData` / `Boundaries` | den yttre avgränsningen |
| `Alignment` / `CoordGeom` | `Line`- och `Curve`-element; PI byggs om från varje kurvas `PI`, eller från dess `Center` och tangenter; `staStart` |
| `Profile` / `ProfAlign` | `PVI` och `ParaCurve` (med `length`); den första projekteringsprofilen med minst två PVI |
| `PlanFeatures` / `PlanFeature` | var och en som en funktionslinje: `Line`, `Curve` (dess `Start`, `Center`, `End` och `rot`) och `IrregularLine` (`PntList3D` eller `PntList2D`) sammanfogade ände mot ände (ett gap sammanfogas med ett rakt segment och anges); stängd när den slutar där den började; användning och stängd från CivilCrafts egna `Feature`, annars **Endast ritad**. Punkter utan höjd får 0 (anges). |
| `Spiral` | klotoidspiraler bredvid en `Curve` (in och ut; läses som en PI med radie och spirallängder, skrivs tillbaka med `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | det första nätverket som har ledningar: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` per ledning) och `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Hoppas över, och anges i noterna

- Ytor efter den första, gridytor och andra icke-TIN-ytor
- Linjeföringar som innehåller `IrregularLine`- eller `Chain`-element, spiraler som inte är klotoid, en spiral mellan två kurvor, eller som saknar geometri
- Projekteringsprofiler efter den första; vertikalkurvorna `CircCurve` och `UnsymParaCurve` (deras PVI behålls utan kurva)
- Punkter som bara hänvisar till andra punkter (`pntRef`), och punkter utan läsbara koordinater
- Upprepade punktnamn (den första behålls)
- Dölj-, visa- och datakliparavgränsningar; brytlinjer utan 3D-punkter
- Ledningsnät efter det första; nätverkstyper utöver storm och sanitary (läses som storm)
- Rektangulära, inlopps- och utloppsbrunnar (läses som runda); ägg-, elliptiska och lådrör och kanaler (läses som runda rör utan dimension)
- `Spiral`-element i funktionslinjer
- `Parcels`, `Roadways`, `GradeModel` och `Survey`

Markprofiler (`ProfSurf`) i en fil används inte: CivilCraft samplar marken från själva terrängmodellen.

## Meddelanden när en fil inte går att öppna

| Meddelande | Betydelse |
|---|---|
| "Det här är XML men inte LandXML (dess rotelement är <…>)." | Filen är en annan sorts XML. |
| "… har inga punkter, TIN-ytor eller linjeföringar som CivilCraft kan läsa." | Allt i filen finns i listan över det som hoppas över. Noterna efter den anger vad som fanns. |
| "Felaktig sluttagg …", "Oavslutad tagg …", "Filen slutar inuti …" | Filen är skadad eller avkortad. |
