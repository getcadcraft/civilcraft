---
title: LandXML: kaj se bere in zapiše
summary: Elementi in atributi LandXML 1.2, ki jih CivilCraft bere in piše, element za elementom, ter vse, kar preskoči.
keywords: landxml, xml, cgpoints, površina, tin, lomne črte, meja, trasa, coordgeom, profil, profalign, pvi, paracurve, pipenetworks, struct, cev, planfeatures, planfeature, značilna črta, shema
from: ca3cf359
---

CivilCraft zapisuje LandXML 1.2 z uradnim imenskim prostorom in mestom sheme. Bere katero koli datoteko, katere korenski element je `LandXML`, in vzame spodnje elemente po imenu (predpone imenskih prostorov se prezrejo; različica se ne preverja). Njegov bralnik XML sprejme samo pet standardnih entitet in številske znakovne reference; nikoli ne naloži DTD ali zunanje datoteke. Za korake glejte [Izmenjava LandXML](topic:landxml).

LandXML zapisuje koordinate najprej po severu: točka je "N E" ali "N E Z".

## Zapisano

| Element | Kaj CivilCraft zapiše |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, površine v kvadratnih čevljih, prostornine v kubičnih jardih, premeri v palcih) ali `Metric` (meter, kvadratni meter, kubični meter, milimeter) |
| `Project` | `name` = ime projekta |
| `Application` | ime CivilCraft, proizvajalec CadCraft |
| `CgPoints` / `CgPoint` | `name` = številka točke, `desc` = opis, `code` = skupina; besedilo "N E Z" (ali "N E" brez višine) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw ali ccw, `radius`, `length`, `staStart`, `chord`, `delta` (stopinje), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | obstoječi teren vzdolž trase kot pari staciona in višina (`PntList2D`), razdeljen tam, kjer zapusti površino |
| `Profile` / `ProfAlign` | projektirani profil (imenovan "<trasa> design"): `PVI` za konce in lomne točke, `ParaCurve` z `length` za vertikalne krivine |
| `Surfaces` / `Surface` | `name` in `desc`; najprej obstoječi teren, nato "Proposed", kadar podlage ali koridorji oblikujejo teren |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (samo obstoječi teren) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (samo obstoječi teren, kadar obstaja) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` z `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm ali sanitary |
| `Struct` | `name`, `elevRim` (uporabljen rob, nastavljen ali iz površine), `elevSump`; `Center`; `CircStruct` z `diameter`; `Invert` z `elev`, `flowDir` in ali out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` z `diameter` |
| `PlanFeatures` / `PlanFeature` | ena na vsako značilno črto: `name`; `CoordGeom` z `Line` (`length`, `Start`, `End`) in `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` in `End` kot "N E Z", `Center` kot "N E"); `Feature` `code="CivilCraft"` z `Property` use in closed |

Ni zapisano: podlage in koridorji kot objekti (njihov rezultat je površina "Proposed"), trase z napakami, cevi brez obeh dna, pravila cevnih omrežij.

## Prebrano

| Element | Kaj CivilCraft vzame |
|---|---|
| `Units` | `Imperial` ali `Metric` in njun `linearUnit` določita čevlje ali metre. Neznana enota je navedena v opombi. |
| `Project` | `name` postane ime projekta. |
| `CgPoints` / `CgPoint` (tudi gnezdeno) | ime (ali `oID`), "N E" ali "N E Z", `desc` (ali `code`) kot opis |
| `Surface` z `Definition surfType="TIN"` | `Pnts` in `Faces` kot obstoječi teren (samo prva površina); nevidne ploskve (`i="1"`) so izpuščene |
| `SourceData` / `Breaklines` | 3D lomne črte, ohranjene s površino |
| `SourceData` / `Boundaries` | zunanja meja |
| `Alignment` / `CoordGeom` | elementa `Line` in `Curve`; lomne točke (PI) obnovljene iz `PI` vsake krivine ali iz njenega `Center` in tangent; `staStart` |
| `Profile` / `ProfAlign` | `PVI` in `ParaCurve` (z `length`); prvi projektirani profil z vsaj dvema PVI |
| `PlanFeatures` / `PlanFeature` | vsaka kot značilna črta: `Line`, `Curve` (njen `Start`, `Center`, `End` in `rot`) in `IrregularLine` (`PntList3D` ali `PntList2D`), zlepljeni od konca do konca (vrzel je zapolnjena z ravnim odsekom in navedena); zaprta, kadar se konča tam, kjer se je začela; uporaba in zaprtje iz lastnega `Feature` CivilCraft, sicer **Samo narisano**. Točke brez višine dobijo 0 (navedeno). |
| `Spiral` | klotoidne spirale ob `Curve` (vstopna in izstopna; prebrane kot PI s polmerom in dolžinami spiral, zapisane nazaj s `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | prvo omrežje, ki ima cevi: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` premer, `Invert` za vsako cev) in `Pipe` (`refStart`, `refEnd`, `CircPipe` premer) |

## Preskočeno, navedeno v opombah

- Površine po prvi, mrežne površine in druge površine, ki niso TIN
- Trase, ki vsebujejo elementa `IrregularLine` ali `Chain`, spirale razen klotoidnih, spirala med dvema krivinama ali trase brez geometrije
- Projektirani profili po prvem; vertikalne krivine `CircCurve` in `UnsymParaCurve` (njihove PVI so ohranjene brez krivine)
- Točke, ki se sklicujejo samo na druge točke (`pntRef`), in točke brez berljivih koordinat
- Ponovljena imena točk (prva je ohranjena)
- Skrite, prikazane in podatkovno obrezane meje; lomne črte brez 3D točk
- Cevna omrežja po prvem; vrste omrežij razen storm in sanitary (prebrane kot storm)
- Pravokotni, dovodni in odvodni objekti (prebrani kot okrogli); jajčaste, eliptične in škatlaste cevi ter kanali (prebrani kot okrogle cevi brez velikosti)
- Elementi `Spiral` v značilnih črtah
- `Parcels`, `Roadways`, `GradeModel` in `Survey`

Profili terena (`ProfSurf`) v datoteki se ne uporabijo: CivilCraft vzame teren neposredno iz same površine.

## Sporočila, ko se datoteka ne odpre

| Sporočilo | Pomen |
|---|---|
| "To je XML, vendar ni LandXML (njegov korenski element je <…>)." | Datoteka je druga vrsta XML. |
| "… nima točk, TIN površin ali tras, ki bi jih CivilCraft lahko prebral." | Vse v datoteki je na seznamu preskočenih. Opombe za njim povedo, kaj je bilo tam. |
| "Neujemajoča se zaključna oznaka …", "Nezaprta oznaka …", "Datoteka se konča znotraj …" | Datoteka je poškodovana ali prekinjena. |
