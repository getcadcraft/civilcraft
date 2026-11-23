---
title: Henüz yapılmadı
summary: Bu CivilCraft sürümünün henüz yapmadıkları ve bugün bunun yerine ne yapılacağı.
keywords: eksik, sınırlamalar, yol haritası, kullanılamıyor, sarmallar, genişletme, dwg, dxf, giriş ağızları, tutma, enine kesitler, ileride gelecek, sınırlar
from: b91588d4
---

CivilCraft erken aşamadadır. Bu sayfa, mevcut sürümün yapmadıklarını listeler; böylece onları aramazsınız. Burada hiçbir şey bir tarihe bağlı olarak vaat edilmez.

## Noktalar

| Henüz yapılmadı | Bunun yerine bugün |
|---|---|
| İlk nokta dosyasına ikinci bir nokta dosyası ekleme | Önce dosyaları bir metin düzenleyicide veya elektronik tabloda birleştirin |
| Bir nokta metin dosyası dışa aktarma | LandXML dışa aktarın (noktalar CgPoints olarak çıkar), GIS {{ui:Dışa aktar}} kullanın (P, N, E, Z ve D alanlı noktalar) veya noktaları bir elektronik tabloya {{ui:Kopyala}} edin |
| Nokta etiket stilleri, tanım anahtarı başına semboller, satır kodlarından yaylar (eğriler), projeler arasında paylaşılacak bir tanım anahtarı dosyası | Etiketler numarayı, kotu ve tanımı ya da daha azını gösterir ([CivilCraft ayarları](topic:settings)); anahtarlar proje dosyasında tutulur |
| Birim dönüşümü | İçe aktarmadan önce dosyayı dönüştürün; **Birimler** yalnızca etiketi değiştirir |

## Yüzeyler

