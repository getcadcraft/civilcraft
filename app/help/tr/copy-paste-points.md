---
title: Ölçü noktalarını seçin, kopyalayın ve yapıştırın
summary: Noktaları tıklayarak, Shift ve bir kutuyla veya hepsini birden seçin; asla çakışmayan yeni nokta numaralarıyla kopyalayın, kesin, yapıştırın, olduğu yere yapıştırın, çoğaltın ve silin; nokta satırlarını bir elektronik tabloya yapıştırıp bir elektronik tablodan alın.
keywords: kopyala, yapıştır, kes, çoğalt, noktaları sil, noktaları seç, kutu seçimi, tümünü seç, pencere, pano, elektronik tablo, csv, yeniden numaralandır, nokta numaraları, olduğu yere yapıştır, klon, kazık çakma
from: 78a6aea7
---

Ölçü noktaları bir proje içinde, iki tarayıcı sekmesindeki projeler arasında ve bir elektronik tabloya ve elektronik tablodan kopyalanıp yapıştırılabilir. Her değişiklik tek bir geri alma adımıdır ve yüzey yeni noktalardan hemen yeniden oluşur.

## Noktaları seçin

{{ui:Seç}} ({{key:V}}) ile:

- Bir noktayı seçmek için **tıklayın** (yalnızca o). Numaraları **Özellikler** altında görünür.
- {{key:Shift}} ve **tıklama** bir noktayı seçime ekler veya seçimden çıkarır.
- {{key:Shift}} ve **sürükleme** bir kutu çizer: içindeki noktalar seçime eklenir. Bunun yerine noktaların etrafında sürüklerseniz bir kement olur; bkz. [Ölçü noktalarının kement seçimi](topic:lasso-selection). {{key:Shift}} olmadan sürükleme her zaman olduğu gibi kaydırır.
- {{key:Mod+A}} (ya da {{ui:Daha fazla}} › {{ui:Tüm noktaları seç}}) her noktayı seçer.
- {{key:Esc}} (ya da {{ui:Daha fazla}} › {{ui:Seçimi kaldır}}) seçimi temizler.

Seçili noktaların etrafında bir halka vardır. Birden fazla seçiliyken **Özellikler** kaç tane olduğunu, numaralarını, kot aralığını ve gruplarını gösterir.

## Kopyalama, kesme ve silme

- {{ui:Kopyala}} veya {{key:Mod+C}} seçili noktaları kopyalar. CivilCraft kopyayı tutar ve ayrıca bunu nokta satırları olarak sistem panosuna da koyar; böylece doğrudan bir elektronik tabloya veya metin dosyasına yapıştırabilirsiniz.
- {{ui:Daha fazla}} › {{ui:Kes}} veya {{key:Mod+X}} onları tek adımda kopyalar ve siler.
- {{ui:Daha fazla}} › {{ui:Sil}} veya {{key:Delete}} onları siler. {{key:Mod+Z}} onları geri getirir.

Satırlar nokta, kuzey, doğu, kot, tanım (P,N,E,Z,D) sırasındadır; virgülle ayrılır ve üç ondalık basamaklıdır. Önce doğuyu almak için [CivilCraft ayarları](topic:settings) içinde **Nokta satırları** seçeneğini ayarlayın. Bir elektronik tablonun formül sayacağı bir tanım (=, +, - veya @ ile başlayan) önüne bir kesme işareti alır, böylece metin olarak kalır.

## Yapıştırma

1. {{key:Mod+V}} tuşuna basın veya {{ui:Yapıştır}} seçeneğine tıklayın. Noktalar, kaynaklarına dönen noktalı bir çizgiyle birlikte küçük artılar olarak imleci izler.
2. Gideceği yere tıklayın. Kopyalanan noktaların ortası tıkladığınız yere gelir.
3. Ya da noktaları kendi koordinatlarına koymak için {{key:Enter}}, iptal için {{key:Esc}} tuşuna basın.

{{ui:Daha fazla}} › {{ui:Olduğu yere yapıştır}} veya {{key:Mod+Shift+V}} noktaları hemen kendi koordinatlarına yapıştırır. Yapıştırılan noktalar sonra seçilir, böylece onları yeniden kopyalayabilir, taşıyabilir veya silebilirsiniz.

