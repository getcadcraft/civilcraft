---
title: CivilCraft ayarları
summary: Kopyalanan ve yapıştırılan nokta satırlarının ve bir dosyanın sütunlarını tahmin etmek için sütun sırasını, yapıştırılan noktaların nasıl numaralandırıldığını, nokta etiketlerinin neyi gösterdiğini, köşe göstergesini, 3B dikey abartmayı, enlem ve boylamın nasıl gösterildiğini ve harita katmanlarının internetten gelip gelmediğini seçin.
keywords: ayarlar, tercihler, pnezd, penzd, sütun sırası, nokta satırları, yeniden numaralandırma, nokta numaraları, başlangıç numarası, nokta etiketleri, etiketler, tanım, kot, görünüm küpü, eksen simgesi, köşe göstergesi, pusula, dikey abartma, 3b, enlem, boylam, dms, ondalık derece, harita katmanları, internet, gizlilik
from: 64b9cb92
---

Uygulama çubuğundaki dişli ya da {{key:Mod+,}} ile {{ui:Settings}}'i açın. İlk sekme, {{ui:CivilCraft}}, bu uygulamaya ait ayarları tutar; {{ui:General}} ise her CadCraft uygulamasının paylaştığı ayarları tutar (tema, araç çubuğu, paneller). CivilCraft'ın ayarları yalnızca uygulamada vardır: onları burada değiştirirsiniz ve bu tarayıcı onları hatırlar. **CivilCraft ayarlarını sıfırla** her ayarı başlangıç değerine geri koyar.

## Nokta satırları

**P, N, E, Z, D** (başlangıç) ya da **P, E, N, Z, D**: nokta, kuzey, doğu, kot, tanım ya da doğu kuzeyden önce. Üç yerde kullanılır:

- **Kopyala**: bir e-tabloya CivilCraft'ın sistem panosuna koyduğu satırlar.
- **Yapıştır**: başlık satırı olmayan bir e-tablodan ya da metin dosyasından yapıştırılan satırlar.
- **İçe aktar**: bir dosyada başlık satırı olmadığında **Noktaları içe aktar** iletişim kutusundaki tahmin (dört sütunlu bir dosya PENZ, üçü ENZ olarak okunur). Bkz. [Nokta dosya biçimleri](topic:point-file-formats).

Sütunlarını adlandıran bir başlık satırı her zaman kazanır; içe aktarma iletişim kutusunun **Sütunlar** listesindeki bir seçim de öyle.

## Yapıştırılan noktalar için numaralar

- **Boş numaraları koru** (başlangıç): yapıştırılan bir nokta, hiçbir nokta onu kullanmıyorsa numarasını korur; yalnızca çakışan noktalar yeni numara alır.
- **Her zaman yeni numaralar**: yapıştırılan her nokta, kendisi boş olsa da yeni bir numara alır.

**Yeni numaralar şuradan başlar**: boş bırakın; o zaman kullanımdaki en yüksek numaranın bir fazlasından sayılır. Bir sayı yazın, örneğin 5000; yeni noktalar 5000'den itibaren numaralar alır, zaten kullanımda olan numaralar atlanır. Her iki durumda da iki nokta asla aynı numarayı paylaşmaz. Bkz. [Ölçü noktalarını seçin, kopyalayın ve yapıştırın](topic:copy-paste-points#point-numbers-never-clash).

## Nokta etiketleri

**Görüntüle** altında {{ui:Point labels}} açıkken bir nokta etiketinin neyi gösterdiği: **Numara**, **Numara ve kot** ya da **Numara, kot ve tanım** (başlangıç). DXF, DWG ve PDF dışa aktarımları ekranla aynı etiketleri gösterir.

## Köşe göstergesi

Planın ve 3B görünümün köşesinde ne durduğu: **Görünüm küpü** (başlangıç), **Eksen simgesi** ya da **Yok**.

- **Görünüm küpü** (sağ üst). Planda üstü, pusula halkasıyla gösterir: K, ızgara kuzeyidir (planın yukarısı). Küpün başka bir yanına, kenarına ya da köşesine tıklayın ya da sürükleyin, ve [3B görünüm](topic:site-3d) oradan bakarak açılır. Plan küpündeki {{ui:Home}} planı sığdırır.
- 3B görünümde küp görünümle birlikte döner: bir yana, kenara ya da köşeye tıklayarak oradan bakın, küpü sürükleyerek yörüngede dönün, pusula halkasını sürükleyerek dikey eksende döndürün, bir harfe tıklayarak o taraftan bakın ve tüm alanın izometrik görünümü için {{ui:Home}}'u kullanın. Bir yüze doğrudan bakarken küçük oklar bir sonraki yüze geçer, kavisli oklar görünümü çeyrek tur döndürür.
- **Eksen simgesi** (sol alt): planda küçük bir X (doğu) ve Y (kuzey) işareti, 3B'de X, Y ve Z (yukarı).

## 3B dikey abartma

3B görünümün kotları ne kadar gerdiği: **1×**, **2×** (başlangıç), **3×**, **5×** ya da **10×**. 3B görünümün çubuğundaki liste aynı ayardır, bu yüzden birini değiştirmek ikisini de değiştirir. Hacimler, boy kesitleri ve 3B dışa aktarımlar gerçek ölçekte kalır.

## Enlem ve boylam

Proje bir koordinat sistemine sahip olduğunda durum çubuğunda imlecin enlem ve boylamının nasıl gösterildiği: **derece, dakika ve saniye** (başlangıç, örneğin `30°18′00.00″ N`) ya da **ondalık derece** (`30.300000° N`). Bkz. [Projenin koordinat sistemini ayarlayın](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## İnternetten harita katmanları

**Kapalı** (başlangıç) ya da **Açık**. Açıkken CivilCraft, eklediğiniz harita sunucularından ekranda görünen alanın resimlerini ister. Çiziminiz bu bilgisayarda kalır; sunucu alanı ve internet adresinizi görür. Kapalıyken, açtığınız bir proje bir harita sunucusunu adlandırsa bile hiçbir harita sunucusuna bir şey sorulmaz; dosyadan gelen coğrafi referanslı bir resim her durumda çalışır. Bkz. [Planın altında harita katmanlarını gösterin](topic:map-layers).

## Yardımcılar

**Yapay zekâ yardımcılarının ve betiklerin CivilCraft'ı kullanmasına izin verin** (başlangıçta kapalı) bilgisayarınızdaki bir yardımcının açık alanınıza CadCraft Studio üzerinden erişmesine izin verir: **Oku** alanı tanımlar ve nokta, yüzey kotu, istasyon, boy kesiti, hacim ve parsel verir; **Düzenle** ölçü noktaları seçmesine ve eklemesine izin verir; **Kaydet** ve **Dışa aktar** projeyi kaydetmesine ya da LandXML ya da DWG yazmasına izin verir. **Kullanabileceği klasörler** (Studio'da) kaydedebileceği ve dışa aktarabileceği yerlerdir. **Etkinlik** çağrılarını listeler. Bkz. [Bir yapay zekâ yardımcısının sahanızla çalışmasına izin verin](topic:assistants).
