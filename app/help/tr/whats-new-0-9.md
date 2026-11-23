---
title: 0.9'da yenilikler (daha önce)
summary: Koridor ve arazi şablonları, çizim sırasında yakalamalar ve seçme düğmeleri, GIS analizi ve öznitelik tablosu, bir site için gölge, güneş enerjisi verimi, konfor ve rüzgâr çalışmaları, 3B Render görünümü ve Nokta bulutları ile WaterCraft eklentileri.
keywords: 0.9'da yenilikler, önceki sürüm, 0.9, sürüm notları, koridor şablonları, arazi şablonları, şablon düzenleyici, tipik kesit, birden çok koridor, yakalama, yakalamalar, seçme, taşı, kopyala, döndür, teğet, render, 3B render, gis analizi, tampon, bindirme, mekânsal birleştirme, öznitelik tablosu, niteliğe göre stil, gölge çalışması, güneş enerjisi verimi, utci, dış mekân konforu, rüzgâr çalışması, openfoam, nokta bulutları, las, laz, watercraft, yangın debisi, yangın musluğu, su yaşı, klor, talepler, ipuçları, yerleşim, yenilikler, değişiklik listesi, 0.8, 0.8.1, sürüm, yeni özellikler, yağmur, fırtına, su birikintisi, taşma, toprak işleri, denge, kazı ve dolgu, taşıma, en iyi güzergâh, en düşük maliyet, eksen, tutma havuzu, çıkış, boşalma, serbest yükseklik, ilerleme, ölçme, drone, stok sahası, adresten arsaya, parsel, toprak, sel, şev stabilitesi, bishop, oturma, birleşim, çizgilendirme, işaretler, görüş mesafesi, dengeleme, en küçük kareler, poligon, açık ocak, blok modeli, radyo linki, fresnel, makas, geçit, diller, sorunlar, canlı, dwg
from: 4664522c
---

Bu, CivilCraft 0.9'da, 0.8.1 ile karşılaştırıldığında neyin değiştiğidir. CivilCraft 0.9, CadCraft Studio 0.9'un ve sekiz uygulamasının bir parçasıdır. Büyük parçalar koridor ve arazi şablonları, çizerken yakalamalar, GIS analizi, bir sitenin güneşini, güneş enerjisi verimini, konforunu ve rüzgârını inceleyen çalışmalar ve iki eklentidir: Nokta bulutları ile WaterCraft.

## Yeni

### Koridor ve arazi şablonları

- **Koridor şablonları.** {{ui:Yüzey}} › {{ui:Daha fazla}} › {{ui:Koridor şablonları…}} yolunu açın (ya da {{cmd:TEMPLATES}} yazın). Bir şablon, bileşenleri, ofsetleri, eğimleri, malzemeleri ve nokta kodları olan küçük bir enine kesittir. Bunları projede, {{ui:Kütüphanem}} içinde ya da bir `.cctemplates.json` dosyası olarak saklayın. Şablon düzenleyicisi gerçek ölçekli bir çizim gösterir ve yazarken sorunları listeler.
- **Şablonlardan istasyona göre oluşturma.** Bir eksen seçin ve Özellikler'inde {{ui:Koridoru istasyona göre şablonlardan oluştur}} seçeneğini açın. Her bölgenin her tarafının kendi asfalt listesi ve kendi uç koşulu vardır. {{ui:Bu hizalamadaki koridorlar}} altındaki {{ui:Koridor ekle}}, bir eksene birden çok koridor koyar.
- **Arazi şablonları.** {{ui:Yüzey}} › {{ui:Daha fazla}} › {{ui:Arazi şablonları…}} yolunu açın (ya da {{cmd:TERRAINTEMPLATES}} yazın); üst toprak ya da asfalt ve temel gibi katmanlı malzemeleri bir arazinin üzerine yerleştirir ve her katman için alan ile hacmi verir. Bkz. [Koridor şablonları ve arazi şablonları](topic:corridor-templates).

### Çizim

