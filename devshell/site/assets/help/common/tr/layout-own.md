---
title: Kendi düzeninizi oluşturun ve kurulumlarınızı kaydedin
summary: Proje tarayıcısının, Özellikler'in ya da panelin kendi içeriğinin hangi panelde görüneceğini, araç kutusunun nereye geleceğini ve çubukların neleri tutacağını seçin; bunu kendi düzeniniz olarak kaydedin ve tüm kurulumları bir adla saklayıp aralarında tek adımda geçiş yapın.
keywords: düzen, çalışma alanı, düzenle, özelleştir, düzenim, kendi düzenim, paneller, düzenleyiciler, proje tarayıcısı, özellikler, araç kutusu, hızlı çubuk, bilgi kutusu, çalışma ortamı, kurulum, profil, kurulumu kaydet, kurulum değiştir, kurulumu dışa aktar, kurulumu içe aktar, ccenv
from: 6af528e0
---

Yerleşik üç düzenin yanında kendi düzeninizi de oluşturabilir, tüm kurulumunuzu bir adla kaydedip tek adımda ona geri dönebilirsiniz.

## Kendi düzeninizi oluşturun

1. {{ui:Ayarlar}} simgesini açın (dişli simgesi ya da {{key:Mod+,}}), {{ui:Genel}} seçin, sonra {{ui:Düzen}}.
2. {{ui:Kendi düzeninizi oluşturun…}} seçin. İletişim kutusu şu an kullandığınız düzenden başlar.
3. Bir ad verin, sonra şunları seçin:
   - **Çizimin üstünde:** uygulamanın araç çubuğu, bir şerit ya da hiçbiri; bir başlık çubuğu; bir bilgi kutusu ve içerdiği denetimler.
   - **Çizimin yanında:** araç kutusu solda, sağda ya da hiç yok, {{ui:Araçlarım}} ile ya da onsuz; paletleri hangi panelin tuttuğu, hangisinin üstte olduğu (örneğin proje tarayıcısı ya da {{ui:Özellikler}}) ve altındaki sekmelerin hangileri olduğu.
   - **Çizim alanı:** görünüm sekmeleri, hızlı çubuk ve işaretlediğiniz denetimlerle bir görünüm çubuğu, düzenleme paleti, bir durum çubuğu.
   - **Görünüm:** boyut, düğme çerçeveleri ve sekme stili.
4. {{ui:Bu düzeni kullan}} seçin. Uygulama hemen buna geçer ve düzenleri olan her uygulama da onu kullanır.

Yalnızca bu uygulamada bulunanlar sunulur. Düzeniniz {{ui:Eklentilerden ve dosyalardan}} altında listelenir; {{ui:Bu düzeni dışa aktar}} onu bir meslektaşınıza verebileceğiniz bir dosya olarak kaydeder; kaldırma düğmesi onu siler. Doldurduğu paneller, [Panelleri düzenleme ve ikinci monitörü kullanma](common:arrange-panels) bölümünde anlatıldığı gibi yine yerleştirilebilir, yüzebilir ve kendi pencerelerine taşınabilir.

## Kurulumunuzu çalışma ortamı olarak kaydedin

Çalışma ortamı, bu tarayıcıdaki her uygulama için tüm kurulumunuzdur: düzen, menü stili ve kısayollarınız, araç çubuğu stili, paneller ve boyutları ile {{ui:Araçlarım}}. Tema ve dil bunun parçası değildir.

- **Kaydet:** {{ui:Çalışma ortamları}} altına bir ad yazın ve {{ui:Kurulumumu kaydet}} seçin. Var olan bir adla kaydetmek o kurulumun yerine geçer.
- **Geçiş yap:** listeden bir kurulum seçin ve {{ui:Ona geç}} seçin. Uygulama o kurulumla yeniden yüklenir; kaydedilmemiş işiniz varsa, herhangi bir yeniden yüklemede olduğu gibi, uygulama önce sorar.
- **Paylaş:** {{ui:Dışa aktar}} seçili kurulumu bir `.ccenv.json` dosyası olarak kaydeder; {{ui:Kurulum içe aktar…}} bir dosyadan kurulum ekler. Dosya yalnızca bu seçenekleri ayarlar, başka hiçbir şeyi değil.
- **Kaldır:** bir kurulum seçin ve {{ui:Kaldır}} seçin.

En fazla on iki kurulum tutabilirsiniz.

İletişim kutusunu açmadan düzeni değiştirmek için (bir bloğu sürükleyin, bir araca sağ tıklayın), [Ekranda düzeni değiştirme](common:layout-edit) bölümüne bakın. Yerleşik düzenleri önce denemek için [araç kutusu ve bilgi kutusu düzenine](common:layout-toolbox), [şerit ve proje tarayıcısı düzenine](common:layout-ribbon) ve [Çizim düzenine](common:layout-drafting) bakın.
