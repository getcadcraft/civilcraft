---
title: Yüzeyi oluşturma ve düzeltme
summary: CivilCraft mevcut zemini nasıl üçgenlere böler ve yüzeyi kırılma çizgisi grupları, çizilmiş kırılma çizgileri, dış sınır ve en uzun dış kenar ile nasıl şekillendirirsiniz.
keywords: tin, yüzey, üçgenleme, kırılma çizgisi, sınır, mevcut zemin, eg, yüzey oluştur, delaunay, üçgenler, en büyük kenar, dış sınır
from: b9eea3f3
---

CivilCraft proje başına bir mevcut zemin yüzeyine sahiptir. Noktalarınızdan oluşturulan bir TIN (düzensiz üçgen ağı) yüzeydir ve her girdi değiştiğinde kendiliğinden yeniden oluşur. "Yeniden oluştur" komutu yoktur ve güncelliğini yitirmiş bir yüzey diye bir şey yoktur.

## Yüzeye giren şeyler

- **{{ui:Points}}** olarak ayarlanmış bir gruptaki kotu olan her nokta.
- **{{ui:Breakline}}** olarak ayarlanmış her grup, nokta numarası sırasıyla birleştirilir.
- {{ui:Breakline}} aracıyla çizdiğiniz her kırılma çizgisi.
- Çizdiyseniz dış sınır.
- **En uzun dış kenar** ayarı.

Üçgenler hiçbir zaman bir kırılma çizgisini kesmez: yüzey onu izlemeye zorlanır, sonra çevresinde mümkün olduğunca düzgün yapılır (diğer her yerde Delaunay).

## Kodlu çizgileri kırılma çizgilerine dönüştürün

1. Sol panelde **{{ui:Points}}** altında grubu bulun (örneğin FL).
2. Onun **Yüzey** seçeneğini {{ui:Breakline}} olarak ayarlayın.
   Yüzey yeniden oluşur, çizgi turuncu çizilir ({{ui:Breaklines}} **Görüntü** altında açıkken) ve yüzey bilgilerindeki **Kırılma çizgileri** bir artar.
3. Çizgiyi planda kontrol edin. Çizgi, ölçüldüğü sırayla nokta nokta gitmelidir. Zikzak yapıyorsa grupta birden çok çizgi var ya da noktalar sıraya göre numaralanmamış: grubu {{ui:Points}} olarak geri alın ve çizgileri elle çizin (sonraki bölüm).

## Noktalardan bir kırılma çizgisi çizin

1. {{key:B}} tuşuna basın ya da **Yüzey** grubunda {{ui:Breakline}} düğmesine tıklayın.
   İpucu şöyle der: "Kırılma çizgisi: arazi noktalarına sırayla tıklayın (kotlarını alır). Enter bitirir."
2. İmleci bir noktanın yakınına getirin. Küçük turuncu bir kare alacağı noktayı işaretler.
3. Çizginin noktalarına art arda tıklayın. Her tıklama noktayı ve kotunu durum çubuğunda gösterir.
4. Bitirmek için {{key:Enter}} tuşuna basın.
   Durum çubuğu "Kırılma çizgisi 1 eklendi; yüzey yeniden oluşturuldu." der.

Tıklamalar kotu olan bir arazi noktasının üzerine düşmelidir; başka bir yere tıklamak "Kotu olan bir arazi noktasına tıklayın: bir kırılma çizgisi noktaların kotlarını alır." uyarısıyla reddedilir. {{key:Backspace}} son noktayı düşürür; {{key:Esc}} tüm çizgiyi iptal eder.

:::warning
{{key:Enter}} ile bitirin. Çift tıklama da bitirir, ama bu sürümde çift tıkladığınız noktayı düşürür. Son noktaya bir kez tıklayın, sonra {{key:Enter}} tuşuna basın.
:::

Çizilmiş tüm kırılma çizgilerini bir kerede silmek için **Yüzey** bölümündeki {{ui:Remove drawn breaklines}} düğmesine tıklayın. Yalnızca sonuncusunu kaldırmak için {{key:Mod+Z}} kullanın. Çizilmiş kırılma çizgileri henüz tek tek seçilip düzenlenemez.

## Dış sınırı çizin

