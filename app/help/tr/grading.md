---
title: Bir bina platformunu tesviye etme
summary: Düz bir platform çizin, kotunu ve kesme ile dolgu şevlerini ayarlayın; CivilCraft onu mevcut zemine yarma-dolgu sınırıyla bağlasın ve önerilen yüzeye ekleyin.
keywords: istinat duvarı, istinat duvarları, dikey yüzey, şev yerine duvar, taraf başına şev, dolgu, tesviye, platform, bina platformu, yarma-dolgu sınırı, özellik çizgisi, tesviye grubu, kesme şevi, dolgu şevi, son tesviye, önerilen yüzey, arsa tesviyesi
from: 482319a6
---

Bir platform, tek bir kotta düz bir alandır. Kenarından CivilCraft, zemin platformdan yüksekse **kesme şevinizde**, alçaksa **dolgu şevinizde** dışa doğru tesviye yapar; eğim mevcut zemine ulaşana kadar. Bu buluşma çizgisi yarma-dolgu sınırıdır. Platform ve şevleri, önerilen yüzeyi oluşturmak için yarma-dolgu sınırının içindeki mevcut zemini değiştirir.

## Platformu çizin

Önce bir mevcut zemin yüzeyine ihtiyacınız var.

1. {{key:G}} tuşuna basın veya **Tasarım** grubunda {{ui:Pad}} düğmesine tıklayın.
   İpucu şunu söyler: "Platform: köşelerine tıklayın. Enter veya çift tıklama bitirir, Backspace son köşeyi bırakır, Esc iptal eder."
2. Platformun köşelerine sırayla tıklayın, hangi yönde olursa olsun. Mavi bir ana hat işaretçiyi izler.
3. Son köşeden sonra {{key:Enter}} tuşuna basın (en az üç köşe).
   Platform çizilir ve seçilir. Orta noktadaki zemin kotunda başlar, 0.1'e yuvarlanmış; 2 : 1 kesme şevi ve 3 : 1 dolgu şevi ile. Durum çubuğu, örneğin, "Platform 1, 254.3 kotunda (orta noktadaki zemin), kesme 2:1, dolgu 3:1. Özellikler içinde değiştirin." der.

:::warning
{{key:Enter}} ile bitirin. Çift tıklama da bitirir, ama bu sürümde çift tıkladığınız köşeyi bırakır. Son köşeye bir kez tıklayın, sonra {{key:Enter}} tuşuna basın.
:::

Platform ana hattı kendini kesmemelidir (kendini kesen bir ana hat "Platform ana hattı kendini kesiyor." uyarısıyla bildirilir).

## Kotu ve şevleri ayarlayın

Platform seçiliyken sağ panel **Platform** bölümünü gösterir:

1. **Ad**.
2. **Kot**: platformun düz kotu.
3. **Kesme şevi** ve **Dolgu şevi**, H:V olarak (2, 2 : 1 anlamına gelir). İkisi de 0'dan büyük olmalıdır.
4. **Platform alanı** ve **Köşeler** bilgi amaçlı gösterilir.

Her değerden sonra {{key:Enter}} tuşuna basın. Yarma-dolgu sınırı, önerilen yüzey ve hacimler hemen güncellenir.

Alanların altında, örneğin "Yarma-dolgu sınırı: 48 şev çizgisi (20 kesmede, 28 dolguda), en uzak 31.20 ft dışarıda." gibi bir satır okunur. Plan, yarma-dolgu sınırını ve şev çizgilerini macenta renkte gösterir.

## Yarma-dolgu sınırı nasıl bulunur

- Şev çizgileri her kenardan ona dik olarak çıkar, platform boyutunun yaklaşık yirmide birinde bir.
- Dış köşelerde 10° aralıklarla yelpaze açılır; böylece şev köşenin etrafını sarar.
- İç köşelerde, iki kenardan gelen şevlerin buluştuğu açıortay boyunca bir çizgi çalışır.
- Her çizgi, zemine ulaşana kadar kesme şevinde yükselir veya dolgu şevinde alçalır.

## Taraf başına şevler ve istinat duvarları

Bir platformun veya bir bermin Özellikler bölümündeki **Taraflar ve istinat duvarları** altında her taraf kendi yolunda tesviye edilebilir. 1. taraf tıkladığınız ilk köşeden ikinciye, 2. taraf ikinciden üçüncüye uzanır ve böyle devam eder.

