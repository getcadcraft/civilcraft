---
title: Layihənin koordinat sistemini təyin edin
summary: Geodeziyanın hansı koordinat sistemində olduğunu bildirin ki, CivilCraft enlik və uzunluğu göstərsin, GIS fayllarını və xəritə qatlarını yerləşdirsin və .prj faylları yazsın. Kodla, adla, koordinatların özü ilə və ya .prj faylından seçin.
keywords: koordinat sistemi, crs, epsg, srid, ştat müstəvisi, spcs, utm, nad83, wgs 84, proyeksiya, prj, wkt, datum, enlik, uzunluq, lat long, coğrafi, şəbəkə, georeferens, koordinat sistemini təyin et
from: 964250e2
---

Layihənin koordinatları siz onların nəyi bildirdiyini deyənə qədər sadəcə ədədlərdir. Koordinat sistemini təyin etmək **heç nəni köçürmür**: CivilCraft-a deyir ki, məsələn, E 6,150,000 N 2,080,000 US survey feet-də California zona 6 ştat müstəvi koordinatlarıdır. Bunu bildikdən sonra:

- status paneli göstəricinin enliyini və uzunluğunu göstərir,
- başqa sistemlərdəki GIS faylları (shapefile, GeoJSON, GeoPackage, yüksəklik şəbəkələri, LiDAR) açılan kimi layihəyə çevrilir,
- xəritə qatları planın altında çəkilə bilir ([Xəritə qatlarını planın altında göstərin](topic:map-layers)),
- GIS formatlarına ixrac sistemi daşıyır (shapefile üçün `.prj`, GeoPackage və GeoTIFF üçün EPSG kodu).

## Sistemi seçin

1. Alətlər panelinin **GIS** qrupunda {{ui:Coordinates}} seçin. **Koordinat sistemi** dialoqu açılır. Yuxarıda layihənin hal-hazırda hansı sistemdə olduğu və ya **Yox — koordinatlar sadəcə ədədlərdir** yazılır.
2. Sistemi bu yollardan biri ilə tapın:
   - **Axtarış**: EPSG kodunu (`2277`, `EPSG:2277`) və ya adın sözlərini (`texas central`, `utm 14n`, `lambert-93`) yazın. Kodlar yazdığınızdan başlayaraq siyahılanır; sözlər isə adında bütün sözləri olan sistemləri siyahılayır.
   - {{ui:Systems these coordinates fit}} (layihənin nöqtələri və ya səthi olduqda): CivilCraft layihənin vahid ailəsinin hər sistemində layihənizin ortasını oxuyur və onun istifadə sahəsi ortanı əhatə edən sistemləri siyahılayır. Ştat müstəvi koordinatları adətən yalnız bir neçə zonaya uyğun gəlir: Texasda E 3,115,000 N 10,070,000 US survey feet olan layihə dörd Texas Central variantına (NAD83, NAD83(2011), HARN, NSRS2007) uyğun gəlir. Hər element layihənizin ortasının orada haradadır göstərir.
   - **Yaxınlıqda (en, uzunluq)** və {{ui:Suggest}}: sahənin yerini yazın, məsələn `30.27, -97.74` və ya `30°16′N 97°44′W`, və CivilCraft ortanı əhatə edən proyeksiyalı sistemləri siyahılayır, əvvəl milli və ştat şəbəkələri.
   - {{ui:Read a .prj file…}}: shapefile və ya çertyojla gələn `.prj` faylını açın. CivilCraft onu proyeksiya riyaziyyatına görə siyahıya uyğunlaşdırır (buna görə də datumu başqa cür adlandıran `.prj` düzgün sistemi də tapır) və onun hansı olduğunu bildirir; dəqiq uyğunluq olmadıqda faylın öz təsviri istifadə olunur. Həmçinin faylı dialoqa atıb buraxa və ya təkbaşına planda açıb buraxa bilərsiniz.
