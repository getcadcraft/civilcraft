---
title: Yükseklik ızgaraları ve LiDAR
summary: Mevcut zemini bir DEM'den (GeoTIFF ya da ASCII ızgara) ya da LiDAR noktalarından (LAS, LAZ) oluşturun — alanı seçin, veriyi seyreltin, sınıfları seçin ve kot birimlerini kontrol edin — ve bir yüzeyi GeoTIFF kot ızgarası olarak geri verin.
keywords: dem, dtm, kot ızgarası, geotiff, tif, ascii ızgara, asc, lidar, las, laz, nokta bulutu, sınıflar, zemin, seyreltme, nodata, raster, geotiff dışa aktar, gis
from: c8b2d18a
---

Halka açık yükseklik verisi iki şekilde gelir: **yükseklik ızgaraları** (bir DEM: hücre başına bir yükseklik, genellikle bir GeoTIFF `.tif` ya da bir ASCII ızgara `.asc`) ve **LiDAR noktaları** (bir `.las` dosyasında milyonlarca lazer dönüşü, sıkıştırılmışsa `.laz`). CivilCraft her ikisini de tarayıcının içinde ölçü noktalarına ya da bir yüzeye dönüştürür: hiçbir şey yüklenmez.

## Dosyayı açın

1. {{ui:Aç}} düğmesine (ya da GIS grubundaki {{ui:İçe aktar}} düğmesine) tıklayın ve dosyayı seçin ya da dosyayı plana sürükleyin. ASCII ızgara için, CivilCraft koordinat sistemini bilsin diye `.prj` dosyasını da seçin.
2. İçe aktarma iletişim kutusu, dosyanın kendisi hakkında söylediklerini gösterir: boyutu, hücreleri ya da noktaları, koordinat sistemi, enlem ve boylamdaki konumu ve kot aralığı. LiDAR için önce her noktayı bir kez okuyarak **sınıfların** sayısını çıkarır (bir ilerleme çubuğu ne kadar ilerlediğini gösterir; {{ui:İptal}} onu durdurur).

Üç ya da dört bantlı (kırmızı, yeşil, mavi) bir GeoTIFF bir resimdir, kot değildir: onun yerine harita katmanlarına gider.

## İçe alınacakları seçin

- **Alan**: {{ui:Projenin sınırları ve bir kenar boşluğu}} (boşluğu yazın), {{ui:Planın şu an gösterdiği}} ya da {{ui:Dosyanın tamamı}}. Dosyanın yalnızca bu bölümü okunur.
- **Seyreltme**: elde edeceğiniz noktalar arasındaki aralık, proje birimlerinde. Ayarların altındaki satır, yazarken bunun kaç nokta verdiğini gösterir. Bir ızgara için CivilCraft her ikinci, üçüncü… hücreyi tutar; böylece kotlar dosyadakiyle tam olarak aynı kalır, hücreleri asla ortalamaz. LiDAR için alan o boyutta karelere bölünür ve her kareden bir nokta tutulur: {{ui:Her hücrenin merkezine en yakın nokta}} (varsayılan), {{ui:Her hücredeki en alçak nokta}} (dosyada zemin sınıfı yoksa iyidir: zemin ağaçların altındadır) ya da {{ui:Her hücrenin noktalarının ortalaması}}.
- **Sınıflar** (LiDAR): zemin (sınıf 2), dosyada varsa işaretlenir; binalar, ağaçlar ve gürültü dışarıda bırakılır. Zemin sınıfı yoksa her sınıf işaretlenir ve iletişim kutusu bunu belirtir.
- **Zemin** (LiDAR, 0.8): bir dron bulutunun zemin sınıfı yoktur. Dosyada hiç yoksa iletişim kutusu **{{ui:Zemini kendim bulayım (drone bulutları, zemin sınıfı yok)}}** seçeneğiyle açılır: gürültü dışındaki her sınıf okunur, her hücrede en alçak nokta tutulur ve sonra CivilCraft, kademeli bir morfolojik filtreyle (Zhang ve diğerleri, 2003) binaları, ağaçları ve başıboş alçak noktaları çıkarır. Bu filtreyi şu seçeneklerle yönlendirebilirsiniz: **Çıkarılacak en büyük nesne** (en büyük binanın genişliği; pencereler onu kaplayana kadar büyür; 0, 20 hücre anlamına gelir) ve **En dik zemin eğimi**. İşlem en alçak noktalar ızgarası üzerinde yapılır; bu yüzden on milyonlarca noktalık bir bulut, hücre sayısından fazla maliyet getirmez (seyreltme tek bir akış geçişidir). Aralık hücredir: daha kaba bir hücre daha hızlıdır ve beklediğinizden daha az küçük nesneyi kaçırır; daha ince bir hücre daha fazla zemin ayrıntısını korur. Rapor, zemin olarak kaç noktanın tutulduğunu, nesne olarak kaç hücrenin çıkarıldığını ve kaç başıboş alçak noktanın atıldığını söyler. Uydurma bir 300 m'lik dron ölçümünde, beş bina, 70 ağaç ve 200 alçak aykırı değer ile tutulan noktalar gerçek araziye 3 cm yakındı ve hiçbir çatı ya da ağaç tepesi tutulmadı.
- **Dosyadaki kotlar**: metre, fit ya da ABD ölçü fiti. Dosya bunu belirtiyorsa birim zaten seçilidir. Belirtmiyorsa siz seçmelisiniz: iletişim kutusu kot aralığını iki şekilde gösterir, böylece hangisinin alan için mantıklı olduğunu anlayabilirsiniz.
- **Şu şekilde içe aktar** (yalnızca ızgaralar): {{ui:Ölçü noktaları (açıklama DEM)}} ya da {{ui:Yüzeyin kendisi (üçgenlerden bir ızgara)}}.

