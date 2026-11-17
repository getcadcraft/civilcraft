---
title: Sahədə günəş saatlarını hesablayın
summary: Gün (və ya mövsüm) və saat qurşağı seçin, hər kütlənin hər divarında və onların ətrafındakı torpaqda birbaşa günəş saatlarını görün; torpaq planda çəkilir, rəqəmlər CSV kimi.
keywords: günəş, günəş saatları, kölgə, günəş əlçatanlığı, gündüz saatları, fasad, divar, mövsüm, gündönümü, bərabərgecəlik, saat qurşağı, yay saat rejimi, enlik, uzunluq, CSV, rastr
from: 4e32a314
---

**Günəş saatları** seçdiyiniz gündə, ya da mövsüm üzrə orta hesabla, hər bina kütləsinin hər divarına və onların ətrafındakı torpağa çatan birbaşa günəş saatlarını sayır. Kütlələr və torpağın özü kölgə salır; başqa heç nə salmır (ağaclar, çəkmədiyiniz qonşular yoxdur). Birbaşa günəş olmayan səma işığı sayılmır.

## Başlamazdan əvvəl

Günəşin yeri sahənin enliyindən və uzunluğundan gəlir, onlar isə layihənin **koordinat sistemindən** götürülür. Heç biri olmayan layihə mesajla rədd edilir: əvvəlcə təyin edin (GIS qrupunda **Koordinatlar**). Əllə yazılmış enlik və uzunluq təxmin olardı, buna görə onlar üçün qutu yoxdur.

## Hesablayın

**Xüsusiyyətlər** bölməsində, **Bina kütlələri** altında, **Günəş saatları**:

1. **Gün**ü seçin. Başlanğıcda sizin yerinizdə günəşin ən aşağı olduğu gündür (21 dekabr, ya da cənub yarımkürəsində 21 iyun). Mövsüm üçün **Mövsüm üzrə** qutusunu işarələyin, **Son gün**ü və nümunə götürmək üçün neçə gün aralı olduğunu seçin.
2. **Saat qurşağı**nı yazın: `America/Mexico_City` kimi ad, ya da UTC-dən fərq kimi `-6`. Ad həmin gün üçün həmin qurşağın yay saat qaydalarına uyğun gedir; yazdığınız fərq olduğu kimi istifadə olunur, buna görə həmin gündə qüvvədə olanı yazın. Qutunun altındakı sətir hansı fərqi tapdığını göstərir.
3. Günəşin neçə dəqiqədən bir yerləşdirilməsini seçin (hər 5, 10, 15 və ya 30 dəqiqə), sonra **Günəş saatlarını hesablayın** basın. Mövsüm arxa planda işləyən proseslərdə işləyir; **Dayandır** onu ləğv edir.

## Nə alırsınız

- Kütlə üzrə cədvəl: **ən pis divar**, **orta** və **ən yaxşı divar**, gündə saatla; və hər divarın üzünün istiqaməti və mərtəbə-mərtəbə saatları ilə cədvəl.
- Kütlələrin ətrafındakı torpaq, planda tünddən (günəş yoxdur) sarıya qədər (hər xanada ən çox olan) rənglə çəkilir, açarı ilə. Kütlənin altındakı xanalar boş buraxılır. **Torpağı planda göstər** onu söndürür.
- **Divarlar CSV kimi** və **Torpaq CSV kimi** rəqəmləri saxlayır.

Mövsüm üçün rəqəmlər nümunə götürülmüş günlər üzrə gündəlik orta göstəricidir. Layihədə heç nə saxlanmır: nəticə baxmaq üçündür, yenidən işə salsanız yenidən yaranır.

## Bilmək yaxşıdır

- Divar bir anı günəşli sayır yalnız o, günəşə baxdıqda və yolunda heç nə olmadıqda. Günəşə arxa çevrilmiş divar heç nə almır.
- Torpaq sahənin ölçüsündən asılı şəbəkədə nümunə götürülür və günəşin yeri hər addımın ortasında götürülür, buna görə saatlar seçdiyiniz addım dəqiqliyinə qədər düzgündür.
- Günəşin yeri dərc olunmuş astronomik düsturdur, təxminən bir qövs dəqiqəsinə qədər dəqiqdir.
