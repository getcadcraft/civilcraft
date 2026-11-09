---
title: 0.8 ve 0.8.1 sürümündeki yenilikler
summary: CivilCraft 0.8 şunları ekler: Yağmur yağdır (arazi tesviyesi üzerinde bir fırtına çalıştırması), bir toprak işleri dengeleyici, en iyi güzergâh bulucu, tutma havuzları, ölçmelerden ilerleme, projenin içinde arsayı tutan bir adresten arsaya aktarıcı ve zemin ile şevler, kavşaklar ve işaretleme, ölçme dengelemesi, açık ocaklar, radyo linkleri ve demiryolu makasları için pencereler. 0.8.1 DWG dosyalarının nasıl okunduğunu düzeltir.
keywords: yenilikler, neler yeni, sürüm notları, değişiklik günlüğü, değişiklikler, 0.8, 0.8.1, sürüm, yeni özellikler, yağmur, fırtına, su birikmesi, taşma, toprak işleri, denge, kazı ve dolgu, taşıma, en iyi güzergâh, en az maliyet, eksen, tutma havuzu, çıkış, boşalma, serbest yükseklik, ilerleme, ölçme, dron, stok yığını, adresten arsaya, parsel, zemin, sel, şev stabilitesi, bishop, oturma, kavşak, işaretleme, işaret, görüş mesafesi, dengeleme, en küçük kareler, poligon, açık ocak, blok modeli, radyo linki, fresnel, makas, geçiş, diller, sorunlar, canlı, dwg
from: b0932cf0
---

Bu, 0.7 ile karşılaştırıldığında CivilCraft 0.8 (2026-11-01) ve 0.8.1 (2026-11-02) sürümlerinde değişenlerdir. Büyük yeni bölümler, arazinizi ve sahanızı test eden araçlardır (yağmur, toprak işleri, güzergâhlar, havuzlar, ilerleme) ve zemin, yollar, ölçme, madenler, linkler ve demiryolu için altı hesap penceresidir.

## Yeni

### Tesviyenizi test edin

- **Yağmur yağdır.** {{ui:Yağmur yağdır…}} ({{ui:Yüzey}} altında) tesviye edilmiş zemin üzerine bir fırtına bırakır. Suyun platformlardan aktığını, alçak köşelerde birikip küçük kalan havuzları taşırdığını izlersiniz. Çalıştırma canlandırılır ve hacimleri, en yüksek çıkış debisini ve her havuzun bir CSV dosyasını verir. Varsayılan hücre kabadır, böylece ilk bakış hızlıdır; daha ince bir hücre daha yavaştır. Taşan havuzlar Sorunlar panelinde de görünür.
- **Toprak işleri dengeleyici.** {{ui:Toprak işleri dengeleyici…}} kazı dolguya eşitleninceye kadar bir platformu yükseltir veya alçaltır ve aralarındaki taşıma tablosunu gösterir.
- **En iyi güzergâh.** {{ui:En iyi güzergâh…}}: bir başlangıç ve bitiş noktası seçin; CivilCraft, eğim ve eğrilik sınırlarınızı koruyan, arazi üzerindeki en ucuz yolu bulur ve bundan bir eksen oluşturur.
- **Tutma havuzları.** {{ui:Tutma havuzları…}} zemininiz için kot ve depolama değerlerini hesaplar, çıkış aygıtlarını (orifis, savak, V-çentik, taşkın savağı) kabul eder, bir fırtınayı havuzdan geçirir ve tutulan en yüksek debiyi, boşalma süresini ve serbest yüksekliği denetler.
- **Ölçümlerden ilerleme.** {{ui:Ölçümlerden ilerleme…}} farklı tarihlerdeki dron veya tarama yüzeylerini, zeminin o zamanki hâli ve tasarımla karşılaştırır: hacme göre yüzde tamamlanma, fazla kazılan ve fazla dolgu yapılan alanlar, stok yığınları ve bu hızla işin ne zaman biteceği (tahmin olarak işaretlenir).

