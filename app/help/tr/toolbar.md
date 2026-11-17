---
title: Araç çubuğu başvurusu
summary: CivilCraft'taki her araç çubuğu düğmesi, ne yaptığı, tuşu ve ne zaman soluk görünüp reddettiği.
keywords: araç çubuğu, düğmeler, komutlar, araçlar, dosya, dışa aktar, yüzey, tasarım, düzenle, görünüm, menü
from: 4c4352bc
---

Araç çubuğu, uygulamanın üstünde yedi grup halinde uzanır. Her düğme, üzerine gelindiğinde ipucunu ve tuşunu gösterir.

## Dosya

| Düğme | Tuş | Ne yapar |
|---|---|---|
| {{ui:Yeni}} | yok | Boş bir proje başlatır. Kaydedilmemiş değişiklikler varsa önce sorar. |
| {{ui:Aç}} | {{key:Mod+O}} | Bir nokta dosyası (CSV, TXT), LandXML veya bir CivilCraft projesi açar. |
| {{ui:Kaydet}} | {{key:Mod+S}} | Projeyi `<name>.civilcraft.json` olarak indirir. |

## Dışa aktar

| Düğme | Tuş | Ne yapar |
|---|---|---|
| {{ui:LandXML}} | yok | Projeyi `<name>.xml` olarak indirir: noktalar, yüzeyler, eksenler, boy kesitleri ve boru ağı LandXML 1.2 olarak. Proje boşken "Henüz dışa aktarılacak bir şey yok." yazar. |
| {{ui:DXF}} | yok | Planın çizgi işini R12 DXF olarak `<name>.dxf` indirir. |
| {{ui:PDF}} | {{key:Mod+P}} | **Planı PDF'e çıktı al** iletişim kutusunu açar. Proje boşken "Henüz çıktı alınacak bir şey yok." yazar. |

## Yüzey

| Düğme | Tuş | Ne yapar |
|---|---|---|
| {{ui:Kırılma çizgisi}} | {{key:B}} | Noktalara sırayla tıklayın; bitirmek için {{key:Enter}}. Kırılma çizgisi, noktaların kotlarını alır. |
| {{ui:Sınır}} | {{key:O}} | Dış sınırın köşelerine tıklayın; bitirmek için {{key:Enter}}. Mevcut sınırın yerini alır. |

İkisi de yüzey yokken "Henüz bir yüzey yok: önce nokta dosyalarını açın." yazar.

## Tasarım

| Düğme | Tuş | Ne yapar |
|---|---|---|
| {{ui:Eksen}} | {{key:A}} | PI'lara sırayla tıklayın; bitirmek için {{key:Enter}}. |
| {{ui:Platform}} | {{key:G}} | Platformun köşelerine tıklayın; bitirmek için {{key:Enter}}. Yüzey araçları gibi, yüzey yoksa uyarır; bir platform yalnızca bir yüzey üzerinde tesviye edilir. |
| {{ui:Borular}} | {{key:P}} | Yapıları yukarı akıştan aşağıya doğru tıklayın (var olan birine tıklayarak ona katılın); bitirmek için {{key:Enter}}. |
| {{ui:Boy kesiti}} | {{key:R}} | Planın altındaki boy kesiti görünümünü gösterir veya gizler. |

## Düzenle

