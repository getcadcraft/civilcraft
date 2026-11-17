---
title: Plan altında harita katmanlarını gösterme
summary: Coğrafi referanslı bir resmi, harita karolarını, bir WMS ya da WMTS sunucusunu ya da bir harita hizmetini saha bağlamı olarak planın altına koyun; internet ayarı, opaklık, sıra ve atıfla birlikte.
keywords: harita katmanları, temel harita, arka plan, havadan görüntü, ortofoto, görüntü, uydu, raster, dünya dosyası, pgw, jgw, tfw, wld, geotiff, coğrafi referanslı görüntü, xyz, karolar, kayan harita, wms, wmts, getcapabilities, harita hizmeti, rest, mapserver, imageserver, usgs, national map, atıf, opaklık
from: 32d7718e
---

Harita katmanları tasarımınızın altına çizilen resimlerdir: dünya dosyasıyla birlikte bir havadan fotoğraf ya da internetteki sunuculardan haritalar. Yalnızca ekranda saha bağlamıdırlar: PDF çıktılarında, DXF ya da DWG dışa aktarımlarında ya da 3B görünümde **bulunmazlar**.

{{ui:CBS}} grubunda {{ui:Harita}} öğesini seçin. **Harita katmanları** iletişim kutusu projenin katmanlarını listeler ve yenilerini ekler. Harita katmanları projenin koordinat sistemine ihtiyaç duyar ([Proje koordinat sistemini ayarlama](topic:coordinate-systems)); dünya dosyası projenin kendi koordinatlarını kullanan bir resim bunun dışındadır.

## İnternet ayarı

CivilCraft, siz izin verene kadar bir harita sunucusundan hiçbir şey istemez: {{ui:Ayarlar}}, {{ui:CivilCraft}}, **Harita katmanlarını internetten**: **Kapalı** (başlangıç) ya da **Açık**.

:::note
Açıkken, CivilCraft eklediğiniz harita sunucularından ekrandaki alanın resimlerini ister. Çiziminiz bu bilgisayarda kalır; sunucu alanı ve internet adresinizi görür.
:::

Kapalıyken internet katmanları iletişim kutusunda soluk renkte, nedeniyle birlikte listelenir; hiçbir şey çizilmez ya da istenmez. Harita sunucularını adlandıran bir proje açmak da onlarla iletişime geçmez. Dosyadan gelen bir resim her durumda çalışır. İletişim kutusundaki {{ui:Ayarları aç}} düğmesi sizi oraya götürür.

## Çevrimdışı çalışan coğrafi referanslı resim

1. **Katman ekle** bölümünde **Coğrafi referanslı resim** seçili kalsın ve dosyaları seçin: resim (PNG ya da JPEG) **ile birlikte** dünya dosyası (PNG için `.pgw`, JPEG için `.jgw` ya da `.wld`) ve varsa `.prj` dosyası. Bunları planın üzerine birlikte de bırakabilirsiniz.
2. Bir `.prj` yoksa, CivilCraft dünya dosyasının hangi sistemi kullandığını sorar: {{ui:Projenin sistemi}} (en yaygın olanı), {{ui:Bir sistem seçin…}} ya da sistemi olmayan bir projede **Proje koordinatları**.
3. Resim planın altında görünür ve {{ui:Sığdır}} onu da kapsar.

