---
title: LandXML: okufundwayo nokubhalwayo
summary: Izakhi nezici ze-LandXML 1.2 ezifundwa futhi ezibhalwa yi-CivilCraft, ngesakhi ngesakhi, nakho konke okudlulayo.
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, umugqa wesici, isikimu
from: ca3cf359
---

CivilCraft ibhala i-LandXML 1.2 ngesikhala esisemthethweni negama lesakhiwo sokuqinisekisa. Ifunda noma yiliphi ifayela eliyi-root element yalo ingu-`LandXML` futhi ithatha izakhi ezingezansi ngamagama awo (izinhlobo zamagama esikhala zincezwa; inguqulo ayihlolwa). Umfundi wayo we-XML wamukela izinhlobo ezinhlanu ezijwayelekile zama-entity nezinkomba zezinhlamvu ezinezinombolo; ayikaze ilayishe DTD noma ifayela langaphandle. Ngezinyathelo, bona [Hlanganisa nge-LandXML](topic:landxml).

I-LandXML ibhala izihlanganiso ngo-northing kuqala: iphoyinti liba "N E" noma "N E Z".

## Kubhaliwe

| Isakhi | Okubhalwa yi-CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, izindawo ngamafidi ayisikwele, amavolumu ngamayadi ekhyubhu, ububanzi ngamainchi) noma `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = igama leprojekthi |
| `Application` | igama CivilCraft, umkhiqizi i-CadCraft |
| `CgPoints` / `CgPoint` | `name` = inombolo yephoyinti, `desc` = incazelo, `code` = iqembu; umbhalo "N E Z" (noma "N E" ngaphandle kokuphakama) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw noma ccw, `radius`, `length`, `staStart`, `chord`, `delta` (amadigri), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | umhlaba okhona ngomzila, njengamapheya wesiteshi nokuphakama (`PntList2D`), ahlukaniswe lapho ushiya umphezulu |
| `Profile` / `ProfAlign` | iphrofayili yokwakha (ibizwa ngokuthi "<alignment> design"): `PVI` yokuphela nezindawo zokujika, `ParaCurve` ne-`length` yamajika athe xaxa |
| `Surfaces` / `Surface` | `name` ne-`desc`; kuqala umhlaba okhona, bese "Proposed" uma amapad noma imigwaqo ilinganiswa |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (umhlaba okhona kuphela) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (umhlaba okhona kuphela, uma ukhona) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` ne-`id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm noma sanitary |
| `Struct` | `name`, `elevRim` (umphetho osetshenzisiwe, osethiwe noma ovela emphezulwini), `elevSump`; `Center`; `CircStruct` ne-`diameter`; `Invert` ne-`elev`, `flowDir` in noma out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` ne-`diameter` |
| `PlanFeatures` / `PlanFeature` | eyodwa ngomugqa wesici ngamunye: `name`; `CoordGeom` ne-`Line` (`length`, `Start`, `End`) kanye ne-`Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` no `End` njengo "N E Z", `Center` njengo "N E"); `Feature` `code="CivilCraft"` ne-`Property` use kanye ne-closed |

Akubhalwa: amapad nemigwaqo njengezinto (umphumela wazo ungumphezulu othi "Proposed"), imizila enamaphutha, amapayipi angenawo womabili ama-invert, nemithetho yenethiwekhi.

## Kufundwayo

