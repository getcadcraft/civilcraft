---
title: Düşey boy kesiti tasarlayın
summary: Boy kesiti görünümünü açın, zeminden bir tasarım boy kesiti başlatın, PVI ekleyip sürükleyin, düşey eğri uzunluklarını ayarlayın ve eğimleri, K değerlerini ile yüksek ve alçak noktaları okuyun.
keywords: boy kesiti, düşey eksen, pvi, düşey eğri, eğim, k değeri, tepe, çukur, bvc, evc, boy kesiti görünümü, son zemin, fg, mevcut zemin boy kesiti, boy kesitinde özellik çizgileri, kesişmeler, izdüşüm, bordür, hendek, etiketler
from: dbb1f32d
---

Her eksenin bir tasarım boy kesiti vardır: düz eğimlerle birleştirilmiş bir PVI listesi (istasyon ve kot); uzunluğu olan her iç PVI'da simetrik bir parabolik düşey eğri bulunur. Mevcut zemin boy kesiti sizin için yüzeyden örneklenir.

## Boy kesiti görünümünü açın

1. Ekseni seçin (üzerine {{ui:Seç}} ile tıklayın).
2. {{key:R}}'a basın, araç çubuğunda {{ui:Boy kesiti}} öğesine tıklayın ya da sağ panelin altındaki {{ui:Boy kesiti görünümü}} öğesine tıklayın.
   Boy kesiti görünümü, planın altında, eksen boyunca mevcut zemin ile açılır. İki veya daha fazla eksen varsa, boy kesiti çubuğunun solundaki listeden birini seçin.

Görünüm önce tüm ekseni gösterir ve kotları paneli dolduracak şekilde gerer; abartma sol alt köşede yazılır, örneğin "Düşey abartma 10×".

## Boy kesitini yakınlaştırın ve kaydırın

- **Yakınlaştırma:** fare tekerleğini çevirin (veya bir dokunmatik yüzeyde çimdikleyin); görünüm imlecin olduğu yerden yakınlaşır. Yalnızca istasyonları yakınlaştırmak için {{key:Shift}}'e, yalnızca kotları yakınlaştırmak için {{key:Alt}}'a basılı tutun (bu, abartmayı değiştirir). Boy kesiti görünümü odaktayken artı ve eksi tuşları ortadan yakınlaştırır.
- **Kaydırma:** sağ ya da orta fare düğmesiyle sürükleyin veya bir dokunmatik yüzeyde iki parmakla kaydırın.
- **Sığdırma:** boy kesitine çift tıklayın veya tüm ekseni yeniden göstermek için {{key:F}}'ye basın.

Bir PVI'yı düzenlemek seçtiğiniz yakınlaştırmayı korur; sığdırmaya geri dönmez.

Boy kesiti boyunca imleci hareket ettirin: çubukta istasyon, zemin ve tasarım kotları, eğim ve oradaki kazı ya da dolgu gösterilir; planda eksen üzerinde bir nokta sizi takip eder.

## Tasarım boy kesitini başlatın

1. Sağ panelde **Tasarım boy kesiti** altında {{ui:Zeminden başlat}} öğesine tıklayın.
   Ekseninin iki ucunda, zemin üzerine iki PVI yerleştirilir ve tek bir düz eğimle birleştirilir. Durum çubuğu "Tasarım boy kesiti iki uçta zemine başlatıldı. Eğim kırılmaları eklemek için PVI ekle'yi açın ve tabloda bir eğri uzunluğu verin." yazar.

Eksenin altında zemin yoksa "Bu eksenin altında başlanacak zemin yok." uyarısı görürsünüz. O zaman bunun yerine tıklayarak PVI ekleyin (sonraki bölüm).

## PVI ekleyin

1. {{key:I}}'ye basın veya boy kesiti çubuğundaki {{ui:PVI ekle}} öğesine tıklayın. Düğme basılı kalır.
2. Eğim kırılmasını istediğiniz yere boy kesitinde tıklayın. Bir PVI, o istasyon ve kotta 0.01'e yuvarlanarak eklenir ve seçilir.
3. İhtiyacınız kadar ekleyin, sonra eklemeyi durdurmak için {{key:I}}'ye yeniden basın.

Zaten bir PVI'nın olduğu yere tıklamak reddedilir ("… konumunda zaten bir PVI var."). PVI'lar her zaman istasyon sırasında kalır.

## Eklerken veya sürüklerken yakalama

Boy kesiti çubuğundaki **Yakala** düğmesi başlangıçta açıktır. Açıkken eklediğiniz ya da sürüklediğiniz bir PVI, en yakın PVI'ya, zemin noktasına, PVI istasyonuna ya da zemin çizgisine oturur ve işaretçinin yanındaki bir etiket hangisi olduğunu söyler. Serbest bir nokta için, herhangi bir yerde {{key:Alt}}'a basılı tutun.

## PVI'ları ayarlayın