| Düğme | Tuş | Ne yapar |
|---|---|---|
| {{ui:Geri al}} | {{key:Mod+Z}} | Son değişikliği geri alır (200'e kadar). Geri alınacak bir şey yokken soluk görünür. |
| {{ui:Yinele}} | {{key:Mod+Y}} | Geri alınanı yineler. Yinelenecek bir şey yokken soluk görünür. |
| {{ui:Kopyala}} | {{key:Mod+C}} | Seçili noktaları kopyalar ve bunları elektronik tablonun alabileceği nokta satırları olarak panoya koyar. Noktalar seçilene kadar soluk görünür. |
| {{ui:Yapıştır}} | {{key:Mod+V}} | Noktaları yapıştırır: imleci izlerler ve bir tıklamayla, başka hiçbir noktada olmayan numaralarla yerleştirilirler. Bir elektronik tabloda kopyalanan nokta satırları da yapıştırılır. |
| {{ui:Daha fazla}} | yok | Aşağıdaki menüyü açar. |

{{ui:Daha fazla}} menüsü:

| Öğe | Tuş | Ne yapar |
|---|---|---|
| {{ui:Kes}} | {{key:Mod+X}} | Seçili noktaları kopyalar ve siler (tek bir geri alma adımı). |
| {{ui:Kopyala}} | {{key:Mod+C}} | {{ui:Kopyala}} düğmesi gibi. |
| {{ui:Yapıştır}} | {{key:Mod+V}} | {{ui:Yapıştır}} düğmesi gibi. |
| {{ui:Olduğu yere yapıştır}} | {{key:Mod+Shift+V}} | Noktaları kendi koordinatlarında yapıştırır; başka hiçbir noktada olmayan numaralarla. |
| {{ui:Çoğalt}} | {{key:Mod+D}} | Seçili noktaların bir kopyası imleci izler; gideceği yere tıklayın. Pano olduğu gibi kalır. |
| {{ui:Sil}} | {{key:Delete}} | Seçili noktaları ya da seçili ekseni, platformu, yapıyı (boruları ile birlikte), boruyu veya PVI'ı siler. |
| {{ui:Tüm noktaları seç}} | {{key:Mod+A}} | Her noktayı seçer. |
| {{ui:Seçimi kaldır}} | {{key:Esc}} | Seçimi temizler. |

Şu anda işlem yapamayan bir öğe soluk görünür ve ipucu nedenini söyler. Ayrıntılar: [Noktaları seçme, kopyalama ve yapıştırma](topic:copy-paste-points).

Geri al; tasarımdaki, yüzey ayarlarındaki ve noktalardaki düzenlemeleri kapsar (yapıştırma, kesme, çoğaltma, silme). Görüntüleme ayarlarını kapsamaz ve herhangi bir dosyayı açmak veya içe aktarmak onu temizler.

## GIS

| Düğme | Tuş | Ne yapar |
|---|---|---|
| {{ui:Koordinatlar}} | yok | **Koordinat sistemi** iletişim kutusunu açar: projenin hangi sistemde olduğunu belirtin ya da zemin veya yerel koordinatları kullanın. Bkz. [Projenin koordinat sistemini ayarlama](topic:coordinate-systems) ve [Zemin ve yerel koordinatlar](topic:ground-and-local-coordinates). |
| {{ui:İçe aktar}} | yok | GIS verisini içe aktarır: shapefile'lar, GeoJSON, GeoPackage, yükseklik ızgaraları ve LiDAR. Bkz. [GIS verisini içe aktarma](topic:gis-import). |
| {{ui:Dışa aktar}} | yok | Bir GIS birimi için yapım sonrası (as-built) verisini dışa aktarır. Bkz. [GIS için yapım sonrası verisini dışa aktarma](topic:gis-export). |
| {{ui:Çözümle}} | yok | GIS çözümleme panelini açar: tampon, bindirme, mekânsal birleştirme, özniteliğe göre seçme, ölçme. Bkz. [GIS katmanlarını çözümleme](topic:gis-analysis). |
| {{ui:Öznitelik tablosu}} | yok | Yüzey › Daha fazla içinde. Bir GIS katmanının öznitelik tablosunu açar: sırala, filtrele, seç, düzenle, alan ekle, hesapla, CSV olarak kaydet. Bkz. [Bir katmanın öznitelik tablosuyla çalışma](topic:gis-table). |
| {{ui:Harita}} | yok | **Harita katmanları** iletişim kutusunu açar: koordinatlı bir resim veya eklediğiniz harita sunucuları, plan altında çizilir. Bkz. [Plan altında harita katmanlarını gösterme](topic:map-layers). |

GIS araçları, bu düğmelerden birini ilk kez kullandığınızda, bir GIS dosyası açtığınızda ya da bir koordinat sistemi veya GIS katmanı olan bir proje açtığınızda yüklenir.

## Görünüm

| Düğme | Tuş | Ne yapar |
|---|---|---|
| {{ui:Seç}} | {{key:V}} veya {{key:Esc}} | Eksenleri, platformları, yapıları, boruları ve noktaları seçmek için tıklayın ({{key:Shift}} ile bir tıklama veya sürükleme noktalar ekler); PI'ları, platform köşelerini ve yapıları taşımak için tutamaçları sürükleyin. |
| {{ui:Sığdır}} | {{key:F}} | Planı yüzeyi, noktaları, eksenleri ve platformları gösterecek şekilde yakınlaştırır (3B görünümde: her şeyi gösterir). |
| {{ui:3B}} | {{key:D}} | Sahayı planın üzerinde 3B olarak gösterir veya plana geri döner. 3B görünümün üstündeki çubuk görünümü, abartmayı, renklendirmeyi ve neyin gösterileceğini ayarlar ve GLB veya OBJ dışa aktarır. Bkz. [Sahayı 3B'de görüntüleme](topic:site-3d). |

## Panellerdeki düğmeler

| Düğme | Yer | Ne yapar |
|---|---|---|
| {{ui:Örnek sahayı aç}} | Boş planın üzerindeki kutu | Örnek ölçüyü yükler (bağlantı gerekir; CivilCraft çevrimdışı kullanım için kaydedilmişse gerekmez) |
| {{ui:Sınırı kaldır}} | Sol panel, Yüzey | Dış sınırı kaldırır |
| {{ui:Çizilmiş kırılma çizgilerini kaldır}} | Sol panel, Yüzey | Araçla çizilmiş her kırılma çizgisini kaldırır (kırılma çizgisi gruplarını değil) |
| {{ui:Yüzeyi noktalardan yeniden oluştur}} | Sol panel, Yüzey (yalnızca LandXML yüzeyi) | LandXML TIN'ini bırakır ve noktalardan oluşturur; geri alınamaz |
| {{ui:Zeminden başlat}} | Sağ panel, Eksen | Her iki uçta zeminde bir PVI ile bir tasarım boy kesiti başlatır |
| {{ui:Boy kesiti görünümü}} | Sağ panel, Eksen | Bu eksen için boy kesiti görünümünü açar |
| {{ui:PVI ekle}} | Boy kesiti çubuğu | Basılıyken, boy kesitinde bir tıklama bir PVI ekler |
| {{ui:Tüm bağlantı kotlarını kurallara göre ayarla}} | Sağ panel, Boru ağı | Her borunun bağlantı kotlarını kurallara göre ayarlar |
| {{ui:Bağlantı kotlarını kurallara göre ayarla}} | Sağ panel, Boru | Bu borunun bağlantı kotlarını kurallara göre ayarlar |
