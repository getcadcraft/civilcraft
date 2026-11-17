---
title: Plan ve boy kesiti sayfaları
summary: Bir eksenin tek bir PDF içinde, aralarında eşleştirme çizgileri bulunan plan ve boy kesiti sayfaları olarak çıktısını alın.
keywords: plan ve boy kesiti, sayfalar, çıktı al, pdf, eşleştirme çizgisi, plan üretimi, yol planları, boy kesiti çıktısı, düşey abartı, sayfa takımı
from: 34b4ec78
---

Yol planları genellikle bu biçimde çizilir: her sayfa yolun bir bölümünü iki kez gösterir; üstte plan, altta boy kesiti, ikisi de aynı yatay ölçekte. Böylece bir istasyon her iki yerde de aynı konumdadır.

## Sayfaları oluşturun

1. Ekseni seçin. **Özellikler** bölümünde {{ui:Plan ve boy kesiti sayfaları}} düğmesine tıklayın.
2. **Kâğıt**, **Plan ölçeği** ve **Boy kesiti abartısı** (boy kesitinin uzunluğundan kaç kat daha yüksek çizildiği; başlangıç için 10×) seçeneklerini belirleyin. İletişim kutusu kaç sayfa oluşacağını ve her sayfanın eksenin ne kadarını gösterdiğini belirtir.
3. Eksenin bir kısmını çıktı almak için **Başlangıç istasyonu** ve **Bitiş istasyonu** alanlarını değiştirin.
4. {{ui:PDF indir}} düğmesine tıklayın. PDF'in her sayfası için bir sayfa oluşur.

## Sayfada neler var

| Bölüm | Gösterdiği |
|---|---|
| Plan | Plandaki her şey (konturlar, ölçme noktaları, eksen ve istasyonlaması, koridorlar, platformlar, özellik çizgileri, borular, örnek çizgileri); bu bölüm sayfayı yatay olarak kesecek şekilde döndürülmüş, kuzey oku da buna uygun döndürülmüş olarak |
| Eşleştirme çizgileri | Başka bir sayfada devam eden her ucta, eksene dik bir nokta-çizgi, "Eşleştirme çizgisi sta 5+50.00, bkz. sayfa 2" etiketiyle |
| Boy kesiti | Mevcut zemin (kesikli), tasarım boy kesiti (kırmızı), her teğetin eğimi ve her düşey eğrinin PVI, kot, L ve K değerleri; altta istasyonlar, iki yanda kotlar |
| Künye şeridi | Proje adı, eksenin ve istasyon aralığı, "Sayfa 1 / 3", yatay ve düşey ölçekler, abartı |

Sayfa başına düşen uzunluk, plan penceresinin ölçekte izin verdiği kadardır; uzun bölümlerde en yakın tam 50 ft (20 m), kısa bölümlerde ise en yakın tam 10 ft (5 m) değerine yuvarlanır.

:::note
Seçtiğiniz abartıda boy kesiti kotları sığmazsa, CivilCraft her sayfayı 10×, 5×, 4×, 2× ve 1× değerlerinden sığan en büyük olanla çizer ve durum çubuğunda bunu belirtir. Eğrili bir eksen, her bölümün başlangıcından bitişine olan yönle döndürülür; bu nedenle yol sayfada hafifçe yukarı ya da aşağı gidiyor gibi görünebilir.
:::
