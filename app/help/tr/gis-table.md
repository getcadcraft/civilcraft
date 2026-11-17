---
title: Bir katmanın öznitelik tablosuyla çalışma
summary: Bir GIS katmanının her özelliğini bir tablo olarak görün; sıralayın ve filtreleyin, satırları ve özellikleri birlikte seçin, değerleri düzeltin, alan ekleyin, yeni değerler hesaplayın ve tabloyu CSV olarak kaydedin.
keywords: öznitelik tablosu, tablo, alanlar, sütunlar, satırlar, sırala, filtre, ifade, seç, düzenle, alan hesaplayıcı, hesapla, alan ekle, alanı yeniden adlandır, alanı kaldır, csv, dışa aktar, gis, cbs, shapefile, geopackage, sembolizasyon
from: fd9d6c11
---

Bir katmanın tablosunu GIS katmanları listesindeki **üç nokta** menüsünden ({{ui:Attribute table…}}), Yüzey › Daha fazla › {{ui:Attribute table}} yolundan veya `ATTRIBUTES`, `ATTTABLE` ya da `TABLE` yazarak açın. Tablo plan yanında açılır ve siz çalışırken açık kalır. Yalnızca görünen satırlar çizilir; bu yüzden binlerce özellikli bir katman hızlı açılır ve kaydırılır.

## Sırala, filtrele ve seç

- **Sırala:** bir sütun başlığına tıklayın. İkinci tıklama sırayı tersine çevirir, üçüncü tıklama dosyanın sırasını geri getirir. Boş değerler her zaman en altta kalır. Sıralama yalnızca gördüğünüzü değiştirir, katmanı asla değiştirmez.
- **Filtrele:** filtre kutusuna yazın. `AREA > 500 and USE = 'Res'` gibi bir ifade, doğru olduğu satırları tutar (aynı sözcükler: [GIS katmanlarını çözümleme](topic:gis-analysis) konusundaki Seç sekmesinde de geçer: `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). İfade olmayan bir şey, örneğin `oak maple`, her sütunda bu sözcükleri arar.
- **Satır seç:** bir satıra tıklayın. Ctrl+tıklama bir satır ekler veya çıkarır, Shift+tıklama bir dizi seçer ve {{ui:Select shown rows}} filtreden geçen her satırı alır. Seçili özellikler plan üzerinde çizilir; plandaki bir özelliğe tıklamak burada onun satırını seçer.
- Satırlar seçiliyken {{ui:Zoom}} ile onlara yakınlaşabilir, **seçimden bir katman** oluşturabilir ve toplam alanı veya uzunluğu durum satırında okuyabilirsiniz.

## Değerleri düzeltin

Bir hücreye çift tıklayın (veya ok tuşlarıyla oraya gidip Enter'a basın), yeni değeri yazın ve Enter'a basın. Escape değeri eski haliyle bırakır. Bir değer sütuna uymalıdır: sayılar sayı olarak, tarihler `YYYY-MM-DD` olarak, evet/hayır ise evet, hayır, true veya false olarak. Uymayan bir değer bir cümleyle reddedilir ve hiçbir şey değişmez. Boş bir kutu değeri boş yapar. Her düzenleme tek bir geri alma adımıdır: {{ui:Undo}} ve {{ui:Redo}} tablonun altındadır; Ctrl+Z plan üzerinde çalışır.

## Alanlar

**Alanlar** altında bir alan ekleyebilir (metin, sayı, tarih veya evet/hayır), birini yeniden adlandırabilir ya da kaldırabilirsiniz. Yeni alan boş başlar. Yeniden adlandırma yayılır: katmanın etiket alanı ve [öznitelik stili](topic:gis-symbology) yeni ada taşınır; bir alanı kaldırmak, onu kullanan etiketi ve stili düşürür. Her biri, her şeyi geri getiren tek bir geri alma adımıdır.

## Alan hesaplayıcı

Her satıra (veya yalnızca seçili satırlara) satırın diğer alanlarından, geometrisinden ve birkaç işlevden bir değer yazar. Mevcut bir alan seçin ya da **Yeni alan…** seçip bir ad ve tür verin. Hiçbir şey kod olarak çalıştırılmaz: ifade, sabit bir işlev listesine sahip küçük bir ayrıştırıcı tarafından okunur.

| Grup | Sözcükler |
|---|---|
| Sayılar | `+ - * /`, parantezler, `abs round(x, digits) floor ceil sqrt pow min max` |
| Metin | `upper lower trim len substr(text, from, count) left right replace concat` (metin 'tek tırnak' içine yazılır; boşluk içeren bir alan adı "çift tırnak" veya [köşeli parantez] içine yazılır) |
| Seçme | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Tarihler | `YYYY-MM-DD` değerinin `year month day` (yıl, ay, gün) bileşenleri |
| Geometri | `$area $perimeter $length $x $y $vertices`, projenin birimlerinde |

Alanın türüne yazılamayan bir sonuç (sayı alanında metin) boş bırakılır ve mesajda sayılır. Sıfıra bölmek boş bir değer verir. Örneğin `round($area / 43560, 2)` kare feet'ten acre yazar.

## Dışa aktar

{{ui:Export CSV}} gördüğünüz satırları (filtre ve sıralamadan sonra) alan adları ilk satırda olacak şekilde UTF-8 bir CSV dosyası olarak kaydeder. `=`, `+`, `-` veya `@` ile başlayan bir metnin önüne bir kesme işareti eklenir; böylece bir elektronik tablo bunu formül olarak çalıştırmaz. Katmanın kendisini kaydetmek için [GIS için as-built verilerini dışa aktarma](topic:gis-export) konusunu kullanın.

## Sınırlar

Tablo katmanı tek bir sıralama düzeninde ve seferde tek bir filtreyle gösterir. Buradan satır eklenemez veya silinemez (bunun yerine seçimden yeni bir katman oluşturun), geometri düzenlenmez ve bir alanın türü oluşturulduktan sonra değiştirilemez.