Bir sınır yüzeyi, güvendiğiniz alana kırpar (örneğin arazi sınırları); böylece ölçülmemiş köşeler boyunca uzanan uzun üçgenler kalkar.

1. {{key:O}} tuşuna basın ya da {{ui:Boundary}} düğmesine tıklayın.
2. Alanın etrafında köşeleri sırayla tıklayın. Kesikli bir çizgi şekli gösterir.
3. {{key:Enter}} tuşuna basın.
   Durum çubuğu "Sınır belirlendi; sınırın dışındaki üçgenler kaldırıldı." der. Yüzey bilgilerindeki **Sınır** "Evet" ve köşe sayısını gösterir.

Bilmeniz gerekenler:

- Tek bir sınır vardır. Yenisini çizmek eskisinin yerine geçer. {{ui:Remove the boundary}} onu kaldırır.
- Yalnızca kırpabilir: noktaların ötesine uzanan bir sınır, noktaların dış hattına geri kesilir ve "Sınır noktaların ötesine uzanıyor; noktaların dış hattına kesildi." notu verilir.
- Köşeleri kotlarını yüzeyden alır; böylece kenar zemini tam olarak izler.
- İç sınırlar henüz yapılmadı.

## Dış üçgenleri kırpın

Sınır yoksa yüzey, noktaların tüm dış hattını doldurur; içbükey kenarlar boyunca uzun, ince üçgenler de dahil.

1. **Yüzey** bölümünde **En uzun dış kenar** değerini yazın ve {{key:Enter}} tuşuna basın. Tipik ölçüm aralığınızın iki üç katıyla başlayın.
2. Dış kenarı bu uzunluktan uzun olan dış üçgenler kaldırılır; her dış kenar yeterince kısa olana kadar içeri doğru ilerlenir. Kırılma çizgisi olan bir kenar hiçbir zaman soyulmaz.
3. Tüm üçgenleri yeniden tutmak için 0 yazın.

## Yüzey raporunu okuyun

Yüzey bilgilerinin altında, oluşturucunun ne yaptığını listeleyen bir kutu vardır. Solunda kahverengimsi sarı bir çubukla bilgi verir; kırmızı bir çubukla hata içerir ve yüzey yoktur.

| Mesaj | Anlamı |
|---|---|
| "3 nokta, başka bir noktayla aynı yerdeydi ve ona katıldı." | Planda 0.0001'den daha yakın noktalar tek bir köşe oldu (ilki korunur). |
| "2 yerde iki farklı kot var …" | Üst üste olan noktalar ya da kesişen kırılma çizgileri yükseklikte uyuşmuyor. Kırılma çizgisinin kotu kazanır, sonra ilki. |
| "1 kırılma çizgisi parçası yüzeye zorlanamadı." | Çok kısa ya da neredeyse üst üste binen bir kırılma çizgisi parçası sığmadı; o yeri kontrol edin. |
| "Bir yüzey, kotu olan en az üç noktaya ihtiyaç duyar." | Çok az nokta: sütun sırasını ve grupları kontrol edin. |
| "Noktaların hepsi tek bir çizgide: üçgen yok." | Noktaların genişliği yok; örneğin tek bir poligon çizgisi. |
| "Sınır noktalarla örtüşmüyor." | Sınır başka bir yerde; genellikle birim ya da koordinat karışıklığı. |
| "Sınırın içinde hiç üçgen kalmadı." | Sınır çok küçük ya da yanlış yerde. |

## LandXML'den okunan yüzey

LandXML açtığınızda, dosyanın ilk TIN yüzeyi olduğu gibi kullanılır: **Yüzey** başlığı "Yüzey (LandXML'den)" der ve **En uzun dış kenar** soluk görünür. Bu yüzey kullanımdayken kırılma çizgisi grupları, çizilmiş kırılma çizgileri ve yeni bir sınır onu değiştirmez. Yüzeyi dosyanın noktalarından oluşturmak için {{ui:Rebuild the surface from the points}} düğmesine tıklayın. {{key:Mod+Z}} LandXML yüzeyini geri getirir.

## İlgili

- [Kontur, kot ve eğimleri okuyun](topic:contours).
- [Arazi noktalarını içe aktarın](topic:import-points).
