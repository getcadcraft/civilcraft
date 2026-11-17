---
title: Demiryolu hattı tasarlayın
summary: Bir ekseni demiryoluna dönüştürün: ray geçişleri (klotoid, kübik parabol, Bloss, Helmert, sinüs yarım dalga, sinüs), her eğride denge dış yüksekliği ile dış yükseklik, eksiklik ve fazlalık, uyarı olarak dış yükseklik ve hat geometrisi sınırları, istasyona göre makaslar ve çapraz geçişler, hat boyunca süpürülen bir serbest geçiş zarfı ve koridor olarak inşa edilen raylar, traversler ve balast yataklı bir hat; plan, kesit, boy kesiti, 3B ve miktarlarda.
keywords: demiryolu, ray, hat, tren, metro, tramvay, dış yükseklik, süperelevasyon, dış yükseklik eksikliği, dış yükseklik fazlalığı, denge dış yüksekliği, geçiş, geçiş eğrisi, klotoid, kübik parabol, bloss, helmert, sinüs yarım dalga, kosinüs, ray aralığı, standart ray aralığı, geniş hat, metre hat, dar hat, travers, balast, alt balast, yol zemini, bankuet, hat merkezleri, 60E1, 54E1, UIC60, 115RE, 136RE, dış yükseklik eğimi, dış yükseklik değişim oranı, makas, makas dili, çapraz geçiş, kalp, kalp numarası, kapanma eğrisi, ayrılan hız, serbest geçiş, serbest geçiş zarfı, yapı ölçüsü, yükleme ölçüsü, kinematik zarf, peron, peron aralığı, hat aralığı, eğim, düşey eğri, minimum yarıçap, LandXML dış yükseklik
from: 99de9745
---

Her eksen bir demiryolu hattı olabilir. Bu durumda eğrilerine ray geçişleri ve bir dış yükseklik (rayların süperelevasyonu) verilir; koridoru bir hat olarak inşa edilir: traversler üzerinde raylar, balast yatağı üzerinde, bir yol gibi arazinin içine eğimli olarak. Makaslar ve çapraz geçişler istasyona göre yerleştirilir; bu hat boyunca bir serbest geçiş zarfı süpürülebilir ve yanındaki nesnelere karşı kontrol edilebilir.

Aşağıdaki her sayı bir **yer tutucu**dur, bir standart değildir. Demiryolları sınırlarını hat hızına, hat tipine ve ülkeye göre belirler; bunları kendi demiryolu standardınızdan belirleyin. CivilCraft hiçbir ulusal tabloyu içermez.

## Ekseni bir demiryolu yapın

1. Ekseni seçin ve **Özellikler** içinde **Demiryolu** bölümünü bulun.
2. **Bu eksen bir demiryolu hattıdır** kutusunu işaretleyin. Her değişiklik bir geri alma adımıdır.
3. Eksenin **Özellikler** panelinin üstünde **Tasarım hızı**nı ayarlayın: dış yükseklik buna göre denetlenen hat hızıdır. **En yavaş trenler** (Demiryolu bloğunda) dış yükseklik fazlalığının denetlendiği hızdır.

## Geçişler

Her eğriye PI tablosunda her iki ucunda bir spiral uzunluğu verin (**Giriş spirali**, **Çıkış spirali**), sonra Demiryolu bloğunun eğri tablosunda türünü seçin ya da **Her eğri için geçiş**i kullanın:

| Tür | Geçiş boyunca eğrilik |
|---|---|
| Klotoid | eşit biçimde artar (yol spiralinin aynısı) |
| Kübik parabol | y = x³ / (6·R·L), L teğet boyunca ölçülür; eğri kendisi biraz daha uzundur |
| Bloss | tam eğriliğin 3u² − 2u³'ü (u = uzunluğun payı): yumuşak başlar ve biter |
| Helmert | iki parabol, önce 2u², sonra 1 − 2(1 − u)² |
| Sinüs yarım dalga | (1 − cos πu) / 2 |
| Sinüs | u − sin(2πu) / 2π |

