---
title: Ekran, parça parça
summary: CivilCraft'taki her çubuğun ve panelin ekrandaki adıyla, araç çubuğundan durum çubuğuna gezintisi.
keywords: arayüz, ekran, araç çubuğu, paneller, özellikler, durum çubuğu, boy kesiti görünümü, yerleşim, gezinti, ui
from: 76272010
---

CivilCraft'ın tek bir ekranı vardır. Sekme ve düzen yoktur. Yan paneller taşınabilir, yüzdürülebilir veya kendi pencerelerine alınabilir: bkz. [Panelleri düzenleme ve ikinci bir monitör kullanma](common:arrange-panels). Yukarıdan aşağıya ve soldan sağa:

- **uygulama çubuğu** (CadCraft işareti, uygulama adı, sürüm, Hakkında, ekran modu, Yardım, Çevrimdışı için kaydet, Kâğıt ve Model)
- yedi düğme grubuyla **araç çubuğu**
- **sol panel**: Arsa, Noktalar, Yüzey, Gösterim ve bir şeyler içe aktardığınızda CBS katmanları
- ortada **plan**, açıkken altında **boy kesiti görünümü**
- **sağ panel**: seçili olanın Özellikleri
- alt boyunca **durum çubuğu**

## Uygulama çubuğu

En üstteki ince çubuk CivilCraft'a değil, CadCraft sitesine aittir.

- Sürüm menüsü hangi derlemeyi çalıştırdığınızı gösterir.
- {{ui:CivilCraft hakkında}} uygulamanın sitedeki sayfasını açar.
- {{ui:Tam ekran}} ekran modları arasında geçiş yapar: tam ekran, sonra çubukları gizli tam ekran, sonra normale dönüş. {{key:Ctrl+Shift+F}} her platformda, Mac dahil, aynısını yapar (orada Command değil Control tuşudur). Çubuklar gizliyken geri getirmek için işaretçiyi üst kenara götürün.
- {{ui:Yardım}} (veya {{key:F1}}) bu yardımı bir yan panelde açar; {{key:F1}} veya {{key:Esc}} kapatır.
- {{ui:Çevrimdışı için kaydet}} CivilCraft'ı bu tarayıcıda tutar, böylece bağlantı olmadan açılır; sonra {{ui:Çevrimdışı hazır}} gösterir. Bkz. [Açabileceğiniz, kaydedebileceğiniz ve dışa aktarabileceğiniz dosyalar](topic:files#online-and-offline).
- {{ui:Kâğıt}} ve {{ui:Model}} açık ve koyu tema arasında geçiş yapar. Plan ve boy kesiti temayı izler; PDF'ler her zaman beyaz üzerine yazdırılır.

## Araç çubuğu

Her grubun düğmelerinin üstünde küçük bir etiketi vardır. Araç ipucunu ve tuşunu görmek için bir düğmenin üzerine gelin.

| Grup | Düğmeler | Ne yaparlar |
|---|---|---|
| Dosya | {{ui:Yeni}}, {{ui:Aç}}, {{ui:Kaydet}} | Baştan başlar, bir nokta dosyası, LandXML veya proje açar, projeyi indirme olarak kaydeder |
| Dışa aktar | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | LandXML 1.2, planın R12 DXF'ini veya bir DWG'sini yazar ya da planın PDF çıktısını alır |
| Yüzey | {{ui:Kırılma çizgisi}}, {{ui:Sınır}} | Ölçü noktalarından geçen bir kırılma çizgisi çizer; dış sınırı çizer |
| Tasarım | {{ui:Eksen}}, {{ui:Platform}}, {{ui:Borular}}, {{ui:Boy kesiti}} | Bir eksen, bir platform, bir boru hattı çizer; boy kesiti görünümünü gösterir veya gizler |
| Düzenle | {{ui:Geri al}}, {{ui:Yinele}}, {{ui:Kopyala}}, {{ui:Yapıştır}}, {{ui:Daha fazla}} | Ölçü noktalarını geri alır, yineler, kopyalar ve yapıştırır; {{ui:Daha fazla}} Kes, Yerinde yapıştır, Çoğalt, Sil, Tüm noktaları seç ve Seçimi kaldır seçeneklerini içerir |
| CBS | {{ui:Koordinatlar}}, {{ui:İçe aktar}}, {{ui:Dışa aktar}}, {{ui:Harita}} | Koordinat sistemini ayarlar, CBS dosyalarını içe ve dışa aktarır, planın altında harita katmanlarını gösterir |
| Görünüm | {{ui:Seç}}, {{ui:Sığdır}}, {{ui:3B}} | Şeyleri seçer ve taşır; her şeyi göstermek için yakınlaştırır; arsayı 3B gösterir ([Arsayı 3B görüntüleme](topic:site-3d)) |