| Isakhi | Okuthathwa yi-CivilCraft |
|---|---|
| `Units` | `Imperial` noma `Metric` nesakhi lalo `linearUnit` zinquma ukuthi amafidi noma imitha. Iyunithi engaziwa iyaqashelwa. |
| `Project` | `name` iba igama leprojekthi. |
| `CgPoints` / `CgPoint` (nakuzakhi ezingaphakathi) | igama (noma `oID`), "N E" noma "N E Z", `desc` (noma `code`) njengencazelo |
| `Surface` ne-`Definition surfType="TIN"` | `Pnts` ne-`Faces` njengomhlaba okhona (umphezulu wokuqala kuphela); ubuso obungabonakali (`i="1"`) buyashiywa |
| `SourceData` / `Breaklines` | imigqa yokuhlukanisa engu-3D, igcinwa nomphezulu |
| `SourceData` / `Boundaries` | umngcele wangaphandle |
| `Alignment` / `CoordGeom` | izakhi `Line` ne-`Curve`; ama-PI akhiwa kabusha kusuka ku-`PI` yejika ngalinye, noma ku-`Center` nezitanjenti zalo; `staStart` |
| `Profile` / `ProfAlign` | `PVI` ne-`ParaCurve` (ne-`length`); iphrofayili yokuqala yokwakha enama-PVI amabili noma ngaphezulu |
| `PlanFeatures` / `PlanFeature` | ngayinye njengomugqa wesici: `Line`, `Curve` (`Start`, `Center`, `End` ne-`rot`) kanye ne-`IrregularLine` (`PntList3D` noma `PntList2D`) ehlanganiswe ukuya ekugcineni (igebe lihlanganiswa ngesegimenti esiqondile futhi liyaqashelwa); livaliwe uma liphela lapho laqala khona; ukusetshenziswa nokuvaliwa kusuka ku-`Feature` ye-CivilCraft, kungenjalo **Kudwetshwe kuphela**. Amaphoyinti angenaphakamo athola 0 (liyaqashelwa). |
| `Spiral` | ama-clothoid spirals eduze kwe-`Curve` (phakathi nangaphandle; ifundwa njenge-PI enomsakazo nobude bemijikelezo, ibhalwe kabusha nge-`theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | inethiwekhi yokuqala enamapayipi: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` ngepayipi ngalinye) kanye ne-`Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Okushiywayo, nokubhalwe emanothini

- Imiphezulu eyalandela eyokuqala, imiphezulu yegridi nemiphezulu engeyona eye-TIN
- Imizila equkethe izakhi ze-`IrregularLine` noma `Chain`, izinsila ezingeyona eziyi-clothoid, insila phakathi kwamajika amabili, noma engenayo ijometri
- Amaphrofayili wokwakha angaphezu kokuqala; amajika athe xaxa e-`CircCurve` no-`UnsymParaCurve` (ama-PVI awo agcinwa ngaphandle kwejika)
- Amaphoyinti abhekisela kwamanye amaphoyinti kuphela (`pntRef`), namaphoyinti angenazihlangufanisi ezifundekayo
- Amagama amaphoyinti aphindwayo (okokuqala kugcinwa)
- Imingcele yokufihla, yokubonisa nokusika ngedatha; imigqa yokuhlukanisa engenamaphoyinti angu-3D
- Izinethiwekhi zamapayipi ngaphandle kokuqala; izinhlobo zenethiwekhi ezingesona i-storm noma i-sanitary (ziyafundwa njenge-storm)
- Izakhiwo ezinamakhona, ezingenisa nezaphumayo (ziyafundwa njengezindilinga); amapayipi namakhanali e-egg, aseyisibhamu nebhokisi (ayafundwa njengamapayipi ezindilinga azinasayizi)
- Izakhi ze-`Spiral` ezinqubweni zezici zepulani
- `Parcels`, `Roadways`, `GradeModel` no-`Survey`

Iphrofayili yomhlaba (`ProfSurf`) efayeleni ayisetshenziswa: i-CivilCraft ithatha umhlaba ngokwayo emphezulwini.

## Imilayezo lapho ifayela lingavuleki

| Umlayezo | Okusho |
|---|---|
| "This is XML but not LandXML (its root element is <…>)." › "Lena i-XML kodwa hhayi i-LandXML (i-root element yayo ingu-<…>)." | Ifayela lolunye uhlobo lwe-XML. |
| "… has no points, TIN surfaces or alignments CivilCraft can read." › "… alinawo amaphoyinti, imiphezulu ye-TIN noma imizila i-CivilCraft engayifunda." | Konke esifayeleni kukuhlu lwalokho okushiywayo. Amanothi alandelayo atshela ukuthi kwakukhona yini. |
| "Mismatched end tag …", "Unclosed tag …", "The file ends inside …" › "Ithegi elingaphelelwe …", "Ithegi elingavaliwe …", "Ifayela liphela ngaphakathi …" | Ifayela lonakele noma lifushane. |
