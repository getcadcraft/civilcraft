---
title: 0.7'de neler yeni
summary: CivilCraft 0.7; bir Enerji hatları çalışma alanı (kendi kütüphaneleriniz, sarkma ve gerilim, açıklık ve dayanım denetimleri, gerdirme tabloları, metrajlar, sayfalar ve CBS ile havai hatlar ve yeraltı kabloları), bir Peyzaj çalışma alanı (bir bitki listesi, dikim planları ve listeleri, peyzaj tesviyesi, kaplama, duvarlar ve basamaklar, bir sulama hesap yardımcısı, peyzaj sayfaları ve serbest biçimli nesneler), yazdığınız imar sınırlarıyla bina kütleleri ve güneş saatleri, klotoid spiraller, her yanda parçalardan oluşturulan koridorlar, USD dışa aktarma ve yapay zekâ asistanları için daha fazla araç ekliyor.
keywords: yenilikler, sürüm notları, değişiklik günlüğü, değişiklikler, 0.7, sürüm, yeni özellikler, peyzaj, peyzaj çalışma alanı, bitki listesi, bitkiler, dikim, bitki listesi, yatak, çit, tesviye, platform, berm, hendek, nokta kotu, eğim analizi, su birikmesi, sert zemin, kaplama, patika, duvar, bordür, rampa, basamaklar, sulama, yağmurlama, damla, peyzaj sayfaları, serbest biçimli nesne, bina kütlesi, kütle, brüt kat alanı, imar, çekme mesafesi, zarf, gökyüzü düzlemi, taks, kaks, güneş saatleri, gölge, ifc, bimcraft'ta geliştir, spiral, klotoid, geçiş, kesit, bordür, oluk, kaldırım, usd, asistanlar, birimler, portekizce
from: 3c9d79db
---

Bu, CivilCraft 0.7'de 0.6'ya göre nelerin değiştiğidir. En büyük yeni parçalar Enerji hatları ve Peyzaj çalışma alanları ile bina kütleleridir.

## Yeni

### Peyzaj çalışma alanı

