---
title: Kot eğrilerini, kotları ve şevleri okuyun
summary: Kontur aralığını ve ana konturları belirleyin, kot bantlarını, şev oklarını ve üçgenleri gösterin, imlecin altındaki zemin kotlarını okuyun.
keywords: kontur, kontur aralığı, ana konturlar, etiketler, kot bantları, şev okları, üçgenler, nokta kotu, yüzey analizi, kot analizi, şev analizi
from: 585e500a
---

Yüzey var olur olmaz konturlarla gösterilir. Bu konudaki her şey sol paneldeki **Görüntü** altında ayarlanır. Görüntü ayarları yalnızca gördüğünüzü (ve dışa aktardığınızı) değiştirir; geri alma adımı değildir.

## Kontur aralığını belirtin

1. **Görüntü** altında **Kontur aralığı** alanında bir değer seçin.
   - Fit cinsinden: 0.25, 0.5, 1, 2, 5, 10 veya 20 ft.
   - Metre cinsinden: 0.1, 0.25, 0.5, 1, 2, 5 veya 10 m.
2. **Ana kontur aralığı** seçin: 2., 4., 5. veya 10. kontur.
   Ana konturlar daha kalın çizilir ve kotlarıyla etiketlenir. Ana aralığın tam katlarına düşerler (1 ft konturlar ve her 5. ana kontur ile: 245, 250, 255 …).
3. Etiketler küçük bir çizime sığmıyorsa {{ui:Kontur etiketleri}} seçeneğini kapatın.

Yeni bir proje 1 birimle başlar ve her 5. kontur ana kontur olur. Konturlar kırılma çizgilerinde bükülür; bir akış çizgisini veya sırtı düz olarak kesiyorlarsa, o çizgi henüz kırılma çizgisi değildir (bkz. [Yüzeyi oluşturun ve iyileştirin](topic:build-surface)).

:::note
Konturlar yalnızca en düşük ve en yüksek nokta arasında en fazla 2.000 seviye olduğunda çizilir. Yükseltisi çok olan ve aralığı çok küçük bir sahada plan hiç kontur göstermez: daha büyük bir aralık seçin.
:::

## Konturları yumuşatın

Konturlar, yüzeyin her üçgeni boyunca tek bir düz parça olarak izlenir; bu yüzden her üçgen kenarında küçük bir köşe yapar. **Görüntü** altındaki **Kontur yumuşatma** bu köşeleri yuvarlar:

- **Yok (düz parçalar)**: izlenen çizgiler olduğu gibi. Yeni veya eski bir çizimin gösterdiği budur.
- **Hafif**: köşeler biraz yuvarlanır. Bir çizgi, bir sonraki konture doğru yolunun %10'undan fazla hareket etmez ve düz parçasından o parçanın uzunluğunun altıda birinden fazla uzaklaşmaz.
- **Güçlü**: akıcı bir eğri. Bir çizgi, bir sonraki konture doğru yolunun %25'inden fazla hareket etmez ve düz parçasından o parçanın uzunluğunun üçte birinden fazla uzaklaşmaz.

İki seçenekte de yumuşatılmış bir kontur, izlenen konturla aynı noktada her üçgen kenarını kesmeye devam eder, geçtiği üçgenin içinde kalır ve bu yüzden başka bir konturu asla kesemez veya ona dokunamaz. Bir kontur kırılma çizgisini veya sınırı kestiğinde keskin köşesini korur. Çizilen ve dışa aktarılan çizgiler yumuşatılmış olanlardır (DXF, DWG, PDF, GIS ve 3D); izlenen çizgilerden daha fazla köşe noktasına sahiptirler.

Yumuşatma yalnızca çizilen çizgileri değiştirir. Kotlar, hacimler, profiller ve kesitler yine yüzeyin kendisinden okunur. Konturun tam olarak ölçü noktalarından geçtiği durumlarda (250 konturu üzerinde 250.00 kotlu bir nokta) her bu noktada küçük bir köşe kalır.

## Konturların arkasındaki yüzey nasıl oluşturulur

