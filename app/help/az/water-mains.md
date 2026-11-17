---
title: Su magistralları: təzyiqlər, axınlar və yanğın axını
summary: Planda qovşaqlar, su anbarları, çənlər, borular, nasoslar və təzyiq azaldan klapanlardan ibarət təzyiq şəbəkəsi çəkin; CivilCraft başlıqları, təzyiqləri və axınları hesablayır (Hazen–Williams, halqalı şəbəkələr), yanğın üçün mövcud axını və bir günlük tələbatı. Laboratoriya funksiyasıdır; hər nəticə mühəndisin yoxlamasını tələb edir.
keywords: su, su magistralı, su paylanması, təzyiq şəbəkəsi, təzyiq borusu, halqalı şəbəkə, hazen-williams, C əmsalı, başlıq itkisi, qalıq təzyiq, yanğın axını, hidrant, tələbat, qovşaq, su anbarı, çən, nasos, nasos əyrisi, təzyiqi azaldan klapan, prv, yoxlama klapanı, uzadılmış dövr, epanet, inp, sürət
from: df46bf6d
---

Su magistralları sahənin təzyiq tərəfidir: həmişə dolu olan borular, su anbarı, çən və ya nasos ilə itələnən. CivilCraft hər qovşaqda başlığı və təzyiqi, hər borudakı axını hesablayır, o cümlədən suyun birdən çox yolu olan halqalı şəbəkələr üçün. Yoxlanılana qədər laboratoriya funksiyasıdır.

**Yalnız hesablama köməkçisi.** Hər rəqəm ixtisaslı mühəndisin yoxlamasını tələb edir: cavab yalnız verdiyiniz tələbat, hündürlüklər, boru ölçüləri və pürüzlülük dəyərləri qədər yaxşıdır, və sabit rejim modeli su zərbəsi, suyun keyfiyyəti və yanğın nasosunun real davranışı haqqında heç nə bilmir.

## Şəbəkəni çəkin

1. **Səth** › {{ui:Daha çox}} altında {{ui:Su magistralları…}} seçin. Pəncərə planda işləyərkən açıq qalır.
2. {{ui:Su anbarı}} seçin və təchizatın olduğu yerdə planı basın. Onun başlığı təbii zəmindən 100 ft (30 m) yuxarıdan başlayır; Xüsusiyyətlərdə dəyişin.
3. {{ui:Qovşaq}} seçin və su çəkilən və ya boruların birləşdiyi hər yeri basın. Qovşaq hündürlüyünü təbii zəmindən alır; onu ləğv etmək üçün Xüsusiyyətlərdə başqa hündürlük yazın.
4. {{ui:Boru}} seçin, bir qovşağa, sonra onu birləşdirən qovşağa basın. Alət növbəti boru üçün aktiv qalır. {{ui:Nasos}} və {{ui:Təzyiqi azaldan klapan}} eyni üsulla çəkilir: sorma (ya da yuxarı axın) qovşağından verilmə (ya da aşağı axın) qovşağına. {{ui:Çən}} qovşaq kimi yerləşdirilir.
5. {{ui:Qovşaq}} seçin və onun {{ui:Tələbat}} yazın (gpm, metr layihəsində L/s). Borunu seçin və onun {{ui:Diametr}} (in və ya mm) təyin edin və bilirsinizsə, Hazen–Williams C.

Hər dəyişiklik bir geri qaytarma addımıdır. Delete qovşağı və ona bitən boruları silir.

## Hər hissə nəyi bildirir

- **Boru.** Uzunluq yazmadıqca planla boyunca ölçülür. C Hazen–Williams pürüzlülüyüdür (başlanğıc üçün 130; defoltu pəncərədə dəyişin). K yerli itki əmsalı döngə və birləşmələrin itkilərini əlavə edir. Su geriyə axmamalı boru üçün **Yoxlama klapanı** qeyd edin; **Bağlı** boru heç nə daşımır.
- **Su anbarı.** Sabit başlıqda mənbə, saxladığı su səviyyəsi datumdan yuxarıda. Şəbəkənin nə tələb etdiyini verir və ya alır.
- **Çən.** Gün ərzində dəyişən səviyyə. Sabit nəticələrdə cari səviyyəsində mənbədir.
- **Nasos.** Bir layihə nöqtəsi (axın və başlıq) həmin əyrini verir: sıfır axında başlıq layihə başlığının 133 %-idir, və başlıq ikiqat layihə axınında sıfırdır. Nasos heç vaxt suyu geriyə itələmir.
- **Təzyiqi azaldan klapan.** Təchizat yüksək olanda aşağı axında təyin etdiyiniz təzyiqi saxlayır. Təchizat aşağı olanda açıqdır və heç nə saxlamır; su geriyə axacaqsa, bağlanır.

## Nəticələri oxuyun

Pəncərə hər qovşağın başlığını və təzyiqini, hər bağlantının axınını, sürətini və hər 1,000 ft (ya da hər km) üzrə başlıq itkisini göstərir; qovşaqlar planda rənglənir: yaşıl ən aşağı və ən yüksək təzyiqinizin arasındadır, qırmızı aşağıdadır, sarı yuxarıdadır. Axın oxları istiqaməti göstərir. Rəqəmlərini Xüsusiyyətlərdə oxumaq üçün qovşaq və ya boru seçin.

