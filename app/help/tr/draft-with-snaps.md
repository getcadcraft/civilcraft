---
title: Yakalamalarla çizin, köşeleri seçin ve taşıma, kopyalama, döndürme
summary: Eksenleri, platformları, parselleri ve özellik çizgilerini zaten var olan noktalara ve köşelere tam olarak yerleştirin; bir köşenin doğu ve kuzey koordinatını yazın veya seçin, bir tanjantı iki noktaya doğru çevirin ve bir nesneyi bir mesafe veya açıyla taşıyın, kopyalayın veya döndürün.
keywords: yakalama, yakalamalar, osnap, noktaya yakalama, köşeye yakalama, PI, köşe noktası, köşe, seçim, artı imleç, doğu, kuzey, koordinatlar, yazılan koordinatlar, teğet, yön, yön açısı, taşı, kopyala, döndür, döndürerek kopyala, çoğalt, Alt, serbest nokta, çizim
from: 49864dda
---

0.9 sürümünde yeni: çizim yaptığınızda imleç, planda zaten var olan noktalara ve köşelere oturur; bir platformun, parselin veya özellik çizgisinin köşesi yazılabilir veya seçilebilir. Bu konu üç aracı adım adım anlatır.

## Ne yapacaksınız

- Yakalamalarla çizin; böylece yeni bir eksen, platform, parsel veya çizgi var olan bir şeyin tam üstünde başlar ve biter.
- Bir köşenin doğu ve kuzey koordinatını yazarak veya planda bir yer seçerek belirleyin.
- Bir eksenin tanjantını seçilen iki noktaya doğru çevirin.
- Bütün bir nesneyi taşıyın, kopyalayın veya döndürün.

## Adımlar

1. {{ui:Eksen}}, {{ui:Platform}}, {{ui:Parsel}} veya {{ui:Özellik çizgisi}} gibi bir çizim aracı seçin. İmleci bir ölçü noktasının, bir eksen PI'sinin, bir platformun, parselin veya kütle köşesinin, bir özellik çizgisi köşe noktasının ya da bir yağmur suyu yapısının yakınına getirin. Bir etiketle (PI, Köşe, Köşe noktası, Yapı veya Nokta ve numarası) bir işaret ve noktanın oturacağı doğu ve kuzey koordinatı görünür. Noktayı orada yerleştirmek için tıklayın.
2. Noktayı serbestçe yerleştirmek için tıklarken {{key:Alt}} tuşunu basılı tutun. Yakalama kapanır.
3. Bir platform, parsel veya özellik çizgisi seçin. Özellikler içindeki {{ui:Köşeler}} bloğu, her köşeyi bir Doğu kutusu ve bir Kuzey kutusuyla listeler. Yeni sayıları yazın veya bir köşenin yanındaki artı imleci düğmesine basıp planda bir yer tıklayın. Köşe o doğu ve kuzey koordinatını alır. Seçimi iptal etmek için {{key:Esc}} tuşuna basın. Artı imleci yalnızca planda çalışır: önce 3B görünümü kapatın.
4. Bir tanjantı çevirmek için bir eksen seçin. Özellikler içinde, {{ui:İki noktadan teğet}} altında tanjantı seçin, {{ui:İlk nokta}} düğmesine basıp planda tıklayın, {{ui:İkinci nokta}} düğmesine basıp tekrar tıklayın, sonra {{ui:Yönü ayarla}} düğmesine basın. Tanjant, ilk noktadan ikinciye doğru gidecek şekilde döner ve uzunluğunu korur.
5. Taşımak, kopyalamak veya döndürmek için bir eksen, platform, parsel veya özellik çizgisi seçin. Özellikler içinde, {{ui:Taşı, kopyala ve döndür}} altında {{ui:Doğuya taşı}} ve {{ui:Kuzeye taşı}} değerlerini yazın (negatif sayılar batı ve güneye gider) ve {{ui:Taşı}} veya {{ui:Kopyala}} düğmesine basın. Ya da {{ui:İki noktadan mesafe}} düğmesine basın ve taşınacak noktaya ve gidilecek noktaya tıklayın.
6. Döndürmek için derece cinsinden açıyı {{ui:Saat yönünün tersine döndür}} alanına yazın, sonra {{ui:Döndür}} veya {{ui:Döndürerek kopyala}} düğmesine basın. Nesne, köşelerinin ortası etrafında döner; açının yanındaki artı imleciyle bir döndürme noktası seçmediğiniz sürece.

## Notlar

- Bir kopya, orijinali olduğu yerde bırakır ve sonra seçilir.
- Her taşıma, kopyalama, döndürme, seçilen köşe ve çevrilen tanjant tek bir geri alma adımıdır.
- Yakalamalar imleçten 10 ekran pikseli uzaklığa kadar çalışır. Bir yakalama işareti yalnızca bir yer önerir; siz tıklayana kadar hiçbir şey değişmez.
- Aynı artı imleci bir eksenin PI satırlarında da bulunur. Bkz. [Eksenler](topic:alignment), [Parseller](topic:parcels) ve [Özellik çizgileri](topic:feature-lines).
