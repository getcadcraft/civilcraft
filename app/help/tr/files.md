---
title: Açabileceğiniz, kaydedebileceğiniz ve dışa aktarabileceğiniz dosyalar
summary: İçeri alınan: nokta dosyaları, LandXML ve CivilCraft projeleri; dışarı aktarılan: projeler, LandXML, DXF ve PDF; her birinin ne sakladığı, dosyaların nereye gittiği ve çevrimdışıyken neyin değiştiği.
keywords: aç, kaydet, dışa aktar, içe aktar, dosya biçimleri, csv, txt, landxml, xml, dxf, pdf, json, indir, proje dosyası
from: a7debb61
---

CivilCraft bilgisayarınızdaki dosyaları açar ve dosyaları size indirerek kaydeder. Hiçbir şey yüklenmez ve sunucuda hiçbir şey tutulmaz. Ayrıca bkz. [Dosyalarınız](common:your-files).

## Neleri açar

{{ui:Aç}} düğmesine tıklayın (ya da {{key:Mod+O}} tuşlarına basın) ve bir dosya seçin; ya da dosyayı {{pick:mac=Finder|windows=Dosya Gezgini|linux=dosya yöneticiniz}} içinden plana sürükleyin. Her seferinde bir dosya açılır; 200 MB'den büyük dosyalar reddedilir.

| Tür | Dosya adları | Ne olur |
|---|---|---|
| Nokta dosyası | `.csv`, `.txt`, `.pnt`, `.xyz` (herhangi bir metin dosyası) | **Noktaları içe aktar** iletişim kutusu açılır. Noktalar projenin noktalarının yerini alır; eksenler, platformlar ve borular kalır. |
| LandXML | `.xml`, `.landxml` | Dosyadan **yeni bir proje** oluşturulur (mevcut projede kaydedilmemiş değişiklikler varsa önce size sorulur). |
| CivilCraft projesi | `.civilcraft.json` (herhangi bir `.json`) | Proje, kaydedildiği hâliyle açılır (mevcut projede kaydedilmemiş değişiklikler varsa önce size sorulur). |

CivilCraft karar verirken önce dosyanın uzantısına, sonra ilk karakterlerine bakar: `{` ile başlayan metin proje olarak, `<` ile başlayan metin LandXML olarak, diğer her şey ise nokta dosyası olarak okunur. Açma kutusunun gri gösterdiği bir dosya yine de plana bırakılabilir.

:::note
Noktası olan bir projeye nokta dosyası içe aktarmak, noktaları sormadan değiştirir ve geri al geçmişini temizler (herhangi bir dosyayı açmak geri al için yeni bir başlangıçtır). Yüzey LandXML'den geldiyse, noktaları içe aktarmak yüzeyi yeniden noktalardan oluşturulan bir yüzeye çevirir. Eski noktalarınızı geri isteyebileceğinizi düşünüyorsanız önce kaydedin.
:::

Ayrıntılar: [Nokta dosya biçimleri](topic:point-file-formats), [LandXML: okunan ve yazılan içerik](topic:landxml-reference).

## Neleri kaydeder

{{ui:Kaydet}} ({{key:Mod+S}}) yan yana iki dosya yazar. Dosya adları sol paneldeki **Ad** alanından alınır: düzenlemeye devam ettiğiniz proje `<ad>.civilcraft.json`, aynı tasarımın diğer programlar için IFC 4.3 hâli ise `<ad>.ifc` olur (bkz. [IFC dışa ve içe aktarma](topic:ifc)). Her dosya diğerini kaydeder. IFC ayrıca projenin sıkıştırılmış bir kopyasını taşır; bu yüzden tek başına gönderilen bir IFC de tamamen düzenlenebilir olarak yeniden açılır.

- **Studio'da** iki dosya da yan yana, bulunduğu yerde yazılır.
- **Chrome ve Edge'de** ilk kaydetmede bir klasör sorulur ve iki dosya oraya yazılır; sonraki kayıtlar aynı klasöre gider. Klasör sorusunu iptal ederseniz iki dosya da indirilir.
- **Diğer tarayıcılarda** iki dosya da indirilir; proje dosyası önce iner.

