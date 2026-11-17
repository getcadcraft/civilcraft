---
title: Açabileceğiniz, kaydedebileceğiniz ve dışa aktarabileceğiniz dosyalar
summary: Nokta dosyalarını, LandXML dosyalarını ve CivilCraft projelerini içe aktarın; projeleri, LandXML, DXF ve PDF dosyalarını dışa aktarın; her birinin neyi tuttuğunu, dosyaların nereye gittiğini ve çevrimdışıyken neyin değiştiğini öğrenin.
keywords: aç, kaydet, dışa aktar, içe aktar, dosya biçimleri, csv, txt, landxml, xml, dxf, pdf, json, indir, proje dosyası
from: 82bff559
---

CivilCraft bilgisayarınızdan dosya açar ve dosyaları bilgisayarınıza indirerek kaydeder. Hiçbir şey yüklenmez ve hiçbir şey bir sunucuda tutulmaz. Ayrıca bkz. [Dosyalarınız](common:your-files).

## Açtıkları

{{ui:Open}} düğmesine tıklayın (veya {{key:Mod+O}} tuşlarına basın) ve bir dosya seçin ya da dosyayı {{pick:mac=Finder|windows=Dosya Gezgini|linux=dosya yöneticiniz}} içinden plana sürükleyin. Bir seferde bir dosya; 200 MB'den büyük dosyalar reddedilir. 32 MB'den büyük bir LandXML ya da proje dosyası, asla tek bir metin bloğu olarak değil, yaklaşık 4 MB'lik parçalar halinde okunur; bir LandXML açılırken belleğe dosya boyutunun yaklaşık 13 katı kadar yer kaplayabileceğini unutmayın (testimizde 69 MB'lik bir dosya yaklaşık 0.9 GB kullandı).

| Tür | Dosya adları | Ne olur |
|---|---|---|
| Nokta dosyası | `.csv`, `.txt`, `.pnt`, `.xyz` (herhangi bir metin dosyası) | **Noktaları içe aktar** iletişim kutusu açılır. Noktalar, projenin noktalarının yerini alır; eksenler, platformlar ve borular kalır. |
| LandXML | `.xml`, `.landxml` | Dosyadan **yeni bir proje** oluşturulur (mevcut projede kaydedilmemiş değişiklikler varsa önce sorulur). |
| CivilCraft projesi | `.civilcraft.json` (herhangi bir `.json`) | Proje, kaydedildiği gibi açılır (mevcut projede kaydedilmemiş değişiklikler varsa önce sorulur). |

CivilCraft, karar vermek için önce dosyanın uzantısına, ardından ilk karakterlerine bakar: `{` ile başlayan metin proje olarak, `<` ile başlayan metin LandXML olarak, diğer her şey ise nokta dosyası olarak okunur. Açma kutusunun gri gösterdiği bir dosya yine de plana bırakılabilir.

:::note
Noktaları olan bir projeye nokta dosyası içe aktarmak, onları sormadan değiştirir ve geri al geçmişini temizler (herhangi bir dosyayı açmak geri al için yeni bir başlangıçtır). Yüzey LandXML'den geldiyse, nokta içe aktarmak onu noktalardan oluşturulmuş bir yüzeye geri çevirir. Eski noktaları geri istemeniz ihtimali varsa önce kaydedin.
:::

Ayrıntılar: [Nokta dosyası biçimleri](topic:point-file-formats), [LandXML: okunanlar ve yazılanlar](topic:landxml-reference).

## Kaydettikleri

{{ui:Save}} ({{key:Mod+S}}) yan yana iki dosya yazar; bu dosyalar sol paneldeki **Ad** esas alınarak adlandırılır: düzenlemeye devam ettiğiniz proje `<name>.civilcraft.json`, ve aynı tasarım herkes için IFC 4.3 olarak `<name>.ifc` (bkz. [IFC dışa ve içe aktarma](topic:ifc)). Her dosya diğerine kayıt düşer ve IFC ayrıca projenin sıkıştırılmış bir kopyasını taşır; böylece yalnız gönderilen bir IFC de tamamen düzenlenebilir olarak yeniden açılır.

- **Studio'da** her iki dosya da yan yana, olduğu yerde yazılır.
- **Chrome ve Edge'de** ilk kayıt bir klasör sorar ve ikisini de oraya yazar; sonraki kayıtlar aynı klasöre gider. Bunun yerine ikisini de indirmek için klasör sorusunu İptal ile kapatın.
- **Diğer tarayıcılarda** her iki dosya da indirilir; proje dosyası önce gelir.

