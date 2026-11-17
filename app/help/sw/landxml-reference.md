---
title: LandXML: kinachosomwa na kuandikwa
summary: Elementi na sifa za LandXML 1.2 ambazo CivilCraft inasoma na kuandika, kipengele kwa kipengele, pamoja na kila kitu inachokiruka.
keywords: landxml, xml, cgpoints, uso, tin, mistari ya kuvunja, mpaka, mpangilio wa njia, coordgeom, wasifu, profalign, pvi, paracurve, pipenetworks, struct, bomba, planfeatures, planfeature, mstari wa kipengele, skimu
from: ca3cf359
---

CivilCraft inaandika LandXML 1.2 pamoja na nafasi ya majina rasmi na mahali pa skimu. Inasoma faili lolote ambalo elementi yake ya mzizi ni `LandXML`, na kuchukua elementi zilizo hapa chini kwa jina lao (viambishi vya nafasi za majina vinapuuzwa; toleo halikaguliwi). Kisomaji chake cha XML kinakubali vitambulisho vitano vya kawaida vya herufi na marejeo ya namba za herufi pekee; hakipakii DTD wala faili la nje kamwe. Kwa hatua, ona [Badilishana LandXML](topic:landxml).

LandXML huandika kuratibu kaskazini kwanza: nukta ni "N E" au "N E Z".

## Vilivyoandikwa

| Elementi | Kile CivilCraft inachoandika |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, maeneo kwa futi za mraba, ujazo kwa yadi za ujazo, kipenyo kwa inchi) au `Metric` (meter, mita ya mraba, mita ya ujazo, milimita) |
| `Project` | `name` = jina la mradi |
| `Application` | jina CivilCraft, mtengenezaji CadCraft |
| `CgPoints` / `CgPoint` | `name` = namba ya nukta, `desc` = maelezo, `code` = kundi; maandishi "N E Z" (au "N E" bila mwinuko) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw au ccw, `radius`, `length`, `staStart`, `chord`, `delta` (digrii), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | ardhi iliyopo kando ya mpangilio wa njia, kama jozi za kituo na mwinuko (`PntList2D`), zikigawanywa pale inapoondoka kwenye uso |
| `Profile` / `ProfAlign` | wasifu wa usanifu (uliopewa jina "<mpangilio> design"); `PVI` kwa mwisho na pembe, `ParaCurve` yenye `length` kwa mikunjo ya wima |
| `Surfaces` / `Surface` | `name` na `desc`; kwanza ardhi iliyopo, kisha "Proposed" pedi au korido zinapoisawazisha |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (ardhi iliyopo tu) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (ardhi iliyopo tu, pale kuna mmoja) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` yenye `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm au sanitary |
| `Struct` | `name`, `elevRim` (ukingo uliotumika, uliowekwa au kutoka kwenye uso), `elevSump`; `Center`; `CircStruct` yenye `diameter`; `Invert` yenye `elev`, `flowDir` in au out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` yenye `diameter` |
| `PlanFeatures` / `PlanFeature` | moja kwa kila mstari wa kipengele: `name`; `CoordGeom` yenye `Line` (`length`, `Start`, `End`) na `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` na `End` kama "N E Z", `Center` kama "N E"); `Feature` `code="CivilCraft"` yenye matumizi ya `Property` na kufungwa |

Hazijaandikwa: pedi na korido kama vitu (matokeo yake ni uso wa "Proposed"), mipangilio ya njia yenye makosa, mabomba yasiyo na invert zote mbili, na kanuni za mtandao.

## Vilivyosomwa

| Elementi | Kile CivilCraft inachukua |
|---|---|
| `Units` | `Imperial` au `Metric`, na `linearUnit` yake, huamua futi au mita. Kipimo kisichojulikana kinabainishwa. |
| `Project` | `name` inakuwa jina la mradi. |
| `CgPoints` / `CgPoint` (pia ndani ya nyingine) | jina (au `oID`), "N E" au "N E Z", `desc` (au `code`) kama maelezo |
| `Surface` yenye `Definition surfType="TIN"` | `Pnts` na `Faces` kama ardhi iliyopo (uso wa kwanza tu); nyuso zisizoonekana (`i="1"`) zinaachwa |
| `SourceData` / `Breaklines` | mistari ya kuvunja ya 3D, inabaki pamoja na uso |
| `SourceData` / `Boundaries` | mpaka wa nje |
| `Alignment` / `CoordGeom` | elementi za `Line` na `Curve`; PI zinajengwa upya kutoka `PI` ya kila mkunjo, au kutoka `Center` na tangenti zake; `staStart` |
| `Profile` / `ProfAlign` | `PVI` na `ParaCurve` (yenye `length`); wasifu wa kwanza wa usanifu wenye PVI angalau mbili |
| `PlanFeatures` / `PlanFeature` | kila moja kama mstari wa kipengele: `Line`, `Curve` (`Start`, `Center`, `End` na `rot` yake) na `IrregularLine` (`PntList3D` au `PntList2D`) zikiunganishwa mwisho kwa mwisho (pengo linaunganishwa kwa sehemu iliyonyooka na kutajwa); imefungwa ikiwa inaishia pale ilipoanzia; matumizi na kufungwa kutoka `Feature` ya CivilCraft yenyewe, vinginevyo **Imechorwa tu**. Nukta bila mwinuko zinapata 0 (zimetajwa). |
| `Spiral` | spirali za clothoid kando ya `Curve` (ndani na nje; inasomwa kama PI yenye radius na urefu wa spirali, na kuandikwa tena na `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | mtandao wa kwanza wenye mabomba: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` kwa kila bomba) na `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Zinaruka, na zinatajwa kwenye maelezo

