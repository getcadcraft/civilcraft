---
title: Yağış axınlarını, boru ölçülərini və hidravlik qradiyent xəttini hesablayın
summary: Hər quyuya axan drenaj sahələrini çəkin, rasional üsulla şəbəkə boyu axınları toplayın, Mannin tənliyi ilə boruların ölçüsünü təyin edin və hidravlik qradiyent xəttinin nə vaxt tam dolu olduğunu və ya səthə çatdığını görün.
keywords: yağış drenajı, drenaj sahəsi, rasional üsul, axın əmsalı, toplanma müddəti, yağış intensivliyi, idf, mannin, boru ölçüsü, hidravlik qradiyent xətti, hgl, enerji qradiyent xətti, egl, üstyükləmə, daşqın, quyruq suyu
from: e44872ec
---

Yağış drenajı [boru şəbəkəsi](topic:pipe-network) üzərində işləyir: əvvəlcə şəbəkəni çəkin, sonra ona axan sahələri. Heç nə seçilmədikdə hər şey sağ paneldə **Yağış drenajı** altında görünür.

## Drenaj sahəsi çəkin

1. **Yağış drenajı** altında **Drenaj sahəsi çək** düyməsini basın.
2. Bir quyuya axan sahənin küncləri üzərinə basın. {{key:Enter}} və ya ikiqat basış bitirir; {{key:Backspace}} son küncü geri alır, {{key:Esc}} dayandırır.
3. Drenaj sahəsi içindəki quyuya, yoxsa ən yaxın quyuya axır. Onun **Xüsusiyyətləri** açılır: adını, **Axın əmsalı C** (yağışın axıb getdiyi pay, 0-dan 1-ə qədər), **Toplanma müddəti** dəqiqə ilə və hansı quyuya **Axdığı quyu** təyin edin.

Xüsusiyyətlərdəki **Başqa drenaj sahəsi çək** növbətisini başladır. Planda drenaj sahəsinin daxilinə basaraq onu seçin; {{key:Delete}} onu silir. Hər dəyişiklik bir addımdır: {{key:Mod+Z}} onu geri alır.

## Layihə yağışını təyin edin

Yağış intensivliyi i = a ÷ (tc + b) üstü c-dir; fut layihə üçün saatda düym, metr layihə üçün saatda millimetr ilə. Layihələndirdiyiniz təkrarlanma dövrü üçün **Intensivlik a**, **b** və **c**-ni öz intensivlik–müddət–tezlik əyrinizə uyğunlaşdırın.

:::warning
Başlanğıc intensivlik əyrisi, Mannin n (0.013) və qovşaq itkisi (0.5) standart deyil, yer tutucu dəyərlərdir. Onları öz yağış məlumatlarınıza və layihə meyarlarınıza görə təyin edin.
:::

- **Ən qısa toplanma müddəti**: heç bir boru bundan qısa müddətdə hesablanmır (başlanğıcda 10 dəqiqə).
- **Mannin n**: boruların pürüzlülüyü.
- **Qovşaq itkisi**: hər quyuda itirilən cərəyan başlığı, ondan çıxan borunun sürət başlığı V²/2g-nin payı kimi.
- **Çıxışda su səviyyəsi**: quyruq suyu, son borunun boşaldığı yerdə. Çıxış sərbəst axanda boş buraxın.

## Axınlar necə toplanır

Hər boru üstündəki bütün drenaj sahələrini daşıyır. Q = C × i × A, burada C × A şəbəkə boyu toplanır, i isə gələn suyun ən uzun toplanma müddətindəki intensivliyidir: drenaj sahəsinin öz müddəti və ya yuxarı drenaj sahəsindən gələn müddət üstəgəl boru vasitəsilə keçid vaxtı (uzunluq ÷ tam dolu axın sürəti). Q saniyədə kubik fut ilə (A akrla) və ya saniyədə kubik metr ilə (A hektarla) ifadə olunur.

## Boruların ölçüsünü təyin edin

**Axınlar və qradiyent xətləri** altındakı cədvəldə hər boru üçün axın, onun meylində tam dolu axanda daşıdığı həcm, sürət, yuxarı və aşağı hidravlik qradiyent və axının dərinliyi göstərilir.