Her iki dosyadan birini açmak diğerini arar. İkisini birlikte açın (veya ikisini de bırakın) ya da birini açın: Studio'da diğeri aynı klasörde bulunur; bir tarayıcıda CivilCraft, onu eklemenizi ya da sahip olduğunuz dosyayla devam etmenizi ister. CivilCraft kaydettikten sonra IFC başka bir programla değiştirildiyse ya da bir dosya diğerinden eskiyse, proje daha yeni tasarımdan açılır ve **Sorunlar** paneli ne olduğunu anlatır; bu panelde **Şimdi kaydet** (iki dosyayı yeniden yazar) ve **IFC'nin geometrisini başvuru olarak göster** seçenekleri bulunur. Başka bir programın değiştirdiği tek başına bir IFC, projenin kendi kopyasından, uyan kısımlarla açılır: değiştirdiği eksenler onun geometrisini alır, sildiği nesneler dışarıda bırakılır ve değişikliklerinin geri kalanı listelenir, uygulanmaz. 0.7.1 öncesindeki bir proje dosyası eskisi gibi açılır.

Proje dosyası şunları tutar:

- her nokta (numara, koordinatlar, kot, tanım) ve geldikleri nokta dosyasının adı
- yüzey ayarları: grup seçimleri, çizilen kırılma çizgileri, sınır, en uzun dış kenar ve LandXML'den okunan bir TIN
- görüntü ayarları
- PI'leriyle, yarıçaplarıyla ve başlangıç istasyonlarıyla eksenler, tasarım profilleri (PVI'ler ve eğri uzunlukları) ve koridor ayarları
- platformlar ve kuralları olan boru ağı

Geri al geçmişini tutmaz. Yüzeyler, kot eğrileri, yarma-dolgu sınırı çizgileri ve hacimler saklanmaz; proje açıldığında kaydedilmiş girdilerden yeniden oluşturulur. Daha yeni bir CivilCraft'tan gelen proje dosyası, sürümünü adıyla belirten bir iletiyle reddedilir.

## Dışa aktardıkları

| Düğme | Dosya | İçerik |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: noktalar, mevcut zemin (ve varsa tesviye edilmiş yüzey) TIN yüzeyleri olarak, eksenler, zemin ve tasarım profilleri, boru ağı |
| {{ui:DXF}} | `<name>.dxf` | Planın gösterildiği haliyle çizgi işleri, adlandırılmış katmanlarda R12 DXF |
| {{ui:DWG}} | `<name>.dwg` | Aynı çizgi işleri, seçtiğiniz biçimde (2000 ile 2018 arası) bir DWG çizimi olarak |
| {{ui:PDF}} | `<name>.pdf` | Seçtiğiniz ölçekte bir sayfada planın vektör çıktısı |
| {{ui:GLB}} veya {{ui:OBJ}} (3B görünümün çubuğunda) | `<name>-3d.glb`, `<name>-3d.obj` | 3B görünümün 3B model olarak gösterdikleri: metre, Y yukarı, gerçek ölçek, kaydedilmiş yerel bir orijin etrafında |

Her birinin dışarıda bıraktıkları: [LandXML alışverişi](topic:landxml), [Planı DXF'e dışa aktarma](topic:dxf-export) (DWG de), [Planı PDF'e çıktı alma](topic:plot-pdf), [Arsayı 3B olarak dışa aktarma](topic:export-3d).

## Dosyaların gittiği yer

Kaydedilen ve dışa aktarılan dosyalar, tarayıcınızın indirmeleri koyduğu yere gider; genellikle İndirilenler klasörüne. Her seferinde bir klasör seçmek için:

:::chromium
Tarayıcının **Ayarlar** bölümünü açın, sonra **İndirilenler**'e gidin ve **Her dosyayı indirmeden önce nereye kaydedeceğimi sor** seçeneğini açın.
:::

:::firefox
**Ayarlar**'ı açın, sonra **Genel**'e gidin ve **Dosyalar ve Uygulamalar** altında **Dosyaları nereye kaydedeceğimi her zaman sor**'u seçin.
:::

:::safari
**Safari > Ayarlar > Genel**'i açın ve **Dosya indirme konumu**'nu **Her indirmede sor** olarak ayarlayın.
:::

Aynı adla iki kez kaydederseniz, tarayıcı ikinci dosyaya bir numara ekleyebilir; örneğin `Site (1).civilcraft.json`. Bir dahaki sefere en yeni olanı açın.

## Çevrimiçi ve çevrimdışı

