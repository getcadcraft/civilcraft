---
title: Bir sahadaki güneşlenme saatlerini hesaplama
summary: Bir gün (veya bir mevsim) ve saat dilimi seçin; her bina kütlesinin her duvarında ve çevresindeki zeminde doğrudan güneş alan saatleri görün; zemin planda çizilir, sayılar CSV olarak alınır.
keywords: güneş, güneş saatleri, gölge, gölgelenme, güneş erişimi, gün ışığı saatleri, cephe, duvar, mevsim, gündönümü, ekinoks, saat dilimi, yaz saati, enlem, boylam, CSV, raster
from: 4e32a314
---

**Güneş saatleri**, seçtiğiniz bir günde veya bir mevsim boyunca ortalama olarak, her bina kütlesinin her duvarına ve çevresindeki zemine ulaşan doğrudan güneş saatlerini sayar. Kütleler ve zemin kendileri gölge düşürür; başka hiçbir şey düşürmez (ağaçlar, çizmediğiniz komşu binalar yok). Doğrudan güneş olmayan gökyüzü ışığı sayılmaz.

## Başlamadan önce

Güneşin konumu, sahanın enlem ve boylamından gelir; bunlar projenin **koordinat sisteminden** alınır. Koordinat sistemi olmayan bir proje bir iletiyle reddedilir: önce bunu ayarlayın (GIS grubundaki **Koordinatlar**). Elle yazılan bir enlem ve boylam bir tahmin olur, bu yüzden bunlar için bir kutu yoktur.

## Hesaplama

**Özellikler** içinde, **Bina kütleleri** altında, **Güneş saatleri**:

1. **Gün** seçin. Bulunduğunuz yerde güneşin en alçak olduğu günle başlar (kuzey yarımkürede 21 Aralık, güney yarımkürede 21 Haziran). Bir mevsim için **Bir mevsim boyunca** kutusunu işaretleyin, **Son gün**ü ve örnekler arasındaki gün sayısını seçin.
2. **Saat dilimi**ni yazın: `America/Mexico_City` gibi bir ad veya `-6` gibi UTC'den bir ofset. Bir ad, o günkü dilimin yaz saati kurallarını izler; yazdığınız bir ofset olduğu gibi kullanılır, bu yüzden o gün geçerli olanı kullanın. Kutunun altındaki satır, bulduğu ofseti size bildirir.
3. Güneşin ne sıklıkla yerleştirileceğini seçin (5, 10, 15 veya 30 dakikada bir), ardından **Güneş saatlerini hesapla**. Bir mevsim arka plan işlemlerinde çalışır; **Durdur** onu iptal eder.

## Elde edecekleriniz

- Kütleye göre bir tablo: **en az güneş alan duvar**, **ortalama** ve **en çok güneş alan duvar**, günde saat cinsinden; ayrıca her duvarın baktığı yönü ve kat kat saatlerini gösteren tüm duvarların tablosu.
- Kütlelerin çevresindeki zemin, planda koyudan (güneş yok) sarıya (bir hücrenin alabileceği en fazla) doğru, bir açıklamayla çizilir. Bir kütlenin altındaki hücreler boş bırakılır. **Zemini planda göster** bunu kapatır.
- **Duvarlar CSV olarak** ve **Zemin CSV olarak** sayıları kaydeder.

Bir mevsim için rakamlar, örneklenen günler üzerinden günlük ortalamadır. Projeye hiçbir şey kaydedilmez: sonuç incelemek içindir ve yeniden çalıştırıldığında yeniden üretilir.

## Bilmeniz iyi olacaklar

- Bir duvar bir anı yalnızca güneşe bakıyorsa ve önünde engel yoksa güneşli sayar. Güneşin tersine bakan bir duvar hiç güneş almaz.
- Zemin, sahanın büyüklüğüne bağlı bir ızgarada örneklenir ve güneşin konumu her zaman adımının ortasında alınır; bu nedenle saatler, seçtiğiniz adım kadar doğrudur.
- Güneşin konumu yayımlanmış bir astronomik formüldür; yaklaşık bir yay dakikası hassasiyetindedir.
