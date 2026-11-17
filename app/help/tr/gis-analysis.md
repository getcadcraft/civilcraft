---
title: GIS katmanlarını çözümleme
summary: Bir projedeki GIS katmanları için tampon bölge, bindirme (kesişim, birleşim, silme, eritme), uzamsal birleştirme, özniteliğe göre seçme ve ölçme; her sonuç geri alınabilen yeni bir katman olarak eklenir.
keywords: gis, cbs, çözümleme, analiz, tampon, buffer, kesişim, birleşim, silme, kırpma, eritme, dissolve, uzamsal birleştirme, birleştirme, join, özniteliğe göre seç, sorgu, where, ifade, expression, istatistik, alan, uzunluk, çevre, ölçme, parsel, geçit hakkı, çekme mesafesi, shapefile, geopackage, öznitelik tablosu
from: a6b2d3f9
---

Bir projede GIS katmanları olduğunda (bkz. [GIS verilerini içe aktarma](topic:gis-import)), CBS grubundaki **Çözümle** düğmesi (`GISANALYSIS`, `ANALYZE` veya `BUFFER` yazılarak da açılır) beş sekmeli bir panel açar. Panel plan yanında açık kalır; seçtiğiniz şey, siz çalışırken plan üzerinde çizilir.

Bir şey üreten her araç **yeni bir katman ekler** ve okuduğu katmanları olduğu gibi bırakır. Her biri tek bir geri alma adımıdır: paneldeki {{ui:Undo}} (veya Ctrl+Z) yeni katmanı kaldırır. Sonucu, herhangi bir katman gibi, [GIS için as-built verilerini dışa aktarma](topic:gis-export) konusundaki yöntemle shapefile, GeoJSON veya GeoPackage olarak dışa aktarın.

Bir katmanın tam tablosu (sıralama, düzenleme ve alan hesaplayıcı ile) [Bir katmanın öznitelik tablosuyla çalışma](topic:gis-table) konusundadır; bir alana göre renklendirme ise [Katmanı bir özniteliğe göre stillendirme](topic:gis-symbology) konusundadır.

Her şey plan üzerinde, projenin birimlerinde (feet veya metre) çalışılır. Bir proje her zaman projeksiyonlu veya yerel bir sistemdedir; dolayısıyla 50 mesafesi 50 feet veya 50 metre demektir, asla derece değildir. Yükseklikler (z) sonuçlarda saklanmaz.

## Tampon bölge

Her özelliğin etrafında belirlenen mesafede bir bölge çizer; bu bölge yeni bir çokgen katmanı olur. Noktalar daireye, çizgiler uçları yuvarlak koridorlara dönüşür, çokgenler büyür. Bir **negatif** mesafe çokgenleri küçültür (100 x 100 bir kare 5 ile küçültülürse 90 x 90 olur; 60 ile küçültülürse geriye hiçbir şey kalmaz ve panel bunu bildirir). Mesafeyi bir sayısal alandan alarak her özelliğe kendi mesafesini verebilirsiniz; ya da hepsini eritmek için **Tüm tampon bölgeleri tek şekilde birleştir** kutusunu işaretleyin.

Yuvarlak kısımlar, gerçek eğrinin içine çizilen düz parçalardır; bu yüzden bir tampon bölge tam daireden biraz küçüktür: normal ayarda alanda yaklaşık 0.6 %, İnce ayarda 0.16 %. Ölçeceğiniz her şey için İnce'yi kullanın.

## Bindirme

| Araç | Ne elde edersiniz |
|---|---|
| Kesişim | Girdi katmanının bindirme çokgenleriyle buluştuğu parçalar; her biri iki katmanın alanlarını taşır. Çizgiler ve noktalar çokgenlere göre kırpılır. |
| Birleşim | İki çokgen katmanı birbirinin kenarları boyunca kesilir: ortak parçalar iki katmanın alanlarını, geri kalanlar yalnızca bir katmanın alanlarını taşır (diğer katmanın alanları boştur). |
| Silme | Girdi çokgenlerinden bindirme çokgenleri çıkarılır. Alanlar girdide kalır. Tamamen silinen bir özellik dışarıda bırakılır (panel bunları sayar). |
| Eritme | Birbirine değen veya örtüşen çokgenleri birleştirir; hepsini ya da bir alanın her değeri için bir şekli birleştirir. `COUNT` ve `AREA` alanlarını ekler. |

