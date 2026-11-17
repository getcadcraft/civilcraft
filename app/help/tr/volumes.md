---
title: Toprak işi hacimleri
summary: Mevcut zemin ile önerilen yüzey arasındaki kazı, dolgu ve net hacimleri platform ve koridor başına ile toplam olarak okuyun ve arkasındaki ızgara yöntemini anlayın.
keywords: hacimler, toprak işleri, kazı, dolgu, net, kazı ve dolgu, metrajlar, ızgara yöntemi, yüzey karşılaştırması, hacim yüzeyi, cu yd, metreküp
from: 299d7bc7
---

Bir platform ya da koridor sorunsuz tesviye edilir edilmez CivilCraft önerilen yüzeyi mevcut zeminle karşılaştırır ve kazı ile dolguyu bildirir. Sayılar her değişiklikte güncellenir.

## Nerede okunur

- Sağ panelde hiçbir şey seçili değilken **Toprak işleri** (**Proje** görünümü), en az bir platform ya da koridor olduğunda.
- Sağ panelde bir platform seçiliyken **Toprak işleri** (projenin tamamı için aynı toplamlar).
- Bir koridorun ayarlarının altındaki satır, o koridorun kendi kazı ve dolgusuyla.

**Toprak işleri** bloğu şunları gösterir:

- **Kazı**, **Dolgu** ve **Net** (sonrasında "dolgu" ya da "kazı" ile, hangisi büyükse)
- birden fazla öğe varsa öğe başına bir satır, örneğin "Platform 1: kazı 120.4 cu yd, dolgu 310.2 cu yd"
- yöntem satırı: "Izgara yöntemi: mevcut zemin ve tesviye edilmiş yüzey, yarma-dolgu sınırlarının içinde her 0.5 ft'te örneklendi (92,891 hücre). Kabarma ya da büzülme uygulanmadı."

Hacimler, feet projesinde cu yd, metre projesinde metreküp cinsindendir.

## TakeoffCraft'a gönderin

Toprak işlerini fiyatlandırmak için **Toprak işleri** bloğunun altındaki {{ui:TakeoffCraft'a gönder}} öğesini seçin. CivilCraft, iki miktarlı bir metraj dosyası (`<site>.quantities.json`) kaydeder: kazı ve dolgu, feet projesinde cu yd ya da metre projesinde metreküp cinsinden, bloktaki sayılarla aynı, yüzde bire kadar. TakeoffCraft'ta **Metraj aç** ile açın ya da oraya bırakın: fiyatlandırabileceğiniz iki kalem olurlar ([CivilCraft'tan kazı ve dolgu](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Bir değişiklikten sonra yeniden gönderin ve yeni dosyayı açın: aynı kalemler yeni sayıları alır.

Yalnızca toplamlar gönderilir; böylece hiçbir şey iki kez sayılmaz. Dosyanın notu her platform ve koridorun kendi kazı ve dolgusunu listeler.

## Nasıl hesaplanır

CivilCraft **ızgara yöntemini** kullanır:

1. Yarma-dolgu sınırlarının içindeki her alanın üzerine kare hücrelerden bir ızgara yerleştirilir.
2. Her hücrenin merkezinde iki yüzey de örneklenir.
3. Her hücre bir prizma sayılır: kot farkı çarpı hücrenin alanı. Önerilen yüzey daha düşükse kazıdır; daha yüksekse dolgudur.
4. Hücreler toplanır.

Hücre boyutu sizin için seçilir: tesviye edilmiş alanların etrafındaki dikdörtgen yaklaşık 250,000 hücre tutacak şekilde, düzgün bir değere (on kuvvetinin 1, 2 ya da 5 katı) yuvarlanır. Bunu henüz kendiniz ayarlayamazsınız. Yöntem satırı boyutu ve hücre sayısını söyler. Daha küçük hücreler kenarlar boyunca daha doğrudur; düz düzlemler arasındaki tam hücrelerde sonuç kesindir.

## Dikkat edilecekler

- Yalnızca yarma-dolgu sınırlarının içindeki alan sayılır. Dışarıdaki zemin değişmez.
- Sorunu olan bir platform ya da koridor tesviye edilmez ve hiçbir şey eklemez. Blok "Henüz hacim yok: bir platformun sorunsuz tesviye edilmesi gerekir." diyorsa, üstündeki kırmızı kutuya bakın.
- Öğeler çakıştığında, sonra gelen öğe yarma-dolgu sınırı içinde öncekinin yerini alır ve çakışan alan bir kez sayılır.
- Kabarma ya da büzülme katsayısı uygulanmaz. Yerinde, gevşek ya da sıkıştırılmış hacimlere ihtiyacınız varsa sonuçları kendiniz çarpın.
- Üst toprak sıyırma, üst yapı ve temel zemini derinlikleri ile TIN'den TIN'e prizma hacimleri henüz kullanılamaz.

## Sonucu kontrol etme

- **Önerilen (tesviye edilmiş)** öğesini **Görüntüle** altında açın ve yarma-dolgu sınırlarının içindeki konturlara bakın.
- Tesviye edilmiş alanın üzerine imleci getirin: durum çubuğu **Zemin** ve **Tesviye edilmiş** gösterir. Fark, o noktadaki kazı ya da dolgu derinliğidir.
- Bir koridor için profil görünümünün okuma alanı, her istasyonda eksen üzerindeki kazıyı ya da dolguyu gösterir.
