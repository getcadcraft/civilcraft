---
title: Henüz yapılmadı
summary: CivilCraft'ın bu sürümünün henüz yapmadıkları ve bugün bunların yerine ne yapmanız gerektiği.
keywords: eksik, sınırlamalar, yol haritası, kullanılamıyor, spiraller, genişletme, dwg, dxf, giriş ağızları, bekletme, enine kesitler, ileride gelecek, sınırlar
from: a2d970ef
---

CivilCraft erken aşamada. Bu sayfa, mevcut sürümün neleri yapmadığını listeler; böylece onları aramazsınız. Bunlardan hiçbiri için bir tarih verilmez.

## Noktalar

| Henüz yapılmadı | Bunun yerine, bugün |
|---|---|
| İkinci bir nokta dosyasını ilkine eklemek | Dosyaları önce bir metin düzenleyicide ya da elektronik tabloda birleştirin |
| Bir nokta metin dosyasını dışa aktarmak | LandXML dışa aktarın (noktalar CgPoint olarak çıkar), GIS {{ui:Dışa aktar}} kullanın (P, N, E, Z ve D alanlı noktalar) ya da {{ui:Kopyala}} ile noktaları bir elektronik tabloya aktarın |
| Nokta etiket stilleri, tanım anahtarına göre semboller, hat kodlarından eğriler (yaylar), projeler arasında paylaşılacak bir tanım anahtarı dosyası | Etiketler numarayı, kotu ve tanımı, ya da daha azını gösterir ([CivilCraft ayarları](topic:settings)); anahtarlar proje dosyasında tutulur |
| Birim dönüşümü | İçe aktarmadan önce dosyayı dönüştürün; **Birimler** yalnızca etiketi değiştirir |

## Yüzeyler

