---
title: Araç süpürülen yolları
summary: Bir aracı, en fazla üç römorkla, bir özellik çizgisi veya eksen boyunca ileri ya da geri sürün; süpürdüğü alanı, tekerlek izlerini, direksiyonunu ve katlanma noktasını görün.
keywords: süpürülen yol, dönüş yolu, araç izleme, dönüş şablonu, tasarım aracı, kamyon, otobüs, römork, yarı römork, geri gitme, geriye manevra, katlanma, eklem açısı, direksiyon kilidi, sapma, tekerlek izi, yükleme rampası, dönüş yarıçapı
from: 8caafb8a
---

Süpürülen yol, bir aracı bir çizgi boyunca sürer ve gövdesinin geçtiği zemini gösterir. Bir kamyonun bir köşeyi dönebildiğini, bir yükleme rampasına ulaşabildiğini veya bir römorku kaplamanın dışına çıkmadan yerine geri manevrayla getirebildiğini denetlemek için kullanın.

## Bir aracı bir çizgi boyunca sürme

1. Aracın izleyeceği çizgiyi, hareket yönünde çizin: bir özellik çizgisi (yaylar uygundur: çizerken {{key:C}} tuşuna basın, bkz. [Özellik çizgileri](topic:feature-lines)) veya bir eksen.
2. Seçin ve **Özellikler** içinde {{ui:Süpürülen yol…}} öğesine tıklayın.
3. **Başlangıç**ta bir araç seçin, ardından boyutlarını kendi tasarım aracınızdan ayarlayın: genişlik, ön sarkma, aks mesafesi, arka sarkma, iz genişliği ve **Direksiyon kilidi**. En fazla üç römork ekleyin; her birinin nereye bağlandığını, bağlantıdan aksına olan uzunluğunu, sarkmalarını ve **En büyük eklem açısı**nı belirtin.
4. **Sürüş** seçin: ileri veya geri. {{ui:Sür}}'e tıklayın.

:::warning
Başlangıç için gelen araçlar yer tutucudur, standart değildir. Boyutları projenizin kullandığı tasarım aracından ayarlayın.
:::

## İleri ve geri

| Sürüş | Çizgiyi izleyen | CivilCraft'ın hesapladığı |
|---|---|---|
| **İleri** | Ön aksın merkezi | Arka aksın ve her römorkun nereye gittiği, direksiyon açısı ve eklem açısı |
| **Geri** | Son aksın merkezi (römorkun arkası) | Önündeki her birimin nereye gittiği ve römorku oraya koymak için kabinin ihtiyaç duyduğu direksiyon |

Geri manevra şöyle denetlenir: römorkun nereye gitmesi gerektiğini belirtin; CivilCraft, kabinin bunu yapıp yapamayacağını söyler.

## Sonucu okuma

Süpürülen yol planda turuncuyla çizilir: dış hattı ve kesikli çizgiyle en dıştaki tekerleklerin izleri. Görmek için seçin (içine tıklayın) **Özellikler** içinde:

- **Sürülen uzunluk**, sınırlarına karşı en büyük **Direksiyon** açısı ve **Eklem açısı** ve **Süpürülen alan**.
- Çizgi boyunca mesafesiyle birlikte herhangi bir sorun: kilidi aşan direksiyon veya eklem sınırını aşan bir römork dönüşü (katlanır).
- **Çizgi boyunca araç**: kaydırıcıyı hareket ettirerek aracı herhangi bir noktada, o noktadaki direksiyon ve eklem açısıyla görün.

Çizgiyi değiştirin, süpürülen yol izler. {{ui:Aracı düzenle…}} boyutları değiştirir; **Sürüş** ileri ve geri arasında geçiş yapar. Her değişiklik tek bir adımdır: {{key:Mod+Z}} geri alır. {{key:Delete}} seçili süpürülen yolu siler (çizgi kalır).

Dış hat ve tekerlek izleri, C-ROAD-SWPT katmanında PDF, DXF ve DWG'ye aktarılır.

## Nasıl hesaplanır

Her birim, arka aksının çizgisi etrafında döner ve önündeki nokta (ön aks veya bağlantı) tarafından sürüklenir; süpürülen yol denetimlerinin kullandığı düşük hızlı, kaymasız model budur. Süpürülen alan, her konumdaki gövde dış hatlarının birleşimidir. Hız, lastik kayması, direksiyonun dönme süresi, direksiyonlu römorklar ya da gövde altındaki açıklık modellenmez.
