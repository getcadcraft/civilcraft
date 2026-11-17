---
title: Başlanğıc qiymətlər və yer tutucular
summary: CivilCraft-ın başladığı hər qiymət — yeni layihələr, göstərmə, trassalar, platformalar, korridorlar, boru şəbəkələri, həcmlər və çertyojlar üçün — və hansının yer tutucu olduğu və dəyişdirilməli olduğu.
keywords: standart qiymətlər, parametrlər, başlanğıc qiymətlər, yer tutucular, layihə meyarları, standartlar, qaydalar, fərziyyələr
from: fbfc7432
---

CivilCraft-ın parametrlər dialoqu və ya şablonu yoxdur. Bunlar şeylərin başladığı qiymətlərdir. **yer tutucu** kimi işarələnmiş qiymətlər heç bir standartdan alınmayıb: yoxlamaya və ya kəmiyyətə etibar etməzdən əvvəl onları öz layihə meyarlarınızla əvəz edin.

## Yeni layihə

| Parametr | Qiymət |
|---|---|
| Ad | Adsız sahə (ilk nöqtə faylının adı onu əvəz edir) |
| Vahidlər | US feet |
| Səthin adı | Mövcud zəmin |
| Nöqtə qrupları | Hər qrup {{ui:Points}} olaraq başlayır |
| Ən uzun xarici kənar | 0 (hər üçbucağı saxla) |
| Saxlanılan geri qaytarma addımları | 200 |

## Göstərmə

| Parametr | Qiymət |
|---|---|
| Səth | {{ui:Existing ground}} |
| Horizontal hər | 1 (ft və ya m) |
| Əsas horizontal hər | Hər 5-ci horizontal |
| Zolaqlar | 8 |
| Yandırılıb | Horizontallar, horizontal yazıları, nöqtələr, sınma xətləri, səthin kənarı, borular |
| Söndürülüb | Üçbucaqlar, hündürlük zolaqları, meyl oxları, nöqtə yazıları |

## Trassalar və profillər

| Parametr | Qiymət |
|---|---|
| Ad | Trassa 1, Trassa 2 … |
| Başlanğıc piketi | 0+00 |
| Hər daxili PI-də əyri radiusu | 100 ft və ya 30 m, hər tangensin yarısına sığmırsa daha kiçik |
| Layihə profili | Başlamadığınız kimi yoxdur; {{ui:Start from the ground}} hər ucda zəmində bir PVI qoyur |
| Şaquli əyrinin uzunluğu | 0 (əyri yoxdur) siz yazana qədər |

## Platformalar

| Parametr | Qiymət |
|---|---|
| Ad | Platforma 1, Platforma 2 … |
| Hündürlük | Platformanın ortasındakı zəmin, 0.1-ə yuvarlaqlaşdırılmış (orta səthdən kənardadırsa 0) |
| Kəsim meyli | 2 : 1 (yer tutucu) |
| Doldurma meyli | 3 : 1 (yer tutucu) |

## Korridor yığımı (yer tutucular)

| Parametr | US feet | Metrlə |
|---|---|---|
| Zolaq eni | 12 ft | 3.6 m |
| Zolaq meyli | 2% | 2% |
| Çiyin eni | 4 ft | 1.2 m |
| Çiyin meyli | 4% | 4% |
| Kəsim meyli | 2 : 1 | 2 : 1 |
| Doldurma meyli | 3 : 1 | 3 : 1 |
| Kəsik hər | 10 ft | 5 m |

## Boru şəbəkəsi

| Parametr | US feet | Metrlə |
|---|---|---|
| Ad və növ | Storm, storm | Storm, storm |
| Ən az meyl (yer tutucu) | 0.50% | 0.50% |
| Ən az örtük (yer tutucu) | 2 ft | 0.6 m |
| Quyularda enmə (yer tutucu) | 0.10 ft | 0.03 m |
| Yeni quyunun diametri | 48 in | 1200 mm |
| Yeni borunun diametri | 12 in | 300 mm |
| Çökəcək dərinliyi | 0 | 0 |
| Qapaq | Səthdən | Səthdən |

LandXML-dən açılan boru şəbəkəsi də bu qaydaları istifadə edir, çünki LandXML onları daşımır.

## Həcmlər

| Parametr | Qiymət |
|---|---|
| Üsul | Şəbəkə, günəş işığı xətləri daxilində hüceyrə mərkəzlərində nümunə götürülür |
| Hüceyrə ölçüsü | Hesablanmış sahənin düzbucaqlı çərçivəsi təxminən 250,000 hüceyrə saxlayacaq şəkildə seçilir (on qüvvətinin 1, 2 və ya 5 mislisi) |
| Şişmə və büzülmə | Yox |

## Çertyoj

| Parametr | Qiymət |
|---|---|
| Sahə | {{ui:Everything}} |
| Kağız | Tabloid 11 × 17 in (futla layihələr), ISO A3 (metrlə layihələr); həmişə üfüqi |
| Miqyas | Sığan ən böyük siyahıda olan miqyas |
| Mürəkkəb | {{ui:Layer colors}} |

DXF yazıları hər şeyin Tabloid (fut) və ya A3 (metr) üzərinə sığdığı miqyas üçün ölçülənir.
