---
title: Bir poligon girin ve pusula kuralıyla düzeltin
summary: Alan açılarını ya da yön açılarını ve uzunlukları yazın, açısal ve doğrusal kapanma hatasını ile hassasiyeti kontrol edin, pusula kuralıyla düzeltin ve istasyonları ölçüm noktası olarak ya da döngüyü parsel olarak ekleyin.
keywords: poligon, kapalı poligon, döngü, sağa açılar, geri nişan, yön açıları, uzunluklar, kapanma, kapanma hatası, hassasiyet, pusula kuralı, bowditch, düzeltme, ölçüm
from: 56ce5a8c
---

Poligon, ölçülen kenarlardan oluşan bir dizidir: her istasyonda bir açı (ya da bir yön açısı) ve sonraki istasyona bir uzunluk bulunur. Hiçbir şey seçili değilken sağ paneldeki **Poligon** altında **Poligon girin** düğmesini tıklayın.

## Nerede başlar ve biter

1. **Başlangıç ölçüm noktası**: noktasının numarası. Ya da bir kuzey ve doğu değeri yazın.
2. **Kenarlar**: **Sağa açılar ve uzunluklar** ya da **Yön açıları ve uzunluklar**.
3. Açılarla çalışıyorsanız bunların nereden başladığını belirtin: bir **Geri nişan ölçüm noktası** ya da **azimutu** (ilk istasyondan geri nişana doğru, kuzeyden saat yönünde).
4. **Bitiş**: **başlangıca geri dön (bir döngü)** ya da **ölçüm noktasında** ve numarası (bilinen noktalar arasında açık bir poligon).

## Kenarları yazın

Her satıra bir kenar: önce açı ya da yön, sonra uzunluk, isterseniz eriştiği istasyonun adı:

- Sağa açılar, kenarın başladığı istasyonda saat yönünde döndürülmüş, arkadaki istasyondan sonrakine: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` ve `270.0028` de olur.
- Yön açıları: `N 45°30'15" E 125.50 B`, ya da tek kelime olarak azimut: `AZ 45-30-15 125.50 B`.
- Açılarla bir döngüde, `close` ile bitirin ve başlangıçtaki açıyı yeniden yazın; son istasyondan ikinciye doğru döndürülmüş olmalı: `close 270°00'05"`. Açıları kontrol eden budur.

Okunamayan satırlar satır numaralarıyla listelenir. "feet", virgüller ve `#` ile başlayan açıklama satırları kabul edilir.

## Kapanmayı okuyun

Yazdıkça iletişim kutusu şunları gösterir:

- **Açısal kapanma hatası**: açıların kapanmaya ne kadar uzak olduğu ve her açının aldığı pay. Kapanış açısı yoksa açılar denetlenmez; açılardaki hatalar doğrusal kapanma hatasında görünür.
- **Doğrusal kapanma hatası**: poligonun sonu olması gereken yerden ne kadar uzakta ve hangi yönde bittiği.
- **Hassasiyet**: poligonun uzunluğunun doğrusal kapanma hatasına bölümü. 1 : 10,000, 10,000 ft'te 1 ft demektir.
- Düzeltmeden sonraki istasyonlar ve her birinin ne kadar hareket ettiği.

## Düzeltme

Önce açısal kapanma hatası açılara eşit olarak dağıtılır. Sonra doğrusal kapanma hatası pusula kuralıyla (Bowditch) kenarlara dağıtılır: her istasyon, oraya ulaşmak için kat edilen uzunluğun oranında kapanma hatasına karşı hareket eder; böylece poligon tam olması gereken yerde biter.

:::note
Pusula kuralı standart bir düzeltmedir, en küçük kareler yöntemi değildir ve açıları uzunluklarla ağırlıklandırmaz. Hassasiyetin yeterli olup olmadığına kendi standartlarınız ve yargı alanınızın kuralları karar verir.
:::

## Sonucu kullanın

- **Ölçüm noktası olarak ekle**: düzeltilmiş istasyonlar, verdiğiniz adlarla ölçüm noktası olur (verilmemişse sıradaki boş numaralarla), açıklama `TRAV`, yükseklik yok. Döngünün son istasyonu başlangıç noktasıdır, bu yüzden iki kez eklenmez. Bir adım: {{key:Mod+Z}} geri alır.
- **Parsel olarak ekle** (döngüler): düzeltilmiş istasyonlar, etiketleri ve yasal tanımıyla bir [parsel](topic:parcels) olur.
- **Rapor (CSV)**: kapanma satırları, ardından her istasyonun yönü, uzunluğu, düzeltilmemiş ve düzeltilmiş koordinatları ile düzeltmeleri.
