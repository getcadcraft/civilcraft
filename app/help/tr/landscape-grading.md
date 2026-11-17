---
title: Peyzaj için tesviye
summary: Sürüklediğiniz nokta kotları ve kot eğrileriyle platformlar, bermler, çukur hendekler ve serbest tesviye; canlı kazı ve dolgu, yamaç analizi, akış okları ve su birikimi; hepsi CivilCraft'ın önerilen yüzeyinde.
keywords: istinat duvarı, istinat duvarları, düşey kenar, yamaç yerine duvar, kenar başına yamaç, dolgu, peyzaj tesviyesi, platform, teras, ev platformu, berm, höyük, çukur hendek, nokta kotu, kot eğrileri, kot eğrilerini düzenle, kazı ve dolgu, toprak işleri, yamaç analizi, erişilebilirlik, dik yamaçlar, akış okları, drenaj, su birikintisi, birikinti
from: e1559eb9
---

Her şey, platformlarla ve kanallarla aynı tesviye ile **önerilen yüzeye** tesviye edilir. **Mevcut zemin** hiçbir zaman değiştirilmez ve Toprak işleri hepsini sayar. Tesviye menüsü Peyzaj grubundadır.

## Platformlar

{{ui:Tesviye}} › {{ui:Platform}}, sonra köşeleri tıklayın ve {{key:Enter}} tuşuna basın. Platform, altındaki ortalama zemin kotunda başlar; ayarlamak için bir **Kot** yazın veya zemini yeniden izlemesi için boş bırakın. Yüzde olarak bir **Eğim** ve derece olarak **Eğim yönü** (0 = doğu, 90 = kuzey) onu eğdirir. Yanları **Kazı şevi** ve **Dolgu şevi** ile (yatay:1) zemine tesviye edilir.

## Kenar başına yamaçlar ve istinat duvarları

Bir platform, bir berm veya bir ev platformunun Özellikler'inde **Kenarlar ve istinat duvarları** altında her kenar kendi yöntemiyle tesviye edilebilir. 1. kenar tıkladığınız ilk köşeden ikinciye, 2. kenar ikinciden üçüncüye uzanır ve böyle devam eder.

- **Tüm kenarlar**: **Yamaçlı** üstteki kazı ve dolgu yamaçlarını her kenarda kullanır; **Düşey: istinat duvarları** her kenara bir duvar koyar.
- Kenar başına: **Üstteki yamaçlar**, **Kendi yamaçları** (o kenar için bir kazı ve bir dolgu yamacı yazın) veya **Düşey (istinat duvarı)**.
- Bir yamacı `3` veya `3:1` (yatay:1 dikey), `33%` veya `18.4°` olarak yazın; H:1 olarak gösterilir. Platformun kendi **Kazı şevi** ve **Dolgu şevi** aynı biçimi alır.
- Düşey bir kenarın yamacı yoktur: bir istinat duvarı kenar boyunca uzanır; platformdan aşağı mevcut zemine (dolguda) veya zeminden aşağı platforma (kazıda). **Duvar kalınlığı** (başlangıçta 0.3 m veya 1 ft) zeminin platform kenarından mevcut zemine ne kadar basamakla indiğidir. Kazı ve dolgu hacimleri, o kenarın artık sahip olmadığı yamacı dışarıda bırakır.
- Bir duvar eğimli bir kenarla buluştuğunda yamaç duvarın ucunda sarılır; iki duvar bir pah kesimi ile birleşir.
- Alanların altında: duvarların uzunluğu, açıkta kalan yüz (yükseklik × uzunluk), en yüksek ve ortalama yükseklik.

Plan, her duvarın dış yüzünü üzerine kısa çizgilerle ve her iki uçta ve en yüksek noktasında yüksekliğiyle çizer (istinat duvarları katmanında; bu katman DXF ve DWG'ye de gider). 3B görünüm duvarları katı olarak gösterir (**Göster** › İstinat duvarları) ve GLB, OBJ ile USD dışa aktarımları bunları içerir. Kenar boyunca kesitler basamağı gösterir.

**Uyarılar** (Özellikler'de ve Sorunlar panelinde): **Şu duvar yüksekliğinin üzerinde uyar** (başlangıçta 1.0 m veya 3.3 ft) değerinin üzerindeki bir duvar "bir mühendislik duvarı veya izin gerekebilir; yerel kuralları denetleyin" uyarısı alır. **Zeminin durabildiği en dik eğim** yazdığınızda, kazı veya dolgu yamacı bundan daha dik olan her kenar da uyarı alır. Bunlar uyarıdır: tesviye yine de oluşturulur. Her değişiklik {{key:Mod+Z}} için tek bir adımdır.

## Bermler

{{ui:Tesviye}} › {{ui:Berm}}: tepesi, altındaki ortalama zeminden **Yükseklik** kadar yukarıda olan bir höyük; yanları tesviye edilmiş.

## Çukur hendekler

{{ui:Tesviye}} › {{ui:Çukur hendek}}, sonra hendeğin boyunca suyun aktığı yönde tıklayın ve {{key:Enter}} tuşuna basın. **Derinlik**, **Alt genişlik** (V için 0) ve **Yan eğim** ayarlayın. **Eğim** yoksa dibi zemini izler, derinliği kadar aşağıda kalır ve asla yokuş yukarı gitmez; başlangıcından düzgün bir eğim vermek için bir eğim yazın.

## Nokta kotları ve kot eğrileri

1. {{ui:Tesviye}} › {{ui:Tesviye alanı}}: şekillendirmek istediğiniz alanın hatlarını tıklayın.
2. {{ui:Tesviye}} › {{ui:Nokta kotu}}: alanın içinde tıklayın. Özellikler'de kotunu yazın veya ▲ ▼ düğmelerini kullanın.
3. {{ui:Tesviye}} › {{ui:Kot eğrisini düzenle}}: alanın içindeki bir kot eğrisini tıklayın; onu yeniden şekillendirebileceğiniz bir çizgi olarak alın.

Bir nokta veya kot eğrisini seçin ve planda **sürükleyin** (ya da noktalarını): bıraktığınızda yüzey izler; tek bir geri alma adımıdır. Alanın içinde zemin, kenarından (mevcut zemine değdiği yerden), nokta kotlarından ve düzenlenmiş kot eğrilerinden yeniden oluşturulur.

## Canlı kazı ve dolgu

Her tesviye nesnesinin Özellikler'i, değiştirdikçe, **Kazı** ve **Dolgu** değerlerini ile bütün sahanın değerlerini Toprak işleri'nin kullandığı ızgara yöntemiyle gösterir. Sorunlar (yüzeyin dışında kalan veya kendi üzerinden geçen bir çizim) orada listelenir.

## Tesviye denetimleri

Sol taraftaki **Tesviye denetimleri** bölümünde:

- **Yamaç analizi** yüzeyi eğime göre renklendirir: yumuşak sınıra kadar, arada ve dik sınırdan daha dik olan kısımlar (başlangıçta %5 ve %33.3: erişilebilir yollar için olağan 1:20 ve biçme için 1:3). Açıklama her alanın ne kadarının her birine düştüğünü söyler. Dik alanlar sayfalarda da basılır.
- **Akış okları ve su birikimi**, suyun hangi yönde aktığını çizer ve su birikeceği her yeri derinliğiyle çevreler; bölüm kaç yer olduğunu, en derinini ve ne kadar su tuttuklarını söyler.

Denetimler, herhangi bir şey tesviye edildiğinde önerilen yüzeyi, aksi halde mevcut zemini okur.
