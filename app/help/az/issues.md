---
title: Problemlər və BCF
summary: Problemi plana, trassa stansiyasına, səth nöqtəsinə və ya boruya bağlayın, ona status və şərhlər verin, problemləri LandXML faylının yanında BCF 2.1 faylları kimi mübadilə edin.
keywords: problem, problemlər, bcf, şərh, qeyd, nöqsan, qüsur, tikinti sahəsi, sancaq, status, açıq, həll olunub, bağlı, BIM əməkdaşlıq formatı, landxml, problemlər
from: e44153b1
---

Problem — CivilCraft çertyojunuzdakı bir yerə bağlanmış, başlığı, statusu və şərhləri olan qeyddir. Onu tikinti sahəsinin işçilərinə və ya başqa proqrama nəyə baxmaq lazım olduğunu bildirmək və onların cavablarını geri oxumaq üçün istifadə edin.

## Problem əlavə etmək

1. **Səth, Digər, Problemlər (BCF)...** seçin
2. Başlığı və nə yanlış olduğunu yazın.
3. Onu harada sancaqlayacağınızı seçin: plan görünüşünün mərkəzi, mərkəzdəki səth nöqtəsi, seçilmiş trassanın stansiyası (stansiyanı və ofseti yazın, sağ tərəf müsbətdir) və ya seçilmiş boru, quruluş və ya xətt elementi.
4. **Problem əlavə et** düyməsini basın. Sancaq planda nömrəsi ilə birlikdə kiçik romb kimi görünəcək.

Problemin başlığını klikləyərək ona yaxınlaşın, siyahıda onun statusunu dəyişin (Açıq, Aktiv, Həll olunub, Bağlı) və şərhlər əlavə edin. Hər dəyişiklik bir geri qaytarma addımıdır, problemlər layihə faylında saxlanılır.

## BCF formatında mübadilə

- **BCF ixrac et** hər problem üçün bir mövzu olmaqla BCF 2.1 faylı yazır: başlıq, status, şərhlər və sancağı olan ortoqonal plan kamerası ilə bir baxış nöqtəsi.
- **BCF idxal et** BCF faylını oxuyur (2.0 və 3.0 faylları 2.1-lə üst-üstə düşdüyü qədər oxunur). Artıq olduğunuz guid-li mövzu əlavə nüsxə yaratmır, həmin problemi yeniləyir (status, yeni şərhlər).
- **Problemlərdən** Problemlər panelində yerini göstərən hər açıq qeyd üçün problem yaradır.

BCF bu layihənin öz koordinatlarında metrləri saxlayır, heç bir sürüşmə olmadan. Sancaqların düzgün yerə düşməsi üçün digər proqram LandXML faylınızla eyni koordinat sistemində olmalıdır. Sancağın göstərdiyi element (trassa, stansiya, ofset, boru) "cc:" ilə başlayan etiketlər kimi ötürülür və CivilCraft onları geri oxuyur.

## Yoxlanmayanlar

Sancaqlar və baxış nöqtələri yalnız fayl yazılaraq və CivilCraft-da geri oxunaraq sınaqdan keçirilib. Hələ heç bir başqa BIM proqramı onları açmayıb. BCF-də "görünüşün dünya miqyasına" görə görünüşün tam və ya yarım hündürlüyünün nəzərdə tutulması proqramdan proqrama fərqlənir: CivilCraft tam hündürlüyü yazır.