CivilCraft her durumda yalnızca bilgisayarınızda çalışır: açmak dosyayı tarayıcıda okur, kaydetmek ise onu indirir. Hiç bağlantı olmadan CivilCraft'ı açmak için önce çevrimdışı kullanım için kaydedin:

1. Çevrimiçiyken, üstteki uygulama çubuğunda {{ui:Çevrimdışı için kaydet}} düğmesine tıklayın.
2. Düğme sayar ("12 / 30 kaydediliyor") ve sonra {{ui:Çevrimdışı hazır}} gösterir. CivilCraft küçüktür (yaklaşık 0.6 MB), bu yüzden bir an sürer. Kaydedilen kopya bu yardımı ve örnek arsayı da içerir.
3. Bağlantı yokken aynı adresi (veya onun yer imini) açın. Her şey çalışır, {{ui:Örnek arsayı aç}} dahil.

Düğmenin diğer durumları:

- {{ui:Kaydedilemedi}}: bazı dosyalar indirilemedi. Bağlantıyı kontrol edin ve yeniden denemek için tıklayın.
- {{ui:Çevrimdışı kullanım yok}}: bu tarayıcı penceresi çevrimdışı bir kopya tutamaz (gizli pencereler ve bazı yönetilen bilgisayarlar bunu engeller). Normal bir pencere kullanın.

Kopyanın ne zaman kaydedildiğini görmek için {{ui:Çevrimdışı hazır}} düğmesine tıklayın; iki seçenek vardır: {{ui:Yeniden kaydet (en yeni sürümü al)}} ve {{ui:Çevrimdışı kopyayı kaldır}}. Bir arsa ziyaretinden önce yeniden kaydedin ki kopya en yeni derlemeyle eşleşsin. Daha fazlası için [Çevrimdışı](common:offline).

:::offline
Şu anda çevrimdışısınız. CivilCraft çevrimdışı kullanım için kaydedildiyse, örnek arsa dahil her şey çalışır. Kaydedilmediyse bu sekmede çalışmaya devam edin, ama yeniden çevrimiçi olana kadar sayfayı yenilemeyin; kaydedilmiş kopya olmadan {{ui:Örnek arsayı aç}} "Örnek arsa yüklenemedi" hatasıyla başarısız olur.
:::

:::tip
Sahada kullanım için CivilCraft'ı çevrimdışı kullanım için kaydedin ve nokta dosyalarınızı doğrudan dizüstü bilgisayara getirin. Projeler ve dışa aktarımlar bağlantı olmadan indirme olarak kaydedilir; böylece bir günlük ölçümleri içe aktarabilir, yüzeyi kontrol edebilir ve projeyi sahada kaydedebilirsiniz.
:::

Bulut kaydı henüz kullanılamıyor ve masaüstü sürümleri henüz çıkmadı. Bugün, kaydettiğiniz dosyalar tek kopyadır: yedeklenen bir yerde saklayın.

## Dosyanın kullandığı eklentiler

Bir eklentiden veri tutan bir projeyi kaydettiğinizde (Yapı yönetmeliği onay kutuları veya Adresten arsaya kaynak), dosya hangi eklentileri ve hangi sürümleri kullandığını kaydeder. Eklentisi olmayan bir bilgisayarda açarsanız, planın üstündeki bir çubuk bunu söyler ve hesabınızın listesinden eklemeyi önerir. Kayıt yalnızca bir nottur: dosya her durumda açılır.

## Studio'dan geri al

CadCraft Studio içinde, CivilCraft'ta tamamladığınız her adım Studio'ya bildirilir; böylece Studio'nun proje düzeyindeki geri alma özelliği, en son adımı uygulamalar arasında geri alabilir. Studio, bir adımı yalnızca CivilCraft'ın kendi geri alma yığını o adımın bıraktığı gibi olduğunda geri alır; başka bir dosya açtıktan sonra bu pencereyi atlar.

## Kaydedilmemiş değişikliklerle kapatma

Projede kaydedilmemiş değişiklikler varken sekmeyi kapatır, yeniden yüklerseniz ya da sayfadan ayrılırsanız, tarayıcı ayrılmak isteyip istemediğinizi sorar. Bu sorunun yazısı ve görünümü tarayıcıya aittir ve CivilCraft tarafından değiştirilemez. {{ui:Yeni}} ile ya da bir proje veya LandXML dosyası açarken ise CivilCraft'ın kendi **Kaydedilmemiş değişiklikler** kutusu sorar; seçenekleri {{ui:İptal}}, {{ui:Kaydetme}} ve {{ui:Bir kopya kaydet}}.