Kübik parabol dışındaki tüm türler, klotoid gibi L / 2R kadar döner. İstasyonlar gerçek uzunluk boyunca sayılır. LandXML türü korur (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Dış yükseklik

Her eğrinin **Dış yükseklik**ini milimetre cinsinden girin. Tablo her eğri için şunu gösterir:

- **Denge dış yüksekliği** = G·v² / (g·R); G, rayların merkezleri arasındaki mesafedir (**Ray merkezleri**, siz yazmadığınız sürece ray aralığı artı rayın baş genişliği). G = 1500 mm ise bu tanıdık 11.8·V² / R'dir (V km/sa, R m cinsinden).
- **Eksiklik** = hat hızındaki denge − uygulanan dış yükseklik.
- **Fazlalık** = uygulanan dış yükseklik − en yavaş trenlerin hızındaki denge.
- **Rampa**: rampaları boyunca en dik dış yükseklik eğimi, metre başına milimetre olarak.

Dış yükseklik her geçiş boyunca artar; eğriliğinin şeklini izler: klotoid ya da kübik parabol için doğrusal, Bloss için Bloss biçiminde vb. Geçişi olmayan bir eğri ucu, dış yükseklik eğimi sınırının gerektirdiği kadar, önündeki düz kısımda rampalanır ve bunu belirtir: dış yükseklik o zaman eğriliğin değişmediği yerde değişir.

**Dış yükseklik dönüşü** hangi rayın tasarım boy kesitinde kalacağını belirtir: **alçak ray** (olağan), **iç ray** ya da **hat merkezi** (her ray dış yüksekliğin yarısı kadar hareket eder). Tasarım boy kesiti oradaki ray üst yüzüdür.

**Dış yükseklik diyagramı** her rayın yüksekliğini istasyonlar boyunca boy kesitinin üzerine çizer; boy kesiti görünümü ile plan ve boy kesiti sayfaları da aynısını boy kesitinin altında bir bant olarak alır.

## Dış yükseklik sınırları ve uyarılar

**En çok uygulanan dış yükseklik**, **En çok dış yükseklik eksikliği**, **En çok dış yükseklik fazlalığı**, **En dik dış yükseklik eğimi** ve **En hızlı dış yükseklik değişimi** (hat hızındaki eğim, mm/sn) her eğride denetlenir. Bir sınırın üzerindeki değer, Demiryolu bloğunda ve Sorunlar panelinde sınır ve bulunan değerle birlikte bir uyarıdır. Tasarım hızı yoksa eksiklik ve değişim oranı denetlenmez (bunu belirten bir not gösterilir).

## Hat

**Ray aralığı**'nı ayarlayın (standart 1435 mm, geniş, metre ya da dar hazır ayarlar ya da kendi değeriniz), **Ray kesiti** (60E1, 54E1, 49E1, 115RE, 136RE: yalnızca yayımlanmış boyutları), **Hat** sayısı ve **Hat merkezleri**, ardından **Travers ve balast**: travers malzemesi, uzunluk, genişlik, derinlik ve aralık; travers altındaki balast derinliği (alçak rayda), bankuet, eğim, üst kısmının traversin ne kadar altında olduğu; alt balast derinliği, balast ayağının ötesindeki bankuet ve yol zemininin enine eğimi.

**Hattı oluştur**'a basın. Eksenin koridoruna, tasarım boy kesiti boyunca bir hat olarak uygulanır: raylar ve traversler dış yükseklikle eğilir, yol zemini eğilmez. Yarma eğimleri bankuet kenarından koridorun kazı ve dolgu şevlerine doğru uzanır ve hat, önerilen yüzeye bir yol gibi oturur.

- **Plan**: her hattın iki rayı (katman C-RAIL-TRAK) ve birden fazla hat varsa her hattın merkezi (C-RAIL-CNTR); ekranda, DXF, DWG, PDF'de ve plan ve boy kesiti sayfalarında.
- **Kesitler**: her kesitte traversler, raylar, balast ve alt balastın alt yüzeyleri.
- **3B**: raylar, her travers ve balast yatağı (Göster › Hat); GLB, OBJ ve USD olarak da.
- **Miktarlar**: hat uzunluğu, ray (her hattın iki rayı, her hattın kendi hattı boyunca), traversler, balast yatağı ve traverslerin çıkarıldığı balast ve alt balast, kesitler arasında ortalama uç alanlarıyla.

## Hat geometrisi denetimleri

Dış yükseklik yanında Demiryolu bloğu hattın kendisini altı sınıra daha karşı denetler (hepsi yer tutucu, hepsi sizin ayarlayacağınız):

- Tasarım boy kesitinin **en dik eğimi**, metre başına mm.
- **En küçük düşey eğri yarıçapı**, bir k katsayısı olarak R ≥ k·V² (R metre, V km/sa). İki eğim arasındaki L uzunluklu parabolik bir düşey eğrinin yarıçapı, L'nin eğim değişimine bölümüdür.
- **En kısa düşey eğri**.
- **Plandaki en küçük eğri yarıçapı** (0 denetimi kapatır).
- **En kısa yay ya da düz kısım**, hat hızında seyahat saniyesi olarak: bir dairesel yay ya da iki eğri arasındaki düz kısım bu mesafeden kısaysa uyarılır. 1.8 sn, tanıdık "km/sa cinsinden hızın yarısı, metre olarak" kuralına karşılık gelir.
- **Her geçiş boyunca dış yükseklik eksikliği değişim oranı**, hat hızında mm/sn.

**Hat geometrisi** bulunan en dik eğimi ve her düşey eğriyi yarıçapı ve hat hızının gerektirdiği yarıçapla listeler. Bir geçiş ya da dış yükseklik rampası üzerinde yer alan düşey eğri bir not alır. Tasarım boy kesiti ya da tasarım hızı yoksa, bunlara ihtiyaç duyan denetimler atlanır ve bir not bunu belirtir.

## Makaslar ve çapraz geçişler

**Makaslar ve çapraz geçişler** altında **Makas ekle**ye basın. En uzun düz kısma yerleştirilir; tabloda ayarlayın:

- **Makas dili istasyonu**: makasın bu eksende başladığı yer.
- **Kalp**: kalp numarası N (1:N). Kalp açısı 2·atan(1 / 2N).
- **Taraf**: sol ya da sağ, istasyon artışına bakarak.
- **Çapraz geçiş aralığı** metre cinsinden: 0'dan büyükse makas, o uzaklıktaki paralel bir hata çapraz geçişe dönüşür (iki makas ve aralarındaki düz kısım).

Tablo **Makas uzunluğu** (makas dilinden kalbe), kapanma eğrisinin **Yarıçapı** ve bu yarıçapın, sizin eksiklik sınırınız ve dış yükseklik olmadan izin verdiği **Ayrılan hız**ı gösterir. **Hattını yap** ayrılan güzergâhı kendi ekseni haline getirir (makas, kapanma eğrisi, sonra kalp açısında düz devam) ve aynı demiryolu ayarlarıyla, uzatılmaya hazır olarak.

Plan, her makasın iki ayrılan rayını, merkez çizgisini, makas dilinde ve kalpte bir işareti ve "1:N"yi (katman C-RAIL-TURN) ekranda ve DXF, DWG, PDF ve sayfalarda çizer. 3B görünüm ayrılan rayları ana hattın seviyesinde çizer.

Biçim bir **yer tutucu**dur: düz bir makas ve kalp numarasından bir kapanma eğrisi. Yapılan bir makas, demiryolunun standardını ve üreticinin çizimini izler. Uyarılar: eksenin dışına çıkan, bir eğri, geçiş, dış yükseklik ya da düşey eğri üzerinde duran ya da başka birinin üzerine binen makas; ve hat hızı makasın ayrılan hızının üzerindeyse bir not.

## Serbest geçiş zarfı

**Bu hat boyunca serbest geçiş zarfını süpür**'ü işaretleyin. **Dış hat** seçin (iki yer tutucu biçim ya da **Kendi dış hattınız**, bir noktada bir satır olarak yazılır: hat merkezinden ofset, sonra ray üst yüzeyinden yükseklik, metre cinsinden), **Araç uzunluğu** ve **Bojiler arası mesafe** ve varsa **Peron kenarı** (taraf, hat merkezinden mesafe, raydan yükseklik).

Her istasyonda dış hat, dış yükseklikle alçak ray etrafında eğilir ve eğri nedeniyle genişler: aracın ortası b² / 8R kadar içeri, uçları (L² − b²) / 8R kadar dışarı hareket eder (b bojiler arası mesafe, L araç uzunluğu, R oradaki yarıçap, geçişi izler). Blok, düz kısımda ve en geniş olduğu yerde kesiti çizer ve şunları listeler:

- **en geniş zarf** ve nerede,
- **hat merkezleri**, komşu iki zarfın gerektirdiği merkezlerle karşılaştırılmış,
- **peron kenarındaki** kalan boşluk ya da ne kadar içeride olduğu,
- **zarfın içinde** bulunan her özellik çizgisi, boru yapısı ve başka bir demiryolu ekseni.

Yükseklikleri olan bir özellik çizgisi, rayın üstündeki yüksekliğinde dış hatla değerlendirilir; tasarım boy kesiti yoksa ya da yüksekliği olmayan bir nokta için yalnızca planda değerlendirilir ve liste bunu belirtir. Plan, zarfın iki kenarını (katman C-RAIL-CLRN) ve içindeki her şeyin üzerine bir çarpı işaretini gösterir.

Sunulan dış hatlar **yer tutucudur, herhangi bir demiryolunun ray aralığı değildir**. Bir sonuca güvenmeden önce demiryolunuzun yapı ölçüsünü yazın.

## Diğer programlarda

- **LandXML**: demiryolu ekseni geçişleriyle (spiType) ve bir `Cant` bloğuyla yazılır: ray aralığı, dönme noktası, hat hızı ve her dış yükseklik rampasının başladığı ve bittiği bir istasyon, uygulanan dış yükseklik, denge dış yüksekliği ve eksiklikle. `Cant` bloğu olan bir LandXML dosyası açmak o ekseni bu dış yüksekliklerle bir demiryoluna dönüştürür.
- **IFC**: dış yükseklik segmentleriyle eksen, raylar, traversler, balast ve alt balast.

## Henüz yapılmadı

IFC dışa aktarımında makaslar; tek kapanma eğrisinin ötesindeki makas aileleri (eğri makaslar, salıncak burunlu kalpler, kaymalar, elmas); kinematik ölçü kuralları (zarf, eğri savrulmasıyla sabit bir dış hattır); üst hatlar ve sinyalizasyon.

**Hangi standart.** Demiryolu bloğunda, **Atıf yapılacak standart** Yok ya da Avrupa (UIC ve EN) seçer. Avrupa seçmek, bir Avrupa projesinin atıf yaptığı belgeleri adlandırır (hizalama parametreleri için EN 13803, makas ve geçitler için EN 13232, ölçüler için EN 15273, hat geometrisi kalitesi için EN 13848) ve her sınıra, geldiği maddeyi yazmak için bir kutu verir. Hiçbir standardın sayısı yerleşik değildir: dış yükseklik, eksiklik, fazlalık, eğim ve değişim sınırları, makas geometrisi ve yapı ölçüsü hâlâ yer tutucudur ve pencere bunu söyler. Bir demiryolu mühendisi her değeri standardın kendi metnine göre denetler ve inşa edilmeden önce yanına maddeyi yazar. Güney Afrika ve AREMA tabloları bu sürümde yoktur.
