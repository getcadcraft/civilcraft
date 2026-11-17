---
title: Plan altında xəritə qatlarının göstərilməsi
summary: Georeferenced şəkli, xəritə kafellərini, WMS və ya WMTS serverini və ya xəritə xidmətini sayt konteksti kimi plan altına qoyun; internet parametri, şəffaflıq, sıra və atribusiya ilə.
keywords: xəritə qatları, bazis xəritəsi, fon, aerofotoşəkil, ortofoto, təsvir, peyk, raster, dünya faylı, pgw, jgw, tfw, wld, geotiff, georeferenced şəkil, xyz, kafellər, slippy xəritə, wms, wmts, getcapabilities, xəritə xidməti, rest, mapserver, imageserver, usgs, national map, atribusiya, şəffaflıq
from: 32d7718e
---

Xəritə qatları dizaynınızın altında çəkilən şəkillərdir: dünya faylı olan aerofotoşəkil və ya internetdəki serverlərdən xəritələr. Onlar yalnız ekranda sayt konteksti kimidir: PDF çaplarında, DXF və ya DWG ixraclarında və ya 3D görünüşündə **yoxdur**.

{{ui:GIS}} qrupunda {{ui:Xəritə}} seçin. **Xəritə qatları** dialoqu layihənin qatlarını sadalayır və yenilərini əlavə edir. Xəritə qatları layihənin koordinat sistemini tələb edir ([Layihənin koordinat sistemini təyin edin](topic:coordinate-systems)), dünya faylının layihənin öz koordinatlarını istifadə etdiyi şəkil istisna olmaqla.

## İnternet parametri

CivilCraft siz icazə verənə qədər heç vaxt xəritə serverindən heç nə soruşmur: {{ui:Parametrlər}}, {{ui:CivilCraft}}, **Xəritə qatları internetdən**: **Söndürülüb** (başlanğıc) və ya **Yandırılıb**.

:::note
Yandırılanda CivilCraft əlavə etdiyiniz xəritə serverlərindən ekrandakı sahənin şəkillərini soruşur. Çertyojunuz bu kompüterdə qalır; server sahəni və internet ünvanınızı görür.
:::

Söndürülü olduqda internet qatları dialoqda siyahıda olur, lakin boz rəngdə, səbəbi ilə birlikdə; heç nə çəkilmir və soruşulmur. Xəritə serverlərini adlandıran layihəni açmaq da onlarla əlaqə yaratmır. Fayldan olan şəkil hər iki halda işləyir. Dialoqdakı {{ui:Parametrləri aç}} düyməsi sizi oraya aparır.

## Georeferenced şəkil (oflayn işləyir)

1. **Qat əlavə et** bölməsində **Georeferenced şəkil** saxlayın və faylları seçin: şəkil (PNG və ya JPEG) **birlikdə** onun dünya faylı ilə (PNG üçün `.pgw`, JPEG üçün `.jgw`, və ya `.wld`) və varsa, onun `.prj`-si. Onları plana birlikdə də ata bilərsiniz.
2. `.prj` olmadan CivilCraft dünya faylının hansı sistemi istifadə etdiyini soruşur: {{ui:Layihənin sistemi}} (ən çox yayılmış), {{ui:Sistem seçin…}} və ya sistemi olmayan layihədə **Layihə koordinatları**.
3. Şəkil plan altında görünür və {{ui:Sığdır}} onu daxil edir.

RGB GeoTIFF (GeoTIFF kimi saxlanılmış aerofotoşəkil) öz yerləşməsini və sistemini daşıyır: onu tək başına açın. Şəkil **layihə faylının içində** saxlanılır (25 MB-a qədər); daha böyük olan rədd edilir, ölçüsü ilə birlikdə, buna görə daha kiçik nüsxə saxlayın (az piksel və ya JPEG).

## Kafellər, WMS, WMTS və xəritə xidmətləri

Əvvəl **Xəritə qatları internetdən** parametrini yandırın. Sonra **Qat əlavə et** bölməsində:

| Haradan | Nə yapışdırılır | CivilCraft nə edir |
|---|---|---|
| Kafel URL | `{z}`, `{x}` və `{y}` (və ya `{-y}`), və server hərfi üçün `{s}` olan şablon, məsələn `https://tile.example.org/{z}/{x}/{y}.png`. Ad və atribusiyasını verin. | Ekrandakı sahə və miqyas üçün web Merkator kafelləri. |
| WMS server | Serverin ünvanı və ya onun GetCapabilities linki. **{{ui:Qatları al}}** seçin, sonra qat. | Ekrandakı sahənin bir şəkli, server təklif edəndə layihənin EPSG kodunda soruşulur, əks halda web Merkator və ya WGS 84-də. |
| WMTS server | Serverin ünvanı və ya onun `WMTSCapabilities.xml`. **{{ui:Qatları al}}** seçin, sonra qat və kafel matris dəsti. | Layihənin sistemi varsa, dəstdən həmin sistemdə kafellər, əks halda web Merkator. |
| ArcGIS xəritə xidməti (REST) | `/MapServer` və ya `/ImageServer` ilə bitən URL. **{{ui:Xidməti oxu}}** seçin. | Keşlənmiş web Merkator xidmətləri kafellərindən çəkilir; başqaları ekrandakı sahənin bir şəkli üçün soruşulur. |

