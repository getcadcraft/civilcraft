---
title: Diğer inşaat yazılımlarından geçiş
summary: Tanıdık inşaat tasarım iş akışlarının CivilCraft'taki karşılıkları ve deneyimli kullanıcıların ilk saatte takıldığı farklar.
keywords: geçiş, taşıma, tanıdık, farklar, iş akışı, komutlar, eşleme, cogo, koridor, tesviye, boru ağı, stiller, komut satırı
from: feae37d6
---

Civil 3D kullandıysanız CivilCraft'taki fikirleri zaten biliyorsunuz: arazi noktaları ve nokta grupları, kırılma çizgileri ve sınırlarla TIN yüzeyler, PI ile eksenler, PVI ile boy kesitleri, koridorlara süpürülen kesitler, eğime göre tesviye, yerçekimli boru ağları, LandXML. Asıl farklı olan, bunların çevresindeki neredeyse her şey: çizim dosyası yok, komut satırı yok ({{ui:Drafting classic}} menü stilini seçmediğiniz sürece), stil yok, Prospector yok ve ayar iletişim kutuları yok. CivilCraft bir tarayıcıda küçük, odaklı bir araçtır ve bu sürümde tam bir inşaat paketinin yaptığının bir kısmını yapar. Bu sayfa bildiklerinizi burada karşılık gelenlerle eşleştirir.

:::tip
Civil 3D'nin şeridini seviyorsanız, {{ui:Settings}} › {{ui:CivilCraft}} › {{ui:Menus, keys and mouse}} içinden {{ui:Civil ribbon}} menü stilini seçin: Giriş, Yüzeyler, Değiştir, Coğrafi konum, Görünüm ve Çıktı sekmeleri; orta düğme kaydırır ve {{key:Shift}} ile orta düğme 3D görünümü döndürür. Komut yazıyorsanız, {{ui:Drafting classic}} bir komut satırı ekler (ALIGNMENT, PAD, PROFILE, ZOOM …). Bkz. [Menüler, tuşlar ve fare](topic:menus-keys-and-mouse).
:::

## İş akışı haritası

