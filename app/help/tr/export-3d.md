---
title: Sahayı 3B olarak dışa aktarma
summary: 3B görünümde gösterilenleri GLB ya da OBJ dosyası olarak kaydedin; diğer 3B programlar için, metre cinsinden, Y yukarı ve dosyanın kaydettiği yerel bir başlangıç noktası etrafında.
keywords: glb, gltf, obj, 3B dışa aktarma, model dışa aktarma, oyun motoru, görselleştirme, 3B görüntüleyici, metre, y yukarı, başlangıç noktası, yerel başlangıç noktası, state plane
from: 07d23992
---

3B görünüm, gösterdiğini başka bir programın açabileceği bir 3B model olarak dışa aktarır: bir 3B görüntüleyici, bir modelleyici, bir oyun motoru ya da bir görselleştirme aracı.

## Dışa aktarma

1. 3B görünümü ({{key:D}}) açın ve neyin gösterileceğini {{ui:Göster}} ile seçin. Gizlenen şeyler dışa aktarılmaz.
2. Çubuktaki {{ui:GLB}} ya da {{ui:OBJ}} düğmesine tıklayın.
   Dosya "*proje adı*-3d.glb" ya da "-3d.obj" olarak indirilir ve durum çubuğu başlangıç noktasını belirtir.

## Dosyaların içerdikleri

| | GLB | OBJ |
|---|---|---|
| Yüzeyler | Normalli ağlar ve bant ya da yüzey renkleri | Normalli ağlar (renksiz) |
| Borular ve yapılar | Yuvarlak ağlar, sorunlu olanlar kırmızı | Yuvarlak ağlar |
| Kot eğrileri, kırılma çizgileri, eksenler, istasyon işaretleri, koridor ve platform çizgileri | Çizgiler, her küme kendi renginde | Çizgi kayıtları (`l`) |
| Ölçü noktaları | Noktalar | Nokta kayıtları (`p`) |

Her küme adını korur ("Mevcut zemin", "Borular", "Ana kot eğrileri" vb.), böylece onu diğer programda gizleyebilir ya da biçimlendirebilirsiniz.

## Birimler, eksenler ve başlangıç noktası

- **Metre.** Fit cinsindeki bir proje, ABD ölçü fitinden dönüştürülür (1 ft = 1200/3937 m).
- **Y yukarı**, bu biçimler için olağan kural: doğu +X olur, kot +Y olur ve kuzey −Z olur.
- **Gerçek ölçek.** Görünümün düşey abartısı uygulanmaz.
- **Yerel bir başlangıç noktası.** State plane koordinatları milyonlarca fittir; bu biçimlerin sakladığı tek duyarlıklı sayılar için fazla büyüktür. Bu yüzden dosya yakındaki bir başlangıç noktasına göre yazılır: doğu ve kuzey için mevcut zeminin kendi başlangıç noktası ve en düşük kotu aşağı yuvarlanmış hali. Başlangıç noktası, proje birimlerinde, dosyaya kaydedilir: bir GLB'de sahnede ve en üst düğümünde `extras` olarak, bir OBJ'de başta yakın bir yorum satırı olarak (`# origin easting … northing … elevation …`). Modeli proje koordinatlarına geri yerleştirmek için başlangıç noktasını ekleyin (fit projesinde metreleri tekrar fite çevirdikten sonra).

## Henüz yapılmadı

- Abartılmış görünümü dışa aktarma ya da metre yerine proje birimlerinde dışa aktarma.
- Dokular, OBJ için bir malzeme dosyası (.mtl) ve nesne başına özellikler (boruların ve yapıların adları yalnızca CivilCraft'tadır).
- Koridorun ayrı katılar olarak dışa aktarılması ya da boy kesiti görünümünün 3B olarak dışa aktarılması.
