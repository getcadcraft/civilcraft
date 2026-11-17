---
title: Başlangıç değerleri ve yer tutucular
summary: CivilCraft'ın başladığı her değer: yeni projeler, görüntü, eksenler, platformlar, koridorlar, boru ağları, hacimler ve çıktı için; ve yerine konulması gereken yer tutucuların hangileri olduğu.
keywords: varsayılanlar, ayarlar, başlangıç değerleri, yer tutucular, tasarım kriterleri, standartlar, kurallar, varsayımlar
from: fbfc7432
---

CivilCraft'ın bir ayarlar iletişim kutusu veya şablonu yoktur. Bunlar, şeylerin başladığı değerlerdir. **Yer tutucu** olarak işaretlenen değerler herhangi bir standarttan alınmamıştır: bir kontrole veya bir miktara güvenmeden önce bunları projenizin kriterleriyle değiştirin.

## Yeni proje

| Ayar | Değer |
|---|---|
| Ad | Adsız saha (ilk nokta dosyasının adı onun yerine geçer) |
| Birimler | ABD feet |
| Yüzey adı | Mevcut zemin |
| Nokta grupları | Her grup {{ui:Noktalar}} olarak başlar |
| En uzun dış kenar | 0 (her üçgeni tut) |
| Tutulan geri alma adımları | 200 |

## Görüntü

| Ayar | Değer |
|---|---|
| Yüzey | {{ui:Mevcut zemin}} |
| Kontur aralığı | 1 (ft veya m) |
| Ana kontur aralığı | 5. kontur |
| Bantlar | 8 |
| Açık | Konturlar, Kontur etiketleri, Noktalar, Kırılma çizgileri, Yüzey kenarı, Borular |
| Kapalı | Üçgenler, Kot bantları, Şev okları, Nokta etiketleri |

## Eksenler ve boy kesitleri

| Ayar | Değer |
|---|---|
| Ad | Eksen 1, Eksen 2 … |
| Başlangıç istasyonu | 0+00 |
| Her iç PI'de eğri yarıçapı | 100 ft veya 30 m; her tanjantın yarısına sığmazsa daha küçük |
| Tasarım boy kesiti | Bir tane başlatana kadar yok; {{ui:Zeminden başlat}} her iki uca zemin üzerinde bir PVI koyar |
| Düşey eğri uzunluğu | Bir tane yazılana kadar 0 (eğri yok) |

## Platformlar

| Ayar | Değer |
|---|---|
| Ad | Platform 1, Platform 2 … |
| Kot | Platformun ortasındaki zemin, 0.1'e yuvarlanmış (orta yüzeyin dışındaysa 0) |
| Yarma şevi | 2 : 1 (yer tutucu) |
| Dolgu şevi | 3 : 1 (yer tutucu) |

## Koridor düzeneği (yer tutucular)

| Ayar | ABD feet | Metre |
|---|---|---|
| Şerit genişliği | 12 ft | 3.6 m |
| Şerit eğimi | 2% | 2% |
| Bankuet genişliği | 4 ft | 1.2 m |
| Bankuet eğimi | 4% | 4% |
| Yarma şevi | 2 : 1 | 2 : 1 |
| Dolgu şevi | 3 : 1 | 3 : 1 |
| Her kesit aralığı | 10 ft | 5 m |

## Boru ağı

| Ayar | ABD feet | Metre |
|---|---|---|
| Ad ve tür | Yağmur suyu, yağmur suyu | Yağmur suyu, yağmur suyu |
| En küçük eğim (yer tutucu) | 0.50% | 0.50% |
| En az örtü (yer tutucu) | 2 ft | 0.6 m |
| Yapılardaki düşüş (yer tutucu) | 0.10 ft | 0.03 m |
| Yeni yapı çapı | 48 in | 1200 mm |
| Yeni boru çapı | 12 in | 300 mm |
| Çukur derinliği | 0 | 0 |
| Kapak | Yüzeyden | Yüzeyden |

LandXML'den açılan bir boru ağı da bu kuralları kullanır, çünkü LandXML bunları taşımaz.

## Hacimler

| Ayar | Değer |
|---|---|
| Yöntem | Izgara; yarma-dolgu sınırı çizgilerinin içinde hücre merkezlerinden örneklenir |
| Hücre boyutu | Tesviye edilen alanın sınırlayıcı dikdörtgeninde yaklaşık 250.000 hücre olacak şekilde seçilir (on'un bir kuvvetinin 1, 2 veya 5 katı) |
| Şişme ve büzülme | Yok |

## Çıktı

| Ayar | Değer |
|---|---|
| Alan | {{ui:Her şey}} |
| Kâğıt | Tabloid 11 × 17 in (feet projeleri), ISO A3 (metre projeleri); her zaman yatay |
| Ölçek | Sığan en büyük listelenmiş ölçek |
| Mürekkep | {{ui:Katman renkleri}} |

DXF etiketleri, her şeyin Tabloid (feet) veya A3 (metre) üzerine sığdığı ölçek için boyutlandırılır.