- **Yakalamalar.** Eksen, Platform, Parsel, Kütle, Özellik çizgisi, Ölçme, Sınır ve Havza araçları ölçme noktalarına, PI'lara, köşelere, tepe noktalarına ve yapılara yakalanır; işaretçinin yanında bir etiket belirir. Serbest bir nokta için {{key:Alt}}'a basılı tutun.
- **Seçme düğmeleri, teğet ve taşı, kopyala, döndür.** Platform, parsel ve özellik çizgisi köşelerinde, yazılabilir Doğu ve Kuzey kutuları ile bir artı imleci olan bir Seç düğmesi vardır. Özelliklerde ayrıca eksenler için {{ui:İki noktadan teğet}} ve eksenler, platformlar, parseller ve özellik çizgileri için {{ui:Taşı, kopyala ve döndür}} bulunur. Bkz. [Yakalamalar, seçilmiş köşeler ve taşı, kopyala, döndür ile çizim](topic:draft-with-snaps).
- **3B'de Render görünümü.** 3B çubuğundaki {{ui:Render}} düğmesi, araziyi doğal renklerle, gökyüzü, sis ve yumuşak gölgelerle çizer. Modeli değiştirmez. {{ui:Güneş}} menüsünde artık {{ui:Uygula}} ve {{ui:Kapat}} düğmeleri vardır. Bkz. [Sahayı 3B'de görüntüleyin](topic:site-3d).
- **Paneller tek bölüm açar.** Sol panel ve Özellikler paneli bir bölüm açar ve diğerlerini kapatır; birden çok araç tutan Peyzaj şerit kutucukları bölünmüş düğmelerdir.

### GIS analizi

- **Çözümle.** {{ui:Yüzey}} › {{ui:Daha fazla}} › {{ui:Çözümle}} tampon, bindirme, mekânsal birleştirme, özniteliğe veya şekle göre seçme ve ölçme sunar. Her araç tek bir geri alma adımında yeni bir katman oluşturur.
- **Öznitelik tablosu.** Bir katmanın üç noktalı menüsünde {{ui:Öznitelik tablosu…}} ve {{ui:Özniteliğe göre stille…}} bulunur. Bkz. [GIS katmanlarını çözümleyin](topic:gis-analysis) ve [Bir katmanın öznitelik tablosuyla çalışın](topic:gis-table).

### Site: güneş, güneş enerjisi, konfor ve rüzgâr

- **Çevre bölümü.** Bir kütle seçin: {{ui:Çevre}} bölümü, Özellikler'inde {{ui:Güneşlenme saatleri}} altındadır. Bir gölge çalışması (harita, tablo, animasyon, CSV), tipik bir yıl hava durumu dosyasından (.epw) güneş enerjisi verimi ve dış mekân konforu (UTCI) içerir.
- **Rüzgâr, yalnızca tarama.** {{ui:Rüzgâr çalışmasını çalıştır}}, hava durumu dosyasındaki her rüzgâr yönü için zemini oturmaya uygundan rahatsız edici olana kadar renklendirir. Doğrulanmamıştır ve panel bunu söyler.
- **Yaya rüzgârı (OpenFOAM) eklentisi.** {{ui:Ayarlar}} › {{ui:Eklentiler}} içinde açana kadar kapalıdır. OpenFOAM, sizin kendiniz kuracağınız bir yazılımdır. Bkz. [Gölge, güneş enerjisi verimi ve dış mekân konforu](topic:environment).

### Nokta bulutları (eklenti)

- {{ui:Ayarlar}} › {{ui:Eklentiler}} içinde {{ui:Nokta bulutları}}'nı açın; sağ panelde bir Nokta bulutları sekmesi belirir. Bir LAS ya da LAZ dosyası açın, temizleyin, zemine, bitkiye ve binalara ayırın, zemini, kot eğrilerini ve hacimleri oluşturun ve LAS ya da LAZ olarak dışa aktarın. Bkz. [Bir drone'dan ya da tarayıcıdan nokta bulutları](topic:point-clouds).

### WaterCraft (eklenti)

- {{ui:Ayarlar}} › {{ui:Eklentiler}} içinde {{ui:WaterCraft (su dağıtımı)}}'nı açın; bir WaterCraft sekmesi belirir. Müşterilerden gelen talepler, her yangın musluğunda yangın debisi, hangi ana boru kesintisinin önemli olduğu ve su yaşı ile klor vardır; her biri CSV olarak kaydedilir. Bkz. [WaterCraft: talepler, yangın debisi, kesintiler ve su yaşı](topic:watercraft).

### Birlikte çalışma

