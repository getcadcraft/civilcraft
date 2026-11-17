---
title: Dikey boy kesiti tasarlama
summary: Boy kesiti görünümünü açın, zeminden bir tasarım boy kesiti başlatın, PVI ekleyip sürükleyin, dikey eğri uzunluklarını ayarlayın ve eğimleri, K değerlerini ve yüksek ile alçak noktaları okuyun.
keywords: boy kesiti, dikey eksen, pvi, dikey eğri, eğim, k değeri, tepe, çukur, bvc, evc, boy kesiti görünümü, bitmiş kot, fg, mevcut zemin boy kesiti, boy kesitinde özellik çizgileri, kesişmeler, izdüşüm, bordür, hendek, etiketler
from: e9182bfa
---

Her eksenin bir tasarım boy kesiti vardır: düz eğimlerle birleştirilmiş PVI'lerin (istasyon ve kot) bir listesi; uzunluğu olan her iç PVI'de simetrik parabolik bir dikey eğri bulunur. Mevcut zemin boy kesiti sizin için yüzeyden örneklenir.

## Boy kesiti görünümünü açın

1. Ekseni seçin ({{ui:Seç}} ile tıklayın).
2. {{key:R}} tuşuna basın ya da araç çubuğunda {{ui:Boy kesiti}} ya da sağ panelin altındaki {{ui:Boy kesiti görünümü}} düğmesine tıklayın.
   Boy kesiti görünümü, plan altında açılır ve eksen boyunca mevcut zemini gösterir. İki veya daha fazla eksen varsa, boy kesiti çubuğunun solundaki listeden birini seçin.

Görünüm her zaman tüm ekseni gösterir ve kotları paneli dolduracak şekilde gerer; abartma sol alt köşede yazılır, örneğin "Dikey abartma 10×". Yakınlaştırma ya da kaydırma yapmaz.

İmleci boy kesiti boyunca hareket ettirin: çubuk istasyonu, zemin ve tasarım kotlarını, eğimi ve oradaki kazı ya da dolguyu gösterir; planda eksen üzerinde bir nokta sizi takip eder.

## Tasarım boy kesitini başlatın

1. Sağ panelde **Tasarım boy kesiti** altında {{ui:Zeminden başlat}} düğmesine tıklayın.
   Ekseninin iki ucunda zemine iki PVI yerleştirilir ve bir düz eğimle birleştirilir. Durum çubuğu şunu yazar: "Tasarım boy kesiti her iki uçta zeminden başlatıldı. Eğim kırılmaları eklemek için PVI ekle'yi açın ve tıklayın; tabloda bunlara bir eğri uzunluğu verin."

Eksen yüzeyi kesmiyorsa "Bu eksenin altında başlamak için zemin yok." uyarısını alırsınız. Bu durumda bunun yerine tıklayarak PVI ekleyin (sonraki bölüm).

## PVI ekleyin

1. {{key:I}} tuşuna basın ya da boy kesiti çubuğunda {{ui:PVI ekle}} düğmesine tıklayın. Basılı kalır.
2. İstediğiniz eğim kırılmasının olduğu yerde boy kesitine tıklayın. Bir PVI o istasyon ve kotta, 0.01'e yuvarlanarak eklenir ve seçilir.
3. İhtiyacınız kadar ekleyin, sonra eklemeyi durdurmak için {{key:I}} tuşuna tekrar basın.

Zaten bir PVI bulunan yere yapılan tıklama reddedilir ("… konumunda zaten bir PVI var"). PVI'ler her zaman istasyon sırasında kalır.

## PVI'leri ayarlayın

- Taşımak için boy kesitinde bir PVI'yi **sürükleyin**. Komşularının önünden geçemez. Taşıma tek bir geri alma adımıdır.
- Sağ paneldeki PVI tablosuna tam değerleri **yazın**: **İstasyon**, **Kot** ve **Eğri L** (dikey eğri uzunluğu). Her birinden sonra {{key:Enter}} tuşuna basın.
- Bir PVI'yi satırının sonundaki x ile **kaldırın** ya da seçin (tıklayın) ve {{key:Delete}} tuşuna basın. Boy kesiti görünümü odaktayken {{key:Backspace}} de onu kaldırır.

İlk ve son PVI hiçbir zaman bir eğri almaz.

## Dikey eğriler

1. Bir iç PVI için **Eğri L** alanına bir uzunluk yazın, örneğin 200.
2. Eğri PVI'nin ortasına çizilir. Boy kesiti ve sağ panel, türünü (tepe ya da çukur), L ve K'yı, BVC ve EVC istasyonlarını ve kotlarını ve eğrinin içinde varsa yüksek ya da alçak noktasını gösterir.

K, L'den hesaplanır (K = L ÷ eğimlerin cebirsel farkı, yüzde olarak). L'yi siz yazarsınız; K'yi doğrudan yazmak henüz mümkün değildir.

Bir dikey eğri sığmazsa, kırmızı bir kutu nedenini söyler: önündeki PVI'ye ya da eğriye geri girer ya da bir sonraki PVI'yi geçer ve o yanda ne kadar yer olduğunu gösterir (bir eğri, PVI'sinin her iki yanında uzunluğunun yarısına ihtiyaç duyar). Düğmesi, K'sıyla birlikte **sığan en uzun eğriyi** tek adımda ayarlar ({{key:Mod+Z}} bunu geri alır). Ya da PVI'leri birbirinden uzaklaştırın.

## Bilgileri okuyun

PVI tablosunun altındaki bir listede her eğim yüzde olarak ("Eğim 1: +1.25%") ve her eğri verilir, örneğin "Tepe 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", ardından "Yüksek nokta 1+62.40, 254.12".

PVI'ler eksenin iki ucuna ulaşmıyorsa bir not bunu söyler. Bir koridor yalnızca boy kesiti ile eksenin örtüştüğü yerde oluşturulur.

## Boy kesitindeki özellik çizgileri

Özellik çizgileri boy kesiti görünümünde de görünür; böylece yolun boy kesitine karşı bir bordürü, bir hendeği ya da bir duvar üstünü görebilirsiniz.

- Bir özellik çizgisi ekseni **kestiği** yerde, boy kesiti o istasyon ve kotta küçük bir elmas gösterir; çizginin adı ve oradaki kotuyla etiketlenir (çizginin kendi kotu; kesişen parça boyunca hesaplanır).
- Bu mesafe içinde ekseninin **yanından geçen** özellik çizgilerini de kesikli çizgiler olarak kendi kotlarında çizmek için {{ui:Yanında, içinde}} alanına bir mesafe yazın. Boş ya da 0 yalnızca kesişmeleri gösterir.
- İşaretler ve etiketler her değişikliği izler: bir köşe noktasını taşıyın, bir eğim yazın ya da çizgiyi yükseltin; boy kesiti yeni kotları hemen gösterir.
- Özellik çizgisini seçmek için bir kesişmenin elmasına tıklayın; seçili çizgi vurgu renginde çizilir.
- Boy kesiti çubuğundaki {{ui:Özellik çizgileri}} hepsini gizler ya da gösterir. Her iki ayar da projeyle birlikte kaydedilir.

Bkz. [Özellik çizgileri](topic:feature-lines).

## Sonraki adımlar

- Bir yol koridorunu eksen ve bu boy kesiti boyunca [süpürün](topic:corridor).
- Boy kesiti, ekseniyle birlikte LandXML'e yazılır; bkz. [LandXML alışverişi](topic:landxml).
