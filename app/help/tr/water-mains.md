---
title: Su hatları: basınçlar, debiler ve yangın debisi
summary: Plana bağlantı noktaları, rezervuarlar, depolar, borular, pompalar ve basınç düşürücü vanalardan oluşan bir basınç ağı çizin; CivilCraft yük, basınç ve debileri (Hazen–Williams, halkalı ağlar), bir yangın için kullanılabilir debiyi ve bir günlük talebi hesaplar. Bir laboratuvar özelliğidir; her sonuç bir mühendisin kontrolünü gerektirir.
keywords: su, su hattı, su dağıtımı, basınç ağı, basınçlı boru, halkalı ağ, hazen-williams, C katsayısı, yük kaybı, kalıntı basıncı, yangın debisi, hidrant, talep, bağlantı noktası, rezervuar, depo, pompa, pompa eğrisi, basınç düşürücü vana, prv, çek valf, uzatılmış dönem, epanet, inp, hız
from: df46bf6d
---

Su hatları, bir sahanın basınçlı tarafıdır: her zaman dolu borular, bir rezervuar, bir depo ya da bir pompa ile itilen su. CivilCraft her bağlantı noktasındaki yük ve basıncı ile her borudaki debiyi hesaplar; suyun birden fazla yolu olduğu halkalı ağlar dahil. Doğrulanana kadar laboratuvar aşamasındadır.

**Yalnızca bir hesaplama yardımcısıdır.** Her sayının nitelikli bir mühendisin kontrolü gerekir: yanıt, verdiğiniz talepler, kotlar, boru ölçüleri ve pürüzlülük değerleri kadar iyidir; durağan durum (steady-state) bir model su darbesi, su kalitesi ya da bir yangın pompasının gerçek davranışı hakkında hiçbir şey bilmez.

## Ağı çizin

1. **Yüzey** › {{ui:Daha fazla}} altında {{ui:Su şebekeleri…}} seçin. Pencere siz planda çalışırken açık kalır.
2. {{ui:Rezervuar}} seçin ve arzın olduğu yere plana tıklayın. Yükü zeminin 100 ft (30 m) üstünden başlar; Özellikler'de değiştirin.
3. {{ui:Bağlantı noktası}} seçin ve suyun çekildiği ya da boruların birleştiği her yere tıklayın. Bağlantı noktası kotunu zeminden alır; farklı bir kot yazarak Özellikler'de geçersiz kılabilirsiniz.
4. {{ui:Boru}} seçin, bir düğüme, sonra birleştiği düğüme tıklayın. Araç bir sonraki boru için açık kalır. Bir {{ui:Pompa}} ve bir {{ui:Basınç düşürücü vana}} aynı şekilde çizilir: emiş (ya da yukarı akış) düğümünden basma (ya da aşağı akış) düğümüne. Bir {{ui:Depo}} bir bağlantı noktası gibi yerleştirilir.
5. Bir bağlantı noktası seçin ve {{ui:Talep}} değerini yazın (gpm, ya da metre projesinde L/s). Bir boru seçin ve {{ui:Çap}} (in ya da mm) ile biliyorsanız Hazen–Williams C değerini ayarlayın.

Her değişiklik tek bir geri alma adımıdır. Delete düğümü ve ona bağlanan boruları kaldırır.

## Parçaların anlamı

- **Boru.** Uzunluk, yazmadığınız sürece plan üzerinden ölçülür. C, Hazen–Williams pürüzlülüğüdür (başlangıçta 130; varsayılanı pencerede değiştirin). Bir K küçük kayıp katsayısı, dirsek ve bağlantı parçalarının kayıplarını ekler. Su geriye akmaması gereken bir boru için **Çek valf** kutusunu işaretleyin; **Kapalı** bir boru hiçbir şey taşımaz.
- **Rezervuar.** Sabit bir yükte kaynak: tuttuğu su seviyesi, datum üstünde. Ağın ihtiyaç duyduğunu verir ya da alır.
- **Depo.** Bir gün boyunca değişen bir seviye. Durağan sonuçlarda, mevcut seviyesinde bir kaynaktır.
- **Pompa.** Tek bir tasarım noktası (debi ve yük) onun içinden geçen olağan eğriyi verir: sıfır debideki yük tasarım yükünün 133 %'üdür ve yük, tasarım debisinin iki katında sıfırdır. Bir pompa suyu asla geriye itmez.
- **Basınç düşürücü vana.** Kaynak daha yüksekken, ayarladığınız basıncı aşağı akışta tutar. Kaynak daha düşükken açıktır ve hiçbir şeyi tutmaz; su geriye akacaksa kapanır.

## Sonuçları okuyun

Pencere her düğümün yükünü ve basıncını ile her bağlantının debisini, hızını ve 1,000 ft (ya da km) başına yük kaybını gösterir; bağlantı noktaları planda renklenir: yeşil en düşük ile en yüksek basınç arasında, kırmızı altında, kehribar üstünde. Akış okları yönü gösterir. Özellikler'de sayılarını okumak için bir düğüm ya da boru seçin.