- Bir Canlı oturumda, planda birbirinizin imleçlerini ve adlarını görürsünüz. Kütüphane bitkileri: CivilCraft Peyzaj varsayılan Kütüphane koleksiyonuyla başlar: {{ui:CivilCraft peyzajı}}.

## Her uygulamada

- İpuçları Bootstrap ipuçları olarak gösterilir ve başlangıç ipucu kapatılabilir.
- Sığmayan bir panelin sekme şeridi kaydırılır; kesilmez.
- Tarayıcı sekmesi başlıkları `<belge> - CivilCraft | CadCraft` biçimindedir.
- {{ui:Ayarlar}} içinde, yerleşimlerin iki satırlık seçenekler içinde açılır liste olduğu bir {{ui:Yerleşim}} bölümü vardır.
- Ağırlık ve sıcaklık birimleri {{ui:Ayarlar}} › {{ui:Genel}} › {{ui:Birimler}} içindedir.
- Dil listesi, derlemenin dosyalarına sahip olduğu dilleri gösterir. İngilizce dışındaki diller makine taslaklarıdır.

## Düzeltilenler

- Adres araması ve EnergyPlus denetimi eklentileri açılamıyordu; artık açılabilirler.
- Yardım, Nokta bulutları eklentisinin temizlenmiş bulutu LAS 1.4 ya da LAZ olarak yazdığını artık söylüyor.
- Seçili nesnenin kendi tutamacına tıklamak, bekleyen bir Seç'i durduran bir tutamaç sürüklemesini artık başlatmaz.

## Dürüst sınırlar

- Örnek koridor şablonları hiçbir standarda dayanmayan yer tutuculardır; bir mühendis bunları denetlemelidir. Arazi şablonları yüzey eklemez ve 3B'de ya da kesit görünümünde çizilmez. Bir eksendeki ikinci koridor IFC dışa aktarımında yoktur. İstasyona göre iki şablon arasında bir daralma yoktur.
- Nokta bulutları uydurma dosyalarda, gerçek bir drone ölçümünde değil, test edildi. Yalnızca LAS ve LAZ okunur.
- GIS analizi uydurma katmanlarda test edildi.
- Gölge, güneş enerjisi ve konfor planlama tahminleridir; rüzgâr doğrulanmamış bir taramadır. Hiçbiri bir tasarım değeri değildir.
- WaterCraft, uydurma ağlarda denetlenmiş bir hesaplama yardımcısıdır. Sayıların neye değer olduğuna bir su mühendisi karar verir.
- İngilizce dışındaki diller makine taslaklarıdır.
- Windows kurucuları kod imzalı değildir ve macOS disk görüntüsü noter onaylı değildir.

## Daha önce: 0.8 ve 0.8.1

Bu, CivilCraft 0.8 (2026-11-01) ve 0.8.1 (2026-11-02) sürümlerinde, 0.7 ile karşılaştırıldığında neyin değiştiğidir. Büyük yeni parçalar, arazi tesviyenizi ve sitenizi sınayan araçlar (yağmur, toprak işleri, güzergâhlar, havuzlar, ilerleme) ve zemin, yollar, ölçme, madenler, bağlantılar ve demiryolu için altı hesaplama penceresidir.

### Yeni

**Tesviyenizi sınayın**

- **Yağmur yağdır.** {{ui:Yağmur yağdır…}} ({{ui:Yüzey}} altında) tesviye edilmiş zemine bir fırtına bırakır. Suyun platformlardan aktığını, alçak köşelerde birikip çok küçük kalan havuzları taşırdığını izlersiniz. Çalıştırma canlandırılır ve hacimleri, en yüksek çıkış debisini ve her havuzun bir CSV'sini verir. Varsayılan hücre kabadır, böylece ilk bakış hızlıdır; daha ince bir hücre daha yavaştır. Taşan havuzlar Sorunlar panelinde de görünür.
- **Toprak işleri dengeleyici.** {{ui:Toprak işleri dengeleyici…}}, kazı dolguya eşit oluncaya kadar bir platformu yükseltir ya da alçaltır ve aralarındaki taşıma tablosunu gösterir.
- **En iyi güzergâh.** {{ui:En iyi güzergâh…}}: bir başlangıç ve bir bitiş seçin; CivilCraft, tesviye ve eğri sınırlarınıza uyan, arazi üzerindeki en ucuz yolu bulur ve ondan bir eksen oluşturur.
- **Tutma havuzları.** {{ui:Tutma havuzları…}} kademeyi ve depolamayı zemininizden hesaplar, çıkış aygıtlarını (delik, savak, V-kesik, mahmuz) alır, fırtınayı havuzdan geçirir ve tutulan tepe debisini, boşalma süresini ve serbest yüksekliği denetler.
- **Ölçümlerden ilerleme.** {{ui:Ölçümlerden ilerleme…}}, farklı tarihlerdeki drone ya da tarama yüzeylerini, zeminin o zamanki hâli ve tasarımla karşılaştırır: hacme göre yüzde tamamlanma, aşırı kazılmış ve aşırı doldurulmuş alanlar, stoklar ve bu hızla iş ne zaman biter (tahmin olarak işaretlenmiş).

