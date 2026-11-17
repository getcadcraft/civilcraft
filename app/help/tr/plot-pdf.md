---
title: Planı PDF olarak çıktı alın
summary: Her şeyi ya da geçerli görünümü, mühendislik veya metrik ölçekte standart bir sayfaya, katman renkleriyle ya da siyah olarak vektör PDF'e çıktı alın.
keywords: çıktı al, yazdır, pdf, sayfa, ölçek, kâğıt boyutu, plan sayfası, yayımla, künye, kuzey oku, ölçek çubuğu
from: 9af396ca
---

{{ui:PDF}} planı tek bir sayfada, bir künye şeridi, kuzey oku ve ölçek çubuğuyla vektör PDF olarak çıktı alır. PDF tarayıcıda oluşturulup indirilir; tarayıcının yazdırma iletişim kutusundan geçmez.

## Çıktı alma

1. Planı **Görüntüleme** altında ayarlayın: gösterilen yüzey, kontur aralığı ve açık olan öğeler. Çıktı bu ayarları izler.
2. Sahanın yalnızca bir kısmını istiyorsanız, planı o kısma yakınlaştırın ve kaydırın.
3. **Dışa aktar** grubundaki {{ui:PDF}} düğmesine tıklayın ya da {{key:Mod+P}} tuşuna basın. **Planı PDF olarak çıktı al** iletişim kutusu açılır.
4. **Alan** seçin: {{ui:Her şey}} ya da {{ui:Ekranda olan}}.
5. **Kâğıt** seçin: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 veya A1. Feet birimli bir proje Tabloid ile, metre birimli bir proje A3 ile başlar. Sayfalar her zaman yataydır.
6. **Ölçek** seçin. Liste, "(fits)" ile sığan en büyük ölçeği işaretler ve onu seçer.
   - Feet: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metre: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. **Mürekkep** seçin: {{ui:Katman renkleri}} ya da {{ui:Siyah}}.
8. Seçimlerin altındaki satırı okuyun. Kâğıttaki alan boyutunu ve sayfa boyutunu verir; örneğin: "Alan, 1" = 40' ölçeğinde 432 × 279 mm'lik (yatay) bir sayfada 297 × 222 mm'dir."
9. {{ui:PDF indir}} düğmesine tıklayın.
   Tarayıcı `<name>.pdf` dosyasını indirir. Durum çubuğu "<name>.pdf, 1" = 40' ölçeğinde çıktı alındı." yazar.

Seçtiğiniz ölçekte alan sayfadan büyükse, çıktı ortalanır ve kenarlar kesilir. "(fits)" işaretli ölçeği ya da daha büyük bir sayfa seçin.

## Sayfada neler var

- Plan, çizim alanının ortasında, gerçek vektörler olarak: konturlar, etiketler, istasyonlamalı eksenler, koridorlar, platformlar ve yarma-dolgu sınırları, borular, noktalar.
- Katmana göre çizgi kalınlıkları: eksenler, platformlar ve borular daha kalın; üçgenler ve ara konturlar ince.
- Alt boyunca bir künye şeridi: proje **Adı**, ölçek, kontur aralığı ve hangi yüzeyin (mevcut ya da tesviye edilmiş) olduğuna dair bir not; sağda tarih ve sürüm.
- Sağ üst köşede bir kuzey oku (plan kuzeyi yukarıdadır) ve künye şeridinde bir ölçek çubuğu.
- **Plan altındaki harita katmanları** işaretliyken, planın altında gösterilen harita katmanları (bir resim, harita karoları ya da bir harita servisi): çizim alanının tamamının tek bir resmi olarak, inç başına 150 nokta ile, çizgi çalışmasının altında çizilir; bir haritanın atfı künye şeridine konur. CivilCraft, hâlâ gelmekte olan harita resimleri için en fazla 8 saniye bekler; bazıları hâlâ eksikse durum çubuğu bunu belirtir.

Metin, PDF'in yerleşik Helvetica yazı tipiyle basılır. Batı Avrupa kümesi (Windows-1252) dışındaki karakterler "?" olarak basılır ve durum iletisi bunları sayar.

## Çıktı alınmayanlar

- Kot bantları.
- Boy kesiti görünümü. Boy kesitinin çıktısını almak henüz yapılmadı.
- Birden fazla sayfa (bir eksen için [plan ve boy kesiti sayfaları](topic:plan-profile-sheets) kullanın), görünüm pencereleri, özel künye ya da dikey sayfalar.

:::note
İletişim kutusu, şev oklarının yalnızca ekranda gösterildiğini belirtir. Bu sürümde, **Görüntüleme** altında açık olan şev okları çıktıya alınır (ve DXF'e aktarılır). İstemiyorsanız çıktı almadan önce bunları kapatın.
:::

## Kâğıda basma

İndirilen PDF'i herhangi bir PDF görüntüleyicide açın ve ölçeğin doğru kalması için %100 (gerçek boyut) olarak yazdırın. "Sayfaya sığdır" ölçeği değiştirir.