3. Siyahıdan sistemə klikləyin. **Seçilmiş** altında onun adı, EPSG kodu, vahidi, datumunun WGS 84-ə nə qədər yaxşı bağlandığı, enlik və uzunluqda istifadə sahəsi və layihənizin ortasının orada haradadır göstərilir.
4. **Şəbəkə** seçili qalsın (əksər layihələr üçün; digərləri üçün bax [Zəmin və lokal koordinatlar](topic:ground-and-local-coordinates)) və {{ui:Apply}} seçin.

Status paneli indi göstəricinin enliyini və uzunluğunu E və N-in yanında göstərir. Sistemi təyin etmək bir geri qaytarma addımıdır: {{key:Mod+Z}} onu geri alır.

:::note
Vahidlər uyğun olmalıdır: futla olan layihə US survey feet və ya beynəlxalq futda sistemləri qəbul edir, metrlə olan layihə metrlə sistemləri qəbul edir. CivilCraft rədd etməsini izah edir ("Layihə futdadır, lakin bu sistem metrdədir…"). Futla olan layihə US survey foot sistemi ilə işləyirsə, survey feet istifadə olunur: layihənin "ft"-si sistemin futu deməkdir. Coğrafi sistemlər (enlik və uzunluq, məsələn WGS 84 özü) layihənin sistemi ola bilməz: çertyojlara şərq və şimal koordinatları lazımdır.
:::

## Sistemi dəyişin və ya silin

{{ui:Coordinates}} seçimini yenidən açın, başqa sistem seçin və {{ui:Apply}} seçin. Layihədə nöqtələr və ya layihə varsa, CivilCraft soruşur: **Koordinatlar artıq … sistemindədirmi?**

- {{ui:Yes — nothing moves}}: ədədlər olduğu kimi qalır və yalnız onların mənası dəyişir. Köhnə sistem səhv seçilibsə bunu istifadə edin.
- {{ui:No — convert them}}: hər geodezik nöqtə, sınma xətti, sərhəd, trassa PI-si, platforma künci və qurğu köhnə sistemdən yeninə bir geri qaytarma addımında çevrilir. LandXML-dən üçbucaqlar kimi oxunan səth çevrilə bilməz; əvvəlcə onu nöqtələrdən yenidən qurun.

{{ui:Remove the system}} sistemi götürür (heç nə köçmür). Layihədə olan GIS qatları yerində qalır.

## Status panelində enlik və uzunluq

Layihənin sistemi olduqda status paneli göstəricinin WGS 84-də enliyini və uzunluğunu göstərir, məsələn `30°18′00.00″ N  97°42′00.00″ W`. Bunun əvəzinə onluq dərəcələri {{ui:Parametrlər}} altında, {{ui:CivilCraft}} bölməsində **Enlik və uzunluq** seçimindən seçə bilərsiniz ([CivilCraft parametrləri](topic:settings)). Zəmin və ya lokal koordinatlarda göstərici əvvəl o addımdan keçir, buna görə də göstəricinin altındakı nöqtə üçün düzgündür.

## Datum sürüşməsinin nə qədər yaxşı olduğu

Enlik, uzunluq, GeoJSON və xəritə qatları hamısı WGS 84-dədir. Hər sistemin WGS 84-ə bağlanması dialoqda göstərilir:

| Dialoqun dediyi | Bunun mənası |
|---|---|
| WGS 84 özü | Heç bir sürüşmə yoxdur. |
| NAD83 WGS 84 kimi qəbul olunur | İkisi Şimali Amerikanın əksər hissəsində bir-iki metr, ən çox bir neçə metr fərqlənir. Xəritə qatları və sahə kontekstinə yaxşıdır; geodezik nəzarət üçün deyil. |
| EPSG rəqəminə görə təxminən *n* m-ə qədər məlum | Nəşr olunmuş sürüşmə; xəritə qatları və GeoJSON təxminən bu qədər səhv ola bilər. |
| Bu datum üçün məlum deyil | Şəbəkə faylı olmadan nəşr olunmuş sürüşmə yoxdur: xəritə qatları və GeoJSON yüzlərlə metr səhv ola bilər. |
| Şəbəkə sürüşmə faylından … | Aşağıda göstərilən şəbəkə sürüşmə faylı istifadə olunur: şəbəkənin daxilində NAD83-dən təxminən 10 sm-də. |