RGB GeoTIFF (GeoTIFF olarak kaydedilmiş bir havadan fotoğraf) kendi yerleşimini ve sistemini taşır: tek başına açın. Resim **proje dosyasının içinde** tutulur (25 MB'a kadar); daha büyük bir resim boyutuyla birlikte reddedilir, dolayısıyla daha küçük bir kopya kaydedin (daha az piksel ya da JPEG).

## Karolar, WMS, WMTS ve harita hizmetleri

Önce **Harita katmanlarını internetten** seçeneğini açın. Sonra **Katman ekle** bölümünde:

| Kaynak | Yapıştırılacak | CivilCraft ne yapar |
|---|---|---|
| Karo URL'si | `{z}`, `{x}` ve `{y}` (ya da `{-y}`) ile bir sunucu harfi için `{s}` içeren bir şablon, örneğin `https://tile.example.org/{z}/{x}/{y}.png`. Bir ad ve atıfını verin. | Ekrandaki alan ve yakınlaştırma için web Mercator'da karolar. |
| WMS sunucusu | Sunucunun adresi ya da GetCapabilities bağlantısı. {{ui:Katmanları al}} seçin, sonra katmanı. | Ekrandaki alanın tek bir resmi; sunucu sunduğunda projenin EPSG kodunda, değilse web Mercator ya da WGS 84'te istenir. |
| WMTS sunucusu | Sunucunun adresi ya da `WMTSCapabilities.xml`. {{ui:Katmanları al}} seçin, sonra katmanı ve karo matris kümesini. | Proje sisteminde varsa kümedeki karolar, yoksa web Mercator. |
| ArcGIS harita hizmeti (REST) | `/MapServer` ya da `/ImageServer` ile biten bir URL. {{ui:Servisi oku}} seçin. | Önbelleğe alınmış web Mercator hizmetleri karolarından çizilir; diğerlerinden ekrandaki alanın tek bir resmi istenir. |

Hiçbir sunucu önceden ayarlı gelmez. Herkese açık örnekler, hepsi USGS National Map'ten (kamu malı):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Harita hizmeti: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (hava fotoğrafları için `USGSImageryOnly` de)

Birçok şehir ve ilçe CBS birimi kendi WMS'lerini ya da harita hizmetlerini yayımlar; CBS sayfaları adresi verir. Oturum açma ya da anahtar isteyen bir sunucu çalışmaz: CivilCraft kullanıcı adı, parola ya da anahtar göndermez.

## Katmanlar nasıl çizilir

- Projenin sisteminden farklı bir sistemdeki resimler onun içine eğilir: resim parçalara bölünür, her biri tam dönüşümün işaret ettiği yerden bir ekran pikselinin dörtte biri içinde kalacak şekilde yerleştirilir.
- Karolar ekrandaki alan ve yakınlaştırmaya göre seçilir: bir görünüm için en fazla 64, aynı anda 6. Kaydırdığınızda ya da yakınlaştırdığınızda eski görünüm için istekler iptal edilir. Bellekte yaklaşık 200 karo tutulur (diske hiçbir şey kaydedilmez).
- WMS ya da harita hizmeti resmi, görünüm hareket etmeyi bıraktıktan sonra istenir; gelene kadar son resim yerinde kalır.
- Her katmanın ekrandaki atıfı, planın sağ alt köşesinde küçük görünür.

## Katmanları değiştirin, sıralayın ve kaldırın

İletişim kutusunda her katmanın gösterme ya da gizleme onay kutusu, bir **Opaklık** kaydırıcısı, onu daha önce (alta) ya da daha sonra (üste) çizmek için oklar, bir yakınlaştırma düğmesi (resimler için) ve bir kaldırma düğmesi vardır. Listedeki ilk katman en altta çizilir. Her değişiklik bir geri al adımıdır.

## Bir katman hiçbir şey göstermediğinde

Nedeni durum satırında bir kez görünür ve iletişim kutusunda katmanın adının altında kalır:

| Mesaj | Ne yapmalı |
|---|---|
| Kapalı: harita katmanları internetten Ayarlar'da kapalı. | **Harita katmanlarını internetten** seçeneğini açın. |
| Projenin koordinat sistemi gerekir | {{ui:Koordinatlar}} altında ayarlayın. |
| Sunucu bu sayfanın resimlerini kullanmasına izin vermedi (CORS) ya da ulaşılamadı. | Sunucu web sayfalarının resimlerini kullanmasına izin vermiyor ya da hizmet kapalı. Dört reddin ardından CivilCraft istemeyi bırakır; yeniden denemek için katmanı gizleyip gösterin. |
| Sunucu 404 … yanıtı verdi / Sunucu text/xml gönderdi, resim değil: … | URL, katman ya da stil yanlış; ya da sunucunun iletisi ne istediğini söyler. |
| Bu katman projenin sisteminde, web Mercator'da ya da WGS 84'te sunulmuyor | Sunucu, CivilCraft'ın yerleştirebildiği yerde çizemez. |

## Neler denetlendi

- Karo numaraları standart web Mercator döşemesine göre denetlendi; WMS 1.1.1 ve 1.3.0, WMTS ve harita hizmeti yanıtları elle yazılmış dosyalardan ve USGS National Map ile terrestris OpenStreetMap sunucularından kaydedilmiş gerçek yanıtlardan okundu; WMS 1.3.0 istekleri, standardın dediği gibi EPSG:4326 için önce enlemi koyar.
- Eğme, PROJ'un sayılarıyla yapılan piksel başına kesin dönüşümle karşılaştırıldı: karolar, WMS resimleri ve ilçe büyüklüğünde bir resim için 0.13 px içinde; saha ölçeğinde ve uzaklaştırılmış görünümde.
- Dünya dosyasıyla bir resim ve GDAL'in (rasterio üzerinden) yazdığı bir RGB GeoTIFF, yerleşimlerinin işaret ettiği yere çizildi; tarayıcıda piksel piksel denetlendi.
- Tarayıcıda, test bilgisayarındaki bir taklit sunucuya karşı: karolar, PROJ'un her noktayı koyduğu karoya düşer; bir WMS resmi 2 px içinde düşer; en fazla 6 istek aynı anda çalışır; ayar kapalıyken sayfadan hiçbir istek çıkmaz. Yukarıdaki USGS National Map harita hizmeti de tarayıcıda bir kez okundu ve çizildi (karoları geldi ve çizildi, telif metniyle birlikte); diğer herkese açık sunucular yalnızca kaydedilmiş yanıtlardan okundu.
