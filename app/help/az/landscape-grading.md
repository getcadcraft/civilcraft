---
title: Abadlaşdırma üçün planlaşdırma
summary: Platformalar, torpaq sipərlər, drenaj çökəklikləri və sərbəst planlaşdırma, sürüklədiyiniz nöqtə hündürlükləri və horizontallar ilə, canlı kəsim və doldurma, meyl analizi, axın oxları və su yığılması — hamısı CivilCraft-ın layihəli səthində.
keywords: dayaq divarı, dayaq divarları, şaquli tərəf, divar meyl əvəzinə, tərəf üzrə yamac, yan yamac, dik yamac, planlaşdırma, abadlaşdırma planlaşdırması, platforma, teras, torpaq sipər, təpə, drenaj çökəkliyi, nöqtə hündürlüyü, nöqtə səviyyəsi, horizontallar, horizontalları redaktə et, kəsim və doldurma, torpaq işləri, meyl analizi, əlçatanlıq, dik meyllər, axın oxları, drenaj, su yığılması, gölməçələr
from: e1559eb9
---

Hər şey **layihəli səth**ə platformalar və yollar ilə eyni planlaşdırma ilə qurulur. **Mövcud yer** heç vaxt dəyişmir və Torpaq işləri onun hamısını hesablayır. Planlaşdırma menyusu Abadlaşdırma qrupundadır.

## Platformalar

{{ui:Grade}} › {{ui:Platform}}, sonra künclərə klik edin və {{key:Enter}} basın. Platforma altındakı orta yer hündürlüyündən başlayır; onu təyin etmək üçün **Hündürlük** yazın, və ya yenidən yerə uyğunlaşdırmaq üçün boş buraxın. **Meyl** faizlə və **Meyl istiqaməti** dərəcələrlə (0 = şərq, 90 = şimal) onu əyir. Onun tərəfləri **Kəsim yamacı** və **Doldurma yamacı** ilə (üfüqi 1-ə) yerə qədər planlaşdırılır.

## Tərəflər üzrə yamaclar və dayaq divarları

Pad, platforma və ya torpaq sipərin Xüsusiyyətlərində **Tərəflər və dayaq divarları** altında hər tərəf öz üsulu ilə planlaşdırıla bilər. 1-ci tərəf birinci klik etdiyiniz künddən ikinciyə, 2-ci tərəf ikincidən üçüncüyə və s. gedir.

- **Bütün tərəflər**: **Meyilli** yuxarıdakı kəsim və doldurma yamaclarını hər tərəfdə istifadə edir; **Şaquli: dayaq divarları** hər tərəfə divar qoyur.
- Hər tərəf üzrə: **Yuxarıdakı yamaclar**, **Öz yamacları** (həmin tərəf üçün kəsim və doldurma yamacı yazın) və ya **Şaquli (dayaq divarı)**.
- Yamacı `3` və ya `3:1` (üfüqi 1 şaquliyə), `33%` və ya `18.4°` kimi yazın; o, H:1 kimi göstərilir. Platformanın öz **Kəsim yamacı** və **Doldurma yamacı** eyni formatı qəbul edir.
- Şaquli tərəfdə yamac yoxdur: dayaq divarı kənar boyunca gedir, platformadan aşağı mövcud yerə (doldurmada) və ya yerdən aşağı platformaya (kəsimdə). **Divar qalınlığı** (başlanğıcda 0.3 m və ya 1 ft) yerin platforma kənarından mövcud yerə nə qədər pilləyə çıxmasıdır. Kəsim və doldurma həcmləri həmin tərəfin artıq olmayan yamacını çıxır.
- Divar yan yamacla qarşılaşdıqda, yamac divarın ucu ətrafında dolanır; iki divar bucaqla birləşir.
- Sahələrin altında: divarların uzunluğu, açıq üz (hündürlük × uzunluq), ən hündür və orta hündürlük.