**Siteyi tanıyın**

- **Adresten arsaya.** {{ui:Adresten arsaya…}}, açık parsel, bina, imar, toprak, sel ve arazi verilerini tek bir sitede bir araya getirir. Siteyi proje dosyasında tutabilirsiniz: yazılan adres, her kaynak, onu çektiğiniz gün ve lisansı, ve geri gelenler. Projeyi yeniden açın ya da paylaşın, site yerinde durur ve hiçbir şey yeniden çekilmez. Siteyi bir site dosyası olarak da kaydedebilir ya da BimCraft'a gönderebilirsiniz. Bkz. [Adresten arsaya](topic:address-to-site).

**Zemin, yollar, ölçme, madenler, bağlantılar ve demiryolu**

- **Zeminler ve şevler.** {{ui:Zeminler ve şevler…}}, yazdığınız sondajlar arasında zemin profilini çizer. Bishop yöntemi, sizin zemininiz üzerinde, bir su tablası, bir ek yük ve bir deprem katsayısıyla kritik dairesel kaymayı arar; bir temelin oturması, konsolidasyon, anlık oturma ve zamanı içerir.
- **Kavşaklar ve çizgilendirme.** {{ui:Kavşaklar ve çizgilendirme…}}, kolları kıvrımlı bordür dönüşleriyle (kol başına bir yarıçap ya da üç merkezli dönüşler), tasarım hızına göre görüş mesafesiyle, görüş üçgenlerinin denetimiyle, yaya geçitleri, durma çizgileri, işaretlemeler ve işaret listeli işaretlerle bir araya getirir. Planda çizilirler ve adlandırılmış katmanlarla bir .dxf olarak kaydedilirler.
- **Ölçme dengelemesi.** {{ui:Ölçme dengelemesi…}}, bir poligon ya da ağın en küçük kareler dengelemesini yapar: dengelenmiş koordinatlar, hata elipsleri, ki-kare testi ve uymayan ölçüme bir işaret. Serbest ağlar, pusula kuralı ile poligonun kapatılması ve RW5, GSI, JobXML ya da CSV saha dosyaları dahildir; dengelenmiş noktalar CSV olarak kaydedilir.
- **Açık ocaklar.** {{ui:Açık ocaklar…}}, sondaj numunelerini bir blok modeline ve eğim açınızın içindeki nihai ocağa çevirir; tanesi başına şerit oranı, basamağa göre bir tablo ve bir tenör ve tonaj eğrisiyle. Gelir çarpanına göre iç içe ocaklar ve indirgenmiş nakit akışlı bir üretim programı da vardır.
- **Radyo linkleri.** {{ui:Radyo linkleri…}}, zemininiz üzerinde yeryüzünün kabarıklığıyla, birinci Fresnel bölgesiyle, link bütçesiyle, sönümleme payıyla ve çok yollu kesintiyle görüş hattını denetler ve yolu açacak direk yüksekliğini verir. Ayrıca fiber kayıp bütçeleri, güzergâh miktarları ve bir kuledeki rüzgâr yükü de yapar.
- **Makas ve geçit.** {{ui:Demiryolu makasları…}}, bir makası kalp numarasından, paralel raylar arasındaki geçitlerden ve eğim ile tilt edilip bir eğride genişletilen bir yapı açıklığından oluşturur. Bir makas, bir eksenin bir istasyonunda durabilir.