- Boy kesitinde bir PVI'yı **sürükleyerek** taşıyın. Komşularının yanından geçemez. Taşıma tek bir geri alma adımıdır.
- Sağ paneldeki PVI tablosuna tam değerler **yazın**: **İstasyon**, **Kot**, **Eğim %** ve **Eğri L** (düşey eğri uzunluğu). Her birinden sonra {{key:Enter}}'a basın.
- Boy kesitinden bir değer **seçin**: bir PVI'nın istasyonunun veya kotunun yanındaki küçük düğme, boy kesiti görünümünde bir tıklama bekler ve o değeri doldurur. Tıklama, PVI ekleme gibi yakalanır; serbest bir nokta için {{key:Alt}}'a basılı tutun; iptal için {{key:Esc}}.
- **Eğim %**, o PVI'da başlayıp bir sonrakine giden teğetin eğimidir. Bunu yazmak **sonraki** PVI'nın kotunu taşır (istasyonu hiç değişmez). Sonraki PVI kilitliyse, bunun yerine önceki PVI'nın kotu taşınır.
- Bir PVI'yı, satırının sonundaki kilit simgesiyle **kilitleyin**. Kilitli bir PVI sürüklenmez ve eğim düzenlemesi onu taşımaz. Bir teğetin iki ucu da kilitliyse eğimi değişemez: durum çubuğu bunu söyler ve önce bir ucun kilidini açmanız gerekir. Kilit dosyada saklanır.
- Bir PVI'yı, satırının sonundaki x ile **kaldırın** ya da onu seçip (tıklayarak) {{key:Delete}}'e basın. Boy kesiti görünümü odaktayken {{key:Backspace}} de onu kaldırır.

İlk ve son PVI asla eğri almaz.

## Düşey eğriler

1. Bir iç PVI için **Eğri L**'ye bir uzunluk yazın, örneğin 200.
2. Eğri, PVI'nın üzerinde ortalanmış olarak çizilir. Boy kesiti ve sağ panel türünü (tepe ya da çukur), L ve K değerlerini, BVC ve EVC istasyonlarını ve kotlarını ve eğrinin içinde varsa yüksek ya da alçak noktasını gösterir.

K, L'den hesaplanır (K = L, eğimlerin cebirsel farkına bölünür, yüzde cinsinden). L'yi siz yazarsınız; K'yı doğrudan yazmak henüz kullanılamaz.

Düşey bir eğri sığmazsa kırmızı bir kutu nedenini söyler: önündeki PVI'ya veya eğriye geri uzanır ya da sonraki PVI'yı geçer ve o taraftaki yer miktarını söyler (bir eğri, PVI'sının her iki tarafında kendi uzunluğunun yarısını ister). Düğmesi, K ile birlikte **sığan en uzun eğriyi** tek adımda ayarlar ({{key:Mod+Z}} geri alır). Ya da PVI'ları birbirinden uzaklaştırın.

## Bilgileri okuyun

PVI tablosunun altındaki bir liste, her eğimi yüzde olarak verir ("Eğim 1: +1.25%") ve her eğriyi, örneğin "2+00.00'da tepe: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", ardından "Yüksek nokta 1+62.40, 254.12".

PVI'lar ekseninin her iki ucuna ulaşmazsa bir not bunu söyler. Bir koridor yalnızca boy kesiti ile eksenin çakıştığı yerde oluşturulur.

## Boy kesitindeki özellik çizgileri

Özellik çizgileri boy kesiti görünümünde de gösterilir; böylece bir bordürü, bir hendeği ya da bir duvarın üstünü yolun boy kesitine karşı görebilirsiniz.

- Bir özellik çizgisi ekseni **kestiğinde**, boy kesiti o istasyon ve kotta küçük bir elmas gösterir; etiketinde çizginin adı ve oradaki kotu yazar (çizginin kendi kotu, kesişen parça boyunca hesaplanır).
- Eksenin yakınında **yanından geçen** özellik çizgilerini de çizmek için {{ui:Yanında, içinde}} alanına bir mesafe yazın; bunlar kendi kotlarında kesikli çizgiler olarak çizilir. Boş ya da 0 yazılırsa yalnızca kesişmeler gösterilir.
- İşaretler ve etiketler her değişikliği izler: bir köşeyi taşıyın, bir eğim yazın ya da çizgiyi yükseltin; boy kesiti yeni kotları hemen gösterir.
- Bir kesişme elmasına tıklayarak o özellik çizgisini seçin; seçili çizgi vurgu rengiyle çizilir.
- Boy kesiti çubuğundaki {{ui:Özellik çizgileri}} hepsini gizler ya da gösterir. Her iki ayar da proje ile birlikte kaydedilir.

Bkz. [Özellik çizgileri](topic:feature-lines).

## Sonraki

- Bu ekseni ve bu boy kesitini kullanarak [Yol koridorunu süpürün](topic:corridor).
- Boy kesiti, ekseniyle birlikte LandXML'e yazılır; bkz. [LandXML alışverişi](topic:landxml).