İki katmanda da bulunan bir alan adı, birinci katman için korunur; ikinci katmanın alanı `_2` ekiyle yazılır. Bir katmanın içindeki özellikler birbiriyle örtüşmemelidir; örtüşürse Birleşim, örtüşen kısmı iki tarafta da sayar.

## Uzamsal birleştirme

Uzamsal birleştirme, bir **kaynak** katmanın özniteliklerini, ona değen her **hedef** özelliğe kopyalar ve hedefin şekillerine sahip yeni bir katman verir. Ne zaman eşleşeceklerini seçin: dokunma veya örtüşme, hedefin kaynak çokgenin içinde olması, hedefin kaynak özelliği içermesi, en yakın kaynak özellik (isteğe bağlı bir sınırla) veya belirli bir mesafe içindeki herhangi bir kaynak özellik.

Birden çok kaynak özellik eşleşirse ilkinin özniteliklerini alırsınız (en yakın ve mesafe birleştirmelerinde en yakın olanın; mesafe birleştirmelerinde ayrıca `DISTANCE` eklenir) ya da **onları sayıp sayısal alanlarını toplarsınız**: `COUNT` ve her sayısal alan için `SUM_`, `MEAN_`, `MIN_`, `MAX_`. Eşleşme bulamayan hedef özelliklerini dışarıda bırakmak için **Eşleşme bulamayan hedef özellikleri koru** kutusunun işaretini kaldırın. Birleştirilen alanlar eşleşmeyen yerlerde boş kalır ve panel eşleşmeyenleri sayar.

## Özniteliğe göre seçme

Öznitelikler veya şekil hakkında bir soru yazın, **Seç** düğmesine basın; özellikler sayılarıyla, bir tabloyla ve toplam alan, uzunluk veya sayı ile plan üzerinde çizilir. Sonra bunlardan ayrı bir katman oluşturabilir, bunlara yakınlaştırabilir veya seçimi temizleyebilirsiniz.

| Yazabilecekleriniz | Örnek |
|---|---|
| Bir alanın adı; ad boşluk içeriyorsa "tırnak" veya [köşeli parantez] kullanın | `VALUE`, `"Lot Number"` |
| Sayılar, 'metin', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (metin büyük/küçük harfe duyarsızdır; `like` içinde `%` herhangi bir dizgiyi, `_` tek bir harfi temsil eder) | `Notes contains 'corner'` |
| `is null`, `is not null` (boş bir değer null sayılır) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` ve parantezler | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Şekil değerleri `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Eksik olan veya katmanda bulunmayan bir alan adı içeren bir soru, nerede olduğunu belirten bir cümleyle reddedilir.

## Ölçme

Katmanın toplam alanını, çevresini, uzunluğunu veya sayısını gösterir ve ona **alan ekler**: çokgenler için `AREA` ve `PERIMETER`, çizgiler için `LENGTH` (plan uzunluğu), noktalar için `X` ve `Y`. Zaten var olan bir alan asla üzerine yazılmaz: yeni olan `AREA_2` olarak adlandırılır. Bu da tek bir geri alma adımıdır. **İstatistikler**, bir sayısal alanın sayısını, toplamını, ortalamasını, en küçük ve en büyük değerini verir; isteğe bağlı olarak başka bir alanın her değeri için.

:::note
Bu araçların arkasındaki kontroller testte elle yapılır (`node bin/test-civilcraft-gisanalysis.mjs`): örneğin 100 x 100 parseller ile 100 x 80 bir bölgenin kesişimi 3,000 artı 3,000'dir ve 10 ile tamponlanmış 100 uzunluğundaki bir çizgi 2,000 artı bir dairedir.
:::
