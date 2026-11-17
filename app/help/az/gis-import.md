---
title: GIS məlumatlarını idxal et
summary: Shapefile, GeoJSON və GeoPackage fayllarını GIS qatları kimi layihəyə gətirin, onları düzgün koordinat sistemi ilə yerləşdirin, atributlarına baxın və səth üçün istifadə edin.
keywords: gis, etiketlər, obyektləri etiketlə, atributlar planda, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, idxal, qatlar, atributlar, koordinat sistemi, epsg, enlik, uzunluq, horizontallar, parsellər, qırılma xətləri, sərhəd
from: f6b235cc
---

Şəhər və rayon GIS şöbələri sayt kontekstini GIS faylları kimi verir: parsellər, servitutlar, horizontallar, kommunal xidmətlər, geodezik nəzarət. CivilCraft bunların üç növünü planda dizaynınızın altında oturan **GIS qatları** kimi açır.

| Fayl | Nəyi açmaq |
|---|---|
| Shapefile | `.shp` faylını onunla birlikdə olan `.shx`, `.dbf`, `.prj` və `.cpg` ilə (hamısını seçin), və ya gəldiyi `.zip`-i. Bir neçə shapefile olan zip bir neçə qat verir. |
| GeoJSON | `.geojson` faylı (ilk sətirlərində `FeatureCollection` və ya `Feature` yazan `.json` fayl da işləyir). |
| GeoPackage | `.gpkg` faylı. İçindəki hər obyekt cədvəli sadalanır. |
| KML və ya KMZ | `.kml` faylı (Google Earth və ya veb xəritədən), və ya zipli `.kmz`. Hər qovluq bir qat olur (bir neçə növ olduqda nöqtələrə, xətlərə və poliqonlara bölünür); yer işarəsinin adı, təsviri və əlavə məlumatı onun atributlarına çevrilir. Hündürlüklər metrlə və enlik-uzunluq ilə verilir, GeoJSON-da olduğu kimi. |

Nöqtələr, çoxnöqtələr, xətlər, deşikli poliqonlar və çoxhissəli fiqurlar oxunur; fayl varsa hündürlüklərlə (z) birlikdə. Ölçü (M) dəyərləri çıxarılır. Hündürlük şəbəkələri və LiDAR eyni cür açılır: bax [Hündürlük şəbəkələri və LiDAR](topic:elevation-grids-and-lidar).

## Faylları açmaq

1. **GIS** qrupunda {{ui:Import}} düyməsinə (və ya {{ui:Open}}) klikləyin, faylları seçin və ya planın üzərinə atın. Fayllar bu kompüterdə oxunur; heç nə yüklənmir.
2. **GIS məlumatlarını idxal et** dialoqu tapılan hər qatı sadalayır: növünü, neçə obyekt olduğunu (və neçəsində həndəsə yoxdur), neçə atribut sütunu olduğunu və faylın göstərdiyi koordinat sistemini. İstəmədiyiniz qatların işarəsini çıxarın.
3. **Koordinat sistemi** hissəsini (aşağıda) və **Nə olacaq** sətirini oxuyun, sonra {{ui:Import}} düyməsinə klikləyin.
4. Qatlar planda və sol paneldə **GIS qatları** altında görünür. İdxal bir addımdır: {{key:Mod+Z}} onu geri qaytarır.

Böyük fayl planın üzərində {{ui:Cancel}} düyməsi ilə birlikdə irəliləmə sətiri göstərir.

## Koordinat sistemi

GIS faylları harada olduqlarını koordinat sistemi ilə bildirir (shapefile-ın `.prj`, GeoPackage-in məkan istinad cədvəli; GeoJSON həmişə enlik və uzunluqdur). CivilCraft hər qatı öz sistemindən layihənin sisteminə çevirir. Heç vaxt təxmin etmir:

