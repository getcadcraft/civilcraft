---
title: LandXML: hvad der læses og skrives
summary: LandXML 1.2-elementerne og attributterne, CivilCraft læser og skriver, element for element, og alt det, det springer over.
keywords: landxml, xml, cgpoints, overflade, tin, brudlinjer, afgrænsning, tracé, coordgeom, profil, profalign, pvi, paracurve, pipenetworks, struct, rør, planfeatures, planfeature, feature-linje, skema
from: ca3cf359
---

CivilCraft skriver LandXML 1.2 med det officielle navnerum og schema-placeringen. Det læser enhver fil, hvis rodelement er `LandXML`, og tager de nedenstående elementer ud fra navn (navnerumsprefikser ignoreres; versionen kontrolleres ikke). Dens XML-læser accepterer kun de fem standardentiteter og numeriske tegnreferencer; den indlæser aldrig en DTD eller en ekstern fil. For trinene, se [Udveksl LandXML](topic:landxml).

LandXML skriver koordinater med nord først: et punkt er "N E" eller "N E Z".

## Skrevet

| Element | Hvad CivilCraft skriver |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, arealer i kvadratfod, rumfang i kubikyards, diametre i tommer) eller `Metric` (meter, kvadratmeter, kubikmeter, millimeter) |
| `Project` | `name` = projektnavnet |
| `Application` | navn CivilCraft, producent CadCraft |
| `CgPoints` / `CgPoint` | `name` = punktnummer, `desc` = beskrivelse, `code` = gruppe; tekst "N E Z" (eller "N E" uden kote) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw eller ccw, `radius`, `length`, `staStart`, `chord`, `delta` (grader), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | det eksisterende terræn langs tracéet, som par af station og kote (`PntList2D`), delt der, hvor det forlader overfladen |
| `Profile` / `ProfAlign` | den projekterede profil (navngivet "<tracé> design"): `PVI` for ender og vinkelpunkter, `ParaCurve` med `length` for lodrette kurver |
| `Surfaces` / `Surface` | `name` og `desc`; først det eksisterende terræn, derefter "Proposed", når byggeplateauer eller korridorer planeres |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (kun eksisterende terræn) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (kun eksisterende terræn, når der er en) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` med `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm eller sanitary |
| `Struct` | `name`, `elevRim` (den brugte rand, sat eller fra overfladen), `elevSump`; `Center`; `CircStruct` med `diameter`; `Invert` med `elev`, `flowDir` in eller out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` med `diameter` |
| `PlanFeatures` / `PlanFeature` | én pr. feature-linje: `name`; `CoordGeom` med `Line` (`length`, `Start`, `End`) og `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` og `End` som "N E Z", `Center` som "N E"); `Feature` `code="CivilCraft"` med `Property` use og closed |

Ikke skrevet: byggeplateauer og korridorer som objekter (deres resultat er overfladen "Proposed"), tracéer med fejl, rør uden begge inverter og netværksregler.

## Læst

| Element | Hvad CivilCraft tager |
|---|---|
| `Units` | `Imperial` eller `Metric`, og dens `linearUnit`, afgør fod eller meter. En ukendt enhed noteres. |
| `Project` | `name` bliver projektnavnet. |
| `CgPoints` / `CgPoint` (også indlejrede) | navn (eller `oID`), "N E" eller "N E Z", `desc` (eller `code`) som beskrivelse |
| `Surface` med `Definition surfType="TIN"` | `Pnts` og `Faces` som det eksisterende terræn (kun første overflade); usynlige flader (`i="1"`) udelades |
| `SourceData` / `Breaklines` | 3D-brudlinjer, bevaret med overfladen |
| `SourceData` / `Boundaries` | den ydre afgrænsning |
| `Alignment` / `CoordGeom` | `Line`- og `Curve`-elementer; PI'er genskabes ud fra hver kurves `PI`, eller fra dens `Center` og tangenter; `staStart` |
| `Profile` / `ProfAlign` | `PVI` og `ParaCurve` (med `length`); den første projekterede profil med mindst to PVI'er |
| `PlanFeatures` / `PlanFeature` | hver enkelt som en feature-linje: `Line`, `Curve` (dens `Start`, `Center`, `End` og `rot`) og `IrregularLine` (`PntList3D` eller `PntList2D`) samlet ende til ende (et hul samles med et ret segment og noteres); lukket, når den ender, hvor den begyndte; brug og lukket fra CivilCraft's egen `Feature`, ellers **Kun tegnet**. Punkter uden kote får 0 (noteret). |
| `Spiral` | klothoide-spiraler ved siden af en `Curve` (ind og ud; læses som et PI med en radius og spiral-længder, og skrives tilbage med `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | det første netværk, der har rør: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` pr. rør) og `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Sprunget over og nævnt i noterne

- Overflader efter den første, gitteroverflader og andre overflader end TIN
- Tracéer, der indeholder `IrregularLine`- eller `Chain`-elementer, spiraler andre end klothoide, en spiral mellem to kurver, eller som ikke har nogen geometri
- Projekterede profiler efter den første; `CircCurve`- og `UnsymParaCurve`-lodrette kurver (deres PVI'er beholdes uden kurve)
- Punkter, der kun henviser til andre punkter (`pntRef`), og punkter uden læsbare koordinater
- Gentagne punktnavne (den første beholdes)
- Skjul-, vis- og dataklip-afgrænsninger; brudlinjer uden 3D-punkter
- Rørnetværk efter det første; netværkstyper andet end storm og sanitary (læses som storm)
- Rektangulære, indløbs- og udløbsbrønde (læses som runde); æg-, elliptiske og kasseformede rør og kanaler (læses som runde rør uden størrelse)
- `Spiral`-elementer i planfeatures
- `Parcels`, `Roadways`, `GradeModel` og `Survey`

Terrænprofiler (`ProfSurf`) i en fil bruges ikke: CivilCraft henter terrænet fra selve overfladen.

## Beskeder, når en fil ikke kan åbnes

| Besked | Betydning |
|---|---|
| »Dette er XML, men ikke LandXML (dens rodelement er <…>).« | Filen er en anden type XML. |
| »… har ingen punkter, TIN-overflader eller tracéer, som CivilCraft kan læse.« | Alt i filen står på listen over det sprungne. Noterne efter den siger, hvad der var der. |
| »Forkert slutttag …«, »Uafsluttet tag …«, »Filen slutter inde i …« | Filen er beskadiget eller afkortet. |
