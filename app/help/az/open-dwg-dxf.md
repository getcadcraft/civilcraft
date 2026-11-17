---
title: DWG və ya DXF-i xətt kimi açın
summary: Çertyojun xəttlərini planda qat-qat açın, onun konturlarını, 3D polixətlərini və qapalı konturlarını səth üçün istifadə edin və nöqtə bloklarını planalma nöqtələrinə çevirin.
keywords: planalma yoxlaması, mətn kotaları, dwg, dxf, cad, çertyoj, xətt, konturlar, qırılma xətləri, sərhəd, polixətt, 3D polixətt, qatlar, baza xəritəsi, topo, planalma çertyoju, bloklar, blok istinadları, bloklardan planalma nöqtələri, atributlar, nöqtə blokları, daxiletmə nöqtəsi
from: da0f4c58
---

Topoqrafik planalma tez-tez çertyoj kimi gəlir: konturlar öz kotasında polixətt kimi, qırılma xətləri 3D polixətt kimi, sahə sərhədi isə qapalı polixətt kimi. CivilCraft çertyojun **model məkanını** planda qatlar kimi açır və bu xətləri birbaşa səthə çevirə bilər.

## Çertyojun açılması

1. **Səth** qrupunda {{ui:Xətlər}} klikləyin ({{ui:Aç}} və ya faylı planın üzərinə buraxın) və `.dwg` ya da `.dxf` faylı seçin. Çertyoj bu kompüterdə oxunur; heç nə yüklənmir. 2000-dən 2018-ə qədər DWG və ASCII DXF oxunur.
2. **Xətlər** dialoqu çertyojun xətt, qapalı forma və ya nöqtə saxlayan qatlarını və onların **kotaları** olub-olmadığını göstərir. Çertyojda söndürülmüş qatlar işarəsiz başlayır. Mətn, ştrixlamalar, ölçülər və digər xətt olmayan obyektlər sayılır və buraxılır (dialoq hansı olduğunu deyir).
3. **Çertyoj vahidləri** qutusunu yoxlayın. Çertyoj vahidlərini bildirdikdə CivilCraft onları layihənin vahidlərinə çevirir (millimetrdən metrə, metrdən futa, düymdən futa). Futla olan çertyoj miqyaslanmadan ABŞ sorğu futu kimi oxunur: ikisi milyonda 2 hissə fərqlənir və dövlət müstəvi koordinatlarının miqyaslanması onları futlarla yerindən çıxarardı. Çertyoj vahidlərini bildirmədikdə onun rəqəmləri layihənin vahidləri ilə oxunur; fərqlidirsə, siyahıdan düzgün vahidləri seçin.
4. **Səth üçün istifadə** bölməsində hər qatın səthə nə verdiyini seçin (ya da **Yalnız göstər** saxlayın). Konturlara bənzər adlı (TOPO, CONT, CNTR) və kotaları olan qatlar qırılma xətləri kimi başlayır.
5. {{ui:Əlavə et}} basın. Qatlar sol paneldə **GIS qatları** altında görünür; hər istifadə səthə daxil edilir. Hər hissə öz addımıdır: {{key:Mod+Z}} onları birər-birər geri alır.

## Qatın nə verə biləcəyi

| Qatda olanlar | Səth üçün istifadə |
|---|---|
| Konturlar (kotada polixətlər) | Xətlərin öz kotasında qırılma xətləri, ya da ELEV sahəsində |
| 3D polixətlər | Öz kotalarında qırılma xətləri |
| Qapalı kontur | Səth sərhədi (ən böyük qapalı forma, ya da seçdiyiniz) |
| Kotası olan nöqtələr | Planalma nöqtələri, qat adı ilə təsvir olunur |
| Kotası 0 olan xətlər (plan xətti) | Heç nə: plan üzərində baza çertyoj kimi qalır |

CivilCraft-ın yazdığı çertyojda xarakterik xətlər qövsləri yadda saxlayan 3D polixətlər kimi saxlanılır. Dialoqda **Xarakterik xətlər** görünür: onu işarəli saxlasanız, qövsləri və istifadələri ilə xarakterik xətlər kimi geri gəlir (bir geri alma addımı); işarəni çıxarsanız, digər qat kimi xətt kimi oxunur.

