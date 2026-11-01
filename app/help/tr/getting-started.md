---
title: CivilCraft'a başlarken
summary: CivilCraft'ın ne yaptığı, nasıl açılacağı ve örnek arsayla noktalardan kontur eğrilerine, bir yola ve kaydedilmiş bir projeye ilk on dakika.
keywords: başla, ilk çalıştırma, örnek arsa, giriş, hızlı başlangıç, eğitim, başlangıç, yeni proje
from: c9b6dd8e
---

CivilCraft, CadCraft ailesinin inşaat ve arsa tasarım uygulamasıdır. Ölçü noktalarını alır ve kontur eğrileriyle bir yüzeye (TIN) dönüştürür; sonra tasarım boy kesitleriyle eksenler yerleştirmenize, basit bir yol koridoru süpürmenize, yapı platformlarını yarma-dolgu sınırına kadar tesviye etmenize, bir yerçekimi boru ağını kurallarınıza göre denetlemenize ve kazı ile dolgu hacimlerini görmenize izin verir. LandXML okur ve yazar, planı DXF olarak dışa aktarır ve PDF'e çıktı alır.

Civil 3D kullandıysanız fikirler tanıdık gelecektir: noktalar, nokta grupları, kırılma çizgileri, PI'ya göre eksenler, PVI'ya göre boy kesitleri, koridorlar, tesviye, boru ağları. Çalışma biçimi farklıdır ve çok daha küçüktür: komut satırı, stil ve çizim dosyası yoktur. İlk gerçek işinizden önce [Diğer inşaat yazılımlarından geliyorsanız](topic:coming-from) konusunu bir kez okuyun.

## Neye ihtiyacınız var

