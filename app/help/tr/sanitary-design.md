---
title: Pis su tasarım debilerini hesaplayın ve kanalizasyonu denetleyin
summary: Pis su ağının her rögarına giren kişileri ve alanı girin; CivilCraft bunları ağ boyunca toplar, tepe faktörü ve sızmayla tepe debisini hesaplar ve her borunun kapasitesini ve hızını denetler.
keywords: pis su, kanalizasyon, pis su kanalizasyonu, atık su, tasarım debisi, tepe debisi, tepe faktörü, harmon, babbitt, sızma, nüfus, kişi başına, yüzde dolu, kendi kendini temizleme, hız, boru boyutlandırma, tasarım çizelgesi
from: 73ba197a
---

Pis su tasarım debileri, {{ui:Type}} değeri {{ui:Sanitary}} olduğunda [boru ağında](topic:pipe-network) çalışır. Hiçbir şey seçili değilken sağ panel, yağmur suyu ağında yağmur suyu drenajının gösterildiği yerde **Pis su tasarım debilerini** gösterir.

## Giren debiyi girin

1. Bir rögar seçin. **Pis su tasarım debileri** altında, {{ui:People entering here}} ve {{ui:Area entering here}} (metre projede hektar, feet projede akre) girin.
2. Dükkânlar, ofisler ya da sanayi için eşdeğer kişiyi girin: alan çarpı ajansınızın kullandığı hektar (ya da akre) başına kişi. Alan her iki durumda da sızma için sayılır.
3. Bir sokağın ya da bir parselin bağlandığı her rögar için tekrarlayın. Hiçbir şeyin bağlanmadığı bir rögar ikisini de 0'da tutar.

Her boru, üst rögarından ve üstünden giren her şeyi taşır. Üzerinden geçeni görmek için bir rögar seçin.

## Ayarlar

| Ayar | Anlamı |
|---|---|
| {{ui:Flow per person}} | kişi başına günlük ortalama akış: litre (metre projesi) ya da ABD galonu (feet projesi) |
| {{ui:Infiltration}} | sızan yeraltı suyu: hektar başına saniyede litre ya da akre başına günde galon |
| {{ui:Peaking factor}} | Harmon, 1 + 14 / (4 + √P), ya da Babbitt, 5 / P^0.2; P binler cinsinden nüfus |
| {{ui:Peaking factor at least}} / {{ui:Peaking factor at most}} | faktör bu iki değer arasında tutulur |
| {{ui:Manning n}} | kapasite ve hız için |
| {{ui:Least velocity}} / {{ui:Most velocity}} | tepe debisinin kendi borudaki derinliğinde |
| {{ui:Most of full capacity}} | bir boru tepe anında ne kadar dolu çalışabilir, dolu akarken taşıdığının yüzdesi olarak |

Başlangıç değerleri yer tutucudur, bir standart değil. Ajansınızın yayımladığı değerleri kullanın.

## Ne hesaplar

Her boru için, akış sırasına göre:

- tepe debisi = kişi × kişi başına akış × tepe faktörü + alan × sızma
- tam dolu kapasite (borunun eğiminde Manning denklemi) ve tepenin onu ne kadar doldurduğu
- tepe debisinin normal derinliği ve oradaki hız

**Pis su sonuçları** tablosu her borunun kişilerini, tepe faktörünü, tepe debisini (L/sn, ya da gpm ve feet küp/sn), yüzde doluluğu ve hızı listeler. Altında sorunlar listelenir: sınırdan daha dolu bir boru, en küçük hızdan daha yavaş (kendini temizlemeyebilir), en büyüğünden daha hızlı ya da hiç eğimi olmayan. {{ui:Size the pipes for these flows}} her boru için tepesini sınır içinde taşıyan en küçük standart boyutu (200 mm ya da 8 inç ve üstü) seçer; {{key:Mod+Z}} bunu geri alır.

:::note
Bu, bir tasarım çizelgesinin hesapladığı sabit tepe debisidir; basılı yuvarlamasına kadar yayımlanmış bir tasarım çizelgesine karşı kontrol edilmiştir. Zamanla sistemin bir modeli değildir: hidrograf, depolama, pompa ya da taşma yok. Bkz. [Henüz yapılmadı](topic:not-built-yet).
:::

Hızlar, her derinlikte aynı n ile Manning denklemini kullanır. Bazı ajansların kısmi dolu grafikleri n'nin derinlikle değişmesine izin verir; bu, yüzde 60 ile 70 dolu çalışan bir borada hızı biraz düşürür (yaklaşık yüzde 3 daha az).