- Nyuso baada ya ya kwanza, nyuso za gridi na nyuso nyingine zisizo TIN
- Mipangilio ya njia yenye elementi za `IrregularLine` au `Chain`, spirali zisizo za clothoid, spirali kati ya mikunjo miwili, au isiyo na jiometri
- Wasifu wa usanifu baada ya wa kwanza; mikunjo ya wima ya `CircCurve` na `UnsymParaCurve` (PVI zake zinabaki bila mkunjo)
- Nukta zinazorejelea nukta zingine tu (`pntRef`), na nukta zisizo na kuratibu zinazosomeka
- Majina ya nukta yaliyorudiwa (ya kwanza inabaki)
- Mipaka ya kuficha, kuonyesha na kukata data; mistari ya kuvunja bila nukta za 3D
- Mitandao ya mabomba baada ya ya kwanza; aina za mtandao zisizo storm wala sanitary (zinasomwa kama storm)
- Miundo ya mstatili, ya kuingia na ya kutoka (inasomwa kama ya duara); mabomba na mifereji ya yai, ya mviringo na ya kisanduku (inasomwa kama mabomba ya duara bila ukubwa)
- Elementi za `Spiral` katika vipengele vya mpango
- `Parcels`, `Roadways`, `GradeModel` na `Survey`

Wasifu wa ardhi (`ProfSurf`) katika faili hautumiki: CivilCraft inapima ardhi kutoka kwenye uso wenyewe.

## Ujumbe faili linapokataa kufunguka

| Ujumbe | Maana |
|---|---|
| "Hii ni XML lakini si LandXML (elementi yake ya mzizi ni <…>)." | Faili ni aina nyingine ya XML. |
| "… haina nukta, nyuso za TIN wala mipangilio ya njia ambayo CivilCraft inaweza kusoma." | Kila kitu kwenye faili kiko kwenye orodha ya kuruka. Maelezo yanayofuata yanaeleza kilichokuwepo. |
| "Tagi ya kufunga haifanani …", "Tagi haijafungwa …", "Faili linaishia ndani ya …" | Faili limeharibika au limekatika. |
