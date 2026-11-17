---
title: Menüler, tuşlar ve fare
summary: Alıştığınız çalışma biçimine uyan bir menü stili seçin, herhangi bir komuta kendi tuşunuzu verin, komutları şerit sekmeleri arasında taşıyın ve tekerleğin ile fare düğmelerinin planda ve 3D'de ne yaptığını ayarlayın.
keywords: menü stili, menüler, şerit, inşaat şeridi, araç çubuğu, komut satırı, klasik çizim, klavye kısayolları, kısayollar, tuşlar, özelleştir, tuşu yeniden eşle, tuşu yeniden ata, fare, tekerlek, ters çevir, yakınlaştırma yönü, orta düğme, sağ düğme, kaydır, döndür, dışa aktar, içe aktar, geçiş, tanıdık
from: 07ac73a0
---

CivilCraft'ın komutları, onlara hangi yoldan ulaşırsanız ulaşın aynıdır. Bir **menü stili** yalnızca komutların ekranda nerede durduğunu, orada nasıl adlandırıldığını ve hangi tuşlarla çalıştığını belirler; böylece alışkanlıklarınızı koruyabilirsiniz. Bunu {{ui:Ayarlar}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menüler, tuşlar ve fare}} bölümünden seçin; değişiklik hemen uygulanır ve bu tarayıcı bunu hatırlar.

## Üç stil

| Stil | Ne elde edersiniz |
|---|---|
| {{ui:CivilCraft}} | CivilCraft'ın kendi araç çubuğu (Dosya, Dışa aktar, Yüzey, Tasarım, Düzenle, GIS, Görünüm) ve tek tuşlar: {{key:A}} eksen, {{key:G}} platform, {{key:P}} borular, {{key:B}} kırılma çizgisi, {{key:O}} sınır, {{key:L}} özellik çizgisi, {{key:R}} boy kesiti, {{key:X}} kesitler, {{key:E}} eğimler, {{key:D}} 3D, {{key:F}} sığdır, {{key:V}} seç. Başlangıç noktası. |
| {{ui:Klasik çizim}} | Küçük bir şerit ({{ui:Giriş}}, {{ui:Ekle}}, {{ui:Çıktı}}) ve bir komut satırı; komutları yazmayı tercih edenler için: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (geri al), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Herhangi bir yere yazmaya başlayın, harfler komut satırına gider; {{key:Enter}} çalıştırır, boşken {{key:Enter}} son komutu yineler, {{key:Esc}} komut satırını temizler. Orta düğme kaydırır. |
| {{ui:İnşaat şeridi}} | İnşaat tasarım programlarının araçlarını gruplandırdığı gibi, büyük düğmelerden oluşan sekmeler: {{ui:Giriş}} (arazi verisi, tasarım oluşturma, boy kesiti ve kesit görünümleri), {{ui:Yüzeyler}}, {{ui:Düzenle}}, {{ui:Konum}}, {{ui:Görünüm}} ve {{ui:Çıktı}}; ayrıca bir {{ui:Dosya}} menüsü ve sağda hızlı düğmeler. Tek tuşlar yerinde kalır. Orta düğme planda kaydırır; 3D'de orta düğme kaydırır ve orta düğmeyle birlikte {{key:Shift}} döndürür. |

Her stil {{key:Mod}} tuşlarını korur: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
CivilCraft'ın kendi düzeninin parçası olan ama stilinizde başka bir komuta verilmiş bir tuş hiçbir şey yapmaz; durum çubuğu bu tuşun komutunun nereye gittiğini söyler ("Tuşlarım içinde Platform: Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} ve ok tuşları her zaman kendi anlamını korur; bir çizgi çizerken noktalarının tuşları ({{key:Backspace}}, {{key:Enter}}) da kendi işlevini korur.
:::

## Kendinize göre düzenleyin

1. Size en yakın stili seçin, ardından {{ui:Özelleştir…}} tıklayın.
2. {{ui:Tuşlar ve menüler}} üzerinde bir komut bulun (arama kutusu işe yarar). {{ui:Anahtar ekle}} tıklayın ve tuşa basın, ya da iki harfli bir tuş için art arda iki tuşa basın. Bir tuşu kaldırmak için ona tıklayın.
3. Bir şerit kullanıyorsanız, {{ui:Yeri}} komutu başka bir sekmeye ve panele, {{ui:Dosya}} menüsüne ya da {{ui:Yalnızca tuşlarla}} konumuna taşır.
4. {{ui:Fare}} üzerinde tekerleği, planı kaydıran düğmeleri ve her düğmenin 3D görünümde ne yaptığını ayarlayın.
5. Bir ad verin ve {{ui:Kaydet}} tıklayın.

Yerleşik bir stili kaydetmek kendi kopyanızı oluşturur ("Benim İnşaat şeridim"); yerleşik olan asla değişmez. Aynı tuşun iki komuta verilmesi ya da bir tuşun, iki harfli bir tuşun yazılmasından önce çalışacak olması kırmızıyla gösterilir ve kaydetmeden önce düzeltilmesi gerekir.

## Fare

- **Fare tekerleği**: {{ui:Yukarı kaydırmak yakınlaştırır}} (başlangıç) ya da {{ui:Yukarı kaydırmak uzaklaştırır}} ve ne kadar hızlı olacağı; planda ve 3D'de. Dokunmatik yüzeyde iki parmakla kıstırma hareketi her zaman parmaklarınızın hareket yönüne göre yakınlaştırır.
- **Planı kaydırma**: orta düğme, sağ düğme ya da ikisi. {{key:Space}} ile sürükleme de kaydırır. Sol düğme her zaman seçer ve çizer.
- **3D görünümde sürükleme**: {{ui:Her görünümün kendi ayarı}} CivilCraft'ın düğmelerini korur (sol döndürür, sağ kaydırır). Ya da her düğmeyi döndürme, kaydırma, yakınlaştırma ya da hiçbir şey olarak ayarlayın; {{key:Shift}} ile düğme döndürme ile kaydırmayı değiştirir. Sürüklemeden yapılan bir tıklama yine seçer.

## Yanınızda götürün

{{ui:Dışa aktar}} kullanılan stili küçük bir `.ccinput.json` dosyası olarak kaydeder; {{ui:İçe aktar…}} başka bir bilgisayardan ya da meslektaşınızdan bir tane ekler. İçe aktarılan bir dosya yalnızca CivilCraft'ın kendi komutlarına işaret edebilir: başka her şey dışarıda bırakılır ve durum çubuğunda sayılır. {{ui:Bu stili sil}} kendi stillerinizden birini kaldırır.

:::note
Bu ayarlar bu tarayıcıda kalır. Stil kartlarının altındaki {{ui:Bu stili her uygulamada kullan}} her uygulamanın eşleşen stille açılmasını sağlar (kendi araç çubuğu, bir şerit ya da Klasik çizim), her uygulamada yaptığınız değişikliklerle birlikte. CivilCraft'ın bir menü çubuğu stili yoktur: başka bir uygulamanın menü çubuğu her uygulama için seçildiğinde, CivilCraft kendi araç çubuğunu korur.
:::

İlgili: [Klavye ve fare](topic:keyboard) · [CivilCraft ayarları](topic:settings) · [Başka inşaat yazılımlarından geçiş](topic:coming-from)
