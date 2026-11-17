---
title: Yüksəklik şəbəkələri və LiDAR
summary: Mövcud relyefi DEM-dən (GeoTIFF və ya ASCII şəbəkə) və ya LiDAR nöqtələrindən (LAS, LAZ) qurun — sahəni seçin, məlumatı seyrəltin, sinifləri seçin və yüksəklik vahidlərini yoxlayın — və səthi GeoTIFF yüksəklik şəbəkəsi kimi geri verin.
keywords: dem, dtm, yüksəklik şəbəkəsi, geotiff, tif, ascii grid, asc, lidar, las, laz, nöqtə buludu, siniflər, relyef, seyrəltmə, nodata, rastr, geotiff ixracı, gis
from: c8b2d18a
---

Açıq yüksəklik məlumatları iki yolla gəlir: **yüksəklik şəbəkələri** (DEM: hər kvadrat xana üçün bir yüksəklik, adətən GeoTIFF `.tif` və ya ASCII şəbəkə `.asc`) və **LiDAR nöqtələri** (`.las` faylında milyonlarla lazer əksi, sıxılmış halda `.laz`). CivilCraft hər ikisini brauzerin daxilində planalma nöqtələrinə və ya səthə çevirir: heç nə yüklənmir.

## Faylı açmaq

1. {{ui:Open}} düyməsini basın (və ya **GIS** qrupunda {{ui:Import}}) və faylı seçin, ya da planın üzərinə sürükləyin. ASCII şəbəkə üçün onun `.prj` faylını da seçin ki, CivilCraft koordinat sistemini bilsin.
2. İdxal dialoqu faylın özü haqqında nə dediyini göstərir: ölçüsünü, xanalarını və ya nöqtələrini, koordinat sistemini, enlik və uzunluq üzrə yerini və yüksəklik diapazonunu. LiDAR üçün əvvəlcə bütün nöqtələr bir dəfə oxunur ki, **siniflər** sayılsın (irəliləmə zolağı nə qədər getdiyini göstərir; {{ui:Cancel}} onu dayandırır).

GeoTIFF-də üç və ya dörd zolaq (qırmızı, yaşıl, göy) varsa, bu şəkildir, yüksəklik deyil: o, xəritə qatlarına göndərilir.

## Nəyin gətiriləcəyini seçmək

