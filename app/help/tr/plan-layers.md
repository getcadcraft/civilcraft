---
title: Plan katmanları
summary: CivilCraft'ın ekranda, DXF'te ve PDF'te kullandığı sabit katman adları, renkleri ve çizgi kalınlıkları ile her birini denetleyen görüntüleme ayarı.
keywords: katmanlar, katman adları, ncs, renkler, aci, çizgi kalınlıkları, dxf katmanları, pdf, görüntüleme ayarları, çizgi çalışması
from: c2aa8475
---

Planın her öğesi bir katmana aittir. Adlar, yaygın inşaat katman düzenini izler (disiplin, ana grup, alt grup). Bu sürümde katmanlar sabittir: adlarını değiştiremez, renklerini değiştiremez ya da kendi katmanlarınızı ekleyemezsiniz. DXF'te her katmanın gösterilen renk numarası vardır; PDF'te {{ui:Katman renkleri}} seçiliyken aynı renkler kullanılır, {{ui:Siyah}} seçiliyken ise her şey siyah basılır.

| Katman | İçerik | Renk (DXF numarası) | Ne zaman gösterilir |
|---|---|---|---|
| C-TOPO-MINR | Ara konturlar | Gri (8) | {{ui:Konturlar}} |
| C-TOPO-MAJR | Ana konturlar | Beyaz veya siyah (7) | {{ui:Konturlar}} |
| C-TOPO-TEXT | Kontur etiketleri | Beyaz veya siyah (7) | {{ui:Konturlar}} ve {{ui:Kontur etiketleri}} |
| C-TOPO-TINN | Üçgen kenarları | Gri (8) | {{ui:Üçgenler}} |
| C-TOPO-BRKL | Kırılma çizgileri ve sınır | Turuncu (30) | {{ui:Kırılma çizgileri}} |
| C-TOPO-BNDY | Yüzey kenarı | Beyaz veya siyah (7) | {{ui:Yüzey kenarı}} |
| C-TOPO-SLOP | Şev okları | Camgöbeği (4) | {{ui:Şev okları}} |
| V-NODE | Ölçme noktaları | Yeşil (3) | {{ui:Noktalar}} |
| V-NODE-TEXT | Nokta etiketleri: numara, kot, tanım | Yeşil (3) | {{ui:Noktalar}} ve {{ui:Nokta etiketleri}} |
| V-NODE-LINE | Nokta kodlarından çizgiler (kırılma çizgisi olmayan gruplar) | Yeşil (3) | {{ui:Noktalar}} |
| C-ROAD-CNTR | Eksen orta çizgileri | Kırmızı (1) | Her zaman |
| C-ROAD-STAN | İstasyon çizgileri ve etiketleri, PC ve PT | Kırmızı (1) | Her zaman |
| C-ROAD-CORR | Koridor kenarları | Sarı (2) | Her zaman |
| C-ROAD-SCTN | Örnek çizgileri (kesitlerin alındığı yerler) | Gri (8) | Eksende örnek çizgileri varsa |
| C-GRAD-PADS | Platform çevreleri | Mavi (5) | Her zaman |
| C-GRAD-DAYL | Yarma-dolgu sınırları | Macenta (6) | Her zaman |
| C-GRAD-SLOP | Tesviye şev çizgileri | Macenta (6) | Her zaman |
| C-GRAD-FEAT | Özellik çizgileri (3B) | Yeşil (3) | Her zaman |
| C-ROAD-SWPT | Süpürme yolları: çevre, en dış tekerlek izleri, ad | Turuncu (30) | Her zaman |
| C-STRM-PIPE | Borular | Mavi (5) | {{ui:Borular}} |
| C-STRM-STRC | Yapılar | Mavi (5) | {{ui:Borular}} |
| C-STRM-TEXT | Boru ve yapı etiketleri | Mavi (5) | {{ui:Borular}} |
| C-STRM-PROB | Sorunlu borular ve yapılar | Kırmızı (1) | {{ui:Borular}} |

Kırılma çizgileri yalnızca **Görüntüleme** altındaki **Yüzey** {{ui:Mevcut zemin}} olduğunda çizilir; sınır ise her iki yüzeyle de çizilir.

## PDF'te çizgi kalınlıkları

| Kalınlık | Katmanlar |
|---|---|
| 0.50 mm | Eksen orta çizgileri, platformlar, borular, sorunlu borular |
| 0.35 mm | Ana konturlar, yarma-dolgu sınırları, yapılar |
| 0.25 mm | Kırılma çizgileri |
| 0.13 mm | Ara konturlar |
| 0.09 mm | Üçgen kenarları, tesviye şev çizgileri |
| 0.18 mm | Diğer her şey |

DXF dosyalarında çizgi kalınlığı bulunmaz; bunları CAD programınızda katmana göre ayarlayın.

## Etiket boyutları

Etiketler kâğıtta boyutlandırılır: kontur etiketleri 2.0 mm, istasyon etiketleri 1.8 mm, PC ve PT etiketleri ile boru ve yapı etiketleri 1.6 mm, nokta etiketleri 1.5 mm. Boru etiketleri ad, çap ve eğimi; yapı etiketleri ise ad ve kapak kotunu gösterir. Ekranda yakınlaştırdığınızda boyutları aynı kalır. DXF'te etiketler, dışa aktarma iletisinde belirtilen ölçeğe göre ölçeklenir; bkz. [Planı DXF olarak dışa aktarma](topic:dxf-export).

## Hiçbir katmanda gösterilmeyenler

Kot bantları yalnızca ekranda, çizgi çalışmasının altında çizilir. Boy kesiti görünümü plana dahil değildir.
