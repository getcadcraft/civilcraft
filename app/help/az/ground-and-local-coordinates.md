---
title: Zəmin və lokal koordinatlar
summary: Zəmin (səth) koordinatlarında işləyin, şəbəkədən miqyaslanmış birləşdirilmiş miqyas əmsalı ilə, yazdığınız və ya nöqtədə hesablanmış əmsalla, və ya iki nəzarət nöqtəsi ilə sistemə bağlanmış fərz olunan sayt şəbəkəsində.
keywords: zəmin koordinatları, səth koordinatları, şəbəkədən zəminə, birləşdirilmiş miqyas əmsalı, csf, birləşdirilmiş əmsal, şəbəkə əmsalı, hündürlük əmsalı, dəniz səviyyəsi əmsalı, yaxınlaşma, xəritə bucağı, miqyas əmsalı, fərz olunan koordinatlar, lokal koordinatlar, sayt şəbəkəsi, 5000 5000, nəzarət nöqtələri, lokallaşdırma, kalibrləmə, iki nöqtə, uyğunsuzluq
from: 3d7453de
---

Dövlət müstəvi və UTM koordinatları **şəbəkə** koordinatlarıdır: xəritə proyeksiyası məsafələri bir az uzadır və ya qısaldır (onlarla milyonda bir hissə), sayt nə qədər yüksəkdirsə, ölçülən zəmin məsafəsi şəbəkə məsafəsindən bir o qədər fərqlənir. Buna görə bir çox sorğu **zəmin** koordinatları verir, planda məsafələr zəmində ölçülən məsafələrə bərabər olsun deyə miqyaslanmış, və ya **fərz olunan** sayt şəbəkəsi (nəzarət nöqtəsində 5000, 5000). CivilCraft rəqəmlərinizi olduğu kimi saxlayır və onların şəbəkə ilə necə əlaqəli olduğunu qeyd edir, buna görə enlik və uzunluq, GIS faylları və xəritə qatları düzgün yerə düşür.

**GIS** qrupunda {{ui:Coordinates}} açın, sistemi seçin (və ya saxlayın), sonra **Şəbəkə, zəmin və ya lokal koordinatlar** altında seçin:

| Seçim | Koordinatlarınız | Şəbəkə ilə əlaqəsi |
|---|---|---|
| {{ui:Grid}} | Sistemin öz koordinatları (başlanğıc) | Eyni rəqəmlər |
| {{ui:Ground}} | Zəmin məsafələrinə miqyaslanmış | grid = base + combined factor × (ground − base) |
| {{ui:Local}} | Fərz olunan sayt şəbəkəsi | İki nəzarət nöqtəsi ilə şəbəkəyə köçürülmüş, fırladılmış və miqyaslanmış |

Seçdiyiniz hər şey layihə ilə saxlanılır və bir geri qaytarma addımıdır; heç nə yerini dəyişmir.

## Zəmin koordinatları

1. {{ui:Ground}} seçin.
2. Sorğudakı **Combined scale factor** (Birləşdirilmiş miqyas əmsalı) dəyərini yazın (məsələn `0.99987`), və ya hesablayın:
   1. **Compute the factor at a point** (Nöqtədə əmsalı hesablayın) altında nöqtə layihənin ortasından başlayır. {{ui:Pick a point on the plan}} seçin və yeri klikləyin (sorğu nöqtəsinin yaxınlığında klik həmin nöqtəni götürür), və ya E və N yazın.
   2. Hündürlük orada səthdən gəlir; lazım olsa başqa yazın.
   3. {{ui:Compute}} seçin. CivilCraft göstərir:
      - **Grid scale factor k** (Şəbəkə miqyas əmsalı k): xəritə proyeksiyasının orada məsafələri nə qədər uzatdığı.
      - **Elevation factor** (Hündürlük əmsalı): hündürlükdə olan məsafədən elipsoiddə məsafələrin nə qədər qısa olduğu.
      - **Combined factor** = k × elevation factor (Birləşdirilmiş əmsal): şəbəkə məsafəsi = zəmin məsafəsi × bu.
      - **Convergence** (Yaxınlaşma): orada şəbəkə şimalından həqiqi şimala bucaq (geodezik azimut = şəbəkə azimutu + yaxınlaşma).
   4. Ədədlərin altında {{ui:Use}} düyməsini seçin ki, birləşdirilmiş əmsal qutuya qoyulsun.
