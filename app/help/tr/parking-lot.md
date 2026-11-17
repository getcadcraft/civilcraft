---
title: Otopark düzeni
summary: Bir dış hat içinde park yerlerini, geçitleri, engelli ve minibüs alanlarını ile adaları yerleştirin; otoparkı mevcut zemine göre giderlere eğimle tesviye edin, sonra kaplayın ve dikin. Bir asistan da kullanabilir.
keywords: otopark, park yeri, geçit, engelli, ada, gider, eğim, tesviye, kazı, dolgu, kaplama, parke, dikim, ağaç, arazi, nokta bulutu, mcp, asistan
from: 06c14da9
---

Bir otoparkı bir parsel, platform veya kapalı bir özellik çizgisine yerleştirin; sayıları, tesviyeyi ve kaplamayı tek adımda elde edin.

## Düzeni oluşturma

1. Planda bir parsel, platform veya kapalı bir özellik çizgisi seçin.
2. **Yüzey, Diğer, Otopark düzeni...** seçeneğini açın.
3. Kuralları, park yeri açısını (90, 75, 60, 45, 30 derece veya paralel) ve tek yönlü ya da çift yönlü geçitleri seçin. Park yeri, geçit ve ada ölçüleri tablodan başlar ve her biri üzerine yazılabilir.
4. **Düzeni oluştur**'u seçin.

Sıralar, en çok park yeri veren dış hat kenarı boyunca (ya da yazdığınız açıda) ilerler. Bir park yeri, yalnızca tamamen dış hattın içinde kalırsa sayılır. Bir sıra ve bir geçit için yer kalırsa, tek yüklü bir şerit eklenir. İletişim kutusu alanları, engelli ve minibüs alanlarını, adaları, giderleri ve alan başına düşen alanı listeler; planda park yerleri, taralı erişim geçitleriyle engelli alanları, adalar, geçit orta çizgileri ve giderler kendi katmanlarında (C-PARK-...) gösterilir; böylece PDF, DXF ve DWG'ye aktarılırlar.

## Engelli alanları

Amerika Birleşik Devletleri kurallarında sayı, sağlanan alanlar için 2010 ADA Standartları tablo 208.2'yi izler (altıda bir, yukarı yuvarlanarak, minibüs alanıdır). Alanlar dış hattın ilk köşesine (girişe) en yakın yere yerleştirilir ve her birinde bir erişim geçidi bulunur; iki alan bir geçidi paylaşabilir. Engelli genişliğinden dar bir park yeri ya da engelli alanlarında 1:48'den dik bir eğim, sorun olarak gösterilir. **Bu sayılar standarttan hatırlanarak yazılmıştır ve basılı standartla kontrol edilmemiştir.** Tipik park yeri ve geçit ölçüleri de otopark tasarım kılavuzlarından alınmıştır ve onlar da kontrol edilmemiştir. Bunlara güvenmeden önce ikisini ve yerel yönetmeliğinizi kontrol edin. Kendi engelli sayınızı girmek için **Özel**'i seçin.

## Giderlere eğim, kazı ve dolgu

Kapatmadığınız sürece otopark, Peyzaj çalışma alanında bir tesviye alanına dönüşür. Giderler, yaklaşık her 100 feet (30 m) bir geçit orta çizgisine yerleştirilir; yüzey, her giderden verdiğiniz eğimde yükselir (başlangıçta %1.5), böylece her nokta en yakın gidere doğru iner. Seviye, otoparkın kazı ve dolgusu mevcut zeminde dengelenecek şekilde seçilir. Mevcut zemin, projenin mevcut yüzeyidir; bu yüzey ölçüm noktalarından, LandXML'den, bir lidar ya da tarama nokta bulutundan yüzeye dönüştürülmüş olarak ya da kot eğrilerinden gelebilir. İletişim kutusu kazı ve dolgu tahminini gösterir; projenin kendi hacimleri daha sonra kesin rakamı gösterir. Tesviye alanı kenarını mevcut zeminde tutar; bu yüzden yeni yüzey kenardaki zeminden farklıysa bir basamak oluşur ve iletişim kutusu bunun ne kadar büyük olduğunu söyler.

## Kaplama ve dikim

Tüm dış hat parke kaplaması alır (Peyzaj, Sert peyzaj altında değiştirebileceğiniz bir yatay örgü deseni) ve her ada, bitki listesinden alınan bir çalı yatağı ve yeterince genişse bir ağaç alır. Bundan sonra her şey olağan bir Peyzaj nesnesidir: düzenleyin ya da otoparkın yaptığını değiştirmek için **Düzeni yeniden oluştur**'u seçin. Otoparkı kaldırmak, onun yaptığını da kaldırır.

## Bir asistandan

Aynı otopark MCP üzerinden istenebilir: `parking_layout` önizler, `parking_build` yazar, `parking_remove` bir otoparkı kaldırır. Parsel adıyla isteyin ya da dış hattı gönderin.

## Henüz yapılmayanlar

Geçitlerin bir sokağa ulaşıp ulaşmadığı kontrol edilmez. Kaplama tüm dış hattı kapsar, bu yüzden alanı adaları da içerir. Kütüphaneden kaplama malzemesi seçimleri ve park yerleri için bir kütüphane türü henüz yapılmadı; kaplama deseni Sert peyzaj desenidir. Başka ülkelerin kuralları henüz yapılmadı.
