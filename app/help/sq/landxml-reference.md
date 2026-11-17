---
title: LandXML: çfarë lexohet dhe shkruhet
summary: Elementet dhe atributet LandXML 1.2 që CivilCraft lexon dhe shkruan, element pas elementi, dhe gjithçka që kalon pa u marrë.
keywords: landxml, xml, cgpoints, sipërfaqe, tin, vija karakteristike, kufi, aks, coordgeom, profil, profalign, pvi, paracurve, pipenetworks, struct, tub, planfeatures, planfeature, vijë karakteristike, skemë
from: ca3cf359
---

CivilCraft shkruan LandXML 1.2 me hapësirën zyrtare të emrave dhe vendndodhjen e skemës. Lexon çdo skedar që ka si element rrënjë `LandXML` dhe merr elementet e mëposhtme sipas emrit (prefiksat e hapësirës së emrave injorohen; versioni nuk kontrollohet). Lexuesi i tij XML pranon vetëm pesë entitetet standarde dhe referencat numerike të karaktereve; nuk ngarkon kurrë një DTD ose skedar të jashtëm. Për hapat, shihni [Shkëmbe LandXML](topic:landxml).

LandXML shkruan koordinatat me veriun e parë: një pikë është "N E" ose "N E Z".

## Shkruhet

| Element | Çfarë shkruan CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, sipërfaqet në këmbë katrore, vëllimet në jard kub, diametrat në inç) ose `Metric` (meter, metër katror, metër kub, milimetër) |
| `Project` | `name` = emri i projektit |
| `Application` | emri CivilCraft, prodhuesi CadCraft |
| `CgPoints` / `CgPoint` | `name` = numri i pikës, `desc` = përshkrimi, `code` = grupi; teksti "N E Z" (ose "N E" pa kotë) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw ose ccw, `radius`, `length`, `staStart`, `chord`, `delta` (gradë), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | toka ekzistuese përgjatë aksit, si çifte stacion dhe kotë (`PntList2D`), e ndarë aty ku del nga sipërfaqja |
| `Profile` / `ProfAlign` | profili i projektimit (i emërtuar "<aks> projektim"): `PVI` për skajet dhe pikat e këndit, `ParaCurve` me `length` për kurbat vertikale |
| `Surfaces` / `Surface` | `name` dhe `desc`; së pari toka ekzistuese, pastaj "Proposed" kur platformat ose korridoret nivelohen |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (vetëm toka ekzistuese) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (vetëm toka ekzistuese, kur ka një) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` me `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm ose sanitary |
| `Struct` | `name`, `elevRim` (buza e përdorur, e vendosur ose nga sipërfaqja), `elevSump`; `Center`; `CircStruct` me `diameter`; `Invert` me `elev`, `flowDir` in ose out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` me `diameter` |
| `PlanFeatures` / `PlanFeature` | një për çdo vijë karakteristike: `name`; `CoordGeom` me `Line` (`length`, `Start`, `End`) dhe `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` dhe `End` si "N E Z", `Center` si "N E"); `Feature` `code="CivilCraft"` me `Property` use dhe closed |

Nuk shkruhen: platformat dhe korridoret si objekte (rezultati i tyre është sipërfaqja "Proposed"), aksët me gabime, tubat pa të dy invertet, rregullat e rrjetit.

## Lexohet

| Element | Çfarë merr CivilCraft |
|---|---|
| `Units` | `Imperial` ose `Metric` dhe `linearUnit` i tyre përcaktojnë nëse janë këmbë apo metra. Një njësi e panjohur shënohet. |
| `Project` | `name` bëhet emri i projektit. |
| `CgPoints` / `CgPoint` (edhe të futura) | emri (ose `oID`), "N E" ose "N E Z", `desc` (ose `code`) si përshkrim |
| `Surface` me `Definition surfType="TIN"` | `Pnts` dhe `Faces` si toka ekzistuese (vetëm sipërfaqja e parë); faqet e padukshme (`i="1"`) lihen jashtë |
| `SourceData` / `Breaklines` | vija karakteristike 3D, të mbajtura me sipërfaqen |
| `SourceData` / `Boundaries` | kufiri i jashtëm |
| `Alignment` / `CoordGeom` | elementet `Line` dhe `Curve`; PI rindërtohen nga `PI` e secilës kurbë, ose nga `Center` dhe tangentet e saj; `staStart` |
| `Profile` / `ProfAlign` | `PVI` dhe `ParaCurve` (me `length`); profili i parë i projektimit me të paktën dy PVI |
| `PlanFeatures` / `PlanFeature` | secila si vijë karakteristike: `Line`, `Curve` (`Start`, `Center`, `End` dhe `rot`) dhe `IrregularLine` (`PntList3D` ose `PntList2D`) të bashkuara skaj më skaj (një boshllëk lidhet me një segment të drejtë dhe shënohet); e mbyllur kur mbaron aty ku nisi; përdorim dhe closed nga `Feature` i vetë CivilCraft, përndryshe **Vetëm e vizatuar**. Pikat pa kotë marrin 0 (shënohet). |
| `Spiral` | spirale klotoide pranë një `Curve` (në hyrje dhe dalje; lexohen si PI me rreze dhe gjatësi spiralesh, kthehen me `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | rrjeti i parë që ka tuba: `Struct` (`Center`, `elevRim`, `elevSump`, diametri `CircStruct`, `Invert` për çdo tub) dhe `Pipe` (`refStart`, `refEnd`, diametri `CircPipe`) |

## Kalohen dhe shënohen në shënime

- Sipërfaqet pas të parës, sipërfaqet e rrjetit dhe sipërfaqet jo-TIN
- Akse që përmbajnë elemente `IrregularLine` ose `Chain`, spirale jo-klotoide, një spirale midis dy kurbave, ose që nuk kanë gjeometri
- Profile projektimi pas të parit; kurbat vertikale `CircCurve` dhe `UnsymParaCurve` (PVI-të e tyre mbahen pa kurbë)
- Pikat që i referohen vetëm pikave të tjera (`pntRef`), dhe pikat pa koordinata të lexueshme
- Emrat e pikave të përsëritura (mbahet i pari)
- Kufijtë e fshehur, të shfaqur dhe të prerë me të dhëna; vijat karakteristike pa pika 3D
- Rrjetet e tubave pas të parit; llojet e rrjetit të ndryshme nga storm dhe sanitary (lexohen si storm)
- Struktura drejtkëndore, hyrje dhe dalje (lexohen si të rrumbullakëta); tuba dhe kanale vezë, eliptikë dhe kutiorë (lexohen si tuba të rrumbullakët pa madhësi)
- Elemente `Spiral` në vijat karakteristike
- `Parcels`, `Roadways`, `GradeModel` dhe `Survey`

Profilet e tokës (`ProfSurf`) në një skedar nuk përdoren: CivilCraft e merr tokën nga vetë sipërfaqja.

## Mesazhet kur një skedar nuk hapet

| Mesazhi | Kuptimi |
|---|---|
| "This is XML but not LandXML (its root element is <…>)." | Skedari është një lloj tjetër XML. |
| "… has no points, TIN surfaces or alignments CivilCraft can read." | Gjithçka në skedar është në listën e kaluar. Shënimet pas tij thonë çfarë kishte. |
| "Mismatched end tag …", "Unclosed tag …", "The file ends inside …" | Skedari është i dëmtuar ose i prerë shkurt. |