Cədvəllərin altında nəyə baxmağın siyahısı var: aşağı və ya yüksək təzyiq, limitinizdən sürətli boru, hər mənbədən ayrılmış qovşaq, və ya həll edicinin qərarlaşmaması. Eyni tapıntılar **Problemlər** panelindədir. Limitləri pəncərədə təyin edin (başlanğıc üçün 20 psi, 100 psi və 10 ft/s; metr layihəsində 140 kPa, 700 kPa və 3 m/s).

## Yanğın axını

{{ui:Yanğın axını…}} bir qovşaqda axın çəkir və orada təzyiqi, həmçinin şəbəkədə hər yerdə ən aşağı təzyiqi göstərir. Şəbəkədəki ən zəif qovşaq verdiyiniz qalıq təzyiqi saxlayarkən, həmin qovşaqda mövcud axını da tapır. Digər tələbatlar olduğu kimi qalır.

## Bir günlük tələbat

{{ui:Bir günlük tələbat…}} şəbəkəni saat-saat işlədir. Tələbat nümunəsini faylın parametrlərində verin (təkrarlanan vuruqlar siyahısı); çənlər daxil və çıxan axınla dolur və boşalır, nasos isə aç/bağla nümunəsini izləyə bilər. Ən yüksək və ya ən aşağı səviyyəyə çatan çən siyahıda adlandırılır: CivilCraft onun girişini və ya çıxışını sizin üçün bağlamır, ona görə bunu "bu çən çox kiçikdir və ya nasos çox böyükdür" kimi oxuyun.

## EPANET mətni

{{ui:EPANET mətni kimi saxla (.inp)}} şəbəkəni bir çox su proqramlarının oxuduğu sadə mətn formatında yazır, və {{ui:EPANET mətnini aç (.inp)…}} birini oxuyur. Yalnız CivilCraft-ın modelləşdirdiyi şeylər keçir: qovşaqlar, su anbarları, çənlər, borular, başlıq əyrisi olan nasoslar, təzyiqi azaldan klapanlar, tələbat nümunələri və vaxtlar. Digər klapan növləri, gücü ilə verilən nasoslar və digər başlıq itkisi düsturları adlandırılır və kənarda qalır. Faylın layihə ilə eyni vahidlərdən istifadə etməsi lazımdır.

## Hidrantlar, klapanlar və birləşmələr

Qovşağı seçin və **Hidrant** qeyd edin ki, orada hidrant olsun; magistralı seçin və ortaya klapan, hava klapanı, boşaltma və ya sayğac qoymaq üçün **Ortaya əlavə et** basın. Onlar şəbəkənin obyektləridir: onunla birlikdə köçürlər və bir geri qaytarma addımı onları silir.

Planlaşdırma birləşmələri də nəzərdə tutur və CivilCraft onları soruşmadan siyahıya salır: üç magistral birləşən yerdə **tee**, dörd birləşən yerdə **xaç**, iki magistral 5° və ya daha çox dönən yerdə **dirsək** (bucağı ilə), iki ölçü birləşən yerdə **reduktor**, və kor sonda **qapaq**. {{ui:Birləşdiricilər cədvəli (CSV)}} onları və magistralları ölçüsünə görə sayır. Bu, planlaşdırmanın nəzərdə tutduğudur: öz təfərrüatlarınızla yoxlamaq üçün miqdar hesabıdır, sifariş üçün siyahı deyil.

Magistrallar çəkilə və 3D-də modelləşdirilə bilmək üçün təbii zəminin altında örtük (4 ft və ya 1.2 m) çıxılmaqla qoyulur; yuxarıdakı təzyiqlər heç vaxt ondan asılı deyil.

## Planda və fayllarda

Plan, PDF və DWG və ya DXF magistralları **C-WATR-MAIN** qatında, ölçülərini **C-WATR-TEXT** qatında, hidrantları **C-WATR-HYDR** qatında, klapanları **C-WATR-VALV** qatında və birləşmələri **C-WATR-FITT** qatında saxlayır. LandXML ixracı su boru şəbəkəsi yazır (hər qovşaq üçün quruluş, hər magistral üçün boru, hidrantlar adlandırılmış); LandXML idxalı onu su magistralları kimi oxuyur, tələbat, nasos və ya klapan olmadan, çünki LandXML bunları saxlamır. IFC ixracı magistralları bir su sistemində boru seqmentləri, hidrantlar, klapanlar və birləşmələr kimi yazır. Bu fayllar öz oxuyucumuz və yazıcılarımızla yoxlanılıb; onları digər proqramlarınızda sınayın və nə dediklərini bizə deyin.

## Hələ olmayanlar

Suyun keyfiyyəti və yaşı, nasosun aç/bağla nümunəsindən kənar idarəetmə və qaydalar, digər klapan növləri, təzyiqə görə tələbat, dəyişən diametrli borular və zaman üzrə kanalizasiya axınları. Bax: [Hələ qurulmayıb](topic:not-built-yet). Sanitar layihə axınları ayrı hesablamadır və [Sanitar layihə axınları](topic:sanitary-design) bölməsindədir.
