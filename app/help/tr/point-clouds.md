---
title: Drone veya tarayıcıdan nokta bulutları
summary: Nokta bulutları eklentisiyle milyonlarca nokta içeren bir LAS veya LAZ dosyasını açın, tamamına bakın, temizleyin, zemin, bitki örtüsü ve binalara göre sınıflandırın; zemini, kotları ve hacimleri bundan oluşturun.
keywords: nokta bulutu, las, laz, dron, fotogrametri, recap, lidar, tarama, zemin, sınıflandır, gürültü, yığın, hacim, kazı ve dolgu, kot eğrileri, kırılma çizgisi, eye-dome, ortomozaik, ortho, kaplama, harita katmanı, las dışa aktar, laz dışa aktar, sıkıştır
from: e4a4901f
---

Çoğu kişinin buna ihtiyacı olmaz, bu yüzden bu bir eklentidir. Ayarlar › Eklentiler bölümünde {{ui:Nokta bulutları}} seçeneğini açın; sağdaki panelde bir {{ui:Nokta bulutları}} sekmesi görünür. Dosya tarayıcınızda okunur ve karolara bölünür; bu karolar tarayıcınızın kendi depolama alanında (ya da seçtiğiniz bir klasörde) tutulur. **Hiçbir şey yüklenmez.**

:::warning
Bu sekmenin bildirdiği her şey verilerinizden çıkan bir sayıdır, bir sertifika değildir. Henüz gerçek bir dron araştırmasında değil, uydurma bir sahada sınanmıştır: ilk sonuçları dikkatle okuyun ve bize ne bulduğunuzu bildirin. Zeminin, kotların ve hacimlerin ne değer taşıdığına lisanslı meslek sahibi karar verir.
:::

## Bulut aç

{{ui:Bulut aç}} altında bir LAS veya LAZ dosyası seçin. Sekme dosyanın kaç nokta içerdiğini, koordinat sistemini ve birimlerini ve bir oluşturma için ne kadar alan gerektiğini gösterir; {{ui:Bulutu oluştur}} düğmesine basın. Oluşturma durdurulabilir ve {{ui:Devam et}} ile sürdürülebilir (aynı dosyayı yeniden seçin). Dosya hiçbir zaman değiştirilmez. 100 milyon noktalı bir dosya, bir iş istasyonunda birkaç dakikada oluşur ve yaklaşık dosya boyutu kadar alan kullanır.

{{ui:Bu bilgisayardaki bulutlar}} altında bir bulutu açabilir ya da kaldırabilirsiniz. {{ui:Bulutları bir klasörde tut…}} (Chrome, Edge ve Studio uygulaması) karoları sizin seçtiğiniz bir klasörde tutar; örneğin Belgeler içinde bir CadCraft bulutlar klasörü. Böylece 10 GB'lık bir bulut tarayıcının depolama alanına sığmak zorunda kalmaz; daha önce oluşturulmuş bulutlar oluşturuldukları yerde kalır. Tarayıcı yeniden başlatıldıktan sonra izni yeniden ister: {{ui:Klasörü … yeniden kullan}} düğmesine basın.

## Görüntüleyin

