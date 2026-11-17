---
title: Bir bahçeyi baştan sona tasarlayın
summary: Peyzaj mimarının on adımı; arazi ölçümünden yayım takımına kadar. Her adım için Peyzaj çalışma alanının bugün ne yaptığı ve henüz ne yapmadığıyla.
keywords: eğitim, adım adım, nasıl yapılır, peyzaj tasarımı, bahçe tasarımı, başlangıç, örnek, adım adım, arazi ölçümü, çizgi işi, zemin, bitkilendirme, liste, sayfalar, yayım, tek proje
from: 87900bf5
---

Bir peyzaj tasarımı döngüsel ilerler: arazi ölçümü, eskiz, çizgi işi, zemin, alanlar, kotlar, bitkilendirme, listeler, sayfalar ve sonra yeniden başa dönülür. İşte on adım ve her biri için var olanlar. Bir adımda eksik bir şey varsa, bu eksik sonundaki **Henüz yapılmadı** bölümünde belirtilir; adımın içinde gizlenmez.

Örnek sahada ya da kendi arazi ölçüm çiziminizde takip edebilirsiniz. Kendi çiziminizle çalışıyorsanız 1. adımdan başlayın.

## 1. Arazi ölçümünü içe aktarın

{{ui:Yüzey}} › {{ui:Bir çizimden çizgi işi…}}, ölçüm çizimini seçin (DWG 2000–2018 ya da DXF). Birimleri denetleyin; yüzey için eşyükselti eğrilerini, 3B polilinleri ve sınırı, nokta bloklarını da ölçüm noktaları olarak alın. **Ölçüm kotları ve denetimi** bölümü, metin olarak ya da öznitelik olarak yazılmış kotları okur ve bir şey eklemeden önce neyin yanlış göründüğünü listeler (birimler, koordinat sistemi, sıfırdan uzaklık, düz eşyükselti eğrileri, tuhaf kotlar, çift noktalar). Bkz. [İçe aktarırken ölçüm çizimini denetleyin](topic:survey-check) ve [DWG ya da DXF'i çizgi işi olarak açın](topic:open-dwg-dxf). Koordinat sistemini {{ui:Koordinat sistemi…}} ile ayarlayın.

## 2. El eskizleri

Kağıt üzerindeki bir sayfa, örneğin eski bir ölçüm ya da işaretlenmiş bir baskı, {{ui:Tara…}} (Taramadan başlat) ile gelir: planın altında ölçekli ya da bilinen koordinatlarda yerleştirilir ve çizgi işine izlenebilir. ModelCraft bir el eskizinin fotoğrafını okur (Dosya › Eskiz fotoğrafı içe aktar…). CivilCraft'ın kendisinde el eskizi için bir araç yoktur: sayfayı planın altına yerleştirin ve üzerinden çizin.

## 3. Eskizden çizgi işine

Ölçümün üzerinde CivilCraft'ta arazi çizgileri ve dış hatlar çizin ya da 2B çizimde çizin. Peyzaj › Daha fazla › {{ui:Bir çizgiden}}, bir çizgiyi sert zemine, ekili alana, duvara, basamaklara, arazi çizgisine ve daha fazlasına dönüştürür; bağlı kalır: çizgiyi taşırsanız nesne de izler. Bkz. [Çizgi işinden nesneler](topic:objects-from-lines). SuperCad Studio'da sahayı, çizimi ve yapı modelini tek bir projede açın: **Peyzaj** çalışma alanı üçünün de araçlarını içerir ve 2B çizimde seçilen bir çizgi, onu izleyen bir peyzaj nesnesine dönüşebilir (Ctrl+K, {{ui:Seçilen çizim çizgisinden peyzaj nesnesi}}).

## 4. Önerilen zemin

{{ui:Yüzey}} › {{ui:Daha fazla}} › {{ui:Peyzaj çalışma alanı}}'nı açın. Önerilen zemini {{ui:Platform}}, {{ui:Berm}}, {{ui:Çukur hendek}} ve tesviye alanlarıyla, nokta kotları ve eşyükselti eğrileriyle oluşturun; eklediğiniz kaplama, yollar, duvarlar, rampalar ve basamaklar aynı önerilen yüzeye tesviye edilir. Mevcut zemin asla değişmez. {{ui:Kotlar}} › {{ui:Zemin düzenleyicileri…}}, zemini şekillendiren her şeyi tek bir sırada, her biri için kazı ve dolguyla listeler. Bkz. [Tesviye](topic:landscape-grading) ve [Zemin düzenleyicileri ve canlı kotlar](topic:ground-modifiers).

## 5. Kaplama ve ekili alanlar

{{ui:Sert zemin}} › {{ui:Kaplama}}, {{ui:Yol (patika)}}, {{ui:Duvar}}, {{ui:Bordür}}, {{ui:Rampa}} ve {{ui:Basamaklar}}. {{ui:Alanlar}}, çim, yatak, çayır ya da örtü bitkisini katmanıyla birlikte çizer; kendini kaplama, duvar ve basamakların çevresinde kırpar. {{ui:Yatak}}, bitkilerin aralığında, bir bitki karışımından alanı doldurur. Bkz. [Sert zemin](topic:hardscape), [Ekili alanlar](topic:planted-areas) ve [Bitkilendirme](topic:planting).

## 6. Kotlar, eğimler ve birleşimler

**Tesviye denetimleri** altında **Eğim analizi** ve **Akış okları ve su birikmesi** seçeneklerini işaretleyin. Su bir teras karşısında birikiyorsa, etrafına bir {{ui:Çukur hendek}} ekleyin. Özellikler, basamakların kaç basamak gerektirdiğini ve sığıp sığmadığını, bir yolun sınırından daha dik olduğu yerleri söyler. Sorunlar paneli, nesnelerin kötü birleştiği yerleri listeler: aşırı yükselmiş bir duvar, kaplamanın üstündeki bir yatak, sahanlığı ıskalayan basamaklar. {{ui:Nokta kotu}} ve {{ui:Eğim oku}} zemini etiketler ve kendini günceller.

## 7. Bitkilendirme

**Bitkiler** bölümünde bitki listesinde arayın (birkaç yüz tür ya da kendi listeniz), birini seçin ve {{ui:Bitki}}, {{ui:Yatak}} ya da {{ui:Çit}} öğesini uygulayın. Bitkinin boyutunu ve etiketlerini Daha fazla'dan ayarlayın. Daha fazla › {{ui:Bitki tablosu}} kendi kayıtlarınızı düzenler: çeşitler, tedarik edilen boyutlar, yoğunluk, şartname notları. Her kayıt kendi sembolünü ve 3B modelini (OBJ, STL ya da GLB) taşıyabilir; Daha fazla › {{ui:Bitki grafikleri}} ise daha kaba ölçeklerde bitkileri daha basit çizer. Bkz. [Bitki listesi](topic:plant-list), [Bitki kayıtları](topic:plant-records) ve [Bitki grafikleri](topic:plant-graphics).

## 8. Miktarlar ve listeler

Daha fazla › {{ui:Çalışma sayfaları}}: bitki ve sert zemin listeleri ile sizinkiler nesnelere bağlı kalır; bunları CSV ya da XLSX olarak kaydedin ya da sayfalara koyun (bkz. [Çalışma sayfaları](topic:worksheets)). Daha fazla › {{ui:Bitki listesi…}}, sayıları TakeoffCraft'a gönderir. Sert zemin miktarları kaplama, duvar ve basamakların Özelliklerinde yer alır. Sulamanın kendi malzeme listesi vardır: {{ui:Sulama}} › **Sistemi denetleyin…**. Bkz. [Sulama](topic:irrigation).

## 9. Çizimler ve sayfalar

Daha fazla › {{ui:Peyzaj sayfaları…}}: dikim, tesviye ve sulama planları, detaylarıyla birlikte. {{ui:Kotlar}} › {{ui:Kesit çizgisi}}, zemin, duvarlar, katmanlar, basamaklar ve bitkiler boyunca kesitler çizer. Bkz. [Peyzaj sayfaları](topic:landscape-sheets) ve [Kesitler ve yayım takımı](topic:landscape-sections).

## 10. Yayımlayın

Sayfalar iletişim kutusundaki {{ui:Yayım takımı (.zip)}}, bir sayfa listesi ve sayfa başına bir DWG içeren tek bir PDF oluşturur. Daha fazla › {{ui:Peyzaj IFC'sini dışa aktar}}, bitkileri ve sert zemini BimCraft'a verir. Projeyi kaydedin: her şey tek dosyadadır.

## Bir şeyi değiştirin: merdiven

Her şeyi tek bir projede tutmanın amacı, bir değişikliğin tüm yapıya yayılmasıdır. Bunu iki teras arasındaki bir basamak takımıyla deneyin:

1. Basamak takımının çizgisini bir arazi çizgisi (ya da çizimde bir çizgi) olarak çizin, sonra Peyzaj › Daha fazla › {{ui:Bir çizgiden}} › {{ui:Basamaklar}}. Basamakların Özelliklerinde **Zemini biçimlendirir** seçeneğini işaretleyin ve alt ile üst kotları iki terasa ayarlayın.
2. {{ui:Alanlar}} ile basamak takımının yanına ve altına bir ekili yatak çizin; teraslara kaplama koyun. Yatak basamakların ve kaplamanın çevresinde kendini kırpar; bitki listesi yalnızca dikilmiş olanı sayar.
3. Özelliklerde basamak takımının üst kotunu yükseltin. Önerilen zemin, nokta kotları, eğim okları ve kazı-dolgu bir anda değişir. Basamak takımı üst terasa artık ulaşmıyorsa, Sorunlar paneli ne kadar olduğunu söyler.
4. Basamak takımının çizgisini taşıyın. Basamaklar kendi çizgilerini aynı geri al adımında izler; yatak yeniden kırpılır ve yeniden sayılır; çalışma sayfaları ve listeler yeni sayıları gösterir.
5. Ctrl+Z'ye bir kez basın: çizgi, basamaklar, zemin ve yatak birlikte geri döner.

Bkz. [Zemin düzenleyicileri ve canlı kotlar](topic:ground-modifiers), [Ekili alanlar](topic:planted-areas) ve [Çalışma sayfaları](topic:worksheets).

## Henüz yapılmadı

Bunlar istenen ama bu sürümde bulunmayan şeylerdir:

- Zemini biçimlendiren duvarlar (zeminle nerede buluştuklarını bildirir ve üst kotları ona uyabilir).
- Uygulama içinde kendi Kütüphane bitki listenizi düzenleme (proje listesini düzenleyip bir bitki dosyası olarak kaydedin).
- Kendi GLB bitki modellerinizin dokuları ve renkleri (şekil okunur; bitkinin rengi kullanılır).

Her araç için bkz. [Peyzaj çalışma alanı](topic:landscape).