- **Layihənin koordinat sistemi var** ({{ui:Coordinates}} bölməsində təyin olunub): öz sistemi olan hər qat ona çevrilir, zəmin və ya lokal düzəlişlər daxil olmaqla. `.prj` olmayan fayl iki seçim alır: **Layihə ilə eyni** (rəqəmləri olduğu kimi yüklənir) və ya **Faylın sistemini seç**.
- **Layihənin sistemi yoxdur, fayl proyeksiya sistemindədir və layihənizin vahidlərindədir** (məsələn, fut layihəsi üçün ABŞ sorğu futunda dövlət müstəvi zonası): dialoq **Bu sistemi layihənin koordinat sistemi kimi istifadə et** təklif edir. Bu, idxalla eyni geri qaytarma addımında təyin olunur. Layihədə heç nə yerini dəyişmir; sistem yalnız rəqəmlərin nə demək olduğunu göstərir. İstəsəniz layihə üçün başqa sistem seçə bilərsiniz, və qatlar ona çevriləcək.
- **Layihənin sistemi yoxdur və fayl enlik və uzunluqdadır** (hər GeoJSON) **və ya başqa vahidlərdədir**: {{ui:Import}} koordinat sistemini seçənə qədər boz qalır. Seçici məlumata yaxın yerdən başlayır.
- **Nə layihə, nə də fayllar sistem göstərmir**: rəqəmlər olduğu kimi yüklənir və dialoq bunu bildirir.

Hündürlüklər də çevrilir: GeoJSON hündürlükləri metrdir (GeoJSON standartı belə deyir); digər faylların hündürlükləri öz sistemlərinin vahidində götürülür.

:::warning
GeoJSON faylında ±180° uzunluq və ya ±90° enlik xaricindəki mövqelər enlik və uzunluq deyil. Bu obyektlər çıxarılır və dialoq neçə olduğunu bildirir. Belə fayl adətən koordinat sistemi saxlanılmadan yazılmış proyeksiya faylıdır; faylı yenidən istəyin və ya `.prj` olan shapefile istəyin.
:::

NAD83 WGS 84 ilə eyni sayılır (GeoJSON-un istifadə etdiyi sistem); Şimali Amerikada ikisi bir neçə metr fərqlənir, buna görə GeoJSON məlumatları bu qədər kənara çıxa bilər. Ən yaxşı sürüşmə şəbəkə faylı tələb edirsə (məsələn, NAD27 üçün NADCON), CivilCraft daha kobud dərc edilmiş sürüşməni istifadə edir və koordinat sistemi dialoqu onun nə qədər kobud olduğunu göstərir (NAD27 üçün təxminən 20 m), şəbəkə faylı əlavə edilənə qədər: bax [Şəbəkə sürüşmə faylları](topic:coordinate-systems).

## GIS qatları

**GIS qatları** altında hər sətirdə:

- qatı göstərmək və ya gizlətmək üçün işarə qutusu (gizli qatlar da seçilmir);
- rəngi, siyahıdan seçilir;
- üç nöqtə menyusu ilə {{ui:Zoom to}}, {{ui:Use for the surface…}}, {{ui:Rename…}} və {{ui:Remove}}.

Göstərmək, gizlətmək, rəngini dəyişmək, adlandırmaq və silmək geri qaytarma addımlarıdır. GIS qatları layihə faylında saxlanılır və onu açanda geri gəlir. Onlar planın PDF çapına və DXF və DWG ixracına da daxil olur, hər biri `GIS-` və nömrəsi adlı qatda.

## Atributdan etiket

Qatın {{ui:More}} menyusunda (**GIS qatları**-dakı üç nöqtə) **Bununla etiketlə** altında sütun seçin: hər obyekt öz dəyərini planda qatın rəngində göstərir. Nöqtələr nöqtənin yanında, xətlər ən uzun hissəsinin ortasında (soldan sağa oxunacaq şəkildə çevrilib), poliqonlar mərkəzində etiketlənir. Rəqəmlər üç onluq rəqəmə qədər göstərilir. Etiketlər kağızda istənilən miqyasda 1.8 mm hündürlüyündədir və PDF çapına, DXF və DWG-yə daxil olur. Onları silmək üçün **No labels** (Etiket yoxdur) seçin; hər dəyişiklik bir addımdır ({{key:Mod+Z}} geri qaytarır). Qat ən çox 5,000 obyekti etiketləyir.

## Obyektə baxmaq

