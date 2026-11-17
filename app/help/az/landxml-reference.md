---
title: LandXML: nə oxunur və nə yazılır
summary: CivilCraft-ın oxuduğu və yazdığı LandXML 1.2 elementləri və atributları, element-element, və ötürdüyü hər şey.
keywords: landxml, xml, cgpoints, səth, tin, sınır xətləri, sərhəd, trassa, coordgeom, profil, profalign, pvi, paracurve, pipenetworks, struct, boru, planfeatures, planfeature, xüsusiyyət xətti, sxem
from: ca3cf359
---

CivilCraft LandXML 1.2-ni rəsmi ad fəzası və sxem yeri ilə yazır. Kök elementi `LandXML` olan istənilən faylı oxuyur və aşağıdakı elementləri adına görə götürür (ad fəzası prefiksləri nəzərə alınmır; versiya yoxlanılmır). Onun XML oxuyucusu yalnız beş standart varlığı və rəqəmsal simvol istinadlarını qəbul edir; heç vaxt DTD və ya xarici fayl yükləmir. Addımlar üçün bax: [LandXML mübadiləsi](topic:landxml).

LandXML koordinatları əvvəl şimal (N), sonra şərq (E) yazır: nöqtə "N E" və ya "N E Z" şəklindədir.

## Yazılır

| Element | CivilCraft nə yazır |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, sahələr kvadrat futda, həcmlər kub yardda, diametrlər düymdə) və ya `Metric` (meter, kvadrat metr, kub metr, millimetr) |
| `Project` | `name` = layihənin adı |
| `Application` | ad CivilCraft, istehsalçı CadCraft |
| `CgPoints` / `CgPoint` | `name` = nöqtə nömrəsi, `desc` = təsvir, `code` = qrup; mətn "N E Z" (və ya hündürlük olmadan "N E") |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw və ya ccw, `radius`, `length`, `staStart`, `chord`, `delta` (dərəcə ilə), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | trassa boyunca mövcud relyef, stansiya və hündürlük cütləri kimi (`PntList2D`), səthdən çıxdığı yerdə bölünür |
| `Profile` / `ProfAlign` | layihə profili (adı "<trassa> design"): uclar və bucaq nöqtələri üçün `PVI`, şaquli əyrilər üçün `length` ilə `ParaCurve` |
| `Surfaces` / `Surface` | `name` və `desc`; əvvəl mövcud relyef, altlıqlar və ya korridorlar planlaşdırılanda sonra "Proposed" |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (yalnız mövcud relyef) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (yalnız mövcud relyef, olduqda) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `id` ilə `Pnts` / `P`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm və ya sanitary |
| `Struct` | `name`, `elevRim` (istifadə olunan lyuk səviyyəsi, təyin edilmiş və ya səthdən), `elevSump`; `Center`; `diameter` ilə `CircStruct`; `elev`, `flowDir` (in və ya out), `refPipe` ilə `Invert` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `diameter` ilə `CircPipe` |
| `PlanFeatures` / `PlanFeature` | hər xüsusiyyət xətti üçün bir: `name`; `CoordGeom` ilə `Line` (`length`, `Start`, `End`) və `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` və `End` "N E Z" kimi, `Center` "N E" kimi); `code="CivilCraft"` ilə `Feature`, `Property` istifadəsi və bağlılıq |

Yazılmır: obyekt kimi altlıqlar və korridorlar (nəticəsi "Proposed" səthidir), xətalı trassalar, hər iki invertə malik olmayan borular, şəbəkə qaydaları.

## Oxunur

