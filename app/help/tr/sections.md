---
title: Örnek çizgileri ve enine kesitler
summary: Kesitleri bir eksene dik kesin, her istasyonda zemini, tasarımı ve kazı ile dolguyu görün ve ortalama uç alanlarıyla hacimleri alın.
keywords: kütle taşınması, kütle diyagramı, denge noktası, küçülme, büyüme, taşıma mesafesi, ödünç, fire, kesit sayfaları, enine kesit sayfaları, kesitler pdf, kesitler, enine kesitler, örnek çizgileri, kesit görünümü, kazı, dolgu, alanlar, ortalama uç alanı, uç alanı hacimleri, toprak işleri, istasyon, ofset, csv
from: 5060173c
---

Enine kesit, yolun nasıl inşa edileceğini gösterir: bir istasyonda eksene dik olarak, mevcut zemin, tasarım (koridor ya da platform tesviyesi) ve bunların arasındaki kazı ve dolgu.

## Örnek çizgileri ekleyin

1. Bir eksen seçin. **Özellikler** içinde, **Örnek çizgileri** altında {{ui:Add sample lines}}'a tıklayın.
2. **Her** (aralık: başlangıçta 50 ft ya da 20 m), **Sol genişlik** ve **Sağ genişlik** (her kesitin merkez çizgiden ne kadar uzandığı) ayarlayın.
3. Belirli bir istasyonda kesit kesmek için, **İstasyon ekle** alanına yazın (örneğin `2+35`) ve {{key:Enter}}'a basın.

Kesitler, aralığın her tam katında, eksenin iki ucunda, her eğrinin başında ve sonunda (PC ve PT) ve eklediğiniz istasyonlarda kesilir. Örnek çizgileri planda eksen boyunca gri çizgiler olarak görünür; ayrıca DXF, DWG ve PDF'de C-ROAD-SCTN katmanında da çıkarılır. Her değişiklik tek bir adımdır: {{key:Mod+Z}} geri alır.

## Kesit görünümü

{{ui:Section view}} ile eksenin **Özellikler**inden, **Yüzey** › {{ui:More}} altındaki {{ui:Sections}} ile ya da {{key:X}} ile açın. Planın altındaki boy kesiti görünümünün yerini alır.

- Çubuğundaki oklarla, istasyon listesiyle ya da kesit görünümü odaktayken {{key:Left}} ve {{key:Right}} ile kesitler arasında gezinin ({{key:Home}} ve {{key:End}} ilk ve son için).
- Gri çizgi mevcut zemin, kırmızı çizgi tasarımdır. Kazı turuncu, dolgu yeşil gölgelenir. Koridor noktaları işaretlenir: CL (merkez çizgisi), EOP (kaplama kenarı), SH (bankuet) ve DL (yarma-dolgu sınırı).
- Başlık istasyonu, bu kesitin kazı ve dolgu alanlarını ve dikey abartmayı verir. **Sığdır** paneli doldurur; gerçek ölçekte görmek için 1× seçin.
- Planda kalın çizgi, ekranda hangi kesitin olduğunu gösterir.

## Kesit sayfaları

**Örnek çizgileri** altındaki {{ui:Section sheets (PDF)}}, her kesiti PDF sayfalarına koyar; istasyon sırasıyla soldan sağa ve yukarıdan aşağıya satırlar halinde. **Kâğıt**, **Plan ölçeği** (kesitlerin yatay ölçeği) ve **Profil abartması** (1×, 2×, 5× ya da 10×) seçin; iletişim kutusu bir sayfaya kaç kesit sığdığını ve bunun kaç sayfa ettiğini söyler.

Her kesit ofsetleri ve kotları olan bir ızgara, zemin (kesikli), tasarım, gölgeli kazı ve dolgu (turuncu ve yeşil), koridor noktaları ve altında istasyonunu ve kazı ile dolgu alanlarını gösterir. Sayfalardaki her kesit aynı boyutta çizilir, en büyüğünün sığacağı kadar yüksek; abartmanızda sayfaya sığmadığında CivilCraft sayfaya sığan en büyüğünü kullanır ve bunu söyler. Başlık şeridi ekseni, o sayfadaki istasyonları, ölçekleri ve "Sayfa 1 / 3" yazısını adlandırır.

## Ortalama uç alanlarıyla hacimler

İki komşu kesit arasında hacim, iki alanlarının ortalaması çarpı istasyonları arasındaki mesafedir. Çubuk eksen için toplamları gösterir, ve {{ui:CSV}} her kesitin alanlarını ve hacimlerini, birikimli toplamlarla birlikte indirir (feet projelerinde kübik yarda, metrik projelerde metreküp).

**Özellikler**, [Toprak işleri hacimleri](topic:volumes) içindeki ızgara yöntemi hacimlerinin yanında aynı toplamları gösterir. İkisi farklı yaklaşımlardır: daha yakın kesitler onları birbirine yaklaştırır, düz bir arazide düz bir yolda ise aynıdırlar.

:::note
Kazı ve dolgu yalnızca işlenmiş alanların içinde sayılır (bir koridorun ya da platformun yarma-dolgu çizgileri), ızgara yöntemi gibi. Koridor ya da platform yoksa tasarım zeminin kendisidir, bu yüzden bir kesit kazı ya da dolgu göstermez.
:::

## Kütle taşınması

**Örnek çizgileri** altındaki **Kütle taşınması**, aynı uç alanı hacimlerinden kütle taşınma diyagramını çizer: istasyonlar boyunca, kazının eksi dolgunun birikimli toplamı.

- **Kazının küçülmesi (−) ya da büyümesi (+)**, bir metreküp kazının yerleştirildikten sonra dolgu olarak ne olduğunu söyler: −10 % (başlangıç değeri, bir yer tutucu) 0.9'a küçüldüğü anlamına gelir; büyüyen kaya +5 % olabilir. Jeoteknik raporunuzun değerini kullanın.
- Çizgi yükseldiği yerde yol kazıdadır; alçaldığı yerde dolguda. Sıfırın üstünde (turuncu gölgeli) toprak istasyon yukarı; altında (yeşil), istasyon aşağı taşınır.
- **Denge noktaları** çizginin sıfırı kestiği yerlerdir: ikisi arasında kazı ve dolgu dengelidir. Tablo her dengeli kesimi, taşınan hacmi (en yüksek ya da en düşük noktası) ve ortalama taşıma mesafesini (gölgeli alan bu hacme bölünmüş) listeler.
- Çizgi sıfır dışında bittiğinde, geriye kalan **fire** (üstte) ya da **ödünç** (altta) olur. Bu son kesimde yalnızca bittiği seviyenin ötesindeki toprak taşınmış sayılır.

**CSV** her kesitteki kütle ordinatını, kesimleri ve faktörü kaydeder.
