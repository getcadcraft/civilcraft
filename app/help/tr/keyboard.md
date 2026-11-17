---
title: Klavye ve fare
summary: CivilCraft'taki her klavye kısayolu ile fare, dokunmatik yüzey ve dokunma eylemleri; gruplanmış, tarayıcı ve platform farklılıklarıyla birlikte.
keywords: klavye, kısayollar, kısayol tuşları, tuşlar, fare, dokunmatik yüzey, dokunma, kaydır, yakınlaştır, çimdikleme, tekerlek, sağ tıklama, mac, komut tuşu
from: a9756f46
---

Bir kutuya yazmıyorken tek harfli tuşlar çalışır. {{key:Mod}} ile olan kısayollar Mac'te Command, diğer yerlerde Ctrl kullanır. Ayrıca bkz. [Tarayıcıda tuşlar](common:keys).

## Dosyalar ve düzenleme

| Tuş | Eylem |
|---|---|
| {{key:Mod+O}} | Bir nokta dosyası, LandXML veya proje aç |
| {{key:Mod+S}} | Projeyi kaydet (bir `.civilcraft.json` dosyası indirir) |
| {{key:Mod+P}} | Planı PDF'e çıktı al (tarayıcının yazdırmasını değil, çıktı iletişim kutusunu açar) |
| {{key:Mod+Z}} | Geri al |
| {{key:Mod+Y}} | Yinele |
| {{key:Delete}} | Seçili ölçüm noktalarını, eksenini, platformu, yapıyı, boruyu veya PVI'yi sil |
| {{key:Mod+C}} | Seçili ölçüm noktalarını kopyala (bir elektronik tablo için nokta satırları olarak da) |
| {{key:Mod+X}} | Seçili ölçüm noktalarını kes |
| {{key:Mod+V}} | Noktaları yapıştır: işaretçiyi izlerler, gidecekleri yere tıklayın |
| {{key:Mod+Shift+V}} | Olduğu yere yapıştır: noktaların kendi koordinatlarında |
| {{key:Mod+D}} | Seçili noktaları çoğalt: bir kopya işaretçiyi izler |
| {{key:Mod+A}} | Her ölçüm noktasını seç |
| {{key:Esc}} | Hiçbirini seçme (ve yapıştırmayı iptal et) |

{{key:Mod+S}}, {{key:Mod+O}} ve {{key:Mod+P}} bir kutuya yazarken bile çalışır. Bir metin kutusunda {{key:Mod+Z}} ve {{key:Mod+Y}} bunun yerine yazdığınızı geri alır, normal şekilde; {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} ve {{key:Mod+A}} de öyle: bir kutuda metni kopyalar, keser, yapıştırır ve seçer. Sayfada (bir panelde) metin seçiliyken {{key:Mod+C}} o metni kopyalar. {{key:Mod+Shift+Z}} CivilCraft'ta hiçbir şey yapmaz: bunun yerine {{key:Mod+Y}} veya {{ui:Yinele}} düğmesini kullanın.

:::mac
Mac'te **delete** olarak etiketli tuş, tarayıcıya göre {{key:Backspace}} tuşudur. Bir seçimi silmek için {{key:Delete}} (Fn ve delete) tuşuna basın veya araç çubuğunun {{ui:Daha fazla}} menüsünde {{ui:Sil}} seçin.
:::

## Araçlar

| Tuş | Araç |
|---|---|
| {{key:V}} | {{ui:Seç}} |
| {{key:M}} | {{ui:Ölç}}: planda mesafeler, alanlar ve eğimler ([Ölç](topic:measure)) |
| {{key:A}} | {{ui:Eksen}} |
| {{key:G}} | {{ui:Platform}} |
| {{key:P}} | {{ui:Borular}} |
| {{key:B}} | {{ui:Kırılma çizgisi}} |
| {{key:O}} | {{ui:Sınır}} |
| {{key:R}} | Profil görünümünü göster veya gizle |
| {{key:I}} | {{ui:PVI ekle}} seçeneğini aç veya kapat (profil görünümü kapalıysa onu açar) |
| {{key:F}} | {{ui:Sığdır}}: her şeyi göster |
| {{key:D}} | {{ui:3B}}: sahayı 3B'de göster veya plana geri dön |
| {{key:E}} | Her özellik çizgisi boyunca eğimleri ve kotları göster veya gizle (yalnızca ekranda) |

