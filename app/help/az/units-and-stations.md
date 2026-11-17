---
title: Vahidlər, stansiyalar və ədəd formatları
summary: Fut və metr layihələri, stansiyaların, meyllərin, yan yamacların, istiqamətlərin, sahələrin, həcmlərin və boru ölçülərinin necə yazıldığı və yazıldığı, vahidləri dəyişmənin nə etdiyi.
keywords: uzunluq yazmaq, hesab, kalkulyator, cəm, kəsr, fut və düym, 4+7/16, vahidlər, fut, ABŞ planalma futu, metrlər, metr, metrik, imperial, stansiya formatı, stansionlama, meyl, faiz, yan yamac, h:v, istiqamət, kub yard, diametr
from: 0b9b5b6b
---

## Layihə vahidləri

Layihə **ABŞ futu** və ya **metr** ilə olur (sol paneldə **Vahidlər**). Layihədəki hər koordinat, hündürlük, uzunluq və stansiya həmin vahiddədir.

:::warning
**Vahidlər** dəyişmək yazıları, stansiya formatını, defoltları və faylların necə yazılmasını dəyişir. Heç bir ədədi **çevirmir**. Futla planlaşdırılmış və metrə keçirilmiş sahə eyni rəqəmləri saxlayır, indi isə metr kimi oxunur. Status paneli deyir: "Vahidlər indi metrdir. Koordinatlar çevrilməyib." Dizayn etməzdən əvvəl vahidləri məlumatlarınıza uyğun təyin edin.
:::

Vahidlərdən asılı olanlar:

| | ABŞ futu | Metr |
|---|---|---|
| Stansiya formatı | `12+34.56` (100 ft stansiyalar) | `1+234.567` (1000 m stansiyalar) |
| Təklif olunan horizontal intervalları | 0.25-dən 20 ft-ə | 0.1-dən 10 m-ə |
| Sahə | sq ft | sq m |
| Həcm | cu yd | cu m |
| Boru və quruluş diametri | düym | millimetr |
| Defolt əyri radiusu | 100 ft | 30 m |
| Planda stansiya işarələri | hər 50 ft, yazılar hər 100 ft | hər 20 m, yazılar hər 100 m |
| Çap miqyasları | 1" = 5' ilə 1" = 1000' | 1:50 ilə 1:10000 |
| LandXML xətti vahidi | USSurveyFoot | meter |

Yeni layihə futla başlayır, və ya {{ui:Parametrlər}} › {{ui:Ümumi}} › {{ui:Vahidlər}} bölməsində metrik uzunluq vahidi seçilibsə, metrlə başlayır. **Vahidlər** siyahısı orada açıq olan vahidləri göstərir və həmişə layihənin öz vahidini. Orada ulduzlanmış sahə və ya həcm vahidi (akr, hektar, akr-fut …) varsa, sahələr və həcmlər yuxarıdakı sütun əvəzinə onda hesabat verilir. Bax: [Vahidlər, yazılmış dəyərlər və vahid siyahıları](common:unit-lists).

LandXML açanda layihə faylın vahidlərini götürür. Beynəlxalq futda olan fayl fut layihəsi kimi açılır; ədədlər dəyişmir.

## Uzunluqları və cəmləri yazmaq

Uzunluq və ya hündürlük qəbul edən hər qutu adi ədəddən çox oxuyur: {{key:Enter}} basın və qutu nəticəni layihənin vahidlərində göstərir.

| Yazırsınız | Fut layihəsində | Metr layihəsində |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | eyni uzunluqlar metrlə |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | futla | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, qalanları ABŞ planalma futu ilə | eyni uzunluqlar metrlə |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | cəm, futla | cəm, metrlə |

