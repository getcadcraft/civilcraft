---
title: Yatay eksen oluşturma
summary: Ekseni PI'lerle çizin, eğri yarıçaplarını ve başlangıç istasyonunu ayarlayın, PI'leri taşıyın, eğri verilerini ile istasyon ve ofseti okuyun.
keywords: eksen, çözüm yok, eğri sığmıyor, en büyük yarıçap, en küçük yarıçap, minimum yarıçap, tasarım hızı, çakışma, merkez çizgisi, pi, yatay eğri, yarıçap, istasyonlama, teğet, eksen oluştur, eksen yerleşimi, pc, pt, istasyon ofset
from: 8c5df4aa
---

CivilCraft'ta eksen, kesişim noktalarından (PI) geçen bir teğetler zinciridir; yarıçapı olan her ara PI'de dairesel bir eğri vardır. Seçtiğiniz bir başlangıç istasyonundan istasyonlanır. Bir projede birden çok eksen olabilir.

## Ekseni çizin

1. {{key:A}} tuşuna basın ya da **Tasarım** grubunda {{ui:Alignment}} düğmesine tıklayın.
   İpucu şöyle der: "Eksen: PI'lere sırayla tıklayın. Enter ya da çift tıklama bitirir, Backspace son PI'yi kaldırır, Esc iptal eder."
2. İlk PI'ye tıklayın (eksenin başlangıcı).
3. Sonraki her PI'ye sırayla tıklayın. Kırmızı bir çizgi imleci izler ve çizdiğiniz teğetin uzunluğunu ve yönünü gösterir, örneğin "212.40 ft  K 63°12'05" D".
4. Son PI'ye tıklayın (eksenin sonu).
5. {{key:Enter}} tuşuna basın.
   Eksen istasyonlanmış olarak çizilir ve seçili olur. Durum çubuğu, örneğin, "Eksen 1: 386.36 ft, sığdığı yerlerde 100 ft yarıçaplı eğriler. Yarıçapları Özellikler'de düzenleyin; eğimini tasarlamak için {{ui:Profile}} (R)." der.

Çizerken: {{key:Backspace}} son PI'yi kaldırır, {{key:Esc}} iptal eder, boş alanda sürüklemek PI eklemeden kaydırır.

:::warning
{{key:Enter}} ile bitirin. Çift tıklama da bitirir, ama bu sürümde çift tıkladığınız PI'yi düşürür. Son PI'ye bir kez tıklayın, sonra {{key:Enter}} tuşuna basın.
:::

Her ara PI'ye 100 ft (metre projesinde 30 m) eğri verilir; 100 ft sığmazsa, her teğetin yarısına sığan en büyük tam yarıçap. Çok keskin ya da düz geçen PI'lere eğri verilmez.

## Yarıçapları ve koordinatları ayarlayın

Ekseni seçiliyken sağ panelde **Eksen** görünür:

1. **Ad** ve **Başlangıç istasyonu**. İstasyonu `10+00` (ft) ya da `0+500` (m) biçiminde ya da düz bir sayı olarak yazın. Bkz. [Birimler, istasyonlar ve sayı biçimleri](topic:units-and-stations).
2. **Uzunluk** ve **Bitiş istasyonu** sizin için hesaplanır.
3. **PI'ler** tablosu her PI'nin **Doğu** (Easting) ve **Kuzey** (Northing) değerlerini ve her ara PI için bir **Yarıçap** listeler. Yeni bir değer yazın ve {{key:Enter}} tuşuna basın.
   - Yarıçap 0 ise eğrisiz bir açı noktası olur.
   - İlk ve son PI'nin hiçbir zaman yarıçapı olmaz.
   - Bir satırın sonundaki küçük x o PI'yi kaldırır (bir eksende en az iki PI kalır).
4. **Eğriler** listesini okuyun: her eğri için PC ve PT istasyonları, R yarıçapı, Δ sapma açısı ve yön (sol ya da sağ), L uzunluğu, T teğet, E dış uzaklık ve kiriş.
5. Eğrilerin altındaki satır ilk teğetin yönünü verir.

## Eğri sığmadığında

Eğriler PI'leri arasında olandan fazla teğet gerektiriyorsa, eksenin çözümü yoktur: siz düzeltene kadar doğru çizilmez ve LandXML dışa aktarımlarından çıkarılır. Kırmızı bir kutu nedenini sayılarla gösterir ve neyin sığacağını önerir:

- "PI 2 ve PI 3'teki eğriler aralarında 240.00 ft teğet ister (130.00 + 110.00), ama PI'ler 180.00 ft uzaktadır." — ya da yalnızca birinde eğri varsa, "PI 2'deki eğri PI 1'e doğru 240.00 ft teğet ister …".
- Her PI için bir düğme, diğer eğri olduğu gibi kalmak kaydıyla o noktaya sığan **en büyük yarıçapı** ayarlar (PI'nin öbür teğetine de sığmalıdır). İki PI'de de eğri varsa, **Her ikisi** iki yarıçapı orantılı olarak küçültür, böylece tam birleşirler.
- Tek bir eğri teğetten uzunsa, kutu, bu büyüklükteyken diğer PI'de hiçbir eğrinin sığamayacağını söyler.
- Geriye dönen bir PI eğri alamaz; kutu **PI n'de eğri yok** seçeneğini sunar.

Her düğme tek bir adımdır: {{key:Mod+Z}} yarıçapları eski hâline getirir. Önerilen yarıçaplar her zaman sığsın diye 0.01'e aşağı yuvarlanır.

### Tasarım en küçük yarıçapı

Her eğrinin buna göre denetlenmesi için bir **Tasarım en küçük yarıçapı** yazın (örneğin tasarım hızınızdan); yoksa boş bırakın. Bunun altındaki bir eğri, minimum değeri karşılayan en küçük yarıçap düğmesiyle listelenir; o yarıçap sığarsa. Sığmazsa kutu bunu söyler ve teğetlerin izin verdiği en büyük yarıçapı verir; böylece bir PI'yi taşımanız ya da minimum değeri düşürmeniz gerektiğini bilirsiniz.

## Planda PI'leri taşıyın

1. {{ui:Select}} etkinken eksene tıklayarak seçin. PI'lerinde kare tutamaçlar belirir.
2. Bir tutamacı sürükleyin. Eksen, istasyonlaması, boy kesiti ve koridor onu izler.
3. Bırakın. Taşıma tek bir geri alma adımıdır.

İki mevcut PI arasına PI ekleme henüz yapılmadı: ekseni silip yeniden çizin ya da sahip olduğunuz PI'ler için yeni koordinatlar yazın.

## İstasyon ve ofseti okuyun

İmleci plan üzerinde gezdirin. Durum çubuğu en yakın ekseni (ya da seçili olanı) istasyon ve ofsetle gösterir: **L** ya da **R** (istasyon yönüne bakarak), örneğin "Eksen 1: İst 2+15.30, ofset 18.42 R". Herhangi bir ucun ötesinde "(ucun ötesinde)" ekler.

## Ne çizilir

Planda, DXF'te ve PDF'te: merkez çizgisi (teğetler çizgi, eğriler gerçek yay olarak), her 50 ft'te (metre projesinde 20 m) bir çentik, her 100 birimde daha uzun çentik ve istasyon etiketi, PC ve PT çentikleri istasyon etiketleriyle.

## Ekseni silin

Seçin ve {{key:Delete}} tuşuna basın ya da araç çubuğunda ya da sağ panelin altında {{ui:Delete}} düğmesine tıklayın. Boy kesiti ve koridoru da onunla birlikte gider. {{key:Mod+Z}} onu geri getirir.

:::mac
Mac klavyede **delete** etiketli tuş tarayıcıda {{key:Backspace}} gibi davranır ve seçimi silmez. {{key:Delete}} tuşuna basın (Fn ve delete) ya da {{ui:Delete}} düğmesini kullanın.
:::

## Sonraki

- [Dikey boy kesiti tasarlayın](topic:profile).

## Tasarım hızı ve sınıfı

Ekseninin Özellikleri altında **Tasarım hızı** (km/h ya da mph) ve **Tasarım sınıfı** eksenle birlikte tutulur, projede kaydedilir ve IFC'ye yazılır (Pset_RoadDesignCriteriaCommon). CivilCraft'ta bir hızı en küçük yarıçapa bağlayan bir tablo yoktur; bu yüzden bunlardan hiçbir denetim yapılmaz: **Minimum yarıçap**ı kendi tasarım standardınıza göre girin.

## Spiraller

Bir eğrinin iki ucunda da klotoid spiral olabilir: teğet, spiral, eğri, spiral, teğet. PI tablosunda yarıçapı olan bir PI için **Giriş spirali** ve **Çıkış spirali** alanlarına bir uzunluk yazın. PI yerinde kalır; eğri yer açmak için içeri girer, böylece teğet uzaklığı spiralin ofseti kadar artar. İki uzunluk farklı olabilir; yalnızca bir uzunluk yazılan PI'de yalnızca o uca spiral konur.

Eğri listesi TS, SC, CS ve ST'yi (teğetten spirale, spiralden eğriye, eğriden spirale, spiralden teğete) spiral açısı θs, teğet uzaklıkları ve dış uzaklıkla gösterir. İstasyonlar spirallerde de diğer yerlerdeki gibi akar. Birlikte eğrinin döndüğünden fazla dönen spiraller, adı geçen PI ile reddedilir; teğetin izin verdiğinden uzun bir spiral, herhangi bir eğride olduğu gibi bir çakışmadır. Süperelevasyon, geçiş bölgesi olarak spirali kullanır (bkz. [Koridor](topic:corridor)).