Konturlar yüzeyi izler ve yüzey, sol paneldeki **Yüzey** altındaki **Kontur yöntemi**ni izler. Varsayılan olan **Doğrusal enterpolasyonlu üçgenleme**, noktalarınızı üçgenlere birleştirir ve her noktayı ve kırılma çizgisini tam olarak korur. Diğer yöntemler önce noktalara düzenli bir ızgara uydurur (kriging, minimum eğrilik, doğal komşu, ters mesafe ve diğerleri); bu, noktalar arasında daha yuvarlak konturlar verir ama her noktadan tam olarak geçmez. **Yüzey** altındaki yüzey raporu, sonucun noktalarınızda ne kadar saptığını gösterir.

**ABOS (yumuşatmaya dayalı yaklaşım)**, ızgaralı yöntemlerden biridir. Kendine ait iki ayarı vardır: **Yumuşaklık** (başlangıç 0.5; düşük olan daha yumuşaktır) ve **Doğruluk** (başlangıç 1: yüzey, noktalarınızda sahanın yükseklik aralığının %1'i içine getirilir; daha yakın bir uyum için daha küçük bir sayı yazın). Yüzey ızgarası bu doğruluğa ulaşamazsa, yüzey raporu bunu söyler: daha küçük bir **Izgara aralığı** yazın.

## Herhangi bir noktadaki kotu okuyun

İmleci plan üzerinde gezdirin. Durum çubuğu şunları gösterir:

- İmlecin altındaki **E** ve **N**
- **Zemin** ve imlecin altındaki üçgende enterpole edilmiş mevcut zemin kotu
- **Tesviye** ve bir platform veya koridor zemini değiştirdiyse önerilen kot
- Yüzeyin dışındaysa "Yüzeyin dışında"

Bir ölçü noktasını tam olarak okumak için {{ui:Seç}} seçeneğini seçin ve noktaya tıklayın: sağ panel numarasını, doğu, kuzey, kot, tanımını ve grubunu gösterir.

## Kot bantlarını gösterin

1. {{ui:Kot bantları}} kutusunu işaretleyin.
   Yüzey düşükten (mavi-yeşil) yükseğe (ochre-kahverengi) renkle doldurulur. Onay kutularının altındaki gösterge her bandın kot aralığını listeler.
2. **Bantlar** alanında kaç bant olacağını seçin: 5, 8, 10 veya 12. Bantlar en düşük ile en yüksek kot arasındaki aralığı eşit adımlara böler.

Bantlar yalnızca görmek içindir. DXF'e aktarılmazlar ve PDF'e çizilmezler.

## Şev oklarını gösterin

{{ui:Şev okları}} kutusunu işaretleyin. Her üçgende, bir ok sığacak kadar büyük olduğunda kısa bir ok aşağı eğime bakar. Düz üçgenlerin oku yoktur. Oklar drenaj yönü için hızlı bir kontroldür; şev değeri henüz etiketlenmez.

## Üçgenleri, noktaları ve kenarları gösterin

- {{ui:Üçgenler}} TIN'in kenarlarını çizer. Yüzeyin noktaları nasıl bağladığını, özellikle kırılma çizgileri boyunca ve dış kenarda kontrol etmek için açın.
- {{ui:Noktalar}} her ölçü noktasını çizer; {{ui:Nokta etiketleri}} numarasını, kotunu ve tanımını ekler (ya da daha azını: bkz. [CivilCraft ayarları](topic:settings) içindeki **Nokta etiketleri**).
- {{ui:Kırılma çizgileri}} kırılma çizgilerini (ve sınırı) turuncu olarak çizer.
- {{ui:Yüzey kenarı}} yüzeyin dış hatlarını çizer.

## Mevcut veya önerilen

Bir platform veya koridor sorunsuz tesviye edildiğinde, **Görüntü** altındaki **Yüzey** {{ui:Önerilen (tesviye edilmiş)}} seçeneğini sunar. Konturlar, bantlar ve oklar o zaman tesviye edilmiş yüzeyi gösterir; böylece yeni zemini ve çevresindeki yarma-dolgu sınırını görebilirsiniz. Ölçümü görmek için {{ui:Mevcut zemin}} seçeneğine geri dönün.

## Ne dışa aktarılır

DXF ve PDF çıktısı bu ayarları izler: kapattığınız şeyler yazılmaz ve konturlar, gösterilen yüzeyin konturlarıdır. Kot bantları asla dışa aktarılmaz.