| Henüz yapılmadı | Bunun yerine bugün |
|---|---|
| Noktalardan oluşturulmuş birden çok yüzey | Yüzey başına bir proje |
| İç sınırları gizleme | **En uzun dış kenar** veya bir dış sınır kullanın |
| Çizilmiş tek bir kırılma çizgisini seçme veya düzenleme | {{key:Mod+Z}} veya {{ui:Çizilmiş kırılma çizgilerini kaldır}} ve yeniden çizin |
| LandXML'den okunan bir yüzeyi düzenleme (kırılma çizgileri, sınır) | {{ui:Yüzeyi noktalardan yeniden oluştur}} |
| Bir yükseklik ızgarasından yapılmış bir yüzeyi düzenleme | Izgarayı farklı seçeneklerle yeniden içe aktarın |
| Koordinat sistemi değiştiğinde LandXML'den okunan bir yüzeyi dönüştürme | Önce {{ui:Yüzeyi noktalardan yeniden oluştur}} |
| Etiketli nokta kotları ve eğim değerleri | Bunları durum çubuğunda okuyun veya Peyzaj çalışma alanındaki **Eğim çözümlemesi** ile yüzeyi eğime göre renklendirin ([Peyzaj için tesviye](topic:landscape-grading#grading-checks)) |

## Eksenler ve boy kesitleri

| Henüz yapılmadı | Bunun yerine bugün |
|---|---|
| Klotoid dışındaki sarmallar; iki eğri arasında bir sarmal (bileşik geçişler) | Bir eğrinin uçlarındaki klotoid sarmallar kullanılabilir; diğerleri adlandırılır ve LandXML içe aktarımında atlanır |
| İki başka PI arasına bir PI eklemek | Ekseni yeniden çizin veya PI koordinatlarını yeniden yazın |
| Nesnelerden, ofsetlerden, genişletmelerden oluşan eksenler | PI'larla çizin |
| Düşey bir eğri için K yazmak | L yazın (K gösterilir) |
| Dairesel ve simetrik olmayan düşey eğriler | Yalnızca simetrik parabolik eğriler |
| Eksen başına birden fazla tasarım boy kesiti | Her varyant için bir eksen |
| Boy kesiti görünümünü yakınlaştırma, boy kesitinin altındaki boy kesiti bantları | Boy kesiti görünümü tüm ekseni sığdırır; [plan ve boy kesiti sayfalarında](topic:plan-profile-sheets) çizdirin |
| DWG veya LandXML'de kesitler | PDF olarak kesit sayfaları; alan ve hacimlerin {{ui:CSV}} dosyası |
| Açılı örnek çizgileri veya yol boyunca farklı genişlikte örnek çizgileri | Tüm eksen için her iki tarafta bir genişlik |

## Koridorlar

| Henüz yapılmadı | Bunun yerine bugün |
|---|---|
| Orta refüjler, bariyerler ve şablonları döndüren süperelevasyon | Bunları şablon olarak çizin ([Koridor şablonları](topic:corridor-templates)); istasyona göre şablonlar henüz süperelevasyonu desteklemez |
| İki bölgenin şablonları arasında kademeli bir değişim (geçişler, daralmalar) | Bir istasyonda şablonu değiştirin veya geçiş olarak çizilmiş bir çizgiye bir noktaya genişlik hedefi verin |
| Bir kenar etrafında döndürme, LandXML'de süperelevasyon | Süperelevasyon, dairesel eğrilerde eksen çizgisi etrafında döner; bir şeridi genişletmek için bir özellik çizgisine genişlik hedefi kullanın |
| Şev için hedefler (yarma-dolgu sınırını bir çizgiye veya yüzeye bağlama), kendi koridor yüzeyleri | Hedefler kaplama kenarlarını ve bankuetleri taşır ([Koridorlar](topic:corridor)); koridor önerilen yüzeye tesviye edilir |
| Kavşaklarda kıvrımlı bordür dönüşleri, dönüş şeritleri ve adacıklar tesviyesi; yan yolun ucunun eğik bir açıda ana yolun kenarına kesilmesi; bir yolun planda, uzunluğunda ve alanında bir patikaya birleşmesi | Birleşen yollar dik birleştirilir; ana yolun kenarı açılır ve yan yol ona doğru yumuşatılır ([Yollar buluştuğunda](topic:corridor#where-roads-meet-roads-pads-and-paths)); bir patika önerilen yüzeyde ve 3B'de yolun kenarında biter |
| Koridorlar LandXML yol olarak dışa aktarılır; IFC dışa aktarımında bir eksende ikinci bir koridor | Önerilen yüzey dışa aktarılır |
| Önerilen yüzeyi, 3B'de ya da kesitlerde değiştiren arazi şablonları | Her katmanın alan ve hacimlerini verirler ([Arazi şablonları](topic:corridor-templates#terrain-templates)) |
| Hız, lastik kayması, direksiyon süresi, direksiyonlu römorklar veya gövde açıklığı ile dönüş izleri; standart tasarım araçları kütüphanesi; aracı sürükleyerek çizilen bir dönüş izi | Bir özellik çizgisi veya ekseni boyunca düşük hızlı dönüş izleri, kendi araç boyutlarınızla ([Araç dönüş izleri](topic:swept-paths)) |

## Tesviye ve hacimler

| Henüz yapılmadı | Bunun yerine bugün |
|---|---|
| Kademeler, tasarıma tesviye edilen açık özellik çizgileri, başka yerden bir özellik çizgisine tesviye | Özellik çizgisini kapatın ([Özellik çizgileri](topic:feature-lines)) veya mevcut zeminin kırılma çizgisi olarak kullanın |
| Bir özellik çizgisinin köşesini ekleme veya kaldırma | Çizgiyi yeniden çizin veya ondan basamaklı bir ofset yapın |
| Çizilmiş kırılma çizgilerinde yaylar (araziden geçen noktalarda), özellik çizgilerinde sarmallar | Yaylı bir özellik çizgisi çizin ve mevcut zeminin kırılma çizgisi olarak kullanın |
| Bir mesafeye, kotuna veya başka bir yüzeye tesviye | Yalnızca mevcut zemine yarma-dolgu sınırı |
| Bir platform köşesi ekleme veya kaldırma | Platformu silin ve yeniden çizin |
| TIN'den TIN'e (prizma) hacimler, hücre boyutunun seçilmesi | Izgara yöntemi, hücre boyutu sizin için seçilir |
| Şişme ve büzülme, bitki toprağı, döşeme derinlikleri | Bildirilen sayılara katsayıları kendiniz uygulayın |
| Serbest taşıma ve aşırı taşıma maliyetleri, farklı eksenler arasında taşıma, plana yerleştirilmiş ödünç alma sahaları ve atık sahaları | Denge noktaları, taşınan hacimler ve ortalama taşıma mesafeleriyle kütle taşıma diyagramı |

## Boru ağları

| Henüz yapılmadı | Bunun yerine bugün |
|---|---|
| Proje başına birden fazla ağ | Yağmur ve atık su için ayrı projeler |
| Su ana boruları: su kalitesi ve yaşı, kurallara dayalı kontroller, diğer vana türleri (akış kontrolü, kısıcı, sürdürücü), basınçla verilen pompalar, basınca bağlı talep, bir Darcy–Weisbach seçeneği, duvar kalınlıkları ve basınç sınıfları içeren bir boru kataloğu. Basınçlı ağların geri kalanı laboratuvarda: [Su ana boruları](topic:water-mains) | Bunları bir su dağıtım yazılımında denetleyin; atık su tasarım debileri [Atık su tasarım debileri](topic:sanitary-design) konusunda |
| Zaman içinde kanalizasyon akışları (hidrograflar, dinamik yönlendirme, depolama, pompalar, taşmalar) | [Atık su tasarım debileri](topic:sanitary-design), bir tasarım sayfasının kullandığı sabit tepe debisini verir |
| Giriş ağzı kapasitesi, bordür yayılımı, tutma havuzu yönlendirmesi, hidrograflar, bir birleşim katsayısı dışındaki enerji kayıpları | Bunları başka bir yazılımda denetleyin; debiler, boyutlar ve kot çizgileri [Yağmur suyu drenajı](topic:storm-drainage) konusunda |
| PDF çizimindeki, DWG, DXF veya LandXML'deki havzalar; yüzeyden çıkan havzalar (su ayrımları) | Havzaları elle çizin; proje dosyasında kaydedilirler |
| Boru katalogları, dairesel olmayan borular, dik kutu ya da silindir olmayan yapılar (koniler, basamaklar, kademeler), kütüphanede bir drenaj kategorisi | Parametrelerden yapı türleri ([Boru ağı](topic:pipe-network)); çapı olan borular |
| Boy kesiti görünümünde borular, eğri borular | Sağ paneldeki ters kotları ve örtüyü okuyun |

## Parseller

| Henüz yapılmadı | Bunun yerine bugün |
|---|---|
| Parselleri alana veya cephe uzunluğuna göre yerleştirme, çevrelerindeki çizgilerden parseller, geçiş hakkı | Her parseli köşeleriyle çizin veya kenar bilgilerini girin |
| Planda eğri tabloları ve doğru tabloları; elle taşınmış etiketler | Her kenar kendi boyunca etiketlenir |
| LandXML'de parseller | Parseller proje dosyasında kaydedilir ve PDF, DWG ve DXF'e gider |

## Poligonlar

| Henüz yapılmadı | Bunun yerine bugün |
|---|---|
| En küçük kareler dengelemesi, geçiş kuralı, açıların uzaklıklara göre ağırlıklandırılması | Pusula kuralı |
| Sapma açıları, zenit açıları ve eğik uzunluklar, trigonometrik nivelmanla kotlar | Yatay uzaklıkları ve açıları doğru indirgeyin veya azimutlar kullanın |
| Yan atışlar, veri toplayıcılardan ham veri dosyaları | Noktaları bir nokta dosyası olarak içe aktarın |

## Kazık çakma

| Henüz yapılmadı | Bunun yerine bugün |
|---|---|
| Kazıkların geri çekilmiş referans noktaları (ofset kazıklar), yakalama noktasında şev kazıkları | İhtiyacınız olan ofsetlerde, şeridin ötesi dahil, kazık çakın |
| Kazıkları doğrudan bir veri toplayıcının kendi biçimine göndermek | CSV dosyası çoğu veri toplayıcının ofis yazılımında açılır |
| Boru, platform ve parsel kazık çakma | Eksenin yakınındaki ölçme noktalarını veya parselin kenarlarını kullanın |

## Dosyalar ve çıktı

| Henüz yapılmadı | Bunun yerine bugün |
|---|---|
| DWG veya DXF'ten metin, taralamalar ve ölçülendirmeler; kağıt uzayı; bağlı çizimler (xref); ikili DXF | Model uzayındaki çizgiler açılır ([Bir DWG veya DXF'i çizgi olarak açın](topic:open-dwg-dxf)); bağlı çizimleri kendi başlarına açın |
| Birden çok noktayı sürükleyerek birlikte taşıma | Kesip yapıştırın veya birer birer düzenleyin |
| Dikey sayfalar, kendi künyeleriniz, düzenlediğiniz görünüm pencereleri, DWG'deki plan ve boy kesiti sayfaları | Sayfa başına bir yatay plan sayfası veya bir eksen boyunca plan ve boy kesiti sayfaları (PDF) |
| Yükseklik bantlarını ve boy kesitlerini çizdirme | Bantlar yalnızca ekrandadır; gerekirse ekran görüntüsü alın |
| Katman adlarını, renklerini veya etiket stillerini değiştirme | DXF dışa aktarımından sonra bir CAD programında değiştirin |
| Bulutta kaydetme ve sürüm geçmişi | `.civilcraft.json` dosyalarını kaydedin ve yedekleyin; bir projede birlikte çalışmak için CadCraft Studio içinde canlı bir oturum kullanın ([Bir siteyi birlikte, canlı olarak tasarlayın](topic:work-live)) |
| iPad ve iPhone için CadCraft Studio, Google Play'den | CivilCraft'ı cihazdaki tarayıcıda kullanın; Android'de CadCraft Studio, getcadcraft.com/download adresindeki APK'sından kurulur |
| Aynı anda birden çok nokta veya proje dosyası açma | Dosya başına bir dosya (birbiriyle ilişkili GIS dosyaları, örneğin bir shapefile'ın parçaları, birlikte açılır) |

## Peyzaj

| Henüz yapılmadı | Bunun yerine bugün |
|---|---|
| Üreticilerin başlıkları ve memeleri | Genel başlıklar veya kendi başlıklarınızı bir dosyadan ekleyin; üreticilerin verileri, izin verdikçe gelir |
| Damlama hatları için en büyük yanal uzunluklar, zaman içinde akışlar, pompalar, döngüsel boru ağları | Damlama hatlarını üreticinin yayımladığı uzunlukta tutun; denetim, dallanan bir ağ gerektirir |
| Çukur bir serbest biçimli nesnenin tam dış hattı; yer altı hacminin tam ölçümü | Dışbükey gövde tesviye edilir ve yer altı hacmi bir tahmindir (Özellikler'de belirtilir) |
| BimCraft ve ModelCraft'ın kendi Kütüphaneden yerleştir özelliğindeki bitkiler | Peyzaj IFC'sini dışa aktarın ve BimCraft'ta bina yanında açın |
| Bir yüzeyde, arkasında tesviye edilmiş bir kotu tutan sert zemin duvarları | Bir platforma veya pede dikey kenarlar verin: bunlar yüzeyde istinat duvarlarıdır ([Tesviye](topic:grading)) |
| Kendi sembollerinizdeki SVG dönüşümleri; kendi GLB bitki modellerinizin dokuları ve renkleri; sıkıştırılmış GLB geometrisi | Önce çiziminizde dönüşümleri düzleştirin; modeller bitkinin rengiyle çizilir; GLB'yi sıkıştırmadan dışa aktarın ([Bitki grafikleri](topic:plant-graphics)) |
| Kütüphane hesabınızda tutulan kendi bitki listeniz (uygulamada düzenlenen) | Projenin kendi listesini Bitki tablosunda düzenleyin ve bir bitki dosyası olarak kaydedin |
| Pencere olmadan peyzaj araçları, yardımcılar için (dosya sunucusu ve komut satırı) | CivilCraft penceresi açıkken çalışırlar ([Bir yapay zekâ asistanının sahanızda çalışmasına izin verin](topic:assistants)) |

## Enerji hatları

| Henüz yapılmadı | Bunun yerine bugün |
|---|---|
| Bir ülkenin yerleşik standardı (yük durumları, açıklıklar, katsayılar) | Standardınızın değerlerini {{ui:Yük durumları ve sınırlar…}} içinde ayarlayın ve kütüphanenizle birlikte bir paket olarak kaydedip paylaşın ([Paketler](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Bir iletkenden yandaki bir ağaç tepesine veya hatların yanındaki bir duvara yatay mesafe | Hattın kestiği bitki ve duvarların üzerindeki düşey açıklık ([Enerji hattı denetimleri](topic:power-line-checks#clearances)) |
| İletken sürünmesi ve yeni bir iletkenin uzaması | Bunları gerdirme tablosundaki sıcaklıklar üzerinden hesaba katın |
| Gömülü kabloların termal akım taşıma kapasitesi (döşenme biçiminden akım taşıma kapasitesi) | Kablo kalemine tedarikçinizin akım taşıma değerini girin |
| Kısa devre, koruma ve topraklama çalışmaları | Özel bir elektrik programı kullanın; CivilCraft ağın uzunluklarını ve kablolarını verir |
| Kafes direklerin üye üye tasarımı ve zemindeki gergi angkrajları | Destekler nominal yüke göre, gergiler ise derecelendirilmiş yüke göre denetlenir |
| Okunduğu programda bir `.DON` çalışma dosyası denetimi | Dosyayı orada denetleyin; gerçek bir örnekle test edebilmemiz için bize bir örnek gönderin |
| 3B görünümde ve IFC'de enerji hatları | Plan, hat profili, sayfalar ve GIS katmanları |
| Pencere olmadan enerji hattı araçları, yardımcılar için | CivilCraft penceresi açıkken çalışırlar ([Bir yapay zekâ asistanının sahanızda çalışmasına izin verin](topic:assistants)) |

## Bina kütleleri

| Henüz yapılmadı | Bunun yerine bugün |
|---|---|
| İmar kodlarının veya herhangi bir şehrin kurallarının kütüphanesi | Kendi imar yönetmeliğinizden sınırları yazın ([İmar sınırları](topic:zoning-limits)) |
| Duvarlardaki gökyüzü ışığı (cephe aydınlatması), rüzgâr | [Güneşlenme saatleri](topic:sun-hours) yalnızca doğrudan güneşi sayar |
| Ağaçlardan, bitkilerden veya kütle olarak çizilmemiş herhangi bir şeyden gölge | Komşu binaları kütle olarak çizin |
| Kütleler üzerinde çatı biçimleri | Düz üstlü kütleler |
| BimCraft'ta bir kütle geliştirildiğinde açıklıklar, çatılar ve duvar türleri | BimCraft her katta ve bir döşemede düz dış duvarlar oluşturur; kalanları orada ekleyin |

## GIS ve koordinat sistemleri

| Henüz yapılmadı | Bunun yerine bugün |
|---|---|
| File Geodatabase; KML stilleri, simgeleri, zemin kaplamaları ve ağ bağlantıları | Önce GeoPackage, shapefile veya GeoJSON'a dönüştürün; KML yer işaretleri stilleri olmadan okunur |
| GIS öğelerini veya özniteliklerini düzenleme | Bir GIS programında düzenleyip yeniden içe aktarın. Çözümle panelinde yeni katmanlar (tampon, bindirme, birleştirme, seçim) oluşturulur ve alan ile uzunluk alanları eklenir, ancak bir öğe yerinde düzenlenmez |
| Ağ ve raster analizi, düz veya kare uçlu ve tek yönlü tamponlar; öznitelik tablosunda satır ekleme veya silme ya da bir alanın türünü değiştirme; elle sınıf renkleri; çizimlerde stil açıklaması | Öğeleri seçmek için Seç'i kullanın ve onlardan bir katman oluşturun; düz uçlar sunulmaz. Özniteliğe göre renklendirme ve öznitelik tablosu yapılmıştır: bkz. [Bir katmanı özniteliğe göre stillendirin](topic:gis-symbology) ve [Bir katmanın öznitelik tablosuyla çalışın](topic:gis-table) |
| Etiket stilleri (boyut, yerleşim) ve birbirinden kaçınan etiketler | Etiketler tek boyutludur ve öğeler yoğun olduğunda üst üste binebilir |
| Düşey datumlar ve jeoit modelleri | Kotlar dosyanın verdiği gibi kullanılır; düşey datumu kendiniz denetleyin |
| Alana göre önerilen NAD27'den NAD83 dışındaki ağ kaymaları (OSTN15, diğer datumlar için NTv2, dosyayı eklediğinizde çalışır), birden çok ağ aynı anda, düşey ağlar | Datumunuz için ağ dosyasını kendiniz ekleyin; proje başına bir ağ |
| DXF'te veya 3B dışa aktarımlarda harita katmanları | Harita katmanları PDF çizimine girer ve DWG yanında resim olarak eklenir |
| Oturum açma, anahtar veya belirteç gerektiren harita sunucuları | Genel hizmetleri veya coğrafi referanslı bir resim dosyasını kullanın |
| Bir yüzeyden, zemin modelinden veya kot ızgarası ve LiDAR araçlarından LAS veya LAZ dosyası yazma | Yüzeyleri GeoTIFF kot ızgarası olarak dışa aktarın. [Nokta bulutları](topic:point-clouds) eklentisi temizlenmiş bulutu LAS 1.4 veya LAZ olarak yazar |
| LiDAR yoğunluğu, rengi ve dönüşleri; birden çok bantlı kot ızgaraları; 200 MB'tan büyük ızgara veya LiDAR dosyaları | LiDAR yalnızca sınıfa göre süzülür, ızgaralar ilk bandını kullanır; büyük dosyaları önce karolara bölün |

## Girdi

| Henüz yapılmadı | Bunun yerine bugün |
|---|---|
| Dokunmatik kutu seçimi ({{key:Shift}} gerektirir) | Her ölçme noktasını uzun basarak ekleyin |
| Çizerken yazılan koordinatlar veya uzaklıklar | Kabaca çizin, sonra eksenin PI tablosunda kesin PI koordinatlarını yazın |
| Platform köşeleri ve yapılar için koordinat yazma | Tutamaçlarını sürükleyin; hassasiyet için yakınlaştırın ve durum çubuğunda E ve N'yi izleyin |
| Nesnelere yakalama (kırılma çizgileri için ölçme noktaları dışında) | Yakınlaştırın ve durum çubuğunu izleyin |

## 3B görünüm

| Henüz yapılmadı | Bunun yerine bugün |
|---|---|
| 3B görünümde çizim veya düzenleme | Planda çizin ve düzenleyin; 3B görünüm her düzenlemeyi izler |
| Koridor özellik çizgilerini veya GIS öğelerini 3B'de tıklayarak seçme | Planda tıklayın |
| Abartılı görünümü veya feet cinsini dışa aktarma | Dışa aktarımlar metre cinsinden gerçek ölçektedir; bkz. [Sahayı 3B'de dışa aktarın](topic:export-3d) |
| GLB veya OBJ dışa aktarımlarında etiketler, 3B'de etiket boyutları ve stilleri | Etiketler yalnızca 3B görünümde, tek boyutta gösterilir; bkz. [Sahayı 3B'de görüntüleyin](topic:site-3d) |
| Fotoğraflardan dokular, bir sürüşü video olarak kaydetme, sahanın ötesinden gölgeler, 3B görünümde güneşlenme saatleri | Yüzeylerin üzerine yerleştirilmiş harita katmanları; bir andaki sürüş ve güneşin konumu; bir gün veya mevsim için [güneşlenme saatleri](topic:sun-hours) planda |