- **Aynı arsada bir Peyzaj çalışma alanı.** {{ui:Yüzey}} › {{ui:Daha fazla}} › {{ui:Peyzaj çalışma alanı}}, elinizdeki arsaya dikim, tesviye, sert zemin ve sulama araçları ekler: aynı ölçü noktaları, yüzeyler ve proje dosyası. Geri dönmek için **Çalışma alanı** altında **Sivil**'i seçin. Bkz. [Peyzaj çalışma alanı](topic:landscape).
- **Bir bitki listesi.** Dikimdeki ve olgunluktaki boyutları, sertlik bölgesi, ışık, su ve aralığıyla yaklaşık 420 yaygın ılıman ve Akdeniz ağacı, çalısı, çiti, otu, çok yıllık bitkisi, zemin örtüsü ve sarmaşığı. İngilizce, İspanyolca veya Portekizce herhangi bir adla arayın. Kendi listenizi CSV olarak içe aktarın; projeyle birlikte kaydedilir. Yerleşik boyutlar tipik ve yuvarlatılmıştır: yerel bir fidanlıkla denetleyin. Bkz. [Bitki listesi](topic:plant-list).
- **Dikim planları.** {{ui:Bitki}} zemine oturan ve sonraki tesviyeyi izleyen tek bitkiler yerleştirir, {{ui:Yatak}} bir sınırı bitkilerin aralığında yüzdeye göre bir karışımla doldurur ve {{ui:Çit}} bir çizgi boyunca bir veya iki sıra koyar. Bitkiler planda etiketlenir. Bkz. [Dikim planları ve listeleri](topic:planting).
- **Bir bitki listesi.** Daha fazla › {{ui:Bitki listesi…}} bitkileri türe ve dikim boyutuna göre sayar. CSV veya XLSX olarak kaydedin ya da fiyatlandırmak için TakeoffCraft'a gönderin. Bkz. [Bitki listesi](topic:planting#the-plant-schedule).
- **Peyzaj için tesviye.** {{ui:Tesviye}} platformlar (düz veya eğimli), bermler, hendekler ve nokta kotları ile sürüklediğiniz kontur eğrileri olan tesviye alanları içerir. Kazı ve dolgu siz çalışırken görünür. **Eğim analizi** yüzeyi kendi iki sınırınıza göre renklendirir ve **Akış okları ve göllenme** suyun nereye aktığını ve nerede birikeceğini gösterir. Hepsi platformlar ve koridorlarla aynı önerilen yüzeye girer. Bkz. [Peyzaj için tesviye](topic:landscape-grading).
- **Kaplama, patikalar, duvarlar, bordürler, rampalar ve basamaklar.** {{ui:Sert zemin}} enine eğimli ya da bir süzgece düşen kaplama, bir desen ve katmanları; zemini izleyen patikalar; kademeli temelli istinat ve serbest duvarlar; bordürler; ve belirlediğiniz sınırlara göre denetlenen rampalar ve basamaklar çizer. 1,2 m'yi (4 ft) aşan bir istinat duvarı bir mühendis için işaretlenir. Bkz. [Kaplama, duvarlar ve basamaklar](topic:hardscape).
- **Bir sulama hesap yardımcısı.** {{ui:Sulama}} başlıkları, yan hatları, ana hattı, vanaları, damla hatlarını ve bağlantı noktasını yerleştirir. {{ui:Sistemi denetle…}} bölgeleri borulardan bulur ve her bölgenin debisini, vanasında ve beslemede gereken basıncı (Hazen–Williams), yağış miktarını, çalışma sürelerini, kapsamayı ve bir malzeme listesini hesaplar. Bir hesap yardımcısıdır, tasarım belgesi değildir: bir sulama tasarımcısı her sonucu denetler. Başlıklar genel türlerdir veya bir dosyadan kendi başlıklarınızdır. Bkz. [Sulama tasarımı](topic:irrigation).
- **Peyzaj sayfaları.** Daha fazla › {{ui:Peyzaj sayfaları…}} dikim, tesviye ve sulama planlarını göstergeleriyle ve duvar kesitleri, kaplama katmanları ve basamakların bir ayrıntı sayfasını tek PDF olarak yapar. Bkz. [Peyzaj sayfaları](topic:landscape-sheets).
- **Serbest biçimli nesneler.** Daha fazla › {{ui:Serbest biçimli nesne…}} başka bir uygulamada yapılmış bir STL, OBJ veya kütüphane öğesi örgüsü (mesh) yerleştirir; örneğin bir saksı veya bir heykel. Zemine oturur ya da içine keser ve hacmi, alanı ve ayak izi sayılır. Bkz. [Serbest biçimli nesneler](topic:freeform-objects).
- **Peyzaj IFC'si.** Daha fazla › {{ui:Peyzaj IFC'sini dışa aktar}} bitkileri (özellikleriyle bitki örtüsü olarak), sert zemini ve serbest biçimli nesneleri bir BIM modeli için IFC 4.3 olarak kaydeder. Bkz. [IFC](topic:planting#ifc).
- **Baştan sona.** [Baştan sona bir bahçe tasarlama](topic:landscape-walkthrough) örnek arsada çalışma alanının tamamını adım adım anlatır.

### Enerji hatları çalışma alanı

- **Arsanızda havai hatlar ve yeraltı kabloları.** {{ui:Yüzey}} › {{ui:Daha fazla}} › {{ui:Enerji hatları çalışma alanı}}: aynı zeminde ve aynı proje dosyasında bir hattı direkleriyle, hendeklerdeki kabloları, ekipmanı ve engelleri çizin. Bkz. [Enerji hatları çalışma alanı](topic:power-lines).
- **Kendi kütüphaneleriniz.** İletkenler, kablolar, direkler, ekipman (travers, izolatör, bağlantı parçaları, gergiler, transformatörler, kabinler, ekler) ve hendek tipleri; adlandırdığınız kategorilerde, bir dosya veya bir elektronik tablo olarak paylaşılır. Hiçbir ülkenin ya da üreticinin kataloğu yerleşik değildir; örnekler örnek olduklarını söyler. Bkz. [Enerji hattı kütüphaneniz](topic:power-line-library).
- **Yük durumlarınıza göre sarkma ve gerilim.** Sıcaklık, rüzgâr, buz ve tek yanda buz; kopma dayanımının bir payı üzerinden gerilim sınırları; eğimler dahil her açıklıkta tam katener; gerdirme tabloları. Bkz. [Sarkma ve gerilim](topic:sag-and-tension).
- **Her zaman güncel denetimler.** Zemin ve engeller üzerindeki açıklık, faz aralığı, izolatör salınımı, yukarı çekme, kütüphanenizden boyutlandırmayla direk yükleri, gergiler, bağlantı parçaları, temeller, eksik veri, bağlantısı kopuk kablolar, aşırı yükler ve gerilim düşümü; planda ve hat boy kesitinde işaretlenir. Bir tasarım yardımcısıdır: bir mühendis denetler. Bkz. [Enerji hattı denetimleri](topic:power-line-checks).
- **Tablolar, sayfalar ve CBS.** Gerdirme ve direk tabloları, metrajlar (CSV, Excel, TakeoffCraft), tek PDF'te bir etüt raporuyla plan ve boy kesiti sayfaları, her varlığın verisiyle CBS katmanları. Bkz. [Enerji hattı tabloları, metrajları, sayfaları ve CBS](topic:power-line-outputs).
- **İlk denemelerden sonra.** Hat boy kesiti seçtiğiniz hattı izler, bir **Hat** listesine sahiptir, işaretçinin altındaki zemini, iletkeni ve açıklığı okur ve iki nokta arasını ölçer. Peyzaj bitkileri ve duvarları hatların altında engel sayılır; kablo güzergâhları ve borular hat boy kesitinde görünür ve seçtiğiniz bir açıklık kuralıyla kesişir; her açıklığın yanındaki **Kurallar…** kendi kurallarınızı açar; ve bir kütüphaneyle kural kümeleri ülkeye göre paylaşılacak paketler olarak kaydedilir. Bkz. [Enerji hattı denetimleri](topic:power-line-checks) ve [Paketler](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Kendi dosya biçimleriniz.** Enerji hatları CivilCraft proje dosyasında, kütüphaneler `.cclines.json` veya CSV içinde, kural kümeleri ve paketler kendi JSON dosyalarında kaydedilir: herkesin okuyabileceği veya dönüştürebileceği açık biçimler. `.DON` etüt dosyası bunların yanında ek bir içe ve dışa aktarmadır.
- **Etüt dosyaları (.DON), denenmedi.** Bir hattı başka bir hat programı için `.DON` etüt dosyası olarak kaydedin veya birinin direklerini okuyun; biçimin alan adlarından oluşturuldu, henüz o programla denenmedi. Bkz. [Etüt dosyaları](topic:power-line-study-file).

### Ölçme

- **Bir Ölç aracı.** {{ui:Yüzey}} › {{ui:Daha fazla}} › {{ui:Ölç}} (veya {{key:M}}) planda ölçer: her kenarın uzunluğu ve yön açısı, çalışan toplam, zemin boyunca uzunluk ve eğim ve şekli kapattığınızda alan ile çevre. Projeye hiçbir şey çizilmez. Bkz. [Ölç](topic:measure).

### Bina kütleleri

- **Bina kütleleri çizin.** Özellikler'de **Bina kütleleri** altında {{ui:Kütle çiz}} (ayrıca {{ui:Yüzey}} › {{ui:Daha fazla}} › {{ui:Kütleler}}). Bir kütleye katlar ve bir kat yüksekliği verin ve brüt kat alanını okuyun. Eğimli zeminde nasıl oturacağını seçin (kademeli, podyum veya kazı) ve dolgu ile kazıyı görün. Kütleler planda, PDF'te ve DWG ile DXF'te kendi katmanlarında görünür. Bkz. [Bir arsada bina kütleleri çizme](topic:building-masses).
- **3B'de it ve çek.** 3B görünümde seçili bir kütlenin çatısını sürükleyin ya da {{key:PageUp}} ve {{key:PageDown}} tuşlarına basın; tek geri alma adımında bir kat birden değişir. **Güneş** kütlelerin gölgelerini düşürür. Bkz. [3B görünümde](topic:building-masses#in-the-3d-view).
- **Yazdığınız imar sınırları.** Sokak çizgisinden satır satır çekme mesafeleri, bir yükseklik sınırı, bir gökyüzü açıklığı düzlemi, bir kat alanı oranı (KAKS) ve bir taban alanı oranı (TAKS). İnşa edilebilir zarf planda çizilir ve her kütle her sınır için bir onay veya çarpı alır. CivilCraft'ın içinde hiçbir imar mevzuatı yoktur: her sayı kendi yönetmeliğinizden yazdığınız bir sayıdır. Bkz. [Kütleleri yazdığınız imar sınırlarına göre denetleme](topic:zoning-limits).
- **Güneş saatleri.** Bir gün ya da bir mevsim ve adıyla ya da farkıyla bir saat dilimi seçin; her kütlenin her duvarında kat kat ve çevrelerindeki zeminde doğrudan güneş saatlerini okuyun, planda çizilir. Duvarları ve zemini CSV olarak kaydedin. Projenin bir koordinat sistemi olması gerekir. Bkz. [Bir arsada güneş saatlerini hesaplama](topic:sun-hours).
- **Kütleler IFC olarak ve BimCraft'a.** {{ui:Kütleler IFC olarak}} kütleleri IFC4 olarak kaydeder; projenin bir koordinat sistemi varsa haritaya yerleştirilir. {{ui:BimCraft'ta geliştir}} BimCraft'ı kütlelerle yeni bir sekmede açar; orada **Bu kütleyi geliştir** her katta duvarları ve ayak izinden bir döşeme oluşturur. Hiçbir şey yüklenmez. Bkz. [Devam ettirme](topic:building-masses#send-it-on).