Etkin aracın tuşuna yeniden basmak sizi {{ui:Seç}} aracına döndürür. Shift ile harfler hiçbir şey yapmaz.

## Çizim sırasında

| Tuş | Eylem |
|---|---|
| {{key:Enter}} | Ekseni, platformu, boru hattını, kırılma çizgisini veya sınırı bitir |
| {{key:Backspace}} | Tıklanan son noktayı kaldır |
| {{key:C}} | Özellik çizgisi: yayları aç veya kapat (bir köşeden sonra, eğri üzerinde bir noktaya, sonra bitişine tıklayın) |
| {{key:Esc}} | Çizimi (veya yapıştırmayı) iptal et; yeniden basılınca (ya da hiçbir şey çizilmemişse) {{ui:Seç}} aracına dön ve seçimi temizle |

## Plan görünümü

| Tuş veya eylem | Sonuç |
|---|---|
| Tekerlek | İşaretçinin olduğu yerde yakınlaştır veya uzaklaştır |
| Boş alanda sürükle | Kaydır (her araçta; kısa bir tıklama yine tıklar; {{key:Shift}} basılıyken bunun yerine bir seçim kutusu çizer) |
| Orta düğmeyle sürükle | Kaydır |
| Sağ düğmeyle sürükle | Kaydır (menü açılmaz) |
| {{key:Space}} ve sürükle | Kaydır |
| Tıkla | Seç ({{ui:Seç}} ile) veya nokta yerleştir (bir çizim aracıyla) |
| {{key:Shift}} ve tıkla | Bir ölçüm noktasını seçime ekle veya seçimden çıkar |
| {{key:Shift}} ve sürükle | Bir kutu çiz: içindeki ölçüm noktaları seçime eklenir. Etrafında sürükleyerek bir [kement](topic:lasso-selection) çizin |
| Kement çizerken {{key:Space}} | Pencere, sonra kesişen, sonra çit |
| Yapıştırırken tıkla | Yapıştırılan noktaları oraya koyar ({{key:Enter}} onları kendi koordinatlarına koyar) |
| Bir tutamacı sürükle | Bir PI, platform köşesi veya yapıyı taşı (tek bir geri alma adımı) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Kaydır, plan odaktaysa (önce ona tıklayın) |
| {{key:Plus}} ve {{key:Minus}} | Ortada yakınlaştır ve uzaklaştır, plan odaktaysa |

= tuşu {{key:Plus}} gibi yakınlaştırır; bu yüzden Shift'e gerek yoktur.

## Profil görünümü

| Eylem | Sonuç |
|---|---|
| {{ui:PVI ekle}} açıkken tıkla | Orada bir PVI ekle |
| Bir PVI'ye tıkla | Onu seç |
| Bir PVI'yi sürükle | Taşı (tek bir geri alma adımı) |
| {{key:Delete}} veya {{key:Backspace}} | Seçili PVI'yi kaldır ({{key:Backspace}} yalnızca profil görünümü odaktaysa) |

Profil görünümü yakınlaşmaz veya kaydırmaz.

## Ekran ve yardım

| Tuş | Eylem |
|---|---|
| {{key:F1}} | Bu yardımı aç veya kapat (yan panel); uygulama çubuğundaki {{ui:Yardım}} da aynısını yapar |
| {{key:Esc}} | Yardım paneli açıkken onu kapat |
| {{key:Ctrl+Shift+F}} | Ekran modlarında dolaş: tam ekran, çubukları gizli tam ekran, normal |
| {{key:Esc}} | Tam ekrandan çık (tarayıcının kendi tuşu) |