Tek bir içe aktarma en fazla 500,000 nokta alır. Bir seçim bundan fazla nokta verecekse, iletişim kutusu ne kadar fazla olduğunu ve hangi aralığın sığacağını söyler ve {{ui:İçe aktar}} pasif kalır.

{{ui:İçe aktar}} düğmesine tıklayın. Bir ilerleme çubuğu okumayı gösterir; {{ui:İptal}} onu durdurur ve hiçbir şey değişmez.

:::warning
Düşey birimler sık görülen bir tuzaktır. Birçok state plane DEM'in doğu ve kuzeyleri fit cinsinden, kotları metre cinsinden olur. İletişim kutusunun gösterdiği aralığı, sahayla ilgili bildiklerinizle karşılaştırın.
:::

## Ne elde edersiniz

- **Ölçü noktaları**: en yüksek nokta numaranızdan sonra numaralanır, açıklaması `DEM` (ızgaralar) ya da `LIDAR` olur; böylece **Noktalar** altında tek bir nokta grubu oluşturur ve yüzeyi diğer noktalar gibi oluşturur. İçe aktarmak tek adımdır: {{key:Mod+Z}} onları yeniden kaldırır.
- **Yüzeyin kendisi**: bir ızgara TIN, hücre başına iki üçgen, güneybatı–kuzeydoğu köşegeninde bölünmüş. Veri olmayan bir köşesi olan üçgen dışarıda bırakılır; böylece verideki boşluklar boşluk olarak kalır. Yüzey, her ızgara noktasında ızgaraya eşittir ve aralarında her üçgenin içinde düz bir düzlemdir. Proje yüzeyinin yerine geçer (iletişim kutusu önce sorar); {{key:Mod+Z}} önceki yüzeyi geri getirir. Sol panelin başlığı **Yüzey (yükseklik ızgarasından)** yazar.

## Koordinat sistemleri

- Proje bir koordinat sistemine sahipse ve dosya başka bir sistem belirtiyorsa, her nokta projenin sistemine (ve varsa zemin ya da yerel koordinatlarına) dönüştürülür.
- Proje hiçbirine sahip değilse ve dosyanın sistemi proje birimlerindeyse (fit ya da metre), iletişim kutusu bunu projenin koordinat sistemi yapmayı önerir; bu, noktalarla aynı geri alma adımında olur.
- Dosya enlem ve boylamdaysa ya da fit projesi için metredeyse, iletişim kutusu önce projenin koordinat sistemini seçmenizi ister.
- Dosya belirtmiyorsa, sayıları projenin koordinatları kabul edilir. Bunun yerine dosyanın sistemini seçebilirsiniz.

## Yüzeyi GeoTIFF olarak dışa aktarın

1. GIS grubundaki {{ui:Dışa aktar}} düğmesine tıklayın.
2. GeoTIFF bölümünde yüzeyi (mevcut zemin ya da tesviye edilmiş yüzey) ve hücre boyutunu seçin. Varsayılan, yüzeyin ortalama üçgen kenarından gelir. İletişim kutusu yazılacak ızgaranın boyutunu gösterir.
3. {{ui:GeoTIFF indir}} düğmesine tıklayın.

Dosya, proje birimlerinde 32 bit kayan noktalı kotlardan oluşan tek bir bant olur ve yüzeyin kapsadığı alanı kaplar; yüzeyin dışındaki hücreler "veri yok" (−3.4028235e38) olur. Her hücrenin değeri, hücrenin merkezindeki yüzey kotudur. Koordinatlar **ızgara** koordinatlarıdır: zemin ya da yerel koordinatlardaki bir proje ızgaraya geri dönüştürülür. Dosya, proje koordinat sistemini EPSG koduyla adlandırır; EPSG kodu olmayan bir sistem yazılmaz ve iletişim kutusu, hangi sistem olduğunu GIS departmanına bildirmeniz konusunda uyarır.

## Neler kontrol edildi

- GeoTIFF ve ASCII ızgara okuyucuları, çoğu GIS programının bu dosyaları okumak için kullandığı kütüphane olan GDAL ile (rasterio üzerinden) denetlendi: 32 bit kayan ve 16 bit tam sayılı ızgaralar; döşemeli ve şeritli; DEFLATE ve LZW; nodata, ölçek ve ofset; pixel-is-point; bir UTM ızgarası, ABD ölçü fitinde bir state plane ızgarası ve bir enlem/boylam ızgarası — her değer eşit.
- LAS ve LAZ okuyucuları laspy ile denetlendi: LAS 1.2 ve 1.4, nokta biçimleri 0, 1, 3, 6, 7 ve 8, koordinat sistemli ve sistemsiz; LASzip uyumlu bir arka uçla yazılmış LAZ — her nokta eşit.
- Dönüştürülen koordinatlar PROJ ile 1 mm'ye kadar denetlendi.
- Dışa aktarılan GeoTIFF'ler GDAL ile geri okundu: koordinat sistemi, hücre konumları, nodata, birimler ve yüzeye 0.0001'e kadar eşit değerler.
- Burada hiçbir şey başka GIS ya da CAD programlarında açılmadı.

## Henüz yapılmadı

- Düşey datum değişiklikleri (geoid modelleri): kotlar dosyada olduğu gibi kullanılır.
- Sınıflar dışındaki LiDAR dönüşleri, dalga formu verisi, renkler ve yoğunluklar.
- Birden fazla bant, önizleme katmanları (overviews) ya da 200 MB'den büyük dosyalar.
- Bir yüzeyden ya da bu araçtan LAS ya da LAZ yazma ([Nokta bulutları](topic:point-clouds) eklentisi, temizlenmiş bulutu LAS 1.4 ya da LAZ olarak yazar).