### Arsayı tanıyın

- **Adresten arsaya.** {{ui:Adresten arsaya…}} açık parsel, bina, imar, zemin, sel ve arazi verilerini tek bir arsada bir araya getirir. Arsayı proje dosyasında tutabilirsiniz: yazılan adres, her kaynak, onu getirdiğiniz gün ve lisansı ile geri gelen sonuçlar. Projeyi yeniden açtığınızda veya paylaştığınızda arsa hâlâ oradadır ve hiçbir şey yeniden getirilmez. Ayrıca bunu bir arsa dosyası olarak kaydedebilir ya da BimCraft'a gönderebilirsiniz. Bkz. [Adresten arsaya](topic:address-to-site).

### Zemin, yollar, ölçme, madenler, linkler ve demiryolu

- **Zeminler ve şevler.** {{ui:Zeminler ve şevler…}} yazdığınız sondajlar arasındaki zemin profilini çizer. Bishop yöntemi, yeraltı suyu seviyesi, ek yük ve deprem katsayısı ile zemininiz üzerindeki kritik dairesel kayma yüzeyini arar; bir temelin oturması için konsolidasyon, ani oturma ve zaman hesaplanır.
- **Kavşaklar ve işaretleme.** {{ui:Kavşaklar ve işaretleme…}} kolları bordür dönüşleriyle birleştirir (kol başına bir yarıçap veya üç merkezli dönüşler), tasarım hızı için görüş mesafesini, görüş üçgenlerinin denetimini, yaya geçitlerini, dur çizgilerini, işaretleri ve bir işaret listesiyle levhaları yerleştirir. Plan üzerinde çizilir ve adlandırılmış katmanlarla .dxf olarak kaydedilir.
- **Ölçme dengelemesi.** {{ui:Ölçme dengelemesi…}} bir poligonun veya ağın en küçük kareler dengelemesini yapar: dengelenmiş koordinatlar, hata elipsleri, ki-kare testi ve ölçüme uymayan ölçüm için bir işaret. Serbest ağlar, pusula kuralıyla poligon kapatma ve RW5, GSI, JobXML veya CSV saha dosyaları dahildir; dengelenmiş noktalar CSV olarak kaydedilir.
- **Açık ocaklar.** {{ui:Açık ocaklar…}} sondaj numunelerini, şev açınız içindeki bir blok modeline ve nihai ocağa dönüştürür; sıyırma oranı, basamağa göre bir tablo ve bir tenör ile tonaj eğrisi ile birlikte. Gelir faktörüne göre iç içe ocaklar ve iskontolu nakit akışlı bir üretim programı da vardır.
- **Radyo linkleri.** {{ui:Radyo linkleri…}} zemininiz üzerinde Dünya'nın kabarıklığı, birinci Fresnel bölgesi, link bütçesi, sönümleme payı ve çoklu yol kesintisi ile görüş hattını denetler ve yolu açacak direk yüksekliğini verir. Fiber kayıp bütçeleri, güzergâh miktarları ve bir kule üzerindeki rüzgâr da hesaplanır.
- **Demiryolu makasları.** {{ui:Demiryolu makasları…}} kurbağa numarasından bir makas oluşturur, paralel hatlar arasında geçişler ve eğimle eğilip eğride genişletilmiş bir yapı gabarisi yapar. Makas, bir eksenin bir istasyonunda yer alabilir.

Bkz. [Zeminler, kavşaklar, ölçme dengelemesi, ocaklar, radyo linkleri ve makaslar](topic:soils-roads-survey-mines-links).

## Her uygulamada

