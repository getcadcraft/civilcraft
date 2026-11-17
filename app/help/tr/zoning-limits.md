---
title: Kütleleri yazdığınız imar sınırlarına göre denetleyin
summary: Bir parselin çekme mesafelerini satır satır, bir yükseklik sınırını, bir gökyüzü düzlemini, bir emsali ve bir yapılaşma oranını yazın; yapılabilir zarfı planda görün ve hangi kütlenin hangi sınırı aştığını okuyun.
keywords: imar, çekme mesafesi, çekme mesafeleri, ön, yan, arka, zarf, yapılabilir alan, yükseklik sınırı, gökyüzü açısı düzlemi, emsal, yapılaşma oranı, parsel, imar yönetmeliği, kod denetimi
from: 3e267b31
---

**CivilCraft'ın içinde hiçbir imar kuralı yoktur.** Hiçbir şehrin kurallarını bilmez ve bunların bir kütüphanesini sunmaz. Bu sayfadaki her sayı, sizin kendi imar yönetmeliğinizden yazdığınız bir sayıdır ve her sonuç, yazdığınız sınırlara göre ölçüldüğünü söyler. Bu, bir parselin sınırlarının bir yapıyı nasıl şekillendirdiğini görmenin bir yoludur; bir tasarımın izinli olup olmadığına dair bir karar değildir.

## Sınırları yazın

**Özellikler**'de, **Yapı kütleleri** altında bir **Parsel** seçin (ya da bir kütle seçin: parselinin sınırları altında görünür). Sonra geçerli olanları doldurun; "sınır yok" için bir kutuyu boş bırakın:

- **Sokak hattı**: sokaktaki parsel hattı. **Ön çekme mesafesi** ona uygulanır, **Arka çekme mesafesi** ona en karşıdaki hatta, **Yan çekme mesafesi** kalanlara uygulanır.
- **Yükseklik sınırı**.
- **Gökyüzü düzlemi**: bir parsel hattında belirli bir yükseklikten başlar ve içeriye doğru her 1 yatay birim için yazdığınız miktar kadar yükselir; sokak hattından ya da her parsel hattından ölçülür (2, 2'ye 1 demektir). Bir noktanın üzerindeki izinli yükseklik, düzlemin ve yükseklik sınırının en düşüğüdür.
- **Emsal** (parseldeki kütlelerin brüt kat alanı, parselin alanına bölünmüş) ve **Yapılaşma oranı** (taban izleri, parselin alanına bölünmüş, yüzde olarak yazılır).

## Zarf

**Zarfı plan üzerinde göster** seçeneğini işaretleyin; zarf `A-MASS-ENVL` katmanına çizilir. Zarf, parselin her parsel hattından o hattın kendi çekme mesafesi kadar içeri alınmış halidir; ofset çizgileri köşelerde açılı olarak birleşir. Eğri olan bir parsel hattı, eğriye 0.01 yakınlıkta kısa kirişler olarak alınır. Dışbükey ve içbükey parseller ikisi de çalışır. Çekme mesafeleri kendi üzerine katlanırsa (dar ya da çok içbükey bir parselde derin bir çekme mesafesi) zarf yoktur ve Özellikler bunu söyler; daha küçük mesafeleri deneyin.

## Sonuç

Kutuların altında her kütle ve her sınır için bir satır vardır; bir onay ya da çarpı ile:

- **çekme mesafeleri**: kütlenin zarfın dışında kalan alanı;
- **yükseklik**: kütlenin yüksekliği, taban izi üzerinde izin verilen en fazla yüksekliğe karşı (tek yükseklikli bir prizma, köşelerinin herhangi birindeki en düşük izinli yükseklikle sınırlanır);
- **emsal** ve **yapılaşma oranı**: parseldeki tüm kütleler toplanarak.