{{ui:Select}} aktiv olanda obyektə klikləyin. **Xüsusiyyətlər** onun qatını, hansı obyekt olduğunu, formasını (hissələr, deşiklər, təpə nöqtələri), hündürlüklərini, gəldiyi faylı və həmin faylın koordinat sistemini, sonra hər atributu cədvəldə göstərir. Atributlar yalnız oxunandır: CivilCraft GIS məlumatlarını gəldiyi kimi göstərir, redaktə etmir.

Göstərici altında həm nöqtə, həm xətt olduqda nöqtələr xətləri üstələyir; poliqonun içində ən kiçik poliqon seçilir.

## Səth üçün istifadə

Qatın menyusunu açın və {{ui:Use for the surface…}} seçin (və ya **Xüsusiyyətlər**-dəki düymə). Təklif olunanlar qatdan asılıdır:

| Qat | Nə ola bilər |
|---|---|
| Hündürlüklü xətlər (3D xətlər) | Öz hündürlüklərində qırılma xətləri |
| Hündürlüksüz, lakin rəqəm sütunu olan xətlər (horizontallar) | Seçdiyiniz sütundakı hündürlükdə qırılma xətləri |
| Poliqonlar | Səth sərhədi (seçilmiş poliqon, yoxsa ən böyük) və ya kənarları boyunca qırılma xətləri |
| Hündürlüklü nöqtələr və ya hündürlük sütunu olan nöqtələr | Planalma nöqtələri, qatın adı ilə təsvir olunur ki, nöqtə qrupu əmələ gəlsin |

Hər istifadə həndəsəni layihəyə köçürən bir geri qaytarma addımıdır; qatın özü dəyişmir. Hündürlüklər layihə vahidlərində götürülür.

## Enlik və uzunluqlu nöqtə faylları

Başlığında **latitude** və **longitude** sütunları olan nöqtə faylı (`lat`, `latitude`, `lon`, `long`, `longitude`) şimal və şərq koordinatları deyil, dərəcə kimi oxunur. İdxal dialoqu bunu bildirir. {{ui:Import}} zamanı nöqtələr layihənin koordinat sisteminə çevrilir; sistemi olmayan layihə əvvəl onu seçməyi tələb edir. Dərəcələr heç vaxt fut kimi yüklənmir. ±90° enlik və ya ±180° uzunluq xaricindəki sətirlər səbəbi ilə rədd edilir. Hündürlük sütunu olduğu kimi, layihə vahidlərində götürülür.

## LandXML faylları koordinat sistemi göstərdikdə

Açdığınız LandXML faylında `CoordinateSystem` elementi (EPSG kodu, WKT təsviri və ya sistemin adı) olduqda, CivilCraft onu layihənin koordinat sistemi kimi təklif edir. Qəbul etsəniz heç nə yerini dəyişmir; sistem yalnız rəqəmlərin nə demək olduğunu göstərir.

## Nə yoxlanıldı

- Hər oxuyucu GDAL ilə müqayisə edildi (əksər GIS proqramlarının bu faylları oxumaq üçün istifadə etdiyi kitabxana), GDAL-ın yazdığı fayllarda: hündürlüklü və hündürlüksüz hər növ shapefile, çoxhissəli xətlər, deşikli poliqonlar, boş həndəsələr, mətn, rəqəm, tarix və doğru/yanlış atributları, `.cpg`-li və `.cpg`-siz UTF-8 və Windows-1252 mətn, bir neçə shapefile-ın zipi, hər həndəsə növü olan GeoJSON və dörd cədvəli olan GeoPackage. Hər həndəsə, hündürlük və atribut uyğun gəldi.
- Enlik və uzunluqdan və UTM-dən çevrilmiş mövqelər PROJ (GDAL-ın arxasındakı proyeksiya kitabxanası) ilə 3 mm dəqiqliklə üst-üstə düşdü.
- Zədəli fayllar (kəsilmiş, ölçüləri yalan olan, pozulmuş zip, pozulmuş GeoPackage) bir sadə mesaj verir; heç nə asılmır.
- Burada heç nə hələ digər GIS proqramlarında açılmayıb; fayl geodatabase-ləri, KML və KMZ hələ oxunmur (bax: [Hələ hazır deyil](topic:not-built-yet)).
