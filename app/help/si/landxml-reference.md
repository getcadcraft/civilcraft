---
title: LandXML: කියවන සහ ලියන දේ
summary: CivilCraft කියවන සහ ලියන LandXML 1.2 මූලද්‍රව්‍ය සහ ලක්ෂණ, මූලද්‍රව්‍යයෙන් මූලද්‍රව්‍යයට, සහ එය මඟ හරින සියල්ල.
keywords: landxml, xml, cgpoints, මතුපිට, tin, breaklines, මායිම, පෙළගැස්ම, coordgeom, පැතිකඩ, profalign, pvi, paracurve, pipenetworks, struct, නළය, planfeatures, planfeature, විශේෂාංග රේඛාව, schema
from: ca3cf359
---

CivilCraft නිල නාම අවකාශය සහ schema ස්ථානය සමඟ LandXML 1.2 ලියයි. එය මූල මූලද්‍රව්‍යය `LandXML` වන ඕනෑම ගොනුවක් කියවයි සහ පහත මූලද්‍රව්‍ය නමින් ගනී (නාම අවකාශ උපසර්ග නොසලකා හරින අතර; අනුවාදය පරීක්ෂා නොකෙරේ). එහි XML කියවනය ප්‍රමිත entity පහ සහ සංඛ්‍යාත්මක අක්ෂර යොමු පමණක් පිළිගනී; එය කිසිදා DTD හෝ බාහිර ගොනුවක් පූරණය නොකරයි. පියවර සඳහා, බලන්න [LandXML හුවමාරුව](topic:landxml).

LandXML ඛණ්ඩාංක උතුරු පළමුව ලියයි: ලක්ෂ්‍යයක් "N E" හෝ "N E Z" වේ.

## ලියන ලද

| මූලද්‍රව්‍යය | CivilCraft ලියන දේ |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, වර්ගඵල වර්ග අඩි වලින්, පරිමා ඝන යාර වලින්, විෂ්කම්භ අඟල් වලින්) හෝ `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = ව්‍යාපෘතියේ නම |
| `Application` | නම CivilCraft, නිෂ්පාදක CadCraft |
| `CgPoints` / `CgPoint` | `name` = ලක්ෂ්‍ය අංකය, `desc` = විස්තරය, `code` = කණ්ඩායම; පෙළ "N E Z" (හෝ උන්නතාංශයක් නැති විට "N E") |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw හෝ ccw, `radius`, `length`, `staStart`, `chord`, `delta` (අංශක), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | පෙළගැස්ම ඔස්සේ පවතින භූමිය, ස්ථාන සහ උන්නතාංශ යුගල ලෙස (`PntList2D`), මතුපිටින් ඉවත් වන තැන බෙදා |
| `Profile` / `ProfAlign` | සැලසුම් පැතිකඩ (නම "<පෙළගැස්ම> design"): අන්ත සහ කෝණ ලක්ෂ්‍ය සඳහා `PVI`, සිරස් වක්‍ර සඳහා `length` සමඟ `ParaCurve` |
| `Surfaces` / `Surface` | `name` සහ `desc`; පළමුව පවතින භූමිය, ඉන්පසු "Proposed" පෑඩ් හෝ කොරිඩෝ සමතලා වන විට |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (පවතින භූමිය පමණයි) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (පවතින භූමිය පමණයි, එකක් ඇති විට) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `id` සහිත `Pnts` / `P`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm හෝ sanitary |
| `Struct` | `name`, `elevRim` (භාවිත කළ රිම, සකසා ඇති හෝ මතුපිටින්), `elevSump`; `Center`; `diameter` සහිත `CircStruct`; `elev`, `flowDir` in හෝ out, `refPipe` සහිත `Invert` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `diameter` සහිත `CircPipe` |
| `PlanFeatures` / `PlanFeature` | විශේෂාංග රේඛාවකට එකක්: `name`; `Line` (`length`, `Start`, `End`) සහ `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` සහ `End` "N E Z" ලෙස, `Center` "N E" ලෙස) සහිත `CoordGeom`; `Property` භාවිතය සහ closed සහිත `Feature` `code="CivilCraft"` |

නොලියන ලද: වස්තු ලෙස පෑඩ් සහ කොරිඩෝ (ඒවායේ ප්‍රතිඵලය "Proposed" මතුපිටයි), දෝෂ සහිත පෙළගැස්ම්, ඉන්වර්ට් දෙකම නැති නළ, ජාල නීති.

## කියවන ලද

| මූලද්‍රව්‍යය | CivilCraft ගන්නා දේ |
|---|---|
| `Units` | `Imperial` හෝ `Metric` සහ එහි `linearUnit` අඩි හෝ මීටර තීරණය කරයි. නොදන්නා ඒකකයක් සටහන් වේ. |
| `Project` | `name` ව්‍යාපෘතියේ නම වේ. |
| `CgPoints` / `CgPoint` (කැදලි ද) | නම (හෝ `oID`), "N E" හෝ "N E Z", `desc` (හෝ `code`) විස්තරය ලෙස |
| `Surface` සමඟ `Definition surfType="TIN"` | `Pnts` සහ `Faces` පවතින භූමිය ලෙස (පළමු මතුපිට පමණි); දෘශ්‍ය නොවන මුහුණු (`i="1"`) ඉවත් වේ |
| `SourceData` / `Breaklines` | 3D බෙදුම් රේඛා, මතුපිට සමඟ තබා ගනී |
| `SourceData` / `Boundaries` | පිටත මායිම |
| `Alignment` / `CoordGeom` | `Line` සහ `Curve` මූලද්‍රව්‍ය; PI එක් එක් වක්‍රයේ `PI` වලින්, හෝ එහි `Center` සහ ස්පර්ශක වලින් නැවත ගොඩනගයි; `staStart` |
| `Profile` / `ProfAlign` | `PVI` සහ `ParaCurve` (`length` සමඟ); PVI දෙකක් හෝ වැඩි පළමු සැලසුම් පැතිකඩ |
| `PlanFeatures` / `PlanFeature` | එක් එක් විශේෂාංග රේඛාවක් ලෙස: `Line`, `Curve` (එහි `Start`, `Center`, `End` සහ `rot`) සහ `IrregularLine` (`PntList3D` හෝ `PntList2D`) අග සිට අග දක්වා සම්බන්ධ (හිඩැසක් සරල කොටසකින් සම්බන්ධ කර සටහන් වේ); ආරම්භ වූ තැනම අවසන් වන විට වසා ඇත; භාවිතය සහ වසා ඇත CivilCraft හි තමන්ගේම `Feature` වෙතින්, එසේ නොමැති නම **ඇඳ ඇත පමණයි**. උන්නතාංශයක් නැති ලක්ෂ්‍යවලට 0 ලැබේ (සටහන් වේ). |
| `Spiral` | `Curve` ට යාබදව ක්ලොතොයිඩ් සර්පිල (ඇතුළු සහ පිටත; අරය සහ සර්පිල දිග සහිත PI ලෙස කියවයි, `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant` සමඟ නැවත ලියයි) |
| `PipeNetwork` | නළ ඇති පළමු ජාලය: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, නළයකට `Invert`) සහ `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## මඟ හැරුණු, සහ සටහන් වල නම් කළ

