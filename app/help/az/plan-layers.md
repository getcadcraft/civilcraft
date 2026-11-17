---
title: Plan qatları
summary: CivilCraft-ın ekranda, DXF-də və PDF-də istifadə etdiyi sabit qat adları, rənglər və xətt qalınlıqları və hər qatı idarə edən göstərmə parametri.
keywords: qatlar, qat adları, ncs, rənglər, aci, xətt qalınlığı, dxf qatları, pdf, göstərmə parametrləri, xətt işləri
from: c2aa8475
---

Planın hər elementi bir qata aiddir. Adlar ümumi mülki qat sxeminə (sahə, əsas qrup, alt qrup) uyğundur. Qatlar bu versiyada sabitdir: adlarını dəyişə, rənglərini dəyişə və ya öz qatlarınızı əlavə edə bilməzsiniz. DXF-də hər qatın göstərilən rəng nömrəsi var; PDF-də {{ui:Qat rəngləri}} ilə eyni rənglər istifadə olunur, {{ui:Qara}} ilə isə hər şey qara çap olunur.

| Qat | Nəyi saxlayır | Rəng (DXF nömrəsi) | Nə vaxt göstərilir |
|---|---|---|---|
| C-TOPO-MINR | Köməkçi horizontallar | Boz (8) | {{ui:Horizontallar}} |
| C-TOPO-MAJR | Əsas horizontallar | Ağ və ya qara (7) | {{ui:Horizontallar}} |
| C-TOPO-TEXT | Horizontal yazıları | Ağ və ya qara (7) | {{ui:Horizontallar}} və {{ui:Horizontal yazıları}} |
| C-TOPO-TINN | Üçbucaq kənarları | Boz (8) | {{ui:Üçbucaqlar}} |
| C-TOPO-BRKL | Sınma xətləri və sərhəd | Narıncı (30) | {{ui:Sınma xətləri}} |
| C-TOPO-BNDY | Səthin kənarı | Ağ və ya qara (7) | {{ui:Səthin kənarı}} |
| C-TOPO-SLOP | Meyl oxları | Firuzəyi (4) | {{ui:Meyl oxları}} |
| V-NODE | Planalma nöqtələri | Yaşıl (3) | {{ui:Nöqtələr}} |
| V-NODE-TEXT | Nöqtə yazıları: nömrə, hündürlük, təsvir | Yaşıl (3) | {{ui:Nöqtələr}} və {{ui:Nöqtə yazıları}} |
| V-NODE-LINE | Xətt kodlarından olan xətlər (sınma xətti olmayan qruplar) | Yaşıl (3) | {{ui:Nöqtələr}} |
| C-ROAD-CNTR | Trassa oxları | Qırmızı (1) | Həmişə |
| C-ROAD-STAN | Pikket işarələri və yazıları, PC və PT | Qırmızı (1) | Həmişə |
| C-ROAD-CORR | Koridor kənarları | Sarı (2) | Həmişə |
| C-ROAD-SCTN | Nümunə xətləri (kəsiklərin çəkildiyi yerlər) | Boz (8) | Trassada nümunə xətləri olduqda |
| C-GRAD-PADS | Platforma konturları | Mavi (5) | Həmişə |
| C-GRAD-DAYL | Kəsişmə xətləri | Macenta (6) | Həmişə |
| C-GRAD-SLOP | Şaquli planlaşdırma meyl xətləri | Macenta (6) | Həmişə |
| C-GRAD-FEAT | Xarakterik xətlər (3D) | Yaşıl (3) | Həmişə |
| C-ROAD-SWPT | Dönmə yolları: kontur, ən kənar təkər izləri, ad | Narıncı (30) | Həmişə |
| C-STRM-PIPE | Borular | Mavi (5) | {{ui:Borular}} |
| C-STRM-STRC | Quyular | Mavi (5) | {{ui:Borular}} |
| C-STRM-TEXT | Boru və quyu yazıları | Mavi (5) | {{ui:Borular}} |
| C-STRM-PROB | Problemli borular və quyular | Qırmızı (1) | {{ui:Borular}} |

Sınma xətləri yalnız **Göstərmə** altında **Səth** {{ui:Mövcud zəmin}} olduqda çəkilir; sərhəd isə hər iki səthlə çəkilir.

## PDF-də xətt qalınlıqları

| Qalınlıq | Qatlar |
|---|---|
| 0.50 mm | Trassa oxları, platformalar, borular, problemli borular |
| 0.35 mm | Əsas horizontallar, kəsişmə xətləri, quyular |
| 0.25 mm | Sınma xətləri |
| 0.13 mm | Köməkçi horizontallar |
| 0.09 mm | Üçbucaq kənarları, şaquli planlaşdırma meyl xətləri |
| 0.18 mm | Qalan hər şey |

DXF fayllarında xətt qalınlığı yoxdur; onları CAD proqramınızda qat üzrə təyin edin.

## Yazıların ölçüləri

Yazılar kağız üzərində ölçülüdür: horizontal yazıları 2.0 mm, pikket yazıları 1.8 mm, PC və PT yazıları və boru və quyu yazıları 1.6 mm, nöqtə yazıları 1.5 mm. Boru yazıları adı, diametri və meyli; quyu yazıları adı və lyuk kənarını göstərir. Ekranda miqyasını dəyişdikdə ölçüləri eyni qalır. DXF-də onlar ixrac mesajında göstərilən miqyas üçün tənzimlənir; bax: [Planı DXF-ə ixrac etmək](topic:dxf-export).

## Heç bir qatda göstərilməyənlər

Hündürlük zonaları yalnız ekranda, xətlərin altında çəkilir. Profil görünüşü plana daxil deyil.
