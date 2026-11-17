---
title: Nehir su yüzeyi profilleri
summary: Bir nehri arazi yüzeyinden modelleyin ve standart adım yöntemiyle kararlı su yüzeyi profillerini hesaplayın: su seviyeleri, enerji, hızlar, Froude sayıları ve plandaki taşkın yayılımı. Bir laboratuvar özelliği; her sonuç bir mühendisin incelemesini gerektirir.
keywords: set, etkisiz akış alanı, kesit düzenleyici, nehir, hidrolik, su yüzeyi profili, geri tepme, standart adım, kararlı akış, 1d, enine kesitler, manning, pürüzlülük, iletim, kritik derinlik, normal derinlik, froude, enerji eğimi hattı, taşkın yayılımı, taşkın yatağı, su baskını, kıyı istasyonları, kesim uzunlukları, daralma, genişleme, kritik altı, kritik üstü, karışık rejim, hidrolik sıçrama
from: fb8bf425
---

CivilCraft bir nehir boyunca kararlı, tek boyutlu su yüzeyi profillerini hesaplar: verdiğiniz her debi için, komşu kesitler arasındaki enerji dengesinden her enine kesitteki su seviyesi (standart adım yöntemi). Kontrol edilirken laboratuvardadır.

**Yalnızca tasarım yardımcısı.** Su seviyelerine kimse güvenmeden önce nitelikli bir mühendisin incelemesi gerekir: bir 1B model yalnızca kesitleri, pürüzlülük değerleri, kesim uzunlukları ve sınırları kadar iyidir ve köprüleri, menfezleri ya da nehirden ayrılan akışı bilmez.

## Nehri çizin

1. Önce mevcut arazi yüzeyini oluşturun (noktalar, kırılma çizgileri ya da açtığınız bir TIN).
2. **Yüzey** › {{ui:More}} altında {{ui:River}} seçin.
3. Nehrin merkez çizgisi boyunca **savaktan mansaba doğru** tıklayın, sonra {{key:Enter}}'a basın ya da çift tıklayın.

CivilCraft, merkez çizgisine dik olarak her 50 m'de (200 ft) bir kesit alır; her iki yana 100 m (300 ft) kadar, arazeden. Nehir istasyonları mansap ucundan ölçülür, bu yüzden savağa doğru artar. Kıyılar, her kesitin en alçak noktasının her iki yanında 10 m (30 ft) uzaklıkta bir tahminle başlar.

Nehrin daraldığı ya da bir yapının bulunduğu yere kesit eklemek için nehri seçin, {{ui:Add a section}}'a tıklayın ve üzerinden bir kesme çizgisi çizin (her iki yönde de olur: mansaba bakarken soldan sağa gidecek şekilde çevrilir).

## Nehri kurun

Özelliklerinde görmek için nehri seçin:

- **Akış rejimi**: kritik altı (olağan durum: mansap sınırından savağa doğru hesaplanır), kritik üstü (savak sınırından mansaba doğru hesaplanır) ya da karışık (ikisi de, sonra her kesitte daha büyük özgül kuvvete sahip olan; bir önizleme).
- **Akış profilleri**: her biri için bir ad ve bir debi (örneğin 10 yıllık ve 100 yıllık debi) ve mansap ucundaki sınır (rejim kritik altı olmadığında ayrıca savak ucundaki): bir enerji eğimiyle **Normal derinlik** (yatak eğimi ilk tahmindir), bir **Bilinen su yüzeyi** kotu ya da **Kritik derinlik**.
- **Araziden kesitler**: aralık, sola ve sağa ne kadar uzandığı, kıyı tahmini ve iki Manning n değeri; {{ui:Cut sections again}} kesitleri yeniden oluşturur (bir geri alma adımı).
- **Kesitler tablosu**: her kesit için sol ve sağ kıyı ofsetleri, kanal n ve taşkın yatağı n, mansaptaki sonraki kesite kadar kesim uzunlukları (sol taşkın yatağı, kanal, sağ taşkın yatağı; başlamak için plandan ölçülür) ve daralma ve genişleme katsayıları (başlangıç için 0.1 ve 0.3: kademeli geçişler). {{ui:Edit}} kesit düzenleyiciyi açar (bir sonraki); yanında bir nokta, kesitte bir set ya da etkisiz alan olduğunu gösterir.