Ümumi vahid cədvəlindən hər uzunluq işarəsi dəqiq ölçüsü ilə işləyir: layihənin futları ABŞ planalma futudur, ona görə `10 US ft` 10-dur və `3 ch` (beynəlxalq fut zənciri) 197.9996-dır. `+ - * /` və mötərizələrdən, həmçinin `abs`, `round`, `ceil` və `floor`-dan istifadə edin. Uzunluğa yazılan tire onun bir hissəsidir (`24'-6"`, `6-1/2`); boşluqla tire ayrılanda çıxma edir (`24' - 6"` = 23.5 ft). Adi ədəd uzunluğu vurur və ya bölür, uzunluğa əlavə olunanda isə layihənin vahidlərində uzunluq olur. CivilCraft yazdığınızı oxuya bilmirsə, qutu işarələnir və status paneli yerini deyir.

Stansiyalar cəm deyil: stansiya qutusunda `10+00` stansiya 10+00-dır. Faizlə meyllər, nöqtə nömrələri və təsvirlər olduğu kimi oxunur.

## Stansiyalar

Stansiya trassa boyunca məsafədir, artı işarəsi ilə yazılır:

- Fut: artıdan əvvəlki hissə yüz futlardır. `12+34.56` 1,234.56 ft-dir.
- Metr: artıdan əvvəlki hissə min metrlərdir. `1+234.567` 1,234.567 m-dir.
- Mənfi stansiyalar işarəni önündə saxlayır: `-0+50.00`.

Stansiyanı harada yazsanız (**Başlanğıc stansiyası**, PVI-nin **Stansiya** sahəsi), onu artı ilə (`12+34.56`) və ya adi ədəd kimi (`1234.56`) yaza bilərsiniz. Boşluqlar nəzərə alınmır.

## Meyllər və yamaclar

- **Meyllər** (profillər, borular, zolaq və kənar yamacları) faizlədir: `+1.25%` stansiya artımına doğru qalxır, `-0.50%` enir.
- **Yan yamaclar** (platforma kəsimi və doldurması, dəhliz kəsimi və doldurması) üfüqidən şaquliyə nisbətdədir: `3` 3 : 1 deməkdir, bir qalxma və ya enmə üçün üç üfüqi.
- Şaquli əyri üçün **K** onun uzunluğunun faiz ilə meyl dəyişikliyinə bölünməsidir.

## İstiqamətlər və bucaqlar

İstiqamətlər dərəcə, dəqiqə və saniyə ilə kvadrant istiqamətləridir: `N 63°12'05" E`. Əyri sapmaları (Δ) eyni dərəcə, dəqiqə və saniyəni istifadə edir, "sol" və ya "sağ" ilə.

## Ofsetlər

Trassadan ofsetlər ona perpendikulyar məsafələrdir, stansiya artımına baxarkən **L** (sol) və ya **R** (sağ) ilə işarələnir.

## Ədədlərin göstərilməsi

- Koordinatlar və hündürlüklər panellərdə və status panelində 2 onluq rəqəm göstərir (seçilmiş planalma nöqtəsi üçün 3).
- Sahələr və həcmlər minliklərlə qruplaşdırılır: `128,250 sq ft`, `454.9 cu yd`.
- Koordinatlar heç vaxt qruplaşdırılmır ki, olduğu kimi kopyalana bilsin.

## Koordinatlar

CivilCraft düz müstəvidə işləyir: şərq sağa, şimal yuxarıya. Dizayn işi həmişə proyeksiya olunmuş koordinatlarda görülür (dövlət müstəvisi, UTM və ya yerli şəbəkə). CivilCraft-a koordinat sisteminin hansı olduğunu və onların şəbəkə, təbii zəmin və ya yerli koordinat olub-olmadığını deyə bilərsiniz; sonra enlik və uzunluğu göstərir və GIS fayllarını və xəritə qatlarını yerləşdirir, amma heç vaxt vahidləri dəyişmir və koordinatlarınızı özü köçürmür. Bax: [Layihənin koordinat sistemini təyin edin](topic:coordinate-systems) və [Təbii və yerli koordinatlar](topic:ground-and-local-coordinates). Böyük dövlət müstəvisi dəyərləri (milyonlarla fut) normaldır; CivilCraft dəqiqliyi saxlamaq üçün daxili olaraq sahəyə nisbətən işləyir.