- **Diller.** 54 dil; bunlardan on tanesi yeni. İngilizce dışındaki diller, ana dili konuşan biri okuyana kadar makine çevirisi taslaklarıdır. Yardım konularının çoğu hâlâ İngilizce.
- **Araç çubuğu satırları.** {{ui:Ayarlar}} › {{ui:Genel}} › {{ui:Araç çubuğu satırları}}: Sarmala (önceki gibi), 2 satır veya 1 satır. CivilCraft'ın Şeridi, en çok kullanılan aracı büyük, sonrakileri küçük ve geri kalanları grup adının okuna bağlı olarak gösterir.
- **Giriş aygıtları.** Dokunmatik yüzey, kalem, 3B fare, denetleyici ve MIDI uygulamaları yönetebilir.
- **Sorunlar.** Her uygulamada uyarı veren bir Sorunlar paneli; denetimler düzenleme paketlerini okur.
- **Canlı.** Bir Canlı oturumda kimin nerede olduğunu gösteren bir görünüm.
- **Eklentiler.** Aydınlatma eklentileri dahil bir eklenti listesi.
- **Yapay zekânızı bağlayın.** Bağladığınız her asistan CivilCraft'ın araçlarını yönetebilir. CadCraft Studio içinde tek tıkla bağlanma ve barındırılan bağlayıcının henüz hazır olmadığına dair bir not ile gelir. Bkz. [Bir yapay zekâ asistanının arsanızla çalışmasına izin verin](topic:assistants).

## 0.8.1'de düzeltilenler

- **DWG sınıfları bölümü.** Yanlış tür olarak okunuyordu (GitHub cadcraft#5). CadCraft, BimCraft, ModelCraft ve TakeoffCraft ile birlikte CivilCraft'ta düzeltildi.
- **Çalışırken dil değiştirme.** CadCraft Studio ve paketlenmiş sürümler çalışma zamanında dil değiştirebilir. Önceden yalnızca İngilizce idi. Her platformda henüz sınanmadı: dilin değişmediğini görürseniz bize bildirin.

## Bu sürümde henüz yapılmadı

- **Bunlar hesaplama yardımcılarıdır.** Yeni pencerelerdeki her sonucun bir mühendisin kontrolüne ihtiyacı vardır. Zemin dayanımları, zemin grubu için tipik değerlerle başlar ve pencere bunu belirtir.
- **Yağmur yağdır.** İnce bir hücrede örnek arsada bir çalıştırma tarayıcıda iki dakikayı aşabilir. El ile yapılmış durumlara ve V biçimli bir toplanma havzasına karşı denetlendi, gerçek bir tesviye edilmiş arsada henüz denetlenmedi.
- **Adresten arsaya.** Getirdiğiniz açık veri dosyalarını okur ve yalnızca kendi dosyalarımızda sınandı. Ağaçlar bir kaynak değildir. Kaynakları sizin için getirmek, gizlilik metnine bağlıdır.
- **Ölçümlerden ilerleme.** Yalnızca uydurulmuş ölçümlerde sınandı. Paftalar ve işaretlemeler (MarkupCraft) üzerinden ilerleme ile tarama-model karşılaştırması (BimCraft) yapılmadı.
- **Zeminler ve şevler.** Yalnızca dairesel yüzeyler: kama veya blok arama ve gerilme çatlağı yoktur.
- **Kavşaklar.** Kol başına bir yarıçap, kamyon dönüş yolları yok ve henüz koridora girmiyorlar.
- **Saha dosyaları.** Okuyucular genel format açıklamalarından yazıldı ve bizim hazırladığımız dosyalarda denendi. Gerçek alet dosyaları aranıyor.
- **Linkler ve demiryolu.** Radyo linkleri: yalnızca serbest alan kaybı ve çoklu yol (yağmur sönümlemesi veya anten desenleri yok) ve bir demiryolu standardı yok: her demiryolu sınırı bir yer tutucudur, hiçbir demiryolu mühendisinin kontrol etmediği taslak sayılar.
- **Windows ve macOS.** 0.8 kod imzalı değildir. Windows uyarabilir; macOS sağ tıklayıp Aç'ı seçmenizi ister.

Diğer her şey için [Henüz yapılmadı](topic:not-built-yet). Önceki sürüm için bkz. [0.7 sürümündeki yenilikler](topic:whats-new-0-7).
