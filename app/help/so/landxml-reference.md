---
title: LandXML: waxa la akhriyo oo la qoro
summary: Elementiyada iyo sifooyinka LandXML 1.2 ee CivilCraft akhriyo oo qoro, element kasta oo kale, iyo wixii ay ka tagto.
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, khadka muuqaalka, skeema
from: ca3cf359
---

CivilCraft wuxuu qoraa LandXML 1.2 oo leh magaca rasmiga ah iyo goobta skeemada. Wuxuu akhrinayaa fayl kasta oo xididka elementigiisu yahay `LandXML`, wuxuuna qaataa elementiyada hoose magacyadooda: horyaalka magaca-meeleedka waa la iska indho tirayaa; nooca ma la hubinayo. Akhristaha XML-ka wuxuu aqbalaa kaliya shan entity-yada caadiga ah iyo tilmaamayaasha lambarka-xarfaha; ma soo rarto DTD ama fayl dibadda ah. Tallaabooyinka, eeg [Isweydaarsashada LandXML](topic:landxml).

LandXML waxa uu qoraa iskuxirka waqooyi-marka-hore: barta waa "N E" ama "N E Z".

## Waa la qoray

| Elementi | Waxa CivilCraft qorayo |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, aagagga cagaha labajibbaaran, mugga cagaha sadexjibbaaran, dhexroorka inji) ama `Metric` (meter, mitir labajibbaaran, mitir sadexjibbaaran, millimeter) |
| `Project` | `name` = magaca mashruuca |
| `Application` | magaca CivilCraft, soo-saaraha CadCraft |
| `CgPoints` / `CgPoint` | `name` = lambarka barta, `desc` = sharraxaad, `code` = kooxda; qoraal "N E Z" (ama "N E" la'aanta muuqaalka) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw ama ccw, `radius`, `length`, `staStart`, `chord`, `delta` (darajo), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | dhulka jira ee toosinta ku dhex jira, oo ah lamaane station iyo muuqaal (`PntList2D`), oo la kala jaray meesha ka baxda dusha |
| `Profile` / `ProfAlign` | muuqaalka naqshadda (oo loo magacaabay "<alignment> design"): `PVI` dhammaadka iyo barta xagasha, `ParaCurve` oo leh `length` dhuuntada toosan |
| `Surfaces` / `Surface` | `name` iyo `desc`; marka hore dhulka jira, kadibna "Proposed" marka pad-yada ama corridor-yada sare-u-qaadaan |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (dhulka jira kaliya) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (dhulka jira kaliya, marka uu jiro) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` oo leh `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm ama sanitary |
| `Struct` | `name`, `elevRim` (xadka la isticmaalay, la dejiyay ama dusha laga qaatay), `elevSump`; `Center`; `CircStruct` oo leh `diameter`; `Invert` oo leh `elev`, `flowDir` in ama out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` oo leh `diameter` |
| `PlanFeatures` / `PlanFeature` | mid kasta khad muuqaal: `name`; `CoordGeom` oo leh `Line` (`length`, `Start`, `End`) iyo `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` iyo `End` sida "N E Z", `Center` sida "N E"); `Feature` `code="CivilCraft"` oo leh `Property` isticmaal iyo closed |

Lama qorin: pad-yada iyo corridor-yada sida shay (natiijadooda waa dusha "Proposed"), toosinta leh khaladaad, tuubooyinka aan labada inverts lahayn, xeerarka shabakada.

## Waa la akhriyay

| Elementi | Waxa CivilCraft qaataa |
|---|---|
| `Units` | `Imperial` ama `Metric` iyo `linearUnit` ayaa go'aaminaya cagaha ama mitirka. Unit aan la aqoon waa la xusay. |
| `Project` | `name` wuxuu noqdaa magaca mashruuca. |
| `CgPoints` / `CgPoint` (xitaa kuwa ku-dhex-jira) | magaca (ama `oID`), "N E" ama "N E Z", `desc` (ama `code`) sida sharraxaadda |
| `Surface` oo leh `Definition surfType="TIN"` | `Pnts` iyo `Faces` sida dhulka jira (dusha koowaad oo keliya); wajiyada aan muuqan (`i="1"`) waa la reebay |
| `SourceData` / `Breaklines` | xariiqyada 3D, oo lagu hayo dusha |
| `SourceData` / `Boundaries` | xuduudka dibadda |
| `Alignment` / `CoordGeom` | elementiyada `Line` iyo `Curve`; PI-yada dib loo dhisay `PI` curve kasta, ama `Center` iyo tangents; `staStart` |
| `Profile` / `ProfAlign` | `PVI` iyo `ParaCurve` (oo leh `length`); muuqaalka naqshadda ee koowaad oo leh ugu yaraan laba PVI |
| `PlanFeatures` / `PlanFeature` | mid kasta sida khad muuqaal: `Line`, `Curve` (`Start`, `Center`, `End` iyo `rot`) iyo `IrregularLine` (`PntList3D` ama `PntList2D`) oo isku xira dhammaadka ilaa dhamaadka (godka waxaa lagu xidhaa jid toosan oo la xusay); la xiray haddii ay ku dhamaato meeshii ay ka bilaabatay; isticmaal iyo closed-ka `Feature` ee CivilCraft, haddii kale **Kaliya la sawiray**. Barooyinka aan muuqaal lahayn waxay helaan 0 (la xusay). |
| `Spiral` | spiral-yada clothoid ee `Curve` ag dhow (gudaha iyo dibadda; waxa loo akhriyaa PI oo leh radius iyo dhererka spiral-ka, dib loo qoraa `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | shabakada koowaad ee leh tuubooyin: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` tuubo kasta) iyo `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Waa la tagay, waana lagu xusay fariimaha

- Dusha ka dambeeya kan koowaad, dusha grid-ka iyo dusha kasta oo aan TIN ahayn
- Toosinta leh `IrregularLine` ama `Chain`, spiral-yada aan clothoid ahayn, spiral u dhexeeya laba curve, ama toosinta aan geometry lahayn
- Muuqaalka naqshadda ee ka dambeeya kan koowaad; `CircCurve` iyo `UnsymParaCurve` dhuuntada toosan (PVI-yadooda waa la haynayaa iyada oo aan curve lahayn)
- Barooyinka oo kaliya tixraacaya barooyin kale (`pntRef`), iyo barooyinka aan lagu akhrin karin isku-xirka
- Magacyada barooyinka soo noqnoqday (kan koowaad ayaa la hayaa)
- Xuduudyada qarsan, muujinta iyo xogta-jarka; xariiqyada aan lahayn barooyin 3D
- Shabakadaha tuubooyinka ka dambeeya kan koowaad; noocyada shabakada aan storm iyo sanitary ahayn (waa la akhriyaa sida storm)
- Qaab-afar-geesood, soo-gelin iyo soo-saar ahaan (waa la akhriyaa sida goobo); tuubooyinka ukun, ellipse iyo sanduuq iyo kanaalada (waa la akhriyaa sida tuubooyin goobo ah oo aan cabbir lahayn)
- Elementiyada `Spiral` ee khad muuqaalka
- `Parcels`, `Roadways`, `GradeModel` iyo `Survey`

Muuqaalka dhulka (`ProfSurf`) ee faylka ma la isticmaalo: CivilCraft wuxuu dhulka ka soo qaadaa dusha laftiisa.

## Fariimaha marka faylku furmi waayo

| Fariin | Macnaha |
|---|---|
| "Waa XML laakiin ma aha LandXML (xididka elementigiisu waa <…>)." | Faylku waa nooc kale oo XML ah. |
| "… ma leh barooyin, dusha TIN ama toosin oo CivilCraft akhriyi karo." | Waxa ku jira faylka oo dhan waa liiska la reebay. Qoraalada ka dambeeya ayaa sheegaya waxa ku jiray. |
| "Tag-ka dhamaadka oo aan waafaqsanayn …", "Tag aan la xirin …", "Faylku wuxuu ku dhammaadaa gudaha …" | Faylku waa khaldan yahay ama waa la gooyay. |
