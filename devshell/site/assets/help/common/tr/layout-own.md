---
title: Kendi düzeninizi oluşturun ve kurulumlarınızı kaydedin
summary: Proje tarayıcısını, Özellikler'i ya da panelin kendi içeriğini hangi panelin göstereceğini, araç kutusunun nereye gideceğini ve çubukların neleri tutacağını seçin, bunu kendi düzeniniz olarak kaydedin ve tüm kurulumları bir ad altında saklayıp aralarında geçiş yapın.
keywords: düzen, çalışma alanı, düzenle, özelleştir, düzenim, kendi düzenim, paneller, düzenleyiciler, proje tarayıcısı, özellikler, araç kutusu, hızlı çubuk, bilgi kutusu, çalışma ortamı, kurulum, profil, kurulumu kaydet, kurulum değiştir, kurulumu dışa aktar, kurulumu içe aktar, ccenv
from: 2a71af43
---

Üç yerleşik düzenin yanında kendinize ait bir düzen oluşturabilir ve tüm kurulumunuzu bir ad altında kaydedip tek adımda ona geri dönebilirsiniz.

## Kendi düzeninizi oluşturun

1. {{ui:Ayarlar}} penceresini açın (dişli simgesi ya da {{key:Mod+,}}), {{ui:Genel}} sekmesini seçin, ardından {{ui:Düzen}} bölümüne gidin.
2. {{ui:Kendi düzeninizi oluşturun…}} öğesini seçin. İletişim kutusu şu an kullandığınız düzenle başlar.
3. Ona bir ad verin, ardından seçin:
   - **Çizimin üstünde:** uygulamanın araç çubuğu, bir şerit ya da hiçbiri; bir başlık çubuğu; bir bilgi kutusu ve içinde hangi denetimlerin olacağı.
   - **Çizimin yanında:** solda, sağda ya da hiç araç kutusu, {{ui:Araçlarım}} ile ya da onsuz; paletleri hangi panelin tutacağı, hangisinin üstte olacağı (örneğin proje tarayıcısı ya da Özellikler) ve hangilerinin altında sekme olacağı.
   - **Çizim alanı:** görünüm sekmeleri, işaretlediğiniz denetimlerle bir hızlı çubuk ve bir görünüm çubuğu, düzenleme paleti, bir durum çubuğu.
   - **Görünüm:** boyut, düğme çerçeveleri ve sekme stili.
4. {{ui:Bu düzeni kullan}} öğesini seçin. Uygulama hemen ona geçer ve düzenleri olan her uygulama da onu kullanır.

Yalnızca bu uygulamada olanlar sunulur. Düzeniniz {{ui:Eklentilerden ve dosyalardan}} altında listelenir; {{ui:Bu düzeni dışa aktar}} onu bir iş arkadaşınıza verebileceğiniz bir dosya olarak kaydeder, kaldır düğmesi ise onu siler. Doldurduğu paneller yine yerleşir, yüzer ve [Panelleri düzenleyin](common:arrange-panels) konusundaki gibi kendi pencerelerine taşınır.

## Kurulumunuzu çalışma ortamı olarak kaydedin

Çalışma ortamı, bu tarayıcıdaki her uygulama için tüm kurulumunuzdur: düzen, menü stili ve tuşlarınız, araç çubuğu stili, paneller ve boyutları ile {{ui:Araçlarım}}. Tema ve dil buna dahil değildir.

- **Kaydet:** {{ui:Çalışma ortamları}} altına bir ad yazın ve {{ui:Kurulumumu kaydet}} öğesini seçin. Var olan bir adla kaydetmek o kurulumun yerine geçer.
- **Geçiş yap:** listeden bir kurulum seçin ve {{ui:Ona geç}} öğesini seçin. Uygulama o kurulumla yeniden yüklenir; kaydedilmemiş çalışmanız varsa uygulama, her yeniden yüklemede olduğu gibi önce sorar.
- **Paylaş:** {{ui:Dışa aktar}} seçili kurulumu bir `.ccenv.json` dosyası olarak kaydeder; {{ui:Kurulum içe aktar…}} bir dosyadan bir tane ekler. Bir dosya yalnızca bu seçimleri belirler, başka hiçbir şeyi değil.
- **Kaldır:** bir kurulum seçin ve {{ui:Kaldır}} öğesini seçin.

On ikiye kadar kurulum saklayabilirsiniz.

Önce yerleşik düzenleri denemek için bkz. [araç kutusu ve bilgi kutusu düzeni](common:layout-toolbox) ile [şerit ve proje tarayıcısı düzeni](common:layout-ribbon).
