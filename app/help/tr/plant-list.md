---
title: Bitki listesi
summary: Olgun boyutları, dayanıklılığı, ışık ve su gereksinimleri olan yaklaşık 420 yaygın ılıman ve Akdeniz bitkisi; her dilde aranabilir. Ayrıca projeyle birlikte kaydedilen kendi listeniz.
keywords: bitki listesi, bitki veritabanı, tür, botanik adı, yaygın ad, bitki paleti, fidanlık listesi, dayanıklılık bölgesi, csv, bitki içe aktar, bitki dışa aktar, bitkilerim, ağaç listesi, çalı listesi, bitkiler, bitki kütüphanesi
from: 7ed09e7e
---

Sol paneldeki **Bitkiler** bölümü, yerleştirebileceğiniz her bitkiyi listeler. Bir bitkiye tıklayarak boyutlarını görün ve onu **Bitki**, **Yatak** ve **Çit** tarafından kullanılacak bitki yapın.

## Arama ve filtreleme

**Ara** alanına yazın: bitkinin adındaki herhangi bir kelime (İngilizce, İspanyolca, Portekizce ya da başka bir dilde), botanik adı, türü veya notlarındaki bir kelime. Yazdığınız her kelime eşleşmelidir; bu nedenle `quercus evergreen` yazmak yaprak dökmeyen meşeleri bulur. Aksanlar önemli değildir.

Listeyi **Tür**, **Işık**, **Su** ve **Dayanıklılık bölgesi** ile daraltın (sitenizin bulunduğu USDA bölgesi; bir bitki, bölge kendi aralığında olduğunda listelenir).

## Bir bitkinin taşıdıkları

| Alan | Anlamı |
|---|---|
| Tür | Ağaç, çalı, çit, çim (çimler dahil), çok yıllık, yer örtücü veya tırmanıcı |
| Olgunlukta | Bahçede ya da sokakta yetişmiş bitkinin metre cinsinden yüksekliği ve yayılımı |
| Dikimde | Dikildiği boyut ve kabı |
| Aralık | Yatakta ya da çit boyunca merkezden merkeze mesafe |
| Dayanıklılık bölgesi | Genellikle dayandığı USDA bölgeleri |
| Işık, su, toprak | İhtiyaçları |
| Notlar | Kullanım ve uyarılar, örneğin zehirli kısımlar ya da yayılan bir bitki olması |

:::note
Yerleşik liste, CadCraft için genel bahçecilik bilgisine dayanılarak yazılmıştır: tipik boyutlar, yuvarlatılmış. Herhangi bir fidanlığın kataloğu değildir. Boyutları ve dayanıklılığı yerel bir fidanlıkla kontrol edin. İber Yarımadası'nda ve ılıman dünyanın büyük bölümünde en bilinen istilacı bitkiler bilerek dışarıda bırakılmıştır; başka bir yerde istilacı olan birkaç bitkinin notu vardır.
:::

## Kendi bitkileriniz

- **Bu projenin listesine ekle** bir bitkiyi projenin kendi listesine kopyalar; bu liste proje ile birlikte kaydedilir. Listenizdeki bir bitki, aynı anahtara sahip yerleşik bitkinin yerini alır; böylece boyutlarını bölgeniz için değiştirebilirsiniz.
- **Bitki listesi içe aktar…** bir CSV (ya da bitki dosyası) okur. CSV'de botanik adı içeren bir sütun ve ideal olarak tür, yükseklik ve yayılım sütunları bulunmalıdır; sütun adlarını kendi dilinizde yazabilirsiniz (Latince, Yaygın ad, Yükseklik, Yayılım, Genişlik, Bölge). Virgül, noktalı virgül veya sekme ile ayrılmış dosyalar ve ondalık virgüller okunur. Boş dikim boyutları, aralıklar ve kaplar türe göre makul varsayılanları alır.
- **CSV olarak dışa aktar** listenizi (ya da hiç yoksa aramanın gösterdiği bitkileri) bir elektronik tabloda açmak üzere kaydeder.

Bitki listesi, dışarıdan gelen her dosya gibi okunur: kullanılamayan her şey dışarıda bırakılır ve sayılır.

## Diğer uygulamalardaki bitkiler

Bitki listesi, her CadCraft uygulaması için tek bir kütüphanedir: BimCraft ve ModelCraft aynı listeyi taşır, ancak kendi **Kütüphaneden yerleştir** seçenekleri henüz bitki sunmaz. Bugün bitkiler, CivilCraft'ın peyzaj IFC'si aracılığıyla bir BIM modeline ulaşır (her bitki bir `IfcGeographicElement`). Bkz. [Dikim](topic:planting#ifc).