- **Tüm taraflar**: **Eğimli** her tarafta yukarıdaki kesme ve dolgu şevlerini kullanır; **Dikey: istinat duvarları** her tarafa bir duvar koyar.
- Taraf başına: **Üstteki şevler**, **Kendi şevleri** (o taraf için bir kesme ve bir dolgu şevi yazın) veya **Dikey (istinat duvarı)**.
- Bir şevi `3` veya `3:1` (yatay / 1 dikey), `33%` veya `18.4°` olarak yazın; H:1 olarak gösterilir. Platformun kendi **Kesme şevi** ve **Dolgu şevi** alanları da aynısını kabul eder.
- Dikey bir tarafta dolgu yoktur: bir istinat duvarı kenar boyunca, platformdan aşağı mevcut zemine (dolguda) veya zeminden aşağı platforma (kesmede) uzanır. **Duvar kalınlığı** (başlangıçta 0.3 m veya 1 ft) zeminin platform kenarından mevcut zemine ne kadar basamak yaptığıdır. Kesme ve dolgu hacimleri, artık olmayan o taraftaki dolguyu dışarıda bırakır.
- Bir duvar eğimli bir tarafla buluştuğunda, şev duvarın ucunu sarar; iki duvar gönye birleşimiyle buluşur.
- Alanların altında: duvarların uzunluğu, açıkta kalan yüzü (yükseklik × uzunluk), en yüksek ve ortalama yüksekliği.

Plan, her duvarın dış yüzünü üzerine çizilen kısa çizgilerle ve her iki ucunda ve en yüksek noktasında yüksekliğiyle çizer (DXF ve DWG'ye giren istinat duvarları katmanında da). 3B görünüm duvarları katı olarak gösterir (Göster › İstinat duvarları) ve GLB, OBJ ve USD dışa aktarımları bunları içerir. Kenar boyunca kesitler basamağı gösterir.

**Uyarılar** (Özelliklerde ve Sorunlar panelinde): **Şu duvar yüksekliğinden uyar** (başlangıçta 1.0 m veya 3.3 ft) üstündeki bir duvar, "mühendislik duvarı veya izin gerektirebilir; yerel kuralları kontrol edin" uyarısını verir. **Zeminin durduğu en dik eğim** değerini yazdığınızda ise kesme veya dolgu şevi bundan daha dik olan her taraf uyarılır. Bunlar uyarıdır: tesviye yine de yapılır. Her değişiklik {{key:Mod+Z}} için bir adımdır.

## Köşeleri taşıyın

Platformu seçin, sonra bir köşedeki kare tutamacı sürükleyin. Her sürükleme tek bir geri alma adımıdır. Köşe eklemek veya kaldırmak henüz mümkün değildir: platformu silin ve yeniden çizin.

## Tesviye olmadığında

**Toprak işleri** altındaki kırmızı bir kutu platformu ve sorunu adlandırır:

| Mesaj | Ne yapmalı |
|---|---|
| 3 şev çizgisi, yüzeyle buluşmadan yüzeyin dışına çıkıyor: platform yüzeyin kenarına çok yakın veya çok yüksek/alçak. | Platformu yüzeyin kenarından içeri taşıyın veya kotunu zemine yaklaştırın. |
| Yarma-dolgu sınırı kendini kesiyor (platformun farklı taraflarındaki şevler birbirine giriyor). Platformun şeklini değiştirin veya şevleri değiştirin. | Dar veya L şekilli platformlarda derin kesme ya da yüksek dolguda tipiktir. Platformu genişletin, farkı düzleştirin veya şevleri dikleştirin. |
| Platform ana hattı kendini kesiyor. | Köşeleri platform etrafında sırayla yeniden çizin. |

Sorunu olan bir platform, düzeltilene kadar önerilen yüzeyden ve hacimlerden çıkarılır.

## Sonucu görün

1. **Görüntüle** altında **Yüzey**'i {{ui:Proposed (graded)}} olarak ayarlayın. Konturlar artık platform boyunca düz uzanır ve şevleri izleyerek yarma-dolgu sınırına kadar gider.
2. İşaretçiyi platformun üzerine getirin: durum çubuğu **Zemin** ve **Tesviye** kotlarını gösterir.
3. **Toprak işleri** altında kesme ve dolguyu okuyun; bkz. [Toprak işi hacimleri](topic:volumes).

Platformlar koridorlardan sonra, çizildikleri sırayla tesviye edilir. Daha sonra çizilen bir platform, kendi yarma-dolgu sınırı içinde önceki her şeyin yerine geçer.

## Platformu silin

Seçin ve {{key:Delete}} tuşuna basın (Mac'te Fn ve delete), ya da {{ui:Delete}} düğmesine tıklayın.

## Henüz yapılmadı

Platformlar düzdür: eğimli platformlar, değişken eğimli özellik çizgileri, basamaklar ve bir mesafe veya kot hedefine tesviye henüz kullanılamaz. Bkz. [Henüz yapılmadı](topic:not-built-yet).
