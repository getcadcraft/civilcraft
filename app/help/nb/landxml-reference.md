---
title: LandXML: hva som leses og skrives
summary: LandXML 1.2-elementene og attributtene CivilCraft leser og skriver, element for element, og alt det hopper over.
keywords: landxml, xml, cgpoints, overflate, tin, bruddlinjer, grense, linje, coordgeom, profil, profalign, pvi, paracurve, pipenetworks, struct, rør, planfeatures, planfeature, elementlinje, skjema
from: ca3cf359
---

CivilCraft skriver LandXML 1.2 med det offisielle navnerommet og skjemaplasseringen. Den leser alle filer der rotelementet er `LandXML`, og tar elementene under etter navn (navnerom-prefikser ignoreres; versjonen kontrolleres ikke). XML-leseren godtar bare de fem standardentitetene og numeriske tegnreferanser; den laster aldri en DTD eller en ekstern fil. For stegene, se [Utveksle LandXML](topic:landxml).

LandXML skriver koordinater med nord først: et punkt er «N Ø» eller «N Ø Z».

## Skrevet

| Element | Hva CivilCraft skriver |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, arealer i kvadratfot, volumer i kubikkyard, diametre i tommer) eller `Metric` (meter, kvadratmeter, kubikkmeter, millimeter) |
| `Project` | `name` = prosjektnavnet |
| `Application` | navn CivilCraft, produsent CadCraft |
| `CgPoints` / `CgPoint` | `name` = punktnummer, `desc` = beskrivelse, `code` = gruppe; tekst «N Ø Z» (eller «N Ø» uten kote) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw eller ccw, `radius`, `length`, `staStart`, `chord`, `delta` (grader), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | det eksisterende terrenget langs linjen, som par av profilnummer og kote (`PntList2D`), delt der det forlater overflaten |
| `Profile` / `ProfAlign` | designprofilen (kalt «<linje> design»): `PVI` for ender og vinkelpunkter, `ParaCurve` med `length` for vertikalkurver |
| `Surfaces` / `Surface` | `name` og `desc`; først det eksisterende terrenget, deretter «Proposed» når byggeplater eller korridorer graderes |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (bare eksisterende terreng) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (bare eksisterende terreng, når det finnes én) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` med `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm eller sanitary |
| `Struct` | `name`, `elevRim` (kanten som brukes, satt eller hentet fra overflaten), `elevSump`; `Center`; `CircStruct` med `diameter`; `Invert` med `elev`, `flowDir` in eller out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` med `diameter` |
| `PlanFeatures` / `PlanFeature` | ett per elementlinje: `name`; `CoordGeom` med `Line` (`length`, `Start`, `End`) og `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` og `End` som «N Ø Z», `Center` som «N Ø»); `Feature` `code="CivilCraft"` med `Property` use og closed |

Ikke skrevet: byggeplater og korridorer som objekter (resultatet deres er overflaten «Proposed»), linjer med feil, rør uten begge inverter, og nettverksregler.

## Lest

| Element | Hva CivilCraft tar |
|---|---|
| `Units` | `Imperial` eller `Metric` og deres `linearUnit` avgjør fot eller meter. En ukjent enhet noteres. |
| `Project` | `name` blir prosjektnavnet. |
| `CgPoints` / `CgPoint` (også nestet) | navn (eller `oID`), «N Ø» eller «N Ø Z», `desc` (eller `code`) som beskrivelse |
| `Surface` med `Definition surfType="TIN"` | `Pnts` og `Faces` som eksisterende terreng (bare første overflate); usynlige flater (`i="1"`) utelates |
| `SourceData` / `Breaklines` | 3D-bruddlinjer, beholdt med overflaten |
| `SourceData` / `Boundaries` | den ytre grensen |
| `Alignment` / `CoordGeom` | `Line`- og `Curve`-elementer; PI-er bygges på nytt fra hver kurves `PI`, eller fra `Center` og tangenter; `staStart` |
| `Profile` / `ProfAlign` | `PVI` og `ParaCurve` (med `length`); den første designprofilen med minst to PVI-er |
| `PlanFeatures` / `PlanFeature` | hver som en elementlinje: `Line`, `Curve` (dens `Start`, `Center`, `End` og `rot`) og `IrregularLine` (`PntList3D` eller `PntList2D`) satt sammen ende mot ende (et gap settes sammen med et rett segment og noteres); lukket når den ender der den startet; bruk og lukket fra CivilCraft sin egen `Feature`, ellers **Bare tegnet**. Punkter uten kote får 0 (noteres). |
| `Spiral` | klotoidespiraler ved siden av en `Curve` (inn og ut; leses som et PI med en radius og spirallengder, skrives tilbake med `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | det første nettverket som har rør: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` per rør) og `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Hoppet over, og nevnt i notatene

- Overflater etter den første, rutenettoverflater og andre overflater enn TIN
- Linjer som inneholder `IrregularLine`- eller `Chain`-elementer, spiraler annet enn klotoide, en spiral mellom to kurver, eller linjer uten geometri
- Designprofiler etter den første; `CircCurve`- og `UnsymParaCurve`-vertikalkurver (PVI-ene beholdes uten kurve)
- Punkter som bare refererer til andre punkter (`pntRef`), og punkter uten lesbare koordinater
- Gjentatte punktnavn (det første beholdes)
- Skjul-, vis- og dataklippgrenser; bruddlinjer uten 3D-punkter
- Rørnettverk etter det første; nettverkstyper annet enn storm og sanitary (leses som storm)
- Rektangulære, innløps- og utløpskonstruksjoner (leses som runde); egg-, elliptiske og firkantede rør og kanaler (leses som runde rør uten størrelse)
- `Spiral`-elementer i elementlinjer
- `Parcels`, `Roadways`, `GradeModel` og `Survey`

Terrengprofiler (`ProfSurf`) i en fil brukes ikke: CivilCraft henter terrenget fra overflaten selv.

## Meldinger når en fil ikke åpnes

| Melding | Betydning |
|---|---|
| «Dette er XML, men ikke LandXML (rotelementet er <…>).» | Filen er en annen type XML. |
| «… har ingen punkter, TIN-overflater eller linjer CivilCraft kan lese.» | Alt i filen står på listen over det som hoppes over. Notatene etter den sier hva som fantes. |
| «Feil sluttagg …», «Ikke lukket tagg …», «Filen slutter inne i …» | Filen er skadet eller avkortet. |
