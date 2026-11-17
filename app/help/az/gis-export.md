---
title: GIS üçün as-built məlumatlarını ixrac et
summary: Nöqtələri, horizontalları, trassaları, platformaları, boruları və qurğuları şəhər və ya rayon GIS şöbəsinə shapefile, GeoPackage, GeoJSON və ya KML formatında, layihənin koordinat sisteminin şəbəkə koordinatlarında təhvil verin.
keywords: gis, ixrac, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, borular, qurğular, kommunal xidmətlər, şəhər, rayon, şəbəkə, zəmin, epsg, prj
from: bba4fea5
---

Bir çox şəhər və rayonlar layihə bağlananda GIS formatında as-built məlumatları tələb edir: boruların və qurğuların yerləşməsi, son planlaşdırılmış səviyyələr, yol mərkəz xətti. **GIS › İxrac** CivilCraft-ın saxladığı məlumatları GIS qatları kimi, hər obyekt növü üçün bir olmaqla yazır.

## İxracdan əvvəl

1. Layihənin koordinat sistemini {{ui:Coordinates}} bölməsində təyin edin. GIS şöbəsi rəqəmlərin harada olduğunu bilməlidir; sistem olmadan fayllar layihənin öz rəqəmlərini daşıyır və heç bir ad göstərmir.
2. Səthi, trassaları, platformaları və boru şəbəkəsini təhvil verəcəyiniz kimi yoxlayın.
3. Şöbədən hansı formatı və hansı koordinat sistemini istədiklərini soruşun. Bir çoxu hələ də yerli dövlət müstəvi zonasında shapefile istəyir; yeni sistemlər GeoPackage qəbul edir.

## İxrac

1. **GIS** qrupunda {{ui:Export}} düyməsinə klikləyin.
2. **Nə** altında göndəriləcək növləri işarələyin. Hər birində neçə obyekt olduğu göstərilir; hələ heç nəsi olmayan növlər boz olur.
3. **Necə** altında formatı seçin.
4. Koordinat və vahidlər haqqında qeydləri oxuyun, sonra yükləmə düyməsinə klikləyin. Status sətiri nə daxil olduğunu və hansı sütun adlarının qısaldıldığını bildirir.

Dialoqda hündürlük şəbəkəsinin ixracı da var ({{ui:Surface as a GeoTIFF elevation grid}}); bax: [Hündürlük şəbəkələri və LiDAR](topic:elevation-grids-and-lidar).

## Hər növ nəyi saxlayır

| Növ | Forma | Sütunlar |
|---|---|---|
| Planalma nöqtələri | Hündürlüklü nöqtələr | `P` nöqtə nömrəsi, `N` şimal koordinatı, `E` şərq koordinatı, `Z` hündürlük, `D` təsvir |
| Mövcud zəminin, planlaşdırılmış səthin horizontalları | Öz hündürlüyündə xətlər | `ELEV` |
| Qırılma xətləri | Hündürlüklü xətlər | `NAME` |
| Səth sərhədi | Poliqon (çəkilmiş sərhəd, yoxsa səthin kənarı) | `NAME` |
| Trassalar | Mərkəz xətləri | `NAME`, `LENGTH`, `STA_START`, `STA_END` (pikətlər sadə rəqəm kimi) |
| Platformalar | Platforma hündürlüyündə poliqonlar | `NAME`, `ELEV`, `AREA` |
| Daylight xətləri | Hündürlüklü xətlər (platformalar və dəhlizlər) | `NAME` |
| Dəhlizin xarakterik xətləri | Hündürlüklü xətlər: mərkəz, asfaltın kənarları, çiyinlər | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Borular | Yuxarı invertdən aşağı invertə xətlər | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (faizlə), `LENGTH`, `NETWORK` |
| Qurğular | Kənar nöqtələrində nöqtələr | `NAME`, `RIM`, `INVERT` (oradakı ən aşağı boru invertı), `SUMP`, `DIA`, `DIA_UNIT` |
| Hər GIS qatı | İdxal olunduğu kimi | Öz sütunları |