### Eksenler

- **Klotoid spiraller.** Bir eğri için PI tablosunda **Giriş spirali** ve **Çıkış spirali** alanlarına bir uzunluk yazın: teğet, spiral, eğri, spiral, teğet; eşit veya farklı uzunluklarla. Plan TS, SC, CS ve ST'yi etiketler, eğri listesi θs ile teğet ve dış mesafeleri verir ve istasyonlar ve kaymalar spiraller boyunca devam eder. Bkz. [Spiraller](topic:alignment#spirals).
- **LandXML'de spiraller.** LandXML klotoid spiralleri yazar ve okur. CivilCraft'ın içe aktarmada eskiden atladığı spirallı eksenler artık açılır. Bkz. [LandXML alışverişi](topic:landxml).

### Koridorlar

- **Her yanı parçalardan oluşturun.** Her yana eksenden dışa doğru kendi listesini vermek için **Her yanı parçalardan oluştur** seçeneğini açın: şeritler, bir bankuet, bir oluk, bir bordür, bir bitki şeridi, bir kaldırım ve kendi kazı ve dolgusuyla bir yan şev. {{ui:Kırsal yol}} veya {{ui:Kentsel cadde}} ile başlayın ve bir yanı diğerine kopyalayın. Enine kesitler kot çizgisini (flowline), bordürü ve yürüme yolunu işaretler ve tesviye edilmiş yüzeyde bordür bulunur. Bkz. [Her yanı parçalardan oluşturma](topic:corridor#build-each-side-from-parts).
- **Spiraller üzerinde süperelevasyon.** Spirallı bir eğride süperelevasyon geçişi spiral üzerinde işler: TS'de düz tepe, SC'de tam süperelevasyon. Bkz. [Süperelevasyon](topic:corridor#superelevation).

### 3B dosyaları

- **USD dışa aktarma.** 3B görünümde {{ui:USD}} arsayı gerçek ölçekte ve proje koordinatlarında `.usda`, `.usdc` veya `.usdz` olarak yazar: yüzeyler, borular ve yapılar örgü olarak, çizgiler, her eksen ve numaralarıyla ölçü noktaları. Bkz. [3B arsayı USD olarak dışa aktarma](topic:usd).

### Yapay zekâ asistanları

- **Asistanlar için daha fazlası.** {{ui:Ayarlar}} › {{ui:CivilCraft}} içinde asistanlar açıkken bir asistan artık ayrıca parselleri, kazı ve dolguyu ve boy kesitlerini okuyabilir, ölçü noktaları ekleyebilir, projeyi kaydedebilir, LandXML, DWG ve USD dışa aktarabilir ve CadCraft Studio'da seçtiğiniz klasörlerde çalışabilir. Peyzaj çalışma alanı bitki bulmak, bitki, yatak ve çit yerleştirmek, tesviye yapmak ve sulamayı denetlemek için araçlar ekler. Dosya sunucusu ve `cadcraft` komut satırı kayıtlı projeleri pencere olmadan açar. Bkz. [Bir yapay zekâ asistanının arsanızla çalışmasına izin verme](topic:assistants).

## Her uygulamada

- **Birimler.** {{ui:Ayarlar}} › {{ui:Genel}} › {{ui:Birimler}} içinde uzunluk, alan, hacim, açı ve eğim için birer liste vardır; boyutlar birimlerin tanımlarının verdiği tam değerlerdir (ABD ölçme fiti kendi birimidir). Hiç kullanmadığınız birimleri kapatın, birim listelerinden çıkarlar; birini yıldızlayın, yeni çalışma onunla başlar. Bir dosya her zaman kendi birimini korur. CivilCraft'ta projenin **Birimler** listesi anahtarları izler; metrik bir uzunluk yıldızı yeni projeleri metrede başlatır (aksi halde fit, yani ABD ölçme fiti), bir alan ya da hacim yıldızı alanların ve hacimlerin raporlandığı birimi ayarlar ve bir uzunluk kutusu `3 ch` veya `450 mm` gibi herhangi bir birimin işaretini kabul eder. Bkz. [Birimler, yazılan değerler ve birim listeleri](common:unit-lists).
- **Daha sıkı bir yerleşim ve toparlanan paneller.** {{ui:Ayarlar}} › {{ui:Genel}} › {{ui:Düzen yoğunluğu}} › {{ui:Sıkı}} ekrana daha fazlasını sığdırır (dokunmatik ekranlar ve telefonlar büyük düğmelerini korur). Her yan panelin ince bir başlık çubuğu vardır: panelin yerleşmesi veya yüzmesi için sürükleyin, başka bir panelin çubuğuna bırakarak sekmeler olarak tek bir çerçeveyi paylaşın, kenara kayıp gitmesi için iğneleyin veya gizleyin ve kenardan geri getirin. Bkz. [Panelleri düzenleme](common:arrange-panels#make-the-layout-denser).
- **İletişim kutuları taşınır.** Bir iletişim kutusunu başlık çubuğundan çizimin önünden çekin; bıraktığınız yere geri gelir. Yeniden ortalamak için başlık çubuğuna çift tıklayın. Bkz. [Bir iletişim kutusunu taşıma](common:arrange-panels#move-a-dialog).
- **Yapay zekâ asistanları için tarifler.** Kendi asistanınız için on uygulamalı istek (bir çizimi düzenleme, bir takımı çıktı alma, çizimleri denetleme, bir modele soru sorma, bir metrajı toplama, bir parça varyantını deneme…), her birinde çağırdığı araçlar ve gereken izinlerle ve her biri testlerimizce yeniden oynatılarak. Uygulamalarda yapay zekâ yoktur. Bkz. [Yapay zekâ asistanları için tarifler](common:assistants-recipes).
- **Diller.** **Português (Portugal)**, {{ui:Ayarlar}} › {{ui:Genel}} › {{ui:Dil}} içinde yenidir. O, **Português (Brasil)**, **Español (México)** ve **Bahasa Indonesia** artık uygulamaların her sözcüğüne sahiptir; anadili konuşan biri tarafından henüz gözden geçirilmemiş taslaklar olarak. Yardım konuları İngilizcedir, birkaçı İspanyolcadır.
- **CadCraft Studio**, bir güncelleme denetiminin neden başarısız olduğunu (sisteminiz için henüz dosya yok, ağ yok, hatalı imza) yalnızca "Bitti" demek yerine söyler ve kapattığınız bir Yenilikler kartını daha yeni bir sürüm çıkana kadar geri getirmeyi bırakır.

## Bu sürümde henüz olmayanlar

- **0.7 kod imzalı değildir.** İmzalama ve Microsoft Store paketi, sertifika doğrulaması henüz sonuçlanmadığı için 0.8'e kaydı. getcadcraft.com/download adresinde her dosyanın yanındaki SHA-256 değerini denetleyin. Windows'ta SmartScreen yükleyiciyi durdurursa {{ui:Daha fazla bilgi}}, ardından {{ui:Yine de çalıştır}} seçin. Mac'te ilk seferde CadCraft Studio'ya sağ tıklayıp {{ui:Aç}} seçin. CadCraft Studio henüz bir uygulama mağazasında değildir ve henüz iPad veya iPhone sürümü yoktur.
- {{ui:Birimler}} içindeki açı ve eğim listeleri kaydedilir, ama henüz hiçbir kutu onları okumaz.
- Üreticilerin sulama başlıkları: yalnızca genel başlıklar ve bir dosyadan kendi başlıklarınız. Üreticilerin verisi yalnızca izinleriyle gelir ve henüz hiçbiri verilmedi.
- BimCraft ve ModelCraft bitki listesini taşır ama Kütüphaneden yerleştir henüz bitki sunmaz. Bitkiler BimCraft'a peyzaj IFC'si üzerinden ulaşır.
- Asistanlar için peyzaj araçları CivilCraft penceresi açıkken çalışır; dosya sunucusunda ve komut satırında henüz yoktur.
- Bina kütleleri: cephe gün ışığı veya rüzgâr yok, ağaçlardan veya kütle olarak çizilmemiş hiçbir şeyden gölge yok, çatı biçimi yok ve güneş saatleri planda gösterilir, 3B görünümde değil. BimCraft'ta geliştir açıklıksız ve çatısız düz duvarlar ve bir döşeme oluşturur.
- Enerji hatları: hiçbir ülkenin standardı yerleşik değil (yük durumlarını, sınırları ve açıklıkları siz belirlersiniz); iletken sünmesi, gömülü kabloların ısıl anma değeri, kısa devre, koruma veya topraklama etütleri yok; 3B görünümde veya IFC'de hat yok. `.DON` etüt dosyası onu okuyan programla denenmedi.
- Klotoid dışındaki spiraller, iki eğri arasında bir spiral ve özellik çizgilerinde spiraller. Spiraller formüllere ve LandXML şemasına göre denetlendi, henüz başka bir programdan gelen spirallı bir LandXML dosyasına göre değil.
- Yol boyunca değişen koridor kesitleri, bölgeler ve yan şev için hedefler.
- Su ana hatları ve basınçlı ağlar (sonraki inşaat işi), zamanla değişen akışlar ve su ile yağmur suyu ağları arasındaki bağlantılar.
- Çizilmiş kırılma çizgilerinde yaylar. Standart tasarım aracı tabloları: gelen beş araç yer tutucu olarak etiketlenmiştir. Projeler arasında paylaşılan özellik çizgileri takım projelerini bekliyor.

Geri kalan her şey [Henüz yapılmayanlar](topic:not-built-yet) içindedir.
