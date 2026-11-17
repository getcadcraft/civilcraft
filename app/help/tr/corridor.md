---
title: Bir yol koridorunu süpürün
summary: Bir eksen için koridoru açın, şerit, bankuet ve şev değerlerini ayarlayın ve ürettiği kesitleri, yarma-dolgu sınırı çizgilerini ve toprak işlerini okuyun.
keywords: süperelevasyon, süper, yan eğim, runoff, runout, oran tablosu, enine eğim, rotasyon, koridor, düzenek, alt düzenek, tipik kesit, yol, şerit, bankuet, yan şev, yarma-dolgu sınırı, yarma, dolgu, kesitler, hedef, hedefler, genişlik hedefi, kot hedefi, ofset hedefi, genişletme, kaplama kenarı, başka bir koridoru izleme
from: 91303189
---

Bir koridor, bir ekseni ve tasarım boy kesitini tek bir basit tipik kesitle (bir düzenek) süpürür, onu mevcut zemine tesviye eder ve sonucu önerilen yüzeye ekler. Bir eksen, farklı istasyon aralıklarında birden fazla koridor taşıyabilir ve bir koridor, istasyona göre yeniden kullanılabilir şablonlardan oluşturulabilir ([Koridor şablonları](topic:corridor-templates)). Aşağıdaki basit düzenek iki tarafta aynıdır; her tarafa kendi parçalarını vermek için bkz. [Her tarafı parçalardan oluşturun](topic:corridor#build-each-side-from-parts).

## Düzenek

Eksen çizgisinden dışarı doğru, her iki tarafta:

1. verilen genişlikte bir **şerit**, **şerit eğimi** ile yol sırtından uzaklaşarak
2. verilen genişlikte bir **bankuet**, **bankuet eğimi** ile
3. bankuet kenarından zemine değdiği yere kadar bir **yan şev**: zemin üstteyse **yarma şevi**, altındaysa **dolgu şevi**

Başlangıç değerleri bir tasarım standardı değil, yer tutuculardır:

| Değer | ABD feet | Metre |
|---|---|---|
| Şerit genişliği | 12 ft | 3.6 m |
| Şerit eğimi | 2% | 2% |
| Bankuet genişliği | 4 ft | 1.2 m |
| Bankuet eğimi | 4% | 4% |
| Yarma şevi | 2 : 1 | 2 : 1 |
| Dolgu şevi | 3 : 1 | 3 : 1 |
| Her kesit aralığı | 10 ft | 5 m |

Yan şevlerin eğimleri yatay:düşeydir (H:V): 3 : 1, 1 aşağı için 3 yatay demektir.

## Koridoru oluşturun

Hatasız bir eksene ve en az iki PVI'si olan, hatasız bir tasarım boy kesitine ihtiyacınız vardır.

1. Ekseni seçin.
2. Sağ panelde, **Koridor** altında **Tasarım boy kesiti boyunca bir düzenek süpür** kutusunu işaretleyin. Alanlar görünür ve koridor hemen oluşturulur. Plan şerit ve bankuet kenarlarını ve yarma-dolgu sınırı çizgilerini gösterir; **Görüntü** altında {{ui:Önerilen (tesviye edilmiş)}} seçiliyse konturlar yeni zemini gösterir.
3. Herhangi bir değeri değiştirin: **Şerit genişliği**, **Şerit eğimi**, **Bankuet genişliği**, **Bankuet eğimi**, **Yarma şevi**, **Dolgu şevi**, **Her kesit aralığı**. Her birinden sonra {{key:Enter}} tuşuna basın. Yarma, dolgu ve kesit aralığı 0'dan büyük olmalıdır.
4. Alanların altındaki satırı okuyun, örneğin "0+00.00 ile 3+86.36 arasında 39 kesit; yarma 240.2 cu yd, dolgu 556.0 cu yd."

Kesitler her **Her kesit aralığı** adımında, uçlarında ve her yatay ve düşey eğrinin başında ve sonunda alınır. Her kesit ve onun içinden geçen çizgiler (eksen, şerit ve bankuet kenarları, yarma-dolgu sınırı), önerilen yüzeyin kırılma çizgileri olur.

Koridoru kapatmak için kutuyu kaldırın. Değerleri bir dahaki sefere için saklanır.

## Oluşmadığında

Alanların altındaki kırmızı bir kutu nedenini söyler:

| İleti | Ne yapılmalı |
|---|---|
| "Koridor, hatasız bir tasarım boy kesitine ihtiyaç duyar." | PVI'ler ekleyin veya çakışan düşey eğrileri düzeltin (bkz. [Düşey boy kesitini tasarlayın](topic:profile)). |
| "Tasarım boy kesiti eksenle çakışmıyor." | PVI'leri eksenin istasyon aralığına taşıyın. |
| "Koridorun en az iki kesiti yüzeyde olmalıdır." | Koridorun çoğu mevcut zeminin dışında. |
| "4 yan şev, zemine ulaşmadan yüzeyin dışına çıkıyor." | Yüzey kenarına yakın yerlerde şev zemine ulaşamaz. Yolu kenardan uzak tutun veya o yerde dolgu ya da yarma yüksekliğini düşürün. |
| "Koridorun yarma-dolgu sınırı çizgileri çakışıyor (örneğin kesitler sıkı bir eğrinin iç tarafında çakışıyor). Daha büyük bir yarıçap veya daha dar bir düzenek kullanın." | Keskin bir eğrinin iç tarafındaki kesitler çakışır. Yarıçapı artırın veya düzeneği daraltın. |

Sorunlu bir koridor tesviye edilmez ve toprak işlerine dahil edilmez.

## Koridorlar ve platformlar birlikte

Önerilen yüzey sırayla oluşturulur: önce her koridor, sonra her platform. Bir platformun tesviyesi bir koridorla çakıştığında platform kazanır. Hacimler tüm yarma-dolgu sınırı çizgilerinin içinde birlikte hesaplanır; bkz. [Toprak hacimleri](topic:volumes).

## Süperelevasyon

Bir eğride yol içe doğru eğilebilir, böylece trafik dışa doğru daha az itilir. Ekseninin **Özellikler** içinde **Süperelevasyon** altındaki **Eğrileri süperelevasyonla** kutusunu işaretleyin:

- Her dairesel eğri, oran tablosundan bir **e** oranı alır: eğrinin yarıçapına ulaştığı ilk satır (boş oranlı bir satır normal sırtı korur). Tablo ve **En büyük bağıl eğim** (başlangıç 0.5 %) yer tutucudur, bir standart değildir: bunları kendi tasarım kriterlerinizden belirleyin. İhtiyacınıza göre satır ekleyin veya çıkarın.
- Şeritler eksen çizgisi etrafında döner. Eğriden önce dış şerit **runout** (normal sırt ÷ e × runoff) boyunca düzleşir; sonra **runoff** (şerit genişliği × e ÷ eğim) boyunca dış şerit, tüm yol içe doğru e eğimle eğilene kadar dönmeye devam eder. Runoff'un üçte ikisi eğriden önce, üçte biri eğrinin üzerinde yer alır. Eğriden sonra aynısı ters yönde olur.
- Düşük taraftaki bir bankuet asla şeridinden daha düz değildir; yüksek tarafta kendi eğimini korur (yuvarlanır).
- Altındaki tablo her eğrinin yarıçapını, oranını, runoff ve runout değerlerini ve tam süperelevasyonun nerede başlayıp bittiğini listeler. **Süperelevasyon diyagramı**, her iki şeridin enine eğimlerini istasyonlar boyunca çizer (sol şerit düz, sağ şerit kesikli).
- Tam süperelevasyona ulaşmak için çok kısa bir eğri veya geçişleri çakışan iki eğri, tablonun üstündeki bir kutuda belirtilir.

Kesitler, toprak işleri, 3B görünüm ve paftalar hepsi eğilmiş yolu gösterir. Her değişiklik bir adımdır: {{key:Mod+Z}} onu geri alır.

## Hedefler

Bir hedef, yolun bir tarafındaki bir noktayı bir çizgiye taşır: **Kaplama kenarı** veya **Bankuet kenarı**, **Sol** veya **Sağ** tarafta. Her kesit, eksen çizgisine dik olarak çizgiyle buluşur ve yalnızca o tarafa doğru gider; bu nedenle sağdaki bir hedef hiçbir zaman sol tarafı taşımaz.

| Ayarlar | Çizgi kesite rastladığında ne olur |
|---|---|
| **Genişlik** | Nokta çizgi üzerine oturur: şerit (veya bankuet) ona göre genişler veya daralır ve enine eğimini korur. |
| **Kot** | Nokta, o yerde çizginin kotunu alır, kendi ofsetinde: şeridin (veya bankuetin) enine eğimi bunu izler. |

Çizgi bir özellik çizgisi (**Kullanımı** ne olursa olsun) veya başka bir koridorun bir çizgisi olabilir: eksen çizgisi, kaplama kenarları, bankuet kenarları veya yarma-dolgu sınırı çizgileri. Bir koridorun çizgisi o koridorun takip ettiği çizgidir: diğer yolu değiştirirseniz bu da izler. CivilCraft önce diğer koridoru oluşturur; birbirlerini döngüde hedefleyecek iki koridor bir tarafta reddedilir ve tablo hangisi olduğunu söyler.

1. Ekseni seçin ve koridorunu açın.
2. **Hedefler** altında {{ui:Hedef ekle}} seçeneğine tıklayın.
3. **Taraf**, **Nokta**, neyi **Ayarladığını** ve **Çizgiye** hangi çizgi olduğunu seçin. Her değişiklik bir geri alma adımıdır.

**Sonuç**, çizginin kaç kesitte ulaşıldığını söyler. Çizgiye ulaşmayan kesitler (uçlarının ötesinde veya eksen çizgisinin arkasında kalan) düzeneğin değerlerini korur. Silinen bir çizgi koridoru hedeften önceki haline bırakır ve tablo bunu söyler. Bir taraf, her nokta için bir genişlik ve bir kot hedefine sahip olabilir.

## Her tarafı parçalardan oluşturun

Koridor ayarları altında **Her tarafı parçalardan oluştur** seçeneğini açın. Her tarafın, eksen çizgisinden dışarı doğru, kendi listesi olur: şeritler, bir bankuet, bir yağmur oluğu, bir bordür, bir ağaçlandırma şeridi, bir yaya kaldırımı ve son olarak zemine yan şev (kendi yarma ve dolgu oranlarıyla). {{ui:Kırsal yol}} veya {{ui:Kentsel cadde}} ile başlayın, parçaları ekleyip çıkarın, okları kullanarak taşıyın ve bir tarafı diğerine {{ui:Kopyala}}. Her değişiklik bir geri alma adımıdır.

Enine eğim, yoldan uzaklaşan eğimdir; bu yüzden yola doğru akan bir yaya kaldırımı negatiftir. Bir bordür, verdiğiniz yükseklikte bir yüz, verdiğiniz genişlikte bir üst ve isteğe bağlı bir arka düşüştür. Süperelevasyon ilk satırdaki her şeridi döndürür; yağmur oluğu, bordür, ağaçlandırma şeridi ve yaya kaldırımı inşa edildikleri şekliyle şeritlerin kenarından sarkar. Hedefler yine şeritlerin ucunu ve son parçayı taşır. Enine kesitler yağmur oluğu akış çizgisini, bordürün üstünü ve arkasını ve diğerlerini işaretler. Spiral eğrili bir eğride runoff spiraldir: TS'de düz sırt, SC'de tam süperelevasyon.

## Kaplama tabakaları

Bir şerit, bankuet, yağmur oluğu, ağaçlandırma şeridi veya yaya kaldırımı kendi yapısını taşıyabilir: parçanın altında **Tabaka ekle** bir ad, bir malzeme, bir kalınlık ve türüyle (yüzey, bağlayıcı, temel, alt temel, koruma veya diğer) bir tabaka ekler; üstten aşağıya. Tabakalar yolun yüzeyini (üstü tasarım yüzeyidir) taşımaz; her biri parçasının altında yer alır ve derinliği doğrudan aşağı ölçülür. Enine kesitler her tabakanın alt kısmını kesikli bir çizgi olarak çizer; {{ui:Kaplama tabakaları: metrajlar}} her tabakanın plan alanını ve hacmini listeler (koridor boyunca alan kesitlerinden, hacim = alan × kalınlık). IFC dışa aktarımı her tabakayı kendi kalınlığı ve malzemesiyle ayrı bir öğe olarak yazar (bkz. [IFC dışa aktarma ve içe aktarma](topic:ifc)). Yazdığınız kalınlık sizindir: CivilCraft kaplamaları boyutlandırmaz.

## Henüz yapılmamış olanlar

Yarma-dolgu şevi için hedefler henüz kullanılamıyor. Yol boyunca değişen ve sol ve sağı ayrı tutulan bir koridor için [Koridor şablonlarını](topic:corridor-templates) kullanın. Bkz. [Henüz yapılmadı](topic:not-built-yet).