Sonra yalnız göstərdiyiniz qat üçün eyni işi görmək üçün **GIS qatları** altında qatın menyusunda {{ui:Səth üçün istifadə}} istifadə edin.

## Bloklardan planalma nöqtələri

Planalma çertyojları tez-tez nöqtələri blok kimi daşıyır: hər çəkilişdə kiçik simvol, nöqtə nömrəsi, təsvir və kota üçün atributlarla. Çertyojda blok istinadları olduqda dialoqda **Bloklardan planalma nöqtələri** bölməsi görünür:

1. Götürüləcək blokları işarələyin (cədvəl hər birində neçə istinad olduğunu, hansı qatlarda və hansı atributları olduğunu göstərir) və ya onların üzərindəki bütün blok istinadlarını almaq üçün qatları işarələyin.
2. Hər nöqtənin **nömrəsi**, **təsviri** və **kotası** haradan gələcəyini seçin: atributdan, blokun və ya qatın adından, növbəti boş nömrələrdən və ya daxiletmə nöqtəsinin Z-dən. CivilCraft ehtimal olunan atributlardan (PT, DESC, ELEV və oxşarları) başlayır və kotanı atributdan yalnız bloklar sıfırda olduqda götürür.
3. Yalnız nöqtələr lazımdırsa xətt qatlarının işarəsini çıxarın, sonra {{ui:Əlavə et}} basın.

Hər istinad daxiletmə nöqtəsində bir planalma nöqtəsinə çevrilir. Yalnız model məkanına yerləşdirilmiş istinadlar sayılır; başqa blokların içindəki bloklar yox. Layihədə artıq olan nömrələr və ya çertyojda iki dəfə istifadə olunan nömrələr ən böyüyündən sonra yeni nömrələr alır; rəqəm olmayan kota atributu həmin nöqtəni kotasız buraxır; status sətri hər ikisini sayır. Çertyoj heç vaxt dəyişdirilmir və hər nöqtə öz blokunu yadda saxlayır: onun Xassələrində blok, qat və tutacaq (handle) ilə **Bloka görə** göstərilir. Nöqtələri əlavə etmək bir addımdır, buna görə {{key:Mod+Z}} hamısını geri alır.

## Mətn kimi yazılmış kotalar və yoxlama

Mətn kimi yazılmış nöqtə kotaları (ya da blok atributunda, planalma nöqtə bloku olmayan) xətt deyil. **Planalma kotaları və yoxlama** bölməsi onları planalma nöqtələri kimi götürə bilər və çertyojda səhv olanları sadalayır: vahidlər, koordinat sistemi, sıfırdan məsafə, düz konturlar, qəribə kotalar, ikiqat nöqtələr. Bax [İdxal zamanı planalma çertyojunun yoxlanması](topic:survey-check).

## Çertyojun oxunuşu

- Qövslər, dairələr, ellipslər, əyilmiş polixətt seqmentləri və splaynlar ən çox hər 5°-də qısa düz hissələrə çevrilir.
- Blok istinadları yerləşdirildikləri yerdə çəkilir, iç-içə bloklar da; blokun 0 qatındakı şey istinadın qatını alır.
- Başqa müstəvidə çəkilmiş obyektlər (fərqli ekstruziya istiqaməti) dünya koordinatlarında yerləşdirilir.
- Hər obyekt üç sahə alır: LAYER, TYPE (obyekt növü) və ELEV (bütün nöqtələri bir kotada olduqda onun kotası).
- Koordinatlar olduğu kimi götürülür: çertyoj layihənin eyni koordinatlarını istifadə etməlidir (məsələn, eyni dövlət müstəvi zonası). Əlaqəli çertyojlar (xref) açılmır: onları ayrıca açın.

:::tip
Kontur çertyoju bir neçə nöqtə kotası ilə ən yaxşı səthi verir: təpələrdə və çökəklərdə, yalnız konturlar düz üçbucaqlar buraxdığı yerlərdə. Onları planalma nöqtəsi kimi əlavə edin, ya da çertyojdakı nöqtələr qatından.
:::
