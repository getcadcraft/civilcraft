---
title: Yenilikler: 0.9
summary: Çizim yaparken koridor ve arazi şablonları, yakalamalar ve Seç düğmeleri, öznitelik tablosuyla GIS analizi, bir arsa için gölge, güneş enerjisi verimi, konfor ve rüzgâr çalışmaları, 3B Render görünümü ve Nokta bulutları ile WaterCraft eklentileri.
keywords: yenilikler, 0.9, sürüm notları, koridor şablonları, arazi şablonları, şablon düzenleyici, tipik kesit, birden çok koridor, yakalama, yakalamalar, seç, taşı, kopyala, döndür, teğet, render, 3B render, gis analizi, tampon, kaplama, mekânsal birleştirme, öznitelik tablosu, özniteliğe göre stil, gölge çalışması, güneş enerjisi verimi, utci, dış mekân konforu, rüzgâr çalışması, openfoam, nokta bulutları, las, laz, watercraft, yangın debisi, yangın musluğu, su yaşı, klor, talepler, araç ipuçları, düzen, değişiklik günlüğü, değişiklikler, 0.8, 0.8.1, sürüm, yeni özellikler, yağmur, fırtına, su birikmesi, taşma, toprak işleri, dengeleme, en iyi güzergâh, en az maliyet, eksen, tutma havuzu, çıkış, boşalma, serbest yükseklik, ilerleme, ölçme, dron, stok sahası, adresten arsaya, parsel, zemin, sel, şev stabilitesi, Bishop, oturma, kavşak, işaretleme, levhalar, görüş mesafesi, en küçük kareler, poligon, açık ocak, blok modeli, radyo linki, Fresnel, makas, geçiş, diller, sorunlar, canlı, dwg
from: d7ac5b14
---

Bu, CivilCraft 0.8.1 ile karşılaştırıldığında CivilCraft 0.9'da neyin değiştiğini gösterir. CivilCraft 0.9, CadCraft Studio 0.9 ve sekiz uygulamasının bir parçasıdır. Başlıca bölümler koridor ve arazi şablonları, çizim sırasında yakalamalar, GIS analizi, bir arsanın güneşlenme, güneş enerjisi verimi, konfor ve rüzgâr çalışmaları ile iki eklenti olan Nokta bulutları ve WaterCraft'tır.

## Yeni

### Koridor ve arazi şablonları

- **Koridor şablonları.** {{ui:Yüzey}} › {{ui:Daha fazla}} › {{ui:Koridor şablonları…}} menüsünü açın (ya da {{cmd:TEMPLATES}} yazın). Şablon, bileşenleri, ofsetleri, şevleri, malzemeleri ve nokta kodlarını içeren küçük bir enine kesittir. Şablonları projede, {{ui:Kütüphanem}} içinde ya da bir `.cctemplates.json` dosyası olarak saklayabilirsiniz. Şablon düzenleyici gerçek ölçekli bir çizim gösterir ve yazarken sorunları listeler.
- **Şablonlardan istasyona göre oluşturma.** Bir eksen seçin ve özellikleri içinde {{ui:Koridoru istasyona göre şablonlardan oluştur}} seçeneğini açın. Bölgenin her iki tarafının kendi kaplama listesi ve kendi bitiş koşulu vardır. {{ui:Bu hizalamadaki koridorlar}} altındaki {{ui:Koridor ekle}} seçeneği aynı eksene birden çok koridor ekler.
- **Arazi şablonları.** {{ui:Yüzey}} › {{ui:Daha fazla}} › {{ui:Arazi şablonları…}} menüsünü açın (ya da {{cmd:TERRAINTEMPLATES}} yazın). Bu araç, üst toprak ya da kaplama gibi katmanlı malzemeleri bir araziye yerleştirir ve temel oluşturur; her katman için alan ve hacim verir. Bkz. [Koridor şablonları ve arazi şablonları](topic:corridor-templates).

### Çizim

