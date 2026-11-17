---
title: "İqlim perspektivi: 2050 və 2080-ci illərdə daşqın, istilik və meşə yanğını"
summary: Ünvandan sahəyə alətində gələcək iqlim üçün sahənin daşqın səviyyəsini qaldırın, meşə yanğını təhlükəsini qiymətləndirin və hava faylını dəyişdirin; indiki və gələcəyi yanaşı göstərmək üçün iqlim məlumat paketindən istifadə edin (SSP2-4.5 və SSP5-8.5, 2050 və 2080).
keywords: iqlim, iqlim dəyişikliyi, gələcək, 2050, 2080, ssp, cmip6, ssenari, dəniz səviyyəsi, daşqın, əsas daşqın yüksəkliyi, bfe, fema, istilik, hava faylı, epw, morf, meşə yanğını, bushfire
from: b0d2ee38
---

İqlim rəqəmləri tətbiqdən deyil, **məlumat paketindən** gəlir. Parametrlər › Əlavələr-də {{ui:İqlim perspektivləri}} əlavəsini açın və ya {{ui:İqlim perspektivi}} blokunda öz paket faylınızı yükləyin.

:::warning
Əlavə ilə gələn paket **nümunədir**: üç yer (Denver, Miami, Johannesburg), bir iqlim modeli, hər 20 illik dövrdə beş il. O, alətləri sınamaq üçündür, **layihə üçün deyil**. Tam paket NASA-nın NEX-GDDP-CMIP6 məlumatlarından `tools/climate/build-pack.mjs` ilə qurulur.
:::

## Harada yerləşir

Səth › Digər › Ünvandan sahəyə. Nöqtəni təyin edin, qatları əlavə edin (FEMA daşqın qatı əsas daşqın yüksəkliyini verir) və sahəni oxuyan düyməyə basın. Sahənin sətirlərinin altında {{ui:İqlim perspektivi}} bloku var: **Ssenari** (SSP2-4.5 və ya SSP5-8.5) və **İl** seçin (2050 = 2041-2060, 2080 = 2071-2090, hər ikisi 1995-2014-ə qarşı). Nöqtəyə ən yaxın paket yeri istifadə olunur, və ya seçdiyiniz yer; hər yerdən uzaq olduqda qlobal orta dəyişikliklər istifadə olunur və panel bunu deyir.

## Layihə daşqın səviyyəsi

İndiki səviyyə, daşqın qatında varsa FEMA-nın əsas daşqın yüksəkliyidir (fut, NAVD 88), əks halda öz dəyərinizi yazın. Daşqın növünü seçin (sahil, çay və ya şiddətli yağış, və ya hər ikisi), yağış hissəsi üçün sahədə daşqın dərinliyini və istəsəniz bufer. {{ui:Daşqın səviyyəsini qaldır}} indiki və gələcək səviyyəni yanaşı, dəniz səviyyəsi və yağış hissələrini və fərziyyələri göstərir: bütün dəniz səviyyəsi qalxması sahil səviyyəsinə əlavə olunur; çay axını ən yağışlı gündəki yağışla bir-birinə artır və dərinlik axını 0.6 qüvvətinə görə izləyir (Manning, geniş kanal); hissələr toplanır.

:::warning
Bu dəyişikliyin qiymətləndirilməsidir, daşqın tədqiqatı deyil. Layihə daşqın səviyyəsi səlahiyyətlinin və ya mühəndisinizin qərarıdır.
:::

## Meşə yanğını təhlükəsi (yalnız qiymətləndirmə)

Ən yaxın bitki örtüyü, ondan yuxarı yamac və məsafə indiki və gələcək üçün çox aşağıdan ekstremal dərəcəyə qədər bir zona verir (gələcək paketin yanğın-hava indeksinin dəyişikliyi ilə vurulur). **Yalnız qiymətləndirmə:** bu bizim öz nisbi şkalamızdır, sahənin düzgün meşə yanğını qiymətləndirməsinə ehtiyacı olub-olmadığını bilmək üçün; kod reytinqi deyil.

## İstilik: gələcək hava faylı

Bu günə aid `.epw` faylını seçin və {{ui:Gələcək hava faylını yarat}} klikləyin: o, dərc olunmuş sürüşmə və uzanma metodu ilə (Belcher, Hacker və Powell 2005) dəyişdirilir və istilik müqayisə olunur (orta və ən isti temperatur, layihə temperaturları, 30 °C və 35 °C-dən yuxarı saatlar, dərəcə-günlər). {{ui:Gələcək hava faylını saxla}} onu Ətraf mühit paneli, BimCraft-ın enerji yoxlanışı və ya öz alətləriniz üçün saxlayır.

## Rəqəmlər haradan gəlir

NASA NEX-GDDP-CMIP6 (CMIP6 model çıxışının miqyasının kiçildilmiş forması, hər model üçün CC BY 4.0) temperatur, rütubət, günəş, yağış və yanğın-hava üçün; dəniz səviyyəsinin qalxması üçün, paket yerli rəqəmlər daşımırsa, IPCC AR6 qlobal orta. Panel paketin mənbəsini, lisenziyasını və tarixini göstərir.