| Henüz yapılmadı | Bunun yerine, bugün |
|---|---|
| Noktalardan oluşturulmuş birden fazla yüzey | Yüzey başına bir proje |
| (İç) sınırları gizlemek | **En uzun dış kenar** ya da bir dış sınır kullanın |
| Çizilmiş tek bir kırılma çizgisini seçmek ya da düzenlemek | {{key:Mod+Z}}, ya da {{ui:Çizilmiş kırılma çizgilerini kaldır}} ve yeniden çizin |
| LandXML'den okunan bir yüzeyi düzenlemek (kırılma çizgileri, sınır) | {{ui:Yüzeyi noktalardan yeniden oluştur}} |
| Bir kot ızgarasından yapılmış yüzeyi düzenlemek | Izgarayı diğer seçeneklerle yeniden içe aktarın |
| Koordinat sistemi değiştiğinde LandXML'den okunan bir yüzeyi dönüştürmek | Önce {{ui:Yüzeyi noktalardan yeniden oluştur}} |
| Etiketli nokta kotları ve eğim değerleri | Durum çubuğundan okuyun ya da Peyzaj çalışma alanındaki **Eğim analizi** ile yüzeyi eğime göre renklendirin ([Peyzaj için tesviye](topic:landscape-grading#grading-checks)) |

## Eksenler ve profiller

| Henüz yapılmadı | Bunun yerine, bugün |
|---|---|
| Klotoid dışındaki spiraller; iki eğri arasında bir spiral (bileşik geçişler) | Bir eğrinin uçlarındaki klotoid spiraller kullanılabilir; diğerleri adlandırılır ve LandXML içe aktarmada atlanır |
| İki başka PI arasına bir PI eklemek | Ekseni yeniden çizin ya da PI koordinatlarını yeniden yazın |
| Nesnelerden, ofsetlerden, genişletmelerden eksenler | PI'lerle çizin |
| Düşey eğri için K yazmak | L yazın (K gösterilir) |
| Dairesel ve simetrik olmayan düşey eğriler | Yalnızca simetrik parabolik düşey eğriler |
| Eksen başına birden fazla tasarım profili | Varyant başına bir eksen |
| Profil görünümünü yakınlaştırmak, profilin altındaki profil bantları | Profil görünümü tüm ekseni sığdırır; [plan ve profil sayfalarında](topic:plan-profile-sheets) çıktı alın |
| DWG ya da LandXML'de kesitler | PDF olarak kesit sayfaları; alanların ve hacimlerin {{ui:CSV}} dosyası |
| Açılı örnek çizgileri ya da yol boyunca farklı genişlikte örnek çizgileri | Tüm eksen için her iki yanda birer genişlik |

## Koridorlar

| Henüz yapılmadı | Bunun yerine, bugün |
|---|---|
| Refüjler, bariyerler ve şablonları döndüren bir süperelevasyon | Şablon olarak çizin ([Koridor şablonları](topic:corridor-templates)); istasyona göre şablonlar henüz süperelevasyonu almaz |
| İki bölge şablonu arasında kademeli bir değişim (geçişler, daralmalar) | Şablonu bir istasyonda değiştirin ya da daralma olarak çizilen bir çizgiye bir genişlik hedefi verin |
| Bir kenar etrafında döndürme, LandXML'de süperelevasyon | Süperelevasyon dairesel eğrilerde eksen etrafında döner; bir özellik çizgisine genişlik hedefiyle bir şeridi genişletin |
| Yan şevler için hedefler (bir çizgiye ya da yüzeye yarma-dolgu sınırı), koridorun kendi yüzeyleri | Hedefler kaplama ve bankuet kenarlarını taşır ([Koridorlar](topic:corridor)); koridor, önerilen yüzeye tesviye edilir |
| LandXML yol olarak dışa aktarılan koridorlar; IFC dışa aktarımında bir eksende ikinci bir koridor | Önerilen yüzey dışa aktarılır |
| Önerilen yüzeyi değiştiren arazi şablonları, 3D'de ya da kesitlerde | Her katmanın alanlarını ve hacimlerini verirler ([Arazi şablonları](topic:corridor-templates#terrain-templates)) |
| Hız, lastik kayması, direksiyon süresi, direksiyonlu römorklar ya da gövde açıklığı ile dönüş izleri; standart tasarım araçları kütüphanesi; aracı sürükleyerek çizilen bir dönüş izi | Bir özellik çizgisi ya da bir eksen boyunca düşük hızlı dönüş izleri, kendi araç ölçülerinizle ([Araç dönüş izleri](topic:swept-paths)) |

## Tesviye ve hacimler

| Henüz yapılmadı | Bunun yerine, bugün |
|---|---|
| Banketler, tasarıma tesviye edilen açık özellik çizgileri, başka yerden bir özellik çizgisine tesviye | Özellik çizgisini kapatın ([Özellik çizgileri](topic:feature-lines)) ya da mevcut zeminin bir kırılma çizgisi olarak kullanın |
| Bir özellik çizgisi köşesi eklemek ya da kaldırmak | Çizgiyi yeniden çizin ya da ondan basamaklı bir ofset yapın |
| Çizilmiş kırılma çizgilerinde yaylar (ölçü noktalarından geçen), özellik çizgilerinde spiraller | Yaylı bir özellik çizgisi çizin ve onu mevcut zeminin kırılma çizgisi olarak kullanın |
| Bir mesafeye, kota ya da başka bir yüzeye tesviye | Yalnızca mevcut zemine yarma-dolgu sınırı |
| Platform köşesi eklemek ya da kaldırmak | Platformu silin ve yeniden çizin |
| TIN'den TIN'e (prizma) hacimler, ızgara hücre boyutunu seçmek | Izgara yöntemi, hücre boyutu sizin için seçilir |
| Kabarma ve büzülme, bitkisel toprak, kaplama derinlikleri | Rapor edilen sayılara çarpanları kendiniz uygulayın |
| Serbest taşıma ve fazla taşıma maliyetleri, farklı eksenler arası taşıma, planda yerleştirilen ödünç malzeme ocakları ve fire alanları | Denge noktaları, taşınan hacimler ve ortalama taşıma mesafeleri ile kütle taşıma diyagramı |

## Boru ağları

| Henüz yapılmadı | Bunun yerine, bugün |
|---|---|
| Proje başına birden fazla ağ | Yağmur suyu ve pis su için ayrı projeler |
| Su ana hatları: su kalitesi ve yaşı, kurala dayalı denetimler, diğer vana türleri (akış kontrolü, kısma, basınç sabitleme), güçle verilen pompalar, basınca bağlı talep, Darcy–Weisbach seçeneği, duvar kalınlıkları ve basınç sınıfları içeren bir boru kataloğu. Basınçlı ağların geri kalanı geliştirme aşamasındadır: [Su ana hatları](topic:water-mains) | Bunları su dağıtım yazılımında kontrol edin; pis su tasarım debileri [Pis su tasarım debileri](topic:sanitary-design) içindedir |
| Zamana bağlı kanalizasyon akışları (hidrograflar, dinamik yönlendirme, depolama, pompalar, taşmalar) | [Pis su tasarım debileri](topic:sanitary-design), bir tasarım sayfasının kullandığı kararlı tepe debisini verir |
| Giriş kapasitesi, oluk yayılımı, bekletme yönlendirmesi, hidrograflar, bir birleşim katsayısı dışındaki enerji kayıpları | Bunları başka yazılımlarda kontrol edin; debiler, boyutlar ve hidrolik eğim çizgileri (HGL) [Yağmur suyu drenajı](topic:storm-drainage) içindedir |
| PDF çıktısında, DWG, DXF ya da LandXML'de havzalar; yüzeyden çıkan havzalar (su ayrım alanları) | Havzaları elle çizin; proje dosyasına kaydedilirler |
| Boru katalogları, dairesel olmayan borular, dik kutu ya da silindir olmayan yapılar (koniler, basamaklar, banketler), kütüphanede bir drenaj kategorisi | Parametrelerden yapı türleri ([Boru ağı](topic:pipe-network)); çapı olan borular |
| Profil görünümünde borular, eğri borular | Sağ paneldeki bağlantı kotlarını ve örtüyü okuyun |

## Parseller

| Henüz yapılmadı | Bunun yerine, bugün |
|---|---|
| Alan ya da cephe ile parsel yerleştirme, çevresindeki çizgilerden parseller, geçit hakkı (right-of-way) | Her parseli köşeleriyle çizin ya da parselin kayıt satırlarını girin |
| Planda eğri tabloları ve çizgi tabloları; elle taşınan etiketler | Her kenar kendi boyunca etiketlenir |
| LandXML'de parseller | Parseller proje dosyasına kaydedilir ve PDF, DWG ve DXF'e gider |

## Poligonlar

| Henüz yapılmadı | Bunun yerine, bugün |
|---|---|
| En küçük kareler dengelemesi, transit kuralı, açıların mesafelere göre ağırlıklandırılması | Pusula kuralı |
| Sapma açıları, zenit açıları ve eğik mesafeler, trigonometrik nivelmanla kotlar | Yatay mesafelere ve doğru açılara indirgeyin, ya da yön açılarını kullanın |
| Yan atışlar, veri toplayıcılardan ham veri dosyaları | Noktaları bir nokta dosyası olarak içe aktarın |

## Kazık çakma

| Henüz yapılmadı | Bunun yerine, bugün |
|---|---|
| Ofset kazıkları (kazıktan geriye yerleştirilen referans noktaları), yakalama noktasında şev kazıkları | İhtiyacınız olan ofsetlerde, bankuetin ötesinde dahil, kazık çakın |
| Kazıkları doğrudan bir veri toplayıcının kendi biçimine göndermek | CSV, çoğu veri toplayıcının ofis yazılımında açılır |
| Boru, platform ve parsel kazık çakma | Bir eksenin yakınındaki ölçü noktalarını ya da parselin kenarlarını kullanın |

## Dosyalar ve çıktı

| Henüz yapılmadı | Bunun yerine, bugün |
|---|---|
| DWG ya da DXF'den metin, taralamalar ve ölçülendirmeler; kâğıt uzayı; bağlı çizimler (xref); ikili DXF | Model uzayındaki çizgi işi açılır ([Bir DWG ya da DXF'i çizgi işi olarak açın](topic:open-dwg-dxf)); bağlı çizimleri ayrı ayrı açın |
| Birden fazla noktayı sürükleyerek aynı anda taşımak | Kesip yapıştırın ya da birer birer düzenleyin |
| Dikey sayfalar, kendi künyeleriniz, düzenlediğiniz görünüm pencereleri, DWG'de plan ve profil sayfaları | PDF başına bir yatay plan sayfası ya da bir eksen boyunca plan ve profil sayfaları (PDF) |
| Kot bantlarını ve profilleri çıktı almak | Bantlar yalnızca ekranda gösterilir; ihtiyacınız varsa ekran görüntüsü alın |
| Katman adlarını, renkleri ya da etiket stillerini değiştirmek | DXF dışa aktarımından sonra bir CAD programında değiştirin |
| Bulut kaydı ve sürüm geçmişi | `.civilcraft.json` dosyalarını kaydedin ve yedekte tutun; bir projeyi birlikte çalışmak için CadCraft Studio'da canlı bir oturum kullanın ([Bir siteyi birlikte, canlı olarak tasarlayın](topic:work-live)) |
| iPad ve iPhone için CadCraft Studio ve Google Play'den | Cihazda tarayıcıda CivilCraft'ı kullanın; Android'de CadCraft Studio, getcadcraft.com/download adresindeki APK'sından kurulur |
| Birden fazla nokta ya da proje dosyasını aynı anda açmak | Her seferinde bir dosya açılır (birlikte ait olan GIS dosyaları, örneğin bir shapefile'ın parçaları, birlikte açılır) |

## Peyzaj

| Henüz yapılmadı | Bunun yerine, bugün |
|---|---|
| Üreticilerin başlıkları ve memeleri | Genel başlıklar ya da bir dosyadan kendi başlıklarınızı ekleyin; üreticilerin verileri izin verdikçe gelir |
| Damla hatları için azami yan uzunluklar, zamana bağlı akışlar, pompalar, halka boru ağları | Damla hattı çalışmalarını üreticinin yayımladığı uzunlukta tutun; kontrol dallanmış bir ağ gerektirir |
| İçbükey serbest biçimli bir nesnenin tam dış hattı; zemin altı hacminin tam ölçümü | Dışbükey gövde (convex hull) tesviye edilir ve zemin altı hacmi bir tahmindir (Özellikler'de belirtilir) |
| BimCraft'ın ve ModelCraft'ın kendi Kütüphaneden yerleştir komutundaki bitkiler | Peyzaj IFC'sini dışa aktarın ve yapının yanında BimCraft'ta açın |
| 3D görünümde ayrıntılı bitki modelleri (yapraklar, dallar, mevsimler); 3D görünümde serbest biçimli nesneler ve sulama | Bitkiler 3D'de, bitki listesinden boyutlandırılmış basit biçimler olarak görünür ([Siteyi 3D'de görüntüleyin](topic:site-3d)); ModelCraft'ın saçılımı peyzaj resimleri yapar |
| Yüzeyde, arkasında tesviye edilmiş bir kotu tutan sert peyzaj duvarları | Bir platforma ya da pedde dik kenarlar verin: yüzeyde istinat duvarı olurlar ([Tesviye](topic:grading)) |
| Kendi sembollerinizdeki SVG dönüşümleri; kendi GLB bitki modellerinizin dokuları ve renkleri; sıkıştırılmış GLB geometrisi | Önce çizim programınızda dönüşümleri düzleştirin; modeller bitkinin rengiyle çizilir; GLB'yi sıkıştırmadan dışa aktarın ([Bitki grafikleri](topic:plant-graphics)) |
| Kütüphane hesabınızda tutulan kendi bitki listeniz (uygulamada düzenlenir) | Projenin kendi listesini Bitki tablosunda düzenleyin ve bir bitki dosyası olarak kaydedin |
| Pencere olmadan asistanlar için peyzaj araçları (dosya sunucusu ve komut satırı) | Bunlar CivilCraft penceresi açıkken çalışır ([Bir yapay zekâ asistanının sitenizle çalışmasına izin verin](topic:assistants)) |