- **Yakalamalar.** Eksen, Platform, Parsel, Kütle, Özellik çizgisi, Ölç, Sınır ve Havza araçları ölçme noktalarına, PI'lara, köşelere, köşe noktalarına ve yapılara yakalanır; işaretçinin yanında bir etiket çıkar. Serbest bir nokta için {{key:Alt}} tuşunu basılı tutun.
- **Seç düğmeleri, teğet ve taşı, kopyala, döndür.** Platform, parsel ve özellik çizgisi köşelerinde yazılabilir Doğu (Easting) ve Kuzey (Northing) alanları ile artı imleçli bir Seç düğmesi vardır. Özellikler içinde eksenler için {{ui:İki noktadan teğet}} ve eksenler, platformlar, parseller ve özellik çizgileri için {{ui:Taşı, kopyala ve döndür}} de bulunur. Bkz. [Yakalamalarla, seçilen köşelerle ve taşı, kopyala, döndür ile çizim](topic:draft-with-snaps).
- **3B görünümde render.** 3B çubuğundaki {{ui:Render}} düğmesi araziyi doğal renklerle, gökyüzü, puslu görünüm ve yumuşak gölgelerle çizer. Modeli değiştirmez. {{ui:Güneş}} menüsünde artık {{ui:Uygula}} ve {{ui:Kapat}} düğmeleri vardır. Bkz. [Siteyi 3B'de görüntüleme](topic:site-3d).
- **Paneller tek seferde bir bölüm açar.** Sol panel ve Özellikler paneli bir bölüm açar, diğerlerini kapatır; birden çok aracı barındıran Peyzaj şeridi kutucukları ayrık düğmelerdir.

### GIS analizi

- **Çözümle.** {{ui:Yüzey}} › {{ui:Daha fazla}} › {{ui:Çözümle}} seçeneği tampon, kaplama, mekânsal birleştirme, öznitelik ya da şekle göre seçme ve ölçme sunar. Her araç tek bir geri alma adımında yeni bir katman oluşturur.
- **Öznitelik tablosu.** Bir katmanın üç nokta menüsünde {{ui:Öznitelik tablosu…}} ve {{ui:Özniteliğe göre stille…}} bulunur. Bkz. [GIS katmanlarını çözümleme](topic:gis-analysis) ve [Bir katmanın öznitelik tablosuyla çalışma](topic:gis-table).

### Site: güneş, güneş enerjisi, konfor ve rüzgâr

- **Çevre bölümü.** Bir kütle seçin: {{ui:Çevre}} bölümü özelliklerinde {{ui:Güneşlenme saatleri}} altında yer alır. Gölge çalışması (harita, tablo, animasyon, CSV), tipik bir yıllık hava durumu dosyasından (.epw) güneş enerjisi verimi ve dış mekân konforu (UTCI) içerir.
- **Rüzgâr, yalnızca ön eleme.** {{ui:Rüzgâr çalışması yap}} komutu, hava durumu dosyasındaki her rüzgâr yönü için zemini oturmaya uygun olmaktan rahatsız edici olana kadar renklendirir. Doğrulanmamıştır ve panel bunu belirtir.
- **Yaya rüzgârı (OpenFOAM) eklentisi.** {{ui:Ayarlar}} › {{ui:Eklentiler}} içinde açana kadar kapalıdır. OpenFOAM, sizin kendiniz kuracağınız bir yazılımdır. Bkz. [Gölge, güneş enerjisi verimi ve dış mekân konforu](topic:environment).

### Nokta bulutları (eklenti)

- {{ui:Ayarlar}} › {{ui:Eklentiler}} içinde {{ui:Nokta bulutları}} seçeneğini açın; sağdaki panelde bir Nokta bulutları sekmesi belirir. Bir LAS ya da LAZ dosyası açın, temizleyin, zemin, bitki örtüsü ve binalar olarak ayırın, zemini, kotları ve hacimleri oluşturun ve LAS ya da LAZ olarak dışa aktarın. Bkz. [Dron ya da tarayıcıdan nokta bulutları](topic:point-clouds).

### WaterCraft (eklenti)

- {{ui:Ayarlar}} › {{ui:Eklentiler}} içinde {{ui:WaterCraft (su dağıtımı)}} seçeneğini açın; bir WaterCraft sekmesi belirir. Müşterilerden gelen talepler, her yangın musluğundaki yangın debisi, hangi ana boru kesintisinin en önemli olduğu ve her biri CSV olarak kaydedilen su yaşı ile klor sunar. Bkz. [WaterCraft: talepler, yangın debisi, kesintiler ve su yaşı](topic:watercraft).

### Birlikte çalışma

- Bir Canlı oturumda, birbirinizin imleçlerini ve adlarını planda görürsünüz. Kütüphane bitkileri: CivilCraft Landscape, varsayılan Kütüphane koleksiyonundan başlar: {{ui:CivilCraft peyzaj}}.

## Tüm uygulamalarda

- İpuçları Bootstrap araç ipuçları olarak gösterilir ve başlangıç ipucu kapatılabilir.
- Sığmayan bir panel sekme şeridi kesilmek yerine kaydırılır.
- Tarayıcı sekmesi başlıkları `<belge> - CivilCraft | CadCraft` biçimindedir.
- {{ui:Ayarlar}} içinde, düzenlerin iki satırlı seçeneklerden oluşan bir açılır liste olduğu bir Düzen bölümü vardır.
- Ağırlık ve sıcaklık birimleri {{ui:Ayarlar}} › {{ui:Genel}} › {{ui:Birimler}} içindedir.
- Dil listesi, derlemenin dosyasına sahip olduğu dilleri gösterir. İngilizce dışındaki diller makine taslağıdır.

## Düzeltilenler

- Adres arama ve EnergyPlus denetimi eklentileri açılamıyordu; artık açılabilir.
- Yardım, Nokta bulutları eklentisinin temizlenmiş bulutu LAS 1.4 ya da LAZ olarak yazdığını artık belirtir.
- Seçili nesnenin kendi tutamacına tıklamak, bekleyen bir Seç işlemini durduran tutamaç sürüklemesini artık başlatmaz.

## Dürüst sınırlar

- Örnek koridor şablonları hiçbir standarttan gelmeyen yer tutuculardır; bir mühendis bunları kontrol etmelidir. Arazi şablonları yüzey eklemez ve 3B'de ya da kesit görünümünde çizilmez. Bir eksendeki ikinci koridor IFC dışa aktarımında yer almaz. İstasyona göre iki şablon arasında bir daralma yoktur.
- Nokta bulutları gerçek bir dron ölçümü yerine uydurma dosyalarla test edildi. Yalnızca LAS ve LAZ okunur.
- GIS analizi uydurma katmanlarla test edildi.
- Gölge, güneş enerjisi ve konfor planlama tahminleridir; rüzgâr doğrulanmamış ön elemedir. Hiçbiri tasarım değeri değildir.
- WaterCraft, uydurma ağlarda denenmiş bir hesaplama yardımcısıdır. Sayıların ne değer taşıdığına bir su mühendisi karar verir.
- İngilizce dışındaki diller makine taslağıdır.
- Windows kurulum dosyaları kod imzalı değildir ve macOS disk görüntüsü notarize edilmemiştir.

## Önceki: 0.8 ve 0.8.1

Bu, CivilCraft 0.8 (2026-11-01) ve 0.8.1 (2026-11-02) sürümlerinde, 0.7 ile karşılaştırıldığında neyin değiştiğini gösterir. Yeni başlıca bölümler, zemininizi ve sahanızı test eden araçlardır (yağmur, toprak işleri, güzergâhlar, havuzlar, ilerleme); ayrıca zemin, yollar, ölçme, madenler, linkler ve demiryolu için altı hesaplama penceresi vardır.

### Yeni

**Zemin eğimini test edin**

- **Yağmur yağdır.** {{ui:Yağmur yağdır…}} ({{ui:Yüzey}} altında) düzenlenmiş zemine bir fırtına bırakır. Suyun platformlardan akışını, alçak köşelerde birikmesini ve yetersiz kalan havuzlardan taşmasını izlersiniz. Çalışma animasyonlu gösterilir ve hacimleri, en yüksek çıkış debisini ve her havuzun CSV dökümünü verir. Varsayılan hücre kabadır, böylece ilk bakış hızlıdır; daha ince bir hücre daha yavaştır. Taşan havuzlar Sorunlar panelinde de görünür.
- **Toprak işleri dengeleyici.** {{ui:Toprak işleri dengeleyici…}} kazı dolguya eşit olana kadar bir platformu yükseltir ya da alçaltır ve aralarındaki taşıma tablosunu gösterir.
- **En iyi güzergâh.** {{ui:En iyi güzergâh…}}: bir başlangıç ve bir bitiş seçin; CivilCraft, eğim ve eğrilik sınırlarınıza uyan en ucuz yolu arazide bulur ve bundan bir eksen oluşturur.
- **Tutma havuzları.** {{ui:Tutma havuzları…}} zemininizden kademe ve depolamayı hesaplar, çıkış aygıtlarını (orifis, savak, V-çentik, taşırıcı) alır, havuzdan bir fırtına geçirir ve tutulan en yüksek debiyi, boşalma süresini ve serbest yüksekliği denetler.
- **Ölçümlerden ilerleme.** {{ui:Ölçümlerden ilerleme…}} farklı tarihlerdeki dron ya da tarama yüzeylerini, zeminin o zamanki hâli ve tasarımla karşılaştırır: hacme göre tamamlanma yüzdesi, fazla kazılan ve fazla dolgu yapılan alanlar, stok sahaları ve bu hızla işin ne zaman biteceği (tahmin olarak işaretlenir).

**Siteyi tanıyın**

- **Adresten arsaya.** {{ui:Adresten arsaya…}} açık parsel, bina, imar, zemin, sel ve arazi verilerini tek bir arsada bir araya getirir. Arsayı proje dosyasında tutabilirsiniz: yazılan adres, her kaynak, onu indirdiğiniz gün ve lisansı ile geri dönen veriler. Projeyi yeniden açtığınızda ya da paylaştığınızda arsa yerinde durur ve hiçbir şey yeniden indirilmez. Arsayı bir arsa dosyası olarak da kaydedebilir ya da BimCraft'a gönderebilirsiniz. Bkz. [Adresten arsaya](topic:address-to-site).

**Zemin, yollar, ölçme, madenler, linkler ve demiryolu**

- **Zemin ve şevler.** {{ui:Zeminler ve şevler…}} girdiğiniz sondajlar arasındaki zemin profilini çizer. Bishop yöntemi, su tablası, ek yük ve deprem katsayısı ile zemininizde kritik dairesel kayma yüzeyini arar; bir temelin oturması konsolidasyon, anlık oturma ve zaman bileşenleri alır.
- **Kavşaklar ve işaretleme.** {{ui:Kavşaklar ve işaretleme…}} kolları bordür dönüşleriyle birleştirir (kol başına bir yarıçap ya da üç merkezli dönüşler), tasarım hızına göre görüş mesafesini, görüş üçgenlerinin denetimini, yaya geçitlerini, durma çizgilerini, işaretlemeleri ve bir levha listesiyle levhaları yerleştirir. Plan üzerinde çizilir ve adlandırılmış katmanlarla bir .dxf olarak kaydedilir.
- **Ölçme dengelemesi.** {{ui:Ölçme dengelemesi…}} bir poligon ya da ağın en küçük kareler dengelemesini yapar: dengelenmiş koordinatlar, hata elipsleri, ki-kare testi ve ölçüme konan, uymayan ölçüm işareti. Serbest ağlar, pusula kuralıyla poligon kapatma ve RW5, GSI, JobXML ya da CSV saha dosyaları dahildir; dengelenmiş noktalar CSV olarak kaydedilir.
- **Açık ocaklar.** {{ui:Açık ocaklar…}} sondaj numunelerini bir blok modeline ve şev açınızla sınırlanan nihai ocağa dönüştürür; şerit oranı, basamağa göre bir tablo ve bir tenör ve tonaj eğrisi ile birlikte. Gelir faktörüne göre iç içe ocaklar ve indirgenmiş nakit akışı içeren bir üretim programı da vardır.
- **Radyo linkleri.** {{ui:Radyo linkleri…}} dünya kabarıklığı, birinci Fresnel bölgesi, link bütçesi, sönümleme payı ve çok yollu kesinti ile zemininiz üzerinde görüş hattını denetler ve yolu açacak direk yüksekliğini verir. Ayrıca fiber kayıp bütçeleri, güzergâh miktarları ve bir kule üzerindeki rüzgâr yükü hesapları yapar.
- **Demiryolu makasları.** {{ui:Demiryolu makasları…}} bir makası kurbağa numarasından, paralel raylar arasındaki geçişlerden ve eğim ile yatay eğrilikte genişletilen yapı profilinden oluşturur. Bir makas, bir eksenin bir istasyonunda yer alabilir.

Bkz. [Zeminler, kavşaklar, ölçme dengelemesi, ocaklar, radyo linkleri ve makaslar](topic:soils-roads-survey-mines-links).

### Tüm uygulamalarda

- **Diller.** 54 dil, bunlardan on tanesi yenidir. İngilizce dışındaki diller, bir ana dili konuşan biri okuyana kadar makine taslağıdır. Yardım konuları çoğunlukla hâlâ İngilizcedir.
- **Araç çubuğu satırları.** {{ui:Ayarlar}} › {{ui:Genel}} › {{ui:Araç çubuğu satırları}}: Sarma (öncekiyle aynı), 2 satır ya da 1 satır. CivilCraft'ın Şeridi en çok kullanılan aracı büyük, sonrakileri küçük ve geri kalanları grup adının okunda gösterir.
- **Giriş aygıtları.** Dokunmatik yüzey, kalem, 3B fare, denetleyici ve MIDI uygulamaları yönetebilir.
- **Sorunlar.** Her uygulamada uyarı veren bir Sorunlar paneli; düzenleme paketlerini okuyan denetimlerle.
- **Canlı.** Bir Canlı oturumda kimin nerede olduğunu gösteren bir görünüm.
- **Eklentiler.** Aydınlatma eklentileriyle birlikte bir eklenti listesi.
- **Yapay zekânızı bağlayın.** Bağladığınız her asistan, CivilCraft'ın araçlarını yönetebilir. CadCraft Studio içinde tek tıkla bağlanma ve barındırılan bağlayıcının henüz hazır olmadığına dair bir not ile gelir. Bkz. [Bir yapay zekâ asistanının sitenizde çalışmasına izin verin](topic:assistants).

### 0.8.1 sürümünde düzeltilenler

- **DWG sınıfları bölümü.** Yanlış türde okunuyordu (GitHub cadcraft#5). CadCraft, BimCraft, ModelCraft ve TakeoffCraft ile birlikte CivilCraft'ta düzeltildi.
- **Çalışırken dil değiştirme.** CadCraft Studio ve paketlenmiş sürümler çalışma sırasında dil değiştirebilir. Önceden yalnızca İngilizceydi. Her platformda henüz tam olarak test edilmedi: dil değişmezse bize bildirin.

### Bu sürümde henüz yok

- **Bunlar hesaplama yardımcılarıdır.** Yeni pencerelerdeki her sonuç bir mühendisin kontrolünü gerektirir. Zemin mukavemetleri zemin grubu için tipik değerlerden başlar ve pencere bunu belirtir.
- **Yağmur yağdır.** Örnek sahada bir çalışma, ince bir hücrede tarayıcıda iki dakikadan uzun sürebilir. El hesaplarına ve V biçimli bir havzaya karşı denendi, henüz gerçek bir düzenlenmiş sahada denenmedi.
- **Adresten arsaya.** Getirdiğiniz açık veri dosyalarını okur ve yalnızca kendi dosyalarımızla test edildi. Ağaçlar bir kaynak değildir. Sizin için kaynak getirme, gizlilik metnini bekliyor.
- **Ölçümlerden ilerleme.** Yalnızca uydurma ölçümlerle test edildi. Paftalar ve işaretlemeler (MarkupCraft) üzerinde ilerleme ile tarama ve modele karşı (BimCraft) henüz yapılmadı.
- **Zemin ve şevler.** Yalnızca dairesel yüzeyler: kama ya da blok araması ve çekme çatlağı yok.
- **Kavşaklar.** Kol başına bir yarıçap, kamyon dönüş yolları yok ve henüz koridora girmiyorlar.
- **Saha dosyaları.** Okuyucular genel format açıklamalarından yazıldı ve bizim oluşturduğumuz dosyalarda denendi. Gerçek cihaz dosyalarına ihtiyaç var.
- **Linkler ve demiryolu.** Radyo linkleri: yalnızca boşluk kaybı ve çok yollu (yağmur sönümlemesi ya da anten örüntüsü yok) ve bir demiryolu standardı yok: her demiryolu sınırı bir yer tutucudur, hiçbir demiryolu mühendisinin kontrol etmediği taslak sayılarla.
- **Windows ve macOS.** 0.8 kod imzalı değildir. Windows uyarabilir ve macOS, sağ tıklayıp Aç seçmenizi ister.

Diğer her şey için [Henüz yapılmadı](topic:not-built-yet) bölümüne bakın. Önceki sürüm için bkz. [0.7 sürümündeki yenilikler](topic:whats-new-0-7).
