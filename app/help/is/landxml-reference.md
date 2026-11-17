---
title: LandXML: hvað er lesið og skrifað
summary: LandXML 1.2-þættirnir og eigindin sem CivilCraft les og skrifar, þátt fyrir þátt, og allt sem það sleppir.
keywords: landxml, xml, cgpoints, yfirborð, tin, brotlínur, mörk, veglína, coordgeom, langsnið, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, eiginlína, skema
from: ca3cf359
---

CivilCraft skrifar LandXML 1.2 með opinberu nafnarými og skemastaðsetningu. Það les hvaða skrá sem er þar sem rótarþátturinn er `LandXML`, og tekur þættina hér að neðan eftir heiti (forskeyti nafnarýma eru hunsuð; útgáfan er ekki athuguð). XML-lesari þess tekur aðeins við fimm stöðluðu táknunum og tölugildistilvísunum; hann hleður aldrei DTD né ytri skrá. Fyrir skrefin sjá [Skipta á LandXML](topic:landxml).

LandXML skrifar hnit norður fyrst: punktur er „N E“ eða „N E Z“.

## Skrifað

| Þáttur | Það sem CivilCraft skrifar |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, flatarmál í ferfetum, rúmmál í rúmyardum, þvermál í tommum) eða `Metric` (metri, fermetri, rúmmetri, millimetri) |
| `Project` | `name` = heiti verkefnisins |
| `Application` | nafn CivilCraft, framleiðandi CadCraft |
| `CgPoints` / `CgPoint` | `name` = punktanúmer, `desc` = lýsing, `code` = hópur; texti „N E Z“ (eða „N E“ án kóta) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw eða ccw, `radius`, `length`, `staStart`, `chord`, `delta` (gráður), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | núverandi landið meðfram veglínunni, sem pör af stöðu og kóta (`PntList2D`), skipt þar sem það fer af yfirborðinu |
| `Profile` / `ProfAlign` | hönnunarsniðið (heitið „<veglína> design“): `PVI` fyrir enda og hornpunkta, `ParaCurve` með `length` fyrir lóðréttar bogalínur |
| `Surfaces` / `Surface` | `name` og `desc`; fyrst núverandi landið, síðan „Proposed“ þegar pallar eða vegstæði móta landið |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (aðeins núverandi land) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (aðeins núverandi land, þegar það er til) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` með `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm eða sanitary |
| `Struct` | `name`, `elevRim` (kantkótinn sem er notaður, stilltur eða úr yfirborðinu), `elevSump`; `Center`; `CircStruct` með `diameter`; `Invert` með `elev`, `flowDir` in eða out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` með `diameter` |
| `PlanFeatures` / `PlanFeature` | ein fyrir hverja eiginlínu: `name`; `CoordGeom` með `Line` (`length`, `Start`, `End`) og `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` og `End` sem „N E Z“, `Center` sem „N E“); `Feature` með `code="CivilCraft"`, `Property` use og closed |

Ekki skrifað: pallar og vegstæði sem hlutir (niðurstaða þeirra er yfirborðið „Proposed“), veglínur með villum, lagnir án beggja innskota og lagnareglur.

## Lesið

| Þáttur | Það sem CivilCraft tekur |
|---|---|
| `Units` | `Imperial` eða `Metric` og `linearUnit` þess ákveða fet eða metra. Óþekkt eining er skráð. |
| `Project` | `name` verður heiti verkefnisins. |
| `CgPoints` / `CgPoint` (líka innbyggt) | heiti (eða `oID`), „N E“ eða „N E Z“, `desc` (eða `code`) sem lýsing |
| `Surface` með `Definition surfType="TIN"` | `Pnts` og `Faces` sem núverandi land (aðeins fyrsta yfirborðið); ósýnilegir fletir (`i="1"`) eru sleppt |
| `SourceData` / `Breaklines` | 3D-brotlínur, geymdar með yfirborðinu |
| `SourceData` / `Boundaries` | ytri mörkin |
| `Alignment` / `CoordGeom` | `Line`- og `Curve`-þættir; PI endurbyggð úr `PI` hvers boga, eða úr `Center` og snertlum; `staStart` |
| `Profile` / `ProfAlign` | `PVI` og `ParaCurve` (með `length`); fyrsta hönnunarsniðið með að minnsta kosti tveimur PVI |
| `PlanFeatures` / `PlanFeature` | hver sem eiginlína: `Line`, `Curve` (`Start`, `Center`, `End` og `rot` þess) og `IrregularLine` (`PntList3D` eða `PntList2D`) tengt enda við enda (bil er tengt með beinum hluta og skráð); lokað þegar hún endar þar sem hún byrjaði; notkun og lokun úr eigin `Feature` CivilCraft, annars **Aðeins teiknað**. Punktar án kóta fá 0 (skráð). |
| `Spiral` | klóþoíð-spírallar við `Curve` (inn og út; lesnir sem PI með radíus og lengdum spírala, skrifaðir aftur með `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | fyrsta netið sem hefur lagnir: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` fyrir hverja lögn) og `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Sleppt, og nefnt í athugasemdunum

- Yfirborð eftir það fyrsta, grindaryfirborð og önnur yfirborð en TIN
- Veglínur sem innihalda `IrregularLine`- eða `Chain`-þætti, spírallar aðrir en klóþoíð, spíral milli tveggja bogalína, eða sem hafa enga rúmfræði
- Hönnunarsnið eftir það fyrsta; `CircCurve`- og `UnsymParaCurve`-lóðréttir bogar (PVI eru geymd án bogans)
- Punktar sem vísa aðeins í aðra punkta (`pntRef`), og punktar án læsilegra hnita
- Endurtekin punktanöfn (það fyrsta er geymt)
- Fela-, sýna- og gagnaklippimörk; brotlínur án 3D-punkta
- Lagnanet eftir það fyrsta; netgerðir aðrar en storm og sanitary (lesnar sem storm)
- Ferkantaðir, inntaks- og úttaksbrunnar (lesnir sem kringlóttir); egg-, sporbaugs- og kassalagnir og rennur (lesnar sem kringlóttar lagnir án stærðar)
- `Spiral`-þættir í eiginlínum
- `Parcels`, `Roadways`, `GradeModel` og `Survey`

Landsnið (`ProfSurf`) í skrá eru ekki notuð: CivilCraft tekur sýni af landinu úr yfirborðinu sjálfu.

## Skilaboð þegar skrá opnast ekki

| Skilaboð | Merking |
|---|---|
| „Þetta er XML en ekki LandXML (rótarþáttur þess er <…>).“ | Skráin er önnur tegund af XML. |
| „… hefur engra punkta, TIN-yfirborða eða veglína sem CivilCraft getur lesið.“ | Allt í skránni er á sleppilistanum. Athugasemdirnar á eftir segja hvað var þar. |
| „Lokamerki passar ekki …“, „Merki ólokað …“, „Skráin endar inni í …“ | Skráin er skemmd eða skorin styttri. |