Dosyalardan biri açıldığında diğerini arar. İkisini birlikte açın (ya da ikisini birden sürükleyin) veya yalnızca birini açın: Studio'da diğeri aynı klasörde bulunur; tarayıcıda CivilCraft sizden onu eklemenizi ister ya da elinizdeki dosyayla devam etmenizi sorar. CivilCraft kaydettikten sonra IFC başka bir programla değiştirildiyse ya da iki dosyadan biri diğerinden eskiyse, proje daha yeni tasarımdan açılır ve Sorunlar paneli neyin olduğunu anlatır. Bu panelde **Şimdi kaydet** (iki dosyayı yeniden yazar) ve **IFC'nin geometrisini referans olarak göster** seçenekleri bulunur. Başka bir programın değiştirdiği tek başına bir IFC, kendi proje kopyasından ve hâlâ eşleşen bilgilerle açılır: değiştirdiği eksenler kendi geometrisini alır, sildiği nesneler dışarıda bırakılır ve diğer değişiklikleri listelenir, ama uygulanmaz. 0.7.1 öncesinden bir proje dosyası eskisi gibi açılır.

Proje dosyasında şunlar tutulur:

- her nokta (numara, koordinatlar, kot, açıklama) ve bu noktaların geldiği nokta dosyasının adı
- yüzey ayarları: grup seçimleri, çizilmiş kırılma çizgileri, sınır, en uzun dış kenar ve LandXML'den okunan bir TIN
- görüntüleme ayarları
- eksenler, PI'ları, yarıçapları ve başlangıç istasyonu, tasarım profilleri (PVI'lar ve eğri uzunlukları) ve koridor ayarları
- platformlar ve kuralları ile birlikte boru ağı

Geri al geçmişi tutulmaz. Yüzeyler, kot eğrileri (kontur), yarma-dolgu sınırları ve hacimler saklanmaz; proje açıldığında kaydedilen girdilerden yeniden oluşturulur. Daha yeni bir CivilCraft'tan gelen proje dosyası, sürümünü belirten bir iletiyle reddedilir.

## Neleri dışa aktarır

| Düğme | Dosya | İçerik |
|---|---|---|
| {{ui:LandXML}} | `<ad>.xml` | LandXML 1.2: noktalar, mevcut zemin (ve varsa tesviye edilmiş yüzey) TIN yüzeyleri olarak, eksenler, zemin ve tasarım profilleri, boru ağı |
| {{ui:DXF}} | `<ad>.dxf` | Planın çizgi işleri, görüntülendiği gibi, adlandırılmış katmanlarda R12 DXF |
| {{ui:DWG}} | `<ad>.dwg` | Aynı çizgi işleri, seçtiğiniz biçimde (2000 ila 2018) bir DWG çizimi |
| {{ui:PDF}} | `<ad>.pdf` | Planın, seçtiğiniz ölçekte bir sayfaya vektörel çıktısı |
| {{ui:GLB}} veya {{ui:OBJ}} (3B görünümün çubuğunda) | `<ad>-3d.glb`, `<ad>-3d.obj` | 3B görünümün 3B model olarak gösterdiği şey: metre, Y yukarı, gerçek ölçek, kaydedilmiş bir yerel orijin etrafında |

Her birinin dışarıda bıraktıkları: [LandXML değişimi](topic:landxml), [Planı DXF olarak dışa aktarma](topic:dxf-export) (DWG de), [Planı PDF olarak çıktı al](topic:plot-pdf), [Sahayı 3B olarak dışa aktarma](topic:export-3d).

## Dosyaların gittiği yer

Kaydedilen ve dışa aktarılan dosyalar, tarayıcınızın indirmeleri koyduğu yere gider; genellikle İndirilenler klasörüne. Her seferinde bir klasör seçmek için:

:::chromium
Tarayıcının **Ayarlar** bölümünü açın, sonra **İndirilenler**'i açın ve **Her dosyayı indirmeden önce nereye kaydedileceğini sor** seçeneğini etkinleştirin.
:::

:::firefox
**Ayarlar**'ı açın, sonra **Genel**'i seçin ve **Dosyalar ve Uygulamalar** altında **Dosyaları nereye kaydedeceğimi her zaman sor** seçeneğini işaretleyin.
:::

:::safari
**Safari > Ayarlar > Genel**'i açın ve **Dosya indirme konumu** seçeneğini **Her indirme için sor** olarak ayarlayın.
:::

Aynı adla iki kez kaydederseniz tarayıcı ikinci dosyaya bir numara ekleyebilir, örneğin `Site (1).civilcraft.json`. Bir dahaki sefere en yeni olanı açın.

## Çevrimiçi ve çevrimdışı

CivilCraft her durumda yalnızca bilgisayarınızda çalışır: açmak dosyayı tarayıcıda okur, kaydetmek dosyayı indirir. Hiçbir bağlantı olmadan CivilCraft'ı açmak için önce çevrimdışı kullanım için kaydedin:

