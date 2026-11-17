---
title: Sahəni 3D-də ixrac et
summary: 3D görünüşün göstərdiyini digər 3D proqramlar üçün GLB və ya OBJ faylı kimi saxlayın, metrlərdə, Y yuxarı ilə, faylın qeyd etdiyi lokal başlanğıc nöqtəsi ətrafında.
keywords: glb, gltf, obj, 3d ixracı, 3d ixrac, model ixracı, oyun mühərriki, vizuallaşdırma, 3d baxan, metrlər, y yuxarı, başlanğıc nöqtəsi, lokal başlanğıc, dövlət müstəvi
from: 07d23992
---

3D görünüş göstərdiyini başqa proqramın aça biləcəyi 3D model kimi ixrac edir: 3D baxan, modelləşdirici, oyun mühərriki və ya vizuallaşdırma aləti.

## İxrac

1. 3D görünüşü açın ({{key:D}}) və {{ui:Show}} ilə nəyin göstərildiyini seçin. Gizlədilən şey ixrac edilmir.
2. Çubuqda {{ui:GLB}} və ya {{ui:OBJ}} düyməsini basın.
   Fayl "*layihənin adı*-3d.glb" və ya "-3d.obj" kimi yüklənir, status panelində isə başlanğıc nöqtəsi yazılır.

## Faylların tərkibi

| | GLB | OBJ |
|---|---|---|
| Səthlər | Normallı şəbəkələr və zolaq və ya səth rəngləri ilə | Normallı şəbəkələr (rənglər yoxdur) |
| Borular və konstruksiyalar | Dəyirmi şəbəkələr, problemli olanlar qırmızı | Dəyirmi şəbəkələr |
| Horizontallar, sınma xətləri, trassalar, pikyetaj işarələri, koridor və platforma xətləri | Xətlər, hər dəst öz rəngində | Xətt yazıları (`l`) |
| Planalma nöqtələri | Nöqtələr | Nöqtə yazıları (`p`) |

Hər dəst öz adını saxlayır ("Mövcud relyef", "Borular", "Böyük horizontallar" və s.), beləliklə digər proqramda onu gizlədə və ya üslublaşdıra bilərsiniz.

## Vahidlər, oxlar və başlanğıc nöqtəsi

- **Metrlər.** Fut layihəsi ABŞ sorğu futundan çevrilir (1 ft = 1200/3937 m).
- **Y yuxarı**, bu formatlar üçün adi qaydadır: şərq +X olur, yüksəklik +Y, şimal −Z.
- **Həqiqi miqyas.** Görünüşün şaquli artırılması tətbiq edilmir.
- **Lokal başlanğıc nöqtəsi.** Dövlət müstəvi koordinatları milyonlarla futdur, bu formatların saxladığı tək dəqiqlikli ədədlər üçün çox böyükdür, buna görə fayl yaxın başlanğıc nöqtəyə nisbətən yazılır: şərq və şimal üçün mövcud relyefin öz başlanğıc nöqtəsi, aşağı yüksəkliyi isə aşağı yuvarlaqlaşdırılmış. Başlanğıc nöqtəsi layihə vahidlərində faylda qeyd olunur: GLB-də səhnənin və yuxarı düyünün `extras`-ı kimi, OBJ-də faylın yuxarısında şərh sətri kimi (`# origin easting … northing … elevation …`). Modeli layihə koordinatlarına qaytarmaq üçün başlanğıc nöqtəsini əlavə edin (fut layihəsində metrləri əvvəlcə futa çevirin).

## Hələ hazır deyil

- Şaquli artırılmış görünüşün ixracı və ya layihə vahidləri yerinə metrlərdə ixrac.
- OBJ üçün teksturalar, material faylı (.mtl) və hər obyekt üçün xassələr (boru və konstruksiyaların adları yalnız CivilCraft-dadır).
- Koridorun ayrı cisimlər kimi ixracı və ya profil görünüşünün 3D-də ixracı.