Bir çizim aracı etkinken basılı kalır. Ona yeniden tıklamak, {{key:Esc}} veya {{key:V}} tuşuna basmak {{ui:Seç}} aracına döndürür. {{ui:Geri al}}, {{ui:Yinele}}, {{ui:Kopyala}} ve {{ui:Daha fazla}} içindeki öğeler işlem yapamadıklarında grileşir; araç ipucu nedenini söyler (örneğin "Önce ölçü noktalarını seçin"). Her düğme [Araç çubuğu başvurusu](topic:toolbar) içinde listelenir.

Dar bir pencerede araç çubuğu yana kayar.

## Sol panel

### Arsa

- **Ad**: proje adı. Kaydettiğiniz veya dışa aktardığınız her dosyayı adlandırır ve PDF künye şeridinde basılır.
- **Birimler**: {{ui:ABD fiti}} veya {{ui:Metre}}. Sayıların ne anlama geldiğini söyler. Değiştirmek koordinatları **dönüştürmez**; bkz. [Birimler, istasyonlar ve sayı biçimleri](topic:units-and-stations).

### Noktalar

Boşken bir nokta dosyasının nasıl açılacağını söyler. Noktalar varken dosya adını, nokta sayısını ve kaçının kotu olduğunu, ardından **nokta grupları** tablosunu gösterir: tanımın ilk sözcüğü başına bir satır (GRD, FL, TBS …), bir sayı ve bir **Yüzey** seçimiyle:

- {{ui:Noktalar}}: noktalar yüzeye girer (her grup için varsayılan).
- {{ui:Kırılma çizgisi}}: grubun noktaları nokta numarası sırasıyla tek bir kırılma çizgisinde birleştirilir.
- {{ui:Dışarıda bırakıldı}}: grup yüzeye dokunmaz.

### Yüzey

Mevcut zemin hakkında bilgiler: noktalar, üçgenler, en düşük ve en yüksek kot, ortalama kot, 2B ve 3B alan, kırılma çizgileri ve bir sınır olup olmadığı. Bilgilerin altında bir kutu, yüzey oluşturucunun düzeltmek zorunda kaldığı veya yapamadığı her şeyi listeler. Sonra:

- **En uzun dış kenar**: 0 her dış üçgeni tutar; bir sayı dıştaki uzun ince üçgenleri keser.
- Geçerli olduklarında görünen bağlantılar: {{ui:Sınırı kaldır}}, {{ui:Çizilmiş kırılma çizgilerini kaldır}} ve LandXML'den okunan bir yüzey için {{ui:Yüzeyi noktalardan yeniden oluştur}}.

### Gösterim

- **Yüzey**: {{ui:Mevcut zemin}} veya {{ui:Önerilen (tesviye edilmiş)}}. İkincisi, bir platform veya koridor sorunsuz tesviye ettiğinde kullanılabilir.
- **Kontur aralığı**, **Ana kontur her** ve **Bantlar** (renk bandı sayısı).
- Onay kutuları: {{ui:Konturlar}}, {{ui:Kontur etiketleri}}, {{ui:Üçgenler}}, {{ui:Kot bantları}}, {{ui:Şev okları}}, {{ui:Noktalar}}, {{ui:Nokta etiketleri}}, {{ui:Kırılma çizgileri}}, {{ui:Yüzey kenarı}}, {{ui:Borular}}.
- Bantlar açıkken bant kotlarının bir göstergesi görünür.

Gösterim ayarları projeyle kaydedilir ama geri alma adımları değildir: {{key:Mod+Z}} bir onay kutusunu asla geri çevirmez.

## Plan

Plan; noktaları, yüzeyi ve tasarladığınız her şeyi, kuzey yukarıda olacak şekilde plan görünümünde gösterir. İşaretçide yakınlaştırmak için tekerlek, kaydırmak için boş alanı sürükleyin. Tam liste [Tuşlar ve fare](topic:keyboard) içindedir.