1. Çevrimiçiyken, üstteki uygulama çubuğunda {{ui:Çevrimdışı için kaydet}} düğmesine tıklayın.
2. Düğme sayar (ör. "Kaydediliyor: 30 içinden 12") ve sonra {{ui:Çevrimdışı hazır}} yazısını gösterir. CivilCraft yaklaşık 0.6 MB'dir, bu yüzden bu biraz zaman alır. Kaydedilen kopya bu yardımı ve örnek siteyi de içerir.
3. Bağlantı yokken aynı adresi (ya da bunun yer imini) açın. Her şey çalışır; {{ui:Örnek arsayı aç}} dahil.

Düğmenin diğer durumları:

- {{ui:Kaydedilemedi}}: bazı dosyalar indirilemedi. Bağlantıyı kontrol edin ve tekrar denemek için tıklayın.
- {{ui:Çevrimdışı kullanım yok}}: bu tarayıcı penceresi çevrimdışı kopya tutamaz (özel pencereler ve bazı yönetilen bilgisayarlar bunu engeller). Normal bir pencere kullanın.

Kopyanın ne zaman kaydedildiğini görmek için {{ui:Çevrimdışı hazır}} düğmesine tıklayın; iki seçenek vardır: {{ui:Yeniden kaydet (en yeni sürümü al)}} ve {{ui:Çevrimdışı kopyayı kaldır}}. Saha ziyaretinden önce yeniden kaydedin ki kopya en yeni derlemeyle eşleşsin. Daha fazlası: [Çevrimdışı](common:offline).

:::offline
Şu anda çevrimdışısınız. CivilCraft çevrimdışı kullanım için kaydedildiyse her şey çalışır, örnek arsa dahil. Kaydedilmediyse bu sekmede çalışmaya devam edebilirsiniz; ancak bağlantı yeniden kurulana kadar sayfayı yenilemeyin. Kaydedilmiş kopya yoksa {{ui:Örnek arsayı aç}} "Örnek arsa yüklenemedi" hatasıyla başarısız olur.
:::

:::tip
Saha kullanımı için CivilCraft'ı çevrimdışı kullanım için kaydedin ve nokta dosyalarınızı doğrudan dizüstü bilgisayara aktarın. Bağlantı olmadan projeler ve dışa aktarımlar indirme olarak kaydedilir; böylece bir günlük ölçümleri içe aktarabilir, yüzeyi kontrol edebilir ve projeyi sahada kaydedebilirsiniz.
:::

Bulut kaydı henüz yapılmadı, masaüstü sürümleri de henüz çıkmadı. Bugün kaydettiğiniz dosyalar tek kopyadır: yedeklenen bir yerde saklayın.

## Dosyanın kullandığı eklentiler

Eklenti verisi içeren bir proje kaydettiğinizde (Bina yönetmelikleri işaretleri ya da Adresten arsaya kaynağı gibi) dosya hangi eklentileri ve hangi sürümlerini kullandığını kaydeder. Bu eklentilerin bulunmadığı bir bilgisayarda açarsanız, planın üstünde bir çubuk bunu söyler ve eklentiyi hesabınızın listesinden eklemeyi önerir. Kayıt yalnızca bir nottur: dosya her durumda açılır.

## Studio'dan geri al

CadCraft Studio içindeyken CivilCraft'ta bitirdiğiniz her adım Studio'ya bildirilir; böylece Studio'nun proje düzeyindeki geri al işlemi uygulamalar arasında son adımı geri alabilir. Studio bir adımı yalnızca CivilCraft'ın kendi geri al yığını o adımın bıraktığı durumdaysa geri alır; başka bir dosya açtıktan sonra bu pencereyi atlar.

## Kaydedilmemiş değişikliklerle kapatma

Projede kaydedilmemiş değişiklikler varken sekmeyi kapatır, yeniden yükler ya da sayfadan ayrılırsanız tarayıcı ayrılmak isteyip istemediğinizi sorar. Bu uyarının metni ve görünümü tarayıcıya aittir; CivilCraft bunu değiştiremez. {{ui:Yeni}} ile ya da bir proje veya LandXML dosyası açarken ise bunun yerine CivilCraft'ın kendi **Kaydedilmemiş değişiklikler** kutusunda sorulur; bu kutuda {{ui:İptal}}, {{ui:Kaydetme}} ve {{ui:Bir kopya kaydet}} seçenekleri bulunur.
