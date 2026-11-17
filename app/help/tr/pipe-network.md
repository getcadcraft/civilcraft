---
title: Yerçekimli boru ağı oluşturun
summary: Boru hatlarını yapı yapı çizin, eğim, örtü ve düşüş kurallarınızı ayarlayın, CivilCraft'ın bağlantı kotlarını ayarlamasına izin verin ve listelediği sorunları çözün.
keywords: yapı oluşturucu, yapı türü, dikdörtgen yapı, rögar, çerçeve, örtü, duvar kalınlığı, kütüphane öğesi, boru ağı, yağmur suyu, pis su, kanalizasyon, yapılar, rögarlar, giriş ağızları, bağlantı kotları, eğim, düşüş, kapak kotu, çukur, yerçekimli borular
from: 10a3c14d
---

Bir projede tek bir yerçekimli boru ağı bulunur: yağmur suyu ya da pis su. Yapılardan (rögarlar, giriş ağızları) ve aralarındaki düz borulardan oluşur. Akış çizdiğiniz yönde gider. CivilCraft her boruyu ve yapıyı sizin belirlediğiniz üç kurala karşı denetler ve bağlantı kotlarının tümünü bu kurallardan ayarlayabilir.

## Bir hat çizin

Yüzey olmadan boru çizebilirsiniz, ama kapak kotları, örtü ve otomatik bağlantı kotları bir yüzey gerektirir.

1. {{key:P}} tuşuna basın ya da **Tasarım** grubundaki {{ui:Borular}} tıklayın.
   İpucu şöyle der: "Borular: hattın üstünden aşağı doğru yapılara tıklayın (katılmak için var olan bir yapıya tıklayın). Bitirmek için Enter."
2. Üst akım yapısının gideceği yere tıklayın. Bir yapı yerleştirilir.
3. Her sonraki yapıyı akış yönünde sırayla tıklayın. Zaten var olan bir yapıya bağlanmak için ona tıklayın: durum çubuğu "S3'e katıldı." der.
4. {{key:Enter}} tuşuna basın.
   Borular çizilir, bağlantı kotları kurallardan ayarlanır ve durum çubuğu, örneğin, "3 boru çizildi, 12 bağlantı kotu kurallardan ayarlandı; her denetim geçti." der.

Yeni yapılar 48 in (1200 mm) çapla S1, S2 … olarak adlandırılır. Yeni borular 12 in (300 mm) çapla P1, P2 … olarak adlandırılır. Çaplar, feet projesinde inç, metre projesinde milimetre cinsindendir.

{{key:Enter}} ile bitirin. Çift tıklamak da çalışır, ama mevcut bir yapıya çift tıklayarak hattı orada bitirirseniz bağlantı iptal edilir: bir kez tıklayın, sonra {{key:Enter}} tuşuna basın.

## Kurallarınızı ayarlayın

Hiçbir şey seçili değilken sağ panelde (**Proje**) bir **Boru ağı** bloğu vardır:

| Ayar | Başlangıç değeri | Anlamı |
|---|---|---|
| Tür | Yağmur suyu | {{ui:Yağmur suyu}} ya da {{ui:Pis su}}; LandXML'e yazılır |
| En az eğim | 0.50% | Her boru en azından bu kadar düşmelidir |
| En az örtü | 2 ft (0.6 m) | Zeminden borunun tepesine, boru boyunca her yerde |
| Yapılarda düşüş | 0.10 ft (0.03 m) | Çıkış bağlantı kotu, her giriş bağlantı kotunun en az bu kadar altında olmalıdır |

**Bu başlangıç değerleri yer tutucudur, bir standart değildir.** Kurumunuzun ya da projenizin gerektirdiği değerleri ayarlayın. Örtü, zeminden tepeye (bağlantı kotu artı iç çap) ölçülür; duvar kalınlığı sayılmaz. Platformlar ya da koridorlar tesviye edildiğinde, tesviye edilmiş yüzey zemin sayılır.

## Bağlantı kotlarını CivilCraft'a ayarlatın

- {{ui:Tüm bağlantı kotlarını kurallara göre ayarla}} (**Boru ağı** bloğunda) tüm boruları ayarlar.
- {{ui:Bağlantı kotlarını kurallara göre ayarla}} (tek bir boru seçiliyken) yalnızca o boruyu ayarlar.

Akış yönünde ilerleyerek, her hat en üst yapısında en az örtü kadar başlar, en az eğim kadar düşer, her yapıdan geçerken en az düşüş kadar düşer ve boru boyunca zemin en az örtüden daha az bırakacağı her yerde daha derine iner. Bağlantı kotları 0.01'e yuvarlanarak aşağı yönde yuvarlanır, asla yukarı değil. Durum çubuğu "Bağlantı kotları ayarlandı: her hattın üstünde en az örtü, en az eğim ve her yapıda en az düşüş." der ya da yapamadığı şeyi adlandırır.

## Yapıları ve boruları düzenleyin

{{ui:Seç}} ile bir yapıya ya da boruya tıklayarak sağ panelde görün.

**Yapı**: **Ad**, **Kapak kotu**, **Çukur derinliği**, **Çap**, sonra **Kullanılan kapak kotu**, **Çukur**, **Doğu (Easting)** ve **Kuzey (Northing)**, ve içeri ve dışarı giden borular bağlantı kotlarıyla.

- **Kapak kotu**nu boş bırakırsanız yüzeyden alınır; kutu yüzey değerini gri gösterir. Bir değer yazarak kapak kotunu sabitleyin.
- Yapının tutamacını planda sürükleyerek taşıyın. Boruları onu izler; bağlantı kotları olduğu gibi kalır, bu yüzden sonradan sorunları kontrol edin.

