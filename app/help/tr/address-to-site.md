---
title: Adresten arsaya
summary: Bir adresi arsa için gereken bilgilere çevirin: parsel, çevresindeki yapılar, imar durumu, zemin ve taşkın bölgesi. Düğmeyle istediğiniz ya da dosya olarak eklediğiniz açık verilerden alın ve BimCraft'a öneri olarak gönderin.
keywords: adres, coğrafi kodlama, arsa, parsel, yapılar, imar, zemin, taşkın, açık veri, openstreetmap, fema, ssurgo, usgs, bağlam, ccsite, bimcraft
from: 125d848a
---

## Ne yapar

Yüzey › Diğer › Adresten arsaya, bir nokta için şunları yanıtlar: noktanın hangi parselde olduğu, çevresindeki yapılar, imar durumu, zemin ve taşkın bölgesi. Veriler açıktır: eklediğiniz dosyalar (GeoJSON, shapefile, KML, GeoPackage) ve eklentileri açtığınızda her biri bir açık hizmete soru soran düğmeler.

## Nasıl kullanılır

1. Bir adres yazın ve adres arama düğmesine basın (eklenti "Adres arama"), ya da enlem ve boylamı yazın.
2. Katman ekleyin: "Dosya ekle" ile dosyalar ya da diğer kaynak düğmeleri (taşkın bölgesi, yapılar, zemin, zemin yüksekliği, ilçe parselleri). Bir hizmet yalnızca düğmesine basıldığında sorgulanır; başlangıçta hiçbir şey indirilmez.
3. Yanıtı metin olarak ve bir CSV ile almak için çalıştır düğmesine basın.
4. "Arsayı dosya olarak kaydet" ya da "BimCraft'a öneri olarak gönder" çizgileri BimCraft ya da ModelCraft'a verir; onlar listeler ve yalnızca işaretlediğiniz şeyleri ekler.

## Dikkat edilecekler

- Adres araması getcadcraft.com üzerinden gider; OpenStreetMap'in Nominatim hizmetine sizin adınıza sorar (en fazla saniyede bir istek; yanıtlar 90 gün saklanır, böylece aynı adres iki kez sorulmaz; yalnızca adresin bir özeti saklanır, kimin sorduğu hiçbir zaman). Diğer düğmeler tarayıcınızdan doğrudan kendi hizmetlerine gider.
- Her kaynağın kendi lisansı vardır (OpenStreetMap ODbL lisanslıdır: atıf satırını koruyun).
- Katmanlar, bulunduğunuz yerdeki açık verilerin kalitesi kadar iyidir. Önemli olanları bir ölçümle karşılaştırın.