- පළමුවෙනි පසු මතුපිට, ජාල මතුපිට සහ අනෙකුත් non-TIN මතුපිට
- `IrregularLine` හෝ `Chain` මූලද්‍රව්‍ය අඩංගු පෙළගැස්ම්, ක්ලොතොයිඩ් නොවන සර්පිල, වක්‍ර දෙකක් අතර සර්පිලයක්, හෝ ජ්‍යාමිතියක් නැති පෙළගැස්ම්
- පළමුවෙනි පසු සැලසුම් පැතිකඩ; `CircCurve` සහ `UnsymParaCurve` සිරස් වක්‍ර (ඒවායේ PVI වක්‍රයක් නැතිව තබයි)
- අනෙක් ලක්ෂ්‍යවලට පමණක් යොමු කරන ලක්ෂ්‍ය (`pntRef`), සහ කියවිය හැකි ඛණ්ඩාංක නැති ලක්ෂ්‍ය
- නැවත එන ලක්ෂ්‍ය නම් (පළමුවැන්න තබයි)
- සඟවන, පෙන්වන සහ දත්ත-කප්පාදු මායිම්; 3D ලක්ෂ්‍ය නැති බෙදුම් රේඛා
- පළමුවෙනි පසු නළ ජාල; storm සහ sanitary හැර වෙනත් ජාල වර්ග (storm ලෙස කියවයි)
- සෘජුකෝණාස්‍ර, ඇතුළු සහ පිටතට යන ව්‍යුහ (වටකුරු ලෙස කියවයි); බිත්තර, ඉලිප්සාකාර සහ පෙට්ටි නළ සහ ඇළ (ප්‍රමාණයක් නැති වටකුරු නළ ලෙස කියවයි)
- සැලසුම් විශේෂාංගවල `Spiral` මූලද්‍රව්‍ය
- `Parcels`, `Roadways`, `GradeModel` සහ `Survey`

ගොනුවක ඇති භූමි පැතිකඩ (`ProfSurf`) භාවිත නොවේ: CivilCraft භූමිය මතුපිටින්ම නියැදි කරයි.

## ගොනුව විවෘත නොවන විට පණිවිඩ

| පණිවිඩය | අර්ථය |
|---|---|
| "මෙය XML වේ, නමුත් LandXML නොවේ (එහි මූල මූලද්‍රව්‍යය <…>)." | ගොනුව වෙනත් වර්ගයේ XML එකකි. |
| "… හි CivilCraft කියවිය හැකි ලක්ෂ්‍ය, TIN මතුපිට හෝ පෙළගැස්ම් නැත." | ගොනුවේ සියල්ල මඟ හැරුණු ලැයිස්තුවේ ඇත. ඊට පසු සටහන් එහි තිබුණු දේ කියයි. |
| "නොගැළපෙන අවසාන ටැගය …", "වසා නැති ටැගය …", "ගොනුව … ඇතුළත අවසන් වේ" | ගොනුව හානි වී හෝ කෙටි වී ඇත. |
