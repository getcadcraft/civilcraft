---
title: Enerji hattı denetimleri
summary: CivilCraft'ın her hat ve kablo üzerinde, her zaman güncel olarak yaptığı denetimler: yer açıklıkları, aralıklar, salınım, yukarı kalkma, direk yükleri ve boyutlandırma, armatürler, gergiler, temeller, eksik veriler, bağlantılar, aşırı yükler ve gerilim düşümü.
keywords: denetimler, açıklık, yer açıklığı, engel, kesişme, faz aralığı, izolatör salınımı, yukarı kalkma, direk yükü, nominal yük, boyutlandırma, temel, gergi, çekme teli, armatür, traversi, gerilim düşümü, aşırı yük, eksik veri, bağlantısız
from: e6a0da47
---

Enerji hatları bölümündeki **Denetimler**, her sorunu listeler: başarısız olanlar kırmızı, uyarılar kehribar renginde. Birine tıklayarak ilgili hattı, direği, kabloyu ya da ekipmanı seçin; çalışma alanı açıkken başarısız direkler ve aralıklar planda kırmızıyla çevrelenir.

:::warning
Bir tasarım yardımcısıdır: bunlar tasarımınızın kendi kurallarınıza göre denetimleridir, bir sertifika değildir.
:::

## Açıklıklar

İletkenin en alçak fazı her aralık boyunca her yük durumunda izlenir. Yer üzerindeki en düşük açıklığı, hattın **Açıklık kuralına** ulaşmalıdır. Bir aralık bir **engeli** kestiğinde ({{ui:Engel}} ile çizilir: bir nokta ya da bir çizgi; yer üstünden yüksekliği ve kendi açıklık kuralıyla), engelin üstü üzerindeki açıklık aynı şekilde denetlenir.

**Peyzaj çalışma alanının yer üstüne koyduğu şeyler de sayılır.** Tekil bitkiler (olgun yayılım ve yükseklikteki tepeleri), çit ve dikim yatakları (içlerindeki en uzun tür) ve duvarlar (üstleri), yeniden çizilmeden bir hattın altındaki engellerdir. {{ui:Yük durumları ve sınırlar…}} içinde belirlenen kuralları korurlar: **Bir hattın altındaki peyzaj bitkileri** (örnek kümeler *Ağaçlar ve bitkiler* kullanır, 3 m) ve **Bir hattın altındaki peyzaj duvarları** (*Bina*); bunları dışarıda bırakmak için **Denetlenmez** seçin. Açıklık, aralığın kestiği noktada bitki ya da duvarın üstünden iletkene dikey olarak ölçülür; hattın yanındaki bir tacın yatay uzaklığı denetlenmez. Bir ağacı taşımak ya da bir duvarı yükseltmek denetimleri hemen değiştirir.

Açıklık kurallarınız size aittir: bunları eklemek, yeniden adlandırmak, değiştirmek ya da kaldırmak için herhangi bir **Açıklık kuralının** yanındaki **Kurallar…** (ya da {{ui:Yük durumları ve sınırlar…}}) ile açın.

## Aralık ve salınım

- Gereken **faz aralığı**: k·√(sarkma + izolatör uzunluğu) + U/150; sıcak durumun sarkması ve U kV cinsinden gerilim ile (yaygın bir biçim; k kural setinizinkidir). Traversin faz aralığıyla karşılaştırılır.
- Askı direklerinde rüzgâr durumu altında **izolatör salınımı**: atan(enine yük ÷ düşey yük), kural setinin en büyük salınımına karşı.
- **Yukarı kalkma**: komşularından alçak bir askı direği soğukta yukarı çekilebilir; işaretlenir.

## Direk yükleri ve boyutlandırma

Her direk ve yük durumu için, hattın her iletkeniyle birlikte:

- **Enine**: metre başına rüzgâr × rüzgâr aralığı (iki aralığın yarısı), artı bir dönüşte 2·H·sin(dönüş ÷ 2).
- **Hat boyunca**: bir uç ya da açıda iki yanın çekme farkı; bir askı direğinde yalnızca bir yanda buz varken (her aralık kendi başına çalışır, bu da güvenli tarafta hata yapar).
- **Düşey**: metre başına düşey yük × ağırlık aralığı (iki yandaki en alçak noktalar arası) artı ekipman.

Yatay yük, direğin nominal noktasına taşınır (eşdeğer yük = yük × bağlantı yüksekliği ÷ nominal noktanın yüksekliği) ve **nominal yükü** × kural setinin katsayısıyla karşılaştırılır. Yetersiz kalırsa, kütüphanenizde aynı malzemeden bu yükü taşıyan en küçük direk önerilir. **Gergili** bir direk yatay yükü gergiye aktarır; gerginin taşıdığı yük ÷ sin(gerginin açısı) olup kendi anma yüküne göre denetlenir.

Armatürler (kelepçeler, izolatörler, traversler) anma yüklerine göre denetlenir: bir bağlama armatürü iletkenin çekmesini taşır, bir askı armatürü düşey ve enine yükten payını. Gösterilen **temel**, direğin zemindeki derinliği ve ayağından biraz geniş bir çukurdur.

## Veri, bağlantılar ve akım

- Gerekli bir alanı boş olan bir öğe ya da kütüphanede bulunmayan bir anahtar.
- Hiçbir yere bağlı olmayan bir kablo güzergâhı ucu ya da ekipman.
- Her kaynaktan (kaynak olarak işaretlenmiş ekipman) yüklere (ekipmanda kW ve güç faktörü), havai aralıklar ve kablolar boyunca **gerilim düşümü** ve **akım**: √3·I·L·(R cos φ + X sin φ), R 20 °C'de. Kablonun akım değerinden fazla ya da kural setinin izin verdiğinden fazla düşüm işaretlenir.
