---
title: Sorunlar ve BCF
summary: Bir sorunu plana, bir eksen istasyonuna, bir yüzey noktasına ya da bir boruya işaretleyin, ona bir durum ve yorumlar verin ve sorunları LandXML dosyasının yanında BCF 2.1 dosyaları olarak alışverişe verin.
keywords: sorun, sorunlar, bcf, yorum, işaretleme, eksik, kusur, saha, işaret, durum, açık, çözüldü, kapalı, bim işbirliği biçimi, landxml, problemler
from: e44153b1
---

Bir sorun, CivilCraft çiziminizde bir yere işaretlenmiş, bir başlığı, bir durumu ve yorumları olan bir nottur. Saha personeline ya da başka bir programa neye bakmaları gerektiğini bildirmek ve onların yanıtlarını geri okumak için kullanın.

## Sorun ekleme

1. **Yüzey, Diğer, Sorunlar (BCF)...** öğesini açın.
2. Bir başlık yazın ve neyin yanlış olduğunu belirtin.
3. Nereye işaretleneceğini seçin: plan görünümünün merkezi, merkezdeki yüzey noktası, seçili eksenin bir istasyonu (istasyonu ve bir ofset girin; sağ taraf pozitiftir) ya da seçili boru, yapı veya özellik çizgisi.
4. **Sorun ekle** düğmesine basın. İşaret, planda numarasıyla birlikte küçük bir elmas olarak görünür.

Bir sorunun başlığına tıklayarak ona yakınlaştırın, listedeki durumunu değiştirin (Açık, Etkin, Çözüldü, Kapalı) ve yorum ekleyin. Her değişiklik tek bir geri al adımıdır ve sorunlar proje dosyasında kaydedilir.

## Sorunları BCF olarak aktarın

- **BCF dışa aktar**, her sorun için bir konu içeren bir BCF 2.1 dosyası yazar: başlık, durum, yorumlar ve ortogonal bir plan kamerası ile işareti içeren bir görünüm noktası.
- **BCF içe aktar**, bir BCF dosyasını okur (2.0 ve 3.0 dosyaları 2.1 ile uyuştukları ölçüde okunur). Zaten sahip olduğunuz bir guid'e sahip konu, ikinci bir sorun eklemek yerine o sorunu günceller (durum, yeni yorumlar).
- **Sorunlar panelinden**, konumunu belirten Sorunlar panelindeki her açık kayıt için bir sorun oluşturur.

BCF, bu projenin kendi koordinatlarında, kaydırma olmadan metre cinsinden veri taşır. İşaretlerin doğru yere düşmesi için diğer programın LandXML dosyanızla aynı koordinat sisteminde olması gerekir. İşaretin gösterdiği öğe (eksen, istasyon, ofset, boru), "cc:" ile başlayan etiketler olarak taşınır ve CivilCraft bunları geri okur.

## Test edilmeyenler

İşaretler ve görünüm noktaları yalnızca bir dosya yazılıp CivilCraft içinde geri okunarak test edildi. Henüz başka hiçbir BIM programı bunları açmadı. BCF'deki "view to world scale" değerinin görünümün tam mı yoksa yarım mı yüksekliği anlamına geldiği programlar arasında farklılık gösterir: CivilCraft tam yüksekliği yazar.
