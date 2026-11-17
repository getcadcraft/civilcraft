---
title: Kot eğrisi çizgilerinden arazi
summary: Bir kot haritasından zemin yüzeyini oluşturun: çizgi katmanlarını seçin, her çizginin kotunun nereden geldiğini belirtin, kesişimleri ve yinelenenleri denetleyin ve oluşturun. Kot eğrileri kırılma çizgisi olur; sırt, vadi ve tepelerdeki düz üçgenler düzeltilir. Bir resimden veya PDF'den izlenmiş bir harita, iki bilinen noktayla ölçeklenip yerleştirilebilir.
keywords: kot eğrileri, kontur, kot eğrilerinden arazi, kot eğrilerinden yüzey, topografik harita, ölçü haritası, koordinatsız, kırılma çizgileri, düz üçgenler, sırt, vadi, tepe, kesişen kot eğrileri, yinelenen kot eğrileri, kot aralığı, haritayı ölçekleme, iki nokta, haritayı yerleştirme, DXF, DWG, shapefile
from: e6161653
---

Bir ölçü uzmanı bazen bir kot haritası gönderir: kotları olan çizgiler, ama nokta yok. CivilCraft, mevcut zemini bu çizgilerden oluşturur.

## Kot eğrilerini içe alma

Haritayı çizgi işi olarak açın: bir DXF veya DWG çizimi, bir shapefile veya GeoJSON (**GIS** › {{ui:İçe aktar}}, ya da dosyayı plana sürükleyin). Çizgiler **harita katmanları** olarak içeri girer. **Yüzey** › {{ui:Daha fazla}} altında {{ui:Kot eğrilerinden arazi}} seçin.

## Her kotun nereden geldiğini belirtme

Kot eğrileri içeren katmanları işaretleyin, ardından **Kot kaynağı**nı seçin:

- {{ui:Çizgilerin kendi kotları}}: tüm köşe noktaları aynı kota sahip bir çizgi (3B çoklu çizgi veya kotu olan bir çoklu çizgi). 0'daki bir çizgi plan çizgisidir ve bir kotu yoktur.
- Haritayla birlikte bir tane geldiyse, katmanın bir **sayı alanı** (örneğin ELEV).
- {{ui:Çizgilerin listelendiği sırayla bir başlangıç ve bir aralık}}: hiç kotu olmayan çizgiler için. Listelenen ilk çizgi **İlk çizginin kotu**nu alır, sonraki çizgi bu artı **Kot eğrisi aralığı**nı alır ve böyle devam eder. Çizgileri en alttan yukarı doğru listeleyin (ya da katmanda yeniden sıralayın).

## Denetle, sonra oluştur

{{ui:Denetle}}, bir şey değişmeden önce neyin yanlış olduğunu sözcüklerle listeler:

- **kotu olmayan** veya iki noktadan az noktası olan bir çizgi;
- bir **yinelenen** çizgi (aynı şekil iki kez, ters yönde çizilmiş olsa bile);
- **kesişen** iki çizgi, farklı kotlarda ya da aynı kotta (kendi kendini kesen bir çizgi de dahil), yeriyle birlikte;
- **aralığa uymayan** bir kot (1 m'lik bir haritada 105.5 gibi bir yazım hatası).

Çoğu diğerini kesen çizgiyi düşürmek için {{ui:Başka bir çizgiyi kesen çizgileri dışarıda bırak}} seçeneğini işaretleyin (sonra bir sonraki, hiçbiri kesişmeyene kadar): her kot eğrisini kesen başıboş bir çizgi gider, kot eğrileri değil. **Çizgileri şu mesafe içinde sadeleştir**, düz bir çizgiye bu mesafeden daha yakın olan köşe noktalarını inceltir.

{{ui:Zemini oluştur}}, çizgileri mevcut zemine kırılma çizgisi olarak ekler (tek bir geri alma adımı); böylece yüzey her kot eğrisinden tam olarak geçer. {{ui:Sırtlarda, vadilerde ve tepelerde düz üçgenleri düzelt}} işaretli ve bir aralık verildiğinde, CivilCraft ayrıca her düz üçgenin (köşeleri tümü tek bir kot eğrisi üzerinde olan bir üçgen) içine, yanındaki eğimin devam ettiği yükseklikte bir nokta ekler; bu nokta asla kot eğrisinden yarım aralıktan fazla uzakta olmaz. Bu olmadan sırt tepeleri, vadi dipleri ve tepeler düz levhalar olarak çıkar. Bir test tepesinde gerçek yüzeye göre hata dörtte bir azaldı; bir sırtta %40 azaldı.

## Koordinatı olmayan bir harita

Bir resimden veya PDF'den izlenmiş bir kot haritası için **Katmanları iki bilinen noktayla ölçekle ve yerleştir**'i açın. Haritadaki iki noktayı ve bunların gerçekte nerede olduğunu verin; işaretli katmanlar ölçeklenir, döndürülür ve oturacak şekilde taşınır (tek bir geri alma adımı; yükseklikler değişmez). Aynı iki nokta, ölçeği (iletide gösterilir) ve dönüşü de verir.

Yüzey, harita kadar iyidir: iki kot eğrisi arasında bir düzlemdir, bu nedenle aralarındaki gerçek zemin bilinmez. Sonuca güvenmeden önce nokta kotlarıyla karşılaştırın.
