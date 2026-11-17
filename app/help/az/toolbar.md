---
title: Alətlər paneli üzrə məlumat
summary: CivilCraft-da hər alət paneli düyməsi, onun işi, açarı və nə vaxt boz olub rədd etdiyi.
keywords: alətlər paneli, düymələr, əmrlər, alətlər, fayl, ixrac, səth, dizayn, redaktə, görünüş, menyu
from: 4c4352bc
---

Alətlər paneli tətbiqin yuxarısında yeddi qrup halında uzanır. Hər düymə üzərinə gələndə öz köməkçi mətnini və açarını göstərir.

## Fayl

| Düymə | Açar | Nə edir |
|---|---|---|
| {{ui:New}} | yoxdur | Boş layihə başladır. Saxlanmamış dəyişiklik varsa, əvvəlcə soruşur. |
| {{ui:Open}} | {{key:Mod+O}} | Nöqtə faylı (CSV, TXT), LandXML və ya CivilCraft layihəsi açır. |
| {{ui:Save}} | {{key:Mod+S}} | Layihəni `<name>.civilcraft.json` kimi yükləyir. |

## İxrac

| Düymə | Açar | Nə edir |
|---|---|---|
| {{ui:LandXML}} | yoxdur | `<name>.xml` yükləyir: nöqtələr, səthlər, trassalar, profillər və boru şəbəkəsi LandXML 1.2 formatında. Layihə boş olanda "Hələ ixrac ediləcək heç nə yoxdur." yazılır. |
| {{ui:DXF}} | yoxdur | `<name>.dxf` yükləyir: plan xətləri R12 DXF formatında. |
| {{ui:PDF}} | {{key:Mod+P}} | **Planı PDF-ə çıxart** pəncərəsini açır. Layihə boş olanda "Hələ çap ediləcək heç nə yoxdur." yazılır. |

## Səth

| Düymə | Açar | Nə edir |
|---|---|---|
| {{ui:Breakline}} | {{key:B}} | Planalma nöqtələrini ardıcıl basın, bitirmək üçün {{key:Enter}}. Sınma xətti nöqtələrin hündürlüklərini alır. |
| {{ui:Boundary}} | {{key:O}} | Xarici sərhədin küncləri üzərinə basın, bitirmək üçün {{key:Enter}}. Mövcud sərhədi əvəz edir. |

Hər ikisi səth olmadıqda "Hələ səth yoxdur: əvvəlcə planalma nöqtələrini açın." deyir.

## Dizayn

| Düymə | Açar | Nə edir |
|---|---|---|
| {{ui:Alignment}} | {{key:A}} | PI-lər üzərinə ardıcıl basın, bitirmək üçün {{key:Enter}}. |
| {{ui:Pad}} | {{key:G}} | Platformanın küncləri üzərinə basın, bitirmək üçün {{key:Enter}}. Səth alətləri kimi, səth olmadıqda xəbərdarlıq edir; platforma yalnız səth üzərində qradiyentlənir. |
| {{ui:Pipes}} | {{key:P}} | Quyuları yuxarıdan aşağıya doğru basın (mövcud birinə basaraq ona qoşulun), bitirmək üçün {{key:Enter}}. |
| {{ui:Profile}} | {{key:R}} | Plan altındakı profil görünüşünü göstərir və ya gizlədir. |

## Redaktə

| Düymə | Açar | Nə edir |
|---|---|---|
| {{ui:Undo}} | {{key:Mod+Z}} | Son dəyişikliyi geri alır (200-ə qədər). Geri alınacaq heç nə yoxdursa boz olur. |
| {{ui:Redo}} | {{key:Mod+Y}} | Geri alınanı təkrarlayır. Təkrarlanacaq heç nə yoxdursa boz olur. |
| {{ui:Copy}} | {{key:Mod+C}} | Seçilmiş planalma nöqtələrini kopyalayır və cədvəl proqramının qəbul edə biləcəyi nöqtə sətirləri kimi buferə qoyur. Nöqtələr seçilənə qədər boz olur. |
| {{ui:Paste}} | {{key:Mod+V}} | Nöqtələri yapışdırır: onlar göstəricini izləyir və klik onları heç bir digər nöqtənin olmadığı nömrələrlə yerləşdirir. Cədvəl proqramında kopyalanmış nöqtə sətirləri də yapışdırılır. |
| {{ui:More}} | yoxdur | Aşağıdakı menyunu açır. |

{{ui:More}} menyusu:

| Maddə | Açar | Nə edir |
|---|---|---|
| {{ui:Cut}} | {{key:Mod+X}} | Seçilmiş nöqtələri kopyalayır və silir (bir geri qaytarma addımı). |
| {{ui:Copy}} | {{key:Mod+C}} | {{ui:Copy}} düyməsi kimi. |
| {{ui:Paste}} | {{key:Mod+V}} | {{ui:Paste}} düyməsi kimi. |
| {{ui:Paste in place}} | {{key:Mod+Shift+V}} | Nöqtələri öz koordinatlarında yapışdırır, heç bir digər nöqtənin olmadığı nömrələrlə. |
| {{ui:Duplicate}} | {{key:Mod+D}} | Seçilmiş nöqtələrin surəti göstəricini izləyir; getdiyi yerə klik edin. Bufer toxunulmaz qalır. |
| {{ui:Delete}} | {{key:Delete}} | Seçilmiş planalma nöqtələrini, ya da seçilmiş trassanı, platformanı, quyunu (onun borularla birlikdə), borunu və ya PVI-ni silir. |
| {{ui:Select all points}} | {{key:Mod+A}} | Bütün planalma nöqtələrini seçir. |
| {{ui:Select none}} | {{key:Esc}} | Seçimi təmizləyir. |