{{key:F1}} CivilCraft onu görmeden önce tarayıcıya ulaşır; bu yüzden her araçta çalışır. Çoğu Mac klavyede fn ile birlikte F1'e basın veya {{ui:Yardım}} düğmesine tıklayın. {{key:Ctrl+Shift+F}} her platformda, Mac dahil, Control tuşunu kullanır. Bu yardımda nasıl arama yapılacağı için bkz. [Yardımı kullanma](common:help).

## Fare, dokunmatik yüzey ve dokunma

:::mouse
- Tekerlek, işaretçinin olduğu yerde yakınlaştırır. Serbestçe dönen tekerlekli bir fare hızlı yakınlaştırır: kısa dönüşler verin.
- Boş alanda herhangi bir sürükleme, orta düğme, sağ düğme veya {{key:Space}} ve sürükleme ile kaydırın.
:::

:::mac
Mac dokunmatik yüzeyinde:

- İki parmakla kaydırma **yakınlaştırır** (kaydırmaz) ve çimdikleme de yakınlaştırır.
- Kaydırmak için boş alanda tek parmakla basılı tutup sürükleyin veya {{key:Space}} tuşuna basılı tutup sürükleyin.
- İki parmakla tıklama (sağ tıklama) menü açmaz ve tek başına bir şey yapmaz.
:::

:::touch
Dokunmatik ekranda:

- İlk dokunma düğmeleri ve menü satırlarını parmak boyutuna getirir.
- Seçmek veya bir nokta yerleştirmek için dokunun; boş alanda tek parmakla sürükleme kaydırır. Bir dokunma biraz oynayabilir: parmak yaklaşık 10 piksel hareket edene kadar kaydırmaz.
- İki parmakla çimdikleyerek yakınlaştırın ve birlikte hareket ettirerek kaydırın.
- Bir tutamacı veya PVI'yi tek parmakla sürükleyin. Tutamaçlar çevrelerinde bir parmak genişliği alan bırakır.
- Bir eksen, platform, kırılma çizgisi, sınır, boru hattı, özellik çizgisi veya parsel çizerken, plan üzerindeki bir çubuk {{ui:Bitir}} ({{key:Enter}}), {{ui:Noktayı geri al}} ({{key:Backspace}}) ve {{ui:İptal}} ({{key:Esc}}) seçeneklerini sunar. Uzun basış (hareket etmeden yarım saniye) de bitirir.
- {{ui:Seç}} modunda, bir ölçüm noktası üzerinde uzun basış, {{key:Shift}}+tıklamanın yaptığı gibi onu seçime ekler veya seçimden çıkarır.
- 3B görünümde tek parmak döndürür, iki parmak çimdikler ve kaydırır, bir dokunma seçer.
- Dokunmatik ekranda üzerine gelme yoktur; bu yüzden durum çubuğu okumaları yalnızca bir parmak basılıyken güncellenir.
:::

## Kazanan tarayıcı tuşları

Bazı tuşlar tarayıcıya aittir ve asla CivilCraft'a ulaşmaz; örneğin {{key:Mod+W}} (sekmeyi kapat), {{key:Mod+T}} (yeni sekme), {{key:Mod+N}} (yeni pencere) ve {{key:F11}} (Windows ve Linux tarayıcılarında tam ekran). CivilCraft bunları kullanmaz. Bir kısayol bunun yerine tarayıcıda bir şey açarsa, sayfanın odağı olması için planı bir kez tıklayın ve yeniden deneyin.

## Taşıma nerede?

Taşı komutu yoktur: {{ui:Seç}} seçin ve bir noktayı veya köşeyi sürükleyin ya da koordinatlarını {{ui:Özellikler}} içinde düzenleyin. Bkz. [Noktaları düzenleyin](topic:edit-points).