:::note
Araç çubuğundaki {{ui:Yapıştır}} düğmesine tıklamak sistem panosunu okur. İlk seferde tarayıcı CivilCraft'ın panoyu görüp göremeyeceğini sorabilir. Reddederseniz araç çubuğu düğmesi yalnızca CivilCraft'ın kendi kopyasını yapıştırır; {{key:Mod+V}} yine de bir elektronik tablodan satırları sormadan yapıştırır.
:::

## Nokta numaraları asla çakışmaz

İki nokta asla aynı numarayı paylaşmaz. Yapıştırdığınızda:

- Yapıştırılan bir nokta, projedeki hiçbir nokta o numarayı kullanmıyorsa numarasını korur. Yani **Kes** sonrası noktalar kendi numaralarıyla geri yapıştırılır ve başka bir projeden kopyalanan noktalar, numaraları boşsa yerlerinde kalır.
- Numarası alınmış olan yapıştırılan bir nokta, kullanımdaki en yüksek numaranın bir fazlası olan yeni bir tam sayı alır ve yukarı doğru sayılır.
- Durum çubuğu neyin olduğunu söyler, örneğin "1 numarasını korudu; 9'u yeni numaralar aldı: 10–18, 277–285 oldu".

[CivilCraft ayarları](topic:settings) içinde **Her zaman yeni numaralar** seçeneğini ve yeni numaraların başlayacağı bir sayıyı (örneğin tasarım noktaları için 5000) seçebilirsiniz.

:::warning
Yüzeyi bir **kırılma çizgisi** olarak oluşturan nokta grupları noktalarını numara sırasıyla birleştirir. Kırılma çizgisi noktalarının yapıştırılan kopyaları (örneğin FL ölçümleri) yeni, daha yüksek numaralar alır ve o kırılma çizgisinin sonuna eklenir; muhtemelen uzun bir sıçrayışla. Bu tür noktaları yapıştırdıktan sonra planı kontrol edin veya gruplarını {{ui:Noktalar}} olarak ayarlayın.
:::

## Çoğaltma

{{ui:Daha fazla}} › {{ui:Çoğalt}} veya {{key:Mod+D}} seçili noktaların, imleci izleyen bir kopyasını yapar: gitmesini istediğiniz yere tıklayın. Kopyalar her zaman yeni numaralar alır ve CivilCraft'ın panosu olduğu gibi kalır.

## Bir elektronik tablodan veya metin dosyasından

Bir elektronik tabloda nokta satırlarını seçin (nokta, kuzey, doğu, kot, tanım) ve kopyalayın. CivilCraft'ta {{key:Mod+V}} tuşuna basın ve gideceği yere tıklayın ya da {{key:Mod+Shift+V}} tuşuna basarak noktaları kendi koordinatlarına koyun; gerçek ölçü verileri için genellikle istediğiniz budur.

Satırlar tıpkı bir [nokta dosyası](topic:point-file-formats) gibi okunur: virgül, sekme veya boşluk, varsa bir başlık satırı. Başlık yoksa sütun sırası [CivilCraft ayarları](topic:settings) içindeki **Nokta satırları**'ndan gelir.

İkisi de varsa CivilCraft hangisinin daha yeni olduğuna göre karar verir: sistem panosundaki, CivilCraft'ın son kopyasından farklı satırlar daha sonra kopyalanmış sayılır ve yapıştırılır. Nokta içermeyen metin yok sayılır ve bunun yerine CivilCraft'ın kendi kopyası yapıştırılır.

## Projeler ve sekmeler arası

Kopya bu tarayıcıda tutulur; böylece birinci sekme kapansa bile CivilCraft'ın ikinci bir sekmesi onu yapıştırabilir. Metre cinsinden bir projede kopyalanan ve feet cinsinden bir projeye yapıştırılan noktalar numaralarını olduğu gibi korur: hiçbir şey dönüştürülmez ve durum çubuğu bunu söyler.

## Kopyalanmayanlar

Şimdilik yalnızca ölçü noktaları kopyalanır. Eksenler, platformlar, boru ağları, kırılma çizgileri ve sınırlar henüz kopyalanamaz veya yapıştırılamaz. Yapıştırma mevcut noktaları taşıyamaz: {{ui:Kes}} ve yapıştırmayı kullanın ya da noktaları birer birer taşıyın ([Ölçü noktasını düzenleyin](topic:edit-points)).
