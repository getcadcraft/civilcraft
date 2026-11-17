---
title: Qatın atribut cədvəli ilə iş
summary: GIS qatının hər obyektini cədvəl kimi görün, sıralayın və süzün, sətirləri və obyektləri birlikdə seçin, dəyərləri düzəldin, sütunlar əlavə edin, yeni dəyərləri hesablayın və cədvəli CSV kimi saxlayın.
keywords: atribut cədvəli, cədvəl, sütunlar, sıralama, süzgəc, ifadə, seç, redaktə, sütun kalkulyatoru, hesabla, sütun əlavə et, sütunu adlandır, sütunu sil, csv, ixrac, gis, shapefile, geopackage, simvolologiya
from: fd9d6c11
---

Qatın cədvəlini **GIS qatları** siyahısındakı üç nöqtə menyusundan açın ({{ui:Attribute table…}}), Səth › Daha çox › {{ui:Attribute table}} yolu ilə, və ya `ATTRIBUTES`, `ATTTABLE` və ya `TABLE` yazaraq. Cədvəl plan yanında açılır və siz işləyərkən açıq qalır. Yalnız görünən sətirlər çəkilir, buna görə minlərlə obyektli qat sürətlə açılır və sürüşür.

## Sıralama, süzgəc və seçim

- **Sıralama:** sütun başlığına klikləyin. İkinci klik tərsinə çevirir, üçüncüsü faylın sırasını bərpa edir. Boş dəyərlər həmişə aşağıda qalır. Sıralama yalnız gördüklərinizi dəyişir, qatı yox.
- **Süzgəc:** süzgəc qutusuna yazın. `AREA > 500 and USE = 'Res'` kimi ifadə doğru olduğu sətirləri saxlayır ([GIS qatlarını təhlil et](topic:gis-analysis) bölməsinin Seç sekmesindəki eyni sözlər: `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). İfadə olmayan, məsələn `oak maple`, hər sütunda həmin sözləri axtarır.
- **Sətirləri seçin:** sətirə klikləyin. Ctrl+klik birini əlavə edir və ya silir, Shift+klik bir ardıcıllığı seçir, {{ui:Select shown rows}} isə süzgəcdən keçən hər sətri seçir. Seçilmiş obyektlər planda çəkilir, plandakı obyektə klik onun sətrini burada seçir.
- Sətirlər seçiləndə onlara {{ui:Zoom}} edə, seçimdən **qat yarada** və status sətirində ümumi sahəni və ya uzunluğu oxuya bilərsiniz.

## Dəyərləri düzəltmək

Xanaya ikiqat klikləyin (və ya ox düymələri ilə gedib Enter basın), yeni dəyəri yazın və Enter basın. Esc onu əvvəlki kimi qoyur. Dəyər sütuna uyğun olmalıdır: rəqəmlər rəqəm kimi, tarixlər `YYYY-MM-DD` formatında, bəli/xeyr dəyərləri yes, no, true və ya false. Uyğun gəlməyən dəyər cümlə ilə rədd edilir və heç nə dəyişmir. Boş xana dəyəri boş edir. Hər redaktə bir geri qaytarma addımıdır: {{ui:Undo}} və {{ui:Redo}} cədvəlin altındadır, planda isə Ctrl+Z işləyir.

## Sütunlar

**Sütunlar** altında sütun əlavə edə (mətn, rəqəm, tarix və ya bəli/xeyr), adını dəyişə və ya silə bilərsiniz. Yeni sütun boş başlayır. Adın dəyişməsi yayılır: qatın etiket sütunu və [atributa görə üslub](topic:gis-symbology) yeni adına keçir, sütunu silmək onu istifadə edən etiketi və üslubu da silir. Hər biri hər şeyi geri gətirən bir geri qaytarma addımıdır.

## Sütun kalkulyatoru

Hər sətirə (və ya yalnız seçilmiş sətirlərə) sətirin digər sütunlarından, həndəsəsindən və bir neçə funksiyadan dəyər yazır. Mövcud sütun seçin və ya **A new field…** (Yeni sütun…) seçib ona ad və tip verin. Heç nə kod kimi işlədilmir: ifadə sabit funksiya siyahısı olan kiçik təhlilçi ilə oxunur.

| Qrup | Sözlər |
|---|---|
| Rəqəmlər | `+ - * /`, mötərizələr, `abs round(x, digits) floor ceil sqrt pow min max` |
| Mətn | `upper lower trim len substr(text, from, count) left right replace concat` (mətn 'tək dırnaqda' yazılır; boşluqlu sütun adı "qoş dırnaqda" və ya [mötərizədə] yazılır) |
| Seçmə | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Tarixlər | `YYYY-MM-DD` dəyərinin `year month day`-ı |
| Həndəsə | `$area $perimeter $length $x $y $vertices`, layihənin vahidlərində |

Sütunun tipinə yazıla bilməyən nəticə (rəqəm sütununda mətn) boş qalır və mesajda sayılır. Sıfıra bölmək boş dəyər verir. Məsələn, `round($area / 43560, 2)` kvadrat futdan akrları yazır.

## İxrac

{{ui:Export CSV}} gördüyünüz sətirləri (süzgəcdən və sıralamadan sonra) birinci sətirdə sütun adları olan UTF-8 CSV faylı kimi saxlayır. `=`, `+`, `-` və ya `@` ilə başlayan mətnin əvvəlinə apostrof əlavə olunur ki, cədvəl proqramı onu formula kimi işlətməsin. Qatın özünü saxlamaq üçün [GIS üçün as-built məlumatlarını ixrac et](topic:gis-export) istifadə edin.

## Məhdudiyyətlər

Cədvəl qatı bir sıralama və eyni anda bir süzgəclə göstərir. Burada sətir əlavə və ya silinə bilməz (seçimdən yeni qat yaradın), həndəsə redaktə olunmur və sütunun tipi yaradıldıqdan sonra dəyişdirilə bilməz.
