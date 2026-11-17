---
title: LandXML: okunan ve yazılan
summary: CivilCraft'ın okuduğu ve yazdığı LandXML 1.2 öğeleri ve öznitelikleri, öğe öğe; ve atladığı her şey.
keywords: landxml, xml, cgpoints, yüzey, tin, kırılma çizgileri, sınır, eksen, coordgeom, profil, profalign, pvi, paracurve, pipenetworks, struct, boru, planfeatures, planfeature, özellik çizgisi, şema
from: ca3cf359
---

CivilCraft, resmî ad alanı ve şema konumuyla LandXML 1.2 yazar. Kök öğesi `LandXML` olan her dosyayı okur ve aşağıdaki öğeleri ada göre alır (ad alanı önekleri yok sayılır; sürüm denetlenmez). XML okuyucusu yalnızca beş standart varlığı ve sayısal karakter başvurularını kabul eder; hiçbir zaman DTD ya da dış dosya yüklemez. Adımlar için bkz. [LandXML ile veri alışverişi](topic:landxml).

LandXML koordinatları önce kuzeyi (N) yazar: bir nokta "N E" ya da "N E Z" biçimindedir.

## Yazılan

| Öğe | CivilCraft'ın yazdığı |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, alanlar kare fit cinsinden, hacimler kübik yard, çaplar inç) ya da `Metric` (metre, metrekare, metreküp, milimetre) |
| `Project` | `name` = proje adı |
| `Application` | ad CivilCraft, üretici CadCraft |
| `CgPoints` / `CgPoint` | `name` = nokta numarası, `desc` = tanım, `code` = grup; metin "N E Z" (ya da kotsuz "N E") |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw ya da ccw, `radius`, `length`, `staStart`, `chord`, `delta` (derece), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | eksen boyunca mevcut zemin, istasyon ve kot çiftleri olarak (`PntList2D`), yüzeyden ayrıldığı yerde bölünmüş |
| `Profile` / `ProfAlign` | tasarım profili ("<alignment> design" adıyla): uç ve açı noktaları için `PVI`, düşey eğriler için `length` ile `ParaCurve` |
| `Surfaces` / `Surface` | `name` ve `desc`; önce mevcut zemin, platformlar ya da koridorlar tesviye ettiğinde "Proposed" |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (yalnızca mevcut zemin) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (yalnızca mevcut zemin, varsa) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `id` ile `Pnts` / `P`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm ya da sanitary |
| `Struct` | `name`, `elevRim` (kullanılan kenar, ayarlanmış ya da yüzeyden), `elevSump`; `Center`; `diameter` ile `CircStruct`; `elev`, `flowDir` (in ya da out), `refPipe` ile `Invert` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `diameter` ile `CircPipe` |
| `PlanFeatures` / `PlanFeature` | özellik çizgisi başına bir tane: `name`; `Line` (`length`, `Start`, `End`) ve `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` ve `End` "N E Z" olarak, `Center` "N E" olarak) içeren `CoordGeom`; `code="CivilCraft"` ile `Feature`, `Property` kullanımı ve `closed` |

Yazılmayanlar: nesne olarak platformlar ve koridorlar (sonucu "Proposed" yüzeyidir), hataları olan eksenler, iki invert'i de olmayan borular, ağ kuralları.

## Okunan

| Öğe | CivilCraft'ın aldığı |
|---|---|
| `Units` | `Imperial` ya da `Metric` ve `linearUnit` feet ya da metreyi belirler. Bilinmeyen bir birim not edilir. |
| `Project` | `name` proje adı olur. |
| `CgPoints` / `CgPoint` (iç içe olanlar da) | ad (ya da `oID`), "N E" ya da "N E Z", tanım olarak `desc` (ya da `code`) |
| `Surface` ile `Definition surfType="TIN"` | `Pnts` ve `Faces` mevcut zemin olarak (yalnızca ilk yüzey); görünmez yüzler (`i="1"`) dışarıda bırakılır |
| `SourceData` / `Breaklines` | 3B kırılma çizgileri, yüzeyle birlikte tutulur |
| `SourceData` / `Boundaries` | dış sınır |
| `Alignment` / `CoordGeom` | `Line` ve `Curve` öğeleri; PI'lar her eğrinin `PI`'sinden ya da `Center` ve teğetlerinden yeniden kurulur; `staStart` |
| `Profile` / `ProfAlign` | `PVI` ve `ParaCurve` (`length` ile); en az iki PVI'si olan ilk tasarım profili |
| `PlanFeatures` / `PlanFeature` | her biri bir özellik çizgisi olarak: `Line`, `Curve` (`Start`, `Center`, `End` ve `rot`) ve `IrregularLine` (`PntList3D` ya da `PntList2D`), uç uca birleştirilir (boşluk düz bir parçayla birleştirilir ve not edilir); başladığı yerde bittiğinde kapalı; kullanım ve kapalılık CivilCraft'ın kendi `Feature` öğesinden alınır, yoksa **Yalnızca çizilmiş**. Yüksekliği olmayan noktalar 0 alır (not edilir). |
| `Spiral` | bir `Curve`'ün yanındaki klotoid spiraller (giriş ve çıkış; yarıçaplı bir PI ve spiral uzunlukları olarak okunur, `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant` ile geri yazılır) |
| `PipeNetwork` | boru içeren ilk ağ: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` çapı, boru başına `Invert`) ve `Pipe` (`refStart`, `refEnd`, `CircPipe` çapı) |

## Atlananlar ve notlarda adı geçenler

- İlkinden sonraki yüzeyler, grid yüzeyler ve TIN olmayan diğer yüzeyler
- `IrregularLine` ya da `Chain` öğeleri içeren eksenler, klotoid dışı spiraller, iki eğri arasındaki spiraller ya da geometrisi olmayan eksenler
- İlkinden sonraki tasarım profilleri; `CircCurve` ve `UnsymParaCurve` düşey eğriler (PVI'leri eğrisiz tutulur)
- Yalnızca başka noktalara başvuran noktalar (`pntRef`) ve okunabilir koordinatı olmayan noktalar
- Tekrarlanan nokta adları (ilki tutulur)
- Gizle, göster ve veri kırpma sınırları; 3B noktası olmayan kırılma çizgileri
- İlkinden sonraki boru ağları; storm ve sanitary dışındaki ağ türleri (storm olarak okunur)
- Dikdörtgen, giriş ve çıkış yapıları (yuvarlak olarak okunur); yumurta, eliptik ve kutu biçimli borular ve kanallar (boyutsuz yuvarlak borular olarak okunur)
- Özellik çizgilerindeki `Spiral` öğeleri
- `Parcels`, `Roadways`, `GradeModel` ve `Survey`

Dosyadaki zemin profilleri (`ProfSurf`) kullanılmaz: CivilCraft zemin örneğini yüzeyin kendisinden alır.

## Dosya açılmadığında gelen mesajlar

| Mesaj | Anlamı |
|---|---|
| "Bu XML, ancak LandXML değil (kök öğesi <…>)." | Dosya başka bir XML türüdür. |
| "… CivilCraft'ın okuyabileceği nokta, TIN yüzey ya da eksen içermiyor." | Dosyadaki her şey atlanan listede yer alır. Sonraki notlar neyin olduğunu söyler. |
| "Eşleşmeyen kapanış etiketi …", "Kapatılmamış etiket …", "Dosya … içinde bitiyor" | Dosya bozuk ya da kesik. |
