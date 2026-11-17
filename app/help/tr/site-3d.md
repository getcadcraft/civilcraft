---
title: Sahayı 3B görün
summary: 3B görünümü açın, döndürün, kaydırın ve yakınlaştırın; dikey abartmayı ve renklendirmeyi ayarlayın, neyin gösterileceğini seçin ve eksenleri, platformları, özellik çizgilerini, kırılma çizgilerini, boruları, yapıları ve noktaları seçmek için tıklayın.
keywords: etiketler, 3b etiketler, kameraya bakan etiketler, istasyon etiketleri, kontur etiketleri, nokta etiketleri, yüzeye yerleştirme, hava fotoğrafı, yüzeydeki harita katmanları, 3b, üç boyut, 3b görünüm, görünüm küpü, pusula, yörünge, perspektif, paralel, izometrik, iso, dikey abartma, arazi, model, saha modeli, etrafında uçma, görselleştir, render, 3b borular, yapılar, rögarlar, koridor 3b, 3b yol, yol yüzeyi, şeritler, bordürler, kaldırımlar, 3b bitkiler, 3b ağaçlar, çalılar, çitler, 3b peyzaj, 3b rampalar, basamaklar, duvarlar, kaplama, 3b sert peyzaj
from: a16bafe1
---

3B görünüm sahayı tek bir model olarak gösterir: mevcut arazi ve işlenmiş yüzey, üzerlerine yerleştirilmiş konturlar, kırılma çizgileri ve yüzey kenarı, her eksen tasarım boy kesiti üzerinde istasyon işaretleriyle, koridorun özellik çizgileri ve yolun kendisi (şeritler, bankuetler, oluklar, bordürler, şeritler ve kaldırımlar kendi renklerinde), yarma-dolgu çizgileriyle platformlar, borular ve yapılar gerçek kotlarında boru ağı ve Peyzaj çalışma alanından bitkiler, kaplama, yollar, duvarlar, bordürler, rampalar ve basamaklar. Planla aynı projeyi okur, bu yüzden her düzenleme ikisinde de görünür.

## 3B görünümü açın

1. Bir yüzey olması için ölçü noktalarını (ya da bir LandXML ya da proje dosyasını) açın. Bitkiler, kaplama ya da rampalar tek başına da açmak için yeterlidir.
2. {{key:D}}'ye basın ya da araç çubuğunun {{ui:View}} grubundaki {{ui:3D}}'ye tıklayın.
   3B görünüm, planın üzerinde açılır ve tüm sahaya güneydoğudan bakar. İlk seferde yüklenmesi bir an alır.
3. Planı geri getirmek için {{key:D}}'ye ya da {{ui:3D}}'ye yeniden basın. {{ui:Alignment}} ya da {{ui:Pad}} gibi bir çizim aracı seçmek de plana döner, çünkü çizim orada yapılır.

## Etrafta hareket edin

| Yapmak için | Bunu yapın |
|---|---|
| Yörüngede dönme | Sol ya da orta düğmeyle sürükleyin |
| Kaydırma | Sağ düğmeyle sürükleyin ya da {{key:Shift}} tuşuna basılı tutup sürükleyin |
| Yakınlaştırma | Tekerleği çevirin; imlece doğru yakınlaştırır |
| Dokunmatik pedde yörünge | İki parmakla kaydırın ({{key:Shift}} ve kaydırma kaydırır) |
| Dokunmatik pedde yakınlaştırma | Sıkıştırın |
| Dokunma | Bir parmak yörüngede döndürür; iki parmakla sıkıştırma yakınlaştırır ve kaydırma taşır |
| Tuşlar (görünüm odaktayken) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} yörüngede döndürür, {{key:Shift}} ile kaydırır; {{key:Plus}} ve {{key:Minus}} yakınlaştırır |

Görünümün üstündeki çubukta geri kalanlar vardır:

- Görünüm listesi: **İzometrik**, **Üst**, **Alt**, **Ön** (kuzeye bakar), **Arka**, **Sol**, **Sağ**.
- {{ui:Perspective}}: basılıyken perspektif görünüm; paralel izdüşüm (kısalma yok) için tıklayın.
- {{ui:Extents}}: her şeyi yeniden gösterir. {{key:F}} 3B görünüm açıkken aynısını yapar.

## Görünüm küpü

Sağ üst köşedeki görünüm küpü görünümle birlikte döner. Sahaya oradan bakmak için bir yana, bir kenara ya da bir köşeye tıklayın (kamera, sisteminiz azaltılmış hareket istemedikçe yumuşakça döner). Yörüngede dönmek için küpü sürükleyin. Altındaki pusula halkası kuzeyi (ızgara kuzeyi, +Y) gösterir: sahayı dikey eksen etrafında döndürmek için halkayı sürükleyin ya da o yönden bakmak için K, D, G ya da B'ye tıklayın. Sol üstündeki küçük ev şeklindeki {{ui:Home}}, tüm sahanın izometrik görünümüne geri döner. Klavyeyle: küpe gelmek için {{key:Tab}}, oklar bir yan, kenar ya da köşe seçer, {{key:Enter}} oradan bakar.

Planda aynı küp üstü gösterir. Oradan bakan 3B görünümü açmak için başka bir yan, kenar ya da köşeye tıklayın (ya da sürükleyin): belirli bir yönden 3B'ye girmenin en hızlı yolu budur. Küpü küçük bir eksen simgesiyle değiştirmek ya da gizlemek için bkz. [CivilCraft ayarları](topic:settings) içindeki **Köşe göstergesi**.

## Yükseklikleri abartın

Sahalar genellikle yüksekliklerinden çok daha geniştir, bu yüzden kotlar başlangıçta **2×** gerilir. Çubuktaki listeden **1×**, **2×**, **3×**, **5×** ya da **10×** seçin ya da [CivilCraft ayarları](topic:settings) içindeki **3B dikey abartma** altından (ikisi tek bir ayardır). Yalnızca görünüm değişir: hacimler, boy kesitleri ve dışa aktarımlar gerçek ölçekte kalır.

## Yüzeyleri renklendirin

- **Kot bantları**: planın kot bantlarıyla aynı bantlar ve renkler (bant sayısı sol paneldeki **Görüntüle** altında ayarlanır). Her bant kenarı tam kendi kotunda kesilir.
- **Tek renk**: mevcut arazi ve işlenmiş yüzeyin her biri düz bir renkte.
- **Harita katmanları**: planın altında gösterilen harita katmanları (coğrafi referanslı bir resim, harita karoları ya da bir harita servisi; bkz. [Harita katmanları](topic:map-layers)) yüzeylerin üzerine bir levha gibi serilir, böylece bir hava fotoğrafı tepelerde görünür. Hâlâ gelen resimler geldikçe dolar. Hiçbir harita katmanı gösterilmiyorken yüzeyler kot bantlarını korur ve görünüm bunu söyler. Resim ekran içindir: GLB ve OBJ dışa aktarımları onu taşımaz.

İki yüzey de gösterildiğinde, mevcut arazi işlenmiş yüzeyin üzerinde saydamdır, böylece kazıyı (tasarımın üstündeki arazi) ve dolguyu görebilirsiniz.

## Neyin gösterileceğini seçin

Çubuktaki {{ui:Show}}'a tıklayın ve işaretleyin ya da temizleyin:

| Öğe | Nedir |
|---|---|
| Mevcut arazi | Ölçü noktalarından oluşturulan yüzey (ya da LandXML'den okunan) |
| İşlenmiş yüzey | Koridorlar ve platformlar işlenmiş mevcut arazi (yalnızca varsa) |
| Üçgen kenarları | Her TIN kenarı, çizgi olarak |
| Konturlar | Gösterilen her yüzeyin küçük ve büyük konturları, planın aralığında |
| Yüzey kenarı | Gösterilen her yüzeyin dış kenarı, kendi kotlarında |
| Kırılma çizgileri | Her kırılma çizgisi, kendi kotlarında |
| Eksenler ve istasyonlar | Her eksen tasarım boy kesitinde (boy kesiti yoksa arazide), 50 ft ya da 20 m aralıklı işaretlerle |
| Koridor özellik çizgileri | Her iki yanda kaplama kenarı, bankuet ve yarma-dolgu sınırı |
| Yol yüzeyleri | Her koridorun kendi kesitinden oluşturduğu yol: şeritler, bankuetler, oluklar, bordürler, şeritler ve kaldırımlar, her biri kendi renginde, işlenmiş yüzeyde |
| Bitkiler | Her bitki ve bitki yataklarındaki ve çitlerdeki bitkiler, bitki listesinden boyutlandırılmış basit şekiller olarak: bir ağaç bir gövde ve yuvarlak bir taç (iğne yapraklı için koni, uzun gövdeli palmiye için bir tutam); çalılar, çit bitkileri, çok yıllık ve yer örtücüler kubbe, otlar tutam, tırmanıcılar ince sütunlar. Planda gösterilen boyda işlenmiş yüzeyde (ya da mevcut arazide) dururlar: olgun ya da dikim anında |
| Sert peyzaj | Düşüşleriyle kaplama ve yollar, duvarlar, bordürler, basamaklar ve aralarında düz sahanlıklarla basamaklar halinde tırmanan rampalar |
| Platformlar ve yarma-dolgu | Her platform konturu kendi kotunda ve yarma-dolgu çizgisi |
| Borular ve yapılar | Borular ters kotları arasında yuvarlak borular olarak, yapılar kenardan çukura |
| Ölçü noktaları | Her noktada bir kotla nokta (başlangıçta kapalı) |
| CBS katmanları | Planda gösterilen CBS katmanları, kendi renklerinde: çizgiler ve konturlar kendi kotlarında, diğerleri mevcut arazide (ona tam olarak uyar); noktalar küçük çarpılar. Yüzeyin dışında kotu olmayan şekiller atlanır ve görünüm kaç tane olduğunu söyler |
| Etiketler | Her zaman size bakan adlar ve değerler: her eksenin adı başında ve her 100 ft (ya da 100 m) istasyonları, her ana konturun kotu, platformlar, özellik çizgileri ve yapılar adlarıyla ve **Ölçü noktaları** işaretliyken her noktanın numarası ve kotu |

Etiketler her zaman, siz nasıl döndürseniz ya da yakınlaştırsanız de aynı boyda ve dik kalır; önündeki bir tepe etiketi gizler. Sıkıştıklarında en önemlisi görünür, geri kalanı siz yakınlaştırana kadar bekler: önce eksenler, sonra yapılar, platformlar, özellik çizgileri, istasyonlar, konturlar ve noktalar, daha yakın olanlar önce. Yalnızca ekrandadırlar; dışa aktarımlar ve çizimler bunları dışarıda bırakır.

Seçimleriniz, abartma ve renklendirme bu tarayıcıda hatırlanır.

Bir yol arazi üzerine inşa edilir. Bir eksen ve koridor var ama henüz ölçü noktası ya da yüzey yoksa yol, şimdilik sahte bir zemin üzerinde çizilir: tasarım boy kesitinin ortalama kotunda, ya da hiç boy kesiti yoksa 0 kotunda düz. 3B görünümün altında ve koridorun özelliklerinde bir uyarı bunu söyler. Bu yalnızca bir resimdir: hacim ya da kesit ondan çıkmaz. Ölçü noktalarını ya da bir yüzeyi açın; yol kendiliğinden gerçek zemine geçer.

Dikey abartma arazeyi gerer, bitkileri değil: abartılmış zemin üzerinde gerçek yükseklik ve yayılımlarında dururlar, bu yüzden bir ağaç her ayarda bir ağaç gibi görünür. Bitkiler ayrıntılı modeller değil, basit şekillerdir: binlercesi döndürmek ve yakınlaştırmak için hızlı kalır.

## Borular ve yapılar

- Bir boru, iç tabanı ayarladığınız ters kotlarda ve üstü (tepe) bir iç çap daha yüksekte bir yuvarlak boru olarak çizilir. Çaplar feet projesinde inç, metre projesinde milimetredir; sağ panelde olduğu gibi.
- Bir yapı, rögarından (yazılmış ya da yüzeyden) çukuruna (en düşük ters kot eksi çukur derinliği) iner. Hiçbir ters kot yoksa 5 ft (1.5 m) derinlikte çizilir.
- Bir sorunu olan borular ve yapılar (sağ paneldeki ağ denetimine bakın) kırmızı çizilir.
- Ters kotu olmayan bir boru çizilmez; görünümün altındaki bir not kaç tane olduğunu söyler.

## 3B görünümden seçin

Bir ekseni (ya da yolunu), bir platformu, bir özellik çizgisini, bir boruyu, bir yapıyı, bir ölçü noktasını, bir bitkiyi, bir rampayı ya da başka bir sert peyzaj öğesini tıklayın. Planda tıklamış gibi seçilir: özellikleri sağ panelde açılır, orada düzenleyebilirsiniz ve 3B'de her şeyin üstünde seçim renginde çizilir. İmlecin yanındaki bir ipucu, tıkladığınız şeyin adını doğu, kuzey ve kotuyla verir. Borular ve yapılar yer altında olsa bile tıklanabilir; bir tepenin arkasında gizli bir çizgi ona tıklanarak geçilemez.

Bir kırılma çizgisine tıklayarak hangisi olduğunu görün: vurgulanır ve durum çubuğu adını söyler (kırılma çizgilerinin kendi özellikleri yoktur).

Bilgi için arazinin üzerine tıklayın: ipucunda oradaki doğu, kuzey ve kotu okuyun.

## Bir ekseni boyunca sürün

3B çubuktaki **Sür**'e tıklayın ve bir eksen seçin. Görünüm bir sürücü koltuğuna geçer: yoldan 3.5 ft (1.07 m) yukarıda, tasarım boy kesitinde (henüz yoksa eksen boyunca arazi üzerinde), ileriye, eksen boyunca bakarak.

- **Oynat** ya da {{key:Space}} seçtiğiniz hızda sürer (10 ila 65 mph, ya da 15 ila 100 km/sa); {{key:Space}} yeniden duraklatır. Sonunda durur; **Oynat** o zaman baştan başlar.
- Kaydırıcı herhangi bir istasyona atlar; {{key:Left}} ve {{key:Right}} 10 ft (5 m) geri ve ileri adım atar.
- Görünümde sürüklemek duraklatır ve etrafa bakmanızı sağlar.
- **Dur** ya da {{key:Esc}} görünümü önceki yerine geri koyar.

Dikey abartma sürerken de geçerlidir: yolu olacağı gibi görmek için 1×'e ayarlayın.

## Güneş ışığı

3B çubuktaki **Güneş**'i açın ve **Güneş ışığı**'nı işaretleyin. Bir tarih, saat ve saat dilimi (UTC'den fark: yazın, yaz saati uygulamasındaki) ve sahanın enlem ve boylamını verin. Proje bir koordinat sistemine sahipse bunlar ondan doldurulur.

Saha o zaman güneşin bulunduğu yerden aydınlatılır; arazi, koridor ve platformlar üzerinde **Gölgeler** ile. Menü güneşin azimutunu ve yüksekliğini ya da ufkun altında olduğunu söyler. Konumlar NOAA'nın güneş denklemlerinden gelir. Gölgeler her abartmada doğru yöne düşer, ama sahanın kenarında biterler: ötesindeki tepeler ve binalar gölge yapmaz.

## 3B görünümü dışa aktarın

Çubuktaki {{ui:GLB}} ya da {{ui:OBJ}}'ye tıklayın. Görünümün gösterdiği şey, gerçek ölçekte (abartma yok), metre cinsinden, Y yukarı olacak şekilde kaydedilir. Ayrıntılar: [Sahayı 3B dışa aktarın](topic:export-3d).
