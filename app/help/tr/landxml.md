---
title: LandXML ile veri alışverişi
summary: Başka inşaat yazılımlarındaki LandXML'i yeni proje olarak açın; noktaları, yüzeyleri, eksenleri, profilleri ve boru ağını LandXML 1.2 olarak dışa aktarın ve neyin yolculuk etmediğini bilin.
keywords: landxml, xml, içe aktarma, dışa aktarma, alışveriş, tin, yüzey, eksen, profil, boru ağı, birlikte çalışabilirlik, veri alışverişi
from: 870d5ece
---

LandXML, çoğu inşaat programının okuyup yazdığı açık bir alışveriş biçimidir. CivilCraft LandXML 1.2 okur ve yazar. Civil 3D kullandıysanız, onun LandXML içe ve dışa aktarma iletişim kutuları en yakın karşılıktır; burada seçilecek bir şey yoktur ve notlar neyin dışarıda bırakıldığını söyler.

## LandXML dosyası açın

1. {{ui:Aç}} (ya da {{key:Mod+O}}) düğmesine tıklayın, `.xml` ya da `.landxml` dosyasını seçin ya da planın üzerine bırakın.
2. Geçerli projede kaydedilmemiş değişiklikler varsa, CivilCraft önce sorar. {{ui:Bir kopya kaydet}}, {{ui:Kaydetme}} ya da {{ui:İptal}} seçin.
3. Bir **yeni proje** oluşturulur. Durum çubuğu neyin okunduğunu söyler, örneğin "site.xml açıldı: 412 nokta, 2 yüzey, 3 eksen."
4. **Yüzey** bilgilerinin altındaki kutuya bakın. Atlanan ya da değiştirilen her şeyi listeler, örneğin:
   - "Yalnızca ilk yüzey ("EG") açıldı; dosyada 1 tane daha var."
   - "Eksen "Ramp A", CivilCraft'ın henüz çizemediği öğeler içeriyor (çizgi, yay ya da klotoid spiral değil); atlandı."
   - "Boru ağı kuralları dosyada yoktu; yer tutucular kullanılıyor — kendi kurallarınızı Proje altında ayarlayın."

Ne neye dönüşür:

| Dosyada | CivilCraft'ta |
|---|---|
| Birimler (Imperial ya da Metric) | Projenin **Birimleri** (feet ya da metre) |
| Proje adı | Projenin **Adı** |
| CgPoints | Projenin noktaları; tanım (ya da kod) grubu verir |
| İlk TIN yüzey | Mevcut zemin, olduğu gibi kullanılır ("Yüzey (LandXML'den)") |
| Çizgi, yay ve klotoid spirallerden oluşan her eksen | PI'ları, yarıçapları ve spiral uzunlukları eğrilerden yeniden kurulmuş bir eksen |
| Her eksenin ilk tasarım profili | Parabolik düşey eğrili tasarım profili |
| İlk boru ağı | Kenarları, çukurları ve invert'leriyle boru ağı |
| Çizgi ve yaylardan oluşan plan özellikleri | Özellik çizgileri, yaylar korunur; başka bir programdan geldiklerinde **Yalnızca çizilmiş** olarak başlarlar |

Öğe ve özniteliklerin tam listesi için bkz. [LandXML: okunan ve yazılan](topic:landxml-reference).

:::note
LandXML'den okunan bir yüzey, nokta gruplarını değiştirdiğinizde ya da kırılma çizgileri çizdiğinizde yeniden oluşturulmaz. Noktalardan oluşturmak için **Yüzey** bölümündeki {{ui:Yüzeyi noktalardan yeniden oluştur}} düğmesine tıklayın ({{key:Mod+Z}} LandXML yüzeyini geri getirir).
:::

## LandXML dışa aktarın

1. **Dışa aktar** grubundaki {{ui:LandXML}} öğesine tıklayın.
2. Tarayıcı `<ad>.xml` dosyasını indirir. Durum çubuğu neyin içine girdiğini söyler, örneğin "LandXML 1.2 dışa aktarıldı: 276 nokta, 2 yüzey, 1 eksen, boru ağı. Platformlar burada LandXML'in parçası değildir; tesviye edilmiş yüzey ise parçadır."

Dosya şunları içerir:

- **Birimler**: ABD araştırma feet'i ya da metre.
- **CgPoints**: her nokta, numarası adı olarak, tanımı ve grubu kod olarak.
- **Yüzeyler**: mevcut zemin bir TIN olarak, kırılma çizgileri ve dış sınırıyla kaynak veri olarak; platformlar ya da koridorlar tesviye ettiğinde ikinci bir TIN yüzeyi "Proposed" adıyla.
- **Eksenler**: çizgiler, yaylar ve klotoid spiraller istasyonlarıyla; her biri, eksen boyunca örneklenmiş mevcut zemini ve (en az iki PVI olduğunda) tasarım profilini (PVI'ler ve parabolik eğriler) içeren bir profille.
- **PipeNetworks**: kenarları, çukurları ve boru başına invert'iyle yapılar; çapı, uzunluğu ve eğimiyle borular.
- **PlanFeatures**: her özellik çizgisi, her ucunda kotuyla çizgi ve yaylar olarak ve ne için kullanıldığıyla.

## Yolculuk etmeyenler

- Nesne olarak platformlar ve koridorlar. Sonuçları "Proposed" yüzeyindedir.
- Hatalı eksenler (örneğin çakışan eğriler): dışarıda bırakılır ve durum mesajında sayılır.
- İki invert'i de olmayan borular ve en az iki yapısı olmayan ağlar.
- Yüzeyden alınan bir kenar, sabit bir kenar olarak yazılır. Yeniden açıldığında yapı, yüzey değişse bile o sayıyı korur.
- Ağ kuralları (en az eğim, örtü, düşüş): LandXML'in bunlar için yeri yoktur.
- Görüntüleme ayarları ve nokta gruplarının yüzey seçimleri: bunlar için bir CivilCraft projesi kaydedin.

CivilCraft açarken klotoid dışındaki spirallere, grid yüzeylere, yalnızca başka noktalara başvuran noktalara, Parcels, Roadways, plan özelliklerindeki spirallere ya da ölçüm verilerine dokunmaz. Her biri notlarda adıyla anılır, asla tahmin edilmez.

## Gidiş-dönüş

Başka inşaat yazılımı kullanan birine iş devretmek ve geri almak için LandXML'i dışa aktarın, onların düzenlemesine izin verin, sonra onların LandXML'ini yeni proje olarak açın. Kendi `.civilcraft.json` dosyanızı da saklayın: CivilCraft'ın bildiği her şeyi tutan tek dosya odur.
