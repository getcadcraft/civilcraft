---
title: LandXML: wat wordt gelezen en geschreven
summary: De LandXML 1.2-elementen en -attributen die CivilCraft leest en schrijft, element voor element, en alles wat het overslaat.
keywords: landxml, xml, cgpoints, terrein, tin, breeklijnen, begrenzing, tracé, coordgeom, profiel, profalign, pvi, paracurve, pipenetworks, struct, leiding, planfeatures, planfeature, elementlijn, schema
from: ca3cf359
---

CivilCraft schrijft LandXML 1.2 met de officiële namespace en schemalocatie. Het leest elk bestand waarvan het hoofdelement `LandXML` is, en neemt de onderstaande elementen op naam over (namespace-prefixen worden genegeerd; de versie wordt niet gecontroleerd). De XML-lezer accepteert alleen de vijf standaardentiteiten en numerieke tekenverwijzingen; hij laadt nooit een DTD of extern bestand. Voor de stappen, zie [LandXML uitwisselen](topic:landxml).

LandXML schrijft coördinaten met eerst Northing: een punt is "N E" of "N E Z".

## Geschreven

| Element | Wat CivilCraft schrijft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, oppervlakten in square feet, volumes in cubic yards, diameters in inches) of `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = de projectnaam |
| `Application` | naam CivilCraft, fabrikant CadCraft |
| `CgPoints` / `CgPoint` | `name` = puntnummer, `desc` = beschrijving, `code` = groep; tekst "N E Z" (of "N E" zonder hoogte) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw of ccw, `radius`, `length`, `staStart`, `chord`, `delta` (graden), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | het bestaande maaiveld langs het tracé, als paren van station en hoogte (`PntList2D`), gesplitst waar het het oppervlak verlaat |
| `Profile` / `ProfAlign` | het ontwerpprofiel (genoemd "<tracé> design"): `PVI` voor einden en hoekpunten, `ParaCurve` met `length` voor verticale bogen |
| `Surfaces` / `Surface` | `name` en `desc`; eerst het bestaande maaiveld, dan "Proposed" wanneer plateaus of corridors het maaiveld aanpassen |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (alleen bestaand maaiveld) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (alleen bestaand maaiveld, wanneer er een is) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` met `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm of sanitary |
| `Struct` | `name`, `elevRim` (de gebruikte bovenrand, ingesteld of uit het oppervlak), `elevSump`; `Center`; `CircStruct` met `diameter`; `Invert` met `elev`, `flowDir` in of out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` met `diameter` |
| `PlanFeatures` / `PlanFeature` | één per elementlijn: `name`; `CoordGeom` met `Line` (`length`, `Start`, `End`) en `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` en `End` als "N E Z", `Center` als "N E"); `Feature` `code="CivilCraft"` met `Property` use en closed |

Niet geschreven: plateaus en corridors als objecten (hun resultaat is het oppervlak "Proposed"), tracés met fouten, leidingen zonder beide invertniveaus, netwerkregels.

## Gelezen

| Element | Wat CivilCraft neemt |
|---|---|
| `Units` | `Imperial` of `Metric` en hun `linearUnit` bepalen voet of meter. Een onbekende eenheid wordt genoteerd. |
| `Project` | `name` wordt de projectnaam. |
| `CgPoints` / `CgPoint` (ook genest) | naam (of `oID`), "N E" of "N E Z", `desc` (of `code`) als beschrijving |
| `Surface` met `Definition surfType="TIN"` | `Pnts` en `Faces` als bestaand maaiveld (alleen het eerste oppervlak); onzichtbare vlakken (`i="1"`) worden weggelaten |
| `SourceData` / `Breaklines` | 3D-breeklijnen, bewaard bij het oppervlak |
| `SourceData` / `Boundaries` | de buitenste begrenzing |
| `Alignment` / `CoordGeom` | `Line`- en `Curve`-elementen; PI's opnieuw opgebouwd uit het `PI` van elke boog, of uit zijn `Center` en raaklijnen; `staStart` |
| `Profile` / `ProfAlign` | `PVI` en `ParaCurve` (met `length`); het eerste ontwerpprofiel met ten minste twee PVI's |
| `PlanFeatures` / `PlanFeature` | elk als elementlijn: `Line`, `Curve` (zijn `Start`, `Center`, `End` en `rot`) en `IrregularLine` (`PntList3D` of `PntList2D`), van eind tot eind aaneengesloten (een gat wordt met een rechte lijn overbrugd en genoteerd); gesloten wanneer hij eindigt waar hij begon; use en closed uit CivilCraft's eigen `Feature`, anders **Alleen getekend**. Punten zonder hoogte krijgen 0 (genoteerd). |
| `Spiral` | klothoïdespiralen naast een `Curve` (in en uit; gelezen als een PI met een straal en spiraallengtes, teruggeschreven met `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | het eerste netwerk met leidingen: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` per leiding) en `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Overgeslagen, en genoemd in de opmerkingen

- Oppervlakken na het eerste, rasteroppervlakken en andere niet-TIN-oppervlakken
- Tracés die `IrregularLine`- of `Chain`-elementen bevatten, spiralen anders dan klothoïde, een spiraal tussen twee bogen, of tracés zonder geometrie
- Ontwerpprofielen na het eerste; `CircCurve`- en `UnsymParaCurve`-verticale bogen (hun PVI's blijven zonder boog behouden)
- Punten die alleen naar andere punten verwijzen (`pntRef`), en punten zonder leesbare coördinaten
- Herhaalde puntnamen (de eerste blijft behouden)
- Verberg-, toon- en dataknip-begrenzingen; breeklijnen zonder 3D-punten
- Leidingnetwerken na het eerste; netwerktypen anders dan storm en sanitary (gelezen als storm)
- Rechthoekige, inlaat- en uitlaatconstructies (gelezen als rond); eivormige, elliptische en kastleidingen en goten (gelezen als ronde leidingen zonder maat)
- `Spiral`-elementen in elementlijnen
- `Parcels`, `Roadways`, `GradeModel` en `Survey`

Maaiveldprofielen (`ProfSurf`) in een bestand worden niet gebruikt: CivilCraft neemt het maaiveld zelf uit het oppervlak.

## Meldingen wanneer een bestand niet opent

| Melding | Betekenis |
|---|---|
| "Dit is XML maar geen LandXML (het hoofdelement is <…>)." | Het bestand is een ander soort XML. |
| "… heeft geen punten, TIN-oppervlakken of tracés die CivilCraft kan lezen." | Alles in het bestand staat in de lijst met overgeslagen onderdelen. De opmerkingen daarna zeggen wat erin zat. |
| "Niet-passende eindtag …", "Niet-gesloten tag …", "Het bestand eindigt binnen …" | Het bestand is beschadigd of afgebroken. |