- Boş bir projede **Ölçü noktalarıyla başlayın** başlıklı bir kutu ilk adımları listeler ve {{ui:Örnek arsayı aç}} sunar.
- Bir çizim aracı etkinken planın üstündeki bir ipucu neye tıklanacağını ve nasıl bitirileceğini söyler.
- Bir dosyayı planın üzerine sürüklemek "Bir nokta dosyası, LandXML ya da proje bırakın" gösterir.
- Seçili şeyler vurgulanır. Seçili bir eksen veya platform PI'larında ya da köşelerinde kare tutamaçlar gösterir; seçili bir yapı bir tutamaç gösterir. Taşımak için bir tutamacı sürükleyin.
- Seçili ölçü noktalarının bir halkası vardır. {{key:Shift}} ve bir tıklama bir noktayı ekler veya kaldırır; {{key:Shift}} ve bir sürükleme içindeki noktaları ekleyen bir kutu (veya etraflarında sürüklenirse bir kement) çizer. Bkz. [Ölçü noktalarını seçme, kopyalama ve yapıştırma](topic:copy-paste-points).

## Boy kesiti görünümü

Planın altında açmak için {{key:R}} tuşuna basın veya {{ui:Boy kesiti}} düğmesine tıklayın. Çubuğunda şunlar vardır:

- bir eksen listesi (iki veya daha fazla eksen olduğunda etkindir)
- {{ui:PVI ekle}}: basılıyken boy kesitinde bir tıklama bir PVI ekler ({{key:I}} bunu açıp kapatır)
- işaretçinin altındaki istasyon, zemin, tasarım kotu, eğim ve kazı ya da dolgunun bir okuması
- bir kapat düğmesi

Boy kesiti mevcut zemini, tasarım boy kesitini, her teğetteki eğimleri, her PVI'nın istasyonunu ve kotunu, her düşey eğrinin L ve K değerini BVC ve EVC ile, yüksek ve alçak noktaları ve düşey abartıyı gösterir. Her zaman ekseni bütünüyle sığdırır: yakınlaşmaz ve kaymaz. İşaretçiyi üzerinde gezdirmek, plandaki eksene bir nokta koyar.

## Sağ panel: Özellikler

Başlığı neyi gösterdiğini söyler.

- **Proje** (hiçbir şey seçili değil): bağlantılar olarak eksenler ve platformlar, **Toprak işleri** bloğu ve kuralları ve sorunlarıyla **Boru ağı** bloğu.
- **Eksen**: ad, başlangıç istasyonu, uzunluk, PI tablosu, eğriler, tasarım boy kesitinin PVI tablosu ve bilgileri ve **Koridor** ayarları.
- **Platform**: ad, kot, kazı ve dolgu şevleri, alan, yarma-dolgu sınırı bilgileri ve toprak işleri.
- **Yapı** veya **Boru**: boyutlar, kapak kotları, taban kotları, eğim, örtü ve her türlü sorun.
- **Nokta** ve numarası: noktanın koordinatları, kotu, tanımı ve grubu (salt okunur).

Alanlar {{key:Enter}} tuşuna bastığınızda veya alandan çıktığınızda etki eder. Kabul edilmeyen bir değer geçersiz olarak işaretlenir ve hiçbir şey değişmez.

## Durum çubuğu

- **E** ve **N**: işaretçinin altındaki doğu ve kuzey.
- Oradaki **Zemin** kotu (ve bir platform veya koridorun değiştirdiği yerde **Tesviye**) ya da "Yüzeyin dışında".
- İşaretçinin altındaki **İst** ve kayma (**L** veya **R**) ile en yakın eksen (veya seçili olan).
- Sağda iletiler: az önce ne olduğu ya da bir şeyin neden reddedildiği. Bir ileti birkaç saniye sonra kendiliğinden kaybolur.

## İletişim kutuları

- **Nokta içe aktar**: her nokta dosyasıyla açılır. Bkz. [Ölçü noktalarını içe aktarma](topic:import-points).
- **Planı PDF'e çıktı al**: bkz. [Planın PDF çıktısını alma](topic:plot-pdf).
- **Kaydedilmemiş değişiklikler**: {{ui:Yeni}} veya bir proje ya da LandXML dosyası açmak kaydedilmemiş çalışmayı atmadan önce sorar. {{ui:Bir kopya kaydet}} önce projeyi indirir.

## Küçük ekranlar

Telefondaki gibi 760 piksel genişliğe kadar plan ekranı korur: araç çubuğu yana kayan tek bir satırdır ve paneller alttaki bir çubuktan sayfalar olarak açılır. {{ui:Araçlar}} araç çubuğunu gizler ve {{ui:Taşı}} onu alta koyar.