3. **Base point** (Baza nöqtəsi) təyin edin: zəmin və şəbəkə koordinatlarının eyni olduğu yer. Başlanğıcda 0, 0-dır: zəmin koordinatlarını dərc edən əksər yurisdiksiyalar başlanğıca görə miqyaslayır, buna görə zəmin koordinatları şəbəkə koordinatlarına tanış qalır. Bəzi sorğular layihənin nəzarət nöqtəsinə görə miqyaslayır: sorğunun dediyini istifadə edin.
4. {{ui:Apply}} seçin.

:::warning
Hündürlük elipsoiddən yuxarı hündürlük kimi götürülür. CivilCraft-da geoid modeli yoxdur, buna görə geoid elipsoiddən 30 m (100 ft) aşağı və ya yuxarı olan yerdə hündürlük əmsalı təxminən 5 ppm səhv olur. Sorğu birləşdirilmiş əmsalını bildirdikdə, məhz onu yazın.
:::

## Lokal (fərz olunan) koordinatlar

1. {{ui:Local}} seçin.
2. **Control point 1** (Nəzarət nöqtəsi 1) üçün sorğu nöqtəsinin nömrəsini yazın (və ya {{ui:Pick}} seçib planda klikləyin). Onun lokal koordinatları yanında göstərilir.
3. Onun **grid** E və N dəyərlərini yazın, və ya üçüncü qutuda enlik və uzunluğunu (məsələn `30.2672, -97.7431`).
4. **Control point 2** (Nəzarət nöqtəsi 2) üçün eyni edin, birincidən mümkün qədər uzaqda.
5. CivilCraft tapılmış **Scale** (Miqyas) və **Rotation** (Fırlanma) dəyərlərini göstərir və xatırladır: **Two points always fit exactly — check a third.** (İki nöqtə həmişə dəqiq uyğun gəlir — üçüncünü yoxlayın.)
6. **Check point** (Yoxlama nöqtəsi) eyni cür verin. CivilCraft uyğunluğun onu yazdığınız şəbəkə koordinatlarından nə qədər uzaqlaşdırdığını göstərir (onun uyğunsuzluğu, layihə vahidlərində və milyonda hissə ilə). Böyük uyğunsuzluq səhv nöqtə, yazı səhvi və ya başqa vahiddə koordinatlar deməkdir.
7. {{ui:Apply}} seçin.

0.5-dən 2-yə qədər olan hüdudlardan kənar miqyas rədd edilir: nöqtələri və onların vahidlərini yoxlayın.

## Nə yoxlanıldı

- Miqyas əmsalı və yaxınlaşma PROJ (PROJ 9.5.1 ilə pyproj 3.7.1) ilə uyğundur; bu, əksər GIS proqramlarının istifadə etdiyi koordinat kitabxanasıdır. Uyğunluq milyardda bir hissə dəqiqliklə, konform proyeksiyalı 300-dən çox sistemdə (dövlət müstəvi, UTM, köndələn Merkator, Lambert konform konik) və brauzerdə planda seçilmiş nöqtədə yoxlanıldı.
- Zəmin və lokal addımlar milyardda bir hissə ilə geri-irəli çevrilir; iki nəzarət nöqtəsi onları yaratdıqları miqyası və fırlanmanı qaytarır; 0.05 ft kənarda olan yoxlama nöqtəsi 0.05 ft uyğunsuzluq göstərir.
