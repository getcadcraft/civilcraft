---
title: Tarayıcılar ve bilgisayarlar
summary: Uygulamaların hangi tarayıcılarda çalıştığı, tarayıcılar arasındaki farklar ve bilgisayarınızın nelere ihtiyaç duyduğu.
keywords: chrome, edge, firefox, safari, brave, tarayıcı, mac, windows, linux, ipad, tablet, webgl, gereksinimler, bellek
from: a11b09b1
---

Uygulamalar bir web tarayıcısının içinde çalışır. İşi kendi bilgisayarınızda yaparlar: dosyalarınız orada açılır ve bize hiç gönderilmez (bkz. [Dosyalarınız nereye gider](common:your-files)).

## Hangi tarayıcı

Bunlardan birinin güncel bir sürümünü kullanın:

| Tarayıcı | Motor | Notlar |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | En eksiksiz olanı: klasör seçme, çevrimdışı kullanım için kaydetme, dosya işleme. |
| Firefox | Gecko | Çalışır. Bir klasörün tamamını açmak daha basit bir seçici kullanır. Çevrimdışı kaydetme özel pencerelerde çalışmayabilir. |
| Safari | WebKit | Mac ve iPad'de çalışır. Bir klasörün tamamını açmak daha basit bir seçici kullanır. Safari, birkaç haftadır kullanmadığınız bir çevrimdışı kopyayı silebilir. |

Üç motor da günlük iş için uygundur. Bir uygulama birinde bir şeyi farklı yapıyorsa yardımı sizin tarayıcınızın adımlarını gösterir.

## Tarayıcılar arasındaki farklar

- **Klasör açma.** Chromium tarayıcıları gerçek bir klasör seçici gösterir ve klasörü doğrudan okuyabilir. Firefox ve Safari bir klasör seçmenizi ister ve içindeki her dosyayı okur; bu, büyük proje klasörleri için daha uzun sürer. Klasörü uygulamanın üstüne sürüklemek üçünde de çalışır.
- **Kaydetme.** Uygulamalar bir dosya indirerek kaydeder. İndirmelerin nereye gideceğine ve önce sorulup sorulmayacağına tarayıcınız karar verir.

:::chromium
Chrome ya da Edge'de her seferinde bir klasör seçmek için "İndirmeden önce her dosyanın kaydedileceği yeri sor" seçeneğini açın (Ayarlar içinde, İndirilenler altında).
:::

:::firefox
Firefox'ta her seferinde bir klasör seçmek için Ayarlar'ı, ardından Genel'i, ardından İndirmeler'i açın ve "Dosyaların nereye kaydedileceğini her zaman sor" seçeneğini işaretleyin.
:::

:::safari
Safari'de her seferinde bir klasör seçmek için Ayarlar'ı, ardından Genel'i açın ve "Dosya indirme konumu" ayarını "Her indirme için sor" yapın.
:::

## Mac, Windows ve Linux

Uygulamalar her bilgisayarda aynıdır. Değişen şey klavyedir: kısayollar bilgisayarınıza göre otomatik olarak yazılır. Bkz. [Tuşlar, fareler ve izleme dörtgenleri](common:keys).

## Tabletler ve dokunmatik ekranlar

Bazı uygulamalar dokunmayı kabul eder (tek parmak çizer ya da seçer, iki parmak yakınlaştırmak ve kaydırmak için sıkıştırır). Her uygulamanın yardımı bunu yapıp yapmadığını söyler. iPad'de Safari ya da Chrome kullanın. Yazılan komutları kullanan uygulamalarda bir klavye işe yarar.

## En eski tarayıcı ve sistem

Bunları tahminle değil, 0.7 uygulamalarının kodundan okuduk: her dosya ayrıştırıldı ve kullandığı her dil özelliği tarayıcıların yayımlanmış uyumluluk verilerinde arandı. Bu sürümlerin altında uygulamalar başlayamaz bile, çünkü tarayıcı kodu anlamaz.

| | Uygulamaları başlatabilen en eski sürüm |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS ve iOS 16.4) |

CadCraft Studio, Windows'ta kendi web motorunu taşır; bu yüzden Windows 10 ya da 11 gerekir. Mac'te sistemin motorunu kullanır; bu yüzden macOS 13.3 veya sonrası gerekir. Studio'daki Ayarlar › Güncellemeler, kopyanızın neyin üzerinde çalıştığını gösterir.

Bu, koddan okunan, *başlayabilen* en eski sürümdür. Uygulamaları içinde çalıştırdığımız eski tarayıcıların listesi değildir; bu yüzden başlayan daha eski bir tarayıcıda yine de bir özellik eksik olabilir.

## Bilgisayarınızın ihtiyaçları

Bunlar uygulamalar için planlanan asgari değerlerdir, ölçülmüş gereksinimler değildir:

- 8 GB bellek (büyük birleşik modeller için 16 GB önerilir).
- 3D uygulamaları için WebGL 2 destekli bir grafik yongası. Bir 3D görünüm boş kalırsa tarayıcınızın ayarlarında donanım hızlandırmanın açık olduğunu denetleyin.
- Tam araç çubukları için en az 1280 piksel genişliğinde bir ekran; daha küçük ekranlar bunları satırlara sarar.

Çok büyük dosyalar (büyük pafta takımları, büyük modeller) bir tarayıcı sekmesinde çok bellek kullanır. Bir uygulama yavaşlarsa diğer ağır sekmeleri kapatın.