Heç bir server əvvəlcədən təyin olunmur. Ictimai nümunələr, hamısı USGS National Map-dən (ictimai mülkiyyət):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Xəritə xidməti: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (həmçinin aerofotoşəkillər üçün `USGSImageryOnly`)

Bir çox şəhər və rayon GIS şöbələri öz WMS və ya xəritə xidmətlərini dərc edir; onların GIS səhifələri ünvanı verir. Giriş və ya açar tələb edən server işləmir: CivilCraft heç bir istifadəçi adı, parol və ya açar göndərmir.

## Qatlar necə çəkilir

- Layihənin sistemindən başqa sistemdə olan şəkillər ona çevrilir: şəkil parçalara bölünür, hər biri dəqiq çevrilmənin qoyduğu yerdən ekran pikselinin dörddə birindən az məsafədə olacaq şəkildə yerləşdirilir.
- Kafellər ekrandakı sahə və miqyas üçün seçilir: bir görünüşə heç vaxt 64-dən çox, eyni anda 6-dan çox. Sürüşdürdükdə və ya miqyası dəyişdikdə köhnə görünüş üçün sorğular ləğv olunur. Təxminən 200 kafel yaddaşda saxlanılır (diskdə heç nə saxlanılmır).
- WMS və ya xəritə xidməti şəkli hərəkət dayandıqdan sonra soruşulur; gələnə qədər sonuncu şəkil yerində qalır.
- Hər qatın atribusiyası ekranda planın aşağı sağ küncündə kiçik görünür.

## Qatları dəyişdirin, sıralayın və silin

Dialoqda hər qatın göstərmək və ya gizlətmək üçün qutusu, **Şəffaflıq** sürgüsü, qatı daha əvvəl (aşağı) və ya daha sonra (üstdə) çəkmək üçün oxlar, zoom düyməsi (şəkillər üçün) və silmə düyməsi var. Siyahıdakı birinci qat ən aşağıda çəkilir. Hər dəyişiklik bir geri alma addımıdır.

## Qat heç nə göstərmədikdə

Səbəb status sətrində bir dəfə görünür və dialoqda qatın adının altında qalır:

| Mesaj | Nə etmək |
|---|---|
| Söndürülüb: xəritə qatları internetdən Parametrlərdə söndürülüb. | **Xəritə qatları internetdən** parametrini yandırın. |
| Layihənin koordinat sistemi tələb olunur | Onu {{ui:Koordinatlar}} altında təyin edin. |
| Server bu səhifənin onun şəkillərindən istifadə etməsinə icazə vermədi (CORS), və ya ona çatmaq olmadı. | Server veb səhifələrin şəkillərindən istifadə etməsinə icazə vermir və ya işləmir. Dörd rədd edilmədən sonra CivilCraft soruşmağı dayandırır; yenidən cəhd etmək üçün qatı gizlədin və göstərin. |
| Server 404 … cavab verdi / Server text/xml göndərdi, şəkil deyil: … | URL, qat və ya üslub səhvdir, və ya serverin mesajı nə istədiyini deyir. |
| Bu qat layihənin sistemində, web Merkator və ya WGS 84-də təklif olunmur | Server CivilCraft-ın yerləşdirə biləcəyi yerdə çəkə bilmir. |

## Nə yoxlanılıb

- Kafel nömrələri standart web Merkator kafel sxeminə görə yoxlanıldı; WMS 1.1.1 və 1.3.0, WMTS və xəritə xidməti cavabları əl ilə yazılmış fayllardan və USGS National Map və terrestris OpenStreetMap serverlərindən saxlanılmış real cavablardan oxundu; WMS 1.3.0 sorğularında EPSG:4326 üçün enlik standartın dediyi kimi birinci gəlir.
- Çevrilmə PROJ rəqəmləri ilə hər piksel üzrə dəqiq çevrilmə ilə müqayisə edildi: kafellər, WMS şəkilləri və bir rayon ölçüsündə şəkil üçün 0.13 pikseldən az, sayt miqyasında və uzaqlaşdırıldıqda.
- Dünya faylı olan şəkil və GDAL-ın (rasterio vasitəsilə) yazdığı RGB GeoTIFF brauzerdə yerləşdirildiyi yerdə çəkildi, piksel-piksel yoxlanıldı.
- Brauzerdə, test kompüterindəki əvəzedici server ilə: kafellər PROJ-un hər nöqtəni qoyduğu kafelə düşür, WMS şəkli 2 pikseldən az fərqlə düşür, eyni anda ən çox 6 sorğu işləyir, parametr söndürülü olduqda səhifədən heç bir sorğu çıxmır. Yuxarıda göstərilən USGS National Map xidməti də bir dəfə brauzerdə canlı oxundu və çəkildi (kafelləri gəldi və çəkildi, üzərindəki müəllif hüququ mətni ilə); digər ictimai serverlər yalnız saxlanılmış cavablardan oxundu.