Her değişiklik bir geri alma adımıdır ({{key:Mod+Z}}).

## Bir kesiti düzenleyin: kıyılar, setler ve etkisiz alanlar

Bir kesitteki {{ui:Edit}} arazisini çizer ve çözücünün okuduğu şeyleri sürüklemenize izin verir: **sol ve sağ kıyı** (kesiti sol taşkın yatağına, ana kanala ve sağ taşkın yatağına böler), her iki yanda bir **set** ve **etkisiz akış alanları**. Her tutamaç ok tuşlarıyla da taşınabilir ve her sayı grafiğin yanına yazılabilir. {{ui:Apply}} bir geri alma adımıdır.

- Bir **set**'in bir yeri (ofset) ve bir taç kotu vardır. Setin ötesindeki, nehirden uzak arazi, su yüzeyi taçın altındayken nehirden ayrılır: alanı, ıslak çevresi ve iletimi hesaba katılmaz. Tacın üstünde tüm kesit yeniden sayılır. Bir set, koruduğu kıyının dışında durur; kıyıların içindeki bir set işaretlenir.
- Bir **etkisiz akış alanı** su tutar ama akış taşımaz (bir dolgunun arkasındaki bir cep, bir köprü yaklaşımının yanındaki ölü su). İki ofsetini verin ve isterseniz, altında etkisiz olduğu bir su seviyesi ({{ui:always}}, boşken): o seviyenin üzerinde diğerleri gibi akar. Ana kanalın bir kısmını kaplayan bir alan işaretlenir.
- İki kesit arasında taşkın yayılımı, her iki kesitin de sahip olduğu bir setin arkasındaki kuru arazi bırakır; su yüzeyi orada tacın altındayken (iki taç arasındaki çizgi düzdür).

## Sonuçları hesaplayın ve okuyun

{{ui:Water surface profiles}}'a tıklayın. Seçtiğiniz profil için şunları alırsınız:

- nehir boyunca bir **grafik** (akış soldan sağa): kanal tabanı, kıyılar, su yüzeyi, enerji eğimi hattı ve kritik su yüzeyi; kritik derinlikte tutulan kesitler daire içine alınır;
- kesit başına bir **tablo**: nehir istasyonu, debi, kanal tabanı, su yüzeyi, kritik su yüzeyi, enerji eğimi hattı, derinlik, kanaldaki ve genel hız, kanal Froude sayısı, akış alanı, üst genişlik, her taşkın yatağındaki ve kanaldaki debi, enerji eğimi ve uyarılar;
- düz sözlerle **uyarılar**, örneğin kritik derinliğe ayarlanmış bir kesit, bir kesitin uçlarının üzerindeki su ya da iki kesit arasında büyük bir iletim değişimi (aralarına kesit ekleyin).

{{ui:Table (CSV)}}, {{ui:Report}} (yöntemi, sınırları ve her tabloyu içeren düz metin) ve {{ui:Plot (SVG)}} indirilenlere kaydeder. Her biri inceleme satırını taşır.

Plan üzerinde seçili profil için ıslak alanı gölgelendirmek üzere **Özelliklerde** {{ui:Show the flood extent}} kutusunu işaretleyin; derinliğin sıfır olduğu yerde su hattı çizilir. Kesitler arasında su yüzeyi nehir boyunca düzdür ve nehir istasyonuyla doğrusal olarak değişir. Su, setin kotunun altındayken setin arkasındaki arazi kuru bırakılır. Nehrin koridorunun içinde suyun ulaşamadığı diğer alçak arazi (örneğin bir yol dolgusunun arkasında) yine de gölgelendirilir: kontrol edin.

