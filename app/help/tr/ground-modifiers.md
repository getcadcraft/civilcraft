---
title: Zemin düzenleyicileri ve canlı kotlar
summary: Önerilen zemini tek bir sıralı listede şekillendiren her şey (çakıştıklarında sonradan gelen geçerli olur), düzenleyici başına kazı ve dolgu, Sorunlar panelindeki birleşim denetimleri ile zemini canlı okuyan nokta kotları ve eğim okları.
keywords: zemin düzenleyicileri, yığın, sıra, önerilen zemin, mevcut zemin, çakışma, kazı ve dolgu, birleşim, istinat duvarı, döşeme kenarı, yatak kotu, basamak sahanlığı, nokta kotu, nokta yüksekliği, eğim oku, eğim etiketi, düşüm
from: 3998a5b0
---

Önerilen zemin = mevcut zemin + düzenleyiciler, sırayla. Mevcut zemin hiçbir zaman değiştirilmez.

## Liste

{{ui:Kotlar}} › {{ui:Zemin düzenleyicileri…}} zemini şekillendiren her nesneyi listeler: platformlar, bermler, çukur hendekler, tesviye alanları, kaplama ve yaya yolları, bitmiş kotu olan bitkilendirilmiş alanlar ile **Zemini şekillendirir** kutusu işaretli basamaklar ve rampalar (alt ve üst kotlarıyla birlikte). İki nesne çakışıyorsa **sonraki** geçerli olur. Bir satırı sürükleyin veya okları kullanarak sırayı değiştirin; zemin hemen yeniden oluşturulur. Her satır, üstündeki nesnelerden sonra şekillendirdiği kazı ve dolguyu gösterir; toplam listenin altındadır.

## Birleşim denetimleri

Sorunlar paneli, **Git** ile birlikte şunları listeler:

- yüksek tarafı üst kotunun üstünde olan (duvarın üzerinde toprak) veya alçak tarafı temelini gösteren bir duvar;
- bitkilendirilmiş alanın bitmiş kotu, buluştuğu kaplama kenarının üstünde olan veya ondan tipik 150 mm'den fazla aşağıda olan alan;
- alt veya üst kotu, indikleri kaplamaya uymayan basamaklar;
- çakışan iki düzenleyici (orada sonraki geçerli olur).

Bir istinat duvarının üst kotu, zeminin yüksek tarafını izleyebilir: zemin her değiştiğinde yüksekliği yeniden hesaplanır.

## Zemini şekillendiren istinat duvarı

Bir istinat duvarını seçin ve **Zemini şekillendirir** kutusunu işaretleyin. Duvarın altındaki şerit (duvar kalınlığı kadar geniş) bir düzenleyici olarak listeye katılır:

- **yüksek taraftaki** kenar, orada zeminde istasyon istasyon tutulur; böylece duvarın üstü yüksek tarafı izler (üstündeki kapak taşıyla birlikte). Bir **Üst** kotu yazarsanız, yüksek tarafı bunun yerine kapak taşı düşülmüş bu kotta tutar;
- **alçak taraftaki** kenar, yazdığınız **Alçak tarafta tutulan zemin** kotunda tutulur; boş bırakılırsa orada zeminde tutulur;
- yüksek taraf, tüm duvar boyunca zeminin daha yüksek olduğu taraftır; bu yüzden duvar boyunca hiç yer değiştirmez;
- şeridin ötesindeki zemin değiştirilmez; mevcut zemin hiçbir zaman değiştirilmez.

Diğer her düzenleyici gibi listede yer alır ve sonrasında listelenen bir düzenleyici çakıştıkları yerde geçerli olur. Bir ucundaki tutulan kotu, oradaki mevcut zeminden tipik 150 mm'den fazla uzak olan bir duvar, Sorunlar panelinde (**Git** ile) uyarı alır. Serbest duvar zemini şekillendirmez. Kutu, önceki sürümlerden gelen dosyalarda kapalıdır; bu yüzden bu dosyalar eski haliyle açılır.

## Nokta kotları ve eğim okları

{{ui:Nokta kotu}} (tek tıklama) ve {{ui:Eğim oku}} (iki tıklama) her çizildiklerinde zemini okur: bir nesneyi taşırsanız veya yeniden kotlandırırsanız etiketler izler. Özellikler'de bir etiketin önerilen mi mevcut zemini mi okuyacağını seçin; mevcut zemin etiketleri köşeli parantez içinde gösterilir. Oklar yokuş aşağıyı gösterir ve `1:20 (5.0 %)` yazar.