**Tür**: ağın yapı türlerinden birini seçin (aşağıda) ya da kendi çapında yuvarlak bir yapı için hiçbiri.

**Boru**: **Ad**, arasında çalıştığı yapılar, **Çap**, **Üst bağlantı kotu**, **Alt bağlantı kotu**, sonra **Uzunluk**, **Eğim** ve **En az örtü**.

Her değerden sonra {{key:Enter}} tuşuna basın.

## Sorunları okuyun ve düzeltin

**Boru ağı** bloğu her sorunu listeler (en fazla 40); birine tıklarsanız boruyu ya da yapıyı seçer. Seçili bir boru ya da yapı kendi sorunlarını listeler. Hiçbiri yoksa "Her boru ve yapı kuralları geçer." der.

| İleti (örnekler) | Ne yapmalı |
|---|---|
| "P2 yokuş yukarı gidiyor (-0.40%)." veya "… düz gidiyor …" | Bağlantı kotlarını değiştirin ya da kurallardan ayarlayın. |
| "P2'nin eğimi %0.30, en az olan %0.50'den daha düz." | Alt yapının bağlantı kotunu düşürün ya da üst yapınınkini yükseltin. |
| "P3 boyunca 35 uzunluğunda 1.40 örtü var, en az 2'den az." | Boruyu alçaltın; bağlantı kotlarını kurallardan ayarlayın. |
| "S3'te P4 245.20'de çıkıyor, 245.25'te gelen P3'ün 0.1'den az altında." | Çıkış borusunun üst bağlantı kotunu düşürün. |
| "P1'in tepesi, S1'in kapak kotunun üstünde." | Boru, yapı için çok yüksek. |
| "S2'den 2 boru çıkıyor; bir yerçekimli ağda her yapıdan tek bir çıkış olmalı." | Çıkan borulardan birini kaldırın ya da doğru yönde yeniden çizin. |
| "Borular bir döngü oluşturuyor; akış bir çıkışta bitmelidir." | Bir hat kendi içine geri çizilmiş; bir boruyu silin. |
| "S5 yüzeyin dışında ve kapak kotu yok." | Bir kapak kotu yazın ya da yapıyı yüzeyin üzerine taşıyın. |
| "P6 kısmen yüzeyin dışında; orada örtü bilinmiyor." | Yüzeyi genişletin ya da orada örtünün denetlenmediğini kabul edin. |
| "P7'nin henüz bağlantı kotu yok." | Bağlantı kotlarını yazın ya da kurallardan ayarlayın. |

Sorunlu borular ve yapılar planda kırmızıyla da işaretlenir.

## Yapı türleri

Bir yapı türü, parametrelerinden oluşturulmuş bir yapıdır: bir rögar, giriş ağzı, birleşim kutusu ya da çıkış; **yuvarlak** (iç çap) ya da **dikdörtgen** (iç genişlik ve uzunluk); **duvar kalınlığı**, **taban döşemesi**, en alt borunun altında bir **çukur** ve bir **çerçeve ve kapak** (yuvarlak ya da dikdörtgen açıklık, çerçeve yüksekliği). Türler ağa aittir ve projenin Özellikleri altındaki **Yapı türleri** bölümündedir.

1. {{ui:Yeni yapı türü}} tıklayın. İletişim kutusu, yazarken yapıyı planda ve kesitte çizer.
2. {{ui:Türü ekle}} tıklayın.
3. Bir yapı seçin ve **Tür** altında türü seçin. Türün boyutunu ve çukurunu alır; kendi çukuru yine de değiştirilebilir.

Bir türü düzenleyin ve o türdeki her yapı boyutlarını izler. Bir türü kaldırırsanız, yapıları aynı genişlikte yuvarlak yapılar olarak kalır. Her değişiklik tek bir adımdır: {{key:Mod+Z}} geri alır.

Dikdörtgen bir yapı planda, DXF, DWG ve PDF'te, 3D'de ise uzunluğu çıkış borusu boyunca olan bir dikdörtgen olarak çizilir; borular duvarından başlar. LandXML bunu duvar kalınlığıyla birlikte dikdörtgen bir yapı (`RectStruct`) olarak yazar ve bu tür yapıları tür olarak geri okur.

### Bir türü kütüphane üzerinden paylaşın

{{ui:Kütüphane öğesi olarak kaydet}} türü bir CadCraft kütüphane öğesi (bir `.json` dosyası) olarak yazar: plan sembolü, tipik bir derinliğe kadar 3D gövde ve her boyut. Paylaşmak için kütüphaneye yükleyin. {{ui:Bir kütüphane öğesi aç}} bu şekilde kaydedilmiş bir yapıyı, projenin birimlerine dönüştürülmüş olarak ağa geri okur. CivilCraft'ta yapılmamış yapı olan kütüphane öğeleri nedeniyle birlikte reddedilir.

## Silme

Bir boruyu seçip silmek için {{key:Delete}} tuşuna basın. Bir yapıyı silmek, ona bağlı boruları da kaldırır. Mac'te Fn ve Delete'e basın ya da {{ui:Sil}} tıklayın.

## Henüz yapılmadı

Akışlar, boru boyutları ve hidrolik eğim çizgisi (HGL) [Yağmur suyu drenajı](topic:storm-drainage) içindedir. Boru katalogları, dairesel olmayan borular, profil görünümündeki borular, eğri borular ve proje başına birden fazla ağ henüz kullanılamaz. Bkz. [Henüz yapılmadı](topic:not-built-yet).