Hazırda işləyə bilməyən maddə boz olur və onun köməkçi mətni səbəbini deyir. Ətraflı: [Planalma nöqtələrini seçin, kopyalayın və yapışdırın](topic:copy-paste-points).

Geri alma dizayn, səth parametrləri və planalma nöqtələrinə edilən dəyişiklikləri əhatə edir (yapışdırma, kəsmə, dublikat, silmə). Göstərmə parametrlərini əhatə etmir və istənilən faylı açmaq və ya idxal etmək onu təmizləyir.

## GIS

| Düymə | Açar | Nə edir |
|---|---|---|
| {{ui:Coordinates}} | yoxdur | **Koordinat sistemi** pəncərəsini açır: layihənin hansı sistemdə olduğunu deyin və ya yer və ya lokal koordinatlardan istifadə edin. Bax [Layihənin koordinat sistemini təyin edin](topic:coordinate-systems) və [Yer və lokal koordinatlar](topic:ground-and-local-coordinates). |
| {{ui:Import}} | yoxdur | GIS məlumatlarını idxal edir: shapefile, GeoJSON, GeoPackage, hündürlük şəbəkələri və LiDAR. Bax [GIS məlumatlarını idxal edin](topic:gis-import). |
| {{ui:Export}} | yoxdur | İcra məlumatlarını GIS şöbəsi üçün ixrac edir. Bax [İcra məlumatlarını GIS üçün ixrac edin](topic:gis-export). |
| {{ui:Analyze}} | yoxdur | GIS təhlil panelini açır: bufer, üst-üstə qoyma, məkan birləşdirmə, atributa görə seçmə, ölçmə. Bax [GIS qatlarını təhlil edin](topic:gis-analysis). |
| {{ui:Attribute table}} | yoxdur | Səth › Daha çox altında. GIS qatının atribut cədvəlini açır: sıralama, süzgəc, seçmə, redaktə, sahə əlavə etmə, hesablama, CSV kimi saxlama. Bax [Qatın atribut cədvəli ilə işləyin](topic:gis-table). |
| {{ui:Map}} | yoxdur | **Xəritə qatları** pəncərəsini açır: koordinatlı şəkil və ya əlavə etdiyiniz xəritə serverləri, planın altında çəkilir. Bax [Planın altında xəritə qatlarını göstərin](topic:map-layers). |

GIS alətləri bu düymələrdən birini ilk dəfə istifadə etdikdə, GIS faylı açdıqda və ya koordinat sistemi və ya GIS qatları olan layihəni açdıqda yüklənir.

## Görünüş

| Düymə | Açar | Nə edir |
|---|---|---|
| {{ui:Select}} | {{key:V}} və ya {{key:Esc}} | Trassaları, platformaları, quyuları, boruları və nöqtələri seçmək üçün klik edin ({{key:Shift}} və klik və ya sürükləmə nöqtələr əlavə edir); PI-ləri, platforma küncləri və quyuları hərəkət etdirmək üçün tutacaqları sürükləyin. |
| {{ui:Fit}} | {{key:F}} | Planı səthi, nöqtələri, trassaları və platformaları göstərəcək şəkildə yaxınlaşdırır (3D görünüşdə: hər şeyi göstərir). |
| {{ui:3D}} | {{key:D}} | Sahəni plan üzərində 3D-də göstərir, ya da plana qayıdır. 3D görünüşün üstündəki zolaq görünüşü, eksaqərasiyanı, rənglənməni və nələrin göstəriləcəyini təyin edir və GLB və ya OBJ ixrac edir. Bax [Sahəni 3D-də görün](topic:site-3d). |

## Panellərdəki düymələr

| Düymə | Yer | Nə edir |
|---|---|---|
| {{ui:Open the sample site}} | Boş planda qutu | Nümunə planalmanı yükləyir (əlaqə tələb edir, CivilCraft oflayn istifadə üçün saxlanılmadığı təqdirdə) |
| {{ui:Remove the boundary}} | Sol panel, Səth | Xarici sərhədi götürür |
| {{ui:Remove drawn breaklines}} | Sol panel, Səth | Alətlə çəkilmiş bütün sınma xətlərini silir (sınma xətti qruplarını yox) |
| {{ui:Rebuild the surface from the points}} | Sol panel, Səth (yalnız LandXML səthi) | LandXML TIN-i atır və nöqtələrdən qurur; geri alına bilməz |
| {{ui:Start from the ground}} | Sağ panel, Trassa | Hər ucda torpaq üzərində PVI ilə layihə profili başladır |
| {{ui:Profile view}} | Sağ panel, Trassa | Bu trassanın profil görünüşünü açır |
| {{ui:Add PVIs}} | Profil zolağı | Basılı olduqda, profildə klik PVI əlavə edir |
| {{ui:Set every invert from the rules}} | Sağ panel, Boru şəbəkəsi | Hər borunun invertlərini qaydalara görə təyin edir |
| {{ui:Set its inverts from the rules}} | Sağ panel, Boru | Bu borunun invertlərini qaydalara görə təyin edir |
