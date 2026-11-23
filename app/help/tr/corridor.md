---
title: Yol koridorunu süpürün
summary: Bir eksen için koridor açın, şerit, bankuet ve yan şev değerlerini ayarlayın ve koridorun ürettiği kesitleri, yarma-dolgu sınır çizgilerini ve toprak işlerini okuyun.
keywords: kavşak, kesişim, yol yola değer, yan yol, T kavşağı, geçit, platform kotu, birleştirme, bağlantı, süperelevasyon, süper, yan eğim, geçiş uzunluğu, çıkış uzunluğu, eğim tablosu, enine eğim, döndürme, koridor, kesit düzeni, alt kesit düzeni, tipik kesit, yol, şerit, bankuet, enine eğim, yan şev, yarma-dolgu sınırı, kazı, dolgu, kesitler, hedef, hedefler, genişlik hedefi, kot hedefi, ofset hedefi, genişletme, kaplama kenarı, başka bir koridoru izle
from: 6dcb92b3
---

Koridor, bir eksen ve onun tasarım boy kesiti boyunca tek ve basit bir tipik kesiti (bir kesit düzenini) süpürür, mevcut zemine tesviye eder ve sonucu önerilen yüzeye ekler. Bir eksen, farklı istasyon aralıklarında birden çok koridor taşıyabilir; bir koridor, istasyona göre yeniden kullanılabilir şablonlardan da oluşturulabilir ([Koridor şablonları](topic:corridor-templates)). Aşağıdaki basit kesit düzeni iki tarafta da aynıdır; her tarafa kendi parçalarını vermek için bkz. [Her tarafı parçalardan oluşturun](topic:corridor#build-each-side-from-parts).

## Kesit düzeni

Eksen çizgisinden dışarıya doğru, her iki tarafta:

1. Belirli genişlikte bir **şerit**; tepe noktasından **şerit eğimi** ile aşağı doğru iner
2. Belirli genişlikte bir **bankuet**, **bankuet eğimi** ile
3. Bankuet kenarından zemine değdiği yere kadar bir **yan şev**: zemin üstteyse **kazı şevi**, altındaysa **dolgu şevi**

Başlangıç değerleri yer tutucudur, bir tasarım standardı değildir:

| Değer | ABD fiti | Metre |
|---|---|---|
| Şerit genişliği | 12 ft | 3.6 m |
| Şerit eğimi | 2% | 2% |
| Bankuet genişliği | 4 ft | 1.2 m |
| Bankuet eğimi | 4% | 4% |
| Kazı şevi | 2 : 1 | 2 : 1 |
| Dolgu şevi | 3 : 1 | 3 : 1 |
| Kesit aralığı | 10 ft | 5 m |

Yan şevlerdeki eğimler yatay/düşey (H:V) biçimindedir: 3 : 1, 1 birim düşeyde 3 birim yatay anlamına gelir.

## Koridoru oluşturun

Hatasız bir eksene ve en az iki PVI içeren, hatasız bir tasarım boy kesitine ihtiyacınız vardır.

1. Ekseni seçin.
2. Sağ paneldeki **Koridor** altında **Kesit düzenini tasarım boy kesiti boyunca süpürün** kutusunu işaretleyin.
   Alanlar görünür ve koridor hemen oluşturulur. Plan, şerit ve bankuet kenarlarını ile yarma-dolgu sınır çizgilerini gösterir; **Görüntüle** altında {{ui:Önerilen (tesviye edilmiş)}} seçildiğinde kot eğrileri yeni zemini gösterir.
3. Herhangi bir değeri değiştirin: **Şerit genişliği**, **Şerit eğimi**, **Bankuet genişliği**, **Bankuet eğimi**, **Kazı şevi**, **Dolgu şevi**, **Kesit aralığı**. Her birinden sonra {{key:Enter}}'a basın. Kazı, dolgu ve kesit aralığı 0'dan büyük olmalıdır.
4. Alanların altındaki satırı okuyun; örneğin "0+00.00 ile 3+86.36 arasında 39 kesit; kazı 240.2 cu yd, dolgu 556.0 cu yd."

Kesitler her **Kesit aralığı** adımında, uçlarda ve her yatay ve düşey eğrinin başında ve sonunda kesilir. Her kesit ve bunlardan geçen çizgiler (eksen çizgisi, şerit ve bankuet kenarları, yarma-dolgu sınırı), önerilen yüzeyin kırılma çizgileri olur.

Koridoru kapatmak için kutunun işaretini kaldırın. Değerleri bir sonraki kullanımda saklanır.

## Oluşturulamadığında

Alanların altındaki kırmızı kutu nedenini söyler:

| Mesaj | Ne yapmalı |
|---|---|
| "Koridor, hatasız bir tasarım boy kesitine ihtiyaç duyar." | PVI ekleyin veya üst üste binen düşey eğrileri düzeltin (bkz. [Düşey boy kesiti tasarlayın](topic:profile)). |
| "Tasarım boy kesiti eksenle çakışmıyor." | PVI'ları ekseninin istasyon aralığına taşıyın. |
| "Koridorun yüzeyde en az iki kesite ihtiyacı var." | Koridorun büyük bölümü mevcut zeminin dışında. |
| "4 yan şev, zemine ulaşmadan yüzeyden taşıyor." | Yüzeyin kenarına yakın yerlerde şev zemine ulaşamaz. Yolu kenardan uzak tutun veya orada dolgu ya da kazı yüksekliğini düşürün. |
| "Koridorun yarma-dolgu sınır çizgileri kesişiyor (örneğin dar bir eğrinin iç tarafında kesitler çakışır). Daha büyük bir yarıçap veya daha dar bir kesit düzeni kullanın." | Keskin bir eğrinin iç tarafındaki kesitler çakışır. Yarıçapı artırın veya kesit düzenini daraltın. |

Sorunlu bir koridor tesviye edilmez ve toprak işlerine dahil edilmez.

## Koridorlar ve platformlar birlikte

Önerilen yüzey sırayla oluşturulur: önce her koridor, sonra her platform. Bir platformun tesviyesi bir koridorla çakışırsa platform geçerlidir. Sonraki bir öğe bir yolla çakışırsa, yalnızca yolun sonraki öğenin yarma-dolgu sınır çizgisi içinde kalan kısmı değiştirilir; yolun geri kalanı ve yolun kestiği herhangi bir zemin kırılma çizgisi şeklini korur. Hacimler tüm yarma-dolgu sınır çizgilerinin birlikte oluşturduğu alan içinde hesaplanır; bkz. [Toprak işi hacimleri](topic:volumes).

## Süperelevasyon

Bir eğriden geçerken yol iç tarafa doğru eğilebilir, böylece trafik dışarıya daha az itilir. Eksenin **Özellikler** bölümündeki **Süperelevasyon** altında **Eğrilere süperelevasyon ver** kutusunu işaretleyin:

- Her dairesel eğri, oran tablosundan bir **e** oranı alır: eğrinin ulaştığı yarıçapa ait ilk satır (oranı boş olan satır normal tepe eğimini korur). Tablo ve **En büyük bağıl eğim** (başlangıçta %0.5) yer tutucudur, bir standart değildir: bunları kendi tasarım ölçütlerinize göre ayarlayın. İhtiyacınıza göre satır ekleyin veya çıkarın.
- Şeritler eksen çizgisi etrafında döner. Eğriden önce dış şerit **çıkış uzunluğu** (normal tepe ÷ e × geçiş) boyunca düzleşir, ardından **geçiş uzunluğu** (şerit genişliği × e ÷ eğim) boyunca dış şerit, tüm yol iç tarafa doğru e eğimiyle eğilene kadar dönmeye devam eder; geçiş uzunluğunun üçte ikisi eğriden öncedir, üçte biri eğrinin üzerindedir. Eğriden sonra aynısı ters yönde olur.
- Alçak taraftaki bir bankuet hiçbir zaman kendi şeridinden daha düz olmaz; yüksek taraftaki bankuet kendi eğimini korur (devrilir).
- Altındaki tablo her eğrinin yarıçapını, oranını, geçiş ve çıkış uzunluklarını ve tam süperelevasyonun nerede başlayıp bittiğini listeler. **Süperelevasyon diyagramı** iki şeridin enine eğimlerini istasyonlar boyunca çizer (sol şerit düz, sağ şerit kesikli).
- Tam süperelevasyona ulaşamayacak kadar kısa bir eğri ya da geçişleri üst üste binen iki eğri, tablonun üstündeki bir kutuda belirtilir.

Kesitler, hacimler, 3B görünüm ve sayfalar, eğilmiş yolu gösterir. Her değişiklik tek bir adımdır: {{key:Mod+Z}} onu geri alır.

## Hedefler

Bir hedef, yolun bir tarafındaki bir noktayı bir çizgiye taşır: **Sol** veya **Sağ** tarafta **Kaplama kenarı** ya da **Bankuet kenarı**. Her kesit, çizgiyle eksen çizgisine dik olarak buluşur ve yalnızca o taraf yönünde ilerler; bu nedenle sağdaki bir hedef hiçbir zaman soldaki tarafı taşımaz.

| Belirler | Kesitin çizgiyle buluştuğu yerde ne olur |
|---|---|
| **Genişlik** | Nokta çizgi üzerine oturur: şerit (veya bankuet) ona göre genişler ya da daralır ve enine eğimini korur. |
| **Kot** | Nokta, kendi ofsetinde, orada çizginin kotunu alır: şeridin (veya bankuetin) enine eğimi bunu izler. |

Çizgi, bir özellik çizgisi (**Kullanım**'ı ne olursa olsun) ya da başka bir koridorun çizgisi olabilir: eksen çizgisi, kaplama kenarları, bankuet kenarları veya yarma-dolgu sınır çizgileri. Bir koridorun çizgisi o koridoru izler: öbür yolu değiştirirseniz bu yol da izler. CivilCraft önce öbür koridoru oluşturur; birbirini döngü içinde hedef alacak iki koridor bir tarafta reddedilir ve tablo hangisi olduğunu belirtir.

1. Ekseni seçin ve koridorunu açın.
2. **Hedefler** altında {{ui:Hedef ekle}} öğesine tıklayın.
3. **Taraf**, **Nokta**, **Belirlediği** değer ve **Çizgiye** seçimini yapın. Her değişiklik tek bir geri alma adımıdır.

**Sonuç**, çizginin kaç kesitte ulaşıldığını söyler. Ona ulaşmayan kesitler (uçlarının ötesinde veya eksen çizgisinin arkasında kalanlar) kesit düzeninin değerlerini korur. Silinen bir çizgi, koridoru hedeften önceki haline bırakır ve tablo bunu belirtir. Bir taraf, her nokta için bir genişlik ve bir kot hedefine sahip olabilir.

## Her tarafı parçalardan oluşturun

Koridorun ayarları altında **Her tarafı parçalardan oluşturun** seçeneğini açın. Böylece her tarafın kendi listesi olur; eksen çizgisinden dışarıya doğru: şeritler, bir bankuet, bir oluk, bir bordür, bir ağaçlandırma şeridi, bir kaldırım ve en sonda zemine kadar olan yan şev (kendi kazı ve dolgu oranlarıyla). {{ui:Kırsal yol}} veya {{ui:Kentsel cadde}} ile başlayın, parçalar ekleyip çıkarın, okları kullanarak taşıyın ve bir tarafı diğerine {{ui:Kopyala}} ile kopyalayın. Her değişiklik tek bir geri alma adımıdır.

Enine eğim, yoldan uzaklaşan düşüştür; bu nedenle yola doğru akan bir kaldırım negatiftir. Bordür, verdiğiniz yükseklikte bir yüz, verdiğiniz genişlikte bir üst ve isteğe bağlı olarak arkada bir düşüştür. Süperelevasyon ilk satırdaki her şeridi döndürür; oluk, bordür, şerit ve kaldırım, inşa edildiği gibi şeritlerin kenarından sarkar. Hedefler yine de şeritlerin ucunu ve son parçayı taşır. Enine kesitler oluk akış hattını, bordürün üstünü ve arkasını ve diğerlerini işaretler. Sarmallı bir eğride geçiş uzunluğu sarmaldır: TS'de düz tepe, SC'de tam süperelevasyon.

## Kaplama tabakaları

Bir şerit, bankuet, oluk, ağaçlandırma şeridi veya kaldırım kendi katman yapısını taşıyabilir: parçanın altında {{ui:Tabaka ekle}} bir ad, bir malzeme, bir kalınlık ve türüyle (üst kaplama, bağlayıcı, temel, alt temel, kaplama tabakası veya diğer) bir tabaka ekler; üstten aşağıya. Tabakalar yolun yüzeyini taşımaz (üstü tasarım yüzeyidir); her biri parçasının altında yer alır, derinliği doğrudan aşağı doğru ölçülür. Enine kesitler her tabakanın alt yüzünü kesikli çizgi olarak çizer ve {{ui:Kaplama tabakaları: metrajlar}} her tabakanın plan alanını ve hacmini listeler (koridor boyunca alan kesitlerinden, hacim = alan × kalınlık). IFC dışa aktarımı her tabakayı kendi kalınlığı ve malzemesiyle ayrı bir öğe olarak yazar (bkz. [IFC dışa aktarma ve içe aktarma](topic:ifc)). Yazdığınız kalınlık sizindir: CivilCraft kaplamaların boyutunu belirlemez.

## Yollar yollarla, platformlarla ve patikalarla buluştuğunda

{{ui:Karşılaştığı yolları ve platformları birleştir}} açıkken (her koridor için açıktır), CivilCraft bir koridoru planda karşılaştığı şeye birleştirir:

- **Başka bir yolda biten bir yol** (ekseninin ucu öbür yolun üzerinde yer alır veya o yolun kenarına kendi kaplama genişliğinin yaklaşık yarısı kadar mesafededir) bir kavşağın yan yoludur. Karşılaştığı yol, yan yolun kaplaması için kenarını açar: ağızda bankuet, bordür, şerit ve yürüme yolu, şeridin enine eğimi üzerine serilir ve kaplama olarak çizilir. Yan yol, iki yolun üst üste geldiği yerde ana yolun yüzeyine serilir ve yaklaşım boyunca ona doğru yükselir veya alçalır.
- **Birbirini kesen iki yol** her iki tarafta da aynı biçimde birleştirilir. Eksenler altında ilk listelenen yol geçiş yoludur; öbürü yüzeyini kesişim boyunca izler.
- **Bir platformda biten bir yol** (platformun içinde veya kenarına kendi kaplama genişliğinin yaklaşık yarısı kadar mesafede) platformun kotuna gelir ve yaklaşım boyunca ona doğru yumuşatılır.
- **Bir patika** (Peyzaj › Sert zemin), yolun üzerine serilmek yerine, yolun dış kenarında, oradaki yürüme yolu veya bankuet kotunda biter. Bir yolu kesen patika iki parçaya ayrılır. Bir yoldan biraz kısa çizilmiş bir uç (patika genişliğinin iki katı içinde) kenarına kadar uzatılır.

**Özellikler**, her koridorun neye birleştiğini, orada ne kadar yükseltildiğini veya alçaltıldığını ve hangi uzunluk boyunca olduğunu söyler. Bu uzunluk, 10 m (30 ft) ile değişimin yirmi katının büyüğüdür ve hiçbir zaman koridorun %45'inden fazla olmaz. **Tasarım boy kesiti değiştirilmez**: boy kesiti görünümü hâlâ çizdiğiniz eğim çizgisini gösterir; kesitler, önerilen yüzey, hacimler ve 3B görünüm ise yolu birleştirilmiş hâliyle gösterir. Birleşimi tasarım gereği tam yapmak için, son PVI'ı Özellikler'in bildirdiği kota taşıyın.

Bir koridorda anahtarı kapatırsanız koridor, tam olarak boy kesiti ve kesit düzeninin söylediği gibi kalır; bu durumda hiçbir kavşakta yan yol veya geçiş yolu olarak yer almaz. Neredeyse doğru hizada buluşan yollar (yaklaşık 20°'nin altında) olduğu gibi bırakılır; izler de öyle.

Bir kavşağın henüz yapmadıkları: bordür dönüşleri yoktur (köşeler dik açılıdır), dönüş şeritleri veya adacıklar yoktur, yan yolun ucu kendi eksenine dik kesilir ve şablonlardan oluşturulmuş bir koridor kenarını aynı sade biçimde açar (uç durumundaki bir hendek veya duvar, ağız boyunca düzleştirilir; menfez yoktur). Plan üzerinde bordür dönüşleri, görüş üçgenleri ve çizgilendirme için bkz. [Zemin, yollar, ölçme, madenler ve bağlantılar](topic:soils-roads-survey-mines-links).

## Henüz yapılmadı

Yarma-dolgu şevi için hedefler henüz kullanılamaz. Yol boyunca değişen, sol ve sağ ayrı tutulan bir koridor için [Koridor şablonları](topic:corridor-templates) kullanın. Bkz. [Henüz yapılmadı](topic:not-built-yet).
