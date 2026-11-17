---
title: Enerji hattı tabloları, metrajlar, sayfalar ve GIS
summary: Çekme ve direk tabloları, bir elektronik tablo ya da TakeoffCraft için malzeme metrajları, plan ve boy kesiti sayfaları ile etüt raporu tek bir PDF'te ve her varlığın verisini içeren GIS katmanları.
keywords: çekme tablosu, direk tablosu, metraj, malzeme listesi, takeoffcraft, sayfalar, rapor, pdf, boy kesiti sayfası, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Buradaki her şey Enerji hatları grubunda {{ui:Daha fazla}} altındadır.

| Çıktı | Ne elde edersiniz |
|---|---|
| {{ui:Çekme tabloları…}} | Bölüm bazında, her sıcaklıkta yatay çekme ve her aralığın sarkması; CSV olarak kaydedin. {{ui:Direk tablosunu kaydet (CSV)}}: her direğin rolü, öğesi, zemini, bağlantısı, en büyük yükü, nominali, uygunluğu, önerisi, temeli, salınımı, yukarı kalkması |
| {{ui:Metrajlar…}} | İletken (katener uzunlukları × iletken × devre + atlama hatları ve uç bağlantılar için 2 %), kütüphane öğesine göre direkler ve ekipman, kablo, hendek, kazı, kanallar, ekler. CSV, Excel ya da bir TakeoffCraft metraj dosyası |
| {{ui:Sayfalar ve rapor…}} | Tek bir PDF: plan; seçtiğiniz yük durumlarında iletkenle her hat için bir boy kesiti sayfası ve aralık uzunlukları, sarkmalar ve en düşük açıklıklar şeridi; ayrıca bir etüt raporu (kural seti, bölümler, çekme tabloları, direkler, her denetim) |
| {{ui:GIS'e aktar…}} | Direkler, aralıklar, kablo güzergâhları, ekipman ve engeller; verileriyle (yükseklikler, yükler, sarkmalar, açıklıklar, başarısız olanlar) katmanlar olarak, GeoPackage, shapefile, GeoJSON, KML ya da KMZ biçiminde |

GeoJSON ve KML projenin koordinat sistemini gerektirir ([Koordinat sistemleri](topic:coordinate-systems)); koordinat sistemi olmadan GeoPackage ve shapefile'lar projenin kendi sayılarını taşır.