Tabloların altında nelere bakılacağının bir listesi bulunur: düşük ya da yüksek basınç, sınırınızdan hızlı bir boru, her kaynaktan kesilmiş bir bağlantı noktası ya da yerleşmeyen bir çözücü. Aynı bulgular Sorunlar panelinde de bulunur. Sınırları pencerede ayarlayın (başlangıçta 20 psi, 100 psi ve 10 ft/s; metre projesinde 140 kPa, 700 kPa ve 3 m/s).

## Yangın debisi

{{ui:Yangın debisi…}} tek bir bağlantı noktasında bir debi çizer ve oradaki basıncı ile ağdaki her yerdeki en düşük basıncı gösterir. Ayrıca, ağdaki en zayıf düğüm verdiğiniz kalıntı basıncını korurken o bağlantı noktasında kullanılabilir debiyi bulur. Diğer talepler olduğu gibi kalır.

## Bir günlük talep

{{ui:Bir günlük talep…}} ağı saat saat çalıştırır. Talep desenini dosyanın ayarlarında verin (tekrar eden çarpanlar listesi); depolar giren ve çıkan debiyle dolar ve boşalır, bir pompa açma/kapatma desenini izleyebilir. En yüksek ya da en düşük seviyesine ulaşan bir depo listede adıyla anılır: CivilCraft girişini ya da çıkışını sizin için kapatmaz; bunu "bu depo çok küçük ya da pompa çok büyük" olarak okuyun.

## EPANET metni

{{ui:EPANET metni olarak kaydet (.inp)}} ağı, birçok su programının okuduğu düz metin biçiminde yazar; {{ui:EPANET metni aç (.inp)…}} birini okur. Yalnızca CivilCraft'ın modellediği şeyler aktarılır: bağlantı noktaları, rezervuarlar, depolar, borular, yük eğrisi olan pompalar, basınç düşürücü vanalar, talep desenleri ve zamanlar. Diğer vana türleri, güçle verilen pompalar ve diğer yük kaybı formülleri adlandırılır ve dışarıda bırakılır. Dosya projeyle aynı birimleri kullanmalıdır.

## Hidrantlar, vanalar ve bağlantı parçaları

Bir bağlantı noktası seçin ve bir tane eklemek için **Hidrant** kutusunu işaretleyin; bir ana hattı seçin ve üzerine bir vana, hava vanası, boşaltma ya da sayaç koymak için **Ortaya ekle** düğmesine basın. Bunlar ağın nesneleridir: onunla birlikte hareket ederler ve tek bir geri alma adımı onları kaldırır.

Yerleşim bağlantı parçalarını da ima eder ve CivilCraft bunları istenmeden listeler: üç ana hattın birleştiği yerde bir **te**, dördünün kesiştiği yerde bir **haç**, iki ana hat 5° ya da daha fazla döndüğünde bir **dirsek** (açısıyla), iki boyut birleştiğinde bir **redüktör** ve çıkmaz sokakta bir **kapak**. {{ui:Ek parça listesi (CSV)}} bunları ve ana hatları boyuta göre sayar. Bu, yerleşimin ima ettiği şeydir; kendi detaylarınızla kontrol edilecek bir metraj, sipariş edilecek bir liste değildir.

Ana hatlar, 3B'de çizilebilsin ve modellenebilsin diye zeminin altında bir örtü (4 ft ya da 1.2 m) düşülerek yerleştirilir; yukarıdaki basınçlar buna asla bağlı değildir.

## Plan ve dosyalarda

Plan, PDF ve DWG ya da DXF, ana hatları **C-WATR-MAIN** üzerinde, boyutlarını **C-WATR-TEXT** üzerinde, hidrantları **C-WATR-HYDR** üzerinde, vanaları **C-WATR-VALV** üzerinde ve bağlantı parçalarını **C-WATR-FITT** üzerinde taşır. LandXML çıktısı bir su borusu ağı yazar (her düğüm için bir yapı, her ana hat için bir boru, adlandırılmış hidrantlar); LandXML girişi bunu su hatları olarak geri okur, ancak talepler, pompalar ve vanalar olmadan, çünkü LandXML bunları taşımaz. IFC dışa aktarımı ana hatları, hidrantları, vanaları ve bağlantı parçalarını tek bir su sisteminde boru segmentleri olarak yazar. Bu dosyalar kendi okuyucu ve yazıcılarımızla denetlendi; diğer programlarınızda deneyin ve ne dediklerini bize bildirin.

## Henüz burada olmayanlar

Su kalitesi ve yaşı, bir pompanın açma/kapatma deseninin ötesinde kontroller ve kurallar, diğer vana türleri, basınca bağlı talep, çapı değişen borular ve zamana bağlı kanalizasyon debileri. Bkz. [Henüz yapılmadı](topic:not-built-yet). Farklı bir hesaplama olan sıhhi tasarım debileri ise [Sıhhi tasarım debileri](topic:sanitary-design) bölümündedir.