- **Sahə**: {{ui:The project’s extents and a margin}} (kənarı yazın), {{ui:What the plan shows now}} və ya {{ui:The whole file}}. Faylın yalnız o hissəsi oxunur.
- **Seyrəltmə**: alacağınız nöqtələr arasındakı məsafə, layihənin vahidlərində. Ayarların altındakı sətir yazdıqca bu məsafənin neçə nöqtə verdiyini göstərir. Şəbəkə üçün CivilCraft hər ikinci, üçüncü … xananı saxlayır, beləliklə yüksəkliklər faylın dəqiq qiymətləri olaraq qalır; xanaları heç vaxt ortalamır. LiDAR üçün sahə həmin ölçüdə kvadratlara bölünür və hər kvadratda bir nöqtə saxlanılır: {{ui:The point nearest each cell’s center}} (defolt), {{ui:The lowest point in each cell}} (faylda yer sinfi olmadıqda yaxşıdır: yer ağacların altındadır) və ya {{ui:The average of each cell’s points}}.
- **Siniflər** (LiDAR): yer (sinif 2) faylda olduqda seçilir; binalar, ağaclar və küy kənarda qalır. Yer sinfi yoxdursa, bütün siniflər seçilir və dialoq bunu deyir.
- **Yer** (LiDAR, 0.8): dron buludunda yer sinfi yoxdur. Faylda heç olmadıqda dialoq {{ui:Find the ground myself (drone clouds, no ground class)}} seçimi ilə açılır: küydən başqa bütün siniflər oxunur, hər xanada ən aşağı nöqtə saxlanılır, sonra CivilCraft binaları, ağacları və səpələnmiş aşağı nöqtələri irəliləyən morfoloji filtrlə (Zhang və digərləri, 2003) çıxarır. Bu filtri idarə edə bilərsiniz: **Çıxarılacaq ən böyük obyekt** (ən böyük binanın eni; pəncərələr onu örtənə qədər böyüyür; 0 yazılsa, 20 xana deməkdir) və **Ən dik yer meyli**. İş ən aşağı nöqtələrin şəbəkəsi üzərində görülür, buna görə on milyonlarla nöqtəli bulud xana sayından çox xərcləmir (seyrəltmə bir axın keçididir). Xana aralığı: daha iri xana sürətlidir və kiçik obyektləri gözlədiyinizdən az buraxır, daha incə xana isə yer detallarını daha çox saxlayır. Hesabatda neçə nöqtənin yer kimi saxlandığı, neçə xananın obyekt kimi çıxarıldığı və neçə səpələnmiş aşağı nöqtənin atıldığı yazılır. Sınaq üçün hazırlanmış 300 m dron planalmasında (beş bina, 70 ağac, 200 aşağı kənar nöqtə) saxlanılan nöqtələr həqiqi relyefdən 3 cm daxilində idi və heç bir dam və ya ağac tacı saxlanılmadı.
- **Faylda yüksəkliklər**: metr, fut və ya ABŞ sorğu futu. Fayl bunu deyirsə, vahid artıq seçilir. Demirsə, seçməlisiniz: dialoq yüksəklik diapazonunu hər iki şəkildə göstərir ki, sahə üçün hansının məntiqli olduğunu anlayasınız.
- **Kimi idxal et** (yalnız şəbəkə): {{ui:Survey points (description DEM)}} və ya {{ui:The surface itself (a grid of triangles)}}.

Bir idxal ən çox 500,000 nöqtə götürür. Seçim bundan çox nöqtə verərsə, dialoq nə qədər çox olduğunu və hansı aralığın sığacağını deyir, {{ui:Import}} söndürülmüş qalır.

{{ui:Import}} düyməsini basın. İrəliləmə zolağı oxumanı göstərir; {{ui:Cancel}} onu dayandırır və heç nə dəyişmir.

:::warning
Şaquli vahidlər tez-tez tələ olur. Bir çox dövlət müstəvi DEM-lərində şərq və şimal koordinatları futla, yüksəkliklər isə metrlə olur. Dialoqun göstərdiyi diapazonu sahə haqqında bildiklərinizlə yoxlayın.
:::

## Nə alırsınız

- **Planalma nöqtələri**: ən yüksək nöqtə nömrənizdən sonra nömrələnir, təsvir `DEM` (şəbəkələr) və ya `LIDAR` olur, beləliklə **Nöqtələr** altında bir nöqtə qrupu əmələ gəlir və səth digər nöqtələr kimi qurulur. Onları idxal etmək bir addımdır: {{key:Mod+Z}} onları yenidən çıxarır.
- **Səthin özü**: şəbəkə TIN-i, hər xanada iki üçbucaq, cənub-qərbdən şimal-şərqə diaqonal boyunca bölünür. Məlumatı olmayan künclü üçbucaq çıxarılır, beləliklə məlumatdakı boşluqlar boşluq olaraq qalır. Səth hər şəbəkə nöqtəsində şəbəkəyə bərabərdir və aralarında hər üçbucaq daxilində düz müstəvidir. O, layihənin səthini əvəz edir (dialoq əvvəl soruşur); {{key:Mod+Z}} əvvəlki səthi qaytarır. Sol panelin başlığı **Səth (yüksəklik şəbəkəsindən)** deyir.

## Koordinat sistemləri