## Enerji hatları

| Henüz yapılmadı | Bunun yerine, bugün |
|---|---|
| Bir ülkenin standardının yerleşik olması (yük durumları, güvenlik mesafeleri, katsayılar) | {{ui:Yük durumları ve sınırlar…}} içinde standardınızın değerlerini ayarlayın ve kütüphanenizle birlikte bir paket olarak kaydedin; yeniden kullanmak ve paylaşmak için ([Paketler](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Bir iletkenden bir ağaç tepesine ya da hattın yanındaki bir duvara yatay mesafe | Hattın geçtiği bitkilerin ve duvarların üzerindeki düşey güvenlik mesafesi ([Enerji hattı kontrolleri](topic:power-line-checks#clearances)) |
| İletken sünmesi ve yeni bir iletkenin uzaması | Bunlara, gerdirme tablosundaki sıcaklıklar üzerinden izin verin |
| Gömülü kabloların ısıl değeri (döşenme biçiminden akım değeri) | Tedarikçinizin akım değerini kablo kaleminde girin |
| Kısa devre, koruma ve topraklama çalışmaları | Ayrı bir elektrik programı kullanın; CivilCraft ağın uzunluklarını ve kablolarını verir |
| Örgü kulelerin eleman eleman tasarlanması ve zemindeki gergi ankrajları | Direkler nominal yüklerine göre kontrol edilir; gergiler ise anma yüküne göre |
| `.DON` çalışma dosyasının onu okuyan programda kontrol edilmesi | Dosyayı orada kontrol edin; gerçek bir dosya ile test edebilmemiz için bize bir örnek gönderin |
| 3D görünümde ve IFC'de enerji hatları | Plan, hat profili, sayfalar ve GIS katmanları |
| Pencere olmadan asistanlar için enerji hattı araçları | Bunlar CivilCraft penceresi açıkken çalışır ([Bir yapay zekâ asistanının sitenizle çalışmasına izin verin](topic:assistants)) |

## Yapı kütleleri

| Henüz yapılmadı | Bunun yerine, bugün |
|---|---|
| İmar kodlarının ya da herhangi bir kentin kurallarının kütüphanesi | Kendi imar mevzuatınızdan sınırları yazın ([İmar sınırları](topic:zoning-limits)) |
| Duvarlardaki gökyüzü ışığı (cephe gün ışığı), rüzgâr | [Güneş saatleri](topic:sun-hours) yalnızca doğrudan güneşi sayar |
| Ağaçlardan, bitkilerden ya da kütle olarak çizilmeyen herhangi bir şeyden gölge | Komşu yapıları kütle olarak çizin |
| Kütlelerde çatı biçimleri | Düz tepeli kütleler |
| Bir kütle BimCraft'ta geliştirildiğinde açıklıklar, çatılar ve duvar türleri | BimCraft her katta ve bir döşemede yalnızca düz dış duvarlar oluşturur; diğerlerini orada ekleyin |

## GIS ve koordinat sistemleri

| Henüz yapılmadı | Bunun yerine, bugün |
|---|---|
| File Geodatabase; KML stilleri, simgeler, zemin kaplamaları ve ağ bağlantıları | Önce GeoPackage, shapefile ya da GeoJSON'a dönüştürün; KML yer işaretleri stilleri olmadan okunur |
| GIS öğelerini ya da öznitelikleri düzenlemek | Bir GIS programında düzenleyin ve yeniden içe aktarın. Analiz paneli yeni katmanlar oluşturur (tampon, bindirme, birleştirme, seçim) ve alan ile uzunluk alanları ekler, ama bir öğeyi yerinde düzenlemez |
| Ağ ve raster analizi, düz ya da kare uçlu tamponlar ve tek taraflı tamponlar, öznitelik tablosunda satır eklemek ya da silmek ve bir alanın türünü değiştirmek, elle sınıf renkleri, çizimlerde bir stil açıklaması | Öğeleri seçmek için Seç kullanın ve onlardan bir katman oluşturun; düz uçlar sunulmaz. Öznitelikle renklendirme ve öznitelik tablosu yapılmıştır: [Bir katmanı öznitelikle stillendirme](topic:gis-symbology) ve [Bir katmanın öznitelik tablosuyla çalışma](topic:gis-table) |
| Etiket stilleri (boyut, yerleşim) ve birbiriyle çakışmayan etiketler | Etiketler tek boyuttadır ve öğeler yoğunken üst üste gelebilir |
| Düşey datumlar ve jeoid modelleri | Kotlar dosyanın verdiği gibi kullanılır; düşey datumu kendiniz kontrol edin |
| NAD27'den NAD83'e alana göre önerilen ızgara kaymaları dışındaki kaymalar (OSTN15; diğer datumlar için NTv2, dosyayı eklediğinizde çalışır), aynı anda birden fazla ızgara, düşey ızgaralar | Datumunuz için ızgara dosyasını kendiniz ekleyin; proje başına bir ızgara |
| DXF'de ya da 3D dışa aktarımlarda harita katmanları | Harita katmanları PDF çıktısına girer ve DWG yanında resim olarak eklenir |
| Oturum açma, anahtar ya da belirteç gerektiren harita sunucuları | Genel hizmetleri ya da coğrafi referanslı bir görüntü dosyasını kullanın |
| Bir yüzeyden, zemin modelinden ya da kot ızgarası ve LiDAR araçlarından LAS ya da LAZ dosyası yazmak | Yüzeyleri GeoTIFF kot ızgarası olarak dışa aktarın. [Nokta bulutları](topic:point-clouds) eklentisi temizlenmiş bulutu LAS 1.4 ya da LAZ olarak yazar |
| LiDAR yoğunluğu, renk ve dönüşler; birden fazla bantlı kot ızgaraları; 200 MB'ı aşan ızgara ya da LiDAR dosyaları | LiDAR yalnızca sınıfa göre süzülür, ızgaralar ilk bantlarını kullanır; büyük dosyaları önce karolara bölün |

## Giriş

| Henüz yapılmadı | Bunun yerine, bugün |
|---|---|
| Dokunmatikle kutu seçimi ({{key:Shift}} gerektirir) | Eklemek için her ölçü noktasına uzun basın |
| Çizim sırasında yazılmış koordinatlar ya da mesafeler | Kabaca çizin, sonra kesin PI koordinatlarını eksen PI tablosuna yazın |
| Platform köşeleri ve yapılar için koordinat yazmak | Tutamaçlarını sürükleyin; hassasiyet için yakınlaştırın ve durum çubuğunda E ve N değerlerini izleyin |
| Nesnelere yakalama (kırılma çizgileri için ölçü noktaları dışında) | Yakınlaştırın ve durum çubuğunu izleyin |

## 3D görünüm

| Henüz yapılmadı | Bunun yerine, bugün |
|---|---|
| 3D görünümde çizim ya da düzenleme | Planda çizin ve düzenleyin; 3D görünüm her düzenlemeyi izler |
| 3D'de tıklayarak koridor özellik çizgilerini ya da GIS öğelerini seçmek | Bunları planda tıklayın |
| Abartılmış görünümü ya da ft cinsinden dışa aktarmak | Dışa aktarımlar metre cinsinden gerçek ölçektedir; bkz. [Siteyi 3D olarak dışa aktarın](topic:export-3d) |
| GLB ya da OBJ dışa aktarımlarında etiketler, 3D'de etiket boyutları ve stilleri | Etiketler yalnızca 3D görünümde ve tek boyutta gösterilir; bkz. [Siteyi 3D'de görüntüleyin](topic:site-3d) |
| Fotoğraflardan dokular, bir sürüşü video olarak kaydetmek, siteden uzaktan gelen gölgeler, 3D görünümde gösterilen güneş saatleri | Yüzeylerin üzerine yerleştirilmiş harita katmanları; sürüşü ve güneşin konumunu tek bir zamanda; bir gün ya da mevsim için planda [güneş saatleri](topic:sun-hours) |