Plan hər divarın xarici üzünü qısa işarələrlə və hündürlüyünü hər iki ucunda və ən hündürdə çəkir (dayaq divarları qatında, DXF və DWG-yə də gedir). 3D görünüş divarları bərk cisim kimi göstərir (Göstər › Dayaq divarları), və GLB, OBJ və USD ixracları onları daxil edir. Kənar boyunca kəsiklər pilləni göstərir.

**Xəbərdarlıqlar** (Xüsusiyyətlərdə və Problemlər panelində): **Divar hündürlüyü bunu aşanda xəbərdarlıq et** (başlanğıcda 1.0 m və ya 3.3 ft) divar "mühəndis divarı və ya icazə lazım ola bilər; yerli qaydaları yoxlayın" və **Torpağın dayandığı ən dik yamac** yazdıqda, kəsim və ya doldurma yamacı həmin qiymətdən dik olan hər tərəf. Bunlar xəbərdarlıqdır: planlaşdırma yenə qurulur. Hər dəyişiklik {{key:Mod+Z}} üçün bir addımdır.

## Torpaq sipərlər

{{ui:Grade}} › {{ui:Berm}}: yuxarısı altındakı orta yer üzərində **Hündürlük** olan təpə, yamacları yerə planlaşdırılmış.

## Drenaj çökəklikləri

{{ui:Grade}} › {{ui:Swale}}, sonra çökəklik boyunca **suyun axdığı istiqamətdə** klik edin və {{key:Enter}} basın. **Dərinlik**, **Dib eni** (V üçün 0) və **Yan meyl** təyin edin. **Meyl** olmadıqda dibi yerin izləyir, ondan dərinlik qədər aşağıda, və heç vaxt yuxarıya getmir; başlanğıcdan sabit meyl vermək üçün meyl yazın.

## Nöqtə hündürlükləri və horizontallar

1. {{ui:Grade}} › {{ui:Grading area}}: formalaşdırmaq istədiyiniz sahənin konturuna klik edin.
2. {{ui:Grade}} › {{ui:Spot elevation}}: sahənin daxilinə klik edin. Xüsusiyyətlər-də hündürlüyünü yazın, və ya ▲ ▼ düymələrindən istifadə edin.
3. {{ui:Grade}} › {{ui:Edit a contour}}: sahə daxilində horizontala klik edin ki, onu yenidən formalaşdırıla bilən xətt kimi götürün.

Nöqtə və ya horizontalı seçin və planda **sürükləyin** (və ya onun nöqtələrini): buraxdıqda səth izləyir, bir geri alma addımı. Sahə daxilində yer onun kənarından (mövcud yerə çatdığı yerdən), nöqtə hündürlüklərindən və redaktə olunmuş horizontallardan yenidən qurulur.

## Kəsim və doldurma, canlı

Hər planlaşdırma obyektinin Xüsusiyyətləri **Kəsim** və **Doldurma**nı və bütün sahənin ümumi rəqəmlərini Torpaq işlərinin istifadə etdiyi şəbəkə üsulu ilə göstərir, siz dəyişdikcə. Problemlər (səthdən kənar, özünü kəsən kontur) orada siyahılanır.

## Planlaşdırma yoxlamaları

**Planlaşdırma yoxlamaları** bölməsində soldakı:

- **Meyl analizi** səthi meyllə rəngləyir: yumşaq həddə qədər, aralıqda və dik həddən dik olan (başlanğıcda 5 % və 33.3 % — əlçatan marşrutlar üçün adi 1:20 və biçmək üçün 1:3). İzahat hər sahənin nə qədərinin hansı qrupa düşdüyünü göstərir. Dik sahələr vərəqlərdə də çap olunur.
- **Axın oxları və su yığılması** suyun hansı istiqamətdə axdığını çəkir və suyun yığıldığı hər yeri dərinliyi ilə göstərir; bölmə neçə yer, ən dərinini və onların nə qədər su saxladığını göstərir.

Yoxlamalar bir şey planlaşdırıldıqda layihəli səthi oxuyur, əks halda mövcud yeri.