## Çizimde ve Sorunlar'da

Nehrin çizgileri kendi katmanlarında plana, PDF'ye ve DWG'ye gider: **C-WATR-CNTR** (merkez çizgisi), **C-WATR-SCTN** (her kesme çizgisi, nehir istasyonuyla) ve **C-WATR-FLOD** (taşkın yayılımının su hattı, bir profil için {{ui:Show the flood extent}} işaretliyse). Nehrin uyarıları (kritik derinliğe ayarlanmış bir kesit, kesit uçlarının üzerindeki su, daha fazla kesit isteyen bir iletim değişimi, kapanmamış bir enerji dengesi, kıyıların içindeki bir set), nehirle ilgili olarak ve geldikleri kesitte yerleştirilmiş olarak **Sorunlar** paneline de gider.

## Nasıl hesaplanır

- İki kesit arasındaki enerji: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Alt bölümlere göre iletim: her taşkın yatağı n'sinin değiştiği yerde bölünür, K = Σ (1/n)·A·R^(2/3) (ABD birimlerinde 1.486/n); kanal tek bir parçadır, n değiştiğinde bileşik bir n ile. α, iletimin nasıl bölündüğünden gelir.
- Akış ağırlıklı kesim uzunluğu üzerinde ortalama iletimle sürtünme eğimi, Sf = ((Q₁ + Q₂)/(K₁ + K₂))².
- Akış mansaba doğru hızlandığında daralma katsayısı, yavaşladığında genişleme katsayısı.
- Kritik derinlik = en küçük özgül enerji. Her su seviyesi bir aralıkta çözülür, bu yüzden hiçbir zaman kritiğin yanlış tarafına atlamaz; cevap yoksa kritik derinliğe ayarlanır ve işaretlenir.

Program, Manning'in normal derinliğine, dikdörtgen kanalda kritik derinliğe ve Chow'un geri tepme örneğine karşı kontrol edilmiştir (*Open-Channel Hydraulics*, 1959, bölüm 10), bağımsız olarak entegre edilmiştir. Aynı yöntem yaygın 1B nehir programlarında kullanılır, bu yüzden el hesabı ya da bir öğrencinin notları taşınabilir.

## Menfezler ve köprüler

Nehrin **Özelliklerinde**, **Menfezler ve köprüler** altında {{ui:Add a culvert}} ya da {{ui:Add a bridge}}, iki kesit arasına bir tane koyar (her bölüm en az iki kesit tutar). Altındaki profil değişmez; hemen üstündeki su yüzeyi yapıdan gelir ve profil oradan savağa doğru devam eder. **Sonuçlar**, her yapının bir tablosunu ekler: kuyruk suyu, savak su seviyesi, hangi kontrolün geçerli olduğu, açıklıktan geçen debi ve yol ya da güverte üzerinden akan debi. Yalnızca kritik altı akış.

- **Menfez** (kutu ya da yuvarlak, bir ya da daha fazla eşit namlu). Giriş kontrolü, giriş serbestken savak akışı, boğulduğunda orifis akışıdır; savak su seviyesinin bir ile bir buçuk kat yükseklik arasında karıştırılır. Çıkış kontrolü enerji dengesidir: giriş kaybı, sürtünme ve çıkış hız yükü; kuyruk suyunun ve kritik derinliğin orta yüksekliğinin ve tepenin üstü olanı üzerinden, namlu boyunca düşüşten çıkarılarak. Savak su seviyesi ikisinin büyüğüdür. **Suyun yol üzerinden geçmesine izin ver** kutusunu işaretleyin; yolun savak akışı akışı namlularla paylaşır.
- **Köprü.** Açıklık, köprünün altındaki kesittir, payandalarda kesilmiş; her ayak akış taşımayan bir alan olarak. Açıklıktaki su yüzeyi alttaki kesitten gelir (genişleme katsayısı), üstteki kesit ise açıklıktan (daralma katsayısı). Açıklık o kuyruk suyunda akışı geçiremezse kritik derinlikte çalışır ve köprü tıkanma olarak işaretlenir. Su alt başlığa ulaşırsa akış basınçlı akıştır (kuyruk suyu alt başlığın altındayken sürgü tipi, üstündeyken boğulmuş); güverte üzerindeki su savak akışı ekler; üst kot, bunların akışa eşit olduğu seviyedir.

