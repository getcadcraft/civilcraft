---
title: LandXML: wat gelees en geskryf word
summary: Die LandXML 1.2-elemente en -eienskappe wat CivilCraft lees en skryf, element vir element, en alles wat dit oorslaan.
keywords: landxml, xml, cgpoints, oppervlak, tin, breeklyne, grens, belyning, coordgeom, lengteprofiel, profalign, pvi, paracurve, pipenetworks, struct, pyp, planfeatures, planfeature, kenlyn, skema
from: ca3cf359
---

CivilCraft skryf LandXML 1.2 met die amptelike naamruimte en skemaligging. Dit lees enige lêer waarvan die wortelelement `LandXML` is en neem die elemente hieronder by naam (naamruimtevoorvoegsels word geïgnoreer; die weergawe word nie gekontroleer nie). Die XML-leser aanvaar net die vyf standaard entiteite en numeriese karakterverwysings; dit laai nooit 'n DTD of eksterne lêer nie. Vir die stappe, sien [Ruil LandXML uit](topic:landxml).

LandXML skryf koördinate noord-eerste: 'n punt is "N E" of "N E Z".

## Geskryf

| Element | Wat CivilCraft skryf |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, oppervlaktes in vierkante voet, volumes in kubieke yard, deursnedes in duim) of `Metric` (meter, vierkante meter, kubieke meter, millimeter) |
| `Project` | `name` = die projeknaam |
| `Application` | naam CivilCraft, vervaardiger CadCraft |
| `CgPoints` / `CgPoint` | `name` = puntnommer, `desc` = beskrywing, `code` = groep; teks "N E Z" (of "N E" sonder hoogte) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw of ccw, `radius`, `length`, `staStart`, `chord`, `delta` (grade), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | die bestaande grond langs die belyning, as stasie- en hoogtepare (`PntList2D`), gesplit waar dit die oppervlak verlaat |
| `Profile` / `ProfAlign` | die ontwerpprofiel (genoem "<belyning> design"): `PVI` vir eindpunte en hoekpunte, `ParaCurve` met `length` vir vertikale kurwes |
| `Surfaces` / `Surface` | `name` en `desc`; eers die bestaande grond, dan "Proposed" wanneer bouplatforms of korridors gradeer |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (net bestaande grond) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (net bestaande grond, wanneer daar een is) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` met `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm of sanitary |
| `Struct` | `name`, `elevRim` (die rand wat gebruik word, vasgestel of van die oppervlak), `elevSump`; `Center`; `CircStruct` met `diameter`; `Invert` met `elev`, `flowDir` in of out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` met `diameter` |
| `PlanFeatures` / `PlanFeature` | een per kenlyn: `name`; `CoordGeom` met `Line` (`length`, `Start`, `End`) en `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` en `End` as "N E Z", `Center` as "N E"); `Feature` `code="CivilCraft"` met `Property` use en closed |

Nie geskryf nie: bouplatforms en korridors as voorwerpe (hul resultaat is die "Proposed"-oppervlak), belynings met foute, pype sonder albei inverts, netwerkreëls.

## Gelees

| Element | Wat CivilCraft neem |
|---|---|
| `Units` | `Imperial` of `Metric` en sy `linearUnit` bepaal voet of meter. 'n Onbekende eenheid word genoteer. |
| `Project` | `name` word die projeknaam. |
| `CgPoints` / `CgPoint` (ook genes) | naam (of `oID`), "N E" of "N E Z", `desc` (of `code`) as die beskrywing |
| `Surface` met `Definition surfType="TIN"` | `Pnts` en `Faces` as die bestaande grond (net die eerste oppervlak); onsigbare vlakke (`i="1"`) word weggelaat |
| `SourceData` / `Breaklines` | 3D-breeklyne, behou met die oppervlak |
| `SourceData` / `Boundaries` | die buitegrens |
| `Alignment` / `CoordGeom` | `Line`- en `Curve`-elemente; PI's herbou uit elke kurwe se `PI`, of uit sy `Center` en raaklyne; `staStart` |
| `Profile` / `ProfAlign` | `PVI` en `ParaCurve` (met `length`); die eerste ontwerpprofiel met ten minste twee PVI's |
| `PlanFeatures` / `PlanFeature` | elk as 'n kenlyn: `Line`, `Curve` (sy `Start`, `Center`, `End` en `rot`) en `IrregularLine` (`PntList3D` of `PntList2D`) end-tot-end saamgevoeg ('n gaping word met 'n reguit segment verbind en genoteer); gesluit wanneer dit by sy begin eindig; gebruik en gesluit uit CivilCraft se eie `Feature`, anders **Slegs getekend**. Punte sonder 'n hoogte kry 0 (genoteer). |
| `Spiral` | klotoïde-spirale langs 'n `Curve` (in en uit; gelees as 'n PI met 'n radius en spiraallengtes, terug geskryf met `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | die eerste netwerk wat pype het: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` per pyp) en `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Oorgeslaan, en in die notas genoem

- Oppervlaktes na die eerste, roosteroppervlaktes en ander nie-TIN-oppervlaktes
- Belynings wat `IrregularLine`- of `Chain`-elemente bevat, spirale wat nie klotoïde is nie, 'n spiraal tussen twee kurwes, of belynings wat geen geometrie het nie
- Ontwerpprofiele na die eerste; `CircCurve`- en `UnsymParaCurve`-vertikale kurwes (hul PVI's word behou sonder 'n kurwe)
- Punte wat net na ander punte verwys (`pntRef`), en punte sonder leesbare koördinate
- Herhaalde puntname (die eerste word behou)
- Versteek-, wys- en data-knip-grense; breeklyne sonder 3D-punte
- Pypnetwerke na die eerste; netwerktipes anders as storm en sanitary (gelees as storm)
- Reghoekige, inlaat- en uitlaatstrukture (gelees as rond); eier-, elliptiese en boks-pype en -kanale (gelees as ronde pype sonder grootte)
- `Spiral`-elemente in planfeatures
- `Parcels`, `Roadways`, `GradeModel` en `Survey`

Grondprofiele (`ProfSurf`) in 'n lêer word nie gebruik nie: CivilCraft neem die grond self uit die oppervlak.

## Boodskappe wanneer 'n lêer nie oopmaak nie

| Boodskap | Betekenis |
|---|---|
| "Dit is XML, maar nie LandXML nie (sy wortelelement is <…>)." | Die lêer is 'n ander soort XML. |
| "… het geen punte, TIN-oppervlaktes of belynings wat CivilCraft kan lees nie." | Alles in die lêer is in die oorgeslaan-lys. Die notas daarna sê wat daar was. |
| "Nie-passende eindetiket …", "Ongeslote etiket …", "Die lêer eindig binne …" | Die lêer is beskadig of afgesny. |