Layihənizin öz koordinatları heç vaxt datum sürüşməsindən keçmir: yalnız enlik və uzunluğa çevrilən və ya ondan çevrilən şey keçir. Şaquli datumlar və geoid modelləri idarə olunmur (yüksəkliklər heç vaxt çevrilmir). Ən yaxşı sürüşmə şəbəkə faylı tələb edərsə, siyahıda daha kobud nəşr olunmuş sürüşmə göstərilir və dialoq onun dəqiqliyini göstərir (məsələn NAD27 sistemləri təxminən 20 m), siz şəbəkəni əlavə edənə qədər.

## Şəbəkə sürüşmə faylları

NAD27 sistemi üçün koordinat sistemi dialoqunda **Şəbəkə sürüşmə faylı** enlik və uzunluğu, GIS fayllarını və xəritə qatlarını təxminən 20 m əvəzinə NAD83-dən təxminən 10 sm daxilinə gətirir:

- Sistemin sahəsi üçün təklif olunan şəbəkəni **Yüklə** (birləşmiş ştatlar üçün NADCON5, Alyaska üçün NADCON, Kanada üçün NTv2) PROJ-un açıq şəbəkə serveri olan cdn.proj.org-dan. Göndərilən yalnız şəbəkə faylının adıdır.
- Ya da artıq sahib olduğunuz **Şəbəkə faylı əlavə et…**: NTv2 (`.gsb`) və ya PROJ GeoTIFF şəbəkəsi (`.tif`), 20 MB-a qədər.

Şəbəkə layihə faylında saxlanılır, buna görə də layihə ilə birlikdə gedir. Bölmə layihənin ortasının şəbəkənin daxilində olub-olmadığını göstərir: kənarda olduqda heç bir sürüşmə tətbiq olunmur, ona görə sahəni əhatə edən şəbəkədən istifadə edin. **Şəbəkədən istifadəni dayandır** kobud sürüşməyə qaytarır. Hər dəyişiklik bir addımdır: {{key:Mod+Z}} onu geri qaytarır.

Şəbəkə dəyişəndə layihədə olan GIS qatları yerində qalır; onları şəbəkədən keçirmək üçün yenidən idxal edin. Layihənin öz koordinatları heç vaxt köçmür.

## Nə yoxlanılıb

- Hər çevirmə PROJ ilə (pyproj 3.7.1, PROJ 9.5.1 ilə) müqayisə edildi — əksər GIS proqramlarının istifadə etdiyi koordinat kitabxanası — 330-dan çox sistemdə: US survey feet və futda ştat müstəvisi, UTM şimal və cənub, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator və veb Merkator bunlar arasındadır. Şərq və şimal koordinatları eyni datum sürüşməsi ilə 1 sm-ə qədər uyğundur (əksəriyyəti 1 mm-dən də az), proyeksiya riyaziyyatı isə PROJ-un öz təriflərilə 1 sm-ə qədər uyğundur.
- PROJ tərəfindən yazılmış iki ümumi formada (ESRI və OGC) `.prj` faylları 105 sistem üçün geri oxundu: 210-dan 208-i dəqiq EPSG koduna uyğun gəldi, qalan ikisi isə eyni ellipsoiddə eyni riyaziyyatlı sistemə. CivilCraft-ın yazdığı `.prj` faylları PROJ tərəfindən eyni sistem kimi oxunur. Polyar stereoqrafik sistemlər üçün (UPS, Alyaska polyar) ESRI `.prj` faylları oxuna bilmir; həmin sistemləri koda görə seçin.
- Status panelindəki enlik və uzunluq brauzerdə PROJ ilə 0.01″-ə qədər uyğun gəldi.