| Yapmak istediğiniz | Tanıdık yol | CivilCraft'ta |
|---|---|---|
| Arazi noktalarını içe aktarın | Bir nokta dosya biçimiyle noktaları içe aktarın | {{ui:Open}}, sonra **Noktaları içe aktar** bölümünde sütun sırasını kontrol edin ([Arazi noktalarını içe aktarın](topic:import-points)) |
| Noktaları sıralayın | Nokta grupları, açıklama anahtarları | Açıklamanın ilk kelimesine göre otomatik gruplar; açıklama anahtarı yok |
| Bir noktayı düzenleyin | Nokta düzenleyicisi, tutamaçlar | Noktaya tıklayın ve Özellikler'de yazın, ya da sürükleyin ([Arazi noktasını düzenleyin](topic:edit-points)) |
| Mevcut zemini oluşturun | Yüzey oluşturun, nokta gruplarını veri olarak ekleyin | Otomatik: yüzey, girdileri değiştiğinde yeniden oluşur |
| Kırılma çizgileri ekleyin | Polilinelerden ya da özellik çizgilerinden kırılma çizgisi ekleyin | Bir nokta grubunu {{ui:Breakline}} olarak ayarlayın ya da {{ui:Breakline}} aracıyla noktalara tıklayın ({{key:B}}) |
| Yüzeyi kırpın | Dış sınır, gizleme sınırı, en büyük üçgen uzunluğu | {{ui:Boundary}} ({{key:O}}, yalnızca dış) ve **En uzun dış kenar** |
| Kontur gösterin | Yüzey stili | Sol paneldeki **Görüntü**: aralık, her ana, etiketler, bantlar, eğim okları |
| Bir eksen merkezi çizgisi oluşturun | Eksen oluşturma araçları, eğri ve spiral ayarları | {{ui:Alignment}} ({{key:A}}): PI'lere tıklayın, {{key:Enter}}; yarıçaplar ve spiral uzunlukları PI tablosunda |
| Bir boy kesiti görünümü oluşturun | Boy kesiti görünümü sihirbazı, bantlar | {{ui:Profile}} ({{key:R}}): planın altında tek bir boy kesiti görünümü, her zaman sığdırılmış |
| Eğimi tasarlayın | Boy kesiti yerleşim araçları | {{ui:Start from the ground}}, {{ui:Add PVIs}} ({{key:I}}), PVI'leri sürükleyin, **Eğri L** yazın |
| Yol inşa edin | Kesit, alt kesitler, koridor, hedefler, bölgeler | Eksenin altında **Tasarım boy kesiti boyunca bir kesit süpür** kutusunu işaretleyin; her iki yanda bir şerit, bankuet ve şev, ya da her yan parçalardan (oluk, bordür, kaldırım …) oluşur |
| Bir platformu tesviye edin | Özellik çizgileri, tesviye grupları, tesviye ölçütleri | {{ui:Pad}} ({{key:G}}): kesme ve dolgu şevleriyle düz bir platform |
| Toprak işlerini hesaplayın | Hacim yüzeyleri, hacim paneli | Sağ paneldeki **Toprak işleri**, ızgara yöntemi, canlı güncellenir |
| Yağmur ya da pis su hattı kurun | Kurallı, parça listeli boru ağı | {{ui:Pipes}} ({{key:P}}): akış yönünde yapılara tıklayın; kendi belirlediğiniz üç kural; otomatik dip kotları |
| Başkalarıyla alışveriş yapın | LandXML içe ve dışa aktarma | Bir LandXML dosyasını {{ui:Open}} ile açın; dışa aktarmak için {{ui:LandXML}} ([LandXML alışverişi](topic:landxml)) |
| Çizgileri CAD'e gönderin | DWG'ye dışa aktarma | {{ui:DWG}} (2000'den 2018 biçimine) ya da {{ui:DXF}} (R12) |
| Çıktı alın | Yerleşimler, görünüm pencereleri, sayfa takımları | {{ui:PDF}}: seçilen ölçekte planın tek bir yatay sayfası; plan ve boy kesiti sayfaları ile kesit sayfaları PDF olarak |
| Dosyalar arasında iş paylaşın | Veri kısayolları, referanslar | Yok: dosya başına bir proje |
| Geri alın | Geri al | {{key:Mod+Z}} ve {{key:Mod+Y}}, 200 adım; görüntü ayarları geri alma adımı değildir |

## Sizi takıldıran farklar

**Komut satırı yoktur**, {{ui:Drafting classic}} menü stilini seçmediğiniz sürece. Araçlar araç çubuğu düğmeleri ve tek harflerdir: {{key:A}} eksen, {{key:G}} platform, {{key:P}} borular, {{key:B}} kırılma çizgisi, {{key:O}} sınır, {{key:R}} boy kesiti, {{key:I}} PVI ekle, {{key:V}} seç, {{key:F}} sığdır. Diğer menü stillerinde komut adı yazmak bir şey yapmaz. Bkz. [Tuşlar ve fare](topic:keyboard).

**Enter bitirir; çift tıklama risklidir.** Son noktaya bir kez tıklayın, sonra {{key:Enter}} tuşuna basın. Bu sürümde çift tıklama da bitirir, ama çift tıkladığınız noktayı düşürür. Sağ tık bitirmez ya da tekrarlamaz; yalnızca onunla sürüklerseniz kaydırır.

**Her şey her zaman dinamiktir.** Bir nokta grubunu, bir yarıçapı, bir PVI'yi ya da bir platform eğimini değiştirin; yüzey, eğriler, koridor, tesviye çizgileri ve hacimler hemen güncellenir. Yeniden oluşturacak bir şey yoktur ve güncelliğini yitiren bir şey yoktur.

**Hiçbir şey bir çizim nesnesi değildir.** Plan, CAD komutlarıyla düzenleyebileceğiniz bir çizim değil, tasarımın bir görünümüdür. Kendi çizgilerinizi ya da metninizi ekleyemez, bir katmanın rengini değiştiremez ya da bir şeyi patlatamazsınız. DXF'e aktarın ve çizimi bir CAD programında bitirin.

**Stil yoktur.** Renkler, çizgi kalınlıkları, etiket boyutları ve katman adları sabittir (bkz. [Plan katmanları](topic:plan-layers)). Uygulama çubuğundaki Kâğıt ve Model, açık ve koyu ekran arasında geçiş yapar.

**Her biri birer tanedir.** Proje başına bir mevcut zemin yüzeyi, bir tesviye sonucu, bir boru ağı. Birden çok eksen ve platform sorun değil.

**Birimler etikettir.** {{ui:US feet}} ya da {{ui:Metres}} seçmek hiçbir şeyi dönüştürmez. Bir çizim ölçeği yoktur. Bir koordinat sistemi isteğe bağlıdır: {{ui:Coordinates}} altında bir tane ayarlayın; hiçbir şey taşınmaz, yalnızca sayıların ne anlama geldiğini söyler (bkz. [Projenin koordinat sistemini ayarlayın](topic:coordinate-systems)). LandXML'e yazılırken feet, ABD arazi ölçümü feet'i olarak ele alınır.

**Kırılma çizgisi grupları nokta numarası sırasıyla birleşir.** {{ui:Breakline}} olarak ayarlanmış bir grup, tüm noktalarından numara sırasıyla tek bir çizgi olur. Ortak kodlar (ikisi de "FL" kodlu iki akış çizgisi) tek bir zikzak çizgi yapar; bunları elle çizin.

**İstasyonların biçimi aynı görünür, ama metrik projeler farklıdır.** Feet 100 ft'lik istasyonlar kullanır (12+34.56); metre 1000 m'lik istasyonlar kullanır (1+234.567).

**Mac'te silme.** Mac'te delete etiketli tuş tarayıcıda Backspace'tir. Bir seçimi silmek için Fn ve delete'i ya da {{ui:Delete}} düğmesini kullanın.

**Dosyalar indirilir.** {{ui:Save}} her seferinde bir `.civilcraft.json` dosyası indirir; "açık dosyanın üzerine kaydet" diye bir şey yoktur. Kaydedilmemiş işin bir kurtarma kopyası bu tarayıcıda tutulur ([Kaydedilmemiş işi kurtarma](common:recover)). Bir nokta dosyası açmak, sormadan noktaları değiştirir. Bkz. [Açabileceğiniz, kaydedebileceğiniz ve dışa aktarabileceğiniz dosyalar](topic:files).

**Kurallar sizindir.** Boru ağı kuralları ve koridor kesiti, bir standart olmayan yer tutucu değerlerle başlar. Herhangi bir denetime güvenmeden önce kendinizinkini ayarlayın.

**Hacimler ızgara tabanlıdır.** Kazı ve dolgu, iki yüzey arasındaki ince bir ızgaradan, tesviye çizgilerinin içinden, şişme ya da büzülme olmadan hesaplanır. TIN'den TIN'e hacme yakındır ama aynı değildir.

## Eksik olanlar

Klotoid dışındaki spiraller, yol boyunca değişen kesitler, eğimli platformlar, giriş ağzı kapasitesi ve tutma havuzu, parça kataloğu, boru boy kesitleri, parsel yerleşimleri ve parsel boyutlandırma, en küçük kareler dengelemesi ve arazi ölçüm veritabanları, DWG açma ve daha fazlası. Tam liste ve bugün yerine ne yapılacağı [Henüz yapılmadı](topic:not-built-yet) sayfasındadır.