Uzunluqlar, pikətlər və hündürlüklər layihənin vahidlərindədir (ABŞ sorğu futu və ya metr). Boru və qurğu diametrləri fut layihələri üçün düymlə, metr layihələri üçün millimetrlə verilir; `DIA_UNIT` hansının olduğunu göstərir.

## Formatlar

- **Shapefile**: hər növ üçün shapefile (`.shp`, `.shx`, `.dbf`) olan bir `.zip`, mətnin UTF-8 olduğunu bildirən `.cpg` və koordinat sistemini adlandıran `.prj`. Hündürlüklü fiqurlar shapefile-ın Z tipləri kimi yazılır. Formatın tələbinə görə 10 simvoldan uzun sütun adları qısaldılır və status sətiri onları sadalayır.
- **GeoPackage**: hər növ üçün cədvəli olan bir `.gpkg` fayl; koordinat sistemi EPSG kodu ilə saxlanılır. Bir çox fayl əvəzinə bir fayl, uzun sütun adları saxlanılır.
- **KML** və ya **KMZ** (zipli KML): Google Earth və veb xəritələr üçün enlik və uzunluqla bir fayl, hər növ üçün qovluq, hər obyekt NAME sütunundan adlandırılmış yer işarəsi (placemark), hər sütun isə əlavə məlumat kimi; hündürlüklər metrlə (hündürlük rejimi absolyut). GeoJSON kimi, layihənin koordinat sistemi tələb olunur.
- **GeoJSON**: enlik və uzunluqla bir fayl (GeoJSON standartı başqa heç nəyə icazə vermir), hər obyektdə qəbuledicinin ayırması üçün `kind` xüsusiyyəti (`pipes`, `structures`, …). Hündürlüklər standartın tələbinə görə metrə çevrilir; layihənizin şaquli datumunda qalır (CivilCraft-da geoid modeli yoxdur). Koordinat sistemi olmayan layihə GeoJSON ixrac edə bilməz və dialoq bunun səbəbini göstərir.

## Şəbəkə, zəmin deyil

GIS şöbələri məlumatlarını koordinat sisteminin **şəbəkə** koordinatlarında saxlayır. Layihəniz zəmin və ya lokal koordinatlardan istifadə edirsə ({{ui:Coordinates}} bölməsində təyin olunub), hər koordinat ixrac zamanı şəbəkəyə çevrilir: fayllardakı rəqəmlər planınkından miqyas əmsalınız qədər fərqlənir (lokal sistem üçün fırlanma da). `N` və `E` nöqtə sütunları da şəbəkə dəyərlərini saxlayır. Dialoq bunu xatırladır.

:::tip
Fayllarla birlikdə qısa qeyd göndərin: koordinat sistemi və onun EPSG kodu, hündürlüklərinizin şaquli datumu, vahidlər və hər faylın nə olduğu.
:::

## Nə yoxlanıldı

- Yazılan hər fayl GDAL ilə geri oxundu (əksər GIS proqramlarının bu faylları oxumaq üçün istifadə etdiyi kitabxana): hər fiqur, hündürlük və atribut, obyekt sayları və koordinat sistemi EPSG kodu kimi (`.prj` və GeoPackage). Bizim öz oxuyucularımız da eyni cür oxudu.
- GeoJSON faylları RFC 7946 standartına uyğundur: əvvəl uzunluq, sonra enlik, `crs` üzvü yoxdur, xarici halqalar saat əqrəbinin əksinə, deşiklər saat əqrəbi istiqamətində; mövqelər PROJ ilə 2 mm dəqiqliklə üst-üstə düşür.
- Yalnız zəmin koordinatlı layihə ixrac edildi və hər nöqtə şəbəkə koordinatları ilə yoxlandı.
- Burada heç nə hələ digər GIS proqramlarında açılmayıb. İlk təhvili şöbə ilə yoxlayın, sonra ona güvənin.
