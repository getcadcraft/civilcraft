---
title: Bitki siyahısı
summary: Təxminən 420 ümumi mülayim və Aralıq dənizi bitkisi, onların ölçüləri, dözümlülüyü, işıq və su tələbləri, istənilən dildə axtarıla bilən, habelə layihə ilə saxlanılan öz siyahınız.
keywords: bitki siyahısı, bitki bazası, növ, botaniki ad, adi ad, bitki palitrası, fidanlıq siyahısı, dözümlülük zonası, csv, bitkiləri idxal et, bitkiləri ixrac et, mənim bitkilərim, ağac siyahısı, kol siyahısı, bitki kitabxanası
from: 7ed09e7e
---

Sol panelin **Bitkilər** bölməsi yerləşdirə biləcəyiniz hər bitkini sadalayır. Birinə klikləyin, onun ölçülərini görmək və onu **Bitki**, **Yataq** və **Hasar** alətlərinin istifadə etdiyi bitki etmək üçün.

## Axtarış və süzgəc

**Axtarış** sahəsinə yazın: bitki adının istənilən dildə istənilən sözü (İngilis, İspan, Portuqal), botaniki adı, növü və ya qeydlərindəki söz. Yazdığınız hər söz uyğun gəlməlidir, belə ki `quercus evergreen` həmişəyaşıl palıdları tapır. Diakritik işarələrin fərqi yoxdur.

Siyahını **Növ**, **İşıq**, **Su** və **Dözümlülük zonası** ilə daraldın (sahənizin olduğu USDA zonası: bitki zona öz diapazonuna daxil olduqda siyahıda göstərilir).

## Bitkinin daşıdıqları

| Sahə | Mənası |
|---|---|
| Növ | Ağac, kol, hasar, ot (çəmənlər daxil), çoxillik, yerüstü örtük və ya dırmaşan |
| Yetkinlikdə | Bağda və ya küçədə böyüdülmüş bitkinin hündürlüyü və yayılması, metrlə |
| Əkin zamanı | Əkildiyi ölçü və onun qabı |
| Məsafə | Yataqda və ya hasar boyunca mərkəzdən mərkəzə |
| Dözümlülük zonası | Adətən dözdüyü USDA zonaları |
| İşıq, su, torpaq | Nə tələb etdiyi |
| Qeydlər | İstifadə və ehtiyatlar, məsələn zəhərli hissələr və ya yayılan bitki |

:::note
Daxili siyahı ümumi bağçılıq biliklərinə əsasən CadCraft üçün yazılıb: adi ölçülər, yuvarlaqlaşdırılmış. Heç bir fidanlığın kataloqu deyil. Ölçüləri və dözümlülüyü yerli fidanlıqla yoxlayın. İberiyanın və mülayim dünyanın çox hissəsinin ən məşhur invaziv bitkiləri qəsdən çıxarılıb, bəzi yerdə invaziv olan bir neçəsi isə qeyd daşıyır.
:::

## Öz bitkiləriniz

- **Bu layihənin siyahısına əlavə et** bitkini layihənin öz siyahısına kopyalayır, orada layihə ilə birlikdə saxlanılır. Siyahınızdakı bitki eyni açarlı daxili bitkini əvəz edir, belə ki ölçülərini öz regionunuz üçün dəyişə bilərsiniz.
- **Bitki siyahısını idxal et…** CSV (və ya bitki faylı) oxuyur. CSV-də botaniki ad sütunu və ideal olaraq növ, hündürlük və yayılma sütunları olmalıdır; sütun adları öz sözlərinizlə də işləyir (Latin, Adi ad, Hündürlük, Yayılma, En, Zona). Vergül, nöqtəli vergül və ya tabulyasiya, habelə onluq vergüllər oxunur. Boş əkin ölçüləri, məsafə və qablar növə görə ağlabatan standartlar alır.
- **CSV kimi ixrac et** siyahınızı (yoxdursa, axtarışın göstərdiyi bitkiləri) elektron cədvəldə açmaq üçün saxlayır.

Bitki siyahısı hər xarici fayl kimi oxunur: istifadə edilə bilməyən hər şey kənarlaşdırılır və sayılır.

## Digər proqramlarda bitkilər

Bitki siyahısı bütün CadCraft proqramları üçün bir kitabxanadır: BimCraft və ModelCraft eyni siyahıya malikdir, lakin onların öz **Kitabxanadan yerləşdir** funksiyası hələ bitkiləri təklif etmir. Hal-hazırda bitkilər CivilCraft-ın abadlaşdırma IFC-si vasitəsilə BIM modelinə çatır (hər bitki bir `IfcGeographicElement`). Bax: [Əkin](topic:planting#ifc).