Katsayılar (deşarj, giriş kaybı, savak) yuvarlak sayılı varsayılanlardır. Tasarımınız için değiştirin. Menfez tasarım kılavuzlarının bastığı uydurulmuş grafikler değildir, bu yüzden bir menfezin savağını sınırına yakın bir tahmin olarak ele alın. Bir yol ya da güverte üzerindeki su, boğulmuş bir giriş, tıkanmış bir açıklık ve bir namlu içindeki hızlı akış **Sorunlar** içinde gösterilir.

## Kararsız akış

Nehrin **Özelliklerindeki** {{ui:Unsteady flow…}}, bir taşkın hidrografını kesitler boyunca yönlendirir. Girişi saat ve debi olarak yazın, satır başına bir çift, mansap eğimi (normal derinlik) ve ne kadar çalışacağı. İlk debideki kararlı su yüzeyinden başlar ve tam tek boyutlu denklemleri çözer (zamanda 0.6 ağırlıklı örtük dört nokta şeması). Her kesitte, her birinin gerçekleştiği saatle birlikte tepe su seviyesini ve debiyi, iki ucundaki debinin grafiğini ve hacim kontrolünü (giren, çıkan ve depolanan değişim) alırsınız. Kararlı akışın kararlı kaldığı, girişteki bir basamağın yeni debinin kararlı profilinde sona erdiği, hacmin kapandığı ve taşkın dalgasının hızının kinematik dalgaya karşı denetlendiği kontrol edilir. Kritik altı akış, tek kesim, yan giriş yok ve çalışma içinde menfez ya da köprü yok.

## Birleşimler

Akışları tek bir çıkışa birleştiren kesimler: debiler toplanır ve birleşen kesimlerin başına kadar, mansap kesiminin başındaki su yüzeyi taşınır (birleşimde aynı su yüzeyi, basit yöntem: açı yok, momentum yok, bu yüzden düşük Froude sayılarına uygundur). Model ve testler `river-structures.js` içinde yer alır; haritada iki nehri birleştirmek için bir panel henüz yapılmadı.

## Henüz yapılmadı

Kendi yapıları olarak savaklar ve kapaklar, birleşimler için bir panel, kararsız bir çalışma içindeki yapılar ve kritik üstü kararsız akış. Karışık rejim çalışması iki kesit arasında bir hidrolik sıçramayı işaretler ama yerleştirmez.

**Nehirlerin birleştiği yer.** Bir nehrin Özelliklerinde, "Şuraya akar" birleştiği nehri adlandırır. Birleşen nehirler birlikte çözülür: akıldığı nehir, debilerinin toplamını taşır ve her biri o nehrin ilk kesitinin su yüzeyinde biter (eşit su yüzeyi yöntemi; akışların açısını ve momentumunu hariç tutar). Bir ana nehri ve bir deresi birleştirmek için, birleşimin altına kısa bir nehir çizin ve ikisinin de ona akmasını sağlayın. Sonuçlar bir birleşim tablosu gösterir. Bu sonuçlardaki varsayılanlar (daralma 0.1, genişleme 0.3, bileşik pürüzlülüklü tek parça kanal, özgül kuvvete göre karışık rejim) bir mühendis incelemesine kadar kalır ve Sonuçlar bunu söyler.