**Boruların ölçüsünü bu axınlara görə təyin edin** hər boruya öz meylində axınını daşıyan ən kiçik standart ölçünü verir (12-dən 72 düymə qədər, və ya 300-dən 1800 mm-ə qədər). Bu bir addımdır. İnvertlər yerində qalır: ölçülər dəyişərsə, örtüyü saxlamaq üçün **Bütün invertləri qaydalara görə təyin et** istifadə edin, sonra cədvəli yenidən yoxlayın.

## Qradiyent xətlərini oxuyun

Hidravlik qradiyent xətti (HGL) çıxışdan yuxarıya doğru hesablanır:

- Qismən dolu axan boru üçün HGL su səthindədir: invert üstəgəl normal dərinlik.
- Aşağıdakı su tacından yuxarı olduqda və ya tam dolu axanda daşıya biləcəyindən çox daşıdıqda, boru tam dolu axır (üstyüklənmiş) və HGL onun uzunluğu boyunca sürtünmə meyli qədər qalxır.
- Hər quyuda HGL çıxan borunun yuxarı HGL-i üstəgəl qovşaq itkisidir.
- Enerji qradiyent xətti (EGL) HGL üstəgəl sürət başlığıdır.

Tam dolu axan boru siyahıya salınır, HGL-in kənardan yuxarı olduğu hər quyu da belə: orada su səthə çatır və quyu planda qırmızı halqa ilə işarələnir. Axını, dərinliyini, sürətini və hər iki qradiyent xəttini görmək üçün boru və ya quyunu seçin və onun **Xüsusiyyətləri**ndə baxın.

## Yağışı marşrutlaşdırın

Rasional üsul hər boru üçün bir zirvə verir. {{ui:Route the storm}} (nəticələrin altında, şəbəkənin **Xüsusiyyətləri**ndə) bunun əvəzinə bütün yağışı hesablayır: hər drenaj sahəsinin vaxt üzrə axını, keçid müddəti və saxlama ilə borular boyu aşağı daşınır və qovuşduqları yerdə toplanır.

1. Yuxarıdakı ən uzun toplanma müddətini və yağış əyrisini istifadə etmək üçün {{ui:Rain lasts}} və {{ui:Rain intensity}} boş buraxın, ya da öz dəyərinizi yazın.
2. {{ui:Route the storm}} düyməsinə basın. Cədvəldə hər boru üçün içəri və çıxan ən yüksək axın, çıxan zirvənin nə qədər aşağı olduğu, borunun tam tutumunun nə qədərindən istifadə etdiyi və zirvənin hansı dəqiqədə olduğu göstərilir.
3. Hər çıxış üçün kiçik axın–vaxt diaqramı görünür və {{ui:Download the hydrograph (CSV)}} düyməsi var.

Drenaj sahəsi öz toplanma müddəti üzrə orta yağışı buraxır, buna görə bundan qısa yağış C × i × A-dan aşağı zirvəyə çatır. Hər boru Muskingum–Cunge üsulu ilə marşrutlaşdırılır, rasional üsulun artıq tapdığı axın dərinliyindən istifadə olunur. Fərqli toplanma müddətli iki qol eyni anda zirvəyə çatmır, buna görə onların cəmi zirvələrinin cəmindən aşağıdır.

Bu, üstyükləmə, geri su, quyularda saxlama və ya daşqını modelləşdirmir. Marşrutlaşdırılmış zirvəsi tam tutumundan yuxarı olan boru siyahıya salınır və onun suyu sanki sığırmış kimi ötürülür. Bunu vaxtı və zəifləməni görmək üçün istifadə edin, borunun ölçüsünü təyin etmək üçün yox. Bu hesablama köməkçisidir: mühəndis onu yoxlayır.

## Layihə ilə saxlanılır

Drenaj sahələri və yağış parametrləri layihə faylında saxlanır. Onlar hələ PDF planında, DWG və ya DXF-də və ya LandXML-də deyil: bax [Hələ hazır deyil](topic:not-built-yet).
