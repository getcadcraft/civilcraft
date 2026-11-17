---
title: Sehim ve çekme
summary: Yük durumlarınız (sıcaklık, rüzgar, buz) ve çekme sınırları, CivilCraft'ın her kesitin çekmesini nasıl hesapladığı ve çekme tabloları.
keywords: sehim, çekme, yük durumu, sıcaklık, rüzgar, buz, asimetrik buz, belirleyici açıklık, eşdeğer açıklık, hal değişimi, katener, çekme tablosu, kırılma dayanımı, günlük gerilme
from: f8876c35
---

## Yük durumları ve sınırlar

{{ui:More}} › {{ui:Load cases and limits…}} projedeki her hattın izlediği kuralları düzenler.

- **Yük durumları**: bir sıcaklık, iletken üzerinde bir rüzgar basıncı (Pa) ve radyal buz (mm, yoğunluğuyla birlikte). İlk durum referanstır.
- **Çekme sınırları**: iletkenin kırılma dayanımının bir payı, yatay çekme üzerinde ya da bir mesnette en büyük çekme üzerinde, tek bir yük durumunda. Ya da yatay çekmeyi kendiniz verin.
- **Boşluklar**: iletkenin zemin, bir yol, bir bina vb. üzerinde bıraktığı boşluk. Ekleyin, yeniden adlandırın ve kaldırın: onlar sizindir. Altlarında, **Hat altındaki peyzaj bitkileri**, **Hat altındaki peyzaj duvarları** ve **Yeraltı geçişleri** için kuralları seçin.
- **Denetimlerin kullandığı durumlar**: en büyük sehimi veren durum (sıcak), izolatör salınımı (rüzgar), buz ve bir mesnedin bir tarafındaki buz.
- **Faktörler**: faz aralığı faktörü k, en büyük izolatör salınımı, mesnet ve bağlantı yüklerine bir faktör, açılı ve sonlandırma mesnetlerini yapan dönüş açıları, gömülü kablolar üzerindeki en az örtü, en büyük gerilim düşümü.

## Paketler: bir ülke için kurallar ve kütüphane

Hiçbir ülkenin kuralı CivilCraft'a gömülü değildir. Bir **paket**, bir kural kümesini ve bir kütüphaneyi tek bir dosyada (`.cclinepack.json`) tutar; bir ülke, bir şebeke işletmecisi ya da bir şirket için:

- {{ui:Load cases and limits…}} içindeki **Paket olarak farklı kaydet…** gösterilen kural kümesini ve kütüphanenizi (ya da kütüphanenizde henüz bir şey yoksa bu projenin kullandığı öğeleri) yazar. Önce **Ülke ya da bölge**yi yazın.
- **Kural kümesi ya da paket aç…** bir paketi, bir kural dosyasını ya da bir kütüphane dosyasını okur. Bir paketin kuralları iletişim kutusunda gösterilir (kullanmak için **Uygula**'ya tıklayın) ve öğeleri kütüphanenize girer.
- Başkalarının paylaştığı paketler, eklentiler sayfasında **Enerji hattı paketleri** altında listelenir. İki örnek paket biçimi gösterir; bunlar hiçbir ülkenin kuralı değildir.

Açıldığında her paket, herhangi bir dosya gibi denetlenir. Bir şey inşa edilmeden önce her değeri geçerli standarda göre kontrol edin.

Başlamak için iki örnek kural kümesi vardır: **Örnek: soğuk iklim** ve **Örnek: ılıman iklim**. Sayıları hiçbir standarttan gelmez: değerleri standardınızın verdiği değerlere ayarlayın. {{ui:Save rules}} ve {{ui:Open rules…}} bir kural kümesini dosya olarak paylaşır.

## Çekme nasıl hesaplanır

Ölü uçlar arasındaki her kesit için:

1. **Belirleyici açıklık**, açıklıklarının √(ΣL³ ÷ ΣL) değeridir.
2. Her sınır, belirleyici açıklık üzerinde **hal değişimi denklemi** aracılığıyla referans durumda yatay bir çekmeye dönüştürülür: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. En kısıtlayıcı olan çekmeyi belirler.
3. Her yük durumunun çekmesi bundan izler ve her açıklığın şekli, iki bağlantı noktasından geçen tam **katener**dir (eğimdeki açıklıklar dahil): kiriş üzerinden sehim, uzunluk ve her iki uçtaki çekme.

Bir durumdaki metre başına yük: ağırlık artı buz (buz alanı × yoğunluk × g) düşeyde; rüzgar basıncı × buzlu çap yatayda.

## Çekme tabloları

{{ui:More}} › {{ui:Stringing tables…}} her kesit için, kuralların her sıcaklığında yatay çekmeyi ve her açıklığın sehimini listeler (başlangıçta −5 °C ile 40 °C arasında 5 °C aralıklarla), durgun havada. Bunları ve destek tablosunu CSV olarak kaydedin.

Sayılmayanlar: yıllar boyunca iletkenin sürünmesi ve yeni bir iletkenin uzaması. Bunları gerdiğiniz sıcaklıklar üzerinden ekleyin.
