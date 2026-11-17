---
title: Planalma nöqtəsini redaktə et
summary: Bir nöqtənin nömrəsini, koordinatlarını, hündürlüyünü və ya təsvirini dəyişin, ya da onu planda yeni yerə sürükləyin.
keywords: nöqtəni redaktə et, nöqtəni köçür, hündürlüyü dəyiş, yenidən nömrələ, nöqtə nömrəsi, təsvir, sürüklə, şimal, şərq, nöqtəni düzəlt, səhv ölçmə
from: 375ae2e9
---

Səhv alınmış ölçmə, düzgün olmayan çubuq hündürlüyü, səhv yazılmış təsvir: bir nöqtəni düzəldin, səth də ona uyğunlaşır.

## Nöqtənin dəyərlərini dəyişmək

1. {{ui:Select}} seçilmiş vəziyyətdə planda nöqtəyə basın. **Xassələr** onun nömrəsini, şərq, şimal koordinatlarını, hündürlüyünü və təsvirini xanalarda göstərir.
2. Yeni dəyəri yazın və {{key:Enter}} basın (və ya kənara klikləyin). Hündürlüyü olmayan nöqtə üçün **Hündürlük** xanasını boş qoyun.
3. Səth, horizontallar və onlar əsasında qurulan hər şey dərhal yenilənir.

Hər dəyişiklik bir addımdır: {{key:Mod+Z}} onu geri qaytarır, {{key:Mod+Y}} isə təkrarlayır. CivilCraft-ın istifadə edə bilmədiyi dəyər (başqa nöqtədə artıq olan nömrə, koordinatda hərf) qəbul edilmir: xana çərçivəyə alınır və status panelində səbəb yazılır.

Yeni təsvir kodu idxal zamanı olduğu kimi yeni nöqtə qrupu yaradır (bax: [Səthi qurmaq](topic:build-surface)).

## Nöqtəni planda köçürmək

1. Nöqtəni seçin (ətrafında halqa görünür).
2. Halqanı sürükləyin. Status panelində onun hara düşəcəyi şərq və şimal koordinatları ilə göstərilir.
3. Köçürmək üçün buraxın; hündürlüyü dəyişməz qalır. Buraxmazdan əvvəl onu geri qaytarmaq üçün {{key:Esc}} basın.

## Sınma xətti nöqtəni izləyir

{{ui:Breakline}} aləti ilə çəkilən sınma xətti keçdiyi nöqtələri təkrarlayır. Nöqtəni köçürəndə və ya hündürlüyünü dəyişəndə, onun üzərindəki sınma xətti künclər eyni addımda onunla birlikdə hərəkət edir. Təsvirlərdən yaranmış sınma xətti qrupları həmişə nöqtələrdən yenidən qurulur.

:::note
LandXML faylından oxunan səth öz üçbucaqlarını saxlayır: nöqtə redaktələri onu yalnız {{ui:Rebuild the surface from the points}} seçimindən sonra dəyişir.
:::
