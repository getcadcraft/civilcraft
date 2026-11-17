---
title: GIS verilerini içe aktarma
summary: Shapefile, GeoJSON ve GeoPackage dosyalarını GIS katmanları olarak projeye alın, doğru koordinat sistemi üzerinden yerleştirin, özniteliklerine bakın ve yüzey için kullanın.
keywords: gis, cbs, etiketler, özellik etiketleri, plan üzerinde öznitelikler, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, içe aktar, katmanlar, öznitelikler, koordinat sistemi, epsg, enlem, boylam, konturlar, parseller, kırılma çizgileri, sınır
from: f6b235cc
---

Belediye ve ilçe GIS birimleri saha bağlamını GIS dosyaları olarak verir: parseller, geçit hakkı alanları, konturlar, altyapı, ölçü kontrol noktaları. CivilCraft bunların üç türünü, plan üzerinde tasarımınızın altında duran **GIS katmanları** olarak açar.

| Dosya | Ne açılmalı |
|---|---|
| Shapefile | `.shp` dosyası ile birlikte `.shx`, `.dbf`, `.prj` ve `.cpg` (hepsini seçin) ya da geldikleri `.zip`. İçinde birden çok shapefile bulunan bir zip, birden çok katman verir. |
| GeoJSON | `.geojson` dosyası (ilk satırlarında `FeatureCollection` veya `Feature` yazan bir `.json` dosyası da olur). |
| GeoPackage | `.gpkg` dosyası. İçindeki her özellik tablosu listelenir. |
| KML veya KMZ | `.kml` dosyası (Google Earth veya bir web haritasından) ya da zipli `.kmz`. Her klasör bir katman olur (birden çok tür içeriyorsa noktalar, çizgiler ve çokgenler olarak ayrılır); bir yer işaretinin adı, açıklaması ve genişletilmiş verileri öznitelikleri olur. Yükseklikler metre cinsinden, enlem ve boylam ise GeoJSON'daki gibidir. |

Noktalar, çoklu noktalar, çizgiler, delikli çokgenler ve çok parçalı şekiller okunur; dosyada varsa yükseklikleriyle (z) birlikte. Ölçü (M) değerleri dışarıda bırakılır. Kot ızgaraları ve LiDAR aynı şekilde açılır: bkz. [Kot ızgaraları ve LiDAR](topic:elevation-grids-and-lidar).

## Dosyaları açın

1. **GIS** grubunda {{ui:Import}} düğmesine (veya {{ui:Open}}) tıklayın, dosyaları seçin ya da plana bırakın. Dosyalar bu bilgisayarda okunur; hiçbir şey yüklenmez.
2. **GIS verilerini içe aktar** iletişim kutusu bulunan her katmanı listeler: türü, kaç özelliği (ve kaçının geometrisi olmadığı), kaç öznitelik alanı olduğu ve dosyanın adlandırdığı koordinat sistemi. İstemediğiniz katmanların işaretini kaldırın.
3. **Koordinat sistemi** bölümünü (aşağıda) ve **Ne olacak** satırını okuyun, sonra {{ui:Import}} düğmesine tıklayın.
4. Katmanlar plan üzerinde ve sol panelde **GIS katmanları** altında görünür. İçe aktarma tek bir adımdır: {{key:Mod+Z}} bunu geri alır.

Büyük bir dosya, plan üzerinde bir {{ui:Cancel}} düğmesi bulunan bir ilerleme satırı gösterir.

## Koordinat sistemi

