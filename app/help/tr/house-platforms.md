---
title: Eğimli arazilerde ev platformları
summary: Yamaçta bir platformu tesviye edin: platform kenarları olarak istinat duvarları, derinliğe göre gölgelenen kazı ve dolgu haritası ile nokta kotları (plan ve 3B), zemin ve tasarım boyunca her yerde çizilen serbest kesit ve araç yolları için rampalar veya eğimli platformlar.
keywords: platform, ev platformu, eğimli arazi, yamaç, istinat duvarı, kazı ve dolgu, kazı dolgu haritası, nokta kotları, serbest kesit, kesit çizgisi, belediye çizimleri, araç yolu, rampa, eğimli platform, tesviye, şişme faktörü, toprak işleri
from: daa08a3f
---

Bir ev platformu, tek bir kotta düz bir çokgendir (**Tasarım** › {{ui:Platform}}) ve zemine tesviye edilir. Bir yamaçta dört şey yardımcı olur.

## İstinat duvarları platform kenarı olarak

Platformu seçin ve bir kenarı yamaç yerine {{ui:Düşey (istinat duvarı)}} olarak ayarlayın (**Özellikler** › {{ui:Kenarlar ve istinat duvarları}}, ya da tüm kenarlar için birden {{ui:Düşey: istinat duvarları}}). Duvarın yüksekliği boyunca zeminden okunur: üst zeminde, alt platformda; her iki uçta ve planda en yüksek noktasında gösterilir. Belirlediğiniz sınırdan yüksekse uyarı verilir. Duvarlar ve yamaçlar yan yana karıştırılabilir.

## Kazı ve dolgu haritası

**Göster** altında {{ui:Kazı ve dolgu haritası}} kutusunu işaretleyin. Plan, kazının veya dolgunun derinliğine göre eşit basamaklarla gölgelenir (kazı sıcak, dolgu mavi, neredeyse düz olanlar açık renk) ve bir açıklama ile birlikte gelir. Platform üzerine **nokta kotları** basılır: ızgaradaki noktalarda kot değişimi, en derin kazı ve en yüksek dolgu ▲ ile işaretlenir. Hücreler toprak hacimlerinin kullandığı hücrelerle aynıdır; bu yüzden harita ve sayılar her zaman uyuşur.

3B görünümde, renk listesinden **Kazı ve dolgu** seçerek aynı renkleri zemin ve tasarım üzerine yayın.

Şişme veya büzülme faktörü kütle taşıma aracındadır (**Tasarım** › {{ui:Kütle taşıma}}); bir platformun hacimlerine uygulanmaz.

## Serbest kesit

**Yüzey** › {{ui:Daha fazla}} altında {{ui:Serbest kesit}} seçin, kesit çizgisinin noktalarını istediğiniz yerde tıklayın (çizgi eğrilebilir) ve {{key:Enter}} tuşuna basın. Bir iletişim kutusu kesiti çizer: mevcut zemin, tesviye edilmiş tasarım (kesikli çizgi) ve aralarındaki kazı ve dolgu, gölgeli olarak alanlarıyla birlikte (tasarım yalnızca platformların ve yolların içinde sayılır). {{ui:Düşey abartma}} varsayılan olarak çizime sığacak şekilde gelir. {{ui:SVG olarak kaydet}} ve {{ui:CSV olarak kaydet}} belediye için bir çizim ve sayıları verir.

## Rampalar ve eğimli platformlar

**Yüzey** › {{ui:Daha fazla}} altında {{ui:Rampa veya eğimli platform}} seçin, alt ucu sonra üst ucu tıklayın, {{key:Enter}} tuşuna basın ve genişliği, alt uçtaki kotu ve eğimi girin. Platform, köşeleri bu kotları taşıyan bir şerittir (iki köşe arasındaki kenar sabit eğimle ilerler) ve herhangi bir platform gibi zemine tesviye edilir. Herhangi bir platformun köşeleri de kendi kotlarını taşıyabilir; böylece bir araç yolu, bir rampa veya eğimli bir teras, her köşesinde bir kot bulunan bir platformdur.