| Element | CivilCraft nəyi götürür |
|---|---|
| `Units` | `Imperial` və ya `Metric`, və onun `linearUnit` fut və ya metr olduğunu müəyyən edir. Naməlum vahid qeyd olunur. |
| `Project` | `name` layihənin adı olur. |
| `CgPoints` / `CgPoint` (iç-içə də) | ad (və ya `oID`), "N E" və ya "N E Z", təsvir kimi `desc` (və ya `code`) |
| `Definition surfType="TIN"` ilə `Surface` | `Pnts` və `Faces` mövcud relyef kimi (yalnız birinci səth); görünməz üzlər (`i="1"`) buraxılır |
| `SourceData` / `Breaklines` | 3D sınır xətləri, səthlə saxlanılır |
| `SourceData` / `Boundaries` | xarici sərhəd |
| `Alignment` / `CoordGeom` | `Line` və `Curve` elementləri; PI-lər hər əyrinin `PI`-dən və ya onun `Center` və tangenslərindən yenidən qurulur; `staStart` |
| `Profile` / `ProfAlign` | `PVI` və `ParaCurve` (`length` ilə); ən azı iki PVI olan birinci layihə profili |
| `PlanFeatures` / `PlanFeature` | hər biri xüsusiyyət xətti kimi: `Line`, `Curve` (`Start`, `Center`, `End` və `rot`) və `IrregularLine` (`PntList3D` və ya `PntList2D`) ucdan-uca birləşdirilir (boşluq düz parça ilə birləşdirilir və qeyd olunur); başladığı yerdə bitdikdə bağlı; istifadə və bağlılıq CivilCraft-ın öz `Feature`-indən götürülür, əks halda **Yalnız çəkilib** |

Hündürlüyü olmayan nöqtələr 0 alır (qeyd olunur).

| `Spiral` | `Curve`-in yanında klotoid spirallar (girişdə və çıxışda; PI kimi radius və spiral uzunluqları ilə oxunur, `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant` ilə geri yazılır) |
| `PipeNetwork` | boruları olan birinci şəbəkə: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diametri, hər boru üçün `Invert`) və `Pipe` (`refStart`, `refEnd`, `CircPipe` diametri) |

## Ötürülür və qeydlərdə adlanır

- Birincidən sonrakı səthlər, grid səthləri və digər qeyri-TIN səthlər
- `IrregularLine` və ya `Chain` elementləri olan trassalar, klotoiddən başqa spirallar, iki əyri arasında spiral və ya həndəsəsi olmayan trassalar
- Birincidən sonrakı layihə profilləri; `CircCurve` və `UnsymParaCurve` şaquli əyriləri (PVI-lər əyrisiz saxlanılır)
- Yalnız başqa nöqtələrə istinad edən nöqtələr (`pntRef`) və oxuna bilən koordinatları olmayan nöqtələr
- Təkrarlanan nöqtə adları (birincisi saxlanılır)
- Gizlətmə, göstərmə və məlumat kəsimi sərhədləri; 3D nöqtəsi olmayan sınır xətləri
- Birincidən sonrakı boru şəbəkələri; yağış və məişətdən başqa şəbəkə növləri (yağış kimi oxunur)
- Düzbucaqlı, giriş və çıxış strukturları (dairəvi kimi oxunur); yumurta, ellips və qutu boruları və kanallar (ölçüsüz dairəvi borular kimi oxunur)
- Xüsusiyyət xətlərində `Spiral` elementləri
- `Parcels`, `Roadways`, `GradeModel` və `Survey`

Fayldakı relyef profilləri (`ProfSurf`) istifadə olunmur: CivilCraft relyefi səthin özündən götürür.

## Fayl açılmadıqda mesajlar

| Mesaj | Mənası |
|---|---|
| "Bu XML-dir, lakin LandXML deyil (kök elementi <…>)." | Fayl başqa növ XML-dir. |
| "… CivilCraft-ın oxuya biləcəyi nöqtə, TIN səth və ya trassa yoxdur." | Faylda hər şey ötürülən siyahıdadır. Ondan sonrakı qeydlər orada nə olduğunu deyir. |
| "Uyğunsuz bağlayıcı etiket …", "Bağlanmamış etiket …", "Fayl … daxilində bitir" | Fayl zədələnib və ya yarımçıqdır. |
