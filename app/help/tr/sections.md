---
title: Örnek çizgileri ve enine kesitler
summary: Kesitleri bir eksene dik olarak kesin; her istasyonda zemini, tasarımı ile kazı ve dolguyu görün ve ortalama uç alanlarıyla hacimleri alın.
keywords: kütle taşıma, kütle diyagramı, denge noktası, büzülme, şişme, taşıma mesafesi, ödünç, atık, kesit sayfaları, enine kesit sayfaları, kesit pdf, kesitler, enine kesitler, örnek çizgileri, kesit görünümü, kazı, dolgu, alanlar, ortalama uç alanı, uç alanı hacimleri, toprak işleri, istasyon, ofset, csv
from: 09639ce2
---

Bir enine kesit, yolu inşa edileceği biçimde gösterir: bir istasyonda eksene dik olarak, mevcut zemini, tasarımı (içine tesviye edilen koridor ya da platform) ve aralarındaki kazı ve dolguyu.

## Örnek çizgileri ekleyin

1. Bir eksen seçin. **Özellikler** içinde, **Örnek çizgileri** altında {{ui:Örnek çizgileri ekle}} öğesine tıklayın.
2. **Aralık** (başlangıçta 50 ft ya da 20 m), **Sol genişlik** ve **Sağ genişlik** değerlerini ayarlayın (her kesitin eksen çizgisinden ne kadar uzandığı).
3. Belirli bir istasyonda kesit kesmek için, **İstasyon ekle** alanına yazın (örneğin `2+35`) ve {{key:Enter}}'a basın.

Kesitler, aralığın her tam katında, eksenin iki ucunda, her eğrinin başında ve sonunda (PC ve PT) ve eklediğiniz istasyonlarda kesilir. Örnek çizgileri planda eksen boyunca gri çizgiler olarak gösterilir; ayrıca DXF, DWG ve PDF'e C-ROAD-SCTN katmanında çıkarlar. Her değişiklik tek bir adımdır: {{key:Mod+Z}} geri alır.

## Kesit görünümü

Eksenin **Özellikler** bölümündeki {{ui:Kesit görünümü}}, **Yüzey** › {{ui:Daha fazla}} altındaki {{ui:Kesitler}} ya da {{key:X}} ile açın. Planın altındaki boy kesiti görünümünün yerini alır.

- Kesitler arasında, çubuğundaki oklarla, istasyon listesiyle ya da kesit görünümü odaktayken {{key:Left}} ve {{key:Right}} ile gezinin ({{key:Home}} ve {{key:End}} ilk ve son kesite gider).
- Gri çizgi mevcut zemin, kırmızı çizgi tasarımdır. Kazı turuncu, dolgu yeşil gölgelenir. Koridor noktaları işaretlenir: CL (eksen çizgisi), EOP (kaplama kenarı), SH (bankuet) ve DL (yarma-dolgu sınırı).
- Üst bilgi istasyonu, bu kesitin kazı ve dolgu alanlarını ve dikey abartmayı verir. {{ui:Sığdır}} paneli doldurur; gerçek ölçekte görmek için 1× seçin.
- Planda kalın çizgi ekranda hangi kesitin olduğunu gösterir.
- **Yakınlaştırma ve kaydırma:** tekerlek imleçten yakınlaştırır, sürükleyerek görünüm kayar. {{ui:Sığdır}} (veya {{key:F}}, ya da çift tıklama) tüm kesiti yeniden sığdırır.

## Bir kesitte ölçün

1. Kesit çubuğundaki {{ui:Ölç}} öğesine tıklayın ya da {{key:M}}'ye basın. İpucu "Birinci noktaya, sonra ikinciye tıklayın." der.
2. İki noktaya tıklayın. Her biri bir çizgi ucuna ya da bir koridor noktasına (CL, EOP, SH, DL) oturur; serbest bir nokta için {{key:Alt}}'a basılı tutun.
3. Okuma; yatay uzaklığı (ΔH), düşey uzaklığı (ΔV), yüzde eğimi oranıyla birlikte ve düz uzunluğu, projenin birimleriyle verir.

Yeni bir ölçüm başlatmak için yeniden tıklayın. {{key:Esc}} onu temizler, {{key:M}} Ölç'ü kapatır.

## Kesit sayfaları