- Layihənin koordinat sistemi varsa və fayl başqasını göstərirsə, hər nöqtə layihənin sisteminə çevrilir (və varsa, onun yer və ya lokal koordinatlarına).
- Layihənin sistemi yoxdursa və faylın sistemi layihənin vahidlərindədirsə (fut və ya metr), dialoq onu layihənin koordinat sistemi etməyi təklif edir, nöqtələrlə eyni geri alma addımında.
- Fayl enlik və uzunluqdadırsa, və ya fut layihəsi üçün metrlədirsə, dialoq əvvəlcə layihənin koordinat sistemini seçməyinizi soruşur.
- Fayl demirsə, onun rəqəmləri layihənin koordinatları kimi qəbul olunur. Faylın sistemini seçə bilərsiniz.

## Səthi GeoTIFF kimi ixrac etmək

1. **GIS** qrupunda {{ui:Export}} düyməsini basın.
2. GeoTIFF hissəsində səthi (mövcud relyef və ya tənzimlənmiş səth) və xana ölçüsünü seçin. Defolt səthin orta üçbucaq kənarından gəlir. Dialoq yazılacaq şəbəkənin ölçüsünü göstərir.
3. {{ui:Download GeoTIFF}} düyməsini basın.

Fayl layihənin vahidlərində 32-bitlik üzən nöqtəli yüksəkliklərdən ibarət bir zolaqdır, səthin əhatə etdiyi sahə üzrə; səthdən kənar xanalar "məlumat yoxdur" (−3.4028235e38) olur. Hər xananın dəyəri xananın mərkəzindəki səth yüksəkliyidir. Koordinatlar **şəbəkə** koordinatlarıdır: yer və ya lokal koordinatlarda olan layihə şəbəkəyə geri çevrilir. Fayl layihənin koordinat sistemini EPSG kodu ilə göstərir; EPSG kodu olmayan sistem yazılmır və dialoq GIS şöbəsinə hansı sistem olduğunu bildirməyiniz barədə xəbərdarlıq edir.

## Nə yoxlanılıb

- GeoTIFF və ASCII şəbəkə oxuyucuları GDAL ilə (rasterio vasitəsilə) yoxlanılıb — ən çox GIS proqramlarının bu faylları oxumaq üçün istifadə etdiyi kitabxana: 32-bitlik üzən nöqtə və 16-bitlik tam şəbəkələr, kafelli və zolaqlı, DEFLATE və LZW, nodata, miqyas və ofset, piksel-nöqtə, UTM şəbəkəsi, ABŞ sorğu futlarında dövlət müstəvi şəbəkəsi və enlik/uzunluq şəbəkəsi — hər dəyər bərabər.
- LAS və LAZ oxuyucuları laspy ilə yoxlanılıb: LAS 1.2 və 1.4, nöqtə formatları 0, 1, 3, 6, 7 və 8, koordinat sistemi ilə və ya onsuz, LASzip ilə uyğun arxa hissə ilə yazılmış LAZ — hər nöqtə bərabər.
- Çevrilmiş koordinatlar PROJ ilə 1 mm dəqiqliyə yoxlanılıb.
- İxrac edilmiş GeoTIFF-lər GDAL ilə geri oxunub: koordinat sistemi, xana mövqeləri, nodata, vahidlər və səthə bərabər dəyərlər 0.0001 dəqiqliklə.
- Burada heç nə digər GIS və ya CAD proqramlarında açılmayıb.

## Hələ hazır deyil

- Şaquli datum dəyişiklikləri (geoid modelləri): yüksəkliklər faylda olduğu kimi istifadə olunur.
- Dalğa forması məlumatları, sinif xaricində LiDAR əksləri, rənglər və intensivliklər.
- Bir neçə zolaq, icmallar (overviews) və ya 200 MB-dan böyük fayllar.
- Səthdən və ya bu alətdən LAS və ya LAZ yazmaq ([Nöqtə buludları](topic:point-clouds) əlavəsi təmizlənmiş buludu LAS 1.4 və ya LAZ kimi yazır).
