---
title: Planı DXF olarak dışa aktarma
summary: Planın çizgilerini adlandırılmış katmanlarda R12 DXF olarak yazın; kot eğrileri kendi yüksekliklerinde, kırılma çizgileri 3B olarak, herhangi bir CAD programı için.
keywords: dxf, dwg, cad, dışa aktar, çizgi çalışması, r12, 2000, 2004, 2007, 2010, 2013, 2018, katmanlar, kot eğrileri, çizim değişimi, temel harita, arka plan
from: f2d8ede9
---

{{ui:DXF}} planın gösterdiğini R12 biçiminde bir DXF dosyası olarak yazar; bu, her CAD programının açtığı sürümdür. AutoCAD ya da Civil 3D kullandıysanız, dosyayı herhangi bir DXF gibi açın ya da ekleyin.

## Dışa aktarma

1. Planı çizim için istediğiniz gibi ayarlayın: **Görüntüleme** altında yüzeyi (mevcut ya da önerilen), kot eğrisi aralığını ve hangi öğelerin açık olacağını seçin (kot eğrileri, etiketler, noktalar, nokta etiketleri, üçgenler, kırılma çizgileri, yüzey kenarı, borular, eğim okları).
2. **Dışa aktar** grubundaki {{ui:DWG/DXF}} öğesine tıklayın, {{ui:DXF (R12, text) — the plain exchange file}} seçeneğini seçin, ardından {{ui:İndir}} düğmesine tıklayın.
3. Tarayıcı `<name>.dxf` dosyasını indirir. Durum çubuğu örneğin şunu yazar: "R12 DXF dışa aktarıldı: 2,140 nesne; etiketler 1" = 40' için boyutlandırıldı. Kot bantları dışa aktarılmaz."

Koordinatlar proje biriminizde, gerçek değerleriyle yazılır (state plane koordinatları olduğu gibi kalır). Hiçbir şey ölçeklenmez ya da taşınmaz.

## Dosyada neler var

| Öğe | DXF varlığı | Katman |
|---|---|---|
| Ara ve ana kot eğrileri | Yüksekliklerinde 2B çoklu çizgiler | C-TOPO-MINR, C-TOPO-MAJR |
| Kot eğrisi etiketleri | Metin | C-TOPO-TEXT |
| Üçgenler | Çoklu çizgiler | C-TOPO-TINN |
| Kırılma çizgileri ve sınır | 3B çoklu çizgiler | C-TOPO-BRKL |
| Yüzey kenarı | Çoklu çizgiler | C-TOPO-BNDY |
| Eğim okları | Çoklu çizgiler | C-TOPO-SLOP |
| Ölçü noktaları ve etiketleri | Noktalar (kotlu), metin | V-NODE, V-NODE-TEXT |
| Çizgi kodlarından çizgiler | 3B çoklu çizgiler | V-NODE-LINE |
| Eksen merkez çizgileri | Çizgiler ve yaylar | C-ROAD-CNTR |
| İstasyonlama işaretleri ve etiketleri | Çoklu çizgiler, metin | C-ROAD-STAN |
| Koridor kenarları | Çoklu çizgiler | C-ROAD-CORR |
| Örnek çizgileri | Çoklu çizgiler | C-ROAD-SCTN |
| Platformlar, yarma-dolgu sınırı çizgileri, eğim çizgileri | Çoklu çizgiler | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Özellik çizgileri | 3B çoklu çizgiler (yaylar 0.01 içinde parçalar olarak; bkz. [Özellik çizgileri](topic:feature-lines)) | C-GRAD-FEAT |
| Süpürme izleri | Çoklu çizgiler, metin | C-ROAD-SWPT |
| Borular, yapılar, etiketler | Çoklu çizgiler, metin | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Sorunlu borular ve yapılar | Çoklu çizgiler | C-STRM-PROB |

Her katmanın bir rengi vardır. Tam liste [Plan katmanları](topic:plan-layers) konusunda.

## Etiket boyutu

Metnin çizim biriminde bir boyutu olmalıdır. CivilCraft, tüm planın bir Tabloid sayfaya (fit) ya da A3 sayfaya (metre) sığdığı ölçek için etiketleri boyutlandırır ve hangi ölçek olduğunu durum mesajında belirtir. CAD programınızda başka bir ölçekte çıktı alıyorsanız, metni orada ölçeklendirin.

## Dışa aktarılmayanlar

- Kot bantları (yalnızca ekranda).
- Boy kesiti görünümü. Profiller bir çizim olarak değil, LandXML olarak dışa aktarılır.
- Yüzeyin kendisi 3B nesne olarak. TIN için LandXML kullanın ya da {{ui:Üçgenler}} seçeneğini açarak kenarlarını çizgi olarak alın.
- **Görüntüleme** altında kapattığınız her şey.

## DWG

{{ui:DWG/DXF}} aynı çizgi işlerini bir DWG çizimi olarak da yazar. İletişim kutusu biçimi sorar: DXF ya da 2000, 2004, 2007, 2010, 2013 veya 2018 DWG. 2000, eski ve yeni neredeyse her CAD programında açılır; çizimi alan kişi istediğinde daha yeni bir sürüm seçin. Seçiminiz bu tarayıcıda hatırlanır.

1. **Dışa aktar** grubundaki {{ui:DWG}} öğesine tıklayın.
2. **Biçim**i seçin ve **DWG indir** düğmesine tıklayın.
3. Tarayıcı `<name>.dwg` dosyasını indirir. Durum çubuğu neyin eklendiğini belirtir, örneğin "DWG dışa aktarıldı (2018 biçimi): 12 çoklu çizgi, 9 katmanda 40 etiket".

DWG çizimi, DXF ile aynı katmanlara, renklere, kot eğrilerine (yüksekliklerinde çoklu çizgi olarak), 3B kırılma çizgilerine, etiketlere ve noktalara, aynı koordinatlarda sahiptir. DWG'nin tutamayacağı katman adları değiştirilir ve durum mesajı bunu belirtir. CivilCraft DWG'yi kendi kodu ile yazar; bu yüzden hiçbir şey bilgisayarınızdan çıkmaz.

### DWG'deki harita katmanları

Bir DWG çizimi içinde resim tutamaz: CAD programları çizimin yanında duran bir resim gösterir. Harita katmanları görünürken iletişim kutusu **Çizimin yanında resim olarak harita katmanları** seçeneğini sunar. Bu işaretliyken indirme, `<name>.dwg`, `<name>-map.png` (tüm çizimin üzerindeki harita katmanları, en fazla 4,096 piksel genişlikte) ve `<name>-map.pgw` (GIS programları için dünya dosyası) dosyalarını içeren bir `.zip` olur. Çizim, resmi G-MAP-IMAG katmanında, yerinde bir görüntü olarak gösterir. Dosyaları Zip'ten çıkarıp tek bir klasörde birlikte tutun.