Bkz. [Zemin, kavşaklar, ölçme dengelemesi, ocaklar, radyo linkleri ve makaslar](topic:soils-roads-survey-mines-links).

### Her uygulamada

- **Diller.** 54 dil, bunlardan on tanesi yeni. İngilizce dışındaki diller, bir ana dil konuşanı okuyana kadar makine taslağıdır. Yardım konuları çoğunlukla hâlâ İngilizcedir.
- **Araç çubuğu satırları.** {{ui:Ayarlar}} › {{ui:Genel}} › {{ui:Araç çubuğu satırları}}: Sar (öncesi gibi), 2 satır ya da 1 satır. CivilCraft'ın Şeridi en çok kullanılan aracı büyük, sonrakileri küçük gösterir ve kalanları grup adının okunun arkasında tutar.
- **Giriş aygıtları.** Dokunmatik yüzey, kalem, 3B fare, denetleyici ve MIDI uygulamaları yönetebilir.
- **Sorunlar.** Her uygulamada uyarı veren bir Sorunlar paneli; düzenleme paketlerini okuyan denetimlerle.
- **Canlı.** Bir Canlı oturumda kimin nerede olduğunun görünümü.
- **Eklentiler.** Aydınlatma eklentileriyle bir eklenti listesi.
- **Bir yapay zekâyı bağlayın.** Bağladığınız her asistan, CivilCraft'ın araçlarını yönetebilir. CadCraft Studio içinde tek tıkla bağlanma ve barındırılan bağlayıcının henüz hazır olmadığına dair bir not ile gelir. Bkz. [Bir yapay zekâ asistanının sahanızda çalışmasına izin verin](topic:assistants).

### 0.8.1'de düzeltilenler

- **DWG sınıfları bölümü.** Yanlış tür olarak okunuyordu (GitHub cadcraft#5). CadCraft, BimCraft, ModelCraft ve TakeoffCraft ile birlikte CivilCraft'ta düzeltildi.
- **Çalışırken dil değiştirme.** CadCraft Studio ve paketlenmiş sürümler, çalışma anında dil değiştirebilir. Önceden yalnızca İngilizceydiler. Her platformda henüz test edilmedi: dil değişmezse bize bildirin.

### Bu sürümde henüz yok

- **Bunlar hesaplama yardımcılarıdır.** Yeni pencerelerdeki her sonucun bir mühendisin denetimine ihtiyacı vardır. Zemin dayanımları, zemin grubu için tipik değerlerle başlar ve pencere bunu söyler.
- **Yağmur yağdır.** Örnek sitede bir çalıştırma, ince bir hücrede tarayıcıda iki dakikadan fazla sürebilir. El örnekleriyle ve V biçimli bir havzayla denetlendi, gerçek bir tesviye edilmiş sitede henüz değil.
- **Adresten arsaya.** Getirdiğiniz açık veri dosyalarını okur ve yalnızca kendi dosyalarımızda test edildi. Ağaçlar bir kaynak değildir. Sizin için kaynak çekmek, gizlilik metnini bekler.
- **Ölçümlerden ilerleme.** Yalnızca uydurma ölçümlerde test edildi. Paftalardaki ve işaretlemelerdeki (MarkupCraft) ilerleme ile tarama ve model karşılaştırması (BimCraft) yapılmadı.
- **Zeminler ve şevler.** Yalnızca dairesel yüzeyler: kama ya da blok araması ve çekme çatlağı yok.
- **Kavşaklar.** Kol başına bir yarıçap, kamyon dönüş izleri yok ve henüz koridora girmiyorlar.
- **Saha dosyaları.** Okuyucular, herkese açık biçim açıklamalarından yazıldı ve bizim yaptığımız dosyalarda denendi. Gerçek cihaz dosyaları isteniyor.
- **Radyo linkleri ve demiryolu.** Radyo linkleri: yalnızca serbest alan kaybı ve çok yollu (yağmur sönümü ya da anten örüntüleri yok) ve demiryolu standardı yok: her demiryolu sınırı bir yer tutucudur, hiçbir demiryolu mühendisinin denetlemediği taslak sayılarla.

Diğer her şey için bkz. [Henüz yapılmadı](topic:not-built-yet). Bir önceki sürüm için bkz. [0.7'de yenilikler](topic:whats-new-0-7).
