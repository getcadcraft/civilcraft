---
title: GIS için as-built verilerini dışa aktarma
summary: Ölçü noktalarını, konturları, eksenleri, platformları, boruları ve yapıları bir belediye veya ilçe GIS birimine shapefile, GeoPackage, GeoJSON veya KML olarak, projenin koordinat sistemindeki ızgara koordinatlarında aktarın.
keywords: gis, dışa aktar, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, borular, yapılar, altyapı, belediye, ilçe, ızgara, zemin, epsg, prj
from: bba4fea5
---

Birçok belediye ve ilçe, proje kapandığında GIS biçiminde as-built verileri ister: boruların ve yapıların nereye yerleştirildiği, nihai tesviye kotları, yol ekseni. **GIS › Dışa aktar** CivilCraft'ın tuttuğu her şeyi, nesne türü başına bir tane olmak üzere GIS katmanları olarak yazar.

## Dışa aktarmadan önce

1. Projenin koordinat sistemini {{ui:Coordinates}} içinde ayarlayın. Bir GIS birimi sayıların nerede olduğunu bilmek zorundadır; sistem olmadan dosyalar projenin kendi sayılarını taşır ve hiçbir ad vermez.
2. Yüzeyi, eksenleri, platformları ve boru ağını teslim etmek istediğiniz biçimde kontrol edin.
3. Birimden hangi biçimi ve hangi koordinat sistemini istediklerini sorun. Birçoğu hâlâ yerel eyalet düzlem bölgesinde shapefile ister; daha yeni sistemler GeoPackage kabul eder.

## Dışa aktarma

1. **GIS** grubunda {{ui:Export}} düğmesine tıklayın.
2. **Ne** altında, gönderilecek türleri işaretleyin. Her biri kaç özelliğe sahip olduğunu gösterir; henüz bir şeyi olmayan türler soluk görünür.
3. **Biçim** altında biçimi seçin.
4. Koordinat ve birimlerle ilgili notları okuyun, sonra indirme düğmesine tıklayın. Durum satırı neyin dahil edildiğini ve kısaltılmış alan adlarını söyler.

İletişim kutusunda ayrıca kot ızgarası dışa aktarımı da bulunur ({{ui:Surface as a GeoTIFF elevation grid}}); bkz. [Kot ızgaraları ve LiDAR](topic:elevation-grids-and-lidar).

## Her tür neyi içerir

| Tür | Şekil | Alanlar |
|---|---|---|
| Ölçüm noktaları | Yükseklikli noktalar | `P` nokta numarası, `N` kuzey, `E` doğu, `Z` yükseklik, `D` tanım |
| Mevcut zeminin, tesviye edilmiş yüzeyin konturları | Yüksekliklerinde çizgiler | `ELEV` |
| Kırılma çizgileri | Yükseklikli çizgiler | `NAME` |
| Yüzey sınırı | Çokgen (çizilen sınır, yoksa yüzeyin kenarı) | `NAME` |
| Eksenler | Eksen çizgileri | `NAME`, `LENGTH`, `STA_START`, `STA_END` (istasyonlar düz sayı olarak) |
| Platformlar | Platform kotunda çokgenler | `NAME`, `ELEV`, `AREA` |
| Yarma-dolgu sınırları | Yükseklikli çizgiler (platformlar ve koridorlar) | `NAME` |
| Koridor özellik çizgileri | Yükseklikli çizgiler: eksen, kaplama kenarları, bankuetler | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Borular | Üst iç taban kotundan alt iç taban kotuna çizgiler | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (yüzde), `LENGTH`, `NETWORK` |
| Yapılar | Ağız kotunda noktalar | `NAME`, `RIM`, `INVERT` (oradaki en düşük boru iç taban kotu), `SUMP`, `DIA`, `DIA_UNIT` |
| Her GIS katmanı | İçe aktarıldığı gibi | Kendi alanları |

Uzunluklar, istasyonlar ve kotlar projenin birimlerindedir (ABD araştırma feet'i veya metre). Boru ve yapı çapları feet projelerinde inç, metre projelerinde milimetredir; `DIA_UNIT` hangisi olduğunu söyler.

## Biçimler

- **Shapefile**: her tür için bir shapefile içeren tek bir `.zip` (`.shp`, `.shx`, `.dbf`), metnin UTF-8 olduğunu belirten bir `.cpg` ve koordinat sistemini adlandıran bir `.prj`. Yükseklikli şekiller shapefile'ın Z türleri olarak yazılır. Biçimin gerektirdiği gibi 10 karakterden uzun alan adları kısaltılır; durum satırı bunları listeler.
- **GeoPackage**: her tür için bir tablo içeren tek bir `.gpkg` dosyası; koordinat sistemi EPSG koduyla saklanır. Birçok dosya yerine tek dosya; uzun alan adları korunur.
- **KML** veya **KMZ** (zipli KML): Google Earth ve web haritaları için enlem ve boylam içeren tek bir dosya; her tür için bir klasör, her özellik NAME alanından adlandırılmış bir işaret olarak ve her alan genişletilmiş veri olarak; yükseklikler metre cinsinden (yükseklik modu mutlak). GeoJSON gibi, projenin koordinat sistemini gerektirir.
- **GeoJSON**: enlem ve boylam içeren tek bir dosya (GeoJSON standardı başka bir şeye izin vermez); her özellik, alıcının ayırabilmesi için bir `kind` özelliği (`pipes`, `structures`, …) taşır. Yükseklikler standardın istediği gibi metreye çevrilir; projenizin dikey datumunda kalırlar (CivilCraft bir jeoit modeli içermez). Koordinat sistemi olmayan bir proje GeoJSON dışa aktaramaz; iletişim kutusu nedenini söyler.

## Zemin değil, ızgara

GIS birimleri verilerini bir koordinat sisteminin **ızgara** koordinatlarında tutar. Projeniz zemin veya yerel koordinatlar kullanıyorsa ({{ui:Coordinates}} içinde ayarlanır), her koordinat dışarı çıkarken ızgaraya geri çevrilir: dosyalardaki sayılar plandakilerden ölçek faktörünüz kadar farklıdır (ve yerel bir sistemse dönme kadar). `N` ve `E` nokta alanları da ızgara değerlerini tutar. İletişim kutusu bunu size hatırlatır.

:::tip
Dosyalarla birlikte kısa bir not gönderin: koordinat sistemi ve EPSG kodu, kotlarınızın dikey datumu, birimler ve her dosyanın ne olduğu.
:::

## Neler kontrol edildi

- Yazılan her dosya, çoğu GIS programının bu dosyaları okumak için kullandığı kütüphane olan GDAL ile geri okundu: her şekil, yükseklik ve öznitelik, özellik sayıları ve koordinat sistemi EPSG kodu olarak (`.prj` ve GeoPackage). Kendi okuyucularımız da aynı şekilde geri okudu.
- GeoJSON dosyaları RFC 7946'yı izler: boylam enlemden önce, `crs` üyesi yok, dış halkalar saat yönünün tersine, delikler saat yönünde; konumlar PROJ ile 2 mm'ye kadar eşleşti.
- Zemin koordinatlı bir proje dışa aktarıldı ve her nokta ızgara koordinatlarıyla kontrol edildi.
- Burada anlatılanların hiçbiri henüz başka GIS programlarında açılmadı. Güvenmeden önce ilk teslimatı birimle birlikte kontrol edin.