**Örnek çizgileri** altındaki {{ui:Kesit sayfaları (PDF)}}, her kesiti PDF sayfalarına, istasyon sırasına göre soldan sağa ve yukarıdan aşağıya satırlar halinde yerleştirir. **Kağıt**, **Plan ölçeği** (kesitlerin yatay ölçeği) ve **Profil abartması** (1×, 2×, 5× veya 10×) seçin; iletişim kutusu bir sayfaya kaç kesitin sığdığını ve bunun kaç sayfa ettiğini söyler.

Her kesit ofset ve kot ızgarası, zemini (kesikli), tasarımı, gölgeli kazı ve dolguyu (turuncu ve yeşil), koridor noktalarını ve altında istasyonunu ve kazı ve dolgu alanlarını gösterir. Sayfalardaki her kesit aynı boyutta çizilir; en büyüğü sığacak kadar yüksek olarak. Abartmanızda sayfaya sığmadığında CivilCraft sığan en büyüğünü kullanır ve bunu söyler. Başlık şeridi eksenin adını, o sayfadaki istasyonları, ölçekleri ve "Sayfa 1 / 3"ü verir.

## Kazı ve dolgu neye göre ölçülür

Bir koridorun asfaltın altında katmanları olabilir: kaplama tabakaları, şablon bileşenleri, iz. Kesit çubuğundaki **Hacimler şuna göre ölçülür** seçimi, kazı ve dolgunun nereye kadar sayılacağını belirler:

- **Alt yüzey** (başlangıç): bu bileşenlerin altına kadar; böylece kazı, asfalt katmanlarının derinliğini içerir.
- **Üst yüzey**: yalnızca tasarımın üstüne kadar, bileşenler sayılmadan önceki gibi.

Üst bilgideki alanlar, aşağıdaki hacimler, CSV ve {{ui:Kütle taşıma}} hepsi bu seçimi izler; seçim proje ile birlikte kaydedilir.

## Ortalama uç alanlarıyla hacimler

İki komşu kesit arasında hacim, iki alanlarının ortalamasının, istasyonları arasındaki uzaklıkla çarpımıdır. Çubuk eksen için toplamları gösterir; {{ui:CSV}} her kesitin alanlarını ve hacimlerini, çalışan toplamlarla indirir (feet projeleri için cu yd, metrik projeler için metreküp).

**Özellikler**, aynı toplamları, [Toprak işi hacimleri](topic:volumes) konusundaki ızgara yöntemi hacimlerinin yanında gösterir. İkisi farklı yaklaşımlardır: kesitler birbirine yaklaştıkça sonuçlar yakınlaşır; düz bir yolda ve düz zeminde aynıdırlar.

:::note
Kazı ve dolgu yalnızca tesviye edilmiş alanların içinde sayılır (bir koridorun ya da platformun yarma-dolgu sınır çizgileri), ızgara yönteminde olduğu gibi. Koridor ya da platform yoksa tasarım zeminin kendisidir; bu nedenle kesit kazı ya da dolgu göstermez.
:::

## Kütle taşıma

**Örnek çizgileri** altındaki {{ui:Kütle taşıma}}, aynı uç alanı hacimlerinden kütle taşıma diyagramını çizer: istasyonlar boyunca, kazının eksi dolgunun çalışan toplamı.

- **Kazının büzülmesi (−) ya da şişmesi (+)**, yerleştirildiğinde bir metreküp kazının ne olduğunu söyler: −%10 (başlangıç değeri, yer tutucu) 0.9'a büzüldüğü anlamına gelir; şişen kaya +%5 olabilir. Jeoteknik raporunuzdaki değeri kullanın.
- Çizginin yükseldiği yerde yol kazıdadır; alçaldığı yerde dolgudadır. Sıfırın üstünde (turuncu gölgeli) toprak istasyon artan yönde, altında (yeşil) azalan yönde taşınır.
- **Denge noktaları**, çizginin sıfırı kestiği yerlerdir: ikisi arasında kazı ve dolgu dengelenir. Tablo her dengelenmiş bölümü, taşınan hacmi (en yüksek ya da en düşük noktası) ve ortalama taşıma mesafesini (gölgeli alanın bu hacme bölümü) listeler.
- Çizgi sıfır dışında bittiğinde, geriye kalan **atık** (yukarıda) ya da **ödünç** (aşağıda) olur. Bu son bölümde yalnızca bittiği seviyenin ötesindeki toprak taşınmış sayılır.

**CSV**, her kesitteki kütle ordinatını, bölümleri ve faktörü kaydeder.