GIS dosyaları konumlarını bir koordinat sistemi aracılığıyla belirtir (shapefile'ın `.prj`'si, bir GeoPackage'ın uzamsal referans tablosu; GeoJSON her zaman enlem ve boylamdır). CivilCraft her katmanı kendi sisteminden projenin sistemine çevirir. Asla tahmin yürütmez:

- **Projenin bir koordinat sistemi var** ({{ui:Coordinates}} içinde ayarlanmış): kendi sistemi olan her katman ona çevrilir; zemin veya yerel düzeltme dahil. `.prj`'si olmayan bir dosya iki seçenek alır: **Projeyle aynı** (sayıları olduğu gibi yüklenir) veya **Dosyanın sistemini seç**.
- **Projenin hiç sistemi yok ve dosya projenin birimlerinde projeksiyonlu bir sistemde** (örneğin feet projesi için ABD araştırma feet'inde bir eyalet düzlem bölgesi): iletişim kutusu **Bu sistemi projenin koordinat sistemi olarak kullan** seçeneğini sunar. Bu, içe aktarmayla aynı geri alma adımında ayarlanır. Projede hiçbir şey hareket etmez; sistem yalnızca sayıların ne anlama geldiğini belirtir. Bunun yerine projeye başka bir sistem seçebilirsiniz; katmanlar ona çevrilir.
- **Projenin hiç sistemi yok ve dosya enlem ve boylamda** (her GeoJSON) **veya başka birimlerde**: {{ui:Import}} siz koordinat sistemini seçene kadar soluk kalır. Seçici verilere yakın bir yerden başlar.
- **Ne proje ne de dosyalar bir sistem adlandırıyorsa**: sayılar olduğu gibi yüklenir ve iletişim kutusu bunu söyler.

Yükseklikler de çevrilir: GeoJSON yükseklikleri metredir (GeoJSON standardı bunu söyler); diğer dosyaların yükseklikleri kendi sistemlerinin biriminde alınır.

:::warning
Bir GeoJSON dosyasında boylamı ±180° veya enlemi ±90° dışında olan konumlar enlem ve boylam değildir. Bu özellikler dışarıda bırakılır ve iletişim kutusu kaç tane olduğunu söyler. Böyle bir dosya genellikle sistemi kaydedilmeden kaydedilmiş bir projeksiyonlu dosyadır; yeniden isteyin ya da `.prj`'li shapefile isteyin.
:::

NAD83, GeoJSON'un kullandığı sistem olan WGS 84 ile aynı kabul edilir; ikisi Kuzey Amerika'da birkaç metre farklıdır, dolayısıyla GeoJSON verileri bu kadar kaymış olabilir. En iyi kaymanın bir ızgara dosyası gerektirdiği yerlerde (örneğin NAD27 için NADCON), CivilCraft daha kaba yayımlanmış bir kayma kullanır ve koordinat sistemi iletişim kutusu bunun ne kadar kaba olduğunu gösterir (NAD27 için yaklaşık 20 m); siz ızgara dosyasını ekleyene kadar. Bkz. [ızgara kayma dosyaları](topic:coordinate-systems).

## GIS katmanları

**GIS katmanları** altındaki her satırda şunlar vardır:

- katmanı göstermek veya gizlemek için bir onay kutusu (gizli katmanlar da seçilmez);
- listeden seçilen bir renk;
- üç nokta ile bir menü: {{ui:Zoom to}}, {{ui:Use for the surface…}}, {{ui:Rename…}} ve {{ui:Remove}}.

Gösterme, gizleme, yeniden renklendirme, yeniden adlandırma ve kaldırma geri alma adımlarıdır. GIS katmanları proje dosyasında saklanır ve projeyi açtığınızda geri gelir. Ayrıca plan PDF çıktısına, DXF ve DWG dışa aktarımlarına da çıkarlar; her biri `GIS-` ve numarasından oluşan adlı bir katmanda.

## Bir özniteliğten özellik etiketleme

Katmanın {{ui:More}} menüsünde (**GIS katmanları** içindeki üç nokta), **Şununla etiketle** altında bir alan seçin: her özellik değerini plan üzerinde, katmanın renginde gösterir. Noktalar nokta yanında, çizgiler en uzun parçalarının ortasında (soldan sağa okunacak şekilde döndürülerek), çokgenler merkezinde etiketlenir. Sayılar üç ondalık basamağa kadar gösterilir. Etiketler kâğıtta her ölçekte 1.8 mm yüksekliğindedir ve PDF çıktısına, DXF ve DWG'ye girerler. Onları kaldırmak için **Etiket yok** seçin; her değişiklik bir adımdır ({{key:Mod+Z}} geri alır). Bir katman en fazla 5,000 özelliği etiketler.

## Bir özelliğe bakın

{{ui:Select}} açıkken bir özelliğe tıklayın. **Özellikler** katmanını, hangi özellik olduğunu, şeklini (parçalar, delikler, köşe noktaları), yüksekliklerini, geldiği dosyayı ve o dosyanın koordinat sistemini, sonra tüm öznitelikleri bir tabloda gösterir. Öznitelikler salt okunurdur: CivilCraft GIS verilerini geldiği gibi gösterir, düzenlemez.

İşaretçinin altında hem nokta hem çizgi varsa nokta önceliklidir; bir çokgenin içinde en küçük çokgen seçilir.

## Yüzey için kullan

Bir katmanın menüsünü açın ve {{ui:Use for the surface…}} seçeneğini seçin (veya **Özellikler** içindeki düğmeyi). Sunulanlar katmana bağlıdır:

| Katman | Dönüşebilir |
|---|---|
| Yükseklikli çizgiler (3B çizgiler) | Kendi yükseklikleriyle kırılma çizgileri |
| Yüksekliksiz ama bir sayısal alanı olan çizgiler (konturlar) | Seçtiğiniz alandaki yükseklikte kırılma çizgileri |
| Çokgenler | Yüzey sınırı (seçili çokgen, yoksa en büyüğü) veya kenarları boyunca kırılma çizgileri |
| Yükseklikli noktalar veya bir yükseklik alanı olan noktalar | Katmanın adıyla tanımlanan ölçü noktaları; böylece bir nokta grubu oluştururlar |

Her kullanım, geometriyi projeye kopyalayan tek bir geri alma adımıdır; katman olduğu gibi kalır. Yükseklikler proje birimlerinde alınır.

## Enlem ve boylamlı nokta dosyaları

Üst bilgisinde **enlem** ve **boylam** sütunları (`lat`, `latitude`, `lon`, `long`, `longitude`) adlandıran bir nokta dosyası, kuzey ve doğu olarak değil, derece olarak okunur. İçe aktarma iletişim kutusu bunu söyler. {{ui:Import}} üzerinde noktalar projenin koordinat sistemine çevrilir; sistemi olmayan bir proje önce bunu seçmenizi ister. Dereceler asla feet olarak yüklenmez. ±90° enlem veya ±180° boylam dışındaki satırlar nedenleriyle reddedilir. Yükseklik sütunu olduğu gibi, proje birimlerinde alınır.

## Koordinat sistemi adlandıran LandXML dosyaları

Açtığınız bir LandXML dosyasında bir `CoordinateSystem` öğesi (bir EPSG kodu, bir WKT açıklaması veya bir sistem adı) varsa, CivilCraft bunu projenin koordinat sistemi olarak önerir. Kabul ederseniz hiçbir şey hareket etmez; sistem yalnızca sayıların ne anlama geldiğini söyler.

## Neler kontrol edildi

- Her okuyucu, çoğu GIS programının bu dosyaları okumak için kullandığı kütüphane olan GDAL ile, GDAL'in yazdığı dosyalar üzerinde karşılaştırıldı: yükseklikli ve yükseklikisiz her türde shapefile, çok parçalı çizgiler, delikli çokgenler, boş geometriler, metin, sayı, tarih ve doğru/yanlış öznitelikleri, `.cpg` ile ve olmadan UTF-8 ve Windows-1252 metin, birden çok shapefile içeren bir zip, her geometri türünde GeoJSON ve dört tablolu bir GeoPackage. Her geometri, yükseklik ve öznitelik eşleşti.
- Enlem ve boylamdan ve UTM'den dönüştürülen konumlar PROJ'a (GDAL'in arkasındaki projeksiyon kütüphanesi) 3 mm'ye kadar eşleşti.
- Hasarlı dosyalar (kesik, boyutları yalan söyleyen, bozuk zip'ler, bozuk GeoPackage'lar) tek bir sade mesaj verir; hiçbir şey takılmaz.
- Burada anlatılanların hiçbiri henüz başka GIS programlarında açılmadı; dosya veritabanları, KML ve KMZ henüz okunmuyor (bkz. [Henüz yapılmadı](topic:not-built-yet)).