{{ui:3D'de incele}} bulutu kaba karolardan çizer ve yaklaştıkça iyileştirir; aynı anda en fazla {{ui:Çizilen en çok nokta}} (2.5 milyon; telefonda 500 bin) gösterilir. Dosyanın kendi rengine, yüksekliğe, sınıfa, yoğunluğa ya da artığa göre renklendirin. {{ui:Eye-dome aydınlatması}} kenarları derinliğe göre gölgelendirir, böylece normaller olmadan şekil okunur (telefonda kapalı); {{ui:Noktalar uzaklıkla küçülsün}} uzaktaki noktaları küçültür, yakındakileri büyütür; {{ui:Nokta boyutu}} boyutu belirler. Plan, bulutu çiziminizin altında bir raster olarak gösterir ve bir kısmına yakınlaştığınızda o kısmı **iyileştirir**.

## Temizleyin

{{ui:Temizle}} altında planda bir kement, kutu ya da çokgen çizin (ya da 3D'de üstten görünümde: 3D'de ana hat doğrudan aşağı alındığından yalnızca yukarıdan tam doğrudur). Sekme, uygulamadan **önce** içeride kaç nokta olduğunu gösterir: {{ui:Bu noktaları sil}}, {{ui:Sınıfını değiştir}}, {{ui:Silinen noktaları geri yükle}} ya da {{ui:Bu sınıra kırp}}. {{ui:Geri al}} ve {{ui:Yinele}} düzenleme günlüğünde gezinir; dosyanın kendisi hiçbir zaman değişmez. {{ui:Gürültü filtresi…}} dağınık noktaları alçak nokta (sınıf 7) ya da yüksek gürültü (sınıf 18) olarak işaretler.

## Ayırın

{{ui:Zemini bul}} karo karo çalışır ve zemini (sınıf 2) ile alçak noktaları işaretler; tolerans 0.15 m'dir, ölçme sınıfı anahtarı açıksa 0.08 m. Birbirini tutmayan karo birleşimlerini bildirir. Ardından {{ui:Bitki örtüsünü ve binaları sınıflandır}}, zemin üstü yüksekliğe ve çevrenin ne kadar düz olduğuna göre alçak, orta ve yüksek bitki örtüsünü ile binaları işaretler. Makine öğrenmesi yoktur; bu yüzden ağaçların altındaki düz çatılı bir barınak yanlış olabilir: bakın.

## Zemin, kotlar, kırılma çizgileri

{{ui:Zemin oluştur}}, zemin noktalarından mevcut zemini oluşturur ve bunu bir LAS içe aktarmasıyla aynı şekilde projeye ekler (tek bir geri alma adımı). Ardından noktaları onunla karşılaştırır: ortalama, RMS, 95. yüzdelik, tolerans içindeki pay ve en çok farklılaşan on yer; her biri {{ui:Oraya git}} ile. {{ui:Artık}} değerine göre renklendirme, zeminin ve bulutun nerede uyuşmadığını gösterir.

Bir **kırılma çizgisi** (bordür, hendek ya da şev üstü) bulut üzerinde seçilir: 3D görünümde {{ui:Bulutta kırılma çizgisi seç}} her tıklamada çizilen en yakın noktayı alır; {{ui:Planda kırılma çizgisi seç}} her tıklamanın altındaki en yakın bulut noktasını (önce zemin) alır; çift tıklama ya da Enter çizgiyi bitirir. Bir sonraki {{ui:Zemin oluştur}} bunu kullanır. {{ui:Kot eğrilerini göster}} kot eğrilerini küçük bir resimde bulutun üzerine çizer ve projenin aralığını ayarlar.

## Hacimler

{{ui:Yığın hacmi…}}, çizdiğiniz bir sınır içinde bir taban üzerindeki yüzeyin hacmini hesaplar. Sınırı yığının etrafındaki düz zeminde çizin ve tabanı seçin: en alçak sınır noktası, bir düzlem, pürüzsüz eğrisel bir taban, sınırdan geçen bir yüzey ya da yazdığınız bir kot. Eğimli ya da eğrisel zeminde düzlemi ya da eğrisel tabanı kullanın; en alçak nokta çok yüksek okur. Diğerlerinden yukarıda duran sınır noktaları (çizgi üzerindeki bir ağaç) tabanın dışında bırakılır. {{ui:Uçuştan uçuşa}} iki bulut arasında kazı ve dolgu verir. İkisi de CSV olarak kaydedilebilir.

## Ortomozaik

{{ui:Ortomozaik (yukarıdan resim)}} altında, varsa dronun ortomozaiğini, dünya dosyası ve `.prj` dosyasıyla birlikte seçin: bir GeoTIFF ya da PNG veya JPEG. Projenin bir **harita katmanı** olur; böylece plan onu çiziminizin altında gösterir ve 3D görünüm ({{ui:Harita}} rengi) onu oluşturduğunuz zemine boyar; bu yüzden önce {{ui:Zemin oluştur}} işlemini yapın. Sekme, resmin bulutun ne kadarını kapsadığını söyler ve hiç kapsamadığında uyarır: olağan neden farklı bir koordinat sistemidir, bu yüzden yanına `.prj` dosyasını verin. `.prj` yoksa program koordinatların nerede olduğunu sorar. Resim proje dosyasının içinde tutulur; 200 MB'tan büyük bir GeoTIFF reddedilir ve çok büyük bir mozaik 16 megapiksele indirilir, bu yüzden büyük bir araştırma için mozaiği önce sahaya göre kesin.

## Dışa aktar

{{ui:Dışa aktar}}, temizlenmiş ve sınıflandırılmış bulutu yeni bir dosya olarak yazar (tüm noktalar, temiz sınıflar ya da yalnızca zemin). {{ui:Dosya türü}} altında seçin:

- **LAS 1.4 (sıkıştırılmamış)**: nokta biçimi 6, ya da renkle birlikte 7.
- **LAZ (sıkıştırılmış)**: aynı noktalar kayıpsız sıkıştırılır, böylece her nokta tam olarak geri gelir. Bir LAS 1.4 dosyasında nokta biçimi 0 ya da renkle 2 olarak yazılır. Uydurma 300 m'lik sahada LAZ, LAS 1.4 dosyasının yaklaşık beşte biri boyutundaydı. LAZ biçim 0 ve 2 yalnızca 0 ile 31 arasındaki sınıfları tutar: daha yüksek sınıfa sahip bir nokta bir iletiyle reddedilir, bu yüzden o bulutu LAS 1.4 olarak dışa aktarın.

LAZ, yayımlanmış LAZ belirtiminden yapılmış CadCraft'ın kendi sıkıştırıcısıyla yazılır. Kendi okuyucumuzun ve iki bağımsız LAZ okuyucusunun (uygulamanın LAZ dosyalarını açmak için kullandığı laz-perf ile lazrs'li laspy) her noktayı tam olarak geri okuduğunu, ayrıca laspy ile yapılmış LAZ dosyalarının noktaları yeniden yazdığımızda bayt bayt aynı çıktığını kontrol ettik. Diğer programlar henüz denenmedi; bu yüzden biri bir dosyayı açmazsa hangisi olduğunu bize bildirin.

Tarayıcı dosyayı yazarken yazabiliyorsa, önce dosyayı seçersiniz ve çok büyük bir bulut belleğe toplanmak yerine karo karo ona yazılır; aksi halde dosya toplanır ve indirilir, bu da birkaç yüz megabayta kadar uygundur.

## Yapmadıkları

Yalnızca LAS ve LAZ okur (E57, PLY ve PCD bu sekmeye henüz bağlanmamıştır ve tek bir uçuşun birkaç dosyası birleştirilmez); bir bulutu yeniden projeksiyonlamaz (projenin sistemi ve metreler varsayılır); Autodesk'in RCP ya da RCS dosyalarını okumaz; fotoğraflardan bir yüzey oluşturmaz ve direkleri, bordürleri ya da boruları kendiliğinden bulmaz.
