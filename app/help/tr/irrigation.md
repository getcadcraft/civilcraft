---
title: Sulama tasarımı
summary: Bir hesaplama yardımcısı, damgalı bir tasarım değil: arazide başlıklar, laterallar, ana hat, vanalar ve damla hatları; borulardan bulunan bölgeler; Hazen–Williams ile basınç kaybı, en kötü durum başlığı, besleme karşısında debi ve basınç, yağış hızları, çalışma süreleri, kapsama ve malzeme listesi.
keywords: sulama, yağmurlama, sprey, rotor, döner meme, kabarcıklandırıcı, damla, damla hattı, damlatıcı, vana, bölge, istasyon, kontrolör, ana hat, lateral, bağlantı noktası, su temini, basınç, psi, kpa, debi, gpm, sürtünme kaybı, hazen williams, yağış hızı, çalışma süresi, kapsama, başlıktan başlığa, malzeme listesi
from: 7d6342c1
---

:::warning
Bu bir hesaplama yardımcısıdır, damgalı bir tasarım değildir: bir sulama tasarımcısı, inşa edilmeden önce her sonucu denetler.
:::

## Sistemi kurun

1. Sol taraftaki **Sulama** bölümünde **Başlık**'ı, **Yay**ı ve yayın başladığı yeri, laterallar ve ana hat için boru boyutlarını seçin.
2. {{ui:Sulama}} › {{ui:Bağlantı noktası}}: su temininin katıldığı yeri tıklayın. Özellikler'de **basıncını**, **mevcut debiyi** ve sayaç ile geri akış kaybını ayarlayın.
3. {{ui:Sulama}} › {{ui:Vana}}: her bölgenin vanasının gideceği yeri tıklayın. Bir vana bir bölge başlatır.
4. {{ui:Sulama}} › {{ui:Başlık}}: başlıkları yerleştirmek için tıklayın; her tıklama bir başlık yerleştirir.
5. {{ui:Sulama}} › {{ui:Lateral boru}}: bir vanadan başlıklarından geçerek tıklayın ve {{key:Enter}} tuşuna basın. {{ui:Ana hat}}: bağlantı noktasından her vanaya.

Boru uçları başlıklara, vanalara, su temini hattına ve diğer boru uçlarına yapışır; böylece ağ birleşir. Bir bölge, vanasından laterallar boyunca ulaşılan her şeydir; ana hat aynı anda yalnızca bir bölge taşır.

## Damla

{{ui:Sulama}} › {{ui:Damla sulama hattı}}: hattın boyunca tıklayın; beslendiği yerden başlayarak (bir lateral ucu veya bir vana). Özellikler'de **damlatıcı debisini** ve **aralığını** ayarlayın; hattın debisi üzerindeki damlatıcılardan oluşur.

## Kontrol

{{ui:Sulama}} › {{ui:Sistemi denetle…}} her bölgeyi listeler:

| Sütun | Nasıl hesaplanır |
|---|---|
| Debi | Başlıkların debilerinin (ve damla hatlarının) toplamı |
| Vanada | En kötü durum başlığının çalışma basıncı ile ona kadar olan boru kayıpları (Hazen–Williams, borunun iç çapı, kot değişimi) ve vanadan geçen kayıp |
| Beslemede | Aynısı, artı o bölgeyi taşıyan ana hattın kaybı ve sayaç ile geri akış kaybı |
| Yağış | Başlıkların debisi, başlıktan başlığa aralıkta suladıkları alana bölünmüş |
| Haftada dakika | **Haftada su** ayarını uygulamak için |
| Sorunlar | Sınırın üstünde hız, bir başlığın basınç aralığının üstünde basınç, bir vanada sprey ve rotorlar, beslemede yetersiz basınç veya debi, hiçbir bölgede olmayan başlıklar, döngüler |

Bir vanayı seçerek bölgesinin rakamlarını ve planda halka içine alınmış en kötü durum başlığını görün. Malzeme listesi başlıkları türüne ve yayına göre, boruları boyutuna göre, vanaları, damla hattını, damlatıcıları ve kontrolörün istasyonlarını sayar. **CSV olarak kaydet** ikisini de tutar.

Sulama bölümündeki ayarlar: **Hazen–Williams C** (yeni plastik boru için 150), bir borudaki **en hızlı debi** (1.5 m/s), **vanadan geçen kayıp** ve **haftada su**. Bunlar etiketli varsayılanlardır.

## Kapsama

{{ui:Sulama}} › {{ui:Kapsamı göster}} alanın ne kadarının başlıklar tarafından kuru bırakıldığını, ne kadarının iki veya daha fazla başlık tarafından sulandığını ve hangi başlıkların bir komşuya ulaşmadığını (başlıktan başlığa aralık) söyler.

## Başlıklar

Listelenen başlıklar CadCraft tarafından tasarım yağış hızlarından yazılmış **genel** türlerdir (sabit spreyler, döner memeler, dişli rotorlar, kabarcıklandırıcılar, mikro spreyler, damlatıcılar); hiçbir üreticinin ürünü değildir. **Başlıkları bir dosyadan ekle…** kendi başlıklarınızı okur (her başlığın fırlatma mesafesi, debisi veya yağış hızı ve basınç aralığı olan bir JSON listesi); projeyle birlikte kaydedilirler. Bir üreticinin yayımlanmış verileri yalnızca o üreticinin kayıtlı izniyle girer.

Genel başlıkların altındaki liste **tipik başlıklara** sahiptir (adları "tipik değerler" ile biter): sabit spreylerin, döner memelerin ve dişli rotorların meme boyutları, mikro spreyler, kabarcıklandırıcılar ve damlatıcılar; yarıçap, debi ve basınç aralığı ile. CadCraft bunları yayımlanmış matematikten (debi için orifis denklemi, fırlatma yarıçapı için jet fırlatma ölçeklemesi) ve nominal debi sınıflarından, yalnızca açık kaynaklardan hesaplar; hiçbir üretici tablosu kopyalanmaz. Birini seçtiğinizde seçici temelini ve lisansını gösterir. Birini kullanan bir proje, başlığı ve kaynağını proje dosyasında tutar. Bunlar planlama içindir: inşa etmeden önce gerçek başlığın kendi verilerini denetleyin.