- Güncel bir masaüstü tarayıcı: Chrome, Edge, Firefox veya Safari. Bkz. [Tarayıcılar](common:browsers).
- Bir fare veya izleme dörtgeni ve bir klavye ya da bir dokunmatik ekran: çizimde orada ekran üzerinde {{ui:Bitir}}, {{ui:Noktayı geri al}} ve {{ui:İptal}} düğmeleri vardır (bkz. [Fare, izleme dörtgeni ve dokunma](topic:keyboard#mouse-trackpad-and-touch)).
- Plan, tarayıcının tuvaliyle 2B çizilir. [3B görünüm](topic:site-3d) tarayıcının WebGL grafiğini kullanır; başlayamazsa durum çubuğu nedenini söyler ve plan yine çalışır.
- Hesap ve yükleme yoktur. Dosyalar bilgisayarınızda açılır ve indirme olarak kaydedilir. Bkz. [Dosyalarınız](common:your-files).

:::note
CivilCraft bugün hâlâ yapım aşamasında olan erken bir tarayıcı sürümü olarak çalışır. Masaüstü sürümleri henüz mevcut değil ve bulutta kaydetme henüz mevcut değil. Yaptığınız her şey siz kaydedene veya dışa aktarana kadar bilgisayarınızda kalır.
:::

## CivilCraft'ı açın

1. CivilCraft'ı tarayıcınızda açın.
2. Ekranın dolmasını bekleyin: üstte bir araç çubuğu, solda bir panel, ortada plan ve sağda bir **Özellikler** paneli.
3. Boş bir planda **Ölçü noktalarıyla başlayın** başlıklı bir kutu görürsünüz. İlk adımları listeler ve {{ui:Örnek arsayı aç}} bağlantısını içerir.

CivilCraft'ı sonradan bağlantı olmadan kullanmak için uygulama çubuğunda {{ui:Çevrimdışı için kaydet}} düğmesine tıklayın ve {{ui:Çevrimdışı hazır}} yazısını bekleyin. Bu yardımı, örnek arsayı ve 3B ile GIS kütüphanelerini içerir. Bkz. [Çevrimdışı](common:offline). Bu yardımı uygulamanın yanında açmak için istediğiniz an {{key:F1}} tuşuna basın veya {{ui:Yardım}} düğmesine tıklayın.

## İlk on dakikanız: örnek arsa

Örnek arsa, ABD fitinde küçük bir ölçümdür: devlet düzlemi koordinatlarında 276 nokta, bir sırt, kot çizgisi (flowline) ve iki şev üstü olan bir hendek. Uygulamayla birlikte gelir, böylece kendi dosyanız olmadan takip edebilirsiniz.

1. Plandaki kutuda {{ui:Örnek arsayı aç}} bağlantısına tıklayın.
   **Nokta içe aktar** iletişim kutusu açılır. "276 nokta PNEZD olarak okundu (başlık satırından), virgülle ayrılmış." der ve ilk satırları gösterir.
2. {{ui:İçe aktar}} düğmesine tıklayın.
   Plan noktalar, kontur eğrileri ve yüzey kenarıyla dolar. Alttaki durum çubuğu noktaların içe aktarıldığını ve yüzeyin kaç üçgeni olduğunu (546) söyler.
3. Sol panelde **Noktalar** altına bakın. Noktalar tanımlarının ilk sözcüğüne göre gruplanır: CP, FL, GRD, RIDGE, TBN, TBS ve TREE.
4. O tablonun **Yüzey** sütununda **FL**, **RIDGE**, **TBN** ve **TBS** gruplarını {{ui:Kırılma çizgisi}} olarak ayarlayın.
   Yüzey hemen yeniden oluşur. **Yüzey** bilgileri artık "Kırılma çizgileri: 4" der ve kontur eğrileri kot çizgisi ve sırt boyunca onları kesmek yerine keskin biçimde bükülür.
5. İşaretçiyi plan üzerinde gezdirin. Durum çubuğu işaretçinin altındaki doğu ve kuzey değerlerini ve oradaki zemin kotunu gösterir.
6. **Gösterim** altında {{ui:Kontur aralığı}} değerini 0,5 ft yapın ve {{ui:Kot bantları}} seçeneğini açın. Onay kutularının altında bir gösterge ile bir renk geçişi görünür. İşiniz bitince bantları yeniden kapatın.

Artık mevcut bir zemin yüzeyiniz var. Sırada bir yol.

## Kısa bir yol yerleştirin

1. {{key:A}} tuşuna basın (veya **Tasarım** grubunda {{ui:Eksen}} düğmesine tıklayın).
2. Arsa boyunca üç noktaya art arda tıklayın. Kırmızı bir çizgi işaretçiyi izler ve sonraki teğetin uzunluğunu ve yön açısını gösterir.
3. Bitirmek için {{key:Enter}} tuşuna basın.
   Eksen istasyonlamayla görünür. Sağ panel **Eksen** gösterir: uzunluğu, PI tablosu ve ortadaki PI'daki eğri (100 ft yarıçap veya 100 ft sığmıyorsa daha küçük).
4. Sağ panelde **Tasarım boy kesiti** altında {{ui:Zeminden başlat}} düğmesine tıklayın.
   Boy kesiti görünümü planın altında mevcut zemin ve uçtan uca düz bir tasarım eğimiyle açılır.
5. {{ui:PVI ekle}} seçeneğini açmak için {{key:I}} tuşuna basın, sonra boy kesiti görünümünde ortaya yakın bir yere bir kez tıklayın. Bir PVI görünür.
6. Sağdaki PVI tablosunda ortadaki PVI'nın **Eğri L** kutusuna bir eğri uzunluğu (örneğin 100) yazın ve {{key:Enter}} tuşuna basın. Boy kesitinde artık K değeri etiketli bir düşey eğri vardır.
7. **Koridor** altında **Tasarım boy kesiti boyunca bir kesit süpür** seçeneğini işaretleyin.
   Yol zemine tesviye edilir: şeritler, bankuetler ve yarma-dolgu sınırına kadar yan şevler. **Toprak işleri** bloğu kazı ve dolguyu gösterir.

Tam değerler için endişelenmeyin. Her sayı sağ panelde değiştirilebilir ve {{key:Mod+Z}} son değişikliği geri alır.

## Çalışmanızı kaydedin

1. Sol panelin üstündeki **Ad** alanına bir ad yazın.
2. {{key:Mod+S}} tuşlarına basın (veya {{ui:Kaydet}} düğmesine tıklayın).
   Tarayıcı, arsanın adını taşıyan ve `.civilcraft.json` ile biten bir dosya indirir. Noktaları, yüzey ayarlarını, eksenleri, boy kesitlerini, koridorları, platformları ve boruları içerir.
3. Daha sonra devam etmek için {{ui:Aç}} düğmesine tıklayın (veya {{key:Mod+O}} tuşlarına basın) ve o dosyayı seçin ya da plana bırakın.

:::warning
Otomatik kaydetme yoktur. Kaydedilmemiş değişikliklerle sekmeyi kapatırsanız tarayıcı ayrılıp ayrılmayacağınızı sorar; ayrılırsanız değişiklikler gider. Sık kaydedin.
:::

## Sonraki adım

- Kendi dosyalarınızla [Ölçü noktalarını içe aktarma](topic:import-points).
- Kırılma çizgileri ve bir sınırla [Yüzeyi oluşturma ve inceltme](topic:build-surface).
- [Ekran, parça parça](topic:workspace).
- [Tuşlar ve fare](topic:keyboard).
